# Changelog

All notable changes to the FormKnot packages will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/). Each
of `@formknot/core`, `@formknot/react`, and `@formknot/builder-react` is
versioned independently once published, but shares this changelog while the
three packages move together during initial development.

## [0.1.1] - 2026-09-18

### Fixed

- **`@formknot/builder-react`**: the delete-confirmation modal's Cancel button had no
  base styling (it fell back to raw browser-default chrome), so it visually
  mismatched the Delete button next to it. Added the missing button styling for
  the modal's action row.
- **`@formknot/react`**: `FormKnotForm`'s default Submit/Reset actions rendered even
  when the schema had no visible, interactive field (e.g. a schema made up only of
  `hidden` fields, or every field hidden by a condition). The default actions now
  only render when at least one non-hidden field is currently visible.
- **`@formknot/builder-react`**: the "CSS class name" field setting accepted any
  string, including digits-only values that aren't usable CSS class names. It now
  validates the value and shows an inline error instead of committing an invalid
  class name to the schema.
- **`@formknot/builder-react`**: a field could have both Required and Disabled
  enabled at once, a contradictory state for form consumers to handle. Enabling
  either setting now clears the other.
- **`@formknot/builder-react`**: editing a field's Default Value in the settings
  panel didn't reach the live preview unless a field was also added or removed,
  because the preview only remounted on a field-id-set change and
  `react-hook-form` only applies `defaultValues` at mount. The preview now also
  remounts when a field's default value changes.
- **`@formknot/builder-react`**: dragging a field in the canvas auto-scrolled the
  whole page via dnd-kit's default window-level auto-scroll. Auto-scroll is now
  disabled on the canvas's drag context.

## [0.1.0] - 2026-09-16

Version 0.1.0 is the initial public release of the FormKnot packages on npm. This entry describes
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
