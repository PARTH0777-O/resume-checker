// src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiAward, FiTrendingUp, FiDatabase, FiRefreshCw } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#EF4444', '#F59E0B', '#22C55E', '#0EA5E9', '#8B5CF6'];

const AdminDashboardPage = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [seeding, setSeed]  = useState(false);

  const load = () => {
    setLoad(true);
    adminAPI.getAnalytics()
      .then(r => setData(r.data.analytics))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoad(false));
  };

  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    setSeed(true);
    try {
      const r = await adminAPI.seedDatabase();
      toast.success(r.data.message);
      load();
    } catch { toast.error('Seeding failed'); }
    finally { setSeed(false); }
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const distData = data ? Object.entries(data.score_distribution).map(([range, count]) => ({ range, count })) : [];
  const pieData  = data?.top_skills?.slice(0, 5).map(({ skill, count }) => ({ name: skill, value: count })) || [];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform analytics and management</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-outline flex items-center gap-2 text-sm">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleSeed} disabled={seeding} className="btn-primary flex items-center gap-2 text-sm">
            <FiDatabase className="w-4 h-4" />
            {seeding ? 'Seeding...' : 'Seed Database'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiUsers}     label="Total Users"       value={data?.total_users || 0}       color="primary" />
        <StatCard icon={FiFileText}  label="Total Resumes"     value={data?.total_resumes || 0}     color="blue"    />
        <StatCard icon={FiAward}     label="Processed"         value={data?.processed_resumes || 0} color="green"   />
        <StatCard icon={FiTrendingUp} label="Avg ATS Score"    value={`${data?.avg_ats_score || 0}/100`} color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Score Distribution */}
        <div className="card">
          <h2 className="font-display font-bold text-slate-900 mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distData}>
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Skills Pie */}
        <div className="card">
          <h2 className="font-display font-bold text-slate-900 mb-4">Top Skills</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">No data yet</p>}
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <h2 className="font-display font-bold text-slate-900 mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-100">
                <th className="text-left pb-3 font-medium">Name</th>
                <th className="text-left pb-3 font-medium">Email</th>
                <th className="text-left pb-3 font-medium">Resumes</th>
                <th className="text-left pb-3 font-medium">Joined</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.recent_users?.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="py-3 text-slate-500">{u.email}</td>
                  <td className="py-3 text-slate-500">{u.resume_count || 0}</td>
                  <td className="py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`badge text-xs ${u.is_active !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {u.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.recent_users?.length && (
            <p className="text-center text-slate-400 text-sm py-6">No users yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
