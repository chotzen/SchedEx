var tbody = document.getElementById("j_id_jsp_1908326749_1:listView:j_id_jsp_1167872640_21pc3:tbody_element");

function Class(name, location, days, color, startTime, endTime /* Last occupied timeslot */) {
  this.name = name;
  this.location = location;
  this.days = days;
  this.color = color;
  this.startTime = startTime;
  this.endTime = endTime;
}
console.log('loded')
scrape();

function scrape() {
  console.log("SCRAPING...");
  var i = 1;
  var classList = [];
  var aproom = ""
  var grade;
  while (tbody.querySelector("tr:nth-child(" + i + ")")) {
    var coursename = tbody.querySelector("tr:nth-child("+i+") > td:nth-child(1)").innerHTML;

    if (!(coursename === "CLASS DEANS' EMAIL" || coursename.includes("ASSEM")
        || coursename.includes("CHAPEL") || coursename.includes("CITIZENSHIP") || coursename.includes("EXTENDED"))) {
      coursename = coursename.substring(0, 10);
      console.log("---" + coursename + "---");

      var room = tbody.querySelector("tr:nth-child("+i+") > td:nth-child(4)").innerHTML;
      console.log(room)
      if (coursename.includes("AP-")) {
        aproom = room;
        grade = parseInt(coursename.substring(3))
        console.log("AP ROOM " + aproom);
        console.log("GRADE " + grade)

      } else {
        var days = [];
        var start, end;
        for (var j = 6; j < 12; j++) {
          var time = tbody.querySelector("tr:nth-child("+i+") > td:nth-child("+j+")").innerHTML;
          console.log(time);
          if (!(time === "&nbsp;")) {
            days.push(j - 6);
            var splitted = time.split("-");
            start = splitted[0]-1;
            end = splitted[1]-1;
          }
        }
        classList.push(new Class(coursename, room, days, undefined, start, end));
      }

    }
    i++;
  }
  var chapel, assembly, advisory, aptime;
  if (grade === 9) {
    chapel = 3;
    assembly = 1;
  } else if (grade === 10) {
    chapel = 1;
    assembly = 3;
  } else if (grade === 11) {
    assembly = 0;
    chapel = 2;
  } else if (grade === 12) {
    assembly = 2;
    chapel = 0;
  }

  if (grade < 11) {
    advisory = 5;
    aptime = 12;
  } else {
    advisory = 4;
    aptime = 16;
  }

  classList.push(new Class("CHAPEL", "CHAP", [chapel], "", aptime, aptime+3));
  classList.push(new Class("ASSEMBLY", "DILL", [assembly], "", aptime, aptime+3));
  classList.push(new Class("LONG AP", aproom, [advisory], "", aptime, aptime+3));
  console.log(classList);
  chrome.runtime.sendMessage({scraped: JSON.stringify(classList)});
}
