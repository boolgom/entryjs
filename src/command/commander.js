class EntryCommander {
    constructor() {
        Entry.do = this.do.bind(this);

        Entry.undo = this.undo.bind(this);

        this.editor = {};

        this.reporters = [];

        Entry.Command.editor = this.editor;

        this.doEvent = new Entry.Event(this);
        this.logEvent = new Entry.Event(this);

        this.doCommandAll = Entry.doCommandAll;
        this._storage = null;
    }

    do(commandType, ...args) {
        const {
            stateManager,
            Command: EntryCommand,
            STATIC: { COMMAND_TYPES, getCommandName },
        } = Entry;

        if (typeof commandType === 'string') {
            commandType = COMMAND_TYPES[commandType];
        }

        //intentionally delay reporting
        this.report(COMMAND_TYPES.do);
        this.report(commandType, args);

        const command = EntryCommand[commandType];

        console.log('commandType', commandType, getCommandName(commandType));

        let state;

        if (stateManager && !this._checkIsSkip(commandType)) {
            state = stateManager.addCommand(
                ...[commandType, this, this.do, command.undo].concat(
                    command.state.apply(this, args)
                )
            );
        } else if (this.checkIsChange(commandType)) {
            if (Entry.creationChangedEvent) {
                Entry.creationChangedEvent.notify();
            }
        }
        const value = command.do.apply(this, args);
        this.doEvent.notify(commandType, args);
        const id = state ? state.id : null;

        return {
            value,
            isPass: function (isPass, skipCount) {
                this.isPassById(id, isPass, skipCount);
            }.bind(this),
        };
    }

    undo(commandType, ...args) {
        this.report(Entry.STATIC.COMMAND_TYPES.undo);

        const command = Entry.Command[commandType];

        let state;
        if (Entry.stateManager && command.skipUndoStack !== true) {
            state = Entry.stateManager.addCommand.apply(
                Entry.stateManager,
                [commandType, this, this.do, command.undo].concat(command.state.apply(this, args))
            );
        }
        return {
            value: command.do.apply(this, args),
            isPass: function (isPass) {
                this.isPassById(state.id, isPass);
            }.bind(this),
        };
    }

    redo(commandType, ...args) {
        this.report(Entry.STATIC.COMMAND_TYPES.redo);

        const command = Entry.Command[commandType];

        if (Entry.stateManager && command.skipUndoStack !== true) {
            Entry.stateManager.addCommand.apply(
                Entry.stateManager,
                [commandType, this, this.undo, commandType].concat(command.state.apply(null, args))
            );
        }
        command.undo.apply(this, args);
    }

    setCurrentEditor(key, object) {
        this.editor[key] = object;
    }

    isPass(isPass = true) {
        if (!Entry.stateManager) {
            return;
        }

        const lastCommand = Entry.stateManager.getLastCommand();
        if (lastCommand) {
            lastCommand.isPass = isPass;
        }
    }

    isPassById(id, isPass = true, skipCount = 0) {
        if (!id || !Entry.stateManager) {
            return;
        }

        const lastCommand = Entry.stateManager.getLastCommandById(id);
        if (lastCommand) {
            lastCommand.isPass = isPass;
            if (skipCount) {
                lastCommand.skipCount = !!skipCount;
            }
        }
    }

    addReporter(reporter) {
        reporter.logEventListener = this.logEvent.attach(reporter, reporter.add);
    }

    removeReporter(reporter) {
        if (reporter.logEventListener) {
            this.logEvent.detatch(reporter.logEventListener);
        }
        delete reporter.logEventListener;
    }

    report(commandType, argumentsArray) {
        let data;

        if (commandType && Entry.Command[commandType] && Entry.Command[commandType].log) {
            data = Entry.Command[commandType].log.apply(this, argumentsArray);
        } else {
            data = argumentsArray;
        }
        data.unshift(commandType);
        this.logEvent.notify(data);
    }

    applyOption() {
        this.doCommandAll = Entry.doCommandAll;
    }

    _checkIsSkip(commandType) {
        const { skipUndoStack } = Entry.Command[commandType];
        return (
            skipUndoStack === true ||
            (!Entry.doCommandAll && _.includes(Entry.STATIC.COMMAND_TYPES_NOT_ALWAYS, commandType))
        );
    }

    checkIsChange(commandType) {
        return _.includes(Entry.STATIC.COMMAND_TYPES_CHANGE_CHECK, commandType);
    }
}

Entry.Commander = EntryCommander;
