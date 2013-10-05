// this content script is returning the content of every inline <style> tag found

var final = [];
var styleTAGs = document.getElementsByTagName( 'style' );
styleTAGs = Array.prototype.slice.call( styleTAGs );// nodelist hack to get foreach

styleTAGs.forEach( function( node ){
    final.push( node.innerHTML );
});

chrome.extension.sendMessage({
    cmd: "returnInlineStyle",
    styles: final
});