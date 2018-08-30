var tbody = document.getElementById("j_id_jsp_1908326749_1:listView:j_id_jsp_1167872640_21pc3:tbody_element");

// Class data structure
function Class(name, location, days, color, startTime, endTime /* Last occupied timeslot */) {
  this.name = name;
  this.location = location;
  this.days = days;
  this.color = color;
  this.startTime = startTime;
  this.endTime = endTime;
}

scrape();

// Main scraper function
function scrape() {
  var i = 1;
  var classList = [];
  var aproom = ""
  var grade;
  // Checks if there are more classes to scrape
  while (tbody.querySelector("tr:nth-child(" + i + ")")) {
    // Finds the name of the class
    var coursename = tbody.querySelector("tr:nth-child("+i+") > td:nth-child(1)").innerHTML.replace("&", " ");
    // Checks if the class should be included in the schedule
    if (!(coursename === "CLASS DEANS' EMAIL" || coursename.includes("ASSEM")
        || coursename.includes("CHAPEL") || coursename.includes("CITIZENSHIP") ||
        coursename.includes("EXTENDED") || coursename.charAt(0) === ".")) {

      // Clips the title because it sometimes repeats itself
      var title = coursename.substring(0, 3);
      if (coursename.lastIndexOf(title) > 0) {
        coursename = coursename.substring(0, coursename.lastIndexOf(title) - 1);
      }
      coursename = coursename.substring(0, 10);


      // Finds the room number
      var room = tbody.querySelector("tr:nth-child("+i+") > td:nth-child(4)").innerHTML;

      // Extracts the grade level
      if (coursename.includes("AP-")) {
        aproom = room;
        grade = parseInt(coursename.substring(3))

      } else {
        var days = [];
        var start, end;
        // Runs through each day column to find text
        for (var j = 6; j < 12; j++) {
          var time = tbody.querySelector("tr:nth-child("+i+") > td:nth-child("+j+")").innerHTML;
          if (!(time === "&nbsp;")) {
            days.push(j - 6);
            var splitted = time.split("-");
            start = splitted[0]-1;
            end = splitted[1]-1;
          }
        }
        // Adds found data to list
        classList.push(new Class(coursename, room, days, undefined, start, end));
      }

    }
    i++;
  }
  // Gets correct times for chapel, advisory, assembly based on grade level
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
  // Adds chapel, assembly, advisory to list of classes
  classList.push(new Class("CHAPEL", "CHAP", [chapel], "", aptime, aptime+3));
  classList.push(new Class("ASSEMBLY", "DILL", [assembly], "", aptime, aptime+3));
  classList.push(new Class("LONG AP", aproom, [advisory], "", aptime, aptime+3));
  // Returns the scraped data
  chrome.runtime.sendMessage({scraped: JSON.stringify(classList)});
}
