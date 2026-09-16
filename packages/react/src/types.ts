import type { ComponentType } from "react";
import type { FormKnotField, FormKnotValidationResult } from "@formknot/core";

export interface FormKnotFieldComponentProps<TField extends FormKnotField = FormKnotField> {
  field: TField;
  id: string;
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  disabled: boolean;
  readOnly: boolean;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
  errors: string[];
  /** Attach to the underlying focusable element so FormKnotForm can focus it on validation failure. */
  inputRef?: (element: HTMLElement | null) => void;
}

export type FormKnotFieldSettingType = "text" | "textarea" | "number" | "boolean" | "select";

export interface FormKnotFieldSettingDefinition {
  key: string;
  label: string;
  type: FormKnotFieldSettingType;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: unknown;
}

export interface FormKnotFieldTypeDefinition<TField extends FormKnotField = FormKnotField> {
  component: ComponentType<FormKnotFieldComponentProps<TField>>;
  label?: string;
  defaultConfig?: Partial<TField>;
  settingsDefinition?: FormKnotFieldSettingDefinition[];
  normalizeValue?: (value: unknown) => unknown;
}

export interface FormKnotFieldComponentRegistry {
  register: <TField extends FormKnotField = FormKnotField>(type: string, definition: FormKnotFieldTypeDefinition<TField>) => void;
  unregister: (type: string) => void;
  get: (type: string) => FormKnotFieldTypeDefinition<never> | undefined;
  has: (type: string) => boolean;
  types: () => string[];
  all: () => Record<string, FormKnotFieldTypeDefinition<never>>;
}

export type FormKnotValidateOn = "change" | "blur" | "submit";

export interface FormKnotFormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  values: Record<string, unknown>;
}

export type FormKnotSchemaChangeHandler = (values: Record<string, unknown>) => void;
export type FormKnotSubmitHandler = (result: FormKnotValidationResult) => void | Promise<void>;
export type FormKnotInvalidHandler = (errors: Record<string, string[]>) => void;
