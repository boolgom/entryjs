import { EntryHWLiteBaseModule, HWLiteStatus } from '../../types/index';
import ExtraBlockUtils from '../util/extrablockUtils';
import HardwareMonitor from './hardware/hardwareMonitor';
import WebUsbFlasher from './hardware/webUsbFlasher';
import WebSerialConnector from './hardware/webSerialConnector';
import WebApiConnector from './hardware/webApiConnector';
import WebBluetoothConnector from './hardware/webBluetoothConnector';

const ARDUINO_BOARD_IDS: string[] = ['010101', '040201', '080101'];

export default class HardwareLite {
    private status: HWLiteStatus;
    private webConnector: WebApiConnector;
    private serial: WebSerialConnector;
    private bluetooth: WebBluetoothConnector;
    private flasher: WebUsbFlasher;
    hwModule: EntryHWLiteBaseModule;
    static setExternalModule: any;
    static refreshHardwareLiteBlockMenu: any;
    static banClassAllHardwareLite: any;
    static isHwLiteSupportAgent: any;
    private playground: any;
    private hwMonitor?: HardwareMonitor;
    static getStatus: any;

    constructor(playground: any) {
        this.playground = playground;
        this.hwModule = null;
        this.status = 'disconnected';
        Entry.addEventListener('hwLiteChanged', this.refreshHardwareLiteBlockMenu.bind(this));
        this.setExternalModule.bind(this);
    }

    setZero() {
        this.hwModule?.setZero();
    }

    isActive(name: string) {
        if (this.hwModule) {
            const data = {};
            // @ts-ignore
            data[name] = this.hwModule;
            return ExtraBlockUtils.isActive(name, data);
        }
        return false;
    }
    /**
     * 모든 하드웨어를 숨김처리한다. 현재 연결된 하드웨어도 예외는 없다.
     * @private
     */
    banClassAllHardwareLite() {
        const workspace = Entry.getMainWS();
        const blockMenu = workspace && workspace.blockMenu;
        if (!blockMenu) {
            return;
        }
        Object.values(Entry.HARDWARE_LITE_LIST || {}).forEach((hardware: any) => {
            blockMenu.banClass(hardware.name, true);
        });
        ExtraBlockUtils.banAllBlocks(this.playground, Entry.HARDWARE_LITE_LIST);
        blockMenu.reDraw();
    }

    setExternalModule(moduleObject: EntryHWLiteBaseModule) {
        this.hwModule = moduleObject;
        this.banClassAllHardwareLite();
        Entry.block.changeBlockText('hardware_device_name_content', this.hwModule.title.ko);
        Entry.dispatchEvent('hwLiteChanged');
        this.setWebConnector();
        this.setFlasher();
        if (Entry.propertyPanel && this.hwModule.monitorTemplate) {
            this._setHardwareMonitorTemplate();
        }
    }

    getConnectFailedMenu() {
        this.status = 'connectFailed';
        this.refreshHardwareLiteBlockMenu();
    }

    setFirmwareDownloadButton(callback: Function) {
        const workspace = Entry.getMainWS();
        const blockMenu = workspace && workspace.blockMenu;
        if (!blockMenu) {
            return;
        }
        Entry.block.changeBlockEvent('arduino_lite_download_firmware', 'mousedown', async () => {
            await callback();
        });
        blockMenu.changeTypeThreadByBlockKey('arduino_lite_download_firmware');
    }

    private _setHardwareMonitorTemplate() {
        if (!this.hwMonitor) {
            this.hwMonitor = new HardwareMonitor(this.hwModule);
        } else {
            this.hwMonitor.setHwModule(this.hwModule);
            this.hwMonitor.initView();
        }
        Entry.propertyPanel.addMode('hw', this.hwMonitor);
        this.hwMonitor.generateViewByMode();
    }

    _updatePortData() {
        if (this.hwMonitor && Entry.propertyPanel && Entry.propertyPanel.selected === 'hw') {
            this.hwMonitor.update(this.hwModule.getMonitorPort(), null);
        }
    }

    isHwLiteSupportAgent() {
        const userAgentString = navigator.userAgent.toLowerCase();

        // INFO: 디바이스가 모바일이거나 일렉트론이면 1차적으로 제외
        if (userAgentString.includes('mobile') || userAgentString.includes('electron')) {
            return false;
        } else if (
            userAgentString.includes('whale') ||
            userAgentString.includes('edge') ||
            userAgentString.includes('chrome')
        ) {
            return true;
        } else {
            return false;
        }
    }

    refreshHardwareLiteBlockMenu() {
        const blockMenu = Entry.getMainWS()?.blockMenu;
        if (!blockMenu) {
            return;
        }

        switch (this.status) {
            case 'disconnected': {
                blockMenu.banClass('arduinoLiteConnected', true);
                blockMenu.banClass('arduinoLiteConnectFailed', true);
                blockMenu.banClass('arduinoLiteGuide', true);
                blockMenu.unbanClass('arduinoLiteDisconnected', true);
                blockMenu.unbanClass('arduinoDisconnected', true);
                this.isHwLiteSupportAgent()
                    ? blockMenu.unbanClass('arduinoLiteSupported', true)
                    : blockMenu.banClass('arduinoLiteSupported', true);
                this.banClassAllHardwareLite();
                break;
            }
            case 'connected':
                blockMenu.banClass('arduinoLiteConnectFailed', true);
                blockMenu.banClass('arduinoLiteDisconnected', true);
                blockMenu.banClass('arduinoDisconnected', true);
                blockMenu.banClass('arduinoLiteSupported', true);
                blockMenu.banClass('arduinoLiteGuide', true);
                blockMenu.unbanClass('arduinoLiteConnected', true);
                blockMenu.unbanClass(this.hwModule?.name, true);
                break;
            case 'connectFailed':
                blockMenu.banClass('arduinoLiteDisconnected', true);
                blockMenu.banClass('arduinoLiteConnected', true);
                blockMenu.banClass('arduinoDisconnected', true);
                blockMenu.banClass('arduinoLiteSupported', true);
                blockMenu.unbanClass('arduinoLiteConnectFailed', true);
                if (typeof this.hwModule?.id === 'string') {
                    if (ARDUINO_BOARD_IDS.includes(this.hwModule.id)) {
                        blockMenu.unbanClass('arduinoLiteGuide', true);
                    }
                }
                // else if (this.hwModule?.id instanceof Array) {
                //     for (const id in this.hwModule.id) {
                //         if (ARDUINO_BOARD_IDS.includes(this.hwModule.id[id])) {
                //             blockMenu.unbanClass('arduinoLiteGuide', true);
                //             break;
                //         }
                //     }
                // }
                this.banClassAllHardwareLite();
                break;
        }
        blockMenu.hwCodeOutdated = true;
        blockMenu._generateHwCode(true);
        blockMenu.reDraw();
    }

    async connect() {
        if (this.status === 'connected') {
            return;
        }
        try {
            await this.webConnector.connect();
            this.setStatus('connected');
            this.refreshHardwareLiteBlockMenu();
            await this.webConnector.initialDevice();
            Entry.toast.success(
                Lang.Msgs.hw_connection_success,
                Lang.Msgs.hw_connection_success_desc2
            );
        } catch (error) {
            console.error(error);
            Entry.toast.alert(
                Lang.Msgs.hw_connection_failed_title,
                Lang.Msgs.hw_connection_failed_desc,
                false
            );
            this.getConnectFailedMenu();
        }
    }

    async disconnect() {
        try {
            Entry.hardwareLiteBlocks = [];
            this.status = 'willDisconnect';
            await this.webConnector?.disconnect();
        } catch (err) {
            console.error(err);
        } finally {
            this.hwModule = null;
            this.status = 'disconnected';
            this.removeWebConnector();
            this.removeFlasher();
            Entry.dispatchEvent('hwLiteChanged');
            Entry.toast.alert(
                Lang.Msgs.hw_connection_termination_title,
                Lang.Msgs.hw_connection_termination_desc,
                false
            );
        }
    }

    addHardwareLiteModule(module: EntryHWLiteBaseModule) {
        Entry.do('objectAddHardwareLiteBlocks', module);
    }
    removeHardwareLiteModule() {
        Entry.do('objectRemoveHardwareLiteBlocks', this.hwModule);
    }

    setWebConnector() {
        const webapiType = this.hwModule.webapiType;

        switch (webapiType) {
            case 'ble': {
                if (!this.hwModule.bluetoothInfo) {
                    console.error('Invalid bluetooth hwModule');
                    this.getConnectFailedMenu();
                    return;
                }
                this.bluetooth = new WebBluetoothConnector(this.hwModule, this);
                this.webConnector = this.bluetooth;
                break;
            }
            case 'serial':
            case undefined: {
                if (!this.hwModule.portData) {
                    console.error('Invalid serial hwModule');
                    this.getConnectFailedMenu();
                    return;
                }
                this.serial = new WebSerialConnector(this.hwModule, this);
                this.webConnector = this.serial;
            }
        }
    }

    removeWebConnector() {
        this.webConnector = undefined;
        this.serial = undefined;
        this.bluetooth = undefined;
    }

    setFlasher() {
        if (this.hwModule.firmwareFlash) {
            this.flasher = new WebUsbFlasher();
        }
    }
    removeFlasher() {
        this.flasher = undefined;
    }

    getStatus() {
        return this.status;
    }
    setStatus(state: HWLiteStatus) {
        this.status = state;
    }
}

Entry.HWLite = HardwareLite;
