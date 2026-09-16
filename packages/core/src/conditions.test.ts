import { describe, expect, it } from "vitest";
import { evaluateConditionPredicate, evaluateFieldConditions, findCircularConditionDependencies } from "./conditions";
import type { FormKnotField, FormKnotFieldCondition } from "./types";

function condition(overrides: Partial<FormKnotFieldCondition>): FormKnotFieldCondition {
  return { id: "c1", sourceField: "source", operator: "equals", action: "show", ...overrides };
}

describe("evaluateConditionPredicate", () => {
  it("equals / notEquals", () => {
    expect(evaluateConditionPredicate(condition({ operator: "equals", value: "a" }), { source: "a" })).toBe(true);
    expect(evaluateConditionPredicate(condition({ operator: "equals", value: "a" }), { source: "b" })).toBe(false);
    expect(evaluateConditionPredicate(condition({ operator: "notEquals", value: "a" }), { source: "b" })).toBe(true);
  });

  it("contains / notContains for strings and arrays", () => {
    expect(evaluateConditionPredicate(condition({ operator: "contains", value: "cat" }), { source: "concatenate" })).toBe(true);
    expect(evaluateConditionPredicate(condition({ operator: "contains", value: "b" }), { source: ["a", "b"] })).toBe(true);
    expect(evaluateConditionPredicate(condition({ operator: "notContains", value: "z" }), { source: "abc" })).toBe(true);
  });

  it("numeric comparisons", () => {
    expect(evaluateConditionPredicate(condition({ operator: "greaterThan", value: 5 }), { source: 10 })).toBe(true);
    expect(evaluateConditionPredicate(condition({ operator: "greaterThanOrEqual", value: 10 }), { source: 10 })).toBe(true);
    expect(evaluateConditionPredicate(condition({ operator: "lessThan", value: 5 }), { source: 10 })).toBe(false);
    expect(evaluateConditionPredicate(condition({ operator: "lessThanOrEqual", value: 10 }), { source: 10 })).toBe(true);
  });

  it("isEmpty / isNotEmpty", () => {
    expect(evaluateConditionPredicate(condition({ operator: "isEmpty" }), { source: "" })).toBe(true);
    expect(evaluateConditionPredicate(condition({ operator: "isEmpty" }), { source: [] })).toBe(true);
    expect(evaluateConditionPredicate(condition({ operator: "isNotEmpty" }), { source: "x" })).toBe(true);
  });
});

describe("evaluateFieldConditions", () => {
  it("defaults to visible and enabled with no conditions", () => {
    expect(evaluateFieldConditions(undefined, {})).toEqual({ visible: true, enabled: true });
  });

  it("combines rules with 'all' strategy", () => {
    const group = {
      strategy: "all" as const,
      rules: [condition({ sourceField: "a", operator: "equals", value: "1", action: "show" }), condition({ sourceField: "b", operator: "equals", value: "2", action: "show" })],
    };
    expect(evaluateFieldConditions(group, { a: "1", b: "2" }).visible).toBe(true);
    expect(evaluateFieldConditions(group, { a: "1", b: "x" }).visible).toBe(false);
  });

  it("combines rules with 'any' strategy", () => {
    const group = {
      strategy: "any" as const,
      rules: [condition({ sourceField: "a", operator: "equals", value: "1", action: "show" }), condition({ sourceField: "b", operator: "equals", value: "2", action: "show" })],
    };
    expect(evaluateFieldConditions(group, { a: "1", b: "x" }).visible).toBe(true);
    expect(evaluateFieldConditions(group, { a: "x", b: "x" }).visible).toBe(false);
  });

  it("hide takes precedence over show", () => {
    const group = {
      strategy: "any" as const,
      rules: [condition({ sourceField: "a", operator: "isNotEmpty", action: "show" }), condition({ sourceField: "b", operator: "isNotEmpty", action: "hide" })],
    };
    expect(evaluateFieldConditions(group, { a: "x", b: "y" }).visible).toBe(false);
  });

  it("resolves enable/disable independently from show/hide", () => {
    const group = {
      strategy: "all" as const,
      rules: [condition({ sourceField: "a", operator: "isNotEmpty", action: "disable" })],
    };
    expect(evaluateFieldConditions(group, { a: "x" })).toEqual({ visible: true, enabled: false });
  });
});

describe("findCircularConditionDependencies", () => {
  it("returns an empty array for acyclic dependencies", () => {
    const fields: FormKnotField[] = [
      { id: "1", type: "text", name: "a", label: "A" },
      {
        id: "2",
        type: "text",
        name: "b",
        label: "B",
        conditions: { strategy: "all", rules: [condition({ sourceField: "a" })] },
      },
    ];
    expect(findCircularConditionDependencies(fields)).toEqual([]);
  });

  it("detects a two-node cycle", () => {
    const fields: FormKnotField[] = [
      { id: "1", type: "text", name: "a", label: "A", conditions: { strategy: "all", rules: [condition({ sourceField: "b" })] } },
      { id: "2", type: "text", name: "b", label: "B", conditions: { strategy: "all", rules: [condition({ sourceField: "a" })] } },
    ];
    const cycle = findCircularConditionDependencies(fields);
    expect(cycle).toContain("a");
    expect(cycle).toContain("b");
  });

  it("detects a self-reference", () => {
    const fields: FormKnotField[] = [
      { id: "1", type: "text", name: "a", label: "A", conditions: { strategy: "all", rules: [condition({ sourceField: "a" })] } },
    ];
    expect(findCircularConditionDependencies(fields)).toContain("a");
  });
});
