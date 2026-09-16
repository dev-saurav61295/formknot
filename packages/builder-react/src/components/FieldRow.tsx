import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormKnotField } from "@formknot/core";

export interface FieldRowProps {
  field: FormKnotField;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function FieldRow({ field, index, total, isSelected, onSelect, onDuplicate, onDelete, onMoveUp, onMoveDown }: FieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`formknot-builder-field-row ${isSelected ? "is-selected" : ""}`.trim()}
    >
      <button
        type="button"
        className="formknot-builder-drag-handle"
        aria-label={`Drag to reorder ${field.label}`}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <button type="button" className="formknot-builder-field-summary" onClick={onSelect} aria-pressed={isSelected}>
        <span className="formknot-builder-field-label">{field.label || "(untitled field)"}</span>
        <span className="formknot-builder-field-type">{field.type}</span>
      </button>
      <div className="formknot-builder-field-actions">
        <button type="button" onClick={onMoveUp} disabled={index === 0} aria-label={`Move ${field.label} up`}>
          ↑
        </button>
        <button type="button" onClick={onMoveDown} disabled={index === total - 1} aria-label={`Move ${field.label} down`}>
          ↓
        </button>
        <button type="button" onClick={onDuplicate} aria-label={`Duplicate ${field.label}`}>
          Duplicate
        </button>
        <button type="button" className="formknot-builder-danger" onClick={onDelete} aria-label={`Delete ${field.label}`}>
          Delete
        </button>
      </div>
    </li>
  );
}
