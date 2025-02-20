'use strict';

Entry.LiterallycanvasPainter = class LiterallycanvasPainter {
    constructor(view) {
        this.view = view;
        this.baseUrl = Entry.painterBaseUrl;

        this.file = {
            id: Entry.generateHash(),
            name: '새그림',
            modified: false,
            mode: 'new', // new or edit
        };

        this._keyboardEvents = [];

        Entry.addEventListener('pictureImport', this.addPicture.bind(this));
        Entry.addEventListener('run', this.detachKeyboardEvents.bind(this));
        Entry.addEventListener('stop', this.attachKeyboardEvents.bind(this));

        //dropdown header dispose
        $('body').on('mouseup', '.active li', () => {
            $('.painterTopHeader.active').removeClass('active');
        });

        this.clipboard = null;
    }

    initialize() {
        if (this.lc) {
            return;
        }

        const that = this;

        const imgURL = that.baseUrl;
        const bgImage = new Image();
        bgImage.src = `${imgURL}/transparent-pattern.png`;

        const WIDTH = 960;
        const HEIGHT = 540;
        that.lc = LC.init(that.view, {
            imageURLPrefix: imgURL,
            zoomMax: 3.0,
            zoomMin: 0.5,
            toolbarPosition: 'bottom',
            imageSize: { width: WIDTH, height: HEIGHT },
            backgroundShapes: [
                LC.createShape('Rectangle', {
                    x: 0,
                    y: 0,
                    width: WIDTH,
                    height: HEIGHT,
                    strokeWidth: 0,
                    strokeColor: 'transparent',
                }),
            ],
        });
        //that.lc.respondToSizeChange();

        bgImage.onload = function () {
            that.lc.repaintLayer('background');
        };

        const watchFunc = function (e) {
            if (e && ((e.shape && !e.opts && e.shape.isPass) || (e.opts && e.opts.isPass))) {
                Entry.do('processPicture', e, that.lc);
            } else {
                Entry.do('editPicture', e, that.lc);
            }
            if (Entry.stage.selectedObject) {
                that.file.modified = true;
            }
        };

        that.lc.on('clear', watchFunc);
        that.lc.on('remove', watchFunc);
        that.lc.on('shapeEdit', watchFunc);
        that.lc.on('shapeSave', watchFunc);

        that.lc.on('toolChange', that.updateEditMenu.bind(that));
        that.lc.on('lc-pointerdrag', that.stagemousemove.bind(that));
        that.lc.on('lc-pointermove', that.stagemousemove.bind(that));

        that.initTopBar();
        that.updateEditMenu();

        that.attachKeyboardEvents();
    }

    show() {
        if (!this.lc) {
            this.initialize();
        }
        this.isShow = true;
    }

    hide() {
        this.isShow = false;
    }

    changePicture(picture = {}) {
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
            Entry.modal.confirm(Lang.Menus.save_modified_shape).then((result) => {
                this.isConfirm = false;
                if (result === true) {
                    this.fileSave(true);
                } else {
                    this.file.modified = false;
                }

                if (!wasRun) {
                    this.afterModified(picture);
                } else {
                    Entry.playground.injectPicture();
                }
            });
        }
        Entry.stage.updateObject();
        this.file.isUpdate = true;
    }

    afterModified(picture) {
        const file = this.file;
        file.modified = false;
        this.lc.clear(false);

        if (picture.id) {
            file.id = picture.id || Entry.generateHash();
            file.name = picture.name;
            file.mode = 'edit';
            file.objectId = picture.objectId;

            this.addPicture(picture, true);
        } else {
            file.id = Entry.generateHash();
        }
        // INFO: picture 변경시마다 undoStack 리셋
        this.lc.undoStack = [];
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
        )}/image/${filename}.${imageType}`;
    }

    addPicture(picture, isOriginal) {
        const image = new Image();

        if (picture.fileurl) {
            image.src = picture.fileurl;
        } else {
            // deprecated
            image.src = `${Entry.defaultPath}/uploads/${picture.filename.substring(
                0,
                2
            )}/${picture.filename.substring(2, 4)}/image/${picture.filename}.png`;
        }

        const dimension = picture.dimension;
        const shape = LC.createShape('Image', {
            x: 480,
            y: 270,
            width: dimension.width,
            height: dimension.height,
            image,
        });

        this.lc.saveShape(shape, !isOriginal);

        image.onload = function () {
            this.lc.setTool(this.lc.tools.SelectShape);
            this.lc.tool.setShape(this.lc, shape);
        }.bind(this);
    }

    copy() {
        if (this.lc.tool.name !== 'SelectShape' || !this.lc.tool.selectedShape) {
            return;
        }

        const shape = this.lc.tool.selectedShape;
        this.clipboard = {
            className: shape.className,
            data: shape.toJSON(),
        };
        this.updateEditMenu();
    }

    cut() {
        if (this.lc.tool.name !== 'SelectShape' || !this.lc.tool.selectedShape) {
            return;
        }

        this.copy();
        const shape = this.lc.tool.selectedShape;
        this.lc.removeShape(shape);
        this.lc.tool.setShape(this.lc, null);
    }

    paste() {
        if (!this.clipboard) {
            return;
        }

        const shape = this.lc.addShape(this.clipboard);
        this.lc.setTool(this.lc.tools.SelectShape);
        this.lc.tool.setShape(this.lc, shape);
    }

    updateEditMenu() {
        const isSelected = this.lc.tool.name === 'SelectShape' ? 'block' : 'none';
        // this._cutButton.style.display = isSelected;
        // this._copyButton.style.display = isSelected;
        // this._pasteButton.style.display = this.clipboard ? "block" : "none";
    }

    fileSave(taskParam) {
        if (!Entry.stage.selectedObject) {
            return;
        }
        this.lc.trigger('dispose');
        const dataURL = this.lc.getImage().toDataURL();
        this.file_ = JSON.parse(JSON.stringify(this.file));
        Entry.dispatchEvent('saveCanvasImage', {
            file: this.file_,
            image: dataURL,
            task: taskParam,
        });

        this.file.isUpdate = false;
        this.file.modified = false;
    }

    newPicture() {
        if (!Entry.stage.selectedObject) {
            return;
        }
        const newPicture = {
            dimension: {
                height: 1,
                width: 1,
            },
            //filename: "_1x1",
            fileurl: `${Entry.mediaFilePath}_1x1.png`,
            thumbUrl: `${Entry.mediaFilePath}_1x1.png`,
            name: Lang.Painter.new_picture,
        };

        newPicture.id = Entry.generateHash();
        if (this.file && this.file.objectId) {
            newPicture.objectId = this.file.objectId;
        }
        Entry.playground.addPicture(newPicture, true);
    }

    _keyboardPressControl(e) {
        if (!this.isShow || Entry.Utils.isInInput(e)) {
            return;
        }

        const keyCode = e.keyCode || e.which;
        const ctrlKey = e.ctrlKey;

        if (keyCode == 8 || keyCode == 46) {
            //destroy
            this.cut();
            e.preventDefault();
        } else if (ctrlKey) {
            if (keyCode == 67) {
                //copy
                this.copy();
            } else if (keyCode == 88) {
                //cut
                this.cut();
            }
        }

        if (ctrlKey && keyCode == 86) {
            //paste
            this.paste();
        }
        this.lc.trigger('keyDown', e);
    }

    _keyboardUpControl(e) {
        if (!this.isShow || Entry.Utils.isInInput(e)) {
            return;
        }

        this.lc.trigger('keyUp', e);
    }

    toggleFullscreen(isFullscreen) {
        const { painter = {}, pictureView_ } = Entry.playground;
        const { view = {} } = painter;
        const $view = $(view);
        if ((isFullscreen !== true && $view.hasClass('fullscreen')) || isFullscreen === false) {
            pictureView_.appendChild(view);
            $(view).removeClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.fullscreen);
            }
        } else {
            document.body.appendChild(view);
            $(view).addClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.exit_fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.exit_fullscreen);
            }
        }
        $(view).find('.lc-drawing.with-gui').trigger('resize');
    }

    initTopBar() {
        const painter = this;

        const ce = Entry.createElement;

        const painterTop = ce(document.getElementById('canvas-top-menu'));
        painterTop.addClass('entryPlaygroundPainterTop');
        painterTop.addClass('entryPainterTop');

        const painterTopFullscreenButton = ce('div', 'entryPainterTopFullscreenButton');
        painterTopFullscreenButton.setAttribute('title', Lang.Painter.fullscreen);
        painterTopFullscreenButton.setAttribute('alt', Lang.Painter.fullscreen);
        painterTopFullscreenButton.addClass('entryPlaygroundPainterFullscreenButton');
        painterTopFullscreenButton.bindOnClick(() => {
            this.toggleFullscreen();
        });
        this.fullscreenButton = painterTopFullscreenButton;
        painterTop.appendChild(painterTopFullscreenButton);

        const painterTopMenu = ce('nav', 'entryPainterTopMenu');
        painterTopMenu.addClass('entryPlaygroundPainterTopMenu');
        painterTop.appendChild(painterTopMenu);

        const painterTopMenuFileNew = ce('div', 'entryPainterTopMenuFileNew');
        painterTopMenuFileNew.bindOnClick(painter.newPicture.bind(this));
        painterTopMenuFileNew.addClass('entryPlaygroundPainterTopMenuFileNew');
        painterTopMenuFileNew.innerHTML = Lang.Painter.new_picture;
        painterTopMenu.appendChild(painterTopMenuFileNew);

        const painterTopMenuFile = ce('div', 'entryPainterTopMenuFile');
        painterTopMenuFile.addClass('entryPlaygroundPainterTopMenuFile painterTopHeader');
        painterTopMenuFile.innerHTML = Lang.Painter.file;
        const painterTopMenuFileDropdown = ce('div');

        painterTopMenuFileDropdown.addClass('entryPlaygroundPainterTopMenuFileDropdown');
        painterTopMenu.appendChild(painterTopMenuFile);
        painterTopMenuFile.appendChild(painterTopMenuFileDropdown);

        const painterTopMenuEdit = ce('div', 'entryPainterTopMenuEdit');
        painterTopMenuEdit.addClass('entryPlaygroundPainterTopMenuEdit painterTopHeader');
        painterTopMenuEdit.innerHTML = Lang.Painter.edit;
        painterTopMenu.appendChild(painterTopMenuEdit);

        const painterTopMenuFileSave = ce('div', 'entryPainterTopMenuFileSave');
        painterTopMenuFileSave.bindOnClick(() => {
            painter.fileSave(false);
        });
        painterTopMenuFileSave.addClass('entryPainterTopMenuFileSave');
        painterTopMenuFileSave.innerHTML = Lang.Painter.painter_file_save;
        painterTopMenuFileDropdown.appendChild(painterTopMenuFileSave);

        const painterTopMenuFileSaveAsLink = ce('div', 'entryPainterTopMenuFileSaveAs');
        painterTopMenuFileSaveAsLink.bindOnClick(() => {
            painter.file.mode = 'new';
            painter.fileSave(false);
        });
        painterTopMenuFileSaveAsLink.addClass('entryPlaygroundPainterTopMenuFileSaveAs');
        painterTopMenuFileSaveAsLink.innerHTML = Lang.Painter.painter_file_saveas;
        painterTopMenuFileDropdown.appendChild(painterTopMenuFileSaveAsLink);

        const painterTopMenuEditDropdown = ce('div');
        painterTopMenuEditDropdown.addClass('entryPlaygroundPainterTopMenuEditDropdown');
        painterTopMenuEdit.appendChild(painterTopMenuEditDropdown);

        const painterTopMenuEditImport = ce('div', 'entryPainterTopMenuEditImport');
        painterTopMenuEditImport.bindOnClick(() => {
            Entry.dispatchEvent('openPictureImport');
        });
        painterTopMenuEditImport.addClass('entryPainterTopMenuEditImport');
        painterTopMenuEditImport.innerHTML = Lang.Painter.get_file;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditImport);

        const painterTopMenuEditCopy = ce('div', 'entryPainterTopMenuEditCopy');
        painterTopMenuEditCopy.bindOnClick(() => {
            painter.copy();
        });
        painterTopMenuEditCopy.addClass('entryPlaygroundPainterTopMenuEditCopy');
        painterTopMenuEditCopy.innerHTML = Lang.Painter.copy_file;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditCopy);

        const painterTopMenuEditCut = ce('div', 'entryPainterTopMenuEditCut');
        painterTopMenuEditCut.bindOnClick(() => {
            painter.cut();
        });
        painterTopMenuEditCut.addClass('entryPlaygroundPainterTopMenuEditCut');
        painterTopMenuEditCut.innerHTML = Lang.Painter.cut_picture;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditCut);

        const painterTopMenuEditPaste = ce('div', 'entryPainterTopMenuEditPaste');
        painterTopMenuEditPaste.bindOnClick(() => {
            painter.paste();
        });
        painterTopMenuEditPaste.addClass('entryPlaygroundPainterTopMenuEditPaste');
        painterTopMenuEditPaste.innerHTML = Lang.Painter.paste_picture;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditPaste);

        const painterTopMenuEditEraseAll = ce('div', 'entryPainterTopMenuEditEraseAll');
        painterTopMenuEditEraseAll.addClass('entryPlaygroundPainterTopMenuEditEraseAll');
        painterTopMenuEditEraseAll.innerHTML = Lang.Painter.remove_all;
        painterTopMenuEditEraseAll.bindOnClick(() => {
            painter.lc.clear();
        });
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditEraseAll);

        $(painterTopMenuFile).on('click tab', menuClickEvent);
        $(painterTopMenuEdit).on('click tab', menuClickEvent);
        $(document).on('click tap', (e) => {
            e.stopPropagation();
            $(painterTopMenuFile).removeClass('active');
            $(painterTopMenuEdit).removeClass('active');
        });

        const painterTopStageXY = ce('div', 'entryPainterTopStageXY');
        const entryPainterTopStageXYLabel = ce('span', 'entryPainterTopStageXYLabel');
        this.painterTopStageXY = entryPainterTopStageXYLabel;
        painterTopStageXY.addClass('entryPlaygroundPainterTopStageXY');
        entryPainterTopStageXYLabel.addClass('entryPainterTopStageXYLabel');
        painterTopStageXY.appendChild(entryPainterTopStageXYLabel);
        painterTop.appendChild(painterTopStageXY);

        Entry.addEventListener('pictureSelected', this.changePicture.bind(this));

        function menuClickEvent(e) {
            $(painterTopMenuFile).removeClass('active');
            $(painterTopMenuEdit).removeClass('active');
            if (e.target === this) {
                e.stopImmediatePropagation();
                $(this).addClass('active');
            }
        }
    }

    stagemousemove(event) {
        this.painterTopStageXY.textContent = `x:${event.x.toFixed(1)}, y:${event.y.toFixed(1)}`;
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

    clear() {
        this.toggleFullscreen(false);
    }

    undo() {
        this.lc.undo();
    }

    redo() {
        if (this.lc.canRedo()) {
            this.lc.redo();
        }
    }
};
