import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { MessageSquare, Send, Bot, User, FileText, CheckCircle2 } from 'lucide-react';

export const ContractChatPage = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    contractService.getContracts({ limit: 50 }).then(res => {
      if (res.success) {
        setContracts(res.data);
        if (res.data.length > 0) setSelectedContractId(res.data[0]._id);
      }
    });
  }, []);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || inputPrompt;
    if (!promptText.trim()) return;

    const userMsg = { role: 'user', content: promptText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await contractService.sendChatMessage({
        sessionId,
        contractIds: selectedContractId ? [selectedContractId] : [],
        prompt: promptText
      });

      if (res.success) {
        setSessionId(res.data.sessionId);
        setMessages(res.data.messages);
      }
    } catch (err) {
      alert('Chat request failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const presetPrompts = [
    'When does this contract expire?',
    'What is the termination notice period?',
    'Who are the parties involved?',
    'What are our key obligations?',
    'Show me the highest-risk clause.'
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title="AI Contract Chat"
        subtitle="Conversational intelligence powered by Groq Llama-3 API. Query clauses, obligations, and notice terms."
        breadcrumbs={[{ label: 'AI Contract Chat' }]}
      />

      {/* CONTRACT SELECTOR & PRESETS */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Contract Context:</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              minWidth: 280
            }}
          >
            <option value="">All Company Contracts Portfolio</option>
            {contracts.map(c => (
              <option key={c._id} value={c._id}>{c.contractTitle} ({c.counterparty})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {presetPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: 12,
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        height: 480,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
              <Bot size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p>Ask any question about your selected contract context.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={18} />
                  </div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: m.role === 'user' ? 'var(--primary-color)' : 'var(--bg-secondary)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  {m.content}
                  {m.evidenceReferences && m.evidenceReferences.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', opacity: 0.9 }}>
                      <strong>Source Evidence:</strong> "{m.evidenceReferences[0].evidenceQuote}"
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ContractIQ AI is searching contract text...</div>}
        </div>

        {/* CHAT INPUT FORM */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: 8, padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <input
            type="text"
            placeholder="Type your question about termination, renewal dates, or liability..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
