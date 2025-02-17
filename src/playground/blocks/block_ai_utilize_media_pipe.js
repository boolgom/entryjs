import MediaPipeUtils, { flipState } from '../../util/mediaPipeUtils';
import _clamp from 'lodash/clamp';

const mediaPipeUtils = MediaPipeUtils.getInstance();
Entry.MediaPipeUtils = mediaPipeUtils;

const flipStateTransitions = {
    hflip: [flipState.HORIZONTAL, flipState.NORMAL, flipState.BOTH, flipState.VERTICAL],
    vflip: [flipState.VERTICAL, flipState.BOTH, flipState.NORMAL, flipState.HORIZONTAL],
};

module.exports = {
    getBlocks() {
        const params = {
            getCommonIndicator() {
                return {
                    type: 'Indicator',
                    img: 'block_icon/ai_video_icon.svg',
                    size: 11,
                };
            },
            getCameraOrder() {
                return {
                    type: 'DropdownDynamic',
                    menuName: 'connectedCameras',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                    arrowColor: EntryStatic.colorSet.common.WHITE,
                };
            },
            getVideoFlipOptions() {
                return {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.video_left_right, 'hflip'],
                        [Lang.Blocks.video_top_bottom, 'vflip'],
                    ],
                    value: 'hflip',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                    arrowColor: EntryStatic.colorSet.common.WHITE,
                };
            },
            getOnOff() {
                return {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.video_show_video, 'on'],
                        [Lang.Blocks.video_hide_video, 'off'],
                    ],
                    value: 'on',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                    arrowColor: EntryStatic.colorSet.common.WHITE,
                };
            },
        };

        return {
            media_pipe_title: {
                template: '%1',
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.Blocks.media_pipe_title_text,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'media_pipe_title',
                },
                class: 'media_pipe',
                isNotFor: [
                    'gestureRecognition',
                    'poseLandmarker',
                    'faceLandmarker',
                    'objectDetector',
                ],
                events: {},
            },
            media_pipe_video_screen: {
                color: EntryStatic.colorSet.block.default.AI_UTILIZE,
                outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                skeleton: 'basic',
                statements: [],
                params: [params.getOnOff(), params.getCommonIndicator()],
                events: {},
                def: {
                    type: 'media_pipe_video_screen',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'media_pipe',
                isNotFor: [
                    'gestureRecognition',
                    'poseLandmarker',
                    'faceLandmarker',
                    'objectDetector',
                ],
                async func(sprite, script) {
                    const value = script.getField('VALUE');
                    if (!mediaPipeUtils.isInitialized) {
                        await mediaPipeUtils.initialize();
                    }
                    mediaPipeUtils.cameraOnOff(value);
                    return script.callReturn();
                },
                wikiClass: 'ai_utilize_video',
            },
            media_pipe_switch_camera: {
                color: EntryStatic.colorSet.block.default.AI_UTILIZE,
                outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                skeleton: 'basic',
                statements: [],
                params: [params.getCameraOrder(), params.getCommonIndicator()],
                events: {},
                def: {
                    type: 'media_pipe_switch_camera',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'media_pipe',
                isNotFor: [
                    'gestureRecognition',
                    'poseLandmarker',
                    'faceLandmarker',
                    'objectDetector',
                ],
                async func(sprite, script) {
                    const value = script.getField('VALUE');
                    return await mediaPipeUtils.changeSource(value);
                },
                wikiClass: 'ai_utilize_video',
            },
            check_connected_camera: {
                color: EntryStatic.colorSet.block.default.AI_UTILIZE,
                outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                skeleton: 'basic_boolean_field',
                statements: [],
                params: [],
                events: {},
                def: {
                    type: 'check_connected_camera',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'media_pipe',
                isNotFor: [
                    'gestureRecognition',
                    'poseLandmarker',
                    'faceLandmarker',
                    'objectDetector',
                ],
                async func(sprite, script) {
                    return mediaPipeUtils.videoInputList.length;
                },
                wikiClass: 'ai_utilize_video',
            },
            media_pipe_flip_camera: {
                color: EntryStatic.colorSet.block.default.AI_UTILIZE,
                outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                skeleton: 'basic',
                statements: [],
                params: [params.getVideoFlipOptions(), params.getCommonIndicator()],
                events: {},
                def: {
                    type: 'media_pipe_flip_camera',
                },
                paramsKeyMap: {
                    TARGET: 0,
                },
                class: 'media_pipe',
                isNotFor: [
                    'gestureRecognition',
                    'poseLandmarker',
                    'faceLandmarker',
                    'objectDetector',
                ],
                async func(sprite, script) {
                    const target = script.getField('TARGET');
                    if (!mediaPipeUtils.isInitialized) {
                        await mediaPipeUtils.initialize();
                    }
                    const flipState = flipStateTransitions[target][mediaPipeUtils.flipState];
                    mediaPipeUtils.setFlipState(flipState);
                    return script.callReturn();
                },
                wikiClass: 'ai_utilize_video',
            },
            media_pipe_set_opacity_camera: {
                color: EntryStatic.colorSet.block.default.AI_UTILIZE,
                outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                        value: '0',
                    },
                    params.getCommonIndicator(),
                ],
                events: {},
                def: {
                    type: 'media_pipe_set_opacity_camera',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'media_pipe',
                isNotFor: [
                    'gestureRecognition',
                    'poseLandmarker',
                    'faceLandmarker',
                    'objectDetector',
                ],
                async func(sprite, script) {
                    const value = _clamp(script.getNumberValue('VALUE'), 0, 100);
                    if (!mediaPipeUtils.isInitialized) {
                        await mediaPipeUtils.initialize();
                    }
                    mediaPipeUtils.setOpacityCamera(value);
                    return script.callReturn();
                },
                wikiClass: 'ai_utilize_video',
            },
            media_pipe_motion_value: {
                color: EntryStatic.colorSet.block.default.AI_UTILIZE,
                outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.video_motion_onself, 'self'],
                            [Lang.Blocks.video_motion_onscreen, 'screen'],
                        ],
                        value: 'self',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.video_motion_scale, 'total'],
                            [Lang.Blocks.video_motion_direction_horizontal, 'x'],
                            [Lang.Blocks.video_motion_direction_vertical, 'y'],
                        ],
                        value: 'total',
                        fontSize: 10,
                        bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                ],
                events: {},
                def: {
                    type: 'media_pipe_motion_value',
                },
                paramsKeyMap: {
                    TARGET: 0,
                    TYPE: 1,
                },
                class: 'media_pipe',
                isNotFor: [
                    'gestureRecognition',
                    'poseLandmarker',
                    'faceLandmarker',
                    'objectDetector',
                ],
                async func(sprite, script) {
                    const target = script.getField('TARGET');
                    const type = script.getField('TYPE');
                    if (!mediaPipeUtils.isInitialized) {
                        await mediaPipeUtils.initialize();
                    }
                    let detected = mediaPipeUtils.totalMotions;
                    if (target === 'self') {
                        detected = await mediaPipeUtils.motionDetect(sprite);
                        if (!detected) {
                            return 0;
                        }
                    }
                    if (type === 'total') {
                        return _clamp(detected.total / 10, 0, 100000).toString();
                    }
                    try {
                        let rawX = detected.direction.x;
                        if (!mediaPipeUtils.isFlipState('horizontal')) {
                            rawX *= -1;
                        }

                        let rawY = detected.direction.y;
                        if (mediaPipeUtils.isFlipState('vertical')) {
                            rawY *= -1;
                        }
                        const absX = Math.abs(rawX);
                        const absY = Math.abs(rawY);
                        if (absX < 20 && absY < 20) {
                            return 0;
                        }
                        if (type === 'x') {
                            return rawX.toFixed(1).toString();
                        } else if (type === 'y') {
                            return rawY.toFixed(1).toString();
                        }
                        return 0;
                    } catch (err) {
                        console.log(detected, err);
                    }
                },
                wikiClass: 'ai_utilize_video',
            },
        };
    },
};
