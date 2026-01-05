import type { Counselor } from "@/types/counselor";
import type { Student } from "@/types/student";
import type { TimelineEvent } from "@/types/timeline";
import type { University, UniversityListItem } from "@/types/university";
import { allUniversityDetails } from "./university-data-all";

// Counselors with bcrypt-hashed passwords
// Passwords: admin123, counselor123, counselor123
const counselors: Counselor[] = [
  {
    id: "c1-admin-001",
    email: "admin@irisedu.com",
    password: "$2b$10$AeHQkR.MPcJic4RCtlNCCeYjtWg6dizV6mrc59fYhk3aU9XWXoXZ.",
    name: "관리자",
    name_en: "Admin",
    role: "admin",
    specialization: ["All"],
    assigned_students: [],
    created_at: "2024-01-01T00:00:00Z",
    last_login: null,
  },
  {
    id: "c2-sarah-002",
    email: "sarah.park@irisedu.com",
    password: "$2b$10$.wap53977auLOS0Hb8Tn7ebTEj05FAlyIFOTJ2zEwdlf95cjIfV6S",
    name: "박선영",
    name_en: "Sarah Park",
    role: "counselor",
    specialization: ["STEM", "Ivy League"],
    assigned_students: ["s1-minjun-001"],
    created_at: "2024-01-15T00:00:00Z",
    last_login: "2024-12-01T09:00:00Z",
  },
  {
    id: "c3-james-003",
    email: "james.kim@irisedu.com",
    password: "$2b$10$.wap53977auLOS0Hb8Tn7ebTEj05FAlyIFOTJ2zEwdlf95cjIfV6S",
    name: "김재현",
    name_en: "James Kim",
    role: "counselor",
    specialization: ["Liberal Arts", "Business"],
    assigned_students: ["s2-seoyeon-002"],
    created_at: "2024-02-01T00:00:00Z",
    last_login: "2024-11-28T14:30:00Z",
  },
];

// Students
const students: Student[] = [
  {
    id: "s1-minjun-001",
    assigned_counselor_id: "c2-sarah-002",
    name_korean: "김민준",
    name_english: "Minjun Kim",
    email: "minjun.kim@email.com",
    phone: "010-1234-5678",
    grade: 11,
    school_type: "domestic_korean",
    current_school: "대원외국어고등학교",
    graduation_year: 2026,
    academic: {
      gpa: { unweighted: 3.95, weighted: 4.3, scale: "4.0" },
      class_rank: { rank: 5, total: 280 },
      courses: [
        { name: "AP Calculus BC", level: "AP", grade: "A", year: "11th", subject_area: "math" },
        { name: "AP Physics C: Mechanics", level: "AP", grade: "A", year: "11th", subject_area: "science" },
        { name: "AP Computer Science A", level: "AP", grade: "A", year: "10th", subject_area: "science" },
        { name: "AP Chemistry", level: "AP", grade: "A", year: "10th", subject_area: "science" },
        { name: "AP English Language", level: "AP", grade: "A-", year: "11th", subject_area: "english" },
        { name: "AP US History", level: "AP", grade: "A", year: "10th", subject_area: "social_studies" },
      ],
      standardized_tests: {
        sat: { total: 1540, reading_writing: 740, math: 800, date: "2024-10-05" },
        act: { composite: null, english: null, math: null, reading: null, science: null, date: null },
        ap_scores: [
          { subject: "Computer Science A", score: 5, year: "2024" },
          { subject: "Chemistry", score: 5, year: "2024" },
          { subject: "US History", score: 4, year: "2024" },
        ],
        toefl: { total: 115, date: "2024-06-15" },
      },
    },
    extracurriculars: [
      {
        name: "Robotics Club",
        category: "academic",
        role: "President",
        description: "Led school robotics team in national and international competitions.",
        hours_per_week: 15,
        weeks_per_year: 40,
        years: ["9", "10", "11"],
        achievements: ["1st Place, Korea Robot Olympiad Regional 2024", "3rd Place, FRC Korea Championship 2023"],
      },
      {
        name: "KAIST Research Internship",
        category: "academic",
        role: "Research Assistant",
        description: "Conducted research on machine learning applications in robotics.",
        hours_per_week: 20,
        weeks_per_year: 8,
        years: ["10", "11"],
        achievements: ["Co-author on pending publication", "Presented at Korea AI Conference 2024"],
      },
    ],
    awards: [
      { name: "Korean Mathematical Olympiad (KMO)", level: "national", year: "2024", description: "Silver Medal" },
      { name: "Korea Robot Olympiad", level: "regional", year: "2024", description: "1st Place" },
    ],
    target_universities: [
      { university_id: "mit", priority: "reach", intended_major: "Computer Science", application_round: "EA" },
      { university_id: "stanford", priority: "reach", intended_major: "Computer Science", application_round: "RD" },
      { university_id: "cmu", priority: "target", intended_major: "Computer Science", application_round: "RD" },
      { university_id: "berkeley", priority: "target", intended_major: "EECS", application_round: "RD" },
      { university_id: "georgia-tech", priority: "safety", intended_major: "Computer Science", application_round: "EA" },
    ],
    saved_reports: [],
    application_status: "applying",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-12-01T15:30:00Z",
    notes: "Strong STEM profile with genuine research experience. Focus on MIT EA.",
  },
  {
    id: "s2-seoyeon-002",
    assigned_counselor_id: "c3-james-003",
    name_korean: "이서연",
    name_english: "Seoyeon Lee",
    email: "seoyeon.lee@email.com",
    phone: "010-9876-5432",
    grade: 11,
    school_type: "international_in_korea",
    current_school: "Seoul International School",
    graduation_year: 2026,
    academic: {
      gpa: { unweighted: 3.88, weighted: 4.15, scale: "4.0" },
      class_rank: { rank: 12, total: 150 },
      courses: [
        { name: "AP English Literature", level: "AP", grade: "A", year: "11th", subject_area: "english" },
        { name: "AP Psychology", level: "AP", grade: "A", year: "11th", subject_area: "social_studies" },
        { name: "AP World History", level: "AP", grade: "A", year: "10th", subject_area: "social_studies" },
        { name: "AP Statistics", level: "AP", grade: "A-", year: "11th", subject_area: "math" },
        { name: "AP French", level: "AP", grade: "A", year: "11th", subject_area: "foreign_language" },
      ],
      standardized_tests: {
        sat: { total: 1510, reading_writing: 790, math: 720, date: "2024-08-24" },
        act: { composite: null, english: null, math: null, reading: null, science: null, date: null },
        ap_scores: [
          { subject: "World History", score: 5, year: "2024" },
          { subject: "French Language", score: 4, year: "2024" },
        ],
        toefl: null,
      },
    },
    extracurriculars: [
      {
        name: "Debate Team",
        category: "academic",
        role: "Captain",
        description: "Led school debate team in national and international Model UN competitions.",
        hours_per_week: 12,
        weeks_per_year: 40,
        years: ["9", "10", "11"],
        achievements: ["Best Delegate, HMUN Korea 2024", "Outstanding Speaker, Korea National Debate Tournament 2023"],
      },
      {
        name: "Literary Magazine",
        category: "arts",
        role: "Editor-in-Chief",
        description: "Lead editorial team for school's award-winning literary magazine.",
        hours_per_week: 8,
        weeks_per_year: 35,
        years: ["10", "11"],
        achievements: ["Scholastic Art & Writing Awards - Silver Key"],
      },
    ],
    awards: [
      { name: "Scholastic Art & Writing Awards", level: "national", year: "2024", description: "Silver Key for Personal Essay" },
      { name: "Korea National Debate Tournament", level: "national", year: "2023", description: "Outstanding Speaker Award" },
    ],
    target_universities: [
      { university_id: "yale", priority: "reach", intended_major: "Political Science", application_round: "REA" },
      { university_id: "columbia", priority: "reach", intended_major: "Political Science", application_round: "RD" },
      { university_id: "upenn", priority: "target", intended_major: "Philosophy, Politics, and Economics", application_round: "RD" },
      { university_id: "northwestern", priority: "target", intended_major: "Journalism", application_round: "ED2" },
      { university_id: "nyu", priority: "safety", intended_major: "Politics", application_round: "RD" },
    ],
    saved_reports: [],
    application_status: "preparing",
    created_at: "2024-04-01T14:00:00Z",
    updated_at: "2024-11-28T11:00:00Z",
    notes: "Strong writer with genuine passion for advocacy. Yale REA is strategic choice.",
  },
];

// Timeline Events
const timelineEvents: TimelineEvent[] = [
  {
    id: "t1-sat-complete",
    student_id: "s1-minjun-001",
    counselor_id: "c2-sarah-002",
    event_type: "milestone",
    title: "SAT 첫 시험 완료",
    description: "총점 1540점 달성 (Math 800, R/W 740). 목표 점수 달성!",
    date: "2024-10-05T00:00:00Z",
    status: "completed",
    score_achieved: "1540",
    created_at: "2024-10-06T10:00:00Z",
    updated_at: "2024-10-06T10:00:00Z",
  },
  {
    id: "t2-monthly-meeting",
    student_id: "s1-minjun-001",
    counselor_id: "c2-sarah-002",
    event_type: "meeting",
    title: "월간 상담 미팅",
    description: "MIT EA 전략 논의. 에세이 토픽 브레인스토밍 완료.",
    date: "2024-10-15T14:00:00Z",
    status: "completed",
    created_at: "2024-10-15T15:00:00Z",
    updated_at: "2024-10-15T15:00:00Z",
  },
  {
    id: "t3-mit-submitted",
    student_id: "s1-minjun-001",
    counselor_id: "c2-sarah-002",
    event_type: "application_submitted",
    title: "MIT Early Action 원서 제출",
    description: "모든 서류 제출 완료. 인터뷰 대기 중.",
    date: "2024-11-01T23:55:00Z",
    status: "completed",
    related_university_id: "mit",
    created_at: "2024-11-02T00:05:00Z",
    updated_at: "2024-11-02T00:05:00Z",
  },
  {
    id: "t4-mit-interview",
    student_id: "s1-minjun-001",
    counselor_id: "c2-sarah-002",
    event_type: "task_assigned",
    title: "MIT 인터뷰 준비",
    description: "예상 질문 목록 검토 및 모의 인터뷰 연습.",
    date: "2024-11-15T00:00:00Z",
    due_date: "2024-11-20T00:00:00Z",
    status: "pending",
    related_university_id: "mit",
    created_at: "2024-11-10T09:00:00Z",
    updated_at: "2024-11-10T09:00:00Z",
  },
  {
    id: "t5-seoyeon-sat",
    student_id: "s2-seoyeon-002",
    counselor_id: "c3-james-003",
    event_type: "test_taken",
    title: "SAT 시험 완료",
    description: "총점 1510점 달성 (R/W 790, Math 720).",
    date: "2024-08-24T00:00:00Z",
    status: "completed",
    score_achieved: "1510",
    created_at: "2024-08-25T10:00:00Z",
    updated_at: "2024-08-25T10:00:00Z",
  },
  {
    id: "t6-seoyeon-yale-submitted",
    student_id: "s2-seoyeon-002",
    counselor_id: "c3-james-003",
    event_type: "application_submitted",
    title: "Yale REA 원서 제출",
    description: "Yale Restrictive Early Action 원서 제출 완료.",
    date: "2024-11-01T22:30:00Z",
    status: "completed",
    related_university_id: "yale",
    created_at: "2024-11-01T23:00:00Z",
    updated_at: "2024-11-01T23:00:00Z",
  },
];

// University Index
const universityIndex: UniversityListItem[] = [
  { university_id: "mit", name: "Massachusetts Institute of Technology", name_short: "MIT", location: "Cambridge, MA", acceptance_rate: 3.96, type: "Private Research" },
  { university_id: "stanford", name: "Stanford University", name_short: "Stanford", location: "Stanford, CA", acceptance_rate: 3.68, type: "Private Research" },
  { university_id: "harvard", name: "Harvard University", name_short: "Harvard", location: "Cambridge, MA", acceptance_rate: 3.41, type: "Private Research" },
  { university_id: "yale", name: "Yale University", name_short: "Yale", location: "New Haven, CT", acceptance_rate: 4.57, type: "Private Research" },
  { university_id: "princeton", name: "Princeton University", name_short: "Princeton", location: "Princeton, NJ", acceptance_rate: 4.38, type: "Private Research" },
  { university_id: "caltech", name: "California Institute of Technology", name_short: "Caltech", location: "Pasadena, CA", acceptance_rate: 2.70, type: "Private Research" },
  { university_id: "uchicago", name: "University of Chicago", name_short: "UChicago", location: "Chicago, IL", acceptance_rate: 5.40, type: "Private Research" },
  { university_id: "upenn", name: "University of Pennsylvania", name_short: "UPenn", location: "Philadelphia, PA", acceptance_rate: 5.68, type: "Private Research" },
  { university_id: "columbia", name: "Columbia University", name_short: "Columbia", location: "New York, NY", acceptance_rate: 3.93, type: "Private Research" },
  { university_id: "duke", name: "Duke University", name_short: "Duke", location: "Durham, NC", acceptance_rate: 5.98, type: "Private Research" },
  { university_id: "northwestern", name: "Northwestern University", name_short: "Northwestern", location: "Evanston, IL", acceptance_rate: 7.01, type: "Private Research" },
  { university_id: "jhu", name: "Johns Hopkins University", name_short: "Johns Hopkins", location: "Baltimore, MD", acceptance_rate: 7.39, type: "Private Research" },
  { university_id: "dartmouth", name: "Dartmouth College", name_short: "Dartmouth", location: "Hanover, NH", acceptance_rate: 6.24, type: "Private Liberal Arts" },
  { university_id: "brown", name: "Brown University", name_short: "Brown", location: "Providence, RI", acceptance_rate: 5.09, type: "Private Research" },
  { university_id: "vanderbilt", name: "Vanderbilt University", name_short: "Vanderbilt", location: "Nashville, TN", acceptance_rate: 6.72, type: "Private Research" },
  { university_id: "rice", name: "Rice University", name_short: "Rice", location: "Houston, TX", acceptance_rate: 8.56, type: "Private Research" },
  { university_id: "cornell", name: "Cornell University", name_short: "Cornell", location: "Ithaca, NY", acceptance_rate: 7.88, type: "Private Research" },
  { university_id: "notre-dame", name: "University of Notre Dame", name_short: "Notre Dame", location: "Notre Dame, IN", acceptance_rate: 12.90, type: "Private Research" },
  { university_id: "washu", name: "Washington University in St. Louis", name_short: "WashU", location: "St. Louis, MO", acceptance_rate: 11.10, type: "Private Research" },
  { university_id: "georgetown", name: "Georgetown University", name_short: "Georgetown", location: "Washington, DC", acceptance_rate: 12.20, type: "Private Research" },
  { university_id: "cmu", name: "Carnegie Mellon University", name_short: "CMU", location: "Pittsburgh, PA", acceptance_rate: 11.30, type: "Private Research" },
  { university_id: "emory", name: "Emory University", name_short: "Emory", location: "Atlanta, GA", acceptance_rate: 11.40, type: "Private Research" },
  { university_id: "usc", name: "University of Southern California", name_short: "USC", location: "Los Angeles, CA", acceptance_rate: 9.90, type: "Private Research" },
  { university_id: "ucla", name: "University of California, Los Angeles", name_short: "UCLA", location: "Los Angeles, CA", acceptance_rate: 8.77, type: "Public Research" },
  { university_id: "berkeley", name: "University of California, Berkeley", name_short: "UC Berkeley", location: "Berkeley, CA", acceptance_rate: 11.40, type: "Public Research" },
  { university_id: "umich", name: "University of Michigan", name_short: "UMich", location: "Ann Arbor, MI", acceptance_rate: 17.70, type: "Public Research" },
  { university_id: "nyu", name: "New York University", name_short: "NYU", location: "New York, NY", acceptance_rate: 12.20, type: "Private Research" },
  { university_id: "tufts", name: "Tufts University", name_short: "Tufts", location: "Medford, MA", acceptance_rate: 10.00, type: "Private Research" },
  { university_id: "uva", name: "University of Virginia", name_short: "UVA", location: "Charlottesville, VA", acceptance_rate: 18.70, type: "Public Research" },
  { university_id: "unc", name: "University of North Carolina at Chapel Hill", name_short: "UNC", location: "Chapel Hill, NC", acceptance_rate: 16.80, type: "Public Research" },
  { university_id: "boston-college", name: "Boston College", name_short: "BC", location: "Chestnut Hill, MA", acceptance_rate: 16.10, type: "Private Research" },
  { university_id: "boston-u", name: "Boston University", name_short: "BU", location: "Boston, MA", acceptance_rate: 14.40, type: "Private Research" },
  { university_id: "georgia-tech", name: "Georgia Institute of Technology", name_short: "Georgia Tech", location: "Atlanta, GA", acceptance_rate: 16.00, type: "Public Research" },
  { university_id: "wake-forest", name: "Wake Forest University", name_short: "Wake Forest", location: "Winston-Salem, NC", acceptance_rate: 21.30, type: "Private Research" },
  { university_id: "rochester", name: "University of Rochester", name_short: "Rochester", location: "Rochester, NY", acceptance_rate: 39.00, type: "Private Research" },
  { university_id: "brandeis", name: "Brandeis University", name_short: "Brandeis", location: "Waltham, MA", acceptance_rate: 34.00, type: "Private Research" },
  { university_id: "case-western", name: "Case Western Reserve University", name_short: "Case Western", location: "Cleveland, OH", acceptance_rate: 30.00, type: "Private Research" },
  { university_id: "tulane", name: "Tulane University", name_short: "Tulane", location: "New Orleans, LA", acceptance_rate: 11.00, type: "Private Research" },
  { university_id: "ucsd", name: "University of California, San Diego", name_short: "UCSD", location: "San Diego, CA", acceptance_rate: 24.70, type: "Public Research" },
  { university_id: "uci", name: "University of California, Irvine", name_short: "UCI", location: "Irvine, CA", acceptance_rate: 21.00, type: "Public Research" },
  { university_id: "ucdavis", name: "University of California, Davis", name_short: "UC Davis", location: "Davis, CA", acceptance_rate: 37.00, type: "Public Research" },
  { university_id: "ucsb", name: "University of California, Santa Barbara", name_short: "UCSB", location: "Santa Barbara, CA", acceptance_rate: 25.80, type: "Public Research" },
  { university_id: "ut-austin", name: "University of Texas at Austin", name_short: "UT Austin", location: "Austin, TX", acceptance_rate: 31.00, type: "Public Research" },
  { university_id: "uiuc", name: "University of Illinois Urbana-Champaign", name_short: "UIUC", location: "Champaign, IL", acceptance_rate: 44.80, type: "Public Research" },
  { university_id: "purdue", name: "Purdue University", name_short: "Purdue", location: "West Lafayette, IN", acceptance_rate: 53.00, type: "Public Research" },
  { university_id: "wisconsin", name: "University of Wisconsin-Madison", name_short: "UW-Madison", location: "Madison, WI", acceptance_rate: 49.00, type: "Public Research" },
  { university_id: "psu", name: "Pennsylvania State University", name_short: "Penn State", location: "University Park, PA", acceptance_rate: 55.00, type: "Public Research" },
  { university_id: "osu", name: "Ohio State University", name_short: "Ohio State", location: "Columbus, OH", acceptance_rate: 53.00, type: "Public Research" },
  { university_id: "uw", name: "University of Washington", name_short: "UW", location: "Seattle, WA", acceptance_rate: 48.00, type: "Public Research" },
  { university_id: "northeastern", name: "Northeastern University", name_short: "Northeastern", location: "Boston, MA", acceptance_rate: 6.70, type: "Private Research" },
];

// Complete university details for key universities
const completeUniversityDetails: Record<string, University> = {
  mit: {
    university_id: "mit",
    basic_info: {
      name: "Massachusetts Institute of Technology",
      name_short: "MIT",
      location: { city: "Cambridge", state: "Massachusetts", region: "Northeast" },
      type: "Private Research",
      founded: 1861,
      website: "https://www.mit.edu",
    },
    enrollment: { total_undergraduate: 4500, international_percentage: 11.2 },
    admission_stats: {
      acceptance_rate: 3.96,
      early_action_rate: 4.7,
      yield_rate: 85,
      total_applicants: 26914,
      total_admitted: 1067,
      international_applicants: 5500,
      international_admitted: 140,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.95, median: 4.0, "75th": 4.0 },
        sat_total: { "25th": 1510, median: 1550, "75th": 1580 },
        sat_math: { "25th": 780, median: 800, "75th": 800 },
        act_composite: { "25th": 34, median: 35, "75th": 36 },
      },
    },
    application_requirements: {
      deadline_early: "November 1",
      deadline_regular: "January 5",
      application_platform: "MyMIT",
      application_fee: 75,
      test_policy: "Test flexible - SAT/ACT optional",
      english_proficiency: { minimum_toefl: 90, minimum_ielts: 7.0 },
    },
    academic_programs: {
      notable_majors: ["Computer Science", "EECS", "Mechanical Engineering", "Physics", "Mathematics"],
      unique_programs: ["UROP Research Program", "MIT Media Lab", "Cross-registration with Harvard"],
    },
    korean_student_specific: {
      korean_student_organizations: ["Korean Students Association", "MIT KSEA"],
      korean_food_access: "H Mart in Cambridge (15 min), Korean restaurants in Allston",
      korean_church_proximity: "Boston Korean Church (20 min)",
      korean_specific_advice: [
        "MIT values 'making things' - demonstrate building projects",
        "Research experience with genuine intellectual contribution is valued",
        "Essays should show personality, not just achievements",
        "Show collaboration - MIT culture is collaborative",
      ],
      common_korean_applicant_mistakes: [
        "Over-focusing on olympiad credentials without personality",
        "Essays too formal/achievement-focused",
        "Not demonstrating hands-on maker culture fit",
      ],
      historical_admit_patterns: {
        korean_high_schools_commonly_admitted: ["대원외고", "민사고", "Seoul International School", "KIS"],
      },
    },
    cost_and_aid: {
      tuition: 57986,
      room_and_board: 19980,
      total_cost_of_attendance: 82000,
      financial_aid_for_international: true,
      average_aid_package: 62000,
    },
    campus_life: {
      housing_guarantee: "4 years guaranteed",
      safety_rating: "High",
      nearby_attractions: "Boston, Harvard Square, Charles River",
    },
    career_outcomes: {
      employment_rate_6_months: 95,
      average_starting_salary: 118000,
      top_employers: ["Google", "Apple", "Microsoft", "McKinsey", "Goldman Sachs"],
      graduate_school_rate: 42,
    },
    last_updated: "2024-12-01",
  } as University,

  stanford: {
    university_id: "stanford",
    basic_info: {
      name: "Stanford University",
      name_short: "Stanford",
      location: { city: "Stanford", state: "California", region: "West Coast" },
      type: "Private Research",
      founded: 1885,
      website: "https://www.stanford.edu",
    },
    admission_stats: {
      acceptance_rate: 3.68,
      yield_rate: 82,
      total_applicants: 56378,
      total_admitted: 2075,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.9, median: 3.96, "75th": 4.0 },
        sat_total: { "25th": 1500, median: 1550, "75th": 1580 },
        act_composite: { "25th": 33, median: 35, "75th": 36 },
      },
    },
    application_requirements: {
      deadline_regular: "January 2",
      application_platform: "Common App + Coalition",
      application_fee: 90,
      test_policy: "Test optional",
      english_proficiency: { minimum_toefl: 100 },
    },
    academic_programs: {
      notable_majors: ["Computer Science", "Engineering", "Economics", "Human Biology"],
      unique_programs: ["Stanford d.school", "StartX Accelerator", "Bing Overseas Studies"],
    },
    korean_student_specific: {
      korean_specific_advice: [
        "Stanford loves intellectual vitality - show curiosity",
        "Entrepreneurial spirit valued highly",
        "'What matters to you' essay is crucial",
      ],
      common_korean_applicant_mistakes: [
        "Cookie-cutter activities without passion",
        "Not showing 'Why Stanford' specifically",
      ],
    },
    cost_and_aid: {
      tuition: 61731,
      room_and_board: 20955,
      total_cost_of_attendance: 87225,
      financial_aid_for_international: true,
      average_aid_package: 64000,
    },
    campus_life: { housing_guarantee: "4 years", safety_rating: "High" },
    career_outcomes: {
      employment_rate_6_months: 94,
      average_starting_salary: 115000,
      top_employers: ["Google", "Apple", "Meta", "McKinsey"],
    },
    last_updated: "2024-12-01",
  } as University,

  yale: {
    university_id: "yale",
    basic_info: {
      name: "Yale University",
      name_short: "Yale",
      location: { city: "New Haven", state: "Connecticut", region: "Northeast" },
      type: "Private Research",
      founded: 1701,
      website: "https://www.yale.edu",
    },
    admission_stats: {
      acceptance_rate: 4.57,
      early_action_rate: 10.0,
      yield_rate: 72,
      total_applicants: 52250,
      total_admitted: 2289,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.9, median: 3.95, "75th": 4.0 },
        sat_total: { "25th": 1470, median: 1540, "75th": 1570 },
        act_composite: { "25th": 33, median: 35, "75th": 36 },
      },
    },
    application_requirements: {
      deadline_early: "November 1 (REA)",
      deadline_regular: "January 2",
      application_platform: "Common App + Coalition + QuestBridge",
      application_fee: 80,
      test_policy: "Test optional through 2024-25",
      english_proficiency: { minimum_toefl: 100, minimum_ielts: 7.0 },
    },
    academic_programs: {
      notable_majors: ["Political Science", "Economics", "History", "English", "Psychology"],
      unique_programs: ["Residential College System", "Yale-NUS College", "Global Health Studies"],
    },
    korean_student_specific: {
      korean_student_organizations: ["Korean American Students at Yale (KASY)", "Yale Korean Undergraduate Students Association"],
      korean_specific_advice: [
        "Yale values intellectual breadth and curiosity",
        "Residential college system - show you value community",
        "Strong writing skills are essential",
        "Show engagement with social issues",
      ],
      common_korean_applicant_mistakes: [
        "Focusing only on academic achievements",
        "Not demonstrating fit with liberal arts culture",
        "Generic 'Why Yale' essay",
      ],
    },
    cost_and_aid: {
      tuition: 64700,
      room_and_board: 19200,
      total_cost_of_attendance: 87900,
      financial_aid_for_international: true,
      average_aid_package: 67000,
    },
    campus_life: { housing_guarantee: "4 years", safety_rating: "Good" },
    career_outcomes: {
      employment_rate_6_months: 92,
      average_starting_salary: 95000,
      top_employers: ["Goldman Sachs", "McKinsey", "Google", "Yale University"],
    },
    last_updated: "2024-12-01",
  } as University,

  cmu: {
    university_id: "cmu",
    basic_info: {
      name: "Carnegie Mellon University",
      name_short: "CMU",
      location: { city: "Pittsburgh", state: "Pennsylvania", region: "Northeast" },
      type: "Private Research",
      founded: 1900,
    },
    admission_stats: {
      acceptance_rate: 11.3,
      yield_rate: 42,
      total_applicants: 34261,
      total_admitted: 3871,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.85, median: 3.92, "75th": 4.0 },
        sat_total: { "25th": 1480, median: 1530, "75th": 1570 },
        act_composite: { "25th": 33, median: 35, "75th": 36 },
      },
    },
    application_requirements: {
      deadline_early: "November 1 (ED)",
      deadline_regular: "January 3",
      application_platform: "Common App",
      application_fee: 75,
      test_policy: "Test optional",
      english_proficiency: { minimum_toefl: 102 },
    },
    academic_programs: {
      notable_majors: ["Computer Science", "ECE", "Statistics", "Drama", "Design"],
      unique_programs: ["School of Computer Science", "Robotics Institute", "Entertainment Technology Center"],
    },
    korean_student_specific: {
      korean_specific_advice: [
        "CMU values technical excellence AND creativity",
        "School-specific essays are important",
        "Show passion for your specific major",
      ],
    },
    cost_and_aid: {
      tuition: 62260,
      room_and_board: 18230,
      total_cost_of_attendance: 83750,
      financial_aid_for_international: true,
      average_aid_package: 52000,
    },
    career_outcomes: {
      employment_rate_6_months: 93,
      average_starting_salary: 105000,
      top_employers: ["Google", "Amazon", "Meta", "Apple", "Microsoft"],
    },
    last_updated: "2024-12-01",
  } as University,

  berkeley: {
    university_id: "berkeley",
    basic_info: {
      name: "University of California, Berkeley",
      name_short: "UC Berkeley",
      location: { city: "Berkeley", state: "California", region: "West Coast" },
      type: "Public Research",
      founded: 1868,
    },
    admission_stats: {
      acceptance_rate: 11.4,
      yield_rate: 46,
      total_applicants: 128226,
      total_admitted: 14603,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.85, median: 3.93, "75th": 4.0 },
        sat_total: { "25th": 1330, median: 1440, "75th": 1530 },
        act_composite: { "25th": 29, median: 33, "75th": 35 },
      },
    },
    application_requirements: {
      deadline_regular: "November 30",
      application_platform: "UC Application",
      application_fee: 80,
      test_policy: "Test blind",
      english_proficiency: { minimum_toefl: 80 },
    },
    academic_programs: {
      notable_majors: ["EECS", "Computer Science", "Economics", "Molecular Biology", "Political Science"],
      unique_programs: ["Berkeley Haas", "College of Engineering", "Cal Discoveries"],
    },
    korean_student_specific: {
      korean_specific_advice: [
        "PIQs (Personal Insight Questions) are crucial",
        "Show leadership and initiative",
        "Demonstrate fit with public university mission",
      ],
    },
    cost_and_aid: {
      tuition: 44066,
      room_and_board: 21270,
      total_cost_of_attendance: 74076,
      financial_aid_for_international: false,
      average_aid_package: 24000,
    },
    career_outcomes: {
      employment_rate_6_months: 88,
      average_starting_salary: 95000,
      top_employers: ["Google", "Apple", "Meta", "Amazon"],
    },
    last_updated: "2024-12-01",
  } as University,

  "georgia-tech": {
    university_id: "georgia-tech",
    basic_info: {
      name: "Georgia Institute of Technology",
      name_short: "Georgia Tech",
      location: { city: "Atlanta", state: "Georgia", region: "Southeast" },
      type: "Public Research",
      founded: 1885,
    },
    admission_stats: {
      acceptance_rate: 16.0,
      early_action_rate: 28.0,
      yield_rate: 45,
      total_applicants: 55200,
      total_admitted: 8832,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.85, median: 3.95, "75th": 4.0 },
        sat_total: { "25th": 1390, median: 1470, "75th": 1540 },
        act_composite: { "25th": 31, median: 34, "75th": 35 },
      },
    },
    application_requirements: {
      deadline_early: "October 15 (EA)",
      deadline_regular: "January 4",
      application_platform: "Common App",
      application_fee: 75,
      english_proficiency: { minimum_toefl: 90 },
    },
    academic_programs: {
      notable_majors: ["Computer Science", "Mechanical Engineering", "Industrial Engineering", "Aerospace"],
      unique_programs: ["Co-op Program", "CREATE-X", "VIP Program"],
    },
    korean_student_specific: {
      korean_specific_advice: [
        "Strong STEM focus - show technical passion",
        "Essays should demonstrate problem-solving",
        "EA highly recommended",
      ],
    },
    cost_and_aid: {
      tuition: 33794,
      room_and_board: 15640,
      total_cost_of_attendance: 55000,
      financial_aid_for_international: false,
    },
    career_outcomes: {
      employment_rate_6_months: 90,
      average_starting_salary: 85000,
      top_employers: ["Google", "Amazon", "Microsoft", "Lockheed Martin"],
    },
    last_updated: "2024-12-01",
  } as University,

  columbia: {
    university_id: "columbia",
    basic_info: {
      name: "Columbia University",
      name_short: "Columbia",
      location: { city: "New York", state: "New York", region: "Northeast" },
      type: "Private Research",
      founded: 1754,
    },
    admission_stats: {
      acceptance_rate: 3.93,
      early_decision_rate: 10.0,
      yield_rate: 67,
      total_applicants: 60377,
      total_admitted: 2373,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.9, median: 3.97, "75th": 4.0 },
        sat_total: { "25th": 1500, median: 1550, "75th": 1570 },
        act_composite: { "25th": 34, median: 35, "75th": 36 },
      },
    },
    application_requirements: {
      deadline_early: "November 1 (ED)",
      deadline_regular: "January 1",
      application_platform: "Common App + Coalition",
      application_fee: 85,
      english_proficiency: { minimum_toefl: 100 },
    },
    academic_programs: {
      notable_majors: ["Economics", "Political Science", "Computer Science", "English"],
      unique_programs: ["Core Curriculum", "3-2 Engineering Program", "Global Centers"],
    },
    korean_student_specific: {
      korean_specific_advice: [
        "Core Curriculum is central - show appreciation for liberal arts",
        "NYC location should be meaningful to your goals",
        "List essays reflect intellectual depth",
      ],
    },
    cost_and_aid: {
      tuition: 65524,
      room_and_board: 17500,
      total_cost_of_attendance: 89000,
      financial_aid_for_international: true,
      average_aid_package: 68000,
    },
    career_outcomes: {
      employment_rate_6_months: 91,
      average_starting_salary: 90000,
      top_employers: ["Goldman Sachs", "JPMorgan", "McKinsey", "Google"],
    },
    last_updated: "2024-12-01",
  } as University,

  upenn: {
    university_id: "upenn",
    basic_info: {
      name: "University of Pennsylvania",
      name_short: "UPenn",
      location: { city: "Philadelphia", state: "Pennsylvania", region: "Northeast" },
      type: "Private Research",
      founded: 1740,
    },
    admission_stats: {
      acceptance_rate: 5.68,
      early_decision_rate: 15.0,
      yield_rate: 68,
      total_applicants: 59000,
      total_admitted: 3350,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.9, median: 3.95, "75th": 4.0 },
        sat_total: { "25th": 1500, median: 1540, "75th": 1570 },
        act_composite: { "25th": 33, median: 35, "75th": 36 },
      },
    },
    application_requirements: {
      deadline_early: "November 1 (ED)",
      deadline_regular: "January 5",
      application_platform: "Common App",
      application_fee: 75,
      english_proficiency: { minimum_toefl: 100 },
    },
    academic_programs: {
      notable_majors: ["Finance (Wharton)", "Economics", "Nursing", "Engineering"],
      unique_programs: ["Wharton School", "M&T Program", "Huntsman Program", "Jerome Fisher Program"],
    },
    korean_student_specific: {
      korean_specific_advice: [
        "Show entrepreneurial spirit",
        "Penn values practical application of knowledge",
        "Cross-school interest is valued",
      ],
    },
    cost_and_aid: {
      tuition: 63452,
      room_and_board: 18600,
      total_cost_of_attendance: 86000,
      financial_aid_for_international: true,
      average_aid_package: 60000,
    },
    career_outcomes: {
      employment_rate_6_months: 94,
      average_starting_salary: 95000,
      top_employers: ["Goldman Sachs", "McKinsey", "Bain", "Google"],
    },
    last_updated: "2024-12-01",
  } as University,

  northwestern: {
    university_id: "northwestern",
    basic_info: {
      name: "Northwestern University",
      name_short: "Northwestern",
      location: { city: "Evanston", state: "Illinois", region: "Midwest" },
      type: "Private Research",
      founded: 1851,
    },
    admission_stats: {
      acceptance_rate: 7.01,
      early_decision_rate: 20.0,
      yield_rate: 58,
      total_applicants: 51500,
      total_admitted: 3610,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.85, median: 3.94, "75th": 4.0 },
        sat_total: { "25th": 1470, median: 1530, "75th": 1570 },
        act_composite: { "25th": 33, median: 34, "75th": 35 },
      },
    },
    application_requirements: {
      deadline_early: "November 1 (ED)",
      deadline_regular: "January 3",
      application_platform: "Common App + Coalition",
      application_fee: 75,
      english_proficiency: { minimum_toefl: 100 },
    },
    academic_programs: {
      notable_majors: ["Journalism (Medill)", "Economics", "Engineering", "Theatre"],
      unique_programs: ["Medill School of Journalism", "Kellogg Certificate", "Integrated Science Program"],
    },
    korean_student_specific: {
      korean_specific_advice: [
        "Show multi-dimensional interests",
        "Journalism and communications are world-class",
        "ED significantly increases chances",
      ],
    },
    cost_and_aid: {
      tuition: 63468,
      room_and_board: 19800,
      total_cost_of_attendance: 87000,
      financial_aid_for_international: true,
      average_aid_package: 58000,
    },
    career_outcomes: {
      employment_rate_6_months: 92,
      average_starting_salary: 85000,
      top_employers: ["McKinsey", "Google", "NBC", "Goldman Sachs"],
    },
    last_updated: "2024-12-01",
  } as University,

  nyu: {
    university_id: "nyu",
    basic_info: {
      name: "New York University",
      name_short: "NYU",
      location: { city: "New York", state: "New York", region: "Northeast" },
      type: "Private Research",
      founded: 1831,
    },
    admission_stats: {
      acceptance_rate: 12.2,
      early_decision_rate: 25.0,
      yield_rate: 40,
      total_applicants: 120000,
      total_admitted: 14640,
      profile_ranges: {
        gpa_unweighted: { "25th": 3.7, median: 3.85, "75th": 3.95 },
        sat_total: { "25th": 1420, median: 1500, "75th": 1560 },
        act_composite: { "25th": 32, median: 34, "75th": 35 },
      },
    },
    application_requirements: {
      deadline_early: "November 1 (ED/ED II)",
      deadline_regular: "January 5",
      application_platform: "Common App",
      application_fee: 80,
      english_proficiency: { minimum_toefl: 100 },
    },
    academic_programs: {
      notable_majors: ["Business (Stern)", "Film (Tisch)", "Politics", "Economics"],
      unique_programs: ["Stern School of Business", "Tisch School of the Arts", "Global Sites (Abu Dhabi, Shanghai)"],
    },
    korean_student_specific: {
      korean_food_access: "Koreatown Manhattan (10 min), Flushing (30 min)",
      korean_specific_advice: [
        "NYC is integral to NYU experience - show city engagement",
        "Strong arts and business schools",
        "Global campuses are unique opportunity",
      ],
    },
    cost_and_aid: {
      tuition: 58168,
      room_and_board: 21000,
      total_cost_of_attendance: 86000,
      financial_aid_for_international: true,
      average_aid_package: 45000,
    },
    career_outcomes: {
      employment_rate_6_months: 88,
      average_starting_salary: 78000,
      top_employers: ["Goldman Sachs", "JPMorgan", "Google", "Disney"],
    },
    last_updated: "2024-12-01",
  } as University,
};

// Helper function to create a minimal university detail for others
function createUniversityDetail(item: UniversityListItem): University {
  return {
    university_id: item.university_id,
    basic_info: {
      name: item.name,
      name_short: item.name_short,
      location: {
        city: item.location.split(", ")[0],
        state: item.location.split(", ")[1] || "",
        region: "USA",
      },
      type: item.type,
      website: `https://www.${item.university_id}.edu`,
    },
    admission_stats: {
      acceptance_rate: item.acceptance_rate,
    },
    korean_student_specific: {
      korean_specific_advice: [
        "한국 학생들에게 적합한 프로그램을 확인하세요",
        "영어 능력 요구사항을 충족하는지 확인하세요",
      ],
    },
    last_updated: new Date().toISOString(),
  } as University;
}

// Generate university details from index, using complete data when available
const universityDetails: Record<string, University> = {};
universityIndex.forEach((item) => {
  // Use consolidated data if available, otherwise fallback to basic detail
  if (allUniversityDetails[item.university_id]) {
    universityDetails[item.university_id] = allUniversityDetails[item.university_id];
  } else if (completeUniversityDetails[item.university_id]) {
    universityDetails[item.university_id] = completeUniversityDetails[item.university_id];
  } else {
    universityDetails[item.university_id] = createUniversityDetail(item);
  }
});

// Export consolidated seed data
export const seedData = {
  counselors,
  students,
  timelineEvents,
  universities: {
    index: universityIndex,
    details: universityDetails,
  },
};
