export interface StudentInfo {
  id: number;
  name: string;
  class: string;
  section: string;
  roll_no: string;
  email: string;
  status: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

export interface ClassDetails {
  class_id: number;
  class: string;
  section: string;
  room_no: string;
  teacher_in_charge: string;
}

export interface TodayClass {
  id: number;
  subject_id: number;
  subject_name: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
  room_no: string;
  is_current: boolean;
  is_next: boolean;
}

export interface SyllabusProgress {
  subject_id: number;
  subject_name: string;
  total_chapters: number;
  completed_chapters: number;
  percentage: number;
  last_updated: string | null;
  remarks: string | null;
  teacher_name: string;
}

export interface DashboardStats {
  total_subjects: number;
  classes_today: number;
  average_syllabus_completion: number;
  next_class_time: string | null;
}

export interface StudentDashboardData {
  student_info: StudentInfo;
  class_details: ClassDetails;
  stats: DashboardStats;
  todays_classes: TodayClass[];
  syllabus_completion: SyllabusProgress[];
}

export interface StudentDashboardResponse {
  status: boolean;
  message: string;
  data?: StudentDashboardData;
  error?: string;
}

