import Ajv, { type ErrorObject } from "ajv";
import { ALL_FIELD_TYPES, CHOICE_FIELD_TYPES } from "./types";
import type { FormKnotField, FormKnotSchema, FormKnotSchemaError, FormKnotSchemaValidationResult } from "./types";
import { findCircularConditionDependencies } from "./conditions";
import { isUnsafeKey } from "./objectUtils";
import { CURRENT_SCHEMA_VERSION } from "./constants";

const fieldOptionJsonSchema = {
  type: "object",
  required: ["id", "label", "value"],
  properties: {
    id: { type: "string", minLength: 1 },
    label: { type: "string" },
    value: { type: ["string", "number", "boolean"] },
    disabled: { type: "boolean" },
  },
  additionalProperties: false,
};

const validationRuleJsonSchema = {
  type: "object",
  required: ["id", "type", "message"],
  properties: {
    id: { type: "string", minLength: 1 },
    type: { enum: ["required", "email", "minLength", "maxLength", "min", "max", "pattern", "custom"] },
    value: { type: ["string", "number"] },
    validatorId: { type: "string" },
    message: { type: "string" },
  },
  additionalProperties: false,
};

const conditionRuleJsonSchema = {
  type: "object",
  required: ["id", "sourceField", "operator", "action"],
  properties: {
    id: { type: "string", minLength: 1 },
    sourceField: { type: "string", minLength: 1 },
    operator: {
      enum: [
        "equals",
        "notEquals",
        "contains",
        "notContains",
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
        "isEmpty",
        "isNotEmpty",
      ],
    },
    value: {},
    action: { enum: ["show", "hide", "enable", "disable"] },
  },
  additionalProperties: false,
};

const conditionGroupJsonSchema = {
  type: "object",
  required: ["strategy", "rules"],
  properties: {
    strategy: { enum: ["all", "any"] },
    rules: { type: "array", items: conditionRuleJsonSchema },
  },
  additionalProperties: false,
};

const fieldJsonSchema = {
  type: "object",
  required: ["id", "type", "name", "label"],
  properties: {
    id: { type: "string", minLength: 1 },
    // Built-in types are enumerated in ALL_FIELD_TYPES; any other non-empty string is
    // treated as a custom field type registered by the consumer (see createFieldRegistry
    // in this package and createFormKnotFieldRegistry in @formknot/react).
    type: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1 },
    label: { type: "string" },
    description: { type: "string" },
    placeholder: { type: "string" },
    defaultValue: {},
    disabled: { type: "boolean" },
    readOnly: { type: "boolean" },
    hidden: { type: "boolean" },
    required: { type: "boolean" },
    className: { type: "string" },
    autoComplete: { type: "string" },
    attributes: { type: "object" },
    options: { type: "array", items: fieldOptionJsonSchema },
    validations: { type: "array", items: validationRuleJsonSchema },
    conditions: conditionGroupJsonSchema,
    metadata: { type: "object" },
  },
  additionalProperties: false,
};

const settingsJsonSchema = {
  type: "object",
  properties: {
    clearHiddenFieldValues: { type: "boolean" },
    validateVisibleFieldsOnly: { type: "boolean" },
    submitButtonLabel: { type: "string" },
    resetButtonLabel: { type: "string" },
  },
  additionalProperties: false,
};

const schemaJsonSchema = {
  type: "object",
  required: ["id", "version", "fields"],
  properties: {
    id: { type: "string", minLength: 1 },
    title: { type: "string" },
    description: { type: "string" },
    version: { type: "number" },
    fields: { type: "array", items: fieldJsonSchema },
    settings: settingsJsonSchema,
    metadata: { type: "object" },
  },
  additionalProperties: false,
};

const ajv = new Ajv({ allErrors: true, strict: false });
const validateStructure = ajv.compile(schemaJsonSchema);

function ajvErrorToFormKnotError(error: ErrorObject): FormKnotSchemaError {
  const path = error.instancePath ? error.instancePath.replace(/^\//, "").replace(/\//g, ".") : "(root)";
  return { path, message: `${path}: ${error.message ?? "is invalid"}` };
}

function findUnsafeKeys(value: unknown, path: string): FormKnotSchemaError[] {
  const errors: FormKnotSchemaError[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => errors.push(...findUnsafeKeys(item, `${path}[${index}]`)));
    return errors;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      if (isUnsafeKey(key)) {
        errors.push({ path: `${path}.${key}`, message: `${path}.${key}: unsafe key "${key}" is not allowed` });
        continue;
      }
      errors.push(...findUnsafeKeys((value as Record<string, unknown>)[key], `${path}.${key}`));
    }
  }
  return errors;
}

const STRING_VALIDATION_TYPES = new Set(["minLength", "maxLength", "pattern", "email"]);
const NUMERIC_VALIDATION_TYPES = new Set(["min", "max"]);
const STRING_FIELD_TYPES = new Set(["text", "textarea", "email", "password"]);
const NUMERIC_OR_DATE_FIELD_TYPES = new Set(["number", "date"]);

function validateFieldSemantics(field: FormKnotField, index: number, allNames: Set<string>): FormKnotSchemaError[] {
  const errors: FormKnotSchemaError[] = [];
  const base = `fields[${index}]`;
  const isChoiceType = (CHOICE_FIELD_TYPES as readonly string[]).includes(field.type);
  const isBuiltInType = (ALL_FIELD_TYPES as readonly string[]).includes(field.type);
  const hasOptions = "options" in field && Array.isArray((field as { options?: unknown }).options);

  if (isChoiceType) {
    const options = (field as { options?: Array<{ id: string; value: unknown }> }).options;
    if (!options || options.length === 0) {
      errors.push({ path: `${base}.options`, message: `${base}.options: field type "${field.type}" requires at least one option` });
    } else {
      const ids = new Set<string>();
      const values = new Set<string>();
      options.forEach((option, optionIndex) => {
        if (ids.has(option.id)) {
          errors.push({
            path: `${base}.options[${optionIndex}].id`,
            message: `${base}.options[${optionIndex}].id: duplicate option id "${option.id}"`,
          });
        }
        ids.add(option.id);
        const valueKey = String(option.value);
        if (values.has(valueKey)) {
          errors.push({
            path: `${base}.options[${optionIndex}].value`,
            message: `${base}.options[${optionIndex}].value: duplicate option value "${valueKey}"`,
          });
        }
        values.add(valueKey);
      });
    }
  } else if (hasOptions && isBuiltInType) {
    errors.push({ path: `${base}.options`, message: `${base}.options: field type "${field.type}" does not support options` });
  }

  const validations = field.validations ?? [];
  validations.forEach((rule, ruleIndex) => {
    const rulePath = `${base}.validations[${ruleIndex}]`;
    if (rule.type === "custom" && !rule.validatorId) {
      errors.push({ path: `${rulePath}.validatorId`, message: `${rulePath}.validatorId: "custom" rules require a validatorId` });
    }
    if ((rule.type === "minLength" || rule.type === "maxLength" || rule.type === "min" || rule.type === "max") && rule.value === undefined) {
      errors.push({ path: `${rulePath}.value`, message: `${rulePath}.value: "${rule.type}" rules require a value` });
    }
    if (rule.type === "pattern") {
      if (typeof rule.value !== "string" || rule.value.length === 0) {
        errors.push({ path: `${rulePath}.value`, message: `${rulePath}.value: "pattern" rules require a non-empty string value` });
      } else {
        try {
          // eslint-disable-next-line no-new
          new RegExp(rule.value);
        } catch {
          errors.push({ path: `${rulePath}.value`, message: `${rulePath}.value: "${rule.value}" is not a valid regular expression` });
        }
      }
    }
    if (STRING_VALIDATION_TYPES.has(rule.type) && NUMERIC_OR_DATE_FIELD_TYPES.has(field.type)) {
      errors.push({ path: rulePath, message: `${rulePath}: "${rule.type}" is not applicable to field type "${field.type}"` });
    }
    if (NUMERIC_VALIDATION_TYPES.has(rule.type) && STRING_FIELD_TYPES.has(field.type)) {
      errors.push({ path: rulePath, message: `${rulePath}: "${rule.type}" is not applicable to field type "${field.type}"` });
    }
  });

  const conditions = field.conditions;
  if (conditions) {
    conditions.rules.forEach((rule, ruleIndex) => {
      const rulePath = `${base}.conditions.rules[${ruleIndex}]`;
      if (!allNames.has(rule.sourceField)) {
        errors.push({
          path: `${rulePath}.sourceField`,
          message: `${rulePath}.sourceField: references unknown field "${rule.sourceField}"`,
        });
      }
    });
  }

  return errors;
}

export interface ValidateFormKnotSchemaOptions {
  /**
   * Extra field type names to treat as supported, beyond the built-in
   * ALL_FIELD_TYPES. Pass the custom types you have registered (e.g. via
   * createFormKnotFieldRegistry in @formknot/react) so schemas using them
   * validate as expected; unlisted types are reported as unsupported.
   */
  additionalFieldTypes?: string[];
}

/**
 * Validates a (parsed) FormKnotSchema document. Performs AJV structural
 * validation first, then semantic checks (uniqueness, supported field
 * types, option/validation compatibility, field references, circular
 * conditions, unsafe keys).
 */
export function validateFormKnotSchema(
  schema: unknown,
  options: ValidateFormKnotSchemaOptions = {}
): FormKnotSchemaValidationResult {
  const structurallyValid = validateStructure(schema);
  const errors: FormKnotSchemaError[] = [];

  if (!structurallyValid) {
    for (const error of validateStructure.errors ?? []) {
      errors.push(ajvErrorToFormKnotError(error));
    }
    return { valid: false, errors };
  }

  const typed = schema as unknown as FormKnotSchema;
  const supportedTypes = new Set<string>([...ALL_FIELD_TYPES, ...(options.additionalFieldTypes ?? [])]);

  errors.push(...findUnsafeKeys(typed, "$"));

  if (typed.version > CURRENT_SCHEMA_VERSION) {
    errors.push({
      path: "version",
      message: `version: schema version ${typed.version} is newer than the supported version ${CURRENT_SCHEMA_VERSION}`,
    });
  }

  const ids = new Set<string>();
  const names = new Set<string>();
  typed.fields.forEach((field) => names.add(field.name));

  typed.fields.forEach((field, index) => {
    const base = `fields[${index}]`;
    if (ids.has(field.id)) {
      errors.push({ path: `${base}.id`, message: `${base}.id: duplicate field id "${field.id}"` });
    }
    ids.add(field.id);

    const nameCount = typed.fields.filter((f) => f.name === field.name).length;
    if (nameCount > 1) {
      errors.push({ path: `${base}.name`, message: `${base}.name: duplicate field name "${field.name}"` });
    }

    if (!supportedTypes.has(field.type)) {
      errors.push({ path: `${base}.type`, message: `${base}.type: unsupported field type "${field.type}"` });
    }

    errors.push(...validateFieldSemantics(field, index, names));
  });

  const cyclic = findCircularConditionDependencies(typed.fields);
  if (cyclic.length > 0) {
    errors.push({
      path: "fields",
      message: `fields: circular conditional dependency detected among fields [${cyclic.join(", ")}]`,
    });
  }

  return { valid: errors.length === 0, errors };
}
