'use strict';

/**
 * Smoke-test activate → decorate → refresh → deactivate without a real
 * VS Code window. Mocks the Decoration API used by src/extension.ts.
 */

const Module = require('module');
const assert = require('node:assert/strict');
const path = require('node:path');

const disposed = [];
const documentListeners = [];
const activeListeners = [];
const visibleListeners = [];

let decorationOptions;
let lastSetDecorations;

function createEditor(text) {
  return {
    document: {
      getText: () => text,
      positionAt: (offset) => ({ offset }),
    },
    setDecorations(_type, decorations) {
      lastSetDecorations = decorations;
    },
  };
}

const visibleTextEditors = [createEditor('prefix TODO: todo: Todo: TODO')];

const vscode = {
  OverviewRulerLane: { Right: 2 },
  Range: class Range {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
  },
  window: {
    visibleTextEditors,
    createOutputChannel() {
      return {
        appendLine() {},
        dispose() {
          disposed.push('output');
        },
      };
    },
    createTextEditorDecorationType(options) {
      decorationOptions = options;
      return {
        dispose() {
          disposed.push('decoration');
        },
      };
    },
    onDidChangeActiveTextEditor(callback) {
      activeListeners.push(callback);
      return {
        dispose() {
          disposed.push('activeEditor');
        },
      };
    },
    onDidChangeVisibleTextEditors(callback) {
      visibleListeners.push(callback);
      return {
        dispose() {
          disposed.push('visibleEditors');
        },
      };
    },
  },
  workspace: {
    onDidChangeTextDocument(callback) {
      documentListeners.push(callback);
      return {
        dispose() {
          disposed.push('textDocument');
        },
      };
    },
  },
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === 'vscode') {
    return vscode;
  }
  return originalLoad(request, parent, isMain);
};

const extension = require(path.join(__dirname, '..', 'out', 'extension.js'));

const context = { subscriptions: [] };
extension.activate(context);

assert.match(String(decorationOptions.backgroundColor), /255/);
assert.equal(lastSetDecorations.length, 1);
assert.equal(lastSetDecorations[0].range.start.offset, 7);
assert.equal(lastSetDecorations[0].range.end.offset, 12);

visibleTextEditors[0] = createEditor('TODO: and TODO:');
documentListeners[0]();
assert.equal(lastSetDecorations.length, 2);

visibleTextEditors[0] = createEditor('nothing to see');
activeListeners[0]();
assert.equal(lastSetDecorations.length, 0);

visibleTextEditors[0] = createEditor('TODO:');
visibleListeners[0]();
assert.equal(lastSetDecorations.length, 1);

extension.deactivate();
assert.deepEqual(
  new Set(disposed),
  new Set(['output', 'decoration', 'textDocument', 'activeEditor', 'visibleEditors'])
);

console.log('extension lifecycle tests passed');
