"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Student, Course, Activity, Award, APScore, TargetUniversity } from "@/types/student";

interface University {
  university_id: string;
  basic_info: {
    name: string;
    name_short?: string;
  };
}

interface StudentFormProps {
  initialData?: Partial<Student>;
  isEdit?: boolean;
  studentId?: string;
}

const gradeOptions = [
  { value: "9", label: "9학년 (중3/고1)" },
  { value: "10", label: "10학년 (고1/고2)" },
  { value: "11", label: "11학년 (고2/고3)" },
  { value: "12", label: "12학년 (고3/졸업예정)" },
];

const schoolTypeOptions = [
  { value: "domestic_korean", label: "국내 일반고/특목고" },
  { value: "international_in_korea", label: "국내 국제학교" },
  { value: "abroad", label: "해외 학교" },
];

const applicationStatusOptions = [
  { value: "planning", label: "계획 중" },
  { value: "preparing", label: "준비 중" },
  { value: "applying", label: "지원 중" },
  { value: "complete", label: "완료" },
];

const courseLevelOptions = [
  { value: "regular", label: "Regular" },
  { value: "honors", label: "Honors" },
  { value: "AP", label: "AP" },
  { value: "IB", label: "IB" },
  { value: "dual_enrollment", label: "Dual Enrollment" },
];

const subjectAreaOptions = [
  { value: "math", label: "수학 (Math)" },
  { value: "science", label: "과학 (Science)" },
  { value: "english", label: "영어 (English)" },
  { value: "social_studies", label: "사회 (Social Studies)" },
  { value: "foreign_language", label: "외국어 (Foreign Language)" },
  { value: "arts", label: "예술 (Arts)" },
  { value: "other", label: "기타 (Other)" },
];

const activityCategoryOptions = [
  { value: "academic", label: "학업 (Academic)" },
  { value: "arts", label: "예술 (Arts)" },
  { value: "athletics", label: "체육 (Athletics)" },
  { value: "community_service", label: "봉사활동 (Community Service)" },
  { value: "leadership", label: "리더십 (Leadership)" },
  { value: "work", label: "업무경험 (Work)" },
  { value: "other", label: "기타 (Other)" },
];

const awardLevelOptions = [
  { value: "school", label: "교내 (School)" },
  { value: "regional", label: "지역 (Regional)" },
  { value: "national", label: "전국 (National)" },
  { value: "international", label: "국제 (International)" },
];

const priorityOptions = [
  { value: "reach", label: "Reach (도전)" },
  { value: "target", label: "Target (적정)" },
  { value: "safety", label: "Safety (안정)" },
];

const applicationRoundOptions = [
  { value: "ED", label: "ED (Early Decision)" },
  { value: "ED2", label: "ED2 (Early Decision 2)" },
  { value: "EA", label: "EA (Early Action)" },
  { value: "REA", label: "REA (Restrictive Early Action)" },
  { value: "RD", label: "RD (Regular Decision)" },
];

type TabType = "basic" | "academic" | "activities" | "universities";

export function StudentForm({ initialData, isEdit, studentId }: StudentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [universities, setUniversities] = useState<University[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name_korean: initialData?.name_korean || "",
    name_english: initialData?.name_english || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    grade: initialData?.grade || 11,
    school_type: initialData?.school_type || "domestic_korean",
    current_school: initialData?.current_school || "",
    graduation_year: initialData?.graduation_year || new Date().getFullYear() + 1,
    application_status: initialData?.application_status || "planning",
    notes: initialData?.notes || "",

    // Academic
    gpa_unweighted: initialData?.academic?.gpa?.unweighted || "",
    gpa_weighted: initialData?.academic?.gpa?.weighted || "",
    gpa_scale: initialData?.academic?.gpa?.scale || "4.0",
    class_rank: initialData?.academic?.class_rank?.rank || "",
    class_total: initialData?.academic?.class_rank?.total || "",

    // SAT
    sat_total: initialData?.academic?.standardized_tests?.sat?.total || "",
    sat_reading_writing: initialData?.academic?.standardized_tests?.sat?.reading_writing || "",
    sat_math: initialData?.academic?.standardized_tests?.sat?.math || "",
    sat_date: initialData?.academic?.standardized_tests?.sat?.date || "",

    // ACT
    act_composite: initialData?.academic?.standardized_tests?.act?.composite || "",
    act_english: initialData?.academic?.standardized_tests?.act?.english || "",
    act_math: initialData?.academic?.standardized_tests?.act?.math || "",
    act_reading: initialData?.academic?.standardized_tests?.act?.reading || "",
    act_science: initialData?.academic?.standardized_tests?.act?.science || "",
    act_date: initialData?.academic?.standardized_tests?.act?.date || "",

    // TOEFL
    toefl_total: initialData?.academic?.standardized_tests?.toefl?.total || "",
    toefl_date: initialData?.academic?.standardized_tests?.toefl?.date || "",
  });

  // Dynamic arrays
  const [courses, setCourses] = useState<Course[]>(initialData?.academic?.courses || []);
  const [apScores, setApScores] = useState<APScore[]>(initialData?.academic?.standardized_tests?.ap_scores || []);
  const [activities, setActivities] = useState<Activity[]>(initialData?.extracurriculars || []);
  const [awards, setAwards] = useState<Award[]>(initialData?.awards || []);
  const [targetUniversities, setTargetUniversities] = useState<TargetUniversity[]>(initialData?.target_universities || []);

  const currentYear = new Date().getFullYear();
  const graduationYearOptions = Array.from({ length: 6 }, (_, i) => ({
    value: String(currentYear + i),
    label: `${currentYear + i}년`,
  }));

  // Load universities
  useEffect(() => {
    fetch("/api/universities")
      .then((res) => res.json())
      .then((data) => setUniversities(data))
      .catch(() => setUniversities([]));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Course handlers
  const addCourse = () => {
    setCourses([...courses, { name: "", level: "regular", grade: "", year: "", subject_area: "other" }]);
  };

  const updateCourse = (index: number, field: keyof Course, value: string) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  // AP Score handlers
  const addAPScore = () => {
    setApScores([...apScores, { subject: "", score: 0, year: "" }]);
  };

  const updateAPScore = (index: number, field: keyof APScore, value: string | number) => {
    const updated = [...apScores];
    updated[index] = { ...updated[index], [field]: value };
    setApScores(updated);
  };

  const removeAPScore = (index: number) => {
    setApScores(apScores.filter((_, i) => i !== index));
  };

  // Activity handlers
  const addActivity = () => {
    setActivities([
      ...activities,
      {
        name: "",
        category: "other",
        role: "",
        description: "",
        hours_per_week: 0,
        weeks_per_year: 0,
        years: [],
        achievements: [],
      },
    ]);
  };

  const updateActivity = (index: number, field: keyof Activity, value: unknown) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  // Award handlers
  const addAward = () => {
    setAwards([...awards, { name: "", level: "school", year: "", description: "" }]);
  };

  const updateAward = (index: number, field: keyof Award, value: string) => {
    const updated = [...awards];
    updated[index] = { ...updated[index], [field]: value };
    setAwards(updated);
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  // Target University handlers
  const addTargetUniversity = () => {
    setTargetUniversities([
      ...targetUniversities,
      { university_id: "", priority: "target", intended_major: "", application_round: "RD" },
    ]);
  };

  const updateTargetUniversity = (index: number, field: keyof TargetUniversity, value: string) => {
    const updated = [...targetUniversities];
    updated[index] = { ...updated[index], [field]: value };
    setTargetUniversities(updated);
  };

  const removeTargetUniversity = (index: number) => {
    setTargetUniversities(targetUniversities.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const data: Partial<Student> = {
      name_korean: formData.name_korean,
      name_english: formData.name_english,
      email: formData.email,
      phone: formData.phone,
      grade: Number(formData.grade) as 9 | 10 | 11 | 12,
      school_type: formData.school_type as "domestic_korean" | "international_in_korea" | "abroad",
      current_school: formData.current_school,
      graduation_year: Number(formData.graduation_year),
      application_status: formData.application_status as "planning" | "preparing" | "applying" | "complete",
      notes: formData.notes,
      academic: {
        gpa: {
          unweighted: formData.gpa_unweighted ? Number(formData.gpa_unweighted) : 0,
          weighted: formData.gpa_weighted ? Number(formData.gpa_weighted) : null,
          scale: formData.gpa_scale,
        },
        class_rank: {
          rank: formData.class_rank ? Number(formData.class_rank) : null,
          total: formData.class_total ? Number(formData.class_total) : null,
        },
        courses: courses.filter((c) => c.name.trim() !== ""),
        standardized_tests: {
          sat: {
            total: formData.sat_total ? Number(formData.sat_total) : null,
            reading_writing: formData.sat_reading_writing ? Number(formData.sat_reading_writing) : null,
            math: formData.sat_math ? Number(formData.sat_math) : null,
            date: formData.sat_date || null,
          },
          act: {
            composite: formData.act_composite ? Number(formData.act_composite) : null,
            english: formData.act_english ? Number(formData.act_english) : null,
            math: formData.act_math ? Number(formData.act_math) : null,
            reading: formData.act_reading ? Number(formData.act_reading) : null,
            science: formData.act_science ? Number(formData.act_science) : null,
            date: formData.act_date || null,
          },
          ap_scores: apScores.filter((ap) => ap.subject.trim() !== ""),
          toefl: formData.toefl_total
            ? { total: Number(formData.toefl_total), date: formData.toefl_date || null }
            : null,
        },
      },
      extracurriculars: activities.filter((a) => a.name.trim() !== ""),
      awards: awards.filter((a) => a.name.trim() !== ""),
      target_universities: targetUniversities.filter((t) => t.university_id !== ""),
    };

    try {
      const url = isEdit ? `/api/students/${studentId}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save student");
      }

      const student = await response.json();
      router.push(`/students/${student.id}`);
      router.refresh();
    } catch {
      setError("학생 정보 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "basic" as const, label: "기본 정보" },
    { id: "academic" as const, label: "학업 정보" },
    { id: "activities" as const, label: "활동 & 수상" },
    { id: "universities" as const, label: "목표 대학" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "학생 정보 수정" : "새 학생 등록"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="한글 이름"
                  name="name_korean"
                  value={formData.name_korean}
                  onChange={handleInputChange}
                  placeholder="김민준"
                  required
                />
                <Input
                  label="영문 이름"
                  name="name_english"
                  value={formData.name_english}
                  onChange={handleInputChange}
                  placeholder="Minjun Kim"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@email.com"
                  required
                />
                <Input
                  label="전화번호"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="학년"
                  name="grade"
                  options={gradeOptions}
                  value={String(formData.grade)}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  label="학교 유형"
                  name="school_type"
                  options={schoolTypeOptions}
                  value={formData.school_type}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  label="졸업 예정년도"
                  name="graduation_year"
                  options={graduationYearOptions}
                  value={String(formData.graduation_year)}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Input
                label="현재 학교"
                name="current_school"
                value={formData.current_school}
                onChange={handleInputChange}
                placeholder="대원외국어고등학교"
                required
              />

              <Select
                label="지원 상태"
                name="application_status"
                options={applicationStatusOptions}
                value={formData.application_status}
                onChange={handleInputChange}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">메모</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="학생에 대한 추가 메모..."
                />
              </div>
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === "academic" && (
            <div className="space-y-6">
              {/* GPA */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">GPA</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Unweighted GPA"
                    name="gpa_unweighted"
                    type="number"
                    step="0.01"
                    value={formData.gpa_unweighted}
                    onChange={handleInputChange}
                    placeholder="3.95"
                  />
                  <Input
                    label="Weighted GPA"
                    name="gpa_weighted"
                    type="number"
                    step="0.01"
                    value={formData.gpa_weighted}
                    onChange={handleInputChange}
                    placeholder="4.50"
                  />
                  <Input
                    label="GPA Scale"
                    name="gpa_scale"
                    value={formData.gpa_scale}
                    onChange={handleInputChange}
                    placeholder="4.0"
                  />
                </div>
              </div>

              {/* Class Rank */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">학급 석차</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="석차"
                    name="class_rank"
                    type="number"
                    value={formData.class_rank}
                    onChange={handleInputChange}
                    placeholder="5"
                  />
                  <Input
                    label="전체 학생 수"
                    name="class_total"
                    type="number"
                    value={formData.class_total}
                    onChange={handleInputChange}
                    placeholder="300"
                  />
                </div>
              </div>

              {/* SAT */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">SAT</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Total"
                    name="sat_total"
                    type="number"
                    value={formData.sat_total}
                    onChange={handleInputChange}
                    placeholder="1500"
                  />
                  <Input
                    label="Reading & Writing"
                    name="sat_reading_writing"
                    type="number"
                    value={formData.sat_reading_writing}
                    onChange={handleInputChange}
                    placeholder="750"
                  />
                  <Input
                    label="Math"
                    name="sat_math"
                    type="number"
                    value={formData.sat_math}
                    onChange={handleInputChange}
                    placeholder="750"
                  />
                  <Input
                    label="응시일"
                    name="sat_date"
                    type="date"
                    value={formData.sat_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* ACT */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">ACT</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Input
                    label="Composite"
                    name="act_composite"
                    type="number"
                    value={formData.act_composite}
                    onChange={handleInputChange}
                    placeholder="34"
                  />
                  <Input
                    label="English"
                    name="act_english"
                    type="number"
                    value={formData.act_english}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Math"
                    name="act_math"
                    type="number"
                    value={formData.act_math}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Reading"
                    name="act_reading"
                    type="number"
                    value={formData.act_reading}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Science"
                    name="act_science"
                    type="number"
                    value={formData.act_science}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="응시일"
                    name="act_date"
                    type="date"
                    value={formData.act_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* TOEFL */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">TOEFL</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total Score"
                    name="toefl_total"
                    type="number"
                    value={formData.toefl_total}
                    onChange={handleInputChange}
                    placeholder="110"
                  />
                  <Input
                    label="응시일"
                    name="toefl_date"
                    type="date"
                    value={formData.toefl_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* AP Scores */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">AP Scores</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addAPScore}>
                    + 추가
                  </Button>
                </div>
                <div className="space-y-2">
                  {apScores.map((ap, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="과목명 (e.g., Calculus BC)"
                        value={ap.subject}
                        onChange={(e) => updateAPScore(index, "subject", e.target.value)}
                        className="flex-1"
                      />
                      <Select
                        options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
                        value={String(ap.score)}
                        onChange={(e) => updateAPScore(index, "score", Number(e.target.value))}
                        className="w-24"
                      />
                      <Input
                        placeholder="연도"
                        value={ap.year}
                        onChange={(e) => updateAPScore(index, "year", e.target.value)}
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAPScore(index)}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                  {apScores.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-2">등록된 AP 점수가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* Courses */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">수강 과목</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addCourse}>
                    + 추가
                  </Button>
                </div>
                <div className="space-y-3">
                  {courses.map((course, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Input
                          placeholder="과목명"
                          value={course.name}
                          onChange={(e) => updateCourse(index, "name", e.target.value)}
                        />
                        <Select
                          options={courseLevelOptions}
                          value={course.level}
                          onChange={(e) => updateCourse(index, "level", e.target.value)}
                        />
                        <Input
                          placeholder="학점"
                          value={course.grade}
                          onChange={(e) => updateCourse(index, "grade", e.target.value)}
                        />
                        <Select
                          options={subjectAreaOptions}
                          value={course.subject_area}
                          onChange={(e) => updateCourse(index, "subject_area", e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCourse(index)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-2">등록된 과목이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activities & Awards Tab */}
          {activeTab === "activities" && (
            <div className="space-y-6">
              {/* Activities */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">비교과 활동</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                    + 추가
                  </Button>
                </div>
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="활동명"
                          placeholder="학생회"
                          value={activity.name}
                          onChange={(e) => updateActivity(index, "name", e.target.value)}
                        />
                        <Select
                          label="카테고리"
                          options={activityCategoryOptions}
                          value={activity.category}
                          onChange={(e) => updateActivity(index, "category", e.target.value)}
                        />
                      </div>
                      <Input
                        label="역할"
                        placeholder="회장"
                        value={activity.role}
                        onChange={(e) => updateActivity(index, "role", e.target.value)}
                      />
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700">설명</label>
                        <textarea
                          placeholder="활동 내용을 설명해주세요..."
                          value={activity.description}
                          onChange={(e) => updateActivity(index, "description", e.target.value)}
                          rows={2}
                          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Input
                          label="주당 시간"
                          type="number"
                          value={activity.hours_per_week}
                          onChange={(e) => updateActivity(index, "hours_per_week", Number(e.target.value))}
                        />
                        <Input
                          label="년간 주수"
                          type="number"
                          value={activity.weeks_per_year}
                          onChange={(e) => updateActivity(index, "weeks_per_year", Number(e.target.value))}
                        />
                        <Input
                          label="활동 연도 (쉼표 구분)"
                          placeholder="2023, 2024"
                          value={activity.years.join(", ")}
                          onChange={(e) =>
                            updateActivity(
                              index,
                              "years",
                              e.target.value.split(",").map((y) => y.trim())
                            )
                          }
                        />
                        <Input
                          label="성과 (쉼표 구분)"
                          placeholder="전국대회 입상"
                          value={activity.achievements.join(", ")}
                          onChange={(e) =>
                            updateActivity(
                              index,
                              "achievements",
                              e.target.value.split(",").map((a) => a.trim())
                            )
                          }
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeActivity(index)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">등록된 활동이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* Awards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">수상 내역</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addAward}>
                    + 추가
                  </Button>
                </div>
                <div className="space-y-3">
                  {awards.map((award, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          placeholder="상 이름"
                          value={award.name}
                          onChange={(e) => updateAward(index, "name", e.target.value)}
                        />
                        <Select
                          options={awardLevelOptions}
                          value={award.level}
                          onChange={(e) => updateAward(index, "level", e.target.value)}
                        />
                        <Input
                          placeholder="수상 연도"
                          value={award.year}
                          onChange={(e) => updateAward(index, "year", e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="설명"
                        value={award.description}
                        onChange={(e) => updateAward(index, "description", e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAward(index)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))}
                  {awards.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">등록된 수상 내역이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Target Universities Tab */}
          {activeTab === "universities" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">목표 대학</h3>
                <Button type="button" variant="outline" size="sm" onClick={addTargetUniversity}>
                  + 추가
                </Button>
              </div>
              <div className="space-y-3">
                {targetUniversities.map((target, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select
                        label="대학"
                        options={universities.map((u) => ({
                          value: u.university_id,
                          label: u.basic_info?.name_short || u.basic_info?.name || u.university_id,
                        }))}
                        value={target.university_id}
                        onChange={(e) => updateTargetUniversity(index, "university_id", e.target.value)}
                        placeholder="대학 선택"
                      />
                      <Select
                        label="우선순위"
                        options={priorityOptions}
                        value={target.priority}
                        onChange={(e) => updateTargetUniversity(index, "priority", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="희망 전공"
                        placeholder="Computer Science"
                        value={target.intended_major}
                        onChange={(e) => updateTargetUniversity(index, "intended_major", e.target.value)}
                      />
                      <Select
                        label="지원 라운드"
                        options={applicationRoundOptions}
                        value={target.application_round}
                        onChange={(e) => updateTargetUniversity(index, "application_round", e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTargetUniversity(index)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
                {targetUniversities.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    목표 대학이 아직 설정되지 않았습니다.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? "수정 완료" : "학생 등록"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
