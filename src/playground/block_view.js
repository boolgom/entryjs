/*
 *
 */
'use strict';

/*
 *
 */
import _hasIn from 'lodash/hasIn';

Entry.BlockView = function(block, board, mode) {
    var that = this;
    Entry.Model(this, false);
    this.block = block;
    this._lazyUpdatePos = Entry.Utils.debounce(
        block._updatePos.bind(block),
        200
    );
    this.mouseUpEvent = new Entry.Event(this);
    this.disableMouseEvent = false;

    this.dAlignContent = this.alignContent;
    this._board = board;
    this._observers = [];
    this.set(block);
    this.svgGroup = board.svgBlockGroup.elem('g');
    this.svgGroup.blockView = this;

    this._schema = Entry.skinContainer.getSkin(block);

    if (this._schema === undefined) {
        this.block.destroy(false, false);
        return;
    }

    if (mode === undefined) {
        var workspace = this.getBoard().workspace;
        if (workspace && workspace.getBlockViewRenderMode)
            this.renderMode = workspace.getBlockViewRenderMode();
        else this.renderMode = Entry.BlockView.RENDER_MODE_BLOCK;
    } else this.renderMode = Entry.BlockView.RENDER_MODE_BLOCK;

    if (this._schema.deletable) this.block.setDeletable(this._schema.deletable);
    if (this._schema.copyable) this.block.setCopyable(this._schema.copyable);
    if (this._schema.display === false || block.display === false) {
        this.set({ display: false });
    }

    var skeleton = (this._skeleton = Entry.skeleton[this._schema.skeleton]);
    this._contents = [];
    this._statements = [];
    this._extensions = [];
    this.magnet = {};
    this._paramMap = {};

    if (skeleton.magnets && skeleton.magnets(this).next) {
        this.svgGroup.nextMagnet = this.block;
        this._nextGroup = this.svgGroup.elem('g');
        this._observers.push(
            this.observe(this, '_updateMagnet', ['contentHeight'])
        );
    }

    this.isInBlockMenu = this.getBoard() instanceof Entry.BlockMenu;

    this.mouseHandler = function() {
        (_.result(that.block.events, 'mousedown') || []).forEach((fn) =>
            fn(that)
        );
        that.onMouseDown.apply(that, arguments);
    };

    this._startRender(block, mode);

    // observe
    var thisBlock = this.block;
    this._observers.push(thisBlock.observe(this, '_setMovable', ['movable']));
    this._observers.push(thisBlock.observe(this, '_setReadOnly', ['movable']));
    this._observers.push(thisBlock.observe(this, '_setCopyable', ['copyable']));
    this._observers.push(
        thisBlock.observe(this, '_updateColor', ['deletable'], false)
    );
    this._observers.push(this.observe(this, '_updateBG', ['magneting'], false));

    this._observers.push(
        this.observe(this, '_updateOpacity', ['visible'], false)
    );
    this._observers.push(this.observe(this, '_updateDisplay', ['display']));
    this._observers.push(this.observe(this, '_updateMagnet', ['offsetY']));
    this._observers.push(
        board.code.observe(this, '_setBoard', ['board'], false)
    );

    this.dragMode = Entry.DRAG_MODE_NONE;
    Entry.Utils.disableContextmenu(this.svgGroup.node);
    var events = block.events.viewAdd || [];
    if (Entry.type == 'workspace' && this._board instanceof Entry.Board) {
        events.forEach((fn) => {
            if (_.isFunction(fn)) fn(block);
        });
    }
};

Entry.BlockView.PARAM_SPACE = 5;
Entry.BlockView.DRAG_RADIUS = 5;
Entry.BlockView.pngMap = {};

Entry.BlockView.RENDER_MODE_BLOCK = 1;
Entry.BlockView.RENDER_MODE_TEXT = 2;

(function(p) {
    p.schema = {
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
        magneting: false,
        visible: true,
        animating: false,
        shadow: true,
        display: true,
    };

    p._startRender = function(block, mode) {
        var skeleton = this._skeleton;
        var attr = { class: 'block' };

        if (this.display === false) attr.display = 'none';

        var svgGroup = this.svgGroup;

        if (this._schema.css) {
            attr.style = this._schema.css;
        }

        svgGroup.attr(attr);

        (skeleton.classes || []).forEach((c) => svgGroup.addClass(c));

        var path = skeleton.path(this);

        this.pathGroup = svgGroup.elem('g');
        this._updateMagnet();

        this._path = this.pathGroup.elem('path');

        var fillColor = this._schema.color;
        var { deletable, emphasized } = this.block;

        if (deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN || emphasized) {
            fillColor =
                this._schema.emphasizedColor ||
                Entry.Utils.getEmphasizeColor(fillColor);
        }

        this._fillColor = fillColor;

        var pathStyle = {
            d: path,
            fill: fillColor,
            class: 'blockPath',
            blockId: this.id,
        };

        if (this.magnet.next || this._skeleton.nextShadow) {
            this.pathGroup.attr({
                filter:
                    'url(#entryBlockShadowFilter_' +
                    this.getBoard().suffix +
                    ')',
            });
        } else if (this.magnet.string || this.magnet.boolean)
            pathStyle.stroke = skeleton.outerLine;

        if (skeleton.outerLine) {
            pathStyle['stroke-width'] = '0.6';
        }
        this._path.attr(pathStyle);

        this._moveTo(this.x, this.y, false);
        this._startContentRender(mode);
        this._startExtension(mode);
        if (this._board.disableMouseEvent !== true) {
            this._addControl();
        }

        var guide = this.guideSvgGroup;
        guide && svgGroup.insertBefore(guide, svgGroup.firstChild);

        this.bindPrev();
    };

    p._startContentRender = function(mode) {
        mode = _.isUndefined(mode) ? this.renderMode : mode;

        var _removeFunc = _.partial(_.result, _, 'remove');

        _removeFunc(this.contentSvgGroup);
        _removeFunc(this.statementSvgGroup);

        this.contentSvgGroup = this.svgGroup.elem('g');
        this._contents = [];

        var schema = this._schema;
        var statements = schema.statements;

        if (!_.isEmpty(statements)) {
            this.statementSvgGroup = this.svgGroup.elem('g');
        }

        var reg = /(%\d+)/im;
        var parsingReg = /%(\d+)/im;
        var parsingRet;

        var template = this._getTemplate(mode);
        var params = this._getSchemaParams(mode);

        if (mode === Entry.BlockView.RENDER_MODE_TEXT) {
            if (
                /(if)+(.|\n)+(else)+/gim.test(template) &&
                !reg.test(template) &&
                this.isInBlockMenu
            ) {
                template = template.replace(
                    'else',
                    '%' + params.length + ' else'
                );
            }
        }

        var _renderMode = mode || this.renderMode;
        template.split(reg).forEach((param, i) => {
            if (param[0] === ' ') param = param.substring(1);
            if (param[param.length - 1] === ' ')
                param = param.substring(0, param.length - 1);
            if (!param.length) return;

            parsingRet = parsingReg.exec(param);
            if (parsingRet) {
                var paramIndex = parsingRet[1] - 1;
                param = params[paramIndex];
                var field = new Entry['Field' + param.type](
                    param,
                    this,
                    paramIndex,
                    _renderMode,
                    i
                );
                this._contents.push(field);
                this._paramMap[paramIndex] = field;
            } else {
                this._contents.push(new Entry.FieldText({ text: param }, this));
            }
        });

        (schema.statements || []).forEach((s, i) => {
            this._statements.push(new Entry.FieldStatement(s, this, i));
        });

        this.alignContent(false);
    };

    p._startExtension = function(mode) {
        this._extensions = this.block.extensions.map(
            function(e) {
                return new Entry['Ext' + e.type](e, this, mode);
            }.bind(this)
        );
    };

    p._updateSchema = p._startContentRender;

    p.changeType = function(type) {
        this._schema = Entry.block[type || this.type];
        this._updateSchema();
    };

    p.alignContent = function(animate) {
        if (animate !== true) animate = false;
        var cursor = { x: 0, y: 0, height: 0 };
        var statementIndex = 0;
        var width = 0;
        var secondLineHeight = 0;

        for (var i = 0; i < this._contents.length; i++) {
            var c = this._contents[i];
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
                )
                    cursor.x += Entry.BlockView.PARAM_SPACE;
            }

            var box = c.box;
            if (statementIndex !== 0) {
                secondLineHeight = Math.max(
                    Math.round(box.height) * 1000000,
                    secondLineHeight
                );
            } else cursor.height = Math.max(box.height, cursor.height);

            cursor.x += box.width;
            width = Math.max(width, cursor.x);
            if (
                this.contentWidth !== width ||
                this.contentHeight !== cursor.height
            ) {
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

        if (this._statements.length != statementIndex)
            this._alignStatement(animate, statementIndex);

        var contentPos = this.getContentPos();
        this.contentSvgGroup.attr(
            'transform',
            'translate(' + contentPos.x + ',' + contentPos.y + ')'
        );
        this.contentPos = contentPos;
        this._render();

        this._updateMagnet();
        var ws = this.getBoard().workspace;
        if (ws && (this.isFieldEditing() || ws.widgetUpdateEveryTime))
            ws.widgetUpdateEvent.notify();
    };

    p.isFieldEditing = function() {
        var contents = this._contents;
        for (var i = 0; i < contents.length; i++) {
            var content = contents[i] || {};
            if (content.isEditing && content.isEditing()) return true;
        }
        return false;
    };

    p._alignStatement = function(animate, index) {
        var positions = this._skeleton.statementPos
            ? this._skeleton.statementPos(this)
            : [];
        var statement = this._statements[index];
        if (!statement) return;
        var pos = positions[index];
        if (pos) statement.align(pos.x, pos.y, animate);
    };

    p._render = function() {
        this._renderPath();
        this.set(this._skeleton.box(this));
    };

    p._renderPath = function() {
        var newPath = this._skeleton.path(this);

        //no change occured
        if (this._path.getAttribute('d') === newPath) return;

        if (false && Entry.ANIMATION_DURATION !== 0) {
            var that = this;
            setTimeout(function() {
                that._path.animate(
                    { d: newPath },
                    Entry.ANIMATION_DURATION,
                    mina.easeinout
                );
            }, 0);
        } else {
            this._path.attr({ d: newPath });
            this.animating === true && this.set({ animating: false });
        }
    };

    p._setPosition = function(animate = true) {
        if (!(this.x || this.y)) {
            this.svgGroup.removeAttr('transform');
        } else {
            var transform = 'translate(' + this.x + ',' + this.y + ')';

            if (animate && Entry.ANIMATION_DURATION !== 0) {
                this.svgGroup.attr('transform', transform);
                /*
                this.svgGroup.animate({
                    transform: transform
                }, Entry.ANIMATION_DURATION, mina.easeinout);
                */
            } else {
                this.svgGroup.attr('transform', transform);
            }
        }
    };

    p._toLocalCoordinate = function(parentSvgGroup) {
        this.disableMouseEvent = false;
        this._moveTo(0, 0, false);
        parentSvgGroup.appendChild(this.svgGroup);
    };

    p._toGlobalCoordinate = function(dragMode, doNotUpdatePos) {
        this.disableMouseEvent = false;
        var { x, y } = this.getAbsoluteCoordinate(dragMode);
        this._moveTo(x, y, false, doNotUpdatePos);
        this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
    };

    p._moveTo = function(x, y, animate, doNotUpdatePos) {
        var thisX = this.x;
        var thisY = this.y;
        if (!this.display) {
            x = -99999;
            y = -99999;
        }
        if (thisX !== x || thisY !== y) this.set({ x: x, y: y });

        doNotUpdatePos !== true && this._lazyUpdatePos();

        if (this.visible && this.display) this._setPosition(animate);
    };

    p._moveBy = function(x, y, animate, doNotUpdatePos) {
        return this._moveTo(this.x + x, this.y + y, animate, doNotUpdatePos);
    };

    p.moveBy = p._moveBy;

    p._addControl = function() {
        this._mouseEnable = true;

        $(this.svgGroup).bind(
            'mousedown.blockViewMousedown touchstart.blockViewMousedown',
            this.mouseHandler
        );

        var dblclick = _.result(this.block.events, 'dblclick');

        if (dblclick) {
            $(this.svgGroup).dblclick(() => {
                if (this._board.readOnly) {
                    return;
                }

                dblclick.forEach((fn) => {
                    if (fn) fn(this);
                });
            });
        }
    };

    p.removeControl = function() {
        this._mouseEnable = false;
        $(this.svgGroup).unbind('.blockViewMousedown');
    };

    p.onMouseDown = function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        var longPressTimer = null;

        var blockView = this;
        var board = this.getBoard();
        if (Entry.documentMousedown) Entry.documentMousedown.notify(e);
        if (this.readOnly || board.viewOnly) return;

        board.setSelectedBlock(this);

        //left mousedown
        if (
            (e.button === 0 || (e.originalEvent && e.originalEvent.touches)) &&
            !this._board.readOnly
        ) {
            var eventType = e.type;
            var mouseEvent;
            if (e.originalEvent && e.originalEvent.touches) {
                mouseEvent = e.originalEvent.touches[0];
            } else mouseEvent = e;

            this.mouseDownCoordinate = {
                x: mouseEvent.pageX,
                y: mouseEvent.pageY,
            };
            var doc = $(document);
            if (!this.disableMouseEvent)
                doc.bind('mousemove.block touchmove.block', onMouseMove);
            doc.bind('mouseup.block touchend.block', onMouseUp);
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

            if (eventType === 'touchstart') {
                longPressTimer = setTimeout(function() {
                    if (longPressTimer) {
                        longPressTimer = null;
                        onMouseUp();
                        blockView._rightClick(e, 'longPress');
                    }
                }, 1000);
            }
        } else if (Entry.Utils.isRightButton(e)) this._rightClick(e);

        if (board.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD && e) {
            document
                .getElementsByClassName('CodeMirror')[0]
                .dispatchEvent(
                    Entry.Utils.createMouseEvent('dragStart', event)
                );
        }

        var that = this;

        function onMouseMove(e) {
            e.stopPropagation();
            var workspaceMode = board.workspace.getMode();

            var mouseEvent;
            if (workspaceMode === Entry.Workspace.MODE_VIMBOARD)
                p.vimBoardEvent(e, 'dragOver');
            if (e.originalEvent && e.originalEvent.touches)
                mouseEvent = e.originalEvent.touches[0];
            else mouseEvent = e;

            var mouseDownCoordinate = blockView.mouseDownCoordinate;
            var diff = Math.sqrt(
                Math.pow(mouseEvent.pageX - mouseDownCoordinate.x, 2) +
                    Math.pow(mouseEvent.pageY - mouseDownCoordinate.y, 2)
            );
            if (
                blockView.dragMode == Entry.DRAG_MODE_DRAG ||
                diff > Entry.BlockView.DRAG_RADIUS
            ) {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                if (!blockView.movable) return;

                if (!blockView.isInBlockMenu) {
                    var isFirst = false;
                    if (blockView.dragMode != Entry.DRAG_MODE_DRAG) {
                        blockView._toGlobalCoordinate(undefined, true);
                        blockView.dragMode = Entry.DRAG_MODE_DRAG;
                        blockView.block.getThread().changeEvent.notify();
                        Entry.GlobalSvg.setView(blockView, workspaceMode);
                        isFirst = true;
                    }

                    if (this.animating) this.set({ animating: false });

                    if (blockView.dragInstance.height === 0) {
                        var block = blockView.block;
                        var height = -1 + blockView.height;
                        blockView.dragInstance.set({ height: height });
                    }

                    var dragInstance = blockView.dragInstance;
                    blockView._moveBy(
                        mouseEvent.pageX - dragInstance.offsetX,
                        mouseEvent.pageY - dragInstance.offsetY,
                        false,
                        true
                    );
                    dragInstance.set({
                        offsetX: mouseEvent.pageX,
                        offsetY: mouseEvent.pageY,
                    });

                    Entry.GlobalSvg.position();
                    if (!blockView.originPos)
                        blockView.originPos = {
                            x: blockView.x,
                            y: blockView.y,
                        };
                    if (isFirst) board.generateCodeMagnetMap();
                    blockView._updateCloseBlock();
                } else {
                    board.cloneToGlobal(e);
                }
            }
        }

        function onMouseUp(e) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            $(document).unbind('.block', onMouseUp);
            $(document).unbind('.block', onMouseMove);
            blockView.terminateDrag(e);
            if (board) board.set({ dragBlock: null });
            blockView._setHoverBlockView({ that: blockView });
            Entry.GlobalSvg.remove();
            blockView.mouseUpEvent.notify();

            delete blockView.mouseDownCoordinate;
            delete blockView.dragInstance;
        }
    };

    p.vimBoardEvent = function(event, type, block) {
        if (!event) {
            return;
        }
        var dragEvent = Entry.Utils.createMouseEvent(type, event);
        if (block) dragEvent.block = block;
        $('.entryVimBoard>.CodeMirror')[0].dispatchEvent(dragEvent);
    };

    p.terminateDrag = function(e) {
        var gs = Entry.GlobalSvg;
        var board = this.getBoard();
        var dragMode = this.dragMode;
        var block = this.block;
        var workspaceMode = board.workspace.getMode();
        this.removeDragging();
        this.set({ visible: true });
        this.dragMode = Entry.DRAG_MODE_NONE;

        var gsRet = gs.terminateDrag(this);

        if (workspaceMode === Entry.Workspace.MODE_VIMBOARD) {
            if (board instanceof Entry.BlockMenu) {
                board.terminateDrag();
                gsRet === gs.DONE && this.vimBoardEvent(e, 'dragEnd', block);
            } else board.clear();
        } else {
            var fromBlockMenu = this.dragInstance && this.dragInstance.isNew;
            if (dragMode === Entry.DRAG_MODE_DRAG) {
                var ripple = false;
                var prevBlock = this.block.getPrevBlock(this.block);
                var suffix = this._board.workspace.trashcan.isOver
                    ? 'ForDestroy'
                    : '';
                switch (gsRet) {
                    case gs.DONE:
                        var closeBlock = board.magnetedBlockView;
                        if (closeBlock instanceof Entry.BlockView)
                            closeBlock = closeBlock.block;
                        if (prevBlock && !closeBlock) {
                            Entry.do('separateBlock' + suffix, block);
                        } else if (
                            !prevBlock &&
                            !closeBlock &&
                            !fromBlockMenu
                        ) {
                            if (!block.getThread().view.isGlobal()) {
                                Entry.do('separateBlock' + suffix, block);
                            } else {
                                Entry.do('moveBlock' + suffix, block);
                                this.dominate();
                            }
                        } else {
                            suffix = fromBlockMenu ? 'FromBlockMenu' : '';
                            if (closeBlock) {
                                if (closeBlock.view.magneting === 'next') {
                                    var lastBlock = block.getLastBlock();
                                    this.dragMode = dragMode;
                                    var targetPointer = closeBlock.pointer();
                                    targetPointer[3] = -1;
                                    Entry.do(
                                        'insertBlock' + suffix,
                                        block,
                                        targetPointer
                                    ).isPass(fromBlockMenu);

                                    Entry.ConnectionRipple.setView(
                                        closeBlock.view
                                    ).dispose();
                                    this.dragMode = Entry.DRAG_MODE_NONE;
                                } else {
                                    if (closeBlock.getThread) {
                                        var thread = closeBlock.getThread();
                                        var closeBlockType = closeBlock.type;
                                        if (
                                            closeBlockType &&
                                            thread instanceof
                                                Entry.FieldBlock &&
                                            !Entry.block[closeBlockType]
                                                .isPrimitive
                                        )
                                            suffix += 'FollowSeparate';
                                    }
                                    Entry.do(
                                        'insertBlock' + suffix,
                                        block,
                                        closeBlock
                                    ).isPass(fromBlockMenu);
                                    ripple = true;
                                }
                                createjs.Sound.play('entryMagneting');
                            } else {
                                Entry.do('moveBlock' + suffix, block).isPass(
                                    fromBlockMenu
                                );
                                this.dominate();
                            }
                        }
                        break;
                    case gs.RETURN:
                        var block = this.block;
                        if (fromBlockMenu) {
                            Entry.do('destroyBlockBelow', this.block).isPass(
                                true
                            );
                        } else {
                            if (prevBlock) {
                                this.set({ animating: false });
                                createjs.Sound.play('entryMagneting');
                                this.bindPrev(prevBlock);
                                block.insert(prevBlock);
                            } else {
                                var parent = block.getThread().view.getParent();

                                if (!(parent instanceof Entry.Board)) {
                                    createjs.Sound.play('entryMagneting');
                                    Entry.do('insertBlock', block, parent);
                                } else {
                                    var originPos = this.originPos;
                                    this._moveTo(
                                        originPos.x,
                                        originPos.y,
                                        false
                                    );
                                    this.dominate();
                                }
                            }
                        }
                        break;
                    case gs.REMOVE:
                        createjs.Sound.play('entryDelete');
                        Entry.do('destroyBlockBelow', this.block).isPass(
                            fromBlockMenu
                        );
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
    };

    p._updateCloseBlock = function() {
        if (!this._skeleton.magnets) {
            return;
        }

        var board = this.getBoard();

        for (var type in this.magnet) {
            var view = _.result(
                board.getNearestMagnet(
                    this.x,
                    type === 'next' ? this.y + this.getBelowHeight() : this.y,
                    type
                ),
                'view'
            );

            if (view) {
                return board.setMagnetedBlock(view, type);
            }
        }
        board.setMagnetedBlock(null);
    };

    p.dominate = function() {
        this.block.getThread().view.dominate();
    };

    p.getSvgRoot = function() {
        var svgBlockGroup = this.getBoard().svgBlockGroup;
        var node = this.svgGroup;
        while (node.parentNode !== svgBlockGroup) {
            node = node.parentNode;
        }
        return node;
    };

    p.getBoard = function() {
        return this._board;
    };

    p._setBoard = function() {
        this._board = this._board.code.board;
    };

    p.destroy = function(animate) {
        this.block.set({ view: null });
        $(this.svgGroup).unbind('.blockViewMousedown');
        this._destroyObservers();
        var svgGroup = this.svgGroup;

        var _destroyFunc = _.partial(_.result, _, 'destroy');

        if (animate) {
            $(svgGroup).fadeOut(100, () => svgGroup.remove());
        } else {
            svgGroup.remove();
        }

        (this._contents || []).forEach(_destroyFunc);
        (this._statements || []).forEach(_destroyFunc);

        var block = this.block;
        if (Entry.type == 'workspace' && !this.isInBlockMenu)
            (block.events.viewDestroy || []).forEach((fn) => {
                if (_.isFunction(fn)) fn(block);
            });
    };

    p.getShadow = function() {
        if (!this._shadow) {
            this._shadow = Entry.SVG.createElement(
                this.svgGroup.cloneNode(true),
                { opacity: 0.5 }
            );
            this.getBoard().svgGroup.appendChild(this._shadow);
        }
        return this._shadow;
    };

    p.destroyShadow = function() {
        _.result(this._shadow, 'remove');
        delete this._shadow;
    };

    p._updateMagnet = function() {
        if (!this._skeleton.magnets) return;
        var magnet = this._skeleton.magnets(this);
        if (magnet.next)
            this._nextGroup.attr(
                'transform',
                'translate(' + magnet.next.x + ',' + magnet.next.y + ')'
            );
        this.magnet = magnet;
        this.block.getThread().changeEvent.notify();
    };

    p._updateBG = function() {
        var dragBlock = this._board.dragBlock;
        if (!dragBlock || !dragBlock.dragInstance) return;

        var blockView = this;
        var svgGroup = blockView.svgGroup;
        if (!(this.magnet.next || this.magnet.previous)) {
            // field block
            if (this.magneting) {
                svgGroup.attr({
                    filter:
                        'url(#entryBlockHighlightFilter_' +
                        this.getBoard().suffix +
                        ')',
                });
                svgGroup.addClass('outputHighlight');
            } else {
                svgGroup.removeClass('outputHighlight');
                svgGroup.removeAttr('filter');
            }
            return;
        }
        var magneting = blockView.magneting;
        var block = blockView.block;
        if (magneting) {
            var shadow = dragBlock.getShadow();
            var pos = this.getAbsoluteCoordinate();
            var magnet, transform;
            if (magneting === 'previous') {
                magnet = this.magnet.next;
                transform =
                    'translate(' +
                    (pos.x + magnet.x) +
                    ',' +
                    (pos.y + magnet.y) +
                    ')';
            } else if (magneting === 'next') {
                magnet = this.magnet.previous;
                var dragHeight = dragBlock.getBelowHeight();
                transform =
                    'translate(' +
                    (pos.x + magnet.x) +
                    ',' +
                    (pos.y + magnet.y - dragHeight) +
                    ')';
            }

            var $shadow = $(shadow);
            $shadow.attr({
                transform: transform,
            });
            $shadow.removeAttr('display');

            this._clonedShadow = shadow;

            if (blockView.background) {
                blockView.background.remove();
                blockView.nextBackground.remove();
                delete blockView.background;
                delete blockView.nextBackground;
            }

            if (
                magneting === 'previous' &&
                dragBlock.block.thread instanceof Entry.Thread
            ) {
                var height = dragBlock.getBelowHeight() + this.offsetY;

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

            var height = blockView.originalHeight;
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
    };

    p.addDragging = function() {
        this.svgGroup.addClass('dragging');
    };

    p.removeDragging = function() {
        this.svgGroup.removeClass('dragging');
    };

    p.addSelected = function() {
        this.svgGroup.addClass('selected');
    };

    p.removeSelected = function() {
        this.svgGroup.removeClass('selected');
    };

    p.getSkeleton = function() {
        return this._skeleton;
    };

    p.getContentPos = function() {
        return this._skeleton.contentPos(this);
    };

    p.renderText = function() {
        this.renderMode = Entry.BlockView.RENDER_MODE_TEXT;
        this._startContentRender(Entry.BlockView.RENDER_MODE_TEXT);
    };

    p.renderBlock = function() {
        this.renderMode = Entry.BlockView.RENDER_MODE_BLOCK;
        this._startContentRender(Entry.BlockView.RENDER_MODE_BLOCK);
    };

    p.renderByMode = function(mode, isReDraw) {
        if (this.isRenderMode(mode) && !isReDraw) return;

        this.renderMode = mode;
        this._startContentRender(mode);
    };

    p._updateOpacity = function() {
        if (this.visible === false) {
            this.svgGroup.attr({ opacity: 0 });
        } else {
            this.svgGroup.removeAttr('opacity');
            this._setPosition();
        }
    };

    p._setMovable = function() {
        this.movable =
            this.block.isMovable() !== null
                ? this.block.isMovable()
                : this._skeleton.movable !== undefined
                    ? this._skeleton.movable
                    : true;
    };

    p._setReadOnly = function() {
        this.readOnly =
            this.block.isReadOnly() !== null
                ? this.block.isReadOnly()
                : this._skeleton.readOnly !== undefined
                    ? this._skeleton.readOnly
                    : false;
    };

    p._setCopyable = function() {
        this.copyable =
            this.block.isCopyable() !== null
                ? this.block.isCopyable()
                : this._skeleton.copyable !== undefined
                    ? this._skeleton.copyable
                    : true;
    };

    p.bumpAway = function(distance = 15, delay) {
        var that = this;
        if (delay) {
            var oldX = this.x,
                oldY = this.y;
            window.setTimeout(function() {
                //only when position not changed
                if (oldX === that.x && oldY === that.y)
                    that._moveBy(distance, distance, false);
            }, delay);
        } else that._moveBy(distance, distance, false);
    };

    p.bindPrev = function(prevBlock, isDestroy) {
        if (prevBlock) {
            this._toLocalCoordinate(prevBlock.view._nextGroup);
            var nextBlock = prevBlock.getNextBlock();
            if (nextBlock)
                if (nextBlock && nextBlock !== this.block) {
                    var endBlock = this.block.getLastBlock();
                    if (isDestroy)
                        nextBlock.view._toLocalCoordinate(
                            prevBlock.view._nextGroup
                        );
                    else if (endBlock.view.magnet.next)
                        nextBlock.view._toLocalCoordinate(
                            endBlock.view._nextGroup
                        );
                    else {
                        nextBlock.view._toGlobalCoordinate();
                        nextBlock.separate();
                        nextBlock.view.bumpAway(null, 100);
                    }
                }
        } else {
            prevBlock = this.block.getPrevBlock();
            if (prevBlock) {
                var prevBlockView = prevBlock.view;

                this._toLocalCoordinate(prevBlockView._nextGroup);
                var nextBlock = this.block.getNextBlock();
                if (nextBlock && nextBlock.view)
                    nextBlock.view._toLocalCoordinate(this._nextGroup);
            }
        }
    };

    p.getAbsoluteCoordinate = function(dragMode) {
        dragMode = dragMode !== undefined ? dragMode : this.dragMode;
        if (dragMode === Entry.DRAG_MODE_DRAG) {
            return {
                x: this.x,
                y: this.y,
            };
        }

        var pos = this.block.getThread().view.requestAbsoluteCoordinate(this);
        pos.x += this.x;
        pos.y += this.y;
        return pos;
    };

    p.getBelowHeight = function() {
        return this.block.getThread().view.requestPartHeight(this);
    };

    p._updateDisplay = function() {
        if (this.display) {
            $(this.svgGroup).removeAttr('display');
            this._setPosition();
        } else {
            this.svgGroup.attr({
                display: 'none',
            });
        }
    };

    p._updateColor = function() {
        var fillColor = this._schema.color;
        var { deletable, emphasized } = this.block;

        if (deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN || emphasized) {
            var emphasizedColor = this._schema.emphasizedColor;
            if (!emphasizedColor) {
                fillColor = Entry.Utils.getEmphasizeColor(fillColor);
            } else {
                fillColor = emphasizedColor;
            }
        }
        this._fillColor = fillColor;
        this._path.attr({ fill: fillColor });
        this._updateContents();
    };

    p._updateContents = function(isReDraw) {
        var params = [undefined, undefined, this.renderMode, isReDraw];
        this._contents.forEach((c) => c.renderStart.apply(c, params));
        this.alignContent(false);
    };

    p._destroyObservers = function() {
        var observers = this._observers;
        while (observers.length) observers.pop().destroy();
    };

    p.addActivated = function() {
        this.svgGroup.addClass('activated');
    };

    p.removeActivated = function() {
        this.svgGroup.removeClass('activated');
    };

    p.reDraw = function() {
        if (!(this.visible && this.display)) return;

        this._updateContents(true);

        //해당 블럭이 가진 파라미터가 다른 블럭인 경우 재귀로 동작. indicator(undefined), string 은 제외
        (this.block.data.params || []).forEach((param) => {
            if(_hasIn(param, 'data.view')){
                param.data.view.reDraw();
            }
        });
        (this.block.statements || []).forEach(({ view }) => view.reDraw());
        (this._extensions || []).forEach((ext) => _.result(ext, 'updatePos'));
    };

    p.getParam = function(index) {
        return this._paramMap[index];
    };

    p.getDataUrl = function(notClone, notPng) {
        var deferred = $.Deferred();
        var svgData =
            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %W %H">(svgGroup)(defs)</svg>';
        var bBox = this.svgGroup.getBoundingClientRect();
        var svgGroup = notClone ? this.svgGroup : this.svgGroup.cloneNode(true);
        var box = this._skeleton.box(this);
        var scale = notPng ? 1 : 1.5;
        var fontWeight = isWindow7() ? 0.9 : 0.95;
        if (this.type.indexOf('func_') > -1) fontWeight *= 0.99;
        svgGroup.setAttribute(
            'transform',
            'scale(%SCALE) translate(%X,%Y)'
                .replace('%X', -box.offsetX)
                .replace('%Y', -box.offsetY)
                .replace('%SCALE', scale)
        );

        var defs = this.getBoard().svgDom.find('defs');

        var images = svgGroup.getElementsByTagName('image');
        var texts = svgGroup.getElementsByTagName('text');

        var fontFamily =
            "'nanumBarunRegular', 'NanumGothic', '나눔고딕','NanumGothicWeb', '맑은 고딕', 'Malgun Gothic', Dotum";
        var boldTypes = ['≥', '≤'];
        var notResizeTypes = ['≥', '≤', '-', '>', '<', '=', '+', '-', 'x', '/'];

        _.toArray(texts).forEach((text) => {
            text.setAttribute('font-family', fontFamily);
            var size = parseInt(text.getAttribute('font-size'));
            var content = $(text).text();
            if (_.contains(boldTypes, content)) {
                text.setAttribute('font-weight', '500');
            }

            if (content == 'q') {
                var y = parseInt(text.getAttribute('y'));
                text.setAttribute('y', y - 1);
            }

            if (_.contains(notResizeTypes, content)) {
                text.setAttribute('font-size', size + 'px');
            } else {
                text.setAttribute('font-size', size * fontWeight + 'px');
            }
            text.setAttribute('alignment-baseline', 'baseline');
        });

        var counts = 0;
        if (!images.length) {
            processSvg();
        } else {
            _.toArray(images).forEach((img) => {
                var href = img.getAttribute('href');
                loadImage(
                    href,
                    img.getAttribute('width'),
                    img.getAttribute('height')
                ).then(function(src) {
                    img.setAttribute('href', src);
                    if (++counts == images.length) return processSvg();
                });
            });
        }

        return deferred.promise();

        function processSvg() {
            svgData = svgData
                .replace(
                    '(svgGroup)',
                    new XMLSerializer().serializeToString(svgGroup)
                )
                .replace('%W', bBox.width * scale)
                .replace('%H', bBox.height * scale)
                .replace(
                    '(defs)',
                    new XMLSerializer().serializeToString(defs[0])
                )
                .replace(/>\s+/g, '>')
                .replace(/\s+</g, '<');
            var src =
                'data:image/svg+xml;base64,' +
                btoa(unescape(encodeURIComponent(svgData)));
            svgData = null;
            if (notPng) {
                deferred.resolve({
                    src: src,
                    width: bBox.width,
                    height: bBox.height,
                });
                svgGroup = null;
            } else {
                loadImage(src, bBox.width, bBox.height, 1.5).then(
                    function(src) {
                        svgGroup = null;
                        deferred.resolve({
                            src: src,
                            width: bBox.width,
                            height: bBox.height,
                        });
                    },
                    function(err) {
                        deferred.reject('error occured');
                    }
                );
            }
            src = null;
        }

        function loadImage(src, width, height, multiplier = 1) {
            return new Promise((resolve, reject) => {
                if (Entry.BlockView.pngMap[src] !== undefined) {
                    return resolve(Entry.BlockView.pngMap[src]);
                }

                width *= multiplier;
                height *= multiplier;
                //float point cropped
                width = Math.ceil(width);
                height = Math.ceil(height);

                var img = document.createElement('img');
                img.crossOrigin = 'Anonymous';
                var canvas = document.createElement('canvas');

                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');

                img.onload = function() {
                    ctx.drawImage(img, 0, 0, width, height);
                    var data = canvas.toDataURL('image/png');
                    if (/\.png$/.test(src)) Entry.BlockView.pngMap[src] = data;
                    return resolve(data);
                };

                img.onerror = function() {
                    return reject('error occured');
                };
                img.src = src;
            });
        }

        function isWindow7() {
            var platform = window.platform;
            if (
                platform &&
                platform.name.toLowerCase() === 'windows' &&
                platform.version[0] === '7'
            ) {
                return true;
            }
            return false;
        }
    };

    p.downloadAsImage = function(i) {
        this.getDataUrl().then((data) => {
            var download = document.createElement('a');
            download.href = data.src;
            var name = '엔트리 블록';
            if (i) name += i;
            download.download = `${name}.png`;
            download.click();
        });
    };

    p._rightClick = function(e, eventSource) {
        var disposeEvent = Entry.disposeEvent;
        if (disposeEvent) disposeEvent.notify(e);

        var block = this.block;

        //if long pressed block is function_general block
        //edit function
        if (
            this.isInBlockMenu &&
            eventSource === 'longPress' &&
            block.getFuncId()
        ) {
            return this._schema.events.dblclick[0](this);
        }

        var { clientX: x, clientY: y } = Entry.Utils.convertMouseEvent(e);

        return Entry.ContextMenu.show(_getOptions(this), null, { x, y });

        //helper functon get get context options
        function _getOptions(blockView) {
            var isBoardReadOnly = blockView._board.readOnly,
                { block, isInBlockMenu, copyable } = blockView,
                {
                    Blocks: {
                        Duplication_option,
                        CONTEXT_COPY_option,
                        Delete_Blocks,
                    },
                    Menus: { save_as_image },
                } = Lang;

            var copyAndPaste = {
                text: Duplication_option,
                enable: copyable && !isBoardReadOnly,
                callback: function() {
                    Entry.do('cloneBlock', block.copy());
                },
            };

            var copy = {
                text: CONTEXT_COPY_option,
                enable: copyable && !isBoardReadOnly,
                callback: function() {
                    block.copyToClipboard();
                },
            };

            var remove = {
                text: Delete_Blocks,
                enable: block.isDeletable() && !isBoardReadOnly,
                callback: function() {
                    Entry.do('destroyBlock', block);
                },
            };

            var download = {
                text: save_as_image,
                callback: function() {
                    blockView.downloadAsImage();
                },
            };

            var options = [];
            if (_isDownloadable()) {
                options.push(download);
            }

            if (!isInBlockMenu) {
                options = [copyAndPaste, copy, remove, ...options];
            }

            return options;

            function _isDownloadable() {
                return (
                    Entry.Utils.isChrome() &&
                    Entry.type == 'workspace' &&
                    !Entry.isMobile()
                );
            }
        }
    };

    p.clone = function() {
        return this.svgGroup.cloneNode(true);
    };

    p.setBackgroundPath = function() {
        var board = this.getBoard();
        if (board.dragBlock) return;

        this.resetBackgroundPath();

        var originPath = this._path;

        var clonedPath = originPath.cloneNode(true);
        clonedPath.setAttribute('class', 'blockBackgroundPath');
        clonedPath.setAttribute('fill', this._fillColor);

        this._backgroundPath = clonedPath;
        this.pathGroup.insertBefore(clonedPath, originPath);

        board.enablePattern();
        originPath.attr({
            fill: `url(#blockHoverPattern_${board.suffix})`,
        });
    };

    p.resetBackgroundPath = function() {
        var board = this.getBoard();
        if (!this._backgroundPath || !board || !board.disablePattern) return;

        board.disablePattern();
        _.result($(this._backgroundPath), 'remove');
        this._backgroundPath = null;
        this._path.attr({ fill: this._fillColor });
    };

    p._getTemplate = function(renderMode) {
        var template;

        if (renderMode === Entry.BlockView.RENDER_MODE_TEXT) {
            var board = this.getBoard();
            var syntax;
            var workspace = board.workspace;
            if (workspace && workspace.vimBoard) {
                syntax = workspace.vimBoard.getBlockSyntax(this);
            } else {
                if (board.getBlockSyntax)
                    syntax = board.getBlockSyntax(this, renderMode);
            }

            if (syntax) {
                if (typeof syntax === 'string') template = syntax;
                else template = syntax.template;
            }
        }

        return (
            template || this._schema.template || Lang.template[this.block.type]
        );
    };

    p._getSchemaParams = function(mode) {
        var params = this._schema.params;
        if (mode === Entry.BlockView.RENDER_MODE_TEXT) {
            var workspace = this.getBoard().workspace;
            if (workspace && workspace.vimBoard) {
                var syntax = workspace.vimBoard.getBlockSyntax(this);
                if (syntax && syntax.textParams) params = syntax.textParams;
            }
        }
        return params;
    };

    p.detach = function() {
        this.svgGroup.remove();
    };

    p.attach = function(target) {
        (target || this._board.svgBlockGroup).appendChild(this.svgGroup);
    };

    p.getMagnet = function(query) {
        var selector = query.shift() || 'next';
        var halfWidth = query.shift();
        if (halfWidth === undefined) halfWidth = 20;
        return {
            getBoundingClientRect: function() {
                var coord = this.getAbsoluteCoordinate(),
                    boardOffset = this._board.relativeOffset,
                    magnet = this.magnet[selector];

                return {
                    top: coord.y + boardOffset.top + magnet.y - halfWidth,
                    left: coord.x + boardOffset.left + magnet.x - halfWidth,
                    width: 2 * halfWidth,
                    height: 2 * halfWidth,
                };
            }.bind(this),
        };
    };

    p.isRenderMode = function(mode) {
        return this.renderMode === mode;
    };

    p._setHoverBlockView = function(data) {
        if (!data) return;

        var { that, blockView } = data;

        var target = _.result(that.getBoard(), 'workspace');
        if (!target) {
            return;
        }
        target.setHoverBlockView(blockView);
    };

    p.setHoverBlockView = p._setHoverBlockView;

    p.getFields = function() {
        if (!this._schema) {
            return [];
        }

        var THREAD = Entry.Thread,
            FIELD_BLOCK = Entry.FieldBlock,
            FIELD_OUTPUT = Entry.FieldOutput;

        return (this._statements || []).reduce(
            function(fields, statement) {
                statement = statement && statement._thread;
                if (!(statement instanceof THREAD)) {
                    return fields;
                }

                return fields.concat(statement.view.getFields());
            },
            (this._contents || []).reduce(function(fields, c) {
                if (!c) return fields;

                fields.push(c);

                if (c instanceof FIELD_BLOCK || c instanceof FIELD_OUTPUT) {
                    //some output block doesn't have value block
                    var valueBlock = c.getValueBlock && c.getValueBlock();
                    if (!valueBlock) {
                        return fields;
                    }
                    fields = fields.concat(valueBlock.view.getFields());
                }

                return fields;
            }, [])
        );
    };
})(Entry.BlockView.prototype);
