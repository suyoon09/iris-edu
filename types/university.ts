export interface University {
  university_id: string;
  basic_info: {
    name: string;
    name_short: string;
    location: {
      city: string;
      state: string;
      region: string;
      nearest_korean_community: string;
      distance_to_korean_community: string;
      climate: string;
    };
    type: string;
    founded: number;
    website: string;
  };

  enrollment: {
    total_undergraduate: number;
    total_graduate: number;
    international_percentage: number;
    korean_student_estimate: number;
    student_faculty_ratio: string;
  };

  admission_stats: {
    acceptance_rate: number;
    early_action_rate: number | null;
    early_decision_rate?: number | null;
    regular_decision_rate: number;
    yield_rate: number;
    total_applicants: number;
    total_admitted: number;
    international_applicants: number;
    international_admitted: number;

    profile_ranges: {
      gpa_unweighted: { "25th": number; median: number; "75th": number };
      sat_total: { "25th": number; median: number; "75th": number };
      sat_math: { "25th": number; median: number; "75th": number };
      sat_reading: { "25th": number; median: number; "75th": number };
      act_composite: { "25th": number; median: number; "75th": number };
    };
  };

  application_requirements: {
    deadline_early: string | null;
    deadline_regular: string;
    application_platform: string;
    application_fee: number;
    fee_waiver_available: boolean;

    required_documents: Array<{
      item: string;
      notes?: string;
      count?: number;
      required?: boolean;
    }>;

    test_policy: string;
    english_proficiency: {
      required_for_international: boolean;
      minimum_toefl: number | null;
      minimum_ielts: number | null;
      duolingo_accepted: boolean;
      minimum_duolingo: number | null;
      waiver_conditions: string;
    };
  };

  academic_programs: {
    notable_majors: string[];
    unique_programs: string[];
    curriculum_structure: string;
  };

  korean_student_specific: {
    korean_student_organizations: string[];
    korean_food_access: string;
    korean_church_proximity: string;

    historical_admit_patterns: {
      korean_high_schools_commonly_admitted: string[];
      common_profiles: string;
    };

    korean_specific_advice: string[];
    common_korean_applicant_mistakes: string[];
  };

  cost_and_aid: {
    tuition: number;
    room_and_board: number;
    total_cost_of_attendance: number;
    financial_aid_for_international: boolean;
    need_blind_for_international: boolean;
    average_aid_package: number;
    percentage_receiving_aid: number;
  };

  campus_life: {
    housing_guarantee: string;
    popular_dorms: string[];
    dining_options: string;
    safety_rating: string;
    nearby_attractions: string;
  };

  career_outcomes: {
    employment_rate_6_months: number;
    average_starting_salary: number;
    top_employers: string[];
    graduate_school_rate: number;
    korean_alumni_network: string;
  };

  last_updated: string;
}

export interface UniversityListItem {
  university_id: string;
  name: string;
  name_short: string;
  location: string;
  acceptance_rate: number;
  type: string;
}
