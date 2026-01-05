import fs from 'fs';
import path from 'path';

const universitiesDir = path.join(process.cwd(), 'data', 'universities');
const outputFile = path.join(process.cwd(), 'lib', 'university-data-all.ts');

function consolidate() {
    console.log('Consolidating university data...');

    const files = fs.readdirSync(universitiesDir);
    const universityDetails: Record<string, any> = {};

    files.forEach(file => {
        if (file.endsWith('.json') && file !== 'index.json') {
            const filePath = path.join(universitiesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            const id = file.replace('.json', '');
            universityDetails[id] = data;
            console.log(`- Added ${id}`);
        }
    });

    const tsContent = `// This file is auto-generated. Do not edit manually.
import type { University } from "@/types/university";

export const allUniversityDetails: Record<string, University> = ${JSON.stringify(universityDetails, null, 2)};
`;

    fs.writeFileSync(outputFile, tsContent);
    console.log(`Successfully wrote consolidated data to ${outputFile}`);
}

consolidate();
