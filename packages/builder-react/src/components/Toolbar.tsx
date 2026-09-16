import type { FormKnotSchemaError } from "@formknot/core";

export interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  schemaErrors: FormKnotSchemaError[];
}

export function Toolbar({ canUndo, canRedo, onUndo, onRedo, onOpenExport, onOpenImport, schemaErrors }: ToolbarProps) {
  const isValid = schemaErrors.length === 0;

  return (
    <div className="formknot-builder-toolbar">
      <div className="formknot-builder-toolbar-group">
        <button type="button" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
          ↶ Undo
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
          ↷ Redo
        </button>
      </div>
      <div className="formknot-builder-toolbar-group">
        <button type="button" onClick={onOpenImport}>
          Import JSON
        </button>
        <button type="button" onClick={onOpenExport}>
          Export JSON
        </button>
      </div>
      <div className={`formknot-builder-validation-badge ${isValid ? "is-valid" : "is-invalid"}`} role="status">
        {isValid ? "Schema is valid" : `${schemaErrors.length} schema issue${schemaErrors.length === 1 ? "" : "s"}`}
      </div>
    </div>
  );
}
