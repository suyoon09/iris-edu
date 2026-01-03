"use client";

import { cn, getEventTypeColor, formatRelativeDate } from "@/lib/utils";
import { Badge } from "./Badge";
import type { TimelineEvent } from "@/types/timeline";

interface TimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  milestone: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  meeting: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  task_completed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  task_assigned: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  document_submitted: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  test_taken: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  application_submitted: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  decision_received: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  note: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
};

const statusVariants: Record<string, "default" | "success" | "warning" | "error"> = {
  pending: "warning",
  completed: "success",
  cancelled: "error",
};

export function Timeline({ events, onEventClick }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>아직 타임라인 이벤트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              "relative pl-10",
              onEventClick && "cursor-pointer hover:opacity-80"
            )}
            onClick={() => onEventClick?.(event)}
          >
            {/* Icon */}
            <div
              className={cn(
                "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-white",
                getEventTypeColor(event.event_type)
              )}
            >
              {eventTypeIcons[event.event_type] || eventTypeIcons.note}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 truncate">
                    {event.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {event.description}
                  </p>
                  {event.score_achieved && (
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      점수: {event.score_achieved}
                    </p>
                  )}
                </div>
                <Badge variant={statusVariants[event.status]}>
                  {event.status === "pending" && "진행 중"}
                  {event.status === "completed" && "완료"}
                  {event.status === "cancelled" && "취소"}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                <span>{formatRelativeDate(event.date)}</span>
                {event.due_date && (
                  <span className="text-amber-600">
                    마감: {new Date(event.due_date).toLocaleDateString("ko-KR")}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
