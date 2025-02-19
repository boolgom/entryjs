import LearningBase from './LearningBase';
import _floor from 'lodash/floor';
import _max from 'lodash/max';
import _sum from 'lodash/sum';
import _mean from 'lodash/mean';
import _toNumber from 'lodash/toNumber';
import _isNaN from 'lodash/isNaN';
import Utils from './Utils';
const SVM = require('libsvm-js/asm');

export const classes = [
    'ai_learning_train',
    'ai_learning_svm',
    'svm_attr_1',
    'svm_attr_2',
    'svm_attr_3',
    'svm_attr_4',
    'svm_attr_5',
    'svm_attr_6',
];

export const KERNEL_STRING_TYPE = {
    LINEAR: 'linear',
    POLYNOMIAL: 'polynomial',
    RBF: 'rbf',
};

export const OPTION_DEFAULT_VALUE = {
    epochs: 30,
    batchSize: 16,
    k: 4,
    initialCentroids: 'kmpp',
    neighbors: 10,
    validationRate: 0.25,
    C: 0.00001,
    degree: 3,
    gamma: 1,
};

class Svm extends LearningBase {
    type = 'svm';

    init({ name, url, result, table, trainParam, modelId, loadModel }) {
        this.name = name;
        this.trainParam = trainParam;
        this.result = result;
        this.table = table;
        this.loadModel = loadModel;
        this.trainCallback = (value) => {
            this.view.setValue(value);
        };
        // train 확인 필요
        this.trained = true;
        this.chartEnable = false;
        this.attrLength = table?.select?.[0]?.length || 0;

        this.fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.predictFields = table?.select?.[1]?.map((index) => table?.fields[index]);
        if (this.url !== url || this.modelId !== modelId) {
            this.load(url, modelId);
            this.url = url;
            this.modelId = modelId;
        }
    }

    checkTrainOptionValidation() {
        const { kernel, C, degree, gamma } = this.trainParam;
        if (!kernel || !C || !degree || !gamma) {
            throw new Error("can't train: trainOptions contain undefined");
        }
        switch (kernel) {
            case KERNEL_STRING_TYPE.LINEAR:
                if (
                    degree !== OPTION_DEFAULT_VALUE.degree ||
                    gamma !== OPTION_DEFAULT_VALUE.gamma
                ) {
                    throw new Error(
                        `can't train: invalid kernelOption. kernel type ${KERNEL_STRING_TYPE.LINEAR}`
                    );
                }
                break;
            case KERNEL_STRING_TYPE.POLYNOMIAL:
                if (gamma !== OPTION_DEFAULT_VALUE.gamma) {
                    throw new Error(
                        `can't train: invalid kernelOption. kernel type ${KERNEL_STRING_TYPE.POLYNOMIAL}`
                    );
                }
                break;
            case KERNEL_STRING_TYPE.RBF:
                if (degree !== OPTION_DEFAULT_VALUE.degree) {
                    throw new Error(
                        `can't train: invalid kernelOption. kernel type ${KERNEL_STRING_TYPE.RBF}`
                    );
                }
                break;
            default:
        }
    }

    async train() {
        this.trained = false;
        this.setTable();
        this.trainCallback(1);
        this.checkTrainOptionValidation();
        const { testRate = 0.2, C, kernel, degree, gamma } = this.trainParam;
        const {
            trainX,
            trainY,
            testArr,
            select,
            fields,
            PREDICT_STR2NUM_MAP,
            numClass,
        } = this.getData(testRate, this.table);
        const svmTrainOption = {
            kernel,
            C,
            degree,
            gamma,
        };

        this.predictValueMap = Object.fromEntries(
            Object.entries(PREDICT_STR2NUM_MAP).map(([key, value]) => [value, key])
        );
        this.trainCallback(30);

        this.model = createModel();
        trainModel(this.model, trainX, trainY, svmTrainOption);
        this.trainCallback(80);

        const { confusionMatrix, score } = this.evaluate(this.model, testArr, numClass);

        const { accuracy, f1, precision, recall } = score;

        this.trainCallback(100);
        this.trained = true;
        this.result = {
            select,
            fields,
            confusionMatrix,
            accuracy,
            f1,
            valueMap: this.predictValueMap,
            precision,
            recall,
        };
    }

    async load(url, modelId) {
        const data = await this.loadModel({ url, modelId });
        if (!data) {
            return;
        }
        const { serializeModel, result } = data;
        this.model = SVM.load(serializeModel);
        this.valueMap = result?.valueMap;
        this.result = result;
    }

    // INFO: 예상치 전체를 가져옴. Deeplearning 레포의 predictArrays와 동일
    async predict(array) {
        if (!this.model) {
            throw new Error("can't predict: no model");
        }
        const xs = [array];
        const preds = this.model.predict(xs);
        this.predictResult = preds.map((target) => ({
            className: this.valueMap[target + 1],
            probability: 1,
        }));
    }

    getData(testRate, data) {
        const STR2NUM_MAP = {};
        const STR2NUM_MAP_COUNT = {};
        const { select = [[0], [1]], data: table, fields } = data;
        const [attr, predict] = select;
        const filtered = table.filter(
            (row) => !select[0].some((selected) => _isNaN(_toNumber(row[selected])))
        );
        const dataArray = filtered
            .map((row) => ({
                x: attr.map((i) => parseFloat(row[i]) || 0),
                y: Utils.stringToNumber(
                    predict[0],
                    row[predict[0]],
                    STR2NUM_MAP,
                    STR2NUM_MAP_COUNT
                ),
            }))
            .map((row) => ({
                x: row.x,
                y: row.y - 1,
            }));
        const { trainArr, testArr } = this.sliceArray(dataArray, testRate);
        return {
            trainX: trainArr.map((v) => v.x),
            trainY: trainArr.map((v) => v.y),
            testArr,
            select,
            fields,
            PREDICT_STR2NUM_MAP: { ...STR2NUM_MAP[predict[0]] },
            numClass: STR2NUM_MAP_COUNT[predict[0]],
        };
    }

    sliceArray(dataArray, testRate) {
        Utils.shuffle(dataArray);
        const testNum = Math.floor(dataArray.length * testRate);
        const testArr = dataArray.slice(0, testNum);
        const trainArr = dataArray.slice(testNum, dataArray.length);
        return { trainArr, testArr };
    }

    evaluate(model, validateData, numClass) {
        const xs = validateData.map((data) => data.x);
        const ys = validateData.map((data) => data.y);
        const predictYs = model.predict(xs);
        const length = predictYs.length;

        const confusionMatrix = Array(numClass)
            .fill(0)
            .map(() => Array(numClass).fill(0));

        for (let idx = 0; idx < length; idx++) {
            confusionMatrix[ys[idx]][predictYs[idx]]++;
        }
        const score = Utils.getScores(confusionMatrix, numClass);
        return { confusionMatrix, score };
    }
}

export default Svm;

function createModel() {
    return new SVM({ type: SVM.SVM_TYPES.C_SVC, probabilityEstimates: true });
}

function trainModel(model, samples, labels, svmTrainOption) {
    let kernelType;
    if (svmTrainOption.kernel === KERNEL_STRING_TYPE.LINEAR) {
        kernelType = SVM.KERNEL_TYPES.LINEAR;
    } else if (svmTrainOption.kernel === KERNEL_STRING_TYPE.POLYNOMIAL) {
        kernelType = SVM.KERNEL_TYPES.POLYNOMIAL;
    } else if (svmTrainOption.kernel === KERNEL_STRING_TYPE.RBF) {
        kernelType = SVM.KERNEL_TYPES.RBF;
    } else {
        throw new Error("can't create model: unexpected kernel type");
    }

    model.free();

    model.kernel = kernelType;
    model.cost = svmTrainOption.C;
    model.degree = svmTrainOption.degree;
    model.gamma = svmTrainOption.gamma;

    model.train(samples, labels);
}
