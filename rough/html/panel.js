
chrome.tabs.getSelected( null, function(tab) {
    var link = tab.url;
    var protocol = link.substr( 0, link.indexOf( "://" ) );
    var minusProto = link.substr( link.indexOf( "://" ) + 3 );
    if( link.indexOf( "/" ) !== -1 ){
        minusProto = minusProto.substr( 0, minusProto.indexOf( "/" ) );
    }
    if( minusProto.indexOf( "?" ) !== -1 ){
        minusProto = minusProto.substr( 0, minusProto.indexOf( "?" ) );
    }
    if( minusProto.indexOf( "#" ) !== -1 ){
        minusProto = minusProto.substr( 0, minusProto.indexOf( "#" ) );
    }
    document.getElementById( "domain" ).value = protocol + "://" + minusProto ;
});

var btSetDomain = document.getElementById( "setDomain" );
var btTest      = document.getElementById( "test" );
var btResults   = document.getElementById( "getResults" );
var btStop      = document.getElementById( "stop" );

chrome.extension.sendMessage({
    cmd: "getExtensionStatus"
}, function( results ){
    if( results.isActive ){
        hide( btSetDomain );
        hide( document.getElementById( 'setDomain_container' ) );

    }
    else{
        hide( document.getElementById( 'active_container' ) );
        hide( btTest );
        hide( btResults );
        hide( btStop );
    }

});


btSetDomain.addEventListener( "click", function(){
    _gaq.push(['_trackEvent', 'setDomain', 'clicked'] );
    chrome.extension.sendMessage({
        cmd: "setDomain",
        domain: document.getElementById( "domain" ).value
    });
});

btTest.addEventListener( "click", function(){
    _gaq.push(['_trackEvent', 'manualTest', 'clicked'] );
    chrome.extension.sendMessage({
        cmd: "runTest"
    });
});

btResults.addEventListener( "click", function(){
    _gaq.push(['_trackEvent', 'seeResults', 'clicked'] );
    chrome.extension.sendMessage({
        cmd: "openResultsPage"
    });
});

btStop.addEventListener( "click", function(){
    _gaq.push(['_trackEvent', 'stop', 'clicked'] );
    chrome.extension.sendMessage({
        cmd: "stop"
    });
});


function hide( elem ){
//    elem.style.display = 'none';
    elem.parentNode.removeChild(elem);

}

