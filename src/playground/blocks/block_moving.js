module.exports = {
    getBlocks() {
        function moveInToBound(object, wall){
            if(wall.up.y > object.y)
                object.y = wall.up.y;

            if(wall.down.y < object.y)
                object.y = wall.down.y;

            if(wall.right.x < object.x)
                object.x = wall.right.x;

            if(wall.left.x > object.x)
                object.x = wall.left.x;
        }

        return {
            move_direction: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'move_direction',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'move_direction',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'walk',
                isNotFor: [],
                func: function(sprite, script) {
                    var value = script.getNumberValue('VALUE', script);
                    sprite.setX(
                        sprite.getX() +
                            value *
                                Math.cos(
                                    (sprite.getRotation() +
                                        sprite.getDirection() -
                                        90) /
                                        180 *
                                        Math.PI
                                )
                    );
                    sprite.setY(
                        sprite.getY() -
                            value *
                                Math.sin(
                                    (sprite.getRotation() +
                                        sprite.getDirection() -
                                        90) /
                                        180 *
                                        Math.PI
                                )
                    );
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.move_to_direction(%1)'] },
            },
            bounce_wall: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'bounce_wall',
                },
                class: 'walk',
                isNotFor: [],
                func: function(sprite, script) {
                    var threshold = 0;

                    var method = sprite.parent.getRotateMethod();
                    /*
                   var bound = sprite.object.getTransformedBounds();
                   var size = {};
                   size.width = bound.width * Math.sqrt(1.0 + (bound.height/bound.width) * (bound.height/bound.width));
                   size.height = bound.height * Math.sqrt(1.0 + (bound.width/bound.height) * (bound.width/bound.height));
                   */
                    //moveInToBound(sprite.object, Entry.stage.wall);

                    if (method == 'free')
                        var angle = (
                            sprite.getRotation() + sprite.getDirection()
                        ).mod(360);
                    else var angle = sprite.getDirection();

                    var skip = Entry.Utils.COLLISION.NONE;
                    if (
                        (angle < 90 && angle >= 0) ||
                        (angle < 360 && angle >= 270)
                    ) {
                        skip = sprite.collision == Entry.Utils.COLLISION.UP;
                        var up = ndgmr.checkPixelCollision(
                            Entry.stage.wall.up,
                            sprite.object,
                            threshold,
                            false
                        );
                        if (!up && skip)
                            sprite.collision = Entry.Utils.COLLISION.NONE;

                        if (up && skip) up = false;

                        if (up) {
                            if (method == 'free')
                                sprite.setRotation(
                                    -sprite.getRotation() -
                                        sprite.getDirection() * 2 +
                                        180
                                );
                            else
                                sprite.setDirection(
                                    -sprite.getDirection() + 180
                                );

                            sprite.collision = Entry.Utils.COLLISION.UP;
                            //sprite.setY(135 - bound.height/2 - 1);
                        } else {
                            skip =
                                sprite.collision == Entry.Utils.COLLISION.DOWN;
                            var down = ndgmr.checkPixelCollision(
                                Entry.stage.wall.down,
                                sprite.object,
                                threshold,
                                false
                            );
                            if (!down && skip)
                                sprite.collision = Entry.Utils.COLLISION.NONE;

                            if (down && skip) down = false;

                            if (down) {
                                if (method == 'free')
                                    sprite.setRotation(
                                        -sprite.getRotation() -
                                            sprite.getDirection() * 2 +
                                            180
                                    );
                                else
                                    sprite.setDirection(
                                        -sprite.getDirection() + 180
                                    );

                                sprite.collision = Entry.Utils.COLLISION.DOWN;
                                //sprite.setY(-135 + bound.height/2 + 1);
                            }
                        }
                    } else if (angle < 270 && angle >= 90) {
                        skip = sprite.collision == Entry.Utils.COLLISION.DOWN;
                        var down = ndgmr.checkPixelCollision(
                            Entry.stage.wall.down,
                            sprite.object,
                            threshold,
                            false
                        );
                        if (!down && skip)
                            sprite.collision = Entry.Utils.COLLISION.NONE;

                        if (down && skip) down = false;

                        if (down) {
                            if (method == 'free')
                                sprite.setRotation(
                                    -sprite.getRotation() -
                                        sprite.getDirection() * 2 +
                                        180
                                );
                            else
                                sprite.setDirection(
                                    -sprite.getDirection() + 180
                                );

                            sprite.collision = Entry.Utils.COLLISION.DOWN;
                            //sprite.setY(-135 + bound.height/2 + 1);
                        } else {
                            skip = sprite.collision == Entry.Utils.COLLISION.UP;
                            var up = ndgmr.checkPixelCollision(
                                Entry.stage.wall.up,
                                sprite.object,
                                threshold,
                                false
                            );
                            if (!up && skip)
                                sprite.collision = Entry.Utils.COLLISION.NONE;

                            if (up && skip) up = false;

                            if (up) {
                                if (method == 'free')
                                    sprite.setRotation(
                                        -sprite.getRotation() -
                                            sprite.getDirection() * 2 +
                                            180
                                    );
                                else
                                    sprite.setDirection(
                                        -sprite.getDirection() + 180
                                    );

                                sprite.collision = Entry.Utils.COLLISION.UP;
                                //sprite.setY(135 - bound.height/2 - 1);
                            }
                        }
                    }
                    if (angle < 360 && angle >= 180) {
                        skip = sprite.collision == Entry.Utils.COLLISION.LEFT;
                        var left = ndgmr.checkPixelCollision(
                            Entry.stage.wall.left,
                            sprite.object,
                            threshold,
                            false
                        );
                        if (!left && skip)
                            sprite.collision = Entry.Utils.COLLISION.NONE;

                        if (left && skip) left = false;

                        if (left) {
                            if (method == 'free')
                                sprite.setRotation(
                                    -sprite.getRotation() -
                                        sprite.getDirection() * 2
                                );
                            else
                                sprite.setDirection(
                                    -sprite.getDirection() + 360
                                );

                            sprite.collision = Entry.Utils.COLLISION.LEFT;
                            //sprite.setX(-240 + bound.width/2 + 1);
                        } else {
                            skip =
                                sprite.collision == Entry.Utils.COLLISION.RIGHT;
                            var right = ndgmr.checkPixelCollision(
                                Entry.stage.wall.right,
                                sprite.object,
                                threshold,
                                false
                            );
                            if (!right && skip)
                                sprite.collision = Entry.Utils.COLLISION.NONE;

                            if (right && skip) right = false;

                            if (right) {
                                if (method == 'free')
                                    sprite.setRotation(
                                        -sprite.getRotation() -
                                            sprite.getDirection() * 2
                                    );
                                else
                                    sprite.setDirection(
                                        -sprite.getDirection() + 360
                                    );

                                sprite.collision = Entry.Utils.COLLISION.RIGHT;
                                //sprite.setX(240 - bound.width/2 - 1);
                            }
                        }
                    } else if (angle < 180 && angle >= 0) {
                        skip = sprite.collision == Entry.Utils.COLLISION.RIGHT;
                        var right = ndgmr.checkPixelCollision(
                            Entry.stage.wall.right,
                            sprite.object,
                            threshold,
                            false
                        );
                        if (!right && skip)
                            sprite.collision = Entry.Utils.COLLISION.NONE;

                        if (right && skip) right = false;

                        if (right) {
                            if (method == 'free')
                                sprite.setRotation(
                                    -sprite.getRotation() -
                                        sprite.getDirection() * 2
                                );
                            else
                                sprite.setDirection(
                                    -sprite.getDirection() + 360
                                );

                            sprite.collision = Entry.Utils.COLLISION.RIGHT;
                            //sprite.setX(240 - bound.width/2 - 1);
                        } else {
                            skip =
                                sprite.collision == Entry.Utils.COLLISION.LEFT;
                            var left = ndgmr.checkPixelCollision(
                                Entry.stage.wall.left,
                                sprite.object,
                                threshold,
                                false
                            );
                            if (!left && skip)
                                sprite.collision = Entry.Utils.COLLISION.NONE;

                            if (left && skip) left = false;

                            if (left) {
                                if (method == 'free')
                                    sprite.setRotation(
                                        -sprite.getRotation() -
                                            sprite.getDirection() * 2
                                    );
                                else
                                    sprite.setDirection(
                                        -sprite.getDirection() + 360
                                    );

                                sprite.collision = Entry.Utils.COLLISION.LEFT;
                                //sprite.setX(-240 + bound.width/2 + 1);
                            }
                        }
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.bounce_on_edge()'] },
            },
            move_x: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'move_x',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'move_x',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'move_relative',
                isNotFor: [],
                func: function(sprite, script) {
                    var value = script.getNumberValue('VALUE', script);
                    sprite.setX(sprite.getX() + value);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.add_x(%1)'] },
            },
            move_y: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'move_y',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'move_y',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'move_relative',
                isNotFor: [],
                func: function(sprite, script) {
                    var value = script.getNumberValue('VALUE', script);
                    sprite.setY(sprite.getY() + value);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.add_y(%1)'] },
            },
            move_xy_time: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['2'],
                        },
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'move_xy_time',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['C&value'],
                        },
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'move_xy_time',
                },
                paramsKeyMap: {
                    VALUE1: 0,
                    VALUE2: 1,
                    VALUE3: 2,
                },
                class: 'move_relative',
                isNotFor: [],
                func: function(sprite, script) {
                    if (!script.isStart) {
                        var timeValue;
                        timeValue = script.getNumberValue('VALUE1', script);
                        var xValue = script.getNumberValue('VALUE2', script);
                        var yValue = script.getNumberValue('VALUE3', script);
                        script.isStart = true;
                        script.frameCount = Math.max(
                            Math.floor(timeValue * Entry.FPS),
                            1
                        );
                        script.dX = xValue / script.frameCount;
                        script.dY = yValue / script.frameCount;

                        if (script.frameCount == 1) action();
                    }

                    if (script.frameCount != 0) {
                        action();
                        return script;
                    } else {
                        delete script.isStart;
                        delete script.frameCount;
                        return script.callReturn();
                    }

                    function action() {
                        sprite.setX(sprite.getX() + script.dX);
                        sprite.setY(sprite.getY() + script.dY);
                        script.frameCount--;
                        if (sprite.brush && !sprite.brush.stop) {
                            sprite.brush.lineTo(
                                sprite.getX(),
                                sprite.getY() * -1
                            );
                        }
                    }
                },
                syntax: { js: [], py: ['Entry.add_xy_for_sec(%2, %3, %1)'] },
            },
            locate_x: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'locate_x',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'locate_x',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'move_absolute',
                isNotFor: [],
                func: function(sprite, script) {
                    var value = script.getNumberValue('VALUE', script);
                    sprite.setX(value);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.set_x(%1)'] },
            },
            locate_y: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'locate_y',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'locate_y',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'move_absolute',
                isNotFor: [],
                func: function(sprite, script) {
                    var value = script.getNumberValue('VALUE', script);
                    //sprite.y = 340 - value;
                    sprite.setY(value);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.set_y(%1)'] },
            },
            locate_xy: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['0'],
                        },
                        {
                            type: 'number',
                            params: ['0'],
                        },
                        null,
                    ],
                    type: 'locate_xy',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                    ],
                    type: 'locate_xy',
                },
                paramsKeyMap: {
                    VALUE1: 0,
                    VALUE2: 1,
                },
                class: 'move_absolute',
                isNotFor: [],
                func: function(sprite, script) {
                    var value1 = script.getNumberValue('VALUE1', script);
                    var value2 = script.getNumberValue('VALUE2', script);
                    sprite.setX(value1);
                    sprite.setY(value2);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.set_xy(%1, %2)'] },
            },
            locate_xy_time: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['2'],
                        },
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'locate_xy_time',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['C&value'],
                        },
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        null,
                    ],
                    type: 'locate_xy_time',
                },
                paramsKeyMap: {
                    VALUE1: 0,
                    VALUE2: 1,
                    VALUE3: 2,
                },
                class: 'move_absolute',
                isNotFor: [],
                func: function(sprite, script) {
                    if (!script.isStart) {
                        var timeValue;
                        timeValue = script.getNumberValue('VALUE1', script);
                        script.isStart = true;
                        script.frameCount = Math.max(
                            Math.floor(timeValue * Entry.FPS),
                            1
                        );
                        script.x = script.getNumberValue('VALUE2', script);
                        script.y = script.getNumberValue('VALUE3', script);

                        if (script.frameCount == 1) action();
                    }

                    if (script.frameCount != 0) {
                        action();
                        return script;
                    } else {
                        delete script.isStart;
                        delete script.frameCount;
                        return script.callReturn();
                    }

                    function action() {
                        var dX = script.x - sprite.getX();
                        var dY = script.y - sprite.getY();
                        dX /= script.frameCount;
                        dY /= script.frameCount;
                        sprite.setX(sprite.getX() + dX);
                        sprite.setY(sprite.getY() + dY);
                        script.frameCount--;
                        if (sprite.brush && !sprite.brush.stop) {
                            sprite.brush.lineTo(
                                sprite.getX(),
                                sprite.getY() * -1
                            );
                        }
                    }
                },
                syntax: { js: [], py: ['Entry.set_xy_for_sec(%2, %3, %1)'] },
            },
            locate: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'spritesWithMouse',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.MOVING,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'locate',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'locate',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'move_absolute',
                isNotFor: [],
                func: function(sprite, script) {
                    var targetId = script.getField('VALUE', script);
                    var x, y;
                    if (targetId == 'mouse') {
                        x = Entry.stage.mouseCoordinate.x;
                        y = Entry.stage.mouseCoordinate.y;
                    } else {
                        var targetEntity = Entry.container.getEntity(targetId);
                        x = targetEntity.getX();
                        y = targetEntity.getY();
                    }
                    sprite.setX(Number(x));
                    sprite.setY(Number(y));
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(x, y * -1);
                    }
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.move_to(%1)',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'spritesWithMouse',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.MOVING,
                                    converter:
                                        Entry.block.converters.returnStringKey,
                                    codeMap: 'Entry.CodeMap.Entry.locate[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            locate_object_time: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'spritesWithMouse',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.MOVING,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['2'],
                        },
                        null,
                        null,
                    ],
                    type: 'locate_object_time',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        'A&value',
                    ],
                    type: 'locate_object_time',
                },
                paramsKeyMap: {
                    VALUE: 0,
                    TARGET: 1,
                },
                class: 'move_absolute',
                isNotFor: [],
                func: function(sprite, script) {
                    if (!script.isStart) {
                        var timeValue, xValue, yValue;
                        var targetId = script.getField('TARGET', script);
                        timeValue = script.getNumberValue('VALUE', script);
                        var frameCount = Math.floor(timeValue * Entry.FPS);
                        var mouseCoordi = Entry.stage.mouseCoordinate;

                        if (frameCount != 0) {
                            if (targetId == 'mouse') {
                                xValue = mouseCoordi.x - sprite.getX();
                                yValue = mouseCoordi.y - sprite.getY();
                            } else {
                                var targetEntity = Entry.container.getEntity(
                                    targetId
                                );
                                xValue = targetEntity.getX() - sprite.getX();
                                yValue = targetEntity.getY() - sprite.getY();
                            }
                            script.isStart = true;
                            script.frameCount = frameCount;
                            script.dX = xValue / script.frameCount;
                            script.dY = yValue / script.frameCount;
                        } else {
                            //frame count is zero so execute immediately
                            if (targetId == 'mouse') {
                                xValue = Number(mouseCoordi.x);
                                yValue = Number(mouseCoordi.y);
                            } else {
                                var targetEntity = Entry.container.getEntity(
                                    targetId
                                );
                                xValue = targetEntity.getX();
                                yValue = targetEntity.getY();
                            }
                            sprite.setX(xValue);
                            sprite.setY(yValue);
                            if (sprite.brush && !sprite.brush.stop) {
                                sprite.brush.lineTo(
                                    sprite.getX(),
                                    sprite.getY() * -1
                                );
                            }
                            return script.callReturn();
                        }
                    }
                    if (script.frameCount != 0) {
                        sprite.setX(sprite.getX() + script.dX);
                        sprite.setY(sprite.getY() + script.dY);
                        script.frameCount--;
                        if (sprite.brush && !sprite.brush.stop)
                            sprite.brush.lineTo(
                                sprite.getX(),
                                sprite.getY() * -1
                            );
                        return script;
                    } else {
                        delete script.isStart;
                        delete script.frameCount;
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.move_to_for_sec(%2, %1)',
                            textParams: [
                                {
                                    type: 'Block',
                                    accept: 'string',
                                },
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'spritesWithMouse',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.MOVING,
                                    converter:
                                        Entry.block.converters.returnStringKey,
                                    codeMap:
                                        'Entry.CodeMap.Entry.locate_object_time[1]',
                                },
                            ],
                        },
                    ],
                },
            },
            rotate_relative: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'angle',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'angle',
                            params: ['90'],
                        },
                        null,
                    ],
                    type: 'rotate_relative',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'angle',
                            params: ['A&value'],
                        },
                    ],
                    type: 'rotate_relative',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'rotate',
                isNotFor: [],
                func: function(entity, script) {
                    var value = script.getNumberValue('VALUE', script);
                    entity.setRotation(value + entity.getRotation());
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.add_rotation(%1)'] },
            },
            direction_relative: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        defaultType: 'angle',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'angle',
                            params: ['90'],
                        },
                        null,
                    ],
                    type: 'direction_relative',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'angle',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'direction_relative',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'rotate',
                isNotFor: [],
                func: function(entity, script) {
                    var value = script.getNumberValue('VALUE', script);
                    entity.setDirection(value + entity.getDirection());
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.add_direction(%1)'] },
            },
            rotate_by_time: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        defaultType: 'angle',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['2'],
                        },
                        {
                            type: 'angle',
                            params: ['90'],
                        },
                        null,
                    ],
                    type: 'rotate_by_time',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['B&value'],
                        },
                        {
                            type: 'angle',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'rotate_by_time',
                },
                paramsKeyMap: {
                    VALUE: 0,
                    ANGLE: 1,
                },
                class: 'rotate',
                isNotFor: [],
                func: function(sprite, script) {
                    if (!script.isStart) {
                        var timeValue;
                        timeValue = script.getNumberValue('VALUE', script);
                        var angleValue = script.getNumberValue('ANGLE', script);
                        script.isStart = true;
                        script.frameCount = Math.max(
                            Math.floor(timeValue * Entry.FPS),
                            1
                        );
                        script.dAngle = angleValue / script.frameCount;

                        if (script.frameCount == 1) action();
                    }
                    if (script.frameCount != 0) {
                        action();
                        return script;
                    } else {
                        delete script.isStart;
                        delete script.frameCount;
                        return script.callReturn();
                    }

                    function action() {
                        sprite.setRotation(
                            sprite.getRotation() + script.dAngle
                        );
                        script.frameCount--;
                    }
                },
                syntax: { js: [], py: ['Entry.add_rotation_for_sec(%2, %1)'] },
            },
            direction_relative_duration: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        defaultType: 'angle',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['2'],
                        },
                        {
                            type: 'angle',
                            params: ['90'],
                        },
                        null,
                    ],
                    type: 'direction_relative_duration',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['B&value'],
                        },
                        {
                            type: 'angle',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'direction_relative_duration',
                },
                paramsKeyMap: {
                    DURATION: 0,
                    AMOUNT: 1,
                },
                class: 'rotate',
                isNotFor: [],
                func: function(sprite, script) {
                    if (!script.isStart) {
                        var timeValue;
                        timeValue = script.getNumberValue('DURATION', script);
                        var directionValue = script.getNumberValue(
                            'AMOUNT',
                            script
                        );
                        script.isStart = true;
                        script.frameCount = Math.max(
                            Math.floor(timeValue * Entry.FPS),
                            1
                        );
                        script.dDirection = directionValue / script.frameCount;

                        if (script.frameCount == 1) action();
                    }
                    if (script.frameCount != 0) {
                        action();
                        return script;
                    } else {
                        delete script.isStart;
                        delete script.frameCount;
                        delete script.dDirection;
                        return script.callReturn();
                    }

                    function action() {
                        sprite.setDirection(
                            sprite.getDirection() + script.dDirection
                        );
                        script.frameCount--;
                    }
                },
                syntax: { js: [], py: ['Entry.add_direction_for_sec(%2, %1)'] },
            },
            rotate_absolute: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        defaultType: 'angle',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'angle',
                            params: ['90'],
                        },
                        null,
                    ],
                    type: 'rotate_absolute',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'angle',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'rotate_absolute',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'rotate_absolute',
                isNotFor: [],
                func: function(entity, script) {
                    var value = script.getNumberValue('VALUE', script);
                    entity.setRotation(value);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.set_rotation(%1)'] },
            },
            direction_absolute: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        defaultType: 'angle',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'angle',
                            params: ['90'],
                        },
                        null,
                    ],
                    type: 'direction_absolute',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'angle',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'direction_absolute',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'rotate_absolute',
                isNotFor: [],
                func: function(entity, script) {
                    var value = script.getNumberValue('VALUE', script);
                    entity.setDirection(value);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.set_direction(%1)'] },
            },
            see_angle_object: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'spritesWithMouse',
                        fontSize: 11,
                        arrowColor: EntryStatic.colorSet.arrow.default.MOVING,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'see_angle_object',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'see_angle_object',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'rotate_absolute',
                isNotFor: [],
                func: function(sprite, script) {
                    var targetId = script.getField('VALUE', script);
                    var spriteX = sprite.getX();
                    var spriteY = sprite.getY();
                    var deltaX, deltaY, value;

                    if (sprite.parent.id == targetId)
                        return script.callReturn();

                    if (targetId == 'mouse') {
                        var mX = Entry.stage.mouseCoordinate.x;
                        var mY = Entry.stage.mouseCoordinate.y;

                        deltaX = mX - spriteX;
                        deltaY = mY - spriteY;
                    } else {
                        var targetEntity = Entry.container.getEntity(targetId);
                        deltaX = targetEntity.getX() - spriteX;
                        deltaY = targetEntity.getY() - spriteY;
                    }

                    if (deltaX === 0 && deltaY === 0) {
                        value = sprite.getDirection() + sprite.getRotation();
                    } else if (deltaX >= 0) {
                        value =
                            -Math.atan(deltaY / deltaX) / Math.PI * 180 + 90;
                    } else {
                        value =
                            -Math.atan(deltaY / deltaX) / Math.PI * 180 + 270;
                    }
                    if (this.entity.parent.getRotateMethod() === "free") {
                        var nativeDirection =
                            sprite.getDirection() + sprite.getRotation();
                        sprite.setRotation(
                            sprite.getRotation() + value - nativeDirection
                        );
                    } else {
                        sprite.setDirection(
                            value
                        );
                    }
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'Entry.look_at(%1)',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'spritesWithMouse',
                                    fontSize: 11,
                                    arrowColor: EntryStatic.colorSet.arrow.default.MOVING,
                                    converter:
                                        Entry.block.converters.returnStringKey,
                                    codeMap:
                                        'Entry.CodeMap.Entry.see_angle_object[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            move_to_angle: {
                color: EntryStatic.colorSet.block.default.MOVING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        defaultType: 'angle',
                        accept: 'string',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/moving_03.png',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'angle',
                            params: ['90'],
                        },
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'move_to_angle',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'angle',
                            params: ['B&value'],
                        },
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'move_to_angle',
                },
                paramsKeyMap: {
                    ANGLE: 0,
                    VALUE: 1,
                },
                class: 'move_rotate',
                isNotFor: [],
                func: function(sprite, script) {
                    var value = script.getNumberValue('VALUE', script);
                    var angle = script.getNumberValue('ANGLE', script);
                    sprite.setX(
                        sprite.getX() +
                            value * Math.cos((angle - 90) / 180 * Math.PI)
                    );
                    sprite.setY(
                        sprite.getY() -
                            value * Math.sin((angle - 90) / 180 * Math.PI)
                    );
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script.callReturn();
                },
                syntax: { js: [], py: ['Entry.move_to_degree(%2, %1)'] },
            },
        };
    }
}
