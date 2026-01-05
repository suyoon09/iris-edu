"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Student } from "@/types/student";

interface StageResult {
  stage: number;
  completed_at: string;
  elapsed_ms: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
}

interface AnalysisState {
  stage1?: StageResult;
  stage2?: StageResult;
  stage3?: StageResult;
  stage4?: StageResult;
}

const STAGE_NAMES = [
  "",
  "종합 평가 분석 중...",
  "대학별 분석 중...",
  "ED/RD 전략 수립 중...",
  "상세 타임라인 생성 중...",
];

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({});
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
      const response = await fetch("/api/analyze/stage", {
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
        throw new Error(`Stage ${stage} 시간 초과 (Netlify 26초 제한)`);
      }
      throw new Error(errorMessage);
    }
  };

  const generateAnalysis = async () => {
    setCurrentStage(1);
    setError("");
    setDebugInfo(null);
    setFailedStage(null);
    setAnalysisState({});

    try {
      // Stage 1: Overall Assessment
      setCurrentStage(1);
      const stage1 = await callStage(1, {});
      if (!stage1) throw new Error("Stage 1 returned no result");
      setAnalysisState((prev) => ({ ...prev, stage1 }));

      // Stage 2: University Analysis
      setCurrentStage(2);
      const stage2 = await callStage(2, { stage1Result: stage1.result });
      if (!stage2) throw new Error("Stage 2 returned no result");
      setAnalysisState((prev) => ({ ...prev, stage2 }));

      // Stage 3: ED/RD Strategy
      setCurrentStage(3);
      const stage3 = await callStage(3, {
        stage1Result: stage1.result,
        stage2Result: stage2.result,
      });
      if (!stage3) throw new Error("Stage 3 returned no result");
      setAnalysisState((prev) => ({ ...prev, stage3 }));

      // Stage 4: Detailed Timeline
      setCurrentStage(4);
      const stage4 = await callStage(4, {
        stage1Result: stage1.result,
        stage3Result: stage3.result,
      });
      if (!stage4) throw new Error("Stage 4 returned no result");
      setAnalysisState((prev) => ({ ...prev, stage4 }));

      // Complete
      setCurrentStage(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setFailedStage(currentStage);
      setDebugInfo({
        failedAtStage: currentStage,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        completedStages: Object.keys(analysisState).length,
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
      if (stage >= 2 && analysisState.stage1) {
        context.stage1Result = analysisState.stage1.result;
      }
      if (stage >= 3 && analysisState.stage2) {
        context.stage2Result = analysisState.stage2.result;
      }
      if (stage === 4 && analysisState.stage3) {
        context.stage3Result = analysisState.stage3.result;
      }

      for (let s = stage; s <= 4; s++) {
        setCurrentStage(s);
        const result = await callStage(s, context);
        if (!result) throw new Error(`Stage ${s} returned no result`);

        setAnalysisState((prev) => ({ ...prev, [`stage${s}`]: result }));

        if (s === 1) context.stage1Result = result.result;
        if (s === 2) context.stage2Result = result.result;
        if (s === 3) context.stage3Result = result.result;
      }

      setCurrentStage(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setFailedStage(currentStage);
      setCurrentStage(0);
    }
  };

  const getProbabilityColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 40) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const hasAnyAnalysis = Object.keys(analysisState).length > 0;
  const isComplete = analysisState.stage1 && analysisState.stage2 && analysisState.stage3 && analysisState.stage4;
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
                {student?.name_korean} - AI 입시 분석
              </h1>
              <p className="text-slate-500 mt-1">
                Claude AI를 활용한 맞춤형 입시 분석 리포트 (4단계 분석)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                돌아가기
              </Button>
              <Button onClick={generateAnalysis} disabled={isGenerating}>
                {hasAnyAnalysis ? "다시 분석" : "분석 시작"}
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
                      {STAGE_NAMES[currentStage]} ({currentStage}/4)
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((s) => (
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

          {/* Partial Results Notice */}
          {hasAnyAnalysis && !isComplete && !isGenerating && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="py-4">
                <p className="text-amber-700">
                  일부 분석만 완료되었습니다 ({Object.keys(analysisState).length}/4 단계).
                  아래에서 완료된 분석 결과를 확인할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          )}

          {/* No Analysis Yet */}
          {!hasAnyAnalysis && !isGenerating && (
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  AI 분석을 시작하세요
                </h3>
                <p className="text-slate-500 mb-4">
                  학생의 프로필과 목표 대학을 4단계로 분석하여 맞춤형 입시 전략을 제안합니다.
                </p>
                <Button onClick={generateAnalysis} disabled={isGenerating}>
                  분석 시작
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stage 1: Overall Assessment */}
          {analysisState.stage1 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  종합 평가
                  <Badge variant="success">완료</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  {analysisState.stage1.result.overall_assessment?.summary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">강점</h4>
                    <ul className="space-y-1">
                      {(analysisState.stage1.result.overall_assessment?.strengths || []).map(
                        (s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-green-500 mt-0.5">+</span>
                            {s}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">개선 영역</h4>
                    <ul className="space-y-1">
                      {(analysisState.stage1.result.overall_assessment?.areas_for_improvement || []).map(
                        (a: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-amber-500 mt-0.5">!</span>
                            {a}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">한국 학생 관점 분석</h4>
                  <p className="text-sm text-blue-700">
                    {analysisState.stage1.result.overall_assessment?.korean_student_context}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 2: University Analyses */}
          {analysisState.stage2 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  대학별 분석
                  <Badge variant="success">완료</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(analysisState.stage2.result.university_analyses || []).map(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (uni: any, i: number) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900">{uni.university_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                uni.admission_probability?.category === "safety"
                                  ? "success"
                                  : uni.admission_probability?.category === "target"
                                    ? "warning"
                                    : "error"
                              }
                            >
                              {uni.admission_probability?.category?.toUpperCase()}
                            </Badge>
                            <span
                              className={`text-lg font-bold px-2 py-1 rounded ${getProbabilityColor(
                                uni.admission_probability?.score || 0
                              )}`}
                            >
                              {uni.admission_probability?.score}%
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {[
                            { label: "학업", value: uni.profile_match?.academic_fit },
                            { label: "비교과", value: uni.profile_match?.extracurricular_fit },
                            { label: "적합도", value: uni.profile_match?.personal_fit },
                            { label: "종합", value: uni.profile_match?.overall_fit },
                          ].map((item) => (
                            <div key={item.label} className="text-center">
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${item.value || 0}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {item.label} {item.value}%
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-slate-700 mb-1">지원 전략</p>
                            <p className="text-slate-600">{uni.application_strategy}</p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 mb-1">추천 에세이 주제</p>
                            <div className="flex flex-wrap gap-1">
                              {(uni.essay_themes_suggested || []).map((theme: string, j: number) => (
                                <Badge key={j} variant="info">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 3: ED/RD Strategy */}
          {analysisState.stage3 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ED/RD 전략
                  <Badge variant="success">완료</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* ED Recommendation */}
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-medium text-indigo-900 mb-2">✨ ED 추천 학교</h4>
                    <p className="text-lg font-semibold text-indigo-800">
                      {analysisState.stage3.result.ed_rd_strategy?.recommended_ed_school?.university_id}
                    </p>
                    <p className="text-sm text-indigo-700 mt-1">
                      {analysisState.stage3.result.ed_rd_strategy?.recommended_ed_school?.rationale}
                    </p>
                  </div>

                  {/* Strategic Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">즉시 실행</h4>
                      <ul className="space-y-2">
                        {(analysisState.stage3.result.strategic_recommendations?.immediate_actions || []).map(
                          (a: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-red-500 font-bold">!</span>
                              <span className="text-slate-600">{a}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">단기 목표</h4>
                      <ul className="space-y-2">
                        {(analysisState.stage3.result.strategic_recommendations?.short_term_goals || []).map(
                          (g: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-amber-500 font-bold">→</span>
                              <span className="text-slate-600">{g}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Korean-Specific Strategies */}
                  {(analysisState.stage3.result.strategic_recommendations?.korean_specific_strategies || []).length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">한국 학생 특화 전략</h4>
                      <ul className="space-y-1">
                        {analysisState.stage3.result.strategic_recommendations.korean_specific_strategies.map(
                          (s: string, i: number) => (
                            <li key={i} className="text-sm text-blue-700">
                              • {s}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 4: Timeline */}
          {analysisState.stage4 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  상세 타임라인
                  <Badge variant="success">완료</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="p-4 bg-slate-100 rounded-lg">
                    <p className="text-sm text-slate-600">
                      현재 상태: {analysisState.stage4.result.detailed_timeline?.current_status?.phase}
                      {" | "}
                      ED 마감까지: {analysisState.stage4.result.detailed_timeline?.current_status?.months_until_ed_deadline}개월
                    </p>
                  </div>

                  {/* Phases */}
                  {(analysisState.stage4.result.detailed_timeline?.phases || []).map(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (phase: any, i: number) => (
                      <div key={i} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-slate-900">{phase.phase_name}</h4>
                        <p className="text-sm text-slate-500">{phase.date_range}</p>
                        <ul className="mt-2 space-y-1">
                          {(phase.key_tasks || phase.objectives || []).slice(0, 3).map((task: string, j: number) => (
                            <li key={j} className="text-sm text-slate-600">• {task}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}

                  {/* Immediate Actions */}
                  {(analysisState.stage4.result.immediate_action_items || []).length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">🚨 이번 주 할 일</h4>
                      <ul className="space-y-2">
                        {analysisState.stage4.result.immediate_action_items.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (item: any, i: number) => (
                            <li key={i} className="text-sm text-red-700">
                              <span className="font-medium">{item.action}</span>
                              <span className="text-red-500 ml-2">({item.deadline})</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion timestamp */}
          {isComplete && (
            <p className="text-xs text-slate-400 text-center">
              분석 완료: {new Date(analysisState.stage4!.completed_at).toLocaleString("ko-KR")}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
