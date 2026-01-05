import type { Student } from "@/types/student";

/**
 * Multi-stage roadmap prompts designed to work within Netlify's 26-second timeout.
 */

export interface RoadmapStage1Result {
  student_id: string;
  graduation_year: number;
  current_phase: string;
  key_priorities: string[];
}

export interface RoadmapStage2Result {
  items: Array<{
    month: number;
    year: number;
    category: string;
    title: string;
    description: string;
    priority: string;
    deadline?: string;
  }>;
  milestones: Array<{
    date: string;
    title: string;
    description: string;
  }>;
}

/**
 * Stage 1: Core planning and priorities
 * Expected completion: ~10 seconds
 */
export function buildRoadmapStage1Prompt(student: Student): string {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return `You are an expert US college admissions counselor for Korean students.

## Student
- Name: ${student.name_korean}, Grade: ${student.grade}
- School: ${student.current_school}
- Graduation: ${student.graduation_year}
- GPA: ${student.academic?.gpa?.unweighted ?? "N/A"}
- SAT: ${student.academic?.standardized_tests?.sat?.total || "Not taken"}
- TOEFL: ${student.academic?.standardized_tests?.toefl?.total || "Not taken"}
- Targets: ${(student.target_universities || []).slice(0, 3).map(t => `${t.university_id}(${t.application_round})`).join(", ") || "None"}
- Current: ${currentMonth}/${currentYear}

## Task
Identify the current phase and key priorities for this student.

Respond with ONLY this JSON:
\`\`\`json
{
  "student_id": "${student.id}",
  "graduation_year": ${student.graduation_year},
  "current_phase": "early_preparation|summer_prep|fall_application|waiting|decision",
  "key_priorities": ["priority 1", "priority 2", "priority 3"]
}
\`\`\``;
}

/**
 * Stage 2: Detailed monthly roadmap
 * Expected completion: ~15-20 seconds
 */
export function buildRoadmapStage2Prompt(
  student: Student,
  stage1Result: RoadmapStage1Result
): string {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return `You are an expert US college admissions counselor for Korean students.

## Student Summary
- Grade: ${student.grade}, Graduation: ${student.graduation_year}
- Current Phase: ${stage1Result.current_phase}
- Key Priorities: ${stage1Result.key_priorities.join(", ")}
- Current: ${currentMonth}/${currentYear}

## Task
Create a month-by-month roadmap with 8-12 items covering the next 12 months.

Respond with ONLY this JSON:
\`\`\`json
{
  "items": [
    {
      "month": 1-12,
      "year": 2025-2026,
      "category": "academics|testing|extracurriculars|essays|applications|interviews",
      "title": "Task title",
      "description": "Brief description (1 sentence)",
      "priority": "high|medium|low",
      "deadline": "optional YYYY-MM-DD"
    }
  ],
  "milestones": [
    {
      "date": "YYYY-MM-DD",
      "title": "Milestone title",
      "description": "Brief description"
    }
  ]
}
\`\`\`

Include 8-12 items and 3-4 milestones. Keep descriptions brief.`;
}

// Legacy function for backwards compatibility
export function buildRoadmapPrompt(student: Student): string {
  return buildRoadmapStage1Prompt(student);
}
