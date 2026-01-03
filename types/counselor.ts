export interface Counselor {
  id: string;
  email: string;
  password: string;
  name: string;
  name_en: string;
  role: "admin" | "counselor";
  specialization: string[];
  assigned_students: string[];
  created_at: string;
  last_login: string | null;
}

export interface CounselorCreate {
  email: string;
  password: string;
  name: string;
  name_en: string;
  role: "admin" | "counselor";
  specialization: string[];
}

export interface CounselorUpdate {
  name?: string;
  name_en?: string;
  specialization?: string[];
  role?: "admin" | "counselor";
}

export interface CounselorPublic {
  id: string;
  email: string;
  name: string;
  name_en: string;
  role: "admin" | "counselor";
  specialization: string[];
  assigned_students: string[];
  created_at: string;
  last_login: string | null;
}
