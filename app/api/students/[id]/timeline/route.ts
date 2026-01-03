import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTimelineEventsByStudentId,
  createTimelineEvent,
  getStudentById,
} from "@/lib/db";
import { timelineEventCreateSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: studentId } = await params;

    // Verify student exists
    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const events = await getTimelineEventsByStudentId(studentId);

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline events" },
      { status: 500 }
    );
  }
}

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

    // Verify student exists
    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = timelineEventCreateSchema.parse({
      ...body,
      student_id: studentId,
    });

    const event = await createTimelineEvent({
      ...validatedData,
      counselor_id: session.user.id,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating timeline event:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create timeline event" },
      { status: 500 }
    );
  }
}
