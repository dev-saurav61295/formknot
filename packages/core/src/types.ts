/**
 * Public type definitions for FormKnot schemas.
 *
 * These types are the serializable contract between the builder, the
 * renderer, and any consumer that stores or transports a FormKnot schema.
 * Nothing in this file may reference React, the DOM, or executable code.
 */

export type FormKnotFieldType =
  | "text"
  | "textarea"
  | "email"
  | "password"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "checkboxGroup"
  | "date"
  | "file"
  | "hidden";

/** Field types that render a fixed set of choices. */
export const CHOICE_FIELD_TYPES = ["select", "radio", "checkboxGroup"] as const;
export type ChoiceFieldType = (typeof CHOICE_FIELD_TYPES)[number];

export const ALL_FIELD_TYPES: readonly FormKnotFieldType[] = [
  "text",
  "textarea",
  "email",
  "password",
  "number",
  "select",
  "radio",
  "checkbox",
  "checkboxGroup",
  "date",
  "file",
  "hidden",
];

export interface FormKnotFieldOption {
  id: string;
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export type FormKnotValidationRuleType =
  | "required"
  | "email"
  | "minLength"
  | "maxLength"
  | "min"
  | "max"
  | "pattern"
  | "custom";

export interface FormKnotValidationRule {
  id: string;
  type: FormKnotValidationRuleType;
  /** Threshold/comparison value. Ignored for "required", "email" and "custom". */
  value?: string | number;
  /** Identifier of a validator registered via createValidatorRegistry(). Required when type is "custom". */
  validatorId?: string;
  message: string;
}

export type FormKnotConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "isEmpty"
  | "isNotEmpty";

export type FormKnotConditionAction = "show" | "hide" | "enable" | "disable";

export interface FormKnotFieldCondition {
  id: string;
  sourceField: string;
  operator: FormKnotConditionOperator;
  value?: unknown;
  action: FormKnotConditionAction;
}

export interface FormKnotConditionGroup {
  strategy: "all" | "any";
  rules: FormKnotFieldCondition[];
}

/** Type-specific native-input hints. These never carry validation semantics on their own. */
export interface FormKnotTextAttributes {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface FormKnotTextareaAttributes {
  rows?: number;
  minLength?: number;
  maxLength?: number;
}

export interface FormKnotNumberAttributes {
  min?: number;
  max?: number;
  step?: number;
}

export interface FormKnotDateAttributes {
  min?: string;
  max?: string;
}

export interface FormKnotFileAttributes {
  accept?: string;
  multiple?: boolean;
}

export type FormKnotFieldAttributes =
  | FormKnotTextAttributes
  | FormKnotTextareaAttributes
  | FormKnotNumberAttributes
  | FormKnotDateAttributes
  | FormKnotFileAttributes
  | Record<string, never>;

interface FormKnotFieldBase<TType extends FormKnotFieldType> {
  id: string;
  type: TType;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  validations?: FormKnotValidationRule[];
  conditions?: FormKnotConditionGroup;
  metadata?: Record<string, unknown>;
}

export interface FormKnotTextField extends FormKnotFieldBase<"text"> {
  defaultValue?: string;
  attributes?: FormKnotTextAttributes;
}

export interface FormKnotTextareaField extends FormKnotFieldBase<"textarea"> {
  defaultValue?: string;
  attributes?: FormKnotTextareaAttributes;
}

export interface FormKnotEmailField extends FormKnotFieldBase<"email"> {
  defaultValue?: string;
  attributes?: FormKnotTextAttributes;
}

export interface FormKnotPasswordField extends FormKnotFieldBase<"password"> {
  defaultValue?: string;
  attributes?: FormKnotTextAttributes;
}

export interface FormKnotNumberField extends FormKnotFieldBase<"number"> {
  defaultValue?: number;
  attributes?: FormKnotNumberAttributes;
}

export interface FormKnotSelectField extends FormKnotFieldBase<"select"> {
  defaultValue?: string | number | boolean;
  options: FormKnotFieldOption[];
  attributes?: { multiple?: boolean };
}

export interface FormKnotRadioField extends FormKnotFieldBase<"radio"> {
  defaultValue?: string | number | boolean;
  options: FormKnotFieldOption[];
}

export interface FormKnotCheckboxField extends FormKnotFieldBase<"checkbox"> {
  defaultValue?: boolean;
}

export interface FormKnotCheckboxGroupField extends FormKnotFieldBase<"checkboxGroup"> {
  defaultValue?: Array<string | number | boolean>;
  options: FormKnotFieldOption[];
}

export interface FormKnotDateField extends FormKnotFieldBase<"date"> {
  defaultValue?: string;
  attributes?: FormKnotDateAttributes;
}

export interface FormKnotFileField extends FormKnotFieldBase<"file"> {
  defaultValue?: never;
  attributes?: FormKnotFileAttributes;
}

export interface FormKnotHiddenField extends FormKnotFieldBase<"hidden"> {
  defaultValue?: unknown;
}

/** Discriminated union of every built-in field definition. */
export type FormKnotField =
  | FormKnotTextField
  | FormKnotTextareaField
  | FormKnotEmailField
  | FormKnotPasswordField
  | FormKnotNumberField
  | FormKnotSelectField
  | FormKnotRadioField
  | FormKnotCheckboxField
  | FormKnotCheckboxGroupField
  | FormKnotDateField
  | FormKnotFileField
  | FormKnotHiddenField;

export type FormKnotFieldWithOptions = Extract<FormKnotField, { options: FormKnotFieldOption[] }>;

export function fieldHasOptions(field: FormKnotField): field is FormKnotFieldWithOptions {
  return (CHOICE_FIELD_TYPES as readonly string[]).includes(field.type);
}

export interface FormKnotSettings {
  /** Clear the stored value of a field whenever a condition hides it. Defaults to true. */
  clearHiddenFieldValues?: boolean;
  /** Only validate fields that are currently visible. Defaults to true. */
  validateVisibleFieldsOnly?: boolean;
  submitButtonLabel?: string;
  resetButtonLabel?: string;
}

export interface FormKnotSchema {
  id: string;
  title?: string;
  description?: string;
  version: number;
  fields: FormKnotField[];
  settings?: FormKnotSettings;
  metadata?: Record<string, unknown>;
}

export interface FormKnotValidationResult<TValues = Record<string, unknown>> {
  valid: boolean;
  data: TValues;
  errors: Record<string, string[]>;
}

/** Path-based structural error produced while validating a schema document. */
export interface FormKnotSchemaError {
  path: string;
  message: string;
}

export interface FormKnotSchemaValidationResult {
  valid: boolean;
  errors: FormKnotSchemaError[];
}
