import React, { useEffect, useState } from 'react';
import { Video, Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function EmployeeMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    api.get('/meetings').then(r => setMeetings(r.data)).catch(() => toast.error('Failed to load meetings')).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = meetings.filter(m => {
    const mDate = new Date(m.date);
    if (filter === 'upcoming') return mDate >= now;
    if (filter === 'past') return mDate < now;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meetings</h1>
        <p className="text-gray-500 text-sm mt-1">{meetings.length} meetings scheduled</p>
      </div>

      <div className="flex gap-2">
        {['all', 'upcoming', 'past'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}>{f}</button>
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
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{m.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(m.date) >= now ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {new Date(m.date) >= now ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                </div>
                {m.link && (
                  <a href={m.link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0">
                    <ExternalLink className="w-3 h-3" /> Join
                  </a>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(m.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {m.time}{m.endTime ? ` – ${m.endTime}` : ''}
                </div>
                {m.participants?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {m.participants.map(p => p.name).join(', ')}
                  </div>
                )}
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
    </div>
  );
}
