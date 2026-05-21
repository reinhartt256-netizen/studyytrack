import React from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, User as UserIcon, Heart, RefreshCw } from 'lucide-react';

interface RoleSelectorProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  availableUsers: User[];
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentUser,
  onUserChange,
  availableUsers,
  isDemoMode,
  setIsDemoMode
}) => {
  return (
    <div id="role-selector-container" className="bg-white/75 backdrop-blur-md text-slate-800 py-3 px-4 border-b border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.04)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600/10 text-blue-700 p-1.5 rounded-lg font-extrabold text-lg tracking-wider border border-blue-200/40 flex items-center justify-center">
            ST
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Studyy<span className="font-medium text-blue-600">Track</span></span>
            <span className="ml-2 text-xs bg-blue-100/80 border border-blue-200/60 px-2 py-0.5 rounded-full text-blue-700 font-medium">SaaS Portal</span>
          </div>
        </div>

        {/* Dynamic Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:inline">
            Akses Cepat Simulator Role:
          </div>
          
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
            {availableUsers.map((user) => {
              const isActive = currentUser.id === user.id;
              let Icon = UserIcon;
              if (user.role === 'guru') Icon = ShieldCheck;
              if (user.role === 'orangtua') Icon = Heart;

              return (
                <button
                  key={user.id}
                  id={`role-btn-${user.id}`}
                  onClick={() => onUserChange(user)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-700 border border-blue-500/20 shadow-[0_4px_12px_rgba(37,99,235,0.1)] font-bold scale-[1.02]'
                      : 'hover:bg-slate-200/40 border border-transparent text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{user.name.split(',')[0]}</span>
                  <span className="text-[10px] opacity-75 sm:ml-0.5 capitalize">({user.role === 'guru' ? 'Guru' : user.role === 'siswa' ? 'Siswa' : 'Orang Tua'})</span>
                </button>
              );
            })}
          </div>

          <button
            id="back-to-landing-btn"
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 animate-spin-slow" />
            <span>{isDemoMode ? 'Lihat Landing Page' : 'Masuk Dashboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
