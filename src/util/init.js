'use strict';

import { Destroyer } from './destroyer/Destroyer';
import { GEHelper } from '../graphicEngine/GEHelper';
import Expansion from '../class/Expansion';
import EntryBlockHelper from '../class/helper';
import AIUtilize from '../class/AIUtilize';
import AILearning from '../class/AILearning';
import Extension from '../extensions/extension';
import CloudVariable from '../extensions/CloudVariable';
import DataSource from '../util/dataSource';

import './utils';

/**
 * Initialize method with options.
 * @param {HTMLElement} container for entry workspace or others.
 * @param {Object} options for initialize.
 */
Entry.init = function (container, options) {
    Entry.assert(typeof options === 'object', 'Init option is not object');
    Entry.assert(!!container, 'root container must be provided');

    this.events_ = {};
    this.interfaceState = {
        menuWidth: 264,
    };

    Entry.Utils.bindGlobalEvent([
        'resize',
        'mousedown',
        'mousemove',
        'keydown',
        'keyup',
        'dispose',
    ]);

    this.options = options;
    this.parseOptions(options);
    setDefaultPathsFromOptions(options);
    this.cloudVariable = CloudVariable.getInstance();

    if (this.type === 'workspace' && this.isPhone()) {
        this.type = 'phone';
    }
    this.initialize_();
    this.initSoundQueue_();
    /** @type {!Element} */
    this.view_ = container;
    $(this.view_).addClass('entry');
    if (this.type === 'minimize') {
        $(this.view_).addClass(this.type);
    }
    // if (this.device === 'tablet') $(this.view_).addClass('tablet');

    Entry.initFonts(options.fonts);
    setDefaultTheme(options);

    Entry.paintMode = options.paintMode || 'entry-paint';
    container && this.createDom(container, this.type);
    this.loadInterfaceState();
    this.overridePrototype();
    this.maxCloneLimit = 360;
    this.cloudSavable = true;
    this.startTime = new Date().getTime();

    document.onkeydown = function (e) {
        Entry.dispatchEvent('keyPressed', e);
    };
    document.onkeyup = function (e) {
        Entry.dispatchEvent('keyUpped', e);
    };
    window.onresize = function (e) {
        Entry.dispatchEvent('windowResized', e);
    };
    window.onbeforeunload = this.beforeUnload;

    Entry.addEventListener('saveWorkspace', () => {
        Entry.addActivity('save');
    });

    Entry.addEventListener('showBlockHelper', () => {
        Entry.propertyPanel.select('helper');
    });

    // if (Entry.getBrowserType().substr(0, 2) === 'IE' && !window.flashaudio) {
    //     createjs.FlashAudioPlugin.swfPath = `${this.mediaFilePath}media/`;
    //     createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]);
    //     window.flashaudio = true;
    // } else {
    //     createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
    // }
    createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);

    Entry.loadAudio_(
        [
            `${Entry.mediaFilePath}sounds/click.mp3`,
            `${Entry.mediaFilePath}sounds/click.wav`,
            `${Entry.mediaFilePath}sounds/click.ogg`,
        ],
        'entryMagneting'
    );
    Entry.loadAudio_(
        [
            `${Entry.mediaFilePath}sounds/delete.mp3`,
            `${Entry.mediaFilePath}sounds/delete.ogg`,
            `${Entry.mediaFilePath}sounds/delete.wav`,
        ],
        'entryDelete'
    );

    createjs.Sound.stop();
    BigNumber.config({ ERRORS: false });
};

const setDefaultPathsFromOptions = function (options) {
    const {
        libDir = '/lib',
        entryDir = '/@entrylabs/entry',
        defaultDir = '',
        soundDir = '',
        blockInjectDir = '',
        baseUrl = location.origin || 'https://playentry.org',
        offlineModulePath,
    } = options;

    Entry.mediaFilePath = `${libDir}${entryDir}/images/`;
    Entry.painterBaseUrl = `${libDir}/literallycanvas-mobile/lib/img`;
    Entry.defaultPath = defaultDir;
    Entry.soundPath = soundDir;
    Entry.blockInjectPath = blockInjectDir;
    Entry.offlineModulePath = offlineModulePath;
    Entry.baseUrl = baseUrl.replace(/\/$/, '');
    Entry.moduleBaseUrl = `${Entry.baseUrl}/modules/`;
    Entry.moduleliteBaseUrl = `${Entry.baseUrl}/moduleslite/`;
};

const setDefaultTheme = function (options) {
    const { theme = 'default' } = options;
    if (theme !== 'default') {
        try {
            EntryStatic.colorSet = require(`../theme/${theme}`);
            require('../playground/block_entry').assignBlocks();
        } catch (e) {
            console.log('not exist theme!', e);
        }
    }
};

Entry.changeContainer = function (container) {
    container.appendChild(this.view_);
};

Entry.loadAudio_ = function (filenames, name) {
    if (!window.Audio || !filenames.length) {
        // No browser support for Audio.
        return;
    }

    for (let i = 0; i < filenames.length; i++) {
        const filename = filenames[i];
        Entry.soundQueue.loadFile({
            id: name,
            src: filename,
            type: createjs.LoadQueue.SOUND,
        });
        break;
    }
};

/**
 * Initialize function for Entry.
 * @private
 */
Entry.initialize_ = function () {
    /** @type {Destroyer} */
    this._destroyer = this._destroyer || new Destroyer();
    this._destroyer.destroy();

    GEHelper.INIT(this.options.useWebGL);
    this.stage = new Entry.Stage();
    this._destroyer.add(this.stage);

    if (Entry.engine && Entry.engine.projectTimer) {
        Entry.engine.clearTimer();
    }

    this.engine = new Entry.Engine();
    this._destroyer.add(this.engine);

    if (this.type !== 'minimize') {
        this.propertyPanel = new Entry.PropertyPanel();
    }

    this.container = new Entry.Container();
    this._destroyer.add(this.container);

    this.helper = new EntryBlockHelper();
    this.youtube = new Entry.Youtube();
    this.modal = new Entry.Modal();
    // this.tvCast = new Entry.TvCast();
    // this.doneProject = new Entry.DoneProject();

    this.variableContainer = new Entry.VariableContainer();

    if (this.type === 'workspace' || this.type === 'phone' || this.type === 'playground') {
        this.stateManager = new Entry.StateManager();
    }
    this.commander = new Entry.Commander(this.type, this.doNotSkipAny);

    this.scene = new Entry.Scene();
    this._destroyer.add(this.scene);

    this.playground = new Entry.Playground();
    this._destroyer.add(this.playground);

    this.blockCountViewer = new Entry.BlockCountViewer(this.playground);
    this._destroyer.add(this.blockCountViewer);

    if (this.options.expansionDisable === false || this.options.expansionDisable === undefined) {
        this.expansion = new Expansion(this.playground);
        this._destroyer.add(this.expansion);
        this.expansion.init();
    }

    if (this.options.aiUtilizeDisable === false || this.options.aiUtilizeDisable === undefined) {
        this.aiUtilize = new AIUtilize(this.playground);
        this._destroyer.add(this.aiUtilize);
        this.aiLearning = new AILearning(this.playground, this.aiLearningEnable);
        this._destroyer.add(this.aiLearning);
        this.aiUtilize.init();
        this.aiLearning.init();
    }

    this.intro = new Entry.Intro();

    this.toast = new Entry.Toast();

    if (this.hw) {
        this.hw.closeConnection();
    }
    this.hw = new Entry.HW();

    this.hwLite = new Entry.HWLite(this.playground);

    if (Entry.enableActivityLogging) {
        this.reporter = new Entry.Reporter(false);
    } else if (this.type === 'workspace' || this.type === 'phone') {
        this.reporter = new Entry.Reporter(true);
    }
};

Entry.disposeContainer = function () {
    this._destroyer = this._destroyer || new Destroyer();
    this._destroyer.destroy();
    while (this.view_.firstChild) {
        this.view_.removeChild(this.view_.firstChild);
    }
};

Entry.initSoundQueue_ = function () {
    Entry.soundQueue = new createjs.LoadQueue();
    Entry.soundQueue.installPlugin(createjs.Sound);
    Entry.soundInstances = new DataSource();
    Entry.bgmInstances = new DataSource();
    Entry.soundQueue.urls = new Set();
    Entry.soundQueue.total = 0;
    Entry.soundQueue.loadCallback = (src) => {
        if (!Entry.soundQueue.urls.has(src)) {
            return;
        }
        Entry.soundQueue.total = Math.max(Entry.soundQueue.total, Entry.soundQueue.urls.size);
        Entry.soundQueue.urls.delete(src);
        const now = Entry.soundQueue.urls.size;
        if (!Entry.soundQueue.loadComplete && now < 1) {
            Entry.soundQueue.loadComplete = true;
            Entry.dispatchEvent('soundLoaded');
        }
    };
    Entry.soundQueue.on('fileload', (event) => {
        Entry.soundQueue.loadCallback(event.item.src);
    });
    Entry.soundQueue.on('error', (event) => {
        console.error('load sound, error', event);
        Entry.soundQueue.loadCallback(event.data.src);
    });
};
/**
 * Initialize html DOM view for entry.
 * This work differently with initialize option.
 * @param {HTMLElement} container for entry workspace or others.
 * @param {string} type for create dom by type.
 */
Entry.createDom = function (container, type) {
    const textCanvasContainer = Entry.createElement('div', 'textCanvasContainer');
    textCanvasContainer.style.display = 'none';
    container.appendChild(textCanvasContainer);

    switch (type) {
        case 'minimize': {
            const canvas = _createCanvasElement(['entryCanvasWorkspace', 'minimize']);
            const canvasWrapper = Entry.createElement('div', 'entryCanvasWrapper');
            canvasWrapper.appendChild(canvas);
            container.appendChild(canvasWrapper);

            this.canvas_ = canvas;
            this.stage.initStage(this.canvas_);

            const engineView = Entry.createElement('div');
            container.appendChild(engineView);
            this.engineView = engineView;
            this.engine.generateView(this.engineView, type);
            Entry.addEventListener('dispatchEventDidTogglePause', () =>
                Entry.engine.view_.classList.toggle('paused')
            );
            break;
        }
        case 'phone': {
            this.stateManagerView = Entry.createElement('div');
            this.stateManager.generateView(this.stateManagerView, type);

            const engineView = Entry.createElement('div');
            container.appendChild(engineView);
            this.engineView = engineView;
            this.engine.generateView(this.engineView, type);

            const canvas = _createCanvasElement('entryCanvasPhone');

            engineView.insertBefore(canvas, this.engine.footerView_);
            this.canvas_ = canvas;
            this.stage.initStage(this.canvas_);

            const containerView = Entry.createElement('div');
            container.appendChild(containerView);
            this.containerView = containerView;
            this.container.generateView(this.containerView);

            const playgroundView = Entry.createElement('div');
            container.appendChild(playgroundView);
            this.playgroundView = playgroundView;
            this.playground.generateView(this.playgroundView, type);
            break;
        }
        case 'playground': {
            const playgroundView = Entry.createElement('div');
            container.appendChild(playgroundView);
            this.playgroundView = playgroundView;
            this.playground.generateView(this.playgroundView, type);
            break;
        }
        case 'invisible': {
            // 아무런 뷰도 그리지 않는다.
            break;
        }
        case 'workspace':
        default: {
            Entry.documentMousedown.attach(this, this.cancelObjectEdit);

            const topFloatingView = Entry.createElement('div');
            topFloatingView.addClass('entryTopFloatingView');
            container.appendChild(topFloatingView);

            const sceneView = Entry.createElement('div');
            topFloatingView.appendChild(sceneView);
            this.sceneView = sceneView;
            this.scene.generateView(this.sceneView, type);

            const blockCountViewerView = Entry.createElement('div');
            blockCountViewerView.addClass('entryBlockCountView');
            topFloatingView.appendChild(blockCountViewerView);
            this.blockCountViewerView = blockCountViewerView;
            this.blockCountViewer.generateView(this.blockCountViewerView, type);

            const stateManagerView = Entry.createElement('div');
            this.sceneView.appendChild(stateManagerView);
            this.stateManagerView = stateManagerView;
            this.stateManager.generateView(this.stateManagerView, type);

            const engineContainer = Entry.createElement('div');
            engineContainer.classList.add('engineContainer');
            container.appendChild(engineContainer);
            const engineView = Entry.createElement('div');
            engineContainer.appendChild(engineView);
            this.engineContainer = engineContainer;
            this.engineView = engineView;
            this.engine.generateView(this.engineView, type);

            const canvas = _createCanvasElement('entryCanvasWorkspace');
            this.engine.mouseView.after(canvas);

            canvas.addEventListener('mousewheel', (evt) => {
                const mousePosition = Entry.stage.mouseCoordinate;
                const tempList = Entry.variableContainer.getListById(mousePosition);
                const wheelDirection = evt.wheelDelta > 0;

                for (let i = 0; i < tempList.length; i++) {
                    const list = tempList[i];
                    if (wheelDirection) {
                        if (list.scrollButton_.y >= 46) {
                            list.scrollButton_.y -= 25;
                        } else {
                            list.scrollButton_.y = 25;
                        }
                    } else {
                        list.scrollButton_.y += 25;
                    }
                    list.updateView();
                }
            });

            this.canvas_ = canvas;
            this.extension = new Extension();
            this.stage.initStage(this.canvas_);

            const containerView = Entry.createElement('div');
            this.propertyPanel.generateView(engineContainer, type);
            this.containerView = containerView;
            this.container.generateView(this.containerView);
            this.propertyPanel.addMode('object', this.container);

            this.helper.generateView(this.containerView, type);
            this.propertyPanel.addMode('helper', this.helper);

            const introView = Entry.createElement('div');
            container.appendChild(introView);
            this.introView = introView;
            this.intro.generateView(this.introView, type);

            const playgroundView = Entry.createElement('div');
            container.appendChild(playgroundView);
            this.playgroundView = playgroundView;
            this.playground.generateView(this.playgroundView, type);

            this.propertyPanel.select('object');
            this.helper.bindWorkspace(this.playground.mainWorkspace);
        }
    }
};

/**
 * @param className {string|string[]}
 * @private
 */
const _createCanvasElement = (className) => {
    const canvas = Entry.createElement('canvas');
    canvas.id = 'entryCanvas';
    canvas.width = 640;
    canvas.height = 360;

    if (Array.isArray(className)) {
        canvas.className = className.join(' ');
    } else {
        canvas.addClass(className);
    }

    return canvas;
};

Entry.start = function () {
    if (Entry.type === 'invisible') {
        return;
    }
    /** @type {number} */
    if (!this.FPS) {
        this.FPS = 60;
    }
    Entry.assert(typeof this.FPS === 'number', 'FPS must be number');
    Entry.engine.start(this.FPS);
};

Entry.stop = function () {
    if (Entry.type === 'invisible') {
        return;
    }
    this.FPS = null;
    Entry?.engine?.stop();
};

/**
 * Parse init options
 * @param {!object} options for parse
 */
Entry.parseOptions = function (options) {
    /** @type {string} */
    this.type = options.type || this.type;

    this.hashId = options.hashId || this.hashId;

    if (options.device) {
        this.device = options.device;
    }

    this.projectSaveable = options.projectsaveable;
    if (this.projectSaveable === undefined) {
        this.projectSaveable = true;
    }

    this.objectAddable = options.objectaddable;
    if (this.objectAddable === undefined) {
        this.objectAddable = true;
    }

    this.objectEditable = options.objectEditable;
    if (this.objectEditable === undefined) {
        this.objectEditable = true;
    }
    if (!this.objectEditable) {
        this.objectAddable = false;
    }

    this.objectDeletable = options.objectdeletable;
    if (this.objectDeletable === undefined) {
        this.objectDeletable = true;
    }

    this.soundEditable = options.soundeditable;
    if (this.soundEditable === undefined) {
        this.soundEditable = true;
    }

    this.pictureEditable = options.pictureeditable;
    if (this.pictureEditable === undefined) {
        this.pictureEditable = true;
    }

    this.sceneEditable = options.sceneEditable;
    if (this.sceneEditable === undefined) {
        this.sceneEditable = true;
    }

    this.functionEnable = options.functionEnable;
    if (this.functionEnable === undefined) {
        this.functionEnable = true;
    }

    this.messageEnable = options.messageEnable;
    if (this.messageEnable === undefined) {
        this.messageEnable = true;
    }

    this.variableEnable = options.variableEnable;
    if (this.variableEnable === undefined) {
        this.variableEnable = true;
    }

    this.aiLearningEnable = options.aiLearningEnable;
    if (this.aiLearningEnable === undefined) {
        this.aiLearningEnable = true;
    }

    this.hardwareEnable = options.hardwareEnable;
    if (this.hardwareEnable === undefined) {
        this.hardwareEnable = true;
    }

    this.listEnable = options.listEnable;
    if (this.listEnable === undefined) {
        this.listEnable = true;
    }

    this.doCommandAll = options.doCommandAll;
    if (this.doCommandAll === undefined) {
        this.doCommandAll = false;
    }

    this.backpackDisable = options.backpackDisable;
    if (this.backpackDisable === undefined) {
        this.backpackDisable = false;
    }

    this.exportObjectEnable = options.exportObjectEnable;
    if (this.exportObjectEnable === undefined) {
        this.exportObjectEnable = true;
    }

    this.iframeDomAccess = options.iframeDomAccess;
    if (this.iframeDomAccess === undefined) {
        //direct, message, none
        this.iframeDomAccess = 'direct';
    }

    this.blockSaveImageEnable = options.blockSaveImageEnable;
    if (this.blockSaveImageEnable === undefined) {
        this.blockSaveImageEnable = true;
    }

    this.hasVariableManager = options.hasvariablemanager;
    if (!(this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable)) {
        this.hasVariableManager = false;
    } else if (this.hasVariableManager === undefined) {
        this.hasVariableManager = true;
    }

    this.readOnly = options.readOnly || false;
    if (this.readOnly) {
        this.soundEditable = false;
        this.sceneEditable = false;
        this.objectAddable = false;
    }

    if (options.isForLecture) {
        this.isForLecture = options.isForLecture;
    }
    if (options.textCodingEnable) {
        this.textCodingEnable = options.textCodingEnable;
    }

    this.fullScreenEnable = options.fullScreenEnable;
    if (this.fullScreenEnable === undefined) {
        this.fullScreenEnable = true;
    }
    this.modalContainer = options.modalContainer || $('body')[0];
};

Entry.initFonts = function (fonts) {
    this.fonts = fonts;
    if (!fonts) {
        this.fonts = [];
    }
};

Entry.reloadOption = function (options) {
    this.options = options;
    this.parseOptions(options);
    this.playground.applyTabOption();
    this.variableContainer.applyOption();
    this.engine.applyOption();
    this.commander.applyOption();
};

Entry.Utils.initEntryEvent_ = function () {
    if (!Entry.events_) {
        Entry.events_ = [];
    }
};

Entry.getSoundPath = (sound) =>
    sound.fileurl ||
    `${Entry.defaultPath}/uploads/${sound.filename.substring(0, 2)}/${sound.filename.substring(
        2,
        4
    )}/${Entry.soundPath}${sound.filename}${sound.ext || '.mp3'}`;

/**
 * initialize sound
 * @param {object} sound
 */
Entry.initSound = function (sound) {
    if (!sound || !sound.duration || sound.duration == 0) {
        return;
    }
    sound.path =
        sound.fileurl ||
        `${Entry.defaultPath}/uploads/${sound.filename.substring(0, 2)}/${sound.filename.substring(
            2,
            4
        )}/${Entry.soundPath}${sound.filename}${sound.ext || '.mp3'}`;
    Entry.soundQueue.urls.add(sound.path);
    Entry.soundQueue.loadFile({
        id: sound.id,
        src: sound.path,
        type: createjs.LoadQueue.SOUND,
    });
    setTimeout(() => {
        Entry.soundQueue.loadCallback(sound.path);
    }, 3000);
};

Entry.loadAllBlocks = function (options = {}) {
    if (options.aiUtilizeDisable === false || options.aiUtilizeDisable === undefined) {
        this.aiUtilize = new AIUtilize();
        this.aiLearning = new AILearning();
        this.aiUtilize.init();
        this.aiLearning.init();
    }

    if (options.expansionDisable === false || options.expansionDisable === undefined) {
        this.expansion = new Expansion(this.playground);
        this.expansion.init();
    }
};
