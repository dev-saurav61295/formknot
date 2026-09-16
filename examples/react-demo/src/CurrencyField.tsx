import type { FormKnotFieldComponentProps } from "@formknot/react";

/** A custom FormKnot field: a labeled currency amount input. Demonstrates the custom-field extensibility API. */
export function CurrencyField(props: FormKnotFieldComponentProps) {
  const { id, name, value, onChange, onBlur, disabled, inputRef } = props;
  const currency = (props.field.metadata?.currency as string | undefined) ?? "USD";

  return (
    <div className="currency-field">
      <span className="currency-field-symbol" aria-hidden="true">
        {currency}
      </span>
      <input
        id={id}
        name={name}
        type="number"
        step="0.01"
        min="0"
        className="currency-field-input"
        value={(value as number | string | undefined) ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        onBlur={onBlur}
        ref={inputRef}
        aria-invalid={props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
      />
    </div>
  );
}
