import AudioUtils from '../../util/audioUtils';
import _clamp from 'lodash/clamp';

Entry.AI_UTILIZE_BLOCK.audio = {
    name: 'audio',
    imageName: 'audio.svg',
    category: 'audio',
    sponsorText: 'Powered by {image}',
    sponsorImage: 'naverClova.png',
    sponsorOnImage: 'naverClovaOn.png',
    title: {
        ko: '음성 인식',
        en: 'Speech recognition',
        jp: 'オーディオ検出',
    },
    titleKey: 'template.voice_title_text',
    description: Lang.Msgs.ai_utilize_audio_description,
    descriptionKey: 'Msgs.ai_utilize_audio_description',
    isInitialized: false,
    async init() {
        await AudioUtils.initialize();
        Entry.AI_UTILIZE_BLOCK.audio.isInitialized = true;
    },
};

Entry.AI_UTILIZE_BLOCK.audio.getBlocks = function() {
    return {
        audio_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.audio_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'audio_title',
            },
            class: 'audio',
            isNotFor: ['audio'],
            events: {},
        },
        check_microphone: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'check_microphone',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'audio',
            isNotFor: ['audio'],
            async func(sprite, script) {
                try {
                    if (!AudioUtils.isInitialized) {
                        await AudioUtils.initialize();
                    }
                    return AudioUtils.audioInputList.length > 0;
                } catch (err) {
                    return false;
                }
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'ai_utilize_stt',
        },
        get_microphone_volume: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'get_microphone_volume',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'audio',
            isNotFor: ['audio'],
            async func(sprite, script) {
                if (!AudioUtils.isInitialized) {
                    await AudioUtils.initialize();
                }
                return AudioUtils.currentVolume;
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'ai_utilize_stt',
        },
        speech_to_text_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.voice_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'speech_to_text_title',
            },
            class: 'stt',
            isNotFor: ['audio'],
            events: {},
        },
        speech_to_text_convert: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.korean_s, 'Kor'],
                        [Lang.Blocks.english_s, 'Eng'],
                        [Lang.Blocks.japan_s, 'Jpn'],
                    ],
                    value: 'Kor',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                    arrowColor: EntryStatic.colorSet.common.WHITE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/ai_utilize_icon.svg',
                    size: 11,
                },
            ],
            events: {
                viewAdd: [
                    function() {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.setVisible(true);
                        }
                    },
                ],
                viewDestroy: [
                    function(block, notIncludeSelf) {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.checkVisible(block, notIncludeSelf);
                        }
                    },
                ],
            },
            def: {
                params: [null],
                type: 'speech_to_text_convert',
            },
            paramsKeyMap: {
                LANG: 0,
            },
            class: 'stt',
            isNotFor: ['audio'],
            async func(sprite, script) {
                if (!AudioUtils.isInitialized) {
                    await AudioUtils.initialize();
                }
                if (AudioUtils.isRecording) {
                    return;
                }
                try {
                    const language = script.getField('LANG', script);
                    if (language === 'Kor') {
                        Entry.container.sttValue.setName(
                            `${Lang.template.voice_title_text}:${Lang.Blocks.korean_s}`
                        );
                    } else if (language === 'Eng') {
                        Entry.container.sttValue.setName(
                            `${Lang.template.voice_title_text}:${Lang.Blocks.english_s}`
                        );
                    } else if (language === 'Jpn') {
                        Entry.container.sttValue.setName(
                            `${Lang.template.voice_title_text}:${Lang.Blocks.japan_s}`
                        );
                    }
                    AudioUtils.isRecording = true;
                    Entry.container.enableSttValue();
                    const result = await AudioUtils.startRecord(60 * 1000, language);
                    Entry.dispatchEvent('audioRecordingDone');
                    Entry.container.setSttValue(result || '-');
                } catch (e) {
                    Entry.container.setSttValue('-');
                    throw e;
                }
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'ai_utilize_stt',
        },
        timed_speech_to_text_convert: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                    value: '10',
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.korean_s, 'Kor'],
                        [Lang.Blocks.english_s, 'Eng'],
                        [Lang.Blocks.japan_s, 'Jpn'],
                    ],
                    value: 'Kor',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                    arrowColor: EntryStatic.colorSet.common.WHITE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/ai_utilize_icon.svg',
                    size: 11,
                },
            ],
            events: {
                viewAdd: [
                    function() {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.setVisible(true);
                        }
                    },
                ],
                viewDestroy: [
                    function(block, notIncludeSelf) {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.checkVisible(block, notIncludeSelf);
                        }
                    },
                ],
            },
            def: {
                params: [null],
                type: 'timed_speech_to_text_convert',
            },
            paramsKeyMap: {
                TIME: 0,
                LANG: 1,
            },
            class: 'stt',
            isNotFor: ['audio'],
            async func(sprite, script) {
                if (!AudioUtils.isInitialized) {
                    await AudioUtils.initialize();
                }
                if (AudioUtils.isRecording) {
                    return;
                }
                try {
                    const time = _clamp(script.getNumberValue('TIME'), 1, 60);

                    const language = script.getField('LANG', script);
                    if (language === 'Kor') {
                        Entry.container.sttValue.setName(
                            `${Lang.template.voice_title_text}:${Lang.Blocks.korean_s}`
                        );
                    } else if (language === 'Eng') {
                        Entry.container.sttValue.setName(
                            `${Lang.template.voice_title_text}:${Lang.Blocks.english_s}`
                        );
                    } else if (language === 'Jpn') {
                        Entry.container.sttValue.setName(
                            `${Lang.template.voice_title_text}:${Lang.Blocks.japan_s}`
                        );
                    }
                    AudioUtils.isRecording = true;
                    Entry.container.enableSttValue();
                    const result = await AudioUtils.startTimedRecord(time * 1000, language);
                    Entry.dispatchEvent('audioRecordingDone');
                    Entry.container.setSttValue(result || '-');
                } catch (e) {
                    Entry.container.setSttValue('-');
                    throw e;
                }
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'ai_utilize_stt',
        },
        set_visible_speech_to_text: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.CALC_timer_visible_show, 'SHOW'],
                        [Lang.Blocks.CALC_timer_visible_hide, 'HIDE'],
                    ],
                    value: 'SHOW',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                    arrowColor: EntryStatic.colorSet.common.WHITE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/ai_utilize_icon.svg',
                    size: 11,
                },
            ],
            events: {
                viewAdd: [
                    function() {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.setVisible(true);
                        }
                    },
                ],
                viewDestroy: [
                    function(block, notIncludeSelf) {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.checkVisible(block, notIncludeSelf);
                        }
                    },
                ],
            },
            def: {
                type: 'set_visible_speech_to_text',
            },
            paramsKeyMap: {
                ACTION: 0,
            },
            class: 'stt',
            isNotFor: ['audio'],
            func(sprite, script) {
                const action = script.getField('ACTION');
                const sttValue = Entry.container.sttValue;

                if (!sttValue) {
                    return script.callReturn();
                } else if (action === 'SHOW') {
                    sttValue.setVisible(true);
                } else {
                    sttValue.setVisible(false);
                }

                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'ai_utilize_stt',
        },
        speech_to_text_get_value: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {
                viewAdd: [
                    function() {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.setVisible(true);
                        }
                    },
                ],
                viewDestroy: [
                    function(block, notIncludeSelf) {
                        if (Entry.container.sttValue) {
                            Entry.container.sttValue.checkVisible(block, notIncludeSelf);
                        }
                    },
                ],
            },
            def: {
                type: 'speech_to_text_get_value',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'stt',
            isNotFor: ['audio'],
            func(sprite, script) {
                return Entry.container.getSttValue();
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'ai_utilize_stt',
        },
    };
};
