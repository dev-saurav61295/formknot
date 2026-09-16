# @formknot/builder-react

Visual, drag-and-drop form builder for **FormKnot** dynamic form schemas.

`FormKnotBuilder` gives you a field palette, a reorderable canvas, a field-settings panel (attributes, validation rules, options, conditional logic), a live preview rendered with `@formknot/react`, undo/redo, and JSON import/export — all driven by immutable state.

## Install

```bash
npm install @formknot/builder-react
```

`@formknot/core` and `@formknot/react` are installed automatically as regular dependencies of this package (see "Dependency model" below). `react` and `react-dom` remain peer dependencies — install whatever version your app already uses (^18.2).

## Quick start

```tsx
import { FormKnotBuilder } from "@formknot/builder-react";
import "@formknot/builder-react/styles.css";

export function FormDesigner() {
  return (
    <FormKnotBuilder
      onChange={(schema) => console.log("latest valid schema", schema)}
      onExport={(schema) => saveSchema(schema)}
    />
  );
}
```

## Features

- **Field palette** — click or drag any of the 12 built-in field types (plus any custom types registered through `components`) onto the canvas.
- **Canvas** — reorder fields by drag (`@dnd-kit`, keyboard-operable) or with explicit ↑/↓ buttons; select, duplicate, delete (with confirmation).
- **Settings panel** — general attributes, per-type constraints, a validation-rule editor, an options editor for select/radio/checkbox-group fields, and a conditional-rule editor (`all`/`any` strategy, `show`/`hide`/`enable`/`disable`).
- **Live preview** — the current schema rendered with a real `FormKnotForm`.
- **Undo/redo** — a bounded history stack of immutable schema snapshots.
- **Import/export** — paste or upload JSON to import (invalid documents show path-based errors without crashing); export shows the JSON with copy-to-clipboard and download.
- **`onChange`** fires only with a schema that currently passes `validateFormKnotSchema` — you never receive a structurally invalid document.

## Dependency model

`@formknot/core` and `@formknot/react` are ordinary `dependencies` of `@formknot/builder-react` (not peers), so a consumer who only wants the builder can install this one package and get a working experience, matching the install instructions above. `react`/`react-dom` stay `peerDependencies` since only one copy of React may exist in a host application.

## License

MIT
