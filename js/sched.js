var letters = ["A", "B", "C", "D", "E", "F"];
var hex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

var classList = [];
var selClass = undefined;

var schedTbl = document.getElementById("schedTbl");
var cols = new Array(6);

var className = document.getElementById("class-name");
var roomLoc = document.getElementById("room-loc");
var startTimeSelect = document.getElementById("start-time");
var endTimeSelect = document.getElementById("end-time")
var colorpicker = document.getElementById("colorpicker")
var priority = document.getElementById("priority");
var daycbx = new Array(6);

function Class(name, location, days, color, startTime, endTime /* Last occupied timeslot */) {
  this.name = name;
  this.location = location;
  this.days = days;
  this.color = color;
  this.startTime = startTime;
  this.endTime = endTime;
  this.timeSlots = function() {
    var ret = [];
    for (var i = this.startTime; i <= this.endTime; i++) {
      ret.push(i);
    }
    return ret;
  }
  this.timeSlotDays = function() {
    var ret = [];
    for (var i = 0; i < this.days.length; i++) {
      for (var j = 0; j < this.timeSlots().length; j++) {
        ret.push(new Slot(this.timeSlots()[j], this.days[i]));
      }
    }
    return ret;
  }
  this.cells = function() {
    var ret = [];
    for (var i = 0; i < this.days.length; i++) {
      for (var j = 0; j < this.timeSlots().length; j++) {
        ret.push(getCell(this.timeSlots()[j], this.days[i]));
      }
    }
    return ret;
  }
}

function Slot(r, c) {
  this.r = r;
  this.c = c;
}

start();
// Code to be executed at start
function start() {
  setup();
  setupRight();
  disableAll(true);

  // Fixes column widths periodically
  setInterval(function() {
    var width = (schedTbl.offsetWidth - 45) / 6;
    for (var i = 0; i < 6; i++) {
      cols[i].width = width + "px";
    }

    saveInfo();
    updateView();
  }, 100);
  document.addEventListener('click', onClick);
}

// Sets up schedule grid
function setup() {
  // Header
  for (var i = 0; i < 6; i++) {
    cols[i] = document.getElementById(letters[i]);
  }

  for (var i = 0; i < 32; i++) {
    var row = document.createElement("tr");
    row.id = "row-" + i;
    if (i % 2 === 0) {
      row.style = "background-color:rgb(230, 230, 230);";
    }
    // Time
    var timeCell = document.createElement("td");
    timeCell.innerHTML = time(i);
    timeCell.offsetWidth = 45;

    row.appendChild(timeCell);

    // Class Cells
    for (var j = 0; j < 6; j++) {
      var cell = document.createElement("td");
      cell.id = "cell-" + i + "-" + j;
      cell.className = "timeslot";
      row.appendChild(cell);
    }
    schedTbl.appendChild(row);
  }
}

// Sets up right side (day checkboxes, dropdowns)
function setupRight() {
  // Start / End time

  for (var i = 0; i < 32; i++) {
    var soption = document.createElement("option");
    soption.innerHTML = time(i);
    var eoption = document.createElement("option");
    eoption.innerHTML = time(i+1);
    startTimeSelect.appendChild(soption);
    endTimeSelect.appendChild(eoption);
  }

  // Day checkboxes
  var contain = document.getElementById("day-select");
  for (var i = 0; i < 6; i++) {
    var formDiv = document.createElement("div");
    formDiv.className = "form-check form-check-inline";
    var label = document.createElement("label");
    label.className = "form-check-label";
    var input = document.createElement("input");
    input.className = "form-check-input";
    input.type = "checkbox";
    input.name = letters[i];
    input.id = "box-" + i;
    input.value = i;
    daycbx[i] = input;
    label.appendChild(input);
    label.innerHTML += " " + letters[i];
    formDiv.appendChild(label);
    contain.appendChild(formDiv);
  }
}

// Enables or disables right side
function disableAll(val) {
  className.disabled = val;
  roomLoc.disabled = val;
  startTimeSelect.disabled = val;
  endTimeSelect.disabled = val;
  colorpicker.disabled = val;

  for (var i = 0; i < 6; i++) {
    document.getElementById("box-" + i).disabled = val;
  }
}

// Converts timeslot as integer to human-readable time
function time(int) {
  int += 2;
  var hr = (Math.floor((int / 4) + 7)) % 12;
  if (hr === 0) {
    hr = 12;
  }
  var min = 15 * (int % 4);
  if (int % 4 === 0) {
    min = min + "0"
  }

  return hr + ":" + min;
}

function getClass(r, c) {
  for (var i = 0; i < classList.length; i++) {
    for (var m = 0; m < classList[i].timeSlotDays().length; m++) {
      if (r === classList[i].timeSlotDays()[m].r &&
          c === classList[i].timeSlotDays()[m].c) {
            return classList[i];
      }
    }
  }
  return false;
}

function onClick(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  if (target.id.includes("cell-")) {
    var slot = stringToSlot(target.id);
    if (getClass(slot.r, slot.c)) {
      // load class data
    } else {
      // make new class
      var endtime = slot.r + 3;
      while (endtime >= 32 || getClass(endtime, slot.c)) {
        endtime--;
      }

      classList.push(new Class("", "", [slot.c], randomColor(), slot.r, endtime));
      updateView();
    }

    $("#colorpicker").colorpicker('setValue', getClass(slot.r, slot.c).color);

    selClass = getClass(slot.r, slot.c);

    updateRight();
  }
}

function updateView() {
  for (var i = 0; i < 32; i++) {
    for (var j = 0; j < 6; j++) {
      getCell(i, j).innerHTML = "";
      if (getClass(i, j)) {
        getCell(i, j).style.backgroundColor = getClass(i, j).color;
      } else {
        getCell(i, j).style.backgroundColor = "transparent";
      }
    }
  }

  for (var i = 0; i < classList.length; i++) {

    var uppermid = Math.floor((classList[i].startTime + classList[i].endTime - 1)/2);
    var lowermid = uppermid + 1;
    for (var j = 0; j < classList[i].days.length; j++) {
      getCell(uppermid, classList[i].days[j]).innerHTML = classList[i].name;
      getCell(lowermid, classList[i].days[j]).innerHTML = classList[i].location;
    }
  }
}

function updateRight() {
  for (var i = 0; i < 6; i++) {
    getBox(i).checked = false;
  }
  if (selClass === undefined) {
    className.value = "";
    roomLoc.value = "";

    disableAll(true);
  } else {
    disableAll(false);
    className.value = selClass.name;
    roomLoc.value = selClass.location;
    startTimeSelect.selectedIndex = selClass.startTime;
    endTimeSelect.selectedIndex = selClass.endTime;


    for (var i = 0; i < selClass.days.length; i++) {
      getBox(selClass.days[i]).checked = true;
    }
  }
}

function saveInfo() {
  if (selClass != undefined) {
    selClass.name = className.value;
    selClass.location = roomLoc.value;
    selClass.startTime = startTimeSelect.selectedIndex;
    selClass.endTime = endTimeSelect.selectedIndex;
    selClass.color = colorpicker.value;
    var days = [];
    for (var i = 0; i < 6; i++) {
      if (getBox(i).checked) {
        days.push(i);
      }
    }
    selClass.days = days;
  }
}

function randomColor() {
  var str = "#";
  for (var i = 0; i < 6; i++) {
    str += hex[parseInt(Math.random(hex.length) * 16)];
  }
  return str;
}

function stringToSlot(str) {
  var split = str.split("-");
  return new Slot(parseInt(split[1]), parseInt(split[2]));
}

function getCell(r, c) {
  return document.getElementById("cell-" + r + "-" + c);
}
function getBox(d) {
  return document.getElementById("box-" + d);
}
