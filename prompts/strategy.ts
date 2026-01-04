import type { Student } from "@/types/student";
import type { University } from "@/types/university";

export function buildStrategyPrompt(
  student: Student,
  universities: University[]
): string {
  return `You are an expert US college admissions strategist specializing in Korean student applications. Optimize the application strategy for this student.

## Student Profile

**Basic Information:**
- Name: ${student.name_korean} (${student.name_english})
- Grade: ${student.grade}
- School: ${student.current_school} (${student.school_type})
- Graduation Year: ${student.graduation_year}

**Academic Profile:**
- GPA: ${student.academic?.gpa?.unweighted ?? "N/A"}
- SAT: ${student.academic?.standardized_tests?.sat?.total || "Not taken"}
- AP Scores: ${(student.academic?.standardized_tests?.ap_scores || []).map((ap) => `${ap.subject}: ${ap.score}`).join(", ") || "None"}

**Strengths:**
${(student.extracurriculars || [])
  .slice(0, 3)
  .map((e) => `- ${e.name}: ${e.role} (${(e.achievements || []).join(", ") || "No achievements listed"})`)
  .join("\n") || "None specified"}

**Awards:**
${(student.awards || []).slice(0, 5).map((a) => `- ${a.name} (${a.level})`).join("\n") || "None"}

**Current Target List:**
${(student.target_universities || [])
  .map((t) => `- ${t.university_id}: ${t.priority} (${t.application_round}) - ${t.intended_major}`)
  .join("\n") || "None specified"}

## Available Universities Data
${(universities || [])
  .map((u) => {
    const basicInfo = u.basic_info || {};
    const admissionStats = u.admission_stats || {};
    const profileRanges = admissionStats.profile_ranges || {};
    const satTotal = profileRanges.sat_total || {};
    const koreanSpecific = u.korean_student_specific || {};
    const advice = koreanSpecific.korean_specific_advice || [];

    return `
${basicInfo.name_short || u.university_id}: ${admissionStats.acceptance_rate ?? "N/A"}% acceptance, SAT median ${satTotal.median ?? "N/A"}
- ED/EA rate: ${admissionStats.early_decision_rate || admissionStats.early_action_rate || "N/A"}%
- Korean-specific: ${advice[0] || "No specific advice"}`;
  })
  .join("\n")}

## Strategy Optimization Required

Analyze the current school list and application strategy. Provide recommendations in JSON format:

\`\`\`json
{
  "student_id": "${student.id}",
  "school_list_analysis": {
    "current_balance": "Assessment of reach/target/safety balance",
    "recommended_changes": ["specific change 1", "..."],
    "suggested_additions": ["school to add and why", "..."],
    "suggested_removals": ["school to remove and why", "..."]
  },
  "application_round_strategy": {
    "recommended_ed_ea": ["school for ED/EA with rationale", "..."],
    "recommended_rd": ["school for RD with rationale", "..."],
    "rationale": "Overall strategy explanation"
  },
  "differentiation_strategies": {
    "unique_angles": ["angle 1", "angle 2"],
    "narrative_themes": ["theme 1", "theme 2"],
    "korean_identity_leverage": "How to leverage Korean background as an advantage"
  }
}
\`\`\`

Consider:
1. Statistical likelihood of admission
2. Student's unique profile fit with each school
3. Strategic use of ED/EA to maximize chances
4. Balance of the overall list
5. Korean applicant pool competition
6. Demonstrated interest factors`;
}
