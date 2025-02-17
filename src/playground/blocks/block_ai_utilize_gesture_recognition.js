import MediaPipeUtils from '../../util/mediaPipeUtils';

const mediaPipeUtils = MediaPipeUtils.getInstance();
Entry.AI_UTILIZE_BLOCK.gestureRecognition = {
    name: 'gestureRecognition',
    imageName: 'gestureRecognition.svg',
    category: 'video',
    title: {
        ko: '손 인식',
        en: 'Gesture Recognition',
    },
    titleKey: 'Workspace.gesture_recognition_title_text',
    description: Lang.Msgs.ai_utilize_gesture_recognition_description,
    descriptionKey: 'Msgs.ai_utilize_gesture_recognition_description',
    isInitialized: false,
    async init() {
        await mediaPipeUtils.initialize();
        Entry.AI_UTILIZE_BLOCK.gestureRecognition.isInitialized = true;
    },
    destroy() {
        mediaPipeUtils.destroy();
        Entry.AI_UTILIZE_BLOCK.gestureRecognition.isInitialized = false;
    },
};

Entry.AI_UTILIZE_BLOCK.gestureRecognition.getBlocks = function() {
    const params = {
        getEventIndicator() {
            return {
                type: 'Indicator',
                img: 'block_icon/start_icon_hand.svg',
                size: 14,
                position: {
                    x: 0,
                    y: -2,
                },
            };
        },
        getCommonIndicator() {
            return {
                type: 'Indicator',
                img: 'block_icon/ai_hand_icon.svg',
                size: 11,
            };
        },
        getHandNumber() {
            return {
                type: 'Dropdown',
                options: [
                    ['1', 0],
                    ['2', 1],
                ],
                value: 0,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getHand() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.right_hand, 'Left'],
                    [Lang.Blocks.left_hand, 'Right'],
                ],
                value: 'Left',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getGesture() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.gesture_list.closed_fist, 'Closed_Fist'],
                    [Lang.gesture_list.open_palm, 'Open_Palm'],
                    [Lang.gesture_list.pointing_up, 'Pointing_Up'],
                    [Lang.gesture_list.thumb_down, 'Thumb_Down'],
                    [Lang.gesture_list.thumb_up, 'Thumb_Up'],
                    [Lang.gesture_list.victory, 'Victory'],
                    [Lang.gesture_list.iloveyou, 'ILoveYou'],
                ],
                value: 'Closed_Fist',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getHandPoint() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.thumb, 1],
                    [Lang.Blocks.index_finger, 5],
                    [Lang.Blocks.middle_finger, 9],
                    [Lang.Blocks.ring_finger, 13],
                    [Lang.Blocks.little_finger, 17],
                    [Lang.Blocks.wrist, 0],
                ],
                value: 1,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                dropdownSync: 'handPoint',
            };
        },
        getHandDetailPoint() {
            return {
                type: 'DropdownDynamic',
                menuName() {
                    const handPoint = this.getTargetValue('handPoint');
                    const value = this.getValue();
                    if (handPoint === 1) {
                        if (![2, 3].includes(value)) {
                            this.setValue(3);
                        }
                        return [
                            [Lang.Blocks.tip, 3],
                            [Lang.Blocks.dip, 2],
                        ];
                    } else if (handPoint !== 0) {
                        if (![1, 2, 3].includes(value)) {
                            this.setValue(3);
                        }
                        return [
                            [Lang.Blocks.tip, 3],
                            [Lang.Blocks.dip, 2],
                            [Lang.Blocks.pip, 1],
                        ];
                    } else {
                        this.setValue(0);
                        return [[Lang.Blocks.none, 0]];
                    }
                },
                needDeepCopy: true,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getAxis() {
            return {
                type: 'Dropdown',
                options: [
                    ['x', 'x'],
                    ['y', 'y'],
                ],
                value: 'x',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getStartStop() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.video_start, 'start'],
                    [Lang.Blocks.video_end, 'stop'],
                ],
                value: 'start',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getShowHide() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.video_show_video, 'show'],
                    [Lang.Blocks.video_hide_video, 'hide'],
                ],
                value: 'show',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
    };
    return {
        hand_detection_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.Blocks.hand_detection_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'hand_detection_title',
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            events: {},
        },
        when_hand_detection: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_event',
            statements: [],
            params: [params.getEventIndicator()],
            events: {},
            def: {
                params: [null],
                type: 'when_hand_detection',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            event: 'when_hand_detection',
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_gesture',
        },
        hand_detection: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getStartStop(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'hand_detection',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'start') {
                    await mediaPipeUtils.startHandGestureRecognition(value);
                } else {
                    await mediaPipeUtils.stopHandGestureRecognition(value);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_gesture',
        },
        draw_detected_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getShowHide(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'draw_detected_hand',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'show') {
                    mediaPipeUtils.changeDrawDetectedHand(true);
                } else {
                    mediaPipeUtils.changeDrawDetectedHand(false);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_gesture',
        },
        check_detected_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'check_detected_hand',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                return mediaPipeUtils.isPrevHandDetected;
            },
            wikiClass: 'ai_utilize_gesture',
        },
        count_detected_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'count_detected_hand',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                return mediaPipeUtils.countDetectedHand;
            },
            wikiClass: 'ai_utilize_gesture',
        },
        locate_to_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                params.getHandNumber(),
                params.getHandPoint(),
                params.getHandDetailPoint(),
                params.getCommonIndicator(),
            ],
            events: {},
            def: {
                type: 'locate_to_hand',
            },
            paramsKeyMap: {
                HAND: 0,
                HAND_POINT: 1,
                HAND_DETAIL_POINT: 2,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                const hand = script.getField('HAND');
                const point = script.getField('HAND_POINT');
                const detail = script.getField('HAND_DETAIL_POINT');
                const handPoint = point + detail;
                const axis = mediaPipeUtils.getHandPointAxis(hand, handPoint);
                if (axis) {
                    sprite.setX(axis.x);
                    sprite.setY(axis.y);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(axis.x, axis.y * -1);
                    }
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_gesture',
        },
        locate_time_to_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getHandNumber(),
                params.getHandPoint(),
                params.getHandDetailPoint(),
                params.getCommonIndicator(),
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
                    null,
                ],
                type: 'locate_time_to_hand',
            },
            paramsKeyMap: {
                TIME: 0,
                HAND: 1,
                HAND_POINT: 2,
                HAND_DETAIL_POINT: 3,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                if (!script.isStart) {
                    const time = script.getNumberValue('TIME', script);
                    const frameCount = Math.floor(time * Entry.FPS);
                    const hand = script.getField('HAND', script);
                    const point = script.getField('HAND_POINT', script);
                    const detail = script.getField('HAND_DETAIL_POINT', script);
                    const handPoint = point + detail;

                    if (frameCount != 0) {
                        const axis = mediaPipeUtils.getHandPointAxis(hand, handPoint);
                        if (axis) {
                            script.isStart = true;
                            script.frameCount = frameCount;
                            script.dX = (axis.x - sprite.getX()) / script.frameCount;
                            script.dY = (axis.y - sprite.getY()) / script.frameCount;
                        }
                    } else {
                        const axis = mediaPipeUtils.getHandPointAxis(hand, handPoint);
                        if (axis) {
                            sprite.setX(axis.x);
                            sprite.setY(axis.y);
                            if (sprite.brush && !sprite.brush.stop) {
                                sprite.brush.lineTo(axis.x, axis.y * -1);
                            }
                        }
                        return script.callReturn();
                    }
                }
                if (script.frameCount != 0) {
                    sprite.setX(sprite.getX() + script.dX);
                    sprite.setY(sprite.getY() + script.dY);
                    script.frameCount--;
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(sprite.getX(), sprite.getY() * -1);
                    }
                    return script;
                } else {
                    delete script.isStart;
                    delete script.frameCount;
                    return script.callReturn();
                }
            },
            wikiClass: 'ai_utilize_gesture',
        },
        axis_detected_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                { ...params.getHandNumber(), fontSize: 10 },
                { ...params.getHandPoint(), fontSize: 10 },
                { ...params.getHandDetailPoint(), fontSize: 10 },
                { ...params.getAxis(), fontSize: 10 },
            ],
            events: {},
            def: {
                params: [null, null, null, null],
                type: 'axis_detected_hand',
            },
            paramsKeyMap: {
                HAND: 0,
                HAND_POINT: 1,
                HAND_DETAIL_POINT: 2,
                AXIS: 3,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                const hand = script.getField('HAND', script);
                const point = script.getField('HAND_POINT', script);
                const detail = script.getField('HAND_DETAIL_POINT', script);
                const axisName = script.getField('AXIS', script);
                const handPoint = point + detail;
                const axis = mediaPipeUtils.getHandPointAxis(hand, handPoint);
                if (axis) {
                    return axis[axisName] || 0;
                }
                return 0;
            },
            wikiClass: 'ai_utilize_gesture',
        },
        is_which_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                { ...params.getHandNumber(), fontSize: 10 },
                { ...params.getHand(), fontSize: 10 },
            ],
            events: {},
            def: { params: [null, null], type: 'is_which_hand' },
            paramsKeyMap: {
                HAND_NUM: 0,
                HAND: 1,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                const handNum = script.getField('HAND_NUM', script);
                const hand = script.getField('HAND', script);
                const handedness = mediaPipeUtils.getHandedness(handNum);
                if (!handedness) {
                    return false;
                }
                return handedness.categoryName === hand;
            },
            wikiClass: 'ai_utilize_gesture',
        },
        get_which_hand: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [{ ...params.getHandNumber(), fontSize: 10 }],
            events: {},
            def: { params: [null, null], type: 'get_which_hand' },
            paramsKeyMap: {
                HAND_NUM: 0,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                const handNum = script.getField('HAND_NUM', script);
                const handedness = mediaPipeUtils.getHandedness(handNum);
                if (!handedness) {
                    return 'null';
                } else if (handedness.categoryName === 'Left') {
                    return Lang.Blocks.right_hand;
                } else {
                    return Lang.Blocks.left_hand;
                }
            },
            wikiClass: 'ai_utilize_gesture',
        },
        is_which_gesture: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                { ...params.getHandNumber(), fontSize: 10 },
                { ...params.getGesture(), fontSize: 10 },
            ],
            events: {},
            def: { params: [null, null], type: 'is_which_gesture' },
            paramsKeyMap: {
                HAND_NUM: 0,
                GESTURE: 1,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                const handNum = script.getField('HAND_NUM', script);
                const gestureName = script.getField('GESTURE', script);
                const gesture = mediaPipeUtils.getGesture(handNum);
                if (!gesture) {
                    return false;
                }
                return gesture.categoryName === gestureName;
            },
            wikiClass: 'ai_utilize_gesture',
        },
        get_which_gesture: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [{ ...params.getHandNumber(), fontSize: 10 }],
            events: {},
            def: { params: [null, null], type: 'get_which_gesture' },
            paramsKeyMap: {
                HAND_NUM: 0,
            },
            class: 'hand',
            isNotFor: ['gestureRecognition'],
            func(sprite, script) {
                const handNum = script.getField('HAND_NUM', script);
                const gesture = mediaPipeUtils.getGesture(handNum);

                if (!gesture) {
                    return 'null';
                }
                return Lang.gesture_list[gesture.categoryName.toLowerCase()] || Lang.Blocks.unknown;
            },
            wikiClass: 'ai_utilize_gesture',
        },
    };
};
