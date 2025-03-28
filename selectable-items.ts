import style from './selectable-items.css?raw';

const COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(style);

document.addEventListener('keydown', (event) =>
{
    if(SelectableItemsElement.multipleModifierKeys.indexOf(event.code) > -1)
    {
        SelectableItemsElement._multipleModifierActive = true;
        return;
    }
});
document.addEventListener('keyup', (event) =>
{
    if(SelectableItemsElement.multipleModifierKeys.indexOf(event.code) > -1)
    {
        SelectableItemsElement._multipleModifierActive = SelectableItemsElement.multipleModifierActive;
    }
});

function getSelectableItem(event: Event, reference: SelectableItemsElement)
{
    const pathItems = event.composedPath();
    let selectableItem = undefined;
    
    // find topmost item that is not a slot and
    // is not the selectable-items list
    for(let i = 0; i < pathItems.length; i++)
    {
        let pathItem = pathItems[i];
        // no need to check outside of parent list
        if(pathItem == reference) { break; }

        if(pathItem instanceof HTMLElement
        && (pathItem instanceof HTMLSlotElement) == false)
        {
            selectableItem = pathItem;
        }

    }
    return selectableItem;
}

const COMPONENT_TAG_NAME = 'selectable-items';
export class SelectableItemsElement extends HTMLElement
{
    static observedAttributes = [ ];

    // internal
    static _multipleModifierActive = false;

    // externally available to define when multiples are selected
    static multipleModifierKeys = [ 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight' ];
    static multipleModifierActive = false;

    static selectKeys = [ 'Enter', 'Space' ];

    static selectedClassName = 'selected';

    selected = <T = HTMLElement>() => {
        let slot = this.querySelector('slot');
        let target: HTMLElement = this;
        while(slot != null)
        {
            target = slot;
            slot = slot.querySelector('slot');
        }

        const targetChildren = (target instanceof HTMLSlotElement)
        ? target.assignedElements()
        : [...target.children];
        
        return targetChildren.filter(item => item instanceof HTMLElement && item.hasAttribute('aria-selected')) as T[];
    }
    constructor()
    {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot!.innerHTML = `<slot></slot>`;
        this.shadowRoot!.adoptedStyleSheets.push(COMPONENT_STYLESHEET);

        this.addEventListener('keydown', (event: Event|KeyboardEvent) =>
        {
            if(SelectableItemsElement.selectKeys.indexOf((event as KeyboardEvent).code) > -1)
            {
                const selectedChild = getSelectableItem(event, this);
                if(selectedChild == undefined) { return; }

                const defaultAllowed = this.#dispatchChange(selectedChild);
                if(defaultAllowed == false) { return; }
                event.preventDefault(); // prevent key's default function
                this.selectItem(selectedChild);

            }
        });
        this.addEventListener('click', (event) =>
        {
            const selectedChild = getSelectableItem(event, this);
            if(selectedChild == null) { return; }

            const defaultAllowed = this.#dispatchChange(selectedChild);
            if(defaultAllowed == false) { return; }

            this.selectItem(selectedChild);
        })

        this.shadowRoot!.querySelector('slot')!.addEventListener('slotchange', (event) =>
        {
            const children = (event.target as HTMLSlotElement).assignedElements();
            for(let i = 0; i < children.length; i++)
            {
                if(children[i].hasAttribute('tabIndex') == false)
                {
                    children[i].setAttribute('tabIndex', '0');
                }
            }
        });   
    }

    selectItem(item: HTMLElement)
    {
        // deselect items, if appropriate
        const allowMultipleAttribute = this.getAttribute('multiple') ?? this.getAttribute('multi');
        if(SelectableItemsElement._multipleModifierActive == false || allowMultipleAttribute == null)
        {
            // default to item.parentElement in case the selectable-items children are provided with a slot.
            const currentlySelected = [...(item.parentElement ?? this).children].reduce((selected, currentItem, _index) => 
            {
                if(currentItem.hasAttribute('aria-selected'))
                {
                    selected.push(currentItem);
                }
                return selected;
            }, new Array<Element>());
            currentlySelected.forEach(currentItem => this.#deselectItem(currentItem));
        }

        // select item
        this.#selectItem(item);

        return this.selected();
    }

    #selectItem(item: Element)
    {
        item.classList.add(this.getAttribute('selected-class-name') ?? SelectableItemsElement.selectedClassName);
        item.setAttribute('aria-selected', 'option');
    }
    #deselectItem(item: Element)
    {
        item.classList.remove(this.getAttribute('selected-class-name') ?? SelectableItemsElement.selectedClassName)
        item.removeAttribute('aria-selected');
    }

    #dispatchChange(selectedItem: Element)
    {
        const selected = new Set([selectedItem]);
        const allowMultipleAttribute = this.hasAttribute('multiple') || this.hasAttribute('multi');
        if(SelectableItemsElement._multipleModifierActive == true && allowMultipleAttribute == true)
        {
            for(const element of this.selected())
            {
                selected.add(element);
            }
        }
        // dispatch event
        const defaultAllowed = this.dispatchEvent(new CustomEvent('change', { 
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: { selected: Array.from(selected) }
        }));
        return defaultAllowed;
    }
}

if(customElements.get(COMPONENT_TAG_NAME) == null)
{
    customElements.define(COMPONENT_TAG_NAME, SelectableItemsElement);
}