'use strict';
const { getStateOptions, getCityOptions, locationData } = require('../../util/location');
const { callApi } = require('../../util/common');

function resolveData(weatherData, type, dateStr) {
    if (type === 'now') {
        return weatherData[Object.keys(weatherData)[0]];
    } else if (type === 'hour') {
        return weatherData[dateStr];
    } else {
        return weatherData[Entry.EXPANSION_BLOCK.weather.getDate(dateStr)];
    }
}

Entry.EXPANSION_BLOCK.weather = {
    isInitialized: false,
    api: '/api/expansionBlock/weather/',
    date: new Date(),
    apiFail: {},
    name: 'weather',
    imageName: 'weather.png',
    title: {
        ko: '날씨',
        en: 'weather',
        jp: '拡張ブロックを追加する',
    },
    titleKey: 'template.weather_title_text',
    description: Lang.Msgs.expansion_weather_description,
    descriptionKey: 'Msgs.expansion_weather_description',
    init() {
        if (this.isInitialized) {
            return;
        }
        Entry.EXPANSION_BLOCK.weather.date = new Date();
        Entry.EXPANSION_BLOCK.weather.getData('week', 'Seoul', 'today');
        Entry.EXPANSION_BLOCK.weather.getData('hour', 'Seoul', '00');
        Entry.EXPANSION_BLOCK.weather.getData('now', 'Seoul');
        Entry.EXPANSION_BLOCK.weather.isInitialized = true;
    },
    getCityCode(location) {
        let cityCode = null;
        if (typeof location === 'string') {
            cityCode = this.locationMap[location].code;
        } else {
            if (location.sub == locationData.initialData[1]) {
                cityCode = this.locationMap[location.parent].code;
            } else {
                cityCode = this.locationMap[location.parent].sub[location.sub];
            }
        }
        return cityCode;
    },
    async getData(type, location, dateStr) {
        let cityCode = null;
        if (typeof location === 'string') {
            cityCode = this.locationMap[location].code;
        } else {
            if (location.sub == locationData.initialData[1]) {
                cityCode = this.locationMap[location.parent].code;
            } else {
                cityCode = this.locationMap[location.parent].sub[location.sub];
            }
        }

        const url = this.api + type;
        try {
            const response = await callApi(url, { url });
            Entry.EXPANSION_BLOCK.weather.apiFail[type] = false;
            return resolveData(response.data[cityCode], type, dateStr);
        } catch (e) {
            Entry.EXPANSION_BLOCK.weather.apiFail[type] = { error: e };
            return Entry.EXPANSION_BLOCK.weather.defaultData;
        }
    },
    async getDataWithCityCode(type, cityCode, dateStr) {
        const url = this.api + type;
        try {
            const response = await callApi(url, { url });
            Entry.EXPANSION_BLOCK.weather.apiFail[type] = false;
            return resolveData(response.data[cityCode], type, dateStr);
        } catch (e) {
            Entry.EXPANSION_BLOCK.weather.apiFail[type] = { error: e };
            return Entry.EXPANSION_BLOCK.weather.defaultData;
        }
    },
    checkWeather(sky_code, weather) {
        if (Entry.EXPANSION_BLOCK.weather.apiFail.week) {
            return true;
        }

        const skyCodeMap = {
            '1': 'sunny', //"맑음",
            '2': 'partly_cloudy', //"구름조금",
            '3': 'cloudy', //"흐림",
            '4': 'rainy', //"비",
            '5': 'snowy', //"눈",
            '6': 'sleet', //"눈비",

            '7': 'rainy', //"소나기",
            '8': 'snowy', //"소낙눈",
            '9': 'cloudy', //"안개",
            '10': 'rainy', //"뇌우",
            '11': 'cloudy', //"차차 흐려짐",
            '12': 'rainy', //"흐려져 뇌우",
            '13': 'rainy', //"흐려져 비",
            '14': 'snowy', //"흐려져 눈",
            '15': 'sleet', //"흐려져 눈비",
            '16': 'cloudy', //"흐린 후 갬",
            '17': 'rainy', //"뇌우 후 갬",
            '18': 'rainy', //"비 후 갬",
            '19': 'snowy', //"눈 후 갬",
            '20': 'sleet', //"눈비 후 갬",
            '21': 'mostly_cloudy', //"구름많음",
            '22': 'cloudy',
        };

        if (skyCodeMap[sky_code]) {
            return skyCodeMap[sky_code] === weather;
        } else {
            return 'sunny' === weather;
        }
    },
    checkFineDust(pm10, finedust) {
        if (Entry.EXPANSION_BLOCK.weather.apiFail.now) {
            return true;
        }

        const fineDustMap = {
            good: { min: 0, max: 30 },
            normal: { min: 31, max: 80 },
            bad: { min: 81, max: 150 },
            very_bad: { min: 150, max: 9999 },
        };

        for (const key in fineDustMap) {
            if (fineDustMap[key].min <= pm10 && pm10 <= fineDustMap[key].max) {
                return key === finedust;
            }
        }
        return 'very_bad' === finedust;
    },
    getDate(key) {
        Entry.EXPANSION_BLOCK.weather.date = Entry.EXPANSION_BLOCK.weather.date || new Date();
        const date = new Date(Entry.EXPANSION_BLOCK.weather.date);
        switch (key) {
            case 'yesterday':
                date.setDate(date.getDate() - 1);
                break;
            case 'today':
                break;
            case 'tomorrow':
                date.setDate(date.getDate() + 1);
                break;
            case 'After_2_days':
                date.setDate(date.getDate() + 2);
                break;
            case 'After_3_days':
                date.setDate(date.getDate() + 3);
                break;
            case 'After_4_days':
                date.setDate(date.getDate() + 4);
                break;
            case 'After_5_days':
                date.setDate(date.getDate() + 5);
                break;
            case 'After_6_days':
                date.setDate(date.getDate() + 6);
                break;
            default:
                break;
        }
        return date
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');
    },
    locationMap: {
        Seoul: {
            code: '1100000000',
            sub: {
                jongno_gu: '1111000000',
                jung_gu: '1114000000',
                yongsan_gu: '1117000000',
                seongdong_gu: '1120000000',
                gwangjin_gu: '1121500000',
                dongdaemun_gu: '1123000000',
                jungnang_gu: '1126000000',
                seongbuk_gu: '1129000000',
                gangbuk_gu: '1130500000',
                dobong_gu: '1132000000',
                nowon_gu: '1135000000',
                eunpyeong_gu: '1138000000',
                seodaemun_gu: '1141000000',
                mapo_gu: '1144000000',
                yangcheon_gu: '1147000000',
                gangseo_gu: '1150000000',
                guro_gu: '1153000000',
                geumcheon_gu: '1154500000',
                yeongdeungpo_gu: '1156000000',
                dongjak_gu: '1159000000',
                gwanak_gu: '1162000000',
                seocho_gu: '1165000000',
                gangnam_gu: '1168000000',
                songpa_gu: '1171000000',
                gangdong_gu: '1174000000',
            },
        },
        Busan: {
            code: '2600000000',
            sub: {
                jung_gu: '2611000000',
                seo_gu: '2614000000',
                dong_gu: '2617000000',
                yeongdo_gu: '2620000000',
                busanjin_gu: '2623000000',
                dongnae_gu: '2626000000',
                nam_gu: '2629000000',
                buk_gu: '2632000000',
                haeundae_gu: '2635000000',
                saha_gu: '2638000000',
                geumjeong_gu: '2641000000',
                gangseo_gu: '2644000000',
                yeonje: '2647000000',
                suyeong_gu: '2650000000',
                sasang_gu: '2653000000',
                gijang: '2671000000',
            },
        },
        Daegu: {
            code: '2700000000',
            sub: {
                jung_gu: '2711000000',
                dong_gu: '2714000000',
                seo_gu: '2717000000',
                nam_gu: '2720000000',
                buk_gu: '2723000000',
                suseong_gu: '2726000000',
                dalseo_gu: '2729000000',
                dalseong: '2771000000',
                gunwi: '2772000000',
            },
        },
        Incheon: {
            code: '2800000000',
            sub: {
                jung_gu: '2811000000',
                dong_gu: '2814000000',
                nam_gu: '2817000000',
                yeonsu_gu: '2818500000',
                namdong_gu: '2820000000',
                bupyeong_gu: '2823700000',
                gyeyang_gu: '2824500000',
                seo_gu: '2826000000',
                ganghwa: '2871000000',
                ongjin_gun: '2872000000',
            },
        },
        Gwangju: {
            code: '2900000000',
            sub: {
                dong_gu: '2911000000',
                seo_gu: '2914000000',
                nam_gu: '2915500000',
                buk_gu: '2917000000',
                gwangsan_gu: '2920000000',
            },
        },
        Daejeon: {
            code: '3000000000',
            sub: {
                dong_gu: '3011000000',
                jung_gu: '3014000000',
                western: '3017000000',
                yuseong_gu: '3020000000',
                daedeok_gu: '3023000000',
            },
        },
        Ulsan: {
            code: '3100000000',
            sub: {
                jung_gu: '3111000000',
                nam_gu: '3114000000',
                dong_gu: '3117000000',
                buk_gu: '3120000000',
                ulju: '3171000000',
            },
        },
        Sejong: {
            code: '3600000000',
            sub: {},
        },

        'Gyeonggi-do': {
            code: '4100000000',
            sub: {
                suwon_si: '4111000000',
                seongnam: '4113000000',
                uijeongbu: '4115000000',
                anyang_si: '4117000000',
                bucheon_si: '4119000000',
                gwangmyeong_si: '4121000000',
                pyeongtaek_si: '4122000000',
                dongducheon_si: '4125000000',
                ansan_si: '4127000000',
                goyang_si: '4128000000',
                gwacheon_si: '4129000000',
                guri: '4131000000',
                namyangju_si: '4136000000',
                osan: '4137000000',
                siheung: '4139000000',
                gunpo_si: '4141000000',
                uiwang_si: '4143000000',
                hanam: '4145000000',
                yongin_si: '4146000000',
                paju: '4148000000',
                icheon: '4150000000',
                anseong_si: '4155000000',
                gimpo: '4157000000',
                hwaseong_si: '4159000000',
                gwangju: '4161000000',
                yangju_si: '4163000000',
                pocheon: '4165000000',
                yeoju: '4167000000',
                yeoncheon_gun: '4180000000',
                gapyeong_gun: '4182000000',
                yangpyeong: '4183000000',
            },
        },
        Gangwon: {
            code: '5100000000',
            sub: {
                chuncheon: '5111000000',
                wonju: '5113000000',
                gangneung_si: '5115000000',
                donghae: '5117000000',
                taebaek_si: '5119000000',
                'sokcho city': '5121000000',
                samcheok_si: '5123000000',
                hongcheon: '5172000000',
                hoengseong_gun: '5173000000',
                yeongwol_gun: '5175000000',
                pyeongchang: '5176000000',
                jeongseon: '5177000000',
                cheolwon: '5178000000',
                hwacheon: '5179000000',
                yanggu: '5180000000',
                inje: '5181000000',
                goseong: '5182000000',
                yangyang: '5183000000',
            },
        },
        'Chungcheongbuk-do': {
            code: '4300000000',
            sub: {
                cheongju: '4311000000',
                chungju: '4313000000',
                jecheon: '4315000000',
                boeun: '4372000000',
                okcheon: '4373000000',
                yeongdong: '4374000000',
                jeungpyeong: '4374500000',
                jincheon: '4375000000',
                goesan: '4376000000',
                eumseong: '4377000000',
                danyang: '4380000000',
            },
        },
        'Chungcheongnam-do': {
            code: '4400000000',
            sub: {
                cheonan: '4413000000',
                gongju: '4415000000',
                boryeong: '4418000000',
                asan: '4420000000',
                seosan: '4421000000',
                nonsan: '4423000000',
                gyeryong: '4425000000',
                dangjin: '4427000000',
                geumsan: '4471000000',
                buyeo: '4476000000',
                seocheon: '4477000000',
                cheongyang: '4479000000',
                hongseong: '4480000000',
                yesan: '4481000000',
                taean: '4482500000',
            },
        },
        'Jeollabuk-do': {
            code: '4500000000',
            sub: {
                jeonju: '4511000000',
                gunsan_si: '4513000000',
                iksan: '4514000000',
                jeongeup: '4518000000',
                namwon: '4519000000',
                gimje_si: '4521000000',
                wanju: '4571000000',
                jinan: '4572000000',
                muju: '4573000000',
                jangsu: '4574000000',
                imsil: '4575000000',
                sunchang: '4577000000',
                gochang: '4579000000',
                buan: '4580000000',
            },
        },
        // 'Jeollabuk-do': {
        //     code: '5200000000',
        //     sub: {
        //         jeonju: '5211000000',
        //         gunsan_si: '5213000000',
        //         iksan: '5214000000',
        //         jeongeup: '5218000000',
        //         namwon: '5219000000',
        //         gimje_si: '5221000000',
        //         wanju: '5271000000',
        //         jinan: '5272000000',
        //         muju: '5273000000',
        //         jangsu: '5274000000',
        //         imsil: '5275000000',
        //         sunchang: '5277000000',
        //         gochang: '5279000000',
        //         buan: '5280000000',
        //     },
        // },
        'Jeollanam-do': {
            code: '4600000000',
            sub: {
                mokpo: '4611000000',
                yosu: '4613000000',
                suncheon_si: '4615000000',
                naju: '4617000000',
                gwangyang_si: '4623000000',
                damyang: '4671000000',
                gokseong: '4672000000',
                gurye: '4673000000',
                goheung: '4677000000',
                boseong: '4678000000',
                hwasun: '4679000000',
                jangheung: '4680000000',
                gangjin: '4681000000',
                haenam: '4682000000',
                yeongam: '4683000000',
                muan: '4684000000',
                hampyeong: '4686000000',
                yeonggwang: '4687000000',
                jangseong: '4688000000',
                wando: '4689000000',
                jindo: '4690000000',
                sinan: '4691000000',
            },
        },
        'Gyeongsangbuk-do': {
            code: '4700000000',
            sub: {
                pohang_si: '4711000000',
                gyeongju_si: '4713000000',
                gimcheon_si: '4715000000',
                andong_si: '4717000000',
                gumi_si: '4719000000',
                yeongju_si: '4721000000',
                yeongcheon_si: '4723000000',
                sangju_si: '4725000000',
                mungyeong_si: '4728000000',
                gyeongsan_si: '4729000000',
                uiseong: '4773000000',
                cheongsong: '4775000000',
                goryong: '4776000000',
                yeongdeok: '4777000000',
                cheongdo: '4782000000',
                golyeong: '4783000000',
                seongju: '4784000000',
                chilgok: '4785000000',
                yecheon: '4790000000',
                bonghwa: '4792000000',
                uljin: '4793000000',
                ulleung: '4794000000',
            },
        },
        'Gyeongsangnam-do': {
            code: '4800000000',
            sub: {
                changwon_si: '4811000000',
                jinju: '4817000000',
                tongyeong_si: '4822000000',
                sacheon_si: '4824000000',
                gimhae_si: '4825000000',
                miryang_si: '4827000000',
                geoje_si: '4831000000',
                yangsan_si: '4833000000',
                uiryeong: '4872000000',
                haman: '4873000000',
                changnyeong: '4874000000',
                goseong: '4882000000',
                namhae: '4884000000',
                hadong: '4885000000',
                sancheong: '4886000000',
                hamyang: '4887000000',
                geochang: '4888000000',
                hapcheon: '4889000000',
            },
        },
        Jeju: {
            code: '5000000000',
            sub: {
                jeju_si: '5011000000',
                seogwipo: '5013000000',
            },
        },
    },
    propertyMap: {
        //날짜별
        the_lowest_temperature: 'min_temp',
        the_highest_temperature: 'max_temp',
        humidity: 'humidity',
        precipitation: 'rain',
        precipitation_probability: 'rain_p',
        wind_speed: 'windspd',
        //현재
        temperature: 'temp',
        concentration_of_fine_dust: 'pm10',
    },
    // 시간만 강수량 파라미터가 달라서 따로 맵을 만듬.
    propertyHourMap: {
        //날짜별
        the_lowest_temperature: 'min_temp',
        the_highest_temperature: 'max_temp',
        humidity: 'humidity',
        precipitation: 'rainAmt',
        precipitation_probability: 'rain',
        wind_speed: 'windspd',
        //현재
        temperature: 'temp',
        concentration_of_fine_dust: 'pm10',
    },
    defaultData: {
        //week
        //aplYmd: 20180905,
        max_temp: 0,
        min_temp: 0,
        sky: '구름조금',
        sky_code: '2',
        winddir: 'W',
        windspd: 0,
        rain: 0,
        rain_p: 0,
        humidity: 0,
        locationCode: '1100000000',
        updated: '2018-09-05T03:27:42.804Z',
        //hour
        //aplYmdt: "2018090500",
        rainAmt: 0,
        temp: 0,
        //now
        pm10: 0,
        pm10_s: '좋음',
    },
};

Entry.EXPANSION_BLOCK.weather.getBlocks = function() {
    const params = {
        getDate(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.date_yesterday, 'yesterday'],
                    [Lang.Blocks.date_today, 'today'],
                    [Lang.Blocks.date_tomorrow, 'tomorrow'],
                    [Lang.Blocks.date_after_2_days, 'After_2_days'],
                    [Lang.Blocks.date_after_3_days, 'After_3_days'],
                    [Lang.Blocks.date_after_4_days, 'After_4_days'],
                    [Lang.Blocks.date_after_5_days, 'After_5_days'],
                    [Lang.Blocks.date_after_6_days, 'After_6_days'],
                ],
                value: 'today',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getLocation(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: getStateOptions(),
                value: 'Seoul',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                dropdownSync: 'weather',
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getSubLocation(isPython = false) {
            const param = {
                type: 'DropdownDynamic',
                value: null,
                menuName() {
                    const value = this.getTargetValue('weather');
                    if (!value) {
                        return [[Lang.Blocks.no_target, 'null']];
                    }
                    return getCityOptions(value);
                },
                needDeepCopy: true,
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
                defaultValue: (value, options) => {
                    if (options.length) {
                        return options[0][1];
                    }
                    return null;
                },
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getSky(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.EXPANSION_WEATHER_sunny, 'sunny'],
                    [Lang.Blocks.EXPANSION_WEATHER_partly_cloudy, 'partly_cloudy'],
                    [Lang.Blocks.EXPANSION_WEATHER_mostly_cloudy, 'mostly_cloudy'],
                    [Lang.Blocks.EXPANSION_WEATHER_cloudy, 'cloudy'],
                    [Lang.Blocks.EXPANSION_WEATHER_rainy, 'rainy'],
                    [Lang.Blocks.EXPANSION_WEATHER_sleet, 'sleet'],
                    [Lang.Blocks.EXPANSION_WEATHER_snowy, 'snowy'],
                ],
                value: 'sunny',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getFineDust(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.EXPANSION_WEATHER_finedust_good, 'good'],
                    [Lang.Blocks.EXPANSION_WEATHER_finedust_normal, 'normal'],
                    [Lang.Blocks.EXPANSION_WEATHER_finedust_bad, 'bad'],
                    [Lang.Blocks.EXPANSION_WEATHER_finedust_very_bad, 'very_bad'],
                ],
                value: 'good',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getWeatherElements(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.EXPANSION_WEATHER_lowest_temperature, 'the_lowest_temperature'],
                    [Lang.Blocks.EXPANSION_WEATHER_highest_temperature, 'the_highest_temperature'],
                    [Lang.Blocks.EXPANSION_WEATHER_humidity, 'humidity'],
                    [Lang.Blocks.EXPANSION_WEATHER_precipitation, 'precipitation'],
                    [
                        Lang.Blocks.EXPANSION_WEATHER_precipitation_probability,
                        'precipitation_probability',
                    ],
                    [Lang.Blocks.EXPANSION_WEATHER_wind_speed, 'wind_speed'],
                ],
                value: 'the_lowest_temperature',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getNowWeatherElement(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.EXPANSION_WEATHER_temperature, 'temperature'],
                    [Lang.Blocks.EXPANSION_WEATHER_finedust, 'concentration_of_fine_dust'],
                ],
                value: 'temperature',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getTimeWeatherElement(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    [Lang.Blocks.EXPANSION_WEATHER_temperature, 'temperature'],
                    [Lang.Blocks.EXPANSION_WEATHER_precipitation, 'precipitation'],
                    [Lang.Blocks.EXPANSION_WEATHER_wind_speed, 'wind_speed'],
                    [Lang.Blocks.EXPANSION_WEATHER_humidity, 'humidity'],
                    [
                        Lang.Blocks.EXPANSION_WEATHER_precipitation_probability,
                        'precipitation_probability',
                    ],
                ],
                value: 'temperature',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringValue;
            }
            return param;
        },
        getTime(isPython = false) {
            const param = {
                type: 'Dropdown',
                options: [
                    ['00', '00'],
                    ['03', '03'],
                    ['06', '06'],
                    ['09', '09'],
                    ['12', '12'],
                    ['15', '15'],
                    ['18', '18'],
                    ['21', '21'],
                ],
                value: '00',
                fontSize: 11,
                bgColor: EntryStatic.colorSet.block.darken.EXPANSION,
                arrowColor: EntryStatic.colorSet.common.WHITE,
            };
            if (isPython) {
                param.converter = Entry.block.converters.returnStringOrNumberByValue;
            }
            return param;
        },
    };

    function pad2(n) {
        return n < 10 ? `0${n}` : n;
    }

    return {
        weather_title: {
            skeleton: 'basic_text',
            color: EntryStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.weather_title_text,
                    color: EntryStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'weather_title',
            },
            class: 'weather',
            isNotFor: ['weather'],
            events: {},
        },
        check_city_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                params.getDate(),
                params.getLocation(),
                params.getSubLocation(),
                params.getSky(),
            ],
            events: {},
            def: {
                params: [
                    params.getDate().value,
                    params.getLocation().value,
                    params.getSubLocation().value,
                    params.getSky().value,
                ],
                type: 'check_city_weather',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', 'D&value', null],
                type: 'check_city_weather',
            },
            paramsKeyMap: {
                DATE: 0,
                LOCATION: 1,
                SUBLOCATION: 2,
                WEATHER: 3,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const location = {
                    parent: script.getField('LOCATION', script),
                    sub: script.getField('SUBLOCATION', script),
                };
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'week',
                    location,
                    script.getField('DATE', script)
                );

                return Entry.EXPANSION_BLOCK.weather.checkWeather(
                    apiResult.sky_code,
                    script.getField('WEATHER', script)
                );
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Weather.is_condition_sunny(%1, %2, %3)',
                        params: [null, null, null, 'sunny'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_condition_partly_cloudy(%1, %2, %3)',
                        params: [null, null, null, 'partly_cloudy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_condition_mostly_cloudy(%1, %2, %3)',
                        params: [null, null, null, 'mostly_cloudy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_condition_cloudy(%1, %2, %3)',
                        params: [null, null, null, 'cloudy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_condition_rainy(%1, %2, %3)',
                        params: [null, null, null, 'rainy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_condition_sleet(%1, %2, %3)',
                        params: [null, null, null, 'sleet'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_condition_snowy(%1, %2, %3)',
                        params: [null, null, null, 'snowy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getSky(true),
                        ],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        check_city_finedust: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [params.getLocation(), params.getSubLocation(), params.getFineDust()],
            events: {},
            def: {
                params: [params.getLocation().value, null, params.getFineDust().value],
                type: 'check_city_finedust',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'check_city_finedust',
            },
            paramsKeyMap: {
                LOCATION: 0,
                SUBLOCATION: 1,
                FINEDUST: 2,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const location = {
                    parent: script.getField('LOCATION', script),
                    sub: script.getField('SUBLOCATION', script),
                };
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'now',
                    location,
                    null
                );
                return Entry.EXPANSION_BLOCK.weather.checkFineDust(
                    apiResult.pm10,
                    script.getField('FINEDUST', script)
                );
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Weather.is_current_finedust_grade_good(%1, %2)',
                        params: [null, null, 'good'],
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getFineDust(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_current_finedust_grade_normal(%1, %2)',
                        params: [null, null, 'normal'],
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getFineDust(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_current_finedust_grade_bad(%1, %2)',
                        params: [null, null, 'bad'],
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getFineDust(true),
                        ],
                    },
                    {
                        syntax: 'Weather.is_current_finedust_grade_very_bad(%1, %2)',
                        params: [, null, null, 'very_bad'],
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getFineDust(true),
                        ],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        get_city_weather_data: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                params.getDate(),
                params.getLocation(),
                params.getSubLocation(),
                params.getWeatherElements(),
            ],
            events: {},
            def: {
                params: [
                    params.getDate().value,
                    params.getLocation().value,
                    null,
                    params.getWeatherElements().value,
                ],
                type: 'get_city_weather_data',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', 'D&value', null],
                type: 'get_city_weather_data',
            },
            paramsKeyMap: {
                DATE: 0,
                LOCATION: 1,
                SUBLOCATION: 2,
                TYPE: 3,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const location = {
                    parent: script.getField('LOCATION', script),
                    sub: script.getField('SUBLOCATION', script),
                };
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'week',
                    location,
                    script.getField('DATE', script)
                );

                const type =
                    Entry.EXPANSION_BLOCK.weather.propertyMap[script.getField('TYPE', script)];
                return apiResult[type];
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Weather.get_lowest_temperature(%1, %2, %3)',
                        params: [null, null, null, 'the_lowest_temperature'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Weather.get_highest_temperature(%1, %2, %3)',
                        params: [null, null, null, 'the_highest_temperature'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Weather.get_humidity(%1, %2, %3)',
                        params: [null, null, null, 'humidity'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Weather.get_precipitation(%1, %2, %3)',
                        params: [null, null, null, 'precipitation'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Weather.get_precipitation_probability(%1, %2, %3)',
                        params: [null, null, null, 'precipitation_probability'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Weather.get_wind_speed(%1, %2, %3)',
                        params: [null, null, null, 'wind_speed'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        get_current_city_weather_data: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [params.getLocation(), params.getSubLocation(), params.getNowWeatherElement()],
            events: {},
            def: {
                params: [params.getLocation().value, null, params.getNowWeatherElement().value],
                type: 'get_current_city_weather_data',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'get_current_city_weather_data',
            },
            paramsKeyMap: {
                LOCATION: 0,
                SUBLOCATION: 1,
                TYPE: 2,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            func(sprite, script) {
                const location = {
                    parent: script.getField('LOCATION', script),
                    sub: script.getField('SUBLOCATION', script),
                };
                const type =
                    Entry.EXPANSION_BLOCK.weather.propertyMap[script.getField('TYPE', script)];

                return new Promise((resolve) => {
                    Entry.EXPANSION_BLOCK.weather
                        .getData('now', location, null)
                        .then((data) => resolve(data[type]));
                });
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Weather.get_current_finedust(%1, %2)',
                        params: [null, null, 'concentration_of_fine_dust'],
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getNowWeatherElement(true),
                        ],
                    },
                    {
                        syntax: 'Weather.get_current_temperature(%1, %2)',
                        params: [null, null, 'temperature'],
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getNowWeatherElement(true),
                        ],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        get_today_city_temperature: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [params.getLocation(), params.getSubLocation(), params.getTime()],
            events: {},
            def: {
                params: [params.getLocation().value, null, params.getTime().value],
                type: 'get_today_city_temperature',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_today_city_temperature',
            },
            paramsKeyMap: {
                LOCATION: 0,
                SUBLOCATION: 1,
                TIME: 2,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const location = {
                    parent: script.getField('LOCATION', script),
                    sub: script.getField('SUBLOCATION', script),
                };
                const date = Entry.EXPANSION_BLOCK.weather.date
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '');
                let time = script.getField('TIME', script);
                // db에 저장하지 않으면서 00시가 없어져서 03시부터 가능..
                if (time == '00') {
                    time = '03';
                }
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'hour',
                    location,
                    date + pad2(time - (time % 3))
                );

                return apiResult.temp;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Weather.get_today_temperature(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            params.getLocation(true),
                            params.getSubLocation(true),
                            params.getTime(true),
                        ],
                    },
                ],
            },
            wikiClass: 'weather',
        },

        //시군구 추가로 인한 legacy code 기존 블럭유지를 위해 필요.
        check_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [params.getDate(), params.getLocation(), params.getSky()],
            events: {},
            def: {
                params: [params.getDate().value, params.getLocation().value, params.getSky().value],
                type: 'check_weather',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'check_weather',
            },
            paramsKeyMap: {
                DATE: 0,
                LOCATION: 1,
                WEATHER: 2,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'week',
                    script.getField('LOCATION', script),
                    script.getField('DATE', script)
                );
                return Entry.EXPANSION_BLOCK.weather.checkWeather(
                    apiResult.sky_code,
                    script.getField('WEATHER', script)
                );
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Legacy.Weather.is_condition_sunny(%1, %2)',
                        params: [null, null, 'sunny'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.is_condition_partly_cloudy(%1, %2)',
                        params: [null, null, 'partly_cloudy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.is_condition_mostly_cloudy(%1, %2)',
                        params: [null, null, 'mostly_cloudy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.is_condition_cloudy(%1, %2)',
                        params: [null, null, 'cloudy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.is_condition_rainy(%1, %2)',
                        params: [null, null, 'rainy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.is_condition_sleet(%1, %2)',
                        params: [null, null, 'sleet'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSky(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.is_condition_snowy(%1, %2)',
                        params: [null, null, 'snowy'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getSky(true),
                        ],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        check_finedust: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [params.getLocation(), params.getFineDust()],
            events: {},
            def: {
                params: [params.getLocation().value, params.getFineDust().value],
                type: 'check_finedust',
            },
            pyHelpDef: {
                params: ['B&value', null],
                type: 'check_finedust',
            },
            paramsKeyMap: {
                LOCATION: 0,
                FINEDUST: 1,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'now',
                    script.getField('LOCATION', script),
                    null
                );
                return Entry.EXPANSION_BLOCK.weather.checkFineDust(
                    apiResult.pm10,
                    script.getField('FINEDUST', script)
                );
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Legacy.Weather.is_current_finedust_grade_good(%1)',
                        params: [null, 'good'],
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getFineDust(true)],
                    },
                    {
                        syntax: 'Legacy.Weather.is_current_finedust_grade_normal(%1)',
                        params: [null, 'normal'],
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getFineDust(true)],
                    },
                    {
                        syntax: 'Legacy.Weather.is_current_finedust_grade_bad(%1)',
                        params: [null, 'bad'],
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getFineDust(true)],
                    },
                    {
                        syntax: 'Legacy.Weather.is_current_finedust_grade_very_bad(%1)',
                        params: [, null, 'very_bad'],
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getFineDust(true)],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        get_weather_data: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [params.getDate(), params.getLocation(), params.getWeatherElements()],
            events: {},
            def: {
                params: [
                    params.getDate().value,
                    params.getLocation().value,
                    params.getWeatherElements().value,
                ],
                type: 'get_weather_data',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'get_weather_data',
            },
            paramsKeyMap: {
                DATE: 0,
                LOCATION: 1,
                TYPE: 2,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'week',
                    script.getField('LOCATION', script),
                    script.getField('DATE', script)
                );
                const type =
                    Entry.EXPANSION_BLOCK.weather.propertyMap[script.getField('TYPE', script)];
                return apiResult[type];
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Legacy.Weather.get_lowest_temperature(%1, %2)',
                        params: [null, null, 'the_lowest_temperature'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.get_highest_temperature(%1, %2)',
                        params: [null, null, 'the_highest_temperature'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.get_humidity(%1, %2)',
                        params: [null, null, 'humidity'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.get_precipitation(%1, %2)',
                        params: [null, null, 'precipitation'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.get_precipitation_probability(%1, %2)',
                        params: [null, null, 'precipitation_probability'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                    {
                        syntax: 'Legacy.Weather.get_wind_speed(%1, %2)',
                        params: [null, null, 'wind_speed'],
                        blockType: 'param',
                        textParams: [
                            params.getDate(true),
                            params.getLocation(true),
                            params.getWeatherElements(true),
                        ],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        get_current_weather_data: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [params.getLocation(), params.getNowWeatherElement()],
            events: {},
            def: {
                params: [params.getLocation().value, params.getNowWeatherElement().value],
                type: 'get_current_weather_data',
            },
            pyHelpDef: {
                params: ['B&value', null],
                type: 'get_current_weather_data',
            },
            paramsKeyMap: {
                LOCATION: 0,
                TYPE: 1,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'now',
                    script.getField('LOCATION', script),
                    null
                );
                const type =
                    Entry.EXPANSION_BLOCK.weather.propertyMap[script.getField('TYPE', script)];

                return apiResult[type];
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Legacy.Weather.get_current_finedust(%1)',
                        params: [null, 'concentration_of_fine_dust'],
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getNowWeatherElement(true)],
                    },
                    {
                        syntax: 'Legacy.Weather.get_current_temperature(%1)',
                        params: [null, 'temperature'],
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getNowWeatherElement(true)],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        get_today_temperature: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [params.getLocation(), params.getTime()],
            events: {},
            def: {
                params: [params.getLocation().value, params.getTime().value],
                type: 'get_today_temperature',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value'],
                type: 'get_today_temperature',
            },
            paramsKeyMap: {
                LOCATION: 0,
                TIME: 1,
            },
            class: 'weather_legacy',
            isNotFor: ['weather_legacy'],
            async func(sprite, script) {
                const date = Entry.EXPANSION_BLOCK.weather.date
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '');
                let time = script.getField('TIME', script);
                // db에 저장하지 않으면서 00시가 없어져서 03시부터 가능..
                if (time == '00') {
                    time = '03';
                }
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getData(
                    'hour',
                    script.getField('LOCATION', script),
                    date + pad2(time - (time % 3))
                );

                return apiResult.temp;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Legacy.Weather.get_today_temperature(%1, %2)',
                        blockType: 'param',
                        textParams: [params.getLocation(true), params.getTime(true)],
                    },
                ],
            },
            wikiClass: 'weather',
        },
        get_cur_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                ],
                type: 'get_cur_weather',
            },
            pyHelpDef: {
                params: ['A&value'],
                type: 'get_cur_weather',
            },
            paramsKeyMap: {
                LOCATION: 0,
            },
            class: 'weather',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'now',
                    location,
                    null
                );
                return apiResult.sky;
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        get_cur_wind: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                ],
                type: 'get_cur_wind',
            },
            pyHelpDef: {
                params: ['A&value'],
                type: 'get_cur_wind',
            },
            paramsKeyMap: {
                LOCATION: 0,
            },
            class: 'weather',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'now',
                    location,
                    null
                );
                return apiResult.winddir;
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        get_cur_weather_data: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getNowWeatherElement(),
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getNowWeatherElement().value,
                ],
                type: 'get_cur_weather_data',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value'],
                type: 'get_cur_weather_data',
            },
            paramsKeyMap: {
                LOCATION: 0,
                TYPE: 1,
            },
            class: 'weather',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const type =
                    Entry.EXPANSION_BLOCK.weather.propertyMap[script.getField('TYPE', script)];
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'now',
                    location,
                    null
                );
                return apiResult[type];
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        check_cur_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getSky(),
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getSky().value,
                ],
                type: 'check_cur_weather',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', 'D&value', null],
                type: 'check_cur_weather',
            },
            paramsKeyMap: {
                LOCATION: 0,
                WEATHER: 1,
            },
            class: 'weather',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'now',
                    location,
                    null
                );
                return Entry.EXPANSION_BLOCK.weather.checkWeather(
                    apiResult.sky_code,
                    script.getField('WEATHER', script)
                );
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        check_cur_finddust: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getFineDust(),
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getFineDust().value,
                ],
                type: 'check_cur_finddust',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'check_cur_finddust',
            },
            paramsKeyMap: {
                LOCATION: 0,
                FINEDUST: 1,
            },
            class: 'weather',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'now',
                    location,
                    null
                );
                return Entry.EXPANSION_BLOCK.weather.checkFineDust(
                    apiResult.pm10,
                    script.getField('FINEDUST', script)
                );
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        get_day_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                params.getDate(),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    params.getDate().value,
                    {
                        type: 'get_korea_area_code',
                    },
                ],
                type: 'get_day_weather',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'get_day_weather',
            },
            paramsKeyMap: {
                DATE: 0,
                LOCATION: 1,
            },
            class: 'weather_day',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'week',
                    location,
                    script.getField('DATE', script)
                );
                return apiResult.sky;
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        get_day_weather_data: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                params.getDate(),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getWeatherElements(),
            ],
            events: {},
            def: {
                params: [
                    params.getDate().value,
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getWeatherElements().value,
                ],
                type: 'get_day_weather_data',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'get_day_weather_data',
            },
            paramsKeyMap: {
                DATE: 0,
                LOCATION: 1,
                TYPE: 2,
            },
            class: 'weather_day',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const type =
                    Entry.EXPANSION_BLOCK.weather.propertyMap[script.getField('TYPE', script)];
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'week',
                    location,
                    script.getField('DATE', script)
                );
                return apiResult[type];
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        check_day_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                params.getDate(),
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getSky(),
            ],
            events: {},
            def: {
                params: [
                    params.getDate().value,
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getSky().value,
                ],
                type: 'check_day_weather',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'check_day_weather',
            },
            paramsKeyMap: {
                DATE: 0,
                LOCATION: 1,
                WEATHER: 2,
            },
            class: 'weather_day',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'week',
                    location,
                    script.getField('DATE', script)
                );
                return Entry.EXPANSION_BLOCK.weather.checkWeather(
                    apiResult.sky_code,
                    script.getField('WEATHER', script)
                );
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        get_time_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getTime(),
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getTime().value,
                ],
                type: 'get_time_weather',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_time_weather',
            },
            paramsKeyMap: {
                LOCATION: 0,
                TIME: 1,
            },
            class: 'weather_time',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const date = Entry.EXPANSION_BLOCK.weather.date
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '');
                let time = script.getField('TIME', script);
                // db에 저장하지 않으면서 00시가 없어져서 03시부터 가능..
                if (time == '00') {
                    time = '03';
                }
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'hour',
                    location,
                    date + pad2(time - (time % 3))
                );
                return apiResult.sky;
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        get_time_weather_data: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getTime(),
                params.getTimeWeatherElement(),
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getTime().value,
                    params.getTimeWeatherElement().value,
                ],
                type: 'get_time_weather_data',
            },
            pyHelpDef: {
                params: ['A&value', 'B&value', 'C&value'],
                type: 'get_time_weather_data',
            },
            paramsKeyMap: {
                LOCATION: 0,
                TIME: 1,
                TYPE: 2,
            },
            class: 'weather_time',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const type =
                    Entry.EXPANSION_BLOCK.weather.propertyHourMap[script.getField('TYPE', script)];
                const date = Entry.EXPANSION_BLOCK.weather.date
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '');
                let time = script.getField('TIME', script);
                // db에 저장하지 않으면서 00시가 없어져서 03시부터 가능..
                if (time == '00') {
                    time = '03';
                }
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'hour',
                    location,
                    date + pad2(time - (time % 3))
                );
                return apiResult[type];
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
        check_time_weather: {
            color: EntryStatic.colorSet.block.default.EXPANSION,
            outerLine: EntryStatic.colorSet.block.darken.EXPANSION,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                params.getTime(),
                params.getSky(),
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'get_korea_area_code',
                    },
                    params.getTime().value,
                    params.getSky().value,
                ],
                type: 'check_time_weather',
            },
            pyHelpDef: {
                params: ['B&value', 'C&value', null],
                type: 'check_time_weather',
            },
            paramsKeyMap: {
                LOCATION: 0,
                TIME: 1,
                WEATHER: 2,
            },
            class: 'weather_time',
            isNotFor: ['weather'],
            async func(sprite, script) {
                const location = script.getValue('LOCATION', script);
                const date = Entry.EXPANSION_BLOCK.weather.date
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '');
                let time = script.getField('TIME', script);
                // db에 저장하지 않으면서 00시가 없어져서 03시부터 가능..
                if (time == '00') {
                    time = '03';
                }
                const apiResult = await Entry.EXPANSION_BLOCK.weather.getDataWithCityCode(
                    'hour',
                    location,
                    date + pad2(time - (time % 3))
                );
                return Entry.EXPANSION_BLOCK.weather.checkWeather(
                    apiResult.sky_code,
                    script.getField('WEATHER', script)
                );
            },
            syntax: {
                js: [],
                py: [],
            },
            wikiClass: 'weather',
        },
    };
};
