/*
 *
 */
"use strict";

goog.provide("Entry.Field");

/*
 *
 */
Entry.Field = function() {};

(function(p) {
    p.TEXT_LIMIT_LENGTH = 20;

    p.destroy = function() {
        $(this.svgGroup).unbind('mouseup touchend');
        this.destroyOption();
    };

    p.command = function() {
        if (this._startValue) {
            if (this._startValue !== this.getValue() && !this._blockView.isInBlockMenu) {
                Entry.do(
                    'setFieldValue',
                    this._block, this,
                    this.pointer(),
                    this._startValue,
                    this.getValue()
                );
            }
        }
        delete this._startValue;
    };

    p.destroyOption = function() {
        if (this.documentDownEvent) {
            Entry.documentMousedown.detach(this.documentDownEvent);
            delete this.documentDownEvent;
        }

        if (this.disposeEvent) {
            Entry.disposeEvent.detach(this.disposeEvent);
            delete this.documentDownEvent;
        }

        if (this.optionGroup) {
            this.optionGroup.remove();
            delete this.optionGroup;
        }

        this.command();
    };

    p._attachDisposeEvent = function(func) {
        var that = this;

        func = func || function() {
            that.destroyOption();
        };

        that.disposeEvent =
            Entry.disposeEvent.attach(that, func);
    };

    p.align = function(x, y, animate) {
        animate = animate === undefined ? true : animate;
        var svgGroup = this.svgGroup;
        if (this._position) {
            if (this._position.x)
                x = this._position.x;
            if (this._position.y)
                y = this._position.y;
        }

        var transform = "translate(" + x + "," + y + ")";

        if (animate)
            svgGroup.animate({
                transform: transform
            }, 300, mina.easeinout);
        else
            svgGroup.attr({
                transform: transform
            });

        this.box.set({
            x: x,
            y: y
        });
    };

    //get absolute position of field from parent board
    p.getAbsolutePosFromBoard = function() {
        var blockView = this._block.view;
        var contentPos = blockView.getContentPos();
        var absPos = blockView.getAbsoluteCoordinate();

        return {
            x: absPos.x + this.box.x + contentPos.x,
            y: absPos.y + this.box.y + contentPos.y
        };
    };

    //get absolute position of field from parent document
    p.getAbsolutePosFromDocument = function() {
        var blockView = this._block.view;
        var contentPos = blockView.getContentPos();
        var absPos = blockView.getAbsoluteCoordinate();
        var offset = blockView.getBoard().svgDom.offset();

        return {
            x: absPos.x + this.box.x + contentPos.x + offset.left,
            y: absPos.y + this.box.y + contentPos.y + offset.top
        };
    };

    //get relative position of field from blockView origin
    p.getRelativePos = function() {
        var blockView = this._block.view;
        var contentPos = blockView.getContentPos();
        var box = this.box;

        return {
            x: box.x + contentPos.x,
            y: box.y + contentPos.y
        };
    };

    p.truncate = function() {
        var value = String(this.getValue());
        var limit = this.TEXT_LIMIT_LENGTH;
        var ret = value.substring(0, limit);
        if (value.length > limit)
            ret += '...';
        return ret;
    };

    p.appendSvgOptionGroup = function() {
        return this._block.view.getBoard().svgGroup.elem('g');
    };

    p.getValue = function() {
        return this._block.params[this._index];
    };

    p.setValue = function(value, reDraw) {
        if (this.value == value) return;
        this.value = value;
        this._block.params[this._index] = value;
        if (reDraw) this._blockView.reDraw();
    };

    p._isEditable = function() {
        if (Entry.ContextMenu.visible) return false;
        var dragMode = this._block.view.dragMode;
        if (dragMode == Entry.DRAG_MODE_DRAG) return false;
        var blockView = this._block.view;
        var board = blockView.getBoard();
        if (board.disableMouseEvent === true) return false;

        var selectedBlockView = board.workspace.selectedBlockView;

        if (!selectedBlockView || board != selectedBlockView.getBoard()) return false;

        var root = blockView.getSvgRoot();

        return root == selectedBlockView.svgGroup ||
                $(root).has($(blockView.svgGroup));
    };

    p._selectBlockView = function() {
        var blockView = this._block.view;
        blockView.getBoard().setSelectedBlock(blockView);
    };

    p._bindRenderOptions = function() {
        var that = this;

        $(this.svgGroup).bind('mouseup touchend', function(e){
            if (that._isEditable()) {
                that.destroyOption();
                that._startValue = that.getValue();
                that.renderOptions();
            }
        });
    };

    p.pointer = function(pointer) {
        pointer = pointer || [];
        pointer.unshift(this._index);
        pointer.unshift(Entry.PARAM);
        return this._block.pointer(pointer);
    };

    p.getFontSize = function(size) {
        size =
            size || this._blockView.getSkeleton().fontSize || 12;
        return size;
    };

    p.getContentHeight = function() {
        return Entry.isMobile() ? 22: 16;
    };
})(Entry.Field.prototype);
