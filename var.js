//setting useful func
const Var = ()=>{

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

    this.init=(varHTML,varList,key,value)=>{
        //in varHTML, find <variable>
        const num=varHTML.findIndex(element=>element==key);

        if(num!=-1){
            if(Array.isArray(value.data)){
                varList[num].innerHTML="";
                value.data.forEach(element=>varList[num].innerHTML+=value.render);
            }
            else
                varList[num].innerHTML=value.data;
            
            //new
            const newHtml=varList[num].children;
            for(let i=0;i<newHtml.length;i++){

                //set
                const myVarList = VarInternal.getVar(newHtml[i]);
                const myVarHtml=this.getName(myVarList);

                if(myVarList.length!=0){
                    myVarHtml.forEach(element=>{

                        // if this.element
                        const regex= new RegExp("this.*");
                        if(regex.test(element)){
                            const realName=element.replace("this.","");
                            this.init(myVarHtml,myVarList,element,{data:value.data[i][realName]});
                        }

                        //common variable
                        else
                            this.init(myVarHtml,myVarList,element,{data:dataStorge[element]});
                    });
                }
            } 
        }
    }
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

    Object.defineProperty(this,nowName,{
        get(){
            return dataStorge[nowName];
        },
        set(newValue){
            //render
            if(newValue.render)
                dataStorge[nowName]={data:dataStorge[nowName].data,render:newValue.render};
            //data
            else
                dataStorge[nowName]={data:newValue,render:dataStorge[nowName].render};
        },
    });
}