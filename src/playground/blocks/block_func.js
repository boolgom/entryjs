import _cloneDeep from 'lodash/cloneDeep';

module.exports = {
    getBlocks() {
        return {
            functionAddButton: {
                skeleton: 'basic_button',
                color: EntryStatic.colorSet.common.BUTTON_BACKGROUND,
                isNotFor: ['functionInit'],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Workspace.function_create,
                        color: EntryStatic.colorSet.common.BUTTON,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'functionAddButton',
                },
                events: {
                    mousedown: [
                        function () {
                            Entry.do('funcEditStart', Entry.generateHash());
                        },
                    ],
                },
            },
            function_name: {
                template: '%1',
                skeleton: 'basic_text',
                skeletonOptions: {
                    contentPos: {
                        x: 5,
                    },
                },
                color: EntryStatic.colorSet.common.TRANSPARENT,
                fontColor: EntryStatic.colorSet.common.TEXT,
                params: [
                    {
                        type: 'Text',
                        text: '',
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'left',
                    },
                ],
                class: 'properties',
                isNotFor: ['functionEdit'],
                events: {},
            },
            showFunctionPropsButton: {
                template: '%1',
                skeleton: 'basic_button',
                color: EntryStatic.colorSet.common.BUTTON_BACKGROUND,
                class: 'properties',
                isNotFor: ['functionEdit'],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Workspace.function_attribute,
                        color: EntryStatic.colorSet.common.BUTTON,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'showFunctionPropsButton',
                },
                events: {
                    mousedown: [
                        function () {
                            Entry.do(
                                'playgroundChangeViewMode',
                                'variable',
                                Entry.playground.selectedViewMode
                            );
                            Entry.variableContainer.selectFilter('func');
                            Entry.variableContainer.select(Entry.Func.targetFunc);
                        },
                    ],
                },
                wikiClass: 'function',
            },
            set_func_variable: {
                template: Lang.template.set_variable,
                color: EntryStatic.colorSet.block.default.FUNC,
                outerLine: EntryStatic.colorSet.block.darken.FUNC,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName(block) {
                            const func =
                                Entry.variableContainer.getFunctionByBlockId(block.id) ||
                                Entry.Func.targetFunc ||
                                {};
                            const localVariables = func.localVariables || [];
                            if (localVariables.length) {
                                return localVariables.map((localVariable) => {
                                    const { id, name } = localVariable;
                                    if (!id) {
                                        localVariable.id = `${func.id}_${Entry.generateHash()}`;
                                    }
                                    return [name, localVariable.id];
                                });
                            } else {
                                return [[Lang.Blocks.no_target, 'null']];
                            }
                        },
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.FUNC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                        defaultValue: (_value, options) => {
                            if (options[0] && options[0][1]) {
                                return options[0][1];
                            }
                            return null;
                        },
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/func_icon.svg',
                        size: 11,
                    },
                ],
                events: {
                    updateFuncVariableList: [
                        function () {
                            const func = Entry.Func.targetFunc || {};
                            func?.content
                                ?.getBlockList(false, 'set_func_variable')
                                ?.forEach((block) => {
                                    block?.view?.getParam(0)?.updateValue(true);
                                });
                        },
                    ],
                },
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'set_func_variable',
                },
                paramsKeyMap: {
                    VARIABLE: 0,
                    VALUE: 1,
                },
                class: 'local_variable',
                isNotFor: ['useLocalVariables'],
                func(sprite, script) {
                    const variableId = script.getField('VARIABLE', script);
                    const value = script.getValue('VALUE', script);
                    const [funcId, idx] = variableId.split('_');
                    const func = Entry.variableContainer.getFunction(funcId, idx);

                    func.setValue(value, variableId, script.executor.localVariables);

                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%1 = %2',
                            passTest: true,
                            blockType: 'variable',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'variables',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.VARIABLE,
                                    converter: Entry.block.converters.returnRawStringKey,
                                },
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                            ],
                        },
                    ],
                },
                wikiClass: 'function',
            },
            get_func_variable: {
                template: '%1 %2',
                color: EntryStatic.colorSet.block.default.FUNC,
                outerLine: EntryStatic.colorSet.block.darken.FUNC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName(block) {
                            const func =
                                Entry.variableContainer.getFunctionByBlockId(block.id) ||
                                Entry.Func.targetFunc ||
                                {};
                            const localVariables = func.localVariables || [];
                            if (localVariables.length) {
                                return localVariables.map((localVariable) => {
                                    const { id, name } = localVariable;
                                    if (!id) {
                                        localVariable.id = `${func.id}_${Entry.generateHash()}`;
                                    }
                                    return [name, localVariable.id];
                                });
                            } else {
                                return [[Lang.Blocks.no_target, 'null']];
                            }
                        },
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.FUNC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                        defaultValue: (_value, options) => {
                            if (options[0] && options[0][1]) {
                                return options[0][1];
                            }
                            return null;
                        },
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.VARIABLE_get_variable_1,
                        color: 'white',
                    },
                ],
                events: {
                    updateFuncVariableList: [
                        function () {
                            const func = Entry.Func.targetFunc || {};
                            func?.content
                                ?.getBlockList(false, 'get_func_variable')
                                ?.forEach((block) => {
                                    block?.view?.getParam(0)?.updateValue(true);
                                });
                        },
                    ],
                },
                def: {
                    params: [null],
                    type: 'get_func_variable',
                },
                paramsKeyMap: {
                    VARIABLE: 0,
                },
                class: 'local_variable',
                isNotFor: ['useLocalVariables'],
                func(sprite, script) {
                    const variableId = script.getField('VARIABLE', script);
                    const [funcId] = variableId.split('_');
                    const func = Entry.variableContainer.getFunction(funcId);
                    return func.getValue(variableId, script.executor.localVariables);
                },
                syntax: {
                    js: [],
                    py: [],
                },
                wikiClass: 'function',
            },
            function_create_value: {
                skeleton: 'basic_create_value',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                color: EntryStatic.colorSet.block.default.FUNC,
                outerLine: EntryStatic.colorSet.block.darken.FUNC,
                event: 'funcDef',
                params: [
                    {
                        type: 'Block',
                        accept: 'param',
                        value: {
                            type: 'function_field_label',
                            params: [Lang.Blocks.FUNC],
                            copyable: false,
                        },
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/func_icon.svg',
                        size: 11,
                    },
                    {
                        type: 'LineBreak',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                ],
                paramsKeyMap: {
                    FIELD: 0,
                    VALUE: 3,
                },
                statementsKeyMap: {
                    DO: 0,
                },
                func(sprite, script) {
                    if (!script.isFunc) {
                        script.isFunc = true;
                        script.executor.result = script;
                        return script.getStatement('DO', script);
                    } else {
                        delete script.isFunc;
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%1',
                            keyOption: 'function_create_value',
                        },
                    ],
                },
                wikiClass: 'function',
            },
            function_general: {
                skeleton: 'basic',
                color: EntryStatic.colorSet.block.default.FUNC,
                outerLine: EntryStatic.colorSet.block.darken.FUNC,
                class: 'function_executor',
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/func_icon.svg',
                        size: 11,
                    },
                ],
                events: {
                    dataAdd: [
                        function (block) {
                            const vc = Entry.variableContainer;
                            if (vc) {
                                vc.addRef('_functionRefs', block);
                            }
                        },
                    ],
                    dataDestroy: [
                        function (block) {
                            const vc = Entry.variableContainer;
                            if (vc) {
                                vc.removeRef('_functionRefs', block);
                            }
                        },
                    ],
                    dblclick: [
                        function (blockView) {
                            const mode = blockView.getBoard().workspace.getMode();
                            if (mode !== Entry.Workspace.MODE_BOARD) {
                                return;
                            }
                            if (Entry.type !== 'workspace') {
                                return;
                            }
                            const block = blockView.block;
                            const id = block.getFuncId();
                            Entry.do('funcEditStart', id);
                        },
                    ],
                },
                func(entity, script) {
                    if (!this.initiated) {
                        this.initiated = true;
                        Entry.callStackLength++;
                        const func = Entry.variableContainer.getFunction(this.block.getFuncId());
                        this.funcCode = func.content;
                        this.funcExecutor = this.funcCode.raiseEvent('funcDef', entity)[0];
                        this.funcExecutor.register.params = this.values;
                        this.funcExecutor.register.paramMap = func.paramMap;
                        this.funcExecutor.parentExecutor = this.executor;
                        this.funcExecutor.parentScope = script;
                        this.funcExecutor.isFuncExecutor = true;
                        this.funcExecutor.localVariables = _cloneDeep(func.localVariables);
                    }

                    const { promises } = this.funcExecutor.execute();

                    if (!this.funcExecutor.isEnd()) {
                        if (promises.length) {
                            return Entry.Code.funcAsyncExecute(
                                this.funcCode,
                                this.funcExecutor,
                                promises
                            );
                        } else {
                            this.funcCode.removeExecutor(this.funcExecutor);
                            return Entry.STATIC.BREAK;
                        }
                    } else {
                        this.funcCode.removeExecutor(this.funcExecutor);
                    }

                    Entry.callStackLength--;
                },
                syntax: { js: [], py: [''] },
                wikiClass: 'function',
            },
            function_value: {
                skeleton: 'basic_string_field',
                color: EntryStatic.colorSet.block.default.FUNC,
                outerLine: EntryStatic.colorSet.block.darken.FUNC,
                class: 'function_executor',
                params: [],
                events: {
                    dataAdd: [
                        function (block) {
                            const vc = Entry.variableContainer;
                            if (vc) {
                                vc.addRef('_functionRefs', block);
                            }
                        },
                    ],
                    dataDestroy: [
                        function (block) {
                            const vc = Entry.variableContainer;
                            if (vc) {
                                vc.removeRef('_functionRefs', block);
                            }
                        },
                    ],
                    dblclick: [
                        function (blockView) {
                            const mode = blockView.getBoard().workspace.getMode();
                            if (mode !== Entry.Workspace.MODE_BOARD) {
                                return;
                            }
                            if (Entry.type !== 'workspace') {
                                return;
                            }
                            const block = blockView.block;
                            const id = block.getFuncId();
                            Entry.do('funcEditStart', id);
                        },
                    ],
                },
                func(entity, script) {
                    if (!this.initiated) {
                        this.initiated = true;
                        Entry.callStackLength++;
                        const func = Entry.variableContainer.getFunction(this.block.getFuncId());
                        this.funcCode = func.content;
                        this.funcExecutor = this.funcCode.raiseEvent('funcDef', entity)[0];
                        this.funcExecutor.register.params = this.values;
                        this.funcExecutor.register.paramMap = func.paramMap;
                        this.funcExecutor.parentExecutor = this.executor;
                        this.funcExecutor.parentScope = script;
                        this.funcExecutor.isFuncExecutor = true;
                        this.funcExecutor.localVariables = _cloneDeep(func.localVariables);
                    }

                    const { promises } = this.funcExecutor.execute();

                    if (!this.funcExecutor.isEnd()) {
                        if (promises.length) {
                            return Entry.Code.funcValueAsyncExecute(
                                this.funcCode,
                                this.funcExecutor,
                                promises
                            );
                        } else {
                            return Entry.Code.funcRestExecute(this.funcCode, this.funcExecutor);
                        }
                    } else {
                        this.funcCode.removeExecutor(this.funcExecutor);
                    }

                    Entry.callStackLength--;
                    const scope = this.funcExecutor.result;
                    scope.values = scope.getParams();
                    return scope.getValue('VALUE', scope);
                },
                syntax: { js: [], py: [''] },
                wikiClass: 'function',
            },
            function_field_label: {
                skeleton: 'basic_param',
                isNotFor: ['functionEdit'],
                color: '#f9c535',
                params: [
                    {
                        type: 'TextInput',
                        value: Lang.Blocks.FUNCTION_explanation_1,
                    },
                    {
                        type: 'Output',
                        accept: 'param',
                    },
                ],
                paramsKeyMap: {
                    NAME: 0,
                    NEXT: 1,
                },
                def: {
                    params: [Lang.Blocks.FUNCTION_explanation_1],
                    type: 'function_field_label',
                },
                //"syntax": {"js": [], "py": ["%1function_field_label#"]}
                syntax: { js: [], py: ['name'] },
                wikiClass: 'function',
            },
            function_field_string: {
                skeleton: 'basic_param',
                isNotFor: ['functionEdit'],
                color: EntryStatic.colorSet.block.lighten.CALC,
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        restore: true,
                    },
                    {
                        type: 'Output',
                        accept: 'param',
                    },
                ],
                paramsKeyMap: {
                    PARAM: 0,
                    NEXT: 1,
                },
                def: {
                    params: [
                        {
                            type: 'text',
                            params: [Lang.template.function_param_string],
                        },
                    ],
                    type: 'function_field_string',
                },
                syntax: { js: [], py: ['value'] },
                wikiClass: 'function',
            },
            function_field_boolean: {
                skeleton: 'basic_param',
                isNotFor: ['functionEdit'],
                color: EntryStatic.colorSet.block.default.JUDGE,
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                        restore: true,
                    },
                    {
                        type: 'Output',
                        accept: 'param',
                    },
                ],
                paramsKeyMap: {
                    PARAM: 0,
                    NEXT: 1,
                },
                def: {
                    params: [
                        {
                            type: 'True',
                            params: [Lang.template.function_param_boolean],
                        },
                    ],
                    type: 'function_field_boolean',
                },
                syntax: { js: [], py: ['boolean'] },
                wikiClass: 'function',
            },
            function_param_string: {
                skeleton: 'basic_string_field',
                color: EntryStatic.colorSet.block.lighten.CALC,
                fontColor: '#000',
                template: '%1 %2',
                events: {
                    viewAdd: [
                        function () {
                            if (Entry.Func.isEdit) {
                                Entry.Func.refreshMenuCode();
                            }
                        },
                    ],
                },
                func() {
                    return this.executor.register.params[
                        this.executor.register.paramMap[this.block.type]
                    ];
                },
                syntax: { js: [], py: [''] },
                wikiClass: 'function',
            },
            function_param_boolean: {
                skeleton: 'basic_boolean_field',
                color: EntryStatic.colorSet.block.default.JUDGE,
                template: '%1 %2',
                events: {
                    viewAdd: [
                        function () {
                            if (Entry.Func.isEdit) {
                                Entry.Func.refreshMenuCode();
                            }
                        },
                    ],
                },
                func() {
                    return this.executor.register.params[
                        this.executor.register.paramMap[this.block.type]
                    ];
                },
                syntax: { js: [], py: [''] },
                wikiClass: 'function',
            },
            function_create: {
                skeleton: 'basic_create',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                color: EntryStatic.colorSet.block.default.FUNC,
                outerLine: EntryStatic.colorSet.block.darken.FUNC,
                event: 'funcDef',
                params: [
                    {
                        type: 'Block',
                        accept: 'param',
                        value: {
                            type: 'function_field_label',
                            params: [Lang.Blocks.FUNC],
                            copyable: false,
                        },
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/func_icon.svg',
                        size: 11,
                    },
                ],
                paramsKeyMap: {
                    FIELD: 0,
                },
                statementsKeyMap: {
                    DO: 0,
                },
                func(sprite, script) {
                    if (!script.isFunc) {
                        script.isFunc = true;
                        script.executor.result = script;
                        return script.getStatement('DO', script);
                    } else {
                        delete script.isFunc;
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%1',
                            keyOption: 'function_create',
                        },
                    ],
                },
                wikiClass: 'function',
            },
        };
    },
};
