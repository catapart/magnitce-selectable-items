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

    // handledItems: WeakSet<Element> = new WeakSet();

    constructor()
    {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot!.innerHTML = `<slot></slot>`;
        this.shadowRoot!.adoptedStyleSheets.push(COMPONENT_STYLESHEET);


        this.addEventListener('click', (event: Event) =>
        {
            let item: HTMLElement|undefined;
            const composedPath = event.composedPath();
            for(let i = 0; i < composedPath.length; i++)
            {
                const element = composedPath[i] as HTMLElement;
                if(element.parentElement == this)
                {
                    item = (element.tagName == 'SLOT')
                    ? (element as HTMLSlotElement).assignedElements().find(slotChild => composedPath.indexOf(slotChild) > -1) as HTMLElement
                    : element;
                }
            }
            if(item == null) { return; }
            this.selectItem(item);
        });
        this.addEventListener('keydown', (event) =>
        {
            if(SelectableItemsElement.selectKeys.indexOf((event as KeyboardEvent).code) > -1)
            {
                this.selectItem(event.target as HTMLElement);
                event.preventDefault();
            }
        });

        this.shadowRoot!.querySelector('slot')!.addEventListener('slotchange', (event) =>
        {
            const children = (event.target as HTMLSlotElement).assignedElements();
            for(let i = 0; i < children.length; i++)
            {
                if(children[i].hasAttribute('tabIndex'))
                {
                    continue;
                }
                children[i].setAttribute('tabIndex', '0');
                // this.handledItems.add(children[i]);
            }
        });   
    }

    selectItem(item: HTMLElement)
    {
        // if(item.parentNode != this) { console.info("Unable to select an item that is not a child of this element."); return; }

        // deselect items, if appropriate
        const allowMultipleAttribute = this.getAttribute('multiple') ?? this.getAttribute('multi');
        if(SelectableItemsElement._multipleModifierActive == false || allowMultipleAttribute == null)
        {
            // default to item.parentElement in case the selectable-items children are provided with a slot.
            const currentlySelected = [...(item.parentElement ?? this).children].reduce((selected, currentItem, _index) => 
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