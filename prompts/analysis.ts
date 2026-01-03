import type { Student } from "@/types/student";
import type { University } from "@/types/university";

export function buildAnalysisPrompt(
  student: Student,
  universities: University[]
): string {
  const universityData = universities
    .map(
      (u) => `
### ${u.basic_info.name} (${u.basic_info.name_short})
- Acceptance Rate: ${u.admission_stats.acceptance_rate}%
- SAT Range: ${u.admission_stats.profile_ranges.sat_total["25th"]}-${u.admission_stats.profile_ranges.sat_total["75th"]}
- GPA Median: ${u.admission_stats.profile_ranges.gpa_unweighted.median}
- Korean Student Advice: ${u.korean_student_specific.korean_specific_advice.join("; ")}
- Common Mistakes: ${u.korean_student_specific.common_korean_applicant_mistakes.join("; ")}
`
    )
    .join("\n");

  return `You are an expert US college admissions counselor with deep knowledge of Korean student applications. Analyze this Korean student's profile and provide detailed admission analysis.

## Student Profile

**Basic Information:**
- Name: ${student.name_korean} (${student.name_english})
- Grade: ${student.grade}
- School: ${student.current_school} (${student.school_type})
- Graduation Year: ${student.graduation_year}

**Academic Profile:**
- GPA: ${student.academic.gpa.unweighted} (unweighted)${student.academic.gpa.weighted ? `, ${student.academic.gpa.weighted} (weighted)` : ""}
- Class Rank: ${student.academic.class_rank.rank ? `${student.academic.class_rank.rank}/${student.academic.class_rank.total}` : "Not reported"}
- SAT: ${student.academic.standardized_tests.sat.total || "Not taken"} (Math: ${student.academic.standardized_tests.sat.math || "N/A"}, R/W: ${student.academic.standardized_tests.sat.reading_writing || "N/A"})
- AP Scores: ${student.academic.standardized_tests.ap_scores.map((ap) => `${ap.subject}: ${ap.score}`).join(", ") || "None reported"}
- TOEFL: ${student.academic.standardized_tests.toefl?.total || "Not taken"}

**Courses:**
${student.academic.courses.map((c) => `- ${c.name} (${c.level}): ${c.grade}`).join("\n")}

**Extracurricular Activities:**
${student.extracurriculars
  .map(
    (e) => `- ${e.name} (${e.role})
  Category: ${e.category}
  Years: ${e.years.join(", ")}
  Hours: ${e.hours_per_week} hrs/week, ${e.weeks_per_year} weeks/year
  Achievements: ${e.achievements.join("; ") || "None specified"}`
  )
  .join("\n")}

**Awards:**
${student.awards.map((a) => `- ${a.name} (${a.level}, ${a.year}): ${a.description}`).join("\n") || "None reported"}

## Target Universities
${student.target_universities
  .map(
    (t) => `- ${t.university_id}: ${t.priority} (${t.application_round}) - ${t.intended_major}`
  )
  .join("\n")}

## University Data
${universityData}

## Analysis Required

Provide a comprehensive analysis in JSON format:

\`\`\`json
{
  "overall_assessment": {
    "summary": "2-3 sentence overall assessment",
    "strengths": ["strength 1", "strength 2", "..."],
    "areas_for_improvement": ["area 1", "area 2", "..."],
    "korean_student_context": "Specific analysis considering Korean student background and typical Korean applicant pool"
  },
  "university_analyses": [
    {
      "university_id": "university-id",
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
      "strengths_for_school": ["specific strength 1", "..."],
      "gaps_to_address": ["gap 1", "..."],
      "application_strategy": "Specific strategy for this school",
      "essay_themes_suggested": ["theme 1", "theme 2"],
      "korean_student_advantage": "What gives this Korean student an edge",
      "korean_student_challenge": "What challenges they may face as a Korean applicant"
    }
  ],
  "strategic_recommendations": {
    "immediate_actions": ["action 1", "action 2"],
    "short_term_goals": ["goal 1", "goal 2"],
    "long_term_positioning": ["positioning 1", "..."],
    "korean_specific_strategies": ["strategy 1", "..."]
  },
  "timeline_suggestions": [
    {
      "month": "January",
      "year": 2025,
      "tasks": ["task 1", "task 2"],
      "focus_area": "Area of focus"
    }
  ]
}
\`\`\`

Be specific, actionable, and consider the unique challenges and advantages of Korean students applying to US universities.`;
}
