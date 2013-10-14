/**
 * Handles iteration and display of the results for unused
 * CSS reporting.
 */

var g_results;
chrome.extension.sendMessage({
    cmd: "getStats"
}, function( results ){
    g_results  = results;
    var nb = 0, used = 0, duplicate = 0;
    for( var elem in results ){
        nb++;
        if( results[elem].isUsed ){
            used++;
        }
        if( results[elem].isDuplicate ){
            duplicate++;
        }
    }
    var pc_used   = ((used/nb)*100).toFixed(2) + '%';
    var pc_unused = (((nb-used)/nb)*100).toFixed(2) + '%';
    var pc_duplicate = ((duplicate/nb)*100).toFixed(2) + '%';

    var t = document.getElementById('selectors');
    t.model = {
        selectors: {
            count_selectors: nb,
            used_selectors: used + ' (' + pc_used +  ')',
            unused_selectors: (nb -used) + ' (' + pc_unused +  ')',
            duplicate_selectors: duplicate + ' (' + pc_duplicate +  ')'
        }
    };

    var c = document.getElementById('chart');
    c.model = {
      chartData: {
        data: nb + "," + used + "," + (nb-used) + "," + duplicate
      }
    };


    // Needed to detect model changes if Object.observe
    // is not available in the JS VM.
    Platform.performMicrotaskCheckpoint();

    // addition
    chrome.extension.sendMessage({
        cmd: "stop"
    });
});

document.getElementById( "show_unused" ).addEventListener( "click", function(){
    displayDetails( "unused" );
});

document.getElementById( "show_duplicate" ).addEventListener( "click", function(){
    displayDetails( "duplicate" );
});

document.getElementById('show_all' ).addEventListener( "click", function(){
    displayDetails( "all" );
});


// TODO: move all of the inline markup out of here, to templating.
function displayDetails( mode ){
    var html = "<tr><th>Selector</th><th>Used</th><th>Duplicate</th><th>Source</th></tr>";
    var orderedMap = [];
    for( var selectorID in g_results ){
        orderedMap.push( selectorID );
    }
    orderedMap.sort();
    for(var i= 0, l=orderedMap.length; i<l; i++ ){
        var selector = g_results[ orderedMap[i] ];

        if( mode == "unused" && selector.isUsed ){
            continue;
        }
        if( mode == "duplicate" && !selector.isDuplicate){
            continue;
        }

        html += "<tr class=" + (selector.isUsed ? 'green' : 'red' ) + ">" +
                    "<td>" + orderedMap[i] + "</td>" +
                    "<td>" + selector.isUsed + "</td>" +
                    "<td>" + selector.isDuplicate + "</td>" +
                    "<td><a href="+ selector.src +">"+ selector.src +"</a></td>" +
            "</tr>";
    }
    document.getElementById( "table" ).innerHTML = html;
}


