import { CURRENT_SCHEMA_VERSION } from "./constants";
import type { FormKnotSchema } from "./types";

export type FormKnotMigration = (schema: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migrations are keyed by the version they upgrade *from*. Each migration
 * must set `version` to `fromVersion + 1`. Register future migrations here
 * as the schema model evolves; never remove an old one while any consumer
 * may still hold schemas at that version.
 */
const migrations: Record<number, FormKnotMigration> = {
  // Legacy documents authored before schema versioning existed.
  0: (schema) => ({ ...schema, version: 1 }),
};

export function registerMigration(fromVersion: number, migration: FormKnotMigration): void {
  migrations[fromVersion] = migration;
}

export function needsMigration(schema: { version?: number }): boolean {
  const version = typeof schema.version === "number" ? schema.version : 0;
  return version < CURRENT_SCHEMA_VERSION;
}

/**
 * Applies registered migrations sequentially until the schema reaches
 * `CURRENT_SCHEMA_VERSION` or no further migration is registered for the
 * current version (in which case the schema is returned as-is, still at its
 * original version, so validation can surface the mismatch).
 */
export function migrateSchema(schema: Record<string, unknown>): Record<string, unknown> {
  let current = schema;
  let version = typeof current.version === "number" ? (current.version as number) : 0;

  while (version < CURRENT_SCHEMA_VERSION) {
    const migration = migrations[version];
    if (!migration) break;
    current = migration(current);
    const nextVersion = typeof current.version === "number" ? (current.version as number) : version + 1;
    if (nextVersion <= version) break;
    version = nextVersion;
  }

  return current;
}

export function isFormKnotSchema(value: unknown): value is FormKnotSchema {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as FormKnotSchema).id === "string" &&
    typeof (value as FormKnotSchema).version === "number" &&
    Array.isArray((value as FormKnotSchema).fields)
  );
}
