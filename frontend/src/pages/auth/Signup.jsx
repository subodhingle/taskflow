import React, { useState, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, LayoutDashboard, Building, Briefcase } from 'lucide-react';

const DroneScene = lazy(() => import('../../components/common/DroneScene'));

export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', department: '', position: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signup(form);
      toast.success('Account created! Welcome aboard.');
      navigate(user.role === 'hr' ? '/hr' : '/employee');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020817]">

      {/* ── LEFT — 3D Drone Panel ─────────────────────────────────────────── */}
      <div className="relative lg:flex-1 h-48 lg:h-auto overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0c1a3a] to-[#0a0f2e]" />
        <div className="absolute inset-0">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <DroneScene />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-transparent to-transparent pointer-events-none" />

        {/* Branding */}
        <div className="absolute top-6 left-6 flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">TaskFlow</p>
            <p className="text-sky-400 text-xs">Aerospace Division</p>
          </div>
        </div>

        {/* Bottom text — desktop only */}
        <div className="absolute bottom-8 left-6 right-6 z-10 hidden lg:block">
          <h2 className="text-white text-3xl font-bold leading-tight mb-2">
            Join the crew.<br />
            <span className="text-sky-400">Start your mission.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xs">
            Create your account and get access to the full task management dashboard.
          </p>
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)' }} />
      </div>

      {/* ── RIGHT — Signup Form ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center lg:w-[440px] xl:w-[480px] shrink-0 p-6 lg:p-12 bg-[#020817]">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <p className="text-white font-bold text-lg">TaskFlow</p>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-6">Join your team on TaskFlow</p>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                  placeholder="John Doe" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                  placeholder="you@company.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                  placeholder="Min. 6 characters" />
              </div>
            </div>

            {/* Role + Department */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm">
                  <option value="employee" className="bg-gray-900">Employee</option>
                  <option value="hr" className="bg-gray-900">HR / Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                    placeholder="Engineering" />
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Position</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                  placeholder="Frontend Developer" />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-sky-500/25 mt-1">
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 font-medium hover:text-sky-300 transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-slate-700 mt-6">
            © 2025 TaskFlow Aerospace · All systems nominal
          </p>
        </div>
      </div>
    </div>
  );
}
