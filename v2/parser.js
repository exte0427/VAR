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
        constructor(type_, state_, children_) {
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
        for (let i = 0; i < element.children.length; i++)
            children.push(parser.parseElement(element.children[i]));
        return new virtualDom(tagName, attributes, children);
    };
})(parser || (parser = {}));
