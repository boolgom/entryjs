/**
 * @fileoverview HW object class for connect arduino.
 */
'use strict';

Entry.HW = function() {
    this.connectTrial = 0;
    this.isFirstConnect = true;

    this.initSocket();
    this.connected = false;
    this.portData = {};
    this.sendQueue = {};
    this.settingQueue = {};
    this.selectedDevice = null;
    this.hwModule = null;
    this.socketType = null;

    Entry.addEventListener('stop', this.setZero);

    this.hwInfo = {
        '11': Entry.Arduino,
        '12': Entry.SensorBoard,
        '13': Entry.CODEino,
        '24': Entry.Hamster,
        '25': Entry.Albert,
        '31': Entry.Bitbrick,
        '71': Entry.Robotis_carCont,
        '72': Entry.Robotis_openCM70
    };
};

Entry.HW.TRIAL_LIMIT = 1;

var p = Entry.HW.prototype;

p.initSocket = function() {
    try{
        if (this.connectTrial >= Entry.HW.TRIAL_LIMIT) {
            if (!this.isFirstConnect)
                Entry.toast.alert(Lang.Menus.connect_hw,
                                  Lang.Menus.connect_fail,
                                  false);
            this.isFirstConnect = false;
            return;
        }
        var hw = this;

        var option = {
            reconnection: false
        };
        var browserType = Entry.getBrowserType().toUpperCase();
        if(browserType.indexOf('IE') > -1 || browserType.indexOf('EDGE') > -1) {
            option['transports'] = ['polling'];
        }

        var socket = new WebSocket("ws://localhost:23518");
        var socketIO = io.connect('ws://localhost:23517', option);

        this.connected = false;
        socket.binaryType = "arraybuffer";
        socketIO.binaryType = "arraybuffer";
        this.connectTrial++;

        socket.onopen = function()
        {
            hw.socketType = 'WebSocket';
            hw.initHardware(socket);
        };

        socket.onmessage = function (evt)
        {
            var data = JSON.parse(evt.data);
            hw.checkDevice(data);
            hw.updatePortData(data);
        };

        socket.onclose = function()
        {
            if(hw.socketType === 'WebSocket') {
                this.socket = null;
                hw.initSocket();
            }
        };
        
        socketIO.connect();
        socketIO.on('connect', function (data) {
            hw.socketType = 'SocketIO';
            hw.initHardware(socketIO);
        });

        socketIO.on('message', function (evt) {
            if(typeof evt === 'string') {
                var data = JSON.parse(evt);
                hw.checkDevice(data);
                hw.updatePortData(data);
            }
        });

        socketIO.on('disconnect', function (data) {
            if(hw.socketType === 'SocketIO') {
                this.socket = null;
                socketIO.destroy(socketIO);
                hw.initSocket();
            }
        });

        Entry.dispatchEvent("hwChanged");        
    } catch(e) {}
};

p.retryConnect = function() {
    this.connectTrial = 0;
    this.initSocket();
};

p.initHardware = function(socket) {
    this.socket = socket;
    this.connectTrial = 0;

    this.connected = true;
    Entry.dispatchEvent("hwChanged");
    if (Entry.playground && Entry.playground.object)
        Entry.playground.setMenu(Entry.playground.object.objectType);
};

p.setDigitalPortValue = function(port, value) {
    this.sendQueue[port] = value;
};

p.getAnalogPortValue = function(port) {
    if (!this.connected)
        return 0;
    return this.portData['a'+port];
};

p.getDigitalPortValue = function(port) {
    if (!this.connected)
        return 0;
    this.setPortReadable(port);
    if (this.portData[port] !== undefined) {
        return this.portData[port];
    }
    else
        return 0;
};

p.setPortReadable = function(port) {
    if (!this.sendQueue.readablePorts)
        this.sendQueue.readablePorts = [];
    this.sendQueue.readablePorts.push(port);
};

p.update = function() {
    if (!this.socket) {
        return;
    }
    if(this.socketType === 'SocketIO') {
        if (this.socket.io.readyState != 'open') {
            return;
        }
        
        this.socket.emit('message', JSON.stringify(this.sendQueue));
    } else if (this.socketType === 'WebSocket') {
        if(this.socket.readyState != 1) {
            return;
        }

        this.socket.send(JSON.stringify(this.sendQueue));
    }

    this.sendQueue.readablePorts = [];
};

p.updatePortData = function(data) {
    this.portData = data;
};

p.closeConnection = function() {
    if (this.socket) {
        if(this.socketType === 'SocketIO') {
            this.socket.emit('close');
        }
        this.socket.close();
    }
};

p.downloadConnector = function() {
    var url = "http://play-entry.org/down/Entry_HW_v1.1.3.exe";
    var win = window.open(url, '_blank');
    win.focus();
};

p.downloadSource = function() {
    var url = "http://play-entry.com/down/board.ino";
    var win = window.open(url, '_blank');
    win.focus();
};

p.setZero = function() {
    if (!Entry.hw.hwModule)
        return;
    Entry.hw.hwModule.setZero();
};

p.checkDevice = function(data) {
    if (data.company === undefined)
        return;
    var key = ''+data.company + data.model;
    if (key == this.selectedDevice)
        return;
    this.selectedDevice = key;
    this.hwModule = this.hwInfo[key];
    Entry.dispatchEvent("hwChanged");
    Entry.toast.success(
        Lang.Menus.connect_hw,
        Lang.Menus.connect_message.replace(
            "%1",
            Lang.Device[Entry.hw.hwModule.name]
        ),
        false
    );
};

p.banHW = function() {
    var hwOptions = this.hwInfo;
    for (var i in hwOptions)
        Entry.playground.blockMenu.banClass(hwOptions[i].name);
};
