module.exports = {
    getBlocks() {
        return {
            show: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'show',
                },
                class: 'visibility',
                isNotFor: [],
                func(sprite, script) {
                    sprite.setVisible(true);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.show()'] },
            },
            hide: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'hide',
                },
                class: 'visibility',
                isNotFor: [],
                func(sprite, script) {
                    sprite.setVisible(false);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.hide()'] },
            },
            dialog_time: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
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
                        defaultType: 'number',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.speak, 'speak'],
                            [Lang.Blocks.think, 'think'],
                            // [Lang.Blocks.yell, 'yell'],
                        ],
                        value: 'speak',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.LOOKS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                        {
                            type: 'text',
                            params: ['C&value'],
                        },
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
                isNotFor: [],
                func(sprite, script) {
                    if (!script.isStart) {
                        let [timeValue, message] = script.getValues(['SECOND', 'VALUE'], script);
                        timeValue = Number(timeValue);

                        const mode = script.getField('OPTION', script);
                        script.isStart = true;
                        script.timeFlag = 1;
                        if (message === '') {
                            message = '    ';
                        } else if (typeof message === 'boolean') {
                            message = message ? 'True' : 'False';
                        } else {
                            message = `${message}`;
                        }
                        message = Entry.convertToRoundedDecimals(message, 3);
                        new Entry.Dialog(sprite, message, mode);
                        sprite.syncDialogVisible(sprite.getVisible());
                        let timeoutId = 0;
                        const stopDialog = () => {
                            script.timeFlag = 0;
                            if (timeoutId) {
                                clearTimeout(timeoutId);
                                timeoutId = 0;
                            }
                        };
                        sprite.stopDialog = stopDialog;
                        timeoutId = setTimeout(stopDialog, timeValue * 1000);
                    }
                    if (script.timeFlag == 0) {
                        delete script.timeFlag;
                        delete script.isStart;
                        if (sprite.dialog) {
                            sprite.dialog.remove();
                            sprite.stopDialog = undefined;
                        }
                        return script.callReturn();
                    }
                    return script;
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
                                    options: [
                                        [Lang.Blocks.speak, 'speak'],
                                        [Lang.Blocks.think, 'think'],
                                        // [Lang.Blocks.yell, 'yell'],
                                    ],
                                    value: 'speak',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter: Entry.block.converters.returnStringValue,
                                },
                            ],
                        },
                    ],
                },
            },
            dialog: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.speak, 'speak'],
                            [Lang.Blocks.think, 'think'],
                            // [Lang.Blocks.yell, 'yell'],
                        ],
                        value: 'speak',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.LOOKS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'dialog',
                },
                paramsKeyMap: {
                    VALUE: 0,
                    OPTION: 1,
                },
                class: 'say',
                isNotFor: [],
                func(sprite, script) {
                    let message = script.getValue('VALUE', script);
                    if (message === '') {
                        message = '    ';
                    } else if (typeof message === 'boolean') {
                        message = message ? 'True' : 'False';
                    } else {
                        message = `${message}`;
                    }
                    const mode = script.getField('OPTION', script);
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
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'remove_dialog',
                },
                class: 'say',
                isNotFor: [],
                func(sprite, script) {
                    if (sprite.stopDialog) {
                        sprite.stopDialog();
                    }
                    if (sprite.dialog) {
                        sprite.dialog.remove();
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.clear_print()'] },
            },
            change_to_some_shape: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                func(sprite, script) {
                    const imageId = script.getStringValue('VALUE');
                    const picture = sprite.parent.getPicture(imageId);

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
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
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
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.LOOKS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                func(sprite, script) {
                    let picture;
                    if (script.getStringField('DRIECTION') !== 'prev') {
                        picture = sprite.parent.getNextPicture(sprite.picture.id);
                    } else {
                        picture = sprite.parent.getPrevPicture(sprite.picture.id);
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
                                        [Lang.Blocks.LOOKS_change_shape_next, 'next'],
                                        [Lang.Blocks.LOOKS_change_shape_prev, 'prev'],
                                    ],
                                    value: 'next',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter: Entry.block.converters.returnStringValue,
                                    codeMap: 'Entry.CodeMap.Entry.change_to_next_shape[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            add_effect_amount: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
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
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.LOOKS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                func(sprite, script) {
                    const effect = script.getField('EFFECT', script);
                    const effectValue = script.getNumberValue('VALUE', script);
                    let effectName = '';
                    if (effect === 'color') {
                        sprite.effect.hsv = effectValue + sprite.effect.hsv;
                        effectName = 'hsv';
                    } else if (effect === 'brightness') {
                        sprite.effect.brightness = effectValue + sprite.effect.brightness;
                        effectName = 'brightness';
                    } else if (effect === 'transparency') {
                        sprite.effect.alpha = sprite.effect.alpha - effectValue / 100;
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
                                        [Lang.Blocks.transparency, 'transparency'],
                                    ],
                                    value: 'color',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter: Entry.block.converters.returnStringValue,
                                    codeMap: 'Entry.CodeMap.Entry.add_effect_amount[0]',
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
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
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
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.LOOKS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                func(sprite, script) {
                    const effect = script.getField('EFFECT', script);
                    const effectValue = script.getNumberValue('VALUE', script);
                    let effectName = '';
                    if (effect === 'color') {
                        sprite.effect.hsv = effectValue;
                        effectName = 'hsv';
                    } else if (effect === 'brightness') {
                        sprite.effect.brightness = effectValue;
                        effectName = 'brightness';
                    } else if (effect === 'transparency') {
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
                                        [Lang.Blocks.transparency, 'transparency'],
                                    ],
                                    value: 'color',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter: Entry.block.converters.returnStringValue,
                                    codeMap: 'Entry.CodeMap.Entry.change_effect_amount[0]',
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
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'erase_all_effects',
                },
                class: 'effect',
                isNotFor: ['textBox'],
                func(sprite, script) {
                    sprite.resetFilter();
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.clear_effect()'] },
            },
            change_scale_size: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
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
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                func(sprite, script) {
                    const sizeValue = script.getNumberValue('VALUE', script);
                    sprite.setSize(sprite.getSize() + sizeValue);
                    // sprite.setWidth(sprite.getWidth() * 2);
                    // sprite.setScaleX(sprite.getScaleX() * 2);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.add_size(%1)'] },
            },
            set_scale_size: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
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
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                func(sprite, script) {
                    const sizeValue = script.getNumberValue('VALUE', script);
                    sprite.setSize(sizeValue);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.set_size(%1)'] },
            },
            stretch_scale_size: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.width, 'WIDTH'],
                            [Lang.Blocks.height, 'HEIGHT'],
                        ],
                        value: 'WIDTH',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.LOOKS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                    type: 'stretch_scale_size',
                },
                paramsKeyMap: {
                    DIMENSION: 0,
                    VALUE: 1,
                },
                class: 'scale',
                isNotFor: [],
                func(sprite, script) {
                    const dimension = script.getValue('DIMENSION', script);
                    const sizeValue = script.getNumberValue('VALUE', script);
                    if (dimension === 'WIDTH') {
                        sprite.setXSize(sprite.getSize() + sizeValue);
                    } else {
                        sprite.setYSize(sprite.getSize() + sizeValue);
                    }
                    return script.callReturn();
                },
            },
            reset_scale_size: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'reset_scale_size',
                },
                paramsKeyMap: {},
                class: 'scale',
                isNotFor: [],
                func(sprite, script) {
                    sprite.resetSize();
                    return script.callReturn();
                },
            },
            flip_x: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'flip_x',
                },
                class: 'flip',
                isNotFor: [],
                func(sprite, script) {
                    sprite.setScaleY(-1 * sprite.getScaleY());
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.flip_horizontal()'] },
            },
            flip_y: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'flip_y',
                },
                class: 'flip',
                isNotFor: [],
                func(sprite, script) {
                    sprite.setScaleX(-1 * sprite.getScaleX());
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.flip_vertical()'] },
            },
            change_object_index: {
                color: EntryStatic.colorSet.block.default.LOOKS,
                outerLine: EntryStatic.colorSet.block.darken.LOOKS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.LOOKS_change_object_index_sub_1, 'FRONT'],
                            [Lang.Blocks.LOOKS_change_object_index_sub_2, 'FORWARD'],
                            [Lang.Blocks.LOOKS_change_object_index_sub_3, 'BACKWARD'],
                            [Lang.Blocks.LOOKS_change_object_index_sub_4, 'BACK'],
                        ],
                        value: 'FRONT',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.LOOKS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/looks_icon.svg',
                        size: 11,
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
                func(sprite, script) {
                    const location = script.getField('LOCATION', script);
                    const selectedObjectContainer = Entry.stage.selectedObjectContainer;
                    const currentIndex = selectedObjectContainer.getChildIndex(sprite.object);
                    const max = selectedObjectContainer.children.length - 1;
                    let targetIndex = currentIndex;

                    switch (location) {
                        case 'FRONT':
                            targetIndex = max;
                            break;
                        case 'FORWARD': {
                            if (currentIndex === max) {
                                break;
                            }

                            const frontEntity = selectedObjectContainer.getChildAt(
                                currentIndex + 1
                            ).entity;

                            const offsetCount =
                                1 +
                                (sprite.shapes.length ? 1 : 0) +
                                (sprite.paintShapes.length ? 1 : 0);
                            targetIndex += offsetCount + frontEntity.stamps.length;
                            break;
                        }
                        case 'BACKWARD': {
                            const offsetCount =
                                1 +
                                (sprite.shapes.length ? 1 : 0) +
                                (sprite.paintShapes.length ? 1 : 0);
                            const backIndex = targetIndex - offsetCount + sprite.stamps.length;
                            let backEntity = selectedObjectContainer.getChildAt(backIndex);
                            if (!backEntity) {
                                targetIndex = 0;
                                break;
                            }
                            backEntity = backEntity.entity;
                            targetIndex -= offsetCount + backEntity.stamps.length;
                            break;
                        }
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
                                        [Lang.Blocks.LOOKS_change_object_index_sub_1, 'FRONT'],
                                        [Lang.Blocks.LOOKS_change_object_index_sub_2, 'FORWARD'],
                                        [Lang.Blocks.LOOKS_change_object_index_sub_3, 'BACKWARD'],
                                        [Lang.Blocks.LOOKS_change_object_index_sub_4, 'BACK'],
                                    ],
                                    value: 'FRONT',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.LOOKS,
                                    converter: Entry.block.converters.returnStringValueLowerCase,
                                    codeMap: 'Entry.CodeMap.Entry.change_object_index[0]',
                                },
                            ],
                        },
                    ],
                },
            },
        };
    },
};
