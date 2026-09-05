# Exhibition publication source

The report has 42 A4 pages, including 25 detailed chapters, a 33-screen atlas, 16 references and a glossary. The 32-slide deck has editable text, nine native tables, two native charts with embedded literal-data workbooks, an editable architecture diagram and source notes.

- `content.py` is the authored research and narrative source. `content.json` preserves the source snapshot used for this edition.
- `build_report.py` creates the DOCX with python-docx. It reads `artifacts/report-build/content.json`.
- `build_deck.mjs` creates the presentation using the Documents/Presentations workspace runtime, `@oai/artifact-tool`, and the installed presentation finalizer.
- `render-final.mjs` imports and renders the finalized deck for visual comparison.
- `../report-assets/PROVENANCE.md` records imagery and capture provenance.

The scripts use the Codex bundled Python/Node runtimes and installed plugin helper paths from the authoring host. Resolve those paths using `load_workspace_dependencies` before rebuilding on another machine. The deck module also needs the bundled Node modules available to module resolution (a temporary `node_modules` symlink beside the builder is sufficient).

Create `artifacts/report-build` and `deliverables`, run `content.py`, then the appropriate builder. For a presentation revision, choose a fresh final filename and validation receipt path; the finalizer intentionally refuses to overwrite a delivered file. Do not deliver a candidate file directly.

After every edit, render and visually inspect all affected pages/slides. Recheck the contents page against actual report pagination. Financial inputs are illustrative project assumptions, not forecasts or quotations. Revalidate dated public sources before a future edition.
