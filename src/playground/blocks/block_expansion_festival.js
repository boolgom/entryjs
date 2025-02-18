'use strict';

const PromiseManager = require('../../core/promiseManager');
const { callApi } = require('../../util/common');

function getLocationMap() {
    return {
        Seoul: {
            code: 1,
            sub: [
                '강남구',
                '강동구',
                '강북구',
                '강서구',
                '관악구',
                '광진구',
                '구로구',
                '금천구',
                '노원구',
                '도봉구',
                '동대문구',
                '동작구',
                '마포구',
                '서대문구',
                '서초구',
                '성동구',
                '성북구',
                '송파구',
                '양천구',
                '영등포구',
                '용산구',
                '은평구',
                '종로구',
                '중구',
                '중랑구',
            ],
        },
        Incheon: {
            code: 2,
            sub: [
                '강화군',
                '계양구',
                '남구',
                '남동구',
                '동구',
                '부평구',
                '서구',
                '연수구',
                '옹진군',
                '중구',
            ],
        },
        Daejeon: {
            code: 3,
            sub: ['대덕구', '동구', '서구', '유성구', '중구'],
        },
        Daegu: {
            code: 4,
            sub: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
        },
        Gwangju: {
            code: 5,
            sub: ['광산구', '남구', '동구', '북구', '서구'],
        },

        Busan: {
            code: 6,
            sub: [
                '강서구',
                '금정구',
                '기장군',
                '남구',
                '동구',
                '동래구',
                '부산진구',
                '북구',
                '사상구',
                '사하구',
                '서구',
                '수영구',
                '연제구',
                '영도구',
                '중구',
                '해운대구',
            ],
        },
        Ulsan: {
            code: 7,
            sub: ['중구', '남구', '동구', '북구', '울주군'],
        },
        Sejong: {
            code: 8,
            sub: ['세종특별자치시'],
        },
        'Gyeonggi-do': {
            code: 31,
            sub: [
                '가평군',
                '고양시',
                '과천시',
                '광명시',
                '광주시',
                '구리시',
                '군포시',
                '김포시',
                '남양주시',
                '동두천시',
                '부천시',
                '성남시',
                '수원시',
                '시흥시',
                '안산시',
                '안성시',
                '안양시',
                '양주시',
                '양평군',
                '여주시',
                '연천군',
                '오산시',
                '용인시',
                '의왕시',
                '의정부시',
                '이천시',
                '파주시',
                '평택시',
                '포천시',
                '하남시',
                '화성시',
            ],
        },
        Gangwon: {
            code: 32,
            sub: [
                '강릉시',
                '고성군',
                '동해시',
                '삼척시',
                '속초시',
                '양구군',
                '양양군',
                '영월군',
                '원주시',
                '인제군',
                '정선군',
                '철원군',
                '춘천시',
                '태백시',
                '평창군',
                '홍천군',
                '화천군',
                '횡성군',
            ],
        },
        'Chungcheongbuk-do': {
            code: 33,
            sub: [
                '괴산군',
                '단양군',
                '보은군',
                '영동군',
                '옥천군',
                '음성군',
                '제천시',
                '진천군',
                '청원군',
                '청주시',
                '충주시',
                '증평군',
            ],
        },
        'Chungcheongnam-do': {
            code: 34,
            sub: [
                '공주시',
                '금산군',
                '논산시',
                '당진시',
                '보령시',
                '부여군',
                '서산시',
                '서천군',
                '아산시',
                '예산군',
                '천안시',
                '청양군',
                '태안군',
                '홍성군',
                '계룡시',
            ],
        },
        'Gyeongsangbuk-do': {
            code: 35,
            sub: [
                '경산시',
                '경주시',
                '고령군',
                '구미시',
                '군위군',
                '김천시',
                '문경시',
                '봉화군',
                '상주시',
                '성주군',
                '안동시',
                '영덕군',
                '영양군',
                '영주시',
                '영천시',
                '예천군',
                '울릉군',
                '울진군',
                '의성군',
                '청도군',
                '청송군',
                '칠곡군',
                '포항시',
            ],
        },
        'Gyeongsangnam-do': {
            code: 36,
            sub: [
                '거제시',
                '거창군',
                '고성군',
                '김해시',
                '남해군',
                '마산시',
                '밀양시',
                '사천시',
                '산청군',
                '양산시',
                '의령군',
                '진주시',
                '진해시',
                '창녕군',
                '창원시',
                '통영시',
                '하동군',
                '함안군',
                '함양군',
                '합천군',
            ],
        },
        'Jeollabuk-do': {
            code: 37,
            sub: [
                '고창군',
                '군산시',
                '김제시',
                '남원시',
                '무주군',
                '부안군',
                '순창군',
                '완주군',
                '익산시',
                '임실군',
                '장수군',
                '전주시',
                '정읍시',
                '진안군',
            ],
        },
        'Jeollanam-do': {
            code: 38,
            sub: [
                '강진군',
                '고흥군',
                '곡성군',
                '광양시',
                '구례군',
                '나주시',
                '담양군',
                '목포시',
                '무안군',
                '보성군',
                '순천시',
                '신안군',
                '여수시',
                '영광군',
                '영암군',
                '완도군',
                '장성군',
                '장흥군',
                '진도군',
                '함평군',
                '해남군',
                '화순군',
            ],
        },
        Jeju: {
            code: 39,
            sub: ['남제주군', '북제주군', '서귀포시', '제주시'],
        },
    };
}

Entry.EXPANSION_BLOCK.festival = {
    name: 'festival',
    imageName: 'festival.png',
    title: {
        ko: '행사',
        en: 'festival',
        jp: 'イベント',
    },
    titleKey: 'template.festival_title_text',
    description: Lang.Msgs.expansion_festival_description,
    descriptionKey: 'Msgs.expansion_festival_description',
    isInitialized: false,
    init() {
        if (this.isInitialized) {
            return;
        }
        Entry.EXPANSION_BLOCK.festival.isInitialized = true;
    },
    api: '/api/expansionBlock/ko/festival',
    locationMap: getLocationMap(),
    infoTypeMap: {
        title: 'title',
        address: 'addr1',
        start_date: 'eventstartdate',
        end_date: 'eventenddate',
        coordinatex: 'mapx',
        coordinatey: 'mapy',
        area: 'sigungucode',
        homepage: 'homepage',
        overview: 'overview',
    },
    strip(html) {
        return Entry.Utils.extractTextFromHTML(html);
    },
    monthMap: {
        January: 1,
        'Febuary ': 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
    },
};

Entry.EXPANSION_BLOCK.festival.getBlocks = function() {
    const params = {
        getLocation(isPython) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.location_seoul, 'Seoul'],
                    [Lang.Blocks.location_gangwon, 'Gangwon'],
                    [Lang.Blocks.location_gyeonggi, 'Gyeonggi-do'],
                    [Lang.Blocks.location_gyeongsangnam, 'Gyeongsangnam-do'],
                    [Lang.Blocks.location_gyeongsangbuk, 'Gyeongsangbuk-do'],
                    [Lang.Blocks.location_gwangju, 'Gwangju'],
                    [Lang.Blocks.location_daegu, 'Daegu'],
                    [Lang.Blocks.location_daejeon, 'Daejeon'],
                    [Lang.Blocks.location_busan, 'Busan'],
                    [Lang.Blocks.location_sejong, 'Sejong'],
                    [Lang.Blocks.location_ulsan, 'Ulsan'],
                    [Lang.Blocks.location_incheon, 'Incheon'],
                    [Lang.Blocks.location_jeollanam, 'Jeollanam-do'],
                    [Lang.Blocks.location_jeollabuk, 'Jeollabuk-do'],
                    [Lang.Blocks.location_jeju, 'Jeju'],
                    [Lang.Blocks.location_chungcheongnam, 'Chungcheongnam-do'],
                    [Lang.Blocks.location_chungcheongbuk, 'Chungcheongbuk-do'],
                ],
                value: 'Seoul',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getMonth(isPython) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Menus.jan, 'January'],
                    [Lang.Menus.feb, 'Febuary '],
                    [Lang.Menus.mar, 'March'],
                    [Lang.Menus.apr, 'April'],
                    [Lang.Menus.may, 'May'],
                    [Lang.Menus.jun, 'June'],
                    [Lang.Menus.jul, 'July'],
                    [Lang.Menus.aug, 'August'],
                    [Lang.Menus.sep, 'September'],
                    [Lang.Menus.oct, 'October'],
                    [Lang.Menus.nov, 'November'],
                    [Lang.Menus.dec, 'December'],
                ],
                value: 'January',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getInfoType(isPython) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.EXPANSION_FESTIVAL_title, 'title'],
                    [Lang.Blocks.EXPANSION_FESTIVAL_area, 'area'],
                    [Lang.Blocks.EXPANSION_FESTIVAL_start_date, 'start_date'],
                    [Lang.Blocks.EXPANSION_FESTIVAL_end_date, 'end_date'],
                    [Lang.Blocks.EXPANSION_FESTIVAL_address, 'address'],
                    //[Lang.Blocks.EXPANSION_FESTIVAL_coordinate, 'coordinate'],
                    [Lang.Blocks.EXPANSION_FESTIVAL_overview, 'overview'],
                    [Lang.Blocks.EXPANSION_FESTIVAL_homepage, 'homepage'],
                ],
                value: 'title',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
    };

    const getDetailInfo = (contentid, defaultValue, infoType) => {
        const key = `festival.api.detail_${contentid}`;
        return new PromiseManager().Promise((resolve) => {
            callApi(key, { url: `${Entry.EXPANSION_BLOCK.festival.api}/${contentid}` })
                .then((response) => {
                    let item = response.data.response.body.items.item;
                    if (Array.isArray(item)) {
                        item = item[0];
                    }
                    if (item && item[infoType]) {
                        return resolve(Entry.EXPANSION_BLOCK.festival.strip(item[infoType]));
                    }
                    return resolve(defaultValue);
                })
                .catch(() => resolve(defaultValue));
        });
    };

    const getFestivalCount = (params, defaultValue) => {
        const key = `festival.api-${JSON.stringify(params)}`;
        return new PromiseManager().Promise((resolve) => {
            callApi(key, { url: Entry.EXPANSION_BLOCK.festival.api, params })
                .then((result) => {
                    if (result && result.hasOwnProperty('data')) {
                        return resolve(result?.data?.response?.body?.items?.item?.[0]?.totalCnt);
                    }
                    resolve(defaultValue);
                })
                .catch(() => resolve(defaultValue));
        });
    };

    const getFestivals = (number, params, defaultValue) => {
        if (number < 1) {
            return defaultValue;
        }

        const num = number % 10 || 10;
        params.page = Math.floor((number - 1) / 10 + 1);
        const key = `festival.api-${JSON.stringify(params)}`;
        return new PromiseManager().Promise((resolve) => {
            callApi(key, { url: Entry.EXPANSION_BLOCK.festival.api, params })
                .then((result) => {
                    const items = result?.data?.response?.body?.items?.item;
                    let item = null;
                    if (items.constructor == Array) {
                        item = items[num - 1];
                    } else {
                        item = items;
                    }
                    return resolve(item);
                })
                .catch(() => resolve(defaultValue));
        });
    };

    return {
        festival_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.festival_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'festival_title',
            },
            class: 'festival',
            isNotFor: ['festival'],
            events: {},
        },
        count_festival: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [params.getLocation(), params.getMonth()],
            events: {},
            def: {
                params: [params.getLocation().value, params.getMonth().value],
                type: 'count_festival',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value'],
                type: 'count_festival',
            },
            paramsKeyMap: {
                LOCATION: 0,
                MONTH: 1,
            },
            class: 'festival',
            isNotFor: ['festival'],
            func(sprite, script) {
                const defaultValue = 0;
                const params = {
                    area:
                        Entry.EXPANSION_BLOCK.festival.locationMap[
                            script.getField('LOCATION', script)
                        ].code,
                    month:
                        Entry.EXPANSION_BLOCK.festival.monthMap[script.getField('MONTH', script)],
                    list: 'N',
                };
                return getFestivalCount(params, defaultValue);
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Event.get_len(%1, %2)',
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getMonth(true)],
                    },
                ],
            },
            wikiClass: 'festival',
        },
        get_festival_info: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                params.getLocation(),
                params.getMonth(),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getInfoType(),
            ],
            events: {},
            def: {
                params: [
                    params.getLocation().value,
                    params.getMonth().value,
                    1,
                    params.getInfoType().value,
                ],
                type: 'get_festival_info',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value', 'D&value'],
                type: 'get_festival_info',
            },
            paramsKeyMap: {
                LOCATION: 0,
                MONTH: 1,
                NUMBER: 2,
                TYPE: 3,
            },
            class: 'festival',
            isNotFor: ['festival'],
            func(sprite, script) {
                const number = script.getStringValue('NUMBER', script);
                const type = script.getField('TYPE', script);
                const infoType = Entry.EXPANSION_BLOCK.festival.infoTypeMap[type];
                const location =
                    Entry.EXPANSION_BLOCK.festival.locationMap[script.getField('LOCATION', script)];
                const defaultValue = Lang.Blocks.no_data;
                const params = {
                    area: location.code,
                    month:
                        Entry.EXPANSION_BLOCK.festival.monthMap[script.getField('MONTH', script)],
                };

                return getFestivals(number, params, {}).then((festival) => {
                    switch (type) {
                        case 'area':
                            return location.sub[festival[infoType] - 1] || defaultValue;
                        case 'homepage':
                        case 'overview':
                            return getDetailInfo(festival.contentid, defaultValue, infoType);
                        default:
                            return festival[infoType] || defaultValue;
                    }
                });
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Event.get_info(%1, %2, %3, %4)',
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getMonth(true),
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            params.getInfoType(true),
                        ],
                    },
                ],
            },
            wikiClass: 'festival',
        },
    };
};
