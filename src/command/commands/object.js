/*
 *
 */
'use strict';

const { returnEmptyArr, createTooltip } = require('../command_util');
import VideoUtils from '@entrylabs/legacy-video';
import WebUsbFlasher from '../../class/hardware/webUsbFlasher';

(function (c) {
    const COMMAND_TYPES = Entry.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.selectObject] = {
        do(objectId) {
            return Entry.container.selectObject(objectId);
        },
        state(objectId) {
            const playground = Entry.playground;
            if (playground && playground.object) {
                return [playground.object.id];
            }
        },
        log(objectId) {
            return [objectId];
        },
        undo: 'selectObject',
    };

    c[COMMAND_TYPES.objectEditButtonClick] = {
        do(objectId) {
            Entry.container.getObject(objectId).toggleEditObject();
        },
        state(objectId) {
            return [];
        },
        log(objectId) {
            return [
                ['objectId', objectId],
                ['objectIndex', Entry.container.getObjectIndex(objectId)],
            ];
        },
        skipUndoStack: true,
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        dom: ['container', 'objectIndex', '&1', 'editButton'],
        undo: 'selectObject',
    };

    c[COMMAND_TYPES.objectAddPicture] = {
        do(objectId, picture, isSelect = true) {
            const hashId = c[COMMAND_TYPES.objectAddPicture].hashId;
            if (hashId) {
                picture.id = hashId;
                delete c[COMMAND_TYPES.objectAddPicture].hashId;
            }
            Entry.container.getObject(objectId).addPicture(picture);
            Entry.playground.injectPicture(isSelect);
            isSelect && Entry.playground.selectPicture(picture);
            Entry.dispatchEvent('dismissModal');
        },
        state(objectId, picture) {
            return [objectId, picture];
        },
        log(objectId, picture) {
            const o = {};
            o._id = picture._id;
            o.id = picture.id;
            o.dimension = picture.dimension;
            o.filename = picture.filename;
            o.fileurl = picture.fileurl;
            o.thumbUrl = picture.thumbUrl;
            o.name = picture.name;
            o.scale = picture.scale;
            return [
                ['objectId', objectId],
                ['picture', o],
            ];
        },
        dom: ['.btn_confirm_modal'],
        restrict(data, domQuery, callback) {
            this.hashId = data.content[2][1].id;

            const tooltip = new Entry.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: '.btn_confirm_modal',
                    },
                ],
                {
                    restrict: true,
                    dimmed: true,
                    render: false,
                    callBack: callback,
                }
            );

            const event = Entry.getMainWS().widgetUpdateEvent;

            if (!data.skip) {
                Entry.dispatchEvent(
                    'openPictureManager',
                    data.content[2][1]._id,
                    event.notify.bind(event)
                );
            }

            return tooltip;
        },
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectRemovePicture',
    };

    c[COMMAND_TYPES.objectRemovePicture] = {
        do(objectId, picture) {
            Entry.container.getObject(objectId).removePicture(picture.id);
        },
        state(objectId, picture) {
            return [objectId, picture];
        },
        log(objectId, picture) {
            return [
                ['objectId', objectId],
                ['pictureId', picture._id],
            ];
        },
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectAddPicture',
    };

    c[COMMAND_TYPES.objectAddSound] = {
        do(objectId, sound, isSelect = true) {
            const hashId = c[COMMAND_TYPES.objectAddSound].hashId;
            if (hashId) {
                sound.id = hashId;
                delete c[COMMAND_TYPES.objectAddSound].hashId;
            }
            const object = Entry.container.getObject(objectId);
            if (!object.selectedSound) {
                object.selectedSound = sound;
            }
            object.addSound(sound);
            Entry.playground.injectSound(isSelect);
            isSelect && Entry.playground.selectSound(sound);
            Entry.dispatchEvent('dismissModal');
        },
        state(objectId, sound) {
            return [objectId, sound];
        },
        log(objectId, sound) {
            const o = {};
            o._id = sound._id;
            o.duration = sound.duration;
            o.ext = sound.ext;
            o.id = sound.id;
            o.filename = sound.filename;
            o.fileurl = sound.fileurl;
            o.name = sound.name;
            return [
                ['objectId', objectId],
                ['sound', o],
            ];
        },
        dom: ['.btn_confirm_modal'],
        restrict(data, domQuery, callback) {
            this.hashId = data.content[2][1].id;

            const tooltip = new Entry.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: '.btn_confirm_modal',
                    },
                ],
                {
                    callBack: callback,
                    dimmed: true,
                    restrict: true,
                    render: false,
                }
            );

            const event = Entry.getMainWS().widgetUpdateEvent;

            if (!data.skip) {
                Entry.dispatchEvent(
                    'openSoundManager',
                    data.content[2][1]._id,
                    event.notify.bind(event)
                );
            }
            return tooltip;
        },
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectRemoveSound',
    };

    c[COMMAND_TYPES.objectRemoveSound] = {
        do(objectId, sound) {
            return Entry.container.getObject(objectId).removeSound(sound.id);
        },
        state(objectId, sound) {
            return [objectId, sound];
        },
        log(objectId, sound) {
            return [
                ['objectId', objectId],
                ['soundId', sound._id],
            ];
        },
        dom: ['.btn_confirm_modal'],
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectAddSound',
    };

    c[COMMAND_TYPES.objectAddExpansionBlocks] = {
        do(blockNames) {
            blockNames.forEach((blockName) => {
                if (
                    typeof Entry.EXPANSION_BLOCK !== 'undefined' &&
                    typeof Entry.EXPANSION_BLOCK[blockName] !== 'undefined'
                ) {
                    Entry.EXPANSION_BLOCK[blockName].init();
                    if (typeof Entry.expansionBlocks == 'undefined') {
                        Entry.expansionBlocks = [];
                    }
                    Entry.expansionBlocks = _.union(Entry.expansionBlocks, [blockName]);
                }
                Entry.playground.blockMenu.unbanClass(blockName);
            });
            // Entry.dispatchEvent('dismissModal');
        },
        state(blockNames) {
            return [blockNames];
        },
        log(blockNames) {
            return [['blockName', blockNames]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: Entry.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectRemoveExpansionBlocks',
    };

    c[COMMAND_TYPES.objectRemoveExpansionBlocks] = {
        do(blockNames) {
            // 사용된 블록 전체에서 검색가능해질때 사용가능.
            blockNames.forEach((blockName) => {
                Entry.playground.blockMenu.banClass(blockName);
            });
            Entry.expansionBlocks = _.pullAll(Entry.expansionBlocks, blockNames);
        },
        state(blockNames) {
            return [blockNames];
        },
        log(blockNames) {
            return [['blockName', blockNames]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: Entry.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectAddExpansionBlocks',
    };
    c[COMMAND_TYPES.objectAddAIUtilizeBlocks] = {
        do(blockNames) {
            blockNames.forEach((blockName) => {
                if (
                    typeof Entry.AI_UTILIZE_BLOCK !== 'undefined' &&
                    typeof Entry.AI_UTILIZE_BLOCK[blockName] !== 'undefined'
                ) {
                    Entry.AI_UTILIZE_BLOCK[blockName].init();
                    if (typeof Entry.aiUtilizeBlocks == 'undefined') {
                        Entry.aiUtilizeBlocks = [];
                    }
                    Entry.aiUtilizeBlocks = _.union(Entry.aiUtilizeBlocks, [blockName]);
                }
                Entry.playground.blockMenu.unbanClass(blockName);
            });
            // Entry.dispatchEvent('dismissModal');
        },
        state(blockName) {
            return [blockName];
        },
        log(blockName) {
            return [['blockName', blockName]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: Entry.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectRemoveAIUtilizeBlocks',
    };

    c[COMMAND_TYPES.objectRemoveAIUtilizeBlocks] = {
        do(blockNames) {
            // 사용된 블록 전체에서 검색가능해질때 사용가능.
            // Entry.expansionBlocks = _.pull(Entry.expansionBlocks, blockName);
            // 사용된 블록 전체에서 검색가능해질때 사용가능.
            blockNames.forEach((blockName) => {
                if (blockName === 'video') {
                    VideoUtils.destroy();
                }
                Entry.playground.blockMenu.banClass(blockName);
            });
            Entry.aiUtilizeBlocks = _.pullAll(Entry.aiUtilizeBlocks, blockNames);
        },
        state(blockName) {
            return [blockName];
        },
        log(blockName) {
            return [['blockName', blockName]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: Entry.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectAddAIUtilizeBlocks',
    };

    c[COMMAND_TYPES.objectAddHardwareLiteBlocks] = {
        do(module) {
            Entry.hwLite.getConnectFailedMenu();
            if (typeof Entry.hardwareLiteBlocks == 'undefined') {
                Entry.hardwareLiteBlocks = [];
            }
            Entry.hardwareLiteBlocks = _.union(Entry.hardwareLiteBlocks, [module.id]);
            Entry.hwLite.setExternalModule(module);
        },
        state(module) {
            return [module];
        },
        log(module) {
            return [['module', module]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: Entry.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectRemoveHardwareLiteBlocks',
    };

    c[COMMAND_TYPES.objectRemoveHardwareLiteBlocks] = {
        do(module) {
            Entry.hardwareLiteBlocks = [];
            Entry.hwLite.disconnect();
            Entry.hwLite.removeWebConnector();
            Entry.hwLite.removeFlasher();
        },
        state(module) {
            return [module];
        },
        log(module) {
            return [['module', module]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: Entry.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectAddHardwareLiteBlocks',
    };

    c[COMMAND_TYPES.objectNameEdit] = {
        do(objectId, newName) {
            const object = Entry.container.getObject(objectId);
            object.setName(newName);
            object.setInputBlurred('nameInput');
            Entry.playground.updateObjectTitle(object);
            Entry.playground.reloadPlayground();
        },
        state(objectId, newName) {
            const object = Entry.container.getObject(objectId);
            return [objectId, object.getName()];
        },
        log(objectId, newName) {
            const object = Entry.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newName', newName],
            ];
        },
        dom: ['container', 'objectId', '&0', 'nameInput'],
        restrict: _inputRestrictor,
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectNameEdit',
    };

    c[COMMAND_TYPES.objectReorder] = {
        do(newIndex, oldIndex) {
            Entry.container.moveElement(newIndex, oldIndex);
        },
        state(newIndex, oldIndex) {
            return [oldIndex, newIndex];
        },
        log(newIndex, oldIndex) {
            return [
                ['newIndex', newIndex],
                ['oldIndex', oldIndex],
            ];
        },
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectReorder',
    };

    c[COMMAND_TYPES.objectUpdatePosX] = {
        do(objectId, newX = 0) {
            const object = Entry.container.getObject(objectId);
            object.entity.setX(Number(newX));
            object.updateCoordinateView();
            object.setInputBlurred('xInput');
            Entry.stage.updateObject();
        },
        state(objectId, newX) {
            const { entity } = Entry.container.getObject(objectId);
            return [objectId, entity.getX()];
        },
        log(objectId, newX) {
            const { entity } = Entry.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newX', newX],
            ];
        },
        dom: ['container', 'objectId', '&0', 'xInput'],
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        restrict: _inputRestrictor,
        undo: 'objectUpdatePosX',
    };

    c[COMMAND_TYPES.objectUpdatePosY] = {
        do(objectId, newY = 0) {
            const object = Entry.container.getObject(objectId);
            object.entity.setY(Number(newY));
            object.updateCoordinateView();
            object.setInputBlurred('yInput');
            Entry.stage.updateObject();
        },
        state(objectId, newY) {
            const { entity } = Entry.container.getObject(objectId);
            return [objectId, entity.getY()];
        },
        log(objectId, newY) {
            const { entity } = Entry.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newY', newY],
            ];
        },
        dom: ['container', 'objectId', '&0', 'yInput'],
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        restrict: _inputRestrictor,
        undo: 'objectUpdatePosY',
    };

    c[COMMAND_TYPES.objectUpdateSize] = {
        do(objectId, newSize = 0) {
            const object = Entry.container.getObject(objectId);
            object.entity.setSize(Number(newSize));
            object.updateCoordinateView();
            object.setInputBlurred('sizeInput');
            Entry.stage.updateObject();
        },
        state(objectId, newSize) {
            const { entity } = Entry.container.getObject(objectId);
            return [objectId, entity.getSize()];
        },
        log(objectId, newSize) {
            const { entity } = Entry.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newSize', newSize],
            ];
        },
        dom: ['container', 'objectId', '&0', 'sizeInput'],
        restrict: _inputRestrictor,
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectUpdateSize',
    };

    c[COMMAND_TYPES.objectUpdateRotationValue] = {
        do(objectId, newValue = 0) {
            const object = Entry.container.getObject(objectId);
            object.entity.setRotation(Number(newValue));
            object.updateCoordinateView();
            object.setInputBlurred('rotationInput');
            Entry.stage.updateObject();
        },
        state(objectId, newValue) {
            const { entity } = Entry.container.getObject(objectId);
            return [objectId, entity.getRotation()];
        },
        log(objectId, newValue) {
            const { entity } = Entry.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newRotationValue', newValue],
            ];
        },
        dom: ['container', 'objectId', '&0', 'rotationInput'],
        restrict: _inputRestrictor,
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectUpdateRotationValue',
    };

    c[COMMAND_TYPES.objectUpdateDirectionValue] = {
        do(objectId, newValue = 0) {
            const object = Entry.container.getObject(objectId);
            object.entity.setDirection(Number(newValue));
            object.updateCoordinateView();
            object.setInputBlurred('directionInput');
            Entry.stage.updateObject();
        },
        state(objectId, newValue) {
            const { entity } = Entry.container.getObject(objectId);
            return [objectId, entity.getDirection()];
        },
        log(objectId, newValue) {
            const { entity } = Entry.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newDirectionValue', newValue],
            ];
        },
        dom: ['container', 'objectId', '&0', 'directionInput'],
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        restrict: _inputRestrictor,
        undo: 'objectUpdateDirectionValue',
    };

    c[COMMAND_TYPES.objectUpdateRotateMethod] = {
        do(objectId, newMethod, rotation) {
            const object = Entry.container.getObject(objectId);
            object.initRotateValue(newMethod);
            object.setRotateMethod(newMethod);
            if (rotation !== undefined) {
                object.entity.setRotation(rotation);
            }
            Entry.stage.updateObject();
        },
        state(objectId, newMethod) {
            const { entity, rotateMethod } = Entry.container.getObject(objectId);
            return [objectId, rotateMethod, entity.getRotation()];
        },
        log(objectId, newValue) {
            const { entity } = Entry.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newDirectionValue', newValue],
            ];
        },
        dom: ['container', 'objectId', '&0', 'rotationMethod', '&1'],
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectUpdateRotateMethod',
    };

    c[COMMAND_TYPES.entitySetModel] = {
        do(objectId, newModel, oldModel) {
            const { entity } = Entry.container.getObject(objectId);
            entity.setModel(newModel);
        },
        state(objectId, newModel, oldModel) {
            return [objectId, oldModel, newModel];
        },
        log(objectId, newModel, oldModel) {
            return [
                ['objectId', objectId],
                ['newModel', newModel],
                ['oldModel', oldModel],
            ];
        },
        recordable: Entry.STATIC.RECORDABLE.SUPPORT,
        undo: 'entitySetModel',
    };

    function _inputRestrictor({ tooltip, content }, domQuery, callback) {
        const { title: tooltipTitle, content: tooltipContent } = tooltip;
        _activateEdit(content[1][1], domQuery, callback);
        return createTooltip(tooltipTitle, tooltipContent, domQuery, callback);
    }

    function _activateEdit(objectId, domQuery, callback) {
        const object = Entry.container.getObject(objectId);

        if (!object.isEditing) {
            object.editObjectValues(true);
        }

        if (!_.isEmpty(domQuery)) {
            domQuery = Entry.getDom(domQuery);
            if (domQuery && !Entry.Utils.isDomActive(domQuery)) {
                domQuery.focus();
                callback();
            }
        }
    }
})(Entry.Command);
