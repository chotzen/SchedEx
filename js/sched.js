var letters = ["A", "B", "C", "D", "E", "F"];

var classList = [];
var selClass = undefined;

var schedTbl = document.getElementById("schedTbl");
var cols = new Array(6);

var className = document.getElementById("class-name");
var roomLoc = document.getElementById("room-loc");
var startTimeSelect = document.getElementById("start-time");
var endTimeSelect = document.getElementById("end-time")
var daycbx = new Array(6);

function Class(name, location, days, color, startTime, endTime /* Last occupied timeslot */) {
  this.name = name;
  this.location = location;
  this.days = days;
  this.startTime = startTime;
  this.endTime = endTime;
  this.timeSlots = function() {
    var ret = [];
    for (var i = startTime; i <= endTime; i++) {
      ret.push(i);
    }
    return ret;
  }
  this.timeSlotDays = function() {
    var ret = [];
    for (var i = 0; i < days.length; i++) {
      for (var j = 0; j < this.timeSlots().length; j++) {
        ret.push(new Slot(this.timeSlots()[j], this.days[i]));
      }
    }
    return ret;
  }
  this.cells = function() {
    var ret = [];
    for (var i = 0; i < days.length; i++) {
      for (var j = 0; j < this.timeSlots().length; j++) {
        ret.push(getCell(this.timeSlots()[j], days[i]));
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
  }, 100);
  document.addEventListener('click', onClick)
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

function hasClass(r, c) {
  var c = getCell(r, c);
  for (var i = 0; i < classList.length; i++) {
    console.log("i=" + i);
    for (var m = 0; m < classList[i].cells().length; m++) {
      if (c === classList[i].cells()[m]) {
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
    console.log(target.id);
  }
}

function getCell(r, c) {
  return document.getElementById("cell-" + r + "-" + c);
}

function hasClass() {

}
