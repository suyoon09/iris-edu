"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { StudentCreate } from "@/types/student";

interface StudentFormProps {
  initialData?: Partial<StudentCreate>;
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

export function StudentForm({ initialData, isEdit, studentId }: StudentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const graduationYearOptions = Array.from({ length: 6 }, (_, i) => ({
    value: String(currentYear + i),
    label: `${currentYear + i}년`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name_korean: formData.get("name_korean") as string,
      name_english: formData.get("name_english") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      grade: parseInt(formData.get("grade") as string) as 9 | 10 | 11 | 12,
      school_type: formData.get("school_type") as "domestic_korean" | "international_in_korea" | "abroad",
      current_school: formData.get("current_school") as string,
      graduation_year: parseInt(formData.get("graduation_year") as string),
      notes: formData.get("notes") as string,
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

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="한글 이름"
              name="name_korean"
              defaultValue={initialData?.name_korean}
              placeholder="김민준"
              required
            />
            <Input
              label="영문 이름"
              name="name_english"
              defaultValue={initialData?.name_english}
              placeholder="Minjun Kim"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="이메일"
              name="email"
              type="email"
              defaultValue={initialData?.email}
              placeholder="student@email.com"
              required
            />
            <Input
              label="전화번호"
              name="phone"
              defaultValue={initialData?.phone}
              placeholder="010-1234-5678"
              required
            />
          </div>

          {/* School Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="학년"
              name="grade"
              options={gradeOptions}
              defaultValue={String(initialData?.grade || "")}
              placeholder="학년 선택"
              required
            />
            <Select
              label="학교 유형"
              name="school_type"
              options={schoolTypeOptions}
              defaultValue={initialData?.school_type}
              placeholder="유형 선택"
              required
            />
            <Select
              label="졸업 예정년도"
              name="graduation_year"
              options={graduationYearOptions}
              defaultValue={String(initialData?.graduation_year || "")}
              placeholder="년도 선택"
              required
            />
          </div>

          <Input
            label="현재 학교"
            name="current_school"
            defaultValue={initialData?.current_school}
            placeholder="대원외국어고등학교"
            required
          />

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              메모
            </label>
            <textarea
              name="notes"
              defaultValue={initialData?.notes}
              rows={4}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="학생에 대한 추가 메모..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
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
