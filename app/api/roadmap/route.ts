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

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI 서비스가 설정되지 않았습니다. 관리자에게 문의하세요." },
        { status: 503 }
      );
    }

    // Get student
    const student = await getStudentById(student_id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Build prompt and generate roadmap
    const prompt = buildRoadmapPrompt(student);

    let roadmapText: string;
    try {
      roadmapText = await generateRoadmap(prompt);
    } catch (apiError) {
      console.error("Claude API error:", apiError);
      return NextResponse.json(
        { error: "AI 서비스 연결에 실패했습니다. API 키를 확인하세요." },
        { status: 503 }
      );
    }

    // Parse JSON from response - try multiple patterns
    let jsonString: string | null = null;

    const jsonMatch = roadmapText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    } else {
      const codeMatch = roadmapText.match(/```\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        jsonString = codeMatch[1];
      } else {
        const directMatch = roadmapText.match(/\{[\s\S]*\}/);
        if (directMatch) {
          jsonString = directMatch[0];
        }
      }
    }

    if (!jsonString) {
      console.error("Failed to extract JSON from roadmap response:", roadmapText.substring(0, 500));
      return NextResponse.json(
        { error: "로드맵 결과를 파싱하는데 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    let roadmap;
    try {
      roadmap = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "로드맵 결과 형식이 올바르지 않습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...roadmap,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return NextResponse.json(
      { error: "로드맵 생성에 실패했습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
