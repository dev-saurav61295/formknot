import { EMAIL_PATTERN } from "./constants";
import { evaluateSchemaConditions } from "./conditions";
import type { FormKnotField, FormKnotSchema, FormKnotValidationResult } from "./types";
import type { FormKnotValidatorRegistry } from "./validatorRegistry";

export interface ValidateFormDataOptions {
  validators?: FormKnotValidatorRegistry;
  /** Only validate fields currently visible per their conditions. Defaults to schema.settings.validateVisibleFieldsOnly ?? true. */
  visibleOnly?: boolean;
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

async function runFieldValidations(
  field: FormKnotField,
  value: unknown,
  values: Record<string, unknown>,
  validators?: FormKnotValidatorRegistry
): Promise<string[]> {
  const messages: string[] = [];
  const rules = field.validations ?? [];

  for (const rule of rules) {
    switch (rule.type) {
      case "required": {
        if (isEmptyValue(value)) messages.push(rule.message);
        break;
      }
      case "email": {
        if (!isEmptyValue(value) && !EMAIL_PATTERN.test(String(value))) messages.push(rule.message);
        break;
      }
      case "minLength": {
        if (!isEmptyValue(value) && String(value).length < Number(rule.value)) messages.push(rule.message);
        break;
      }
      case "maxLength": {
        if (!isEmptyValue(value) && String(value).length > Number(rule.value)) messages.push(rule.message);
        break;
      }
      case "min": {
        if (!isEmptyValue(value) && Number(value) < Number(rule.value)) messages.push(rule.message);
        break;
      }
      case "max": {
        if (!isEmptyValue(value) && Number(value) > Number(rule.value)) messages.push(rule.message);
        break;
      }
      case "pattern": {
        if (!isEmptyValue(value) && typeof rule.value === "string") {
          try {
            const regex = new RegExp(rule.value);
            if (!regex.test(String(value))) messages.push(rule.message);
          } catch {
            messages.push(rule.message);
          }
        }
        break;
      }
      case "custom": {
        const validator = rule.validatorId ? validators?.get(rule.validatorId) : undefined;
        if (!validator) {
          messages.push(rule.message || `Validator "${rule.validatorId}" is not registered`);
          break;
        }
        const result = await validator({ value, values, fieldName: field.name });
        if (result) messages.push(result || rule.message);
        break;
      }
      default:
        break;
    }
  }

  return messages;
}

/**
 * Validates a submitted value set against a FormKnotSchema. Runs built-in
 * rule checks synchronously and custom validators (sync or async) through
 * the supplied registry.
 */
export async function validateFormData(
  schema: FormKnotSchema,
  values: Record<string, unknown>,
  options: ValidateFormDataOptions = {}
): Promise<FormKnotValidationResult> {
  const visibleOnly = options.visibleOnly ?? schema.settings?.validateVisibleFieldsOnly ?? true;
  const conditionStates = evaluateSchemaConditions(schema, values);

  const errors: Record<string, string[]> = {};
  const data: Record<string, unknown> = {};

  await Promise.all(
    schema.fields.map(async (field) => {
      const state = conditionStates[field.name];
      const isVisible = state?.visible ?? true;
      const value = Object.prototype.hasOwnProperty.call(values, field.name) ? values[field.name] : field.defaultValue;
      data[field.name] = value;

      if (visibleOnly && !isVisible) return;
      if (field.disabled || state?.enabled === false) return;

      const messages = await runFieldValidations(field, value, values, options.validators);
      if (messages.length > 0) errors[field.name] = messages;
    })
  );

  return { valid: Object.keys(errors).length === 0, data, errors };
}
