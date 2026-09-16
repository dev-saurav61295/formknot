import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ALL_FIELD_TYPES, validateFormKnotSchema } from "@formknot/core";
import type { FormKnotField } from "@formknot/core";
import { createFormKnotFieldRegistry } from "@formknot/react";
import { builderReducer, createInitialState } from "./builderReducer";
import { FieldPalette } from "./components/FieldPalette";
import { Canvas } from "./components/Canvas";
import { SettingsPanel } from "./components/SettingsPanel";
import { PreviewPane } from "./components/PreviewPane";
import { Toolbar } from "./components/Toolbar";
import { ExportDialog } from "./components/ExportDialog";
import { ImportDialog } from "./components/ImportDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import type { FormKnotBuilderProps } from "./types";

export function FormKnotBuilder({ initialSchema, onChange, onExport, validators, components, className }: FormKnotBuilderProps) {
  const [state, dispatch] = useReducer(builderReducer, initialSchema, createInitialState);
  const registry = useMemo(() => components ?? createFormKnotFieldRegistry(), [components]);
  const [modal, setModal] = useState<"export" | "import" | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const customFieldTypes = useMemo(
    () => registry.types().filter((type) => !(ALL_FIELD_TYPES as readonly string[]).includes(type)),
    [registry]
  );
  const validation = useMemo(
    () => validateFormKnotSchema(state.schema, { additionalFieldTypes: customFieldTypes }),
    [state.schema, customFieldTypes]
  );

  const lastEmitted = useRef<string | null>(null);
  useEffect(() => {
    if (!validation.valid) return;
    const serialized = JSON.stringify(state.schema);
    if (serialized === lastEmitted.current) return;
    lastEmitted.current = serialized;
    onChange?.(state.schema);
  }, [state.schema, validation.valid, onChange]);

  const selectedField = state.schema.fields.find((f) => f.id === state.selectedFieldId);
  const pendingDeleteField = state.schema.fields.find((f) => f.id === pendingDeleteId);

  function updateSelectedField(updates: Partial<FormKnotField>) {
    if (!selectedField) return;
    dispatch({ type: "UPDATE_FIELD", fieldId: selectedField.id, updates });
  }

  function handleOpenExport() {
    onExport?.(state.schema);
    setModal("export");
  }

  return (
    <div className={`formknot-builder ${className ?? ""}`.trim()}>
      <Toolbar
        canUndo={state.past.length > 0}
        canRedo={state.future.length > 0}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        onOpenExport={handleOpenExport}
        onOpenImport={() => setModal("import")}
        schemaErrors={validation.errors}
      />

      <div className="formknot-builder-layout">
        <FieldPalette registry={registry} onAddField={(type) => dispatch({ type: "ADD_FIELD", fieldType: type })} />

        <Canvas
          fields={state.schema.fields}
          selectedFieldId={state.selectedFieldId}
          onSelect={(id) => dispatch({ type: "SELECT_FIELD", fieldId: id })}
          onDuplicate={(id) => dispatch({ type: "DUPLICATE_FIELD", fieldId: id })}
          onRequestDelete={(id) => setPendingDeleteId(id)}
          onReorder={(fromIndex, toIndex) => dispatch({ type: "REORDER_FIELDS", fromIndex, toIndex })}
          onAddField={(type) => dispatch({ type: "ADD_FIELD", fieldType: type })}
        />

        <SettingsPanel field={selectedField} allFields={state.schema.fields} onUpdate={updateSelectedField} />

        <PreviewPane schema={state.schema} validators={validators} components={registry} />
      </div>

      {modal === "export" && <ExportDialog schema={state.schema} onClose={() => setModal(null)} />}
      {modal === "import" && (
        <ImportDialog onImport={(schema) => dispatch({ type: "SET_SCHEMA", schema })} onClose={() => setModal(null)} />
      )}
      {pendingDeleteField && (
        <ConfirmDialog
          message={`Delete the field "${pendingDeleteField.label}"? You can use Undo afterwards to bring it back.`}
          onConfirm={() => {
            dispatch({ type: "REMOVE_FIELD", fieldId: pendingDeleteField.id });
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
