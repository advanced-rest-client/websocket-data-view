/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@advanced-rest-client/date-time/date-time.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-button/paper-button.js';
export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
/**
 * A web socket communication log viewer for web socket request panel
 *
 * ### Example
 *
 * ```html
 * <websocket-data-view></websocket-data-view>
 * ```
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class WebsocketDataView extends LitElement {
  static get styles() {
    return css`:host {
      display: block;
      font-size: var(--arc-font-body1-font-size, inherit);
      font-weight: var(--arc-font-body1-font-weight, inherit);
      line-height: var(--arc-font-body1-line-height, inherit);
    }

    .table-values {
      color: var(--websocket-data-view-table-color, rgba(0, 0, 0, 0.87));
      font-size: var(--websocket-data-view-table-font-size, 13px);
      padding: 16px 24px !important;
      user-select: text;
      cursor: text;
    }

    .table-values,
    .table-columns {
      display: flex;
      flex-direction: row;
      align-items: center;
      border-bottom: 1px var(--websocket-data-view-divider-color, rgba(0, 0, 0, 0.12)) solid;
      padding: 0 24px;
    }

    .table-columns {
      height: 40px;
    }

    .table-columns:last-child {
      border-bottom: 1px var(--websocket-data-view-last-divider-color, rgba(0, 0, 0, 0)) solid;
    }

    .direction-column,
    .time-column,
    .message-column {
      padding-right: 24px;
    }

    .message-column {
      flex: 1;
      flex-basis: 0.000000001px;
      display: flex;
      flex-direction: row;
      padding-right: 0;
    }

    .time-column,
    .message-column {
      padding-left: 24px;
    }

    .direction-column {
      min-width: 56px;
      padding: 0;
    }

    .time-column {
      min-width: 70px;
    }

    .message-column .message {
      white-space: pre-wrap;
      word-break: normal;
      flex: 1;
      flex-basis: 0.000000001px;
    }

    #saveDialog {
      min-width: 320px;
    }

    .donwnload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .download-file-icon {
      width: var(--websocket-data-view-download-icon-size, 64px);
      height: var(--websocket-data-view-download-icon-size, 64px);
      color: var(--websocket-data-view-download-icon, var(--accent-color));
    }

    :host([narrow]) .table-columns .direction-column,
    :host([narrow]) .table-columns .time-column,
    :host([narrow]) .table-columns .message-column  {
      display: none;
    }

    :host([narrow]) .table-columns .spacer {
      flex: 1;
    }

    :host([narrow]) .table-values {
      flex-direction: column;
      align-items: start;
    }

    :host([narrow]) .time-column,
    :host([narrow]) .message-column {
      padding-left: 0;
      padding-right: 0;
    }

    :host([narrow]) .direction-column,
    :host([narrow]) .time-column {
      text-transform: capitalize;
      font-weight: 500;
    }

    :host([narrow]) .message-column {
      align-items: center;
    }`;
  }

  _renderMessages(messages) {
    if (!messages || !messages.length) {
      return;
    }
    return messages.map((item, index) => html`<div class="table-values">
      <div class="direction-column">${item.direction}</div>
      <div class="time-column">
        <date-time .date="${item.time}" hour="numeric" minute="numeric" second="numeric"></date-time>
      </div>
      <div class="message-column">
      ${item.isBinary ?
        html`[Binary data]
        <paper-icon-button data-action="export-binary" data-index="${index}"
          icon="arc:file-download" @click="${this._downloadBinary}" title="Download binary data"></paper-icon-button>`:
        html`<span class="message">${item.message}</span>`
}
      </div>
    </div>`);
  }

  render() {
    const { messages, _downloadFileUrl, _downloadFileName } = this;
    const hasMessages = !!messages && !!messages.length;
    return html`
    <div class="table-columns">
      <div class="direction-column">
        <span title="Either 'in' for incoming or 'out' for outgoing messages">Direction</span>
      </div>
      <div class="time-column">
        <span title="Event time">Time</span>
      </div>
      <div class="message-column">
        <span title="Message sent to / received from the server">Message</span>
      </div>
      <div class="spacer"></div>
      ${hasMessages ?
        html`<paper-icon-button
          data-action="export-all"
          icon="arc:file-download"
          @click="${this._exportMessages}" title="Export all messages to file"></paper-icon-button>
        <paper-icon-button
          data-action="clear-all"
          icon="arc:clear"
          @click="${this._clearMessages}" title="Clear messages log"></paper-icon-button>`:
        undefined}
    </div>

    ${this._renderMessages(messages)}

    <paper-dialog id="saveDialog" @iron-overlay-closed="${this._downloadDialogClose}">
      <h2>Save to file</h2>
      <div>
        <p class="dialog-message">
          Your file is ready to download. Click on the icon below to save it to your local drive.
        </p>
        <div class="donwnload-section">
          <a href="${_downloadFileUrl}" download="${_downloadFileName}"
            @click="${this._downloadIconTap}" target="_blank">
            <paper-icon-button data-action="download-file" icon="arc:file-download"
              class="download-file-icon" title="Download file"></paper-icon-button>
          </a>
        </div>
      </div>
      <div class="buttons">
        <paper-button dialog-dismiss autofocus>Close</paper-button>
      </div>
    </paper-dialog>
    <paper-toast id="safariDownload"
      text="Safari doesn't support file download. Please, use other browser."></paper-toast>
    <paper-toast id="noMessages" text="Nothing to export"></paper-toast>`;
  }

  static get properties() {
    return {
      // List of communication messages with the socket
      messages: Array,
      /**
       * When saving a file this will be the download URL created by the
       * `URL.createObjectURL` function.
       */
      _downloadFileUrl: {
        type: String,
        readOnly: true
      },
      /**
       * Autogenerated file name for the download file.
       */
      _downloadFileName: {
        type: String,
        readOnly: true
      }
    };
  }
  /**
   * @return {Function} Previously registered handler for `cleared` event
   */
  get oncleared() {
    return this._oncleared;
  }
  /**
   * Registers a callback function for `cleared` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set oncleared(value) {
    const old = this._oncleared;
    if (old === value) {
      return;
    }
    if (old) {
      this.removeEventListener('cleared', old);
    }
    if (typeof value !== 'function') {
      this._oncleared = null;
      return;
    }
    this._oncleared = value;
    this.addEventListener('cleared', value);
  }

  // Returns a list of messages that can be exported.
  _getExportData() {
    const data = this.messages;
    if (!data || !data.length) {
      return;
    }
    return data.filter((item) => !item.isBinary);
  }
  /**
   * Fires the `export-data` event. If the event is not canceled
   * then it will use default web implementation for file saving.
   */
  _exportMessages() {
    const data = this._getExportData();
    if (!data) {
      this.shadowRoot.querySelector('#noMessages').opened = true;
      return;
    }
    this._exportData(data, 'application/json');
  }
  /**
   * Handler for the "download binary data" button click.
   * Exports the binary data.
   *
   * @param {ClickEvent} e
   */
  _downloadBinary(e) {
    const index = Number(e.target.dataset.index);
    const item = this.messages[index];
    if (!item) {
      return;
    }
    const data = item.message;
    this._exportData(data, data.type || 'application/octet-stream');
  }
  /**
   * Fires `export-data` event or calls `_saveToFile` if event is not handled
   * @param {Object|Blob} data The data to export.
   * @param {String} contentType `data` content type
   */
  _exportData(data, contentType) {
    const e = new CustomEvent('export-data', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        data,
        destination: 'file',
        providerOptions: {
          contentType
        }
      }
    });
    this.dispatchEvent(e);
    if (e.defaultPrevented) {
      return;
    }
    if (isSafari) {
      this.shadowRoot.querySelector('#safariDownload').opened = true;
    } else {
      this._saveToFile(data, contentType);
    }
  }
  /**
   * Creates a file object form messages objects and opens the dialog
   * with the link to the file.
   *
   * @param {String|Blob} data
   * @param {String} type Content mime type
   */
  _saveToFile(data, type) {
    let ext = '';
    if (!(data instanceof Blob)) {
      data = new Blob([JSON.stringify(data, null, 2)], {
        type: type
      });
      ext = '.json';
    } else {
      if (type === 'application/json') {
        ext = '.json';
      } else if (type === 'text/plain') {
        ext = '.txt';
      }
    }
    const fileName = 'socket-messages-' + new Date().toISOString() + ext;
    this._downloadFileUrl = URL.createObjectURL(data);
    this._downloadFileName = fileName;
    this.shadowRoot.querySelector('#saveDialog').opened = true;
  }
  // Handler for download link click to prevent default and close the dialog.
  _downloadIconTap() {
    setTimeout(() => {
      this.shadowRoot.querySelector('#saveDialog').opened = false;
    }, 250);
  }
  // Handler for file download dialog close.
  _downloadDialogClose() {
    URL.revokeObjectURL(this._downloadFileUrl);
    this._downloadFileUrl = undefined;
    this._downloadFileName = undefined;
  }
  // Clears the list of the messages and sends `message-cleared` event.
  _clearMessages() {
    this.messages = undefined;
    this.dispatchEvent(new CustomEvent('cleared'));
  }
  /**
   * Fired when the user clears the messages in the UI.
   * The event does not bubble.
   *
   * @event cleared
   */
  /**
   * Fired when data export was requested.
   * The event is cancelable. If the event wasn't canceled then the element
   * will use web download as a fallback method.
   *
   * @event export-data
   * @param {Object|Blob} data The data to export.
   * @param {String} type `data` content type
   */
}
window.customElements.define('websocket-data-view', WebsocketDataView);
