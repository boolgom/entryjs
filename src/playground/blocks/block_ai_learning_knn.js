import { DropDownDynamicGenerator } from './block_ai_learning';

module.exports = {
    getBlocks() {
        return {
            learning_title_number: {
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.learning_title_number_str,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'learning_title_number',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_number'],
                events: {},
            },
            set_number_learning_option_k: {
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
                    params: [10, null],
                    type: 'set_number_learning_option_k',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_number_learning_option_k',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_number'],
                async func(sprite, script) {
                    const value = script.getNumberValue('VALUE', script);
                    Entry.aiLearning.setTrainOption('neighbors', parseInt(value));
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_1: {
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
                events: {},
                def: {
                    type: 'get_number_learning_predict_1',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_1',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_1'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    await Entry.aiLearning.predict([x]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_2: {
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
                events: {},
                def: {
                    type: 'get_number_learning_predict_2',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_2',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_2'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    await Entry.aiLearning.predict([x, y]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_3: {
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
                events: {},
                def: {
                    type: 'get_number_learning_predict_3',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_3',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_3'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    const z = script.getNumberValue('ATTR3', script);
                    await Entry.aiLearning.predict([x, y, z]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_4: {
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
                events: {},
                def: {
                    type: 'get_number_learning_predict_4',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_4',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_4'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    await Entry.aiLearning.predict([a, b, c, d]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_5: {
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
                events: {},
                def: {
                    type: 'get_number_learning_predict_5',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_5',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    ATTR5: 9,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_5'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    await Entry.aiLearning.predict([a, b, c, d, e]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_6: {
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
                events: {},
                def: {
                    type: 'get_number_learning_predict_6',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_6',
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
                isNotFor: ['number_learning_attr_6'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    const f = script.getNumberValue('ATTR6', script);
                    await Entry.aiLearning.predict([a, b, c, d, e, f]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_param_1: {
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    {
                        type: 'Dropdown',
                        options: [
                            // [Lang.AiLearning.probability, 'probability'],
                            [Lang.AiLearning.neighbor_count, 'count'],
                        ],
                        value: 'count',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'get_number_learning_predict_param_1',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_param_1',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    CLASS: 2,
                    OPTION: 3,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_1'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const clazz = script.getField('CLASS', script);
                    const option = script.getField('OPTION', script);
                    await Entry.aiLearning.predict([x]);
                    const result = Entry.aiLearning.getPredictResult();
                    const classData = result.find(({ className }) => className === clazz) || {};
                    return classData[option] || 0;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_param_2: {
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    {
                        type: 'Dropdown',
                        options: [
                            // [Lang.AiLearning.probability, 'probability'],
                            [Lang.AiLearning.neighbor_count, 'count'],
                        ],
                        value: 'count',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'get_number_learning_predict_param_2',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_param_2',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    CLASS: 4,
                    OPTION: 5,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_2'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    const clazz = script.getField('CLASS', script);
                    const option = script.getField('OPTION', script);
                    await Entry.aiLearning.predict([x, y]);
                    const result = Entry.aiLearning.getPredictResult();
                    const classData = result.find(({ className }) => className === clazz) || {};
                    return classData[option] || 0;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_param_3: {
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    {
                        type: 'Dropdown',
                        options: [
                            // [Lang.AiLearning.probability, 'probability'],
                            [Lang.AiLearning.neighbor_count, 'count'],
                        ],
                        value: 'count',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'get_number_learning_predict_param_3',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_param_3',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    CLASS: 6,
                    OPTION: 7,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_3'],
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    const z = script.getNumberValue('ATTR3', script);
                    const clazz = script.getField('CLASS', script);
                    const option = script.getField('OPTION', script);
                    await Entry.aiLearning.predict([x, y, z]);
                    const result = Entry.aiLearning.getPredictResult();
                    const classData = result.find(({ className }) => className === clazz) || {};
                    return classData[option] || 0;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_param_4: {
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    {
                        type: 'Dropdown',
                        options: [
                            // [Lang.AiLearning.probability, 'probability'],
                            [Lang.AiLearning.neighbor_count, 'count'],
                        ],
                        value: 'count',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'get_number_learning_predict_param_4',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_param_4',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    CLASS: 8,
                    OPTION: 9,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_4'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const clazz = script.getField('CLASS', script);
                    const option = script.getField('OPTION', script);
                    await Entry.aiLearning.predict([a, b, c, d]);
                    const result = Entry.aiLearning.getPredictResult();
                    const classData = result.find(({ className }) => className === clazz) || {};
                    return classData[option] || 0;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_param_5: {
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    {
                        type: 'Dropdown',
                        options: [
                            // [Lang.AiLearning.probability, 'probability'],
                            [Lang.AiLearning.neighbor_count, 'count'],
                        ],
                        value: 'count',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'get_number_learning_predict_param_5',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_param_5',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    ATTR5: 9,
                    CLASS: 10,
                    OPTION: 11,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_5'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    const clazz = script.getField('CLASS', script);
                    const option = script.getField('OPTION', script);
                    await Entry.aiLearning.predict([a, b, c, d, e]);
                    const result = Entry.aiLearning.getPredictResult();
                    const classData = result.find(({ className }) => className === clazz) || {};
                    return classData[option] || 0;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_number_learning_predict_param_6: {
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
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    {
                        type: 'Dropdown',
                        options: [
                            // [Lang.AiLearning.probability, 'probability'],
                            [Lang.AiLearning.neighbor_count, 'count'],
                        ],
                        value: 'count',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'get_number_learning_predict_param_6',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_number_learning_predict_param_6',
                },
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    ATTR5: 9,
                    ATTR6: 11,
                    CLASS: 12,
                    OPTION: 13,
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_6'],
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    const f = script.getNumberValue('ATTR6', script);
                    const clazz = script.getField('CLASS', script);
                    const option = script.getField('OPTION', script);
                    await Entry.aiLearning.predict([a, b, c, d, e, f]);
                    const result = Entry.aiLearning.getPredictResult();
                    const classData = result.find(({ className }) => className === clazz) || {};
                    return classData[option] || 0;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            is_number_learning_group_1: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    params: [0],
                    type: 'is_number_learning_group_1',
                },
                pyHelpDef: {
                    params: [],
                    type: 'is_number_learning_group_1',
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_1'],
                paramsKeyMap: {
                    ATTR1: 1,
                    CLASS: 2,
                },
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const clazz = script.getField('CLASS', script);
                    await Entry.aiLearning.predict([x]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className === clazz;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            is_number_learning_group_2: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    params: [0],
                    type: 'is_number_learning_group_2',
                },
                pyHelpDef: {
                    params: [],
                    type: 'is_number_learning_group_2',
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_2'],
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    CLASS: 4,
                },
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    const clazz = script.getField('CLASS', script);
                    await Entry.aiLearning.predict([x, y]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className === clazz;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            is_number_learning_group_3: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    params: [0],
                    type: 'is_number_learning_group_3',
                },
                pyHelpDef: {
                    params: [],
                    type: 'is_number_learning_group_3',
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_3'],
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    CLASS: 6,
                },
                async func(sprite, script) {
                    const x = script.getNumberValue('ATTR1', script);
                    const y = script.getNumberValue('ATTR2', script);
                    const z = script.getNumberValue('ATTR3', script);
                    const clazz = script.getField('CLASS', script);
                    await Entry.aiLearning.predict([x, y, z]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className === clazz;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            is_number_learning_group_4: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    params: [0],
                    type: 'is_number_learning_group_4',
                },
                pyHelpDef: {
                    params: [],
                    type: 'is_number_learning_group_4',
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_4'],
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    CLASS: 8,
                },
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const clazz = script.getField('CLASS', script);
                    await Entry.aiLearning.predict([a, b, c, d]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className === clazz;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            is_number_learning_group_5: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
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
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    params: [0],
                    type: 'is_number_learning_group_5',
                },
                pyHelpDef: {
                    params: [],
                    type: 'is_number_learning_group_5',
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_5'],
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    ATTR5: 9,
                    CLASS: 10,
                },
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    const clazz = script.getField('CLASS', script);
                    await Entry.aiLearning.predict([a, b, c, d, e]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className === clazz;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            is_number_learning_group_6: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
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
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.tablePredictDataDistinct,
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
                    params: [0],
                    type: 'is_number_learning_group_6',
                },
                pyHelpDef: {
                    params: [],
                    type: 'is_number_learning_group_6',
                },
                class: 'ai_learning',
                isNotFor: ['number_learning_attr_6'],
                paramsKeyMap: {
                    ATTR1: 1,
                    ATTR2: 3,
                    ATTR3: 5,
                    ATTR4: 7,
                    ATTR5: 9,
                    ATTR6: 11,
                    CLASS: 12,
                },
                async func(sprite, script) {
                    const a = script.getNumberValue('ATTR1', script);
                    const b = script.getNumberValue('ATTR2', script);
                    const c = script.getNumberValue('ATTR3', script);
                    const d = script.getNumberValue('ATTR4', script);
                    const e = script.getNumberValue('ATTR5', script);
                    const f = script.getNumberValue('ATTR6', script);
                    const clazz = script.getField('CLASS', script);
                    await Entry.aiLearning.predict([a, b, c, d, e, f]);
                    const [{ className }] = Entry.aiLearning.getPredictResult();
                    return className === clazz;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
        };
    },
};
