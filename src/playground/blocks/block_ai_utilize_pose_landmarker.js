import MediaPipeUtils from '../../util/mediaPipeUtils';

const mediaPipeUtils = MediaPipeUtils.getInstance();
Entry.AI_UTILIZE_BLOCK.poseLandmarker = {
    name: 'poseLandmarker',
    imageName: 'poseLandmarker.svg',
    category: 'video',
    title: {
        ko: '사람 인식',
        en: 'Human Detection',
    },
    titleKey: 'Workspace.pose_landmarker_title_text',
    description: Lang.Msgs.ai_utilize_pose_landmarker_description,
    descriptionKey: 'Msgs.ai_utilize_pose_landmarker_description',
    isInitialized: false,
    async init() {
        await mediaPipeUtils.initialize();
        Entry.AI_UTILIZE_BLOCK.poseLandmarker.isInitialized = true;
    },
    destroy() {
        mediaPipeUtils.destroy();
        Entry.AI_UTILIZE_BLOCK.poseLandmarker.isInitialized = false;
    },
};

Entry.AI_UTILIZE_BLOCK.poseLandmarker.getBlocks = function() {
    const params = {
        getEventIndicator() {
            return {
                type: 'Indicator',
                img: 'block_icon/start_icon_pose.svg',
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
                img: 'block_icon/ai_pose_icon.svg',
                size: 11,
            };
        },
        getPoseNumber() {
            return {
                type: 'Dropdown',
                options: [
                    ['1', 0],
                    ['2', 1],
                    ['3', 2],
                    ['4', 3],
                ],
                value: 0,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getPosePoint() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.pose_list.nose, 0],
                    [Lang.pose_list.left_eye_inner, 1],
                    [Lang.pose_list.left_eye, 2],
                    [Lang.pose_list.left_eye_outer, 3],
                    [Lang.pose_list.right_eye_inner, 4],
                    [Lang.pose_list.right_eye, 5],
                    [Lang.pose_list.right_eye_outer, 6],
                    [Lang.pose_list.left_ear, 7],
                    [Lang.pose_list.right_ear, 8],
                    [Lang.pose_list.mouth_left, 9],
                    [Lang.pose_list.mouth_right, 10],
                    [Lang.pose_list.left_shoulder, 11],
                    [Lang.pose_list.right_shoulder, 12],
                    [Lang.pose_list.left_elbow, 13],
                    [Lang.pose_list.right_elbow, 14],
                    [Lang.pose_list.left_wrist, 15],
                    [Lang.pose_list.right_wrist, 16],
                    [Lang.pose_list.left_pinky, 17],
                    [Lang.pose_list.right_pinky, 18],
                    [Lang.pose_list.left_index, 19],
                    [Lang.pose_list.right_index, 20],
                    [Lang.pose_list.left_thumb, 21],
                    [Lang.pose_list.right_thumb, 22],
                    [Lang.pose_list.left_hip, 23],
                    [Lang.pose_list.right_hip, 24],
                    [Lang.pose_list.left_knee, 25],
                    [Lang.pose_list.right_knee, 26],
                    [Lang.pose_list.left_ankle, 27],
                    [Lang.pose_list.right_ankle, 28],
                    [Lang.pose_list.left_heel, 29],
                    [Lang.pose_list.right_heel, 30],
                    [Lang.pose_list.left_foot_index, 31],
                    [Lang.pose_list.right_foot_index, 32],
                ],
                value: 0,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                dropdownSync: 'posePoint',
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
        pose_landmarker_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.Blocks.pose_landmarker_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'pose_landmarker_title',
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            events: {},
        },
        when_pose_landmarker: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_event',
            statements: [],
            params: [params.getEventIndicator()],
            events: {},
            def: {
                params: [null],
                type: 'when_pose_landmarker',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            event: 'when_pose_landmarker',
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            func(sprite, script) {
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_pose',
        },
        pose_landmarker: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getStartStop(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'pose_landmarker',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'start') {
                    await mediaPipeUtils.startPoseLandmarker(value);
                } else {
                    await mediaPipeUtils.stopPoseLandmarker(value);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_pose',
        },
        draw_detected_pose: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getShowHide(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'draw_detected_pose',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'show') {
                    mediaPipeUtils.changeDrawDetectedPoseLandmarker(true);
                } else {
                    mediaPipeUtils.changeDrawDetectedPoseLandmarker(false);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_pose',
        },
        check_detected_pose: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'check_detected_pose',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            func(sprite, script) {
                return mediaPipeUtils.isPrevPoseLandmarker;
            },
            wikiClass: 'ai_utilize_pose',
        },
        count_detected_pose: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'count_detected_pose',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            func(sprite, script) {
                return mediaPipeUtils.countDetectedPose || 0;
            },
            wikiClass: 'ai_utilize_pose',
        },
        locate_to_pose: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getPoseNumber(), params.getPosePoint(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'locate_to_pose',
            },
            paramsKeyMap: {
                POSE: 0,
                POSE_POINT: 1,
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            func(sprite, script) {
                const pose = script.getField('POSE');
                const point = script.getField('POSE_POINT');
                const axis = mediaPipeUtils.getPosePointAxis(pose, point);
                if (axis) {
                    sprite.setX(axis.x);
                    sprite.setY(axis.y);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(axis.x, axis.y * -1);
                    }
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_pose',
        },
        locate_time_to_pose: {
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
                params.getPoseNumber(),
                params.getPosePoint(),
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
                ],
                type: 'locate_time_to_pose',
            },
            paramsKeyMap: {
                TIME: 0,
                POSE: 1,
                POSE_POINT: 2,
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            func(sprite, script) {
                if (!script.isStart) {
                    const time = script.getNumberValue('TIME', script);
                    const frameCount = Math.floor(time * Entry.FPS);
                    const pose = script.getField('POSE', script);
                    const point = script.getField('POSE_POINT', script);

                    if (frameCount != 0) {
                        const axis = mediaPipeUtils.getPosePointAxis(pose, point);
                        if (axis) {
                            script.isStart = true;
                            script.frameCount = frameCount;
                            script.dX = (axis.x - sprite.getX()) / script.frameCount;
                            script.dY = (axis.y - sprite.getY()) / script.frameCount;
                        }
                    } else {
                        const axis = mediaPipeUtils.getPosePointAxis(pose, point);
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
            wikiClass: 'ai_utilize_pose',
        },
        axis_detected_pose: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                { ...params.getPoseNumber(), fontSize: 10 },
                { ...params.getPosePoint(), fontSize: 10 },
                { ...params.getAxis(), fontSize: 10 },
            ],
            events: {},
            def: {
                params: [null, null, null],
                type: 'axis_detected_pose',
            },
            paramsKeyMap: {
                POSE: 0,
                POSE_POINT: 1,
                AXIS: 2,
            },
            class: 'pose',
            isNotFor: ['poseLandmarker'],
            func(sprite, script) {
                const pose = script.getField('POSE', script);
                const point = script.getField('POSE_POINT', script);
                const axisName = script.getField('AXIS', script);
                const axis = mediaPipeUtils.getPosePointAxis(pose, point);
                if (axis) {
                    return axis[axisName] || 0;
                }
                return 0;
            },
            wikiClass: 'ai_utilize_pose',
        },
    };
};
