import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { getCounselors, createCounselor } from "@/lib/db";
import { counselorCreateSchema } from "@/lib/validations";
import type { CounselorPublic } from "@/types/counselor";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const counselors = await getCounselors();

    // Remove passwords from response
    const publicCounselors: CounselorPublic[] = counselors.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      name_en: c.name_en,
      role: c.role,
      specialization: c.specialization,
      assigned_students: c.assigned_students,
      created_at: c.created_at,
      last_login: c.last_login,
    }));

    return NextResponse.json(publicCounselors);
  } catch (error) {
    console.error("Error fetching counselors:", error);
    return NextResponse.json(
      { error: "Failed to fetch counselors" },
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

    // Only admins can create counselors
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create counselors" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = counselorCreateSchema.parse(body);

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const counselor = await createCounselor({
      ...validatedData,
      password: hashedPassword,
    });

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

    return NextResponse.json(publicCounselor, { status: 201 });
  } catch (error) {
    console.error("Error creating counselor:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create counselor" },
      { status: 500 }
    );
  }
}
