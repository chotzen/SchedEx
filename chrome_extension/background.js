
var currentURL = "";

function updateUrl() {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    if (tab) {
      var url = tab.url;
      console.assert(typeof url == 'string', 'tab.url should be a string');
      currentURL = url;
    }
  });
}

var scraped = false;

setInterval(function() {
  updateUrl();
  if (currentURL.includes("https://mybackpack.punahou.edu/SeniorApps/facelets/home/home.xhtml")) {
    console.log("Updating")
    chrome.tabs.update({
      url: "https://mybackpack.punahou.edu/SeniorApps/studentParent/schedule.faces?selectedMenuId=true"
    })
  }
  if (currentURL === "https://mybackpack.punahou.edu/SeniorApps/studentParent/schedule.faces?selectedMenuId=true" && !scraped) {
    chrome.runtime.sendMessage({scrape: true});
    scraped = true;
  }
  console.log("CurrentURL " + currentURL);
}, 200)
