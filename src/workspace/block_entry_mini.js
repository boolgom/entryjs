(function() {
    var miniBlock = {
        practical_course_dummy: {
            color: '#7C7C7C',
            skeleton: 'basic',
            statements: [],
            isNotFor: [ 'arduinoDisconnected' ],
            template: '%1',
            params: [{
                type: "Indicator",
                color: "#6B6B6B",
                size: 12
            }],
            events: {},
            def: {
                params: [
                    null
                ],
                type: "practical_course_dummy"
            },
            paramsKeyMap: {
                VALUE: 0
            },
            func: function(sprite, script) {
            }
        },    
        practical_course_motor_speed: {
            color: '#00B200',
            skeleton: 'basic_string_field',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1',
            params: [{
                type: 'Dropdown',
                options: [
                    ['1', '1'],
                    ['2', '2'],
                    ['3', '3'],
                    ['4', '4'],
                    ['5', '5'],
                    ['6', '6'],
                    ['7', '7'],
                    ['8', '8'],
                    ['9', '9'],
                    ['10', '10'],
                    ['11', '11'],
                    ['12', '12'],
                    ['13', '13'],
                    ['14', '14'],
                    ['15', '15']
                ],
                value: '15',
                fontsIze: 11
            }],
            events: {},
            def: {
                params: [null]
            },
            paramsKeyMap: {
                VALUE: 0
            },
            func: function(sprite, script) {
                return script.getStringField('VALUE');
            }
        },
        practical_course_set_servo2: {
            color: '#D126BD',
            skeleton: 'basic',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1 포트의 서보모터를 %2 도 이동 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['OUT1', '1'],
                    ['OUT2', '2'],
                    ['OUT3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/servo.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, null],
                type: 'practical_course_set_servo2'
            },
            paramsKeyMap: {
                PORT: 0,
                'DEGREE': 1
            },
            class: 'practical_course_servo',
            func: function(sprite, script) {
                var port = script.getNumberField('PORT');
                var degree = script.getNumberValue('DEGREE');
                if (degree < 0) {
                    degree = 0;
                } else if (degree > 180) {
                    degree = 180;
                }
                Entry.hw.sendQueue['OUT' + port] = degree;
                var option = port;
                if (option === 3) {
                    option = 4;
                }
                Entry.hw.sendQueue['OPT'] = Entry.hw.sendQueue['OPT'] | option;
                return script.callReturn();
            }
        },
        practical_course_move_for_secs: {
            color: '#00B200',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1모터를 %2 %3의 속도로 %4초 동안 회전 %5',
            params: [{
                type: 'Dropdown',
                options: [
                    ['양쪽', '1'],
                    ['오른쪽', '2'],
                    ['왼쪽', '3'],
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['앞으로', '16'],
                    ['뒤로', '32']
                ],
                value: '16',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/dcmotor.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, {
                    type: 'practical_course_motor_speed',
                }, {
                    type: 'number',
                    params: ['2'],
                }, null],
                type: 'practical_course_move_for_secs'
            },
            paramsKeyMap: {
                'WHEEL': 0,
                'DIRECTION': 1,
                'SPEED': 2,
                DURATION: 3
            },
            class: 'practical_course_motor',
            func: function(sprite, script) {
                if (!script.isStart) {
                    var wheel = script.getNumberField('WHEEL');
                    var speed = script.getNumberValue('SPEED');
                    var direction = script.getNumberField('DIRECTION');
                    var duration = script.getNumberValue('DURATION');
                    var value = speed + direction;
                    switch (wheel) {
                        case 1:
                            {
                                Entry.hw.sendQueue['DCL'] = value;
                                Entry.hw.sendQueue['DCR'] = value;
                                break;
                            }

                        case 2:
                            {
                                Entry.hw.sendQueue['DCR'] = value;
                                break;
                            }

                        case 3:
                            {
                                Entry.hw.sendQueue['DCL'] = value;
                                break;
                            }
                    }

                    script.wheelMode = wheel;
                    script.isStart = true;
                    script.timeFlag = 1;
                    setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration * 1000);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    switch (script.wheelMode) {
                        case 1:
                            {
                                Entry.hw.sendQueue['DCL'] = 0;
                                Entry.hw.sendQueue['DCR'] = 0;
                                break;
                            }

                        case 2:
                            {
                                Entry.hw.sendQueue['DCR'] = 0;
                                break;
                            }

                        case 3:
                            {
                                Entry.hw.sendQueue['DCL'] = 0;
                                break;
                            }
                    }
                    delete script.timeFlag;
                    delete script.isStart;
                    delete script.wheelMode;
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            }
        },
        practical_course_move_for: {
            color: '#00B200',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1모터를 %2 %3의 속도로 계속 회전 %4',
            params: [{
                type: 'Dropdown',
                options: [
                    ['양쪽', '1'],
                    ['오른쪽', '2'],
                    ['왼쪽', '3'],
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['앞으로', '16'],
                    ['뒤로', '32']
                ],
                value: '16',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/dcmotor.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, {
                    type: 'practical_course_motor_speed',
                }, null],
                type: 'practical_course_move_for'
            },
            paramsKeyMap: {
                'WHEEL': 0,
                'DIRECTION': 1,
                'SPEED': 2
            },
            class: 'practical_course_motor',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var wheel = script.getNumberField('WHEEL');
                var speed = script.getNumberValue('SPEED');
                var direction = script.getNumberField('DIRECTION');
                var value = speed + direction;

                switch (wheel) {
                    case 1:
                        {
                            Entry.hw.sendQueue['DCL'] = value;
                            Entry.hw.sendQueue['DCR'] = value;
                            break;
                        }

                    case 2:
                        {
                            Entry.hw.sendQueue['DCR'] = value;
                            break;
                        }

                    case 3:
                        {
                            Entry.hw.sendQueue['DCL'] = value;
                            break;
                        }
                }

                return script.callReturn();
            }
        },
        practical_course_stop_for: {
            color: '#00B200',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1모터를 정지 %2',
            params: [{
                type: 'Dropdown',
                options: [
                    ['양쪽', '1'],
                    ['오른쪽', '2'],
                    ['왼쪽', '3'],
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/dcmotor.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null],
                type: 'practical_course_stop_for'
            },
            paramsKeyMap: {
                'WHEEL': 0
            },
            class: 'practical_course_motor',
            func: function(sprite, script) {
                var wheel = script.getNumberField('WHEEL');
                if (wheel == 2) {
                    Entry.hw.sendQueue['DCR'] = 0;
                } else if (wheel == 3) {
                    Entry.hw.sendQueue['DCL'] = 0;
                } else {
                    Entry.hw.sendQueue['DCR'] = 0;
                    Entry.hw.sendQueue['DCL'] = 0;
                }
                return script.callReturn();
            }
        },
        practical_course_touch_value: {
            color: '#2AB4D3',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 접촉 센서 값',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }],
            events: {},
            def: {
                params: [null],
                type: 'practical_course_touch_value'
            },
            paramsKeyMap: {
                PORT: 0
            },
            class: 'practical_course_touch',
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                var value = (Entry.hw.portData['IN' + port] > 125) ? 1 : 0;
                return value;
            }
        },
        practical_course_touch_value_boolean: {
            color: '#2AB4D3',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 접촉 센서가 %2',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['접촉 되면', '1'],
                    ['접촉 안되면', '0']
                ],
                value: '1',
                fontsIze: 11
            }],
            def: {
                params: [null, null, null],
                type: 'practical_course_touch_value_boolean'
            },
            paramsKeyMap: {
                PORT: 0,
                'TOUCH': 1
            },
            class: 'practical_course_touch',
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                var touch = script.getNumberField('TOUCH', script);
                var value = Entry.hw.portData['IN' + port];
                var isTouch = !((value > 125) ^ touch);

                return isTouch;
            }
        },
        practical_course_light_value: {
            color: '#498DEB',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 빛 감지 센서 값',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }],
            events: {},
            def: {
                params: [null],
                type: 'practical_course_light_value'
            },
            paramsKeyMap: {
                PORT: 0
            },
            class: 'practical_course_light',
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                return Entry.hw.portData['IN' + port];
            }
        },
        practical_course_light_value_boolean: {
            color: '#498DEB',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 빛 감지 센서 값 %2 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['=', 'EQUAL'],
                    ['>', 'GREATER'],
                    ['<', 'LESS'],
                    ['≥', 'GREATER_OR_EQUAL'],
                    ['≤', 'LESS_OR_EQUAL']
                ],
                value: 'LESS',
                fontsIze: 11,
                noaRrow: true
            }, {
                type: 'Block',
                accept: 'string'
            }],
            def: {
                params: [null, null, {
                    type: 'number',
                    params: ['100']
                }],
                type: 'practical_course_light_value_boolean'
            },
            paramsKeyMap: {
                PORT: 0,
                'OPERATOR': 1,
                'RIGHTVALUE': 2
            },
            class: 'practical_course_light',
            func: function(sprite, script) {
                var port = script.getNumberField('PORT', script);
                var operator = script.getField('OPERATOR', script);
                var rightValue = script.getNumberValue('RIGHTVALUE', script);
                var leftValue = Entry.hw.portData['IN' + port];
                var isCheck = false;

                switch (operator) {
                    case 'EQUAL':
                        isCheck = leftValue == rightValue;
                        break;
                    case 'GREATER':
                        isCheck = Number(leftValue) > Number(rightValue);
                        break;
                    case 'LESS':
                        isCheck = Number(leftValue) < Number(rightValue);
                        break;
                    case 'GREATER_OR_EQUAL':
                        isCheck = Number(leftValue) >= Number(rightValue);
                        break;
                    case 'LESS_OR_EQUAL':
                        isCheck = Number(leftValue) <= Number(rightValue);
                        break;
                }

                return isCheck;
            }
        },
        practical_course_sound_value: {
            color: '#00D67F',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 소리 센서에 감지되는 소리 값',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }],
            events: {},
            def: {
                params: [null],
                type: 'practical_course_sound_value'
            },
            paramsKeyMap: {
                PORT: 0
            },
            class: 'practical_course_sound',
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                return Entry.hw.portData['IN' + port];
            }
        },
        practical_course_sound_value_boolean: {
            color: '#00D67F',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 소리 센서에 감지되는 소리 값 %2 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['=', 'EQUAL'],
                    ['>', 'GREATER'],
                    ['<', 'LESS'],
                    ['≥', 'GREATER_OR_EQUAL'],
                    ['≤', 'LESS_OR_EQUAL']
                ],
                value: 'LESS',
                fontsIze: 11,
                noaRrow: true
            }, {
                type: 'Block',
                accept: 'string'
            }],
            def: {
                params: [null, null, {
                    type: 'number',
                    params: ['100']
                }],
                type: 'practical_course_sound_value_boolean'
            },
            paramsKeyMap: {
                PORT: 0,
                'OPERATOR': 1,
                'RIGHTVALUE': 2
            },
            class: 'practical_course_sound',
            func: function(sprite, script) {
                var port = script.getNumberField('PORT', script);
                var operator = script.getField('OPERATOR', script);
                var rightValue = script.getNumberValue('RIGHTVALUE', script);
                var leftValue = Entry.hw.portData['IN' + port];
                var isCheck = false;

                switch (operator) {
                    case 'EQUAL':
                        isCheck = leftValue == rightValue;
                        break;
                    case 'GREATER':
                        isCheck = Number(leftValue) > Number(rightValue);
                        break;
                    case 'LESS':
                        isCheck = Number(leftValue) < Number(rightValue);
                        break;
                    case 'GREATER_OR_EQUAL':
                        isCheck = Number(leftValue) >= Number(rightValue);
                        break;
                    case 'LESS_OR_EQUAL':
                        isCheck = Number(leftValue) <= Number(rightValue);
                        break;
                }

                return isCheck;
            }
        },
        practical_course_irs_value: {
            color: '#C4065C',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 적외선 센서에 감지되는 크기 값',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }],
            events: {},
            def: {
                params: [null],
                type: 'practical_course_irs_value'
            },
            paramsKeyMap: {
                PORT: 0
            },
            class: 'practical_course_irs',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                return Entry.hw.portData['IN' + port];
            }
        },
        practical_course_irs_value_boolean: {
            color: '#C4065C',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 적외선 센서에 감지되는 크기 값이 %2 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['=', 'EQUAL'],
                    ['>', 'GREATER'],
                    ['<', 'LESS'],
                    ['≥', 'GREATER_OR_EQUAL'],
                    ['≤', 'LESS_OR_EQUAL']
                ],
                value: 'LESS',
                fontsIze: 11,
                noaRrow: true
            }, {
                type: 'Block',
                accept: 'string'
            }],
            def: {
                params: [null, null, {
                    type: 'number',
                    params: ['100']
                }],
                type: 'practical_course_irs_value_boolean'
            },
            paramsKeyMap: {
                PORT: 0,
                'OPERATOR': 1,
                'RIGHTVALUE': 2
            },
            class: 'practical_course_irs',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var port = script.getNumberField('PORT', script);
                var operator = script.getField('OPERATOR', script);
                var rightValue = script.getNumberValue('RIGHTVALUE', script);
                var leftValue = Entry.hw.portData['IN' + port];
                var isCheck = false;

                switch (operator) {
                    case 'EQUAL':
                        isCheck = leftValue == rightValue;
                        break;
                    case 'GREATER':
                        isCheck = Number(leftValue) > Number(rightValue);
                        break;
                    case 'LESS':
                        isCheck = Number(leftValue) < Number(rightValue);
                        break;
                    case 'GREATER_OR_EQUAL':
                        isCheck = Number(leftValue) >= Number(rightValue);
                        break;
                    case 'LESS_OR_EQUAL':
                        isCheck = Number(leftValue) <= Number(rightValue);
                        break;
                }

                return isCheck;
            }
        },
        practical_course_diode_secs_toggle: {
            color: '#FF8D10',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 발광다이오드를 %2초 동안 %3 %4',
            params: [{
                type: 'Dropdown',
                options: [
                    ['OUT 1', '1'],
                    ['OUT 2', '2'],
                    ['OUT 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Dropdown',
                options: [
                    ['켜기', '255'],
                    ['끄기', '0']
                ],
                value: '255',
                fontsIze: 11
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, {
                    type: 'number',
                    params: ['2']
                }, null, null],
                type: 'practical_course_diode_secs_toggle'
            },
            paramsKeyMap: {
                PORT: 0,
                DURATION: 1,
                VALUE: 2
            },
            class: 'practical_course_diode',
            func: function(sprite, script) {
                if (!script.isStart) {
                    var port = script.getNumberField('PORT');
                    var duration = script.getNumberValue('DURATION');
                    var value = script.getNumberField('VALUE');

                    var option = port;
                    if (value < 0) {
                        value = 0;
                    } else if (value > 255) {
                        value = 255;
                    }
                    if (option === 3) {
                        option = 4;
                    }

                    script.isStart = true;
                    script.timeFlag = 1;
                    script.outPort = port;
                    script.outOption = option;
                    Entry.hw.sendQueue['OUT' + port] = value;
                    Entry.hw.sendQueue['OPT'] = Entry.hw.sendQueue['OPT'] & (~option);

                    setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration * 1000);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    Entry.hw.sendQueue['OUT' + script.outPort] = 0;
                    Entry.hw.sendQueue['OPT'] = Entry.hw.sendQueue['OPT'] & (~script.outOption);
                    delete script.timeFlag;
                    delete script.isStart;
                    delete script.outPort;
                    delete script.outOption;
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            }
        },
        practical_course_diode_toggle: {
            color: '#FF8D10',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 발광다이오드를 %2 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['OUT 1', '1'],
                    ['OUT 2', '2'],
                    ['OUT 3', '3'],
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['켜기', '255'],
                    ['끄기', '0']
                ],
                value: '255',
                fontsIze: 11
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, null],
                type: 'practical_course_diode_toggle'
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1
            },
            class: 'practical_course_diode',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var port = script.getNumberField('PORT');
                var value = script.getNumberField('VALUE');
                var option = port;

                if (value < 0) {
                    value = 0;
                } else if (value > 255) {
                    value = 255;
                }

                if (option === 3) {
                    option = 4;
                }

                Entry.hw.sendQueue['OUT' + port] = value;
                Entry.hw.sendQueue['OPT'] = Entry.hw.sendQueue['OPT'] & (~option);

                return script.callReturn();
            }
        },
        practical_course_diode_inout_toggle: {
            color: '#FF8D10',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 발광다이오드를 %2번 포트의 %3~%4의 범위로 켜기%5',
            params: [{
                type: 'Dropdown',
                options: [
                    ['OUT 1', '1'],
                    ['OUT 2', '2'],
                    ['OUT 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null,
                    { type: 'number', params: ['0'] },
                    { type: 'number', params: ['255'] },
                    null
                ],
                type: 'practical_course_diode_inout_toggle'
            },
            paramsKeyMap: {
                'OUTPUT': 0,
                'INPUT': 1,
                'MIN': 2,
                'MAX': 3
            },
            class: 'practical_course_diode',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var outputPort = script.getNumberField('OUTPUT');
                var inputPort = script.getNumberField('INPUT');
                var option = inputPort;
                if (option === 3) {
                    option = 4;
                }
                var oMin = script.getNumberValue('MIN');
                var oMax = script.getNumberValue('MAX');
                var nMin = 0;
                var nMax = 255;
                var x = Entry.hw.portData['IN' + inputPort];
                var percent = (x - oMin) / (oMax - oMin);
                result = percent * (nMax - nMin) + nMin;
                if (result > nMax)
                    result = nMax;
                if (result < nMin)
                    result = nMin;

                Entry.hw.sendQueue['OUT' + outputPort] = result;
                Entry.hw.sendQueue['OPT'] = Entry.hw.sendQueue['OPT'] & (~option);

                return script.callReturn();
            }
        },
        practical_course_diode_set_output: {
            color: '#FF8D10',
            skeleton: 'basic',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 발광다이오드를 %2의 밝기로 정하기 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['OUT 1', '1'],
                    ['OUT 2', '2'],
                    ['OUT 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, {
                    type: 'number',
                    params: ['255']
                }, null],
                type: 'practical_course_diode_set_output',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1
            },
            class: 'practical_course_diode',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var value = script.getNumberValue('VALUE', script);
                var option = port;
                if (value < 0) {
                    value = 0;
                } else if (value > 255) {
                    value = 255;
                }
                if (option === 3) {
                    option = 4;
                }
                Entry.hw.sendQueue['OUT' + port] = value;
                Entry.hw.sendQueue['OPT'] = Entry.hw.sendQueue['OPT'] & (~option);
                return script.callReturn();
            }
        },
        practical_course_diode_input_value: {
            color: '#FF8D10',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '%1번 포트의 값',
            params: [{
                type: 'Dropdown',
                options: [
                    ['IN 1', '1'],
                    ['IN 2', '2'],
                    ['IN 3', '3']
                ],
                value: '1',
                fontsIze: 11
            }],
            events: {},
            def: {
                params: [null],
                type: 'practical_course_diode_input_value'
            },
            paramsKeyMap: {
                PORT: 0
            },
            class: 'practical_course_diode',
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                return Entry.hw.portData['IN' + port];
            }
        },
        practical_course_melody_note_for: {
            color: '#FC327F',
            skeleton: 'basic',
            statements: [],
            isNotFor: [ 'neobot' ],
            template: '멜로디 %1 을(를) %2 옥타브로 %3 길이만큼 소리내기 %4',
            params: [{
                type: 'Dropdown',
                options: [
                    ['무음', '0'],
                    ['도', '1'],
                    ['도#(레♭)', '2'],
                    ['레', '3'],
                    ['레#(미♭)', '4'],
                    ['미', '5'],
                    ['파', '6'],
                    ['파#(솔♭)', '7'],
                    ['솔', '8'],
                    ['솔#(라♭)', '9'],
                    ['라', '10'],
                    ['라#(시♭)', '11'],
                    ['시', '12']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['1', '0'],
                    ['2', '1'],
                    ['3', '2'],
                    ['4', '3'],
                    ['5', '4'],
                    ['6', '5']
                ],
                value: '2',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['온음표', '1'],
                    ['2분음표', '2'],
                    ['4분음표', '4'],
                    ['8분음표', '8'],
                    ['16분음표', '16'],
                ],
                value: '4',
                fontsIze: 11
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/melody.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, null, null],
                type: 'practical_course_melody_note_for'
            },
            paramsKeyMap: {
                'NOTE': 0,
                'OCTAVE': 1,
                DURATION: 2
            },
            class: 'practical_course_melody',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var sq = Entry.hw.sendQueue;

                if (!script.isStart) {
                    var note = script.getNumberField('NOTE', script);
                    var octave = script.getNumberField('OCTAVE', script);
                    var duration = script.getNumberField(DURATION, script);
                    var value = (note > 0) ? note + (12 * octave) : 0;

                    script.isStart = true;
                    script.timeFlag = 1;
                    script.soundFlag = 1;
                    if (value > 65) {
                        value = 65;
                    }
                    sq.SND = value;
                    setTimeout(function() {
                        setTimeout(function() {
                            script.timeFlag = 0;
                        }, 50);
                    }, 1 / duration * 2000);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else if (script.soundFlag == 1) {
                    Entry.hw.sendQueue['SND'] = 0;
                    script.soundFlag = 0;
                    return script;
                } else {
                    delete script.timeFlag;
                    delete script.isStart;
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            }
        },
        
        // roborobo_mini
        roborobo_motor_speed: {
            color: '#00B200',
            skeleton: 'basic_string_field',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1',
            params: [{
                type: 'Dropdown',
                options: [                    
                    ['1', '51'],
                    ['2', '68'],
                    ['3', '85'],
                    ['4', '102'],
                    ['5', '119'],
                    ['6', '136'],
                    ['7', '153'],
                    ['8', '170'],
                    ['9', '187'],
                    ['10', '204'],
                    ['11', '221'],
                    ['12', '238'],
                    ['13', '255']
                ],
                value: '255',
                fontsIze: 11
            }],
            events: {},
            def: {
                params: [null]
            },
            paramsKeyMap: {
                VALUE: 0
            },
            func: function(sprite, script) {
                return script.getStringField('VALUE');
            }
        },
        roborobo_move_for_secs: {
            color: '#00B200',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1모터를 %2 %3의 속도로 %4초 동안 회전 %5',
            params: [{
                type: 'Dropdown',
                options: [
                    ['양쪽', '1'],
                    ['오른쪽', '2'],
                    ['왼쪽', '3'],
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['앞으로', '1'],
                    ['뒤로', '2']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/dcmotor.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, {
                    type: 'roborobo_motor_speed',
                }, {
                    type: 'number',
                    params: ['2'],
                }, null],
                type: 'roborobo_move_for_secs'
            },
            paramsKeyMap: {
                'WHEEL': 0,
                'DIRECTION': 1,
                'SPEED': 2,
                DURATION: 3
            },
            class: 'roborobo_motor',
            func: function(sprite, script) {
                var motor1 = 0;
                var motor2 = 1;
                var wheel = script.getNumberField('WHEEL');
                var speed = script.getNumberValue('SPEED');
                var direction = script.getNumberField('DIRECTION');
                var duration = script.getNumberValue('DURATION');
                
                if(!Entry.hw.sendQueue.digitalPinMode) {
                    Entry.hw.sendQueue.digitalPinMode = {};
                }
                
                if (!script.isStart) {
                    if(wheel == 1) {
                        Entry.hw.sendQueue.digitalPinMode[7] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        Entry.hw.sendQueue.digitalPinMode[0] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        Entry.hw.sendQueue.digitalPinMode[8] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        Entry.hw.sendQueue.digitalPinMode[1] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        
                        if(direction == 1) {
                            Entry.hw.sendQueue[motor1] = speed;
                            Entry.hw.sendQueue[motor2] = speed;
                        } else if(direction == 2) {
                            Entry.hw.sendQueue[motor1] = -speed;
                            Entry.hw.sendQueue[motor2] = -speed;
                        }
                    } else if(wheel == 2) {
                        Entry.hw.sendQueue.digitalPinMode[8] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        Entry.hw.sendQueue.digitalPinMode[1] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        
                        if(direction == 1) {
                            Entry.hw.sendQueue[motor1] = 0x00;
                            Entry.hw.sendQueue[motor2] = speed;
                        } else if(direction == 2) {
                            Entry.hw.sendQueue[motor1] = 0x00;
                            Entry.hw.sendQueue[motor2] = -speed;
                        }
                        
                    } else if(wheel == 3) {
                        Entry.hw.sendQueue.digitalPinMode[7] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        Entry.hw.sendQueue.digitalPinMode[0] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                        
                        if(direction == 1) {
                            Entry.hw.sendQueue[motor1] = speed;
                            Entry.hw.sendQueue[motor2] = 0x00;
                        } else if(direction == 2) {
                            Entry.hw.sendQueue[motor1] = -speed;
                            Entry.hw.sendQueue[motor2] = 0x00;
                        }
                    }

                    script.wheelMode = wheel;
                    script.isStart = true;
                    script.timeFlag = 1;
                    setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration * 1000);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    Entry.hw.sendQueue[motor1] = 0x00;
                    Entry.hw.sendQueue[motor2] = 0x00;
                    
                    delete script.timeFlag;
                    delete script.isStart;
                    delete script.wheelMode;
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            }
        },
        roborobo_move_for: {
            color: '#00B200',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1모터를 %2 %3의 속도로 계속 회전 %4',
            params: [{
                type: 'Dropdown',
                options: [
                    ['양쪽', '1'],
                    ['오른쪽', '2'],
                    ['왼쪽', '3'],
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['앞으로', '1'],
                    ['뒤로', '2']
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/dcmotor.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, {
                    type: 'roborobo_motor_speed',
                }, null],
                type: 'roborobo_move_for'
            },
            paramsKeyMap: {
                'WHEEL': 0,
                'DIRECTION': 1,
                'SPEED': 2
            },
            class: 'roborobo_motor',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var motor1 = 0;
                var motor2 = 1;
                var wheel = script.getNumberField('WHEEL');
                var speed = script.getNumberValue('SPEED');
                var direction = script.getNumberField('DIRECTION');
                
                if(!Entry.hw.sendQueue.digitalPinMode) {
                    Entry.hw.sendQueue.digitalPinMode = {};
                }
                
                if(wheel == 1) {
                    Entry.hw.sendQueue.digitalPinMode[7] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[0] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[8] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[1] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    
                    if(direction == 1) {
                        Entry.hw.sendQueue[motor1] = speed;
                        Entry.hw.sendQueue[motor2] = speed;
                    } else if(direction == 2) {
                        Entry.hw.sendQueue[motor1] = -speed;
                        Entry.hw.sendQueue[motor2] = -speed;
                    }
                } else if(wheel == 2) {
                    Entry.hw.sendQueue.digitalPinMode[8] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[1] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    
                    if(direction == 1) {
                        Entry.hw.sendQueue[motor1] = 0x00;
                        Entry.hw.sendQueue[motor2] = speed;
                    } else if(direction == 2) {
                        Entry.hw.sendQueue[motor1] = 0x00;
                        Entry.hw.sendQueue[motor2] = -speed;
                    }                    
                } else if(wheel == 3) {
                    Entry.hw.sendQueue.digitalPinMode[7] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[0] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    
                    if(direction == 1) {
                        Entry.hw.sendQueue[motor1] = speed;
                        Entry.hw.sendQueue[motor2] = 0x00;
                    } else if(direction == 2) {
                        Entry.hw.sendQueue[motor1] = -speed;
                        Entry.hw.sendQueue[motor2] = 0x00;
                    }
                }

                return script.callReturn();
            }
        },
        roborobo_stop_for: {
            color: '#00B200',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1모터를 정지 %2',
            params: [{
                type: 'Dropdown',
                options: [
                    ['양쪽', '1'],
                    ['오른쪽', '2'],
                    ['왼쪽', '3'],
                ],
                value: '1',
                fontsIze: 11
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/dcmotor.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null],
                type: 'roborobo_stop_for'
            },
            paramsKeyMap: {
                'WHEEL': 0
            },
            class: 'roborobo_motor',
            func: function(sprite, script) {
                var motor1 = 0;
                var motor2 = 1;
                var wheel = script.getNumberField('WHEEL');
                
                if(!Entry.hw.sendQueue.digitalPinMode) {
                    Entry.hw.sendQueue.digitalPinMode = {};
                }
                
                if(wheel == 1) {
                    Entry.hw.sendQueue.digitalPinMode[7] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[0] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[8] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[1] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    
                    Entry.hw.sendQueue[motor1] = 0x00;
                    Entry.hw.sendQueue[motor2] = 0x00;
                } else if(wheel == 2) {
                    Entry.hw.sendQueue.digitalPinMode[8] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[1] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    
                    Entry.hw.sendQueue[motor2] = 0x00;
                } else if(wheel == 3) {
                    Entry.hw.sendQueue.digitalPinMode[7] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    Entry.hw.sendQueue.digitalPinMode[0] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                    
                    Entry.hw.sendQueue[motor1] = 0x00;
                }
                
                return script.callReturn();
            }
        },
        roborobo_touch_value: {
            color: '#2AB4D3',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '접촉 센서 값',
            params: [{
                type: 'Block',
				accept: 'string'
            }],
            events: {},
            def: {
                params: [null],
                type: 'roborobo_touch_value'
            },
            paramsKeyMap: {
            },
            class: 'roborobo_touch',
            func: function(sprite, script) {
				var port = Entry.Roborobo_SchoolKit.inputPort.contact;
                var value = Entry.hw.portData[port - 7] == undefined ? 0 : Entry.hw.portData[port - 7];
                return value;
            }
        },
        roborobo_touch_value_boolean: {
            color: '#2AB4D3',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '접촉 센서가 %1',
            params: [{
                type: 'Dropdown',
                options: [
                    ['접촉 되면', '1'],
                    ['접촉 안되면', '0']
                ],
                value: '1',
                fontsIze: 11
            }],
            def: {
                params: [null],
                type: 'roborobo_touch_value_boolean'
            },
            paramsKeyMap: {
                'TOUCH': 0
            },
            class: 'roborobo_touch',
            func: function(sprite, script) {
                var port = Entry.Roborobo_SchoolKit.inputPort.contact;
                var touch = script.getNumberField('TOUCH', script);                
                var value = Entry.hw.portData[port - 7] == undefined ? 0 : Entry.hw.portData[port - 7];
                var isTouch = touch == value ? true : false;
                
                return isTouch;
            }
        },        
        roborobo_light_value: {
            color: '#498DEB',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: 'CDS 센서 값',
            params: [{
                type: 'Block',
				accept: 'string'
            }],
            events: {},
            def: {
                params: [null],
                type: 'roborobo_light_value'
            },
            paramsKeyMap: {
            },
            class: 'roborobo_light',
            func: function(sprite, script) {
                var port = Entry.Roborobo_SchoolKit.inputPort.cds;
                return Entry.hw.portData[port - 7];
            }
        },
        roborobo_light_value_boolean: {
            color: '#498DEB',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'roborobo_schoolkit' ],
            template: 'CDS 센서 값 %1 %2',
            params: [{
                type: 'Dropdown',
                options: [
                    ['=', 'EQUAL'],
                    ['>', 'GREATER'],
                    ['<', 'LESS'],
                    ['≥', 'GREATER_OR_EQUAL'],
                    ['≤', 'LESS_OR_EQUAL']
                ],
                value: 'LESS',
                fontsIze: 11,
                noaRrow: true
            }, {
                type: 'Block',
                accept: 'string'
            }],
            def: {
                params: [null, {
                    type: 'number',
                    params: ['512']
                }],
                type: 'roborobo_light_value_boolean'
            },
            paramsKeyMap: {
                'OPERATOR': 0,
                'RIGHTVALUE': 1
            },
            class: 'roborobo_light',
            func: function(sprite, script) {
                var port = Entry.Roborobo_SchoolKit.inputPort.cds;
                var operator = script.getField('OPERATOR', script);				
                var rightValue = script.getNumberValue('RIGHTVALUE', script);
				var leftValue = Entry.hw.portData[port - 7];
				var isCheck = false;
				
				if(rightValue < 0) {
					rightValue = 0;
				} else if(rightValue > 1023) {
					rightValue = 1023;
				}
                
                switch (operator) {
                    case 'EQUAL':
                        isCheck = leftValue == rightValue;
                        break;
                    case 'GREATER':
                        isCheck = Number(leftValue) > Number(rightValue);
                        break;
                    case 'LESS':
                        isCheck = Number(leftValue) < Number(rightValue);
                        break;
                    case 'GREATER_OR_EQUAL':
                        isCheck = Number(leftValue) >= Number(rightValue);
                        break;
                    case 'LESS_OR_EQUAL':
                        isCheck = Number(leftValue) <= Number(rightValue);
                        break;
                }				

                return isCheck;
            }
        },
        roborobo_sound_value: {
            color: '#00D67F',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '소리 센서에 감지되는 소리 값',
            params: [{
                type: 'Block',
				accept: 'string'
            }],
            events: {},
            def: {
                params: [null],
                type: 'roborobo_sound_value'
            },
            paramsKeyMap: {
            },
            class: 'roborobo_sound',
            func: function(sprite, script) {
                var port = Entry.Roborobo_SchoolKit.inputPort.sound;
                return Entry.hw.portData[port - 7];
            }
        },
        roborobo_sound_value_boolean: {
            color: '#00D67F',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '소리 센서에 감지되는 소리 값 %1 %2',
            params: [{
                type: 'Dropdown',
                options: [
                    ['=', 'EQUAL'],
                    ['>', 'GREATER'],
                    ['<', 'LESS'],
                    ['≥', 'GREATER_OR_EQUAL'],
                    ['≤', 'LESS_OR_EQUAL']
                ],
                value: 'LESS',
                fontsIze: 11,
                noaRrow: true
            }, {
                type: 'Block',
                accept: 'string'
            }],
            def: {
                params: [null, {
                    type: 'number',
                    params: ['512']
                }],
                type: 'roborobo_sound_value_boolean'
            },
            paramsKeyMap: {
                'OPERATOR': 0,
                'RIGHTVALUE': 1
            },
            class: 'roborobo_sound',
            func: function(sprite, script) {
                var port = Entry.Roborobo_SchoolKit.inputPort.sound;
                var operator = script.getField('OPERATOR', script);
                var rightValue = script.getNumberValue('RIGHTVALUE', script);
                var leftValue = Entry.hw.portData[port - 7];
                var isCheck = false;
                
				if(rightValue < 0) {
					rightValue = 0;
				} else if(rightValue > 1023) {
					rightValue = 1023;
				}
				
                switch (operator) {
                    case 'EQUAL':
                        isCheck = leftValue == rightValue;
                        break;
                    case 'GREATER':
                        isCheck = Number(leftValue) > Number(rightValue);
                        break;
                    case 'LESS':
                        isCheck = Number(leftValue) < Number(rightValue);
                        break;
                    case 'GREATER_OR_EQUAL':
                        isCheck = Number(leftValue) >= Number(rightValue);
                        break;
                    case 'LESS_OR_EQUAL':
                        isCheck = Number(leftValue) <= Number(rightValue);
                        break;
                }

                return isCheck;
            }
        },
        roborobo_irs_value: {
            color: '#C4065C',
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '적외선 센서 값',
            params: [{
                type: 'Block',
				accept: 'string'
            }],
            events: {},
            def: {
                params: [null],
                type: 'roborobo_irs_value'
            },
            paramsKeyMap: {
            },
            class: 'roborobo_irs',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {                
                var port = Entry.Roborobo_SchoolKit.inputPort.ir;
                var value = Entry.hw.portData[port - 7] == undefined ? 0 : Entry.hw.portData[port - 7];
                return value;
            }
        },
        roborobo_irs_value_boolean: {
            color: '#C4065C',
            skeleton: 'basic_boolean_field',
            fontColor: '#fff',
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '적외선 센서가 %1',
            params: [{
                type: 'Dropdown',
                options: [
                    ['감지 되면', '1'],
                    ['감지 안되면', '0']
                ],
                value: '1',
                fontsIze: 11
            }],
            def: {
                params: [null],
                type: 'roborobo_irs_value_boolean'
            },
            paramsKeyMap: {
                'DETECT': 0
            },
            class: 'roborobo_irs',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var port = Entry.Roborobo_SchoolKit.inputPort.ir;
                var detect = script.getNumberField('DETECT', script);                
                var value = Entry.hw.portData[port - 7] == undefined ? 0 : Entry.hw.portData[port - 7];
                var isDetect = detect == value ? true : false;
                
                return isDetect;
            }
        },
        roborobo_diode_secs_toggle: {
            color: '#FF8D10',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1번 포트의 발광다이오드를 %2초 동안 %3 %4',
            params: [{
                type: 'Dropdown',
                options: [
                    ['LED 1', '5'],
                    ['LED 2', '4'],
                    ['R - A', '3'],
                    ['R - B', '2']
                ],
                value: '5',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Dropdown',
                options: [
                    ['켜기', '255'],
                    ['끄기', '0']
                ],
                value: '255',
                fontsIze: 11
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, {
                    type: 'number',
                    params: ['2']
                }, null, null],
                type: 'roborobo_diode_secs_toggle'
            },
            paramsKeyMap: {
                PORT: 0,
                DURATION: 1,
                VALUE: 2
            },
            class: 'roborobo_diode',
            func: function(sprite, script) {
                var port = script.getNumberField('PORT');
                var duration = script.getNumberValue('DURATION');
                var value = script.getNumberField('VALUE');
                
                if(!Entry.hw.sendQueue.digitalPinMode) {
                    Entry.hw.sendQueue.digitalPinMode = {};
                }
                
                Entry.hw.sendQueue.digitalPinMode[port] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                
                if (!script.isStart) {
                    script.isStart = true;
                    script.timeFlag = 1;
                    Entry.hw.sendQueue[port] = value;

                    setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration * 1000);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    Entry.hw.sendQueue[port] = 0;
                    delete script.timeFlag;
                    delete script.isStart;
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            }
        },
        roborobo_diode_toggle: {
            color: '#FF8D10',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1번 포트의 발광다이오드를 %2 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['LED 1', '5'],
                    ['LED 2', '4'],
                    ['R - A', '3'],
                    ['R - B', '2']
                ],
                value: '5',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['켜기', '255'],
                    ['끄기', '0']
                ],
                value: '255',
                fontsIze: 11
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null, null],
                type: 'roborobo_diode_toggle'
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1
            },
            class: 'roborobo_diode',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var port = script.getNumberField('PORT');
                var value = script.getNumberField('VALUE');
                
                if(!Entry.hw.sendQueue.digitalPinMode) {
                    Entry.hw.sendQueue.digitalPinMode = {};
                }
                
                Entry.hw.sendQueue.digitalPinMode[port] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                Entry.hw.sendQueue[port] = value;

                return script.callReturn();
            }
        },
        roborobo_diode_inout_toggle: {
            color: '#FF8D10',
            skeleton: 'basic',
            fontColor: '#fff',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1번 포트의 발광다이오드를 %2번 포트의 %3~%4의 범위로 켜기%5',
            params: [{
                type: 'Dropdown',
                options: [
                    ['LED 1', '5'],
                    ['LED 2', '4'],
                    ['R - A', '3'],
                    ['R - B', '2']
                ],
                value: '5',
                fontsIze: 11
            }, {
                type: 'Dropdown',
                options: [
                    ['소 리', '8'],
                    ['CDS', '10']
                ],
                value: '8',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, null,
                    { type: 'number', params: ['0'] },
                    { type: 'number', params: ['255'] },
                    null
                ],
                type: 'roborobo_diode_inout_toggle'
            },
            paramsKeyMap: {
                'OUTPUT': 0,
                'INPUT': 1,
                'MIN': 2,
                'MAX': 3
            },
            class: 'roborobo_diode',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var outputPort = script.getNumberField('OUTPUT');
                var inputPort = script.getNumberField('INPUT');
                
                var oMin = script.getNumberValue('MIN');
                var oMax = script.getNumberValue('MAX');
                var nMin = 0;
                var nMax = 255;
				
				var x = Entry.hw.portData[inputPort - 7] / 4;                
                var percent = (x - oMin) / (oMax - oMin);
                result = percent * (nMax - nMin) + nMin;
                if (result > nMax)
                    result = nMax;
                if (result < nMin)
                    result = nMin;
                
                if(!Entry.hw.sendQueue.digitalPinMode) {
                    Entry.hw.sendQueue.digitalPinMode = {};
                }
                
				Entry.hw.sendQueue.digitalPinMode[outputPort] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                Entry.hw.sendQueue[outputPort] = result;

                return script.callReturn();
            }
        },
        roborobo_diode_set_output: {
            color: '#FF8D10',
            skeleton: 'basic',
            statements: [],
            isNotFor: [ 'roborobo_schoolkit' ],
            template: '%1번 포트의 발광다이오드를 %2의 밝기로 켜기 %3',
            params: [{
                type: 'Dropdown',
                options: [
                    ['LED 1', '5'],
                    ['LED 2', '4'],
                    ['R - A', '3'],
                    ['R - B', '2']
                ],
                value: '5',
                fontsIze: 11
            }, {
                type: 'Block',
                accept: 'string'
            }, {
                type: 'Indicator',
                img: 'block_icon/practical_course/diode.png',
                size: 12
            }],
            events: {},
            def: {
                params: [null, {
                    type: 'number',
                    params: ['255']
                }, null],
                type: 'roborobo_diode_set_output',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1
            },
            class: 'roborobo_diode',
            //'isNotFor': ['mini'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var value = script.getNumberValue('VALUE', script);
                
                if (value < 0) {
                    value = 0;
                } else if (value > 255) {
                    value = 255;
                }
                
                if(!Entry.hw.sendQueue.digitalPinMode) {
                    Entry.hw.sendQueue.digitalPinMode = {};
                }
                
                Entry.hw.sendQueue.digitalPinMode[port] = Entry.Roborobo_SchoolKit.pinMode.PWM;
                Entry.hw.sendQueue[port] = value;
                
                return script.callReturn();
            }
        }
    };

    $.extend(Entry.block, miniBlock);

})();
