import { useState } from "react";
import { FormKnotBuilder } from "@formknot/builder-react";
import "@formknot/builder-react/styles.css";
import { FormKnotForm } from "@formknot/react";
import "@formknot/react/styles.css";
import type { FormKnotSchema, FormKnotValidationResult } from "@formknot/core";
import { sampleSchema } from "./sampleSchema";
import { demoFieldRegistry } from "./fieldRegistry";
import { demoValidators } from "./validators";

type Tab = "build" | "render";

export function App() {
  const [schema, setSchema] = useState<FormKnotSchema>(sampleSchema);
  const [tab, setTab] = useState<Tab>("build");
  const [submitted, setSubmitted] = useState<FormKnotValidationResult | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>FormKnot</h1>
        <p className="app-tagline">Connect fields, rules, and validation into dynamic forms.</p>
        <nav className="app-tabs" aria-label="Demo sections">
          <button type="button" className={tab === "build" ? "active" : ""} onClick={() => setTab("build")}>
            Build &amp; preview
          </button>
          <button type="button" className={tab === "render" ? "active" : ""} onClick={() => setTab("render")}>
            Render standalone &amp; submit
          </button>
        </nav>
      </header>

      {tab === "build" && (
        <section aria-label="Form builder">
          <p className="app-hint">
            Click or drag fields from the palette, reorder them, and use <strong>Export JSON</strong> /{" "}
            <strong>Import JSON</strong> in the toolbar. The panel on the right is a live preview rendered with{" "}
            <code>@formknot/react</code>.
          </p>
          <FormKnotBuilder
            initialSchema={schema}
            components={demoFieldRegistry}
            validators={demoValidators}
            onChange={setSchema}
            onExport={(exported) => console.log("FormKnot: exported schema", exported)}
          />
        </section>
      )}

      {tab === "render" && (
        <section className="app-render-section" aria-label="Standalone renderer">
          <h2>Standalone render (outside the builder)</h2>
          <p className="app-hint">
            This renders the same schema with only <code>@formknot/react</code> — no builder involved. Try
            submitting <code>taken@example.com</code> to see the async validator reject it.
          </p>
          <FormKnotForm
            key={schema.fields.map((f) => f.id).join(",")}
            schema={schema}
            components={demoFieldRegistry}
            validators={demoValidators}
            validateOn="blur"
            onSubmit={async (result) => setSubmitted(result)}
            onInvalid={(errors) => console.warn("FormKnot: invalid submission", errors)}
          />
          {submitted && (
            <div className="app-submission-result">
              <h3>Submitted values</h3>
              <pre>{JSON.stringify(submitted.data, null, 2)}</pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
