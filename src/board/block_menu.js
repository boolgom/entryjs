"use strict";

goog.provide("Entry.BlockMenu");

goog.require("Entry.Dom");
goog.require("Entry.Model");
goog.require("Entry.Utils");

/*
 *
 * @param {object} dom which to inject playground
 */
Entry.BlockMenu = function(dom) {
    Entry.Model(this, false);

    if (typeof dom === "string") {
        dom = $('#' + dom);
    } else
        dom = $(dom);

    if (dom.prop("tagName") !== "DIV")
        return console.error("Dom is not div element");

    if (typeof window.Snap !== "function")
        return console.error("Snap library is required");

    this._svgDom = Entry.Dom(
        $('<svg id="blockMenu" width="100%" height="100%"' +
          'version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'),
        { parent: dom }
    );

    this.offset = this._svgDom.offset();

    this.snap = Snap('#blockMenu');
    this.snap.block = "null";

    this._code = null;

    this.observe(this, "cloneThread", ['dragBlock']);

};

(function(p) {
    p.schema = {
        dragBlock: null,
        closeBlock: null
    };

    p.setBlocks = function(code) {
        if (!(code instanceof Entry.Code))
            return console.error("You must inject code instance");
        this._code = code;

        code.bindBoard(this);

        this.align();
    };

    p.cloneThread = function() {

        console.log(this.dragBlock);
    };

    p.align = function() {
        var threads = this._code.threads.getAll();
        var vPadding = 0,
            hPadding = this._svgDom.width()/2;

        for (var i=0,len=threads.length; i<len; i++) {
            var thread = threads[i];
            thread.moveTo(hPadding, vPadding, true);
            vPadding += thread.height + 10;
        }
    };

    p.updateCloseMagnet = function(targetBlock) {
    };

    p.terminateDrag = function(block) {
        this.align();
    };

    p.dominate = function(thread) {
        this.snap.append(thread.svgGroup);
    };

})(Entry.BlockMenu.prototype);
