import type { FormKnotField } from "@formknot/core";
import { TextSetting } from "./TextSetting";
import { BooleanSetting } from "./BooleanSetting";
import { AttributesEditor } from "./AttributesEditor";
import { DefaultValueEditor } from "./DefaultValueEditor";

export interface GeneralFieldSettingsProps {
  field: FormKnotField;
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

const CSS_CLASS_TOKEN_PATTERN = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/;

function validateCssClassName(draft: string): string | undefined {
  if (draft.trim() === "") return undefined;
  const invalidToken = draft.split(/\s+/).find((token) => token !== "" && !CSS_CLASS_TOKEN_PATTERN.test(token));
  return invalidToken
    ? `"${invalidToken}" is not a valid CSS class name. Class names can't start with a digit and may only contain letters, digits, hyphens, and underscores.`
    : undefined;
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
        validate={validateCssClassName}
      />
      {(field.type === "text" || field.type === "email" || field.type === "password") && (
        <TextSetting
          id="setting-autocomplete"
          label="Autocomplete"
          value={field.autoComplete ?? ""}
          onCommit={(value) => onUpdate({ autoComplete: value || undefined })}
        />
      )}
      <BooleanSetting
        id="setting-required"
        label="Required"
        checked={Boolean(field.required)}
        onChange={(checked) => onUpdate(checked ? { required: true, disabled: false } : { required: false })}
      />
      <BooleanSetting
        id="setting-disabled"
        label="Disabled"
        checked={Boolean(field.disabled)}
        onChange={(checked) => onUpdate(checked ? { disabled: true, required: false } : { disabled: false })}
      />
      {field.type !== "hidden" && field.type !== "checkbox" && (
        <BooleanSetting id="setting-readonly" label="Read only" checked={Boolean(field.readOnly)} onChange={(checked) => onUpdate({ readOnly: checked })} />
      )}
      <DefaultValueEditor field={field} onUpdate={onUpdate} />
      <AttributesEditor field={field} onUpdate={onUpdate} />
    </div>
  );
}
