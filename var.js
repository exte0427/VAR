"use strict";
//setting useful func
var Var;
(function (Var) {
    let data;
    (function (data) {
        let savedData = [];
        let nowTagNum = 0;
        class varForm {
            constructor(value_, render_) {
                this.data = value_;
                this.render = render_;
            }
        }
        data.varForm = varForm;
        class attrForm {
            constructor(element_, tagNum_, varName_, firstTex_, attrTex_) {
                this.element = element_;
                this.tagNum = tagNum_;
                this.varName = varName_;
                this.firstTex = firstTex_;
                this.attrTex = attrTex_;
            }
        }
        data.attrForm = attrForm;
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
        data.exist = (myTagNum) => {
            const thisObj = savedData.find(obj => obj.tagNum == myTagNum);
            if (thisObj == undefined)
                return false;
            else
                return true;
        };
        data.existData = (myTagNum, key) => {
            const thisObj = savedData.find(obj => obj.tagNum == myTagNum);
            if (thisObj == undefined) {
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
        data.getByTagNum = (tagNum) => {
            return savedData[tagNum];
        };
        data.getLastTagNum = () => {
            return nowTagNum;
        };
    })(data = Var.data || (Var.data = {}));
    Var.render = (name, renderTex) => {
        VarInternal.setStorge(name, new VarInternal.VariableData(VarInternal.getStorge(name).data, renderTex));
    };
})(Var || (Var = {}));
//internal func
var VarInternal;
(function (VarInternal) {
    VarInternal.parser = new DOMParser();
    class VariableData {
        constructor(render_, data_) {
            this.render = render_;
            this.data = data_;
        }
    }
    VarInternal.VariableData = VariableData;
    VarInternal.dataStorge = new Proxy({}, {
        set: (target, key, value) => {
            const nowHtml = VarInternal.getHtml();
            //init
            const varList = VarInternal.getVar(nowHtml);
            const varPropList = VarInternal.findPropVar(nowHtml);
            VarInternal.setVar(nowHtml);
            VarInternal.setVarProp(nowHtml);
            VarInternal.init(varList, new Var.data.dataForm(key, value));
            VarInternal.initProp(varPropList, new Var.data.dataForm(key, value));
            //apply value changing
            target[key] = value;
            return true;
        }
    });
    VarInternal.getStorge = (key) => {
        const value = VarInternal.dataStorge[key].value;
        return new VarInternal.VariableData(value.render, value.data);
    };
    VarInternal.setStorge = (key, data) => {
        VarInternal.dataStorge[key] = { data: data.data, render: data.render };
    };
    VarInternal.getVarValue = (name) => {
        return window[name];
    };
    VarInternal.getHtml = () => {
        const htmlDom = document.querySelector(`html`);
        if (htmlDom == null)
            console.error(`page is not loaded`);
        return htmlDom;
    };
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
            if (!Var.data.existData(myTagNum, `variable`)) {
                const myData = new Var.data.dataForm(`variable`, element.innerHTML);
                Var.data.make(element);
                Var.data.set(myTagNum, myData);
            }
        });
    };
    VarInternal.getName = (VarList) => {
        //getting variable names
        const varHTML = [];
        for (let i = 0; i < VarList.length; i++)
            varHTML.push(VarList[i].innerHTML);
        //returning data
        return varHTML;
    };
    VarInternal.valueProcess = (value) => {
        //if no renderer just return data
        if (value.render == "")
            return VarInternal.htmlProcess(value.data);
        //if it has renderer, return renderer
        else
            return VarInternal.htmlProcess(value.render);
    };
    VarInternal.findKids = (doc) => {
        return [...doc.children].map(element => element);
    };
    VarInternal.findPropVarLoad = (doc) => {
        const propVar = [];
        const tagNum = Number(doc.dataset.Var);
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
                        const attrTex = doc.attributes[i].name;
                        const myData = new Var.data.attrForm(doc, tagNum, varName, firstTex, attrTex);
                        //firstTex is changed in setVarProp
                        propVar.push(myData);
                    }
                }
            }
        }
        //fiding childs prop
        const myKids = VarInternal.findKids(doc);
        for (let i = 0; i < myKids.length; i++) {
            const childPropVar = VarInternal.findPropVarLoad(myKids[i]);
            for (let j = 0; j < childPropVar.length; j++)
                propVar.push(childPropVar[j]);
        }
        return propVar;
    };
    VarInternal.findPropVar = (doc) => {
        let data = VarInternal.findPropVarLoad(doc);
        //data exist
        if (data.length > 0)
            return data;
        else {
            const attrEle = Var.data.tagFilter(`attrStr`);
            const returningData = [];
            for (let i = 0; i < attrEle.length; i++) {
                const nowDataNum = attrEle[i];
                const nowData = Var.data.getByTagNum(nowDataNum);
                const tagNum = nowData.tagNum;
                const resultData = new Var.data.attrForm(nowData.element, tagNum, Var.data.get(tagNum, `propVariable`), Var.data.get(tagNum, `firstTex`), Var.data.get(tagNum, `attrTex`));
                returningData.push(resultData);
            }
            return returningData;
        }
    };
    VarInternal.setVarProp = (doc) => {
        const propVar = VarInternal.findPropVar(doc);
        for (let i = 0; i < propVar.length; i++) {
            const nowData = propVar[i];
            const element = nowData.element;
            //add
            if (!Var.data.exist(nowData.tagNum)) {
                //make it
                Var.data.make(element);
                const myTagNum = Var.data.getLastTagNum();
                //set data
                Var.data.set(myTagNum, new Var.data.dataForm(`propVariable`, nowData.varName.replace(" ", "")));
                Var.data.set(myTagNum, new Var.data.dataForm(`firstTex`, nowData.firstTex));
                Var.data.set(myTagNum, new Var.data.dataForm(`attrTex`, nowData.attrTex));
                //set tag
                Var.data.setTag(myTagNum, `attrStr`);
            }
        }
    };
    // [ -> <variable> , ] -> </variable>
    VarInternal.htmlProcess = (html) => {
        // string to HTMLElement
        const dataHtml = VarInternal.parser.parseFromString(html, `text/html`).getElementsByTagName("body")[0];
        //set prop variable
        VarInternal.setVarProp(dataHtml);
        const returnHtml = dataHtml.innerHTML.replaceAll("[", "<variable>").replaceAll("]", "</variable>");
        return returnHtml;
    };
    //put the values of certain variables in [variable]
    VarInternal.change = (myData) => {
        //string to HTMLElement
        const dataHtml = VarInternal.parser.parseFromString(VarInternal.htmlProcess(myData), `text/html`).getElementsByTagName("body")[0];
        const variables = VarInternal.getVar(dataHtml);
        VarInternal.setVarProp(VarInternal.getHtml());
        VarInternal.setVar(VarInternal.getHtml());
        if (dataHtml.innerHTML == myData)
            return myData;
        for (let i = 0; i < variables.length; i++) {
            if (variables[i].dataset.Var == null)
                console.error(`variables[${i}].dataset.Var is null`);
            const tagNum = Number(variables[i].dataset.Var);
            const varName = Var.data.get(tagNum, `variable`);
            const varVal = VarInternal.getVarValue(varName);
            const myVarData = new Var.data.varForm(varVal, "");
            //change
            VarInternal.detectVar(new Var.data.dataForm(varName, varVal));
            variables[i].innerHTML = VarInternal.change(VarInternal.valueProcess(myVarData));
        }
        return dataHtml.innerHTML;
    };
    //in varList, replace all the value to key value ---------------------------------------------------------------------hold
    VarInternal.init = (varList, value) => {
        if (value.data != "") {
            const myRender = VarInternal.valueProcess(new Var.data.varForm(value.data, VarInternal.getStorge(value.key).render));
            const compiledData = VarInternal.change(myRender);
            //replace old data to new data
            for (let i = 0; i < varList.length; i++) {
                const tagNum = Number(varList[i].dataset.Var);
                if (Var.data.get(tagNum, `variable`) == value.key)
                    varList[i].innerHTML = compiledData;
            }
        }
    };
    VarInternal.initProp = (varPropList, value) => {
        if (value.data != "") {
            //replace old data to new data
            for (let i = 0; i < varPropList.length; i++) {
                const nowData = varPropList[i];
                const tagNum = nowData.tagNum;
                const changedTex = Var.data.get(tagNum, `firstTex`).replace(`__variable__`, value.data);
                const attrName = Var.data.get(tagNum, `attrTex`);
                if (Var.data.get(tagNum, `propVariable`) == value.key) {
                    document.querySelectorAll(`[data--var*="${tagNum}"]`)[0].setAttribute(attrName, changedTex);
                }
            }
        }
    };
    VarInternal.detectVar = (value) => {
        VarInternal.setStorge(value.key, new VarInternal.VariableData("", value.data));
        //gearing variables and dataStorge
        Object.defineProperty(window, value.key, {
            configurable: true,
            get() {
                return VarInternal.getStorge(value.key).data;
            },
            set(newValue) {
                const myRender = VarInternal.getStorge(value.key).render;
                VarInternal.setStorge(value.key, new VarInternal.VariableData(myRender, newValue));
            },
        });
    };
})(VarInternal || (VarInternal = {}));
;
//start
window.addEventListener(`load`, () => {
    const htmlTex = VarInternal.getHtml().innerHTML;
    document.getElementsByTagName(`html`)[0].innerHTML = VarInternal.htmlProcess(htmlTex);
    const nowHtml = VarInternal.getHtml();
    //starting work
    const varList = VarInternal.getVar(nowHtml);
    VarInternal.setVar(nowHtml);
    VarInternal.setVarProp(nowHtml);
    //start changing string to certain value
    for (let i = 0; i < varList.length; i++) {
        const tagNum = Number(varList[i].dataset.Var);
        const nowName = Var.data.get(tagNum, `variable`);
        VarInternal.detectVar(new Var.data.dataForm(nowName, ""));
    }
});
