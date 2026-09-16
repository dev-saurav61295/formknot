# Changelog

All notable changes to the FormKnot packages will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/). Each
of `@formknot/core`, `@formknot/react`, and `@formknot/builder-react` is
versioned independently once published, but shares this changelog while the
three packages move together during initial development.

## [0.1.0] - Unreleased

These packages have **not yet been published to npm**. This entry describes
the capabilities that will ship in the first public release, once
`npm run release:check` passes and a maintainer publishes manually with
two-factor authentication.

### Added

- **`@formknot/core`**: the `FormKnotSchema` type model (discriminated field
  union across all 12 built-in field types); AJV-backed structural schema
  validation plus semantic checks (unique ids/names, option and
  validation-rule compatibility, condition field references, circular
  conditional-dependency detection, unsafe-key blocking); form-data
  validation (`required`, `email`, `minLength`, `maxLength`, `min`, `max`,
  `pattern`, and registry-based sync/async `custom` rules); pure conditional
  visibility/enabled evaluation (`show`/`hide`/`enable`/`disable`,
  `all`/`any` strategies); schema versioning and migration; safe
  JSON import/export with prototype-pollution-resistant parsing.
- **`@formknot/react`**: the `FormKnotForm` component, react-hook-form
  integration via a resolver that calls directly into `@formknot/core`'s
  data validation, accessible built-in components for every field type,
  a custom field-component registry (`createFormKnotFieldRegistry`),
  conditional field visibility/enabled state scoped to only the fields a
  condition actually reads, an accessible error summary, first-invalid-field
  focus on failed submission, and an optional CSS-variable-themed stylesheet.
- **`@formknot/builder-react`**: the `FormKnotBuilder` component — a field
  palette, a reorderable canvas (drag via `@dnd-kit` plus keyboard-operable
  ↑/↓ buttons), a settings panel (attributes, validation rules, options,
  conditional rules), a live preview rendered with `@formknot/react`,
  undo/redo, JSON import/export (paste, file upload, copy-to-clipboard,
  download), delete-with-confirmation, and schema-validity-gated `onChange`
  events.
- A Vite demo application (`examples/react-demo`) exercising all three
  packages together: building a form visually, a standalone renderer tab,
  a conditional company-name field, a custom `currency` field, and an
  asynchronous `uniqueEmail` validator.
- A GitHub Actions CI workflow running lint, type checking, tests, package
  builds, the demo build, and a package-tarball dry run on every pull
  request and push to `main`.
- Contribution, code of conduct, and security-reporting documentation.

### Known limitations

See the "Known limitations" section of the root `README.md` for details on
custom-field schema-validation scope, regex/ReDoS handling, and
conditional-visibility re-render scope.

[Unreleased]: https://github.com/dev-saurav61295/formknot/commits/main
