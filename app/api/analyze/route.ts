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

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI 분석 서비스가 설정되지 않았습니다. 관리자에게 문의하세요." },
        { status: 503 }
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
        { error: "목표 대학 정보가 없습니다. 먼저 목표 대학을 추가해주세요." },
        { status: 400 }
      );
    }

    // Build prompt and generate analysis
    const prompt = buildAnalysisPrompt(student, universities);

    let analysisText: string;
    try {
      analysisText = await generateAnalysis(prompt);
    } catch (apiError) {
      console.error("Claude API error:", apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      return NextResponse.json(
        {
          error: "AI 서비스 연결에 실패했습니다.",
          debug: {
            message: errorMessage,
            type: apiError?.constructor?.name,
            apiKeySet: !!process.env.ANTHROPIC_API_KEY,
            apiKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) + "...",
          }
        },
        { status: 503 }
      );
    }

    // Parse JSON from response - try multiple patterns
    let jsonString: string | null = null;

    // Try markdown code block
    const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    } else {
      // Try plain code block
      const codeMatch = analysisText.match(/```\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        jsonString = codeMatch[1];
      } else {
        // Try to find JSON object directly
        const directMatch = analysisText.match(/\{[\s\S]*\}/);
        if (directMatch) {
          jsonString = directMatch[0];
        }
      }
    }

    if (!jsonString) {
      console.error("Failed to extract JSON from response:", analysisText.substring(0, 500));
      return NextResponse.json(
        { error: "분석 결과를 파싱하는데 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "JSON string:", jsonString.substring(0, 500));
      return NextResponse.json(
        { error: "분석 결과 형식이 올바르지 않습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      student_id,
      generated_at: new Date().toISOString(),
      ...analysis,
    });
  } catch (error) {
    console.error("Error generating analysis:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: "분석 생성에 실패했습니다.",
        debug: {
          message: errorMessage,
          stack: errorStack,
          type: error?.constructor?.name,
        }
      },
      { status: 500 }
    );
  }
}
