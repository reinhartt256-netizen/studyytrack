import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, User as UserIcon, Heart, Settings, X, CheckCircle } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="emulator-floating-widget" className="fixed bottom-5 right-5 z-55">
      {/* Closed State / Floating Action Button */}
      {!isOpen ? (
        <button
          id="btn-emulator-open"
          onClick={() => setIsOpen(true)}
          className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition-all transform hover:scale-105 flex items-center gap-2 font-bold cursor-pointer border border-indigo-400/20"
        >
          <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[10px] tracking-wider uppercase pr-1 font-black">⚙️ Emulator Peran</span>
          <span className="bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Demo Mode</span>
        </button>
      ) : (
        /* Open Panel */
        <div 
          id="panel-emulator-modal"
          className="bg-white/95 backdrop-blur-md border border-slate-200/80 w-[330px] rounded-3xl p-5 shadow-[0_20px_50px_rgba(51,65,85,0.15)] text-left space-y-4 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <div>
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">Simulator Multi-Peran</h4>
                <p className="text-[9px] text-slate-400 font-semibold leading-none">Uji sinkronisasi portal belajar</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current User Card */}
          <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Sesi Terdaftar Saat Ini:</span>
            <div className="flex items-center gap-2.5">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/40"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase text-white ${
                    currentUser.role === 'guru' ? 'bg-blue-600' : currentUser.role === 'siswa' ? 'bg-indigo-600' : 'bg-rose-600'
                  }`}>
                    {currentUser.role === 'guru' ? (currentUser.academicTitle || 'Guru/Dosen') : currentUser.role === 'siswa' ? 'Siswa' : 'Orang Tua'}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate max-w-[130px] font-mono">{currentUser.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Uji sebagai Pengguna Lain:</span>
            <div className="max-h-[170px] overflow-y-auto space-y-1.5 pr-1">
              {availableUsers.map((user) => {
                const isActive = currentUser.id === user.id;
                let Icon = UserIcon;
                let roleLabel = 'Siswa';
                let styleClass = 'hover:bg-slate-100 border-slate-150 text-slate-700';

                if (user.role === 'guru') {
                  Icon = ShieldCheck;
                  roleLabel = user.academicTitle || 'Guru/Dosen';
                  if (isActive) styleClass = 'bg-blue-50 border-blue-200 text-blue-900 font-extrabold';
                } else if (user.role === 'siswa') {
                  roleLabel = 'Siswa';
                  if (isActive) styleClass = 'bg-indigo-50 border-indigo-200 text-indigo-900 font-extrabold';
                } else if (user.role === 'orangtua') {
                  Icon = Heart;
                  roleLabel = 'Orang Tua';
                  if (isActive) styleClass = 'bg-rose-50 border-rose-200 text-rose-900 font-extrabold';
                }

                return (
                  <button
                    key={user.id}
                    id={`emulator-btn-${user.id}`}
                    onClick={() => {
                      onUserChange(user);
                    }}
                    className={`w-full border rounded-xl p-2 flex items-center justify-between text-left transition-all text-xs cursor-pointer ${styleClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-7 h-7 rounded-full object-cover shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="block font-bold text-[10px] truncate leading-tight text-slate-800">{user.name}</span>
                        <span className="block text-[8px] font-bold text-slate-400 mt-0.5 truncate uppercase">
                          {roleLabel} ({user.className || user.institution || 'SaaS'})
                        </span>
                      </div>
                    </div>
                    {isActive && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Close */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setIsDemoMode(false)}
              className="text-[9px] text-rose-600 hover:text-white uppercase font-black tracking-wider px-3 py-1.5 rounded-lg border border-rose-150 hover:bg-rose-600 hover:border-transparent transition-all cursor-pointer"
            >
              Keluar Sesi
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] uppercase font-black tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
