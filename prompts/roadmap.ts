import type { Student } from "@/types/student";

export function buildRoadmapPrompt(student: Student): string {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return `You are an expert US college admissions counselor specializing in Korean students. Create a detailed month-by-month roadmap for this student.

## Student Profile

**Basic Information:**
- Name: ${student.name_korean} (${student.name_english})
- Grade: ${student.grade}
- School: ${student.current_school}
- Graduation Year: ${student.graduation_year}
- Application Status: ${student.application_status}

**Current Academic Standing:**
- GPA: ${student.academic.gpa.unweighted}
- SAT: ${student.academic.standardized_tests.sat.total || "Not taken"}
- TOEFL: ${student.academic.standardized_tests.toefl?.total || "Not taken"}

**Target Universities:**
${student.target_universities
  .map((t) => `- ${t.university_id}: ${t.priority} (${t.application_round}) - ${t.intended_major}`)
  .join("\n") || "None specified yet"}

**Current Extracurriculars:**
${student.extracurriculars.map((e) => `- ${e.name} (${e.role})`).join("\n") || "None specified"}

**Current Date:** ${currentMonth}/${currentYear}

## Roadmap Requirements

Create a detailed roadmap from now until the student's college application deadline. Include:

1. **Monthly Tasks** - Specific, actionable items for each month
2. **Testing Schedule** - When to take/retake SAT, AP exams, etc.
3. **Extracurricular Development** - How to deepen impact
4. **Essay Timeline** - When to brainstorm, draft, revise
5. **Application Preparation** - Research, visits, interviews
6. **Korean-Specific Considerations** - Timing around Korean school calendar, test dates available in Korea

Provide the response in JSON format:

\`\`\`json
{
  "student_id": "${student.id}",
  "graduation_year": ${student.graduation_year},
  "items": [
    {
      "month": 1-12,
      "year": 2024-2026,
      "category": "academics|testing|extracurriculars|essays|applications|interviews",
      "title": "Task title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "deadline": "optional specific date"
    }
  ],
  "milestones": [
    {
      "date": "YYYY-MM-DD",
      "title": "Milestone title",
      "description": "Description"
    }
  ]
}
\`\`\`

Focus on realistic, achievable goals that build toward a compelling application.`;
}
