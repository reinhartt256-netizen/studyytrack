import { DatabaseState } from '../types';

export const INITIAL_DATA: DatabaseState = {
  users: [
    {
      id: "u-guru-1",
      name: "Pak Budi Hermawan, S.Pd.",
      role: "guru",
      email: "budi.hermawan@sekolah.sch.id",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "u-siswa-1",
      name: "Rian Aditya",
      role: "siswa",
      email: "rian.aditya@sekolah.sch.id",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
      className: "Kelas 10-A IPA"
    },
    {
      id: "u-siswa-2",
      name: "Alya Nabila",
      role: "siswa",
      email: "alya.nabila@sekolah.sch.id",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      className: "Kelas 10-A IPA"
    },
    {
      id: "u-siswa-3",
      name: "Dimas Pratama",
      role: "siswa",
      email: "dimas.pratama@sekolah.sch.id",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      className: "Kelas 10-A IPA"
    },
    {
      id: "u-parent-1",
      name: "Ibu Siska Aditya",
      role: "orangtua",
      email: "siska.aditya@gmail.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      studentId: "u-siswa-1"
    }
  ],
  classes: [
    {
      id: "c-1",
      name: "Kelas 10-A Matematika",
      subject: "Matematika",
      teacherId: "u-guru-1"
    },
    {
      id: "c-2",
      name: "Kelas 10-A Fisika",
      subject: "Fisika",
      teacherId: "u-guru-1"
    }
  ],
  tasks: [
    {
      id: "t-1",
      classId: "c-1",
      className: "Kelas 10-A Matematika",
      title: "Aljabar Linear & Fungsi Kuadrat",
      description: "Kerjakan latihan soal halaman 45 No. 1 sampai 10 di buku latihan. Tuliskan langkah pengerjaan dengan jelas, lalu foto dan unggah dalam format PDF atau ketik langsung jawabannya di kolom yang disediakan.",
      dueDate: "2026-05-25",
      maxScore: 100,
      createdAt: "2026-05-18"
    },
    {
      id: "t-2",
      classId: "c-1",
      className: "Kelas 10-A Matematika",
      title: "Uji Pemahaman Trigonometri Dasar",
      description: "Selesaikan 5 soal studi kasus trigonometri terkait sudut istimewa dan penerapannya dalam kehidupan sehari-hari.",
      dueDate: "2026-05-28",
      maxScore: 100,
      createdAt: "2026-05-20"
    },
    {
      id: "t-3",
      classId: "c-2",
      className: "Kelas 10-A Fisika",
      title: "Laporan Praktikum: Gerak Lurus Berubah Beraturan (GLBB)",
      description: "Kumpulkan draf laporan praktikum fisika tentang GLBB yang telah dilaksanakan di laboratorium minggu lalu. Pastikan menyertakan tabel pengamatan dan analisis grafik hubungan S terhadap T^2.",
      dueDate: "2026-05-24",
      maxScore: 100,
      createdAt: "2026-05-15"
    }
  ],
  submissions: [
    {
      id: "s-1-1",
      taskId: "t-1",
      taskTitle: "Aljabar Linear & Fungsi Kuadrat",
      studentId: "u-siswa-1",
      studentName: "Rian Aditya",
      submittedAt: "2026-05-19T14:30:00Z",
      content: "Saya sudah mengerjakan latihan halaman 45. Jawaban No 1 adalah F(x) = 2x^2 + 4x - 6. Sumbu simetris berada di x = -1 dan nilai minimum adalah -8. Langkah berikutnya dijabarkan di lembar lampiran.",
      fileName: "rian_aljabar_tugas1.pdf",
      status: "graded",
      score: 92,
      feedback: "Kerja bagus Rian! Penyelesaian dan grafik yang kamu buat sangat jelas. Pertahankan ketelitianmu."
    },
    {
      id: "s-1-2",
      taskId: "t-1",
      taskTitle: "Aljabar Linear & Fungsi Kuadrat",
      studentId: "u-siswa-2",
      studentName: "Alya Nabila",
      submittedAt: "2026-05-19T16:15:00Z",
      content: "Untuk tugas Matematika Aljabar, berikut adalah ringkasan koordinat titik balik minimum: (-1, -8) dan titik potong sumbu X adalah (1,0) dan (-3,0).",
      fileName: "alya_nabila_aljabar.docx",
      status: "submitted"
    },
    {
      id: "s-3-1",
      taskId: "t-3",
      taskTitle: "Laporan Praktikum: Gerak Lurus Berubah Beraturan (GLBB)",
      studentId: "u-siswa-1",
      studentName: "Rian Aditya",
      submittedAt: "2026-05-17T11:00:00Z",
      content: "Laporan praktikum GLBB kelompok 2. Kami mengukur percepatan menggunakan ticker timer. Hasil menunjukkan percepatan konstan a = 1.2 m/s^2 dengan koefisien korelasi linear R^2 = 0.98.",
      fileName: "laporan_glbb_kelompok2.pdf",
      status: "graded",
      score: 88,
      feedback: "Metodologi percobaan sangat baik. Analisis grafik hubungan antara jarak dan waktu kuadrat sudah tepat. Penulisan daftar pustaka perlu disesuaikan dengan format standar."
    }
  ],
  attendance: [
    // Attendance on 2026-05-18
    { id: "a-1", date: "2026-05-18", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-1", studentName: "Rian Aditya", status: "hadir" },
    { id: "a-2", date: "2026-05-18", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-2", studentName: "Alya Nabila", status: "hadir" },
    { id: "a-3", date: "2026-05-18", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-3", studentName: "Dimas Pratama", status: "hadir" },
    
    // Attendance on 2026-05-19
    { id: "a-4", date: "2026-05-19", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-1", studentName: "Rian Aditya", status: "hadir" },
    { id: "a-5", date: "2026-05-19", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-2", studentName: "Alya Nabila", status: "hadir" },
    { id: "a-6", date: "2026-05-19", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-3", studentName: "Dimas Pratama", status: "sakit" },

    // Attendance on 2026-05-20
    { id: "a-7", date: "2026-05-20", classId: "c-2", className: "Kelas 10-A Fisika", studentId: "u-siswa-1", studentName: "Rian Aditya", status: "hadir" },
    { id: "a-8", date: "2026-05-20", classId: "c-2", className: "Kelas 10-A Fisika", studentId: "u-siswa-2", studentName: "Alya Nabila", status: "hadir" },
    { id: "a-9", date: "2026-05-20", classId: "c-2", className: "Kelas 10-A Fisika", studentId: "u-siswa-3", studentName: "Dimas Pratama", status: "izin" },
    
    // Attendance on 2026-05-21 (Today)
    { id: "a-10", date: "2026-05-21", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-1", studentName: "Rian Aditya", status: "hadir" },
    { id: "a-11", date: "2026-05-21", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-2", studentName: "Alya Nabila", status: "hadir" },
    { id: "a-12", date: "2026-05-21", classId: "c-1", className: "Kelas 10-A Matematika", studentId: "u-siswa-3", studentName: "Dimas Pratama", status: "hadir" }
  ],
  notifications: [
    {
      id: "n-1",
      userId: "u-siswa-1",
      title: "Nilai Tugas Terbit",
      message: "Tugas 'Aljabar Linear & Fungsi Kuadrat' Anda telah dinilai oleh Pak Budi Hermawan dengan skor 92/100.",
      createdAt: "2026-05-19T15:00:00Z",
      isRead: false,
      type: "grade"
    },
    {
      id: "n-2",
      userId: "u-siswa-1",
      title: "Tugas Baru Ditambahkan",
      message: "Tugas baru 'Uji Pemahaman Trigonometri Dasar' ditambahkan di Kelas 10-A Matematika. Tenggat: 28 Mei 2026.",
      createdAt: "2026-05-20T08:00:00Z",
      isRead: false,
      type: "task"
    },
    {
      id: "n-3",
      userId: "u-parent-1",
      title: "Laporan Kehadiran Rian Aditya",
      message: "Anak Anda Rian Aditya tercatat hadir pada pelajaran Kelas 10-A Matematika hari ini.",
      createdAt: "2026-05-21T09:15:00Z",
      isRead: false,
      type: "attendance"
    }
  ]
};
