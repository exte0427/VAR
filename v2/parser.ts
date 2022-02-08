namespace Var {

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

        getData(): string {
            if (this.data instanceof Function) {
                return this.data().toString();
            }
            else
                return this.data.toString();
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
                        if (parseText(<string>element.childNodes[i].nodeValue) !== ``) {
                            parsedData = parse(element.childNodes[i]);
                        }
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
        export let firstData: parser.virtualDom;
        export let lastData: parser.virtualDom | undefined = undefined;
        export let nowData: parser.virtualDom | undefined = undefined;

        export const init = (): void => {
            firstData = parser.parse(parser.getHtml());

            nowData = firstData;
            lastData = firstData;
        }

        export const detectStart = (time:number): void => {
            setInterval(() => {

                //set now data
                nowData = detecter.subVar(firstData);

                //detect start
                detecter.detect(parser.getHtml(),lastData,nowData);

                //set last data
                lastData = firstData;

            },time)
        }
    }

    export namespace changer {
        export const make = (data: parser.virtualDom): HTMLElement => {
            const myDom: HTMLElement = document.createElement(data.tagName);

            data.attributesList.forEach(element => {
                myDom.setAttribute(element.attributeName,element.value); 
            });

            data.childList.forEach(element => {
                myDom.append(make(element)); 
            });

            return myDom;
        }

        export const add = (parent: HTMLElement, data: parser.virtualDom): void => {
            parent.append(make(data));
        }

        export const del = (data: parser.virtualDom): void => {
            make(data).remove();
        }

        export const change = (parent: HTMLElement, oldData: parser.virtualDom, newData: parser.virtualDom): void => {
            del(oldData);
            add(parent, newData);
        }

        export const attrChange = (target: HTMLElement, lastAttr: Array<parser.virtualState>, nowAttr: Array<parser.virtualState>):void => {
            nowAttr.forEach((element, i) => {
                if (lastAttr.find(e => e.attributeName === element.attributeName) == undefined)
                    target.setAttribute(element.attributeName,element.value);
                if (element.value !== lastAttr.find(e => e.attributeName === element.attributeName)?.value)
                    target.setAttribute(element.attributeName,element.value);
            });
        }
    }

    export namespace detecter{
        export const subVar = (target: parser.virtualDom):parser.virtualDom => {
            
            // if variable dom
            const nowData:Var.varForm|undefined = data.varList.find(element => element.key === target.tagName);
            if (nowData != undefined) {
                const data: any = nowData.getData();
                
                if (data instanceof parser.virtualDom)
                    return subVar(data);
                else
                    return parser.texToDom(data);
            }
            // if last dom
            else if (target.childList.length == 0)
                return target;

            let newValue: parser.virtualDom = target;
            
            //else discover children
            target.childList.forEach((element,index) => {
                target.childList[index] = subVar(element); 
            });

            return newValue;
        }

        export const detect = (target: HTMLElement, lastData: parser.virtualDom | undefined, nowData: parser.virtualDom | undefined): void => {

            if (lastData === undefined)
                changer.add(target, <parser.virtualDom>nowData);
            else if (nowData === undefined)
                changer.del(<parser.virtualDom>lastData);
            else if (lastData.tagName !== nowData.tagName)
                changer.change(target, lastData, nowData);
            else if (lastData.attributesList !== nowData.attributesList)
                changer.attrChange(target, lastData.attributesList, nowData.attributesList);
            
            const maxLength: number = Math.max((<number>lastData?.childList.length), (<number>nowData?.childList.length));
            for (let i = 0; i < maxLength; i++){
                detect(<HTMLElement>target.childNodes[i],lastData?.childList[i],nowData?.childList[i]);
            }
        }
    }
}

VarInternal.main.init();
VarInternal.main.detectStart(10);