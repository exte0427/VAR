export namespace parser {
    export class virtualState{
        attributeName: string;
        value: string;

        constructor(attributeName_: string, value_:string) {
            this.attributeName = attributeName_;
            this.value = value_;
        }
    }

    export class virtualDom{
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

    export const parseAttributes = (attributes: NamedNodeMap): Array<virtualState> => {
        const returningStates: Array<virtualState> = [];
        for (let i = 0; i < attributes.length; i++){
            const nowAttribute = attributes[i];
            returningStates.push(new virtualState(nowAttribute.name,nowAttribute.value));
        }
        
        return returningStates;
    }

    export const parse = (element: HTMLElement|ChildNode|Element): virtualDom => {
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
                
                if (element.childNodes[i].nodeName == `#text`){
                    if ((<string>element.childNodes[i].nodeValue).replaceAll(`\n`, ``).replaceAll(` `, ``) != ``) {
                        parsedData = parse(element.childNodes[i]);
                    }
                }
                else {
                    parsedData = parse(element.children[nowNum]);
                    nowNum++;
                }
                
                if(parsedData!=undefined)
                    children.push(parsedData);
            }
        }
        else {
            tagName = `text`;
            text = (<string>element.nodeValue).replaceAll(`\n`, ``).replaceAll(` `, ``);
        }
        
        return new virtualDom(tagName,attributes,children,text);
    }
}