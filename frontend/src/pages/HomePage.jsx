// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiUploadCloud, FiBarChart2, FiBriefcase, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const FEATURES = [
  { icon: FiUploadCloud, title: 'Smart Upload',       desc: 'Upload any PDF resume and get instant AI-powered analysis',    color: 'bg-blue-100 text-blue-600'   },
  { icon: FiBarChart2,   title: 'ATS Scoring',        desc: 'Get a detailed score out of 100 with section-wise breakdown',   color: 'bg-purple-100 text-purple-600'},
  { icon: FiBriefcase,   title: 'Job Matching',        desc: 'Discover the best-fit job roles with match percentages',        color: 'bg-amber-100 text-amber-600' },
  { icon: FiCheckCircle, title: 'Skill Gap Analysis',  desc: 'Identify missing skills and get targeted recommendations',      color: 'bg-green-100 text-green-600' },
];

const HomePage = () => (
  <div className="min-h-screen bg-slate-50">
    {/* Navbar */}
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <FiZap className="text-white w-4 h-4" />
          </div>
          <span className="font-display font-bold text-slate-900">ResumeAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-6xl mx-auto px-6 py-20 text-center animate-fade-in">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
        <FiZap className="w-3.5 h-3.5" /> AI-Powered Resume Analysis
      </div>
      <h1 className="font-display text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
        Get Your Resume<br />
        <span className="text-primary">ATS-Ready</span> in Seconds
      </h1>
      <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
        Upload your resume and instantly get an ATS score, skill gap analysis, 
        job recommendations, and actionable improvement tips.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
          Analyze My Resume <FiArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/login" className="btn-outline text-base px-7 py-3">Sign In</Link>
      </div>

      {/* Score Demo */}
      <div className="mt-16 grid grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
        {[
          { role: 'Python Dev',     score: 92, color: '#22C55E' },
          { role: 'AI Engineer',    score: 85, color: '#0EA5E9' },
          { role: 'Data Analyst',   score: 78, color: '#F59E0B' },
          { role: 'Full Stack Dev', score: 71, color: '#8B5CF6' },
          { role: 'DevOps Eng.',    score: 65, color: '#EC4899' },
        ].map(({ role, score, color }) => (
          <div key={role} className="card p-4 text-center">
            <p className="font-display text-2xl font-bold mb-1" style={{ color }}>{score}%</p>
            <p className="text-xs text-slate-500 leading-tight">{role}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="font-display text-3xl font-bold text-slate-900 text-center mb-12">
        Everything You Need to Land the Job
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card hover:shadow-hover group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-primary rounded-3xl p-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: 80+i*20, height: 80+i*20, top: `${i*12}%`, right: `${i*8}%`, opacity: 0.3 }} />
          ))}
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to boost your career?</h2>
          <p className="text-white/80 mb-6 max-w-sm mx-auto">Join thousands of job seekers who improved their resumes with ResumeAI</p>
          <Link to="/register" className="bg-white text-primary font-bold px-8 py-3 rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2">
            Start for Free <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>

    <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
      <p> © {new Date().getFullYear()} ResumeAI — Smart Resume Analyzer · Built for MCA Final Year Project</p>
    </footer>
  </div>
);

export default HomePage;
