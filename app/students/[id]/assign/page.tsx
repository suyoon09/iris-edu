"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { Student } from "@/types/student";
import type { CounselorPublic } from "@/types/counselor";

export default function AssignCounselorPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [counselors, setCounselors] = useState<CounselorPublic[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [studentRes, counselorsRes] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch("/api/counselors"),
      ]);

      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudent(studentData);
        setSelectedCounselor(studentData.assigned_counselor_id);
      }
      if (counselorsRes.ok) {
        setCounselors(await counselorsRes.json());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCounselor) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/students/${studentId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counselor_id: selectedCounselor }),
      });

      if (response.ok) {
        router.push(`/students/${studentId}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error assigning counselor:", error);
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">상담사 배정</h1>
              <p className="text-slate-500 mt-1">
                {student?.name_korean}님에게 담당 상담사를 배정합니다.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>상담사 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {counselors
                    .filter((c) => c.role === "counselor")
                    .map((counselor) => (
                      <div
                        key={counselor.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedCounselor === counselor.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                        onClick={() => setSelectedCounselor(counselor.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar fallback={counselor.name} size="md" />
                          <div>
                            <p className="font-medium text-slate-900">
                              {counselor.name}
                              <span className="text-slate-500 ml-2">
                                ({counselor.name_en})
                              </span>
                            </p>
                            <p className="text-sm text-slate-500">
                              {counselor.email}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {counselor.specialization.map((spec) => (
                                <Badge key={spec} variant="default">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">
                            담당 학생: {counselor.assigned_students.length}명
                          </p>
                          {selectedCounselor === counselor.id && (
                            <Badge variant="info" className="mt-1">
                              선택됨
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                  <Button variant="outline" onClick={() => router.back()}>
                    취소
                  </Button>
                  <Button
                    onClick={handleAssign}
                    disabled={!selectedCounselor}
                    isLoading={isSaving}
                  >
                    배정 완료
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
