import { useEffect, type ReactNode } from "react";

export interface ModalProps {
  titleId: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ titleId, title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="formknot-builder-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="formknot-builder-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="formknot-builder-modal-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="formknot-builder-modal-close" onClick={onClose} autoFocus aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="formknot-builder-modal-body">{children}</div>
      </div>
    </div>
  );
}
