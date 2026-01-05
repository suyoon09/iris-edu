import type { Student } from "@/types/student";

export function buildRoadmapPrompt(student: Student): string {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return `You are a US college admissions counselor. Create a brief month-by-month roadmap.

## Student
- Name: ${student.name_korean}, Grade: ${student.grade}
- GPA: ${student.academic?.gpa?.unweighted ?? "N/A"}
- SAT: ${student.academic?.standardized_tests?.sat?.total || "Not taken"}
- Graduation: ${student.graduation_year}
- Targets: ${(student.target_universities || []).slice(0, 3).map(t => `${t.university_id}(${t.application_round})`).join(", ") || "None"}
- Current Date: ${currentMonth}/${currentYear}

Respond with ONLY this JSON (no other text, max 10 items):
\`\`\`json
{
  "student_id": "${student.id}",
  "graduation_year": ${student.graduation_year},
  "items": [
    {
      "month": 1,
      "year": 2025,
      "category": "testing",
      "title": "Task title",
      "description": "Brief description",
      "priority": "high"
    }
  ],
  "milestones": [
    {
      "date": "2025-01-15",
      "title": "Milestone",
      "description": "Brief description"
    }
  ]
}
\`\`\`

Categories: academics|testing|extracurriculars|essays|applications|interviews
Priority: high|medium|low
Keep descriptions short (1 sentence max). Include max 10 items and 3 milestones.`;
}
