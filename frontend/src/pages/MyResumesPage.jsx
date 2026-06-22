// src/pages/MyResumesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI } from '../utils/api';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';
import { FiFileText, FiTrash2, FiEye, FiUpload, FiCalendar, FiAward } from 'react-icons/fi';

const ScorePill = ({ score }) => {
  const color = score >= 80 ? 'bg-blue-100 text-blue-700' : score >= 60 ? 'bg-green-100 text-green-700'
              : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600';
  return <span className={`badge ${color} font-bold`}>{score}/100</span>;
};

const StatusPill = ({ status }) => {
  const map = { processed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-600' };
  return <span className={`badge ${map[status] || 'bg-slate-100 text-slate-500'} capitalize`}>{status}</span>;
};

const MyResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeAPI.getMyResumes()
      .then(r => setResumes(r.data.resumes))
      .catch(() => toast.error('Failed to load resumes'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await resumeAPI.deleteResume(id);
      setResumes(p => p.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Resumes</h1>
          <p className="text-slate-500 text-sm mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2">
          <FiUpload className="w-4 h-4" /> New Upload
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loading && !resumes.length && (
        <div className="card text-center py-16 animate-slide-up">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-slate-900 mb-2">No resumes yet</h2>
          <p className="text-slate-500 text-sm mb-6">Upload your first resume to get started</p>
          <Link to="/upload" className="btn-primary">Upload Resume</Link>
        </div>
      )}

      {!loading && resumes.length > 0 && (
        <div className="space-y-4">
          {resumes.map((r, i) => (
            <div key={r._id} className="card flex items-center gap-4 animate-slide-up hover:shadow-hover"
              style={{ animationDelay: `${i * 60}ms` }}>
              {/* Icon */}
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiFileText className="w-6 h-6 text-red-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm truncate max-w-xs">
                    {r.parsed_data?.full_name || r.filename || 'Resume'}
                  </p>
                  <StatusPill status={r.status} />
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(r.uploaded_at).toLocaleDateString()}
                  </span>
                  {r.status === 'processed' && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <FiAward className="w-3 h-3" />
                      {r.recommended_jobs?.length || 0} job matches
                    </span>
                  )}
                  {r.parsed_data?.skills?.length > 0 && (
                    <span className="text-xs text-slate-400">
                      {r.parsed_data.skills.length} skills detected
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              {r.status === 'processed' && (
                <div className="flex-shrink-0 hidden sm:block">
                  <ScorePill score={r.ats_score || 0} />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.status === 'processed' && (
                  <Link to={`/resume/${r._id}`}
                    className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all">
                    <FiEye className="w-4 h-4" />
                  </Link>
                )}
                <button onClick={() => handleDelete(r._id)}
                  className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default MyResumesPage;
