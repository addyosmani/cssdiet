// this script is finding every url for external stylesheet

var links = document.getElementsByTagName('link');
links = Array.prototype.slice.call( links );// nodelist hack to get foreach

var stylesheetURL = [];
links.forEach( function( link ){
    if( link.rel == 'stylesheet' || link.type == 'text/css' ){
        if( typeof link.href != 'undefined' ){
            stylesheetURL.push( link.href );
        }
    }
});

chrome.extension.sendMessage({
    cmd: "returnStylesheetURL",
    url: stylesheetURL
});