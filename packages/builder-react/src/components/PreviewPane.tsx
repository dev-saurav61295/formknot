import { FormKnotForm } from "@formknot/react";
import type { FormKnotSchema, FormKnotValidatorRegistry } from "@formknot/core";
import type { FormKnotFieldComponentRegistry } from "@formknot/react";

export interface PreviewPaneProps {
  schema: FormKnotSchema;
  validators?: FormKnotValidatorRegistry;
  components?: FormKnotFieldComponentRegistry;
}

export function PreviewPane({ schema, validators, components }: PreviewPaneProps) {
  return (
    <section className="formknot-builder-preview" aria-label="Live preview">
      <h2 className="formknot-builder-panel-title">Preview</h2>
      {schema.fields.length === 0 ? (
        <p className="formknot-builder-empty-state">Your form preview will appear here once you add fields.</p>
      ) : (
        <FormKnotForm
          key={schema.fields.map((f) => `${f.id}:${JSON.stringify(f.defaultValue)}`).join(",")}
          schema={schema}
          validators={validators}
          components={components}
          onSubmit={(result) => {
            // eslint-disable-next-line no-console
            console.log("FormKnot preview submission", result);
          }}
        />
      )}
    </section>
  );
}
