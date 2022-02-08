"use strict";
var Var;
(function (Var) {
    Var.make = (key, data) => {
        const newVar = new Var.varForm(key, data);
        //set data
        VarInternal.data.varList.push(newVar);
    };
    class varForm {
        constructor(key_, data_) {
            this.data = data_;
            this.key = key_;
        }
        getData() {
            if (this.data instanceof Function) {
                return this.data().toString();
            }
            else
                return this.data.toString();
        }
    }
    Var.varForm = varForm;
})(Var || (Var = {}));
var VarInternal;
(function (VarInternal) {
    let data;
    (function (data) {
        data.varList = [];
    })(data = VarInternal.data || (VarInternal.data = {}));
    let parser;
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
        parser.parseText = (text) => {
            let startNum = -1;
            let endNum = -1;
            for (let i = 0; i < text.length; i++) {
                const nowChar = text[i];
                if (nowChar !== `\n` && nowChar !== ` `) {
                    startNum = i;
                    break;
                }
            }
            for (let i = text.length - 1; i >= 0; i--) {
                const nowChar = text[i];
                if (nowChar !== `\n` && nowChar !== ` `) {
                    endNum = i;
                    break;
                }
            }
            if (startNum === -1 || endNum == -1)
                return ``;
            return text.slice(startNum, endNum + 1);
        };
        parser.texToDom = (text) => {
            return new virtualDom(`text`, [], [], text);
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
                        if (parser.parseText(element.childNodes[i].nodeValue) !== ``) {
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
            else if (element != undefined) {
                tagName = `text`;
                text = parser.parseText(element.nodeValue);
            }
            return new virtualDom(tagName, attributes, children, text);
        };
    })(parser = VarInternal.parser || (VarInternal.parser = {}));
    let main;
    (function (main) {
        main.lastData = undefined;
        main.nowData = undefined;
        main.init = () => {
            main.firstData = parser.parse(parser.getHtml());
            main.nowData = main.firstData;
            main.lastData = main.firstData;
        };
        main.detectStart = (time) => {
            setInterval(() => {
                //set now data
                main.nowData = detecter.subVar(main.firstData);
                //detect start
                detecter.detect(parser.getHtml(), main.lastData, main.nowData);
                //set last data
                main.lastData = main.firstData;
            }, time);
        };
    })(main = VarInternal.main || (VarInternal.main = {}));
    let changer;
    (function (changer) {
        changer.make = (data) => {
            const myDom = document.createElement(data.tagName);
            data.attributesList.forEach(element => {
                myDom.setAttribute(element.attributeName, element.value);
            });
            data.childList.forEach(element => {
                myDom.append(changer.make(element));
            });
            return myDom;
        };
        changer.add = (parent, data) => {
            parent.append(changer.make(data));
        };
        changer.del = (data) => {
            changer.make(data).remove();
        };
        changer.change = (parent, oldData, newData) => {
            changer.del(oldData);
            changer.add(parent, newData);
        };
        changer.attrChange = (target, lastAttr, nowAttr) => {
            nowAttr.forEach((element, i) => {
                var _a;
                if (lastAttr.find(e => e.attributeName === element.attributeName) == undefined)
                    target.setAttribute(element.attributeName, element.value);
                if (element.value !== ((_a = lastAttr.find(e => e.attributeName === element.attributeName)) === null || _a === void 0 ? void 0 : _a.value))
                    target.setAttribute(element.attributeName, element.value);
            });
        };
    })(changer = VarInternal.changer || (VarInternal.changer = {}));
    let detecter;
    (function (detecter) {
        detecter.subVar = (target) => {
            // if variable dom
            const nowData = data.varList.find(element => element.key === target.tagName);
            if (nowData != undefined) {
                const data = nowData.getData();
                if (data instanceof parser.virtualDom)
                    return detecter.subVar(data);
                else
                    return parser.texToDom(data);
            }
            // if last dom
            else if (target.childList.length == 0)
                return target;
            let newValue = target;
            //else discover children
            target.childList.forEach((element, index) => {
                target.childList[index] = detecter.subVar(element);
            });
            return newValue;
        };
        detecter.detect = (target, lastData, nowData) => {
            if (lastData === undefined)
                changer.add(target, nowData);
            else if (nowData === undefined)
                changer.del(lastData);
            else if (lastData.tagName !== nowData.tagName)
                changer.change(target, lastData, nowData);
            else if (lastData.attributesList !== nowData.attributesList)
                changer.attrChange(target, lastData.attributesList, nowData.attributesList);
            const maxLength = Math.max(lastData === null || lastData === void 0 ? void 0 : lastData.childList.length, nowData === null || nowData === void 0 ? void 0 : nowData.childList.length);
            for (let i = 0; i < maxLength; i++) {
                detecter.detect(target.childNodes[i], lastData === null || lastData === void 0 ? void 0 : lastData.childList[i], nowData === null || nowData === void 0 ? void 0 : nowData.childList[i]);
            }
        };
    })(detecter = VarInternal.detecter || (VarInternal.detecter = {}));
})(VarInternal || (VarInternal = {}));
VarInternal.main.init();
VarInternal.main.detectStart(10);
