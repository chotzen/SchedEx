scrape();

var currentURL = "";

function updateUrl() {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    currentURL = url;
    if (currentURL === "https://mybackpack.punahou.edu/SeniorApps/studentParent/schedule.faces?selectedMenuId=true") {
      console.log("Scraping...")
    }
  });
}

setTimeout(updateUrl, 50);

function scrape() {
  chrome.tabs.executeScript({
    file: "scrape.js"
  })
}
