const {
    transform, isEqual, concat, isObject
} = require("lodash");


function makeTree(obj, key, acc = []){
    const keyArray = Object.keys(obj);
    for (let i = 0; i < keyArray.length; i++) {
        const itKey = keyArray[i];
        if (itKey === key) {
            acc.push(itKey);
            return acc;
        }

        if (obj[itKey] && typeof obj[itKey] === "object") {
            const foo = makeTree(obj[itKey], key, concat(acc, [itKey]));
            if (Array.isArray(foo))
                return foo;
        }
    }
    return null;
}



function difference(object, base) {
    function changes(object, base) {
        return transform(object, function (result, value, key) {
            if (!isEqual(value, base[key])) {
                result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }

    return changes(object, base);
}


function getPathsKey(obj, keySearch) {
    let paths = [];
    let nodes = [{
        obj,
        path: [],
    }];
    while (nodes.length > 0) {
        let n = nodes.pop();
        Object.keys(n.obj).forEach(k => {
            let path = n.path.concat(k);
            if (typeof n.obj[k] === "object") {

                if (k === keySearch) {
                    paths.push(path.join("."));
                }
                nodes.unshift({
                    obj: n.obj[k],
                    path: path
                });
            } else {
                if (k === keySearch) {
                    paths.push(path.join("."));
                }
            }
        });
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
function valuesInDeep(object, iterate = null){
    if(typeof object !== "object") return;

    let res = [];
    Object.keys(object).forEach(key => {
        if(typeof object[key] === "object")
            res = res.concat( valuesInDeep(object[key], iterate) );

        if((typeof iterate === "function" && iterate(object[key], key)) || !iterate)
            res.push(object[key]);
    });
    return res;
}

function wait(ms){
    return new Promise((r, j)=>setTimeout(r, ms));
}



module.exports = {
    makeTree,
    difference,
    getPathsKey,
    valuesInDeep,
    wait
};
