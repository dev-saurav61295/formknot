import { generateId } from "@formknot/core";
import type { FormKnotField, FormKnotFieldOption, FormKnotFieldWithOptions } from "@formknot/core";
import { TextSetting } from "./TextSetting";
import { BooleanSetting } from "./BooleanSetting";

export interface OptionsEditorProps {
  field: FormKnotFieldWithOptions;
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

export function OptionsEditor({ field, onUpdate }: OptionsEditorProps) {
  const options = field.options;

  function updateOption(id: string, updates: Partial<FormKnotFieldOption>) {
    onUpdate({ options: options.map((o) => (o.id === id ? { ...o, ...updates } : o)) } as Partial<FormKnotField>);
  }

  function removeOption(id: string) {
    onUpdate({ options: options.filter((o) => o.id !== id) } as Partial<FormKnotField>);
  }

  function addOption() {
    const next: FormKnotFieldOption = { id: generateId("option"), label: `Option ${options.length + 1}`, value: `option-${options.length + 1}` };
    onUpdate({ options: [...options, next] } as Partial<FormKnotField>);
  }

  return (
    <fieldset className="formknot-builder-options-editor">
      <legend>Options</legend>
      {options.length === 0 && <p className="formknot-builder-empty-state">No options yet.</p>}
      {options.map((option, index) => (
        <div key={option.id} className="formknot-builder-option-row">
          <TextSetting
            id={`option-label-${option.id}`}
            label={`Option ${index + 1} label`}
            value={option.label}
            onCommit={(value) => updateOption(option.id, { label: value })}
          />
          <TextSetting
            id={`option-value-${option.id}`}
            label={`Option ${index + 1} value`}
            value={String(option.value)}
            onCommit={(value) => updateOption(option.id, { value })}
          />
          <BooleanSetting
            id={`option-disabled-${option.id}`}
            label="Disabled"
            checked={Boolean(option.disabled)}
            onChange={(checked) => updateOption(option.id, { disabled: checked })}
          />
          <button type="button" className="formknot-builder-danger" onClick={() => removeOption(option.id)}>
            Remove option
          </button>
        </div>
      ))}
      <button type="button" className="formknot-builder-add-button" onClick={addOption}>
        + Add option
      </button>
    </fieldset>
  );
}
