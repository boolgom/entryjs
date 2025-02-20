import _floor from 'lodash/floor';

const DropDownDynamicGenerator = {
    labels: () => {
        if (Entry?.aiLearning?.labels?.length) {
            return Entry.aiLearning.labels.map((name, index) => [name, index]);
        } else {
            return [[Lang.Blocks.no_target, 'null']];
        }
    },
    tableAttrFields: () => {
        const table = Entry.aiLearning?.getTableData?.();
        if (table) {
            const { select = [], fields } = table || {};
            const attr = select?.[0] || [];
            return attr.map((fieldIndex, idx) => [fields[fieldIndex], idx]);
        } else {
            return [[Lang.Blocks.no_target, 'null']];
        }
    },
    valueMap: () => {
        const valueMap =
            Object.values(
                Entry.aiLearning.getTrainResult()?.valueMap ||
                    Entry.aiLearning?.result?.valueMap ||
                    {}
            ) || [];

        if (valueMap?.length) {
            return valueMap.map((name) => [name, name]);
        } else {
            return [[Lang.Blocks.no_target, 'null']];
        }
    },
};

const createParamBlock = ({
    name,
    length,
    createFunc,
    skeleton = 'basic_string_field',
    params = [],
    type,
}) => {
    const result = {};
    new Array(length).fill(0).forEach((_, idx) => {
        const index = idx + 1;
        const blockName = `${name}_${index}`;
        const EmptyArray = new Array(index * 2).fill(0);
        const lastAttr = {
            key: 1,
            value: 1,
        };
        const paramsKeyMap = EmptyArray.reduce((acc, cur, idx, array) => {
            if (idx % 2 !== 0) {
                return acc;
            }
            const index = idx / 2 + 1;
            acc[`ATTR${index}`] = idx + 1;
            lastAttr.key = index;
            lastAttr.value = idx + 1;
            return acc;
        }, {});
        if (params.length) {
            params.forEach((p, i) => {
                paramsKeyMap[`ATTR${lastAttr.key + i + 1}`] = lastAttr.value + 1;
            });
        }
        result[blockName] = {
            color: EntryStatic.colorSet.block.default.AI_LEARNING,
            outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
            skeleton,
            statements: [],
            params: [
                ...EmptyArray.map((_, i) => {
                    if (i % 2 !== 0) {
                        return {
                            type: 'Block',
                            accept: 'string',
                            defaultType: 'number',
                        };
                    }
                    return {
                        type: 'TextDynamic',
                        setValue: () => {
                            const table = Entry.aiLearning?.getTableData?.();
                            if (table) {
                                const {
                                    select = [],
                                    fields = [],
                                } = Entry.aiLearning?.getTableData?.();
                                return (
                                    fields[select?.[0]?.[i / 2]] || Lang.AiLearning.model_attr_str
                                );
                            }
                            return Lang.AiLearning.model_attr_str;
                        },
                    };
                }),
                ...params,
            ],
            events: {},
            def: {
                type: blockName,
            },
            pyHelpDef: {
                params: [],
                type: blockName,
            },
            paramsKeyMap,
            class: 'ai_learning',
            isNotFor: Array.isArray(type) 
                ? type.map(element => `${element}_attr_${index}`) 
                : [`${type}_attr_${index}`],
            func: createFunc(paramsKeyMap),
            syntax: {
                js: [],
                py: [],
            },
        };
    });
    return result;
};

module.exports = {
    DropDownDynamicGenerator,
    createParamBlock,
    getBlocks() {
        return {
            ...predictBlocks,
            ...booleanPredictBlocks,
            learning_title_image: {
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.learning_title_image_str,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'learning_title_image',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_image'],
                events: {},
                wikiClass: 'ai_image',
            },
            learning_title_speech: {
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.learning_title_speech_str,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'learning_title_speech',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_speech'],
                events: {},
                wikiClass: 'ai_speech',
            },
            learning_title_text: {
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.learning_title_text_str,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'learning_title_text',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_text'],
                events: {},
                wikiClass: 'ai_text',
            },
            insert_data_for_test: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/ai_utilize_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'insert_data_for_test',
                },
                pyHelpDef: {
                    params: [],
                    type: 'insert_data_for_test',
                },
                paramsKeyMap: {},
                class: 'ai_learning',
                isNotFor: ['ai_learning_classification'],
                func(sprite, script) {
                    if (!script.isStart) {
                        script.isStart = true;
                        Entry.aiLearning.openInputPopup();
                        return script;
                    }
                    if (!Entry.aiLearning.isLoading) {
                        delete script.isStart;
                        return script.callReturn();
                    }
                    return script;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            video_capture_for_image_test: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.video_start, 'start'],
                            [Lang.Blocks.video_end, 'stop'],
                        ],
                        value: 'on',
                        fontSize: 11,
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
                    params: ['start', null],
                    type: 'video_capture_for_image_test',
                },
                pyHelpDef: {
                    params: [],
                    type: 'video_capture_for_image_test',
                },
                paramsKeyMap: {
                    MODE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_image'],
                async func(sprite, script) {
                    const mode = script.getField('MODE');
                    if (mode === 'start') {
                        Entry.aiLearning.startPredict();
                    } else {
                        Entry.aiLearning.stopPredict();
                    }
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_image',
            },
            insert_text_block_for_test: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
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
                    type: 'insert_text_block_for_test',
                },
                pyHelpDef: {
                    params: [],
                    type: 'insert_text_block_for_test',
                },
                paramsKeyMap: {
                    TEXT: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_text'],
                async func(sprite, script) {
                    const text = script.getStringValue('TEXT', script);
                    await Entry.aiLearning.predict(text);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'ai_text',
            },
            test_result: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                def: {
                    params: [null],
                    type: 'test_result',
                },
                pyHelpDef: {
                    params: [],
                    type: 'test_result',
                },
                paramsKeyMap: {},
                class: 'ai_learning',
                isNotFor: ['ai_learning_classification'],
                func(sprite, script) {
                    return Entry.aiLearning.getPredictResult().className;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            accuracy_of_result: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.labels,
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
                    type: 'accuracy_of_result',
                },
                pyHelpDef: {
                    params: [],
                    type: 'accuracy_of_result',
                },
                paramsKeyMap: {
                    GROUP: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_classification'],
                func(sprite, script) {
                    const group = script.getNumberValue('GROUP', script);
                    return Entry.aiLearning.getPredictResult(group).probability;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            is_group: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: DropDownDynamicGenerator.labels,
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
                    type: 'is_group',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_classification'],
                paramsKeyMap: {
                    GROUP: 0,
                },
                func(sprite, script) {
                    const group = script.getNumberValue('GROUP', script);
                    const { labels } = Entry.aiLearning;
                    const result = Entry.aiLearning.getPredictResult().className;
                    return result === labels[group];
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            retrain_model: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/ai_utilize_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'retrain_model',
                },
                pyHelpDef: {
                    params: [],
                    type: 'retrain_model',
                },
                paramsKeyMap: {
                    TEXT: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_train'],
                async func(sprite, script) {
                    Entry.aiLearning.train();
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            model_is_trained: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_boolean_field',
                statements: [],
                params: [],
                events: {},
                def: {
                    type: 'model_is_trained',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_train'],
                func(sprite, script) {
                    return Entry.aiLearning.isTrained();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            set_train_visible: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.show, 'show'],
                            [Lang.AiLearning.hide, 'hide'],
                        ],
                        value: 'show',
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
                    params: ['show', null],
                    type: 'set_train_visible',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_train_visible',
                },
                paramsKeyMap: {
                    VISIBLE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_train'],
                async func(sprite, script) {
                    const visible = script.getField('VISIBLE');
                    Entry.aiLearning.setVisible(visible === 'show');
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            set_train_chart: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.open, 'open'],
                            [Lang.AiLearning.close, 'close'],
                        ],
                        value: 'open',
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
                    params: ['open', null],
                    type: 'set_train_chart',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_train_chart',
                },
                paramsKeyMap: {
                    VISIBLE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_train_chart'],
                async func(sprite, script) {
                    const visible = script.getField('VISIBLE');
                    Entry.aiLearning.setChartVisible(visible === 'open');
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_result_info: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.accuracy, 'accuracy'],
                            [Lang.AiLearning.f1, 'f1'],
                            [Lang.AiLearning.precision, 'precision'],
                            [Lang.AiLearning.recall, 'recall'],
                        ],
                        value: 'accuracy',
                        fontSize: 11,
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'get_result_info',
                },
                pyHelpDef: {
                    params: [],
                    type: 'get_result_info',
                },
                paramsKeyMap: {
                    TYPE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_svm', 'ai_learning_logistic_regression', 'ai_learning_decisiontree'],
                async func(sprite, script) {
                    const type = script.getField('TYPE', script);
                    const result = Entry.aiLearning?.getTrainResult();
                    return result?.[type];
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
        };
    },
};

const predictBlocks = createParamBlock({
    type: ['svm', 'logistic_regression', 'decisiontree'],
    name: 'get_predict',
    length: 6,
    createFunc: (paramsKeyMap) => async (sprite, script) => {
        const params = Object.keys(paramsKeyMap).map((key) => script.getNumberValue(key, script));
        await Entry.aiLearning.predict(params);
        const result = Entry.aiLearning.getPredictResult();
        return result.sort((a, b) => b.probability - a.probability)[0].className;
    },
});
const booleanPredictBlocks = createParamBlock({
    type: ['svm', 'logistic_regression', 'decisiontree'],
    name: 'is_result',
    skeleton: 'basic_boolean_field',
    length: 6,
    createFunc: (paramsKeyMap) => async (sprite, script) => {
        const keys = Object.keys(paramsKeyMap);
        const predictKey = keys.pop();
        const params = keys.map((key) => script.getNumberValue(key, script));
        const predict = script.getStringField(predictKey, script);
        await Entry.aiLearning.predict(params);
        const predictResult = Entry.aiLearning.getPredictResult();
        const result = predictResult.sort((a, b) => b.probability - a.probability)[0];
        return result && !!result.probability && result.className === predict;
    },
    params: [
        {
            type: 'DropdownDynamic',
            value: null,
            menuName: DropDownDynamicGenerator.valueMap,
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
});