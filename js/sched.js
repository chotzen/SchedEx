

var schedTbl = document.getElementById("schedTbl");

setup();

function setup() {
  for (var i = 0; i < 32; i++) {
    var row = document.createElement("tr");
    row.id = "row-" + i;
    if (i % 2 === 0) {
      row.style = "background-color:lightgray;";
    }
    // Time
    var timeCell = document.createElement("td");
    timeCell.innerHTML = time(i);
    timeCell.width = "45px";

    row.appendChild(timeCell);

    // Cells
    for (var j = 0; j < 6; j++) {
      var cell = document.createElement("td");
      cell.id = "cell-" + i + "-" + j;
      cell.className = "timeslot";
      row.appendChild(cell);
    }
    schedTbl.appendChild(row);
  }
}

function time(int) {
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
