import type { Student } from "@/types/student";
import type { University } from "@/types/university";

/**
 * Multi-stage analysis prompts designed to work within Netlify's 26-second timeout.
 * Each stage produces a focused JSON output that completes within the time limit.
 */

// Type for stage context passed between stages
export interface AnalysisContext {
  student: Student;
  universities: University[];
  stage1Result?: Stage1Result;
  stage2Result?: Stage2Result;
  stage3Result?: Stage3Result;
}

export interface Stage1Result {
  overall_assessment: {
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    korean_student_context: string;
    competitiveness_tier: string;
  };
}

export interface Stage2Result {
  university_analyses: Array<{
    university_id: string;
    university_name: string;
    admission_probability: {
      score: number;
      category: string;
      confidence: string;
    };
    profile_match: {
      academic_fit: number;
      extracurricular_fit: number;
      personal_fit: number;
      overall_fit: number;
    };
    strengths_for_school: string[];
    gaps_to_address: string[];
    application_strategy: string;
    essay_themes_suggested: string[];
    korean_student_advantage: string;
    korean_student_challenge: string;
  }>;
}

export interface Stage3Result {
  ed_rd_strategy: {
    recommended_ed_school: {
      university_id: string;
      rationale: string;
      admission_boost_estimate: string;
      fit_score: number;
    };
    backup_ed2_school: {
      university_id: string;
      rationale: string;
      conditions: string;
    } | null;
    ea_rea_recommendations: Array<{
      university_id: string;
      round: string;
      rationale: string;
    }>;
    rd_portfolio: {
      reach_schools: string[];
      target_schools: string[];
      safety_schools: string[];
      ideal_total_count: number;
      portfolio_balance_advice: string;
    };
    strategic_warnings: string[];
  };
  strategic_recommendations: {
    immediate_actions: string[];
    short_term_goals: string[];
    long_term_positioning: string[];
    korean_specific_strategies: string[];
  };
}

export interface Stage4Result {
  detailed_timeline: {
    current_status: {
      current_date: string;
      months_until_ed_deadline: number;
      phase: string;
    };
    phases: Array<{
      phase_name: string;
      date_range: string;
      priority_level: string;
      objectives: string[];
      key_tasks: string[];
      milestones: Array<{
        name: string;
        target_date: string;
        success_criteria: string;
      }>;
    }>;
    test_schedule: {
      sat_dates: Array<{
        date: string;
        purpose: string;
        target_score: number;
      }>;
      toefl_dates: Array<{
        date: string;
        target_score: number;
      }>;
    };
  };
  immediate_action_items: Array<{
    action: string;
    deadline: string;
    priority: string;
    reason: string;
  }>;
}

// Helper function to format student profile for prompts
function formatStudentProfile(student: Student): string {
  return `
**Basic Information:**
- Name: ${student.name_korean} (${student.name_english})
- Grade: ${student.grade}
- School: ${student.current_school} (${student.school_type})
- Graduation Year: ${student.graduation_year}

**Academic Profile:**
- GPA: ${student.academic?.gpa?.unweighted ?? "N/A"} (unweighted)${student.academic?.gpa?.weighted ? `, ${student.academic.gpa.weighted} (weighted)` : ""}
- Class Rank: ${student.academic?.class_rank?.rank ? `${student.academic.class_rank.rank}/${student.academic.class_rank.total}` : "Not reported"}
- SAT: ${student.academic?.standardized_tests?.sat?.total || "Not taken"} (Math: ${student.academic?.standardized_tests?.sat?.math || "N/A"}, R/W: ${student.academic?.standardized_tests?.sat?.reading_writing || "N/A"})
- ACT: ${student.academic?.standardized_tests?.act?.composite || "Not taken"}
- AP Scores: ${(student.academic?.standardized_tests?.ap_scores || []).map((ap) => `${ap.subject}: ${ap.score}`).join(", ") || "None"}
- TOEFL: ${student.academic?.standardized_tests?.toefl?.total || "Not taken"}

**Extracurricular Activities:** ${(student.extracurriculars || []).length} activities
${(student.extracurriculars || []).slice(0, 5).map((e) => `- ${e.name} (${e.role}): ${e.category}`).join("\n") || "None reported"}

**Awards:** ${(student.awards || []).length} awards
${(student.awards || []).slice(0, 5).map((a) => `- ${a.name} (${a.level})`).join("\n") || "None reported"}

**Target Universities:**
${(student.target_universities || []).map((t) => `- ${t.university_id}: ${t.priority} (${t.application_round}) - ${t.intended_major}`).join("\n") || "None specified"}
`;
}

// Helper function to format university data for prompts
function formatUniversityData(universities: University[]): string {
  return universities.map((u) => {
    const basicInfo = u.basic_info || {};
    const admissionStats = u.admission_stats || {};
    const profileRanges = admissionStats.profile_ranges || {};
    const satTotal = profileRanges.sat_total || {};
    const gpaUnweighted = profileRanges.gpa_unweighted || {};
    const koreanSpecific = u.korean_student_specific || {};
    const appReqs = u.application_requirements || {};

    return `
### ${basicInfo.name || u.university_id}
- Acceptance Rate: ${admissionStats.acceptance_rate ?? "N/A"}% | ED Rate: ${admissionStats.early_decision_rate ?? "N/A"}%
- SAT: ${satTotal["25th"] ?? "?"}-${satTotal["75th"] ?? "?"} | GPA Median: ${gpaUnweighted.median ?? "N/A"}
- ED Deadline: ${appReqs.deadline_early || "N/A"} | RD Deadline: ${appReqs.deadline_regular || "N/A"}
- Korean Advice: ${(koreanSpecific.korean_specific_advice || []).slice(0, 2).join("; ") || "N/A"}`;
  }).join("\n");
}

/**
 * Stage 1: Overall Assessment
 * Focused on student competitiveness analysis only.
 * Expected completion: ~10-15 seconds
 */
export function buildStage1Prompt(student: Student, universities: University[]): string {
  const studentProfile = formatStudentProfile(student);
  const targetSchools = (student.target_universities || []).map(t => t.university_id).join(", ");

  return `You are an expert US college admissions counselor specializing in Korean students.

## Student Profile
${studentProfile}

## Target Schools: ${targetSchools || "Not specified"}

## Task
Provide ONLY an overall assessment of this student's competitiveness for US college admissions.

Respond with ONLY this JSON (no other text):
\`\`\`json
{
  "overall_assessment": {
    "summary": "2-3 sentence assessment of overall competitiveness",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_improvement": ["area 1", "area 2"],
    "korean_student_context": "1-2 sentences about positioning within Korean applicant pool",
    "competitiveness_tier": "highly_competitive|competitive|moderately_competitive|developing"
  }
}
\`\`\``;
}

/**
 * Stage 2: University-Specific Analysis
 * Analyzes fit and probability for each target university.
 * Expected completion: ~15-20 seconds
 */
export function buildStage2Prompt(
  student: Student,
  universities: University[],
  stage1Result: Stage1Result
): string {
  const studentProfile = formatStudentProfile(student);
  const universityData = formatUniversityData(universities);

  return `You are an expert US college admissions counselor specializing in Korean students.

## Student Profile
${studentProfile}

## Overall Assessment (from previous analysis)
- Summary: ${stage1Result.overall_assessment.summary}
- Tier: ${stage1Result.overall_assessment.competitiveness_tier}
- Strengths: ${stage1Result.overall_assessment.strengths.join(", ")}

## Target Universities
${universityData}

## Task
Analyze this student's fit and admission probability for EACH target university.

Respond with ONLY this JSON (no other text):
\`\`\`json
{
  "university_analyses": [
    {
      "university_id": "school-id",
      "university_name": "Full Name",
      "admission_probability": {
        "score": 0-100,
        "category": "reach|target|safety|far_reach",
        "confidence": "high|medium|low"
      },
      "profile_match": {
        "academic_fit": 0-100,
        "extracurricular_fit": 0-100,
        "personal_fit": 0-100,
        "overall_fit": 0-100
      },
      "strengths_for_school": ["strength 1", "strength 2"],
      "gaps_to_address": ["gap 1"],
      "application_strategy": "1-2 sentence strategy",
      "essay_themes_suggested": ["theme 1", "theme 2"],
      "korean_student_advantage": "advantage for Korean applicants",
      "korean_student_challenge": "challenge for Korean applicants"
    }
  ]
}
\`\`\`

Include analysis for each target university.`;
}

/**
 * Stage 3: ED/RD Strategy
 * Recommends application round strategy.
 * Expected completion: ~10-15 seconds
 */
export function buildStage3Prompt(
  student: Student,
  universities: University[],
  stage1Result: Stage1Result,
  stage2Result: Stage2Result
): string {
  const universityAnalyses = stage2Result.university_analyses.map(u =>
    `- ${u.university_name}: ${u.admission_probability.category} (${u.admission_probability.score}%)`
  ).join("\n");

  const targetUnis = (student.target_universities || []).map(t =>
    `${t.university_id}: ${t.application_round}`
  ).join(", ");

  return `You are an expert US college admissions counselor specializing in Korean students.

## Student Summary
- Tier: ${stage1Result.overall_assessment.competitiveness_tier}
- Strengths: ${stage1Result.overall_assessment.strengths.join(", ")}

## University Analysis Results
${universityAnalyses}

## Current Application Round Preferences
${targetUnis || "Not specified"}

## Task
Recommend an optimal ED/RD application strategy based on the analysis.

Respond with ONLY this JSON (no other text):
\`\`\`json
{
  "ed_rd_strategy": {
    "recommended_ed_school": {
      "university_id": "recommended school for ED",
      "rationale": "Why this school for ED (2-3 sentences)",
      "admission_boost_estimate": "Estimated % boost from ED",
      "fit_score": 0-100
    },
    "backup_ed2_school": {
      "university_id": "backup for ED2 if ED fails",
      "rationale": "Why this backup",
      "conditions": "When to use this backup"
    },
    "ea_rea_recommendations": [
      {
        "university_id": "school-id",
        "round": "EA or REA",
        "rationale": "Why this round"
      }
    ],
    "rd_portfolio": {
      "reach_schools": ["school-ids"],
      "target_schools": ["school-ids"],
      "safety_schools": ["school-ids"],
      "ideal_total_count": 8-12,
      "portfolio_balance_advice": "Advice on application list balance"
    },
    "strategic_warnings": ["Any warnings about conflicts or risks"]
  },
  "strategic_recommendations": {
    "immediate_actions": ["action 1", "action 2"],
    "short_term_goals": ["goal 1", "goal 2"],
    "long_term_positioning": ["positioning 1"],
    "korean_specific_strategies": ["strategy 1", "strategy 2"]
  }
}
\`\`\``;
}

/**
 * Stage 4: Detailed Timeline
 * Creates month-by-month preparation plan.
 * Expected completion: ~15-20 seconds
 */
export function buildStage4Prompt(
  student: Student,
  stage1Result: Stage1Result,
  stage3Result: Stage3Result
): string {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const applicationYear = student.graduation_year - 1;

  return `You are an expert US college admissions counselor specializing in Korean students.

## Student Summary
- Grade: ${student.grade}, Graduation: ${student.graduation_year}
- Tier: ${stage1Result.overall_assessment.competitiveness_tier}
- Areas to improve: ${stage1Result.overall_assessment.areas_for_improvement.join(", ")}

## Application Strategy
- ED School: ${stage3Result.ed_rd_strategy.recommended_ed_school.university_id}
- Immediate Actions: ${stage3Result.strategic_recommendations.immediate_actions.join(", ")}

## Current Date: ${currentYear}-${String(currentMonth).padStart(2, "0")}
## Application Year: ${applicationYear}-${applicationYear + 1}

## Task
Create a detailed timeline from now until application deadlines.

Respond with ONLY this JSON (no other text):
\`\`\`json
{
  "detailed_timeline": {
    "current_status": {
      "current_date": "${currentYear}-${String(currentMonth).padStart(2, "0")}",
      "months_until_ed_deadline": <calculate from current date to November ${applicationYear}>,
      "phase": "early_preparation|summer_prep|fall_application|waiting|decision"
    },
    "phases": [
      {
        "phase_name": "Phase Name",
        "date_range": "Month Year - Month Year",
        "priority_level": "critical|high|medium",
        "objectives": ["objective 1", "objective 2"],
        "key_tasks": ["task 1", "task 2", "task 3"],
        "milestones": [
          {
            "name": "Milestone",
            "target_date": "YYYY-MM-DD",
            "success_criteria": "How to know this is complete"
          }
        ]
      }
    ],
    "test_schedule": {
      "sat_dates": [
        {
          "date": "YYYY-MM-DD",
          "purpose": "First attempt / Improvement",
          "target_score": 1500
        }
      ],
      "toefl_dates": [
        {
          "date": "YYYY-MM-DD",
          "target_score": 110
        }
      ]
    }
  },
  "immediate_action_items": [
    {
      "action": "Specific action to take this week",
      "deadline": "Within X days",
      "priority": "critical|high|medium",
      "reason": "Why this is urgent"
    }
  ]
}
\`\`\`

Include 3-4 phases covering the application cycle. Keep each phase focused.`;
}

// Legacy function for backwards compatibility - uses Stage 1 only for quick analysis
export function buildAnalysisPrompt(
  student: Student,
  universities: University[]
): string {
  return buildStage1Prompt(student, universities);
}
