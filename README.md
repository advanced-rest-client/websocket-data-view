[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/websocket-data-view.svg)](https://www.npmjs.com/package/@advanced-rest-client/websocket-data-view)

[![Build Status](https://travis-ci.org/advanced-rest-client/websocket-data-view.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/websocket-data-view)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/@advanced-rest-client/websocket-data-view)


# websocket-data-view

A web socket communication log viewer for web socket request panel

## Example:

```html
<websocket-data-view messages="..."></websocket-data-view>
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/websocket-data-view
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/websocket-data-view/websocket-data-view.js';
    </script>
  </head>
  <body>
    <websocket-data-view></websocket-data-view>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@advanced-rest-client/websocket-data-view/websocket-data-view.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <websocket-data-view></websocket-data-view>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Development

```sh
git clone https://github.com/advanced-rest-client/websocket-data-view
cd websocket-data-view
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```
