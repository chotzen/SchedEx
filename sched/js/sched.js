// General reference variables
var letters = ["A", "B", "C", "D", "E", "F"];
var hex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
var goodcolors = ["#c11b1b", "#9b8a0a", "#476d00", "#037a46", "#078a96", "#1f076d", "#7c0673", "#960d3b"];

// List of all class objects
var classList = [];

// Currently selected class
var selClass = undefined;

// References to elements in the document to be read and changed later
var schedTbl = document.getElementById("schedTbl");
var cols = new Array(6);
var className = document.getElementById("class-name");
var roomLoc = document.getElementById("room-loc");
var startTimeSelect = document.getElementById("start-time");
var endTimeSelect = document.getElementById("end-time")
var colorpicker = document.getElementById("colorpicker")
var priority = document.getElementById("priority");
var schemCode = document.getElementById("schem-code")
var loadSchem = document.getElementById("load-schem-text")
var daycbx = new Array(6);


// Definition of a class (its properties)
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
      var timeslots = this.timeSlots();
      for (var j = 0; j < timeslots.length; j++) {
        ret.push(new Slot(timeslots[j], this.days[i]));
      }
    }
    return ret;
  }
  this.cells = function() {
    var ret = [];
    for (var i = 0; i < this.days.length; i++) {
      var timeslots = this.timeSlots();
      for (var j = 0; j < timeslots.length; j++) {
        ret.push(getCell(timeslots[j], this.days[i]));
      }
    }
    return ret;
  }
}

// A way to help keep track of timeslots
function Slot(r, c) {
  this.r = r;
  this.c = c;
}

start();
// Code to be executed when page loads
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
  }, 300);
  document.addEventListener('click', onClick);
  document.addEventListener('click', updateSelectors);

  // Load schematic from url query
  if (getParameterByName("sched")) {
    var data = JSON.parse(getParameterByName("sched"));
    classList = [];
    var colors = 0;
    for (var i = 0; i < data.length; i++) {
      var m = data[i];
      var c = randomColor()
      if (m.name.charAt(m.name.length - 1) === " ") {
        m.name = m.name.substring(0, m.name.length - 1);
      }
      if (m.name === "ASSEMBLY" || m.name === "CHAPEL" || m.name === "LONG AP") {
        c = "#2b2b2b";
      } else {
        if (colors < goodcolors.length) {
          c = goodcolors[colors];
          colors++;
          console.log("Gave color " + colors + " to " + m.name);
        }
      }
      classList.push(new Class(m.name, m.location, m.days, c, m.startTime, m.endTime));
    }
  }
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
    soption.id = "start-" + i;
    var eoption = document.createElement("option");
    eoption.innerHTML = time(i+1);
    eoption.id = "end-" + i;
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

// Gets the class at a timeslot. Returns false if nonexistent
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

// Stuff to do when the mouse clicks
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

// Updates the view of the schedule
function updateView() {
  for (var i = 0; i < 32; i++) {
    for (var j = 0; j < 6; j++) {
      getCell(i, j).innerHTML = "";
      if (getClass(i, j)) {
        getCell(i, j).style.backgroundColor = getClass(i, j).color;
        if (checkDark(getClass(i, j).color)) {
          getCell(i, j).style.color = "white";
        } else {
          getCell(i, j).style.color = "black";
        }
      } else {
        getCell(i, j).style.backgroundColor = "transparent";
      }
    }
  }

  for (var i = 0; i < classList.length; i++) {

    if (classList[i].endTime - classList[i].startTime === 0) {
      var val = classList[i].name.substring(0, 5) + " " + classList[i].location.substring(0, 4);
      for (var j = 0; j < classList[i].days.length; j++) {
        getCell(classList[i].startTime, classList[i].days[j]).innerHTML = val;
      }
    } else if (classList[i].endTime - classList[i].startTime > 0) {
      var uppermid = Math.floor((classList[i].startTime + classList[i].endTime - 1)/2);
      var lowermid = uppermid + 1;
      for (var j = 0; j < classList[i].days.length; j++) {
        getCell(uppermid, classList[i].days[j]).innerHTML = classList[i].name;
        getCell(lowermid, classList[i].days[j]).innerHTML = classList[i].location;
      }
    }
  }
  var k = JSON.stringify(classList);
  schemCode.innerHTML = JSON.stringify(k);
}

// Updates the information on the right side
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
  updateSelectors();
}

// Checks if there is a conflict before a certain time
function conflictBefore(ind) {
  for (var i = ind; i < selClass.startTime; i++) {
    if (hasConflict(i)) {
      return true;
    }
  } return false;
}

// Checks if there is a conflict after a certain time
function conflictAfter(ind) {
  for (var i = ind; i > selClass.endTime; i--) {
    if (hasConflict(i)) {
      return true;
    }
  } return false;
}

// Checks if a class would theoretically have a conflict at a time.
function hasConflict(time) {
  for (var k = 0; k < selClass.days.length; k++) {
    if (getClass(time, selClass.days[k])) {
      return true;
    }
  }
  return false;
}

// Updates the dropdowns to select start and end times to reflect conflicting classes
function updateSelectors() {
  if (selClass) {
    if ($("#start-time").is(":focus") || $("#end-time").is(":focus")) {
      console.log("updating selectors");
      for (var i = 0; i < 32; i++) {
        document.getElementById("start-" + i).disabled = conflictBefore(i) || i > selClass.endTime;
        document.getElementById("end-" + i).disabled = conflictAfter(i) || i < selClass.startTime;
      }
    } else {

    }
  }
}

// Saves the information from the class editor
function saveInfo() {
  if (selClass != undefined) {
    selClass.name = className.value;
    selClass.location = roomLoc.value;
    selClass.startTime = startTimeSelect.selectedIndex;
    selClass.endTime = endTimeSelect.selectedIndex;
    selClass.color = $("#colorpicker").data('colorpicker').color.toHex();
    var days = [];
    for (var i = 0; i < 6; i++) {
      if (getBox(i).checked) {
        days.push(i);
      }
    }
    selClass.days = days;
  }
}

// Saves the class schedule as a PDF
function savePDF() {
  var pdf = new jsPDF('p', 'pt', 'letter');
  // Headers

  pdf.setDrawColor(0)
  pdf.setFillColor(255)
  pdf.rect(20,30,570,20, "F")
  pdf.setFont("helvetica")
  pdf.setFontSize(12);

  for (var i = 0; i < 32; i++) {
    if (i % 2 !== 0) {
      pdf.setFillColor(255);
    } else {
      pdf.setFillColor(230);
    }
    pdf.setDrawColor(255);
    pdf.rect(20, 50 + (i * 20), 570, 20, "F");
    pdf.text(time(i), 45, 66 + (i * 20), "center");
  }
  pdf.setFontSize(15);
  for (var i = 0; i < 6; i++) {
    pdf.text(letters[i], 107 + (86 * i), 40);
  }
  pdf.setFontSize(12);
  pdf.setFontType("normal");

  for (var i = 0; i < classList.length; i++) {
    var color = classList[i].color;
    var red = parseInt(color.substring(1, 3), 16);
    var green = parseInt(color.substring(3, 5), 16);
    var blue = parseInt(color.substring(5), 16);
    var white = (red + green + blue)/3 > 150;
    for (var di = 0; di < classList[i].days.length; di++) {
      pdf.setFillColor(red, green, blue);
      pdf.rect(68 + (classList[i].days[di] * 87), 50 + (classList[i].startTime * 20), 87, 20 * (classList[i].endTime - classList[i].startTime + 1), "F");
      var topaverage = Math.floor((classList[i].startTime + classList[i].endTime) / 2);
      if (white) {
        pdf.setTextColor(0);
      } else {
        pdf.setTextColor(255);
      }
      pdf.text(classList[i].name, 111 + (classList[i].days[di] * 87), 67 + (topaverage* 20), "center");
      pdf.text(classList[i].location, 111 + (classList[i].days[di] * 87), 67 + ((topaverage + 1)* 20), "center");
    }
  }
  pdf.setDrawColor(0);
  pdf.setLineWidth(1.5);
  pdf.line(20, 50, 590, 50);


  pdf.save('Schedule.pdf');
}

// Checks if a color is considered dark enough to have white text
function checkDark(color) {
    var red = parseInt(color.substring(1, 3), 16);
    var green = parseInt(color.substring(3, 5), 16);
    var blue = parseInt(color.substring(5), 16);
    return ((red + green + blue) / 3 < 145);
}

// Generates a random hex color
function randomColor() {
  var str = "#";
  for (var i = 0; i < 6; i++) {
    str += hex[parseInt(Math.random(hex.length) * 16)];
  }
  return str;
}

// Returns a Slot object from a DOM id string
function stringToSlot(str) {
  var split = str.split("-");
  return new Slot(parseInt(split[1]), parseInt(split[2]));
}

// Finds the DOM cell at coordinates
function getCell(r, c) {
  return document.getElementById("cell-" + r + "-" + c);
}

// Gets the letter day checkbox at a numeric value
function getBox(d) {
  return document.getElementById("box-" + d);
}

// Loads schematic data
function doSchem() {
  classList = [];
  var value = loadSchem.value;
  var data = JSON.parse(value);
  for (var i = 0; i < data.length; i++) {
    var m = data[i];
    classList.push(new Class(m.name, m.location, m.days, m.color, m.startTime, m.endTime));
  }
  selClass = undefined;
  disableAll(true);
  updateView();
}

// Resets the schedule
function reset() {
  classList = [];
  selClass = undefined;
  disableAll(true);
}

// Deletes the selected class
function deleteClass() {
  classList.splice(classList.findIndex(findSel), 1);
  selClass = undefined;
  updateRight();
  disableAll(true);

} // findIndex()

// Checks if a class is the one being selected
function findSel(e) {
  return (e === selClass);
}

// Searches for the url query
function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
