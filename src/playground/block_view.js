import debounce from 'lodash/debounce';
import _get from 'lodash/get';
import Hammer from 'hammerjs';

Entry.BlockView = class BlockView {
    schema = {
        id: 0,
        type: Entry.STATIC.BLOCK_RENDER_MODEL,
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
        width: 0,
        height: 0,
        contentWidth: 0,
        contentHeight: 0,
        topFieldHeight: 0,
        marginBottom: 0,
        magneting: false,
        visible: true,
        animating: false,
        shadow: true,
        display: true,
    };

    constructor(block, board, mode) {
        const that = this;
        Entry.Model(this, false);
        this.block = block;
        this._lazyUpdatePos = debounce(block._updatePos.bind(block), 200);
        this.mouseUpEvent = new Entry.Event(this);
        this.disableMouseEvent = false;

        this.dAlignContent = this.alignContent;
        this._board = board;
        this._observers = [];
        this.set(block);
        const hash = Entry.generateHash();
        this.svgGroup = board.svgBlockGroup.elem('g');
        this.svgGroup.attr('id', hash);
        this.svgGroup.blockView = this;
        if (block.isCommentable() && board.svgCommentGroup) {
            this.svgCommentGroup = board.svgCommentGroup.elem('g');
            this.svgCommentGroup.attr('id', `${hash}C`);
            this.svgCommentGroup.blockView = this;
        }

        this._schema = Entry.skinContainer.getSkin(block);

        if (this._schema === undefined) {
            this.block.destroy(false, false);
            return;
        }

        if (mode === undefined) {
            const workspace = this.getBoard().workspace;
            if (workspace && workspace.getBlockViewRenderMode) {
                this.renderMode = workspace.getBlockViewRenderMode();
            } else {
                this.renderMode = Entry.BlockView.RENDER_MODE_BLOCK;
            }
        } else {
            this.renderMode = Entry.BlockView.RENDER_MODE_BLOCK;
        }

        if (this._schema.deletable) {
            this.block.setDeletable(this._schema.deletable);
        }
        if (this._schema.copyable) {
            this.block.setCopyable(this._schema.copyable);
        }
        if (this._schema.display === false || block.display === false) {
            this.set({ display: false });
        }
        this._skeleton = Entry.skeleton[this._schema.skeleton];
        const skeleton = this._skeleton;
        this._contents = [];
        this._statements = [];
        this._extensions = [];
        this.magnet = {};
        this._paramMap = {};

        if (skeleton.magnets && skeleton.magnets(this).next) {
            this.svgGroup.nextMagnet = this.block;
            this._nextGroup = this.svgGroup.elem('g');
            this._nextCommentGroup = this.svgCommentGroup && this.svgCommentGroup.elem('g');
            this._observers.push(this.observe(this, '_updateMagnet', ['contentHeight']));
        }

        this.isInBlockMenu = this.getBoard() instanceof Entry.BlockMenu;
        this.mouseHandler = function (e) {
            (_.result(that.block.events, 'mousedown') || []).forEach((fn) => {
                if (Entry.documentMousedown) {
                    Entry.documentMousedown.notify(e);
                }
                return fn(that);
            });
            that.onMouseDown(...arguments);
        };

        this._startRender(block, mode);

        // observe
        const thisBlock = this.block;
        this._observers.push(thisBlock.observe(this, '_setMovable', ['movable']));
        this._observers.push(thisBlock.observe(this, '_setReadOnly', ['movable']));
        this._observers.push(thisBlock.observe(this, '_setCopyable', ['copyable']));
        this._observers.push(thisBlock.observe(this, '_updateColor', ['deletable'], false));
        this._observers.push(this.observe(this, '_updateBG', ['magneting'], false));

        this._observers.push(this.observe(this, '_updateOpacity', ['visible'], false));
        this._observers.push(this.observe(this, '_updateDisplay', ['display']));
        this._observers.push(this.observe(this, '_updateMagnet', ['offsetY']));
        this._observers.push(board.code.observe(this, '_setBoard', ['board'], false));

        this.dragMode = Entry.DRAG_MODE_NONE;
        Entry.Utils.disableContextmenu(this.svgGroup.node);
        const events = block.events.viewAdd || [];
        if (Entry.type === 'workspace' && this._board instanceof Entry.Board) {
            events.forEach((fn) => {
                if (_.isFunction(fn)) {
                    fn(block);
                }
            });
        }

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    _startRender(block, mode) {
        const skeleton = this._skeleton;
        const attr = { class: 'block' };

        if (this.display === false) {
            attr.display = 'none';
        }

        const svgGroup = this.svgGroup;

        svgGroup.attr(attr);

        (skeleton.classes || []).forEach((c) => svgGroup.addClass(c));

        const path = skeleton.path(this);

        this.pathGroup = svgGroup.prepend('g');
        this._updateMagnet();

        this._path = this.pathGroup.elem('path');

        let fillColor = this._schema.color;
        const { deletable, emphasized } = this.block;

        if (deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN || emphasized) {
            fillColor = this._schema.emphasizedColor || Entry.Utils.getEmphasizeColor(fillColor);
        }

        this._fillColor = fillColor;

        const pathStyle = {
            d: path,
            fill: fillColor,
            class: 'blockPath',
            blockId: this.id,
        };

        const blockSchema = this._schema;
        const { outerLine } = blockSchema;
        pathStyle.stroke = outerLine || skeleton.outerLine;
        pathStyle['stroke-linejoin'] = 'round';
        pathStyle['stroke-linecap'] = 'round';

        if (skeleton.stroke) {
            pathStyle['stroke-width'] = '1';
        }
        this._path.attr(pathStyle);
        this.moveTo(this.x, this.y, false);
        this._startContentRender(mode);
        this._startExtension(mode);
        if (this._board.disableMouseEvent !== true) {
            this._addControl();
        }

        const guide = this.guideSvgGroup;
        guide && svgGroup.insertBefore(guide, svgGroup.firstChild);

        this.bindPrev();
    }

    _startContentRender(mode) {
        mode = _.isUndefined(mode) ? this.renderMode : mode;

        const _removeFunc = _.partial(_.result, _, 'remove');

        _removeFunc(this.contentSvgGroup);
        _removeFunc(this.statementSvgGroup);
        if (this.statementCommentGroup) {
            _removeFunc(this.statementCommentGroup);
        }

        this.contentSvgGroup = this.svgGroup.elem('g');
        this._contents = [];

        const schema = this._schema;
        const statements = schema.statements;

        if (!_.isEmpty(statements)) {
            this.statementSvgGroup = this.svgGroup.elem('g');
            this.statementCommentGroup = this.svgCommentGroup && this.svgCommentGroup.elem('g');
        }

        const reg = /(%\d+)/im;
        const parsingReg = /%(\d+)/im;
        let parsingRet;

        let template = this._getTemplate(mode) || '';
        const params = this._getSchemaParams(mode);

        if (mode === Entry.BlockView.RENDER_MODE_TEXT) {
            if (
                /(if)+(.|\n)+(else)+/gim.test(template) &&
                !reg.test(template) &&
                this.isInBlockMenu
            ) {
                template = template.replace('else', `%${params.length} else`);
            }
        }

        const _renderMode = mode || this.renderMode;
        template &&
            template.split(reg).forEach((param, i) => {
                if (param[0] === ' ') {
                    param = param.substring(1);
                }
                if (param[param.length - 1] === ' ') {
                    param = param.substring(0, param.length - 1);
                }
                if (!param?.length) {
                    return;
                }

                parsingRet = parsingReg.exec(param);
                if (parsingRet) {
                    const paramIndex = parsingRet[1] - 1;
                    param = params[paramIndex];
                    // params[paramIndex]= null||undefined 일 수 있는 경우에 대한 방어 코드
                    if (!param) {
                        return;
                    }
                    const field = new Entry[`Field${param.type}`](
                        param,
                        this,
                        paramIndex,
                        _renderMode,
                        i
                    );
                    this._contents.push(field);
                    this._paramMap[paramIndex] = field;
                } else {
                    this._contents.push(
                        new Entry.FieldText({ text: param, color: schema.fontColor }, this)
                    );
                }
            });

        (schema.statements || []).forEach((s, i) => {
            this._statements.push(new Entry.FieldStatement(s, this, i));
        });

        this.alignContent(false);
    }

    _startExtension(mode) {
        this._extensions = this.block.extensions.map(
            (e) => new Entry[`Ext${e.type}`](e, this, mode)
        );
    }

    _updateSchema = this._startContentRender;

    changeType(type) {
        this._schema = Entry.block[type || this.type];
        this._skeleton = Entry.skeleton[this._schema.skeleton];

        this._updateSchema();
    }

    alignContent(animate) {
        this.resetBackgroundPath();
        if (animate !== true) {
            animate = false;
        }
        const cursor = { x: 0, y: 0, height: 0 };
        let statementIndex = 0;
        let width = 0;
        let secondLineHeight = 0;

        for (let i = 0; i < this._contents.length; i++) {
            const c = this._contents[i];
            if (c instanceof Entry.FieldLineBreak) {
                this._alignStatement(animate, statementIndex);
                c.align(statementIndex);
                statementIndex++;
                cursor.y = c.box.y;
                cursor.x = 8;
            } else {
                c.align(cursor.x, cursor.y, animate);
                // space between content
                if (
                    i !== this._contents.length - 1 &&
                    !(c instanceof Entry.FieldText && c._text.length === 0)
                ) {
                    cursor.x += Entry.BlockView.PARAM_SPACE;
                }
            }

            const box = c.box;
            if (statementIndex !== 0) {
                secondLineHeight = Math.max(Math.round(box.height) * 1000000, secondLineHeight);
            } else {
                cursor.height = Math.max(box.height, cursor.height);
            }

            cursor.x += box.width;
            width = Math.max(width, cursor.x);
            if (this.contentWidth !== width || this.contentHeight !== cursor.height) {
                this.set({
                    contentWidth: width,
                    contentHeight: cursor.height,
                });
            }
        }

        if (secondLineHeight) {
            this.set({
                contentHeight: cursor.height + secondLineHeight,
            });
        }

        if (this._statements.length != statementIndex) {
            this._alignStatement(animate, statementIndex);
        }

        const contentPos = this.getContentPos();
        this.contentSvgGroup.attr('transform', `translate(${contentPos.x},${contentPos.y})`);
        this.contentPos = contentPos;
        this._render();
        const comment = this.block.comment;
        if (comment instanceof Entry.Comment) {
            comment.updateParentPos();
        }

        this._updateMagnet();
        const ws = this.getBoard().workspace;
        if (ws && (this.isFieldEditing() || ws.widgetUpdateEveryTime)) {
            ws.widgetUpdateEvent.notify();
        }
    }

    isFieldEditing() {
        const contents = this._contents;
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i] || {};
            if (content.isEditing && content.isEditing()) {
                return true;
            }
        }
        return false;
    }

    _alignStatement(animate, index) {
        const positions = this._skeleton.statementPos ? this._skeleton.statementPos(this) : [];
        const statement = this._statements[index];
        if (!statement) {
            return;
        }
        const pos = positions[index];
        if (pos) {
            statement.align(pos.x, pos.y, animate);
        }
    }

    _render() {
        this._renderPath();
        this.set(this._skeleton.box(this));
    }

    _renderPath() {
        const newPath = this._skeleton.path(this);

        //no change occured
        if (this._path.getAttribute('d') === newPath) {
            return;
        }

        if (false && Entry.ANIMATION_DURATION !== 0) {
            const that = this;
            setTimeout(() => {
                that._path.animate({ d: newPath }, Entry.ANIMATION_DURATION, mina.easeinout);
            }, 0);
        } else {
            this._path.attr({ d: newPath });
            this.animating === true && this.set({ animating: false });
        }
    }

    _setPosition() {
        const board = this.getBoard();
        const { scale = 1 } = board || {};
        if (!(this.x || this.y)) {
            this.svgGroup.removeAttr('transform');
            this.svgCommentGroup && this.svgCommentGroup.removeAttr('transform');
        } else {
            const transform = `translate(${this.x / scale},${this.y / scale})`;
            this.svgGroup.attr('transform', transform);
            this.svgCommentGroup && this.svgCommentGroup.attr('transform', transform);
        }
    }

    moveTo(x, y, animate, doNotUpdatePos) {
        const thisX = this.x;
        const thisY = this.y;
        if (!this.display) {
            x = -99999;
            y = -99999;
        }
        if (thisX !== x || thisY !== y) {
            this.set({ x, y });
        }

        doNotUpdatePos !== true && this._lazyUpdatePos();

        if (this.visible && this.display) {
            this._setPosition(animate);
        }
    }

    moveBy(x, y, animate, doNotUpdatePos) {
        return this.moveTo(this.x + x, this.y + y, animate, doNotUpdatePos);
    }

    _addControl() {
        this._mouseEnable = true;

        const dblclick = _.result(this.block.events, 'dblclick');
        if (dblclick) {
            const hammer = new Hammer(this.pathGroup);
            hammer.on('doubletap', () => {
                if (this._board.readOnly) {
                    return;
                }
                dblclick.forEach((fn) => {
                    if (fn) {
                        fn(this);
                    }
                });
            });
            $(this.pathGroup).dblclick(() => {
                if (this._board.readOnly) {
                    return;
                }
                dblclick.forEach((fn) => {
                    if (fn) {
                        fn(this);
                    }
                });
            });
        }

        $(this.svgGroup).bind(
            'mousedown.blockViewMousedown touchstart.blockViewMousedown',
            this.mouseHandler
        );
    }

    removeControl() {
        this._mouseEnable = false;
        $(this.svgGroup).unbind('.blockViewMousedown');
    }

    setSelectedBlock(board) {
        const { workspace } = board;
        const { selectedBlockView } = workspace;
        const wsBoard = selectedBlockView ? selectedBlockView.getBoard() : board;
        if (board !== wsBoard) {
            wsBoard.setSelectedBlock(null);
        } else {
            board.setSelectedBlock(this);
        }
    }

    onMouseDown(e) {
        if (!this.isInBlockMenu && e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.which == 2) {
            console.log('mouse wheel click disabled');
            return;
        }
        if (e.button == 1) {
            return;
        }
        if (Entry.disposeEvent) {
            Entry.disposeEvent.notify();
        }

        this.longPressTimer = null;

        const board = this.getBoard();
        if (board.workingEvent) {
            return;
        }

        if (this.readOnly || board.viewOnly) {
            return;
        }

        board.workingEvent = true;
        this.setSelectedBlock(board);

        //left mousedown
        if (
            (e.button === 0 || (e.originalEvent && e.originalEvent.touches) || e.touches) &&
            !this._board.readOnly
        ) {
            const eventType = e.type;
            let mouseEvent;
            if (e.originalEvent && e.originalEvent.touches) {
                mouseEvent = e.originalEvent.touches[0];
            } else if (e.touches) {
                mouseEvent = e.touches[0];
            } else {
                mouseEvent = e;
            }

            this.mouseDownCoordinate = {
                x: mouseEvent.pageX,
                y: mouseEvent.pageY,
            };
            const $doc = $(document);

            if (!this.disableMouseEvent) {
                $doc.bind('mousemove.block', this.onMouseMove);
                document.addEventListener('touchmove', this.onMouseMove, { passive: false });
            }
            $doc.bind('mouseup.block', this.onMouseUp);
            document.addEventListener('touchend', this.onMouseUp);
            this.dragInstance = new Entry.DragInstance({
                startX: mouseEvent.pageX,
                startY: mouseEvent.pageY,
                offsetX: mouseEvent.pageX,
                offsetY: mouseEvent.pageY,
                height: 0,
                mode: true,
            });
            board.set({ dragBlock: this });
            this.addDragging();
            this.dragMode = Entry.DRAG_MODE_MOUSEDOWN;

            if (eventType === 'touchstart' || Entry.isMobile()) {
                this.longPressTimer = setTimeout(() => {
                    if (this.longPressTimer) {
                        this.longPressTimer = null;
                        this.onMouseUp(e);
                        this._rightClick(e, 'longPress');
                    }
                }, 700);
            }
        } else if (Entry.Utils.isRightButton(e)) {
            this._rightClick(e);
        }

        if (board.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD && e) {
            document
                .getElementsByClassName('CodeMirror')[0]
                .dispatchEvent(Entry.Utils.createMouseEvent('dragStart', e));
        }
    }

    getVerticalMove(mouseEvent, dragInstance) {
        const dx = Math.abs(mouseEvent.pageX - dragInstance.offsetX);
        const dy = Math.abs(mouseEvent.pageY - dragInstance.offsetY);
        return dy / dx > 1.75;
    }

    onMouseMove(e) {
        e.stopPropagation();
        e.preventDefault();
        const board = this.getBoard();
        const workspaceMode = board.workspace.getMode();

        let mouseEvent;
        if (workspaceMode === Entry.Workspace.MODE_VIMBOARD) {
            this.vimBoardEvent(e, 'dragOver');
        }
        if (e.originalEvent && e.originalEvent.touches) {
            mouseEvent = e.originalEvent.touches[0];
        } else if (e.touches) {
            mouseEvent = e.touches[0];
        } else {
            mouseEvent = e;
        }

        const mouseDownCoordinate = this.mouseDownCoordinate;
        const diff = Math.sqrt(
            Math.pow(mouseEvent.pageX - mouseDownCoordinate.x, 2) +
                Math.pow(mouseEvent.pageY - mouseDownCoordinate.y, 2)
        );
        if (this.dragMode == Entry.DRAG_MODE_DRAG || diff > Entry.BlockView.DRAG_RADIUS) {
            const blockView = this;
            if (
                (blockView.isInBlockMenu &&
                    this.longPressTimer &&
                    this.getVerticalMove(mouseEvent, blockView.dragInstance)) ||
                this.isVerticalMove
            ) {
                this.isVerticalMove = true;
                return;
            } else {
                $(document).unbind('.blockMenu');
            }

            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            if (!this.movable) {
                return;
            }

            if (!this.isInBlockMenu) {
                let isFirst = false;

                if (this.dragMode != Entry.DRAG_MODE_DRAG) {
                    this._toGlobalCoordinate(undefined, true);
                    this.dragMode = Entry.DRAG_MODE_DRAG;
                    this.block.getThread().changeEvent.notify();
                    Entry.GlobalSvg.setView(this, workspaceMode);
                    isFirst = true;
                    this.fromBlockMenu = this.dragInstance && this.dragInstance.isNew;
                }

                if (this.animating) {
                    this.set({ animating: false });
                }

                if (this.dragInstance.height === 0) {
                    const height = -1 + this.height;
                    this.dragInstance.set({ height });
                }

                const dragInstance = this.dragInstance;
                this.moveBy(
                    mouseEvent.pageX - dragInstance.offsetX,
                    mouseEvent.pageY - dragInstance.offsetY,
                    false,
                    true
                );
                Entry.GlobalSvg.position();

                dragInstance.set({
                    offsetX: mouseEvent.pageX,
                    offsetY: mouseEvent.pageY,
                });

                if (!this.originPos) {
                    this.originPos = {
                        x: this.x,
                        y: this.y,
                    };
                }
                if (isFirst) {
                    board.generateCodeMagnetMap();
                }
                this._updateCloseBlock();
            } else {
                board.cloneToGlobal(e);
                // this.terminateEvent();
            }
        }
    }

    terminateEvent() {
        const $doc = $(document);
        document.removeEventListener('touchmove', this.onMouseMove, { passive: false });
        document.removeEventListener('touchend', this.onMouseUp);
        $doc.unbind('.block', this.onMouseUp);
        $doc.unbind('.block', this.onMouseMove);
    }

    onMouseUp(e) {
        if (e.which == 2) {
            console.log('mouse wheel click disabled');
            return;
        }
        if (e.button == 1) {
            return;
        }
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.terminateEvent();
        this.terminateDrag(e);
        const board = this.getBoard();
        if (board) {
            board.set({ dragBlock: null });
            delete board.workingEvent;
        }
        this._setHoverBlockView({ that: this });
        Entry.GlobalSvg.remove();
        this.mouseUpEvent.notify();

        delete this.isVerticalMove;
        delete this.mouseDownCoordinate;
        delete this.dragInstance;
        delete this.magnetsOfThread;
    }

    vimBoardEvent(event, type, block) {
        if (!event) {
            return;
        }
        const dragEvent = Entry.Utils.createMouseEvent(type, event);
        if (block) {
            dragEvent.block = block;
        }
        $('.entryVimBoard>.CodeMirror')[0].dispatchEvent(dragEvent);
    }

    terminateDrag(e) {
        const gs = Entry.GlobalSvg;
        const board = this.getBoard();
        const dragMode = this.dragMode;
        const block = this.block;
        const workspaceMode = board.workspace.getMode();
        this.removeDragging();
        this.set({ visible: true });
        this.dragMode = Entry.DRAG_MODE_NONE;

        const gsRet = gs.terminateDrag(this);

        if (workspaceMode === Entry.Workspace.MODE_VIMBOARD) {
            if (board instanceof Entry.BlockMenu) {
                board.terminateDrag();
                gsRet === gs.DONE && this.vimBoardEvent(e, 'dragEnd', block);
            } else {
                board.clear();
            }
        } else {
            const fromBlockMenu = this.dragInstance && this.dragInstance.isNew;
            if (dragMode === Entry.DRAG_MODE_DRAG) {
                let ripple = false;
                const prevBlock = this.block.getPrevBlock(this.block);
                let suffix = this._board.workspace.trashcan.isOver ? 'ForDestroy' : '';
                switch (gsRet) {
                    case gs.DONE: {
                        let closeBlock = board.magnetedBlockView;
                        if (closeBlock instanceof Entry.BlockView) {
                            closeBlock = closeBlock.block;
                        }
                        if (prevBlock && !closeBlock) {
                            Entry.do(`separateBlock${suffix}`, block);
                        } else if (!prevBlock && !closeBlock && !fromBlockMenu) {
                            if (!block.getThread().view.isGlobal()) {
                                Entry.do(`separateBlock${suffix}`, block);
                            } else {
                                Entry.do(`moveBlock${suffix}`, block);
                                this.dominate();
                            }
                        } else {
                            suffix = fromBlockMenu ? 'FromBlockMenu' : '';
                            if (closeBlock) {
                                if (closeBlock.view.magneting === 'next') {
                                    this.dragMode = dragMode;
                                    const targetPointer = closeBlock.pointer();
                                    targetPointer[3] = -1;
                                    Entry.do(`insertBlock${suffix}`, block, targetPointer).isPass(
                                        fromBlockMenu
                                    );

                                    Entry.ConnectionRipple.setView(closeBlock.view).dispose();
                                    this.dragMode = Entry.DRAG_MODE_NONE;
                                } else {
                                    if (closeBlock.getThread) {
                                        const thread = closeBlock.getThread();
                                        const closeBlockType = closeBlock.type;
                                        if (
                                            closeBlockType &&
                                            thread instanceof Entry.FieldBlock &&
                                            !Entry.block[closeBlockType].isPrimitive
                                        ) {
                                            suffix += 'FollowSeparate';
                                        }
                                    }
                                    Entry.do(`insertBlock${suffix}`, block, closeBlock).isPass(
                                        fromBlockMenu
                                    );
                                    ripple = true;
                                }
                                Entry.Utils.playSound('entryMagneting');
                            } else {
                                Entry.do(`moveBlock${suffix}`, block).isPass(fromBlockMenu);
                                this.dominate();
                            }
                        }
                        break;
                    }
                    case gs.RETURN: {
                        const block = this.block;
                        if (fromBlockMenu) {
                            Entry.do('destroyBlockBelow', this.block).isPass(true);
                        } else {
                            if (prevBlock) {
                                this.set({ animating: false });
                                Entry.Utils.playSound('entryMagneting');
                                this.bindPrev(prevBlock);
                                block.insert(prevBlock);
                            } else {
                                const parent = block.getThread().view.getParent();

                                if (!(parent instanceof Entry.Board)) {
                                    Entry.Utils.playSound('entryMagneting');
                                    Entry.do('insertBlock', block, parent);
                                } else {
                                    const originPos = this.originPos;
                                    this.moveTo(originPos.x, originPos.y, false);
                                    this.dominate();
                                }
                            }
                        }
                        break;
                    }
                    case gs.REMOVE:
                        Entry.Utils.playSound('entryDelete');
                        Entry.do('destroyBlockBelow', this.block).isPass(fromBlockMenu);
                        break;
                }

                board.setMagnetedBlock(null);
                if (ripple) {
                    Entry.ConnectionRipple.setView(block.view).dispose();
                }
            } else if (
                gsRet === gs.REMOVE &&
                fromBlockMenu &&
                dragMode === Entry.DRAG_MODE_MOUSEDOWN
            ) {
                Entry.do('destroyBlockBelow', this.block).isPass(true);
            }
        }

        this.destroyShadow();
        delete this.originPos;
    }

    _getMagnetsInThread() {
        const magnet = { ...this.magnet };

        const lastBlock = this.block.thread?.getLastBlock?.();
        const next = lastBlock?.view?.magnet?.next;
        if (next) {
            magnet.next = next;
        } else {
            delete magnet.next;
        }

        return magnet;
    }

    _updateCloseBlock() {
        if (!this._skeleton.magnets) {
            return;
        }

        const board = this.getBoard();
        const { scale = 1 } = board || {};
        const x = this.x / scale;
        const y = this.y / scale;
        if (!this.magnetsOfThread) {
            this.magnetsOfThread = this._getMagnetsInThread();
        }
        for (const type in this.magnetsOfThread) {
            const view = _.result(
                board.getNearestMagnet(x, type === 'next' ? y + this.getBelowHeight() : y, type),
                'view'
            );

            if (view) {
                return board.setMagnetedBlock(view, type);
            }
        }
        board.setMagnetedBlock(null);
    }

    dominate() {
        this.block.getThread().view.dominate();
        const board = this.getBoard();
        board.scroller.resizeScrollBar.call(board.scroller);
    }

    getSvgRoot() {
        const svgBlockGroup = this.getBoard().svgBlockGroup;
        let node = this.svgGroup;
        while (node.parentNode !== svgBlockGroup) {
            node = node.parentNode;
        }
        return node;
    }

    getBoard() {
        return this._board;
    }

    getComment() {
        return this.block.comment;
    }

    _setBoard() {
        this._board = this._board.code.board;
    }

    destroy(animate) {
        this.block.set({ view: null });
        $(this.svgGroup).unbind('.blockViewMousedown');
        this._destroyObservers();
        const svgGroup = this.svgGroup;

        const _destroyFunc = _.partial(_.result, _, 'destroy');

        if (animate) {
            $(svgGroup).fadeOut(100, () => svgGroup.remove());
        } else {
            svgGroup.remove();
        }
        this.svgCommentGroup && this.svgCommentGroup.remove();

        (this._contents || []).forEach(_destroyFunc);
        (this._statements || []).forEach(_destroyFunc);

        const block = this.block;
        if (Entry.type === 'workspace' && !this.isInBlockMenu) {
            (block.events.viewDestroy || []).forEach((fn) => {
                if (_.isFunction(fn)) {
                    const notIncludeSelf = !!block?.thread?.acceptType;
                    fn(block, notIncludeSelf);
                }
            });
        }
    }

    getShadow() {
        if (!this._shadow) {
            this._shadow = Entry.SVG.createElement(this.svgGroup.cloneNode(true), { opacity: 0.5 });
            this.getBoard().svgGroup.appendChild(this._shadow);
        }
        return this._shadow;
    }

    destroyShadow() {
        _.result(this._shadow, 'remove');
        delete this._shadow;
    }

    _updateMagnet() {
        if (!this._skeleton.magnets) {
            return;
        }
        const magnet = this._skeleton.magnets(this);

        if (magnet.next) {
            this._nextGroup &&
                this._nextGroup.attr('transform', `translate(${magnet.next.x},${magnet.next.y})`);
            this._nextCommentGroup &&
                this._nextCommentGroup.attr(
                    'transform',
                    `translate(${magnet.next.x},${magnet.next.y})`
                );
        }
        this.magnet = magnet;
        this.block.getThread().changeEvent.notify();
    }

    _updateBG() {
        const dragBlock = this._board.dragBlock;
        if (!dragBlock || !dragBlock.dragInstance) {
            return;
        }

        const blockView = this;
        const svgGroup = blockView.svgGroup;
        if (!(this.magnet.next || this.magnet.previous)) {
            // field block
            if (this.magneting) {
                svgGroup.attr({
                    filter: `url(#entryBlockHighlightFilter_${this.getBoard().suffix})`,
                });
                svgGroup.addClass('outputHighlight');
            } else {
                svgGroup.removeClass('outputHighlight');
                svgGroup.removeAttr('filter');
            }
            return;
        }
        const magneting = blockView.magneting;
        if (magneting) {
            const shadow = dragBlock.getShadow();
            const pos = this.getAbsoluteCoordinate();
            let magnet;
            let transform;
            if (magneting === 'previous') {
                magnet = this.magnet.next;
                transform = `translate(${pos.scaleX + magnet.x},${pos.scaleY + magnet.y})`;
            } else if (magneting === 'next') {
                magnet = this.magnet.previous;
                const dragHeight = dragBlock.getBelowHeight();
                const nextX = _get(dragBlock, 'magnet.next.x');
                transform = `translate(${pos.scaleX + magnet.x - nextX},${
                    pos.scaleY + magnet.y - dragHeight
                })`;
            }

            const $shadow = $(shadow);
            $shadow.attr({
                transform,
            });
            $shadow.removeAttr('display');

            this._clonedShadow = shadow;

            if (blockView.background) {
                blockView.background.remove();
                blockView.nextBackground.remove();
                delete blockView.background;
                delete blockView.nextBackground;
            }

            if (magneting === 'previous' && dragBlock.block.thread instanceof Entry.Thread) {
                const height = dragBlock.getBelowHeight() + this.offsetY;
                blockView.originalHeight = blockView.offsetY;
                blockView.set({
                    offsetY: height,
                });
            }
        } else {
            if (this._clonedShadow) {
                this._clonedShadow.attr({
                    display: 'none',
                });
                delete this._clonedShadow;
            }

            const height = blockView.originalHeight;
            if (height !== undefined) {
                if (blockView.background) {
                    blockView.background.remove();
                    blockView.nextBackground.remove();
                    delete blockView.background;
                    delete blockView.nextBackground;
                }
                blockView.set({
                    offsetY: height,
                });
                delete blockView.originalHeight;
            }
        }

        _.result(blockView.block.thread.changeEvent, 'notify');
    }

    addDragging() {
        this.svgGroup.addClass('dragging');
        Entry.playground.setBackpackPointEvent(true);
    }

    removeDragging() {
        this.svgGroup.removeClass('dragging');
        Entry.playground.setBackpackPointEvent(false);
    }

    addSelected() {
        document?.activeElement?.blur();
        $(this.pathGroup).insertAfter(this._nextGroup);
        this.svgGroup.removeClass('activated');
        this.svgGroup.addClass('selected');
    }

    removeSelected() {
        $(this.pathGroup).insertBefore(this._nextGroup);
        this.svgGroup.removeClass('selected');
    }

    addActivated() {
        $(this.pathGroup).insertAfter(this._nextGroup);
        this.svgGroup.removeClass('selected');
        this.svgGroup.addClass('activated');
    }

    removeActivated() {
        $(this.pathGroup).insertBefore(this._nextGroup);
        this.svgGroup.removeClass('activated');
    }

    getSkeleton() {
        return this._skeleton;
    }

    getContentPos() {
        return this._skeleton.contentPos(this);
    }

    renderText() {
        this.renderMode = Entry.BlockView.RENDER_MODE_TEXT;
        this._startContentRender(Entry.BlockView.RENDER_MODE_TEXT);
    }

    renderBlock() {
        this.renderMode = Entry.BlockView.RENDER_MODE_BLOCK;
        this._startContentRender(Entry.BlockView.RENDER_MODE_BLOCK);
    }

    renderByMode(mode, isReDraw) {
        if (this.isRenderMode(mode) && !isReDraw) {
            return;
        }

        this.renderMode = mode;
        this._startContentRender(mode);
    }

    _updateOpacity() {
        if (this.visible === false) {
            this.svgGroup.attr({ opacity: 0 });
            this.svgCommentGroup && this.svgCommentGroup.attr({ opacity: 0 });
        } else {
            this.svgGroup.removeAttr('opacity');
            this.svgCommentGroup && this.svgCommentGroup.removeAttr('opacity');
            this._setPosition();
        }
    }

    _setMovable() {
        if (this.block.isMovable() !== null) {
            this.movable = this.block.isMovable();
        } else if (this._skeleton.movable !== undefined) {
            this.movable = this._skeleton.movable;
        } else {
            this.movable = true;
        }
    }

    _setReadOnly() {
        if (this.block.isReadOnly() !== null) {
            this.readOnly = this.block.isReadOnly();
        } else if (this._skeleton.readOnly !== undefined) {
            this.readOnly = this._skeleton.readOnly;
        } else {
            this.readOnly = false;
        }
    }

    _setCopyable() {
        if (this.block.isCopyable() !== null) {
            this.copyable = this.block.isCopyable();
        } else if (this._skeleton.copyable !== undefined) {
            this.copyable = this._skeleton.copyable;
        } else {
            this.copyable = true;
        }
    }

    bumpAway(distance = 15, delay) {
        const that = this;
        if (delay) {
            const oldX = this.x;
            const oldY = this.y;
            window.setTimeout(() => {
                //only when position not changed
                if (oldX === that.x && oldY === that.y) {
                    that.moveBy(distance, distance, false);
                }
            }, delay);
        } else {
            that.moveBy(distance, distance, false);
        }
    }

    _toLocalCoordinate(view) {
        this.disableMouseEvent = false;
        this.moveTo(0, 0, false);
        const { _nextGroup: parentSvgGroup, _nextCommentGroup: parentCommentGroup } = view;
        parentSvgGroup && parentSvgGroup.appendChild && parentSvgGroup.appendChild(this.svgGroup);
        parentCommentGroup &&
            parentCommentGroup.appendChild &&
            parentCommentGroup.appendChild(this.svgCommentGroup);
    }

    _toGlobalCoordinate(dragMode, doNotUpdatePos) {
        this.disableMouseEvent = false;
        const { x, y } = this.getAbsoluteCoordinate(dragMode);
        this.moveTo(x, y, false, doNotUpdatePos);
        this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
        this.svgCommentGroup && this.getBoard().svgCommentGroup.appendChild(this.svgCommentGroup);
    }

    bindPrev(prevBlock, isDestroy) {
        if (prevBlock) {
            this._toLocalCoordinate(prevBlock.view);
            const nextBlock = prevBlock.getNextBlock();
            if (nextBlock) {
                if (nextBlock && nextBlock !== this.block) {
                    const endBlock = this.block.getLastBlock();
                    if (isDestroy) {
                        nextBlock.view._toLocalCoordinate(prevBlock.view);
                    } else if (endBlock.view.magnet.next) {
                        nextBlock.view._toLocalCoordinate(endBlock.view);
                    } else {
                        nextBlock.view._toGlobalCoordinate();
                        nextBlock.separate();
                        nextBlock.view.bumpAway(null, 100);
                    }
                }
            }
        } else {
            prevBlock = this.block.getPrevBlock();
            if (prevBlock) {
                const prevBlockView = prevBlock.view;
                this._toLocalCoordinate(prevBlockView);
                const nextBlock = this.block.getNextBlock();
                if (nextBlock && nextBlock.view) {
                    nextBlock.view._toLocalCoordinate(this);
                }
            }
        }
    }

    getAbsoluteCoordinate(dragMode) {
        const board = this.getBoard();
        const { scale = 1 } = board || {};
        dragMode = dragMode !== undefined ? dragMode : this.dragMode;
        if (dragMode === Entry.DRAG_MODE_DRAG) {
            return {
                x: this.x,
                y: this.y,
                scaleX: this.x / scale,
                scaleY: this.y / scale,
            };
        }

        const pos = this.block.getThread().view.requestAbsoluteCoordinate(this);
        pos.x += this.x;
        pos.y += this.y;
        pos.scaleX = pos.x / scale;
        pos.scaleY = pos.y / scale;
        return pos;
    }

    getBelowHeight() {
        return this.block.getThread().view.requestPartHeight(this);
    }

    _updateDisplay() {
        if (this.display) {
            $(this.svgGroup).removeAttr('display');
            this._setPosition();
        } else {
            this.svgGroup.attr({
                display: 'none',
            });
        }
    }

    _updateColor() {
        let fillColor = this._schema.color;
        const { deletable, emphasized } = this.block;

        if (deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN || emphasized) {
            const emphasizedColor = this._schema.emphasizedColor;
            if (!emphasizedColor) {
                fillColor = Entry.Utils.getEmphasizeColor(fillColor);
            } else {
                fillColor = emphasizedColor;
            }
        }
        this._fillColor = fillColor;
        this._path.attr({ fill: fillColor });
        this._updateContents();
    }

    _updateContents(isReDraw) {
        const params = [undefined, undefined, this.renderMode, isReDraw];
        this._contents.forEach((c) => c.renderStart(...params));
        this.alignContent(false);
    }

    _destroyObservers() {
        const observers = this._observers;
        while (observers.length) {
            observers.pop().destroy();
        }
    }

    reDraw() {
        if (!(this.visible && this.display)) {
            return;
        }

        this._updateContents(true);

        //해당 블럭이 가진 파라미터가 다른 블럭인 경우 재귀로 동작. indicator(undefined), string 은 제외
        (this.block.data.params || []).forEach((param) => {
            if (_get(param, 'data.view')) {
                param.data.view.reDraw();
            }
        });
        (this.block.statements || []).forEach(({ view }) => view.reDraw());
        (this._extensions || []).forEach((ext) => _.result(ext, 'updatePos'));
    }

    getParam(index) {
        return this._paramMap[index];
    }

    getDataUrl(notClone, notPng) {
        return new Promise((resolve, reject) => {
            const svgGroup = notClone ? this.svgGroup : this.svgGroup.cloneNode(true);
            const svgCommentGroup = notClone
                ? this.svgCommentGroup
                : this.svgCommentGroup && this.svgCommentGroup.cloneNode(true);

            if (!notClone) {
                svgGroup.removeAttribute('opacity');
                svgGroup.setAttribute('class', 'block selected');
            }
            const box = this._skeleton.box(this);
            const scale = this.getBoard()?.scale || 1;
            let fontWeight = this.isWindow7() ? 0.9 : 0.95;
            if (this.type.indexOf('func_') > -1) {
                fontWeight *= 0.99;
            }
            svgGroup.setAttribute(
                'transform',
                'scale(%SCALE) translate(0,0)'.replace('%SCALE', scale)
            );
            this.svgCommentGroup &&
                svgCommentGroup.setAttribute(
                    'transform',
                    'scale(%SCALE) translate(0,0)'.replace('%SCALE', scale)
                );

            const defs = this.getBoard().svgDom.find('defs');
            const images = svgGroup.getElementsByTagName('image');
            const texts = svgGroup.getElementsByTagName('text');

            const fontFamily = EntryStatic.getDefaultFontFamily();
            const boldTypes = ['≥', '≤'];
            const notResizeTypes = ['≥', '≤', '-', '>', '<', '=', '+', '-', 'x', '/'];

            _.toArray(texts).forEach((text) => {
                text.setAttribute('font-family', fontFamily);
                const size = parseInt(text.getAttribute('font-size'), 10);
                const content = $(text).text();
                if (_.includes(boldTypes, content)) {
                    text.setAttribute('font-weight', '500');
                }
                if (_.includes(notResizeTypes, content)) {
                    text.setAttribute('font-size', `${size}px`);
                }
                text.setAttribute('alignment-baseline', 'auto');
            });

            if (images.length) {
                Array.from(images).forEach((image) => {
                    const href = image.getAttribute('href');
                    image.setAttribute('href', `${location.protocol}//${location.host}${href}`);
                });
            }
            this.processSvg(svgGroup, scale, defs, notPng)
                .then((data) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async downloadAsImage(i) {
        const image = await this.getDataUrl();
        Entry.dispatchEvent('saveBlockImages', {
            images: [image],
        });
    }

    _rightClick(e, eventSource) {
        const disposeEvent = Entry.disposeEvent;
        if (disposeEvent) {
            disposeEvent.notify(e);
        }

        const block = this.block;
        const board = this.getBoard();
        delete board.workingEvent;
        //if long pressed block is function_general block
        //edit function
        if (this.isInBlockMenu && eventSource === 'longPress' && block.getFuncId()) {
            return this._schema.events.dblclick[0](this);
        }

        const { clientX: x, clientY: y } = Entry.Utils.convertMouseEvent(e);

        return Entry.ContextMenu.show(_getOptions(this), null, { x, y });

        //helper functon get get context options
        function _getOptions(blockView) {
            const isBoardReadOnly = blockView._board.readOnly;
            const { block, isInBlockMenu, copyable } = blockView;
            const { options: EntryOptions = {} } = Entry;
            const {
                Blocks: { Duplication_option, CONTEXT_COPY_option, Delete_Blocks },
                Menus: { save_as_image },
            } = Lang;

            const copyAndPaste = {
                text: Duplication_option,
                enable: copyable && !isBoardReadOnly,
                callback() {
                    Entry.do('cloneBlock', block.copy());
                },
            };

            const copy = {
                text: CONTEXT_COPY_option,
                enable: copyable && !isBoardReadOnly,
                callback() {
                    block.copyToClipboard();
                },
            };

            const remove = {
                text: Delete_Blocks,
                enable: block.isDeletable() && !isBoardReadOnly,
                callback() {
                    Entry.do('destroyBlock', block);
                },
            };

            const addStorage = !EntryOptions.backpackDisable && {
                text: Lang.Blocks.add_my_storage,
                enable: copyable && !isBoardReadOnly && !!window.user,
                callback() {
                    Entry.dispatchEvent('addStorage', {
                        type: 'block',
                        data: block,
                    });
                },
            };

            const download = {
                text: save_as_image,
                callback() {
                    blockView.downloadAsImage();
                },
            };

            const hasComment = !!block._comment;
            const comment = !EntryOptions.commentDisable && {
                text: hasComment ? Lang.Blocks.delete_comment : Lang.Blocks.add_comment,
                enable: block.isCommentable(),
                callback() {
                    hasComment
                        ? Entry.do('removeComment', block._comment)
                        : Entry.do('createComment', { id: Entry.Utils.generateId() }, board, block);
                },
            };

            let options = [];
            if (_isDownloadable()) {
                options.push(download);
            }

            if (!isInBlockMenu) {
                options = [copyAndPaste, copy, remove, addStorage, ...options, comment].filter(
                    (x) => x
                );
            }

            return options;

            function _isDownloadable() {
                return (
                    Entry.blockSaveImageEnable &&
                    Entry.Utils.isChrome() &&
                    Entry.type === 'workspace' &&
                    !Entry.isMobile()
                );
            }
        }
    }

    addStorage() {
        if (this.block.view) {
            Entry.dispatchEvent('addStorage', {
                type: 'block',
                data: this.block,
            });
        }
    }

    clone() {
        return this.svgGroup.cloneNode(true);
    }

    setBackgroundPath() {
        const board = this.getBoard();
        if (board.dragBlock) {
            return;
        }

        this.resetBackgroundPath();

        const originPath = this._path;

        const clonedPath = originPath.cloneNode(true);
        clonedPath.setAttribute('class', 'blockBackgroundPath');
        clonedPath.setAttribute('fill', this._fillColor);

        this._backgroundPath = clonedPath;
        this.pathGroup.insertBefore(clonedPath, originPath);

        board.enablePattern();
        originPath.attr({
            fill: `url(#blockHoverPattern_${board.suffix})`,
        });
    }

    resetBackgroundPath() {
        const board = this.getBoard();
        if (!this._backgroundPath || !board || !board.disablePattern) {
            return;
        }

        board.disablePattern();
        _.result($(this._backgroundPath), 'remove');
        this._backgroundPath = null;
        this._path.attr({ fill: this._fillColor });
    }

    _getTemplate(renderMode) {
        let template;

        if (renderMode === Entry.BlockView.RENDER_MODE_TEXT) {
            const board = this.getBoard();
            let syntax;
            const workspace = board.workspace;
            if (workspace && workspace.vimBoard) {
                syntax = workspace.vimBoard.getBlockSyntax(this);
            } else {
                if (board.getBlockSyntax) {
                    syntax = board.getBlockSyntax(this, renderMode);
                }
            }

            if (syntax) {
                if (typeof syntax === 'string') {
                    template = syntax;
                } else {
                    template = syntax.template;
                }
            }
        }

        return template || this._schema.template || Lang.template[this.block.type];
    }

    _getSchemaParams(mode) {
        let params = this._schema.params;
        if (mode === Entry.BlockView.RENDER_MODE_TEXT) {
            const workspace = this.getBoard().workspace;
            if (workspace && workspace.vimBoard) {
                const syntax = workspace.vimBoard.getBlockSyntax(this);
                if (syntax && syntax.textParams) {
                    params = syntax.textParams;
                }
            }
        }
        return params;
    }

    detach() {
        this.svgGroup.remove();
    }

    attach(target) {
        (target || this._board.svgBlockGroup).appendChild(this.svgGroup);
    }

    getMagnet(query) {
        const selector = query.shift() || 'next';
        let halfWidth = query.shift();
        if (halfWidth === undefined) {
            halfWidth = 20;
        }
        return {
            getBoundingClientRect: function () {
                const coord = this.getAbsoluteCoordinate();
                const boardOffset = this._board.relativeOffset;
                const magnet = this.magnet[selector];

                return {
                    top: coord.y + boardOffset.top + magnet.y - halfWidth,
                    left: coord.x + boardOffset.left + magnet.x - halfWidth,
                    width: 2 * halfWidth,
                    height: 2 * halfWidth,
                };
            }.bind(this),
        };
    }

    isRenderMode(mode) {
        return this.renderMode === mode;
    }

    _setHoverBlockView(data) {
        if (!data) {
            return;
        }

        const { that, blockView } = data;

        const target = _.result(that.getBoard(), 'workspace');
        if (!target) {
            return;
        }
        target.setHoverBlockView(blockView);
    }

    setHoverBlockView = this._setHoverBlockView;

    getFields() {
        if (!this._schema) {
            return [];
        }

        const THREAD = Entry.Thread;
        const FIELD_BLOCK = Entry.FieldBlock;
        const FIELD_OUTPUT = Entry.FieldOutput;

        return (this._statements || []).reduce(
            (fields, statement) => {
                statement = statement && statement._thread;
                if (!(statement instanceof THREAD)) {
                    return fields;
                }

                return fields.concat(statement.view.getFields());
            },
            (this._contents || []).reduce((fields, c) => {
                if (!c) {
                    return fields;
                }

                fields.push(c);

                if (c instanceof FIELD_BLOCK || c instanceof FIELD_OUTPUT) {
                    //some output block doesn't have value block
                    const valueBlock = c.getValueBlock && c.getValueBlock();
                    if (!valueBlock) {
                        return fields;
                    }
                    fields = fields.concat(valueBlock.view.getFields());
                }

                return fields;
            }, [])
        );
    }

    processSvg(svgGroup, scale = 1, defs) {
        return new Promise((resolve, reject) => {
            let svgData =
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %W %H">(svgGroup)(defs)</svg>';
            const bBox = this.svgGroup.getBoundingClientRect();
            const boxWidth = bBox.width;
            const boxHeight = bBox.height;
            const offset = 2 * scale;
            svgData = svgData
                .replace('(svgGroup)', new XMLSerializer().serializeToString(svgGroup))
                .replace('%W', Math.ceil(boxWidth) + offset)
                .replace('%H', Math.ceil(boxHeight) + offset)
                .replace('(defs)', new XMLSerializer().serializeToString(defs[0]))
                .replace(/>\s+/g, '>')
                .replace(/\s+</g, '<');
            svgData = svgData.replace(/NS\d+:href/gi, 'href');
            const data = Entry.isOffline
                ? `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`
                : svgData;
            resolve({
                width: boxWidth,
                height: boxHeight,
                data,
            });
        });
    }

    loadImage(src, width, height, notPng, multiplier = 1) {
        return new Promise((resolve, reject) => {
            if (Entry.BlockView.pngMap[src] !== undefined) {
                return resolve(Entry.BlockView.pngMap[src]);
            }

            if (notPng) {
                return resolve(`${location.origin}${src}`);
            }

            width *= multiplier;
            height *= multiplier;
            //float point cropped
            width = Math.ceil(width);
            height = Math.ceil(height);

            const img = document.createElement('img');
            img.crossOrigin = 'Anonymous';
            const canvas = document.createElement('canvas');

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            img.onload = function () {
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    const data = canvas.toDataURL('image/png');
                    if (/\.png$/.test(src)) {
                        Entry.BlockView.pngMap[src] = data;
                    }
                    return resolve(data);
                } catch (e) {
                    return reject('error occured');
                }
            };

            img.onerror = function () {
                return reject('error occured');
            };
            img.src = src;
        });
    }

    isWindow7() {
        const platform = window.platform;
        if (platform && platform.name.toLowerCase() === 'windows' && platform.version[0] === '7') {
            return true;
        }
        return false;
    }
};

Entry.BlockView.PARAM_SPACE = 7;
Entry.BlockView.DRAG_RADIUS = 5;
Entry.BlockView.pngMap = {};

Entry.BlockView.RENDER_MODE_BLOCK = 1;
Entry.BlockView.RENDER_MODE_TEXT = 2;
