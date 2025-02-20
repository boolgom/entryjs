import LearningView from './LearningView';
import Chart from './Chart';
import _uniq from 'lodash/uniq';
import _floor from 'lodash/floor';
import _sum from 'lodash/sum';
import _mean from 'lodash/mean';
import _toNumber from 'lodash/toNumber';
import _isNaN from 'lodash/isNaN';
import DataTable from '../DataTable';

export const classes = [
    'ai_learning_train',
    'ai_learning_number',
    'number_learning_attr_1',
    'number_learning_attr_2',
    'number_learning_attr_3',
    'number_learning_attr_4',
    'number_learning_attr_5',
    'number_learning_attr_6',
];

class NumberClassification {
    #attrLength = 0;
    #trainParam = null;
    #table = {};
    #trainCallback;
    #chart = null;
    #isTrained = false;
    #chartEnable = false;
    #view = null;
    #predictResult = null;
    #name = '';
    #fields = [];
    #predictField = [];
    #loadModel;
    constructor(params = {}) {
        this.#view = new LearningView({ name: params.name || '', status: 0 });
        // 정지시 data 초기화.
        Entry.addEventListener('stop', () => {
            this.init({ ...params });
        });
        this.init({ ...params });
    }

    init({ name, url, table, trainParam, modelId, loadModel }) {
        this.#name = name;
        this.#table = table;
        this.#trainCallback = (value) => {
            this.#view.setValue(value);
        };
        this.#isTrained = true;
        this.#loadModel = loadModel;

        this.#attrLength = table?.select?.[0]?.length || 0;
        this.#fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.#predictField = table?.select?.[1]?.map((index) => table?.fields[index]);
        if (this.#attrLength === 2) {
            this.#chartEnable = true;
        }
        if (this.url !== url || this.modelId !== modelId) {
            // load시 trainParam에 추가되는 파라미터가 있어서 로드 직전 추가.
            this.#trainParam = trainParam;
            this.load(url, modelId);
            this.url = url;
            this.modelId = modelId;
        }
    }

    setTable() {
        const tableSource = DataTable.getSource(this.#table.id);
        if (this.#table.fieldsInfo.length !== tableSource.fields.length) {
            Entry.toast.alert(Lang.Msgs.warn, Lang.AiLearning.train_param_error);
            throw Error(Lang.AiLearning.train_param_error);
        }
        this.#table.data = tableSource.rows;
    }

    destroy() {
        this.#view.destroy();
        if (this.#chart) {
            this.#chart.destroy();
            this.#chart = null;
        }
    }

    createColor() {
        return this.#trainParam.labels.reduce(
            (acc, cur, idx, arr) => ({
                ...acc,
                [cur]: Entry.Utils.randomColor(),
            }),
            {}
        );
    }

    setVisible(visible) {
        this.#view.setVisible(visible);
    }

    unbanBlocks(blockMenu) {
        blockMenu.unbanClass(`ai_learning_train`);
        blockMenu.unbanClass(`ai_learning_number`);
        blockMenu.unbanClass(`number_learning_attr_${this.#attrLength}`);
        if (this.#chartEnable) {
            blockMenu.unbanClass('ai_learning_train_chart');
        }
    }

    isTrained() {
        return this.#isTrained;
    }

    openChart() {
        if (!this.#chartEnable) {
            return;
        }
        if (!this.#chart) {
            this.#chart = new Chart({
                title: Lang.AiLearning.chart_title,
                description: `<em>${Lang.AiLearning.class}</em>   ${this.#predictField[0]}<em>${
                    Lang.AiLearning.model_attr_str
                } 1</em>${this.#fields[0]}<em>${Lang.AiLearning.model_attr_str} 2</em>${
                    this.#fields[1]
                }`,
                source: this.chartData,
            });
        } else {
            this.#chart.show();
        }
    }

    closeChart() {
        this.#chart?.hide();
    }

    setTrainOption(type, value) {
        this.trainParam = {
            ...this.trainParam,
            [type]: value,
        };
    }

    getTrainOption() {
        return this.#trainParam;
    }

    getResult() {
        return this.#predictResult;
    }

    getLabels() {
        const { data: trainData, labels } = convertTableToKnnData(this.#table);
        return _uniq(labels[0]).sort((a, b) => String(a).localeCompare(String(b)));
    }

    train() {
        this.setTable();
        this.#trainCallback(1);
        this.#isTrained = false;
        const { data: trainData, labels } = convertTableToKnnData(this.#table);
        const trainLabels = labels[0];
        const uniqLabels = _uniq(labels[0]).sort((a, b) => String(a).localeCompare(String(b)));
        const numLabels = uniqLabels.length;
        const maxVector = new Array(trainData[0].length).fill(-Infinity);
        trainData.forEach((e) => {
            for (let i = 0; i < maxVector.length; i++) {
                maxVector[i] = maxVector[i] > e[i] ? maxVector[i] : e[i];
            }
        });

        const minVector = new Array(trainData[0].length).fill(Infinity);
        trainData.forEach((e) => {
            for (let i = 0; i < minVector.length; i++) {
                minVector[i] = minVector[i] < e[i] ? minVector[i] : e[i];
            }
        });
        this.#trainParam = {
            ...this.#trainParam,
            trainData,
            trainLabels,
            labels: uniqLabels,
            numLabels,
            maxVector,
            minVector,
        };
        this.#isTrained = true;
        this.colors = this.createColor();
        this.#chart?.load({
            source: this.chartData,
        });
        this.#trainCallback(100);
    }

    async load(url, modelId) {
        const savedData = await this.#loadModel({ url, modelId });
        if (!savedData) {
            return;
        }
        this.#trainParam = {
            ...this.#trainParam,
            trainData: savedData.data,
            trainLabels: savedData.labels,
            labels: _uniq(savedData.labels).sort((a, b) =>
                String(a).localeCompare(String(b))
            ),
            maxVector: savedData.maxVector,
            minVector: savedData.minVector,
            numLabels: savedData.numLabels,
            neighbors: savedData.neighbors,
            isLoaded: true,
        };
        this.colors = this.createColor();
    }

    normalize(data = []) {
        const normData = [];
        const { minVector, maxVector } = this.#trainParam;
        for (let i = 0; i < data.length; i++) {
            normData.push((data[i] - minVector[i]) / (maxVector[i] - minVector[i]));
        }
        return normData;
    }

    predict(data) {
        const distData = [];
        const { trainData, trainLabels, neighbors } = this.#trainParam;

        for (let i = 0; i < trainData.length; i++) {
            const dist = eudist(this.normalize(data), this.normalize(trainData[i]));
            distData.push({
                index: i,
                dist,
                label: trainLabels[i],
            });
        }

        distData.sort((a, b) => a.dist - b.dist);

        const counts = {};
        for (let i = 0; i < neighbors; i++) {
            const { label, dist } = distData[i];
            if (!counts[label]) {
                counts[label] = [];
            }
            counts[label].push(dist);
        }

        const totalDistance = _sum(Object.values(counts).flat());
        this.#predictResult = Object.keys(counts)
            .map((className) => {
                const dist = _mean(counts[className]);
                const count = counts[className].length;
                const distProbability =
                    totalDistance === 0 ? 1 : (totalDistance - dist) / totalDistance;
                const probability = (count / neighbors) * 99 + distProbability;
                return {
                    className,
                    count,
                    probability,
                };
            })
            .sort((a, b) => b.probability - a.probability);
        return this.#predictResult;
    }

    findLabel(x, y) {
        const strX = String(x);
        const strY = String(y);
        const index = this.#trainParam.trainData.findIndex(
            (row) => String(row[0]) === strX && String(row[1]) === strY
        );
        return this.#trainParam.trainLabels[index];
    }

    findColor(id, a, b) {
        if (id === 'y') {
            return this.colors[this.findLabel(a, b)];
        }
        return undefined;
    }

    get chartData() {
        const json = this.#trainParam.trainData.map((row, idx) => ({
            x: row[0],
            y: row[1],
            index: this.#trainParam.trainLabels[idx],
        }));
        return {
            data: {
                type: 'scatter',
                json,
                keys: { value: ['y'], x: 'x' },
                color: (color, d) => this.findColor(d.id, d.x, d.value) || color,
                labels: false,
            },
            options: {
                point: {
                    pattern: ['circle'],
                },
                legend: {
                    show: false,
                },
                tooltip: {
                    contents: (data) => {
                        const [{ x, value }] = data;
                        const label = this.findLabel(x, value);
                        return `
                        <div class="chart_handle_wrapper">
                            ${Lang.AiLearning.class}: ${label}, ${this.#fields[0]}: ${x}, ${
                            this.#fields[1]
                        }: ${value}
                        <div>`;
                    },
                },
                axis: {
                    x: {
                        tick: {
                            fit: false,
                            count: 10,
                        },
                    },
                },
                grid: {
                    x: {
                        show: true,
                    },
                    y: {
                        show: true,
                    },
                },
            },
        };
    }
}

export default NumberClassification;

function eudist(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const d = (a[i] || 0) - (b[i] || 0);
        sum += d * d;
    }

    return sum;
}

function convertTableToKnnData(tableData = {}) {
    const { select = [[0], [1]], data: table = [] } = tableData;
    const [attr, predict] = select;
    const filtered = table.filter(
        (row) => !select[0].some((selected) => _isNaN(_toNumber(row[selected])))
    );
    return filtered.reduce(
        (accumulator, row) => {
            const { data = [], labels = [] } = accumulator;
            return {
                data: [...data, row.filter((data, index) => attr.includes(index))],
                labels: predict.map((i, idx) => {
                    const arr = labels[idx] || [];
                    return [...arr, row[i]];
                }),
            };
        },
        { data: [], labels: [] }
    );
}
