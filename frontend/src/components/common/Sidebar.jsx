// src/components/common/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUpload, FiFileText, FiBriefcase, FiUser,
  FiLogOut, FiSettings, FiUsers, FiDatabase, FiBarChart2,
  FiMenu, FiX, FiZap
} from 'react-icons/fi';

const userLinks = [
  { to: '/dashboard',       icon: FiHome,      label: 'Dashboard'   },
  { to: '/upload',          icon: FiUpload,    label: 'Upload Resume' },
  { to: '/my-resumes',      icon: FiFileText,  label: 'My Resumes'  },
  { to: '/jobs',            icon: FiBriefcase, label: 'Job Roles'   },
  { to: '/profile',         icon: FiUser,      label: 'Profile'     },
];

const adminLinks = [
  { to: '/admin',           icon: FiBarChart2, label: 'Analytics'   },
  { to: '/admin/users',     icon: FiUsers,     label: 'Users'       },
  { to: '/admin/resumes',   icon: FiFileText,  label: 'Resumes'     },
  { to: '/admin/job-roles', icon: FiBriefcase, label: 'Job Roles'   },
  { to: '/admin/skills',    icon: FiDatabase,  label: 'Skills'      },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [open, setOpen]   = useState(false);
  const isAdmin           = user?.role === 'admin';
  const links             = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <FiZap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-slate-900">ResumeAI</h1>
            <p className="text-xs text-slate-400">Smart Analyzer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Admin Panel
          </p>
        )}
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/dashboard' || to === '/admin'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500
                     hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-white rounded-xl
                   shadow-card flex items-center justify-center text-slate-700"
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 z-40
        shadow-lg transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
