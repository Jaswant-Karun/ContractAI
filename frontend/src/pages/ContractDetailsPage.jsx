import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Download,
  ArrowLeft,
  Calendar as CalendarIcon,
  ShieldCheck,
  Building,
  DollarSign,
  FileCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { contractService } from '../services/contractService';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const ContractDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await contractService.getContractById(id);
        if (res.success) {
          setContract(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load contract details.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton height="60px" />
        <Skeleton height="300px" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!contract) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Breadcrumb & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="header-icon-btn" onClick={() => navigate('/contracts')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{contract.contractTitle}</h2>
              <StatusBadge status={contract.renewalStatus} />
              <RiskBadge level={contract.riskLevel} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Type: {contract.contractType} | Managed by {contract.uploadedBy?.name || 'User'}
            </span>
          </div>
        </div>

        {contract.documentId?.fileUrl && (
          <a href={contract.documentId.fileUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" icon={Download}>Download Original File</Button>
          </a>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="tab-navigation">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'analysis', label: 'AI Executive Summary' },
          { id: 'dates', label: 'Important Dates' },
          { id: 'risks', label: 'Risks & Severity' },
          { id: 'obligations', label: 'Key Obligations' },
          { id: 'renewal', label: 'Renewal Terms' },
          { id: 'evidence', label: 'AI Quotes & Evidence' }
        ].map(t => (
          <button
            key={t.id}
            className={`tab-button ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: AI Analysis & Summary */}
      {activeTab === 'analysis' && (
        <div>
          <div className="ai-summary-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <ShieldCheck size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Groq AI Executive Contract Summary
              </h3>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {contract.summary || 'AI executive summary generated from document analysis.'}
            </p>

            <div className="ai-disclaimer">
              AI-generated analysis is provided for informational purposes and should be reviewed by a qualified professional before making legal or contractual decisions.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Building size={20} color="var(--primary)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Contract Parties</h4>
              </div>
              <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {contract.parties && contract.parties.length > 0 ? (
                  contract.parties.map((p, i) => <li key={i}>{p}</li>)
                ) : (
                  <li>Parties not specified in document</li>
                )}
              </ul>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <DollarSign size={20} color="var(--success)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Financial Terms</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span>Value: <strong>{contract.contractValue ? `${contract.currency || 'USD'} $${contract.contractValue.toLocaleString()}` : 'Not specified'}</strong></span>
                <span>Payment Terms: <strong>{contract.paymentTerms || 'Not specified'}</strong></span>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CalendarIcon size={20} color="var(--warning)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Renewal Window</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span>Notice Window: <strong>{contract.noticePeriodDays} days</strong></span>
                <span>Renewal Type: <strong>{contract.renewalType || 'Manual'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Contract Metadata Overview</h3>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Title:</span>
              <p style={{ fontWeight: 600 }}>{contract.contractTitle}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type:</span>
              <p style={{ fontWeight: 600 }}>{contract.contractType}</p>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date:</span>
              <p>{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'Not specified'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date:</span>
              <p><strong>{contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString() : 'Not specified'}</strong></p>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Termination Clause:</span>
            <p style={{ marginTop: 4, padding: 12, backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }}>
              {contract.terminationClause || 'No specific termination clause extracted.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Risks & Severity */}
      {activeTab === 'risks' && (
        <div>
          <h3 className="card-title" style={{ marginBottom: 16 }}>Detected Contract Risks</h3>
          {contract.risks && contract.risks.length > 0 ? (
            contract.risks.map((r, i) => (
              <div key={i} className={`risk-item-card risk-${r.severity}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} color={r.severity === 'Critical' ? 'var(--critical)' : 'var(--warning)'} />
                    <strong style={{ fontSize: '0.95rem' }}>{r.title}</strong>
                  </div>
                  <RiskBadge level={r.severity} />
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{r.description}</p>
                {r.evidence && (
                  <div className="evidence-quote-box">
                    <span>Source Evidence Quote: "{r.evidence}"</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No high severity risks detected in document.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT: Key Obligations */}
      {activeTab === 'obligations' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Contractual Obligations Grouped by Party</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {contract.keyObligations && contract.keyObligations.length > 0 ? (
              contract.keyObligations.map((ob, i) => (
                <div key={i} style={{ padding: 14, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {ob.party || 'General Obligation'}
                  </span>
                  <p style={{ fontSize: '0.9rem', marginTop: 4, color: 'var(--text-primary)' }}>{ob.description}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No explicit obligations extracted.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Important Dates */}
      {activeTab === 'dates' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Milestone & Renewal Dates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contract.importantDates && contract.importantDates.length > 0 ? (
              contract.importantDates.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{d.event}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.description}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {new Date(d.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No additional milestone dates found.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI Quotes & Evidence */}
      {activeTab === 'evidence' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Source Evidence & Verifiable Extracts</h3>
          {contract.aiEvidence && contract.aiEvidence.length > 0 ? (
            contract.aiEvidence.map((ev, i) => (
              <div key={i} style={{ marginBottom: 16, padding: 14, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Field: {ev.field}</strong>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '2px 0 6px 0' }}>Value: {ev.value}</p>
                <div className="evidence-quote-box">
                  "{ev.evidenceQuote}"
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No source quotes mapped.</p>
          )}
        </div>
      )}
    </div>
  );
};
