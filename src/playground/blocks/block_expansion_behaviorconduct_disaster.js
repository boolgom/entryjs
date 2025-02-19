'use strict';

const PromiseManager = require('../../core/promiseManager');
const { callApi } = require('../../util/common');

function getInitialCategoryMap() {
    return {
        '01001': {
            lang: Lang.Blocks.behaviorConduct01001,
            sub: ['01001001', '01001002', '01001003'],
        },
        '01002': {
            lang: Lang.Blocks.behaviorConduct01002,
            sub: ['01002002', '01002003', '01002004'],
        },
        '01003': {
            lang: Lang.Blocks.behaviorConduct01003,
            sub: ['01003002', '01003003', '01003004'],
        },
        '01004': {
            lang: Lang.Blocks.behaviorConduct01004,
            sub: ['01004001', '01004002'],
        },
        '01005': {
            lang: Lang.Blocks.behaviorConduct01005,
            sub: ['01005002', '01005003', '01005004'],
        },
        '01006': {
            lang: Lang.Blocks.behaviorConduct01006,
            sub: ['01006001', '01006002'],
        },
        '01007': {
            lang: Lang.Blocks.behaviorConduct01007,
            sub: ['01007001'],
        },
        '01008': {
            lang: Lang.Blocks.behaviorConduct01008,
            sub: ['01008001', '01008002', '01008003'],
        },
        '01009': {
            lang: Lang.Blocks.behaviorConduct01009,
            sub: ['01009001', '01009002'],
        },
        '01010': {
            lang: Lang.Blocks.behaviorConduct01010,
            sub: ['01010001'],
        },
        '01011': {
            lang: Lang.Blocks.behaviorConduct01011,
            sub: ['01011009', '01011010', '01011012'],
        },
        '01013': {
            lang: Lang.Blocks.behaviorConduct01013,
            sub: ['01013002', '01013003'],
        },
        '01014': {
            lang: Lang.Blocks.behaviorConduct01014,
            sub: ['01014001'],
        },
    };
}

Entry.EXPANSION_BLOCK.behaviorConductDisaster = {
    name: 'behaviorConductDisaster',
    imageName: 'disaster.png',
    title: {
        ko: '자연재난',
        en: 'Disaster',
        jp: '自然災害',
    },
    titleKey: 'template.behaviorConductDisaster_title_text',
    description: Lang.Msgs.expansion_behaviorConductDisaster_description,
    descriptionKey: 'Msgs.expansion_behaviorConductDisaster_description',
    isInitialized: false,
    init() {
        if (this.isInitialized) {
            return;
        }
        Entry.EXPANSION_BLOCK.behaviorConductDisaster.isInitialized = true;
    },
    api: '/api/expansionBlock/behaviorConduct',
    apiType: '01',
};

Entry.EXPANSION_BLOCK.behaviorConductDisaster.getBlocks = function() {
    const categoryMap = getInitialCategoryMap();
    const getCategory = function() {
        return Object.keys(categoryMap).map((category) => [categoryMap[category].lang, category]);
    };
    const defaultCategory = Object.keys(categoryMap)[0];
    const params = {
        getCategory(isPython) {
            const param = {
                type: 'Dropdown',
                options: getCategory(),
                value: defaultCategory,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                dropdownSync: 'disaster',
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getSubCategory(isPython = false) {
            const param = {
                type: 'DropdownDynamic',
                value: null,
                menuName() {
                    const value = this.getTargetValue('disaster');
                    if (!value) {
                        return [[Lang.Blocks.no_target, 'null']];
                    }
                    return categoryMap[value].sub.map((category) => [
                        Lang.Blocks[`behaviorConduct${category}`],
                        category,
                    ]);
                },
                needDeepCopy: true,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
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

    const getBehavior = (params, defaultValue, index = null) => {
        const key = `behaviorConduct-${params.category}/${params.subCategory}`;
        return new PromiseManager()
            .Promise((resolve) => {
                callApi(key, {
                    url: `${Entry.EXPANSION_BLOCK.behaviorConductDisaster.api}/${params.category}/${params.subCategory}`,
                })
                    .then((result) => {
                        if (result) {
                            const items = result.data.response.body.items.item.filter(
                                (i) =>
                                    i.hasOwnProperty('actRmks') &&
                                    i.safetyCate3 == params.subCategory2
                            );
                            if (index) {
                                return resolve(items[index - 1].actRmks);
                            }
                            return resolve(items.length);
                        }
                        return resolve(defaultValue);
                    })
                    .catch(() => resolve(defaultValue));
            })
            .catch(() => defaultValue);
    };

    return {
        behaviorConductDisaster_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.behaviorConductDisaster_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'behaviorConductDisaster_title',
            },
            class: 'behaviorConductDisaster',
            isNotFor: ['behaviorConductDisaster'],
            events: {},
        },
        count_disaster_behavior: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [params.getCategory(), params.getSubCategory()],
            events: {},
            def: {
                params: [params.getCategory().value, null],
                type: 'count_disaster_behavior',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value'],
                type: 'count_disaster_behavior',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
            },
            class: 'behaviorConductDisaster',
            isNotFor: ['behaviorConductDisaster'],
            func(sprite, script) {
                const params = {
                    category: Entry.EXPANSION_BLOCK.behaviorConductDisaster.apiType,
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getBehavior(params, 0);
            },
            syntax: {
                js: [],
                py: [],
            },
        },
        get_disaster_behavior: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                params.getCategory(),
                params.getSubCategory(),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [params.getCategory().value, null, 1],
                type: 'get_disaster_behavior',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_disaster_behavior',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
                NUMBER: 2,
            },
            class: 'behaviorConductDisaster',
            isNotFor: ['behaviorConductDisaster'],
            func(sprite, script) {
                const number = script.getStringValue('NUMBER', script);
                const defaultValue = Lang.Blocks.no_data;
                const params = {
                    category: Entry.EXPANSION_BLOCK.behaviorConductDisaster.apiType,
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getBehavior(params, defaultValue, number);
            },
            syntax: {
                js: [],
                py: [],
            },
        },
    };
};
