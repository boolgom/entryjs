import MediaPipeUtils from '../../util/mediaPipeUtils';

const mediaPipeUtils = MediaPipeUtils.getInstance();
Entry.AI_UTILIZE_BLOCK.faceLandmarker = {
    name: 'faceLandmarker',
    imageName: 'faceLandmarker.svg',
    category: 'video',
    title: {
        ko: '얼굴 인식',
        en: 'Face Detection',
    },
    titleKey: 'Workspace.face_landmarker_title_text',
    description: Lang.Msgs.ai_utilize_face_landmarker_description,
    descriptionKey: 'Msgs.ai_utilize_face_landmarker_description',
    isInitialized: false,
    async init() {
        await mediaPipeUtils.initialize();
        Entry.AI_UTILIZE_BLOCK.faceLandmarker.isInitialized = true;
    },
    destroy() {
        mediaPipeUtils.destroy();
        Entry.AI_UTILIZE_BLOCK.faceLandmarker.isInitialized = false;
    },
};

Entry.AI_UTILIZE_BLOCK.faceLandmarker.getBlocks = function() {
    const params = {
        getEventIndicator() {
            return {
                type: 'Indicator',
                img: 'block_icon/start_icon_face.svg',
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
                img: 'block_icon/ai_face_icon.svg',
                size: 11,
            };
        },
        getFaceNumber() {
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
        getGender() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.video_gender.female, 'female'],
                    [Lang.video_gender.male, 'male'],
                ],
                value: 'female',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getFaceCategory() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.video_gender, 'gender'],
                    [Lang.Blocks.video_age, 'age'],
                    [Lang.Blocks.video_emotion, 'emotion'],
                ],
                value: 'gender',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getOperators() {
            return {
                type: 'Dropdown',
                options: [
                    ['=', 'EQUAL'],
                    ['!=', 'NOT_EQUAL'],
                    ['>', 'GREATER'],
                    ['<', 'LESS'],
                    ['≥', 'GREATER_OR_EQUAL'],
                    ['≤', 'LESS_OR_EQUAL'],
                ],
                value: 'EQUAL',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getEmotions() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.video_emotion_params.angry, 'angry'],
                    [Lang.video_emotion_params.disgust, 'disgust'],
                    [Lang.video_emotion_params.fear, 'fear'],
                    [Lang.video_emotion_params.happy, 'happy'],
                    [Lang.video_emotion_params.neutral, 'neutral'],
                    [Lang.video_emotion_params.sad, 'sad'],
                    [Lang.video_emotion_params.surprise, 'surprise'],
                ],
                value: 'angry',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
        getFacePoint() {
            return {
                type: 'Dropdown',
                options: [
                    [Lang.video_body_coord_params.left_eye, 374],
                    [Lang.video_body_coord_params.right_eye, 145],
                    [Lang.video_body_coord_params.nose, 4],
                    [Lang.video_body_coord_params.left_mouth, 291],
                    [Lang.video_body_coord_params.right_mouth, 61],
                    [Lang.video_body_coord_params.upper_lip, 0],
                    [Lang.video_body_coord_params.lower_lip, 17],
                ],
                value: 374,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                dropdownSync: 'handPoint',
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
        face_landmarker_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.Blocks.face_landmarker_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'face_landmarker_title',
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            events: {},
        },
        when_face_landmarker: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_event',
            statements: [],
            params: [params.getEventIndicator()],
            events: {},
            def: {
                params: [null],
                type: 'when_face_landmarker',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            event: 'when_face_landmarker',
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_face',
        },
        face_landmarker: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getStartStop(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'face_landmarker',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'start') {
                    await mediaPipeUtils.startFaceLandmarker(value);
                } else {
                    await mediaPipeUtils.stopFaceLandmarker(value);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_face',
        },
        draw_detected_face: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getShowHide(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'draw_detected_face',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'show') {
                    mediaPipeUtils.changeDrawDetectedFaceLandmarker(true);
                } else {
                    mediaPipeUtils.changeDrawDetectedFaceLandmarker(false);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_face',
        },
        check_detected_face: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'check_detected_face',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                return mediaPipeUtils.isPrevFaceLandmarker;
            },
            wikiClass: 'ai_utilize_face',
        },
        count_detected_face: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'count_detected_face',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                return mediaPipeUtils.countDetectedFace || 0;
            },
            wikiClass: 'ai_utilize_face',
        },
        locate_to_face: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getFaceNumber(), params.getFacePoint(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'locate_to_face',
            },
            paramsKeyMap: {
                FACE: 0,
                FACE_POINT: 1,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                const face = script.getField('FACE');
                const point = script.getField('FACE_POINT');
                const axis = mediaPipeUtils.getFacePointAxis(face, point);
                if (axis) {
                    sprite.setX(axis.x);
                    sprite.setY(axis.y);
                    if (sprite.brush && !sprite.brush.stop) {
                        sprite.brush.lineTo(axis.x, axis.y * -1);
                    }
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_face',
        },
        locate_time_to_face: {
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
                params.getFaceNumber(),
                params.getFacePoint(),
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
                type: 'locate_time_to_face',
            },
            paramsKeyMap: {
                TIME: 0,
                FACE: 1,
                FACE_POINT: 2,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                if (!script.isStart) {
                    const time = script.getNumberValue('TIME', script);
                    const frameCount = Math.floor(time * Entry.FPS);
                    const face = script.getField('FACE', script);
                    const point = script.getField('FACE_POINT', script);

                    if (frameCount != 0) {
                        const axis = mediaPipeUtils.getFacePointAxis(face, point);
                        if (axis) {
                            script.isStart = true;
                            script.frameCount = frameCount;
                            script.dX = (axis.x - sprite.getX()) / script.frameCount;
                            script.dY = (axis.y - sprite.getY()) / script.frameCount;
                        }
                    } else {
                        const axis = mediaPipeUtils.getFacePointAxis(face, point);
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
            wikiClass: 'ai_utilize_face',
        },
        check_detected_gender: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                { ...params.getFaceNumber(), fontSize: 10 },
                { ...params.getGender(), fontSize: 10 },
            ],
            events: {},
            def: {
                params: [null, null],
                type: 'check_detected_gender',
            },
            paramsKeyMap: {
                FACE: 0,
                GENDER: 1,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                const face = script.getField('FACE', script);
                const gender = script.getField('GENDER', script);
                const result = mediaPipeUtils.getFaceGender(face);
                return result === gender;
            },
            wikiClass: 'ai_utilize_face',
        },
        check_compare_age: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                { ...params.getFaceNumber(), fontSize: 10 },
                { ...params.getOperators(), fontSize: 10 },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    null,
                    {
                        type: 'number',
                        params: ['10'],
                    },
                ],
                type: 'check_compare_age',
            },
            paramsKeyMap: {
                FACE: 0,
                OPERATOR: 1,
                AGE: 2,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                const face = script.getField('FACE', script);
                const operator = script.getField('OPERATOR', script);
                const age = script.getNumberValue('AGE', script);
                const result = mediaPipeUtils.getFaceAge(face);

                switch (operator) {
                    case 'EQUAL':
                        return result === age;
                    case 'NOT_EQUAL':
                        return result != age;
                    case 'GREATER':
                        return result > age;
                    case 'LESS':
                        return result < age;
                    case 'GREATER_OR_EQUAL':
                        return result >= age;
                    case 'LESS_OR_EQUAL':
                        return result <= age;
                }
            },
            wikiClass: 'ai_utilize_face',
        },
        check_detected_emotion: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                { ...params.getFaceNumber(), fontSize: 10 },
                { ...params.getEmotions(), fontSize: 10 },
            ],
            events: {},
            def: {
                params: [null, null],
                type: 'check_detected_emotion',
            },
            paramsKeyMap: {
                FACE: 0,
                EMOTION: 1,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                const face = script.getField('FACE', script);
                const emotion = script.getField('EMOTION', script);
                const result = mediaPipeUtils.getFaceEmotion(face);
                return result === emotion;
            },
            wikiClass: 'ai_utilize_face',
        },
        axis_detected_face: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                { ...params.getFaceNumber(), fontSize: 10 },
                { ...params.getFacePoint(), fontSize: 10 },
                { ...params.getAxis(), fontSize: 10 },
            ],
            events: {},
            def: {
                params: [null, null, null],
                type: 'axis_detected_face',
            },
            paramsKeyMap: {
                FACE: 0,
                FACE_POINT: 1,
                AXIS: 2,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                const face = script.getField('FACE', script);
                const point = script.getField('FACE_POINT', script);
                const axisName = script.getField('AXIS', script);
                const axis = mediaPipeUtils.getFacePointAxis(face, point);
                if (axis) {
                    return axis[axisName] || 0;
                }
                return 0;
            },
            wikiClass: 'ai_utilize_face',
        },
        get_detected_face_value: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                { ...params.getFaceNumber(), fontSize: 10 },
                { ...params.getFaceCategory(), fontSize: 10 },
            ],
            events: {},
            def: {
                params: [null, null],
                type: 'get_detected_face_value',
            },
            paramsKeyMap: {
                FACE: 0,
                CATEGORY: 1,
            },
            class: 'face',
            isNotFor: ['faceLandmarker'],
            func(sprite, script) {
                const face = script.getField('FACE', script);
                const category = script.getField('CATEGORY', script);

                if (!mediaPipeUtils.isPrevFaceLandmarker) {
                    if (['gender', 'emotion'].includes(category)) {
                        return 'null';
                    } else {
                        return 0;
                    }
                }

                switch (category) {
                    case 'gender':
                        return (
                            Lang.video_gender[mediaPipeUtils.getFaceGender(face)] ||
                            Lang.Blocks.unknown
                        );
                    case 'age':
                        return mediaPipeUtils.getFaceAge(face) || 0;
                    case 'emotion':
                        return (
                            Lang.video_emotion_params[mediaPipeUtils.getFaceEmotion(face)] ||
                            Lang.Blocks.unknown
                        );
                }
            },
            wikiClass: 'ai_utilize_face',
        },
    };
};
