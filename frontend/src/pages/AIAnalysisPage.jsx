import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { RiskBadge } from '../components/RiskBadge';
import {
  Brain,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  ShieldCheck,
  Zap,
  List,
  Search
} from 'lucide-react';

export const AIAnalysisPage = () => {
  const { contractId = 'latest' } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getAnalysis(contractId);
      if (res.success) {
        setAnalysis(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch AI analysis data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [contractId]);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchAnalysis} />;

  const tabs = [
    { key: 'summary', label: '1. Executive Summary' },
    { key: 'keyTerms', label: '2. Key Terms' },
    { key: 'obligations', label: '3. Key Obligations' },
    { key: 'paymentTerms', label: '4. Payment Terms' },
    { key: 'termination', label: '5. Termination Terms' },
    { key: 'renewal', label: '6. Renewal Terms' },
    { key: 'risks', label: '7. Legal Risks' },
    { key: 'recommendations', label: '8. AI Recommendations' }
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title={`AI Analysis: ${analysis.contractTitle}`}
        subtitle={`Groq Llama-3 70B structured extraction for ${analysis.counterparty}`}
        breadcrumbs={[
          { label: 'Contract Repository', link: '/contracts' },
          { label: 'AI Analysis' }
        ]}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate(`/contracts/${analysis.contractId}`)}>
            Open Contract Details
          </button>
        }
      />

      {/* TAB NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        paddingBottom: 4
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === t.key ? 'var(--primary-color)' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === t.key ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT CARD */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        {activeTab === 'summary' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Executive Contract Summary</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{analysis.summary}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contract Type</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{analysis.contractType}</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{analysis.department}</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Counterparty</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{analysis.counterparty}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keyTerms' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Extracted Key Commercial Terms</h3>
            <table className="table" style={{ width: '100%', fontSize: '0.9rem' }}>
              <tbody>
                <tr><td><strong>Parties:</strong></td><td>{(analysis.keyTerms.parties || []).join(', ')}</td></tr>
                <tr><td><strong>Effective Date:</strong></td><td>{analysis.keyTerms.effectiveDate ? new Date(analysis.keyTerms.effectiveDate).toLocaleDateString() : 'Not Specified'}</td></tr>
                <tr><td><strong>Expiry Date:</strong></td><td>{analysis.keyTerms.expiryDate ? new Date(analysis.keyTerms.expiryDate).toLocaleDateString() : 'Not Specified'}</td></tr>
                <tr><td><strong>Notice Window:</strong></td><td>{analysis.keyTerms.noticePeriodDays} Days</td></tr>
                <tr><td><strong>Contract Value:</strong></td><td>${(analysis.keyTerms.contractValue || 0).toLocaleString()} {analysis.keyTerms.currency}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'obligations' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Contractual Obligations</h3>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {analysis.obligations.map((ob, idx) => (
                <li key={idx}><strong>{ob.party}:</strong> {ob.description}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'paymentTerms' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Payment Structure</h3>
            <p><strong>Payment Terms:</strong> {analysis.paymentTerms.terms}</p>
            <p><strong>Annualized Value:</strong> ${ (analysis.paymentTerms.annualValue || 0).toLocaleString() }</p>
            <p><strong>Price Escalation Trigger:</strong> {analysis.paymentTerms.priceEscalation}</p>
          </div>
        )}

        {activeTab === 'termination' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Termination & Cancellation Clauses</h3>
            <blockquote style={{ borderLeft: '4px solid var(--primary-color)', paddingLeft: 12, color: 'var(--text-secondary)', italic: 'true' }}>
              {analysis.termination.clause}
            </blockquote>
          </div>
        )}

        {activeTab === 'renewal' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Renewal Schedule & Deadline</h3>
            <p><strong>Renewal Type:</strong> {analysis.renewal.renewalType}</p>
            <p><strong>Calculated Notice Deadline:</strong> {analysis.renewal.noticeDeadline ? new Date(analysis.renewal.noticeDeadline).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Days Remaining:</strong> {analysis.renewal.daysRemaining} days</p>
          </div>
        )}

        {activeTab === 'risks' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>High Severity Risk Clauses</h3>
            {analysis.risks.map((r, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</span>
                  <RiskBadge level={r.severity} />
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '6px 0' }}>{r.description}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Evidence Quote: "{r.evidence}"</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>AI Actionable Recommendations</h3>
            <ol style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
