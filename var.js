//setting useful func
const Var = new function(){
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
            if(element.dataset.variable==undefined)
                element.dataset.variable=element.innerHTML;
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
                        varName:varName,
                        firstTex:firstTex,
                        attrTex:doc.attributes[i].name,
                    });
                }
            }
        }

        //fiding childs prop
        for(let i=0;i<doc.children.length;i++){
            const childPropVar=this.findPropVar(doc.children[i]);

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
            data = doc.querySelectorAll("[data-prop-variable]");
            const returningData=[];

            for(let i=0;i<data.length;i++){
                const nowData=data[i];

                returningData.push({
                    element:nowData,
                    varName:nowData.dataset.propVariable,
                    firstTex:nowData.dataset.firstTex,
                    attrTex:nowData.dataset.attrTex
                });
            }

            return returningData;
        }
    }

    this.setVarProp=(doc)=>{
        const propVar=this.findPropVar(doc);

        for(let i=0;i<propVar.length;i++){
            const nowData=propVar[i];
            if(nowData.element.dataset.propVariable==undefined){
                nowData.element.dataset.propVariable=nowData.varName.replace(" ","");
                nowData.element.dataset.firstTex=nowData.firstTex;
                nowData.element.dataset.attrTex=nowData.attrTex;
                //nowData.element.getAttribute("onclick").value = nowData.firstTex.replace(`[${nowData.varName}]`,`__variable__`);
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
            const varName=variables[i].dataset.variable;
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
                element=varList[i];
                if(varList[i].dataset.variable==key)
                    element.innerHTML=myData;
            }
        }
    }

    this.initProp=(varPropList,key,value)=>{
        if(value.data!=undefined){

            //replace old data to new data
            for(let i=0;i<varPropList.length;i++){
                const nowData=varPropList[i];
                console.log(nowData.element.dataset.attrTex,nowData.element.dataset.firstTex.replace(`__variable__`,value.data));
                if(nowData.element.dataset.propVariable==key)
                    nowData.element.setAttribute(nowData.element.dataset.attrTex,nowData.element.dataset.firstTex.replace(`__variable__`,value.data));
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
        const nowName=varList[i].dataset.variable;
        VarInternal.detectVar(nowName);
    }
});