import '../vanilla/selectable-items.js';
const COMPONENT_TAG_NAME = 'shadow-wrapper';
export class ShadowWrapperElement extends HTMLElement
{
    constructor()
    {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<selectable-items multi part="items">
                            <slot></slot>
                        </selectable-items>`;
    }
}

if(customElements.get(COMPONENT_TAG_NAME) == null)
{
    customElements.define(COMPONENT_TAG_NAME, ShadowWrapperElement);
}