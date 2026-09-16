import type { FormKnotSelectField } from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

export function SelectField(props: FormKnotFieldComponentProps<FormKnotSelectField>) {
  const { field, id, name, value, onChange, onBlur, disabled, inputRef, ...aria } = props;

  return (
    <select
      id={id}
      name={name}
      className="formknot-select"
      value={value === undefined || value === null ? "" : String(value)}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      ref={inputRef}
      aria-invalid={aria["aria-invalid"]}
      aria-describedby={aria["aria-describedby"]}
      aria-required={field.required || undefined}
    >
      <option value="" disabled={field.required}>
        {field.placeholder ?? "Select an option"}
      </option>
      {field.options.map((option) => (
        <option key={option.id} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
