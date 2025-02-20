/**
 * @fileoverview Container handle all object in entry.
 */

'use strict';

import { Draggable } from '@entrylabs/tool';
import { GEHelper } from '../graphicEngine/GEHelper';
import DataTable from './DataTable';
import { getInputList } from '@entrylabs/legacy-video';
/**
 * Class for a container.
 * This have view for objects.
 * @constructor
 */
Entry.Container = class Container {
    constructor() {
        /**
         * Array for entry objects
         * @type {Array.<Entry.EntryObject>}
         */
        this.objects_ = [];

        /**
         * Dictionary for caching images
         * @type {Dictionary.<createjs.Image}
         */
        this.cachedPicture = {};

        this.selectedObject = null;

        /**
         * variable for canvas input
         * @type {String}
         */
        this.inputValue = {};
        this.sttValue = {};
        /**
         * object model store copied object by context menu
         * @type {object model}
         */
        this.copiedObject = null;

        this.isObjectDragging = false;
        /**
         * Array for storing current scene objects
         * @type {Array.<object model>}
         */
        this.currentObjects_ = null;
        this._extensionObjects = [];
        Entry.addEventListener('workspaceChangeMode', () => {
            const ws = Entry.getMainWS();
            if (ws && ws.getMode() === Entry.Workspace.MODE_VIMBOARD) {
                this.objects_.forEach(({ script }) => {
                    script && script.destroyView();
                });
            }
        });

        Entry.addEventListener('run', this.disableSort.bind(this));
        Entry.addEventListener('stop', this.enableSort.bind(this));
    }

    /**
     * Control bar view generator.
     * @param {!Element} containerView containerView from Entry.
     */
    generateView(containerView) {
        this._view = containerView;
        this._view.addClass('entryContainer');
        this._view.addClass('entryContainerWorkspace');
        this._view.setAttribute('id', 'entryContainerWorkspaceId');

        const addButton = Entry.createElement('div')
            .addClass('entryAddObjectWorkspace')
            .bindOnClick(() => {
                Entry.dispatchEvent('openSpriteManager');
            });
        addButton.textContent = Lang.Workspace.add_object;

        const ulWrapper = Entry.createElement('div');
        this._view.appendChild(ulWrapper);

        // const scroll = new Simplebar(ulWrapper, { autoHide: false });
        const scrollWrapper = ulWrapper;
        let baseClass = 'entryContainerListWorkspaceWrapper';
        if (Entry.isForLecture) {
            baseClass += ' lecture';
        }
        scrollWrapper.addClass(baseClass);
        Entry.Utils.disableContextmenu(scrollWrapper);

        const longPressEvent = (e) => {
            let longPressTimer = null;
            const doc = $(document);

            longPressTimer = setTimeout(() => {
                if (longPressTimer) {
                    longPressTimer = null;
                    this._rightClick(e);
                }
            }, 1000);

            const event = Entry.Utils.convertMouseEvent(e);
            const mouseDownCoordinate = { x: event.clientX, y: event.clientY };

            // 움직임 포착된 경우 타이머 종료
            doc.bind('mousemove.container touchmove.container', (e) => {
                const event = Entry.Utils.convertMouseEvent(e);
                const moveThreshold = 5;
                if (!mouseDownCoordinate) {
                    return;
                }
                const diff = Math.sqrt(
                    Math.pow(event.pageX - mouseDownCoordinate.x, 2) +
                        Math.pow(event.pageY - mouseDownCoordinate.y, 2)
                );

                if (diff > moveThreshold && longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });

            // 터치가 끝난 경우 타이머 종료
            doc.bind('mouseup.container touchend.container', () => {
                doc.unbind('.container');
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
        };
        /*
         * 오른쪽 버튼 클릭 시 컨텍스트메뉴 발생
         */
        scrollWrapper.addEventListener('mousedown', (e) => {
            if (Entry.Utils.isRightButton(e)) {
                e.stopPropagation();
                this._rightClick(e);
            }

            if (Entry.isMobile()) {
                e.stopPropagation();
                longPressEvent(e);
            }
        });

        /*
         * 터치 디바이스의 롱클릭 대응. touch 1초간 유지시 컨텍스트메뉴 발생.
         * 현재위치에서 일정 범위 이상 벗어난 경우취소
         */
        scrollWrapper.addEventListener('touchstart', (e) => {
            if (e.eventFromEntryObject) {
                return;
            }

            longPressEvent(e);
        });

        const extensionListView = Entry.createElement('ul');
        scrollWrapper.appendChild(extensionListView);
        this._extensionListView = Entry.Dom(extensionListView, {
            class: 'entryContainerExtensions',
        });

        const listView = Entry.createElement('ul').addClass('entryContainerListWorkspace');
        scrollWrapper.appendChild(listView);
        this.listView_ = listView;

        this.enableSort();
    }

    enableSort() {
        if (this.sortableListViewWidget) {
            this.sortableListViewWidget.setData({
                disabled: false,
            });
        } else {
            const draggableOption = {};
            if (Entry.isMobile()) {
                draggableOption.lockAxis = 'y';
                draggableOption.distance = 50;
            }
            this.sortableListViewWidget = new Draggable({
                data: {
                    ...draggableOption,
                    canSortable: true,
                    sortableTarget: ['entryObjectThumbnailWorkspace'],
                    items: this._getSortableObjectList(),
                    itemShadowStyle: {
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        backgroundColor: '#8aa3b2',
                        border: 'solid 1px #728997',
                    },
                    onDragActionChange: (isDragging, key) => {
                        Entry.ContextMenu.hide();
                        if (isDragging) {
                            this.selectedObject.setObjectFold(isDragging, true);
                        } else {
                            this.selectedObject.resetObjectFold();
                        }
                        Entry.playground.setBackpackPointEvent(isDragging);
                        this.dragObjectKey = key;
                        this.isObjectDragging = isDragging;
                    },
                    onChangeList: (newIndex, oldIndex) => {
                        if (newIndex !== oldIndex) {
                            Entry.do('objectReorder', newIndex, oldIndex);
                        }
                    },
                },
                container: this.listView_,
            });
        }
    }

    updateSortableObjectList(objects) {
        this.sortableListViewWidget.setData({
            items: this._getSortableObjectList(objects),
        });
    }

    _getSortableObjectList(objects) {
        const targetObjects = objects || this.currentObjects_ || [];

        return targetObjects.map((value) => {
            const { id, view_, thumbUrl } = value;
            return {
                key: id,
                item: view_,
                image: thumbUrl,
            };
        });
    }

    /**
     * disable sort.
     */
    disableSort() {
        const view = this.listView_;

        if (!view) {
            return;
        }

        this.sortableListViewWidget.setData({ disabled: true });
    }

    /**
     * update list view to sort item.
     */
    updateListView() {
        const view = this.listView_;

        if (!view) {
            return;
        }

        let objs = this.getCurrentObjects().slice();

        const ret = objs.filter(({ index }) => index !== undefined);

        if (ret.length === objs.length) {
            objs = objs.sort((a, b) => a.index - b.index);
        }

        objs.forEach((obj) => {
            !obj.view_ && obj.generateView();
        });

        Entry.stage.sortZorder();
        this.updateSortableObjectList(objs);
        return true;
    }

    setObjects(objectModels) {
        objectModels.forEach((model) => {
            if (model) {
                const object = new Entry.EntryObject(model);
                this.objects_.push(object);
            }
        });
        this.updateObjectsOrder();
        this.updateListView();
        Entry.variableContainer.updateViews();
        const type = Entry.type;
        if (type === 'workspace' || type === 'phone' || type === 'playground') {
            const target = this.getCurrentObjects()[0];
            target && this.selectObject(target.id);
        }
    }

    /**
     * get Pictures element
     * @param {!String} pictureId
     */
    getPictureElement(pictureId, objectId) {
        const object = this.getObject(objectId);
        const picture = object.getPicture(pictureId);
        if (picture) {
            return picture.view;
        } else {
            throw new Error('No picture found');
        }
    }
    /**
     * Set Pictures
     * @param {!Object picture} picture
     */
    setPicture(picture) {
        const pictures = this.getObject(picture.objectId).pictures;
        const index = _.findIndex(pictures, ({ id }) => id === picture.id);
        if (!~index) {
            throw new Error('No picture found');
        }
        pictures[index] = Object.assign(
            _.pick(picture, [
                'dimension',
                'id',
                'filename',
                'fileurl',
                'thumbUrl',
                'name',
                'imageType',
            ]),
            { view: pictures[index].view }
        );
    }

    /**
     * Set Pictures
     * @param {!String} pictureId
     */
    selectPicture(pictureId, objectId) {
        const object = this.getObject(objectId);
        const picture_ = object.getPicture(pictureId);
        if (picture_) {
            object.selectedPicture = picture_;
            object.entity.setImage(picture_);
            object.updateThumbnailView();
            this.sortableListViewWidget.setData({
                items: this._getSortableObjectList(),
            });
            return object.id;
        }
        throw new Error('No picture found');
    }

    selectSound(soundId, objectId) {
        const object = this.getObject(objectId);
        const sound = object.getSound(soundId);
        if (sound) {
            object.selectedSound = sound;
            return object.id;
        }
        throw new Error('No sound found');
    }

    /**
     * Add object
     * @param {!object model} objectModel
     * @param {?number} index exist when user add object
     * @return {Entry.EntryObject}
     */
    addObject(objectModel, ...rest) {
        let target;
        if ('name' in objectModel.sprite) {
            target = objectModel.sprite;
        } else {
            target = objectModel;
            if (!target.name) {
                target.name = 'untitled';
            }
        }
        target.name = Entry.getOrderedName(target.name, this.objects_);
        objectModel.id = objectModel.id || Entry.generateHash();
        return Entry.do('addObject', objectModel, ...rest);
    }

    addObjectFunc(objectModel, index, isNotRender) {
        delete objectModel.scene;
        const object = new Entry.EntryObject(objectModel);
        object.scene = Entry.scene.selectedScene;

        let isBackground = objectModel.sprite.category || {};
        isBackground = isBackground.main === 'background';

        if (typeof index === 'number') {
            if (isBackground) {
                object.setLock(true);
                this.objects_.push(object);
            } else {
                this.objects_.splice(index, 0, object);
            }
        } else if (isBackground) {
            this.objects_.push(object);
        } else {
            this.objects_.unshift(object);
        }
        if (!isNotRender) {
            object.generateView();
            this.setCurrentObjects();
            this.selectObject(object.id);
            this.updateObjectsOrder();
            this.updateListView();
            Entry.variableContainer.updateViews();
            Entry.variableContainer.updateList();
        }
    }

    renderObject(object) {
        object.generateView();
        this.setCurrentObjects();
        this.selectObject(object.id);
        Entry.variableContainer.updateViews();
    }

    addExtension(obj) {
        this._extensionObjects.push(obj);
        if (this._extensionListView) {
            this._extensionListView.append(obj.renderView());
        }
        return obj;
    }

    removeExtension(obj) {
        if (!obj) {
            return;
        }

        const extensions = this._extensionObjects;
        const index = extensions.indexOf(obj);
        if (~index) {
            extensions.splice(index, 1);
        }

        obj.destroy && obj.destroy();
    }

    /**
     * Add Clone object
     * @param {!Entry.EntryObject} object
     */
    addCloneObject(object, scene, isNotRender) {
        const json = object.toJSON(true);

        json.script = change('sounds', object, json);
        json.script = change('pictures', object, json);

        Entry.variableContainer.addCloneLocalVariables({
            objectId: object.id,
            newObjectId: json.id,
            json,
        });
        json.scene = scene || Entry.scene.selectedScene;
        this.addObject(json, null, isNotRender);

        return this.getObject(json.id);

        function change(keyName, object, jsonData) {
            const target = jsonData.sprite[keyName];
            let script = jsonData.script;
            (object[keyName] || []).forEach((value, index) => {
                script = script.replace(new RegExp(value.id, 'g'), target[index].id);
            });
            return script;
        }
    }

    removeObject(id, isPass) {
        const objects = this.objects_;

        const object = this.getObject(id);
        const index = objects.indexOf(object);

        object.destroy();
        objects.splice(index, 1);
        Entry.variableContainer.removeLocalVariables(object.id);
        Entry.engine.hideProjectTimer();

        if (isPass === true) {
            return;
        }

        this.setCurrentObjects();
        Entry.stage.sortZorder();
        const [first] = this.getCurrentObjects();
        if (first) {
            this.selectObject(first.id);
        } else {
            Entry.stage.selectObject(null);
            Entry.playground.flushPlayground();
        }

        this.updateListView();
        Entry.playground.reloadPlayground();
        GEHelper.resManager.imageRemoved('container::removeObject');
    }

    /**
     * Select object
     * @param {string} objectId
     */
    selectObject(objectId, changeScene) {
        if (!objectId) {
            return;
        }
        const object = this.getObject(objectId);
        const workspace = Entry.getMainWS();
        const isSelected = object && object.isSelected();
        if (changeScene && object) {
            Entry.scene.selectScene(object.scene);
        }

        const className = 'selectedObject';
        this.mapObjectOnScene((o) => {
            !o.view_ && _.result(o, 'generateView');
            const selected = o === object;
            const view = o.view_;
            if (view) {
                if (selected) {
                    view.addClass(className);
                } else {
                    view.removeClass(className);
                    o.setObjectFold(false);
                }
            }

            o.isSelected_ = selected;
        });

        if (object) {
            if (workspace && workspace.vimBoard && Entry.isTextMode) {
                const sObject = workspace.vimBoard._currentObject;
                const parser = workspace.vimBoard._parser;
                if (sObject && !this.getObject(sObject.id)) {
                } else if (parser && parser._onError) {
                    if (sObject && object.id != sObject.id) {
                        if (!Entry.scene.isSceneCloning) {
                            try {
                                workspace._syncTextCode();
                            } catch (e) {}
                            if (parser && !parser._onError) {
                                this.selectObject(object.id, true);
                                return;
                            } else {
                                this.selectObject(sObject.id, true);
                                return;
                            }
                        } else {
                            this.selectObject(sObject.id);
                            return;
                        }
                    }
                } else {
                    if (sObject && object.id != sObject.id) {
                        if (!Entry.scene.isSceneCloning) {
                            try {
                                workspace._syncTextCode();
                            } catch (e) {}
                            if (parser && parser._onError) {
                                this.selectObject(sObject.id, true);
                                return;
                            }
                        } else {
                            this.selectObject(sObject.id);
                            return;
                        }
                    }
                }
            }
        } else {
            workspace && workspace.vimBoard && workspace.vimBoard.clearText();
        }

        if (Entry.playground) {
            object ? Entry.playground.injectObject(object) : Entry.playground.injectEmptyObject();
        }
        if (Entry.type !== 'minimize' && Entry.engine.isState('stop')) {
            Entry.stage.selectObject(object);
        }
        this.selectedObject = object;
        !isSelected && object && object.updateCoordinateView();
    }

    /**
     * Get all objects
     */
    getAllObjects() {
        return this.objects_;
    }

    /**
     * Object Getter
     * @param {string} objectId
     * @return {Entry.EntryObject}
     */
    getObject(objectId) {
        const playground = Entry.playground;
        if (!objectId && playground && playground.object) {
            objectId = playground.object.id;
        } else if (objectId instanceof Entry.EntryObject) {
            return objectId;
        }

        return _.find(this.objects_, { id: objectId });
    }

    /**
     * Entity Getter
     * @param {string} objectId
     * @return {Entry.EntityObject}
     */
    getEntity(objectId) {
        const object = this.getObject(objectId);
        if (!object) {
            return Entry.toast.alert(
                Lang.Msgs.runtime_error,
                Lang.Workspace.object_not_found,
                true
            );
        }
        return object.entity;
    }

    /**
     * get variable on canvas
     * @return {Entry.Variable}
     */
    getVariable(variableId) {
        for (let i = 0; i < this.variables_.length; i++) {
            const variable = this.variables_[i];
            if (variable.getId() == variableId) {
                return variable;
            }
            if (variable.getName() == variableId) {
                return variable;
            }
        }
    }

    /**
     * Move object in objects_
     * this method is for sortable
     * @param {number!} start
     * @param {number!} end
     * @param {boolean?} isCallFromState
     * @return {Entry.State}
     */
    moveElement(end, start) {
        const objs = this.getCurrentObjects();
        const startIndex = this.getAllObjects().indexOf(objs[start]);
        const endIndex = this.getAllObjects().indexOf(objs[end]);
        this.objects_.splice(endIndex, 0, this.objects_.splice(startIndex, 1)[0]);
        this.setCurrentObjects();
        this.updateListView();
        Entry.requestUpdate = true;
    }

    /**
     * generate list for dropdown dynamic
     * obj param for renderview.changeCode
     * @param {string} menuName
     * @param {string} obj
     */
    async getDropdownList(menuName, obj) {
        let result = [];
        switch (menuName) {
            case 'sprites':
                result = this.getCurrentObjects().map(({ name, id }) => [name, id]);
                break;
            case 'allSprites':
                result = this.getAllObjects().map(({ name, id, scene = {} }) => {
                    const { name: sceneName } = scene;
                    return [`${sceneName} - ${name}`, id];
                });
                break;
            case 'spritesWithMouse':
                result = this.getCurrentObjects().map(({ name, id }) => [name, id]);
                result.push([Lang.Blocks.mouse_pointer, 'mouse']);
                break;
            case 'spritesWithSelf':
                result = this.getCurrentObjects().map(({ name, id }) => [name, id]);
                result.push([Lang.Blocks.self, 'self']);
                break;
            case 'textBoxWithSelf': {
                result = [
                    ...this.getCurrentObjects().reduce((acc, { objectType, name, id }) => {
                        if (objectType === 'textBox') {
                            acc.push([name, id]);
                        }
                        return acc;
                    }, result),
                    [Lang.Blocks.self, 'self'],
                ];
                break;
            }
            case 'collision':
                result = [
                    [Lang.Blocks.mouse_pointer, 'mouse'],
                    ...this.getCurrentObjects().map(({ name, id }) => [name, id]),
                    [Lang.Blocks.wall, 'wall'],
                    [Lang.Blocks.wall_up, 'wall_up'],
                    [Lang.Blocks.wall_down, 'wall_down'],
                    [Lang.Blocks.wall_right, 'wall_right'],
                    [Lang.Blocks.wall_left, 'wall_left'],
                ];
                break;
            case 'pictures': {
                const object = Entry.playground.object || obj;
                if (!object) {
                    break;
                }
                result = (object.pictures || []).map(({ name, id }) => [name, id]);
                break;
            }
            case 'messages':
                result = Entry.variableContainer.messages_.map(({ name, id }) => [name, id]);
                break;
            case 'variables': {
                const object = Entry.playground.object || obj;
                if (!object) {
                    break;
                }
                Entry.variableContainer.variables_.forEach((variable) => {
                    if (
                        variable.object_ &&
                        object &&
                        (variable.object_ != object.id || Entry.Func.isEdit)
                    ) {
                        return;
                    }
                    result.push([variable.getName(), variable.getId()]);
                });
                if (!result || result.length === 0) {
                    // result.push([Lang.Blocks.VARIABLE_variable, 'null']);
                    result = [];
                }
                break;
            }
            case 'lists': {
                const object = Entry.playground.object || obj;
                if (!object) {
                    break;
                }
                Entry.variableContainer.lists_.forEach((list) => {
                    if (
                        list.object_ &&
                        object &&
                        (list.object_ != object.id || Entry.Func.isEdit)
                    ) {
                        return;
                    }
                    result.push([list.getName(), list.getId()]);
                });

                if (!result || result.length === 0) {
                    // result.push([Lang.Blocks.VARIABLE_list, 'null']);
                    result = [];
                }
                break;
            }
            case 'tables': {
                const { tables } = DataTable;
                if (tables) {
                    result = tables.map((table) => [table.name, table.id]);
                }
                break;
            }
            case 'scenes':
                result = Entry.scene.getScenes().map(({ name, id }) => [name, id]);
                break;
            case 'sounds': {
                const object = Entry.playground.object || obj;
                if (!object) {
                    break;
                }
                result = (object.sounds || []).map(({ name, id }) => [name, id]);
                break;
            }
            case 'clone':
                result = [
                    [Lang.Blocks.oneself, 'self'],
                    ...this.getCurrentObjects().map(({ name, id }) => [name, id]),
                ];
                break;
            case 'objectSequence':
                for (let i = 0; i < this.getCurrentObjects().length; i++) {
                    result.push([(i + 1).toString(), i.toString()]);
                }
                break;
            case 'fonts':
                result = EntryStatic.fonts
                    .filter((x) => x.visible)
                    .map((font) => [font.name, font.family]);
                break;
            case 'connectedCameras': {
                const inputList = await getInputList();
                result = [].concat(
                    inputList
                        .filter((input) => input.kind === 'videoinput')
                        .map((item, index) => [
                            item.label || `Unspecified Device-${index + 1}`,
                            index,
                        ])
                );
                break;
            }
            case 'blockCount':
                result = [
                    [Lang.Blocks.this_project, 'all'],
                    [Lang.Blocks.this_object, 'self'],
                    ...this.getCurrentObjects().map(({ name, id }) => [name, `object-${id}`]),
                    ...Entry.scene.getScenes().map(({ name, id }) => [name, `scene-${id}`]),
                ];
        }
        if (!result.length) {
            result = [[Lang.Blocks.no_target, 'null']];
        }
        return result;
    }

    /**
     * Initialize entities to state before run
     */
    clearRunningState() {
        this.mapObject((object) => {
            object.clearExecutor();
        });
    }

    clearRunningStateOnScene() {
        this.mapObjectOnScene((object) => {
            if (object instanceof Entry.TargetChecker) {
                return;
            }
            object.clearExecutor();
        });
    }

    /**
     * Apply map function to objects. But this not replace object with returned one.
     * So giving map function don't have to return object.
     * And this support another arguments.
     * @param {!function} mapFunction
     * @param {} param
     */
    mapObject(mapFunction, param) {
        return [...this._extensionObjects, ...this.objects_].map((object) =>
            mapFunction(object, param)
        );
    }

    mapObjectOnScene(mapFunction, param) {
        return [...this._extensionObjects, ...this.getCurrentObjects()].map((object) =>
            mapFunction(object, param)
        );
    }

    /**
     * Apply map function to objects. But this not replace object with returned one.
     * So giving map function don't have to return object.
     * And this support another arguments.
     * @param {!function} mapFunction
     * @param {} param
     */
    mapEntity(mapFunction, param) {
        return this.objects_.map(({ entity }) => mapFunction(entity, param));
    }

    mapEntityOnScene(mapFunction, param) {
        return this.getCurrentObjects().map(({ entity }) => mapFunction(entity, param));
    }

    /**
     * Apply map function to objects. But this not replace object with returned one.
     * So giving map function don't have to return object.
     * And this support another arguments.
     * This also apply to cloned entities.
     * @param {!function} mapFunction
     * @param {} param
     */
    mapEntityIncludeClone(mapFunction, param) {
        const objects = this.objects_;
        const length = objects.length;
        const output = [];
        for (let i = 0; i < length; i++) {
            const object = objects[i];
            const lenx = object.clonedEntities.length;
            output.push(mapFunction(object.entity, param));
            for (let j = 0; j < lenx; j++) {
                const entity = object.clonedEntities[j];
                if (entity && !entity.isStamp) {
                    output.push(mapFunction(entity, param));
                }
            }
        }
        return output;
    }

    mapEntityIncludeCloneOnScene(mapFunction, param) {
        const objects = this.getCurrentObjects();
        const length = objects.length;
        const output = [];
        for (let i = 0; i < this._extensionObjects.length; i++) {
            const object = this._extensionObjects[i];
            output.push(mapFunction(object.entity, param));
        }
        for (let i = 0; i < length; i++) {
            const object = objects[i];
            output.push(mapFunction(object.entity, param));

            object.getClonedEntities().forEach((entity) => {
                output.push(mapFunction(entity, param));
            });
        }
        return output;
    }

    /**
     * @deprecated 새로운 리소스 관리자 생겨서 이제 사용안함
     * Get cached picture
     * @param {!string} pictureId
     * @return {?createjs.Image}
     */
    getCachedPicture(pictureId) {
        Entry.assert(typeof pictureId === 'string', 'pictureId must be string');
        return this.cachedPicture[pictureId];
    }

    /**
     * @deprecated 새로운 리소스 관리자 생겨서 이제 사용안함
     * cache picture
     * @param {!picture object} pictureModel
     */
    cachePicture(pictureId, image) {
        this.cachedPicture[pictureId] = image;
    }

    /**
     * @deprecated 새로운 리소스 관리자 생겨서 이제 사용안함
     * @param entity
     * @param pictures
     * @param isClone
     */
    unCachePictures(entity, pictures, isClone) {
        if (!entity || !pictures) {
            return;
        }
        let entityId;

        if (pictures.constructor !== Array) {
            pictures = [pictures];
        }

        if (entity.constructor === Entry.EntityObject) {
            entityId = entity.id;
        } else {
            entityId = entity;
        }

        pictures.forEach(({ id }) => {
            delete this.cachedPicture[id + (isClone ? '' : entityId)];
        });
    }

    /**
     * convert this object's data to JSON.
     * @return {JSON}
     */
    toJSON() {
        return this.objects_.map((object) => object.toJSON());
    }

    /**
     * take snapshot of current objects sequence
     */
    takeSequenceSnapshot() {
        const length = this.objects_.length;
        const objects = this.objects_;
        for (let i = 0; i < length; i++) {
            objects[i].index = i;
        }
    }

    /**
     * load snapshot of original objects sequence
     */
    loadSequenceSnapshot() {
        const length = this.objects_.length;
        const arr = new Array(length);
        for (let i = 0; i < length; i++) {
            const object = this.objects_[i];
            const _index = object.index !== undefined ? object.index : i;
            arr[_index] = object;
            delete object.index;
        }
        this.objects_ = arr;
        this.setCurrentObjects();
        Entry.stage.sortZorder();
        this.updateListView();
    }

    /**
     * return canvas inputValue
     * @return {String}
     */
    getInputValue() {
        return this.inputValue.getValue();
    }

    getSttValue() {
        return this.sttValue.getValue();
    }

    /**
     * set canvas inputValue
     * @param {String} inputValue from canvas
     */
    setInputValue(inputValue) {
        if (this.inputValue.complete) {
            return;
        }
        if (!inputValue) {
            this.inputValue.setValue(0);
        } else {
            this.inputValue.setValue(inputValue);
        }
        Entry.stage.hideInputField();
        Entry.dispatchEvent('answerSubmitted');
        if (Entry.console) {
            Entry.console.stopInput(inputValue);
        }
        this.inputValue.complete = true;
    }

    setSttValue(inputValue) {
        if (this.sttValue.complete) {
            return;
        }
        if (!inputValue) {
            this.sttValue.setValue('');
        } else {
            this.sttValue.setValue(inputValue);
        }
        Entry.dispatchEvent('sttSubmitted');

        this.sttValue.complete = true;
    }

    enableSttValue() {
        this.sttValue.complete = false;
    }

    resetSceneDuringRun() {
        if (!Entry.engine.isState('run')) {
            return;
        }

        this.mapEntityOnScene((entity) => {
            entity.reset();
        });
        this.clearRunningStateOnScene();
        Entry.stage.hideInputField();
    }

    setCopiedObject(object) {
        this.copiedObject = object;
    }

    updateObjectsOrder() {
        this.objects_ = Entry.scene
            .getScenes()
            .reduce((objs, scene) => [...objs, ...this.getSceneObjects(scene)], []);
    }

    /**
     *  get objects list belonged to specific scene
     *  @param {scene model} scene
     *  @return {Array<object model>}
     */
    getSceneObjects(scene) {
        scene = scene || Entry.scene.selectedScene;
        if (!scene) {
            return [];
        }

        const sceneId = scene.id;
        return this.getAllObjects().filter(({ scene: { id } }) => id === sceneId);
    }

    /**
     *  set objects list belonged to specific scene
     */
    setCurrentObjects() {
        this.currentObjects_ = this.getSceneObjects();
        if (this.currentObjects_.length) {
            Entry.playground.hidePictureCurtain();
        } else {
            Entry.playground.showPictureCurtain();
        }
    }

    /**
     *  get objects list belonged to current scene
     */
    getCurrentObjects() {
        if (_.isEmpty(this.currentObjects_)) {
            this.setCurrentObjects();
        }
        return this.currentObjects_ || [];
    }

    /**
     *  get project jsons in art_view for saving especially for art_viewcontroller
     *  @param {!resource project} project
     *  @return {entry project} project
     */
    getProjectWithJSON(project) {
        project.objects = this.toJSON();
        project.variables = Entry.variableContainer.getVariableJSON();
        project.messages = Entry.variableContainer.getMessageJSON();
        project.scenes = Entry.scene.toJSON();
        return project;
    }

    blurAllInputs() {
        this.getSceneObjects().map(({ view_ }) => {
            $(view_).find('input').blur();
        });
    }

    showProjectAnswer() {
        const answer = this.inputValue;
        if (!answer) {
            return;
        }
        answer.setVisible(true);
    }
    showSttAnswer() {
        const answer = this.sttValue;
        if (!answer) {
            return;
        }
        answer.setVisible(true);
    }

    hideProjectAnswer(removeBlock, notIncludeSelf) {
        const answer = this.inputValue;
        if (!answer || !answer.isVisible() || Entry.engine.isState('run')) {
            return;
        }

        const objects = this.getAllObjects();
        const answerTypes = ['ask_and_wait', 'get_canvas_input_value', 'set_visible_answer'];

        for (let i = 0, len = objects.length; i < len; i++) {
            const code = objects[i].script;
            for (let j = 0; j < answerTypes.length; j++) {
                const blocks = code.getBlockList(false, answerTypes[j]);
                if (notIncludeSelf) {
                    const index = blocks.indexOf(removeBlock);
                    if (~index) {
                        blocks.splice(index, 1);
                    }
                }
                if (blocks.length) {
                    return;
                }
            }
        }

        //answer related blocks not found
        //hide canvas answer view
        answer.setVisible(false);
    }
    hideSttAnswer(removeBlock, notIncludeSelf) {
        const answer = this.sttValue;
        if (!answer || !answer.isVisible() || Entry.engine.isState('run')) {
            return;
        }

        const objects = this.getAllObjects();
        const answerTypes = ['ask_and_wait', 'get_canvas_input_value', 'set_visible_answer'];

        for (let i = 0, len = objects.length; i < len; i++) {
            const code = objects[i].script;
            for (let j = 0; j < answerTypes.length; j++) {
                const blocks = code.getBlockList(false, answerTypes[j]);
                if (notIncludeSelf) {
                    const index = blocks.indexOf(removeBlock);
                    if (~index) {
                        blocks.splice(index, 1);
                    }
                }
                if (blocks.length) {
                    return;
                }
            }
        }

        //answer related blocks not found
        //hide canvas answer view
        answer.setVisible(false);
    }

    getView() {
        return this._view;
    }

    // dummy
    resize() {
        return;
    }

    _rightClick = (e) => {
        e.stopPropagation();
        const touchEvent = Entry.Utils.convertMouseEvent(e);

        const options = [
            {
                text: Lang.Blocks.Paste_blocks,
                enable: !Entry.engine.isState('run') && !!this.copiedObject,
                callback: () => {
                    if (this.copiedObject) {
                        this.addCloneObject(this.copiedObject);
                    } else {
                        Entry.toast.alert(
                            Lang.Workspace.add_object_alert,
                            Lang.Workspace.object_not_found_for_paste
                        );
                    }
                },
            },
        ];

        Entry.ContextMenu.show(options, 'workspace-contextmenu', {
            x: touchEvent.clientX,
            y: touchEvent.clientY,
        });
    };

    removeFuncBlocks(functionType) {
        this.objects_.forEach(({ script }) => {
            script.removeBlocksByType(functionType);
        });
    }

    clear() {
        [...this.objects_, ...this._extensionObjects].forEach((o) => o.destroy());
        this.objects_ = [];
        // INFO : clear 시도할때 _extensionObjects 초기화
        this._extensionObjects = [];
        // TODO: clear 때 this._extensionListView 도 비워 줘야 하는지 확인 필요.
        Entry.playground.clear();
    }

    selectNeighborObject(option) {
        const objects = this.getCurrentObjects();
        if (!objects || objects.length === 0) {
            return;
        }

        let currentIndex = objects.indexOf(Entry.playground.object);
        const maxLen = objects.length;
        switch (option) {
            case 'prev':
                if (--currentIndex < 0) {
                    currentIndex = objects.length - 1;
                }
                break;
            case 'next':
                currentIndex = ++currentIndex % maxLen;
                break;
        }

        const object = objects[currentIndex];
        if (!object) {
            return;
        }

        this.selectObject(object.id);
    }

    getObjectIndex(objectId) {
        return this.objects_.indexOf(this.getObject(objectId));
    }

    getDom(query) {
        if (query.length >= 1) {
            switch (query.shift()) {
                case 'objectIndex':
                    return this.objects_[query.shift()].getDom(query);
                case 'objectId':
                    return this.getObject(query.shift()).getDom(query);
            }
        } else {
        }
    }

    isSceneObjectsExist() {
        return !_.isEmpty(this.getSceneObjects());
    }

    adjustClonedValues(oldIds, newIds) {
        if (!(oldIds && newIds)) {
            return;
        }
        const that = this;
        newIds.forEach((newId) => {
            that.getObject(newId)
                .script.getBlockList()
                .forEach((b) => {
                    if (!b || !b.params) {
                        return;
                    }
                    let changed = false;
                    const ret = b.params.map((p) => {
                        if (typeof p !== 'string') {
                            return p;
                        }
                        const index = oldIds.indexOf(p);
                        if (index < 0) {
                            return p;
                        }
                        changed = true;
                        return newIds[index];
                    });
                    changed && b.set({ params: ret });
                });
        });
    }

    getBlockList() {
        return _.flatten(this.objects_.map(({ script }) => script.getBlockList()));
    }

    scrollToObject(ObjectId) {
        const { view_ } = this.getObject(ObjectId);

        view_ && view_.scrollIntoView();
        document.body.scrollIntoView();
    }

    setSound(sound) {
        const sounds = this.getObject(sound.objectId).sounds;
        const index = _.findIndex(sounds, ({ id }) => id === sound.id);
        if (!~index) {
            throw new Error('No sound found');
        }
        const path =
            sound.fileurl ||
            `${Entry.defaultPath}/uploads/${sound.filename.substring(
                0,
                2
            )}/${sound.filename.substring(2, 4)}/${Entry.soundPath}${sound.filename}${
                sound.ext || '.mp3'
            }`;
        sounds[index] = Object.assign(
            _.pick(sound, [
                'duration',
                'ext',
                'fileurl',
                'filename',
                'id',
                'label',
                'name',
                'path',
            ]),
            {
                view: sounds[index].view,
                path,
            }
        );
        return sounds[index];
    }

    destroy() {
        // 우선 interface 만 정의함.
    }
};
