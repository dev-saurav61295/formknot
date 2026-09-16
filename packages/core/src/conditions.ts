import type {
  FormKnotConditionGroup,
  FormKnotField,
  FormKnotFieldCondition,
  FormKnotSchema,
} from "./types";

export interface FieldConditionState {
  visible: boolean;
  enabled: boolean;
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  return String(a) === String(b);
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  if (value instanceof Date) return value.getTime();
  return NaN;
}

/** Evaluates a single condition rule's predicate (ignoring its `action`). */
export function evaluateConditionPredicate(
  condition: FormKnotFieldCondition,
  values: Record<string, unknown>
): boolean {
  const sourceValue = values[condition.sourceField];

  switch (condition.operator) {
    case "equals":
      return Array.isArray(sourceValue)
        ? sourceValue.some((item) => valuesEqual(item, condition.value))
        : valuesEqual(sourceValue, condition.value);
    case "notEquals":
      return !evaluateConditionPredicate({ ...condition, operator: "equals" }, values);
    case "contains":
      if (Array.isArray(sourceValue)) {
        return sourceValue.some((item) => valuesEqual(item, condition.value));
      }
      if (typeof sourceValue === "string") {
        return sourceValue.includes(String(condition.value ?? ""));
      }
      return false;
    case "notContains":
      return !evaluateConditionPredicate({ ...condition, operator: "contains" }, values);
    case "greaterThan": {
      const a = toNumber(sourceValue);
      const b = toNumber(condition.value);
      return !Number.isNaN(a) && !Number.isNaN(b) && a > b;
    }
    case "greaterThanOrEqual": {
      const a = toNumber(sourceValue);
      const b = toNumber(condition.value);
      return !Number.isNaN(a) && !Number.isNaN(b) && a >= b;
    }
    case "lessThan": {
      const a = toNumber(sourceValue);
      const b = toNumber(condition.value);
      return !Number.isNaN(a) && !Number.isNaN(b) && a < b;
    }
    case "lessThanOrEqual": {
      const a = toNumber(sourceValue);
      const b = toNumber(condition.value);
      return !Number.isNaN(a) && !Number.isNaN(b) && a <= b;
    }
    case "isEmpty":
      return isEmptyValue(sourceValue);
    case "isNotEmpty":
      return !isEmptyValue(sourceValue);
    default:
      return false;
  }
}

function combine(strategy: "all" | "any", results: boolean[]): boolean {
  if (results.length === 0) return false;
  return strategy === "all" ? results.every(Boolean) : results.some(Boolean);
}

/**
 * Resolves a field's visibility/enabled state from its condition group.
 * Rules are grouped by `action`; each group of same-action rules is combined
 * using the group's strategy. When both a positive and negative action for
 * the same axis are active (e.g. "show" and "hide" both true), the more
 * restrictive outcome (hidden / disabled) wins.
 */
export function evaluateFieldConditions(
  conditions: FormKnotConditionGroup | undefined,
  values: Record<string, unknown>
): FieldConditionState {
  if (!conditions || conditions.rules.length === 0) {
    return { visible: true, enabled: true };
  }

  const byAction: Record<string, boolean[]> = {
    show: [],
    hide: [],
    enable: [],
    disable: [],
  };

  for (const rule of conditions.rules) {
    byAction[rule.action]?.push(evaluateConditionPredicate(rule, values));
  }

  let visible = true;
  let enabled = true;

  const showRules = byAction.show ?? [];
  const hideRules = byAction.hide ?? [];
  const enableRules = byAction.enable ?? [];
  const disableRules = byAction.disable ?? [];

  if (showRules.length > 0) visible = combine(conditions.strategy, showRules);
  if (hideRules.length > 0 && combine(conditions.strategy, hideRules)) visible = false;
  if (enableRules.length > 0) enabled = combine(conditions.strategy, enableRules);
  if (disableRules.length > 0 && combine(conditions.strategy, disableRules)) enabled = false;

  return { visible, enabled };
}

/** Evaluates condition state for every field in a schema against a value set. */
export function evaluateSchemaConditions(
  schema: FormKnotSchema,
  values: Record<string, unknown>
): Record<string, FieldConditionState> {
  const result: Record<string, FieldConditionState> = {};
  for (const field of schema.fields) {
    result[field.name] = evaluateFieldConditions(field.conditions, values);
  }
  return result;
}

/**
 * Detects circular dependencies among field conditions, e.g. field A's
 * visibility depends on field B, whose visibility depends back on field A.
 * Returns the field names that participate in a cycle.
 */
export function findCircularConditionDependencies(fields: FormKnotField[]): string[] {
  const dependsOn = new Map<string, Set<string>>();
  for (const field of fields) {
    const deps = new Set<string>();
    for (const rule of field.conditions?.rules ?? []) {
      deps.add(rule.sourceField);
    }
    dependsOn.set(field.name, deps);
  }

  const cyclic = new Set<string>();
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(name: string, path: string[]): void {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      const cycleStart = path.indexOf(name);
      for (const n of path.slice(cycleStart === -1 ? 0 : cycleStart)) cyclic.add(n);
      cyclic.add(name);
      return;
    }
    visiting.add(name);
    for (const dep of dependsOn.get(name) ?? []) {
      if (dependsOn.has(dep)) {
        visit(dep, [...path, name]);
      }
    }
    visiting.delete(name);
    visited.add(name);
  }

  for (const name of dependsOn.keys()) {
    visit(name, []);
  }

  return Array.from(cyclic);
}
