import type { FormKnotRadioField } from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

export function RadioField(props: FormKnotFieldComponentProps<FormKnotRadioField>) {
  const { field, id, name, value, onChange, onBlur, disabled, inputRef, ...aria } = props;

  return (
    <div className="formknot-radio-group" role="radiogroup" aria-describedby={aria["aria-describedby"]}>
      {field.options.map((option, index) => {
        const optionId = `${id}-${option.id}`;
        return (
          <label key={option.id} className="formknot-radio-option" htmlFor={optionId}>
            <input
              id={optionId}
              type="radio"
              name={name}
              value={String(option.value)}
              checked={value !== undefined && value !== null && String(value) === String(option.value)}
              disabled={disabled || option.disabled}
              onChange={() => onChange(option.value)}
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
