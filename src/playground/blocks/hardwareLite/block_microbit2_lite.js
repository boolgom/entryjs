'use strict';

const _throttle = require('lodash/throttle');

const EVENT_INTERVAL = 150;

(function () {
    Entry.Microbit2lite = new (class Microbit2Lite {
        constructor() {
            this.commandStatus = {};
            this.btnEventIntervalId = -1;
            this.retryLimitCnt = 8;
            this.portData = {
                baudRate: 115200,
                dataBits: 8,
                parity: 'none',
                stopBits: 1,
                bufferSize: 512,
                connectionType: 'ascii',
            };
            this.duration = 64;
            this.functionKeys = {
                LOCALDATA: 'localdata',
                GET_ANALOG: 'get-analog',
                GET_DIGITAL: 'get-digital',
                SET_ANALOG: 'set-analog',
                SET_DIGITAL: 'set-digital',
                SET_LED: 'set-pixel',
                GET_LED: 'get-pixel',
                RESET: 'reset',
                PRESET_IMAGE: 'pre-image',
                SET_CUSTOM_IMAGE: 'custom-image',
                SET_STRING: 'print',
                RESET_SCREEN: 'display-clear',
                DISPLAY_ON: 'display-on',
                DISPLAY_OFF: 'display-off',
                SPEAKER_ON: 'speaker-on',
                SPEAKER_OFF: 'speaker-off',
                PLAY_TONE: 'play-tone',
                PLAY_SOUND: 'pre-sound',
                PLAY_MELODY: 'pre-melody',
                GET_BTN: 'get-btn',
                CHANGE_TEMPO: 'change-tempo',
                GET_LOGO: 'get-touch',
                GET_ACC: 'get-acc',
                GET_GESTURE: 'get-gesture',
                GET_DIRECTION: 'direction',
                GET_FIELD_STRENGTH: 'field-strength',
                GET_FIELD_STRENGTH_AXIS: 'field-axis-strength',
                GET_LIGHT_LEVEL: 'light-level',
                GET_TEMPERATURE: 'temperature',
                GET_SOUND_LEVEL: 'sound-level',
                SET_RADIO: 'radio-send',
                GET_RADIO: 'radio-receive',
                RADIO_ON: 'radio-on',
                RADIO_OFF: 'radio-off',
                SETTING_RADIO: 'radio-setting',
                SET_SERVO_MILLI: 'write-period',
                SET_SERVO_MICRO: 'write-micro-period',
                SET_SERVO_ANGLE: 'servo-write',
            };

            this.presetImage = [
                // Image.HEART
                '09090:99999:99999:09990:00900',
                // Image.HEART_SMALL,
                '00000:09090:09990:00900:00000',
                // Image.HAPPY,
                '00000:09090:00000:90009:09990',
                // Image.SMILE,
                '00000:00000:00000:90009:09990',
                // Image.SAD,
                '00000:09090:00000:09990:90009',
                // Image.CONFUSED,
                '00000:09090:00000:09090:90909',
                // Image.ANGRY,
                '90009:09090:00000:99999:90909',
                // Image.ASLEEP,
                '00000:99099:00000:09990:00000',
                // Image.SURPRISED,
                '09090:00000:00900:09090:00900',
                // Image.SILLY,
                '90009:00000:99999:00909:00999',
                // Image.FABULOUS,
                '99999:99099:00000:09090:09990',
                // Image.MEH,
                '09090:00000:00090:00900:09000',
                // Image.YES,
                '00000:00009:00090:90900:09000',
                // Image.NO,
                '90009:09090:00900:09090:90009',
                // Image.CLOCK1,
                '00090:00090:00900:00000:00000',
                // Image.CLOCK2,
                '00000:00990:00900:00000:00000',
                // Image.CLOCK3,
                '00000:00000:00999:00000:00000',
                // Image.CLOCK4,
                '00000:00000:00900:00990:00000',
                // Image.CLOCK5,
                '00000:00000:00900:00090:00090',
                // Image.CLOCK6,
                '00000:00000:00900:00900:00900',
                // Image.CLOCK7,
                '00000:00000:00900:09000:09000',
                // Image.CLOCK8,
                '00000:00000:00900:99000:00000',
                // Image.CLOCK9,
                '00000:00000:99900:00000:00000',
                // Image.CLOCK10,
                '00000:09900:00900:00000:00000',
                // Image.CLOCK11,
                '09000:09000:00900:00000:00000',
                // Image.CLOCK12,
                '00900:00900:00900:00000:00000',
                // Image.ARROW_N,
                '00900:09990:90909:00900:00900',
                // Image.ARROW_NE,
                '00999:00099:00909:09000:90000',
                // Image.ARROW_E,
                '00900:00090:99999:00090:00900',
                // Image.ARROW_SE,
                '90000:09000:00909:00099:00999',
                // Image.ARROW_S,
                '00900:00900:90909:09990:00900',
                // Image.ARROW_SW,
                '00009:00090:90900:99000:99900',
                // Image.ARROW_W,
                '00900:09000:99999:09000:00900',
                // Image.ARROW_NW,
                '99900:99000:90900:00090:00009',
                // Image.TRIANGLE,
                '00000:00900:09090:99999:00000',
                // Image.TRIANGLE_LEFT,
                '90000:99000:90900:90090:99999',
                // Image.CHESSBOARD,
                '09090:90909:09090:90909:09090',
                // Image.DIAMOND,
                '00900:09090:90009:09090:00900',
                // Image.DIAMOND_SMALL,
                '00000:00900:09090:00900:00000',
                // Image.SQUARE,
                '99999:90009:90009:90009:99999',
                // Image.SQUARE_SMALL,
                '00000:09990:09090:09990:00000',
                // Image.RABBIT,
                '90900:90900:99990:99090:99990',
                // Image.COW,
                '90009:90009:99999:09990:00900',
                // Image.MUSIC_CROTCHET,
                '00900:00900:00900:99900:99900',
                // Image.MUSIC_QUAVER,
                '00900:00990:00909:99900:99900',
                // Image.MUSIC_QUAVERS,
                '09999:09009:09009:99099:99099',
                // Image.PITCHFORK,
                '90909:90909:99999:00900:00900',
                // Image.XMAS,
                '00900:09990:00900:09990:99999',
                // Image.PACMAN,
                '099999:99090:99900:99990:09999',
                // Image.TARGET,
                '00900:09990:99099:09990:00900',
                // Image.TSHIRT,
                '99099:99999:09990:09990:09990',
                // Image.ROLLERSKATE,
                '00099:00099:99999:99999:09090',
                // Image.DUCK,
                '00990:99900:09999:09990:00000',
                // Image.HOUSE,
                '00900:09990:99999:09990:09090',
                // Image.TORTOISE,
                '00000:09990:99999:09090:00000',
                // Image.BUTTERFLY,
                '99099:99999:00900:99999:99099',
                // Image.STICKFIGURE,
                '00900:99999:00900:09090:90009',
                // Image.GHOST,
                '99999:90909:99999:99999:90909',
                // Image.SWORD,
                '00900:00900:00900:09990:00900',
                // Image.GIRAFFE,
                '99000:09000:09000:09990:09090',
                // Image.SKULL,
                '09990:90909:99999:09990:09990',
                // Image.UMBRELLA,
                '09990:99999:00900:90900:09900',
                // Image.SNAKE,
                '99000:99099:09090:09990:00000',
            ];
            this.id = '220301';
            this.url = 'http://microbit.org/ko/';
            this.imageName = 'microbit2lite.png';
            this.title = {
                en: 'Microbit',
                ko: '마이크로비트',
            };
            this.name = 'Microbit2lite';
            this.digitalPins = [
                ['P8', 8],
                ['P9', 9],
                ['P12', 12],
                ['P13', 13],
                ['P14', 14],
                ['P15', 15],
                ['P16', 16],
            ];
            this.analogPins = [
                ['P0', 0],
                ['P1', 1],
                ['P2', 2],
                ['P3', 3],
                ['P4', 4],
                ['P10', 10],
            ];
            this.majorPins = [
                ['P0', 0],
                ['P1', 1],
                ['P2', 2],
            ];
            this.ledRows = [
                [0, 0],
                [1, 1],
                [2, 2],
                [3, 3],
                [4, 4],
            ];
            this.defaultLed = [
                [0, 0, 0, 0, 0],
                [0, 9, 0, 9, 0],
                [0, 0, 0, 0, 0],
                [9, 0, 0, 0, 9],
                [0, 9, 9, 9, 0],
            ];
            this.blockMenuBlocks = [
                'microbit2lite_common_title',
                'microbit2lite_get_analog',
                'microbit2lite_set_analog',
                'microbit2lite_get_digital',
                'microbit2lite_set_digital',
                'microbit2lite_screen_toggle',
                'microbit2lite_set_led',
                'microbit2lite_get_led',
                'microbit2lite_show_preset_image',
                'microbit2lite_show_custom_image',
                'microbit2lite_show_string',
                'microbit2lite_reset_screen',
                'microbit2lite_radio_toggle',
                'microbit2lite_radio_setting',
                'microbit2lite_radio_send',
                'microbit2lite_radio_received',
                'microbit2lite_change_tempo',
                'microbit2lite_set_tone',
                'microbit2lite_play_preset_music',
                'microbit2lite_get_btn',
                'microbit2lite_get_acc',
                'microbit2lite_get_gesture',
                'microbit2lite_get_direction',
                'microbit2lite_get_field_strength_axis',
                'microbit2lite_get_light_level',
                'microbit2lite_get_temperature',
                'microbit2lite_set_servo',
                'microbit2lite_set_pwm',
                'microbit2lite_v2_title',
                'microbit2lite_get_logo',
                'microbit2lite_btn_event',
                'microbit2lite_speaker_toggle',
                'microbit2lite_play_sound_effect',
                'microbit2lite_get_sound_level',
            ];
            this.version = '2';
            this.firePressedBtnEventWithThrottle = _throttle(
                (pressedBtn) => {
                    Entry.engine.fireEventWithValue('microbit2lite_btn_pressed', pressedBtn);
                },
                EVENT_INTERVAL,
                { leading: true, trailing: false }
            );
        }
        _clamp(value, min, max) {
            if (value < min) {
                return min;
            } else if (value > max) {
                return max;
            }
            return value;
        }
        setZero() {
            this.commandStatus = {};
            return Entry.hwLite.serial.sendAsyncWithThrottle(this.functionKeys.RESET);
        }

        async initialHandshake() {
            const defaultCMD = `${this.functionKeys.LOCALDATA}`;
            const response = await Entry.hwLite.serial.sendAsyncWithThrottle(defaultCMD);
            if (response && response.indexOf('localdata') > -1) {
                const version = response.split(';')[1];
                if (!version) {
                    return;
                }
                const major = version[0];
                if (this.version !== major) {
                    this.version = major;
                }
            }

            if (this.version === '2') {
                Entry.addEventListener('run', this.handleBtnEventInterval.bind(this));
                Entry.addEventListener('beforeStop', () => {
                    clearInterval(this.btnEventIntervalId);
                });
            }

            return response;
        }

        handleBtnEventInterval() {
            this.btnEventIntervalId = setInterval(
                this.listenBtnPressedEvent.bind(this),
                this.duration
            );
        }

        async listenBtnPressedEvent() {
            if (Object.keys(this.commandStatus).length > 0) {
                return;
            }

            const defaultCMD = `${this.functionKeys.LOCALDATA};`;
            const response = await Entry.hwLite.serial.sendAsyncWithThrottle(defaultCMD);
            // const response = await this.getResponseWithSync(defaultCMD);

            // INFO: A,B 버튼이벤트 관련 로직
            const pressedBtn = response.split(':btn:')[1];
            if (pressedBtn) {
                this.firePressedBtnEventWithThrottle(pressedBtn);
            }
        }

        waitMilliSec(milli) {
            this.blockReq = true;
            setTimeout(() => {
                this.blockReq = false;
            }, milli);
        }

        generateCodeId(entityId, type, payload) {
            return `${entityId}-${type}${payload ? `-${payload}` : ''}`;
        }

        getCommandType(command) {
            if (typeof command === 'string' && command.indexOf(';') > -1) {
                return command.split(';')[0];
            } else {
                console.error("Error: microbit's response is not variable, ", command);
                Entry.hwLite.serial.handleConnectErrorInEngineRun();
            }
        }

        getResponse(response) {
            if (
                typeof response === 'string' &&
                response.indexOf(';') > -1 &&
                response.indexOf('ValueError') <= -1
            ) {
                return response.split(';')[1];
            } else if (response === 'command removed') {
                console.log("Microbit's command removed. Too many requests");
            } else {
                console.error("Error: microbit's response is not variable, ", response);
                Entry.hwLite.serial.handleConnectErrorInEngineRun();
            }
        }

        async getResponseWithSync(command) {
            if (!Entry.engine.isState('run')) {
                return;
            }
            const result = await Entry.hwLite.serial.sendAsyncWithThrottle(command);
            if (
                (!result || this.getCommandType(command) !== this.getCommandType(result)) &&
                // INFO : localdata 명령어는 우선순위가 낮으므로 반복하지 않음
                command !== `${this.functionKeys.LOCALDATA};`
            ) {
                if (!this.commandStatus[command]) {
                    this.commandStatus[command] = 1;
                    throw new Entry.Utils.AsyncError();
                } else if (this.commandStatus[command] <= this.retryLimitCnt) {
                    this.commandStatus[command]++;
                    throw new Entry.Utils.AsyncError();
                } else if (this.commandStatus[command] > this.retryLimitCnt) {
                    delete this.commandStatus[command];
                    return 'command removed';
                } else {
                    console.error('UnExpected Microbit command');
                }
            } else {
                delete this.commandStatus[command];
            }

            return result;
        }

        // 언어 적용
        setLanguage() {
            return {
                ko: {
                    template: {
                        microbit2lite_get_analog: '핀 %1 번 아날로그 값',
                        microbit2lite_set_analog: '핀 %1 에 아날로그 값 %2 를 출력하기 %3',
                        microbit2lite_get_digital: '핀 %1 번 디지털 값',
                        microbit2lite_set_digital: '핀 %1 에 디지털 값 %2 를 출력하기 %3',
                        microbit2lite_screen_toggle: 'LED 기능 %1 %2',
                        microbit2lite_set_led: 'LED의 X: %1 Y: %2 를 밝기 %3 (으)로 밝히기 %4',
                        microbit2lite_get_led: 'LED의 X: %1 Y: %2 밝기 값',
                        microbit2lite_show_preset_image: 'LED를 %1 모양으로 밝히기 %2',
                        microbit2lite_show_custom_image: 'LED %1 밝히기 %2',
                        microbit2lite_show_string: 'LED에 %1 을(를) 밝히기 %2',
                        microbit2lite_reset_screen: 'LED 모두 %1 %2',
                        microbit2lite_radio_toggle: '라디오 기능 %1 %2',
                        microbit2lite_radio_setting: '라디오 채널을 %1 (으)로 바꾸기 %2',
                        microbit2lite_radio_send: '라디오로 %1 송신하기 %2',
                        microbit2lite_radio_received: '라디오 수신 값',
                        microbit2lite_speaker_toggle: '스피커 기능 %1 %2',
                        microbit2lite_change_tempo: '연주 속도를 %1 박에 %2 BPM으로 정하기 %3',
                        microbit2lite_set_tone: '%1 음을 %2 박만큼 연주하기 %3',
                        microbit2lite_play_preset_music: '%1 음악을 연주하기 %2',
                        microbit2lite_play_sound_effect: '%1 효과음을 연주하기 %2',
                        microbit2lite_get_btn: '%1 버튼이 눌렸는가?',
                        microbit2lite_get_logo: '로고를 터치했는가?',
                        microbit2lite_get_gesture: '움직임이 %1 인가?',
                        microbit2lite_get_acc: '%1 의 가속도',
                        microbit2lite_btn_event: '%1 %2 버튼을 눌렀을 때',
                        microbit2lite_get_direction: '나침반 방향',
                        microbit2lite_get_field_strength_axis: '%1 의 자기장 세기 값',
                        microbit2lite_get_light_level: '빛 센서 값',
                        microbit2lite_get_temperature: '온도',
                        microbit2lite_get_sound_level: '마이크 소리 크기 값',
                        microbit2lite_set_servo: '핀 %1 에 서보 모터 각도를 %2 로 정하기 %3',
                        microbit2lite_set_pwm: '핀 %1 에 서보 펄스 폭을 %2 %3초로 정하기 %4',
                        microbit2lite_common_title: '마이크로비트 공통',
                        microbit2lite_v2_title: '마이크로비트 V2 전용',
                    },
                    Blocks: {
                        octave: '옥타브',
                        scalar: '스칼라',
                        xAxis: 'X축',
                        yAxis: 'Y축',
                        zAxis: 'Z축',
                        up: '위',
                        down: '아래',
                        left: '왼쪽',
                        right: '오른쪽',
                        face_up: '앞면',
                        face_down: '뒷면',
                        freefall: '자유 낙하',
                        '3g': '3G',
                        '6g': '6G',
                        '8g': '8G',
                        shake: '흔들림',
                        DADADADUM: '운명 교향곡',
                        ENTERTAINER: '엔터테이너',
                        PRELUDE: '바흐 프렐류드 1번',
                        ODE: '합창 교향곡',
                        NYAN: '냥캣',
                        RINGTONE: '벨소리',
                        FUNK: '펑크',
                        BLUES: '블루스',
                        BIRTHDAY: '생일 축하합니다',
                        WEDDING: '결혼 행진곡',
                        FUNERAL: '장례식 노래',
                        PUNCHLINE: '펀치라인',
                        PYTHON: '서커스',
                        BADDY: '악당',
                        CHASE: '추격전',
                        BA_DING: '동전 GET',
                        WAWAWAWAA: '실망',
                        JUMP_UP: '위로 점프',
                        JUMP_DOWN: '아래로 점프',
                        POWER_UP: '켜기',
                        POWER_DOWN: '끄기',
                        GIGGLE: '웃음',
                        HAPPY: '행복',
                        HELLO: '인사',
                        MYSTERIOUS: '신비로움',
                        SAD: '슬픔',
                        SLIDE: '슬라이드',
                        SOARING: '상승',
                        SPRING: '봄',
                        TWINKLE: '반짝반짝',
                        YAWN: '하품',
                        plot: '켜기',
                        unplot: '끄기',
                        on: '켜기',
                        off: '끄기',
                        remove: '지우기',
                        light: '밝히기',
                        microbit_2_HEART: '하트',
                        microbit_2_HEART_SMALL: '작은 하트',
                        microbit_2_HAPPY: '행복',
                        microbit_2_SMILE: '웃음',
                        microbit_2_SAD: '슬픔',
                        microbit_2_CONFUSED: '혼란',
                        microbit_2_ANGRY: '화남',
                        microbit_2_ASLEEP: '졸림',
                        microbit_2_SURPRISED: '놀람',
                        microbit_2_SILLY: '메롱',
                        microbit_2_FABULOUS: '환상적인',
                        microbit_2_MEH: '별로',
                        microbit_2_YES: '예스',
                        microbit_2_NO: '노',
                        microbit_2_TRIANGLE: '삼각형',
                        microbit_2_TRIANGLE_LEFT: '왼쪽 삼각형',
                        microbit_2_CHESSBOARD: '체스판',
                        microbit_2_DIAMOND: '다이아몬드',
                        microbit_2_DIAMOND_SMALL: '작은 다이아몬드',
                        microbit_2_SQUARE: '사각형',
                        microbit_2_SQUARE_SMALL: '작은 사각형',
                        microbit_2_RABBIT: '토끼',
                        microbit_2_COW: '소',
                        microbit_2_MUSIC_CROTCHET: '4분음표',
                        microbit_2_MUSIC_QUAVER: '8분음표',
                        microbit_2_MUSIC_QUAVERS: '8분음표 2개',
                        microbit_2_PITCHFORK: '쇠스랑',
                        microbit_2_XMAS: '크리스마스 트리',
                        microbit_2_PACMAN: '팩맨',
                        microbit_2_TARGET: '표적',
                        microbit_2_TSHIRT: '티셔츠',
                        microbit_2_ROLLERSKATE: '롤러스케이트',
                        microbit_2_DUCK: '오리',
                        microbit_2_HOUSE: '집',
                        microbit_2_TORTOISE: '거북이',
                        microbit_2_BUTTERFLY: '나비',
                        microbit_2_STICKFIGURE: '스틱맨',
                        microbit_2_GHOST: '유령',
                        microbit_2_SWORD: '칼',
                        microbit_2_GIRAFFE: '기린',
                        microbit_2_SKULL: '해골',
                        microbit_2_UMBRELLA: '우산',
                        microbit_2_SNAKE: '뱀',
                        microbit_2_CLOCK1: '1시',
                        microbit_2_CLOCK2: '2시',
                        microbit_2_CLOCK3: '3시',
                        microbit_2_CLOCK4: '4시',
                        microbit_2_CLOCK5: '5시',
                        microbit_2_CLOCK6: '6시',
                        microbit_2_CLOCK7: '7시',
                        microbit_2_CLOCK8: '8시',
                        microbit_2_CLOCK9: '9시',
                        microbit_2_CLOCK10: '10시',
                        microbit_2_CLOCK11: '11시',
                        microbit_2_CLOCK12: '12시',
                        microbit_2_ARROW_N: '북쪽',
                        microbit_2_ARROW_NE: '북동쪽',
                        microbit_2_ARROW_E: '동쪽',
                        microbit_2_ARROW_SE: '남동쪽',
                        microbit_2_ARROW_S: '남쪽',
                        microbit_2_ARROW_SW: '남서쪽',
                        microbit_2_ARROW_W: '서쪽',
                        microbit_2_ARROW_NW: '북서쪽',
                    },
                    Helper: {
                        microbit2lite_get_analog: '선택한 핀의 아날로그 값입니다. (0 ~ 1023)',
                        microbit2lite_set_analog:
                            '선택한 핀에 입력한 아날로그 값을 출력합니다. (0 ~ 1023)',
                        microbit2lite_get_digital: '선택한 핀의 디지털 값입니다. (0, 1)',
                        microbit2lite_set_digital:
                            '선택한 핀에 입력한 디지털 값을 출력합니다. (0, 1)',
                        microbit2lite_screen_toggle: 'LED 기능을 켜거나 끕니다.',
                        microbit2lite_set_led: 'X, Y 좌표로 선택한 LED를 선택한 밝기로 켭니다.',
                        microbit2lite_get_led: 'X, Y 좌표로 선택한 LED의 밝기 값입니다.',
                        microbit2lite_show_preset_image:
                            'LED에 미리 설정되어 있는 모양을 나타냅니다.',
                        microbit2lite_show_custom_image:
                            '블록에서 선택한 LED를 선택한 밝기로 밝힙니다. 한 번에 모든 LED를 조작할 수 있습니다.',
                        microbit2lite_show_string: '입력한 문자열을 LED에 차례대로 밝힙니다.',
                        microbit2lite_reset_screen: 'LED를 모두 지우거나 밝힙니다.',
                        microbit2lite_radio_toggle: '라디오 기능을 켜거나 끕니다.',
                        microbit2lite_radio_setting: '라디오 채널을 입력한 숫자로 바꿉니다.',
                        microbit2lite_radio_send: '라디오로 입력한 영문과 숫자를 송신합니다.',
                        microbit2lite_radio_received: '라디오로 수신된 값입니다.',
                        microbit2lite_speaker_toggle: '스피커 기능을 켜거나 끕니다.',
                        microbit2lite_change_tempo: '연주 속도를 선택한 박자와 BPM으로 정합니다.',
                        microbit2lite_set_tone:
                            '선택한 음을 선택한 박만큼 연주합니다. 1~5옥타브 사이의 음계를 선택할 수 있습니다.',
                        microbit2lite_play_preset_music: '미리 설정되어 있는 음악을 연주합니다.',
                        microbit2lite_play_sound_effect: '미리 설정되어 있는 효과음을 연주합니다.',
                        microbit2lite_get_btn: "선택한 버튼이 눌렸다면 '참'으로 판단합니다.",
                        microbit2lite_get_logo: "로고를 터치했다면 '참'으로 판단합니다.",
                        microbit2lite_get_gesture: "선택한 움직임이 감지되면 '참'으로 판단합니다.",
                        microbit2lite_get_acc:
                            '선택한 버튼이 눌리면 아래에 연결된 블록들을 실행합니다.',
                        microbit2lite_btn_event: '%1 %2 버튼을 눌렀을 때',
                        microbit2lite_get_direction: '나침반 방향 값입니다. (0~360) ',
                        microbit2lite_get_field_strength_axis: '선택한 축의 자기장 세기 값입니다.',
                        microbit2lite_get_light_level: '빛 센서의 값입니다.',
                        microbit2lite_get_temperature: '현재 온도 값입니다. (℃)',
                        microbit2lite_get_sound_level: '마이크 소리 크기 값입니다.',
                        microbit2lite_set_servo:
                            '선택한 핀에 서보 모터 각도를 입력한 값으로 정합니다.',
                        microbit2lite_set_pwm:
                            '선택한 핀의 서보 펄스폭을 선택한 시간으로 정합니다.',
                    },
                    Msgs: {
                        microbit2lite_compatible_error:
                            '마이크로비트 V2에서만 사용할 수 있는 블록입니다.',
                        microbit2lite_octave: '옥타브',
                    },
                },
                en: {
                    template: {
                        microbit2lite_get_analog: 'analog read pin %1',
                        microbit2lite_set_analog: 'Set analog pin %1 to %2 %3',
                        microbit2lite_get_digital: 'digital read pin %1',
                        microbit2lite_set_digital: 'digital write pin %1 to %2 %3',
                        microbit2lite_screen_toggle: '%1 LED screen %2',
                        microbit2lite_set_led: 'Light X: %1 Y:%2 LED to brightness %3 %4',
                        microbit2lite_get_led: 'brightness of X: %1 Y: %2 LED %3',
                        microbit2lite_show_preset_image: 'Light %1 icon on LED %2',
                        microbit2lite_show_custom_image: 'Light %1 on LED %2',
                        microbit2lite_show_string: 'Light string %1 on LED %2',
                        microbit2lite_reset_screen: '%1 all on LED %2',
                        microbit2lite_radio_toggle: '%1 radio %2',
                        microbit2lite_radio_setting: 'Change radio channel to %1 %2',
                        microbit2lite_radio_send: 'Send %1 to radio %2',
                        microbit2lite_radio_received: 'radio received value',
                        microbit2lite_speaker_toggle: '%1 speaker %2',
                        microbit2lite_change_tempo: 'Set tempo to %2 BPM per %1 beat %3',
                        microbit2lite_set_tone: 'Play melody %1 for %2 beat %3',
                        microbit2lite_play_preset_music: 'Play music %1 %2',
                        microbit2lite_play_sound_effect: 'Play sound %1 %2',
                        microbit2lite_get_btn: '%1 button pressed?',
                        microbit2lite_get_logo: 'logo touched?',
                        microbit2lite_get_gesture: 'Is the movement %1?',
                        microbit2lite_get_acc: 'acceleration value of %1',
                        microbit2lite_btn_event: '%1 When %2 button pressed',
                        microbit2lite_get_direction: 'compass direction',
                        microbit2lite_get_field_strength_axis:
                            'magnetic field strength value of %1 ',
                        microbit2lite_get_light_level: 'Light sensor value',
                        microbit2lite_get_temperature: 'temperature value',
                        microbit2lite_get_sound_level: 'microphone volume value',
                        microbit2lite_set_servo: 'Set servo pin %1 angle to %2 %3',
                        microbit2lite_set_pwm: 'set servo pin %1 pulse to %2 %3 %4',
                        microbit2lite_common_title: 'Common Blocks',
                        microbit2lite_v2_title: 'v2 Only',
                    },
                    Blocks: {
                        octave: 'octave',
                        scalar: 'scalar',
                        xAxis: 'X-axis',
                        yAxis: 'Y-axis',
                        zAxis: 'Z-axis',
                        up: 'up',
                        down: 'down',
                        left: 'left',
                        right: 'right',
                        face_up: 'face up',
                        face_down: 'face down',
                        freefall: 'freefall',
                        '3g': '3G',
                        '6g': '6G',
                        '8g': '8G',
                        shake: 'shake',
                        DADADADUM: 'Dadadadum',
                        ENTERTAINER: 'Entertainer',
                        PRELUDE: 'Prelude',
                        ODE: 'Ode',
                        NYAN: 'Nyan',
                        RINGTONE: 'Ringtone',
                        FUNK: 'Funk',
                        BLUES: 'Blues',
                        BIRTHDAY: 'Birthday',
                        WEDDING: 'Wedding',
                        FUNERAL: 'Funeral',
                        PUNCHLINE: 'Punchline',
                        PYTHON: 'Python',
                        BADDY: 'Baddy',
                        CHASE: 'Chase',
                        BA_DING: 'Coin',
                        WAWAWAWAA: 'Wawawawaa',
                        JUMP_UP: 'Jump up',
                        JUMP_DOWN: 'Jump down',
                        POWER_UP: 'Power up',
                        POWER_DOWN: 'Power down',
                        GIGGLE: 'giggle',
                        HAPPY: 'happy',
                        HELLO: 'hello',
                        MYSTERIOUS: 'mysterious',
                        SAD: 'sad',
                        SLIDE: 'slide',
                        SOARING: 'soaring',
                        SPRING: 'spring',
                        TWINKLE: 'twinkle',
                        YAWN: 'yawn',
                        plot: 'plot',
                        unplot: 'unplot',
                        on: 'Turn on',
                        off: 'Turn off',
                        microbit_2_HEART: 'heart',
                        microbit_2_HEART_SMALL: 'small heart',
                        microbit_2_HAPPY: 'happy',
                        microbit_2_SMILE: 'smile',
                        microbit_2_SAD: 'sad',
                        microbit_2_CONFUSED: 'confused',
                        microbit_2_ANGRY: 'angry',
                        microbit_2_ASLEEP: 'asleep',
                        microbit_2_SURPRISED: 'surprised',
                        microbit_2_SILLY: 'silly',
                        microbit_2_FABULOUS: 'fabulous',
                        microbit_2_MEH: 'meh',
                        microbit_2_YES: 'yes',
                        microbit_2_NO: 'no',
                        microbit_2_TRIANGLE: 'triangle',
                        microbit_2_TRIANGLE_LEFT: 'left triangle',
                        microbit_2_CHESSBOARD: 'chessboard',
                        microbit_2_DIAMOND: 'diamond',
                        microbit_2_DIAMOND_SMALL: 'small diamond',
                        microbit_2_SQUARE: 'square',
                        microbit_2_SQUARE_SMALL: 'small square',
                        microbit_2_RABBIT: 'rabbit',
                        microbit_2_COW: 'cow',
                        microbit_2_MUSIC_CROTCHET: 'crotchet',
                        microbit_2_MUSIC_QUAVER: 'quaver',
                        microbit_2_MUSIC_QUAVERS: 'quavers',
                        microbit_2_PITCHFORK: 'pitchfork',
                        microbit_2_XMAS: 'xmas',
                        microbit_2_PACMAN: 'pacman',
                        microbit_2_TARGET: 'target',
                        microbit_2_TSHIRT: 'tshirt',
                        microbit_2_ROLLERSKATE: 'rollerskate',
                        microbit_2_DUCK: 'duck',
                        microbit_2_HOUSE: 'house',
                        microbit_2_TORTOISE: 'tortoise',
                        microbit_2_BUTTERFLY: 'butterfly',
                        microbit_2_STICKFIGURE: 'stickfigure',
                        microbit_2_GHOST: 'ghost',
                        microbit_2_SWORD: 'sword',
                        microbit_2_GIRAFFE: 'giraffe',
                        microbit_2_SKULL: 'skull',
                        microbit_2_UMBRELLA: 'umbrella',
                        microbit_2_SNAKE: 'snake',
                        microbit_2_CLOCK1: "1 o'clock",
                        microbit_2_CLOCK2: "2 o'clock",
                        microbit_2_CLOCK3: "3 o'clock",
                        microbit_2_CLOCK4: "4 o'clock",
                        microbit_2_CLOCK5: "5 o'clock",
                        microbit_2_CLOCK6: "6 o'clock",
                        microbit_2_CLOCK7: "7 o'clock",
                        microbit_2_CLOCK8: "8 o'clock",
                        microbit_2_CLOCK9: "9 o'clock",
                        microbit_2_CLOCK10: "10 o'clock",
                        microbit_2_CLOCK11: "11 o'clock",
                        microbit_2_CLOCK12: "12 o'clock",
                        microbit_2_ARROW_N: 'north',
                        microbit_2_ARROW_NE: 'northeast',
                        microbit_2_ARROW_E: 'east',
                        microbit_2_ARROW_SE: 'southeast',
                        microbit_2_ARROW_S: 'south',
                        microbit_2_ARROW_SW: 'southwest',
                        microbit_2_ARROW_W: 'west',
                        microbit_2_ARROW_NW: 'northwest',
                    },
                    Helper: {
                        microbit2lite_get_analog:
                            'Reads an analog signal from the pin you choose. (0 ~ 1023)',
                        microbit2lite_set_analog:
                            'Writes an analog signal to the pin you choose. (0 ~ 1023)',
                        microbit2lite_get_digital:
                            'Reads a digital signal from the pin you choose. (0 ~ 1023)',
                        microbit2lite_set_digital:
                            'Writes a digital signal to the pin you choose. (0 ~ 1)',
                        microbit2lite_screen_toggle: 'Turns on or turns off the LED screen.',
                        microbit2lite_set_led:
                            'Lights the selected LED with X and Y coordinates to the selected brightness.',
                        microbit2lite_get_led:
                            'Brightness of the selected LED with X and Y coordinates',
                        microbit2lite_show_preset_image:
                            'Lights the selected icon on the LED screen.',
                        microbit2lite_show_custom_image:
                            'Lights the selected LED and brightness. You can set all the LEDs at once.',
                        microbit2lite_show_string:
                            'Lights the entered string in order on the LED screen.',
                        microbit2lite_reset_screen: 'Clears or lights all LED screen.',
                        microbit2lite_radio_toggle: 'Turns on or turns off the radio.',
                        microbit2lite_radio_setting:
                            'Changes the radio channel to the number entered.',
                        microbit2lite_radio_send:
                            'Sends the number or the string entered to the radio.',
                        microbit2lite_radio_received: 'Value received by the radio.',
                        microbit2lite_speaker_toggle: 'Turns on or turns off the speaker.',
                        microbit2lite_change_tempo: 'Sets the tempo to the entered beat and BPM.',
                        microbit2lite_set_tone:
                            'Plays the entered melody for the entered beat. You can choose a scale between 1 and 5 octaves.',
                        microbit2lite_play_preset_music: 'Plays preset music.',
                        microbit2lite_play_sound_effect: 'Plays preset sound.',
                        microbit2lite_get_btn:
                            "If the selected button is pressed, it is judged as 'True'.",
                        microbit2lite_get_logo: "If the logo is touched, it is judged as 'True'.",
                        microbit2lite_get_gesture:
                            "When the selected movement is detected, it is judged as 'True'.",
                        microbit2lite_get_acc: 'The acceleration value of the selected axis.',
                        microbit2lite_btn_event:
                            'When the selected button is pressed, the connected blocks below will run',
                        microbit2lite_get_direction: 'The compass direction value. (0~360)',
                        microbit2lite_get_field_strength_axis:
                            'The magnetic field strength value of the selected axis.',
                        microbit2lite_get_light_level: 'The value of the light sensor.',
                        microbit2lite_get_temperature: 'The current temperature value. (℃)',
                        microbit2lite_get_sound_level: 'The microphone volume value.',
                        microbit2lite_set_servo:
                            'Sets the servo motor angle to the entered value on the selected pin.',
                        microbit2lite_set_pwm:
                            'Sets the servo pulse to the entered time on the selected pin.',
                    },
                    Msgs: {
                        microbit2lite_compatible_error:
                            'The corresponding block is not compatible to Microbit V1',
                        microbit2lite_octave: 'Octave',
                    },
                },
                jp: {
                    template: {
                        microbit2lite_get_analog: 'ピン %1 のアナログ値',
                        microbit2lite_set_analog: 'ピン %1 にアナログ値 %2 を出力する %3',
                        microbit2lite_get_digital: 'ピン %1 のデジタル値',
                        microbit2lite_set_digital: 'ピン %1 に デジタル値 %2 を出力する %3',
                        microbit2lite_screen_toggle: 'LED機能を %1 %2',
                        microbit2lite_set_led: 'LEDの X: %1 Y: %2 を明るさ %3 にする %4',
                        microbit2lite_get_led: 'LEDの X: %1 Y: %2 の明るさ',
                        microbit2lite_show_preset_image: 'LEDに %1 アイコンを表示する %2',
                        microbit2lite_show_custom_image: 'LED %1 を表示する %2',
                        microbit2lite_show_string: 'LEDに %1 を表示する %2',
                        microbit2lite_reset_screen: 'LEDを全部消す %1',
                        microbit2lite_radio_toggle: 'ラジオ機能を %1 %2',
                        microbit2lite_radio_setting: 'ラジオチャンネルを %1 に変更する %2',
                        microbit2lite_radio_send: 'ラジオに %1 送信する %2',
                        microbit2lite_radio_received: 'ラジオ受信値',
                        microbit2lite_speaker_toggle: 'スピーカー機能 %1 %2',
                        microbit2lite_change_tempo: 'テンポを %1 拍に %2 BPMにする %3',
                        microbit2lite_set_tone: '%1 音を %2 拍演奏する %3',
                        microbit2lite_play_preset_music: '%1 音楽を演奏する %2',
                        microbit2lite_play_sound_effect: '%1 効果音を演奏する %2',
                        microbit2lite_get_btn: '%1 ボタンが押したkか?',
                        microbit2lite_get_logo: 'ロゴをタッチしたじか?',
                        microbit2lite_get_gesture: '動きが %1 なのか?',
                        microbit2lite_get_acc: '%1 の加速度',
                        microbit2lite_get_direction: 'コンパス方向',
                        microbit2lite_get_field_strength_axis: '%1 の磁場強度',
                        microbit2lite_get_light_level: '光センサー値',
                        microbit2lite_get_temperature: '温度値',
                        microbit2lite_get_sound_level: 'マイク音の大きさ',
                        microbit2lite_set_servo:
                            'ピン %1 に サーボモーターの角度を %2 に設定する %3',
                        microbit2lite_set_pwm: 'ピン %1 にサーボパルス幅を2にする %4',
                        microbit2lite_common_title: 'Common Blocks',
                        microbit2lite_v2_title: 'v2 Only',
                    },
                    Blocks: {
                        octave: 'オクターブ',
                        scalar: 'スカラー',
                        xAxis: 'X軸',
                        yAxis: 'Y軸',
                        zAxis: 'Z軸',
                        up: '上',
                        down: '下',
                        left: '右',
                        right: '左',
                        face_up: '全面',
                        face_down: '後面',
                        freefall: '自由落下',
                        '3g': '3G',
                        '6g': '6G',
                        '8g': '8G',
                        shake: '振れ',
                        DADADADUM: '運命交響曲',
                        ENTERTAINER: 'エンターネーター',
                        PRELUDE: 'バッハ·プレリュード第1番',
                        ODE: '合唱交響曲',
                        NYAN: 'ニャンキャット',
                        RINGTONE: '着信メロディ',
                        FUNK: 'ファンク',
                        BLUES: 'ブルース',
                        BIRTHDAY: 'お誕生日おめでとう',
                        WEDDING: '結婚行進曲',
                        FUNERAL: '葬式の歌',
                        PUNCHLINE: 'パンチライン',
                        PYTHON: 'サーカス',
                        BADDY: '悪党',
                        CHASE: '追撃戦',
                        BA_DING: 'コインGET',
                        WAWAWAWAA: 'ガッカリ',
                        JUMP_UP: '上にジャンプ',
                        JUMP_DOWN: '下にジャンプ',
                        POWER_UP: '点ける',
                        POWER_DOWN: '消す',
                        GIGGLE: '笑い',
                        HAPPY: '幸せ',
                        HELLO: '挨拶',
                        MYSTERIOUS: '神秘的',
                        SAD: '悲しみ',
                        SLIDE: 'スライド',
                        SOARING: '上昇',
                        SPRING: '春',
                        TWINKLE: 'キラキラ',
                        YAWN: 'あくび',
                        plot: 'オンにする',
                        unplot: 'オフにする',
                        on: 'オンにする',
                        off: 'オフにする',
                        microbit_2_HEART: 'ハート',
                        microbit_2_HEART_SMALL: '小さなハート',
                        microbit_2_HAPPY: '幸せ',
                        microbit_2_SMILE: '笑い',
                        microbit_2_SAD: '悲しみ',
                        microbit_2_CONFUSED: '混乱',
                        microbit_2_ANGRY: '怒り',
                        microbit_2_ASLEEP: '眠気',
                        microbit_2_SURPRISED: '驚き',
                        microbit_2_SILLY: '間抜け',
                        microbit_2_FABULOUS: '幻想的な',
                        microbit_2_MEH: '別に',
                        microbit_2_YES: 'イエス',
                        microbit_2_NO: 'ノー',
                        microbit_2_TRIANGLE: '三角形',
                        microbit_2_TRIANGLE_LEFT: '左三角形',
                        microbit_2_CHESSBOARD: 'チェスパン',
                        microbit_2_DIAMOND: 'ダイヤモンド',
                        microbit_2_DIAMOND_SMALL: '小さなダイヤモンド',
                        microbit_2_SQUARE: '四角形',
                        microbit_2_SQUARE_SMALL: '小さな四角形',
                        microbit_2_RABBIT: 'ウサギ',
                        microbit_2_COW: '牛',
                        microbit_2_MUSIC_CROTCHET: '4分音符',
                        microbit_2_MUSIC_QUAVER: '8分音符',
                        microbit_2_MUSIC_QUAVERS: '8分音符2個',
                        microbit_2_PITCHFORK: 'フォーク',
                        microbit_2_XMAS: 'クリスマスツリー',
                        microbit_2_PACMAN: 'パックマン',
                        microbit_2_TARGET: '標的',
                        microbit_2_TSHIRT: 'Tシャツ',
                        microbit_2_ROLLERSKATE: 'ローラースケート',
                        microbit_2_DUCK: 'アヒル',
                        microbit_2_HOUSE: '家',
                        microbit_2_TORTOISE: '亀',
                        microbit_2_BUTTERFLY: '蝶',
                        microbit_2_STICKFIGURE: 'スティックマン',
                        microbit_2_GHOST: '幽霊',
                        microbit_2_SWORD: 'ナイフ',
                        microbit_2_GIRAFFE: 'キリン',
                        microbit_2_SKULL: '骸骨',
                        microbit_2_UMBRELLA: '傘',
                        microbit_2_SNAKE: '蛇',
                        microbit_2_CLOCK1: '1時',
                        microbit_2_CLOCK2: '2時',
                        microbit_2_CLOCK3: '3時',
                        microbit_2_CLOCK4: '4時',
                        microbit_2_CLOCK5: '5時',
                        microbit_2_CLOCK6: '6時',
                        microbit_2_CLOCK7: '7時',
                        microbit_2_CLOCK8: '8時',
                        microbit_2_CLOCK9: '9時',
                        microbit_2_CLOCK10: '10時',
                        microbit_2_CLOCK11: '11時',
                        microbit_2_CLOCK12: '12時',
                        microbit_2_ARROW_N: '北',
                        microbit_2_ARROW_NE: '北東',
                        microbit_2_ARROW_E: '東',
                        microbit_2_ARROW_SE: '南東',
                        microbit_2_ARROW_S: '南',
                        microbit_2_ARROW_SW: '南西',
                        microbit_2_ARROW_W: '西',
                        microbit_2_ARROW_NW: '北西',
                    },
                    Helper: {
                        microbit2lite_get_analog: '選択したピンのアナログ値です。(0 ~ 1023)',
                        microbit2lite_set_analog:
                            '選択したピンに入力したアナログ値を出力します。(0 ~ 1023)',
                        microbit2lite_get_digital: '選択したピンのデジタル値です。(0, 1)',
                        microbit2lite_set_digital:
                            '選択したピンに入力したデジタル値を出力します。(0, 1)',
                        microbit2lite_screen_toggle: 'LED機能をオンまたはオフにします。',
                        microbit2lite_set_led: 'X、Y座標で選択したLEDを選択した明るさで点けます。',
                        microbit2lite_get_led: 'X、Y座標で選択したLEDの明るさです。',
                        microbit2lite_show_preset_image: 'LEDに先に設定されていた形で点けます。',
                        microbit2lite_show_custom_image:
                            'ブロックで選択したLEDを選択した明るさで点けます。 一度にすべてのLEDを操作できます。',
                        microbit2lite_show_string: '入力した文字列をLEDに順番に表示します。',
                        microbit2lite_reset_screen: 'LEDに表示したものをすべて消します。',
                        microbit2lite_radio_toggle: 'ラジオ機能をオンまたはオフにします。',
                        microbit2lite_radio_setting: 'ラジオチャンネルを入力した数字に変えます。',
                        microbit2lite_radio_send: 'ラジオで入力した英数字を送信します。',
                        microbit2lite_radio_received: 'ラジオで受信した値です。',
                        microbit2lite_speaker_toggle: 'スピーカー機能をオンまたはオフにします。',
                        microbit2lite_change_tempo: 'テンポを選択した拍子とBPMで設定します。',
                        microbit2lite_set_tone:
                            '選択した音を選択した拍子で演奏します。 1~5オクターブ間の音階を選べます。',
                        microbit2lite_play_preset_music: '先に設定されていた音楽を演奏します。',
                        microbit2lite_play_sound_effect: '先に設定されていた効果音を演奏します。',
                        microbit2lite_get_btn: '選択したボタンが押されたら、「True」と判断します。',
                        microbit2lite_get_logo: 'ロゴをタッチすると、「True」と判断します。',
                        microbit2lite_get_gesture:
                            '選択した動きを感知したら、「True」と判断します。',
                        microbit2lite_get_acc: '選択した軸の加速度値です。',
                        microbit2lite_get_direction: 'コンパス方向の値です。 (0~360)',
                        microbit2lite_get_field_strength_axis: '選択した軸の磁場強度の値です。',
                        microbit2lite_get_light_level: '光センサーの値です。',
                        microbit2lite_get_temperature: '現在の温度です。 (℃)',
                        microbit2lite_get_sound_level: 'マイクボリュームの値です。',
                        microbit2lite_set_servo:
                            '選択したピンにサーボモーターの角度を入力した値で設定します。',
                        microbit2lite_set_pwm: '選択したピンのサーボパルス幅を選択した値にします。',
                    },
                    Msgs: {
                        microbit2lite_compatible_error:
                            '対応するブロックはMicrobitV1と互換性がありません',
                        microbit2lite_octave: 'Octave',
                    },
                },
            };
        }

        getBlocks = function () {
            return {
                microbit2lite_common_title: {
                    skeleton: 'basic_text',
                    color: EntryStatic.colorSet.common.TRANSPARENT,
                    fontColor: '#333333',
                    params: [
                        {
                            type: 'Text',
                            text: Lang.template.microbit2lite_common_title,
                            color: '#333333',
                            align: 'center',
                        },
                    ],
                    def: {
                        type: 'microbit2lite_common_title',
                    },
                    class: 'microbit2lite_title',
                    isNotFor: ['Microbit2lite'],
                    events: {},
                },

                microbit2lite_get_analog: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: this.analogPins,
                            value: 0,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    events: {},
                    class: 'microbit2litePin',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_analog',
                    },
                    paramsKeyMap: {
                        VALUE: 0,
                    },
                    func: async (sprite, script) => {
                        const value = script.getValue('VALUE');
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_ANALOG};${value}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_set_analog: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: this.analogPins,
                            value: 0,
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
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2litePin',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_set_analog',
                    },
                    paramsKeyMap: {
                        PIN: 0,
                        VALUE: 1,
                    },
                    func: async (sprite, script) => {
                        const pin = script.getValue('PIN');
                        const value = Math.round(
                            this._clamp(script.getNumberValue('VALUE'), 0, 1023)
                        );

                        const parsedPayload = `${pin};${value}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_ANALOG};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_get_digital: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: this.digitalPins,
                            value: 8,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    events: {},
                    class: 'microbit2litePin',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_digital',
                    },
                    paramsKeyMap: { VALUE: 0 },
                    func: async (sprite, script) => {
                        const value = script.getValue('VALUE');
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_DIGITAL};${value}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_set_digital: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: this.digitalPins,
                            value: 8,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Dropdown',
                            options: [
                                [0, 0],
                                [1, 1],
                            ],
                            value: 0,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2litePin',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_set_digital',
                    },
                    paramsKeyMap: { PIN: 0, VALUE: 1 },
                    func: async (sprite, script) => {
                        const pin = script.getValue('PIN');
                        const value = script.getValue('VALUE');
                        const parsedPayload = `${pin};${value}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_DIGITAL};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_screen_toggle: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.on, this.functionKeys.DISPLAY_ON],
                                [Lang.Blocks.off, this.functionKeys.DISPLAY_OFF],
                            ],
                            value: this.functionKeys.DISPLAY_ON,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteLed',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_screen_toggle',
                    },
                    paramsKeyMap: { VALUE: 0 },
                    func: async (sprite, script) => {
                        const command = script.getField('VALUE');

                        const response = await this.getResponseWithSync(`${command};`);
                        return this.getResponse(response);
                    },
                },
                microbit2lite_set_led: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Block',
                            accept: 'string',
                            defaultType: 'number',
                            value: 0,
                        },
                        {
                            type: 'Block',
                            accept: 'string',
                            defaultType: 'number',
                            value: 0,
                        },
                        {
                            type: 'Block',
                            accept: 'string',
                            defaultType: 'number',
                            value: 9,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteLed',
                    isNotFor: ['Microbit2lite'],
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
                            {
                                type: 'text',
                                params: ['9'],
                            },
                        ],
                        type: 'microbit2lite_set_led',
                    },
                    paramsKeyMap: {
                        X: 0,
                        Y: 1,
                        VALUE: 2,
                    },
                    func: async (sprite, script) => {
                        const value = script.getNumberValue('VALUE');
                        const x = script.getNumberValue('X');
                        const y = script.getNumberValue('Y');
                        if (x < 0 || y < 0 || x > 4 || y > 4 || value < 0 || value > 9) {
                            return;
                        }

                        const parsedPayload = `${x};${y};${value}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_LED};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_get_led: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [
                        {
                            type: 'Block',
                            accept: 'string',
                            defaultType: 'number',
                            value: 0,
                        },
                        {
                            type: 'Block',
                            accept: 'string',
                            defaultType: 'number',
                            value: 0,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteLed',
                    isNotFor: ['Microbit2lite'],
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
                        type: 'microbit2lite_get_led',
                    },
                    paramsKeyMap: {
                        X: 0,
                        Y: 1,
                    },
                    func: async (sprite, script) => {
                        const x = script.getNumberValue('X');
                        const y = script.getNumberValue('Y');
                        if (x < 0 || y < 0 || x > 4 || y > 4) {
                            return -1;
                        }
                        const parsedPayload = `${x};${y}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_LED};${parsedPayload}`
                        );
                        const parsedResponse = this.getResponse(response);

                        if (parsedResponse == 0) {
                            return 0;
                        } else if (parsedResponse == 1) {
                            return 1;
                        }

                        return Math.round(Math.log2(parsedResponse * 2));
                    },
                },
                microbit2lite_show_preset_image: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.microbit_2_HEART, 0],
                                [Lang.Blocks.microbit_2_HEART_SMALL, 1],
                                [Lang.Blocks.microbit_2_HAPPY, 2],
                                [Lang.Blocks.microbit_2_SMILE, 3],
                                [Lang.Blocks.microbit_2_SAD, 4],
                                [Lang.Blocks.microbit_2_CONFUSED, 5],
                                [Lang.Blocks.microbit_2_ANGRY, 6],
                                [Lang.Blocks.microbit_2_ASLEEP, 7],
                                [Lang.Blocks.microbit_2_SURPRISED, 8],
                                [Lang.Blocks.microbit_2_SILLY, 9],
                                [Lang.Blocks.microbit_2_FABULOUS, 10],
                                [Lang.Blocks.microbit_2_MEH, 11],
                                [Lang.Blocks.microbit_2_YES, 12],
                                [Lang.Blocks.microbit_2_NO, 13],
                                [Lang.Blocks.microbit_2_TRIANGLE, 34],
                                [Lang.Blocks.microbit_2_TRIANGLE_LEFT, 35],
                                [Lang.Blocks.microbit_2_CHESSBOARD, 36],
                                [Lang.Blocks.microbit_2_DIAMOND, 37],
                                [Lang.Blocks.microbit_2_DIAMOND_SMALL, 38],
                                [Lang.Blocks.microbit_2_SQUARE, 39],
                                [Lang.Blocks.microbit_2_SQUARE_SMALL, 40],
                                [Lang.Blocks.microbit_2_RABBIT, 41],
                                [Lang.Blocks.microbit_2_COW, 42],
                                [Lang.Blocks.microbit_2_MUSIC_CROTCHET, 43],
                                [Lang.Blocks.microbit_2_MUSIC_QUAVER, 44],
                                [Lang.Blocks.microbit_2_MUSIC_QUAVERS, 45],
                                [Lang.Blocks.microbit_2_PITCHFORK, 46],
                                [Lang.Blocks.microbit_2_XMAS, 47],
                                [Lang.Blocks.microbit_2_PACMAN, 48],
                                [Lang.Blocks.microbit_2_TARGET, 49],
                                [Lang.Blocks.microbit_2_TSHIRT, 50],
                                [Lang.Blocks.microbit_2_ROLLERSKATE, 51],
                                [Lang.Blocks.microbit_2_DUCK, 52],
                                [Lang.Blocks.microbit_2_HOUSE, 53],
                                [Lang.Blocks.microbit_2_TORTOISE, 54],
                                [Lang.Blocks.microbit_2_BUTTERFLY, 55],
                                [Lang.Blocks.microbit_2_STICKFIGURE, 56],
                                [Lang.Blocks.microbit_2_GHOST, 57],
                                [Lang.Blocks.microbit_2_SWORD, 58],
                                [Lang.Blocks.microbit_2_GIRAFFE, 59],
                                [Lang.Blocks.microbit_2_SKULL, 60],
                                [Lang.Blocks.microbit_2_UMBRELLA, 61],
                                [Lang.Blocks.microbit_2_SNAKE, 62],
                                [Lang.Blocks.microbit_2_CLOCK1, 14],
                                [Lang.Blocks.microbit_2_CLOCK2, 15],
                                [Lang.Blocks.microbit_2_CLOCK3, 16],
                                [Lang.Blocks.microbit_2_CLOCK4, 17],
                                [Lang.Blocks.microbit_2_CLOCK5, 18],
                                [Lang.Blocks.microbit_2_CLOCK6, 19],
                                [Lang.Blocks.microbit_2_CLOCK7, 20],
                                [Lang.Blocks.microbit_2_CLOCK8, 21],
                                [Lang.Blocks.microbit_2_CLOCK9, 22],
                                [Lang.Blocks.microbit_2_CLOCK10, 23],
                                [Lang.Blocks.microbit_2_CLOCK11, 24],
                                [Lang.Blocks.microbit_2_CLOCK12, 25],
                                [Lang.Blocks.microbit_2_ARROW_N, 26],
                                [Lang.Blocks.microbit_2_ARROW_NE, 27],
                                [Lang.Blocks.microbit_2_ARROW_E, 28],
                                [Lang.Blocks.microbit_2_ARROW_SE, 29],
                                [Lang.Blocks.microbit_2_ARROW_S, 30],
                                [Lang.Blocks.microbit_2_ARROW_SW, 31],
                                [Lang.Blocks.microbit_2_ARROW_W, 32],
                                [Lang.Blocks.microbit_2_ARROW_NW, 33],
                            ],
                            value: 0,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteLed',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_show_preset_image',
                    },
                    paramsKeyMap: {
                        VALUE: 0,
                    },
                    func: async (sprite, script) => {
                        const value = this._clamp(script.getNumberValue('VALUE'), 0, 62);
                        const parsedPayload = `${this.presetImage[value]}`;
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_CUSTOM_IMAGE};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_show_custom_image: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Led2',
                            value: [
                                [0, 0, 0, 0, 0],
                                [0, 9, 0, 9, 0],
                                [0, 0, 0, 0, 0],
                                [9, 0, 0, 0, 9],
                                [0, 9, 9, 9, 0],
                            ],
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteLed',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_show_custom_image',
                    },
                    paramsKeyMap: {
                        VALUE: 0,
                    },
                    func: async (sprite, script) => {
                        const value = script.getField('VALUE');
                        const processedValue = [];
                        for (const i in value) {
                            processedValue[i] = value[i].join();
                        }
                        const parsedPayload = `${processedValue.join(':').replace(/,/gi, '')}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_CUSTOM_IMAGE};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_show_string: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Block',
                            accept: 'string',
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteLed',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        params: [
                            {
                                type: 'text',
                                params: ['Hello!'],
                                accept: 'string',
                            },
                        ],
                        type: 'microbit2lite_show_string',
                    },
                    paramsKeyMap: {
                        VALUE: 0,
                    },
                    func: async (sprite, script) => {
                        let payload = script.getStringValue('VALUE');
                        payload = payload.replace(
                            /[^A-Za-z0-9_\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\\\{\}\[\]\'\"\;\:\<\,\>\.\?\/\s]/gim,
                            ''
                        );
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_STRING};${payload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_reset_screen: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.remove, 'remove'],
                                [Lang.Blocks.light, 'light'],
                            ],
                            value: 'remove',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteLed',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_reset_screen',
                    },
                    paramsKeyMap: { LED_STATUS: 0 },
                    func: async (sprite, script) => {
                        const ledStatus = script.getField('LED_STATUS');
                        let response;
                        if (ledStatus === 'light') {
                            const defaultLed = '99999:99999:99999:99999:99999';
                            response = await this.getResponseWithSync(
                                `${this.functionKeys.SET_CUSTOM_IMAGE};${defaultLed}`
                            );
                        } else {
                            response = await this.getResponseWithSync(
                                `${this.functionKeys.RESET_SCREEN};`
                            );
                        }
                        return this.getResponse(response);
                    },
                },
                microbit2lite_radio_toggle: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.on, this.functionKeys.RADIO_ON],
                                [Lang.Blocks.off, this.functionKeys.RADIO_OFF],
                            ],
                            value: this.functionKeys.RADIO_ON,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteRadio',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_radio_toggle',
                    },
                    paramsKeyMap: { VALUE: 0 },
                    func: async (sprite, script) => {
                        const command = script.getField('VALUE');

                        const response = await this.getResponseWithSync(`${command};`);
                        return this.getResponse(response);
                    },
                },
                microbit2lite_radio_setting: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Block',
                            accept: 'string',
                            defaultType: 'number',
                            value: 7,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteRadio',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_radio_setting',
                    },
                    paramsKeyMap: { RATE: 0, CHANNEL: 1 },
                    func: async (sprite, script) => {
                        if (!Entry.Utils.isNumber(script.getNumberValue('CHANNEL'))) {
                            return;
                        }
                        const channel = Math.round(
                            this._clamp(script.getNumberValue('CHANNEL'), 0, 83)
                        );

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SETTING_RADIO};${channel}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_radio_send: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Block',
                            accept: 'string',
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteRadio',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_radio_send',
                    },
                    paramsKeyMap: { VALUE: 0 },
                    func: async (sprite, script) => {
                        const value = script.getStringValue('VALUE');

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_RADIO};${value}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_radio_received: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [],
                    events: {},
                    class: 'microbit2liteRadio',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_radio_received',
                    },
                    paramsKeyMap: {},
                    func: async (sprite, script) => {
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_RADIO};`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_change_tempo: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
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
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteSound',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        params: [
                            {
                                type: 'text',
                                params: ['4'],
                            },
                            {
                                type: 'text',
                                params: ['120'],
                            },
                        ],
                        type: 'microbit2lite_change_tempo',
                    },
                    paramsKeyMap: {
                        BEAT: 0,
                        BPM: 1,
                    },
                    func: async (sprite, script) => {
                        const beat = Math.round(this._clamp(script.getNumberValue('BEAT'), 0, 4));
                        const bpm = Math.round(this._clamp(script.getNumberValue('BPM'), 1, 230));

                        const parsedPayload = `${beat};${bpm}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.CHANGE_TEMPO};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_set_tone: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'MusicScale',
                        },
                        {
                            type: 'Dropdown',
                            options: [
                                ['4', 16],
                                ['2', 8],
                                ['1', 4],
                                ['1/2', 2],
                                ['1/4', 1],
                            ],
                            value: 4,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteSound',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_set_tone',
                    },
                    paramsKeyMap: {
                        SCALE: 0,
                        NOTE: 1,
                    },
                    func: async (sprite, script) => {
                        const scale = script.getField('SCALE');
                        const note = script.getField('NOTE');
                        const parsedPayload = `${scale}:${note}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.PLAY_TONE};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_play_preset_music: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.DADADADUM, 0],
                                [Lang.Blocks.ENTERTAINER, 1],
                                [Lang.Blocks.PRELUDE, 2],
                                [Lang.Blocks.ODE, 3],
                                [Lang.Blocks.NYAN, 4],
                                [Lang.Blocks.RINGTONE, 5],
                                [Lang.Blocks.FUNK, 6],
                                [Lang.Blocks.BLUES, 7],
                                [Lang.Blocks.BIRTHDAY, 8],
                                [Lang.Blocks.WEDDING, 9],
                                [Lang.Blocks.FUNERAL, 10],
                                [Lang.Blocks.PUNCHLINE, 11],
                                [Lang.Blocks.PYTHON, 12],
                                [Lang.Blocks.BADDY, 13],
                                [Lang.Blocks.CHASE, 14],
                                [Lang.Blocks.BA_DING, 15],
                                [Lang.Blocks.WAWAWAWAA, 16],
                                [Lang.Blocks.JUMP_UP, 17],
                                [Lang.Blocks.JUMP_DOWN, 18],
                                [Lang.Blocks.POWER_UP, 19],
                                [Lang.Blocks.POWER_DOWN, 20],
                            ],
                            value: 0,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteSound',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_play_preset_music',
                    },
                    paramsKeyMap: {
                        VALUE: 0,
                    },
                    func: async (sprite, script) => {
                        const value = this._clamp(script.getNumberValue('VALUE'), 0, 20);

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.PLAY_MELODY};${value}`
                        );
                        this.getResponse(response);
                        return new Promise((resolve, reject) => {
                            this.waitMilliSec(500, resolve);
                        });
                    },
                },

                microbit2lite_get_btn: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_boolean_field',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                ['A', 'a'],
                                ['B', 'b'],
                                ['A+B', 'ab'],
                            ],
                            value: 'a',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteSensor',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_btn',
                    },
                    paramsKeyMap: {
                        VALUE: 0,
                    },
                    func: async (sprite, script) => {
                        const value = script.getField('VALUE');

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_BTN};`
                        );
                        const parsedResponse = this.getResponse(response);

                        if (parsedResponse == '1' && value == 'a') {
                            return 1;
                        } else if (parsedResponse == '2' && value == 'b') {
                            return 1;
                        } else if (parsedResponse == '3' && value == 'ab') {
                            return 1;
                        } else {
                            return 0;
                        }
                    },
                },
                microbit2lite_btn_event: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#fff',
                    skeleton: 'basic_event',
                    statements: [],
                    params: [
                        {
                            type: 'Indicator',
                            img: 'block_icon/start_icon_hardwarelite.svg',
                            size: 14,
                            position: { x: 0, y: -2 },
                        },
                        {
                            type: 'Dropdown',
                            options: [
                                ['A', '1'],
                                ['B', '2'],
                                ['A+B', '3'],
                            ],
                            value: '1',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    def: {
                        type: 'microbit2lite_btn_event',
                    },
                    paramsKeyMap: {
                        VALUE: 1,
                    },
                    class: 'microbit2litev2',
                    isNotFor: ['Microbit2lite'],
                    event: 'microbit2lite_btn_pressed',
                    func: (sprite, script) => {
                        return script.callReturn();
                    },
                },
                microbit2lite_get_acc: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.xAxis, 'x'],
                                [Lang.Blocks.yAxis, 'y'],
                                [Lang.Blocks.zAxis, 'z'],
                                [Lang.Blocks.scalar, 'mag'],
                            ],
                            value: 'x',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteSensor',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_acc',
                    },
                    paramsKeyMap: {
                        AXIS: 0,
                    },
                    func: async (sprite, script) => {
                        const axis = script.getField('AXIS');

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_ACC};${axis}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_get_gesture: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_boolean_field',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.up, 'up'],
                                [Lang.Blocks.down, 'down'],
                                [Lang.Blocks.left, 'left'],
                                [Lang.Blocks.right, 'right'],
                                [Lang.Blocks.face_up, 'face up'],
                                [Lang.Blocks.face_down, 'face down'],
                                [Lang.Blocks.freefall, 'freefall'],
                                [Lang.Blocks['3g'], '3g'],
                                [Lang.Blocks['6g'], '6g'],
                                [Lang.Blocks['8g'], '8g'],
                                [Lang.Blocks['shake'], 'shake'],
                            ],
                            value: 'up',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteSensor',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_gesture',
                    },
                    paramsKeyMap: { GESTURE: 0 },
                    func: async (sprite, script) => {
                        const gesture = script.getField('GESTURE');

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_GESTURE};`
                        );
                        const parsedResponse = this.getResponse(response);

                        if (gesture === parsedResponse[1]) {
                            return true;
                        }
                        return false;
                    },
                },
                microbit2lite_get_direction: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [],
                    events: {},
                    class: 'microbit2liteSensor',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_direction',
                    },
                    paramsKeyMap: {},
                    func: async (sprite, script) => {
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_DIRECTION};`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_get_field_strength_axis: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.xAxis, 'x'],
                                [Lang.Blocks.yAxis, 'y'],
                                [Lang.Blocks.zAxis, 'z'],
                                [Lang.Blocks.scalar, 'mag'],
                            ],
                            value: 'x',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteSensor',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_field_strength_axis',
                    },
                    paramsKeyMap: {
                        AXIS: 0,
                    },
                    func: async (sprite, script) => {
                        const axis = script.getField('AXIS');

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_FIELD_STRENGTH};${axis}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_get_light_level: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [],
                    events: {},
                    class: 'microbit2liteSensor',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_light_level',
                    },
                    paramsKeyMap: {},
                    func: async (sprite, script) => {
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_LIGHT_LEVEL};`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_get_temperature: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [],
                    events: {},
                    class: 'microbit2liteSensor',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_temperature',
                    },
                    paramsKeyMap: {},
                    func: async (sprite, script) => {
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_TEMPERATURE};`
                        );
                        return this.getResponse(response);
                    },
                },

                microbit2lite_set_servo: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: this.majorPins,
                            value: 0,
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
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteServo',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_set_servo',
                    },
                    paramsKeyMap: {
                        PIN: 0,
                        VALUE: 1,
                    },
                    func: async (sprite, script) => {
                        const pin = script.getValue('PIN');
                        const value = Math.round(
                            this._clamp(script.getNumberValue('VALUE'), 0, 180)
                        );

                        const parsedPayload = `${pin};${value}`;
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.SET_SERVO_ANGLE};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_set_pwm: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: this.analogPins,
                            value: 0,
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
                            type: 'Dropdown',
                            options: [
                                ['ms', 'milli'],
                                ['µs', 'micro'],
                            ],
                            value: 'milli',
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2liteServo',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_set_pwm',
                    },
                    paramsKeyMap: {
                        PIN: 0,
                        VALUE: 1,
                        UNIT: 2,
                    },
                    func: async (sprite, script) => {
                        const pin = script.getValue('PIN');
                        const unit = script.getValue('UNIT');
                        const value = Math.round(
                            this._clamp(script.getNumberValue('VALUE'), 0, 1023)
                        );
                        const command =
                            unit === 'milli'
                                ? this.functionKeys.SET_SERVO_MILLI
                                : this.functionKeys.SET_SERVO_MICRO;

                        const parsedPayload = `${pin};${value}`;
                        const response = await this.getResponseWithSync(
                            `${command};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },

                microbit2lite_v2_title: {
                    skeleton: 'basic_text',
                    color: EntryStatic.colorSet.common.TRANSPARENT,
                    fontColor: '#333333',
                    params: [
                        {
                            type: 'Text',
                            text: Lang.template.microbit2lite_v2_title,
                            color: '#333333',
                            align: 'center',
                        },
                    ],
                    def: {
                        type: 'microbit2lite_v2_title',
                    },
                    class: 'microbit2lite_title',
                    isNotFor: ['Microbit2lite'],
                    events: {},
                },
                microbit2lite_get_logo: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_boolean_field',
                    statements: [],
                    params: [],
                    events: {},
                    class: 'microbit2litev2',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_logo',
                    },
                    paramsKeyMap: {},
                    func: async (sprite, script) => {
                        if (this.version === '1') {
                            throw new Entry.Utils.IncompatibleError('IncompatibleError', [
                                Lang.Msgs.microbit2lite_compatible_error,
                            ]);
                        }

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_LOGO};`
                        );
                        const parsedResponse = this.getResponse(response);
                        if (parsedResponse == '1') {
                            return 1;
                        } else {
                            return 0;
                        }
                    },
                },
                microbit2lite_get_sound_level: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic_string_field',
                    statements: [],
                    params: [],
                    events: {},
                    class: 'microbit2litev2',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_get_sound_level',
                    },
                    paramsKeyMap: {},
                    func: async (sprite, script) => {
                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.GET_SOUND_LEVEL};`
                        );
                        return this.getResponse(response);
                    },
                },
                microbit2lite_speaker_toggle: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.on, this.functionKeys.SPEAKER_ON],
                                [Lang.Blocks.off, this.functionKeys.SPEAKER_OFF],
                            ],
                            value: this.functionKeys.SPEAKER_ON,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2litev2',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_speaker_toggle',
                    },
                    paramsKeyMap: { VALUE: 0 },
                    func: async (sprite, script) => {
                        if (this.version === '1') {
                            throw new Entry.Utils.IncompatibleError('IncompatibleError', [
                                Lang.Msgs.microbit2_compatible_error,
                            ]);
                        }
                        const command = script.getField('VALUE');
                        const response = await this.getResponseWithSync(`${command};`);
                        return this.getResponse(response);
                    },
                },
                microbit2lite_play_sound_effect: {
                    color: EntryStatic.colorSet.block.default.HARDWARE,
                    outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                    fontColor: '#ffffff',
                    skeleton: 'basic',
                    statements: [],
                    params: [
                        {
                            type: 'Dropdown',
                            options: [
                                [Lang.Blocks.GIGGLE, 21],
                                [Lang.Blocks.HAPPY, 22],
                                [Lang.Blocks.HELLO, 23],
                                [Lang.Blocks.MYSTERIOUS, 24],
                                [Lang.Blocks.SAD, 25],
                                [Lang.Blocks.SLIDE, 26],
                                [Lang.Blocks.SOARING, 27],
                                [Lang.Blocks.SPRING, 28],
                                [Lang.Blocks.TWINKLE, 29],
                                [Lang.Blocks.YAWN, 30],
                            ],
                            value: 21,
                            fontSize: 11,
                            bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                        },
                        {
                            type: 'Indicator',
                            img: 'block_icon/hardwarelite_icon.svg',
                            size: 12,
                        },
                    ],
                    events: {},
                    class: 'microbit2litev2',
                    isNotFor: ['Microbit2lite'],
                    def: {
                        type: 'microbit2lite_play_sound_effect',
                    },
                    paramsKeyMap: {
                        VALUE: 0,
                    },
                    func: async (sprite, script) => {
                        const value = this._clamp(script.getNumberValue('VALUE'), 21, 30);
                        const parsedPayload = `${value}`;

                        const response = await this.getResponseWithSync(
                            `${this.functionKeys.PLAY_SOUND};${parsedPayload}`
                        );
                        return this.getResponse(response);
                    },
                },
            };
        };
    })();
})();

module.exports = Entry.Microbit2lite;
