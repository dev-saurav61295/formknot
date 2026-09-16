import { safeClone, safeJsonParse } from "./objectUtils";
import { migrateSchema } from "./migrations";
import { validateFormKnotSchema } from "./schemaValidation";
import type { FormKnotSchema, FormKnotSchemaError } from "./types";

export interface ImportSchemaResult {
  schema: FormKnotSchema | null;
  errors: FormKnotSchemaError[];
}

/** Serializes a schema to a pretty-printed, safe JSON string. */
export function exportSchema(schema: FormKnotSchema): string {
  return JSON.stringify(safeClone(schema), null, 2);
}

/**
 * Parses, migrates, and validates a JSON string as a FormKnotSchema.
 * Never throws: malformed JSON or an invalid schema is reported through the
 * `errors` array with `schema` set to null.
 */
export function importSchema(json: string): ImportSchemaResult {
  const parsed = safeJsonParse(json);
  if (!parsed.ok) {
    return { schema: null, errors: [{ path: "$", message: `$: ${parsed.error}` }] };
  }

  if (typeof parsed.value !== "object" || parsed.value === null || Array.isArray(parsed.value)) {
    return { schema: null, errors: [{ path: "$", message: "$: expected a JSON object at the document root" }] };
  }

  const migrated = migrateSchema(parsed.value as Record<string, unknown>);
  const result = validateFormKnotSchema(migrated);

  if (!result.valid) {
    return { schema: null, errors: result.errors };
  }

  return { schema: migrated as unknown as FormKnotSchema, errors: [] };
}
