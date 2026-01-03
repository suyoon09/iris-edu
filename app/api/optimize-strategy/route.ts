import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentById, getUniversityById, getUniversities } from "@/lib/db";
import { optimizeStrategy } from "@/lib/claude";
import { buildStrategyPrompt } from "@/prompts/strategy";
import type { University } from "@/types/university";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return NextResponse.json(
        { error: "student_id is required" },
        { status: 400 }
      );
    }

    // Get student
    const student = await getStudentById(student_id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get all universities for comprehensive strategy
    const universityList = await getUniversities();
    const universities: University[] = [];

    // Get detailed data for target universities and some additional ones
    const targetIds = student.target_universities.map((t) => t.university_id);
    const topUniversityIds = universityList.slice(0, 20).map((u) => u.university_id);
    const allIds = Array.from(new Set([...targetIds, ...topUniversityIds]));

    for (const id of allIds) {
      const uni = await getUniversityById(id);
      if (uni) {
        universities.push(uni);
      }
    }

    // Build prompt and generate strategy
    const prompt = buildStrategyPrompt(student, universities);
    const strategyText = await optimizeStrategy(prompt);

    // Parse JSON from response
    const jsonMatch = strategyText.match(/```json\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse strategy response" },
        { status: 500 }
      );
    }

    const strategy = JSON.parse(jsonMatch[1]);

    return NextResponse.json({
      ...strategy,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error optimizing strategy:", error);
    return NextResponse.json(
      { error: "Failed to optimize strategy" },
      { status: 500 }
    );
  }
}
