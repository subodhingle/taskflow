import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Video, Calendar } from 'lucide-react';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import TaskCard from '../../components/common/TaskCard';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, m, a] = await Promise.all([
          api.get('/tasks'),
          api.get('/meetings'),
          api.get('/announcements'),
        ]);
        setTasks(t.data);
        setMeetings(m.data);
        setAnnouncements(a.data);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? data : t));
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const now = new Date();
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const late = tasks.filter(t => new Date(t.deadline) < now && t.status !== 'completed').length;
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= now).slice(0, 3);
  const recentTasks = tasks.slice(0, 4);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Completed" value={completed} icon={CheckSquare} color="green" />
        <StatCard title="In Progress" value={inProgress} icon={TrendingUp} color="blue" />
        <StatCard title="Pending" value={pending} icon={Clock} color="yellow" />
        <StatCard title="Overdue" value={late} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Tasks</h2>
            <Link to="/employee/tasks" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentTasks.map(task => (
                <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming Meetings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upcoming Meetings</h2>
            <div className="space-y-3">
              {upcomingMeetings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500 text-sm">No upcoming meetings</p>
                </div>
              ) : upcomingMeetings.map(m => (
                <div key={m._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Video className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(m.date).toLocaleDateString()} at {m.time}</p>
                      {m.link && (
                        <a href={m.link} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block">Join Meeting →</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Announcements</h2>
            <div className="space-y-3">
              {announcements.slice(0, 3).map(a => (
                <div key={a._id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 shadow-sm ${
                  a.priority === 'urgent' ? 'border-red-500' : a.priority === 'normal' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
