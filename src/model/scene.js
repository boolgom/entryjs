'use strict';

goog.provide('Entry.Scene');

goog.require('Entry.Model');
goog.require('Entry.STATIC');

Entry.Scene = function() {
    var schema = {
        id: 0,
        type: Entry.STATIC.SCENE,
        name: 0
    };

    Entry.Model(this, schema);
};
