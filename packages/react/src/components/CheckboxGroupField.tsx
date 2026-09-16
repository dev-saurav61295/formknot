import type { FormKnotCheckboxGroupField } from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

export function CheckboxGroupField(props: FormKnotFieldComponentProps<FormKnotCheckboxGroupField>) {
  const { field, id, name, value, onChange, onBlur, disabled, inputRef, ...aria } = props;
  const selected = Array.isArray(value) ? value : [];

  return (
    <div className="formknot-checkbox-group" aria-describedby={aria["aria-describedby"]}>
      {field.options.map((option, index) => {
        const optionId = `${id}-${option.id}`;
        const isChecked = selected.some((item) => String(item) === String(option.value));
        return (
          <label key={option.id} className="formknot-checkbox-option" htmlFor={optionId}>
            <input
              id={optionId}
              type="checkbox"
              name={`${name}[]`}
              checked={isChecked}
              disabled={disabled || option.disabled}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...selected, option.value]
                  : selected.filter((item) => String(item) !== String(option.value));
                onChange(next);
              }}
              onBlur={onBlur}
              ref={index === 0 ? inputRef : undefined}
              aria-invalid={aria["aria-invalid"]}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
