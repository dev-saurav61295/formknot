import { fieldHasOptions } from "@formknot/core";
import type { FormKnotField } from "@formknot/core";
import { GeneralFieldSettings } from "./GeneralFieldSettings";
import { OptionsEditor } from "./OptionsEditor";
import { ValidationRuleEditor } from "./ValidationRuleEditor";
import { ConditionEditor } from "./ConditionEditor";

export interface SettingsPanelProps {
  field: FormKnotField | undefined;
  allFields: FormKnotField[];
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

export function SettingsPanel({ field, allFields, onUpdate }: SettingsPanelProps) {
  if (!field) {
    return (
      <aside className="formknot-builder-settings" aria-label="Field settings">
        <h2 className="formknot-builder-panel-title">Settings</h2>
        <p className="formknot-builder-empty-state">Select a field on the canvas to edit its settings.</p>
      </aside>
    );
  }

  return (
    <aside className="formknot-builder-settings" aria-label="Field settings">
      <h2 className="formknot-builder-panel-title">Settings — {field.label}</h2>
      <details open>
        <summary>General</summary>
        <GeneralFieldSettings field={field} onUpdate={onUpdate} />
      </details>
      {fieldHasOptions(field) && (
        <details open>
          <summary>Options</summary>
          <OptionsEditor field={field} onUpdate={onUpdate} />
        </details>
      )}
      <details>
        <summary>Validation</summary>
        <ValidationRuleEditor field={field} onUpdate={onUpdate} />
      </details>
      <details>
        <summary>Conditional logic</summary>
        <ConditionEditor field={field} otherFields={allFields.filter((f) => f.id !== field.id)} onUpdate={onUpdate} />
      </details>
    </aside>
  );
}
