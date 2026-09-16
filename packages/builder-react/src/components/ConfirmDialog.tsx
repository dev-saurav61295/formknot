import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal titleId="formknot-confirm-title" title="Please confirm" onClose={onCancel}>
      <p>{message}</p>
      <div className="formknot-builder-modal-actions">
        <button type="button" className="formknot-builder-danger" onClick={onConfirm}>
          Delete
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
