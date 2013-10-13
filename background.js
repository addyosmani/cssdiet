var timerID = null;


/**
 * Listen for updates in tab navigation between domains.
 * This allows us to appropriately handle getting assets
 * like stylesheets from the page.
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){

    // the domain is not active and the tab has a url
    if( mDomain.isActive() && tab.url ){
        // and the domain of the tab url is matching the one we're observing
        if( tab.url.indexOf( mDomain.getName() ) !== -1 ){
            tabsID[tab.id] = true;

            getStylesheetFromPage( function(){
                chrome.tabs.executeScript(null, {
                    file: "contentScript/observer.js" },function(){});
            });

            chrome.browserAction.setBadgeText({
                text: 'ON',
                tabId: tab.id
            });
        }
    }
});

/**
 * Handle commands broadcast between components.
 * TODO: Refactor all of this. Prefer to avoid switch statements.
 */
chrome.extension.onMessage.addListener( function(request, sender, sendResponse) {
    console.log( 'Background receive command', request.cmd );
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
});
