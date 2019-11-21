
function getPerformance(){
    try{
        if(global.hasOwnProperty("window")){
            const performance = window? window.performance || {} : {};
            performance.now = (function () {
                return performance.now ||
                    performance.mozNow ||
                    performance.msNow ||
                    performance.oNow ||
                    performance.webkitNow ||
                    function () {
                        return Date.now();
                    };
            })();
            return performance;
        }else{
            const { performance } = require("perf_hooks");
            return performance;
        }
    }catch(err){
        return {now: () => Date.now()};
    }
}


const performance = getPerformance();


let timeBalancer = {};
/**
 * Return a bool, if you call two time "performanceBalancer" without wait the delay between the two call, function return false
 * @param id
 * @param delay
 * @returns {boolean}
 */
export const performanceBalancer = ( id, delay ) => {
    if ( timeBalancer[id] === undefined ) {
        timeBalancer[id] = performance.now();
        return true;
    }

    const timeDiff = performance.now() - timeBalancer[id];
    if ( timeDiff > delay ) {
        timeBalancer[id] = performance.now();
        return true;
    }

    return false;
};


let handlerPreventOverload = [];
/**
 * Call the handler and wait the delay,
 * operation: if you call "preventFunctionOverload" with the same id as before,
 * and the delay was not finish, the new handler will not be called
 * @param handler
 * @param delay
 * @param id - used to find the previous handler or for clear the timeout
 * @return timeout instance
 */
export const preventFunctionOverload = ( handler, delay, id ) => {
    let index = handlerPreventOverload.findIndex( x => x.id === id );
    if ( index === -1 )
        index = handlerPreventOverload.push({ id, handler, timeout: null, semaphore: false }) - 1;

    if ( !handlerPreventOverload[index].semaphore ) {
        handlerPreventOverload[index].semaphore = true;
        if ( typeof handler === "function" ) handler();
        handlerPreventOverload[index].timeout = setTimeout(() => {
            handlerPreventOverload[index].semaphore = false;
        }, delay );
    }
};
export const clearFunctionPreventOverload = ( id ) => {
    const index = handlerPreventOverload.findIndex( x => x.id === id );
    if ( index >= 0 && handlerPreventOverload[index].timeout ) {
        clearTimeout( handlerPreventOverload[index].timeout );
        handlerPreventOverload.splice( index, 1 );
    }
};


let functionDelayingArray = [];
/**
 * Call the handler after a delay,
 * operation: if you call "handlerDelaying" with the same id as before,
 * and before that handler was called, the previous handler will not be called
 * and the next handler wait the delay or a new handlerDelaying before call
 * @param handler
 * @param delay
 * @param id the id used to find the previous handler or for clear the timeout
 * @return timeout instance
 */
export const functionDelaying = ( handler, delay, id ) => {
    let index = functionDelayingArray.findIndex( x => x.id === id );
    if ( index >= 0 )
        clearFunctionDelaying( id );

    functionDelayingArray.push({
        id,
        handler,
        timeout: setTimeout(() => {
            if ( typeof handler === "function" ) handler();
        }, delay )
    });
};
export const clearFunctionDelaying = ( id ) => {
    const index = functionDelayingArray.findIndex( x => x.id === id );
    if ( index >= 0 && functionDelayingArray[index].timeout ) {
        clearTimeout( functionDelayingArray[index].timeout );
        functionDelayingArray.splice( index, 1 );
    }
};


module.exports = {
    performance,
    getPerformance,
    performanceBalancer,
    clearFunctionPreventOverload,
    functionDelaying,
    clearFunctionDelaying,
};
