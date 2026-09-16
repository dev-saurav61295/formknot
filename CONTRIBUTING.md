# Contributing to FormKnot

Thanks for your interest in improving FormKnot. This guide covers how the repository is set up, how to run and test your changes, and what a pull request needs before it can be merged.

## Repository setup

```bash
git clone https://github.com/dev-saurav61295/formknot.git
cd formknot
npm ci
```

**Node and npm:** Node.js 20.x or 22.x (see `engines` in `package.json` for the minimum supported version) and npm 10+. This repository uses [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) — do not install a different package manager (Yarn, pnpm) alongside it, and do not commit an alternate lockfile.

Use `npm ci` (not `npm install`) when you just want to reproduce the exact dependency tree from `package-lock.json`, e.g. before running tests locally or in CI.

## Workspace architecture

```text
packages/core            @formknot/core — framework-neutral schema, validation, conditions (no React/DOM)
packages/react            @formknot/react — FormKnotForm and built-in field components
packages/builder-react     @formknot/builder-react — the visual FormKnotBuilder
examples/react-demo        a Vite app demonstrating all three packages together
```

`@formknot/core` has no dependency on the other two. `@formknot/react` depends on `@formknot/core`. `@formknot/builder-react` depends on both. Respect this direction — `@formknot/core` must never import from `@formknot/react` or `@formknot/builder-react`.

Type checking and tests resolve workspace packages (`@formknot/core`, `@formknot/react`, `@formknot/builder-react`) to their **TypeScript source**, not their built `dist/` output (see `tsconfig.paths.json` and the `resolve.alias` entries in `vitest.config.ts`). This means `npm run typecheck` and `npm test` work immediately after `npm ci`, with no build step required first. Building (`npm run build`) is only needed to produce the `dist/` output that real consumers (and the demo app's production build) resolve through each package's `exports` map.

## Development commands

```bash
npm run dev          # start the demo app (Vite) against workspace source
npm run lint          # eslint .
npm run typecheck     # tsc --noEmit in every workspace, from source
npm test              # vitest run, across all three packages
npm run test:watch    # vitest in watch mode
npm run build         # build @formknot/core, then @formknot/react, then @formknot/builder-react
npm run build:demo    # production-build the demo app against built package output
npm run pack:dry-run  # npm pack --dry-run for all three publishable packages
npm run release:check # the full non-publishing release verification sequence
```

## Running the demo

```bash
npm run dev
```

This opens the Vite demo at `http://localhost:5173`, with a **Build & preview** tab (the visual builder) and a **Render standalone & submit** tab (the renderer used on its own, outside the builder).

## Running package-specific tests

```bash
npm test --workspace @formknot/core
npm test --workspace @formknot/react
npm test --workspace @formknot/builder-react
```

Or run a single file / pattern directly with Vitest from the repo root:

```bash
npx vitest run packages/core/src/schemaValidation.test.ts
npx vitest run -t "conditional"
```

## Testing requirements

- Write **behavioral** tests (Testing Library queries, user interactions, observable outputs) rather than snapshot tests. A snapshot test may supplement, but must not be the only coverage for new behavior.
- If you add a validation rule, a condition operator, a built-in field, or a builder feature, add a test for it in the corresponding package.
- If you fix a bug, add a test that would have caught it.
- `npm test` must finish without unexpected `act(...)` warnings or other unhandled console errors. Fix the root cause (usually a missing `await`/`findBy*`/`waitFor`) rather than suppressing `console.error`.

## Accessibility expectations

FormKnot targets WCAG 2.1 AA practices. For any change touching `@formknot/react` or `@formknot/builder-react` markup:

- Every input needs an associated, visible label (`htmlFor`/`id`), not a placeholder standing in for one.
- Errors must be associated via `aria-describedby` and flagged via `aria-invalid`.
- Grouped controls (radio groups, checkbox groups) use `fieldset`/`legend`.
- Anything achievable only by mouse drag (e.g. reordering fields in the builder) needs a keyboard-operable equivalent — see the ↑/↓ buttons next to the drag handle in `FieldRow` for the existing pattern.
- Verify focus is visible and goes somewhere sensible after the interaction (e.g. the first invalid field is focused on failed submission).

## Security expectations

- Never introduce `eval`, `new Function`, or `dangerouslySetInnerHTML`.
- Never store or execute anything resembling code inside a `FormKnotSchema` — schemas must stay plain, JSON-serializable data.
- Any code that reads external/imported data (schema import, form values) must go through the existing safe-object utilities (`safeClone`, `safeJsonParse`, `safeGet`/`safeSet` in `@formknot/core`) so that `__proto__`/`prototype`/`constructor` keys stay blocked.
- Treat any new use of a user-supplied regular expression the way `pattern` validation rules are already handled: wrapped in `try`/`catch`, never trusted to be safe to execute unboundedly.
- Run `npm audit --omit=dev` before proposing a dependency change and mention the result in your PR if it's not clean.

## Commit and changelog guidance

- Write commit messages that describe *why*, not just *what* — the diff already shows what changed.
- Do not add AI/tool attribution trailers to commits or PR descriptions.
- Add a line under `## [Unreleased]` in `CHANGELOG.md` for any user-visible change (new feature, fix, or breaking change), following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) categories (`Added`, `Changed`, `Fixed`, `Removed`).
- Follow [Semantic Versioning](https://semver.org/): a schema-shape or public-API breaking change needs a **major** bump and, if it changes `FormKnotSchema`, a migration registered via `registerMigration()` in `@formknot/core`.

## Pull request expectations

- Keep PRs focused — a bug fix doesn't need to also refactor unrelated code.
- Fill in the pull request template, including the accessibility and breaking-change checklists.
- Make sure `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` all pass locally (CI will run the same checks, plus `npm run build:demo` and `npm run pack:dry-run`).
- Large or architectural changes are easier to review if discussed in an issue first.

## Publishing

**Only maintainers publish npm releases**, manually, with two-factor authentication, after running `npm run release:check`. Contributors should never run `npm publish` or request npm tokens as part of a contribution — see the root `README.md`'s "Publishing instructions" section for the exact release process.
