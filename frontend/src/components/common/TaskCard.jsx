import React from 'react';
import { Calendar, User } from 'lucide-react';

const priorityConfig = {
  high: { label: 'High', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  low: { label: 'Low', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const statusConfig = {
  pending: { label: 'Pending', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export default function TaskCard({ task, onStatusChange, showAssignee = false }) {
  const isLate = new Date(task.deadline) < new Date() && task.status !== 'completed';
  const p = priorityConfig[task.priority] || priorityConfig.medium;
  const s = statusConfig[task.status] || statusConfig.pending;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug">{task.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${p.class}`}>{p.label}</span>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.class}`}>{s.label}</span>
        {isLate && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Overdue</span>}
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(task.deadline).toLocaleDateString()}
        </span>
        {showAssignee && task.assignedTo?.length > 0 && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignedTo.map(u => typeof u === 'object' ? u.name : u).join(', ')}
          </span>
        )}
      </div>
      {onStatusChange && (
        <select
          value={task.status}
          onChange={e => onStatusChange(task._id, e.target.value)}
          className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      )}
    </div>
  );
}
