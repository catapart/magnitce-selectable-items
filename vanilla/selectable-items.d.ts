declare class SelectableItemsElement extends HTMLElement {
    #private;
    static observedAttributes: never[];
    static _multipleModifierActive: boolean;
    static multipleModifierKeys: string[];
    static multipleModifierActive: boolean;
    static selectKeys: string[];
    static selectedClassName: string;
    selected: <T = HTMLElement>() => T[];
    constructor();
    selectItem(item: HTMLElement): void;
}

export { SelectableItemsElement };
