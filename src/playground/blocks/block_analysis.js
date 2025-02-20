// import _chain from 'lodash/chain';
import _isNumber from 'lodash/isNumber';
import DataTable from '../../class/DataTable';
import { toNumber } from '../../util/common';

module.exports = {
    getBlocks() {
        const getSubMenus = (value) => {
            const { fields = [] } = DataTable.getSource(value) || {};
            return fields.map((label, index) => [label, index + 1]);
        };

        const getColumnNumber = (str) => {
            if (/\d/.test(str)) {
                return -1;
            }
            return (
                // _chain(str)
                // did not work..
                _.chain(str)
                    .toUpper()
                    .reduce((prev, curr) => prev * 26 + curr.charCodeAt() - 64, 0)
                    .value()
            );
        };

        return {
            analizyDataAddButton: {
                skeleton: 'basic_button',
                color: EntryStatic.colorSet.common.BUTTON_BACKGROUND,
                params: [
                    {
                        type: 'Text',
                        text: Lang.Workspace.open_analizy_data_import,
                        color: EntryStatic.colorSet.common.BUTTON,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'analizyDataAddButton',
                },
                events: {
                    mousedown: [
                        function() {
                            Entry.playground.dataTable.show();
                        },
                    ],
                },
                syntax: { js: [], py: [''] },
            },
            append_row_to_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.table_row, 'ROW'],
                            [Lang.Blocks.table_col, 'COL'],
                        ],
                        value: 'ROW',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null, null],
                    type: 'append_row_to_table',
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
                    ],
                    type: 'append_row_to_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    PROPERTY: 1,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                async func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const property = script.getStringValue('PROPERTY', script);
                    const table = DataTable.getSource(tableId, sprite);
                    if (property === 'ROW') {
                        await table.appendRow();
                    } else {
                        await table.appendCol();
                    }
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            insert_row_to_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.table_row, 'ROW'],
                            [Lang.Blocks.table_col, 'COL'],
                        ],
                        value: 'ROW',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['2'],
                        },
                        null,
                        null,
                    ],
                    type: 'insert_row_to_table',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        {
                            type: 'text',
                            params: ['C&value'],
                        },
                        null,
                    ],
                    type: 'insert_row_to_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    NUMBER: 1,
                    PROPERTY: 2,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                async func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const number = script.getNumberValue('NUMBER', script);
                    const property = script.getStringValue('PROPERTY', script);
                    const table = DataTable.getSource(tableId, sprite);
                    if (property === 'ROW') {
                        await table.insertRow(number - 1);
                    } else {
                        await table.insertCol(number);
                    }
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            delete_row_from_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.table_row, 'ROW'],
                            [Lang.Blocks.table_col, 'COL'],
                        ],
                        value: 'ROW',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['2'],
                        },
                        null,
                        null,
                    ],
                    type: 'delete_row_from_table',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        {
                            type: 'text',
                            params: ['C&value'],
                        },
                        null,
                    ],
                    type: 'delete_row_from_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    NUMBER: 1,
                    PROPERTY: 2,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const number = script.getNumberValue('NUMBER', script);
                    const property = script.getStringValue('PROPERTY', script);
                    const table = DataTable.getSource(tableId, sprite);
                    if (property === 'ROW') {
                        table.deleteRow(number - 1);
                    } else {
                        table.deleteCol(number);
                    }
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            set_value_from_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
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
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'text',
                            params: ['2'],
                        },
                        {
                            type: 'get_table_fields',
                        },
                        {
                            type: 'text',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'set_value_from_table',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['D&value'],
                        },
                        {
                            type: 'text',
                            params: ['C&value'],
                        },
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'set_value_from_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    NUMBER: 1,
                    FIELD: 2,
                    VALUE: 3,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const row = script.getNumberValue('NUMBER', script) - 1;
                    const col = DataTable.getColumnIndex(script.getValue('FIELD', script));
                    const value = script.getValue('VALUE', script);
                    const table = DataTable.getSource(tableId, sprite);
                    if (table.isExist([row, col])) {
                        table.replaceValue([row, col], value);
                    }
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            // 테이블 $1의 현재 상태를 저장하기
            save_current_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'save_current_table',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['D&value'],
                        },
                        null,
                    ],
                    type: 'save_current_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const table = DataTable.getSource(tableId);
                    DataTable.saveTable({ selected: table.dataTable });
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            // 테이블 %1 %2 개수
            get_table_count: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.table_row, 'ROW'],
                            [Lang.Blocks.table_col, 'COL'],
                        ],
                        value: 'ROW',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                ],
                events: {},
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['D&value'],
                        },
                        null,
                    ],
                    type: 'get_table_count',
                },
                def: {
                    params: [null, null],
                    type: 'get_table_count',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    PROPERTY: 1,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const property = script.getStringValue('PROPERTY', script);
                    const table = DataTable.getSource(tableId, sprite);
                    if (property === 'ROW') {
                        const { array } = table;
                        return array.length + 1;
                    } else if (property === 'COL') {
                        const labels = table.fields;
                        return labels.length;
                    }
                    return 0;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            // 테이블 %1 행 %2 속성 %3 의 값
            get_value_from_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
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
                        null,
                        {
                            type: 'text',
                            params: ['2'],
                        },
                        {
                            type: 'get_table_fields',
                        },
                    ],
                    type: 'get_value_from_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    ROW: 1,
                    COL: 2,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const row = script.getNumberValue('ROW', script) - 1;
                    const col = DataTable.getColumnIndex(script.getValue('COL', script));
                    const table = DataTable.getSource(tableId, sprite);

                    if (table.isExist([row, col])) {
                        return table.getValue([row, col]);
                    }
                    return null;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_value_from_last_row: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
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
                        null,
                        {
                            type: 'get_table_fields',
                        },
                    ],
                    type: 'get_value_from_last_row',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    COL: 1,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const col = DataTable.getColumnIndex(script.getValue('COL', script));
                    const table = DataTable.getSource(tableId, sprite);
                    const row = table && table.array.length;
                    if (table.isExist([row, col])) {
                        return table.getValue([row, col]);
                    }
                    return null;
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            // 테이블 %1 속성 %1의 합
            calc_values_from_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.table_sum, 'SUM'],
                            [Lang.Blocks.table_max, 'MAX'],
                            [Lang.Blocks.table_min, 'MIN'],
                            [Lang.Blocks.table_avg, 'AVG'],
                            [Lang.Blocks.table_stdev, 'STDEV'],
                            [Lang.Blocks.table_median, 'MEDIAN'],
                        ],
                        value: 'SUM',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'get_table_fields',
                        },
                        null,
                    ],
                    type: 'calc_values_from_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    COL: 1,
                    CALC: 2,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const calc = script.getField('CALC', script);
                    const col = DataTable.getColumnIndex(script.getValue('COL', script));
                    const table = DataTable.getSource(tableId, sprite);
                    const array = table.array.map(({ value = [] }) => {
                        const parsed = toNumber(value[col - 1]);
                        return _isNumber(parsed) ? parsed : 0;
                    });
                    const total = array.length;
                    const sum = (x, y) => x + y;
                    const square = (x) => x * x;
                    if (!total) {
                        return 0;
                    }
                    switch (calc) {
                        case 'SUM':
                            return array.reduce(sum);
                        case 'MAX':
                            return array.reduce((x, y) => Math.max(x, y));
                        case 'MIN':
                            return array.reduce((x, y) => Math.min(x, y));
                        case 'AVG':
                            return array.reduce(sum) / total;
                        case 'STDEV': {
                            const avg = array.reduce(sum) / total;
                            const deviations = array.map((x) => x - avg);
                            return Math.sqrt(deviations.map(square).reduce(sum) / (total - 1));
                        }
                        case 'MEDIAN': {
                            const sorted = array.sort((a, b) => a - b);
                            const n = Math.floor(array.length / 2);
                            return (sorted[n] + sorted[array.length - 1 - n]) / 2;
                        }
                        default:
                            return 0;
                    }
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            // 테이블 %1 창 열기
            open_table: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null, null],
                    type: 'open_table',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value', 'B&value'],
                        },
                        null,
                    ],
                    type: 'open_table',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    CHART_INDEX: 1,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    DataTable.showTable(tableId);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            // 테이블 %1 창을 %2 초 동안 열기
            open_table_wait: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        null,
                        {
                            type: 'number',
                            params: ['4'],
                        },
                        null,
                    ],
                    type: 'open_table_wait',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value', 'B&value'],
                        },
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'open_table_wait',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    SECOND: 1,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const timeValue = script.getNumberValue('SECOND', script);
                    DataTable.showTable(tableId);
                    setTimeout(() => {
                        DataTable.closeModal();
                    }, timeValue * 1000);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            // 테이블 %1 의 %2 차트 창 열기
            open_table_chart: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName() {
                            const value = this.getTargetValue('dataTables');
                            const source = DataTable.getSource(value);
                            const { chart: charts = [] } = source || {};
                            return charts.map(({ title }, index) => [title, index]);
                        },
                        needDeepCopy: true,
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                        defaultValue: (value, options) => {
                            if (options.length) {
                                return options[0][1];
                            }
                            return null;
                        },
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null, null],
                    type: 'open_table_chart',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value', 'B&value'],
                        },
                        null,
                    ],
                    type: 'open_table_chart',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    CHART_INDEX: 1,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const chartIndex = script.getField('CHART_INDEX', script);
                    DataTable.showChart(tableId, chartIndex);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            close_table_chart: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/block_analysis.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'close_table_chart',
                },
                pyHelpDef: {
                    params: [null],
                    type: 'close_table_chart',
                },
                paramsKeyMap: {},
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    DataTable.closeModal();
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            get_coefficient: {
                color: EntryStatic.colorSet.block.default.ANALYSIS,
                outerLine: EntryStatic.colorSet.block.darken.ANALYSIS,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'tables',
                        dropdownSync: 'dataTables',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.ANALYSIS,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
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
                        null,
                        {
                            type: 'get_table_fields',
                        },
                        {
                            type: 'get_table_fields',
                        },
                    ],
                    type: 'get_coefficient',
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
                        {
                            type: 'text',
                            params: ['C&value'],
                        },
                        null,
                    ],
                    type: 'get_coefficient',
                },
                paramsKeyMap: {
                    MATRIX: 0,
                    FIELD1: 1,
                    FIELD2: 2,
                },
                class: 'analysis',
                isNotFor: ['analysis'],
                func(sprite, script) {
                    const tableId = script.getField('MATRIX', script);
                    const x = DataTable.getColumnIndex(script.getValue('FIELD1', script));
                    const y = DataTable.getColumnIndex(script.getValue('FIELD2', script));
                    const table = DataTable.getSource(tableId, sprite);
                    return table.getCoefficient(x - 1, y - 1);
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
        };
    },
};
