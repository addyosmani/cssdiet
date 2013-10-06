// Chrome automatically creates a background.html page for this to execute.
// This can access the inspected page via executeScript
// 
// Can use:
// chrome.tabs.*
// chrome.extension.*

chrome.extension.onConnect.addListener(function (port) {

    var extensionListener = function (message, sender, sendResponse) {

        customHandler(message, sender, sendResponse);

        if(message.tabId && message.content) {

                //Evaluate script in inspectedPage
                if(message.action === 'code') {
                    chrome.tabs.executeScript(message.tabId, {code: message.content});

                //Attach script to inspectedPage
                } else if(message.action === 'script') {
                    chrome.tabs.executeScript(message.tabId, {file: message.content});

                //Pass message to inspectedPage
                } else {
                    chrome.tabs.sendMessage(message.tabId, message, sendResponse);
                }

        // This accepts messages from the inspectedPage and 
        // sends them to the panel
        } else {
            port.postMessage(message);
        }
        sendResponse(message);
    }

    // Listens to messages sent from the panel
    chrome.extension.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
        chrome.extension.onMessage.removeListener(extensionListener);
    });

    // port.onMessage.addListener(function (message) {
    //     port.postMessage(message);
    // });

//////////////////////
chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab){

    alert('onupdated:' + tabId + changeInfo + tab);
    // the domain is not active and the tab have an url
    if( mDomain.isActive() && tab.url ){
        // the domain of the tab url is matching the one we observe
        if( tab.url.indexOf( mDomain.getName() ) !== -1 ){
            tabsID[tab.id] = true;
            getStylesheetFromPage( function(){
                chrome.tabs.executeScript(null, { file: "contentScript/observer.js" },function(){});
            });
            chrome.browserAction.setBadgeText({
                text: 'ON',
                tabId: tab.id
            });
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    return true;
});

//////////////////////

});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    return true;
});


// our command center
function customHandler(request, sender, sendResponse) {
    alert( 'Background receive command' + request.cmd );

    switch( request.cmd ){
        case 'returnStylesheetURL':
            downloadStylesheet( request.url );
            break;

        case 'returnInlineStyle':
            processInlineStyles( request.styles );
            break;

        case 'getUnusedSelector':
            sendResponse({ selectors: mDomain.getUnUsed() });
            break;

        case 'updateUsage':
            mDomain.updateUsage( request.selectors );
            if( timerID === null ){
                timerID = setTimeout( runTest, 5000 );
            }
            break;

        case 'runTest':
            runTest( true );
            break;

        case 'setDomain':
            setDomain( request.domain );
            break;

        case 'openResultsPage':
            chrome.tabs.create({
                url: chrome.extension.getURL('results/results.html')
            });
            break;

        case 'getStats':
            chrome.tabs.executeScript(request.tabId, {code: 'console.log(' + mDomain.getMap() + ')'});
            sendResponse( mDomain.getMap() );
            break;

        case 'getExtensionStatus':
            sendResponse({
                isActive: mDomain.isActive(),
                domainName: mDomain.getName()
            });
            break;

        case "stop":
            stop();
            break;
    }
};

///////////////////////////////////////////////////////////////////


//======================================================================================================================
//======================================================================================================================
// BACKGROUND FUNCTIONS
//======================================================================================================================
//======================================================================================================================


function log(msg){
    alert(msg);
    sendObjectToInspectedPage({action: "code", content: "console.log('" +msg+ " ')"});
}

/**
 * Get all the styling of the page
 * @param {Function} cb Callback to run when the style have been found
 */
function getStylesheetFromPage( cb ){
    log( 'Get style from the page' );
    chrome.tabs.executeScript(null, { file: "contentScript/getStyleSheetURL.js" }, cb);
    chrome.tabs.executeScript(null, { file: "contentScript/getInlineStyle.js" }, cb);
}


function setDomain( dom ){
    log( 'Set domain' + dom );
    mDomain.set( dom );
    tabsID = {};
    chrome.tabs.reload();
}

function stop(){
    log( 'stop running' );
    clearTimeout( timerID );
    timerID = null;
    for( var tabID in tabsID ){
        chrome.browserAction.setBadgeText({
            text: '',
            tabId: parseInt( tabID, 10 )
        });
    }
    tabsID = {};
    mDomain.stop();
}
function runTest(){
    log( 'runTest' );
    if( !mDomain.isActive() ){
        return;
    }
    chrome.tabs.executeScript(null, { file: "contentScript/testSelector.js" },function(){});
}

function processInlineStyles( arrText ){
    log('Found ', arrText.length, 'inline style');
    arrText.forEach( function( e ){
        postProcessStyleSheet( 'inline', e );
    });
}

/**
 * Download stylesheets
 *
 * @param {Array} urls
 */
function downloadStylesheet( urls ){
    log( 'Found ', urls.length, 'stylesheet to download' );
    urls.forEach( function( url ){

        // already fetched
        if( mDomain.isURLfound( url ) ){
            console.log( 'Stylesheets', url, ' already downloaded' );
            return;
        }

        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function(){
            if( ajax.readyState == 4 && ajax.status == 200 ){
                postProcessStyleSheet( url, ajax.responseText );
            }
        }

        // dont fetch that!
        var dataURl = "data:text/css";
        if( url.substr(0, dataURl.length) == dataURl ){
            return;
        }

        console.log( 'DL stylesheet ', url);
        ajax.open( 'GET', url, false);
        ajax.send( null );
        mDomain.addURL( url );
    });
}

/**
 * Handle a blob of css selector
 *
 * @param {string} fileSrc  Where this blob is coming from
 * @param {stirng} text     The css blob
 */
function postProcessStyleSheet( fileSrc, text ){
    log( 'Process stylesheet from ', fileSrc, 'length ', text.length );
    var selectors = extractSelector( text );
    mDomain.addSelectors( fileSrc, selectors );
}

/**
 * Extract the selector from a string
 *
 * @TODO ignore the :before, :hover, ...
 *
 * @param {String} text
 * @returns {Array}
 */
function extractSelector( text ){
    var foundSelectors = [],
        selectorGroup = [];

    // replace } with a macro, that we are going to split on
    text = text.replace( /}/g, "}@#@" );

    // empty content of curly bracket
    text = text.replace( /{[\s\S]+?}/mg , "");

    // remove comments
    text = text.replace( /\/\*[\s\S]+?\*\//mg , "");

    // now for selector, remove empty and explode on 'c'
    selectorGroup = text.split( "@#@" );

    selectorGroup.forEach(function( selectors ){
        if( !selectors.length ){
            return;
        }
        selectors.split( ',' ).forEach(function( selector ){
            selector = selector.trim();
            if( selector.length ){
                foundSelectors.push( selector );
            }
        });
    });

    // return an array of selectors
    return foundSelectors;
}




//////////////////////////


/**
 * Domain module
 *
 * We work one domain at a time so we need a "singleton" domain
 *
 * It store the list of selector we have found and there state
 */
var mDomain = (function(){
    /**
     * Name of the active domain, false if none
     *
     * @type {boolean|string}
     *
     * @private
     */
    var _isActive = false;

    /**
     * A map of the CSS selector. The key is the selector itseld
     * @type {{}}
     * @private
     */
    var _selectorMap = {};

    /**
     * A map of the stylesheet url that we have found on the domain
     *
     * @type {{}}
     * @private
     */
    var _stylesheetMap = {};

    //------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHOD
    //------------------------------------------------------------------------------------------------------------------
    /**
     * Clear the current state
     *
     * @private
     */
    function  _reset(){
        _selectorMap = {};
        _stylesheetMap = {};
    }

    //------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHOD
    //------------------------------------------------------------------------------------------------------------------
    return {
        /**
         * Add an aray of selector to the domain
         *
         * @param {String}  fileSrc     Where the selector are coming form
         * @param {ArraY}   arrSelector List of selector to add
         */
        addSelectors: function( fileSrc, arrSelector ){
            console.log( 'Add ' + arrSelector.length + ' selectors from ',fileSrc);
            var ct = 0;
            arrSelector.forEach( function( selector ) {
                if( typeof _selectorMap[selector] == 'undefined' ){
                    ct++;
                    _selectorMap[selector] = new Selector( selector, fileSrc );
                }
                else{
                    _selectorMap[selector].addDuplicate( fileSrc );
                }
            });
            console.log( fileSrc, 'contained ', arrSelector.length, ' with ', arrSelector.length-ct, 'duplicate' );
        },
        /**
         * Register a style url found for the domain
         * @param url
         */
        addURL: function( url ){
            _stylesheetMap[url] = true;
        },


        /**
         * Get the domain name that we are working on
         *
         * @returns {string}
         */
        getName: function(){
            return _isActive;
        },

        /**
         * Do we have an active domain?
         *
         * @returns {boolean}
         */
        isActive: function(){
            return _isActive === false ? false : true;
        },

        isURLfound: function( url ){
            return _stylesheetMap[url] === true;
        },

        /**
         * Return the map of selector
         *
         * @returns {{}}
         */
        getMap: function(){
            return _selectorMap;
        },

        /**
         * Return the list of unused selector
         *
         * @returns {Array}
         */
        getUnUsed: function(){
            var unused = [];
            for( var i in _selectorMap ){
                if( !_selectorMap[i].isUsed ){
                    unused.push( i );
                }
            }
            return unused;
        },

        /**
         * Set the active domain
         * @param {String} domain
         */
        set: function( domain ){
            _isActive = domain;
            _reset();
        },

        /**
         * Stop running
         */
        stop: function(){
            _isActive = false;
            _reset();
        },

        /**
         * Update the usage of the provided selector
         *
         * @param {Array} arrSelector
         */
        updateUsage: function( arrSelector ){
            console.log( arrSelector.length, ' additional selector were used' );
            arrSelector.forEach(function( selector ){
                _selectorMap[selector].setUsed();
            });
        }
    };
})();
