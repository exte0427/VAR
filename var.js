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
        
        //changing varList var->variable
        const varList=doc.querySelectorAll("variable");
        for(let i=0;i<varList.length;i++){
            const element=varList[i];
            if(element.dataset.variable==undefined)
                element.dataset.variable=element.innerHTML;
        }

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

    this.valueProcess=value=>{
        //if no renderer just return data
        if(value.render=="")
            return this.htmlProcess(value.data);

        //if it has renderer, return renderer
        else
            return this.htmlProcess(value.render);
    }

    // [ -> <variable> , ] -> </variable>
    this.htmlProcess=html=>{
        if(typeof html != `string`)
            return html;

        const returnHtml=html.replaceAll("[","<variable>").replaceAll("]","</variable>");

        return returnHtml;
    }

    //put the values of certain variables in [variable]
    this.change=myData=>{

        //parse data
        const dataHtml=this.parser.parseFromString(this.htmlProcess(myData),`text/html`).getElementsByTagName("body")[0];
        const variables=this.getVar(dataHtml);

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

    this.detectVar=(nowName,data)=>{
        console.log(nowName)
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

    //start changing string to certain value
    dataStorge = new Proxy({}, {
        set: function (target, key, value) {
            //init
            varList=VarInternal.getVar(document);
            VarInternal.init(varList,key,value);

            //apply value changing
            target[key] = value;
        }
    });

    for(let i=0;i<varList.length;i++){
        const nowName=varList[i].dataset.variable;
        VarInternal.detectVar(nowName);
    }
});