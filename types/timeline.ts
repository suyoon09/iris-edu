export type TimelineEventType =
  | "milestone"
  | "meeting"
  | "task_completed"
  | "task_assigned"
  | "document_submitted"
  | "test_taken"
  | "application_submitted"
  | "decision_received"
  | "note";

export type TimelineEventStatus = "pending" | "completed" | "cancelled";

export interface TimelineEvent {
  id: string;
  student_id: string;
  counselor_id: string;

  event_type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  status: TimelineEventStatus;

  // Optional fields based on event_type
  related_university_id?: string;
  score_achieved?: string;
  due_date?: string;

  created_at: string;
  updated_at: string;
}

export interface TimelineEventCreate {
  student_id: string;
  counselor_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  status?: TimelineEventStatus;
  related_university_id?: string;
  score_achieved?: string;
  due_date?: string;
}

export interface TimelineEventUpdate {
  title?: string;
  description?: string;
  date?: string;
  status?: TimelineEventStatus;
  due_date?: string;
}
