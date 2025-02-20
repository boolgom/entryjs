import Extension from '../extensions/extension';

// 1px * 1px png iamge
const NULL_IMAGE =
    // eslint-disable-next-line max-len
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC';
let EntryPaint;
Entry.Painter = class Painter {
    constructor(view) {
        this.view = view;
        this.cache = [];

        this.file = {
            id: Entry.generateHash(),
            name: '새그림',
            modified: false,
            mode: 'new', // new or edit
        };

        this.dropper = Extension.getExtension('Dropper');
        this.isShow = false;
        this.clipboard = null;
        this._keyboardEvents = [];
        Entry.addEventListener('pictureImport', this.addPicture.bind(this));
        Entry.addEventListener('run', this.detachKeyboardEvents.bind(this));
        Entry.addEventListener('stop', this.attachKeyboardEvents.bind(this));
        this.importEntryPaint();
    }

    async importEntryPaint() {
        EntryPaint = window.EntryPaint.default;
        if (this.requestShow) {
            this.initialize();
        }
    }

    get graphicsMode() {
        return this.entryPaint.graphicsMode;
    }

    initialize() {
        if (this.entryPaint || !EntryPaint) {
            this.requestShow = true;
            return;
        }

        this.isShow = true;

        this.entryPaint = EntryPaint.create({ parent: this.view, mode: 'entry' });
        this.entryPaint.setDropper && this.entryPaint.setDropper(this.dropper);

        this.isImport = true;
        this.entryPaint.on('SNAPSHOT_SAVED', (e) => {
            if (!this.isImport && Entry.stage.selectedObject) {
                Entry.do('editPicture', e, this.entryPaint);
                this.file.modified = true;
            }
            this.isImport = false;
        });
        this.entryPaint.on('NEW_PICTURE', this.newPicture.bind(this));
        this.entryPaint.on('IMPORT_IMAGE', () => {
            Entry.dispatchEvent('openPictureImport');
        });
        this.entryPaint.on('SAVE_PICTURE', () => {
            this.fileSave(false);
        });
        this.entryPaint.on('SAVE_NEW_PICTURE', () => {
            this.file.mode = 'new';
            this.fileSave(false);
        });
        this.entryPaint.on('FULL_SCREEN_ON', () => {
            this.toggleFullscreen(true);
        });
        this.entryPaint.on('FULL_SCREEN_OFF', () => {
            this.toggleFullscreen(false);
        });

        Entry.addEventListener('pictureSelected', this.changePicture.bind(this));
    }

    show() {
        if (!this.isShow) {
            this.initialize();
        }
        this.realign && Entry.windowResized.detach(this.realign);
        this.realign = Entry.windowResized.attach(this.view, this.entryPaint.realign);
    }

    hide() {
        this.alertSaveModifiedPicture();
        this.entryPaint && Entry.windowResized.detach(this.realign);
    }

    newPicture() {
        const newPicture = {
            dimension: {
                height: 1,
                width: 1,
            },
            fileurl: `${Entry.mediaFilePath}_1x1.png`,
            thumbUrl: `${Entry.mediaFilePath}_1x1.png`,
            name: Lang.Painter.new_picture,
            imageType: 'png',
        };

        newPicture.id = Entry.generateHash();
        if (this.file && this.file.objectId) {
            newPicture.objectId = this.file.objectId;
        }
        Entry.playground.addPicture(newPicture, true);
    }

    changePicture(picture = {}, removed) {
        if (this.file && this.file.id === picture.id) {
            if (!this.file.isUpdate) {
                Entry.stage.updateObject();
                this.file.isUpdate = true;
            }
            return;
        } else if (!this.file.modified) {
            this.afterModified(picture);
        } else {
            if (this.isConfirm) {
                return;
            }

            this.isConfirm = true;
            let wasRun = false;
            if (Entry.engine.state === 'run') {
                Entry.engine.toggleStop();
                wasRun = true;
            }

            if (removed) {
                this.updatePicture(picture);
            } else {
                this.alertSaveModifiedPicture(picture, wasRun);
            }
        }
        Entry.stage.updateObject();
        this.file.isUpdate = true;
    }

    updatePicture(picture = {}, wasRun = true, result = true) {
        this.isConfirm = false;
        result ? this.fileSave(true) : (this.file.modified = false);
        wasRun ? Entry.playground.injectPicture() : this.afterModified(picture);
        Entry.stage.updateObject();
    }

    alertSaveModifiedPicture(picture, wasRun) {
        if (!this.file.modified) {
            return;
        }

        Entry.modal.confirm(Lang.Menus.save_modified_shape).then((result) => {
            this.updatePicture(picture, wasRun, result);
        });
    }

    afterModified(picture) {
        const file = this.file;
        file.modified = false;
        this.isImport = true;

        if (picture.id) {
            file.id = picture.id || Entry.generateHash();
            file.name = picture.name;
            file.mode = 'edit';
            file.objectId = picture.objectId;

            this.addPicture(picture, true);
        } else {
            file.id = Entry.generateHash();
            this.entryPaint.reset();
        }

        Entry.stateManager.removeAllPictureCommand();
    }

    getImageSrc(picture) {
        const { fileurl } = picture || {};
        if (fileurl) {
            return fileurl;
        }

        const { imageType = 'png', filename } = picture || {};
        return `${Entry.defaultPath}/uploads/${filename.substring(0, 2)}/${filename.substring(
            2,
            4
        )}/image/${filename}.${imageType === 'svg' ? 'svg' : 'png'}`;
    }

    addPicture(picture = {}, isChangeShape) {
        picture.imageType = picture.imageType || 'png';
        const { imageType } = picture;
        const imageSrc = this.getImageSrc(picture);

        isChangeShape && (this.isImport = true);

        switch (imageType) {
            case 'png':
                this.entryPaint.addBitmap(imageSrc, {
                    graphicsMode: this.isImport ? this.graphicsMode.BITMAP : '',
                });
                break;
            case 'svg':
                this.entryPaint.addSVG(imageSrc, {
                    graphicsMode: this.isImport ? this.graphicsMode.VECTOR : '',
                });
                break;
            default:
                this.entryPaint.addBitmap(imageSrc, {
                    graphicsMode: this.isImport ? this.graphicsMode.BITMAP : '',
                });
        }
    }

    _getImageType() {
        if (this.entryPaint.mode === this.graphicsMode.VECTOR) {
            return 'svg';
        } else {
            return 'png';
        }
    }

    fileSave(taskParam) {
        if (!Entry.stage.selectedObject) {
            return;
        }
        const dataURL = this.entryPaint.getDataURL() || NULL_IMAGE;
        if (this.entryPaint.mode === this.graphicsMode.VECTOR) {
            this.file.svg = this.entryPaint.exportSVG();
        } else {
            delete this.file.svg;
        }
        this.file.ext = this._getImageType();
        const file = JSON.parse(JSON.stringify(this.file));
        Entry.dispatchEvent('saveCanvasImage', {
            file,
            image: dataURL,
            task: taskParam,
        });
        this.file.isUpdate = false;
        this.file.modified = false;
    }

    attachKeyboardEvents() {
        this.detachKeyboardEvents();

        const events = this._keyboardEvents;

        let evt = Entry.keyPressed;
        evt && events.push(evt.attach(this, this._keyboardPressControl));

        evt = Entry.keyUpped;
        evt && events.push(evt.attach(this, this._keyboardUpControl));
    }

    detachKeyboardEvents() {
        const events = this._keyboardEvents;
        if (!events || !events.length) {
            return;
        }

        while (events.length) {
            const evt = events.pop();
            evt.destroy && evt.destroy();
        }
    }

    _keyboardUpControl(e) {}
    _keyboardPressControl(e) {}

    toggleFullscreen(isFullscreen) {
        const { pictureView_ } = Entry.playground;
        const $view = $(this.view);
        if ((isFullscreen !== true && $view.hasClass('fullscreen')) || isFullscreen === false) {
            pictureView_.appendChild(this.view);
            $view.removeClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.fullscreen);
            }
        } else {
            document.body.appendChild(this.view);
            $view.addClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.exit_fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.exit_fullscreen);
            }
        }
        this.entryPaint && this.entryPaint.realign();
    }

    clear() {
        this.toggleFullscreen(false);
    }

    undo() {
        this.entryPaint.undo();
    }

    redo() {
        this.entryPaint.redo();
    }
};
