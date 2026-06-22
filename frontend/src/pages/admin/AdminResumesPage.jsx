// src/pages/admin/AdminResumesPage.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { FiFileText, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AdminResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [loading, setLoad]    = useState(true);

  useEffect(() => {
    setLoad(true);
    adminAPI.getResumes(page)
      .then(r => { setResumes(r.data.resumes); setTotal(r.data.total); setPages(r.data.total_pages); })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoad(false));
  }, [page]);

  const scoreColor = (s) => s >= 80 ? 'bg-blue-100 text-blue-700' : s >= 60 ? 'bg-green-100 text-green-700' : s >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-500';

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">All Resumes</h1>
        <p className="text-slate-500 text-sm mt-1">{total} resumes uploaded</p>
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
                  {['User', 'Email', 'Name', 'Status', 'ATS Score', 'Top Job', 'Skills', 'Uploaded'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {resumes.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-slate-800 whitespace-nowrap">{r.user?.name || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{r.user?.email || '—'}</td>
                    <td className="py-3 pr-4 text-slate-600 text-xs">{r.parsed_data?.full_name || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge text-xs ${r.status === 'processed' ? 'bg-green-100 text-green-600' : r.status === 'failed' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-600'} capitalize`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {r.status === 'processed' && (
                        <span className={`badge text-xs font-bold ${scoreColor(r.ats_score || 0)}`}>
                          {r.ats_score}/100
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">
                      {r.recommended_jobs?.[0]?.title || '—'}
                    </td>
                    <td className="py-3 pr-4 text-xs text-center text-slate-500">
                      {r.parsed_data?.skills?.length || 0}
                    </td>
                    <td className="py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(r.uploaded_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!resumes.length && (
              <div className="text-center py-10">
                <FiFileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No resumes yet</p>
              </div>
            )}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Page {page} of {pages} • {total} total</p>
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

export default AdminResumesPage;
