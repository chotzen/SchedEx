// Abandon all hope, all ye who enter here

var letters = ["A", "B", "C", "D", "E", "F"]
var hex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
           "A", "B", "C", "D", "E", "F"]

var dayBoxes = new Array(6)
var classList = [];

setInterval(saveData, 10);

var selClass = undefined;


function Class(name, location, days, color, startTime, endTime) {
  this.name = name;
  this.location = location;
  // days is an array of integers
  this.days = days;
  this.color = color;
  this.startTime = startTime;
  this.endTime = endTime;
  this.timeSlots = function() {
    var timeSlotList = [];
    for (var i = 0; i < days.length; i++){
      for (var j = startTime; j < endTime; j++) {
        timeSlotList.splice(0, 0, document.getElementById("timeslot-" + j + "-" + days[i]))
      }
    }
    return timeSlotList
  }
}


function reload() {
  // reset all cells
  for (var i = 0; i < 32; i++) {
    for (var j = 0; j < 6; j++) {
      if (i % 2 == 0) {
        document.getElementById("timeslot-" + i + "-" + j).style.backgroundColor = "#D3D3D3"
      } else {
        document.getElementById("timeslot-" + i + "-" + j).style.backgroundColor = "white"
      }
      document.getElementById("timeslot-" + i + "-" + j).style.color = "black"
      document.getElementById("timeslot-" + i + "-" + j).innerHTML = "";
      document.getElementById("timeslot-" + i + "-" + j).class = undefined;

    }
  }

  for (var i = 0; i < classList.length; i++) {
    var color = classList[i].color;
    var red = parseInt(color.substring(1, 3), 16)
    var green = parseInt(color.substring(3, 5), 16)
    var blue = parseInt(color.substring(5), 16)

    var avg = (red + green + blue) / 3
    for (var d = 0; d < classList[i].days.length; d++) {
      if (classList[i].endTime - classList[i].startTime === 1) {
        document.getElementById("timeslot-" + classList[i].startTime + "-" + classList[i].days[d]).style.backgroundColor = color
        document.getElementById("timeslot-" + classList[i].startTime + "-" + classList[i].days[d]).innerHTML = classList[i].name.substring(0, 4) + ". - " + classList[i].location
        if (avg < 150) {
          document.getElementById("timeslot-" + classList[i].startTime + "-" + classList[i].days[d]).style.color = "white"
        }
      } else {
        for (var s = classList[i].startTime; s < classList[i].endTime; s++) {
          var timeSlot = document.getElementById("timeslot-" + s + "-" + classList[i].days[d])
          timeSlot.style.backgroundColor = color;
          timeSlot.class = classList[i]
        }
        var topMiddle = Math.floor((classList[i].startTime + classList[i].endTime) / 2) - 1
        document.getElementById("timeslot-" + topMiddle + "-" + classList[i].days[d]).innerHTML = classList[i].name
        document.getElementById("timeslot-" + (topMiddle + 1) + "-" + classList[i].days[d]).innerHTML = classList[i].location
        if (avg < 150) {
          document.getElementById("timeslot-" + topMiddle + "-" + classList[i].days[d]).style.color = "white"
          document.getElementById("timeslot-" + (topMiddle + 1) + "-" + classList[i].days[d]).style.color = "white"
        }
      }
    }
  }

  document.getElementById("schematic-here").innerHTML = JSON.stringify(classList);
}



var selectedTimeSlot = undefined;
var startOpen = false;

document.addEventListener('click', function(e) {
  var id = event.target.id
  if (id.indexOf("timeslot") !== -1) {
    selectedTimeSlot = document.getElementById("timeslot-" + getPeriod(event.target) + "-" + getDay(event.target))
    prepInfo(getDay(event.target), getPeriod(event.target))
  }
  updateDropdowns()

}, false)



function prepInfo(day, period) {
  selClass = document.getElementById("timeslot-" + period + "-" + day).class
  console.log(selClass)
  if (selClass !== undefined) {
    document.getElementById("classname").value = selClass.name;
    document.getElementById("location").value = selClass.location;
    for (var i = 0; i < 6; i++) {
      document.getElementById("daybox-" + i).checked = false;
    }
    for (var i = 0; i < selClass.days.length; i++) {
      document.getElementById("daybox-" + selClass.days[i]).checked = true;
    }
    for (var i = 0; i < 32; i++) {
      document.getElementById("soption-" + i).selected = ""
      document.getElementById("eoption-" + (i+1)).selected = ""
    }
    document.getElementById("soption-" + selClass.startTime).selected = "selected"
    document.getElementById("eoption-" + selClass.endTime).selected = "selected"
    $("#colorpicker-div").colorpicker('setValue', "#" + selClass.color)

  } else {
    newColor();
    for (var i = 0; i < 32; i++) {
        document.getElementById("soption-" + i).selected = ""
        document.getElementById("eoption-" + (i+1)).selected = ""
    }

    document.getElementById("soption-" + period).selected = "selected"
    if (period < 28) {
      document.getElementById("eoption-" + (period + 4)).selected = "selected"
    } else {
      document.getElementById("eoption-32").selected = "selected"
    }


    for (var i = 0; i < 6; i++) {
      if (i === day)
        document.getElementById("daybox-" + i).checked = true;
      else
        document.getElementById("daybox-" + i).checked = false;
    }

    document.getElementById("classname").value = ""
    document.getElementById("location").value = ""

    selClass = new Class("", "", [day], document.getElementById("colorpicker").value, period, period+4)

    classList.splice(0,0,selClass)


  }
  setDisabled(false);
}

function saveData() {
  if (selClass !== undefined) {
    selClass.name = document.getElementById("classname").value
    selClass.location = document.getElementById("location").value
    var newDays = []
    for (var i = 0; i < 6; i++) {
      if (document.getElementById("daybox-" + i).checked) {
        newDays.splice(0,0,i)
      }
    }
    selClass.days = newDays
    selClass.color = $("#colorpicker-div").colorpicker("getValue")
    selClass.startTime = document.getElementById("start-time-select").selectedIndex;
    selClass.endTime = document.getElementById("end-time-select").selectedIndex + 1;
  }
  //console.log(selClass)
  reload()
}


function updateDropdowns() {
  if (selClass == undefined) {
    return;
  }
  setTimeout(function() {
    console.log("updated dropdown")
    var startTime = selClass.startTime
    var endTime = selClass.endTime
    for (var n = 0; n < 32; n++) {
      if (n < startTime) {
        document.getElementById("end-time-select").options[n].disabled = true;
        document.getElementById("end-time-select").options[n].innerHTML = toTime(n + 2/3)
      } else {
        document.getElementById("end-time-select").options[n].disabled = false;
        document.getElementById("end-time-select").options[n].innerHTML = toTime(n + 2/3) + " - " + toHr(n - startTime + 1)
      }

      if (n > endTime - 1) {
        document.getElementById("start-time-select").options[n].disabled = true;
        document.getElementById("start-time-select").options[n].innerHTML = toTime(n)
      } else {

        document.getElementById("start-time-select").options[n].disabled = false;
        document.getElementById("start-time-select").options[n].innerHTML = toTime(n) + " - " + toHr(endTime - n)
      }
    }
  }, 50)
}


document.getElementById("delete").addEventListener("click", function() {
  var index = classList.indexOf(selClass)
  classList.splice(index, 1)
  setDisabled(true)
  console.log("triggered")
})

document.getElementById("reset").addEventListener("click", function() {
  classList = [];
  setDisabled(true);
})

document.getElementById("submit-schematic-load").addEventListener("click", function() {
  try {
    classList = JSON.parse(document.getElementById("schematic-paste").value);
  } catch (error) {
    $("load-schematic").modal()
  }
})

document.getElementById("savePDF").addEventListener("click",
function() {
  var pdf = new jsPDF('p', 'pt', 'letter');
  // Headers

  pdf.setDrawColor(0)
  pdf.setFillColor(255)
  pdf.rect(20,30,570,20, "F")
  pdf.setFont("helvetica")

  for (var i = 0; i < 32; i++) {
    if (i % 2 !== 0) {
      pdf.setFillColor(255)
    } else {
      pdf.setFillColor(200)
    }
    pdf.setDrawColor(255)
    pdf.rect(20, 50 + (i * 20), 570, 20, "F")
    pdf.text(toTime(i), 45, 66 + (i * 20), "center")
  }

  for (var i = 0; i < 6; i++) {
    pdf.text(letters[i], 107 + (86 * i), 40)
  }

  for (var i = 0; i < classList.length; i++) {
    var color = classList[i].color;
    var red = parseInt(color.substring(1, 3), 16)
    var green = parseInt(color.substring(3, 5), 16)
    var blue = parseInt(color.substring(5), 16)
    var white = (red + green + blue)/3 > 150
    for (var di = 0; di < classList[i].days.length; di++) {
      pdf.setFillColor(red, green, blue)
      pdf.rect(68 + (classList[i].days[di] * 87), 50 + (classList[i].startTime * 20), 87, 20 * (classList[i].endTime - classList[i].startTime), "F")
      var topaverage = Math.floor((classList[i].startTime + classList[i].endTime) / 2) - 1
      if (white) {
        pdf.setTextColor(0)
      } else {
        pdf.setTextColor(255)
      }
      pdf.setFontSize(14)
      pdf.text(classList[i].name, 111 + (classList[i].days[di] * 87), 67 + (topaverage* 20), "center")
      pdf.text(classList[i].location, 111 + (classList[i].days[di] * 87), 67 + ((topaverage + 1)* 20), "center")
    }
  }


  pdf.save('Schedule.pdf')
})

function textBox(fr, fg, fb, x, y, height, width, text, pdf) {
  pdf.setDrawColor(0)
  pdf.setFillColor(fr, fg, fb)
  pdf.rect(x, y, height, width)
  if ((fr + fg + fb) / 3 > 125) {
    pdf.setTextColor(255)
  } else {
    pdf.setTextColor(0)
  }
  pdf.text(text, x, y, height, width, 'center')
}

function getPeriod(timeSlot) {
  var id = timeSlot.id;
  if (id.charAt(10) === "-") {
    return parseInt(id.charAt(9))
  } else {
    return parseInt(10 * id.charAt(9)) + parseInt(id.charAt(10))
  }
}

function getDay(timeSlot) {
  var id = timeSlot.id
  if (id.charAt(10) === "-") {
    return parseInt(id.charAt(11))
  } else {
    return parseInt(id.charAt(12))
  }
}



function toTime(period) {
  var min = (period * 15) + 450
  var leftside = min % 60
  if (leftside == 0) {
    leftside = '00'
  }
  return Math.floor(min / 60) + ":" + leftside
}

function toHr(length) {
  var min = (length * 15)
  var leftside = min % 60
  if (leftside == 0) {
    leftside = '00'
  }
  return Math.floor(min / 60) + ":" + leftside
}

function newColor() {
  var color = ""
  for (var i = 0; i < 6; i++) {
    color = color + hex[Math.floor(Math.random() * 16)]
  }
  var el = document.getElementById("colorpicker")
  $("#colorpicker-div").colorpicker('setValue', "#" + color)
  //for (var i = 0; i < el.length; i++) {
  //  el[i].value = color
  //}
  //document.getElementById("colorpicker").style.backgroundColor = color;
}

function setDisabled(val) {
  document.getElementById("classname").disabled = val;
  document.getElementById("location").disabled = val;
  document.getElementById("start-time-select").disabled = val;
  document.getElementById("end-time-select").disabled = val;
  document.getElementById("delete").disabled = val;
  document.getElementById("colorpicker").disabled = val;
  for (var i = 0; i < 6; i++) {
    document.getElementById("daybox-" + i).disabled = val;
  }
}


setup();
function setup() {
  var timesTable = document.getElementById("times-table")
  var schedTable = document.getElementById("sched-table")

  for (var i = 0; i < 32; i++) {
    var timesRow = document.createElement("tr")
    var timesH = document.createElement("th")
    timesH.innerHTML = toTime(i)
    timesH.id = "timelabel-" + i
    if (i % 2 === 0) {
      timesH.style = "border-top: none; border-left: 2px solid black; border-right: 2px solid black; background-color: #D3D3D3"
    } else {
      timesH.style = "border-top: none; border-left: 2px solid black; border-right: 2px solid black; background-color: #FFFFFF"
    }

    timesRow.appendChild(timesH)
    timesTable.appendChild(timesRow)

    var schedRow = document.createElement("tr")

    for (var j = 0; j < 6; j++) {
      var timeslot = document.createElement("td")
      timeslot.setAttribute('id', 'timeslot-' + i + '-' + j)
      timeslot.setAttribute('class', 'timeslot')
      if (i % 2 === 0) {
        timeslot.style = "background-color: #FFFFFF"
      } else {
        timeslot.style = "background-color: #D3D3D3"
      }
      schedRow.appendChild(timeslot)
    }

    schedTable.appendChild(schedRow)
  }
  document.getElementById("timelabel-31").style = "border-top: none; border-left: 2px solid black; border-right: 2px solid black; border-bottom: 2px solid black; background-color: #FFFFFF"

  var startTimeSelect = document.getElementById("start-time-select")
  var endTimeSelect = document.getElementById("end-time-select")

  for (var i = 0; i < 32; i++) {
    var soption = document.createElement("option")
    var eoption = document.createElement("option")

    soption.value = i
    eoption.value = i+1

    soption.addEventListener('click', updateDropdowns)
    eoption.addEventListener('click', updateDropdowns)
    soption.id = "soption-" + soption.value
    eoption.id = "eoption-" + eoption.value

    if (i === 3) {
      eoption.selected = "selected"
    }

    soption.innerHTML = toTime(i)
    eoption.innerHTML = toTime(i+(2/3))

    startTimeSelect.appendChild(soption)
    endTimeSelect.appendChild(eoption)
  }

  for (var i = 0; i < 6; i++) {
    var lbl = document.createElement("label")
    lbl.setAttribute('class', 'checkbox-inline')
    dayBoxes[i] = document.createElement("input")
    dayBoxes[i].type = "checkbox"
    dayBoxes[i].id = "daybox-" + i
    dayBoxes[i].disabled = true;

    lbl.appendChild(dayBoxes[i])
    lbl.innerHTML = lbl.innerHTML + " " + letters[i]
    document.getElementById("checkboxes").appendChild(lbl)
  }

  updateDropdowns();
}

$(function() {
    $('#colorpicker-div').colorpicker();
});
