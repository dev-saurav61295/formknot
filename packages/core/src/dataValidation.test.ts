import { describe, expect, it } from "vitest";
import { validateFormData } from "./dataValidation";
import { createValidatorRegistry } from "./validatorRegistry";
import type { FormKnotSchema } from "./types";

function schemaWith(fields: FormKnotSchema["fields"]): FormKnotSchema {
  return { id: "s1", version: 1, fields };
}

describe("validateFormData", () => {
  it("flags a missing required value", async () => {
    const schema = schemaWith([
      { id: "f1", type: "text", name: "name", label: "Name", validations: [{ id: "v1", type: "required", message: "Name is required" }] },
    ]);
    const result = await validateFormData(schema, { name: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toEqual(["Name is required"]);
  });

  it("passes a valid email and fails an invalid one", async () => {
    const schema = schemaWith([
      { id: "f1", type: "email", name: "email", label: "Email", validations: [{ id: "v1", type: "email", message: "Invalid email" }] },
    ]);
    const good = await validateFormData(schema, { email: "a@b.com" });
    const bad = await validateFormData(schema, { email: "not-an-email" });
    expect(good.valid).toBe(true);
    expect(bad.errors.email).toEqual(["Invalid email"]);
  });

  it("enforces minLength and maxLength", async () => {
    const schema = schemaWith([
      {
        id: "f1",
        type: "text",
        name: "bio",
        label: "Bio",
        validations: [
          { id: "v1", type: "minLength", value: 3, message: "Too short" },
          { id: "v2", type: "maxLength", value: 5, message: "Too long" },
        ],
      },
    ]);
    expect((await validateFormData(schema, { bio: "ab" })).errors.bio).toContain("Too short");
    expect((await validateFormData(schema, { bio: "abcdefgh" })).errors.bio).toContain("Too long");
    expect((await validateFormData(schema, { bio: "abcd" })).valid).toBe(true);
  });

  it("enforces min and max for numbers", async () => {
    const schema = schemaWith([
      {
        id: "f1",
        type: "number",
        name: "age",
        label: "Age",
        validations: [
          { id: "v1", type: "min", value: 18, message: "Too young" },
          { id: "v2", type: "max", value: 65, message: "Too old" },
        ],
      },
    ]);
    expect((await validateFormData(schema, { age: 10 })).errors.age).toContain("Too young");
    expect((await validateFormData(schema, { age: 70 })).errors.age).toContain("Too old");
    expect((await validateFormData(schema, { age: 30 })).valid).toBe(true);
  });

  it("enforces a pattern rule", async () => {
    const schema = schemaWith([
      {
        id: "f1",
        type: "text",
        name: "code",
        label: "Code",
        validations: [{ id: "v1", type: "pattern", value: "^[A-Z]{3}$", message: "Must be 3 uppercase letters" }],
      },
    ]);
    expect((await validateFormData(schema, { code: "abc" })).valid).toBe(false);
    expect((await validateFormData(schema, { code: "ABC" })).valid).toBe(true);
  });

  it("runs a registered synchronous custom validator", async () => {
    const validators = createValidatorRegistry();
    validators.register("isEven", ({ value }) => (Number(value) % 2 === 0 ? undefined : "Must be even"));
    const schema = schemaWith([
      { id: "f1", type: "number", name: "n", label: "N", validations: [{ id: "v1", type: "custom", validatorId: "isEven", message: "Must be even" }] },
    ]);
    expect((await validateFormData(schema, { n: 3 }, { validators })).valid).toBe(false);
    expect((await validateFormData(schema, { n: 4 }, { validators })).valid).toBe(true);
  });

  it("runs a registered asynchronous custom validator", async () => {
    const validators = createValidatorRegistry();
    validators.register("uniqueEmail", async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return value === "taken@example.com" ? "Already registered" : undefined;
    });
    const schema = schemaWith([
      {
        id: "f1",
        type: "email",
        name: "email",
        label: "Email",
        validations: [{ id: "v1", type: "custom", validatorId: "uniqueEmail", message: "Already registered" }],
      },
    ]);
    const taken = await validateFormData(schema, { email: "taken@example.com" }, { validators });
    const free = await validateFormData(schema, { email: "free@example.com" }, { validators });
    expect(taken.valid).toBe(false);
    expect(free.valid).toBe(true);
  });

  it("reports an error when a referenced custom validator is not registered", async () => {
    const schema = schemaWith([
      { id: "f1", type: "text", name: "x", label: "X", validations: [{ id: "v1", type: "custom", validatorId: "missing", message: "fallback message" }] },
    ]);
    const result = await validateFormData(schema, { x: "anything" });
    expect(result.valid).toBe(false);
  });

  it("skips validation for fields hidden by conditions when visibleOnly is true", async () => {
    const schema = schemaWith([
      { id: "f1", type: "text", name: "toggle", label: "Toggle" },
      {
        id: "f2",
        type: "text",
        name: "conditional",
        label: "Conditional",
        validations: [{ id: "v1", type: "required", message: "Required" }],
        conditions: { strategy: "all", rules: [{ id: "c1", sourceField: "toggle", operator: "equals", value: "yes", action: "show" }] },
      },
    ]);
    const result = await validateFormData(schema, { toggle: "no", conditional: "" });
    expect(result.valid).toBe(true);
  });

  it("validates hidden-by-default conditional fields once the condition is satisfied", async () => {
    const schema = schemaWith([
      { id: "f1", type: "text", name: "toggle", label: "Toggle" },
      {
        id: "f2",
        type: "text",
        name: "conditional",
        label: "Conditional",
        validations: [{ id: "v1", type: "required", message: "Required" }],
        conditions: { strategy: "all", rules: [{ id: "c1", sourceField: "toggle", operator: "equals", value: "yes", action: "show" }] },
      },
    ]);
    const result = await validateFormData(schema, { toggle: "yes", conditional: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.conditional).toEqual(["Required"]);
  });
});
