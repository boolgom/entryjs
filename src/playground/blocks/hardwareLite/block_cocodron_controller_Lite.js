//cocodron_Entrylite_wing1008
'use strict';

import _range from 'lodash/range';

(function () {
    Entry.cocodroncontrollerLite = new (class cocodroncontrollerLite {
        constructor() {
            this.id = '680101';
            this.name = 'cocodroncontrollerLite';
            this.url = 'http://www.cocodrone.co.kr/kr/';
            this.imageName = 'cocodroncontrollerLite.png';
            this.title = {
                ko: '코코드론조종기기',
                en: 'cocodron controller',
            };
            this.duration = 32;
            this.blockMenuBlocks = [
                'Cocodron_Dron_Controller_connect',
                //'Cocodron_Dron_Controller_hovering',
                'Cocodron_Dron_Controller_mode',
                'Cocodron_Dron_Controller_opt',
                'Cocodron_Dron_Controller_gyroreset',
                'Cocodron_Dron_Controller_takeoff',
                //'Cocodron_Dron_Controller_takeoffV2',
                'Cocodron_Dron_Controller_land',
                'Cocodron_Dron_Controller_emergency',
                //'Cocodron_Dron_Controller_headless',
                'Cocodron_Dron_Controller_up',
                'Cocodron_Dron_Controller_down',
                'Cocodron_Dron_Controller_cw',
                'Cocodron_Dron_Controller_ccw',
                'Cocodron_Dron_Controller_move_drone_forward',
                'Cocodron_Dron_Controller_move_drone_back',
                'Cocodron_Dron_Controller_move_drone_left',
                'Cocodron_Dron_Controller_move_drone_right',
                'Cocodron_Dron_Controller_funled',
                'Cocodron_Dron_Controller_flip',
                'Cocodron_Dron_Controller_speed',
                //'Cocodron_Dron_Controller_simultaneousOperations'
            ];
            this.portData = {
                baudRate: 9600,
                duration: 32,
                dataBits: 8,
                parity: 'none',
                stopBits: 1,
                bufferSize: 512,
                constantServing: false,
            };
            this.readablePorts = [];
            this.remainValue = null;
            this.setZero();
        }

        setZero() {
            this.port = new Array(14).fill(0);
            this.digitalValue = new Array(14).fill(0);
            this.remoteDigitalValue = new Array(14).fill(0);
            this.analogValue = new Array(6).fill(0);
            this.readablePorts = _range(0, 19);

            if (Entry.hwLite && Entry.hwLite.serial) {
                Entry.hwLite.serial.update();
            }
        }

        handleLocalData(data) {
            for (let i = 0; i < 32; i++) {
                let chunk;
                if (!this.remainValue) {
                    chunk = data[i];
                } else {
                    chunk = this.remainValue;
                    i--;
                }

                if (chunk === SOME_EXPECTED_RESPONSE) {
                    console.log('Takeoff command acknowledged by drone.');
                } else {
                    console.log('Unexpected response from drone:', chunk);
                }

                if (chunk >> 7) {
                    if ((chunk >> 6) & 1) {
                        const nextChunk = data[i + 1];
                        if (!nextChunk && nextChunk !== 0) {
                            this.remainValue = chunk;
                        } else {
                            this.remainValue = null;

                            const port = (chunk >> 3) & 7;
                            this.analogValue[port] = ((chunk & 7) << 7) + (nextChunk & 127);
                        }
                        i++;
                    } else {
                        const port = (chunk >> 2) & 15;
                        this.digitalValue[port] = chunk & 1;
                    }
                }
            }
        }

        requestLocalData() {
            const queryString = [];
            const readablePorts = this.readablePorts;

            const commandStr = Entry.hw.sendQueue['COMMAND'];
            if (commandStr) {
                for (let i = 0; i < commandStr.length; i++) {
                    queryString.push(commandStr.charCodeAt(i));
                }
                delete Entry.hw.sendQueue['COMMAND'];
            }

            if (readablePorts) {
                for (const i in readablePorts) {
                    const query = (5 << 5) + (readablePorts[i] << 1);
                    queryString.push(query);
                }
            }
            const readablePortsValues = (readablePorts && Object.values(readablePorts)) || [];
            for (let port = 0; port < 14; port++) {
                if (readablePortsValues.indexOf(port) > -1) {
                    continue;
                }
                const value = this.remoteDigitalValue[port];
                if (value === 255 || value === 0) {
                    const query = (7 << 5) + (port << 1) + (value == 255 ? 1 : 0);
                    queryString.push(query);
                } else if (value > 0 && value < 255) {
                    let query = (6 << 5) + (port << 1) + (value >> 7);
                    queryString.push(query);
                    query = value & 127;
                    queryString.push(query);
                }
            }
            return queryString;
        }

        addReadablePort(port) {
            const idx = Entry.ArduinoLite.readablePorts.indexOf(port);
            if (idx === -1) {
                Entry.ArduinoLite.readablePorts.push(port);
            }
        }

        removeReadablePort(port) {
            const idx = Entry.ArduinoLite.readablePorts.indexOf(port);
            if (idx >= 0) {
                Entry.ArduinoLite.readablePorts.splice(idx, 1);
            }
        }

        setLanguage() {
            return {
                ko: {
                    Blocks: {
                        Cocodron_Dron_Controller_mode_drone: '드론  ',
                        Cocodron_Dron_Controller_mode_rccar: 'RC카  ',
                        // Cocodron_Dron_Controller_altitude_up: '위쪽  ',
                        // Cocodron_Dron_Controller_altitude_down: '아래쪽  ',
                        // Cocodron_Dron_Controller_rotation_cw: '우회전  ',
                        // Cocodron_Dron_Controller_rotation_ccw: '좌회전  ',
                        // Cocodron_Dron_Controller_move_drone_left:'왼쪽  ',
                        // Cocodron_Dron_Controller_move_drone_right:'오른쪽  ',
                        // Cocodron_Dron_Controller_move_drone_forward:'앞쪽  ',
                        // Cocodron_Dron_Controller_move_drone_back:'뒤쪽  ',
                        Cocodron_Dron_Controller_flip_f: '앞으로  ',
                        Cocodron_Dron_Controller_flip_b: '뒤로  ',
                        Cocodron_Dron_Controller_flip_l: '왼쪽으로로  ',
                        Cocodron_Dron_Controller_flip_r: '오른쪽으로  ',
                        Cocodron_Dron_Controller_simultaneousOperations_up: '상승  ',
                        Cocodron_Dron_Controller_simultaneousOperations_down: '하강  ',
                        Cocodron_Dron_Controller_simultaneousOperations_cw: '시계  ',
                        Cocodron_Dron_Controller_simultaneousOperations_ccw: '반시계  ',
                        Cocodron_Dron_Controller_simultaneousOperations_forward: '앞쪽  ',
                        Cocodron_Dron_Controller_simultaneousOperations_back: '뒤쪽  ',
                        Cocodron_Dron_Controller_simultaneousOperations_right: '오른쪽  ',
                        Cocodron_Dron_Controller_simultaneousOperations_left: '왼쪽  ',
                    },
                    template: {
                        Cocodron_Dron_Controller_connect: '바인딩  ',
                        Cocodron_Dron_Controller_hovering: '호버링 %1 초  ',
                        Cocodron_Dron_Controller_mode: '%1 모드  ',
                        Cocodron_Dron_Controller_opt: '광학센서  ',
                        Cocodron_Dron_Controller_gyroreset: '자이로 초기화  ',
                        Cocodron_Dron_Controller_takeoff: '이륙  ',
                        Cocodron_Dron_Controller_takeoffV2: '이륙 %1 %2',
                        Cocodron_Dron_Controller_land: '착륙  ',
                        Cocodron_Dron_Controller_emergency: '비상정지  ',
                        Cocodron_Dron_Controller_headless: '헤드리스 모드  ',
                        //Cocodron_Dron_Controller_move_drone: '%1 조이스틱을 %2 방향으로 %3 만큼 %4 ms 유지  ',
                        Cocodron_Dron_Controller_up: '상승 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_down: '하강 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_cw: '우회전 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_ccw: '좌회전 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_move_drone_forward: '앞으로 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_move_drone_back: '뒤로 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_move_drone_left: '왼쪽으로 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_move_drone_right:
                            '오른쪽으로 %1 만큼 %2 ms 유지  ',
                        Cocodron_Dron_Controller_funled: '4색 LED 색 변경  ',
                        Cocodron_Dron_Controller_flip: '%1 플립  ',
                        Cocodron_Dron_Controller_speed: '속도조정 %1',
                        Cocodron_Dron_Controller_simultaneousOperations:
                            '%1 방향으로 %2 %3 만큼 %4 방향으로 %5 %6 이동  ',
                    },
                    Device: {
                        cocodron_dron_controller: '코코드론드론조종기',
                    },
                    Menus: {
                        cocodron_dron_controller: '코코드론드론조종기',
                    },
                    Helper: {
                        Cocodron_Dron_Controller_connect: '바인딩  ',
                        Cocodron_Dron_Controller_hovering: '호버링 %1 초 ',
                        Cocodron_Dron_Controller_mode: '드론/rc카 모드변경  ',
                        Cocodron_Dron_Controller_opt: '광학센서 on/off  ',
                        Cocodron_Dron_Controller_gyroreset: '자이로 초기화  ',
                        Cocodron_Dron_Controller_takeoff: '이륙  ',
                        Cocodron_Dron_Controller_takeoffV2: '이륙 %1 %2 고도설정',
                        Cocodron_Dron_Controller_land: '착륙  ',
                        Cocodron_Dron_Controller_emergency: '비상정지  ',
                        Cocodron_Dron_Controller_headless: '헤드리스 모드  ',
                        //Cocodron_Dron_Controller_move_drone: '%1 조이스틱을 %2 방향으로 %3 만큼 %4 ms 유지  ',
                        Cocodron_Dron_Controller_up:
                            '상승 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_down:
                            '하강 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_cw:
                            '우회전 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_ccw:
                            '좌회전 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_move_drone_forward:
                            '앞으로 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_move_drone_back:
                            '뒤로 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_move_drone_left:
                            '왼쪽으로 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_move_drone_right:
                            '오른쪽으로 조종기레버를 %1만큼 이동시켜 %2ms동안 유지하여 드론이 이동  ',
                        Cocodron_Dron_Controller_funled: '4색 변경  ',
                        Cocodron_Dron_Controller_flip: '플립  ',
                        Cocodron_Dron_Controller_speed: '속도조정 ',
                        Cocodron_Dron_Controller_simultaneousOperations: '동시비행  ',
                    },
                },
                en: {
                    template: {
                        Cocodron_Dron_Controller_connect: 'Binding',
                        Cocodron_Dron_Controller_hovering: 'Hovering for %1 seconds',
                        Cocodron_Dron_Controller_mode: '%1 Mode',
                        Cocodron_Dron_Controller_opt: 'Optical Sensor',
                        Cocodron_Dron_Controller_gyroreset: 'Gyro Reset',
                        Cocodron_Dron_Controller_takeoff: 'Take Off',
                        Cocodron_Dron_Controller_takeoffV2: 'Take Off %1 %2',
                        Cocodron_Dron_Controller_land: 'Landing',
                        Cocodron_Dron_Controller_emergency: 'Emergency Stop',
                        Cocodron_Dron_Controller_headless: 'Headless Mode',
                        //Cocodron_Dron_Controller_move_drone: 'Move joystick %1 in %2 direction by %3 for %4 ms',
                        Cocodron_Dron_Controller_up: 'Ascend by %1 for %2 ms',
                        Cocodron_Dron_Controller_down: 'Descend by %1 for %2 ms',
                        Cocodron_Dron_Controller_cw: 'Rotate Clockwise by %1 for %2 ms',
                        Cocodron_Dron_Controller_ccw: 'Rotate Counterclockwise by %1 for %2 ms',
                        Cocodron_Dron_Controller_move_drone_forward: 'Move Forward by %1 for %2 ms',
                        Cocodron_Dron_Controller_move_drone_back: 'Move Backward by %1 for %2 ms',
                        Cocodron_Dron_Controller_move_drone_left: 'Move Left by %1 for %2 ms',
                        Cocodron_Dron_Controller_move_drone_right: 'Move Right by %1 for %2 ms',
                        Cocodron_Dron_Controller_funled: 'Change 4-Color LED',
                        Cocodron_Dron_Controller_flip: '%1 Flip',
                        Cocodron_Dron_Controller_speed: 'Adjust Speed %1',
                        Cocodron_Dron_Controller_simultaneousOperations:
                            'Move %1 in %2 %3 while moving %4 in %5 %6',
                    },
                    Device: {
                        cocodron_dron_controller: 'cocodrondroncontroller',
                    },
                    Menus: {
                        cocodron_dron_controller: 'CocodronDronController',
                    },
                },
            };
        }

        initializeBlocks() {
            Entry.hwLite
                .connect()
                .then(() => {
                    if (!Entry.hwLite.serial) {
                        console.error('Serial object is not defined. Please check the connection.');
                        return;
                    }

                    Entry.getMainGenerator().getBlocks = this.getBlocks.bind(this);

                    Entry.addEventListener('blockCompleted', () => {
                        Entry.getMainGenerator().nextBlock();
                    });
                })
                .catch((error) => {
                    console.error('Failed to connect to hardware:', error);
                });
        }

        getBlocks() {
            return {
                Cocodron_Dron_Controller_connect: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    params: [],
                    def: { params: [], type: 'Cocodron_Dron_Controller_connect' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'mapping_start';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_hovering: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [{ type: 'Block', accept: 'string' }],
                    def: {
                        params: [null],
                        type: 'Cocodron_Dron_Controller_hovering',
                    },
                    paramsKeyMap: {
                        TIME: 0,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const time = script.getField('TIME') * 1000;

                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(script.callReturn());
                            }, time);
                        });
                    },
                },
                Cocodron_Dron_Controller_mode: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.Cocodron_Dron_Controller_mode_drone, 'drone'],
                                [Lang.Blocks.Cocodron_Dron_Controller_mode_rccar, 'rccar'],
                            ],
                            value: 'drone',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    def: {
                        params: [null],
                        type: 'Cocodron_Dron_Controller_mode',
                    },
                    paramsKeyMap: {
                        DIRECTION: 0,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const direction = script.getField('DIRECTION');
                        const command = `${direction}\r`;
                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_opt: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    params: [],
                    def: { params: [], type: 'Cocodron_Dron_Controller_opt' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'opt';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_gyroreset: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    params: [],
                    def: { params: [], type: 'Cocodron_Dron_Controller_gyroreset' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'gyroreset';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_takeoff: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    params: [],
                    def: { params: [], type: 'Cocodron_Dron_Controller_takeoff' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'takeoff';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        console.log(`Sending command: ${command}`);

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);

                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 4000);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_takeoffV2: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_takeoffV2',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'takeoff';
                        let stick = script.getNumberValue('STICK', script);
                        let time = script.getNumberValue('TIME', script);
                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 20) {
                            stick = 20;
                        } else if (stick < 0) {
                            stick = 0;
                        }

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            const firstCommand = `takeoff\r`;
                            const secondCommand = `up ${stick} ${time}\r`;

                            return new Promise((resolve) => {
                                Entry.hwLite.serial.sendAsyncWithThrottle(
                                    Buffer.from(firstCommand, 'utf8'),
                                    false
                                );
                                console.log('firstCommand:', firstCommand);
                                setTimeout(() => {
                                    Entry.hwLite.serial.sendAsyncWithThrottle(
                                        Buffer.from(secondCommand, 'utf8'),
                                        false
                                    );
                                    console.log('secondCommand:', secondCommand);
                                    resolve(script.callReturn());
                                }, 4000);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_land: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [],
                    def: { params: [], type: 'Cocodron_Dron_Controller_land' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'land';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        console.log(`Sending command: ${command}`);

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_emergency: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [],
                    def: { params: [], type: 'Cocodron_Dron_Controller_emergency' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'emergency';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_headless: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [],
                    def: { params: [null], type: 'Cocodron_Dron_Controller_headless' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'headless';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_up: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_up',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }

                        const command = `up ${stick} ${time}\r`;
                        console.log('Constructed command:', command);

                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_down: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_down',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }

                        const command = `down ${stick} ${time}\r`;
                        console.log('Constructed command:', command);

                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                //드론 회전블럭 레버값 및 시간 입력코드
                Cocodron_Dron_Controller_cw: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_cw',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }

                        const command = `cw ${stick} ${time}\r`;
                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_ccw: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_ccw',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }

                        const command = `ccw ${stick} ${time}\r`;
                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_move_drone_forward: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_move_drone_forward',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }
                        const command = `forward ${stick} ${time}\r`;
                        console.log('Constructed command:', command);

                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_move_drone_back: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_move_drone_back',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }
                        const command = `back ${stick} ${time}\r`;
                        console.log('Constructed command:', command);

                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_move_drone_left: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_move_drone_left',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }

                        const command = `left ${stick} ${time}\r`;
                        console.log('Constructed command:', command);

                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
                Cocodron_Dron_Controller_move_drone_right: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [null, null],
                        type: 'Cocodron_Dron_Controller_move_drone_right',
                    },
                    paramsKeyMap: {
                        STICK: 0,
                        TIME: 1,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        let stick = script.getNumberValue('STICK', script) * 10;
                        let time = script.getNumberValue('TIME', script);

                        if (stick > 500) {
                            stick = 500;
                        } else if (stick < 0) {
                            stick = 0;
                        }

                        const command = `right ${stick} ${time}\r`;
                        console.log('Constructed command:', command);

                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, time + 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_funled: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [],
                    def: { params: [], type: 'Cocodron_Dron_Controller_funled' },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const command = 'funled';
                        const commandBuffer = Buffer.from(
                            encodeURIComponent(command) + '\r',
                            'utf8'
                        );
                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_flip: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.Cocodron_Dron_Controller_flip_f, 'f'],
                                [Lang.Blocks.Cocodron_Dron_Controller_flip_b, 'b'],
                                [Lang.Blocks.Cocodron_Dron_Controller_flip_l, 'l'],
                                [Lang.Blocks.Cocodron_Dron_Controller_flip_r, 'r'],
                            ],
                            value: 'f',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    def: {
                        params: [null],
                        type: 'Cocodron_Dron_Controller_flip',
                    },
                    paramsKeyMap: {
                        DIRECTION: 0,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const direction = script.getField('DIRECTION');
                        const command = `flip ${direction}\r`;
                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                Cocodron_Dron_Controller_speed: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                ['1', '1'],
                                ['2', '2'],
                                ['3', '3'],
                            ],
                            value: '1',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    def: {
                        params: [null],
                        type: 'Cocodron_Dron_Controller_speed',
                    },
                    paramsKeyMap: {
                        DIRECTION: 0,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const direction = script.getField('DIRECTION');
                        const command = `speed ${direction}\r`;
                        const commandBuffer = Buffer.from(command, 'utf8');

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            Entry.hwLite.serial.sendAsyncWithThrottle(commandBuffer, false);
                            console.log('Command sent using sendAsyncWithThrottle:', command);
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(script.callReturn());
                                }, 1100);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },

                //드론 원주비행(동시동작) 블록 코드, 코드개발 필요, 좌우레버 동시명령어 실행으로 원주비행_동시명령어 실행간격0.5초대기 필요
                Cocodron_Dron_Controller_simultaneousOperations: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    fontColor: '#fff',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [
                                    Lang.Blocks.Cocodron_Dron_Controller_simultaneousOperations_cw,
                                    'cw',
                                ],
                                [
                                    Lang.Blocks.Cocodron_Dron_Controller_simultaneousOperations_ccw,
                                    'ccw',
                                ],
                                [
                                    Lang.Blocks.Cocodron_Dron_Controller_simultaneousOperations_up,
                                    'up',
                                ],
                                [
                                    Lang.Blocks
                                        .Cocodron_Dron_Controller_simultaneousOperations_down,
                                    'down',
                                ],
                            ],
                            value: 'cw',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                        {
                            type: 'Dropdown',
                            options: [
                                [
                                    Lang.Blocks
                                        .Cocodron_Dron_Controller_simultaneousOperations_forward,
                                    'forward',
                                ],
                                [
                                    Lang.Blocks
                                        .Cocodron_Dron_Controller_simultaneousOperations_back,
                                    'back',
                                ],
                                [
                                    Lang.Blocks
                                        .Cocodron_Dron_Controller_simultaneousOperations_left,
                                    'left',
                                ],
                                [
                                    Lang.Blocks
                                        .Cocodron_Dron_Controller_simultaneousOperations_right,
                                    'right',
                                ],
                            ],
                            value: 'forward',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        { type: 'Block', accept: 'string' },
                        { type: 'Block', accept: 'string' },
                    ],
                    def: {
                        params: [
                            [null, null, null],
                            [null, null, null],
                        ],
                        type: 'Cocodron_Dron_Controller_simultaneousOperations',
                    },
                    paramsKeyMap: {
                        DIRECTION: 0,
                        VALUE: 1,
                        TIME: 1,
                        TURN_DIRECTION: 3,
                        TURN_VALUE: 4,
                        TURN_TIME: 5,
                    },
                    class: 'cocodron',
                    isNotFor: ['cocodroncontrollerLite'],
                    func(sprite, script) {
                        const direction = script.getField('DIRECTION');
                        const value = parseInt(script.getNumberValue('VALUE', script));
                        const time = parseInt(script.getNumberValue('TIME', script)); // ms
                        const turnDirection = script.getField('TURN_DIRECTION');
                        const turnValue = parseInt(script.getNumberValue('TURN_VALUE', script));
                        const turnTime = parseInt(script.getNumberValue('TURN_TIME', script)); // ms

                        if (Entry.hwLite && Entry.hwLite.serial && Entry.hwLite.serial.writer) {
                            const firstCommand = `${direction} ${value} ${time}\r`;
                            const secondCommand = `${turnDirection} ${turnValue} ${turnTime}\r`;

                            return new Promise((resolve) => {
                                // 첫 번째 명령 전송
                                Entry.hwLite.serial.sendAsyncWithThrottle(
                                    Buffer.from(firstCommand, 'utf8'),
                                    false
                                );
                                console.log('First command sent:', firstCommand);

                                // 지정된 time 만큼 기다린 뒤 + 0.5초 후 두 번째 명령 전송
                                setTimeout(() => {
                                    Entry.hwLite.serial.sendAsyncWithThrottle(
                                        Buffer.from(secondCommand, 'utf8'),
                                        false
                                    );
                                    console.log('Second command sent:', secondCommand);

                                    // 두 번째 명령 실행도 끝난 뒤 스크립트 종료
                                    setTimeout(() => {
                                        resolve(script.callReturn());
                                    }, turnTime);
                                }, 500);
                            });
                        } else {
                            console.log('Serial writer not found.');
                        }
                        return script.callReturn();
                    },
                },
            };
        }
    })();
})();

module.exports = Entry.cocodroncontrollerLite;
