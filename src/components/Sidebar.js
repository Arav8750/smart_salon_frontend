import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/admin/appointments', label: 'Appointments', icon: '📋' },
  { path: '/admin/barbers', label: 'Barbers', icon: '✂️' },
  { path: '/admin/services', label: 'Services', icon: '💈' },
  { path: '/admin/customers', label: 'Customers', icon: '👥' },
  { path: '/admin/reports', label: 'Revenue Reports', icon: '📊' },
];

const customerLinks = [
  { path: '/customer/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/customer/book', label: 'Book Appointment', icon: '📅' },
  { path: '/customer/appointments', label: 'My Appointments', icon: '📋' },
];

const barberLinks = [
  { path: '/barber/dashboard', label: 'My Queue', icon: '▦' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = user?.role === 'ADMIN' ? adminLinks
    : user?.role === 'CUSTOMER' ? customerLinks
    : barberLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>✦ SmartSalon</h2>
        <p>{user?.role}</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <button
            key={link.path}
            className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <span>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          {user?.name}
        </div>
        <button className="nav-item" onClick={logout} style={{ padding: '8px 0', color: '#ef4444' }}>
          ⎋ Logout
        </button>
      </div>
    </aside>
  );
}
