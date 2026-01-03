import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import {
  getStudents,
  getStudentsByCounselorId,
  getRecentTimelineEvents,
  getRecentTimelineEventsByCounselor,
  getDashboardStats,
} from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { StudentList } from "@/components/dashboard/StudentList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const isAdmin = session.user.role === "admin";
  const counselorId = session.user.id;

  // Fetch data based on role
  const students = isAdmin
    ? await getStudents()
    : await getStudentsByCounselorId(counselorId);

  const recentEvents = isAdmin
    ? await getRecentTimelineEvents(10)
    : await getRecentTimelineEventsByCounselor(counselorId, 10);

  const stats = await getDashboardStats(isAdmin ? undefined : counselorId);

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            안녕하세요, {session.user.name}님
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? "전체 학생 현황을 확인하세요." : "담당 학생들의 현황을 확인하세요."}
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

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {isAdmin ? "전체 학생" : "담당 학생"} ({students.length})
              </CardTitle>
              <Link href="/students">
                <Button variant="ghost" size="sm">
                  전체 보기
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <StudentList students={students.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity events={recentEvents} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
