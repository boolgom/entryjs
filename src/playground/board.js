import debounce from 'lodash/debounce';
import _get from 'lodash/get';

Entry.Board = class Board {
    constructor(option) {
        Entry.Model(this, false);
        this.scale = option.scale || 1;
        this.readOnly = option.readOnly === undefined ? false : option.readOnly;
        this.changeEvent = new Entry.Event(this);

        this.createView(option);
        this.updateOffset();

        this.scroller = new Entry.Scroller(this, true, true);

        this._magnetMap = {};

        Entry.ANIMATION_DURATION = 200;
        Entry.BOARD_PADDING = 100;

        this._initContextOptions();
        Entry.Utils.disableContextmenu(this.svgDom);

        this._addControl();
        this._bindEvent();
        this.observe(this, 'handleVisibleComment', ['isVisibleComment'], false);
        Entry.addEventListener('fontLoaded', this.reDraw.bind(this));
        if (!Entry.codeChangedEvent) {
            Entry.codeChangedEvent = new Entry.Event(window);
        }

        const updateObjectBlockCount = () => {
            this.updateObjectBlockCount(Entry.container.selectedObject);
        };
        Entry.codeChangedEvent.attach(this, updateObjectBlockCount);
        Entry.addEventListener('loadComplete', updateObjectBlockCount);

        Entry.Utils.setSVGDom(this.svgDom);
    }

    static get OPTION_PASTE() {
        return 0;
    }
    static get OPTION_ALIGN() {
        return 1;
    }
    static get OPTION_CLEAR() {
        return 2;
    }
    static get OPTION_DOWNLOAD() {
        return 3;
    }
    static get ADD_COMMENT() {
        return 4;
    }
    static get VISIBLE_COMMENT() {
        return 5;
    }
    static get DRAG_RADIUS() {
        return 5;
    }
    static get FIRST_DRAG_RADIUS() {
        return 10;
    }

    schema = {
        code: null,
        dragBlock: null,
        magnetedBlockView: null,
        selectedBlockView: null,
        isVisibleComment: true,
    };

    createView(option) {
        let dom = option.dom;
        if (typeof dom === 'string') {
            dom = $(`#${dom}`);
        } else {
            dom = $(dom);
        }

        if (dom.prop('tagName') !== 'DIV') {
            return console.error('Dom is not div element');
        }

        this.view = dom;
        this._svgId = `play${new Date().getTime()}`;

        this.workspace = option.workspace;

        this._activatedBlockView = null;

        this.wrapper = Entry.Dom('div', {
            parent: dom,
            class: 'entryBoardWrapper',
        });

        this.svgDom = Entry.Dom(
            $(
                `<svg id="${this._svgId}" class="entryBoard" width="100%" height="100%"` +
                    `version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>`
            ),
            { parent: this.wrapper }
        );

        this.visible = true;
        this.svg = Entry.SVG(this._svgId);
        $(window).scroll(this.updateOffset.bind(this));

        this.svgGroup = this.svg.elem('g');
        this.svgGroup.attr('transform', `scale(${this.scale})`);
        this.svgObjectTitle = this.svgGroup.elem('g');
        this.svgObjectTitle.board = this;
        this.svgObjectTitle.attr({
            class: 'svgObjectTitle',
        });

        this.svgObjectBlockCount = this.svgGroup.elem('g');
        this.svgObjectBlockCount.board = this;
        this.svgObjectBlockCount.attr({
            class: 'svgObjectBlockCount',
        });

        this.svgThreadGroup = this.svgGroup.elem('g');
        this.svgThreadGroup.board = this;

        this.svgBlockGroup = this.svgGroup.elem('g');
        this.svgBlockGroup.board = this;

        this.svgCommentGroup = this.svgGroup.elem('g');
        this.svgCommentGroup.board = this;

        if (option.isOverlay) {
            this.wrapper.addClass('entryOverlayBoard');
            this.generateButtons();
            this.suffix = 'overlayBoard';
        } else {
            this.suffix = 'board';
        }

        Entry.Utils.addFilters(this.svg, this.suffix);
        this.pattern = Entry.Utils.addBlockPattern(this.svg, this.suffix).pattern;
    }

    changeCode(code, shouldNotCreateView, cb) {
        if (this.code && this.codeListener) {
            this.codeListener.destroy();
        }

        this.set({ code });

        const that = this;
        if (code && !shouldNotCreateView) {
            this.codeListener = this.code.changeEvent.attach(this, () => {
                that.changeEvent.notify();
            });
            this.svgCommentGroup.remove();
            this.svgBlockGroup.remove();
            this.svgThreadGroup.remove();
            code.createView(this);
            if (code.isAllThreadsInOrigin()) {
                this.alignThreads();
            }
            cb && cb();
        }
        this.scroller.resizeScrollBar();
    }

    bindCodeView(codeView) {
        this.svgCommentGroup.remove();
        this.svgBlockGroup.remove();
        this.svgThreadGroup.remove();
        this.svgCommentGroup = codeView.svgCommentGroup;
        this.svgBlockGroup = codeView.svgBlockGroup;
        this.svgThreadGroup = codeView.svgThreadGroup;
        this.svgGroup.appendChild(this.svgThreadGroup);
        this.svgGroup.appendChild(this.svgBlockGroup);
        this.svgGroup.appendChild(this.svgCommentGroup);
    }

    setMagnetedBlock(block, magnetType) {
        if (this.magnetedBlockView === block) {
            return;
        }

        this.magnetedBlockView && this.magnetedBlockView.set({ magneting: false });
        this.set({ magnetedBlockView: block });
        if (block) {
            block.set({ magneting: magnetType });
            block.dominate();
        }
    }

    getCode() {
        return this.code;
    }

    findById(id) {
        return this.code.findById(id);
    }

    _addControl() {
        const dom = this.svgDom;
        const that = this;
        dom.mousedown(function () {
            that.onMouseDown(...arguments);
        });
        dom.bind('touchstart', function () {
            that.onMouseDown(...arguments);
        });
        dom.on('wheel', function () {
            that.mouseWheel(...arguments);
        });

        const scroller = that.scroller;
        if (scroller) {
            dom.mouseenter(() => {
                scroller.setOpacity(0.8);
            });
            dom.mouseleave(() => {
                scroller.setOpacity(0);
            });
        }

        Entry.Utils.bindBlockViewHoverEvent(this, dom);
    }

    removeControl(eventType) {
        this.svgDom.off(eventType);
    }

    onMouseDown(e) {
        if (this.workspace.getMode() == Entry.Workspace.MODE_VIMBOARD) {
            return;
        }

        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.which == 2) {
            console.log('mouse wheel click disabled');
            return;
        }

        if (this.workingEvent) {
            return;
        }

        this.workingEvent = true;

        if (Entry.isMobile()) {
            this.scroller.setOpacity(0.8);
        }
        const board = this;
        let longPressTimer = null;
        let dragMode = Entry.DRAG_MODE_NONE;
        if (e.button === 0 || (e.originalEvent && e.originalEvent.touches)) {
            const eventType = e.type;
            const mouseEvent = Entry.Utils.convertMouseEvent(e);
            if (Entry.documentMousedown) {
                Entry.documentMousedown.notify(mouseEvent);
            }
            dragMode = Entry.DRAG_MODE_MOUSEDOWN;
            const doc = $(document);

            this.mouseDownCoordinate = {
                x: mouseEvent.pageX,
                y: mouseEvent.pageY,
            };

            doc.bind('mousemove.entryBoard', onMouseMove);
            doc.bind('mouseup.entryBoard', onMouseUp);
            doc.bind('touchmove.entryBoard', onMouseMove);
            doc.bind('touchend.entryBoard', onMouseUp);
            this.dragInstance = new Entry.DragInstance({
                startX: mouseEvent.pageX,
                startY: mouseEvent.pageY,
                offsetX: mouseEvent.pageX,
                offsetY: mouseEvent.pageY,
            });

            if (eventType === 'touchstart' || Entry.isMobile()) {
                longPressTimer = setTimeout(() => {
                    if (longPressTimer) {
                        longPressTimer = null;
                        onMouseUp();
                        board._rightClick(e);
                    }
                }, 1000);
            }
        } else if (Entry.Utils.isRightButton(e)) {
            this._rightClick(e);
        }

        function onMouseMove(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }

            const mouseEvent = Entry.Utils.convertMouseEvent(e);

            const mouseDownCoordinate = board.mouseDownCoordinate;
            const pageX = mouseEvent.pageX;
            const pageY = mouseEvent.pageY;
            const diff = Math.sqrt(
                Math.pow(pageX - mouseDownCoordinate.x, 2) +
                    Math.pow(pageY - mouseDownCoordinate.y, 2)
            );

            if (
                (dragMode === Entry.DRAG_MODE_DRAG && diff > Entry.Board.DRAG_RADIUS) ||
                (dragMode === Entry.DRAG_MODE_MOUSEDOWN && diff > Entry.Board.FIRST_DRAG_RADIUS)
            ) {
                dragMode = Entry.DRAG_MODE_DRAG;
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }

                const dragInstance = board.dragInstance;
                board.scroller.scroll(pageX - dragInstance.offsetX, pageY - dragInstance.offsetY);
                dragInstance.set({ offsetX: pageX, offsetY: pageY });
            }
        }

        function onMouseUp() {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            if (Entry.isMobile()) {
                board.scroller.setOpacity(0);
            }
            $(document).unbind('.entryBoard');
            delete board.workingEvent;
            delete board.mouseDownCoordinate;
            delete board.dragInstance;
        }
    }

    mouseWheel(e) {
        e = e.originalEvent;
        e.preventDefault();
        const disposeEvent = Entry.disposeEvent;
        if (disposeEvent) {
            disposeEvent.notify(e);
        }

        this.scroller.scroll(e.wheelDeltaX || -e.deltaX, e.wheelDeltaY || -e.deltaY);
    }

    setSelectedBlock(blockView) {
        const old = this.selectedBlockView;

        if (old) {
            old.removeSelected();
        }

        if (blockView instanceof Entry.BlockView) {
            blockView.addSelected();
        } else {
            blockView = null;
        }

        this.set({ selectedBlockView: blockView });
    }

    hide() {
        this.wrapper.addClass('entryRemove');
        this.visible = false;
    }

    show() {
        this.wrapper.removeClass('entryRemove');
        this.visible = true;
    }

    initCommentSchema() {
        const blockMap = this.code._blockMap;
        const keys = Object.keys(blockMap) || [];

        keys.forEach((id) => {
            const comment = blockMap[id];
            if (comment instanceof Entry.Comment) {
                comment.initSchema();
            }
        });
    }

    alignThreads(reDraw) {
        const threads = this.code.getThreads();
        if (!threads.length) {
            return;
        }

        this.initCommentSchema();

        const verticalGap = 15;
        let acculmulatedTop = 15;
        let columWidth = 0;
        const limitTopPosition = this.svgDom.height() - 30;
        let left = 50;

        threads.forEach((thread) => {
            const block = thread.getFirstBlock();
            if (!block) {
                return;
            }
            if (!this.isVisibleComment && block instanceof Entry.Comment) {
                return;
            }
            reDraw && thread.view.reDraw();
            const blockView = block.view;
            if (!blockView.movable) {
                return;
            }
            const bBox = blockView.svgGroup.getBBox();
            let top = acculmulatedTop + verticalGap;
            if (top > limitTopPosition) {
                left = left + columWidth + 10;
                columWidth = 0;
                acculmulatedTop = 15;
            }
            columWidth = Math.max(columWidth, bBox.width * this.scale);
            top = acculmulatedTop + verticalGap;
            if (block instanceof Entry.Block) {
                blockView.moveTo(left, top, false);
            } else {
                blockView.moveTo(left / this.scale, top / this.scale, false);
            }
            acculmulatedTop = top + bBox.height * this.scale;
        });
        this.scroller.resizeScrollBar();
    }

    clear() {
        this.svgCommentGroup.remove();
        this.svgBlockGroup.remove();
        this.svgThreadGroup.remove();
        this.clearObjectTitle();
        this.clearObjectBlockCount();
    }

    updateOffset() {
        this._offset = this.svg.getBoundingClientRect();
        const w = $(window);
        const scrollTop = w.scrollTop();
        const scrollLeft = w.scrollLeft();
        const offset = this._offset;

        this.relativeOffset = {
            top: offset.top - scrollTop,
            left: offset.left - scrollLeft,
        };

        const svgDom = this.svgDom;
        if (svgDom) {
            this._svgDomRect = {
                width: svgDom.width(),
                height: svgDom.height(),
            };
        }

        if (this.btnWrapper) {
            this.btnWrapper.attr({
                transform: `translate(${offset.width / 2 - 65},${offset.height - 200})`,
            });
        }
    }

    generateButtons() {
        this.btnWrapper = this.svg.elem('g');
        const btnWrapper = this.btnWrapper;

        const BLUE_CLASS = 'entryFunctionButtonText';
        const WHITE_CLASS = 'entryFunctionButton';

        const saveButton = btnWrapper.elem('rect', {
            x: 74,
            y: 12,
            width: 64,
            height: 32,
            rx: 4,
            ry: 4,
            class: BLUE_CLASS,
        });
        this.saveButton = saveButton;

        const cancelButton = btnWrapper.elem('rect', {
            x: 0,
            y: 12,
            width: 64,
            height: 32,
            rx: 4,
            ry: 4,
            class: 'entryFunctionButtonBorder',
        });

        const saveText = btnWrapper.elem('text', {
            x: 106,
            y: 33,
            class: WHITE_CLASS,
        });
        saveText.textContent = Lang.Buttons.save;

        const cancelText = btnWrapper.elem('text', {
            x: 32,
            y: 33,
            class: BLUE_CLASS,
        });
        cancelText.textContent = Lang.Buttons.cancel;

        const saveFunc = this.save.bind(this);
        const cancelFunc = this.cancelEdit.bind(this);
        this.cancelButton = cancelButton;

        $(saveButton).bind('mousedown touchstart', saveFunc);
        $(saveText).bind('mousedown touchstart', saveFunc);
        $(cancelButton).bind('mousedown touchstart', cancelFunc);
        $(cancelText).bind('mousedown touchstart', cancelFunc);
    }

    cancelEdit() {
        Entry.disposeEvent.notify();
        Entry.do('funcEditEnd', 'cancel');
    }

    save() {
        Entry.disposeEvent.notify();
        Entry.do('funcEditEnd', 'save');
    }

    generateCodeMagnetMap() {
        const code = this.code;
        const dragBlock = this.dragBlock;
        if (!(code && dragBlock)) {
            return;
        }

        //reset magnetMap
        this._magnetMap = {};

        for (const targetType in dragBlock.magnet) {
            if (
                targetType === 'next' &&
                dragBlock.thread && // 파이썬 변환 후 basic skeleton 블록이 필드에 있는 경우 제외
                dragBlock.block.getLastBlock().view.magnet.next === undefined
            ) {
                continue;
            }

            const metaData = this._getCodeBlocks(code, targetType).sort(
                (a, b) => a.point - b.point
            );

            metaData.unshift({ point: -Number.MAX_VALUE, blocks: [] });

            for (let i = 1; i < metaData.length; i++) {
                const pointData = metaData[i];
                let includeData = pointData;
                const block = pointData.startBlock;
                if (block) {
                    const limit = pointData.endPoint;
                    let index = i;
                    while (limit > includeData.point) {
                        includeData.blocks.push(block);
                        index++;
                        includeData = metaData[index];
                        if (!includeData) {
                            break;
                        }
                    }
                    delete pointData.startBlock;
                }
                pointData.endPoint = Number.MAX_VALUE;
                metaData[i - 1].endPoint = pointData.point;
            }

            this._magnetMap[targetType] = metaData;
        }
    }

    _getCodeBlocks(code, targetType) {
        let func;
        switch (targetType) {
            case 'previous':
                func = this._getNextMagnets;
                break;
            case 'next':
                func = this._getPreviousMagnets;
                break;
            case 'string':
            case 'boolean':
                func = this._getFieldMagnets;
                break;
            case 'param':
                func = this._getOutputMagnets;
                break;
            default:
                return [];
        }

        return code
            .getThreads()
            .reduce(
                (blocks, thread) =>
                    blocks.concat(func.call(this, thread, thread.view.zIndex, null, targetType)),
                []
            );
    }

    _getNextMagnets(thread, zIndex, offset, targetType) {
        offset = offset ? offset : { x: 0, y: 0 };
        const blocks = thread.getBlocks();
        let statementBlocks = [];
        const metaData = [];
        let cursorX = offset.x;
        let cursorY = offset.y;

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const blockView = block.view;
            blockView.zIndex = zIndex;
            if (blockView.dragInstance) {
                break;
            }

            cursorY += blockView.y / this.scale;
            cursorX += blockView.x;
            let endPoint = cursorY + 1;
            if (blockView.magnet.next) {
                endPoint += blockView.height;
                metaData.push({
                    point: cursorY,
                    endPoint,
                    startBlock: block,
                    blocks: [],
                });
                metaData.push({
                    point: endPoint,
                    blocks: [],
                });
                blockView.absX = cursorX;
            }
            if (block.statements) {
                zIndex += 0.01;
                for (let j = 0; j < block.statements.length; j++) {
                    const thread = block.statements[j];
                    const statement = block.view._statements[j];
                    statement.zIndex = zIndex;
                    statement.absX = cursorX + statement.x * this.scale;
                    metaData.push({
                        point: statement.y + cursorY - 30,
                        endPoint: statement.y + cursorY,
                        startBlock: statement,
                        blocks: [],
                    });
                    metaData.push({
                        point: statement.y + cursorY + statement.height,
                        blocks: [],
                    });
                    zIndex += 0.01;
                    statementBlocks = statementBlocks.concat(
                        this._getNextMagnets(
                            thread,
                            zIndex,
                            {
                                x: statement.x * this.scale + cursorX,
                                y: statement.y + cursorY,
                            },
                            targetType
                        )
                    );
                }
            }
            if (blockView.magnet.next) {
                cursorY += blockView.magnet.next.y;
                cursorX += blockView.magnet.next.x * this.scale;
            }
        }
        return statementBlocks.concat(metaData);
    }

    _getPreviousMagnets(thread, zIndex, offset) {
        offset = offset ? offset : { x: 0, y: 0 };
        const blocks = thread.getBlocks();
        const metaData = [];
        let cursorX = offset.x;
        let cursorY = offset.y;

        const block = blocks[0];
        const blockView = block.view;
        blockView.zIndex = zIndex;
        if (blockView.dragInstance) {
            return [];
        }
        cursorY += blockView.y / this.scale - 15;
        cursorX += blockView.x;
        let endPoint = cursorY + 1;
        if (blockView.magnet.previous) {
            endPoint += blockView.height;
            metaData.push({
                point: cursorY,
                endPoint,
                startBlock: block,
                blocks: [],
            });
            metaData.push({
                point: endPoint,
                blocks: [],
            });
            blockView.absX = cursorX;
            return metaData;
        }
        return [];
    }

    _getFieldMagnets(thread, zIndex, offset, targetType) {
        offset = offset ? offset : { x: 0, y: 0 };
        const blocks = thread.getBlocks();
        let statementBlocks = [];
        let metaData = [];
        let cursorX = offset.x;
        let cursorY = offset.y;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block instanceof Entry.Comment) {
                break;
            }
            if (!block.assemble) {
                break;
            }
            const blockView = block.view;
            if (blockView.dragInstance) {
                break;
            }
            blockView.zIndex = zIndex;
            cursorY += blockView.y / this.scale;
            cursorX += blockView.x;
            metaData = metaData.concat(
                this._getFieldBlockMetaData(blockView, cursorX, cursorY, zIndex, targetType)
            );
            if (block.statements) {
                zIndex += 0.01;
            }
            for (let j = 0; j < block.statements.length; j++) {
                const thread = block.statements[j];
                const statement = block.view._statements[j];
                statementBlocks = statementBlocks.concat(
                    this._getFieldMagnets(
                        thread,
                        zIndex,
                        {
                            x: statement.x * this.scale + cursorX,
                            y: statement.y + cursorY,
                        },
                        targetType
                    )
                );
            }
            if (blockView.magnet.next) {
                cursorY += blockView.magnet.next.y;
                cursorX += blockView.magnet.next.x * this.scale;
            }
        }
        return statementBlocks.concat(metaData);
    }

    _getFieldBlockMetaData(blockView, cursorX, cursorY, zIndex, targetType) {
        const contents = blockView._contents;
        let metaData = [];
        cursorY += blockView.contentPos.y;
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            if (!(content instanceof Entry.FieldBlock)) {
                continue;
            }
            const contentBlock = content._valueBlock;
            if (contentBlock.view.dragInstance) {
                continue;
            }
            const startX = cursorX + content.box.x * this.scale;
            const startY = cursorY + content.box.y + (blockView.contentHeight % 1000) * -0.5;
            const endY = cursorY + content.box.y + content.box.height;
            if (content.acceptType !== targetType && content.acceptType !== 'boolean') {
                if (targetType === 'boolean') {
                    const contentBlockView = contentBlock.view;
                    metaData = metaData.concat(
                        this._getFieldBlockMetaData(
                            contentBlockView,
                            startX + contentBlockView.contentPos.x * this.scale,
                            startY + contentBlockView.contentPos.y,
                            zIndex,
                            targetType
                        )
                    );
                }
                continue;
            }
            if (content.acceptType === targetType) {
                metaData.push({
                    point: startY,
                    endPoint: endY,
                    startBlock: contentBlock,
                    blocks: [],
                });
                metaData.push({
                    point: endY,
                    blocks: [],
                });
            }
            const contentBlockView = contentBlock.view;
            contentBlockView.absX = startX;
            contentBlockView.zIndex = zIndex;
            metaData = metaData.concat(
                this._getFieldBlockMetaData(
                    contentBlockView,
                    startX + contentBlockView.contentPos.x * this.scale,
                    startY + contentBlockView.contentPos.y,
                    zIndex + 0.01,
                    targetType
                )
            );
        }
        return metaData;
    }

    _getOutputMagnets(thread, zIndex, offset, targetType) {
        offset = offset ? offset : { x: 0, y: 0 };
        const blocks = thread.getBlocks();
        let statementBlocks = [];
        let metaData = [];
        let cursorX = offset.x;
        let cursorY = offset.y;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const blockView = block.view;
            if (blockView instanceof Entry.Comment) {
                continue;
            }
            if (blockView.dragInstance) {
                break;
            }
            blockView.zIndex = zIndex;
            cursorY += blockView.y / this.scale;
            cursorX += blockView.x;
            metaData = metaData.concat(
                this._getOutputMetaData(blockView, cursorX, cursorY, zIndex, targetType)
            );
            if (block.statements) {
                zIndex += 0.01;
            }
            for (let j = 0; j < block.statements.length; j++) {
                const thread = block.statements[j];
                const statement = block.view._statements[j];
                statementBlocks = statementBlocks.concat(
                    this._getOutputMagnets(
                        thread,
                        zIndex,
                        {
                            x: statement.x * this.scale + cursorX,
                            y: statement.y + cursorY,
                        },
                        targetType
                    )
                );
            }
            if (blockView.magnet.next) {
                cursorY += blockView.magnet.next.y;
                cursorX += blockView.magnet.next.x * this.scale;
            }
        }
        return statementBlocks.concat(metaData);
    }

    _getOutputMetaData(blockView, cursorX, cursorY, zIndex, targetType) {
        const contents = blockView._contents;
        let metaData = [];
        cursorX += blockView.contentPos.x * this.scale;
        cursorY += blockView.contentPos.y;
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            const contentScaleX = content.box.x * this.scale;
            const startX = cursorX + contentScaleX;
            const startY = cursorY - 24;
            const endY = cursorY;
            if (content instanceof Entry.FieldBlock) {
                if (content.acceptType === targetType) {
                    metaData.push({
                        point: startY,
                        endPoint: endY,
                        startBlock: content,
                        blocks: [],
                    });
                    metaData.push({
                        point: endY,
                        blocks: [],
                    });
                    content.absX = startX;
                    content.zIndex = zIndex;
                    content.width = 20;
                }

                const contentBlock = content._valueBlock;
                if (contentBlock) {
                    metaData = metaData.concat(
                        this._getOutputMetaData(
                            contentBlock.view,
                            startX,
                            cursorY + content.box.y,
                            zIndex + 0.01,
                            targetType
                        )
                    );
                }
                continue;
            } else if (content instanceof Entry.FieldOutput) {
                if (content.acceptType !== targetType) {
                    continue;
                }
                metaData.push({
                    point: startY,
                    endPoint: endY,
                    startBlock: content,
                    blocks: [],
                });
                metaData.push({
                    point: endY,
                    blocks: [],
                });
                content.absX = startX;
                content.zIndex = zIndex;
                content.width = 20;
                const contentBlock = content._valueBlock;
                if (!contentBlock) {
                    continue;
                }
                if (contentBlock.view.dragInstance) {
                    continue;
                }
                const contentBlockView = contentBlock.view;
                metaData = metaData.concat(
                    this._getOutputMetaData(
                        contentBlockView,
                        cursorX + contentScaleX,
                        cursorY + content.box.y,
                        zIndex + 0.01,
                        targetType
                    )
                );
            }
        }
        return metaData;
    }

    getNearestMagnet(x, y, targetType) {
        const targetArray = this._magnetMap[targetType];
        if (!targetArray || targetArray.length === 0) {
            return;
        }

        let minIndex = 0;
        let maxIndex = targetArray.length - 1;
        let index;
        let pointData;
        let result = null;
        const searchValue = targetType === 'previous' ? y - 15 : y;
        const leftOffset = ['previous', 'next'].indexOf(targetType) > -1 ? 20 : 0;
        while (minIndex <= maxIndex) {
            index = ((minIndex + maxIndex) / 2) | 0;
            pointData = targetArray[index];
            if (searchValue < pointData.point) {
                maxIndex = index - 1;
            } else if (searchValue > pointData.endPoint) {
                minIndex = index + 1;
            } else {
                const blocks = pointData.blocks;
                for (let i = 0; i < blocks.length; i++) {
                    const blockView = blocks[i].view;
                    const minX = blockView.absX / this.scale - leftOffset;
                    const maxX = blockView.width + minX;
                    if (minX < x && x < maxX) {
                        const resultBlock = pointData.blocks[i];
                        if (!result || result.view.zIndex < resultBlock.view.zIndex) {
                            result = pointData.blocks[i];
                        }
                    }
                }
                return result;
            }
        }
        return null;
    }

    dominate(thread) {
        if (!thread) {
            return;
        }

        const code = this.code;
        // currently top of dom
        // no need to dominate again
        if (!_shouldDominate(thread.view.zIndex, code.getMaxZIndex())) {
            return;
        }

        const block = thread.getFirstBlock();
        if (!block) {
            return;
        }

        //udpate zIndex data first
        code.dominate(thread);
        //udpate visual things next frame
        requestAnimationFrame(() => {
            const svgGroup = _.result(block && block.view, 'svgGroup');
            if (this.svgBlockGroup && svgGroup) {
                this.svgBlockGroup.appendChild(svgGroup);
            }
        });

        function _shouldDominate(zIndex, max) {
            return zIndex + 1 < max || !zIndex || !max;
        }
    }

    enablePattern() {
        this.pattern.removeAttribute('style');
    }

    disablePattern() {
        this.pattern.attr({ style: 'display: none' });
    }

    _removeActivated() {
        if (!this._activatedBlockView) {
            return;
        }

        this._activatedBlockView.removeActivated();
        this._activatedBlockView = null;
    }

    activateBlock(block) {
        const view = block.view;
        const { x: blockX, y: blockY } = view.getAbsoluteCoordinate();

        const { width, height } = this.getSvgDomRect();
        this.scroller.scroll(width / 2 - blockX, height / 2 - blockY - 100);

        view.addActivated();

        this._activatedBlockView = view;
    }

    reDraw() {
        this.code && this.code.view && this.code.view.reDraw();
    }

    separate(block, count, index) {
        if (typeof block === 'string') {
            block = this.findById(block);
        }
        if (block.view) {
            block.view._toGlobalCoordinate();
        }
        if (block.getBlockType() === 'output') {
            if (!count) {
                return;
            }
            const prevOutputBlock = block.getPrevOutputBlock();
            let nextOutputBlock = block;
            for (let i = 0; i < count; i++) {
                nextOutputBlock = nextOutputBlock.getOutputBlock();
            }

            block.separate(count, index);
            if (prevOutputBlock && nextOutputBlock) {
                nextOutputBlock.separate();
                nextOutputBlock.doInsert(prevOutputBlock.view._contents[1]);
            }
        } else {
            let nextBlock;
            let backupPos;
            const prevBlock = block.getPrevBlock();
            if (
                !prevBlock &&
                block.thread instanceof Entry.Thread &&
                block.thread.parent instanceof Entry.Code
            ) {
                nextBlock = block.thread.getBlock(block.thread.indexOf(block) + count);

                if (nextBlock) {
                    backupPos = nextBlock.view.getAbsoluteCoordinate();
                }
            }
            block.separate(count, index);
            if (prevBlock && prevBlock.getNextBlock()) {
                prevBlock.getNextBlock().view.bindPrev();
            } else if (nextBlock) {
                nextBlock.view._toGlobalCoordinate();
                nextBlock.moveTo(backupPos.x, backupPos.y);
            }
        }
    }

    insert(block, pointer, count) {
        // pointer can be target
        if (typeof block === 'string') {
            block = this.findById(block);
        }

        let targetBlock;

        if (pointer.length === 3) {
            // for global
            this.separate(block, count, pointer[2]);
            block.moveTo(pointer[0], pointer[1]);
        } else if (pointer.length === 4 && pointer[3] == -1) {
            // insert on top
            pointer[3] = 0;
            targetBlock = this.code.getByPointer(pointer);
            this.separate(block, count, pointer[2]);
            block = block.getLastBlock();

            targetBlock.view.bindPrev(block);
            targetBlock.doInsert(block);
        } else {
            this.separate(block, count);
            let targetObj;
            if (pointer instanceof Array) {
                targetObj = this.code.getByPointer(pointer);
            } else {
                targetObj = pointer;
            }
            if (targetObj instanceof Entry.Block) {
                if (block.getBlockType() === 'basic') {
                    block.view.bindPrev(targetObj);
                }
                block.doInsert(targetObj);
            } else if (targetObj instanceof Entry.FieldStatement) {
                block.view.bindPrev(targetObj);
                targetObj.insertTopBlock(block);
            } else if (targetObj instanceof Entry.Thread) {
                targetObj = targetObj.view.getParent();
                block.view.bindPrev(targetObj);
                targetObj.insertTopBlock(block);
            } else {
                block.doInsert(targetObj);
            }
        }
    }

    adjustThreadsPosition() {
        const code = this.code;
        if (!code) {
            return;
        }
        if (!code.view) {
            return;
        }

        let threads = code.getThreads();
        if (!threads || threads.length === 0) {
            return;
        }

        threads = threads.sort((a, b) => a.getFirstBlock().view.x - b.getFirstBlock().view.x);

        let block = threads[0].getFirstBlock();
        if (block) {
            block = block.view;
            const { x, y } = block.getAbsoluteCoordinate();
            this.scroller.scroll(50 - x, 30 - y, true);
        }
    }

    _initContextOptions() {
        const that = this;
        const { options = {} } = Entry;
        this._contextOptions = [
            {
                activated: true,
                option: {
                    text: Lang.Blocks.Paste_blocks,
                    enable: !!Entry.clipboard && !this.readOnly,
                    callback() {
                        if (Entry.clipboard.type === 'comment') {
                            Entry.do('createComment', Entry.clipboard, that);
                        } else {
                            Entry.do('addThread', Entry.clipboard)
                                .value.getFirstBlock()
                                .copyToClipboard();
                        }
                    },
                },
            },
            {
                activated: true,
                option: {
                    text: Lang.Blocks.tidy_up_block,
                    enable: !this.readOnly,
                    callback() {
                        that.alignThreads();
                    },
                },
            },
            {
                activated: true,
                option: {
                    text: Lang.Blocks.Clear_all_blocks,
                    enable: !this.readOnly,
                    callback() {
                        Entry.do('destroyThreads');
                    },
                },
            },
            {
                activated:
                    Entry.blockSaveImageEnable &&
                    Entry.type === 'workspace' &&
                    Entry.Utils.isChrome() &&
                    !Entry.isMobile(),
                option: {
                    text: Lang.Menus.save_as_image_all,
                    enable: !this.readOnly,
                    async callback() {
                        const threads = that.code.getThreads();
                        const promises = threads.map((thread) => {
                            const topBlock = thread.getFirstBlock();
                            if (!topBlock) {
                                return;
                            }
                            return topBlock.view.getDataUrl();
                        });

                        const images = await Promise.all(promises);
                        Entry.dispatchEvent('saveBlockImages', {
                            images,
                        });
                    },
                },
            },
            {
                activated: !options.commentDisable,
                option: {
                    text: Lang.Blocks.add_comment,
                    enable: !this.readOnly,
                    callback: () => {
                        const { left: x, top: y } = that.offset();
                        Entry.do(
                            'createComment',
                            {
                                id: Entry.Utils.generateId(),
                                x: (Entry.ContextMenu.mouseCoordinate.x - x) / that.scale,
                                y: (Entry.ContextMenu.mouseCoordinate.y - y) / that.scale,
                            },
                            that
                        );
                    },
                },
            },
            {
                activated: !options.commentDisable,
                option: {
                    text: Lang.Blocks.hide_all_comment,
                    enable: !this.readOnly,
                    callback() {
                        that.isVisibleComment
                            ? Entry.do('hideAllComment', that)
                            : Entry.do('showAllComment', that);
                    },
                },
            },
        ];
    }

    activateContextOption(option) {
        this._contextOptions[option].activated = true;
    }

    deActivateContextOption(option) {
        this._contextOptions[option].activated = false;
    }

    _bindEvent() {
        let evt = Entry.documentMousedown;
        if (evt) {
            evt.attach(this, this.setSelectedBlock);
            evt.attach(this, this._removeActivated);
        }

        evt = Entry.windowResized;
        if (evt) {
            evt.attach(this, debounce(this.updateOffset, 200));
        }
    }

    offset() {
        if (!this._offset || (this._offset.top === 0 && this._offset.left === 0)) {
            this.updateOffset();
            return this._offset;
        }
        return this._offset;
    }

    _rightClick(e) {
        delete this.workingEvent;
        const disposeEvent = Entry.disposeEvent;
        disposeEvent && disposeEvent.notify(e);
        if (!this.visible) {
            return;
        }

        const contextOptions = this._contextOptions;
        contextOptions[Entry.Board.OPTION_PASTE].option.enable = !!Entry.clipboard;
        contextOptions[Entry.Board.OPTION_DOWNLOAD].option.enable =
            this.code.getThreads().length !== 0;
        contextOptions[Entry.Board.VISIBLE_COMMENT].option.text = this.isVisibleComment
            ? Lang.Blocks.hide_all_comment
            : Lang.Blocks.show_all_comment;

        const { clientX: x, clientY: y } = Entry.Utils.convertMouseEvent(e);
        Entry.ContextMenu.show(
            contextOptions.reduce((options, { activated, option }) => {
                if (activated) {
                    options.push(option);
                }
                return options;
            }, []),
            null,
            { x, y }
        );
    }

    handleVisibleComment() {
        if (this.isVisibleComment) {
            this.view.removeClass('invisibleComment');
        } else {
            this.view.addClass('invisibleComment');
        }
        Entry.dispatchEvent('commentVisibleChanged');
    }

    getDom(query) {
        query = query.concat();
        const key = query.shift();
        if (key === 'trashcan') {
            return this.workspace.trashcan.svgGroup;
        } else if (key === 'coord') {
            return {
                getBoundingClientRect: function () {
                    const halfWidth = 20;
                    const boardOffset = this.relativeOffset;
                    return {
                        top: query[1] + boardOffset.top - halfWidth,
                        left: query[0] + boardOffset.left - halfWidth,
                        width: 2 * halfWidth,
                        height: 2 * halfWidth,
                    };
                }.bind(this),
            };
        } else if (key === 'cancelEditButton') {
            return this.cancelButton;
        } else if (key === 'saveButton') {
            return this.saveButton;
        } else if (key instanceof Array) {
            const targetObj = this.code.getByPointer(key);
            if (targetObj.getDom) {
                return targetObj.getDom(query);
            } else {
                return targetObj.svgGroup;
            }
        }
    }

    findBlock(block) {
        if (typeof block === 'string') {
            return this.findById(block);
        } else if (block && block.id) {
            return this.findById(block.id) || block;
        } else if (block instanceof Array) {
            return this.code.getByPointer(block);
        }
        return block;
    }

    scrollToPointer(pointer) {
        const obj = this.code.getByPointer(pointer);
        let pos;
        if (obj instanceof Entry.Block) {
            pos = obj.view.getAbsoluteCoordinate();
            obj.view.dominate();
        } else if (obj instanceof Entry.Thread) {
            pos = obj.view.requestAbsoluteCoordinate();
        } else if (obj.getAbsolutePosFromBoard) {
            pos = obj.getAbsolutePosFromBoard();
        }

        let newX = 0;
        let newY = 0;
        const offset = this._offset;
        const width = offset.width;
        const height = offset.height;

        if (pos.x > width - 200) {
            newX = width - 200 - pos.x;
        } else if (pos.x < 100) {
            newX = 100 - pos.x;
        }

        if (pos.y > height - 200) {
            newY = height - 200 - pos.y;
        } else if (pos.y < 100) {
            newY = 100 - pos.y;
        }

        this.scroller.scroll(newX, newY, true);
        return [newX, newY];
    }

    getSvgDomRect() {
        if (!this._svgDomRect) {
            this.updateOffset();
        }
        return this._svgDomRect;
    }

    setScale(scale = 1) {
        this.scale = scale;
        this.svgGroup.attr('transform', `scale(${scale})`);
        this.adjustThreadsPosition();
    }

    updateObjectTitle(object) {
        if (!object) {
            this.clearObjectTitle();
            return;
        }

        if (!this.svgObjectTitle.thumbnail) {
            const thumbnail = this.svgObjectTitle.elem('g');
            const rect = thumbnail.elem('rect');
            rect.attr({
                x: 14,
                y: 12,
                rx: 2,
                ry: 2,
                width: 24,
                height: 24,
                fill: 'none',
                stroke: '#e2e2e2',
                strokeWidth: '1',
            });
            const image = thumbnail.elem('image');
            image.addClass('entryBoardObjectThumbnail');
            image.attr({
                x: 17,
                y: 15,
                width: 18,
                height: 18,
                href: object.thumbUrl,
            });
            this.svgObjectTitle.frame = rect;
            this.svgObjectTitle.thumbnail = image;
        }

        if (!this.svgObjectTitle.name) {
            const name = this.svgObjectTitle.elem('g');
            const nameText = name.elem('text');
            nameText.addClass('entryBoardObjectName');
            nameText.attr({ x: 44, y: 26, fill: '#6b6b6b' });
            nameText.style.font = "12px NanumGothicBold, 'Nanum Gothic'";
            nameText.textContent = object.name;
            this.svgObjectTitle.name = nameText;
        }

        this.svgObjectTitle.thumbnail.attr({ href: object.thumbUrl });
        this.svgObjectTitle.name.textContent = object.name;
        this.updateObjectBlockCount(object);
    }

    async updateObjectBlockCount(object) {
        if (this.suffix !== 'board' || !object) {
            this.clearObjectBlockCount();
            return;
        }

        if (!this.svgObjectBlockCount.rect) {
            const rect = this.svgObjectBlockCount.elem('rect');
            rect.attr({
                rx: 10,
                ry: 10,
                height: 20,
                fill: '#ffffff',
                stroke: '#d6e9f4',
                strokeWidth: '1',
            });
            this.svgObjectBlockCount.rect = rect;
        }

        if (!this.svgObjectBlockCount.countText) {
            const countText = this.svgObjectBlockCount.elem('text');
            countText.style.font = "12px NanumGothic, 'Nanum Gothic'";
            countText.attr({
                fill: '#6b6b6b',
            });
            this.svgObjectBlockCount.countText = countText;
        }

        const nameWidth =
            Math.round(this.svgObjectTitle?.name?.getBoundingClientRect().width || 0) / this.scale;
        const x = nameWidth + 8;
        this.svgObjectBlockCount.countText.attr({
            x: 44 + x + 8,
            y: 26,
        });
        requestAnimationFrame(() => {
            if (!this.svgObjectBlockCount.countText) {
                return;
            }
            const rectWidth =
                this.svgObjectBlockCount.countText.getBoundingClientRect().width / this.scale;
            this.svgObjectBlockCount.rect.attr({
                width: rectWidth + 16,
                x: 44 + x,
                y: 12,
            });
        });
        const blocks = await Entry.Utils.getObjectsBlocksForEventThread(object);
        const count = _get(blocks, 'length', 0);

        let langText = Lang.Workspace.use_blocks_project;
        if (count === 1) {
            langText = Lang.Workspace.use_block_project;
        }
        if (this.svgObjectBlockCount.countText) {
            this.svgObjectBlockCount.countText.textContent = Entry.Utils.stringFormat(
                langText,
                Entry.Utils.shortenNumber(count)
            );
        }
    }

    clearObjectTitle() {
        if (!this.svgObjectTitle) {
            return;
        }

        this.svgObjectTitle.frame?.remove();
        this.svgObjectTitle.thumbnail?.remove();
        this.svgObjectTitle.name?.remove();
        delete this.svgObjectTitle.frame;
        delete this.svgObjectTitle.thumbnail;
        delete this.svgObjectTitle.name;
    }

    clearObjectBlockCount() {
        if (!this.svgObjectBlockCount) {
            return;
        }

        this.svgObjectBlockCount.rect?.remove();
        this.svgObjectBlockCount.countText?.remove();
        delete this.svgObjectBlockCount.rect;
        delete this.svgObjectBlockCount.countText;
    }
};
