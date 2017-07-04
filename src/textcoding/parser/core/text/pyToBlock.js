/*
 *
 */
"use strict";

goog.provide("Entry.PyToBlockParser");

goog.require("Entry.KeyboardCode");
goog.require("Entry.TextCodingUtil");
goog.require("Entry.TextCodingError");
goog.require("Entry.Queue");

Entry.PyToBlockParser = function(blockSyntax) {
    this._type ="PyToBlockParser";
    this.blockSyntax = blockSyntax;

    this._funcMap = {};
};

(function(p){
    p.util = Entry.TextCodingUtil;

    p.Program = function(astArr) {
        try {
            return this.processProgram(astArr);
        } catch(error) {
            var err = {};
            err.title = error.title;
            err.message = error.message;
            err.line = error.line;
            throw err;
        }
    };

    p.processProgram = function(astArr) {
        this.codeInit();
        for(var index in astArr) {
            if (astArr[index].type != 'Program') return;
            this.threadInit();
            //this.isLastBlock = false;
            this._threadCount++;
            //this._thread = [];
            var nodes = astArr[index].body;

            this._isEntryEventExisted = false;
            for(var index in nodes) {
                var blockType;

                var node = nodes[index];

                var block = this[node.type](node);

                if (this.isLastBlock) {
                    var keyword;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                        keyword,
                        this._blockCount);
                }

                if (block && block.type) {
                    var blockDatum = Entry.block[block.type];
                    var targetSyntax = this.searchSyntax(blockDatum);

                    if (targetSyntax)
                        blockType = targetSyntax.blockType;

                    if (blockType == "event") {
                        this._isEntryEventExisted = true;
                    } else if (blockType == "last") {
                        this.isLastBlock = true;
                    } else if (blockType == "variable") {
                        if (!this._isEntryEventExisted)
                            continue;
                    }

                    if (this.util.isEntryEventFuncByType(block.type)) {
                        this._thread.push(block);
                        if (block.contents) {
                            for(var b in block.contents) {
                                var content = block.contents[b];
                                this.extractContents(content, this._thread);
                            }
                        }
                        continue;
                    }
                    this._thread.push(block);
                }
            }

            if (this._thread.length != 0)
                this._code.push(this._thread);
        }

        return this._code;
    }

    p.ExpressionStatement = function(component) {
        var result = {};
        var structure = {};

        var expression = component.expression;

        this._blockCount++;

        if (expression.callee) {
            if (this.util.isEntryEventFuncName(expression.callee.name)) {
                this._blockCount--;
            }
        }

        if (expression.type) {
            var expressionData = this[expression.type](expression);

            if (expressionData.type && expressionData.params) {
                result.type = expressionData.type;
                result.params = expressionData.params;
                if (expressionData.funcName)
                    result.funcName = expressionData.funcName;
            } else if (expressionData.type) {
                result.type = expressionData.type;
                if (expressionData.funcName)
                    result.funcName = expressionData.funcName;
            } else {
                result = expressionData;
                if (expressionData.funcName)
                    result.funcName = expressionData.funcName;
            }
        }

        if (!result.type && result.name) {
            var keyword = result.name;
            Entry.TextCodingError.error(
                Entry.TextCodingError.TITLE_CONVERTING,
                Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                keyword,
                this._blockCount,
                Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        }
        return result;
    };


    p.CallExpression = function(component) {
        var result = {};
        var structure = {};

        var params = [];
        var type;

        var callee = component.callee;
        var calleeData = this[callee.type](callee);

        var arguments = component.arguments;

        var addedParamIndex = 0;

        if (callee.type == "Identifier") {
            result.callee = calleeData;

            var calleeName = this.util.eventBlockSyntaxFilter(calleeData.name);

            if (arguments && arguments.length != 0) {
                for(var a in arguments) {
                    var arg = arguments[a];
                    if (arg.type == "Identifier") {
                        var option = arg.name;
                    }
                    else if (arg.type == "Literal") {
                        var option = arg.value;
                    }
                    else if (arg.type == "MemberExpression") {
                        var option = arg.object.name + "." + arg.property.name;
                    }
                    var syntax = calleeName + "#" + option;
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax) {
                        type = blockSyntax.key;
                    }
                }
            }

            if (!type) {
                if (arguments && arguments.length != 0) {
                    var argKey = "";
                    for(var a in arguments) {
                        var arg = arguments[a];
                        if (arg.type == "Identifier") {
                            argKey += arg.name;
                        }
                        else if (arg.type == "Literal") {
                            argKey += arg.value;
                        }
                        else if (arg.type == "MemberExpression") {
                            argKey += arg.object.name + "." + arg.property.name;
                        }

                        if (a != arguments.length-1)
                            argKey += ",";
                    }

                }

                var syntax = calleeName + "(" + argKey + ")";
                var blockSyntax = this.getBlockSyntax(syntax);
                if (blockSyntax) {
                    type = blockSyntax.key;
                }
            }

            if (!type) {
                var syntax = calleeName;

                var blockSyntax = this.getBlockSyntax(syntax);
                if (blockSyntax) {
                    type = blockSyntax.key;
                }
            }

            if (!type) {
                var funcNameKey = calleeData.name;
                if (calleeData.name.search("__getParam") != -1) {
                    return result;
                }

                if (calleeData.name && arguments.length != 0 && arguments[0].type == "Literal") {
                    if (!this._funcMap[funcNameKey]) {
                        var keyword = calleeData.name;

                        Entry.TextCodingError.error(
                            Entry.TextCodingError.TITLE_CONVERTING,
                            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                            keyword,
                            this._blockCount,
                            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                    }
                }
            }

            if (callee) {
                if (callee.name == "when_get_signal") {
                    var argument = component.arguments[0];
                    if (argument && argument.value) {
                        if (argument.value != "None")
                            this.util.createMessage(argument.value);
                    }
                }
            }
        }
        else {
            var object = calleeData.object;
            var property = calleeData.property;
            var calleeName = null;

            if (calleeData.property && calleeData.property.name == "call" && calleeData.property.userCode == false) {
                if (calleeData.object && calleeData.object.statements) {
                    var statements = object.statements;
                    result.statements = statements;
                }
            }

            if (calleeData.object) {
                if (calleeData.object.name) {
                    var calleeName = String(calleeData.object.name).concat('.').concat(String(calleeData.property.name));
                }
                else if (calleeData.object.object) {
                    var calleeName = String(calleeData.object.object.name).concat('.')
                                    .concat(String(calleeData.object.property.name))
                                    .concat('.').concat(String(calleeData.property.name));
                }
            }

            result.callee = calleeName;

            if (arguments && arguments.length != 0) {
                var arg = arguments[0];
                if (arg.type == "Identifier") {
                    var option = arg.name;
                }
                else if (arg.type == "Literal") {
                    var option = arg.value;
                }
                else if (arg.type == "MemberExpression") {
                    var option = arg.object.name + "." + arg.property.name;
                }
                var syntax = calleeName + "#" + option;
                var blockSyntax = this.getBlockSyntax(syntax);
                if (blockSyntax) {
                    type = blockSyntax.key;
                    if (blockSyntax.replaceBlockType)
                        type = blockSyntax.replaceBlockType;
                }
            }

            if (!type) {
                if (arguments && arguments.length != 0) {
                    var argKey = "";
                    for(var a in arguments) {
                        var arg = arguments[a];
                        if (arg.type == "Identifier") {
                            argKey += arg.name;
                        }
                        else if (arg.type == "Literal") {
                            argKey += arg.value;
                        }
                        else if (arg.type == "MemberExpression") {
                            argKey += arg.object.name + "." + arg.property.name;
                        }

                        if (a != arguments.length-1)
                            argKey += ",";
                    }

                }


                var syntax = calleeName + "(" + String(argKey) + ")";
                var blockSyntax = this.getBlockSyntax(syntax);
                if (blockSyntax) {
                    type = blockSyntax.key;
                    if (blockSyntax.replaceBlockType)
                        type = blockSyntax.replaceBlockType;
                }
            }

            if (!type) {
                var syntax = calleeName;
                var blockSyntax = this.getBlockSyntax(syntax);

                if (blockSyntax) {
                    type = blockSyntax.key;
                    if (blockSyntax.replaceBlockType)
                        type = blockSyntax.replaceBlockType;
                }
            }


            if (callee.object) {
                if (callee.object.name === "Math") {
                    if (callee.property.name === "pow") {
                        var syntax = String("(%2 ** 2)");
                        var blockSyntax = this.getBlockSyntax(syntax);
                        if (blockSyntax)
                            type = blockSyntax.key;
                    }
                    else if (callee.property.name === "floor") {
                        var syntax = String("(%2 // %4)");
                        var blockSyntax = this.getBlockSyntax(syntax);
                        if (blockSyntax) {
                            type = blockSyntax.key;
                            var block = Entry.block[type];
                            var paramsMeta = block.params;
                            var paramsDefMeta = block.def.params;
                        }

                        if (component.arguments && component.arguments[0]) {
                            var argument = component.arguments[0];
                            if (argument.left) {
                                param = this[argument.left.type](argument.left, paramsMeta[1], paramsDefMeta[1], blockSyntax.textParams[1]);
                                params[1] = param;
                            }
                            if (argument.right) {
                                param = this[argument.right.type](argument.right, paramsMeta[3], paramsDefMeta[3], blockSyntax.textParams[3]);
                                params[3] = param;
                            }


                            result.type = type;
                            result.params = params;
                            return result;
                        }
                    }
                }
                else if (callee.object.name == "Entry") {
                    if (callee.property.name == "send_signal") {
                        var argument = component.arguments[0];
                        if (argument && argument.value) {
                            this.util.createMessage(argument.value);
                        }
                    }
                    else if (callee.property.name == "send_signal_wait") {
                        var argument = component.arguments[0];
                        if (argument && argument.value) {
                            this.util.createMessage(argument.value);
                        }
                    }
                }
            }

            if (callee.property) {
                if (callee.property.name == "range"){
                    var syntax = String("%1#number");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "add") {
                    var syntax = String("(%1 %2 %3)#calc_basic");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                    argumentData = {raw:"PLUS", type:"Literal", value:"PLUS"};

                    if (arguments.length == 2)
                        arguments.splice(1, 0, argumentData);

                    result.operator = "PLUS";

                }
                else if (callee.property.name == "minus") {
                    var syntax = String("(%1 %2 %3)#calc_basic");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                    argumentData = {raw:"MINUS", type:"Literal", value:"MINUS"};

                    if (arguments.length == 2)
                        arguments.splice(1, 0, argumentData);

                    result.operator = "MINUS";

                }
                else if (callee.property.name == "multiply") {
                    var syntax = String("(%1 %2 %3)#calc_basic");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;

                    argumentData = {raw:"MULTI", type:"Literal", value:"MULTI"};
                    if (arguments.length == 2)
                        arguments.splice(1, 0, argumentData);

                    result.operator = "MULTI";
                }
                else if (callee.property.name == "in") {
                    var syntax = String("%4 in %2");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "len") {
                    var syntax = String("len");
                    if (component.arguments && component.arguments[0]) {
                        var arg = component.arguments[0];
                        if (arg.type == "Literal")
                            syntax = String("len#length_of_string");
                        else if (arg.type == "Identifier") {
                            if (this.isFuncParam(arg.name) || this.util.isGlobalVariableExisted(arg.name) ||
                                this.util.isLocalVariableExisted(arg.name, this._currentObject))
                                syntax = String("len#length_of_string");
                        }
                        else if (arg.type == "MemberExpression") {
                            if (this.util.isGlobalListExisted(arg.object.name) ||
                               this.util.isLocalListExisted(arg.object.name) ||
                               this.util.isGlobalVariableExisted(arg.property.name) ||
                                this.util.isLocalVariableExisted(arg.property.name, this._currentObject))
                                syntax = String("len#length_of_string");
                        }
                        else {
                            syntax = String("len#length_of_string");
                        }
                    }

                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;

                }
                else if (callee.property.name == "append") {
                    var syntax = String("%2.append");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name  == "insert") {
                    var syntax = String("%2.insert");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "pop") {
                    var syntax = String("%2.pop");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "subscriptIndex") {
                    if (component.arguments && component.arguments[0]) {
                        var arg = component.arguments[0];
                        if (this.util.isExpressionLiteral(arg, this.blockSyntax)) {
                            syntax = String("%2\[%4\]#char_at");
                            var blockSyntax = this.getBlockSyntax(syntax);
                            if (blockSyntax)
                                type = blockSyntax.key;
                        }
                        else if (arg.type == "") {

                        }
                        else {
                            syntax = String("%2\[%4\]");
                            var blockSyntax = this.getBlockSyntax(syntax);
                            if (blockSyntax)
                                type = blockSyntax.key;
                        }
                    }
                }
                else if (callee.property.name == "_pySlice") {
                    var syntax = "%2\[%4:%6\]";
                    var blockSyntax = this.getBlockSyntax(syntax);
                    var vivid = true;
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "find") {
                    var syntax = String("%2.find");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "replace") {
                    var syntax = String("%2.replace");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "upper") {
                    var syntax = String("%2.upper");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else if (callee.property.name == "lower") {
                    var syntax = String("%2.lower");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    if (blockSyntax)
                        type = blockSyntax.key;
                } else if (callee.property.name == "randint") {
                    if (component.arguments &&
                        component.arguments[0] &&
                        component.arguments[1]) {
                        var left = component.arguments[0];
                        var right = component.arguments[1];
                        if (left.type == "Literal" || right.type == "Literal") {
                            var valueLeft = left.value;
                            var valueRight = right.value;
                            var isLeftFloat = Entry.Utils.isNumber(left.raw) && Entry.isFloat(left.raw);
                            var isRightFloat = Entry.Utils.isNumber(right.raw) && Entry.isFloat(right.raw);
                            if (isLeftFloat || isRightFloat) {
                                var syntax = "random.uniform";
                                var blockSyntax = this.getBlockSyntax(syntax);
                                if (blockSyntax)
                                    type = blockSyntax.key;
                            }
                        }
                    }
                }
            }

            if (!type) {
                if (calleeData.object && calleeData.object.name) {
                    if (callee.property && callee.property.name)
                        var keyword = calleeData.object.name + '.' + callee.property.name;
                    else
                        var keyword = calleeData.object.name;

                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                }
            }
        }


        if (type) {
            var block = Entry.block[type];
            var paramsMeta = block.params;
            var paramsDefMeta = block.def.params;

            for(var p in paramsMeta) {
                var paramType = paramsMeta[p].type;
                if (paramType == "Indicator")
                    params[p] = null;
                else if (paramType == "Text")
                    params[p] = null;
            }

            var paramIndex = this.getParamIndex(syntax);

            if (callee && callee.property) {
                if (callee.property.name == "append") {
                    if (callee.object) {
                        if (callee.object.object) {
                            if (callee.object.object.name == "self") {
                                var name = callee.object.property.name;
                                if (!this.util.isLocalListExisted(name, this._currentObject)){
                                    var keyword = name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_LIST);

                                    return result;
                                }
                            }
                        }
                        else {
                            var name = callee.object.name;
                            if (!this.util.isGlobalListExisted(name) &&
                                !this.util.isLocalListExisted(name, this._currentObject)){
                                var keyword = name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);

                                return result;
                            }
                        }
                    }


                    var listName = this.ParamDropdownDynamic(name, paramsMeta[1], paramsDefMeta[1]);
                    params[paramIndex[0]] = listName;
                    addedParamIndex++;
                } else if (callee.property.name == "pop") {
                    if (callee.object) {
                        if (callee.object.object) {
                            if (callee.object.object.name == "self") {
                                var name = callee.object.property.name;
                                if (!this.util.isLocalListExisted(name, this._currentObject)){
                                    var keyword = name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_LIST);

                                    return result;
                                }
                            }
                        }
                        else {
                            var name = callee.object.name;
                            if (!this.util.isGlobalListExisted(name)){
                                var keyword = name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);

                                return result;
                            }
                        }
                    }


                    var listName = this.ParamDropdownDynamic(name, paramsMeta[1], paramsDefMeta[1]);
                    params[paramIndex[0]] = listName;
                    addedParamIndex++;
                } else if (callee.property.name == "insert") {
                    if (callee.object) {
                        if (callee.object.object) {
                            if (callee.object.object.name == "self") {
                                var name = callee.object.property.name;
                                if (!this.util.isLocalListExisted(name, this._currentObject)){
                                    var keyword = name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_LIST);

                                    return result;
                                }
                            }
                        }
                        else {
                            var name = callee.object.name;
                            if (!this.util.isGlobalListExisted(name)){
                                var keyword = name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);

                                return result;
                            }
                        }
                    }


                    var listName = this.ParamDropdownDynamic(name, paramsMeta[1], paramsDefMeta[1]);
                    params[paramIndex[0]] = listName;
                    addedParamIndex++;
                }
            }

            var pi = 0;
            pi += addedParamIndex;

            if (blockSyntax.textParams)
                var textParams = blockSyntax.textParams;

            result.arguments = [];

            for(var i in arguments) {
                var isParamOption = false;
                var argument = arguments[i];

                if (argument) {

                    argument.calleeName = calleeName;
                    if (!textParams)
                        var textParams = [];

                    var param = this[argument.type](
                        argument,
                        paramsMeta[paramIndex[pi]],
                        paramsDefMeta[paramIndex[pi]],
                        textParams[paramIndex[pi]]
                    );

                    if (param && param.data) {
                        param = param.data;
                    }


                    if (param) { // Function Param Check
                        if (this.isFuncParam(param.name)) {
                            var fParam = {};
                            fParam.type = param.name;
                            fParam.params = [];
                            fParam.isParamFromFunc = true;

                            param = fParam;
                        }
                    }

                    if (param) { // For Member Param
                        var keyOption = blockSyntax.keyOption;
                        if (keyOption || keyOption === 0) {
                            if (param.object && param.property.name) {
                                var pName = param.object.name + "." + param.property.name;
                                if (keyOption == pName)
                                    isParamOption = true;
                            }
                            else if ((param.type == "text" || param.type =="number") && param.params && param.params.length != 0) {
                                var pName = param.params[0];
                                if (keyOption == pName)
                                    isParamOption = true;
                            }
                        }
                        else {
                            if (param.object && param.property.name) {
                                if (param.object.name != "self") {
                                    var pName = param.object.name + "." + param.property.name;
                                    var memberParam = {};
                                    memberParam.value = pName;
                                    var param = this['Literal']
                                        (memberParam, paramsMeta[paramIndex[pi]], paramsDefMeta[paramIndex[pi]], textParams[paramIndex[pi]]);
                                }
                            }
                        }
                    }

                    if (isParamOption) continue;
                    var pIndex = paramIndex[pi++];
                    if (pIndex === undefined) continue;

                    params[pIndex] = param;
                    result.arguments.push(param);


                    if (param) { // Variable, List Check
                        if (param.object && param.object.object) {
                            if (param.object.object.name == "self") {
                                var name = param.object.property.name;
                                if (param.type == "char_at") {
                                    if (!this.util.isLocalVariableExisted(name, this._currentObject)) {
                                        var keyword = name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                    }
                                }
                                else {
                                    if (!this.util.isLocalListExisted(name, this._currentObject)) {
                                        var keyword = name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_LIST);
                                    }
                                }
                            }
                            else {
                                 var name = param.object.object.name;
                                if (!this.util.isGlobalListExisted(name, this._currentObject)) {
                                    var keyword = name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_LIST);
                                }
                            }
                        }
                        else if (param.object) {
                            if (callee.property && callee.property.name == "in") {
                                if (param.object.name == "self") {
                                    var name = param.property.name;
                                    if (!this.util.isLocalListExisted(name, this._currentObject)) {
                                        var keyword = param.object.name + '.' + param.property.name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_LIST);
                                    }
                                }
                                else {
                                    var name = param.object.name;
                                    var keyword = name;
                                    if (param.object.listType && param.object.listType == "global") {
                                        if (!this.util.isGlobalListExisted(name)) {
                                            Entry.TextCodingError.error(
                                                Entry.TextCodingError.TITLE_CONVERTING,
                                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                keyword,
                                                this._blockCount,
                                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                                        }
                                    }
                                }
                            }
                            else if (callee.property && callee.property.name == "len") {
                                if (param.object.name == "self") {
                                    var name = param.property.name;
                                    if (syntax == "len#length_of_string") {
                                        if (!this.util.isLocalVariableExisted(name, this._currentObject)) {
                                            if (!this.isFuncParam(name)) {
                                                var keyword = param.object.name + '.' + param.property.name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                            }
                                        }
                                    }
                                    else if (syntax == "len") {
                                        if (!this.util.isLocalListExisted(name, this._currentObject)) {
                                            var keyword = name;
                                            Entry.TextCodingError.error(
                                                Entry.TextCodingError.TITLE_CONVERTING,
                                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                keyword,
                                                this._blockCount,
                                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                                        }
                                    }
                                }
                                else {
                                    var name = param.object.name;
                                    if (param.object.listType && param.listType == "global") {
                                        if (!this.util.isGlobalListExisted(name)) {
                                            var keyword = name;
                                            Entry.TextCodingError.error(
                                                Entry.TextCodingError.TITLE_CONVERTING,
                                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                keyword,
                                                this._blockCount,
                                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                                        }
                                    }
                                    else if (param.variableType && param.variableType == "global") {
                                        if (!this.util.isGlobalVariableExisted(name)) {
                                            if (!this.isFuncParam(name)) {
                                                var keyword = name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if (param.property.callee == "__pythonRuntime.ops.subscriptIndex") {
                                    if (!param.object.type) {
                                        var name = param.object.name;
                                        if (!this.util.isGlobalListExisted(name)) {
                                            if (!this.isFuncParam(name)) {
                                                var keyword = name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (param.object.name == "self") {
                                        var name = param.property.name;
                                        if (param.property && param.property.listType == "local") {
                                            if (!this.util.isLocalListExisted(name, this._currentObject)) {
                                                var keyword = param.object.name + '.' + param.property.name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                                            }
                                        }
                                        else if (param.property && param.property.variableType == "local") {
                                            if (!this.util.isLocalVariableExisted(name, this._currentObject)) {
                                                var keyword = param.object.name + '.' + param.property.name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                            }
                                        }
                                    } else if (param.object.name == "Hamster") {
                                        continue;
                                    } else {
                                        var name = param.object.name;
                                        var keyword = name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_OBJECT,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_OBJECT);
                                    }
                                }
                            }
                        }
                        else {
                            if (param.name) {
                                if (callee.property && callee.property.name == "in") {
                                    var name = param.name;
                                    if (param.listType && param.listType == "global") {
                                        if (!this.util.isGlobalListExisted(name)) {
                                            var keyword = name;
                                            Entry.TextCodingError.error(
                                                Entry.TextCodingError.TITLE_CONVERTING,
                                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                keyword,
                                                this._blockCount,
                                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                                        }
                                    }
                                    else if (param.variableType && param.variableType == "global") {
                                        if (!this.util.isGlobalVariableExisted(name)) {
                                            if (!this.isFuncParam(name)) {
                                                var keyword = name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                            }
                                        }
                                    }
                                }
                                else if (callee.property && callee.property.name == "len") {
                                    var name = param.name;
                                    if (syntax == "len#length_of_string") {
                                        if (param.listType && param.listType == "global") {
                                            if (!this.util.isGlobalListExisted(name)) {
                                                var keyword = name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                                            }
                                        }
                                        else if (param.variableType && param.variableType == "global") {
                                            if (!this.util.isGlobalVariableExisted(name)) {
                                                if (!this.isFuncParam(name)) {
                                                    var keyword = name;
                                                    Entry.TextCodingError.error(
                                                        Entry.TextCodingError.TITLE_CONVERTING,
                                                        Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                        keyword,
                                                        this._blockCount,
                                                        Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                                }
                                            }
                                        }
                                    }
                                    else if (syntax == "len") {
                                        if (param.listType && param.listType == "global") {
                                            if (!this.util.isGlobalListExisted(name)) {
                                                var keyword = name;
                                                Entry.TextCodingError.error(
                                                    Entry.TextCodingError.TITLE_CONVERTING,
                                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                                    keyword,
                                                    this._blockCount,
                                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                                            }
                                        }
                                        else if (param.variableType && param.variableType == "global") {
                                            if (!this.util.isGlobalVariableExisted(name)) {
                                                if (!this.isFuncParam(name)) {
                                                    var keyword = name;
                                                    Entry.TextCodingError.error(
                                                        Entry.TextCodingError.TITLE_CONVERTING,
                                                        Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                        keyword,
                                                        this._blockCount,
                                                        Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    var name = param.name;
                                    if (!this.isFuncParam(name)) {
                                        if (param.variableType == "global") {
                                            if (!this.util.isGlobalVariableExisted(name)) {
                                                if (!this.isFuncParam(name)) {
                                                    var keyword = name;
                                                    Entry.TextCodingError.error(
                                                        Entry.TextCodingError.TITLE_CONVERTING,
                                                        Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                        keyword,
                                                        this._blockCount,
                                                        Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                                }
                                            }
                                        }
                                        else if (param.listType == "global") {
                                            if (!this.util.isGlobalListExisted(name)) {
                                                    var keyword = name;
                                                    Entry.TextCodingError.error(
                                                        Entry.TextCodingError.TITLE_CONVERTING,
                                                        Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                                        keyword,
                                                        this._blockCount,
                                                        Entry.TextCodingError.SUBJECT_CONV_VARIABLE);

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }


            if (callee.object && callee.property) { //'range' in for i in range
                if (callee.property.name == "range") {
                    if (params.length > 2) {
                        //Just Check
                    }
                    else if (params.length == 2) {
                        for(var p in params) {
                            var param = params[p];
                            var rParamBlock = {};
                            var rParamType = "calc_basic";
                            var rParamParams = [];
                            rParamParams[1] = "MINUS";

                            if (typeof param == "object") {
                                if (param.type == "text" || param.type == "number") {
                                    params[p] = param.params[0];
                                }
                            }

                            if (p == 1) {
                                if ((typeof params[0] == "string" || typeof params[0] == "number") &&
                                    (typeof params[1] == "string" || typeof params[1] == "number")) {
                                    var count = parseInt(params[1]) - parseInt(params[0]);

                                    if (Entry.Utils.isNumber(count)) {
                                        var rParams = [];
                                        rParams.push(count);
                                        params = rParams;
                                    }
                                    else {
                                        var rParams = [];
                                        rParams.push(10);
                                        params = rParams;
                                    }
                                }
                                else {
                                    if (typeof params[0] == "string" || typeof params[0] == "number") {
                                        var rBlock = {};
                                        var rType = "text";
                                        var rParams = [];
                                        rParams.push(params[0]);
                                        rBlock.type = rType;
                                        rBlock.params = rParams;

                                        params[0] = rBlock;
                                    }

                                    if (typeof params[1] == "string" || typeof params[1] == "number") {
                                        var rBlock = {};
                                        var rType = "text";
                                        var rParams = [];
                                        rParams.push(params[1]);
                                        rBlock.type = type;
                                        rBlock.params = rParams;

                                        params[1] = rBlock;
                                    }

                                    rParamParams[0] = params[1];
                                    rParamParams[2] = params[0];

                                    rParamBlock.type = rParamType;
                                    rParamBlock.params = rParamParams;

                                    result = rParamBlock;
                                    return result;
                                }
                            }
                        }
                    }
                    else if (params.length == 1) {
                        if (typeof param != "object") {
                            param = params[0];
                            params.splice(0, 1, param);
                        }
                        else {
                            param = params[0];
                            type = param.type;
                            params = param.params;
                            if (param.isParamFromFunc)
                                var isParamFromFunc = true;
                        }

                        /*else {
                            if (param.type && param.params) {
                                type = param.type;
                                params = param.params;
                            }
                        }*/
                    }
                }
                else if (callee.property.name == "add") {
                    var isStringIncluded = false;
                    for(var p in params) {
                        var param = params[p];
                        if (param && param.type) {
                            if (param.type == "text" || param.type == "number") {
                                if (param.params && param.params.length != 0) {
                                    var p = param.params[0];
                                    if (typeof p != "number") {
                                        isStringIncluded = true;
                                        break;
                                    }
                                }
                            }
                            else if (param.type == "get_variable") {
                                var name = param.params[0];
                                if (!this.util.isVariableNumber(name, param.variableType)) {
                                    isStringIncluded = true;
                                    break;
                                }
                            }
                            else if (param.type == "combine_something") {
                                isStringIncluded = true;
                                break;
                            }
                        }
                    }

                    /*if (isStringIncluded) { //retype considering parameter condition
                        var syntax = String("(%2 + %4)");
                        var blockSyntax = this.getBlockSyntax(syntax);
                        if (blockSyntax)
                            type = blockSyntax.key;

                        var combineParams = [];
                        combineParams[1] = params[0];
                        combineParams[3] = params[2];
                        params = combineParams;

                    }*/
                }
                else if (callee.property.name == "minus") {
                }
                else if (callee.property.name == "len") {
                    if (syntax == String("len")) {
                        var p = params[1];
                        p = this.ParamDropdownDynamic(p.name, paramsMeta[1], paramsDefMeta[1]);
                        params[1] = p;
                    }
                }
                else if (callee.property.name == "in") {
                    var p = params[1];
                    p = this.ParamDropdownDynamic(p.name, paramsMeta[1], paramsDefMeta[1]);
                    params[1] = p;
                }
                else if (callee.property.name == "pop") {
                    if (params[0].type) {
                        if (params[0].type == "number" || params[0].type == "text") {
                            if (Entry.Utils.isNumber(params[0].params[0]))
                                params[0].params[0] += 1;
                        }
                        else if (params[0].type == "get_variable") {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[0];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[0] = indexBlock;
                        }
                        else if (params[0].type == "calc_basic") {
                            if (params[0].params && params[0].params[1] == "MINUS" &&
                                params[0].params[2] && params[0].params[2].params && params[0].params[2].params[0] == "1") {
                                params[0] = params[0].params[0];
                            }
                            else {
                                var indexBlock = {};
                                var indexBlockType = "calc_basic";
                                indexBlock.type = indexBlockType;
                                var indexParams = [];
                                indexParams[0] = params[0];
                                indexParams[1] = "PLUS";
                                indexParams[2] = {type: "number", params: [1]};
                                indexBlock.params = indexParams;
                                params[0] = indexBlock;
                            }
                        }
                        else {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[0];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[0] = indexBlock;
                        }
                    }
                    else {
                        if (!this.isFuncParam(params[0].name)) {
                            var keyword;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
                        } else {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[0];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[0] = indexBlock;
                        }
                    }

                }
                else if (callee.property.name == "insert") {
                    if (params[2].type) {
                        if (params[2].type == "number" || params[2].type == "text") {
                            if (Entry.Utils.isNumber(params[2].params && params[2].params[0]))
                                params[2].params[0] += 1;
                        }
                        else if (params[2].type == "get_variable") {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[2];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[2] = indexBlock;
                        }
                        else if (params[2].type == "calc_basic") {
                            if (params[2].params && params[2].params[1] == "MINUS" && params[2].params[2] &&
                                params[2].params[2].params && params[2].params[2].params[0] == "1") {
                                params[2] = params[2].params[0];
                            }
                            else {
                                var indexBlock = {};
                                var indexBlockType = "calc_basic";
                                indexBlock.type = indexBlockType;
                                var indexParams = [];
                                indexParams[0] = params[2];
                                indexParams[1] = "PLUS";
                                indexParams[2] = {type: "number", params: [1]};
                                indexBlock.params = indexParams;
                                params[2] = indexBlock;
                            }
                        }
                        else {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[2];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[2] = indexBlock;
                        }
                    }
                    else {
                        if (!this.isFuncParam(params[2].name)) {
                            var keyword;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
                        } else {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[2];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[2] = indexBlock;
                        }
                    }

                }
                else if (callee.property.name == "subscriptIndex") {
                    if (params[3].type) {
                        if (params[3].type == "number" || params[3].type == "text") {
                            if (Entry.Utils.isNumber(params[3].params[0]))
                                params[3].params[0] += 1;
                        }
                        else if (params[3].type == "get_variable") {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[3];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[3] = indexBlock;
                        }
                        else if (params[3].type == "calc_basic") {
                            if (params[3].params && params[3].params[1] == "MINUS" && params[3].params[2] &&
                                params[3].params[2].params && params[3].params[2].params[0] == "1") {
                                params[3] = params[3].params[0];
                            }
                            else {
                                var indexBlock = {};
                                var indexBlockType = "calc_basic";
                                indexBlock.type = indexBlockType;
                                var indexParams = [];
                                indexParams[0] = params[3];
                                indexParams[1] = "PLUS";
                                indexParams[2] = {type: "number", params: [1]};
                                indexBlock.params = indexParams;
                                params[3] = indexBlock;
                            }
                        }
                    }
                    else {
                        if (!this.isFuncParam(params[3].name)) {
                            var keyword;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
                        } else {
                            var indexBlock = {};
                            var indexBlockType = "calc_basic";
                            indexBlock.type = indexBlockType;
                            var indexParams = [];
                            indexParams[0] = params[3];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[3] = indexBlock;
                        }
                    }
                } else if (callee.property.name == "_pySlice") {
                    if (callee.object) {
                        var objectData = this[callee.object.type](callee.object);
                        var newParams = [];
                        newParams[1] = objectData;
                        if (params[1].type) {
                            if (params[1].type == "number" || params[1].type == "text") {
                                if (Entry.Utils.isNumber(params[1].params[0]))
                                    params[1].params[0] += 1;
                            } else if (params[1].type == "get_variable") {
                                var indexBlock = {};
                                var indexBlockType = "calc_basic";
                                indexBlock.type = indexBlockType;
                                var indexParams = [];
                                indexParams[0] = params[1];
                                indexParams[1] = "PLUS";
                                indexParams[2] = {type: "number", params: [1]};
                                indexBlock.params = indexParams;
                                params[1] = indexBlock;
                            } else if (params[1].type == "calc_basic") {
                                if (params[1].params && params[1].params[1] == "MINUS" && params[1].params[2] &&
                                    params[1].params[2].params && params[1].params[2].params[0] == "1") {
                                    params[1] = params[1].params[0];
                                }
                                else {
                                    var indexBlock = {};
                                    var indexBlockType = "calc_basic";
                                    indexBlock.type = indexBlockType;
                                    var indexParams = [];
                                    indexParams[0] = params[1];
                                    indexParams[1] = "PLUS";
                                    indexParams[2] = {type: "number", params: [1]};
                                    indexBlock.params = indexParams;
                                    params[1] = indexBlock;
                                }
                            }
                        }
                        else {
                            if (!this.isFuncParam(params[1].name)) {
                                var keyword;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
                            } else {
                                var indexBlock = {};
                                var indexBlockType = "calc_basic";
                                indexBlock.type = indexBlockType;
                                var indexParams = [];
                                indexParams[0] = params[1];
                                indexParams[1] = "PLUS";
                                indexParams[2] = {type: "number", params: [1]};
                                indexBlock.params = indexParams;
                                params[1] = indexBlock;
                            }
                        }

                        newParams[3] = params[1];
                        newParams[5] = params[3];
                        params = newParams;
                    }
                }
                else if (callee.property.name == "find") {
                    if (callee.object) {
                        var objectData = this[callee.object.type](callee.object);
                        var newParams = [];
                        newParams[1] = objectData;
                        newParams[3] = params[1];
                        params = newParams;
                    }
                }
                else if (callee.property.name == "replace") {
                    if (callee.object) {
                        var objectData = this[callee.object.type](callee.object);
                        var newParams = [];
                        newParams[1] = objectData;
                        newParams[3] = params[1];
                        newParams[5] = params[3];
                        params = newParams;
                    }
                }
                else if (callee.property.name == "upper") {
                    if (callee.object) {
                        var objectData = this[callee.object.type](callee.object);
                        var newParams = [];
                        newParams[1] = objectData;
                        newParams[3] = params[1];
                        params = newParams;
                    }
                }
                else if (callee.property.name == "lower") {
                    if (callee.object) {
                        var objectData = this[callee.object.type](callee.object);
                        var newParams = [];
                        newParams[1] = objectData;
                        newParams[3] = params[1];
                        params = newParams;
                    }
                } else if (callee.property.name == "uniform") {
                    var value;
                    if (params[1].type === 'number' || params[1].type === 'text') {
                        value = params[1].params[0];
                        if (!Entry.isFloat(value))
                            params[1].params[0] = value + '.0';
                    }

                    if (params[3].type === 'number' || params[3].type === 'text') {
                        value = params[3].params[0];
                        if (!Entry.isFloat(value))
                            params[3].params[0] = value + '.0';
                    }
                } else if (callee.property.name == "randint") {
                    var value;
                    if (params[1].type === 'number' || params[1].type === 'text') {
                        value = params[1].params[0];
                        if (Entry.isFloat(value))
                            params[1].params[0] = Math.floor(value);
                    }

                    if (params[3].type === 'number' || params[3].type === 'text') {
                        value = params[3].params[0];
                        if (Entry.isFloat(value))
                            params[3].params[0] = Math.floor(value);
                    }
                }

            }

            //HW
            if (callee.object && callee.property) {
                if (callee.object.name == "Hamster") {
                    if (callee.property.name == "wheels") {
                        var calleeName = callee.object.name + "." + callee.property.name;
                        var param1 = params[0];
                        var param2 = params[1];
                        //if (param1.params[0] == param2.params[0]) {
                        if (!params[1]) {
                            var keyOption = "SAME";
                            var syntax = calleeName + "#" + keyOption;
                            var blockSyntax = this.getBlockSyntax(syntax);
                            if (blockSyntax) {
                                type = blockSyntax.key;
                            }
                        }
                    }
                    else if (callee.property.name == "wheels_by") {
                        var calleeName = callee.object.name + "." + callee.property.name;
                        var param1 = params[0];
                        var param2 = params[1];
                        //if (param1.params[0] == param2.params[0]) {
                            if (!params[1]) {
                            var keyOption = "SAME";
                            var syntax = calleeName + "#" + keyOption;
                            var blockSyntax = this.getBlockSyntax(syntax);
                            if (blockSyntax) {
                                type = blockSyntax.key;
                            }
                        }
                    }
                }
            }


            if (blockSyntax.params && blockSyntax.params.length != 0) {
                for(var p in blockSyntax.params) {
                    var param = blockSyntax.params[p];
                    if (param)
                        params[p] = param;
                }
            }

            if (type) {
                structure.type = type;
                result.type = structure.type;
            }

            if (params) {
                structure.params = params;
                result.params = structure.params;
            }

            if (isParamFromFunc) {
                result.isParamFromFunc = true;
            }
        } else { //special param
            var args = [];
            for(var i in arguments) {
                var argument = arguments[i];
                if (!argument) continue;

                var argumentData = this[argument.type](argument);

                if (argument.type == "ThisExpression")
                    continue;
                else if (!argumentData.type && argumentData.isCallParam) {
                        var keyword;
                        Entry.TextCodingError.error(
                            Entry.TextCodingError.TITLE_CONVERTING,
                            Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                            keyword,
                            this._blockCount,
                            Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
                }
                else {
                    if (!argumentData.type && !argumentData.isCallParam &&
                        argumentData.callee != "__pythonRuntime.utils.createParamsObj") {
                        if (argumentData.object && argumentData.object.name == "self") {
                            if (argumentData.property.variableType || argumentData.property.listType)
                                break;
                            if (!argumentData.property.variableType) {
                                var keyword = argumentData.object.name + '.' + argumentData.property.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                            }
                            if (!argumentData.property.listType) {
                                var keyword = argumentData.object.name + '.' + argumentData.property.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                            }
                        }
                        else if (!this.isFuncParam(argumentData.name)) {
                            if (argumentData.variableType || argumentData.listType)
                                break;
                            if (!argumentData.variableType) {
                                var keyword = argumentData.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                            }
                            if (!argumentData.listType) {
                                var keyword = argumentData.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                            }
                        }
                    }
                }

                if (argumentData.callee == "__pythonRuntime.utils.createParamsObj") {
                    args = argumentData.arguments;
                }
                else if (argumentData.type) {
                    args.push(argumentData);
                }
                else {
                    args.push(argumentData);
                }

            }

            result.arguments = args;
        }


        // Function Check
        if (result.arguments && result.arguments[0] &&
            result.arguments[0].callee == "__pythonRuntime.utils.createParamsObj") {
            return result;
        }

        if (result.callee) {
            var funcName  = result.callee.name;
            if (result.arguments) {
                var idNumber = result.arguments.length;
                var params = [];
                var arguments = result.arguments;
                for(var a in arguments) {
                    var argument = arguments[a];
                    params.push(argument);
                }
            } else {
                var idNumber = 0;
            }

            var funcKey = funcName;
            var type = this._funcMap[funcKey];
            if (type) {
                result = {};
                result.type = type;

                if (params && params.length != 0) {
                    result.params = params;
                }
            }
            else {
                if (funcKey == this._currentFuncKey) {
                    if (!this.util.isEntryEventFuncName(result.callee.name)) {
                        result.type = funcKey;
                        result.params = params;
                        result.funcName = funcName;
                        this._hasReculsiveFunc = true;
                    }
                }
                else {
                    if (result.callee.isCallParam == false) {
                        if (!this.util.isEntryEventFuncName(result.callee.name)) {
                            var name = result.callee.name;
                            var keyword = name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_FUNCTION,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_FUNCTION);
                        }
                    }
                }
            }
        }

        return result;
    };

    p.Identifier = function(component, paramMeta, paramDefMeta) {
        var result = {};
        var structure = {};
        structure.params = [];

        var name = component.name;
        result.name = name;
        if (component.userCode === true || component.userCode === false)
            result.userCode = component.userCode;

        if (this.isFuncParam(name) &&
            !this.util.isNameInEntryData(name, this._currentObject)) {
            result.isCallParam = false;
            return result;
        }

        if (this.util.isGlobalVariableExisted(name)) {
            result.variableType = "global";
            var syntax = "%1#get_variable";
        }
        if (this.util.isLocalVariableExisted(name, this._currentObject)){
            result.variableType = "local";
            var syntax = "%1#get_variable";
        }
        if (this.util.isGlobalListExisted(name)) {
            result.listType = "global";
        }
        if (this.util.isLocalListExisted(name, this._currentObject)) {
            result.listType = "local";
        }

        if (!syntax) {
            result.isCallParam = false;
            return result;
        }

        var blockSyntax = this.getBlockSyntax(syntax);
        if (blockSyntax)
            var type = blockSyntax.key;

        if (type) {
            var block = Entry.block[type];
            var paramsMeta = block.params;
            var paramsDefMeta = block.def.params;

            var params = [];
            var param;
            for(var i in paramsMeta) {
                if (paramsMeta[i].type == "Text")
                    continue;
                param = this['Param'+paramsMeta[i].type](name, paramsMeta[i], paramsDefMeta[i]);
            }


            if (param)
                params.push(param);

            result.type = type;
            if (params.length != 0) {
                structure.params = params;
                result.params = structure.params;
                result.variableType = "global";
            }

        }

        return result;
    };

    p.VariableDeclaration = function(component) {
        var result = {};
        result.declarations = [];

        var structure = {};

        var declarations = component.declarations;
        //var funcParamMap = {};
        for(var i in declarations) {
            var declaration = declarations[i];
            var declarationData = this[declaration.type](declaration);

            if (declarationData && declarationData.isFuncParam) {
                this._funcParams.push(declarationData.name);
                //funcParamMap[i] = declarationData.name;
                //this.util.addFuncParam(declarationData.name);
            }

            if (declarationData) {
                result.declarations.push(declarationData);
            }
            if (declarationData && declarationData.type) {
                structure.type = declarationData.type;
            }
            if (declarationData && declarationData.params) {
                structure.params = declarationData.params;
            }
        }

        //this._funcParamMap.put(this._currentFuncKey, funcParamMap);

        if (structure.type)
            result.type = structure.type;
        if (structure.params)
            result.params = structure.params;


        return result;

    };

    p.VariableDeclarator = function(component) {
        var result = {};
        var structure = {};
        var params = [];

        this._blockCount++;
        if ((component.id.name && component.id.name.search("__") != -1) ||
            (component.init && component.init.callee && component.init.callee.name &&
             component.init.callee.name.search("__") != -1)) {
            this._blockCount--;
        }

        var id = component.id;
        var init = component.init;

        // This is Function-Related Param
        if (id.name && (id.name.search("__params") != -1
            || id.name.search("__formalsIndex") != -1
            || id.name.search("__args") != -1))
            return undefined;

        // This is Function-Related Param
        if (init.callee && init.callee.name && init.callee.name.search("__getParam") != -1) {
            result.isFuncParam = true;
            result.name = id.name;

            return result;
        }

        if (init.object && init.object.name && init.object.name.search("__filbertTmp") != -1) {
            var keyword;
            Entry.TextCodingError.error(
                Entry.TextCodingError.TITLE_CONVERTING,
                Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                keyword,
                this._blockCount,
                Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
        }

        if (init.callee && init.callee.object && init.callee.property) {
            if (init.callee.object.object && init.callee.object.object.name)
                var objectObjectName  = init.callee.object.object.name;
            if (init.callee.object.property && init.callee.object.property.name)
                var objectPropertyName = init.callee.object.property.name;
            if (init.callee.property.name)
                var propertyName = init.callee.property.name;

            if (objectObjectName && objectPropertyName && propertyName)
                calleeName = objectObjectName.concat('.').concat(objectPropertyName).concat('.').concat(propertyName);
        }

        //Id Registration and Initiation for A+=B Case
        if (calleeName == "__pythonRuntime.objects.list") {
            var name = id.name;
            var array = [];
            if (this.util.isGlobalListExisted(name)) {
                if (!this._funcLoop) {
                    this.util.updateGlobalList(name, array);
                }
            }
            else {
                if (!this._funcLoop) {
                    this.util.createGlobalList(name, array);
                }
            }
        }
        else {
            var name = id.name;
            var value = 0;
            if (value || value == 0) {
                if (name.search("__filbert") == -1) {
                    if (this.util.isGlobalVariableExisted(name)) {
                        if (!this._funcLoop)
                            this.util.updateGlobalVariable(name, value);
                    }
                    else {
                        if (!this._funcLoop) {
                            this.util.createGlobalVariable(name, value);
                        }
                        else {
                            value = 0;
                            this.util.createGlobalVariable(name, value);
                        }
                    }
                }
            }
        }

        var idData = this[id.type](id);
        var initData = this[init.type](init);


        //var params = [];
        if (init.type == "Identifier" || init.type == "MemberExpression") {
            if (initData.property && initData.property.callee == "__pythonRuntime.ops.subscriptIndex") {
                if (initData.object && initData.object.object) {
                    if (initData.object.object.name != "self") { // Not Self List
                        var name = initData.object.object.name;
                        if (!this.util.isGlobalListExisted(name)) {
                            var keyword = name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                        }
                    }
                    else if (initData.object.property) { // Self List
                        var name = initData.object.property.name;
                        if (!this.util.isLocalListExisted(initData.object.property.name, this._currentObject)) {
                            var keyword = name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                        }
                    }
                }
                else if (initData.object) { // List
                    var name = initData.object.name;
                    if (initData.object.type == "get_variable") {
                        if (!this.util.isGlobalListExisted(name) && !this.util.isGlobalVariableExisted(name)) {
                            var keyword = name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                        }
                    }
                }
            }
            else {
                if (initData.object) {
                    if (initData.object.name != "self") { // Not Self List
                        var keyword = initData.object.name;
                        Entry.TextCodingError.error(
                            Entry.TextCodingError.TITLE_CONVERTING,
                            Entry.TextCodingError.MESSAGE_CONV_NO_OBJECT,
                            keyword,
                            this._blockCount,
                            Entry.TextCodingError.SUBJECT_CONV_OBJECT);

                    }
                    else if (initData.property.name) { // Self List
                        var name = initData.property.name;
                        if (!this.util.isLocalVariableExisted(name, this._currentObject)) {
                            var keyword = name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                        }
                    }
                }
                else {
                    var name = initData.name;
                    if (!this.util.isGlobalVariableExisted(name)) {
                        var keyword = name;
                        if (!this.isFuncParam(name)) {
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                        }
                    }
                }
            }
        }

        var calleeName;

        if (calleeName == "__pythonRuntime.objects.list") {
            result.id = idData;

            result.init = initData;

            var name = id.name;

            var array = [];
            var arguments = initData.arguments;
            for(var a in arguments) {
                var argument = arguments[a];
                var item = {};
                if (argument.type) {
                    var arg = argument.params[0];
                    if (typeof arg === "string")
                        arg = '"()"'.replace('()', arg);
                    item.data = String(argument.params[0]);
                }
                else if (argument.name) {
                    var keyword = argument.name;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                }
                if (Entry.Utils.isNumber(item))
                    item = parseFloat(item);
                array.push(item);
            }


            if (this.util.isGlobalListExisted(name)) {
                if (!this._funcLoop) {
                    this.util.updateGlobalList(name, array);
                }
            }
            else {
                if (!this._funcLoop) {
                    this.util.createGlobalList(name, array);
                }
            }

        } else {
            var name = id.name;
            if (init.type == "Literal") {
                var value = init.value;
            }
            else if (init.type == "Identifier") {
                var value = init.name;
            }
            else if (init.type == "UnaryExpression") {
                var value = initData.params[0];
                if (typeof value != "string" && typeof value != "number") {
                    value = 0;
                }
            }
            else {
                var value = 0
            }

            if (Entry.Utils.isNumber(value))
                value = parseFloat(value);


            if (value || value == 0) {
                if (name.search("__filbert") == -1) {

                    if (this.util.isGlobalVariableExisted(name)) {
                        if (!this._funcLoop)
                            this.util.updateGlobalVariable(name, value);
                    }
                    else {
                        if (!this._funcLoop) {
                            this.util.createGlobalVariable(name, value);
                        }
                        else {
                            value = 0;
                            this.util.createGlobalVariable(name, value);
                        }
                    }
                }
            }

            result.id = idData;

            result.init = initData;

            if (init.type == "Literal") {
                var syntax = String("%1 = %2");
            }
            else {
                if (initData.params && initData.params[0] && initData.params[0].name &&
                    idData.name == initData.params[0].name &&
                    initData.operator == "PLUS") {
                    var syntax = String("%1 += %2");
                } //for combine something type
                else if (initData.type == "combine_something" && initData.params && initData.params[1] && initData.params[1].name &&
                    idData.name == initData.params[1].name &&
                    initData.operator == "PLUS") {
                    var syntax = String("%1 += %2");
                }
                else {
                    var syntax = String("%1 = %2");
                }
            }
            var blockSyntax = this.getBlockSyntax(syntax);
            var type;
            if (blockSyntax)
                type = blockSyntax.key;

            structure.type = type;

            var block = Entry.block[type];
            var paramsMeta = block.params;
            var paramsDefMeta = block.def.params;

            if (idData.name)
                var variableId = this.ParamDropdownDynamic(idData.name, paramsMeta[0], paramsDefMeta[0]);

            var params = [];
            if (init.type == "Literal") {
                if (idData.params && idData.params[0])
                    params.push(idData.params[0]);
                else
                    params.push(variableId);
                var pData = initData.params[0];
                /*if (typeof pData == "string")
                    pData = "\"" + pData + "\"";*/
                initData.params[0] = pData;
                params.push(initData);
            }
            else {
                if (initData.params && initData.params[0] && idData.name == initData.params[0].name &&
                    initData.operator == "PLUS" || initData.operator == "MINUS") {
                    if (idData.params && idData.params[0])
                        params.push(idData.params[0]);
                    else
                        params.push(variableId);

                    if (initData.operator == "MINUS") {
                        if (initData.params[2].params[0] != 0)
                            initData.params[2].params[0] = "-" + initData.params[2].params[0];
                    }

                    params.push(initData.params[2]);
                } //combine something
                else if (initData.type == "combine_something" && initData.params && initData.params[1] && idData.name == initData.params[1].name &&
                    initData.operator == "PLUS" || initData.operator == "MINUS") {
                    if (idData.params && idData.params[0])
                        params.push(idData.params[0]);
                    else
                        params.push(variableId);

                    if (initData.operator == "MINUS") {
                        if (initData.params[3].params[0] != 0)
                            initData.params[3].params[0] = "-" + initData.params[3].params[0];
                    }

                    params.push(initData.params[3]);
                }
                else {
                    if (idData.params && idData.params[0])
                        params.push(idData.params[0]);
                    else
                        params.push(variableId);

                    params.push(initData);
                }
            }

            structure.params = params;

            result.type = structure.type;
            result.params = structure.params;
        }

        return result;

    };

    p.AssignmentExpression = function(component) {
        var result = {};
        var structure = {};

        var params = [];
        var param;

        var left = component.left;
        if (left.type) {
            var leftData = this[left.type](left);
        }


        result.left = leftData

        operator = String(component.operator);

        var right = component.right;
        if (right.type) {
            var rightData = this[right.type](right);
        }

        result.right = rightData;

        switch(operator){
            case "=": {
                if (rightData && rightData.callee && rightData.callee.object) {
                    var calleeName = rightData.callee.object.object.name.concat('.')
                        .concat(rightData.callee.object.property.name).concat('.')
                        .concat(rightData.callee.property.name);
                }

                //left expressoin
                if (left.name) {
                    var leftEx = left.name;
                }
                else if (left.object && left.object.name) {
                    var leftEx = left.object.name.concat(left.property.name);
                }

                //right expression
                if (right.arguments && right.arguments.length != 0 && right.arguments[0].name) {
                    var rightEx = right.arguments[0].name;
                }
                else if (right.arguments && right.arguments.length != 0 && right.arguments[0].object) {
                    var rightEx = right.arguments[0].object.name.concat(right.arguments[0].property.name);
                }
                else if (right.left && right.left.name) {
                    var rightEx = right.left.name;
                }
                else if (right.left && right.left.object) {
                    var rightEx = right.left.object.name.concat(right.left.property.name);
                }


                if (leftData && leftData.property && leftData.property.callee == "__pythonRuntime.ops.subscriptIndex") {
                    var syntax = String("%1\[%2\] = %3");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    var type;
                    if (blockSyntax)
                        type = blockSyntax.key;

                    structure.type = type;
                }
                else if (leftEx && rightEx && leftEx == rightEx && rightData.callee == "__pythonRuntime.ops.add") {
                    var syntax = String("%1 += %2");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    var type;
                    if (blockSyntax)
                        type = blockSyntax.key;

                    structure.type = type;
                }
                else {
                    var syntax = String("%1 = %2");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    var type;
                    if (blockSyntax)
                        type = blockSyntax.key;

                    structure.type = type;
                }

                break;
            }
            case "+=":
                var syntax = String("%1 += %2");
                var blockSyntax = this.getBlockSyntax(syntax);
                var type;
                if (blockSyntax)
                    type = blockSyntax.key;

                structure.type = type;
                break;
            case "-=":
                var syntax = String("%1 += %2");
                var blockSyntax = this.getBlockSyntax(syntax);
                var type;
                if (blockSyntax)
                    type = blockSyntax.key;

                structure.type = type;
                break;
            case "*=":
                var syntax = String("%1 += %2");
                var blockSyntax = this.getBlockSyntax(syntax);
                var type;
                if (blockSyntax)
                    type = blockSyntax.key;

                structure.type = type;
                break;
            case "/=":
                var syntax = String("%1 += %2");
                var blockSyntax = this.getBlockSyntax(syntax);
                var type;
                if (blockSyntax)
                    type = blockSyntax.key;

                structure.type = type;
                break;
            case "%=":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "<<=":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case ">>=":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "|=":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "^=":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "&=":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            default:
                operator = operator;
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
        }

        if (operator) {
            var operatorData = this.util.logicalExpressionConvert(operator);
        }

        result.operator = operatorData;


        if (leftData && leftData.property && leftData.property.callee == "__pythonRuntime.ops.subscriptIndex") { // In Case of List
            if (leftData.object && leftData.object.object) {
                if (leftData.object.object.name != "self") { // Not Self List
                    var keyword = leftData.object.object.name;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_OBJECT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_OBJECT);

                }
                else if (leftData.object.property) { // Self List, Because of Left Variable
                }
            }
            else if (leftData.object) { // List
                if (!this.util.isGlobalListExisted(leftData.object.name)) {
                    var keyword = leftData.object.name;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_LIST);
                }
            }
        }
        else { // In Case of Variable
            if (leftData.object) {
                if (leftData.object.name != "self") {
                    var name = leftData.object.name
                    if (!this.util.isGlobalListExisted(name)) {
                        var keyword = name;
                        Entry.TextCodingError.error(
                            Entry.TextCodingError.TITLE_CONVERTING,
                            Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                            keyword,
                            this._blockCount,
                            Entry.TextCodingError.SUBJECT_CONV_LIST);
                    }
                }
                else if (leftData.property) { //Because of Left Variable
                }
            }
        }

        if (right.type == "Identifier" || right.type == "MemberExpression") {
            if (rightData && rightData.property && rightData.property.callee == "__pythonRuntime.ops.subscriptIndex") { // In Case of List
                if (rightData.object && rightData.object.object) {
                    if (rightData.object.object.name != "self") { // Not Self List
                        var name = rightData.object.object.name;
                        if (!this.util.isGlobalListExisted(name)) {
                            var keyword = rightData.object.property.name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                        }
                    }
                    else if (rightData.object.property) { // Self List
                        if (this.util.isLocalListExisted(rightData.object.property.name, this._currentObject)) {}
                        else if (this.util.isLocalVariableExisted(rightData.object.property.name, this._currentObject)) {}
                        else {
                            if (!this.util.isLocalListExisted(rightData.object.property.name, this._currentObject)) {
                                var keyword = rightData.object.property.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                            }
                            if (!this.util.isLocalVariableExisted(rightData.object.property.name, this._currentObject)) {
                                var keyword = rightData.object.property.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                            }
                        }
                    }
                }
                else if (rightData.object) { // List
                    if (this.util.isGlobalListExisted(rightData.object.name)) {}
                    else if (this.util.isGlobalVariableExisted(rightData.object.name)) {}
                    else {
                        if (!this.util.isGlobalListExisted(rightData.object.name)) {
                            var keyword = rightData.object.name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                        }
                        if (!this.util.isGlobalVariableExisted(rightData.object.name)) {
                            var keyword = rightData.object.name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                        }
                    }
                }
            }
            else { // In Case of Variable
                if (rightData.object) {
                    if (rightData.object.name != "self") {
                        var keyword = rightData.object.name;
                        Entry.TextCodingError.error(
                            Entry.TextCodingError.TITLE_CONVERTING,
                            Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                            keyword,
                            this._blockCount,
                            Entry.TextCodingError.SUBJECT_CONV_LIST);
                    }
                    else if (rightData.property) {
                        if (this.util.isLocalVariableExisted(rightData.property.name, this._currentObject)) {}
                        else if (this.util.isLocalListExisted(rightData.property.name, this._currentObject)) {}
                        else {
                            if (!this.util.isLocalVariableExisted(rightData.property.name, this._currentObject)) {
                                var keyword = rightData.object.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                            }
                            if (!this.util.isLocalListExisted(rightData.property.name, this._currentObject)) {
                                var keyword = rightData.object.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                            }
                        }
                    }
                }
                else {
                    if (this.util.isGlobalVariableExisted(rightData.name)) {}
                    if (this.util.isGlobalVariableExisted(rightData.name)) {}
                    else {
                        if (!this.util.isGlobalVariableExisted(rightData.name)) {
                            var keyword = rightData.name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                        }
                        if (!this.util.isGlobalListExisted(rightData.name)) {
                            var keyword = rightData.name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_LIST);
                        }
                    }
                }
            }
        }


        var block = Entry.block[type];
        var paramsMeta = block.params;
        var paramsDefMeta = block.def.params;

        if (syntax == String("%1\[%2\] = %3")) {
            /*var block = Entry.block[type];
            var paramsMeta = block.params;
            var paramsDefMeta = block.def.params;*/

            if (!leftData || !leftData.params) {
                var keyword;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
            }

            var listName = leftData.params[1];


            params.push(listName);
            if (leftData && leftData.property) {
                var param = leftData.property.arguments[0];

                params.push(param);
                param = leftData.property.arguments[1];


                if (param.type == "number" || param.type == "text") {
                    params.push(param);
                }
                else if (param.type == "get_variable") {
                    var indexBlock = {};
                    var type = "calc_basic";
                    indexBlock.type = type;
                    var indexParams = [];
                    indexParams[0] = param;
                    indexParams[1] = "PLUS";
                    indexParams[2] = {type: "number", params: [1]};
                    indexBlock.params = indexParams;
                    params.push(indexBlock);
                }
                else if (param.type == "calc_basic") {
                    if (param.params[1] == "MINUS" && param.params[2].params[0] == "1") {
                        params.push(param.params[0]);
                    }
                    else {
                        var indexBlock = {};
                        var type = "calc_basic";
                        indexBlock.type = type;
                        var indexParams = [];
                        indexParams[0] = param;
                        indexParams[1] = "PLUS";
                        indexParams[2] = {type: "number", params: [1]};
                        indexBlock.params = indexParams;
                        params.push(indexBlock);
                    }
                }
                else {
                    var indexBlock = {};
                    var type = "calc_basic";
                    indexBlock.type = type;
                    var indexParams = [];
                    indexParams[0] = param;
                    indexParams[1] = "PLUS";
                    indexParams[2] = {type: "number", params: [1]};
                    indexBlock.params = indexParams;
                    params.push(indexBlock);
                }
            }

            if (rightData)
                params.push(rightData);

            if (params.length == 4) {
                params.splice(1,1);
            }

            structure.params = params;

        }
        else if (syntax == String("%1 = %2")) {
            if (leftData && leftData.object && leftData.property) {
                /*var block = Entry.block[type];
                var paramsMeta = block.params;
                var paramsDefMeta = block.def.params;*/


                if (leftData.object.name == "self") {
                    if (calleeName == "__pythonRuntime.objects.list") {
                        var name = leftData.property.name;

                        var array = [];
                        var arguments = rightData.arguments;
                        for(var a in arguments) {
                            var argument = arguments[a];
                            var item = {};
                            if (Entry.Utils.isNumber(argument.params[0]))
                                argument.params[0] = parseFloat(argument.params[0]);
                            item.data = String(argument.params[0]);
                            array.push(item);
                        }

                        if (this.util.isLocalListExisted(name, this._currentObject)) {
                            if (!this._funcLoop)
                                this.util.updateLocalList(name, array, this._currentObject);
                        }
                        else {
                            if (!this._funcLoop) {
                                this.util.createLocalList(name, array, this._currentObject);
                            }
                        }
                    }
                    else {
                        var name = leftData.property.name;
                        if (rightData.type == "number" || rightData.type == "text")
                            var value = rightData.params[0];
                        else
                            var value = 0;
                        /*else
                            var value = 0;*/
                        /*if (typeof value != "string" && typeof value != "number") {
                            value = 0;
                        }*/

                        if (Entry.Utils.isNumber(value))
                            value = parseFloat(value);

                        if (value || value == 0) {
                            if (this.util.isLocalVariableExisted(name, this._currentObject)) {
                                if (!this._funcLoop)
                                    this.util.updateLocalVariable(name, value, this._currentObject);
                            }
                            else {
                                if (!this._funcLoop) {
                                    this.util.createLocalVariable(name, value, this._currentObject);
                                }
                                else {
                                    value = 0;
                                    this.util.createLocalVariable(name, value, this._currentObject);
                                }
                            }
                        }

                        name = this.ParamDropdownDynamic(name, paramsMeta[0], paramsDefMeta[0]);
                        params.push(name);
                        params.push(rightData);
                    }
                }
            }
            else {
                /*var block = Entry.block[type];
                var paramsMeta = block.params;
                var paramsDefMeta = block.def.params;*/

                if (calleeName == "__pythonRuntime.objects.list") {
                    var name = leftData.name;

                    var array = [];
                    var arguments = rightData.arguments;
                    for(var a in arguments) {
                        var argument = arguments[a];
                        var item = {};
                        item.data = String(argument.params[0]);
                        array.push(item);
                    }

                    if (this.util.isGlobalListExisted(name)) {
                        if (!this._funcLoop)
                            this.util.updateGlobalList(name, array);
                    }
                    else {
                        if (!this._funcLoop) {
                            this.util.createGlobalList(name, array);
                        }
                    }
                }
                else {
                    var name = leftData.name;
                    if (rightData.type == "number" || rightData.type == "text")
                        var value = rightData.params[0];
                    else
                        var value = 0;
                    /*else
                        var value = 0;*/
                    /*if (typeof value != "string" && typeof value != "number") {
                        value = 0;
                    }*/

                    if (value || value == 0) {

                        if (this.util.isGlobalVariableExisted(name)) {
                            if (!this._funcLoop)
                                this.util.updateGlobalVariable(name, value);
                        }
                        else {
                            if (!this._funcLoop) {
                                this.util.createGlobalVariable(name, value);
                            }
                            else {
                                value = 0;
                                this.util.createGlobalVariable(name, value);
                            }
                        }
                    }

                    name = this.ParamDropdownDynamic(name, paramsMeta[0], paramsDefMeta[0]);
                    params.push(name);
                    if (rightData.callee)
                        delete rightData.callee;
                    params.push(rightData);
                }
            }

        }
        else if (syntax == String("%1 += %2")) {
            if (leftData && leftData.object && leftData.property) {
                if (leftData.object.name == "self") {
                    /*var block = Entry.block[type];
                    var paramsMeta = block.params;
                    var paramsDefMeta = block.def.params;*/

                    var name = leftData.property.name;

                    if (!this.util.isLocalVariableExisted(name, this._currentObject))
                        return result;

                    name = this.ParamDropdownDynamic(name, paramsMeta[0], paramsDefMeta[0]);
                    params.push(name);


                    if (operator == "=") {
                        if (rightData.operator == "PLUS") { //possible
                            if (rightData.type == "combine_something")
                                params.push(rightData.params[3]);
                            else
                                params.push(rightData.params[2]);
                        }
                        else if (rightData.operator == "MINUS") { //posiible
                            if (rightData.type == "calc_basic" && (rightData.params[2].type == "text" || rightData.params[2].type == "number")) {
                                rightData.params[2].params[0] = -rightData.params[2].params[0];
                                params.push(rightData.params[2]);
                            }
                            else {
                                var structure = {};

                                structure.type = "set_variable";
                                structure.params = [];
                                structure.params.push(leftData.params[0]);
                                structure.params.push(rightData);

                                result = structure;


                                return result;
                            }
                        }
                        else if (rightData.operator == "MULTI") {
                            var structure = {};

                            structure.type = "set_variable";
                            structure.params = [];
                            structure.params.push(leftData.params[0]);
                            structure.params.push(rightData);

                            result = structure;


                            return result;
                        }
                        else if (rightData.operator == "DIVIDE") {
                            var structure = {};

                            structure.type = "set_variable";
                            structure.params = [];
                            structure.params.push(leftData.params[0]);
                            structure.params.push(rightData);

                            result = structure;


                            return result;
                        }
                        else {
                            params.push(rightData);
                        }
                    }
                    else if (operator == "+=") { //possible
                        params.push(rightData);
                    }
                    else if (operator == "-=") { //possible
                        if (rightData.type == "text" || rightData.type == "number") {
                            rightData.params[0] = -rightData.params[0];
                            params.push(rightData);
                        }
                        else {
                            var structure = {};

                            structure.type = "set_variable";
                            structure.params = [];
                            structure.params.push(leftData.params[0]);

                            var paramBlock = {};
                            paramBlock.type = "calc_basic";
                            paramBlock.params = [];
                            paramBlock.params.push(leftData);
                            paramBlock.params.push("MINUS");
                            paramBlock.params.push(rightData);

                            structure.params.push(paramBlock);

                            result = structure;


                            return result;
                        }
                    }
                    else if (operator == "*=") {
                        var structure = {};

                        structure.type = "set_variable";
                        structure.params = [];
                        structure.params.push(leftData.params[0]);
                        structure.params.push(rightData);

                        result = structure;


                        return result;
                    }
                    else if (operator == "/=") {
                        var structure = {};

                        var structure = {};

                        structure.type = "set_variable";
                        structure.params = [];
                        structure.params.push(leftData.params[0]);

                        var paramBlock = {};
                        paramBlock.type = "calc_basic";
                        paramBlock.params = [];
                        paramBlock.params.push(leftData);
                        paramBlock.params.push("DIVIDE");
                        paramBlock.params.push(rightData);

                        structure.params.push(paramBlock);

                        result = structure;


                        return result;
                    }
                    else {
                        params.push(rightData);
                    }
                }
            }
            else {
                /*var block = Entry.block[type];
                var paramsMeta = block.params;
                var paramsDefMeta = block.def.params;*/

                var name = leftData.name;

                if (!this.util.isGlobalVariableExisted(name))
                    return result;

                name = this.ParamDropdownDynamic(name, paramsMeta[0], paramsDefMeta[0]);
                params.push(name);

                if (operator == "=") {
                    if (rightData.operator == "PLUS") { //possible
                        if (rightData.type == "combine_something")
                            params.push(rightData.params[3]);
                        else
                            params.push(rightData.params[2]);
                    }
                    else if (rightData.operator == "MINUS") { //posiible
                        if (rightData.type == "calc_basic" && (rightData.params[2].type == "text" || rightData.params[2].type == "number")) {
                            rightData.params[2].params[0] = -rightData.params[2].params[0];
                            params.push(rightData.params[2]);
                        }
                        else {
                            var structure = {};

                            structure.type = "set_variable";
                            structure.params = [];
                            structure.params.push(leftData.params[0]);
                            structure.params.push(rightData);

                            result = structure;


                            return result;
                        }
                    }
                    else if (rightData.operator == "MULTI") {
                        var structure = {};

                        structure.type = "set_variable";
                        structure.params = [];
                        structure.params.push(leftData.params[0]);
                        structure.params.push(rightData);

                        result = structure;


                        return result;
                    }
                    else if (rightData.operator == "DIVIDE") {
                        var structure = {};

                        structure.type = "set_variable";
                        structure.params = [];
                        structure.params.push(leftData.params[0]);
                        structure.params.push(rightData);

                        result = structure;


                        return result;
                    }
                    else {
                        params.push(rightData);
                    }
                }
                else if (operator == "+=") { //possible
                    params.push(rightData);
                }
                else if (operator == "-=") { //possible
                    if (rightData.type == "text" || rightData.type == "number") {
                        rightData.params[0] = -rightData.params[0];
                        params.push(rightData);
                    }
                    else {
                        var structure = {};

                        structure.type = "set_variable";
                        structure.params = [];
                        structure.params.push(leftData.params[0]);

                        var paramBlock = {};
                        paramBlock.type = "calc_basic";
                        paramBlock.params = [];
                        paramBlock.params.push(leftData);
                        paramBlock.params.push("MINUS");
                        paramBlock.params.push(rightData);

                        structure.params.push(paramBlock);

                        result = structure;


                        return result;
                    }
                }
                else if (operator == "*=") {
                    var structure = {};

                    structure.type = "set_variable";
                    structure.params = [];
                    structure.params.push(leftData.params[0]);
                    structure.params.push(rightData);

                    result = structure;


                    return result;
                }
                else if (operator == "/=") {
                    var structure = {};

                    var structure = {};

                    structure.type = "set_variable";
                    structure.params = [];
                    structure.params.push(leftData.params[0]);

                    var paramBlock = {};
                    paramBlock.type = "calc_basic";
                    paramBlock.params = [];
                    paramBlock.params.push(leftData);
                    paramBlock.params.push("DIVIDE");
                    paramBlock.params.push(rightData);

                    structure.params.push(paramBlock);

                    result = structure;


                    return result;
                }
                else {
                    params.push(rightData);
                }
            }
        }

        structure.params = params;
        result.type = structure.type;
        result.params = structure.params;


        return result;
    };

    p.Literal = function(component, paramMeta, paramDefMeta, textParam) {
        var result;

        var value = component.value;
        var rawValue = component.raw;

        if (rawValue && Entry.isFloat(rawValue)) {
            if (Number(value) < 0) {
                value = '-' + rawValue;
            } else value = component.raw;
        }

        if (value && typeof value === 'string')
            value = value.replace(/\t/gm, '    ');


        if (!paramMeta) {
            paramMeta = { type: "Block" };
            if (!paramDefMeta) {
                if (typeof value == "number")
                    var paramDefMeta = { type: "number" };
                else
                    var paramDefMeta = { type: "text" };
            }
        }

        if (paramMeta.type == "Indicator") {
            var param = null;
            result = param;
            return result;
        } else if (paramMeta.type == "Text") {
            var param = "";
            result = param;
            return result;
        }

        if (value == true || value == false || value) {
            var params = this['Param'+paramMeta.type](value, paramMeta, paramDefMeta, textParam);
            result = params;
        } else if (component.left && component.operator && component.right) {//If 'Literal' doesn't have value
            var params = [];
            var leftParam = this[component.left.type](component.left);
            params.push(leftParam);
            var operatorParam = component.operator;
            params.push(operatorParam);
            var rightParam = this[component.right.type](component.right);
            params.push(rightParam);

            result = params;
        }

        return result;
    };


    p.ParamBlock = function(value, paramMeta, paramDefMeta) {


        var result;
        var structure = {};

        var type;
        var param = value;
        var params = [];

        if (value === true) {
            structure.type = "True";
            result = structure;
            return result;
        }
        else if (value === false) {
            structure.type = "False";
            result = structure;
            return result;
        }

        if (paramDefMeta)
            paramDefMetaType = paramDefMeta.type;
        else
            paramDefMetaType = "text"; //default

        var paramBlock = Entry.block[paramDefMetaType];
        var paramsMeta = paramBlock.params;
        var paramsDefMeta = paramBlock.def.params;
        var targetSyntax = this.searchSyntax(paramBlock);
        var textParams = targetSyntax.textParams;

        if (paramsMeta && paramsMeta.length != 0) {
            for(var i in paramsMeta) {
                if (textParams && textParams[i])
                    param = this['Param'+paramsMeta[i].type](value, paramsMeta[i], paramsDefMeta[i], textParams[i]);
                else
                    param = this['Param'+paramsMeta[i].type](value, paramsMeta[i], paramsDefMeta[i]);
            }
        } else {
            param = value;
        }

        params.push(param);

        structure.type = paramDefMetaType;
        structure.params = params;

        result = structure;

        return result;

    };

    p.ParamAngle = function (value, paramMeta, paramDefMeta) {
        var result;
        var reg = /None/;
        if (reg.test(value)) return "None";

        result = value;

        return result;
    };

    p.ParamTextInput = function(value, paramMeta, paramDefMeta) {
        /*if (!Entry.Utils.isNumber(value))
            value = value.replace(/\t/gm, '    ');*/

        var result = value;
        var reg = /None/;
        if (reg.test(value)) return "None";


        return result;
    };

    p.ParamColor = function(value, paramMeta, paramDefMeta, textParam) {
        var result;
        var reg = /None/;
        if (reg.test(value)) return "None";

        if (textParam && textParam.codeMap) {
            var codeMap = textParam.codeMap;
            var map = eval(codeMap);
            value = value.toLowerCase();
            result = map[value];
        }

        if (!result)
            result = value;


        return result;
    };

    p.ParamDropdown = function(value, paramMeta, paramDefMeta, textParam) {
        var result;
        var reg = /None/;
        if (reg.test(value)) return "None";

        var options = paramMeta.options;
        for(var j in options) {
            var option = options[j];
            if (value == option[1]) {
                value = option[1];
                break;
            }
        }

        if (Entry.Utils.isNumber(value))
            return value;

        if (textParam && textParam.codeMap) {
            var codeMap = textParam.codeMap;
            if (codeMap && eval(codeMap)) {
                if (typeof value === 'string')
                    value = value.toLowerCase();
                var codeMapValue =  eval(codeMap)[value];
            }
            if (codeMapValue) value = codeMapValue;
        }

        if (textParam && textParam.paramType == "operator")
            value = value.toUpperCase();

        result = value;


        return result;
    };

    p.ParamDropdownDynamic = function(value, paramMeta, paramDefMeta, textParam, currentObject) {
        var result = value;

        if (textParam)
            value = this.util.getDynamicIdByNumber(value, textParam, this._currentObject);

        if (value && isNaN(value) && value.split(".").length > 2 && value.split(".")[0] == "self") {
            value = value.split(".")[1];
            currentObject = this._currentObject;
        }

        value = this.util.dropdownDynamicNameToIdConvertor(value, paramMeta.menuName, currentObject);

        if (textParam && textParam.codeMap) {
            var codeMap = textParam.codeMap;
            if (codeMap && eval(codeMap))
                if (isNaN(value))
                    value = value.toLowerCase();
                var codeMapValue =  eval(codeMap)[value];
            if (codeMapValue) value = codeMapValue;
        }
        result = value;


        return result;
    };

    p.ParamKeyboard = function(value, paramMeta, paramDefMeta) {
        var result = value;
        var reg = /None/;
        if (reg.test(value)) return "None";

        if (isNaN(value)) {
            var keyChar = Entry.KeyboardCode.map[value.toLowerCase()];
            if (keyChar) result = keyChar.toString();
        }
        else {
            var keyChar = Entry.KeyboardCode.map[value];
            if (keyChar) result = keyChar.toString();
        }

        return result;
    };

    p.Indicator = function(blockParam, blockDefParam, arg) {
        var result;

        return result;
    };

    p.MemberExpression = function(component) {
        var result = {};
        var structure = {};

        var object = component.object;
        var property = component.property;

        var objectData = this[object.type](object);
        result.object = objectData;

        var propertyData = this[property.type](property);
        result.property = propertyData;


        if (propertyData.name == "call" && propertyData.userCode == false) {
            return result;
        }
        else {
            if (propertyData.callee == "__pythonRuntime.ops.subscriptIndex") { // List
                if (objectData.object) {
                    if (objectData.object.name == "self") {
                        var name = objectData.property.name;
                        if (objectData.type && (objectData.type == "number" || objectData.type == "text" || objectData.type == "value_of_index_from_list")) {
                            var syntax = String("%2\[%4\]#char_at");
                        }
                        else {
                            if (this.util.isLocalListExisted(name, this._currentObject))
                                var syntax = String("%2\[%4\]");
                            if (this.util.isLocalVariableExisted(name, this._currentObject))
                                var syntax = String("%2\[%4\]#char_at");
                            if (this.isFuncParam(name))
                                var syntax = String("%2\[%4\]#char_at");
                            if (!this.util.isLocalListExisted(name, this._currentObject) &&
                                !this.util.isLocalVariableExisted(name, this._currentObject) &&
                                !this.isFuncParam(name))
                                return result;
                        }
                    }
                    else {
                        var name = objectData.object.name;
                        if (objectData.type && (objectData.type == "number" || objectData.type == "text" || objectData.type == "get_canvas_input_value" || objectData.type == "value_of_index_from_list")) {
                            var syntax = String("%2\[%4\]#char_at");
                        }
                        else {
                            if (this.util.isGlobalListExisted(name))
                                var syntax = String("%2\[%4\]");
                            if (this.util.isGlobalVariableExisted(name))
                                var syntax = String("%2\[%4\]#char_at");
                            if (this.isFuncParam(name))
                                var syntax = String("%2\[%4\]#char_at");
                            if (!this.util.isGlobalListExisted(name) &&
                                !this.util.isGlobalVariableExisted(name) &&
                                !this.isFuncParam(name)) {
                                result.type = propertyData.type;
                                result.params = propertyData.params;
                                return result;
                            }
                        }
                    }
                }
                else {
                    var name = objectData.name;
                    if (objectData.type && (objectData.type == "number" || objectData.type == "text" || objectData.type == "get_canvas_input_value" || objectData.type == "value_of_index_from_list")) {
                        var syntax = String("%2\[%4\]#char_at");
                    }
                    else {
                        if (this.util.isGlobalListExisted(name))
                            var syntax = String("%2\[%4\]");
                        if (this.util.isGlobalVariableExisted(name))
                            var syntax = String("%2\[%4\]#char_at");
                        if (this.isFuncParam(name))
                            var syntax = String("%2\[%4\]#char_at");
                        if (!this.util.isGlobalListExisted(name) &&
                            !this.util.isGlobalVariableExisted(name) &&
                            !this.isFuncParam(name)) {
                            result.type = propertyData.type;
                            result.params = propertyData.params;
                            return result;
                        }
                    }
                }


                if (!syntax) return;

                var arguments = propertyData.arguments;

                //var syntax = String("%2\[%4\]");
                var blockSyntax = this.getBlockSyntax(syntax);
                var type;
                if (blockSyntax)
                    type = blockSyntax.key;

                structure.type = type;

                var block = Entry.block[type];
                var paramsMeta = block.params;
                var paramsDefMeta = block.def.params;

                if (objectData.object && objectData.object.name == "self")
                    var listName = this.ParamDropdownDynamic(name, paramsMeta[1], paramsDefMeta[1], null, this._currentObject);
                else
                    var listName = this.ParamDropdownDynamic(name, paramsMeta[1], paramsDefMeta[1]);


                var params = [];

                if (syntax == String("%2\[%4\]")) {
                    params[1] = listName;
                }
                else if (syntax == String("%2\[%4\]#char_at")) {
                    if (objectData.object && objectData.object.name == "self") {
                        params[1] = objectData.property;
                    }
                    else {
                        params[1] = objectData;
                    }
                }
                if (arguments && arguments[1]) {
                    if (arguments[1].type) {
                        if (arguments[1].type == "number" || arguments[1].type == "text") {
                            /*if (Entry.Utils.isNumber(arguments[1].params[0]))
                                arguments[1].params[0] += 1;*/
                            params[3] = arguments[1];
                        }
                        else if (arguments[1].type == "get_variable") {
                            var indexBlock = {};
                            var type = "calc_basic";
                            indexBlock.type = type;
                            var indexParams = [];
                            indexParams[0] = arguments[1];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[3] = indexBlock;
                        }
                        else if (arguments[1].type == "calc_basic") {
                            if (arguments[1].params && arguments[1].params[1] == "MINUS" && arguments[1].params[2] &&
                                arguments[1].params[2].params && arguments[1].params[2].params[0] == "1") {
                                params[3] = arguments[1].params[0];
                            }
                            else {
                                var indexBlock = {};
                                var type = "calc_basic";
                                indexBlock.type = type;
                                var indexParams = [];
                                indexParams[0] = arguments[1];
                                indexParams[1] = "PLUS";
                                indexParams[2] = {type: "number", params: [1]};
                                indexBlock.params = indexParams;
                                params[3] = indexBlock;
                            }
                        }
                        else {
                            var indexBlock = {};
                            var type = "calc_basic";
                            indexBlock.type = type;
                            var indexParams = [];
                            indexParams[0] = arguments[1];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[3] = indexBlock;
                        }
                    }
                    else {
                        if (!this.isFuncParam(arguments[1].name)) {
                            var keyword;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
                        } else {
                            var indexBlock = {};
                            var type = "calc_basic";
                            indexBlock.type = type;
                            var indexParams = [];
                            indexParams[0] = arguments[1];
                            indexParams[1] = "PLUS";
                            indexParams[2] = {type: "number", params: [1]};
                            indexBlock.params = indexParams;
                            params[3] = indexBlock;
                        }
                    }
                }

                structure.params = params;

                result.type = structure.type;
                result.params = structure.params;


            }
            else {
                var param;
                var params = [];

                if (objectData.name == "self") {
                    var syntax = String("%1#get_variable");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    var type;
                    if (blockSyntax)
                        type = blockSyntax.key;

                    structure.type = type;

                    var block = Entry.block[type];
                    var paramsMeta = block.params;
                    var paramsDefMeta = block.def.params;

                    var name = propertyData.name;

                    if (!this.util.isLocalVariableExisted(name, this._currentObject))
                        return result;

                    var convertedName = this.ParamDropdownDynamic(name, paramsMeta[0], paramsDefMeta[0], null, this._currentObject);

                    params.push(convertedName);

                    result.type = structure.type;

                    if (params.length != 0) {
                        structure.params = params;
                        result.params = structure.params;
                        result.variableType = "local";
                    }
                }
                else {
                    return result;
                }
            }
        }


        return result;
    };

    p.WhileStatement = function(component) {
        this._blockCount++;

        var result;
        var structure = {};
        structure.statements = [];

        var test = component.test;
        var whileType = "basic";

        var condBody = component.body;

        if (test.type) {
            if (test.type == "Literal") {
                if (test.value === true) {
                    var syntax = String("while True:\n$1");
                    var blockSyntax = this.getBlockSyntax(syntax);
                    var type;
                    if (blockSyntax)
                        type = blockSyntax.key;
                }
                else {
                    var keyword = test.value;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);

                }
            }
            else if (test.type == "Identifier") {
                var syntax = String("while %1 %2\n$1");
                var blockSyntax = this.getBlockSyntax(syntax);
                var type;
                if (blockSyntax)
                    type = blockSyntax.key;

                if (!this.isFuncParam(test.name)) {
                    var keyword = test.name;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);

                }
            }
            else {
                var syntax = String("while %1 %2:\n$1");
                var blockSyntax = this.getBlockSyntax(syntax);
                var type;
                if (blockSyntax)
                    type = blockSyntax.key;
            }
        }


        if (!type) {
            var keyword;
            Entry.TextCodingError.error(
                Entry.TextCodingError.TITLE_CONVERTING,
                Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                keyword,
                this._blockCount,
                Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        }

        var paramsMeta = Entry.block[type].params;

        var params = [];
        if (test.type == "Literal") {
            var arguments = [];
            arguments.push(test);
            var paramsMeta = Entry.block[type].params;
            var paramsDefMeta = Entry.block[type].def.params;

            for(var p in paramsMeta) {
                var paramType = paramsMeta[p].type;
                if (paramType == "Indicator") {
                    var pendingArg = {raw: null, type: "Literal", value: null};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
                else if (paramType == "Text") {
                    var pendingArg = {raw: "", type: "Literal", value: ""};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
            }


            for(var i in arguments) {
                var argument = arguments[i];

                var param = this[argument.type](argument, paramsMeta[i], paramsDefMeta[i], true);
                if (param && param != null)
                    params.push(param);
            }
        } else {
            var param = this[test.type](test);
            if (param && param != null) {
                if (test.type == "UnaryExpression" && test.operator == "!") {
                    if (param.type == "boolean_not") {
                        param = param.params[1];
                        params.push(param);
                        var option = "until";
                        params.push(option);
                    }
                }
                else {
                    params.push(param);
                    var option = "while";
                    params.push(option);
                }
            }
        }

        var statements = [];
        var body = component.body;
        var bodyData = this[body.type](body);


        structure.type = type;


        structure.statements.push(bodyData.data);
        structure.params = params;

        result = structure;
        return result;
    };

    p.BlockStatement = function(component) {

        var result = {};
        result.statements = [];
        result.data = [];

        var params = [];
        var statements = [];
        var data = [];

        var bodies = component.body;

        if (bodies[1] && bodies[1].consequent && bodies[1].consequent.body && bodies[1].consequent.body[0])
            if (bodies[1].consequent.body[0].type == "ForStatement") {
                this._blockCount++;
            }

        for(var i in bodies) {
            var body = bodies[i];
            var bodyData = this[body.type](body);

            if (bodyData && bodyData == null)
                continue;
            /*if (i == 1) {
                this._forStatementCount--; //The End of ForStatement
            }*/

            data.push(bodyData);
        }


        result.data = data;


        //The Optimized Code
        for(var d in data) {
            if (data[1] && data[1].type == "repeat_basic") {
                if (d == 0 && data[d]) {
                    if (data[d].declarations) {
                        var declarations = data[0].declarations;
                        for(var d in declarations){
                            var declaration = declarations[d];
                            var param = declaration.init;
                            if (param) {
                                params.push(param);
                            }
                        }
                        result.params = params;
                    }
                }
                else if (d == 1) {
                    result.type = data[d].type;
                    var statements = [];
                    var allStatements = data[d].statements[0]; //Consequent Data of "IF" Statement
                    if (allStatements && allStatements.length != 0) {
                        for(var i in allStatements) {
                            var statement = allStatements[i];
                            if (!statement)
                                continue;

                            if (statement.type) {
                                if (this.util.isJudgementBlock(statement.type)) {
                                    continue;
                                }
                                else if (this.util.isCalculationBlock(statement.type)) {
                                    continue;
                                }
                                else if (this.util.isMaterialBlock(statement.type)) {
                                    continue;
                                }
                                statements.push(statement);
                            } else {
                                if (statement.callee) {
                                    var keyword = statement.callee.name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                                }
                                else {
                                    var keyword;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                                }
                            }
                        }
                    }


                    result.statements.push(statements);
                }
            }
            else {
                if (data) {
                    if (d == 0) {
                        if (data[d] && data[d].declarations) {
                            var declarations = data[d].declarations;
                            for(var d in declarations){
                                var declaration = declarations[d];
                                var param = declaration.init;
                                if (param) {
                                    params.push(param);
                                }
                            }
                        } else {
                            var statement = data[d];
                            if (statement && statement.type) {
                                if (this.util.isJudgementBlock(statement.type)) {
                                    continue;
                                }
                                else if (this.util.isCalculationBlock(statement.type)) {
                                    continue;
                                }
                                else if (this.util.isMaterialBlock(statement.type)) {
                                    continue;
                                }
                                statements.push(statement);
                            }
                        }
                    }
                    else {
                        var statements = [];
                        var allStatements = data;
                        if (allStatements && allStatements.length != 0) {
                            for(i in allStatements) {
                                var statement = allStatements[i];
                                if (statement && statement.type){
                                    if (this.util.isJudgementBlock(statement.type)) {
                                        continue;
                                    }
                                    else if (this.util.isCalculationBlock(statement.type)) {
                                        continue;
                                    }
                                    else if (this.util.isMaterialBlock(statement.type)) {
                                        continue;
                                    }
                                    statements.push(statement);
                                }
                            }
                        }

                    }
                    result.params = params;
                    result.statements = statements;
                }
            }
        }

        //////////////////////////////////////////////////////////////////////
        //Second Backup Code
        //////////////////////////////////////////////////////////////////////
        /*if (data[0] && data[0].declarations && data[1]) {
            result.type = data[1].type;
            var declarations = data[0].declarations;
            for(var d in declarations){
                var declaration = declarations[d];
                var param = declaration.init;
                if (param)
                    params.push(param);
            }
            result.params = params;
            var statements = []
            var allStatements = data[1].statements[0];
            if (allStatements && allStatements.length != 0) {
                for(var i in allStatements) {
                    var statement = allStatements[i];
                    if (statement.type)
                        statements.push(statement);
                }
            }
            result.statements.push(statements);

        }*/



        return result;


    };

    p.IfStatement = function(component) {
        var result;
        var structure = {};
        structure.statements = [];

        var type;
        var params = [];

        var consequent = component.consequent;
        var alternate = component.alternate;
        var test = component.test;

        if (test.operator !== 'instanceof') {
            this._blockCount++;
        }

        if (alternate != null) {
            var type = String("if_else");
        } else {
            var type = String("_if");
        }

        structure.type = type;



        if (test.type == "Literal" || test.type == "Identifier") {
            var arguments = [];
            arguments.push(test);
            var paramsMeta = Entry.block[type].params;
            var paramsDefMeta = Entry.block[type].def.params;

            for(var p in paramsMeta) {
                var paramType = paramsMeta[p].type;
                if (paramType == "Indicator") {
                    var pendingArg = {raw: null, type: "Literal", value: null};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
                else if (paramType == "Text") {
                    var pendingArg = {raw: "", type: "Literal", value: ""};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
            }

            for(var i in arguments) {
                var argument = arguments[i];

                var param = this[argument.type](argument, paramsMeta[i], paramsDefMeta[i], true);
                if (param && param != null) {
                    params.push(param);
                    if (!param.type) {
                        if (!this.isFuncParam(param.name)) {
                            var keyword = param.name;
                            Entry.TextCodingError.error(
                                Entry.TextCodingError.TITLE_CONVERTING,
                                Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                                keyword,
                                this._blockCount,
                                Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                        }
                    }
                }
            }
        } else {
            var param = this[test.type](test);
            if (param && param != null)
                params.push(param);
        }

        if (params && params.length != 0) {
            structure.params = params;
        }



        if (consequent != null) {
            /*if (test.operator !== 'instanceof') {
                this._blockCount++;
            }*/

            var consStmts = [];
            var consequents = this[consequent.type](consequent);

            var consequentsData = consequents.data;
            for(var i in consequentsData) {
                var consData = consequentsData[i];
                if (consData) {
                    if (consData.init && consData.type) { //ForStatement Block
                        structure.type = consData.type; //ForStatement Type

                        var consStatements = consData.statements;
                        if (consStatements) { //ForStatement Statements
                            consStmts = consStatements;
                        }
                    }
                    else if (!consData.init && consData.type) { //IfStatement Block
                        consStmts.push(consData); //IfStatement Statements
                    }
                }
            }

            if (consStmts.length != 0)
                structure.statements[0] = consStmts;
        }

        if (alternate != null) {
            if (test.operator !== 'instanceof') {
                this._blockCount++;
            }
            var altStmts = [];
            var alternates = this[alternate.type](alternate);

            var alternatesData = alternates.data;
            for(var i in alternatesData) {
                var altData = alternatesData[i];
                if (altData && altData.type) {
                    altStmts.push(altData);
                }
            }
            if (altStmts.length != 0)
                structure.statements[1] = altStmts;
        }

        result = structure;
        return result;
    };

     p.ForStatement = function(component) {
        var result;
        var structure = {};
        structure.statements = [];

        var syntax = String("for i in range");
        var blockSyntax = this.getBlockSyntax(syntax);
        var type;
        if (blockSyntax)
            type = blockSyntax.key;

        structure.type = type;

        var init = component.init;

        if (init)
            var initData = this[init.type](init);
        structure.init = initData;


        var bodies = component.body.body;
        if (bodies) {
            for(var i in bodies) {
                if (i != 0) { // "i == 0" is conditional statement of "For" Statement
                    var bodyData = bodies[i];
                    var stmtData = this[bodyData.type](bodyData);
                    structure.statements.push(stmtData);
                }
            }
        }


        var test = component.test;
        if (test)
            var testData = this[test.type](test);
        structure.test = testData;


        var update = component.update;
        if (update)
            var updateData = this[update.type](update);
        structure.update = updateData;


        result = structure;


        return result;
    };

    p.ForInStatement = function(component) {

        var result;
        var data = {};

        data = null;

        result = data;

        return result;
    };


    p.BreakStatement = function(component) {
        this._blockCount++;

        var result;
        var structure = {};

        var syntax = String("break");
        var blockSyntax = this.getBlockSyntax(syntax);
        var type;
        if (blockSyntax)
            type = blockSyntax.key;


        structure.type = type;
        result = structure;

        return result;
    };

    p.UnaryExpression = function(component) {
        var result;
        var data;
        var structure = {};

        if (component.prefix){
            var type;
            var syntax;
            var operator = component.operator;
            var argument = component.argument;

            switch(operator){
                case "-":
                    operator = operator;
                    break;
                case "+":
                    operator = operator;
                    break;
                case "!":
                    operator = operator;
                    type = "boolean_not";
                    break;
                case "~":
                    var keyword = operator;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                    break;
                case "typeof":
                    var keyword = operator;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                    break;
                case "void":
                    var keyword = operator;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                    break;
                case "delete":
                    var keyword = operator;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                    break;
                default:
                    operator = operator;
                    var keyword = operator;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                    break;
            }

            var params = [];
            if (operator == "+" || operator == "-") {
                if (argument.value >= 0)
                    argument.value = operator + argument.value;

                var value = this[argument.type](argument);
                data = value;
                structure.data = data;
                structure.params = data;
                result = structure.params;
            }
            else if (operator == "!") {
                if (argument.type == "Literal" || argument.type == "Identifier") {
                    var arguments = [];
                    arguments.push(argument);
                    var paramsMeta = Entry.block[type].params;
                    var paramsDefMeta = Entry.block[type].def.params;

                    for(var p in paramsMeta) {
                        var paramType = paramsMeta[p].type;
                        if (paramType == "Indicator") {
                            var pendingArg = {raw: null, type: "Literal", value: null};
                            if (p < arguments.length)
                                arguments.splice(p, 0, pendingArg);
                        }
                        else if (paramType == "Text") {
                            var pendingArg = {raw: "", type: "Literal", value: ""};
                            if (p < arguments.length)
                                arguments.splice(p, 0, pendingArg);
                        }
                    }

                    for(var i in arguments) {
                        var argument = arguments[i];

                        var param = this[argument.type](argument, paramsMeta[i], paramsDefMeta[i], true);
                        if (param && param != null) {
                            params.push(param);
                            params.splice(0, 0, "");
                            params.splice(2, 0, "");

                        }
                    }
                } else {
                    param = this[argument.type](argument);
                    if (param) {
                        params.push(param);
                        params.splice(0, 0, "");
                        params.splice(2, 0, "");
                    }
                }
                structure.type = type;
                structure.params = params;
                result = structure;
            }
        }



        return result;
    };

    p.LogicalExpression = function(component) {
        var result;
        var structure = {};

        var operator = String(component.operator);

        switch(operator){
            case '&&':
                var syntax = String("(%1 and %3)");
                break;
            case '||':
                var syntax = String("(%1 or %3)");
                break;
            default:
                var syntax = String("(%1 and %3)");
                break;
        }

        var blockSyntax = this.getBlockSyntax(syntax);
        var type;
        if (blockSyntax)
            type = blockSyntax.key;

        var params = [];
        var left = component.left;

        if (left.type == "Literal" || left.type == "Identifier") {
            var arguments = [];
            arguments.push(left);
            var paramsMeta = Entry.block[type].params;
            var paramsDefMeta = Entry.block[type].def.params;

            for(var p in paramsMeta) {
                var paramType = paramsMeta[p].type;
                if (paramType == "Indicator") {
                    var pendingArg = {raw: null, type: "Literal", value: null};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
                else if (paramType == "Text") {
                    var pendingArg = {raw: "", type: "Literal", value: ""};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
            }

            for(var i in arguments) {
                var argument = arguments[i];

                var param = this[argument.type](argument, paramsMeta[i], paramsDefMeta[i], true);
                if (param && param != null)
                    params.push(param);
            }
        } else {
            param = this[left.type](left);
            if (param)
                params.push(param);
        }

        if (!param.type && param.name) {
            if (!this.isFuncParam(param.name)) {
                var keyword = param.name;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
            }
        }

        operator = String(component.operator);
        if (operator) {
            operator = this.util.logicalExpressionConvert(operator);
            param = operator;
            params.push(param);
        }

        var right = component.right;

        if (right.type == "Literal" || right.type == "Identifier") {
            var arguments = [];
            arguments.push(right);
            var paramsMeta = Entry.block[type].params;
            var paramsDefMeta = Entry.block[type].def.params;

            for(var p in paramsMeta) {
                var paramType = paramsMeta[p].type;
                if (paramType == "Indicator") {
                    var pendingArg = {raw: null, type: "Literal", value: null};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
                else if (paramType == "Text") {
                    var pendingArg = {raw: "", type: "Literal", value: ""};
                    if (p < arguments.length)
                        arguments.splice(p, 0, pendingArg);
                }
            }

            for(var i in arguments) {
                var argument = arguments[i];

                var param = this[argument.type](argument, paramsMeta[i], paramsDefMeta[i], true);
                if (param && param != null)
                    params.push(param);
            }
        } else {
            param = this[right.type](right);
            if (param)
                params.push(param);
        }


        if (!param.type && param.name) {
            var keyword = param.name;
            Entry.TextCodingError.error(
                Entry.TextCodingError.TITLE_CONVERTING,
                Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                keyword,
                this._blockCount,
                Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        }

        structure.type = type;
        structure.params = params;

        result = structure;


        return result;
    };

    p.BinaryExpression = function(component) {

        var result = {};
        var structure = {};

        var operator = String(component.operator);

        switch(operator){
            case "==":
                var syntax = String("(%1 %2 %3)#boolean_basic_operator");
                break;
            case "!=":
                var syntax = String("not (%2)");
                break;
            case "===":
                var syntax = String("(%1 %2 %3)#boolean_basic_operator");
                break;
            case "!==":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "<":
                var syntax = String("(%1 %2 %3)#boolean_basic_operator");
                break;
            case "<=":
                var syntax = String("(%1 %2 %3)#boolean_basic_operator");
                break;
            case ">":
                var syntax = String("(%1 %2 %3)#boolean_basic_operator");
                break;
            case ">=":
                var syntax = String("(%1 %2 %3)#boolean_basic_operator");
                break;
            case "<<":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case ">>":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case ">>>":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "+":
                var syntax = String("(%1 %2 %3)#calc_basic");
                break;
            case "-":
                var syntax = String("(%1 %2 %3)#calc_basic");
                break;
            case "*":
                var syntax = String("(%1 %2 %3)#calc_basic");
                break;
            case "/":
                var syntax = String("(%1 %2 %3)#calc_basic");
                break;
            case "%":
                var syntax = String("(%2 % %4)");
                break;
                break;
            case "|":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "^":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "|":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "&":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "in":
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
            case "instanceof":
                //used in BlockStatement
                break;
            default:
                var keyword = operator;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                break;
        }


        var blockSyntax = this.getBlockSyntax(syntax);
        var type;
        if (blockSyntax)
            type = blockSyntax.key;

        if (type) {
            var params = [];
            var left = component.left;


            if (left.type == "Literal" || left.type == "Identifier") {
                var arguments = [];
                arguments.push(left);
                var paramsMeta = Entry.block[type].params;
                var paramsDefMeta = Entry.block[type].def.params;

                for(var p in paramsMeta) {
                    var paramType = paramsMeta[p].type;
                    if (paramType == "Indicator") {
                        var pendingArg = {raw: null, type: "Literal", value: null};
                        if (p < arguments.length)
                            arguments.splice(p, 0, pendingArg);
                    }
                    else if (paramType == "Text") {
                        var pendingArg = {raw: "", type: "Literal", value: ""};
                        if (p < arguments.length)
                            arguments.splice(p, 0, pendingArg);
                    }
                }

                for(var i in arguments) {
                    var argument = arguments[i];

                    var param = this[argument.type](argument, paramsMeta[i], paramsDefMeta[i], true);

                    if (param && typeof param == "object") {
                        if (param.name && param.name.indexOf("__filbert") < 0) {
                            if (!this.isFuncParam(param.name)) {
                                //if (!this.util.isEntryEventDesignatedParamName(param.name)) {
                                    if (!this.util.isGlobalVariableExisted(param.name)) {
                                        var keyword = param.name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                    }
                                //}
                            }
                        }
                    }

                    if (param)
                        params.push(param);
                    /*else {
                        if (param.name == "key") {
                            var keyBlock = {};
                            keyBlock.type = "get_variable";
                            var keyParams = [];
                            keyParams.push(param.name);
                            keyBlock.params = keyParams;

                            params.push(keyBlock);
                        }
                        else if (param.name == "signal") {
                            var keyBlock = {};
                            keyBlock.type = "get_variable";
                            var keyParams = [];
                            keyParams.push(param.name);
                            keyBlock.params = keyParams;

                            params.push(keyBlock);
                        }
                    }*/
                }
            }
            else if (left.type == "MemberExpression") {
                param = this[left.type](left);
                if (param && param.type) {
                    params.push(param);
                }
                else if (param && param.object && param.property) {
                    if (param.property.callee == "__pythonRuntime.ops.subscriptIndex") { // In Case of List
                        if (param.object && param.object.object) {
                            if (param.object.object.name != "self") { // Not Self List
                                var keyword = param.object.object.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                            }
                            else if (param.object.property) { // Self List
                                if (!this.util.isLocalListExisted(param.object.property.name, this._currentObject)) {
                                    var keyword = param.object.property.name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_LIST);
                                }
                            }
                        }
                        else if (param.object) { // List
                            if (!this.util.isGlobalListExisted(param.object.name)) {
                                if (param.object.type != "get_canvas_input_value") {  //Entry.Answer()
                                    var keyword = param.object.name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_LIST);
                                }
                            }
                        }
                    }
                    else { // In Case of Variable
                        if (param.object) {
                            if (param.object.name && param.object.name.indexOf("__filbert") < 0) {
                                if (param.object.name != "self") {
                                    var keyword = param.object.name + '.' + param.property.name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_OBJECT,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_OBJECT);
                                }
                                else if (param.property) {
                                    if (!this.util.isLocalVariableExisted(param.property.name, this._currentObject)) {
                                        var keyword = param.object.name + '.' + param.property.name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                    }
                                }
                            }
                        }
                    }

                    if (param.object.name && param.object.name.indexOf("__filbert") < 0) {
                        var paramBlock = {};
                        paramBlock.type = "text";
                        var textParams = [];
                        textParams.push(param.object.name + "." + param.property.name);
                        paramBlock.params = textParams;

                        params.push(paramBlock);
                    }
                }
            }
            else {
                param = this[left.type](left);
                if (param) {
                    params.push(param);
                }
                else {
                    var keyword;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_DEFAULT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_DEFAULT);
                }

            }

            if (type == "boolean_not") {
                params.splice(0, 0, "");
                params.splice(2, 0, "");

                structure.type = type;
                structure.params = params;

                result = structure;

                return result;
            }

            operator = String(component.operator);
            if (operator) {
                //operator = this.util.binaryOperatorConvert(operator);
                if (operator != '%') {
                    var textParam = blockSyntax.textParams[1];
                    if (textParam.converter)
                        param = textParam.converter(null, operator);
                    else
                        param = operator;
                    if (param)
                        params.push(param);
                }

                structure.operator = operator;
            }

            var right = component.right;

            if (right.type == "Literal" || right.type == "Identifier") {
                var arguments = [];
                arguments.push(right);
                var paramsMeta = Entry.block[type].params;
                var paramsDefMeta = Entry.block[type].def.params;

                for(var p in paramsMeta) {
                    var paramType = paramsMeta[p].type;
                    if (paramType == "Indicator") {
                        var pendingArg = {raw: null, type: "Literal", value: null};
                        if (p < arguments.length)
                            arguments.splice(p, 0, pendingArg);
                    }
                    else if (paramType == "Text") {
                        var pendingArg = {raw: "", type: "Literal", value: ""};
                        if (p < arguments.length)
                            arguments.splice(p, 0, pendingArg);
                    }
                }

                for(var i in arguments) {
                    var argument = arguments[i];

                    var param = this[argument.type](argument, paramsMeta[i], paramsDefMeta[i], true);
                    if (param && typeof param == "object") {
                        if (param.name && param.name.indexOf("__filbert") < 0) {
                            if (!param.type && param.isCallParam) {
                                if (!this.isFuncParam(param.name)) {
                                    if (!this.util.isGlobalVariableExisted(param.name)) {
                                        var keyword = param.name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                    }
                                }
                            }
                        }
                        params.push(param);
                    }
                }
            }
            else if (right.type == "MemberExpression") {
                param = this[right.type](right);
                if (param && param.type) {
                    params.push(param);
                }
                else if (param.object && param.property) {
                    if (param.property.callee == "__pythonRuntime.ops.subscriptIndex") { // In Case of List
                        if (param.object.object) {
                            if (param.object.object.name != "self") { // Object Name
                                var keyword = param.object.object.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_OBJECT,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_OBJECT);
                            }
                            else if (param.object.property) { // List Name
                                if (!this.util.isLocalListExisted(param.object.property.name, this._currentObject)) {
                                    var keyword = param.object.property.name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_LIST);
                                }
                            }
                        }
                        else if (param.object.name) { // List
                            var objectName = param.object.name;

                            if (!this.util.isGlobalListExisted(objectName)) {
                                var keyword = param.object.name;
                                Entry.TextCodingError.error(
                                    Entry.TextCodingError.TITLE_CONVERTING,
                                    Entry.TextCodingError.MESSAGE_CONV_NO_LIST,
                                    keyword,
                                    this._blockCount,
                                    Entry.TextCodingError.SUBJECT_CONV_LIST);
                            }
                        }
                    }
                    else { // In Case of Variable
                        if (param.object) {
                            if (param.object.name.indexOf("__filbert") < 0) {
                                if (param.object.name != "self") {
                                    var keyword = param.object.name;
                                    Entry.TextCodingError.error(
                                        Entry.TextCodingError.TITLE_CONVERTING,
                                        Entry.TextCodingError.MESSAGE_CONV_NO_OBJECT,
                                        keyword,
                                        this._blockCount,
                                        Entry.TextCodingError.SUBJECT_CONV_OBJECT);
                                }
                                else if (param.property) {
                                    if (!this.util.isLocalVariableExisted(param.property.name, this._currentObject)) {
                                        var keyword = param.object.name + '.' + param.property.name;
                                        Entry.TextCodingError.error(
                                            Entry.TextCodingError.TITLE_CONVERTING,
                                            Entry.TextCodingError.MESSAGE_CONV_NO_VARIABLE,
                                            keyword,
                                            this._blockCount,
                                            Entry.TextCodingError.SUBJECT_CONV_VARIABLE);
                                    }
                                }
                            }
                        }
                    }

                    if (param.object.name.indexOf("__filbert") < 0) {
                        var paramBlock = {};
                        paramBlock.type = "text";
                        var textParams = [];
                        textParams.push(param.object.name + "." + param.property.name);
                        paramBlock.params = textParams;

                        params.push(paramBlock);
                    }
                }
            }
            else {
                param = this[right.type](right);
                if (param) {
                    params.push(param);
                }
                else {
                    var keyword;
                    Entry.TextCodingError.error(
                        Entry.TextCodingError.TITLE_CONVERTING,
                        Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
                        keyword,
                        this._blockCount,
                        Entry.TextCodingError.SUBJECT_CONV_GENERAL);
                }
            }

           if (syntax == "(%2 % %4)") {
                tempParams = [];
                tempParams[1] = params[0];
                tempParams[3] = params[1];
                tempParams[5] = "MOD";
                params = tempParams;
            }

            structure.type = type;
            structure.params = params;
        } else {
            return result;
        }

        //result = { type: blockType, params: params };

        result = structure;

        return result;
    };



    p.UpdateExpression = function(component) {
        var result;
        var data = {};

        var argument = component.argument;
        if (argument)
            var argumentData = this[argument.type](argument);
        data.argument = argumentData;

        var operator = component.operator;
        data.operator = operator;

        var prefix = component.prefix;
        data.prefix = prefix;

        result = data;

        return result;
    };

    p.FunctionDeclaration = function(component) {
        var result = {};

        var body = component.body;
        var id = component.id;

        if (id.name.search("__getParam") != -1) {
            return result;
        }

        this._funcLoop = true;
        this._blockCount++;
        /*if (!this.util.isEntryEventFuncName(id.name)) {
        }*/



        if (id.type == "Identifier")
            var idData = this[id.type](id);

        if (idData && this.util.isEntryEventFuncName(idData.name)) {
            if (this._rootFuncKey) {
                var keyword = "def " + idData.name;
                Entry.TextCodingError.error(
                    Entry.TextCodingError.TITLE_CONVERTING,
                    Entry.TextCodingError.MESSAGE_CONV_NO_ENTRY_EVENT_FUNCTION,
                    keyword,
                    this._blockCount,
                    Entry.TextCodingError.SUBJECT_CONV_FUNCTION);
            }
        }

        var textFuncName;
        var textFuncParams = [];
        var textFuncStatements = [];

        textFuncName = idData.name;

        if (body.body && body.body.length != 1)
            var paramNumber = body.body.length - 5;
        else
            var paramNumber = 0;

        if (paramNumber || paramNumber == 0) {
            this._currentFuncKey = textFuncName + paramNumber;
            if (!this._rootFuncKey)
                this._rootFuncKey = this._currentFuncKey;
        }

        if (!this.util.isEntryEventFuncName(id.name) &&
          !this._funcMap[textFuncName]) {
            var newFuncId = Entry.generateHash();
            for(var funcId in Entry.variableContainer.functions_) {
                var blockFunc = Entry.variableContainer.functions_[funcId];
                this.util.initQueue();
                this.util.gatherFuncDefParam(blockFunc.content._data[0]._data[0].data.params[0]);
                var funcParams = [];

                paramMap = {};
                paramInfo = {};

                while(param = this.util._funcParamQ.dequeue()) {
                    funcParams.push(param);
                }
                for(var p in funcParams) {
                    var funcParam = funcParams[p];
                    paramMap[funcParam] = p;
                    paramInfo[textFuncParams[p]] = funcParam;
                }

                var funcNames = [];
                while(nameToken = this.util._funcNameQ.dequeue()) {
                    funcNames.push(nameToken);
                }
                this.util.clearQueue();

                blockFuncName = funcNames.join('__').trim();

                if (textFuncName == blockFuncName) {
                    newFuncId = blockFunc.id;
                }
            }
            this._funcMap[textFuncName] = "func_" + newFuncId;
        }

        var bodyData = this[body.type](body);
        var funcBodyData = bodyData.data;

        if (newFuncId)
            delete this._funcMap[textFuncName];


        //First Step - Declarations
        for(var i in funcBodyData) {
            if (funcBodyData[i].declarations) {
                var declarations = funcBodyData[i].declarations;
                if (declarations.length > 0) {
                    textFuncParams.push(declarations[0].name);
                }
            }
        }

        //Second Step - Satatements
        for(var i in funcBodyData) {
            if (funcBodyData[i].argument) {
                var argument = funcBodyData[i].argument;
                var statements = argument.statements;
                if (statements && statements.length > 0) {
                    var cleansedStmt = [];
                    for(var s in statements) {
                        var stmt = statements[s];
                        if (stmt) {
                            cleansedStmt.push(stmt);
                        }

                    }
                    textFuncStatements = cleansedStmt;
                }
            }
        }


        //In case of Entry Event Function
        if (this.util.isEntryEventFuncName(id.name)) {
            //var entryEventThread = [];
            if (textFuncParams.length != 0) {
                var arg = textFuncParams[0];

                arg = arg.replace(/_space_/g, " ");
                arg = arg.replace(/num/g, "");

                if (arg == "none")
                    arg = "None";
                var param = arg;
            }

            var component = this.util.makeExpressionStatementForEntryEvent(id.name, param);
            var entryEventBlock = this.ExpressionStatement(component);

            entryEventBlock.contents = [];
            for(var t in textFuncStatements) {
                var tfs = textFuncStatements[t];
                var sblock = {};
                sblock.type = tfs.type;
                if (tfs.params)
                    sblock.params = tfs.params;
                if (tfs.statements)
                    sblock.statements = tfs.statements;
                if (tfs.contents)
                    sblock.contents = tfs.contents;


                entryEventBlock.contents.push(sblock);
            }

            return entryEventBlock;
            //return entryEventThread;
        }
        //this._funcLoop = false;

        ////////////////////////////////////////////////////////////////
        //First, Find The Function Block
        ////////////////////////////////////////////////////////////////
        var foundFlag;
        var matchFlag;
        var targetFuncId;
        var paramMap = {};
        var paramInfo = {};
        var entryFunctions = Entry.variableContainer.functions_;
        for(var funcId in entryFunctions) {
            var blockFunc = entryFunctions[funcId];
            this.util.initQueue();
            this.util.gatherFuncDefParam(blockFunc.content._data[0]._data[0].data.params[0]);
            var funcParams = [];

            paramMap = {};
            paramInfo = {};

            while(param = this.util._funcParamQ.dequeue()) {
                funcParams.push(param);
            }
            for(var p in funcParams) {
                var funcParam = funcParams[p];
                paramMap[funcParam] = p;
                paramInfo[textFuncParams[p]] = funcParam;
            }

            var funcNames = [];
            while(nameToken = this.util._funcNameQ.dequeue()) {
                funcNames.push(nameToken);
            }
            this.util.clearQueue();

            blockFuncName = funcNames.join('__').trim();

            if (textFuncName == blockFuncName) {
                if (textFuncParams.length == Object.keys(paramMap).length) {
                    foundFlag = true;

                    var funcThread = blockFunc.content._data[0]; //The Function Thread, index 0
                    var blockFuncContents = funcThread._data; //The Function Definition Block, index 0
                    var blockFuncDef = blockFuncContents[0];

                    var tmpBlockFuncContents = [];
                    for(var i=1; i < blockFuncContents.length; i++)
                        tmpBlockFuncContents.push(blockFuncContents[i]);


                    matchFlag = this.util.isFuncContentsMatch(
                        tmpBlockFuncContents,
                        textFuncStatements,
                        paramMap,
                        paramInfo,
                        this._currentFuncKey
                    );
                } else {
                    foundFlag = false;
                    matchFlag = false;
                }

                // Final Decision In Terms of Conditions
                if (foundFlag) {
                    targetFuncId = funcId;
                    break;
                }
            }
        }


        if (foundFlag && matchFlag) {
            var paramCount = textFuncParams.length;
            var targetFuncBlockId = "func_" + targetFuncId;
            this._funcMap[textFuncName] = targetFuncBlockId;

            result = targetFuncBlockId;
        } else if (foundFlag && !matchFlag) {
            var targetFunc = Entry.variableContainer.functions_[targetFuncId];
            var thread = targetFunc.content._data[0];
            thread._data.splice(1, thread._data.length-1);


            for (var s in textFuncStatements) {
                var statement = textFuncStatements[s];
                this.util.makeFuncParamBlock(statement, paramInfo, this._blockCount);
                var stmtBlock = new Entry.Block(statement, thread);
                thread._data.push(stmtBlock);
            }


            Entry.variableContainer.saveFunction(targetFunc);
            Entry.variableContainer.updateList();

            var paramCount = textFuncParams.length;
            var targetFuncBlockId  = "func_" + targetFuncId;
            this._funcMap[textFuncName] = targetFuncBlockId;
            result = targetFuncBlockId;
        } else {
            ////////////////////////////////////////////////////////////////
            //If Not Exist, Create New Function Block
            ////////////////////////////////////////////////////////////////


            // Func Create
            var newFunc = new Entry.Func({id: newFuncId});
            newFunc.generateBlock(true);
            targetFuncId = newFunc.id;


            var templateArr = [];

            for(var i = 1; i <= textFuncParams.length+1; i++)
                templateArr.push('%'+i);

            // Func Name
            newFunc.block.template = textFuncName + ' ' + templateArr.join(' ');

            var thread = newFunc.content._data[0];
            var newFuncDefParamBlock = thread._data[0].data.params[0];
            var newFuncDefParams = newFuncDefParamBlock.data.params;
            newFunc.description = '';

            // inject block func name
            // func name join
            var textFuncNameTokens = textFuncName.split('!@#$');
            if (textFuncNameTokens.length > 1) {
                for(var n = 1; n < textFuncNameTokens.length; n++) {
                    var token = textFuncNameTokens[n];
                    var nameFieldBlock = new Entry.Block({ type: "function_field_label" }, thread);
                    nameFieldBlock.data.params = [];
                    nameFieldBlock.data.params.push(token);
                    var lastParam = this.util.getLastParam(newFuncDefParamBlock);
                    lastParam.data.params[1] = nameFieldBlock;
                    newFunc.description += token.concat(' ');
                }

                newFunc.description += ' ';
            } else {
                newFuncDefParams[0] = textFuncName;
                newFunc.description = textFuncName + ' ';
            }
            this.util.initQueue();

            if (textFuncParams.length > 0) {
                var paramFieldBlock = new Entry.Block(
                    { type: "function_field_string" },
                    thread
                );
                paramFieldBlock.data.params = [];
                var stringParam = Entry.Func.requestParamBlock("string");
                var param = new Entry.Block({ type: stringParam }, thread);
                paramFieldBlock.data.params.push(param);

                //newFuncDefParams[1] = paramFieldBlock;
                var lastParam = this.util.getLastParam(newFuncDefParamBlock);
                lastParam.data.params[1] = paramFieldBlock;

                newFunc.paramMap[stringParam] = Number(0);

                paramInfo = {};
                paramInfo[textFuncParams[0]] = stringParam;

                for (var p = 1; p < textFuncParams.length; p++) {
                    var paramFieldBlock = new Entry.Block({
                        type: "function_field_string" }, thread);
                    paramFieldBlock.data.params = [];

                    var stringParam = Entry.Func.requestParamBlock("string");
                    var param = new Entry.Block({ type: stringParam }, thread);
                    paramFieldBlock.data.params.push(param);

                    var paramBlock = this.util.searchFuncDefParam(newFuncDefParams[1]);
                    if (paramBlock.data.params.length == 0)
                        paramBlock.data.params[0] = param;
                    else if (paramBlock.data.params.length == 1)
                        paramBlock.data.params[1] = paramFieldBlock;

                    newFunc.paramMap[stringParam] = Number(p);
                    paramInfo[textFuncParams[p]] = stringParam;
                }
            }

            Entry.Func.generateWsBlock(newFunc);

            for (var s in textFuncStatements) {
                var statement = textFuncStatements[s];
                this.util.makeFuncParamBlock(
                    statement, paramInfo, this._blockCount);
                var stmtBlock = new Entry.Block(statement, thread);
                thread._data.push(stmtBlock);
            }

            Entry.variableContainer.saveFunction(newFunc);
            Entry.variableContainer.updateList();

            var paramCount = textFuncParams.length;
            var targetFuncBlockId = "func_" + targetFuncId;
            this._funcMap[textFuncName] = targetFuncBlockId;

            result = targetFuncBlockId;
        }

        var tFunc = Entry.variableContainer.functions_[targetFuncId];
        if (tFunc) {
            var tFuncContents = tFunc.content._data[0]._data;
            if (this._hasReculsiveFunc) {
                if (tFuncContents) {
                    for(var tf in tFuncContents) {
                        var tFuncContent = tFuncContents[tf];
                        this.convertReculsiveFuncType(tFuncContent);
                    }
                }
            }
        }

        this._funcLoop = false;
        this._hasReculsiveFunc = false;
        this._rootFuncKey = false;

        return null;
    };

    p.FunctionExpression = function(component) {
        var result = {};

        var body = component.body;
        var bodyData = this[body.type](body);


        if (bodyData.data && bodyData.data.length != 0){
            result.statements = bodyData.data;
        } else {
            result.statements = bodyData.statements;
        }

        return result;
    };

    p.ReturnStatement = function(component) {
        var result = {};

        var argument = component.argument;
        if (argument)
            var argumentData = this[argument.type](argument);

        if (argumentData)
            result.argument = argumentData;

        return result;
    };

    p.ThisExpression = function(component) {
        var result = {};

        var userCode = component.userCode;
        if (userCode)
            result.userCode = userCode;

        return result;
    };

    p.NewExpression = function(component) {
        var result = {};

        var callee = component.callee;
        var calleeData = this[callee.type](callee);

        var arguments = component.arguments;
        var args = [];
        for(var i in arguments) {
            var argument = arguments[i];

            var arg = this[argument.type](argument);
            args.push(arg);
        }

        result.callee = calleeData;
        result.arguments = args;

        return result;
    };

    /////////////////////////////////////////////////////////////////
    // Utils
    p.codeInit = function() {
        this.threadInit();
        this._currentObject = Entry.getMainWS().vimBoard._currentObject;
        this._funcMap = {};
        this._code = [];
        this._threadCount = 0;
        this._blockCount = 0;
    };

    p.threadInit = function() {
        this._thread = [];
        this._funcParams = [];
        this._funcLoop = false;
        this.isLastBlock = false;
        this._hasReculsiveFunc = false;
        this._isEntryEventExisted = false;
        this._rootFuncKey = false;

    };

    p.isFuncParam = function(paramName) {
        if (this._funcParams.length == 0)
            return false;

        for (var p in this._funcParams) {
            var funcParam = this._funcParams[p];
            if (funcParam == paramName) {
                return true;
            }
        }
        return false;
    };

    p.convertReculsiveFuncType = function(funcContents) {
        if (!funcContents) return;

        if (funcContents && funcContents.data) {
            var funcKey = funcContents.data.type;
            if (funcType = this._funcMap[funcKey])
                funcContents.data.type = funcType;
        }

        if (funcContents && funcContents.data && funcContents.data.statements) {
            if (funcContents.data.statements[0]) {
                var statements0 = funcContents.data.statements[0]._data;
                for(var s in statements0) {
                    var statement = statements0[s];
                    this.convertReculsiveFuncType(statement);
                }
            }
            if (funcContents.data.statements[1]) {
                var statements1 = funcContents.data.statements[1]._data;
                for(var s in statements1) {
                    var statement = statements1[s];
                    this.convertReculsiveFuncType(statement);
                }
            }
        }

    }

    p.convertReculsiveFuncTypeGeneral = function(stmts, targetFuncType) {
        for(var s in stmts) {
            var st = stmts[s];
            if (st.type == this._currentFuncKey)
                st.type = targetFuncType;
            if (st.statements) {
                for(var x in st.statements)
                    this.convertReculsiveFuncTypeGeneral(st.statements[x], targetFuncType);
            }
        }
    }

    p.getBlockSyntax = function(syntax) {
        if (!syntax)
            return null;
        syntax = syntax.split(".");

        var syntaxTokens = [];
        syntaxTokens.push(syntax.shift());
        var restSyntax = syntax.join('.');
        if (restSyntax != '')
            syntaxTokens.push(restSyntax);
        syntax = syntaxTokens;

        var blockSyntax = this.blockSyntax;
        while (syntax.length) {
            var key = syntax.shift();
            blockSyntax = blockSyntax[key];
            if (!blockSyntax) return null;
        }
        if (!blockSyntax)
            return null;
        else if (typeof blockSyntax === "string")
            return blockSyntax;
        else
            return blockSyntax;
    };

    p.getParamIndex = function(syntax) {
        var result = {};
        var blockSyntax = this.getBlockSyntax(syntax);
        var fullSyntax = blockSyntax.syntax;
        var paramReg = /(%.)/mi;
        var paramTokens = fullSyntax.split(paramReg);

        var index = 0;
        for(var i in paramTokens) {
            var paramToken = paramTokens[i];
            if (paramReg.test(paramToken)) {
                var paramIndex = paramToken.split('%')[1];
                result[index++] = Number(paramIndex)-1;
            }
        }

        return result;
    }

    p.extractContents = function(content, thread) {
        var blockDatum = Entry.block[content.type];
        var targetSyntax = this.searchSyntax(blockDatum);
        if (targetSyntax) {
            var blockType = targetSyntax.blockType;
        }

        if (blockType == "param") return;
        else if (blockType == "event") {
            this._isEntryEventExisted = true;
        }
        else if (blockType == "last") {
            this.isLastBlock = true;
        }
        else if (blockType == "variable") {
            if (!this._isEntryEventExisted)
                return;
        }

        thread.push(content);
        if (content.contents) {
            for(var c in content.contents) {
                var content = content.contents[c];
                this.extractContents(content, thread);

            }
        }


        if (content.statements && content.statements[0]) {
            for(var s in content.statements[0]) {
                var st = content.statements[0][s];
                if (st.contents){
                    for(var sc in st.contents) {
                        var scs = st.contents[sc];
                        this.extractContents(scs, content.statements[0]);
                    }
                }



            }
        }

        /*if (content.statements && content.statements[1]) {
            for(var s in content.statements[1]) {
                var st = content.statements[1][s];
                this.extractContents(st, content.statements[0]);
            }
        }*/


    }

    ///////////////////////////////////////////////////////////
    //Not Yet Used Syntax
    ///////////////////////////////////////////////////////////

    p.RegExp = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "RegExp";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.Function = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "Function";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.EmptyStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "EmptyStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.DebuggerStatement = function(component) {

        var result;

        result = component;


        //Convertin Error Control
        var keyword = "DebuggerStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.WithStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "WithStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.LabeledStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "LabeledStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.ContinueStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "ContinueStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.SwitchStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "SwitchStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.SwitchCase = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "SwitchCase";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.ThrowStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "ThrowStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.TryStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "TryStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.CatchClause = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "CatchClause";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.DoWhileStatement = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "DoWhileStatement";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.ArrayExpression = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "ArrayExpression";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.ObjectExpression = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "ObjectExpression";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.Property = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "Property";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.ConditionalExpression = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        /*var keyword = "ConditionalExpression";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);*/
        //Converting Error Control

        return result;
    };

    p.SequenceExpression = function(component) {
        var result;

        result = component;


        //Convertin Error Control
        var keyword = "SequenceExpression";
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError.MESSAGE_CONV_NO_SUPPORT,
            keyword,
            this._blockCount,
            Entry.TextCodingError.SUBJECT_CONV_GENERAL);
        //Converting Error Control

        return result;
    };

    p.searchSyntax = function(datum) {
        var schema;
        var appliedParams;
        var doNotCheckParams = false;

        if (datum instanceof Entry.BlockView) {
            schema = datum.block._schema;
            appliedParams = datum.block.data.params;
        } else if (datum instanceof Entry.Block) {
            schema = datum._schema;
            appliedParams = datum.params;
        } else {
            schema = datum;
            doNotCheckParams = true;
        }

        if (schema && schema.syntax) {
            var syntaxes = schema.syntax.py.concat();
            while (syntaxes.length) {
                var isFail = false;
                var syntax = syntaxes.shift();
                if (typeof syntax === "string")
                    return {syntax: syntax, template: syntax};
                if (syntax.params) {
                    for (var i = 0; i < syntax.params.length; i++) {
                        if (doNotCheckParams !== true && syntax.params[i] &&
                            syntax.params[i] !== appliedParams[i]) {
                            isFail = true;
                            break;
                        }
                    }
                }
                if (!syntax.template)
                    syntax.template = syntax.syntax;
                if (isFail) {
                    continue;
                }
                return syntax;
            }
        }
        return null;
    };


})(Entry.PyToBlockParser.prototype);
