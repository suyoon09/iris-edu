import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import {
  getStudentById,
  getCounselorById,
  getTimelineEventsByStudentId,
  getUniversities,
} from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Timeline } from "@/components/ui/Timeline";
import { getGradeLabel, getStatusBadgeColor, getPriorityColor } from "@/lib/utils";
import { ProfileExportButton } from "@/components/student/ProfileExportButton";

const statusLabels: Record<string, string> = {
  planning: "계획 중",
  preparing: "준비 중",
  applying: "지원 중",
  complete: "완료",
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const counselor = student.assigned_counselor_id
    ? await getCounselorById(student.assigned_counselor_id)
    : null;
  const timelineEvents = await getTimelineEventsByStudentId(id);
  const universities = await getUniversities();

  const getUniversityName = (uniId: string) => {
    const uni = universities.find((u) => u.university_id === uniId);
    return uni?.name_short || uni?.name || uniId;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar fallback={student.name_korean} size="xl" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {student.name_korean}
                  </h1>
                  <Badge className={getStatusBadgeColor(student.application_status)}>
                    {statusLabels[student.application_status]}
                  </Badge>
                </div>
                <p className="text-slate-500">{student.name_english}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {getGradeLabel(student.grade)} · {student.current_school}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/students/${id}/analysis`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  AI 분석
                </Button>
              </Link>
              <Link href={`/students/${id}/reports`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  리포트 기록
                </Button>
              </Link>
              <Link href={`/students/${id}/edit`}>
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  수정
                </Button>
              </Link>
              <ProfileExportButton studentName={student.name_korean} />
            </div>
          </div>

          <div id="student-profile-content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Academic Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle>학업 프로필</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">GPA (Unweighted)</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {student.academic.gpa.unweighted || "-"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">SAT</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {student.academic.standardized_tests.sat.total || "-"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">TOEFL</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {student.academic.standardized_tests.toefl?.total || "-"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">AP 과목</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {student.academic.standardized_tests.ap_scores.length}개
                        </p>
                      </div>
                    </div>

                    {student.academic.standardized_tests.ap_scores.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">AP 점수</p>
                        <div className="flex flex-wrap gap-2">
                          {student.academic.standardized_tests.ap_scores.map((ap, i) => (
                            <Badge key={i} variant="info">
                              {ap.subject}: {ap.score}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Target Universities */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>목표 대학 ({student.target_universities.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {student.target_universities.length > 0 ? (
                      <div className="space-y-3">
                        {student.target_universities.map((target, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {getUniversityName(target.university_id)}
                              </p>
                              <p className="text-sm text-slate-500">
                                {target.intended_major} · {target.application_round}
                              </p>
                            </div>
                            <Badge className={getPriorityColor(target.priority)}>
                              {target.priority === "reach" && "Reach"}
                              {target.priority === "target" && "Target"}
                              {target.priority === "safety" && "Safety"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-4">
                        목표 대학이 아직 설정되지 않았습니다.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Extracurriculars */}
                <Card>
                  <CardHeader>
                    <CardTitle>비교과 활동 ({student.extracurriculars.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {student.extracurriculars.length > 0 ? (
                      <div className="space-y-4">
                        {student.extracurriculars.map((activity, i) => (
                          <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{activity.name}</p>
                                <p className="text-sm text-slate-500">{activity.role}</p>
                              </div>
                              <Badge variant="default">{activity.category}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{activity.description}</p>
                            {activity.achievements.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {activity.achievements.map((ach, j) => (
                                  <Badge key={j} variant="success" className="text-xs">
                                    {ach}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-4">
                        등록된 활동이 없습니다.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Counselor Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>담당 상담사</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {counselor ? (
                      <div className="flex items-center gap-3">
                        <Avatar fallback={counselor.name} size="md" />
                        <div>
                          <p className="font-medium text-slate-900">{counselor.name}</p>
                          <p className="text-sm text-slate-500">{counselor.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-slate-500 mb-3">담당 상담사가 배정되지 않았습니다.</p>
                        <Link href={`/students/${id}/assign`}>
                          <Button variant="outline" size="sm">상담사 배정</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>연락처</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">이메일</p>
                      <p className="text-sm text-slate-900">{student.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">전화번호</p>
                      <p className="text-sm text-slate-900">{student.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">졸업 예정</p>
                      <p className="text-sm text-slate-900">{student.graduation_year}년</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>빠른 작업</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href={`/students/${id}/roadmap`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        로드맵 생성
                      </Button>
                    </Link>
                    <Link href={`/students/${id}/timeline`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        타임라인 관리
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Timeline Preview */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>최근 활동</CardTitle>
                    <Link href={`/students/${id}/timeline`}>
                      <Button variant="ghost" size="sm">전체 보기</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <Timeline events={timelineEvents.slice(0, 5)} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Notes */}
            {student.notes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>상담사 메모</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{student.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
