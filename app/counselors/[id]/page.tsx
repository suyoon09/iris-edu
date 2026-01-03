"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StudentList } from "@/components/dashboard/StudentList";
import type { CounselorPublic } from "@/types/counselor";
import type { Student } from "@/types/student";

export default function CounselorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const counselorId = params.id as string;

  const [counselor, setCounselor] = useState<CounselorPublic | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [counselorId]);

  const fetchData = async () => {
    try {
      const [counselorRes, studentsRes] = await Promise.all([
        fetch(`/api/counselors/${counselorId}`),
        fetch(`/api/students?counselor_id=${counselorId}`),
      ]);

      if (counselorRes.ok) {
        setCounselor(await counselorRes.json());
      }
      if (studentsRes.ok) {
        const allStudents = await studentsRes.json();
        setStudents(allStudents.filter((s: Student) => s.assigned_counselor_id === counselorId));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-slate-900">상담사를 찾을 수 없습니다</h2>
              <Button className="mt-4" onClick={() => router.push("/counselors")}>
                목록으로 돌아가기
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar fallback={counselor.name} size="xl" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {counselor.name}
                  </h1>
                  <Badge variant={counselor.role === "admin" ? "purple" : "info"}>
                    {counselor.role === "admin" ? "관리자" : "상담사"}
                  </Badge>
                </div>
                <p className="text-slate-500">{counselor.name_en}</p>
                <p className="text-sm text-slate-500 mt-1">{counselor.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              돌아가기
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Specialization */}
              <Card>
                <CardHeader>
                  <CardTitle>전문 분야</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {counselor.specialization.map((spec) => (
                      <Badge key={spec} variant="info" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>통계</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">담당 학생</span>
                    <span className="font-medium text-slate-900">
                      {students.length}명
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">가입일</span>
                    <span className="font-medium text-slate-900">
                      {new Date(counselor.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  {counselor.last_login && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">마지막 접속</span>
                      <span className="font-medium text-slate-900">
                        {new Date(counselor.last_login).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Students */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>담당 학생 ({students.length}명)</CardTitle>
                  <Link href="/students/new">
                    <Button size="sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      학생 추가
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <StudentList students={students} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
