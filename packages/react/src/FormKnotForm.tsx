import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import type { FormKnotField, FormKnotSchema, FormKnotValidatorRegistry } from "@formknot/core";
import { createFormKnotFieldRegistry } from "./fieldRegistry";
import { createFormKnotResolver } from "./resolver";
import { useFormKnotConditions } from "./useFormKnotConditions";
import { FieldWrapper } from "./components/FieldWrapper";
import { ErrorSummary } from "./components/ErrorSummary";
import type {
  FormKnotFieldComponentRegistry,
  FormKnotFormState,
  FormKnotInvalidHandler,
  FormKnotSchemaChangeHandler,
  FormKnotSubmitHandler,
  FormKnotValidateOn,
} from "./types";

export interface FormKnotFormProps {
  schema: FormKnotSchema;
  initialValues?: Record<string, unknown>;
  validators?: FormKnotValidatorRegistry;
  components?: FormKnotFieldComponentRegistry;
  validateOn?: FormKnotValidateOn;
  onChange?: FormKnotSchemaChangeHandler;
  onSubmit?: FormKnotSubmitHandler;
  onInvalid?: FormKnotInvalidHandler;
  className?: string;
  id?: string;
  children?: ReactNode | ((state: FormKnotFormState) => ReactNode);
}

function computeDefaultValues(schema: FormKnotSchema, initialValues?: Record<string, unknown>): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of schema.fields) {
    defaults[field.name] = field.defaultValue ?? (field.type === "checkboxGroup" ? [] : field.type === "checkbox" ? false : "");
  }
  return { ...defaults, ...initialValues };
}

function describedByFor(field: FormKnotField, hasErrors: boolean): string | undefined {
  const ids: string[] = [];
  if (field.description) ids.push(`${field.id}-description`);
  if (hasErrors) ids.push(`${field.id}-error`);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

const modeFor: Record<FormKnotValidateOn, "onBlur" | "onChange" | "onSubmit"> = {
  blur: "onBlur",
  change: "onChange",
  submit: "onSubmit",
};

export function FormKnotForm(props: FormKnotFormProps) {
  const {
    schema,
    initialValues,
    validators,
    components,
    validateOn = "blur",
    onChange,
    onSubmit,
    onInvalid,
    className,
    id,
    children,
  } = props;

  const registry = useMemo(() => components ?? createFormKnotFieldRegistry(), [components]);
  const resolver = useMemo(() => createFormKnotResolver(schema, validators), [schema, validators]);
  const defaultValues = useMemo(() => computeDefaultValues(schema, initialValues), [schema]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setFocus,
    setValue,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<Record<string, unknown>>({
    resolver,
    defaultValues,
    mode: modeFor[validateOn],
  });

  const conditionStates = useFormKnotConditions(schema, control);

  const previousVisibility = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (schema.settings?.clearHiddenFieldValues === false) return;
    for (const field of schema.fields) {
      const visible = conditionStates[field.name]?.visible ?? true;
      const wasVisible = previousVisibility.current[field.name] ?? true;
      if (wasVisible && !visible) {
        setValue(field.name, field.defaultValue ?? (field.type === "checkboxGroup" ? [] : field.type === "checkbox" ? false : ""));
      }
    }
    previousVisibility.current = Object.fromEntries(schema.fields.map((f) => [f.name, conditionStates[f.name]?.visible ?? true]));
  }, [conditionStates, schema, setValue]);

  useEffect(() => {
    if (!onChange) return undefined;
    const subscription = watch((values) => onChange(values as Record<string, unknown>));
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const submittingRef = useRef(false);

  const internalSubmit = handleSubmit(
    async (data) => {
      await onSubmit?.({ valid: true, data, errors: {} });
    },
    (fieldErrors) => {
      const mapped: Record<string, string[]> = {};
      for (const [name, error] of Object.entries(fieldErrors)) {
        mapped[name] = [String(error?.message ?? "Invalid value")];
      }
      onInvalid?.(mapped);
      const firstInvalid = schema.fields.find((field) => mapped[field.name]);
      if (firstInvalid) setFocus(firstInvalid.name);
    }
  );

  const guardedSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      await internalSubmit(event);
    } finally {
      submittingRef.current = false;
    }
  };

  const errorMessages: Record<string, string[]> = {};
  for (const field of schema.fields) {
    const error = errors[field.name];
    if (error?.message) errorMessages[field.name] = [String(error.message)];
  }

  const formState: FormKnotFormState = {
    isSubmitting,
    isValid,
    isDirty,
    values: typeof children === "function" ? (watch() as Record<string, unknown>) : {},
  };

  const hasVisibleInteractiveField = schema.fields.some((field) => {
    if (field.type === "hidden") return false;
    return conditionStates[field.name]?.visible ?? true;
  });

  return (
    <form
      id={id}
      className={`formknot-form ${className ?? ""}`.trim()}
      noValidate
      onSubmit={guardedSubmit}
      aria-busy={isSubmitting || undefined}
    >
      <ErrorSummary errors={errorMessages} fields={schema.fields} onFocusField={(name) => setFocus(name)} />

      {schema.fields.map((field) => {
        const state = conditionStates[field.name] ?? { visible: true, enabled: true };
        if (!state.visible) return null;

        const definition = registry.get(field.type);
        const fieldErrors = errorMessages[field.name] ?? [];

        if (!definition) {
          return (
            <div key={field.id} className="formknot-field formknot-field-unknown" role="alert">
              Unknown field type &quot;{field.type}&quot; for field &quot;{field.name}&quot;.
            </div>
          );
        }

        const disabled = Boolean(field.disabled) || !state.enabled;
        const Component = definition.component;

        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: rhfField }) => (
              <FieldWrapper
                field={field}
                descriptionId={`${field.id}-description`}
                errorId={`${field.id}-error`}
                errors={fieldErrors}
              >
                <Component
                  field={field as never}
                  id={field.id}
                  name={field.name}
                  value={rhfField.value}
                  onChange={rhfField.onChange}
                  onBlur={rhfField.onBlur}
                  disabled={disabled}
                  readOnly={Boolean(field.readOnly)}
                  errors={fieldErrors}
                  aria-invalid={fieldErrors.length > 0 || undefined}
                  aria-describedby={describedByFor(field, fieldErrors.length > 0)}
                  inputRef={rhfField.ref}
                />
              </FieldWrapper>
            )}
          />
        );
      })}

      {typeof children === "function" ? (
        children(formState)
      ) : (
        children ??
        (hasVisibleInteractiveField && (
          <div className="formknot-actions">
            <button type="submit" className="formknot-submit" disabled={isSubmitting}>
              {schema.settings?.submitButtonLabel ?? "Submit"}
            </button>
            <button type="button" className="formknot-reset" onClick={() => reset()} disabled={isSubmitting}>
              {schema.settings?.resetButtonLabel ?? "Reset"}
            </button>
          </div>
        ))
      )}
    </form>
  );
}
