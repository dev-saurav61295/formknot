import type { FormKnotCheckboxField } from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

export function CheckboxField(props: FormKnotFieldComponentProps<FormKnotCheckboxField>) {
  const { id, name, value, onChange, onBlur, disabled, inputRef, ...aria } = props;

  return (
    <input
      id={id}
      name={name}
      type="checkbox"
      className="formknot-checkbox"
      checked={Boolean(value)}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      onBlur={onBlur}
      ref={inputRef}
      aria-invalid={aria["aria-invalid"]}
      aria-describedby={aria["aria-describedby"]}
    />
  );
}
