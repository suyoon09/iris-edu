"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { University } from "@/types/university";

export default function UniversityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const universityId = params.id as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUniversity();
  }, [universityId]);

  const fetchUniversity = async () => {
    try {
      const response = await fetch(`/api/universities?id=${universityId}`);
      if (response.ok) {
        setUniversity(await response.json());
      }
    } catch (error) {
      console.error("Error fetching university:", error);
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

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="p-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">대학 정보를 찾을 수 없습니다.</p>
                <Button className="mt-4" onClick={() => router.back()}>
                  돌아가기
                </Button>
              </CardContent>
            </Card>
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
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {university.basic_info.name}
                </h1>
                <Badge variant="info">{university.basic_info.name_short}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {university.basic_info.location.city}, {university.basic_info.location.state}
                </span>
                <span>{university.basic_info.type}</span>
                <span>설립 {university.basic_info.founded}년</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              목록으로
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Admission Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>입학 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">합격률</p>
                      <p className="text-2xl font-bold text-red-600">
                        {university.admission_stats.acceptance_rate}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">SAT 중앙값</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {university.admission_stats.profile_ranges.sat_total.median}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">GPA 중앙값</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {university.admission_stats.profile_ranges.gpa_unweighted.median}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">등록률</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {university.admission_stats.yield_rate}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">총 지원자</span>
                      <span className="font-medium">{university.admission_stats.total_applicants.toLocaleString()}명</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">총 합격자</span>
                      <span className="font-medium">{university.admission_stats.total_admitted.toLocaleString()}명</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">국제 학생 지원자</span>
                      <span className="font-medium">{university.admission_stats.international_applicants.toLocaleString()}명</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">국제 학생 합격자</span>
                      <span className="font-medium">{university.admission_stats.international_admitted.toLocaleString()}명</span>
                    </div>
                    {university.admission_stats.early_action_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">EA 합격률</span>
                        <span className="font-medium">{university.admission_stats.early_action_rate}%</span>
                      </div>
                    )}
                    {university.admission_stats.early_decision_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">ED 합격률</span>
                        <span className="font-medium">{university.admission_stats.early_decision_rate}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Korean Student Specific */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">한국 학생 맞춤 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Advice */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">지원 조언</h4>
                    <ul className="space-y-2">
                      {university.korean_student_specific.korean_specific_advice.map((advice, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-green-500 mt-0.5">+</span>
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Mistakes */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">주의해야 할 점</h4>
                    <ul className="space-y-2">
                      {university.korean_student_specific.common_korean_applicant_mistakes.map((mistake, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-red-500 mt-0.5">!</span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Commonly Admitted Schools */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">합격자 배출 고등학교</h4>
                    <div className="flex flex-wrap gap-2">
                      {university.korean_student_specific.historical_admit_patterns.korean_high_schools_commonly_admitted.map((school, i) => (
                        <Badge key={i} variant="default">{school}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Student Life */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">한국 음식 접근성</h4>
                      <p className="text-sm text-slate-600">{university.korean_student_specific.korean_food_access}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">한인 교회</h4>
                      <p className="text-sm text-slate-600">{university.korean_student_specific.korean_church_proximity}</p>
                    </div>
                  </div>

                  {/* Korean Organizations */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">한인 학생 단체</h4>
                    <div className="flex flex-wrap gap-2">
                      {university.korean_student_specific.korean_student_organizations.map((org, i) => (
                        <Badge key={i} variant="info">{org}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Programs */}
              <Card>
                <CardHeader>
                  <CardTitle>학업 프로그램</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">인기 전공</h4>
                    <div className="flex flex-wrap gap-2">
                      {university.academic_programs.notable_majors.map((major, i) => (
                        <Badge key={i} variant="default">{major}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">특별 프로그램</h4>
                    <ul className="space-y-1">
                      {university.academic_programs.unique_programs.map((program, i) => (
                        <li key={i} className="text-sm text-slate-600">• {program}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">커리큘럼 구조</h4>
                    <p className="text-sm text-slate-600">{university.academic_programs.curriculum_structure}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Application Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>지원 요건</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {university.application_requirements.deadline_early && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">조기 마감</span>
                        <span className="font-medium">{university.application_requirements.deadline_early}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">정시 마감</span>
                      <span className="font-medium">{university.application_requirements.deadline_regular}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">지원 플랫폼</span>
                      <span className="font-medium">{university.application_requirements.application_platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">지원비</span>
                      <span className="font-medium">${university.application_requirements.application_fee}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-2">시험 정책</p>
                    <p className="text-sm text-slate-600">{university.application_requirements.test_policy}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-2">영어 능력</p>
                    <div className="space-y-1 text-sm text-slate-600">
                      {university.application_requirements.english_proficiency.minimum_toefl && (
                        <p>TOEFL: {university.application_requirements.english_proficiency.minimum_toefl}+</p>
                      )}
                      {university.application_requirements.english_proficiency.minimum_ielts && (
                        <p>IELTS: {university.application_requirements.english_proficiency.minimum_ielts}+</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost & Aid */}
              <Card>
                <CardHeader>
                  <CardTitle>비용 및 재정 지원</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">등록금</span>
                    <span className="font-medium">${university.cost_and_aid.tuition.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">기숙사 + 식비</span>
                    <span className="font-medium">${university.cost_and_aid.room_and_board.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-500">총 비용</span>
                    <span className="font-bold text-slate-900">${university.cost_and_aid.total_cost_of_attendance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">평균 지원금</span>
                    <span className="font-medium text-green-600">${university.cost_and_aid.average_aid_package.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">국제학생 재정지원</span>
                    <Badge variant={university.cost_and_aid.financial_aid_for_international ? "success" : "error"}>
                      {university.cost_and_aid.financial_aid_for_international ? "가능" : "불가"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Campus Life */}
              <Card>
                <CardHeader>
                  <CardTitle>캠퍼스 생활</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">기숙사 보장</span>
                    <span className="font-medium">{university.campus_life.housing_guarantee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">안전도</span>
                    <span className="font-medium">{university.campus_life.safety_rating}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">주변 명소</span>
                    <p className="font-medium mt-1">{university.campus_life.nearby_attractions}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Career Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle>졸업 후 진로</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">6개월 내 취업률</span>
                    <span className="font-medium">{university.career_outcomes.employment_rate_6_months}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">평균 초봉</span>
                    <span className="font-medium">${university.career_outcomes.average_starting_salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">대학원 진학률</span>
                    <span className="font-medium">{university.career_outcomes.graduate_school_rate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">주요 취업처</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {university.career_outcomes.top_employers.slice(0, 5).map((employer, i) => (
                        <Badge key={i} variant="default">{employer}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            마지막 업데이트: {university.last_updated}
          </p>
        </main>
      </div>
    </div>
  );
}
