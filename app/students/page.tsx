import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getStudents, getStudentsByCounselorId, getCounselors } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { getGradeLabel, getStatusBadgeColor } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  planning: "계획 중",
  preparing: "준비 중",
  applying: "지원 중",
  complete: "완료",
};

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const isAdmin = session.user.role === "admin";
  const students = isAdmin
    ? await getStudents()
    : await getStudentsByCounselorId(session.user.id);
  const counselors = await getCounselors();

  const getCounselorName = (id: string | null) => {
    if (!id) return "미배정";
    const counselor = counselors.find((c) => c.id === id);
    return counselor?.name || "미배정";
  };

  return (
    <div className="ml-64 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">학생 관리</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? "전체 학생" : "담당 학생"} 목록을 관리합니다.
          </p>
        </div>
        <Link href="/students/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 학생 추가
          </Button>
        </Link>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <Link key={student.id} href={`/students/${student.id}`}>
            <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar fallback={student.name_korean} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {student.name_korean}
                      </h3>
                      <Badge className={getStatusBadgeColor(student.application_status)}>
                        {statusLabels[student.application_status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{student.name_english}</p>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>{getGradeLabel(student.grade)} · {student.current_school}</p>
                      <p>담당: {getCounselorName(student.assigned_counselor_id)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-500">GPA</p>
                    <p className="font-medium text-slate-900">
                      {student.academic.gpa.unweighted || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">SAT</p>
                    <p className="font-medium text-slate-900">
                      {student.academic.standardized_tests.sat.total || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">목표 대학</p>
                    <p className="font-medium text-slate-900">
                      {student.target_universities.length}개
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">등록된 학생이 없습니다.</p>
            <Link href="/students/new" className="mt-4 inline-block">
              <Button>새 학생 추가하기</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
