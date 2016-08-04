var Entry = {block:{}, TEXT_ALIGN_CENTER:0, TEXT_ALIGN_LEFT:1, TEXT_ALIGN_RIGHT:2, TEXT_ALIGNS:["center", "left", "right"], clipboard:null, loadProject:function(b) {
  b || (b = Entry.getStartProject(Entry.mediaFilePath));
  "workspace" == this.type && Entry.stateManager.startIgnore();
  Entry.projectId = b._id;
  Entry.variableContainer.setVariables(b.variables);
  Entry.variableContainer.setMessages(b.messages);
  Entry.scene.addScenes(b.scenes);
  Entry.stage.initObjectContainers();
  Entry.variableContainer.setFunctions(b.functions);
  Entry.container.setObjects(b.objects);
  Entry.FPS = b.speed ? b.speed : 60;
  createjs.Ticker.setFPS(Entry.FPS);
  "workspace" == this.type && setTimeout(function() {
    Entry.stateManager.endIgnore();
  }, 300);
  Entry.engine.projectTimer || Entry.variableContainer.generateTimer();
  0 === Object.keys(Entry.container.inputValue).length && Entry.variableContainer.generateAnswer();
  Entry.start();
  return b;
}, exportProject:function(b) {
  b || (b = {});
  Entry.engine.isState("stop") || Entry.engine.toggleStop();
  Entry.Func && Entry.Func.workspace && Entry.Func.workspace.visible && Entry.Func.cancelEdit();
  b.objects = Entry.container.toJSON();
  b.scenes = Entry.scene.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.functions = Entry.variableContainer.getFunctionJSON();
  b.scenes = Entry.scene.toJSON();
  b.speed = Entry.FPS;
  return b;
}, setBlockByText:function(b, a) {
  for (var c = [], d = jQuery.parseXML(a).getElementsByTagName("category"), e = 0;e < d.length;e++) {
    for (var f = d[e], g = {category:f.getAttribute("id"), blocks:[]}, f = f.childNodes, h = 0;h < f.length;h++) {
      var k = f[h];
      !k.tagName || "BLOCK" != k.tagName.toUpperCase() && "BTN" != k.tagName.toUpperCase() || g.blocks.push(k.getAttribute("type"));
    }
    c.push(g);
  }
  Entry.playground.setBlockMenu(c);
}, setBlock:function(b, a) {
  Entry.playground.setMenuBlock(b, a);
}, enableArduino:function() {
}, initSound:function(b) {
  b.path = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/" + b.filename + b.ext;
  Entry.soundQueue.loadFile({id:b.id, src:b.path, type:createjs.LoadQueue.SOUND});
}, beforeUnload:function(b) {
  Entry.hw.closeConnection();
  Entry.variableContainer.updateCloudVariables();
  if ("workspace" == Entry.type && (localStorage && Entry.interfaceState && localStorage.setItem("workspace-interface", JSON.stringify(Entry.interfaceState)), !Entry.stateManager.isSaved())) {
    return Lang.Workspace.project_changed;
  }
}, loadInterfaceState:function() {
  if ("workspace" == Entry.type) {
    if (localStorage && localStorage.getItem("workspace-interface")) {
      var b = localStorage.getItem("workspace-interface");
      this.resizeElement(JSON.parse(b));
    } else {
      this.resizeElement({menuWidth:280, canvasWidth:480});
    }
  }
}, resizeElement:function(b) {
  if ("workspace" == Entry.type) {
    var a = this.interfaceState;
    !b.canvasWidth && a.canvasWidth && (b.canvasWidth = a.canvasWidth);
    !b.menuWidth && this.interfaceState.menuWidth && (b.menuWidth = a.menuWidth);
    Entry.engine.speedPanelOn && Entry.engine.toggleSpeedPanel();
    (a = b.canvasWidth) ? 325 > a ? a = 325 : 720 < a && (a = 720) : a = 400;
    b.canvasWidth = a;
    var c = 9 * a / 16;
    Entry.engine.view_.style.width = a + "px";
    Entry.engine.view_.style.height = c + "px";
    Entry.engine.view_.style.top = "40px";
    Entry.stage.canvas.canvas.style.width = a + "px";
    400 <= a ? Entry.engine.view_.removeClass("collapsed") : Entry.engine.view_.addClass("collapsed");
    Entry.playground.view_.style.left = a + .5 + "px";
    Entry.propertyPanel.resize(a);
    var d = Entry.engine.view_.getElementsByClassName("entryAddButtonWorkspace_w")[0];
    d && (Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.width = .7 * a + "px") : d.style.display = "none");
    if (d = Entry.engine.view_.getElementsByClassName("entryRunButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.left = .7 * a + "px", d.style.width = .3 * a + "px") : (d.style.left = "2px", d.style.top = c + 24 + "px", d.style.width = a - 4 + "px");
    }
    if (d = Entry.engine.view_.getElementsByClassName("entryStopButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.left = .7 * a + "px", d.style.width = .3 * a + "px") : (d.style.left = "2px", d.style.top = c + 24 + "px", d.style.width = a + "px");
    }
    (a = b.menuWidth) ? 244 > a ? a = 244 : 400 < a && (a = 400) : a = 264;
    b.menuWidth = a;
    $(".blockMenuContainer").css({width:a - 64 + "px"});
    $(".blockMenuContainer>svg").css({width:a - 64 + "px"});
    Entry.playground.mainWorkspace.blockMenu.setWidth();
    $(".entryWorkspaceBoard").css({left:a + "px"});
    Entry.playground.resizeHandle_.style.left = a + "px";
    Entry.playground.variableViewWrapper_.style.width = a + "px";
    this.interfaceState = b;
  }
  Entry.windowResized.notify();
}, getUpTime:function() {
  return (new Date).getTime() - this.startTime;
}, addActivity:function(b) {
  Entry.stateManager && Entry.stateManager.addActivity(b);
}, startActivityLogging:function() {
  Entry.reporter && Entry.reporter.start(Entry.projectId, window.user ? window.user._id : null, Entry.startTime);
}, getActivityLog:function() {
  var b = {};
  Entry.stateManager && (b.activityLog = Entry.stateManager.activityLog_);
  return b;
}, DRAG_MODE_NONE:0, DRAG_MODE_MOUSEDOWN:1, DRAG_MODE_DRAG:2, cancelObjectEdit:function(b) {
  var a = Entry.playground.object;
  if (a) {
    var c = b.target;
    b = 0 !== $(a.view_).find(c).length;
    c = c.tagName.toUpperCase();
    !a.isEditing || "INPUT" === c && b || a.editObjectValues(!1);
  }
}};
window.Entry = Entry;
Entry.Albert = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, leftEye:0, rightEye:0, note:0, bodyLed:0, frontLed:0, padWidth:0, padHeight:0}, setZero:function() {
  var b = Entry.Albert.PORT_MAP, a = Entry.hw.sendQueue, c;
  for (c in b) {
    a[c] = b[c];
  }
  Entry.hw.update();
  b = Entry.Albert;
  b.tempo = 60;
  b.removeAllTimeouts();
}, monitorTemplate:{imgPath:"hw/albert.png", width:387, height:503, listPorts:{oid:{name:"OID", type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.ALBERT_sensor_leftProximity, type:"input", pos:{x:178, y:401}}, rightProximity:{name:Lang.Blocks.ALBERT_sensor_rightProximity, type:"input", pos:{x:66, y:359}}, battery:{name:Lang.Blocks.ALBERT_sensor_battery, type:"input", 
pos:{x:88, y:368}}, light:{name:Lang.Blocks.ALBERT_sensor_light, type:"input", pos:{x:127, y:391}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:299, y:406}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:22, y:325}}, leftEye:{name:Lang.Hw.leftEye, type:"output", pos:{x:260, y:26}}, rightEye:{name:Lang.Hw.rightEye, type:"output", pos:{x:164, y:13}}, bodyLed:{name:Lang.Hw.body + " " + Lang.Hw.led, type:"output", pos:{x:367, y:308}}, frontLed:{name:Lang.Hw.front + " " + Lang.Hw.led, 
pos:{x:117, y:410}}}, mode:"both"}, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, name:"albert"};
Blockly.Blocks.albert_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_hand_found = function(b, a) {
  var c = Entry.hw.portData;
  return 40 < c.leftProximity || 40 < c.rightProximity;
};
Blockly.Blocks.albert_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_sensor_leftProximity, "leftProximity"], [Lang.Blocks.ALBERT_sensor_rightProximity, "rightProximity"], [Lang.Blocks.ALBERT_sensor_light, "light"], [Lang.Blocks.ALBERT_sensor_battery, "battery"], [Lang.Blocks.ALBERT_sensor_signalStrength, "signalStrength"], [Lang.Blocks.ALBERT_sensor_frontOid, "frontOid"], [Lang.Blocks.ALBERT_sensor_backOid, "backOid"], [Lang.Blocks.ALBERT_sensor_positionX, "positionX"], 
  [Lang.Blocks.ALBERT_sensor_positionY, "positionY"], [Lang.Blocks.ALBERT_sensor_orientation, "orientation"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.albert_value = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.albert_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = 30;
  c.rightWheel = 30;
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, c);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = -30;
  c.rightWheel = -30;
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, c);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (c.leftWheel = -30, c.rightWheel = 30) : (c.leftWheel = 30, c.rightWheel = -30);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, c);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_both_wheels_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + d : d;
  c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e;
  return a.callReturn();
};
Blockly.Blocks.albert_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_both_wheels_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = a.getNumberValue("LEFT");
  c.rightWheel = a.getNumberValue("RIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheel_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e : ("RIGHT" != d && (c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e), c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e);
  return a.callReturn();
};
Blockly.Blocks.albert_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheel_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = e : ("RIGHT" != d && (c.leftWheel = e), c.rightWheel = e);
  return a.callReturn();
};
Blockly.Blocks.albert_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_stop = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = 0;
  c.rightWheel = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_pad_size_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_1);
  this.appendValueInput("WIDTH").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_2);
  this.appendValueInput("HEIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_pad_size_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.padWidth = a.getNumberValue("WIDTH");
  c.padHeight = a.getNumberValue("HEIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_set_eye_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_eye_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_eye_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.ALBERT_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.ALBERT_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.ALBERT_set_eye_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_eye_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a), e = +a.getField("COLOR", a);
  "LEFT" == d ? c.leftEye = e : ("RIGHT" != d && (c.leftEye = e), c.rightEye = e);
  return a.callReturn();
};
Blockly.Blocks.albert_clear_eye = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_eye_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_eye_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_eye = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a);
  "LEFT" == d ? c.leftEye = 0 : ("RIGHT" != d && (c.leftEye = 0), c.rightEye = 0);
  return a.callReturn();
};
Blockly.Blocks.albert_body_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_body_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_body_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_body_led = function(b, a) {
  var c = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? c.bodyLed = 1 : c.bodyLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_front_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_front_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_front_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_front_led = function(b, a) {
  var c = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? c.frontLed = 1 : c.frontLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_beep = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 440;
  c.note = 0;
  var d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, 200);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_buzzer_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("VALUE");
  c.buzzer = void 0 != c.buzzer ? c.buzzer + d : d;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_buzzer_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = a.getNumberValue("VALUE");
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_buzzer = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = 0;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.ALBERT_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.ALBERT_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_play_note_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.note = 0;
    return a.callReturn();
  }
  var d = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Albert.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 0;
  c.note = d + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      c.note = 0;
      Entry.Albert.removeTimeout(h);
    }, f - 100);
    Entry.Albert.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(k);
  }, f);
  Entry.Albert.timeouts.push(k);
  return a;
};
Blockly.Blocks.albert_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_rest_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var d = a.getNumberValue("VALUE"), d = 6E4 * d / Entry.Albert.tempo;
  c.buzzer = 0;
  c.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(e);
  }, d);
  Entry.Albert.timeouts.push(e);
  return a;
};
Blockly.Blocks.albert_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_tempo_by = function(b, a) {
  Entry.Albert.tempo += a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.albert_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_tempo_to = function(b, a) {
  Entry.Albert.tempo = a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.albert_move_forward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = 30;
  c.rightWheel = 30;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_move_backward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return c.leftWheel = -30, c.rightWheel = -30, a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_turn_around = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_around_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_around_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_around = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return c.leftWheel = a.leftValue, c.rightWheel = a.rightValue, a;
    }
    delete a.timeFlag;
    delete a.isStart;
    delete a.leftValue;
    delete a.rightValue;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  c = "LEFT" == a.getField("DIRECTION", a);
  a.leftValue = c ? -30 : 30;
  a.rightValue = c ? 30 : -30;
  a.isStart = !0;
  a.timeFlag = 1;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.General.skyblue, "3"], [Lang.General.blue, "1"], [Lang.General.purple, "5"], [Lang.General.white, "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_led_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a), e = +a.getField("COLOR", a);
  "FRONT" == d ? (c.leftEye = e, c.rightEye = e) : "LEFT" == d ? c.leftEye = e : c.rightEye = e;
  return a.callReturn();
};
Blockly.Blocks.albert_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_led = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a);
  "FRONT" == d ? (c.leftEye = 0, c.rightEye = 0) : "LEFT" == d ? c.leftEye = 0 : c.rightEye = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_change_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheels_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheels_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData, e = a.getField("DIRECTION"), f = a.getNumberValue("VALUE");
  "LEFT" == e ? c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + f : d.leftWheel + f : ("RIGHT" != e && (c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + f : d.leftWheel + f), c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + f : d.rightWheel + f);
  return a.callReturn();
};
Blockly.Blocks.albert_set_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheels_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheels_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = e : ("RIGHT" != d && (c.leftWheel = e), c.rightWheel = e);
  return a.callReturn();
};
Entry.Arduino = {name:"arduino", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0;20 > b;b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/arduino.png", width:605, height:434, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.ArduinoExt = {name:"ArduinoExt", getSensorKey:function() {
  return "xxxxxxxx".replace(/[xy]/g, function(b) {
    var a = 16 * Math.random() | 0;
    return ("x" == b ? a : a & 0 | 0).toString(16);
  }).toUpperCase();
}, getSensorTime:function(b) {
  return (new Date).getTime() + b;
}, setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.TIME = Entry.ArduinoExt.getSensorTime(Entry.hw.sendQueue.SET[b].type);
    Entry.hw.sendQueue.KEY = Entry.ArduinoExt.getSensorKey();
  }) : Entry.hw.sendQueue = {SET:{0:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 1:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 2:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 3:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 4:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 5:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 6:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 7:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 8:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, 
  data:0}, 9:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 10:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 11:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 12:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}, 13:{type:Entry.ArduinoExt.sensorTypes.DIGITAL, data:0}}, TIME:Entry.ArduinoExt.getSensorTime(Entry.ArduinoExt.sensorTypes.DIGITAL), KEY:Entry.ArduinoExt.getSensorKey()};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, SERVO_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8}, toneMap:{1:[33, 65, 131, 262, 523, 1046, 2093, 4186], 2:[35, 69, 139, 277, 554, 1109, 2217, 4435], 3:[37, 73, 147, 294, 587, 1175, 2349, 4699], 4:[39, 78, 156, 311, 622, 1245, 2849, 4978], 5:[41, 82, 165, 330, 659, 1319, 2637, 5274], 6:[44, 87, 175, 349, 698, 1397, 2794, 5588], 7:[46, 92, 185, 370, 740, 1480, 2960, 5920], 8:[49, 98, 196, 392, 784, 1568, 3136, 6272], 9:[52, 104, 208, 415, 831, 
1661, 3322, 6645], 10:[55, 110, 220, 440, 880, 1760, 3520, 7040], 11:[58, 117, 233, 466, 932, 1865, 3729, 7459], 12:[62, 123, 247, 494, 988, 1976, 3951, 7902]}, BlockState:{}};
Entry.SensorBoard = {name:"sensorBoard", setZero:Entry.Arduino.setZero};
Entry.ardublock = {name:"ardublock", setZero:Entry.Arduino.setZero};
Entry.dplay = {name:"dplay", vel_value:255, Left_value:255, Right_value:255, setZero:Entry.Arduino.setZero, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}};
Entry.nemoino = {name:"nemoino", setZero:Entry.Arduino.setZero};
Entry.joystick = {name:"joystick", setZero:Entry.Arduino.setZero};
Entry.CODEino = {name:"CODEino", setZero:Entry.Arduino.setZero, monitorTemplate:Entry.Arduino.monitorTemplate};
Blockly.Blocks.arduino_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("Arduino"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_text = function(b, a) {
  return a.getStringField("NAME");
};
Blockly.Blocks.arduino_send = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_send = function(b, a) {
  var c = a.getValue("VALUE", a), d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(c));
  Entry.assert(200 == d.status, "arduino is not connected");
  return a.callReturn();
};
Blockly.Blocks.arduino_get_string = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_2);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_number = function(b, a) {
  var c = a.getValue("VALUE", a), d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(c));
  Entry.assert(200 == d.status, "arduino is not connected");
  return +d.responseText;
};
Blockly.Blocks.arduino_get_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_string = function(b, a) {
  var c = a.getValue("VALUE", a), d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(c));
  Entry.assert(200 == d.status, "arduino is not connected");
  return d.responseText;
};
Blockly.Blocks.arduino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_arduino_get_sensor_number_0, "A0"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_1, "A1"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_2, "A2"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_3, "A3"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_4, "A4"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_5, "A5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_pwm_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_pwm_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_number_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.arduino_get_number_sensor_value = function(b, a) {
  var c = a.getValue("VALUE", a);
  return Entry.hw.getAnalogPortValue(c[1]);
};
Blockly.Blocks.arduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.arduino_get_digital_value = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  return Entry.hw.getDigitalPortValue(c);
};
Blockly.Blocks.arduino_toggle_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_led = function(b, a) {
  var c = a.getNumberValue("VALUE"), d = "on" == a.getField("OPERATOR") ? 255 : 0;
  Entry.hw.setDigitalPortValue(c, d);
  return a.callReturn();
};
Blockly.Blocks.arduino_toggle_pwm = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_1);
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_3);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_pwm = function(b, a) {
  var c = a.getNumberValue("PORT"), d = a.getNumberValue("VALUE"), d = Math.round(d), d = Math.max(d, 0), d = Math.min(d, 255);
  Entry.hw.setDigitalPortValue(c, d);
  return a.callReturn();
};
Blockly.Blocks.arduino_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_4);
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_6);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_convert_scale = function(b, a) {
  var c = a.getNumberValue("VALUE1", a), d = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (d > e) {
    var h = d, d = e, e = h
  }
  f > g && (h = f, f = g, g = h);
  c -= d;
  c *= (g - f) / (e - d);
  c += f;
  c = Math.min(g, c);
  c = Math.max(f, c);
  return Math.round(c);
};
Blockly.Blocks.sensorBoard_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\uc18c\ub9ac", "0"], ["\ube5b \uac10\uc9c0", "1"], ["\uc2ac\ub77c\uc774\ub354", "2"], ["\uc628\ub3c4", "3"]]), "PORT").appendField(" \uc13c\uc11c\uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.sensorBoard_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.sensorBoard_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "8"], ["\ud30c\ub780", "9"], ["\ub178\ub780", "10"], ["\ucd08\ub85d", "11"]]), "PORT");
  this.appendDummyInput().appendField(" \ubc84\ud2bc\uc744 \ub20c\ub800\ub294\uac00?");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.sensorBoard_is_button_pressed = function(b, a) {
  return Entry.hw.getDigitalPortValue(a.getNumberField("PORT", a));
};
Blockly.Blocks.sensorBoard_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "2"], ["\ucd08\ub85d", "3"], ["\ud30c\ub780", "4"], ["\ud770\uc0c9", "5"]]), "PORT").appendField(" LED").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "255"], ["\ub044\uae30", "0"]]), "OPERATOR").appendField(" ").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.sensorBoard_led = function(b, a) {
  Entry.hw.setDigitalPortValue(a.getField("PORT"), a.getNumberField("OPERATOR"));
  return a.callReturn();
};
Entry.block.arduino_download_connector = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download connector");
}]}};
Entry.block.arduino_download_source = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5d4\ud2b8\ub9ac \uc544\ub450\uc774\ub178 \uc18c\uc2a4", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_connected = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ub428", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_reconnect = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub2e4\uc2dc \uc5f0\uacb0\ud558\uae30", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Blockly.Blocks.CODEino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_get_sensor_number_0, "A0"], [Lang.Blocks.CODEino_get_sensor_number_1, "A1"], [Lang.Blocks.CODEino_get_sensor_number_2, "A2"], [Lang.Blocks.CODEino_get_sensor_number_3, "A3"], [Lang.Blocks.CODEino_get_sensor_number_4, "A4"], [Lang.Blocks.CODEino_get_sensor_number_5, "A5"], [Lang.Blocks.CODEino_get_sensor_number_6, "A6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.CODEino_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_sensor_name_0, "0"], [Lang.Blocks.CODEino_sensor_name_1, "1"], [Lang.Blocks.CODEino_sensor_name_2, "2"], [Lang.Blocks.CODEino_sensor_name_3, "3"], [Lang.Blocks.CODEino_sensor_name_4, "4"], [Lang.Blocks.CODEino_sensor_name_5, "5"], [Lang.Blocks.CODEino_sensor_name_6, "6"]]), "PORT").appendField(Lang.Blocks.CODEino_string_1);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.CODEino_get_sound_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_10).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_11, "GREAT"], [Lang.Blocks.CODEino_string_12, "SMALL"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_sound_status = function(b, a) {
  return "GREAT" == a.getField("STATUS", a) ? 600 < Entry.hw.getAnalogPortValue(0) ? 1 : 0 : 600 > Entry.hw.getAnalogPortValue(0) ? 1 : 0;
};
Blockly.Blocks.CODEino_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_13).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_14, "BRIGHT"], [Lang.Blocks.CODEino_string_15, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_light_status = function(b, a) {
  return "DARK" == a.getField("STATUS", a) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.CODEino_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_3, "4"], [Lang.Blocks.CODEino_string_4, "17"], [Lang.Blocks.CODEino_string_5, "18"], [Lang.Blocks.CODEino_string_6, "19"], [Lang.Blocks.CODEino_string_7, "20"]]), "PORT").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_is_button_pressed = function(b, a) {
  var c = a.getNumberField("PORT", a);
  return 14 < c ? !Entry.hw.getAnalogPortValue(c - 14) : !Entry.hw.getDigitalPortValue(c);
};
Blockly.Blocks.CODEino_get_accelerometer_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_16, "LEFT"], [Lang.Blocks.CODEino_string_17, "RIGHT"], [Lang.Blocks.CODEino_string_18, "FRONT"], [Lang.Blocks.CODEino_string_19, "REAR"], [Lang.Blocks.CODEino_string_20, "REVERSE"]]), "DIRECTION");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_accelerometer_direction = function(b, a) {
  var c = a.getField("DIRECTION", a), d = 0;
  "LEFT" == c || "RIGHT" == c ? d = 3 : "FRONT" == c || "REAR" == c ? d = 4 : "REVERSE" == c && (d = 5);
  d = Entry.hw.getAnalogPortValue(d);
  d = 180 / 137 * (d - 265);
  d += -90;
  d = Math.min(90, d);
  d = Math.max(-90, d);
  d = Math.round(d);
  if ("LEFT" == c || "REAR" == c) {
    return -30 > d ? 1 : 0;
  }
  if ("RIGHT" == c || "FRONT" == c) {
    return 30 < d ? 1 : 0;
  }
  if ("REVERSE" == c) {
    return -50 > d ? 1 : 0;
  }
};
Blockly.Blocks.CODEino_get_accelerometer_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_accelerometer_X, "3"], [Lang.Blocks.CODEino_accelerometer_Y, "4"], [Lang.Blocks.CODEino_accelerometer_Z, "5"]]), "PORT").appendField(Lang.Blocks.CODEino_string_9);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_accelerometer_value = function(b, a) {
  var c = 265, d = 402, e = -90, f = 90, g = Entry.hw.getAnalogPortValue(a.getField("PORT", a));
  if (c > d) {
    var h = c, c = d, d = h
  }
  e > f && (h = e, e = f, f = h);
  g = (f - e) / (d - c) * (g - c);
  g += e;
  g = Math.min(f, g);
  g = Math.max(e, g);
  return Math.round(g);
};
Blockly.Blocks.dplay_select_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_select_led = function(b, a) {
  var c = a.getField("PORT"), d = 7;
  "7" == c ? d = 7 : "8" == c ? d = 8 : "9" == c ? d = 9 : "10" == c && (d = 10);
  c = "on" == a.getField("OPERATOR") ? 255 : 0;
  Entry.hw.setDigitalPortValue(d, c);
  return a.callReturn();
};
Blockly.Blocks.dplay_get_switch_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub514\uc9c0\ud138 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["4", "4"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_5, "ON"], [Lang.Blocks.dplay_string_6, "OFF"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_switch_status = function(b, a) {
  var c = a.getField("PORT"), d = 2;
  "2" == c ? d = 2 : "4" == c && (d = 4);
  return "OFF" == a.getField("STATUS") ? 1 == Entry.hw.getDigitalPortValue(d) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(d) ? 1 : 0;
};
Blockly.Blocks.dplay_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_light).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_3, "BRIGHT"], [Lang.Blocks.dplay_string_4, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_light_status = function(b, a) {
  return "DARK" == a.getField("STATUS", a) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.dplay_get_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uac00\ubcc0\uc800\ud56d", "ADJU"], ["\ube5b\uc13c\uc11c", "LIGHT"], ["\uc628\ub3c4\uc13c\uc11c", "TEMP"], ["\uc870\uc774\uc2a4\ud2f1 X", "JOYS"], ["\uc870\uc774\uc2a4\ud2f1 Y", "JOYS"], ["\uc801\uc678\uc120", "INFR"]]), "OPERATOR");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_5);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.dplay_get_value = function(b, a) {
  var c = a.getValue("VALUE", a);
  return Entry.hw.getAnalogPortValue(c[1]);
};
Blockly.Blocks.dplay_get_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_tilt).appendField(new Blockly.FieldDropdown([["\uc67c\ucabd \uae30\uc6b8\uc784", "LEFT"], ["\uc624\ub978\ucabd \uae30\uc6b8\uc784", "LIGHT"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_tilt = function(b, a) {
  return "LIGHT" == a.getField("STATUS", a) ? 1 == Entry.hw.getDigitalPortValue(12) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(12) ? 1 : 0;
};
Blockly.Blocks.dplay_DCmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc67c\ucabd", "3"], ["\uc624\ub978\ucabd", "6"]]), "PORT");
  this.appendDummyInput().appendField(" DC\ubaa8\ud130 \uc0c1\ud0dc\ub97c");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc815\ubc29\ud5a5", "FRONT"], ["\uc5ed\ubc29\ud5a5", "REAR"], ["\uc815\uc9c0", "OFF"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_DCmotor = function(b, a) {
  var c = a.getField("PORT"), d = 0;
  "3" == c ? d = 5 : "6" == c && (d = 11);
  var e = a.getField("OPERATOR"), f = 0, g = 0;
  "FRONT" == e ? (f = 255, g = 0) : "REAR" == e ? (f = 0, g = 255) : "OFF" == e && (g = f = 0);
  Entry.hw.setDigitalPortValue(c, f);
  Entry.hw.setDigitalPortValue(d, g);
  return a.callReturn();
};
Blockly.Blocks.dplay_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubd80\uc800\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\ub3c4", "1"], ["\ub808", "2"], ["\ubbf8", "3"]]), "PORT");
  this.appendDummyInput().appendField("\ub85c");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc15\uc790\ub85c \uc5f0\uc8fc\ud558\uae30");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_buzzer = function(b, a) {
  var c = a.getField("PORT"), d = 2;
  "1" == c ? d = 2 : "2" == c ? d = 4 : "3" == c && (d = 7);
  c = a.getNumberValue("VALUE");
  c = Math.round(c);
  c = Math.max(c, 0);
  c = Math.min(c, 100);
  Entry.hw.setDigitalPortValue(d, c);
  return a.callReturn();
};
Blockly.Blocks.dplay_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4\ubaa8\ud130 \uac01\ub3c4\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc774\ub3d9");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_servo = function(b, a) {
  var c = a.getNumberValue("VALUE"), c = Math.round(c), c = Math.max(c, 0), c = Math.min(c, 180);
  Entry.hw.setDigitalPortValue(9, c);
  return a.callReturn();
};
Entry.Bitbrick = {SENSOR_MAP:{1:"light", 2:"IR", 3:"touch", 4:"potentiometer", 5:"MIC", 21:"UserSensor", 11:"UserInput", 20:"LED", 19:"SERVO", 18:"DC"}, PORT_MAP:{buzzer:2, 5:4, 6:6, 7:8, 8:10, LEDR:12, LEDG:14, LEDB:16}, sensorList:function() {
  for (var b = [], a = Entry.hw.portData, c = 1;5 > c;c++) {
    var d = a[c];
    d && (d.value || 0 === d.value) && b.push([c + " - " + Lang.Blocks["BITBRICK_" + d.type], c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, touchList:function() {
  for (var b = [], a = Entry.hw.portData, c = 1;5 > c;c++) {
    var d = a[c];
    d && "touch" === d.type && b.push([c.toString(), c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, servoList:function() {
  for (var b = [], a = Entry.hw.portData, c = 5;9 > c;c++) {
    var d = a[c];
    d && "SERVO" === d.type && b.push(["ABCD"[c - 5], c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, dcList:function() {
  for (var b = [], a = Entry.hw.portData, c = 5;9 > c;c++) {
    var d = a[c];
    d && "DC" === d.type && b.push(["ABCD"[c - 5], c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, setZero:function() {
  var b = Entry.hw.sendQueue, a;
  for (a in Entry.Bitbrick.PORT_MAP) {
    b[a] = 0;
  }
  Entry.hw.update();
}, name:"bitbrick", servoMaxValue:181, servoMinValue:1, dcMaxValue:100, dcMinValue:-100, monitorTemplate:{keys:["value"], imgPath:"hw/bitbrick.png", width:400, height:400, listPorts:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, 
y:0}}, A:{name:Lang.Hw.port_en + " A " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, B:{name:Lang.Hw.port_en + " B " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, C:{name:Lang.Hw.port_en + " C " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, D:{name:Lang.Hw.port_en + " D " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.bitbrick_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT").appendField(" \uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_sensor_value = function(b, a) {
  var c = a.getStringField("PORT");
  return Entry.hw.portData[c].value;
};
Blockly.Blocks.bitbrick_is_touch_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.BITBRICK_touch).appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.touchList), "PORT").appendField("\uc774(\uac00) \ub20c\ub838\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_is_touch_pressed = function(b, a) {
  return 0 === Entry.hw.portData[a.getStringField("PORT")].value;
};
Blockly.Blocks.bitbrick_turn_off_color_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_color_led = function(b, a) {
  Entry.hw.sendQueue.LEDR = 0;
  Entry.hw.sendQueue.LEDG = 0;
  Entry.hw.sendQueue.LEDB = 0;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_rgb = function(b, a) {
  var c = a.getNumberValue("rValue"), d = a.getNumberValue("gValue"), e = a.getNumberValue("bValue"), f = Entry.adjustValueWithMaxMin, g = Entry.hw.sendQueue;
  g.LEDR = f(c, 0, 255);
  g.LEDG = f(d, 0, 255);
  g.LEDB = f(e, 0, 255);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \uc0c9 ").appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_picker = function(b, a) {
  var c = a.getStringField("VALUE");
  Entry.hw.sendQueue.LEDR = parseInt(c.substr(1, 2), 16);
  Entry.hw.sendQueue.LEDG = parseInt(c.substr(3, 2), 16);
  Entry.hw.sendQueue.LEDB = parseInt(c.substr(5, 2), 16);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 \uc0c9");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_value = function(b, a) {
  var c = a.getNumberValue("VALUE"), d, e, f, c = c % 200;
  67 > c ? (d = 200 - 3 * c, e = 3 * c, f = 0) : 134 > c ? (c -= 67, d = 0, e = 200 - 3 * c, f = 3 * c) : 201 > c && (c -= 134, d = 3 * c, e = 0, f = 200 - 3 * c);
  Entry.hw.sendQueue.LEDR = d;
  Entry.hw.sendQueue.LEDG = e;
  Entry.hw.sendQueue.LEDB = f;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\uc800\uc74c ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_buzzer = function(b, a) {
  if (a.isStart) {
    return Entry.hw.sendQueue.buzzer = 0, delete a.isStart, a.callReturn();
  }
  var c = a.getNumberValue("VALUE");
  Entry.hw.sendQueue.buzzer = c;
  a.isStart = !0;
  return a;
};
Blockly.Blocks.bitbrick_turn_off_all_motors = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ub4e0 \ubaa8\ud130 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_all_motors = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.Bitbrick;
  d.servoList().map(function(a) {
    c[a[1]] = 0;
  });
  d.dcList().map(function(a) {
    c[a[1]] = 128;
  });
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" \uc18d\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_speed = function(b, a) {
  var c = a.getNumberValue("VALUE"), c = Math.min(c, Entry.Bitbrick.dcMaxValue), c = Math.max(c, Entry.Bitbrick.dcMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = c + 128;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_direction_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.BITBRICK_dc_direction_cw, "CW"], [Lang.Blocks.BITBRICK_dc_direction_ccw, "CCW"]]), "DIRECTION").appendField(" \ubc29\ud5a5").appendField(" \uc18d\ub825");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_direction_speed = function(b, a) {
  var c = "CW" === a.getStringField("DIRECTION"), d = a.getNumberValue("VALUE"), d = Math.min(d, Entry.Bitbrick.dcMaxValue), d = Math.max(d, 0);
  Entry.hw.sendQueue[a.getStringField("PORT")] = c ? d + 128 : 128 - d;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_servomotor_angle = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4 \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.servoList), "PORT").appendField(" \uac01\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_servomotor_angle = function(b, a) {
  var c = a.getNumberValue("VALUE") + 1, c = Math.min(c, Entry.Bitbrick.servoMaxValue), c = Math.max(c, Entry.Bitbrick.servoMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = c;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubcc0\ud658");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT");
  this.appendDummyInput().appendField("\uac12");
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\uc5d0\uc11c");
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_convert_scale = function(b, a) {
  var c = a.getNumberField("PORT"), d = Entry.hw.portData[c].value, c = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (f > g) {
    var h = f, f = g, g = h
  }
  d -= c;
  d *= (g - f) / (e - c);
  d += f;
  d = Math.min(g, d);
  d = Math.max(f, d);
  return Math.round(d);
};
var categoryColor = "#FF9E20";
Blockly.Blocks.start_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_start_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.start_drawing = function(b, a) {
  b.brush ? b.brush.stop = !1 : Entry.setBasicBrush(b);
  Entry.stage.sortZorder();
  b.brush.moveTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.stop_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stop_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_drawing = function(b, a) {
  b.brush && b.shape && (b.brush.stop = !0);
  return a.callReturn();
};
Blockly.Blocks.set_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_1);
  this.appendDummyInput().appendField(new Blockly.FieldColour("#ff0000"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_color = function(b, a) {
  var c = a.getField("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (c = Entry.hex2rgb(c), b.brush.rgb = c, b.brush.endStroke(), b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_random_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_random_color).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_random_color = function(b, a) {
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  if (b.brush) {
    var c = Entry.generateRgb();
    b.brush.rgb = c;
    b.brush.endStroke();
    b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")");
    b.brush.moveTo(b.getX(), -1 * b.getY());
  }
  return a.callReturn();
};
Blockly.Blocks.change_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_thickness = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.thickness += c, 1 > b.brush.thickness && (b.brush.thickness = 1), b.brush.setStrokeStyle(b.brush.thickness), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_thickness = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.thickness = c, b.brush.setStrokeStyle(b.brush.thickness), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.change_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_opacity = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  c = Entry.adjustValueWithMaxMin(b.brush.opacity + c, 0, 100);
  b.brush && (b.brush.opacity = c, b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_opacity = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.opacity = Entry.adjustValueWithMaxMin(c, 0, 100), b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.brush_erase_all = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_brush_erase_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.brush_erase_all = function(b, a) {
  var c = b.brush;
  if (c) {
    var d = c._stroke.style, e = c._strokeStyle.width;
    c.clear().setStrokeStyle(e).beginStroke(d);
    c.moveTo(b.getX(), -1 * b.getY());
  }
  c = b.parent.getStampEntities();
  c.map(function(a) {
    a.removeClone();
  });
  c = null;
  return a.callReturn();
};
Blockly.Blocks.brush_stamp = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stamp).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.brush_stamp = function(b, a) {
  b.parent.addStampEntity(b);
  return a.callReturn();
};
Blockly.Blocks.change_brush_transparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_brush_transparency = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  c = Entry.adjustValueWithMaxMin(b.brush.opacity - c, 0, 100);
  b.brush && (b.brush.opacity = c, b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_brush_tranparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_brush_tranparency = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.opacity = Entry.adjustValueWithMaxMin(c, 0, 100), b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + (1 - b.brush.opacity / 100) + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
var calcArrowColor = "#e8b349", calcBlockColor = "#FFD974", calcFontColor = "#3D3D3D";
Blockly.Blocks.number = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "NUM");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.number = function(b, a) {
  return a.getField("NUM", a);
};
Blockly.Blocks.angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "ANGLE");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.angle = function(b, a) {
  return a.getNumberField("ANGLE");
};
Blockly.Blocks.get_x_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_x_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_x_coordinate = function(b, a) {
  return b.getX();
};
Blockly.Blocks.get_y_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_y_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_y_coordinate = function(b, a) {
  return b.getY();
};
Blockly.Blocks.get_angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_angle, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_angle = function(b, a) {
  return parseFloat(b.getRotation().toFixed(1));
};
Blockly.Blocks.get_rotation_direction = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_rotation_value, "ROTATION"], [Lang.Blocks.CALC_direction_value, "DIRECTION"]], null, !0, calcArrowColor), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_rotation_direction = function(b, a) {
  return "DIRECTION" == a.getField("OPERATOR", a).toUpperCase() ? parseFloat(b.getDirection().toFixed(1)) : parseFloat(b.getRotation().toFixed(1));
};
Blockly.Blocks.distance_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_distance_something_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_distance_something_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.distance_something = function(b, a) {
  var c = a.getField("VALUE", a);
  if ("mouse" == c) {
    return c = Entry.stage.mouseCoordinate, Math.sqrt(Math.pow(b.getX() - c.x, 2) + Math.pow(b.getY() - c.y, 2));
  }
  c = Entry.container.getEntity(c);
  return Math.sqrt(Math.pow(b.getX() - c.getX(), 2) + Math.pow(b.getY() - c.getY(), 2));
};
Blockly.Blocks.coordinate_mouse = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_mouse_1, calcFontColor).appendField(new Blockly.FieldDropdown([["x", "x"], ["y", "y"]], null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_mouse_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.coordinate_mouse = function(b, a) {
  return "x" === a.getField("VALUE", a) ? +Entry.stage.mouseCoordinate.x : +Entry.stage.mouseCoordinate.y;
};
Blockly.Blocks.coordinate_object = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_object_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithSelf", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_object_2, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_coordinate_x_value, "x"], [Lang.Blocks.CALC_coordinate_y_value, "y"], [Lang.Blocks.CALC_coordinate_rotation_value, "rotation"], [Lang.Blocks.CALC_coordinate_direction_value, "direction"], 
  [Lang.Blocks.CALC_coordinate_size_value, "size"], [Lang.Blocks.CALC_picture_index, "picture_index"], [Lang.Blocks.CALC_picture_name, "picture_name"]], null, !0, calcArrowColor), "COORDINATE").appendField(Lang.Blocks.CALC_coordinate_object_3, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.coordinate_object = function(b, a) {
  var c = a.getField("VALUE", a), c = "self" == c ? b : Entry.container.getEntity(c);
  switch(a.getField("COORDINATE", a)) {
    case "x":
      return c.getX();
    case "y":
      return c.getY();
    case "rotation":
      return c.getRotation();
    case "direction":
      return c.getDirection();
    case "picture_index":
      var d = c.parent, d = d.pictures;
      return d.indexOf(c.picture) + 1;
    case "size":
      return +c.getSize().toFixed(1);
    case "picture_name":
      return d = c.parent, d = d.pictures, d[d.indexOf(c.picture)].name;
  }
};
Blockly.Blocks.calc_basic = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["+", "PLUS"], ["-", "MINUS"], ["x", "MULTI"], ["/", "DIVIDE"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_basic = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getNumberValue("LEFTHAND", a), e = a.getNumberValue("RIGHTHAND", a);
  return "PLUS" == c ? d + e : "MINUS" == c ? d - e : "MULTI" == c ? d * e : d / e;
};
Blockly.Blocks.calc_plus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("+", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_plus = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c + d;
};
Blockly.Blocks.calc_minus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("-", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_minus = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c - d;
};
Blockly.Blocks.calc_times = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("x", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_times = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c * d;
};
Blockly.Blocks.calc_divide = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("/", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_divide = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c / d;
};
Blockly.Blocks.calc_mod = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_mod_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_mod = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c % d;
};
Blockly.Blocks.calc_share = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_share_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_share = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return Math.floor(c / d);
};
Blockly.Blocks.calc_operation = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_2, calcFontColor);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_calc_operation_square, "square"], [Lang.Blocks.CALC_calc_operation_root, "root"], [Lang.Blocks.CALC_calc_operation_sin, "sin"], [Lang.Blocks.CALC_calc_operation_cos, "cos"], [Lang.Blocks.CALC_calc_operation_tan, "tan"], [Lang.Blocks.CALC_calc_operation_asin, "asin_radian"], [Lang.Blocks.CALC_calc_operation_acos, "acos_radian"], [Lang.Blocks.CALC_calc_operation_atan, "atan_radian"], [Lang.Blocks.CALC_calc_operation_log, 
  "log"], [Lang.Blocks.CALC_calc_operation_ln, "ln"], [Lang.Blocks.CALC_calc_operation_unnatural, "unnatural"], [Lang.Blocks.CALC_calc_operation_floor, "floor"], [Lang.Blocks.CALC_calc_operation_ceil, "ceil"], [Lang.Blocks.CALC_calc_operation_round, "round"], [Lang.Blocks.CALC_calc_operation_factorial, "factorial"], [Lang.Blocks.CALC_calc_operation_abs, "abs"]], null, !0, calcArrowColor), "VALUE");
  this.setOutput(!0, "Number");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
}};
Entry.block.calc_operation = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getField("VALUE", a);
  if (-1 < ["asin_radian", "acos_radian"].indexOf(d) && (1 < c || -1 > c)) {
    throw Error("x range exceeded");
  }
  d.indexOf("_") && (d = d.split("_")[0]);
  -1 < ["sin", "cos", "tan"].indexOf(d) && (c = Entry.toRadian(c));
  var e = 0;
  switch(d) {
    case "square":
      e = c * c;
      break;
    case "factorial":
      e = Entry.factorial(c);
      break;
    case "root":
      e = Math.sqrt(c);
      break;
    case "log":
      e = Math.log(c) / Math.LN10;
      break;
    case "ln":
      e = Math.log(c);
      break;
    case "asin":
    ;
    case "acos":
    ;
    case "atan":
      e = Entry.toDegrees(Math[d](c));
      break;
    case "unnatural":
      e = c - Math.floor(c);
      0 > c && (e = 1 - e);
      break;
    default:
      e = Math[d](c);
  }
  return Math.round(1E3 * e) / 1E3;
};
Blockly.Blocks.calc_rand = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_rand_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_rand = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getStringValue("RIGHTHAND", a), e = Math.min(c, d), f = Math.max(c, d), c = Entry.isFloat(c);
  return Entry.isFloat(d) || c ? (Math.random() * (f - e) + e).toFixed(2) : Math.floor(Math.random() * (f - e + 1) + e);
};
Blockly.Blocks.get_date = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_date_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_get_date_year, "YEAR"], [Lang.Blocks.CALC_get_date_month, "MONTH"], [Lang.Blocks.CALC_get_date_day, "DAY"], [Lang.Blocks.CALC_get_date_hour, "HOUR"], [Lang.Blocks.CALC_get_date_minute, "MINUTE"], [Lang.Blocks.CALC_get_date_second, "SECOND"]], null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.CALC_get_date_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_date = function(b, a) {
  var c = a.getField("VALUE", a), d = new Date;
  return "YEAR" == c ? d.getFullYear() : "MONTH" == c ? d.getMonth() + 1 : "DAY" == c ? d.getDate() : "HOUR" == c ? d.getHours() : "MINUTE" == c ? d.getMinutes() : d.getSeconds();
};
Blockly.Blocks.get_sound_duration = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds", null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_sound_duration = function(b, a) {
  for (var c = a.getField("VALUE", a), d = b.parent.sounds, e = 0;e < d.length;e++) {
    if (d[e].id == c) {
      return d[e].duration;
    }
  }
};
Blockly.Blocks.reset_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_reset, calcFontColor);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}};
Entry.block.reset_project_timer = function(b, a) {
  Entry.engine.updateProjectTimer(0);
  return a.callReturn();
};
Blockly.Blocks.set_visible_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]], null, !0, calcArrowColor), "ACTION");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}};
Entry.block.set_visible_project_timer = function(b, a) {
  var c = a.getField("ACTION", a), d = Entry.engine.projectTimer;
  "SHOW" == c ? d.setVisible(!0) : d.setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.timer_variable = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.timer_variable = function(b, a) {
  return Entry.container.inputValue.getValue();
};
Blockly.Blocks.get_project_timer_value = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}};
Entry.block.get_project_timer_value = function(b, a) {
  return Entry.engine.projectTimer.getValue();
};
Blockly.Blocks.char_at = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_char_at_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.char_at = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a) - 1;
  if (0 > d || d > c.length - 1) {
    throw Error();
  }
  return c[d];
};
Blockly.Blocks.length_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_length_of_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_length_of_string_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.length_of_string = function(b, a) {
  return a.getStringValue("STRING", a).length;
};
Blockly.Blocks.substring = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_substring_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_2, calcFontColor);
  this.appendValueInput("START").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_3, calcFontColor);
  this.appendValueInput("END").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.substring = function(b, a) {
  var c = a.getStringValue("STRING", a), d = a.getNumberValue("START", a) - 1, e = a.getNumberValue("END", a) - 1, f = c.length - 1;
  if (0 > d || 0 > e || d > f || e > f) {
    throw Error();
  }
  return c.substring(Math.min(d, e), Math.max(d, e) + 1);
};
Blockly.Blocks.replace_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_replace_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_2, calcFontColor);
  this.appendValueInput("OLD_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_3, calcFontColor);
  this.appendValueInput("NEW_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.replace_string = function(b, a) {
  return a.getStringValue("STRING", a).replace(new RegExp(a.getStringValue("OLD_WORD", a), "gm"), a.getStringValue("NEW_WORD", a));
};
Blockly.Blocks.change_string_case = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_2, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_change_string_case_sub_1, "toUpperCase"], [Lang.Blocks.CALC_change_string_case_sub_2, "toLowerCase"]], null, !0, calcArrowColor), "CASE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_3, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.change_string_case = function(b, a) {
  return a.getStringValue("STRING", a)[a.getField("CASE", a)]();
};
Blockly.Blocks.index_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_index_of_string_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.index_of_string = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getStringValue("RIGHTHAND", a), c = c.indexOf(d);
  return -1 < c ? c + 1 : 0;
};
Blockly.Blocks.combine_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_1, calcFontColor);
  this.appendValueInput("VALUE1").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_2, calcFontColor);
  this.appendValueInput("VALUE2").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_3, calcFontColor);
  this.setInputsInline(!0);
  this.setOutput(!0, "String");
}};
Entry.block.combine_something = function(b, a) {
  var c = a.getStringValue("VALUE1", a), d = a.getStringValue("VALUE2", a);
  return c + d;
};
Blockly.Blocks.get_sound_volume = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_volume, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_sound_volume = function(b, a) {
  return 100 * createjs.Sound.getVolume();
};
Blockly.Blocks.quotient_and_mod = {init:function() {
  this.setColour(calcBlockColor);
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, 
  "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR")) : "en" == Lang.type && (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR"), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", 
  "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]));
  this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_4, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.quotient_and_mod = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  if (isNaN(c) || isNaN(d)) {
    throw Error();
  }
  return "QUOTIENT" == a.getField("OPERATOR", a) ? Math.floor(c / d) : c % d;
};
Blockly.Blocks.choose_project_timer_action = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_choose_project_timer_action_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_choose_project_timer_action_sub_1, "START"], [Lang.Blocks.CALC_choose_project_timer_action_sub_2, "STOP"], [Lang.Blocks.CALC_choose_project_timer_action_sub_3, "RESET"]], null, !0, calcArrowColor), "ACTION").appendField(Lang.Blocks.CALC_choose_project_timer_action_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", 
  "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}};
Entry.block.choose_project_timer_action = function(b, a) {
  var c = a.getField("ACTION"), d = Entry.engine, e = d.projectTimer;
  "START" == c ? e.isInit ? e.isInit && e.isPaused && (e.pauseStart && (e.pausedTime += (new Date).getTime() - e.pauseStart), delete e.pauseStart, e.isPaused = !1) : d.startProjectTimer() : "STOP" == c ? e.isInit && !e.isPaused && (e.isPaused = !0, e.pauseStart = (new Date).getTime()) : "RESET" == c && e.isInit && (e.setValue(0), e.start = (new Date).getTime(), e.pausedTime = 0, delete e.pauseStart);
  return a.callReturn();
};
Blockly.Blocks.wait_second = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_1);
  this.appendValueInput("SECOND").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.wait_second = function(b, a) {
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var c = a.getNumberValue("SECOND", a), c = 60 / (Entry.FPS || 60) * c * 1E3;
  setTimeout(function() {
    a.timeFlag = 0;
  }, c);
  return a;
};
Blockly.Blocks.repeat_basic = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.repeat_basic = function(b, a) {
  var c;
  if (!a.isLooped) {
    a.isLooped = !0;
    c = a.getNumberValue("VALUE", a);
    if (0 > c) {
      throw Error(Lang.Blocks.FLOW_repeat_basic_errorMsg);
    }
    a.iterCount = Math.floor(c);
  }
  if (0 == a.iterCount || 0 > a.iterCount) {
    return delete a.isLooped, delete a.iterCount, a.callReturn();
  }
  a.iterCount--;
  return a.getStatement("DO", a);
};
Blockly.Blocks.repeat_inf = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_inf).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.repeat_inf = function(b, a) {
  a.isLooped = !0;
  return a.getStatement("DO");
};
Blockly.Blocks.stop_repeat = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_repeat).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_repeat = function(b, a) {
  return this.executor.break();
};
Blockly.Blocks.wait_until_true = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.wait_until_true = function(b, a) {
  return a.getBooleanValue("BOOL", a) ? a.callReturn() : a;
};
Blockly.Blocks._if = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block._if = function(b, a) {
  return a.isLooped ? (delete a.isLooped, a.callReturn()) : a.getBooleanValue("BOOL", a) ? (a.isLooped = !0, a.getStatement("STACK", a)) : a.callReturn();
};
Blockly.Blocks.if_else = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK_IF");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_3);
  this.appendStatementInput("STACK_ELSE");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.if_else = function(b, a) {
  if (a.isLooped) {
    return delete a.isLooped, a.callReturn();
  }
  var c = a.getBooleanValue("BOOL", a);
  a.isLooped = !0;
  return c ? a.getStatement("STACK_IF", a) : a.getStatement("STACK_ELSE", a);
};
Blockly.Blocks.create_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("clone"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.create_clone = function(b, a) {
  var c = a.getField("VALUE", a), d = a.callReturn();
  "self" == c ? b.parent.addCloneEntity(b.parent, b, null) : Entry.container.getObject(c).addCloneEntity(b.parent, null, null);
  return d;
};
Blockly.Blocks.delete_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.delete_clone = function(b, a) {
  if (!b.isClone) {
    return a.callReturn();
  }
  b.removeClone();
};
Blockly.Blocks.when_clone_start = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_clone.png", "*", "start")).appendField(Lang.Blocks.FLOW_when_clone_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_clone_start = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.stop_run = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_run).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_run = function(b, a) {
  return Entry.engine.toggleStop();
};
Blockly.Blocks.repeat_while_true = {init:function() {
  this.setColour("#498deb");
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION").appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"))) : (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), 
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION"), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*")));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.repeat_while_true = function(b, a) {
  var c = a.getBooleanValue("BOOL", a);
  "until" == a.getField("OPTION", a) && (c = !c);
  return (a.isLooped = c) ? a.getStatement("DO", a) : a.callReturn();
};
Blockly.Blocks.stop_object = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_stop_object_all, "all"], [Lang.Blocks.FLOW_stop_object_this_object, "thisOnly"], [Lang.Blocks.FLOW_stop_object_this_thread, "thisThread"], [Lang.Blocks.FLOW_stop_object_other_thread, "otherThread"]]), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_object = function(b, a) {
  var c = a.getField("TARGET", a), d = Entry.container;
  switch(c) {
    case "all":
      return d.clearRunningState(), this.die();
    case "thisOnly":
      return b.parent.script.clearExecutorsByEntity(b), this.die();
    case "thisThread":
      return this.die();
    case "otherThread":
      b.parent.script.clearExecutors(), b.parent.script.addExecutor(this.executor);
  }
};
Blockly.Blocks.restart_project = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_restart).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.restart_project = function(b, a) {
  Entry.engine.toggleStop();
  Entry.engine.toggleRun();
};
Blockly.Blocks.remove_all_clones = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_all_clones = function(b, a) {
  var c = b.parent.getClonedEntities();
  c.map(function(a) {
    a.removeClone();
  });
  c = null;
  return a.callReturn();
};
Entry.block.functionAddButton = {skeleton:"basic_button", color:"#eee", isNotFor:["functionInit"], template:"%1", params:[{type:"Text", text:"\ud568\uc218 \ucd94\uac00", color:"#333", align:"center"}], events:{mousedown:[function() {
  Entry.variableContainer.createFunction();
}]}};
Blockly.Blocks.function_field_label = {init:function() {
  this.setColour("#f9c535");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_explanation_1), "NAME");
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_label = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#f9c535", template:"%1%2", params:[{type:"TextInput", value:"\ud568\uc218"}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_field_string = {init:function() {
  this.setColour("#FFD974");
  this.appendValueInput("PARAM").setCheck(["String"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_string = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#ffd974", template:"%1%2", params:[{type:"Block", accept:"stringMagnet", restore:!0}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_field_boolean = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("PARAM").setCheck(["Boolean"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_boolean = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#aeb8ff", template:"%1%2", params:[{type:"Block", accept:"booleanMagnet", restore:!0}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_param_string = {init:function() {
  this.setEditable(!1);
  this.setColour("#FFD974");
  this.setOutput(!0, ["String", "Number"]);
  this.setInputsInline(!0);
}, domToMutation:function(b) {
  b.getElementsByTagName("field");
  this.hashId = b.getAttribute("hashid");
  (b = Entry.Func.targetFunc.stringHash[this.hashId]) || (b = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_character_variable + b), "");
}, mutationToDom:function() {
  var b = document.createElement("mutation");
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_param_string = function(b, a, c) {
  return a.register[a.hashId].run();
};
Entry.block.function_param_string = {skeleton:"basic_string_field", color:"#ffd974", template:"\ubb38\uc790/\uc22b\uc790\uac12", func:function() {
  return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
}};
Blockly.Blocks.function_param_boolean = {init:function() {
  this.setEditable(!1);
  this.setColour("#AEB8FF");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, domToMutation:function(b) {
  b.getElementsByTagName("field");
  this.hashId = b.getAttribute("hashid");
  (b = Entry.Func.targetFunc.booleanHash[this.hashId]) || (b = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_logical_variable + b), "");
}, mutationToDom:function() {
  var b = document.createElement("mutation");
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_param_boolean = function(b, a, c) {
  return a.register[a.hashId].run();
};
Entry.block.function_param_boolean = {skeleton:"basic_boolean_field", color:"#aeb8ff", template:"\ud310\ub2e8\uac12", func:function() {
  return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
}};
Blockly.Blocks.function_create = {init:function() {
  this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_define);
  this.setColour("#cc7337");
  this.appendValueInput("FIELD").setCheck(["Param"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.function_create = function(b, a) {
  return a.callReturn();
};
Entry.block.function_create = {skeleton:"basic", color:"#cc7337", event:"funcDef", template:"\ud568\uc218 \uc815\uc758\ud558\uae30 %1 %2", params:[{type:"Block", accept:"paramMagnet", value:{type:"function_field_label"}}, {type:"Indicator", img:"/lib/entryjs/images/block_icon/function_03.png", size:12}], func:function() {
}};
Blockly.Blocks.function_general = {init:function() {
  this.setColour("#cc7337");
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, domToMutation:function(b) {
  var a = b.getElementsByTagName("field");
  this.appendDummyInput().appendField("");
  a.length || this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_function);
  for (var c = 0;c < a.length;c++) {
    var d = a[c], e = d.getAttribute("hashid");
    switch(d.getAttribute("type").toLowerCase()) {
      case "label":
        this.appendDummyInput().appendField(d.getAttribute("content"));
        break;
      case "string":
        this.appendValueInput(e).setCheck(["String", "Number"]);
        break;
      case "boolean":
        this.appendValueInput(e).setCheck(["Boolean"]);
    }
  }
  this.hashId = b.getAttribute("hashid");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
}, mutationToDom:function() {
  for (var b = document.createElement("mutation"), a = 1;a < this.inputList.length;a++) {
    var c = this.inputList[a];
    if (c.fieldRow[0] && c.fieldRow[0] instanceof Blockly.FieldLabel) {
      var c = c.fieldRow[0], d = document.createElement("field");
      d.setAttribute("type", "label");
      d.setAttribute("content", c.text_);
    } else {
      c.connection && "String" == c.connection.check_[0] ? (d = document.createElement("field"), d.setAttribute("type", "string"), d.setAttribute("hashid", c.name)) : c.connection && "Boolean" == c.connection.check_[0] && (d = document.createElement("field"), d.setAttribute("type", "boolean"), d.setAttribute("hashid", c.name));
    }
    b.appendChild(d);
  }
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_general = function(b, a) {
  if (!a.thread) {
    var c = Entry.variableContainer.getFunction(a.hashId);
    a.thread = new Entry.Script(b);
    a.thread.register = a.values;
    for (var d = 0;d < c.content.childNodes.length;d++) {
      "function_create" == c.content.childNodes[d].getAttribute("type") && a.thread.init(c.content.childNodes[d]);
    }
  }
  if (c = Entry.Engine.computeThread(b, a.thread)) {
    return a.thread = c, a;
  }
  delete a.thread;
  return a.callReturn();
};
Entry.block.function_general = {skeleton:"basic", color:"#cc7337", template:"\ud568\uc218", params:[], func:function(b) {
  if (!this.initiated) {
    this.initiated = !0;
    var a = Entry.variableContainer.getFunction(this.block.type.substr(5, 9));
    this.funcCode = a.content;
    this.funcExecutor = this.funcCode.raiseEvent("funcDef", b)[0];
    this.funcExecutor.register.params = this.getParams();
    this.funcExecutor.register.paramMap = a.paramMap;
  }
  this.funcExecutor.execute();
  if (!this.funcExecutor.isEnd()) {
    return this.funcCode.removeExecutor(this.funcExecutor), Entry.STATIC.BREAK;
  }
}};
Entry.Hamster = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, outputA:0, outputB:0, leftLed:0, rightLed:0, note:0, lineTracerMode:0, lineTracerModeId:0, lineTracerSpeed:5, ioModeA:0, ioModeB:0}, setZero:function() {
  var b = Entry.Hamster.PORT_MAP, a = Entry.hw.sendQueue, c;
  for (c in b) {
    a[c] = b[c];
  }
  Entry.hw.update();
  b = Entry.Hamster;
  b.lineTracerModeId = 0;
  b.lineTracerStateId = -1;
  b.tempo = 60;
  b.removeAllTimeouts();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(b, a) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  b.lineTracerMode = a;
  b.lineTracerModeId = this.lineTracerModeId;
}, name:"hamster", monitorTemplate:{imgPath:"hw/hamster.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.HAMSTER_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.HAMSTER_sensor_accelerationX, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.HAMSTER_sensor_accelerationY, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.HAMSTER_sensor_accelerationZ, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", 
pos:{x:0, y:0}}, note:{name:Lang.Hw.buzzer + "2", type:"output", pos:{x:0, y:0}}, outputA:{name:Lang.Hw.output + "A", type:"output", pos:{x:0, y:0}}, outputB:{name:Lang.Hw.output + "B", type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.HAMSTER_sensor_leftProximity, type:"input", pos:{x:122, y:156}}, rightProximity:{name:Lang.Blocks.HAMSTER_sensor_rightProximity, type:"input", pos:{x:10, y:108}}, leftFloor:{name:Lang.Blocks.HAMSTER_sensor_leftFloor, type:"input", pos:{x:100, 
y:234}}, rightFloor:{name:Lang.Blocks.HAMSTER_sensor_rightFloor, type:"input", pos:{x:13, y:180}}, lightsensor:{name:Lang.Blocks.HAMSTER_sensor_light, type:"input", pos:{x:56, y:189}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:209, y:115}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:98, y:30}}, leftLed:{name:Lang.Hw.left + " " + Lang.Hw.led, type:"output", pos:{x:87, y:210}}, rightLed:{name:Lang.Hw.right + " " + Lang.Hw.led, type:"output", pos:{x:24, y:168}}}, mode:"both"}};
Blockly.Blocks.hamster_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.hamster_hand_found = function(b, a) {
  var c = Entry.hw.portData;
  return 50 < c.leftProximity || 50 < c.rightProximity;
};
Blockly.Blocks.hamster_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_sensor_leftProximity, "leftProximity"], [Lang.Blocks.HAMSTER_sensor_rightProximity, "rightProximity"], [Lang.Blocks.HAMSTER_sensor_leftFloor, "leftFloor"], [Lang.Blocks.HAMSTER_sensor_rightFloor, "rightFloor"], [Lang.Blocks.HAMSTER_sensor_accelerationX, "accelerationX"], [Lang.Blocks.HAMSTER_sensor_accelerationY, "accelerationY"], [Lang.Blocks.HAMSTER_sensor_accelerationZ, "accelerationZ"], [Lang.Blocks.HAMSTER_sensor_light, 
  "light"], [Lang.Blocks.HAMSTER_sensor_temperature, "temperature"], [Lang.Blocks.HAMSTER_sensor_signalStrength, "signalStrength"], [Lang.Blocks.HAMSTER_sensor_inputA, "inputA"], [Lang.Blocks.HAMSTER_sensor_inputB, "inputB"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.hamster_value = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.hamster_move_forward_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_once).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_once = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      switch(a.boardState) {
        case 1:
          2 > a.count ? (50 > d.leftFloor && 50 > d.rightFloor ? a.count++ : a.count = 0, d = d.leftFloor - d.rightFloor, c.leftWheel = 45 + .25 * d, c.rightWheel = 45 - .25 * d) : (a.count = 0, a.boardState = 2);
          break;
        case 2:
          d = d.leftFloor - d.rightFloor;
          c.leftWheel = 45 + .25 * d;
          c.rightWheel = 45 - .25 * d;
          a.boardState = 3;
          var e = setTimeout(function() {
            a.boardState = 4;
            Entry.Hamster.removeTimeout(e);
          }, 250);
          Entry.Hamster.timeouts.push(e);
          break;
        case 3:
          d = d.leftFloor - d.rightFloor;
          c.leftWheel = 45 + .25 * d;
          c.rightWheel = 45 - .25 * d;
          break;
        case 4:
          c.leftWheel = 0, c.rightWheel = 0, a.boardState = 0, a.isMoving = !1;
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  c.leftWheel = 45;
  c.rightWheel = 45;
  Entry.Hamster.setLineTracerMode(c, 0);
  return a;
};
Blockly.Blocks.hamster_turn_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_once_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_once_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_once = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      if (a.isLeft) {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < d.leftFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > d.leftFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > d.leftFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < d.leftFloor && (a.boardState = 5);
            break;
          case 5:
            d = d.leftFloor - d.rightFloor, -15 < d ? (c.leftWheel = 0, c.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (c.leftWheel = .5 * d, c.rightWheel = .5 * -d);
        }
      } else {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < d.rightFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > d.rightFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > d.rightFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < d.rightFloor && (a.boardState = 5);
            break;
          case 5:
            d = d.rightFloor - d.leftFloor, -15 < d ? (c.leftWheel = 0, c.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (c.leftWheel = .5 * -d, c.rightWheel = .5 * d);
        }
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    delete a.isLeft;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (a.isLeft = !0, c.leftWheel = -45, c.rightWheel = 45) : (a.isLeft = !1, c.leftWheel = 45, c.rightWheel = -45);
  Entry.Hamster.setLineTracerMode(c, 0);
  return a;
};
Blockly.Blocks.hamster_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = 30;
  c.rightWheel = 30;
  Entry.Hamster.setLineTracerMode(c, 0);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, c);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_backward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = -30;
  c.rightWheel = -30;
  Entry.Hamster.setLineTracerMode(c, 0);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, c);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (c.leftWheel = -30, c.rightWheel = 30) : (c.leftWheel = 30, c.rightWheel = -30);
  Entry.Hamster.setLineTracerMode(c, 0);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, c);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_both_wheels_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + d : d;
  c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e;
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_both_wheels_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = a.getNumberValue("LEFT");
  c.rightWheel = a.getNumberValue("RIGHT");
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_wheel_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e : ("RIGHT" != d && (c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e), c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e);
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_wheel_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = e : ("RIGHT" != d && (c.leftWheel = e), c.rightWheel = e);
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_using = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_using_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_using_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_using_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_using = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("COLOR"), e = a.getField("DIRECTION"), f = 1;
  "RIGHT" == e ? f = 2 : "BOTH" == e && (f = 3);
  "WHITE" == d && (f += 7);
  c.leftWheel = 0;
  c.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(c, f);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_until = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_until_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_until_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.Blocks.HAMSTER_front, "FRONT"], [Lang.Blocks.HAMSTER_rear, "REAR"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_until_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_until = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData, e = a.getField("COLOR"), f = a.getField("DIRECTION"), g = 4;
  "RIGHT" == f ? g = 5 : "FRONT" == f ? g = 6 : "REAR" == f && (g = 7);
  "WHITE" == e && (g += 7);
  if (a.isStart) {
    if (e = Entry.Hamster, d.lineTracerStateId != e.lineTracerStateId && (e.lineTracerStateId = d.lineTracerStateId, 64 == d.lineTracerState)) {
      return delete a.isStart, Entry.engine.isContinue = !1, e.setLineTracerMode(c, 0), a.callReturn();
    }
  } else {
    a.isStart = !0, c.leftWheel = 0, c.rightWheel = 0, Entry.Hamster.setLineTracerMode(c, g);
  }
  return a;
};
Blockly.Blocks.hamster_set_following_speed_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_following_speed_to_1).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "SPEED").appendField(Lang.Blocks.HAMSTER_set_following_speed_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_following_speed_to = function(b, a) {
  Entry.hw.sendQueue.lineTracerSpeed = +a.getField("SPEED", a);
  return a.callReturn();
};
Blockly.Blocks.hamster_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_stop = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = 0;
  c.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.HAMSTER_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.HAMSTER_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_led_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a), e = +a.getField("COLOR", a);
  "LEFT" == d ? c.leftLed = e : ("RIGHT" != d && (c.leftLed = e), c.rightLed = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_led = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a);
  "LEFT" == d ? c.leftLed = 0 : ("RIGHT" != d && (c.leftLed = 0), c.rightLed = 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_beep = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 440;
  c.note = 0;
  var d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, 200);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_buzzer_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("VALUE");
  c.buzzer = void 0 != c.buzzer ? c.buzzer + d : d;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_buzzer_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = a.getNumberValue("VALUE");
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_buzzer = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = 0;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.HAMSTER_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_play_note_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.note = 0;
    return a.callReturn();
  }
  var d = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Hamster.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 0;
  c.note = d + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      c.note = 0;
      Entry.Hamster.removeTimeout(h);
    }, f - 100);
    Entry.Hamster.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(k);
  }, f);
  Entry.Hamster.timeouts.push(k);
  return a;
};
Blockly.Blocks.hamster_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_rest_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var d = a.getNumberValue("VALUE"), d = 6E4 * d / Entry.Hamster.tempo;
  c.buzzer = 0;
  c.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(e);
  }, d);
  Entry.Hamster.timeouts.push(e);
  return a;
};
Blockly.Blocks.hamster_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_tempo_by = function(b, a) {
  Entry.Hamster.tempo += a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_tempo_to = function(b, a) {
  Entry.Hamster.tempo = a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_port_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_port_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_port_to_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_analog_input, "0"], [Lang.Blocks.HAMSTER_digital_input, "1"], [Lang.Blocks.HAMSTER_servo_output, "8"], [Lang.Blocks.HAMSTER_pwm_output, "9"], [Lang.Blocks.HAMSTER_digital_output, 
  "10"]]), "MODE").appendField(Lang.Blocks.HAMSTER_set_port_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_port_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("PORT", a), e = +a.getField("MODE", a);
  "A" == d ? c.ioModeA = e : ("B" != d && (c.ioModeA = e), c.ioModeB = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_output_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_change_output_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_output_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == d ? c.outputA = void 0 != c.outputA ? c.outputA + e : e : ("B" != d && (c.outputA = void 0 != c.outputA ? c.outputA + e : e), c.outputB = void 0 != c.outputB ? c.outputB + e : e);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_output_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_output_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_output_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == d ? c.outputA = e : ("B" != d && (c.outputA = e), c.outputB = e);
  return a.callReturn();
};
Blockly.Blocks.is_clicked = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_clicked, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_clicked = function(b, a) {
  return Entry.stage.isClick;
};
Blockly.Blocks.is_press_some_key = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_press_some_key = function(b, a) {
  var c = +a.getField("VALUE", a);
  return 0 <= Entry.pressedKeys.indexOf(c);
};
Blockly.Blocks.reach_something = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("collision"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.reach_something = function(b, a) {
  if (!b.getVisible()) {
    return !1;
  }
  var c = a.getField("VALUE", a), d = b.object, e = /wall/.test(c), f = ndgmr.checkPixelCollision;
  if (e) {
    switch(e = Entry.stage.wall, c) {
      case "wall":
        if (f(d, e.up, .2, !0) || f(d, e.down, .2, !0) || f(d, e.left, .2, !0) || f(d, e.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_up":
        if (f(d, e.up, .2, !0)) {
          return !0;
        }
        break;
      case "wall_down":
        if (f(d, e.down, .2, !0)) {
          return !0;
        }
        break;
      case "wall_right":
        if (f(d, e.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_left":
        if (f(d, e.left, .2, !0)) {
          return !0;
        }
      ;
    }
  } else {
    if ("mouse" == c) {
      return f = Entry.stage.canvas, f = d.globalToLocal(f.mouseX, f.mouseY), d.hitTest(f.x, f.y);
    }
    c = Entry.container.getEntity(c);
    if ("textBox" == c.type || "textBox" == b.type) {
      f = c.object.getTransformedBounds();
      d = d.getTransformedBounds();
      if (Entry.checkCollisionRect(d, f)) {
        return !0;
      }
      for (var c = c.parent.clonedEntities, e = 0, g = c.length;e < g;e++) {
        var h = c[e];
        if (!h.isStamp && h.getVisible() && Entry.checkCollisionRect(d, h.object.getTransformedBounds())) {
          return !0;
        }
      }
    } else {
      if (c.getVisible() && f(d, c.object, .2, !0)) {
        return !0;
      }
      c = c.parent.clonedEntities;
      e = 0;
      for (g = c.length;e < g;e++) {
        if (h = c[e], !h.isStamp && h.getVisible() && f(d, h.object, .2, !0)) {
          return !0;
        }
      }
    }
  }
  return !1;
};
Blockly.Blocks.boolean_comparison = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["=", "EQUAL"], ["<", "SMALLER"], [">", "BIGGER"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_comparison = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getNumberValue("LEFTHAND", a), e = a.getNumberValue("RIGHTHAND", a);
  return "EQUAL" == c ? d == e : "BIGGER" == c ? d > e : d < e;
};
Blockly.Blocks.boolean_equal = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField("=", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_equal = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getStringValue("RIGHTHAND", a);
  return c == d;
};
Blockly.Blocks.boolean_bigger = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(">", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_bigger = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c > d;
};
Blockly.Blocks.boolean_smaller = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("<", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_smaller = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c < d;
};
Blockly.Blocks.boolean_and_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_boolean_and, "AND"], [Lang.Blocks.JUDGEMENT_boolean_or, "OR"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_and_or = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getBooleanValue("LEFTHAND", a), e = a.getBooleanValue("RIGHTHAND", a);
  return "AND" == c ? d && e : d || e;
};
Blockly.Blocks.boolean_and = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_and, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_and = function(b, a) {
  var c = a.getBooleanValue("LEFTHAND", a), d = a.getBooleanValue("RIGHTHAND", a);
  return c && d;
};
Blockly.Blocks.boolean_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_or, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_or = function(b, a) {
  var c = a.getBooleanValue("LEFTHAND", a), d = a.getBooleanValue("RIGHTHAND", a);
  return c || d;
};
Blockly.Blocks.boolean_not = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_1, "#3D3D3D");
  this.appendValueInput("VALUE").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_2, "#3D3D3D");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_not = function(b, a) {
  return !a.getBooleanValue("VALUE");
};
Blockly.Blocks.true_or_false = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_true, "true"], [Lang.Blocks.JUDGEMENT_false, "false"]]), "VALUE");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.true_or_false = function(b, a) {
  return "true" == a.children[0].textContent;
};
Blockly.Blocks.True = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_true, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.True = function(b, a) {
  return !0;
};
Blockly.Blocks.False = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_false, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.False = function(b, a) {
  return !1;
};
Blockly.Blocks.boolean_basic_operator = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["=", "EQUAL"], [">", "GREATER"], ["<", "LESS"], ["\u2265", "GREATER_OR_EQUAL"], ["\u2264", "LESS_OR_EQUAL"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_basic_operator = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getStringValue("LEFTHAND", a), e = a.getStringValue("RIGHTHAND", a);
  switch(c) {
    case "EQUAL":
      return d == e;
    case "GREATER":
      return +d > +e;
    case "LESS":
      return +d < +e;
    case "GREATER_OR_EQUAL":
      return +d >= +e;
    case "LESS_OR_EQUAL":
      return +d <= +e;
  }
};
Blockly.Blocks.show = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_show).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.show = function(b, a) {
  b.setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.hide = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_hide).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hide = function(b, a) {
  b.setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.dialog_time = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dialog_time = function(b, a) {
  if (!a.isStart) {
    var c = a.getNumberValue("SECOND", a), d = a.getStringValue("VALUE", a), e = a.getField("OPTION", a);
    a.isStart = !0;
    a.timeFlag = 1;
    d || "number" == typeof d || (d = "    ");
    d = Entry.convertToRoundedDecimals(d, 3);
    new Entry.Dialog(b, d, e);
    b.syncDialogVisible(b.getVisible());
    setTimeout(function() {
      a.timeFlag = 0;
    }, 1E3 * c);
  }
  return 0 == a.timeFlag ? (delete a.timeFlag, delete a.isStart, b.dialog && b.dialog.remove(), a.callReturn()) : a;
};
Blockly.Blocks.dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dialog = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  c || "number" == typeof c || (c = "    ");
  var d = a.getField("OPTION", a), c = Entry.convertToRoundedDecimals(c, 3);
  new Entry.Dialog(b, c, d);
  b.syncDialogVisible(b.getVisible());
  return a.callReturn();
};
Blockly.Blocks.remove_dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_remove_dialog).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_dialog = function(b, a) {
  b.dialog && b.dialog.remove();
  return a.callReturn();
};
Blockly.Blocks.change_to_nth_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_nth_shape = function(b, a) {
  var c = a.getField("VALUE", a), c = b.parent.getPicture(c);
  b.setImage(c);
  return a.callReturn();
};
Blockly.Blocks.change_to_next_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_near_shape_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_shape_next, "next"], [Lang.Blocks.LOOKS_change_shape_prev, "prev"]]), "DRIECTION").appendField(Lang.Blocks.LOOKS_change_to_near_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_next_shape = function(b, a) {
  var c;
  c = a.fields && "prev" === a.getStringField("DRIECTION") ? b.parent.getPrevPicture(b.picture.id) : b.parent.getNextPicture(b.picture.id);
  b.setImage(c);
  return a.callReturn();
};
Blockly.Blocks.set_effect_volume = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect_volume = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d + b.effect.hue : "lens" != c && "swriling" != c && "pixel" != c && "mosaic" != c && ("brightness" == c ? b.effect.brightness = d + b.effect.brightness : "blur" != c && "opacity" == c && (b.effect.alpha += d / 100));
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d : "lens" != c && "swriling" != c && "pixel" != c && "mosaic" != c && ("brightness" == c ? b.effect.brightness = d : "blur" != c && "opacity" == c && (b.effect.alpha = d / 100));
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.erase_all_effects = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_erase_all_effects).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.erase_all_effects = function(b, a) {
  b.resetFilter();
  return a.callReturn();
};
Blockly.Blocks.change_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_scale_percent = function(b, a) {
  var c = (a.getNumberValue("VALUE", a) + 100) / 100;
  b.setScaleX(b.getScaleX() * c);
  b.setScaleY(b.getScaleY() * c);
  return a.callReturn();
};
Blockly.Blocks.set_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_scale_percent = function(b, a) {
  var c = a.getNumberValue("VALUE", a) / 100, d = b.snapshot_;
  b.setScaleX(c * d.scaleX);
  b.setScaleY(c * d.scaleY);
  return a.callReturn();
};
Blockly.Blocks.change_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_scale_size = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setSize(b.getSize() + c);
  return a.callReturn();
};
Blockly.Blocks.set_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_scale_size = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setSize(c);
  return a.callReturn();
};
Blockly.Blocks.flip_y = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_y = function(b, a) {
  b.setScaleX(-1 * b.getScaleX());
  return a.callReturn();
};
Blockly.Blocks.flip_x = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_x).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_x = function(b, a) {
  b.setScaleY(-1 * b.getScaleY());
  return a.callReturn();
};
Blockly.Blocks.set_object_order = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("objectSequence"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_object_order = function(b, a) {
  var c = a.getField("VALUE", a), d = Entry.container.getCurrentObjects().indexOf(b.parent);
  if (-1 < d) {
    return Entry.container.moveElementByBlock(d, c), a.callReturn();
  }
  throw Error("object is not available");
};
Blockly.Blocks.get_pictures = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.get_pictures = function(b, a) {
  return a.getStringField("VALUE");
};
Blockly.Blocks.change_to_some_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_some_shape = function(b, a) {
  var c = a.getStringValue("VALUE");
  Entry.parseNumber(c);
  c = b.parent.getPicture(c);
  b.setImage(c);
  return a.callReturn();
};
Blockly.Blocks.add_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.add_effect_amount = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hsv = d + b.effect.hsv : "brightness" == c ? b.effect.brightness = d + b.effect.brightness : "transparency" == c && (b.effect.alpha -= d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.change_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_effect_amount = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hsv = d : "brightness" == c ? b.effect.brightness = d : "transparency" == c && (b.effect.alpha = 1 - d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect_amount = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d + b.effect.hue : "brightness" == c ? b.effect.brightness = d + b.effect.brightness : "transparency" == c && (b.effect.alpha -= d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_entity_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_entity_effect = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d : "brightness" == c ? b.effect.brightness = d : "transparency" == c && (b.effect.alpha = 1 - d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.change_object_index = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_object_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_object_index_sub_1, "FRONT"], [Lang.Blocks.LOOKS_change_object_index_sub_2, "FORWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_3, "BACKWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_4, "BACK"]]), "LOCATION").appendField(Lang.Blocks.LOOKS_change_object_index_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_object_index = function(b, a) {
  var c, d = a.getField("LOCATION", a), e = Entry.container.getCurrentObjects(), f = e.indexOf(b.parent), e = e.length - 1;
  if (0 > f) {
    throw Error("object is not available for current scene");
  }
  switch(d) {
    case "FRONT":
      c = 0;
      break;
    case "FORWARD":
      c = Math.max(0, f - 1);
      break;
    case "BACKWARD":
      c = Math.min(e, f + 1);
      break;
    case "BACK":
      c = e;
  }
  Entry.container.moveElementByBlock(f, c);
  return a.callReturn();
};
Blockly.Blocks.move_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_direction = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setX(b.getX() + c * Math.cos((b.getRotation() + b.getDirection() - 90) / 180 * Math.PI));
  b.setY(b.getY() - c * Math.sin((b.getRotation() + b.getDirection() - 90) / 180 * Math.PI));
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.move_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_x = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setX(b.getX() + c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.move_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_y = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setY(b.getY() + c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_xy_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE1", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.x = a.getNumberValue("VALUE2", a);
    a.y = a.getNumberValue("VALUE3", a);
  }
  if (0 != a.frameCount) {
    c = a.x - b.getX();
    var d = a.y - b.getY();
    c /= a.frameCount;
    d /= a.frameCount;
    b.setX(b.getX() + c);
    b.setY(b.getY() + d);
    a.frameCount--;
    b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
    return a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.rotate_by_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setRotation(b.getRotation() + c);
  return a.callReturn();
};
Blockly.Blocks.rotate_by_angle_dropdown = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["45", "45"], ["90", "90"], ["135", "135"], ["180", "180"]]), "VALUE").appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_dropdown = function(b, a) {
  var c = a.getField("VALUE", a);
  b.setRotation(b.getRotation() + +c);
  return a.callReturn();
};
Blockly.Blocks.see_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c);
  return a.callReturn();
};
Blockly.Blocks.see_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_direction = function(b, a) {
  var c = a.getField("VALUE", a), d = Entry.container.getEntity(c), c = d.getX() - b.getX(), d = d.getY() - b.getY();
  0 <= c ? b.setRotation(Math.atan(d / c) / Math.PI * 180 + 90) : b.setRotation(Math.atan(d / c) / Math.PI * 180 + 270);
  return a.callReturn();
};
Blockly.Blocks.locate_xy = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_xy = function(b, a) {
  var c = a.getNumberValue("VALUE1", a);
  b.setX(c);
  c = a.getNumberValue("VALUE2", a);
  b.setY(c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_x = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setX(c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_y = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setY(c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate = function(b, a) {
  var c = a.getField("VALUE", a), d;
  "mouse" == c ? (c = Entry.stage.mouseCoordinate.x, d = Entry.stage.mouseCoordinate.y) : (d = Entry.container.getEntity(c), c = d.getX(), d = d.getY());
  b.setX(+c);
  b.setY(+d);
  b.brush && !b.brush.stop && b.brush.lineTo(c, -1 * d);
  return a.callReturn();
};
Blockly.Blocks.move_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_xy_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE1", a);
    var d = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dX = d / a.frameCount;
    a.dY = e / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setX(b.getX() + a.dX), b.setY(b.getY() + a.dY), a.frameCount--, b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.locate_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.rotate_by_angle_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE", a);
    var d = a.getNumberField("VALUE", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dAngle = d / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setRotation(b.getRotation() + a.dAngle), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.bounce_when = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("bounce"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.bounce_wall = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_wall).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bounce_wall = function(b, a) {
  var c = b.parent.getRotateMethod(), d = "free" == c ? (b.getRotation() + b.getDirection()).mod(360) : b.getDirection(), e = Entry.Utils.COLLISION.NONE;
  if (90 > d && 0 <= d || 360 > d && 270 <= d) {
    var e = b.collision == Entry.Utils.COLLISION.UP, f = ndgmr.checkPixelCollision(Entry.stage.wall.up, b.object, 0, !1);
    !f && e && (b.collision = Entry.Utils.COLLISION.NONE);
    f && e && (f = !1);
    f ? ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.UP) : (e = b.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, b.object, 0, !1), !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = 
    Entry.Utils.COLLISION.DOWN));
  } else {
    270 > d && 90 <= d && (e = b.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, b.object, 0, !1), !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f ? ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.DOWN) : (e = b.collision == Entry.Utils.COLLISION.UP, f = ndgmr.checkPixelCollision(Entry.stage.wall.up, b.object, 0, !1), 
    !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.UP)));
  }
  360 > d && 180 <= d ? (e = b.collision == Entry.Utils.COLLISION.LEFT, d = ndgmr.checkPixelCollision(Entry.stage.wall.left, b.object, 0, !1), !d && e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d ? ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.LEFT) : (e = b.collision == Entry.Utils.COLLISION.RIGHT, d = ndgmr.checkPixelCollision(Entry.stage.wall.right, b.object, 0, !1), !d && 
  e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.RIGHT))) : 180 > d && 0 <= d && (e = b.collision == Entry.Utils.COLLISION.RIGHT, d = ndgmr.checkPixelCollision(Entry.stage.wall.right, b.object, 0, !1), !d && e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d ? ("free" == c ? b.setRotation(-b.getRotation() - 
  2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.RIGHT) : (e = b.collision == Entry.Utils.COLLISION.LEFT, d = ndgmr.checkPixelCollision(Entry.stage.wall.left, b.object, 0, !1), !d && e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.LEFT)));
  return a.callReturn();
};
Blockly.Blocks.flip_arrow_horizontal = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_horizontal).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_horizontal = function(b, a) {
  b.setDirection(b.getDirection() + 180);
  return a.callReturn();
};
Blockly.Blocks.flip_arrow_vertical = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_vertical).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_vertical = function(b, a) {
  b.setDirection(b.getDirection() + 180);
  return a.callReturn();
};
Blockly.Blocks.see_angle_object = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle_object = function(b, a) {
  var c = a.getField("VALUE", a), d = b.getX(), e = b.getY();
  if (b.parent.id == c) {
    return a.callReturn();
  }
  "mouse" == c ? (c = Entry.stage.mouseCoordinate.y, d = Entry.stage.mouseCoordinate.x - d, e = c - e) : (c = Entry.container.getEntity(c), d = c.getX() - d, e = c.getY() - e);
  e = 0 === d && 0 === e ? b.getDirection() + b.getRotation() : 0 <= d ? -Math.atan(e / d) / Math.PI * 180 + 90 : -Math.atan(e / d) / Math.PI * 180 + 270;
  d = b.getDirection() + b.getRotation();
  b.setRotation(b.getRotation() + e - d);
  return a.callReturn();
};
Blockly.Blocks.see_angle_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle_direction = function(b, a) {
  var c = a.getNumberValue("VALUE", a), d = b.getDirection() + b.getRotation();
  b.setRotation(b.getRotation() + c - d);
  return a.callReturn();
};
Blockly.Blocks.rotate_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_direction = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c + b.getDirection());
  return a.callReturn();
};
Blockly.Blocks.locate_object_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_object_time = function(b, a) {
  if (!a.isStart) {
    var c, d, e;
    d = a.getField("TARGET", a);
    c = a.getNumberValue("VALUE", a);
    c = Math.floor(c * Entry.FPS);
    e = Entry.stage.mouseCoordinate;
    if (0 != c) {
      "mouse" == d ? (d = e.x - b.getX(), e = e.y - b.getY()) : (e = Entry.container.getEntity(d), d = e.getX() - b.getX(), e = e.getY() - b.getY()), a.isStart = !0, a.frameCount = c, a.dX = d / a.frameCount, a.dY = e / a.frameCount;
    } else {
      return "mouse" == d ? (d = +e.x, e = +e.y) : (e = Entry.container.getEntity(d), d = e.getX(), e = e.getY()), b.setX(d), b.setY(e), b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a.callReturn();
    }
  }
  if (0 != a.frameCount) {
    return b.setX(b.getX() + a.dX), b.setY(b.getY() + a.dY), a.frameCount--, b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.rotate_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_absolute = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setRotation(c);
  return a.callReturn();
};
Blockly.Blocks.rotate_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_relative = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setRotation(c + b.getRotation());
  return a.callReturn();
};
Blockly.Blocks.direction_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.direction_absolute = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c);
  return a.callReturn();
};
Blockly.Blocks.direction_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.direction_relative = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c + b.getDirection());
  return a.callReturn();
};
Blockly.Blocks.move_to_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_to_angle = function(b, a) {
  var c = a.getNumberValue("VALUE", a), d = a.getNumberValue("ANGLE", a);
  b.setX(b.getX() + c * Math.cos((d - 90) / 180 * Math.PI));
  b.setY(b.getY() - c * Math.sin((d - 90) / 180 * Math.PI));
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.rotate_by_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_explain_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_2);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE", a);
    var d = a.getNumberValue("ANGLE", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dAngle = d / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setRotation(b.getRotation() + a.dAngle), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.direction_relative_duration = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_1);
  this.appendValueInput("DURATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_2);
  this.appendValueInput("AMOUNT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.direction_relative_duration = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("DURATION", a);
    var d = a.getNumberValue("AMOUNT", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dDirection = d / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setDirection(b.getDirection() + a.dDirection), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  delete a.dDirection;
  return a.callReturn();
};
Entry.Neobot = {name:"neobot", LOCAL_MAP:["IN1", "IN2", "IN3", "IR", "BAT"], REMOTE_MAP:"OUT1 OUT2 OUT3 DCR DCL SND FND OPT".split(" "), setZero:function() {
  for (var b in Entry.Neobot.REMOTE_MAP) {
    Entry.hw.sendQueue[Entry.Neobot.REMOTE_MAP[b]] = 0;
  }
  Entry.hw.update();
}, name:"neobot", monitorTemplate:{imgPath:"hw/neobot.png", width:700, height:700, listPorts:{IR:{name:"\ub9ac\ubaa8\ucee8", type:"input", pos:{x:0, y:0}}, BAT:{name:"\ubca0\ud130\ub9ac", type:"input", pos:{x:0, y:0}}, SND:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, FND:{name:"FND", type:"output", pos:{x:0, y:0}}}, ports:{IN1:{name:"IN1", type:"input", pos:{x:270, y:200}}, IN2:{name:"IN2", type:"input", pos:{x:325, y:200}}, IN3:{name:"IN3", type:"input", pos:{x:325, y:500}}, DCL:{name:"L-Motor", 
type:"output", pos:{x:270, y:500}}, DCR:{name:"R-Motor", type:"output", pos:{x:435, y:500}}, OUT1:{name:"OUT1", type:"output", pos:{x:380, y:200}}, OUT2:{name:"OUT2", type:"output", pos:{x:435, y:200}}, OUT3:{name:"OUT3", type:"output", pos:{x:380, y:500}}}, mode:"both"}};
Blockly.Blocks.neobot_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1\ubc88 \ud3ec\ud2b8", "IN1"], ["2\ubc88 \ud3ec\ud2b8", "IN2"], ["3\ubc88 \ud3ec\ud2b8", "IN3"], ["\ub9ac\ubaa8\ucee8", "IR"], ["\ubc30\ud130\ub9ac", "BAT"]]), "PORT").appendField(" \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.neobot_sensor_value = function(b, a) {
  var c = a.getStringField("PORT");
  return Entry.hw.portData[c];
};
Blockly.Blocks.neobot_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_left_motor = function(b, a) {
  var c = a.getNumberField("SPEED"), d = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCL = c + d;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_left_motor = function(b, a) {
  Entry.hw.sendQueue.DCL = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_right_motor = function(b, a) {
  var c = a.getNumberField("SPEED"), d = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCR = c + d;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_right_motor = function(b, a) {
  Entry.hw.sendQueue.DCR = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_all_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc591\ucabd \ubaa8\ud130\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField(" \uc758 \uc18d\ub3c4\ub85c ").appendField(new Blockly.FieldDropdown([["\uc804\uc9c4", "1"], ["\ud6c4\uc9c4", "2"], ["\uc81c\uc790\ub9ac \uc88c\ud68c\uc804", "3"], ["\uc81c\uc790\ub9ac \uc6b0\ud68c\uc804", "4"], 
  ["\uc88c\ud68c\uc804", "5"], ["\uc6b0\ud68c\uc804", "6"]]), "DIRECTION").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_all_motor = function(b, a) {
  a.getNumberField("TYPE");
  var c = a.getNumberField("SPEED");
  switch(a.getNumberField("DIRECTION")) {
    case 1:
      Entry.hw.sendQueue.DCL = 16 + c;
      Entry.hw.sendQueue.DCR = 16 + c;
      break;
    case 2:
      Entry.hw.sendQueue.DCL = 32 + c;
      Entry.hw.sendQueue.DCR = 32 + c;
      break;
    case 3:
      Entry.hw.sendQueue.DCL = 32 + c;
      Entry.hw.sendQueue.DCR = 16 + c;
      break;
    case 4:
      Entry.hw.sendQueue.DCL = 16 + c;
      Entry.hw.sendQueue.DCR = 32 + c;
      break;
    case 5:
      Entry.hw.sendQueue.DCL = 0;
      Entry.hw.sendQueue.DCR = 16 + c;
      break;
    case 6:
      Entry.hw.sendQueue.DCL = 16 + c, Entry.hw.sendQueue.DCR = 0;
  }
  return a.callReturn();
};
Blockly.Blocks.neobot_set_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ud3ec\ud2b8\uc758 \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "10"], ["20\ub3c4", "20"], ["30\ub3c4", "30"], ["40\ub3c4", "40"], ["50\ub3c4", "50"], ["60\ub3c4", "60"], ["70\ub3c4", "70"], ["80\ub3c4", "80"], ["90\ub3c4", "90"], ["100\ub3c4", "100"], ["110\ub3c4", "110"], ["120\ub3c4", "120"], ["130\ub3c4", 
  "130"], ["140\ub3c4", "140"], ["150\ub3c4", "150"], ["160\ub3c4", "160"], ["170\ub3c4", "170"], ["180\ub3c4", "180"]]), "DEGREE").appendField(" \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_servo = function(b, a) {
  var c = a.getNumberField("PORT"), d = a.getNumberField("DEGREE");
  Entry.hw.sendQueue["OUT" + c] = d;
  3 === c && (c = 4);
  Entry.hw.sendQueue.OPT |= c;
  return a.callReturn();
};
Blockly.Blocks.neobot_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ubc88 \ud3ec\ud2b8\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_output = function(b, a) {
  var c = a.getStringField("PORT", a), d = a.getNumberValue("VALUE", a), e = c;
  0 > d ? d = 0 : 255 < d && (d = 255);
  3 === e && (e = 4);
  Entry.hw.sendQueue["OUT" + c] = d;
  Entry.hw.sendQueue.OPT &= ~e;
  return a.callReturn();
};
Blockly.Blocks.neobot_set_fnd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("FND\uc5d0");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_fnd = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  255 < c ? c = 255 : 0 > c && (c = 0);
  Entry.hw.sendQueue.FND = c;
  return a.callReturn();
};
Blockly.Blocks.neobot_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uba5c\ub85c\ub514").appendField(new Blockly.FieldDropdown([["\ubb34\uc74c", "0"], [Lang.General.note_c, "1"], [Lang.General.note_c + "#", "2"], [Lang.General.note_d, "3"], [Lang.General.note_d + "#", "4"], [Lang.General.note_e, "5"], [Lang.General.note_f, "6"], [Lang.General.note_f + "#", "7"], [Lang.General.note_g, "8"], [Lang.General.note_g + "#", "9"], [Lang.General.note_a, "10"], [Lang.General.note_a + "#", "11"], [Lang.General.note_b, "12"]]), "NOTE").appendField("\uc744(\ub97c)").appendField(new Blockly.FieldDropdown([["1", 
  "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"]]), "OCTAVE").appendField("\uc625\ud0c0\ube0c\ub85c").appendField(new Blockly.FieldDropdown([["2\ubd84\uc74c\ud45c", "2"], ["4\ubd84\uc74c\ud45c", "4"], ["8\ubd84\uc74c\ud45c", "8"], ["16\ubd84\uc74c\ud45c", "16"]]), "DURATION");
  this.appendDummyInput().appendField("\uae38\uc774\ub9cc\ud07c \uc18c\ub9ac\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_play_note_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.hw.sendQueue.SND = 0;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  var d = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberField("DURATION", a), d = d + 12 * e;
  a.isStart = !0;
  a.timeFlag = 1;
  65 < d && (d = 65);
  c.SND = d;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1 / f * 2E3);
  return a;
};
Entry.Robotis_carCont = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED:[67, 1], CM_SPRING_RIGHT:[69, 1, 69, 2], CM_SPRING_LEFT:[70, 1, 69, 2], CM_SWITCH:[71, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_IR_LEFT:[91, 2, 91, 4], CM_IR_RIGHT:[93, 2, 91, 4], CM_CALIBRATION_LEFT:[95, 2], CM_CALIBRATION_RIGHT:[97, 2], AUX_MOTOR_SPEED_LEFT:[152, 2], AUX_MOTOR_SPEED_RIGHT:[154, 2]}, setZero:function() {
  this.setRobotisData([[Entry.Robotis_carCont.INSTRUCTION.WRITE, 152, 2, 0], [Entry.Robotis_carCont.INSTRUCTION.WRITE, 154, 2, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  this.update();
  this.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  this.update();
}, name:"robotis_carCont", delay:40, postCallReturn:function(b, a, c) {
  if (0 >= c) {
    return this.setRobotisData(a), this.update(), b.callReturn();
  }
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return this.setRobotisData(null), b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    this.update();
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  this.setRobotisData(a);
  setTimeout(function() {
    b.timeFlag = 0;
  }, c);
  return b;
}, wait:function(b, a) {
  Entry.hw.socket.send(JSON.stringify(b));
  for (var c = (new Date).getTime(), d = c;d < c + a;) {
    d = (new Date).getTime();
  }
}, update:function() {
  Entry.hw.update();
  var b = Entry.hw.sendQueue.ROBOTIS_DATA;
  b && b.forEach(function(a) {
    a.send = !0;
  });
  this.setRobotisData(null);
}, filterSendData:function() {
  var b = Entry.hw.sendQueue.ROBOTIS_DATA;
  return b ? b.filter(function(a) {
    return !0 !== a.send;
  }) : null;
}, setRobotisData:function(b) {
  var a = this.filterSendData();
  Entry.hw.sendQueue.ROBOTIS_DATA = null == b ? a : a ? a.concat(b) : b;
}};
Entry.Robotis_openCM70 = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED_R:[79, 1], CM_LED_G:[80, 1], CM_LED_B:[81, 1], CM_BUZZER_INDEX:[84, 1], CM_BUZZER_TIME:[85, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_USER_BUTTON:[26, 1], CM_MOTION:[66, 1], AUX_SERVO_POSITION:[152, 2], AUX_IR:[168, 2], AUX_TOUCH:[202, 1], AUX_TEMPERATURE:[234, 1], AUX_ULTRASONIC:[242, 1], AUX_MAGNETIC:[250, 1], AUX_MOTION_DETECTION:[258, 1], AUX_COLOR:[266, 1], AUX_CUSTOM:[216, 2], AUX_BRIGHTNESS:[288, 
2], AUX_HYDRO_THEMO_HUMIDITY:[274, 1], AUX_HYDRO_THEMO_TEMPER:[282, 1], AUX_SERVO_MODE:[126, 1], AUX_SERVO_SPEED:[136, 2], AUX_MOTOR_SPEED:[136, 2], AUX_LED_MODULE:[210, 1]}, setZero:function() {
  Entry.Robotis_carCont.setRobotisData([[Entry.Robotis_openCM70.INSTRUCTION.WRITE, 136, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 138, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 140, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 142, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 144, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 146, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 79, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 80, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 
  81, 1, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  Entry.Robotis_carCont.update();
}, name:"robotis_openCM70", delay:15};
Blockly.Blocks.robotis_openCM70_cm_custom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["BYTE", "BYTE"], ["WORD", "WORD"], ["DWORD", "DWORD"]]), "SIZE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_openCM70_cm_custom_value = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.READ, d = 0, e = 0, f = 0, d = a.getStringField("SIZE");
  "BYTE" == d ? e = 1 : "WORD" == d ? e = 2 : "DWORD" == d && (e = 4);
  f = d = a.getNumberValue("VALUE");
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, e]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"]);
  b.push([Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"]);
  b.push([Lang.Blocks.robotis_cm_user_button, "CM_USER_BUTTON"]);
  return b;
}};
Entry.block.robotis_openCM70_sensor_value = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.READ, d = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_USER_BUTTON" == h && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1]);
  f += 0 * g;
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_aux_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.portList()), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, portList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_common_port_3, "PORT_3"]);
  b.push([Lang.Blocks.robotis_common_port_4, "PORT_4"]);
  b.push([Lang.Blocks.robotis_common_port_5, "PORT_5"]);
  b.push([Lang.Blocks.robotis_common_port_6, "PORT_6"]);
  return b;
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_aux_servo_position, "AUX_SERVO_POSITION"]);
  b.push([Lang.Blocks.robotis_aux_ir, "AUX_IR"]);
  b.push([Lang.Blocks.robotis_aux_touch, "AUX_TOUCH"]);
  b.push([Lang.Blocks.robotis_aux_brightness, "AUX_BRIGHTNESS"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_humidity, "AUX_HYDRO_THEMO_HUMIDITY"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_temper, "AUX_HYDRO_THEMO_TEMPER"]);
  b.push([Lang.Blocks.robotis_aux_temperature, "AUX_TEMPERATURE"]);
  b.push([Lang.Blocks.robotis_aux_ultrasonic, "AUX_ULTRASONIC"]);
  b.push([Lang.Blocks.robotis_aux_magnetic, "AUX_MAGNETIC"]);
  b.push([Lang.Blocks.robotis_aux_motion_detection, "AUX_MOTION_DETECTION"]);
  b.push([Lang.Blocks.robotis_aux_color, "AUX_COLOR"]);
  b.push([Lang.Blocks.robotis_aux_custom, "AUX_CUSTOM"]);
  return b;
}};
Entry.block.robotis_openCM70_aux_sensor_value = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.READ, d = 0, e = 0, f = 0, g = 0, h = a.getStringField("PORT"), k = a.getStringField("SENSOR"), l = 0;
  "PORT_3" == h ? l = 2 : "PORT_4" == h ? l = 3 : "PORT_5" == h ? l = 4 : "PORT_6" == h && (l = 5);
  "AUX_SERVO_POSITION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1]) : "AUX_IR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1]) : 
  "AUX_TOUCH" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1]) : "AUX_TEMPERATURE" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1]) : 
  "AUX_BRIGHTNESS" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1]) : "AUX_HYDRO_THEMO_HUMIDITY" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1]) : "AUX_HYDRO_THEMO_TEMPER" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1]) : "AUX_ULTRASONIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1]) : "AUX_MAGNETIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1]) : "AUX_MOTION_DETECTION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1]) : "AUX_COLOR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1]) : "AUX_CUSTOM" == k && (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1]);
  f += l * g;
  0 != l && (e = 6 * g);
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_index = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_index);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.note_a + "(0)", "0"], [Lang.General.note_a + "#(1)", "1"], [Lang.General.note_b + "(2)", "2"], [Lang.General.note_c + "(3)", "3"], [Lang.General.note_c + "#(4)", "4"], [Lang.General.note_d + "(5)", "5"], [Lang.General.note_d + "#(6)", "6"], [Lang.General.note_e + "(7)", "7"], [Lang.General.note_f + "(8)", "8"], [Lang.General.note_f + "#(9)", "9"], [Lang.General.note_g + "(10)", "10"], [Lang.General.note_g + "#(11)", "11"], 
  [Lang.General.note_a + "(12)", "12"], [Lang.General.note_a + "#(13)", "13"], [Lang.General.note_b + "(14)", "14"], [Lang.General.note_c + "(15)", "15"], [Lang.General.note_c + "#(16)", "16"], [Lang.General.note_d + "(17)", "17"], [Lang.General.note_d + "#(18)", "18"], [Lang.General.note_e + "(19)", "19"], [Lang.General.note_f + "(20)", "20"], [Lang.General.note_f + "#(21)", "21"], [Lang.General.note_g + "(22)", "22"], [Lang.General.note_g + "#(23)", "23"], [Lang.General.note_a + "(24)", "24"], 
  [Lang.General.note_a + "#(25)", "25"], [Lang.General.note_b + "(26)", "26"], [Lang.General.note_c + "(27)", "27"], [Lang.General.note_c + "#(28)", "28"], [Lang.General.note_d + "(29)", "29"], [Lang.General.note_d + "#(30)", "30"], [Lang.General.note_e + "(31)", "31"], [Lang.General.note_f + "(32)", "32"], [Lang.General.note_f + "#(33)", "33"], [Lang.General.note_g + "(34)", "34"], [Lang.General.note_g + "#(35)", "35"], [Lang.General.note_a + "(36)", "36"], [Lang.General.note_a + "#(37)", "37"], 
  [Lang.General.note_b + "(38)", "38"], [Lang.General.note_c + "(39)", "39"], [Lang.General.note_c + "#(40)", "40"], [Lang.General.note_d + "(41)", "41"], [Lang.General.note_d + "#(42)", "42"], [Lang.General.note_e + "(43)", "43"], [Lang.General.note_f + "(44)", "44"], [Lang.General.note_f + "#(45)", "45"], [Lang.General.note_g + "(46)", "46"], [Lang.General.note_g + "#(47)", "47"], [Lang.General.note_a + "(48)", "48"], [Lang.General.note_a + "#(49)", "49"], [Lang.General.note_b + "(50)", "50"], 
  [Lang.General.note_c + "(51)", "51"]]), "CM_BUZZER_INDEX").appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("CM_BUZZER_TIME").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3).appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_index = function(b, a) {
  var c = a.getField("CM_BUZZER_INDEX", a), d = a.getNumberValue("CM_BUZZER_TIME", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, k = 0, l = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], h = parseInt(10 * d);
  50 < h && (h = 50);
  k = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0];
  l = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h], [e, k, l, c]], 1E3 * d);
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_melody);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"], ["22", "22"], ["23", "23"], ["24", "24"]]), "CM_BUZZER_MELODY");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_melody = function(b, a) {
  var c = a.getField("CM_BUZZER_MELODY", a), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e = 0, f = 0, g = 0, h = 0, e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[d, e, f, 255], [d, g, h, c]], 1E3);
};
Blockly.Blocks.robotis_openCM70_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_sound_detected_clear = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, d = 0, e = 0, d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, e, 0]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_red_color, "CM_LED_R"], [Lang.Blocks.robotis_common_green_color, "CM_LED_G"], [Lang.Blocks.robotis_common_blue_color, "CM_LED_B"]]), "CM_LED").appendField("LED").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_led = function(b, a) {
  var c = a.getField("CM_LED", a), d = a.getField("VALUE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0;
  "CM_LED_R" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[1]) : "CM_LED_G" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[1]) : "CM_LED_B" == c && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_motion = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_motion);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_motion).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_motion = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, d = 0, e = 0, f = 0, d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[1], f = a.getNumberValue("VALUE", a);
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, e, f]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_1, "1"], [Lang.Blocks.robotis_common_port_2, "2"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_motor_speed = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[1];
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (c - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_mode = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_mode_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_wheel_mode, "0"], [Lang.Blocks.robotis_common_joint_mode, "1"]]), "MODE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_mode = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("MODE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_speed = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[1];
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (c - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_position = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_position_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_position = function(b, a) {
  var c = a.getField("PORT", a), d = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1];
  1023 < d ? d = 1023 : 0 > d && (d = 0);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_led_module = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_led_module_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_off, "0"], [Lang.Blocks.robotis_cm_led_right + Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_cm_led_left + 
  Lang.Blocks.robotis_common_on, "2"], [Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_on, "3"]]), "LED_MODULE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_led_module = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("LED_MODULE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_custom_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_custom = function(b, a) {
  var c = a.getField("PORT", a), d = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("ADDRESS").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_case_01);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_custom = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, d = 0, e = 0, d = a.getNumberValue("ADDRESS"), e = a.getNumberValue("VALUE");
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, 65535 < e ? 4 : 255 < e ? 2 : 1, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_carCont_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_spring_left, "CM_SPRING_LEFT"], [Lang.Blocks.robotis_cm_spring_right, "CM_SPRING_RIGHT"], [Lang.Blocks.robotis_cm_switch, "CM_SWITCH"], [Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"], [Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"], [Lang.Blocks.robotis_cm_ir_left, "CM_IR_LEFT"], [Lang.Blocks.robotis_cm_ir_right, "CM_IR_RIGHT"], [Lang.Blocks.robotis_cm_calibration_left, 
  "CM_CALIBRATION_LEFT"], [Lang.Blocks.robotis_cm_calibration_right, "CM_CALIBRATION_RIGHT"]]), "SENSOR").appendField(" ").appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_carCont_sensor_value = function(b, a) {
  var c = Entry.Robotis_carCont.INSTRUCTION.READ, d = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SPRING_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[3]) : "CM_SPRING_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[3]) : 
  "CM_SWITCH" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1]) : "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : 
  "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_IR_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[3]) : 
  "CM_IR_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[3]) : "CM_CALIBRATION_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : 
  "CM_CALIBRATION_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]) : "CM_BUTTON_STATUS" == h && (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], 
  e = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1]);
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_carCont_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_led_4).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_LEFT").appendField(", ").appendField(Lang.Blocks.robotis_cm_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_RIGHT").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_led = function(b, a) {
  var c = a.getField("VALUE_LEFT", a), d = a.getField("VALUE_RIGHT", a), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, f = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[1];
  1 == c && 1 == d ? h = 9 : 1 == c && 0 == d && (h = 8);
  0 == c && 1 == d && (h = 1);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_sound_detected_clear = function(b, a) {
  var c = Entry.Robotis_carCont.INSTRUCTION.WRITE, d = 0, e = 0, d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, e, 0]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_aux_motor_speed = function(b, a) {
  var c = a.getField("DIRECTION", a), d = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_carCont.INSTRUCTION.WRITE, g = 0, h = 0;
  "LEFT" == c ? (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[1]) : (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[1]);
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g, h, e]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_calibration = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_calibration_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_calibration = function(b, a) {
  var c = a.getField("DIRECTION", a), d = a.getNumberValue("VALUE"), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0;
  "LEFT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, d]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.when_scene_start = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_scene_1_2.png", "*", "start")).appendField(Lang.Blocks.SCENE_when_scene_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_scene_start = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.start_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_scene_1).appendField(new Blockly.FieldDropdownDynamic("scenes"), "VALUE").appendField(Lang.Blocks.SCENE_start_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.start_scene = function(b, a) {
  var c = a.getField("VALUE", a);
  if (c = Entry.scene.getSceneById(c)) {
    Entry.scene.selectScene(c), Entry.engine.fireEvent("when_scene_start");
  }
  return null;
};
Blockly.Blocks.start_neighbor_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_neighbor_scene_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.SCENE_start_scene_next, "next"], [Lang.Blocks.SCENE_start_scene_pre, "pre"]]), "OPERATOR").appendField(Lang.Blocks.SCENE_start_neighbor_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.start_neighbor_scene = function(b, a) {
  var c = Entry.scene.selectedScene, d = Entry.scene.getScenes(), c = d.indexOf(c);
  "next" == a.getField("OPERATOR", a) ? c + 1 < d.length && (d = Entry.scene.getSceneById(d[c + 1].id)) && (Entry.scene.selectScene(d), Entry.engine.fireEvent("when_scene_start")) : 0 < c && (d = Entry.scene.getSceneById(d[c - 1].id)) && (Entry.scene.selectScene(d), Entry.engine.fireEvent("when_scene_start"));
  return null;
};
Blockly.Blocks.sound_something = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something = function(b, a) {
  var c = a.getField("VALUE", a);
  Entry.isExist(c, "id", b.parent.sounds) && createjs.Sound.play(c);
  return a.callReturn();
};
Blockly.Blocks.sound_something_second = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second = function(b, a) {
  var c = a.getField("VALUE", a), d = a.getNumberValue("SECOND", a);
  if (Entry.isExist(c, "id", b.parent.sounds)) {
    var e = createjs.Sound.play(c);
    setTimeout(function() {
      e.stop();
    }, 1E3 * d);
  }
  return a.callReturn();
};
Blockly.Blocks.sound_something_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.playState;
    delete a.isPlay;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getField("VALUE", a), d = b.parent.getSound(c);
  Entry.isExist(c, "id", b.parent.sounds) && (createjs.Sound.play(c), setTimeout(function() {
    a.playState = 0;
  }, 1E3 * d.duration));
  return a;
};
Blockly.Blocks.sound_something_second_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getField("VALUE", a);
  if (Entry.isExist(c, "id", b.parent.sounds)) {
    var d = createjs.Sound.play(c), c = a.getNumberValue("SECOND", a);
    setTimeout(function() {
      d.stop();
      a.playState = 0;
    }, 1E3 * c);
    d.addEventListener("complete", function(a) {
    });
  }
  return a;
};
Blockly.Blocks.sound_volume_change = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_volume_change = function(b, a) {
  var c = a.getNumberValue("VALUE", a) / 100, c = c + createjs.Sound.getVolume();
  1 < c && (c = 1);
  0 > c && (c = 0);
  createjs.Sound.setVolume(c);
  return a.callReturn();
};
Blockly.Blocks.sound_volume_set = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_volume_set = function(b, a) {
  var c = a.getNumberValue("VALUE", a) / 100;
  1 < c && (c = 1);
  0 > c && (c = 0);
  createjs.Sound.setVolume(c);
  return a.callReturn();
};
Blockly.Blocks.sound_silent_all = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_silent_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_silent_all = function(b, a) {
  createjs.Sound.stop();
  return a.callReturn();
};
Blockly.Blocks.get_sounds = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.get_sounds = function(b, a) {
  return a.getStringField("VALUE");
};
Blockly.Blocks.sound_something_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_with_block = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  (c = b.parent.getSound(c)) && createjs.Sound.play(c.id);
  return a.callReturn();
};
Blockly.Blocks.sound_something_second_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_with_block = function(b, a) {
  var c = a.getStringValue("VALUE", a), d = a.getNumberValue("SECOND", a);
  (c = b.parent.getSound(c)) && createjs.Sound.play(c.id, {startTime:0, duration:1E3 * d});
  return a.callReturn();
};
Blockly.Blocks.sound_something_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_wait_with_block = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.playState;
    delete a.isPlay;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    createjs.Sound.play(c.id), setTimeout(function() {
      a.playState = 0;
    }, 1E3 * c.duration);
  }
  return a;
};
Blockly.Blocks.sound_something_second_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2).appendField(" ");
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_wait_with_block = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    var d = createjs.Sound.play(c.id), c = a.getNumberValue("SECOND", a);
    setTimeout(function() {
      d.stop();
      a.playState = 0;
    }, 1E3 * c);
    d.addEventListener("complete", function(a) {
    });
  }
  return a;
};
Blockly.Blocks.sound_from_to = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_from_to = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    var d = 1E3 * a.getNumberValue("START", a), e = 1E3 * a.getNumberValue("END", a);
    createjs.Sound.play(c.id, {startTime:Math.min(d, e), duration:Math.max(d, e) - Math.min(d, e)});
  }
  return a.callReturn();
};
Blockly.Blocks.sound_from_to_and_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_from_to_and_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    var d = 1E3 * a.getNumberValue("START", a), e = 1E3 * a.getNumberValue("END", a), f = Math.min(d, e), d = Math.max(d, e) - f;
    createjs.Sound.play(c.id, {startTime:f, duration:d});
    setTimeout(function() {
      a.playState = 0;
    }, d);
  }
  return a;
};
Blockly.Blocks.when_run_button_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_play.png", "*", "start")).appendField(Lang.Blocks.START_when_run_button_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_run_button_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.press_some_key = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldDropdown([["q", "81"], ["w", "87"], ["e", "69"], ["r", "82"], ["a", "65"], ["s", "83"], ["d", "68"], [Lang.Blocks.START_press_some_key_up, "38"], [Lang.Blocks.START_press_some_key_down, "40"], [Lang.Blocks.START_press_some_key_left, "37"], [Lang.Blocks.START_press_some_key_right, "39"], [Lang.Blocks.START_press_some_key_enter, 
  "13"], [Lang.Blocks.START_press_some_key_space, "32"]]), "VALUE").appendField(Lang.Blocks.START_press_some_key_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.press_some_key = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_some_key_pressed = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.START_press_some_key_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_some_key_pressed = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.mouse_clicked = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_clicked);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.mouse_clicked = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.mouse_click_cancled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_click_cancled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.mouse_click_cancled = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_object_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_object_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_object_click_canceled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click_canceled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_object_click_canceled = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_some_key_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_when_some_key_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_some_key_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_signal.png", "*", "start")).appendField(Lang.Blocks.START_when_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_when_message_cast_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_messageRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_messageRefs", b);
}};
Entry.block.when_message_cast = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_cast_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_messageRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_messageRefs", b);
}};
Entry.block.message_cast = function(b, a) {
  var c = a.getField("VALUE", a), d = Entry.isExist(c, "id", Entry.variableContainer.messages_);
  if ("null" == c || !d) {
    throw Error("value can not be null or undefined");
  }
  Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["when_message_cast", c]);
  return a.callReturn();
};
Blockly.Blocks.message_cast_wait = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_send_wait_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_send_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_messageRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_messageRefs", b);
}};
Entry.block.message_cast_wait = function(b, a) {
  if (a.runningScript) {
    for (var c = a.runningScript, d = c.length, e = 0;e < d;e++) {
      var f = c.shift();
      f && !f.isEnd() && c.push(f);
    }
    return c.length ? a : a.callReturn();
  }
  c = a.getField("VALUE", a);
  f = Entry.isExist(c, "id", Entry.variableContainer.messages_);
  if ("null" == c || !f) {
    throw Error("value can not be null or undefined");
  }
  d = Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["when_message_cast", c]);
  for (c = [];d.length;) {
    (f = d.shift()) && (c = c.concat(f));
  }
  a.runningScript = c;
  return a;
};
var colour = "#FFCA36";
Blockly.Blocks.text = {init:function() {
  this.setColour("#FFD974");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.TEXT_text), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.text = function(b, a) {
  return a.getField("NAME", a);
};
Blockly.Blocks.text_write = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_write = function(b, a) {
  var c = a.getStringValue("VALUE", a), c = Entry.convertToRoundedDecimals(c, 3);
  b.setText(c);
  return a.callReturn();
};
Blockly.Blocks.text_append = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_append = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  b.setText(Entry.convertToRoundedDecimals(b.getText(), 3) + Entry.convertToRoundedDecimals(c, 3));
  return a.callReturn();
};
Blockly.Blocks.text_prepend = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_prepend = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  b.setText(Entry.convertToRoundedDecimals(c, 3) + Entry.convertToRoundedDecimals(b.getText(), 3));
  return a.callReturn();
};
Blockly.Blocks.text_flush = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_flush);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_flush = function(b, a) {
  b.setText("");
  return a.callReturn();
};
Entry.block.variableAddButton = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ubcc0\uc218 \ucd94\uac00", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  Entry.variableContainer.openVariableAddPanel("variable");
}]}};
Entry.block.listAddButton = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub9ac\uc2a4\ud2b8 \ucd94\uac00", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  Entry.variableContainer.openVariableAddPanel("list");
}]}};
Blockly.Blocks.change_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.change_variable = function(b, a) {
  var c = a.getField("VARIABLE", a), d = a.getNumberValue("VALUE", a), e = 0, d = Entry.parseNumber(d);
  if (0 == d && "boolean" == typeof d) {
    throw Error("Type is not correct");
  }
  c = Entry.variableContainer.getVariable(c, b);
  e = Entry.getMaxFloatPoint([d, c.getValue()]);
  c.setValue((d + c.getValue()).toFixed(e));
  return a.callReturn();
};
Blockly.Blocks.set_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.set_variable = function(b, a) {
  var c = a.getField("VARIABLE", a), d = a.getValue("VALUE", a);
  Entry.variableContainer.getVariable(c, b).setValue(d);
  return a.callReturn();
};
Blockly.Blocks.show_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_show_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.show_variable = function(b, a) {
  var c = a.getField("VARIABLE", a), c = Entry.variableContainer.getVariable(c, b);
  c.setVisible(!0);
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.hide_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_hide_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.hide_variable = function(b, a) {
  var c = a.getField("VARIABLE", a);
  Entry.variableContainer.getVariable(c, b).setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.get_y = {init:function() {
  this.setColour(230);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setOutput(!0, "Number");
}};
Blockly.Blocks.get_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_get_variable_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.get_variable = function(b, a) {
  var c = a.getField("VARIABLE", a);
  return Entry.variableContainer.getVariable(c, b).getValue();
};
Blockly.Blocks.ask_and_wait = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container && Entry.container.hideProjectAnswer(b);
}};
Entry.block.ask_and_wait = function(b, a) {
  var c = Entry.container.inputValue, d = Entry.stage.inputField, e = a.getValue("VALUE", a);
  if (!e) {
    throw Error("message can not be empty");
  }
  if (c.sprite == b && d && !d._isHidden) {
    return a;
  }
  if (c.sprite != b && a.isInit) {
    return b.dialog && b.dialog.remove(), delete a.isInit, a.callReturn();
  }
  if (c.complete && c.sprite == b && d._isHidden && a.isInit) {
    return b.dialog && b.dialog.remove(), delete c.complete, delete a.isInit, a.callReturn();
  }
  e = Entry.convertToRoundedDecimals(e, 3);
  new Entry.Dialog(b, e, "speak");
  Entry.stage.showInputField();
  c.script = a;
  c.sprite = b;
  a.isInit = !0;
  return a;
};
Blockly.Blocks.get_canvas_input_value = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value, "#fff");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container && Entry.container.hideProjectAnswer(b);
}};
Entry.block.get_canvas_input_value = function(b, a) {
  return Entry.container.getInputValue();
};
Blockly.Blocks.add_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.add_value_to_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("VALUE", a), c = Entry.variableContainer.getList(c, b);
  c.array_ || (c.array_ = []);
  c.array_.push({data:d});
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.remove_value_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_value_from_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("VALUE", a), c = Entry.variableContainer.getList(c, b);
  if (!c.array_ || isNaN(d) || d > c.array_.length) {
    throw Error("can not remove value from array");
  }
  c.array_.splice(d - 1, 1);
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.insert_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_1);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_3);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.insert_value_to_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("DATA", a), e = a.getValue("INDEX", a), c = Entry.variableContainer.getList(c, b);
  if (!c.array_ || isNaN(e) || 0 == e || e > c.array_.length + 1) {
    throw Error("can not insert value to array");
  }
  c.array_.splice(e - 1, 0, {data:d});
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.change_value_list_index = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_3);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_value_list_index = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("DATA", a), e = a.getValue("INDEX", a), c = Entry.variableContainer.getList(c, b);
  if (!c.array_ || isNaN(e) || e > c.array_.length) {
    throw Error("can not insert value to array");
  }
  c.array_[e - 1].data = d;
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.value_of_index_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_3);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.value_of_index_from_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("INDEX", a), c = Entry.variableContainer.getList(c, b), d = Entry.getListRealIndex(d, c);
  if (!c.array_ || isNaN(d) || d > c.array_.length) {
    throw Error("can not insert value to array");
  }
  return c.array_[d - 1].data;
};
Blockly.Blocks.length_of_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.length_of_list = function(b, a) {
  var c = a.getField("LIST", a);
  return Entry.variableContainer.getList(c).array_.length;
};
Blockly.Blocks.show_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_show_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.show_list = function(b, a) {
  var c = a.getField("LIST", a);
  Entry.variableContainer.getList(c).setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.hide_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_hide_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hide_list = function(b, a) {
  var c = a.getField("LIST", a);
  Entry.variableContainer.getList(c).setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.options_for_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField("");
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.VARIABLE_list_option_first, "FIRST"], [Lang.Blocks.VARIABLE_list_option_last, "LAST"], [Lang.Blocks.VARIABLE_list_option_random, "RANDOM"]]), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.options_for_list = function(b, a) {
  return a.getField("OPERATOR", a);
};
Blockly.Blocks.set_visible_answer = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]]), "BOOL");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container && Entry.container.hideProjectAnswer(b);
}};
Entry.block.set_visible_answer = function(b, a) {
  "HIDE" == a.getField("BOOL", a) ? Entry.container.inputValue.setVisible(!1) : Entry.container.inputValue.setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.is_included_in_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_2);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_3);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_included_in_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getStringValue("DATA", a), c = Entry.variableContainer.getList(c);
  if (!c) {
    return !1;
  }
  for (var c = c.array_, e = 0, f = c.length;e < f;e++) {
    if (c[e].data.toString() == d.toString()) {
      return !0;
    }
  }
  return !1;
};
Entry.Xbot = {PORT_MAP:{rightWheel:0, leftWheel:0, head:90, armR:90, armL:90, analogD5:127, analogD6:127, D4:0, D7:0, D12:0, D13:0, ledR:0, ledG:0, ledB:0, lcdNum:0, lcdTxt:"                ", note:262, duration:0}, setZero:function() {
  var b = Entry.Xbot.PORT_MAP, a = Entry.hw.sendQueue, c;
  for (c in b) {
    a[c] = b[c];
  }
  Entry.hw.update();
  Entry.Xbot.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, name:"xbot_epor_edge"};
Blockly.Blocks.xbot_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_D2_digitalInput, "D2"], [Lang.Blocks.XBOT_D3_digitalInput, "D3"], [Lang.Blocks.XBOT_D11_digitalInput, "D11"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.xbot_digitalInput = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.xbot_analogValue = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_CDS, "light"], [Lang.Blocks.XBOT_MIC, "mic"], [Lang.Blocks.XBOT_analog0, "adc0"], [Lang.Blocks.XBOT_analog1, "adc1"], [Lang.Blocks.XBOT_analog2, "adc2"], [Lang.Blocks.XBOT_analog3, "adc3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.xbot_analogValue = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.xbot_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_digital).appendField(new Blockly.FieldDropdown([["LED", "D13"], ["D4", "D4"], ["D7", "D7"], ["D12 ", "D12"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_OutputValue).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_High, "HIGH"], [Lang.Blocks.XBOT_Low, "LOW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_digitalOutput = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getStringField("VALUE", a);
  c.D13 = "D13" == d && "HIGH" == e ? 1 : 0;
  c.D4 = "D4" == d && "HIGH" == e ? 1 : 0;
  c.D7 = "D7" == d && "HIGH" == e ? 1 : 0;
  c.D12 = "D12" == d && "HIGH" == e ? 1 : 0;
  return a.callReturn();
};
Blockly.Blocks.xbot_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_analog).appendField(new Blockly.FieldDropdown([["D5", "analogD5"], ["D6", "analogD6"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_Output_Value);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_analogOutput = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "analogD5" == d ? c.analogD5 = e : "analogD6" == d && (c.analogD6 = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_Servo).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_Head, "head"], [Lang.Blocks.XBOT_ArmR, "right"], [Lang.Blocks.XBOT_ArmL, "left"]]), "DEVICE").appendField(Lang.Blocks.XBOT_angle);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_servo = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "head" == d ? c.head = e : "right" == d ? c.armR = e : "left" == d && (c.armL = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_oneWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_rightWheel, "rightWheel"], [Lang.Blocks.XBOT_leftWheel, "leftWheel"], [Lang.Blocks.XBOT_bothWheel, "bothWheel"]]), "DEVICE").appendField(Lang.Blocks.XBOT_speed);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_oneWheel = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "rightWheel" == d ? c.rightWheel = e : "leftWheel" == d ? c.leftWheel = e : c.rightWheel = c.leftWheel = e;
  return a.callReturn();
};
Blockly.Blocks.xbot_twoWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_rightSpeed);
  this.appendValueInput("rightWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_leftSpeed);
  this.appendValueInput("leftWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_twoWheel = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.rightWheel = a.getNumberValue("rightWheel");
  c.leftWheel = a.getNumberValue("leftWheel");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_R);
  this.appendValueInput("ledR").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_G);
  this.appendValueInput("ledG").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_B);
  this.appendValueInput("ledB").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.ledR = a.getNumberValue("ledR");
  c.ledG = a.getNumberValue("ledG");
  c.ledB = a.getNumberValue("ledB");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_color).appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField(Lang.Blocks.XBOT_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb_picker = function(b, a) {
  var c = a.getStringField("VALUE"), d = Entry.hw.sendQueue;
  d.ledR = parseInt(.3 * parseInt(c.substr(1, 2), 16));
  d.ledG = parseInt(.3 * parseInt(c.substr(3, 2), 16));
  d.ledB = parseInt(.3 * parseInt(c.substr(5, 2), 16));
  return a.callReturn();
};
Blockly.Blocks.xbot_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_c, "C"], [Lang.Blocks.XBOT_d, "D"], [Lang.Blocks.XBOT_e, "E"], [Lang.Blocks.XBOT_f, "F"], [Lang.Blocks.XBOT_g, "G"], [Lang.Blocks.XBOT_a, "A"], [Lang.Blocks.XBOT_b, "B"]]), "NOTE").appendField(" ").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_melody_ms).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_buzzer = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("NOTE", a), e = a.getStringField("OCTAVE", a), f = a.getNumberValue("VALUE", a), d = d + e;
  c.note = "C2" == d ? 65 : "D2" == d ? 73 : "E2" == d ? 82 : "F2" == d ? 87 : "G2" == d ? 98 : "A2" == d ? 110 : "B2" == d ? 123 : "C3" == d ? 131 : "D3" == d ? 147 : "E3" == d ? 165 : "F3" == d ? 175 : "G3" == d ? 196 : "A3" == d ? 220 : "B3" == d ? 247 : "C4" == d ? 262 : "D4" == d ? 294 : "E4" == d ? 330 : "F4" == d ? 349 : "G4" == d ? 392 : "A4" == d ? 440 : "B4" == d ? 494 : "C5" == d ? 523 : "D5" == d ? 587 : "E5" == d ? 659 : "F5" == d ? 698 : "G5" == d ? 784 : "A5" == d ? 880 : "B5" == d ? 
  988 : "C6" == d ? 1047 : "D6" == d ? 1175 : "E6" == d ? 1319 : "F6" == d ? 1397 : "G6" == d ? 1568 : "A6" == d ? 1760 : "B6" == d ? 1976 : "C7" == d ? 2093 : "D7" == d ? 2349 : "E7" == d ? 2637 : "F7" == d ? 2794 : "G7" == d ? 3136 : "A7" == d ? 3520 : "B7" == d ? 3951 : 262;
  c.duration = 40 * f;
  return a.callReturn();
};
Blockly.Blocks.xbot_lcd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LCD").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "LINE").appendField(Lang.Blocks.XBOT_Line).appendField(", ").appendField(Lang.Blocks.XBOT_outputValue);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_lcd = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberField("LINE", a), e = a.getStringValue("VALUE", a);
  0 == d ? (c.lcdNum = 0, c.lcdTxt = e) : 1 == d && (c.lcdNum = 1, c.lcdTxt = e);
  return a.callReturn();
};
Entry.Collection = function(b) {
  this.length = 0;
  this._hashMap = {};
  this._observers = [];
  this.set(b);
};
(function(b, a) {
  b.set = function(b) {
    for (;this.length;) {
      a.pop.call(this);
    }
    var d = this._hashMap, e;
    for (e in d) {
      delete d[e];
    }
    if (void 0 !== b) {
      e = 0;
      for (var f = b.length;e < f;e++) {
        var g = b[e];
        d[g.id] = g;
        a.push.call(this, g);
      }
    }
  };
  b.push = function(b) {
    this._hashMap[b.id] = b;
    a.push.call(this, b);
  };
  b.unshift = function() {
    for (var b = Array.prototype.slice.call(arguments, 0), d = this._hashMap, e = b.length - 1;0 <= e;e--) {
      var f = b[e];
      a.unshift.call(this, f);
      d[f.id] = f;
    }
  };
  b.insert = function(b, d) {
    a.splice.call(this, d, 0, b);
    this._hashMap[b.id] = b;
  };
  b.has = function(a) {
    return !!this._hashMap[a];
  };
  b.get = function(a) {
    return this._hashMap[a];
  };
  b.at = function(a) {
    return this[a];
  };
  b.getAll = function() {
    for (var a = this.length, b = [], e = 0;e < a;e++) {
      b.push(this[e]);
    }
    return b;
  };
  b.indexOf = function(b) {
    return a.indexOf.call(this, b);
  };
  b.find = function(a) {
    for (var b = [], e, f = 0, g = this.length;f < g;f++) {
      e = !0;
      var h = this[f], k;
      for (k in a) {
        if (a[k] != h[k]) {
          e = !1;
          break;
        }
      }
      e && b.push(h);
    }
    return b;
  };
  b.pop = function() {
    var b = a.pop.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.shift = function() {
    var b = a.shift.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.slice = function(b, d) {
    var e = a.slice.call(this, b, d), f = this._hashMap, g;
    for (g in e) {
      delete f[e[g].id];
    }
    return e;
  };
  b.remove = function(a) {
    var b = this.indexOf(a);
    -1 < b && (delete this._hashMap[a.id], this.splice(b, 1));
  };
  b.splice = function(b, d) {
    var e = a.slice.call(arguments, 2), f = this._hashMap;
    d = void 0 === d ? this.length - b : d;
    for (var g = a.splice.call(this, b, d), h = 0, k = g.length;h < k;h++) {
      delete f[g[h].id];
    }
    h = 0;
    for (k = e.length;h < k;h++) {
      f = e[h], a.splice.call(this, b++, 0, f), this._hashMap[f.id] = f;
    }
    return g;
  };
  b.clear = function() {
    for (;this.length;) {
      a.pop.call(this);
    }
    this._hashMap = {};
  };
  b.map = function(a, b) {
    for (var e = [], f = 0, g = this.length;f < g;f++) {
      e.push(a(this[f], b));
    }
    return e;
  };
  b.moveFromTo = function(b, d) {
    var e = this.length - 1;
    0 > b || 0 > d || b > e || d > e || a.splice.call(this, d, 0, a.splice.call(this, b, 1)[0]);
  };
  b.sort = function() {
  };
  b.fromJSON = function() {
  };
  b.toJSON = function() {
    for (var a = [], b = 0, e = this.length;b < e;b++) {
      a.push(this[b].toJSON());
    }
    return a;
  };
  b.observe = function() {
  };
  b.unobserve = function() {
  };
  b.notify = function() {
  };
  b.destroy = function() {
  };
})(Entry.Collection.prototype, Array.prototype);
Entry.Event = function(b) {
  this._sender = b;
  this._listeners = [];
};
(function(b) {
  b.attach = function(a, b) {
    var d = this, e = {obj:a, fn:b, destroy:function() {
      d.detach(this);
    }};
    this._listeners.push(e);
    return e;
  };
  b.detach = function(a) {
    var b = this._listeners;
    a = b.indexOf(a);
    if (-1 < a) {
      return b.splice(a, 1);
    }
  };
  b.clear = function() {
    for (var a = this._listeners;a.length;) {
      a.pop();
    }
  };
  b.notify = function() {
    var a = arguments;
    this._listeners.slice().forEach(function(b) {
      b.fn.apply(b.obj, a);
    });
  };
})(Entry.Event.prototype);
Entry.Observer = function(b, a, c, d) {
  this.parent = b;
  this.object = a;
  this.funcName = c;
  this.attrs = d;
  b.push(this);
};
(function(b) {
  b.destroy = function() {
    var a = this.parent, b = a.indexOf(this);
    -1 < b && a.splice(b, 1);
    return this;
  };
})(Entry.Observer.prototype);
Entry.Command = {};
(function(b) {
  b["do"] = {type:EntryStatic.COMMAND_TYPES["do"], log:function(a) {
    return [b["do"].type];
  }};
  b.undo = {type:EntryStatic.COMMAND_TYPES.undo, log:function(a) {
    return [b.undo.type];
  }};
  b.redo = {type:EntryStatic.COMMAND_TYPES.redo, log:function(a) {
    return [b.redo.type];
  }};
})(Entry.Command);
Entry.Commander = function(b) {
  if ("workspace" == b || "phone" == b) {
    Entry.stateManager = new Entry.StateManager;
  }
  Entry.do = this.do.bind(this);
  Entry.undo = this.undo.bind(this);
  this.editor = {};
  this.reporters = [];
  this._tempStorage = null;
  Entry.Command.editor = this.editor;
};
(function(b) {
  b.do = function(a) {
    var b = this, d = Array.prototype.slice.call(arguments);
    d.shift();
    var e = Entry.Command[a];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [a, this, this.do, e.undo].concat(e.state.apply(this, d)));
    e = Entry.Command[a].do.apply(this, d);
    setTimeout(function() {
      b.report("do");
      b.report(a, d);
    }, 0);
    return {value:e, isPass:this.isPass.bind(this)};
  };
  b.undo = function() {
    var a = Array.prototype.slice.call(arguments), b = a.shift(), d = Entry.Command[b];
    this.report("undo");
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.do, d.undo].concat(d.state.apply(this, a)));
    return {value:Entry.Command[b].do.apply(this, a), isPass:this.isPass.bind(this)};
  };
  b.redo = function() {
    var a = Array.prototype.slice.call(arguments), b = a.shift(), d = Entry.Command[b];
    that.report("redo");
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.undo, b].concat(d.state.apply(null, a)));
    d.undo.apply(this, a);
  };
  b.setCurrentEditor = function(a, b) {
    this.editor[a] = b;
  };
  b.isPass = function(a) {
    a = void 0 === a ? !0 : a;
    if (Entry.stateManager) {
      var b = Entry.stateManager.getLastCommand();
      b && (b.isPass = a);
    }
  };
  b.addReporter = function(a) {
    this.reporters.push(a);
  };
  b.removeReporter = function(a) {
    a = this.reporters.indexOf(a);
    -1 < a && this.reporters.splice(a, 1);
  };
  b.report = function(a, b) {
    var d = this.reporters;
    if (0 !== d.length) {
      var e;
      e = a && Entry.Command[a] && Entry.Command[a].log ? Entry.Command[a].log.apply(this, b) : b;
      d.forEach(function(a) {
        a.add(e);
      });
    }
  };
})(Entry.Commander.prototype);
(function(b) {
  b.addThread = {type:EntryStatic.COMMAND_TYPES.addThread, do:function(a) {
    return this.editor.board.code.createThread(a);
  }, state:function(a) {
    a.length && (a[0].id = Entry.Utils.generateId());
    return [a];
  }, log:function(a) {
    a = this.editor.board.code.getThreads().pop();
    return [b.addThread.type, ["thread", a.stringify()], ["code", this.editor.board.code.stringify()]];
  }, undo:"destroyThread"};
  b.destroyThread = {type:EntryStatic.COMMAND_TYPES.destroyThread, do:function(a) {
    this.editor.board.findById(a[0].id).destroy(!0, !0);
  }, state:function(a) {
    return [this.editor.board.findById(a[0].id).thread.toJSON()];
  }, log:function(a) {
    a = a[0].id;
    this.editor.board.findById(a);
    return [b.destroyThread.type, ["blockId", a], ["code", this.editor.board.code.stringify()]];
  }, undo:"addThread"};
  b.destroyBlock = {type:EntryStatic.COMMAND_TYPES.destroyBlock, do:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    a.doDestroy(!0);
  }, state:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [a.toJSON(), a.pointer()];
  }, log:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [b.destroyBlock.type, ["blockId", a.id], ["code", this.editor.board.code.stringify()]];
  }, undo:"recoverBlock"};
  b.recoverBlock = {type:EntryStatic.COMMAND_TYPES.recoverBlock, do:function(a, b) {
    var d = this.editor.board.code.createThread([a]).getFirstBlock();
    "string" === typeof d && (d = this.editor.board.findById(d));
    this.editor.board.insert(d, b);
  }, state:function(a) {
    "string" !== typeof a && (a = a.id);
    return [a];
  }, log:function(a, c) {
    a = this.editor.board.findById(a.id);
    return [b.recoverBlock.type, ["block", a.stringify()], ["pointer", c], ["code", this.editor.board.code.stringify()]];
  }, undo:"destroyBlock"};
  b.insertBlock = {type:EntryStatic.COMMAND_TYPES.insertBlock, do:function(a, b, d) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    this.editor.board.insert(a, b, d);
  }, state:function(a, b) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    var d = [a.id], e = a.targetPointer();
    d.push(e);
    "string" !== typeof a && "basic" === a.getBlockType() && d.push(a.thread.getCount(a));
    return d;
  }, log:function(a, c, d) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [b.insertBlock.type, ["blockId", a.id], ["targetPointer", a.targetPointer()], ["count", d], ["code", this.editor.board.code.stringify()]];
  }, undo:"insertBlock"};
  b.separateBlock = {type:EntryStatic.COMMAND_TYPES.separateBlock, do:function(a) {
    a.view && a.view._toGlobalCoordinate(Entry.DRAG_MODE_DRAG);
    a.doSeparate();
  }, state:function(a) {
    var b = [a.id], d = a.targetPointer();
    b.push(d);
    "basic" === a.getBlockType() && b.push(a.thread.getCount(a));
    return b;
  }, log:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [b.separateBlock.type, ["blockId", a.id], ["x", a.x], ["y", a.y], ["code", this.editor.board.code.stringify()]];
  }, undo:"insertBlock"};
  b.moveBlock = {type:EntryStatic.COMMAND_TYPES.moveBlock, do:function(a, b, d) {
    void 0 !== b ? (a = this.editor.board.findById(a), a.moveTo(b, d)) : a._updatePos();
  }, state:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [a.id, a.x, a.y];
  }, log:function(a, c, d) {
    return [b.moveBlock.type, ["blockId", a.id], ["x", a.x], ["y", a.y], ["code", this.editor.board.code.stringify()]];
  }, undo:"moveBlock"};
  b.cloneBlock = {type:EntryStatic.COMMAND_TYPES.cloneBlock, do:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    this.editor.board.code.createThread(a.copy());
  }, state:function(a) {
    "string" !== typeof a && (a = a.id);
    return [a];
  }, log:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    var c = this.editor.board.code.getThreads().pop();
    return [b.cloneBlock.type, ["blockId", a.id], ["thread", c.stringify()], ["code", this.editor.board.code.stringify()]];
  }, undo:"uncloneBlock"};
  b.uncloneBlock = {type:EntryStatic.COMMAND_TYPES.uncloneBlock, do:function(a) {
    a = this.editor.board.code.getThreads().pop().getFirstBlock();
    this._tempStorage = a.id;
    a.destroy(!0, !0);
  }, state:function(a) {
    return [a];
  }, log:function(a) {
    a = this._tempStorage;
    this._tempStorage = null;
    return [b.uncloneBlock.type, ["blockId", a], ["code", this.editor.board.code.stringify()]];
  }, undo:"cloneBlock"};
  b.scrollBoard = {type:EntryStatic.COMMAND_TYPES.scrollBoard, do:function(a, b, d) {
    d || this.editor.board.scroller._scroll(a, b);
    delete this.editor.board.scroller._diffs;
  }, state:function(a, b) {
    return [-a, -b];
  }, log:function(a, c) {
    return [b.scrollBoard.type, ["dx", a], ["dy", c]];
  }, undo:"scrollBoard"};
  b.setFieldValue = {type:EntryStatic.COMMAND_TYPES.setFieldValue, do:function(a, b, d, e, f) {
    b.setValue(f, !0);
  }, state:function(a, b, d, e, f) {
    return [a, b, d, f, e];
  }, log:function(a, c, d, e, f) {
    return [b.setFieldValue.type, ["pointer", d], ["newValue", f], ["code", this.editor.board.code.stringify()]];
  }, undo:"setFieldValue"};
})(Entry.Command);
(function(b) {
  b.selectObject = {type:EntryStatic.COMMAND_TYPES.selectObject, do:function(a) {
    return Entry.container.selectObject(a);
  }, state:function(a) {
    if ((a = Entry.playground) && a.object) {
      return [a.object.id];
    }
  }, log:function(a) {
    return [a];
  }, undo:"selectObject"};
})(Entry.Command);
Entry.Container = function() {
  this.objects_ = [];
  this.cachedPicture = {};
  this.inputValue = {};
  this.currentObjects_ = this.copiedObject = null;
};
Entry.Container.prototype.generateView = function(b, a) {
  var c = this;
  this._view = b;
  this._view.addClass("entryContainer");
  this._view.addClass("entryContainerWorkspace");
  this._view.setAttribute("id", "entryContainerWorkspaceId");
  var d = Entry.createElement("div");
  d.addClass("entryAddObjectWorkspace");
  d.innerHTML = Lang.Workspace.add_object;
  d.bindOnClick(function(a) {
    Entry.dispatchEvent("openSpriteManager");
  });
  var d = Entry.createElement("div"), e = "entryContainerListWorkspaceWrapper";
  Entry.isForLecture && (e += " lecture");
  d.addClass(e);
  Entry.Utils.disableContextmenu(d);
  $(d).bind("mousedown touchstart", function(a) {
    function b(a) {
      q && 5 < Math.sqrt(Math.pow(a.pageX - q.x, 2) + Math.pow(a.pageY - q.y, 2)) && e && (clearTimeout(e), e = null);
    }
    function d(a) {
      a.stopPropagation();
      l.unbind(".container");
      e && (clearTimeout(e), e = null);
    }
    var e = null, l = $(document), n = a.type, m = !1;
    if (Entry.Utils.isRightButton(a)) {
      c._rightClick(a), m = !0;
    } else {
      var q = {x:a.clientX, y:a.clientY};
      "touchstart" !== n || m || (a.stopPropagation(), a = Entry.Utils.convertMouseEvent(a), e = setTimeout(function() {
        e && (e = null, c._rightClick(a));
      }, 1E3), l.bind("mousemove.container touchmove.container", b), l.bind("mouseup.container touchend.container", d));
    }
  });
  this._view.appendChild(d);
  e = Entry.createElement("ul");
  e.addClass("entryContainerListWorkspace");
  d.appendChild(e);
  this.listView_ = e;
  this.enableSort();
};
Entry.Container.prototype.enableSort = function() {
  $ && $(this.listView_).sortable({start:function(b, a) {
    a.item.data("start_pos", a.item.index());
  }, stop:function(b, a) {
    var c = a.item.data("start_pos"), d = a.item.index();
    Entry.container.moveElement(c, d);
  }, axis:"y", cancel:"input.selectedEditingObject"});
};
Entry.Container.prototype.disableSort = function() {
  $ && $(this.listView_).sortable("destroy");
};
Entry.Container.prototype.updateListView = function() {
  if (this.listView_) {
    for (var b = this.listView_;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    var a = this.getCurrentObjects(), c;
    for (c in a) {
      b.appendChild(a[c].view_);
    }
    Entry.stage.sortZorder();
  }
};
Entry.Container.prototype.setObjects = function(b) {
  for (var a in b) {
    var c = new Entry.EntryObject(b[a]);
    this.objects_.push(c);
    c.generateView();
    c.pictures.map(function(a) {
      Entry.playground.generatePictureElement(a);
    });
    c.sounds.map(function(a) {
      Entry.playground.generateSoundElement(a);
    });
  }
  this.updateObjectsOrder();
  this.updateListView();
  Entry.stage.sortZorder();
  Entry.variableContainer.updateViews();
  b = Entry.type;
  ("workspace" == b || "phone" == b) && (b = this.getCurrentObjects()[0]) && this.selectObject(b.id);
};
Entry.Container.prototype.getPictureElement = function(b, a) {
  var c = this.getObject(a).getPicture(b);
  if (c) {
    return c.view;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.setPicture = function(b) {
  var a = this.getObject(b.objectId), c;
  for (c in a.pictures) {
    if (b.id === a.pictures[c].id) {
      var d = {};
      d.dimension = b.dimension;
      d.id = b.id;
      d.filename = b.filename;
      d.fileurl = b.fileurl;
      d.name = b.name;
      d.view = a.pictures[c].view;
      a.pictures[c] = d;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.selectPicture = function(b, a) {
  var c = this.getObject(a), d = c.getPicture(b);
  if (d) {
    return c.selectedPicture = d, c.entity.setImage(d), c.updateThumbnailView(), c.id;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.addObject = function(b, a) {
  var c = new Entry.EntryObject(b);
  c.name = Entry.getOrderedName(c.name, this.objects_);
  Entry.stateManager && Entry.stateManager.addCommand("add object", this, this.removeObject, c);
  c.scene || (c.scene = Entry.scene.selectedScene);
  "number" == typeof a ? b.sprite.category && "background" == b.sprite.category.main ? (c.setLock(!0), this.objects_.push(c)) : this.objects_.splice(a, 0, c) : b.sprite.category && "background" == b.sprite.category.main ? this.objects_.push(c) : this.objects_.unshift(c);
  c.generateView();
  c.pictures.map(function(a) {
    Entry.playground.generatePictureElement(a);
  });
  c.sounds.map(function(a) {
    Entry.playground.generateSoundElement(a);
  });
  this.setCurrentObjects();
  this.updateObjectsOrder();
  this.updateListView();
  this.selectObject(c.id);
  Entry.variableContainer.updateViews();
  return new Entry.State(this, this.removeObject, c);
};
Entry.Container.prototype.addCloneObject = function(b, a) {
  var c = b.toJSON(), d = Entry.generateHash();
  Entry.variableContainer.addCloneLocalVariables({objectId:c.id, newObjectId:d, json:c});
  c.id = d;
  c.scene = a || Entry.scene.selectedScene;
  this.addObject(c);
};
Entry.Container.prototype.removeObject = function(b) {
  var a = this.objects_.indexOf(b), c = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove object", this, this.addObject, c, a);
  c = new Entry.State(this.addObject, c, a);
  b.destroy();
  this.objects_.splice(a, 1);
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.objects_.length && 0 !== a ? 0 < this.getCurrentObjects().length ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : Entry.container.selectObject() : this.objects_.length && 0 === a ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : (Entry.container.selectObject(), Entry.playground.flushPlayground());
  Entry.toast.success(Lang.Workspace.remove_object, b.name + " " + Lang.Workspace.remove_object_msg);
  Entry.variableContainer.removeLocalVariables(b.id);
  Entry.playground.reloadPlayground();
  return c;
};
Entry.Container.prototype.selectObject = function(b, a) {
  var c = this.getObject(b);
  a && c && Entry.scene.selectScene(c.scene);
  this.mapObjectOnScene(function(a) {
    a.view_ && a.view_.removeClass("selectedObject");
    a.isSelected_ = !1;
  });
  c && (c.view_ && c.view_.addClass("selectedObject"), c.isSelected_ = !0);
  Entry.playground && Entry.playground.injectObject(c);
  "minimize" != Entry.type && Entry.engine.isState("stop") && Entry.stage.selectObject(c);
};
Entry.Container.prototype.getAllObjects = function() {
  return this.objects_;
};
Entry.Container.prototype.getObject = function(b) {
  !b && Entry.playground && Entry.playground.object && (b = Entry.playground.object.id);
  for (var a = this.objects_.length, c = 0;c < a;c++) {
    var d = this.objects_[c];
    if (d.id == b) {
      return d;
    }
  }
};
Entry.Container.prototype.getEntity = function(b) {
  if (b = this.getObject(b)) {
    return b.entity;
  }
  Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.object_not_found, !0);
};
Entry.Container.prototype.getVariable = function(b) {
  for (var a = 0;a < this.variables_.length;a++) {
    var c = this.variables_[a];
    if (c.getId() == b || c.getName() == b) {
      return c;
    }
  }
};
Entry.Container.prototype.moveElement = function(b, a, c) {
  var d;
  d = this.getCurrentObjects();
  b = this.getAllObjects().indexOf(d[b]);
  a = this.getAllObjects().indexOf(d[a]);
  !c && Entry.stateManager && Entry.stateManager.addCommand("reorder object", Entry.container, Entry.container.moveElement, a, b, !0);
  this.objects_.splice(a, 0, this.objects_.splice(b, 1)[0]);
  this.setCurrentObjects();
  Entry.container.updateListView();
  Entry.requestUpdate = !0;
  return new Entry.State(Entry.container, Entry.container.moveElement, a, b, !0);
};
Entry.Container.prototype.moveElementByBlock = function(b, a) {
  var c = this.getCurrentObjects().splice(b, 1)[0];
  this.getCurrentObjects().splice(a, 0, c);
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getDropdownList = function(b, a) {
  var c = [];
  switch(b) {
    case "sprites":
      for (var d = this.getCurrentObjects(), e = d.length, f = 0;f < e;f++) {
        a = d[f], c.push([a.name, a.id]);
      }
      break;
    case "spritesWithMouse":
      d = this.getCurrentObjects();
      e = d.length;
      for (f = 0;f < e;f++) {
        a = d[f], c.push([a.name, a.id]);
      }
      c.push([Lang.Blocks.mouse_pointer, "mouse"]);
      break;
    case "spritesWithSelf":
      d = this.getCurrentObjects();
      e = d.length;
      for (f = 0;f < e;f++) {
        a = d[f], c.push([a.name, a.id]);
      }
      c.push([Lang.Blocks.self, "self"]);
      break;
    case "collision":
      c.push([Lang.Blocks.mouse_pointer, "mouse"]);
      d = this.getCurrentObjects();
      e = d.length;
      for (f = 0;f < e;f++) {
        a = d[f], c.push([a.name, a.id]);
      }
      c.push([Lang.Blocks.wall, "wall"]);
      c.push([Lang.Blocks.wall_up, "wall_up"]);
      c.push([Lang.Blocks.wall_down, "wall_down"]);
      c.push([Lang.Blocks.wall_right, "wall_right"]);
      c.push([Lang.Blocks.wall_left, "wall_left"]);
      break;
    case "pictures":
      a = Entry.playground.object || a;
      if (!a) {
        break;
      }
      d = a.pictures;
      for (f = 0;f < d.length;f++) {
        e = d[f], c.push([e.name, e.id]);
      }
      break;
    case "messages":
      d = Entry.variableContainer.messages_;
      for (f = 0;f < d.length;f++) {
        e = d[f], c.push([e.name, e.id]);
      }
      break;
    case "variables":
      d = Entry.variableContainer.variables_;
      for (f = 0;f < d.length;f++) {
        e = d[f], e.object_ && Entry.playground.object && e.object_ != Entry.playground.object.id || c.push([e.getName(), e.getId()]);
      }
      c && 0 !== c.length || c.push([Lang.Blocks.VARIABLE_variable, "null"]);
      break;
    case "lists":
      a = Entry.playground.object || a;
      d = Entry.variableContainer.lists_;
      for (f = 0;f < d.length;f++) {
        e = d[f], e.object_ && a && e.object_ != a.id || c.push([e.getName(), e.getId()]);
      }
      c && 0 !== c.length || c.push([Lang.Blocks.VARIABLE_list, "null"]);
      break;
    case "scenes":
      d = Entry.scene.scenes_;
      for (f = 0;f < d.length;f++) {
        e = d[f], c.push([e.name, e.id]);
      }
      break;
    case "sounds":
      a = Entry.playground.object || a;
      if (!a) {
        break;
      }
      d = a.sounds;
      for (f = 0;f < d.length;f++) {
        e = d[f], c.push([e.name, e.id]);
      }
      break;
    case "clone":
      c.push([Lang.Blocks.oneself, "self"]);
      e = this.objects_.length;
      for (f = 0;f < e;f++) {
        a = this.objects_[f], c.push([a.name, a.id]);
      }
      break;
    case "objectSequence":
      for (e = this.getCurrentObjects().length, f = 0;f < e;f++) {
        c.push([(f + 1).toString(), f.toString()]);
      }
    ;
  }
  c.length || (c = [[Lang.Blocks.no_target, "null"]]);
  return c;
};
Entry.Container.prototype.clearRunningState = function() {
  this.mapObject(function(b) {
    b.clearExecutor();
    for (var a = b.clonedEntities.length;0 < a;a--) {
      b.clonedEntities[a - 1].removeClone();
    }
    b.clonedEntities = [];
  });
};
Entry.Container.prototype.mapObject = function(b, a) {
  for (var c = this.objects_.length, d = [], e = 0;e < c;e++) {
    d.push(b(this.objects_[e], a));
  }
  return d;
};
Entry.Container.prototype.mapObjectOnScene = function(b, a) {
  for (var c = this.getCurrentObjects(), d = c.length, e = [], f = 0;f < d;f++) {
    e.push(b(c[f], a));
  }
  return e;
};
Entry.Container.prototype.clearRunningStateOnScene = function() {
  this.mapObjectOnScene(function(b) {
    b.clearExecutor();
    for (var a = b.clonedEntities.length;0 < a;a--) {
      b.clonedEntities[a - 1].removeClone();
    }
    b.clonedEntities = [];
  });
};
Entry.Container.prototype.mapEntity = function(b, a) {
  for (var c = this.objects_.length, d = [], e = 0;e < c;e++) {
    d.push(b(this.objects_[e].entity, a));
  }
  return d;
};
Entry.Container.prototype.mapEntityOnScene = function(b, a) {
  for (var c = this.getCurrentObjects(), d = c.length, e = [], f = 0;f < d;f++) {
    e.push(b(c[f].entity, a));
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeClone = function(b, a) {
  for (var c = this.objects_, d = c.length, e = [], f = 0;f < d;f++) {
    var g = c[f], h = g.clonedEntities.length;
    e.push(b(g.entity, a));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(b(l, a));
    }
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeCloneOnScene = function(b, a) {
  for (var c = this.getCurrentObjects(), d = c.length, e = [], f = 0;f < d;f++) {
    var g = c[f], h = g.clonedEntities.length;
    e.push(b(g.entity, a));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(b(l, a));
    }
  }
  return e;
};
Entry.Container.prototype.getCachedPicture = function(b) {
  Entry.assert("string" == typeof b, "pictureId must be string");
  return this.cachedPicture[b];
};
Entry.Container.prototype.cachePicture = function(b, a) {
  this.cachedPicture[b] = a;
};
Entry.Container.prototype.toJSON = function() {
  for (var b = [], a = this.objects_.length, c = 0;c < a;c++) {
    b.push(this.objects_[c].toJSON());
  }
  return b;
};
Entry.Container.prototype.takeSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = this.objects_, c = 0;c < b;c++) {
    a[c].index = c;
  }
};
Entry.Container.prototype.loadSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = Array(b), c = 0;c < b;c++) {
    var d = this.objects_[c];
    a[d.index || c] = d;
    delete d.index;
  }
  this.objects_ = a;
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getInputValue = function() {
  return this.inputValue.getValue();
};
Entry.Container.prototype.setInputValue = function(b) {
  b ? this.inputValue.setValue(b) : this.inputValue.setValue(0);
};
Entry.Container.prototype.resetSceneDuringRun = function() {
  this.mapEntityOnScene(function(b) {
    b.loadSnapshot();
    b.object.filters = [];
    b.resetFilter();
    b.dialog && b.dialog.remove();
    b.shape && b.removeBrush();
  });
  this.clearRunningStateOnScene();
};
Entry.Container.prototype.setCopiedObject = function(b) {
  this.copiedObject = b;
};
Entry.Container.prototype.updateObjectsOrder = function() {
  for (var b = Entry.scene.getScenes(), a = [], c = 0;c < b.length;c++) {
    for (var d = this.getSceneObjects(b[c]), e = 0;e < d.length;e++) {
      a.push(d[e]);
    }
  }
  this.objects_ = a;
};
Entry.Container.prototype.getSceneObjects = function(b) {
  b = b || Entry.scene.selectedScene;
  for (var a = [], c = this.getAllObjects(), d = 0;d < c.length;d++) {
    b.id == c[d].scene.id && a.push(c[d]);
  }
  return a;
};
Entry.Container.prototype.setCurrentObjects = function() {
  this.currentObjects_ = this.getSceneObjects();
};
Entry.Container.prototype.getCurrentObjects = function() {
  var b = this.currentObjects_;
  b && 0 !== b.length || this.setCurrentObjects();
  return this.currentObjects_;
};
Entry.Container.prototype.getProjectWithJSON = function(b) {
  b.objects = Entry.container.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.scenes = Entry.scene.toJSON();
  return b;
};
Entry.Container.prototype.blurAllInputs = function() {
  this.getSceneObjects().map(function(b) {
    b = b.view_.getElementsByTagName("input");
    for (var a = 0, c = b.length;a < c;a++) {
      b[a].blur();
    }
  });
};
Entry.Container.prototype.showProjectAnswer = function() {
  var b = this.inputValue;
  b && b.setVisible(!0);
};
Entry.Container.prototype.hideProjectAnswer = function(b) {
  if ((b = this.inputValue) && b.isVisible() && !Entry.engine.isState("run")) {
    for (var a = Entry.container.getAllObjects(), c = ["ask_and_wait", "get_canvas_input_value", "set_visible_answer"], d = 0, e = a.length;d < e;d++) {
      for (var f = a[d].script, g = 0;g < c.length;g++) {
        if (f.hasBlockType(c[g])) {
          return;
        }
      }
    }
    b.setVisible(!1);
  }
};
Entry.Container.prototype.getView = function() {
  return this._view;
};
Entry.Container.prototype.resize = function() {
};
Entry.Container.prototype._rightClick = function(b) {
  b.stopPropagation && b.stopPropagation();
  var a = [{text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
    Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
  }}];
  Entry.ContextMenu.show(a, "workspace-contextmenu", {x:b.clientX, y:b.clientY});
};
Entry.db = {data:{}, typeMap:{}};
(function(b) {
  b.add = function(a) {
    this.data[a.id] = a;
    var b = a.type;
    void 0 === this.typeMap[b] && (this.typeMap[b] = {});
    this.typeMap[b][a.id] = a;
  };
  b.has = function(a) {
    return this.data.hasOwnProperty(a);
  };
  b.remove = function(a) {
    this.has(a) && (delete this.typeMap[this.data[a].type][a], delete this.data[a]);
  };
  b.get = function(a) {
    return this.data[a];
  };
  b.find = function() {
  };
  b.clear = function() {
    this.data = {};
    this.typeMap = {};
  };
})(Entry.db);
Entry.Dom = function(b, a) {
  var c = /<(\w+)>/, d;
  d = b instanceof HTMLElement ? $(b) : b instanceof jQuery ? b : c.test(b) ? $(b) : $("<" + b + "></" + b + ">");
  if (void 0 === a) {
    return d;
  }
  a.id && d.attr("id", a.id);
  a.class && d.addClass(a.class);
  a.classes && a.classes.map(function(a) {
    d.addClass(a);
  });
  a.src && d.attr("src", a.src);
  a.parent && a.parent.append(d);
  d.bindOnClick = function() {
    var a, b, c = function(a) {
      a.stopImmediatePropagation();
      a.handled || (a.handled = !0, b.call(this, a));
    };
    1 < arguments.length ? (b = arguments[1] instanceof Function ? arguments[1] : function() {
    }, a = "string" === typeof arguments[0] ? arguments[0] : "") : b = arguments[0] instanceof Function ? arguments[0] : function() {
    };
    if (a) {
      $(this).on("click tab", a, c);
    } else {
      $(this).on("click tab", c);
    }
  };
  return d;
};
Entry.SVG = function(b) {
  b = document.getElementById(b);
  return Entry.SVG.createElement(b);
};
Entry.SVG.NS = "http://www.w3.org/2000/svg";
Entry.SVG.NS_XLINK = "http://www.w3.org/1999/xlink";
Entry.SVG.createElement = function(b, a) {
  var c;
  c = "string" === typeof b ? document.createElementNS(Entry.SVG.NS, b) : b;
  if (a) {
    a.href && (c.setAttributeNS(Entry.SVG.NS_XLINK, "href", a.href), delete a.href);
    for (var d in a) {
      c.setAttribute(d, a[d]);
    }
  }
  this instanceof SVGElement && this.appendChild(c);
  c.elem = Entry.SVG.createElement;
  c.attr = Entry.SVG.attr;
  c.addClass = Entry.SVG.addClass;
  c.removeClass = Entry.SVG.removeClass;
  c.hasClass = Entry.SVG.hasClass;
  c.remove = Entry.SVG.remove;
  c.removeAttr = Entry.SVG.removeAttr;
  return c;
};
Entry.SVG.attr = function(b, a) {
  if ("string" === typeof b) {
    var c = {};
    c[b] = a;
    b = c;
  }
  if (b) {
    b.href && (this.setAttributeNS(Entry.SVG.NS_XLINK, "href", b.href), delete b.href);
    for (var d in b) {
      this.setAttribute(d, b[d]);
    }
  }
  return this;
};
Entry.SVG.addClass = function(b) {
  for (var a = this.getAttribute("class"), c = 0;c < arguments.length;c++) {
    b = arguments[c], this.hasClass(b) || (a += " " + b);
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.removeClass = function(b) {
  for (var a = this.getAttribute("class"), c = 0;c < arguments.length;c++) {
    b = arguments[c], this.hasClass(b) && (a = a.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.hasClass = function(b) {
  var a = this.getAttribute("class");
  return a ? a.match(new RegExp("(\\s|^)" + b + "(\\s|$)")) : !1;
};
Entry.SVG.remove = function() {
  this.parentNode && this.parentNode.removeChild(this);
};
Entry.SVG.removeAttr = function(b) {
  this.removeAttribute(b);
};
Entry.Dialog = function(b, a, c, d) {
  b.dialog && b.dialog.remove();
  b.dialog = this;
  this.parent = b;
  this.padding = 10;
  this.border = 2;
  "number" == typeof a && (a = String(a));
  this.message_ = a = a.match(/.{1,15}/g).join("\n");
  this.mode_ = c;
  "speak" == c && this.generateSpeak();
  d || Entry.stage.loadDialog(this);
};
Entry.Dialog.prototype.generateSpeak = function() {
  this.object = new createjs.Container;
  var b = new createjs.Text;
  b.font = "15px NanumGothic";
  b.textBaseline = "top";
  b.textAlign = "left";
  b.text = this.message_;
  var a = b.getTransformedBounds(), c = a.height, a = 10 <= a.width ? a.width : 17, d = new createjs.Shape;
  d.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").rr(-this.padding, -this.padding, a + 2 * this.padding, c + 2 * this.padding, this.padding);
  this.object.addChild(d);
  this.object.regX = a / 2;
  this.object.regY = c / 2;
  this.width = a;
  this.height = c;
  this.notch = this.createSpeakNotch("ne");
  this.update();
  this.object.addChild(this.notch);
  this.object.addChild(b);
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.update = function() {
  var b = this.parent.object.getTransformedBounds(), a = "";
  -135 < b.y - this.height - 20 - this.border ? (this.object.y = b.y - this.height / 2 - 20 - this.padding, a += "n") : (this.object.y = b.y + b.height + this.height / 2 + 20 + this.padding, a += "s");
  240 > b.x + b.width + this.width ? (this.object.x = b.x + b.width + this.width / 2, a += "e") : (this.object.x = b.x - this.width / 2, a += "w");
  this.notch.type != a && (this.object.removeChild(this.notch), this.notch = this.createSpeakNotch(a), this.object.addChild(this.notch));
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.createSpeakNotch = function(b) {
  var a = new createjs.Shape;
  a.type = b;
  "ne" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, this.height + this.padding - 1.5).lt(-10, this.height + this.padding + 20).lt(20, this.height + this.padding - 1.5) : "nw" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, this.height + this.padding - 1.5).lt(this.width + 10, this.height + this.padding + 20).lt(this.width - 20, this.height + this.padding - 1.5) : "se" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, -this.padding + 1.5).lt(-10, 
  -this.padding - 20).lt(20, -this.padding + 1.5) : "sw" == b && a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, -this.padding + 1.5).lt(this.width + 10, -this.padding - 20).lt(this.width - 20, -this.padding + 1.5);
  return a;
};
Entry.Dialog.prototype.remove = function() {
  Entry.stage.unloadDialog(this);
  this.parent.dialog = null;
  Entry.requestUpdate = !0;
};
Entry.DoneProject = function(b) {
  this.generateView(b);
};
var p = Entry.DoneProject.prototype;
p.init = function(b) {
  this.projectId = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerDoneWorkspace");
  this.doneContainer = a;
  var c = Entry.createElement("iframe");
  c.setAttribute("id", "doneProjectframe");
  c.setAttribute("frameborder", 0);
  c.setAttribute("src", "/api/iframe/project/" + b);
  this.doneProjectFrame = c;
  this.doneContainer.appendChild(c);
  a.addClass("entryRemove");
};
p.getView = function() {
  return this.doneContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var b = document.getElementById("doneProjectframe"), a = this.doneContainer.offsetWidth;
  b.width = a + "px";
  b.height = 9 * a / 16 + "px";
};
Entry.Engine = function() {
  function b(a) {
    var b = [37, 38, 39, 40, 32], d = a.keyCode || a.which, e = Entry.stage.inputField;
    32 == d && e && e.hasFocus() || -1 < b.indexOf(d) && a.preventDefault();
  }
  this.state = "stop";
  this.popup = null;
  this.isUpdating = !0;
  this.speeds = [1, 15, 30, 45, 60];
  this._mouseMoved = !1;
  Entry.keyPressed && Entry.keyPressed.attach(this, this.captureKeyEvent);
  Entry.addEventListener("canvasClick", function(a) {
    Entry.engine.fireEvent("mouse_clicked");
  });
  Entry.addEventListener("canvasClickCanceled", function(a) {
    Entry.engine.fireEvent("mouse_click_cancled");
  });
  Entry.addEventListener("entityClick", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click", a);
  });
  Entry.addEventListener("entityClickCanceled", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click_canceled", a);
  });
  "phone" != Entry.type && (Entry.addEventListener("stageMouseMove", function(a) {
    this._mouseMoved = !0;
  }.bind(this)), Entry.addEventListener("stageMouseOut", function(a) {
    Entry.engine.hideMouseView();
  }));
  Entry.addEventListener("run", function() {
    $(window).bind("keydown", b);
  });
  Entry.addEventListener("stop", function() {
    $(window).unbind("keydown", b);
  });
  setInterval(function() {
    this._mouseMoved && (this.updateMouseView(), this._mouseMoved = !1);
  }.bind(this), 100);
};
Entry.Engine.prototype.generateView = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (this.view_ = b, this.view_.addClass("entryEngine"), this.view_.addClass("entryEngineMinimize"), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonMinimize"), this.maximizeButton.addClass("entryMaximizeButtonMinimize"), this.view_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
    }), this.coordinateButton = Entry.createElement("button"), this.coordinateButton.addClass("entryEngineButtonMinimize"), this.coordinateButton.addClass("entryCoordinateButtonMinimize"), this.view_.appendChild(this.coordinateButton), this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      Entry.stage.toggleCoordinator();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonMinimize"), this.stopButton.addClass("entryStopButtonMinimize"), this.stopButton.addClass("entryRemove"), this.stopButton.innerHTML = Lang.Workspace.stop, this.view_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.toggleStop();
    }), this.pauseButton = Entry.createElement("button"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.pauseButton.addClass("entryEngineButtonMinimize"), this.pauseButton.addClass("entryPauseButtonMinimize"), this.pauseButton.addClass("entryRemove"), this.view_.appendChild(this.pauseButton), this.pauseButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.togglePause();
    }), this.mouseView = Entry.createElement("div"), this.mouseView.addClass("entryMouseViewMinimize"), this.mouseView.addClass("entryRemove"), this.view_.appendChild(this.mouseView), Entry.addEventListener("loadComplete", function() {
      this.runButton = Entry.Dom("div", {class:"entryRunButtonBigMinimize", parent:$("#entryCanvasWrapper")});
      this.runButton.bindOnClick(function(a) {
        Entry.engine.toggleRun();
      });
    }.bind(this))) : "phone" == a && (this.view_ = b, this.view_.addClass("entryEngine", "entryEnginePhone"), this.headerView_ = Entry.createElement("div", "entryEngineHeader"), this.headerView_.addClass("entryEngineHeaderPhone"), this.view_.appendChild(this.headerView_), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonPhone", "entryMaximizeButtonPhone"), this.headerView_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.footerView_.addClass("entryRemove");
      Entry.engine.headerView_.addClass("entryRemove");
      Entry.launchFullScreen(Entry.engine.view_);
    }), document.addEventListener("fullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("webkitfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("mozfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), this.footerView_ = Entry.createElement("div", "entryEngineFooter"), this.footerView_.addClass("entryEngineFooterPhone"), this.view_.appendChild(this.footerView_), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonPhone", "entryRunButtonPhone"), Entry.objectAddable && this.runButton.addClass("small"), this.runButton.innerHTML = Lang.Workspace.run, this.footerView_.appendChild(this.runButton), this.runButton.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonPhone", "entryStopButtonPhone", "entryRemove"), Entry.objectAddable && this.stopButton.addClass("small"), this.stopButton.innerHTML = Lang.Workspace.stop, this.footerView_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      Entry.engine.toggleStop();
    }));
  } else {
    this.view_ = b;
    this.view_.addClass("entryEngine_w");
    this.view_.addClass("entryEngineWorkspace_w");
    var c = Entry.createElement("button");
    this.speedButton = c;
    this.speedButton.addClass("entrySpeedButtonWorkspace", "entryEngineTopWorkspace", "entryEngineButtonWorkspace_w");
    this.view_.appendChild(this.speedButton);
    this.speedButton.bindOnClick(function(a) {
      Entry.engine.toggleSpeedPanel();
      c.blur();
    });
    this.maximizeButton = Entry.createElement("button");
    this.maximizeButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryMaximizeButtonWorkspace_w");
    this.view_.appendChild(this.maximizeButton);
    this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
    });
    var d = Entry.createElement("button");
    this.coordinateButton = d;
    this.coordinateButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryCoordinateButtonWorkspace_w");
    this.view_.appendChild(this.coordinateButton);
    this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      d.blur();
      Entry.stage.toggleCoordinator();
    });
    this.addButton = Entry.createElement("button");
    this.addButton.addClass("entryEngineButtonWorkspace_w");
    this.addButton.addClass("entryAddButtonWorkspace_w");
    this.addButton.innerHTML = Lang.Workspace.add_object;
    this.addButton.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
    });
    this.view_.appendChild(this.addButton);
    this.runButton = Entry.createElement("button");
    this.runButton.addClass("entryEngineButtonWorkspace_w");
    this.runButton.addClass("entryRunButtonWorkspace_w");
    this.runButton.innerHTML = Lang.Workspace.run;
    this.view_.appendChild(this.runButton);
    this.runButton.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    });
    this.runButton2 = Entry.createElement("button");
    this.runButton2.addClass("entryEngineButtonWorkspace_w");
    this.runButton2.addClass("entryRunButtonWorkspace_w2");
    this.view_.appendChild(this.runButton2);
    this.runButton2.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    });
    this.stopButton = Entry.createElement("button");
    this.stopButton.addClass("entryEngineButtonWorkspace_w");
    this.stopButton.addClass("entryStopButtonWorkspace_w");
    this.stopButton.addClass("entryRemove");
    this.stopButton.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton);
    this.stopButton.bindOnClick(function(a) {
      Entry.engine.toggleStop();
    });
    this.stopButton2 = Entry.createElement("button");
    this.stopButton2.addClass("entryEngineButtonWorkspace_w");
    this.stopButton2.addClass("entryStopButtonWorkspace_w2");
    this.stopButton2.addClass("entryRemove");
    this.stopButton2.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton2);
    this.stopButton2.bindOnClick(function(a) {
      Entry.engine.toggleStop();
    });
    this.pauseButton = Entry.createElement("button");
    this.pauseButton.addClass("entryEngineButtonWorkspace_w");
    this.pauseButton.addClass("entryPauseButtonWorkspace_w");
    this.pauseButton.addClass("entryRemove");
    this.view_.appendChild(this.pauseButton);
    this.pauseButton.bindOnClick(function(a) {
      Entry.engine.togglePause();
    });
    this.mouseView = Entry.createElement("div");
    this.mouseView.addClass("entryMouseViewWorkspace_w");
    this.mouseView.addClass("entryRemove");
    this.view_.appendChild(this.mouseView);
  }
};
Entry.Engine.prototype.toggleSpeedPanel = function() {
  if (this.speedPanelOn) {
    this.speedPanelOn = !1, $(Entry.stage.canvas.canvas).animate({top:"24px"}), this.coordinateButton.removeClass("entryRemove"), this.maximizeButton.removeClass("entryRemove"), this.mouseView.removeClass("entryRemoveElement"), $(this.speedLabel_).remove(), delete this.speedLabel_, $(this.speedProgress_).fadeOut(null, function(a) {
      $(this).remove();
      delete this.speedProgress_;
    }), $(this.speedHandle_).remove(), delete this.speedHandle_;
  } else {
    this.speedPanelOn = !0;
    $(Entry.stage.canvas.canvas).animate({top:"41px"});
    this.coordinateButton.addClass("entryRemove");
    this.maximizeButton.addClass("entryRemove");
    this.mouseView.addClass("entryRemoveElement");
    this.speedLabel_ = Entry.createElement("div", "entrySpeedLabelWorkspace");
    this.speedLabel_.innerHTML = Lang.Workspace.speed;
    this.view_.insertBefore(this.speedLabel_, this.maximizeButton);
    this.speedProgress_ = Entry.createElement("table", "entrySpeedProgressWorkspace");
    for (var b = Entry.createElement("tr"), a = this.speeds, c = 0;5 > c;c++) {
      (function(c) {
        var d = Entry.createElement("td", "progressCell" + c);
        d.bindOnClick(function() {
          Entry.engine.setSpeedMeter(a[c]);
        });
        b.appendChild(d);
      })(c);
    }
    this.view_.insertBefore(this.speedProgress_, this.maximizeButton);
    this.speedProgress_.appendChild(b);
    this.speedHandle_ = Entry.createElement("div", "entrySpeedHandleWorkspace");
    var d = (Entry.interfaceState.canvasWidth - 84) / 5;
    $(this.speedHandle_).bind("mousedown.speedPanel touchstart.speedPanel", function(a) {
      function b(a) {
        a.stopPropagation();
        a = Entry.Utils.convertMouseEvent(a);
        a = Math.floor((a.clientX - 80) / (5 * d) * 5);
        0 > a || 4 < a || Entry.engine.setSpeedMeter(Entry.engine.speeds[a]);
      }
      function c(a) {
        $(document).unbind(".speedPanel");
      }
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        Entry.Utils.convertMouseEvent(a), a = $(document), a.bind("mousemove.speedPanel touchmove.speedPanel", b), a.bind("mouseup.speedPanel touchend.speedPanel", c);
      }
    });
    this.view_.insertBefore(this.speedHandle_, this.maximizeButton);
    this.setSpeedMeter(Entry.FPS);
  }
};
Entry.Engine.prototype.setSpeedMeter = function(b) {
  var a = this.speeds.indexOf(b);
  0 > a || (a = Math.min(4, a), a = Math.max(0, a), this.speedPanelOn && (this.speedHandle_.style.left = (Entry.interfaceState.canvasWidth - 80) / 10 * (2 * a + 1) + 80 - 9 + "px"), Entry.FPS != b && (clearInterval(this.ticker), this.ticker = setInterval(this.update, Math.floor(1E3 / b)), Entry.FPS = b));
};
Entry.Engine.prototype.start = function(b) {
  createjs.Ticker.setFPS(Entry.FPS);
  this.ticker = setInterval(this.update, Math.floor(1E3 / Entry.FPS));
};
Entry.Engine.prototype.stop = function() {
  clearInterval(this.ticker);
  this.ticker = null;
};
Entry.Engine.prototype.update = function() {
  Entry.engine.isState("run") && (Entry.engine.computeObjects(), Entry.hw.update());
};
Entry.Engine.prototype.computeObjects = function() {
  Entry.container.mapObjectOnScene(this.computeFunction);
};
Entry.Engine.prototype.computeFunction = function(b) {
  b.script.tick();
};
Entry.Engine.computeThread = function(b, a) {
  Entry.engine.isContinue = !0;
  for (var c = !1;a && Entry.engine.isContinue && !c;) {
    Entry.engine.isContinue = !a.isRepeat;
    var d = a.run(), c = d && d === a;
    a = d;
  }
  return a;
};
Entry.Engine.prototype.isState = function(b) {
  return -1 < this.state.indexOf(b);
};
Entry.Engine.prototype.run = function() {
  this.isState("run") ? this.toggleStop() : (this.isState("stop") || this.isState("pause")) && this.toggleRun();
};
Entry.Engine.prototype.toggleRun = function() {
  "pause" === this.state ? this.togglePause() : (Entry.addActivity("run"), "stop" == this.state && (Entry.container.mapEntity(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapVariable(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapList(function(b) {
    b.takeSnapshot();
  }), this.projectTimer.takeSnapshot(), Entry.container.inputValue.takeSnapshot(), Entry.container.takeSequenceSnapshot(), Entry.scene.takeStartSceneSnapshot(), this.state = "run", this.fireEvent("start")), this.state = "run", "mobile" == Entry.type && this.view_.addClass("entryEngineBlueWorkspace"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("run"), this.runButton.addClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.pauseButton && this.pauseButton.removeClass("entryRemove"), 
  this.runButton2 && this.runButton2.addClass("entryRemove"), this.stopButton2 && this.stopButton2.removeClass("entryRemove"), this.isUpdating || (Entry.engine.update(), Entry.engine.isUpdating = !0), Entry.stage.selectObject(), Entry.dispatchEvent("run"));
};
Entry.Engine.prototype.toggleStop = function() {
  Entry.addActivity("stop");
  var b = Entry.container, a = Entry.variableContainer;
  b.mapEntity(function(a) {
    a.loadSnapshot();
    a.object.filters = [];
    a.resetFilter();
    a.dialog && a.dialog.remove();
    a.brush && a.removeBrush();
  });
  a.mapVariable(function(a) {
    a.loadSnapshot();
  });
  a.mapList(function(a) {
    a.loadSnapshot();
    a.updateView();
  });
  this.stopProjectTimer();
  b.clearRunningState();
  b.loadSequenceSnapshot();
  this.projectTimer.loadSnapshot();
  Entry.container.inputValue.loadSnapshot();
  Entry.scene.loadStartSceneSnapshot();
  Entry.Func.clearThreads();
  createjs.Sound.setVolume(1);
  createjs.Sound.stop();
  this.view_.removeClass("entryEngineBlueWorkspace");
  this.runButton.removeClass("entryRemove");
  this.stopButton.addClass("entryRemove");
  this.pauseButton && this.pauseButton.addClass("entryRemove");
  this.runButton2 && this.runButton2.removeClass("entryRemove");
  this.stopButton2 && this.stopButton2.addClass("entryRemove");
  this.state = "stop";
  Entry.dispatchEvent("stop");
  Entry.stage.hideInputField();
};
Entry.Engine.prototype.togglePause = function() {
  var b = Entry.engine.projectTimer;
  "pause" == this.state ? (b.pausedTime += (new Date).getTime() - b.pauseStart, b.isPaused ? b.pauseStart = (new Date).getTime() : delete b.pauseStart, this.state = "run", this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("entryRemove"), this.runButton2 && this.runButton2.addClass("entryRemove")) : (this.state = "pause", b.isPaused && (b.pausedTime += (new Date).getTime() - b.pauseStart), b.pauseStart = (new Date).getTime(), this.pauseButton.innerHTML = Lang.Workspace.restart, 
  this.runButton.removeClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.runButton2 && this.runButton2.removeClass("entryRemove"));
};
Entry.Engine.prototype.fireEvent = function(b) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEvent, b);
};
Entry.Engine.prototype.raiseEvent = function(b, a) {
  b.parent.script.raiseEvent(a, b);
};
Entry.Engine.prototype.fireEventOnEntity = function(b, a) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [a, b]);
};
Entry.Engine.prototype.raiseEventOnEntity = function(b, a) {
  b === a[0] && b.parent.script.raiseEvent(a[1], b);
};
Entry.Engine.prototype.captureKeyEvent = function(b) {
  var a = b.keyCode, c = Entry.type;
  b.ctrlKey && "workspace" == c ? 83 == a ? (b.preventDefault(), Entry.dispatchEvent("saveWorkspace")) : 82 == a ? (b.preventDefault(), Entry.engine.run()) : 90 == a && (b.preventDefault(), console.log("engine"), Entry.dispatchEvent(b.shiftKey ? "redo" : "undo")) : Entry.engine.isState("run") && Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["keyPress", a]);
  Entry.engine.isState("stop") && "workspace" === c && 37 <= a && 40 >= a && Entry.stage.moveSprite(b);
};
Entry.Engine.prototype.raiseKeyEvent = function(b, a) {
  return b.parent.script.raiseEvent(a[0], b, String(a[1]));
};
Entry.Engine.prototype.updateMouseView = function() {
  var b = Entry.stage.mouseCoordinate;
  this.mouseView.textContent = "X : " + b.x + ", Y : " + b.y;
  this.mouseView.removeClass("entryRemove");
};
Entry.Engine.prototype.hideMouseView = function() {
  this.mouseView.addClass("entryRemove");
};
Entry.Engine.prototype.toggleFullscreen = function() {
  if (this.popup) {
    this.popup.remove(), this.popup = null;
  } else {
    this.popup = new Entry.Popup;
    if ("workspace" != Entry.type) {
      var b = $(document);
      $(this.popup.body_).css("top", b.scrollTop());
      $("body").css("overflow", "hidden");
      popup.window_.appendChild(Entry.stage.canvas.canvas);
      popup.window_.appendChild(Entry.engine.runButton[0]);
    }
    popup.window_.appendChild(Entry.engine.view_);
  }
  Entry.windowResized.notify();
};
Entry.Engine.prototype.exitFullScreen = function() {
  document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen || (Entry.engine.footerView_.removeClass("entryRemove"), Entry.engine.headerView_.removeClass("entryRemove"));
  Entry.windowResized.notify();
};
Entry.Engine.prototype.showProjectTimer = function() {
  Entry.engine.projectTimer && this.projectTimer.setVisible(!0);
};
Entry.Engine.prototype.hideProjectTimer = function() {
  var b = this.projectTimer;
  if (b && b.isVisible() && !this.isState("run")) {
    for (var a = Entry.container.getAllObjects(), c = ["get_project_timer_value", "reset_project_timer", "set_visible_project_timer", "choose_project_timer_action"], d = 0, e = a.length;d < e;d++) {
      for (var f = a[d].script, g = 0;g < c.length;g++) {
        if (f.hasBlockType(c[g])) {
          return;
        }
      }
    }
    b.setVisible(!1);
  }
};
Entry.Engine.prototype.clearTimer = function() {
  clearInterval(this.ticker);
  clearInterval(this.projectTimer.tick);
};
Entry.Engine.prototype.startProjectTimer = function() {
  var b = this.projectTimer;
  b && (b.start = (new Date).getTime(), b.isInit = !0, b.pausedTime = 0, b.tick = setInterval(function(a) {
    Entry.engine.updateProjectTimer();
  }, 1E3 / 60));
};
Entry.Engine.prototype.stopProjectTimer = function() {
  var b = this.projectTimer;
  b && (this.updateProjectTimer(0), b.isPaused = !1, b.isInit = !1, b.pausedTime = 0, clearInterval(b.tick));
};
Entry.Engine.prototype.updateProjectTimer = function(b) {
  var a = Entry.engine, c = a.projectTimer;
  if (c) {
    var d = (new Date).getTime();
    "undefined" == typeof b ? c.isPaused || a.isState("pause") || c.setValue((d - c.start - c.pausedTime) / 1E3) : (c.setValue(b), c.pausedTime = 0, c.start = d);
  }
};
Entry.EntityObject = function(b) {
  this.parent = b;
  this.type = b.objectType;
  this.flip = !1;
  this.collision = Entry.Utils.COLLISION.NONE;
  this.id = Entry.generateHash();
  "sprite" == this.type ? (this.object = new createjs.Bitmap, this.effect = {}, this.setInitialEffectValue()) : "textBox" == this.type && (this.object = new createjs.Container, this.textObject = new createjs.Text, this.textObject.font = "20px Nanum Gothic", this.textObject.textBaseline = "middle", this.textObject.textAlign = "center", this.bgObject = new createjs.Shape, this.bgObject.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect(0, 0, 100, 100), this.object.addChild(this.bgObject), this.object.addChild(this.textObject), 
  this.fontType = "Nanum Gothic", this.fontSize = 20, this.strike = this.underLine = this.fontItalic = this.fontBold = !1);
  this.object.entity = this;
  this.object.cursor = "pointer";
  this.object.on("mousedown", function(a) {
    var b = this.entity.parent.id;
    Entry.dispatchEvent("entityClick", this.entity);
    Entry.stage.isObjectClick = !0;
    "minimize" != Entry.type && Entry.engine.isState("stop") && (this.offset = {x:-this.parent.x + this.entity.getX() - (.75 * a.stageX - 240), y:-this.parent.y - this.entity.getY() - (.75 * a.stageY - 135)}, this.cursor = "move", this.entity.initCommand(), Entry.container.selectObject(b));
  });
  this.object.on("pressup", function(a) {
    Entry.dispatchEvent("entityClickCanceled", this.entity);
    this.cursor = "pointer";
    this.entity.checkCommand();
  });
  this.object.on("pressmove", function(a) {
    "minimize" != Entry.type && Entry.engine.isState("stop") && !this.entity.parent.getLock() && (this.entity.doCommand(), this.entity.setX(.75 * a.stageX - 240 + this.offset.x), this.entity.setY(-(.75 * a.stageY - 135) - this.offset.y), Entry.stage.updateObject());
  });
};
Entry.EntityObject.prototype.injectModel = function(b, a) {
  if ("sprite" == this.type) {
    this.setImage(b);
  } else {
    if ("textBox" == this.type) {
      var c = this.parent;
      a.text = a.text || c.text || c.name;
      this.setFont(a.font);
      this.setBGColour(a.bgColor);
      this.setColour(a.colour);
      this.setUnderLine(a.underLine);
      this.setStrike(a.strike);
      this.setText(a.text);
    }
  }
  a && this.syncModel_(a);
};
Entry.EntityObject.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.setRegX(b.regX);
  this.setRegY(b.regY);
  this.setScaleX(b.scaleX);
  this.setScaleY(b.scaleY);
  this.setRotation(b.rotation);
  this.setDirection(b.direction, !0);
  this.setLineBreak(b.lineBreak);
  this.setWidth(b.width);
  this.setHeight(b.height);
  this.setText(b.text);
  this.setTextAlign(b.textAlign);
  this.setFontSize(b.fontSize || this.getFontSize());
  this.setVisible(b.visible);
};
Entry.EntityObject.prototype.initCommand = function() {
  Entry.engine.isState("stop") && (this.isCommandValid = !1, Entry.stateManager && Entry.stateManager.addCommand("edit entity", this, this.restoreEntity, this.toJSON()));
};
Entry.EntityObject.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.EntityObject.prototype.checkCommand = function() {
  Entry.engine.isState("stop") && !this.isCommandValid && Entry.dispatchEvent("cancelLastCommand");
};
Entry.EntityObject.prototype.restoreEntity = function(b) {
  var a = this.toJSON();
  this.syncModel_(b);
  Entry.dispatchEvent("updateObject");
  Entry.stateManager && Entry.stateManager.addCommand("restore object", this, this.restoreEntity, a);
};
Entry.EntityObject.prototype.setX = function(b) {
  "number" == typeof b && (this.x = b, this.object.x = this.x, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getX = function() {
  return this.x;
};
Entry.EntityObject.prototype.setY = function(b) {
  "number" == typeof b && (this.y = b, this.object.y = -this.y, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getY = function() {
  return this.y;
};
Entry.EntityObject.prototype.getDirection = function() {
  return this.direction;
};
Entry.EntityObject.prototype.setDirection = function(b, a) {
  b || (b = 0);
  "vertical" != this.parent.getRotateMethod() || a || (0 <= this.direction && 180 > this.direction) == (0 <= b && 180 > b) || (this.setScaleX(-this.getScaleX()), Entry.stage.updateObject(), this.flip = !this.flip);
  this.direction = b.mod(360);
  this.object.direction = this.direction;
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.setRotation = function(b) {
  "free" != this.parent.getRotateMethod() && (b = 0);
  this.rotation = b.mod(360);
  this.object.rotation = this.rotation;
  this.updateDialog();
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRotation = function() {
  return this.rotation;
};
Entry.EntityObject.prototype.setRegX = function(b) {
  "textBox" == this.type && (b = 0);
  this.regX = b;
  this.object.regX = this.regX;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegX = function() {
  return this.regX;
};
Entry.EntityObject.prototype.setRegY = function(b) {
  "textBox" == this.type && (b = 0);
  this.regY = b;
  this.object.regY = this.regY;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegY = function() {
  return this.regY;
};
Entry.EntityObject.prototype.setScaleX = function(b) {
  this.scaleX = b;
  this.object.scaleX = this.scaleX;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleX = function() {
  return this.scaleX;
};
Entry.EntityObject.prototype.setScaleY = function(b) {
  this.scaleY = b;
  this.object.scaleY = this.scaleY;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleY = function() {
  return this.scaleY;
};
Entry.EntityObject.prototype.setSize = function(b) {
  1 > b && (b = 1);
  b /= this.getSize();
  this.setScaleX(this.getScaleX() * b);
  this.setScaleY(this.getScaleY() * b);
  this.isClone || this.parent.updateCoordinateView();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getSize = function() {
  return (this.getWidth() * Math.abs(this.getScaleX()) + this.getHeight() * Math.abs(this.getScaleY())) / 2;
};
Entry.EntityObject.prototype.setWidth = function(b) {
  this.width = b;
  this.object.width = this.width;
  this.textObject && this.getLineBreak() && (this.textObject.lineWidth = this.width);
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getWidth = function() {
  return this.width;
};
Entry.EntityObject.prototype.setHeight = function(b) {
  this.height = b;
  this.textObject && (this.object.height = this.height, this.alignTextBox());
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getHeight = function() {
  return this.height;
};
Entry.EntityObject.prototype.setColour = function(b) {
  b || (b = "#000000");
  this.colour = b;
  this.textObject && (this.textObject.color = this.colour);
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getColour = function() {
  return this.colour;
};
Entry.EntityObject.prototype.setBGColour = function(b) {
  b || (b = "transparent");
  this.bgColor = b;
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getBGColour = function() {
  return this.bgColor;
};
Entry.EntityObject.prototype.setUnderLine = function(b) {
  void 0 === b && (b = !1);
  this.underLine = b;
  this.textObject.underLine = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getUnderLine = function() {
  return this.underLine;
};
Entry.EntityObject.prototype.setStrike = function(b) {
  void 0 === b && (b = !1);
  this.strike = b;
  this.textObject.strike = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getStrike = function() {
  return this.strike;
};
Entry.EntityObject.prototype.getFont = function() {
  var b = [];
  this.fontBold && b.push("bold");
  this.fontItalic && b.push("italic");
  b.push(this.getFontSize() + "px");
  b.push(this.fontType);
  return b.join(" ");
};
Entry.EntityObject.prototype.setFont = function(b) {
  if ("textBox" == this.parent.objectType && this.font !== b) {
    b || (b = "20px Nanum Gothic");
    var a = b.split(" "), c = 0;
    if (c = -1 < a.indexOf("bold")) {
      a.splice(c - 1, 1), this.setFontBold(!0);
    }
    if (c = -1 < a.indexOf("italic")) {
      a.splice(c - 1, 1), this.setFontItalic(!0);
    }
    c = parseInt(a.shift());
    this.setFontSize(c);
    this.setFontType(a.join(" "));
    this.font = this.getFont();
    this.textObject.font = b;
    Entry.stage.update();
    this.setWidth(this.textObject.getMeasuredWidth());
    this.updateBG();
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.setLineHeight = function() {
  switch(this.getFontType()) {
    case "Nanum Gothic Coding":
      this.textObject.lineHeight = this.fontSize;
      break;
    default:
      this.textObject.lineHeight = 0;
  }
};
Entry.EntityObject.prototype.syncFont = function() {
  this.textObject.font = this.getFont();
  this.setLineHeight();
  Entry.stage.update();
  this.getLineBreak() || this.setWidth(this.textObject.getMeasuredWidth());
  Entry.stage.updateObject();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getFontType = function() {
  return this.fontType;
};
Entry.EntityObject.prototype.setFontType = function(b) {
  "textBox" == this.parent.objectType && (this.fontType = b ? b : "Nanum Gothic", this.syncFont());
};
Entry.EntityObject.prototype.getFontSize = function(b) {
  return this.fontSize;
};
Entry.EntityObject.prototype.setFontSize = function(b) {
  "textBox" == this.parent.objectType && this.fontSize != b && (this.fontSize = b ? b : 20, this.syncFont(), this.alignTextBox());
};
Entry.EntityObject.prototype.setFontBold = function(b) {
  this.fontBold = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontBold = function() {
  this.fontBold = !this.fontBold;
  this.syncFont();
  return this.fontBold;
};
Entry.EntityObject.prototype.setFontItalic = function(b) {
  this.fontItalic = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontItalic = function() {
  this.fontItalic = !this.fontItalic;
  this.syncFont();
  return this.fontItalic;
};
Entry.EntityObject.prototype.setFontName = function(b) {
  for (var a = this.font.split(" "), c = [], d = 0, e = a.length;d < e;d++) {
    ("bold" === a[d] || "italic" === a[d] || -1 < a[d].indexOf("px")) && c.push(a[d]);
  }
  this.setFont(c.join(" ") + " " + b);
};
Entry.EntityObject.prototype.getFontName = function() {
  if ("textBox" == this.type) {
    if (!this.font) {
      return "";
    }
    for (var b = this.font.split(" "), a = [], c = 0, d = b.length;c < d;c++) {
      "bold" !== b[c] && "italic" !== b[c] && -1 === b[c].indexOf("px") && a.push(b[c]);
    }
    return a.join(" ").trim();
  }
};
Entry.EntityObject.prototype.setText = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = ""), this.text = b, this.textObject.text = this.text, this.lineBreak || (this.setWidth(this.textObject.getMeasuredWidth()), this.parent.updateCoordinateView()), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getText = function() {
  return this.text;
};
Entry.EntityObject.prototype.setTextAlign = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = Entry.TEXT_ALIGN_CENTER), this.textAlign = b, this.textObject.textAlign = Entry.TEXT_ALIGNS[this.textAlign], this.alignTextBox(), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getTextAlign = function() {
  return this.textAlign;
};
Entry.EntityObject.prototype.setLineBreak = function(b) {
  if ("textBox" == this.parent.objectType) {
    void 0 === b && (b = !1);
    var a = this.lineBreak;
    this.lineBreak = b;
    a && !this.lineBreak ? (this.textObject.lineWidth = null, this.setHeight(this.textObject.getMeasuredLineHeight()), this.setText(this.getText().replace(/\n/g, ""))) : !a && this.lineBreak && (this.setFontSize(this.getFontSize() * this.getScaleX()), this.setHeight(3 * this.textObject.getMeasuredLineHeight()), this.setWidth(this.getWidth() * this.getScaleX()), this.setScaleX(1), this.setScaleY(1), this.textObject.lineWidth = this.getWidth(), this.alignTextBox());
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.getLineBreak = function() {
  return this.lineBreak;
};
Entry.EntityObject.prototype.setVisible = function(b) {
  void 0 === b && (b = !0);
  this.visible = b;
  this.object.visible = this.visible;
  this.dialog && this.syncDialogVisible();
  Entry.requestUpdate = !0;
  return this.visible;
};
Entry.EntityObject.prototype.getVisible = function() {
  return this.visible;
};
Entry.EntityObject.prototype.setImage = function(b) {
  delete b._id;
  Entry.assert("sprite" == this.type, "Set image is only for sprite object");
  b.id || (b.id = Entry.generateHash());
  this.picture = b;
  var a = this.picture.dimension, c = this.getRegX() - this.getWidth() / 2, d = this.getRegY() - this.getHeight() / 2;
  this.setWidth(a.width);
  this.setHeight(a.height);
  a.scaleX || (a.scaleX = this.getScaleX(), a.scaleY = this.getScaleY());
  this.setScaleX(this.scaleX);
  this.setScaleY(this.scaleY);
  this.setRegX(this.width / 2 + c);
  this.setRegY(this.height / 2 + d);
  var e = Entry.container.getCachedPicture(b.id);
  if (e) {
    Entry.image = e, this.object.image = e, this.object.cache(0, 0, this.getWidth(), this.getHeight());
  } else {
    e = new Image;
    b.fileurl ? e.src = b.fileurl : (a = b.filename, e.src = Entry.defaultPath + "/uploads/" + a.substring(0, 2) + "/" + a.substring(2, 4) + "/image/" + a + ".png");
    var f = this;
    e.onload = function(a) {
      Entry.container.cachePicture(b.id, e);
      Entry.image = e;
      f.object.image = e;
      f.object.cache(0, 0, f.getWidth(), f.getHeight());
      f = null;
      Entry.requestUpdate = !0;
    };
  }
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.applyFilter = function() {
  var b = this.effect, a = this.object;
  (function(a, b) {
    for (var e in a) {
      if (a[e] !== b[e]) {
        return !1;
      }
    }
    return !0;
  })(b, this.getInitialEffectValue()) || (function(a, b) {
    var e = [], f = Entry.adjustValueWithMaxMin;
    a.brightness = a.brightness;
    var g = new createjs.ColorMatrix;
    g.adjustColor(f(a.brightness, -100, 100), 0, 0, 0);
    g = new createjs.ColorMatrixFilter(g);
    e.push(g);
    a.hue = a.hue.mod(360);
    g = new createjs.ColorMatrix;
    g.adjustColor(0, 0, 0, a.hue);
    g = new createjs.ColorMatrixFilter(g);
    e.push(g);
    var g = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], h = 10.8 * a.hsv * Math.PI / 180, k = Math.cos(h), h = Math.sin(h), l = Math.abs(a.hsv / 100);
    1 < l && (l -= Math.floor(l));
    0 < l && .33 >= l ? g = [1, 0, 0, 0, 0, 0, k, h, 0, 0, 0, -1 * h, k, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .66 >= l ? g = [k, 0, h, 0, 0, 0, 1, 0, 0, 0, h, 0, k, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .99 >= l && (g = [k, h, 0, 0, 0, -1 * h, k, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    g = (new createjs.ColorMatrix).concat(g);
    g = new createjs.ColorMatrixFilter(g);
    e.push(g);
    b.alpha = a.alpha = f(a.alpha, 0, 1);
    b.filters = e;
  }(b, a), a.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.resetFilter = function() {
  "sprite" == this.parent.objectType && (this.object.filters = [], this.setInitialEffectValue(), this.object.alpha = this.effect.alpha, this.object.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.updateDialog = function() {
  this.dialog && this.dialog.update();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
  this.collision = Entry.Utils.COLLISION.NONE;
};
Entry.EntityObject.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  "sprite" == this.parent.objectType && this.setImage(this.parent.getPicture());
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.removeClone = function() {
  if (this.isClone) {
    this.dialog && this.dialog.remove();
    this.brush && this.removeBrush();
    Entry.stage.unloadEntity(this);
    var b = this.parent.clonedEntities.indexOf(this);
    this.parent.clonedEntities.splice(b, 1);
    Entry.Utils.isFunction(this.clearExecutor) && this.clearExecutor();
  }
};
Entry.EntityObject.prototype.clearExecutor = function() {
  this.parent.script.clearExecutorsByEntity(this);
};
Entry.EntityObject.prototype.toJSON = function() {
  var b = {};
  b.x = Entry.cutDecimal(this.getX());
  b.y = Entry.cutDecimal(this.getY());
  b.regX = Entry.cutDecimal(this.getRegX());
  b.regY = Entry.cutDecimal(this.getRegY());
  b.scaleX = this.getScaleX();
  b.scaleY = this.getScaleY();
  b.rotation = Entry.cutDecimal(this.getRotation());
  b.direction = Entry.cutDecimal(this.getDirection());
  b.width = Entry.cutDecimal(this.getWidth());
  b.height = Entry.cutDecimal(this.getHeight());
  b.font = this.getFont();
  b.visible = this.getVisible();
  "textBox" == this.parent.objectType && (b.colour = this.getColour(), b.text = this.getText(), b.textAlign = this.getTextAlign(), b.lineBreak = this.getLineBreak(), b.bgColor = this.getBGColour(), b.underLine = this.getUnderLine(), b.strike = this.getStrike(), b.fontSize = this.getFontSize());
  return b;
};
Entry.EntityObject.prototype.setInitialEffectValue = function() {
  this.effect = this.getInitialEffectValue();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getInitialEffectValue = function() {
  return {blur:0, hue:0, hsv:0, brightness:0, contrast:0, saturation:0, alpha:1};
};
Entry.EntityObject.prototype.removeBrush = function() {
  Entry.stage.selectedObjectContainer.removeChild(this.shape);
  this.shape = this.brush = null;
};
Entry.EntityObject.prototype.updateBG = function() {
  if (this.bgObject) {
    this.bgObject.graphics.clear();
    var b = this.getWidth(), a = this.getHeight();
    this.bgObject.graphics.setStrokeStyle(1).beginStroke().beginFill(this.getBGColour()).drawRect(-b / 2, -a / 2, b, a);
    if (this.getLineBreak()) {
      this.bgObject.x = 0;
    } else {
      switch(this.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          this.bgObject.x = b / 2;
          break;
        case Entry.TEXT_ALIGN_CENTER:
          this.bgObject.x = 0;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          this.bgObject.x = -b / 2;
      }
    }
  }
};
Entry.EntityObject.prototype.alignTextBox = function() {
  if ("textBox" == this.type) {
    var b = this.textObject;
    if (this.lineBreak) {
      var a = b.getMeasuredLineHeight();
      b.y = a / 2 - this.getHeight() / 2;
      switch(this.textAlign) {
        case Entry.TEXT_ALIGN_CENTER:
          b.x = 0;
          break;
        case Entry.TEXT_ALIGN_LEFT:
          b.x = -this.getWidth() / 2;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          b.x = this.getWidth() / 2;
      }
      b.maxHeight = this.getHeight();
    } else {
      b.x = 0, b.y = 0;
    }
  }
};
Entry.EntityObject.prototype.syncDialogVisible = function() {
  this.dialog && (this.dialog.object.visible = this.visible);
};
Entry.Helper = function() {
  this.visible = !1;
};
p = Entry.Helper.prototype;
p.generateView = function(b, a) {
  if (!this.parentView_) {
    this.parentView_ = b;
    this.blockHelpData = EntryStatic.blockInfo;
    var c = Entry.createElement("div", "entryBlockHelperWorkspace");
    this.view = c;
    Entry.isForLecture && c.addClass("lecture");
    this.parentView_.appendChild(c);
    var d = Entry.createElement("div", "entryBlockHelperContentWorkspace");
    d.addClass("entryBlockHelperIntro");
    Entry.isForLecture && d.addClass("lecture");
    c.appendChild(d);
    this.blockHelperContent_ = d;
    this.blockHelperView_ = c;
    c = Entry.createElement("div", "entryBlockHelperBlockWorkspace");
    this.blockHelperContent_.appendChild(c);
    d = Entry.createElement("div", "entryBlockHelperDescriptionWorkspace");
    this.blockHelperContent_.appendChild(d);
    d.innerHTML = Lang.Helper.Block_click_msg;
    this.blockHelperDescription_ = d;
    this._renderView = new Entry.RenderView($(c), "LEFT");
    this.code = new Entry.Code([]);
    this._renderView.changeCode(this.code);
    this.first = !0;
  }
};
p.bindWorkspace = function(b) {
  b && (this._blockViewObserver && this._blockViewObserver.destroy(), this.workspace = b, this._blockViewObserver = b.observe(this, "_updateSelectedBlock", ["selectedBlockView"]));
};
p._updateSelectedBlock = function() {
  var b = this.workspace.selectedBlockView;
  if (b && this.visible && b != this._blockView) {
    var a = b.block.type;
    this._blockView = b;
    this.renderBlock(a);
  }
};
p.renderBlock = function(b) {
  var a = Lang.Helper[b];
  if (b && this.visible && a && !Entry.block[b].isPrimitive) {
    this.first && (this.blockHelperContent_.removeClass("entryBlockHelperIntro"), this.first = !1);
    this.code.clear();
    var c = Entry.block[b].def, c = c || {type:b};
    this.code.createThread([c]);
    this.code.board.align();
    this.code.board.resize();
    var c = this.code.getThreads()[0].getFirstBlock().view, d = c.svgGroup.getBBox();
    b = d.width;
    d = d.height;
    c = c.getSkeleton().box(c).offsetX;
    isNaN(c) && (c = 0);
    this.blockHelperDescription_.innerHTML = a;
    this._renderView.align();
    $(this.blockHelperDescription_).css({top:d + 30});
    this._renderView.svgDom.css({"margin-left":-(b / 2) - 20 - c});
  }
};
p.getView = function() {
  return this.view;
};
p.resize = function() {
};
Entry.Activity = function(b, a) {
  this.name = b;
  this.timestamp = new Date;
  var c = [];
  if (void 0 !== a) {
    for (var d = 0, e = a.length;d < e;d++) {
      var f = a[d];
      c.push({key:f[0], value:f[1]});
    }
  }
  this.data = c;
};
Entry.ActivityReporter = function() {
  this._activities = [];
};
(function(b) {
  b.add = function(a) {
    if (a && 0 !== a.length) {
      if (!(a instanceof Entry.Activity)) {
        var b = a.shift();
        a = new Entry.Activity(b, a);
      }
      this._activities.push(a);
    }
  };
  b.clear = function() {
    this._activities = [];
  };
  b.get = function() {
    return this._activities;
  };
  b.report = function() {
  };
})(Entry.ActivityReporter.prototype);
Entry.State = function(b, a, c, d) {
  this.caller = a;
  this.func = c;
  3 < arguments.length && (this.params = Array.prototype.slice.call(arguments).slice(3));
  this.message = b;
  this.time = Entry.getUpTime();
  this.isPass = Entry.Command[b] ? Entry.Command[b].isPass : !1;
};
Entry.State.prototype.generateMessage = function() {
};
Entry.StateManager = function() {
  this.undoStack_ = [];
  this.redoStack_ = [];
  this.isIgnore = this.isRestore = !1;
  Entry.addEventListener("cancelLastCommand", function(b) {
    Entry.stateManager.cancelLastCommand();
  });
  Entry.addEventListener("run", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("stop", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.stateManager.addStamp();
  });
  Entry.addEventListener("undo", function(b) {
    Entry.stateManager.undo();
  });
  Entry.addEventListener("redo", function(b) {
    Entry.stateManager.redo();
  });
};
Entry.StateManager.prototype.generateView = function(b, a) {
};
Entry.StateManager.prototype.addCommand = function(b, a, c, d) {
  if (!this.isIgnoring()) {
    if (this.isRestoring()) {
      var e = new Entry.State, f = Array.prototype.slice.call(arguments);
      Entry.State.prototype.constructor.apply(e, f);
      this.redoStack_.push(e);
      Entry.reporter && Entry.reporter.report(e);
    } else {
      e = new Entry.State, f = Array.prototype.slice.call(arguments), Entry.State.prototype.constructor.apply(e, f), this.undoStack_.push(e), Entry.reporter && Entry.reporter.report(e), this.updateView();
    }
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.cancelLastCommand = function() {
  this.canUndo() && (this.undoStack_.pop(), this.updateView(), Entry.creationChangedEvent && Entry.creationChangedEvent.notify());
};
Entry.StateManager.prototype.getLastCommand = function() {
  return this.undoStack_[this.undoStack_.length - 1];
};
Entry.StateManager.prototype.undo = function() {
  if (this.canUndo() && !this.isRestoring()) {
    this.addActivity("undo");
    for (this.startRestore();this.undoStack_.length;) {
      var b = this.undoStack_.pop();
      b.func.apply(b.caller, b.params);
      if (!0 !== b.isPass) {
        break;
      }
    }
    this.updateView();
    this.endRestore();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.redo = function() {
  if (this.canRedo() && !this.isRestoring()) {
    this.addActivity("redo");
    var b = this.redoStack_.pop();
    b.func.apply(b.caller, b.params);
    this.updateView();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.updateView = function() {
  this.undoButton && this.redoButton && (this.canUndo() ? this.undoButton.addClass("active") : this.undoButton.removeClass("active"), this.canRedo() ? this.redoButton.addClass("active") : this.redoButton.removeClass("active"));
};
Entry.StateManager.prototype.startRestore = function() {
  this.isRestore = !0;
};
Entry.StateManager.prototype.endRestore = function() {
  this.isRestore = !1;
};
Entry.StateManager.prototype.isRestoring = function() {
  return this.isRestore;
};
Entry.StateManager.prototype.startIgnore = function() {
  this.isIgnore = !0;
};
Entry.StateManager.prototype.endIgnore = function() {
  this.isIgnore = !1;
};
Entry.StateManager.prototype.isIgnoring = function() {
  return this.isIgnore;
};
Entry.StateManager.prototype.canUndo = function() {
  return 0 < this.undoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.canRedo = function() {
  return 0 < this.redoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.addStamp = function() {
  this.stamp = Entry.generateHash();
  this.undoStack_.length && (this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp);
};
Entry.StateManager.prototype.isSaved = function() {
  return 0 === this.undoStack_.length || this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp && "string" == typeof this.stamp;
};
Entry.StateManager.prototype.addActivity = function(b) {
  Entry.reporter && Entry.reporter.report(new Entry.State(b));
};
Entry.EntryObject = function(b) {
  if (b) {
    this.id = b.id;
    this.name = b.name || b.sprite.name;
    this.text = b.text || this.name;
    this.objectType = b.objectType;
    this.objectType || (this.objectType = "sprite");
    this.script = new Entry.Code(b.script ? b.script : [], this);
    this.pictures = b.sprite.pictures;
    this.sounds = [];
    this.sounds = b.sprite.sounds;
    for (var a = 0;a < this.sounds.length;a++) {
      this.sounds[a].id || (this.sounds[a].id = Entry.generateHash()), Entry.initSound(this.sounds[a]);
    }
    this.lock = b.lock ? b.lock : !1;
    this.isEditing = !1;
    "sprite" == this.objectType && (this.selectedPicture = b.selectedPictureId ? this.getPicture(b.selectedPictureId) : this.pictures[0]);
    this.scene = Entry.scene.getSceneById(b.scene) || Entry.scene.selectedScene;
    this.setRotateMethod(b.rotateMethod);
    this.entity = new Entry.EntityObject(this);
    this.entity.injectModel(this.selectedPicture ? this.selectedPicture : null, b.entity ? b.entity : this.initEntity(b));
    this.clonedEntities = [];
    Entry.stage.loadObject(this);
    for (a in this.pictures) {
      var c = this.pictures[a];
      c.objectId = this.id;
      c.id || (c.id = Entry.generateHash());
      var d = new Image;
      c.fileurl ? d.src = c.fileurl : c.fileurl ? d.src = c.fileurl : (b = c.filename, d.src = Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/image/" + b + ".png");
      Entry.Loader.addQueue();
      d.onload = function(a) {
        Entry.container.cachePicture(c.id, d);
        Entry.Loader.removeQueue();
        Entry.requestUpdate = !0;
      };
    }
  }
};
Entry.EntryObject.prototype.generateView = function() {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("li", this.id);
    b.addClass("entryContainerListElementWorkspace");
    b.object = this;
    Entry.Utils.disableContextmenu(b);
    var a = this;
    longPressTimer = null;
    $(b).bind("mousedown touchstart", function(b) {
      function c(a) {
        a.stopPropagation();
        h && 5 < Math.sqrt(Math.pow(a.pageX - h.x, 2) + Math.pow(a.pageY - h.y, 2)) && longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
      }
      function d(a) {
        a.stopPropagation();
        e.unbind(".object");
        longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
      }
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
      var e = $(document), f = b.type, g = !1;
      if (Entry.Utils.isRightButton(b)) {
        b.stopPropagation(), Entry.documentMousedown.notify(b), g = !0, a._rightClick(b);
      } else {
        var h = {x:b.clientX, y:b.clientY};
        "touchstart" !== f || g || (b.stopPropagation(), Entry.documentMousedown.notify(b), longPressTimer = setTimeout(function() {
          longPressTimer && (longPressTimer = null, a._rightClick(b));
        }, 1E3), e.bind("mousemove.object touchmove.object", c), e.bind("mouseup.object touchend.object", d));
      }
    });
    this.view_ = b;
    var c = this, b = Entry.createElement("ul");
    b.addClass("objectInfoView");
    Entry.objectEditable || b.addClass("entryHide");
    var d = Entry.createElement("li");
    d.addClass("objectInfo_visible");
    this.entity.getVisible() || d.addClass("objectInfo_unvisible");
    d.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = c.entity, a.setVisible(!a.getVisible()) ? this.removeClass("objectInfo_unvisible") : this.addClass("objectInfo_unvisible"));
    });
    var e = Entry.createElement("li");
    e.addClass("objectInfo_unlock");
    this.getLock() && e.addClass("objectInfo_lock");
    e.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = c, a.setLock(!a.getLock()) ? this.addClass("objectInfo_lock") : this.removeClass("objectInfo_lock"), a.updateInputViews(a.getLock()));
    });
    b.appendChild(d);
    b.appendChild(e);
    this.view_.appendChild(b);
    b = Entry.createElement("div");
    b.addClass("entryObjectThumbnailWorkspace");
    this.view_.appendChild(b);
    this.thumbnailView_ = b;
    b = Entry.createElement("div");
    b.addClass("entryObjectWrapperWorkspace");
    this.view_.appendChild(b);
    d = Entry.createElement("input");
    d.bindOnClick(function(a) {
      a.preventDefault();
      Entry.container.selectObject(c.id);
      this.readOnly || (this.focus(), this.select());
    });
    d.addClass("entryObjectNameWorkspace");
    b.appendChild(d);
    this.nameView_ = d;
    this.nameView_.entryObject = this;
    d.setAttribute("readonly", !0);
    var f = this;
    this.nameView_.onblur = function(a) {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    };
    this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && f.editObjectValues(!1);
    };
    this.nameView_.value = this.name;
    d = Entry.createElement("div");
    d.addClass("entryObjectEditWorkspace");
    d.object = this;
    this.editView_ = d;
    this.view_.appendChild(d);
    $(d).mousedown(function(b) {
      var c = a.isEditing;
      b.stopPropagation();
      Entry.documentMousedown.notify(b);
      Entry.engine.isState("run") || !1 !== c || (a.editObjectValues(!c), Entry.playground.object !== a && Entry.container.selectObject(a.id), a.nameView_.select());
    });
    d.blur = function(b) {
      a.editObjectComplete();
    };
    Entry.objectEditable && Entry.objectDeletable && (d = Entry.createElement("div"), d.addClass("entryObjectDeleteWorkspace"), d.object = this, this.deleteView_ = d, this.view_.appendChild(d), d.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    }));
    d = Entry.createElement("div");
    d.addClass("entryObjectInformationWorkspace");
    d.object = this;
    this.isInformationToggle = !1;
    b.appendChild(d);
    this.informationView_ = d;
    b = Entry.createElement("div");
    b.addClass("entryObjectRotationWrapperWorkspace");
    b.object = this;
    this.view_.appendChild(b);
    d = Entry.createElement("span");
    d.addClass("entryObjectCoordinateWorkspace");
    b.appendChild(d);
    e = Entry.createElement("span");
    e.addClass("entryObjectCoordinateSpanWorkspace");
    e.innerHTML = "X:";
    var g = Entry.createElement("input");
    g.addClass("entryObjectCoordinateInputWorkspace");
    g.setAttribute("readonly", !0);
    g.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    var h = Entry.createElement("span");
    h.addClass("entryObjectCoordinateSpanWorkspace");
    h.innerHTML = "Y:";
    var k = Entry.createElement("input");
    k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right");
    k.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    k.setAttribute("readonly", !0);
    var l = Entry.createElement("span");
    l.addClass("entryObjectCoordinateSizeWorkspace");
    l.innerHTML = Lang.Workspace.Size + " : ";
    var n = Entry.createElement("input");
    n.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size");
    n.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    n.setAttribute("readonly", !0);
    d.appendChild(e);
    d.appendChild(g);
    d.appendChild(h);
    d.appendChild(k);
    d.appendChild(l);
    d.appendChild(n);
    d.xInput_ = g;
    d.yInput_ = k;
    d.sizeInput_ = n;
    this.coordinateView_ = d;
    c = this;
    g.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    g.onblur = function(a) {
      isNaN(g.value) || c.entity.setX(+g.value);
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    k.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    k.onblur = function(a) {
      isNaN(k.value) || c.entity.setY(+k.value);
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    n.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    n.onblur = function(a) {
      isNaN(n.value) || c.entity.setSize(+n.value);
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    d = Entry.createElement("div");
    d.addClass("entryObjectRotateLabelWrapperWorkspace");
    this.view_.appendChild(d);
    this.rotateLabelWrapperView_ = d;
    e = Entry.createElement("span");
    e.addClass("entryObjectRotateSpanWorkspace");
    e.innerHTML = Lang.Workspace.rotation + " : ";
    var m = Entry.createElement("input");
    m.addClass("entryObjectRotateInputWorkspace");
    m.setAttribute("readonly", !0);
    m.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.rotateSpan_ = e;
    this.rotateInput_ = m;
    h = Entry.createElement("span");
    h.addClass("entryObjectDirectionSpanWorkspace");
    h.innerHTML = Lang.Workspace.direction + " : ";
    var q = Entry.createElement("input");
    q.addClass("entryObjectDirectionInputWorkspace");
    q.setAttribute("readonly", !0);
    q.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.directionInput_ = q;
    d.appendChild(e);
    d.appendChild(m);
    d.appendChild(h);
    d.appendChild(q);
    d.rotateInput_ = m;
    d.directionInput_ = q;
    c = this;
    m.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    m.onblur = function(a) {
      a = m.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || c.entity.setRotation(+a);
      c.updateRotationView();
      Entry.stage.updateObject();
    };
    q.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    q.onblur = function(a) {
      a = q.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || c.entity.setDirection(+a);
      c.updateRotationView();
      Entry.stage.updateObject();
    };
    d = Entry.createElement("div");
    d.addClass("rotationMethodWrapper");
    b.appendChild(d);
    this.rotationMethodWrapper_ = d;
    b = Entry.createElement("span");
    b.addClass("entryObjectRotateMethodLabelWorkspace");
    d.appendChild(b);
    b.innerHTML = Lang.Workspace.rotate_method + " : ";
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeAWorkspace");
    b.object = this;
    this.rotateModeAView_ = b;
    d.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("free"), this.object.setRotateMethod("free"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeBWorkspace");
    b.object = this;
    this.rotateModeBView_ = b;
    d.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("vertical"), this.object.setRotateMethod("vertical"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeCWorkspace");
    b.object = this;
    this.rotateModeCView_ = b;
    d.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("none"), this.object.setRotateMethod("none"));
    });
    this.updateThumbnailView();
    this.updateCoordinateView();
    this.updateRotateMethodView();
    this.updateInputViews();
    this.updateCoordinateView(!0);
    this.updateRotationView(!0);
    return this.view_;
  }
  if ("phone" == Entry.type) {
    return b = Entry.createElement("li", this.id), b.addClass("entryContainerListElementWorkspace"), b.object = this, b.bindOnClick(function(a) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    }), $ && (a = this, context.attach("#" + this.id, [{text:Lang.Workspace.context_rename, href:"/", action:function(a) {
      a.preventDefault();
    }}, {text:Lang.Workspace.context_duplicate, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.addCloneObject(a);
    }}, {text:Lang.Workspace.context_remove, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.removeObject(a);
    }}])), this.view_ = b, b = Entry.createElement("ul"), b.addClass("objectInfoView"), d = Entry.createElement("li"), d.addClass("objectInfo_visible"), e = Entry.createElement("li"), e.addClass("objectInfo_lock"), b.appendChild(d), b.appendChild(e), this.view_.appendChild(b), b = Entry.createElement("div"), b.addClass("entryObjectThumbnailWorkspace"), this.view_.appendChild(b), this.thumbnailView_ = b, b = Entry.createElement("div"), b.addClass("entryObjectWrapperWorkspace"), this.view_.appendChild(b), 
    d = Entry.createElement("input"), d.addClass("entryObjectNameWorkspace"), b.appendChild(d), this.nameView_ = d, this.nameView_.entryObject = this, this.nameView_.onblur = function() {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    }, this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    }, this.nameView_.value = this.name, Entry.objectEditable && Entry.objectDeletable && (d = Entry.createElement("div"), d.addClass("entryObjectDeletePhone"), d.object = this, this.deleteView_ = d, this.view_.appendChild(d), d.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    })), d = Entry.createElement("button"), d.addClass("entryObjectEditPhone"), d.object = this, d.bindOnClick(function(a) {
      if (a = Entry.container.getObject(this.id)) {
        Entry.container.selectObject(a.id), Entry.playground.injectObject(a);
      }
    }), this.view_.appendChild(d), d = Entry.createElement("div"), d.addClass("entryObjectInformationWorkspace"), d.object = this, this.isInformationToggle = !1, b.appendChild(d), this.informationView_ = d, d = Entry.createElement("div"), d.addClass("entryObjectRotateLabelWrapperWorkspace"), this.view_.appendChild(d), this.rotateLabelWrapperView_ = d, e = Entry.createElement("span"), e.addClass("entryObjectRotateSpanWorkspace"), e.innerHTML = Lang.Workspace.rotation + " : ", m = Entry.createElement("input"), 
    m.addClass("entryObjectRotateInputWorkspace"), this.rotateSpan_ = e, this.rotateInput_ = m, h = Entry.createElement("span"), h.addClass("entryObjectDirectionSpanWorkspace"), h.innerHTML = Lang.Workspace.direction + " : ", q = Entry.createElement("input"), q.addClass("entryObjectDirectionInputWorkspace"), this.directionInput_ = q, d.appendChild(e), d.appendChild(m), d.appendChild(h), d.appendChild(q), d.rotateInput_ = m, d.directionInput_ = q, c = this, m.onkeypress = function(a) {
      13 == a.keyCode && (a = m.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || c.entity.setRotation(+a), c.updateRotationView(), m.blur());
    }, m.onblur = function(a) {
      c.entity.setRotation(c.entity.getRotation());
      Entry.stage.updateObject();
    }, q.onkeypress = function(a) {
      13 == a.keyCode && (a = q.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || c.entity.setDirection(+a), c.updateRotationView(), q.blur());
    }, q.onblur = function(a) {
      c.entity.setDirection(c.entity.getDirection());
      Entry.stage.updateObject();
    }, b = Entry.createElement("div"), b.addClass("entryObjectRotationWrapperWorkspace"), b.object = this, this.view_.appendChild(b), d = Entry.createElement("span"), d.addClass("entryObjectCoordinateWorkspace"), b.appendChild(d), e = Entry.createElement("span"), e.addClass("entryObjectCoordinateSpanWorkspace"), e.innerHTML = "X:", g = Entry.createElement("input"), g.addClass("entryObjectCoordinateInputWorkspace"), h = Entry.createElement("span"), h.addClass("entryObjectCoordinateSpanWorkspace"), 
    h.innerHTML = "Y:", k = Entry.createElement("input"), k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right"), l = Entry.createElement("span"), l.addClass("entryObjectCoordinateSpanWorkspace"), l.innerHTML = Lang.Workspace.Size, n = Entry.createElement("input"), n.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size"), d.appendChild(e), d.appendChild(g), d.appendChild(h), d.appendChild(k), d.appendChild(l), d.appendChild(n), 
    d.xInput_ = g, d.yInput_ = k, d.sizeInput_ = n, this.coordinateView_ = d, c = this, g.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(g.value) || c.entity.setX(+g.value), c.updateCoordinateView(), c.blur());
    }, g.onblur = function(a) {
      c.entity.setX(c.entity.getX());
      Entry.stage.updateObject();
    }, k.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(k.value) || c.entity.setY(+k.value), c.updateCoordinateView(), c.blur());
    }, k.onblur = function(a) {
      c.entity.setY(c.entity.getY());
      Entry.stage.updateObject();
    }, d = Entry.createElement("div"), d.addClass("rotationMethodWrapper"), b.appendChild(d), this.rotationMethodWrapper_ = d, b = Entry.createElement("span"), b.addClass("entryObjectRotateMethodLabelWorkspace"), d.appendChild(b), b.innerHTML = Lang.Workspace.rotate_method + " : ", b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeAWorkspace"), b.object = this, this.rotateModeAView_ = b, d.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("free");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeBWorkspace"), b.object = this, this.rotateModeBView_ = b, d.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("vertical");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeCWorkspace"), b.object = this, this.rotateModeCView_ = b, d.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("none");
    }), this.updateThumbnailView(), this.updateCoordinateView(), this.updateRotateMethodView(), this.updateInputViews(), this.view_;
  }
};
Entry.EntryObject.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "object name must be string");
  this.name = b;
  this.nameView_.value = b;
};
Entry.EntryObject.prototype.setText = function(b) {
  Entry.assert("string" == typeof b, "object text must be string");
  this.text = b;
};
Entry.EntryObject.prototype.setScript = function(b) {
  this.script = b;
};
Entry.EntryObject.prototype.getScriptText = function() {
  return JSON.stringify(this.script.toJSON());
};
Entry.EntryObject.prototype.initEntity = function(b) {
  var a = {};
  a.x = a.y = 0;
  a.rotation = 0;
  a.direction = 90;
  if ("sprite" == this.objectType) {
    var c = b.sprite.pictures[0].dimension;
    a.regX = c.width / 2;
    a.regY = c.height / 2;
    a.scaleX = a.scaleY = "background" == b.sprite.category.main ? Math.max(270 / c.height, 480 / c.width) : "new" == b.sprite.category.main ? 1 : 200 / (c.width + c.height);
    a.width = c.width;
    a.height = c.height;
  } else {
    if ("textBox" == this.objectType) {
      if (a.regX = 25, a.regY = 12, a.scaleX = a.scaleY = 1.5, a.width = 50, a.height = 24, a.text = b.text, b.options) {
        if (b = b.options, c = "", b.bold && (c += "bold "), b.italic && (c += "italic "), a.underline = b.underline, a.strike = b.strike, a.font = c + "20px " + b.font.family, a.colour = b.colour, a.bgColor = b.background, a.lineBreak = b.lineBreak) {
          a.width = 256, a.height = .5625 * a.width, a.regX = a.width / 2, a.regY = a.height / 2;
        }
      } else {
        a.underline = !1, a.strike = !1, a.font = "20px Nanum Gothic", a.colour = "#000000", a.bgColor = "#ffffff";
      }
    }
  }
  return a;
};
Entry.EntryObject.prototype.updateThumbnailView = function() {
  if ("sprite" == this.objectType) {
    if (this.entity.picture.fileurl) {
      this.thumbnailView_.style.backgroundImage = 'url("' + this.entity.picture.fileurl + '")';
    } else {
      var b = this.entity.picture.filename;
      this.thumbnailView_.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/thumb/" + b + '.png")';
    }
  } else {
    "textBox" == this.objectType && (this.thumbnailView_.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/text_icon.png") + ")");
  }
};
Entry.EntryObject.prototype.updateCoordinateView = function(b) {
  if ((this.isSelected() || b) && this.coordinateView_ && this.coordinateView_.xInput_ && this.coordinateView_.yInput_) {
    b = this.coordinateView_.xInput_.value;
    var a = this.coordinateView_.yInput_.value, c = this.coordinateView_.sizeInput_.value, d = this.entity.getX().toFixed(1), e = this.entity.getY().toFixed(1), f = this.entity.getSize().toFixed(1);
    b != d && (this.coordinateView_.xInput_.value = d);
    a != e && (this.coordinateView_.yInput_.value = e);
    c != f && (this.coordinateView_.sizeInput_.value = f);
  }
};
Entry.EntryObject.prototype.updateRotationView = function(b) {
  if (this.isSelected() && this.view_ || b) {
    b = "", "free" == this.getRotateMethod() ? (this.rotateSpan_.removeClass("entryRemove"), this.rotateInput_.removeClass("entryRemove"), b += this.entity.getRotation().toFixed(1), this.rotateInput_.value = b + "\u02da") : (this.rotateSpan_.addClass("entryRemove"), this.rotateInput_.addClass("entryRemove")), b = "" + this.entity.getDirection().toFixed(1), b += "\u02da", this.directionInput_.value = b;
  }
};
Entry.EntryObject.prototype.select = function(b) {
  console.log(this);
};
Entry.EntryObject.prototype.addPicture = function(b, a) {
  Entry.stateManager && Entry.stateManager.addCommand("add sprite", this, this.removePicture, b.id);
  b.objectId = this.id;
  a || 0 === a ? (this.pictures.splice(a, 0, b), Entry.playground.injectPicture(this)) : this.pictures.push(b);
  return new Entry.State(this, this.removePicture, b.id);
};
Entry.EntryObject.prototype.removePicture = function(b) {
  if (2 > this.pictures.length) {
    return !1;
  }
  b = this.getPicture(b);
  var a = this.pictures.indexOf(b);
  Entry.stateManager && Entry.stateManager.addCommand("remove sprite", this, this.addPicture, b, a);
  this.pictures.splice(a, 1);
  b === this.selectedPicture && Entry.playground.selectPicture(this.pictures[0]);
  Entry.playground.injectPicture(this);
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addPicture, b, a);
};
Entry.EntryObject.prototype.getPicture = function(b) {
  if (!b) {
    return this.selectedPicture;
  }
  b = b.trim();
  for (var a = this.pictures, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[d];
    }
  }
  for (d = 0;d < c;d++) {
    if (a[d].name == b) {
      return a[d];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && c >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.setPicture = function(b) {
  for (var a in this.pictures) {
    if (b.id === this.pictures[a].id) {
      this.pictures[a] = b;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.getPrevPicture = function(b) {
  for (var a = this.pictures, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[0 == d ? c - 1 : d - 1];
    }
  }
};
Entry.EntryObject.prototype.getNextPicture = function(b) {
  for (var a = this.pictures, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[d == c - 1 ? 0 : d + 1];
    }
  }
};
Entry.EntryObject.prototype.selectPicture = function(b) {
  var a = this.getPicture(b);
  if (a) {
    this.selectedPicture = a, this.entity.setImage(a), this.updateThumbnailView();
  } else {
    throw Error("No picture with pictureId : " + b);
  }
};
Entry.EntryObject.prototype.addSound = function(b, a) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add sound", this, this.removeSound, b.id);
  Entry.initSound(b, a);
  a || 0 === a ? (this.sounds.splice(a, 0, b), Entry.playground.injectSound(this)) : this.sounds.push(b);
  return new Entry.State(this, this.removeSound, b.id);
};
Entry.EntryObject.prototype.removeSound = function(b) {
  var a;
  a = this.getSound(b);
  b = this.sounds.indexOf(a);
  Entry.stateManager && Entry.stateManager.addCommand("remove sound", this, this.addSound, a, b);
  this.sounds.splice(b, 1);
  Entry.playground.reloadPlayground();
  Entry.playground.injectSound(this);
  return new Entry.State(this, this.addSound, a, b);
};
Entry.EntryObject.prototype.getRotateMethod = function() {
  this.rotateMethod || (this.rotateMethod = "free");
  return this.rotateMethod;
};
Entry.EntryObject.prototype.setRotateMethod = function(b) {
  b || (b = "free");
  this.rotateMethod = b;
  this.updateRotateMethodView();
  Entry.stage.selectedObject && Entry.stage.selectedObject.entity && (Entry.stage.updateObject(), Entry.stage.updateHandle());
};
Entry.EntryObject.prototype.initRotateValue = function(b) {
  this.rotateMethod != b && (b = this.entity, b.rotation = 0, b.direction = 90, b.flip = !1);
};
Entry.EntryObject.prototype.updateRotateMethodView = function() {
  var b = this.rotateMethod;
  this.rotateModeAView_ && (this.rotateModeAView_.removeClass("selected"), this.rotateModeBView_.removeClass("selected"), this.rotateModeCView_.removeClass("selected"), "free" == b ? this.rotateModeAView_.addClass("selected") : "vertical" == b ? this.rotateModeBView_.addClass("selected") : this.rotateModeCView_.addClass("selected"), this.updateRotationView());
};
Entry.EntryObject.prototype.toggleInformation = function(b) {
  this.setRotateMethod(this.getRotateMethod());
  void 0 === b && (b = this.isInformationToggle = !this.isInformationToggle);
  b ? this.view_.addClass("informationToggle") : this.view_.removeClass("informationToggle");
};
Entry.EntryObject.prototype.addCloneEntity = function(b, a, c) {
  this.clonedEntities.length > Entry.maxCloneLimit || (b = new Entry.EntityObject(this), a ? (b.injectModel(a.picture ? a.picture : null, a.toJSON()), b.snapshot_ = a.snapshot_, a.effect && (b.effect = Entry.cloneSimpleObject(a.effect), b.applyFilter()), a.brush && Entry.setCloneBrush(b, a.brush)) : (b.injectModel(this.entity.picture ? this.entity.picture : null, this.entity.toJSON(b)), b.snapshot_ = this.entity.snapshot_, this.entity.effect && (b.effect = Entry.cloneSimpleObject(this.entity.effect), 
  b.applyFilter()), this.entity.brush && Entry.setCloneBrush(b, this.entity.brush)), Entry.engine.raiseEventOnEntity(b, [b, "when_clone_start"]), b.isClone = !0, b.isStarted = !0, this.addCloneVariables(this, b, a ? a.variables : null, a ? a.lists : null), this.clonedEntities.push(b), Entry.stage.loadEntity(b));
};
Entry.EntryObject.prototype.initializeSplitter = function(b) {
  b.onmousedown = function(a) {
    Entry.container.disableSort();
    Entry.container.splitterEnable = !0;
  };
  document.addEventListener("mousemove", function(a) {
    Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.x || a.clientX});
  });
  document.addEventListener("mouseup", function(a) {
    Entry.container.splitterEnable = !1;
    Entry.container.enableSort();
  });
};
Entry.EntryObject.prototype.isSelected = function() {
  return this.isSelected_;
};
Entry.EntryObject.prototype.toJSON = function() {
  var b = {};
  b.id = this.id;
  b.name = this.name;
  "textBox" == this.objectType && (b.text = this.text);
  b.script = this.getScriptText();
  "sprite" == this.objectType && (b.selectedPictureId = this.selectedPicture.id);
  b.objectType = this.objectType;
  b.rotateMethod = this.getRotateMethod();
  b.scene = this.scene.id;
  b.sprite = {pictures:Entry.getPicturesJSON(this.pictures), sounds:Entry.getSoundsJSON(this.sounds)};
  b.lock = this.lock;
  b.entity = this.entity.toJSON();
  return b;
};
Entry.EntryObject.prototype.destroy = function() {
  Entry.stage.unloadEntity(this.entity);
  this.view_ && Entry.removeElement(this.view_);
};
Entry.EntryObject.prototype.getSound = function(b) {
  b = b.trim();
  for (var a = this.sounds, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[d];
    }
  }
  for (d = 0;d < c;d++) {
    if (a[d].name == b) {
      return a[d];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && c >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No Sound");
};
Entry.EntryObject.prototype.addCloneVariables = function(b, a, c, d) {
  a.variables = [];
  a.lists = [];
  c || (c = Entry.findObjsByKey(Entry.variableContainer.variables_, "object_", b.id));
  d || (d = Entry.findObjsByKey(Entry.variableContainer.lists_, "object_", b.id));
  for (b = 0;b < c.length;b++) {
    a.variables.push(c[b].clone());
  }
  for (b = 0;b < d.length;b++) {
    a.lists.push(d[b].clone());
  }
};
Entry.EntryObject.prototype.getLock = function() {
  return this.lock;
};
Entry.EntryObject.prototype.setLock = function(b) {
  this.lock = b;
  Entry.stage.updateObject();
  return b;
};
Entry.EntryObject.prototype.updateInputViews = function(b) {
  b = b || this.getLock();
  var a = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b && 1 != a[0].getAttribute("readonly")) {
    for (b = 0;b < a.length;b++) {
      a[b].removeClass("selectedEditingObject"), a[b].setAttribute("readonly", !1), this.isEditing = !1;
    }
  }
};
Entry.EntryObject.prototype.editObjectValues = function(b) {
  var a;
  a = this.getLock() ? [this.nameView_] : [this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b) {
    var c = this.nameView_;
    $(a).removeClass("selectedNotEditingObject");
    $(c).removeClass("selectedNotEditingObject");
    window.setTimeout(function() {
      $(c).removeAttr("readonly");
      c.addClass("selectedEditingObject");
    });
    for (b = 0;b < a.length;b++) {
      $(a[b]).removeAttr("readonly"), a[b].addClass("selectedEditingObject");
    }
    this.isEditing = !0;
  } else {
    for (b = 0;b < a.length;b++) {
      a[b].blur(!0);
    }
    this.nameView_.blur(!0);
    this.blurAllInput();
    this.isEditing = !1;
  }
};
Entry.EntryObject.prototype.blurAllInput = function() {
  var b = document.getElementsByClassName("selectedEditingObject");
  $(b).removeClass("selectedEditingObject");
  for (var b = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_], a = 0;a < b.length;a++) {
    b[a].addClass("selectedNotEditingObject"), b[a].setAttribute("readonly", !0);
  }
};
Entry.EntryObject.prototype.addStampEntity = function(b) {
  b = new Entry.StampEntity(this, b);
  Entry.stage.loadEntity(b);
  this.clonedEntities.push(b);
  Entry.stage.sortZorder();
};
Entry.EntryObject.prototype.getClonedEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp || b.push(a);
  });
  return b;
};
Entry.EntryObject.prototype.getStampEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp && b.push(a);
  });
  return b;
};
Entry.EntryObject.prototype.clearExecutor = function() {
  this.script.clearExecutors();
};
Entry.EntryObject.prototype._rightClick = function(b) {
  var a = this, c = [{text:Lang.Workspace.context_rename, callback:function(b) {
    b.stopPropagation();
    a.setLock(!1);
    a.editObjectValues(!0);
    a.nameView_.select();
  }}, {text:Lang.Workspace.context_duplicate, enable:!Entry.engine.isState("run"), callback:function() {
    Entry.container.addCloneObject(a);
  }}, {text:Lang.Workspace.context_remove, callback:function() {
    Entry.container.removeObject(a);
  }}, {text:Lang.Workspace.copy_file, callback:function() {
    Entry.container.setCopiedObject(a);
  }}, {text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
    Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
  }}];
  b = Entry.Utils.convertMouseEvent(b);
  Entry.ContextMenu.show(c, "workspace-contextmenu", {x:b.clientX, y:b.clientY});
};
Entry.Painter = function() {
  this.toolbox = {selected:"cursor"};
  this.stroke = {enabled:!1, fillColor:"#000000", lineColor:"#000000", thickness:1, fill:!0, transparent:!1, style:"line", locked:!1};
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  this.font = {name:"KoPub Batang", size:20, style:"normal"};
  this.selectArea = {};
  this.firstStatement = !1;
};
Entry.Painter.prototype.initialize = function(b) {
  this.generateView(b);
  this.canvas = document.getElementById("entryPainterCanvas");
  this.canvas_ = document.getElementById("entryPainterCanvas_");
  this.stage = new createjs.Stage(this.canvas);
  this.stage.autoClear = !0;
  this.stage.enableDOMEvents(!0);
  this.stage.enableMouseOver(10);
  this.stage.mouseMoveOutside = !0;
  createjs.Touch.enable(this.stage);
  this.objectContainer = new createjs.Container;
  this.objectContainer.name = "container";
  this.stage.addChild(this.objectContainer);
  this.ctx = this.stage.canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = !1;
  this.ctx.webkitImageSmoothingEnabled = !1;
  this.ctx.mozImageSmoothingEnabled = !1;
  this.ctx.msImageSmoothingEnabled = !1;
  this.ctx.oImageSmoothingEnabled = !1;
  this.ctx_ = this.canvas_.getContext("2d");
  this.initDashedLine();
  this.initPicture();
  this.initCoordinator();
  this.initHandle();
  this.initDraw();
  var a = this;
  Entry.addEventListener("textUpdate", function() {
    var b = a.inputField.value();
    "" === b ? (a.inputField.hide(), delete a.inputField) : (a.inputField.hide(), a.drawText(b), a.selectToolbox("cursor"));
  });
  this.selectToolbox("cursor");
};
Entry.Painter.prototype.initHandle = function() {
  this._handle = new createjs.Container;
  this._handle.rect = new createjs.Shape;
  this._handle.addChild(this._handle.rect);
  var b = new createjs.Container;
  b.name = "move";
  b.width = 90;
  b.height = 90;
  b.x = 90;
  b.y = 90;
  b.rect = new createjs.Shape;
  var a = this;
  b.rect.on("mousedown", function(c) {
    "cursor" === a.toolbox.selected && (a.initCommand(), this.offset = {x:this.parent.x - this.x - c.stageX, y:this.parent.y - this.y - c.stageY}, this.parent.handleMode = "move", b.isSelectCenter = !1);
  });
  b.rect.on("pressmove", function(c) {
    "cursor" !== a.toolbox.selected || b.isSelectCenter || (a.doCommand(), this.parent.x = c.stageX + this.offset.x, this.parent.y = c.stageY + this.offset.y, a.updateImageHandle());
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.rect.cursor = "move";
  b.addChild(b.rect);
  b.notch = new createjs.Shape;
  b.addChild(b.notch);
  b.NEHandle = this.generateCornerHandle();
  b.addChild(b.NEHandle);
  b.NWHandle = this.generateCornerHandle();
  b.addChild(b.NWHandle);
  b.SWHandle = this.generateCornerHandle();
  b.addChild(b.SWHandle);
  b.SEHandle = this.generateCornerHandle();
  b.addChild(b.SEHandle);
  b.EHandle = this.generateXHandle();
  b.addChild(b.EHandle);
  b.WHandle = this.generateXHandle();
  b.addChild(b.WHandle);
  b.NHandle = this.generateYHandle();
  b.addChild(b.NHandle);
  b.SHandle = this.generateYHandle();
  b.addChild(b.SHandle);
  b.RHandle = new createjs.Shape;
  b.RHandle.graphics.ss(2, 2, 0).beginFill("#888").s("#c1c7cd").f("#c1c7cd").dr(-2, -2, 8, 8);
  b.RHandle.on("mousedown", function(b) {
    a.initCommand();
  });
  b.RHandle.on("pressmove", function(b) {
    a.doCommand();
    var d = b.stageX - this.parent.x;
    b = b.stageY - this.parent.y;
    this.parent.rotation = 0 <= d ? Math.atan(b / d) / Math.PI * 180 + 90 : Math.atan(b / d) / Math.PI * 180 + 270;
    a.updateImageHandle();
  });
  b.RHandle.cursor = "crosshair";
  b.addChild(b.RHandle);
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.visible = !1;
  this.handle = b;
  this.stage.addChild(b);
  this.updateImageHandleCursor();
};
Entry.Painter.prototype.generateCornerHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var d = Math.sqrt(Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x * (a.stageY - this.parent.y + this.parent.regY) / this.offset.y));
    10 < this.parent.width * d && 10 < this.parent.height * d && (this.parent.width *= d, this.parent.height *= d, this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateXHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var d = Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x);
    10 < this.parent.width * d && (this.parent.width *= d, this.offset = {x:a.stageX - this.parent.x + this.parent.regX});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateYHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var d = Math.abs((a.stageY - this.parent.y + this.parent.regY) / this.offset.y);
    10 < this.parent.height * d && (this.parent.height *= d, this.offset = {y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.updateImageHandle = function() {
  if (this.handle.visible) {
    var b = this.handle, a = b.direction, c = b.width, d = b.height, e = b.regX, f = b.regY;
    b.rect.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(-c / 2, -d / 2).lt(0, -d / 2).lt(0, -d / 2).lt(+c / 2, -d / 2).lt(+c / 2, +d / 2).lt(-c / 2, +d / 2).cp();
    b.notch.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(0, -d / 2).lt(0, -d / 2 - 20).cp();
    b.NEHandle.x = +b.width / 2;
    b.NEHandle.y = -b.height / 2;
    b.NWHandle.x = -b.width / 2;
    b.NWHandle.y = -b.height / 2;
    b.SWHandle.x = -b.width / 2;
    b.SWHandle.y = +b.height / 2;
    b.SEHandle.x = +b.width / 2;
    b.SEHandle.y = +b.height / 2;
    b.EHandle.x = +b.width / 2;
    b.EHandle.y = 0;
    b.WHandle.x = -b.width / 2;
    b.WHandle.y = 0;
    b.NHandle.x = 0;
    b.NHandle.y = -b.height / 2;
    b.SHandle.x = 0;
    b.SHandle.y = +b.height / 2;
    b.RHandle.x = -2;
    b.RHandle.y = -b.height / 2 - 20 - 2;
    this.handle.visible && (c = this.selectedObject, this.selectedObject.text ? (c.width = this.selectedObject.width, c.height = this.selectedObject.height) : (c.width = c.image.width, c.height = c.image.height), c.scaleX = b.width / c.width, c.scaleY = b.height / c.height, c.x = b.x, c.y = b.y, c.regX = c.width / 2 + e / c.scaleX, c.regY = c.height / 2 + f / c.scaleY, c.rotation = b.rotation, c.direction = a, this.selectArea.x1 = b.x - b.width / 2, this.selectArea.y1 = b.y - b.height / 2, this.selectArea.x2 = 
    b.width, this.selectArea.y2 = b.height, this.objectWidthInput.value = Math.abs(c.width * c.scaleX).toFixed(0), this.objectHeightInput.value = Math.abs(c.height * c.scaleY).toFixed(0), this.objectRotateInput.value = (1 * c.rotation).toFixed(0));
    this.updateImageHandleCursor();
    this.stage.update();
  }
};
Entry.Painter.prototype.updateImageHandleCursor = function() {
  var b = this.handle;
  b.rect.cursor = "move";
  b.RHandle.cursor = "crosshair";
  for (var a = ["nwse-resize", "ns-resize", "nesw-resize", "ew-resize"], c = Math.floor((b.rotation + 22.5) % 180 / 45), d = 0;d < c;d++) {
    a.push(a.shift());
  }
  b.NHandle.cursor = a[1];
  b.NEHandle.cursor = a[2];
  b.EHandle.cursor = a[3];
  b.SEHandle.cursor = a[0];
  b.SHandle.cursor = a[1];
  b.SWHandle.cursor = a[2];
  b.WHandle.cursor = a[3];
  b.NWHandle.cursor = a[0];
};
Entry.Painter.prototype.clearCanvas = function(b) {
  this.clearHandle();
  b || this.initCommand();
  this.objectContainer.removeAllChildren();
  this.stage.update();
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  b = 0;
  for (var a = this.colorLayerData.data.length;b < a;b++) {
    this.colorLayerData.data[b] = 255, this.colorLayerData.data[b + 1] = 255, this.colorLayerData.data[b + 2] = 255, this.colorLayerData.data[b + 3] = 255;
  }
  this.reloadContext();
};
Entry.Painter.prototype.newPicture = function() {
  var b = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
  b.id = Entry.generateHash();
  Entry.playground.addPicture(b, !0);
};
Entry.Painter.prototype.initPicture = function() {
  var b = this;
  Entry.addEventListener("pictureSelected", function(a) {
    b.selectToolbox("cursor");
    if (b.file.id !== a.id) {
      b.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && (b.file_ = JSON.parse(JSON.stringify(b.file)), b.file_save(!0));
      b.file.modified = !1;
      b.clearCanvas(!0);
      var c = new Image;
      c.id = a.id ? a.id : Entry.generateHash();
      b.file.id = c.id;
      b.file.name = a.name;
      b.file.mode = "edit";
      c.src = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/image/" + a.filename + ".png";
      c.onload = function(a) {
        b.addImage(a.target);
      };
    }
  });
  Entry.addEventListener("pictureImport", function(a) {
    b.addPicture(a);
  });
  Entry.addEventListener("pictureNameChanged", function(a) {
    b.file.name = a.name;
  });
  Entry.addEventListener("pictureClear", function(a) {
    b.file.modified = !1;
    b.file.id = "";
    b.file.name = "";
    b.clearCanvas();
  });
};
Entry.Painter.prototype.initDraw = function() {
  var b = this;
  this.stage.on("stagemousedown", function(a) {
    b.stagemousedown(a);
  });
  this.stage.on("stagemouseup", function(a) {
    b.stagemouseup(a);
  });
  this.stage.on("stagemousemove", function(a) {
    b.stagemousemove(a);
  });
};
Entry.Painter.prototype.selectObject = function(b, a) {
  this.selectedObject = b;
  this.handle.visible = b.visible;
  a ? (this.handle.width = this.copy.width, this.handle.height = this.copy.height, this.handle.x = this.selectArea.x1 + this.copy.width / 2, this.handle.y = this.selectArea.y1 + this.copy.height / 2) : (this.handle.width = b.scaleX * b.image.width, this.handle.height = b.scaleY * b.image.height, this.handle.x = b.x, this.handle.y = b.y, this.handle.regX = +(b.regX - b.image.width / 2) * b.scaleX, this.handle.regY = +(b.regY - b.image.height / 2) * b.scaleY);
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.selectTextObject = function(b) {
  this.selectedObject = b;
  var a = b.getTransformedBounds();
  this.handle.visible = b.visible;
  b.width || (this.selectedObject.width = a.width);
  b.height || (this.selectedObject.height = a.height);
  this.handle.width = b.scaleX * this.selectedObject.width;
  this.handle.height = b.scaleY * this.selectedObject.height;
  this.handle.x = b.x;
  this.handle.y = b.y;
  b.regX || (b.regX = b.width / 2);
  b.regY || (b.regY = b.height / 2);
  this.handle.regX = (b.regX - this.selectedObject.width / 2) * b.scaleX;
  this.handle.regY = (b.regY - this.selectedObject.height / 2) * b.scaleY;
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.updateHandle = function() {
  -1 < this.stage.getChildIndex(this._handle) && this.stage.removeChild(this._handle);
  -1 === this.stage.getChildIndex(this.handle) && this.stage.addChild(this.handle);
  var b = new createjs.Shape;
  b.graphics.clear().beginFill("#000").rect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.handle.rect.hitArea = b;
  this.handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#000000").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 4);
  this.stage.update();
};
Entry.Painter.prototype.updateHandle_ = function() {
  this.stage.getChildIndex(-1 < this._handle) && this.stage.addChild(this._handle);
  this._handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#cccccc").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 2);
  this.stage.update();
};
Entry.Painter.prototype.matchTolerance = function(b, a, c, d, e) {
  var f = this.colorLayerData.data[b], g = this.colorLayerData.data[b + 1];
  b = this.colorLayerData.data[b + 2];
  return f >= a - e / 100 * a && f <= a + e / 100 * a && g >= c - e / 100 * c && g <= c + e / 100 * c && b >= d - e / 100 * d && b <= d + e / 100 * d;
};
Entry.Painter.prototype.matchColorOnly = function(b, a, c, d) {
  return a === this.colorLayerData.data[b] && c === this.colorLayerData.data[b + 1] && d === this.colorLayerData.data[b + 2] ? !0 : !1;
};
Entry.Painter.prototype.matchColor = function(b, a, c, d, e) {
  return a === this.colorLayerData.data[b] && c === this.colorLayerData.data[b + 1] && d === this.colorLayerData.data[b + 2] && e === this.colorLayerData.data[b + 3] ? !0 : !1;
};
Entry.Painter.prototype.colorPixel = function(b, a, c, d, e) {
  e || (e = 255);
  this.stroke.transparent && (e = d = c = a = 0);
  this.colorLayerData.data[b] = a;
  this.colorLayerData.data[b + 1] = c;
  this.colorLayerData.data[b + 2] = d;
  this.colorLayerData.data[b + 3] = e;
};
Entry.Painter.prototype.pickStrokeColor = function(b) {
  b = 4 * (Math.round(b.stageY) * this.canvas.width + Math.round(b.stageX));
  this.stroke.lineColor = Entry.rgb2hex(this.colorLayerData.data[b], this.colorLayerData.data[b + 1], this.colorLayerData.data[b + 2]);
  document.getElementById("entryPainterAttrCircle").style.backgroundColor = this.stroke.lineColor;
  document.getElementById("entryPainterAttrCircleInput").value = this.stroke.lineColor;
};
Entry.Painter.prototype.drawText = function(b) {
  var a = document.getElementById("entryPainterAttrFontStyle").value, c = document.getElementById("entryPainterAttrFontName").value, d = document.getElementById("entryPainterAttrFontSize").value;
  b = new createjs.Text(b, a + " " + d + 'px "' + c + '"', this.stroke.lineColor);
  b.textBaseline = "top";
  b.x = this.oldPt.x;
  b.y = this.oldPt.y;
  this.objectContainer.addChild(b);
  this.selectTextObject(b);
  this.file.modified = !0;
};
Entry.Painter.prototype.addImage = function(b) {
  var a = new createjs.Bitmap(b);
  this.objectContainer.addChild(a);
  a.x = this.stage.canvas.width / 2;
  a.y = this.stage.canvas.height / 2;
  a.regX = a.image.width / 2 | 0;
  a.regY = a.image.height / 2 | 0;
  if (540 < a.image.height) {
    var c = 540 / a.image.height;
    a.scaleX = c;
    a.scaleY = c;
  }
  a.name = b.id;
  a.id = b.id;
  this.selectObject(a);
  this.stage.update();
};
Entry.Painter.prototype.createBrush = function() {
  this.initCommand();
  this.brush = new createjs.Shape;
  this.objectContainer.addChild(this.brush);
  this.stage.update();
};
Entry.Painter.prototype.createEraser = function() {
  this.initCommand();
  this.eraser = new createjs.Shape;
  this.objectContainer.addChild(this.eraser);
  this.stage.update();
};
Entry.Painter.prototype.clearHandle = function() {
  this.handle.visible && (this.handle.visible = !1);
  this.coordinator.visible && (this.coordinator.visible = !1);
  this.stage.update();
};
Entry.Painter.prototype.initCommand = function() {
  var b = !1;
  this.handle.visible && (b = !0, this.handle.visible = !1);
  var a = !1;
  this.coordinator.visible && (a = !0, this.coordinator.visible = !1);
  (b || a) && this.stage.update();
  this.isCommandValid = !1;
  this.colorLayerModel = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  Entry.stateManager && this.firstStatement && Entry.stateManager.addCommand("edit sprite", this, this.restorePainter, this.colorLayerModel);
  this.firstStatement = !0;
  b && (this.handle.visible = !0);
  a && (this.coordinator.visible = !0);
  (b || a) && this.stage.update();
};
Entry.Painter.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.Painter.prototype.checkCommand = function() {
  this.isCommandValid || Entry.dispatchEvent("cancelLastCommand");
};
Entry.Painter.prototype.restorePainter = function(b) {
  this.clearHandle();
  var a = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(b, 0, 0);
  b = new Image;
  b.src = this.canvas.toDataURL();
  var c = this;
  b.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    c.objectContainer.removeAllChildren();
    c.objectContainer.addChild(a);
  };
  Entry.stateManager && Entry.stateManager.addCommand("restore sprite", this, this.restorePainter, a);
};
Entry.Painter.prototype.platten = function() {
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.reloadContext();
};
Entry.Painter.prototype.fill = function() {
  if (!this.stroke.locked) {
    this.stroke.locked = !0;
    this.initCommand();
    this.doCommand();
    this.clearHandle();
    var b = this.canvas.width, a = this.canvas.height;
    this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
    var c = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
    c.x = Math.round(c.x);
    c.y = Math.round(c.y);
    for (var d = 4 * (c.y * b + c.x), e = this.colorLayerData.data[d], f = this.colorLayerData.data[d + 1], g = this.colorLayerData.data[d + 2], h = this.colorLayerData.data[d + 3], k, l, c = [[c.x, c.y]], n = Entry.hex2rgb(this.stroke.lineColor);c.length;) {
      for (var d = c.pop(), m = d[0], q = d[1], d = 4 * (q * b + m);0 <= q && this.matchColor(d, e, f, g, h);) {
        --q, d -= 4 * b;
      }
      d += 4 * b;
      q += 1;
      for (l = k = !1;q < a - 1 && this.matchColor(d, e, f, g, h);) {
        q += 1, this.colorPixel(d, n.r, n.g, n.b), 0 < m && (this.matchColor(d - 4, e, f, g, h) ? k || (c.push([m - 1, q]), k = !0) : k && (k = !1)), m < b - 1 && (this.matchColor(d + 4, e, f, g, h) ? l || (c.push([m + 1, q]), l = !0) : l && (l = !1)), d += 4 * b;
      }
      if (1080 < c.length) {
        break;
      }
    }
    this.file.modified = !0;
    this.reloadContext();
  }
};
Entry.Painter.prototype.reloadContext = function() {
  delete this.selectedObject;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    a.stroke.locked = !1;
  };
};
Entry.Painter.prototype.move_pen = function() {
  var b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.brush.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke(this.stroke.lineColor).moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_line = function() {
  this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").moveTo(this.oldPt.x, this.oldPt.y).lineTo(this.stage.mouseX, this.stage.mouseY);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_rect = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, this.oldPt.y, b, a);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_circle = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().beginStroke(this.stroke.fillColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.stroke.fill || (0 === this.stroke.thickness ? this.brush.graphics.clear().drawEllipse(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawEllipse(this.oldPt.x, this.oldPt.y, b, a));
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.edit_copy = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0)) : alert("\ubcf5\uc0ac\ud560 \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_cut = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0), this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), this.reloadContext(), this.file.modified = !0) : alert("\uc790\ub97c \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_paste = function() {
  var b = new Image;
  b.src = this.canvas_.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    b.x = a.canvas.width / 2;
    b.y = a.canvas.height / 2;
    b.regX = a.copy.width / 2 | 0;
    b.regY = a.copy.height / 2 | 0;
    b.id = Entry.generateHash();
    a.objectContainer.addChild(b);
    a.selectObject(b, !0);
  };
  this.file.modified = !0;
};
Entry.Painter.prototype.edit_select = function() {
  this.clearHandle();
  this.selectedObject && delete this.selectedObject;
  this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.copy = {};
  this.copy.width = this.selectArea.x2;
  this.copy.height = this.selectArea.y2;
  this.canvas_.width = this.copy.width;
  this.canvas_.height = this.copy.height;
  this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ctx_.putImageData(this.copyLayerData, 0, 0);
  this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    b = new Image;
    b.src = a.canvas_.toDataURL();
    b.onload = function(b) {
      b = new createjs.Bitmap(b.target);
      b.x = a.selectArea.x1 + a.copy.width / 2;
      b.y = a.selectArea.y1 + a.copy.height / 2;
      b.regX = a.copy.width / 2 | 0;
      b.regY = a.copy.height / 2 | 0;
      b.id = Entry.generateHash();
      b.name = b.id;
      a.objectContainer.addChild(b);
      a.selectObject(b, !0);
    };
  };
};
Entry.Painter.prototype.move_erase = function(b) {
  b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.eraser.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke("#ffffff").moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.settingShapeBlur = function() {
  this.objectWidthInput.blur();
  this.objectHeightInput.blur();
  this.objectRotateInput.blur();
};
Entry.Painter.prototype.stagemousedown = function(b) {
  "picture" == Entry.playground.getViewMode() && (this.settingShapeBlur(), this.oldPt = new createjs.Point(b.stageX, b.stageY), this.oldMidPt = this.oldPt.clone(), "select" === this.toolbox.selected ? this.stage.addChild(this._handle) : "spoid" === this.toolbox.selected ? this.pickStrokeColor(b) : "text" === this.toolbox.selected ? (this.showInputField(b), this.stage.update()) : "erase" === this.toolbox.selected ? (this.createEraser(), this.stroke.enabled = !0) : "fill" === this.toolbox.selected ? 
  this.fill() : "cursor" !== this.toolbox.selected && (this.createBrush(), this.stroke.enabled = !0));
};
Entry.Painter.prototype.stagemousemove = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected && -1 < this.stage.getChildIndex(this._handle) ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.updateHandle_()) : this.stroke.enabled && (this.doCommand(), "pen" === this.toolbox.selected ? this.move_pen(b) : "line" === this.toolbox.selected ? this.move_line(b) : "rect" === this.toolbox.selected ? 
  this.move_rect(b) : "circle" === this.toolbox.selected ? this.move_circle(b) : "erase" === this.toolbox.selected && this.move_erase(b)), this.painterTopStageXY.innerHTML = "x:" + b.stageX.toFixed(1) + ", y:" + b.stageY.toFixed(1));
};
Entry.Painter.prototype.stagemouseup = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.stage.removeChild(this._handle), this.stage.update(), 0 < this.selectArea.x2 && 0 < this.selectArea.y2 && this.edit_select(), this.selectToolbox("cursor")) : "cursor" !== this.toolbox.selected && this.stroke.enabled && (-1 < this.objectContainer.getChildIndex(this.eraser) && 
  this.eraser.graphics.endStroke(), -1 < this.objectContainer.getChildIndex(this.brush) && this.brush.graphics.endStroke(), this.clearHandle(), this.platten(), this.stroke.enabled = !1, this.checkCommand()));
};
Entry.Painter.prototype.file_save = function(b) {
  this.clearHandle();
  this.transparent();
  this.trim();
  var a = this.canvas_.toDataURL();
  Entry.dispatchEvent("saveCanvasImage", {file:b ? this.file_ : this.file, image:a});
  this.file.modified = !1;
};
Entry.Painter.prototype.transparent = function() {
  var b = this.canvas.width, a = this.canvas.height;
  this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
  var c = b * (a - 1) * 4, d = 4 * (b - 1), e = 4 * (b * a - 1);
  this.matchColorOnly(0, 255, 255, 255) ? this.fillTransparent(1, 1) : this.matchColorOnly(c, 255, 255, 255) ? this.fillTransparent(1, a) : this.matchColorOnly(d, 255, 255, 255) ? this.fillTransparent(b, 1) : this.matchColorOnly(e, 255, 255, 255) && this.fillTransparent(b, a);
};
Entry.Painter.prototype.fillTransparent = function(b, a) {
  this.stage.mouseX = b;
  this.stage.mouseY = a;
  this.stroke.transparent = !0;
  this.fill();
};
Entry.Painter.prototype.trim = function() {
  var b = this.canvas.width, a = this.ctx.getImageData(0, 0, b, this.canvas.height), c = a.data.length, d, e = null, f = null, g = null, h = null, k;
  for (d = 0;d < c;d += 4) {
    0 !== a.data[d + 3] && (g = d / 4 % b, k = ~~(d / 4 / b), null === e && (e = k), null === f ? f = g : g < f && (f = g), null === h ? h = k : h < k && (h = k));
  }
  b = h - e;
  a = g - f;
  c = null;
  0 === b || 0 === a ? (c = this.ctx.getImageData(0, 0, 1, 1), c.data[0] = 255, c.data[1] = 255, c.data[2] = 255, c.data[3] = 255, this.canvas_.width = 1, this.canvas_.height = 1) : (c = this.ctx.getImageData(f, e, a, b), this.canvas_.width = a, this.canvas_.height = b);
  this.ctx_.putImageData(c, 0, 0);
};
Entry.Painter.prototype.showInputField = function(b) {
  this.inputField ? (Entry.dispatchEvent("textUpdate"), delete this.inputField) : (this.initCommand(), this.doCommand(), this.inputField = new CanvasInput({canvas:document.getElementById("entryPainterCanvas"), fontSize:20, fontFamily:this.font.name, fontColor:"#000", width:650, padding:8, borderWidth:1, borderColor:"#000", borderRadius:3, boxShadow:"1px 1px 0px #fff", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:b.stageX, y:b.stageY, onsubmit:function() {
    Entry.dispatchEvent("textUpdate");
  }}), this.inputField.show());
};
Entry.Painter.prototype.addPicture = function(b) {
  this.initCommand();
  var a = new Image;
  a.id = Entry.generateHash();
  a.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
  var c = this;
  a.onload = function(a) {
    c.addImage(a.target);
    c.selectToolbox("cursor");
  };
};
Entry.Painter.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "/workspace_coordinate.png");
  b.addChild(a);
  this.stage.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Painter.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  this.stage.update();
};
Entry.Painter.prototype.initDashedLine = function() {
  createjs.Graphics.prototype.dashedLineTo = function(b, a, c, d, e) {
    this.moveTo(b, a);
    var f = c - b, g = d - a;
    e = Math.floor(Math.sqrt(f * f + g * g) / e);
    for (var f = f / e, g = g / e, h = 0;h++ < e;) {
      b += f, a += g, this[0 === h % 2 ? "moveTo" : "lineTo"](b, a);
    }
    this[0 === h % 2 ? "moveTo" : "lineTo"](c, d);
    return this;
  };
  createjs.Graphics.prototype.drawDashedRect = function(b, a, c, d, e) {
    this.moveTo(b, a);
    c = b + c;
    d = a + d;
    this.dashedLineTo(b, a, c, a, e);
    this.dashedLineTo(c, a, c, d, e);
    this.dashedLineTo(c, d, b, d, e);
    this.dashedLineTo(b, d, b, a, e);
    return this;
  };
  createjs.Graphics.prototype.drawResizableDashedRect = function(b, a, c, d, e, f) {
    this.moveTo(b, a);
    c = b + c;
    d = a + d;
    this.dashedLineTo(b + f, a, c - f, a, e);
    this.dashedLineTo(c, a + f, c, d - f, e);
    this.dashedLineTo(c - f, d, b + f, d, e);
    this.dashedLineTo(b, d - f, b, a + f, e);
    return this;
  };
};
Entry.Painter.prototype.generateView = function(b) {
  var a = this;
  this.view_ = b;
  if (!Entry.type || "workspace" == Entry.type) {
    this.view_.addClass("entryPainterWorkspace");
    var c = Entry.createElement("div", "entryPainterTop");
    c.addClass("entryPlaygroundPainterTop");
    this.view_.appendChild(c);
    var d = Entry.createElement("div", "entryPainterToolbox");
    d.addClass("entryPlaygroundPainterToolbox");
    this.view_.appendChild(d);
    var e = Entry.createElement("div", "entryPainterToolboxTop");
    e.addClass("entryPainterToolboxTop");
    d.appendChild(e);
    var f = Entry.createElement("div", "entryPainterContainer");
    f.addClass("entryPlaygroundPainterContainer");
    this.view_.appendChild(f);
    e = Entry.createElement("canvas", "entryPainterCanvas");
    e.width = 960;
    e.height = 540;
    e.addClass("entryPlaygroundPainterCanvas");
    f.appendChild(e);
    e = Entry.createElement("canvas", "entryPainterCanvas_");
    e.addClass("entryRemove");
    e.width = 960;
    e.height = 540;
    f.appendChild(e);
    var g = Entry.createElement("div", "entryPainterAttr");
    g.addClass("entryPlaygroundPainterAttr");
    this.view_.appendChild(g);
    this.flipObject = Entry.createElement("div", "entryPictureFlip");
    this.flipObject.addClass("entryPlaygroundPainterFlip");
    g.appendChild(this.flipObject);
    e = Entry.createElement("div", "entryPictureFlipX");
    e.title = "\uc88c\uc6b0\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleX *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipX");
    this.flipObject.appendChild(e);
    e = Entry.createElement("div", "entryPictureFlipY");
    e.title = "\uc0c1\ud558\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleY *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipY");
    this.flipObject.appendChild(e);
    Entry.addEventListener("windowResized", function(a) {
      var c = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      a = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var d = parseInt(document.getElementById("entryCanvas").style.width), c = c - (d + 240), d = a - 349;
      b.style.width = c + "px";
      f.style.width = c - 54 + "px";
      f.style.height = d + "px";
      g.style.top = d + 30 + "px";
      g.style.height = a - d + "px";
    });
    var h = Entry.createElement("nav", "entryPainterTopMenu");
    h.addClass("entryPlaygroundPainterTopMenu");
    c.appendChild(h);
    e = Entry.createElement("ul");
    h.appendChild(e);
    var k = Entry.createElement("li");
    h.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuFileNew");
    h.bindOnClick(function() {
      a.newPicture();
    });
    h.addClass("entryPlaygroundPainterTopMenuFileNew");
    h.innerHTML = Lang.Workspace.new_picture;
    k.appendChild(h);
    h = Entry.createElement("li", "entryPainterTopMenuFile");
    h.addClass("entryPlaygroundPainterTopMenuFile");
    h.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(h);
    k = Entry.createElement("ul");
    h.appendChild(k);
    h = Entry.createElement("li");
    k.appendChild(h);
    var l = Entry.createElement("a", "entryPainterTopMenuFileSave");
    l.bindOnClick(function() {
      a.file_save(!1);
    });
    l.addClass("entryPainterTopMenuFileSave");
    l.innerHTML = Lang.Workspace.painter_file_save;
    h.appendChild(l);
    h = Entry.createElement("li");
    k.appendChild(h);
    k = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    k.bindOnClick(function() {
      a.file.mode = "new";
      a.file_save(!1);
    });
    k.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    k.innerHTML = Lang.Workspace.painter_file_saveas;
    h.appendChild(k);
    k = Entry.createElement("li", "entryPainterTopMenuEdit");
    k.addClass("entryPlaygroundPainterTopMenuEdit");
    k.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(k);
    e = Entry.createElement("ul");
    k.appendChild(e);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    h.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    h.addClass("entryPainterTopMenuEditImport");
    h.innerHTML = Lang.Workspace.get_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    h.bindOnClick(function() {
      a.edit_copy();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCopy");
    h.innerHTML = Lang.Workspace.copy_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCut");
    h.bindOnClick(function() {
      a.edit_cut();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCut");
    h.innerHTML = Lang.Workspace.cut_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    h.bindOnClick(function() {
      a.edit_paste();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditPaste");
    h.innerHTML = Lang.Workspace.paste_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      a.clearCanvas();
    });
    k.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    c.appendChild(e);
    e = Entry.createElement("ul", "entryPainterTopToolbar");
    e.addClass("entryPlaygroundPainterTopToolbar");
    c.appendChild(e);
    c = Entry.createElement("li", "entryPainterTopToolbarUndo");
    c.bindOnClick(function() {
    });
    c.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(c);
    c = Entry.createElement("li", "entryPainterTopToolbarRedo");
    c.bindOnClick(function() {
    });
    c.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(c);
    c = Entry.createElement("ul");
    c.addClass("entryPlaygroundPainterToolboxContainer");
    d.appendChild(c);
    this.toolboxCursor = Entry.createElement("li", "entryPainterToolboxCursor");
    this.toolboxCursor.title = "\uc774\ub3d9";
    this.toolboxCursor.bindOnClick(function() {
      a.selectToolbox("cursor");
    });
    this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
    c.appendChild(this.toolboxCursor);
    this.toolboxSelect = Entry.createElement("li", "entryPainterToolboxSelect");
    this.toolboxSelect.title = "\uc790\ub974\uae30";
    this.toolboxSelect.bindOnClick(function() {
      a.selectToolbox("select");
    });
    this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
    c.appendChild(this.toolboxSelect);
    this.toolboxPen = Entry.createElement("li", "entryPainterToolboxPen");
    this.toolboxPen.title = "\ud39c";
    this.toolboxPen.bindOnClick(function() {
      a.selectToolbox("pen");
    });
    this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
    c.appendChild(this.toolboxPen);
    this.toolboxLine = Entry.createElement("li", "entryPainterToolboxLine");
    this.toolboxLine.title = "\uc9c1\uc120";
    this.toolboxLine.bindOnClick(function() {
      a.selectToolbox("line");
    });
    this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
    c.appendChild(this.toolboxLine);
    this.toolboxRect = Entry.createElement("li", "entryPainterToolboxRect");
    this.toolboxRect.title = "\uc0ac\uac01\ud615";
    this.toolboxRect.bindOnClick(function() {
      a.selectToolbox("rect");
    });
    this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
    c.appendChild(this.toolboxRect);
    this.toolboxCircle = Entry.createElement("li", "entryPainterToolboxCircle");
    this.toolboxCircle.title = "\uc6d0";
    this.toolboxCircle.bindOnClick(function() {
      a.selectToolbox("circle");
    });
    this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
    c.appendChild(this.toolboxCircle);
    this.toolboxText = Entry.createElement("li", "entryPainterToolboxText");
    this.toolboxText.title = "\uae00\uc0c1\uc790";
    this.toolboxText.bindOnClick(function() {
      a.selectToolbox("text");
    });
    this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
    c.appendChild(this.toolboxText);
    this.toolboxFill = Entry.createElement("li", "entryPainterToolboxFill");
    this.toolboxFill.bindOnClick(function() {
      a.selectToolbox("fill");
    });
    this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
    c.appendChild(this.toolboxFill);
    this.toolboxErase = Entry.createElement("li", "entryPainterToolboxErase");
    this.toolboxErase.title = "\uc9c0\uc6b0\uae30";
    this.toolboxErase.bindOnClick(function() {
      a.selectToolbox("erase");
    });
    this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
    c.appendChild(this.toolboxErase);
    d = Entry.createElement("li", "entryPainterToolboxCoordinate");
    d.title = "\uc88c\ud45c";
    d.bindOnClick(function() {
      a.toggleCoordinator();
    });
    d.addClass("entryPlaygroundPainterToolboxCoordinate");
    c.appendChild(d);
    this.attrResizeArea = Entry.createElement("fieldset", "painterAttrResize");
    this.attrResizeArea.addClass("entryPlaygroundPainterAttrResize");
    g.appendChild(this.attrResizeArea);
    d = Entry.createElement("legend");
    d.innerHTML = Lang.Workspace.picture_size;
    this.attrResizeArea.appendChild(d);
    d = Entry.createElement("div", "painterAttrWrapper");
    d.addClass("painterAttrWrapper");
    this.attrResizeArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrResizeX");
    d.appendChild(c);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrResizeXTop");
    e.innerHTML = "X";
    c.appendChild(e);
    this.objectWidthInput = Entry.createElement("input", "entryPainterAttrWidth");
    this.objectWidthInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.width = this.value;
      a.updateImageHandle();
    };
    this.objectWidthInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectWidthInput);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterSizeText");
    c.innerHTML = "x";
    d.appendChild(c);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundAttrReiszeY");
    d.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeYTop");
    d.innerHTML = "Y";
    c.appendChild(d);
    this.objectHeightInput = Entry.createElement("input", "entryPainterAttrHeight");
    this.objectHeightInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.height = this.value;
      a.updateImageHandle();
    };
    this.objectHeightInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectHeightInput);
    this.attrRotateArea = Entry.createElement("div", "painterAttrRotateArea");
    this.attrRotateArea.addClass("painterAttrRotateArea");
    g.appendChild(this.attrRotateArea);
    d = Entry.createElement("div");
    d.addClass("painterAttrRotateName");
    d.innerHTML = Lang.Workspace.picture_rotation;
    this.attrRotateArea.appendChild(d);
    d = Entry.createElement("fieldset", "entryPainterAttrRotate");
    d.addClass("entryPlaygroundPainterAttrRotate");
    this.attrRotateArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("painterAttrRotateTop");
    c.innerHTML = "\u03bf";
    d.appendChild(c);
    this.objectRotateInput = Entry.createElement("input", "entryPainterAttrDegree");
    this.objectRotateInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      360 <= this.value ? this.value %= 360 : 0 > this.value && (this.value = 360 + this.value % 360);
      a.handle.rotation = this.value;
      a.updateImageHandle();
    };
    this.objectRotateInput.addClass("entryPlaygroundPainterNumberInput");
    this.objectRotateInput.defaultValue = "0";
    d.appendChild(this.objectRotateInput);
    this.attrColorArea = Entry.createElement("fieldset", "entryPainterAttrColor");
    this.attrColorArea.addClass("entryPlaygroundPainterAttrColor");
    g.appendChild(this.attrColorArea);
    var n = Entry.createElement("div");
    n.addClass("entryPlaygroundPainterAttrColorContainer");
    this.attrColorArea.appendChild(n);
    this.attrCircleArea = Entry.createElement("div");
    this.attrCircleArea.addClass("painterAttrCircleArea");
    g.appendChild(this.attrCircleArea);
    d = Entry.createElement("div", "entryPainterAttrCircle");
    d.addClass("painterAttrCircle");
    this.attrCircleArea.appendChild(d);
    this.attrCircleArea.painterAttrCircle = d;
    d = Entry.createElement("input", "entryPainterAttrCircleInput");
    d.value = "#000000";
    d.addClass("painterAttrCircleInput");
    this.attrCircleArea.appendChild(d);
    this.attrColorSpoid = Entry.createElement("div");
    this.attrColorSpoid.bindOnClick(function() {
      a.selectToolbox("spoid");
    });
    this.attrColorSpoid.addClass("painterAttrColorSpoid");
    g.appendChild(this.attrColorSpoid);
    Entry.getColourCodes().forEach(function(b) {
      var c = Entry.createElement("div");
      c.addClass("entryPlaygroundPainterAttrColorElement");
      "transparent" === b ? c.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/transparent.png") + ")" : c.style.backgroundColor = b;
      c.bindOnClick(function(c) {
        "transparent" === b ? (a.stroke.transparent = !0, a.stroke.lineColor = "#ffffff") : (a.stroke.transparent = !1, r && (document.getElementById("entryPainterShapeBackgroundColor").style.backgroundColor = b, a.stroke.fillColor = b), r || (document.getElementById("entryPainterShapeLineColor").style.backgroundColor = b, a.stroke.lineColor = b));
        document.getElementById("entryPainterAttrCircle").style.backgroundColor = a.stroke.lineColor;
        document.getElementById("entryPainterAttrCircleInput").value = b;
      });
      n.appendChild(c);
    });
    this.attrThickArea = Entry.createElement("div", "painterAttrThickArea");
    this.attrThickArea.addClass("entryPlaygroundentryPlaygroundPainterAttrThickArea");
    g.appendChild(this.attrThickArea);
    d = Entry.createElement("legend");
    d.addClass("painterAttrThickName");
    d.innerHTML = Lang.Workspace.thickness;
    this.attrThickArea.appendChild(d);
    var m = Entry.createElement("fieldset", "entryPainterAttrThick");
    m.addClass("entryPlaygroundPainterAttrThick");
    this.attrThickArea.appendChild(m);
    d = Entry.createElement("div");
    d.addClass("paintAttrThickTop");
    m.appendChild(d);
    e = Entry.createElement("select", "entryPainterAttrThick");
    e.addClass("entryPlaygroundPainterAttrThickInput");
    e.size = "1";
    e.onchange = function(b) {
      a.stroke.thickness = b.target.value;
    };
    for (d = 1;10 >= d;d++) {
      c = Entry.createElement("option"), c.value = d, c.innerHTML = d, e.appendChild(c);
    }
    m.appendChild(e);
    d = Entry.createElement("div", "entryPainterShapeLineColor");
    d.addClass("painterAttrShapeLineColor");
    c = Entry.createElement("div", "entryPainterShapeInnerBackground");
    c.addClass("painterAttrShapeInnerBackground");
    d.appendChild(c);
    m.appendChild(d);
    this.attrThickArea.painterAttrShapeLineColor = d;
    m.bindOnClick(function() {
      q.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !1;
    });
    this.attrBackgroundArea = Entry.createElement("div", "painterAttrBackgroundArea");
    this.attrBackgroundArea.addClass("entryPlaygroundPainterBackgroundArea");
    g.appendChild(this.attrBackgroundArea);
    d = Entry.createElement("fieldset", "entryPainterAttrbackground");
    d.addClass("entryPlaygroundPainterAttrBackground");
    this.attrBackgroundArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("paintAttrBackgroundTop");
    d.appendChild(c);
    var q = Entry.createElement("div", "entryPainterShapeBackgroundColor");
    q.addClass("painterAttrShapeBackgroundColor");
    this.attrBackgroundArea.painterAttrShapeBackgroundColor = q;
    c.appendChild(q);
    var r = !1;
    q.bindOnClick(function(a) {
      m.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !0;
    });
    this.attrFontArea = Entry.createElement("div", "painterAttrFont");
    this.attrFontArea.addClass("entryPlaygroundPainterAttrFont");
    g.appendChild(this.attrFontArea);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrTop");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPaintAttrTop_");
    e.appendChild(d);
    d = Entry.createElement("legend");
    d.addClass("panterAttrFontTitle");
    d.innerHTML = Lang.Workspace.textStyle;
    k = Entry.createElement("select", "entryPainterAttrFontName");
    k.addClass("entryPlaygroundPainterAttrFontName");
    k.size = "1";
    k.onchange = function(b) {
      a.font.name = b.target.value;
    };
    for (d = 0;d < Entry.fonts.length;d++) {
      h = Entry.fonts[d], c = Entry.createElement("option"), c.value = h.family, c.innerHTML = h.name, k.appendChild(c);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("painterAttrFontSizeArea");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("painterAttrFontSizeTop");
    e.appendChild(d);
    k = Entry.createElement("select", "entryPainterAttrFontSize");
    k.addClass("entryPlaygroundPainterAttrFontSize");
    k.size = "1";
    k.onchange = function(b) {
      a.font.size = b.target.value;
    };
    for (d = 20;72 >= d;d++) {
      c = Entry.createElement("option"), c.value = d, c.innerHTML = d, k.appendChild(c);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrFontStyleArea");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrFontTop");
    e.appendChild(d);
    k = Entry.createElement("select", "entryPainterAttrFontStyle");
    k.addClass("entryPlaygroundPainterAttrFontStyle");
    k.size = "1";
    k.onchange = function(b) {
      a.font.style = b.target.value;
    };
    h = [{label:"\ubcf4\ud1b5", value:"normal"}, {label:"\uad75\uac8c", value:"bold"}, {label:"\uae30\uc6b8\uc784", value:"italic"}];
    for (d = 0;d < h.length;d++) {
      l = h[d], c = Entry.createElement("option"), c.value = l.value, c.innerHTML = l.label, k.appendChild(c);
    }
    e.appendChild(k);
    this.attrLineArea = Entry.createElement("div", "painterAttrLineStyle");
    this.attrLineArea.addClass("entryPlaygroundPainterAttrLineStyle");
    g.appendChild(this.attrLineArea);
    var t = Entry.createElement("div");
    t.addClass("entryPlaygroundPainterAttrLineStyleLine");
    this.attrLineArea.appendChild(t);
    var u = Entry.createElement("div");
    u.addClass("entryPlaygroundPaitnerAttrLineArea");
    this.attrLineArea.appendChild(u);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrLineStyleLine1");
    u.appendChild(d);
    d.value = "line";
    var v = Entry.createElement("div");
    v.addClass("painterAttrLineStyleBackgroundLine");
    t.bindOnClick(function(a) {
      u.removeClass("entryRemove");
    });
    u.blur = function(a) {
      this.addClass("entryRemove");
    };
    u.onmouseleave = function(a) {
      this.addClass("entryRemove");
    };
    d.bindOnClick(function(a) {
      this.attrLineArea.removeClass(t);
      this.attrLineArea.appendChild(v);
      this.attrLineArea.onchange(a);
      u.blur();
    });
    v.bindOnClick(function(a) {
      u.removeClass("entryRemove");
    });
    this.attrLineArea.onchange = function(b) {
      a.stroke.style = b.target.value;
    };
    u.blur();
  }
};
Entry.Painter.prototype.restoreHandle = function() {
  this.selectedObject && !1 === this.handle.visible && (this.handle.visible = !0, this.stage.update());
};
Entry.Painter.prototype.initDisplay = function() {
  this.stroke.enabled = !1;
  this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
  this.toolboxCursor.removeClass("entryToolboxCursorClicked");
  this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
  this.toolboxSelect.removeClass("entryToolboxSelectClicked");
  this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
  this.toolboxPen.removeClass("entryToolboxPenClicked");
  this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
  this.toolboxLine.removeClass("entryToolboxLineClicked");
  this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
  this.toolboxRect.removeClass("entryToolboxRectClicked");
  this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
  this.toolboxCircle.removeClass("entryToolBoxCircleClicked");
  this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
  this.toolboxText.removeClass("entryToolBoxTextClicked");
  this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
  this.toolboxFill.removeClass("entryToolBoxFillClicked");
  this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
  this.toolboxErase.removeClass("entryToolBoxEraseClicked");
  this.attrColorSpoid.addClass("painterAttrColorSpoid");
  this.attrColorSpoid.removeClass("painterAttrColorSpoidClicked");
  this.attrResizeArea.addClass("entryRemove");
  this.attrRotateArea.addClass("entryRemove");
  this.attrThickArea.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrLineArea.addClass("entryRemove");
  this.attrColorArea.addClass("entryRemove");
  this.attrCircleArea.addClass("entryRemove");
  this.attrColorSpoid.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrBackgroundArea.addClass("entryRemove");
  this.flipObject.addClass("entryRemove");
  this.attrThickArea.painterAttrShapeLineColor.addClass("entryRemove");
  this.attrBackgroundArea.painterAttrShapeBackgroundColor.addClass("entryRemove");
  this.attrCircleArea.painterAttrCircle.addClass("entryRemove");
  this.inputField && !this.inputField._isHidden && (this.inputField.hide(), this.stage.update());
};
Entry.Painter.prototype.selectToolbox = function(b) {
  this.toolbox.selected = b;
  "erase" != b && $(".entryPlaygroundPainterContainer").removeClass("dd");
  this.initDisplay();
  "cursor" !== b && this.clearHandle();
  "text" !== b && this.inputField && delete this.inputField;
  switch(b) {
    case "cursor":
      this.restoreHandle();
      this.toolboxCursor.addClass("entryToolboxCursorClicked");
      this.attrResizeArea.removeClass("entryRemove");
      this.attrRotateArea.removeClass("entryRemove");
      this.flipObject.removeClass("entryRemove");
      break;
    case "select":
      this.toolboxSelect.addClass("entryToolboxSelectClicked");
      break;
    case "pen":
      this.toolboxPen.addClass("entryToolboxPenClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "line":
      this.toolboxLine.addClass("entryToolboxLineClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "rect":
      this.toolboxRect.addClass("entryToolboxRectClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "circle":
      this.toolboxCircle.addClass("entryToolBoxCircleClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "text":
      this.toolboxText.addClass("entryToolBoxTextClicked");
      this.attrFontArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "fill":
      this.toolboxFill.addClass("entryToolBoxFillClicked");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "erase":
      $(".entryPlaygroundPainterContainer").addClass("dd");
      this.toolboxErase.addClass("entryToolBoxEraseClicked");
      this.attrThickArea.removeClass("entryRemove");
      break;
    case "spoid":
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("painterAttrColorSpoid");
      this.attrColorSpoid.addClass("painterAttrColorSpoidClicked");
      break;
    case "coordinate":
      this.toggleCoordinator();
  }
};
Entry.BlockParser = function(b) {
  this.syntax = b;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(b) {
  b.Code = function(a) {
    if (a instanceof Entry.Thread) {
      return this.Thread(a);
    }
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getThreads();
    for (var d = 0;d < a.length;d++) {
      b += this.Thread(a[d]);
    }
    return b;
  };
  b.Thread = function(a) {
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getBlocks();
    for (var d = 0;d < a.length;d++) {
      b += this.Block(a[d]);
    }
    return b;
  };
  b.Block = function(a) {
    var b = a._schema.syntax;
    return b ? this[b[0]](a) : "";
  };
  b.Program = function(a) {
    return "";
  };
  b.Scope = function(a) {
    a = a._schema.syntax.concat();
    return a.splice(1, a.length - 1).join(".") + "();\n";
  };
  b.BasicFunction = function(a) {
    a = this.Thread(a.statements[0]);
    return "function promise() {\n" + this.indent(a) + "}\n";
  };
  b.BasicIteration = function(a) {
    var b = a.params[0], d = this.publishIterateVariable();
    a = this.Thread(a.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + d + " = 0; " + d + " < " + b + "; " + d + "++){\n" + this.indent(a) + "}\n";
  };
  b.BasicIf = function(a) {
    var b = this.Thread(a.statements[0]);
    return "if (" + a._schema.syntax.concat()[1] + ") {\n" + this.indent(b) + "}\n";
  };
  b.BasicWhile = function(a) {
    var b = this.Thread(a.statements[0]);
    return "while (" + a._schema.syntax.concat()[1] + ") {\n" + this.indent(b) + "}\n";
  };
  b.indent = function(a) {
    var b = "    ";
    a = a.split("\n");
    a.pop();
    return b += a.join("\n    ") + "\n";
  };
  b.publishIterateVariable = function() {
    var a = "", b = this._iterVariableCount;
    do {
      a = this._iterVariableChunk[b % 3] + a, b = parseInt(b / 3) - 1, 0 === b && (a = this._iterVariableChunk[0] + a);
    } while (0 < b);
    this._iterVariableCount++;
    return a;
  };
  b.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
})(Entry.BlockParser.prototype);
Entry.JSParser = function(b) {
  this.syntax = b;
  this.scopeChain = [];
  this.scope = null;
};
(function(b) {
  b.Program = function(a) {
    var b = [], d = [];
    d.push({type:this.syntax.Program});
    var e = this.initScope(a), d = d.concat(this.BlockStatement(a));
    this.unloadScope();
    b.push(d);
    return b = b.concat(e);
  };
  b.Identifier = function(a, b) {
    return b ? b[a.name] : this.scope[a.name];
  };
  b.ExpressionStatement = function(a) {
    a = a.expression;
    return this[a.type](a);
  };
  b.ForStatement = function(a) {
    var b = a.init, d = a.test, e = a.update, f = a.body;
    if (this.syntax.ForStatement) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    var f = this[f.type](f), b = b.declarations[0].init.value, g = d.operator, d = d.right.value, h = 0;
    "++" != e.operator && (e = b, b = d, d = e);
    switch(g) {
      case "<":
        h = d - b;
        break;
      case "<=":
        h = d + 1 - b;
        break;
      case ">":
        h = b - d;
        break;
      case ">=":
        h = b + 1 - d;
    }
    return this.BasicIteration(a, h, f);
  };
  b.BlockStatement = function(a) {
    var b = [];
    a = a.body;
    for (var d = 0;d < a.length;d++) {
      var e = a[d], f = this[e.type](e);
      if (f) {
        if (void 0 === f.type) {
          throw {message:"\ud574\ub2f9\ud558\ub294 \ube14\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.", node:e};
        }
        f && b.push(f);
      }
    }
    return b;
  };
  b.EmptyStatement = function(a) {
    throw {message:"empty\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.DebuggerStatement = function(a) {
    throw {message:"debugger\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WithStatement = function(a) {
    throw {message:"with\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ReturnStaement = function(a) {
    throw {message:"return\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.LabeledStatement = function(a) {
    throw {message:"label\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.BreakStatement = function(a) {
    throw {message:"break\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ContinueStatement = function(a) {
    throw {message:"continue\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.IfStatement = function(a) {
    if (this.syntax.IfStatement) {
      throw {message:"if\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return this.BasicIf(a);
  };
  b.SwitchStatement = function(a) {
    throw {message:"switch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SwitchCase = function(a) {
    throw {message:"switch ~ case\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThrowStatement = function(a) {
    throw {message:"throw\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.TryStatement = function(a) {
    throw {message:"try\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CatchClause = function(a) {
    throw {message:"catch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WhileStatement = function(a) {
    var b = a.body, d = this.syntax.WhileStatement, b = this[b.type](b);
    if (d) {
      throw {message:"while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return this.BasicWhile(a, b);
  };
  b.DoWhileStatement = function(a) {
    throw {message:"do ~ while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ForInStatement = function(a) {
    throw {message:"for ~ in\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionDeclaration = function(a) {
    if (this.syntax.FunctionDeclaration) {
      throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return null;
  };
  b.VariableDeclaration = function(a) {
    throw {message:"var\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThisExpression = function(a) {
    return this.scope.this;
  };
  b.ArrayExpression = function(a) {
    throw {message:"array\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ObjectExpression = function(a) {
    throw {message:"object\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.Property = function(a) {
    throw {message:"init, get, set\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionExpression = function(a) {
    throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryOperator = function() {
    return "- + ! ~ typeof void delete".split(" ");
  };
  b.updateOperator = function() {
    return ["++", "--"];
  };
  b.BinaryOperator = function() {
    return "== != === !== < <= > >= << >> >>> + - * / % , ^ & in instanceof".split(" ");
  };
  b.AssignmentExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.AssignmentOperator = function() {
    return "= += -= *= /= %= <<= >>= >>>= ,= ^= &=".split(" ");
  };
  b.LogicalExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.LogicalOperator = function() {
    return ["||", "&&"];
  };
  b.MemberExpression = function(a) {
    var b = a.object, d = a.property;
    console.log(b.type);
    b = this[b.type](b);
    console.log(b);
    d = this[d.type](d, b);
    if (Object(b) !== b || Object.getPrototypeOf(b) !== Object.prototype) {
      throw {message:b + "\uc740(\ub294) \uc798\ubabb\ub41c \uba64\ubc84 \ubcc0\uc218\uc785\ub2c8\ub2e4.", node:a};
    }
    b = d;
    if (!b) {
      throw {message:d + "\uc774(\uac00) \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.", node:a};
    }
    return b;
  };
  b.ConditionalExpression = function(a) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UpdateExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CallExpression = function(a) {
    a = a.callee;
    return {type:this[a.type](a)};
  };
  b.NewExpression = function(a) {
    throw {message:"new\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SequenceExpression = function(a) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.initScope = function(a) {
    if (null === this.scope) {
      var b = function() {
      };
      b.prototype = this.syntax.Scope;
    } else {
      b = function() {
      }, b.prototype = this.scope;
    }
    this.scope = new b;
    this.scopeChain.push(this.scope);
    return this.scanDefinition(a);
  };
  b.unloadScope = function() {
    this.scopeChain.pop();
    this.scope = this.scopeChain.length ? this.scopeChain[this.scopeChain.length - 1] : null;
  };
  b.scanDefinition = function(a) {
    a = a.body;
    for (var b = [], d = 0;d < a.length;d++) {
      var e = a[d];
      "FunctionDeclaration" === e.type && (this.scope[e.id.name] = this.scope.promise, this.syntax.BasicFunction && (e = e.body, b.push([{type:this.syntax.BasicFunction, statements:[this[e.type](e)]}])));
    }
    return b;
  };
  b.BasicFunction = function(a, b) {
    return null;
  };
  b.BasicIteration = function(a, b, d) {
    var e = this.syntax.BasicIteration;
    if (!e) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return {params:[b], type:e, statements:[d]};
  };
  b.BasicWhile = function(a, b) {
    var d = a.test.raw;
    if (this.syntax.BasicWhile[d]) {
      return {type:this.syntax.BasicWhile[d], statements:[b]};
    }
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
  };
  b.BasicIf = function(a) {
    var b = a.consequent, b = this[b.type](b);
    try {
      var d = "", e = "===" === a.test.operator ? "==" : a.test.operator;
      if ("Identifier" === a.test.left.type && "Literal" === a.test.right.type) {
        d = a.test.left.name + " " + e + " " + a.test.right.raw;
      } else {
        if ("Literal" === a.test.left.type && "Identifier" === a.test.right.type) {
          d = a.test.right.name + " " + e + " " + a.test.left.raw;
        } else {
          throw Error();
        }
      }
      if (this.syntax.BasicIf[d]) {
        return Array.isArray(b) || "object" !== typeof b || (b = [b]), {type:this.syntax.BasicIf[d], statements:[b]};
      }
      throw Error();
    } catch (f) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
    }
  };
})(Entry.JSParser.prototype);
Entry.Parser = function(b, a, c) {
  this._mode = b;
  this.syntax = {};
  this.codeMirror = c;
  this._lang = a || "js";
  this.availableCode = [];
  "maze" === b && (this._stageId = +Ntry.configManager.getConfig("stageId"), "object" == typeof NtryData && this.setAvailableCode(NtryData.config[this._stageId].availableCode, NtryData.player[this._stageId].code));
  this.mappingSyntax(b);
  switch(this._lang) {
    case "js":
      this._parser = new Entry.JSParser(this.syntax);
      a = this.syntax;
      var d = {}, e;
      for (e in a.Scope) {
        d[e + "();\n"] = a.Scope[e];
      }
      "BasicIf" in a && (d.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(a) {
        CodeMirror.showHint(a, null, {globalScope:d});
      };
      c.on("keyup", function(a, b) {
        !a.state.completionActive && 65 <= b.keyCode && 95 >= b.keyCode && CodeMirror.showHint(a, null, {completeSingle:!1, globalScope:d});
      });
      break;
    case "block":
      this._parser = new Entry.BlockParser(this.syntax);
  }
};
(function(b) {
  b.parse = function(a) {
    var b = null;
    switch(this._lang) {
      case "js":
        try {
          var d = acorn.parse(a), b = this._parser.Program(d);
        } catch (e) {
          this.codeMirror && (e instanceof SyntaxError ? (a = {from:{line:e.loc.line - 1, ch:e.loc.column - 2}, to:{line:e.loc.line - 1, ch:e.loc.column + 1}}, e.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (a = this.getLineNumber(e.node.start, e.node.end), a.message = e.message, a.severity = "error", this.codeMirror.markText(a.from, a.to, {className:"CodeMirror-lint-mark-error", __annotation:a, clearOnEnter:!0})), Entry.toast.alert("Error", e.message)), b = [];
        }
        break;
      case "block":
        a = this._parser.Code(a).match(/(.*{.*[\S|\s]+?}|.+)/g), b = Array.isArray(a) ? a.reduce(function(a, b, c) {
          var d = "";
          1 === c && (a += "\n");
          d = -1 < b.indexOf("function") ? b + a : a + b;
          return d + "\n";
        }) : "";
    }
    return b;
  };
  b.getLineNumber = function(a, b) {
    var d = this.codeMirror.getValue(), e = {from:{}, to:{}}, f = d.substring(0, a).split(/\n/gi);
    e.from.line = f.length - 1;
    e.from.ch = f[f.length - 1].length;
    d = d.substring(0, b).split(/\n/gi);
    e.to.line = d.length - 1;
    e.to.ch = d[d.length - 1].length;
    return e;
  };
  b.mappingSyntax = function(a) {
    for (var b = Object.keys(Entry.block), d = 0;d < b.length;d++) {
      var e = b[d], f = Entry.block[e];
      if (f.mode === a && -1 < this.availableCode.indexOf(e) && (f = f.syntax)) {
        for (var g = this.syntax, h = 0;h < f.length;h++) {
          var k = f[h];
          if (h === f.length - 2 && "function" === typeof f[h + 1]) {
            g[k] = f[h + 1];
            break;
          }
          g[k] || (g[k] = {});
          h === f.length - 1 ? g[k] = e : g = g[k];
        }
      }
    }
  };
  b.setAvailableCode = function(a, b) {
    var d = [];
    a.forEach(function(a, b) {
      a.forEach(function(a, b) {
        d.push(a.type);
      });
    });
    b instanceof Entry.Code ? b.getBlockList().forEach(function(a) {
      a.type !== NtryData.START && -1 === d.indexOf(a.type) && d.push(a.type);
    }) : b.forEach(function(a, b) {
      a.forEach(function(a, b) {
        a.type !== NtryData.START && -1 === d.indexOf(a.type) && d.push(a.type);
      });
    });
    this.availableCode = this.availableCode.concat(d);
  };
})(Entry.Parser.prototype);
Entry.Pdf = function(b) {
  this.generateView(b);
};
p = Entry.Pdf.prototype;
p.generateView = function(b) {
  var a = Entry.createElement("div", "entryPdfWorkspace");
  a.addClass("entryRemove");
  this._view = a;
  var c = "/pdfjs/web/viewer.html";
  b && "" != b && (c += "?file=" + b);
  pdfViewIframe = Entry.createElement("iframe", "entryPdfIframeWorkspace");
  pdfViewIframe.setAttribute("id", "pdfViewIframe");
  pdfViewIframe.setAttribute("frameborder", 0);
  pdfViewIframe.setAttribute("src", c);
  a.appendChild(pdfViewIframe);
};
p.getView = function() {
  return this._view;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("pdfViewIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.Popup = function() {
  Entry.assert(!window.popup, "Popup exist");
  this.body_ = Entry.createElement("div");
  this.body_.addClass("entryPopup");
  this.body_.bindOnClick(function(b) {
    b.target == this && this.popup.remove();
  });
  this.body_.popup = this;
  document.body.appendChild(this.body_);
  this.window_ = Entry.createElement("div");
  this.window_.addClass("entryPopupWindow");
  "tablet" === Entry.device && this.window_.addClass("tablet");
  this.window_.bindOnClick(function() {
  });
  Entry.addEventListener("windowResized", this.resize);
  window.popup = this;
  this.resize();
  this.body_.appendChild(this.window_);
};
Entry.Popup.prototype.remove = function() {
  for (;this.window_.hasChildNodes();) {
    "workspace" == Entry.type ? Entry.view_.insertBefore(this.window_.firstChild, Entry.container.view_) : Entry.view_.insertBefore(this.window_.lastChild, Entry.view_.firstChild);
  }
  $("body").css("overflow", "auto");
  Entry.removeElement(this.body_);
  window.popup = null;
  Entry.removeEventListener("windowResized", this.resize);
  Entry.engine.popup = null;
};
Entry.Popup.prototype.resize = function(b) {
  b = window.popup.window_;
  var a = .9 * window.innerWidth, c = .9 * window.innerHeight - 35;
  9 * a <= 16 * c ? c = a / 16 * 9 : a = 16 * c / 9;
  b.style.width = String(a) + "px";
  b.style.height = String(c + 35) + "px";
};
Entry.popupHelper = function(b) {
  this.popupList = {};
  this.nowContent;
  b && (window.popupHelper = null);
  Entry.assert(!window.popupHelper, "Popup exist");
  var a = ["confirm", "spinner"], c = ["entryPopupHelperTopSpan", "entryPopupHelperBottomSpan", "entryPopupHelperLeftSpan", "entryPopupHelperRightSpan"];
  this.body_ = Entry.Dom("div", {classes:["entryPopup", "hiddenPopup", "popupHelper"]});
  var d = this;
  this.body_.bindOnClick(function(b) {
    if (!(d.nowContent && -1 < a.indexOf(d.nowContent.prop("type")))) {
      var f = $(b.target);
      c.forEach(function(a) {
        f.hasClass(a) && this.popup.hide();
      }.bind(this));
      b.target == this && this.popup.hide();
    }
  });
  this.body_.bind("touchstart", function(b) {
    if (!(d.nowContent && -1 < a.indexOf(d.nowContent.prop("type")))) {
      var f = $(b.target);
      c.forEach(function(a) {
        f.hasClass(a) && this.popup.hide();
      }.bind(this));
      b.target == this && this.popup.hide();
    }
  });
  window.popupHelper = this;
  this.body_.prop("popup", this);
  Entry.Dom("div", {class:"entryPopupHelperTopSpan", parent:this.body_});
  b = Entry.Dom("div", {class:"entryPopupHelperMiddleSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperBottomSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperLeftSpan", parent:b});
  this.window_ = Entry.Dom("div", {class:"entryPopupHelperWindow", parent:b});
  Entry.Dom("div", {class:"entryPopupHelperRightSpan", parent:b});
  $("body").append(this.body_);
};
Entry.popupHelper.prototype.clearPopup = function() {
  for (var b = this.popupWrapper_.children.length - 1;2 < b;b--) {
    this.popupWrapper_.removeChild(this.popupWrapper_.children[b]);
  }
};
Entry.popupHelper.prototype.addPopup = function(b, a) {
  var c = Entry.Dom("div"), d = Entry.Dom("div", {class:"entryPopupHelperCloseButton"});
  d.bindOnClick(function() {
    a.closeEvent ? a.closeEvent(this) : this.hide();
  }.bind(this));
  var e = this;
  d.bind("touchstart", function() {
    a.closeEvent ? a.closeEvent(e) : e.hide();
  });
  var f = Entry.Dom("div", {class:"entryPopupHelperWrapper"});
  f.append(d);
  a.title && (d = Entry.Dom("div", {class:"entryPopupHelperTitle"}), f.append(d), d.text(a.title));
  c.addClass(b);
  c.append(f);
  c.popupWrapper_ = f;
  c.prop("type", a.type);
  "function" === typeof a.setPopupLayout && a.setPopupLayout(c);
  this.popupList[b] = c;
};
Entry.popupHelper.prototype.hasPopup = function(b) {
  return !!this.popupList[b];
};
Entry.popupHelper.prototype.setPopup = function(b) {
};
Entry.popupHelper.prototype.remove = function(b) {
  0 < this.window_.children().length && this.window_.children().remove();
  this.window_.remove();
  delete this.popupList[b];
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.popupHelper.prototype.resize = function(b) {
};
Entry.popupHelper.prototype.show = function(b) {
  0 < this.window_.children().length && this.window_.children().detach();
  this.window_.append(this.popupList[b]);
  this.nowContent = this.popupList[b];
  this.body_.removeClass("hiddenPopup");
};
Entry.popupHelper.prototype.hide = function() {
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.getStartProject = function(b) {
  return {category:"\uae30\ud0c0", scenes:[{name:"\uc7a5\uba74 1", id:"7dwq"}], variables:[{name:"\ucd08\uc2dc\uacc4", id:"brih", visible:!1, value:"0", variableType:"timer", x:150, y:-70, array:[], object:null, isCloud:!1}, {name:"\ub300\ub2f5", id:"1vu8", visible:!1, value:"0", variableType:"answer", x:150, y:-100, array:[], object:null, isCloud:!1}], objects:[{id:"7y0y", name:"\uc5d4\ud2b8\ub9ac\ubd07", script:[[{type:"when_run_button_click", x:40, y:50}, {type:"repeat_basic", statements:[[{type:"move_direction"}]]}]], 
  selectedPictureId:"vx80", objectType:"sprite", rotateMethod:"free", scene:"7dwq", sprite:{sounds:[{duration:1.3, ext:".mp3", id:"8el5", fileurl:b + "media/bark.mp3", name:"\uac15\uc544\uc9c0 \uc9d6\ub294\uc18c\ub9ac"}], pictures:[{id:"vx80", fileurl:b + "media/entrybot1.png", name:Lang.Blocks.walking_entryBot + "1", scale:100, dimension:{width:284, height:350}}, {id:"4t48", fileurl:b + "media/entrybot2.png", name:Lang.Blocks.walking_entryBot + "2", scale:100, dimension:{width:284, height:350}}]}, 
  entity:{x:0, y:0, regX:142, regY:175, scaleX:.3154574132492113, scaleY:.3154574132492113, rotation:0, direction:90, width:284, height:350, visible:!0}, lock:!1, active:!0}], speed:60};
};
Entry.PropertyPanel = function() {
  this.modes = {};
  this.selected = null;
};
(function(b) {
  b.generateView = function(a, b) {
    this._view = Entry.Dom("div", {class:"propertyPanel", parent:$(a)});
    this._tabView = Entry.Dom("div", {class:"propertyTab", parent:this._view});
    this._contentView = Entry.Dom("div", {class:"propertyContent", parent:this._view});
    this._cover = Entry.Dom("div", {classes:["propertyPanelCover", "entryRemove"], parent:this._view});
    var d = Entry.Dom("div", {class:"entryObjectSelectedImgWorkspace", parent:this._view});
    this.initializeSplitter(d);
  };
  b.addMode = function(a, b) {
    var d = b.getView(), d = Entry.Dom(d, {parent:this._contentView}), e = Entry.Dom("<div>" + Lang.Menus[a] + "</div>", {classes:["propertyTabElement", "propertyTab" + a], parent:this._tabView}), f = this;
    e.bind("click", function() {
      f.select(a);
    });
    this.modes[a] && (this.modes[a].tabDom.remove(), this.modes[a].contentDom.remove(), "hw" == a && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    this.modes[a] = {obj:b, tabDom:e, contentDom:d};
    "hw" == a && $(".propertyTabhw").bind("dblclick", function() {
      Entry.dispatchEvent("hwModeChange");
    });
  };
  b.resize = function(a) {
    this._view.css({width:a + "px", top:9 * a / 16 + 123 - 22 + "px"});
    430 <= a ? this._view.removeClass("collapsed") : this._view.addClass("collapsed");
    Entry.dispatchEvent("windowResized");
    a = this.selected;
    "hw" == a ? this.modes.hw.obj.listPorts ? this.modes[a].obj.resizeList() : this.modes[a].obj.resize() : this.modes[a].obj.resize();
  };
  b.select = function(a) {
    for (var b in this.modes) {
      var d = this.modes[b];
      d.tabDom.removeClass("selected");
      d.contentDom.addClass("entryRemove");
      d.obj.visible = !1;
    }
    b = this.modes[a];
    b.tabDom.addClass("selected");
    b.contentDom.removeClass("entryRemove");
    b.obj.resize && b.obj.resize();
    b.obj.visible = !0;
    this.selected = a;
  };
  b.initializeSplitter = function(a) {
    var b = this;
    a.bind("mousedown touchstart", function(a) {
      b._cover.removeClass("entryRemove");
      Entry.container.disableSort();
      Entry.container.splitterEnable = !0;
      Entry.documentMousemove && (Entry.container.resizeEvent = Entry.documentMousemove.attach(this, function(a) {
        Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.clientX || a.x});
      }));
    });
    $(document).bind("mouseup touchend", function(a) {
      if (a = Entry.container.resizeEvent) {
        Entry.container.splitterEnable = !1, Entry.documentMousemove.detach(a), b._cover.addClass("entryRemove"), delete Entry.container.resizeEvent;
      }
      Entry.container.enableSort();
    });
  };
})(Entry.PropertyPanel.prototype);
Entry.init = function(b, a) {
  Entry.assert("object" === typeof a, "Init option is not object");
  this.events_ = {};
  this.interfaceState = {menuWidth:264};
  Entry.Utils.bindGlobalEvent("resize mousedown mousemove keydown keyup dispose".split(" "));
  this.options = a;
  this.parseOptions(a);
  this.mediaFilePath = (a.libDir ? a.libDir : "/lib") + "/entryjs/images/";
  this.defaultPath = a.defaultDir || "";
  this.blockInjectPath = a.blockInjectDir || "";
  "workspace" == this.type && this.isPhone() && (this.type = "phone");
  this.initialize_();
  this.view_ = b;
  "tablet" === this.device ? this.view_.setAttribute("class", "entry tablet") : this.view_.setAttribute("class", "entry");
  Entry.initFonts(a.fonts);
  this.createDom(b, this.type);
  this.loadInterfaceState();
  this.overridePrototype();
  this.maxCloneLimit = 302;
  this.cloudSavable = !0;
  this.startTime = (new Date).getTime();
  document.onkeydown = function(a) {
    Entry.dispatchEvent("keyPressed", a);
  };
  document.onkeyup = function(a) {
    Entry.dispatchEvent("keyUpped", a);
  };
  window.onresize = function(a) {
    Entry.dispatchEvent("windowResized", a);
  };
  window.onbeforeunload = this.beforeUnload;
  Entry.addEventListener("saveWorkspace", function(a) {
    Entry.addActivity("save");
  });
  "IE" != Entry.getBrowserType().substr(0, 2) || window.flashaudio ? createjs.Sound.registerPlugins([createjs.WebAudioPlugin]) : (createjs.FlashAudioPlugin.swfPath = this.mediaFilePath + "media/", createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]), window.flashaudio = !0);
  Entry.soundQueue = new createjs.LoadQueue;
  Entry.soundQueue.installPlugin(createjs.Sound);
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/click.mp3", Entry.mediaFilePath + "sounds/click.wav", Entry.mediaFilePath + "sounds/click.ogg"], "entryMagneting");
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/delete.mp3", Entry.mediaFilePath + "sounds/delete.ogg", Entry.mediaFilePath + "sounds/delete.wav"], "entryDelete");
  createjs.Sound.stop();
};
Entry.loadAudio_ = function(b, a) {
  if (window.Audio && b.length) {
    for (;0 < b.length;) {
      var c = b[0];
      c.match(/\/([^.]+)./);
      Entry.soundQueue.loadFile({id:a, src:c, type:createjs.LoadQueue.SOUND});
      break;
    }
  }
};
Entry.initialize_ = function() {
  this.stage = new Entry.Stage;
  Entry.engine && Entry.engine.clearTimer();
  this.engine = new Entry.Engine;
  this.propertyPanel = new Entry.PropertyPanel;
  this.container = new Entry.Container;
  this.helper = new Entry.Helper;
  this.youtube = new Entry.Youtube;
  this.variableContainer = new Entry.VariableContainer;
  this.commander = new Entry.Commander(this.type);
  this.scene = new Entry.Scene;
  this.playground = new Entry.Playground;
  this.toast = new Entry.Toast;
  this.hw && this.hw.closeConnection();
  this.hw = new Entry.HW;
  if (Entry.enableActivityLogging) {
    this.reporter = new Entry.Reporter(!1);
  } else {
    if ("workspace" == this.type || "phone" == this.type) {
      this.reporter = new Entry.Reporter(!0);
    }
  }
};
Entry.createDom = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (c = Entry.createElement("canvas"), c.className = "entryCanvasWorkspace", c.id = "entryCanvas", c.width = 640, c.height = 360, d = Entry.createElement("div", "entryCanvasWrapper"), d.appendChild(c), b.appendChild(d), this.canvas_ = c, this.stage.initStage(this.canvas_), d = Entry.createElement("div"), b.appendChild(d), this.engineView = d, this.engine.generateView(this.engineView, a)) : "phone" == a && (this.stateManagerView = c = Entry.createElement("div"), this.stateManager.generateView(this.stateManagerView, 
    a), d = Entry.createElement("div"), b.appendChild(d), this.engineView = d, this.engine.generateView(this.engineView, a), c = Entry.createElement("canvas"), c.addClass("entryCanvasPhone"), c.id = "entryCanvas", c.width = 640, c.height = 360, d.insertBefore(c, this.engine.footerView_), this.canvas_ = c, this.stage.initStage(this.canvas_), c = Entry.createElement("div"), b.appendChild(c), this.containerView = c, this.container.generateView(this.containerView, a), c = Entry.createElement("div"), 
    b.appendChild(c), this.playgroundView = c, this.playground.generateView(this.playgroundView, a));
  } else {
    Entry.documentMousedown.attach(this, this.cancelObjectEdit);
    var c = Entry.createElement("div");
    b.appendChild(c);
    this.sceneView = c;
    this.scene.generateView(this.sceneView, a);
    c = Entry.createElement("div");
    this.sceneView.appendChild(c);
    this.stateManagerView = c;
    this.stateManager.generateView(this.stateManagerView, a);
    var d = Entry.createElement("div");
    b.appendChild(d);
    this.engineView = d;
    this.engine.generateView(this.engineView, a);
    c = Entry.createElement("canvas");
    c.addClass("entryCanvasWorkspace");
    c.id = "entryCanvas";
    c.width = 640;
    c.height = 360;
    d.insertBefore(c, this.engine.addButton);
    c.addEventListener("mousewheel", function(a) {
      var b = Entry.variableContainer.getListById(Entry.stage.mouseCoordinate);
      a = 0 < a.wheelDelta ? !0 : !1;
      for (var c = 0;c < b.length;c++) {
        var d = b[c];
        d.scrollButton_.y = a ? 46 <= d.scrollButton_.y ? d.scrollButton_.y - 23 : 23 : d.scrollButton_.y + 23;
        d.updateView();
      }
    });
    this.canvas_ = c;
    this.stage.initStage(this.canvas_);
    c = Entry.createElement("div");
    this.propertyPanel.generateView(b, a);
    this.containerView = c;
    this.container.generateView(this.containerView, a);
    this.propertyPanel.addMode("object", this.container);
    this.helper.generateView(this.containerView, a);
    this.propertyPanel.addMode("helper", this.helper);
    c = Entry.createElement("div");
    b.appendChild(c);
    this.playgroundView = c;
    this.playground.generateView(this.playgroundView, a);
    this.propertyPanel.select("object");
    this.helper.bindWorkspace(this.playground.mainWorkspace);
  }
};
Entry.start = function(b) {
  this.FPS || (this.FPS = 60);
  Entry.assert("number" == typeof this.FPS, "FPS must be number");
  Entry.engine.start(this.FPS);
};
Entry.parseOptions = function(b) {
  this.type = b.type;
  b.device && (this.device = b.device);
  this.projectSaveable = b.projectsaveable;
  void 0 === this.projectSaveable && (this.projectSaveable = !0);
  this.objectAddable = b.objectaddable;
  void 0 === this.objectAddable && (this.objectAddable = !0);
  this.objectEditable = b.objectEditable;
  void 0 === this.objectEditable && (this.objectEditable = !0);
  this.objectEditable || (this.objectAddable = !1);
  this.objectDeletable = b.objectdeletable;
  void 0 === this.objectDeletable && (this.objectDeletable = !0);
  this.soundEditable = b.soundeditable;
  void 0 === this.soundEditable && (this.soundEditable = !0);
  this.pictureEditable = b.pictureeditable;
  void 0 === this.pictureEditable && (this.pictureEditable = !0);
  this.sceneEditable = b.sceneEditable;
  void 0 === this.sceneEditable && (this.sceneEditable = !0);
  this.functionEnable = b.functionEnable;
  void 0 === this.functionEnable && (this.functionEnable = !0);
  this.messageEnable = b.messageEnable;
  void 0 === this.messageEnable && (this.messageEnable = !0);
  this.variableEnable = b.variableEnable;
  void 0 === this.variableEnable && (this.variableEnable = !0);
  this.listEnable = b.listEnable;
  void 0 === this.listEnable && (this.listEnable = !0);
  this.hasVariableManager = b.hasvariablemanager;
  this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable ? void 0 === this.hasVariableManager && (this.hasVariableManager = !0) : this.hasVariableManager = !1;
  this.isForLecture = b.isForLecture;
};
Entry.initFonts = function(b) {
  this.fonts = b;
  b || (this.fonts = []);
};
Entry.Reporter = function(b) {
  this.projectId = this.userId = null;
  this.isRealTime = b;
  this.activities = [];
};
Entry.Reporter.prototype.start = function(b, a, c) {
  this.isRealTime && (-1 < window.location.href.indexOf("localhost") ? this.io = io("localhost:7000") : this.io = io("play04.play-entry.com:7000"), this.io.emit("activity", {message:"start", userId:a, projectId:b, time:c}));
  this.userId = a;
  this.projectId = b;
};
Entry.Reporter.prototype.report = function(b) {
  if (!this.isRealTime || this.io) {
    var a = [], c;
    for (c in b.params) {
      var d = b.params[c];
      "object" !== typeof d ? a.push(d) : d.id && a.push(d.id);
    }
    b = {message:b.message, userId:this.userId, projectId:this.projectId, time:b.time, params:a};
    this.isRealTime ? this.io.emit("activity", b) : this.activities.push(b);
  }
};
Entry.Scene = function() {
  var b = this;
  this.scenes_ = [];
  this.selectedScene = null;
  this.maxCount = 20;
  $(window).on("resize", function(a) {
    b.resize();
  });
};
Entry.Scene.viewBasicWidth = 70;
Entry.Scene.prototype.generateView = function(b, a) {
  var c = this;
  this.view_ = b;
  this.view_.addClass("entryScene");
  if (!a || "workspace" == a) {
    this.view_.addClass("entrySceneWorkspace");
    $(this.view_).on("mousedown", function(a) {
      var b = $(this).offset(), d = $(window), h = a.pageX - b.left + d.scrollLeft();
      a = a.pageY - b.top + d.scrollTop();
      a = 40 - a;
      b = -40 / 55;
      d = $(c.selectedScene.view).find(".entrySceneRemoveButtonCoverWorkspace").offset().left;
      !(h < d || h > d + 55) && a > 40 + b * (h - d) && (h = c.getNextScene()) && (h = $(h.view), $(document).trigger("mouseup"), h.trigger("mousedown"));
    });
    var d = Entry.createElement("ul");
    d.addClass("entrySceneListWorkspace");
    Entry.sceneEditable && $ && $(d).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
      $(b.item[0]).clone(!0);
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), d = b.item.index();
      Entry.scene.moveScene(c, d);
    }, axis:"x", tolerance:"pointer"});
    this.view_.appendChild(d);
    this.listView_ = d;
    Entry.sceneEditable && (d = Entry.createElement("span"), d.addClass("entrySceneElementWorkspace"), d.addClass("entrySceneAddButtonWorkspace"), d.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.scene.addScene();
    }), this.view_.appendChild(d), this.addButton_ = d);
  }
};
Entry.Scene.prototype.generateElement = function(b) {
  var a = this, c = Entry.createElement("li", b.id);
  c.addClass("entrySceneElementWorkspace");
  c.addClass("entrySceneButtonWorkspace");
  c.addClass("minValue");
  $(c).on("mousedown", function(a) {
    Entry.engine.isState("run") ? a.preventDefault() : Entry.scene.selectScene(b);
  });
  var d = Entry.createElement("input");
  d.addClass("entrySceneFieldWorkspace");
  d.value = b.name;
  Entry.sceneEditable || (d.disabled = "disabled");
  var e = Entry.createElement("span");
  e.addClass("entrySceneLeftWorkspace");
  c.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entrySceneInputCover");
  f.style.width = Entry.computeInputWidth(b.name);
  c.appendChild(f);
  b.inputWrapper = f;
  d.onkeyup = function(c) {
    c = c.keyCode;
    Entry.isArrowOrBackspace(c) || (b.name = this.value, f.style.width = Entry.computeInputWidth(b.name), a.resize(), 13 == c && this.blur(), 10 < this.value.length && (this.value = this.value.substring(0, 10), this.blur()));
  };
  d.onblur = function(a) {
    d.value = this.value;
    b.name = this.value;
    f.style.width = Entry.computeInputWidth(b.name);
  };
  f.appendChild(d);
  e = Entry.createElement("span");
  e.addClass("entrySceneRemoveButtonCoverWorkspace");
  c.appendChild(e);
  if (Entry.sceneEditable) {
    var g = Entry.createElement("button");
    g.addClass("entrySceneRemoveButtonWorkspace");
    g.scene = b;
    g.bindOnClick(function(a) {
      a.stopPropagation();
      Entry.engine.isState("run") || confirm(Lang.Workspace.will_you_delete_scene) && Entry.scene.removeScene(this.scene);
    });
    e.appendChild(g);
  }
  Entry.Utils.disableContextmenu(c);
  $(c).on("contextmenu", function() {
    var a = [{text:Lang.Workspace.duplicate_scene, enable:Entry.engine.isState("stop"), callback:function() {
      Entry.scene.cloneScene(b);
    }}];
    Entry.ContextMenu.show(a, "workspace-contextmenu");
  });
  return b.view = c;
};
Entry.Scene.prototype.updateView = function() {
  if (!Entry.type || "workspace" == Entry.type) {
    for (var b = this.listView_, a = $(b).children().length;a < this.getScenes().length;a++) {
      b.appendChild(this.getScenes()[a].view);
    }
    this.addButton_ && (this.getScenes().length < this.maxCount ? this.addButton_.removeClass("entryRemove") : this.addButton_.addClass("entryRemove"));
  }
  this.resize();
};
Entry.Scene.prototype.addScenes = function(b) {
  if ((this.scenes_ = b) && 0 !== b.length) {
    for (var a = 0, c = b.length;a < c;a++) {
      this.generateElement(b[a]);
    }
  } else {
    this.scenes_ = [], this.scenes_.push(this.createScene());
  }
  this.selectScene(this.getScenes()[0]);
  this.updateView();
};
Entry.Scene.prototype.addScene = function(b, a) {
  void 0 === b && (b = this.createScene());
  b.view || this.generateElement(b);
  a || "number" == typeof a ? this.getScenes().splice(a, 0, b) : this.getScenes().push(b);
  Entry.stage.objectContainers.push(Entry.stage.createObjectContainer(b));
  Entry.playground.flushPlayground();
  this.selectScene(b);
  this.updateView();
  return b;
};
Entry.Scene.prototype.removeScene = function(b) {
  if (1 >= this.getScenes().length) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_delete_error, !1);
  } else {
    var a = this.getScenes().indexOf(this.getSceneById(b.id));
    this.getScenes().splice(a, 1);
    for (var a = Entry.container.getSceneObjects(b), c = 0;c < a.length;c++) {
      Entry.container.removeObject(a[c]);
    }
    Entry.stage.removeObjectContainer(b);
    $(b.view).remove();
    this.selectScene();
  }
};
Entry.Scene.prototype.selectScene = function(b) {
  b = b || this.getScenes()[0];
  if (!this.selectedScene || this.selectedScene.id != b.id) {
    Entry.engine.isState("run") && Entry.container.resetSceneDuringRun();
    var a = this.selectedScene;
    a && (a = a.view, a.removeClass("selectedScene"), a = $(a), a.find("input").blur());
    this.selectedScene = b;
    b.view.addClass("selectedScene");
    Entry.container.setCurrentObjects();
    Entry.stage.objectContainers && 0 !== Entry.stage.objectContainers.length && Entry.stage.selectObjectContainer(b);
    (b = Entry.container.getCurrentObjects()[0]) && "minimize" != Entry.type ? (Entry.container.selectObject(b.id), Entry.playground.refreshPlayground()) : (Entry.stage.selectObject(null), Entry.playground.flushPlayground(), Entry.variableContainer.updateList());
    Entry.container.listView_ || Entry.stage.sortZorder();
    Entry.container.updateListView();
    this.updateView();
    Entry.requestUpdate = !0;
  }
};
Entry.Scene.prototype.toJSON = function() {
  for (var b = [], a = this.getScenes().length, c = 0;c < a;c++) {
    var d = this.getScenes()[c], e = d.view, f = d.inputWrapper;
    delete d.view;
    delete d.inputWrapper;
    b.push(JSON.parse(JSON.stringify(d)));
    d.view = e;
    d.inputWrapper = f;
  }
  return b;
};
Entry.Scene.prototype.moveScene = function(b, a) {
  this.getScenes().splice(a, 0, this.getScenes().splice(b, 1)[0]);
  Entry.container.updateObjectsOrder();
  Entry.stage.sortZorder();
  $(".entrySceneElementWorkspace").removeAttr("style");
};
Entry.Scene.prototype.getSceneById = function(b) {
  for (var a = this.getScenes(), c = 0;c < a.length;c++) {
    if (a[c].id == b) {
      return a[c];
    }
  }
  return !1;
};
Entry.Scene.prototype.getScenes = function() {
  return this.scenes_;
};
Entry.Scene.prototype.takeStartSceneSnapshot = function() {
  this.sceneBeforeRun = this.selectedScene;
};
Entry.Scene.prototype.loadStartSceneSnapshot = function() {
  this.selectScene(this.sceneBeforeRun);
  this.sceneBeforeRun = null;
};
Entry.Scene.prototype.createScene = function() {
  var b = {name:Lang.Blocks.SCENE + " " + (this.getScenes().length + 1), id:Entry.generateHash()};
  this.generateElement(b);
  return b;
};
Entry.Scene.prototype.cloneScene = function(b) {
  if (this.scenes_.length >= this.maxCount) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_add_error, !1);
  } else {
    var a = {name:b.name + Lang.Workspace.replica_of_object, id:Entry.generateHash()};
    this.generateElement(a);
    this.addScene(a);
    b = Entry.container.getSceneObjects(b);
    for (var c = b.length - 1;0 <= c;c--) {
      Entry.container.addCloneObject(b[c], a.id);
    }
  }
};
Entry.Scene.prototype.resize = function() {
  var b = this.getScenes(), a = this.selectedScene, c = b[0];
  if (0 !== b.length && c) {
    var d = $(c.view).offset().left, c = parseFloat($(a.view).css("margin-left")), e = $(this.view_).width() - d, f = 0, g;
    for (g in b) {
      var d = b[g], h = d.view;
      h.addClass("minValue");
      $(d.inputWrapper).width(Entry.computeInputWidth(d.name));
      h = $(h);
      f = f + h.width() + c;
    }
    if (f > e) {
      for (g in e -= $(a.view).width(), c = e / (b.length - 1) - (Entry.Scene.viewBasicWidth + c), b) {
        d = b[g], a.id != d.id ? (d.view.removeClass("minValue"), $(d.inputWrapper).width(c)) : d.view.addClass("minValue");
      }
    }
  }
};
Entry.Scene.prototype.getNextScene = function() {
  var b = this.getScenes();
  return b[b.indexOf(this.selectedScene) + 1];
};
Entry.Script = function(b) {
  this.entity = b;
};
p = Entry.Script.prototype;
p.init = function(b, a, c) {
  Entry.assert("BLOCK" == b.tagName.toUpperCase(), b.tagName);
  this.type = b.getAttribute("type");
  this.id = +b.getAttribute("id");
  b.getElementsByTagName("mutation").length && b.getElementsByTagName("mutation")[0].hasAttribute("hashid") && (this.hashId = b.childNodes[0].getAttribute("hashid"));
  "REPEAT" == this.type.substr(0, 6).toUpperCase() && (this.isRepeat = !0);
  a instanceof Entry.Script && (this.previousScript = a, a.parentScript && (this.parentScript = a.parentScript));
  c instanceof Entry.Script && (this.parentScript = c);
  b = b.childNodes;
  for (a = 0;a < b.length;a++) {
    if (c = b[a], "NEXT" == c.tagName.toUpperCase()) {
      this.nextScript = new Entry.Script(this.entity), this.register && (this.nextScript.register = this.register), this.nextScript.init(b[a].childNodes[0], this);
    } else {
      if ("VALUE" == c.tagName.toUpperCase()) {
        this.values || (this.values = {});
        var d = new Entry.Script(this.entity);
        this.register && (d.register = this.register);
        d.init(c.childNodes[0]);
        this.values[c.getAttribute("name")] = d;
      } else {
        "FIELD" == c.tagName.toUpperCase() ? (this.fields || (this.fields = {}), this.fields[c.getAttribute("name")] = c.textContent) : "STATEMENT" == c.tagName.toUpperCase() && (this.statements || (this.statements = {}), d = new Entry.Script(this.entity), this.register && (d.register = this.register), d.init(c.childNodes[0], null, this), d.key = c.getAttribute("name"), this.statements[c.getAttribute("name")] = d);
      }
    }
  }
};
p.clone = function(b, a) {
  var c = new Entry.Script(b);
  c.id = this.id;
  c.type = this.type;
  c.isRepeat = this.isRepeat;
  if (this.parentScript && !this.previousScript && 2 != a) {
    c.parentScript = this.parentScript.clone(b);
    for (var d = c.parentScript.statements[this.key] = c;d.nextScript;) {
      d = d.nextScript, d.parentScript = c.parentScript;
    }
  }
  this.nextScript && 1 != a && (c.nextScript = this.nextScript.clone(b, 0), c.nextScript.previousScript = this);
  this.previousScript && 0 !== a && (c.previousScript = this.previousScript.clone(b, 1), c.previousScript.previousScript = this);
  if (this.fields) {
    c.fields = {};
    for (var e in this.fields) {
      c.fields[e] = this.fields[e];
    }
  }
  if (this.values) {
    for (e in c.values = {}, this.values) {
      c.values[e] = this.values[e].clone(b);
    }
  }
  if (this.statements) {
    for (e in c.statements = {}, this.statements) {
      for (c.statements[e] = this.statements[e].clone(b, 2), d = c.statements[e], d.parentScript = c;d.nextScript;) {
        d = d.nextScript, d.parentScript = c;
      }
    }
  }
  return c;
};
p.getStatement = function(b) {
  return this.statements[b];
};
p.compute = function() {
};
p.getValue = function(b) {
  return this.values[b].run();
};
p.getNumberValue = function(b) {
  return +this.values[b].run();
};
p.getStringValue = function(b) {
  return String(this.values[b].run());
};
p.getBooleanValue = function(b) {
  return this.values[b].run() ? !0 : !1;
};
p.getField = function(b) {
  return this.fields[b];
};
p.getStringField = function(b) {
  return String(this.fields[b]);
};
p.getNumberField = function(b) {
  return +this.fields[b];
};
p.callReturn = function() {
  return this.nextScript ? this.nextScript : this.parentScript ? this.parentScript : null;
};
p.run = function() {
  return Entry.block[this.type](this.entity, this);
};
Entry.StampEntity = function(b, a) {
  this.parent = b;
  this.type = b.objectType;
  this.isStamp = this.isClone = !0;
  this.width = a.getWidth();
  this.height = a.getHeight();
  "sprite" == this.type && (this.object = a.object.clone(!0), this.object.filters = null, a.effect && (this.effect = Entry.cloneSimpleObject(a.effect), this.applyFilter()));
  this.object.entity = this;
  if (a.dialog) {
    var c = a.dialog;
    new Entry.Dialog(this, c.message_, c.mode_, !0);
    this.dialog.object = a.dialog.object.clone(!0);
    Entry.stage.loadDialog(this.dialog);
  }
};
var EntityPrototype = Entry.EntityObject.prototype;
Entry.StampEntity.prototype.applyFilter = EntityPrototype.applyFilter;
Entry.StampEntity.prototype.removeClone = EntityPrototype.removeClone;
Entry.StampEntity.prototype.getWidth = EntityPrototype.getWidth;
Entry.StampEntity.prototype.getHeight = EntityPrototype.getHeight;
Entry.StampEntity.prototype.getInitialEffectValue = EntityPrototype.getInitialEffectValue;
Entry.Toast = function() {
  this.toasts_ = [];
  var b = document.getElementById("entryToastContainer");
  b && document.body.removeChild(b);
  this.body_ = Entry.createElement("div", "entryToastContainer");
  this.body_.addClass("entryToastContainer");
  document.body.appendChild(this.body_);
};
Entry.Toast.prototype.warning = function(b, a, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastWarning");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  d.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  d.appendChild(b);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var a = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(a), d.style.display = "none", Entry.removeElement(d));
      d.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.success = function(b, a, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastSuccess");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  d.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  d.appendChild(b);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var a = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(a), d.style.display = "none", Entry.removeElement(d));
      d.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.alert = function(b, a, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastAlert");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  d.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  d.appendChild(b);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var a = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(a), d.style.display = "none", Entry.toast.body_.removeChild(d));
      d.style.opacity *= .9;
    }, 20);
  }, 5E3);
};
Entry.TvCast = function(b) {
  this.generateView(b);
};
p = Entry.TvCast.prototype;
p.init = function(b) {
  this.tvCastHash = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryRemove");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "tvCastIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", b);
  this.movieFrame = a;
  this.movieContainer.appendChild(this.movieFrame);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var b = document.getElementById("tvCastIframe");
  w = this.movieContainer.offsetWidth;
  b.width = w + "px";
  b.height = 9 * w / 16 + "px";
};
Entry.BlockDriver = function() {
};
(function(b) {
  b.convert = function() {
    var a = new Date, b;
    for (b in Entry.block) {
      "function" === typeof Entry.block[b] && this._convertBlock(b);
    }
    console.log((new Date).getTime() - a.getTime());
  };
  b._convertBlock = function(a) {
    function b(a) {
      var d = {type:a.getAttribute("type"), index:{}};
      a = $(a).children();
      if (!a) {
        return d;
      }
      for (var e = 0;e < a.length;e++) {
        var f = a[e], g = f.tagName, h = $(f).children()[0], t = f.getAttribute("name");
        "value" === g ? "block" == h.nodeName && (d.params || (d.params = []), d.params.push(b(h)), d.index[t] = d.params.length - 1) : "field" === g && (d.params || (d.params = []), d.params.push(f.textContent), d.index[t] = d.params.length - 1);
      }
      return d;
    }
    var d = Blockly.Blocks[a], e = EntryStatic.blockInfo[a], f, g;
    if (e && (f = e.class, g = e.isNotFor, e = e.xml)) {
      var e = $.parseXML(e), h = b(e.childNodes[0])
    }
    d = (new Entry.BlockMockup(d, h, a)).toJSON();
    d.class = f;
    d.isNotFor = g;
    _.isEmpty(d.paramsKeyMap) && delete d.paramsKeyMap;
    _.isEmpty(d.statementsKeyMap) && delete d.statementsKeyMap;
    d.func = Entry.block[a];
    -1 < "NUMBER TRUE FALSE TEXT FUNCTION_PARAM_BOOLEAN FUNCTION_PARAM_STRING TRUE_UN".split(" ").indexOf(a.toUpperCase()) && (d.isPrimitive = !0);
    Entry.block[a] = d;
  };
})(Entry.BlockDriver.prototype);
Entry.BlockMockup = function(b, a, c) {
  this.templates = [];
  this.params = [];
  this.statements = [];
  this.color = "";
  this.output = this.isNext = this.isPrev = !1;
  this.fieldCount = 0;
  this.events = {};
  this.def = a || {};
  this.paramsKeyMap = {};
  this.statementsKeyMap = {};
  this.definition = {params:[], type:this.def.type};
  this.simulate(b);
  this.def = this.definition;
};
(function(b) {
  b.simulate = function(a) {
    a.sensorList && (this.sensorList = a.sensorList);
    a.portList && (this.portList = a.portList);
    a.init.call(this);
    a.whenAdd && (this.events.blockViewAdd || (this.events.blockViewAdd = []), this.events.blockViewAdd.push(a.whenAdd));
    a.whenRemove && (this.events.blockViewDestroy || (this.events.blockViewDestroy = []), this.events.blockViewDestroy.push(a.whenRemove));
  };
  b.toJSON = function() {
    function a(b) {
      if (b && (b = b.params)) {
        for (var c = 0;c < b.length;c++) {
          var d = b[c];
          d && (delete d.index, a(d));
        }
      }
    }
    var b = "";
    this.output ? b = "Boolean" === this.output ? "basic_boolean_field" : "basic_string_field" : !this.isPrev && this.isNext ? b = "basic_event" : 1 == this.statements.length ? b = "basic_loop" : 2 == this.statements.length ? b = "basic_double_loop" : this.isPrev && this.isNext ? b = "basic" : this.isPrev && !this.isNext && (b = "basic_without_next");
    a(this.def);
    var d = /dummy_/mi, e;
    for (e in this.paramsKeyMap) {
      d.test(e) && delete this.paramsKeyMap[e];
    }
    for (e in this.statementsKeyMap) {
      d.test(e) && delete this.statementsKeyMap[e];
    }
    return {color:this.color, skeleton:b, statements:this.statements, template:this.templates.filter(function(a) {
      return "string" === typeof a;
    }).join(" "), params:this.params, events:this.events, def:this.def, paramsKeyMap:this.paramsKeyMap, statementsKeyMap:this.statementsKeyMap};
  };
  b.appendDummyInput = function() {
    return this;
  };
  b.appendValueInput = function(a) {
    this.def && this.def.index && (void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(null));
    this.params.push({type:"Block", accept:"string"});
    this._addToParamsKeyMap(a);
    this.templates.push(this.getFieldCount());
    return this;
  };
  b.appendStatementInput = function(a) {
    this._addToStatementsKeyMap(a);
    this.statements.push({accept:"basic"});
  };
  b.setCheck = function(a) {
    var b = this.params;
    "Boolean" === a && (b[b.length - 1].accept = "boolean");
  };
  b.appendField = function(a, b) {
    if (!a) {
      return this;
    }
    "string" === typeof a && 0 < a.length ? b ? (a = {type:"Text", text:a, color:b}, this.params.push(a), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0)) : this.templates.push(a) : a.constructor == Blockly.FieldIcon ? ("start" === a.type ? this.params.push({type:"Indicator", img:a.src_, size:17, position:{x:0, y:-2}}) : 
    this.params.push({type:"Indicator", img:a.src_, size:12}), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.definition && this.definition.params.push(null)) : a.constructor == Blockly.FieldDropdown ? (this.params.push({type:"Dropdown", options:a.menuGenerator_, value:a.menuGenerator_[0][1], fontSize:11}), this._addToParamsKeyMap(b), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : 
    this.definition.params.push(void 0)) : a.constructor == Blockly.FieldDropdownDynamic ? (this.params.push({type:"DropdownDynamic", value:null, menuName:a.menuName_, fontSize:11}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldTextInput ? (this.params.push({type:"TextInput", value:10}), 
    this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldAngle ? (this.params.push({type:"Angle"}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(null), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldKeydownInput ? (this.params.push({type:"Keyboard", value:81}), this.templates.push(this.getFieldCount()), 
    void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldColour ? (this.params.push({type:"Color"}), this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(b)) : console.log("else", a);
    return this;
  };
  b.setColour = function(a) {
    this.color = a;
  };
  b.setInputsInline = function() {
  };
  b.setOutput = function(a, b) {
    a && (this.output = b);
  };
  b.setPreviousStatement = function(a) {
    this.isPrev = a;
  };
  b.setNextStatement = function(a) {
    this.isNext = a;
  };
  b.setEditable = function(a) {
  };
  b.getFieldCount = function() {
    this.fieldCount++;
    return "%" + this.fieldCount;
  };
  b._addToParamsKeyMap = function(a) {
    a = a ? a : "dummy_" + Entry.Utils.generateId();
    var b = this.paramsKeyMap;
    b[a] = Object.keys(b).length;
  };
  b._addToStatementsKeyMap = function(a) {
    a = a ? a : "dummy_" + Entry.Utils.generateId();
    var b = this.statementsKeyMap;
    b[a] = Object.keys(b).length;
  };
})(Entry.BlockMockup.prototype);
Entry.ContextMenu = {};
(function(b) {
  b.visible = !1;
  b.createDom = function() {
    this.dom = Entry.Dom("ul", {id:"entry-contextmenu", parent:$("body")});
    this.dom.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    Entry.Utils.disableContextmenu(this.dom);
    Entry.documentMousedown.attach(this, function() {
      this.hide();
    });
  };
  b.show = function(a, b, d) {
    this.dom || this.createDom();
    if (0 !== a.length) {
      var e = this;
      void 0 !== b && (this._className = b, this.dom.addClass(b));
      b = this.dom;
      b.empty();
      for (var f = 0, g = a.length;f < g;f++) {
        var h = a[f], k = h.text, l = !1 !== h.enable, n = Entry.Dom("li", {class:l ? "menuAble" : "menuDisable", parent:b}), n = Entry.Dom("span", {parent:n});
        n.text(k);
        l && h.callback && function(a, b) {
          a.mousedown(function(a) {
            a.preventDefault();
            e.hide();
            b(a);
          });
        }(n, h.callback);
      }
      b.removeClass("entryRemove");
      this.visible = !0;
      this.position(d || Entry.mouseCoordinate);
    }
  };
  b.position = function(a) {
    var b = this.dom;
    b.css({left:0, top:0});
    var d = b.width(), e = b.height(), f = $(window), g = f.width(), f = f.height();
    a.x + d > g && (a.x -= d + 3);
    a.y + e > f && (a.y -= e);
    b.css({left:a.x, top:a.y});
  };
  b.hide = function() {
    this.visible = !1;
    this.dom.empty();
    this.dom.addClass("entryRemove");
    this._className && (this.dom.removeClass(this._className), delete this._className);
  };
})(Entry.ContextMenu);
Entry.Loader = {queueCount:0, totalCount:0};
Entry.Loader.addQueue = function(b) {
  this.queueCount || Entry.dispatchEvent("loadStart");
  this.queueCount++;
  this.totalCount++;
};
Entry.Loader.removeQueue = function(b) {
  this.queueCount--;
  this.queueCount || (Entry.dispatchEvent("loadComplete"), this.totalCount = 0);
};
Entry.Loader.getLoadedPercent = function() {
  return 0 === this.totalCount ? 1 : this.queueCount / this.totalCount;
};
Entry.STATIC = {OBJECT:0, ENTITY:1, SPRITE:2, SOUND:3, VARIABLE:4, FUNCTION:5, SCENE:6, MESSAGE:7, BLOCK_MODEL:8, BLOCK_RENDER_MODEL:9, BOX_MODEL:10, THREAD_MODEL:11, DRAG_INSTANCE:12, BLOCK_STATIC:0, BLOCK_MOVE:1, BLOCK_FOLLOW:2, RETURN:0, CONTINUE:1, BREAK:2, PASS:3};
Entry.Utils = {};
Entry.overridePrototype = function() {
  Number.prototype.mod = function(b) {
    return (this % b + b) % b;
  };
};
Entry.Utils.generateId = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.Utils.intersectArray = function(b, a) {
  for (var c = [], d = 0;d < b.length;d++) {
    for (var e = 0;e < a.length;e++) {
      if (b[d] == a[e]) {
        c.push(b[d]);
        break;
      }
    }
  }
  return c;
};
Entry.Utils.isPointInMatrix = function(b, a, c) {
  c = void 0 === c ? 0 : c;
  var d = b.offsetX ? b.x + b.offsetX : b.x, e = b.offsetY ? b.y + b.offsety : b.y;
  return d - c <= a.x && d + b.width + c >= a.x && e - c <= a.y && e + b.height + c >= a.y;
};
Entry.Utils.colorDarken = function(b, a) {
  function c(a) {
    2 != a.length && (a = "0" + a);
    return a;
  }
  var d, e, f;
  7 === b.length ? (d = parseInt(b.substr(1, 2), 16), e = parseInt(b.substr(3, 2), 16), f = parseInt(b.substr(5, 2), 16)) : (d = parseInt(b.substr(1, 2), 16), e = parseInt(b.substr(2, 2), 16), f = parseInt(b.substr(3, 2), 16));
  a = void 0 === a ? .7 : a;
  d = c(Math.floor(d * a).toString(16));
  e = c(Math.floor(e * a).toString(16));
  f = c(Math.floor(f * a).toString(16));
  return "#" + d + e + f;
};
Entry.Utils.colorLighten = function(b, a) {
  a = 0 === a ? 0 : a || 20;
  var c = Entry.Utils.hexToHsl(b);
  c.l += a / 100;
  c.l = Math.min(1, Math.max(0, c.l));
  return Entry.Utils.hslToHex(c);
};
Entry.Utils.bound01 = function(b, a) {
  var c = b;
  "string" == typeof c && -1 != c.indexOf(".") && 1 === parseFloat(c) && (b = "100%");
  c = "string" === typeof b && -1 != b.indexOf("%");
  b = Math.min(a, Math.max(0, parseFloat(b)));
  c && (b = parseInt(b * a, 10) / 100);
  return 1E-6 > Math.abs(b - a) ? 1 : b % a / parseFloat(a);
};
Entry.Utils.hexToHsl = function(b) {
  var a, c;
  7 === b.length ? (a = parseInt(b.substr(1, 2), 16), c = parseInt(b.substr(3, 2), 16), b = parseInt(b.substr(5, 2), 16)) : (a = parseInt(b.substr(1, 2), 16), c = parseInt(b.substr(2, 2), 16), b = parseInt(b.substr(3, 2), 16));
  a = Entry.Utils.bound01(a, 255);
  c = Entry.Utils.bound01(c, 255);
  b = Entry.Utils.bound01(b, 255);
  var d = Math.max(a, c, b), e = Math.min(a, c, b), f, g = (d + e) / 2;
  if (d == e) {
    f = e = 0;
  } else {
    var h = d - e, e = .5 < g ? h / (2 - d - e) : h / (d + e);
    switch(d) {
      case a:
        f = (c - b) / h + (c < b ? 6 : 0);
        break;
      case c:
        f = (b - a) / h + 2;
        break;
      case b:
        f = (a - c) / h + 4;
    }
    f /= 6;
  }
  return {h:360 * f, s:e, l:g};
};
Entry.Utils.hslToHex = function(b) {
  function a(a, b, c) {
    0 > c && (c += 1);
    1 < c && --c;
    return c < 1 / 6 ? a + 6 * (b - a) * c : .5 > c ? b : c < 2 / 3 ? a + (b - a) * (2 / 3 - c) * 6 : a;
  }
  function c(a) {
    return 1 == a.length ? "0" + a : "" + a;
  }
  var d, e;
  e = Entry.Utils.bound01(b.h, 360);
  d = Entry.Utils.bound01(b.s, 1);
  b = Entry.Utils.bound01(b.l, 1);
  if (0 === d) {
    d = b = e = b;
  } else {
    var f = .5 > b ? b * (1 + d) : b + d - b * d, g = 2 * b - f;
    d = a(g, f, e + 1 / 3);
    b = a(g, f, e);
    e = a(g, f, e - 1 / 3);
  }
  b *= 255;
  e *= 255;
  return "#" + [c(Math.round(255 * d).toString(16)), c(Math.round(b).toString(16)), c(Math.round(e).toString(16))].join("");
};
Entry.Utils.bindGlobalEvent = function(b) {
  var a = $(document);
  void 0 === b && (b = "resize mousedown mousemove keydown keyup dispose".split(" "));
  -1 < b.indexOf("resize") && (Entry.windowReszied && ($(window).off("resize"), Entry.windowReszied.clear()), Entry.windowResized = new Entry.Event(window), $(window).on("resize", function(a) {
    Entry.windowResized.notify(a);
  }));
  -1 < b.indexOf("mousedown") && (Entry.documentMousedown && (a.off("mousedown"), Entry.documentMousedown.clear()), Entry.documentMousedown = new Entry.Event(window), a.on("mousedown", function(a) {
    Entry.documentMousedown.notify(a);
  }));
  -1 < b.indexOf("mousemove") && (Entry.documentMousemove && (a.off("touchmove mousemove"), Entry.documentMousemove.clear()), Entry.mouseCoordinate = {}, Entry.documentMousemove = new Entry.Event(window), a.on("touchmove mousemove", function(a) {
    a.originalEvent && a.originalEvent.touches && (a = a.originalEvent.touches[0]);
    Entry.documentMousemove.notify(a);
    Entry.mouseCoordinate.x = a.clientX;
    Entry.mouseCoordinate.y = a.clientY;
  }));
  -1 < b.indexOf("keydown") && (Entry.keyPressed && (a.off("keydown"), Entry.keyPressed.clear()), Entry.pressedKeys = [], Entry.keyPressed = new Entry.Event(window), a.on("keydown", function(a) {
    var b = a.keyCode;
    0 > Entry.pressedKeys.indexOf(b) && Entry.pressedKeys.push(b);
    Entry.keyPressed.notify(a);
  }));
  -1 < b.indexOf("keyup") && (Entry.keyUpped && (a.off("keyup"), Entry.keyUpped.clear()), Entry.keyUpped = new Entry.Event(window), a.on("keyup", function(a) {
    var b = Entry.pressedKeys.indexOf(a.keyCode);
    -1 < b && Entry.pressedKeys.splice(b, 1);
    Entry.keyUpped.notify(a);
  }));
  -1 < b.indexOf("dispose") && (Entry.disposeEvent && Entry.disposeEvent.clear(), Entry.disposeEvent = new Entry.Event(window), Entry.documentMousedown && Entry.documentMousedown.attach(this, function(a) {
    Entry.disposeEvent.notify(a);
  }));
};
Entry.Utils.makeActivityReporter = function() {
  Entry.activityReporter = new Entry.ActivityReporter;
  Entry.commander && Entry.commander.addReporter(Entry.activityReporter);
  return Entry.activityReporter;
};
Entry.Utils.initEntryEvent_ = function() {
  Entry.events_ || (Entry.events_ = []);
};
Entry.sampleColours = [];
Entry.assert = function(b, a) {
  if (!b) {
    throw Error(a || "Assert failed");
  }
};
Entry.parseTexttoXML = function(b) {
  var a;
  window.ActiveXObject ? (a = new ActiveXObject("Microsoft.XMLDOM"), a.async = "false", a.loadXML(b)) : a = (new DOMParser).parseFromString(b, "text/xml");
  return a;
};
Entry.createElement = function(b, a) {
  var c = document.createElement(b);
  a && (c.id = a);
  c.hasClass = function(a) {
    return this.className.match(new RegExp("(\\s|^)" + a + "(\\s|$)"));
  };
  c.addClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) || (this.className += " " + a);
    }
  };
  c.removeClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) && (this.className = this.className.replace(new RegExp("(\\s|^)" + a + "(\\s|$)"), " "));
    }
  };
  c.bindOnClick = function(a) {
    $(this).on("click tab", function(b) {
      b.stopImmediatePropagation();
      a.call(this, b);
    });
  };
  return c;
};
Entry.makeAutolink = function(b) {
  return b ? b.replace(/(http|https|ftp|telnet|news|irc):\/\/([-/.a-zA-Z0-9_~#%$?&=:200-377()][^)\]}]+)/gi, "<a href='$1://$2' target='_blank'>$1://$2</a>").replace(/([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+.[a-z0-9-]+)/gi, "<a href='mailto:$1'>$1</a>") : "";
};
Entry.generateHash = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.addEventListener = function(b, a) {
  this.events_ || (this.events_ = {});
  this.events_[b] || (this.events_[b] = []);
  a instanceof Function && this.events_[b].push(a);
  return !0;
};
Entry.dispatchEvent = function(b, a) {
  this.events_ || (this.events_ = {});
  if (this.events_[b]) {
    for (var c = 0, d = this.events_[b].length;c < d;c++) {
      this.events_[b][c].call(window, a);
    }
  }
};
Entry.removeEventListener = function(b, a) {
  if (this.events_[b]) {
    for (var c = 0, d = this.events_[b].length;c < d;c++) {
      if (this.events_[b][c] === a) {
        this.events_[b].splice(c, 1);
        break;
      }
    }
  }
};
Entry.removeAllEventListener = function(b) {
  this.events_ && this.events_[b] && delete this.events_[b];
};
Entry.addTwoNumber = function(b, a) {
  if (isNaN(b) || isNaN(a)) {
    return b + a;
  }
  b += "";
  a += "";
  var c = b.indexOf("."), d = a.indexOf("."), e = 0, f = 0;
  0 < c && (e = b.length - c - 1);
  0 < d && (f = a.length - d - 1);
  return 0 < e || 0 < f ? e >= f ? (parseFloat(b) + parseFloat(a)).toFixed(e) : (parseFloat(b) + parseFloat(a)).toFixed(f) : parseInt(b) + parseInt(a);
};
Entry.hex2rgb = function(b) {
  return (b = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(b)) ? {r:parseInt(b[1], 16), g:parseInt(b[2], 16), b:parseInt(b[3], 16)} : null;
};
Entry.rgb2hex = function(b, a, c) {
  return "#" + (16777216 + (b << 16) + (a << 8) + c).toString(16).slice(1);
};
Entry.generateRgb = function() {
  return {r:Math.floor(256 * Math.random()), g:Math.floor(256 * Math.random()), b:Math.floor(256 * Math.random())};
};
Entry.adjustValueWithMaxMin = function(b, a, c) {
  return b > c ? c : b < a ? a : b;
};
Entry.isExist = function(b, a, c) {
  for (var d = 0;d < c.length;d++) {
    if (c[d][a] == b) {
      return c[d];
    }
  }
  return !1;
};
Entry.getColourCodes = function() {
  return "transparent #660000 #663300 #996633 #003300 #003333 #003399 #000066 #330066 #660066 #FFFFFF #990000 #993300 #CC9900 #006600 #336666 #0033FF #000099 #660099 #990066 #000000 #CC0000 #CC3300 #FFCC00 #009900 #006666 #0066FF #0000CC #663399 #CC0099 #333333 #FF0000 #FF3300 #FFFF00 #00CC00 #009999 #0099FF #0000FF #9900CC #FF0099 #666666 #CC3333 #FF6600 #FFFF33 #00FF00 #00CCCC #00CCFF #3366FF #9933FF #FF00FF #999999 #FF6666 #FF6633 #FFFF66 #66FF66 #66CCCC #00FFFF #3399FF #9966FF #FF66FF #BBBBBB #FF9999 #FF9966 #FFFF99 #99FF99 #66FFCC #99FFFF #66CCff #9999FF #FF99FF #CCCCCC #FFCCCC #FFCC99 #FFFFCC #CCFFCC #99FFCC #CCFFFF #99CCFF #CCCCFF #FFCCFF".split(" ");
};
Entry.removeElement = function(b) {
  b && b.parentNode && b.parentNode.removeChild(b);
};
Entry.getElementsByClassName = function(b) {
  for (var a = [], c = document.getElementsByTagName("*"), d = 0;d < c.length;d++) {
    -1 < (" " + c[d].className + " ").indexOf(" " + b + " ") && a.push(c[d]);
  }
  return a;
};
Entry.parseNumber = function(b) {
  return "string" != typeof b || isNaN(+b) ? "number" != typeof b || isNaN(+b) ? !1 : b : +b;
};
Entry.countStringLength = function(b) {
  var a, c = 0;
  for (a = 0;a < b.length;a++) {
    255 < b.charCodeAt(a) ? c += 2 : c++;
  }
  return c;
};
Entry.cutStringByLength = function(b, a) {
  var c, d = 0;
  for (c = 0;d < a && c < b.length;c++) {
    255 < b.charCodeAt(c) ? d += 2 : d++;
  }
  return b.substr(0, c);
};
Entry.isChild = function(b, a) {
  if (!a) {
    for (;a.parentNode;) {
      if ((a = a.parentNode) == b) {
        return !0;
      }
    }
  }
  return !1;
};
Entry.launchFullScreen = function(b) {
  b.requestFullscreen ? b.requestFullscreen() : b.mozRequestFulScreen ? b.mozRequestFulScreen() : b.webkitRequestFullscreen ? b.webkitRequestFullscreen() : b.msRequestFullScreen && b.msRequestFullScreen();
};
Entry.exitFullScreen = function() {
  document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
};
Entry.isPhone = function() {
  return !1;
};
Entry.getKeyCodeMap = function() {
  return {65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 32:Lang.Blocks.START_press_some_key_space, 37:Lang.Blocks.START_press_some_key_left, 38:Lang.Blocks.START_press_some_key_up, 39:Lang.Blocks.START_press_some_key_right, 40:Lang.Blocks.START_press_some_key_down, 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
  13:Lang.Blocks.START_press_some_key_enter};
};
Entry.checkCollisionRect = function(b, a) {
  return !(b.y + b.height < a.y || b.y > a.y + a.height || b.x + b.width < a.x || b.x > a.x + a.width);
};
Entry.bindAnimationCallback = function(b, a) {
  b.addEventListener("webkitAnimationEnd", a, !1);
  b.addEventListener("animationend", a, !1);
  b.addEventListener("oanimationend", a, !1);
};
Entry.cloneSimpleObject = function(b) {
  var a = {}, c;
  for (c in b) {
    a[c] = b[c];
  }
  return a;
};
Entry.nodeListToArray = function(b) {
  for (var a = Array(b.length), c = -1, d = b.length;++c !== d;a[c] = b[c]) {
  }
  return a;
};
Entry.computeInputWidth = function(b) {
  var a = document.createElement("span");
  a.className = "tmp-element";
  a.innerHTML = b.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  document.body.appendChild(a);
  b = a.offsetWidth;
  document.body.removeChild(a);
  return +(b + 10) + "px";
};
Entry.isArrowOrBackspace = function(b) {
  return -1 < [37, 38, 39, 40, 8].indexOf(b);
};
Entry.hexStringToBin = function(b) {
  for (var a = [], c = 0;c < b.length - 1;c += 2) {
    a.push(parseInt(b.substr(c, 2), 16));
  }
  return String.fromCharCode.apply(String, a);
};
Entry.findObjsByKey = function(b, a, c) {
  for (var d = [], e = 0;e < b.length;e++) {
    b[e][a] == c && d.push(b[e]);
  }
  return d;
};
Entry.factorials = [];
Entry.factorial = function(b) {
  return 0 === b || 1 == b ? 1 : 0 < Entry.factorials[b] ? Entry.factorials[b] : Entry.factorials[b] = Entry.factorial(b - 1) * b;
};
Entry.getListRealIndex = function(b, a) {
  if (isNaN(b)) {
    switch(b) {
      case "FIRST":
        b = 1;
        break;
      case "LAST":
        b = a.array_.length;
        break;
      case "RANDOM":
        b = Math.floor(Math.random() * a.array_.length) + 1;
    }
  }
  return b;
};
Entry.toRadian = function(b) {
  return b * Math.PI / 180;
};
Entry.toDegrees = function(b) {
  return 180 * b / Math.PI;
};
Entry.getPicturesJSON = function(b) {
  for (var a = [], c = 0, d = b.length;c < d;c++) {
    var e = b[c], f = {};
    f._id = e._id;
    f.id = e.id;
    f.dimension = e.dimension;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    f.scale = e.scale;
    a.push(f);
  }
  return a;
};
Entry.getSoundsJSON = function(b) {
  for (var a = [], c = 0, d = b.length;c < d;c++) {
    var e = b[c], f = {};
    f._id = e._id;
    f.duration = e.duration;
    f.ext = e.ext;
    f.id = e.id;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    a.push(f);
  }
  return a;
};
Entry.cutDecimal = function(b) {
  return Math.round(100 * b) / 100;
};
Entry.getBrowserType = function() {
  if (Entry.userAgent) {
    return Entry.userAgent;
  }
  var b = navigator.userAgent, a, c = b.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(c[1])) {
    return a = /\brv[ :]+(\d+)/g.exec(b) || [], "IE " + (a[1] || "");
  }
  if ("Chrome" === c[1] && (a = b.match(/\b(OPR|Edge)\/(\d+)/), null != a)) {
    return a.slice(1).join(" ").replace("OPR", "Opera");
  }
  c = c[2] ? [c[1], c[2]] : [navigator.appName, navigator.appVersion, "-?"];
  null != (a = b.match(/version\/(\d+)/i)) && c.splice(1, 1, a[1]);
  b = c.join(" ");
  return Entry.userAgent = b;
};
Entry.setBasicBrush = function(b) {
  var a = new createjs.Graphics;
  a.thickness = 1;
  a.rgb = Entry.hex2rgb("#ff0000");
  a.opacity = 100;
  a.setStrokeStyle(1);
  a.beginStroke("rgba(255,0,0,1)");
  var c = new createjs.Shape(a);
  Entry.stage.selectedObjectContainer.addChild(c);
  b.brush && (b.brush = null);
  b.brush = a;
  b.shape && (b.shape = null);
  b.shape = c;
};
Entry.setCloneBrush = function(b, a) {
  var c = new createjs.Graphics;
  c.thickness = a.thickness;
  c.rgb = a.rgb;
  c.opacity = a.opacity;
  c.setStrokeStyle(c.thickness);
  c.beginStroke("rgba(" + c.rgb.r + "," + c.rgb.g + "," + c.rgb.b + "," + c.opacity / 100 + ")");
  var d = new createjs.Shape(c);
  Entry.stage.selectedObjectContainer.addChild(d);
  b.brush && (b.brush = null);
  b.brush = c;
  b.shape && (b.shape = null);
  b.shape = d;
};
Entry.isFloat = function(b) {
  return /\d+\.{1}\d+/.test(b);
};
Entry.getStringIndex = function(b) {
  if (!b) {
    return "";
  }
  for (var a = {string:b, index:1}, c = 0, d = [], e = b.length - 1;0 < e;--e) {
    var f = b.charAt(e);
    if (isNaN(f)) {
      break;
    } else {
      d.unshift(f), c = e;
    }
  }
  0 < c && (a.string = b.substring(0, c), a.index = parseInt(d.join("")) + 1);
  return a;
};
Entry.getOrderedName = function(b, a, c) {
  if (!b) {
    return "untitled";
  }
  if (!a || 0 === a.length) {
    return b;
  }
  c || (c = "name");
  for (var d = 0, e = Entry.getStringIndex(b), f = 0, g = a.length;f < g;f++) {
    var h = Entry.getStringIndex(a[f][c]);
    e.string === h.string && h.index > d && (d = h.index);
  }
  return 0 < d ? e.string + d : b;
};
Entry.changeXmlHashId = function(b) {
  if (/function_field/.test(b.getAttribute("type"))) {
    for (var a = b.getElementsByTagName("mutation"), c = 0, d = a.length;c < d;c++) {
      a[c].setAttribute("hashid", Entry.generateHash());
    }
  }
  return b;
};
Entry.getMaxFloatPoint = function(b) {
  for (var a = 0, c = 0, d = b.length;c < d;c++) {
    var e = String(b[c]), f = e.indexOf(".");
    -1 !== f && (e = e.length - (f + 1), e > a && (a = e));
  }
  return Math.min(a, 20);
};
Entry.convertToRoundedDecimals = function(b, a) {
  return isNaN(b) || !this.isFloat(b) ? b : +(Math.round(b + "e" + a) + "e-" + a);
};
Entry.attachEventListener = function(b, a, c) {
  setTimeout(function() {
    b.addEventListener(a, c);
  }, 0);
};
Entry.deAttachEventListener = function(b, a, c) {
  b.removeEventListener(a, c);
};
Entry.isEmpty = function(b) {
  if (!b) {
    return !0;
  }
  for (var a in b) {
    if (b.hasOwnProperty(a)) {
      return !1;
    }
  }
  return !0;
};
Entry.Utils.disableContextmenu = function(b) {
  if (b) {
    $(b).on("contextmenu", function(a) {
      a.stopPropagation();
      a.preventDefault();
      return !1;
    });
  }
};
Entry.Utils.isRightButton = function(b) {
  return 2 == b.button || b.ctrlKey;
};
Entry.Utils.isTouchEvent = function(b) {
  return "mousedown" !== b.type.toLowerCase();
};
Entry.Utils.inherit = function(b, a) {
  function c() {
  }
  c.prototype = b.prototype;
  a.prototype = new c;
  return a;
};
Entry.bindAnimationCallbackOnce = function(b, a) {
  b.one("webkitAnimationEnd animationendo animationend", a);
};
Entry.Utils.isInInput = function(b) {
  return "textarea" == b.target.type || "text" == b.target.type;
};
Entry.Utils.isFunction = function(b) {
  return "function" === typeof b;
};
Entry.Utils.addFilters = function(b, a) {
  var c = b.elem("defs"), d = c.elem("filter", {id:"entryTrashcanFilter_" + a});
  d.elem("feGaussianBlur", {"in":"SourceAlpha", stdDeviation:2, result:"blur"});
  d.elem("feOffset", {"in":"blur", dx:1, dy:1, result:"offsetBlur"});
  d = d.elem("feMerge");
  d.elem("feMergeNode", {"in":"offsetBlur"});
  d.elem("feMergeNode", {"in":"SourceGraphic"}, d);
  d = c.elem("filter", {id:"entryBlockShadowFilter_" + a, height:"200%"});
  d.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:1});
  d.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"0.7 0 0 0 0 0 0.7 0 0 0 0 0 0.7 0 0 0 0 0 1 0"});
  d.elem("feBlend", {in:"SourceGraphic", in1:"offOut", mode:"normal"});
  c = c.elem("filter", {id:"entryBlockHighlightFilter_" + a});
  c.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:0});
  c.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"1.3 0 0 0 0 0 1.3 0 0 0 0 0 1.3 0 0 0 0 0 1 0"});
};
Entry.Utils.addBlockPattern = function(b, a) {
  for (var c = b.elem("pattern", {id:"blockHoverPattern_" + a, class:"blockHoverPattern", patternUnits:"userSpaceOnUse", patternTransform:"translate(12, 0)", x:0, y:0, width:125, height:33, style:"display: none"}), d = c.elem("g"), e = d.elem("rect", {x:0, y:0, width:125, height:33}), f = Entry.mediaFilePath + "block_pattern_(order).png", g = 1;5 > g;g++) {
    d.elem("image", {class:"pattern" + g, href:f.replace("(order)", g), x:0, y:0, width:125, height:33});
  }
  return {pattern:c, rect:e};
};
Entry.Utils.COLLISION = {NONE:0, UP:1, RIGHT:2, LEFT:3, DOWN:4};
Entry.Utils.createMouseEvent = function(b, a) {
  var c = document.createEvent("MouseEvent");
  c.initMouseEvent(b, !0, !0, window, 0, 0, 0, a.clientX, a.clientY, !1, !1, !1, !1, 0, null);
  return c;
};
Entry.Utils.xmlToJsonData = function(b) {
  b = $.parseXML(b);
  var a = [];
  b = b.childNodes[0].childNodes;
  for (var c in b) {
    var d = b[c];
    if (d.tagName) {
      var e = {category:d.getAttribute("id"), blocks:[]}, d = d.childNodes;
      for (c in d) {
        var f = d[c];
        f.tagName && (f = f.getAttribute("type")) && e.blocks.push(f);
      }
      a.push(e);
    }
  }
  return a;
};
Entry.Utils.stopProjectWithToast = function(b, a, c) {
  var d = b.block;
  a = a || "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec \ubc1c\uc0dd";
  Entry.toast && !c && Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.check_runtime_error, !0);
  Entry.engine && Entry.engine.toggleStop();
  "workspace" === Entry.type && (b.block && "funcBlock" in b.block ? d = b.block.funcBlock : b.funcExecutor && (d = b.funcExecutor.scope.block, b = b.type.replace("func_", ""), Entry.Func.edit(Entry.variableContainer.functions_[b])), d && (Entry.container.selectObject(d.getCode().object.id, !0), d.view.getBoard().activateBlock(d)));
  throw Error(a);
};
Entry.Utils.AsyncError = function(b) {
  this.name = "AsyncError";
  this.message = b || "\ube44\ub3d9\uae30 \ud638\ucd9c \ub300\uae30";
};
Entry.Utils.AsyncError.prototype = Error();
Entry.Utils.AsyncError.prototype.constructor = Entry.Utils.AsyncError;
Entry.Utils.isChrome = function() {
  return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};
Entry.Utils.waitForWebfonts = function(b, a) {
  for (var c = 0, d = 0, e = b.length;d < e;++d) {
    (function(d) {
      function e() {
        h && h.offsetWidth != k && (++c, h.parentNode.removeChild(h), h = null);
        if (c >= b.length && (l && clearInterval(l), c == b.length)) {
          return a(), !0;
        }
      }
      var h = document.createElement("span");
      h.innerHTML = "giItT1WQy@!-/#";
      h.style.position = "absolute";
      h.style.left = "-10000px";
      h.style.top = "-10000px";
      h.style.fontSize = "300px";
      h.style.fontFamily = "sans-serif";
      h.style.fontVariant = "normal";
      h.style.fontStyle = "normal";
      h.style.fontWeight = "normal";
      h.style.letterSpacing = "0";
      document.body.appendChild(h);
      var k = h.offsetWidth;
      h.style.fontFamily = d;
      var l;
      e() || (l = setInterval(e, 50));
    })(b[d]);
  }
};
window.requestAnimFrame = function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(b) {
    window.setTimeout(b, 1E3 / 60);
  };
}();
Entry.isMobile = function() {
  if (Entry.device) {
    return "tablet" === Entry.device;
  }
  var b = window.platform;
  if (b && b.type && ("tablet" === b.type || "mobile" === b.type)) {
    return Entry.device = "tablet", !0;
  }
  Entry.device = "desktop";
  return !1;
};
Entry.Utils.convertMouseEvent = function(b) {
  return b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
};
Entry.Model = function(b, a) {
  var c = Entry.Model;
  c.generateSchema(b);
  c.generateSetter(b);
  c.generateObserve(b);
  (void 0 === a || a) && Object.seal(b);
  return b;
};
(function(b) {
  b.generateSchema = function(a) {
    var b = a.schema;
    if (void 0 !== b) {
      b = JSON.parse(JSON.stringify(b));
      a.data = {};
      for (var d in b) {
        (function(d) {
          a.data[d] = b[d];
          Object.defineProperty(a, d, {get:function() {
            return a.data[d];
          }});
        })(d);
      }
      a._toJSON = this._toJSON;
    }
  };
  b.generateSetter = function(a) {
    a.set = this.set;
  };
  b.set = function(a, b) {
    var d = {}, e;
    for (e in this.data) {
      void 0 !== a[e] && (a[e] === this.data[e] ? delete a[e] : (d[e] = this.data[e], this.data[e] = a[e] instanceof Array ? a[e].concat() : a[e]));
    }
    b || this.notify(Object.keys(a), d);
  };
  b.generateObserve = function(a) {
    a.observers = [];
    a.observe = this.observe;
    a.unobserve = this.unobserve;
    a.notify = this.notify;
  };
  b.observe = function(a, b, d, e) {
    d = new Entry.Observer(this.observers, a, b, d);
    if (!1 !== e) {
      a[b]([]);
    }
    return d;
  };
  b.unobserve = function(a) {
    a.destroy();
  };
  b.notify = function(a, b) {
    "string" === typeof a && (a = [a]);
    var d = this;
    d.observers.map(function(e) {
      var f = a;
      void 0 !== e.attrs && (f = Entry.Utils.intersectArray(e.attrs, a));
      if (f.length) {
        e.object[e.funcName](f.map(function(a) {
          return {name:a, object:d, oldValue:b[a]};
        }));
      }
    });
  };
  b._toJSON = function() {
    var a = {}, b;
    for (b in this.data) {
      a[b] = this.data[b];
    }
    return a;
  };
})(Entry.Model);
Entry.Func = function(b) {
  this.id = b ? b.id : Entry.generateHash();
  this.content = b ? new Entry.Code(b.content) : new Entry.Code([[{type:"function_create", copyable:!1, deletable:!1, x:40, y:40}]]);
  this.blockMenuBlock = this.block = null;
  this.hashMap = {};
  this.paramMap = {};
  var a = function() {
  };
  a.prototype = Entry.block.function_general;
  a = new a;
  a.changeEvent = new Entry.Event;
  a.template = Lang.template.function_general;
  Entry.block["func_" + this.id] = a;
  if (b) {
    b = this.content._blockMap;
    for (var c in b) {
      Entry.Func.registerParamBlock(b[c].type);
    }
    Entry.Func.generateWsBlock(this);
  }
  Entry.Func.registerFunction(this);
  Entry.Func.updateMenu();
};
Entry.Func.threads = {};
Entry.Func.registerFunction = function(b) {
  if (Entry.playground) {
    var a = Entry.playground.mainWorkspace;
    a && (this._targetFuncBlock = a.getBlockMenu().getCategoryCodes("func").createThread([{type:"func_" + b.id}]), b.blockMenuBlock = this._targetFuncBlock);
  }
};
Entry.Func.executeFunction = function(b) {
  var a = this.threads[b];
  if (a = Entry.Engine.computeThread(a.entity, a)) {
    return this.threads[b] = a, !0;
  }
  delete this.threads[b];
  return !1;
};
Entry.Func.clearThreads = function() {
  this.threads = {};
};
Entry.Func.prototype.init = function(b) {
  this.id = b.id;
  this.content = Blockly.Xml.textToDom(b.content);
  this.block = Blockly.Xml.textToDom("<xml>" + b.block + "</xml>").childNodes[0];
};
Entry.Func.prototype.destroy = function() {
  this.blockMenuBlock.destroy();
};
Entry.Func.edit = function(b) {
  this.cancelEdit();
  this.targetFunc = b;
  this.initEditView(b.content);
  this.bindFuncChangeEvent();
  this.updateMenu();
};
Entry.Func.initEditView = function(b) {
  this.menuCode || this.setupMenuCode();
  var a = Entry.playground.mainWorkspace;
  a.setMode(Entry.Workspace.MODE_OVERLAYBOARD);
  a.changeOverlayBoardCode(b);
  this._workspaceStateEvent = a.changeEvent.attach(this, this.endEdit);
};
Entry.Func.endEdit = function(b) {
  this.unbindFuncChangeEvent();
  this._workspaceStateEvent.destroy();
  delete this._workspaceStateEvent;
  switch(b) {
    case "save":
      this.save();
    case "cancelEdit":
      this.cancelEdit();
  }
};
Entry.Func.save = function() {
  this.targetFunc.generateBlock(!0);
  Entry.variableContainer.saveFunction(this.targetFunc);
};
Entry.Func.syncFuncName = function(b) {
  var a = 0, c = [], c = b.split(" "), d = "";
  b = [];
  b = Blockly.mainWorkspace.getAllBlocks();
  for (var e = 0;e < b.length;e++) {
    var f = b[e];
    if ("function_general" === f.type) {
      for (var g = [], g = f.inputList, h = 0;h < g.length;h++) {
        f = g[h], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_ && (d += f.fieldRow[0].text_, d += " ");
      }
      d = d.trim();
      if (d === this.srcFName && this.srcFName.split(" ").length == c.length) {
        for (d = 0;d < g.length;d++) {
          if (f = g[d], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_) {
            if (void 0 === c[a]) {
              g.splice(d, 1);
              break;
            } else {
              f.fieldRow[0].text_ = c[a];
            }
            a++;
          }
        }
      }
      d = "";
      a = 0;
    }
  }
  a = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, a);
};
Entry.Func.cancelEdit = function() {
  this.targetFunc && (Entry.Func.isEdit = !1, this.targetFunc.block || (this._targetFuncBlock.destroy(), delete Entry.variableContainer.functions_[this.targetFunc.id], delete Entry.variableContainer.selected), delete this.targetFunc, this.updateMenu(), Entry.variableContainer.updateList(), Entry.playground.mainWorkspace.setMode(Entry.Workspace.MODE_BOARD));
};
Entry.Func.getMenuXml = function() {
  var b = [];
  this.targetFunc || (b = b.concat(this.createBtn));
  if (this.targetFunc) {
    var a = this.FIELD_BLOCK, a = a.replace("#1", Entry.generateHash()), a = a.replace("#2", Entry.generateHash()), a = Blockly.Xml.textToDom(a).childNodes, b = b.concat(Entry.nodeListToArray(a))
  }
  for (var c in Entry.variableContainer.functions_) {
    a = Entry.variableContainer.functions_[c], a === this.targetFunc ? (a = Entry.Func.generateBlock(this.targetFunc, Blockly.Xml.workspaceToDom(Entry.Func.workspace), a.id).block, b.push(a)) : b.push(a.block);
  }
  return b;
};
Entry.Func.syncFunc = function() {
  var b = Entry.Func;
  if (b.targetFunc) {
    var a = b.workspace.topBlocks_[0].toString(), c = b.workspace.topBlocks_.length;
    (b.fieldText != a || b.workspaceLength != c) && 1 > Blockly.Block.dragMode_ && (b.updateMenu(), b.fieldText = a, b.workspaceLength = c);
  }
};
Entry.Func.setupMenuCode = function() {
  var b = Entry.playground.mainWorkspace;
  b && (b = b.getBlockMenu().getCategoryCodes("func"), this._fieldLabel = b.createThread([{type:"function_field_label"}]).getFirstBlock(), this._fieldString = b.createThread([{type:"function_field_string", params:[{type:this.requestParamBlock("string")}]}]).getFirstBlock(), this._fieldBoolean = b.createThread([{type:"function_field_boolean", params:[{type:this.requestParamBlock("boolean")}]}]).getFirstBlock(), this.menuCode = b);
};
Entry.Func.refreshMenuCode = function() {
  if (Entry.playground.mainWorkspace) {
    this.menuCode || this.setupMenuCode();
    var b = Entry.block[this._fieldString.params[0].type].changeEvent._listeners.length;
    2 < b && this._fieldString.params[0].changeType(this.requestParamBlock("string"));
    b = Entry.block[this._fieldBoolean.params[0].type].changeEvent._listeners.length;
    2 < b && this._fieldBoolean.params[0].changeType(this.requestParamBlock("boolean"));
  }
};
Entry.Func.requestParamBlock = function(b) {
  var a = Entry.generateHash(), c;
  switch(b) {
    case "string":
      c = Entry.block.function_param_string;
      break;
    case "boolean":
      c = Entry.block.function_param_boolean;
      break;
    default:
      return null;
  }
  a = b + "Param_" + a;
  b = Entry.Func.createParamBlock(a, c, b);
  Entry.block[a] = b;
  return a;
};
Entry.Func.registerParamBlock = function(b) {
  -1 < b.indexOf("stringParam") ? Entry.Func.createParamBlock(b, Entry.block.function_param_string, b) : -1 < b.indexOf("booleanParam") && Entry.Func.createParamBlock(b, Entry.block.function_param_boolean, b);
};
Entry.Func.createParamBlock = function(b, a, c) {
  var d = function() {
  };
  c = "string" === c ? "function_param_string" : "function_param_boolean";
  d.prototype = a;
  d = new d;
  d.changeEvent = new Entry.Event;
  d.template = Lang.template[c];
  return Entry.block[b] = d;
};
Entry.Func.updateMenu = function() {
  if (Entry.playground && Entry.playground.mainWorkspace) {
    var b = Entry.playground.mainWorkspace.getBlockMenu();
    this.targetFunc ? (this.menuCode || this.setupMenuCode(), b.banClass("functionInit"), b.unbanClass("functionEdit")) : (b.unbanClass("functionInit"), b.banClass("functionEdit"));
    b.reDraw();
  }
};
Entry.Func.prototype.edit = function() {
  Entry.Func.isEdit || (Entry.Func.isEdit = !0, Entry.Func.svg ? this.parentView.appendChild(this.svg) : Entry.Func.initEditView());
};
Entry.Func.generateBlock = function(b) {
  b = Entry.block["func_" + b.id];
  var a = {template:b.template, params:b.params}, c = /(%\d)/mi, d = b.template.split(c), e = "", f = 0, g = 0, h;
  for (h in d) {
    var k = d[h];
    c.test(k) ? (k = +k.split("%")[1] - 1, k = b.params[k], "Indicator" !== k.type && ("boolean" === k.accept ? (e += Lang.template.function_param_boolean + (f ? f : ""), f++) : (e += Lang.template.function_param_string + (g ? g : ""), g++))) : e += k;
  }
  return {block:a, description:e};
};
Entry.Func.prototype.generateBlock = function(b) {
  b = Entry.Func.generateBlock(this);
  this.block = b.block;
  this.description = b.description;
};
Entry.Func.generateWsBlock = function(b) {
  this.unbindFuncChangeEvent();
  b = b ? b : this.targetFunc;
  for (var a = b.content.getEventMap("funcDef")[0].params[0], c = 0, d = 0, e = [], f = "", g = b.hashMap, h = b.paramMap;a;) {
    var k = a.params[0];
    switch(a.type) {
      case "function_field_label":
        f = f + " " + k;
        break;
      case "function_field_boolean":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_logical_variable + " " + (c ? c : "")});
        g[k.type] = !1;
        h[k.type] = c + d;
        c++;
        e.push({type:"Block", accept:"boolean"});
        f += " %" + (c + d);
        break;
      case "function_field_string":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_character_variable + " " + (d ? d : "")}), g[k.type] = !1, h[k.type] = c + d, d++, f += " %" + (c + d), e.push({type:"Block", accept:"string"});
    }
    a = a.getOutputBlock();
  }
  c++;
  f += " %" + (c + d);
  e.push({type:"Indicator", img:"block_icon/function_03.png", size:12});
  Entry.Mutator.mutate("func_" + b.id, {params:e, template:f});
  for (var l in g) {
    g[l] ? (a = -1 < l.indexOf("string") ? Lang.Blocks.FUNCTION_character_variable : Lang.Blocks.FUNCTION_logical_variable, Entry.Mutator.mutate(l, {template:a})) : g[l] = !0;
  }
  this.bindFuncChangeEvent(b);
};
Entry.Func.bindFuncChangeEvent = function(b) {
  b = b ? b : this.targetFunc;
  !this._funcChangeEvent && b.content.getEventMap("funcDef")[0].view && (this._funcChangeEvent = b.content.getEventMap("funcDef")[0].view._contents[1].changeEvent.attach(this, this.generateWsBlock));
};
Entry.Func.unbindFuncChangeEvent = function() {
  this._funcChangeEvent && this._funcChangeEvent.destroy();
  delete this._funcChangeEvent;
};
Entry.HWMontior = {};
Entry.HWMonitor = function(b) {
  this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  this._hwModule = b;
  var a = this;
  Entry.addEventListener("windowResized", function() {
    var b = a._hwModule.monitorTemplate.mode;
    "both" == b && (a.resize(), a.resizeList());
    "list" == b ? a.resizeList() : a.resize();
  });
  Entry.addEventListener("hwModeChange", function() {
    a.changeMode();
  });
  this.changeOffset = 0;
  this.scale = .5;
  this._listPortViews = {};
};
(function(b) {
  b.initView = function() {
    this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  };
  b.generateView = function() {
    this.snap = Entry.SVG("hwMonitor");
    this._svgGroup = this.snap.elem("g");
    this._portMap = {n:[], e:[], s:[], w:[]};
    var a = this._hwModule.monitorTemplate, b = {href:Entry.mediaFilePath + a.imgPath, x:-a.width / 2, y:-a.height / 2, width:a.width, height:a.height};
    this._portViews = {};
    this.hwView = this._svgGroup.elem("image");
    this.hwView = this.hwView.attr(b);
    this._template = a;
    a = a.ports;
    this.pathGroup = null;
    this.pathGroup = this._svgGroup.elem("g");
    var b = [], d;
    for (d in a) {
      var e = this.generatePortView(a[d], "_svgGroup");
      this._portViews[d] = e;
      b.push(e);
    }
    b.sort(function(a, b) {
      return a.box.x - b.box.x;
    });
    var f = this._portMap;
    b.map(function(a) {
      (1 > (Math.atan2(-a.box.y, a.box.x) / Math.PI + 2) % 2 ? f.n : f.s).push(a);
    });
    this.resize();
  };
  b.toggleMode = function(a) {
    var b = this._hwModule.monitorTemplate;
    "list" == a ? (b.TempPort = null, this._hwModule.monitorTemplate.ports && (this._hwModule.monitorTemplate.TempPort = this._hwModule.monitorTemplate.ports, this._hwModule.monitorTemplate.listPorts = this.addPortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._svgGroup && $(this._svgGroup).remove(), $(this._pathGroup).remove(), this._hwModule.monitorTemplate.mode = "list", this.generateListView()) : (this._hwModule.monitorTemplate.TempPort && 
    (this._hwModule.monitorTemplate.ports = this._hwModule.monitorTemplate.TempPort, this._hwModule.monitorTemplate.listPorts = this.removePortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._hwModule.monitorTemplate.mode = "both", this.generateListView(), this.generateView());
  };
  b.setHwmonitor = function(a) {
    this._hwmodule = a;
  };
  b.changeMode = function(a) {
    "both" == this._hwModule.monitorTemplate.mode ? this.toggleMode("list") : "list" == this._hwModule.monitorTemplate.mode && this.toggleMode("both");
  };
  b.addPortEle = function(a, b) {
    if ("object" != typeof b) {
      return a;
    }
    for (var d in b) {
      a[d] = b[d];
    }
    return a;
  };
  b.removePortEle = function(a, b) {
    if ("object" != typeof b) {
      return a;
    }
    for (var d in b) {
      delete a[d];
    }
    return a;
  };
  b.generateListView = function() {
    this._portMapList = {n:[]};
    this._svglistGroup = null;
    this.listsnap = Entry.SVG("hwMonitor");
    this._svglistGroup = this.listsnap.elem("g");
    var a = this._hwModule.monitorTemplate;
    this._template = a;
    a = a.listPorts;
    this.pathGroup = this._svglistGroup.elem("g");
    var b = [], d;
    for (d in a) {
      var e = this.generatePortView(a[d], "_svglistGroup");
      this._listPortViews[d] = e;
      b.push(e);
    }
    var f = this._portMapList;
    b.map(function(a) {
      f.n.push(a);
    });
    this.resizeList();
  };
  b.generatePortView = function(a, b) {
    var d = this[b].elem("g");
    d.addClass("hwComponent");
    var e = null, e = this.pathGroup.elem("path").attr({d:"m0,0", fill:"none", stroke:"input" === a.type ? "#00979d" : "#A751E3", "stroke-width":3}), f = d.elem("rect").attr({x:0, y:0, width:150, height:22, rx:4, ry:4, fill:"#fff", stroke:"#a0a1a1"}), g = d.elem("text").attr({x:4, y:12, fill:"#000", "class":"hwComponentName", "alignment-baseline":"central"});
    g.textContent = a.name;
    g = g.getComputedTextLength();
    d.elem("rect").attr({x:g + 8, y:2, width:30, height:18, rx:9, ry:9, fill:"input" === a.type ? "#00979d" : "#A751E3"});
    var h = d.elem("text").attr({x:g + 13, y:12, fill:"#fff", "class":"hwComponentValue", "alignment-baseline":"central"});
    h.textContent = 0;
    g += 40;
    f.attr({width:g});
    return {group:d, value:h, type:a.type, path:e, box:{x:a.pos.x - this._template.width / 2, y:a.pos.y - this._template.height / 2, width:g}, width:g};
  };
  b.getView = function() {
    return this.svgDom;
  };
  b.update = function() {
    var a = Entry.hw.portData, b = Entry.hw.sendQueue, d = this._hwModule.monitorTemplate.mode, e = this._hwModule.monitorTemplate.keys || [], f = [];
    if ("list" == d) {
      f = this._listPortViews;
    } else {
      if ("both" == d) {
        if (f = this._listPortViews, this._portViews) {
          for (var g in this._portViews) {
            f[g] = this._portViews[g];
          }
        }
      } else {
        f = this._portViews;
      }
    }
    if (b) {
      for (g in b) {
        0 != b[g] && f[g] && (f[g].type = "output");
      }
    }
    for (var h in f) {
      if (d = f[h], "input" == d.type) {
        var k = a[h];
        0 < e.length && $.each(e, function(a, b) {
          if ($.isPlainObject(k)) {
            k = k[b] || 0;
          } else {
            return !1;
          }
        });
        d.value.textContent = k ? k : 0;
        d.group.getElementsByTagName("rect")[1].attr({fill:"#00979D"});
      } else {
        k = b[h], 0 < e.length && $.each(e, function(a, b) {
          if ($.isPlainObject(k)) {
            k = k[b] || 0;
          } else {
            return !1;
          }
        }), d.value.textContent = k ? k : 0, d.group.getElementsByTagName("rect")[1].attr({fill:"#A751E3"});
      }
    }
  };
  b.resize = function() {
    this.hwView && this.hwView.attr({transform:"scale(" + this.scale + ")"});
    if (this.svgDom) {
      var a = this.svgDom.get(0).getBoundingClientRect()
    }
    this._svgGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 1.8 + ")"});
    this._rect = a;
    0 >= this._template.height || 0 >= a.height || (this.scale = a.height / this._template.height * this._template.height / 1E3, this.align());
  };
  b.resizeList = function() {
    var a = this.svgDom.get(0).getBoundingClientRect();
    this._svglistGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 2 + ")"});
    this._rect = a;
    this.alignList();
  };
  b.align = function() {
    var a = [], a = this._portMap.s.concat();
    this._alignNS(a, this.scale / 3 * this._template.height + 5, 27);
    a = this._portMap.n.concat();
    this._alignNS(a, -this._template.height * this.scale / 3 - 32, -27);
    a = this._portMap.e.concat();
    this._alignEW(a, -this._template.width * this.scale / 3 - 5, -27);
    a = this._portMap.w.concat();
    this._alignEW(a, this._template.width * this.scale / 3 - 32, -27);
  };
  b.alignList = function() {
    for (var a = {}, a = this._hwModule.monitorTemplate.listPorts, b = a.length, d = 0;d < a.length;d++) {
      a[d].group.attr({transform:"translate(" + this._template.width * (d / b - .5) + "," + (-this._template.width / 2 - 30) + ")"});
    }
    a = this._portMapList.n.concat();
    this._alignNSList(a, -this._template.width * this.scale / 2 - 32, -27);
  };
  b._alignEW = function(a, b, d) {
    var e = a.length, f = this._rect.height - 50;
    tP = -f / 2;
    bP = f / 2;
    height = this._rect.height;
    listVLine = wholeHeight = 0;
    mode = this._hwModule.monitorTemplate;
    for (f = 0;f < e;f++) {
      wholeHeight += a[f].height + 5;
    }
    wholeHeight < bP - tP && (bP = wholeHeight / 2 + 3, tP = -wholeHeight / 2 - 3);
    for (;1 < e;) {
      var g = a.shift(), f = a.pop(), h = tP, k = bP, l = d;
      wholeWidth <= bP - tP ? (tP += g.width + 5, bP -= f.width + 5, l = 0) : 0 === a.length ? (tP = (tP + bP) / 2 - 3, bP = tP + 6) : (tP = Math.max(tP, -width / 2 + g.width) + 15, bP = Math.min(bP, width / 2 - f.width) - 15);
      wholeWidth -= g.width + f.width + 10;
      b += l;
    }
    a.length && a[0].group.attr({transform:"translate(" + b + ",60)"});
    g && rPort && (this._movePort(g, b, tP, h), this._movePort(rPort, b, bP, k));
  };
  b._alignNS = function(a, b, d) {
    for (var e = -this._rect.width / 2, f = this._rect.width / 2, g = this._rect.width, h = 0, k = 0;k < a.length;k++) {
      h += a[k].width + 5;
    }
    h < f - e && (f = h / 2 + 3, e = -h / 2 - 3);
    for (;1 < a.length;) {
      var k = a.shift(), l = a.pop(), n = e, m = f, q = d;
      h <= f - e ? (e += k.width + 5, f -= l.width + 5, q = 0) : 0 === a.length ? (e = (e + f) / 2 - 3, f = e + 6) : (e = Math.max(e, -g / 2 + k.width) + 15, f = Math.min(f, g / 2 - l.width) - 15);
      this._movePort(k, e, b, n);
      this._movePort(l, f, b, m);
      h -= k.width + l.width + 10;
      b += q;
    }
    a.length && this._movePort(a[0], (f + e - a[0].width) / 2, b, 100);
  };
  b._alignNSList = function(a, b) {
    var d = this._rect.width;
    initX = -this._rect.width / 2 + 10;
    initY = -this._rect.height / 2 + 10;
    for (var e = listLine = wholeWidth = 0;e < a.length;e++) {
      wholeWidth += a[e].width;
    }
    for (var f = 0, g = 0, h = initX, k = 0, l = 0, n = 0, e = 0;e < a.length;e++) {
      l = a[e], e != a.length - 1 && (n = a[e + 1]), g += l.width, lP = initX, k = initY + 30 * f, l.group.attr({transform:"translate(" + lP + "," + k + ")"}), initX += l.width + 10, g > d - (l.width + n.width / 2.2) && (f += 1, initX = h, g = 0);
    }
  };
  b._movePort = function(a, b, d, e) {
    var f = b, g = a.box.x * this.scale, h = a.box.y * this.scale;
    b > e ? (f = b - a.width, b = b > g && g > e ? "M" + g + "," + d + "L" + g + "," + h : "M" + (b + e) / 2 + "," + d + "l0," + (h > d ? 28 : -3) + "H" + g + "L" + g + "," + h) : b = b < g && g < e ? "m" + g + "," + d + "L" + g + "," + h : "m" + (e + b) / 2 + "," + d + "l0," + (h > d ? 28 : -3) + "H" + g + "L" + g + "," + h;
    a.group.attr({transform:"translate(" + f + "," + d + ")"});
    a.path.attr({d:b});
  };
})(Entry.HWMonitor.prototype);
Entry.HW = function() {
  this.connectTrial = 0;
  this.isFirstConnect = !0;
  this.initSocket();
  this.connected = !1;
  this.portData = {};
  this.sendQueue = {};
  this.outputQueue = {};
  this.settingQueue = {};
  this.socketType = this.hwModule = this.selectedDevice = null;
  Entry.addEventListener("stop", this.setZero);
  this.hwInfo = {11:Entry.Arduino, 19:Entry.ArduinoExt, 12:Entry.SensorBoard, 13:Entry.CODEino, 14:Entry.joystick, 15:Entry.dplay, 16:Entry.nemoino, 17:Entry.Xbot, 18:Entry.ardublock, 24:Entry.Hamster, 25:Entry.Albert, 31:Entry.Bitbrick, 42:Entry.Arduino, 51:Entry.Neobot, 71:Entry.Robotis_carCont, 72:Entry.Robotis_openCM70, 81:Entry.Arduino};
};
Entry.HW.TRIAL_LIMIT = 1;
p = Entry.HW.prototype;
p.initSocket = function() {
  try {
    if (this.connectTrial >= Entry.HW.TRIAL_LIMIT) {
      this.isFirstConnect || Entry.toast.alert(Lang.Menus.connect_hw, Lang.Menus.connect_fail, !1), this.isFirstConnect = !1;
    } else {
      var b = this, a, c;
      this.connected = !1;
      this.connectTrial++;
      if (-1 < location.protocol.indexOf("https")) {
        c = new WebSocket("wss://hardware.play-entry.org:23518");
      } else {
        try {
          a = new WebSocket("ws://127.0.0.1:23518"), a.binaryType = "arraybuffer", a.onopen = function() {
            b.socketType = "WebSocket";
            b.initHardware(a);
          }.bind(this), a.onmessage = function(a) {
            a = JSON.parse(a.data);
            b.checkDevice(a);
            b.updatePortData(a);
          }.bind(this), a.onclose = function() {
            "WebSocket" === b.socketType && (this.socket = null, b.initSocket());
          };
        } catch (d) {
        }
        try {
          c = new WebSocket("wss://hardware.play-entry.org:23518");
        } catch (d) {
        }
      }
      c.binaryType = "arraybuffer";
      c.onopen = function() {
        b.socketType = "WebSocketSecurity";
        b.initHardware(c);
      };
      c.onmessage = function(a) {
        a = JSON.parse(a.data);
        b.checkDevice(a);
        b.updatePortData(a);
      };
      c.onclose = function() {
        "WebSocketSecurity" === b.socketType && (this.socket = null, b.initSocket());
      };
      Entry.dispatchEvent("hwChanged");
    }
  } catch (d) {
  }
};
p.retryConnect = function() {
  this.connectTrial = 0;
  this.initSocket();
};
p.initHardware = function(b) {
  this.socket = b;
  this.connectTrial = 0;
  this.connected = !0;
  Entry.dispatchEvent("hwChanged");
  Entry.playground && Entry.playground.object && Entry.playground.setMenu(Entry.playground.object.objectType);
};
p.setDigitalPortValue = function(b, a) {
  this.sendQueue[b] = a;
  this.removePortReadable(b);
};
p.getAnalogPortValue = function(b) {
  return this.connected ? this.portData["a" + b] : 0;
};
p.getDigitalPortValue = function(b) {
  if (!this.connected) {
    return 0;
  }
  this.setPortReadable(b);
  return void 0 !== this.portData[b] ? this.portData[b] : 0;
};
p.setPortReadable = function(b) {
  this.sendQueue.readablePorts || (this.sendQueue.readablePorts = []);
  var a = !1, c;
  for (c in this.sendQueue.readablePorts) {
    if (this.sendQueue.readablePorts[c] == b) {
      a = !0;
      break;
    }
  }
  a || this.sendQueue.readablePorts.push(b);
};
p.removePortReadable = function(b) {
  if (this.sendQueue.readablePorts || Array.isArray(this.sendQueue.readablePorts)) {
    var a, c;
    for (c in this.sendQueue.readablePorts) {
      if (this.sendQueue.readablePorts[c] == b) {
        a = +c;
        break;
      }
    }
    this.sendQueue.readablePorts = void 0 != a ? this.sendQueue.readablePorts.slice(0, a).concat(this.sendQueue.readablePorts.slice(a + 1, this.sendQueue.readablePorts.length)) : [];
  }
};
p.update = function() {
  this.socket && 1 == this.socket.readyState && this.socket.send(JSON.stringify(this.sendQueue));
};
p.updatePortData = function(b) {
  this.portData = b;
  this.hwMonitor && "hw" == Entry.propertyPanel.selected && this.hwMonitor.update();
};
p.closeConnection = function() {
  this.socket && this.socket.close();
};
p.downloadConnector = function() {
  window.open("http://download.play-entry.org/apps/Entry_HW_1.5.8_Setup.exe", "_blank").focus();
};
p.downloadSource = function() {
  window.open("http://play-entry.com/down/board.ino", "_blank").focus();
};
p.setZero = function() {
  Entry.hw.hwModule && Entry.hw.hwModule.setZero();
};
p.checkDevice = function(b) {
  void 0 !== b.company && (b = "" + b.company + b.model, b != this.selectedDevice && (this.selectedDevice = b, this.hwModule = this.hwInfo[b], Entry.dispatchEvent("hwChanged"), Entry.toast.success("\ud558\ub4dc\uc6e8\uc5b4 \uc5f0\uacb0 \uc131\uacf5", "\ud558\ub4dc\uc6e8\uc5b4 \uc544\uc774\ucf58\uc744 \ub354\ube14\ud074\ub9ad\ud558\uba74, \uc13c\uc11c\uac12\ub9cc \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.", !0), this.hwModule.monitorTemplate && (this.hwMonitor ? (this.hwMonitor._hwModule = 
  this.hwModule, this.hwMonitor.initView()) : this.hwMonitor = new Entry.HWMonitor(this.hwModule), Entry.propertyPanel.addMode("hw", this.hwMonitor), b = this.hwModule.monitorTemplate, "both" == b.mode ? (b.mode = "list", this.hwMonitor.generateListView(), b.mode = "general", this.hwMonitor.generateView(), b.mode = "both") : "list" == b.mode ? this.hwMonitor.generateListView() : this.hwMonitor.generateView())));
};
p.banHW = function() {
  var b = this.hwInfo, a;
  for (a in b) {
    Entry.playground.mainWorkspace.blockMenu.banClass(b[a].name, !0);
  }
};
Entry.BlockModel = function() {
  Entry.Model(this);
};
Entry.BlockModel.prototype.schema = {id:null, x:0, y:0, type:null, params:{}, statements:{}, prev:null, next:null, view:null};
Entry.BlockRenderModel = function() {
  Entry.Model(this);
};
Entry.BlockRenderModel.prototype.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, width:0, height:0, magneting:!1};
Entry.BoxModel = function() {
  Entry.Model(this);
};
Entry.BoxModel.prototype.schema = {id:0, type:Entry.STATIC.BOX_MODEL, x:0, y:0, width:0, height:0};
Entry.DragInstance = function(b) {
  Entry.Model(this);
  this.set(b);
};
Entry.DragInstance.prototype.schema = {type:Entry.STATIC.DRAG_INSTANCE, startX:0, startY:0, offsetX:0, offsetY:0, absX:0, absY:0, prev:null, height:0, mode:0, isNew:!1};
Entry.ThreadModel = function() {
  Entry.Model(this);
};
Entry.ThreadModel.prototype.schema = {id:0, type:Entry.STATIC.THREAD_MODEL, x:0, y:0, width:0, minWidth:0, height:0};
Entry.Stage = function() {
  this.variables = {};
  this.background = new createjs.Shape;
  this.background.graphics.beginFill("#ffffff").drawRect(-480, -240, 960, 480);
  this.objectContainers = [];
  this.selectedObjectContainer = null;
  this.variableContainer = new createjs.Container;
  this.dialogContainer = new createjs.Container;
  this.selectedObject = null;
  this.isObjectClick = !1;
};
Entry.Stage.prototype.initStage = function(b) {
  this.canvas = new createjs.Stage(b.id);
  this.canvas.x = 320;
  this.canvas.y = 180;
  this.canvas.scaleX = this.canvas.scaleY = 2 / 1.5;
  createjs.Touch.enable(this.canvas);
  this.canvas.enableMouseOver(10);
  this.canvas.mouseMoveOutside = !0;
  this.canvas.addChild(this.background);
  this.canvas.addChild(this.variableContainer);
  this.canvas.addChild(this.dialogContainer);
  this.inputField = null;
  this.initCoordinator();
  this.initHandle();
  this.mouseCoordinate = {x:0, y:0};
  if (Entry.isPhone()) {
    b.ontouchstart = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    }, b.ontouchend = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
  } else {
    var a = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    };
    b.onmousedown = a;
    b.ontouchstart = a;
    a = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
    b.onmouseup = a;
    b.ontouchend = a;
    $(document).click(function(a) {
      Entry.stage.focused = "entryCanvas" === a.target.id ? !0 : !1;
    });
  }
  Entry.addEventListener("canvasClick", function(a) {
    Entry.stage.isObjectClick = !1;
  });
  Entry.windowResized.attach(this, function() {
    Entry.stage.updateBoundRect();
  });
  a = function(a) {
    a.preventDefault();
    var b = Entry.stage.getBoundRect(), e;
    -1 < Entry.getBrowserType().indexOf("IE") ? (e = 480 * ((a.pageX - b.left - document.documentElement.scrollLeft) / b.width - .5), a = -270 * ((a.pageY - b.top - document.documentElement.scrollTop) / b.height - .5)) : a.changedTouches ? (e = 480 * ((a.changedTouches[0].pageX - b.left - document.body.scrollLeft) / b.width - .5), a = -270 * ((a.changedTouches[0].pageY - b.top - document.body.scrollTop) / b.height - .5)) : (e = 480 * ((a.pageX - b.left - document.body.scrollLeft) / b.width - .5), 
    a = -270 * ((a.pageY - b.top - document.body.scrollTop) / b.height - .5));
    Entry.stage.mouseCoordinate = {x:e.toFixed(1), y:a.toFixed(1)};
    Entry.dispatchEvent("stageMouseMove");
  };
  b.onmousemove = a;
  b.ontouchmove = a;
  b.onmouseout = function(a) {
    Entry.dispatchEvent("stageMouseOut");
  };
  Entry.addEventListener("updateObject", function(a) {
    Entry.engine.isState("stop") && Entry.stage.updateObject();
  });
  Entry.addEventListener("canvasInputComplete", function(a) {
    try {
      var b = Entry.stage.inputField.value();
      Entry.stage.hideInputField();
      if (b) {
        var e = Entry.container;
        e.setInputValue(b);
        e.inputValue.complete = !0;
      }
    } catch (f) {
    }
  });
  this.initWall();
  this.render();
};
Entry.Stage.prototype.render = function() {
  Entry.stage.timer && clearTimeout(Entry.stage.timer);
  var b = (new Date).getTime();
  Entry.stage.update();
  b = (new Date).getTime() - b;
  Entry.stage.timer = setTimeout(Entry.stage.render, 16 - b % 16 + 16 * Math.floor(b / 16));
};
Entry.Stage.prototype.update = function() {
  Entry.requestUpdate ? (Entry.engine.isState("stop") && this.objectUpdated ? (this.canvas.update(), this.objectUpdated = !1) : this.canvas.update(), this.inputField && !this.inputField._isHidden && this.inputField.render(), Entry.requestUpdateTwice ? Entry.requestUpdateTwice = !1 : Entry.requestUpdate = !1) : Entry.requestUpdate = !1;
};
Entry.Stage.prototype.loadObject = function(b) {
  var a = b.entity.object;
  this.getObjectContainerByScene(b.scene).addChild(a);
  this.canvas.update();
};
Entry.Stage.prototype.loadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).addChild(b.object);
  this.sortZorder();
};
Entry.Stage.prototype.unloadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).removeChild(b.object);
};
Entry.Stage.prototype.loadVariable = function(b) {
  var a = b.view_;
  this.variables[b.id] = a;
  this.variableContainer.addChild(a);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.removeVariable = function(b) {
  this.variableContainer.removeChild(b.view_);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.loadDialog = function(b) {
  this.dialogContainer.addChild(b.object);
};
Entry.Stage.prototype.unloadDialog = function(b) {
  this.dialogContainer.removeChild(b.object);
};
Entry.Stage.prototype.sortZorder = function() {
  for (var b = Entry.container.getCurrentObjects(), a = this.selectedObjectContainer, c = 0, d = b.length - 1;0 <= d;d--) {
    for (var e = b[d], f = e.entity, e = e.clonedEntities, g = 0, h = e.length;g < h;g++) {
      e[g].shape && a.setChildIndex(e[g].shape, c++), a.setChildIndex(e[g].object, c++);
    }
    f.shape && a.setChildIndex(f.shape, c++);
    a.setChildIndex(f.object, c++);
  }
};
Entry.Stage.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "workspace_coordinate.png");
  a.scaleX = .5;
  a.scaleY = .5;
  a.x = -240;
  a.y = -135;
  b.addChild(a);
  this.canvas.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Stage.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.selectObject = function(b) {
  this.selectedObject = b ? b : null;
  this.updateObject();
};
Entry.Stage.prototype.initHandle = function() {
  this.handle = new EaselHandle(this.canvas);
  this.handle.setChangeListener(this, this.updateHandle);
  this.handle.setEditStartListener(this, this.startEdit);
  this.handle.setEditEndListener(this, this.endEdit);
};
Entry.Stage.prototype.updateObject = function() {
  Entry.requestUpdate = !0;
  this.handle.setDraggable(!0);
  if (!this.editEntity) {
    var b = this.selectedObject;
    if (b) {
      "textBox" == b.objectType ? this.handle.toggleCenter(!1) : this.handle.toggleCenter(!0);
      "free" == b.getRotateMethod() ? this.handle.toggleRotation(!0) : this.handle.toggleRotation(!1);
      this.handle.toggleDirection(!0);
      b.getLock() ? (this.handle.toggleRotation(!1), this.handle.toggleDirection(!1), this.handle.toggleResize(!1), this.handle.toggleCenter(!1), this.handle.setDraggable(!1)) : this.handle.toggleResize(!0);
      this.handle.setVisible(!0);
      var a = b.entity;
      this.handle.setWidth(a.getScaleX() * a.getWidth());
      this.handle.setHeight(a.getScaleY() * a.getHeight());
      var c, d;
      if ("textBox" == a.type) {
        if (a.getLineBreak()) {
          c = a.regX * a.scaleX, d = -a.regY * a.scaleY;
        } else {
          var e = a.getTextAlign();
          d = -a.regY * a.scaleY;
          switch(e) {
            case Entry.TEXT_ALIGN_LEFT:
              c = -a.getWidth() / 2 * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_CENTER:
              c = a.regX * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_RIGHT:
              c = a.getWidth() / 2 * a.scaleX;
          }
        }
      } else {
        c = (a.regX - a.width / 2) * a.scaleX, d = (a.height / 2 - a.regY) * a.scaleY;
      }
      e = a.getRotation() / 180 * Math.PI;
      this.handle.setX(a.getX() - c * Math.cos(e) - d * Math.sin(e));
      this.handle.setY(-a.getY() - c * Math.sin(e) + d * Math.cos(e));
      this.handle.setRegX((a.regX - a.width / 2) * a.scaleX);
      this.handle.setRegY((a.regY - a.height / 2) * a.scaleY);
      this.handle.setRotation(a.getRotation());
      this.handle.setDirection(a.getDirection());
      this.objectUpdated = !0;
      this.handle.setVisible(b.entity.getVisible());
      b.entity.getVisible() && this.handle.render();
    } else {
      this.handle.setVisible(!1);
    }
  }
};
Entry.Stage.prototype.updateHandle = function() {
  this.editEntity = !0;
  var b = this.handle, a = this.selectedObject.entity;
  if (a.lineBreak) {
    a.setHeight(b.height / a.getScaleY()), a.setWidth(b.width / a.getScaleX());
  } else {
    if (0 !== a.width) {
      var c = Math.abs(b.width / a.width);
      a.flip && (c *= -1);
      a.setScaleX(c);
    }
    0 !== a.height && a.setScaleY(b.height / a.height);
  }
  c = b.rotation / 180 * Math.PI;
  if ("textBox" == a.type) {
    var d = b.regX / a.scaleX, d = b.regY / a.scaleY;
    if (a.getLineBreak()) {
      a.setX(b.x), a.setY(-b.y);
    } else {
      switch(a.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          a.setX(b.x - b.width / 2 * Math.cos(c));
          a.setY(-b.y + b.width / 2 * Math.sin(c));
          break;
        case Entry.TEXT_ALIGN_CENTER:
          a.setX(b.x);
          a.setY(-b.y);
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          a.setX(b.x + b.width / 2 * Math.cos(c)), a.setY(-b.y - b.width / 2 * Math.sin(c));
      }
    }
  } else {
    d = a.width / 2 + b.regX / a.scaleX, a.setX(b.x + b.regX * Math.cos(c) - b.regY * Math.sin(c)), a.setRegX(d), d = a.height / 2 + b.regY / a.scaleY, a.setY(-b.y - b.regX * Math.sin(c) - b.regY * Math.cos(c)), a.setRegY(d);
  }
  a.setDirection(b.direction);
  a.setRotation(b.rotation);
  this.selectedObject.entity.doCommand();
  this.editEntity = !1;
};
Entry.Stage.prototype.startEdit = function() {
  this.selectedObject.entity.initCommand();
};
Entry.Stage.prototype.endEdit = function() {
  this.selectedObject.entity.checkCommand();
};
Entry.Stage.prototype.initWall = function() {
  var b = new createjs.Container, a = new Image;
  a.src = Entry.mediaFilePath + "media/bound.png";
  b.up = new createjs.Bitmap;
  b.up.scaleX = 16;
  b.up.y = -165;
  b.up.x = -240;
  b.up.image = a;
  b.addChild(b.up);
  b.down = new createjs.Bitmap;
  b.down.scaleX = 16;
  b.down.y = 135;
  b.down.x = -240;
  b.down.image = a;
  b.addChild(b.down);
  b.right = new createjs.Bitmap;
  b.right.scaleY = 9;
  b.right.y = -135;
  b.right.x = 240;
  b.right.image = a;
  b.addChild(b.right);
  b.left = new createjs.Bitmap;
  b.left.scaleY = 9;
  b.left.y = -135;
  b.left.x = -270;
  b.left.image = a;
  b.addChild(b.left);
  this.canvas.addChild(b);
  this.wall = b;
};
Entry.Stage.prototype.showInputField = function(b) {
  b = 1 / 1.5;
  this.inputField || (this.inputField = new CanvasInput({canvas:document.getElementById("entryCanvas"), fontSize:30 * b, fontFamily:"NanumGothic", fontColor:"#212121", width:556 * b, height:26 * b, padding:8 * b, borderWidth:1 * b, borderColor:"#000", borderRadius:3 * b, boxShadow:"none", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:202 * b, y:450 * b, topPosition:!0, onsubmit:function() {
    Entry.dispatchEvent("canvasInputComplete");
  }}));
  b = new createjs.Container;
  var a = new Image;
  a.src = Entry.mediaFilePath + "confirm_button.png";
  var c = new createjs.Bitmap;
  c.scaleX = .23;
  c.scaleY = .23;
  c.x = 160;
  c.y = 89;
  c.cursor = "pointer";
  c.image = a;
  b.addChild(c);
  b.on("mousedown", function(a) {
    Entry.dispatchEvent("canvasInputComplete");
  });
  this.inputSubmitButton || (this.inputField.value(""), this.canvas.addChild(b), this.inputSubmitButton = b);
  this.inputField.show();
  Entry.requestUpdateTwice = !0;
};
Entry.Stage.prototype.hideInputField = function() {
  this.inputField && this.inputField.value() && this.inputField.value("");
  this.inputSubmitButton && (this.canvas.removeChild(this.inputSubmitButton), this.inputSubmitButton = null);
  this.inputField && this.inputField.hide();
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.initObjectContainers = function() {
  var b = Entry.scene.scenes_;
  if (b && 0 !== b.length) {
    for (var a = 0;a < b.length;a++) {
      this.objectContainers[a] = this.createObjectContainer(b[a]);
    }
    this.selectedObjectContainer = this.objectContainers[0];
  } else {
    b = this.createObjectContainer(Entry.scene.selectedScene), this.objectContainers.push(b), this.selectedObjectContainer = b;
  }
  this.canvas.addChild(this.selectedObjectContainer);
  this.selectObjectContainer(Entry.scene.selectedScene);
};
Entry.Stage.prototype.selectObjectContainer = function(b) {
  if (this.canvas) {
    for (var a = this.objectContainers, c = 0;c < a.length;c++) {
      this.canvas.removeChild(a[c]);
    }
    this.selectedObjectContainer = this.getObjectContainerByScene(b);
    this.canvas.addChildAt(this.selectedObjectContainer, 2);
  }
};
Entry.Stage.prototype.reAttachToCanvas = function() {
  for (var b = [this.selectedObjectContainer, this.variableContainer, this.coordinator, this.handle, this.dialogContainer], a = 0;a < b.length;a++) {
    this.canvas.removeChild(b[a]), this.canvas.addChild(b[a]);
  }
  console.log(this.canvas.getChildIndex(this.selectedObjectContainer));
};
Entry.Stage.prototype.createObjectContainer = function(b) {
  var a = new createjs.Container;
  a.scene = b;
  return a;
};
Entry.Stage.prototype.removeObjectContainer = function(b) {
  var a = this.objectContainers;
  b = this.getObjectContainerByScene(b);
  this.canvas.removeChild(b);
  a.splice(this.objectContainers.indexOf(b), 1);
};
Entry.Stage.prototype.getObjectContainerByScene = function(b) {
  for (var a = this.objectContainers, c = 0;c < a.length;c++) {
    if (a[c].scene.id == b.id) {
      return a[c];
    }
  }
};
Entry.Stage.prototype.moveSprite = function(b) {
  if (this.selectedObject && Entry.stage.focused && !this.selectedObject.getLock()) {
    var a = 5;
    b.shiftKey && (a = 1);
    var c = this.selectedObject.entity;
    switch(b.keyCode) {
      case 38:
        c.setY(c.getY() + a);
        break;
      case 40:
        c.setY(c.getY() - a);
        break;
      case 37:
        c.setX(c.getX() - a);
        break;
      case 39:
        c.setX(c.getX() + a);
    }
    this.updateObject();
  }
};
Entry.Stage.prototype.getBoundRect = function(b) {
  this._boundRect || this.updateBoundRect();
  return this._boundRect;
};
Entry.Stage.prototype.updateBoundRect = function(b) {
  this._boundRect = this.canvas.canvas.getBoundingClientRect();
};
Entry.Variable = function(b) {
  Entry.assert("string" == typeof b.name, "Variable name must be given");
  this.name_ = b.name;
  this.id_ = b.id ? b.id : Entry.generateHash();
  this.type = b.variableType ? b.variableType : "variable";
  this.object_ = b.object || null;
  this.isCloud_ = b.isCloud || !1;
  this._valueWidth = this._nameWidth = null;
  var a = Entry.parseNumber(b.value);
  this.value_ = "number" == typeof a ? a : b.value ? b.value : 0;
  "slide" == this.type ? (this.minValue_ = +(b.minValue ? b.minValue : 0), this.maxValue_ = +(b.maxValue ? b.maxValue : 100)) : "list" == this.type && (this.array_ = b.array ? b.array : []);
  b.isClone || (this.visible_ = b.visible || "boolean" == typeof b.visible ? b.visible : !0, this.x_ = b.x ? b.x : null, this.y_ = b.y ? b.y : null, "list" == this.type && (this.width_ = b.width ? b.width : 100, this.height_ = b.height ? b.height : 120, this.scrollPosition = 0), this.BORDER = 6, this.FONT = "10pt NanumGothic");
};
Entry.Variable.prototype.generateView = function(b) {
  var a = this.type;
  if ("variable" == a || "timer" == a || "answer" == a) {
    this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.wrapper_ = new createjs.Shape, this.view_.addChild(this.wrapper_), this.textView_ = new createjs.Text("asdf", this.FONT, "#000000"), this.textView_.textBaseline = "alphabetic", this.textView_.x = 4, this.textView_.y = 1, this.view_.addChild(this.textView_), this.valueView_ = new createjs.Text("asdf", "10pt NanumGothic", "#ffffff"), this.valueView_.textBaseline = 
    "alphabetic", a = Entry.variableContainer.variables_.length, this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11))), this.view_.visible = this.visible_, this.view_.addChild(this.valueView_), this.view_.on("mousedown", function(a) {
      "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
    }), this.view_.on("pressmove", function(a) {
      "workspace" == Entry.type && (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
    });
  } else {
    if ("slide" == a) {
      var c = this;
      this.view_ = new createjs.Container;
      this.rect_ = new createjs.Shape;
      this.view_.addChild(this.rect_);
      this.view_.variable = this;
      this.wrapper_ = new createjs.Shape;
      this.view_.addChild(this.wrapper_);
      this.textView_ = new createjs.Text("name", this.FONT, "#000000");
      this.textView_.textBaseline = "alphabetic";
      this.textView_.x = 4;
      this.textView_.y = 1;
      this.view_.addChild(this.textView_);
      this.valueView_ = new createjs.Text("value", "10pt NanumGothic", "#ffffff");
      this.valueView_.textBaseline = "alphabetic";
      this.view_.on("mousedown", function(a) {
        "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)});
      });
      this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || c.isAdjusting || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      });
      this.view_.visible = this.visible_;
      this.view_.addChild(this.valueView_);
      a = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26;
      a = Math.max(a, 90);
      this.maxWidth = a - 20;
      this.slideBar_ = new createjs.Shape;
      this.slideBar_.graphics.beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5);
      this.view_.addChild(this.slideBar_);
      a = this.getSlidePosition(this.maxWidth);
      this.valueSetter_ = new createjs.Shape;
      this.valueSetter_.graphics.beginFill("#1bafea").s("#A0A1A1").ss(1).dc(a, 10.5, 3);
      this.valueSetter_.cursor = "pointer";
      this.valueSetter_.on("mousedown", function(a) {
        Entry.engine.isState("run") && (c.isAdjusting = !0, this.offsetX = -(this.x - .75 * a.stageX + 240));
      });
      this.valueSetter_.on("pressmove", function(a) {
        if (Entry.engine.isState("run")) {
          var b = this.offsetX;
          this.offsetX = -(this.x - .75 * a.stageX + 240);
          b !== this.offsetX && (a = c.getX(), c.setSlideCommandX(a + 10 > this.offsetX ? 0 : a + c.maxWidth + 10 > this.offsetX ? this.offsetX - a : c.maxWidth + 10));
        }
      });
      this.valueSetter_.on("pressup", function(a) {
        c.isAdjusting = !1;
      });
      this.view_.addChild(this.valueSetter_);
      a = Entry.variableContainer.variables_.length;
      this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11)));
    } else {
      this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.titleView_ = new createjs.Text("asdf", this.FONT, "#000"), this.titleView_.textBaseline = "alphabetic", this.titleView_.textAlign = "center", this.titleView_.width = this.width_ - 2 * this.BORDER, this.titleView_.y = this.BORDER + 10, this.titleView_.x = this.width_ / 2, this.view_.addChild(this.titleView_), this.resizeHandle_ = new createjs.Shape, this.resizeHandle_.graphics.f("#1bafea").ss(1, 
      0, 0).s("#1bafea").lt(0, -9).lt(-9, 0).lt(0, 0), this.view_.addChild(this.resizeHandle_), this.resizeHandle_.list = this, this.resizeHandle_.on("mouseover", function(a) {
        this.cursor = "nwse-resize";
      }), this.resizeHandle_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.offset = {x:.75 * a.stageX - this.list.getWidth(), y:.75 * a.stageY - this.list.getHeight()};
        this.parent.cursor = "nwse-resize";
      }), this.resizeHandle_.on("pressmove", function(a) {
        this.list.setWidth(.75 * a.stageX - this.offset.x);
        this.list.setHeight(.75 * a.stageY - this.offset.y);
        this.list.updateView();
      }), this.view_.on("mouseover", function(a) {
        this.cursor = "move";
      }), this.view_.on("mousedown", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
      }), this.view_.on("pressup", function(a) {
        this.cursor = "initial";
        this.variable.isResizing = !1;
      }), this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      }), this.elementView = new createjs.Container, a = new createjs.Text("asdf", this.FONT, "#000"), a.textBaseline = "middle", a.y = 5, this.elementView.addChild(a), this.elementView.indexView = a, a = new createjs.Shape, this.elementView.addChild(a), this.elementView.valueWrapper = a, a = new createjs.Text("fdsa", this.FONT, "#eee"), a.x = 24, a.y = 6, a.textBaseline = "middle", this.elementView.addChild(a), this.elementView.valueView = a, this.elementView.x = this.BORDER, this.scrollButton_ = 
      new createjs.Shape, this.scrollButton_.graphics.f("#aaa").rr(0, 0, 7, 30, 3.5), this.view_.addChild(this.scrollButton_), this.scrollButton_.y = 23, this.scrollButton_.list = this, this.scrollButton_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.cursor = "pointer";
        this.offsetY = isNaN(this.offsetY) || 0 > this.offsetY ? a.rawY / 2 : this.offsetY;
      }), this.scrollButton_.on("pressmove", function(a) {
        void 0 === this.moveAmount ? (this.y = a.target.y, this.moveAmount = !0) : this.y = a.rawY / 2 - this.offsetY + this.list.height_ / 100 * 23;
        23 > this.y && (this.y = 23);
        this.y > this.list.getHeight() - 40 && (this.y = this.list.getHeight() - 40);
        this.list.updateView();
      }), this.scrollButton_.on("pressup", function(a) {
        this.moveAmount = void 0;
      }), this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (a = Entry.variableContainer.lists_.length, this.setX(110 * -Math.floor(a / 6) + 120), this.setY(24 * b + 20 - 135 - 145 * Math.floor(a / 6)));
    }
  }
  this.setVisible(this.isVisible());
  this.updateView();
  Entry.stage.loadVariable(this);
};
Entry.Variable.prototype.updateView = function() {
  if (this.view_) {
    if (this.isVisible()) {
      if ("variable" == this.type) {
        this.view_.x = this.getX();
        this.view_.y = this.getY();
        if (this.object_) {
          var b = Entry.container.getObject(this.object_);
          this.textView_.text = b ? b.name + ":" + this.getName() : this.getName();
        } else {
          this.textView_.text = this.getName();
        }
        null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth());
        this.valueView_.x = this._nameWidth + 14;
        this.valueView_.y = 1;
        this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue();
        null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth());
        this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4);
        this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7);
      } else {
        if ("slide" == this.type) {
          this.view_.x = this.getX(), this.view_.y = this.getY(), this.object_ ? (b = Entry.container.getObject(this.object_), this.textView_.text = b ? b.name + ":" + this.getName() : this.getName()) : this.textView_.text = this.getName(), null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = 
          this.getValue(), null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth()), b = this._nameWidth + this._valueWidth + 26, b = Math.max(b, 90), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, b, 33, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7), b = this._nameWidth + this._valueWidth + 26, b = Math.max(b, 90), this.maxWidth = b - 20, 
          this.slideBar_.graphics.clear().beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5), b = this.getSlidePosition(this.maxWidth), this.valueSetter_.graphics.clear().beginFill("#1bafea").s("#A0A1A1").ss(1).dc(b, 10.5, 3);
        } else {
          if ("list" == this.type) {
            this.view_.x = this.getX();
            this.view_.y = this.getY();
            this.resizeHandle_.x = this.width_ - 2;
            this.resizeHandle_.y = this.height_ - 2;
            var a = this.getName();
            this.object_ && (b = Entry.container.getObject(this.object_)) && (a = b.name + ":" + a);
            a = 7 < a.length ? a.substr(0, 6) + ".." : a;
            this.titleView_.text = a;
            this.titleView_.x = this.width_ / 2;
            for (this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rect(0, 0, this.width_, this.height_);this.view_.children[4];) {
              this.view_.removeChild(this.view_.children[4]);
            }
            b = Math.floor((this.getHeight() - 20) / 20);
            b < this.array_.length ? (this.scrollButton_.y > this.getHeight() - 40 && (this.scrollButton_.y = this.getHeight() - 40), this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, -2, this.getWidth() - 20 - 10 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !0, this.scrollButton_.x = this.getWidth() - 12, this.scrollPosition = Math.floor((this.scrollButton_.y - 23) / (this.getHeight() - 23 - 40) * (this.array_.length - b))) : (this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, 
            -2, this.getWidth() - 20 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !1, this.scrollPosition = 0);
            for (a = this.scrollPosition;a < this.scrollPosition + b && a < this.array_.length;a++) {
              this.elementView.indexView.text = a + 1;
              var c = String(this.array_[a].data), d = Math.floor((this.getWidth() - 50) / 7), c = Entry.cutStringByLength(c, d), c = String(this.array_[a].data).length > c.length ? c + ".." : c;
              this.elementView.valueView.text = c;
              c = this.elementView.clone(!0);
              c.y = 20 * (a - this.scrollPosition) + 23;
              this.view_.addChild(c);
            }
          } else {
            "answer" == this.type ? (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.y = 1, this.isNumber() ? parseInt(this.getValue(), 10) == this.getValue() ? this.valueView_.text = this.getValue() : this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth()), null === this._valueWidth && (this._valueWidth = 
            this.valueView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#E457DC").ss(1, 2, 0).s("#E457DC").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7)) : (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), null === this._nameWidth && (this._nameWidth = 
            this.textView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth()), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#ffbb14").ss(1, 
            2, 0).s("orange").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7));
          }
        }
      }
    }
    Entry.requestUpdate = !0;
  }
};
Entry.Variable.prototype.getName = function() {
  return this.name_;
};
Entry.Variable.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "Variable name must be string");
  this.name_ = b;
  this._nameWidth = null;
  this.updateView();
  Entry.requestUpdateTwice = !0;
};
Entry.Variable.prototype.getId = function() {
  return this.id_;
};
Entry.Variable.prototype.getValue = function() {
  return this.isNumber() ? +this.value_ : this.value_;
};
Entry.Variable.prototype.isNumber = function() {
  return isNaN(this.value_) ? !1 : !0;
};
Entry.Variable.prototype.setValue = function(b) {
  "slide" != this.type ? this.value_ = b : (b = +b, this.value_ = b < this.minValue_ ? this.minValue_ : b > this.maxValue_ ? this.maxValue_ : b);
  this.isCloud_ && Entry.variableContainer.updateCloudVariables();
  this._valueWidth = null;
  this.updateView();
  Entry.requestUpdateTwice = !0;
};
Entry.Variable.prototype.isVisible = function() {
  return this.visible_;
};
Entry.Variable.prototype.setVisible = function(b) {
  Entry.assert("boolean" == typeof b, "Variable visible state must be boolean");
  this.visible !== b && (this.visible_ = this.view_.visible = b, this.updateView());
};
Entry.Variable.prototype.setX = function(b) {
  this.x_ = b;
  this.updateView();
};
Entry.Variable.prototype.getX = function() {
  return this.x_;
};
Entry.Variable.prototype.setY = function(b) {
  this.y_ = b;
  this.updateView();
};
Entry.Variable.prototype.getY = function() {
  return this.y_;
};
Entry.Variable.prototype.setWidth = function(b) {
  this.width_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getWidth = function() {
  return this.width_;
};
Entry.Variable.prototype.isInList = function(b, a) {
  this.getX();
  this.getY();
};
Entry.Variable.prototype.setHeight = function(b) {
  this.height_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getHeight = function() {
  return this.height_;
};
Entry.Variable.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
};
Entry.Variable.prototype.loadSnapshot = function() {
  this.snapshot_ && !this.isCloud_ && this.syncModel_(this.snapshot_);
};
Entry.Variable.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.id_ = b.id;
  this.setVisible(b.visible);
  this.setValue(b.value);
  this.setName(b.name);
  this.isCloud_ = b.isCloud;
  "list" == this.type && (this.setWidth(b.width), this.setHeight(b.height), this.array_ = b.array);
};
Entry.Variable.prototype.toJSON = function() {
  var b = {};
  b.name = this.name_;
  b.id = this.id_;
  b.visible = this.visible_;
  b.value = this.value_;
  b.variableType = this.type;
  "list" == this.type ? (b.width = this.getWidth(), b.height = this.getHeight(), b.array = JSON.parse(JSON.stringify(this.array_))) : "slide" == this.type && (b.minValue = this.minValue_, b.maxValue = this.maxValue_);
  b.isCloud = this.isCloud_;
  b.object = this.object_;
  b.x = this.x_;
  b.y = this.y_;
  return b;
};
Entry.Variable.prototype.remove = function() {
  Entry.stage.removeVariable(this);
};
Entry.Variable.prototype.clone = function() {
  var b = this.toJSON();
  b.isClone = !0;
  return b = new Entry.Variable(b);
};
Entry.Variable.prototype.getType = function() {
  return this.type;
};
Entry.Variable.prototype.setType = function(b) {
  this.type = b;
};
Entry.Variable.prototype.getSlidePosition = function(b) {
  var a = this.minValue_;
  return Math.abs(this.value_ - a) / Math.abs(this.maxValue_ - a) * b + 10;
};
Entry.Variable.prototype.setSlideCommandX = function(b) {
  var a = this.valueSetter_.graphics.command;
  b = Math.max("undefined" == typeof b ? 10 : b, 10);
  b = Math.min(this.maxWidth + 10, b);
  a.x = b;
  this.updateSlideValueByView();
};
Entry.Variable.prototype.updateSlideValueByView = function() {
  var b = Math.max(this.valueSetter_.graphics.command.x - 10, 0) / this.maxWidth;
  0 > b && (b = 0);
  1 < b && (b = 1);
  var a = parseFloat(this.minValue_), c = parseFloat(this.maxValue_), b = (a + Math.abs(c - a) * b).toFixed(2), b = parseFloat(b);
  b < a ? b = this.minValue_ : b > c && (b = this.maxValue_);
  this.isFloatPoint() || (b = Math.round(b));
  this.setValue(b);
};
Entry.Variable.prototype.getMinValue = function() {
  return this.minValue_;
};
Entry.Variable.prototype.setMinValue = function(b) {
  this.minValue_ = b;
  this.value_ < b && (this.value_ = b);
  this.updateView();
  this.isMinFloat = Entry.isFloat(this.minValue_);
};
Entry.Variable.prototype.getMaxValue = function() {
  return this.maxValue_;
};
Entry.Variable.prototype.setMaxValue = function(b) {
  this.maxValue_ = b;
  this.value_ > b && (this.value_ = b);
  this.updateView();
  this.isMaxFloat = Entry.isFloat(this.maxValue_);
};
Entry.Variable.prototype.isFloatPoint = function() {
  return this.isMaxFloat || this.isMinFloat;
};
Entry.VariableContainer = function() {
  this.variables_ = [];
  this.messages_ = [];
  this.lists_ = [];
  this.functions_ = {};
  this.viewMode_ = "all";
  this.selected = null;
  this.variableAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.listAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.selectedVariable = null;
  this._variableRefs = [];
  this._messageRefs = [];
  this._functionRefs = [];
};
Entry.VariableContainer.prototype.createDom = function(b) {
  var a = this;
  this.view_ = b;
  var c = Entry.createElement("table");
  c.addClass("entryVariableSelectorWorkspace");
  this.view_.appendChild(c);
  var d = Entry.createElement("tr");
  c.appendChild(d);
  var e = this.createSelectButton("all");
  e.setAttribute("rowspan", "2");
  e.addClass("selected", "allButton");
  d.appendChild(e);
  d.appendChild(this.createSelectButton("variable", Entry.variableEnable));
  d.appendChild(this.createSelectButton("message", Entry.messageEnable));
  d = Entry.createElement("tr");
  d.appendChild(this.createSelectButton("list", Entry.listEnable));
  d.appendChild(this.createSelectButton("func", Entry.functionEnable));
  c.appendChild(d);
  c = Entry.createElement("ul");
  c.addClass("entryVariableListWorkspace");
  this.view_.appendChild(c);
  this.listView_ = c;
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.variable_add;
  var f = this;
  this.variableAddButton_ = c;
  c.bindOnClick(function(b) {
    b = f.variableAddPanel;
    var c = b.view.name.value.trim();
    b.isOpen ? c && 0 !== c.length ? a.addVariable() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  this.generateVariableAddView();
  this.generateListAddView();
  this.generateVariableSplitterView();
  this.generateVariableSettingView();
  this.generateListSettingView();
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.message_create;
  this.messageAddButton_ = c;
  c.bindOnClick(function(b) {
    a.addMessage({name:Lang.Workspace.message + " " + (a.messages_.length + 1)});
  });
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.list_create;
  this.listAddButton_ = c;
  c.bindOnClick(function(b) {
    b = f.listAddPanel;
    var c = b.view.name.value.trim();
    b.isOpen ? c && 0 !== c.length ? a.addList() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.function_add;
  this.functionAddButton_ = c;
  c.bindOnClick(function(b) {
    b = a._getBlockMenu();
    Entry.playground.changeViewMode("code");
    "func" != b.lastSelector && b.selectMenu("func");
    a.createFunction();
  });
  return b;
};
Entry.VariableContainer.prototype.createSelectButton = function(b, a) {
  var c = this;
  void 0 === a && (a = !0);
  var d = Entry.createElement("td");
  d.addClass("entryVariableSelectButtonWorkspace", b);
  d.innerHTML = Lang.Workspace[b];
  a ? d.bindOnClick(function(a) {
    c.selectFilter(b);
    this.addClass("selected");
  }) : d.addClass("disable");
  return d;
};
Entry.VariableContainer.prototype.selectFilter = function(b) {
  for (var a = this.view_.getElementsByTagName("td"), c = 0;c < a.length;c++) {
    a[c].removeClass("selected"), a[c].hasClass(b) && a[c].addClass("selected");
  }
  this.viewMode_ = b;
  this.select();
  this.updateList();
};
Entry.VariableContainer.prototype.updateVariableAddView = function(b) {
  b = "variable" == (b ? b : "variable") ? this.variableAddPanel : this.listAddPanel;
  var a = b.info, c = b.view;
  b.view.addClass("entryRemove");
  c.cloudCheck.removeClass("entryVariableAddChecked");
  c.localCheck.removeClass("entryVariableAddChecked");
  c.globalCheck.removeClass("entryVariableAddChecked");
  c.cloudWrapper.removeClass("entryVariableAddSpaceUnCheckedWorkspace");
  a.isCloud && c.cloudCheck.addClass("entryVariableAddChecked");
  b.isOpen && (c.removeClass("entryRemove"), c.name.focus());
  a.object ? (c.localCheck.addClass("entryVariableAddChecked"), c.cloudWrapper.addClass("entryVariableAddSpaceUnCheckedWorkspace")) : c.globalCheck.addClass("entryVariableAddChecked");
};
Entry.VariableContainer.prototype.select = function(b) {
  b = this.selected == b ? null : b;
  this.selected && (this.selected.listElement.removeClass("selected"), this.selected.callerListElement && (this.listView_.removeChild(this.selected.callerListElement), delete this.selected.callerListElement), this.selected = null);
  b && (b.listElement.addClass("selected"), this.selected = b, b instanceof Entry.Variable ? (this.renderVariableReference(b), b.object_ && Entry.container.selectObject(b.object_, !0)) : b instanceof Entry.Func ? this.renderFunctionReference(b) : this.renderMessageReference(b));
};
Entry.VariableContainer.prototype.renderMessageReference = function(b) {
  for (var a = this, c = this._messageRefs, d = b.id, e = [], f = 0;f < c.length;f++) {
    -1 < c[f].block.params.indexOf(d) && e.push(c[f]);
  }
  c = Entry.createElement("ul");
  c.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var d = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(d.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = d.object.name + " : " + Lang.Blocks["START_" + d.block.type];
    g.appendChild(h);
    g.caller = d;
    g.message = b;
    g.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(this.message));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    c.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, c.appendChild(g));
  b.callerListElement = c;
  this.listView_.insertBefore(c, b.listElement);
  this.listView_.insertBefore(b.listElement, c);
};
Entry.VariableContainer.prototype.renderVariableReference = function(b) {
  for (var a = this, c = this._variableRefs, d = b.id_, e = [], f = 0;f < c.length;f++) {
    -1 < c[f].block.params.indexOf(d) && e.push(c[f]);
  }
  c = Entry.createElement("ul");
  c.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var d = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(d.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = d.object.name + " : " + Lang.Blocks["VARIABLE_" + d.block.type];
    g.appendChild(h);
    g.caller = d;
    g.variable = b;
    g.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null));
      b = this.caller;
      b = b.funcBlock || b.block;
      b.view.getBoard().activateBlock(b);
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    c.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, c.appendChild(g));
  b.callerListElement = c;
  this.listView_.insertBefore(c, b.listElement);
  this.listView_.insertBefore(b.listElement, c);
};
Entry.VariableContainer.prototype.renderFunctionReference = function(b) {
  for (var a = this, c = this._functionRefs, d = [], e = 0;e < c.length;e++) {
    d.push(c[e]);
  }
  c = Entry.createElement("ul");
  c.addClass("entryVariableListCallerListWorkspace");
  for (e in d) {
    var f = d[e], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(f.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = f.object.name;
    g.appendChild(h);
    g.caller = f;
    g.bindOnClick(function(c) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(b));
      c = this.caller.block;
      Entry.playground.toggleOnVariableView();
      c.view.getBoard().activateBlock(c);
      Entry.playground.changeViewMode("variable");
    });
    c.appendChild(g);
  }
  0 === d.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, c.appendChild(g));
  b.callerListElement = c;
  this.listView_.insertBefore(c, b.listElement);
  this.listView_.insertBefore(b.listElement, c);
};
Entry.VariableContainer.prototype.updateList = function() {
  if (this.listView_) {
    this.variableSettingView.addClass("entryRemove");
    for (this.listSettingView.addClass("entryRemove");this.listView_.firstChild;) {
      this.listView_.removeChild(this.listView_.firstChild);
    }
    var b = this.viewMode_, a = [];
    if ("all" == b || "message" == b) {
      "message" == b && this.listView_.appendChild(this.messageAddButton_);
      for (var c in this.messages_) {
        var d = this.messages_[c];
        a.push(d);
        var e = d.listElement;
        this.listView_.appendChild(e);
        d.callerListElement && this.listView_.appendChild(d.callerListElement);
      }
    }
    if ("all" == b || "variable" == b) {
      if ("variable" == b) {
        e = this.variableAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.variableAddButton_);
        this.listView_.appendChild(this.variableAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.Variable_used_at_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        for (c in this.variables_) {
          d = this.variables_[c], d.object_ || (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.Variable_used_at_special_object;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (c in this.variables_) {
          d = this.variables_[c], d.object_ && (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (c in this.variables_) {
          d = this.variables_[c], a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement);
        }
      }
    }
    if ("all" == b || "list" == b) {
      if ("list" == b) {
        e = this.listAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.listAddButton_);
        this.listView_.appendChild(this.listAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.List_used_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        this.updateVariableAddView("list");
        for (c in this.lists_) {
          d = this.lists_[c], d.object_ || (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.list_used_specific_objects;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (c in this.lists_) {
          d = this.lists_[c], d.object_ && (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (c in this.lists_) {
          d = this.lists_[c], a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement);
        }
      }
    }
    if ("all" == b || "func" == b) {
      for (c in "func" == b && this.listView_.appendChild(this.functionAddButton_), this.functions_) {
        b = this.functions_[c], a.push(b), e = b.listElement, this.listView_.appendChild(e), b.callerListElement && this.listView_.appendChild(b.callerListElement);
      }
    }
    this.listView_.appendChild(this.variableSettingView);
    this.listView_.appendChild(this.listSettingView);
  }
};
Entry.VariableContainer.prototype.setMessages = function(b) {
  for (var a in b) {
    var c = b[a];
    c.id || (c.id = Entry.generateHash());
    this.createMessageView(c);
    this.messages_.push(c);
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setVariables = function(b) {
  for (var a in b) {
    var c = new Entry.Variable(b[a]), d = c.getType();
    "variable" == d || "slide" == d ? (c.generateView(this.variables_.length), this.createVariableView(c), this.variables_.push(c)) : "list" == d ? (c.generateView(this.lists_.length), this.createListView(c), this.lists_.push(c)) : "timer" == d ? this.generateTimer(c) : "answer" == d && this.generateAnswer(c);
  }
  Entry.isEmpty(Entry.engine.projectTimer) && Entry.variableContainer.generateTimer();
  Entry.isEmpty(Entry.container.inputValue) && Entry.variableContainer.generateAnswer();
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setFunctions = function(b) {
  for (var a in b) {
    var c = new Entry.Func(b[a]);
    c.generateBlock();
    this.createFunctionView(c);
    this.functions_[c.id] = c;
  }
  this.updateList();
};
Entry.VariableContainer.prototype.getFunction = function(b) {
  return this.functions_[b];
};
Entry.VariableContainer.prototype.getVariable = function(b, a) {
  var c = Entry.findObjsByKey(this.variables_, "id_", b)[0];
  a && a.isClone && c.object_ && (c = Entry.findObjsByKey(a.variables, "id_", b)[0]);
  return c;
};
Entry.VariableContainer.prototype.getList = function(b, a) {
  var c = Entry.findObjsByKey(this.lists_, "id_", b)[0];
  a && a.isClone && c.object_ && (c = Entry.findObjsByKey(a.lists, "id_", b)[0]);
  return c;
};
Entry.VariableContainer.prototype.createFunction = function() {
  if (!Entry.Func.isEdit) {
    var b = new Entry.Func;
    Entry.Func.edit(b);
  }
};
Entry.VariableContainer.prototype.addFunction = function(b) {
};
Entry.VariableContainer.prototype.removeFunction = function(b) {
  this.functions_[b.id].destroy();
  delete this.functions_[b.id];
  this.updateList();
};
Entry.VariableContainer.prototype.checkListPosition = function(b, a) {
  var c = b.x_ + b.width_, d = -b.y_, e = -b.y_ + -b.height_;
  return a.x > b.x_ && a.x < c && a.y < d && a.y > e ? !0 : !1;
};
Entry.VariableContainer.prototype.getListById = function(b) {
  var a = this.lists_, c = [];
  if (0 < a.length) {
    for (var d = 0;d < a.length;d++) {
      this.checkListPosition(a[d], b) && c.push(a[d]);
    }
    return c;
  }
  return !1;
};
Entry.VariableContainer.prototype.editFunction = function(b, a) {
};
Entry.VariableContainer.prototype.saveFunction = function(b) {
  this.functions_[b.id] || (this.functions_[b.id] = b, this.createFunctionView(b));
  b.listElement.nameField.innerHTML = b.description;
  this.updateList();
};
Entry.VariableContainer.prototype.createFunctionView = function(b) {
  var a = this;
  if (this.view_) {
    var c = Entry.createElement("li");
    c.addClass("entryVariableListElementWorkspace");
    c.addClass("entryFunctionElementWorkspace");
    c.bindOnClick(function(c) {
      c.stopPropagation();
      a.select(b);
    });
    var d = Entry.createElement("button");
    d.addClass("entryVariableListElementDeleteWorkspace");
    d.bindOnClick(function(c) {
      c.stopPropagation();
      a.removeFunction(b);
      a.selected = null;
    });
    var e = Entry.createElement("button");
    e.addClass("entryVariableListElementEditWorkspace");
    var f = this._getBlockMenu();
    e.bindOnClick(function(a) {
      a.stopPropagation();
      Entry.Func.edit(b);
      Entry.playground && (Entry.playground.changeViewMode("code"), "func" != f.lastSelector && f.selectMenu("func"));
    });
    var g = Entry.createElement("div");
    g.addClass("entryVariableFunctionElementNameWorkspace");
    g.innerHTML = b.description;
    c.nameField = g;
    c.appendChild(g);
    c.appendChild(e);
    c.appendChild(d);
    b.listElement = c;
  }
};
Entry.VariableContainer.prototype.checkAllVariableName = function(b, a) {
  a = this[a];
  for (var c = 0;c < a.length;c++) {
    if (a[c].name_ == b) {
      return !0;
    }
  }
  return !1;
};
Entry.VariableContainer.prototype.addVariable = function(b) {
  if (!b) {
    var a = this.variableAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.variable);
    b.length > this._maxNameLength && (b = this._truncName(b, "variable"));
    b = this.checkAllVariableName(b, "variables_") ? Entry.getOrderedName(b, this.variables_, "name_") : b;
    var c = a.info;
    b = {name:b, isCloud:c.isCloud, object:c.object, variableType:"variable"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("variable");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add variable", this, this.removeVariable, b);
  b.generateView(this.variables_.length);
  this.createVariableView(b);
  this.variables_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removeVariable, b);
};
Entry.VariableContainer.prototype.removeVariable = function(b) {
  var a = this.variables_.indexOf(b), c = b.toJSON();
  this.selected == b && this.select(null);
  b.remove();
  this.variables_.splice(a, 1);
  Entry.stateManager && Entry.stateManager.addCommand("remove variable", this, this.addVariable, c);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addVariable, c);
};
Entry.VariableContainer.prototype.changeVariableName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.variables_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_too_long)) : (b.setName(a), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.variable_rename, Lang.Workspace.variable_rename_ok)));
};
Entry.VariableContainer.prototype.changeListName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.lists_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_too_long)) : (b.name_ = a, b.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.list_rename, Lang.Workspace.list_rename_ok)));
};
Entry.VariableContainer.prototype.removeList = function(b) {
  var a = this.lists_.indexOf(b), c = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove list", this, this.addList, c);
  this.selected == b && this.select(null);
  b.remove();
  this.lists_.splice(a, 1);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addList, c);
};
Entry.VariableContainer.prototype.createVariableView = function(b) {
  var a = this, c = Entry.createElement("li"), d = Entry.createElement("div");
  d.addClass("entryVariableListElementWrapperWorkspace");
  c.appendChild(d);
  c.addClass("entryVariableListElementWorkspace");
  b.object_ ? c.addClass("entryVariableLocalElementWorkspace") : b.isCloud_ ? c.addClass("entryVariableCloudElementWorkspace") : c.addClass("entryVariableGlobalElementWorkspace");
  c.bindOnClick(function(c) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeVariable(b);
    a.selectedVariable = null;
    a.variableSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  c.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(b) {
    b.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(null, "variable");
  });
  c.editSaveButton = g;
  var h = Entry.createElement("input");
  h.addClass("entryVariableListElementNameWorkspace");
  h.setAttribute("disabled", "disabled");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? a.changeVariableName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.variable_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.nameField = h;
  d.appendChild(h);
  d.appendChild(f);
  d.appendChild(g);
  d.appendChild(e);
  b.listElement = c;
};
Entry.VariableContainer.prototype.addMessage = function(b) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add message", this, this.removeMessage, b);
  this.createMessageView(b);
  this.messages_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  b.listElement.nameField.focus();
  return new Entry.State(this, this.removeMessage, b);
};
Entry.VariableContainer.prototype.removeMessage = function(b) {
  this.selected == b && this.select(null);
  Entry.stateManager && Entry.stateManager.addCommand("remove message", this, this.addMessage, b);
  var a = this.messages_.indexOf(b);
  this.messages_.splice(a, 1);
  this.updateList();
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addMessage, b);
};
Entry.VariableContainer.prototype.changeMessageName = function(b, a) {
  b.name != a && (Entry.isExist(a, "name", this.messages_) ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_too_long)) : (b.name = a, Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.message_rename, Lang.Workspace.message_rename_ok)));
};
Entry.VariableContainer.prototype.createMessageView = function(b) {
  var a = this, c = Entry.createElement("li");
  c.addClass("entryVariableListElementWorkspace");
  c.addClass("entryMessageElementWorkspace");
  c.bindOnClick(function(c) {
    a.select(b);
  });
  var d = Entry.createElement("button");
  d.addClass("entryVariableListElementDeleteWorkspace");
  d.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeMessage(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementEditWorkspace");
  e.bindOnClick(function(a) {
    a.stopPropagation();
    g.removeAttribute("disabled");
    g.focus();
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.addClass("entryRemove");
  f.bindOnClick(function(a) {
    a.stopPropagation();
    g.blur();
    e.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var g = Entry.createElement("input");
  g.addClass("entryVariableListElementNameWorkspace");
  g.value = b.name;
  g.bindOnClick(function(a) {
    a.stopPropagation();
  });
  g.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? (a.changeMessageName(b, this.value), e.removeClass("entryRemove"), f.addClass("entryRemove"), g.setAttribute("disabled", "disabled")) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.sign_can_not_space), this.value = b.name);
  };
  g.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.nameField = g;
  c.appendChild(g);
  c.appendChild(e);
  c.appendChild(f);
  c.appendChild(d);
  b.listElement = c;
};
Entry.VariableContainer.prototype.addList = function(b) {
  if (!b) {
    var a = this.listAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.list);
    var c = a.info;
    b.length > this._maxNameLength && (b = this._truncName(b, "list"));
    b = this.checkAllVariableName(b, "lists_") ? Entry.getOrderedName(b, this.lists_, "name_") : b;
    b = {name:b, isCloud:c.isCloud, object:c.object, variableType:"list"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("list");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add list", this, this.removeList, b);
  b.generateView(this.lists_.length);
  this.createListView(b);
  this.lists_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removelist, b);
};
Entry.VariableContainer.prototype.createListView = function(b) {
  var a = this, c = Entry.createElement("li"), d = Entry.createElement("div");
  d.addClass("entryVariableListElementWrapperWorkspace");
  c.appendChild(d);
  c.addClass("entryVariableListElementWorkspace");
  b.object_ ? c.addClass("entryListLocalElementWorkspace") : b.isCloud_ ? c.addClass("entryListCloudElementWorkspace") : c.addClass("entryListGlobalElementWorkspace");
  c.bindOnClick(function(c) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeList(b);
    a.selectedList = null;
    a.listSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  c.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(c) {
    c.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.select(b);
    a.updateSelectedVariable(null, "list");
  });
  c.editSaveButton = g;
  var h = Entry.createElement("input");
  h.setAttribute("disabled", "disabled");
  h.addClass("entryVariableListElementNameWorkspace");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? a.changeListName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.list_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.nameField = h;
  d.appendChild(h);
  d.appendChild(f);
  d.appendChild(g);
  d.appendChild(e);
  b.listElement = c;
};
Entry.VariableContainer.prototype.mapVariable = function(b, a) {
  for (var c = this.variables_.length, d = 0;d < c;d++) {
    b(this.variables_[d], a);
  }
};
Entry.VariableContainer.prototype.mapList = function(b, a) {
  for (var c = this.lists_.length, d = 0;d < c;d++) {
    b(this.lists_[d], a);
  }
};
Entry.VariableContainer.prototype.getVariableJSON = function() {
  for (var b = [], a = 0;a < this.variables_.length;a++) {
    b.push(this.variables_[a].toJSON());
  }
  for (a = 0;a < this.lists_.length;a++) {
    b.push(this.lists_[a].toJSON());
  }
  Entry.engine.projectTimer && b.push(Entry.engine.projectTimer.toJSON());
  a = Entry.container.inputValue;
  Entry.isEmpty(a) || b.push(a.toJSON());
  return b;
};
Entry.VariableContainer.prototype.getMessageJSON = function() {
  for (var b = [], a = 0;a < this.messages_.length;a++) {
    b.push({id:this.messages_[a].id, name:this.messages_[a].name});
  }
  return b;
};
Entry.VariableContainer.prototype.getFunctionJSON = function() {
  var b = [], a;
  for (a in this.functions_) {
    var c = this.functions_[a], c = {id:c.id, content:JSON.stringify(c.content.toJSON())};
    b.push(c);
  }
  return b;
};
Entry.VariableContainer.prototype.resetVariableAddPanel = function(b) {
  b = b || "variable";
  var a = "variable" == b ? this.variableAddPanel : this.listAddPanel, c = a.info;
  c.isCloud = !1;
  c.object = null;
  a.view.name.value = "";
  a.isOpen = !1;
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.generateVariableAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.variableAddPanel.view = a;
  this.variableAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  a.appendChild(c);
  var d = Entry.createElement("input");
  d.addClass("entryVariableAddSpaceInputWorkspace");
  d.setAttribute("placeholder", Lang.Workspace.Variable_placeholder_name);
  d.variableContainer = this;
  d.onkeypress = function(a) {
    13 == a.keyCode && (Entry.variableContainer.addVariable(), b.updateSelectedVariable(b.variables_[0]), a = b.variables_[0].listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"));
  };
  this.variableAddPanel.view.name = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  c.bindOnClick(function(a) {
    b.variableAddPanel.info.object = null;
    b.updateVariableAddView("variable");
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_all_objects;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.globalCheck = d;
  this.variableAddPanel.info.object || d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  c.bindOnClick(function(a) {
    Entry.playground.object && (a = b.variableAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("variable"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_this_object;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.localCheck = d;
  this.variableAddPanel.info.object && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  a.cloudWrapper = c;
  c.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.variableAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("variable"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  d.innerHTML = Lang.Workspace.Variable_create_cloud;
  c.appendChild(d);
  d = Entry.createElement("span");
  this.variableAddPanel.view.cloudCheck = d;
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  d.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.variableAddPanel.info.isCloud && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(c);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.variableAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("variable");
  });
  c.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    Entry.variableContainer.addVariable();
    b.updateSelectedVariable(b.variables_[0]);
    a = b.variables_[0].listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
  });
  c.appendChild(a);
};
Entry.VariableContainer.prototype.generateListAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.listAddPanel.view = a;
  this.listAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  c.addClass("entryListAddSpaceNameWrapperWorkspace");
  a.appendChild(c);
  var d = Entry.createElement("input");
  d.addClass("entryVariableAddSpaceInputWorkspace");
  d.setAttribute("placeholder", Lang.Workspace.list_name);
  this.listAddPanel.view.name = d;
  d.variableContainer = this;
  d.onkeypress = function(a) {
    13 == a.keyCode && (b.addList(), a = b.lists_[0], b.updateSelectedVariable(a), a = a.listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"));
  };
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  c.bindOnClick(function(a) {
    b.listAddPanel.info.object = null;
    b.updateVariableAddView("list");
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.use_all_objects;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.globalCheck = d;
  this.listAddPanel.info.object || d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  c.bindOnClick(function(a) {
    Entry.playground.object && (a = b.listAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("list"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_this_object;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.localCheck = d;
  this.variableAddPanel.info.object && addVariableLocalCheck.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  a.cloudWrapper = c;
  c.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.listAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("list"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  d.innerHTML = Lang.Workspace.List_create_cloud;
  c.appendChild(d);
  d = Entry.createElement("span");
  this.listAddPanel.view.cloudCheck = d;
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  d.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.listAddPanel.info.isCloud && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(c);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.listAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("list");
  });
  c.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    b.addList();
    a = b.lists_[0];
    b.updateSelectedVariable(a);
    a = a.listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
  });
  c.appendChild(a);
};
Entry.VariableContainer.prototype.generateVariableSplitterView = function() {
  var b = Entry.createElement("li");
  b.addClass("entryVariableSplitterWorkspace");
  var a = Entry.createElement("li");
  a.addClass("entryVariableSplitterWorkspace");
  this.variableSplitters = {top:b, bottom:a};
};
Entry.VariableContainer.prototype.openVariableAddPanel = function(b) {
  b = b ? b : "variable";
  Entry.playground.toggleOnVariableView();
  Entry.playground.changeViewMode("variable");
  "variable" == b ? this.variableAddPanel.isOpen = !0 : this.listAddPanel.isOpen = !0;
  this.selectFilter(b);
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.getMenuXml = function(b) {
  for (var a = [], c = 0 !== this.variables_.length, d = 0 !== this.lists_.length, e, f = 0, g;g = b[f];f++) {
    var h = g.tagName;
    h && "BLOCK" == h.toUpperCase() ? (e = g.getAttribute("bCategory"), !c && "variable" == e || !d && "list" == e || a.push(g)) : !h || "SPLITTER" != h.toUpperCase() && "BTN" != h.toUpperCase() || !c && "variable" == e || (d || "list" != e) && a.push(g);
  }
  return a;
};
Entry.VariableContainer.prototype.addCloneLocalVariables = function(b) {
  var a = [], c = this;
  this.mapVariable(function(b, c) {
    if (b.object_ && b.object_ == c.objectId) {
      var f = b.toJSON();
      f.originId = f.id;
      f.id = Entry.generateHash();
      f.object = c.newObjectId;
      delete f.x;
      delete f.y;
      a.push(f);
      c.json.script = c.json.script.replace(new RegExp(f.originId, "g"), f.id);
    }
  }, b);
  a.map(function(a) {
    c.addVariable(a);
  });
};
Entry.VariableContainer.prototype.generateTimer = function(b) {
  b || (b = {}, b.id = Entry.generateHash(), b.name = Lang.Workspace.Variable_Timer, b.value = 0, b.variableType = "timer", b.visible = !1, b.x = 150, b.y = -70, b = new Entry.Variable(b));
  b.generateView();
  b.tick = null;
  Entry.engine.projectTimer = b;
  Entry.addEventListener("stop", function() {
    Entry.engine.stopProjectTimer();
  });
};
Entry.VariableContainer.prototype.generateAnswer = function(b) {
  b || (b = new Entry.Variable({id:Entry.generateHash(), name:Lang.Blocks.VARIABLE_get_canvas_input_value, value:0, variableType:"answer", visible:!1, x:150, y:-100}));
  b.generateView();
  Entry.container.inputValue = b;
};
Entry.VariableContainer.prototype.generateVariableSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.variableSettingView = a;
  a.addClass("entryVariableSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableSettingVisibleWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.selectedVariable;
    var c = b.variableSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? c.addClass("entryVariableSettingChecked") : c.removeClass("entryVariableSettingChecked");
  });
  a.appendChild(c);
  var d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.show_variable;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableSettingCheckWorkspace");
  a.visibleCheck = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingInitValueWrapperWorkspace");
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.default_value;
  c.appendChild(d);
  d = Entry.createElement("input");
  d.addClass("entryVariableSettingInitValueInputWorkspace");
  a.initValueInput = d;
  d.value = 0;
  d.onkeyup = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  d.onblur = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  a.initValueInput = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingSplitterWorkspace");
  a.appendChild(c);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingSlideWrapperWorkspace");
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.slide;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableSettingCheckWorkspace");
  a.slideCheck = d;
  c.appendChild(d);
  c.bindOnClick(function(a) {
    var c;
    a = b.selectedVariable;
    var d = b.variables_, f = a.getType();
    "variable" == f ? (c = a.toJSON(), c.variableType = "slide", c = new Entry.Variable(c), d.splice(d.indexOf(a), 0, c), 0 > c.getValue() && c.setValue(0), 100 < c.getValue() && c.setValue(100), e.removeAttribute("disabled"), g.removeAttribute("disabled")) : "slide" == f && (c = a.toJSON(), c.variableType = "variable", c = new Entry.Variable(c), d.splice(d.indexOf(a), 0, c), e.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
    b.createVariableView(c);
    b.removeVariable(a);
    b.updateSelectedVariable(c);
    c.generateView();
  });
  c = Entry.createElement("div");
  a.minMaxWrapper = c;
  c.addClass("entryVariableSettingMinMaxWrapperWorkspace");
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.min_value;
  c.appendChild(d);
  var e = Entry.createElement("input");
  e.addClass("entryVariableSettingMinValueInputWorkspace");
  d = b.selectedVariable;
  e.value = d && "slide" == d.type ? d.minValue_ : 0;
  e.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMinValue(this.value), b.updateVariableSettingView(a));
  };
  a.minValueInput = e;
  c.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entryVariableSettingMaxValueSpanWorkspace");
  f.innerHTML = Lang.Workspace.max_value;
  c.appendChild(f);
  var g = Entry.createElement("input");
  g.addClass("entryVariableSettingMaxValueInputWorkspace");
  g.value = d && "slide" == d.type ? d.maxValue_ : 100;
  g.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMaxValue(this.value), b.updateVariableSettingView(a));
  };
  a.maxValueInput = g;
  c.appendChild(g);
};
Entry.VariableContainer.prototype.updateVariableSettingView = function(b) {
  var a = this.variableSettingView, c = a.visibleCheck, d = a.initValueInput, e = a.slideCheck, f = a.minValueInput, g = a.maxValueInput, h = a.minMaxWrapper;
  c.removeClass("entryVariableSettingChecked");
  b.isVisible() && c.addClass("entryVariableSettingChecked");
  e.removeClass("entryVariableSettingChecked");
  "slide" == b.getType() ? (e.addClass("entryVariableSettingChecked"), f.removeAttribute("disabled"), g.removeAttribute("disabled"), f.value = b.getMinValue(), g.value = b.getMaxValue(), h.removeClass("entryVariableMinMaxDisabledWorkspace")) : (h.addClass("entryVariableMinMaxDisabledWorkspace"), f.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
  d.value = b.getValue();
  b.listElement.appendChild(a);
  a.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.generateListSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.listSettingView = a;
  a.addClass("entryListSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryListSettingVisibleWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.selectedList;
    var c = b.listSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? c.addClass("entryListSettingCheckedWorkspace") : c.removeClass("entryListSettingCheckedWorkspace");
  });
  a.appendChild(c);
  var d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.show_list_workspace;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryListSettingCheckWorkspace");
  a.visibleCheck = d;
  c.appendChild(d);
  d = Entry.createElement("div");
  d.addClass("entryListSettingLengthWrapperWorkspace");
  c = Entry.createElement("span");
  c.addClass("entryListSettingLengthSpanWorkspace");
  c.innerHTML = Lang.Workspace.number_of_list;
  d.appendChild(c);
  a.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryListSettingLengthControllerWorkspace");
  d.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryListSettingMinusWorkspace");
  d.bindOnClick(function(a) {
    b.selectedList.array_.pop();
    b.updateListSettingView(b.selectedList);
  });
  c.appendChild(d);
  d = Entry.createElement("input");
  d.addClass("entryListSettingLengthInputWorkspace");
  d.onblur = function() {
    b.setListLength(this.value);
  };
  d.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.lengthInput = d;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryListSettingPlusWorkspace");
  d.bindOnClick(function(a) {
    b.selectedList.array_.push({data:0});
    b.updateListSettingView(b.selectedList);
  });
  c.appendChild(d);
  c = Entry.createElement("div");
  a.seperator = c;
  a.appendChild(c);
  c.addClass("entryListSettingSeperatorWorkspace");
  c = Entry.createElement("div");
  c.addClass("entryListSettingListValuesWorkspace");
  a.listValues = c;
  a.appendChild(c);
};
Entry.VariableContainer.prototype.updateListSettingView = function(b) {
  var a = this;
  b = b || this.selectedList;
  var c = this.listSettingView, d = c.listValues, e = c.visibleCheck, f = c.lengthInput, g = c.seperator;
  e.removeClass("entryListSettingCheckedWorkspace");
  b.isVisible() && e.addClass("entryListSettingCheckedWorkspace");
  f.value = b.array_.length;
  for (b.listElement.appendChild(c);d.firstChild;) {
    d.removeChild(d.firstChild);
  }
  var h = b.array_;
  0 === h.length ? g.addClass("entryRemove") : g.removeClass("entryRemove");
  for (e = 0;e < h.length;e++) {
    (function(c) {
      var e = Entry.createElement("div");
      e.addClass("entryListSettingValueWrapperWorkspace");
      var f = Entry.createElement("span");
      f.addClass("entryListSettingValueNumberSpanWorkspace");
      f.innerHTML = c + 1;
      e.appendChild(f);
      f = Entry.createElement("input");
      f.value = h[c].data;
      f.onblur = function() {
        h[c].data = this.value;
        b.updateView();
      };
      f.onkeypress = function(a) {
        13 == a.keyCode && this.blur();
      };
      f.addClass("entryListSettingEachInputWorkspace");
      e.appendChild(f);
      f = Entry.createElement("span");
      f.bindOnClick(function() {
        h.splice(c, 1);
        a.updateListSettingView();
      });
      f.addClass("entryListSettingValueRemoveWorkspace");
      e.appendChild(f);
      d.appendChild(e);
    })(e);
  }
  b.updateView();
  c.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.setListLength = function(b) {
  b = +b;
  var a = this.selectedList.array_;
  if (!isNaN(b)) {
    var c = a.length;
    if (c < b) {
      for (b -= c, c = 0;c < b;c++) {
        a.push({data:0});
      }
    } else {
      c > b && (a.length = b);
    }
  }
  this.updateListSettingView();
};
Entry.VariableContainer.prototype.updateViews = function() {
  var b = this.lists_;
  this.variables_.map(function(a) {
    a.updateView();
  });
  b.map(function(a) {
    a.updateView();
  });
};
Entry.VariableContainer.prototype.updateSelectedVariable = function(b, a) {
  b ? "variable" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "slide" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "list" == b.type && (this.selectedList = b, this.updateListSettingView(b)) : (this.selectedVariable = null, "variable" == (a || "variable") ? this.variableSettingView.addClass("entryRemove") : this.listSettingView.addClass("entryRemove"));
};
Entry.VariableContainer.prototype.removeLocalVariables = function(b) {
  var a = [], c = this;
  this.mapVariable(function(b, c) {
    b.object_ && b.object_ == c && a.push(b);
  }, b);
  a.map(function(a) {
    c.removeVariable(a);
  });
};
Entry.VariableContainer.prototype.updateCloudVariables = function() {
  var b = Entry.projectId;
  if (Entry.cloudSavable && b) {
    var a = Entry.variableContainer, b = a.variables_.filter(function(a) {
      return a.isCloud_;
    }), b = b.map(function(a) {
      return a.toJSON();
    }), a = a.lists_.filter(function(a) {
      return a.isCloud_;
    }), a = a.map(function(a) {
      return a.toJSON();
    });
    $.ajax({url:"/api/project/variable/" + Entry.projectId, type:"PUT", data:{variables:b, lists:a}}).done(function() {
    });
  }
};
Entry.VariableContainer.prototype.addRef = function(b, a) {
  if (this.view_ && Entry.playground.mainWorkspace && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    var c = {object:a.getCode().object, block:a};
    a.funcBlock && (c.funcBlock = a.funcBlock, delete a.funcBlock);
    this[b].push(c);
    if ("_functionRefs" == b) {
      for (var d = a.type.substr(5), e = Entry.variableContainer.functions_[d].content.getBlockList(), f = 0;f < e.length;f++) {
        a = e[f];
        var g = a.events;
        -1 < a.type.indexOf("func_") && a.type.substr(5) == d || (g && g.viewAdd && g.viewAdd.forEach(function(b) {
          a.getCode().object = c.object;
          b && (a.funcBlock = c.block, b(a));
        }), g && g.dataAdd && g.dataAdd.forEach(function(b) {
          a.getCode().object = c.object;
          b && (a.funcBlock = c.block, b(a));
        }));
      }
    }
    return c;
  }
};
Entry.VariableContainer.prototype.removeRef = function(b, a) {
  if (Entry.playground.mainWorkspace && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    for (var c = this[b], d = 0;d < c.length;d++) {
      if (c[d].block == a) {
        c.splice(d, 1);
        break;
      }
    }
    if ("_functionRefs" == b && (c = a.type.substr(5), d = Entry.variableContainer.functions_[c])) {
      for (var e = d.content.getBlockList(), d = 0;d < e.length;d++) {
        a = e[d];
        var f = a.events;
        -1 < a.type.indexOf("func_") && a.type.substr(5) == c || (f && f.viewDestroy && f.viewDestroy.forEach(function(b) {
          b && b(a);
        }), f && f.dataDestroy && f.dataDestroy.forEach(function(b) {
          b && b(a);
        }));
      }
    }
  }
};
Entry.VariableContainer.prototype._getBlockMenu = function() {
  return Entry.playground.mainWorkspace.getBlockMenu();
};
Entry.VariableContainer.prototype._truncName = function(b, a) {
  b = b.substring(0, this._maxNameLength);
  Entry.toast.warning(Lang.Workspace[a + "_name_auto_edited_title"], Lang.Workspace[a + "_name_auto_edited_content"]);
  return b;
};
Entry.VariableContainer.prototype._maxNameLength = 10;
Entry.block.run = {skeleton:"basic", color:"#3BBD70", contents:["this is", "basic block"], func:function() {
}};
Entry.block.mutant = {skeleton:"basic", event:"start", color:"#3BBD70", template:"test mutant block", params:[], func:function() {
}, changeEvent:new Entry.Event};
Entry.block.jr_start = {skeleton:"pebble_event", event:"start", color:"#3BBD70", template:"%1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_play_image.png", highlightColor:"#3BBD70", position:{x:0, y:0}, size:22}], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_repeat = {skeleton:"pebble_loop", color:"#127CDB", template:"%1 \ubc18\ubcf5", params:[{type:"Text", text:Lang.Menus.repeat_0}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:3, fontSize:14, roundValue:3}, {type:"Text", text:Lang.Menus.repeat_1}], statements:[], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var b = this.block.statements[0];
    if (0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.jr_item = {skeleton:"pebble_basic", color:"#F46C6C", template:"\uaf43 \ubaa8\uc73c\uae30 %1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_item_image.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.cparty_jr_item = {skeleton:"pebble_basic", color:"#8ABC1D", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.pick_up_pencil}, {type:"Indicator", img:"/img/assets/ntry/bitmap/cpartyjr/pen.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_north = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_up}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_up_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case Ntry.STATIC.EAST:
        d = b.TURN_LEFT;
        break;
      case Ntry.STATIC.SOUTH:
        d = b.HALF_ROTATION;
        break;
      case Ntry.STATIC.WEST:
        d = b.TURN_RIGHT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_east = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_right}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_right_image.png", position:{x:83, y:0}, size:22}], func:function() {
  var b = Ntry.STATIC;
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        d = b.TURN_LEFT;
        break;
      case b.WEST:
        d = b.HALF_ROTATION;
        break;
      case b.NORTH:
        d = b.TURN_RIGHT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_south = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_down}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_down_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case b.EAST:
        d = b.TURN_RIGHT;
        break;
      case b.NORTH:
        d = b.HALF_ROTATION;
        break;
      case b.WEST:
        d = b.TURN_LEFT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_west = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_left}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_left_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        d = b.TURN_RIGHT;
        break;
      case b.EAST:
        d = b.HALF_ROTATION;
        break;
      case b.NORTH:
        d = b.TURN_LEFT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_start_basic = {skeleton:"basic_event", event:"start", color:"#3BBD70", template:"%1 %2", params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}, Lang.Menus.maze_when_run], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_go_straight = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.go_forward, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_straight.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_left = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_left, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_l.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_right = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_right, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_r.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_go_slow = {skeleton:"basic", color:"#f46c6c", template:"%1 %2", params:[Lang.Menus.go_slow, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_slow.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GO_SLOW, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_repeat_until_dest = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", syntax:["BasicWhile", "true"], params:[Lang.Menus.repeat_until_reach_2, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_goal_image.png", size:18}, Lang.Menus.repeat_until_reach_1, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_if_construction = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", params:[Lang.Menus.jr_if_1, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_construction_image.png", size:18}, Lang.Menus.jr_if_2, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_REPAIR});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.jr_if_speed = {skeleton:"basic_loop", color:"#498DEB", template:Lang.Menus.jr_if_1 + " %1 " + Lang.Menus.jr_if_2 + " %2", params:[{type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_speed_image.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_SLOW});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_start = {skeleton:"basic_event", mode:"maze", event:"start", color:"#3BBD70", template:"%1 \uc2dc\uc791\ud558\uae30\ub97c \ud074\ub9ad\ud588\uc744 \ub54c", syntax:["Program"], params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.maze_step_jump = {skeleton:"basic", mode:"maze", color:"#FF6E4B", template:"\ub6f0\uc5b4\ub118\uae30%1", params:[{type:"Image", img:"/img/assets/week/blocks/jump.png", size:24}], syntax:["Scope", "jump"], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.JUMP, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_for = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ubc88 \ubc18\ubcf5\ud558\uae30%2", syntax:["BasicIteration"], params:[{type:"Dropdown", key:"REPEAT", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var b = this.block.statements[0];
    if (0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.test = {skeleton:"basic_boolean_field", mode:"maze", color:"#127CDB", template:"%1 this is test block %2", params:[{type:"Angle", value:"90"}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.maze_repeat_until_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_repeat_until_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ubaa8\ub4e0 %1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    c = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y});
    b = this.block.statements[0];
    if (0 === c.length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "bee"'], params:[{type:"Image", img:"/img/assets/ntry/bitmap/maze2/obstacle_01.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BEE});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_call_function = {skeleton:"basic", mode:"maze", color:"#B57242", template:"\uc57d\uc18d \ubd88\ub7ec\uc624\uae30%1", syntax:["Scope", "promise"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], func:function() {
  if (!this.funcExecutor) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.CODE), a;
    for (a in b) {
      this.funcExecutor = new Entry.Executor(b[a].components[Ntry.STATIC.CODE].code.getEventMap("define")[0]);
    }
  }
  this.funcExecutor.execute();
  if (null !== this.funcExecutor.scope.block) {
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_define_function = {skeleton:"basic_define", mode:"maze", color:"#B57242", event:"define", template:"\uc57d\uc18d\ud558\uae30%1", syntax:["BasicFunction"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], statements:[{accept:"basic"}], func:function(b) {
  if (!this.executed && (b = this.block.statements[0], 0 !== b.getBlocks().length)) {
    return this.executor.stepInto(b), this.executed = !0, Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_3 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "banana"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_3.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BANANA});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_4 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_2.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_move_step = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc55e\uc73c\ub85c \ud55c \uce78 \uc774\ub3d9%1", syntax:["Scope", "move"], params:[{type:"Image", img:"/img/assets/week/blocks/moveStep.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_left = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc67c\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "left"], params:[{type:"Image", img:"/img/assets/week/blocks/turnL.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_right = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc624\ub978\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "right"], params:[{type:"Image", img:"/img/assets/week/blocks/turnR.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.test_wrapper = {skeleton:"basic", mode:"maze", color:"#3BBD70", template:"%1 this is test block %2", params:[{type:"Block", accept:"basic_boolean_field", value:[{type:"test", params:[30, 50]}]}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.basic_button = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"basic button", color:"#333", align:"center"}], func:function() {
}};
Entry.BlockMenu = function(b, a, c, d) {
  Entry.Model(this, !1);
  this._align = a || "CENTER";
  this._scroll = void 0 !== d ? d : !1;
  this._bannedClass = [];
  this._categories = [];
  this.suffix = "blockMenu";
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = b;
  this.visible = !0;
  this._svgId = "blockMenu" + (new Date).getTime();
  this._clearCategory();
  this._categoryData = c;
  this._generateView(c);
  this._splitters = [];
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  a = Entry.Utils.addBlockPattern(this.svg, this.suffix);
  this.patternRect = a.rect;
  this.pattern = a.pattern;
  this.svgGroup = this.svg.elem("g");
  this.svgThreadGroup = this.svgGroup.elem("g");
  this.svgThreadGroup.board = this;
  this.svgBlockGroup = this.svgGroup.elem("g");
  this.svgBlockGroup.board = this;
  this.changeEvent = new Entry.Event(this);
  c && this._generateCategoryCodes(c);
  this.observe(this, "_handleDragBlock", ["dragBlock"]);
  this._scroll && (this._scroller = new Entry.BlockMenuScroller(this), this._addControl(b));
  Entry.documentMousedown && Entry.documentMousedown.attach(this, this.setSelectedBlock);
  this._categoryCodes && Entry.keyPressed && Entry.keyPressed.attach(this, this._captureKeyEvent);
  Entry.windowResized && (b = _.debounce(this.updateOffset, 200), Entry.windowResized.attach(this, b));
};
(function(b) {
  b.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  b._generateView = function(a) {
    var b = this.view, d = this;
    a && (this._categoryCol = Entry.Dom("ul", {class:"entryCategoryListWorkspace", parent:b}), this._generateCategoryView(a));
    this.blockMenuContainer = Entry.Dom("div", {"class":"blockMenuContainer", parent:b});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="blockMenu" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.blockMenuContainer});
    this.svgDom.mouseenter(function(a) {
      d._scroller && d._scroller.setOpacity(1);
      a = d.workspace.selectedBlockView;
      !Entry.playground || Entry.playground.resizing || a && a.dragMode === Entry.DRAG_MODE_DRAG || (Entry.playground.focusBlockMenu = !0, a = d.svgGroup.getBBox(), a = a.width + a.x + 64, a > Entry.interfaceState.menuWidth && (this.widthBackup = Entry.interfaceState.menuWidth - 64, $(this).stop().animate({width:a - 62}, 200)));
    });
    this.svgDom.mouseleave(function(a) {
      Entry.playground && !Entry.playground.resizing && (d._scroller && d._scroller.setOpacity(0), (a = this.widthBackup) && $(this).stop().animate({width:a}, 200), delete this.widthBackup, delete Entry.playground.focusBlockMenu);
    });
    $(window).scroll(function() {
      d.updateOffset();
    });
  };
  b.changeCode = function(a) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.codeListener && this.code.changeEvent.detach(this.codeListener);
    var b = this;
    this.set({code:a});
    this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    });
    a.createView(this);
    this.align();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
    this._scroller && this.svgGroup.appendChild(this._scroller.svgGroup);
  };
  b.align = function(a) {
    var b = this.code;
    if (b) {
      this._clearSplitters();
      b.view && !a && b.view.reDraw();
      a = b.getThreads();
      for (var b = 10, d = "LEFT" == this._align ? 10 : this.svgDom.width() / 2, e, f = 0, g = a.length;f < g;f++) {
        var h = a[f].getFirstBlock(), k = h.view, h = Entry.block[h.type];
        this.checkBanClass(h) ? k.set({display:!1}) : (k.set({display:!0}), h = h.class, e && e !== h && (this._createSplitter(b), b += 15), e = h, h = d - k.offsetX, "CENTER" == this._align && (h -= k.width / 2), b -= k.offsetY, k._moveTo(h, b, !1), b += k.height + 15);
      }
      this.updateSplitters();
      this.changeEvent.notify();
    }
  };
  b.cloneToGlobal = function(a) {
    if (!this._boardBlockView && null !== this.dragBlock) {
      var b = this.workspace, d = b.getMode(), e = this.dragBlock, f = this._svgWidth, g = b.selectedBoard;
      if (!g || d != Entry.Workspace.MODE_BOARD && d != Entry.Workspace.MODE_OVERLAYBOARD) {
        Entry.GlobalSvg.setView(e, b.getMode()) && Entry.GlobalSvg.addControl(a);
      } else {
        if (g.code && (b = e.block, d = b.getThread(), b && d)) {
          b = d.toJSON(!0);
          this._boardBlockView = Entry.do("addThread", b).value.getFirstBlock().view;
          var g = this.offset().top - g.offset().top, h, k;
          if (b = this.dragBlock.mouseDownCoordinate) {
            h = a.pageX - b.x, k = a.pageY - b.y;
          }
          this._boardBlockView._moveTo(e.x - f + (h || 0), e.y + g + (k || 0), !1);
          this._boardBlockView.onMouseDown.call(this._boardBlockView, a);
          this._boardBlockView.dragInstance.set({isNew:!0});
        }
      }
    }
  };
  b.terminateDrag = function() {
    if (this._boardBlockView) {
      var a = this._boardBlockView;
      if (a) {
        this.workspace.getBoard();
        this._boardBlockView = null;
        var b = Entry.GlobalSvg.left, d = Entry.GlobalSvg.width / 2, a = a.getBoard().offset().left;
        return b < a - d;
      }
    }
  };
  b.getCode = function(a) {
    return this._code;
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.renderText = function() {
    for (var a = this.code.getThreads(), b = 0;b < a.length;b++) {
      a[b].view.renderText();
    }
  };
  b.renderBlock = function() {
    for (var a = this.code.getThreads(), b = 0;b < a.length;b++) {
      a[b].view.renderBlock();
    }
  };
  b._createSplitter = function(a) {
    a = this.svgBlockGroup.elem("line", {x1:20, y1:a, x2:this._svgWidth - 20, y2:a, stroke:"#b5b5b5"});
    this._splitters.push(a);
  };
  b.updateSplitters = function(a) {
    a = void 0 === a ? 0 : a;
    var b = this._svgWidth - 20, d;
    this._splitters.forEach(function(e) {
      d = parseFloat(e.getAttribute("y1")) + a;
      e.attr({x2:b, y1:d, y2:d});
    });
  };
  b._clearSplitters = function() {
    for (var a = this._splitters, b = a.length - 1;0 <= b;b--) {
      a[b].remove(), a.pop();
    }
  };
  b.setWidth = function() {
    this._svgWidth = this.blockMenuContainer.width();
    this.updateSplitters();
  };
  b.setMenu = function() {
    var a = this._categoryCodes, b = this._categoryElems, d;
    for (d in a) {
      for (var e = a[d], e = e instanceof Entry.Code ? e.getThreads() : e, f = e.length, g = 0;g < e.length;g++) {
        var h = e[g], h = h instanceof Entry.Thread ? h.getFirstBlock().type : h[0].type;
        this.checkBanClass(Entry.block[h]) && f--;
      }
      0 === f ? b[d].addClass("entryRemove") : b[d].removeClass("entryRemove");
    }
  };
  b.getCategoryCodes = function(a) {
    a = this._convertSelector(a);
    var b = this._categoryCodes[a];
    b || (this._generateCategoryElement(a), b = []);
    b instanceof Entry.Code || (b = this._categoryCodes[a] = new Entry.Code(b));
    return b;
  };
  b._convertSelector = function(a) {
    if (isNaN(a)) {
      return a;
    }
    a = +a;
    for (var b = this._categories, d = this._categoryElems, e = 0;e < b.length;e++) {
      var f = b[e];
      if (!d[f].hasClass("entryRemove") && 0 === a--) {
        return f;
      }
    }
  };
  b.selectMenu = function(a, b) {
    var d = this._convertSelector(a);
    if (d) {
      "variable" == d && Entry.playground.checkVariables();
      "arduino" == d && this._generateHwCode();
      var e = this._categoryElems[d], f = this._selectedCategoryView, g = !1, h = this.workspace.board, k = h.view;
      f && f.removeClass("entrySelectedCategory");
      e != f || b ? f || (this.visible || (g = !0, k.addClass("foldOut"), Entry.playground.showTabs()), k.removeClass("folding"), this.visible = !0) : (k.addClass("folding"), this._selectedCategoryView = null, e.removeClass("entrySelectedCategory"), Entry.playground.hideTabs(), g = !0, this.visible = !1);
      g && Entry.bindAnimationCallbackOnce(k, function() {
        h.scroller.resizeScrollBar.call(h.scroller);
        k.removeClass("foldOut");
        Entry.windowResized.notify();
      });
      this.visible && (f = this._categoryCodes[d], this._selectedCategoryView = e, e.addClass("entrySelectedCategory"), f.constructor !== Entry.Code && (f = this._categoryCodes[d] = new Entry.Code(f)), this.changeCode(f));
      this.lastSelector = d;
    }
  };
  b._generateCategoryCodes = function(a) {
    this._categoryCodes = {};
    for (var b = 0;b < a.length;b++) {
      var d = a[b], e = [];
      d.blocks.forEach(function(a) {
        var b = Entry.block[a];
        if (b && b.def) {
          if (b.defs) {
            for (a = 0;a < b.defs.length;a++) {
              e.push([b.defs[a]]);
            }
          } else {
            e.push([b.def]);
          }
        } else {
          e.push([{type:a}]);
        }
      });
      d = d.category;
      this._categories.push(d);
      this._categoryCodes[d] = e;
    }
  };
  b.banClass = function(a, b) {
    0 > this._bannedClass.indexOf(a) && this._bannedClass.push(a);
    this.align(b);
  };
  b.unbanClass = function(a, b) {
    var d = this._bannedClass.indexOf(a);
    -1 < d && this._bannedClass.splice(d, 1);
    this.align(b);
  };
  b.checkBanClass = function(a) {
    if (a) {
      a = a.isNotFor;
      for (var b in this._bannedClass) {
        if (a && -1 < a.indexOf(this._bannedClass[b])) {
          return !0;
        }
      }
      return !1;
    }
  };
  b._addControl = function(a) {
    var b = this;
    a.on("wheel", function() {
      b._mouseWheel.apply(b, arguments);
    });
    b._scroller && $(this.svg).bind("mousedown touchstart", function(a) {
      b.onMouseDown.apply(b, arguments);
    });
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = Entry.Utils.convertMouseEvent(a);
      var c = e.dragInstance;
      e._scroller.scroll(-a.pageY + c.offsetY);
      c.set({offsetY:a.pageY});
    }
    function d(a) {
      $(document).unbind(".blockMenu");
      delete e.dragInstance;
    }
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    var e = this;
    if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
      a = Entry.Utils.convertMouseEvent(a);
      Entry.documentMousedown && Entry.documentMousedown.notify(a);
      var f = $(document);
      f.bind("mousemove.blockMenu", b);
      f.bind("mouseup.blockMenu", d);
      f.bind("touchmove.blockMenu", b);
      f.bind("touchend.blockMenu", d);
      this.dragInstance = new Entry.DragInstance({startY:a.pageY, offsetY:a.pageY});
    }
  };
  b._mouseWheel = function(a) {
    a = a.originalEvent;
    a.preventDefault();
    var b = Entry.disposeEvent;
    b && b.notify(a);
    this._scroller.scroll(-a.wheelDeltaY || a.deltaY / 3);
  };
  b.dominate = function(a) {
    this.svgBlockGroup.appendChild(a.view.svgGroup);
  };
  b.reDraw = function() {
    this.selectMenu(this.lastSelector, !0);
  };
  b._handleDragBlock = function() {
    this._boardBlockView = null;
    this._scroller && this._scroller.setOpacity(0);
  };
  b._captureKeyEvent = function(a) {
    var b = a.keyCode, d = Entry.type;
    a.ctrlKey && "workspace" == d && 48 < b && 58 > b && (a.preventDefault(), this.selectMenu(b - 49));
  };
  b.setPatternRectFill = function(a) {
    this.patternRect.attr({fill:a});
    this.pattern.attr({style:""});
  };
  b.disablePattern = function() {
    this.pattern.attr({style:"display: none"});
  };
  b._clearCategory = function() {
    this._selectedCategoryView = null;
    this._categories = [];
    var a = this._categoryElems, b;
    for (b in a) {
      a[b].remove();
    }
    this._categoryElems = {};
    a = this._categoryCodes;
    for (b in a) {
      var d = a[b];
      d.constructor == Entry.Code && d.clear();
    }
    this._categoryCodes = null;
  };
  b.setCategoryData = function(a) {
    this._clearCategory();
    this._categoryData = a;
    this._generateCategoryView(a);
    this._generateCategoryCodes(a);
  };
  b._generateCategoryView = function(a) {
    if (a) {
      for (var b = 0;b < a.length;b++) {
        this._generateCategoryElement(a[b].category);
      }
    }
  };
  b._generateCategoryElement = function(a) {
    var b = this;
    (function(a, e) {
      a.text(Lang.Blocks[e.toUpperCase()]);
      b._categoryElems[e] = a;
      a.bindOnClick(function(a) {
        b.selectMenu(e);
      });
    })(Entry.Dom("li", {id:"entryCategory" + a, class:"entryCategoryElementWorkspace", parent:this._categoryCol}), a);
  };
  b.updateOffset = function() {
    this._offset = this.svgDom.offset();
  };
  b.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
  b._generateHwCode = function() {
    var a = this._categoryCodes.arduino;
    a instanceof Entry.Code && a.clear();
    for (var b = this._categoryData, d, a = b.length - 1;0 <= a;a--) {
      if ("arduino" === b[a].category) {
        d = b[a].blocks;
        break;
      }
    }
    b = [];
    for (a = 0;a < d.length;a++) {
      var e = d[a], f = Entry.block[e];
      if (!this.checkBanClass(f)) {
        if (f && f.def) {
          if (f.defs) {
            for (a = 0;a < f.defs.length;a++) {
              b.push([f.defs[a]]);
            }
          } else {
            b.push([f.def]);
          }
        } else {
          b.push([{type:e}]);
        }
      }
    }
    this._categoryCodes.arduino = b;
  };
})(Entry.BlockMenu.prototype);
Entry.BlockMenuScroller = function(b) {
  var a = this;
  this.board = b;
  this.board.changeEvent.attach(this, this._reset);
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hX = 0;
  this._visible = !0;
  this._opacity = -1;
  this.mouseHandler = function() {
    a.onMouseDown.apply(a, arguments);
  };
  this.createScrollBar();
  this.setOpacity(0);
  this._addControl();
  Entry.windowResized && Entry.windowResized.attach(this, this.resizeScrollBar);
};
Entry.BlockMenuScroller.RADIUS = 7;
(function(b) {
  b.createScrollBar = function() {
    this.svgGroup = this.board.svgGroup.elem("g", {class:"boardScrollbar"});
    this.vScrollbar = this.svgGroup.elem("rect", {rx:4, ry:4});
    this.resizeScrollBar();
  };
  b.resizeScrollBar = function() {
    this._updateRatio();
    if (this._visible && 0 !== this.vRatio) {
      var a = this.board.blockMenuContainer;
      this.vScrollbar.attr({width:9, height:a.height() / this.vRatio, x:a.width() - 9});
    }
  };
  b.updateScrollBar = function(a) {
    this.vY += a;
    this.vScrollbar.attr({y:this.vY});
  };
  b.scroll = function(a) {
    this.isVisible() && (a = this._adjustValue(a) - this.vY, 0 !== a && (this.board.code.moveBy(0, -a * this.vRatio), this.updateScrollBar(a)));
  };
  b._adjustValue = function(a) {
    var b = this.board.svgDom.height(), b = b - b / this.vRatio;
    a = this.vY + a;
    a = Math.max(0, a);
    return a = Math.min(b, a);
  };
  b.setVisible = function(a) {
    a != this.isVisible() && (this._visible = a, this.svgGroup.attr({display:!0 === a ? "block" : "none"}));
  };
  b.setOpacity = function(a) {
    this._opacity != a && (this.vScrollbar.attr({opacity:a}), this._opacity = a);
  };
  b.isVisible = function() {
    return this._visible;
  };
  b._updateRatio = function() {
    var a = this.board, b = a.svgBlockGroup.getBoundingClientRect(), d = a.blockMenuContainer.height(), a = a.offset();
    this.vRatio = b = (b.height + (b.top - a.top) + 10) / d;
    1 >= b ? this.setVisible(!1) : this.setVisible(!0);
  };
  b._reset = function() {
    this.vY = 0;
    this.vScrollbar.attr({y:this.vY});
    this.resizeScrollBar();
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var c = e.dragInstance;
      e.scroll(a.pageY - c.offsetY);
      c.set({offsetY:a.pageY});
    }
    function d(a) {
      $(document).unbind(".scroll");
      delete e.dragInstance;
    }
    var e = this;
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
      Entry.documentMousedown && Entry.documentMousedown.notify(a);
      var f;
      f = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var g = $(document);
      g.bind("mousemove.scroll", b);
      g.bind("mouseup.scroll", d);
      g.bind("touchmove.scroll", b);
      g.bind("touchend.scroll", d);
      e.dragInstance = new Entry.DragInstance({startY:f.pageY, offsetY:f.pageY});
    }
    a.stopPropagation();
  };
  b._addControl = function() {
    $(this.vScrollbar).bind("mousedown touchstart", this.mouseHandler);
  };
})(Entry.BlockMenuScroller.prototype);
Entry.BlockView = function(b, a, c) {
  Entry.Model(this, !1);
  this.block = b;
  this._lazyUpdatePos = _.debounce(b._updatePos.bind(b), 200);
  this._board = a;
  this._observers = [];
  this.set(b);
  this.svgGroup = a.svgBlockGroup.elem("g");
  this._schema = Entry.block[b.type];
  this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
  var d = this._skeleton = Entry.skeleton[this._schema.skeleton];
  this._contents = [];
  this._statements = [];
  this.magnet = {};
  this._paramMap = {};
  d.magnets && d.magnets(this).next && (this.svgGroup.nextMagnet = this.block, this._nextGroup = this.svgGroup.elem("g"), this._observers.push(this.observe(this, "_updateMagnet", ["contentHeight"])));
  this.isInBlockMenu = this.getBoard() instanceof Entry.BlockMenu;
  var e = this;
  this.mouseHandler = function() {
    var a = e.block.events;
    a && a.mousedown && a.mousedown.forEach(function(a) {
      a(e);
    });
    e.onMouseDown.apply(e, arguments);
  };
  this._startRender(b, c);
  this._observers.push(this.block.observe(this, "_setMovable", ["movable"]));
  this._observers.push(this.block.observe(this, "_setReadOnly", ["movable"]));
  this._observers.push(this.block.observe(this, "_setCopyable", ["copyable"]));
  this._observers.push(this.block.observe(this, "_updateColor", ["deletable"], !1));
  this._observers.push(this.observe(this, "_updateBG", ["magneting"], !1));
  this._observers.push(this.observe(this, "_updateOpacity", ["visible"], !1));
  this._observers.push(this.observe(this, "_updateDisplay", ["display"], !1));
  this._observers.push(this.observe(this, "_updateShadow", ["shadow"]));
  this._observers.push(this.observe(this, "_updateMagnet", ["offsetY"]));
  this._observers.push(a.code.observe(this, "_setBoard", ["board"], !1));
  this.dragMode = Entry.DRAG_MODE_NONE;
  Entry.Utils.disableContextmenu(this.svgGroup.node);
  a = b.events.viewAdd;
  "workspace" == Entry.type && a && !this.isInBlockMenu && a.forEach(function(a) {
    Entry.Utils.isFunction(a) && a(b);
  });
};
Entry.BlockView.PARAM_SPACE = 5;
Entry.BlockView.DRAG_RADIUS = 5;
Entry.BlockView.pngMap = {};
(function(b) {
  b.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, offsetX:0, offsetY:0, width:0, height:0, contentWidth:0, contentHeight:0, magneting:!1, visible:!0, animating:!1, shadow:!0, display:!0};
  b._startRender = function(a, b) {
    var d = this, e = this._skeleton;
    this.svgGroup.attr({class:"block"});
    var f = e.classes;
    f && 0 !== f.length && f.forEach(function(a) {
      d.svgGroup.addClass(a);
    });
    f = e.path(this);
    this.pathGroup = this.svgGroup.elem("g");
    this._updateMagnet();
    this._path = this.pathGroup.elem("path");
    this.getBoard().patternRect && ($(this._path).mouseenter(function(a) {
      d._mouseEnable && d._changeFill(!0);
    }), $(this._path).mouseleave(function(a) {
      d._mouseEnable && d._changeFill(!1);
    }));
    var g = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (g = Entry.Utils.colorLighten(g));
    this._fillColor = g;
    f = {d:f, fill:g, class:"blockPath"};
    if (this.magnet.next || this._skeleton.nextShadow) {
      g = this.getBoard().suffix, this.pathGroup.attr({filter:"url(#entryBlockShadowFilter_" + g + ")"});
    } else {
      if (this.magnet.string || this.magnet.boolean) {
        f.stroke = e.outerLine;
      }
    }
    e.outerLine && (f["stroke-width"] = "0.6");
    this._path.attr(f);
    this._moveTo(this.x, this.y, !1);
    this._startContentRender(b);
    !0 !== this._board.disableMouseEvent && this._addControl();
    this.bindPrev();
  };
  b._startContentRender = function(a) {
    a = void 0 === a ? Entry.Workspace.MODE_BOARD : a;
    this.contentSvgGroup && this.contentSvgGroup.remove();
    var b = this._schema;
    b.statements && b.statements.length && this.statementSvgGroup && this.statementSvgGroup.remove();
    this._contents = [];
    this.contentSvgGroup = this.svgGroup.elem("g");
    b.statements && b.statements.length && (this.statementSvgGroup = this.svgGroup.elem("g"));
    switch(a) {
      case Entry.Workspace.MODE_BOARD:
      ;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        for (var d = /(%\d)/mi, e = (b.template ? b.template : Lang.template[this.block.type]).split(d), f = b.params, g = 0;g < e.length;g++) {
          var h = e[g].trim();
          if (0 !== h.length) {
            if (d.test(h)) {
              var k = +h.split("%")[1] - 1, h = f[k], h = new Entry["Field" + h.type](h, this, k, a, g);
              this._contents.push(h);
              this._paramMap[k] = h;
            } else {
              this._contents.push(new Entry.FieldText({text:h}, this));
            }
          }
        }
        if ((a = b.statements) && a.length) {
          for (g = 0;g < a.length;g++) {
            this._statements.push(new Entry.FieldStatement(a[g], this, g));
          }
        }
        break;
      case Entry.Workspace.MODE_VIMBOARD:
        g = this.getBoard().workspace.getCodeToText(this.block), this._contents.push(new Entry.FieldText({text:g, color:"white"}, this));
    }
    this.alignContent(!1);
  };
  b._updateSchema = function() {
    this._startContentRender();
  };
  b.changeType = function(a) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this._schema = Entry.block[a];
    this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
    this._updateSchema();
  };
  b.alignContent = function(a) {
    !0 !== a && (a = !1);
    for (var b = 0, d = 0, e = 0, f = 0, g = 0, h = 0, k = 0;k < this._contents.length;k++) {
      var l = this._contents[k];
      l instanceof Entry.FieldLineBreak ? (this._alignStatement(a, f), l.align(f), f++, d = l.box.y, b = 8) : (l.align(b, d, a), k === this._contents.length - 1 || l instanceof Entry.FieldText && 0 == l._text.length || (b += Entry.BlockView.PARAM_SPACE));
      l = l.box;
      0 !== f ? h = Math.max(1E6 * Math.round(l.height), h) : e = Math.max(l.height, e);
      b += l.width;
      g = Math.max(g, b);
      this.set({contentWidth:g, contentHeight:e});
    }
    this.set({contentHeight:e + h});
    this._statements.length != f && this._alignStatement(a, f);
    a = this.getContentPos();
    this.contentSvgGroup.attr("transform", "translate(" + a.x + "," + a.y + ")");
    this.contentPos = a;
    this._render();
    this._updateMagnet();
  };
  b._alignStatement = function(a, b) {
    var d = this._skeleton.statementPos ? this._skeleton.statementPos(this) : [], e = this._statements[b];
    e && (d = d[b]) && e.align(d.x, d.y, a);
  };
  b._render = function() {
    this._renderPath();
    this.set(this._skeleton.box(this));
  };
  b._renderPath = function() {
    var a = this._skeleton.path(this);
    this._path.attr({d:a});
    this.set({animating:!1});
  };
  b._setPosition = function(a) {
    this.svgGroup.attr("transform", "translate(" + this.x + "," + this.y + ")");
  };
  b._toLocalCoordinate = function(a) {
    this._moveTo(0, 0, !1);
    a.appendChild(this.svgGroup);
  };
  b._toGlobalCoordinate = function(a) {
    a = this.getAbsoluteCoordinate(a);
    this._moveTo(a.x, a.y, !1);
    this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
  };
  b._moveTo = function(a, b, d) {
    this.set({x:a, y:b});
    this._lazyUpdatePos();
    this.visible && this.display && this._setPosition(d);
  };
  b._moveBy = function(a, b, d) {
    return this._moveTo(this.x + a, this.y + b, d);
  };
  b._addControl = function() {
    var a = this;
    this._mouseEnable = !0;
    $(this.svgGroup).bind("mousedown.blockViewMousedown touchstart.blockViewMousedown", a.mouseHandler);
    var b = a.block.events;
    b && b.dblclick && $(this.svgGroup).dblclick(function() {
      b.dblclick.forEach(function(b) {
        b && b(a);
      });
    });
  };
  b.removeControl = function() {
    this._mouseEnable = !1;
    $(this.svgGroup).unbind(".blockViewMousedown");
  };
  b.onMouseDown = function(a) {
    function c(a) {
      a.stopPropagation();
      var c = g.workspace.getMode(), d;
      c === Entry.Workspace.MODE_VIMBOARD && b.vimBoardEvent(a, "dragOver");
      d = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var h = f.mouseDownCoordinate, h = Math.sqrt(Math.pow(d.pageX - h.x, 2) + Math.pow(d.pageY - h.y, 2));
      if (f.dragMode == Entry.DRAG_MODE_DRAG || h > Entry.BlockView.DRAG_RADIUS) {
        e && (clearTimeout(e), e = null), f.movable && (f.isInBlockMenu ? g.cloneToGlobal(a) : (a = !1, f.dragMode != Entry.DRAG_MODE_DRAG && (f._toGlobalCoordinate(), f.dragMode = Entry.DRAG_MODE_DRAG, f.block.getThread().changeEvent.notify(), Entry.GlobalSvg.setView(f, c), a = !0), this.animating && this.set({animating:!1}), 0 === f.dragInstance.height && f.dragInstance.set({height:-1 + f.height}), c = f.dragInstance, f._moveBy(d.pageX - c.offsetX, d.pageY - c.offsetY, !1), c.set({offsetX:d.pageX, 
        offsetY:d.pageY}), Entry.GlobalSvg.position(), f.originPos || (f.originPos = {x:f.x, y:f.y}), a && g.generateCodeMagnetMap(), f._updateCloseBlock()));
      }
    }
    function d(a) {
      e && (clearTimeout(e), e = null);
      $(document).unbind(".block");
      f.terminateDrag(a);
      g && g.set({dragBlock:null});
      f._changeFill(!1);
      Entry.GlobalSvg.remove();
      delete this.mouseDownCoordinate;
      delete f.dragInstance;
    }
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    var e = null, f = this;
    this._changeFill(!1);
    var g = this.getBoard();
    Entry.documentMousedown && Entry.documentMousedown.notify(a);
    if (!this.readOnly && !g.viewOnly) {
      g.setSelectedBlock(this);
      this.dominate();
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        var h = a.type, k;
        k = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
        this.mouseDownCoordinate = {x:k.pageX, y:k.pageY};
        var l = $(document);
        l.bind("mousemove.block touchmove.block", c);
        l.bind("mouseup.block touchend.block", d);
        this.dragInstance = new Entry.DragInstance({startX:k.pageX, startY:k.pageY, offsetX:k.pageX, offsetY:k.pageY, height:0, mode:!0});
        g.set({dragBlock:this});
        this.addDragging();
        this.dragMode = Entry.DRAG_MODE_MOUSEDOWN;
        "touchstart" === h && (e = setTimeout(function() {
          e && (e = null, d(), f._rightClick(a));
        }, 1E3));
      } else {
        Entry.Utils.isRightButton(a) && this._rightClick(a);
      }
      g.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD && a && document.getElementsByClassName("CodeMirror")[0].dispatchEvent(Entry.Utils.createMouseEvent("dragStart", event));
    }
  };
  b.vimBoardEvent = function(a, b, d) {
    a && (a = Entry.Utils.createMouseEvent(b, a), d && (a.block = d), document.getElementsByClassName("CodeMirror")[0].dispatchEvent(a));
  };
  b.terminateDrag = function(a) {
    var b = this.getBoard(), d = this.dragMode, e = this.block, f = b.workspace.getMode();
    this.removeDragging();
    this.set({visible:!0});
    this.dragMode = Entry.DRAG_MODE_NONE;
    if (f === Entry.Workspace.MODE_VIMBOARD) {
      b instanceof Entry.BlockMenu ? (b.terminateDrag(), this.vimBoardEvent(a, "dragEnd", e)) : b.clear();
    } else {
      if (d === Entry.DRAG_MODE_DRAG) {
        var f = this.dragInstance && this.dragInstance.isNew, g = Entry.GlobalSvg;
        a = !1;
        var h = this.block.getPrevBlock(this.block);
        a = !1;
        switch(Entry.GlobalSvg.terminateDrag(this)) {
          case g.DONE:
            g = b.magnetedBlockView;
            g instanceof Entry.BlockView && (g = g.block);
            h && !g ? Entry.do("separateBlock", e) : h || g || f ? g ? ("next" === g.view.magneting ? (h = e.getLastBlock(), this.dragMode = d, b.separate(e), this.dragMode = Entry.DRAG_MODE_NONE, Entry.do("insertBlock", g, h).isPass(f), Entry.ConnectionRipple.setView(g.view).dispose()) : (Entry.do("insertBlock", e, g).isPass(f), a = !0), createjs.Sound.play("entryMagneting")) : Entry.do("moveBlock", e).isPass(f) : e.getThread().view.isGlobal() ? Entry.do("moveBlock", e) : Entry.do("separateBlock", 
            e);
            break;
          case g.RETURN:
            e = this.block;
            d = this.originPos;
            h ? (this.set({animating:!1}), createjs.Sound.play("entryMagneting"), this.bindPrev(h), e.insert(h)) : (f = e.getThread().view.getParent(), f instanceof Entry.Board ? this._moveTo(d.x, d.y, !1) : (createjs.Sound.play("entryMagneting"), Entry.do("insertBlock", e, f)));
            break;
          case g.REMOVE:
            createjs.Sound.play("entryDelete"), f ? this.block.destroy(!1, !0) : this.block.doDestroyBelow(!1);
        }
        b.setMagnetedBlock(null);
        a && Entry.ConnectionRipple.setView(e.view).dispose();
      }
    }
    this.destroyShadow();
    delete this.originPos;
    this.dominate();
  };
  b._updateCloseBlock = function() {
    var a = this.getBoard(), b;
    if (this._skeleton.magnets) {
      for (var d in this.magnet) {
        if (b = "next" === d ? this.getBoard().getNearestMagnet(this.x, this.y + this.getBelowHeight(), d) : this.getBoard().getNearestMagnet(this.x, this.y, d)) {
          return a.setMagnetedBlock(b.view, d);
        }
      }
      a.setMagnetedBlock(null);
    }
  };
  b.dominate = function() {
    this.block.getThread().view.dominate();
  };
  b.getSvgRoot = function() {
    for (var a = this.getBoard().svgBlockGroup, b = this.svgGroup;b.parentNode !== a;) {
      b = b.parentNode;
    }
    return b;
  };
  b.getBoard = function() {
    return this._board;
  };
  b._setBoard = function() {
    this._board = this._board.code.board;
  };
  b.destroy = function(a) {
    $(this.svgGroup).unbind(".blockViewMousedown");
    this._destroyObservers();
    var b = this.svgGroup;
    a ? $(b).fadeOut(100, function() {
      b.remove();
    }) : b.remove();
    this._contents.forEach(function(a) {
      a.constructor !== Entry.Block && a.destroy();
    });
    var d = this.block;
    a = d.events.viewDestroy;
    "workspace" == Entry.type && a && !this.isInBlockMenu && a.forEach(function(a) {
      Entry.Utils.isFunction(a) && a(d);
    });
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
  };
  b.getShadow = function() {
    this._shadow || (this._shadow = Entry.SVG.createElement(this.svgGroup.cloneNode(!0), {opacity:.5}), this.getBoard().svgGroup.appendChild(this._shadow));
    return this._shadow;
  };
  b.destroyShadow = function() {
    this._shadow && (this._shadow.remove(), delete this._shadow);
  };
  b._updateMagnet = function() {
    if (this._skeleton.magnets) {
      var a = this._skeleton.magnets(this);
      a.next && this._nextGroup.attr("transform", "translate(" + a.next.x + "," + a.next.y + ")");
      this.magnet = a;
      this.block.getThread().changeEvent.notify();
    }
  };
  b._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      var a = this.svgGroup;
      if (this.magnet.next) {
        if (a = this.magneting) {
          var b = this._board.dragBlock.getShadow(), d = this.getAbsoluteCoordinate(), e;
          if ("previous" === a) {
            e = this.magnet.next, e = "translate(" + (d.x + e.x) + "," + (d.y + e.y) + ")";
          } else {
            if ("next" === a) {
              e = this.magnet.previous;
              var f = this._board.dragBlock.getBelowHeight();
              e = "translate(" + (d.x + e.x) + "," + (d.y + e.y - f) + ")";
            }
          }
          $(b).attr({transform:e, display:"block"});
          this._clonedShadow = b;
          this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
          "previous" === a && (a = this._board.dragBlock.getBelowHeight() + this.offsetY, this.originalHeight = this.offsetY, this.set({offsetY:a}));
        } else {
          this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), this.set({offsetY:a}), delete this.originalHeight);
        }
        (a = this.block.thread.changeEvent) && a.notify();
      } else {
        this.magneting ? (a.attr({filter:"url(#entryBlockHighlightFilter_" + this.getBoard().suffix + ")"}), a.addClass("outputHighlight")) : (a.removeClass("outputHighlight"), a.removeAttr("filter"));
      }
    }
  };
  b.addDragging = function() {
    this.svgGroup.addClass("dragging");
  };
  b.removeDragging = function() {
    this.svgGroup.removeClass("dragging");
  };
  b.addSelected = function() {
    this.svgGroup.addClass("selected");
  };
  b.removeSelected = function() {
    this.svgGroup.removeClass("selected");
  };
  b.getSkeleton = function() {
    return this._skeleton;
  };
  b.getContentPos = function() {
    return this._skeleton.contentPos(this);
  };
  b.renderText = function() {
    this._startContentRender(Entry.Workspace.MODE_VIMBOARD);
  };
  b.renderBlock = function() {
    this._startContentRender(Entry.Workspace.MODE_BOARD);
  };
  b._updateOpacity = function() {
    this.svgGroup.attr({opacity:!1 === this.visible ? 0 : 1});
    this.visible && this._setPosition();
  };
  b._updateShadow = function() {
    this.shadow && Entry.Utils.colorDarken(this._schema.color, .7);
  };
  b._setMovable = function() {
    this.movable = null !== this.block.isMovable() ? this.block.isMovable() : void 0 !== this._skeleton.movable ? this._skeleton.movable : !0;
  };
  b._setReadOnly = function() {
    this.readOnly = null !== this.block.isReadOnly() ? this.block.isReadOnly() : void 0 !== this._skeleton.readOnly ? this._skeleton.readOnly : !1;
  };
  b._setCopyable = function() {
    this.copyable = null !== this.block.isCopyable() ? this.block.isCopyable() : void 0 !== this._skeleton.copyable ? this._skeleton.copyable : !0;
  };
  b.bumpAway = function(a, b) {
    var d = this;
    a = a || 15;
    b ? window.setTimeout(function() {
      d._moveBy(a, a, !1);
    }, b) : d._moveBy(a, a, !1);
  };
  b.bindPrev = function(a) {
    if (a) {
      if (this._toLocalCoordinate(a.view._nextGroup), (a = a.getNextBlock()) && a !== this.block) {
        var b = this.block.getLastBlock();
        b.view.magnet.next ? a.view._toLocalCoordinate(b.view._nextGroup) : (a.view._toGlobalCoordinate(), a.separate(), a.view.bumpAway(null, 100));
      }
    } else {
      if (a = this.block.getPrevBlock()) {
        this._toLocalCoordinate(a.view._nextGroup), (a = this.block.getNextBlock()) && a.view && a.view._toLocalCoordinate(this._nextGroup);
      }
    }
  };
  b.getAbsoluteCoordinate = function(a) {
    a = void 0 !== a ? a : this.dragMode;
    if (a === Entry.DRAG_MODE_DRAG) {
      return {x:this.x, y:this.y};
    }
    a = this.block.getThread().view.requestAbsoluteCoordinate(this);
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  b.getBelowHeight = function() {
    return this.block.getThread().view.requestPartHeight(this);
  };
  b._updateDisplay = function() {
    this.svgGroup.attr({display:!1 === this.display ? "none" : "block"});
    this.display && this._setPosition();
  };
  b._updateColor = function() {
    var a = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (a = Entry.Utils.colorLighten(a));
    this._fillColor = a;
    this._path.attr({fill:a});
    this._updateContents();
  };
  b._updateContents = function() {
    for (var a = 0;a < this._contents.length;a++) {
      this._contents[a].renderStart();
    }
    this.alignContent(!1);
  };
  b._destroyObservers = function() {
    for (var a = this._observers;a.length;) {
      a.pop().destroy();
    }
  };
  b._changeFill = function(a) {
    var b = this.getBoard();
    if (b.patternRect && !b.dragBlock) {
      var d = this._fillColor, e = this._path, b = this.getBoard();
      a ? (b.setPatternRectFill(d), d = "url(#blockHoverPattern_" + this.getBoard().suffix + ")") : b.disablePattern();
      e.attr({fill:d});
    }
  };
  b.addActivated = function() {
    this.svgGroup.addClass("activated");
  };
  b.removeActivated = function() {
    this.svgGroup.removeClass("activated");
  };
  b.reDraw = function() {
    if (this.visible) {
      var a = this.block;
      requestAnimFrame(this._updateContents.bind(this));
      var b = a.params;
      if (b) {
        for (var d = 0;d < b.length;d++) {
          var e = b[d];
          e instanceof Entry.Block && e.view.reDraw();
        }
      }
      if (a = a.statements) {
        for (d = 0;d < a.length;d++) {
          a[d].view.reDraw();
        }
      }
    }
  };
  b.getParam = function(a) {
    return this._paramMap[a];
  };
  b.getDataUrl = function(a, b) {
    function d() {
      g = g.replace("(svgGroup)", (new XMLSerializer).serializeToString(k)).replace("%W", h.width * n).replace("%H", h.height * n).replace("(defs)", (new XMLSerializer).serializeToString(q[0])).replace(/>\s+/g, ">").replace(/\s+</g, "<");
      var a = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(g)));
      g = null;
      b ? (f.resolve({src:a, width:h.width, height:h.height}), k = null) : e(a, h.width, h.height, 1.5).then(function(a) {
        k = null;
        f.resolve({src:a, width:h.width, height:h.height});
      }, function(a) {
        f.reject("error occured");
      });
      a = null;
    }
    function e(a, b, c, d) {
      var e = $.Deferred();
      d || (d = 1);
      void 0 !== Entry.BlockView.pngMap[a] && e.resolve(Entry.BlockView.pngMap[a]);
      b *= d;
      c *= d;
      b = Math.ceil(b);
      c = Math.ceil(c);
      var f = document.createElement("img");
      f.crossOrigin = "Anonymous";
      var g = document.createElement("canvas");
      g.width = b;
      g.height = c;
      var h = g.getContext("2d");
      f.onload = function() {
        h.drawImage(f, 0, 0, b, c);
        var d = g.toDataURL("image/png");
        /\.png$/.test(a) && (Entry.BlockView.pngMap[a] = d);
        e.resolve(d);
      };
      f.onerror = function() {
        e.reject("error occured");
      };
      f.src = a;
      return e.promise();
    }
    var f = $.Deferred(), g = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %W %H">(svgGroup)(defs)</svg>', h = this.svgGroup.getBoundingClientRect(), k = a ? this.svgGroup : this.svgGroup.cloneNode(!0), l = this._skeleton.box(this), n = b ? 1 : 1.5, m = function() {
      var a = window.platform;
      return a && "windows" === a.name.toLowerCase() && "7" === a.version[0] ? !0 : !1;
    }() ? .9 : .95;
    -1 < this.type.indexOf("func_") && (m *= .99);
    k.setAttribute("transform", "scale(%SCALE) translate(%X,%Y)".replace("%X", -l.offsetX).replace("%Y", -l.offsetY).replace("%SCALE", n));
    for (var q = this.getBoard().svgDom.find("defs"), r = k.getElementsByTagName("image"), l = k.getElementsByTagName("text"), t = ["\u2265", "\u2264"], u = "\u2265\u2264-><=+-x/".split(""), v = 0;v < l.length;v++) {
      (function(a) {
        a.setAttribute("font-family", "'nanumBarunRegular', 'NanumGothic', '\ub098\ub214\uace0\ub515','NanumGothicWeb', '\ub9d1\uc740 \uace0\ub515', 'Malgun Gothic', Dotum");
        var b = parseInt(a.getAttribute("font-size")), c = $(a).text();
        -1 < t.indexOf(c) && a.setAttribute("font-weight", "500");
        if ("q" == c) {
          var d = parseInt(a.getAttribute("y"));
          a.setAttribute("y", d - 1);
        }
        -1 < u.indexOf(c) ? a.setAttribute("font-size", b + "px") : a.setAttribute("font-size", b * m + "px");
        a.setAttribute("alignment-baseline", "baseline");
      })(l[v]);
    }
    var x = 0;
    if (0 === r.length) {
      d();
    } else {
      for (v = 0;v < r.length;v++) {
        (function(a) {
          var b = a.getAttribute("href");
          e(b, a.getAttribute("width"), a.getAttribute("height")).then(function(b) {
            a.setAttribute("href", b);
            if (++x == r.length) {
              return d();
            }
          });
        })(r[v]);
      }
    }
    return f.promise();
  };
  b.downloadAsImage = function() {
    this.getDataUrl().then(function(a) {
      var b = document.createElement("a");
      b.href = a.src;
      b.download = "\uc5d4\ud2b8\ub9ac \ube14\ub85d.png";
      b.click();
    });
  };
  b._rightClick = function(a) {
    var b = Entry.disposeEvent;
    b && b.notify(a);
    var d = this, e = d.block;
    if (!this.isInBlockMenu) {
      var b = [], f = {text:Lang.Blocks.Duplication_option, enable:this.copyable, callback:function() {
        Entry.do("cloneBlock", e);
      }}, g = {text:Lang.Blocks.CONTEXT_COPY_option, enable:this.copyable, callback:function() {
        d.block.copyToClipboard();
      }}, h = {text:Lang.Blocks.Delete_Blocks, enable:e.isDeletable(), callback:function() {
        Entry.do("destroyBlock", d.block);
      }}, k = {text:Lang.Menus.save_as_image, callback:function() {
        d.downloadAsImage();
      }};
      b.push(f);
      b.push(g);
      b.push(h);
      Entry.Utils.isChrome() && "workspace" == Entry.type && !Entry.isMobile() && b.push(k);
      a.originalEvent && a.originalEvent.touches && (a = a.originalEvent.touches[0]);
      Entry.ContextMenu.show(b, null, {x:a.clientX, y:a.clientY});
    }
  };
})(Entry.BlockView.prototype);
Entry.Code = function(b, a) {
  Entry.Model(this, !1);
  a && (this.object = a);
  this._data = new Entry.Collection;
  this._eventMap = {};
  this._blockMap = {};
  this.executors = [];
  this.executeEndEvent = new Entry.Event(this);
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this._handleChange);
  this._maxZIndex = 0;
  this.load(b);
};
Entry.STATEMENT = 0;
Entry.PARAM = -1;
(function(b) {
  b.schema = {view:null, board:null};
  b.load = function(a) {
    a instanceof Array || (a = JSON.parse(a));
    this.clear();
    for (var b = 0;b < a.length;b++) {
      this._data.push(new Entry.Thread(a[b], this));
    }
    return this;
  };
  b.clear = function() {
    for (var a = this._data.length - 1;0 <= a;a--) {
      this._data[a].destroy(!1);
    }
    this.clearExecutors();
    this._eventMap = {};
  };
  b.createView = function(a) {
    null === this.view ? this.set({view:new Entry.CodeView(this, a), board:a}) : (this.set({board:a}), a.bindCodeView(this.view));
  };
  b.registerEvent = function(a, b) {
    this._eventMap[b] || (this._eventMap[b] = []);
    this._eventMap[b].push(a);
  };
  b.unregisterEvent = function(a, b) {
    var d = this._eventMap[b];
    if (d && 0 !== d.length) {
      var e = d.indexOf(a);
      0 > e || d.splice(e, 1);
    }
  };
  b.raiseEvent = function(a, b, d) {
    a = this._eventMap[a];
    var e = [];
    if (void 0 !== a) {
      for (var f = 0;f < a.length;f++) {
        var g = a[f];
        if (void 0 === d || -1 < g.params.indexOf(d)) {
          g = new Entry.Executor(a[f], b), this.executors.push(g), e.push(g);
        }
      }
      return e;
    }
  };
  b.getEventMap = function(a) {
    return this._eventMap[a];
  };
  b.map = function(a) {
    this._data.map(a);
  };
  b.tick = function() {
    for (var a = this.executors, b = 0;b < a.length;b++) {
      var d = a[b];
      d.isEnd() ? (a.splice(b--, 1), 0 === a.length && this.executeEndEvent.notify()) : d.execute();
    }
  };
  b.removeExecutor = function(a) {
    a = this.executors.indexOf(a);
    -1 < a && this.executors.splice(a, 1);
  };
  b.clearExecutors = function() {
    this.executors.forEach(function(a) {
      a.end();
    });
    this.executors = [];
  };
  b.clearExecutorsByEntity = function(a) {
    for (var b = this.executors, d = 0;d < b.length;d++) {
      var e = b[d];
      e.entity === a && e.end();
    }
  };
  b.addExecutor = function(a) {
    this.executors.push(a);
  };
  b.createThread = function(a, b) {
    if (!(a instanceof Array)) {
      return console.error("blocks must be array");
    }
    var d = new Entry.Thread(a, this);
    void 0 === b ? this._data.push(d) : this._data.insert(d, b);
    return d;
  };
  b.cloneThread = function(a, b) {
    var d = a.clone(this, b);
    this._data.push(d);
    return d;
  };
  b.destroyThread = function(a, b) {
    var d = this._data, e = d.indexOf(a);
    0 > e || d.splice(e, 1);
  };
  b.doDestroyThread = function(a, b) {
    var d = this._data, e = d.indexOf(a);
    0 > e || d.splice(e, 1);
  };
  b.getThreads = function() {
    return this._data.map(function(a) {
      return a;
    });
  };
  b.toJSON = function() {
    for (var a = this.getThreads(), b = [], d = 0, e = a.length;d < e;d++) {
      b.push(a[d].toJSON());
    }
    return b;
  };
  b.countBlock = function() {
    for (var a = this.getThreads(), b = 0, d = 0;d < a.length;d++) {
      b += a[d].countBlock();
    }
    return b;
  };
  b.moveBy = function(a, b) {
    for (var d = this.getThreads(), e = 0, f = d.length;e < f;e++) {
      var g = d[e].getFirstBlock();
      g && g.view._moveBy(a, b, !1);
    }
    d = this.board;
    d instanceof Entry.BlockMenu && d.updateSplitters(b);
  };
  b.stringify = function() {
    return JSON.stringify(this.toJSON());
  };
  b.dominate = function(a) {
    a.view.setZIndex(this._maxZIndex++);
  };
  b.indexOf = function(a) {
    return this._data.indexOf(a);
  };
  b._handleChange = function() {
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  };
  b.hasBlockType = function(a) {
    for (var b = this.getThreads(), d = 0;d < b.length;d++) {
      if (b[d].hasBlockType(a)) {
        return !0;
      }
    }
    return !1;
  };
  b.findById = function(a) {
    return this._blockMap[a];
  };
  b.registerBlock = function(a) {
    this._blockMap[a.id] = a;
  };
  b.unregisterBlock = function(a) {
    delete this._blockMap[a.id];
  };
  b.getByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    for (var b = this._data[a.shift()].getBlock(a.shift());a.length;) {
      b instanceof Entry.Block || (b = b.getValueBlock());
      var d = a.shift(), e = a.shift();
      -1 < d ? b = b.statements[d].getBlock(e) : -1 === d && (b = b.view.getParam(e));
    }
    return b;
  };
  b.getTargetByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    var b = this._data[a.shift()], d;
    if (1 === a.length) {
      d = b.getBlock(a.shift() - 1);
    } else {
      for (d = b.getBlock(a.shift());a.length;) {
        d instanceof Entry.Block || (d = d.getValueBlock());
        var e = a.shift(), b = a.shift();
        -1 < e ? (d = d.statements[e], d = a.length ? d.getBlock(b) : 0 === b ? d.view.getParent() : d.getBlock(b - 1)) : -1 === e && (d = d.view.getParam(b));
      }
    }
    return d;
  };
  b.getBlockList = function(a) {
    for (var b = this.getThreads(), d = [], e = 0;e < b.length;e++) {
      d = d.concat(b[e].getBlockList(a));
    }
    return d;
  };
})(Entry.Code.prototype);
Entry.CodeView = function(b, a) {
  Entry.Model(this, !1);
  this.code = b;
  this.set({board:a});
  this.svgThreadGroup = a.svgGroup.elem("g");
  this.svgThreadGroup.attr({class:"svgThreadGroup"});
  this.svgThreadGroup.board = a;
  this.svgBlockGroup = a.svgGroup.elem("g");
  this.svgBlockGroup.attr({class:"svgBlockGroup"});
  this.svgBlockGroup.board = a;
  a.bindCodeView(this);
  this.code.map(function(b) {
    b.createView(a);
  });
  b.observe(this, "_setBoard", ["board"]);
};
(function(b) {
  b.schema = {board:null, scrollX:0, scrollY:0};
  b._setBoard = function() {
    this.set({board:this.code.board});
  };
  b.reDraw = function() {
    this.code.map(function(a) {
      a.view.reDraw();
    });
  };
})(Entry.CodeView.prototype);
Entry.ConnectionRipple = {};
(function(b) {
  b.createDom = function(a) {
    this.svgDom || (this._ripple = a.getBoard().svgGroup.elem("circle", {cx:0, cy:0, r:0, stroke:"#888", "stroke-width":10}));
  };
  b.setView = function(a) {
    this._ripple || this.createDom(a);
    var b = this._ripple, d = a.getBoard().svgGroup;
    b.remove();
    a = a.getAbsoluteCoordinate();
    b.attr({cx:a.x, cy:a.y});
    d.appendChild(b);
    b._startTime = new Date;
    return this;
  };
  b.dispose = function() {
    var a = this, b = this._ripple, d = (new Date - b._startTime) / 150;
    1 < d ? b.remove() : (b.attr({r:25 * d, opacity:1 - d}), window.setTimeout(function() {
      a.dispose();
    }, 10));
  };
})(Entry.ConnectionRipple);
Entry.Executor = function(b, a) {
  this.scope = new Entry.Scope(b, this);
  this.entity = a;
  this._callStack = [];
  this.register = {};
};
(function(b) {
  b.execute = function() {
    if (!this.isEnd()) {
      for (;;) {
        var a = null;
        try {
          a = this.scope.block.getSchema().func.call(this.scope, this.entity, this.scope);
        } catch (b) {
          if ("AsyncError" === b.name) {
            a = Entry.STATIC.BREAK;
          } else {
            var c = !1;
            "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec" != b.message && (c = !0);
            Entry.Utils.stopProjectWithToast(this.scope, "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec", c);
          }
        }
        if (this.isEnd()) {
          break;
        }
        if (void 0 === a || null === a || a === Entry.STATIC.PASS) {
          if (this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this), null === this.scope.block) {
            if (this._callStack.length) {
              if (a = this.scope, this.scope = this._callStack.pop(), this.scope.isLooped !== a.isLooped) {
                break;
              }
            } else {
              break;
            }
          }
        } else {
          if (a !== Entry.STATIC.CONTINUE && (a === Entry.STATIC.BREAK || this.scope === a)) {
            break;
          }
        }
      }
    }
  };
  b.stepInto = function(a) {
    a instanceof Entry.Thread || console.error("Must step in to thread");
    a = a.getFirstBlock();
    if (!a) {
      return Entry.STATIC.BREAK;
    }
    this._callStack.push(this.scope);
    this.scope = new Entry.Scope(a, this);
    return Entry.STATIC.CONTINUE;
  };
  b.break = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    return Entry.STATIC.PASS;
  };
  b.breakLoop = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    for (;this._callStack.length && "repeat" !== Entry.block[this.scope.block.type].class;) {
      this.scope = this._callStack.pop();
    }
    return Entry.STATIC.PASS;
  };
  b.end = function() {
    this.scope.block = null;
  };
  b.isEnd = function() {
    return null === this.scope.block;
  };
})(Entry.Executor.prototype);
Entry.Scope = function(b, a) {
  this.type = (this.block = b) ? b.type : null;
  this.executor = a;
  this.entity = a.entity;
};
(function(b) {
  b.callReturn = function() {
  };
  b.getParam = function(a) {
    a = this.block.params[a];
    var b = new Entry.Scope(a, this.executor);
    return Entry.block[a.type].func.call(b, this.entity, b);
  };
  b.getParams = function() {
    var a = this;
    return this.block.params.map(function(b) {
      if (b instanceof Entry.Block) {
        var d = new Entry.Scope(b, a.executor);
        return Entry.block[b.type].func.call(d, a.entity, d);
      }
      return b;
    });
  };
  b.getValue = function(a, b) {
    var d = this.block.params[this._getParamIndex(a, b)], e = new Entry.Scope(d, this.executor);
    return Entry.block[d.type].func.call(e, this.entity, e);
  };
  b.getStringValue = function(a, b) {
    return String(this.getValue(a, b));
  };
  b.getNumberValue = function(a, b) {
    return +this.getValue(a);
  };
  b.getBooleanValue = function(a, b) {
    return +this.getValue(a, b) ? !0 : !1;
  };
  b.getField = function(a, b) {
    return this.block.params[this._getParamIndex(a)];
  };
  b.getStringField = function(a, b) {
    return String(this.getField(a));
  };
  b.getNumberField = function(a) {
    return +this.getField(a);
  };
  b.getStatement = function(a, b) {
    return this.executor.stepInto(this.block.statements[this._getStatementIndex(a, b)]);
  };
  b._getParamIndex = function(a) {
    this._schema || (this._schema = Entry.block[this.type]);
    return this._schema.paramsKeyMap[a];
  };
  b._getStatementIndex = function(a) {
    this._schema || (this._schema = Entry.block[this.type]);
    return this._schema.statementsKeyMap[a];
  };
  b.die = function() {
    this.block = null;
    return Entry.STATIC.BREAK;
  };
})(Entry.Scope.prototype);
Entry.Field = function() {
};
(function(b) {
  b.TEXT_LIMIT_LENGTH = 20;
  b.destroy = function() {
    $(this.svgGroup).unbind("mouseup touchend");
    this.destroyOption();
  };
  b.command = function() {
    this._startValue && (this._startValue === this.getValue() || this._blockView.isInBlockMenu || Entry.do("setFieldValue", this._block, this, this.pointer(), this._startValue, this.getValue()));
    delete this._startValue;
  };
  b.destroyOption = function() {
    this.documentDownEvent && (Entry.documentMousedown.detach(this.documentDownEvent), delete this.documentDownEvent);
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.command();
  };
  b._attachDisposeEvent = function(a) {
    var b = this;
    b.disposeEvent = Entry.disposeEvent.attach(b, a || function() {
      b.destroyOption();
    });
  };
  b.align = function(a, b, d) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = "translate(" + a + "," + b + ")";
    void 0 === d || d ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.getAbsolutePosFromBoard = function() {
    var a = this._block.view, b = a.getContentPos(), a = a.getAbsoluteCoordinate();
    return {x:a.x + this.box.x + b.x, y:a.y + this.box.y + b.y};
  };
  b.getAbsolutePosFromDocument = function() {
    var a = this._block.view, b = a.getContentPos(), d = a.getAbsoluteCoordinate(), a = a.getBoard().svgDom.offset();
    return {x:d.x + this.box.x + b.x + a.left, y:d.y + this.box.y + b.y + a.top};
  };
  b.getRelativePos = function() {
    var a = this._block.view.getContentPos(), b = this.box;
    return {x:b.x + a.x, y:b.y + a.y};
  };
  b.truncate = function() {
    var a = String(this.getValue()), b = this.TEXT_LIMIT_LENGTH, d = a.substring(0, b);
    a.length > b && (d += "...");
    return d;
  };
  b.appendSvgOptionGroup = function() {
    return this._block.view.getBoard().svgGroup.elem("g");
  };
  b.getValue = function() {
    return this._block.params[this._index];
  };
  b.setValue = function(a, b) {
    this.value != a && (this.value = a, this._block.params[this._index] = a, b && this._blockView.reDraw());
  };
  b._isEditable = function() {
    if (Entry.ContextMenu.visible || this._block.view.dragMode == Entry.DRAG_MODE_DRAG) {
      return !1;
    }
    var a = this._block.view, b = a.getBoard();
    if (!0 === b.disableMouseEvent) {
      return !1;
    }
    var d = b.workspace.selectedBlockView;
    if (!d || b != d.getBoard()) {
      return !1;
    }
    b = a.getSvgRoot();
    return b == d.svgGroup || $(b).has($(a.svgGroup));
  };
  b._selectBlockView = function() {
    var a = this._block.view;
    a.getBoard().setSelectedBlock(a);
  };
  b._bindRenderOptions = function() {
    var a = this;
    $(this.svgGroup).bind("mouseup touchend", function(b) {
      a._isEditable() && (a.destroyOption(), a._startValue = a.getValue(), a.renderOptions());
    });
  };
  b.pointer = function(a) {
    a = a || [];
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
  b.getFontSize = function(a) {
    return a = a || this._blockView.getSkeleton().fontSize || 12;
  };
  b.getContentHeight = function() {
    return Entry.isMobile() ? 22 : 16;
  };
})(Entry.Field.prototype);
Entry.FieldAngle = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = c;
  b = this.getValue();
  this.setValue(this.modValue(void 0 !== b ? b : 90));
  this._CONTENT_HEIGHT = this.getContentHeight();
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldAngle);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:4, y:4, "font-size":"11px"});
    this.textElement.textContent = this.getText();
    var a = this.getTextWidth(), b = this._CONTENT_HEIGHT, d = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:d - b / 2, rx:3, ry:3, width:a, height:b, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:b});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.value);
    this.optionGroup.on("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(b) {
      var c = b.keyCode || b.which;
      a.applyValue(b);
      -1 < [13, 27].indexOf(c) && a.destroyOption();
    });
    var b = this.getAbsolutePosFromDocument();
    b.y -= this.box.height / 2;
    this.optionGroup.css({height:this._CONTENT_HEIGHT, left:b.x, top:b.y, width:a.box.width});
    this.svgOptionGroup = this.appendSvgOptionGroup();
    this.svgOptionGroup.elem("circle", {x:0, y:0, r:49, class:"entry-field-angle-circle"});
    $(this.svgOptionGroup).on("mousedown touchstart", function(b) {
      b.stopPropagation();
      a._updateByCoord(b);
    });
    this._dividerGroup = this.svgOptionGroup.elem("g");
    for (b = 0;360 > b;b += 15) {
      this._dividerGroup.elem("line", {x1:49, y1:0, x2:49 - (0 === b % 45 ? 10 : 5), y2:0, transform:"rotate(" + b + ", 0, 0)", class:"entry-angle-divider"});
    }
    b = this.getAbsolutePosFromBoard();
    b.x += this.box.width / 2;
    b.y = b.y + this.box.height / 2 + 49 + 1;
    this.svgOptionGroup.attr({class:"entry-field-angle", transform:"translate(" + b.x + "," + b.y + ")"});
    $(this.svgOptionGroup).bind("mousemove touchmove", this._updateByCoord.bind(this));
    $(this.svgOptionGroup).bind("mouseup touchend", this.destroyOption.bind(this));
    this.updateGraph();
    this.optionGroup.focus();
    this.optionGroup.select();
  };
  b._updateByCoord = function(a) {
    a.originalEvent && a.originalEvent.touches && (a = a.originalEvent.touches[0]);
    a = [a.clientX, a.clientY];
    var b = this.getAbsolutePosFromDocument();
    this.optionGroup.val(this.modValue(function(a, b) {
      var c = b[0] - a[0], g = b[1] - a[1] - 49 - 1, h = Math.atan(-g / c), h = Entry.toDegrees(h), h = 90 - h;
      0 > c ? h += 180 : 0 < g && (h += 360);
      return 15 * Math.round(h / 15);
    }([b.x + this.box.width / 2, b.y + this.box.height / 2 + 1], a)));
    this.applyValue();
  };
  b.updateGraph = function() {
    this._fillPath && this._fillPath.remove();
    var a = Entry.toRadian(this.getValue()), b = 49 * Math.sin(a), d = -49 * Math.cos(a), a = a > Math.PI ? 1 : 0;
    this._fillPath = this.svgOptionGroup.elem("path", {d:"M 0,0 v -49 A 49,49 0 %LARGE 1 %X,%Y z".replace("%X", b).replace("%Y", d).replace("%LARGE", a), class:"entry-angle-fill-area"});
    this.svgOptionGroup.appendChild(this._dividerGroup);
    this._indicator && this._indicator.remove();
    this._indicator = this.svgOptionGroup.elem("line", {x1:0, y1:0, x2:b, y2:d});
    this._indicator.attr({class:"entry-angle-indicator"});
  };
  b.applyValue = function() {
    var a = this.optionGroup.val();
    isNaN(a) || "" === a || (a = this.modValue(a), this.setValue(a), this.updateGraph(), this.textElement.textContent = this.getValue(), this.optionGroup && this.optionGroup.val(a), this.resize());
  };
  b.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup && this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement ? this.textElement.getComputedTextLength() + 8 : 8;
  };
  b.getText = function() {
    return this.getValue() + "\u00b0";
  };
  b.modValue = function(a) {
    return a % 360;
  };
  b.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.svgOptionGroup && (this.svgOptionGroup.remove(), delete this.svgOptionGroup);
    this.textElement.textContent = this.getText();
    this.command();
  };
})(Entry.FieldAngle.prototype);
Entry.FieldBlock = function(b, a, c, d, e) {
  Entry.Model(this, !1);
  this._blockView = a;
  this._block = a.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = c;
  this.contentIndex = e;
  this._content = b;
  this.acceptType = b.accept;
  this._restoreCurrent = b.restore;
  this.view = this;
  this.svgGroup = null;
  this._position = b.position;
  this.box.observe(a, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard(), d);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldBlock);
(function(b) {
  b.schema = {magneting:!1};
  b.renderStart = function(a, b) {
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var d = this.getValue();
    d && !d.view && (d.setThread(this), d.createView(a, b), d.getThread().view.setParent(this));
    this.updateValueBlock(d);
    this._blockView.getBoard().constructor !== Entry.Board && this._valueBlock.view.removeControl();
  };
  b.align = function(a, b, d) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = this._valueBlock;
    f && (b = -.5 * f.view.height);
    f = "translate(" + a + "," + b + ")";
    void 0 === d || d ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.calcWH = function() {
    var a = this._valueBlock;
    a ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:15, height:20});
  };
  b.calcHeight = b.calcWH;
  b.destroy = function() {
  };
  b.inspectBlock = function() {
    var a = null;
    if (this._originBlock) {
      a = this._originBlock.type, delete this._originBlock;
    } else {
      switch(this.acceptType) {
        case "boolean":
          a = "True";
          break;
        case "string":
          a = "text";
          break;
        case "param":
          a = "function_field_label";
      }
    }
    return this._createBlockByType(a);
  };
  b._setValueBlock = function(a) {
    this._restoreCurrent && (this._originBlock = this._valueBlock);
    a || (a = this.inspectBlock());
    this._valueBlock = a;
    this.setValue(a);
    a.setThread(this);
    a.getThread().view.setParent(this);
    return this._valueBlock;
  };
  b.getValueBlock = function() {
    return this._valueBlock;
  };
  b.updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    this._destroyObservers();
    a = this._setValueBlock(a).view;
    a.bindPrev(this);
    this._blockView.alignContent();
    this._posObserver = a.observe(this, "updateValueBlock", ["x", "y"], !1);
    this._sizeObserver = a.observe(this, "calcWH", ["width", "height"]);
    a = this._blockView.getBoard();
    a.constructor === Entry.Board && a.generateCodeMagnetMap();
  };
  b._destroyObservers = function() {
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
  };
  b.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  b.getNextBlock = function() {
    return null;
  };
  b.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var b = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + b.x;
    a.y += this.box.y + b.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.isGlobal = function() {
    return !1;
  };
  b.separate = function(a) {
    this.getCode().createThread([a]);
    this.calcWH();
    this.changeEvent.notify();
  };
  b.getCode = function() {
    return this._block.thread.getCode();
  };
  b.cut = function(a) {
    return this._valueBlock === a ? [a] : null;
  };
  b.replace = function(a) {
    "string" === typeof a && (a = this._createBlockByType(a));
    var b = this._valueBlock;
    Entry.block[b.type].isPrimitive ? (b.doNotSplice = !0, b.destroy()) : "param" === this.acceptType ? (this._destroyObservers(), b.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(b)) : (this._destroyObservers(), b.view._toGlobalCoordinate(), this.separate(b), b.view.bumpAway(30, 150));
    this.updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
    this.changeEvent.notify();
  };
  b.setParent = function(a) {
    this._parent = a;
  };
  b.getParent = function() {
    return this._parent;
  };
  b._createBlockByType = function(a) {
    this._block.getThread();
    var b = this._blockView.getBoard();
    a = new Entry.Block({type:a}, this);
    var d = b.workspace, e;
    d && (e = d.getMode());
    a.createView(b, e);
    return a;
  };
  b.spliceBlock = function() {
    this.updateValueBlock();
  };
  b._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m 8,12 l -4,0 -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2 l 4,0 z", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0,12)"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  b.getThread = function() {
    return this;
  };
  b.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldBlock.prototype);
Entry.FieldColor = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._index = c;
  this._position = b.position;
  this.key = b.key;
  this.setValue(this.getValue() || "#FF0000");
  this._CONTENT_HEIGHT = this.getContentHeight();
  this._CONTENT_WIDTH = this.getContentWidth();
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldColor);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-field-color"});
    var a = this._CONTENT_HEIGHT, b = this._CONTENT_WIDTH, d = this._position, e;
    d ? (e = d.x || 0, d = d.y || 0) : (e = 0, d = -a / 2);
    this._header = this.svgGroup.elem("rect", {x:e, y:d, width:b, height:a, fill:this.getValue()});
    this._bindRenderOptions();
    this.box.set({x:e, y:d, width:b, height:a});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    var b = Entry.FieldColor.getWidgetColorList();
    this.optionGroup = Entry.Dom("table", {class:"entry-widget-color-table", parent:$("body")});
    for (var d = 0;d < b.length;d++) {
      for (var e = Entry.Dom("tr", {class:"entry-widget-color-row", parent:this.optionGroup}), f = 0;f < b[d].length;f++) {
        var g = Entry.Dom("td", {class:"entry-widget-color-cell", parent:e}), h = b[d][f];
        g.css({"background-color":h});
        g.attr({"data-color-value":h});
        (function(b, c) {
          b.mousedown(function(a) {
            a.stopPropagation();
          });
          b.mouseup(function(b) {
            a.applyValue(c);
            a.destroyOption();
            a._selectBlockView();
          });
        })(g, h);
      }
    }
    b = this.getAbsolutePosFromDocument();
    b.y += this.box.height / 2 + 1;
    this.optionGroup.css({left:b.x, top:b.y});
  };
  b.applyValue = function(a) {
    this.value != a && (this.setValue(a), this._header.attr({fill:a}));
  };
  b.getContentWidth = function() {
    return Entry.isMobile() ? 20 : 14.5;
  };
})(Entry.FieldColor.prototype);
Entry.FieldColor.getWidgetColorList = function() {
  return ["#FFFFFF #CCCCCC #C0C0C0 #999999 #666666 #333333 #000000".split(" "), "#FFCCCC #FF6666 #FF0000 #CC0000 #990000 #660000 #330000".split(" "), "#FFCC99 #FF9966 #FF9900 #FF6600 #CC6600 #993300 #663300".split(" "), "#FFFF99 #FFFF66 #FFCC66 #FFCC33 #CC9933 #996633 #663333".split(" "), "#FFFFCC #FFFF33 #FFFF00 #FFCC00 #999900 #666600 #333300".split(" "), "#99FF99 #66FF99 #33FF33 #33CC00 #009900 #006600 #003300".split(" "), "#99FFFF #33FFFF #66CCCC #00CCCC #339999 #336666 #003333".split(" "), "#CCFFFF #66FFFF #33CCFF #3366FF #3333FF #000099 #000066".split(" "), 
  "#CCCCFF #9999FF #6666CC #6633FF #6609CC #333399 #330099".split(" "), "#FFCCFF #FF99FF #CC66CC #CC33CC #993399 #663366 #330033".split(" ")];
};
Entry.FieldDropdown = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._noArrow = b.noArrow;
  this._arrowColor = b.arrowColor;
  this._index = c;
  this.setValue(this.getValue());
  this._CONTENT_HEIGHT = this.getContentHeight(b.dropdownHeight);
  this._FONT_SIZE = this.getFontSize(b.fontSize);
  this._ROUND = b.roundValue || 3;
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldDropdown);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this instanceof Entry.FieldDropdownDynamic && this._updateValue();
    var a = this._blockView, b = Entry.isMobile(), d = b ? 33 : 20, b = b ? 24 : 10;
    this.svgGroup = a.contentSvgGroup.elem("g", {class:"entry-field-dropdown"});
    this.textElement = this.svgGroup.elem("text", {x:5});
    this.textElement.textContent = this.getTextByValue(this.getValue());
    a = this.textElement.getBBox();
    this.textElement.attr({style:"white-space: pre;", "font-size":+this._FONT_SIZE + "px", y:.23 * a.height});
    d = this.textElement.getComputedTextLength() + d;
    this._noArrow && (d -= b);
    b = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:d, height:b, y:-b / 2, rx:this._ROUND, ry:this._ROUND, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._noArrow || (a = this.getArrow(), this._arrow = this.svgGroup.elem("polygon", {points:a.points, fill:a.color, stroke:a.color, transform:"translate(" + (d - a.width - 5) + "," + -a.height / 2 + ")"}));
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:d, height:b});
  };
  b.resize = function() {
    var a = Entry.isMobile(), b = a ? 33 : 20, a = a ? 24 : 10, b = this.textElement.getComputedTextLength() + b;
    this._noArrow ? b -= a : (a = this.getArrow(), this._arrow.attr({transform:"translate(" + (b - a.width - 5) + "," + -a.height / 2 + ")"}));
    this._header.attr({width:b});
    this.box.set({width:b});
    this._block.view.alignContent();
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    for (var b = this._contents.options, b = this._contents.options, d = 0, e = b.length;d < e;d++) {
      var f = b[d], g = f[0], f = f[1], h = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), k = Entry.Dom("span", {class:"left", parent:h});
      Entry.Dom("span", {class:"right", parent:h}).text(g);
      this.getValue() == f && k.text("\u2713");
      (function(b, c) {
        b.bind("mousedown touchstart", function(a) {
          a.stopPropagation();
        });
        b.bind("mouseup touchend", function(b) {
          b.stopPropagation();
          a.applyValue(c);
          a.destroyOption();
          a._selectBlockView();
        });
      })(h, f);
    }
    this._position();
  };
  b._position = function() {
    var a = this.getAbsolutePosFromDocument();
    a.y += this.box.height / 2;
    var b = $(document).height(), d = this.optionGroup.height(), e = this.optionGroup.width() + 30;
    if (b < a.y + d + 30) {
      var b = this._blockView.getBoard().svgDom.height(), f = this.getAbsolutePosFromBoard();
      this._blockView.y < b / 2 ? (a.x += this.box.width / 2 - e / 2, b -= f.y + 30, this.optionGroup.height(b)) : (a.x += this.box.width + 1, b -= b - f.y, b - 30 < d && this.optionGroup.height(b - b % 30), a.y -= this.optionGroup.height());
    } else {
      a.x += this.box.width / 2 - e / 2;
    }
    this.optionGroup.addClass("rendered");
    this.optionGroup.css({left:a.x, top:a.y, width:e});
    this.optionGroup.find(".right").width(e - 20);
  };
  b.applyValue = function(a) {
    this.value != a && this.setValue(a);
    this.textElement.textContent = this.getTextByValue(a);
    this.resize();
  };
  b.getTextByValue = function(a) {
    if (!a || "null" === a) {
      return Lang.Blocks.no_target;
    }
    for (var b = this._contents.options, d = 0, e = b.length;d < e;d++) {
      var f = b[d];
      if (f[1] == a) {
        return f[0];
      }
    }
    return Lang.Blocks.no_target;
  };
  b.getContentHeight = function(a) {
    return a = a || this._blockView.getSkeleton().dropdownHeight || (Entry.isMobile() ? 22 : 16);
  };
  b.getArrow = function() {
    var a = Entry.isMobile();
    return {color:this._arrowColor || this._blockView._schema.color, points:a ? "0,0 19,0 9.5,13" : "0,0 6.4,0 3.2,4.2", height:a ? 13 : 4.2, width:a ? 19 : 6.4};
  };
})(Entry.FieldDropdown.prototype);
Entry.FieldDropdownDynamic = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._index = c;
  this._arrowColor = b.arrowColor;
  c = this._contents.menuName;
  Entry.Utils.isFunction(c) ? this._menuGenerator = c : this._menuName = c;
  this._CONTENT_HEIGHT = this.getContentHeight(b.dropdownHeight);
  this._FONT_SIZE = this.getFontSize(b.fontSize);
  this._ROUND = b.roundValue || 3;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.FieldDropdown, Entry.FieldDropdownDynamic);
(function(b) {
  b.constructor = Entry.FieldDropDownDynamic;
  b._updateValue = function() {
    var a = this._block.getCode().object, b = [];
    Entry.container && (b = this._menuName ? Entry.container.getDropdownList(this._menuName, a) : this._menuGenerator());
    this._contents.options = b;
    (a = this.getValue()) && "null" != a || (a = 0 !== b.length ? b[0][1] : null);
    this.setValue(a);
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    var b;
    b = this._menuName ? Entry.container.getDropdownList(this._contents.menuName) : this._menuGenerator();
    this._contents.options = b;
    for (var d = 0;d < b.length;d++) {
      var e = b[d], f = e[0], e = e[1], g = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), h = Entry.Dom("span", {class:"left", parent:g});
      Entry.Dom("span", {class:"right", parent:g}).text(f);
      this.getValue() == e && h.text("\u2713");
      (function(b, c) {
        b.mousedown(function(a) {
          a.stopPropagation();
        });
        b.mouseup(function(b) {
          b.stopPropagation();
          a.applyValue(c);
          a.destroyOption();
          a._selectBlockView();
        });
      })(g, e);
    }
    this._position();
  };
})(Entry.FieldDropdownDynamic.prototype);
Entry.FieldImage = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this._content = b;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._imgElement = this._path = this.svgGroup = null;
  this._index = c;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldImage);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? this._content.img.replace(".png", "_un.png") : this._content.img;
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:this._imgUrl, x:0, y:-.5 * this._size, width:this._size, height:this._size});
    this.box.set({x:this._size, y:0, width:this._size, height:this._size});
  };
})(Entry.FieldImage.prototype);
Entry.FieldIndicator = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? b.img.replace(".png", "_un.png") : b.img;
  this._boxMultiplier = b.boxMultiplier || 2;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._index = c;
  this._imgElement = this._path = this.svgGroup = null;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldIndicator);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:Entry.mediaFilePath + this._imgUrl, x:this._position ? -1 * this._size : 0, y:-1 * this._size, width:2 * this._size, height:2 * this._size});
    var a = "m 0,-%s a %s,%s 0 1,1 -0.1,0 z".replace(/%s/gi, this._size);
    this._path = this.svgGroup.elem("path", {d:a, stroke:"none", fill:"none"});
    this.box.set({width:this._size * this._boxMultiplier + (this._position ? -this._size : 0), height:this._size * this._boxMultiplier});
  };
  b.enableHighlight = function() {
    var a = this._path.getTotalLength(), b = this._path;
    this._path.attr({stroke:this._highlightColor, strokeWidth:2, "stroke-linecap":"round", "stroke-dasharray":a + " " + a, "stroke-dashoffset":a});
    setInterval(function() {
      b.attr({"stroke-dashoffset":a}).animate({"stroke-dashoffset":0}, 300);
    }, 1400, mina.easeout);
    setTimeout(function() {
      setInterval(function() {
        b.animate({"stroke-dashoffset":-a}, 300);
      }, 1400, mina.easeout);
    }, 500);
  };
})(Entry.FieldIndicator.prototype);
Entry.Keyboard = {};
Entry.FieldKeyboard = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = c;
  this.setValue(String(this.getValue()));
  this._CONTENT_HEIGHT = this.getContentHeight();
  this._optionVisible = !1;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldKeyboard);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text").attr({x:5, y:4, "font-size":"11px"});
    this.textElement.textContent = Entry.getKeyCodeMap()[this.getValue()];
    var a = this.getTextWidth() + 1, b = this._CONTENT_HEIGHT, d = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:d - b / 2, width:a, height:b, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:b});
  };
  b.renderOptions = function() {
    Entry.keyPressed && (this.keyPressed = Entry.keyPressed.attach(this, this._keyboardControl));
    this._optionVisible = !0;
    this._attachDisposeEvent();
    var a = this.getAbsolutePosFromDocument();
    a.x -= this.box.width / 2;
    a.y += this.box.height / 2 + 1;
    this.optionGroup = Entry.Dom("img", {class:"entry-widget-keyboard-input", src:Entry.mediaFilePath + "/media/keyboard_workspace.png", parent:$("body")});
    this.optionGroup.css({left:a.x, top:a.y});
  };
  b.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.disposeEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this._optionVisible = !1;
    this.command();
    this.keyPressed && (Entry.keyPressed.detach(this.keyPressed), delete this.keyPressed);
  };
  b._keyboardControl = function(a) {
    a.stopPropagation();
    if (this._optionVisible) {
      a = a.keyCode;
      var b = Entry.getKeyCodeMap()[a];
      void 0 !== b && this.applyValue(b, a);
    }
  };
  b.applyValue = function(a, b) {
    this.setValue(String(b));
    this.destroyOption();
    this.textElement.textContent = a;
    this.resize();
  };
  b.resize = function() {
    var a = this.getTextWidth() + 1;
    this._header.attr({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 10;
  };
  b.destroy = function() {
    this.destroyOption();
    Entry.keyPressed && this.keyPressed && Entry.keyPressed.detach(this.keyPressed);
  };
})(Entry.FieldKeyboard.prototype);
Entry.FieldLineBreak = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this._index = c;
  this.box = new Entry.BoxModel;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldLineBreak);
(function(b) {
  b.renderStart = function() {
  };
  b.align = function(a) {
    var b = this._blockView;
    0 !== b._statements.length && this.box.set({y:(b._statements[a].height || 20) + Math.max(b.contentHeight % 1E3, 30)});
  };
})(Entry.FieldLineBreak.prototype);
Entry.FieldOutput = function(b, a, c, d, e) {
  Entry.Model(this, !1);
  this._blockView = a;
  this._block = a.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = c;
  this.contentIndex = e;
  this._content = b;
  this.acceptType = b.accept;
  this.view = this;
  this.svgGroup = null;
  this._position = b.position;
  this.box.observe(a, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard(), d);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldOutput);
(function(b) {
  b.schema = {magneting:!1};
  b.renderStart = function(a, b) {
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var d = this.getValue();
    d && !d.view && (d.setThread(this), d.createView(a, b));
    this._updateValueBlock(d);
    this._blockView.getBoard().constructor == Entry.BlockMenu && this._valueBlock && this._valueBlock.view.removeControl();
  };
  b.align = function(a, b, d) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = this._valueBlock;
    f && (b = -.5 * f.view.height);
    f = "translate(" + a + "," + b + ")";
    void 0 === d || d ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.calcWH = function() {
    var a = this._valueBlock;
    a ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:0, height:20});
  };
  b.calcHeight = b.calcWH;
  b.destroy = function() {
  };
  b._inspectBlock = function() {
  };
  b._setValueBlock = function(a) {
    if (a != this._valueBlock || !this._valueBlock) {
      return this._valueBlock = a, this.setValue(a), a && a.setThread(this), this._valueBlock;
    }
  };
  b._updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
    (a = this._setValueBlock(a)) ? (a = a.view, a.bindPrev(), this._posObserver = a.observe(this, "_updateValueBlock", ["x", "y"], !1), this._sizeObserver = a.observe(this, "calcWH", ["width", "height"])) : this.calcWH();
    this._blockView.alignContent();
    a = this._blockView.getBoard();
    a.constructor === Entry.Board && a.generateCodeMagnetMap();
  };
  b.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  b.getNextBlock = function() {
    return null;
  };
  b.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var b = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + b.x;
    a.y += this.box.y + b.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.isGlobal = function() {
    return !1;
  };
  b.separate = function(a) {
    this.getCode().createThread([a]);
    this.changeEvent.notify();
  };
  b.getCode = function() {
    return this._block.thread.getCode();
  };
  b.cut = function(a) {
    return this._valueBlock === a ? (delete this._valueBlock, [a]) : null;
  };
  b._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m -4,-12 h 3 l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2 h -3 ", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0," + (this._valueBlock ? 12 : 0) + ")"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  b.replace = function(a) {
    var b = this._valueBlock;
    b && (b.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(b));
    this._updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
  };
  b.setParent = function(a) {
    this._parent = a;
  };
  b.getParent = function() {
    return this._parent;
  };
  b.getThread = function() {
    return this;
  };
  b.getValueBlock = function() {
    return this._valueBlock;
  };
  b.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldOutput.prototype);
Entry.FieldStatement = function(b, a, c) {
  Entry.Model(this, !1);
  this._blockView = a;
  this.block = a.block;
  this.view = this;
  this._index = c;
  this.acceptType = b.accept;
  this._thread = this.statementSvgGroup = this.svgGroup = null;
  this._position = b.position;
  this.observe(a, "alignContent", ["height"], !1);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard());
};
(function(b) {
  b.schema = {x:0, y:0, width:100, height:20, magneting:!1};
  b.magnet = {next:{x:0, y:0}};
  b.renderStart = function(a) {
    this.svgGroup = this._blockView.statementSvgGroup.elem("g");
    this._nextGroup = this.statementSvgGroup = this.svgGroup.elem("g");
    this._initThread(a);
    this._board = a;
  };
  b._initThread = function(a) {
    var b = this.getValue();
    this._thread = b;
    b.createView(a);
    b.view.setParent(this);
    if (a = b.getFirstBlock()) {
      a.view._toLocalCoordinate(this.statementSvgGroup), this.firstBlock = a;
    }
    b.changeEvent.attach(this, this.calcHeight);
    b.changeEvent.attach(this, this.checkTopBlock);
    this.calcHeight();
  };
  b.align = function(a, b, d) {
    d = void 0 === d ? !0 : d;
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = "translate(" + a + "," + b + ")";
    this.set({x:a, y:b});
    d ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
  };
  b.calcHeight = function() {
    var a = this._thread.view.requestPartHeight(null);
    this.set({height:a});
  };
  b.getValue = function() {
    return this.block.statements[this._index];
  };
  b.requestAbsoluteCoordinate = function() {
    var a = this._blockView.getAbsoluteCoordinate();
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.destroy = function() {
  };
  b._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      if (this.magneting) {
        var a = this._board.dragBlock.getShadow(), b = this.requestAbsoluteCoordinate(), b = "translate(" + b.x + "," + b.y + ")";
        $(a).attr({transform:b, display:"block"});
        this._clonedShadow = a;
        this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
        a = this._board.dragBlock.getBelowHeight();
        this.statementSvgGroup.attr({transform:"translate(0," + a + ")"});
        this.set({height:this.height + a});
      } else {
        this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), delete this.originalHeight), this.statementSvgGroup.attr({transform:"translate(0,0)"}), this.calcHeight();
      }
      (a = this.block.thread.changeEvent) && a.notify();
    }
  };
  b.insertTopBlock = function(a) {
    this._posObserver && this._posObserver.destroy();
    var b = this.firstBlock;
    (this.firstBlock = a) && a.doInsert(this._thread);
    return b;
  };
  b.getNextBlock = function() {
    return this.firstBlock;
  };
  b.checkTopBlock = function() {
    var a = this._thread.getFirstBlock();
    a && this.firstBlock !== a ? (this.firstBlock = a, a.view.bindPrev(this), a._updatePos()) : a || (this.firstBlock = null);
  };
})(Entry.FieldStatement.prototype);
Entry.FieldText = function(b, a, c) {
  this._block = a.block;
  this._blockView = a;
  this._index = c;
  this.box = new Entry.BoxModel;
  this._fontSize = b.fontSize || a.getSkeleton().fontSize || 12;
  this._color = b.color || this._block.getSchema().fontColor || a.getSkeleton().color || "white";
  this._align = b.align || "left";
  this._text = this.getValue() || b.text;
  this.setValue(null);
  this.textElement = null;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldText);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._text = this._text.replace(/(\r\n|\n|\r)/gm, " ");
    this.textElement = this.svgGroup.elem("text").attr({style:"white-space: pre;", "font-size":this._fontSize + "px", "font-family":"nanumBarunRegular", "class":"dragNone", fill:this._color});
    this.textElement.textContent = this._text;
    var a = 0, b = this.textElement.getBoundingClientRect();
    "center" == this._align && (a = -b.width / 2);
    this.textElement.attr({x:a, y:.25 * b.height});
    this.box.set({x:0, y:0, width:b.width, height:b.height});
  };
})(Entry.FieldText.prototype);
Entry.FieldTextInput = function(b, a, c) {
  this._blockView = a;
  this._block = a.block;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = c;
  this.value = this.getValue() || "";
  this._CONTENT_HEIGHT = this.getContentHeight();
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldTextInput);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.svgGroup.attr({class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:3, y:4, "font-size":"12px"});
    this.textElement.textContent = this.truncate();
    var a = this.getTextWidth(), b = this.position && this.position.y ? this.position.y : 0, d = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:a, height:d, y:b - d / 2, rx:3, ry:3, fill:"transparent"});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:d});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.getValue());
    this.optionGroup.on("mousedown", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(b) {
      var c = b.keyCode || b.which;
      a.applyValue(b);
      -1 < [13, 27].indexOf(c) && a.destroyOption();
    });
    var b = this.getAbsolutePosFromDocument();
    b.y -= this.box.height / 2;
    this.optionGroup.css({height:this._CONTENT_HEIGHT, left:b.x, top:b.y, width:a.box.width});
    this.optionGroup.focus();
    b = this.optionGroup[0];
    b.setSelectionRange(0, b.value.length, "backward");
  };
  b.applyValue = function(a) {
    a = this.optionGroup.val();
    this.setValue(a);
    this.textElement.textContent = this.truncate();
    this.resize();
  };
  b.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 6 + 2;
  };
})(Entry.FieldTextInput.prototype);
Entry.GlobalSvg = {};
(function(b) {
  b.DONE = 0;
  b._inited = !1;
  b.REMOVE = 1;
  b.RETURN = 2;
  b.createDom = function() {
    if (!this.inited) {
      $("#globalSvgSurface").remove();
      $("#globalSvg").remove();
      var a = $("body");
      this._container = Entry.Dom("div", {classes:["globalSvgSurface", "entryRemove"], id:"globalSvgSurface", parent:a});
      this.svgDom = Entry.Dom($('<svg id="globalSvg" width="10" height="10"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this._container});
      this.svg = Entry.SVG("globalSvg");
      this.top = this.left = 0;
      this._inited = !0;
    }
  };
  b.setView = function(a, b) {
    if (a != this._view && !a.block.isReadOnly() && a.movable) {
      return this._view = a, this._mode = b, b !== Entry.Workspace.MODE_VIMBOARD && a.set({visible:!1}), this.draw(), this.show(), this.align(), this.position(), !0;
    }
  };
  b.draw = function() {
    var a = this._view;
    this._svg && this.remove();
    var b = this._mode == Entry.Workspace.MODE_VIMBOARD;
    this.svgGroup = Entry.SVG.createElement(a.svgGroup.cloneNode(!0), {opacity:1});
    this.svg.appendChild(this.svgGroup);
    b && (a = $(this.svgGroup), a.find("g").css({filter:"none"}), a.find("path").velocity({opacity:0}, {duration:500}), a.find("text").velocity({fill:"#000000"}, {duration:530}));
  };
  b.remove = function() {
    this.svgGroup && (this.svgGroup.remove(), delete this.svgGroup, delete this._view, delete this._offsetX, delete this._offsetY, delete this._startX, delete this._startY, this.hide());
  };
  b.align = function() {
    var a = this._view.getSkeleton().box(this._view).offsetX || 0, b = this._view.getSkeleton().box(this._view).offsetY || 0, a = -1 * a + 1, b = -1 * b + 1;
    this._offsetX = a;
    this._offsetY = b;
    this.svgGroup.attr({transform:"translate(" + a + "," + b + ")"});
  };
  b.show = function() {
    this._container.removeClass("entryRemove");
  };
  b.hide = function() {
    this._container.addClass("entryRemove");
  };
  b.position = function() {
    var a = this._view;
    if (a) {
      var b = a.getAbsoluteCoordinate(), a = a.getBoard().offset();
      this.left = b.x + a.left - this._offsetX;
      this.top = b.y + a.top - this._offsetY;
      this.svgDom.css({transform:"translate3d(" + this.left + "px," + this.top + "px, 0px)"});
    }
  };
  b.terminateDrag = function(a) {
    var b = Entry.mouseCoordinate, d = a.getBoard(), e = d.workspace.blockMenu, f = e.offset().left, g = e.offset().top, h = e.visible ? e.svgDom.width() : 0;
    return b.y > d.offset().top - 20 && b.x > f + h ? this.DONE : b.y > g && b.x > f && e.visible ? a.block.isDeletable() ? this.REMOVE : this.RETURN : this.RETURN;
  };
  b.addControl = function(a) {
    this.onMouseDown.apply(this, arguments);
  };
  b.onMouseDown = function(a) {
    function b(a) {
      var c = a.pageX;
      a = a.pageY;
      var d = e.left + (c - e._startX), f = e.top + (a - e._startY);
      e.svgDom.css({left:d, top:f});
      e._startX = c;
      e._startY = a;
      e.left = d;
      e.top = f;
    }
    function d(a) {
      $(document).unbind(".block");
    }
    this._startY = a.pageY;
    var e = this;
    a.stopPropagation();
    a.preventDefault();
    var f = $(document);
    f.bind("mousemove.block", b);
    f.bind("mouseup.block", d);
    f.bind("touchmove.block", b);
    f.bind("touchend.block", d);
    this._startX = a.pageX;
    this._startY = a.pageY;
  };
})(Entry.GlobalSvg);
Entry.Mutator = function() {
};
(function(b) {
  b.mutate = function(a, b) {
    var d = Entry.block[a];
    void 0 === d.changeEvent && (d.changeEvent = new Entry.Event);
    d.template = b.template;
    d.params = b.params;
    d.changeEvent.notify(1);
  };
})(Entry.Mutator);
(function(b) {
})(Entry.Mutator.prototype);
Entry.RenderView = function(b, a) {
  this._align = a || "CENTER";
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = b;
  this.viewOnly = !0;
  this.suffix = "renderView";
  this.disableMouseEvent = this.visible = !0;
  this._svgId = "renderView_" + (new Date).getTime();
  this._generateView();
  this.offset = this.svgDom.offset();
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.svg && (this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
};
(function(b) {
  b.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  b._generateView = function() {
    this.renderViewContainer = Entry.Dom("div", {"class":"renderViewContainer", parent:this.view});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="renderView" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.renderViewContainer});
  };
  b.changeCode = function(a) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.code = a;
    this.svg || (this.svg = Entry.SVG(this._svgId), this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
    a.createView(this);
    this.align();
    this.resize();
  };
  b.align = function() {
    var a = this.code.getThreads();
    if (a && 0 !== a.length) {
      for (var b = 0, d = "LEFT" == this._align ? 20 : this.svgDom.width() / 2, e = 0, f = a.length;e < f;e++) {
        var g = a[e].getFirstBlock().view;
        g._moveTo(d, b - g.offsetY, !1);
        g = g.svgGroup.getBBox().height;
        b += g + 15;
      }
      this._bBox = this.svgGroup.getBBox();
      this.height = this._bBox.height;
    }
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.setWidth = function() {
    this._svgWidth = this.svgDom.width();
    this.offset = this.svgDom.offset();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  b.resize = function() {
    this.svg && this._bBox && $(this.svg).css("height", this._bBox.height + 10);
  };
})(Entry.RenderView.prototype);
Entry.Scroller = function(b, a, c) {
  this._horizontal = void 0 === a ? !0 : a;
  this._vertical = void 0 === c ? !0 : c;
  this.board = b;
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hRatio = this.hX = this.hWidth = 0;
  this._visible = !0;
  this._opacity = -1;
  this.createScrollBar();
  this.setOpacity(0);
  this._bindEvent();
  this._scrollCommand = _.debounce(Entry.do, 200);
};
Entry.Scroller.RADIUS = 7;
(function(b) {
  b.createScrollBar = function() {
    var a = Entry.Scroller.RADIUS, b = this;
    this.svgGroup = this.board.svg.elem("g").attr({class:"boardScrollbar"});
    this._horizontal && (this.hScrollbar = this.svgGroup.elem("rect", {height:2 * a, rx:a, ry:a}), this.hScrollbar.mousedown = function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var d = b.dragInstance;
        b.scroll((a.pageX - d.offsetX) / b.hRatio, 0);
        d.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    });
    this._vertical && (this.vScrollbar = this.svgGroup.elem("rect", {width:2 * a, rx:a, ry:a}), this.vScrollbar.mousedown = function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var d = b.dragInstance;
        b.scroll(0, (a.pageY - d.offsetY) / b.vRatio);
        d.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    });
  };
  b.updateScrollBar = function(a, b) {
    this._horizontal && (this.hX += a * this.hRatio, this.hScrollbar.attr({x:this.hX}));
    this._vertical && (this.vY += b * this.vRatio, this.vScrollbar.attr({y:this.vY}));
  };
  b.scroll = function(a, b) {
    if (this.board.code) {
      var d = this.board.svgBlockGroup.getBoundingClientRect(), e = this.board.svgDom, f = d.left - this.board.offset().left, g = d.top - this.board.offset().top, h = d.height;
      a = Math.max(-d.width + Entry.BOARD_PADDING - f, a);
      b = Math.max(-h + Entry.BOARD_PADDING - g, b);
      a = Math.min(e.width() - Entry.BOARD_PADDING - f, a);
      b = Math.min(e.height() - Entry.BOARD_PADDING - g, b);
      this._scroll(a, b);
      this._diffs || (this._diffs = [0, 0]);
      this._diffs[0] += a;
      this._diffs[1] += b;
      this._scrollCommand("scrollBoard", this._diffs[0], this._diffs[1], !0);
    }
  };
  b._scroll = function(a, b) {
    this.board.code.moveBy(a, b);
    this.updateScrollBar(a, b);
  };
  b.setVisible = function(a) {
    a != this.isVisible() && (this._visible = a, this.svgGroup.attr({display:!0 === a ? "block" : "none"}));
  };
  b.isVisible = function() {
    return this._visible;
  };
  b.setOpacity = function(a) {
    this._opacity != a && (this.hScrollbar.attr({opacity:a}), this.vScrollbar.attr({opacity:a}), this._opacity = a);
  };
  b.resizeScrollBar = function() {
    if (this._visible) {
      var a = this.board, b = a.svgBlockGroup.getBoundingClientRect(), d = a.svgDom, e = d.width(), d = d.height(), f = b.left - a.offset().left, a = b.top - a.offset().top, g = b.width, b = b.height;
      if (this._horizontal) {
        var h = -g + Entry.BOARD_PADDING, k = e - Entry.BOARD_PADDING, g = (e + 2 * Entry.Scroller.RADIUS) * g / (k - h + g);
        isNaN(g) && (g = 0);
        this.hX = (f - h) / (k - h) * (e - g - 2 * Entry.Scroller.RADIUS);
        this.hScrollbar.attr({width:g, x:this.hX, y:d - 2 * Entry.Scroller.RADIUS});
        this.hRatio = (e - g - 2 * Entry.Scroller.RADIUS) / (k - h);
      }
      this._vertical && (f = -b + Entry.BOARD_PADDING, g = d - Entry.BOARD_PADDING, b = (d + 2 * Entry.Scroller.RADIUS) * b / (g - f + b), this.vY = (a - f) / (g - f) * (d - b - 2 * Entry.Scroller.RADIUS), this.vScrollbar.attr({height:b, y:this.vY, x:e - 2 * Entry.Scroller.RADIUS}), this.vRatio = (d - b - 2 * Entry.Scroller.RADIUS) / (g - f));
    }
  };
  b._bindEvent = function() {
    var a = _.debounce(this.resizeScrollBar, 200);
    this.board.changeEvent.attach(this, a);
    Entry.windowResized && Entry.windowResized.attach(this, a);
  };
})(Entry.Scroller.prototype);
Entry.Board = function(b) {
  Entry.Model(this, !1);
  this.changeEvent = new Entry.Event(this);
  this.createView(b);
  this.updateOffset();
  this.scroller = new Entry.Scroller(this, !0, !0);
  this._magnetMap = {};
  Entry.ANIMATION_DURATION = 200;
  Entry.BOARD_PADDING = 100;
  this._initContextOptions();
  Entry.Utils.disableContextmenu(this.svgDom);
  this._addControl();
  this._bindEvent();
};
Entry.Board.OPTION_PASTE = 0;
Entry.Board.OPTION_ALIGN = 1;
Entry.Board.OPTION_CLEAR = 2;
Entry.Board.OPTION_DOWNLOAD = 3;
Entry.Board.DRAG_RADIUS = 5;
(function(b) {
  b.schema = {code:null, dragBlock:null, magnetedBlockView:null, selectedBlockView:null};
  b.createView = function(a) {
    var b = a.dom, b = "string" === typeof b ? $("#" + b) : $(b);
    if ("DIV" !== b.prop("tagName")) {
      return console.error("Dom is not div element");
    }
    this.view = b;
    this._svgId = "play" + (new Date).getTime();
    this.workspace = a.workspace;
    this._activatedBlockView = null;
    this.wrapper = Entry.Dom("div", {parent:b, class:"entryBoardWrapper"});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="entryBoard" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.wrapper});
    this.visible = !0;
    var d = this;
    this.svg = Entry.SVG(this._svgId);
    $(window).scroll(function() {
      d.updateOffset();
    });
    this.svgGroup = this.svg.elem("g");
    this.svgThreadGroup = this.svgGroup.elem("g");
    this.svgThreadGroup.board = this;
    this.svgBlockGroup = this.svgGroup.elem("g");
    this.svgBlockGroup.board = this;
    a.isOverlay ? (this.wrapper.addClass("entryOverlayBoard"), this.generateButtons(), this.suffix = "overlayBoard") : this.suffix = "board";
    Entry.Utils.addFilters(this.svg, this.suffix);
    a = Entry.Utils.addBlockPattern(this.svg, this.suffix);
    this.patternRect = a.rect;
    this.pattern = a.pattern;
  };
  b.changeCode = function(a) {
    this.code && this.codeListener && this.code.changeEvent.detach(this.codeListener);
    this.set({code:a});
    var b = this;
    a && (this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    }), a.createView(this));
    this.scroller.resizeScrollBar();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  b.setMagnetedBlock = function(a, b) {
    if (this.magnetedBlockView) {
      if (this.magnetedBlockView === a) {
        return;
      }
      this.magnetedBlockView.set({magneting:!1});
    }
    this.set({magnetedBlockView:a});
    a && (a.set({magneting:b}), a.dominate());
  };
  b.getCode = function() {
    return this.code;
  };
  b.findById = function(a) {
    return this.code.findById(a);
  };
  b._addControl = function() {
    var a = this.svgDom, b = this;
    a.mousedown(function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.bind("touchstart", function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.on("wheel", function() {
      b.mouseWheel.apply(b, arguments);
    });
    var d = b.scroller;
    d && (a.mouseenter(function(a) {
      d.setOpacity(1);
    }), a.mouseleave(function(a) {
      d.setOpacity(0);
    }));
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = Entry.Utils.convertMouseEvent(a);
      var c = e.mouseDownCoordinate;
      Math.sqrt(Math.pow(a.pageX - c.x, 2) + Math.pow(a.pageY - c.y, 2)) < Entry.Board.DRAG_RADIUS || (f && (clearTimeout(f), f = null), c = e.dragInstance, e.scroller.scroll(a.pageX - c.offsetX, a.pageY - c.offsetY), c.set({offsetX:a.pageX, offsetY:a.pageY}));
    }
    function d(a) {
      f && (clearTimeout(f), f = null);
      $(document).unbind(".entryBoard");
      delete e.mouseDownCoordinate;
      delete e.dragInstance;
    }
    if (this.workspace.getMode() != Entry.Workspace.MODE_VIMBOARD) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      var e = this, f = null;
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        var g = a.type, h = Entry.Utils.convertMouseEvent(a);
        Entry.documentMousedown && Entry.documentMousedown.notify(h);
        var k = $(document);
        this.mouseDownCoordinate = {x:h.pageX, y:h.pageY};
        k.bind("mousemove.entryBoard", b);
        k.bind("mouseup.entryBoard", d);
        k.bind("touchmove.entryBoard", b);
        k.bind("touchend.entryBoard", d);
        this.dragInstance = new Entry.DragInstance({startX:h.pageX, startY:h.pageY, offsetX:h.pageX, offsetY:h.pageY});
        "touchstart" === g && (f = setTimeout(function() {
          f && (f = null, d(), e._rightClick(a));
        }, 1E3));
      } else {
        Entry.Utils.isRightButton(a) && this._rightClick(a);
      }
    }
  };
  b.mouseWheel = function(a) {
    a = a.originalEvent;
    a.preventDefault();
    var b = Entry.disposeEvent;
    b && b.notify(a);
    this.scroller.scroll(a.wheelDeltaX || -a.deltaX, a.wheelDeltaY || -a.deltaY);
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
  b._keyboardControl = function(a) {
    var b = this.selectedBlockView;
    b && 46 == a.keyCode && b.block && !Entry.Utils.isInInput(a) && (Entry.do("destroyBlock", b.block), this.set({selectedBlockView:null}));
  };
  b.hide = function() {
    this.wrapper.addClass("entryRemove");
    this.visible = !1;
  };
  b.show = function() {
    this.wrapper.removeClass("entryRemove");
    this.visible = !0;
  };
  b.alignThreads = function() {
    for (var a = this.svgDom.height(), b = this.code.getThreads(), d = 15, e = 0, a = a - 30, f = 50, g = 0;g < b.length;g++) {
      var h = b[g].getFirstBlock();
      if (h) {
        var h = h.view, k = h.svgGroup.getBBox(), l = d + 15;
        l > a && (f = f + e + 10, e = 0, d = 15);
        e = Math.max(e, k.width);
        l = d + 15;
        h._moveTo(f, l, !1);
        d = d + k.height + 15;
      }
    }
    this.scroller.resizeScrollBar();
  };
  b.clear = function() {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
  };
  b.updateOffset = function() {
    this._offset = this.svg.getBoundingClientRect();
    var a = $(window), b = a.scrollTop(), a = a.scrollLeft(), d = this._offset;
    this.relativeOffset = {top:d.top - b, left:d.left - a};
    this.btnWrapper && this.btnWrapper.attr({transform:"translate(" + (d.width / 2 - 65) + "," + (d.height - 200) + ")"});
  };
  b.generateButtons = function() {
    var a = this, b = this.svgGroup.elem("g");
    this.btnWrapper = b;
    var d = b.elem("text", {x:27, y:33, class:"entryFunctionButtonText"});
    d.textContent = Lang.Buttons.save;
    var e = b.elem("text", {x:102.5, y:33, class:"entryFunctionButtonText"});
    e.textContent = Lang.Buttons.cancel;
    var f = b.elem("circle", {cx:27.5, cy:27.5, r:27.5, class:"entryFunctionButton"}), b = b.elem("circle", {cx:102.5, cy:27.5, r:27.5, class:"entryFunctionButton"});
    $(f).bind("mousedown touchstart", function() {
      a.save();
    });
    $(d).bind("mousedown touchstart", function() {
      a.save();
    });
    $(b).bind("mousedown touchstart", function() {
      a.cancelEdit();
    });
    $(e).bind("mousedown touchstart", function() {
      a.cancelEdit();
    });
  };
  b.cancelEdit = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "cancelEdit");
  };
  b.save = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "save");
  };
  b.generateCodeMagnetMap = function() {
    var a = this.code;
    if (a && this.dragBlock) {
      for (var b in this.dragBlock.magnet) {
        var d = this._getCodeBlocks(a, b);
        d.sort(function(a, b) {
          return a.point - b.point;
        });
        d.unshift({point:-Number.MAX_VALUE, blocks:[]});
        for (var e = 1;e < d.length;e++) {
          var f = d[e], g = f, h = f.startBlock;
          if (h) {
            for (var k = f.endPoint, l = e;k > g.point && (g.blocks.push(h), l++, g = d[l], g);) {
            }
            delete f.startBlock;
          }
          f.endPoint = Number.MAX_VALUE;
          d[e - 1].endPoint = f.point;
        }
        this._magnetMap[b] = d;
      }
    }
  };
  b._getCodeBlocks = function(a, b) {
    var d = a.getThreads(), e = [], f;
    switch(b) {
      case "previous":
        f = this._getNextMagnets;
        break;
      case "next":
        f = this._getPreviousMagnets;
        break;
      case "string":
        f = this._getFieldMagnets;
        break;
      case "boolean":
        f = this._getFieldMagnets;
        break;
      case "param":
        f = this._getOutputMagnets;
        break;
      default:
        return [];
    }
    for (var g = 0;g < d.length;g++) {
      var h = d[g], e = e.concat(f.call(this, h, h.view.zIndex, null, b))
    }
    return e;
  };
  b._getNextMagnets = function(a, b, d, e) {
    var f = a.getBlocks(), g = [], h = [];
    d || (d = {x:0, y:0});
    var k = d.x;
    d = d.y;
    for (var l = 0;l < f.length;l++) {
      var n = f[l], m = n.view;
      m.zIndex = b;
      if (m.dragInstance) {
        break;
      }
      d += m.y;
      k += m.x;
      a = d + 1;
      m.magnet.next && (a += m.height, h.push({point:d, endPoint:a, startBlock:n, blocks:[]}), h.push({point:a, blocks:[]}), m.absX = k);
      n.statements && (b += .01);
      for (var q = 0;q < n.statements.length;q++) {
        a = n.statements[q];
        var r = n.view._statements[q];
        r.zIndex = b;
        r.absX = k + r.x;
        h.push({point:r.y + d - 30, endPoint:r.y + d, startBlock:r, blocks:[]});
        h.push({point:r.y + d + r.height, blocks:[]});
        b += .01;
        g = g.concat(this._getNextMagnets(a, b, {x:r.x + k, y:r.y + d}, e));
      }
      m.magnet.next && (d += m.magnet.next.y, k += m.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getPreviousMagnets = function(a, b, d, e) {
    var f = a.getBlocks();
    a = [];
    d || (d = {x:0, y:0});
    e = d.x;
    d = d.y;
    var f = f[0], g = f.view;
    g.zIndex = b;
    if (g.dragInstance) {
      return [];
    }
    d += g.y - 15;
    e += g.x;
    return g.magnet.previous ? (b = d + 1 + g.height, a.push({point:d, endPoint:b, startBlock:f, blocks:[]}), a.push({point:b, blocks:[]}), g.absX = e, a) : [];
  };
  b._getFieldMagnets = function(a, b, d, e) {
    var f = a.getBlocks(), g = [], h = [];
    d || (d = {x:0, y:0});
    var k = d.x;
    d = d.y;
    for (var l = 0;l < f.length;l++) {
      var n = f[l], m = n.view;
      if (m.dragInstance) {
        break;
      }
      m.zIndex = b;
      d += m.y;
      k += m.x;
      h = h.concat(this._getFieldBlockMetaData(m, k, d, b, e));
      n.statements && (b += .01);
      for (var q = 0;q < n.statements.length;q++) {
        a = n.statements[q];
        var r = n.view._statements[q], g = g.concat(this._getFieldMagnets(a, b, {x:r.x + k, y:r.y + d}, e));
      }
      m.magnet.next && (d += m.magnet.next.y, k += m.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getFieldBlockMetaData = function(a, b, d, e, f) {
    var g = a._contents, h = [];
    d += a.contentPos.y;
    for (var k = 0;k < g.length;k++) {
      var l = g[k];
      if (l instanceof Entry.FieldBlock) {
        var n = l._valueBlock;
        if (!n.view.dragInstance && (l.acceptType === f || "boolean" === l.acceptType)) {
          var m = b + l.box.x, q = d + l.box.y + a.contentHeight % 1E3 * -.5, r = d + l.box.y + l.box.height;
          l.acceptType === f && (h.push({point:q, endPoint:r, startBlock:n, blocks:[]}), h.push({point:r, blocks:[]}));
          l = n.view;
          l.absX = m;
          l.zIndex = e;
          h = h.concat(this._getFieldBlockMetaData(l, m + l.contentPos.x, q + l.contentPos.y, e + .01, f));
        }
      }
    }
    return h;
  };
  b._getOutputMagnets = function(a, b, d, e) {
    var f = a.getBlocks(), g = [], h = [];
    d || (d = {x:0, y:0});
    var k = d.x;
    d = d.y;
    for (var l = 0;l < f.length;l++) {
      var n = f[l], m = n.view;
      if (m.dragInstance) {
        break;
      }
      m.zIndex = b;
      d += m.y;
      k += m.x;
      h = h.concat(this._getOutputMetaData(m, k, d, b, e));
      n.statements && (b += .01);
      for (var q = 0;q < n.statements.length;q++) {
        a = n.statements[q];
        var r = n.view._statements[q], g = g.concat(this._getOutputMagnets(a, b, {x:r.x + k, y:r.y + d}, e));
      }
      m.magnet.next && (d += m.magnet.next.y, k += m.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getOutputMetaData = function(a, b, d, e, f) {
    var g = a._contents, h = [];
    b += a.contentPos.x;
    d += a.contentPos.y;
    for (a = 0;a < g.length;a++) {
      var k = g[a], l = b + k.box.x, n = d - 24, m = d;
      k instanceof Entry.FieldBlock ? (k.acceptType === f && (h.push({point:n, endPoint:m, startBlock:k, blocks:[]}), h.push({point:m, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20), (n = k._valueBlock) && (h = h.concat(this._getOutputMetaData(n.view, l, d + k.box.y, e + .01, f)))) : k instanceof Entry.FieldOutput && k.acceptType === f && (h.push({point:n, endPoint:m, startBlock:k, blocks:[]}), h.push({point:m, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20, (n = k._valueBlock) && (n.view.dragInstance || 
      (h = h.concat(this._getOutputMetaData(n.view, b + k.box.x, d + k.box.y, e + .01, f)))));
    }
    return h;
  };
  b.getNearestMagnet = function(a, b, d) {
    var e = this._magnetMap[d];
    if (e && 0 !== e.length) {
      var f = 0, g = e.length - 1, h, k = null, l = "previous" === d ? b - 15 : b;
      for (b = -1 < ["previous", "next"].indexOf(d) ? 20 : 0;f <= g;) {
        if (h = (f + g) / 2 | 0, d = e[h], l < d.point) {
          g = h - 1;
        } else {
          if (l > d.endPoint) {
            f = h + 1;
          } else {
            e = d.blocks;
            for (f = 0;f < e.length;f++) {
              if (g = e[f].view, g.absX - b < a && a < g.absX + g.width && (g = d.blocks[f], !k || k.view.zIndex < g.view.zIndex)) {
                k = d.blocks[f];
              }
            }
            return k;
          }
        }
      }
      return null;
    }
  };
  b.dominate = function(a) {
    a && (a = a.getFirstBlock()) && (this.svgBlockGroup.appendChild(a.view.svgGroup), this.code.dominate(a.thread));
  };
  b.setPatternRectFill = function(a) {
    this.patternRect.attr({fill:a});
    this.pattern.attr({style:""});
  };
  b.disablePattern = function() {
    this.pattern.attr({style:"display: none"});
  };
  b._removeActivated = function() {
    this._activatedBlockView && (this._activatedBlockView.removeActivated(), this._activatedBlockView = null);
  };
  b.activateBlock = function(a) {
    a = a.view;
    var b = a.getAbsoluteCoordinate(), d = this.svgDom, e = b.x, b = b.y, e = d.width() / 2 - e, d = d.height() / 2 - b - 100;
    this.scroller.scroll(e, d);
    a.addActivated();
    this._activatedBlockView = a;
  };
  b.reDraw = function() {
    this.code.view.reDraw();
  };
  b.separate = function(a, b) {
    "string" === typeof a && (a = this.findById(a));
    a.view && a.view._toGlobalCoordinate();
    var d = a.getPrevBlock();
    a.separate(b);
    d && d.getNextBlock() && d.getNextBlock().view.bindPrev();
  };
  b.insert = function(a, b, d) {
    "string" === typeof a && (a = this.findById(a));
    this.separate(a, d);
    3 === b.length ? a.moveTo(b[0], b[1]) : 4 === b.length && 0 === b[3] ? (b = this.code.getThreads()[b[2]], a.thread.cut(a), b.insertToTop(a), a.getNextBlock().view.bindPrev()) : (b = b instanceof Array ? this.code.getTargetByPointer(b) : b, b instanceof Entry.Block ? ("basic" === a.getBlockType() && a.view.bindPrev(b), a.doInsert(b)) : b instanceof Entry.FieldStatement ? (a.view.bindPrev(b), b.insertTopBlock(a)) : a.doInsert(b));
  };
  b.adjustThreadsPosition = function() {
    var a = this.code;
    a && (a = a.getThreads()) && 0 !== a.length && (a = a.sort(function(a, b) {
      return a.getFirstBlock().view.x - b.getFirstBlock().view.x;
    }), a = a[0].getFirstBlock()) && (a = a.view, a = a.getAbsoluteCoordinate(), this.scroller.scroll(50 - a.x, 30 - a.y));
  };
  b._initContextOptions = function() {
    var a = this;
    this._contextOptions = [{activated:!0, option:{text:Lang.Blocks.Paste_blocks, enable:!!Entry.clipboard, callback:function() {
      Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }}}, {activated:!0, option:{text:Lang.Blocks.tidy_up_block, callback:function() {
      a.alignThreads();
    }}}, {activated:!0, option:{text:Lang.Blocks.Clear_all_blocks, callback:function() {
      a.code.clear();
    }}}, {activated:"workspace" === Entry.type && Entry.Utils.isChrome() && !Entry.isMobile(), option:{text:Lang.Menus.save_as_image_all, enable:!0, callback:function() {
      a.code.getThreads().forEach(function(a) {
        (a = a.getFirstBlock()) && a.view.downloadAsImage();
      });
    }}}];
  };
  b.activateContextOption = function(a) {
    this._contextOptions[a].activated = !0;
  };
  b.deActivateContextOption = function(a) {
    this._contextOptions[a].activated = !1;
  };
  b._bindEvent = function() {
    Entry.documentMousedown && (Entry.documentMousedown.attach(this, this.setSelectedBlock), Entry.documentMousedown.attach(this, this._removeActivated));
    Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
    if (Entry.windowResized) {
      var a = _.debounce(this.updateOffset, 200);
      Entry.windowResized.attach(this, a);
    }
  };
  b.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
  b._rightClick = function(a) {
    var b = Entry.disposeEvent;
    b && b.notify(a);
    if (this.visible) {
      var b = [], d = this._contextOptions;
      d[Entry.Board.OPTION_PASTE].option.enable = !!Entry.clipboard;
      d[Entry.Board.OPTION_DOWNLOAD].option.enable = 0 !== this.code.getThreads().length;
      for (var e = 0;e < this._contextOptions.length;e++) {
        d[e].activated && b.push(d[e].option);
      }
      a = Entry.Utils.convertMouseEvent(a);
      Entry.ContextMenu.show(b, null, {x:a.clientX, y:a.clientY});
    }
  };
})(Entry.Board.prototype);
Entry.skeleton = function() {
};
Entry.skeleton.basic = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, box:function(b) {
  return {offsetX:-8, offsetY:0, width:(b ? b.contentWidth : 150) + 30, height:Math.max(30, (b ? b.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(b) {
  return {previous:{x:0, y:0}, next:{x:0, y:(b ? Math.max(b.height, 30) : 30) + 1 + b.offsetY}};
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_create = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, box:function(b) {
  return {offsetX:-8, offsetY:0, width:(b ? b.contentWidth : 150) + 30, height:Math.max(30, (b ? b.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height, 30) : 30) + 1 + b.offsetY}};
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_event = {path:function(b) {
  b = b.contentWidth;
  b = Math.max(0, b);
  return "m -8,0 m 0,-5 a 19.5,19.5 0, 0,1 16,0 c 10,5 15,5 20,5 h %w a 15,15 0 0,1 0,30 H 8 l -8,8 -8,-8 l 0,0.5 a 19.5,19.5 0, 0,1 0,-35 z".replace(/%w/gi, b - 30);
}, box:function(b) {
  return {offsetX:-19, offsetY:-7, width:b.contentWidth + 30, height:30, marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height + b.offsetY + 7, 30) : 30) + 1}};
}, contentPos:function(b) {
  return {x:1, y:15};
}};
Entry.skeleton.basic_loop = {path:function(b) {
  var a = b.contentWidth, c = b.contentHeight, c = Math.max(30, c + 2), a = Math.max(0, a + 9 - c / 2);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh/gi, c).replace(/%w/gi, a).replace(/%bw/gi, a - 8).replace(/%h/gi, c / 2).replace(/%sh/gi, b + 1);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight + 2, 30), c = b._statements[0] ? b._statements[0].height : 20, c = Math.max(c, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:c + a + 18 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, c = Math.max(b.contentHeight + 2, 30);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 20);
  return {offsetX:-8, offsetY:0, width:a + 30, height:c + b + 17, marginBottom:0};
}, statementPos:function(b) {
  return [{x:16, y:Math.max(30, b.contentHeight + 2) + 1}];
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_define = {path:function(b) {
  var a = b.contentWidth, c = b.contentHeight, c = Math.max(30, c + 2), a = Math.max(0, a + 9 - c / 2);
  b = b._statements[0] ? b._statements[0].height : 30;
  b = Math.max(b, 20);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H -8 z".replace(/%wh/gi, c).replace(/%w/gi, a).replace(/%h/gi, c / 2).replace(/%bw/gi, a - 8).replace(/%sh/gi, b + 1);
}, magnets:function() {
  return {};
}, box:function(b) {
  return {offsetX:0, offsetY:0, width:b.contentWidth, height:Math.max(b.contentHeight, 25) + 46, marginBottom:0};
}, statementPos:function(b) {
  return [{x:16, y:Math.max(30, b.contentHeight + 2)}];
}, contentPos:function() {
  return {x:14, y:15};
}};
Entry.skeleton.pebble_event = {path:function(b) {
  return "m 0,0 a 25,25 0 0,1 9,48.3 a 9,9 0 0,1 -18,0 a 25,25 0 0,1 9,-48.3 z";
}, box:function(b) {
  return {offsetX:-25, offsetY:0, width:50, height:48.3, marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height, 49.3) : 49.3) + b.offsetY}};
}, contentPos:function() {
  return {x:0, y:25};
}};
Entry.skeleton.pebble_loop = {fontSize:16, dropdownHeight:23, path:function(b) {
  b = Math.max(b._statements[0] ? b._statements[0].height : 50, 50);
  return "M 0,9 a 9,9 0 0,0 9,-9 h %cw q 25,0 25,25 v %ch q 0,25 -25,25 h -%cw a 9,9 0 0,1 -18,0 h -%cw q -25,0 -25,-25 v -%ch q 0,-25 25,-25 h %cw a 9,9 0 0,0 9,9 M 0,49 a 9,9 0 0,1 -9,-9 h -28 a 25,25 0 0,0 -25,25 v %cih a 25,25 0 0,0 25,25 h 28 a 9,9 0 0,0 18,0 h 28 a 25,25 0 0,0 25,-25 v -%cih a 25,25 0 0,0 -25,-25 h -28 a 9,9 0 0,1 -9,9 z".replace(/%cw/gi, 41).replace(/%ch/gi, b + 4).replace(/%cih/gi, b - 50);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight + 2, 41), c = b._statements[0] ? b._statements[0].height : 20, c = Math.max(c, 51);
  return {previous:{x:0, y:0}, next:{x:0, y:c + a + 13 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, c = Math.max(b.contentHeight + 2, 41);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 51);
  return {offsetX:-(a / 2 + 13), offsetY:0, width:a + 30, height:c + b + 13, marginBottom:0};
}, statementPos:function(b) {
  return [{x:0, y:Math.max(39, b.contentHeight + 2) + 1.5}];
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.pebble_basic = {fontSize:15, morph:["prev", "next"], path:function(b) {
  return "m 0,9 a 9,9 0 0,0 9,-9 h 28 q 25,0 25,25q 0,25 -25,25h -28 a 9,9 0 0,1 -18,0 h -28 q -25,0 -25,-25q 0,-25 25,-25h 28 a 9,9 0 0,0 9,9 z";
}, magnets:function(b) {
  return {previous:{x:0, y:0}, next:{x:0, y:(b ? Math.max(b.height, 51) : 51) + b.offsetY}};
}, box:function() {
  return {offsetX:-62, offsetY:0, width:124, height:50, marginBottom:0};
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.basic_string_field = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(18, b + 2);
  a = Math.max(0, a - b + 12);
  return "m %h,0 h %w a %h,%h 0 1,1 0,%wh H %h A %h,%h 0 1,1 %h,0 z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, color:"#000", outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 12, height:Math.max((b ? b.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {string:{}};
}, contentPos:function(b) {
  return {x:6, y:Math.max(b.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_boolean_field = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(18, b + 2);
  a = Math.max(0, a - b + 19);
  return "m %h,0 h %w l %h,%h -%h,%h H %h l -%h,-%h %h,-%h z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, color:"#000", outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 19, height:Math.max((b ? b.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {boolean:{}};
}, contentPos:function(b) {
  return {x:10, y:Math.max(b.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_param = {path:function(b) {
  var a = b.contentWidth;
  (b = b._contents[b._contents.length - 1]) && (a -= b.box.width + Entry.BlockView.PARAM_SPACE - 2);
  a = Math.max(0, a);
  return "m 4,0 h 10 h %w l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2h -%w h -10 l -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2".replace(/%w/gi, a);
}, outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 11, height:24, marginBottom:0};
}, magnets:function() {
  return {param:{}};
}, contentPos:function(b) {
  return {x:11, y:12};
}};
Entry.skeleton.basic_button = {path:function() {
  return "m -64,0 h 128 a 6,6 0, 0,1 6,6 v 18 a 6,6 0, 0,1 -6,6 h -128 a 6,6 0, 0,1 -6,-6 v -18 a 6,6 0, 0,1 6,-6 z";
}, box:function() {
  return {offsetX:-80, offsetY:0, width:140, height:30};
}, contentPos:function() {
  return {x:0, y:15};
}, movable:!1, readOnly:!0, nextShadow:!0, classes:["basicButtonView"]};
Entry.skeleton.basic_without_next = {box:Entry.skeleton.basic.box, contentPos:Entry.skeleton.basic.contentPos, path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0, %wh H -8 z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, magnets:function(b) {
  return {previous:{x:0, y:0}};
}};
Entry.skeleton.basic_double_loop = {path:function(b) {
  var a = b.contentWidth, c = b.contentHeight % 1E6, d = Math.floor(b.contentHeight / 1E6), c = Math.max(30, c + 2), d = Math.max(30, d + 2), a = Math.max(0, a + 5 - c / 2), e = b._statements;
  b = e[0] ? e[0].height : 20;
  e = e[1] ? e[1].height : 20;
  b = Math.max(b, 20);
  e = Math.max(e, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h1,%h1 0 0,1 0,%wh1 H 24 l -8,8 -8,-8 h -0.4 v %sh1 h 0.4 l 8,8 8,-8 h %bw a %h2,%h2 0 0,1 0,%wh2 H 24 l -8,8 -8,-8 h -0.4 v %sh2 h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh1/gi, c).replace(/%wh2/gi, d).replace(/%w/gi, a).replace(/%bw/gi, a - 8).replace(/%h1/gi, c / 2).replace(/%h2/gi, d / 2).replace(/%sh1/gi, b + 1).replace(/%sh2/gi, e + 1);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight % 1E6 + 2, 30), c = Math.max(Math.floor(b.contentHeight / 1E6) + 2, 30), d = b._statements[0] ? b._statements[0].height : 20, e = b._statements[1] ? b._statements[1].height : 20, d = Math.max(d, 20), e = Math.max(e, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:d + e + a + c + 19 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, c = Math.max(Math.floor(b.contentHeight / 1E6) + 2, 30), d = Math.max(b.contentHeight % 1E6 + 2, 30), e = b._statements[0] ? b._statements[0].height % 1E6 : 20;
  b = b._statements[1] ? b._statements[1].height : 20;
  e = Math.max(e, 20);
  b = Math.max(b, 20);
  return {offsetX:-8, offsetY:0, width:a + 30, height:c + d + e + b + 17, marginBottom:0};
}, statementPos:function(b) {
  var a = Math.max(30, b.contentHeight % 1E6 + 2) + 1;
  return [{x:16, y:a}, {x:16, y:a + Math.max(b._statements[0] ? b._statements[0].height % 1E6 : 20, 20) + Math.max(Math.floor(b.contentHeight / 1E6) + 2, 30) + 1}];
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight % 1E6, 28) / 2 + 1};
}};
Entry.Thread = function(b, a, c) {
  this._data = new Entry.Collection;
  this._code = a;
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this.handleChange);
  this._event = null;
  this.parent = c ? c : a;
  this.load(b);
};
(function(b) {
  b.load = function(a, b) {
    void 0 === a && (a = []);
    if (!(a instanceof Array)) {
      return console.error("thread must be array");
    }
    for (var d = 0;d < a.length;d++) {
      var e = a[d];
      e instanceof Entry.Block || e.isDummy ? (e.setThread(this), this._data.push(e)) : this._data.push(new Entry.Block(e, this));
    }
    (d = this._code.view) && this.createView(d.board, b);
  };
  b.registerEvent = function(a, b) {
    this._event = b;
    this._code.registerEvent(a, b);
  };
  b.unregisterEvent = function(a, b) {
    this._code.unregisterEvent(a, b);
  };
  b.createView = function(a, b) {
    this.view || (this.view = new Entry.ThreadView(this, a));
    this._data.map(function(d) {
      d.createView(a, b);
    });
  };
  b.separate = function(a, b) {
    if (this._data.has(a.id)) {
      var d = this._data.splice(this._data.indexOf(a), b);
      this._code.createThread(d);
      this.changeEvent.notify();
    }
  };
  b.cut = function(a) {
    a = this._data.indexOf(a);
    a = this._data.splice(a);
    this.changeEvent.notify();
    return a;
  };
  b.insertByBlock = function(a, b) {
    for (var d = a ? this._data.indexOf(a) : -1, e = 0;e < b.length;e++) {
      b[e].setThread(this);
    }
    this._data.splice.apply(this._data, [d + 1, 0].concat(b));
    this.changeEvent.notify();
  };
  b.insertToTop = function(a) {
    a.setThread(this);
    this._data.unshift.apply(this._data, [a]);
    this.changeEvent.notify();
  };
  b.clone = function(a, b) {
    a = a || this._code;
    for (var d = new Entry.Thread([], a), e = this._data, f = [], g = 0, h = e.length;g < h;g++) {
      f.push(e[g].clone(d));
    }
    d.load(f, b);
    return d;
  };
  b.toJSON = function(a, b) {
    for (var d = [], e = void 0 === b ? 0 : b;e < this._data.length;e++) {
      this._data[e] instanceof Entry.Block && d.push(this._data[e].toJSON(a));
    }
    return d;
  };
  b.destroy = function(a) {
    this._code.destroyThread(this, !1);
    this.view && this.view.destroy(a);
    for (var b = this._data, d = b.length - 1;0 <= d;d--) {
      b[d].destroy(a);
    }
  };
  b.getBlock = function(a) {
    return this._data[a];
  };
  b.getBlocks = function() {
    return this._data.map(function(a) {
      return a;
    });
  };
  b.countBlock = function() {
    for (var a = 0, b = 0;b < this._data.length;b++) {
      var d = this._data[b];
      if (d.type && (a++, d = d.statements)) {
        for (var e = 0;e < d.length;e++) {
          a += d[e].countBlock();
        }
      }
    }
    return a;
  };
  b.handleChange = function() {
    0 === this._data.length && this.destroy();
  };
  b.getCode = function() {
    return this._code;
  };
  b.setCode = function(a) {
    this._code = a;
  };
  b.spliceBlock = function(a) {
    var b = this._data;
    b.remove(a);
    0 === b.length && this.view.getParent().constructor !== Entry.FieldStatement && this.destroy();
    this.changeEvent.notify();
  };
  b.getFirstBlock = function() {
    return this._data[0];
  };
  b.getPrevBlock = function(a) {
    a = this._data.indexOf(a);
    return this._data.at(a - 1);
  };
  b.getNextBlock = function(a) {
    a = this._data.indexOf(a);
    return this._data.at(a + 1);
  };
  b.getLastBlock = function() {
    return this._data.at(this._data.length - 1);
  };
  b.getRootBlock = function() {
    return this._data.at(0);
  };
  b.hasBlockType = function(a) {
    function b(d) {
      if (a == d.type) {
        return !0;
      }
      for (var f = d.params, g = 0;g < f.length;g++) {
        var h = f[g];
        if (h && h.constructor == Entry.Block && b(h)) {
          return !0;
        }
      }
      if (d = d.statements) {
        for (f = 0;f < d.length;f++) {
          if (d[f].hasBlockType(a)) {
            return !0;
          }
        }
      }
      return !1;
    }
    for (var d = 0;d < this._data.length;d++) {
      if (b(this._data[d])) {
        return !0;
      }
    }
    return !1;
  };
  b.getCount = function(a) {
    var b = this._data.length;
    a && (b -= this._data.indexOf(a));
    return b;
  };
  b.indexOf = function(a) {
    return this._data.indexOf(a);
  };
  b.pointer = function(a, b) {
    var d = this.indexOf(b);
    a.unshift(d);
    this.parent instanceof Entry.Block && a.unshift(this.parent.indexOfStatements(this));
    return this._code === this.parent ? (a.unshift(this._code.indexOf(this)), d = this._data[0], a.unshift(d.y), a.unshift(d.x), a) : this.parent.pointer(a);
  };
  b.getBlockList = function(a) {
    for (var b = [], d = 0;d < this._data.length;d++) {
      b = b.concat(this._data[d].getBlockList(a));
    }
    return b;
  };
  b.stringify = function() {
    return JSON.stringify(this.toJSON());
  };
})(Entry.Thread.prototype);
Entry.Block = function(b, a) {
  var c = this;
  Entry.Model(this, !1);
  this._schema = null;
  this.setThread(a);
  this.load(b);
  var d = this.getCode();
  d.registerBlock(this);
  var e = this.events.dataAdd;
  e && d.object && e.forEach(function(a) {
    Entry.Utils.isFunction(a) && a(c);
  });
};
Entry.Block.MAGNET_RANGE = 10;
Entry.Block.MAGNET_OFFSET = .4;
Entry.Block.DELETABLE_TRUE = 1;
Entry.Block.DELETABLE_FALSE = 2;
Entry.Block.DELETABLE_FALSE_LIGHTEN = 3;
(function(b) {
  b.schema = {id:null, x:0, y:0, type:null, params:[], statements:[], view:null, thread:null, movable:null, deletable:Entry.Block.DELETABLE_TRUE, readOnly:null, copyable:!0, events:{}};
  b.load = function(a) {
    a.id || (a.id = Entry.Utils.generateId());
    this.set(a);
    this.loadSchema();
  };
  b.changeSchema = function(a) {
    this.set({params:[]});
    this.loadSchema();
  };
  b.getSchema = function() {
    this._schema || this.loadSchema();
    return this._schema;
  };
  b.loadSchema = function() {
    if (this._schema = Entry.block[this.type]) {
      !this._schemaChangeEvent && this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this.changeSchema));
      var a = this._schema.events;
      if (a) {
        for (var b in a) {
          this.events[b] || (this.events[b] = []);
          for (var d = a[b], e = 0;e < d.length;e++) {
            var f = d[e];
            f && 0 > this.events[b].indexOf(f) && this.events[b].push(f);
          }
        }
      }
      this._schema.event && this.thread.registerEvent(this, this._schema.event);
      a = this.params;
      b = this._schema.params;
      for (e = 0;b && e < b.length;e++) {
        d = void 0 === a[e] || null === a[e] ? b[e].value : a[e], f = a[e] || e < a.length, !d || "Output" !== b[e].type && "Block" !== b[e].type || (d = new Entry.Block(d, this.thread)), f ? a.splice(e, 1, d) : a.push(d);
      }
      if (a = this._schema.statements) {
        for (e = 0;e < a.length;e++) {
          this.statements.splice(e, 1, new Entry.Thread(this.statements[e], this.getCode(), this));
        }
      }
    }
  };
  b.changeType = function(a) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this.set({type:a});
    this.loadSchema();
    this.view && this.view.changeType(a);
  };
  b.setThread = function(a) {
    this.set({thread:a});
  };
  b.getThread = function() {
    return this.thread;
  };
  b.insertAfter = function(a) {
    this.thread.insertByBlock(this, a);
  };
  b._updatePos = function() {
    this.view && this.set({x:this.view.x, y:this.view.y});
  };
  b.moveTo = function(a, b) {
    this.view && this.view._moveTo(a, b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.createView = function(a, b) {
    this.view || (this.set({view:new Entry.BlockView(this, a, b)}), this._updatePos());
  };
  b.clone = function(a) {
    return new Entry.Block(this.toJSON(!0), a);
  };
  b.toJSON = function(a) {
    var b = this._toJSON();
    delete b.view;
    delete b.thread;
    delete b.events;
    a && delete b.id;
    b.params = b.params.map(function(b) {
      b instanceof Entry.Block && (b = b.toJSON(a));
      return b;
    });
    b.statements = b.statements.map(function(b) {
      return b.toJSON(a);
    });
    b.x = this.x;
    b.y = this.y;
    b.movable = this.movable;
    b.deletable = this.deletable;
    b.readOnly = this.readOnly;
    return b;
  };
  b.destroy = function(a, b) {
    var d = this, e = this.params;
    if (e) {
      for (var f = 0;f < e.length;f++) {
        var g = e[f];
        g instanceof Entry.Block && (g.doNotSplice = !0, g.destroy(a));
      }
    }
    if (e = this.statements) {
      for (f = 0;f < e.length;f++) {
        e[f].destroy(a);
      }
    }
    g = this.getPrevBlock();
    f = this.getNextBlock();
    this.getCode().unregisterBlock(this);
    e = this.getThread();
    this._schema.event && e.unregisterEvent(this, this._schema.event);
    f && (b ? f.destroy(a, b) : g ? f.view.bindPrev(g) : (g = this.getThread().view.getParent(), g.constructor === Entry.FieldStatement ? (f.view.bindPrev(g), g.insertTopBlock(f)) : g.constructor === Entry.FieldStatement ? f.replace(g._valueBlock) : f.view._toGlobalCoordinate()));
    !this.doNotSplice && e.spliceBlock ? e.spliceBlock(this) : delete this.doNotSplice;
    this.view && this.view.destroy(a);
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    (f = this.events.dataDestroy) && this.getCode().object && f.forEach(function(a) {
      Entry.Utils.isFunction(a) && a(d);
    });
  };
  b.getView = function() {
    return this.view;
  };
  b.setMovable = function(a) {
    this.movable != a && this.set({movable:a});
  };
  b.setCopyable = function(a) {
    this.copyable != a && this.set({copyable:a});
  };
  b.isMovable = function() {
    return this.movable;
  };
  b.isCopyable = function() {
    return this.copyable;
  };
  b.setDeletable = function(a) {
    this.deletable != a && this.set({deletable:a});
  };
  b.isDeletable = function() {
    return this.deletable === Entry.Block.DELETABLE_TRUE;
  };
  b.isReadOnly = function() {
    return this.readOnly;
  };
  b.getCode = function() {
    return this.thread.getCode();
  };
  b.doAdd = function() {
    this.getCode().changeEvent.notify();
  };
  b.doMove = function() {
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.doSeparate = function() {
    this.separate();
  };
  b.doInsert = function(a) {
    "basic" === this.getBlockType() ? this.insert(a) : this.replace(a);
  };
  b.doDestroy = function(a) {
    this.destroy(a);
    this.getCode().changeEvent.notify();
    return this;
  };
  b.doDestroyBelow = function(a) {
    console.log("destroyBelow", this.id, this.x, this.y);
    this.destroy(a, !0);
    this.getCode().changeEvent.notify();
    return this;
  };
  b.copy = function() {
    var a = this.getThread(), b = [];
    if (a instanceof Entry.Thread) {
      for (var d = a.getBlocks().indexOf(this), a = a.toJSON(!0, d), d = 0;d < a.length;d++) {
        b.push(a[d]);
      }
    } else {
      b.push(this.toJSON(!0));
    }
    a = this.view.getAbsoluteCoordinate();
    d = b[0];
    d.x = a.x + 15;
    d.y = a.y + 15;
    d.id = Entry.Utils.generateId();
    return b;
  };
  b.copyToClipboard = function() {
    Entry.clipboard = this.copy();
  };
  b.separate = function(a) {
    this.thread.separate(this, a);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.insert = function(a) {
    var b = this.thread.cut(this);
    a instanceof Entry.Thread ? a.insertByBlock(null, b) : a.insertAfter(b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.replace = function(a) {
    this.thread.cut(this);
    a.getThread().replace(this);
    this.getCode().changeEvent.notify();
  };
  b.getPrevBlock = function() {
    return this.thread.getPrevBlock(this);
  };
  b.getNextBlock = function() {
    return this.thread.getNextBlock(this) || null;
  };
  b.getLastBlock = function() {
    return this.thread.getLastBlock();
  };
  b.getOutputBlock = function() {
    for (var a = this._schema.params, b = 0;a && b < a.length;b++) {
      if ("Output" === a[b].type) {
        return this.params[b];
      }
    }
    return null;
  };
  b.getTerminateOutputBlock = function() {
    for (var a = this;;) {
      var b = a.getOutputBlock();
      if (!b) {
        return a;
      }
      a = b;
    }
  };
  b.getBlockType = function() {
    if (!this.view) {
      return null;
    }
    var a = Entry.skeleton[this._schema.skeleton].magnets(this.view);
    return a.next || a.previous ? "basic" : a.boolean || a.string ? "field" : a.output ? "output" : null;
  };
  b.indexOfStatements = function(a) {
    return this.statements.indexOf(a);
  };
  b.pointer = function(a) {
    a || (a = []);
    return this.thread.pointer(a, this);
  };
  b.targetPointer = function() {
    var a = this.thread.pointer([], this);
    4 === a.length && 0 === a[3] && a.pop();
    return a;
  };
  b.getBlockList = function(a) {
    var b = [];
    if (!this._schema) {
      return [];
    }
    if (a && this._schema.isPrimitive) {
      return b;
    }
    b.push(this);
    for (var d = this.params, e = 0;e < d.length;e++) {
      var f = d[e];
      f && f.constructor == Entry.Block && (b = b.concat(f.getBlockList(a)));
    }
    if (d = this.statements) {
      for (e = 0;e < d.length;e++) {
        b = b.concat(d[e].getBlockList(a));
      }
    }
    return b;
  };
  b.stringify = function() {
    return JSON.stringify(this.toJSON());
  };
})(Entry.Block.prototype);
Entry.ThreadView = function(b, a) {
  Entry.Model(this, !1);
  this.thread = b;
  this.svgGroup = a.svgThreadGroup.elem("g");
  this.parent = a;
};
(function(b) {
  b.schema = {height:0, zIndex:0};
  b.destroy = function() {
    this.svgGroup.remove();
  };
  b.setParent = function(a) {
    this.parent = a;
  };
  b.getParent = function() {
    return this.parent;
  };
  b.renderText = function() {
    for (var a = this.thread.getBlocks(), b = 0;b < a.length;b++) {
      a[b].view.renderText();
    }
  };
  b.renderBlock = function() {
    for (var a = this.thread.getBlocks(), b = 0;b < a.length;b++) {
      a[b].view.renderBlock();
    }
  };
  b.requestAbsoluteCoordinate = function(a) {
    var b = this.thread.getBlocks(), d = b.shift(), e = {x:0, y:0};
    for (this.parent instanceof Entry.Board || this.parent instanceof Entry.BlockMenu || (e = this.parent.requestAbsoluteCoordinate());d && d.view !== a && d.view;) {
      d = d.view, e.x += d.x + d.magnet.next.x, e.y += d.y + d.magnet.next.y, d = b.shift();
    }
    return e;
  };
  b.requestPartHeight = function(a, b) {
    for (var d = this.thread.getBlocks(), e = d.pop(), f = a ? a.magnet.next ? a.magnet.next.y : a.height : 0;e && e.view !== a && e.view;) {
      e = e.view, f = e.magnet.next ? f + e.magnet.next.y : f + e.height, e.dragMode === Entry.DRAG_MODE_DRAG && (f = 0), e = d.pop();
    }
    return f;
  };
  b.dominate = function() {
    this.parent.dominate(this.thread);
  };
  b.isGlobal = function() {
    return this.parent instanceof Entry.Board;
  };
  b.reDraw = function() {
    for (var a = this.thread._data, b = a.length - 1;0 <= b;b--) {
      a[b].view.reDraw();
    }
  };
  b.setZIndex = function(a) {
    this.set({zIndex:a});
  };
})(Entry.ThreadView.prototype);
Entry.FieldTrashcan = function(b) {
  b && this.setBoard(b);
  this.dragBlockObserver = this.dragBlock = null;
  this.isOver = !1;
  Entry.windowResized && Entry.windowResized.attach(this, this.setPosition);
};
(function(b) {
  b._generateView = function() {
    this.svgGroup = this.board.svg.elem("g");
    this.renderStart();
    this._addControl();
  };
  b.renderStart = function() {
    var a = Entry.mediaFilePath + "delete_";
    this.trashcanTop = this.svgGroup.elem("image", {href:a + "cover.png", width:60, height:20});
    this.svgGroup.elem("image", {href:a + "body.png", y:20, width:60, height:60});
  };
  b._addControl = function() {
    $(this.svgGroup).bind("mousedown", function(a) {
      Entry.Utils.isRightButton(a) && (a.stopPropagation(), $("#entryWorkspaceBoard").css("background", "white"));
    });
  };
  b.updateDragBlock = function() {
    var a = this.board.dragBlock, b = this.dragBlockObserver;
    b && (b.destroy(), this.dragBlockObserver = null);
    a ? this.dragBlockObserver = a.observe(this, "checkBlock", ["x", "y"]) : (this.isOver && this.dragBlock && !this.dragBlock.block.getPrevBlock() && (this.dragBlock.block.doDestroyBelow(!0), createjs.Sound.play("entryDelete")), this.tAnimation(!1));
    this.dragBlock = a;
  };
  b.checkBlock = function() {
    var a = this.dragBlock;
    if (a && a.block.isDeletable()) {
      var b = this.board.offset(), d = this.getPosition(), e = d.x + b.left, b = d.y + b.top, f, g;
      if (a = a.dragInstance) {
        f = a.offsetX, g = a.offsetY;
      }
      this.tAnimation(f >= e && g >= b);
    }
  };
  b.align = function() {
    var a = this.getPosition();
    this.svgGroup.attr({transform:"translate(" + a.x + "," + a.y + ")"});
  };
  b.setPosition = function() {
    if (this.board) {
      var a = this.board.svgDom;
      this._x = a.width() - 110;
      this._y = a.height() - 110;
      this.align();
    }
  };
  b.getPosition = function() {
    return {x:this._x, y:this._y};
  };
  b.tAnimation = function(a) {
    if (a !== this.isOver) {
      a = void 0 === a ? !0 : a;
      var b, d = this.trashcanTop;
      b = a ? {translateX:15, translateY:-25, rotateZ:30} : {translateX:0, translateY:0, rotateZ:0};
      $(d).velocity(b, {duration:50});
      this.isOver = a;
    }
  };
  b.setBoard = function(a) {
    this._dragBlockObserver && this._dragBlockObserver.destroy();
    this.board = a;
    this.svgGroup || this._generateView();
    var b = a.svg, d = b.firstChild;
    d ? b.insertBefore(this.svgGroup, d) : b.appendChild(this.svgGroup);
    this._dragBlockObserver = a.observe(this, "updateDragBlock", ["dragBlock"]);
    this.svgGroup.attr({filter:"url(#entryTrashcanFilter_" + a.suffix + ")"});
    this.setPosition();
  };
})(Entry.FieldTrashcan.prototype);
Entry.Vim = function(b) {
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.createDom(b);
  this._parser = new Entry.Parser("maze", "js", this.codeMirror);
  this._blockParser = new Entry.Parser("maze", "block");
  Entry.Model(this, !1);
  window.eventset = [];
};
(function(b) {
  b.createDom = function(a) {
    function b(a) {
      var c = e.getCodeToText(a.block);
      e.codeMirror.display.dragFunctions.leave(a);
      var d = Entry.Utils.createMouseEvent("mousedown", a);
      e.codeMirror.display.scroller.dispatchEvent(d);
      var c = c.split("\n"), k = c.length - 1, l = 0;
      c.forEach(function(a, b) {
        e.codeMirror.replaceSelection(a);
        l = e.doc.getCursor().line;
        e.codeMirror.indentLine(l);
        0 !== b && k === b || e.codeMirror.replaceSelection("\n");
      });
      a = Entry.Utils.createMouseEvent("mouseup", a);
      e.codeMirror.display.scroller.dispatchEvent(a);
    }
    function d(a) {
      e.codeMirror.display.dragFunctions.over(a);
    }
    var e;
    this.view = Entry.Dom("div", {parent:a, class:"entryVimBoard"});
    this.codeMirror = CodeMirror(this.view[0], {lineNumbers:!0, value:"", mode:{name:"javascript", globalVars:!0}, theme:"default", indentUnit:4, styleActiveLine:!0, extraKeys:{"Ctrl-Space":"javascriptComplete", Tab:function(a) {
      var b = Array(a.getOption("indentUnit") + 1).join(" ");
      a.replaceSelection(b);
    }}, lint:!0, viewportMargin:10});
    this.doc = this.codeMirror.getDoc();
    e = this;
    a = this.view[0];
    a.removeEventListener("dragEnd", b);
    a.removeEventListener("dragOver", d);
    a.addEventListener("dragEnd", b);
    a.addEventListener("dragOver", d);
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.textToCode = function() {
    var a = this.codeMirror.getValue(), a = this._parser.parse(a);
    if (0 === a.length) {
      throw "\ube14\ub85d \ud30c\uc2f1 \uc624\ub958";
    }
    return a;
  };
  b.codeToText = function(a) {
    a = this._blockParser.parse(a);
    this.codeMirror.setValue(a);
  };
  b.getCodeToText = function(a) {
    return this._blockParser.parse(a);
  };
})(Entry.Vim.prototype);
Entry.Workspace = function(b) {
  Entry.Model(this, !1);
  this.observe(this, "_handleChangeBoard", ["selectedBoard"], !1);
  this.trashcan = new Entry.FieldTrashcan;
  var a = b.blockMenu;
  a && (this.blockMenu = new Entry.BlockMenu(a.dom, a.align, a.categoryData, a.scroll), this.blockMenu.workspace = this, this.blockMenu.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1));
  if (a = b.board) {
    a.workspace = this, this.board = new Entry.Board(a), this.board.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1), this.set({selectedBoard:this.board});
  }
  if (a = b.vimBoard) {
    this.vimBoard = new Entry.Vim(a.dom), this.vimBoard.workspace = this;
  }
  this.board && this.vimBoard && this.vimBoard.hide();
  Entry.GlobalSvg.createDom();
  this.mode = Entry.Workspace.MODE_BOARD;
  Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
  this.changeEvent = new Entry.Event(this);
  Entry.commander.setCurrentEditor("board", this.board);
};
Entry.Workspace.MODE_BOARD = 0;
Entry.Workspace.MODE_VIMBOARD = 1;
Entry.Workspace.MODE_OVERLAYBOARD = 2;
(function(b) {
  b.schema = {selectedBlockView:null, selectedBoard:null};
  b.getBoard = function() {
    return this.board;
  };
  b.getSelectedBoard = function() {
    return this.selectedBoard;
  };
  b.getBlockMenu = function() {
    return this.blockMenu;
  };
  b.getVimBoard = function() {
    return this.vimBoard;
  };
  b.getMode = function() {
    return this.mode;
  };
  b.setMode = function(a, b) {
    a = +a;
    var d = this.mode;
    this.mode = a;
    switch(a) {
      case d:
        return;
      case Entry.Workspace.MODE_VIMBOARD:
        this.board && this.board.hide();
        this.overlayBoard && this.overlayBoard.hide();
        this.set({selectedBoard:this.vimBoard});
        this.vimBoard.show();
        this.vimBoard.codeToText(this.board.code);
        this.blockMenu.renderText();
        this.board.clear();
        break;
      case Entry.Workspace.MODE_BOARD:
        try {
          this.board.show(), this.set({selectedBoard:this.board}), this.textToCode(d), this.vimBoard && this.vimBoard.hide(), this.overlayBoard && this.overlayBoard.hide(), this.blockMenu.renderBlock();
        } catch (e) {
          throw this.board && this.board.hide(), this.set({selectedBoard:this.vimBoard}), Entry.dispatchEvent("setProgrammingMode", Entry.Workspace.MODE_VIMBOARD), e;
        }
        Entry.commander.setCurrentEditor("board", this.board);
        break;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        this.overlayBoard || this.initOverlayBoard(), this.overlayBoard.show(), this.set({selectedBoard:this.overlayBoard}), Entry.commander.setCurrentEditor("board", this.overlayBoard);
    }
    this.changeEvent.notify(b);
  };
  b.changeBoardCode = function(a) {
    this.board.changeCode(a);
  };
  b.changeOverlayBoardCode = function(a) {
    this.overlayBoard && this.overlayBoard.changeCode(a);
  };
  b.changeBlockMenuCode = function(a) {
    this.blockMenu.changeCode(a);
  };
  b.textToCode = function(a) {
    if (a == Entry.Workspace.MODE_VIMBOARD) {
      a = this.vimBoard.textToCode();
      var b = this.board, d = b.code;
      d.load(a);
      d.createView(b);
      b.reDraw();
      this.board.alignThreads();
    }
  };
  b.codeToText = function(a) {
    return this.vimBoard.codeToText(a);
  };
  b.getCodeToText = function(a) {
    return this.vimBoard.getCodeToText(a);
  };
  b._setSelectedBlockView = function() {
    this.set({selectedBlockView:this.board.selectedBlockView || this.blockMenu.selectedBlockView || (this.overlayBoard ? this.overlayBoard.selectedBlockView : null)});
  };
  b.initOverlayBoard = function() {
    this.overlayBoard = new Entry.Board({dom:this.board.view, workspace:this, isOverlay:!0});
    this.overlayBoard.changeCode(new Entry.Code([]));
    this.overlayBoard.workspace = this;
    this.overlayBoard.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1);
  };
  b._keyboardControl = function(a) {
    var b = a.keyCode || a.which, d = a.ctrlKey;
    if (!Entry.Utils.isInInput(a)) {
      var e = this.selectedBlockView;
      e && !e.isInBlockMenu && e.block.isDeletable() && (8 == b || 46 == b ? (Entry.do("destroyBlock", e.block), a.preventDefault()) : d && (67 == b ? e.block.copyToClipboard() : 88 == b && (a = e.block, a.copyToClipboard(), a.destroy(!0, !0), e.getBoard().setSelectedBlock(null))));
      d && 86 == b && (b = this.selectedBoard) && b instanceof Entry.Board && Entry.clipboard && Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }
  };
  b._handleChangeBoard = function() {
    var a = this.selectedBoard;
    a && a.constructor === Entry.Board && this.trashcan.setBoard(a);
  };
})(Entry.Workspace.prototype);
Entry.Playground = function() {
  this.enableArduino = this.isTextBGMode_ = !1;
  this.viewMode_ = "default";
  Entry.addEventListener("textEdited", this.injectText);
  Entry.addEventListener("hwChanged", this.updateHW);
};
Entry.Playground.prototype.generateView = function(b, a) {
  this.view_ = b;
  this.view_.addClass("entryPlayground");
  if (a && "workspace" != a) {
    "phone" == a && (this.view_.addClass("entryPlaygroundPhone"), c = Entry.createElement("div", "entryCategoryTab"), c.addClass("entryPlaygroundTabPhone"), Entry.view_.insertBefore(c, this.view_), this.generateTabView(c), this.tabView_ = c, c = Entry.createElement("div", "entryCurtain"), c.addClass("entryPlaygroundCurtainPhone"), c.addClass("entryRemove"), c.innerHTML = Lang.Workspace.cannot_edit_click_to_stop, c.bindOnClick(function() {
      Entry.engine.toggleStop();
    }), this.view_.appendChild(c), this.curtainView_ = c, Entry.pictureEditable && (c = Entry.createElement("div", "entryPicture"), c.addClass("entryPlaygroundPicturePhone"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generatePictureView(c), this.pictureView_ = c), c = Entry.createElement("div", "entryText"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generateTextView(c), this.textView_ = c, Entry.soundEditable && (c = Entry.createElement("div", "entrySound"), c.addClass("entryPlaygroundSoundWorkspacePhone"), 
    c.addClass("entryRemove"), this.view_.appendChild(c), this.generateSoundView(c), this.soundView_ = c), c = Entry.createElement("div", "entryDefault"), this.view_.appendChild(c), this.generateDefaultView(c), this.defaultView_ = c, c = Entry.createElement("div", "entryCode"), c.addClass("entryPlaygroundCodePhone"), this.view_.appendChild(c), this.generateCodeView(c), this.codeView_ = this.codeView_ = c, Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    }), Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    }));
  } else {
    this.view_.addClass("entryPlaygroundWorkspace");
    var c = Entry.createElement("div", "entryCategoryTab");
    c.addClass("entryPlaygroundTabWorkspace");
    this.view_.appendChild(c);
    this.generateTabView(c);
    this.tabView_ = c;
    c = Entry.createElement("div", "entryCurtain");
    c.addClass("entryPlaygroundCurtainWorkspace");
    c.addClass("entryRemove");
    var d = Lang.Workspace.cannot_edit_click_to_stop.split(".");
    c.innerHTML = d[0] + ".<br/>" + d[1];
    c.addEventListener("click", function() {
      Entry.engine.toggleStop();
    });
    this.view_.appendChild(c);
    this.curtainView_ = c;
    Entry.pictureEditable && (c = Entry.createElement("div", "entryPicture"), c.addClass("entryPlaygroundPictureWorkspace"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generatePictureView(c), this.pictureView_ = c);
    c = Entry.createElement("div", "entryText");
    c.addClass("entryPlaygroundTextWorkspace");
    c.addClass("entryRemove");
    this.view_.appendChild(c);
    this.generateTextView(c);
    this.textView_ = c;
    Entry.soundEditable && (c = Entry.createElement("div", "entrySound"), c.addClass("entryPlaygroundSoundWorkspace"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generateSoundView(c), this.soundView_ = c);
    c = Entry.createElement("div", "entryDefault");
    c.addClass("entryPlaygroundDefaultWorkspace");
    this.view_.appendChild(c);
    this.generateDefaultView(c);
    this.defaultView_ = c;
    c = Entry.createElement("div", "entryCode");
    c.addClass("entryPlaygroundCodeWorkspace");
    c.addClass("entryRemove");
    this.view_.appendChild(c);
    this.generateCodeView(c);
    this.codeView_ = c;
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundResizeWorkspace", "entryRemove");
    this.resizeHandle_ = d;
    this.view_.appendChild(d);
    this.initializeResizeHandle(d);
    this.codeView_ = c;
    Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    });
    Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    });
  }
};
Entry.Playground.prototype.generateDefaultView = function(b) {
  return b;
};
Entry.Playground.prototype.generateTabView = function(b) {
  var a = this, c = Entry.createElement("ul");
  c.addClass("entryTabListWorkspace");
  this.tabList_ = c;
  b.appendChild(c);
  this.tabViewElements = {};
  b = Entry.createElement("li", "entryCodeTab");
  b.innerHTML = Lang.Workspace.tab_code;
  b.addClass("entryTabListItemWorkspace");
  b.addClass("entryTabSelected");
  c.appendChild(b);
  b.bindOnClick(function(b) {
    a.changeViewMode("code");
    a.blockMenu.reDraw();
  });
  this.tabViewElements.code = b;
  Entry.pictureEditable && (b = Entry.createElement("li", "entryPictureTab"), b.innerHTML = Lang.Workspace.tab_picture, b.addClass("entryTabListItemWorkspace"), c.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("picture");
  }), this.tabViewElements.picture = b, b = Entry.createElement("li", "entryTextboxTab"), b.innerHTML = Lang.Workspace.tab_text, b.addClass("entryTabListItemWorkspace"), c.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("text");
  }), this.tabViewElements.text = b, b.addClass("entryRemove"));
  Entry.soundEditable && (b = Entry.createElement("li", "entrySoundTab"), b.innerHTML = Lang.Workspace.tab_sound, b.addClass("entryTabListItemWorkspace"), c.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("sound");
  }), this.tabViewElements.sound = b);
  Entry.hasVariableManager && (b = Entry.createElement("li", "entryVariableTab"), b.innerHTML = Lang.Workspace.tab_attribute, b.addClass("entryTabListItemWorkspace"), b.addClass("entryVariableTabWorkspace"), c.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.toggleOnVariableView();
    Entry.playground.changeViewMode("variable");
  }), this.tabViewElements.variable = b);
};
Entry.Playground.prototype.generateCodeView = function(b) {
  var a = this.createVariableView();
  b.appendChild(a);
  this.variableView_ = a;
  b = Entry.Dom(b);
  a = Entry.Dom("div", {parent:b, id:"entryWorkspaceBoard", class:"entryWorkspaceBoard"});
  b = Entry.Dom("div", {parent:b, id:"entryWorkspaceBlockMenu", class:"entryWorkspaceBlockMenu"});
  this.mainWorkspace = new Entry.Workspace({blockMenu:{dom:b, align:"LEFT", categoryData:EntryStatic.getAllBlocks(), scroll:!0}, board:{dom:a}});
  this.blockMenu = this.mainWorkspace.blockMenu;
  this.board = this.mainWorkspace.board;
  Entry.hw && this.updateHW();
};
Entry.Playground.prototype.generatePictureView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddPicture");
    a.addClass("entryPlaygroundAddPicture");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    });
    var c = Entry.createElement("div", "entryAddPictureInner");
    c.addClass("entryPlaygroundAddPictureInner");
    c.innerHTML = Lang.Workspace.picture_add;
    a.appendChild(c);
    b.appendChild(a);
    a = Entry.createElement("ul", "entryPictureList");
    a.addClass("entryPlaygroundPictureList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(c, g);
    }, axis:"y"});
    b.appendChild(a);
    this.pictureListView_ = a;
    a = Entry.createElement("div", "entryPainter");
    a.addClass("entryPlaygroundPainter");
    b.appendChild(a);
    this.painter = new Entry.Painter;
    this.painter.initialize(a);
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddPicture"), a.addClass("entryPlaygroundAddPicturePhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    }), c = Entry.createElement("div", "entryAddPictureInner"), c.addClass("entryPlaygroundAddPictureInnerPhone"), c.innerHTML = Lang.Workspace.picture_add, a.appendChild(c), b.appendChild(a), a = Entry.createElement("ul", "entryPictureList"), a.addClass("entryPlaygroundPictureListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(c, g);
    }, axis:"y"}), b.appendChild(a), this.pictureListView_ = a);
  }
};
Entry.Playground.prototype.generateTextView = function(b) {
  var a = Entry.createElement("div");
  b.appendChild(a);
  b = Entry.createElement("div");
  b.addClass("textProperties");
  a.appendChild(b);
  var c = Entry.createElement("div");
  c.addClass("entryTextFontSelect");
  b.appendChild(c);
  var d = Entry.createElement("select", "entryPainterAttrFontName");
  d.addClass("entryPlaygroundPainterAttrFontName", "entryTextFontSelecter");
  d.size = "1";
  d.onchange = function(a) {
    Entry.playground.object.entity.setFontType(a.target.value);
  };
  for (var e = 0;e < Entry.fonts.length;e++) {
    var f = Entry.fonts[e], g = Entry.createElement("option");
    g.value = f.family;
    g.innerHTML = f.name;
    d.appendChild(g);
  }
  this.fontName_ = d;
  c.appendChild(d);
  e = Entry.createElement("ul");
  e.addClass("entryPlayground_text_buttons");
  b.appendChild(e);
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignLeft");
  c.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_LEFT);
  });
  e.appendChild(c);
  this.alignLeftBtn = c;
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignCenter");
  c.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_CENTER);
  });
  e.appendChild(c);
  this.alignCenterBtn = c;
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignRight");
  c.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_RIGHT);
  });
  e.appendChild(c);
  this.alignRightBtn = c;
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontBold() ? h.src = Entry.mediaFilePath + "text_button_bold_true.png" : h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  });
  var h = Entry.createElement("img", "entryPlaygroundText_boldImage");
  d.appendChild(h);
  h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getUnderLine() || !1;
    k.src = Entry.mediaFilePath + "text_button_underline_" + a + ".png";
    Entry.playground.object.entity.setUnderLine(a);
  });
  var k = Entry.createElement("img", "entryPlaygroundText_underlineImage");
  d.appendChild(k);
  k.src = Entry.mediaFilePath + "text_button_underline_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontItalic() ? l.src = Entry.mediaFilePath + "text_button_italic_true.png" : l.src = Entry.mediaFilePath + "/text_button_italic_false.png";
  });
  var l = Entry.createElement("img", "entryPlaygroundText_italicImage");
  d.appendChild(l);
  l.src = Entry.mediaFilePath + "text_button_italic_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getStrike() || !1;
    Entry.playground.object.entity.setStrike(a);
    n.src = Entry.mediaFilePath + "text_button_strike_" + a + ".png";
  });
  var n = Entry.createElement("img", "entryPlaygroundText_strikeImage");
  d.appendChild(n);
  n.src = Entry.mediaFilePath + "text_button_strike_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.toggleColourChooser("foreground");
  });
  d = Entry.createElement("img");
  c.appendChild(d);
  d.src = Entry.mediaFilePath + "text_button_color_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  e = Entry.createElement("a");
  c.appendChild(e);
  e.bindOnClick(function() {
    Entry.playground.toggleColourChooser("background");
  });
  c = Entry.createElement("img");
  e.appendChild(c);
  c.src = Entry.mediaFilePath + "text_button_background_false.png";
  e = Entry.createElement("div");
  e.addClass("entryPlayground_fgColorDiv");
  c = Entry.createElement("div");
  c.addClass("entryPlayground_bgColorDiv");
  b.appendChild(e);
  b.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundTextColoursWrapper");
  this.coloursWrapper = d;
  a.appendChild(d);
  b = Entry.getColourCodes();
  for (e = 0;e < b.length;e++) {
    c = Entry.createElement("div"), c.addClass("modal_colour"), c.setAttribute("colour", b[e]), c.style.backgroundColor = b[e], 0 === e && c.addClass("modalColourTrans"), c.bindOnClick(function(a) {
      Entry.playground.setTextColour(a.target.getAttribute("colour"));
    }), d.appendChild(c);
  }
  d.style.display = "none";
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundTextBackgroundsWrapper");
  this.backgroundsWrapper = d;
  a.appendChild(d);
  for (e = 0;e < b.length;e++) {
    c = Entry.createElement("div"), c.addClass("modal_colour"), c.setAttribute("colour", b[e]), c.style.backgroundColor = b[e], 0 === e && c.addClass("modalColourTrans"), c.bindOnClick(function(a) {
      Entry.playground.setBackgroundColour(a.target.getAttribute("colour"));
    }), d.appendChild(c);
  }
  d.style.display = "none";
  b = Entry.createElement("input");
  b.addClass("entryPlayground_textBox");
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditInput = b;
  a.appendChild(b);
  b = Entry.createElement("textarea");
  b.addClass("entryPlayground_textArea");
  b.style.display = "none";
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditArea = b;
  a.appendChild(b);
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundFontSizeWrapper");
  a.appendChild(b);
  this.fontSizeWrapper = b;
  var m = Entry.createElement("div");
  m.addClass("entryPlaygroundFontSizeSlider");
  b.appendChild(m);
  var q = Entry.createElement("div");
  q.addClass("entryPlaygroundFontSizeIndicator");
  m.appendChild(q);
  this.fontSizeIndiciator = q;
  var r = Entry.createElement("div");
  r.addClass("entryPlaygroundFontSizeKnob");
  m.appendChild(r);
  this.fontSizeKnob = r;
  e = Entry.createElement("div");
  e.addClass("entryPlaygroundFontSizeLabel");
  e.innerHTML = "\uae00\uc790 \ud06c\uae30";
  b.appendChild(e);
  var t = !1, u = 0;
  r.onmousedown = function(a) {
    t = !0;
    u = $(m).offset().left;
  };
  r.addEventListener("touchstart", function(a) {
    t = !0;
    u = $(m).offset().left;
  });
  document.addEventListener("mousemove", function(a) {
    t && (a = a.pageX - u, a = Math.max(a, 5), a = Math.min(a, 88), r.style.left = a + "px", a /= .88, q.style.width = a + "%", Entry.playground.object.entity.setFontSize(a));
  });
  document.addEventListener("touchmove", function(a) {
    t && (a = a.touches[0].pageX - u, a = Math.max(a, 5), a = Math.min(a, 88), r.style.left = a + "px", a /= .88, q.style.width = a + "%", Entry.playground.object.entity.setFontSize(a));
  });
  document.addEventListener("mouseup", function(a) {
    t = !1;
  });
  document.addEventListener("touchend", function(a) {
    t = !1;
  });
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakWrapper");
  a.appendChild(b);
  a = Entry.createElement("hr");
  a.addClass("entryPlaygroundLinebreakHorizontal");
  b.appendChild(a);
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakButtons");
  b.appendChild(a);
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!1);
    v.innerHTML = Lang.Menus.linebreak_off_desc_1;
    x.innerHTML = Lang.Menus.linebreak_off_desc_2;
    y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-off-true.png";
  a.appendChild(e);
  this.linebreakOffImage = e;
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!0);
    v.innerHTML = Lang.Menus.linebreak_on_desc_1;
    x.innerHTML = Lang.Menus.linebreak_on_desc_2;
    y.innerHTML = Lang.Menus.linebreak_on_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-on-false.png";
  a.appendChild(e);
  this.linebreakOnImage = e;
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakDescription");
  b.appendChild(a);
  var v = Entry.createElement("p");
  v.innerHTML = Lang.Menus.linebreak_off_desc_1;
  a.appendChild(v);
  b = Entry.createElement("ul");
  a.appendChild(b);
  var x = Entry.createElement("li");
  x.innerHTML = Lang.Menus.linebreak_off_desc_2;
  b.appendChild(x);
  var y = Entry.createElement("li");
  y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  b.appendChild(y);
};
Entry.Playground.prototype.generateSoundView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddSound");
    a.addClass("entryPlaygroundAddSound");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    });
    var c = Entry.createElement("div", "entryAddSoundInner");
    c.addClass("entryPlaygroundAddSoundInner");
    c.innerHTML = Lang.Workspace.sound_add;
    a.appendChild(c);
    b.appendChild(a);
    a = Entry.createElement("ul", "entrySoundList");
    a.addClass("entryPlaygroundSoundList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(c, g);
    }, axis:"y"});
    b.appendChild(a);
    this.soundListView_ = a;
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddSound"), a.addClass("entryPlaygroundAddSoundPhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    }), c = Entry.createElement("div", "entryAddSoundInner"), c.addClass("entryPlaygroundAddSoundInnerPhone"), c.innerHTML = Lang.Workspace.sound_add, a.appendChild(c), b.appendChild(a), a = Entry.createElement("ul", "entrySoundList"), a.addClass("entryPlaygroundSoundListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(c, g);
    }, axis:"y"}), b.appendChild(a), this.soundListView_ = a);
  }
};
Entry.Playground.prototype.injectObject = function(b) {
  if (!b) {
    this.changeViewMode("code"), this.object = null;
  } else {
    if (b !== this.object) {
      this.object && this.object.toggleInformation(!1);
      this.object = b;
      this.setMenu(b.objectType);
      this.injectCode();
      "sprite" == b.objectType && Entry.pictureEditable ? (this.tabViewElements.text && this.tabViewElements.text.addClass("entryRemove"), this.tabViewElements.picture && this.tabViewElements.picture.removeClass("entryRemove")) : "textBox" == b.objectType && (this.tabViewElements.picture && this.tabViewElements.picture.addClass("entryRemove"), this.tabViewElements.text && this.tabViewElements.text.removeClass("entryRemove"));
      var a = this.viewMode_;
      "default" == a ? this.changeViewMode("code") : "picture" != a && "text" != a || "textBox" != b.objectType ? "text" != a && "picture" != a || "sprite" != b.objectType ? "sound" == a && this.changeViewMode("sound") : this.changeViewMode("picture") : this.changeViewMode("text");
      this.reloadPlayground();
    }
  }
};
Entry.Playground.prototype.injectCode = function() {
  var b = this.mainWorkspace;
  b.changeBoardCode(this.object.script);
  b.getBoard().adjustThreadsPosition();
};
Entry.Playground.prototype.injectPicture = function() {
  var b = this.pictureListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.pictures, c = 0, d = a.length;c < d;c++) {
        var e = a[c].view;
        e || console.log(e);
        e.orderHolder.innerHTML = c + 1;
        b.appendChild(e);
      }
      this.selectPicture(this.object.selectedPicture);
    } else {
      Entry.dispatchEvent("pictureClear");
    }
  }
};
Entry.Playground.prototype.addPicture = function(b, a) {
  var c = Entry.cloneSimpleObject(b);
  delete c.id;
  delete c.view;
  b = JSON.parse(JSON.stringify(c));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.pictures);
  this.generatePictureElement(b);
  this.object.addPicture(b);
  this.injectPicture();
  this.selectPicture(b);
};
Entry.Playground.prototype.setPicture = function(b) {
  var a = Entry.container.getPictureElement(b.id, b.objectId), c = $(a);
  if (a) {
    b.view = a;
    a.picture = b;
    a = c.find("#t_" + b.id)[0];
    if (b.fileurl) {
      a.style.backgroundImage = 'url("' + b.fileurl + '")';
    } else {
      var d = b.filename;
      a.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + d.substring(0, 2) + "/" + d.substring(2, 4) + "/thumb/" + d + '.png")';
    }
    c.find("#s_" + b.id)[0].innerHTML = b.dimension.width + " X " + b.dimension.height;
  }
  Entry.container.setPicture(b);
};
Entry.Playground.prototype.clonePicture = function(b) {
  b = Entry.playground.object.getPicture(b);
  this.addPicture(b, !0);
};
Entry.Playground.prototype.selectPicture = function(b) {
  for (var a = this.object.pictures, c = 0, d = a.length;c < d;c++) {
    var e = a[c];
    e.id === b.id ? e.view.addClass("entryPictureSelected") : e.view.removeClass("entryPictureSelected");
  }
  var f;
  b && b.id && (f = Entry.container.selectPicture(b.id, b.objectId));
  this.object.id === f && Entry.dispatchEvent("pictureSelected", b);
};
Entry.Playground.prototype.movePicture = function(b, a) {
  this.object.pictures.splice(a, 0, this.object.pictures.splice(b, 1)[0]);
  this.injectPicture();
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.injectText = function() {
  if (Entry.playground.object) {
    Entry.playground.textEditInput.value = Entry.playground.object.entity.getText();
    Entry.playground.textEditArea.value = Entry.playground.object.entity.getText();
    Entry.playground.fontName_.value = Entry.playground.object.entity.getFontName();
    if (Entry.playground.object.entity.font) {
      var b = -1 < Entry.playground.object.entity.font.indexOf("bold") || !1;
      $("#entryPlaygroundText_boldImage").attr("src", Entry.mediaFilePath + "text_button_bold_" + b + ".png");
      b = -1 < Entry.playground.object.entity.font.indexOf("italic") || !1;
      $("#entryPlaygroundText_italicImage").attr("src", Entry.mediaFilePath + "text_button_italic_" + b + ".png");
    }
    b = Entry.playground.object.entity.getUnderLine() || !1;
    $("#entryPlaygroundText_underlineImage").attr("src", Entry.mediaFilePath + "text_button_underline_" + b + ".png");
    b = Entry.playground.object.entity.getStrike() || !1;
    $("#entryPlaygroundText_strikeImage").attr("src", Entry.mediaFilePath + "text_button_strike_" + b + ".png");
    $(".entryPlayground_fgColorDiv").css("backgroundColor", Entry.playground.object.entity.colour);
    $(".entryPlayground_bgColorDiv").css("backgroundColor", Entry.playground.object.entity.bgColour);
    Entry.playground.toggleLineBreak(Entry.playground.object.entity.getLineBreak());
    Entry.playground.object.entity.getLineBreak() && ($(".entryPlaygroundLinebreakDescription > p").html(Lang.Menus.linebreak_on_desc_1), $(".entryPlaygroundLinebreakDescription > ul > li").eq(0).html(Lang.Menus.linebreak_on_desc_2), $(".entryPlaygroundLinebreakDescription > ul > li").eq(1).html(Lang.Menus.linebreak_on_desc_3));
    Entry.playground.setFontAlign(Entry.playground.object.entity.getTextAlign());
    b = Entry.playground.object.entity.getFontSize();
    Entry.playground.fontSizeIndiciator.style.width = b + "%";
    Entry.playground.fontSizeKnob.style.left = .88 * b + "px";
  }
};
Entry.Playground.prototype.injectSound = function() {
  var b = this.soundListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.sounds, c = 0, d = a.length;c < d;c++) {
        var e = a[c].view;
        e.orderHolder.innerHTML = c + 1;
        b.appendChild(e);
      }
    }
  }
};
Entry.Playground.prototype.moveSound = function(b, a) {
  this.object.sounds.splice(a, 0, this.object.sounds.splice(b, 1)[0]);
  this.updateListViewOrder("sound");
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.addSound = function(b, a) {
  var c = Entry.cloneSimpleObject(b);
  delete c.view;
  delete c.id;
  b = JSON.parse(JSON.stringify(c));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.sounds);
  this.generateSoundElement(b);
  this.object.addSound(b);
  this.injectSound();
};
Entry.Playground.prototype.changeViewMode = function(b) {
  for (var a in this.tabViewElements) {
    this.tabViewElements[a].removeClass("entryTabSelected");
  }
  "default" != b && this.tabViewElements[b].addClass("entryTabSelected");
  if ("variable" != b) {
    var c = this.view_.children;
    for (a = 0;a < c.length;a++) {
      var d = c[a];
      -1 < d.id.toUpperCase().indexOf(b.toUpperCase()) ? d.removeClass("entryRemove") : d.addClass("entryRemove");
    }
    if ("picture" == b && (!this.pictureView_.object || this.pictureView_.object != this.object)) {
      this.pictureView_.object = this.object, this.injectPicture();
    } else {
      if ("sound" == b && (!this.soundView_.object || this.soundView_.object != this.object)) {
        this.soundView_.object = this.object, this.injectSound();
      } else {
        if ("text" == b && "textBox" == this.object.objectType || this.textView_.object != this.object) {
          this.textView_.object = this.object, this.injectText();
        }
      }
    }
    "code" == b && this.resizeHandle_ && this.resizeHandle_.removeClass("entryRemove");
    Entry.engine.isState("run") && this.curtainView_.removeClass("entryRemove");
    this.viewMode_ = b;
    this.toggleOffVariableView();
  }
};
Entry.Playground.prototype.createVariableView = function() {
  var b = Entry.createElement("div");
  Entry.type && "workspace" != Entry.type ? "phone" == Entry.type && b.addClass("entryVariablePanelPhone") : b.addClass("entryVariablePanelWorkspace");
  this.variableViewWrapper_ = b;
  Entry.variableContainer.createDom(b);
  return b;
};
Entry.Playground.prototype.toggleOnVariableView = function() {
  Entry.playground.changeViewMode("code");
  this.hideBlockMenu();
  Entry.variableContainer.updateList();
  this.variableView_.removeClass("entryRemove");
  this.resizeHandle_.removeClass("entryRemove");
};
Entry.Playground.prototype.toggleOffVariableView = function() {
  this.showBlockMenu();
  this.variableView_.addClass("entryRemove");
};
Entry.Playground.prototype.editBlock = function() {
  var b = Entry.playground;
  Entry.stateManager && Entry.stateManager.addCommand("edit block", b, b.restoreBlock, b.object, b.object.getScriptText());
};
Entry.Playground.prototype.mouseupBlock = function() {
  if (Entry.reporter) {
    var b = Entry.playground, a = b.object;
    Entry.reporter.report(new Entry.State("edit block mouseup", b, b.restoreBlock, a, a.getScriptText()));
  }
};
Entry.Playground.prototype.restoreBlock = function(b, a) {
  Entry.container.selectObject(b.id);
  Entry.stateManager && Entry.stateManager.addCommand("restore block", this, this.restoreBlock, this.object, this.object.getScriptText());
  Blockly.Xml.textToDom(a);
};
Entry.Playground.prototype.setMenu = function(b) {
  if (this.currentObjectType != b) {
    var a = this.blockMenu;
    a.unbanClass(this.currentObjectType);
    a.banClass(b);
    a.setMenu();
    a.selectMenu(0, !0);
    this.currentObjectType = b;
  }
};
Entry.Playground.prototype.hideTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.hideTab([b[a]]);
  }
};
Entry.Playground.prototype.hideTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("hideTab"), this.tabViewElements[b].removeClass("showTab"));
};
Entry.Playground.prototype.showTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.showTab(b[a]);
  }
};
Entry.Playground.prototype.showTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("showTab"), this.tabViewElements[b].removeClass("hideTab"));
};
Entry.Playground.prototype.initializeResizeHandle = function(b) {
  $(b).bind("mousedown touchstart", function(a) {
    Entry.playground.resizing = !0;
    Entry.documentMousemove && (Entry.playground.resizeEvent = Entry.documentMousemove.attach(this, function(a) {
      Entry.playground.resizing && Entry.resizeElement({menuWidth:a.clientX - Entry.interfaceState.canvasWidth});
    }));
  });
  $(document).bind("mouseup touchend", function(a) {
    if (a = Entry.playground.resizeEvent) {
      Entry.playground.resizing = !1, Entry.documentMousemove.detach(a), delete Entry.playground.resizeEvent;
    }
  });
};
Entry.Playground.prototype.reloadPlayground = function() {
  var b = this.mainWorkspace;
  b && (b.getBlockMenu().reDraw(), this.object && this.object.script.view.reDraw());
};
Entry.Playground.prototype.flushPlayground = function() {
  this.object = null;
  if (Entry.playground && Entry.playground.view_) {
    this.injectPicture();
    this.injectSound();
    var b = Entry.playground.mainWorkspace.getBoard();
    b.clear();
    b.changeCode(null);
  }
};
Entry.Playground.prototype.refreshPlayground = function() {
  Entry.playground && Entry.playground.view_ && ("picture" === this.getViewMode() && this.injectPicture(), "sound" === this.getViewMode() && this.injectSound());
};
Entry.Playground.prototype.updateListViewOrder = function(b) {
  b = "picture" == b ? this.pictureListView_.childNodes : this.soundListView_.childNodes;
  for (var a = 0, c = b.length;a < c;a++) {
    b[a].orderHolder.innerHTML = a + 1;
  }
};
Entry.Playground.prototype.generatePictureElement = function(b) {
  function a() {
    if ("" === this.value.trim()) {
      Entry.deAttachEventListener(this, "blur", a), alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus(), Entry.attachEventListener(this, "blur", a);
    } else {
      for (var b = $(".entryPlaygroundPictureName"), c = 0;c < b.length;c++) {
        if (b.eq(c).val() == f.value && b[c] != this) {
          Entry.deAttachEventListener(this, "blur", a);
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          Entry.attachEventListener(this, "blur", a);
          return;
        }
      }
      this.picture.name = this.value;
      Entry.playground.reloadPlayground();
      Entry.dispatchEvent("pictureNameChanged", this.picture);
    }
  }
  var c = Entry.createElement("li", b.id);
  b.view = c;
  c.addClass("entryPlaygroundPictureElement");
  c.picture = b;
  c.bindOnClick(function(a) {
    Entry.playground.selectPicture(this.picture);
  });
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      f.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.clonePicture(b.id);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removePicture(b.id) ? (Entry.removeElement(c), Entry.toast.success(Lang.Workspace.shape_remove_ok, b.name + " " + Lang.Workspace.shape_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.shape_remove_fail, Lang.Workspace.shape_remove_fail_msg);
    }}, {divider:!0}, {text:Lang.Workspace.context_download, callback:function() {
      b.fileurl ? window.open(b.fileurl) : window.open("/api/sprite/download/image/" + encodeURIComponent(b.filename) + "/" + encodeURIComponent(b.name) + ".png");
    }}], "workspace-contextmenu");
  });
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundPictureOrder");
  c.orderHolder = d;
  c.appendChild(d);
  d = Entry.createElement("div", "t_" + b.id);
  d.addClass("entryPlaygroundPictureThumbnail");
  if (b.fileurl) {
    d.style.backgroundImage = 'url("' + b.fileurl + '")';
  } else {
    var e = b.filename;
    d.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + e.substring(0, 2) + "/" + e.substring(2, 4) + "/thumb/" + e + '.png")';
  }
  c.appendChild(d);
  var f = Entry.createElement("input");
  f.addClass("entryPlaygroundPictureName");
  f.addClass("entryEllipsis");
  f.picture = b;
  f.value = b.name;
  Entry.attachEventListener(f, "blur", a);
  f.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.appendChild(f);
  d = Entry.createElement("div", "s_" + b.id);
  d.addClass("entryPlaygroundPictureSize");
  d.innerHTML = b.dimension.width + " X " + b.dimension.height;
  c.appendChild(d);
};
Entry.Playground.prototype.generateSoundElement = function(b) {
  var a = Entry.createElement("sound", b.id);
  b.view = a;
  a.addClass("entryPlaygroundSoundElement");
  a.sound = b;
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      g.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.addSound(b, !0);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removeSound(b.id) ? (Entry.removeElement(a), Entry.toast.success(Lang.Workspace.sound_remove_ok, b.name + " " + Lang.Workspace.sound_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.sound_remove_fail, "");
      Entry.removeElement(a);
    }}], "workspace-contextmenu");
  });
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundOrder");
  a.orderHolder = c;
  a.appendChild(c);
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundThumbnail");
  d.addClass("entryPlaygroundSoundPlay");
  var e = !1, f;
  d.addEventListener("click", function() {
    e ? (e = !1, d.removeClass("entryPlaygroundSoundStop"), d.addClass("entryPlaygroundSoundPlay"), f.stop()) : (e = !0, d.removeClass("entryPlaygroundSoundPlay"), d.addClass("entryPlaygroundSoundStop"), f = createjs.Sound.play(b.id), f.addEventListener("complete", function(a) {
      d.removeClass("entryPlaygroundSoundStop");
      d.addClass("entryPlaygroundSoundPlay");
      e = !1;
    }), f.addEventListener("loop", function(a) {
    }), f.addEventListener("failed", function(a) {
    }));
  });
  a.appendChild(d);
  var g = Entry.createElement("input");
  g.addClass("entryPlaygroundSoundName");
  g.sound = b;
  g.value = b.name;
  var h = document.getElementsByClassName("entryPlaygroundSoundName");
  g.onblur = function() {
    if ("" === this.value) {
      alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus();
    } else {
      for (var a = 0, b = 0;b < h.length;b++) {
        if (h[b].value == g.value && (a += 1, 1 < a)) {
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          return;
        }
      }
      this.sound.name = this.value;
      Entry.playground.reloadPlayground();
    }
  };
  g.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.appendChild(g);
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundLength");
  c.innerHTML = b.duration + " \ucd08";
  a.appendChild(c);
};
Entry.Playground.prototype.toggleColourChooser = function(b) {
  "foreground" === b ? "none" === this.coloursWrapper.style.display ? (this.coloursWrapper.style.display = "block", this.backgroundsWrapper.style.display = "none") : this.coloursWrapper.style.display = "none" : "background" === b && ("none" === this.backgroundsWrapper.style.display ? (this.backgroundsWrapper.style.display = "block", this.coloursWrapper.style.display = "none") : this.backgroundsWrapper.style.display = "none");
};
Entry.Playground.prototype.setTextColour = function(b) {
  Entry.playground.object.entity.setColour(b);
  Entry.playground.toggleColourChooser("foreground");
  $(".entryPlayground_fgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.setBackgroundColour = function(b) {
  Entry.playground.object.entity.setBGColour(b);
  Entry.playground.toggleColourChooser("background");
  $(".entryPlayground_bgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.isTextBGMode = function() {
  return this.isTextBGMode_;
};
Entry.Playground.prototype.checkVariables = function() {
  Entry.forEBS || (Entry.variableContainer.lists_.length ? this.blockMenu.unbanClass("listNotExist") : this.blockMenu.banClass("listNotExist"), Entry.variableContainer.variables_.length ? this.blockMenu.unbanClass("variableNotExist") : this.blockMenu.banClass("variableNotExist"));
};
Entry.Playground.prototype.getViewMode = function() {
  return this.viewMode_;
};
Entry.Playground.prototype.updateHW = function() {
  var b = Entry.playground.mainWorkspace.blockMenu;
  if (b) {
    var a = Entry.hw;
    a && a.connected ? (b.unbanClass("arduinoConnected", !0), b.banClass("arduinoDisconnected", !0), a.banHW(), a.hwModule && b.unbanClass(a.hwModule.name)) : (b.banClass("arduinoConnected", !0), b.unbanClass("arduinoDisconnected", !0), Entry.hw.banHW());
    b.reDraw();
  }
};
Entry.Playground.prototype.toggleLineBreak = function(b) {
  this.object && "textBox" == this.object.objectType && (b ? (Entry.playground.object.entity.setLineBreak(!0), $(".entryPlayground_textArea").css("display", "block"), $(".entryPlayground_textBox").css("display", "none"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-false.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-true.png", this.fontSizeWrapper.removeClass("entryHide")) : (Entry.playground.object.entity.setLineBreak(!1), $(".entryPlayground_textArea").css("display", 
  "none"), $(".entryPlayground_textBox").css("display", "block"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-true.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-false.png", this.fontSizeWrapper.addClass("entryHide")));
};
Entry.Playground.prototype.setFontAlign = function(b) {
  if ("textBox" == this.object.objectType) {
    this.alignLeftBtn.removeClass("toggle");
    this.alignCenterBtn.removeClass("toggle");
    this.alignRightBtn.removeClass("toggle");
    switch(b) {
      case Entry.TEXT_ALIGN_LEFT:
        this.alignLeftBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_CENTER:
        this.alignCenterBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_RIGHT:
        this.alignRightBtn.addClass("toggle");
    }
    this.object.entity.setTextAlign(b);
  }
};
Entry.Playground.prototype.hideBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().hide();
};
Entry.Playground.prototype.showBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().show();
};
Entry.Xml = {};
Entry.Xml.isTypeOf = function(b, a) {
  return a.getAttribute("type") == b;
};
Entry.Xml.getNextBlock = function(b) {
  b = b.childNodes;
  for (var a = 0;a < b.length;a++) {
    if ("NEXT" == b[a].tagName.toUpperCase()) {
      return b[a].children[0];
    }
  }
  return null;
};
Entry.Xml.getStatementBlock = function(b, a) {
  var c = a.getElementsByTagName("statement");
  if (!c.length) {
    return a;
  }
  for (var d in c) {
    if (c[d].getAttribute("name") == b) {
      return c[d].children[0];
    }
  }
  return null;
};
Entry.Xml.getParentLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && "STATEMENT" == b.tagName.toUpperCase()) {
      return b.parentNode;
    }
    if (b) {
      b = b.parentNode;
    } else {
      return null;
    }
  }
};
Entry.Xml.getParentIterateLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && b.getAttribute("type") && "REPEAT" == b.getAttribute("type").toUpperCase().substr(0, 6)) {
      return b;
    }
    if (!b) {
      return null;
    }
  }
};
Entry.Xml.getParentBlock = function(b) {
  return (b = b.parentNode) ? b.parentNode : null;
};
Entry.Xml.callReturn = function(b) {
  var a = Entry.Xml.getNextBlock(b);
  return a ? a : Entry.Xml.getParentLoop(b);
};
Entry.Xml.isRootBlock = function(b) {
};
Entry.Xml.getValue = function(b, a) {
  var c = a.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if ("VALUE" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == b) {
      return c[d].children[0];
    }
  }
  return null;
};
Entry.Xml.getNumberValue = function(b, a, c) {
  c = c.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].tagName && "VALUE" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == a) {
      return +Entry.Xml.operate(b, c[d].children[0]);
    }
  }
  return null;
};
Entry.Xml.getField = function(b, a) {
  var c = a.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].tagName && "FIELD" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == b) {
      return c[d].textContent;
    }
  }
};
Entry.Xml.getNumberField = function(b, a) {
  var c = a.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if ("FIELD" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == b) {
      return +c[d].textContent;
    }
  }
};
Entry.Xml.getBooleanValue = function(b, a, c) {
  c = c.getElementsByTagName("value");
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].getAttribute("name") == a) {
      return Entry.Xml.operate(b, c[d].children[0]);
    }
  }
  return null;
};
Entry.Xml.operate = function(b, a) {
  return Entry.block[a.getAttribute("type")](b, a);
};
Entry.Xml.cloneBlock = function(b, a, c) {
  var d = b.cloneNode();
  b.parentNode && "xml" != b.parentNode.tagName && Entry.Xml.cloneBlock(b.parentNode, d, "parent");
  for (var e = 0;e < b.childNodes.length;e++) {
    var f = b.childNodes[e];
    f instanceof Text ? d.textContent = f.textContent : "parent" == c ? d.appendChild(a) : d.appendChild(Entry.Xml.cloneBlock(f, d, "child"));
  }
  return d;
};
Entry.Youtube = function(b) {
  this.generateView(b);
};
p = Entry.Youtube.prototype;
p.init = function(b) {
  this.youtubeHash = b;
  this.generateView();
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryRemove");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "youtubeIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", "https://www.youtube.com/embed/" + b);
  this.movieFrame = a;
  this.movieContainer.appendChild(a);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var b = document.getElementsByClassName("propertyContent")[0], a = document.getElementById("youtubeIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};

