import { describe, expect, it } from "vitest";
import { validateFormKnotSchema } from "./schemaValidation";
import { createEmptySchema, createField } from "./schemaFactory";
import type { FormKnotSchema } from "./types";

function baseSchema(overrides: Partial<FormKnotSchema> = {}): FormKnotSchema {
  return {
    ...createEmptySchema(),
    fields: [
      { id: "f1", type: "text", name: "firstName", label: "First name" },
      { id: "f2", type: "email", name: "email", label: "Email" },
    ],
    ...overrides,
  };
}

describe("validateFormKnotSchema", () => {
  it("accepts a well-formed schema", () => {
    const result = validateFormKnotSchema(baseSchema());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a schema missing required top-level properties", () => {
    const result = validateFormKnotSchema({ title: "No id or fields" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects an unsupported field type", () => {
    const schema = baseSchema({
      fields: [{ id: "f1", type: "nonsense" as never, name: "x", label: "X" }],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
  });

  it("detects duplicate field ids", () => {
    const schema = baseSchema({
      fields: [
        { id: "dup", type: "text", name: "a", label: "A" },
        { id: "dup", type: "text", name: "b", label: "B" },
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("duplicate field id"))).toBe(true);
  });

  it("detects duplicate field names", () => {
    const schema = baseSchema({
      fields: [
        { id: "f1", type: "text", name: "dup", label: "A" },
        { id: "f2", type: "text", name: "dup", label: "B" },
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("duplicate field name"))).toBe(true);
  });

  it("requires options for choice field types", () => {
    const schema = baseSchema({
      fields: [{ id: "f1", type: "select", name: "choice", label: "Choice", options: [] } as never],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path.includes("options"))).toBe(true);
  });

  it("rejects options on a field type that does not support them", () => {
    const schema = baseSchema({
      fields: [
        {
          id: "f1",
          type: "text",
          name: "x",
          label: "X",
          options: [{ id: "o1", label: "One", value: "one" }],
        } as never,
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
  });

  it("rejects a custom validation rule without a validatorId", () => {
    const schema = baseSchema({
      fields: [
        {
          id: "f1",
          type: "text",
          name: "x",
          label: "X",
          validations: [{ id: "v1", type: "custom", message: "bad" }],
        },
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
  });

  it("rejects an invalid regular expression in a pattern rule", () => {
    const schema = baseSchema({
      fields: [
        {
          id: "f1",
          type: "text",
          name: "x",
          label: "X",
          validations: [{ id: "v1", type: "pattern", value: "(unterminated", message: "bad" }],
        },
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
  });

  it("rejects string-oriented validations on numeric fields", () => {
    const schema = baseSchema({
      fields: [
        {
          id: "f1",
          type: "number",
          name: "age",
          label: "Age",
          validations: [{ id: "v1", type: "minLength", value: 2, message: "bad" }],
        },
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
  });

  it("rejects a condition referencing an unknown source field", () => {
    const schema = baseSchema({
      fields: [
        {
          id: "f1",
          type: "text",
          name: "x",
          label: "X",
          conditions: { strategy: "all", rules: [{ id: "c1", sourceField: "ghost", operator: "isNotEmpty", action: "show" }] },
        },
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("unknown field"))).toBe(true);
  });

  it("detects circular conditional dependencies", () => {
    const schema = baseSchema({
      fields: [
        {
          id: "f1",
          type: "text",
          name: "a",
          label: "A",
          conditions: { strategy: "all", rules: [{ id: "c1", sourceField: "b", operator: "isNotEmpty", action: "show" }] },
        },
        {
          id: "f2",
          type: "text",
          name: "b",
          label: "B",
          conditions: { strategy: "all", rules: [{ id: "c2", sourceField: "a", operator: "isNotEmpty", action: "show" }] },
        },
      ],
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("circular"))).toBe(true);
  });

  it("rejects unsafe keys in metadata", () => {
    const schema = baseSchema({
      metadata: JSON.parse('{"__proto__": {"polluted": true}}'),
    });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
  });

  it("rejects a schema version newer than supported", () => {
    const schema = baseSchema({ version: 999 });
    const result = validateFormKnotSchema(schema);
    expect(result.valid).toBe(false);
  });

  it("accepts a custom field type when listed in additionalFieldTypes", () => {
    const schema = baseSchema({
      fields: [{ id: "f1", type: "currency", name: "amount", label: "Amount" } as never],
    });
    expect(validateFormKnotSchema(schema).valid).toBe(false);
    expect(validateFormKnotSchema(schema, { additionalFieldTypes: ["currency"] }).valid).toBe(true);
  });

  it("createField produces default options for choice types", () => {
    const field = createField("radio", { name: "r", label: "R" });
    expect("options" in field && Array.isArray((field as { options: unknown[] }).options)).toBe(true);
  });
});
