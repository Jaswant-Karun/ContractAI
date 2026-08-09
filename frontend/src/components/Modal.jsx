import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="header-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', isDanger = true }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{message}</p>
    </Modal>
  );
};
