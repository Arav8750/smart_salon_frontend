import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { adminAPI } from '../../services/api';

export default function RevenueReports() {
  const [report, setReport] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = (d) => {
    setLoading(true);
    adminAPI.getRevenueReport(d)
      .then(r => { if (r.data.success) setReport(r.data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(days); }, [days]);

  const maxRevenue = report?.dailyBreakdown?.length
    ? Math.max(...report.dailyBreakdown.map(d => d.revenue), 1)
    : 1;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Revenue Reports</h1>
            <p>Track your salon's financial performance</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[7, 14, 30].map(d => (
              <button
                key={d}
                className={`btn btn-sm ${days === d ? 'btn-dark' : 'btn-outline'}`}
                onClick={() => setDays(d)}
              >
                Last {d} days
              </button>
            ))}
          </div>
        </div>

        <div className="page-body">
          {loading ? (
            <p>Loading report...</p>
          ) : !report ? (
            <p style={{ color: '#9ca3af' }}>No data available.</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 24 }}>
                <div className="stat-card">
                  <div>
                    <div className="value">₹{(report.totalRevenue || 0).toFixed(0)}</div>
                    <div className="label">Total Revenue (last {days} days)</div>
                  </div>
                  <div className="icon" style={{ background: '#dcfce7', fontSize: '1.4rem' }}>💰</div>
                </div>
                <div className="stat-card">
                  <div>
                    <div className="value">{report.totalCompleted}</div>
                    <div className="label">Completed Appointments</div>
                  </div>
                  <div className="icon" style={{ background: '#dbeafe', fontSize: '1.4rem' }}>✅</div>
                </div>
              </div>

              {/* Daily Revenue Bar Chart */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>📊 Daily Revenue Breakdown</h3>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, minWidth: 400, height: 180, paddingBottom: 4 }}>
                    {report.dailyBreakdown?.map((d, i) => {
                      const barH = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 140, d.revenue > 0 ? 8 : 2) : 2;
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          {d.revenue > 0 && (
                            <div style={{ fontSize: '0.65rem', color: '#15803d', fontWeight: 600 }}>
                              ₹{d.revenue.toFixed(0)}
                            </div>
                          )}
                          <div
                            title={`${d.date}: ₹${d.revenue} (${d.completedAppointments} appointments)`}
                            style={{
                              width: '100%',
                              height: barH,
                              background: d.revenue > 0
                                ? 'linear-gradient(to top, #c9a84c, #e8c97d)'
                                : '#f3f4f6',
                              borderRadius: '4px 4px 0 0',
                              transition: 'all 0.3s',
                              cursor: 'pointer',
                            }}
                          />
                          <div style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', marginTop: 2 }}>
                            {d.date}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {report.dailyBreakdown?.every(d => d.revenue === 0) && (
                  <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: 12, fontSize: '0.875rem' }}>
                    No completed appointments in this period yet.
                  </p>
                )}
              </div>

              {/* Service-wise Breakdown */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>💈 Revenue by Service</h3>
                {report.serviceBreakdown?.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No data yet.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Service</th>
                          <th>Appointments</th>
                          <th>Revenue</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.serviceBreakdown?.map((s, i) => {
                          const share = report.totalRevenue > 0
                            ? ((s.revenue / report.totalRevenue) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={i}>
                              <td>
                                <span style={{
                                  fontWeight: 700,
                                  color: i === 0 ? '#c9a84c' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#6b7280'
                                }}>
                                  #{i + 1}
                                </span>
                              </td>
                              <td><strong>{s.serviceName}</strong></td>
                              <td>{s.count}</td>
                              <td><strong style={{ color: '#15803d' }}>₹{s.revenue.toFixed(0)}</strong></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{
                                    height: 6, width: 80, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      height: '100%', width: `${share}%`,
                                      background: 'linear-gradient(to right, #c9a84c, #e8c97d)',
                                      borderRadius: 3
                                    }} />
                                  </div>
                                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{share}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
