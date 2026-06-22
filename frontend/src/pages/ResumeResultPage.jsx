// src/pages/ResumeResultPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeAPI } from '../utils/api';
import Layout from '../components/common/Layout';
import ScoreRing from '../components/common/ScoreRing';
import SkillBadge from '../components/common/SkillBadge';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiBriefcase, FiAlertCircle, FiCheckCircle,
  FiUser, FiMail, FiPhone, FiLinkedin, FiGithub,
  FiBook, FiCode, FiAward, FiRefreshCw
} from 'react-icons/fi';

const Section = ({ title, icon: Icon, children, empty }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="font-display font-bold text-slate-900">{title}</h2>
    </div>
    {empty ? <p className="text-slate-400 text-sm italic">{empty}</p> : children}
  </div>
);

const ResumeResultPage = () => {
  const { id }                = useParams();
  const [resume, setResume]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setRe]  = useState(false);

  useEffect(() => {
    resumeAPI.getResume(id)
      .then(r => setResume(r.data.resume))
      .catch(() => toast.error('Could not load resume'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReanalyze = async () => {
    setRe(true);
    try {
      const r = await resumeAPI.reanalyze(id);
      setResume(r.data.resume);
      toast.success('Re-analysis complete!');
    } catch { toast.error('Re-analysis failed'); }
    finally { setRe(false); }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!resume) return (
    <Layout>
      <div className="card text-center py-12">
        <p className="text-slate-500">Resume not found.</p>
        <Link to="/my-resumes" className="btn-primary mt-4 inline-block">Back to Resumes</Link>
      </div>
    </Layout>
  );

  const p = resume.parsed_data || {};

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/my-resumes" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <FiArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">Resume Analysis</h1>
            <p className="text-xs text-slate-400">{p.full_name || 'Your Resume'} • {new Date(resume.uploaded_at).toLocaleDateString()}</p>
          </div>
        </div>
        <button onClick={handleReanalyze} disabled={reanalyzing}
          className="btn-outline flex items-center gap-2 text-sm">
          <FiRefreshCw className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
          {reanalyzing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card flex flex-col items-center gap-4">
            <h2 className="font-display font-bold text-slate-900 self-start">ATS Score</h2>
            <ScoreRing score={resume.ats_score || 0} size={160} />
            <div className="w-full space-y-2.5">
              {Object.entries(resume.score_breakdown || {}).map(([key, val]) => {
                const max = { skills_score: 35, education_score: 15, experience_score: 20, projects_score: 15, certifications_score: 10, completeness_score: 5 };
                const pct = Math.round((val / (max[key] || 20)) * 100);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 capitalize">{key.replace('_score','').replace('_',' ')}</span>
                      <span className="font-mono font-medium text-slate-700">{val}/{max[key] || 20}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: pct > 70 ? '#22C55E' : pct > 40 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <Section title="Contact Info" icon={FiUser} empty={!p.full_name && 'No contact info extracted'}>
            <div className="space-y-2 text-sm">
              {p.full_name && <div className="flex items-center gap-2"><FiUser className="w-4 h-4 text-slate-400" /><span>{p.full_name}</span></div>}
              {p.email     && <div className="flex items-center gap-2"><FiMail className="w-4 h-4 text-slate-400" /><span className="truncate">{p.email}</span></div>}
              {p.phone     && <div className="flex items-center gap-2"><FiPhone className="w-4 h-4 text-slate-400" /><span>{p.phone}</span></div>}
              {p.linkedin  && <div className="flex items-center gap-2"><FiLinkedin className="w-4 h-4 text-slate-400" /><a href={`https://${p.linkedin}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{p.linkedin}</a></div>}
              {p.github    && <div className="flex items-center gap-2"><FiGithub className="w-4 h-4 text-slate-400" /><a href={`https://${p.github}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{p.github}</a></div>}
            </div>
          </Section>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <Section title={`Skills Detected (${p.skills?.length || 0})`} icon={FiCode}
            empty={!p.skills?.length && 'No skills detected'}>
            <div className="flex flex-wrap gap-2">
              {p.skills?.map(s => <SkillBadge key={s} skill={s} />)}
            </div>
          </Section>

          {/* Missing Skills */}
          {resume.missing_skills?.length > 0 && (
            <div className="card border-l-4 border-red-400">
              <div className="flex items-center gap-2 mb-3">
                <FiAlertCircle className="w-5 h-5 text-red-500" />
                <h2 className="font-display font-bold text-slate-900">Missing Skills</h2>
                <span className="badge bg-red-100 text-red-600 text-xs">For Top Job Match</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.missing_skills.map(s => (
                  <span key={s} className="badge bg-red-50 text-red-600 border border-red-200">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Job Recommendations */}
          <Section title="Job Recommendations" icon={FiBriefcase}
            empty={!resume.recommended_jobs?.length && 'No job recommendations yet'}>
            <div className="space-y-3">
              {resume.recommended_jobs?.map((job, i) => (
                <div key={job.title} className={`flex items-center gap-4 p-3 rounded-xl border transition-all
                  ${i === 0 ? 'border-accent bg-accent/5' : 'border-slate-100 hover:border-primary/20'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${i === 0 ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <FiBriefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                      {i === 0 && <span className="badge bg-accent/20 text-accent text-[10px]">Best Match</span>}
                    </div>
                    <p className="text-xs text-slate-400">{job.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg" style={{
                      color: job.match_percentage >= 70 ? '#22C55E' : job.match_percentage >= 50 ? '#F59E0B' : '#EF4444'
                    }}>{job.match_percentage}%</p>
                    <p className="text-xs text-slate-400">match</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Education */}
          {p.education?.length > 0 && (
            <Section title="Education" icon={FiBook}>
              <div className="space-y-3">
                {p.education.map((e, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">{e.description}</p>
                      {e.year && <p className="text-xs text-slate-400 mt-0.5">{e.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {p.projects?.length > 0 && (
            <Section title="Projects" icon={FiCode}>
              <div className="space-y-3">
                {p.projects.map((proj, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-semibold text-slate-800">{proj.title}</p>
                    {proj.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>}
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies.map(t => <span key={t} className="badge bg-blue-50 text-blue-600 text-[10px]">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {p.certifications?.length > 0 && (
            <Section title="Certifications" icon={FiAward}>
              <div className="space-y-2">
                {p.certifications.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <p className="text-sm text-slate-700">{c.name}</p>
                    {c.year && <span className="text-xs text-slate-400">({c.year})</span>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Suggestions */}
          {resume.improvement_suggestions?.length > 0 && (
            <div className="card border-l-4 border-amber-400">
              <div className="flex items-center gap-2 mb-4">
                <FiAlertCircle className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-bold text-slate-900">Improvement Suggestions</h2>
              </div>
              <ul className="space-y-2.5">
                {resume.improvement_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResumeResultPage;
