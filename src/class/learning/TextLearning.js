import Bayes, { fromJson } from './bayes';
import * as Khaiii from 'khaiii';

export const classes = [
    'ai_learning_classification',
    'ai_learning_text'
];

const KhaiiModule = {
    isInitialized: false,
    module: undefined,
    async load(resourceRoot = `${Entry.Utils.getEntryjsPath()}/extern/khaiii`) {
        if (this.isInitialized) {
            return;
        }
        this.module = await Khaiii.initialize({
            resourceProvider: 'webfs',
            resourceRoot,
        });
        this.isInitialized = true;
    },
};

class TextNaiveBaye {
    #type = 'text';
    #url = '';
    #labels = [];
    #popup = null;
    #result = [];
    #loadModel;

    constructor({ url, labels, modelId, loadModel }) {
        this.#url = url;
        this.#labels = labels;
        this.#loadModel = loadModel;
        this.classifier = new Bayes({
            tokenizer: this.tokenizer,
        });
        this.load(url, modelId);
    }

    get labels() {
        return this.#labels;
    }

    unbanBlocks(blockMenu) {
        blockMenu.unbanClass(`ai_learning_classification`);
        blockMenu.unbanClass(`ai_learning_text`);
    }

    isAvailable() {
        if (!this.isLoaded) {
            throw new Error('ai learning text model load error');
        }
        return true;
    }

    getResult(index) {
        const result = this.#result?.length ? this.#result : this.#popup?.result || [];
        const defaultResult = { probability: 0, className: '' };
        if (index !== undefined && index > -1) {
            return (
                result.find(({ className }) => className === this.#labels[index]) || defaultResult
            );
        }
        return result[0] || defaultResult;
    }

    openInputPopup() {
        const isAvailable = this.isAvailable();
        if (!isAvailable) {
            return;
        }
        this.#result = [];
        Entry.dispatchEvent('openMLInputPopup', {
            type: 'text',
            predict: async (text) => {
                this.#result = await this.predict(text);
            },
            url: this.#url,
            labels: this.#labels,
            setResult: (result) => {
                this.#result = result;
            },
        });
    }

    tokenizer = async (text) => {
        if (!KhaiiModule.module) {
            throw new Error('module not loaded');
        }
        if (!text) {
            return [];
        }
        const analized = KhaiiModule.module.analyze(text); // 형태소 분석 진행
        const filtered = analized
            .map((wordInfo) =>
                wordInfo.morphs
                    .filter((morph) => {
                        const category = morph.tag.charAt(0);
                        return category === 'V' || category === 'N' || category === 'S';
                    })
                    .map((morph) => morph.lex)
            )
            .flat();
        return filtered;
    };

    async predict(textData) {
        await KhaiiModule.load();
        this.#result = await this.classifier.categorize(textData);
        return this.#result;
    }

    async load(url, modelId) {
        const data = await this.#loadModel({ url, modelId });
        if (!data) {
            return;
        }
        this.classifier = fromJson(JSON.stringify(data));
        this.classifier.tokenizer = this.tokenizer;
        this.isLoaded = true;
    }
}

export default TextNaiveBaye;
