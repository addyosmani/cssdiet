/**
 * Find every URL for an external stylesheet
 */

/**
 * Find all <link> tags in the current document, returning a list of them
 * @returns {NodeList}
 */
function getLinkTags(){
    var links = document.getElementsByTagName('link');
    links = Array.prototype.slice.call( links );
    return links;
}

var stylesheetURL = [];
var linkTags = getLinkTags();

linkTags.forEach( function( link ){
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