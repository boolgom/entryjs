import _truncate from 'lodash/truncate';
import _trim from 'lodash/trim';
import _cloneDeep from 'lodash/cloneDeep';
import _find from 'lodash/find';

class EntryFunc {
    static isEdit = false;
    static threads = {};

    constructor(func = {}) {
        const {
            type = 'normal',
            id = Entry.generateHash(),
            localVariables = [],
            useLocalVariables = false,
        } = func;
        this.id = id;
        this.type = type;
        this.localVariables = localVariables;
        this.useLocalVariables = useLocalVariables;
        let content;
        //inspect empty content
        if (func && func.content && func.content.length > 4) {
            content = func.content;
        }

        let codeType = 'function_create';
        if (type === 'value') {
            codeType = 'function_create_value';
        }
        this.content = content
            ? new Entry.Code(content)
            : new Entry.Code([
                  [
                      {
                          type: codeType,
                          copyable: false,
                          deletable: false,
                          x: 40,
                          y: 40,
                      },
                  ],
              ]);
        this.block = null;
        this.blockMenuBlock = null;
        this.hashMap = {};
        this.paramMap = {};

        EntryFunc._generateFunctionSchema(this.id, type);

        if (func && func.content) {
            const blockMap = this.content._blockMap;
            for (const key in blockMap) {
                EntryFunc.registerParamBlock(blockMap[key].type);
            }
            EntryFunc.generateWsBlock(this);
        }

        EntryFunc.registerFunction(this);

        EntryFunc.updateMenu();
    }

    destroy() {
        this.blockMenuBlock && this.blockMenuBlock.destroy();
    }

    edit() {
        if (EntryFunc.isEdit) {
            return;
        }
        EntryFunc.isEdit = true;
        Entry.getMainWS().blockMenu.deleteRendered('variable');
        if (!EntryFunc.svg) {
            EntryFunc.isEdit = EntryFunc.initEditView();
        } else {
            this.parentView.appendChild(this.svg);
        }
    }

    generateBlock() {
        const generatedInfo = EntryFunc.generateBlock(this);
        this.block = generatedInfo.block;
        this.description = generatedInfo.description;
    }

    defaultLocalVariable(isForce) {
        return {
            name: this.makeLocalVariableName(isForce),
            value: 0,
        };
    }

    setLocalVariableLength(length) {
        if (!this.localVariables) {
            this.localVariables = [];
        }
        if (this.localVariables.length >= length) {
            this.localVariables.splice(length, this.localVariables.length - length);
        } else {
            const max = length - this.localVariables.length;
            for (let i = 0; i < max; i++) {
                this.localVariables.push(this.defaultLocalVariable(true));
            }
        }
        Entry.variableContainer && Entry.variableContainer.updateFuncScrollBar(this);
    }

    appendLocalVariable(value) {
        if (!this.localVariables) {
            this.localVariables = [];
        }
        this.localVariables.push(value);

        Entry.variableContainer && Entry.variableContainer.updateFuncScrollBar(this);
    }

    insertFuncLocalVariable(value, index) {
        if (!this.localVariables) {
            this.localVariables = [];
        }
        this.localVariables.splice(index, 0, value);

        Entry.variableContainer && Entry.variableContainer.updateFuncScrollBar(this);
    }

    removeLocalVariable(idx) {
        if (!Array.isArray(this.localVariables)) {
            return;
        }
        if (this.localVariables.length >= idx) {
            this.localVariables.splice(idx, 1);
        }
        Entry.variableContainer && Entry.variableContainer.updateFuncScrollBar(this);
    }

    removeLastLocalVariable() {
        this.removeLocalVariable(this.localVariables.length - 1);
    }

    toggleFunctionUseLocalVariables() {
        this.useLocalVariables = !this.useLocalVariables;
        Entry.variableContainer && Entry.variableContainer.updateFuncSettingView(this);
        EntryFunc.updateMenu();
    }

    getLocalVariables() {
        return this.localVariables;
    }

    makeLocalVariableName(isForce) {
        let name = Lang.Workspace.local_variable;
        if (this.checkLocalVariableName(name)) {
            name = Entry.getOrderedName(name, this.localVariables, 'name');
            if (!isForce) {
                Entry.toast.warning(
                    Lang.Workspace.local_variable_rename,
                    Lang.Workspace.local_variable_dup
                );
            }
        }

        return name;
    }

    checkLocalVariableName(name) {
        return this.localVariables.some((localVariable) => localVariable.name === name);
    }

    changeNameLocalVariable(name, index) {
        const localVariable = this.localVariables[index];
        localVariable.name = name;
        const { playground } = Entry;
        if (playground) {
            playground.blockMenu.deleteRendered('func');
            playground.reloadPlayground();
        }
    }

    getValue(variableId, localVariables) {
        const localVariable = _find(
            localVariables || this.localVariables,
            (localVariable) => localVariable.id === variableId
        );
        return localVariable?.value || 0;
    }

    setValue(value, variableId, localVariables) {
        const localVariable = _find(
            localVariables || this.localVariables,
            (localVariable) => localVariable.id === variableId
        );
        localVariable.value = value;
    }

    getBlockById(blockId) {
        return this?.content?.findById(blockId);
    }

    getFuncBlockByFuncId(funcId) {
        return this?.content?.findByType(funcId);
    }

    getBlockByParamId(paramId) {
        return this?.content?.findByParamId(paramId);
    }

    static changeFunctionName(name) {
        Entry.Mutator.mutate(
            'function_name',
            {
                template: `${Lang.Workspace.func}: ${_trim(
                    _truncate(name, {
                        length: 20,
                    })
                )}`,
            },
            { type: 'noChange', isRestore: undefined }
        );
    }

    static initBlock(blockMenu) {
        blockMenu.banClass('functionEdit', true);
        blockMenu.banClass('useLocalVariables', true);
        this.changeFunctionName('');
    }

    static registerFunction(func) {
        const workspace = Entry && Entry.getMainWS();
        if (!workspace) {
            return;
        }
        const blockMenu = workspace.getBlockMenu();
        const menuCode = blockMenu.code;

        let index = undefined;
        if (this._fieldLabel) {
            index = menuCode.getThreadIndex(this._fieldLabel.thread);
        }

        this._targetFuncBlock = menuCode.createThread(
            [
                {
                    type: `func_${func.id}`,
                    category: 'func',
                    x: -9999,
                },
            ],
            index
        );
        func.blockMenuBlock = this._targetFuncBlock;
    }

    static clearThreads() {
        this.threads = {};
    }

    static edit(func) {
        let funcElement = func;
        if (typeof func === 'string') {
            funcElement = Entry.variableContainer.getFunction(/(func_)?(.*)/.exec(func)[2]);
        }
        if (!funcElement) {
            console.error('no function');
            return;
        }
        this.unbindFuncChangeEvent();
        this.unbindWorkspaceStateChangeEvent();

        this.cancelEdit();

        this.targetFunc = funcElement;
        EntryFunc.isEdit = true;
        Entry.getMainWS().blockMenu.deleteRendered('variable');
        if (this.initEditView(funcElement.content) === false) {
            EntryFunc.isEdit = false;
            return;
        } // edit fail
        this.bindFuncChangeEvent(funcElement);
        this.updateMenu();
        requestAnimationFrame(() => {
            const schema = Entry.block[`func_${funcElement.id}`];
            if (schema && schema.paramsBackupEvent) {
                schema.paramsBackupEvent.notify();
            }

            this._backupContent = funcElement.content.stringify();
            this._backupOption = {
                type: funcElement.type,
                useLocalVariables: funcElement.useLocalVariables,
                localVariables: _cloneDeep(funcElement.localVariables),
            };
            Entry.getMainWS().overlayBoard.reDraw();
        });
    }

    static initEditView(content) {
        if (this.targetFunc) {
            const defBlock = this.targetFunc.content.getEventMap('funcDef')[0];

            if (defBlock) {
                let outputBlock = defBlock.params[0];
                let functionNmaeTemplate = '';
                let booleanIndex = 0;
                let stringIndex = 0;

                while (outputBlock) {
                    const value = outputBlock.params[0];
                    const valueType = value.type;
                    switch (outputBlock.type) {
                        case 'function_field_label':
                            functionNmaeTemplate = `${functionNmaeTemplate} ${value}`;
                            break;
                        case 'function_field_boolean':
                            booleanIndex++;
                            // eslint-disable-next-line max-len
                            functionNmaeTemplate += ` <${Lang.Blocks.FUNCTION_logical_variable} ${booleanIndex}>`;
                            break;
                        case 'function_field_string':
                            stringIndex++;
                            // eslint-disable-next-line max-len
                            functionNmaeTemplate += ` (${Lang.Blocks.FUNCTION_character_variable} ${stringIndex})`;
                            break;
                    }

                    outputBlock = outputBlock.getOutputBlock();
                }
                this.changeFunctionName(functionNmaeTemplate);
            }
        }
        if (!this.menuCode) {
            this.setupMenuCode();
        }
        const workspace = Entry.getMainWS();
        if (workspace.setMode(Entry.Workspace.MODE_OVERLAYBOARD) === false) {
            this.endEdit('cancelEdit');
            return false;
        }
        workspace.changeOverlayBoardCode(content);

        this._workspaceStateEvent = workspace.changeEvent.attach(this, (message = 'cancelEdit') => {
            this.endEdit(message);
            if (workspace.getMode() === Entry.Workspace.MODE_VIMBOARD) {
                workspace.blockMenu.banClass('functionInit');
            }
        });
        content.board.alignThreads();

        return true;
    }

    static endEdit(message) {
        this.unbindFuncChangeEvent();
        this.unbindWorkspaceStateChangeEvent();
        const targetFuncId = this.targetFunc.id;

        if (this.targetFunc && this.targetFunc.content) {
            this.targetFunc.content.destroyView();
        }

        switch (message) {
            case 'save':
                this.save();
                break;
            case 'cancelEdit':
                this.cancelEdit();
                break;
        }

        this._backupContent = null;
        this._backupOption = null;

        delete this.targetFunc;
        EntryFunc.isEdit = false;

        const workspace = Entry.getMainWS();
        const blockMenu = workspace.getBlockMenu();

        blockMenu.deleteRendered('variable');

        const blockSchema = Entry.block[`func_${targetFuncId}`];
        if (blockSchema && blockSchema.destroyParamsBackupEvent) {
            blockSchema.destroyParamsBackupEvent.notify();
        }
        this.updateMenu();
    }

    static save() {
        this.targetFunc.generateBlock(true);
        Entry.variableContainer.saveFunction(this.targetFunc);
        this._restoreBoardToVimBoard();
    }

    static cancelEdit() {
        if (!this.targetFunc) {
            return;
        }

        if (!this.targetFunc.block) {
            this._targetFuncBlock.destroy();
            delete Entry.variableContainer.functions_[this.targetFunc.id];
            delete Entry.variableContainer.selected;
        } else {
            if (this._backupContent) {
                this.targetFunc.content.load(this._backupContent);
                this.targetFunc.useLocalVariables = this._backupOption.useLocalVariables;
                this.targetFunc.localVariables = this._backupOption.localVariables;
                this.changeType(this.targetFunc, this._backupOption.type);
                this._generateFunctionSchema(this.targetFunc.id);
                this.generateWsBlock(this.targetFunc);
            }
        }
        Entry.variableContainer.updateList();

        this._restoreBoardToVimBoard();
    }

    static setupMenuCode() {
        const workspace = Entry.getMainWS();
        if (!workspace) {
            return;
        }
        const blockMenu = workspace.getBlockMenu();
        const menuCode = blockMenu.code;
        const CATEGORY = 'func';
        this._fieldLabel = menuCode
            .createThread([
                {
                    type: 'function_field_label',
                    copyable: false,
                    category: CATEGORY,
                    x: -9999,
                },
            ])
            .getFirstBlock();

        this._fieldString = menuCode
            .createThread([
                {
                    type: 'function_field_string',
                    category: CATEGORY,
                    x: -9999,
                    copyable: false,
                    assemble: false,
                    params: [{ type: this.requestParamBlock('string') }],
                },
            ])
            .getFirstBlock();

        this._fieldBoolean = menuCode
            .createThread([
                {
                    type: 'function_field_boolean',
                    copyable: false,
                    assemble: false,
                    category: CATEGORY,
                    x: -9999,
                    params: [{ type: this.requestParamBlock('boolean') }],
                },
            ])
            .getFirstBlock();

        this.menuCode = menuCode; // TODO Destroy 혹은 cleanProject 같은 로직이 동작했을때 삭제 필요
        blockMenu.align();
    }

    static refreshMenuCode() {
        if (!Entry.playground.mainWorkspace) {
            return;
        }
        if (!this.menuCode) {
            this.setupMenuCode();
        }

        this._fieldString.params[0].changeType(this.requestParamBlock('string'));
        this._fieldBoolean.params[0].changeType(this.requestParamBlock('boolean'));
    }

    static requestParamBlock(type) {
        let blockPrototype;
        switch (type) {
            case 'string':
                blockPrototype = Entry.block.function_param_string;
                break;
            case 'boolean':
                blockPrototype = Entry.block.function_param_boolean;
                break;
            default:
                return null;
        }

        const blockType = `${type}Param_${Entry.generateHash()}`;
        Entry.block[blockType] = EntryFunc.createParamBlock(blockType, blockPrototype, type);
        return blockType;
    }

    static registerParamBlock(type) {
        if (!type) {
            return;
        }

        let blockPrototype;
        if (type.indexOf('stringParam') > -1) {
            blockPrototype = Entry.block.function_param_string;
        } else if (type.indexOf('booleanParam') > -1) {
            blockPrototype = Entry.block.function_param_boolean;
        }

        //not a function param block
        if (!blockPrototype) {
            return;
        }

        EntryFunc.createParamBlock(type, blockPrototype, type);
    }

    static createParamBlock(type, blockPrototype, originalType) {
        const originalTypeFullName = /string/gi.test(originalType)
            ? 'function_param_string'
            : 'function_param_boolean';
        let BlockSchema = function () {};
        BlockSchema.prototype = blockPrototype;
        BlockSchema = new BlockSchema();
        BlockSchema.changeEvent = new Entry.Event();
        BlockSchema.template = Lang.template[originalTypeFullName];
        BlockSchema.fontColor = blockPrototype.fontColor || '#FFF';

        Entry.block[type] = BlockSchema;
        return BlockSchema;
    }

    static updateMenu() {
        const workspace = Entry.getMainWS();
        if (!workspace) {
            return;
        }
        const blockMenu = workspace.getBlockMenu();
        if (this.targetFunc) {
            !this.menuCode && this.setupMenuCode();
            blockMenu.banClass('functionInit', true);
            blockMenu.unbanClass('functionEdit', true);
            if (this.targetFunc && this.targetFunc.useLocalVariables) {
                blockMenu.unbanClass('useLocalVariables', true);
            } else {
                blockMenu.banClass('useLocalVariables', true);
            }
            Entry.variableContainer &&
                Entry.variableContainer.updateFuncSettingView(this.targetFunc);
        } else {
            !workspace.isVimMode() && blockMenu.unbanClass('functionInit', true);
            blockMenu.banClass('functionEdit', true);
            blockMenu.banClass('useLocalVariables', true);
        }
        blockMenu.lastSelector === 'func' && blockMenu.align();
    }

    static generateBlock(func) {
        const blockSchema = Entry.block[`func_${func.id}`];
        const block = {
            template: blockSchema.template,
            params: blockSchema.params,
        };

        const reg = /(%\d)/im;
        const templateParams = blockSchema.template.split(reg);
        let description = '';
        let booleanIndex = 0;
        let stringIndex = 0;
        for (const i in templateParams) {
            const templateChunk = templateParams[i];
            if (reg.test(templateChunk)) {
                const paramIndex = Number(templateChunk.split('%')[1]) - 1;
                const param = blockSchema.params[paramIndex];
                if (param.accept === 'boolean') {
                    description +=
                        Lang.template.function_param_boolean + (booleanIndex ? booleanIndex : '');
                    booleanIndex++;
                } else if (param.type !== 'Indicator') {
                    description +=
                        Lang.template.function_param_string + (stringIndex ? stringIndex : '');
                    stringIndex++;
                }
            } else {
                description += templateChunk;
            }
        }

        return { block, description };
    }

    static generateWsBlock(target, isRestore) {
        this.unbindFuncChangeEvent();
        const targetFunc = target ? target : this.targetFunc;
        const defBlock = targetFunc.content.getEventMap('funcDef')[0];

        if (!defBlock) {
            return;
        }

        let outputBlock = defBlock.params[0];
        let booleanIndex = 0;
        let stringIndex = 0;
        const schemaParams = [];
        let schemaTemplate = '';
        let functionNmaeTemplate = '';
        const hashMap = targetFunc.hashMap;
        const paramMap = targetFunc.paramMap;
        const blockIds = [];

        while (outputBlock) {
            const value = outputBlock.params[0];
            const valueType = value.type;
            switch (outputBlock.type) {
                case 'function_field_label':
                    schemaTemplate = `${schemaTemplate} ${value}`;
                    functionNmaeTemplate = `${functionNmaeTemplate} ${value}`;
                    break;
                case 'function_field_boolean':
                    Entry.Mutator.mutate(valueType, {
                        template: `${Lang.Blocks.FUNCTION_logical_variable} ${booleanIndex + 1}`,
                    });
                    hashMap[valueType] = false;
                    paramMap[valueType] = booleanIndex + stringIndex;
                    booleanIndex++;
                    schemaParams.push({
                        type: 'Block',
                        accept: 'boolean',
                    });
                    schemaTemplate += ` %${booleanIndex + stringIndex}`;

                    // eslint-disable-next-line max-len
                    functionNmaeTemplate += ` <${Lang.Blocks.FUNCTION_logical_variable} ${booleanIndex}>`;

                    blockIds.push(outputBlock.id);
                    break;
                case 'function_field_string':
                    Entry.Mutator.mutate(valueType, {
                        template: `${Lang.Blocks.FUNCTION_character_variable} ${stringIndex + 1}`,
                    });
                    hashMap[valueType] = false;
                    paramMap[valueType] = booleanIndex + stringIndex;
                    stringIndex++;
                    schemaTemplate += ` %${booleanIndex + stringIndex}`;

                    // eslint-disable-next-line max-len
                    functionNmaeTemplate += ` (${Lang.Blocks.FUNCTION_character_variable} ${stringIndex})`;

                    schemaParams.push({
                        type: 'Block',
                        accept: 'string',
                    });
                    blockIds.push(outputBlock.id);
                    break;
            }
            outputBlock = outputBlock.getOutputBlock();
        }

        this.changeFunctionName(functionNmaeTemplate);

        if (targetFunc.type !== 'value') {
            schemaTemplate += ` %${booleanIndex + stringIndex + 1}`;
            schemaParams.push({
                type: 'Indicator',
                img: 'block_icon/func_icon.svg',
                size: 12,
            });
        }

        const funcName = `func_${targetFunc.id}`;
        const block = Entry.block[funcName];

        const originParams = block.params.slice(0, block.params.length - 1);
        const newParams = schemaParams.slice(0, schemaParams.length - 1);
        const originParamsLength = originParams.length;
        const newParamsLength = newParams.length;

        let changeData = {};

        if (newParamsLength > originParamsLength) {
            const outputBlockIds = targetFunc.outputBlockIds;
            if (outputBlockIds) {
                let startPos = 0;
                while (outputBlockIds[startPos] === blockIds[startPos]) {
                    if (!outputBlockIds[startPos]) {
                        break;
                    }

                    startPos++;
                }

                let endPos = 0;
                while (
                    outputBlockIds[outputBlockIds.length - endPos - 1] ===
                    blockIds[blockIds.length - endPos - 1]
                ) {
                    if (!outputBlockIds[outputBlockIds.length - endPos - 1]) {
                        break;
                    }
                    endPos++;
                }

                endPos = blockIds.length - endPos - 1;
                changeData = {
                    type: 'insert',
                    startPos,
                    endPos,
                };
            }
        } else if (newParamsLength < originParamsLength) {
            changeData = {
                type: 'cut',
                pos: newParamsLength,
            };
        } else {
            changeData = { type: 'noChange' };
        }

        changeData.isRestore = isRestore;

        targetFunc.outputBlockIds = blockIds;

        Entry.Mutator.mutate(
            funcName,
            {
                params: schemaParams,
                template: schemaTemplate,
            },
            changeData
        );

        for (const key in hashMap) {
            const state = hashMap[key];
            if (state) {
                const text = /string/.test(key)
                    ? Lang.Blocks.FUNCTION_character_variable
                    : Lang.Blocks.FUNCTION_logical_variable;

                Entry.Mutator.mutate(key, { template: text });
            } else {
                hashMap[key] = true;
            }
        }

        this.bindFuncChangeEvent(targetFunc);
    }

    static bindFuncChangeEvent(targetFunc) {
        const selectedTargetFunc = targetFunc ? targetFunc : this.targetFunc;
        if (!this._funcChangeEvent && selectedTargetFunc.content.getEventMap('funcDef')[0].view) {
            this._funcChangeEvent = selectedTargetFunc.content
                .getEventMap('funcDef')[0]
                .view._contents[1].changeEvent.attach(this, this.generateWsBlock);
        }
    }

    static unbindFuncChangeEvent() {
        if (!this._funcChangeEvent) {
            return;
        }
        this._funcChangeEvent.destroy();
        delete this._funcChangeEvent;
    }

    static unbindWorkspaceStateChangeEvent() {
        const event = this._workspaceStateEvent;
        if (!event) {
            return;
        }

        event.destroy();
        delete this._workspaceStateEvent;
    }

    static reset() {
        if (this.isEdit) {
            this.endEdit();
        }
        this.menuCode = undefined;
    }

    static changeType(func, type = 'normal') {
        func.destroy();
        func.type = type;
        delete func.block;
        delete func.blockMenuBlock;
        EntryFunc._generateFunctionSchema(func.id, type, true);

        const tempContent = func.content.toJSON();

        if (func && func.content) {
            const blockMap = func.content._blockMap;
            for (const key in blockMap) {
                EntryFunc.registerParamBlock(blockMap[key].type);
            }
        }

        const blockType = type === 'normal' ? 'function_create' : 'function_create_value';
        let block;
        func.content.getThreads().some((thread, idx) => {
            const target = thread.getFirstBlock();
            if (
                target instanceof Entry.Block &&
                ['function_create_value', 'function_create'].includes(target?.type)
            ) {
                tempContent[idx][0].type = blockType;
                block = target;
                return true;
            }
        });

        block.changeType(blockType);
        func.content = new Entry.Code(tempContent);

        const workspace = Entry.getMainWS();
        workspace.changeOverlayBoardCode(func.content);
        func.block = block;
        Entry.variableContainer.updateList();
        EntryFunc.registerFunction(func);
        EntryFunc.generateWsBlock(func, true);
        EntryFunc.updateMenu();

        // reDrawVariableContainer()

        // b = Entry.variableContainer.getFunction(/(func_)?(.*)/.exec('0q91')[2]);
        // Entry.Func.changeType(b, 'value')
    }

    static _generateFunctionSchema(functionId, type = 'normal', isUpdate) {
        const prefixedFunctionId = `func_${functionId}`;
        if (!isUpdate && Entry.block[prefixedFunctionId]) {
            return;
        }
        let BlockSchema = function () {};
        BlockSchema.prototype = Entry.block.function_general;

        if (type === 'value') {
            BlockSchema.prototype = Entry.block.function_value;
        }

        BlockSchema = new BlockSchema();
        BlockSchema.changeEvent = new Entry.Event();
        BlockSchema.template = Lang.template.function_general;

        if (type === 'value') {
            BlockSchema.template = Lang.template.function_value;
        }

        Entry.block[prefixedFunctionId] = BlockSchema;
    }

    /**
     * 이전 워크스페이스 보드 형태가 VIMBOARD 였던 경우면 VIMBOARD 로 돌린다.
     * @private
     */
    static _restoreBoardToVimBoard() {
        const ws = Entry.getMainWS();
        if (ws && ws.overlayModefrom === Entry.Workspace.MODE_VIMBOARD) {
            ws.setMode({
                boardType: Entry.Workspace.MODE_VIMBOARD,
                textType: Entry.Vim.TEXT_TYPE_PY,
                runType: Entry.Vim.WORKSPACE_MODE,
            });
            Entry.variableContainer.functionAddButton_.addClass('disable');
        }
    }

    takeSnapshot() {
        this.snapshot_ = {
            localVariables: _cloneDeep(this.localVariables),
        };
    }

    loadSnapshot() {
        if (!this.snapshot_) {
            return;
        }
        const { localVariables } = this.snapshot_;
        this.localVariables = localVariables;
        delete this.snapshot_;
    }
}

Entry.Func = EntryFunc;
