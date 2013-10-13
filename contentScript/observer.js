
var lastCall= 0;
var timer = 0;

/**
 * Get the unused selectors
 */
function run() {
    console.log('Run');
    chrome.extension.sendMessage({
        cmd: "getUnusedSelector"
    }, function (response) {
        var used = [];
        response.selectors.forEach(function (selector) {
            try {
                // try catch for the weirdness
                var nodeList = document.querySelectorAll(selector);
                if (nodeList.length) {
                    used.push(selector);
                }
            }
            catch (e) {

            }
        });
        chrome.extension.sendMessage({
            cmd: "updateUsage",
            selectors: used
        });
    });
    timer = null;
}


var observer = new WebKitMutationObserver(function (mutations) {
    var t = +new Date();
    if (t - lastCall < 200) {
        clearTimeout(timer);
    }
    lastCall = t;
    timer = setTimeout(run, 200);
});

observer.observe(document, { subtree: true, childList: true });
