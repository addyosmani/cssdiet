// get all the unused selector and test the page to see if we can find some of them used in

var lastCall= 0;
var timer = 0;

function run(){
    console.log( 'Run' );
    chrome.extension.sendMessage({
        cmd: "getUnusedSelector"
    },function( response ){
        var used = [];
        response.selectors.forEach( function( selector ){
            try{// try catch for the weirdness
                var nodeList = document.querySelectorAll( selector );
                if( nodeList.length ){
                    used.push( selector );
                }
            }
            catch( e ){

            }
        });
        chrome.extension.sendMessage({
            cmd: "updateUsage",
            selectors: used
        });
    });
    timer = null;
}
var observer = new WebKitMutationObserver(function(mutations) {
    var t = +new Date();
    if( t - lastCall < 200 ){
        clearTimeout( timer );
    }
    lastCall = t;
    timer = setTimeout( run, 200 );
});
observer.observe(document, { subtree: true, childList: true });
//document.addEventListener("DOMNodeInserted", function(e) {
//    var t = +new Date();
//    if( t - lastCall < 200 ){
//        clearTimeout( timer );
//    }
//    lastCall = t;
//    timer = setTimeout( run, 200 );
//});
console.log(4);