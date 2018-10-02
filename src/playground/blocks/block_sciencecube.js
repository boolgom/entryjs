'use strict';

Entry.sciencecube = {
    name: 'sciencecube',
    url: "http://www.koreadigital.com/kr/main.asp",
    imageName: "sciencecube.png",
    value: {},
    title: {
        "ko": "사이언스큐브",
        "en": "sciencecube"
    },
    setZero: function() {},
    dataHandler: function(data) {

        Entry.hw.sendQueue.data = {};
        if (data["tempData"])
        {
            this.value["tempData"] = data["tempData"];
        }
        else if(data["pressueData"])
        {
            this.value["pressueData"] = data["pressueData"];
        }
        else if(data["currentData"])
        {
            this.value["currentData"] = data["currentData"];
        }
        else if(data["voltageData"])
        {
            this.value["voltageData"] = data["voltageData"];
        }
    }
};

Entry.sciencecube.setLanguage = () => {
	return {
		ko: {
			template: {
				sciencecube_temper: '온도 %1',
                sciencecube_current: '전류 %1',
                sciencecube_pressue: '압력 %1',
                sciencecube_voltage: '전압 %1'
			}
		},
		en: {
			template: {
				sciencecube_temper: 'temper %1',
                sciencecube_current: 'current %1',
                sciencecube_pressue: 'pressue %1',
                sciencecube_voltage: 'voltage %1'
			}
		}
	}
}

Entry.sciencecube.getBlocks = () => {
    return {
        sciencecube_temper: { 
            color: '#00979D', 
            skeleton: 'basic_string_field',
            statements: [],
            template: "온도 센서값",
            params: [ 
                {
                    type: "Text",
                    text : "온도 센서값",
                },
            ],
            def: {
                type: 'sciencecube_temper', 
            },
            paramsKeyMap: { 
                VALUE: 0,
                sensor : 1
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function (sprite, script) {
                Entry.hw.update();
                if(Entry.sciencecube.value["tempData"])
                    {
                        return "온도 " + Entry.sciencecube.value["tempData"].toFixed(2) + " ℃";
                    }
                    else return "현재 센서와 다릅니다. 다시 연결해주세요.";
            },
        },
        sciencecube_current: { 
            color: '#00979D', 
            skeleton: 'basic_string_field',
            statements: [],
            template: "전류 센서값",
            params: [ 
                {
                    type: "Text",
                    text : "전류 센서값",
                },
            ],
            def: {
                type: 'sciencecube_current', 
            },
            paramsKeyMap: { 
                VALUE: 0,
                sensor : 1
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function (sprite, script) {
                Entry.hw.update();
                if(Entry.sciencecube.value["currentData"])
                    {
                        return "전류 " + Entry.sciencecube.value["currentData"].toFixed(2) + " A";
                    }
                    else return "현재 센서와 다릅니다. 다시 연결해주세요.";
            }, 
        },
        sciencecube_pressue: { 
            color: '#00979D', 
            skeleton: 'basic_string_field',
            statements: [],
            template: "압력 센서값",
            params: [ 
                {
                    type: "Text",
                    text : "압력 센서값",
                },
            ],
            def: {
                type: 'sciencecube_pressue', 
            },
            paramsKeyMap: { 
                VALUE: 0,
                sensor : 1
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function (sprite, script) {
                Entry.hw.update();
                if(Entry.sciencecube.value["pressueData"])
                    {
                        return "압력 " + Entry.sciencecube.value["pressueData"].toFixed(2) + " hPa";
                    }
                    else return "현재 센서와 다릅니다. 다시 연결해주세요.";
            },
        },
        sciencecube_voltage: { 
            color: '#00979D', 
            skeleton: 'basic_string_field',
            statements: [],
            template: "전압 센서값",
            params: [ 
                {
                    type: "Text",
                    text : "전압 센서값",
                },
            ],
            def: {
                type: 'sciencecube_voltage', 
            },
            paramsKeyMap: { 
                VALUE: 0,
                sensor : 1
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function (sprite, script) {
                Entry.hw.update();
                if(Entry.sciencecube.value["voltageData"])
                    {
                        return "전압 " + Entry.sciencecube.value["voltageData"].toFixed(2) + " V";
                    }
                    else return "현재 센서와 다릅니다. 다시 연결해주세요.";
            }, 
        },
    }
}
