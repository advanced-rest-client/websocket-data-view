import { fixture, assert, nextFrame } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '../demo/data-generator.js';
import { isSafari } from '../websocket-data-view.js';

describe('<websocket-data-view>', () => {
  async function basicFixture() {
    return await fixture(`<websocket-data-view></websocket-data-view>`);
  }

  function getActionItem(item, element) {
    return element.shadowRoot.querySelector('[data-action="' + item + '"]');
  }

  describe('basic - no data', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Export button is not in the DOM', function() {
      const node = getActionItem('export-all', element);
      assert.notOk(node);
    });

    it('Clear button is not in the DOM', function() {
      const node = getActionItem('clear-all', element);
      assert.notOk(node);
    });
  });

  describe('basic - with data', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.messages = DataGenerator.generateData(25);
    });

    it('Export button is in the DOM', function() {
      const node = getActionItem('export-all', element);
      assert.ok(node);
    });

    it('Clear button is in the DOM', function() {
      const node = getActionItem('clear-all', element);
      assert.ok(node);
    });

    it('Messages are rendered', function() {
      const nodes = element.shadowRoot.querySelectorAll('.table-values');
      assert.lengthOf(nodes, 25);
    });

    it('Clear button clears the messages', async () => {
      const node = getActionItem('clear-all', element);
      node.click();
      await nextFrame();
      assert.isUndefined(element.messages, 'Messages are cleared');
      const nodes = element.shadowRoot.querySelectorAll('.table-values');
      assert.lengthOf(nodes, 0, 'No messages are rendered');
    });

    it('Clear button fires cleared event', function() {
      const spy = sinon.spy();
      element.addEventListener('cleared', spy);
      const node = getActionItem('clear-all', element);
      node.click();
      assert.isTrue(spy.called);
    });

    it('Export button fires export-data event', function() {
      const spy = sinon.spy();
      element.addEventListener('export-data', spy);
      const node = getActionItem('export-all', element);
      node.click();
      assert.isTrue(spy.calledOnce);
    });

    it('Not handled export-data event generates web file download', function() {
      if (isSafari) {
        return;
      }
      const node = getActionItem('export-all', element);
      node.click();
      assert.typeOf(element._downloadFileUrl, 'string', '_downloadFileUrl is set');
      assert.typeOf(element._downloadFileName, 'string', '_downloadFileName is set');
      const dialog = element.shadowRoot.querySelector('paper-dialog');
      assert.isTrue(dialog.opened, 'Save dialog is opened');
    });

    it('Closing save dialog clears the download data', function(done) {
      if (isSafari) {
        done();
        return;
      }
      const node = getActionItem('export-all', element);
      node.click();
      setTimeout(function() {
        const node = element.shadowRoot.querySelector('#saveDialog paper-button[dialog-dismiss]');
        node.click();
        setTimeout(function() {
          assert.isUndefined(element._downloadFileUrl, '_downloadFileUrl is cleared');
          assert.isUndefined(element._downloadFileName, '_downloadFileName is cleared');
          done();
        }, 300);
      }, 300);
    });
  });

  describe('_getExportData()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.messages = DataGenerator.generateData(25);
      element.messages[0].isBinary = true;
    });

    it('Returns an array', () => {
      const result = element._getExportData();
      assert.typeOf(result, 'array');
    });

    it('Returns undefined when no data', () => {
      element.messages = undefined;
      const result = element._getExportData();
      assert.isUndefined(result);
    });

    it('Filters out binary messages', () => {
      const msg = element.messages[0].message;
      const result = element._getExportData();
      assert.notEqual(result.length, 25);
      assert.notEqual(result[0].message, msg);
    });
  });

  describe('_exportMessages()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.messages = DataGenerator.generateData(25);
      element.messages[0].isBinary = true;
    });

    function exportHandler(e) {
      e.preventDefault();
    }

    before(() => {
      window.addEventListener('export-data', exportHandler);
    });

    after(() => {
      window.removeEventListener('export-data', exportHandler);
    });

    it('Calls _exportMessages()', () => {
      const spy = sinon.spy(element, '_exportMessages');
      element._exportMessages();
      assert.isTrue(spy.called);
    });

    it('Calls _exportData() with arguments', () => {
      const spy = sinon.spy(element, '_exportData');
      element._exportMessages();
      assert.isTrue(spy.called);
      assert.typeOf(spy.args[0][0], 'array');
      assert.equal(spy.args[0][1], 'application/json');
    });

    it('Opens no data toast', () => {
      element.messages = undefined;
      element._exportMessages();
      assert.isTrue(element.shadowRoot.querySelector('#noMessages').opened);
    });
  });

  describe('_downloadBinary()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.messages = DataGenerator.generateData(25);
    });

    it('Calls _exportData() with arguments', () => {
      const spy = sinon.spy(element, '_exportData');
      const node = element.shadowRoot.querySelector('[data-action="export-binary"]');
      node.click();
      assert.isTrue(spy.called);
      assert.typeOf(spy.args[0][0], 'blob');
      assert.equal(spy.args[0][1], 'text/plain');
    });

    it('Sets default mime type', async () => {
      element.messages.forEach((item, index) => {
        element.messages[index].isBinary = false;
      });
      element.messages[0].isBinary = true;
      element.messages[0].message = new Blob(['test']);
      element.requestUpdate();
      await nextFrame();
      const spy = sinon.spy(element, '_exportData');
      const node = element.shadowRoot.querySelector('[data-action="export-binary"]');
      node.click();
      assert.isTrue(spy.called);
      assert.typeOf(spy.args[0][0], 'blob');
      assert.equal(spy.args[0][1], 'application/octet-stream');
    });
  });

  describe('_saveToFile()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets objecturl from a blob', () => {
      const data = new Blob(['test']);
      const mime = 'text/plain';
      element._saveToFile(data, mime);
      assert.typeOf(element._downloadFileUrl, 'string');
    });

    it('Sets file name from blob', () => {
      const data = new Blob(['test']);
      const mime = 'text/plain';
      element._saveToFile(data, mime);
      assert.typeOf(element._downloadFileName, 'string');
    });

    it('Sets .json extension for JSON mime', () => {
      const data = new Blob(['test']);
      const mime = 'application/json';
      element._saveToFile(data, mime);
      assert.notEqual(element._downloadFileName.indexOf('.json'), -1);
    });

    it('Sets .txt extension for plain text mime', () => {
      const data = new Blob(['test']);
      const mime = 'text/plain';
      element._saveToFile(data, mime);
      assert.notEqual(element._downloadFileName.indexOf('.txt'), -1);
    });
  });

  describe('_downloadIconTap()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.shadowRoot.querySelector('#saveDialog').opened = true;
    });

    it('Closes the dialog', (done) => {
      element._downloadIconTap();
      setTimeout(() => {
        assert.isFalse(element.shadowRoot.querySelector('#saveDialog').opened);
        done();
      }, 250);
    });
  });

  describe('_exportData()', () => {
    const data = 'test';
    const mime = 'text/plain';
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches export-data event', () => {
      const spy = sinon.spy();
      element.addEventListener('export-data', spy);
      element._exportData(data, mime);
      assert.isTrue(spy.called);
    });

    it('Detail has passed data', () => {
      const spy = sinon.spy();
      element.addEventListener('export-data', spy);
      element._exportData(data, mime);
      assert.equal(spy.args[0][0].detail.data, data);
    });

    it('Detail has destination', () => {
      const spy = sinon.spy();
      element.addEventListener('export-data', spy);
      element._exportData(data, mime);
      assert.equal(spy.args[0][0].detail.destination, 'file');
    });

    it('Detail has providerOptions', () => {
      const spy = sinon.spy();
      element.addEventListener('export-data', spy);
      element._exportData(data, mime);
      assert.deepEqual(spy.args[0][0].detail.providerOptions, {
        contentType: mime
      });
    });
  });

  describe('oncleared', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.oncleared);
      const f = () => {};
      element.oncleared = f;
      assert.isTrue(element.oncleared === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.oncleared = f;
      element._clearMessages();
      element.oncleared = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.oncleared = f1;
      element.oncleared = f2;
      element._clearMessages();
      element.oncleared = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });
});
