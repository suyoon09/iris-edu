import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getCounselors, getStudents } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export default async function CounselorsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const counselors = await getCounselors();
  const students = await getStudents();

  const getAssignedStudentCount = (counselorId: string) => {
    return students.filter((s) => s.assigned_counselor_id === counselorId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">상담사 관리</h1>
              <p className="text-slate-500 mt-1">상담사 목록 및 담당 학생 현황</p>
            </div>
            {session.user.role === "admin" && (
              <Link href="/auth/register">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  새 상담사 등록
                </Button>
              </Link>
            )}
          </div>

          {/* Counselor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {counselors.map((counselor) => (
              <Link key={counselor.id} href={`/counselors/${counselor.id}`}>
                <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar fallback={counselor.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {counselor.name}
                          </h3>
                          <Badge variant={counselor.role === "admin" ? "purple" : "default"}>
                            {counselor.role === "admin" ? "관리자" : "상담사"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{counselor.name_en}</p>
                        <p className="text-sm text-slate-500">{counselor.email}</p>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {counselor.specialization.map((spec) => (
                        <Badge key={spec} variant="info">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
                      <div>
                        <span className="text-slate-500">담당 학생: </span>
                        <span className="font-medium text-slate-900">
                          {getAssignedStudentCount(counselor.id)}명
                        </span>
                      </div>
                      {counselor.last_login && (
                        <div className="text-slate-400">
                          마지막 접속:{" "}
                          {new Date(counselor.last_login).toLocaleDateString("ko-KR")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
