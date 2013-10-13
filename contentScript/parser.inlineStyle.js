/**
 * Handles inline <style> tags
 */

/**
 * Find all style tags in the DOM, returning a list of them.
 * @returns {NodeList}
 */
function getStyleTags(){
    var styles = document.getElementsByTagName( 'style' );
    styles = Array.prototype.slice.call( styles );
    return styles;
}

var final = [];
var styleTags = getStyleTags();

styleTags.forEach( function( node ){
    final.push( node.innerHTML );
});

chrome.extension.sendMessage({
    cmd: "returnInlineStyle",
    styles: final
});