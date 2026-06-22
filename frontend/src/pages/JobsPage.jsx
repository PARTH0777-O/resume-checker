// src/pages/JobsPage.jsx
import React, { useEffect, useState } from 'react';
import { jobsAPI } from '../utils/api';
import Layout from '../components/common/Layout';
import { FiBriefcase, FiSearch, FiTag } from 'react-icons/fi';

const JobsPage = () => {
  const [jobs, setJobs]           = useState([]);
  const [categories, setCats]     = useState([]);
  const [selected, setSelected]   = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    jobsAPI.getCategories().then(r => setCats(r.data.categories)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    jobsAPI.getJobs(selected || undefined)
      .then(r => setJobs(r.data.roles))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selected]);

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Job Roles</h1>
        <p className="text-slate-500 text-sm mt-1">Explore {jobs.length} available job roles and their required skills</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search roles..." className="input-field pl-10" />
        </div>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="input-field sm:w-56 text-slate-700">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job, i) => (
            <div key={job._id || job.title} className="card hover:shadow-hover animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiBriefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">{job.title}</h3>
                  <span className="badge bg-slate-100 text-slate-500 text-xs mt-1">{job.category}</span>
                </div>
              </div>

              {job.description && (
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{job.description}</p>
              )}

              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {job.required_skills?.slice(0, 6).map(s => (
                    <span key={s} className="badge bg-primary/10 text-primary text-[10px] capitalize">{s}</span>
                  ))}
                  {job.required_skills?.length > 6 && (
                    <span className="badge bg-slate-100 text-slate-400 text-[10px]">+{job.required_skills.length - 6}</span>
                  )}
                </div>
              </div>

              {job.preferred_skills?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Preferred Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.preferred_skills?.slice(0, 4).map(s => (
                      <span key={s} className="badge bg-slate-50 text-slate-400 text-[10px] capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {job.salary_range && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  <FiTag className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-accent">{job.salary_range}</span>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full card text-center py-12">
              <FiBriefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No job roles found</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default JobsPage;
