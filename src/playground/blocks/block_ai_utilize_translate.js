'use strict';

const PromiseManager = require('../../core/promiseManager');
const { callApi } = require('../../util/common');

/**
 * 비공식으로 엔트리에서 사용되고 있는 언어코드 (vn, ja)의 경우 공식 언어코드로 치환한다.
 * @param {string}originalLanguage
 */
function replaceLanguageCode(originalLanguage) {
    switch (originalLanguage) {
        case 'jp':
            return 'ja';
        case 'vn':
            return 'vi';
        default:
            return originalLanguage;
    }
}

function getInitialCodeMap() {
    return {
        auto: {
            lang: Lang.Blocks.auto,
            sub: [
                'en',
                'ja',
                'zh-CN',
                'zh-TW',
                'es',
                'fr',
                'de',
                'ru',
                'pt',
                'th',
                'vi',
                'id',
                'hi',
                'ko',
            ],
        },
        ko: {
            lang: Lang.Blocks.korean,
            sub: ['en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'ru', 'pt', 'th', 'vi', 'id'],
        },
        en: {
            lang: Lang.Blocks.english,
            sub: [
                'ko',
                'ja',
                'zh-CN',
                'zh-TW',
                'es',
                'fr',
                'de',
                'ru',
                'pt',
                'th',
                'vi',
                'id',
                'hi',
            ],
        },
        ja: {
            lang: Lang.Blocks.japan,
            sub: [
                'ko',
                'en',
                'zh-CN',
                'zh-TW',
                'es',
                'fr',
                'de',
                'ru',
                'pt',
                'th',
                'vi',
                'id',
                'hi',
            ],
        },
        'zh-CN': {
            lang: Lang.Blocks.chinese_simplified,
            sub: ['ko', 'en', 'ja', 'zh-TW', 'es', 'fr', 'de', 'ru', 'pt', 'th', 'vi', 'id', 'hi'],
        },
        'zh-TW': {
            lang: Lang.Blocks.chinese_traditional,
            sub: ['ko', 'en', 'ja', 'zh-CN', 'es', 'fr', 'de', 'ru', 'pt', 'th', 'vi', 'id', 'hi'],
        },
        es: {
            lang: Lang.Blocks.spanish,
            sub: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de', 'ru', 'th', 'vi', 'id'],
        },
        fr: {
            lang: Lang.Blocks.french,
            sub: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'de', 'ru', 'th', 'vi', 'id'],
        },
        de: {
            lang: Lang.Blocks.german,
            sub: [
                'ko',
                'en',
                'ja',
                'zh-CN',
                'zh-TW',
                'es',
                'fr',
                'ru',
                'pt',
                'th',
                'vi',
                'id',
                'hi',
            ],
        },
        ru: {
            lang: Lang.Blocks.russian,
            sub: [
                'ko',
                'en',
                'ja',
                'zh-CN',
                'zh-TW',
                'es',
                'fr',
                'de',
                'pt',
                'th',
                'vi',
                'id',
                'hi',
            ],
        },
        pt: {
            lang: Lang.Blocks.portuguese,
            sub: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'de', 'ru', 'hi'],
        },
        th: {
            lang: Lang.Blocks.thai,
            sub: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'ru', 'vi'],
        },
        vi: {
            lang: Lang.Blocks.vietnamese,
            sub: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'ru', 'th', 'id'],
        },
        id: {
            lang: Lang.Blocks.indonesian,
            sub: ['ko', 'en', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'ru', 'th', 'vi'],
        },
        hi: {
            lang: Lang.Blocks.hindi,
            sub: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'de', 'ru', 'pt'],
        },
    };
}

Entry.AI_UTILIZE_BLOCK.translate = {
    name: 'translate',
    imageName: 'papago.svg',
    category: 'general',
    sponsorText: 'Powered by {image}',
    sponsorImage: 'naver.png',
    sponsorOnImage: 'naverOn.png',
    title: {
        ko: '번역',
        en: 'translate',
        jp: '翻訳',
    },
    titleKey: 'template.translate_title_text',
    description: Lang.Msgs.expansion_translate_description,
    descriptionKey: 'Msgs.expansion_translate_description',
    isInitialized: false,
    init() {
        if (this.isInitialized) {
            return;
        }
        Entry.AI_UTILIZE_BLOCK.translate.delayKey = Entry.projectId;
        Entry.AI_UTILIZE_BLOCK.translate.isInitialized = true;
    },
    api: '/api/expansionBlock/papago/',
    sponsor: 'papagoNaver',
    sponsorLink: 'https://www.ncloud.com/product/aiService/papagoNmt',
    typeMap: {
        dictionary: 'nsmt',
        artificial_intelligence: 'n2mt',
    },
    apiType: 'n2mt',
};

Entry.AI_UTILIZE_BLOCK.translate.getBlocks = function() {
    const params = {
        getType(isPython) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.dictionary, 'dictionary'],
                    [Lang.Blocks.artificial_intelligence, 'artificial_intelligence'],
                ],
                value: 'dictionary',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getSourceLang(isPython) {
            const value = replaceLanguageCode(Lang.type);
            const options = [
                [Lang.Blocks.korean, 'ko'],
                [Lang.Blocks.english, 'en'],
                [Lang.Blocks.japan, 'ja'],
                [Lang.Blocks.chinese_simplified, 'zh-CN'],
                [Lang.Blocks.chinese_traditional, 'zh-TW'],
                [Lang.Blocks.spanish, 'es'],
                [Lang.Blocks.french, 'fr'],
                [Lang.Blocks.german, 'de'],
                [Lang.Blocks.russian, 'ru'],
                [Lang.Blocks.portuguese, 'pt'],
                [Lang.Blocks.thai, 'th'],
                [Lang.Blocks.vietnamese, 'vi'],
                [Lang.Blocks.indonesian, 'id'],
                [Lang.Blocks.hindi, 'hi'],
            ];
            const index = _.findIndex(options, (x) => x[1] === value);
            if (index > 0) {
                const temp = options[index];
                options[index] = options[0];
                options[0] = temp;
            }
            const param = {
                type: 'Dropdown',
                options,
                value,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                dropdownSync: 'translate',
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getTargetLang(isPython = false) {
            const param = {
                type: 'DropdownDynamic',
                value: null,
                menuName() {
                    const value = this.getTargetValue('translate');
                    if (!value) {
                        return [[Lang.Blocks.no_target, 'null']];
                    }
                    const langCodeMap = getInitialCodeMap();
                    const convertedLangCode = replaceLanguageCode(value);
                    return langCodeMap[convertedLangCode].sub.map((code) => [
                        langCodeMap[code].lang,
                        code,
                    ]);
                },
                needDeepCopy: true,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                defaultValue: (value, options) => {
                    if (options.length) {
                        return options[0][1];
                    }
                    return null;
                },
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
    };
    const getProjectId = function() {
        if (Entry.projectId) {
            Entry.AI_UTILIZE_BLOCK.translate.delayKey = Entry.projectId;
        }

        if (Entry.AI_UTILIZE_BLOCK.translate.delayKey) {
            return Entry.AI_UTILIZE_BLOCK.translate.delayKey;
        }

        Entry.AI_UTILIZE_BLOCK.translate.delayKey = _.uniqueId(Entry.generateHash());
        return Entry.AI_UTILIZE_BLOCK.translate.delayKey;
    };

    const translate = (params, type, defaultValue) => {
        params.projectId = getProjectId();
        const key = `translate-${type}${JSON.stringify(params)}`;
        return new PromiseManager()
            .Promise((resolve) => {
                callApi(key, {
                    url: `${Entry.AI_UTILIZE_BLOCK.translate.api}translate/${type}`,
                    params,
                })
                    .then((result) => {
                        if (result.data) {
                            return resolve(result.data.translatedText);
                        }
                        return resolve(defaultValue);
                    })
                    .catch(() => resolve(defaultValue));
            })
            .catch(() => defaultValue);
    };

    const checkLang = (query, defaultValue) => {
        const langCodeMap = getInitialCodeMap();
        return new PromiseManager()
            .Promise((resolve) => {
                callApi(`translate-detect-${query}`, {
                    url: `${Entry.AI_UTILIZE_BLOCK.translate.api}dect/langs`,
                    params: { query, projectId: getProjectId() },
                })
                    .then((result) => {
                        if (
                            result.data &&
                            result.data.langCode &&
                            langCodeMap[result.data.langCode]
                        ) {
                            return resolve(langCodeMap[result.data.langCode].lang);
                        }
                        return resolve(defaultValue);
                    })
                    .catch(() => resolve(defaultValue));
            })
            .catch(() => defaultValue);
    };

    const checkText = function(text) {
        const result = {
            result: false,
            message: Lang.Blocks.unknown_sentence,
        };

        if (!text) {
            result.message = Lang.Blocks.no_sentence;
            return result;
        }

        if (text.length > 3000) {
            result.message = Lang.Blocks.sentence_over_3000_charactor;
            return result;
        }

        return {
            result: true,
            message: text,
        };
    };
    return {
        translate_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.translate_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'translate_title',
            },
            class: 'translate',
            isNotFor: ['translate'],
            events: {},
        },
        get_translated_string: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                params.getSourceLang(),
                {
                    type: 'Block',
                    accept: 'string',
                },
                params.getTargetLang(),
            ],
            events: {},
            def: {
                params: [
                    params.getSourceLang().value,
                    {
                        type: 'text',
                        params: [Lang.Blocks.entry],
                    },
                    null,
                ],
                type: 'get_translated_string',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_translated_string',
            },
            paramsKeyMap: {
                SOURCE: 0,
                TEXT: 1,
                TARGET: 2,
            },
            class: 'translate',
            isNotFor: ['translate'],
            func(sprite, script) {
                const textObj = checkText(script.getStringValue('TEXT', script));
                if (!textObj.result) {
                    return textObj.message;
                }

                const type = Entry.AI_UTILIZE_BLOCK.translate.apiType;
                const params = {
                    text: textObj.message,
                    target: script.getField('TARGET', script),
                    source: script.getField('SOURCE', script),
                };

                if (params.target == params.source) {
                    return params.text;
                }

                return translate(params, type, Lang.Blocks.unknown_sentence);
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Translate.do(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            params.getSourceLang(true),
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            params.getTargetLang(true),
                        ],
                    },
                ],
            },
            wikiClass: 'ai_utilize_translate',
        },
        check_language: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: [Lang.Blocks.entry],
                    },
                ],
                type: 'check_language',
            },
            pyHelpDef: {
                params: ['A&value'],
                type: 'check_language',
            },
            paramsKeyMap: {
                TEXT: 0,
                LANG: 1,
            },
            class: 'translate',
            isNotFor: ['translate'],
            func(sprite, script) {
                const text = script.getStringValue('TEXT', script);
                const textObj = checkText(text);
                if (!textObj.result) {
                    return textObj.message;
                }

                return checkLang(textObj.message, Lang.Blocks.unknown_sentence);
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Translate.getLang(%1)',
                        params: [null],
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
            wikiClass: 'ai_utilize_translate',
        },
    };
};
