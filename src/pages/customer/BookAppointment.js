import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { servicesAPI, barbersAPI, appointmentsAPI } from '../../services/api';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [form, setForm] = useState({ serviceId: '', barberId: '', appointmentDate: '', appointmentTime: '', notes: '' });
  const [selectedService, setSelectedService] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    servicesAPI.getAll().then(r => setServices(r.data.data || []));
    barbersAPI.getAvailable().then(r => setBarbers(r.data.data || []));
  }, []);

  const handleServiceChange = (id) => {
    setForm({ ...form, serviceId: id });
    setSelectedService(services.find(s => s.id === +id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        serviceId: +form.serviceId,
        barberId: form.barberId ? +form.barberId : null,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime + ':00',
        notes: form.notes,
      };
      const res = await appointmentsAPI.book(payload);
      if (res.data.success) {
        setBooked(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <div className="page-body" style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
              <h2 style={{ marginBottom: 8 }}>Appointment Booked!</h2>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>Your appointment has been confirmed.</p>
              <div className="queue-card" style={{ marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Token Number</p>
                <div className="token-number">#{booked.tokenNumber}</div>
                <p style={{ marginTop: 12 }}>{booked.serviceName} • {booked.barberName}</p>
                <p>📅 {booked.appointmentDate} at {booked.appointmentTime?.slice(0,5)}</p>
                <p>⏳ Est. wait: {booked.estimatedWaitMinutes || 0} minutes</p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setBooked(null)}>Book Another</button>
                <button className="btn btn-primary" onClick={() => navigate('/customer/appointments')}>My Appointments</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1>Book Appointment</h1><p>Choose your service and preferred barber</p></div>
        </div>
        <div className="page-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="card" style={{ maxWidth: 600 }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Service *</label>
                <select className="form-control" value={form.serviceId} onChange={e => handleServiceChange(e.target.value)} required>
                  <option value="">-- Choose a service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — ₹{s.price} ({s.durationMinutes} min)</option>
                  ))}
                </select>
                {selectedService && (
                  <div style={{ marginTop: 8, padding: '10px 14px', background: '#f8f6f0', borderRadius: 8, fontSize: '0.85rem', color: '#6b7280' }}>
                    {selectedService.description}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Select Barber (optional — auto-assigned if empty)</label>
                <select className="form-control" value={form.barberId} onChange={e => setForm({ ...form, barberId: e.target.value })}>
                  <option value="">-- Auto Assign --</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name} {b.specialization ? `• ${b.specialization}` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Appointment Date *</label>
                  <input className="form-control" type="date" min={new Date().toISOString().split('T')[0]}
                    value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time *</label>
                  <input className="form-control" type="time"
                    value={form.appointmentTime} onChange={e => setForm({ ...form, appointmentTime: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-control" rows={2} value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special requests..." />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/customer/dashboard')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Booking...' : '✓ Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
