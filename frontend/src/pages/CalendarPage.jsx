import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { contractService } from '../services/contractService';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = useNavigate();

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contractService.getCalendarEvents();
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load renewal calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Safe': return { bg: 'var(--success-light)', color: 'var(--success)', border: 'var(--success-border)' };
      case 'Upcoming': return { bg: 'var(--info-light)', color: 'var(--info)', border: 'var(--info-border)' };
      case 'Urgent': return { bg: 'var(--warning-light)', color: 'var(--warning)', border: 'var(--warning-border)' };
      case 'Critical': return { bg: 'var(--danger-light)', color: 'var(--danger)', border: 'var(--danger-border)' };
      case 'Expired': return { bg: '#334155', color: '#ffffff', border: '#475569' };
      default: return { bg: 'var(--primary-light)', color: 'var(--primary)', border: 'var(--primary-border)' };
    }
  };

  // Calendar month rendering logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return <Skeleton height="400px" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchCalendar} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Calendar Header & Controls */}
      <div className="calendar-header-bar">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Renewal Calendar</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Visual timeline of contract expiration dates and advance notice windows.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="header-icon-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 160, textAlign: 'center' }}>{monthName}</span>
          <button className="header-icon-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Legend Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', backgroundColor: 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Status Urgency Legend:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--success)' }}></span> Safe (&gt; 60 Days)</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--info)' }}></span> Upcoming (30–60 Days)</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span> Urgent (7–30 Days)</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span> Critical (&lt; 7 Days)</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#475569' }}></span> Expired</span>
      </div>

      {/* Calendar Grid View */}
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}

        {/* Empty cells for padding */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-cell" style={{ backgroundColor: 'var(--bg-primary)', opacity: 0.5 }} />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const dayNum = dayIndex + 1;
          const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

          const dayEvents = events.filter(e => {
            if (!e.date) return false;
            const d = new Date(e.date).toISOString().split('T')[0];
            return d === cellDateStr;
          });

          return (
            <div key={dayNum} className="calendar-cell">
              <span className="calendar-date-num">{dayNum}</span>
              {dayEvents.map(ev => {
                const styleObj = getUrgencyColor(ev.urgency);
                return (
                  <div
                    key={ev.id}
                    className="calendar-event-tag"
                    style={{
                      backgroundColor: styleObj.bg,
                      color: styleObj.color,
                      border: `1px solid ${styleObj.border}`
                    }}
                    onClick={() => navigate(`/contracts/${ev.contractId}`)}
                    title={`${ev.title} (${ev.type})`}
                  >
                    {ev.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
