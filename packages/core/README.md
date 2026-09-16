# @formknot/core

Framework-neutral schema, validation, and conditional-logic engine for **FormKnot** — *connect fields, rules, and validation into dynamic forms.*

This package has no React or DOM dependency. It defines the JSON-serializable `FormKnotSchema` model and the pure functions that validate, migrate, and evaluate it. `@formknot/react` and `@formknot/builder-react` are both built on top of it.

## Install

```bash
npm install @formknot/core
```

## What's in here

- **Types** — `FormKnotSchema`, `FormKnotField` (discriminated union per field type), `FormKnotValidationRule`, `FormKnotFieldCondition`, `FormKnotConditionGroup`.
- **Schema validation** — `validateFormKnotSchema(schema)` checks structure (via AJV), uniqueness of ids/names, option/validation-rule compatibility, condition field references, circular conditional dependencies, and unsafe object keys. Returns path-based errors.
- **Data validation** — `validateFormData(schema, values, { validators })` runs built-in rules (`required`, `email`, `minLength`, `maxLength`, `min`, `max`, `pattern`) and custom sync/async validators, honoring conditional visibility.
- **Conditions** — `evaluateFieldConditions`, `evaluateSchemaConditions`, `findCircularConditionDependencies` are pure functions with no framework dependency.
- **Registries** — `createValidatorRegistry()` maps a validator id (referenced from a schema) to an implementation that is never itself stored in the schema. `createFieldRegistry()` is the framework-neutral field-type registry contract.
- **Migrations & serialization** — `migrateSchema`, `exportSchema`, `importSchema` (never throws; reports errors instead).
- **Safe object utilities** — `safeClone`, `safeGet`, `safeSet`, `safeJsonParse` strip `__proto__`/`prototype`/`constructor` keys to guard against prototype pollution from imported JSON.

## Example

```ts
import { createEmptySchema, createField, validateFormKnotSchema, validateFormData } from "@formknot/core";

const schema = createEmptySchema({ title: "Signup" });
schema.fields.push(createField("email", { name: "email", label: "Email", required: true }));

const { valid, errors } = validateFormKnotSchema(schema);

const result = await validateFormData(schema, { email: "not-an-email" });
```

## License

MIT
