"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Student } from "@/types/student";
import type { StudentRoadmap, RoadmapItem } from "@/types/analysis";

const categoryLabels: Record<string, string> = {
  academics: "학업",
  testing: "시험",
  extracurriculars: "비교과",
  essays: "에세이",
  applications: "원서",
  interviews: "인터뷰",
};

const categoryColors: Record<string, string> = {
  academics: "bg-blue-100 text-blue-700",
  testing: "bg-purple-100 text-purple-700",
  extracurriculars: "bg-green-100 text-green-700",
  essays: "bg-amber-100 text-amber-700",
  applications: "bg-red-100 text-red-700",
  interviews: "bg-pink-100 text-pink-700",
};

const priorityColors: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-slate-300",
};

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [roadmap, setRoadmap] = useState<StudentRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (response.ok) {
        setStudent(await response.json());
      }
    } catch (err) {
      console.error("Error fetching student:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    setError("");
    setDebugInfo(null);

    // Use AbortController for timeout (Netlify has 26s limit)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s client timeout

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Try to parse response, handling cases where it might fail
      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text().catch(() => "[Unable to read response]");
        setError("서버 응답을 파싱할 수 없습니다.");
        setDebugInfo({
          parseError: true,
          status: response.status,
          statusText: response.statusText,
          responsePreview: text.substring(0, 500),
        });
        return;
      }

      if (!response.ok) {
        setError(data.error || "Roadmap generation failed");
        if (data.debug) {
          setDebugInfo(data.debug);
        } else {
          setDebugInfo({
            status: response.status,
            statusText: response.statusText,
            errorData: data,
          });
        }
        return;
      }

      setRoadmap(data);
    } catch (err) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isAborted = err instanceof Error && err.name === "AbortError";
      const isTimeout = isAborted || errorMessage.includes("timeout") || errorMessage.includes("aborted");

      if (isTimeout) {
        setError("요청 시간이 초과되었습니다 (Netlify 서버 제한: 26초). AI 응답이 너무 길 수 있습니다.");
      } else {
        setError("로드맵 생성에 실패했습니다.");
      }

      setDebugInfo({
        networkError: true,
        errorName: err instanceof Error ? err.name : "Unknown",
        message: errorMessage,
        isTimeout,
        isAborted,
        timestamp: new Date().toISOString(),
        hint: isTimeout ? "Netlify 함수는 26초 제한이 있습니다. 프롬프트를 줄이거나 Pro 플랜으로 업그레이드하세요." : undefined,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const groupItemsByMonth = (items: RoadmapItem[]) => {
    const grouped: Record<string, RoadmapItem[]> = {};
    items.forEach((item) => {
      const key = `${item.year}-${String(item.month).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const getMonthName = (month: number) => {
    const months = [
      "1월", "2월", "3월", "4월", "5월", "6월",
      "7월", "8월", "9월", "10월", "11월", "12월",
    ];
    return months[month - 1];
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {student?.name_korean} - 입시 로드맵
              </h1>
              <p className="text-slate-500 mt-1">
                월별 입시 준비 계획을 AI가 생성합니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                돌아가기
              </Button>
              <Button onClick={generateRoadmap} isLoading={isGenerating}>
                {roadmap ? "다시 생성" : "로드맵 생성"}
              </Button>
            </div>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="py-4">
                <p className="text-red-600 font-medium">{error}</p>
                {debugInfo && (
                  <div className="mt-4 p-3 bg-red-100 rounded text-xs font-mono overflow-x-auto">
                    <p className="font-bold text-red-800 mb-2">Debug Info:</p>
                    <pre className="text-red-700 whitespace-pre-wrap">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!roadmap && !isGenerating && (
            <Card>
              <CardContent className="py-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-slate-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  맞춤형 로드맵 생성
                </h3>
                <p className="text-slate-500 mb-4">
                  학생의 목표와 현재 상황에 맞는 월별 입시 준비 계획을 생성합니다.
                </p>
                <Button onClick={generateRoadmap} isLoading={isGenerating}>
                  로드맵 생성
                </Button>
              </CardContent>
            </Card>
          )}

          {isGenerating && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  로드맵 생성 중...
                </h3>
                <p className="text-slate-500">
                  학생의 프로필을 분석하여 맞춤형 계획을 만들고 있습니다.
                </p>
              </CardContent>
            </Card>
          )}

          {roadmap && !isGenerating && (
            <div className="space-y-6">
              {/* Category Legend */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Badge key={key} className={categoryColors[key]}>
                    {label}
                  </Badge>
                ))}
              </div>

              {/* Monthly Roadmap */}
              <div className="space-y-6">
                {groupItemsByMonth(roadmap.items).map(([monthKey, items]) => {
                  const [year, month] = monthKey.split("-");
                  return (
                    <Card key={monthKey}>
                      <CardHeader>
                        <CardTitle>
                          {year}년 {getMonthName(parseInt(month))}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {items.map((item, i) => (
                            <div
                              key={i}
                              className={`p-4 border-l-4 bg-slate-50 rounded-r-lg ${priorityColors[item.priority]}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={categoryColors[item.category]}>
                                      {categoryLabels[item.category]}
                                    </Badge>
                                    {item.priority === "high" && (
                                      <Badge variant="error">중요</Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-slate-900">
                                    {item.title}
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {item.description}
                                  </p>
                                </div>
                                {item.deadline && (
                                  <span className="text-xs text-slate-500">
                                    ~{new Date(item.deadline).toLocaleDateString("ko-KR")}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Milestones */}
              {roadmap.milestones && roadmap.milestones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>주요 마일스톤</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                      <div className="space-y-4">
                        {roadmap.milestones.map((milestone, i) => (
                          <div key={i} className="relative pl-10">
                            <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                              </svg>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">
                                {new Date(milestone.date).toLocaleDateString("ko-KR")}
                              </p>
                              <h4 className="font-medium text-slate-900">
                                {milestone.title}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-slate-400 text-center">
                로드맵 생성일: {new Date(roadmap.generated_at).toLocaleString("ko-KR")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
