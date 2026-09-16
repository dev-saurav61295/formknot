import type {
  FormKnotDateField,
  FormKnotEmailField,
  FormKnotNumberField,
  FormKnotPasswordField,
  FormKnotTextField,
} from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

type SingleLineField = FormKnotTextField | FormKnotEmailField | FormKnotPasswordField | FormKnotNumberField | FormKnotDateField;

const HTML_TYPE_BY_FIELD_TYPE: Record<string, string> = {
  text: "text",
  email: "email",
  password: "password",
  number: "number",
  date: "date",
};

export function TextLikeField(props: FormKnotFieldComponentProps<SingleLineField>) {
  const { field, id, name, value, onChange, onBlur, disabled, readOnly, errors: _errors, inputRef, ...aria } = props;
  const attributes = (field.attributes ?? {}) as Record<string, unknown>;
  const htmlType = HTML_TYPE_BY_FIELD_TYPE[field.type] ?? "text";

  return (
    <input
      id={id}
      name={name}
      type={htmlType}
      className="formknot-input"
      value={(value as string | number | undefined) ?? ""}
      placeholder={field.placeholder}
      disabled={disabled}
      readOnly={readOnly}
      autoComplete={field.autoComplete}
      minLength={typeof attributes.minLength === "number" ? attributes.minLength : undefined}
      maxLength={typeof attributes.maxLength === "number" ? attributes.maxLength : undefined}
      pattern={typeof attributes.pattern === "string" ? attributes.pattern : undefined}
      min={typeof attributes.min !== "undefined" ? String(attributes.min) : undefined}
      max={typeof attributes.max !== "undefined" ? String(attributes.max) : undefined}
      step={typeof attributes.step !== "undefined" ? String(attributes.step) : undefined}
      onChange={(event) => onChange(htmlType === "number" ? event.target.valueAsNumber : event.target.value)}
      onBlur={onBlur}
      ref={inputRef}
      aria-invalid={aria["aria-invalid"]}
      aria-describedby={aria["aria-describedby"]}
      aria-required={field.required || undefined}
    />
  );
}
