import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { adminAPI } from '../../services/api';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.getCustomers()
      .then(r => setCustomers(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;
    await adminAPI.toggleCustomer(id);
    setMsg(`Customer ${action}d successfully.`);
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Manage Customers</h1>
            <p>View and manage all registered customers</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Total: <strong>{customers.length}</strong>
            </span>
          </div>
        </div>

        <div className="page-body">
          {msg && <div className="alert alert-success">{msg}</div>}

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div>
                <div className="value">{customers.length}</div>
                <div className="label">Total Registered</div>
              </div>
              <div className="icon" style={{ background: '#dbeafe', fontSize: '1.3rem' }}>👥</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div>
                <div className="value">{customers.filter(c => c.isActive).length}</div>
                <div className="label">Active</div>
              </div>
              <div className="icon" style={{ background: '#dcfce7', fontSize: '1.3rem' }}>✅</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div>
                <div className="value">{customers.reduce((sum, c) => sum + (c.totalAppointments || 0), 0)}</div>
                <div className="label">Total Bookings</div>
              </div>
              <div className="icon" style={{ background: '#fff7ed', fontSize: '1.3rem' }}>📋</div>
            </div>
          </div>

          <div className="card">
            {/* Search bar */}
            <div style={{ marginBottom: 16 }}>
              <input
                className="form-control"
                placeholder="🔍  Search by name, email or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: 360 }}
              />
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered On</th>
                    <th>Total Bookings</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>Loading customers...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                      {search ? 'No customers match your search.' : 'No customers registered yet.'}
                    </td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          background: '#f3f4f6', padding: '2px 10px',
                          borderRadius: 20, fontWeight: 600, fontSize: '0.85rem'
                        }}>
                          {c.totalAppointments || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${c.isActive ? 'available' : 'cancelled'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${c.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggle(c.id, c.isActive)}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
