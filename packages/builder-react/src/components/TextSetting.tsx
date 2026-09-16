import { useEffect, useState } from "react";

export interface TextSettingProps {
  id: string;
  label: string;
  value: string;
  onCommit: (value: string) => void;
  type?: "text" | "number";
  textarea?: boolean;
}

/** A settings-panel text input that commits to the reducer on blur/Enter rather than every keystroke, keeping undo history usable. */
export function TextSetting({ id, label, value, onCommit, type = "text", textarea = false }: TextSettingProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    if (draft !== value) onCommit(draft);
  };

  return (
    <div className="formknot-builder-setting">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
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
        />
      )}
    </div>
  );
}
