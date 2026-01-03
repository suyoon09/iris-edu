import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudents, getStudentsByCounselorId, createStudent } from "@/lib/db";
import { studentCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const counselorId = searchParams.get("counselor_id");
    const myStudents = searchParams.get("my_students") === "true";

    let students;

    if (myStudents && session.user.role === "counselor") {
      students = await getStudentsByCounselorId(session.user.id);
    } else if (counselorId) {
      students = await getStudentsByCounselorId(counselorId);
    } else {
      students = await getStudents();
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = studentCreateSchema.parse(body);

    const student = await createStudent(validatedData);

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
