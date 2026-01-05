import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentById, updateStudent } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import type { SavedReport } from "@/types/student";

/**
 * Save a generated AI report to a student's profile.
 * 
 * POST body:
 * - student_id: string
 * - type: "analysis" | "roadmap"
 * - title: string
 * - data: object (the full report data)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { student_id, type, title, data } = body;

        // Validate
        if (!student_id) {
            return NextResponse.json({ error: "student_id is required" }, { status: 400 });
        }
        if (!type || !["analysis", "roadmap"].includes(type)) {
            return NextResponse.json({ error: "type must be 'analysis' or 'roadmap'" }, { status: 400 });
        }
        if (!data) {
            return NextResponse.json({ error: "data is required" }, { status: 400 });
        }

        // Get student
        const student = await getStudentById(student_id);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Create report
        const report: SavedReport = {
            id: uuidv4(),
            type,
            title: title || (type === "analysis" ? "AI 입시 분석" : "입시 로드맵"),
            generated_at: new Date().toISOString(),
            generated_by: session.user?.email || "unknown",
            data,
        };

        // Add to student's saved_reports (ensure array exists)
        const existingReports = student.saved_reports || [];
        const updatedReports = [report, ...existingReports]; // newest first

        // Update student
        await updateStudent(student_id, {
            saved_reports: updatedReports,
        });

        return NextResponse.json({
            success: true,
            report_id: report.id,
            message: "Report saved successfully",
        });

    } catch (error) {
        console.error("Error saving report:", error);
        return NextResponse.json(
            { error: "Failed to save report" },
            { status: 500 }
        );
    }
}

/**
 * Get saved reports for a student.
 * 
 * GET /api/students/[id]/reports
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("student_id");
        const type = searchParams.get("type"); // optional filter

        if (!studentId) {
            return NextResponse.json({ error: "student_id is required" }, { status: 400 });
        }

        const student = await getStudentById(studentId);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        let reports = student.saved_reports || [];

        // Filter by type if specified
        if (type && ["analysis", "roadmap"].includes(type)) {
            reports = reports.filter(r => r.type === type);
        }

        return NextResponse.json(reports);

    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}
