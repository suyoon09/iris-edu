import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentById, getUniversityById } from "@/lib/db";
import { generateAnalysis } from "@/lib/claude";
import {
    buildStage1Prompt,
    buildStage2Prompt,
    buildStage3Prompt,
    buildStage4Prompt,
    type Stage1Result,
    type Stage2Result,
    type Stage3Result,
} from "@/prompts/analysis";
import type { University } from "@/types/university";

/**
 * Multi-stage analysis API endpoint.
 * Each stage is designed to complete within Netlify's 26-second timeout.
 * 
 * Stages:
 * 1. Overall Assessment
 * 2. University-Specific Analysis
 * 3. ED/RD Strategy
 * 4. Detailed Timeline
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

        // Validate required fields
        if (!student_id) {
            return NextResponse.json(
                { error: "student_id is required" },
                { status: 400 }
            );
        }

        if (!stage || stage < 1 || stage > 4) {
            return NextResponse.json(
                { error: "stage must be 1, 2, 3, or 4" },
                { status: 400 }
            );
        }

        // Check API key early
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error("ANTHROPIC_API_KEY is not configured");
            return NextResponse.json(
                {
                    error: "AI 분석 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.",
                    debug: {
                        message: "ANTHROPIC_API_KEY environment variable is not set",
                        hint: "Set ANTHROPIC_API_KEY in Netlify environment variables",
                    }
                },
                { status: 503 }
            );
        }

        // Get student
        const student = await getStudentById(student_id);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Get university data for stages that need it
        const universities: University[] = [];
        if (stage === 1 || stage === 2) {
            const targetUniversities = student.target_universities || [];
            for (const target of targetUniversities) {
                const uni = await getUniversityById(target.university_id);
                if (uni) {
                    universities.push(uni);
                }
            }
        }

        // Build prompt based on stage
        let prompt: string;

        switch (stage) {
            case 1:
                prompt = buildStage1Prompt(student, universities);
                break;

            case 2:
                if (!context?.stage1Result) {
                    return NextResponse.json(
                        { error: "stage1Result is required in context for stage 2" },
                        { status: 400 }
                    );
                }
                prompt = buildStage2Prompt(student, universities, context.stage1Result as Stage1Result);
                break;

            case 3:
                if (!context?.stage1Result || !context?.stage2Result) {
                    return NextResponse.json(
                        { error: "stage1Result and stage2Result are required in context for stage 3" },
                        { status: 400 }
                    );
                }
                prompt = buildStage3Prompt(
                    student,
                    universities,
                    context.stage1Result as Stage1Result,
                    context.stage2Result as Stage2Result
                );
                break;

            case 4:
                if (!context?.stage1Result || !context?.stage3Result) {
                    return NextResponse.json(
                        { error: "stage1Result and stage3Result are required in context for stage 4" },
                        { status: 400 }
                    );
                }
                prompt = buildStage4Prompt(
                    student,
                    context.stage1Result as Stage1Result,
                    context.stage3Result as Stage3Result
                );
                break;

            default:
                return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
        }

        // Generate analysis for this stage
        let analysisText: string;
        try {
            analysisText = await generateAnalysis(prompt);
        } catch (apiError) {
            console.error(`Claude API error (stage ${stage}):`, apiError);
            const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
            const isTimeout = errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT");

            return NextResponse.json(
                {
                    error: isTimeout
                        ? "AI 서비스 요청 시간이 초과되었습니다. 다시 시도해주세요."
                        : "AI 서비스 연결에 실패했습니다.",
                    stage,
                    debug: {
                        message: errorMessage,
                        type: apiError?.constructor?.name,
                        isTimeout,
                        elapsedMs: Date.now() - startTime,
                        apiKeySet: true,
                    }
                },
                { status: 503 }
            );
        }

        // Parse JSON from response
        let jsonString: string | null = null;
        const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonString = jsonMatch[1];
        } else {
            const directMatch = analysisText.match(/\{[\s\S]*\}/);
            if (directMatch) {
                jsonString = directMatch[0];
            }
        }

        if (!jsonString) {
            console.error(`Failed to extract JSON from stage ${stage} response:`, analysisText.substring(0, 500));
            return NextResponse.json(
                {
                    error: "분석 결과를 파싱하는데 실패했습니다. 다시 시도해주세요.",
                    stage,
                    debug: {
                        message: "Failed to extract JSON from Claude response",
                        responsePreview: analysisText.substring(0, 300),
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
            console.error(`JSON parse error (stage ${stage}):`, parseError);
            return NextResponse.json(
                {
                    error: "분석 결과 형식이 올바르지 않습니다. 다시 시도해주세요.",
                    stage,
                    debug: {
                        message: parseErrorMessage,
                        jsonPreview: jsonString.substring(0, 300),
                    }
                },
                { status: 500 }
            );
        }

        // Return stage-specific result
        return NextResponse.json({
            stage,
            student_id,
            completed_at: new Date().toISOString(),
            elapsed_ms: Date.now() - startTime,
            result,
        });

    } catch (error) {
        console.error("Error in stage analysis:", error);
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
