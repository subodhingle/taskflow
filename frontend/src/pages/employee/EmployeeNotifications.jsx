import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, CheckSquare, Video, Megaphone } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const typeIcon = { task: CheckSquare, meeting: Video, announcement: Megaphone, system: Bell };
const typeColor = {
  task: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30',
  meeting: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30',
  announcement: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30',
  system: 'bg-gray-50 text-gray-600 dark:bg-gray-700',
};

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, readStatus: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    toast.success('All marked as read');
  };

  const unread = notifications.filter(n => !n.readStatus).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = typeIcon[n.type] || Bell;
            return (
              <div key={n._id} onClick={() => !n.readStatus && markRead(n._id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  n.readStatus
                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'
                }`}>
                <div className={`p-2 rounded-lg shrink-0 ${typeColor[n.type] || typeColor.system}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.readStatus ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-white font-medium'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.readStatus && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
