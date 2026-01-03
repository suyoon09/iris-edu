import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUniversities, searchUniversities, getUniversityById } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const id = searchParams.get("id");

    if (id) {
      const university = await getUniversityById(id);
      if (!university) {
        return NextResponse.json(
          { error: "University not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(university);
    }

    if (query) {
      const results = await searchUniversities(query);
      return NextResponse.json(results);
    }

    const universities = await getUniversities();
    return NextResponse.json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}
