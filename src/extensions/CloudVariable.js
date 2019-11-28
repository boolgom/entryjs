import io from 'socket.io-client';
import { dmet, dmetVariable, dmetList } from './dmet';
import singleInstance from '../core/singleInstance';

class CloudVariableExtension {
    #cvSocket = null;
    #data = null;
    #defaultData = null;
    #isOnline = true;

    get data() {
        return this.#data;
    }

    setServerInfo(cvServer) {
        this.cvServer = cvServer;
    }

    setOffline() {
        if (!this.#cvSocket) {
            return;
        }
        this.#cvSocket.emit('changeMode', 'offline');
        this.#isOnline = false;
    }

    setOnline() {
        if (!this.#cvSocket) {
            return;
        }
        this.#cvSocket.emit('changeMode', 'online');
        this.#isOnline = true;
    }

    async connect(cvServer) {
        if (this.#cvSocket || !this.cvServer) {
            return;
        }
        const { url, query } = this.cvServer;
        const socket = io(url, {
            query: {
                q: query,
            },
            reconnectionAttempts: 2,
            timeout: 5000,
        });
        socket.on('action', this.#execDmet.bind(this));
        socket.on('create', this.#createVariable.bind(this));
        socket.on('reset', (variables) => {
            try {
                this.#data = new dmet(variables);
            } catch (e) {
                console.warn(e);
            }
        });

        this.#cvSocket = socket;
        return new Promise((resolve) => {
            socket.on('connect_error', () => {
                console.log('connect_error');
                if (!this.#data) {
                    try {
                        this.#data = new dmet(this.#defaultData);
                    } catch (e) {
                        console.warn(e);
                    }
                    resolve();
                }
            });
            socket.on('welcome', (variables = []) => {
                console.log('welcome', variables);
                if (variables.length > 0) {
                    console.log('status', variables[0].isOnline);
                    this.#isOnline = variables[0].isOnline;
                }

                try {
                    this.#data = new dmet(variables);
                } catch (e) {
                    console.warn(e);
                }
                resolve();
            });
            socket.on('disconnect', (reason) => {
                console.log('disconnect', reason);
                this.#data = new dmet(this.#defaultData);
                resolve();
            });
            socket.on('changeMode', (mode) => {
                this.#isOnline = mode === 'online';
                resolve();
            });
        });
    }

    setDefaultData(defaultData) {
        this.#defaultData = defaultData;
    }

    createDmet(object) {
        this.#data.create(object);
    }

    async create(data) {
        if (!this.#cvSocket) {
            await this.connect();
        }
        const { id_, type, name } = data;
        if (type === 'variable') {
            await this.#createVariable(name, id_);
        } else if (type === 'list') {
            await this.#createList(name, id_);
        }
        // Entry.dispatchEvent('saveVariable');
    }

    #createVariable(name, id) {
        if (!this.#cvSocket) {
            return;
        }
        const variable = new dmetVariable(
            {
                name,
            },
            id
        );
        return new Promise((resolve) => {
            this.#cvSocket.emit('create', variable, (isCreate, variable) => {
                if (isCreate) {
                    this.createDmet(variable);
                }
                resolve();
            });
        });
    }

    #createList(name, id) {
        if (!this.#cvSocket) {
            return;
        }
        const list = new dmetList(
            {
                name,
            },
            id
        );
        return new Promise((resolve) => {
            this.#cvSocket.emit('create', list, (isCreate, list) => {
                if (isCreate) {
                    this.createDmet(list);
                }
                resolve();
            });
        });
    }

    #run(operation) {
        return new Promise((resolve) => {
            if (this.#cvSocket.connected && this.#isOnline) {
                this.#cvSocket.emit('action', operation, (isUpdate, operation) => {
                    if (isUpdate) {
                        this.#data.exec(operation);
                        resolve(operation);
                    } else {
                        resolve();
                    }
                });
            } else {
                this.#data.exec(operation);
                resolve(operation);
            }
        }).then((operation) => {
            if (operation) {
                this.#applyValue(operation);
            }
        });
    }

    #execDmet(operation) {
        this.#data.exec(operation);
        this.#applyValue(operation);
    }

    #applyValue(operation) {
        const { id, value, data, variableType } = operation;
        if (variableType === 'variable') {
            const variable = Entry.variableContainer.getVariable(id);
            if (variable) {
                variable.value_ = value;
                variable._valueWidth = null;
                variable.updateView();
            }
        } else if (variableType === 'list') {
            const list = Entry.variableContainer.getList(id);
            if (list) {
                const { array } = this.get(operation);
                list.array_ = array;
                list.updateView();
            }
        }
    }

    set(target, value) {
        if (!this.#cvSocket) {
            return;
        }
        const variable = this.#data.get(target);
        if (!variable) {
            return;
        }
        const operation = variable.getOperation({
            type: 'set',
            value,
        });
        return this.#run(operation);
    }

    get(target) {
        return this.#data && this.#data.get(target);
    }

    append(target, data) {
        if (!this.#cvSocket) {
            return;
        }
        const variable = this.#data.get(target);
        if (!variable) {
            return;
        }
        const operation = variable.getOperation({
            type: 'append',
            data,
        });
        return this.#run(operation);
    }

    insert(target, index, data) {
        if (!this.#cvSocket) {
            return;
        }
        const variable = this.#data.get(target);
        if (!variable) {
            return;
        }
        const operation = variable.getOperation({
            type: 'insert',
            index,
            data,
        });
        return this.#run(operation);
    }

    delete(target, index) {
        if (!this.#cvSocket) {
            return;
        }
        const variable = this.#data.get(target);
        if (!variable) {
            return;
        }
        const operation = variable.getOperation({
            type: 'delete',
            index,
        });
        return this.#run(operation);
    }

    replace(target, index, data) {
        if (!this.#cvSocket) {
            return;
        }
        const variable = this.#data.get(target);
        if (!variable) {
            return;
        }
        const operation = variable.getOperation({
            type: 'replace',
            index,
            data,
        });
        return this.#run(operation);
    }
}

export default singleInstance(CloudVariableExtension);
