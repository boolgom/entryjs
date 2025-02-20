'use strict';

const _set = require('lodash/set');
const _get = require('lodash/get');
const _merge = require('lodash/merge');

Entry.Microbit = new (class Microbit {
    constructor() {
        this.id = '22.1';
        this.url = 'http://microbit.org/ko/';
        this.imageName = 'microbit.png';
        this.title = {
            en: 'Microbit',
            ko: '마이크로비트',
        };
        this.name = 'microbit';
        this.blockIds = {};
        this.isExecBlock = false;
        this.cacheValues = [];
        this.cacheIndex = 0;
        this.radioTime = 0;
    }

    getHashKey() {
        let key = new Date().getSeconds().toString(16);
        if (key.length === 1) {
            key += ((Math.random() * 16) | 0).toString(16);
        }
        return Entry.generateHash() + key;
    }

    setZero() {
        Entry.hw.sendQueue = {
            [this.getHashKey()]: {
                type: 'RST',
            },
        };
        Entry.hw.update();
        this.blockIds = {};
        this.isExecBlock = false;
        this.execTimeFlag = false;
        this.radioTime = 0;
    }

    sendMessage({ socket, sendQueue = {} }) {
        if (!_.isEmpty(sendQueue)) {
            const keys = Object.keys(sendQueue);
            const uniqueKey = this.getHashKey();
            socket.emit(
                'message',
                {
                    data: JSON.stringify(sendQueue),
                    mode: socket.mode,
                    type: 'utf8',
                    key: uniqueKey,
                },
                (data) => {
                    if (data === uniqueKey) {
                        keys.forEach((key) => {
                            delete sendQueue[key];
                        });
                    }
                }
            );
        }
    }

    asyncFlowControl({ script, data }, scope) {
        if (!this.isExecBlock && !scope.isStart) {
            const blockId = this.getHashKey();
            this.isExecBlock = true;
            scope.isStart = true;
            scope.timeFlag = 1;
            this.nowBlockId = blockId;
            this.blockIds[blockId] = false;
            _merge(Entry.hw.sendQueue, {
                [blockId]: data,
            });
            Entry.hw.update();
            setTimeout(() => {
                scope.timeFlag = 0;
            });
            return false;
        } else if (this.blockIds[this.nowBlockId] && scope.timeFlag === 0) {
            delete this.blockIds[this.nowBlockId];
            delete scope.isStart;
            this.execTimeFlag = 0;
            this.execTimeFlag = undefined;
            this.isExecBlock = false;
            Entry.engine.isContinue = false;
            return true;
        }
        return false;
    }

    postCallReturn(args) {
        const { script } = args;
        if (!this.asyncFlowControl(args, script)) {
            return Entry.STATIC.BREAK;
        }
    }

    checkValue(args) {
        const { script, key } = args;
        const { entity, executor } = script;
        const { scope } = executor;
        const { cacheValue = {} } = scope;
        const value = _get(cacheValue, key);
        if (value) {
            return value;
        } else if (!this.asyncFlowControl(args, scope)) {
            throw new Entry.Utils.AsyncError();
        }
    }

    afterSend(data) {
        // Object.assign(data, {
        //     OUTPUT: {},
        // });
    }

    afterReceive({ blockId = '', RADIO }) {
        if (blockId in this.blockIds) {
            this.blockIds[blockId] = true;
        } else if (RADIO && Entry.engine.isState('run') && RADIO.time > this.radioTime) {
            this.radioTime = RADIO.time;
            Entry.engine.fireEvent('MicrobitRadioReceive');
        }
    }
})();
Entry.Microbit.blockMenuBlocks = [
    //region microbit
    'microbit_led_toggle',
    'microbit_get_led',
    'microbit_show_string',
    'microbit_show_image',
    'microbit_get_analog',
    'microbit_get_analog_map',
    'microbit_get_digital',
    'microbit_get_button',
    'microbit_get_sensor',
    'microbit_get_accelerometer',
    'microbit_play_note',
    'microbit_change_bpm',
    'microbit_set_bpm',
    // "microbit_radio_receive_event",
    //endregion microbit
];
Entry.Microbit.getBlocks = function() {
    return {
        microbit_led_toggle: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            template: 'LED의 X:%1 Y:%2 %3 %4',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['켜기', 'on'],
                        ['끄기', 'off'],
                        ['반전', 'toggle'],
                    ],
                    value: 'on',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            class: 'MicrobitLed',
            isNotFor: ['microbit'],
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    {
                        type: 'text',
                        params: ['0'],
                    },
                ],
                type: 'microbit_led_toggle',
            },
            paramsKeyMap: {
                X: 0,
                Y: 1,
                VALUE: 2,
            },
            func(sprite, script) {
                const value = script.getField('VALUE');
                let x = script.getNumberValue('X');
                let y = script.getNumberValue('Y');
                x = Math.max(0, x);
                x = Math.min(4, x);
                y = Math.max(0, y);
                y = Math.min(4, y);
                const data = {
                    type: 'SET_LED',
                    data: {
                        x,
                        y,
                        value,
                    },
                };
                return Entry.Microbit.postCallReturn({
                    script,
                    data,
                });
            },
        },
        microbit_get_led: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_boolean_field',
            statements: [],
            template: 'LED의 X:%1 Y:%2 상태값',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            class: 'MicrobitLed',
            isNotFor: ['microbit'],
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    {
                        type: 'text',
                        params: ['0'],
                    },
                ],
                type: 'microbit_get_led',
            },
            paramsKeyMap: {
                X: 0,
                Y: 1,
            },
            func(sprite, script) {
                let x = script.getNumberValue('X');
                let y = script.getNumberValue('Y');
                x = Math.max(0, x);
                x = Math.min(4, x);
                y = Math.max(0, y);
                y = Math.min(4, y);
                const data = {
                    type: 'GET_LED',
                    data: {
                        x,
                        y,
                    },
                };
                let returnData = Entry.Microbit.checkValue({
                    script,
                    data,
                    key: `LED.${x}.${y}`,
                });
                if (!returnData) {
                    returnData = _get(Entry.hw.portData, ['LED']);
                    const { executor } = script;
                    const { scope } = executor;
                    if (!scope.cacheValue) {
                        scope.cacheValue = {};
                    }
                    _set(scope.cacheValue, `LED.${x}.${y}`, returnData);
                }
                return returnData;
            },
        },
        microbit_show_string: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            template: '%1 출력하기 %2',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            class: 'MicrobitLed',
            isNotFor: ['microbit'],
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['Hello!'],
                    },
                ],
                type: 'microbit_show_string',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                let value = script.getStringValue('VALUE');
                value = value.replace(
                    /[^A-Za-z0-9_\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\\\{\}\[\]\'\"\;\:\<\,\>\.\?\/\s]/gim,
                    ''
                );
                const data = {
                    type: 'SET_STRING',
                    data: {
                        value,
                    },
                };
                return Entry.Microbit.postCallReturn({
                    script,
                    data,
                });
            },
        },
        microbit_show_image: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            template: '%1 아이콘 출력하기 %2',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['하트', 0],
                        ['행복함', 4],
                        ['삼각형', 32],
                        ['사각형', 37],
                        ['다이아몬드', 35],
                    ],
                    value: 0,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            class: 'MicrobitLed',
            isNotFor: ['microbit'],
            def: {
                type: 'microbit_show_image',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getField('VALUE');
                const data = {
                    type: 'SET_IMAGE',
                    data: {
                        value,
                    },
                };
                return Entry.Microbit.postCallReturn({
                    script,
                    data,
                });
            },
        },
        microbit_get_analog: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_string_field',
            statements: [],
            template: '아날로그 핀 %1번 센서값',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['P0', 7],
                        ['P1', 8],
                        ['P2', 9],
                    ],
                    value: 7,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            class: 'MicrobitAnalog',
            isNotFor: ['microbit'],
            def: {
                type: 'microbit_get_analog',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getField('VALUE');
                const data = {
                    type: 'GET_ANALOG',
                    data: {
                        value,
                    },
                };
                let returnData = Entry.Microbit.checkValue({
                    script,
                    data,
                    key: `GET_ANALOG.${value}`,
                });
                if (!returnData) {
                    returnData = _get(Entry.hw.portData, ['GET_ANALOG']);
                    const { executor } = script;
                    const { scope } = executor;
                    if (!scope.cacheValue) {
                        scope.cacheValue = {};
                    }
                    _set(scope.cacheValue, `GET_ANALOG.${value}`, returnData);
                }
                return returnData;
            },
        },
        microbit_get_analog_map: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_string_field',
            statements: [],
            template: '아날로그 핀 %1번 센서값의 범위를 %2~%3 에서 %4~%5 (으)로 바꾼값',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['P0', 7],
                        ['P1', 8],
                        ['P2', 9],
                    ],
                    value: 7,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            class: 'MicrobitAnalog',
            isNotFor: ['microbit'],
            def: {
                params: [
                    null,
                    {
                        type: 'number',
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['1023'],
                    },
                    {
                        type: 'number',
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['100'],
                    },
                ],
                type: 'microbit_get_analog_map',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE2: 1,
                VALUE3: 2,
                VALUE4: 3,
                VALUE5: 4,
            },
            func(sprite, script) {
                const value = script.getField('PORT');
                const data = {
                    type: 'GET_ANALOG',
                    data: {
                        value,
                    },
                };
                let returnData = Entry.Microbit.checkValue({
                    script,
                    data,
                    key: `GET_ANALOG.${value}`,
                });
                if (!returnData) {
                    returnData = _get(Entry.hw.portData, ['GET_ANALOG']);
                    const { executor } = script;
                    const { scope } = executor;
                    if (!scope.cacheValue) {
                        scope.cacheValue = {};
                    }
                    _set(scope.cacheValue, `GET_ANALOG.${value}`, returnData);
                }

                let value2 = script.getNumberValue('VALUE2', script);
                let value3 = script.getNumberValue('VALUE3', script);
                let value4 = script.getNumberValue('VALUE4', script);
                let value5 = script.getNumberValue('VALUE5', script);
                const stringValue4 = script.getValue('VALUE4', script);
                const stringValue5 = script.getValue('VALUE5', script);
                let isFloat = false;

                if (
                    (Entry.Utils.isNumber(stringValue4) && stringValue4.indexOf('.') > -1) ||
                    (Entry.Utils.isNumber(stringValue5) && stringValue5.indexOf('.') > -1)
                ) {
                    isFloat = true;
                }

                if (value2 > value3) {
                    var swap = value2;
                    value2 = value3;
                    value3 = swap;
                }
                if (value4 > value5) {
                    var swap = value4;
                    value4 = value5;
                    value5 = swap;
                }
                returnData -= value2;
                returnData = returnData * ((value5 - value4) / (value3 - value2));
                returnData += value4;
                returnData = Math.min(value5, returnData);
                returnData = Math.max(value4, returnData);

                if (isFloat) {
                    returnData = Math.round(returnData * 100) / 100;
                } else {
                    returnData = Math.round(returnData);
                }
                return returnData;
            },
        },
        microbit_get_digital: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_boolean_field',
            statements: [],
            template: '디지털 핀 %1번 센서값',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['P0', 7],
                        ['P1', 8],
                        ['P2', 9],
                    ],
                    value: 7,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            class: 'MicrobitDigital',
            isNotFor: ['microbit'],
            def: {
                type: 'microbit_get_digital',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getField('VALUE');
                const data = {
                    type: 'GET_DIGITAL',
                    data: {
                        value,
                    },
                };
                let returnData = Entry.Microbit.checkValue({
                    script,
                    data,
                    key: `GET_DIGITAL.${value}`,
                });
                if (!returnData) {
                    returnData = _get(Entry.hw.portData, ['GET_DIGITAL']);
                    const { executor } = script;
                    const { scope } = executor;
                    if (!scope.cacheValue) {
                        scope.cacheValue = {};
                    }
                    _set(scope.cacheValue, `GET_DIGITAL.${value}`, returnData);
                }
                return returnData;
            },
        },
        microbit_get_button: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_boolean_field',
            statements: [],
            template: '%1버튼을 눌렀는가?',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['A', 1],
                        ['B', 2],
                    ],
                    value: 1,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            class: 'MicrobitButton',
            isNotFor: ['microbit'],
            def: {
                type: 'microbit_get_button',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getField('VALUE');
                const data = {
                    type: 'GET_BUTTON',
                    data: {
                        value,
                    },
                };
                let returnData = Entry.Microbit.checkValue({
                    script,
                    data,
                    key: `GET_BUTTON.${value}`,
                });
                if (!returnData) {
                    returnData = _get(Entry.hw.portData, ['GET_BUTTON']);
                    const { executor } = script;
                    const { scope } = executor;
                    if (!scope.cacheValue) {
                        scope.cacheValue = {};
                    }
                    _set(scope.cacheValue, `GET_BUTTON.${value}`, returnData);
                }
                return returnData;
            },
        },
        microbit_get_sensor: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1 센서값',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['빛', 'lightLevel'],
                        ['온도', 'temperature'],
                        ['자기', 'compassHeading'],
                    ],
                    value: 'temperature',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            class: 'MicrobitSensor',
            isNotFor: ['microbit'],
            def: {
                type: 'microbit_get_sensor',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getField('VALUE');
                const data = {
                    type: 'GET_SENSOR',
                    data: {
                        value,
                    },
                };
                let returnData = Entry.Microbit.checkValue({
                    script,
                    data,
                    key: `GET_SENSOR.${value}`,
                });
                if (!returnData) {
                    returnData = _get(Entry.hw.portData, ['GET_SENSOR']);
                    const { executor } = script;
                    const { scope } = executor;
                    if (!scope.cacheValue) {
                        scope.cacheValue = {};
                    }
                    _set(scope.cacheValue, `GET_SENSOR.${value}`, returnData);
                }
                return returnData;
            },
        },
        microbit_get_accelerometer: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_string_field',
            statements: [],
            template: '가속도 센서 %1의 값',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['x축', 0],
                        ['y축', 1],
                        ['z축', 2],
                        ['크기', 3],
                    ],
                    value: 'x',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            class: 'MicrobitAccelerometer',
            isNotFor: ['microbit'],
            def: {
                type: 'microbit_get_accelerometer',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getField('VALUE');
                const data = {
                    type: 'GET_ACCELEROMETER',
                    data: {
                        value,
                    },
                };
                let returnData = Entry.Microbit.checkValue({
                    script,
                    data,
                    key: `GET_ACCELEROMETER.${value}`,
                });
                if (!returnData) {
                    returnData = _get(Entry.hw.portData, ['GET_ACCELEROMETER']);
                    const { executor } = script;
                    const { scope } = executor;
                    if (!scope.cacheValue) {
                        scope.cacheValue = {};
                    }
                    _set(scope.cacheValue, `GET_ACCELEROMETER.${value}`, returnData);
                }
                return returnData;
            },
        },
        microbit_play_note: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic',
            statements: [],
            template: '%1음을 %2박자 연주하기 %3',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['Low C', 131],
                        ['Low C#', 139],
                        ['Low D', 147],
                        ['Low Eb', 156],
                        ['Low E', 165],
                        ['Low F', 175],
                        ['Low F#', 185],
                        ['Low G', 196],
                        ['Low G#', 208],
                        ['Low A', 220],
                        ['Low Bb', 233],
                        ['Low B', 247],
                        ['Middle C', 262],
                        ['Middle C#', 277],
                        ['Middle D', 294],
                        ['Middle Eb', 311],
                        ['Middle E', 330],
                        ['Middle F', 349],
                        ['Middle F#', 370],
                        ['Middle G', 392],
                        ['Middle G#', 415],
                        ['Middle A', 440],
                        ['Middle Bb', 466],
                        ['Middle B', 494],
                        ['High C', 523],
                        ['High C#', 555],
                        ['High D', 587],
                        ['High Eb', 622],
                        ['High E', 659],
                        ['High F', 698],
                        ['High F#', 740],
                        ['High G', 784],
                        ['High G#', 831],
                        ['High A', 880],
                        ['High Bb', 932],
                        ['High B', 988],
                    ],
                    value: 262,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['1', 1],
                        ['1/2', 2],
                        ['1/4', 4],
                        ['1/8', 8],
                        ['1/16', 16],
                        ['2', 32],
                        ['4', 64],
                    ],
                    value: 1,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            class: 'MicrobitNote',
            isNotFor: ['microbit'],
            def: {
                type: 'microbit_play_note',
            },
            paramsKeyMap: {
                NOTE: 0,
                BEAT: 1,
            },
            func(sprite, script) {
                const note = script.getField('NOTE');
                const beat = script.getField('BEAT');
                const data = {
                    type: 'PLAY_NOTE',
                    data: {
                        note,
                        beat,
                    },
                };
                return Entry.Microbit.postCallReturn({
                    script,
                    data,
                });
            },
        },
        microbit_change_bpm: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic',
            statements: [],
            template: '연주 속도를 %1BPM 만큼 바꾸기 %2',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            class: 'MicrobitNote',
            isNotFor: ['microbit'],
            def: {
                params: [
                    {
                        type: 'number',
                        params: [20],
                    },
                ],
                type: 'microbit_change_bpm',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getNumberValue('VALUE');
                const data = {
                    type: 'CHANGE_BPM',
                    data: {
                        value,
                    },
                };
                return Entry.Microbit.postCallReturn({
                    script,
                    data,
                });
            },
        },
        microbit_set_bpm: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic',
            statements: [],
            template: '연주 속도를 %1BPM으로 정하기 %2',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            class: 'MicrobitNote',
            isNotFor: ['microbit'],
            def: {
                params: [
                    {
                        type: 'number',
                        params: [120],
                    },
                ],
                type: 'microbit_set_bpm',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            func(sprite, script) {
                const value = script.getNumberValue('VALUE');
                const data = {
                    type: 'SET_BPM',
                    data: {
                        value,
                    },
                };
                return Entry.Microbit.postCallReturn({
                    script,
                    data,
                });
            },
        },
        microbit_radio_receive_event: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_event',
            statements: [],
            template: '%1라디오를 수신했을 때',
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/start_icon_hardware.svg',
                    size: 14,
                    position: { x: 0, y: -2 },
                },
            ],
            def: { params: [], type: 'microbit_radio_receive_event' },
            paramsKeyMap: {},
            class: 'MicrobitRadio',
            isNotFor: ['microbit'],
            event: 'MicrobitRadioReceive',
            func(sprite, script) {
                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
    };
};

module.exports = Entry.Microbit;
