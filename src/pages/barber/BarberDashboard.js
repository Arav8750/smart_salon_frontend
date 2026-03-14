import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { barbersAPI, appointmentsAPI } from '../../services/api';

const statusClass = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export default function BarberDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [myProfile, setMyProfile] = useState(null);     // { id, name, status, ... }
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // ── fetch everything ──────────────────────────────────
  const load = useCallback(() => {
    setLoading(true);

    // 1. Fetch this barber's own profile via /me
    barbersAPI.getMe()
      .then(r => {
        if (r.data.success) setMyProfile(r.data.data);
      })
      .catch(() => setProfileError('Could not load barber profile.'));

    // 2. Fetch this barber's appointments
    barbersAPI.getMyAppointments()
      .then(r => setAppointments(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── update appointment status ─────────────────────────
  const handleStatusUpdate = async (apptId, status) => {
    try {
      await appointmentsAPI.updateStatus(apptId, status);
      load();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  // ── update barber availability ────────────────────────
  const handleAvailabilityChange = async (status) => {
    if (!myProfile) return;
    try {
      await barbersAPI.updateStatus(myProfile.id, status);
      setMyProfile(prev => ({ ...prev, status }));
    } catch (e) {
      alert('Failed to update availability.');
    }
  };

  // ── derived data ──────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const todayAppts  = appointments.filter(a => a.appointmentDate === today);
  const waiting     = todayAppts.filter(a => a.status === 'WAITING');
  const inProgress  = todayAppts.filter(a => a.status === 'IN_PROGRESS');
  const completed   = todayAppts.filter(a => a.status === 'COMPLETED');
  const allAppts    = appointments; // full history

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">

        {/* ── Header ────────────────────────────────────── */}
        <div className="page-header">
          <div>
            <h1>Barber Dashboard</h1>
            <p>Welcome, {user?.name} — your queue for today</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>My Status:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={myProfile?.status || 'AVAILABLE'}
              disabled={!myProfile}
              onChange={e => handleAvailabilityChange(e.target.value)}
            >
              <option value="AVAILABLE">🟢 Available</option>
              <option value="BUSY">🟡 Busy</option>
              <option value="OFF_DUTY">⚫ Off Duty</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
          </div>
        </div>

        <div className="page-body">

          {/* Profile error */}
          {profileError && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>{profileError}</div>
          )}

          {/* ── Stats ───────────────────────────────────── */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
            <div className="stat-card">
              <div><div className="value">{waiting.length}</div><div className="label">Waiting Today</div></div>
              <div className="icon" style={{ background: '#fef9c3', fontSize: '1.3rem' }}>⏳</div>
            </div>
            <div className="stat-card">
              <div><div className="value">{inProgress.length}</div><div className="label">In Progress</div></div>
              <div className="icon" style={{ background: '#dbeafe', fontSize: '1.3rem' }}>✂️</div>
            </div>
            <div className="stat-card">
              <div><div className="value">{completed.length}</div><div className="label">Done Today</div></div>
              <div className="icon" style={{ background: '#dcfce7', fontSize: '1.3rem' }}>✅</div>
            </div>
            <div className="stat-card">
              <div><div className="value">{allAppts.filter(a => a.status === 'COMPLETED').length}</div><div className="label">Total Completed</div></div>
              <div className="icon" style={{ background: '#ede9fe', fontSize: '1.3rem' }}>🏆</div>
            </div>
          </div>

          {/* ── Currently In Progress ─────────────────── */}
          {inProgress.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12, fontSize: '1rem', color: '#1d4ed8' }}>
                ✂️ Currently Serving
              </h3>
              {inProgress.map(a => (
                <div key={a.id} className="card"
                  style={{ border: '2px solid #3b82f6', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <strong style={{ fontSize: '1.5rem', color: '#c9a84c' }}>#{a.tokenNumber}</strong>
                      <span style={{ marginLeft: 12, fontWeight: 600, fontSize: '1.1rem' }}>{a.customerName}</span>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 4 }}>
                        {a.serviceName} &nbsp;•&nbsp; {a.serviceDuration} min &nbsp;•&nbsp; ₹{a.servicePrice}
                      </div>
                    </div>
                    <button className="btn btn-success"
                      onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}>
                      ✓ Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Today's Queue ─────────────────────────── */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem' }}>📋 Today's Queue</h3>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                {today}
              </span>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Price</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppts.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                          No appointments scheduled for today.
                        </td>
                      </tr>
                    ) : (
                      todayAppts
                        .sort((a, b) => a.tokenNumber - b.tokenNumber)
                        .map(a => (
                          <tr key={a.id}>
                            <td>
                              <strong style={{ fontSize: '1.1rem', color: '#c9a84c' }}>
                                #{a.tokenNumber}
                              </strong>
                            </td>
                            <td>{a.customerName}</td>
                            <td>{a.serviceName}</td>
                            <td>₹{a.servicePrice}</td>
                            <td>{a.appointmentTime?.slice(0, 5)}</td>
                            <td>
                              <span className={`badge badge-${statusClass[a.status]}`}>
                                {a.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              {a.status === 'WAITING' && (
                                <button className="btn btn-sm btn-outline"
                                  onClick={() => handleStatusUpdate(a.id, 'IN_PROGRESS')}>
                                  ▶ Start
                                </button>
                              )}
                              {a.status === 'IN_PROGRESS' && (
                                <button className="btn btn-sm btn-success"
                                  onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}>
                                  ✓ Done
                                </button>
                              )}
                              {(a.status === 'COMPLETED' || a.status === 'CANCELLED') && (
                                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Full Appointment History ───────────────── */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>📂 All My Appointments</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allAppts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                        No appointment history.
                      </td>
                    </tr>
                  ) : (
                    allAppts
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map(a => (
                        <tr key={a.id}>
                          <td><strong style={{ color: '#c9a84c' }}>#{a.tokenNumber}</strong></td>
                          <td>{a.customerName}</td>
                          <td>{a.serviceName}</td>
                          <td>{a.appointmentDate}</td>
                          <td>
                            <span className={`badge badge-${statusClass[a.status]}`}>
                              {a.status?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
