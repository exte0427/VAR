"use strict";
var Var;
(function (Var) {
    Var.dom = (tagName, states, ...childNodes) => {
        return new VarInternal.parser.virtualDom(tagName, states, childNodes.flat(), ``);
    };
    Var.text = (value) => {
        return new VarInternal.parser.virtualDom(`text`, [], [], value);
    };
    Var.state = (stateName, stateVal) => {
        return new VarInternal.parser.virtualState(stateName, stateVal);
    };
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
        getData(...args) {
            let returnData;
            if (this.data instanceof Function)
                returnData = this.data(...args);
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
            const children = [];
            let tagName = ``;
            let attributes = [];
            let text = ``;
            if (element instanceof HTMLElement || element instanceof Element) {
                tagName = element.tagName.toLowerCase();
                attributes = parser.parseAttributes(element.attributes);
                text = element.innerHTML;
                const nowChild = html.getChild(element);
                for (let i = 0; i < nowChild.length; i++) {
                    children.push(parser.parse(nowChild[i]));
                }
            }
            else if (element != undefined) {
                tagName = `text`;
                text = parser.parseText(element.nodeValue);
            }
            return new virtualDom(tagName, attributes, children, text);
        };
    })(parser = VarInternal.parser || (VarInternal.parser = {}));
    let template;
    (function (template) {
        template.calcVar = (oldText) => {
            let newText = ``;
            const startVar = [];
            for (let i = 0; i < oldText.length; i++) {
                const nowChar = oldText.charAt(i);
                const nextChar = oldText.charAt(i + 1);
                if (nowChar === `<` && nextChar === `-`)
                    startVar.push(i);
                if (nowChar === `-` && nextChar === `>`) {
                    const startNum = startVar[startVar.length - 1];
                    const endNum = i + 1;
                    const varName = oldText.slice(startNum, endNum + 1);
                    startVar.pop();
                    newText = newText.slice(0, startNum);
                    newText += `\${${varName.replace(`<-`, ``).replace(`->`, ``)}}`;
                    i++;
                    continue;
                }
                newText += nowChar;
            }
            return newText;
        };
        template.templateMake = (data) => {
            const name = data.tagName;
            const stateCodes = data.attributesList.map(state => `Var.state("${state.attributeName}",\`${template.calcVar(state.value)}\`)`);
            const code = [];
            data.childList.map(element => {
                const childData = template.templateMake(element);
                code.push(childData);
            });
            if (name === `text`)
                return `Var.text(\`${template.calcVar(data.value)}\`)`;
            else
                return `Var.dom("${name}",[${stateCodes.join(`,`)}],${code.join(`,`)})`;
        };
        template.parse = (data) => {
            if (data.tagName === `var`) {
                const name = data.attributesList[0].attributeName;
                const args = data.attributesList.splice(1).map(element => element.attributeName).join(`,`);
                Var.make(name, new Function(args, `return ${template.templateMake(data)}`));
            }
            data.childList.map(element => {
                template.parse(element);
            });
        };
        template.except = (data) => {
            if (data.tagName === `var`)
                return undefined;
            else {
                const children = [];
                data.childList.map(element => {
                    const nowData = template.except(element);
                    if (nowData !== undefined)
                        children.push(nowData);
                });
                const newData = new parser.virtualDom(data.tagName, data.attributesList, children, data.value);
                return newData;
            }
        };
    })(template = VarInternal.template || (VarInternal.template = {}));
    let html;
    (function (html) {
        html.getChild = (parent) => {
            const childList = [];
            for (let i = 0; i < parent.childNodes.length; i++) {
                const child = parent.childNodes[i];
                if (child.nodeValue === null || parser.parseText(child.nodeValue) !== ``)
                    childList.push(child);
            }
            return childList;
        };
    })(html = VarInternal.html || (VarInternal.html = {}));
    let main;
    (function (main) {
        main.firstData = undefined;
        main.lastData = undefined;
        main.nowData = undefined;
        main.delList = [];
        main.init = () => {
            //start
            console.log(`Var.js`);
            main.firstData = parser.parse(parser.getHtml());
            template.parse(main.firstData);
            main.lastData = main.firstData;
            main.firstData = template.except(main.firstData);
            main.nowData = main.firstData;
        };
        main.detectStart = (time) => {
            setInterval(() => {
                //set now data
                main.nowData = detecter.subVar({ ...main.firstData });
                detecter.detect(document, main.lastData, main.nowData, 1);
                main.delList.map(element => changer.del(element));
                main.delList = [];
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
                /*data.childList.map(element => {
                    myDom.append(make(element));
                });*/
                return myDom;
            }
        };
        changer.add = (parent, data) => {
            parent.appendChild(changer.make(data));
        };
        changer.del = (data) => {
            data.remove();
        };
        changer.change = (parent, target, newData) => {
            parent.replaceChild(changer.make(newData), target);
        };
        changer.attrChange = (target, lastAttr, nowAttr) => {
            nowAttr.map((element) => {
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
            const newValue = target;
            // if variable dom
            const nowData = data.varList.find(element => element.key === newValue.tagName);
            if (nowData != undefined) {
                const attributeValue = newValue.attributesList.filter(data => data.value === ``).map(data => data.attributeName);
                const data = nowData.getData(...attributeValue);
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
            if (parent instanceof HTMLElement) {
                const target = (html.getChild(parent)[index]);
                if (!lastData && !nowData)
                    console.error(`unexpected error`);
                else if (!lastData && nowData)
                    changer.add(parent, nowData);
                else if (lastData && !nowData) {
                    main.delList.push(target);
                    return;
                }
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) !== (nowData === null || nowData === void 0 ? void 0 : nowData.tagName))
                    changer.change(parent, target, nowData);
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === `text` && (nowData === null || nowData === void 0 ? void 0 : nowData.tagName) === `text` && lastData.value != nowData.value)
                    changer.change(parent, target, nowData);
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === (nowData === null || nowData === void 0 ? void 0 : nowData.tagName) && (lastData === null || lastData === void 0 ? void 0 : lastData.tagName) != `text`)
                    changer.attrChange(target, lastData === null || lastData === void 0 ? void 0 : lastData.attributesList, nowData === null || nowData === void 0 ? void 0 : nowData.attributesList);
            }
            const maxData = (lastData === null || lastData === void 0 ? void 0 : lastData.childList.length) > (nowData === null || nowData === void 0 ? void 0 : nowData.childList.length) ? lastData === null || lastData === void 0 ? void 0 : lastData.childList : nowData === null || nowData === void 0 ? void 0 : nowData.childList;
            if (maxData !== undefined) {
                for (let i = 0; i < maxData.length; i++) {
                    const nowElement = html.getChild(parent)[index];
                    detecter.detect((nowElement), lastData === null || lastData === void 0 ? void 0 : lastData.childList[i], nowData === null || nowData === void 0 ? void 0 : nowData.childList[i], i);
                }
            }
        };
    })(detecter = VarInternal.detecter || (VarInternal.detecter = {}));
})(VarInternal || (VarInternal = {}));
VarInternal.main.init();
VarInternal.main.detectStart(2000);
