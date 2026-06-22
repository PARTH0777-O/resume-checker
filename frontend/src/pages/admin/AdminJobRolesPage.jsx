// src/pages/admin/AdminJobRolesPage.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { FiBriefcase, FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const EMPTY_FORM = { title: '', category: '', description: '', required_skills: '', preferred_skills: '', salary_range: '' };

const AdminJobRolesPage = () => {
  const [roles, setRoles]   = useState([]);
  const [show, setShow]     = useState(false);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [loading, setLoad]  = useState(true);
  const [saving, setSave]   = useState(false);

  useEffect(() => {
    adminAPI.getJobRoles()
      .then(r => setRoles(r.data.roles))
      .finally(() => setLoad(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.required_skills)
      return toast.error('Title, category and required skills are required');
    setSave(true);
    try {
      const payload = {
        ...form,
        required_skills: form.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: form.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
      };
      const r = await adminAPI.createJobRole(payload);
      setRoles(p => [...p, r.data.role]);
      setForm(EMPTY_FORM); setShow(false);
      toast.success('Job role created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSave(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job role?')) return;
    try {
      await adminAPI.deleteJobRole(id);
      setRoles(p => p.filter(r => r._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Job Roles</h1>
          <p className="text-slate-500 text-sm mt-1">{roles.length} roles configured</p>
        </div>
        <button onClick={() => setShow(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus className="w-4 h-4" /> Add Role
        </button>
      </div>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-slate-900">Add Job Role</h2>
              <button onClick={() => setShow(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Job Title *',      key: 'title',            ph: 'e.g. Python Developer' },
                { label: 'Category *',       key: 'category',         ph: 'e.g. Software Development' },
                { label: 'Description',      key: 'description',      ph: 'Brief description...' },
                { label: 'Required Skills * (comma-separated)', key: 'required_skills', ph: 'python, flask, sql' },
                { label: 'Preferred Skills', key: 'preferred_skills', ph: 'docker, aws' },
                { label: 'Salary Range',     key: 'salary_range',     ph: '₹4L - ₹18L' },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input value={form[key]} placeholder={ph}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="input-field text-sm" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShow(false)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                  {saving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map(r => (
            <div key={r._id} className="card hover:shadow-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FiBriefcase className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{r.title}</p>
                    <span className="badge bg-slate-100 text-slate-500 text-[10px]">{r.category}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(r._id)}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              {r.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{r.description}</p>}
              <div className="flex flex-wrap gap-1">
                {r.required_skills?.slice(0, 5).map(s => (
                  <span key={s} className="badge bg-primary/10 text-primary text-[10px] capitalize">{s}</span>
                ))}
                {r.required_skills?.length > 5 && (
                  <span className="badge bg-slate-100 text-slate-400 text-[10px]">+{r.required_skills.length - 5}</span>
                )}
              </div>
              {r.salary_range && <p className="text-xs text-accent font-medium mt-2">{r.salary_range}</p>}
            </div>
          ))}
          {!roles.length && (
            <div className="col-span-full card text-center py-12">
              <p className="text-slate-400">No job roles. Click "Seed Database" to add defaults.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default AdminJobRolesPage;
