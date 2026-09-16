import { describe, expect, it } from "vitest";
import { migrateSchema, needsMigration } from "./migrations";
import { CURRENT_SCHEMA_VERSION } from "./constants";

describe("migrateSchema", () => {
  it("assigns the current version to a legacy document with no version", () => {
    const migrated = migrateSchema({ id: "s1", fields: [] });
    expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it("leaves an up-to-date schema unchanged", () => {
    const schema = { id: "s1", version: CURRENT_SCHEMA_VERSION, fields: [] };
    expect(migrateSchema(schema)).toEqual(schema);
  });

  it("needsMigration reflects whether a schema is below the current version", () => {
    expect(needsMigration({ version: 0 })).toBe(true);
    expect(needsMigration({ version: CURRENT_SCHEMA_VERSION })).toBe(false);
  });
});
