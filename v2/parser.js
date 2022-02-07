"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = void 0;
var parser;
(function (parser) {
    class virtualState {
        constructor(attributeName_, value_) {
            this.attributeName = attributeName_;
            this.value = value_;
        }
    }
    parser.virtualState = virtualState;
    class virtualDom {
        constructor(tagName_, attributesList_, childList_, value_) {
            this.tagName = tagName_;
            this.attributesList = attributesList_;
            this.childList = childList_;
            this.value = value_;
        }
    }
    parser.virtualDom = virtualDom;
    parser.getHtml = () => {
        return document.querySelector(`html`);
    };
    parser.parseAttributes = (attributes) => {
        const returningStates = [];
        for (let i = 0; i < attributes.length; i++) {
            const nowAttribute = attributes[i];
            returningStates.push(new virtualState(nowAttribute.name, nowAttribute.value));
        }
        return returningStates;
    };
    parser.parse = (element) => {
        let tagName = ``;
        let attributes = [];
        let children = [];
        let text = ``;
        if (element instanceof HTMLElement || element instanceof Element) {
            tagName = element.tagName.toLowerCase();
            attributes = parser.parseAttributes(element.attributes);
            text = element.innerHTML;
            let nowNum = 0;
            for (let i = 0; i < element.childNodes.length; i++) {
                let parsedData = undefined;
                if (element.childNodes[i].nodeName == `#text`) {
                    if (element.childNodes[i].nodeValue.replaceAll(`\n`, ``).replaceAll(` `, ``) != ``) {
                        parsedData = parser.parse(element.childNodes[i]);
                    }
                }
                else {
                    parsedData = parser.parse(element.children[nowNum]);
                    nowNum++;
                }
                if (parsedData != undefined)
                    children.push(parsedData);
            }
        }
        else {
            tagName = `text`;
            text = element.nodeValue.replaceAll(`\n`, ``).replaceAll(` `, ``);
        }
        return new virtualDom(tagName, attributes, children, text);
    };
})(parser = exports.parser || (exports.parser = {}));
