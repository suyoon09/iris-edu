export interface AdmissionAnalysis {
  student_id: string;
  generated_at: string;

  overall_assessment: {
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    korean_student_context: string;
  };

  university_analyses: UniversityAnalysis[];

  strategic_recommendations: {
    immediate_actions: string[];
    short_term_goals: string[];
    long_term_positioning: string[];
    korean_specific_strategies: string[];
  };

  timeline_suggestions: TimelineSuggestion[];
}

export interface UniversityAnalysis {
  university_id: string;
  university_name: string;

  admission_probability: {
    score: number; // 0-100
    category: "reach" | "target" | "safety" | "far_reach";
    confidence: "high" | "medium" | "low";
  };

  profile_match: {
    academic_fit: number; // 0-100
    extracurricular_fit: number;
    personal_fit: number;
    overall_fit: number;
  };

  strengths_for_school: string[];
  gaps_to_address: string[];
  application_strategy: string;
  essay_themes_suggested: string[];
  korean_student_advantage?: string;
  korean_student_challenge?: string;
}

export interface TimelineSuggestion {
  month: string;
  year: number;
  tasks: string[];
  focus_area: string;
}

export interface RoadmapItem {
  month: number;
  year: number;
  category: "academics" | "testing" | "extracurriculars" | "essays" | "applications" | "interviews";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  deadline?: string;
}

export interface StudentRoadmap {
  student_id: string;
  generated_at: string;
  graduation_year: number;
  items: RoadmapItem[];
  milestones: {
    date: string;
    title: string;
    description: string;
  }[];
}

export interface StrategyOptimization {
  student_id: string;
  generated_at: string;

  school_list_analysis: {
    current_balance: string;
    recommended_changes: string[];
    suggested_additions: string[];
    suggested_removals: string[];
  };

  application_round_strategy: {
    recommended_ed_ea: string[];
    recommended_rd: string[];
    rationale: string;
  };

  differentiation_strategies: {
    unique_angles: string[];
    narrative_themes: string[];
    korean_identity_leverage: string;
  };
}
