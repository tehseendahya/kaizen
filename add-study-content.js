// Script to extract study guide content from markdown and format it for the data file
const fs = require('fs');

const markdown = fs.readFileSync('./content/study/cs201.md', 'utf8');

// Parse the markdown into structured data
const units = [];
let currentUnit = null;
let currentSubUnit = null;
let currentSection = null;

const lines = markdown.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Unit header (## Unit X)
  if (line.match(/^## Unit (\d+)/)) {
    const match = line.match(/^## Unit (\d+) — (.+)/);
    currentUnit = {
      number: parseInt(match[1]),
      title: match[2],
      subUnits: []
    };
    units.push(currentUnit);
    currentSubUnit = null;
  }
  
  // Sub-unit header (### X.Y)
  else if (line.match(/^### (\d+)\.(\d+)/)) {
    const match = line.match(/^### (\d+)\.(\d+) (.+)/);
    currentSubUnit = {
      id: `${match[1]}.${match[2]}`,
      title: match[3],
      abbreviations: null,
      intuition: null,
      codeSketch: null,
      visualModel: null,
      pitfalls: null,
      vocabulary: null,
      recap: null
    };
    currentUnit.subUnits.push(currentSubUnit);
    currentSection = null;
  }
  
  // Section headers
  else if (currentSubUnit) {
    if (line.startsWith('**Abbreviations defined.**')) {
      currentSection = 'abbreviations';
      currentSubUnit.abbreviations = line.replace('**Abbreviations defined.**', '').trim();
    }
    else if (line.startsWith('**Intuition.**')) {
      currentSection = 'intuition';
      currentSubUnit.intuition = line.replace('**Intuition.**', '').trim();
    }
    else if (line.startsWith('**Visual/mental model.**')) {
      currentSection = 'visualModel';
      currentSubUnit.visualModel = line.replace('**Visual/mental model.**', '').trim();
    }
    else if (line.startsWith('**Common pitfalls.**')) {
      currentSection = 'pitfalls';
      currentSubUnit.pitfalls = line.replace('**Common pitfalls.**', '').trim();
    }
    else if (line.startsWith('**Vocabulary.**')) {
      currentSection = 'vocabulary';
      currentSubUnit.vocabulary = line.replace('**Vocabulary.**', '').trim();
    }
    else if (line.startsWith('**Recap.**')) {
      currentSection = 'recap';
      currentSubUnit.recap = line.replace('**Recap.**', '').trim();
    }
    else if (line.startsWith('**Code sketch')) {
      currentSection = 'codeSketch';
      currentSubUnit.codeSketch = '';
      // Capture code block
      let j = i + 1;
      let inCodeBlock = false;
      while (j < lines.length && !lines[j].startsWith('**')) {
        if (lines[j] === '```' || lines[j].startsWith('```')) {
          if (!inCodeBlock) {
            inCodeBlock = true;
          } else {
            break;
          }
        } else if (inCodeBlock) {
          currentSubUnit.codeSketch += lines[j] + '\n';
        }
        j++;
      }
      currentSubUnit.codeSketch = currentSubUnit.codeSketch.trim();
      i = j;
    }
    // Continue existing section
    else if (currentSection && line && !line.startsWith('**') && !line.startsWith('---') && !line.startsWith('#')) {
      if (currentSection === 'abbreviations' && currentSubUnit.abbreviations) {
        currentSubUnit.abbreviations += ' ' + line.trim();
      } else if (currentSection === 'intuition' && currentSubUnit.intuition) {
        currentSubUnit.intuition += ' ' + line.trim();
      } else if (currentSection === 'visualModel' && currentSubUnit.visualModel) {
        currentSubUnit.visualModel += ' ' + line.trim();
      } else if (currentSection === 'pitfalls' && currentSubUnit.pitfalls) {
        currentSubUnit.pitfalls += ' ' + line.trim();
      } else if (currentSection === 'vocabulary' && currentSubUnit.vocabulary) {
        currentSubUnit.vocabulary += ' ' + line.trim();
      } else if (currentSection === 'recap' && currentSubUnit.recap) {
        currentSubUnit.recap += ' ' + line.trim();
      }
    }
  }
}

// Output JSON for easy copying
console.log(JSON.stringify(units, null, 2));

