"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Student } from "@/types/student";
import type { AdmissionAnalysis } from "@/types/analysis";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [analysis, setAnalysis] = useState<AdmissionAnalysis | null>(null);
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

  const generateAnalysis = async () => {
    setIsGenerating(true);
    setError("");
    setDebugInfo(null);

    // Use AbortController for timeout (Netlify has 26s limit)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s client timeout

    try {
      const response = await fetch("/api/analyze", {
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
        setError("서버 응답을 파싱할 수 없습니다.");
        setDebugInfo({
          parseError: true,
          status: response.status,
          statusText: response.statusText,
          hint: "서버가 유효한 JSON을 반환하지 않았습니다.",
        });
        return;
      }

      if (!response.ok) {
        setError(data.error || "Analysis failed");
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

      setAnalysis(data);
    } catch (err) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isAborted = err instanceof Error && err.name === "AbortError";
      const isTimeout = isAborted || errorMessage.includes("timeout") || errorMessage.includes("aborted");

      if (isTimeout) {
        setError("요청 시간이 초과되었습니다 (Netlify 서버 제한: 26초). AI 응답이 너무 길 수 있습니다.");
      } else {
        setError("분석 생성에 실패했습니다.");
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

  const getProbabilityColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 40) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
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
                {student?.name_korean} - AI 입시 분석
              </h1>
              <p className="text-slate-500 mt-1">
                Claude AI를 활용한 맞춤형 입시 분석 리포트
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                돌아가기
              </Button>
              <Button onClick={generateAnalysis} isLoading={isGenerating}>
                {analysis ? "다시 분석" : "분석 시작"}
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

          {!analysis && !isGenerating && (
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
                  학생의 프로필과 목표 대학을 분석하여 맞춤형 입시 전략을 제안합니다.
                </p>
                <Button onClick={generateAnalysis} isLoading={isGenerating}>
                  분석 시작
                </Button>
              </CardContent>
            </Card>
          )}

          {isGenerating && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  AI가 분석 중입니다...
                </h3>
                <p className="text-slate-500">
                  학생의 프로필과 목표 대학을 분석하고 있습니다. 잠시만 기다려주세요.
                </p>
              </CardContent>
            </Card>
          )}

          {analysis && !isGenerating && (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>종합 평가</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">{analysis.overall_assessment.summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">강점</h4>
                      <ul className="space-y-1">
                        {analysis.overall_assessment.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-green-500 mt-0.5">+</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">개선 영역</h4>
                      <ul className="space-y-1">
                        {analysis.overall_assessment.areas_for_improvement.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-amber-500 mt-0.5">!</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">한국 학생 관점 분석</h4>
                    <p className="text-sm text-blue-700">
                      {analysis.overall_assessment.korean_student_context}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* University Analyses */}
              <Card>
                <CardHeader>
                  <CardTitle>대학별 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysis.university_analyses.map((uni, i) => (
                      <div
                        key={i}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900">
                            {uni.university_name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                uni.admission_probability.category === "safety"
                                  ? "success"
                                  : uni.admission_probability.category === "target"
                                    ? "warning"
                                    : "error"
                              }
                            >
                              {uni.admission_probability.category.toUpperCase()}
                            </Badge>
                            <span
                              className={`text-lg font-bold px-2 py-1 rounded ${getProbabilityColor(
                                uni.admission_probability.score
                              )}`}
                            >
                              {uni.admission_probability.score}%
                            </span>
                          </div>
                        </div>

                        {/* Profile Match */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {[
                            { label: "학업", value: uni.profile_match.academic_fit },
                            { label: "비교과", value: uni.profile_match.extracurricular_fit },
                            { label: "적합도", value: uni.profile_match.personal_fit },
                            { label: "종합", value: uni.profile_match.overall_fit },
                          ].map((item) => (
                            <div key={item.label} className="text-center">
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${item.value}%` }}
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
                              {uni.essay_themes_suggested.map((theme, j) => (
                                <Badge key={j} variant="info">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {(uni.korean_student_advantage || uni.korean_student_challenge) && (
                          <div className="mt-4 p-3 bg-slate-50 rounded">
                            {uni.korean_student_advantage && (
                              <p className="text-sm text-green-700">
                                <span className="font-medium">한국 학생 강점:</span> {uni.korean_student_advantage}
                              </p>
                            )}
                            {uni.korean_student_challenge && (
                              <p className="text-sm text-amber-700 mt-1">
                                <span className="font-medium">주의점:</span> {uni.korean_student_challenge}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strategic Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>전략적 권고사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">즉시 실행</h4>
                      <ul className="space-y-2">
                        {analysis.strategic_recommendations.immediate_actions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-red-500 font-bold">!</span>
                            <span className="text-slate-600">{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">단기 목표</h4>
                      <ul className="space-y-2">
                        {analysis.strategic_recommendations.short_term_goals.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-amber-500 font-bold">→</span>
                            <span className="text-slate-600">{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {analysis.strategic_recommendations.korean_specific_strategies.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">한국 학생 특화 전략</h4>
                      <ul className="space-y-1">
                        {analysis.strategic_recommendations.korean_specific_strategies.map((s, i) => (
                          <li key={i} className="text-sm text-blue-700">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <p className="text-xs text-slate-400 text-center">
                분석 생성일: {new Date(analysis.generated_at).toLocaleString("ko-KR")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
