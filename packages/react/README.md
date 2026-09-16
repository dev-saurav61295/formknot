# @formknot/react

Accessible React renderer for **FormKnot** dynamic form schemas.

Renders a `FormKnotSchema` (see `@formknot/core`) as a real, accessible React form powered by [react-hook-form](https://react-hook-form.com), with conditional show/hide/enable/disable, built-in and custom validation, and a fully overridable field-component registry.

## Install

```bash
npm install @formknot/react @formknot/core
```

## Quick start

```tsx
import { FormKnotForm } from "@formknot/react";
import "@formknot/react/styles.css";
import type { FormKnotSchema } from "@formknot/core";

const schema: FormKnotSchema = {
  id: "contact",
  version: 1,
  fields: [
    { id: "f1", type: "text", name: "name", label: "Name", required: true,
      validations: [{ id: "v1", type: "required", message: "Name is required" }] },
    { id: "f2", type: "email", name: "email", label: "Email" },
  ],
};

export function ContactForm() {
  return (
    <FormKnotForm
      schema={schema}
      validateOn="blur"
      onSubmit={(result) => console.log(result.data)}
      onInvalid={(errors) => console.warn(errors)}
    />
  );
}
```

## Features

- Built-in accessible components for every FormKnot field type (text, textarea, email, password, number, select, radio, checkbox, checkbox group, date, file, hidden).
- Conditional visibility/enabled state recomputed only from the fields actually referenced by a condition, not the whole form.
- Validation driven entirely by `@formknot/core`'s `validateFormData`, so the same rules run identically outside React.
- Custom fields via `createFormKnotFieldRegistry()` — register a component under any field type and pass the registry as `components`.
- Focuses the first invalid field on failed submission, associates errors via `aria-describedby`/`aria-invalid`, and renders a live error summary.
- Ships an optional stylesheet (`@formknot/react/styles.css`) themed entirely through `--formknot-*` CSS custom properties.

## Custom fields

```tsx
import { createFormKnotFieldRegistry } from "@formknot/react";

const fields = createFormKnotFieldRegistry();
fields.register("currency", { component: CurrencyInput });

<FormKnotForm schema={schema} components={fields} />;
```

## Part of the FormKnot monorepo

This package is published from [dev-saurav61295/formknot](https://github.com/dev-saurav61295/formknot), alongside `@formknot/core` and `@formknot/builder-react`. See the [root README](https://github.com/dev-saurav61295/formknot#readme) for the full architecture and [`CONTRIBUTING.md`](https://github.com/dev-saurav61295/formknot/blob/main/CONTRIBUTING.md) to contribute.

## License

MIT
