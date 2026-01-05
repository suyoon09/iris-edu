"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Student, SavedReport } from "@/types/student";

export default function ReportsPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

    useEffect(() => {
        fetchData();
    }, [studentId]);

    const fetchData = async () => {
        try {
            const [studentRes, reportsRes] = await Promise.all([
                fetch(`/api/students/${studentId}`),
                fetch(`/api/reports?student_id=${studentId}`),
            ]);

            if (studentRes.ok) {
                setStudent(await studentRes.json());
            }
            if (reportsRes.ok) {
                setReports(await reportsRes.json());
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                                {student?.name_korean} - 저장된 리포트
                            </h1>
                            <p className="text-slate-500 mt-1">
                                AI 분석 및 로드맵 리포트 히스토리
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>
                                돌아가기
                            </Button>
                            <Button onClick={() => router.push(`/students/${studentId}/analysis`)}>
                                새 분석 생성
                            </Button>
                        </div>
                    </div>

                    {/* Reports List and Detail */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Reports List */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>리포트 목록 ({reports.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reports.length === 0 ? (
                                        <p className="text-slate-500 text-sm py-4">
                                            저장된 리포트가 없습니다.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {reports.map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => setSelectedReport(report)}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedReport?.id === report.id
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-slate-200 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <Badge
                                                            variant={report.type === "analysis" ? "info" : "success"}
                                                        >
                                                            {report.type === "analysis" ? "분석" : "로드맵"}
                                                        </Badge>
                                                        <span className="text-xs text-slate-400">
                                                            {formatDate(report.generated_at).split(" ").slice(0, 3).join(" ")}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        {report.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {formatDate(report.generated_at)}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Report Detail */}
                        <div className="lg:col-span-2">
                            {selectedReport ? (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{selectedReport.title}</CardTitle>
                                            <Badge
                                                variant={selectedReport.type === "analysis" ? "info" : "success"}
                                            >
                                                {selectedReport.type === "analysis" ? "AI 분석" : "로드맵"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            생성일: {formatDate(selectedReport.generated_at)}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedReport.type === "analysis" ? (
                                            <AnalysisReportView data={selectedReport.data} />
                                        ) : (
                                            <RoadmapReportView data={selectedReport.data} />
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
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
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="text-slate-500">
                                            왼쪽에서 리포트를 선택하세요
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// Analysis Report View Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AnalysisReportView({ data }: { data: any }) {
    return (
        <div className="space-y-6">
            {/* Stage 1: Overall Assessment */}
            {data.stage1?.overall_assessment && (
                <div>
                    <h4 className="font-medium text-slate-900 mb-2">종합 평가</h4>
                    <p className="text-slate-700 text-sm">{data.stage1.overall_assessment.summary}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                            <p className="text-xs font-medium text-green-700 mb-1">강점</p>
                            <ul className="text-xs text-slate-600 space-y-1">
                                {(data.stage1.overall_assessment.strengths || []).slice(0, 3).map((s: string, i: number) => (
                                    <li key={i}>+ {s}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-amber-700 mb-1">개선 영역</p>
                            <ul className="text-xs text-slate-600 space-y-1">
                                {(data.stage1.overall_assessment.areas_for_improvement || []).slice(0, 3).map((a: string, i: number) => (
                                    <li key={i}>! {a}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Stage 2: University Analyses */}
            {data.stage2?.university_analyses && (
                <div>
                    <h4 className="font-medium text-slate-900 mb-2">대학별 분석</h4>
                    <div className="space-y-2">
                        {data.stage2.university_analyses.slice(0, 5).map((uni: { university_name: string; admission_probability?: { score: number; category: string } }, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                <span className="text-sm">{uni.university_name}</span>
                                <Badge variant={
                                    uni.admission_probability?.category === "safety" ? "success" :
                                        uni.admission_probability?.category === "target" ? "warning" : "error"
                                }>
                                    {uni.admission_probability?.score}%
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stage 3: ED/RD Strategy */}
            {data.stage3?.ed_rd_strategy && (
                <div>
                    <h4 className="font-medium text-slate-900 mb-2">ED/RD 전략</h4>
                    <p className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded">
                        추천 ED: {data.stage3.ed_rd_strategy.recommended_ed_school?.university_id || "N/A"}
                    </p>
                </div>
            )}

            <p className="text-xs text-slate-400 text-right">
                생성 완료: {data.completed_at ? new Date(data.completed_at).toLocaleString("ko-KR") : "N/A"}
            </p>
        </div>
    );
}

// Roadmap Report View Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RoadmapReportView({ data }: { data: any }) {
    return (
        <div className="space-y-6">
            {/* Stage 1: Key Priorities */}
            {data.stage1 && (
                <div>
                    <h4 className="font-medium text-slate-900 mb-2">핵심 우선순위</h4>
                    <p className="text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded mb-2">
                        현재 단계: {data.stage1.current_phase}
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1">
                        {(data.stage1.key_priorities || []).map((p: string, i: number) => (
                            <li key={i}>{i + 1}. {p}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Stage 2: Monthly Items */}
            {data.stage2?.items && (
                <div>
                    <h4 className="font-medium text-slate-900 mb-2">월별 로드맵</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {data.stage2.items.slice(0, 10).map((item: { year: number; month: number; title: string; priority: string }, i: number) => (
                            <div key={i} className="p-2 border-l-4 border-blue-500 bg-slate-50 rounded-r">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.title}</span>
                                    <span className="text-xs text-slate-500">
                                        {item.year}/{item.month}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Milestones */}
            {data.stage2?.milestones && data.stage2.milestones.length > 0 && (
                <div>
                    <h4 className="font-medium text-slate-900 mb-2">주요 마일스톤</h4>
                    <div className="space-y-2">
                        {data.stage2.milestones.slice(0, 4).map((m: { date: string; title: string }, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-blue-500">★</span>
                                <span>{m.title}</span>
                                <span className="text-xs text-slate-400">({m.date})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs text-slate-400 text-right">
                생성 완료: {data.completed_at ? new Date(data.completed_at).toLocaleString("ko-KR") : "N/A"}
            </p>
        </div>
    );
}
