import type { FormKnotHiddenField } from "@formknot/core";
import type { FormKnotFieldComponentProps } from "../types";

export function HiddenField(props: FormKnotFieldComponentProps<FormKnotHiddenField>) {
  const { id, name, value, inputRef } = props;
  return <input id={id} name={name} type="hidden" value={value == null ? "" : String(value)} ref={inputRef} readOnly />;
}
