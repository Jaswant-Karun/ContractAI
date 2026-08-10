import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { GitCompare, ArrowRight, ShieldAlert, CheckCircle2, FileText } from 'lucide-react';

export const ContractComparisonPage = () => {
  const [contracts, setContracts] = useState([]);
  const [contractAId, setContractAId] = useState('');
  const [contractBId, setContractBId] = useState('');
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    contractService.getContracts({ limit: 50 }).then(res => {
      if (res.success && res.data.length >= 2) {
        setContracts(res.data);
        setContractAId(res.data[0]._id);
        setContractBId(res.data[1]._id);
      }
    });
  }, []);

  const handleCompare = async () => {
    if (!contractAId || !contractBId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.compareContracts(contractAId, contractBId);
      if (res.success) {
        setComparison(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Contract Semantic Comparison"
        subtitle="Groq-powered side-by-side comparison. Analyze clause additions, date shifts, and liability changes."
        breadcrumbs={[{ label: 'Contract Comparison' }]}
      />

      {/* SELECTORS */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Base Contract (Contract A)</label>
            <select
              value={contractAId}
              onChange={(e) => setContractAId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              {contracts.map(c => (
                <option key={c._id} value={c._id}>{c.contractTitle} ({c.counterparty})</option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'center' }}>
            <GitCompare size={24} style={{ color: 'var(--primary-color)' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Comparison Contract (Contract B)</label>
            <select
              value={contractBId}
              onChange={(e) => setContractBId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              {contracts.map(c => (
                <option key={c._id} value={c._id}>{c.contractTitle} ({c.counterparty})</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleCompare}
          disabled={isLoading || !contractAId || !contractBId}
          style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <GitCompare size={16} />
          <span>Execute Groq AI Comparison</span>
        </button>
      </div>

      {isLoading ? (
        <Skeleton height="350px" />
      ) : error ? (
        <ErrorState message={error} onRetry={handleCompare} />
      ) : comparison ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI SUMMARY CARD */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Semantic Diff Executive Summary</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{comparison.comparison.aiSummary}</p>
          </div>

          {/* MODIFIED CLAUSES */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Modified Clauses & Terms</h3>
            {(comparison.comparison.modifiedClauses || []).map((m, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{m.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 4, color: '#ef4444' }}>
                    <strong>Contract A:</strong> {m.originalText}
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 4, color: '#10b981' }}>
                    <strong>Contract B:</strong> {m.newText}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Impact: {m.diffSummary}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          Select two contracts above and click 'Execute Groq AI Comparison' to view diffs.
        </div>
      )}
    </div>
  );
};
