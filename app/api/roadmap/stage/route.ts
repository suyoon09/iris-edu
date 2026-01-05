import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentById } from "@/lib/db";
import { generateRoadmap } from "@/lib/claude";
import {
    buildRoadmapStage1Prompt,
    buildRoadmapStage2Prompt,
    type RoadmapStage1Result,
} from "@/prompts/roadmap";

/**
 * Multi-stage roadmap API endpoint.
 * 
 * Stages:
 * 1. Core planning and priorities
 * 2. Detailed monthly roadmap
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { student_id, stage, context } = body;

        if (!student_id) {
            return NextResponse.json(
                { error: "student_id is required" },
                { status: 400 }
            );
        }

        if (!stage || stage < 1 || stage > 2) {
            return NextResponse.json(
                { error: "stage must be 1 or 2" },
                { status: 400 }
            );
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            console.error("ANTHROPIC_API_KEY is not configured");
            return NextResponse.json(
                {
                    error: "AI 서비스가 설정되지 않았습니다.",
                    debug: {
                        message: "ANTHROPIC_API_KEY not set",
                    }
                },
                { status: 503 }
            );
        }

        const student = await getStudentById(student_id);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        let prompt: string;

        switch (stage) {
            case 1:
                prompt = buildRoadmapStage1Prompt(student);
                break;

            case 2:
                if (!context?.stage1Result) {
                    return NextResponse.json(
                        { error: "stage1Result is required in context for stage 2" },
                        { status: 400 }
                    );
                }
                prompt = buildRoadmapStage2Prompt(student, context.stage1Result as RoadmapStage1Result);
                break;

            default:
                return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
        }

        let roadmapText: string;
        try {
            roadmapText = await generateRoadmap(prompt);
        } catch (apiError) {
            console.error(`Claude API error (roadmap stage ${stage}):`, apiError);
            const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);

            return NextResponse.json(
                {
                    error: "AI 서비스 연결에 실패했습니다.",
                    stage,
                    debug: {
                        message: errorMessage,
                        type: apiError?.constructor?.name,
                        elapsedMs: Date.now() - startTime,
                    }
                },
                { status: 503 }
            );
        }

        let jsonString: string | null = null;
        const jsonMatch = roadmapText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonString = jsonMatch[1];
        } else {
            const directMatch = roadmapText.match(/\{[\s\S]*\}/);
            if (directMatch) {
                jsonString = directMatch[0];
            }
        }

        if (!jsonString) {
            return NextResponse.json(
                {
                    error: "로드맵 결과를 파싱하는데 실패했습니다.",
                    stage,
                    debug: {
                        responsePreview: roadmapText.substring(0, 300),
                    }
                },
                { status: 500 }
            );
        }

        let result;
        try {
            result = JSON.parse(jsonString);
        } catch (parseError) {
            const parseErrorMessage = parseError instanceof Error ? parseError.message : String(parseError);
            return NextResponse.json(
                {
                    error: "로드맵 결과 형식이 올바르지 않습니다.",
                    stage,
                    debug: {
                        message: parseErrorMessage,
                        jsonPreview: jsonString.substring(0, 300),
                    }
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            stage,
            student_id,
            completed_at: new Date().toISOString(),
            elapsed_ms: Date.now() - startTime,
            result,
        });

    } catch (error) {
        console.error("Error in roadmap stage:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            {
                error: "로드맵 생성에 실패했습니다.",
                debug: {
                    message: errorMessage,
                    type: error?.constructor?.name,
                }
            },
            { status: 500 }
        );
    }
}
