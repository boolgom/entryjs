module.exports = {
    getBlocks() {
        return {
            show: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'show',
                },
                class: 'visibility',
                isNotFor: [],
                func: function(sprite, script) {
                    sprite.setVisible(true);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.show()'] },
            },
            hide: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'hide',
                },
                class: 'visibility',
                isNotFor: [],
                func: function(sprite, script) {
                    sprite.setVisible(false);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.hide()'] },
            },
            dialog_time: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Dropdown',
                        options: [[Lang.Blocks.speak, 'speak']],
                        value: 'speak',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: [Lang.Blocks.block_hi],
                        },
                        {
                            type: 'number',
                            params: ['4'],
                        },
                        null,
                        null,
                    ],
                    type: 'dialog_time',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                        null,
                    ],
                    type: 'dialog_time',
                },
                paramsKeyMap: {
                    VALUE: 0,
                    SECOND: 1,
                    OPTION: 2,
                },
                class: 'say',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    if (!script.isStart) {
                        var timeValue = script.getNumberValue('SECOND', script);
                        var message = script.getValue('VALUE', script);
                        var mode = script.getField('OPTION', script);
                        script.isStart = true;
                        script.timeFlag = 1;
                        if (message === '') {
                            message = '    ';
                        } else if (typeof message === 'boolean') {
                            message = message ? 'True' : 'False';
                        } else {
                            message = message + '';
                        }
                        message = Entry.convertToRoundedDecimals(message, 3);
                        new Entry.Dialog(sprite, message, mode);
                        sprite.syncDialogVisible(sprite.getVisible());
                        setTimeout(function() {
                            script.timeFlag = 0;
                        }, timeValue * 1000);
                    }
                    if (script.timeFlag == 0) {
                        delete script.timeFlag;
                        delete script.isStart;
                        if (sprite.dialog) sprite.dialog.remove();
                        return script.callReturn();
                    } else {
                        if (!sprite.dialog) {
                            var message = script.getStringValue(
                                'VALUE',
                                script
                            );
                            var mode = script.getField('OPTION', script);
                            if (!message && typeof message != 'number')
                                message = '    ';
                            message = Entry.convertToRoundedDecimals(
                                message,
                                3
                            );
                            new Entry.Dialog(sprite, message, mode);
                            sprite.syncDialogVisible(sprite.getVisible());
                        }
                        return script;
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.print_for_sec(%1, %2)',
                            params: [null, null, 'speak'],
                            textParams: [
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                {
                                    type: 'Dropdown',
                                    options: [[Lang.Blocks.speak, 'speak']],
                                    value: 'speak',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter:
                                        Entry.block.converters
                                            .returnStringValue,
                                },
                            ],
                        },
                    ],
                },
            },
            dialog: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Dropdown',
                        options: [[Lang.Blocks.speak, 'speak']],
                        value: 'speak',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: [Lang.Blocks.block_hi],
                        },
                        null,
                        null,
                    ],
                    type: 'dialog',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        null,
                    ],
                    type: 'dialog',
                },
                paramsKeyMap: {
                    VALUE: 0,
                    OPTION: 1,
                },
                class: 'say',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    var message = script.getValue('VALUE', script);
                    if (message === '') {
                        message = '    ';
                    } else if (typeof message === 'boolean') {
                        message = message ? 'True' : 'False';
                    } else {
                        message = message + '';
                    }
                    var mode = script.getField('OPTION', script);
                    message = Entry.convertToRoundedDecimals(message, 3);
                    new Entry.Dialog(sprite, message, mode);
                    sprite.syncDialogVisible(sprite.getVisible());
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.print(%1)',
                            params: [null, 'speak'],
                        },
                    ],
                },
            },
            remove_dialog: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'remove_dialog',
                },
                class: 'say',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    if (sprite.dialog) sprite.dialog.remove();
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.clear_print()'] },
            },
            change_to_some_shape: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'get_pictures',
                            id: 'z4jm',
                        },
                        null,
                    ],
                    type: 'change_to_some_shape',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'get_pictures',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'change_to_some_shape',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'shape',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    var imageId = script.getStringValue('VALUE');
                    var value = Entry.parseNumber(imageId);
                    var picture = sprite.parent.getPicture(imageId);

                    sprite.setImage(picture);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            passTest: true,
                            syntax: 'Entry.change_shape(%1)',
                        },
                    ],
                },
            },
            change_to_next_shape: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.LOOKS_change_shape_next, 'next'],
                            [Lang.Blocks.LOOKS_change_shape_prev, 'prev'],
                        ],
                        value: 'next',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'change_to_next_shape',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'change_to_next_shape',
                },
                paramsKeyMap: {
                    DRIECTION: 0,
                },
                class: 'shape',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    var picture;
                    if (script.getStringField('DRIECTION') !== 'prev') {
                        picture = sprite.parent.getNextPicture(
                            sprite.picture.id
                        );
                    } else {
                        picture = sprite.parent.getPrevPicture(
                            sprite.picture.id
                        );
                    }
                    sprite.setImage(picture);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.change_shape_to(%1)',
                            textParams: [
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [
                                            Lang.Blocks.LOOKS_change_shape_next,
                                            'next',
                                        ],
                                        [
                                            Lang.Blocks.LOOKS_change_shape_prev,
                                            'prev',
                                        ],
                                    ],
                                    value: 'next',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter:
                                        Entry.block.converters
                                            .returnStringValue,
                                    codeMap:
                                        'Entry.CodeMap.Entry.change_to_next_shape[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            add_effect_amount: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.color, 'color'],
                            [Lang.Blocks.brightness, 'brightness'],
                            [Lang.Blocks.transparency, 'transparency'],
                        ],
                        value: 'color',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'add_effect_amount',
                },
                pyHelpDef: {
                    params: [
                        'A&value',
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'add_effect_amount',
                },
                paramsKeyMap: {
                    EFFECT: 0,
                    VALUE: 1,
                },
                class: 'effect',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    var effect = script.getField('EFFECT', script);
                    var effectValue = script.getNumberValue('VALUE', script);
                    var effectName = '';
                    if (effect == 'color') {
                        sprite.effect.hsv = effectValue + sprite.effect.hsv;
                        effectName = 'hsv';
                    } else if (effect == 'brightness') {
                        sprite.effect.brightness =
                            effectValue + sprite.effect.brightness;
                        effectName = 'brightness';
                    } else if (effect == 'transparency') {
                        sprite.effect.alpha =
                            sprite.effect.alpha - effectValue / 100;
                        effectName = 'alpha';
                    }
                    sprite.applyFilter(true, [effectName]);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.add_effect(%1, %2)',
                            textParams: [
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.color, 'color'],
                                        [Lang.Blocks.brightness, 'brightness'],
                                        [
                                            Lang.Blocks.transparency,
                                            'transparency',
                                        ],
                                    ],
                                    value: 'color',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter:
                                        Entry.block.converters
                                            .returnStringValue,
                                    codeMap:
                                        'Entry.CodeMap.Entry.add_effect_amount[0]',
                                },
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                            ],
                        },
                    ],
                },
            },
            change_effect_amount: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.color, 'color'],
                            [Lang.Blocks.brightness, 'brightness'],
                            [Lang.Blocks.transparency, 'transparency'],
                        ],
                        value: 'color',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'number',
                            params: ['100'],
                        },
                        null,
                    ],
                    type: 'change_effect_amount',
                },
                pyHelpDef: {
                    params: [
                        'A&value',
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'change_effect_amount',
                },
                paramsKeyMap: {
                    EFFECT: 0,
                    VALUE: 1,
                },
                class: 'effect',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    var effect = script.getField('EFFECT', script);
                    var effectValue = script.getNumberValue('VALUE', script);
                    var effectName = '';
                    if (effect == 'color') {
                        sprite.effect.hsv = effectValue;
                        effectName = 'hsv';
                    } else if (effect == 'brightness') {
                        sprite.effect.brightness = effectValue;
                        effectName = 'brightness';
                    } else if (effect == 'transparency') {
                        sprite.effect.alpha = 1 - effectValue / 100;
                        effectName = 'alpha';
                    }
                    sprite.applyFilter(true, [effectName]);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.set_effect(%1, %2)',
                            textParams: [
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.color, 'color'],
                                        [Lang.Blocks.brightness, 'brightness'],
                                        [
                                            Lang.Blocks.transparency,
                                            'transparency',
                                        ],
                                    ],
                                    value: 'color',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter:
                                        Entry.block.converters
                                            .returnStringValue,
                                    codeMap:
                                        'Entry.CodeMap.Entry.change_effect_amount[0]',
                                },
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                            ],
                        },
                    ],
                },
            },
            erase_all_effects: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'erase_all_effects',
                },
                class: 'effect',
                isNotFor: ['textBox'],
                func: function(sprite, script) {
                    sprite.resetFilter();
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.clear_effect()'] },
            },
            change_scale_size: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'change_scale_size',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'change_scale_size',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'scale',
                isNotFor: [],
                func: function(sprite, script) {
                    var sizeValue = script.getNumberValue('VALUE', script);
                    sprite.setSize(sprite.getSize() + sizeValue);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.add_size(%1)'] },
            },
            set_scale_size: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['100'],
                        },
                        null,
                    ],
                    type: 'set_scale_size',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'set_scale_size',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'scale',
                isNotFor: [],
                func: function(sprite, script) {
                    var sizeValue = script.getNumberValue('VALUE', script);
                    sprite.setSize(sizeValue);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.set_size(%1)'] },
            },
            flip_x: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'flip_x',
                },
                class: 'flip',
                isNotFor: [],
                func: function(sprite, script) {
                    sprite.setScaleY(-1 * sprite.getScaleY());
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.flip_horizontal()'] },
            },
            flip_y: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'flip_y',
                },
                class: 'flip',
                isNotFor: [],
                func: function(sprite, script) {
                    sprite.setScaleX(-1 * sprite.getScaleX());
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.flip_vertical()'] },
            },
            change_object_index: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [
                                Lang.Blocks.LOOKS_change_object_index_sub_1,
                                'FRONT',
                            ],
                            [
                                Lang.Blocks.LOOKS_change_object_index_sub_2,
                                'FORWARD',
                            ],
                            [
                                Lang.Blocks.LOOKS_change_object_index_sub_3,
                                'BACKWARD',
                            ],
                            [
                                Lang.Blocks.LOOKS_change_object_index_sub_4,
                                'BACK',
                            ],
                        ],
                        value: 'FRONT',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'change_object_index',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'change_object_index',
                },
                paramsKeyMap: {
                    LOCATION: 0,
                },
                class: 'z-index',
                isNotFor: [],
                func: function(sprite, script) {
                    var location = script.getField('LOCATION', script);
                    var selectedObjectContainer =
                        Entry.stage.selectedObjectContainer;
                    var currentIndex = selectedObjectContainer.getChildIndex(
                        sprite.object
                    );
                    var max = selectedObjectContainer.children.length - 1;
                    var targetIndex = currentIndex;

                    switch (location) {
                        case 'FRONT':
                            targetIndex = max;
                            break;
                        case 'FORWARD':
                            if (currentIndex === max) break;

                            var frontEntity = selectedObjectContainer.getChildAt(
                                currentIndex + 1
                            ).entity;
                            targetIndex +=
                                (frontEntity.shapes.length ? 2 : 1) +
                                frontEntity.stamps.length;
                            break;
                        case 'BACKWARD':
                            targetIndex -=
                                (sprite.shapes.length ? 2 : 1) +
                                sprite.stamps.length;
                            var backEntity = selectedObjectContainer.getChildAt(
                                targetIndex
                            );
                            if (!backEntity) {
                                targetIndex = 0;
                                break;
                            }
                            backEntity = backEntity.entity;
                            targetIndex -=
                                (backEntity.shapes.length ? 1 : 0) +
                                backEntity.stamps.length;
                            break;
                        case 'BACK':
                            targetIndex = 0;
                            break;
                    }
                    Entry.stage.setEntityIndex(sprite, targetIndex);

                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.send_layer_to(%1)',
                            textParams: [
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [
                                            Lang.Blocks
                                                .LOOKS_change_object_index_sub_1,
                                            'FRONT',
                                        ],
                                        [
                                            Lang.Blocks
                                                .LOOKS_change_object_index_sub_2,
                                            'FORWARD',
                                        ],
                                        [
                                            Lang.Blocks
                                                .LOOKS_change_object_index_sub_3,
                                            'BACKWARD',
                                        ],
                                        [
                                            Lang.Blocks
                                                .LOOKS_change_object_index_sub_4,
                                            'BACK',
                                        ],
                                    ],
                                    value: 'FRONT',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter:
                                        Entry.block.converters
                                            .returnStringValueLowerCase,
                                    codeMap:
                                        'Entry.CodeMap.Entry.change_object_index[0]',
                                },
                            ],
                        },
                    ],
                },
            },
        };
    }
};
