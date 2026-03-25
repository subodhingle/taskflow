import React, { useState } from 'react';
import { User, Mail, Building, Briefcase, Phone, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function EmployeeProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    department: user.department || '',
    position: user.position || '',
    phone: user.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', form);
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, icon: Icon, name, type = 'text', disabled = false }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={type}
          value={disabled ? user.email : form[name]}
          disabled={disabled}
          onChange={e => !disabled && setForm({ ...form, [name]: e.target.value })}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition ${
            disabled
              ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h1>

      {/* Avatar card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">{user.role}</span>
              {user.department && <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{user.department}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-5">Edit Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" icon={User} name="name" />
            <Field label="Email" icon={Mail} name="email" disabled />
            <Field label="Department" icon={Building} name="department" />
            <Field label="Position" icon={Briefcase} name="position" />
            <Field label="Phone" icon={Phone} name="phone" type="tel" />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
