"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { exportToPDF } from "@/lib/pdf-export";
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
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const typeLabel = selectedReport.type === 'analysis' ? 'AI분석' : '로드맵';
                                                        exportToPDF('report-content', {
                                                            filename: `${student?.name_korean}_${typeLabel}.pdf`,
                                                            title: `${student?.name_korean} - ${typeLabel} 리포트`
                                                        });
                                                    }}
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    PDF 다운로드
                                                </Button>
                                                <Badge
                                                    variant={selectedReport.type === "analysis" ? "info" : "success"}
                                                >
                                                    {selectedReport.type === "analysis" ? "AI 분석" : "로드맵"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            생성일: {formatDate(selectedReport.generated_at)}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div id="report-content">
                                            {selectedReport.type === "analysis" ? (
                                                <AnalysisReportView data={selectedReport.data} />
                                            ) : (
                                                <RoadmapReportView data={selectedReport.data} />
                                            )}
                                        </div>
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

// Analysis Report View Component - FULL REPORT
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AnalysisReportView({ data }: { data: any }) {
    return (
        <div className="space-y-8">
            {/* Stage 1: Overall Assessment */}
            {data.stage1?.overall_assessment && (
                <section className="border-b pb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                        종합 평가
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                        <p className="text-slate-700">{data.stage1.overall_assessment.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                                <span>✓</span> 강점
                            </h4>
                            <ul className="space-y-2">
                                {(data.stage1.overall_assessment.strengths || []).map((s: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-700 pl-4 border-l-2 border-green-300">{s}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-1">
                                <span>!</span> 개선 영역
                            </h4>
                            <ul className="space-y-2">
                                {(data.stage1.overall_assessment.areas_for_improvement || []).map((a: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-700 pl-4 border-l-2 border-amber-300">{a}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {data.stage1.overall_assessment.korean_student_context && (
                        <div className="mt-4 bg-indigo-50 p-3 rounded">
                            <h4 className="font-semibold text-indigo-700 mb-1">한국 학생 맥락</h4>
                            <p className="text-sm text-indigo-900">{data.stage1.overall_assessment.korean_student_context}</p>
                        </div>
                    )}
                </section>
            )}

            {/* Stage 2: University Analyses */}
            {data.stage2?.university_analyses && (
                <section className="border-b pb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                        대학별 분석
                    </h3>
                    <div className="space-y-4">
                        {data.stage2.university_analyses.map((uni: {
                            university_name: string;
                            university_id: string;
                            admission_probability?: { score: number; category: string; confidence?: string };
                            profile_match?: { academic_fit: number; extracurricular_fit: number; overall_fit: number };
                            strengths_for_school?: string[];
                            gaps_to_address?: string[];
                            application_strategy?: string;
                            essay_themes_suggested?: string[];
                        }, i: number) => (
                            <div key={i} className="border rounded-lg p-4 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-slate-900">{uni.university_name}</h4>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            uni.admission_probability?.category === "safety" ? "success" :
                                                uni.admission_probability?.category === "target" ? "warning" : "error"
                                        }>
                                            {uni.admission_probability?.score}% ({uni.admission_probability?.category})
                                        </Badge>
                                    </div>
                                </div>

                                {uni.profile_match && (
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <div className="text-center bg-slate-50 p-2 rounded">
                                            <p className="text-xs text-slate-500">학업 적합도</p>
                                            <p className="font-bold text-slate-700">{uni.profile_match.academic_fit}%</p>
                                        </div>
                                        <div className="text-center bg-slate-50 p-2 rounded">
                                            <p className="text-xs text-slate-500">활동 적합도</p>
                                            <p className="font-bold text-slate-700">{uni.profile_match.extracurricular_fit}%</p>
                                        </div>
                                        <div className="text-center bg-slate-50 p-2 rounded">
                                            <p className="text-xs text-slate-500">종합 적합도</p>
                                            <p className="font-bold text-slate-700">{uni.profile_match.overall_fit}%</p>
                                        </div>
                                    </div>
                                )}

                                {uni.application_strategy && (
                                    <p className="text-sm text-slate-600 mb-2"><strong>전략:</strong> {uni.application_strategy}</p>
                                )}

                                {uni.essay_themes_suggested && uni.essay_themes_suggested.length > 0 && (
                                    <div className="text-sm">
                                        <strong className="text-slate-700">추천 에세이 주제:</strong>
                                        <ul className="list-disc list-inside text-slate-600 mt-1">
                                            {uni.essay_themes_suggested.map((t: string, j: number) => (
                                                <li key={j}>{t}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Stage 3: ED/RD Strategy */}
            {data.stage3?.ed_rd_strategy && (
                <section className="border-b pb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                        ED/RD 전략
                    </h3>

                    {data.stage3.ed_rd_strategy.recommended_ed_school && (
                        <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                            <h4 className="font-semibold text-indigo-700 mb-2">추천 ED 학교</h4>
                            <p className="text-lg font-bold text-indigo-900">
                                {data.stage3.ed_rd_strategy.recommended_ed_school.university_name || data.stage3.ed_rd_strategy.recommended_ed_school.university_id}
                            </p>
                            {data.stage3.ed_rd_strategy.recommended_ed_school.rationale && (
                                <p className="text-sm text-indigo-700 mt-2">{data.stage3.ed_rd_strategy.recommended_ed_school.rationale}</p>
                            )}
                        </div>
                    )}

                    {data.stage3.ed_rd_strategy.ea_recommendations && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-slate-700 mb-2">EA 추천</h4>
                            <ul className="space-y-1">
                                {data.stage3.ed_rd_strategy.ea_recommendations.map((ea: { university_id: string; rationale?: string }, i: number) => (
                                    <li key={i} className="text-sm text-slate-600">• {ea.university_id} {ea.rationale && `- ${ea.rationale}`}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {data.stage3.ed_rd_strategy.rd_list && (
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-2">RD 리스트</h4>
                            <ul className="space-y-1">
                                {data.stage3.ed_rd_strategy.rd_list.map((rd: { university_id: string }, i: number) => (
                                    <li key={i} className="text-sm text-slate-600">• {rd.university_id}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {/* Stage 4: Timeline */}
            {data.stage4?.timeline && (
                <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                        상세 타임라인
                    </h3>
                    <div className="space-y-3">
                        {data.stage4.timeline.map((item: { month: string; year: number; tasks: string[]; focus_area: string }, i: number) => (
                            <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-900">{item.year}년 {item.month}</span>
                                    <Badge variant="info">{item.focus_area}</Badge>
                                </div>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    {item.tasks.map((task: string, j: number) => (
                                        <li key={j}>• {task}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <p className="text-xs text-slate-400 text-right border-t pt-4">
                생성 완료: {data.completed_at ? new Date(data.completed_at).toLocaleString("ko-KR") : "N/A"}
            </p>
        </div>
    );
}

// Roadmap Report View Component - FULL REPORT
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RoadmapReportView({ data }: { data: any }) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "border-red-500 bg-red-50";
            case "medium": return "border-amber-500 bg-amber-50";
            case "low": return "border-green-500 bg-green-50";
            default: return "border-blue-500 bg-slate-50";
        }
    };

    return (
        <div className="space-y-8">
            {/* Stage 1: Key Priorities */}
            {data.stage1 && (
                <section className="border-b pb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                        핵심 계획 및 우선순위
                    </h3>

                    <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-indigo-700 mb-1">현재 단계</h4>
                        <p className="text-indigo-900 font-medium">{data.stage1.current_phase || "N/A"}</p>
                    </div>

                    {data.stage1.key_priorities && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-slate-700 mb-2">핵심 우선순위</h4>
                            <ol className="space-y-2">
                                {data.stage1.key_priorities.map((p: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="bg-slate-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-slate-700">{p}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {data.stage1.risk_factors && (
                        <div className="bg-amber-50 p-3 rounded">
                            <h4 className="font-semibold text-amber-700 mb-1">위험 요소</h4>
                            <ul className="text-sm text-amber-900 space-y-1">
                                {data.stage1.risk_factors.map((r: string, i: number) => (
                                    <li key={i}>⚠ {r}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {/* Stage 2: Monthly Roadmap Items */}
            {data.stage2?.items && (
                <section className="border-b pb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                        월별 상세 로드맵
                    </h3>

                    <div className="space-y-3">
                        {data.stage2.items.map((item: {
                            year: number;
                            month: number;
                            title: string;
                            description?: string;
                            priority: string;
                            category?: string;
                            deadline?: string;
                        }, i: number) => (
                            <div key={i} className={`p-3 border-l-4 rounded-r ${getPriorityColor(item.priority)}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-slate-900">{item.title}</span>
                                    <div className="flex items-center gap-2">
                                        {item.category && (
                                            <Badge variant="info">{item.category}</Badge>
                                        )}
                                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">
                                            {item.year}년 {item.month}월
                                        </span>
                                    </div>
                                </div>
                                {item.description && (
                                    <p className="text-sm text-slate-600">{item.description}</p>
                                )}
                                {item.deadline && (
                                    <p className="text-xs text-red-600 mt-1">마감: {item.deadline}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Milestones */}
            {data.stage2?.milestones && data.stage2.milestones.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">주요 마일스톤</h3>
                    <div className="space-y-3">
                        {data.stage2.milestones.map((m: { date: string; title: string; description?: string }, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                                <span className="text-2xl">★</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{m.title}</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{m.date}</span>
                                    </div>
                                    {m.description && (
                                        <p className="text-sm text-slate-600 mt-1">{m.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <p className="text-xs text-slate-400 text-right border-t pt-4">
                생성 완료: {data.completed_at ? new Date(data.completed_at).toLocaleString("ko-KR") : "N/A"}
            </p>
        </div>
    );
}
