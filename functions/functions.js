const { URL } = require( "url" );
const {
    transform, isEqual, concat, isObject, get
} = require( "lodash" );


function makeTree( obj, key, acc = [] ) {
    const keyArray = Object.keys( obj );
    for ( let i = 0; i < keyArray.length; i++ ) {
        const itKey = keyArray[i];
        if ( itKey === key ) {
            acc.push( itKey );
            return acc;
        }

        if ( obj[itKey] && typeof obj[itKey] === "object" ) {
            const foo = makeTree( obj[itKey], key, concat( acc, [itKey] ) );
            if ( Array.isArray( foo ) )
                return foo;
        }
    }
    return null;
}


function difference( object, base ) {
    function changes( object, base ) {
        return transform( object, function ( result, value, key ) {
            if ( !isEqual( value, base[key] ) ) {
                result[key] = (isObject( value ) && isObject( base[key] )) ? changes( value, base[key] ) : value;
            }
        } );
    }

    return changes( object, base );
}


function getPathsKey( obj, keySearch ) {
    let paths = [];
    let nodes = [{
        obj,
        path: [],
    }];
    while ( nodes.length > 0 ) {
        let n = nodes.pop();
        Object.keys( n.obj ).forEach( k => {
            let path = n.path.concat( k );
            if ( typeof n.obj[k] === "object" ) {

                if ( k === keySearch ) {
                    paths.push( path.join( "." ) );
                }
                nodes.unshift( {
                    obj: n.obj[k],
                    path: path
                } );
            } else {
                if ( k === keySearch ) {
                    paths.push( path.join( "." ) );
                }
            }
        } );
    }
    return paths;
}


/**
 * valuesInDeep
 * Find all values in object, and return then in array
 * @param {Object} object - Object to iterate
 * @param {function=} iterate - A function to know if a value must or not be added to the array
 * @return {array}
 */
function valuesInDeep( object, iterate = null ) {
    if ( typeof object !== "object" ) return;

    let res = [];
    Object.keys( object ).forEach( key => {
        if ( typeof object[key] === "object" )
            res = res.concat( valuesInDeep( object[key], iterate ) );

        if ( (typeof iterate === "function" && iterate( object[key], key )) || !iterate )
            res.push( object[key] );
    } );
    return res;
}


function wait( ms ) {
    return new Promise( r => setTimeout( r, ms ) );
}


function getRndInteger( min, max ) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}


function getUrlParts( url ) {
    let parsedUrl;
    try {
        parsedUrl = new URL( url );
    } catch ( err ) {
        return null;
    }

    const domainResReg = (/[\w-]+\.(\w+|(co|com)\.\w+)$/gm).exec( parsedUrl.hostname );
    const extensionRegRes = (/\.(\w+$)/gm).exec( parsedUrl.pathname );
    const uriSchemeRegRes = (/[\w-]+/gm).exec( parsedUrl.protocol );

    return {
        uriScheme: get( uriSchemeRegRes, "[0]" ),
        extension: get( extensionRegRes, "[1]" ),
        domain: get( domainResReg, "[0]" ),
        pathname: parsedUrl.pathname,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
    };
}

/**
 * return an array randomly completed with values.
 * the result array have the length of numberOfDraw or values.length
 * @param values
 * @param numberOfDraw
 * @return {[]}
 */
function drawWithoutDuplicate( values, numberOfDraw ) {
    const res = [];
    const arrayToDraw = Array.from( values );
    for ( let i = 0; i < numberOfDraw && arrayToDraw.length > 0; i++ ) {
        const index = getRndInteger( 0, arrayToDraw.length - 1 );
        res[i] = arrayToDraw[index];
        arrayToDraw.splice( index, 1 );
    }
    return res;
}

/**
 * Run updater on all key of object, who is not a object or an array
 * @param object
 * @param updater
 * @return {Object}
 */
function updateValuesInDeep( object, updater = null ) {
    if ( typeof object !== "object" ) return object;

    let obj = {};
    Object.keys( object ).forEach( key => {
        if ( Array.isArray( object[key] ) ) {
            obj[key] = [];
            object[key].forEach( ( item, index ) => {
                obj[key].push( updateValuesInDeep( item, updater ) );
            } );
        } else if ( typeof object[key] === "object" )
            obj[key] = updateValuesInDeep( object[key], updater );
        else if ( typeof updater === "function" )
            obj[key] = updater( object[key] );
        else
            obj[key] = object[key];
    } );
    return obj;
}

/**
 * order object key (with js sort function)
 * @param obj
 * @param sortFunction
 * @return {Object}
 */
function sortObjectByKey( obj, sortFunction = undefined ) {
    const ordered = {};
    Object.keys( obj )
        .sort( sortFunction )
        .forEach( key => {
            ordered[key] = obj[key];
        } );
    return ordered;
}

/**
 * Get date with nbDays added
 * @param nbDays
 * @return {Date}
 */
export function getDateWithDay( nbDays ) {
    const date = new Date();
    date.setDate( new Date().getDate() + nbDays );
    return date;
}

/**
 * Combine array of string with all possibility
 * @param {Array<string>} data - all string
 * @param {function} onCombine - function call on each new combine
 * @return {[]}
 */
function combinations( data, onCombine ) {
    const result = [];
    const fn = function ( prefix, data ) {
        for ( let i = 0; i < data.length; i++ ) {
            const newPrefix = prefix + data[i];
            const newData = Array.from( data );
            newData.splice( i, 1 );
            if ( !result.includes( newPrefix ) ) {
                result.push( newPrefix );
                if ( typeof onCombine === "function" )
                    onCombine( newPrefix );
            }
            fn( newPrefix, newData );
        }
    };
    fn( "", data );
    return result;
}


module.exports = {
    makeTree,
    difference,
    getPathsKey,
    valuesInDeep,
    wait,
    getRndInteger,
    getUrlParts,
    drawWithoutDuplicate,
    updateValuesInDeep,
    sortObjectByKey,
    getDateWithDay,
    combinations
};
