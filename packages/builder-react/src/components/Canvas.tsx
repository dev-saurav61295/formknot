import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { FormKnotField } from "@formknot/core";
import { FieldRow } from "./FieldRow";
import { FIELD_DND_MIME } from "../types";

export interface CanvasProps {
  fields: FormKnotField[];
  selectedFieldId: string | null;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRequestDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddField: (type: string) => void;
}

export function Canvas({ fields, selectedFieldId, onSelect, onDuplicate, onRequestDelete, onReorder, onAddField }: CanvasProps) {
  const [isDragOverFromPalette, setIsDragOverFromPalette] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = fields.findIndex((f) => f.id === active.id);
    const toIndex = fields.findIndex((f) => f.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    onReorder(fromIndex, toIndex);
  }

  return (
    <section
      className={`formknot-builder-canvas ${isDragOverFromPalette ? "is-drag-target" : ""}`.trim()}
      aria-label="Form canvas"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(FIELD_DND_MIME)) {
          event.preventDefault();
          setIsDragOverFromPalette(true);
        }
      }}
      onDragLeave={() => setIsDragOverFromPalette(false)}
      onDrop={(event) => {
        const type = event.dataTransfer.getData(FIELD_DND_MIME);
        if (type) {
          event.preventDefault();
          onAddField(type);
        }
        setIsDragOverFromPalette(false);
      }}
    >
      <h2 className="formknot-builder-panel-title">Canvas</h2>
      {fields.length === 0 ? (
        <p className="formknot-builder-empty-state">Add a field from the palette to get started.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} autoScroll={false}>
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <ul className="formknot-builder-field-list">
              {fields.map((field, index) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  index={index}
                  total={fields.length}
                  isSelected={field.id === selectedFieldId}
                  onSelect={() => onSelect(field.id)}
                  onDuplicate={() => onDuplicate(field.id)}
                  onDelete={() => onRequestDelete(field.id)}
                  onMoveUp={() => index > 0 && onReorder(index, index - 1)}
                  onMoveDown={() => index < fields.length - 1 && onReorder(index, index + 1)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
