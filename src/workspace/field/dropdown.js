/*
 */
"use strict";

goog.provide("Entry.FieldDropdown");

/*
 *
 */
Entry.FieldDropdown = function(content, blockView) {
    this._block = blockView.block;

    var box = new Entry.BoxModel();
    this.box = box;

    this.svgGroup = null;

    this._contents = content;

    this.renderStart(blockView);
};

(function(p) {
    p.renderStart = function(blockView) {
        var self = this;

        this.options = this._contents.options;
        this.key = this._contents.key;
        this.value = this._block.values[this.key];
        this.width = 39;
        this.height = 22;

        this.svgGroup = blockView.contentSvgGroup.group();
        this.svgGroup.attr({
            class: 'entry-field-dropdown'
        });
        var input = this.svgGroup.rect(0, -12, 39, 22, 3);
        input.attr({
            fill: "#80cbf8"
        });

        this.textElement = this.svgGroup.text(5, 3, this.value);
        var button = this.svgGroup.polygon(28, -2, 34, -2, 31, 2);
        button.attr({
            fill: "#127cbd",
            stroke: "#127cbd"
        });

        this.svgGroup.mouseup(function(e) {
            if (self._block.view.dragMode == Entry.DRAG_MODE_MOUSEDOWN)
                self.renderOptions();
        });

        this.box.set({
            x: 0,
            y: 0,
            width: 39,
            height: 22
        });
    };

    p.renderOptions = function() {
        var self = this;
        this.destroyOption();

        var blockView = this._block.view;

        this.documentDownEvent = Entry.documentMousedown.attach(
            this, function(){
                Entry.documentMousedown.detach(this.documentDownEvent);
                self.optionGroup.remove();
            }
        );

        this.optionGroup = blockView.getBoard().svgGroup.group();

        var matrix = blockView.svgGroup.transform().globalMatrix;
        var x = matrix.e;
        var y = matrix.f;

        var options = this.options;
        this.optionGroup.attr({
            class: 'entry-field-dropdown',
            transform: "t" + (x -45) + " " + (y + 35)
        });

        for (var i in options) {
            var index = Number(i);
            var element = this.optionGroup.group().attr({
                class: 'rect',
                transform: "t" + 0 + " " + (index * 23)
            });

            var rect = element.rect(
                0, 0,
                38, 23
            );

            element.text(
                3, 13,
                options[i]
            ).attr({
                "alignment-baseline": "central"
            });

            (function(elem, value) {
                elem.mousedown(function(){
                    self.applyValue(value);
                    self.destroyOption();
                });
            })(element, options[i]);
        }
    };

    p.align = function(x, y, animate) {
        animate = animate === undefined ? true : animate;
        var svgGroup = this.svgGroup;

        var transform = "t" + x + " " + y;

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

    p.applyValue = function(value) {
        this._block.values[this.key] = value;
        this.textElement.node.textContent = value;
    };

    p.destroyOption = function() {
        if (this.documentDownEvent) {
            Entry.documentMousedown.detach(this.documentDownEvent);
            delete this.documentDownEvent;
        }

        if (this.optionGroup) {
            this.optionGroup.remove();
            delete this.optionGroup;
        }
    };
})(Entry.FieldDropdown.prototype);
