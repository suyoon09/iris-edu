"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Student } from "@/types/student";
import type { RoadmapItem } from "@/types/analysis";

interface StageResult {
  stage: number;
  completed_at: string;
  elapsed_ms: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
}

interface RoadmapState {
  stage1?: StageResult;
  stage2?: StageResult;
}

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

const STAGE_NAMES = ["", "준비 계획 분석 중...", "상세 로드맵 생성 중..."];

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [roadmapState, setRoadmapState] = useState<RoadmapState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [failedStage, setFailedStage] = useState<number | null>(null);

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

  const callStage = async (
    stage: number,
    context: Record<string, unknown>
  ): Promise<StageResult | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch("/api/roadmap/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, stage, context }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Stage ${stage} failed`);
      }

      return data as StageResult;
    } catch (err) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isAborted = err instanceof Error && err.name === "AbortError";

      if (isAborted) {
        throw new Error(`Stage ${stage} 시간 초과`);
      }
      throw new Error(errorMessage);
    }
  };

  const generateRoadmap = async () => {
    setCurrentStage(1);
    setError("");
    setDebugInfo(null);
    setFailedStage(null);
    setRoadmapState({});

    try {
      // Stage 1: Core planning
      setCurrentStage(1);
      const stage1 = await callStage(1, {});
      if (!stage1) throw new Error("Stage 1 returned no result");
      setRoadmapState((prev) => ({ ...prev, stage1 }));

      // Stage 2: Detailed roadmap
      setCurrentStage(2);
      const stage2 = await callStage(2, { stage1Result: stage1.result });
      if (!stage2) throw new Error("Stage 2 returned no result");
      setRoadmapState((prev) => ({ ...prev, stage2 }));

      setCurrentStage(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setFailedStage(currentStage);
      setDebugInfo({
        failedAtStage: currentStage,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
      setCurrentStage(0);
    }
  };

  const retryFromStage = async (stage: number) => {
    setError("");
    setDebugInfo(null);
    setFailedStage(null);
    setCurrentStage(stage);

    try {
      const context: Record<string, unknown> = {};
      if (stage >= 2 && roadmapState.stage1) {
        context.stage1Result = roadmapState.stage1.result;
      }

      for (let s = stage; s <= 2; s++) {
        setCurrentStage(s);
        const result = await callStage(s, context);
        if (!result) throw new Error(`Stage ${s} returned no result`);

        setRoadmapState((prev) => ({ ...prev, [`stage${s}`]: result }));

        if (s === 1) context.stage1Result = result.result;
      }

      setCurrentStage(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setFailedStage(currentStage);
      setCurrentStage(0);
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

  const hasAnyRoadmap = Object.keys(roadmapState).length > 0;
  const isComplete = roadmapState.stage1 && roadmapState.stage2;
  const isGenerating = currentStage > 0;

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
                월별 입시 준비 계획을 AI가 2단계로 생성합니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                돌아가기
              </Button>
              <Button onClick={generateRoadmap} disabled={isGenerating}>
                {hasAnyRoadmap ? "다시 생성" : "로드맵 생성"}
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          {isGenerating && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">
                      {STAGE_NAMES[currentStage]} ({currentStage}/2)
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2].map((s) => (
                        <div
                          key={s}
                          className={`h-2 flex-1 rounded-full ${s < currentStage
                              ? "bg-blue-600"
                              : s === currentStage
                                ? "bg-blue-400 animate-pulse"
                                : "bg-blue-200"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="py-4">
                <p className="text-red-600 font-medium">{error}</p>
                {failedStage && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryFromStage(failedStage)}
                    >
                      Stage {failedStage}부터 다시 시도
                    </Button>
                  </div>
                )}
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

          {/* No Roadmap Yet */}
          {!hasAnyRoadmap && !isGenerating && (
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
                <Button onClick={generateRoadmap} disabled={isGenerating}>
                  로드맵 생성
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stage 1: Key Priorities */}
          {roadmapState.stage1 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  핵심 우선순위
                  <Badge variant="success">완료</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-indigo-50 rounded-lg mb-4">
                  <p className="text-sm text-indigo-600">
                    현재 단계: <span className="font-medium">{roadmapState.stage1.result.current_phase}</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">핵심 우선순위</h4>
                  <ul className="space-y-2">
                    {(roadmapState.stage1.result.key_priorities || []).map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-blue-500 font-bold">{i + 1}.</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 2: Monthly Roadmap */}
          {roadmapState.stage2 && (
            <>
              {/* Category Legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Badge key={key} className={categoryColors[key]}>
                    {label}
                  </Badge>
                ))}
              </div>

              {/* Monthly Roadmap */}
              <div className="space-y-6">
                {groupItemsByMonth(roadmapState.stage2.result.items || []).map(
                  ([monthKey, items]) => {
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
                                className={`p-4 border-l-4 bg-slate-50 rounded-r-lg ${priorityColors[item.priority] || priorityColors.low
                                  }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className={categoryColors[item.category] || categoryColors.academics}>
                                        {categoryLabels[item.category] || item.category}
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
                  }
                )}
              </div>

              {/* Milestones */}
              {(roadmapState.stage2.result.milestones || []).length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>주요 마일스톤</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                      <div className="space-y-4">
                        {roadmapState.stage2.result.milestones.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (milestone: any, i: number) => (
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
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Completion timestamp */}
          {isComplete && (
            <p className="text-xs text-slate-400 text-center mt-6">
              로드맵 생성일: {new Date(roadmapState.stage2!.completed_at).toLocaleString("ko-KR")}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
