// src/pages/admin/AdminUsersPage.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { FiToggleLeft, FiToggleRight, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AdminUsersPage = () => {
  const [users, setUsers]   = useState([]);
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [loading, setLoad]  = useState(true);

  const load = (p = page) => {
    setLoad(true);
    adminAPI.getUsers(p)
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.total_pages); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoad(false));
  };

  useEffect(() => { load(); }, [page]);

  const toggle = async (id) => {
    try {
      const r = await adminAPI.toggleUser(id);
      setUsers(us => us.map(u => u._id === id ? { ...u, is_active: r.data.is_active } : u));
      toast.success(r.data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Users Management</h1>
        <p className="text-slate-500 text-sm mt-1">{total} registered users</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  {['User', 'Email', 'Resumes', 'Joined', 'Last Login', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold uppercase">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                    <td className="py-3 pr-4 text-center">{u.resume_count || 0}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge text-xs ${u.is_active !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                        {u.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => toggle(u._id)}
                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                          u.is_active !== false
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}>
                        {u.is_active !== false
                          ? <><FiToggleLeft className="w-4 h-4" /> Deactivate</>
                          : <><FiToggleRight className="w-4 h-4" /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!users.length && (
              <div className="text-center py-10">
                <FiUser className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No users found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default AdminUsersPage;
