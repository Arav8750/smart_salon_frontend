import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { appointmentsAPI } from '../../services/api';

const statusColors = { WAITING: 'waiting', IN_PROGRESS: 'in_progress', COMPLETED: 'completed', CANCELLED: 'cancelled' };

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    appointmentsAPI.getAll()
      .then(r => setAppointments(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await appointmentsAPI.updateStatus(id, status);
    load();
  };

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1>All Appointments</h1><p>View and manage all bookings</p></div>
          <button className="btn btn-outline" onClick={load}>↻ Refresh</button>
        </div>
        <div className="page-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['ALL', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
              <button key={s} className={`btn btn-sm ${filter === s ? 'btn-dark' : 'btn-outline'}`} onClick={() => setFilter(s)}>
                {s.replace('_', ' ')} {s !== 'ALL' && `(${appointments.filter(a => a.status === s).length})`}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Token</th><th>Customer</th><th>Barber</th><th>Service</th>
                    <th>Date & Time</th><th>Est. Wait</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>Loading...</td></tr>
                  ) : filtered.map(a => (
                    <tr key={a.id}>
                      <td><strong style={{ fontSize: '1.1rem', color: '#c9a84c' }}>#{a.tokenNumber}</strong></td>
                      <td>{a.customerName}</td>
                      <td>{a.barberName}</td>
                      <td>
                        <div>{a.serviceName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>₹{a.servicePrice} • {a.serviceDuration}min</div>
                      </td>
                      <td>
                        <div>{a.appointmentDate}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.appointmentTime}</div>
                      </td>
                      <td>{a.estimatedWaitMinutes ? `${a.estimatedWaitMinutes} min` : '—'}</td>
                      <td><span className={`badge badge-${statusColors[a.status] || 'waiting'}`}>{a.status?.replace('_', ' ')}</span></td>
                      <td>
                        {a.status === 'WAITING' && (
                          <button className="btn btn-sm btn-outline" onClick={() => updateStatus(a.id, 'IN_PROGRESS')}>Start</button>
                        )}
                        {a.status === 'IN_PROGRESS' && (
                          <button className="btn btn-sm btn-success" onClick={() => updateStatus(a.id, 'COMPLETED')}>Complete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No appointments found.</td></tr>
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
