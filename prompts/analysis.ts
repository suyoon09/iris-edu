import type { Student } from "@/types/student";
import type { University } from "@/types/university";

export function buildAnalysisPrompt(
  student: Student,
  universities: University[]
): string {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Determine application cycle year based on student's graduation year
  const applicationYear = student.graduation_year - 1;
  const isCurrentlySenior = student.grade === 12;

  const universityData = universities
    .map((u) => {
      const basicInfo = u.basic_info || {};
      const admissionStats = u.admission_stats || {};
      const profileRanges = admissionStats.profile_ranges || {};
      const satTotal = profileRanges.sat_total || {};
      const gpaUnweighted = profileRanges.gpa_unweighted || {};
      const koreanSpecific = u.korean_student_specific || {};
      const advice = koreanSpecific.korean_specific_advice || [];
      const mistakes = koreanSpecific.common_korean_applicant_mistakes || [];
      const appReqs = u.application_requirements || {};

      return `
### ${basicInfo.name || u.university_id} (${basicInfo.name_short || ""})
- Acceptance Rate: ${admissionStats.acceptance_rate ?? "N/A"}%
- ED Acceptance Rate: ${admissionStats.early_decision_rate ?? "N/A"}%
- EA Acceptance Rate: ${admissionStats.early_action_rate ?? "N/A"}%
- SAT Range: ${satTotal["25th"] ?? "N/A"}-${satTotal["75th"] ?? "N/A"}
- GPA Median: ${gpaUnweighted.median ?? "N/A"}
- ED Deadline: ${appReqs.deadline_early || "N/A"}
- RD Deadline: ${appReqs.deadline_regular || "N/A"}
- Test Policy: ${appReqs.test_policy || "N/A"}
- Korean Student Advice: ${advice.length > 0 ? advice.join("; ") : "Not available"}
- Common Mistakes: ${mistakes.length > 0 ? mistakes.join("; ") : "Not available"}
`;
    })
    .join("\n");

  return `You are an expert US college admissions counselor with 15+ years of experience advising Korean students on their applications to US universities. Your specialty is creating strategic ED/RD application plans and detailed preparation timelines.

## Student Profile

**Basic Information:**
- Name: ${student.name_korean} (${student.name_english})
- Grade: ${student.grade}
- School: ${student.current_school} (${student.school_type})
- Graduation Year: ${student.graduation_year}
- Application Cycle: ${applicationYear}-${applicationYear + 1}

**Academic Profile:**
- GPA: ${student.academic?.gpa?.unweighted ?? "N/A"} (unweighted)${student.academic?.gpa?.weighted ? `, ${student.academic.gpa.weighted} (weighted)` : ""}
- Class Rank: ${student.academic?.class_rank?.rank ? `${student.academic.class_rank.rank}/${student.academic.class_rank.total}` : "Not reported"}
- SAT: ${student.academic?.standardized_tests?.sat?.total || "Not taken"} (Math: ${student.academic?.standardized_tests?.sat?.math || "N/A"}, R/W: ${student.academic?.standardized_tests?.sat?.reading_writing || "N/A"})
- ACT: ${student.academic?.standardized_tests?.act?.composite || "Not taken"}
- AP Scores: ${(student.academic?.standardized_tests?.ap_scores || []).map((ap) => `${ap.subject}: ${ap.score}`).join(", ") || "None reported"}
- TOEFL: ${student.academic?.standardized_tests?.toefl?.total || "Not taken"}

**Courses:**
${(student.academic?.courses || []).map((c) => `- ${c.name} (${c.level}): ${c.grade}`).join("\n") || "None reported"}

**Extracurricular Activities:**
${(student.extracurriculars || [])
      .map(
        (e) => `- ${e.name} (${e.role})
  Category: ${e.category}
  Years: ${(e.years || []).join(", ")}
  Hours: ${e.hours_per_week} hrs/week, ${e.weeks_per_year} weeks/year
  Achievements: ${(e.achievements || []).join("; ") || "None specified"}`
      )
      .join("\n") || "None reported"}

**Awards:**
${(student.awards || []).map((a) => `- ${a.name} (${a.level}, ${a.year}): ${a.description}`).join("\n") || "None reported"}

## Target Universities
${(student.target_universities || [])
      .map(
        (t) => `- ${t.university_id}: ${t.priority} (${t.application_round}) - ${t.intended_major}`
      )
      .join("\n") || "None specified"}

## University Data
${universityData}

## Analysis Required

Provide a comprehensive analysis in JSON format. This analysis should be highly actionable with specific dates, deadlines, and step-by-step guidance for the student's ED/RD strategy.

\`\`\`json
{
  "overall_assessment": {
    "summary": "2-3 sentence overall assessment of the student's competitiveness",
    "strengths": ["strength 1", "strength 2", "..."],
    "areas_for_improvement": ["area 1", "area 2", "..."],
    "korean_student_context": "Specific analysis considering Korean student background and typical Korean applicant pool",
    "competitiveness_tier": "highly_competitive|competitive|moderately_competitive|developing"
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
  "ed_rd_strategy": {
    "recommended_ed_school": {
      "university_id": "recommended school for ED",
      "rationale": "Detailed explanation why this school is the best ED choice",
      "admission_boost_estimate": "Estimated % boost from applying ED vs RD",
      "fit_score": 0-100
    },
    "backup_ed2_school": {
      "university_id": "backup school for ED2 if ED is rejected",
      "rationale": "Why this school for ED2",
      "conditions": "When to use this backup (e.g., if rejected from ED)"
    },
    "ea_rea_recommendations": [
      {
        "university_id": "school-id",
        "round": "EA or REA",
        "rationale": "Why this school for early round"
      }
    ],
    "rd_portfolio": {
      "reach_schools": ["school-ids"],
      "target_schools": ["school-ids"],
      "safety_schools": ["school-ids"],
      "ideal_total_count": 8-12,
      "portfolio_balance_advice": "Advice on balancing the application list"
    },
    "strategic_warnings": [
      "Any warnings about the strategy, conflicts (e.g., REA restrictions), or risks"
    ]
  },
  "detailed_timeline": {
    "current_status": {
      "current_date": "${currentYear}-${String(currentMonth).padStart(2, '0')}",
      "months_until_ed_deadline": "calculated months",
      "phase": "early_preparation|summer_prep|fall_application|waiting|decision"
    },
    "phases": [
      {
        "phase_name": "Summer Preparation",
        "date_range": "July ${applicationYear} - August ${applicationYear}",
        "priority_level": "critical|high|medium",
        "objectives": ["Clear objective 1", "Clear objective 2"],
        "weekly_tasks": [
          {
            "week": "Week 1-2 of July",
            "tasks": [
              {
                "task": "Specific task description",
                "priority": "high|medium|low",
                "estimated_hours": 5,
                "deadline": "YYYY-MM-DD",
                "notes": "Additional context"
              }
            ]
          }
        ],
        "milestones": [
          {
            "name": "Milestone name",
            "target_date": "YYYY-MM-DD",
            "success_criteria": "How to know this is complete"
          }
        ],
        "korean_student_specific_tasks": [
          "Tasks specific to Korean students (e.g., visa prep, financial documents)"
        ]
      },
      {
        "phase_name": "Early Application Phase",
        "date_range": "September ${applicationYear} - November ${applicationYear}",
        "priority_level": "critical",
        "objectives": ["Submit ED application", "Submit EA applications"],
        "weekly_tasks": [...],
        "milestones": [
          {
            "name": "ED Application Submitted",
            "target_date": "${applicationYear}-11-01",
            "success_criteria": "Common App submitted with all materials"
          }
        ],
        "deadlines": [
          {
            "deadline_type": "ED",
            "university": "University Name",
            "date": "${applicationYear}-11-01",
            "materials_needed": ["Essay", "Recommendations", "Transcript"]
          }
        ]
      },
      {
        "phase_name": "RD Application Phase",
        "date_range": "November ${applicationYear} - January ${applicationYear + 1}",
        "priority_level": "high",
        "objectives": ["Complete all RD applications", "Refine essays"],
        "weekly_tasks": [...],
        "milestones": [...],
        "deadlines": [...]
      },
      {
        "phase_name": "Decision & Enrollment",
        "date_range": "February ${applicationYear + 1} - May ${applicationYear + 1}",
        "priority_level": "medium",
        "objectives": ["Evaluate offers", "Make final decision"],
        "decision_dates": [
          {
            "university": "University Name",
            "expected_date": "March-April ${applicationYear + 1}",
            "action_if_accepted": "Next steps",
            "action_if_rejected": "Backup plan"
          }
        ]
      }
    ],
    "test_schedule": {
      "sat_dates": [
        {
          "date": "YYYY-MM-DD",
          "registration_deadline": "YYYY-MM-DD",
          "purpose": "First attempt / Score improvement",
          "target_score": 1500
        }
      ],
      "act_dates": [...],
      "toefl_dates": [...],
      "ap_exams": [
        {
          "subject": "Subject name",
          "date": "May ${applicationYear}",
          "target_score": 5
        }
      ]
    },
    "essay_timeline": {
      "common_app_essay": {
        "first_draft_deadline": "August 15, ${applicationYear}",
        "final_deadline": "October 15, ${applicationYear}",
        "suggested_topics": ["topic 1", "topic 2"],
        "korean_student_angle": "How to leverage Korean background"
      },
      "supplemental_essays": [
        {
          "university": "University Name",
          "essay_prompts": ["prompt 1"],
          "first_draft_deadline": "YYYY-MM-DD",
          "final_deadline": "YYYY-MM-DD",
          "strategy_notes": "Specific approach for this essay"
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
  ],
  "strategic_recommendations": {
    "immediate_actions": ["action 1", "action 2"],
    "short_term_goals": ["goal 1", "goal 2"],
    "long_term_positioning": ["positioning 1", "..."],
    "korean_specific_strategies": [
      "How to differentiate from other Korean applicants",
      "How to address common Korean student stereotypes",
      "How to leverage Korean cultural background positively"
    ],
    "profile_enhancement_opportunities": [
      {
        "area": "Area to improve",
        "specific_actions": ["action 1", "action 2"],
        "timeline": "When to complete",
        "impact": "Expected impact on applications"
      }
    ]
  }
}
\`\`\`

Be extremely specific and actionable. Every date should be realistic based on the current date (${currentYear}-${String(currentMonth).padStart(2, '0')}) and the student's application cycle. Consider the unique challenges and advantages of Korean students applying to US universities, including:
- Competition within the Korean applicant pool
- Common stereotypes to avoid or address
- Cultural differences in essay writing
- Visa and financial documentation requirements
- Time zone considerations for interviews`;
}
