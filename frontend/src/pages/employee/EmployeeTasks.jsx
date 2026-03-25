import React, { useEffect, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import api from '../../utils/api';
import TaskCard from '../../components/common/TaskCard';
import toast from 'react-hot-toast';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('all');

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data)).catch(() => toast.error('Failed to load tasks')).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? data : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = tasks.filter(t => {
    const statusMatch = filter === 'all' || t.status === filter;
    const priorityMatch = priority === 'all' || t.priority === priority;
    return statusMatch && priorityMatch;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">{tasks.length} tasks assigned to you</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}>
            {key === 'all' ? 'All' : key === 'in-progress' ? 'In Progress' : key.charAt(0).toUpperCase() + key.slice(1)} ({count})
          </button>
        ))}
        <select value={priority} onChange={e => setPriority(e.target.value)}
          className="ml-auto px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 outline-none">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(task => (
            <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
