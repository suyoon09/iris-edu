import type { Student } from "@/types/student";
import type { University } from "@/types/university";

export function buildAnalysisPrompt(
  student: Student,
  universities: University[]
): string {
  // Simplified university data - only essential fields
  const universityData = universities
    .slice(0, 5) // Limit to 5 universities max to keep prompt small
    .map((u) => {
      const basicInfo = u.basic_info || {};
      const admissionStats = u.admission_stats || {};
      const profileRanges = admissionStats.profile_ranges || {};
      const satTotal = profileRanges.sat_total || {};

      return `- ${basicInfo.name || u.university_id}: ${admissionStats.acceptance_rate ?? "N/A"}% acceptance, SAT ${satTotal["25th"] ?? "?"}-${satTotal["75th"] ?? "?"}, ED rate: ${admissionStats.early_decision_rate ?? "N/A"}%`;
    })
    .join("\n");

  // Simplified student data
  const studentSummary = `
Name: ${student.name_korean} (${student.name_english})
Grade: ${student.grade}, Graduation: ${student.graduation_year}
School: ${student.current_school} (${student.school_type})
GPA: ${student.academic?.gpa?.unweighted ?? "N/A"}
SAT: ${student.academic?.standardized_tests?.sat?.total || "Not taken"}
ACT: ${student.academic?.standardized_tests?.act?.composite || "Not taken"}
TOEFL: ${student.academic?.standardized_tests?.toefl?.total || "Not taken"}
Activities: ${(student.extracurriculars || []).length} listed
Awards: ${(student.awards || []).length} listed
Target Schools: ${(student.target_universities || []).map(t => `${t.university_id}(${t.application_round})`).join(", ") || "None"}
`;

  return `You are a US college admissions counselor for Korean students. Analyze this student briefly.

## Student
${studentSummary}

## Target Universities
${universityData}

Respond with ONLY this JSON (no other text):
\`\`\`json
{
  "overall_assessment": {
    "summary": "1-2 sentence assessment",
    "strengths": ["strength1", "strength2"],
    "areas_for_improvement": ["area1", "area2"],
    "korean_student_context": "1 sentence advice for Korean applicants",
    "competitiveness_tier": "competitive"
  },
  "university_analyses": [
    {
      "university_id": "school-id",
      "university_name": "Name",
      "admission_probability": {"score": 50, "category": "target", "confidence": "medium"},
      "profile_match": {"academic_fit": 70, "extracurricular_fit": 60, "personal_fit": 65, "overall_fit": 65},
      "strengths_for_school": ["strength1"],
      "gaps_to_address": ["gap1"],
      "application_strategy": "1 sentence strategy",
      "essay_themes_suggested": ["theme1", "theme2"],
      "korean_student_advantage": "advantage",
      "korean_student_challenge": "challenge"
    }
  ],
  "strategic_recommendations": {
    "immediate_actions": ["action1", "action2"],
    "short_term_goals": ["goal1", "goal2"],
    "long_term_positioning": ["positioning1"],
    "korean_specific_strategies": ["strategy1", "strategy2"]
  }
}
\`\`\`

Keep each field brief. Category: reach/target/safety/far_reach. Tier: highly_competitive/competitive/moderately_competitive/developing.`;
}
