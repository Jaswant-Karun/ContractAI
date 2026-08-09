import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const Dropzone = ({ onFileSelect, acceptedTypes = ['.pdf', '.docx', '.doc'], maxMB = 15 }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndSelect = (file) => {
    setErrorMessage(null);
    if (!file) return;

    const ext = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!acceptedTypes.includes(ext)) {
      setErrorMessage(`Unsupported file format (${ext}). Only PDF and DOCX contracts are allowed.`);
      return;
    }

    if (file.size > maxMB * 1024 * 1024) {
      setErrorMessage(`File size exceeds maximum allowed limit (${maxMB}MB).`);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <div
        className={`dropzone-container ${isDragActive ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => e.target.files && validateAndSelect(e.target.files[0])}
        />
        <div style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <UploadCloud size={32} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
          Drag & Drop Contract File Here
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
          Supports PDF and DOCX documents up to {maxMB}MB
        </p>
        <Button variant="primary" icon={FileText}>
          Browse Files
        </Button>
      </div>

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: '0.85rem', marginTop: 12, padding: '10px 14px', backgroundColor: 'var(--danger-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-border)' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
