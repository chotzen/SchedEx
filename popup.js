
// Current URL
var currentURL = "";

// Popup elements that are important
var button = document.getElementById('button');
var text = document.getElementById('text');

button.addEventListener('click', function() {
  update();
})

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
  });
}

window.onload = function() {
  updateUrl();
  setTimeout(update, 100);
}


chrome.webNavigation.onCompleted.addListener(update, {
  url: [{
    hostContains: 'mybackpack.punahou.edu'
  }]
})

function update() {
  console.log("update")
  // If not on MyBackpack, go to MyBackpack
  if (!(currentURL.includes("https://mybackpack.punahou.edu"))) {
    goto("https://mybackpack.punahou.edu");
  } else {
    // If not logged in yet
    if (currentURL.includes("loginCenter")) {
      updateMessage("Please log in with the proper information. This is not tracked.");
    } else if (currentURL.includes("SeniorApps/facelets/home/home.xhtml")) {}
  }
}

function goto(URL) {
  chrome.tabs.update({
     url: URL
   });
  setTimeout(function() {
    updateUrl()
  }, 30);
}

function updateMessage(message) {
  text.innerHTML = message;
}

setInterval(updateUrl, 500);
