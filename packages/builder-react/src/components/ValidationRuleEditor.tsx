import { generateId } from "@formknot/core";
import type { FormKnotField, FormKnotValidationRule, FormKnotValidationRuleType } from "@formknot/core";
import { TextSetting } from "./TextSetting";

export interface ValidationRuleEditorProps {
  field: FormKnotField;
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

const RULE_TYPES: FormKnotValidationRuleType[] = ["required", "email", "minLength", "maxLength", "min", "max", "pattern", "custom"];

const VALUE_TYPES = new Set<FormKnotValidationRuleType>(["minLength", "maxLength", "min", "max", "pattern"]);

function defaultMessageFor(type: FormKnotValidationRuleType): string {
  switch (type) {
    case "required":
      return "This field is required";
    case "email":
      return "Enter a valid email address";
    case "minLength":
      return "Value is too short";
    case "maxLength":
      return "Value is too long";
    case "min":
      return "Value is too small";
    case "max":
      return "Value is too large";
    case "pattern":
      return "Value does not match the required format";
    case "custom":
      return "Invalid value";
    default:
      return "Invalid value";
  }
}

export function ValidationRuleEditor({ field, onUpdate }: ValidationRuleEditorProps) {
  const rules = field.validations ?? [];

  function updateRule(id: string, updates: Partial<FormKnotValidationRule>) {
    onUpdate({ validations: rules.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  }

  function removeRule(id: string) {
    onUpdate({ validations: rules.filter((r) => r.id !== id) });
  }

  function addRule() {
    const type: FormKnotValidationRuleType = "required";
    const rule: FormKnotValidationRule = { id: generateId("rule"), type, message: defaultMessageFor(type) };
    onUpdate({ validations: [...rules, rule] });
  }

  return (
    <fieldset className="formknot-builder-validation-editor">
      <legend>Validation rules</legend>
      {rules.length === 0 && <p className="formknot-builder-empty-state">No validation rules yet.</p>}
      {rules.map((rule, index) => (
        <div key={rule.id} className="formknot-builder-rule-row">
          <div className="formknot-builder-setting">
            <label htmlFor={`rule-type-${rule.id}`}>Rule {index + 1} type</label>
            <select
              id={`rule-type-${rule.id}`}
              value={rule.type}
              onChange={(event) => {
                const nextType = event.target.value as FormKnotValidationRuleType;
                updateRule(rule.id, { type: nextType, message: defaultMessageFor(nextType) });
              }}
            >
              {RULE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {VALUE_TYPES.has(rule.type) && (
            <TextSetting
              id={`rule-value-${rule.id}`}
              label={rule.type === "pattern" ? "Regular expression" : "Value"}
              value={rule.value === undefined ? "" : String(rule.value)}
              onCommit={(value) => updateRule(rule.id, { value: rule.type === "pattern" ? value : Number(value) })}
            />
          )}
          {rule.type === "custom" && (
            <TextSetting
              id={`rule-validatorId-${rule.id}`}
              label="Validator id"
              value={rule.validatorId ?? ""}
              onCommit={(value) => updateRule(rule.id, { validatorId: value || undefined })}
            />
          )}
          <TextSetting
            id={`rule-message-${rule.id}`}
            label="Error message"
            value={rule.message}
            onCommit={(value) => updateRule(rule.id, { message: value })}
          />
          <button type="button" className="formknot-builder-danger" onClick={() => removeRule(rule.id)}>
            Remove rule
          </button>
        </div>
      ))}
      <button type="button" className="formknot-builder-add-button" onClick={addRule}>
        + Add validation rule
      </button>
    </fieldset>
  );
}
