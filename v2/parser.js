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
            let returnData;
            if (this.data instanceof Function)
                returnData = this.data();
            else
                returnData = this.data;
            return returnData;
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
                        if (parser.parseText(element.childNodes[i].nodeValue) !== ``)
                            parsedData = parser.parse(element.childNodes[i]);
                        else
                            parsedData = new virtualDom(`text`, [], [], ``);
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
        main.firstData = undefined;
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
                main.nowData = detecter.subVar({ ...main.firstData });
                const maxData = (main.lastData === null || main.lastData === void 0 ? void 0 : main.lastData.childList.length) > (main.nowData === null || main.nowData === void 0 ? void 0 : main.nowData.childList.length) ? main.lastData === null || main.lastData === void 0 ? void 0 : main.lastData.childList : main.nowData === null || main.nowData === void 0 ? void 0 : main.nowData.childList;
                if (maxData) {
                    for (let i = 0; i < maxData.length; i++)
                        detecter.detect(parser.getHtml(), main.lastData === null || main.lastData === void 0 ? void 0 : main.lastData.childList[i], main.nowData === null || main.nowData === void 0 ? void 0 : main.nowData.childList[i], i);
                }
                //set last data
                main.lastData = main.nowData;
            }, time);
        };
    })(main = VarInternal.main || (VarInternal.main = {}));
    let changer;
    (function (changer) {
        changer.make = (data) => {
            if (data.tagName == `text`)
                return document.createTextNode(data.value);
            else {
                const myDom = document.createElement(data.tagName);
                data.attributesList.map(element => {
                    myDom.setAttribute(element.attributeName, element.value);
                });
                data.childList.map(element => {
                    myDom.append(changer.make(element));
                });
                return myDom;
            }
        };
        changer.add = (parent, data) => {
            console.log("loladd");
            parent.appendChild(changer.make(data));
        };
        changer.del = (data) => {
            console.log("loldel");
            data.remove();
        };
        changer.change = (parent, target, newData) => {
            console.log("lolchange");
            changer.del(target);
            changer.add(parent, newData);
        };
        changer.attrChange = (target, lastAttr, nowAttr) => {
            //console.log("lolattr");
            nowAttr.map((element, i) => {
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
            let newValue = target;
            // if variable dom
            const nowData = data.varList.find(element => element.key === newValue.tagName);
            if (nowData != undefined) {
                const data = nowData.getData();
                let returningData;
                if (data instanceof parser.virtualDom)
                    returningData = detecter.subVar(data);
                else
                    returningData = parser.texToDom(data);
                if (!(returningData instanceof Array))
                    returningData = [returningData];
                return new parser.virtualDom(target.tagName, target.attributesList, returningData, `none`);
            }
            // if last dom
            else if (newValue.childList.length == 0)
                return newValue;
            //else discover children
            const childNode = newValue.childList.map(element => detecter.subVar(element));
            return new parser.virtualDom(newValue.tagName, newValue.attributesList, childNode, newValue.value);
        };
        detecter.detect = (parent, lastData, nowData, index) => {
            const target = (parent.childNodes[index]);
            if (!lastData && !nowData)
                console.error(`unexpected error`);
            else if (!lastData && nowData)
                changer.add(parent, nowData);
            else if (lastData && !nowData) {
                changer.del(target);
                return;
            }
            else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) !== (nowData === null || nowData === void 0 ? void 0 : nowData.tagName))
                changer.change(parent, target, nowData);
            else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === `text` && (nowData === null || nowData === void 0 ? void 0 : nowData.tagName) === `text` && lastData.value != nowData.value)
                changer.change(parent, target, nowData);
            else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === (nowData === null || nowData === void 0 ? void 0 : nowData.tagName))
                changer.attrChange(target, lastData === null || lastData === void 0 ? void 0 : lastData.attributesList, nowData === null || nowData === void 0 ? void 0 : nowData.attributesList);
            const maxData = (lastData === null || lastData === void 0 ? void 0 : lastData.childList.length) > (nowData === null || nowData === void 0 ? void 0 : nowData.childList.length) ? lastData === null || lastData === void 0 ? void 0 : lastData.childList : nowData === null || nowData === void 0 ? void 0 : nowData.childList;
            if (maxData !== undefined) {
                for (let i = 0; i < maxData.length; i++) {
                    detecter.detect((parent.childNodes[index]), lastData === null || lastData === void 0 ? void 0 : lastData.childList[i], nowData === null || nowData === void 0 ? void 0 : nowData.childList[i], i);
                }
            }
        };
    })(detecter = VarInternal.detecter || (VarInternal.detecter = {}));
})(VarInternal || (VarInternal = {}));
VarInternal.main.init();
VarInternal.main.detectStart(10);
