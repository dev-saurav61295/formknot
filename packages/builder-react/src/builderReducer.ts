import { createEmptySchema, createField, generateId, safeClone } from "@formknot/core";
import type { FormKnotField, FormKnotFieldType, FormKnotSchema } from "@formknot/core";

export interface BuilderState {
  schema: FormKnotSchema;
  selectedFieldId: string | null;
  past: FormKnotSchema[];
  future: FormKnotSchema[];
}

export type BuilderAction =
  | { type: "ADD_FIELD"; fieldType: string; defaultConfig?: Partial<FormKnotField>; atIndex?: number }
  | { type: "REMOVE_FIELD"; fieldId: string }
  | { type: "DUPLICATE_FIELD"; fieldId: string }
  | { type: "REORDER_FIELDS"; fromIndex: number; toIndex: number }
  | { type: "UPDATE_FIELD"; fieldId: string; updates: Partial<FormKnotField> }
  | { type: "SELECT_FIELD"; fieldId: string | null }
  | { type: "SET_SCHEMA"; schema: FormKnotSchema }
  | { type: "UPDATE_META"; updates: Partial<Pick<FormKnotSchema, "title" | "description" | "settings">> }
  | { type: "UNDO" }
  | { type: "REDO" };

const MAX_HISTORY = 50;

function pushHistory(state: BuilderState): FormKnotSchema[] {
  return [...state.past, safeClone(state.schema)].slice(-MAX_HISTORY);
}

export function createInitialState(initialSchema?: FormKnotSchema): BuilderState {
  return {
    schema: initialSchema ? (safeClone(initialSchema) as FormKnotSchema) : createEmptySchema(),
    selectedFieldId: null,
    past: [],
    future: [],
  };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "ADD_FIELD": {
      const field = createField(action.fieldType as FormKnotFieldType, action.defaultConfig);
      const fields = [...state.schema.fields];
      const index = action.atIndex ?? fields.length;
      fields.splice(index, 0, field);
      return {
        ...state,
        schema: { ...state.schema, fields },
        selectedFieldId: field.id,
        past: pushHistory(state),
        future: [],
      };
    }
    case "REMOVE_FIELD": {
      const fields = state.schema.fields.filter((f) => f.id !== action.fieldId);
      return {
        ...state,
        schema: { ...state.schema, fields },
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
        past: pushHistory(state),
        future: [],
      };
    }
    case "DUPLICATE_FIELD": {
      const index = state.schema.fields.findIndex((f) => f.id === action.fieldId);
      if (index === -1) return state;
      const original = state.schema.fields[index] as FormKnotField;
      const clone: FormKnotField = {
        ...(safeClone(original) as FormKnotField),
        id: generateId("field"),
        name: `${original.name}_copy_${Math.random().toString(36).slice(2, 6)}`,
        label: `${original.label} (copy)`,
      };
      const fields = [...state.schema.fields];
      fields.splice(index + 1, 0, clone);
      return { ...state, schema: { ...state.schema, fields }, selectedFieldId: clone.id, past: pushHistory(state), future: [] };
    }
    case "REORDER_FIELDS": {
      const fields = [...state.schema.fields];
      const [moved] = fields.splice(action.fromIndex, 1);
      if (!moved) return state;
      fields.splice(action.toIndex, 0, moved);
      return { ...state, schema: { ...state.schema, fields }, past: pushHistory(state), future: [] };
    }
    case "UPDATE_FIELD": {
      const fields = state.schema.fields.map((f) => (f.id === action.fieldId ? ({ ...f, ...action.updates } as FormKnotField) : f));
      return { ...state, schema: { ...state.schema, fields }, past: pushHistory(state), future: [] };
    }
    case "SELECT_FIELD":
      return { ...state, selectedFieldId: action.fieldId };
    case "SET_SCHEMA":
      return { ...state, schema: safeClone(action.schema) as FormKnotSchema, selectedFieldId: null, past: pushHistory(state), future: [] };
    case "UPDATE_META":
      return { ...state, schema: { ...state.schema, ...action.updates }, past: pushHistory(state), future: [] };
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1] as FormKnotSchema;
      return { ...state, schema: previous, past: state.past.slice(0, -1), future: [safeClone(state.schema) as FormKnotSchema, ...state.future] };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future as [FormKnotSchema, ...FormKnotSchema[]];
      return { ...state, schema: next, past: [...state.past, safeClone(state.schema) as FormKnotSchema], future: rest };
    }
    default:
      return state;
  }
}
