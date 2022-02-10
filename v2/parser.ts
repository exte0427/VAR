namespace Var {

    export const dom = (tagName: string, states: Array<VarInternal.parser.virtualState>, ...childNodes: Array<VarInternal.parser.virtualDom>):VarInternal.parser.virtualDom => {
        return new VarInternal.parser.virtualDom(tagName, states, childNodes.flat(),``);
    }

    export const text = (value: string) => {
        return new VarInternal.parser.virtualDom(`text`,[],[],value);
    }

    export const state = (stateName: string, stateVal: any):VarInternal.parser.virtualState => {
        return new VarInternal.parser.virtualState(stateName, stateVal);
    }

    export const make = (key:string,data: any): void => {
        const newVar = new Var.varForm(key,data);

        //set data
        VarInternal.data.varList.push(newVar);
    }

    export class varForm {
        key: string;
        data: any;

        constructor(key_:string, data_: Function) {
            this.data = data_;
            this.key = key_;
        }

        getData(): string | VarInternal.parser.virtualDom {
            let returnData: string | VarInternal.parser.virtualDom;
            if (this.data instanceof Function)
                returnData = this.data();
            else
                returnData = this.data;
            
            return returnData;
        }
    }
}

namespace VarInternal{
    export namespace data{
        export const varList:Array<Var.varForm> = [];
    }

    export namespace parser {
        export class virtualState {
            attributeName: string;
            value: string;

            constructor(attributeName_: string, value_: string) {
                this.attributeName = attributeName_;
                this.value = value_;
            }
        }

        export class virtualDom {
            tagName: string;
            attributesList: Array<virtualState>;
            childList: Array<virtualDom>;
            value: string;

            constructor(tagName_: string, attributesList_: Array<virtualState>, childList_: Array<virtualDom>, value_: string) {
                this.tagName = tagName_;
                this.attributesList = attributesList_;
                this.childList = childList_;
                this.value = value_;
            }
        }

        export const getHtml = (): HTMLElement => {
            return <HTMLElement>document.querySelector(`html`);
        }

        export const parseText = (text: string): string => {
            let startNum: number = -1;
            let endNum: number = -1;

            for (let i = 0; i < text.length; i++) {
                const nowChar: string = <string>text[i];
                if (nowChar !== `\n` && nowChar !== ` `) {
                    startNum = i;
                    break;
                }
            }
        
            for (let i = text.length - 1; i >= 0; i--) {
                const nowChar: string = <string>text[i];
                if (nowChar !== `\n` && nowChar !== ` `) {
                    endNum = i;
                    break;
                }
            }

            if (startNum === -1 || endNum == -1)
                return ``;

            return text.slice(startNum, endNum + 1);
        }

        export const texToDom = (text: string): virtualDom => {
            return new virtualDom(`text`,[],[],text);
        }

        export const parseAttributes = (attributes: NamedNodeMap): Array<virtualState> => {
            const returningStates: Array<virtualState> = [];
            for (let i = 0; i < attributes.length; i++) {
                const nowAttribute = attributes[i];
                returningStates.push(new virtualState(nowAttribute.name, nowAttribute.value));
            }
        
            return returningStates;
        }

        export const parse = (element: HTMLElement | ChildNode | Element): virtualDom => {
            let tagName: string = ``;
            let attributes: Array<virtualState> = [];
            let children: Array<virtualDom> = [];
            let text: string = ``;

            if (element instanceof HTMLElement || element instanceof Element) {
                tagName = element.tagName.toLowerCase();
                attributes = parseAttributes(element.attributes);
                text = element.innerHTML;

                let nowNum: number = 0;
        
                for (let i = 0; i < element.childNodes.length; i++) {
                    let parsedData: virtualDom | undefined = undefined;
                
                    if (element.childNodes[i].nodeName == `#text`) {
                        if (parseText(<string>element.childNodes[i].nodeValue) !== ``)
                            parsedData = parse(element.childNodes[i]);
                        else
                            parsedData = new virtualDom(`text`,[],[],``);
                    }
                    else {
                        parsedData = parse(element.children[nowNum]);
                        nowNum++;
                    }
                
                    if (parsedData != undefined)
                        children.push(parsedData);
                }
            }
            else if (element != undefined) {
                tagName = `text`;
                text = parseText(<string>element.nodeValue);
            }
        
            return new virtualDom(tagName, attributes, children, text);
        }
    }

    export namespace main{
        export let firstData: parser.virtualDom | undefined = undefined;
        export let lastData: parser.virtualDom | undefined = undefined;
        export let nowData: parser.virtualDom | undefined = undefined;

        export let delList: Array<HTMLElement> = [];

        export const init = (): void => {
            firstData = parser.parse(parser.getHtml());

            nowData = firstData;
            lastData = firstData;
        }

        export const detectStart = (time:number): void => {
            setInterval(() => {

                //set now data
                nowData = detecter.subVar({ ...(<parser.virtualDom>firstData) });

                const maxData = <number>lastData?.childList.length > <number>nowData?.childList.length ? lastData?.childList : nowData?.childList;
                if (maxData) {
                    for (let i = 0; i < maxData.length;i++)
                        detecter.detect(parser.getHtml(), lastData?.childList[i], nowData?.childList[i], i);
                }

                delList.map(element => changer.del(element));
                delList = [];

                //set last data
                lastData = nowData;

            },time)
        }
    }

    export namespace changer {
        export const make = (data: parser.virtualDom): HTMLElement|Text => {
            if (data.tagName == `text`)
                return document.createTextNode(data.value);
            else {
                const myDom: HTMLElement = document.createElement(data.tagName);

                data.attributesList.map(element => {
                    myDom.setAttribute(element.attributeName, element.value);
                });

                /*data.childList.map(element => {
                    myDom.append(make(element));
                });*/

                return myDom;
            }
        }

        export const add = (parent: HTMLElement, data: parser.virtualDom): void => {
            parent.appendChild(make(data));
        }

        export const del = (data: HTMLElement): void => {
            data.remove();
        }

        export const change = (parent: HTMLElement, target: HTMLElement, newData: parser.virtualDom): void => {
            parent.replaceChild(make(newData),target);
        }

        export const attrChange = (target: HTMLElement, lastAttr: Array<parser.virtualState>, nowAttr: Array<parser.virtualState>): void => {
            nowAttr.map((element) => {
                if (lastAttr.find(e => e.attributeName === element.attributeName) == undefined)
                    target.setAttribute(element.attributeName,element.value);
                if (element.value !== lastAttr.find(e => e.attributeName === element.attributeName)?.value)
                    target.setAttribute(element.attributeName,element.value);
            });
        }
    }

    export namespace detecter{
        export const subVar = (target: parser.virtualDom): parser.virtualDom => {

            let newValue: parser.virtualDom = target;
            
            // if variable dom
            const nowData:Var.varForm|undefined = data.varList.find(element => element.key === newValue.tagName);
            if (nowData != undefined) {
                const data: parser.virtualDom|string = nowData.getData();
                let returningData: any;
                
                if (data instanceof parser.virtualDom)
                    returningData = subVar(data);
                else
                    returningData = parser.texToDom(data);
                
                if (!(returningData instanceof Array))
                    returningData = [returningData];
                
                return new parser.virtualDom(target.tagName,target.attributesList,returningData,`none`);
            }
            // if last dom
            else if (newValue.childList.length == 0)
                return newValue;
            
            //else discover children
            const childNode: Array<parser.virtualDom> = newValue.childList.map(element => subVar(element));

            return new parser.virtualDom(newValue.tagName, newValue.attributesList,childNode,newValue.value);
        }

        export const detect = (parent: HTMLElement, lastData: parser.virtualDom | undefined, nowData: parser.virtualDom | undefined, index: number): void => {

            const target: HTMLElement = <HTMLElement>(parent.childNodes[index]);
            
            if (!lastData && !nowData)
                console.error(`unexpected error`);
            else if (!lastData && nowData)
                changer.add(parent, nowData);
            
            else if (lastData && !nowData) {
                main.delList.push(target);
                return;
            }

            else if (lastData?.tagName !== nowData?.tagName) {
                changer.change(parent, target, <parser.virtualDom>nowData);
            }
                
            else if (lastData?.tagName === `text` && nowData?.tagName === `text` && lastData.value != nowData.value)
                changer.change(parent, target, <parser.virtualDom>nowData);
            
            else if (lastData?.tagName === nowData?.tagName && lastData?.tagName != `text`)
                changer.attrChange(target, <Array<parser.virtualState>>lastData?.attributesList, <Array<parser.virtualState>>nowData?.attributesList);
            
            const maxData:Array<parser.virtualDom>|undefined = <number>(lastData?.childList.length) > <number>(nowData?.childList.length) ? lastData?.childList : nowData?.childList;

            if (maxData!==undefined) {
                for (let i = 0; i < maxData.length; i++) {
                    detect(<HTMLElement>(parent.childNodes[index]), lastData?.childList[i], nowData?.childList[i], i);
                }
            }
            
        }
    }
}

VarInternal.main.init();
VarInternal.main.detectStart(10);