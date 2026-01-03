import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}분 전`;
    }
    return `${diffHours}시간 전`;
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}주 전`;
  } else {
    return formatDate(date);
  }
}

export function getGradeLabel(grade: number): string {
  const labels: Record<number, string> = {
    9: "고1 (9th)",
    10: "고2 (10th)",
    11: "고3 (11th)",
    12: "졸업예정 (12th)",
  };
  return labels[grade] || `${grade}학년`;
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    planning: "bg-slate-100 text-slate-700",
    preparing: "bg-blue-100 text-blue-700",
    applying: "bg-amber-100 text-amber-700",
    complete: "bg-green-100 text-green-700",
    pending: "bg-slate-100 text-slate-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getEventTypeColor(eventType: string): string {
  const colors: Record<string, string> = {
    milestone: "bg-purple-500",
    meeting: "bg-blue-500",
    task_completed: "bg-green-500",
    task_assigned: "bg-amber-500",
    document_submitted: "bg-cyan-500",
    test_taken: "bg-indigo-500",
    application_submitted: "bg-emerald-500",
    decision_received: "bg-pink-500",
    note: "bg-slate-500",
  };
  return colors[eventType] || "bg-gray-500";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    reach: "bg-red-100 text-red-700 border-red-200",
    target: "bg-amber-100 text-amber-700 border-amber-200",
    safety: "bg-green-100 text-green-700 border-green-200",
  };
  return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
}

export function generateId(): string {
  return crypto.randomUUID();
}
