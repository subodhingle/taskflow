import React, { useEffect, useState } from 'react';
import { Plus, Megaphone, Trash2, AlertCircle, Info, Bell } from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const priorityConfig = {
  urgent: { label: 'Urgent', class: 'bg-red-100 text-red-700 border-red-200', border: 'border-l-red-500', icon: AlertCircle, iconColor: 'text-red-500' },
  normal: { label: 'Normal', class: 'bg-blue-100 text-blue-700 border-blue-200', border: 'border-l-blue-500', icon: Info, iconColor: 'text-blue-500' },
  low: { label: 'Low', class: 'bg-gray-100 text-gray-600 border-gray-200', border: 'border-l-gray-400', icon: Bell, iconColor: 'text-gray-400' },
};

export default function HRAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/announcements', form);
      setAnnouncements(prev => [data, ...prev]);
      toast.success('Announcement broadcast to all employees');
      setModal(false);
      setForm({ title: '', content: '', priority: 'normal' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      setDeleteId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Broadcast messages to all employees</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => {
            const cfg = priorityConfig[a.priority] || priorityConfig.normal;
            const Icon = cfg.icon;
            return (
              <div key={a._id} className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 ${cfg.border} card-hover`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.iconColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{a.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.class}`}>{cfg.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>By {a.createdBy?.name}</span>
                        <span>•</span>
                        <span>{new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setDeleteId(a._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea required rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            This announcement will be broadcast to all employees and they will receive a notification.
          </p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-60">
              {saving ? 'Broadcasting...' : 'Broadcast'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Announcement" size="sm">
        <p className="text-gray-600 dark:text-gray-400 mb-6">Delete this announcement? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
