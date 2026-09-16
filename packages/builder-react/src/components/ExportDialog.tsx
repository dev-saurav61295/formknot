import { useState } from "react";
import { exportSchema } from "@formknot/core";
import type { FormKnotSchema } from "@formknot/core";
import { Modal } from "./Modal";

export interface ExportDialogProps {
  schema: FormKnotSchema;
  onClose: () => void;
}

export function ExportDialog({ schema, onClose }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const json = exportSchema(schema);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function downloadFile() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${schema.id || "formknot-schema"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal titleId="formknot-export-title" title="Export schema" onClose={onClose}>
      <textarea className="formknot-builder-json-output" readOnly value={json} rows={16} aria-label="Exported schema JSON" />
      <div className="formknot-builder-modal-actions">
        <button type="button" onClick={copyToClipboard}>
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
        <button type="button" onClick={downloadFile}>
          Download .json
        </button>
      </div>
    </Modal>
  );
}
