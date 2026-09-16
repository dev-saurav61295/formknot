export interface ValidatorContext {
  value: unknown;
  values: Record<string, unknown>;
  fieldName: string;
}

/** A validator returns undefined (valid) or an error message string (invalid). */
export type FormKnotValidator = (
  context: ValidatorContext
) => string | undefined | Promise<string | undefined>;

export interface FormKnotValidatorRegistry {
  register: (id: string, validator: FormKnotValidator) => void;
  unregister: (id: string) => void;
  get: (id: string) => FormKnotValidator | undefined;
  has: (id: string) => boolean;
  ids: () => string[];
}

/**
 * Creates a registry that maps a stable identifier (referenced from a
 * FormKnotSchema's `validatorId`) to an executable synchronous or
 * asynchronous validator function. Schemas never carry the implementation
 * itself, only the identifier.
 */
export function createValidatorRegistry(): FormKnotValidatorRegistry {
  const validators = new Map<string, FormKnotValidator>();

  return {
    register(id, validator) {
      if (!id) throw new Error("createValidatorRegistry: validator id must be a non-empty string");
      validators.set(id, validator);
    },
    unregister(id) {
      validators.delete(id);
    },
    get(id) {
      return validators.get(id);
    },
    has(id) {
      return validators.has(id);
    },
    ids() {
      return Array.from(validators.keys());
    },
  };
}
