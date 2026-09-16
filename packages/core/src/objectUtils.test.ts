import { describe, expect, it } from "vitest";
import { safeClone, safeGet, safeJsonParse, safeSet } from "./objectUtils";

describe("safeClone", () => {
  it("deep clones plain data", () => {
    const input = { a: { b: [1, 2, { c: 3 }] } };
    const clone = safeClone(input);
    expect(clone).toEqual(input);
    expect(clone).not.toBe(input);
    expect(clone.a).not.toBe(input.a);
  });

  it("strips __proto__, prototype, and constructor keys at every level", () => {
    const input = JSON.parse('{"a":1,"__proto__":{"polluted":true},"nested":{"constructor":{"x":1},"b":2}}');
    const clone = safeClone(input) as Record<string, unknown>;
    expect(Object.prototype.hasOwnProperty.call(clone, "__proto__")).toBe(false);
    expect((clone.nested as Record<string, unknown>).constructor).not.toEqual({ x: 1 });
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    const result = safeJsonParse('{"a":1}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ a: 1 });
  });

  it("returns an error for invalid JSON instead of throwing", () => {
    const result = safeJsonParse("not json");
    expect(result.ok).toBe(false);
  });

  it("drops __proto__ keys while parsing", () => {
    const result = safeJsonParse('{"a":1,"__proto__":{"polluted":true}}');
    expect(result.ok).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe("safeGet / safeSet", () => {
  it("gets a nested value", () => {
    expect(safeGet({ a: { b: 1 } }, ["a", "b"])).toBe(1);
  });

  it("refuses to traverse unsafe keys", () => {
    expect(safeGet({}, ["__proto__", "polluted"])).toBeUndefined();
  });

  it("immutably sets a nested value", () => {
    const original = { a: { b: 1 } };
    const updated = safeSet(original, ["a", "b"], 2);
    expect(updated.a.b).toBe(2);
    expect(original.a.b).toBe(1);
  });

  it("refuses to set through unsafe keys", () => {
    const original = {};
    const updated = safeSet(original, ["__proto__", "polluted"], true);
    expect(Object.getPrototypeOf(updated)).toBe(Object.prototype);
    expect((updated as Record<string, unknown>).polluted).toBeUndefined();
  });
});
