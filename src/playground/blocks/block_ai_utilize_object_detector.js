import MediaPipeUtils from '../../util/mediaPipeUtils';
import _get from 'lodash/get';

const mediaPipeUtils = MediaPipeUtils.getInstance();
Entry.AI_UTILIZE_BLOCK.objectDetector = {
    name: 'objectDetector',
    imageName: 'objectDetector.svg',
    category: 'video',
    title: {
        ko: '사물 인식',
        en: 'Object Detection',
    },
    titleKey: 'Workspace.object_detector_title_text',
    description: Lang.Msgs.ai_utilize_object_detector_description,
    descriptionKey: 'Msgs.ai_utilize_object_detector_description',
    isInitialized: false,
    async init() {
        await mediaPipeUtils.initialize();
        Entry.AI_UTILIZE_BLOCK.objectDetector.isInitialized = true;
    },
    destroy() {
        mediaPipeUtils.destroy();
        Entry.AI_UTILIZE_BLOCK.objectDetector.isInitialized = false;
    },
};

Entry.AI_UTILIZE_BLOCK.objectDetector.getBlocks = function() {
    const params = {
        getEventIndicator() {
            return {
                type: 'Indicator',
                img: 'block_icon/start_icon_object.svg',
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
                img: 'block_icon/ai_object_icon.svg',
                size: 11,
            };
        },
        getObjectNumber() {
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
        getObjectList() {
            return {
                type: 'DropdownExtra',
                options: [
                    [Lang.video_object_params.person, 'person'],
                    [Lang.video_object_params.bicycle, 'bicycle'],
                    [Lang.video_object_params.car, 'car'],
                    [Lang.video_object_params.motorcycle, 'motorcycle'],
                    [Lang.video_object_params.airplane, 'airplane'],
                    [Lang.video_object_params.bus, 'bus'],
                    [Lang.video_object_params.train, 'train'],
                    [Lang.video_object_params.truck, 'truck'],
                    [Lang.video_object_params.boat, 'boat'],
                    [Lang.video_object_params['traffic light'], 'traffic light'],
                    [Lang.video_object_params['fire hydrant'], 'fire hydrant'],
                    [Lang.video_object_params['stop sign'], 'stop sign'],
                    [Lang.video_object_params['parking meter'], 'parking meter'],
                    [Lang.video_object_params.bench, 'bench'],
                    [Lang.video_object_params.bird, 'bird'],
                    [Lang.video_object_params.cat, 'cat'],
                    [Lang.video_object_params.dog, 'dog'],
                    [Lang.video_object_params.horse, 'horse'],
                    [Lang.video_object_params.sheep, 'sheep'],
                    [Lang.video_object_params.cow, 'cow'],
                    [Lang.video_object_params.elephant, 'elephant'],
                    [Lang.video_object_params.bear, 'bear'],
                    [Lang.video_object_params.zebra, 'zebra'],
                    [Lang.video_object_params.giraffe, 'giraffe'],
                    [Lang.video_object_params.backpack, 'backpack'],
                    [Lang.video_object_params.umbrella, 'umbrella'],
                    [Lang.video_object_params.handbag, 'handbag'],
                    [Lang.video_object_params.tie, 'tie'],
                    [Lang.video_object_params.suitcase, 'suitcase'],
                    [Lang.video_object_params.frisbee, 'frisbee'],
                    [Lang.video_object_params.skis, 'skis'],
                    [Lang.video_object_params.snowboard, 'snowboard'],
                    [Lang.video_object_params['sports ball'], 'sports ball'],
                    [Lang.video_object_params.kite, 'kite'],
                    [Lang.video_object_params['baseball bat'], 'baseball bat'],
                    [Lang.video_object_params['baseball glove'], 'baseball glove'],
                    [Lang.video_object_params.skateboard, 'skateboard'],
                    [Lang.video_object_params.surfboard, 'surfboard'],
                    [Lang.video_object_params['tennis racket'], 'tennis racket'],
                    [Lang.video_object_params.bottle, 'bottle'],
                    [Lang.video_object_params['wine glass'], 'wine glass'],
                    [Lang.video_object_params.cup, 'cup'],
                    [Lang.video_object_params.fork, 'fork'],
                    [Lang.video_object_params.knife, 'knife'],
                    [Lang.video_object_params.spoon, 'spoon'],
                    [Lang.video_object_params.bowl, 'bowl'],
                    [Lang.video_object_params.banana, 'banana'],
                    [Lang.video_object_params.apple, 'apple'],
                    [Lang.video_object_params.sandwich, 'sandwich'],
                    [Lang.video_object_params.orange, 'orange'],
                    [Lang.video_object_params.broccoli, 'broccoli'],
                    [Lang.video_object_params.carrot, 'carrot'],
                    [Lang.video_object_params['hot dog'], 'hot dog'],
                    [Lang.video_object_params.pizza, 'pizza'],
                    [Lang.video_object_params.donut, 'donut'],
                    [Lang.video_object_params.cake, 'cake'],
                    [Lang.video_object_params.chair, 'chair'],
                    [Lang.video_object_params.couch, 'couch'],
                    [Lang.video_object_params['potted plant'], 'potted plant'],
                    [Lang.video_object_params.bed, 'bed'],
                    [Lang.video_object_params['dining table'], 'dining table'],
                    [Lang.video_object_params.toilet, 'toilet'],
                    [Lang.video_object_params.tv, 'tv'],
                    [Lang.video_object_params.laptop, 'laptop'],
                    [Lang.video_object_params.mouse, 'mouse'],
                    [Lang.video_object_params.remote, 'remote'],
                    [Lang.video_object_params.keyboard, 'keyboard'],
                    [Lang.video_object_params['cell phone'], 'cell phone'],
                    [Lang.video_object_params.microwave, 'microwave'],
                    [Lang.video_object_params.oven, 'oven'],
                    [Lang.video_object_params.toaster, 'toaster'],
                    [Lang.video_object_params.sink, 'sink'],
                    [Lang.video_object_params.refrigerator, 'refrigerator'],
                    [Lang.video_object_params.book, 'book'],
                    [Lang.video_object_params.clock, 'clock'],
                    [Lang.video_object_params.vase, 'vase'],
                    [Lang.video_object_params.scissors, 'scissors'],
                    [Lang.video_object_params['teddy bear'], 'teddy bear'],
                    [Lang.video_object_params['hair drier'], 'hair drier'],
                    [Lang.video_object_params.toothbrush, 'toothbrush'],
                ],
                value: 'bicycle',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.AI_UTILIZE,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
        },
    };
    return {
        object_detector_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.Blocks.object_detector_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'object_detector_title',
            },
            class: 'object',
            isNotFor: ['objectDetector'],
            events: {},
        },
        when_object_detector: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_event',
            statements: [],
            params: [params.getEventIndicator()],
            events: {},
            def: {
                params: [null],
                type: 'when_object_detector',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            event: 'when_object_detector',
            class: 'object',
            isNotFor: ['objectDetector'],
            func(sprite, script) {
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_object',
        },
        object_detector: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getStartStop(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'object_detector',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'object',
            isNotFor: ['objectDetector'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'start') {
                    await mediaPipeUtils.startObjectDetector(value);
                } else {
                    await mediaPipeUtils.stopObjectDetector(value);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_object',
        },
        draw_detected_object: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [params.getShowHide(), params.getCommonIndicator()],
            events: {},
            def: {
                type: 'draw_detected_object',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'object',
            isNotFor: ['objectDetector'],
            async func(sprite, script) {
                const value = script.getField('VALUE');
                if (!mediaPipeUtils.isInitialized) {
                    await mediaPipeUtils.initialize();
                }
                if (value === 'show') {
                    mediaPipeUtils.changeDrawDetectedObjectDetector(true);
                } else {
                    mediaPipeUtils.changeDrawDetectedObjectDetector(false);
                }
                return script.callReturn();
            },
            wikiClass: 'ai_utilize_object',
        },
        check_detected_object: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'check_detected_object',
            },
            paramsKeyMap: {},
            class: 'object',
            isNotFor: ['objectDetector'],
            func(sprite, script) {
                return mediaPipeUtils.isPrevObjectDetector;
            },
            wikiClass: 'ai_utilize_object',
        },
        count_detected_object: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'count_detected_object',
            },
            paramsKeyMap: {},
            class: 'object',
            isNotFor: ['objectDetector'],
            func(sprite, script) {
                return mediaPipeUtils.countDetectedObject || 0;
            },
            wikiClass: 'ai_utilize_object',
        },
        is_detected_among_objects: {
            color: EntryStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: EntryStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [{ ...params.getObjectList(), fontSize: 10 }],
            events: {},
            def: {
                type: 'is_detected_among_objects',
            },
            paramsKeyMap: {
                TARGET: 0,
            },
            class: 'object',
            isNotFor: ['objectDetector'],
            func(sprite, script) {
                const target = script.getField('TARGET');
                const objectDetectorResult = mediaPipeUtils.prevObjectDetectorResult;
                const detections = _get(objectDetectorResult, 'detections');
                if (detections) {
                    const isFound = detections.some((detect) =>
                        detect.categories.some((category) => category.categoryName === target)
                    );
                    return isFound;
                }
                return false;
            },
            wikiClass: 'ai_utilize_object',
        },
    };
};
