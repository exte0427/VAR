//setting useful func
const Var = new function(){
    this.render=(element,renderTex)=>{
        const nowName=VarInternal.varToString({element});
        dataStorge[nowName]={data:VarInternal.findData(nowName),render:renderTex};
    }
}

//internal func
const VarInternal=new function(){
    this.parser = new DOMParser();
    this.getVar=(doc)=>{
        let varList=doc.querySelectorAll("var");

        //changing var tag to variable tag
        for(let i=0;i<varList.length;i++){
            const nowElement=varList[i];
            const newTag=document.createElement("variable");

            newTag.innerHTML=nowElement.innerHTML;
            nowElement.parentNode.replaceChild(newTag,nowElement);
        }

        //changing varList var->variable
        varList=doc.querySelectorAll("variable");

        //returning data
        return varList;
    }

    this.getName=(VarList)=>{
        //getting variable names
        let varHTML=[];
        for(let i=0;i<VarList.length;i++)
            varHTML.push(VarList[i].innerHTML);
        
        //returning data
        return varHTML;
    }

    this.dataAnalyzer=(element,value)=>{
        //varriable , array
        let nowData=value.data;
        if(Array.isArray(value.data))
            nowData=nowData[i];

        // if this.element
        let retunringData=undefined;
        const regex= new RegExp("this.*");

        if(regex.test(element)){
            const realName=element.replace("this.","");
            if(realName=="data")
                retunringData=nowData
            else
                retunringData=nowData[realName];
        }

        //common variable
        else
            retunringData=dataStorge[element];

        return retunringData;
    }

    this.init=(varHTML,varList,key,value)=>{

        //in varHTML, find <variable>
        const num=varHTML.findIndex(element=>element==key);
        if(num!=-1){
            if(value.render!=""){
                if(Array.isArray(value.data)){
                    varList[num].innerHTML="";
                    value.data.forEach(element=>varList[num].innerHTML+=value.render);
                }
                else
                    varList[num].innerHTML=value.render;
            }
            else{
                if(Array.isArray(value.data)){
                    varList[num].innerHTML="";
                    value.data.forEach(element=>varList[num].innerHTML+=element);
                }
                else
                    varList[num].innerHTML=value.data;
            }
            //new
            const newHtml=varList[num].children;
            for(let i=0;i<newHtml.length;i++){

                //set
                const myVarList = VarInternal.getVar(newHtml[i]);
                const myVarHtml=this.getName(myVarList);

                if(myVarList.length!=0){
                    myVarHtml.forEach(element=>{
                        const data=this.dataAnalyzer(element,value);
                        const dataForm= {data:data,render:""};

                        this.init(myVarHtml,myVarList,element,dataForm);
                    });
                }
            } 
        }
        else
            console.warn(`there's no ${key} variable in html script`);
    }
    this.findData = name => dataStorge[name]==undefined ? undefined : dataStorge[name].data;
    this.varToString = varObj => Object.keys(varObj)[0];
};

//starting work
const varList=VarInternal.getVar(document);
const varHTML=VarInternal.getName(varList);

//start changing string to certain value
var dataStorge = new Proxy({}, {
    set: function (target, key, value) {
        //init
        VarInternal.init(varHTML,varList,key,value);

        //apply value changing
        target[key] = value;
    }
});

for(let i=0;i<varHTML.length;i++){
    const nowName=varHTML[i];
    dataStorge[nowName]={data:undefined,render:""};

    //gearing variables and dataStorge
    Object.defineProperty(this,nowName,{
        configurable: true,
        get(){
            return dataStorge[nowName].data;
        },
        set(newValue){
            dataStorge[nowName]={data:newValue,render:dataStorge[nowName].render};
        },
    });
}
