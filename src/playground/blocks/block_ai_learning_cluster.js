import { DropDownDynamicGenerator } from './block_ai_learning';

module.exports = {
    getBlocks() {
        return {
            learning_title_cluster: {
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.learning_title_cluster_str,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'learning_title_cluster',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_cluster'],
                events: {},
            },
            set_cluster_option_k: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/ai_utilize_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [0, null],
                    type: 'set_cluster_option_k',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_cluster_option_k',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_cluster'],
                async func(sprite, script) {
                    const value = script.getStringValue('VALUE', script);
                    Entry.aiLearning.setTrainOption('k', parseInt(value, 10));
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            set_cluster_option_centroids: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.cluster_option_centroids_kmpp, 'kmpp'],
                            [Lang.AiLearning.cluster_option_centroids_random, 'random'],
                        ],
                        value: 'kmpp',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/ai_utilize_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'set_cluster_option_centroids',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_cluster_option_centroids',
                },
                paramsKeyMap: {
                    CENTRIOD_TYPE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_cluster'],
                async func(sprite, script) {
                    const value = script.getField('CENTRIOD_TYPE');
                    Entry.aiLearning.setTrainOption('initialCentroids', value);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_count: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                def: {
                    params: [],
                    type: 'get_cluster_centriod_count',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_count',
                },
                paramsKeyMap: {},
                class: 'ai_learning',
                isNotFor: ['ai_learning_cluster'],
                func(sprite, script) {
                    const { k = 0 } = Entry.aiLearning.getTrainOption() || {};
                    return k;
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_value: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tableAttrFields,
                        needDeepCopy: true,
                        fontSize: 11,
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                        defaultValue: (value, options) => {
                            if (options[0] && options[0][1]) {
                                return options[0][1];
                            }
                            return value || 0;
                        },
                    },
                ],
                events: {},
                def: {
                    params: [1, 0],
                    type: 'get_cluster_centriod_value',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_value',
                },
                paramsKeyMap: {
                    K: 0,
                    ATTR: 1,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_cluster'],
                func(sprite, script) {
                    const k = script.getNumberValue('K');
                    const attr = script.getField('ATTR');
                    const { centroids } = Entry.aiLearning.getTrainResult();
                    return centroids?.[k - 1]?.[attr] || NaN;
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_index_1: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[0]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                def: {
                    type: 'get_cluster_centriod_index_1',
                },
                events: {},
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_index_1',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                },
                class: 'ai_learning',
                isNotFor: ['cluster_attr_1'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    await Entry.aiLearning.predict([x]);
                    return Entry.aiLearning.getPredictResult();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_index_2: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[0]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[1]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                def: {
                    type: 'get_cluster_centriod_index_2',
                },
                events: {},
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_index_2',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                },
                class: 'ai_learning',
                isNotFor: ['cluster_attr_2'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    await Entry.aiLearning.predict([x, y]);
                    return Entry.aiLearning.getPredictResult();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_index_3: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[0]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[1]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[2]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                def: {
                    type: 'get_cluster_centriod_index_3',
                },
                events: {},
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_index_3',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                },
                class: 'ai_learning',
                isNotFor: ['cluster_attr_3'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    const z = script.getNumberValue('ATTR3', script);
                    await Entry.aiLearning.predict([x, y, z]);
                    return Entry.aiLearning.getPredictResult();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_index_4: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[0]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[1]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[2]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[3]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                def: {
                    type: 'get_cluster_centriod_index_4',
                },
                events: {},
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_index_4',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                },
                class: 'ai_learning',
                isNotFor: ['cluster_attr_4'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    await Entry.aiLearning.predict([a, b, c, d]);
                    return Entry.aiLearning.getPredictResult();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_index_5: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[0]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[1]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[2]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[3]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[4]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                def: {
                    type: 'get_cluster_centriod_index_5',
                },
                events: {},
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_index_5',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    ATTR5: 9,
                },
                class: 'ai_learning',
                isNotFor: ['cluster_attr_5'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    await Entry.aiLearning.predict([a, b, c, d, e]);
                    return Entry.aiLearning.getPredictResult();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_cluster',
            },
            get_cluster_centriod_index_6: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[0]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[1]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[2]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[3]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[4]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return fields[select?.[0]?.[5]] || Lang.AiLearning.model_attr_str;
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                def: {
                    type: 'get_cluster_centriod_index_6',
                },
                events: {},
                pyHelpDef: {
                    params: [],
                    type: 'get_cluster_centriod_index_6',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    ATTR5: 9,
                    ATTR6: 11,
                },
                class: 'ai_learning',
                isNotFor: ['cluster_attr_6'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    const f = script.getNumberValue('ATTR6', script);
                    await Entry.aiLearning.predict([a, b, c, d, e, f]);
                    return Entry.aiLearning.getPredictResult();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            wikiClass: 'ai_cluster',
        };
    },
};
