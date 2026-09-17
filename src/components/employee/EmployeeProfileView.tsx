import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Briefcase,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import { Employee, User as UserType } from '../../types.ts';
import { api } from '../../services/api.ts';

interface EmployeeProfileViewProps {
  currentUser: UserType | null;
}

export const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({ currentUser }) => {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getMyProfile();
      setProfile(data);
      setPhone(data.phone || '');
      setAddress(data.address || '');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.updateMyProfile({ phone, address });
      setProfile(res.employee);
      setFeedback({ type: 'success', message: 'Contact details updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading your profile information...</p>
      </div>
    );
  }

  return (
    <div id="employee-profile-page" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0">
            {profile?.first_name?.charAt(0) || currentUser?.name?.charAt(0) || 'E'}
            {profile?.last_name?.charAt(0) || ''}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-slate-800">
                {profile ? `${profile.first_name} ${profile.last_name}` : currentUser?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {profile?.status || 'Active'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                {profile?.employee_id || currentUser?.employee_id || 'EMP001'}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-600">
              {profile?.designation || currentUser?.designation || 'Lead Architect'}
            </p>

            <p className="text-xs text-slate-400">
              Department: <span className="font-semibold text-slate-600">{profile?.department_name || currentUser?.department || 'Engineering'}</span> • Joined: <span className="font-semibold text-slate-600">{profile?.joining_date || '2023-01-15'}</span>
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Grid of details: Official (Read Only) & Editable (Contact) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Official Employment Details (Read Only) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800">Employment Details (Official)</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Employee Code</span>
              <span className="font-mono font-bold text-slate-800">{profile?.employee_id || 'EMP001'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Department</span>
              <span className="font-semibold text-slate-800">{profile?.department_name || 'Engineering'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Designation</span>
              <span className="font-semibold text-slate-800">{profile?.designation}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Official Email</span>
              <span className="font-semibold text-slate-800">{profile?.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Employment Type</span>
              <span className="font-semibold text-slate-800">{profile?.employment_type || 'Full-Time'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Date of Joining</span>
              <span className="font-semibold text-slate-800">{profile?.joining_date}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Gender</span>
              <span className="font-semibold text-slate-800">{profile?.gender || 'Male'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500">
            Note: Official designation, salary grade, and department assignments can only be modified by the HR Administration team.
          </div>
        </div>

        {/* Editable Personal Contact Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">Personal Contact Information</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Residential Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Personal Information'}</span>
            </button>
          </form>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/50 text-[11px] text-emerald-800">
            Employees have self-service authorization to keep their active phone number and residential address updated for official communication.
          </div>
        </div>
      </div>
    </div>
  );
};
