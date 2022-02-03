namespace parser {
    export class virtualState{
        type: string;
        value: any;

        constructor(type_: string, value_: any) {
            this.type = type_;
            this.value = value_;
        }
    }

    export class virtualDom {
        text: string;
        type: string;
        state: Array<virtualState>;
        children: Array<virtualDom>;

        constructor(type_: string, state_: Array<virtualState>, children_: Array<virtualDom>,text_:string) {
            this.text = text_;
            this.type = type_;
            this.state = state_;
            this.children = children_;
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

    export const parseElement = (element: HTMLElement|Element): virtualDom => {
        const tagName: string = element.tagName;
        const attributes: Array<virtualState> = parseAttributes(element.attributes);
        const children: Array<virtualDom> = [];
        const text: string = element.innerHTML;
        
        for (let i = 0; i < element.children.length; i++)
            children.push(parseElement(element.children[i]));
        
        return new virtualDom(tagName,attributes,children,text);
    }

    export const createChild = (dom: virtualDom, target: HTMLElement|Element): void => {
        const myNode: Node = document.createElement(dom.type);
        
        //last dom
        if (dom.children.length === 0) {
            const textNode: Node = document.createTextNode(dom.text);
            myNode.appendChild(textNode);
        }        
        
        target.appendChild(myNode);
        dom.children.map(element => createChild(element, target.children[0]));
        
    }

    export const renderAttributes = (lastProps: Array<virtualState>,changedProps: Array<virtualState>,target: HTMLElement): void => {
        changedProps.forEach((element: virtualState) => {
            const lastData: virtualState|undefined = lastProps.find(prop=>prop.type===element.type);
            const changedData: virtualState = element;

            //add new data
            if (lastData == undefined)
                target.setAttribute(changedData.type, changedData.value);
            
            //change data
            else if (lastData.value !== changedData.value)
                target.setAttribute(changedData.type, changedData.value);
            
        });

        lastProps.forEach((element: virtualState) => {
            const lastData: virtualState = element;
            const changedData: virtualState|undefined = changedProps.find(prop=>prop.type===element.type);

            //delete data
            if (changedData == undefined)
                target.removeAttribute(lastData.type);
        });
    }

    export const render = (lastDom: virtualDom, changedDom: virtualDom, target: HTMLElement): void => {

        //delete
        if (changedDom == undefined) {
            target.parentElement?.removeChild(target);
        }

        //add
        if (lastDom == undefined) {
            createChild(changedDom,<HTMLElement>target.parentElement);
        }

        //same tag
        if (lastDom.type === changedDom.type) {
            renderAttributes(lastDom.state,changedDom.state,target);
        }

        //different tag
        if (lastDom.type !== changedDom.type) {
            createChild(changedDom,<HTMLElement>target.parentElement);
        }
    }
}