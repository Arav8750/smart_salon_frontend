import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { servicesAPI } from '../../services/api';

const emptyForm = { name: '', description: '', price: '', durationMinutes: '' };

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => servicesAPI.getAllAdmin().then(r => setServices(r.data.data || []));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, description: s.description || '', price: s.price, durationMinutes: s.durationMinutes });
    setEditId(s.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await servicesAPI.update(editId, { ...form, price: +form.price, durationMinutes: +form.durationMinutes });
      else await servicesAPI.create({ ...form, price: +form.price, durationMinutes: +form.durationMinutes });
      setShowModal(false); setMsg(editId ? 'Service updated!' : 'Service added!');
      load(); setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Error saving service'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await servicesAPI.delete(id); load();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1>Manage Services</h1><p>Add and edit salon services</p></div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Service</button>
        </div>
        <div className="page-body">
          {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Service Name</th><th>Description</th>
                    <th>Price (₹)</th><th>Duration</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td><strong>{s.name}</strong></td>
                      <td style={{ color: '#6b7280', maxWidth: 200 }}>{s.description || '—'}</td>
                      <td>₹{s.price}</td>
                      <td>{s.durationMinutes} min</td>
                      <td><span className={`badge badge-${s.isActive ? 'available' : 'cancelled'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No services yet. Add one!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Haircut, Beard Trim" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-control" type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="e.g. 200" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <input className="form-control" type="number" min="5" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: e.target.value})} required placeholder="e.g. 30" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
