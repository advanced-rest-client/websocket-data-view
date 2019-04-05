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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import '../../@polymer/polymer/lib/elements/dom-repeat.js';
import '../../@polymer/polymer/lib/elements/dom-if.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import '../../@advanced-rest-client/date-time/date-time.js';
import '../../@polymer/paper-toast/paper-toast.js';
import '../../@polymer/paper-dialog/paper-dialog.js';
import '../../@polymer/paper-button/paper-button.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * A web socket communication log viewer for web socket request panel
 *
 * ### Example
 *
 * ```html
 * <websocket-data-view></websocket-data-view>
 * ```
 *
 * ### Styling
 *
 * `<websocket-data-view>` provides the following custom properties and
 * mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--websocket-data-view` | Mixin applied to the element | `{}`
 *
 * @polymer
 * @customElement
 * @memberof ApiElements
 * @demo demo/index.html
 */
class WebsocketDataView extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --arc-font-body1;
      @apply --websocket-data-view;
    }

    .table-values {
      color: var(--websocket-data-view-table-color, rgba(0, 0, 0, 0.87));
      font-size: var(--websocket-data-view-table-font-size, 13px);
      padding: 16px 24px !important;
      -webkit-user-select: text;
      cursor: text;
    }

    .table-values,
    .table-columns {
      @apply --layout-horizontal;
      @apply --layout-center;
      border-bottom: 1px var(--websocket-data-view-divider-color, rgba(0, 0, 0, 0.12)) solid;
      padding: 0 24px;
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
      @apply --layout-flex;
      @apply --layout-horizontal;
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
      @apply --layout-flex;
      @apply --websocket-data-view-message;
    }

    #saveDialog {
      min-width: 320px;
    }

    .donnload-section {
      @apply --layout-vertical;
      @apply --layout-center;
    }

    .download-file-icon {
      width: var(--websocket-data-view-download-icon-size, 64px);
      height: var(--websocket-data-view-download-icon-size, 64px);
      color: var(--websocket-data-view-download-icon, var(--accent-color));
    }

    .dialog-message {
      @apply --websocket-data-view-dialog-message;
    }
    </style>
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
      <template is="dom-if" if="[[hasMessages]]">
        <paper-icon-button data-action="export-all" icon="arc:file-download" on-click="_exportMessages" title="Export all messages to file"></paper-icon-button>
        <paper-icon-button data-action="clear-all" icon="arc:clear" on-click="_clearMessages" title="Clear messages log"></paper-icon-button>
      </template>
    </div>
    <dom-repeat items="[[messages]]" sort="_sortMessages" id="logList">
      <template>
        <div class="table-values">
          <div class="direction-column">[[item.direction]]</div>
          <div class="time-column">
            <date-time date="[[item.time]]" hour="numeric" minute="numeric" second="numeric"></date-time>
          </div>
          <div class="message-column">
            <template is="dom-if" if="[[!item.isBinary]]">
              <span class="message">[[item.message]]</span>
            </template>
            <template is="dom-if" if="[[item.isBinary]]">
              <span class="message">[Binary data]</span>
              <paper-icon-button data-action="export-binary" icon="arc:file-download" on-click="_downloadBinary" title="Download binary data"></paper-icon-button>
            </template>
          </div>
        </div>
      </template>
    </dom-repeat>
    <paper-dialog id="saveDialog" on-iron-overlay-closed="_downloadDialogClose">
      <h2>Save to file</h2>
      <div>
        <p class="dialog-message">Your file is ready to download. Click on the icon below to save it to your local drive.</p>
        <div class="donnload-section">
          <a href\$="[[downloadFileUrl]]" download\$="[[downloadFileName]]" on-click="_downloadIconTap" target="_blank">
            <paper-icon-button data-action="download-file" icon="arc:file-download" class="download-file-icon" title="Download file"></paper-icon-button>
          </a>
        </div>
      </div>
      <div class="buttons">
        <paper-button dialog-dismiss="" autofocus="">Close</paper-button>
      </div>
    </paper-dialog>
    <paper-toast id="safariDownload"
      text="Safari doesn't support file download. Please, use other browser."></paper-toast>
    <paper-toast id="noMessages" text="Nothing to export"></paper-toast>
`;
  }

  static get properties() {
    return {
      // List of communication messages with the socket
      messages: Array,
      // Computed value, true if messages are set
      hasMessages: {
        type: Boolean,
        computed: '_computeHasMessages(messages)'
      },
      /**
       * When saving a file this will be the download URL created by the
       * `URL.createObjectURL` function.
       */
      downloadFileUrl: {
        type: String,
        readOnly: true
      },
      /**
       * Autogenerated file name for the download file.
       */
      downloadFileName: {
        type: String,
        readOnly: true
      },
      // Computed value. True is current browser is Safari - the new IE.
      isSafari: {
        type: Boolean,
        value() {
          return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        },
        readOnly: true
      }
    };
  }

  _computeHasMessages(messages) {
    return !!(messages && messages.length);
  }
  /**
   * Sorts messages in a log so the newest messages are always on top.
   *
   * @param {Object} a
   * @param {Object} b
   * @return {Number}
   */
  _sortMessages(a, b) {
    if (a.time > b.time) {
      return -1;
    }
    if (a.time < b.time) {
      return 1;
    }
    return 0;
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
      this.$.noMessages.opened = true;
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
    const item = e.model.get('item');
    const data = item.message;
    this._exportData(data, data.type || 'application/octet-stream');
  }
  /**
   * Fires `export-data` event or calls `_saveToFile` if event is not handled
   * @param {Object|Blob} data The data to export.
   * @param {String} type `data` content type
   */
  _exportData(data, type) {
    const e = new CustomEvent('export-data', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        data,
        type,
        destination: 'file'
      }
    });
    this.dispatchEvent(e);
    if (e.defaultPrevented) {
      return;
    }
    if (this.isSafari) {
      this.$.safariDownload.opened = true;
    } else {
      this._saveToFile(data, type);
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
    this._setDownloadFileUrl(URL.createObjectURL(data));
    this._setDownloadFileName(fileName);
    this.$.saveDialog.opened = true;
  }
  // Handler for download link click to prevent default and close the dialog.
  _downloadIconTap() {
    setTimeout(() => {
      this.$.saveDialog.opened = false;
    }, 250);
  }
  // Handler for file download dialog close.
  _downloadDialogClose() {
    URL.revokeObjectURL(this.downloadFileUrl);
    this._setDownloadFileUrl(undefined);
    this._setDownloadFileName(undefined);
  }
  // Clears the list of the messages and sends `message-cleared` event.
  _clearMessages() {
    this.messages = undefined;
    this.dispatchEvent(new CustomEvent('message-cleared', {
      composed: true
    }));
  }
  /**
   * Fired when the user clears the messages in the UI.
   * The event does not bubble.
   *
   * @event message-cleared
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
