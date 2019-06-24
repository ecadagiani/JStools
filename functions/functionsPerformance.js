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
if(window) window.performance = performance;

let timeBalancer = {};
/**
 * performanceBalancer
 * Return a bool, if you call two time "performanceBalancer" without wait the delay between the two call, function return false
 * @param id
 * @param delay
 * @returns {boolean}
 */
function performanceBalancer(id, delay) {
    if(timeBalancer[id] === undefined){
        timeBalancer[id] = performance.now();
        return true;
    }

    const timeDiff = performance.now() - timeBalancer[id];
    if(timeDiff > delay){
        timeBalancer[id] = performance.now();
        return true;
    }

    return false;
}

/**
 * setHandlerDelaying
 * Call the handler after a delay,
 * operation: if you call "handlerDelaying" with the same handler as before, and before that handler was called, the new handler will not be called
 * @param handler
 * @param delay
 * @param id the id used to find the previous handler or for clear the timeout
 * @return timeout instance
 */
let handlerDelayingArray = [];
function setHandlerDelaying (handler, delay, id) {
    let index = handlerDelayingArray.findIndex(x => x.id === id);
    if(index < 0)
        index = handlerDelayingArray.push({id, handler, semaphore: false}) -1;

    if(!handlerDelayingArray[index].semaphore){
        handlerDelayingArray[index].semaphore = true;
        handlerDelayingArray[index].timeout = setTimeout(() => {
            handlerDelayingArray[index].semaphore = false;
            if(typeof handler === "function") handler();
        }, delay);
    }
}
function clearHandlerDelaying(id) {
    const index = handlerDelayingArray.findIndex(x => x.id === id);
    if(index >= 0 && handlerDelayingArray[index].timeout ){
        clearTimeout(handlerDelayingArray[index].timeout);
        handlerDelayingArray.splice(index, 1);
    }
}

module.exports = {
    performance,
    performanceBalancer,
    setHandlerDelaying,
    clearHandlerDelaying,
};
