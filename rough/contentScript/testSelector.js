// get all the unused selector and test the page to see if we can find some of them used in

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

