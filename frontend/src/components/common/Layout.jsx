// src/components/common/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-slate-50">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
        {children}
      </div>
    </main>
  </div>
);

export default Layout;
