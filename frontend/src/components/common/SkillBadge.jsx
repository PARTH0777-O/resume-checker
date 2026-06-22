// src/components/common/SkillBadge.jsx
import React from 'react';

const CATEGORY_COLORS = {
  programming: 'bg-blue-100 text-blue-700',
  framework:   'bg-purple-100 text-purple-700',
  database:    'bg-emerald-100 text-emerald-700',
  ai_ml:       'bg-orange-100 text-orange-700',
  cloud:       'bg-sky-100 text-sky-700',
  devops:      'bg-teal-100 text-teal-700',
  web:         'bg-pink-100 text-pink-700',
  data:        'bg-amber-100 text-amber-700',
  tool:        'bg-slate-100 text-slate-700',
  soft:        'bg-gray-100 text-gray-600',
  default:     'bg-indigo-100 text-indigo-700',
};

const SkillBadge = ({ skill, category = 'default', removable, onRemove }) => {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  return (
    <span className={`badge ${colorClass} gap-1`}>
      {skill}
      {removable && (
        <button onClick={() => onRemove?.(skill)} className="ml-1 hover:text-red-500">×</button>
      )}
    </span>
  );
};

export default SkillBadge;
