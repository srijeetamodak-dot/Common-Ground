import React from 'react';
import { Heart, GraduationCap, Sparkles, Building2, MessageSquare } from 'lucide-react';
import { COLLEGE_NAME } from '../data/mockData';

export const FooterNotice: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white py-10 px-4 sm:px-6 lg:px-8 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="font-serif text-lg font-bold text-slate-900">Common Ground</span>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200">
              JMC DU Platform
            </span>
          </div>
          <p className="text-slate-500 max-w-md">
            Exclusive to {COLLEGE_NAME}. Helping students form genuine friendships through shared
            clubs, events, offline campus meetups, and safe 1-on-1 chats.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 text-red-800">
            <GraduationCap className="w-4 h-4 text-red-700" />
            <span>6-Digit Roll Verified</span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-800">
            <Sparkles className="w-4 h-4 text-rose-700" />
            <span>100% Free Forever</span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700">
            <MessageSquare className="w-4 h-4 text-red-600" />
            <span>Safe 1-on-1 Chat (No Calls)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800">
            <Building2 className="w-4 h-4 text-amber-700" />
            <span>31 Campus Societies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
