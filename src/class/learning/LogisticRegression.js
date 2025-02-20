import * as tf from '@tensorflow/tfjs';
import _floor from 'lodash/floor';
import _max from 'lodash/max';
import _sum from 'lodash/sum';
import _mean from 'lodash/mean';
import _toNumber from 'lodash/toNumber';
import _isNaN from 'lodash/isNaN';
import LearningBase from './LearningBase';
import Utils from './Utils';

export const classes = [
    'ai_learning_train',
    'ai_learning_logistic_regression',
    'logistic_regression_attr_1',
    'logistic_regression_attr_2',
    'logistic_regression_attr_3',
    'logistic_regression_attr_4',
    'logistic_regression_attr_5',
    'logistic_regression_attr_6',
];

class LogisticRegression extends LearningBase {
    type = 'logistic_regression';

    init({ name, url, result, table, trainParam }) {
        this.name = name;
        this.trainParam = trainParam;
        this.result = result;
        this.table = table;
        this.trainCallback = (value) => {
            this.view.setValue(value);
        };
        this.trained = true;

        this.attrLength = table?.select?.[0]?.length || 0;
        if (this.attrLength === 1) {
            this.chartEnable = true;
        }
        if (this.url !== url) {
            this.load(url);
            this.url = url;
        }

        this.fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.predictFields = table?.select?.[1]?.map((index) => table?.fields[index]);

        if (!Utils.isWebGlSupport()) {
            tf.setBackend('cpu');
        }
    }

    async load(url) {
        const model = await tf.loadLayersModel(url);
        const modelData = new Promise((resolve) =>
            model.save({
                save: (data) => {
                    const layers = data?.modelTopology?.config?.layers;
                    if (Array.isArray(layers)) {
                        data.modelTopology.config.layers.forEach((layer) => {
                            if (layer?.config?.name) {
                                layer.config.name = `${layer.config.name}_ws`;
                            }
                        });
                    }
                    if (Array.isArray(data.weightSpecs)) {
                        data.weightSpecs.forEach((spec) => {
                            const splits = spec.name.split('/');
                            splits[0] = `${splits[0]}_ws`;
                            spec.name = splits.join('/');
                        });
                    }
                    resolve(data);
                },
            })
        );
        this.model = await tf.loadLayersModel({ load: () => modelData });
        model.dispose();
    }

    async reload() {
        this.model = await tf.loadLayersModel(this.url);
        this.isLoaded = true;
    }

    async train() {
        this.setTable();
        this.trained = false;
        let currentEpoch = 0;
        let percent = 0;
        this.trainCallback(1);

        const { validationRate = 0.25, testRate = 0.2 } = this.trainParam;
        const {
            trainData,
            validateData,
            testArr,
            select,
            fields,
            valueMap,
            dataLength,
            numClass,
        } = getData(validationRate, testRate, this.table, this.trainParam);

        this.valueMap = Object.fromEntries(
            Object.entries(valueMap).map(([key, value]) => [value, key])
        );
        this.model = createModel(dataLength, numClass);
        this.lastHistory = await trainModel(
            this.model,
            trainData,
            validateData,
            this.trainParam,
            () => {
                currentEpoch = currentEpoch + 1;
                percent = _floor((currentEpoch / this.trainParam.epochs) * 100);
                this.trainCallback(Math.min(percent, 100));
            }
        );
        const { score, confusionMatrix } = await this.evaluate(
            this.model,
            testArr,
            valueMap,
            numClass
        );
        const { accuracy, f1, precision, recall } = score;
        this.trained = true;
        this.result = {
            select,
            fields,
            confusionMatrix,
            accuracy,
            f1,
            valueMap: this.valueMap,
            precision,
            recall,
        };
    }

    async predict(array) {
        if (!this.model) {
            throw new Error("can't predict: no model");
        }
        const xs = tf.tensor([array]);
        const preds = this.model.predict(xs);
        const resultArray = preds.arraySync();
        const valueMap = this.result?.valueMap || {};
        this.predictResult = resultArray
            .map((arr) =>
                arr.map((probability, index) => ({
                    probability: _floor(probability, 3),
                    className: valueMap[index + 1],
                }))
            )
            .flat();
    }

    async evaluate(model, validateData = [{ x: 0, y: 0 }], classMap, numClass) {
        const evalData = validateData;
        const xs = tf.tensor(Array.from(evalData, (evalData) => evalData.x));
        const ys = tf.tensor(Array.from(evalData, (evalData) => evalData.y)).argMax(-1);
        const preds = model.predict(xs);
        const pred = preds.argMax(-1);
        const confusionMatrixZip = await tf.math.confusionMatrix(ys, pred, numClass);
        const matrixArray = Array.from(confusionMatrixZip.dataSync());
        const confusionMatrix = Utils.arrayToMatrix(matrixArray, numClass);
        const score = Utils.getScores(confusionMatrix, numClass);
        return {
            score,
            confusionMatrix,
        };
    }
}

export default LogisticRegression;

function createModel(inputShape, numClasses = 1) {
    const model = tf.sequential({
        layers: [
            tf.layers.dense({
                name: 'log_dense_ws',
                inputShape: [inputShape],
                units: numClasses,
                activation: numClasses === 2 ? 'sigmoid' : 'softmax',
                useBias: false,
                kernelInitializer: tf.initializers.varianceScaling({}),
            }),
        ],
    });
    return model;
}

async function trainModel(model, inputs, outputs, trainParam, onEpochEnd) {
    const {
        batchSize = 0,
        epochs = 0,
        optimizer: optimizerStr = 'adm',
        learningRate = 0.1,
    } = trainParam;
    const optimizer =
        optimizerStr === 'adm' ? tf.train.adam(learningRate * 1) : tf.train.sgd(learningRate * 1);
    model.compile({
        optimizer,
        loss: tf.losses.meanSquaredError,
        metrics: ['acc', 'ce'],
    });
    return await model.fitDataset(inputs.batch(batchSize * 1), {
        epochs: epochs * 1,
        validationData: outputs.batch(batchSize * 1),
        callbacks: {
            onEpochEnd,
        },
    });
}

function getData(validationRate, testRate, data, trainParam) {
    const tempMap = {};
    const tempMapCount = {};
    const { select = [[0], [1]], data: table, fields } = data;
    const [attr, predict] = select;
    const filtered = table.filter(
        (row) => !select[0].some((selected) => _isNaN(_toNumber(row[selected])))
    );
    const dataArray = filtered
        .map((row) => ({
            x: attr.map((i) => parseFloat(row[i]) || 0),
            y: Utils.stringToNumber(predict[0], row[predict[0]], tempMap, tempMapCount),
        }))
        .map((row) => {
            const yRow = Array(tempMapCount[predict[0]]).fill(0);
            yRow[row.y - 1] = 1;
            return {
                x: row.x,
                y: yRow,
            };
        });
    const [train, validate, test] = sliceArray(dataArray, validationRate, testRate);

    return {
        trainData: arrayToZip(train),
        validateData: arrayToZip(validate),
        testArr: test,
        select,
        fields,
        valueMap: { ...tempMap[predict[0]] },
        dataLength: attr.length,
        numClass: tempMapCount[predict[0]],
    };
}

function sliceArray(dataArray, validationRate = 0.25, testRate = 0.2) {
    Utils.shuffle(dataArray);
    const testNum = dataArray.length - Math.floor(dataArray.length * testRate);
    const validateNum = Math.floor(testNum * validationRate);

    const validateArr = dataArray.slice(0, validateNum);
    const trainArr = dataArray.slice(validateNum, testNum);
    const testArr = dataArray.slice(testNum, dataArray.length);
    return [trainArr, validateArr, testArr];
}

function arrayToZip(array) {
    const xs = tf.data.array(array.map((v) => v.x));
    const ys = tf.data.array(array.map((v) => v.y));
    return tf.data.zip({ xs, ys });
}
