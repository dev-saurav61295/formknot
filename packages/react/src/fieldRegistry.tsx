import type { FormKnotField } from "@formknot/core";
import { TextLikeField } from "./components/TextLikeField";
import { TextareaField } from "./components/TextareaField";
import { SelectField } from "./components/SelectField";
import { RadioField } from "./components/RadioField";
import { CheckboxField } from "./components/CheckboxField";
import { CheckboxGroupField } from "./components/CheckboxGroupField";
import { FileField } from "./components/FileField";
import { HiddenField } from "./components/HiddenField";
import type { FormKnotFieldComponentRegistry, FormKnotFieldTypeDefinition } from "./types";

function defaultDefinitions(): Record<string, FormKnotFieldTypeDefinition<never>> {
  return {
    text: { component: TextLikeField as never, label: "Text" },
    email: { component: TextLikeField as never, label: "Email" },
    password: { component: TextLikeField as never, label: "Password" },
    number: { component: TextLikeField as never, label: "Number" },
    date: { component: TextLikeField as never, label: "Date" },
    textarea: { component: TextareaField as never, label: "Textarea" },
    select: { component: SelectField as never, label: "Select" },
    radio: { component: RadioField as never, label: "Radio group" },
    checkbox: { component: CheckboxField as never, label: "Checkbox" },
    checkboxGroup: { component: CheckboxGroupField as never, label: "Checkbox group" },
    file: { component: FileField as never, label: "File" },
    hidden: { component: HiddenField as never, label: "Hidden" },
  };
}

/**
 * Creates a field-component registry pre-populated with FormKnot's built-in
 * field renderers. Call `.register()` to add custom field types or override
 * a built-in one, then pass the registry as `components` to `FormKnotForm`.
 */
export function createFormKnotFieldRegistry(): FormKnotFieldComponentRegistry {
  const definitions = new Map<string, FormKnotFieldTypeDefinition<never>>(Object.entries(defaultDefinitions()));

  return {
    register(type, definition) {
      if (!type) throw new Error("createFormKnotFieldRegistry: field type must be a non-empty string");
      definitions.set(type, definition as unknown as FormKnotFieldTypeDefinition<never>);
    },
    unregister(type) {
      definitions.delete(type);
    },
    get(type) {
      return definitions.get(type);
    },
    has(type) {
      return definitions.has(type);
    },
    types() {
      return Array.from(definitions.keys());
    },
    all() {
      return Object.fromEntries(definitions);
    },
  };
}

export function isKnownFieldType(registry: FormKnotFieldComponentRegistry, field: FormKnotField): boolean {
  return registry.has(field.type);
}
