// src/pages/UploadPage.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../utils/api';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiZap } from 'react-icons/fi';

const STEPS = ['Upload', 'Parsing', 'Analyzing', 'Complete'];

const UploadPage = () => {
  const [file, setFile]       = useState(null);
  const [step, setStep]       = useState(0);   // 0=idle,1=parsing,2=analyzing,3=done
  const [progress, setProgress] = useState(0);
  const navigate              = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length) return toast.error('Only PDF files allowed (max 16MB)');
    setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 16 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF file');
    const fd = new FormData();
    fd.append('resume', file);

    setStep(1); setProgress(25);
    try {
      setStep(2); setProgress(60);
      const res = await resumeAPI.upload(fd);
      setStep(3); setProgress(100);
      toast.success('Resume analyzed successfully!');
      setTimeout(() => navigate(`/resume/${res.data.resume_id}`), 1000);
    } catch (err) {
      setStep(0); setProgress(0);
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const isProcessing = step > 0 && step < 3;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-slate-900">Upload Resume</h1>
          <p className="text-slate-500 text-sm mt-1">Upload your PDF resume to get AI-powered analysis</p>
        </div>

        {/* Progress steps */}
        {step > 0 && (
          <div className="card mb-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${
                    i < step ? 'text-accent' : i === step ? 'text-primary' : 'text-slate-300'
                  }`}>
                    {i < step
                      ? <FiCheckCircle className="w-4 h-4" />
                      : <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px]
                          ${i === step ? 'border-primary bg-primary text-white animate-pulse' : 'border-slate-200'}`}>
                          {i + 1}
                        </div>
                    }
                    <span>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-accent' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">
              {step === 1 && 'Reading your PDF...'}
              {step === 2 && 'Running AI analysis — this takes 15-30 seconds...'}
              {step === 3 && 'Done! Redirecting to results...'}
            </p>
          </div>
        )}

        {/* Dropzone */}
        <div className="card">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-primary bg-primary/5' :
              file          ? 'border-accent bg-accent/5'  :
              'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
            } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input {...getInputProps()} />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              file ? 'bg-accent/20' : 'bg-primary/10'
            }`}>
              {file ? <FiFile className="w-8 h-8 text-accent" /> : <FiUploadCloud className="w-8 h-8 text-primary" />}
            </div>
            {file ? (
              <div>
                <p className="font-semibold text-slate-900 mb-1">{file.name}</p>
                <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-700 mb-1">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-slate-400">or click to browse</p>
                <p className="text-xs text-slate-300 mt-2">PDF format • Max 16MB</p>
              </div>
            )}
          </div>

          {/* File info */}
          {file && !isProcessing && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FiFile className="text-red-500 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB • PDF</p>
              </div>
              <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 p-1">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <><FiZap className="w-4 h-4" /> Analyze Resume</>
            )}
          </button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { title: 'ATS Score',    desc: 'Get scored out of 100', emoji: '🎯' },
            { title: 'Skill Match',  desc: 'See matched & missing skills', emoji: '⚡' },
            { title: 'Job Roles',    desc: 'Discover best-fit careers', emoji: '💼' },
          ].map(({ title, desc, emoji }) => (
            <div key={title} className="card text-center p-4">
              <span className="text-2xl">{emoji}</span>
              <p className="font-semibold text-slate-800 text-sm mt-2">{title}</p>
              <p className="text-xs text-slate-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
