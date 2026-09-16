import { generateId } from "@formknot/core";
import type { FormKnotConditionAction, FormKnotConditionOperator, FormKnotField, FormKnotFieldCondition } from "@formknot/core";
import { TextSetting } from "./TextSetting";

export interface ConditionEditorProps {
  field: FormKnotField;
  otherFields: FormKnotField[];
  onUpdate: (updates: Partial<FormKnotField>) => void;
}

const OPERATORS: FormKnotConditionOperator[] = [
  "equals",
  "notEquals",
  "contains",
  "notContains",
  "greaterThan",
  "greaterThanOrEqual",
  "lessThan",
  "lessThanOrEqual",
  "isEmpty",
  "isNotEmpty",
];

const ACTIONS: FormKnotConditionAction[] = ["show", "hide", "enable", "disable"];

const VALUELESS_OPERATORS = new Set<FormKnotConditionOperator>(["isEmpty", "isNotEmpty"]);

export function ConditionEditor({ field, otherFields, onUpdate }: ConditionEditorProps) {
  const group = field.conditions ?? { strategy: "all" as const, rules: [] };

  function updateGroup(updates: Partial<typeof group>) {
    onUpdate({ conditions: { ...group, ...updates } });
  }

  function updateRule(id: string, updates: Partial<FormKnotFieldCondition>) {
    updateGroup({ rules: group.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  }

  function removeRule(id: string) {
    const rules = group.rules.filter((r) => r.id !== id);
    onUpdate({ conditions: rules.length > 0 ? { ...group, rules } : undefined });
  }

  function addRule() {
    const firstOther = otherFields[0];
    if (!firstOther) return;
    const rule: FormKnotFieldCondition = {
      id: generateId("condition"),
      sourceField: firstOther.name,
      operator: "equals",
      value: "",
      action: "show",
    };
    updateGroup({ rules: [...group.rules, rule] });
  }

  if (otherFields.length === 0) {
    return (
      <fieldset className="formknot-builder-condition-editor">
        <legend>Conditional rules</legend>
        <p className="formknot-builder-empty-state">Add another field first to reference it in a condition.</p>
      </fieldset>
    );
  }

  return (
    <fieldset className="formknot-builder-condition-editor">
      <legend>Conditional rules</legend>
      {group.rules.length > 0 && (
        <div className="formknot-builder-setting">
          <label htmlFor="condition-strategy">Match</label>
          <select
            id="condition-strategy"
            value={group.strategy}
            onChange={(event) => updateGroup({ strategy: event.target.value as "all" | "any" })}
          >
            <option value="all">All rules must match</option>
            <option value="any">Any rule may match</option>
          </select>
        </div>
      )}
      {group.rules.length === 0 && <p className="formknot-builder-empty-state">No conditions yet — this field always shows.</p>}
      {group.rules.map((rule, index) => (
        <div key={rule.id} className="formknot-builder-rule-row">
          <div className="formknot-builder-setting">
            <label htmlFor={`cond-source-${rule.id}`}>Rule {index + 1}: when field</label>
            <select id={`cond-source-${rule.id}`} value={rule.sourceField} onChange={(event) => updateRule(rule.id, { sourceField: event.target.value })}>
              {otherFields.map((other) => (
                <option key={other.id} value={other.name}>
                  {other.label} ({other.name})
                </option>
              ))}
            </select>
          </div>
          <div className="formknot-builder-setting">
            <label htmlFor={`cond-operator-${rule.id}`}>Operator</label>
            <select id={`cond-operator-${rule.id}`} value={rule.operator} onChange={(event) => updateRule(rule.id, { operator: event.target.value as FormKnotConditionOperator })}>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
          {!VALUELESS_OPERATORS.has(rule.operator) && (
            <TextSetting
              id={`cond-value-${rule.id}`}
              label="Value"
              value={rule.value === undefined ? "" : String(rule.value)}
              onCommit={(value) => updateRule(rule.id, { value })}
            />
          )}
          <div className="formknot-builder-setting">
            <label htmlFor={`cond-action-${rule.id}`}>Then</label>
            <select id={`cond-action-${rule.id}`} value={rule.action} onChange={(event) => updateRule(rule.id, { action: event.target.value as FormKnotConditionAction })}>
              {ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="formknot-builder-danger" onClick={() => removeRule(rule.id)}>
            Remove condition
          </button>
        </div>
      ))}
      <button type="button" className="formknot-builder-add-button" onClick={addRule}>
        + Add condition
      </button>
    </fieldset>
  );
}
