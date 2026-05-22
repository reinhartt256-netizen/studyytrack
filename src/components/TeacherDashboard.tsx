import React, { useState } from 'react';
import { DatabaseState, Class, Task, Submission, Attendance, User } from '../types';
import { 
  Users, BookOpen, Plus, Calendar, FileText, CheckCircle, 
  AlertCircle, Star, MessageSquare, ClipboardList, Check, TrendingUp, Info, LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherDashboardProps {
  db: DatabaseState;
  currentUser: User;
  onUpdateDb: (updater: (prev: DatabaseState) => DatabaseState) => void;
  sendNotification: (userId: string, title: string, message: string, type: 'task' | 'grade' | 'attendance' | 'announcement') => void;
  onLogout?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  db,
  currentUser,
  onUpdateDb,
  sendNotification,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'kelas' | 'tugas' | 'koreksi' | 'presensi'>('kelas');
  
  // States for new Class Form
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');

  // States for new Assignment Form
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-05-28');
  const [taskMaxScore, setTaskMaxScore] = useState(100);

  // States for Grading Center
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [inputScore, setInputScore] = useState<number>(90);
  const [inputFeedback, setInputFeedback] = useState('');

  // States for Attendance Tracker
  const [selectedAttendanceClassId, setSelectedAttendanceClassId] = useState(db.classes[0]?.id || '');
  const [attendanceDate, setAttendanceDate] = useState('2026-05-21');
  const [tempRecords, setTempRecords] = useState<Record<string, 'hadir' | 'izin' | 'sakit' | 'alfa'>>({});
  const [isAttendanceSaved, setIsAttendanceSaved] = useState(false);

  const students = db.users.filter(u => u.role === 'siswa');

  // Handle Class Creation
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassSubject) return;

    const newClass: Class = {
      id: `c-${Date.now()}`,
      name: newClassName,
      subject: newClassSubject,
      teacherId: currentUser.id
    };

    onUpdateDb(prev => ({
      ...prev,
      classes: [...prev.classes, newClass]
    }));

    // Notify students of the new class
    students.forEach(student => {
      sendNotification(
        student.id,
        `Kelas Baru Tersedia`,
        `Pak Budi telah meluncurkan kelas baru: ${newClassName} (${newClassSubject})`,
        'announcement'
      );
    });

    setNewClassName('');
    setNewClassSubject('');
    setShowClassModal(false);
  };

  // Handle Assignment (Task) Creation
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !taskTitle || !taskDesc) return;

    const targetClass = db.classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    const newTask: Task = {
      id: `t-${Date.now()}`,
      classId: selectedClassId,
      className: targetClass.name,
      title: taskTitle,
      description: taskDesc,
      dueDate: taskDueDate,
      maxScore: Number(taskMaxScore),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onUpdateDb(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    // Notify all students about the new assignment
    students.forEach(student => {
      sendNotification(
        student.id,
        `Tugas Baru: ${taskTitle}`,
        `Tugas baru telah dirilis di kelas ${targetClass.name}. Tenggat waktu: ${taskDueDate}`,
        'task'
      );
    });

    setTaskTitle('');
    setTaskDesc('');
    setSelectedClassId('');
    setShowTaskModal(false);
  };

  // Handle Grading Submission
  const handleGradeSubmission = (submissionId: string) => {
    onUpdateDb(prev => {
      const updatedSubmissions = prev.submissions.map(sub => {
        if (sub.id === submissionId) {
          const updatedSub = {
            ...sub,
            status: 'graded' as const,
            score: Number(inputScore),
            feedback: inputFeedback
          };
          // Send notify
          sendNotification(
            sub.studentId,
            `Tugas Selesai Dinilai`,
            `Tugas "${sub.taskTitle}" Anda telah dinilai: ${inputScore}/${sub.score ?? 100} oleh ${currentUser.name}`,
            'grade'
          );
          return updatedSub;
        }
        return sub;
      });
      return { ...prev, submissions: updatedSubmissions };
    });

    setGradingSubmissionId(null);
    setInputFeedback('');
  };

  // Initialize/Update live attendance temporary state
  const handleLoadAttendanceSheet = (classId: string, date: string) => {
    const existing = db.attendance.filter(a => a.classId === classId && a.date === date);
    const initialRecords: Record<string, 'hadir' | 'izin' | 'sakit' | 'alfa'> = {};

    students.forEach(student => {
      const match = existing.find(a => a.studentId === student.id);
      initialRecords[student.id] = match ? match.status : 'hadir';
    });

    setTempRecords(initialRecords);
    setIsAttendanceSaved(false);
  };

  // Save Attendance to Database
  const handleSaveAttendance = () => {
    const targetClass = db.classes.find(c => c.id === selectedAttendanceClassId);
    if (!targetClass) return;

    onUpdateDb(prev => {
      // Remove old records for same class and date
      const filtered = prev.attendance.filter(
        a => !(a.classId === selectedAttendanceClassId && a.date === attendanceDate)
      );

      // Create new attendance logs
      const newAttendanceLogs: Attendance[] = students.map(student => ({
        id: `a-${Date.now()}-${student.id}`,
        date: attendanceDate,
        classId: selectedAttendanceClassId,
        className: targetClass.name,
        studentId: student.id,
        studentName: student.name,
        status: tempRecords[student.id] || 'hadir'
      }));

      // Notify parent & student on any special attendance statuses
      newAttendanceLogs.forEach(log => {
        if (log.status !== 'hadir') {
          // Notify student
          sendNotification(
            log.studentId,
            `Pencatatan Kehadiran`,
            `Anda tercatat "${log.status.toUpperCase()}" pada kelas ${targetClass.name} tanggal ${attendanceDate}`,
            'attendance'
          );
          // Find parents and notify
          const parent = db.users.find(u => u.role === 'orangtua' && u.studentId === log.studentId);
          if (parent) {
            sendNotification(
              parent.id,
              `Laporan Kehadiran: ${log.studentName}`,
              `Anak Anda, ${log.studentName}, tercatat "${log.status.toUpperCase()}" pada hari ini di kelas ${targetClass.name}.`,
              'attendance'
            );
          }
        }
      });

      return {
        ...prev,
        attendance: [...filtered, ...newAttendanceLogs]
      };
    });

    setIsAttendanceSaved(true);
    setTimeout(() => setIsAttendanceSaved(false), 3000);
  };

  // Performance computations
  const totalSubmissions = db.submissions.length;
  const gradedCount = db.submissions.filter(s => s.status === 'graded').length;
  const pendingCount = db.submissions.filter(s => s.status === 'submitted').length;
  const gradedScores = db.submissions.filter(s => s.status === 'graded' && s.score !== undefined).map(s => s.score as number);
  const averageScore = gradedScores.length > 0 ? (gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length).toFixed(1) : '90';

  return (
    <div id="teacher-dashboard-main" className="min-h-screen bg-transparent">
      {/* Upper Brand / Welcome bar */}
      <div className="bg-white/45 backdrop-blur-md border-b border-white/50 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-600/60 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                {currentUser.academicTitle === 'Dosen' ? 'Portal Akademik Dosen' : 'Dashboard Pendidik'}
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.email} • {currentUser.institution || 'SMA Negeri 1 Jakarta'}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-blue-600/10 border border-blue-500/20 backdrop-blur-sm rounded-2xl p-3 text-center min-w-[85px]">
                <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Kelas</span>
                <span className="text-xl font-extrabold text-blue-700">{db.classes.length}</span>
              </div>
              <div className="bg-emerald-600/10 border border-emerald-500/20 backdrop-blur-sm rounded-2xl p-3 text-center min-w-[85px]">
                <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Rata Nilai</span>
                <span className="text-xl font-extrabold text-emerald-700">{averageScore}</span>
              </div>
              <div className="bg-amber-600/10 border border-amber-500/20 backdrop-blur-sm rounded-2xl p-3 text-center min-w-[85px]">
                <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Butuh Periksa</span>
                <span className="text-xl font-extrabold text-amber-700">{pendingCount}</span>
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                id="btn-teacher-logout"
                onClick={onLogout}
                className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200/55 gap-1.5 overflow-x-auto pb-px mb-6">
          <button
            id="tab-kelas"
            onClick={() => setActiveTab('kelas')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'kelas'
                ? 'border-blue-600 text-blue-700 bg-white/50 backdrop-blur-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Kelas & Siswa</span>
          </button>
          
          <button
            id="tab-tugas"
            onClick={() => setActiveTab('tugas')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tugas'
                ? 'border-blue-600 text-blue-700 bg-white/50 backdrop-blur-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/20'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-indigo-500" />
            <span>Kelola Tugas ({db.tasks.length})</span>
          </button>

          <button
            id="tab-koreksi"
            onClick={() => setActiveTab('koreksi')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'koreksi'
                ? 'border-blue-600 text-blue-700 bg-white/50 backdrop-blur-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/20'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Koreksi Nilai</span>
            {pendingCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            id="tab-presensi"
            onClick={() => {
              setActiveTab('presensi');
              handleLoadAttendanceSheet(selectedAttendanceClassId || db.classes[0]?.id, attendanceDate);
            }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'presensi'
                ? 'border-blue-600 text-blue-700 bg-white/50 backdrop-blur-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Presensi Digital</span>
          </button>
        </div>

        {/* Content Panels */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 1. KELAS & SISWA PANEL */}
          {activeTab === 'kelas' && (
            <div id="panel-kelas" className="space-y-6">
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Daftar Kelas Pembelajaran</h2>
                  <p className="text-xs text-slate-500">Buat kelas digital baru dan pantau jumlah partisipan aktif.</p>
                </div>
                <button
                  id="btn-tambah-kelas"
                  onClick={() => setShowClassModal(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kelas</span>
                </button>
              </div>

              {/* Grid of Classes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {db.classes.map(cls => {
                  const classTasks = db.tasks.filter(t => t.classId === cls.id);
                  return (
                    <div key={cls.id} className="bg-white/65 backdrop-blur-md rounded-2xl p-5 border border-white/65 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8 -z-10 group-hover:scale-110 transition-transform"></div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                        {cls.subject}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-800 mt-2">{cls.name}</h3>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200/40 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span>{students.length} Siswa Terdaftar</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{classTasks.length} Tugas Atif</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Student Directory representing real-time study state */}
              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/65 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Direktori Siswa & Rata-Rata Akademik</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200/40">
                        <th className="p-3 font-semibold text-slate-600">Siswa</th>
                        <th className="p-3 font-semibold text-slate-600">Email</th>
                        <th className="p-3 font-semibold text-slate-600">Kelas Belajar</th>
                        <th className="p-3 font-semibold text-slate-600 text-center">Kehadiran</th>
                        <th className="p-3 font-semibold text-slate-600 text-center">Rata-rata Nilai</th>
                        <th className="p-3 font-semibold text-slate-600 text-center">Status Kirim Tugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                      {students.map(std => {
                        const stdSubmissions = db.submissions.filter(s => s.studentId === std.id && s.status === 'graded');
                        const totalScore = stdSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
                        const avg = stdSubmissions.length > 0 ? (totalScore / stdSubmissions.length).toFixed(0) : 'N/A';
                        
                        const stdAttendance = db.attendance.filter(a => a.studentId === std.id);
                        const present = stdAttendance.filter(a => a.status === 'hadir').length;
                        const totalAtt = stdAttendance.length;
                        const attendanceRate = totalAtt > 0 ? ((present / totalAtt) * 100).toFixed(0) : '100';

                        const allSubmissions = db.submissions.filter(s => s.studentId === std.id);

                        return (
                          <tr key={std.id} className="hover:bg-white/35 transition-colors">
                            <td className="p-3 flex items-center gap-3">
                              <img src={std.avatar} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                              <span className="font-bold text-slate-800">{std.name}</span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-xs">{std.email}</td>
                            <td className="p-3 font-medium text-slate-700">{std.className ?? 'Umum'}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                Number(attendanceRate) >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {attendanceRate}% Hadir
                              </span>
                            </td>
                            <td className="p-3 text-center font-extrabold text-blue-700 text-base">
                              {avg !== 'N/A' ? `${avg}/100` : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-xs text-slate-500">
                                {allSubmissions.length} Tugas dikirim
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. KELOLA TUGAS PANEL */}
          {activeTab === 'tugas' && (
            <div id="panel-tugas" className="space-y-6">
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Manajemen Penugasan Belajar</h2>
                  <p className="text-xs text-slate-500">Berikan instruksi dan pantau tanggal pengumpulan.</p>
                </div>
                <button
                  id="btn-tambah-tugas"
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Tugas Baru</span>
                </button>
              </div>

              {/* Task list layout */}
              <div className="space-y-4">
                {db.tasks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-500">Belum ada tugas yang dibuat</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol ke kanan atas untuk menugaskan materi baru.</p>
                  </div>
                ) : (
                  db.tasks.map(task => {
                    const taskSubmissions = db.submissions.filter(s => s.taskId === task.id);
                    return (
                      <div key={task.id} className="bg-white/65 backdrop-blur-md rounded-2xl p-5 border border-white/65 shadow-sm hover:shadow-md hover:scale-[1.005] transition-all duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">
                              {task.className}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-800 mt-1">{task.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-3xl">{task.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-slate-500">
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-slate-400">Tenggat</span>
                              <span className="flex items-center gap-1 font-bold text-slate-700 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                {task.dueDate}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-slate-400">Pengiriman</span>
                              <span className="block text-slate-800 font-bold mt-0.5">
                                {taskSubmissions.length} / {students.length} Siswa
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 3. KOREKSI NILAI PANEL */}
          {activeTab === 'koreksi' && (
            <div id="panel-koreksi" className="space-y-6">
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">Konsol Penilaian & Feedback</h2>
                <p className="text-xs text-slate-500">Berikan skor numerik dan evaluasi deskriptif pada penyerahan tugas siswa.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submission List Table/Cards */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Antrean Dokumen Masuk</h3>
                  {db.submissions.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-500">Belum ada pengumpulan tugas.</p>
                    </div>
                  ) : (
                    db.submissions.map(sub => {
                      const associatedTask = db.tasks.find(t => t.id === sub.taskId);
                      const isGradingActive = gradingSubmissionId === sub.id;

                      return (
                        <div 
                          key={sub.id} 
                          className={`bg-white/60 backdrop-blur-sm rounded-2xl p-5 border transition-all ${
                            isGradingActive ? 'border-blue-600 ring-2 ring-blue-100/60' : 'border-white/60 hover:border-slate-350 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-3 border-b border-slate-100">
                            <div>
                              <h4 className="font-bold text-sm text-slate-800">{sub.taskTitle}</h4>
                              <p className="text-xs text-slate-500">Siswa: <span className="font-bold text-blue-600">{sub.studentName}</span></p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              sub.status === 'graded' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            }`}>
                              {sub.status === 'graded' ? `Selesai Dinilai (${sub.score}/${associatedTask?.maxScore || 100})` : 'Butuh Penilaian'}
                            </span>
                          </div>

                          <div className="py-3 text-xs text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100 mt-3 whitespace-pre-wrap">
                            <p className="font-semibold text-slate-500 mb-1 text-[10px] uppercase">Isi Jawaban Siswa:</p>
                            {sub.content}
                            {sub.fileName && (
                              <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center gap-1.5 text-blue-600 font-semibold cursor-pointer">
                                <FileText className="w-3.5 h-3.5" />
                                <span>Lampiran: {sub.fileName}</span>
                              </div>
                            )}
                          </div>

                          {sub.feedback && (
                            <div className="mt-3 text-xs text-slate-600 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/60 font-medium">
                              <span className="block font-bold text-emerald-800 text-[10px] uppercase tracking-wider">Komentar Guru:</span>
                              {sub.feedback}
                            </div>
                          )}

                          <div className="mt-4 flex justify-end gap-2">
                            {sub.status === 'submitted' ? (
                              <button
                                id={`btn-koreksi-${sub.id}`}
                                onClick={() => {
                                  setGradingSubmissionId(sub.id);
                                  setInputScore(90);
                                  setInputFeedback('');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                              >
                                Beri Nilai / Koreksi
                              </button>
                            ) : (
                              <button
                                id={`btn-edit-koreksi-${sub.id}`}
                                onClick={() => {
                                  setGradingSubmissionId(sub.id);
                                  setInputScore(sub.score || 90);
                                  setInputFeedback(sub.feedback || '');
                                }}
                                className="text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                              >
                                Ubah Penilaian
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Interactive Correction Panel */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Korektor Panel Pembelajaran</h3>
                  <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 shadow-md sticky top-24">
                    {gradingSubmissionId ? (
                      <div>
                        {(() => {
                          const target = db.submissions.find(s => s.id === gradingSubmissionId);
                          if (!target) return null;
                          return (
                            <div className="space-y-4">
                              <div>
                                <span className="text-[10px] text-blue-600 uppercase font-extrabold">Beri Nilai Ke:</span>
                                <p className="font-extrabold text-slate-800 text-base">{target.studentName}</p>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">{target.taskTitle}</p>
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-600">Nilai Angka (Skala 0-100)</label>
                                <input
                                  id="grading-score-input"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={inputScore}
                                  onChange={(e) => setInputScore(Number(e.target.value))}
                                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-600">Feedback Deskriptif / Catatan Guru</label>
                                <textarea
                                  id="grading-feedback-input"
                                  rows={4}
                                  value={inputFeedback}
                                  onChange={(e) => setInputFeedback(e.target.value)}
                                  placeholder="Sebutkan kelebihan, kekurangan, atau materi yang perlu dipelajari kembali..."
                                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none h-28"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  id="btn-sub-grading"
                                  onClick={() => handleGradeSubmission(gradingSubmissionId)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl text-center cursor-pointer"
                                >
                                  Submit Nilai
                                </button>
                                <button
                                  id="btn-cancel-grading"
                                  onClick={() => setGradingSubmissionId(null)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-500">Pilih berkas tugas siswa terlebih dahulu</p>
                        <p className="text-xs text-slate-400 mt-1">Pilih tombol 'Beri Nilai / Koreksi' untuk memuat konsol di sini.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRESENSI DIGITAL PANEL */}
          {activeTab === 'presensi' && (
            <div id="panel-presensi" className="space-y-6">
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Sistem Pencatatan Presensi Digital</h2>
                    <p className="text-xs text-slate-500">Pilih mata pelajaran, perbarui status kehadiran hari ini, dan distribusikan laporan transparan ke wali murid.</p>
                  </div>
                  <button
                    id="btn-save-attendance"
                    onClick={handleSaveAttendance}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Perbarui Kehadiran</span>
                  </button>
                </div>

                {/* Form Controls inside panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200/65">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Pilih Kelas & Pelajaran</label>
                    <select
                      id="select-attendance-class"
                      value={selectedAttendanceClassId}
                      onChange={(e) => {
                        setSelectedAttendanceClassId(e.target.value);
                        handleLoadAttendanceSheet(e.target.value, attendanceDate);
                      }}
                      className="w-full text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {db.classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Tanggal Absensi</label>
                    <input
                      id="attendance-date"
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => {
                        setAttendanceDate(e.target.value);
                        handleLoadAttendanceSheet(selectedAttendanceClassId, e.target.value);
                      }}
                      className="w-full text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Save Feedback Banner */}
                {isAttendanceSaved && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Laporan absensi berhasil diperbarui dan dialirkan secara langsung ke dasbor Siswa & Orang Tua!</span>
                  </motion.div>
                )}

                {/* Checklist table matching Indonesian requirement */}
                <div className="mt-6 border border-white/60 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left animate-fade-in">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-white/50 animate-pulse">
                        <th className="p-3 font-semibold text-slate-600">Para Siswa</th>
                        <th className="p-3 font-semibold text-slate-600">Peran Institusi</th>
                        <th className="p-3 font-semibold text-slate-600 text-center">Kehadiran (Hadir / Sakit / Izin / Alfa)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map(std => {
                        const statusVal = tempRecords[std.id] || 'hadir';

                        return (
                          <tr key={std.id} className="hover:bg-slate-50/50">
                            <td className="p-3 flex items-center gap-3">
                              <img src={std.avatar} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                              <div>
                                <span className="font-bold text-slate-800">{std.name}</span>
                                <span className="block text-[10px] text-slate-400 font-medium">{std.email}</span>
                              </div>
                            </td>
                            <td className="p-3 text-xs text-slate-500">{std.className || 'Kelas 10-A IPA'}</td>
                            <td className="p-3">
                              <div className="flex justify-center items-center gap-2">
                                {(['hadir', 'sakit', 'izin', 'alfa'] as const).map((st) => (
                                  <button
                                    key={st}
                                    id={`att-${std.id}-${st}`}
                                    onClick={() => {
                                      setTempRecords(prev => ({
                                        ...prev,
                                        [std.id]: st
                                      }));
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                      statusVal === st
                                        ? st === 'hadir' ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                                          : st === 'sakit' ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-500'
                                          : st === 'izin' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                                          : 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {st === 'hadir' ? 'Hadir' : st === 'sakit' ? 'Sakit' : st === 'izin' ? 'Izin' : 'Alfa'}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Sistem secara otomatis akan mendistribusikan notifikasi seluler/desktop secara langsung jika data kehadiran diubah dari standarnya.</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* MODAL 1: ADD CLASS */}
      {showClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Tambah Kelas Digital</h3>
              <button 
                onClick={() => setShowClassModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Nama Kelas</label>
                <input
                  id="modal-class-name"
                  type="text"
                  placeholder="Contoh: Kelas 10-A Biologi"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Mata Pelajaran</label>
                <input
                  id="modal-class-subj"
                  type="text"
                  placeholder="Contoh: Biologi"
                  required
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                id="btn-sub-class"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Simpan & Luncurkan
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Buat & Tugaskan Pelajaran</h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Pilih Kelas</label>
                <select
                  id="modal-task-class"
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="">-- Pilih Kelas Aktif --</option>
                  {db.classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Judul Tugas</label>
                <input
                  id="modal-task-title"
                  type="text"
                  placeholder="Misalnya: Pola Hereditas Pada Makhluk Hidup"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Instruksi Deskriptif / Soal</label>
                <textarea
                  id="modal-task-desc"
                  rows={4}
                  placeholder="Tuliskan petunjuk pengerjaan lengkap..."
                  required
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Tenggat Waktu</label>
                  <input
                    id="modal-task-due"
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Maksimum Skor</label>
                  <input
                    id="modal-task-max"
                    type="number"
                    required
                    value={taskMaxScore}
                    onChange={(e) => setTaskMaxScore(Number(e.target.value))}
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-sub-task"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Kirim Pembagian Tugas
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
