"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getGradeLabel, getStatusBadgeColor } from "@/lib/utils";
import type { Student } from "@/types/student";

interface StudentListProps {
  students: Student[];
}

const statusLabels: Record<string, string> = {
  planning: "계획 중",
  preparing: "준비 중",
  applying: "지원 중",
  complete: "완료",
};

export function StudentList({ students }: StudentListProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>담당 학생이 없습니다.</p>
        <Link
          href="/students/new"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          새 학생 추가하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <Link
          key={student.id}
          href={`/students/${student.id}`}
          className="block"
        >
          <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
            <Avatar fallback={student.name_korean} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-slate-900 truncate">
                  {student.name_korean}
                </h4>
                <span className="text-sm text-slate-500">
                  {student.name_english}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <span>{getGradeLabel(student.grade)}</span>
                <span>·</span>
                <span className="truncate">{student.current_school}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {student.academic.standardized_tests.sat.total && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">SAT</p>
                  <p className="font-medium text-slate-900">
                    {student.academic.standardized_tests.sat.total}
                  </p>
                </div>
              )}
              <Badge className={getStatusBadgeColor(student.application_status)}>
                {statusLabels[student.application_status]}
              </Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
