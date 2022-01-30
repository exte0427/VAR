//setting useful func
const Var = new function(){
    this.data = new function(){

        let savedData = [];
        let nowTagNum = 0;

        class SaveData{

            element;
            dataList;
            tagNum;
            tag;

            constructor(element){
                this.element=element;
                this.dataList=[];
                this.tagNum=nowTagNum;
                this.tag=undefined;

                nowTagNum++;
                element.dataset.Var=this.tagNum;
            }

            set(key,data){
                const thisNum=this.dataList.findIndex(obj=>obj.key==key);
                if(thisNum==-1)
                    this.dataList.push({key:key,data:data});
                else
                    this.dataList[thisNum]={key:key,data:data};
            }

            get(key){
                const myData=this.dataList.find(obj=>obj.key==key);
                if(myData==null)
                    return undefined;
                else
                    return myData.data;
            }

            getElement(){
                return this.element;
            }

            setTag(tagName){
                this.tag=tagName;
            }

        }

        this.set=(myTagNum,element,key,value)=>{
            let thisNum = savedData.findIndex(obj=>obj.tagNum==myTagNum);

            if(thisNum==-1){
                savedData.push(new SaveData(element));
                thisNum=savedData.length-1;
            }

            savedData[thisNum].set(key,value);
        }

        this.setTag=(myTagNum,tagName)=>{
            savedData.find(obj=>obj.tagNum==myTagNum).setTag(tagName);
        }

        this.get=(myTagNum,key)=>{
            const thisObj = savedData.find(obj=>obj.tagNum==myTagNum);
            if(thisObj==null)
                return undefined;
            else
                return thisObj.get(key);
        }

        this.tagFilter=(myTag)=>{
            const returningData=[];
            savedData.forEach(element=>{
                if(element.tag==myTag)
                    returningData.push(element.getElement());
            });

            return returningData;
        }

        this.elementFilter=(myEle)=>{
            const returningData=[];
            savedData.some(element=>{
                if(element.element==myEle)
                    returningData.push(element.tagNum);
            });

            return returningData;
        }

        this.debugSave=()=>{
            return savedData;
        }

        this.getElement=(myTagNum)=>{
            const thisObj = savedData.find(obj=>obj.tagNum==myTagNum);
            return thisObj.getElement();
        }
    }

    this.render=(name,renderTex)=>{
        dataStorge[name]={data:VarInternal.findData(name),render:renderTex};
    }
}

//internal func
const VarInternal=new function(){
    this.keyValFirst="[";
    this.KeyValLast="]";

    this.parser = new DOMParser();
    this.getVar=(doc)=>{
        
        //get value
        const varList=doc.querySelectorAll("variable");

        //returning data
        return varList;
    }

    this.setVar=(doc)=>{

        //get value
        const varList=this.getVar(doc);

        //changing varList var->variable
        for(let i=0;i<varList.length;i++){
            const element=varList[i];
            if(Var.data.get(element.dataset.Var,`variable`)==undefined)
                Var.data.set(element.dataset.Var,element,`variable`,element.innerHTML);
        }
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