import { ALL_FIELD_TYPES } from "@formknot/core";
import type { FormKnotFieldComponentRegistry } from "@formknot/react";
import { FIELD_DND_MIME } from "../types";

const BUILT_IN_LABELS: Record<string, string> = {
  text: "Text",
  textarea: "Textarea",
  email: "Email",
  password: "Password",
  number: "Number",
  select: "Select",
  radio: "Radio group",
  checkbox: "Checkbox",
  checkboxGroup: "Checkbox group",
  date: "Date",
  file: "File",
  hidden: "Hidden",
};

export interface FieldPaletteProps {
  registry?: FormKnotFieldComponentRegistry;
  onAddField: (fieldType: string) => void;
}

export function FieldPalette({ registry, onAddField }: FieldPaletteProps) {
  const customTypes = registry ? registry.types().filter((type) => !(ALL_FIELD_TYPES as readonly string[]).includes(type)) : [];

  return (
    <nav className="formknot-builder-palette" aria-label="Field palette">
      <h2 className="formknot-builder-panel-title">Fields</h2>
      <ul className="formknot-builder-palette-list">
        {ALL_FIELD_TYPES.map((type) => (
          <li key={type}>
            <button
              type="button"
              className="formknot-builder-palette-item"
              draggable
              onDragStart={(event) => event.dataTransfer.setData(FIELD_DND_MIME, type)}
              onClick={() => onAddField(type)}
            >
              {BUILT_IN_LABELS[type] ?? type}
            </button>
          </li>
        ))}
        {customTypes.map((type) => (
          <li key={type}>
            <button
              type="button"
              className="formknot-builder-palette-item formknot-builder-palette-item-custom"
              draggable
              onDragStart={(event) => event.dataTransfer.setData(FIELD_DND_MIME, type)}
              onClick={() => onAddField(type)}
            >
              {registry?.get(type)?.label ?? type}
            </button>
          </li>
        ))}
      </ul>
      <p className="formknot-builder-palette-hint">Click or drag a field onto the canvas.</p>
    </nav>
  );
}
