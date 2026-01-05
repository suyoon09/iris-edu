import type { University } from "@/types/university";
import { allUniversityDetails } from "./university-data-all";

/**
 * Load university detail from consolidated data
 */
export function loadUniversityFromFile(universityId: string): University | null {
    return allUniversityDetails[universityId] || null;
}

/**
 * Load all universities from consolidated data
 */
export function loadAllUniversitiesFromFiles(): University[] {
    return Object.values(allUniversityDetails);
}

/**
 * Clear cache (no longer needed but kept for interface compatibility)
 */
export function clearUniversityCache(): void {
    // No-op
}
