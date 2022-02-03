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
        type: string;
        state: Array<virtualState>;
        children: Array<virtualDom>;

        constructor(type_: string, state_: Array<virtualState>, children_: Array<virtualDom>) {
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
        
        for (let i = 0; i < element.children.length; i++)
            children.push(parseElement(element.children[i]));
        
        return new virtualDom(tagName,attributes,children);
    }
}