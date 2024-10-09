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

    selected = <T = HTMLElement>() => [...this.querySelectorAll(`.${SelectableItemsElement.selectedClassName}`)] as T[];

    handledItems: WeakSet<Element> = new WeakSet();

    constructor()
    {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot!.innerHTML = `<slot></slot>`;
        this.shadowRoot!.adoptedStyleSheets.push(COMPONENT_STYLESHEET);

        this.shadowRoot!.querySelector('slot')!.addEventListener('slotchange', (event) =>
        {
            const children = (event.target as HTMLSlotElement).assignedElements();
            for(let i = 0; i < children.length; i++)
            {
                if(this.handledItems.has(children[i]))
                {
                    continue;
                }
                children[i].setAttribute('tabIndex', '0');
                children[i].addEventListener('keydown', (event: Event|KeyboardEvent) => {
                    if(SelectableItemsElement.selectKeys.indexOf((event as KeyboardEvent).code) > -1)
                    {
                        this.selectItem(event.currentTarget as HTMLElement)
                    }
                })
                children[i].addEventListener('click', (event) =>
                {
                    this.selectItem(event.currentTarget as HTMLElement)
                })
            }
        });   
    }

    selectItem(item: HTMLElement)
    {
        if(item.parentNode != this) { console.info("Unable to select an item that is not a child of this element."); return; }

        // deselect items, if appropriate
        const allowMultipleAttribute = this.getAttribute('multiple') ?? this.getAttribute('multi');
        if(SelectableItemsElement._multipleModifierActive == false || allowMultipleAttribute == null)
        {
            const currentlySelected = [...this.children].reduce((selected, currentItem, _index) => 
            {
                if(currentItem.classList.contains(SelectableItemsElement.selectedClassName))
                {
                    selected.push(currentItem);
                }
                return selected;
            }, new Array<Element>());
            currentlySelected.forEach(currentItem => currentItem.classList.remove(SelectableItemsElement.selectedClassName));
        }

        // select item
        item.classList.add(SelectableItemsElement.selectedClassName);

        // dispatch event
        this.dispatchEvent(new Event('change'));
    }
}

if(customElements.get(COMPONENT_TAG_NAME) == null)
{
    customElements.define(COMPONENT_TAG_NAME, SelectableItemsElement);
}