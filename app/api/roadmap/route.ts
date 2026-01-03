import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentById } from "@/lib/db";
import { generateRoadmap } from "@/lib/claude";
import { buildRoadmapPrompt } from "@/prompts/roadmap";

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

    // Build prompt and generate roadmap
    const prompt = buildRoadmapPrompt(student);
    const roadmapText = await generateRoadmap(prompt);

    // Parse JSON from response
    const jsonMatch = roadmapText.match(/```json\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse roadmap response" },
        { status: 500 }
      );
    }

    const roadmap = JSON.parse(jsonMatch[1]);

    return NextResponse.json({
      ...roadmap,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
