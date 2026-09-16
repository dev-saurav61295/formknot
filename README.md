# FormKnot

**Connect fields, rules, and validation into dynamic forms.**

FormKnot is a production-ready, schema-driven dynamic form system for React: a framework-neutral form engine, an accessible React renderer, and a visual drag-and-drop form builder, distributed as three independently publishable npm packages.

```text
@formknot/core           framework-neutral schema, validation, conditional logic
@formknot/react           accessible React renderer (FormKnotForm)
@formknot/builder-react    visual drag-and-drop form builder (FormKnotBuilder)
```

## Table of contents

- [Architecture](#architecture)
- [Package responsibilities](#package-responsibilities)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Builder usage](#builder-usage)
- [Renderer usage](#renderer-usage)
- [Schema format](#schema-format)
- [Built-in fields](#built-in-fields)
- [Validation](#validation)
- [Conditional logic](#conditional-logic)
- [Custom validators](#custom-validators)
- [Custom fields](#custom-fields)
- [Styling](#styling)
- [Import and export](#import-and-export)
- [Local development](#local-development)
- [Testing](#testing)
- [Package builds](#package-builds)
- [Publishing instructions](#publishing-instructions)
- [Semantic versioning](#semantic-versioning)
- [Known limitations](#known-limitations)

## Architecture

```
┌─────────────────────┐
│ @formknot/builder-react │  visual builder (palette, canvas, settings, preview)
│  depends on ↓            │
├─────────────────────┤
│ @formknot/react          │  FormKnotForm, built-in field components, RHF integration
│  depends on ↓            │
├─────────────────────┤
│ @formknot/core           │  schema types, AJV validation, conditions, migrations
│  (no React, no DOM)      │
└─────────────────────┘
```

`@formknot/core` owns the `FormKnotSchema` JSON model and every rule that can be expressed about it: structural validation (AJV + semantic checks), form-data validation, conditional-visibility evaluation, versioning/migration, and safe (de)serialization. It has zero React or browser dependency, so the same validation logic can run on a Node server, in a CLI, or in the browser.

`@formknot/react` renders a `FormKnotSchema` as a real, accessible form using [react-hook-form](https://react-hook-form.com) for field state and a resolver that calls straight into `@formknot/core`'s `validateFormData`, so the renderer and any non-React consumer of `@formknot/core` validate identically.

`@formknot/builder-react` is a visual editor built on top of both: it holds an immutable, undo/redo-able schema in a reducer, and renders its live preview with an actual `FormKnotForm`.

## Package responsibilities

| Package | Responsibility |
|---|---|
| `@formknot/core` | Types, schema validation, data validation, conditional-logic evaluation, validator/field registries, migrations, safe (de)serialization. |
| `@formknot/react` | `FormKnotForm`, built-in field components, RHF integration, accessible error summary/field errors, custom field registry, optional stylesheet. |
| `@formknot/builder-react` | `FormKnotBuilder`: palette, canvas (drag + keyboard reorder), settings panel (attributes/validation/options/conditions), live preview, undo/redo, JSON import/export. |

## Installation

For the visual builder (installs `@formknot/core` and `@formknot/react` automatically as regular dependencies — see [Known limitations](#known-limitations) for the dependency-model rationale):

```bash
npm install @formknot/builder-react
```

For a renderer-only application (no builder):

```bash
npm install @formknot/react @formknot/core
```

All three packages declare `react`/`react-dom` as `peerDependencies` (`^18.2.0`) — install whichever 18.x version your app already uses.

## Quick start

```tsx
import { FormKnotForm } from "@formknot/react";
import "@formknot/react/styles.css";
import type { FormKnotSchema } from "@formknot/core";

const schema: FormKnotSchema = {
  id: "contact-form",
  version: 1,
  fields: [
    {
      id: "f1",
      type: "text",
      name: "name",
      label: "Name",
      required: true,
      validations: [{ id: "v1", type: "required", message: "Name is required" }],
    },
    { id: "f2", type: "email", name: "email", label: "Email" },
  ],
};

export function ContactForm() {
  return (
    <FormKnotForm
      schema={schema}
      onSubmit={(result) => console.log(result.data)}
      onInvalid={(errors) => console.warn(errors)}
    />
  );
}
```

## Builder usage

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

`FormKnotBuilder` renders four areas — **field palette**, **canvas**, **settings panel**, and **live preview** — and supports clicking or dragging fields onto the canvas, drag (`@dnd-kit`, keyboard-operable) or ↑/↓-button reordering, selection, duplication, delete-with-confirmation, attribute/validation/option/conditional-rule editing, undo/redo, and JSON import/export (paste, upload, copy-to-clipboard, download). `onChange` fires only with a schema that currently passes `validateFormKnotSchema` — an in-progress, momentarily invalid edit never reaches your state. The builder does not persist anything; storing the schema is your application's responsibility.

## Renderer usage

```tsx
import { FormKnotForm, createFormKnotFieldRegistry } from "@formknot/react";
import "@formknot/react/styles.css";
import { createValidatorRegistry } from "@formknot/core";

const validators = createValidatorRegistry();
validators.register("uniqueEmail", async ({ value }) => {
  const available = await checkEmailAvailability(String(value));
  return available ? undefined : "This email address is already registered";
});

<FormKnotForm
  schema={schema}
  initialValues={{ name: "Ada" }}
  validators={validators}
  validateOn="blur"
  onChange={(values) => console.log(values)}
  onSubmit={(result) => submitToApi(result.data)}
  onInvalid={(errors) => console.warn(errors)}
/>;
```

`FormKnotForm` focuses the first invalid field on a failed submission, associates errors via `aria-describedby`/`aria-invalid`, renders an accessible error summary, disables its submit button (and guards against re-entrant calls) while `onSubmit` is pending, and works with or without the builder package.

## Schema format

```ts
interface FormKnotSchema {
  id: string;
  title?: string;
  description?: string;
  version: number;
  fields: FormKnotField[];       // discriminated union, one variant per field type
  settings?: FormKnotSettings;   // clearHiddenFieldValues, validateVisibleFieldsOnly, button labels
  metadata?: Record<string, unknown>;
}
```

`FormKnotField` is a discriminated union on `type`, so TypeScript narrows `options`, `defaultValue`, and `attributes` per field type (e.g. only `select` | `radio` | `checkboxGroup` have `options`). Schemas are plain JSON — no functions, no executable code — so they can be stored, transmitted, and imported safely. See `packages/core/src/types.ts` for the full model.

## Built-in fields

`text`, `textarea`, `email`, `password`, `number`, `select`, `radio`, `checkbox`, `checkboxGroup`, `date`, `file`, `hidden`. Only `select`, `radio`, and `checkboxGroup` accept an `options` array; `@formknot/core`'s schema validator rejects `options` on any other built-in type and requires at least one option where they're expected.

## Validation

`@formknot/core` ships `required`, `email`, `minLength`, `maxLength`, `min`, `max`, and `pattern` rules, plus `custom` rules that reference a validator by `validatorId`. Custom validators — sync or async — are registered separately via `createValidatorRegistry()` and are never stored in the schema itself:

```ts
import { createValidatorRegistry, validateFormData } from "@formknot/core";

const validators = createValidatorRegistry();
validators.register("uniqueEmail", async ({ value }) => {
  const available = await checkEmailAvailability(String(value));
  return available ? undefined : "This email address is already registered";
});

const result = await validateFormData(schema, values, { validators });
// { valid: boolean, data: Record<string, unknown>, errors: Record<string, string[]> }
```

The React renderer runs the exact same `validateFormData` function through a react-hook-form resolver, so validation behavior is identical inside and outside React.

## Conditional logic

Each field may carry one `conditions` group (`strategy: "all" | "any"` over a list of rules). Each rule compares another field's current value (`equals`, `notEquals`, `contains`, `notContains`, `greaterThan(OrEqual)`, `lessThan(OrEqual)`, `isEmpty`, `isNotEmpty`) and applies an `action` (`show`, `hide`, `enable`, `disable`). Rules are grouped by action and combined with the group's strategy; `hide` wins over `show` and `disable` wins over `enable` when both are active. Evaluation is pure and framework-neutral (`evaluateFieldConditions`, `evaluateSchemaConditions` in `@formknot/core`); `@formknot/core` also detects circular conditional dependencies at schema-validation time. In the React renderer, hidden fields have their value cleared by default (`settings.clearHiddenFieldValues`, default `true`) and only visible fields are validated by default (`settings.validateVisibleFieldsOnly`, default `true`).

## Custom validators

See [Validation](#validation) above — register by id with `createValidatorRegistry()` and pass the registry to `FormKnotForm` (or `FormKnotBuilder`, for its live preview) via the `validators` prop.

## Custom fields

```tsx
import { createFormKnotFieldRegistry } from "@formknot/react";
import { CurrencyInput } from "./CurrencyInput";

const fields = createFormKnotFieldRegistry(); // pre-populated with all 12 built-ins
fields.register("currency", {
  component: CurrencyInput,
  label: "Currency",
  defaultConfig: { label: "Amount", metadata: { currency: "USD" } },
});

<FormKnotForm schema={schema} components={fields} />;
<FormKnotBuilder components={fields} />; // also appears in the palette
```

Because `@formknot/core`'s schema validator whitelists the 12 built-in field types by default, pass the same custom type names to `validateFormKnotSchema(schema, { additionalFieldTypes: ["currency"] })` wherever you validate a schema that uses one (the builder does this internally for you, deriving the list from its `components` registry). The example app (`examples/react-demo`) demonstrates a working `currency` field end to end.

## Styling

Both `@formknot/react` and `@formknot/builder-react` ship an optional stylesheet themed entirely through CSS custom properties (`--formknot-*` / `--formknot-builder-*`) and impose no heavy visual opinion:

```ts
import "@formknot/react/styles.css";
import "@formknot/builder-react/styles.css";
```

Override any custom property, or skip the stylesheet entirely and style the semantic class names (`formknot-field`, `formknot-input`, `formknot-builder-canvas`, …) yourself. Every built-in field component can also be overridden per type via the field registry (see [Custom fields](#custom-fields)).

## Import and export

`@formknot/core` exports `exportSchema(schema)` (pretty-printed, safe JSON) and `importSchema(json)`, which never throws — it returns `{ schema: null, errors }` for malformed JSON or a structurally/semantically invalid document, and strips unsafe keys (`__proto__`, `prototype`, `constructor`) during parsing to guard against prototype pollution. `FormKnotBuilder`'s toolbar wraps both: **Export JSON** shows the current schema with copy-to-clipboard and download, **Import JSON** accepts pasted text or an uploaded `.json` file and surfaces path-based errors without crashing.

## Local development

```bash
npm install
npm run dev          # runs the example Vite app (examples/react-demo)
npm run build         # builds all three packages (core → react → builder-react)
npm run test          # runs the Vitest suite across all packages
npm run lint          # eslint .
npm run typecheck     # tsc --noEmit in every workspace
npm run pack:dry-run  # npm pack --dry-run for all three packages
```

## Testing

Tests are behavioral (Vitest + React Testing Library), not snapshot-based:

- **`@formknot/core`** (56 tests): valid/invalid schemas, duplicate ids/names, every validation rule, every condition operator, `all`/`any` strategies, circular-dependency detection, serialization round-trips and migration, prototype-pollution-safe object utilities.
- **`@formknot/react`** (13 tests): every built-in field, initial/default values, validation messages, submission, conditional show/hide/disable, async custom validation, a registered custom field, duplicate-submission prevention, `aria-describedby`/`aria-invalid` wiring.
- **`@formknot/builder-react`** (14 tests): adding/reordering/duplicating/deleting fields, undo/redo, validation-rule and option editing, conditional-rule configuration, import/export (including invalid-JSON handling), and `onChange` schema-change events.

Run `npm run test` from the repo root, or `npm run test --workspace @formknot/core` (etc.) for a single package.

## Package builds

Each package builds with `tsup` to ESM + CommonJS with type declarations, a correct `exports` map, tree-shaking (`sideEffects: false` except each package's CSS), and only ships `dist/`, `README.md`, and `LICENSE`. `npm run build` builds `@formknot/core` → `@formknot/react` → `@formknot/builder-react` in dependency order.

## Publishing instructions

**No package is published automatically by anything in this repository.** To publish (after review — bump versions first, see below):

```bash
npm run build
npm run pack:dry-run   # sanity check tarball contents first
npm publish --workspace @formknot/core --access public
npm publish --workspace @formknot/react --access public
npm publish --workspace @formknot/builder-react --access public
```

Publish `@formknot/core` before `@formknot/react`, and `@formknot/react` before `@formknot/builder-react`, so each package's published dependency range is satisfiable. Update the placeholder `repository.url` in each package's `package.json` to your actual repository before publishing.

## Semantic versioning

All three packages start at `0.1.0` and version independently. Follow semver: patch for fixes, minor for backward-compatible additions (a new built-in validation rule, a new builder feature), major for breaking changes to the `FormKnotSchema` shape or a public API. A breaking schema change should ship alongside a migration registered via `registerMigration()` in `@formknot/core` and a bump of `CURRENT_SCHEMA_VERSION`, so existing stored schemas keep importing correctly.

## Known limitations

- **Custom field types and schema validation.** `@formknot/core`'s schema validator only recognizes the 12 built-in field types unless the caller passes `additionalFieldTypes` (see [Custom fields](#custom-fields)). This is deliberate — core has no way to know about a type registered only in a React field-component registry — but it means a schema using a custom field type validates differently depending on whether the validating code knows about that type.
- **Regular-expression rules are not ReDoS-hardened.** `pattern` validation rules and settings wrap `new RegExp(...)` in `try`/`catch` so a malformed expression can't crash validation, but there is no execution-time budget or safe-regex analysis to bound a pathological expression's running time. Treat schemas from untrusted authors accordingly.
- **Conditional-visibility re-render scope.** `@formknot/react` only re-evaluates conditions when a field referenced as a condition's `sourceField` changes (not on every keystroke in the form), which is efficient but means a condition that reads a field indirectly (e.g. through a custom validator) won't retrigger visibility changes.
- **Drag-and-drop into a specific canvas position.** Dragging a palette item onto the canvas always appends the new field at the end; only *reordering already-added* fields supports precise positioning (via `@dnd-kit`, or the keyboard-accessible ↑/↓ buttons).
- **No built-in persistence.** Neither the renderer nor the builder read or write storage — wiring `onChange`/`onExport`/`onSubmit` to your backend, local storage, or file system is left to the consumer, as specified.
- **File fields.** `type: "file"` collects `File`/`FileList` objects into form state; there is no built-in upload transport — handle the actual upload in your `onSubmit`.

## License

MIT — see [LICENSE](./LICENSE).
