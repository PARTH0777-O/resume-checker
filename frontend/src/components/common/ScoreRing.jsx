// src/components/common/ScoreRing.jsx
import React from 'react';

const ScoreRing = ({ score = 0, size = 140, strokeWidth = 10, label = "ATS Score" }) => {
  const radius  = (size - strokeWidth) / 2;
  const circ    = 2 * Math.PI * radius;
  const pct     = Math.min(100, Math.max(0, score));
  const offset  = circ - (pct / 100) * circ;

  const color = pct >= 80 ? '#0EA5E9'
              : pct >= 60 ? '#22C55E'
              : pct >= 40 ? '#F59E0B'
              : '#EF4444';

  const grade = pct >= 80 ? 'Excellent'
              : pct >= 60 ? 'Good'
              : pct >= 40 ? 'Average'
              : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold" style={{ color }}>
            {pct}
          </span>
          <span className="text-xs text-slate-400 font-medium">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <span className="badge text-xs mt-1" style={{
          background: color + '20', color
        }}>{grade}</span>
      </div>
    </div>
  );
};

export default ScoreRing;
