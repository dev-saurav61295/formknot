import { useEffect, useState } from "react";

export interface TextSettingProps {
  id: string;
  label: string;
  value: string;
  onCommit: (value: string) => void;
  type?: "text" | "number";
  textarea?: boolean;
  /** Returns an error message for an invalid draft, or undefined when the draft is valid. Invalid drafts are not committed. */
  validate?: (draft: string) => string | undefined;
}

/** A settings-panel text input that commits to the reducer on blur/Enter rather than every keystroke, keeping undo history usable. */
export function TextSetting({ id, label, value, onCommit, type = "text", textarea = false, validate }: TextSettingProps) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setDraft(value);
    setError(undefined);
  }, [value]);

  const commit = () => {
    const validationError = validate?.(draft);
    setError(validationError);
    if (validationError) return;
    if (draft !== value) onCommit(draft);
  };

  const errorId = `${id}-error`;

  return (
    <div className="formknot-builder-setting">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
        />
      )}
      {error && (
        <p id={errorId} className="formknot-builder-setting-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
