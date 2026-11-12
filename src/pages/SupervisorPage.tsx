import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  Plus,
  Search,
  Lock,
  Mail,
  GraduationCap,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { COLLEGE_NAME } from '../data/mockData';
import { SUPERVISOR_EMAILS } from '../types';

export const SupervisorPage: React.FC = () => {
  const {
    allUsers,
    currentUser,
    isSupervisor,
    communities,
    addCommunity,
    setSelectedProfileUser,
    isFirestoreLive,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [isAddCommunityModalOpen, setIsAddCommunityModalOpen] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommIcon, setNewCommIcon] = useState('Sparkles');
  const [newCommCover, setNewCommCover] = useState('');

  if (!isSupervisor) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900">
          Supervisor Access Restricted
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Supervisor Portal is exclusively reserved for designated administrative coordinators at {COLLEGE_NAME}.
        </p>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-left space-y-1">
          <div className="font-semibold text-slate-700">Authorized Supervisor Emails:</div>
          <ul className="list-disc pl-4 space-y-0.5">
            {SUPERVISOR_EMAILS.map((email) => (
              <li key={email} className="font-mono">{email}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter((u) => {
    const q = searchFilter.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rollNumber.includes(q) ||
      u.course.toLowerCase().includes(q) ||
      (u.subCourse && u.subCourse.toLowerCase().includes(q))
    );
  });

  const handleAddCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim() || !newCommDesc.trim()) return;

    addCommunity(
      newCommName.trim(),
      newCommDesc.trim(),
      newCommIcon,
      newCommCover.trim() ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
      newCommCategory.trim() || 'Campus Club'
    );

    setNewCommName('');
    setNewCommCategory('');
    setNewCommDesc('');
    setNewCommCover('');
    setIsAddCommunityModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950 via-rose-950 to-stone-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-rose-200 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>Authorized Supervisor Mode: {currentUser.email}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight">
            Supervisor Administrative Portal
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Monitor verified registrations across {COLLEGE_NAME}, manage official club communities, and ensure student safety.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsAddCommunityModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-950/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Official Community</span>
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-stone-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-300" />
              <span>{allUsers.length} Registered Students</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-stone-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>{communities.length} Active Clubs</span>
            </div>
          </div>
        </div>

        {/* Decorative badge in background */}
        <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-900 shadow-xs">
        <Lock className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-red-950 font-bold">Privacy Guarantee: </strong>
          Supervisors can view registration rosters and verification records to ensure safety. In strict accordance with platform privacy regulations, <strong>supervisors cannot view students' personal 1-on-1 direct messages</strong>.
        </div>
      </div>

      {/* Registered Students Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-700" />
                <span>Registered Students Directory ({filteredUsers.length})</span>
              </h2>
              {isFirestoreLive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Firestore Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Connecting to Cloud DB...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unique 6-digit roll numbers verified starting with 2. Real names & emails are held confidentially.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by username, roll no, course..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
          </div>
        </div>

        {/* Table of Registered Users */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Course & Specialisation</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4">Confidential Email</th>
                  <th className="py-3.5 px-4">Societies</th>
                  <th className="py-3.5 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={user.avatarUrl}
                          username={user.username}
                          useStandardAvatar={user.useStandardAvatar}
                          size="sm"
                          isVerified
                        />
                        <div>
                          <div className="font-bold text-slate-900 font-mono">
                            @{user.username}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {user.name} (Real Name)
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono px-2 py-0.5 rounded-md bg-red-50 text-red-800 font-bold border border-red-200 text-[11px]">
                        {user.rollNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{user.course}</div>
                      {user.subCourse && (
                        <div className="text-[10px] text-slate-500">{user.subCourse}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium">{user.year}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-600 text-[11px] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{user.email}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.societies && user.societies.length > 0 ? (
                          user.societies.map((soc) => (
                            <span
                              key={soc}
                              className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] border border-rose-200 truncate"
                            >
                              {soc}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedProfileUser(user)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 hover:bg-red-100 border border-red-200 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        View Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Community Modal (Supervisors only) */}
      {isAddCommunityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-700" />
                <h3 className="font-bold font-serif text-lg text-slate-900">
                  Add Official College Community
                </h3>
              </div>
              <button
                onClick={() => setIsAddCommunityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCommunitySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Community / Club Name *
                </label>
                <input
                  type="text"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="e.g. Photography Guild or Robotics Club"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category / Classification
                </label>
                <input
                  type="text"
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value)}
                  placeholder="e.g. Visual Arts & Media"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="Describe the club purpose, activities, and welcome message..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newCommCover}
                  onChange={(e) => setNewCommCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCommunityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-bold shadow-md shadow-red-950/20 cursor-pointer"
                >
                  Publish Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
