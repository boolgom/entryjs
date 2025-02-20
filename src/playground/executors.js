/*
 *
 */
'use strict';

class Executor {
    constructor(block, entity, code) {
        this.scope = new Entry.Scope(block, this);
        this.isUpdateTime = 0;
        this.entity = entity;
        this.code = code;
        this._callStack = [];
        this.register = {};
        this.paused = false;
        this.parentExecutor = null;
        this.valueMap = {};
        this.valueState = {};
        this.id = Entry.Utils.generateId();
    }

    execute(isFromOrigin) {
        if (Entry.isTurbo && !this.isUpdateTime) {
            this.isUpdateTime = performance.now();
        }
        if (this.isEnd()) {
            return;
        }

        const executedBlocks = [];
        const promises = [];
        if (isFromOrigin) {
            Entry.callStackLength = 0;
        }

        const entity = this.entity;
        const isOffline = window.location.href.indexOf('file://') === 0;
        while (true) {
            let returnVal = null;
            executedBlocks.push(this.scope.block);
            try {
                const schema = this.scope.block.getSchema();
                if (schema.class === 'ai_learning' && isOffline) {
                    throw new Entry.Utils.OfflineError();
                }
                if (schema && Entry.skeleton[schema.skeleton].executable) {
                    Entry.dispatchEvent('blockExecute', this.scope.block && this.scope.block.view);
                    returnVal = this.scope.run(entity);
                    this.scope.key = Entry.generateHash();
                }
            } catch (e) {
                if (e.name === 'AsyncError') {
                    returnVal = Entry.STATIC.BREAK;
                } else if (e.name === 'IncompatibleError') {
                    Entry.Utils.stopProjectWithToast(this.scope, 'IncompatibleError', e);
                } else if (e.name === 'OfflineError') {
                    Entry.Utils.stopProjectWithToast(this.scope, 'OfflineError', e);
                } else if (this.isFuncExecutor) {
                    Entry.Utils.stopProjectWithToast(this.parentScope, undefined, e);
                } else if (e.name === 'RangeError') {
                    Entry.toast.alert(
                        Lang.Workspace.RecursiveCallWarningTitle,
                        Lang.Workspace.RecursiveCallWarningContent
                    );
                    Entry.Utils.stopProjectWithToast(this.scope, undefined, e);
                } else {
                    Entry.Utils.stopProjectWithToast(this.scope, undefined, e);
                }
            }

            //executor can be ended after block function call
            if (this.isEnd()) {
                return executedBlocks;
            }

            if (returnVal instanceof Promise) {
                promises.push(returnVal);
                this.paused = true;
                returnVal
                    .then((returnVal) => {
                        this.valueMap = {};
                        this.valueState = {};
                        this.paused = false;
                        if (returnVal === Entry.STATIC.CONTINUE || returnVal === this.scope) {
                            return;
                        }
                        if (this.scope.block && Entry.engine.isState('run')) {
                            this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this);
                        }
                        if (this.scope.block === null && this._callStack.length) {
                            const oldScope = this.scope;
                            this.scope = this._callStack.pop();
                            if (this.scope.isLooped !== oldScope.isLooped) {
                                this.isLooped = true;
                            }
                        }
                    })
                    .catch((e) => {
                        this.paused = false;
                        if (e.name === 'AsyncError') {
                            returnVal = Entry.STATIC.BREAK;
                        } else if (e.name === 'IncompatibleError') {
                            Entry.Utils.stopProjectWithToast(this.scope, 'IncompatibleError', e);
                        } else if (this.isFuncExecutor) {
                            //function executor
                            Entry.Utils.stopProjectWithToast(this.parentScope, undefined, e);
                        } else if (e.name === 'RangeError') {
                            Entry.toast.alert(
                                Lang.Workspace.RecursiveCallWarningTitle,
                                Lang.Workspace.RecursiveCallWarningContent
                            );
                            Entry.Utils.stopProjectWithToast(this.scope, undefined, e);
                        } else {
                            Entry.Utils.stopProjectWithToast(this.scope, undefined, e);
                        }
                    });
                break;
            } else if (
                returnVal === undefined ||
                returnVal === null ||
                returnVal === Entry.STATIC.PASS
            ) {
                this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this);
                this.valueMap = {};
                this.valueState = {};
                if (this.scope.block === null) {
                    if (this._callStack.length) {
                        const oldScope = this.scope;
                        this.scope = this._callStack.pop();
                        if (this.scope.isLooped !== oldScope.isLooped) {
                            this.isLooped = true;
                            break;
                        }
                    } else {
                        break;
                    }
                }
            } else if (returnVal === Entry.STATIC.CONTINUE) {
                this.valueMap = {};
                this.valueState = {};
            } else if (returnVal === this.scope) {
                this.valueMap = {};
                this.valueState = {};
                break;
            } else if (returnVal === Entry.STATIC.BREAK) {
                break;
            }
        }
        return { promises, blocks: executedBlocks };
    }

    checkExecutorError(error) {
        if (error.name === 'AsyncError') {
            return Entry.STATIC.BREAK;
        } else if (this.isFuncExecutor) {
            throw error;
        } else {
            Entry.Utils.stopProjectWithToast(this.scope, undefined, error);
        }
    }

    checkExecutorResult(returnVal) {
        if (returnVal === undefined || returnVal === null || returnVal === Entry.STATIC.PASS) {
            this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this);
            this.valueMap = {};
            this.valueState = {};
            if (this.scope.block === null) {
                if (this._callStack.length) {
                    const oldScope = this.scope;
                    this.scope = this._callStack.pop();
                    if (this.scope.isLooped !== oldScope.isLooped) {
                        this.isLooped = true;
                        return true;
                    }
                } else {
                    return true;
                }
            }
        } else if (returnVal === Entry.STATIC.CONTINUE) {
            this.valueMap = {};
            this.valueState = {};
        } else if (returnVal === this.scope) {
            this.valueMap = {};
            this.valueState = {};
            return true;
        } else if (returnVal === Entry.STATIC.BREAK) {
            return true;
        }
    }

    stepInto(thread) {
        if (!(thread instanceof Entry.Thread)) {
            console.error('Must step in to thread');
        }

        const block = thread.getFirstBlock();
        if (!block) {
            return Entry.STATIC.BREAK;
        }

        this._callStack.push(this.scope);

        this.scope = new Entry.Scope(block, this);
        return Entry.STATIC.CONTINUE;
    }

    break() {
        if (this._callStack.length) {
            this.scope = this._callStack.pop();
        }
        return Entry.STATIC.PASS;
    }

    breakLoop() {
        if (this._callStack.length) {
            this.scope = this._callStack.pop();
        }
        while (this._callStack.length) {
            const schema = Entry.block[this.scope.block.type];
            if (schema.class === 'repeat') {
                break;
            }
            this.scope = this._callStack.pop();
        }
        return Entry.STATIC.PASS;
    }

    end() {
        Entry.dispatchEvent('blockExecuteEnd', this.scope.block && this.scope.block.view);
        this.scope.block = null;
    }

    isPause() {
        return this.paused;
    }

    isEnd() {
        return this.scope.block === null;
    }
}

Entry.Executor = Executor;
