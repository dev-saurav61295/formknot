# Security Policy

## Supported Versions

FormKnot has not yet had its first public release. Once `@formknot/core`,
`@formknot/react`, and `@formknot/builder-react` are published, security
fixes will target the latest `0.x` minor release of each package. Because the
project is pre-1.0, there is no long-term-support version line yet — please
upgrade to the latest published version before reporting an issue, if
possible.

| Package                    | Supported          |
| --------------------------- | ------------------- |
| `@formknot/core`             | latest `0.x` release |
| `@formknot/react`            | latest `0.x` release |
| `@formknot/builder-react`     | latest `0.x` release |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub
issues, discussions, or pull requests.**

Instead, use GitHub's private vulnerability reporting for this repository:

1. Go to the [Security tab](https://github.com/dev-saurav61295/formknot/security) of this repository.
2. Select **"Report a vulnerability"** to open a private advisory.

This opens a private conversation with the maintainers that is not visible
to the public until a fix is available and the advisory is published.

If private reporting is ever unavailable for this repository, open a regular
issue asking a maintainer to enable it or provide an alternative private
contact — without including any exploit details in that issue.

### What to include in your report

To help us triage and fix the issue quickly, please include:

* The affected package(s) and version(s) (`@formknot/core`, `@formknot/react`,
  and/or `@formknot/builder-react`).
* A description of the vulnerability and its potential impact (e.g. schema
  injection, prototype pollution, XSS via a rendered field, ReDoS via a
  validation pattern).
* A minimal reproduction: a schema, form values, or builder interaction that
  triggers the issue.
* Whether the issue requires a specific configuration (e.g. a custom field,
  a specific validator) to trigger.
* Your suggested severity, if you have one, and any suggested remediation.

### What to expect

* We will acknowledge a new report as soon as we reasonably can.
* We will investigate and let you know whether it is confirmed, and give an
  estimate for a fix where possible.
* We will credit reporters in the published security advisory, unless you
  ask to remain anonymous.
* We cannot guarantee a fixed response time or bug bounty — this is a
  community project maintained on a best-effort basis, not a commercial
  product with a formal SLA.

## Scope

This policy covers the code in this repository: `@formknot/core`,
`@formknot/react`, `@formknot/builder-react`, and the demo application under
`examples/react-demo`. Vulnerabilities in FormKnot's dependencies should
generally be reported to those projects directly, but we welcome a report
here too if you're unsure, or if FormKnot's usage of a dependency makes an
otherwise-minor upstream issue exploitable.
