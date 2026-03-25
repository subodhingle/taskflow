import React from 'react';

export default function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
