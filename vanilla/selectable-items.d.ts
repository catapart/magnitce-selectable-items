declare class SelectableItemsElement extends HTMLElement {
    static observedAttributes: never[];
    static _multipleModifierActive: boolean;
    static multipleModifierKeys: string[];
    static multipleModifierActive: boolean;
    static selectKeys: string[];
    static selectedClassName: string;
    selected: <T = HTMLElement>() => T[];
    handledItems: WeakSet<Element>;
    constructor();
    selectItem(item: HTMLElement): void;
}

export { SelectableItemsElement };
