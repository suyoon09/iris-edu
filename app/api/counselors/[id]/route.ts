import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getCounselorById,
  updateCounselor,
  deleteCounselor,
  getStudentsByCounselorId,
} from "@/lib/db";
import type { CounselorPublic } from "@/types/counselor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const counselor = await getCounselorById(id);

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Get assigned students
    const students = await getStudentsByCounselorId(id);

    // Remove password from response
    const publicCounselor: CounselorPublic & { students: typeof students } = {
      id: counselor.id,
      email: counselor.email,
      name: counselor.name,
      name_en: counselor.name_en,
      role: counselor.role,
      specialization: counselor.specialization,
      assigned_students: counselor.assigned_students,
      created_at: counselor.created_at,
      last_login: counselor.last_login,
      students,
    };

    return NextResponse.json(publicCounselor);
  } catch (error) {
    console.error("Error fetching counselor:", error);
    return NextResponse.json(
      { error: "Failed to fetch counselor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Only admins or the counselor themselves can update
    if (session.user.role !== "admin" && session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const counselor = await updateCounselor(id, body);

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Remove password from response
    const publicCounselor: CounselorPublic = {
      id: counselor.id,
      email: counselor.email,
      name: counselor.name,
      name_en: counselor.name_en,
      role: counselor.role,
      specialization: counselor.specialization,
      assigned_students: counselor.assigned_students,
      created_at: counselor.created_at,
      last_login: counselor.last_login,
    };

    return NextResponse.json(publicCounselor);
  } catch (error) {
    console.error("Error updating counselor:", error);
    return NextResponse.json(
      { error: "Failed to update counselor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete counselors
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete counselors" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = await deleteCounselor(id);

    if (!success) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Counselor deleted successfully" });
  } catch (error) {
    console.error("Error deleting counselor:", error);
    return NextResponse.json(
      { error: "Failed to delete counselor" },
      { status: 500 }
    );
  }
}
