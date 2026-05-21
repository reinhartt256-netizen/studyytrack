import React from 'react';
import { User } from '../types';
import { 
  ShieldCheck, User as UserIcon, Heart, BookOpen, 
  CheckCircle, BarChart3, Cloud, Layout, Cpu, Globe, ArrowRight, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import heroImage from '../assets/images/dashboard_hero_1779363123427.png';

interface LandingHeroProps {
  availableUsers: User[];
  onSelectUser: (user: User) => void;
  onEnterDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  availableUsers,
  onSelectUser,
  onEnterDemo
}) => {
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
            <a href="#masalah" className="hover:text-blue-600 transitions">Analisis Masalah</a>
            <a href="#fitur" className="hover:text-blue-600 transitions">Fitur SaaS</a>
            <a href="#keunggulan" className="hover:text-blue-600 transitions">Keunggulan Cloud</a>
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
        <div className="lg:col-span-7 space-y-6">
          <span className="bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
            Transformasi Digital Pendidikan
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-tight">
            Pantau Progres Belajar Siswa Secara <span className="text-blue-600">Digital & Terpusat</span>
          </h1>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            StudyyTrack adalah platform Software as a Service (SaaS) modern yang menghubungkan 
            Guru, Siswa, dan Orang Tua dalam satu ekosistem pembelajaran transparan. Hindari dokumen manual 
            dan catat nilai, tugas, serta kehadiran secara real-time.
          </p>

          <div className="pt-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pilih Simulator Akses Masuk:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {availableUsers.map((user) => {
                let Icon = UserIcon;
                let hoverColor = "hover:border-blue-500 hover:bg-blue-50/40";
                let textColor = "text-blue-600";
                
                if (user.role === 'guru') {
                  Icon = ShieldCheck;
                  hoverColor = "hover:border-emerald-500 hover:bg-emerald-50/40";
                  textColor = "text-emerald-600";
                } else if (user.role === 'orangtua') {
                  Icon = Heart;
                  hoverColor = "hover:border-rose-500 hover:bg-rose-50/40";
                  textColor = "text-rose-600";
                }

                return (
                  <button
                    key={user.id}
                    id={`landing-login-${user.id}`}
                    onClick={() => onSelectUser(user)}
                    className={`bg-white/60 backdrop-blur-sm border border-white/60 p-4 rounded-3xl flex flex-col items-start gap-2 text-left cursor-pointer transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-md hover:scale-[1.02] ${hoverColor}`}
                  >
                    <div className={`p-2 rounded-xl bg-slate-50 ${textColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-extrabold text-slate-400">{user.role}</span>
                      <strong className="block text-xs text-slate-700 truncate w-full">{user.name.split(',')[0]}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hero image and visuals */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="absolute -inset-2 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-[2rem] opacity-20 blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-md p-4 rounded-[2rem] border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.04)] max-w-sm md:max-w-md">
            <img
              src={heroImage}
              alt="Dashboard StudyyTrack"
              referrerPolicy="no-referrer"
              className="rounded-2xl shadow-inner w-full h-auto object-cover border border-white/40"
            />
            {/* Soft decorative float card */}
            <div className="absolute -bottom-4 -left-4 bg-blue-600/85 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-[0_8px_32px_rgba(37,99,235,0.25)] border border-blue-500/30 space-y-1 max-w-[200px]">
              <span className="text-[10px] bg-blue-500 text-blue-100 px-2 py-0.5 rounded font-bold uppercase">Sistem SaaS</span>
              <p className="text-xs font-bold leading-normal">Database Terpusat Aktif Secara Instan</p>
            </div>
          </div>
        </div>
      </section>

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
      <section id="fitur" className="py-16 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Modul MVP StudyyTrack</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Fitur Utama Platform SaaS</h2>
          <p className="text-slate-500 text-xs">Pencegahan hambatan belajar yang dirancang khusus untuk efisiensi digitalisasi institusi Anda.</p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:bg-white/80 hover:scale-[1.02] transition-all duration-300 space-y-3">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-12 h-12 flex items-center justify-center border border-blue-100">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Dashboard Multi-Peran</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tampilan dasbor yang disesuaikan secara khusus bagi Guru (korektor & absensi), Siswa (melihat tugas & kirim berkas), serta Orang Tua (laporan transparan).
            </p>
          </div>
 
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:bg-white/80 hover:scale-[1.02] transition-all duration-300 space-y-3">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-12 h-12 flex items-center justify-center border border-emerald-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Manajemen Kelas & Tugas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Guru berwewenang secara langsung membuat kelas digital baru, mendistribusikan penugasan beserta tenggat waktu, dan melakukan koreksi penilaian digital.
            </p>
          </div>
 
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:bg-white/80 hover:scale-[1.02] transition-all duration-300 space-y-3">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl w-12 h-12 flex items-center justify-center border border-indigo-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Sistem Absensi & Notifikasi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pencatatan presensi digital harian yang informasinya langsung disalurkan menjadi notifikasi instan bagi wali murid pada saat ada ketidakhadiran.
            </p>
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
