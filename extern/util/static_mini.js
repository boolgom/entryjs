'use strict';

/* eslint-disable */
var EntryStatic = {
    isPracticalCourse: true,
    fontFamily: "NanumGothic, 'Nanum Gothic'",
    exportBlockFontFamily:
        "NanumGothic, 'Nanum Gothic', 'NanumGothic', '나눔고딕','NanumGothicWeb', '맑은 고딕', 'Malgun Gothic', Dotum",
    fontOffsetY: -2.5,
    heightLetter: 'M',
    objectTypes: ['sprite', 'textBox'],
};

EntryStatic.usageList = [
    'usage_event',
    'usage_signal',
    'usage_scene',
    'usage_repeat',
    'usage_condition_repeat',
    'usage_condition',
    'usage_clone',
    'usage_arrow_move',
    'usage_rotation',
    'usage_coordinate',
    'usage_shape',
    'usage_speak',
    'usage_picture_effect',
    'usage_textBox',
    'usage_draw',
    'usage_sound',
    'usage_confirm',
    'usage_comp_operation',
    'usage_logical_operation',
    'usage_math_operation',
    'usage_random',
    'usage_timer',
    'usage_variable',
    'usage_list',
    'usage_ask_answer',
    'usage_function',
    'usage_arduino',
];

EntryStatic.conceptList = [
    'concept_resource_analytics',
    'concept_individual',
    'concept_abstractive',
    'concept_procedual',
    'concept_automation',
    'concept_simulation',
    'concept_parallel',
];

EntryStatic.subjectList = [
    'subject_korean',
    'subject_mathmatics',
    'subject_social',
    'subject_science',
    'subject_english',
    'subject_courtesy',
    'subject_music',
    'subject_paint',
    'subject_athletic',
    'subject_progmatic',
];

EntryStatic.lectureLevels = [1, 2, 3];

// EntryStatic.lectureLevels = ['level_high', 'level_mid','level_row'];

EntryStatic.lectureGrades = [
    'e_1',
    'e_2',
    'e_3',
    'e_4',
    'e_5',
    'e_6',
    'm_1',
    'm_2',
    'm_3',
    'general',
];

EntryStatic.categoryList = [
    'category_game',
    'category_animation',
    'category_media_art',
    'category_physical',
    'category_etc',
];

EntryStatic.requiredTimes = [1, 2, 3, 4, 5];

EntryStatic.searchProjectOption = [
    {
        key: 'search_updated',
        lang: 'search_updated',
        value: 'updated',
    },
    {
        key: 'search_recent',
        lang: 'search_recent',
        value: 'recent',
    },
    {
        key: 'search_complexity',
        lang: 'search_complexity',
        value: 'complexity',
    },
    {
        key: 'search_staffPicked',
        lang: 'search_staffPicked',
        value: 'staffPicked',
    },
    {
        key: 'search_childCnt',
        lang: 'search_childCnt',
        value: 'childCnt',
    },
    {
        key: 'search_likeCnt',
        lang: 'search_likeCnt',
        value: 'recentLikeCnt',
    },
];

EntryStatic.getAllBlocks = function() {
    return [
        {
            category: 'start',
            blocks: [
                'when_run_button_click',
                'when_some_key_pressed',
                'mouse_clicked',
                'mouse_click_cancled',
                'when_object_click',
                'when_message_cast',
                'message_cast',
            ],
        },
        {
            category: 'flow',
            blocks: [
                'wait_second',
                'repeat_basic',
                'repeat_inf',
                'repeat_while_true',
                'stop_repeat',
                '_if',
                'if_else',
                'wait_until_true',
            ],
        },
        {
            category: 'moving',
            blocks: [
                'move_direction',
                'bounce_wall',
                'move_x',
                'move_y',
                'move_xy_time',
                'locate_xy',
                'locate_xy_time',
                'locate',
                'locate_object_time',
                'rotate_relative',
                'direction_relative',
                'rotate_absolute',
                'direction_absolute',
                'see_angle_object',
            ],
        },
        {
            category: 'looks',
            blocks: [
                'show',
                'hide',
                'dialog_time',
                'dialog',
                'change_to_some_shape',
                'change_to_next_shape',
                'add_effect_amount',
                'change_effect_amount',
                'erase_all_effects',
                'change_scale_size',
                'set_scale_size',
                'change_object_index',
            ],
        },
        {
            category: 'brush',
            blocks: [
                'brush_stamp',
                'start_drawing',
                'stop_drawing',
                'set_color',
                'change_thickness',
                'set_thickness',
                'brush_erase_all',
            ],
        },
        {
            category: 'text',
            blocks: [
                'text_write',
                'text_append',
                'text_prepend',
                'text_change_effect',
                'text_change_font',
                'text_change_font_color',
                'text_change_bg_color',
                'text_flush',
            ],
        },
        {
            category: 'sound',
            blocks: [
                'sound_something_with_block',
                'sound_something_wait_with_block',
                'sound_volume_change',
                'sound_volume_set',
            ],
        },
        {
            category: 'judgement',
            blocks: [
                'is_clicked',
                'is_press_some_key',
                'reach_something',
                'boolean_basic_operator',
                'boolean_and_or',
                'boolean_not',
            ],
        },
        {
            category: 'calc',
            blocks: [
                'calc_basic',
                'calc_rand',
                'coordinate_object',
                'quotient_and_mod',
                'get_project_timer_value',
                'choose_project_timer_action',
                'set_visible_project_timer',
                'length_of_string',
                'combine_something',
                'char_at',
                'substring',
                'replace_string',
            ],
        },
        {
            category: 'variable',
            blocks: [
                'variableAddButton',
                'ask_and_wait',
                'get_canvas_input_value',
                'set_visible_answer',
                'get_variable',
                'change_variable',
                'set_variable',
                'show_variable',
                'hide_variable',
            ],
        },
        {
            category: 'ai_utilize',
            blocks: [
                'aiUtilizeBlockAddButton',
                'aiUtilizeModelTrainButton',
                'learning_title_image',
                'learning_title_speech',
                'learning_title_text',
                'learning_title_number',
                'learning_title_regression',
                'learning_title_cluster',
                'learning_title_logistic_regression',
                'learning_title_decisiontree',
                'learning_title_svm',
                'retrain_model',
                'model_is_trained',
                'set_train_visible',
                'set_train_chart',
                'set_regression_option',
                'get_regression_predict_1',
                'get_regression_predict_2',
                'get_regression_predict_3',
                'get_regression_predict_4',
                'get_regression_predict_5',
                'get_regression_predict_6',
                'get_regression_accuracy',
                'set_logistic_regression_option',
                'set_logistic_regression_optimizer',
                'get_logistic_regression_probability_1',
                'get_logistic_regression_probability_2',
                'get_logistic_regression_probability_3',
                'get_logistic_regression_probability_4',
                'get_logistic_regression_probability_5',
                'get_logistic_regression_probability_6',
                'set_decisiontree_option',
                'set_decisiontree_tree',
                'set_svm_option',
                'set_kernel_linear',
                'set_kernel_option',
                'is_result_1',
                'is_result_2',
                'is_result_3',
                'is_result_4',
                'is_result_5',
                'is_result_6',
                'get_predict_1',
                'get_predict_2',
                'get_predict_3',
                'get_predict_4',
                'get_predict_5',
                'get_predict_6',
                'get_result_info',
                'set_cluster_option_k',
                'set_cluster_option_centroids',
                'get_cluster_centriod_count',
                'get_cluster_centriod_value',
                'get_cluster_centriod_index_1',
                'get_cluster_centriod_index_2',
                'get_cluster_centriod_index_3',
                'get_cluster_centriod_index_4',
                'get_cluster_centriod_index_5',
                'get_cluster_centriod_index_6',
                'set_number_learning_option_k',
                'get_number_learning_predict_1',
                'get_number_learning_predict_2',
                'get_number_learning_predict_3',
                'get_number_learning_predict_4',
                'get_number_learning_predict_5',
                'get_number_learning_predict_6',
                'get_number_learning_predict_param_1',
                'get_number_learning_predict_param_2',
                'get_number_learning_predict_param_3',
                'get_number_learning_predict_param_4',
                'get_number_learning_predict_param_5',
                'get_number_learning_predict_param_6',
                'is_number_learning_group_1',
                'is_number_learning_group_2',
                'is_number_learning_group_3',
                'is_number_learning_group_4',
                'is_number_learning_group_5',
                'is_number_learning_group_6',
                'insert_data_for_test',
                'video_capture_for_image_test',
                'insert_text_block_for_test',
                'test_result',
                'accuracy_of_result',
                'is_group',
                'audio_title',
                'check_microphone',
                'get_microphone_volume',
                'speech_to_text_title',
                'speech_to_text_convert',
                'timed_speech_to_text_convert',
                'set_visible_speech_to_text',
                'speech_to_text_get_value',
                'tts_title',
                'read_text',
                'read_text_wait_with_block',
                'set_tts_property',
                'translate_title',
                'get_translated_string',
                'check_language',
                'video_title',
                'video_draw_webcam',
                'video_change_cam',
                'video_check_webcam',
                'video_flip_camera',
                'video_set_camera_opacity_option',
                'video_motion_value',
                'video_toggle_model',
                'video_is_model_loaded',
                'video_object_detected',
                'video_number_detect',
                'video_toggle_ind',
                'video_body_part_coord',
                'video_face_part_coord',
                'video_detected_face_info',
                'media_pipe_title',
                'media_pipe_video_screen',
                'media_pipe_switch_camera',
                'check_connected_camera',
                'media_pipe_flip_camera',
                'media_pipe_set_opacity_camera',
                'media_pipe_motion_value',
                'hand_detection_title',
                'when_hand_detection',
                'hand_detection',
                'draw_detected_hand',
                'check_detected_hand',
                'count_detected_hand',
                'locate_to_hand',
                'locate_time_to_hand',
                'axis_detected_hand',
                'is_which_hand',
                'get_which_hand',
                'is_which_gesture',
                'get_which_gesture',
                'pose_landmarker_title',
                'when_pose_landmarker',
                'pose_landmarker',
                'draw_detected_pose',
                'check_detected_pose',
                'count_detected_pose',
                'locate_to_pose',
                'locate_time_to_pose',
                'axis_detected_pose',
                'face_landmarker_title',
                'when_face_landmarker',
                'face_landmarker',
                'draw_detected_face',
                'check_detected_face',
                'count_detected_face',
                'locate_to_face',
                'locate_time_to_face',
                'check_detected_gender',
                'check_compare_age',
                'check_detected_emotion',
                'axis_detected_face',
                'get_detected_face_value',
                'object_detector_title',
                'when_object_detector',
                'object_detector',
                'draw_detected_object',
                'check_detected_object',
                'count_detected_object',
                'is_detected_among_objects',
            ],
        },
        {
            category: 'hw_motor',
            visible: false,
            blocks: [
                'practical_course_dummy',
                // 'practical_course_move_for_secs',
                // 'practical_course_move_for_secs2',
                // 'practical_course_move_for',
                // 'practical_course_move_for2',
                // 'practical_course_stop_for',
                // 'practical_course_set_servo2',
                //roborobo
                // 'roborobo_move_for_secs',
                // 'roborobo_move_for',
                // 'roborobo_turn_for',
                // 'roborobo_stop_for',
                //robotis
                // 'robotis_aux_move_for',
                // 'robotis_aux_stop_for',
                // 'robotis_set_servo_joint',
                // 'robotis_set_servo_wheel',
                // 'robotis_move_for_secs',
                // 'robotis_move_for_secs_dream',
                // 'robotis_aux_move_for_dream',
                // 'robotis_aux_stop_for_dream',
                // //'robotis_set_servo_wheel_dream',
                // //'robotis_set_servo_joint_dream',
                // 'robotis_set_servo_mode_dream',
                // 'robotis_set_servo_speed_dream',
                // 'robotis_set_servo_position_dream',
                // 'robotis_servo_stop_for_dream',
            ].concat(EntryStatic.DynamicPracticalHardwareBlocks['hw_motor']),
        },
        {
            category: 'hw_melody',
            visible: false,
            blocks: [
                'practical_course_dummy',
                // 'practical_course_melody_note_for',
                //robotis
                // 'robotis_melody_note_for',
            ].concat(EntryStatic.DynamicPracticalHardwareBlocks['hw_melody']),
        },
        {
            category: 'hw_sensor',
            visible: false,
            blocks: [
                'practical_course_dummy',
                // 'practical_course_touch_value',
                // 'practical_course_touch_value_boolean',
                // 'practical_course_light_value',
                // 'practical_course_light_value_boolean',
                // 'practical_course_sound_value',
                // 'practical_course_sound_value_boolean',
                // 'practical_course_irs_value',
                // 'practical_course_irs_value_boolean',
                //roborobo
                // 'roborobo_touch_value',
                // 'roborobo_touch_value_boolean',
                // 'roborobo_light_value',
                // 'roborobo_light_value_boolean',
                // 'roborobo_sound_value',
                // 'roborobo_sound_value_boolean',
                // 'roborobo_irs_value',
                // 'roborobo_irs_value_boolean',
                //robotis
                // 'robotis_touch_value',
                // 'robotis_touch_value_boolean',
                // 'robotis_irs_value',
                // 'robotis_irs_value_boolean',
                // 'robotis_light_value',
                // 'robotis_light_value_boolean',
                // 'robotis_detectedsound_value',
                // 'robotis_detectingsound_value',
                // 'robotis_detectedsound_value_boolean',
                // 'robotis_detectingsound_value_boolean',
                // 'robotis_detectedsound_value_init',
                // 'robotis_color_value',
                // 'robotis_color_value_boolean',
                // 'robotis_humidity_value',
                // 'robotis_humidity_value_boolean',
                // 'robotis_temperature_value',
                // 'robotis_temperature_value_boolean',
                // 'robotis_userbutton_value',
                // 'robotis_userbutton_value_boolean',
                // 'robotis_touch_value_dream',
                // 'robotis_touch_value_boolean_dream',
                // 'robotis_irs_value_dream',
                // 'robotis_irs_value_boolean_dream',
                // 'robotis_irsInner_value_dream',
                // 'robotis_light_value_dream',
                // 'robotis_light_value_boolean_dream',
                // 'robotis_color_value_dream',
                // 'robotis_color_value_boolean_dream',
                // 'robotis_humidity_value_dream',
                // 'robotis_humidity_value_boolean_dream',
                // 'robotis_temperature_value_dream',
                // 'robotis_temperature_value_boolean_dream',
            ].concat(EntryStatic.DynamicPracticalHardwareBlocks['hw_sensor']),
        },
        {
            category: 'hw_led',
            visible: false,
            blocks: [
                'practical_course_dummy',
                // 'practical_course_diode_secs_toggle',
                // 'practical_course_diode_toggle',
                // 'practical_course_diode_inout_toggle',
                // 'practical_course_diode_set_output',
                // 'practical_course_diode_input_value',
                //roborobo
                // 'roborobo_diode_secs_toggle',
                // 'roborobo_diode_toggle',
                // 'roborobo_diode_inout_toggle',
                // 'roborobo_diode_set_output',
                // 'roborobo_diode_input_value',
                //robotis
                // 'robotis_set_led',
                // 'robotis_set_led_dream',
            ].concat(EntryStatic.DynamicPracticalHardwareBlocks['hw_led']),
        },
        {
            category: 'hw_robot',
            blocks: [
                'robot_reconnect',
                'arduino_open',
                'arduino_cloud_pc_open',
                'arduino_connect',
                'arduino_download_connector',
                // 'download_guide',
                'arduino_connected',
            ],
        },
        {
            category: 'arduino',
            visible: false,
            blocks: EntryStatic.DynamicHardwareBlocks,
        },
    ];
};
EntryStatic.DynamicHardwareBlocks = [];
EntryStatic.discussCategories = [
    // 'notice',
    'qna',
    'tips',
    'free',
    'report',
    'notice',
];

EntryStatic.artCategories = [
    {
        key: 'art_category_',
        lang: 'art_category_all',
        value: '',
    },
    {
        key: 'art_category_게임',
        lang: 'art_category_game',
        value: '게임',
    },
    {
        key: 'art_category_애니메이션',
        lang: 'art_category_animation',
        value: '애니메이션',
    },
    {
        key: 'art_category_미디어아트',
        lang: 'art_category_media',
        value: '미디어아트',
    },
    {
        key: 'art_category_피지컬',
        lang: 'art_category_physical',
        value: '피지컬',
    },
    {
        key: 'art_category_기타',
        lang: 'art_category_etc',
        value: '기타',
    },
];

EntryStatic.artSortOptions = [
    {
        key: 'art_sort_updated',
        lang: 'art_sort_updated',
        value: 'updated',
    },
    {
        key: 'art_sort_visit',
        lang: 'art_sort_visit',
        value: 'visit',
    },
    {
        key: 'art_sort_likeCnt',
        lang: 'art_sort_likeCnt',
        value: 'likeCnt',
    },
    {
        key: 'art_sort_comment',
        lang: 'art_sort_comment',
        value: 'comment',
    },
];

EntryStatic.discussSortOptions = [
    {
        lang: 'discuss_sort_created',
        value: 'created',
    },
    {
        lang: 'discuss_sort_visit',
        value: 'visit',
    },
    {
        lang: 'discuss_sort_likesLength',
        value: 'likesLength',
    },
    {
        lang: 'discuss_sort_commentsLength',
        value: 'commentsLength',
    },
];
EntryStatic.discussPeriodOptions = [
    {
        key: 'discuss_period_',
        lang: 'discuss_period_all',
        value: '',
    },
    {
        key: 'discuss_period_1',
        lang: 'discuss_period_day',
        value: '1',
    },
    {
        key: 'discuss_period_7',
        lang: 'discuss_period_week',
        value: '7',
    },
    {
        key: 'discuss_period_30',
        lang: 'discuss_period_month',
        value: '30',
    },
    {
        key: 'discuss_period_90',
        lang: 'discuss_period_three_month',
        value: '90',
    },
];

EntryStatic.artPeriodOptions = [
    {
        key: 'art_period_',
        lang: 'art_period_all',
        value: '',
    },
    {
        key: 'art_period_1',
        lang: 'art_period_day',
        value: '1',
    },
    {
        key: 'art_period_7',
        lang: 'art_period_week',
        value: '7',
    },
    {
        key: 'art_period_30',
        lang: 'art_period_month',
        value: '30',
    },
    {
        key: 'art_period_90',
        lang: 'art_period_three_month',
        value: '90',
    },
];

EntryStatic.getCategoryByBlock = function(blockName) {
    if (!blockName) {
        return false;
    }
    let allBlocks = EntryStatic.getAllBlocks();
    for (let i = 0, len = allBlocks.length; i < len; i++) {
        let blocks = allBlocks[i].blocks;
        if (blocks.indexOf(blockName) > -1) {
            return allBlocks[i].category;
        }
    }
    return false;
};

EntryStatic.objectMainCategories = [
    'entrybot_friends',
    'people',
    'animal',
    'plant',
    'vehicles',
    'architect',
    'food',
    'environment',
    'stuff',
    'fantasy',
    'interface',
    'background',
];

EntryStatic.objectSubCategories = {
    entrybot_friends: [],
    people: [],
    animal: ['animal_flying', 'animal_land', 'animal_water', 'animal_others'],
    plant: ['plant_flower', 'plant_grass', 'plant_tree', 'plant_others'],
    vehicles: ['vehicles_flying', 'vehicles_land', 'vehicles_water', 'vehicles_others'],
    architect: ['architect_building', 'architect_monument', 'architect_others'],
    food: ['food_vegetables', 'food_meat', 'food_drink', 'food_others'],
    environment: ['environment_nature', 'environment_space', 'environment_others'],
    stuff: ['stuff_living', 'stuff_hobby', 'stuff_others'],
    fantasy: [],
    interface: ['interface_website', 'interface_game', 'interface_others'],
    background: [
        'background_outdoor',
        'background_indoor',
        'background_nature',
        'background_others',
    ],
};

EntryStatic.fonts = [
    {
        name: Lang.Fonts.batang,
        family: 'KoPub Batang',
        url: '/css/kopubbatang.css',
        visible: false,
    },
    {
        name: Lang.Fonts.jeju_hallasan,
        family: 'Jeju Hallasan',
        url: '/css/jejuhallasan.css',
        visible: false,
    },
    {
        name: Lang.Fonts.gothic,
        family: 'Nanum Gothic',
        url: '/css/nanumgothic.css',
        visible: true,
    },
    {
        name: Lang.Fonts.myeongjo,
        family: 'Nanum Myeongjo',
        url: '/css/nanummyeongjo.css',
        visible: true,
    },
    {
        name: Lang.Fonts.nanumbarunpen,
        family: 'Nanum Barun Pen',
        url: '/css/nanumbarunpen.css',
        visible: true,
    },
    {
        name: Lang.Fonts.pen_script,
        family: 'Nanum Pen Script',
        url: '/css/nanumpenscript.css',
        visible: true,
    },
    {
        name: Lang.Fonts.square_round,
        family: 'NanumSquareRound',
        url: '/css/square_round.css',
        visible: true,
    },
    {
        name: Lang.Fonts.maruburi,
        family: 'MaruBuri',
        url: '/css/maruburi.css',
        visible: true,
    },
    {
        name: Lang.Fonts.notosans,
        family: 'NotoSans',
        url: '/css/notosans.css',
        visible: true,
    },
    {
        name: Lang.Fonts.d2coding,
        family: 'D2 Coding',
        url: '/css/d2coding.css',
        visible: true,
    },
    {
        name: Lang.Fonts.jalnan,
        family: 'yg-jalnan',
        url: '/css/jalnan.css',
        visible: true,
    },
    {
        name: Lang.Fonts.designhouse,
        family: 'designhouseOTFLight00',
        url: '/css/designhouse.css',
        visible: true,
    },
    {
        name: Lang.Fonts.dunggeunmo,
        family: 'DungGeunMo',
        url: '/css/dunggeunmo.css',
        visible: true,
    },
    {
        name: Lang.Fonts.uhbeemysen,
        family: 'UhBeemysen',
        url: '/css/uhbeemysen.css',
        visible: true,
    },
    {
        name: Lang.Fonts.sd_comic_stencil,
        family: 'SDComicStencil',
        style: {
            backgroundColor: '#f7fcff',
            padding: '17px 22px 14px 16px',
            margin: '0px',
            borderTop: 'solid 1px #d6e9f4',
        },
        url: '/css/SDComicStencil.css',
        visible: true,
    },
    {
        name: Lang.Fonts.sd_childfundkorea,
        family: 'SDChildfundkorea',
        style: {
            backgroundColor: '#f7fcff',
            padding: '17px 22px 14px 16px',
            margin: '0px',
            borderTop: 'solid 1px #d6e9f4',
        },
        url: '/css/SDChildfundkorea.css',
        visible: true,
    },
    {
        name: Lang.Fonts.sd_cinema_theater,
        family: 'SDCinemaTheater',
        style: {
            backgroundColor: '#f7fcff',
            padding: '17px 22px 14px 16px',
            margin: '0px',
            borderTop: 'solid 1px #d6e9f4',
        },
        url: '/css/SDCinemaTheater.css',
        visible: true,
    },
    {
        name: Lang.Fonts.sd_mapssi,
        family: 'SDMapssi',
        style: {
            backgroundColor: '#f7fcff',
            padding: '17px 22px 14px 16px',
            margin: '0px',
            borderTop: 'solid 1px #d6e9f4',
        },
        url: '/css/SDMapssi.css',
        visible: true,
    },
    {
        name: Lang.Fonts.sd_shabang,
        family: 'SDShabang',
        style: {
            backgroundColor: '#f7fcff',
            padding: '17px 22px 14px 16px',
            margin: '0px',
            borderTop: 'solid 1px #d6e9f4',
        },
        url: '/css/SDShabang.css',
        visible: true,
    },
    {
        name: Lang.Fonts.sd_woodcarving,
        family: 'SDWoodcarving',
        style: {
            backgroundColor: '#f7fcff',
            padding: '17px 22px 14px 16px',
            margin: '0px',
            borderTop: 'solid 1px #d6e9f4',
        },
        url: '/css/SDWoodcarving.css',
        visible: true,
    },
    {
        name: Lang.Fonts.sd_yongbi,
        family: 'SDYongbi',
        style: {
            backgroundColor: '#f7fcff',
            padding: '17px 22px 14px 16px',
            margin: '0px',
            borderTop: 'solid 1px #d6e9f4',
        },
        url: '/css/SDYongbi.css',
        visible: true,
    },
];

EntryStatic.colorSet = {
    arrow: {
        default: {
            DEFAULT: '#FFFFFF',
            START: '#FFFFFF',
            FLOW: '#3A71BC',
            MOVING: '#8641B6',
            LOOKS: '#FFFFFF',
            TEXT: '#DC9C32',
            SOUND: '#83A617',
            JUDGE: '#89A1F7',
            CALC: '#E8B349',
            VARIABLE: '#CE38CE',
            HARDWARE: '#FFFFFF',
            EXPANSION: '#FF8888',
            AI_UTILIZE: '#FF8888',
        },
    },
    block: {
        default: {
            START: '#00b400',
            FLOW: '#19baea',
            MOVING: '#ad3efb',
            LOOKS: '#ff3a61',
            BRUSH: '#ff9b00',
            TEXT: '#e43500',
            SOUND: '#67b100',
            JUDGE: '#4562f5',
            CALC: '#f4af18',
            VARIABLE: '#dd47d8',
            ANALYSIS: '#25aeff',
            FUNC: '#de5c04',
            HARDWARE: '#00b6b1',
            EXPANSION: '#ef6d6d',
            AI_UTILIZE: '#8222ff',
            HIDDEN: '#8aa3b2',
            AI_LEARNING: '#8222ff',
        },
        lighten: {
            START: '#3bce3b',
            FLOW: '#6dddfe',
            MOVING: '#bd65fb',
            LOOKS: '#ff5577',
            BRUSH: '#ffb250',
            TEXT: '#ff6739',
            SOUND: '#7ecc12',
            JUDGE: '#99adff',
            CALC: '#ffde82',
            VARIABLE: '#f778f3',
            ANALYSIS: '#d6e9f4',
            FUNC: '#ff7b22',
            HARDWARE: '#78d5d3',
            EXPANSION: '#ffaeae',
            AI_UTILIZE: '#ffaeae',
            HIDDEN: '#ffaeae',
            AI_LEARNING: '#8222ff',
        },
        darken: {
            START: '#009400',
            FLOW: '#1498c0',
            MOVING: '#8b19db',
            LOOKS: '#c72042',
            BRUSH: '#fc6500',
            TEXT: '#ad2800',
            SOUND: '#508a00',
            JUDGE: '#1b3ad8',
            CALC: '#ff7f00',
            VARIABLE: '#b819b3',
            ANALYSIS: '#1592ff',
            FUNC: '#a14100',
            HARDWARE: '#008380',
            EXPANSION: '#c63f3f',
            AI_UTILIZE: '#670bdd',
            HIDDEN: '#728997',
            AI_LEARNING: '#670bdd',
        },
        emphasize: {
            '#00b400': '#5BC982', //START
            '#19baea': '#62A5F4', //FLOW
            '#ad3efb': '#C08FF7', //MOVING
            '#ff3a61': '#F46487', //LOOKS
            '#fc7e01': '#FFB05A', //BRUSH
            '#e43500': '#F2C670', //TEXT
            '#67b100': '#C4DD31', //SOUND
            '#4562f5': '#C0CBFF', //JUDGE
            '#f4af18': '#FCDA90', //CALC
            '#dd47d8': '#F279F2', //VARIABLE
            '#de5c04': '#DD884E', //FUNC
            '#00b6b1': '#09BAB5', //HARDWARE
            //Not guided emphasize color for EXPANSION
        },
    },
    common: {
        WHITE: '#FFFFFF',
        DARK: '#000000',
        TRANSPARENT: 'transparent',
        BUTTON: '#4f80ff',
        BUTTON_BACKGROUND: '#eee',
        TEXT: '#333',
        ALERT: '#FB2729',
    },
};

EntryStatic.initOptions = {
    listEnable: false,
    functionEnable: false,
    sceneEditable: false,
};

EntryStatic.hwCategoryList = ['hw_motor', 'hw_melody', 'hw_sensor', 'hw_led'];

EntryStatic.DynamicPracticalHardwareBlocks = {};

EntryStatic.hwCategoryList.forEach((category) => {
    EntryStatic.DynamicPracticalHardwareBlocks[category] = [];
});

EntryStatic.hwMiniSupportList = [
    'neobot',
    'roborobo_schoolkit',
    'robotis_openCM70',
    'robotis_openCM70EDU',
    'robotis_Dream',
];

EntryStatic.COMMAND_TYPES = {
    addThread: 101,
    destroyThread: 102,
    destroyBlock: 103,
    recoverBlock: 104,
    insertBlock: 105,
    separateBlock: 106,
    moveBlock: 107,
    cloneBlock: 108,
    uncloneBlock: 109,
    scrollBoard: 110,
    setFieldValue: 111,

    selectObject: 201,

    do: 301,
    undo: 302,
    redo: 303,
};

EntryStatic.getDefaultFontFamily = function() {
    const localLang = Lang || {};
    const type = localLang.type;
    const fallbackType = localLang.fallbackType;
    const langType = type || fallbackType || 'en';
    switch (langType) {
        default:
            return "NanumGothic, 'Nanum Gothic', 나눔고딕, NanumGothicWeb, '맑은 고딕', 'Malgun Gothic', Dotum";
    }
};

// for server node js code
if (typeof exports == 'object') {
    exports.blockInfo = EntryStatic.blockInfo;
    exports.getAllBlocks = EntryStatic.getAllBlocks;
    exports.getCategoryByBlock = EntryStatic.getCategoryByBlock;
    exports.EntryStatic = EntryStatic;
}
