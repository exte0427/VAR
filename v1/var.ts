/*/setting useful func
namespace Var{
    export namespace data{

        let savedData:Array<SaveData> = [];
        let nowTagNum:number = 0;

        export class varForm{
            public data: any;
            public render: string;

            constructor(value_: any, render_: string) {
                this.data = value_;
                this.render = render_;
            }
        }

        export class attrForm{
            public element: HTMLElement;
            public tagNum: number;
            public varName: string;
            public firstTex: string;
            public attrTex: string;

            constructor(element_: HTMLElement, tagNum_: number, varName_: string, firstTex_: string, attrTex_: string) {
                this.element = element_;
                this.tagNum = tagNum_;
                this.varName = varName_;
                this.firstTex = firstTex_;
                this.attrTex = attrTex_;
            }
        }

        export class dataForm{
            public key: string;
            public data: string;
            
            constructor(key_:string,data_:string) {
                this.key = key_;
                this.data = data_;
            }
        }

        export class SaveData{
            public element: HTMLElement;
            private dataList: Array<dataForm>;
            public tagNum: number;
            public tag: string;

            constructor(element: HTMLElement){
                this.element=element;
                this.dataList=[];
                this.tagNum=nowTagNum;
                this.tag="";

                nowTagNum++;
                element.dataset.Var=this.tagNum.toString();
            }

            set(myData: dataForm): void{
                const index: number = this.dataList.findIndex(obj => obj.key === myData.key);
                if (index == -1)
                    this.dataList.push(myData);
                else
                    this.dataList[index] = myData;
            }

            get(key: string): string{
                const myData: dataForm | undefined =this.dataList.find(obj => obj.key === key);
                if (myData === undefined) {
                    console.error(`Var.data.SaveData.get(${key}) is undefined`);
                    return "";
                }
                else
                    return myData.data;
            }

            exist(key: string): boolean{
                const myData: dataForm | undefined = this.dataList.find(obj => obj.key === key);
                if (myData === undefined)
                    return false;
                else
                    return true;
            }

        }

        export const make = (element: HTMLElement): void => {
            savedData.push(new SaveData(element));
        }

        export const set=(myTagNum: number,myData: dataForm): void => {
            const thisNum: number = savedData.findIndex(obj => obj.tagNum === myTagNum);
            savedData[thisNum].set(myData);
        }

        export const setTag = (myTagNum: number, tagName: string): void => {
            const index: number = savedData.findIndex(obj => obj.tagNum === myTagNum);
            savedData[index].tag = tagName;
        }

        export const get = (myTagNum: number , key: string): string => {
            const thisObj: SaveData|undefined = savedData.find(obj=>obj.tagNum==myTagNum);
            if (thisObj == null) {
                console.error(`Var.data.get(${myTagNum}) is undefined`);
                return "";
            }
            else
                return thisObj.get(key);
        }

        export const exist = (myTagNum: number): boolean => {
            const thisObj: SaveData | undefined = savedData.find(obj => obj.tagNum == myTagNum);
            if (thisObj == undefined)
                return false;
            else
                return true;
        }

        export const existData = (myTagNum: number, key: string): boolean => {
            const thisObj: SaveData | undefined = savedData.find(obj => obj.tagNum == myTagNum);
            if (thisObj == undefined) {
                console.error(`Var.data.get(${myTagNum}) is undefined`);
                return false;
            }
            else {
                const keyValue: boolean = thisObj.exist(key);
                return keyValue;
            }
        }

        export const tagFilter=(myTag: string): Array<number> => {
            const returningData: Array<number> = [];
            savedData.forEach(element=>{
                if(element.tag==myTag)
                    returningData.push(element.tagNum);
            });

            return returningData;
        }

        export const getByTagNum = (tagNum: number): SaveData => {
            return savedData[tagNum];
        }

        export const getLastTagNum = (): number => {
            return nowTagNum;
        }

    }

    export const render = (name: string, renderTex: string): void=> {
        VarInternal.setStorge(name, new VarInternal.VariableData(VarInternal.getStorge(name).data, renderTex));
    }
}

//internal func
namespace VarInternal {

    export const parser: DOMParser = new DOMParser();

    export class VariableData{
        public render: string;
        public data: any;

        constructor(render_: string ,data_: any) {
            this.render = render_;
            this.data = data_;
        }
    }

    export const dataStorge = new Proxy({}, {
        set: (target: any, key: string, value: any): boolean => {
            const nowHtml:HTMLElement = VarInternal.getHtml();

            //init
            const varList = VarInternal.getVar(nowHtml);
            const varPropList = VarInternal.findPropVar(nowHtml);

            VarInternal.setVar(nowHtml);
            VarInternal.setVarProp(nowHtml);

            VarInternal.init(varList,new Var.data.dataForm(key,value));
            VarInternal.initProp(varPropList,new Var.data.dataForm(key,value));

            //apply value changing
            target[key] = value;

            return true;
        }
    });

    export const getStorge = (key: string): VariableData => {
        const value: any = dataStorge[key].value;
        return new VarInternal.VariableData(value.render,value.data);
    }

    export const setStorge = (key: string,data: VarInternal.VariableData): void => {
        dataStorge[<any>key] = {data: data.data,render:data.render };
    }

    export const getVarValue = (name: string): any => {
        return window[<any>name];
    }

    export const getHtml = (): HTMLElement => {
        const htmlDom: HTMLElement | null = document.querySelector(`html`);
        
        if (htmlDom == null)
            console.error(`page is not loaded`);
        
        return <HTMLElement>htmlDom;
    }

    export const findTagNum = (element: HTMLElement): number => {
        const myTagNum: string | undefined = element.dataset.Var;
        if (myTagNum === undefined) {
            console.error(`${element}.dataset.Var is undefined`);
            return -1;
        }
        
        return Number(myTagNum);
    }

    export const getVar = (doc: HTMLElement): NodeListOf<HTMLElement> => {
        //get value
        const varList: NodeListOf<HTMLElement> = doc.querySelectorAll("variable");

        //returning data
        return varList;
    }

    export const setVar=(doc: HTMLElement): void =>{

        //get value
        const varList: NodeListOf<HTMLElement> = VarInternal.getVar(doc);

        //changing varList var->variable
        varList.forEach(element => {
            const myTagNum: number = findTagNum(element);
            if (!Var.data.existData(myTagNum, `variable`)) {
                const myData: Var.data.dataForm = new Var.data.dataForm(`variable`, element.innerHTML);
                Var.data.make(element);
                Var.data.set(myTagNum, myData);
            }
        });
    }

    export const getName = (VarList: Array<HTMLElement>): Array<string> => {
        //getting variable names
        const varHTML: Array<string> = [];
        for (let i = 0; i < VarList.length; i++)
            varHTML.push(VarList[i].innerHTML);
        
        //returning data
        return varHTML;
    }

    export const valueProcess=(value: Var.data.varForm): string => {
        //if no renderer just return data
        if (value.render == "")
            return VarInternal.htmlProcess(value.data);

        //if it has renderer, return renderer
        else
            return VarInternal.htmlProcess(value.render);
    }

    export const findKids = (doc: HTMLElement): Array<HTMLElement> => {
        return [...doc.children].map(element => (<HTMLElement>element));
    }

    export const findPropVarLoad=(doc: HTMLElement): Array<Var.data.attrForm> => {
        const propVar: Array<Var.data.attrForm> = [];
        const tagNum: number = Number(doc.dataset.Var);
            
        if(Var.data.get(tagNum,`propVariable`) == undefined){
            //finding its prop
            if(doc.attributes != undefined){
                for(let i=0;i<doc.attributes.length;i++){

                    const regexp: RegExp = new RegExp(/\[.*\]/g);
                    const containVar: null|RegExpExecArray = regexp.exec(doc.attributes[i].value);

                    if (containVar != null) {
                        
                        //find [ var ] and get var
                        const varName: string = containVar[0].replace("[","").replace("]","");
                        const firstTex: string = doc.attributes[i].value.replace(`[${varName}]`, `__variable__`);
                        const attrTex = doc.attributes[i].name;
                        const myData = new Var.data.attrForm(doc,tagNum,varName,firstTex,attrTex);

                        //firstTex is changed in setVarProp
                        propVar.push(myData);
                    }
                }
            }
        }

        //fiding childs prop
        const myKids: Array<HTMLElement> = VarInternal.findKids(doc);

        for (let i = 0; i < myKids.length; i++){
            const childPropVar: Array<Var.data.attrForm> = VarInternal.findPropVarLoad(myKids[i]);

            for(let j=0;j<childPropVar.length;j++)
                propVar.push(childPropVar[j]);
        }
        
        return propVar;
    }

    export const findPropVar = (doc: HTMLElement): Array<Var.data.attrForm> => {
        let data: Array<Var.data.attrForm> = VarInternal.findPropVarLoad(doc);

        //data exist
        if(data.length > 0)
            return data;
        else{
            const attrEle: Array<number> =  Var.data.tagFilter(`attrStr`);
            const returningData: Array<Var.data.attrForm> = [];

            for(let i=0;i<attrEle.length;i++){

                const nowDataNum: number = attrEle[i];
                const nowData: Var.data.SaveData = Var.data.getByTagNum(nowDataNum);
                const tagNum: number = nowData.tagNum;

                const resultData: Var.data.attrForm = new Var.data.attrForm(
                    nowData.element,
                    tagNum,
                    Var.data.get(tagNum, `propVariable`),
                    Var.data.get(tagNum, `firstTex`),
                    Var.data.get(tagNum,`attrTex`),
                );

                returningData.push(resultData);
            }

            return returningData;
        }
    }

    export const setVarProp = (doc: HTMLElement): void => {
        const propVar: Array<Var.data.attrForm> = VarInternal.findPropVar(doc);
        
        for(let i=0;i<propVar.length;i++){

            const nowData: Var.data.attrForm = propVar[i];
            const element: HTMLElement = nowData.element;

            //add
            if (!Var.data.exist(nowData.tagNum)) {
                
                //make it
                Var.data.make(element);

                const myTagNum: number = Var.data.getLastTagNum();

                //set data
                Var.data.set(myTagNum,new Var.data.dataForm(`propVariable`, nowData.varName.replace(" ","")));
                Var.data.set(myTagNum,new Var.data.dataForm(`firstTex`,nowData.firstTex));
                Var.data.set(myTagNum,new Var.data.dataForm(`attrTex`,nowData.attrTex));

                //set tag
                Var.data.setTag(myTagNum,`attrStr`);
            }
        }
    }

    // [ -> <variable> , ] -> </variable>
    export const htmlProcess = (html: string): string => {
        
        // string to HTMLElement
        const dataHtml: HTMLElement = VarInternal.parser.parseFromString(html,`text/html`).getElementsByTagName("body")[0];

        //set prop variable
        VarInternal.setVarProp(dataHtml);

        const returnHtml = dataHtml.innerHTML.replaceAll("[","<variable>").replaceAll("]","</variable>");
        return returnHtml;
    }

    //put the values of certain variables in [variable]
    export const change = (myData: string): string => {

        //string to HTMLElement
        const dataHtml: HTMLElement = VarInternal.parser.parseFromString(VarInternal.htmlProcess(myData),`text/html`).getElementsByTagName("body")[0];
        const variables: NodeListOf<HTMLElement> = VarInternal.getVar(dataHtml);
        
        VarInternal.setVarProp(VarInternal.getHtml());
        VarInternal.setVar(VarInternal.getHtml());

        if(dataHtml.innerHTML == myData)
            return myData;

        for (let i = 0; i < variables.length; i++){

            if (variables[i].dataset.Var == null)
                console.error(`variables[${i}].dataset.Var is null`);
            
            const tagNum: number = Number(variables[i].dataset.Var);
            const varName: string = Var.data.get(tagNum,`variable`);
            const varVal: any = VarInternal.getVarValue(varName);
            const myVarData: Var.data.varForm = new Var.data.varForm(varVal,"");

            //change
            VarInternal.detectVar(new Var.data.dataForm(varName,varVal));
            variables[i].innerHTML = VarInternal.change(VarInternal.valueProcess(myVarData));
        }

        return dataHtml.innerHTML;
    }

    //in varList, replace all the value to key value ---------------------------------------------------------------------hold
    export const init = (varList: NodeListOf<HTMLElement>, value: Var.data.dataForm): void => {
        if(value.data!=""){
            const myRender: string = VarInternal.valueProcess(new Var.data.varForm(value.data,VarInternal.getStorge(value.key).render));
            const compiledData = VarInternal.change(myRender);

            //replace old data to new data
            for (let i = 0; i < varList.length; i++){
                const tagNum: number = Number(varList[i].dataset.Var);
                if (Var.data.get(tagNum, `variable`) == value.key)
                    varList[i].innerHTML = compiledData;
            }
        }
    }

    export const initProp = (varPropList: Array<Var.data.attrForm>,value: Var.data.dataForm): void => {
        if(value.data!=""){

            //replace old data to new data
            for(let i=0;i<varPropList.length;i++){

                const nowData: Var.data.attrForm = varPropList[i];
                const tagNum: number = nowData.tagNum;

                const changedTex: string = Var.data.get(tagNum, `firstTex`).replace(`__variable__`, value.data);
                const attrName: string = Var.data.get(tagNum, `attrTex`);

                if(Var.data.get(tagNum,`propVariable`)==value.key){
                    document.querySelectorAll(`[data--var*="${tagNum}"]`)[0].setAttribute(attrName, changedTex);
                }
            }

        }
    }

    export const detectVar = (value: Var.data.dataForm): void => {
        VarInternal.setStorge(value.key,new VarInternal.VariableData("",value.data));

        //gearing variables and dataStorge
        Object.defineProperty(window, value.key, {
            configurable: true,
            get() {
                return VarInternal.getStorge(value.key).data;
            },
            set(newValue) {
                const myRender: string = VarInternal.getStorge(value.key).render;
                VarInternal.setStorge(value.key, new VarInternal.VariableData(myRender, newValue));
            },
        });
    }
};

//start
window.addEventListener(`load`, () => {
    const htmlTex: string = VarInternal.getHtml().innerHTML;
    document.getElementsByTagName(`html`)[0].innerHTML = VarInternal.htmlProcess(htmlTex);

    const nowHtml:HTMLElement = VarInternal.getHtml();

    //starting work
    const varList: NodeListOf<HTMLElement> = VarInternal.getVar(nowHtml);
    VarInternal.setVar(nowHtml);
    VarInternal.setVarProp(nowHtml);

    //start changing string to certain value

    for (let i = 0; i < varList.length; i++){
        const tagNum: number = Number(varList[i].dataset.Var);
        const nowName = Var.data.get(tagNum, `variable`);

        VarInternal.detectVar(new Var.data.dataForm(nowName,""));
    }
});
*/