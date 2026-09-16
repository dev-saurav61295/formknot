import type { FormKnotField } from "@formknot/core";
import { TextSetting } from "./TextSetting";
import { BooleanSetting } from "./BooleanSetting";

export interface DefaultValueEditorProps {
  field: FormKnotField;
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

export function DefaultValueEditor({ field, onUpdate }: DefaultValueEditorProps) {
  if (field.type === "hidden") return null;

  if (field.type === "checkbox") {
    return (
      <BooleanSetting
        id="setting-defaultValue"
        label="Default checked"
        checked={Boolean(field.defaultValue)}
        onChange={(checked) => onUpdate({ defaultValue: checked })}
      />
    );
  }

  if (field.type === "select" || field.type === "radio") {
    return (
      <div className="formknot-builder-setting">
        <label htmlFor="setting-defaultValue">Default value</label>
        <select
          id="setting-defaultValue"
          value={field.defaultValue === undefined ? "" : String(field.defaultValue)}
          onChange={(event) => onUpdate({ defaultValue: event.target.value || undefined })}
        >
          <option value="">(none)</option>
          {field.options.map((option) => (
            <option key={option.id} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "checkboxGroup") {
    const selected = Array.isArray(field.defaultValue) ? field.defaultValue.map(String) : [];
    return (
      <fieldset className="formknot-builder-attributes">
        <legend>Default value</legend>
        {field.options.map((option) => (
          <label key={option.id} className="formknot-builder-inline-checkbox">
            <input
              type="checkbox"
              checked={selected.includes(String(option.value))}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...selected, String(option.value)]
                  : selected.filter((v) => v !== String(option.value));
                onUpdate({ defaultValue: next });
              }}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }

  if (field.type === "number") {
    return (
      <TextSetting
        id="setting-defaultValue"
        label="Default value"
        type="number"
        value={field.defaultValue === undefined ? "" : String(field.defaultValue)}
        onCommit={(value) => onUpdate({ defaultValue: value === "" ? undefined : Number(value) })}
      />
    );
  }

  return (
    <TextSetting
      id="setting-defaultValue"
      label="Default value"
      value={field.defaultValue === undefined ? "" : String(field.defaultValue)}
      onCommit={(value) => onUpdate({ defaultValue: value || undefined })}
    />
  );
}
