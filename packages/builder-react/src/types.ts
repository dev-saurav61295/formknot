import type { FormKnotSchema, FormKnotValidatorRegistry } from "@formknot/core";
import type { FormKnotFieldComponentRegistry } from "@formknot/react";

export interface FormKnotBuilderProps {
  initialSchema?: FormKnotSchema;
  onChange?: (schema: FormKnotSchema) => void;
  onExport?: (schema: FormKnotSchema) => void;
  validators?: FormKnotValidatorRegistry;
  components?: FormKnotFieldComponentRegistry;
  className?: string;
}

export const FIELD_DND_MIME = "application/x-formknot-field-type";
