import type { FormKnotField } from "@formknot/core";
import { TextSetting } from "./TextSetting";
import { BooleanSetting } from "./BooleanSetting";

export interface AttributesEditorProps {
  field: FormKnotField;
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

function setAttribute(field: FormKnotField, key: string, value: unknown, onUpdate: AttributesEditorProps["onUpdate"]) {
  const attributes = { ...(field as { attributes?: Record<string, unknown> }).attributes };
  if (value === "" || value === undefined) {
    delete attributes[key];
  } else {
    attributes[key] = value;
  }
  onUpdate({ attributes } as Partial<FormKnotField>);
}

export function AttributesEditor({ field, onUpdate }: AttributesEditorProps) {
  const attributes = (field as { attributes?: Record<string, unknown> }).attributes ?? {};

  if (field.type === "text" || field.type === "email" || field.type === "password") {
    return (
      <fieldset className="formknot-builder-attributes">
        <legend>Constraints</legend>
        <TextSetting id="attr-minLength" label="Min length" type="number" value={String(attributes.minLength ?? "")} onCommit={(v) => setAttribute(field, "minLength", v === "" ? undefined : Number(v), onUpdate)} />
        <TextSetting id="attr-maxLength" label="Max length" type="number" value={String(attributes.maxLength ?? "")} onCommit={(v) => setAttribute(field, "maxLength", v === "" ? undefined : Number(v), onUpdate)} />
        <TextSetting id="attr-pattern" label="Pattern (regex)" value={String(attributes.pattern ?? "")} onCommit={(v) => setAttribute(field, "pattern", v || undefined, onUpdate)} />
      </fieldset>
    );
  }

  if (field.type === "textarea") {
    return (
      <fieldset className="formknot-builder-attributes">
        <legend>Constraints</legend>
        <TextSetting id="attr-rows" label="Rows" type="number" value={String(attributes.rows ?? "")} onCommit={(v) => setAttribute(field, "rows", v === "" ? undefined : Number(v), onUpdate)} />
        <TextSetting id="attr-minLength" label="Min length" type="number" value={String(attributes.minLength ?? "")} onCommit={(v) => setAttribute(field, "minLength", v === "" ? undefined : Number(v), onUpdate)} />
        <TextSetting id="attr-maxLength" label="Max length" type="number" value={String(attributes.maxLength ?? "")} onCommit={(v) => setAttribute(field, "maxLength", v === "" ? undefined : Number(v), onUpdate)} />
      </fieldset>
    );
  }

  if (field.type === "number") {
    return (
      <fieldset className="formknot-builder-attributes">
        <legend>Constraints</legend>
        <TextSetting id="attr-min" label="Min" type="number" value={String(attributes.min ?? "")} onCommit={(v) => setAttribute(field, "min", v === "" ? undefined : Number(v), onUpdate)} />
        <TextSetting id="attr-max" label="Max" type="number" value={String(attributes.max ?? "")} onCommit={(v) => setAttribute(field, "max", v === "" ? undefined : Number(v), onUpdate)} />
        <TextSetting id="attr-step" label="Step" type="number" value={String(attributes.step ?? "")} onCommit={(v) => setAttribute(field, "step", v === "" ? undefined : Number(v), onUpdate)} />
      </fieldset>
    );
  }

  if (field.type === "date") {
    return (
      <fieldset className="formknot-builder-attributes">
        <legend>Constraints</legend>
        <TextSetting id="attr-min" label="Min date" value={String(attributes.min ?? "")} onCommit={(v) => setAttribute(field, "min", v || undefined, onUpdate)} />
        <TextSetting id="attr-max" label="Max date" value={String(attributes.max ?? "")} onCommit={(v) => setAttribute(field, "max", v || undefined, onUpdate)} />
      </fieldset>
    );
  }

  if (field.type === "file") {
    return (
      <fieldset className="formknot-builder-attributes">
        <legend>Constraints</legend>
        <TextSetting id="attr-accept" label="Accepted file types" value={String(attributes.accept ?? "")} onCommit={(v) => setAttribute(field, "accept", v || undefined, onUpdate)} />
        <BooleanSetting id="attr-multiple" label="Allow multiple files" checked={Boolean(attributes.multiple)} onChange={(checked) => setAttribute(field, "multiple", checked || undefined, onUpdate)} />
      </fieldset>
    );
  }

  return null;
}
