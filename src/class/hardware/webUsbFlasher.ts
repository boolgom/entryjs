import { stringToUint8Array } from '../../util/hardwareUtils';

const filters = [
    {
        vendorId: 3368,
        productId: 516,
        classCode: 255,
        subclassCode: 3,
    },
    {
        vendorId: 3368,
        productId: 516,
        classCode: 255,
        subclassCode: 0,
    },
];

export default class WebUsbFlasher {
    private device: USBDevice;
    private isTransfer: boolean;
    private claimInterface: number;
    private endpointNumber: number;
    private flashingPercent: number;

    private flashState: string;
    constructor() {
        this.isTransfer = false;
        this.claimInterface = -1;
        this.endpointNumber = -1;
    }

    // INFO: 연결된 기기에 파라미터로 넘어온 펌웨어를 플래싱
    // TODO: 현재 유일한 지원기종인 microbitble에 맞춰져있음, 추후 지원기기가 늘어나면 로직수정 필요
    async flashFirmware(firmwareUrl: string, moduleId: string) {
        try {
            if (!this.device) {
                throw Error('device undefined');
            }
            const response = await fetch(firmwareUrl);
            const hexData = await response.text();
            const data = stringToUint8Array(hexData);

            this.flashState = 'start';

            let chunkSize = 62;
            let offset = 0;
            let sentPages = 0;

            this.flashState = 'flashing';
            while (offset < data.length) {
                const end = Math.min(data.length, offset + chunkSize);
                const nextPageData = data.slice(offset, end);
                const cmdData = new Uint8Array(2 + nextPageData.length);
                cmdData[0] = 0x8c;
                cmdData[1] = nextPageData.length;
                cmdData.set(nextPageData, 2);
                // TODO: 퍼센트 로직도 분리
                if (sentPages % 128 == 0) {
                    this.flashingPercent = (offset / data.length) * 100;
                    console.log(this.flashingPercent);
                }
                await this.writeBuffer(cmdData);
                sentPages++;
                offset = end;
            }
            this.flashingPercent = (offset / data.length) * 100;
            console.log(this.flashingPercent);
            this.flashState = 'end';

            // INFO: close
            const flashResult = await this.writeData([0x8b]);
            if (flashResult[1] !== 0) {
                throw Error('flash failed');
            }

            // INFO: reset
            await this.writeData([0x89]);
        } finally {
            this.flashState = 'idle';
        }
    }

    // INFO: 펌웨어 플래시전 webUsb로 기기와 브라우저를 연결
    async connectUsb() {
        // TODO: 지원기기가 늘어나면 vendorId 변수값으로 변경
        this.device = await navigator.usb.requestDevice({
            filters: [{ vendorId: 0x0d28 }],
        });
        await this.device.open();
        await this.device.selectConfiguration(1);
        this.findInterface();
        await this.device.claimInterface(this.claimInterface);
        const result = await this.writeData([0x8a, 1]);
        if (result[1] !== 0) {
            throw Error('device open failed');
        }
    }

    findInterface() {
        const filteredInterfaces = this.device.configurations[0].interfaces.filter(
            (interfaceItem) => {
                const alternateInterface = interfaceItem.alternates[0];

                for (const filter of filters) {
                    if (
                        (filter.classCode === null ||
                            alternateInterface.interfaceClass === filter.classCode) &&
                        !(
                            filter.subclassCode !== null &&
                            alternateInterface.interfaceSubclass !== filter.subclassCode
                        )
                    ) {
                        if (alternateInterface.endpoints.length === 0) {
                            return true;
                        }
                        if (
                            alternateInterface.endpoints.length === 2 &&
                            alternateInterface.endpoints.every(
                                (endpoint) => endpoint.packetSize === 64
                            )
                        ) {
                            return true;
                        }
                    }
                }

                return false;
            }
        );

        const iface = filteredInterfaces[filteredInterfaces.length - 1];
        const altIface = iface.alternates[0];
        if (altIface.endpoints.length) {
            // study: endpoints 역할
            this.isTransfer = true;
            const epIn = altIface.endpoints.filter((e) => 'in' == e.direction)[0];
            this.endpointNumber = epIn.endpointNumber;
        }
        this.claimInterface = iface.interfaceNumber;
    }

    async transfer(data: Uint8Array) {
        if (this.isTransfer) {
            await this.device.transferOut(this.endpointNumber, new Uint8Array(data));
            return await this.device.transferIn(this.endpointNumber, 64);
        } else {
            await this.device.controlTransferOut(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: 9,
                    value: 512,
                    index: this.claimInterface,
                },
                data
            );

            return await this.device.controlTransferIn(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: 1,
                    value: 256,
                    index: this.claimInterface,
                },
                64
            );
        }
    }

    // TODO: buffer랑 합치기
    async writeData(data: Array<number>): Promise<Uint8Array> {
        const response = await this.transfer(new Uint8Array(data));
        if (!response.data?.buffer) {
            throw Error('writeData failed');
        }
        return new Uint8Array(response.data.buffer);
    }

    async writeBuffer(buffer: Uint8Array): Promise<Uint8Array> {
        const response = await this.transfer(buffer);
        if (!response.data?.buffer) {
            throw Error('writeData failed');
        }
        return new Uint8Array(response.data.buffer);
    }
}
