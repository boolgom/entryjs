/*
 *
 */
"use strict";

goog.provide("Entry.Mutator");

/*
 *
 */
Entry.Mutator = function() {
};

(function(m) {
    m.mutate = function(blockType, schemaDiff, changeData) {
        var blockSchema = Entry.block[blockType];
        if (blockSchema.changeEvent === undefined)
            blockSchema.changeEvent = new Entry.Event();
        if (blockSchema.paramsBackupEvent === undefined)
            blockSchema.paramsBackupEvent = new Entry.Event();
        if (blockSchema.destroyParamsBackupEvent === undefined)
            blockSchema.destroyParamsBackupEvent = new Entry.Event();

        //statements params template
        blockSchema.template = schemaDiff.template;
        blockSchema.params = schemaDiff.params;

        blockSchema
            .changeEvent
            .notify(1, changeData);
    };
})(Entry.Mutator);

(function(p) {
})(Entry.Mutator.prototype);
