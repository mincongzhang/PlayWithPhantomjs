var steps=[];
var testindex = 0;
var loadInProgress = false;//This is set to true when a page is still loading

/*********SETTINGS*********************/
var webPage = require('webpage');
var page = webPage.create();
var fileSystem = require('fs');
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.loadImages = false;//Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
/*********SETTINGS END*****************/

console.log('All settings loaded, start with execution');
page.onConsoleMessage = function(msg) {
    console.log(msg);
};
/**********DEFINE STEPS THAT FANTOM SHOULD DO***********************/
steps = [

    function(){
        console.log('Open Seamless home page');
        page.open("https://www.seamless.com/corporate/login/", function(status){
		    if (status !== 'success') {
				console.log('Unable to access network');
			} else {
				console.log('Visiting seamless');
			}
		});
    },

    function(){
        console.log('Populate and submit the login form');
		page.evaluate(function(){
			document.getElementById("username").value="MZhang384";
            document.getElementById("password").value="FactSet123";
			document.getElementById("submitLogin").click();
		});
    },

    function(){
		console.log("Wait to login user");

		var result = page.evaluate(function() {
			return document.querySelectorAll("html")[0].outerHTML;
		});
		var file_name = "seamless.html";
        fileSystem.write(file_name,result,'w');
		console.log("Result write to "+file_name);
    },
	
    function(){
		console.log("Load Favorites");
		page.open("https://www.seamless.com/ViewFavorites.m", function(status){
		    if (status !== 'success') {
				console.log('Unable to access network');
			} else {
				console.log('Visiting Favorites');
			}
		});
    },
	
	function(){
		console.log("printing Favorites");
		var result = page.evaluate(function() {
			return document.querySelectorAll("html")[0].outerHTML;
		});
		var file_name = "seamless_fav.html";
        fileSystem.write(file_name,result,'w');
		console.log("Result write to "+file_name);
		
		page.render('fav.png');
    },
	
	function(){
		console.log("click Reorder");
		page.evaluate(function() {
			var elems = document.querySelectorAll("h4.PrimaryLink a");
			for(var i=0; i < elems.length; i++) {
				console.log(elems[i]);
			}

			/*
			var elems = document.getElementsByClassName("PrimaryLink");
			console.log("Get elems:"+elems.length);
			for(var i=0; i < elems.length; i++) {
				console.log(elems[i]);
				console.log(elems[i].textContent);
				console.log(elems[i].childNodes[0]); //<a> is a child
			}
			*/
		});
    },
	
];
/**********END STEPS THAT FANTOM SHOULD DO***********************/

//Execute steps one by one
interval = setInterval(executeRequestsStepByStep,100);

function executeRequestsStepByStep(){
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
