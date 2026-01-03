import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export const counselorCreateSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  name: z.string().min(1, "이름을 입력해주세요"),
  name_en: z.string().min(1, "영문 이름을 입력해주세요"),
  role: z.enum(["admin", "counselor"]),
  specialization: z.array(z.string()),
});

export const studentCreateSchema = z.object({
  name_korean: z.string().min(1, "한글 이름을 입력해주세요"),
  name_english: z.string().min(1, "영문 이름을 입력해주세요"),
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  phone: z.string().min(1, "전화번호를 입력해주세요"),
  grade: z.union([z.literal(9), z.literal(10), z.literal(11), z.literal(12)]),
  school_type: z.enum(["domestic_korean", "international_in_korea", "abroad"]),
  current_school: z.string().min(1, "현재 학교를 입력해주세요"),
  graduation_year: z.number().min(2024).max(2030),
  notes: z.string().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial().extend({
  assigned_counselor_id: z.string().nullable().optional(),
  application_status: z.enum(["planning", "preparing", "applying", "complete"]).optional(),
  academic: z
    .object({
      gpa: z.object({
        unweighted: z.number().min(0).max(4),
        weighted: z.number().nullable(),
        scale: z.string(),
      }),
      class_rank: z.object({
        rank: z.number().nullable(),
        total: z.number().nullable(),
      }),
      courses: z.array(
        z.object({
          name: z.string(),
          level: z.enum(["regular", "honors", "AP", "IB", "dual_enrollment"]),
          grade: z.string(),
          year: z.string(),
          subject_area: z.enum([
            "math",
            "science",
            "english",
            "social_studies",
            "foreign_language",
            "arts",
            "other",
          ]),
        })
      ),
      standardized_tests: z.object({
        sat: z.object({
          total: z.number().nullable(),
          reading_writing: z.number().nullable(),
          math: z.number().nullable(),
          date: z.string().nullable(),
        }),
        act: z.object({
          composite: z.number().nullable(),
          english: z.number().nullable(),
          math: z.number().nullable(),
          reading: z.number().nullable(),
          science: z.number().nullable(),
          date: z.string().nullable(),
        }),
        ap_scores: z.array(
          z.object({
            subject: z.string(),
            score: z.number().min(1).max(5),
            year: z.string(),
          })
        ),
        toefl: z
          .object({
            total: z.number().nullable(),
            date: z.string().nullable(),
          })
          .nullable(),
      }),
    })
    .optional(),
  extracurriculars: z
    .array(
      z.object({
        name: z.string(),
        category: z.enum([
          "academic",
          "arts",
          "athletics",
          "community_service",
          "leadership",
          "work",
          "other",
        ]),
        role: z.string(),
        description: z.string(),
        hours_per_week: z.number(),
        weeks_per_year: z.number(),
        years: z.array(z.string()),
        achievements: z.array(z.string()),
      })
    )
    .optional(),
  awards: z
    .array(
      z.object({
        name: z.string(),
        level: z.enum(["school", "regional", "national", "international"]),
        year: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  target_universities: z
    .array(
      z.object({
        university_id: z.string(),
        priority: z.enum(["reach", "target", "safety"]),
        intended_major: z.string(),
        application_round: z.enum(["ED", "ED2", "EA", "REA", "RD"]),
      })
    )
    .optional(),
  notes: z.string().optional(),
});

export const timelineEventCreateSchema = z.object({
  student_id: z.string().uuid(),
  event_type: z.enum([
    "milestone",
    "meeting",
    "task_completed",
    "task_assigned",
    "document_submitted",
    "test_taken",
    "application_submitted",
    "decision_received",
    "note",
  ]),
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string(),
  date: z.string(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  related_university_id: z.string().optional(),
  score_achieved: z.string().optional(),
  due_date: z.string().optional(),
});

export const timelineEventUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  due_date: z.string().optional(),
});

export const assignCounselorSchema = z.object({
  counselor_id: z.string().uuid("유효한 상담사 ID를 입력해주세요"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CounselorCreateInput = z.infer<typeof counselorCreateSchema>;
export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
export type TimelineEventCreateInput = z.infer<typeof timelineEventCreateSchema>;
export type TimelineEventUpdateInput = z.infer<typeof timelineEventUpdateSchema>;
export type AssignCounselorInput = z.infer<typeof assignCounselorSchema>;
