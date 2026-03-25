import React, { useEffect, useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Mail, Building, Briefcase } from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', role: 'employee', department: '', position: '', phone: '' };

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get('/users').then(r => setEmployees(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '', position: u.position || '', phone: u.phone || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        const { data } = await api.put(`/users/${editUser._id}`, form);
        setEmployees(prev => prev.map(u => u._id === editUser._id ? data : u));
        toast.success('Employee updated');
      } else {
        const { data } = await api.post('/users', form);
        setEmployees(prev => [data, ...prev]);
        toast.success('Employee created');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setEmployees(prev => prev.filter(u => u._id !== id));
      setDeleteId(null);
      toast.success('Employee deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = employees.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} total members</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Department</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Position</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${u.role === 'hr' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{u.department || '—'}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{u.position || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.role === 'hr' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'hr' ? 'HR Admin' : 'Employee'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => setDeleteId(u._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No employees found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editUser ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            {!editUser && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Default: Password123"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="employee">Employee</option>
                <option value="hr">HR Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
              <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : editUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
