import * as tf from '@tensorflow/tfjs';
export const classes = ['ai_learning_speech'];

class Classification {
    #type = null;
    #url = '';
    #labels = [];
    #recordTime = 2000;
    #result = [];

    constructor({ url, labels, type, recordTime }) {
        this.#type = type;
        this.#url = url;
        this.#labels = labels;
        this.#recordTime = recordTime;
        this.load(url);
    }

    get labels() {
        return this.#labels;
    }

    getResult(index) {
        const result = this.#result || [];
        const defaultResult = { probability: 0, className: '' };
        if (index !== undefined && index > -1) {
            return (
                result.find(({ className }) => className === this.#labels[index]) || defaultResult
            );
        }
        return result[0] || defaultResult;
    }

    unbanBlocks(blockMenu) {
        blockMenu.unbanClass(`ai_learning_classification`);
        if (this.#type) {
            blockMenu.unbanClass(`ai_learning_${this.#type}`);
        }
    }

    openInputPopup() {
        Entry.dispatchEvent('openMLInputPopup', {
            type: this.#type,
            recordTime: this.#recordTime,
            predict: async (data) => {
                this.#result = await this.predict(data);
            },
            url: this.#url,
            labels: this.#labels,
            setResult: (result) => {
                this.#result = result;
            },
        });
    }

    async namePredictions(logits) {
        const values = Array.from(await logits.data());
        return values
            .map((probability, index) => ({
                className: this.#labels[index] || index,
                probability,
            }))
            .sort((a, b) => a.probability > b.probability ? -1 : a.probability < b.probability ? 1 : 0);
    }

    async predict(tensor) {
        const logits = this.model.predict(tensor);
        return await this.namePredictions(logits);
    }

    async load(url) {
        this.model = await tf.loadLayersModel(url);
    }

    async reload() {
        this.model = await tf.loadLayersModel(this.#url);
        this.isLoaded = true;
    }
}

export default Classification;
