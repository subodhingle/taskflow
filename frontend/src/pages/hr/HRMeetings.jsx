import React, { useEffect, useState } from 'react';
import { Plus, Video, Calendar, Clock, Users, ExternalLink, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const emptyForm = { title: '', participants: [], date: '', time: '', endTime: '', link: '', agenda: '' };

export default function HRMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/meetings'), api.get('/users/employees')])
      .then(([m, e]) => { setMeetings(m.data); setEmployees(e.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.participants.length === 0) return toast.error('Select at least one participant');
    setSaving(true);
    try {
      const { data } = await api.post('/meetings', form);
      setMeetings(prev => [data, ...prev]);
      toast.success('Meeting scheduled');
      setModal(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule meeting');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/meetings/${id}`);
      setMeetings(prev => prev.filter(m => m._id !== id));
      setDeleteId(null);
      toast.success('Meeting deleted');
    } catch { toast.error('Failed'); }
  };

  const now = new Date();
  const filtered = meetings.filter(m => {
    const d = new Date(m.date);
    if (filter === 'upcoming') return d >= now;
    if (filter === 'past') return d < now;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meeting Scheduler</h1>
          <p className="text-gray-500 text-sm mt-1">{meetings.length} meetings total</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'upcoming', 'past'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No meetings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(m => (
            <div key={m._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{m.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(m.date) >= now ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {new Date(m.date) >= now ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noreferrer"
                      className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 transition-colors">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                    </a>
                  )}
                  <button onClick={() => setDeleteId(m._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{m.time}{m.endTime ? ` – ${m.endTime}` : ''}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" />{m.participants?.map(p => p.name).join(', ')}</div>
              </div>
              {m.agenda && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Agenda</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.agenda}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Schedule Meeting" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Link (Zoom / Google Meet)</label>
            <input type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participants</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 max-h-40 overflow-y-auto space-y-2">
              {employees.map(emp => (
                <label key={emp._id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.participants.includes(emp._id)}
                    onChange={e => setForm({ ...form, participants: e.target.checked ? [...form.participants, emp._id] : form.participants.filter(id => id !== emp._id) })}
                    className="rounded text-purple-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{emp.name} <span className="text-gray-400">({emp.department || 'No dept'})</span></span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agenda</label>
            <textarea rows={3} value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-60">
              {saving ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Meeting" size="sm">
        <p className="text-gray-600 dark:text-gray-400 mb-6">Delete this meeting? Participants won't be notified automatically.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
