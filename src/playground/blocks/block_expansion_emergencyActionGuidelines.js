'use strict';

const PromiseManager = require('../../core/promiseManager');
const { callApi } = require('../../util/common');

function getInitialCategoryMap() {
    return {
        '01': {
            '01001': {
                lang: Lang.Blocks.emergencyActionGuidelines01001,
                sub: ['01001001', '01001002', '01001003'],
            },
            '01002': {
                lang: Lang.Blocks.emergencyActionGuidelines01002,
                sub: ['01002001', '01002002', '01002003', '01002004'],
            },
            '01003': {
                lang: Lang.Blocks.emergencyActionGuidelines01003,
                sub: ['01003001', '01003002', '01003003', '01003004'],
            },
            '01004': {
                lang: Lang.Blocks.emergencyActionGuidelines01004,
                sub: ['01004001', '01004002', '01004003'],
            },
            '01005': {
                lang: Lang.Blocks.emergencyActionGuidelines01005,
                sub: ['01005001', '01005002', '01005003', '01005004'],
            },
            '01006': {
                lang: Lang.Blocks.emergencyActionGuidelines01006,
                sub: ['01006001', '01006002'],
            },
            '01007': {
                lang: Lang.Blocks.emergencyActionGuidelines01007,
                sub: ['01007001'],
            },
            '01008': {
                lang: Lang.Blocks.emergencyActionGuidelines01008,
                sub: ['01008001', '01008002', '01008003', '01008004'],
            },
            '01009': {
                lang: Lang.Blocks.emergencyActionGuidelines01009,
                sub: ['01009001', '01009002', '01009003'],
            },
            '01010': {
                lang: Lang.Blocks.emergencyActionGuidelines01010,
                sub: ['01010001', '01010002'],
            },
            '01011': {
                lang: Lang.Blocks.emergencyActionGuidelines01011,
                sub: ['01011007', '01011008', '01011009', '01011010', '01011012'],
            },
            '01012': {
                lang: Lang.Blocks.emergencyActionGuidelines01012,
                sub: ['01012005', '01012006'],
            },
            '01013': {
                lang: Lang.Blocks.emergencyActionGuidelines01013,
                sub: ['01013001', '01013002', '01013003', '01013004', '01013005'],
            },
            '01014': {
                lang: Lang.Blocks.emergencyActionGuidelines01014,
                sub: ['01014001', '01014002', '01014003', '01014004'],
            },
            '01015': {
                lang: Lang.Blocks.emergencyActionGuidelines01015,
                sub: ['01015001', '01015002', '01015003'],
            },
        },
        '02': {
            '02001': {
                lang: Lang.Blocks.emergencyActionGuidelines02001,
                sub: ['02001001', '02001002', '02001003'],
            },
            '02002': {
                lang: Lang.Blocks.emergencyActionGuidelines02002,
                sub: ['02002001', '02002002'],
            },
            '02003': {
                lang: Lang.Blocks.emergencyActionGuidelines02003,
                sub: ['02003001', '02003002', '02003003'],
            },
            '02004': {
                lang: Lang.Blocks.emergencyActionGuidelines02004,
                sub: ['02004001', '02004002'],
            },
            '02005': {
                lang: Lang.Blocks.emergencyActionGuidelines02005,
                sub: ['02005001', '02005002', '02005003', '02005004', '02005005'],
            },
            '02006': {
                lang: Lang.Blocks.emergencyActionGuidelines02006,
                sub: ['02006001', '02006002', '02006003'],
            },
            '02007': {
                lang: Lang.Blocks.emergencyActionGuidelines02007,
                sub: ['02007001', '02007002', '02007003'],
            },
            '02008': {
                lang: Lang.Blocks.emergencyActionGuidelines02008,
                sub: ['02008001', '02008002'],
            },
            '02009': {
                lang: Lang.Blocks.emergencyActionGuidelines02009,
                sub: ['02009001', '02009002', '02009003'],
            },
            '02010': {
                lang: Lang.Blocks.emergencyActionGuidelines02010,
                sub: ['02010001', '02010002', '02010003', '02010004'],
            },
            '02011': {
                lang: Lang.Blocks.emergencyActionGuidelines02011,
                sub: [
                    '02011001',
                    '02011002',
                    '02011003',
                    '02011004',
                    '02011005',
                    '02011006',
                    '02011007',
                    '02011008',
                    '02011009',
                    '02011010',
                    '02011011',
                    '02011012',
                    '02011013',
                    '02011014',
                    '02011015',
                ],
            },
            '02012': {
                lang: Lang.Blocks.emergencyActionGuidelines02012,
                sub: [
                    '02012001',
                    '02012002',
                    '02012003',
                    '02012004',
                    '02012005',
                    '02012006',
                    '02012007',
                ],
            },
            '02013': {
                lang: Lang.Blocks.emergencyActionGuidelines02013,
                sub: [
                    '02013001',
                    '02013002',
                    '02013003',
                    '02013004',
                    '02013005',
                    '02013007',
                    '02013008',
                    '02013009',
                    '02013010',
                ],
            },
            '02014': {
                lang: Lang.Blocks.emergencyActionGuidelines02014,
                sub: ['02014001', '02014002', '02014003'],
            },
            '02015': {
                lang: Lang.Blocks.emergencyActionGuidelines02015,
                sub: ['02015001', '02015004'],
            },
            '02016': {
                lang: Lang.Blocks.emergencyActionGuidelines02016,
                sub: ['02016001'],
            },
            '02017': {
                lang: Lang.Blocks.emergencyActionGuidelines02017,
                sub: ['02017001'],
            },
            '02018': {
                lang: Lang.Blocks.emergencyActionGuidelines02018,
                sub: ['02018001', '02018002', '02018003'],
            },
            '02019': {
                lang: Lang.Blocks.emergencyActionGuidelines02019,
                sub: [
                    '02019001',
                    '02019002',
                    '02019003',
                    '02019004',
                    '02019005',
                    '02019006',
                    '02019007',
                    '02019008',
                    '02019009',
                    '02019010',
                    '02019011',
                    '02019012',
                    '02019013',
                    '02019014',
                    '02019015',
                    '02019016',
                ],
            },
            '02020': {
                lang: Lang.Blocks.emergencyActionGuidelines02020,
                sub: ['02020001', '02020002'],
            },
            '02021': {
                lang: Lang.Blocks.emergencyActionGuidelines02021,
                sub: [
                    '02021001',
                    '02021002',
                    '02021003',
                    '02021004',
                    '02021005',
                    '02021006',
                    '02021007',
                    '02021008',
                    '02021009',
                    '02021010',
                    '02021011',
                ],
            },
            '02022': {
                lang: Lang.Blocks.emergencyActionGuidelines02022,
                sub: [
                    '02022007',
                    '02022008',
                    '02022009',
                    '02022010',
                    '02022011',
                    '02022012',
                    '02022013',
                    '02022014',
                    '02022015',
                    '02022016',
                    '02022017',
                ],
            },
            '02023': {
                lang: Lang.Blocks.emergencyActionGuidelines02023,
                sub: ['02023001'],
            },
        },
        '03': {
            '03002': {
                lang: Lang.Blocks.emergencyActionGuidelines03002,
                sub: [
                    '03002001',
                    '03002002',
                    '03002003',
                    '03002004',
                    '03002005',
                    '03002006',
                    '03002007',
                ],
            },
            '03003': {
                lang: Lang.Blocks.emergencyActionGuidelines03003,
                sub: ['03003001', '03003002', '03003003'],
            },
            '03004': {
                lang: Lang.Blocks.emergencyActionGuidelines03004,
                sub: ['03004001', '03004002', '03004003', '03004004'],
            },
            '03005': {
                lang: Lang.Blocks.emergencyActionGuidelines03005,
                sub: ['03005001', '03005002'],
            },
            '03006': {
                lang: Lang.Blocks.emergencyActionGuidelines03006,
                sub: ['03006001', '03006002', '03006003'],
            },
            '03007': {
                lang: Lang.Blocks.emergencyActionGuidelines03007,
                sub: [
                    '03007001',
                    '03007002',
                    '03007003',
                    '03007004',
                    '03007005',
                    '03007006',
                    '03007007',
                ],
            },
            '03008': {
                lang: Lang.Blocks.emergencyActionGuidelines03008,
                sub: ['03008001'],
            },
            '03009': {
                lang: Lang.Blocks.emergencyActionGuidelines03009,
                sub: ['03009001'],
            },
            '03010': {
                lang: Lang.Blocks.emergencyActionGuidelines03010,
                sub: ['03010001'],
            },
            '03011': {
                lang: Lang.Blocks.emergencyActionGuidelines03011,
                sub: ['03011001'],
            },
            '03012': {
                lang: Lang.Blocks.emergencyActionGuidelines03012,
                sub: ['03012001'],
            },
            '03013': {
                lang: Lang.Blocks.emergencyActionGuidelines03013,
                sub: ['03013001', '03013002', '03013003', '03013004', '03013005'],
            },
            '03014': {
                lang: Lang.Blocks.emergencyActionGuidelines03014,
                sub: ['03014001', '03014002', '03014003', '03014004', '03014005', '03014006'],
            },
            '03015': {
                lang: Lang.Blocks.emergencyActionGuidelines03015,
                sub: [
                    '03015001',
                    '03015002',
                    '03015003',
                    '03015004',
                    '03015005',
                    '03015006',
                    '03015007',
                ],
            },
            '03016': {
                lang: Lang.Blocks.emergencyActionGuidelines03016,
                sub: ['03016001', '03016002'],
            },
        },
    };
}

const defaultCategory = {
    '01': '01001',
    '02': '02001',
    '03': '03002',
};

Entry.EXPANSION_BLOCK.emergencyActionGuidelines = {
    name: 'emergencyActionGuidelines',
    imageName: 'guideline.png',
    title: {
        ko: '국민행동요령',
        en: 'Emergency action guidelines',
    },
    titleKey: 'template.emergencyActionGuidelines_title_text',
    description: Lang.Msgs.expansion_emergencyActionGuidelines_description,
    descriptionKey: 'Msgs.expansion_emergencyActionGuidelines_description',
    isInitialized: false,
    init() {
        if (this.isInitialized) {
            return;
        }
        Entry.EXPANSION_BLOCK.emergencyActionGuidelines.isInitialized = true;
    },
    api: '/api/expansionBlock/emergencyActionGuidelines',
    apiType: '01',
};

const getGuideline = (params, defaultValue, index = null) => {
    const key = `emergencyActionGuidelines-${params.category}-${params.subCategory}`;
    const promiseManager = new PromiseManager();
    const job = promiseManager
        // eslint-disable-next-line new-cap
        .Promise((resolve) => {
            callApi(key, {
                // eslint-disable-next-line max-len
                url: `${Entry.EXPANSION_BLOCK.emergencyActionGuidelines.api}/${params.category}/${params.subCategory}`,
            })
                .then((result) => {
                    if (result) {
                        const items = result.data.body.filter(
                            (i) =>
                                i.hasOwnProperty('actRmks') && i.safety_cate3 == params.subCategory2
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

    return job;
};

Entry.EXPANSION_BLOCK.emergencyActionGuidelines.getBlocks = function () {
    const categoryMap = getInitialCategoryMap();
    const categoryDisasterMap = getInitialCategoryMap();
    const getCategories = function (cate1) {
        return Object.keys(categoryMap[cate1]).map((cate2) => [
            categoryMap[cate1][cate2].lang,
            cate2,
        ]);
    };

    const getCategory = (cate1 = '01', isPython) => {
        const param = {
            type: 'Dropdown',
            options: getCategories(cate1),
            value: defaultCategory[cate1],
            fontSize: 11,
            bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
            arrowColor: EntryStatic.colorSet.common.WHITE,
            dropdownSync: 'emergencyAction',
        };
        if (isPython) {
            param.converter = Entry.block.converters.returnStringValue;
        }
        return param;
    };

    const getSubCategory = (cate1 = '01', isPython = false) => {
        const param = {
            type: 'DropdownDynamic',
            value: null,
            menuName() {
                const value = this.getTargetValue('emergencyAction');
                if (!value) {
                    return [[Lang.Blocks.no_target, 'null']];
                }
                return categoryMap[cate1][value].sub.map((category) => [
                    Lang.Blocks[`emergencyActionGuidelines${category}`],
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
    };

    return {
        emergencyActionGuidelines_title: {
            template: '%1',
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.emergencyActionGuidelines_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'emergencyActionGuidelines_title',
            },
            class: 'emergencyActionGuidelines',
            isNotFor: ['emergencyActionGuidelines'],
            events: {},
        },
        count_disaster_guideline: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [getCategory('01'), getSubCategory('01')],
            events: {},
            def: {
                params: [getCategory('01').value, null],
                type: 'count_disaster_guideline',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value'],
                type: 'count_disaster_guideline',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
            },
            class: 'emergencyActionGuidelines',
            isNotFor: ['emergencyActionGuidelines'],
            func(sprite, script) {
                const params = {
                    category: '01',
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getGuideline(params, 0);
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'emergencyActionGuidelines',
        },
        get_disaster_guideline: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                getCategory('01'),
                getSubCategory('01'),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [getCategory('01').value, null, 1],
                type: 'get_disaster_guideline',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_disaster_guideline',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
                NUMBER: 2,
            },
            class: 'emergencyActionGuidelines',
            isNotFor: ['emergencyActionGuidelines'],
            func(sprite, script) {
                const number = script.getStringValue('NUMBER', script);
                const defaultValue = Lang.Blocks.no_data;
                const params = {
                    category: '01',
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getGuideline(params, defaultValue, number);
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'emergencyActionGuidelines',
        },
        count_social_disaster_guideline: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [getCategory('02'), getSubCategory('02')],
            events: {},
            def: {
                params: [getCategory('02').value, null],
                type: 'count_social_disaster_guideline',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value'],
                type: 'count_social_disaster_guideline',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
            },
            class: 'emergencyActionGuidelines',
            isNotFor: ['emergencyActionGuidelines'],
            func(sprite, script) {
                const params = {
                    category: '02',
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getGuideline(params, 0);
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'emergencyActionGuidelines',
        },
        get_social_disaster_guideline: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                getCategory('02'),
                getSubCategory('02'),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [getCategory('02').value, null, 1],
                type: 'get_social_disaster_guideline',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_social_disaster_guideline',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
                NUMBER: 2,
            },
            class: 'emergencyActionGuidelines',
            isNotFor: ['emergencyActionGuidelines'],
            func(sprite, script) {
                const number = script.getStringValue('NUMBER', script);
                const defaultValue = Lang.Blocks.no_data;
                const params = {
                    category: '02',
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getGuideline(params, defaultValue, number);
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'emergencyActionGuidelines',
        },
        count_safety_accident_guideline: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [getCategory('03'), getSubCategory('03')],
            events: {},
            def: {
                params: [getCategory('03').value, null],
                type: 'count_safety_accident_guideline',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value'],
                type: 'count_safety_accident_guideline',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
            },
            class: 'emergencyActionGuidelines',
            isNotFor: ['emergencyActionGuidelines'],
            func(sprite, script) {
                const params = {
                    category: '03',
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getGuideline(params, 0);
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'emergencyActionGuidelines',
        },
        get_safety_accident_guideline: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                getCategory('03'),
                getSubCategory('03'),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [getCategory('03').value, null, 1],
                type: 'get_safety_accident_guideline',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_safety_accident_guideline',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                SUB_CATEGORY: 1,
                NUMBER: 2,
            },
            class: 'emergencyActionGuidelines',
            isNotFor: ['emergencyActionGuidelines'],
            func(sprite, script) {
                const number = script.getStringValue('NUMBER', script);
                const defaultValue = Lang.Blocks.no_data;
                const params = {
                    category: '03',
                    subCategory: script.getField('CATEGORY', script),
                    subCategory2: script.getField('SUB_CATEGORY', script),
                };

                return getGuideline(params, defaultValue, number);
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'emergencyActionGuidelines',
        },
    };
};
