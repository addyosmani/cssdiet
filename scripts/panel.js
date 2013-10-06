// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

document.querySelector('#executescript').addEventListener('click', function() {
    sendObjectToInspectedPage({action: "code", content: "console.log('Inline script executed')"});
}, false);

document.querySelector('#insertscript').addEventListener('click', function() {
    sendObjectToInspectedPage({action: "script", content: "scripts/inserted-script.js"});
}, false);

document.querySelector('#insertmessagebutton').addEventListener('click', function() {
    sendObjectToInspectedPage({action: "code", content: "document.body.innerHTML='<button>Send message to DevTools</button>'"});
    sendObjectToInspectedPage({action: "script", content: "scripts/messageback-script.js"});
}, false);


/////////////////////////////

var btSetDomain = document.querySelector( "#setDomain" );
var btTest      = document.querySelector( "#test" );
var btResults   = document.querySelector( "#getResults" );
var btStop      = document.querySelector( "#stop" );
var domainInput = document.getElementById( "domain" );



btSetDomain.addEventListener('click', function() {
	sendObjectToInspectedPage({
		action: "code", 
		cmd: "setDomain",
		domain: domainInput.value,
	});
}, false);


btTest.addEventListener( "click", function(){
	sendObjectToInspectedPage({
		action: "code", 
		cmd: "runTest",
	}, false);
});

btResults.addEventListener( "click", function(){
	sendObjectToInspectedPage({
		action: "code", 
		cmd: "openResultsPage",
	}, false);
});

btStop.addEventListener( "click", function(){
	sendObjectToInspectedPage({
		action: "code", 
		cmd: "stop",
	}, false);
});


function hide( elem ){
//    elem.style.display = 'none';
    elem.parentNode.removeChild(elem);
}



