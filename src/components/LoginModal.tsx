import React, { useState } from 'react';
import { Shield, UserCheck, KeyRound, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { User } from '../types.ts';
import { api } from '../services/api.ts';

interface LoginModalProps {
  onLoginSuccess: (user: User, token: string) => void;
  isOpen: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, isOpen }) => {
  const [email, setEmail] = useState('admin@ems.demo');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'Admin' | 'Employee') => {
    if (role === 'Admin') {
      setEmail('admin@ems.demo');
      setPassword('admin123');
      setLoading(true);
      api.login('admin@ems.demo', 'admin123')
        .then((data) => onLoginSuccess(data.user, data.token))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setEmail('employee@ems.demo');
      setPassword('employee123');
      setLoading(true);
      api.login('employee@ems.demo', 'employee123')
        .then((data) => onLoginSuccess(data.user, data.token))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="login-modal-card" className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-sm">
              EMS
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Employee Management System</h2>
              <p className="text-xs text-blue-200">College Academic Activity Demonstration</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Full-stack EMS portal powered by PostgreSQL database, Express REST APIs, and responsive React frontend.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {error && (
            <div id="login-error-alert" className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Fast Login Buttons */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-600 mb-2.5">Quick Demo Access (One Click):</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="quick-demo-admin-btn"
                onClick={() => handleQuickLogin('Admin')}
                disabled={loading}
                className="flex flex-col items-start p-3 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-blue-900 flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1 text-blue-600" /> Admin
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[11px] text-blue-700">Full control & CRUD</span>
              </button>

              <button
                type="button"
                id="quick-demo-employee-btn"
                onClick={() => handleQuickLogin('Employee')}
                disabled={loading}
                className="flex flex-col items-start p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 hover:border-emerald-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-emerald-900 flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Employee
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[11px] text-emerald-700">Self-service & leaves</span>
              </button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white px-2">
              Or sign in with demo credentials
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-email-input">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ems.demo"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-password-input">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating with PostgreSQL...</span>
              ) : (
                <>
                  <span>Sign In to EMS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Academic disclaimer */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> College Demonstration Note
            </p>
            <p>
              All employee records, salary figures, and attendance logs are fictional dummy demonstration data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
