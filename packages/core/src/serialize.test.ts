import { describe, expect, it } from "vitest";
import { exportSchema, importSchema } from "./serialize";
import { createEmptySchema } from "./schemaFactory";
import type { FormKnotSchema } from "./types";

describe("exportSchema / importSchema", () => {
  it("round-trips a valid schema", () => {
    const schema: FormKnotSchema = {
      ...createEmptySchema({ id: "s1", title: "Demo" }),
      fields: [{ id: "f1", type: "text", name: "name", label: "Name" }],
    };
    const json = exportSchema(schema);
    const result = importSchema(json);
    expect(result.errors).toEqual([]);
    expect(result.schema).toEqual(schema);
  });

  it("reports malformed JSON without throwing", () => {
    const result = importSchema("{ not valid json");
    expect(result.schema).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("reports a validation error for an invalid schema shape", () => {
    const result = importSchema(JSON.stringify({ title: "missing required fields" }));
    expect(result.schema).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("strips a prototype-pollution attempt during import", () => {
    const malicious = '{"id":"s1","version":1,"fields":[],"__proto__":{"polluted":true}}';
    const result = importSchema(malicious);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    if (result.schema) {
      expect(Object.prototype.hasOwnProperty.call(result.schema, "__proto__")).toBe(false);
    }
  });

  it("migrates a legacy schema with no version field", () => {
    const legacy = JSON.stringify({ id: "s1", fields: [{ id: "f1", type: "text", name: "n", label: "N" }] });
    const result = importSchema(legacy);
    expect(result.errors).toEqual([]);
    expect(result.schema?.version).toBe(1);
  });
});
