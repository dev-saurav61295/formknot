import type { FormKnotFileField } from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

export function FileField(props: FormKnotFieldComponentProps<FormKnotFileField>) {
  const { field, id, name, onChange, onBlur, disabled, inputRef, ...aria } = props;
  const attributes = field.attributes ?? {};

  return (
    <input
      id={id}
      name={name}
      type="file"
      className="formknot-file"
      disabled={disabled}
      accept={attributes.accept}
      multiple={attributes.multiple}
      onChange={(event) => {
        const files = event.target.files;
        onChange(attributes.multiple ? Array.from(files ?? []) : (files?.[0] ?? null));
      }}
      onBlur={onBlur}
      ref={inputRef}
      aria-invalid={aria["aria-invalid"]}
      aria-describedby={aria["aria-describedby"]}
    />
  );
}
