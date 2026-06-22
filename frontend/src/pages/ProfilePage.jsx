// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe, FiSave, FiLock } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    profile: {
      phone:    user?.profile?.phone    || '',
      location: user?.profile?.location || '',
      linkedin: user?.profile?.linkedin || '',
      github:   user?.profile?.github   || '',
      website:  user?.profile?.website  || '',
      summary:  user?.profile?.summary  || '',
    }
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [saving, setSaving]   = useState(false);
  const [chpw, setChpw]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      await refreshUser();
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.new_password.length < 6) return toast.error('Min 6 characters');
    setChpw(true);
    try {
      await authAPI.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      toast.success('Password changed!');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChpw(false); }
  };

  const Field = ({ icon: Icon, label, field, type = 'text', textarea = false }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
        {textarea ? (
          <textarea value={form.profile[field] || ''} rows={3} placeholder={label}
            onChange={e => setForm(p => ({ ...p, profile: { ...p.profile, [field]: e.target.value } }))}
            className="input-field pl-10 resize-none" />
        ) : (
          <input type={type} value={field === 'name' ? form.name : (form.profile[field] || '')}
            placeholder={label}
            onChange={e => field === 'name'
              ? setForm(p => ({ ...p, name: e.target.value }))
              : setForm(p => ({ ...p, profile: { ...p.profile, [field]: e.target.value } }))}
            className="input-field pl-10" />
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account information</p>
        </div>

        {/* Avatar */}
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white font-display font-bold text-2xl flex items-center justify-center uppercase">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 text-lg">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="badge bg-primary/10 text-primary text-xs mt-1 capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card mb-6">
          <h2 className="font-display font-bold text-slate-900 mb-4">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field icon={FiUser}    label="Full Name"      field="name"     />
            <Field icon={FiMail}    label="Email"          field="email"    type="email" />
            <Field icon={FiPhone}   label="Phone Number"   field="phone"    />
            <Field icon={FiMapPin}  label="Location"       field="location" />
            <Field icon={FiLinkedin} label="LinkedIn URL"  field="linkedin" />
            <Field icon={FiGithub}  label="GitHub URL"     field="github"   />
            <Field icon={FiGlobe}   label="Website/Portfolio" field="website" />
          </div>
          <div className="mt-4">
            <Field icon={FiUser} label="Professional Summary" field="summary" textarea />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary mt-4 flex items-center gap-2">
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="font-display font-bold text-slate-900 mb-4">Change Password</h2>
          <div className="space-y-4">
            {['old_password', 'new_password', 'confirm'].map(k => (
              <div key={k}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 capitalize">
                  {k.replace('_', ' ').replace('old', 'Current').replace('new', 'New').replace('confirm', 'Confirm New')}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="password" value={pwForm[k]} placeholder="••••••••"
                    onChange={e => setPwForm(p => ({ ...p, [k]: e.target.value }))}
                    className="input-field pl-10" />
                </div>
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={chpw}
              className="btn-outline flex items-center gap-2">
              <FiLock className="w-4 h-4" />
              {chpw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
