import type { FormKnotFieldType } from "./types";

/**
 * Framework-neutral description of a field type. Concrete renderers (e.g.
 * @formknot/react) attach a component to a matching entry via their own
 * registry; this contract only describes metadata core can reason about.
 */
export interface FormKnotFieldDefinition<TConfig = unknown> {
  type: FormKnotFieldType | string;
  label: string;
  /** Whether this field type accepts a `options` array. */
  supportsOptions?: boolean;
  /** Default configuration merged in when a field of this type is created. */
  defaultConfig?: Partial<TConfig>;
}

export interface FormKnotFieldRegistry<TConfig = unknown> {
  register: (type: string, definition: FormKnotFieldDefinition<TConfig>) => void;
  unregister: (type: string) => void;
  get: (type: string) => FormKnotFieldDefinition<TConfig> | undefined;
  has: (type: string) => boolean;
  types: () => string[];
  all: () => FormKnotFieldDefinition<TConfig>[];
}

export function createFieldRegistry<TConfig = unknown>(): FormKnotFieldRegistry<TConfig> {
  const definitions = new Map<string, FormKnotFieldDefinition<TConfig>>();

  return {
    register(type, definition) {
      if (!type) throw new Error("createFieldRegistry: field type must be a non-empty string");
      definitions.set(type, definition);
    },
    unregister(type) {
      definitions.delete(type);
    },
    get(type) {
      return definitions.get(type);
    },
    has(type) {
      return definitions.has(type);
    },
    types() {
      return Array.from(definitions.keys());
    },
    all() {
      return Array.from(definitions.values());
    },
  };
}
