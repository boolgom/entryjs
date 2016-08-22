"use strict";

Entry.block.functionAddButton = {
    skeleton: "basic_button",
    color: "#eee",
    isNotFor: ["functionInit"],
    template: "%1",
    params: [
        {
            type: "Text",
            text: "함수 추가",
            color: "#333",
            align: "center"
        }
    ],
    events: {
        mousedown: [
            function() {
                Entry.variableContainer.createFunction();
            }
        ]
    },
    syntax: {js:[], py: []}
};

Blockly.Blocks.function_field_label = {
  init: function() {
    this.setColour("#f9c535");
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_explanation_1), "NAME");
    this.appendValueInput("NEXT")
        .setCheck(['Param']);
    this.setOutput(true, 'Param');
    this.setInputsInline(true);
  }
};

Entry.block.function_field_label = {
    skeleton: "basic_param",
    isNotFor: ["functionEdit"],
    color: "#f9c535",
    template: "%1%2",
    params: [
        {
            type: "TextInput",
            value: "함수"
        },
        {
            type: "Output",
            accept: "paramMagnet"
        }
    ]
};

Blockly.Blocks.function_field_string = {
  init: function() {
    this.setColour("#FFD974");
    this.appendValueInput("PARAM")
        .setCheck(['String']);
    this.appendValueInput("NEXT")
        .setCheck(['Param']);
    this.setOutput(true, 'Param');
    this.setInputsInline(true);
  }
};

Entry.block.function_field_string = {
    skeleton: "basic_param",
    isNotFor: ["functionEdit"],
    color: "#ffd974",
    template: "%1%2",
    params: [
        {
            type: "Block",
            accept: "stringMagnet",
            restore: true
        },
        {
            type: "Output",
            accept: "paramMagnet"
        }
    ]
};

Blockly.Blocks.function_field_boolean = {
  init: function() {
    this.setColour("#AEB8FF");
    this.appendValueInput("PARAM")
        .setCheck(['Boolean']);
    this.appendValueInput("NEXT")
        .setCheck(['Param']);
    this.setOutput(true, 'Param');
    this.setInputsInline(true);
  }
};

Entry.block.function_field_boolean = {
    skeleton: "basic_param",
    isNotFor: ["functionEdit"],
    color: "#aeb8ff",
    template: "%1%2",
    params: [
        {
            type: "Block",
            accept: "booleanMagnet",
            restore: true
        },
        {
            type: "Output",
            accept: "paramMagnet"
        }
    ]
};

Blockly.Blocks.function_param_string = {
  init: function() {
    this.setEditable(false);
    this.setColour("#FFD974");
    /*
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('문자값1'), "NAME");
        */
    this.setOutput(true, ['String', 'Number']);
    this.setInputsInline(true);
  },
  domToMutation: function(xmlElement) {
    var fields = xmlElement.getElementsByTagName('field');
    this.hashId = xmlElement.getAttribute('hashid');
    var text = Entry.Func.targetFunc.stringHash[this.hashId];
    if (!text) text = '';
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_character_variable
 + text), "");
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute("hashid", this.hashId);
    return container;
  }
};

Entry.block.function_param_string = function (sprite, script, register) {
    return script.register[script.hashId].run()
};

Entry.block.function_param_string = {
    skeleton: "basic_string_field",
    color: "#ffd974",
    template: "문자/숫자값",
    func: function() {
        return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
    }
};

Blockly.Blocks.function_param_boolean = {
  init: function() {
    this.setEditable(false);
    this.setColour("#AEB8FF");
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
  },
  domToMutation: function(xmlElement) {
    var fields = xmlElement.getElementsByTagName('field');
    this.hashId = xmlElement.getAttribute('hashid');
    var text = Entry.Func.targetFunc.booleanHash[this.hashId];
    if (!text) text = '';
    this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_logical_variable + text), "");
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute("hashid", this.hashId);
    return container;
  }
};

Entry.block.function_param_boolean = function (sprite, script, register) {
    return script.register[script.hashId].run()
};

Entry.block.function_param_boolean = {
    skeleton: "basic_boolean_field",
    color: "#aeb8ff",
    template: "판단값",
    func: function() {
        return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
    }
};

Blockly.Blocks.function_create = {
  init: function() {
    this.appendDummyInput()
        .appendField(Lang.Blocks.FUNCTION_define);
    this.setColour("#cc7337");
    this.appendValueInput("FIELD")
        .setCheck(['Param']);
    this.appendDummyInput()
        .appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 'block_icon/function_03.png', '*'));
    this.setInputsInline(true);
    this.setNextStatement(true);
  }
};

Entry.block.function_create = function (sprite, script) {
    return script.callReturn();
};

Entry.block.function_create = {
    skeleton: "basic",
    color: "#cc7337",
    event: "funcDef",
    template: "함수 정의하기 %1 %2",
    params: [
        {
            type: "Block",
            accept: "paramMagnet",
            value: {
                    type: "function_field_label"
            }
        },
        {
            type: "Indicator",
            img: "/lib/entryjs/images/block_icon/function_03.png",
            size: 12
        }
    ],
    func: function() {
    }
};

Blockly.Blocks.function_general = {
  init: function() {
    this.setColour("#cc7337");
    this.setInputsInline(true);
    this.setNextStatement(true);
    this.setPreviousStatement(true);
  },
  domToMutation: function(xmlElement) {
    var fields = xmlElement.getElementsByTagName('field');
    this.appendDummyInput().appendField('');
    if (!fields.length)
        this.appendDummyInput()
            .appendField(Lang.Blocks.FUNCTION_function);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var hash = field.getAttribute('hashid');
        switch(field.getAttribute('type').toLowerCase()) {
            case 'label':
                this.appendDummyInput()
                    .appendField(field.getAttribute('content'));
                break;
            case 'string':
                this.appendValueInput(hash)
                    .setCheck(['String', 'Number']);
                break;
            case 'boolean':
                this.appendValueInput(hash)
                    .setCheck(['Boolean']);
            default:
        }
    }
    this.hashId = xmlElement.getAttribute('hashid');
    this.appendDummyInput()
        .appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 'block_icon/function_03.png', '*'));
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    for (var i = 1; i < this.inputList.length; i++) {
        var input = this.inputList[i];
        if (input.fieldRow[0] &&
            input.fieldRow[0] instanceof Blockly.FieldLabel) {
            input = input.fieldRow[0]
            var field = document.createElement('field');
            field.setAttribute('type', 'label');
            field.setAttribute('content', input.text_);
        } else if (input.connection &&
            input.connection.check_[0] == 'String') {
            var field = document.createElement('field');
            field.setAttribute('type', 'string');
            field.setAttribute('hashid', input.name);
        } else if (input.connection &&
            input.connection.check_[0] == 'Boolean') {
            var field = document.createElement('field');
            field.setAttribute('type', 'boolean');
            field.setAttribute('hashid', input.name);
        }
        container.appendChild(field);
    }
    container.setAttribute("hashid", this.hashId);
    return container;
  }
};

Entry.block.function_general = function (sprite, script) {
    if (!script.thread) {
        var func = Entry.variableContainer.getFunction(script.hashId);
        script.thread = new Entry.Script(sprite);
        script.thread.register = script.values;
        for (var i = 0; i < func.content.childNodes.length; i++) {
            if (func.content.childNodes[i].getAttribute('type')
                == 'function_create')
                script.thread.init(func.content.childNodes[i]);
        }
        // get parameter
    }
    var thread = Entry.Engine.computeThread(sprite,
                                            script.thread
                                            );
    if (!thread) {
        delete script.thread;
        return script.callReturn();
    } else {
        script.thread = thread;
        return script;
    }
};

Entry.block.function_general = {
    skeleton: "basic",
    color: "#cc7337",
    template: "함수",
    params: [
    ],
    func: function(entity) {
        if (!this.initiated) {
            this.initiated = true;

            var func = Entry.variableContainer.getFunction(
                this.block.type.substr(5, 9)
            );
            this.funcCode = func.content;
            this.funcExecutor = this.funcCode.raiseEvent("funcDef", entity)[0];
            this.funcExecutor.register.params = this.getParams();
            var paramMap = {};
            this.funcExecutor.register.paramMap = func.paramMap;
        }
        this.funcExecutor.execute();
        if (!this.funcExecutor.isEnd()) {
            this.funcCode.removeExecutor(this.funcExecutor);
            return Entry.STATIC.BREAK;
        }
    }
};

