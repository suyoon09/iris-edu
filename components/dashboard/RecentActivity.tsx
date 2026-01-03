"use client";

import { formatRelativeDate, getEventTypeColor } from "@/lib/utils";
import type { TimelineEvent } from "@/types/timeline";

interface RecentActivityProps {
  events: TimelineEvent[];
}

export function RecentActivity({ events }: RecentActivityProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>최근 활동이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex gap-3">
          <div
            className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getEventTypeColor(
              event.event_type
            )}`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {event.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {event.description}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {formatRelativeDate(event.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
