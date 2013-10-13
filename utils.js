

/**
 * Set the domain to be parsed for styles
 * Reload the current tab once the domain has been set
 * @param domainUrl
 */
function setDomain( domainUrl ){
    console.log( 'Set domain', domainUrl );
    mDomain.set( domainUrl );
    tabsID = {};
    chrome.tabs.reload();
}


/**
 * Get all the styling info from the current page
 * @param {Function} cb Callback to run when the style have been found
 */
function getStylesheetFromPage( cb ){
    chrome.tabs.executeScript(null, { file: "contentScript/parser.Stylesheet.js" }, cb);
    chrome.tabs.executeScript(null, { file: "contentScript/parser.inlineStyle.js" }, cb);
}

/**
 * Stop running the current session
 * Clear timers and change the extension badge
 * to reflect this accordingly.
 */
function stop(){
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

/**
 * Run the test against found selectors
 */
function runTest(){
    if( !mDomain.isActive() ){
        return;
    }
    chrome.tabs.executeScript(null, { file: "contentScript/testSelector.js" },function(){});
}

/**
 * Process any inline styles found, adding them to the list
 * of known selectors.
 * @param arrText
 */
function processInlineStyles( arrText ){
    // console.log('Found ', arrText.length, 'inline style');
    arrText.forEach( function( e ){
        postProcessStyleSheet( 'inline', e );
    });
}

/**
 * Download discovered stylesheets, processing using
 * some XHR calls.
 * @param {Array} urls
 */
function downloadStylesheet( urls ){
    // console.log( 'Found ', urls.length, 'stylesheet to download' );
    urls.forEach( function( url ){

        // already fetched
        if( mDomain.isURLfound( url ) ){
            // console.log( 'Stylesheets', url, ' already downloaded' );
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
 * Handle a blob for a CSS selector
 *
 * @param {string} fileSrc  Where this blob is coming from
 * @param {stirng} text     The css blob
 */
function postProcessStyleSheet( fileSrc, text ){
    console.log( 'Process stylesheet from ', fileSrc, 'length ', text.length );
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


/**
 * Analytics tracking.
 * @type {_gaq|*|Array}
 * @private
 */
var _gaq = _gaq || [];
var accID = 000000;
_gaq.push(['_setAccount', accID]);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

