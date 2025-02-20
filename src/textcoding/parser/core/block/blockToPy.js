/*
 *
 */
'use strict';

import _includes from 'lodash/includes';

Entry.BlockToPyParser = class {
    constructor() {
        this._type = 'BlockToPyParser';
        this._funcParamMap = new Entry.Map();
        this.funcDefMap = {};

        this.globalCommentList = [];

        this._variableDeclaration = null;
        this._listDeclaration = null;
        this._forIdCharIndex = 0;
    }

    Code(code, parseMode) {
        this._parseMode = parseMode;
        if (!code) {
            return;
        }
        if (code instanceof Entry.Thread) {
            return this.Thread(code);
        }
        if (code instanceof Entry.Block) {
            return this.Block(code);
        }

        const resultTextCode = [];
        const threads = code.getThreads();

        for (let i = 0; i < threads.length; i++) {
            this._forIdCharIndex = 0;
            const thread = threads[i];

            if (thread) {
                resultTextCode.push(this.Thread(thread));
            }
        }

        return resultTextCode.join('\n').trim();
    }

    Thread(thread) {
        if (thread instanceof Entry.Block) {
            return this.Block(thread);
        }
        const blocks = thread.getBlocks();

        if (blocks.length === 0) {
            return '';
        }

        if (blocks[0] instanceof Entry.Comment) {
            this.Comment(blocks[0]);
        } else if (this._parseMode === Entry.Parser.PARSE_SYNTAX) {
            return blocks.map((block) => `${this.Block(block)}\n`).trim();
        } else if (this._parseMode === Entry.Parser.PARSE_GENERAL) {
            let rootResult = '';
            let contentResult = '';

            blocks.forEach((block, index) => {
                try {
                    if (index === 0 && Entry.TextCodingUtil.isEventBlock(block)) {
                        rootResult = `${this.Block(block)}\n`;
                    } else {
                        contentResult += `${this.Block(block)}\n`;
                    }
                } catch (e) {
                    Entry.toast.alert(
                        Lang.TextCoding.title_converting,
                        Lang.TextCoding.alert_legacy_no_support
                    );
                }
            });

            if (rootResult !== '') {
                contentResult = Entry.TextCodingUtil.indent(contentResult);
            }

            return `${(rootResult + contentResult).trim()}\n`;
        }
    }

    Block(block) {
        if (!block || !(block instanceof Entry.Block)) {
            return '';
        }
        !block._schema && block.loadSchema();

        const results = [];
        const syntaxObj = this.searchSyntax(block);
        let syntax;

        if (syntaxObj) {
            syntax = syntaxObj.syntax;
        }

        // User Function
        if (this.isFunc(block)) {
            if (!this.funcDefMap[block.data.type]) {
                this._rootFuncId = block.data.type;
                this.funcDefMap[block.data.type] = this.makeFuncDef(block, this._hasRootFunc);
                this._hasRootFunc = false;
            }
            if (this.isRegisteredFunc(block)) {
                syntax = this.makeFuncSyntax(block);
            }
            if (this._parseMode === Entry.Parser.PARSE_SYNTAX) {
                return syntax;
            }
        } else if (this.isFuncStmtParam(block)) {
            const type = block.data.type;
            results.push(this._funcParamMap.get(type) || type);
        }

        if (!syntax && !this.isFuncStmtParam(block)) {
            const error = new Error();
            error.block = block;
            throw error;
        }

        const _blockTokens = syntax.split(/[\r\n]/);
        const _blockParamRegex = /%\d/gim;
        const _blockStatementRegex = /\$\d/gim;

        let isFirstCommentToken = true;

        _blockTokens.forEach((token) => {
            let tokenProcessed = token;
            // 이재원 #7994 관련하여 만약 token (text input) 에 시작하는 템플릿이 괄호라면,
            // 그리고 하나의 Param만 가지고 있는 경우를 regex check 후에 slice해서 사용.
            if (_blockTokens.length == 1 && /^\(%[\d ]+\)/gim.test(tokenProcessed)) {
                tokenProcessed = tokenProcessed.slice(1, -1);
            }
            const paramsTemplate = tokenProcessed.match(_blockParamRegex);
            const statements = tokenProcessed.match(_blockStatementRegex);
            let resultTextCode = '';

            // %1 과 같은 템플릿 값이 있는 경우
            if (paramsTemplate) {
                const paramsValue = [];
                paramsTemplate.forEach((template) => {
                    const [, index] = template.split('%');

                    if (index) {
                        paramsValue[index] = this._getParamsValue(index, block);
                    }
                });

                resultTextCode += tokenProcessed.replace(
                    /%(\d)/gim,
                    (_, groupMatch) => paramsValue[groupMatch]
                );
            }

            // $1 과 같이 statement 를 포함하는 경우
            if (statements) {
                statements.forEach((value) => {
                    const [, index] = value.split('$');
                    const statementTextCodes = [];
                    const thread = block.statements[index - 1];
                    thread.getBlocks().forEach((block) => {
                        if (this.getFuncInfo(block)) {
                            statementTextCodes.push(this.makeFuncDef(block, true));
                        } else {
                            statementTextCodes.push(this.Block(block));
                        }
                    });
                    resultTextCode += Entry.TextCodingUtil.indent(
                        statementTextCodes.join('\n').concat('\n')
                    );
                });
            }

            // 일반 블록 처리
            if (!statements && !paramsTemplate) {
                resultTextCode += tokenProcessed;
            }

            // 특수 블록 처리
            // TODO 이와 같은 처리는 블록에 정보가 있고, 정보에 따라 처리해야 한다.
            if (syntaxObj) {
                switch (syntaxObj.key) {
                    case 'repeat_while_true':
                        resultTextCode = Entry.TextCodingUtil.assembleRepeatWhileTrueBlock(
                            block,
                            resultTextCode
                        );
                        break;
                    case 'repeat_basic': {
                        const forStmtTokens = resultTextCode.split(' ');

                        if (_includes(forStmtTokens, 'for', 'i', 'in')) {
                            forStmtTokens[1] = Entry.TextCodingUtil.generateForStmtIndex(
                                this._forIdCharIndex++
                            );
                            resultTextCode = forStmtTokens.join(' ');
                        }
                        break;
                    }
                    case 'substring': {
                        // "안녕 엔트리"[1:5] -> "안녕 엔트리", [1:5]
                        const tokens = resultTextCode.split(/(?=\[)/);
                        if (tokens.length === 2 && Entry.Utils.isNumber(tokens[0])) {
                            tokens[0] = `"${tokens[0]}"`;
                        }
                        resultTextCode = tokens.join('');
                        break;
                    }
                }
            }

            // 코멘트 처리
            const commentValue = block.getCommentValue();
            if (isFirstCommentToken && !statements && commentValue !== undefined) {
                // '' 도 표기한다.
                resultTextCode += ` # ${commentValue}`;
                isFirstCommentToken = !isFirstCommentToken;
            }

            results.push(resultTextCode);
        });

        return results.join('\n');
    }

    Comment(comment) {
        this.globalCommentList.push(`# ${comment.value}`);
    }

    /**
     * 해당 block 의 template parameter 의 실제 값을 가져온다.
     * @param templateIndex index 번호 (%2 라면 2)
     * @param block 추출할 블록
     * @returns {string} 블록의 결과값
     * @private
     */
    _getParamsValue(templateIndex, block) {
        const index = Number(templateIndex) - 1;
        const schemaParams = block._schema.params;
        const dataParams = block.data.params;

        let result = '';
        const syntaxObj = this.searchSyntax(block);
        const textParams = syntaxObj.textParams && syntaxObj.textParams;

        if (schemaParams[index]) {
            switch (schemaParams[index].type) {
                case 'Indicator': {
                    break;
                }
                case 'Block': {
                    let param = this.Block(dataParams[index]).trim();
                    const funcParam = this._funcParamMap.get(param);
                    const textParam = textParams && textParams[index];

                    if (funcParam) {
                        param = funcParam;
                    } else {
                        const funcParamTokens = param.split('_');
                        const prefix = funcParamTokens[0];
                        if (funcParamTokens.length === 2) {
                            if (prefix === 'stringParam') {
                                param = 'string_param';
                            } else if (prefix === 'booleanParam') {
                                param = 'boolean_param';
                            }
                        }
                    }

                    if (textParam && textParam.paramType === 'index') {
                        if (Entry.Utils.isNumber(param)) {
                            param = param - 1;
                        } else {
                            const tokens = param.split('+');
                            if (tokens[tokens.length - 1] === ' 1)') {
                                delete tokens[tokens.length - 1];
                                param = tokens.join('+');
                                param = param.substring(1, param.length - 2);
                            } else {
                                param += ' - 1';
                            }
                        }
                    }

                    if (textParam && textParam.paramType === 'integer') {
                        if (Entry.Utils.isNumber(param) && Entry.isFloat(param)) {
                            result = result.replace('randint', 'uniform');
                        }
                    }

                    result += param;
                    break;
                }
                default: {
                    const textParam = textParams && textParams[index];

                    let param;
                    if (textParam && textParam.type) {
                        param = this[`Field${textParam.type}`](dataParams[index], textParam);
                    } else {
                        param = this[`Field${schemaParams[index].type}`](
                            dataParams[index],
                            textParam
                        );
                    }
                    const isTypeNumber = Entry.Utils.isNumber(param);

                    // 필드 블록이 아닌 블록에 내재된 파라미터 처리
                    if (
                        !Entry.Utils.isNumber(param) &&
                        (block.type === 'when_some_key_pressed' ||
                            block.type === 'is_press_some_key')
                    ) {
                        if (
                            !Entry.KeyboardCode.map[
                                typeof param === 'string' ? param.toLowerCase() : param
                            ]
                        ) {
                            Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.parameter_can_not_space);
                            throw Error('');
                        }

                        result += `"${param}"`;
                    } else if (
                        !isTypeNumber &&
                        Entry.Utils.isNumber(param) &&
                        (block.type === 'number' || block.type === 'string')
                    ) {
                        result += `"${param}"`;
                    } else {
                        result += param;
                    }

                    break;
                }
            }
        }
        return result;
    }

    searchSyntax(datum) {
        let schema;
        let appliedParams;
        if (datum instanceof Entry.BlockView) {
            schema = datum.block._schema;
            appliedParams = datum.block.data.params;
        } else if (datum instanceof Entry.Block) {
            schema = datum._schema;
            appliedParams = datum.params;
        } else {
            schema = datum;
        }

        if (schema && schema.syntax && schema.syntax.py && schema.syntax.py.length > 0) {
            const syntaxes = schema.syntax.py.concat();
            while (syntaxes.length) {
                let isFail = false;
                const syntax = syntaxes.shift();
                if (typeof syntax === 'string') {
                    return { syntax, template: syntax };
                }

                if (syntax.params) {
                    for (let i = 0; i < syntax.params.length; i++) {
                        if (syntax.params[i] && syntax.params[i] !== appliedParams[i]) {
                            isFail = true;
                            break;
                        }
                    }
                }
                if (!syntax.template) {
                    syntax.template = syntax.syntax;
                }
                if (isFail) {
                    continue;
                }
                return syntax;
            }
        }
        return null;
    }

    FieldAngle(dataParam, textParam) {
        if (textParam && textParam.converter) {
            dataParam = textParam.converter(dataParam);
        }

        return dataParam;
    }

    FieldColor(dataParam, textParam) {
        if (textParam && textParam.converter) {
            dataParam = textParam.converter(null, dataParam);
        }
        return dataParam;
    }

    FieldDropdown(dataParam, textParam) {
        if (typeof dataParam === 'object') {
            return 'None'.replace(/\"/gm, '');
        }

        if (textParam && textParam.converter && textParam.options) {
            const options = textParam.options;
            for (const i in options) {
                const key = options[i][0];
                const value = options[i][1];
                if (dataParam == value) {
                    return (dataParam = textParam.converter(key, value));
                }
            }
            dataParam = textParam.converter(dataParam, dataParam);
        }

        return dataParam;
    }

    FieldDropdownDynamic(dataParam, textParam) {
        if (typeof dataParam === 'object') {
            return 'None'.replace(/\"/gm, '');
        }

        if (textParam && textParam.converter && textParam.options) {
            const options = textParam.options;
            for (const i in options) {
                let key = options[i][0];
                const value = options[i][1];
                if (dataParam == value) {
                    const name = Entry.TextCodingUtil.dropdownDynamicIdToNameConvertor(
                        value,
                        textParam.menuName
                    );
                    if (name) {
                        key = name;
                    }
                    return (dataParam = textParam.converter(key, value));
                }
            }
            const value = Entry.TextCodingUtil.dropdownDynamicIdToNameConvertor(
                dataParam,
                textParam.menuName
            );
            if (value) {
                dataParam = textParam.converter(value, value);
            } else {
                dataParam = textParam.converter(dataParam, dataParam);
            }

            const reg = /None/;
            if (reg.test(dataParam)) {
                dataParam = dataParam.replace(/\"/gm, '');
            }
        }

        return dataParam;
    }

    FieldImage(dataParam, textParam) {
        if (textParam && textParam.converter) {
            dataParam = textParam.converter(null, dataParam);
        }

        return dataParam;
    }

    FieldIndicator(dataParam, textParam) {
        return dataParam;
    }

    FieldKeyboard(dataParam, textParam) {
        const reg = /None/;
        if (reg.test(dataParam)) {
            return dataParam.replace(/\"/gm, '');
        }

        const map = Entry.KeyboardCode.map;
        for (const key in map) {
            const value = map[key];
            if (value == dataParam) {
                dataParam = key;
                break;
            }
        }

        if (textParam && textParam.converter) {
            dataParam = textParam.converter(dataParam, null);
        }

        dataParam = dataParam.toLowerCase();
        return dataParam;
    }

    FieldOutput(dataParam, textParam) {
        return dataParam;
    }

    FieldText(dataParam, textParam) {
        if (textParam && textParam.converter) {
            dataParam = textParam.converter(null, dataParam);
        }

        return dataParam;
    }

    FieldTextInput(dataParam, textParam) {
        if (typeof dataParam !== 'number') {
            dataParam = dataParam.replace('\t', '    ');
            const spaces = dataParam.split(/ /);

            if (dataParam.length == spaces.length - 1) {
                dataParam = '"()"'.replace('()', dataParam);
            }
        }

        if (textParam && textParam.converter) {
            dataParam = textParam.converter(null, dataParam);
        }

        return dataParam;
    }

    FieldNumber(dataParam, textParam) {
        if (textParam && textParam.converter) {
            dataParam = textParam.converter(null, dataParam);
        }

        return dataParam;
    }

    isFunc(block) {
        if (!block || !block.data || !block.data.type) {
            return false;
        }

        const tokens = block.data.type.split('_');
        const prefix = tokens[0];

        return prefix === 'func';
    }

    /**
     * 워크스페이스에 실제로 등록되어있는 함수인지 확인한다.
     * @param block
     * @returns {boolean}
     */
    isRegisteredFunc(block) {
        const tokens = block.data.type.split('_');
        const funcId = tokens[1];
        return !!Entry.variableContainer.functions_[funcId];
    }

    isFuncStmtParam(block) {
        if (!block || !block.data || !block.data.type) {
            return false;
        }
        const blockType = block.data.type;
        const tokens = blockType.split('_');
        const prefix = tokens[0];

        return prefix === 'stringParam' || prefix === 'booleanParam';
    }

    /**
     * functionTemplate 에서 파이선에서 표기될 함수를 만들어낸다.
     * ex) 함수 %1 %2 %3 + %3 이 Indicator 인 경우 => 함수(%1, %2)
     * @param funcBlock{Block} 함수 블록
     * @return {string} 파이선 함수 호출 syntax
     */
    makeFuncSyntax(funcBlock) {
        let schemaTemplate = '';

        if (funcBlock) {
            if (funcBlock._schema) {
                if (funcBlock._schema.template) {
                    schemaTemplate = funcBlock._schema.template.trim();
                }
            } else if (this._hasRootFunc) {
                const rootFunc = Entry.block[this._rootFuncId];
                schemaTemplate = rootFunc.block.template;
            }
        }

        const templateParams = schemaTemplate.trim().match(/%\d/gim);
        templateParams.pop(); // pop() 이유는 맨 마지막 템플릿은 Indicator 로 판단할 것이기 때문이다.

        return Entry.TextCodingUtil.getFunctionNameFromTemplate(schemaTemplate)
            .trim()
            .concat(`(${templateParams.join(',')})`);
    }

    makeFuncDef(funcBlock, isExpression) {
        if (!this.isRegisteredFunc(funcBlock)) {
            return;
        }

        let result = '';
        const func = this.getFuncInfo(funcBlock);

        if (func) {
            result += func.name;
        } else {
            return;
        }

        let paramResult = '';
        if (func.params && func.params.length !== 0) {
            paramResult = func.params.join(', ').trim();
        }
        result = result.concat('(').concat(paramResult).concat(')');

        if (isExpression) {
            // 선언된 함수 사용하는 블록의 경우
            const expBlockComment = funcBlock.getCommentValue();
            if (expBlockComment || expBlockComment === '') {
                result += ` # ${expBlockComment}`;
            }
            return result;
        } else {
            // 함수 선언 중인 경우
            this._hasRootFunc = true;

            result = `def ${result}`;
            result = result.concat(':');
            if (func.comment || func.comment === '') {
                result += ` # ${func.comment}`;
            }
            result += '\n';

            if (func.statements && func.statements.length) {
                let stmtResult = '';
                for (const s in func.statements) {
                    const block = func.statements[s];

                    if (this.getFuncInfo(block)) {
                        stmtResult += this.makeFuncDef(block, true).concat('\n');
                    } else {
                        stmtResult += this.Block(block).concat('\n');
                    }
                }
                result += Entry.TextCodingUtil.indent(stmtResult).concat('\n');
            }

            return result.trim();
        }
    }

    getFuncInfo(funcBlock) {
        const result = {};
        const funcId = funcBlock.getFuncId();

        const func = funcId && Entry.variableContainer.getFunction(funcId);
        if (!func) {
            return null;
        }

        const funcName = Entry.TextCodingUtil.getFunctionNameFromTemplate(func.block.template);

        Entry.TextCodingUtil.initQueue();

        const funcContents = func.content.getEventMap('funcDef')[0].getThread().getBlocks();
        const statements = func.content.getEventMap('funcDef')[0].getStatements().getBlocks();
        statements.forEach((value) => funcContents.push(value));
        const defBlock = funcContents.shift();

        const funcComment = defBlock.getCommentValue();

        Entry.TextCodingUtil.gatherFuncDefParam(defBlock.getParam(0));

        const that = this;
        const funcParams = [];

        if (!this._hasRootFunc) {
            const funcDefParams = [];
            let param;
            while ((param = Entry.TextCodingUtil._funcParamQ.dequeue())) {
                funcDefParams.push(param);
            }

            funcDefParams.forEach((value, index) => {
                if (/(string|boolean)Param/.test(value)) {
                    index += 1;
                    const name = `param${index}`;
                    funcParams.push(name);
                    that._funcParamMap.put(value, name);
                }
            });
        } else {
            funcBlock.params
                .filter((p) => p instanceof Entry.Block)
                .forEach((p) => {
                    let paramText = that.Block(p);
                    if (!paramText) {
                        return;
                    }
                    paramText = that._funcParamMap.get(paramText) || paramText;
                    funcParams.push(paramText);
                });
        }

        Entry.TextCodingUtil.clearQueue();

        if (funcName) {
            result.name = funcName;
        }
        if (funcComment || funcComment === '') {
            result.comment = funcComment;
        }
        if (funcParams.length !== 0) {
            result.params = funcParams;
        }
        if (funcContents.length !== 0) {
            result.statements = funcContents;
        }

        return result;
    }
};
