/*
 *
 */
"use strict";

goog.provide("Entry.CodeView");

/*
 *
 */
Entry.CodeView = function(code, board) {
    Entry.Model(this, false);

    this.code = code;
    this.set({board: board});

    this.observe(this, "changeBoard", ["board"]);

    this.svgThreadGroup = board.svgGroup.group();
    this.svgThreadGroup.board = board;

    this.svgBlockGroup = board.svgGroup.group();
    this.svgBlockGroup.board = board;

    board.bindCodeView(this);

    this.code.map(function(thread) {
        thread.createView(board);
    });
};

(function(p) {
    p.schema = {
        board: null,
        scrollX: 0,
        scrollY: 0
    };

})(Entry.CodeView.prototype);
