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

        constructor(key_:string, data_:any) {
            this.data = data_;
            this.key = key_;
        }

        getData(...args: any[]): string | VarInternal.parser.virtualDom {
            let returnData: string | VarInternal.parser.virtualDom;
            if (this.data instanceof Function)
                returnData = this.data(...args);
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
            let startNum = -1;
            let endNum = -1;

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

            const children: Array<virtualDom> = [];
            let tagName = ``;
            let attributes: Array<virtualState> = [];
            let text = ``;

            if (element instanceof HTMLElement || element instanceof Element) {
                tagName = element.tagName.toLowerCase();
                attributes = parseAttributes(element.attributes);
                text = element.innerHTML;

                const nowChild = html.getChild(element);

                for (let i = 0; i < nowChild.length; i++) {
                    children.push(parse(nowChild[i]));
                }
            }
            else if (element != undefined) {
                tagName = `text`;
                text = parseText(<string>element.nodeValue);
            }
        
            return new virtualDom(tagName, attributes, children, text);
        }
    }

    export namespace template{
        export const calcVar = (oldText:string) => {
            let newText = ``;
            const startVar: Array<number> = [];

            for (let i = 0; i < oldText.length; i++){
                const nowChar = oldText.charAt(i);
                const nextChar = oldText.charAt(i + 1);

                if (nowChar === `<` && nextChar === `-`)
                    startVar.push(i);
                    
                if (nowChar === `-` && nextChar === `>`) {
                    const startNum = startVar[startVar.length - 1];
                    const endNum = i+1;
                    const varName = oldText.slice(startNum, endNum + 1);

                    startVar.pop();
                    newText = newText.slice(0, startNum);
                    newText += `\${${varName.replace(`<-`,``).replace(`->`,``)}}`;

                    i++;
                    continue;
                }
                    
                newText += nowChar;
            }
            return newText;
        }

        export const templateMake = (data: parser.virtualDom): string => {

            const name = data.tagName;
            const stateCodes = data.attributesList.map(state => `Var.state("${state.attributeName}",\`${calcVar(state.value)}\`)`);
            const code: Array<string> = [];

            data.childList.map(element => {
                
                const childData = templateMake(element);
                code.push(childData);
            });

            if (name === `text`)
                return `Var.text(\`${calcVar(data.value)}\`)`;
            else
                return `Var.dom("${name}",[${stateCodes.join(`,`)}],${code.join(`,`)})`;
        }

        export const parse = (data: parser.virtualDom): void => {
            if (data.tagName === `var`) {
                const name = data.attributesList[0].attributeName;
                const args = data.attributesList.splice(1).map(element=>element.attributeName).join(`,`);

                Var.make(name, new Function(args, `return ${templateMake(data)}`));
            }
            
            data.childList.map(element => {
                parse(element); 
            });
        }

        export const except = (data: parser.virtualDom): parser.virtualDom | undefined => {
            if (data.tagName === `var`)
                return undefined;
            else {
                const children: Array<parser.virtualDom> = [];
                data.childList.map(element => {
                    const nowData = except(element);

                    if (nowData !== undefined)
                        children.push(nowData);
                });
                const newData = new parser.virtualDom(data.tagName,data.attributesList,children,data.value);
                return newData;
            }
        }
    }

    export namespace html{
        export const getChild = (parent:ChildNode|Document|HTMLElement): Array<ChildNode> => {
            const childList = [];

            for (let i = 0; i < parent.childNodes.length; i++){
                const child = parent.childNodes[i];
                if (child.nodeValue === null || parser.parseText(<string>child.nodeValue) !== ``)
                    childList.push(child);
            }

            return childList;
        }
    }

    export namespace main{
        export let firstData: parser.virtualDom | undefined = undefined;
        export let lastData: parser.virtualDom | undefined = undefined;
        export let nowData: parser.virtualDom | undefined = undefined;

        export let delList: Array<HTMLElement> = [];

        export const init = (): void => {
            //start
            console.log(`Var.js`);

            firstData = parser.parse(parser.getHtml());
            template.parse(firstData);

            lastData = firstData;
            firstData = template.except(firstData);
            nowData = firstData;
        }

        export const detectStart = (time:number): void => {
            setInterval(() => {

                //set now data
                nowData = detecter.subVar({ ...(<parser.virtualDom>firstData) });

                detecter.detect(document, lastData, nowData, 1);

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

            const newValue = target;
            // if variable dom
            const nowData: Var.varForm | undefined = data.varList.find(element => element.key === newValue.tagName);
            
            if (nowData != undefined) {
                const attributeValue = newValue.attributesList.filter(data => data.value === ``).map(data => data.attributeName);
                const data: parser.virtualDom|string = nowData.getData(...attributeValue);
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

        export const detect = (parent: HTMLElement | Document, lastData: parser.virtualDom | undefined, nowData: parser.virtualDom | undefined, index: number): void => {
            
            if (parent instanceof HTMLElement) {
                const target: HTMLElement = <HTMLElement>(html.getChild(parent)[index]);
                
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
                    return;
                }
                
                else if (lastData?.tagName === `text` && nowData?.tagName === `text` && lastData.value != nowData.value) {
                    changer.change(parent, target, <parser.virtualDom>nowData);
                    return;
                }
            
                else if (lastData?.tagName === nowData?.tagName && lastData?.tagName != `text`)
                    changer.attrChange(target, <Array<parser.virtualState>>lastData?.attributesList, <Array<parser.virtualState>>nowData?.attributesList);
            }
            const maxData:Array<parser.virtualDom>|undefined = <number>(lastData?.childList.length) > <number>(nowData?.childList.length) ? lastData?.childList : nowData?.childList;

            if (maxData !== undefined) {
                for (let i = 0; i < maxData.length; i++) {
                    const nowElement = html.getChild(parent)[index];
                    detect(<HTMLElement>(nowElement), lastData?.childList[i], nowData?.childList[i], i);
                }
            }
            
        }
    }
}

VarInternal.main.init();
VarInternal.main.detectStart(2000);