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

        this.addEventListener('keydown', (event: Event|KeyboardEvent) =>
        {
            if(SelectableItemsElement.selectKeys.indexOf((event as KeyboardEvent).code) > -1)
            {
                const selectedChild = event.composedPath()
                .find(item => item instanceof HTMLElement 
                && item.parentElement == this) as HTMLElement;

                this.selectItem(selectedChild);
            }
        });
        this.addEventListener('click', (event) =>
        {
            const selectedChild = event.composedPath()
            .find(item => item instanceof HTMLElement 
            && item.parentElement == this) as HTMLElement;

            if(selectedChild == null) { return; }
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

        // dispatch event
        const defaultAllowed = this.dispatchEvent(new Event('change'));
        if(defaultAllowed == false) { return; }

        // deselect items, if appropriate
        const allowMultipleAttribute = this.getAttribute('multiple') ?? this.getAttribute('multi');
        if(SelectableItemsElement._multipleModifierActive == false || allowMultipleAttribute == null)
        {
            // default to item.parentElement in case the selectable-items children are provided with a slot.
            const currentlySelected = [...(item.parentElement ?? this).children].reduce((selected, currentItem, _index) => 
            {
                if(this.contains(currentItem) && currentItem.hasAttribute('aria-selected'))
                {
                    selected.push(currentItem);
                }
                return selected;
            }, new Array<Element>());
            currentlySelected.forEach(currentItem => this.#deselectItem(currentItem));
        }

        // select item
        this.#selectItem(item);
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
}

if(customElements.get(COMPONENT_TAG_NAME) == null)
{
    customElements.define(COMPONENT_TAG_NAME, SelectableItemsElement);
}