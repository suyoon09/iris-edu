import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentById, getUniversityById } from "@/lib/db";
import { generateAnalysis } from "@/lib/claude";
import { buildAnalysisPrompt } from "@/prompts/analysis";
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

    // Get university data for target universities
    const universities: University[] = [];
    for (const target of student.target_universities) {
      const uni = await getUniversityById(target.university_id);
      if (uni) {
        universities.push(uni);
      }
    }

    if (universities.length === 0) {
      return NextResponse.json(
        { error: "No target universities found. Please add target universities first." },
        { status: 400 }
      );
    }

    // Build prompt and generate analysis
    const prompt = buildAnalysisPrompt(student, universities);
    const analysisText = await generateAnalysis(prompt);

    // Parse JSON from response
    const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse analysis response" },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[1]);

    return NextResponse.json({
      student_id,
      generated_at: new Date().toISOString(),
      ...analysis,
    });
  } catch (error) {
    console.error("Error generating analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
