'use strict';

Entry.getStartProject = function(mediaFilePath) {
    return {
        category: Lang.Menus.other,
        scenes: [
            {
                name: Lang.Blocks.SCENE + ' 1',
                id: '7dwq',
            },
        ],
        variables: [],
        objects: [
            {
                id: '7y0y',
                name: Lang.Blocks.entry_bot_name,
                label: {
                    ko: '엔트리봇',
                    en: 'Entrybot',
                },
                script: [
                    [
                        {
                            type: 'when_run_button_click',
                            x: 40,
                            y: 50,
                        },
                        {
                            type: 'repeat_basic',
                            statements: [[{ type: 'move_direction' }]],
                        },
                    ],
                ],
                selectedPictureId: 'vx80',
                objectType: 'sprite',
                rotateMethod: 'free',
                scene: '7dwq',
                sprite: {
                    sounds: [
                        {
                            duration: 1.3,
                            ext: '.mp3',
                            id: '8el5',
                            fileurl: mediaFilePath + 'media/bark.mp3',
                            name: Lang.Blocks.doggi_bark,
                            label: {
                                ko: '강아지 짖는소리',
                                en: "Doggi's Bark",
                            },
                        },
                    ],
                    pictures: [
                        {
                            id: 'vx80',
                            fileurl: mediaFilePath + 'media/entrybot1.png',
                            name: Lang.Blocks.walking_entryBot + '1',
                            scale: 100,
                            dimension: {
                                width: 284,
                                height: 350,
                            },
                        },
                        {
                            id: '4t48',
                            fileurl: mediaFilePath + 'media/entrybot2.png',
                            name: Lang.Blocks.walking_entryBot + '2',
                            scale: 100,
                            dimension: {
                                width: 284,
                                height: 350,
                            },
                        },
                    ],
                },
                entity: {
                    x: 0,
                    y: 0,
                    regX: 142,
                    regY: 175,
                    scaleX: 0.3154574132492113,
                    scaleY: 0.3154574132492113,
                    rotation: 0,
                    direction: 90,
                    width: 284,
                    height: 350,
                    visible: true,
                },
                lock: false,
                active: true,
            },
        ],
        expansionBlocks: [],
        speed: 60,
    };
};
