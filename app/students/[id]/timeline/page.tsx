"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Timeline } from "@/components/ui/Timeline";
import type { TimelineEvent } from "@/types/timeline";
import type { Student } from "@/types/student";

const eventTypeOptions = [
  { value: "milestone", label: "마일스톤" },
  { value: "meeting", label: "상담 미팅" },
  { value: "task_assigned", label: "태스크 배정" },
  { value: "task_completed", label: "태스크 완료" },
  { value: "document_submitted", label: "서류 제출" },
  { value: "test_taken", label: "시험 응시" },
  { value: "application_submitted", label: "원서 제출" },
  { value: "decision_received", label: "결과 수신" },
  { value: "note", label: "메모" },
];

export default function TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [studentRes, eventsRes] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch(`/api/students/${studentId}/timeline`),
      ]);

      if (studentRes.ok) {
        setStudent(await studentRes.json());
      }
      if (eventsRes.ok) {
        setEvents(await eventsRes.json());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      event_type: formData.get("event_type"),
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      due_date: formData.get("due_date") || undefined,
      status: "pending",
    };

    try {
      const response = await fetch(`/api/students/${studentId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSaving(false);
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
                {student?.name_korean} - 타임라인
              </h1>
              <p className="text-slate-500 mt-1">학생의 진행 상황을 추적합니다.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                돌아가기
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                이벤트 추가
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>전체 타임라인</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={events} />
            </CardContent>
          </Card>

          {/* Add Event Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="새 이벤트 추가"
            size="md"
          >
            <form onSubmit={handleAddEvent} className="space-y-4">
              <Select
                label="이벤트 유형"
                name="event_type"
                options={eventTypeOptions}
                required
              />
              <Input
                label="제목"
                name="title"
                placeholder="이벤트 제목"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  설명
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이벤트에 대한 상세 설명..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="날짜"
                  name="date"
                  type="date"
                  required
                />
                <Input
                  label="마감일 (선택)"
                  name="due_date"
                  type="date"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  추가
                </Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
