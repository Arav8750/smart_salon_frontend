import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    appointmentsAPI.getMy().then(r => setAppointments(r.data.data || []));
  }, []);

  const latest = appointments.find(a => a.status === 'WAITING' || a.status === 'IN_PROGRESS');
  const totalBooked = appointments.length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const upcoming = appointments.filter(a => a.status === 'WAITING').length;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p>Your salon experience, digitalized</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/customer/book')}>
            + Book Appointment
          </button>
        </div>
        <div className="page-body">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card">
              <div><div className="value">{totalBooked}</div><div className="label">Total Bookings</div></div>
              <div className="icon" style={{ background: '#dbeafe', fontSize: '1.3rem' }}>📋</div>
            </div>
            <div className="stat-card">
              <div><div className="value">{completed}</div><div className="label">Completed</div></div>
              <div className="icon" style={{ background: '#dcfce7', fontSize: '1.3rem' }}>✅</div>
            </div>
            <div className="stat-card">
              <div><div className="value">{upcoming}</div><div className="label">Waiting</div></div>
              <div className="icon" style={{ background: '#fef9c3', fontSize: '1.3rem' }}>⏳</div>
            </div>
          </div>

          {latest && (
            <div className="queue-card" style={{ marginBottom: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Your Current Token
              </p>
              <div className="token-number">#{latest.tokenNumber}</div>
              <p style={{ marginTop: 12 }}>{latest.serviceName} • {latest.barberName}</p>
              <p>{latest.status === 'IN_PROGRESS' ? '✂️ Service in progress!' : `⏳ Est. wait: ${latest.estimatedWaitMinutes || 0} minutes`}</p>
            </div>
          )}

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem' }}>Recent Appointments</h3>
              <button className="btn btn-sm btn-outline" onClick={() => navigate('/customer/appointments')}>View All</button>
            </div>
            {appointments.slice(0, 5).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>✂️</p>
                <p>No appointments yet.</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/customer/book')}>Book Your First Appointment</button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Token</th><th>Service</th><th>Barber</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {appointments.slice(0, 5).map(a => (
                      <tr key={a.id}>
                        <td><strong style={{ color: '#c9a84c' }}>#{a.tokenNumber}</strong></td>
                        <td>{a.serviceName}</td>
                        <td>{a.barberName}</td>
                        <td>{a.appointmentDate}</td>
                        <td><span className={`badge badge-${a.status?.toLowerCase().replace('_','-') || 'waiting'}`}>{a.status?.replace('_',' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
