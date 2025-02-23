# magnitce-selectable-items
A custom `HTMLElement` that makes all of its child elements selectable by clicking on them.

Package size: ~3kb minified, ~4kb verbose.

## Quick Reference
```html
<script type="module" src="/path/to/selectable-items[.min].js"></script>
```

## Demos
https://catapart.github.io/magnitce-selectable-items/demo/

## Support
- Firefox
- Chrome
- Edge
- <s>Safari</s> (Has not been tested; should be supported, based on custom element support)

## Getting Started
 1. [Install/Reference the library](#referenceinstall)

### Reference/Install
#### HTML Import (not required for vanilla js/ts; alternative to import statement)
```html
<script type="module" src="/path/to/selectable-items[.min].js"></script>
```
#### npm
```cmd
npm install @magnit-ce/selectable-items
```

### Import
#### Vanilla js/ts
```js
import "/path/to/selectable-items[.min].js"; // if you didn't reference from a <script>, reference with an import like this

import { SelectableItemsElement } from "/path/to/selectable-items[.min].js";
```
#### npm
```js
import "@magnit-ce/selectable-items"; // if you didn't reference from a <script>, reference with an import like this

import { SelectableItemsElement } from "@magnit-ce/selectable-items";
```

---
---
---

## Overview
The `<selectable-items>` element is a container element that provides select functionality for all of its child element.

Selection can be done either by pointer events (clicking, tapping, etc), or by key events (tab/shift+tab).

## Attributes
The `<selectable-items>` element uses the following attributes: 
|Slot Name|Description
|-|-|-|
|`multi`||

## `selected()`
The `<selectable-items>` element provides a `selected()` function which returns all of the child elements that are currently selected in an `Array`.

## Events
The `<selectable-items>` element dispatches a `change` event whenever its selected items become selected or unselected.

## Properties
The `<selectable-items>` element exposes the following properties on the javascript object: 
|Slot Name|Description|Default Value
|-|-|-|
|`multipleModifierKeys`|A `static` property that defines the `string` values that will match a `KeyEvent`'s `code` property for allowing multiple selections. If a key's `code` is a string in this array, then when that key is held down, the selection will not de-select previous selections. (*must also have the `mutli` attribute set to `true`*)|`["ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight"]`|
|`selectKeys`|A `static` property that defines the `string` values that will match a `KeyEvent`'s `code` property for invoking a selection on the currently focused item. If a key's `code` is a string in this array, then when that key is pressed while a child element has focus, that child element will be selected.|`["Enter", "Space"]`|
|`selectedClassName`|A `static` property that defines the `string` value of the class that will be applied to selected items. When an item is "selected" it will be assigned a class with this property's value.|`selected`|

## Slots
The `<selectable-items>` element exposes the following `slot`s: 
|Slot Name|Description|Default
|-|-|-|
|[Default]|Slot that holds all of the `<selectable-items>`'s children. (*note: this slot has no name; all children of the `<selectable-items>` element will be placed in this default slot.*)|[empty]|

## Styling
The `<selectable-items>` element can be styled with CSS, normally. The `<selectable-items>` element does not utilize the shadowDOM for layout, so all styling can be done with standard CSS selectors. For its children, they can be styled with standard CSS selectors, as well.

Selected children are have the `selected` class applied, and their `aria-selected` attribute set to `option`. These defaults can be prevented by using the `preventDefault` function on the `<selectable-items>`'s `change` event. The specific class name applied can be changed by using the `selectedClassName` property of the element.

## License
This library is in the public domain. You do not need permission, nor do you need to provide attribution, in order to use, modify, reproduce, publish, or sell it or any works using it or derived from it.