
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface Resume {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'pending' | 'reviewed' | 'approved';
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  company?: string;
  isInternal: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
  comments: Comment[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  note?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
}
