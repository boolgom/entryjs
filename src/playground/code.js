/*
 *
 */
'use strict';

/*
 *
 */
Entry.Code = function(code, object) {
    Entry.Model(this, false);

    if (object) this.object = object;

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
};

Entry.STATEMENT = 0;
Entry.PARAM = -1;

(function(p) {
    p.schema = {
        view: null,
        board: null,
    };

    p.load = function(code) {
        if (Entry.engine && Entry.engine.isState('run')) {
            return;
        }

        this.clear();

        (Array.isArray(code) ? code : JSON.parse(code)).forEach((t) =>
            this._data.push(new Entry.Thread(t, this))
        );

        return this;
    };

    p.clear = function(isNotForce = false) {
        for (var i = this._data.length - 1; i >= 0; i--)
            this._data[i].destroy(false, isNotForce);

        this.clearExecutors();
    };

    p.createView = function(board) {
        if (this.view === null) {
            this.set({
                view: new Entry.CodeView(this, board),
                board: board,
            });
        } else {
            this.set({ board: board });
            board.bindCodeView(this.view);
        }
    };

    p.destroyView = function() {
        if (!this.view) return;
        this.view.destroy();
        this.set({ view: null });
    };

    p.recreateView = function() {
        if (!this.view) return;
        this.destroyView();
        this.set({
            view: new Entry.CodeView(this, this.board),
            board: this.board,
        });
    };

    p.registerEvent = function(block, eventType) {
        var eventMap = this._eventMap;
        if (!eventMap[eventType]) {
            eventMap[eventType] = [];
        }

        eventMap[eventType].push(block);
    };

    p.unregisterEvent = function(block, eventType) {
        var blocks = this._eventMap[eventType];
        if (_.isEmpty(blocks)) return;

        var index = blocks.indexOf(block);
        if (index < 0) return;
        blocks.splice(index, 1);
    };

    p.raiseEvent = function(eventType, entity, value) {
        var blocks = this._eventMap[eventType];
        if (blocks === undefined) return;

        var executors = [];

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var pointer = block.pointer();
            if (pointer[3] !== 0 || pointer.length !== 4) continue;
            if (value === undefined || block.params.indexOf(value) > -1) {
                var executor = new Entry.Executor(blocks[i], entity);
                this.executors.push(executor);
                executors.push(executor);
            }
        }
        return executors;
    };

    p.getEventMap = function(eventType) {
        return this._eventMap[eventType];
    };

    p.map = function(func) {
        this._data.map(func);
    };

    p.tick = function() {
        var executors = this.executors;
        var watchEvent = this.watchEvent;
        var shouldNotifyWatch = watchEvent.hasListeners();
        var ret;
        var executedBlocks = [];

        var _executeEvent = _.partial(Entry.dispatchEvent, 'blockExecute');
        var _executeEndEvent = _.partial(
            Entry.dispatchEvent,
            'blockExecuteEnd'
        );

        for (var i = 0; i < executors.length; i++) {
            var executor = executors[i];
            if (!executor.isEnd()) {
                var { view } = executor.scope.block || {};
                _executeEvent(view);
                ret = executor.execute(true);
                if (shouldNotifyWatch)
                    executedBlocks = executedBlocks.concat(ret);
            } else {
                _executeEndEvent(this.board);
                executors.splice(i--, 1);
                if (_.isEmpty(executors)) {
                    this.executeEndEvent.notify();
                }
            }
        }
        shouldNotifyWatch && watchEvent.notify(executedBlocks);
    };

    p.removeExecutor = function(executor) {
        var index = this.executors.indexOf(executor);
        if (index > -1) this.executors.splice(index, 1);
    };

    p.clearExecutors = function() {
        this.executors.forEach((e) => e.end());
        Entry.dispatchEvent('blockExecuteEnd');
        this.executors = [];
    };

    p.clearExecutorsByEntity = function(entity) {
        this.executors.forEach((executor) => {
            if (executor.entity === entity) {
                executor.end();
            }
        });
    };

    p.addExecutor = function(executor) {
        this.executors.push(executor);
    };

    p.createThread = function(blocks, index) {
        if (!Array.isArray(blocks)) {
            return console.error('blocks must be array');
        }

        var thread = new Entry.Thread(blocks, this);
        if (index === undefined || index === null) {
            this._data.push(thread);
        } else {
            this._data.insert(thread, index);
        }

        this.changeEvent.notify();
        return thread;
    };

    p.getThreadIndex = function(thread) {
        return this._data.indexOf(thread);
    };

    p.getThreadCount = function() {
        return this._data.length;
    };

    p.cloneThread = function(thread, mode) {
        var newThread = thread.clone(this, mode);
        this._data.push(newThread);
        return newThread;
    };

    p.destroyThread = function(thread, animate) {
        var data = this._data;
        var index = data.indexOf(thread);
        // case of statement thread
        if (~index) {
            data.splice(index, 1);
        }
    };

    p.doDestroyThread = p.destroyThread;

    p.getThread = function(index) {
        return this._data[index];
    };

    p.getThreads = function() {
        return this._data.slice();
    };

    p.getThreadsByCategory = function(categoryName) {
        if (!categoryName) return [];

        return this.getThreads().filter(
            (t) => _.result(t.getFirstBlock(), 'category') === categoryName
        );
    };

    p.toJSON = function(excludeData, option) {
        var params = [false, undefined, excludeData, option];
        return this.getThreads().map((t) => t.toJSON.apply(t, params));
    };

    p.countBlock = function() {
        return this.getThreads().reduce(
            (cnt, thread) => cnt + thread.countBlock(),
            0
        );
    };

    p.moveBy = function(x, y) {
        this.getThreads().forEach((thread) => {
            var { view = {} } = thread.getFirstBlock() || {};
            if (view && view.display) view._moveBy(x, y, false);
        });
        var { board } = this;
        if (board instanceof Entry.BlockMenu) {
            board.updateSplitters(y);
        }
    };

    p.stringify = function(excludeData) {
        return JSON.stringify(this.toJSON(excludeData));
    };

    p.dominate = function(thread) {
        thread.view.setZIndex(this._maxZIndex++);
    };

    p.getMaxZIndex = function() {
        return this._maxZIndex;
    };

    p.indexOf = function(thread) {
        return this._data.indexOf(thread);
    };

    p._handleChange = function() {
        var board = _.result(this.view, 'board');
        var event = Entry.creationChangedEvent;
        if (board && event && board.constructor !== Entry.BlockMenu) {
            event.notify();
        }
    };

    p.hasBlockType = function(type) {
        return this.getThreads().some((thread) => thread.hasBlockType(type));
    };

    p.findById = function(id) {
        return this._blockMap[id];
    };

    p.registerBlock = function(block) {
        this._blockMap[block.id] = block;
    };

    p.unregisterBlock = function({ id }) {
        delete this._blockMap[id];
    };

    p.getByPointer = function([, , ...pointer]) {
        var thread = this._data[pointer.shift()];
        var block = thread.getBlock(pointer.shift());
        while (pointer.length) {
            if (!(block instanceof Entry.Block)) block = block.getValueBlock();
            var type = pointer.shift();
            var index = pointer.shift();
            if (type > -1) {
                var statement = block.statements[type];
                if (index === undefined) return statement;
                else block = statement.getBlock(index);
            } else if (type === -1) {
                block = block.view.getParam(index);
            }
        }
        return block;
    };

    p.getTargetByPointer = function([, , ...pointer]) {
        var thread = this._data[pointer.shift()];
        var block;

        if (pointer.length === 1) {
            block = thread.getBlock(pointer.shift() - 1);
        } else {
            block = thread.getBlock(pointer.shift());
            while (pointer.length) {
                if (!(block instanceof Entry.Block))
                    block = block.getValueBlock();
                var type = pointer.shift();
                var index = pointer.shift();
                if (type > -1) {
                    var statement = block.statements[type];
                    if (!pointer.length) {
                        if (index === 0) block = statement.view.getParent();
                        else if (index === undefined) block = statement;
                        else block = statement.getBlock(index - 1);
                    } else {
                        if (index < 0) block = statement;
                        else block = statement.getBlock(index);
                    }
                } else if (type === -1) {
                    block = block.view.getParam(index);
                }
            }
        }
        return block;
    };

    p.getBlockList = function(excludePrimitive, type) {
        return _.chain(this.getThreads())
            .map((t) => t.getBlockList(excludePrimitive, type))
            .flatten(true)
            .value();
    };

    p.removeBlocksByType = function(type) {
        this.getBlockList(false, type).forEach((b) => b.doDestroy());
    };

    p.isAllThreadsInOrigin = function() {
        return this.getThreads().every((thread) => thread.isInOrigin());
    };

    p.destroy = function() {
        this.clear();
        this.destroyView();
    };
})(Entry.Code.prototype);
