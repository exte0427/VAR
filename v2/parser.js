"use strict";
var parser;
(function (parser) {
    class virtualState {
        constructor(type_, value_) {
            this.type = type_;
            this.value = value_;
        }
    }
    parser.virtualState = virtualState;
    class virtualDom {
        constructor(type_, state_, children_, text_) {
            this.text = text_;
            this.type = type_;
            this.state = state_;
            this.children = children_;
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
    parser.parseElement = (element) => {
        const tagName = element.tagName;
        const attributes = parser.parseAttributes(element.attributes);
        const children = [];
        const text = element.innerHTML;
        for (let i = 0; i < element.children.length; i++)
            children.push(parser.parseElement(element.children[i]));
        return new virtualDom(tagName, attributes, children, text);
    };
    parser.createChild = (dom, target) => {
        const myNode = document.createElement(dom.type);
        //last dom
        if (dom.children.length === 0) {
            const textNode = document.createTextNode(dom.text);
            myNode.appendChild(textNode);
        }
        target.appendChild(myNode);
        dom.children.map(element => parser.createChild(element, target.children[0]));
    };
    parser.renderAttributes = (lastProps, changedProps, target) => {
        changedProps.forEach((element) => {
            const lastData = lastProps.find(prop => prop.type === element.type);
            const changedData = element;
            //add new data
            if (lastData == undefined)
                target.setAttribute(changedData.type, changedData.value);
            //change data
            else if (lastData.value !== changedData.value)
                target.setAttribute(changedData.type, changedData.value);
        });
        lastProps.forEach((element) => {
            const lastData = element;
            const changedData = changedProps.find(prop => prop.type === element.type);
            //delete data
            if (changedData == undefined)
                target.removeAttribute(lastData.type);
        });
    };
    parser.render = (lastDom, changedDom, target) => {
        //delete
        if (changedDom == undefined) {
            target.parentElement?.removeChild(target);
        }
        //add
        if (lastDom == undefined) {
            parser.createChild(changedDom, target.parentElement);
        }
        //same tag
        if (lastDom.type === changedDom.type) {
            parser.renderAttributes(lastDom.state, changedDom.state, target);
        }
        //different tag
        if (lastDom.type !== changedDom.type) {
            parser.createChild(changedDom, target.parentElement);
        }
    };
})(parser || (parser = {}));
