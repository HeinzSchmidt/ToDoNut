import * as vscode from 'vscode';
import { findTodoMatches } from './todoMatches';

/**
 * ToDoNut highlights every instance of the literal text `TODO:` in visible
 * editors using the VS Code Decoration API (`TextEditorDecorationType` +
 * `setDecorations`). This is not a language server.
 */

const OUTPUT_CHANNEL_NAME = 'ToDoNut';
const LOG_PREFIX = '[ToDoNut]';

/** Shared yellow decoration type applied to each `TODO:` range. */
let todoDecorationType: vscode.TextEditorDecorationType | undefined;

/** Output channel used for activation/refresh error logging. */
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Listeners and resources we own. VS Code also disposes
 * `context.subscriptions`; we keep this list so `deactivate()` can clean up
 * explicitly as required.
 */
const managedDisposables: vscode.Disposable[] = [];

function logError(where: string, error: unknown): void {
  const detail = error instanceof Error ? error.stack ?? error.message : String(error);
  const message = `${LOG_PREFIX} ${where}: ${detail}`;
  console.error(message);
  outputChannel?.appendLine(message);
}

/**
 * Walk all currently visible editors and (re)apply yellow `TODO:` decorations.
 * Called on activate and whenever documents or visible editors change.
 */
function refreshVisibleEditors(): void {
  try {
    if (!todoDecorationType) {
      return;
    }

    for (const editor of vscode.window.visibleTextEditors) {
      applyTodoDecorations(editor);
    }
  } catch (error) {
    logError('refresh failed', error);
  }
}

/**
 * Scan one editor's document for case-sensitive `TODO:` substrings and paint
 * a yellow background over each match. Passing an empty list clears stale
 * highlights after the user deletes a token.
 */
function applyTodoDecorations(editor: vscode.TextEditor): void {
  if (!todoDecorationType) {
    return;
  }

  const text = editor.document.getText();
  const decorations: vscode.DecorationOptions[] = findTodoMatches(text).map((match) => {
    const start = editor.document.positionAt(match.start);
    const end = editor.document.positionAt(match.end);
    return { range: new vscode.Range(start, end) };
  });

  editor.setDecorations(todoDecorationType, decorations);
}

function track(disposable: vscode.Disposable, context: vscode.ExtensionContext): void {
  managedDisposables.push(disposable);
  context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext): void {
  try {
    outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
    track(outputChannel, context);

    // Yellow highlighter for the five-character token `TODO:` only.
    todoDecorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255, 235, 59, 0.65)',
      color: '#000000',
      overviewRulerColor: 'rgba(255, 235, 59, 0.9)',
      overviewRulerLane: vscode.OverviewRulerLane.Right,
    });
    track(todoDecorationType, context);

    track(vscode.workspace.onDidChangeTextDocument(() => refreshVisibleEditors()), context);
    track(vscode.window.onDidChangeActiveTextEditor(() => refreshVisibleEditors()), context);
    track(vscode.window.onDidChangeVisibleTextEditors(() => refreshVisibleEditors()), context);

    // Initial pass over whatever is already open when the extension host starts.
    refreshVisibleEditors();
  } catch (error) {
    logError('activation failed', error);
  }
}

/** Dispose decorations and event listeners when the extension shuts down. */
export function deactivate(): void {
  for (const disposable of managedDisposables.splice(0)) {
    try {
      disposable.dispose();
    } catch (error) {
      logError('dispose failed', error);
    }
  }

  todoDecorationType = undefined;
  outputChannel = undefined;
}
