export type UserRole = 'guru' | 'siswa' | 'orangtua';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  password?: string; // credential field
  className?: string; // used for students
  studentId?: string; // used for parents to link to their child
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
}

export interface Task {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string; // details of the answer
  fileName?: string;
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
}

export interface Attendance {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'task' | 'grade' | 'attendance' | 'announcement';
}

export interface DatabaseState {
  users: User[];
  classes: Class[];
  tasks: Task[];
  submissions: Submission[];
  attendance: Attendance[];
  notifications: Notification[];
}
