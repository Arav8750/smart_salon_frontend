import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, aiAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => { if (res.data.success) setStats(res.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiInsights(null);
    try {
      const res = await aiAPI.getInsights();
      if (res.data.success) {
        setAiInsights(res.data.data.insights);
        setAiStats({
          totalAppointments: res.data.data.totalAppointments,
          topService: res.data.data.topService,
          topBarber: res.data.data.topBarber,
          busiestDay: res.data.data.busiestDay,
        });
      } else {
        setAiError('Failed to generate insights. Please try again.');
      }
    } catch (err) {
      setAiError('Error connecting to AI service. Please check your HuggingFace token.');
    } finally {
      setAiLoading(false);
    }
  };

  // Parse bullet-point insights from the AI response string
  const parseInsights = (text) => {
    if (!text) return [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const bullets = lines.filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l));
    if (bullets.length > 0) return bullets.map(l => l.replace(/^[•\-*\d.]\s*/, '').trim());
    return lines.slice(0, 3);
  };

  const statCards = stats ? [
    { label: "Today's Appointments", value: stats.totalAppointmentsToday, icon: '📋', color: '#dbeafe', iconColor: '#1d4ed8' },
    { label: 'Completed Today', value: stats.completedToday, icon: '✅', color: '#dcfce7', iconColor: '#15803d' },
    { label: 'Currently Waiting', value: stats.waitingCount, icon: '⏳', color: '#fef9c3', iconColor: '#a16207' },
    { label: 'In Progress', value: stats.inProgressCount, icon: '✂️', color: '#ede9fe', iconColor: '#7c3aed' },
    { label: "Revenue Today (₹)", value: `₹${(stats.revenueToday || 0).toFixed(0)}`, icon: '💰', color: '#dcfce7', iconColor: '#15803d' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: '👥', color: '#fce7f3', iconColor: '#be185d' },
    { label: 'Active Barbers', value: stats.totalBarbers, icon: '💈', color: '#fff7ed', iconColor: '#c2410c' },
    { label: 'Services Available', value: stats.totalServices, icon: '🛎️', color: '#f3f4f6', iconColor: '#374151' },
  ] : [];

  const parsedInsights = parseInsights(aiInsights);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {user?.name} — here's today's overview</p>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="page-body">
          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <div className="stats-grid">
              {statCards.map((card, i) => (
                <div key={i} className="stat-card">
                  <div>
                    <div className="value">{card.value}</div>
                    <div className="label">{card.label}</div>
                  </div>
                  <div className="icon" style={{ background: card.color, fontSize: '1.3rem' }}>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Navigation */}
          <div className="card" style={{ marginTop: 8 }}>
            <h3 style={{ marginBottom: 12, fontSize: '1.1rem' }}>Quick Navigation</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/admin/appointments" className="btn btn-dark">📋 Appointments</a>
              <a href="/admin/barbers" className="btn btn-outline">✂️ Barbers</a>
              <a href="/admin/services" className="btn btn-outline">💈 Services</a>
              <a href="/admin/customers" className="btn btn-outline">👥 Customers</a>
              <a href="/admin/reports" className="btn btn-outline">📊 Revenue Reports</a>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🤖 AI Business Insights</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                  Powered by HuggingFace · microsoft/Phi-3-mini-4k-instruct
                </p>
              </div>
              <button
                className="btn btn-dark"
                onClick={handleGenerateInsights}
                disabled={aiLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: aiLoading ? '#6b7280' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none',
                  cursor: aiLoading ? 'not-allowed' : 'pointer',
                  padding: '10px 20px',
                  borderRadius: 8,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {aiLoading ? (
                  <>
                    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Analyzing...
                  </>
                ) : (
                  <>✨ Generate AI Insights</>
                )}
              </button>
            </div>

            {/* Error */}
            {aiError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', color: '#b91c1c', fontSize: '0.9rem' }}>
                ⚠️ {aiError}
              </div>
            )}

            {/* Stats used for insights */}
            {aiStats && !aiLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Total Appointments', value: aiStats.totalAppointments, icon: '📋' },
                  { label: 'Top Service', value: aiStats.topService, icon: '💈' },
                  { label: 'Top Barber', value: aiStats.topBarber, icon: '🏆' },
                  { label: 'Busiest Day', value: aiStats.busiestDay, icon: '📅' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#f8f7ff', border: '1px solid #e0d9ff', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937', marginTop: 2 }}>{item.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Insights bullets */}
            {parsedInsights.length > 0 && !aiLoading && (
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#374151', marginBottom: 10 }}>📊 Generated Insights</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {parsedInsights.map((insight, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)',
                      border: '1px solid #c4b5fd',
                      borderRadius: 10, padding: '12px 16px',
                    }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: '#fff', width: 26, height: 26, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                      }}>{i + 1}</span>
                      <p style={{ margin: 0, color: '#1f2937', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {insight.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Idle state */}
            {!aiInsights && !aiLoading && !aiError && (
              <div style={{
                textAlign: 'center', padding: '32px 16px',
                color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: 10,
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🤖</div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Click <strong>"Generate AI Insights"</strong> to analyze your salon data and get actionable recommendations.
                </p>
              </div>
            )}
          </div>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
