# ToDoNut

VS Code / Cursor extension that yellow-highlights every instance of the literal text `TODO:` in open editors.

Matching is a **case-sensitive substring** search (`TODO:` matches; `todo:` / `Todo:` / `TODO` do not). It uses the editor Decoration API, not a language server.

## Run in under 2 minutes

```bash
npm install
npm run compile
```

Then press **F5** (Run Extension) to open the Extension Development Host. Open any file and type `TODO:` — the token turns yellow. Edits update live.

Watch mode (optional, instead of a one-shot compile):

```bash
npm run watch
```

Then F5.

## Package as VSIX

```bash
npm install
npm run compile
npx @vscode/vsce package
```

This creates `todonut-0.0.1.vsix` (version matches package.json).

## Install the VSIX

1. Extensions sidebar → `…` menu → **Install from VSIX…**
2. Select `todonut-0.0.1.vsix`
3. Reload when prompted

Or CLI:

```bash
code --install-extension todonut-0.0.1.vsix
# Cursor:
cursor --install-extension todonut-0.0.1.vsix
```
