## Summary

<!-- What does this PR change, and why? -->

## Affected package(s)

- [ ] `@formknot/core`
- [ ] `@formknot/react`
- [ ] `@formknot/builder-react`
- [ ] Demo app (`examples/react-demo`)
- [ ] Documentation only

## Testing

<!-- What did you run, and what did it show? -->

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes, with new/updated behavioral tests for this change (not snapshot-only)
- [ ] `npm run build` succeeds for every affected package
- [ ] Manually exercised the change in the demo app (`npm run dev`), if it touches rendering or the builder UI

## Accessibility

<!-- Only relevant for @formknot/react and @formknot/builder-react UI changes. -->

- [ ] Not applicable (no UI/markup change)
- [ ] Verified keyboard operability
- [ ] Verified label/description/error associations (`aria-describedby`, `aria-invalid`) where relevant
- [ ] Verified a non-drag path exists for any new drag-and-drop interaction

## Breaking changes

- [ ] This PR contains no breaking changes to the public API or `FormKnotSchema` shape
- [ ] This PR **does** change the public API or schema shape — described below, with a migration note added under `@formknot/core`'s migrations if the schema shape changed

<!-- If breaking, describe the change and the upgrade path here. -->

## Changelog

- [ ] Added an entry under `## [Unreleased]` in `CHANGELOG.md`
