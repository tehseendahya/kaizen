/**
 * Parse Physics 152 course content from Markdown
 * Extracts units, sub-units, and their structured content
 */

export type SubUnitContent = {
  why: string;
  keyResults: string;
  example: string;
  pitfalls: string;
  checks: string;
};

export type SubUnit = {
  title: string;
  slug: string;
  unit: string;
  unitOrder: number;
  order: number; // sub-unit order within unit
  content: SubUnitContent;
};

export type Unit = {
  title: string;
  order: number;
  subUnits: SubUnit[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractSection(content: string, sectionName: string): string {
  // Try various header formats
  const patterns = [
    new RegExp(`(?i)^\\*\\*${sectionName}\\*\\*[.:]?\\s*([\\s\\S]*?)(?=\\*\\*|$)`, 'm'),
    new RegExp(`(?i)^${sectionName}[.:]?\\s*([\\s\\S]*?)(?=\\*\\*|$)`, 'm'),
    new RegExp(`(?i)## ${sectionName}[.:]?\\s*([\\s\\S]*?)(?=##|$)`, 'm'),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '';
}

export function parseCourseMarkdown(markdown: string): Unit[] {
  const units: Unit[] = [];
  
  // Split by level-2 headers (##)
  const unitSections = markdown.split(/^##\s+/m).filter(s => s.trim());
  
  for (const section of unitSections) {
    // Extract unit number and title from first line
    const firstLineMatch = section.match(/^(\d+\))\s*(.+?)(?:\n|$)/);
    if (!firstLineMatch) continue;
    
    const unitOrder = parseInt(firstLineMatch[1].replace(')', ''));
    const unitTitle = firstLineMatch[2].trim();
    
    // Split by level-3 headers (###)
    const subUnitSections = section.split(/^###\s+/m).slice(1); // Skip first (unit header)
    
    const subUnits: SubUnit[] = [];
    
    for (let i = 0; i < subUnitSections.length; i++) {
      const subUnitText = subUnitSections[i];
      
      // Extract sub-unit number and title
      const subUnitMatch = subUnitText.match(/^(\d+\.\d+)\s+(.+?)(?:\n|$)/);
      if (!subUnitMatch) continue;
      
      const subUnitOrder = parseInt(subUnitMatch[1].split('.')[1]);
      const subUnitTitle = subUnitMatch[2].trim();
      const subUnitSlug = slugify(subUnitTitle);
      
      // Extract content sections
      const contentText = subUnitText.substring(subUnitMatch[0].length);
      
      const why = extractSection(contentText, 'Why it matters') || 
                  extractSection(contentText, 'Why') || '';
      
      const keyResults = extractSection(contentText, 'Key results') || 
                         extractSection(contentText, 'Key Results') || '';
      
      const example = extractSection(contentText, 'Worked example') || 
                      extractSection(contentText, 'Example') || 
                      extractSection(contentText, 'Worked Example') || '';
      
      const pitfalls = extractSection(contentText, 'Pitfalls') || 
                       extractSection(contentText, 'Common pitfalls') || 
                       extractSection(contentText, 'Common Pitfalls') || '';
      
      const checks = extractSection(contentText, 'Quick checks') || 
                     extractSection(contentText, 'Quick Checks') || '';
      
      subUnits.push({
        title: subUnitTitle,
        slug: subUnitSlug,
        unit: unitTitle,
        unitOrder,
        order: subUnitOrder,
        content: {
          why,
          keyResults,
          example,
          pitfalls,
          checks,
        },
      });
    }
    
    if (subUnits.length > 0) {
      units.push({
        title: unitTitle,
        order: unitOrder,
        subUnits,
      });
    }
  }
  
  return units.sort((a, b) => a.order - b.order);
}

