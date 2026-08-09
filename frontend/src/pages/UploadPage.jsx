import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { documentService } from '../services/documentService';

export const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusState, setStatusState] = useState('idle'); // idle, uploading, extracting, analyzing, saving, completed, failed
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setStatusState('uploading');
    setUploadProgress(10);

    try {
      // 1. Upload to Backend API
      const res = await documentService.uploadDocument(selectedFile, (progress) => {
        setUploadProgress(Math.min(progress, 70));
      });

      if (res.success && res.data?.documentId) {
        setStatusState('extracting');
        setUploadProgress(80);

        // Simulate step status transitions while server processes AI in background
        setTimeout(() => {
          setStatusState('analyzing');
          setUploadProgress(90);
        }, 1500);

        setTimeout(() => {
          setStatusState('saving');
          setUploadProgress(100);
        }, 3000);

        setTimeout(() => {
          setStatusState('completed');
          // Redirect to Contract Repository or Contract details after success
          setTimeout(() => {
            navigate('/contracts');
          }, 1200);
        }, 4200);
      } else {
        setStatusState('failed');
        setErrorMessage(res.message || 'Upload failed.');
      }
    } catch (err) {
      setStatusState('failed');
      setErrorMessage(err.response?.data?.message || 'Unable to upload document. Please check connection and try again.');
    }
  };

  const renderStatusStep = (stepKey, label) => {
    const states = ['idle', 'uploading', 'extracting', 'analyzing', 'saving', 'completed'];
    const currentIndex = states.indexOf(statusState);
    const stepIndex = states.indexOf(stepKey);

    let isDone = currentIndex > stepIndex || statusState === 'completed';
    let isCurrent = currentIndex === stepIndex && statusState !== 'completed';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: stepIndex <= currentIndex ? 1 : 0.4 }}>
        {isDone ? (
          <CheckCircle2 size={20} color="var(--success)" />
        ) : isCurrent ? (
          <Loader2 size={20} color="var(--primary)" className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border-dark)' }} />
        )}
        <span style={{ fontSize: '0.9rem', fontWeight: isCurrent ? 700 : 500 }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Upload Contract Document</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Upload PDF or DOCX file for automatic AI text extraction, obligation analysis, and risk scoring.
        </p>
      </div>

      <div className="card">
        {statusState === 'idle' ? (
          <Dropzone onFileSelect={handleFileSelect} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{file?.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {(file?.size / (1024 * 1024)).toFixed(2)} MB • {file?.type || 'Contract'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: 8, backgroundColor: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  backgroundColor: statusState === 'failed' ? 'var(--danger)' : 'var(--primary)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            {/* Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {renderStatusStep('uploading', 'Uploading file to secure object storage...')}
              {renderStatusStep('extracting', 'Extracting document text (PDF/DOCX)...')}
              {renderStatusStep('analyzing', 'Groq AI model analyzing contract clauses & risks...')}
              {renderStatusStep('saving', 'Saving structured contract & calculating renewal dates...')}
            </div>

            {statusState === 'completed' && (
              <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600, marginTop: 12 }}>
                Analysis completed! Redirecting to contract details...
              </div>
            )}

            {statusState === 'failed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: '0.88rem', marginTop: 12, padding: 12, backgroundColor: 'var(--danger-light)', borderRadius: 'var(--radius-sm)' }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
