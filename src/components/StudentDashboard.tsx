import React, { useState } from 'react';
import { DatabaseState, Task, Submission, User, Notification } from '../types';
import { 
  BookOpen, Calendar, ChevronRight, CheckCircle, Clock, 
  Upload, FileText, Bell, AlertTriangle, ArrowRight, Award, Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  db: DatabaseState;
  currentUser: User;
  onUpdateDb: (updater: (prev: DatabaseState) => DatabaseState) => void;
  sendNotification: (userId: string, title: string, message: string, type: 'task' | 'grade' | 'attendance' | 'announcement') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  db,
  currentUser,
  onUpdateDb,
  sendNotification
}) => {
  const [activeTab, setActiveTab] = useState<'tugas' | 'kehadiran' | 'notifikasi'>('tugas');
  const [filter, setFilter] = useState<'todo' | 'done'>('todo');

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter tasks belonging to class
  const studentClass = currentUser.className || "Kelas 10-A IPA";
  const myClassNames = db.classes.map(c => c.name); // Simplified: students have access to all classes in this school
  
  const myTasks = db.tasks; // Student tracks all school tasks for interactive ease
  const mySubmissions = db.submissions.filter(s => s.studentId === currentUser.id);
  const myNotifications = db.notifications.filter(n => n.userId === currentUser.id);

  const todoTasks = myTasks.filter(t => !mySubmissions.some(s => s.taskId === t.id));
  const doneTasks = myTasks.filter(t => mySubmissions.some(s => s.taskId === t.id));

  // Handle Drag over & drop mock
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSimulatedFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSimulatedFileName(e.target.files[0].name);
    }
  };

  // Submit Homework Assignment
  const handleSubmitHomework = (taskId: string, taskTitle: string) => {
    if (!submissionText.trim() && !simulatedFileName) {
      setSubmitError("Harap tulis jawaban Anda terlebih dahulu atau lampirkan berkas tugas.");
      return;
    }

    const newSubmission: Submission = {
      id: `s-${Date.now()}`,
      taskId,
      taskTitle,
      studentId: currentUser.id,
      studentName: currentUser.name,
      submittedAt: new Date().toISOString(),
      content: submissionText.trim() || `[Mengirim lampiran berkas penugasan: ${simulatedFileName}]`,
      fileName: simulatedFileName || `${currentUser.name.toLowerCase().replace(' ', '_')}_tugas.pdf`,
      status: 'submitted'
    };

    onUpdateDb(prev => ({
      ...prev,
      submissions: [...prev.submissions, newSubmission]
    }));

    // Trigger notification to Guru
    sendNotification(
      "u-guru-1",
      `Tugas Dikirim: ${currentUser.name}`,
      `${currentUser.name} telah mengirimkan tugas untuk "${taskTitle}". Siap diperiksa.`,
      'task'
    );

    setSubmissionText('');
    setSimulatedFileName('');
    setSubmitError(null);
    setExpandedTaskId(null);
  };

  // Compute grading average for student
  const gradedList = mySubmissions.filter(s => s.status === 'graded' && s.score !== undefined);
  const totalGradedPoints = gradedList.reduce((sum, curr) => sum + (curr.score || 0), 0);
  const avgGrade = gradedList.length > 0 ? (totalGradedPoints / gradedList.length).toFixed(0) : '-';

  // Attendance statistics
  const myAttendance = db.attendance.filter(a => a.studentId === currentUser.id);
  const presentCount = myAttendance.filter(a => a.status === 'hadir').length;
  const sickCount = myAttendance.filter(a => a.status === 'sakit').length;
  const permissionCount = myAttendance.filter(a => a.status === 'izin').length;
  const alfaCount = myAttendance.filter(a => a.status === 'alfa').length;
  const totalDays = myAttendance.length;
  const attendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(0) : '100';

  const handleDeleteNotification = (notifId: string) => {
    onUpdateDb(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notifId)
    }));
  };

  return (
    <div id="student-dashboard" className="min-h-screen bg-transparent">
      {/* Profile Bar */}
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
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Portal Siswa</p>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h1>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Siswa Kelas: <strong className="text-slate-700">{studentClass}</strong> • SMA Negeri 1 Jakarta</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-blue-600/10 border border-blue-500/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <span className="block text-slate-505 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tugas Tersisa</span>
              <span className="text-xl font-extrabold text-blue-700">{todoTasks.length}</span>
            </div>
            <div className="bg-emerald-600/10 border border-emerald-500/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <span className="block text-slate-505 text-[10px] font-bold uppercase tracking-wider text-slate-500">Rata Nilai</span>
              <span className="text-xl font-extrabold text-emerald-700">{avgGrade !== '-' ? `${avgGrade}%` : '-'}</span>
            </div>
            <div className="bg-amber-600/10 border border-amber-500/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <span className="block text-slate-505 text-[10px] font-bold uppercase tracking-wider text-slate-500">Presensi</span>
              <span className="text-xl font-extrabold text-amber-700">{attendancePercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200/55 gap-1.5 overflow-x-auto pb-px mb-6">
          <button
            id="tab-student-tugas"
            onClick={() => setActiveTab('tugas')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tugas'
                ? 'border-blue-600 text-blue-700 bg-white/50 backdrop-blur-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-605" />
            <span>Tugas Sekolah ({myTasks.length})</span>
          </button>

          <button
            id="tab-student-kehadiran"
            onClick={() => setActiveTab('kehadiran')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'kehadiran'
                ? 'border-blue-600 text-blue-700 bg-white/50 backdrop-blur-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/20'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-605" />
            <span>Catatan Kehadiran</span>
          </button>

          <button
            id="tab-student-notif"
            onClick={() => setActiveTab('notifikasi')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap relative cursor-pointer ${
              activeTab === 'notifikasi'
                ? 'border-blue-600 text-blue-700 bg-white/50 backdrop-blur-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/20'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-505" />
            <span>Notifikasi</span>
            {myNotifications.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                {myNotifications.length}
              </span>
            )}
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* TASKS SUB-TAB */}
          {activeTab === 'tugas' && (
            <div id="panel-student-tugas" className="space-y-6">
              {/* Task filters */}
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl max-w-sm">
                <button
                  id="tab-student-tugas-todo"
                  onClick={() => setFilter('todo')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filter === 'todo'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Belum Dikerjakan ({todoTasks.length})
                </button>
                <button
                  id="tab-student-tugas-done"
                  onClick={() => setFilter('done')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filter === 'done'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Selesai Dikirim ({doneTasks.length})
                </button>
              </div>

              {/* Task list container */}
              <div className="space-y-4">
                {filter === 'todo' ? (
                  todoTasks.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="font-bold text-slate-800 text-base">Hore! Tidak Ada Tugas Tersisa</p>
                      <p className="text-xs text-slate-400 mt-1">Semua tugas akademik Anda telah berhasil dirampungkan dan dikirimkan.</p>
                    </div>
                  ) : (
                    todoTasks.map(task => {
                      const isExpanded = expandedTaskId === task.id;
                      return (
                        <div key={task.id} className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/65 shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.002]">
                          {/* Closed Card summary header */}
                          <div 
                            id={`task-header-${task.id}`}
                            onClick={() => {
                              const nextId = isExpanded ? null : task.id;
                              setExpandedTaskId(nextId);
                              setSubmissionText('');
                              setSimulatedFileName('');
                              setSubmitError(null);
                            }}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/35 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                                {task.className}
                              </span>
                              <h3 className="text-base font-bold text-slate-800 mt-1">{task.title}</h3>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Tenggat: <strong>{task.dueDate}</strong>
                              </p>
                            </div>
                            <button className="text-blue-600 bg-blue-50 p-2 rounded-xl">
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* Expanded homework editor */}
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="px-5 pb-6 border-t border-slate-100 bg-slate-50/50 space-y-4 pt-4"
                            >
                              <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instruksi Guru:</h4>
                                <p className="text-xs text-slate-600 line-height-relaxed whitespace-pre-wrap">{task.description}</p>
                              </div>

                              {/* Interactive Submission Guidelines Banner */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 border border-blue-105 p-3.5 rounded-xl text-[11px] text-slate-600">
                                <div className="space-y-1.5">
                                  <span className="font-extrabold text-blue-800 uppercase tracking-wider block text-[9px]">💡 Petunjuk Penulisan Jawaban</span>
                                  <ul className="list-disc pl-4 space-y-1 text-slate-500">
                                    <li>Tuliskan argumen inti secara terstruktur dan jelas.</li>
                                    <li>Sebutkan rujukan atau buku referensi jika ada.</li>
                                    <li>Gunakan tata bahasa resmi (EYD/PUEBI) yang santun.</li>
                                  </ul>
                                </div>
                                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-205/60 pt-2 sm:pt-0 sm:pl-4">
                                  <span className="font-extrabold text-emerald-800 uppercase tracking-wider block text-[9px]">📎 Kriteria Dokumen Lampiran</span>
                                  <ul className="list-disc pl-4 space-y-1 text-slate-500">
                                    <li>Format dokumen: PDF, DOCX, PNG, atau JPG.</li>
                                    <li>Batas aman ukuran file maksimum 20 Megabyte (MB).</li>
                                    <li>Gunakan resolusi tinggi agar tulisan tangan terbaca jelas.</li>
                                  </ul>
                                </div>
                              </div>

                              {/* Form submission for homework */}
                              <div className="space-y-3">
                                <span className="block text-xs font-bold text-slate-600">Jawaban / Laporan Anda:</span>
                                <textarea
                                  id={`homework-content-${task.id}`}
                                  rows={5}
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                  placeholder="Ketikkan teks materi pengerjaan, jawaban essay, atau ringkasan hasil belajar Anda secara detail di sini..."
                                  className="w-full text-xs p-3 bg-white/40 border border-white/60 rounded-xl focus:border-blue-500 focus:bg-white/80 focus:outline-none"
                                />

                                {/* Interactive drag and drop representation */}
                                <div 
                                  id={`dropzone-${task.id}`}
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                    isDragOver ? 'border-blue-600 bg-blue-100/30 scale-[1.01]' : 'border-slate-350 bg-white/40 hover:bg-white/60'
                                  }`}
                                >
                                  <input 
                                    id={`file-input-${task.id}`}
                                    type="file" 
                                    onChange={handleFileSelect} 
                                    className="hidden" 
                                  />
                                  <label htmlFor={`file-input-${task.id}`} className="cursor-pointer">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-slate-600">
                                      {simulatedFileName ? `File terpilih: ${simulatedFileName}` : 'Foto Tugas atau Tarik File (PDF, DOCX) Ke Sini'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">Atau klik untuk menelusuri folder lokal Anda</p>
                                  </label>
                                </div>

                                {submitError && (
                                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                                    ⚠️ {submitError}
                                  </div>
                                )}

                                <div className="flex justify-end gap-2">
                                  <button
                                    id={`btn-submit-${task.id}`}
                                    onClick={() => handleSubmitHomework(task.id, task.title)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer"
                                  >
                                    Kumpulkan Pekerjaan Rumah
                                  </button>
                                  <button
                                    onClick={() => setExpandedTaskId(null)}
                                    className="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                                  >
                                    Tutup
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })
                  )
                ) : (
                  doneTasks.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold">Belum ada tugas yang dikumpulkan.</p>
                    </div>
                  ) : (
                    doneTasks.map(task => {
                      const matchingSub = mySubmissions.find(s => s.taskId === task.id);
                      if (!matchingSub) return null;

                      return (
                        <div key={task.id} className="bg-white/65 backdrop-blur-md rounded-2xl p-5 border border-white/65 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                                {task.className}
                              </span>
                              <h3 className="text-base font-extrabold text-slate-800 mt-1">{task.title}</h3>
                              <p className="text-[10px] text-slate-400">Dikirim pada: {new Date(matchingSub.submittedAt).toLocaleDateString('id-ID')}</p>
                            </div>
                            
                            <div className="text-right">
                              {matchingSub.status === 'graded' ? (
                                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5 font-bold text-xs">
                                  <Award className="w-4 h-4 text-emerald-600" />
                                  <span>Nilai: {matchingSub.score} / {task.maxScore}</span>
                                </div>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Menunggu Koreksi Pak Budi</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 space-y-2">
                            <p className="font-semibold text-[10px] uppercase text-slate-400">Jawaban yang telah Anda kirim:</p>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                              {matchingSub.content}
                            </div>
                            {matchingSub.fileName && (
                              <p className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                                <FileText className="w-3.5 h-3.5" />
                                Lampiran terunggah: {matchingSub.fileName}
                              </p>
                            )}
                          </div>

                          {matchingSub.status === 'graded' && matchingSub.feedback && (
                            <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs">
                              <span className="block font-bold text-emerald-800 text-[10px] uppercase tracking-wider mb-1">Evaluasi & Feedback Guru:</span>
                              <p className="text-slate-700 font-medium">{matchingSub.feedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE SUB-TAB */}
          {activeTab === 'kehadiran' && (
            <div id="panel-student-kehadiran" className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/65 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Laporan Transparansi Kehadiran</h2>
                <p className="text-xs text-slate-500">Histori absensi harian yang tercatat di sistem digital sekolah.</p>
              </div>

              {/* Grid of indicators */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-emerald-600/10 border border-emerald-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="block text-emerald-800 font-bold text-lg md:text-2xl">{presentCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Hadir</span>
                </div>
                <div className="bg-blue-600/10 border border-blue-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="block text-blue-800 font-bold text-lg md:text-2xl">{permissionCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Izin</span>
                </div>
                <div className="bg-amber-600/10 border border-amber-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="block text-amber-800 font-bold text-lg md:text-2xl">{sickCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sakit</span>
                </div>
                <div className="bg-rose-600/10 border border-rose-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="block text-rose-800 font-bold text-lg md:text-2xl">{alfaCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Alfa</span>
                </div>
              </div>

              {/* Attendance logs table */}
              <div className="border border-white/60 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-3 font-semibold text-slate-600">Tanggal</th>
                      <th className="p-3 font-semibold text-slate-600">Nama Kelas / Mata Pelajaran</th>
                      <th className="p-3 font-semibold text-slate-600 text-center">Status Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-xs text-slate-400">Belum ada pencatatan kehadiran yang terekam.</td>
                      </tr>
                    ) : (
                      myAttendance.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">{log.date}</td>
                          <td className="p-3 text-slate-500 text-xs">{log.className}</td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                              log.status === 'hadir' ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'sakit' ? 'bg-amber-100 text-amber-800'
                                : log.status === 'izin' ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATION SUB-TAB */}
          {activeTab === 'notifikasi' && (
            <div id="panel-student-notif" className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/65 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Pemberitahuan Sistem</h2>
                  <p className="text-xs text-slate-500">Log notifikasi real-time dari guru maupun institusi.</p>
                </div>
              </div>

              <div className="space-y-3">
                {myNotifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Bell className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-bold">Tidak ada notifikasi baru</p>
                  </div>
                ) : (
                  myNotifications.map(notif => (
                    <div key={notif.id} className="p-4 bg-white/45 backdrop-blur-sm border border-white/50 rounded-xl flex justify-between items-center gap-4 hover:border-slate-300 hover:bg-white/60 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            notif.type === 'grade' ? 'bg-emerald-100 text-emerald-800'
                              : notif.type === 'task' ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 mt-1">{notif.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                      </div>
                      
                      <button 
                        id={`btn-del-notif-${notif.id}`}
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
