import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  assignCounselorToStudent,
  getCounselorById,
  createTimelineEvent,
} from "@/lib/db";
import { assignCounselorSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: studentId } = await params;
    const body = await request.json();
    const { counselor_id } = assignCounselorSchema.parse(body);

    // Verify counselor exists
    const counselor = await getCounselorById(counselor_id);
    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Assign counselor to student
    const student = await assignCounselorToStudent(studentId, counselor_id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Create timeline event for the assignment
    await createTimelineEvent({
      student_id: studentId,
      counselor_id: counselor_id,
      event_type: "note",
      title: "담당 상담사 배정",
      description: `${counselor.name} 상담사가 담당자로 배정되었습니다.`,
      date: new Date().toISOString(),
      status: "completed",
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error assigning counselor:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to assign counselor" },
      { status: 500 }
    );
  }
}
