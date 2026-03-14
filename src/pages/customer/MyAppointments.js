import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { appointmentsAPI } from '../../services/api';

const statusClass = { WAITING: 'waiting', IN_PROGRESS: 'in_progress', COMPLETED: 'completed', CANCELLED: 'cancelled' };

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    appointmentsAPI.getMy().then(r => setAppointments(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.cancel(id);
      setMsg('Appointment cancelled.');
      load(); setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Could not cancel appointment.'); }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1>My Appointments</h1><p>Track all your bookings</p></div>
          <button className="btn btn-primary" onClick={() => navigate('/customer/book')}>+ New Booking</button>
        </div>
        <div className="page-body">
          {msg && <div className="alert alert-success">{msg}</div>}
          <div className="card">
            {loading ? <p style={{ textAlign: 'center', padding: 32 }}>Loading...</p> : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Token</th><th>Service</th><th>Barber</th><th>Date</th>
                      <th>Time</th><th>Est. Wait</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id}>
                        <td><strong style={{ fontSize: '1.1rem', color: '#c9a84c' }}>#{a.tokenNumber}</strong></td>
                        <td>
                          <div>{a.serviceName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>₹{a.servicePrice}</div>
                        </td>
                        <td>{a.barberName}</td>
                        <td>{a.appointmentDate}</td>
                        <td>{a.appointmentTime?.slice(0,5)}</td>
                        <td>{a.estimatedWaitMinutes ? `${a.estimatedWaitMinutes} min` : '—'}</td>
                        <td><span className={`badge badge-${statusClass[a.status]}`}>{a.status?.replace('_',' ')}</span></td>
                        <td>
                          {(a.status === 'WAITING') && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleCancel(a.id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                        No appointments yet. <button className="btn btn-sm btn-primary" style={{ marginLeft: 8 }} onClick={() => navigate('/customer/book')}>Book Now</button>
                      </td></tr>
                    )}
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
