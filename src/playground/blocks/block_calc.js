import _get from 'lodash/get';

module.exports = {
    getBlocks() {
        return {
            calc_basic: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Dropdown',
                        options: [['+', 'PLUS'], ['-', 'MINUS'], ['x', 'MULTI'], ['/', 'DIVIDE']],
                        value: 'PLUS',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        noArrow: true,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        'PLUS',
                        {
                            type: 'number',
                            params: ['10'],
                        },
                    ],
                    type: 'calc_basic',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        'PLUS',
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                    ],
                    type: 'calc_basic',
                },
                defs: [
                    {
                        params: [
                            {
                                type: 'number',
                                params: ['10'],
                            },
                            'PLUS',
                            {
                                type: 'number',
                                params: ['10'],
                            },
                        ],
                        type: 'calc_basic',
                    },
                    {
                        params: [
                            {
                                type: 'number',
                                params: ['10'],
                            },
                            'MINUS',
                            {
                                type: 'number',
                                params: ['10'],
                            },
                        ],
                        type: 'calc_basic',
                    },
                    {
                        params: [
                            {
                                type: 'number',
                                params: ['10'],
                            },
                            'MULTI',
                            {
                                type: 'number',
                                params: ['10'],
                            },
                        ],
                        type: 'calc_basic',
                    },
                    {
                        params: [
                            {
                                type: 'number',
                                params: ['10'],
                            },
                            'DIVIDE',
                            {
                                type: 'number',
                                params: ['10'],
                            },
                        ],
                        type: 'calc_basic',
                    },
                ],
                paramsKeyMap: {
                    LEFTHAND: 0,
                    OPERATOR: 1,
                    RIGHTHAND: 2,
                },
                class: 'calc',
                isNotFor: [],
                func(sprite, script) {
                    const operator = script.getField('OPERATOR', script);
                    let leftValue = script.getNumberValue('LEFTHAND', script);
                    let rightValue = script.getNumberValue('RIGHTHAND', script);
                    if (operator === 'PLUS') {
                        const leftStringValue = script.getValue('LEFTHAND', script);
                        const rightStringValue = script.getValue('RIGHTHAND', script);
                        if (!Entry.Utils.isNumber(leftStringValue)) {
                            leftValue = leftStringValue;
                        }
                        if (!Entry.Utils.isNumber(rightStringValue)) {
                            rightValue = rightStringValue;
                        }
                        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                            return new BigNumber(leftValue).plus(rightValue).toNumber();
                        } else {
                            return leftValue + rightValue;
                        }
                    }
                    // below statements assume both arguments are number
                    leftValue = new BigNumber(leftValue);
                    rightValue = new BigNumber(rightValue);

                    if (operator === 'MINUS') {
                        return leftValue.minus(rightValue).toNumber();
                    } else if (operator === 'MULTI') {
                        return leftValue.times(rightValue).toNumber();
                    } else {
                        return leftValue.dividedBy(rightValue).toNumber();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '(%1 %2 %3)',
                            template: '%1 %2 %3',
                            keyOption: 'calc_basic',
                            blockType: 'param',
                            textParams: [
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                {
                                    type: 'Dropdown',
                                    options: [
                                        ['+', 'PLUS'],
                                        ['-', 'MINUS'],
                                        ['x', 'MULTI'],
                                        ['/', 'DIVIDE'],
                                    ],
                                    value: 'PLUS',
                                    fontSize: 11,
                                    noArrow: true,
                                    converter: Entry.block.converters.returnOperator,
                                    paramType: 'operator',
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
            calc_rand: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_calc_rand_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_calc_rand_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_calc_rand_3,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'number',
                            params: ['0'],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'calc_rand',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'calc_rand',
                },
                paramsKeyMap: {
                    LEFTHAND: 1,
                    RIGHTHAND: 3,
                },
                class: 'calc',
                isNotFor: [],
                func(sprite, script) {
                    const leftValue = script.getStringValue('LEFTHAND', script);
                    const rightValue = script.getStringValue('RIGHTHAND', script);
                    const left = Math.min(leftValue, rightValue);
                    const right = Math.max(leftValue, rightValue);
                    const isLeftFloat = Entry.isFloat(leftValue);
                    const isRightFloat = Entry.isFloat(rightValue);
                    if (isRightFloat || isLeftFloat) {
                        return (Math.random() * (right - left) + left).toFixed(2);
                    } else {
                        return Math.floor(Math.random() * (right - left + 1) + left);
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'random.randint(%2, %4)',
                            blockType: 'param',
                            textParams: [
                                null,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                    paramType: 'integer',
                                },
                                null,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                    paramType: 'integer',
                                },
                                null,
                            ],
                        },
                        {
                            syntax: 'random.uniform(%2, %4)',
                            blockType: 'param',
                            textParams: [
                                null,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                    paramType: 'float',
                                },
                                null,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                    paramType: 'float',
                                },
                                null,
                            ],
                        },
                    ],
                },
            },
            coordinate_mouse: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_coordinate_mouse_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [['x', 'x'], ['y', 'y']],
                        value: 'x',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_coordinate_mouse_2,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [null, null, null],
                    type: 'coordinate_mouse',
                },
                pyHelpDef: {
                    params: [null, 'A&value', null],
                    type: 'coordinate_mouse',
                },
                paramsKeyMap: {
                    VALUE: 1,
                },
                class: 'calc',
                isNotFor: [],
                func(sprite, script) {
                    const targetCoordinate = script.getField('VALUE', script);
                    if (targetCoordinate === 'x') {
                        return Number(Entry.stage.mouseCoordinate.x);
                    } else {
                        return Number(Entry.stage.mouseCoordinate.y);
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.value_of_mouse_pointer(%2)',
                            blockType: 'param',
                            textParams: [
                                {
                                    type: 'Text',
                                    text: Lang.Blocks.CALC_coordinate_mouse_1,
                                    color: '#FFF',
                                },
                                {
                                    type: 'Dropdown',
                                    options: [['x', 'x'], ['y', 'y']],
                                    value: 'x',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringKey,
                                    codeMap: 'Entry.CodeMap.Entry.coordinate_mouse[1]',
                                },
                                {
                                    type: 'Text',
                                    text: Lang.Blocks.CALC_coordinate_mouse_2,
                                    color: '#FFF',
                                },
                            ],
                        },
                    ],
                },
            },
            coordinate_object: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_coordinate_object_1,
                        color: '#FFF',
                    },
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'spritesWithSelf',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_coordinate_object_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.CALC_coordinate_x_value, 'x'],
                            [Lang.Blocks.CALC_coordinate_y_value, 'y'],
                            [Lang.Blocks.CALC_coordinate_rotation_value, 'rotation'],
                            [Lang.Blocks.CALC_coordinate_direction_value, 'direction'],
                            [Lang.Blocks.CALC_coordinate_size_value, 'size'],
                            [Lang.Blocks.CALC_picture_index, 'picture_index'],
                            [Lang.Blocks.CALC_picture_name, 'picture_name'],
                        ],
                        value: 'x',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                ],
                events: {},
                def: {
                    params: [null, null, null, null],
                    type: 'coordinate_object',
                },
                pyHelpDef: {
                    params: [null, 'A&value', null, 'B&value'],
                    type: 'coordinate_object',
                },
                paramsKeyMap: {
                    VALUE: 1,
                    COORDINATE: 3,
                },
                class: 'calc',
                isNotFor: [],
                func(sprite, script) {
                    const targetId = script.getField('VALUE', script);
                    let targetEntity;
                    if (targetId === 'self') {
                        targetEntity = sprite;
                    } else {
                        targetEntity = Entry.container.getEntity(targetId);
                    }

                    const targetCoordinate = script.getField('COORDINATE', script);
                    switch (targetCoordinate) {
                        case 'x':
                            return targetEntity.getX();
                        case 'y':
                            return targetEntity.getY();
                        case 'rotation':
                            return targetEntity.getRotation();
                        case 'direction':
                            return targetEntity.getDirection();
                        case 'picture_index': {
                            const object = targetEntity.parent;
                            const pictures = object.pictures;
                            return pictures.indexOf(targetEntity.picture) + 1;
                        }
                        case 'size':
                            return Number(targetEntity.getSize().toFixed(1));
                        case 'picture_name': {
                            const object = targetEntity.parent;
                            const pictures = object.pictures;
                            const picture = pictures[pictures.indexOf(targetEntity.picture)];
                            return picture.name;
                        }
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.value_of_object(%2, %4)',
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'spritesWithSelf',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnObjectOrStringValue,
                                    codeMap: 'Entry.CodeMap.Entry.coordinate_object[1]',
                                },
                                undefined,
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.CALC_coordinate_x_value, 'x'],
                                        [Lang.Blocks.CALC_coordinate_y_value, 'y'],
                                        [Lang.Blocks.CALC_coordinate_rotation_value, 'rotation'],
                                        [Lang.Blocks.CALC_coordinate_direction_value, 'direction'],
                                        [Lang.Blocks.CALC_coordinate_size_value, 'size'],
                                        [Lang.Blocks.CALC_picture_index, 'picture_index'],
                                        [Lang.Blocks.CALC_picture_name, 'picture_name'],
                                    ],
                                    value: 'x',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringValue,
                                    codeMap: 'Entry.CodeMap.Entry.coordinate_object[3]',
                                },
                            ],
                        },
                    ],
                },
            },
            quotient_and_mod: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_quotient_and_mod_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_quotient_and_mod_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_quotient_and_mod_3,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.CALC_quotient_and_mod_sub_1, 'QUOTIENT'],
                            [Lang.Blocks.CALC_quotient_and_mod_sub_2, 'MOD'],
                        ],
                        value: 'QUOTIENT',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['10'],
                        },
                        null,
                        {
                            type: 'text',
                            params: ['10'],
                        },
                        null,
                        null,
                    ],
                    type: 'quotient_and_mod',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        null,
                        null,
                    ],
                    type: 'quotient_and_mod',
                },
                paramsKeyMap: {
                    LEFTHAND: 1,
                    RIGHTHAND: 3,
                    OPERATOR: 5,
                },
                class: 'calc',
                isNotFor: [],
                func(sprite, script) {
                    const left = script.getNumberValue('LEFTHAND', script);
                    const right = script.getNumberValue('RIGHTHAND', script);
                    const operator = script.getField('OPERATOR', script);
                    if (operator === 'QUOTIENT') {
                        return Math.floor(left / right);
                    } else {
                        return left - right * Math.floor(left / right);
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '(%2 %6 %4)',
                            template: '%2 %6 %4',
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.CALC_quotient_and_mod_sub_1, 'QUOTIENT'],
                                        [Lang.Blocks.CALC_quotient_and_mod_sub_2, 'MOD'],
                                    ],
                                    value: 'QUOTIENT',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnOperator,
                                },
                            ],
                        },
                    ],
                },
            },
            calc_operation: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_calc_operation_of_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_calc_operation_of_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.CALC_calc_operation_square, 'square'],
                            [Lang.Blocks.CALC_calc_operation_root, 'root'],
                            [Lang.Blocks.CALC_calc_operation_sin, 'sin'],
                            [Lang.Blocks.CALC_calc_operation_cos, 'cos'],
                            [Lang.Blocks.CALC_calc_operation_tan, 'tan'],
                            [Lang.Blocks.CALC_calc_operation_asin, 'asin_radian'],
                            [Lang.Blocks.CALC_calc_operation_acos, 'acos_radian'],
                            [Lang.Blocks.CALC_calc_operation_atan, 'atan_radian'],
                            [Lang.Blocks.CALC_calc_operation_log, 'log'],
                            [Lang.Blocks.CALC_calc_operation_ln, 'ln'],
                            [Lang.Blocks.CALC_calc_operation_unnatural, 'unnatural'],
                            [Lang.Blocks.CALC_calc_operation_floor, 'floor'],
                            [Lang.Blocks.CALC_calc_operation_ceil, 'ceil'],
                            [Lang.Blocks.CALC_calc_operation_round, 'round'],
                            [Lang.Blocks.CALC_calc_operation_factorial, 'factorial'],
                            [Lang.Blocks.CALC_calc_operation_abs, 'abs'],
                        ],
                        value: 'square',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
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
                        null,
                    ],
                    type: 'calc_operation',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                        null,
                    ],
                    type: 'calc_operation',
                },
                paramsKeyMap: {
                    LEFTHAND: 1,
                    VALUE: 3,
                },
                class: 'calc',
                isNotFor: [],
                func(sprite, script) {
                    let value = script.getNumberValue('LEFTHAND', script);
                    let operator = script.getField('VALUE', script);
                    const xRangeCheckList = ['asin_radian', 'acos_radian'];
                    if (xRangeCheckList.indexOf(operator) > -1 && (value > 1 || value < -1)) {
                        throw new Error('x range exceeded');
                    }

                    const needToConvertList = ['sin', 'cos', 'tan'];
                    if (operator.indexOf('_')) {
                        operator = operator.split('_')[0];
                    }

                    if (needToConvertList.indexOf(operator) > -1) {
                        value = Entry.toRadian(value);
                    }

                    let returnVal = 0;
                    switch (operator) {
                        case 'square':
                            returnVal = value * value;
                            break;
                        case 'factorial':
                            returnVal = Entry.factorial(value);
                            break;
                        case 'root':
                            returnVal = Math.sqrt(value);
                            break;
                        case 'log':
                            returnVal = Math.log(value) / Math.LN10;
                            break;
                        case 'ln':
                            returnVal = Math.log(value);
                            break;
                        case 'asin':
                        case 'acos':
                        case 'atan':
                            returnVal = Entry.toDegrees(Math[operator](value));
                            break;
                        case 'unnatural': {
                            returnVal = new BigNumber(value).minus(Math.floor(value));
                            returnVal = returnVal.toNumber();
                            if (value < 0) {
                                returnVal = 1 - returnVal;
                            }
                            break;
                        }
                        default:
                            returnVal = Math[operator](value);
                    }

                    return returnVal;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '(%2 ** 2)',
                            template: '%2 ** 2',
                            params: [null, null, null, 'square'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            // for square
                            syntax: 'math.pow(%2)',
                            params: [null, null, null, 'square'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.sqrt(%2)',
                            params: [null, null, null, 'root'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    isListIndex: true,
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.sin(%2)',
                            params: [null, null, null, 'sin'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.cos(%2)',
                            params: [null, null, null, 'cos'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.tan(%2)',
                            params: [null, null, null, 'tan'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.asin(%2)',
                            params: [null, null, null, 'asin_radian'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.acos(%2)',
                            params: [null, null, null, 'acos_radian'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.atan(%2)',
                            params: [null, null, null, 'atan_radian'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.log10(%2)',
                            params: [null, null, null, 'log'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.log(%2)',
                            params: [null, null, null, 'ln'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: '%2 - math.floor(%2)',
                            params: [null, null, null, 'unnatural'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.floor(%2)',
                            params: [null, null, null, 'floor'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.ceil(%2)',
                            params: [null, null, null, 'ceil'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.round(%2)',
                            params: [null, null, null, 'round'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.factorial(%2)',
                            params: [null, null, null, 'factorial'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                        {
                            syntax: 'math.fabs(%2)',
                            params: [null, null, null, 'abs'],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                null,
                            ],
                        },
                    ],
                },
            },
            get_project_timer_value: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_get_timer_value,
                        color: '#FFF',
                    },
                    {
                        type: 'Text',
                        text: '',
                        color: '#FFF',
                    },
                ],
                events: {
                    viewAdd: [
                        function() {
                            if (Entry.engine) {
                                Entry.engine.showProjectTimer();
                            }
                        },
                    ],
                    viewDestroy: [
                        function(block, notIncludeSelf) {
                            if (Entry.engine) {
                                Entry.engine.hideProjectTimer(block, notIncludeSelf);
                            }
                        },
                    ],
                },
                def: {
                    params: [null, null],
                    type: 'get_project_timer_value',
                },
                class: 'calc_timer',
                isNotFor: [],
                func() {
                    return Entry.engine.projectTimer.getValue();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.value_of_timer()',
                            blockType: 'param',
                        },
                    ],
                },
            },
            choose_project_timer_action: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_choose_project_timer_action_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.CALC_choose_project_timer_action_sub_1, 'START'],
                            [Lang.Blocks.CALC_choose_project_timer_action_sub_2, 'STOP'],
                            [Lang.Blocks.CALC_choose_project_timer_action_sub_3, 'RESET'],
                        ],
                        value: 'START',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_choose_project_timer_action_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/calc_icon.svg',
                        size: 11,
                    },
                ],
                events: {
                    viewAdd: [
                        function() {
                            if (Entry.engine) {
                                Entry.engine.showProjectTimer();
                            }
                        },
                    ],
                    dataDestroy: [
                        function(block) {
                            if (Entry.engine) {
                                Entry.engine.hideProjectTimer(block);
                            }
                        },
                    ],
                },
                def: {
                    params: [null, 'START', null, null],
                    type: 'choose_project_timer_action',
                },
                pyHelpDef: {
                    params: [null, 'A&value', null, null],
                    type: 'choose_project_timer_action',
                },
                paramsKeyMap: {
                    ACTION: 1,
                },
                class: 'calc_timer',
                isNotFor: [],
                func(sprite, script) {
                    const engine = Entry.engine;
                    const timer = engine.projectTimer;
                    const isPaused = timer.isPaused;
                    const isInit = timer.isInit;
                    const currentTime = new Date().getTime();

                    switch (script.getField('ACTION')) {
                        case 'START':
                            if (!isInit) {
                                engine.startProjectTimer();
                            } else if (isInit && isPaused) {
                                if (timer.pauseStart) {
                                    timer.pausedTime += currentTime - timer.pauseStart;
                                }
                                delete timer.pauseStart;
                                timer.isPaused = false;
                            }
                            break;
                        case 'STOP':
                            if (isInit && !isPaused) {
                                timer.isPaused = true;
                                timer.pauseStart = currentTime;
                            }
                            break;
                        case 'RESET':
                            engine.resetTimer();
                            break;
                    }

                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            template: '%1 %2 %3',
                            syntax: 'Entry.timer(%2)',
                            textParams: [
                                {
                                    type: 'Text',
                                    text: 'Entry.timer(',
                                    color: EntryStatic.colorSet.common.WHITE,
                                },
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [
                                            Lang.Blocks.CALC_choose_project_timer_action_sub_1,
                                            'START',
                                        ],
                                        [
                                            Lang.Blocks.CALC_choose_project_timer_action_sub_2,
                                            'STOP',
                                        ],
                                        [
                                            Lang.Blocks.CALC_choose_project_timer_action_sub_3,
                                            'RESET',
                                        ],
                                    ],
                                    value: 'START',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringValueLowerCase,
                                    codeMap: 'Entry.CodeMap.Entry.choose_project_timer_action[1]',
                                },
                                {
                                    type: 'Text',
                                    text: ')',
                                    color: EntryStatic.colorSet.common.WHITE,
                                },
                            ],
                        },
                    ],
                },
            },
            set_visible_project_timer: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_timer_visible_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.CALC_timer_visible_show, 'SHOW'],
                            [Lang.Blocks.CALC_timer_visible_hide, 'HIDE'],
                        ],
                        value: 'SHOW',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_choose_project_timer_action_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/calc_icon.svg',
                        size: 11,
                    },
                ],
                events: {
                    viewAdd: [
                        function() {
                            if (Entry.engine) {
                                Entry.engine.showProjectTimer();
                            }
                        },
                    ],
                    viewDestroy: [
                        function(block, notIncludeSelf) {
                            if (Entry.engine) {
                                Entry.engine.hideProjectTimer(block, notIncludeSelf);
                            }
                        },
                    ],
                },
                def: {
                    params: [null, 'HIDE', null, null],
                    type: 'set_visible_project_timer',
                },
                pyHelpDef: {
                    params: [null, 'A&value', null, null],
                    type: 'set_visible_project_timer',
                },
                paramsKeyMap: {
                    ACTION: 1,
                },
                class: 'calc_timer',
                isNotFor: [],
                func(sprite, script) {
                    const action = script.getField('ACTION');
                    const timer = Entry.engine.projectTimer;
                    if (action === 'SHOW') {
                        timer.setVisible(true);
                    } else {
                        timer.setVisible(false);
                    }

                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            template: '%1 %2 %3',
                            syntax: 'Entry.timer_view(%2)',
                            textParams: [
                                {
                                    type: 'Text',
                                    text: 'Entry.timer_view(',
                                    color: EntryStatic.colorSet.common.WHITE,
                                },
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.CALC_timer_visible_show, 'SHOW'],
                                        [Lang.Blocks.CALC_timer_visible_hide, 'HIDE'],
                                    ],
                                    value: 'SHOW',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringValueLowerCase,
                                    codeMap: 'Entry.CodeMap.Entry.set_visible_project_timer[1]',
                                },
                                {
                                    type: 'Text',
                                    text: ')',
                                    color: EntryStatic.colorSet.common.WHITE,
                                },
                            ],
                        },
                    ],
                },
            },
            get_date: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_get_date_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.CALC_get_date_year, 'YEAR'],
                            [Lang.Blocks.CALC_get_date_month, 'MONTH'],
                            [Lang.Blocks.CALC_get_date_day, 'DAY'],
                            [Lang.Blocks.CALC_get_date_day_of_week, 'DAY_OF_WEEK'],
                            [Lang.Blocks.CALC_get_date_hour, 'HOUR'],
                            [Lang.Blocks.CALC_get_date_minute, 'MINUTE'],
                            [Lang.Blocks.CALC_get_date_second, 'SECOND'],
                        ],
                        value: 'YEAR',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_get_date_2,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [null, 'YEAR', null],
                    type: 'get_date',
                },
                pyHelpDef: {
                    params: [null, 'A&value', null],
                    type: 'get_date',
                },
                paramsKeyMap: {
                    VALUE: 1,
                },
                class: 'calc_date',
                isNotFor: [],
                func(sprite, script) {
                    const operator = script.getField('VALUE', script);
                    const dateTime = new Date();
                    if (operator === 'YEAR') {
                        return dateTime.getFullYear();
                    } else if (operator === 'MONTH') {
                        return dateTime.getMonth() + 1;
                    } else if (operator === 'DAY') {
                        return dateTime.getDate();
                    } else if (operator === 'HOUR') {
                        return dateTime.getHours();
                    } else if (operator === 'MINUTE') {
                        return dateTime.getMinutes();
                    } else if (operator === 'DAY_OF_WEEK') {
                        return dateTime.getDay();
                    } else {
                        return dateTime.getSeconds();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.value_of_current_time(%2)',
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.CALC_get_date_year, 'YEAR'],
                                        [Lang.Blocks.CALC_get_date_month, 'MONTH'],
                                        [Lang.Blocks.CALC_get_date_day, 'DAY'],
                                        [Lang.Blocks.CALC_get_date_hour, 'HOUR'],
                                        [Lang.Blocks.CALC_get_date_minute, 'MINUTE'],
                                        [Lang.Blocks.CALC_get_date_second, 'SECOND'],
                                        [Lang.Blocks.CALC_get_date_day_of_week, 'DAY_OF_WEEK'],
                                    ],
                                    value: 'YEAR',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringValueLowerCase,
                                    codeMap: 'Entry.CodeMap.Entry.get_date[1]',
                                },
                            ],
                        },
                    ],
                },
            },
            distance_something: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_distance_something_1,
                        color: '#FFF',
                    },
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'spritesWithMouse',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_distance_something_2,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [null, null, null],
                    type: 'distance_something',
                },
                pyHelpDef: {
                    params: [null, 'A&value', null],
                    type: 'distance_something',
                },
                paramsKeyMap: {
                    VALUE: 1,
                },
                class: 'calc_distance',
                isNotFor: [],
                func(sprite, script) {
                    const targetId = script.getField('VALUE', script);
                    if (targetId === 'mouse') {
                        const mousePos = Entry.stage.mouseCoordinate;
                        return Math.sqrt(
                            Math.pow(sprite.getX() - mousePos.x, 2) +
                                Math.pow(sprite.getY() - mousePos.y, 2)
                        );
                    } else {
                        const targetEntity = Entry.container.getEntity(targetId);
                        return Math.sqrt(
                            Math.pow(sprite.getX() - targetEntity.getX(), 2) +
                                Math.pow(sprite.getY() - targetEntity.getY(), 2)
                        );
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.value_of_distance_to(%2)',
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'spritesWithMouse',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringKey,
                                    codeMap: 'Entry.CodeMap.Entry.distance_something[1]',
                                },
                            ],
                        },
                    ],
                },
            },
            get_user_name: {
                color: EntryStatic.colorSet.block.default.CALC,
                fontColor: '#FFF',
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                def: {
                    params: [],
                    type: 'get_user_name',
                },
                class: 'calc_user',
                isNotFor: [],
                func() {
                    return window.user ? window.user.username : ' ';
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.value_of_username()',
                            blockType: 'param',
                        },
                    ],
                },
            },
            get_nickname: {
                color: EntryStatic.colorSet.block.default.CALC,
                fontColor: '#FFF',
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                def: {
                    params: [],
                    type: 'get_nickname',
                },
                class: 'calc_user',
                isNotFor: [],
                func() {
                    return window.user ? window.user.nickname : ' ';
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.value_of_nickname()',
                            blockType: 'param',
                        },
                    ],
                },
            },
            length_of_string: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_length_of_string_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_length_of_string_2,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.entry],
                        },
                        null,
                    ],
                    type: 'length_of_string',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'length_of_string',
                },
                paramsKeyMap: {
                    STRING: 1,
                },
                class: 'calc_string',
                isNotFor: [],
                func(sprite, script) {
                    return script.getStringValue('STRING', script).length;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'len(%2)',
                            blockType: 'param',
                            keyOption: 'length_of_string',
                        },
                    ],
                },
            },
            reverse_of_string: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_reverse_of_string_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_reverse_of_string_2,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.entry],
                        },
                        null,
                    ],
                    type: 'reverse_of_string',
                },
                paramsKeyMap: {
                    STRING: 1,
                },
                class: 'calc_string',
                isNotFor: ['python_disable'],
                func(sprite, script) {
                    const originStr = script.getStringValue('STRING', script);
                    const reversedStr = originStr
                        .split('')
                        .reverse()
                        .join('');
                    return reversedStr;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            combine_something: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.VARIABLE_combine_something_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.VARIABLE_combine_something_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.VARIABLE_combine_something_3,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.block_hi],
                        },
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.entry],
                        },
                        null,
                    ],
                    type: 'combine_something',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'combine_something',
                },
                paramsKeyMap: {
                    VALUE1: 1,
                    VALUE2: 3,
                },
                class: 'calc_string',
                isNotFor: [],
                func(sprite, script) {
                    const leftValue = script.getStringValue('VALUE1', script);
                    const rightValue = script.getStringValue('VALUE2', script);

                    return `${leftValue}${rightValue}`;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '(%2 + %4)',
                            template: '%2 + %4',
                            blockType: 'param',
                        },
                    ],
                },
            },
            char_at: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_char_at_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_char_at_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        isListIndex: true,
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_char_at_3,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.hi_entry],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['1'],
                        },
                        null,
                    ],
                    type: 'char_at',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'char_at',
                },
                paramsKeyMap: {
                    LEFTHAND: 1,
                    RIGHTHAND: 3,
                },
                class: 'calc_string',
                isNotFor: [],
                func(sprite, script) {
                    const str = script.getStringValue('LEFTHAND', script);
                    const index = script.getNumberValue('RIGHTHAND', script) - 1;
                    if (index < 0 || index > str.length - 1) {
                        throw new Error();
                    } else {
                        return str[index];
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%2[%4]',
                            blockType: 'param',
                            textParams: [
                                {
                                    type: 'Text',
                                    text: Lang.Blocks.CALC_char_at_1,
                                    color: '#FFF',
                                },
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                {
                                    type: 'Text',
                                    text: Lang.Blocks.CALC_char_at_2,
                                    color: '#FFF',
                                },
                                {
                                    type: 'Block',
                                    accept: 'string',
                                    paramType: 'index',
                                },
                                {
                                    type: 'Text',
                                    text: Lang.Blocks.CALC_char_at_3,
                                    color: '#FFF',
                                },
                            ],
                            keyOption: 'char_at',
                        },
                    ],
                },
            },
            substring: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_substring_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_substring_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        isListIndex: true,
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_substring_3,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_substring_4,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.hi_entry],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['2'],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['5'],
                        },
                        null,
                    ],
                    type: 'substring',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                        {
                            type: 'number',
                            params: ['C&value'],
                        },
                        null,
                    ],
                    type: 'substring',
                },
                paramsKeyMap: {
                    STRING: 1,
                    START: 3,
                    END: 5,
                },
                class: 'calc_string',
                isNotFor: [],
                func(sprite, script) {
                    const str = script.getStringValue('STRING', script);
                    const start = script.getNumberValue('START', script) - 1;
                    const end = script.getNumberValue('END', script) - 1;
                    const strLen = str.length - 1;
                    if (start < 0 || end < 0 || start > strLen || end > strLen) {
                        throw new Error();
                    } else {
                        return str.substring(Math.min(start, end), Math.max(start, end) + 1);
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%2[%4:%6]',
                            blockType: 'param',
                            textParams: [
                                null,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                null,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                    paramType: 'index',
                                },
                                null,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                null,
                            ],
                        },
                    ],
                },
            },
            count_match_string: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_count_match_string_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_count_match_string_2,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: [Lang.Blocks.hi_entry_en],
                        },
                        null,
                        {
                            type: 'text',
                            params: ['e'],
                        },
                        null,
                    ],
                    type: 'count_match_string',
                },
                paramsKeyMap: {
                    STRING: 0,
                    TARGET: 2,
                },
                class: 'calc_string',
                isNotFor: ['python_disable'],
                func(sprite, script) {
                    const originStr = script.getStringValue('STRING', script);
                    const targetStr = script.getStringValue('TARGET', script);

                    let count = 0;
                    const substrLength = targetStr.length;
                    for (let i = 0; i <= originStr.length - substrLength; i++) {
                        if (originStr.substring(i, i + substrLength) === targetStr) {
                            count++;
                        }
                    }
                    return count;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            index_of_string: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_index_of_string_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_index_of_string_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_index_of_string_3,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.hi_entry],
                        },
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.entry],
                        },
                        null,
                    ],
                    type: 'index_of_string',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'index_of_string',
                },
                paramsKeyMap: {
                    LEFTHAND: 1,
                    RIGHTHAND: 3,
                },
                class: 'calc_string',
                isNotFor: [],
                func(sprite, script) {
                    const str = script.getStringValue('LEFTHAND', script);
                    const target = script.getStringValue('RIGHTHAND', script);
                    const index = str.indexOf(target);
                    return index + 1;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%2.find(%4)',
                            blockType: 'param',
                        },
                    ],
                },
            },
            replace_string: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_replace_string_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_replace_string_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_replace_string_3,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_replace_string_4,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.hi_entry],
                        },
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.hello],
                        },
                        null,
                        {
                            type: 'text',
                            params: [Lang.Blocks.nice],
                        },
                        null,
                    ],
                    type: 'replace_string',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        null,
                        {
                            type: 'text',
                            params: ['C&value'],
                        },
                        null,
                    ],
                    type: 'replace_string',
                },
                paramsKeyMap: {
                    STRING: 1,
                    OLD_WORD: 3,
                    NEW_WORD: 5,
                },
                class: 'calc_string',
                isNotFor: [],
                func(sprite, script) {
                    const oldWord = script
                        .getStringValue('OLD_WORD', script)
                        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    return script
                        .getStringValue('STRING', script)
                        .replace(
                            new RegExp(oldWord, 'gm'),
                            script.getStringValue('NEW_WORD', script)
                        );
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%2.replace(%4, %6)',
                            blockType: 'param',
                        },
                    ],
                },
            },
            change_string_case: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_change_string_case_1,
                        color: '#FFF',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_change_string_case_2,
                        color: '#FFF',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.CALC_change_string_case_sub_1, 'toUpperCase'],
                            [Lang.Blocks.CALC_change_string_case_sub_2, 'toLowerCase'],
                        ],
                        value: 'toUpperCase',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Text',
                        text: Lang.Blocks.CALC_change_string_case_3,
                        color: '#FFF',
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['Hello Entry!'],
                        },
                        null,
                        null,
                        null,
                    ],
                    type: 'change_string_case',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                        null,
                        null,
                    ],
                    type: 'change_string_case',
                },
                paramsKeyMap: {
                    STRING: 1,
                    CASE: 3,
                },
                class: 'calc_string',
                isNotFor: [],
                func(sprite, script) {
                    return script
                        .getStringValue('STRING', script)
                        [script.getField('CASE', script)]();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: '%2.upper()',
                            params: [null, null, null, 'toUpperCase', null],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.CALC_change_string_case_sub_1, 'toUpperCase'],
                                        [Lang.Blocks.CALC_change_string_case_sub_2, 'toLowerCase'],
                                    ],
                                    value: 'toUpperCase',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringValue,
                                },
                            ],
                        },
                        {
                            syntax: '%2.lower()',
                            params: [null, null, null, 'toLowerCase', null],
                            blockType: 'param',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                undefined,
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.CALC_change_string_case_sub_1, 'toUpperCase'],
                                        [Lang.Blocks.CALC_change_string_case_sub_2, 'toLowerCase'],
                                    ],
                                    value: 'toUpperCase',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.CALC,
                                    converter: Entry.block.converters.returnStringValue,
                                },
                            ],
                        },
                    ],
                },
            },
            get_block_count: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'blockCount',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'get_block_count',
                },
                pyHelpDef: {
                    params: ['A&value'],
                    type: 'get_block_count',
                },
                paramsKeyMap: {
                    OBJECT: 0,
                },
                class: 'block',
                isNotFor: [],
                async func(sprite, script) {
                    const objectKey = script.getField('OBJECT', script);
                    if (!objectKey) {
                        return 0;
                    }
                    let object;
                    if (objectKey.indexOf('scene-') === 0) {
                        const blocks = await Entry.Utils.getObjectsBlocksBySceneId(
                            objectKey.substr(6)
                        );
                        return _get(blocks, 'length', 0);
                    } else if (objectKey === 'all') {
                        object = undefined;
                    } else if (objectKey === 'self') {
                        object = sprite.parent;
                    } else if (objectKey.indexOf('object-') === 0) {
                        object = Entry.container.getObject(objectKey.substr(7));
                    } else {
                        return 0;
                    }

                    const blocks = await Entry.Utils.getObjectsBlocksForEventThread(object);
                    const count = _get(blocks, 'length', 0);
                    return count;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.get_block_count(%1)',
                            blockType: 'param',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'blockCount',
                                    fontSize: 11,
                                    textColor: '#fff',
                                    arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                                    converter: Entry.block.converters.returnStringValue,
                                    codeMap: 'Entry.CodeMap.Entry.get_block_count[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            change_rgb_to_hex: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['255'],
                        },
                        {
                            type: 'number',
                            params: ['0'],
                        },
                        {
                            type: 'number',
                            params: ['0'],
                        },
                    ],
                    type: 'change_rgb_to_hex',
                },
                paramsKeyMap: {
                    RED: 0,
                    GREEN: 1,
                    BLUE: 2,
                },
                class: 'color',
                isNotFor: [],
                func(sprite, script) {
                    const red = script.getNumberValue('RED', script);
                    const greeb = script.getNumberValue('GREEN', script);
                    const blue = script.getNumberValue('BLUE', script);
                    return Entry.rgb2hex(red, greeb, blue);
                },
            },
            change_hex_to_rgb: {
                color: EntryStatic.colorSet.block.default.CALC,
                outerLine: EntryStatic.colorSet.block.darken.CALC,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Dropdown',
                        options: [['R', 'r'], ['G', 'g'], ['B', 'b']],
                        value: 'RED',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.CALC,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['#ff0000'],
                        },
                        'r',
                    ],
                    type: 'change_hex_to_rgb',
                },
                paramsKeyMap: {
                    HEX: 0,
                    COLOR: 1,
                },
                class: 'color',
                isNotFor: [],
                func(sprite, script) {
                    const color = script.getField('COLOR', script);
                    const value = script.getValue('HEX', script);
                    return Entry.hex2rgb(value)[color];
                },
            },
        };
    },
};
