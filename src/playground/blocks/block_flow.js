module.exports = {
    getBlocks() {
        return {
            wait_second: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
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
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['2'],
                        },
                        null,
                    ],
                    type: 'wait_second',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'wait_second',
                },
                paramsKeyMap: {
                    SECOND: 0,
                },
                class: 'delay',
                isNotFor: [],
                func(sprite, script) {
                    if (!script.isStart) {
                        script.isStart = true;
                        script.timeFlag = 1;
                        let timeValue = script.getNumberValue('SECOND', script);
                        const fps = Entry.FPS || 60;
                        timeValue = (60 / fps) * timeValue * 1000;

                        const blockId = script.block.id;
                        Entry.TimeWaitManager.add(
                            blockId,
                            () => {
                                script.timeFlag = 0;
                            },
                            timeValue
                        );

                        return script;
                    } else if (script.timeFlag == 1) {
                        return script;
                    } else {
                        delete script.timeFlag;
                        delete script.isStart;
                        Entry.engine.isContinue = false;
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.wait_for_sec(%1)',
                        },
                    ],
                },
            },
            repeat_basic: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
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
                    type: 'repeat_basic',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'repeat_basic',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                statementsKeyMap: {
                    DO: 0,
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    if (!script.isLooped) {
                        const iterNumber = script.getNumberValue('VALUE', script);
                        script.isLooped = true;
                        if (iterNumber < 0) {
                            throw new Error(Lang.Blocks.FLOW_repeat_basic_errorMsg);
                        }
                        script.iterCount = Math.floor(iterNumber);
                    }
                    if (script.iterCount !== 0 && !(script.iterCount < 0)) {
                        script.iterCount--;
                        return script.getStatement('DO', script);
                    } else {
                        delete script.isLooped;
                        delete script.iterCount;
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'for i in range(%1):\n$1',
                            template: 'for i in range(%1):',
                            idChar: ['i', 'j', 'k'],
                        },
                    ],
                },
            },
            repeat_inf: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                    {
                        type: 'Block',
                        accept: 'Boolean',
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'repeat_inf',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                    ],
                    type: 'repeat_inf',
                },
                statementsKeyMap: {
                    DO: 0,
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    script.isLooped = true;
                    return script.getStatement('DO');
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'while True:\n$1',
                            template: 'while %2\n:',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'boolean',
                                },
                            ],
                        },
                    ],
                },
            },
            repeat_while_true: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.FLOW_repeat_while_true_until, 'until'],
                            [Lang.Blocks.FLOW_repeat_while_true_while, 'while'],
                        ],
                        value: 'until',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.FLOW,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                        null,
                    ],
                    type: 'repeat_while_true',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                        null,
                    ],
                    type: 'repeat_while_true',
                },
                paramsKeyMap: {
                    BOOL: 0,
                    OPTION: 1,
                },
                statementsKeyMap: {
                    DO: 0,
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    let value = script.getBooleanValue('BOOL', script);

                    if (script.getField('OPTION', script) === 'until') {
                        value = !value;
                    }
                    script.isLooped = value;

                    return value ? script.getStatement('DO', script) : script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'while %1 %2:\n$1',
                            template: 'while not %1:',
                        },
                    ],
                },
            },
            stop_repeat: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'stop_repeat',
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    return this.executor.breakLoop();
                },
                syntax: { js: [], py: ['break'] },
            },
            _if: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                    ],
                    type: '_if',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                    ],
                    type: '_if',
                },
                paramsKeyMap: {
                    BOOL: 0,
                },
                statementsKeyMap: {
                    STACK: 0,
                },
                class: 'condition',
                isNotFor: [],
                func(sprite, script) {
                    if (script.isCondition) {
                        delete script.isCondition;
                        return script.callReturn();
                    }
                    const value = script.getBooleanValue('BOOL', script);
                    if (value) {
                        script.isCondition = true;
                        return script.getStatement('STACK', script);
                    } else {
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [{ syntax: 'if %1:\n$1', template: 'if %1:' }],
                },
            },
            if_else: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_double_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                    {
                        type: 'LineBreak',
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                    ],
                    type: 'if_else',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                    ],
                    type: 'if_else',
                },
                paramsKeyMap: {
                    BOOL: 0,
                },
                statementsKeyMap: {
                    STACK_IF: 0,
                    STACK_ELSE: 1,
                },
                class: 'condition',
                isNotFor: [],
                func(sprite, script) {
                    if (script.isCondition) {
                        delete script.isCondition;
                        return script.callReturn();
                    }
                    const value = script.getBooleanValue('BOOL', script);
                    script.isCondition = true;
                    if (value) {
                        return script.getStatement('STACK_IF', script);
                    } else {
                        return script.getStatement('STACK_ELSE', script);
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'if %1:\n$1\nelse:\n$2',
                            template: 'if %1: %3 else:',
                            textParams: [
                                {
                                    type: 'Block',
                                    accept: 'boolean',
                                },
                                undefined,
                                {
                                    type: 'LineBreak',
                                },
                            ],
                        },
                    ],
                },
            },
            wait_until_true: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                    ],
                    type: 'wait_until_true',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                    ],
                    type: 'wait_until_true',
                },
                paramsKeyMap: {
                    BOOL: 0,
                },
                class: 'wait',
                isNotFor: [],
                func(sprite, script) {
                    const value = script.getBooleanValue('BOOL', script);
                    if (value) {
                        return script.callReturn();
                    } else {
                        return script;
                    }
                },
                syntax: { js: [], py: ['Entry.wait_until(%1)'] },
            },
            stop_object: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.FLOW_stop_object_all, 'all'],
                            [Lang.Blocks.FLOW_stop_object_this_object, 'thisOnly'],
                            [Lang.Blocks.FLOW_stop_object_this_thread, 'thisThread'],
                            [Lang.Blocks.FLOW_stop_object_other_thread, 'otherThread'],
                            [Lang.Blocks.FLOW_stop_object_other_objects, 'other_objects'],
                        ],
                        value: 'all',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.FLOW,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'stop_object',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'stop_object',
                },
                paramsKeyMap: {
                    TARGET: 0,
                },
                class: 'terminate',
                isNotFor: [],
                func(sprite, script) {
                    const object = sprite.parent;

                    switch (script.getField('TARGET', script)) {
                        case 'all':
                            Entry.container.mapObject(function(obj) {
                                if (!obj.objectType) {
                                    return;
                                }

                                obj.script.clearExecutors();
                            });
                            return this.die();
                        case 'thisOnly':
                            object.script.clearExecutorsByEntity(sprite);
                            return this.die();
                        case 'thisObject':
                            object.script.clearExecutors();
                            return this.die();
                        case 'thisThread':
                            return this.die();
                        case 'otherThread': {
                            const executor = this.executor;
                            const code = object.script;
                            const executors = code.executors;
                            const spriteId = sprite.id;
                            for (let i = 0; i < executors.length; i++) {
                                const currentExecutor = executors[i];
                                if (
                                    currentExecutor !== executor &&
                                    currentExecutor.entity.id === spriteId
                                ) {
                                    code.removeExecutor(currentExecutor);
                                    --i;
                                }
                            }
                            return script.callReturn();
                        }
                        case 'other_objects':
                            Entry.container.mapObject(function(obj) {
                                if (!obj.objectType || obj === object) {
                                    return;
                                }

                                obj.script.clearExecutors();
                            });
                            return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.stop_code(%1)',
                            textParams: [
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.FLOW_stop_object_all, 'all'],
                                        [Lang.Blocks.FLOW_stop_object_this_object, 'thisOnly'],
                                        [Lang.Blocks.FLOW_stop_object_this_thread, 'thisThread'],
                                        [Lang.Blocks.FLOW_stop_object_other_thread, 'otherThread'],
                                        [
                                            Lang.Blocks.FLOW_stop_object_other_objects,
                                            'other_objects',
                                        ],
                                    ],
                                    value: 'all',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.FLOW,
                                    converter: Entry.block.converters.returnStringValue,
                                    codeMap: 'Entry.CodeMap.Entry.stop_object[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            restart_project: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_without_next',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'restart_project',
                },
                class: 'terminate',
                isNotFor: [],
                func(sprite, script) {
                    Entry.engine.toggleStop().then(() => {
                        Entry.engine.toggleRun();
                    });
                },
                syntax: { js: [], py: ['Entry.start_again()'] },
            },
            when_clone_start: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_clone.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'when_clone_start',
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'when_clone_start',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_make_clone():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            create_clone: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'clone',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: EntryStatic.colorSet.block.darken.FLOW,
                        arrowColor: EntryStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'create_clone',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'create_clone',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    const targetSpriteId = script.getField('VALUE', script);
                    const returnBlock = script.callReturn();
                    if (targetSpriteId === 'self') {
                        sprite.parent.addCloneEntity(sprite.parent, sprite, null);
                    } else {
                        const object = Entry.container.getObject(targetSpriteId);
                        object.addCloneEntity(sprite.parent, null, null);
                    }
                    return returnBlock;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.make_clone_of(%1)',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'clone',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.FLOW,
                                    converter: Entry.block.converters.returnStringKey,
                                    codeMap: 'Entry.CodeMap.Entry.create_clone[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            delete_clone: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_without_next',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'delete_clone',
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    if (!sprite.isClone) {
                        return script.callReturn();
                    }
                    sprite.removeClone();
                    return this.die();
                },
                syntax: { js: [], py: ['Entry.remove_this_clone()'] },
            },
            remove_all_clones: {
                color: EntryStatic.colorSet.block.default.FLOW,
                outerLine: EntryStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'remove_all_clones',
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    let clonedEntities = sprite.parent.getClonedEntities();
                    clonedEntities.map(function(entity) {
                        entity.removeClone();
                    });
                    clonedEntities = null;

                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.remove_all_clone()'] },
            },
        };
    },
};
