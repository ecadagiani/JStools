const {
    orderBy,
    filter,
    keys,
    pickBy,
} = require("lodash");

/**
 * FetchList
 * fetch a list with page, pageSize, sorted, filtered
 * @param {array} list
 * @param {*} params
 */
function fetchList(list, {
    pageSize,
    page,
    sorted,
    filtered
}){
    let newList = list.slice(pageSize * page, pageSize * (page + 1));
    newList = orderBy(
        newList,
        sorted.map(({
            id
        }) => id),
        sorted.map(({
            desc
        }) => desc ? "desc" : "asc")
    );

    newList = filter(newList, item => {
        return filtered.reduce((res, filter) =>
            res && item[filter.id].toString().toLowerCase().indexOf(filter.value.toLowerCase()) === 0, true);
    });
    return newList;
};




function getActionsToUpdateArray (prevArray, newArray){
    const getActionsToUpdateArray2 = (prevArray, newArray, actions = []) => {
        const makeAction = (type, index, item) => ({
            type,
            index,
            item
        });

        //search for item to remove
        //find index of an item in prevArray, who is not in newArray
        const indexToRemove = prevArray.findIndex(
            prevItem => !newArray.find(
                newItem =>
                isEqual(prevItem, newItem) ||
                ("id" in newItem && "id" in prevItem && prevItem.id === newItem.id)
            )
        );
        if (indexToRemove >= 0) {
            const newPrevArray = Array.from(prevArray);
            newPrevArray.splice(indexToRemove, 1);
            actions.push(makeAction("remove", indexToRemove, null));
            return getActionsToUpdateArray2(newPrevArray, newArray, actions);
        }

        //search for item to add
        //find index of an item in newArray, who is not in prevArray
        const indexToAdd = newArray.findIndex(
            newItem => !prevArray.find(
                prevItem =>
                isEqual(prevItem, newItem) ||
                ("id" in newItem && "id" in prevItem && prevItem.id === newItem.id)
            )
        );
        if (indexToAdd >= 0) {
            const newPrevArray = Array.from(prevArray);
            newPrevArray.splice(indexToRemove, 0, newArray[indexToAdd]);
            actions.push(makeAction("add", indexToAdd, newArray[indexToAdd]));
            return getActionsToUpdateArray2(newPrevArray, newArray, actions);
        }

        return actions;
    };

    getActionsToUpdateArray2(prevArray, newArray)
}



const getAllIndex = (array, predicate) => keys(pickBy(array, predicate));

/**
 * Update all matched item (with predicate) of array with your item, warning mutate array
 * @param itemToReplace
 * @param array
 * @param predicate
 * @param condition
 * @return {any[]} return array
 */
function updateOrPushItemInArray (itemToReplace, array, predicate , condition = true, options = {}){
    const indexArray = getAllIndex(array, predicate);
    if(indexArray.length <= 0)
        if(condition) array.push(itemToReplace);

    if(options.merge){
        array[indexArray] = {
            ...array[indexArray],
            ...itemToReplace,
        };
    }else{
        indexArray.forEach(index => {
            array.splice(index, 1, itemToReplace);
        });
    }

    return array;
}


/**
 * Update all matched item (with predicate) of array with your item, warning mutate array
 * @param itemToReplace
 * @param array
 * @param predicate
 * @param condition
 * @return {any[]} return array
 */
function updateItemInArray (itemToReplace, array, predicate , condition = true){
    const indexArray = getAllIndex(array, predicate);
    if(condition && indexArray.length >= 0){
        indexArray.forEach(index => {
            array.splice(index, 1, itemToReplace);
        });
    }
    return array;
}

module.exports = {
    fetchList,
    getActionsToUpdateArray,
    updateOrPushItemInArray,
    updateItemInArray,
};
