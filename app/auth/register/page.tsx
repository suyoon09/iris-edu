"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "counselor",
    specialization: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const specializationOptions = [
    "미국 대학 입시",
    "영국 대학 입시",
    "에세이 지도",
    "SAT/ACT 준비",
    "과외 활동 전략",
    "STEM 전공",
    "인문학 전공",
    "비즈니스 전공",
    "예술 전공",
    "장학금 컨설팅",
  ];

  // Redirect if not logged in or not admin
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <svg
              className="w-16 h-16 mx-auto text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              접근 권한이 없습니다
            </h2>
            <p className="text-slate-500 mb-4">
              관리자만 새 상담사를 등록할 수 있습니다.
            </p>
            <Link href="/dashboard">
              <Button>대시보드로 이동</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSpecializationToggle = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter((s) => s !== spec)
        : [...prev.specialization, spec],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (formData.specialization.length === 0) {
      setError("전문 분야를 최소 1개 이상 선택해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/counselors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          name_en: formData.name_en,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          specialization: formData.specialization,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "등록에 실패했습니다.");
      }

      setSuccess(true);
      setFormData({
        name: "",
        name_en: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "counselor",
        specialization: [],
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/counselors");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/counselors"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            상담사 목록으로 돌아가기
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 상담사 등록</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                상담사가 성공적으로 등록되었습니다. 상담사 목록으로 이동합니다...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="이름 (한글)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="홍길동"
                  required
                />
                <Input
                  label="이름 (영문)"
                  value={formData.name_en}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name_en: e.target.value }))
                  }
                  placeholder="Gil-dong Hong"
                  required
                />
              </div>

              <Input
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="counselor@iris-edu.com"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="비밀번호"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="6자 이상"
                  required
                />
                <Input
                  label="비밀번호 확인"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="비밀번호 다시 입력"
                  required
                />
              </div>

              <Select
                label="역할"
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                options={[
                  { value: "counselor", label: "상담사" },
                  { value: "admin", label: "관리자" },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  전문 분야 (다중 선택)
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleSpecializationToggle(spec)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.specialization.includes(spec)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
                {formData.specialization.length > 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    선택됨: {formData.specialization.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  상담사 등록
                </Button>
                <Link href="/counselors" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    취소
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
