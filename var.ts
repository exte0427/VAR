//setting useful func
namespace Var{
    export namespace data{

        let savedData:Array<SaveData> = [];
        let nowTagNum:number = 0;

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

        export const exist = (myTagNum: number, key: string): boolean => {
            const thisObj: SaveData | undefined = savedData.find(obj => obj.tagNum == myTagNum);
            if (thisObj == null) {
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
    }

    export const render = (name: string, renderTex: string): void=> {
        VarInternal.dataStorge[name]={data:VarInternal.findData(name),render:renderTex};
    }
}

//internal func
namespace VarInternal {

    const parser: DOMParser = new DOMParser();

    export class VariableData{
        public key: string;
        public data: any;

        constructor(key_: string, data_: any) {
            this.key = key_;
            this.data = data_;
        }
    }
    export const dataStroge: Array<VariableData> = [];

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
            if (!Var.data.exist(myTagNum, `variable`)) {
                const myData: Var.data.dataForm = new Var.data.dataForm(`variable`, element.innerHTML);
                Var.data.make(element);
                Var.data.set(myTagNum, myData);
            }
        });
    }

    this.getName=(VarList)=>{
        //getting variable names
        let varHTML=[];
        for(let i=0;i<VarList.length;i++)
            varHTML.push(VarList[i].innerHTML);
        
        //returning data
        return varHTML;
    }

    this.valueProcess=value=>{
        //if no renderer just return data
        if(value.render=="")
            return this.htmlProcess(value.data);

        //if it has renderer, return renderer
        else
            return this.htmlProcess(value.render);
    }

    this.findPropVarLoad=(doc)=>{
        const propVar=[];
        if(doc!=document){
            const tagNum=doc.dataset.Var;
            
            if(Var.data.get(tagNum,`propVariable`)==undefined){
                //finding its prop
                if(doc.attributes!=undefined){
                    for(let i=0;i<doc.attributes.length;i++){

                        const regexp = new RegExp(/\[.*\]/g);
                        const containVar=regexp.exec(doc.attributes[i].value);

                        if(containVar!=null){
                            //find [ var ] and get var
                            const varName=containVar[0].replace("[","").replace("]","");
                            const firstTex=doc.attributes[i].value.replace(`[${varName}]`,`__variable__`);

                            //firstTex is changed in setVarProp
                            propVar.push({
                                element:doc,
                                tagNum:tagNum,
                                varName:varName,
                                firstTex:firstTex,
                                attrTex:doc.attributes[i].name,
                            });
                        }
                    }
                }
            }
        }

        //fiding childs prop
        for(let i=0;i<doc.children.length;i++){
            const childPropVar=this.findPropVarLoad(doc.children[i]);

            for(let j=0;j<childPropVar.length;j++)
                propVar.push(childPropVar[j]);
        }
        
        return propVar;
    }

    this.findPropVar=(doc)=>{
        let data=this.findPropVarLoad(doc);

        if(data.length>0)
            return data;
        else{
            data =  Var.data.tagFilter(`attrStr`);
            const returningData=[];

            for(let i=0;i<data.length;i++){

                const nowData=data[i];
                const tagNum=nowData.dataset.Var;

                returningData.push({
                    element:nowData,
                    tagNum:tagNum,
                    varName:Var.data.get(tagNum,`propVariable`),
                    firstTex:Var.data.get(tagNum,`firstTex`),
                    attrTex:Var.data.get(tagNum,`attrTex`),
                });
            }

            return returningData;
        }
    }

    this.setVarProp=(doc)=>{
        const propVar=this.findPropVar(doc);
        
        for(let i=0;i<propVar.length;i++){

            const nowData=propVar[i];
            const element=nowData.element;

            //add
            if(Var.data.get(nowData.tagNum,element,`propVariable`)==undefined){
                Var.data.set(nowData.tagNum,element,`newData`,true);
                const myTagNum=Var.data.elementFilter(element)[0];
                
                Var.data.set(myTagNum,element,`propVariable`,nowData.varName.replace(" ",""));
                Var.data.set(myTagNum,element,`firstTex`,nowData.firstTex);
                Var.data.set(myTagNum,element,`attrTex`,nowData.attrTex);

                //set tag
                Var.data.setTag(myTagNum,`attrStr`);
            }
        }
    }

    // [ -> <variable> , ] -> </variable>
    this.htmlProcess=html=>{
        if(typeof html != `string`)
            return html;

        const dataHtml=this.parser.parseFromString(html,`text/html`).getElementsByTagName("body")[0];

        //set prop variable
        this.setVarProp(dataHtml);

        html=dataHtml.innerHTML;

        const returnHtml=html.replaceAll("[","<variable>").replaceAll("]","</variable>");
        return returnHtml;
    }

    //put the values of certain variables in [variable]
    this.change=myData=>{

        //parse data
        const dataHtml=this.parser.parseFromString(this.htmlProcess(myData),`text/html`).getElementsByTagName("body")[0];
        const variables=this.getVar(dataHtml);
        VarInternal.setVarProp(document);
        VarInternal.setVar(document);

        if(dataHtml.innerHTML==myData)
            return myData;

        for(let i=0;i<variables.length;i++){
            const tagNum=variables[i].dataset.Var;
            const varName=Var.data.get(tagNum,`variable`);
            const varVal=window[varName];

            //change
            this.detectVar(varName,varVal);
            variables[i].innerHTML=this.change(this.valueProcess({render:"",data:varVal}));
        }

        return dataHtml.innerHTML;
    }

    //in varList, replace all the value to key value
    this.init=(varList,key,value)=>{
        if(value.data!=undefined){
            let myData=this.valueProcess(value);
            myData = this.change(myData);

            //replace old data to new data
            for(let i=0;i<varList.length;i++){
                const tagNum=varList[i].dataset.Var;
                if(Var.data.get(tagNum,`variable`)==key)
                    varList[i].innerHTML=myData;
            }
        }
    }

    this.initProp=(varPropList,key,value)=>{
        if(value.data!=undefined){

            //replace old data to new data
            for(let i=0;i<varPropList.length;i++){

                const nowData=varPropList[i];
                const tagNum=nowData.tagNum;

                if(Var.data.get(tagNum,`propVariable`)==key){
                    document.querySelectorAll(`[data--var*="${tagNum}"]`)[0].setAttribute(Var.data.get(tagNum,`attrTex`),Var.data.get(tagNum,`firstTex`).replace(`__variable__`,value.data));
                }
            }

        }
    }

    this.detectVar=(nowName,data)=>{
        dataStorge[nowName]={data:data,render:""};

        //gearing variables and dataStorge
        Object.defineProperty(window,nowName,{
            configurable: true,
            get(){
                return dataStorge[nowName].data;
            },
            set(newValue){
                dataStorge[nowName]={data:newValue,render:dataStorge[nowName].render};
            },
        });
    }
};

//start
window.addEventListener("load", function(event) {
    let htmlTex=document.getElementsByTagName("html")[0].innerHTML;
    document.getElementsByTagName("html")[0].innerHTML=VarInternal.htmlProcess(htmlTex);


    //starting work
    varList=VarInternal.getVar(document);
    VarInternal.setVar(document);
    VarInternal.setVarProp(document);

    //start changing string to certain value
    dataStorge = new Proxy({}, {
        set: function (target, key, value) {
            //init
            varList=VarInternal.getVar(document);
            varPropList=VarInternal.findPropVar(document);

            VarInternal.setVar(document);
            VarInternal.setVarProp(document);

            VarInternal.init(varList,key,value);
            VarInternal.initProp(varPropList,key,value);

            //apply value changing
            target[key] = value;
        }
    });

    for(let i=0;i<varList.length;i++){
        const nowName= Var.data.get(varList[i].dataset.Var,`variable`);
        VarInternal.detectVar(nowName);
    }
});