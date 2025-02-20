'use strict';

const { toQueryString } = require('../../util/common');
const _trim = require('lodash/trim');

Entry.AI_UTILIZE_BLOCK.tts = {
    name: 'tts',
    imageName: 'tts.svg',
    category: 'general',
    sponsorText: 'Powered by {image}',
    sponsorImage: 'naverClova.png',
    sponsorOnImage: 'naverClovaOn.png',
    title: {
        ko: '읽어주기',
        en: 'read',
        jp: 'を読み上げる',
    },
    titleKey: 'template.tts_title_text',
    description: Lang.Msgs.ai_utilize_tts_description,
    descriptionKey: 'Msgs.ai_utilize_tts_description',
    isInitialized: true,
    init() {},
    api: '/api/expansionBlock/tts/read',
    sponsor: 'clovaNaver',
    sponsorLink: 'https://www.ncloud.com/product/aiService/css',
    loadQueue: [],
};

Entry.AI_UTILIZE_BLOCK.tts.getBlocks = function() {
    const params = {
        getSpeaker(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.tts_female, 'kyuri'],
                    [Lang.Blocks.tts_male, 'jinho'],
                    [Lang.Blocks.tts_kind, 'hana'],
                    [Lang.Blocks.tts_sweet, 'dinna'],
                    [Lang.Blocks.tts_echo, 'brown'],
                    [Lang.Blocks.tts_mischievous, 'minions'],
                    [Lang.Blocks.tts_dainty, 'sally'],
                    [Lang.Blocks.tts_sabina, 'nsabina'],
                    [Lang.Blocks.tts_mammon, 'nmammon'],
                    [Lang.Blocks.tts_kitty, 'nmeow'],
                    [Lang.Blocks.tts_doggy, 'nwoof'],
                ],
                value: 'kyuri',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getSpeed(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.tts_veryslow, '5'],
                    [Lang.Blocks.tts_slow, '3'],
                    [Lang.Blocks.tts_normal, '0'],
                    [Lang.Blocks.tts_fast, '-3'],
                    [Lang.Blocks.tts_veryfast, '-5'],
                ],
                value: '0',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getPitch(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.tts_verylow, '5'],
                    [Lang.Blocks.tts_low, '3'],
                    [Lang.Blocks.tts_normal, '0'],
                    [Lang.Blocks.tts_high, '-3'],
                    [Lang.Blocks.tts_veryhigh, '-5'],
                ],
                value: '0',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
    };

    const hashCode = (s) =>
        s.split('').reduce(function(a, b) {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);

    const checkText = function(text) {
        const result = {
            result: false,
            message: Lang.Blocks.unknown_sentence,
        };

        if (!text) {
            result.message = Lang.Blocks.no_sentence;
            return result;
        }

        if (text.length > 2500) {
            result.message = Lang.Blocks.sentence_over_2500_charactor;
            return result;
        }

        return {
            result: true,
            message: _trim(text),
            hash: hashCode(text + new Date().getTime()),
        };
    };

    /**
     * wodnjs6512: 로드를 새로 할때는 queue를 다시 만든다고 하네요
     * 기존 코드에서 하나의 로더로 로드를 2개를 콜하면 하나는 정상 로드가 되지 않는 이슈가 있다고 합니다
     * 한번에 로드가 가능하도록 매번 로더를 따로 만들어서 사용하도록 수정
     * https://github.com/CreateJS/PreloadJS/issues/232#issuecomment-338739115
     *  */
    const read = function(args) {
        return new Promise((resolve) => {
            const { message, hash, prop } = args;
            const tts = Entry.AI_UTILIZE_BLOCK.tts;
            const id = `tts-${hash}-${JSON.stringify(prop)}`;
            const type = createjs.LoadQueue.SOUND;

            const soundQueue = new createjs.LoadQueue(true);
            soundQueue.installPlugin(createjs.Sound);
            soundQueue.maintainScriptOrder = true;
            const src = `${Entry.baseUrl}${Entry.AI_UTILIZE_BLOCK.tts.api}.mp3?${toQueryString({
                text: message,
                ...prop,
            })}`;
            const loadHandler = ({ currentTarget }) => {
                const items = currentTarget.getItems().map(({ item }) => item);
                tts.loadQueue = tts.loadQueue.filter((id) => {
                    const filtered = items.find((item) => item.id === id);
                    if (filtered) {
                        const instance = Entry.Utils.playSound(id, filtered.prop);
                        instance.soundType = 'tts';
                        Entry.Utils.addSoundInstances(instance);
                        const duration =
                            instance.duration > 0 ? instance.duration : filtered.duration * 300;
                        setTimeout(() => {
                            resolve();
                        }, duration);
                    }
                    return true;
                });
            };
            // 읽어주기 오류 발생 시, 다음 블록 실행
            const errorHandler = async () => {
                soundQueue.removeEventListener('complete', loadHandler);
                soundQueue.removeEventListener('error', errorHandler);
                soundQueue.destroy();
                resolve();
            };
            soundQueue.on('complete', loadHandler);
            soundQueue.on('error', errorHandler);
            soundQueue.loadFile({ id, src, type, prop, duration: message.length });
            tts.loadQueue.push(id);
        });
    };

    return {
        tts_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.tts_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'tts_title',
            },
            class: 'tts',
            isNotFor: ['tts'],
            events: {},
        },
        read_text: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/ai_utilize_icon.svg',
                    size: 11,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: [Lang.Blocks.entry],
                    },
                    null,
                ],
                type: 'read_text',
            },
            pyHelpDef: {
                params: ['A&value'],
                type: 'read_text',
            },
            paramsKeyMap: {
                TEXT: 0,
            },
            class: 'tts',
            isNotFor: ['tts'],
            func(sprite, script) {
                const { result, message, hash } = checkText(script.getStringValue('TEXT', script));
                if (result) {
                    const prop = sprite.getVoiceProp();
                    read({
                        message,
                        hash,
                        prop,
                    });
                }
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'TTS.read(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
            wikiClass: 'ai_utilize_tts',
        },
        read_text_wait_with_block: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/ai_utilize_icon.svg',
                    size: 11,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: [Lang.Blocks.entry],
                    },
                    null,
                ],
                type: 'read_text_wait_with_block',
            },
            pyHelpDef: {
                params: ['A&value'],
                type: 'read_text_wait_with_block',
            },
            paramsKeyMap: {
                TEXT: 0,
            },
            class: 'tts',
            isNotFor: ['tts'],
            async func(sprite, script) {
                const { result, message, hash } = checkText(script.getStringValue('TEXT', script));
                const prop = sprite.getVoiceProp();
                if (result) {
                    await read({
                        message,
                        hash,
                        prop,
                    });
                    return script.callReturn();
                }
            },
            syntax: {
                js: [],
                py: [
                    {
                        passTest: true,
                        syntax: 'TTS.read_and_wait(%1)',
                    },
                ],
            },
            wikiClass: 'ai_utilize_tts',
        },
        set_tts_property: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                params.getSpeaker(),
                params.getSpeed(),
                params.getPitch(),
                {
                    type: 'Indicator',
                    img: 'block_icon/ai_utilize_icon.svg',
                    size: 11,
                },
            ],
            events: {},
            def: {
                params: [
                    params.getSpeaker().value,
                    params.getSpeed().value,
                    params.getPitch().value,
                    null,
                ],
                type: 'set_tts_property',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'set_tts_property',
            },
            paramsKeyMap: {
                SPEAKER: 0,
                SPEED: 1,
                PITCH: 2,
            },
            class: 'tts',
            isNotFor: ['tts'],
            func(sprite, script) {
                const speaker = script.getField('SPEAKER', script);
                const speed = script.getField('SPEED', script);
                const pitch = script.getField('PITCH', script);
                const volume = 1;
                sprite.setVoiceProp({ speaker, speed, pitch, volume });
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'TTS.set(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            params.getSpeaker(true),
                            params.getSpeed(true),
                            params.getPitch(true),
                        ],
                    },
                ],
            },
            wikiClass: 'ai_utilize_tts',
        },
    };
};
