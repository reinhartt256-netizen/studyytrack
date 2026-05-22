import React from 'react';
import { DatabaseState, User, Notification, Submission, Attendance } from '../types';
import { 
  Heart, Calendar, Award, Star, Bell, Activity, CheckCircle, 
  MessageSquare, UserCheck, ChevronRight, TrendingUp, HelpCircle, LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface ParentDashboardProps {
  db: DatabaseState;
  currentUser: User;
  onUpdateDb: (updater: (prev: DatabaseState) => DatabaseState) => void;
  onLogout?: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  db,
  currentUser,
  onUpdateDb,
  onLogout
}) => {
  // Resolve linked student
  const student = db.users.find(u => u.id === currentUser.studentId);
  const studentId = student?.id || "u-siswa-1";
  const studentName = student?.name || "Rian Aditya";

  // Data queries for target student
  const studentSubmissions = db.submissions.filter(s => s.studentId === studentId);
  const studentAttendance = db.attendance.filter(a => a.studentId === studentId);
  const parentNotifications = db.notifications.filter(n => n.userId === currentUser.id);

  // Stats computation
  const totalTasksCount = db.tasks.length;
  const submittedCount = studentSubmissions.length;
  const remainingCount = Math.max(0, totalTasksCount - submittedCount);

  const gradedList = studentSubmissions.filter(s => s.status === 'graded' && s.score !== undefined);
  const totalScore = gradedList.reduce((sum, curr) => sum + (curr.score || 0), 0);
  const averageValue = gradedList.length > 0 ? totalScore / gradedList.length : 0;
  const avgGrade = gradedList.length > 0 ? averageValue.toFixed(0) : 'N/A';

  // Attendance metrics
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(a => a.status === 'hadir').length;
  const sickDays = studentAttendance.filter(a => a.status === 'sakit').length;
  const permissionDays = studentAttendance.filter(a => a.status === 'izin').length;
  const alfaDays = studentAttendance.filter(a => a.status === 'alfa').length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : '100';

  const handleDismissNotification = (notifId: string) => {
    onUpdateDb(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notifId)
    }));
  };

  return (
    <div id="parent-dashboard" className="min-h-screen bg-transparent">
      {/* Header bar and Profile widget */}
      <div className="bg-white/45 backdrop-blur-md border-b border-white/50 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-sm border-2 border-white/60">
              S
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Dashboard Orang Tua / Wali Murid</p>
              <h1 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Wali dari: <strong className="text-blue-700 font-bold">{studentName} ({student?.className || 'Kelas 10-A IPA'})</strong></p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl px-4 py-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">Terhubung Real-Time</span>
            </div>

            {onLogout && (
              <button
                id="btn-parent-logout"
                onClick={onLogout}
                className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs px-5 py-3 rounded-xl shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Child performance summary grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Academic indicator */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/65 shadow-sm flex items-center gap-4 hover:scale-[1.005] transition-all duration-300">
            <div className="bg-blue-600/10 text-blue-700 p-4 rounded-xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Nilai</span>
              <span className="text-2xl font-black text-blue-700">{avgGrade} <span className="text-xs text-slate-400">/ 100</span></span>
              <span className="block text-xs text-slate-500 mt-0.5 font-medium">Dari {gradedList.length} tugas dinilai</span>
            </div>
          </div>

          {/* Card 2: Attendance indicator */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/65 shadow-sm flex items-center gap-4 hover:scale-[1.005] transition-all duration-300">
            <div className="bg-emerald-600/10 text-emerald-700 p-4 rounded-xl">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rasio Kehadiran</span>
              <span className="text-2xl font-black text-emerald-700">{attendanceRate}%</span>
              <span className="block text-xs text-slate-500 mt-0.5 font-medium">{presentDays} Hari Hadir dari {totalDays} Pengamatan</span>
            </div>
          </div>

          {/* Card 3: Completion percentage bar */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/65 shadow-sm flex items-center gap-4 hover:scale-[1.005] transition-all duration-300">
            <div className="bg-indigo-600/10 text-indigo-700 p-4 rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kepatuhan Tugas</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-800">{submittedCount} <span className="text-xs text-slate-400">selesai</span></span>
                <span className="text-xs text-slate-400">Sisa: {remainingCount}</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-200/50 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(submittedCount / (totalTasksCount || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Master layout panel Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Academic details column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Grade report list */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/65 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Laporan Rapor & Hasil Belajar {studentName}</h3>
                <p className="text-xs text-slate-500">Daftar nilai akhir pelajaran terkoreksi oleh pendidik.</p>
              </div>

              <div className="space-y-4">
                {studentSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-slate-405 bg-white/40 rounded-xl border border-dashed border-slate-300">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Anak Anda belum mengumpulkan tugas apa pun.</p>
                  </div>
                ) : (
                  studentSubmissions.map(sub => {
                    const task = db.tasks.find(t => t.id === sub.taskId);
                    return (
                      <div key={sub.id} className="p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/55 hover:bg-white/50 hover:border-slate-300 transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">
                              {task?.className || 'Pelajaran'}
                            </span>
                            <h4 className="font-bold text-sm text-slate-800 mt-1">{sub.taskTitle}</h4>
                            <p className="text-[10px] text-slate-505 mt-0.5">Diserahkan: {new Date(sub.submittedAt).toLocaleDateString('id-ID')}</p>
                          </div>

                          <div>
                            {sub.status === 'graded' ? (
                              <div className="text-right">
                                <span className="text-emerald-800 bg-emerald-100/85 font-extrabold text-sm px-2.5 py-1 rounded-lg">
                                  {sub.score} / 100
                                </span>
                              </div>
                            ) : (
                              <span className="text-amber-850 bg-amber-100 font-semibold text-[10px] px-2 py-1 rounded-lg">
                                Proses Koreksi
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Feedbacks */}
                        {sub.status === 'graded' && sub.feedback && (
                          <div className="p-3 bg-white/60 border border-slate-205/60 rounded-xl mt-3 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="block text-[9px] font-black uppercase text-slate-400">Tanggapan Pendidik:</span>
                              <p className="text-xs text-slate-600 italic mt-0.5">"{sub.feedback}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Attendance detailed table */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/65 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Catatan Presensi & Disiplin Belajar harian</h3>
                <p className="text-xs text-slate-500">Histori kehadiran anak di kelas digital yang langsung sinkron setiap hari.</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-slate-50/40 border border-white/50 rounded-xl">
                <div>
                  <span className="block font-bold text-slate-800">{presentDays}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold text-center">Hadir</span>
                </div>
                <div>
                  <span className="block font-bold text-blue-800">{permissionDays}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold text-center">Izin</span>
                </div>
                <div>
                  <span className="block font-bold text-amber-800">{sickDays}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold text-center">Sakit</span>
                </div>
                <div>
                  <span className="block font-bold text-rose-800">{alfaDays}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold text-center">Alfa</span>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto border border-white/50 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-white/50">
                      <th className="p-2.5 font-bold text-slate-600">Tanggal</th>
                      <th className="p-2.5 font-bold text-slate-600">Mata Pelajaran</th>
                      <th className="p-2.5 font-bold text-slate-600 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-400">Tidak ada pengamatan absensi harian.</td>
                      </tr>
                    ) : (
                      studentAttendance.map(att => (
                        <tr key={att.id}>
                          <td className="p-2.5 font-bold text-slate-700">{att.date}</td>
                          <td className="p-2.5 text-slate-500">{att.className}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              att.status === 'hadir' ? 'bg-emerald-50 text-emerald-700'
                                : att.status === 'sakit' ? 'bg-amber-50 text-amber-700'
                                : att.status === 'izin' ? 'bg-blue-50 text-blue-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar column: Alerts / Notifications */}
          <div className="space-y-6">
            
            {/* Real-time notification inbox */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/65 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-white/50">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Notifikasi Transparan</span>
                </h3>
                {parentNotifications.length > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {parentNotifications.length} Baru
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {parentNotifications.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <CheckCircle className="w-8 h-8 text-slate-200 mx-auto" />
                    <p className="text-xs font-semibold">Semua laporan telah dibaca & tuntas.</p>
                  </div>
                ) : (
                  parentNotifications.map(notif => (
                    <div key={notif.id} className="p-3 bg-white/45 backdrop-blur-sm border border-white/50 rounded-xl space-y-1.5 hover:border-slate-300 hover:bg-white/60 hover:scale-[1.01] transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] bg-blue-105 text-blue-805 font-black px-1.5 py-0.5 rounded uppercase">
                          {notif.type}
                        </span>
                        <button
                          id={`btn-clear-p-notif-${notif.id}`}
                          onClick={() => handleDismissNotification(notif.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                        >
                          Tandai Dibaca
                        </button>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800">{notif.title}</h4>
                      <p className="text-[11px] text-slate-505 leading-normal">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* School communication advisory */}
            <div className="bg-gradient-to-tr from-blue-700/85 to-indigo-800/85 border border-white/10 backdrop-blur-md text-white rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-sm">Butuh Komunikasi Tambahan?</h4>
              <p className="text-[11px] text-blue-200 leading-relaxed">
                Anda dapat mengirimkan memo, tanggapan izin ketidakhadiran, atau berbicara langsung dengan Pak Budi melalui pusat bantuan WhatsApp/Surel resmi sekolah.
              </p>
              <div className="pt-2">
                <a 
                  href="mailto:help.siswa@sekolah.sch.id" 
                  className="bg-white text-blue-800 text-xs font-bold py-2 px-4 rounded-xl inline-block hover:bg-blue-50 transition-colors"
                >
                  Hubungi Guru Wali
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
