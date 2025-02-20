'use strict';

const PromiseManager = require('../../core/promiseManager');
const { callApi } = require('../../util/common');

Entry.EXPANSION_BLOCK.disasterAlert = {
    name: 'disasterAlert',
    imageName: 'disasterAlert.png',
    title: {
        ko: '재난문자',
        en: 'Disaster alert',
    },
    titleKey: 'template.disaster_alert_title_text',
    description: Lang.Msgs.expansion_disasterAlert_description,
    descriptionKey: 'Msgs.expansion_disasterAlert_description',
    isInitialized: false,
    init() {
        if (this.isInitialized) {
            return;
        }
        Entry.EXPANSION_BLOCK.disasterAlert.isInitialized = true;
    },
    api: '/api/expansionBlock/disasterAlert',
    apiType: '01',
};

const EMERGENCY_CATEGORY_MAP = {
    info: Lang.Blocks.disasterAlertTypeInfo,
    exigency: Lang.Blocks.disasterAlertTypeExigency,
    urgency: Lang.Blocks.disasterAlertTypeUrgency,
};

const getDisasterAlert = (params, defaultValue) => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const key = `disasterAlert-${day}-${hour}`;
    const promiseManager = new PromiseManager();
    const job = promiseManager
        // eslint-disable-next-line new-cap
        .Promise((resolve) => {
            callApi(key, {
                url: `${Entry.EXPANSION_BLOCK.disasterAlert.api}`,
            })
                .then((result) => {
                    if (result) {
                        let items = result?.data?.body || [];
                        const category = EMERGENCY_CATEGORY_MAP?.[params?.category];
                        if (category) {
                            items = items.filter((item) => item.EMRG_STEP_NM === category);
                        }
                        switch (params.command) {
                            case 'count':
                                return resolve(items?.length || defaultValue || 0);
                            case 'get':
                                const result = items?.[params?.index - 1]?.[params.option];
                                if (!result) {
                                    return resolve(defaultValue);
                                }
                                if (params?.option === 'REG_YMD') {
                                    return resolve(new Date(result).toLocaleString());
                                }
                                return resolve(result);
                            case 'exist':
                                return resolve(items?.length > 0);
                            default:
                                return resolve(defaultValue);
                        }
                    }
                    return resolve(defaultValue);
                })
                .catch(() => resolve(defaultValue));
        })
        .catch(() => defaultValue);

    return job;
};

Entry.EXPANSION_BLOCK.disasterAlert.getBlocks = function () {
    // 전체, 안전안내, 긴급재난, 위급재난
    const DisasterAlertCategory = {
        type: 'Dropdown',
        options: [
            [Lang.Blocks.disasterAlertTypeAll, 'all'],
            [Lang.Blocks.disasterAlertTypeInfo, 'info'],
            [Lang.Blocks.disasterAlertTypeExigency, 'exigency'],
            [Lang.Blocks.disasterAlertTypeUrgency, 'urgency'],
        ],
        value: 'all',
        fontSize: 11,
        bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
        arrowColor: EntryStatic.colorSet.common.WHITE,
    };
    // 내용, 수신지역, 긴급단계, 재해구분, 생성일시
    const DisasterAlertOptions = {
        type: 'Dropdown',
        options: [
            [Lang.Blocks.disasterAlertContents, 'MSG_CN'],
            [Lang.Blocks.disasterAlertRegeion, 'RCPTN_RGN_NM'],
            [Lang.Blocks.disasterAlertStep, 'EMRG_STEP_NM'],
            [Lang.Blocks.disasterAlertDisaster, 'DST_SE_NM'],
            [Lang.Blocks.disasterAlertRegisterDate, 'REG_YMD'],
        ],
        value: 'MSG_CN',
        fontSize: 11,
        bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
        arrowColor: EntryStatic.colorSet.common.WHITE,
    };

    return {
        disaster_alert_title: {
            template: '%1',
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.disaster_alert_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'disaster_alert_title',
            },
            class: 'disasterAlert',
            isNotFor: ['disasterAlert'],
            events: {},
        },
        count_disaster_alert: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [DisasterAlertCategory],
            events: {},
            def: {
                params: [DisasterAlertCategory.value],
                type: 'count_disaster_alert',
            },
            pyHelpDef: {
                params: ['A&value'],
                type: 'count_disaster_alert',
            },
            paramsKeyMap: {
                CATEGORY: 0,
            },
            class: 'disasterAlert',
            isNotFor: ['disasterAlert'],
            func(sprite, script) {
                const category = script.getField('CATEGORY', script);
                return getDisasterAlert(
                    {
                        command: 'count',
                        category,
                    },
                    0
                );
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'disasterAlert',
        },
        get_disaster_alert: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                DisasterAlertCategory,
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                DisasterAlertOptions,
            ],
            events: {},
            def: {
                params: [DisasterAlertCategory.value, 1, DisasterAlertOptions.value],
                type: 'get_disaster_alert',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_disaster_alert',
            },
            paramsKeyMap: {
                CATEGORY: 0,
                NUMBER: 1,
                OPTION: 2,
            },
            class: 'disasterAlert',
            isNotFor: ['disasterAlert'],
            func(sprite, script) {
                const number = script.getStringValue('NUMBER', script);
                const category = script.getField('CATEGORY', script);
                const option = script.getField('OPTION', script);
                return getDisasterAlert({
                    command: 'get',
                    category,
                    index: number,
                    option,
                });
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'disasterAlert',
        },
        check_disaster_alert: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [DisasterAlertCategory],
            events: {},
            def: {
                params: [DisasterAlertCategory.value],
                type: 'check_disaster_alert',
            },
            pyHelpDef: {
                params: ['B&value', null],
                type: 'check_disaster_alert',
            },
            paramsKeyMap: {
                CATEGORY: 0,
            },
            class: 'disasterAlert',
            isNotFor: ['disasterAlert'],
            async func(sprite, script) {
                const category = script.getField('CATEGORY', script);
                return getDisasterAlert({
                    command: 'exist',
                    category,
                });
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'disasterAlert',
        },
    };
};
