// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/common/ProtectedRoute';

// Public pages
import HomePage         from './pages/HomePage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';

// User pages
import DashboardPage    from './pages/DashboardPage';
import UploadPage       from './pages/UploadPage';
import MyResumesPage    from './pages/MyResumesPage';
import ResumeResultPage from './pages/ResumeResultPage';
import JobsPage         from './pages/JobsPage';
import ProfilePage      from './pages/ProfilePage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage     from './pages/admin/AdminUsersPage';
import AdminResumesPage   from './pages/admin/AdminResumesPage';
import AdminJobRolesPage  from './pages/admin/AdminJobRolesPage';
import AdminSkillsPage    from './pages/admin/AdminSkillsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' },
            success: { iconTheme: { primary: '#00C9A7', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* User */}
          <Route path="/dashboard"         element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/upload"            element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/my-resumes"        element={<ProtectedRoute><MyResumesPage /></ProtectedRoute>} />
          <Route path="/resume/:id"        element={<ProtectedRoute><ResumeResultPage /></ProtectedRoute>} />
          <Route path="/jobs"              element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"             element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users"       element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/resumes"     element={<AdminRoute><AdminResumesPage /></AdminRoute>} />
          <Route path="/admin/job-roles"   element={<AdminRoute><AdminJobRolesPage /></AdminRoute>} />
          <Route path="/admin/skills"      element={<AdminRoute><AdminSkillsPage /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
              <h1 className="font-display text-6xl font-bold text-slate-200">404</h1>
              <p className="text-slate-500">Page not found</p>
              <a href="/" className="btn-primary text-sm">Go Home</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
