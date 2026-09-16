#!/usr/bin/env node
/**
 * Package-consumer smoke test.
 *
 * Packs all three publishable FormKnot packages into real tarballs, installs
 * them into an isolated temporary "consumer" project (the way an external
 * user would), and verifies:
 *
 *   - ESM `import` resolves and runs
 *   - CommonJS `require` resolves and runs
 *   - TypeScript type resolution works for both ESM and CJS consumers
 *   - `@formknot/react/styles.css` and `@formknot/builder-react/styles.css`
 *     resolve to real files
 *   - `@formknot/react` and `@formknot/builder-react` resolve their internal
 *     `@formknot/core` (and `@formknot/react`) dependency to a single,
 *     de-duplicated copy rather than a nested duplicate
 *
 * This script never publishes anything. It only packs local tarballs,
 * installs them into a throwaway temp directory, and deletes that directory
 * when it's done (including on failure).
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const PACKAGES = [
  { name: "@formknot/core", dir: join(REPO_ROOT, "packages/core") },
  { name: "@formknot/react", dir: join(REPO_ROOT, "packages/react") },
  { name: "@formknot/builder-react", dir: join(REPO_ROOT, "packages/builder-react") },
];

function run(command, args, options = {}) {
  return execFileSync(command, args, { stdio: "pipe", encoding: "utf8", ...options });
}

function log(message) {
  process.stdout.write(`[smoke-test] ${message}\n`);
}

function fail(message) {
  process.stderr.write(`[smoke-test] FAILED: ${message}\n`);
  process.exitCode = 1;
  throw new Error(message);
}

const workDir = mkdtempSync(join(tmpdir(), "formknot-smoke-"));
log(`working directory: ${workDir}`);

try {
  // 1. Build, then pack, each package into a real (non-dry-run) tarball.
  //    Building explicitly first (rather than relying on `prepack`) keeps
  //    the build tool's own log output out of `npm pack --json`'s stdout,
  //    so `--ignore-scripts` gives us clean, parseable JSON.
  const tarballs = {};
  for (const pkg of PACKAGES) {
    log(`building ${pkg.name}...`);
    run("npm", ["run", "build"], { cwd: pkg.dir });
    log(`packing ${pkg.name}...`);
    const output = run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", workDir], { cwd: pkg.dir });
    const [{ filename }] = JSON.parse(output);
    tarballs[pkg.name] = join(workDir, filename);
    log(`  -> ${filename}`);
  }

  // 2. Create an isolated consumer project depending on the local tarballs.
  const consumerDir = join(workDir, "consumer");
  mkdirSync(consumerDir, { recursive: true });

  const consumerPackageJson = {
    name: "formknot-smoke-test-consumer",
    private: true,
    version: "0.0.0",
    dependencies: {
      "@formknot/core": `file:${tarballs["@formknot/core"]}`,
      "@formknot/react": `file:${tarballs["@formknot/react"]}`,
      "@formknot/builder-react": `file:${tarballs["@formknot/builder-react"]}`,
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    devDependencies: {
      typescript: "^5.5.4",
    },
  };
  writeFileSync(join(consumerDir, "package.json"), JSON.stringify(consumerPackageJson, null, 2));

  log("installing tarballs into the consumer project (npm install, no lockfile)...");
  run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: consumerDir });

  // 3. ESM consumer probe.
  const esmProbe = `
import { createEmptySchema, createField, validateFormKnotSchema } from "@formknot/core";
import { FormKnotForm } from "@formknot/react";
import { FormKnotBuilder } from "@formknot/builder-react";

const schema = createEmptySchema({ id: "smoke" });
schema.fields.push(createField("text", { name: "n", label: "N" }));
const result = validateFormKnotSchema(schema);
if (!result.valid) throw new Error("ESM: expected schema to be valid, got: " + JSON.stringify(result.errors));
if (typeof FormKnotForm !== "function") throw new Error("ESM: FormKnotForm did not resolve to a function");
if (typeof FormKnotBuilder !== "function") throw new Error("ESM: FormKnotBuilder did not resolve to a function");
console.log("ESM_PROBE_OK");
`;
  writeFileSync(join(consumerDir, "esm-probe.mjs"), esmProbe);
  const esmOutput = run("node", ["esm-probe.mjs"], { cwd: consumerDir });
  if (!esmOutput.includes("ESM_PROBE_OK")) fail("ESM probe did not report success");
  log("ESM import: OK");

  // 4. CommonJS consumer probe.
  const cjsProbe = `
const { createEmptySchema, createField, validateFormKnotSchema } = require("@formknot/core");
const { FormKnotForm } = require("@formknot/react");
const { FormKnotBuilder } = require("@formknot/builder-react");

const schema = createEmptySchema({ id: "smoke-cjs" });
schema.fields.push(createField("email", { name: "e", label: "E" }));
const result = validateFormKnotSchema(schema);
if (!result.valid) throw new Error("CJS: expected schema to be valid, got: " + JSON.stringify(result.errors));
if (typeof FormKnotForm !== "function") throw new Error("CJS: FormKnotForm did not resolve to a function");
if (typeof FormKnotBuilder !== "function") throw new Error("CJS: FormKnotBuilder did not resolve to a function");

const reactStylesPath = require.resolve("@formknot/react/styles.css");
const builderStylesPath = require.resolve("@formknot/builder-react/styles.css");
if (!require("fs").existsSync(reactStylesPath)) throw new Error("CJS: @formknot/react/styles.css did not resolve to a real file");
if (!require("fs").existsSync(builderStylesPath)) throw new Error("CJS: @formknot/builder-react/styles.css did not resolve to a real file");

console.log("CJS_PROBE_OK");
`;
  writeFileSync(join(consumerDir, "cjs-probe.cjs"), cjsProbe);
  const cjsOutput = run("node", ["cjs-probe.cjs"], { cwd: consumerDir });
  if (!cjsOutput.includes("CJS_PROBE_OK")) fail("CJS probe did not report success");
  log("CommonJS require + stylesheet resolution: OK");

  // 5. TypeScript type-resolution probe (both module targets).
  const typesProbe = `
import type { FormKnotSchema } from "@formknot/core";
import type { FormKnotFormProps } from "@formknot/react";
import type { FormKnotBuilderProps } from "@formknot/builder-react";

const schema: FormKnotSchema = { id: "types-probe", version: 1, fields: [] };
const rendererProps: FormKnotFormProps = { schema };
const builderProps: FormKnotBuilderProps = { initialSchema: schema };
void rendererProps;
void builderProps;
`;
  writeFileSync(join(consumerDir, "types-probe.ts"), typesProbe);

  for (const [label, tsconfig] of [
    ["ESM (bundler resolution)", { module: "ESNext", moduleResolution: "Bundler" }],
    ["CJS (node16 resolution)", { module: "Node16", moduleResolution: "Node16" }],
  ]) {
    const tsconfigPath = join(consumerDir, `tsconfig.${label.includes("CJS") ? "cjs" : "esm"}.json`);
    writeFileSync(
      tsconfigPath,
      JSON.stringify(
        {
          compilerOptions: {
            ...tsconfig,
            target: "ES2020",
            jsx: "react-jsx",
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            esModuleInterop: true,
          },
          files: ["types-probe.ts"],
        },
        null,
        2
      )
    );
    run("npx", ["tsc", "--noEmit", "-p", tsconfigPath], { cwd: consumerDir });
    log(`TypeScript type resolution (${label}): OK`);
  }

  // 6. Internal FormKnot dependency resolution: confirm no nested, duplicate
  //    copy of @formknot/core (or @formknot/react) got installed under a
  //    dependent package's own node_modules — i.e. npm deduplicated them
  //    against the top-level install.
  const nestedCoreUnderReact = join(consumerDir, "node_modules/@formknot/react/node_modules/@formknot/core");
  const nestedCoreUnderBuilder = join(consumerDir, "node_modules/@formknot/builder-react/node_modules/@formknot/core");
  const nestedReactUnderBuilder = join(consumerDir, "node_modules/@formknot/builder-react/node_modules/@formknot/react");
  for (const [label, path] of [
    ["@formknot/core nested under @formknot/react", nestedCoreUnderReact],
    ["@formknot/core nested under @formknot/builder-react", nestedCoreUnderBuilder],
    ["@formknot/react nested under @formknot/builder-react", nestedReactUnderBuilder],
  ]) {
    if (existsSync(path)) fail(`internal dependency was not de-duplicated: ${label} (found ${path})`);
  }
  log("Internal FormKnot dependency resolution (single de-duplicated copy): OK");

  log("All package-consumer smoke tests passed.");
} finally {
  rmSync(workDir, { recursive: true, force: true });
  log(`cleaned up ${workDir}`);
}
