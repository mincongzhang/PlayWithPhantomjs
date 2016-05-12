var steps=[];
var testindex = 0;
var loadInProgress = false;//This is set to true when a page is still loading

var fs = require('fs');

/*********SETTINGS*********************/
var webPage = require('webpage');
var page = webPage.create();
var favourites = [];
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.loadImages = true;
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
/*********SETTINGS END*****************/

console.log('All settings loaded, start with execution');
page.onConsoleMessage = function(msg) {
  console.log(msg);
};

/**********DEFINE STEPS THAT PHANTOM SHOULD DO***********************/
steps = [
  function() {
    console.log('Open Seamless home page');
    page.open("https://www.seamless.com/corporate/login/", function(status) {
      if (status !== 'success') {
        console.log('Unable to access network');
      } else {
        console.log('Visiting seamless');
      }
    });
  },

  function() {
    console.log('Populate and submit the login form');
    page.evaluate(function() {
      document.getElementById("username").value="MZhang384";
      document.getElementById("password").value="FactSet123";
      document.getElementById("submitLogin").click();
    });
  },

  function() {
    console.log("User login");
     var result = page.evaluate(function() {
      return document.querySelectorAll("html")[0].outerHTML;
    });
    var file_name = "seamless.html";
    fs.write(file_name,result,'w');
    console.log("Result write to "+file_name);
  },

  function() {
    console.log("Load History");
    page.open("https://www.seamless.com/OrderHistory.m?vendorType=1", function(status) {
      if (status !== 'success') {
        console.log('Unable to access network');
      } else {
        console.log('History loaded');
      }
    });
  },

  function() {
    console.log("Print History");
    var result = page.evaluate(function() {
      return document.querySelectorAll("html")[0].outerHTML;
    });
    //console.log(result);
    var file_name = "history.html";
    fs.write(file_name,result,'w');
    console.log("History write to "+file_name);
  },

  function() {
    console.log("Load Favourites");
    page.open("https://www.seamless.com/ViewFavorites.m", function(status) {
      if (status !== 'success') {
        console.log('Unable to access network');
      } else {
        console.log('Favourites loaded');
      }
    });
  },

  function() {
    console.log("Gathering Favourites");
    favourites = page.evaluate(function() {
      return [].map.call(document.querySelectorAll("h4.PrimaryLink a"), function(link) {
        var groups = /.*templateId=([^&]*).*/.exec(link.getAttribute("href"));
        return groups[1];
      });
    });
    console.log("len=" + favourites.length);
  },

  function() {
    console.log("Printing Favs len=" + favourites.length);
    console.log(favourites.join(","));
  },

  function() {
    console.log("Adding fav order");
    //console.log("https://www.seamless.com/MealsReorder.m?templateId="+favourites[0]+"&OrderType=F");
    page.open("https://www.seamless.com/MealsReorder.m?templateId="+favourites[2]+"&OrderType=F", function(status) {
      if (status !== 'success') {
        console.log('Unable to access network');
      } else {
        console.log('Fav order added');
      }
    });
  },
  function() {
    console.log("Placing order");
    var result = page.evaluate(function() {
      return document.querySelectorAll("html")[0].outerHTML;
    });
    console.log("Order placed");
  },

  function() {
    console.log("Orderding");
    page.open("https://www.seamless.com/Checkout.m", function(status) {
      if (status !== 'success') {
        console.log('Unable to access network');
      } else {
        console.log('Order submitted');
      }
    });
  },

  function() {
    console.log("Finish him!");
    var result = page.evaluate(function() {
      return document.querySelectorAll("html")[0].outerHTML;
    });
    console.log("KO");
  },
  function() {
    page.render("orderfinished.png");
  }

];
/**********END STEPS THAT FANTOM SHOULD DO***********************/

//Execute steps one by one
interval = setInterval(executeRequestsStepByStep, 1000);

function executeRequestsStepByStep() {
  if (loadInProgress == false && typeof steps[testindex] == "function") {
    console.log("Step " + (testindex + 1));
    steps[testindex]();
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    console.log("test complete!");
    phantom.exit();
  }
}

/**
 * These listeners are very important in order to phantom work properly. Using these listeners, we control loadInProgress marker which controls, weather a page is fully loaded.
 * Without this, we will get content of the page, even a page is not fully loaded.
 */
page.onLoadStarted = function() {
  loadInProgress = true;
  console.log('Loading started');
};
page.onLoadFinished = function() {
  loadInProgress = false;
  console.log('Loading finished');
};
page.onConsoleMessage = function(msg) {
  console.log(msg);
};
