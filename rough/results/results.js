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
    document.getElementById( "result" ).innerHTML =
        '<table>' +
            '<tbody>' +
                '<tr><td>Number</td><td>'+ nb +'</td></tr>' +
                '<tr><td>Used</td><td>'+ used +'</td></tr>' +
                '<tr><td>Unused</td><td>'+ (nb -used)+'</td></tr>' +
                '<tr><td>Duplicate</td><td>'+ duplicate +'</td></tr>' +
            '</tbody>' +
        '</table>'
    ;
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





