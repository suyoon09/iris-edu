import { NextRequest, NextResponse } from "next/server";
import { seedDatabase, checkDatabaseInitialized } from "@/lib/db";
import { seedData } from "@/lib/seed-data";

export async function POST(request: NextRequest) {
  try {
    // Check for seed secret to prevent unauthorized seeding
    const authHeader = request.headers.get("authorization");
    const seedSecret = process.env.SEED_SECRET || "iris-edu-seed-2024";

    if (authHeader !== `Bearer ${seedSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if already initialized
    const isInitialized = await checkDatabaseInitialized();

    const forceReseed = request.nextUrl.searchParams.get("force") === "true";

    if (isInitialized && !forceReseed) {
      return NextResponse.json({
        success: true,
        message: "Database already initialized. Use ?force=true to reseed.",
        seeded: false,
      });
    }

    // Seed the database
    const result = await seedDatabase(seedData);

    return NextResponse.json({
      ...result,
      seeded: true,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isInitialized = await checkDatabaseInitialized();
    return NextResponse.json({
      initialized: isInitialized,
    });
  } catch (error) {
    console.error("Error checking database status:", error);
    return NextResponse.json(
      { error: "Failed to check database status" },
      { status: 500 }
    );
  }
}
