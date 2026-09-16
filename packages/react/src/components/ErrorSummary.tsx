import type { FormKnotField } from "@formknot/core";

export interface ErrorSummaryProps {
  errors: Record<string, string[]>;
  fields: FormKnotField[];
  onFocusField?: (name: string) => void;
}

export function ErrorSummary({ errors, fields, onFocusField }: ErrorSummaryProps) {
  const entries = Object.entries(errors).filter(([, messages]) => messages.length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="formknot-error-summary" role="alert" aria-live="assertive" tabIndex={-1}>
      <p className="formknot-error-summary-title">Please fix the following errors:</p>
      <ul>
        {entries.map(([name, messages]) => {
          const field = fields.find((f) => f.name === name);
          return (
            <li key={name}>
              <button
                type="button"
                className="formknot-error-summary-link"
                onClick={() => onFocusField?.(name)}
              >
                {field?.label ?? name}
              </button>
              : {messages.join(", ")}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
