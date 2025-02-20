'use strict';

import _find from 'lodash/find';
import _includes from 'lodash/includes';

Entry.STATEMENT = 0;
Entry.PARAM = -1;
Entry.Code = class Code {
    schema = {
        view: null,
        board: null,
    };

    constructor(code, object) {
        Entry.Model(this, false);
        this.id = Entry.generateHash();
        if (object) {
            this.object = object;
        }

        this._data = new Entry.Collection();

        this._eventMap = {};
        this._blockMap = {};

        this.executors = [];
        this.watchEvent = new Entry.Event(this);
        this.executeEndEvent = new Entry.Event(this);
        this.changeEvent = new Entry.Event(this);
        this.changeEvent.attach(this, this._handleChange);

        this._maxZIndex = 0;

        this.load(code);
    }

    load(code) {
        if (Entry.engine && Entry.engine.isState('run')) {
            return;
        }

        this.clear();

        const parseCode = Array.isArray(code) ? code : JSON.parse(code);
        parseCode.forEach((t) => {
            if (Array.isArray(t) && t.length > 1 && t?.[0].type === 'function_create') {
                if (!t[0].statements) {
                    t[0].statements = [];
                }
                t[0].statements.push(t.splice(1, t.length));
            }

            const thread = new Entry.Thread(t, this);
            if (thread.hasData()) {
                this._data.push(thread);
            }
        });

        return this;
    }

    clear(isNotForce = false) {
        for (let i = this._data.length - 1; i >= 0; i--) {
            this._data[i].destroy(false, isNotForce);
        }

        this.clearExecutors();
    }

    createView(board) {
        if (this.view === null) {
            this.set({
                view: new Entry.CodeView(this, board),
                board,
            });
        } else {
            this.set({ board });
            board.bindCodeView(this.view);
        }
    }

    destroyView() {
        if (!this.view) {
            return;
        }
        this.view.destroy();
        this.set({ view: null });
    }

    recreateView() {
        if (!this.view) {
            return;
        }
        this.destroyView();
        this.set({
            view: new Entry.CodeView(this, this.board),
            board: this.board,
        });
    }

    registerEvent(block, eventType) {
        const eventMap = this._eventMap;
        if (!eventMap[eventType]) {
            eventMap[eventType] = [];
        }

        eventMap[eventType].push(block);
    }

    unregisterEvent(block, eventType) {
        const blocks = this._eventMap[eventType];
        if (_.isEmpty(blocks)) {
            return;
        }

        const index = blocks.indexOf(block);
        if (index < 0) {
            return;
        }
        blocks.splice(index, 1);
    }

    raiseEvent(eventType, entity, value) {
        const blocks = this._eventMap[eventType];
        if (blocks === undefined) {
            return;
        }

        const executors = [];

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const pointer = block.pointer();
            if (pointer[3] !== 0 || pointer.length !== 4) {
                continue;
            }
            if (value === undefined || block.params.indexOf(value) > -1) {
                const executor = new Entry.Executor(blocks[i], entity, this);
                this.executors.push(executor);
                executors.push(executor);
            }
        }
        return executors;
    }

    getEventMap(eventType) {
        return this._eventMap[eventType];
    }

    map(func) {
        this._data.map(func);
    }

    tick() {
        if (Entry.isTurbo && !this.isUpdateTime) {
            this.isUpdateTime = performance.now();
        }
        const executors = this.executors;
        const watchEvent = this.watchEvent;
        const shouldNotifyWatch = watchEvent.hasListeners();
        let result;
        let executedBlocks = [];
        const loopExecutor = [];

        const _executeEvent = _.partial(Entry.dispatchEvent, 'blockExecute');
        const _executeEndEvent = _.partial(Entry.dispatchEvent, 'blockExecuteEnd');

        for (let i = 0; i < executors.length; i++) {
            const executor = executors[i];
            if (executor.isPause()) {
                continue;
            } else if (!executor.isEnd()) {
                const { view } = executor.scope.block || {};
                _executeEvent(view);
                result = executor.execute(true);
                if (executor.isLooped) {
                    loopExecutor.push(executor);
                }
                if (shouldNotifyWatch) {
                    const { blocks } = result;
                    executedBlocks = executedBlocks.concat(blocks);
                }
            } else if (executor.isEnd()) {
                _executeEndEvent(this.board);
                executors.splice(i--, 1);
                if (_.isEmpty(executors)) {
                    this.executeEndEvent.notify();
                }
            }
        }

        if (Entry.isTurbo) {
            for (let i = 0; i < loopExecutor.length; i++) {
                const executor = loopExecutor[i];
                if (executor.isPause()) {
                    continue;
                } else if (!executor.isEnd()) {
                    const { view } = executor.scope.block || {};
                    _executeEvent(view);
                    result = executor.execute(true);
                    if (shouldNotifyWatch) {
                        const { blocks } = result;
                        executedBlocks = executedBlocks.concat(blocks);
                    }
                } else if (executor.isEnd()) {
                    _executeEndEvent(this.board);
                    loopExecutor.splice(i--, 1);
                    if (_.isEmpty(loopExecutor)) {
                        this.executeEndEvent.notify();
                    }
                }

                if (
                    i === loopExecutor.length - 1 &&
                    Entry.tickTime > performance.now() - this.isUpdateTime
                ) {
                    i = -1;
                }
            }
        }

        this.isUpdateTime = 0;
        shouldNotifyWatch && watchEvent.notify(executedBlocks);
        if (result && result.promises) {
            Entry.engine.addPromiseExecutor(result.promises);
        }
    }

    removeExecutor(executor) {
        const index = this.executors.indexOf(executor);
        if (index > -1) {
            this.executors.splice(index, 1);
        }
    }

    clearExecutors() {
        this.executors.forEach((e) => e.end());
        Entry.dispatchEvent('blockExecuteEnd');
        this.executors = [];
    }

    clearExecutorsByEntity(entity) {
        this.executors.forEach((executor) => {
            if (executor.entity === entity) {
                executor.end();
            }
        });
    }

    addExecutor(executor) {
        this.executors.push(executor);
    }

    createThread(blocks, index) {
        if (!Array.isArray(blocks)) {
            return console.error('blocks must be array');
        }

        const thread = new Entry.Thread(blocks, this);
        if (index === undefined || index === null) {
            this._data.push(thread);
        } else {
            this._data.insert(thread, index);
        }

        this.changeEvent.notify();
        return thread;
    }

    getThreadIndex(thread) {
        return this._data.indexOf(thread);
    }

    getThreadCount() {
        return this._data.length;
    }

    cloneThread(thread, mode) {
        const newThread = thread.clone(this, mode);
        this._data.push(newThread);
        return newThread;
    }

    destroyThread(thread) {
        const data = this._data;
        const index = data.indexOf(thread);
        // case of statement thread
        if (~index) {
            data.splice(index, 1);
        }
    }

    pushBackThread(thread) {
        this._data.splice(this.getThreadIndex(thread), 1);
        this._data.push(thread);
    }

    doDestroyThread = this.destroyThread;

    getThread(index) {
        return this._data[index];
    }

    getThreads() {
        return this._data.slice();
    }

    getThreadsByCategory(categoryName) {
        if (!categoryName) {
            return [];
        }

        return this.getThreads().filter(
            (t) => _.result(t.getFirstBlock(), 'category') === categoryName
        );
    }

    toJSON(excludeData, option) {
        const params = [false, undefined, excludeData, option];
        return this.getThreads().map((t) => t.toJSON(...params));
    }

    countBlock() {
        return this.getThreads().reduce((cnt, thread) => cnt + thread.countBlock(), 0);
    }

    moveBy(x, y) {
        this.getThreads().forEach((thread) => {
            const { view = {} } = thread.getFirstBlock() || {};
            if (view && view.display) {
                view.moveBy(x, y, false);
            }
        });
        const { board } = this;
        if (board instanceof Entry.BlockMenu) {
            board.updateSplitters(y);
        }
    }

    stringify(excludeData) {
        return JSON.stringify(this.toJSON(excludeData));
    }

    dominate(thread) {
        thread.view.setZIndex(this._maxZIndex++);
    }

    getMaxZIndex() {
        return this._maxZIndex;
    }

    indexOf(thread) {
        return this._data.indexOf(thread);
    }

    _handleChange() {
        const board = _.result(this.view, 'board');
        const event = Entry.creationChangedEvent;
        if (board && event && board.constructor !== Entry.BlockMenu) {
            event.notify();
            if (Entry.codeChangedEvent) {
                Entry.codeChangedEvent.notify();
            }
        }
    }

    hasBlockType(type) {
        return this.getThreads().some((thread) => thread.hasBlockType(type));
    }

    findById(id) {
        return this._blockMap[id];
    }

    findByType(type) {
        const id = Object.keys(this._blockMap).find((id) => {
            const block = this._blockMap[id];
            return block.type === type;
        });
        return this._blockMap[id];
    }

    findByParamId(paramId) {
        return _find(this._blockMap, (block) => _includes(block?.params || [], paramId));
    }

    registerBlock(block) {
        this._blockMap[block.id] = block;
    }

    unregisterBlock({ id }) {
        delete this._blockMap[id];
    }

    getByPointer([, , ...pointer]) {
        const thread = this._data[pointer.shift()];
        let block = thread.getBlock(pointer.shift());
        while (pointer.length) {
            if (!(block instanceof Entry.Block)) {
                if (!block || !block.getValueBlock) {
                    console.error("can't get valueBlock", block);
                    return block;
                }
                block = block.getValueBlock();
            }
            const type = pointer.shift();
            const index = pointer.shift();
            if (type > -1) {
                const statement = block.statements[type];
                if (index === undefined) {
                    return statement;
                } else {
                    block = statement.getBlock(index);
                }
            } else if (type === -1) {
                block = block.view.getParam(index);
            }
        }
        return block;
    }

    getTargetByPointer([, , ...pointer]) {
        const thread = this._data[pointer.shift()];
        let block;

        if (pointer.length === 1) {
            block = thread.getBlock(pointer.shift() - 1);
        } else {
            block = thread.getBlock(pointer.shift());
            while (pointer.length) {
                if (!(block instanceof Entry.Block)) {
                    block = block.getValueBlock();
                }
                const type = pointer.shift();
                const index = pointer.shift();
                if (type > -1) {
                    const statement = block.statements[type];
                    if (!pointer.length) {
                        if (index === 0) {
                            block = statement.view.getParent();
                        } else if (index === undefined) {
                            block = statement;
                        } else {
                            block = statement.getBlock(index - 1);
                        }
                    } else {
                        if (index < 0) {
                            block = statement;
                        } else {
                            block = statement.getBlock(index);
                        }
                    }
                } else if (type === -1) {
                    block = block.view.getParam(index);
                }
            }
        }
        return block;
    }

    getBlockList(excludePrimitive, type) {
        return _.chain(this.getThreads())
            .map((t) => t.getBlockList(excludePrimitive, type))
            .flatten(true)
            .value();
    }

    getBlockListForEventThread(excludePrimitive, type) {
        return _.chain(this.getThreads())
            .map((t) => {
                if (t._event) {
                    return t.getBlockList(excludePrimitive, type);
                }
                return [];
            })
            .flatten(true)
            .value();
    }

    removeBlocksByType(type) {
        this.getBlockList(false, type).forEach((b) => b.doDestroy());
    }

    isAllThreadsInOrigin() {
        return this.getThreads().every((thread) => thread.isInOrigin());
    }

    destroy() {
        this.clear();
        this.destroyView();
    }

    static waitPauseState = async () => {
        while (Entry.engine.isState('pause')) {
            await Entry.Utils.sleep(100);
        }
    };

    static funcAsyncExecute = async (funcCode, funcExecutor, _promises = []) => {
        await Promise.all(_promises);
        if (Entry.engine.isState('pause')) {
            await this.waitPauseState();
            return this.funcAsyncExecute(funcCode, funcExecutor, _promises);
        } else if (!Entry.engine.isState('run')) {
            funcCode.removeExecutor(funcExecutor);
            return Entry.STATIC.BREAK;
        }

        return new Promise((resolve, reject) => {
            requestAnimationFrame(async () => {
                const result = funcExecutor.execute();
                const { promises = [] } = result || {};

                if (!funcExecutor.isEnd()) {
                    if (promises.length) {
                        try {
                            return resolve(
                                await this.funcAsyncExecute(funcCode, funcExecutor, promises)
                            );
                        } catch (e) {
                            return reject(e);
                        }
                    } else {
                        funcCode.callStackLength--;
                        funcCode.removeExecutor(funcExecutor);
                        return resolve(Entry.STATIC.CONTINUE);
                    }
                }
                return resolve();
            });
        });
    };

    static getAsyncParamsData = async (scope) => {
        const values = scope.getParams();
        const isPromise = values.some((value) => value instanceof Promise);
        if (!isPromise) {
            scope.values = values;
        } else {
            scope.values = await Promise.all(values);
        }
        return scope.getValue('VALUE', scope);
    };

    static funcValueAsyncExecute = async (funcCode, funcExecutor, _promises = []) => {
        await Promise.all(_promises);
        if (Entry.engine.isState('pause')) {
            await this.waitPauseState();
            return this.funcValueAsyncExecute(funcCode, funcExecutor, _promises);
        } else if (!Entry.engine.isState('run')) {
            funcCode.removeExecutor(funcExecutor);
            return await this.getAsyncParamsData(funcExecutor.result);
        }

        return new Promise((resolve, reject) => {
            requestAnimationFrame(async () => {
                try {
                    const result = funcExecutor.execute();
                    const { promises = [] } = result || {};

                    if (!funcExecutor.isEnd()) {
                        if (promises.length) {
                            try {
                                return resolve(
                                    await this.funcValueAsyncExecute(
                                        funcCode,
                                        funcExecutor,
                                        promises
                                    )
                                );
                            } catch (e) {
                                return reject(e);
                            }
                        } else {
                            funcCode.callStackLength--;
                            funcCode.removeExecutor(funcExecutor);
                        }
                    }
                    resolve(await this.getAsyncParamsData(funcExecutor.result));
                } catch (e) {
                    reject(e);
                }
            });
        });
    };

    static funcRestExecute = async (funcCode, funcExecutor) => {
        if (!Entry.engine.isState('run')) {
            funcCode.removeExecutor(funcExecutor);
            return await this.getAsyncParamsData(funcExecutor.result);
        }

        return new Promise((resolve, reject) => {
            requestAnimationFrame(async () => {
                try {
                    const result = funcExecutor.execute();
                    const { promises = [] } = result || {};
                    if (!funcExecutor.isEnd()) {
                        if (promises.length) {
                            try {
                                return resolve(
                                    await this.funcValueAsyncExecute(
                                        funcCode,
                                        funcExecutor,
                                        promises
                                    )
                                );
                            } catch (e) {
                                return reject(e);
                            }
                        } else {
                            return resolve(await this.funcRestExecute(funcCode, funcExecutor));
                        }
                    }
                    resolve(await this.getAsyncParamsData(funcExecutor.result));
                    funcCode.removeExecutor(funcExecutor);
                } catch (e) {
                    reject(e);
                }
            });
        });
    };
};
