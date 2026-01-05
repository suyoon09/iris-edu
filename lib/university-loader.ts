import type { University } from "@/types/university";
import fs from "fs";
import path from "path";

// Cache for loaded university data
const universityCache: Map<string, University> = new Map();

/**
 * Load university detail from JSON file
 */
export function loadUniversityFromFile(universityId: string): University | null {
    // Check cache first
    if (universityCache.has(universityId)) {
        return universityCache.get(universityId)!;
    }

    try {
        const filePath = path.join(process.cwd(), "data", "universities", `${universityId}.json`);

        if (!fs.existsSync(filePath)) {
            console.warn(`University file not found: ${filePath}`);
            return null;
        }

        const fileContent = fs.readFileSync(filePath, "utf-8");
        const university = JSON.parse(fileContent) as University;

        // Cache the result
        universityCache.set(universityId, university);

        return university;
    } catch (error) {
        console.error(`Error loading university ${universityId}:`, error);
        return null;
    }
}

/**
 * Load all universities from JSON files
 */
export function loadAllUniversitiesFromFiles(): University[] {
    const universities: University[] = [];
    const dirPath = path.join(process.cwd(), "data", "universities");

    try {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            if (file.endsWith(".json") && file !== "index.json") {
                const universityId = file.replace(".json", "");
                const university = loadUniversityFromFile(universityId);
                if (university) {
                    universities.push(university);
                }
            }
        }
    } catch (error) {
        console.error("Error loading universities from files:", error);
    }

    return universities;
}

/**
 * Clear cache (useful for development/testing)
 */
export function clearUniversityCache(): void {
    universityCache.clear();
}
