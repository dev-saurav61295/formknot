import type { Resolver } from "react-hook-form";
import { validateFormData, type FormKnotSchema, type FormKnotValidatorRegistry } from "@formknot/core";

/**
 * Bridges @formknot/core's schema-aware data validation into a react-hook-form
 * resolver so built-in rules, conditional visibility, and custom sync/async
 * validators all run through a single code path shared with non-React
 * consumers of FormKnot.
 */
export function createFormKnotResolver(
  schema: FormKnotSchema,
  validators?: FormKnotValidatorRegistry
): Resolver<Record<string, unknown>> {
  return async (values) => {
    const result = await validateFormData(schema, values, { validators });

    if (result.valid) {
      return { values: result.data, errors: {} };
    }

    const errors = Object.fromEntries(
      Object.entries(result.errors).map(([name, messages]) => [
        name,
        { type: "formknot", message: messages[0] ?? "Invalid value" },
      ])
    );

    return { values: {}, errors };
  };
}
