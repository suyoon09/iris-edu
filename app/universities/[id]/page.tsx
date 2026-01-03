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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUniversity();
  }, [universityId]);

  const fetchUniversity = async () => {
    try {
      const response = await fetch(`/api/universities?id=${universityId}`);
      if (response.ok) {
        const data = await response.json();
        setUniversity(data);
      } else {
        setError("대학 정보를 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("Error fetching university:", err);
      setError("대학 정보를 불러오는 중 오류가 발생했습니다.");
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

  if (error || !university) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="p-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">{error || "대학 정보를 찾을 수 없습니다."}</p>
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

  // Safe accessors for optional nested data
  const basicInfo = university.basic_info || {};
  const location = basicInfo.location || {};
  const admissionStats = university.admission_stats || {};
  const profileRanges = admissionStats.profile_ranges || {};
  const koreanSpecific = university.korean_student_specific || {};
  const historicalPatterns = koreanSpecific.historical_admit_patterns || {};
  const academicPrograms = university.academic_programs || {};
  const appRequirements = university.application_requirements || {};
  const englishProf = appRequirements.english_proficiency || {};
  const costAid = university.cost_and_aid || {};
  const campusLife = university.campus_life || {};
  const careerOutcomes = university.career_outcomes || {};

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
                  {basicInfo.name || universityId}
                </h1>
                {basicInfo.name_short && (
                  <Badge variant="info">{basicInfo.name_short}</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-slate-500">
                {(location.city || location.state) && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {location.city}{location.state && `, ${location.state}`}
                  </span>
                )}
                {basicInfo.type && <span>{basicInfo.type}</span>}
                {basicInfo.founded && <span>설립 {basicInfo.founded}년</span>}
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
                        {admissionStats.acceptance_rate ?? "-"}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">SAT 중앙값</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {profileRanges.sat_total?.median ?? "-"}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">GPA 중앙값</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {profileRanges.gpa_unweighted?.median ?? "-"}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">등록률</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {admissionStats.yield_rate ?? "-"}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {admissionStats.total_applicants && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">총 지원자</span>
                        <span className="font-medium">{admissionStats.total_applicants.toLocaleString()}명</span>
                      </div>
                    )}
                    {admissionStats.total_admitted && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">총 합격자</span>
                        <span className="font-medium">{admissionStats.total_admitted.toLocaleString()}명</span>
                      </div>
                    )}
                    {admissionStats.international_applicants && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">국제 학생 지원자</span>
                        <span className="font-medium">{admissionStats.international_applicants.toLocaleString()}명</span>
                      </div>
                    )}
                    {admissionStats.international_admitted && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">국제 학생 합격자</span>
                        <span className="font-medium">{admissionStats.international_admitted.toLocaleString()}명</span>
                      </div>
                    )}
                    {admissionStats.early_action_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">EA 합격률</span>
                        <span className="font-medium">{admissionStats.early_action_rate}%</span>
                      </div>
                    )}
                    {admissionStats.early_decision_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">ED 합격률</span>
                        <span className="font-medium">{admissionStats.early_decision_rate}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Korean Student Specific */}
              {(koreanSpecific.korean_specific_advice?.length > 0 ||
                koreanSpecific.common_korean_applicant_mistakes?.length > 0 ||
                koreanSpecific.korean_student_organizations?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-700">한국 학생 맞춤 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Advice */}
                    {koreanSpecific.korean_specific_advice?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">지원 조언</h4>
                        <ul className="space-y-2">
                          {koreanSpecific.korean_specific_advice.map((advice: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="text-green-500 mt-0.5">+</span>
                              {advice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {koreanSpecific.common_korean_applicant_mistakes?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">주의해야 할 점</h4>
                        <ul className="space-y-2">
                          {koreanSpecific.common_korean_applicant_mistakes.map((mistake: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="text-red-500 mt-0.5">!</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Commonly Admitted Schools */}
                    {historicalPatterns.korean_high_schools_commonly_admitted?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">합격자 배출 고등학교</h4>
                        <div className="flex flex-wrap gap-2">
                          {historicalPatterns.korean_high_schools_commonly_admitted.map((school: string, i: number) => (
                            <Badge key={i} variant="default">{school}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student Life */}
                    {(koreanSpecific.korean_food_access || koreanSpecific.korean_church_proximity) && (
                      <div className="grid grid-cols-2 gap-4">
                        {koreanSpecific.korean_food_access && (
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">한국 음식 접근성</h4>
                            <p className="text-sm text-slate-600">{koreanSpecific.korean_food_access}</p>
                          </div>
                        )}
                        {koreanSpecific.korean_church_proximity && (
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">한인 교회</h4>
                            <p className="text-sm text-slate-600">{koreanSpecific.korean_church_proximity}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Korean Organizations */}
                    {koreanSpecific.korean_student_organizations?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">한인 학생 단체</h4>
                        <div className="flex flex-wrap gap-2">
                          {koreanSpecific.korean_student_organizations.map((org: string, i: number) => (
                            <Badge key={i} variant="info">{org}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Academic Programs */}
              {(academicPrograms.notable_majors?.length > 0 || academicPrograms.unique_programs?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>학업 프로그램</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {academicPrograms.notable_majors?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">인기 전공</h4>
                        <div className="flex flex-wrap gap-2">
                          {academicPrograms.notable_majors.map((major: string, i: number) => (
                            <Badge key={i} variant="default">{major}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {academicPrograms.unique_programs?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">특별 프로그램</h4>
                        <ul className="space-y-1">
                          {academicPrograms.unique_programs.map((program: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600">• {program}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {academicPrograms.curriculum_structure && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">커리큘럼 구조</h4>
                        <p className="text-sm text-slate-600">{academicPrograms.curriculum_structure}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Application Requirements */}
              {(appRequirements.deadline_regular || appRequirements.application_platform) && (
                <Card>
                  <CardHeader>
                    <CardTitle>지원 요건</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {appRequirements.deadline_early && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">조기 마감</span>
                          <span className="font-medium">{appRequirements.deadline_early}</span>
                        </div>
                      )}
                      {appRequirements.deadline_regular && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">정시 마감</span>
                          <span className="font-medium">{appRequirements.deadline_regular}</span>
                        </div>
                      )}
                      {appRequirements.application_platform && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">지원 플랫폼</span>
                          <span className="font-medium">{appRequirements.application_platform}</span>
                        </div>
                      )}
                      {appRequirements.application_fee && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">지원비</span>
                          <span className="font-medium">${appRequirements.application_fee}</span>
                        </div>
                      )}
                    </div>

                    {appRequirements.test_policy && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-700 mb-2">시험 정책</p>
                        <p className="text-sm text-slate-600">{appRequirements.test_policy}</p>
                      </div>
                    )}

                    {(englishProf.minimum_toefl || englishProf.minimum_ielts) && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-700 mb-2">영어 능력</p>
                        <div className="space-y-1 text-sm text-slate-600">
                          {englishProf.minimum_toefl && (
                            <p>TOEFL: {englishProf.minimum_toefl}+</p>
                          )}
                          {englishProf.minimum_ielts && (
                            <p>IELTS: {englishProf.minimum_ielts}+</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cost & Aid */}
              {(costAid.tuition || costAid.total_cost_of_attendance) && (
                <Card>
                  <CardHeader>
                    <CardTitle>비용 및 재정 지원</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {costAid.tuition && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">등록금</span>
                        <span className="font-medium">${costAid.tuition.toLocaleString()}</span>
                      </div>
                    )}
                    {costAid.room_and_board && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">기숙사 + 식비</span>
                        <span className="font-medium">${costAid.room_and_board.toLocaleString()}</span>
                      </div>
                    )}
                    {costAid.total_cost_of_attendance && (
                      <div className="flex justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500">총 비용</span>
                        <span className="font-bold text-slate-900">${costAid.total_cost_of_attendance.toLocaleString()}</span>
                      </div>
                    )}
                    {costAid.average_aid_package && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">평균 지원금</span>
                        <span className="font-medium text-green-600">${costAid.average_aid_package.toLocaleString()}</span>
                      </div>
                    )}
                    {costAid.financial_aid_for_international !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">국제학생 재정지원</span>
                        <Badge variant={costAid.financial_aid_for_international ? "success" : "error"}>
                          {costAid.financial_aid_for_international ? "가능" : "불가"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Campus Life */}
              {(campusLife.housing_guarantee || campusLife.safety_rating) && (
                <Card>
                  <CardHeader>
                    <CardTitle>캠퍼스 생활</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {campusLife.housing_guarantee && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">기숙사 보장</span>
                        <span className="font-medium">{campusLife.housing_guarantee}</span>
                      </div>
                    )}
                    {campusLife.safety_rating && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">안전도</span>
                        <span className="font-medium">{campusLife.safety_rating}</span>
                      </div>
                    )}
                    {campusLife.nearby_attractions && (
                      <div>
                        <span className="text-slate-500">주변 명소</span>
                        <p className="font-medium mt-1">{campusLife.nearby_attractions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Career Outcomes */}
              {(careerOutcomes.employment_rate_6_months || careerOutcomes.average_starting_salary) && (
                <Card>
                  <CardHeader>
                    <CardTitle>졸업 후 진로</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {careerOutcomes.employment_rate_6_months && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">6개월 내 취업률</span>
                        <span className="font-medium">{careerOutcomes.employment_rate_6_months}%</span>
                      </div>
                    )}
                    {careerOutcomes.average_starting_salary && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">평균 초봉</span>
                        <span className="font-medium">${careerOutcomes.average_starting_salary.toLocaleString()}</span>
                      </div>
                    )}
                    {careerOutcomes.graduate_school_rate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">대학원 진학률</span>
                        <span className="font-medium">{careerOutcomes.graduate_school_rate}%</span>
                      </div>
                    )}
                    {careerOutcomes.top_employers?.length > 0 && (
                      <div>
                        <span className="text-slate-500">주요 취업처</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {careerOutcomes.top_employers.slice(0, 5).map((employer: string, i: number) => (
                            <Badge key={i} variant="default">{employer}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {university.last_updated && (
            <p className="text-xs text-slate-400 text-center mt-6">
              마지막 업데이트: {university.last_updated}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
