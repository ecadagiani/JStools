
function removeHtmlTag (html) {
    return html.replace(/((<\w*\s*)[^<]*(\/?>))/g, "");
}

function replaceSpaceByNBS(str){
    return str.replace(/\s/g, String.fromCharCode(160));
}


function replaceNBSbySpace(str){
    for(let i = 0; i < str.length ; i++)
        if(str.charCodeAt(i) === 160)
            str = str.substr(0, i) + String.fromCharCode(32) + str.substr(i + 1);
    return str;
}

function getAllCharCode(str){
    let charCodes = [];
    for(let i = 0; i < str.length ; i++)
        charCodes.push(str.charCodeAt(i));
    return charCodes;
}

function setCaretInNode (node, offset) {
    let range = document.createRange();
    let sel = window.getSelection();
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

function setCaretPosInDiv(el, offset) {
    let cpt = 0;
    const textNodes = getAllTextNode(el);
    for(let i in textNodes){
        const textNode = textNodes[i];
        if(cpt + textNode.length >= offset){
            setCaretInNode(textNode, offset - cpt);
            return textNode;
        }
        cpt += textNode.length;
    }
    return null;
}

function setCaretPos(el, offset) {
    el.focus();
    el.setSelectionRange(offset, offset);
}

function getAllTextNode(el){
    let n, textNodeArray = [];
    let walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT,null,false);
    //eslint-disable-next-line no-cond-assign
    while( n = walk.nextNode() )
        textNodeArray.push(n);
    return textNodeArray;
}

function getTextContent(el){
    return el.textContent;
}

function getLastTextNode (node) {
    if (node.nodeType === Node.TEXT_NODE) return node;
    let children = node.childNodes;
    for (let i = children.length-1; i>=0; i--) {
        let textNode = getLastTextNode(children[i]);
        if (textNode !== null) return textNode;
    }
    return null;
}

function getCurrentRange() {
    let range, sel;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt) {
            if (sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
            }
        } else {
            // Old WebKit selection object has no getRangeAt, so create a range from other selection properties
            range = document.createRange();
            range.setStart(sel.anchorNode, sel.anchorOffset);
            range.setEnd(sel.focusNode, sel.focusOffset);

            // Handle the case when the selection was selected backwards (from the end to the start in the document)
            if (range.collapsed !== sel.isCollapsed) {
                range.setStart(sel.focusNode, sel.focusOffset);
                range.setEnd(sel.anchorNode, sel.anchorOffset);
            }
        }

        if (range) {
            return range;
        }
    }
}

function getCaretPositionInDiv(element) {
    if(window.getSelection().type === "None") return null;

    let range = window.getSelection().getRangeAt(0);
    let preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
}

function getCaretPosition(element) {
    // const selectionStart = element.selectionStart;
    const selectionEnd = element.selectionEnd;
    return selectionEnd;
}


function getSelectionPosition(element) {
    let start, end;
    let range = window.getSelection().getRangeAt(0);

    let preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    start = preCaretRange.toString().length;


    let postCaretRange = range.cloneRange();
    postCaretRange.selectNodeContents(element);
    postCaretRange.setEnd(range.endContainer, range.endOffset);
    end = postCaretRange.toString().length;

    return {start, end};
}


function getCaretNode() {
    return window.getSelection().focusNode;
}

function removeAllChild(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

const haveClipboardWritePermission = () => new Promise((resolve, reject) => {
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state === "granted" || result.state === "prompt")
            resolve();
        else
            reject();
    });
});

const copyToClipboard = (str) => new Promise((resolve, reject) => {
    navigator.clipboard.writeText(str).then(function() {
        resolve();
    }, function() {
        reject();
    });
});

function getTextSize(txt, fontStyle) {
    let element = document.createElement("canvas");
    let context = element.getContext("2d");
    context.font = fontStyle;
    return {
        "width": context.measureText(txt).width,
        "height": parseInt(context.font)
    };
}

function getEditableDivTextSize(element, options = {}) {
    const fontSize = window.getComputedStyle(element).getPropertyValue("font-size");
    const fontFamily = window.getComputedStyle(element).getPropertyValue("font-family");
    const fontStyle = fontSize + " " + fontFamily;
    let txt = getTextContent(element);
    if(options.beforeCaret){
        const caretPos = getCaretPositionInDiv(element);
        txt = txt.substr(0, caretPos);
    }
    return getTextSize(txt, fontStyle);
}

function getBestInputType(element, text = null) {
    const fontSize = window.getComputedStyle(element).getPropertyValue("font-size");
    const fontFamily = window.getComputedStyle(element).getPropertyValue("font-family");
    const textSize = getTextSize(text || element.value , fontSize + " " + fontFamily);
    const textWidth = textSize.width + 100;
    const innerWidth = parseInt(window.getComputedStyle(element).getPropertyValue("width"));

    return textWidth < innerWidth ? "input" : "textarea";
}

module.exports = {
    removeHtmlTag,
    replaceNBSbySpace,
    replaceSpaceByNBS,
    getAllCharCode,
    setCaretInNode,
    setCaretPosInDiv,
    setCaretPos,
    getLastTextNode,
    getCurrentRange,
    getCaretPosition,
    getSelectionPosition,
    getCaretNode,
    copyToClipboard,
    getEditableDivTextSize,
    removeAllChild,
    haveClipboardWritePermission,
    getBestInputType,
};
