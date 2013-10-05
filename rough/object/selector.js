/**
 * A JS representation of a CSS selector
 * @param {string} str The selector itself
 * @param {String} fileSrc Where this selector has been found
 * @returns {{name: *, src: *, isUsed: boolean, isDuplicate: boolean, addDuplicate: Function, setUsed: Function}}
 * @constructor
 */
function Selector( str, fileSrc ){
    var _duplicate = false,
        _src = fileSrc;

    return {
        name: str,
        src: fileSrc,
        isUsed: false,
        isDuplicate: false,

        addDuplicate: function( fileSrc ){
            if( fileSrc == 'inline' ){
                return;
            }
            if( _duplicate === false ){
                _duplicate = [ _src ];
                this.isDuplicate = true;
            }
            _duplicate.push( fileSrc );
        },
        setUsed: function(){
            this.isUsed = true
        }
    };
}