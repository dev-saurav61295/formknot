import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { evaluateSchemaConditions, type FieldConditionState, type FormKnotSchema } from "@formknot/core";

/**
 * Watches only the fields referenced as a `sourceField` in any condition
 * (not the whole form) and recomputes visibility/enabled state for every
 * field whenever one of those source values changes.
 */
export function useFormKnotConditions(
  schema: FormKnotSchema,
  control: Control<Record<string, unknown>>
): Record<string, FieldConditionState> {
  const sourceFieldNames = useMemo(() => {
    const names = new Set<string>();
    for (const field of schema.fields) {
      for (const rule of field.conditions?.rules ?? []) {
        names.add(rule.sourceField);
      }
    }
    return Array.from(names);
  }, [schema]);

  const watched = useWatch({ control, name: sourceFieldNames });

  const sourceValues = useMemo(() => {
    const map: Record<string, unknown> = {};
    sourceFieldNames.forEach((name, index) => {
      map[name] = Array.isArray(watched) ? watched[index] : undefined;
    });
    return map;
  }, [watched, sourceFieldNames]);

  return useMemo(() => evaluateSchemaConditions(schema, sourceValues), [schema, sourceValues]);
}
