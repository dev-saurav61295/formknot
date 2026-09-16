import { useRef, useState } from "react";
import { importSchema } from "@formknot/core";
import type { FormKnotSchema, FormKnotSchemaError } from "@formknot/core";
import { Modal } from "./Modal";

export interface ImportDialogProps {
  onImport: (schema: FormKnotSchema) => void;
  onClose: () => void;
}

export function ImportDialog({ onImport, onClose }: ImportDialogProps) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<FormKnotSchemaError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function runImport(json: string) {
    const result = importSchema(json);
    if (result.schema) {
      setErrors([]);
      onImport(result.schema);
      onClose();
    } else {
      setErrors(result.errors);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      setText(content);
      runImport(content);
    };
    reader.readAsText(file);
  }

  return (
    <Modal titleId="formknot-import-title" title="Import schema" onClose={onClose}>
      <p>Paste a FormKnot schema JSON document, or upload a .json file.</p>
      <textarea
        className="formknot-builder-json-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={12}
        aria-label="Schema JSON to import"
        placeholder='{"id": "...", "version": 1, "fields": [...] }'
      />
      {errors.length > 0 && (
        <ul className="formknot-builder-import-errors" role="alert">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      )}
      <div className="formknot-builder-modal-actions">
        <button type="button" onClick={() => runImport(text)} disabled={!text.trim()}>
          Import
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Upload file…
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
      </div>
    </Modal>
  );
}
