import type { FormKnotTextareaField } from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

export function TextareaField(props: FormKnotFieldComponentProps<FormKnotTextareaField>) {
  const { field, id, name, value, onChange, onBlur, disabled, readOnly, inputRef, ...aria } = props;
  const attributes = field.attributes ?? {};

  return (
    <textarea
      id={id}
      name={name}
      className="formknot-textarea"
      value={(value as string | undefined) ?? ""}
      placeholder={field.placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={attributes.rows}
      minLength={attributes.minLength}
      maxLength={attributes.maxLength}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      ref={inputRef}
      aria-invalid={aria["aria-invalid"]}
      aria-describedby={aria["aria-describedby"]}
      aria-required={field.required || undefined}
    />
  );
}
