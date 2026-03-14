import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { barbersAPI } from '../../services/api';

const emptyForm = { name: '', email: '', password: '', phone: '', specialization: '', experienceYears: '' };

export default function ManageBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => barbersAPI.getAll().then(r => setBarbers(r.data.data || []));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (b) => {
    setForm({ name: b.name, email: b.email, password: '', phone: b.phone, specialization: b.specialization || '', experienceYears: b.experienceYears || '' });
    setEditId(b.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, experienceYears: +form.experienceYears };
      if (editId) await barbersAPI.update(editId, data);
      else await barbersAPI.create(data);
      setShowModal(false);
      setMsg(editId ? 'Barber updated!' : 'Barber added!');
      load(); setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving barber');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this barber?')) return;
    await barbersAPI.delete(id); load();
  };

  const handleStatusChange = async (id, status) => {
    await barbersAPI.updateStatus(id, status); load();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1>Manage Barbers</h1><p>Add and manage your barber team</p></div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Barber</button>
        </div>
        <div className="page-body">
          {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Email</th><th>Phone</th>
                    <th>Specialization</th><th>Exp.</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {barbers.map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td><strong>{b.name}</strong></td>
                      <td>{b.email}</td>
                      <td>{b.phone}</td>
                      <td>{b.specialization || '—'}</td>
                      <td>{b.experienceYears ? `${b.experienceYears} yrs` : '—'}</td>
                      <td>
                        <select
                          className="form-control" style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                          value={b.status}
                          onChange={e => handleStatusChange(b.id, e.target.value)}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="BUSY">Busy</option>
                          <option value="OFF_DUTY">Off Duty</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(b)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {barbers.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No barbers yet.</td></tr>}
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
              <h3>{editId ? 'Edit Barber' : 'Add New Barber'}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              {!editId && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-control" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g. Hair, Beard" />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-control" type="number" min="0" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Barber'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
