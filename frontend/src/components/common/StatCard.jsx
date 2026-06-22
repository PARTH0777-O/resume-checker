// src/components/common/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, label, value, sub, color = 'primary', trend }) => {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    accent:  'bg-accent/10 text-accent',
    green:   'bg-green-100 text-green-600',
    amber:   'bg-amber-100 text-amber-600',
    rose:    'bg-rose-100 text-rose-600',
    blue:    'bg-blue-100 text-blue-600',
  };

  return (
    <div className="card flex items-start gap-4 animate-slide-up">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
          trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
        }`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
};

export default StatCard;
