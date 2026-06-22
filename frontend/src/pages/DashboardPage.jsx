// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import ScoreRing from '../components/common/ScoreRing';
import StatCard from '../components/common/StatCard';
import SkillBadge from '../components/common/SkillBadge';
import { FiFileText, FiUpload, FiAward, FiTrendingUp, FiBriefcase, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeAPI.getDashboard()
      .then(r => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const latest = stats?.latest_resume;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your resume performance overview</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2">
          <FiUpload className="w-4 h-4" /> Upload Resume
        </Link>
      </div>

      {/* No resumes state */}
      {!stats?.total_resumes ? (
        <div className="card flex flex-col items-center py-16 text-center animate-slide-up">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <FiUpload className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">No resumes yet</h2>
          <p className="text-slate-500 max-w-sm mb-6">Upload your first resume to get your ATS score, skill analysis and job recommendations.</p>
          <Link to="/upload" className="btn-primary">Upload Your Resume</Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={FiFileText}   label="Total Resumes" value={stats.total_resumes}       color="primary" />
            <StatCard icon={FiAward}      label="Best Score"    value={`${stats.best_score}/100`}  color="accent"  />
            <StatCard icon={FiTrendingUp} label="Avg Score"     value={`${stats.avg_score}/100`}   color="blue"    />
            <StatCard icon={FiBriefcase}  label="Job Matches"   value={stats.top_jobs?.length || 0} color="green"  />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Score Ring */}
            {latest && (
              <div className="card flex flex-col items-center gap-4">
                <h2 className="font-display font-bold text-slate-900 self-start text-lg">Latest Resume</h2>
                <ScoreRing score={latest.ats_score || 0} />
                <div className="w-full space-y-2">
                  {Object.entries(latest.score_breakdown || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-32 capitalize">{key.replace('_score','').replace('_',' ')}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${(val / getMaxScore(key)) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600 w-8 text-right">{val}</span>
                    </div>
                  ))}
                </div>
                <Link to={`/resume/${latest._id}`} className="btn-outline w-full text-center text-sm">
                  View Full Analysis
                </Link>
              </div>
            )}

            {/* Score History Chart */}
            <div className="card lg:col-span-2">
              <h2 className="font-display font-bold text-slate-900 mb-4 text-lg">Score History</h2>
              {stats.score_history?.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.score_history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}/100`, 'Score']}
                      labelFormatter={d => new Date(d).toLocaleDateString()} />
                    <Bar dataKey="score" fill="#0F4C81" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                  Upload more resumes to see score progression
                </div>
              )}

              {/* Top Job Matches */}
              <h3 className="font-semibold text-slate-700 mt-6 mb-3 text-sm">Top Job Matches</h3>
              <div className="space-y-2">
                {stats.top_jobs?.slice(0, 4).map(job => (
                  <div key={job.title} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBriefcase className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{job.title}</p>
                      <p className="text-xs text-slate-400">{job.category}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{job.match_percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Skills */}
          {stats.top_skills?.length > 0 && (
            <div className="card mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-slate-900 text-lg">Your Top Skills</h2>
                <Link to="/my-resumes" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View All <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.top_skills.map(s => <SkillBadge key={s} skill={s} />)}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {latest?.improvement_suggestions?.length > 0 && (
            <div className="card mt-6 border-l-4 border-amber-400">
              <div className="flex items-center gap-2 mb-4">
                <FiAlertCircle className="text-amber-500 w-5 h-5" />
                <h2 className="font-display font-bold text-slate-900 text-lg">Improvement Suggestions</h2>
              </div>
              <ul className="space-y-2">
                {latest.improvement_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

const getMaxScore = (key) => {
  const map = { skills_score: 35, education_score: 15, experience_score: 20, projects_score: 15, certifications_score: 10, completeness_score: 5 };
  return map[key] || 20;
};

export default DashboardPage;
