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
