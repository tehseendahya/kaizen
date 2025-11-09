/**
 * LaTeX utilities for equation extraction and validation
 */

/**
 * Extract LaTeX equations from text
 * Handles both inline $...$ and display $$...$$
 */
export function extractLatexEquations(text: string): string[] {
  const equations: string[] = [];

  // Display equations $$...$$
  const displayMatches = text.matchAll(/\$\$([\s\S]*?)\$\$/g);
  for (const match of displayMatches) {
    if (match[1]?.trim()) {
      equations.push(match[1].trim());
    }
  }

  // Inline equations $...$
  const inlineMatches = text.matchAll(/\$([^\$]+?)\$/g);
  for (const match of inlineMatches) {
    if (match[1]?.trim()) {
      equations.push(match[1].trim());
    }
  }

  // LaTeX environments
  const envMatches = text.matchAll(/\\begin\{(equation|align|gather|multline)\*?\}([\s\S]*?)\\end\{\1\*?\}/g);
  for (const match of envMatches) {
    if (match[2]?.trim()) {
      equations.push(match[2].trim());
    }
  }

  return [...new Set(equations)]; // dedupe
}

/**
 * Basic LaTeX syntax validation
 */
export function validateLatex(latex: string): { valid: boolean; error?: string } {
  // Check for balanced braces
  let braceCount = 0;
  for (const char of latex) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) {
      return { valid: false, error: 'Unbalanced closing brace' };
    }
  }
  if (braceCount !== 0) {
    return { valid: false, error: 'Unbalanced opening brace' };
  }

  // Check for common LaTeX commands
  const validCommands = [
    'frac', 'sqrt', 'sum', 'int', 'prod', 'lim',
    'sin', 'cos', 'tan', 'log', 'ln', 'exp',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta',
    'nabla', 'partial', 'infty', 'cdot', 'times',
    'left', 'right', 'big', 'Big',
    'begin', 'end', 'text', 'mathrm', 'mathbf',
    'vec', 'hat', 'bar', 'tilde', 'dot', 'ddot'
  ];

  const commandPattern = /\\([a-zA-Z]+)/g;
  const commands = [...latex.matchAll(commandPattern)].map(m => m[1]);

  for (const cmd of commands) {
    if (!validCommands.includes(cmd)) {
      console.warn(`[validateLatex] Unknown command: \\${cmd}`);
    }
  }

  return { valid: true };
}

/**
 * Normalize LaTeX (standardize spacing, commands)
 */
export function normalizeLatex(latex: string): string {
  return latex
    .replace(/\s+/g, ' ')
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*\^\s*/g, '^')
    .replace(/\s*_\s*/g, '_')
    .trim();
}

/**
 * Extract formula patterns from text using heuristics
 * Detects common physics/math formulas
 */
export function extractFormulaPatterns(text: string): string[] {
  const patterns: RegExp[] = [
    // Equations with = or := or ≈
    /[A-Za-z_][A-Za-z0-9_]*\s*[=:≈≡]\s*[^\n.;,]{3,50}/g,
    
    // LaTeX commands
    /\\(?:frac|nabla|partial|int|sum|prod|sqrt)\s*\{[^}]+\}/g,
    
    // Greek symbols in equations
    /[∇∂∫∑∏√±×·α-ωΑ-Ω][^.\n]{2,30}/g,
    
    // Common physics patterns
    /\b(?:∇·E|∇×E|∇²|E\s*=\s*mc²|F\s*=\s*ma|PV\s*=\s*nRT)\b/g
  ];

  const formulas: string[] = [];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const formula = match[0].trim();
      if (formula.length > 3 && formula.length < 100) {
        formulas.push(formula);
      }
    }
  }

  return [...new Set(formulas)]; // dedupe
}

/**
 * Check if text contains mathematical notation
 */
export function containsMath(text: string): boolean {
  const mathIndicators = [
    /\$[^$]+\$/,                    // inline math
    /\$\$[^$]+\$\$/,                // display math
    /\\(?:frac|sqrt|int|sum)/,      // LaTeX commands
    /[∇∂∫∑∏√±×·α-ωΑ-Ω]/,          // Math symbols
  ];

  return mathIndicators.some(pattern => pattern.test(text));
}

