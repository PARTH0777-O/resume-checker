// src/pages/admin/AdminSkillsPage.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiX, FiSearch } from 'react-icons/fi';

const CATEGORIES = ['programming','framework','database','ai_ml','cloud','devops','web','data','tool','soft'];
const CAT_COLORS  = { programming:'bg-blue-100 text-blue-700', framework:'bg-purple-100 text-purple-700', database:'bg-emerald-100 text-emerald-700', ai_ml:'bg-orange-100 text-orange-700', cloud:'bg-sky-100 text-sky-700', devops:'bg-teal-100 text-teal-700', web:'bg-pink-100 text-pink-700', data:'bg-amber-100 text-amber-700', tool:'bg-slate-100 text-slate-700', soft:'bg-gray-100 text-gray-600' };

const AdminSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCat] = useState('');
  const [show, setShow]     = useState(false);
  const [form, setForm]     = useState({ name: '', category: 'programming', aliases: '' });
  const [loading, setLoad]  = useState(true);
  const [saving, setSave]   = useState(false);

  useEffect(() => {
    adminAPI.getSkills()
      .then(r => setSkills(r.data.skills))
      .finally(() => setLoad(false));
  }, []);

  const filtered = skills.filter(s =>
    (s.display_name || s.name).toLowerCase().includes(search.toLowerCase()) &&
    (catFilter ? s.category === catFilter : true)
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) return toast.error('Name and category required');
    setSave(true);
    try {
      const payload = { ...form, aliases: form.aliases.split(',').map(a => a.trim()).filter(Boolean) };
      const r = await adminAPI.createSkill(payload);
      setSkills(p => [...p, r.data.skill]);
      setForm({ name: '', category: 'programming', aliases: '' });
      setShow(false);
      toast.success('Skill added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSave(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await adminAPI.deleteSkill(id);
      setSkills(p => p.filter(s => s._id !== id));
      toast.success('Skill deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Skills Database</h1>
          <p className="text-slate-500 text-sm mt-1">{skills.length} skills configured</p>
        </div>
        <button onClick={() => setShow(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search skills..." className="input-field pl-10" />
        </div>
        <select value={catFilter} onChange={e => setCat(e.target.value)} className="input-field sm:w-44">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-slate-900">Add Skill</h2>
              <button onClick={() => setShow(false)} className="p-1 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Skill Name *</label>
                <input value={form.name} placeholder="e.g. TensorFlow"
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="input-field text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Aliases (comma-separated)</label>
                <input value={form.aliases} placeholder="tf, tensorflow2"
                  onChange={e => setForm(p => ({ ...p, aliases: e.target.value }))} className="input-field text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShow(false)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                  {saving ? 'Adding...' : 'Add Skill'}
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
        <div className="card">
          <div className="flex flex-wrap gap-2">
            {filtered.map(s => (
              <div key={s._id} className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${CAT_COLORS[s.category] || 'bg-slate-100 text-slate-700'}`}>
                {s.display_name || s.name}
                <button onClick={() => handleDelete(s._id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ml-1">
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
            {!filtered.length && <p className="text-slate-400 text-sm py-4">No skills found</p>}
          </div>
          <p className="text-xs text-slate-400 mt-4">{filtered.length} of {skills.length} skills shown • Hover to delete</p>
        </div>
      )}
    </Layout>
  );
};

export default AdminSkillsPage;
