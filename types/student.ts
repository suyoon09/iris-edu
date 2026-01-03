export interface Course {
  name: string;
  level: "regular" | "honors" | "AP" | "IB" | "dual_enrollment";
  grade: string;
  year: string;
  subject_area: "math" | "science" | "english" | "social_studies" | "foreign_language" | "arts" | "other";
}

export interface Activity {
  name: string;
  category: "academic" | "arts" | "athletics" | "community_service" | "leadership" | "work" | "other";
  role: string;
  description: string;
  hours_per_week: number;
  weeks_per_year: number;
  years: string[];
  achievements: string[];
}

export interface Award {
  name: string;
  level: "school" | "regional" | "national" | "international";
  year: string;
  description: string;
}

export interface APScore {
  subject: string;
  score: number;
  year: string;
}

export interface TargetUniversity {
  university_id: string;
  priority: "reach" | "target" | "safety";
  intended_major: string;
  application_round: "ED" | "ED2" | "EA" | "REA" | "RD";
}

export interface Student {
  id: string;
  assigned_counselor_id: string | null;

  // Basic Info
  name_korean: string;
  name_english: string;
  email: string;
  phone: string;
  grade: 9 | 10 | 11 | 12;
  school_type: "domestic_korean" | "international_in_korea" | "abroad";
  current_school: string;
  graduation_year: number;

  // Academic Profile
  academic: {
    gpa: {
      unweighted: number;
      weighted: number | null;
      scale: string;
    };
    class_rank: {
      rank: number | null;
      total: number | null;
    };
    courses: Course[];
    standardized_tests: {
      sat: {
        total: number | null;
        reading_writing: number | null;
        math: number | null;
        date: string | null;
      };
      act: {
        composite: number | null;
        english: number | null;
        math: number | null;
        reading: number | null;
        science: number | null;
        date: string | null;
      };
      ap_scores: APScore[];
      toefl: {
        total: number | null;
        date: string | null;
      } | null;
    };
  };

  // Extracurriculars
  extracurriculars: Activity[];

  // Awards
  awards: Award[];

  // Target Universities
  target_universities: TargetUniversity[];

  // Application Status
  application_status: "planning" | "preparing" | "applying" | "complete";

  // Metadata
  created_at: string;
  updated_at: string;
  notes: string;
}

export interface StudentCreate {
  name_korean: string;
  name_english: string;
  email: string;
  phone: string;
  grade: 9 | 10 | 11 | 12;
  school_type: "domestic_korean" | "international_in_korea" | "abroad";
  current_school: string;
  graduation_year: number;
  notes?: string;
}

export interface StudentUpdate extends Partial<Omit<Student, 'id' | 'created_at'>> {}
