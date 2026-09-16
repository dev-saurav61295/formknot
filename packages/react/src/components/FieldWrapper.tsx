import type { ReactNode } from "react";
import type { FormKnotField } from "@formknot/core";

const GROUPED_FIELD_TYPES = new Set(["radio", "checkboxGroup"]);

export interface FieldWrapperProps {
  field: FormKnotField;
  descriptionId: string;
  errorId: string;
  errors: string[];
  children: ReactNode;
}

export function FieldWrapper({ field, descriptionId, errorId, errors, children }: FieldWrapperProps) {
  if (field.type === "hidden") {
    return <>{children}</>;
  }

  const description = field.description ? (
    <p className="formknot-field-description" id={descriptionId}>
      {field.description}
    </p>
  ) : null;

  const errorList =
    errors.length > 0 ? (
      <ul className="formknot-field-errors" id={errorId} role="alert">
        {errors.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    ) : null;

  if (GROUPED_FIELD_TYPES.has(field.type)) {
    return (
      <fieldset className={`formknot-field formknot-field-group ${field.className ?? ""}`.trim()}>
        <legend className="formknot-legend">
          {field.label}
          {field.required ? <span className="formknot-required-indicator" aria-hidden="true"> *</span> : null}
        </legend>
        {description}
        {children}
        {errorList}
      </fieldset>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={`formknot-field formknot-field-checkbox ${field.className ?? ""}`.trim()}>
        <label className="formknot-checkbox-label" htmlFor={field.id}>
          {children}
          <span>
            {field.label}
            {field.required ? <span className="formknot-required-indicator" aria-hidden="true"> *</span> : null}
          </span>
        </label>
        {description}
        {errorList}
      </div>
    );
  }

  return (
    <div className={`formknot-field ${field.className ?? ""}`.trim()}>
      <label className="formknot-label" htmlFor={field.id}>
        {field.label}
        {field.required ? <span className="formknot-required-indicator" aria-hidden="true"> *</span> : null}
      </label>
      {description}
      {children}
      {errorList}
    </div>
  );
}
