// selectable-items.css?raw
var selectable_items_default = ":host { user-select: none; }\r\n::slotted(*)\r\n{\r\n    user-select: none;\r\n    cursor: pointer;\r\n}\r\n::slotted(:hover)\r\n{\r\n    background-color: var(--background-color-hover, rgb(221, 221, 221));\r\n}\r\n::slotted([aria-selected])\r\n{\r\n    background-color: var(--background-color-selected, highlight);\r\n    color: var(--color-selected, highlighttext);\r\n}\r\n@media (prefers-color-scheme: dark) \r\n{\r\n    ::slotted(:hover)\r\n    {\r\n        --background-color-hover: rgb(197, 197, 197);\r\n    }\r\n}";

// selectable-items.ts
var COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(selectable_items_default);
document.addEventListener("keydown", (event) => {
  if (SelectableItemsElement.multipleModifierKeys.indexOf(event.code) > -1) {
    SelectableItemsElement._multipleModifierActive = true;
    return;
  }
});
document.addEventListener("keyup", (event) => {
  if (SelectableItemsElement.multipleModifierKeys.indexOf(event.code) > -1) {
    SelectableItemsElement._multipleModifierActive = SelectableItemsElement.multipleModifierActive;
  }
});
var COMPONENT_TAG_NAME = "selectable-items";
var SelectableItemsElement = class _SelectableItemsElement extends HTMLElement {
  static observedAttributes = [];
  // internal
  static _multipleModifierActive = false;
  // externally available to define when multiples are selected
  static multipleModifierKeys = ["ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight"];
  static multipleModifierActive = false;
  static selectKeys = ["Enter", "Space"];
  static selectedClassName = "selected";
  selected = () => [...this.querySelectorAll(`[aria-selected]`)];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<slot></slot>`;
    this.shadowRoot.adoptedStyleSheets.push(COMPONENT_STYLESHEET);
    this.addEventListener("keydown", (event) => {
      if (_SelectableItemsElement.selectKeys.indexOf(event.code) > -1) {
        const selectedChild = event.composedPath().find((item) => item instanceof HTMLElement && item.parentElement == this);
        const defaultAllowed = this.#dispatchChange(selectedChild);
        if (defaultAllowed == false) {
          return;
        }
        event.preventDefault();
        this.selectItem(selectedChild);
      }
    });
    this.addEventListener("click", (event) => {
      const selectedChild = event.composedPath().find((item) => item instanceof HTMLElement && item.parentElement == this);
      if (selectedChild == null) {
        return;
      }
      const defaultAllowed = this.#dispatchChange(selectedChild);
      if (defaultAllowed == false) {
        return;
      }
      this.selectItem(selectedChild);
    });
    this.shadowRoot.querySelector("slot").addEventListener("slotchange", (event) => {
      const children = event.target.assignedElements();
      for (let i = 0; i < children.length; i++) {
        if (children[i].hasAttribute("tabIndex") == false) {
          children[i].setAttribute("tabIndex", "0");
        }
      }
    });
  }
  selectItem(item) {
    const allowMultipleAttribute = this.getAttribute("multiple") ?? this.getAttribute("multi");
    if (_SelectableItemsElement._multipleModifierActive == false || allowMultipleAttribute == null) {
      const currentlySelected = [...(item.parentElement ?? this).children].reduce((selected, currentItem, _index) => {
        if (this.contains(currentItem) && currentItem.hasAttribute("aria-selected")) {
          selected.push(currentItem);
        }
        return selected;
      }, new Array());
      currentlySelected.forEach((currentItem) => this.#deselectItem(currentItem));
    }
    this.#selectItem(item);
    return this.selected();
  }
  #selectItem(item) {
    item.classList.add(this.getAttribute("selected-class-name") ?? _SelectableItemsElement.selectedClassName);
    item.setAttribute("aria-selected", "option");
  }
  #deselectItem(item) {
    item.classList.remove(this.getAttribute("selected-class-name") ?? _SelectableItemsElement.selectedClassName);
    item.removeAttribute("aria-selected");
  }
  #dispatchChange(selectedItem) {
    const selected = /* @__PURE__ */ new Set([selectedItem]);
    const allowMultipleAttribute = this.hasAttribute("multiple") || this.hasAttribute("multi");
    if (_SelectableItemsElement._multipleModifierActive == true && allowMultipleAttribute == true) {
      for (const element of this.selected()) {
        selected.add(element);
      }
    }
    const defaultAllowed = this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { selected: Array.from(selected) }
    }));
    return defaultAllowed;
  }
};
if (customElements.get(COMPONENT_TAG_NAME) == null) {
  customElements.define(COMPONENT_TAG_NAME, SelectableItemsElement);
}
export {
  SelectableItemsElement
};
