import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function HRAnalytics() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/users/employees')])
      .then(([t, e]) => { setTasks(t.data); setEmployees(e.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const late = tasks.filter(t => new Date(t.deadline) < now && t.status !== 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const statusData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Overdue', value: late, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ];

  const empPerf = employees.map(emp => {
    const empTasks = tasks.filter(t => t.assignedTo?.some(a => (a._id || a) === emp._id));
    const empLate = empTasks.filter(t => new Date(t.deadline) < now && t.status !== 'completed').length;
    return {
      name: emp.name.split(' ')[0],
      fullName: emp.name,
      completed: empTasks.filter(t => t.status === 'completed').length,
      inProgress: empTasks.filter(t => t.status === 'in-progress').length,
      pending: empTasks.filter(t => t.status === 'pending').length,
      late: empLate,
      total: empTasks.length,
    };
  });

  // Monthly task trend (mock based on createdAt)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString('default', { month: 'short' });
    const monthTasks = tasks.filter(t => {
      const td = new Date(t.createdAt);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    return {
      month,
      created: monthTasks.length,
      completed: monthTasks.filter(t => t.status === 'completed').length,
    };
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Performance overview and insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} color="green" subtitle={`${completed} of ${tasks.length} tasks`} />
        <StatCard title="Active Employees" value={employees.length} icon={Users} color="blue" />
        <StatCard title="Overdue Tasks" value={late} icon={AlertTriangle} color="red" />
        <StatCard title="Total Tasks" value={tasks.length} icon={BarChart2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priorityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Monthly Task Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="url(#colorCreated)" name="Created" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#colorCompleted)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Employee Performance</h2>
          {empPerf.filter(e => e.total > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={empPerf.filter(e => e.total > 0)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#ef4444" name="Overdue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-16">No data available</p>}
        </div>
      </div>

      {/* Employee table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Employee Task Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Completed</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">In Progress</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Overdue</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {empPerf.map((emp, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white">{emp.fullName}</td>
                  <td className="px-5 py-3 text-sm text-center text-gray-600 dark:text-gray-400">{emp.total}</td>
                  <td className="px-5 py-3 text-sm text-center"><span className="text-green-600 font-medium">{emp.completed}</span></td>
                  <td className="px-5 py-3 text-sm text-center"><span className="text-blue-600 font-medium">{emp.inProgress}</span></td>
                  <td className="px-5 py-3 text-sm text-center"><span className="text-red-600 font-medium">{emp.late}</span></td>
                  <td className="px-5 py-3 text-sm text-center">
                    <span className={`font-semibold ${emp.total > 0 && (emp.completed / emp.total) >= 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
