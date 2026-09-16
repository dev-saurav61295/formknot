import { describe, expect, it } from "vitest";
import { createValidatorRegistry } from "./validatorRegistry";
import { createFieldRegistry } from "./fieldRegistry";

describe("createValidatorRegistry", () => {
  it("registers, retrieves, and unregisters validators", () => {
    const registry = createValidatorRegistry();
    const validator = () => undefined;
    registry.register("test", validator);
    expect(registry.has("test")).toBe(true);
    expect(registry.get("test")).toBe(validator);
    expect(registry.ids()).toEqual(["test"]);
    registry.unregister("test");
    expect(registry.has("test")).toBe(false);
  });
});

describe("createFieldRegistry", () => {
  it("registers, retrieves, and lists field definitions", () => {
    const registry = createFieldRegistry();
    registry.register("currency", { type: "currency", label: "Currency" });
    expect(registry.has("currency")).toBe(true);
    expect(registry.get("currency")?.label).toBe("Currency");
    expect(registry.types()).toEqual(["currency"]);
    expect(registry.all()).toHaveLength(1);
  });
});
