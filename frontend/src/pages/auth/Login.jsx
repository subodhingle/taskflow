import React, { useState, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Cpu, Radio, Navigation } from 'lucide-react';
import RamaAstraLogo from '../../components/common/RamaAstraLogo';

// Lazy-load the heavy 3D scene so the form renders instantly
const DroneScene = lazy(() => import('../../components/common/DroneScene'));

// Animated stat badges shown on the 3D panel
const stats = [
  { icon: Navigation, label: 'Altitude',  value: '1,240 m', color: 'text-sky-400'    },
  { icon: Radio,      label: 'Signal',    value: '98.6%',   color: 'text-indigo-400' },
  { icon: Cpu,        label: 'AI Tasks',  value: '3,847',   color: 'text-emerald-400'},
];

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'hr' ? '/hr' : '/employee');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'hr') setForm({ email: 'hr@company.com',   password: 'password123' });
    else               setForm({ email: 'alex@company.com', password: 'password123' });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020817]">

      {/* ── LEFT — 3D Drone Panel ─────────────────────────────────────────── */}
      <div className="relative lg:flex-1 h-64 lg:h-auto overflow-hidden">

        {/* Deep space gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0c1a3a] to-[#0a0f2e]" />

        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <DroneScene />
          </Suspense>
        </div>

        {/* Overlay gradient so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#020817]/30 pointer-events-none" />

        {/* Branding top-left */}
        <div className="absolute top-6 left-6 flex items-center gap-2.5 z-10">
          <RamaAstraLogo height={36} />
        </div>

        {/* Headline bottom-left */}
        <div className="absolute bottom-8 left-6 right-6 z-10 hidden lg:block">
          <h2 className="text-white text-3xl font-bold leading-tight mb-2">
            Mission Control<br />
            <span className="text-sky-400">at your fingertips.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xs">
            Manage drone operations, assign tasks and track performance — all in one dashboard.
          </p>

          {/* Live stat badges */}
          <div className="flex gap-3 mt-5 flex-wrap">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label}
                className="flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-xl px-3 py-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <div>
                  <p className="text-white text-xs font-semibold leading-none">{value}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scanline overlay for sci-fi feel */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      </div>

      {/* ── RIGHT — Login Form ────────────────────────────────────────────── */}
      <div className="flex items-center justify-center lg:w-[440px] xl:w-[480px] shrink-0 p-6 lg:p-12 bg-[#020817]">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center mb-8 lg:hidden">
            <RamaAstraLogo height={28} />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">Access your mission dashboard</p>

          {/* Demo quick-fill */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo('hr')}
              className="flex-1 text-xs py-2 px-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors font-medium">
              Demo HR Admin
            </button>
            <button onClick={() => fillDemo('employee')}
              className="flex-1 text-xs py-2 px-3 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 hover:bg-sky-500/20 transition-colors font-medium">
              Demo Employee
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password" required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-sky-500/25 mt-2"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />}
              {loading ? 'Authenticating...' : 'Launch Dashboard'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-500">
            New to TaskFlow?{' '}
            <Link to="/signup" className="text-sky-400 font-medium hover:text-sky-300 transition-colors">
              Create account
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-slate-700 mt-8">
            © 2025 TaskFlow Aerospace · All systems nominal
          </p>
        </div>
      </div>
    </div>
  );
}
