chrome.devtools.panels.create("CSSDiet","chrome.png", "html/panel.html", function(panel) { 
	console.log("Hello from callback"); 
});

chrome.devtools.panels.elements.onSelectionChanged.addListener(function(){
	console.log('something happened');
});

var port = chrome.extension.connect({
        name: "Sample Communication"
});
    port.postMessage("Request Tab Data");
    port.onMessage.addListener(function (msg) {
        console.log("Tab Data recieved is  " + msg);
});