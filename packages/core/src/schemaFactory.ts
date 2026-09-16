import { CURRENT_SCHEMA_VERSION } from "./constants";
import { generateId } from "./id";
import type { FormKnotField, FormKnotFieldType, FormKnotSchema } from "./types";

/** Creates an empty, valid FormKnotSchema shell. */
export function createEmptySchema(overrides: Partial<FormKnotSchema> = {}): FormKnotSchema {
  return {
    id: overrides.id ?? generateId("schema"),
    title: overrides.title,
    description: overrides.description,
    version: CURRENT_SCHEMA_VERSION,
    fields: overrides.fields ?? [],
    settings: overrides.settings ?? { clearHiddenFieldValues: true, validateVisibleFieldsOnly: true },
    metadata: overrides.metadata,
  };
}

const FIELDS_WITH_OPTIONS: readonly FormKnotFieldType[] = ["select", "radio", "checkboxGroup"];

/** Creates a new field of the given type with sensible defaults, ready to append to a schema. */
export function createField(type: FormKnotFieldType, overrides: Partial<FormKnotField> = {}): FormKnotField {
  const id = overrides.id ?? generateId("field");
  const base = {
    id,
    type,
    name: overrides.name ?? id,
    label: overrides.label ?? "New field",
    ...overrides,
  } as FormKnotField;

  if (FIELDS_WITH_OPTIONS.includes(type) && !("options" in base && Array.isArray((base as { options?: unknown }).options))) {
    (base as { options?: unknown }).options = [
      { id: generateId("option"), label: "Option 1", value: "option-1" },
      { id: generateId("option"), label: "Option 2", value: "option-2" },
    ];
  }

  return base;
}
