"use strict";
//setting useful func
var Var;
(function (Var) {
    let data;
    (function (data) {
        let savedData = [];
        let nowTagNum = 0;
        class dataForm {
            constructor(key_, data_) {
                this.key = key_;
                this.data = data_;
            }
        }
        data.dataForm = dataForm;
        class SaveData {
            constructor(element) {
                this.element = element;
                this.dataList = [];
                this.tagNum = nowTagNum;
                this.tag = "";
                nowTagNum++;
                element.dataset.Var = this.tagNum.toString();
            }
            set(myData) {
                const index = this.dataList.findIndex(obj => obj.key === myData.key);
                if (index == -1)
                    this.dataList.push(myData);
                else
                    this.dataList[index] = myData;
            }
            get(key) {
                const myData = this.dataList.find(obj => obj.key === key);
                if (myData === undefined) {
                    console.error(`Var.data.SaveData.get(${key}) is undefined`);
                    return "";
                }
                else
                    return myData.data;
            }
            exist(key) {
                const myData = this.dataList.find(obj => obj.key === key);
                if (myData === undefined)
                    return false;
                else
                    return true;
            }
        }
        data.SaveData = SaveData;
        data.make = (element) => {
            savedData.push(new SaveData(element));
        };
        data.set = (myTagNum, myData) => {
            const thisNum = savedData.findIndex(obj => obj.tagNum === myTagNum);
            savedData[thisNum].set(myData);
        };
        data.setTag = (myTagNum, tagName) => {
            const index = savedData.findIndex(obj => obj.tagNum === myTagNum);
            savedData[index].tag = tagName;
        };
        data.get = (myTagNum, key) => {
            const thisObj = savedData.find(obj => obj.tagNum == myTagNum);
            if (thisObj == null) {
                console.error(`Var.data.get(${myTagNum}) is undefined`);
                return "";
            }
            else
                return thisObj.get(key);
        };
        data.exist = (myTagNum, key) => {
            const thisObj = savedData.find(obj => obj.tagNum == myTagNum);
            if (thisObj == null) {
                console.error(`Var.data.get(${myTagNum}) is undefined`);
                return false;
            }
            else {
                const keyValue = thisObj.exist(key);
                return keyValue;
            }
        };
        data.tagFilter = (myTag) => {
            const returningData = [];
            savedData.forEach(element => {
                if (element.tag == myTag)
                    returningData.push(element.tagNum);
            });
            return returningData;
        };
    })(data = Var.data || (Var.data = {}));
    Var.render = (name, renderTex) => {
        VarInternal.dataStorge[name] = { data: VarInternal.findData(name), render: renderTex };
    };
})(Var || (Var = {}));
//internal func
var VarInternal;
(function (VarInternal) {
    const parser = new DOMParser();
    class VariableData {
        constructor(key_, data_) {
            this.key = key_;
            this.data = data_;
        }
    }
    VarInternal.VariableData = VariableData;
    VarInternal.dataStroge = [];
    VarInternal.findTagNum = (element) => {
        const myTagNum = element.dataset.Var;
        if (myTagNum === undefined) {
            console.error(`${element}.dataset.Var is undefined`);
            return -1;
        }
        return Number(myTagNum);
    };
    VarInternal.getVar = (doc) => {
        //get value
        const varList = doc.querySelectorAll("variable");
        //returning data
        return varList;
    };
    VarInternal.setVar = (doc) => {
        //get value
        const varList = VarInternal.getVar(doc);
        //changing varList var->variable
        varList.forEach(element => {
            const myTagNum = VarInternal.findTagNum(element);
            if (!Var.data.exist(myTagNum, `variable`)) {
                const myData = new Var.data.dataForm(`variable`, element.innerHTML);
                Var.data.make(element);
                Var.data.set(myTagNum, myData);
            }
        });
    };
    this.getName = (VarList) => {
        //getting variable names
        let varHTML = [];
        for (let i = 0; i < VarList.length; i++)
            varHTML.push(VarList[i].innerHTML);
        //returning data
        return varHTML;
    };
    this.valueProcess = value => {
        //if no renderer just return data
        if (value.render == "")
            return this.htmlProcess(value.data);
        //if it has renderer, return renderer
        else
            return this.htmlProcess(value.render);
    };
    this.findPropVarLoad = (doc) => {
        const propVar = [];
        if (doc != document) {
            const tagNum = doc.dataset.Var;
            if (Var.data.get(tagNum, `propVariable`) == undefined) {
                //finding its prop
                if (doc.attributes != undefined) {
                    for (let i = 0; i < doc.attributes.length; i++) {
                        const regexp = new RegExp(/\[.*\]/g);
                        const containVar = regexp.exec(doc.attributes[i].value);
                        if (containVar != null) {
                            //find [ var ] and get var
                            const varName = containVar[0].replace("[", "").replace("]", "");
                            const firstTex = doc.attributes[i].value.replace(`[${varName}]`, `__variable__`);
                            //firstTex is changed in setVarProp
                            propVar.push({
                                element: doc,
                                tagNum: tagNum,
                                varName: varName,
                                firstTex: firstTex,
                                attrTex: doc.attributes[i].name,
                            });
                        }
                    }
                }
            }
        }
        //fiding childs prop
        for (let i = 0; i < doc.children.length; i++) {
            const childPropVar = this.findPropVarLoad(doc.children[i]);
            for (let j = 0; j < childPropVar.length; j++)
                propVar.push(childPropVar[j]);
        }
        return propVar;
    };
    this.findPropVar = (doc) => {
        let data = this.findPropVarLoad(doc);
        if (data.length > 0)
            return data;
        else {
            data = Var.data.tagFilter(`attrStr`);
            const returningData = [];
            for (let i = 0; i < data.length; i++) {
                const nowData = data[i];
                const tagNum = nowData.dataset.Var;
                returningData.push({
                    element: nowData,
                    tagNum: tagNum,
                    varName: Var.data.get(tagNum, `propVariable`),
                    firstTex: Var.data.get(tagNum, `firstTex`),
                    attrTex: Var.data.get(tagNum, `attrTex`),
                });
            }
            return returningData;
        }
    };
    this.setVarProp = (doc) => {
        const propVar = this.findPropVar(doc);
        for (let i = 0; i < propVar.length; i++) {
            const nowData = propVar[i];
            const element = nowData.element;
            //add
            if (Var.data.get(nowData.tagNum, element, `propVariable`) == undefined) {
                Var.data.set(nowData.tagNum, element, `newData`, true);
                const myTagNum = Var.data.elementFilter(element)[0];
                Var.data.set(myTagNum, element, `propVariable`, nowData.varName.replace(" ", ""));
                Var.data.set(myTagNum, element, `firstTex`, nowData.firstTex);
                Var.data.set(myTagNum, element, `attrTex`, nowData.attrTex);
                //set tag
                Var.data.setTag(myTagNum, `attrStr`);
            }
        }
    };
    // [ -> <variable> , ] -> </variable>
    this.htmlProcess = html => {
        if (typeof html != `string`)
            return html;
        const dataHtml = this.parser.parseFromString(html, `text/html`).getElementsByTagName("body")[0];
        //set prop variable
        this.setVarProp(dataHtml);
        html = dataHtml.innerHTML;
        const returnHtml = html.replaceAll("[", "<variable>").replaceAll("]", "</variable>");
        return returnHtml;
    };
    //put the values of certain variables in [variable]
    this.change = myData => {
        //parse data
        const dataHtml = this.parser.parseFromString(this.htmlProcess(myData), `text/html`).getElementsByTagName("body")[0];
        const variables = this.getVar(dataHtml);
        VarInternal.setVarProp(document);
        VarInternal.setVar(document);
        if (dataHtml.innerHTML == myData)
            return myData;
        for (let i = 0; i < variables.length; i++) {
            const tagNum = variables[i].dataset.Var;
            const varName = Var.data.get(tagNum, `variable`);
            const varVal = window[varName];
            //change
            this.detectVar(varName, varVal);
            variables[i].innerHTML = this.change(this.valueProcess({ render: "", data: varVal }));
        }
        return dataHtml.innerHTML;
    };
    //in varList, replace all the value to key value
    this.init = (varList, key, value) => {
        if (value.data != undefined) {
            let myData = this.valueProcess(value);
            myData = this.change(myData);
            //replace old data to new data
            for (let i = 0; i < varList.length; i++) {
                const tagNum = varList[i].dataset.Var;
                if (Var.data.get(tagNum, `variable`) == key)
                    varList[i].innerHTML = myData;
            }
        }
    };
    this.initProp = (varPropList, key, value) => {
        if (value.data != undefined) {
            //replace old data to new data
            for (let i = 0; i < varPropList.length; i++) {
                const nowData = varPropList[i];
                const tagNum = nowData.tagNum;
                if (Var.data.get(tagNum, `propVariable`) == key) {
                    document.querySelectorAll(`[data--var*="${tagNum}"]`)[0].setAttribute(Var.data.get(tagNum, `attrTex`), Var.data.get(tagNum, `firstTex`).replace(`__variable__`, value.data));
                }
            }
        }
    };
    this.detectVar = (nowName, data) => {
        dataStorge[nowName] = { data: data, render: "" };
        //gearing variables and dataStorge
        Object.defineProperty(window, nowName, {
            configurable: true,
            get() {
                return dataStorge[nowName].data;
            },
            set(newValue) {
                dataStorge[nowName] = { data: newValue, render: dataStorge[nowName].render };
            },
        });
    };
})(VarInternal || (VarInternal = {}));
;
//start
window.addEventListener("load", function (event) {
    let htmlTex = document.getElementsByTagName("html")[0].innerHTML;
    document.getElementsByTagName("html")[0].innerHTML = VarInternal.htmlProcess(htmlTex);
    //starting work
    varList = VarInternal.getVar(document);
    VarInternal.setVar(document);
    VarInternal.setVarProp(document);
    //start changing string to certain value
    dataStorge = new Proxy({}, {
        set: function (target, key, value) {
            //init
            varList = VarInternal.getVar(document);
            varPropList = VarInternal.findPropVar(document);
            VarInternal.setVar(document);
            VarInternal.setVarProp(document);
            VarInternal.init(varList, key, value);
            VarInternal.initProp(varPropList, key, value);
            //apply value changing
            target[key] = value;
        }
    });
    for (let i = 0; i < varList.length; i++) {
        const nowName = Var.data.get(varList[i].dataset.Var, `variable`);
        VarInternal.detectVar(nowName);
    }
});
