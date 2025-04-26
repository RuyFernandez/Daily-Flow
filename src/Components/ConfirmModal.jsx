import React from "react";
import "../Styles/ConfirmModal.css";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="modal-confirm" onClick={onConfirm}>Sí</button>
          <button className="modal-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
