import React, { useEffect, useState } from 'react';
import { Users, CheckSquare, AlertTriangle, Video, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

export default function HRDashboard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/users/employees'), api.get('/meetings')])
      .then(([t, e, m]) => { setTasks(t.data); setEmployees(e.data); setMeetings(m.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const late = tasks.filter(t => new Date(t.deadline) < now && t.status !== 'completed').length;

  const pieData = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Pending', value: pending },
    { name: 'Overdue', value: late },
  ].filter(d => d.value > 0);

  // Employee performance bar chart
  const empPerf = employees.map(emp => {
    const empTasks = tasks.filter(t => t.assignedTo?.some(a => (a._id || a) === emp._id));
    return {
      name: emp.name.split(' ')[0],
      completed: empTasks.filter(t => t.status === 'completed').length,
      pending: empTasks.filter(t => t.status === 'pending').length,
      total: empTasks.length,
    };
  }).filter(e => e.total > 0);

  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= now).slice(0, 4);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">HR Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={employees.length} icon={Users} color="purple" />
        <StatCard title="Tasks Completed" value={completed} icon={CheckSquare} color="green" />
        <StatCard title="In Progress" value={inProgress} icon={TrendingUp} color="blue" />
        <StatCard title="Overdue Tasks" value={late} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Task Status Overview</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">No task data</p>}
        </div>

        {/* Employee Performance Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Employee Performance</h2>
          {empPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={empPerf} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">No performance data</p>}
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upcoming Meetings</h2>
        {upcomingMeetings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No upcoming meetings</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingMeetings.map(m => (
              <div key={m._id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{m.title}</p>
                </div>
                <p className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString()} at {m.time}</p>
                <p className="text-xs text-gray-400 mt-1">{m.participants?.length} participants</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
