import React, { useState } from 'react';
import { User, UserRole, DatabaseState, Task, Submission } from '../types';
import { 
  ShieldCheck, User as UserIcon, Heart, BookOpen, 
  CheckCircle, BarChart3, Cloud, Layout, Cpu, Globe, ArrowRight, Check,
  Lock, Mail, UserPlus, LogIn, AlertCircle, Eye, EyeOff,
  Layers, Clock, Bell, MessageSquare, Award, UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import heroImage from '../assets/images/dashboard_hero_1779363123427.png';

interface LandingHeroProps {
  availableUsers: User[];
  onSelectUser: (user: User) => void;
  onRegisterUser: (user: User) => void;
  onEnterDemo: () => void;
  db: DatabaseState;
  onUpdateDb: (updater: (prev: DatabaseState) => DatabaseState) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  availableUsers,
  onSelectUser,
  onRegisterUser,
  onEnterDemo,
  db,
  onUpdateDb
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedFeatureRole, setSelectedFeatureRole] = useState<'guru' | 'siswa' | 'orangtua'>('guru');
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('guru');
  const [regClass, setRegClass] = useState('Kelas 10-A IPA');
  const [regLinkedStudentId, setRegLinkedStudentId] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const students = availableUsers.filter(u => u.role === 'siswa');

  // Interactive Live Homework Submission States (Connected to Firestore)
  const [subStudentId, setSubStudentId] = useState('u-siswa-1');
  const [subTaskId, setSubTaskId] = useState('t1');
  const [subText, setSubText] = useState('Berdasarkan pengamatan preparat mikroskop di lab sekolah, sel gabus (Quercus suber) tampak sebagai struktur ruang-ruang kosong heksagonal...');
  const [subFileName, setSubFileName] = useState('Laporan_Praktikum_Sel_Rian.pdf');
  const [subSuccess, setSubSuccess] = useState(false);

  // Load default linked student id
  useState(() => {
    if (students.length > 0) {
      setRegLinkedStudentId(students[0].id);
    }
  });

  const handleSubmitLandingTask = (e: React.FormEvent) => {
    e.preventDefault();
    const student = db.users.find(u => u.id === subStudentId);
    const task = db.tasks.find(t => t.id === subTaskId) || db.tasks[0];
    if (!student || !task) return;

    const newSubmission: Submission = {
      id: `s-landing-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      studentId: student.id,
      studentName: student.name,
      submittedAt: new Date().toISOString(),
      content: subText,
      fileName: subFileName || `${student.name.toLowerCase().replace(' ', '_')}_tugas.pdf`,
      status: 'submitted'
    };

    onUpdateDb(prev => ({
      ...prev,
      submissions: [newSubmission, ...prev.submissions]
    }));

    setSubSuccess(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailClean = loginEmail.trim().toLowerCase();
    if (!emailClean || !loginPassword) {
      setLoginError('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    const user = availableUsers.find(u => u.email.toLowerCase() === emailClean);
    if (!user) {
      setLoginError('Email ini belum terdaftar di sistem.');
      return;
    }

    const expectedPassword = user.password || 'password123';
    if (loginPassword !== expectedPassword) {
      setLoginError('Kata sandi salah. Harap coba lagi.');
      return;
    }

    onSelectUser(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) {
      setRegError('Nama Lengkap wajib diisi.');
      return;
    }
    const emailClean = regEmail.trim().toLowerCase();
    if (!emailClean) {
      setRegError('Alamat email wajib diisi.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    const emailExists = availableUsers.some(u => u.email.toLowerCase() === emailClean);
    if (emailExists) {
      setRegError('Alamat email sudah terdaftar. Silakan login.');
      return;
    }

    // High quality placeholder avatar
    const teacherAvatars = [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face"
    ];
    const studentAvatars = [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
    ];
    const parentAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    ];

    let chosenAvatar = studentAvatars[0];
    if (regRole === 'guru') {
      chosenAvatar = teacherAvatars[Math.floor(Math.random() * teacherAvatars.length)];
    } else if (regRole === 'siswa') {
      chosenAvatar = studentAvatars[Math.floor(Math.random() * studentAvatars.length)];
    } else if (regRole === 'orangtua') {
      chosenAvatar = parentAvatars[Math.floor(Math.random() * parentAvatars.length)];
    }

    const uniqueId = `u-${regRole}-${Date.now().toString().slice(-5)}`;
    const newUser: User = {
      id: uniqueId,
      name: regName.trim(),
      role: regRole,
      email: emailClean,
      avatar: chosenAvatar,
      password: regPassword,
      ...(regRole === 'siswa' ? { className: regClass.trim() || 'Kelas 10-A IPA' } : {}),
      ...(regRole === 'orangtua' ? { studentId: regLinkedStudentId } : {})
    };

    setRegSuccess('Akun berhasil dibuat! Menghubungkan ke dasbor...');
    setTimeout(() => {
      onRegisterUser(newUser);
    }, 1000);
  };

  const handleQuickAutofill = (user: User) => {
    setActiveTab('login');
    setLoginEmail(user.email);
    setLoginPassword(user.password || 'password123');
    setLoginError('');
  };

  return (
    <div id="landing-container" className="min-h-screen bg-transparent flex flex-col justify-between">
      {/* Navigation Header */}
      <nav className="bg-white/50 backdrop-blur-md border-b border-white/55 py-4 px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white font-extrabold p-2 rounded-xl text-lg tracking-wider">
              ST
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight">
              Studyy<span className="text-blue-600">Track</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#masalah" className="hover:text-blue-600 transitions animate-fade-in">Analisis Masalah</a>
            <a href="#fitur" className="hover:text-blue-600 transitions animate-fade-in">Fitur SaaS</a>
            <a href="#keunggulan" className="hover:text-blue-600 transitions animate-fade-in">Keunggulan Cloud</a>
          </div>

          <button
            id="nav-direct-demo"
            onClick={onEnterDemo}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>Buka Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
            Transformasi Digital Pendidikan
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            Pantau Progres Belajar Siswa Secara <span className="text-blue-600">Digital & Terpusat</span>
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed max-w-2xl font-medium">
            StudyyTrack adalah platform Software as a Service (SaaS) modern yang menghubungkan 
            Guru, Siswa, dan Orang Tua dalam satu ekosistem pembelajaran transparan. Hindari dokumen manual 
            dan catat nilai, tugas, serta kehadiran secara real-time.
          </p>

          <div className="space-y-4 pt-2">
            <div className="p-4 bg-blue-50/75 border border-blue-100/80 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs text-slate-800 font-bold">100% Digitalisasi Rapor & Absensi</strong>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Siswa dapat langsung mengumpulkan berkas/jawaban tugas secara cloud, sementara dewan guru memberi penilaian instan yang transparan dilihat orang tua.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Auth Card & Form Container */}
        <div className="lg:col-span-6">
          <div className="bg-white/80 backdrop-blur-md border border-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-[2rem] p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-12 -mt-12 -z-10"></div>
            
            {/* Tabs Header */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login' 
                    ? 'bg-white text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.02)]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Masuk Sistem (Log In)</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                  setRegSuccess('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register' 
                    ? 'bg-white text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.02)]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Buat Akun Awal (Sign Up)</span>
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-slate-800">Selamat Datang Kembali</h2>
                  <p className="text-[11px] text-slate-400">Masukkan email dan kata sandi Anda untuk mengakses dasbor akademik.</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="budi.hermawan@sekolah.sch.id"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-sans font-medium"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi (default: password123)"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-xs pl-9 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-sans font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.15)] flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Ke Dasbor</span>
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-slate-800">Daftarkan Akun Baru</h2>
                  <p className="text-[11px] text-slate-400">Buat identitas akun awal di ekosistem StudyyTrack untuk memulai simulasi belajar.</p>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold animate-pulse">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Nama Lengkap & Gelar</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="contoh: Prof. Andi Wijaya / Jessica Tan"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-sans font-medium"
                      />
                    </div>
                  </div>

                  {/* Two columns: Select Role & Specific field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Hak Akses Role</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-sans font-bold"
                      >
                        <option value="guru">Mata Pelajaran (Guru)</option>
                        <option value="siswa">Siswa Pembelajar (Siswa)</option>
                        <option value="orangtua">Wali Murid (Orang Tua)</option>
                      </select>
                    </div>

                    {/* Role dependent subfields */}
                    {regRole === 'siswa' && (
                      <div className="animate-fade-in">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Unit Kelas Belajar</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Kelas 10-A IPA"
                          value={regClass}
                          onChange={(e) => setRegClass(e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-sans font-medium"
                        />
                      </div>
                    )}

                    {regRole === 'orangtua' && (
                      <div className="animate-fade-in font-medium">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Tautkan Akun Anak</label>
                        <select
                          value={regLinkedStudentId}
                          onChange={(e) => setRegLinkedStudentId(e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-sans font-bold"
                        >
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.className})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {regRole === 'guru' && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center flex flex-col justify-center">
                        <span className="text-[10px] text-emerald-800 font-extrabold uppercase">SMA Negeri 1 Jakarta</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Institusi digital terdaftar</span>
                      </div>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans font-medium">Alamat Email Baru</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="contoh: user.baru@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-sans font-medium"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Buat Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 6 karakter"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-sans font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar & Masuk Otomatis</span>
                </button>
              </form>
            )}

            {/* Quick Access Simulator Shortcut inside Login Panel */}
            <div className="pt-4 border-t border-slate-100 font-medium">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 text-center">
                💡 ALUR SIMULATOR: Klik Akun Bawaan untuk Autofill
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {availableUsers.slice(0, 3).map((user) => {
                  let Icon = UserIcon;
                  let colorClass = "border-emerald-100/50 hover:border-emerald-400 text-emerald-700 bg-emerald-50/10";
                  
                  if (user.role === 'guru') {
                    Icon = ShieldCheck;
                    colorClass = "border-blue-100/50 hover:border-blue-400 text-blue-700 bg-blue-50/10";
                  } else if (user.role === 'orangtua') {
                    Icon = Heart;
                    colorClass = "border-rose-100/50 hover:border-rose-400 text-rose-700 bg-rose-50/10";
                  }

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickAutofill(user)}
                      className={`border rounded-2xl p-2.5 flex items-center gap-2 text-left transition-all duration-200 cursor-pointer hover:shadow-sm hover:scale-[1.02] ${colorClass}`}
                    >
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-7 h-7 rounded-full object-cover shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 transition-all">
                        <span className="block text-[8px] uppercase font-black opacity-60 tracking-wider transition-all">{user.role}</span>
                        <strong className="block text-[10px] tracking-tight truncate text-slate-800 transition-all leading-snug">{user.name.split(',')[0]}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Centered Dashboard Live Preview Banner */}
      <div className="max-w-4xl mx-auto px-6 pb-16 text-center animate-fade-in relative z-10">
        <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
          Pratinjau Antarmuka Digital StudyyTrack
        </span>
        <div className="relative bg-white/50 backdrop-blur-md p-3 rounded-[2rem] border border-white/60 shadow-[0_16px_50px_rgba(0,0,0,0.04)]">
          <img
            src={heroImage}
            alt="Dashboard StudyyTrack"
            referrerPolicy="no-referrer"
            className="rounded-2xl w-full h-auto object-cover border border-white/40 shadow-inner"
          />
          {/* Decorative Float Badge */}
          <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg border border-blue-500/30 text-left max-w-[220px]">
            <span className="text-[9px] bg-blue-500/80 px-2 py-0.5 rounded font-bold uppercase">Multi-Peran SaaS</span>
            <p className="text-xs font-bold leading-snug mt-1 text-white">Sinkronisasi data langsung antara Guru, Siswa, dan Wali Murid</p>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <section id="masalah" className="bg-white/40 backdrop-blur-md py-16 px-6 border-y border-white/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Latar Belakang & Analisis</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Menyelesaikan Kendala Pembelajaran Manual</h2>
            <p className="text-slate-500 text-xs md:text-sm">Banyak sekolah masih menggunakan memo fisik, spreadsheet terpisah, atau pelaporan konvensional sehingga wali murid sulit memantau perkembangan anak secara objektif.</p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-white/60 rounded-2xl bg-white/55 backdrop-blur-sm space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.04)] hover:scale-[1.01] transition-all duration-300">
              <span className="block text-xl font-bold text-blue-600">01</span>
              <h4 className="font-bold text-slate-800 text-sm">Pemantauan Terhambat</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Nilai, tugas, dan ketidakhadiran direkam di dokumen cetak atau sistem terpisah sehingga lambat diproses.</p>
            </div>
 
            <div className="p-5 border border-white/60 rounded-2xl bg-white/55 backdrop-blur-sm space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.04)] hover:scale-[1.01] transition-all duration-300">
              <span className="block text-xl font-bold text-blue-600">02</span>
              <h4 className="font-bold text-slate-800 text-sm">Komunikasi Minim</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Hubungan komunikasi akademik antara pengajar, murid, dan wali murid belum berlangsung optimal.</p>
            </div>
 
            <div className="p-5 border border-white/60 rounded-2xl bg-white/55 backdrop-blur-sm space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.04)] hover:scale-[1.01] transition-all duration-300">
              <span className="block text-xl font-bold text-blue-600">03</span>
              <h4 className="font-bold text-slate-800 text-sm">Kesulitan Mengelola Tugas</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Siswa tidak memiliki portal penyerahan representasi tugas tunggal yang rapi untuk diunggah kapan saja.</p>
            </div>
 
            <div className="p-5 border border-white/60 rounded-2xl bg-white/55 backdrop-blur-sm space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.04)] hover:scale-[1.01] transition-all duration-300">
              <span className="block text-xl font-bold text-blue-600">04</span>
              <h4 className="font-bold text-slate-800 text-sm">Absensi Tidak Terpantau</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Orang tua kesulitan mengetahui riwayat bolos atau ketidakhadiran siswa dengan segera.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Feature overview */}
      <section id="fitur" className="py-16 px-6 max-w-7xl mx-auto space-y-12 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Direktori Menu Fitur MVP</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Uji Coba Modul SaaS Secara Interaktif</h2>
          <p className="text-slate-500 text-xs text-balance">Klik tab peran di bawah untuk menyaring dan membaca kapabilitas menu platform digitalisasi sekolah yang dirancang khusus bagi setiap peran.</p>
        </div>

        {/* Dynamic Role Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto p-1.5 bg-slate-100/70 border border-slate-200/50 rounded-2xl sm:rounded-full">
          <button
            type="button"
            onClick={() => setSelectedFeatureRole('guru')}
            className={`flex-1 min-w-[140px] px-5 py-3 text-xs font-extrabold rounded-xl sm:rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 ${
              selectedFeatureRole === 'guru'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-600 hover:text-slate-900 bg-white/40 hover:bg-white/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pendidik & Guru</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFeatureRole('siswa')}
            className={`flex-1 min-w-[140px] px-5 py-3 text-xs font-extrabold rounded-xl sm:rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 ${
              selectedFeatureRole === 'siswa'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                : 'text-slate-600 hover:text-slate-900 bg-white/40 hover:bg-white/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Siswa Pembelajar</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFeatureRole('orangtua')}
            className={`flex-1 min-w-[140px] px-5 py-3 text-xs font-extrabold rounded-xl sm:rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 ${
              selectedFeatureRole === 'orangtua'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/10'
                : 'text-slate-600 hover:text-slate-900 bg-white/40 hover:bg-white/80'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Orang Tua / Wali</span>
          </button>
        </div>

        {/* Dynamic Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedFeatureRole === 'guru' && (
            <>
              {/* Feature 1 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-blue-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Guru - Penilaian
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Sistem Penilaian Rapor Efisien</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Dewan guru dapat meninjau kiriman jawaban dari siswa secara online, langsung memberikan skor penilaian numerik (0-100), serta menyisipkan pesan bimbingan belajar/feedback yang membangun.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>METODOLOGI: SaaS Standard</span>
                  <span className="text-blue-600">99.8% Transparansi</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-emerald-100">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Guru - Kehadiran
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Presensi Kehadiran Tanpa Berkas</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Satu ketukan responsif untuk merekam kehadiran siswa per hari. Status kehadiran (Hadir, Sakit, Izin, Alfa) langsung disalurkan saat itu juga ke sistem wali murid tanpa perantara kertas.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>INTEGRASI: Cloud Database</span>
                  <span className="text-emerald-600">Otomatis Sinkron</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-indigo-100">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Guru - Tugas
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Kelola File & Alarm Deadline</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Membuat topik mata pelajaran baru, menentukan deskripsi instruksi pengerjaan, serta menetapkan tanggal jatuh tempo pengerjaan yang ketat demi memicu kedisiplinan belajar.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>FORMAT: Multi-Tipe Berkas</span>
                  <span className="text-indigo-600">Reduksi Beban 60%</span>
                </div>
              </div>
            </>
          )}

          {selectedFeatureRole === 'siswa' && (
            <>
              {/* Feature 1 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-emerald-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Siswa - Unggah
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Pengumpulan Berkas Cloud Pintar</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Siswa tidak perlu membawa kertas fisik ke kelas. Cukup unggah jawaban berupa teks daring atau tautan berkas digital di dalam portal StudyyTrack kapan saja sebelum deadline tiba.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>METRICS: 100% Paperless</span>
                  <span className="text-emerald-600">Simpan Aman</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-amber-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Siswa - Pengingat
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Alarm Sisa Waktu Tugas</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sistem akan menyajikan indikator warna yang berubah dinamis saat mendekati jam pengerjaan berakhir. Meminimalisir keterlambatan pengumpulan tugas harian sekolah.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>ALERT SYSTEM: Alarm Batas</span>
                  <span className="text-amber-600">Turun Terlambat 85%</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-blue-100">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Siswa - Rapor
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Laporan Poin & Skor Mandiri</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Akses representatif untuk memantau nilai ulangan harian secara langsung, melihat persentase skor pengumpulan tugas, dan menganalisis perkembangan prestasi mandiri Anda.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>METODOLOGI: Grafik Nilai</span>
                  <span className="text-blue-600">Analitik Mandiri</span>
                </div>
              </div>
            </>
          )}

          {selectedFeatureRole === 'orangtua' && (
            <>
              {/* Feature 1 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-rose-100">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Wali - Sistem Push
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Pemberitahuan Transparan Instan</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sistem cloud akan memicu notifikasi real-time ke akun orang tua ketika anak terekam tidak masuk sekolah atau pada saat ada hasil korektor nilai ujian baru yang dikeluarkan guru.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>NOTIFIKASI: Pemicu Instan</span>
                  <span className="text-rose-600">Sinkronisasi 1 Detik</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-emerald-100">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    Modul Wali - Pantau Nilai
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Rapor Kinerja Komprehensif</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tidak perlu menunggu akhir semester untuk melihat raport. Orang tua dapat memantau pengerjaan tugas harian, nilai skor pelajaran terperinci, dan kritik membangun guru kapan saja.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>AKURASI: Real-time DB</span>
                  <span className="text-emerald-600">Aman & Rahasia</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-blue-100">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] bg-blue-100 text-blue-805 font-bold px-2 py-0.5 rounded-md">
                    Modul Wali - Komunikasi
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Konfirmasi Memo Sakit/Izin</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Orang tua memiliki tautan akses komprehensif ke pusat info untuk berkonsultasi mengenai bepergian, kondisi kesehatan siswa, serta feedback khusus dewan pendidik secara santun.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>SUPPORT: 24/7 Portal</span>
                  <span className="text-blue-600">Respons Tercepat</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* INTEGRATED ASSIGNMENT SUBMISSION INFO CENTER */}
        <div id="landing-assignment-submission" className="mt-16 bg-slate-50/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Sistem Pengumpulan Cloud (Firestore Active)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                Bagaimana Siswa Mengumpulkan Tugas Secara Digital?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Sistem StudyyTrack didesain untuk menghilangkan penyerahan berkas fisik secara manual. Siswa dapat mengakses seluruh penugasan aktif langsung di akun mereka, melengkapi jawaban, dan menyertakan lampiran berkas yang aman.
              </p>

              {/* Three detailed steps flow */}
              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Pilih Akun & Penugasan Baru</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Simulasikan pengiriman dari akun siswa mana pun ke tugas matapelajaran aktif di database.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Ketik Uraian & Klik Kirim</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Isi teks materi atau file lampiran, kemudian klik tombol kirim untuk mengalirkan ke Firestore.</p>
                  </div>
                </div>
              </div>

              {/* Live Submissions Tracker */}
              <div className="pt-4 border-t border-slate-200 space-y-3 text-left">
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest block">
                  📡 Transmisi Firestore Teranyar (Real-time Tracker)
                </span>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {db.submissions.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Belum ada pengiriman tugas di database cloud.</p>
                  ) : (
                    db.submissions.slice().reverse().slice(0, 3).map(sub => (
                      <div key={sub.id} className="p-2.5 bg-white/60 border border-slate-200/55 rounded-xl flex items-center justify-between text-[11px] hover:bg-white/80 transition-all font-sans">
                        <div className="truncate max-w-[70%]">
                          <p className="font-extrabold text-slate-800 truncate">{sub.studentName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{sub.taskTitle}</p>
                          <p className="text-[9px] text-slate-400 truncate mt-0.5">"{sub.content}"</p>
                        </div>
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                          sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700 animate-pulse'
                        }`}>
                          {sub.status === 'graded' ? `Skor: ${sub.score}` : 'Pending'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Mockup Panel representing the Student Upload Interface */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">studyytrack-database-submission.sh</span>
                </div>
                <span className="text-[9px] font-semibold uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  ● Live Cloud Database
                </span>
              </div>

              {/* Dynamic Interactive Submission Form */}
              <form onSubmit={handleSubmitLandingTask} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {/* SELECT STUDENT */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Simulasikan Sebagai:</label>
                    <select
                      value={subStudentId}
                      onChange={(e) => setSubStudentId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                    >
                      {students.map(std => (
                        <option key={std.id} value={std.id}>{std.name} ({std.className || 'Umum'})</option>
                      ))}
                    </select>
                  </div>

                  {/* SELECT TASK */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Pilih Penugasan:</label>
                    <select
                      value={subTaskId}
                      onChange={(e) => setSubTaskId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                    >
                      {db.tasks.map(tsk => (
                        <option key={tsk.id} value={tsk.id}>{tsk.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Task Details */}
                {(() => {
                  const selectedTask = db.tasks.find(t => t.id === subTaskId) || db.tasks[0];
                  if (!selectedTask) return null;
                  return (
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-150 space-y-1.5 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Kelas: {selectedTask.className}
                        </span>
                        <span className="text-[9px] text-rose-600 bg-rose-50 font-black px-2 py-0.5 rounded-full">
                          Tenggat: {selectedTask.dueDate}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-800">{selectedTask.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        {selectedTask.description}
                      </p>
                    </div>
                  );
                })()}

                {/* Answer Content */}
                <div className="space-y-2 text-left">
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Isi Lembar Jawaban Tertulis</label>
                  <textarea
                    rows={3}
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="Sebutkan ringkasan jawaban akademik, hasil lab, atau ulasan teoritis atau argumentasi Anda secara santun..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all leading-normal text-slate-700 font-sans"
                    required
                  />

                  {/* Simulated Upload attachment name input */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Nama File Hasil Scan/PDF (Opsional)</label>
                    <input
                      type="text"
                      value={subFileName}
                      onChange={(e) => setSubFileName(e.target.value)}
                      placeholder="Contoh: hasil_lab_sel.pdf"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-3 px-5 rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Kirim Tugas ke Database Cloud (Firestore)</span>
                </button>

                {subSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold rounded-xl flex items-center gap-1.5 animate-pulse text-left">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sukses! Jawaban telah terkirim ke Firestore. Silakan masuk sebagai "Guru" (Budi Santoso) di Portal Demonstrasi untuk langsung mengoreksi & menilai tugas ini!</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Architecture Info */}
      <section id="keunggulan" className="bg-slate-900/90 backdrop-blur-md text-white py-14 px-6 border-y border-slate-800 shadow-[0_16px_50px_rgba(15,23,42,0.1)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 border border-blue-500/20">
              <Cloud className="w-3.5 h-3.5" />
              <span>Modern Infrastructure Arch</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black">Model Deployment SaaS & Cloud</h3>
            <p className="text-xs text-blue-200/80 leading-relaxed max-w-md font-medium">
              Sistem SaaS digital modern ini ditenagai infrastruktur cloud performa tinggi. Institusi pendidikan tidak perlu membangun server sendiri, cukup berlangganan secara murah dan aman.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.08] shadow-inner">
              <strong className="block text-white text-sm">PostgreSQL DB</strong>
              <p className="text-[11px] text-blue-200/70 mt-1 font-sans">Penyimpanan relational terstruktur yang sangat aman bagi rapor, nilai, dan absensi.</p>
            </div>
            <div className="p-4 bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.08] shadow-inner">
              <strong className="block text-white text-sm">Node.js API</strong>
              <p className="text-[11px] text-blue-200/70 mt-1 font-sans">Interaksi responsif ber-kependaman rendah (low latency) untuk perolehan data seketika.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 StudyyTrack SaaS Corporate. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Syarat Ketentuan</a>
            <p className="text-blue-500 font-bold">Proyek Simulator Dashboard Sekolah</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
