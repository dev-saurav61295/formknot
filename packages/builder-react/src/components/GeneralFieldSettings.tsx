import type { FormKnotField } from "@formknot/core";
import { TextSetting } from "./TextSetting";
import { BooleanSetting } from "./BooleanSetting";
import { AttributesEditor } from "./AttributesEditor";
import { DefaultValueEditor } from "./DefaultValueEditor";

export interface GeneralFieldSettingsProps {
  field: FormKnotField;
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

export function GeneralFieldSettings({ field, onUpdate }: GeneralFieldSettingsProps) {
  return (
    <div className="formknot-builder-settings-section">
      <TextSetting id="setting-label" label="Label" value={field.label} onCommit={(value) => onUpdate({ label: value })} />
      <TextSetting id="setting-name" label="Name" value={field.name} onCommit={(value) => onUpdate({ name: value })} />
      <TextSetting
        id="setting-description"
        label="Description"
        value={field.description ?? ""}
        onCommit={(value) => onUpdate({ description: value || undefined })}
        textarea
      />
      {field.type !== "hidden" && field.type !== "checkbox" && (
        <TextSetting
          id="setting-placeholder"
          label="Placeholder"
          value={field.placeholder ?? ""}
          onCommit={(value) => onUpdate({ placeholder: value || undefined })}
        />
      )}
      <TextSetting
        id="setting-classname"
        label="CSS class name"
        value={field.className ?? ""}
        onCommit={(value) => onUpdate({ className: value || undefined })}
      />
      {(field.type === "text" || field.type === "email" || field.type === "password") && (
        <TextSetting
          id="setting-autocomplete"
          label="Autocomplete"
          value={field.autoComplete ?? ""}
          onCommit={(value) => onUpdate({ autoComplete: value || undefined })}
        />
      )}
      <BooleanSetting id="setting-required" label="Required" checked={Boolean(field.required)} onChange={(checked) => onUpdate({ required: checked })} />
      <BooleanSetting id="setting-disabled" label="Disabled" checked={Boolean(field.disabled)} onChange={(checked) => onUpdate({ disabled: checked })} />
      {field.type !== "hidden" && field.type !== "checkbox" && (
        <BooleanSetting id="setting-readonly" label="Read only" checked={Boolean(field.readOnly)} onChange={(checked) => onUpdate({ readOnly: checked })} />
      )}
      <DefaultValueEditor field={field} onUpdate={onUpdate} />
      <AttributesEditor field={field} onUpdate={onUpdate} />
    </div>
  );
}
