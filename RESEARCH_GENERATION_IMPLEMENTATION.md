# Research-Driven Course Generation Implementation

## Status: Partial Implementation (Core Infrastructure Complete)

This document summarizes the implementation of the research-driven, pedagogy-aware course generation system for Axis.

---

## ✅ COMPLETED COMPONENTS

### 1. Type Definitions
- **Files Created:**
  - `src/types/course.ts` - Course schema, units, subunits with Bloom taxonomy
  - `src/types/research.ts` - Research notes, bibliography, QA results, generation logs

### 2. Database Schema
- **File Created:** `supabase/migrations/003_research_generation_schema.sql`
- **Tables:**
  - `course_schemas` - Stores extracted course structures
  - `generation_logs` - Tracks generation status per subunit
  - `research_cache` - Caches search results (7-day TTL)
- **RLS Policies:** Professors can only access their own data
- **Cleanup Function:** `cleanup_expired_research_cache()`

### 3. Utility Modules
- **`src/server/utils/http.ts`**
  - `fetchWithRetry()` - Exponential backoff (250ms → 2s → 8s)
  - `RateLimiter` class - Token bucket rate limiting
  - `checkUrlAccessible()` - URL validation

- **`src/server/utils/text.ts`**
  - `computeHash()` - SHA-256 content hashing for deduplication
  - `normalizeText()` - Text cleaning
  - `cosineSimilarity()` - Originality checking
  - `overlapPercentage()` - Simpler overlap detection
  - `containsPII()` / `stripPII()` - Privacy protection
  - `slugify()` - URL-safe slug generation

- **`src/server/utils/latex.ts`**
  - `extractLatexEquations()` - Extract $...$ and $$...$$ equations
  - `validateLatex()` - Basic syntax checking
  - `extractFormulaPatterns()` - Heuristic formula detection
  - `containsMath()` - Detect mathematical content

### 4. Stage A: Skeleton Extraction
- **`src/server/ingest/pdf.ts`** - PDF text extraction using pdf-parse
- **`src/server/ingest/docx.ts`** - DOCX text extraction using mammoth
- **`src/server/ingest/extract.ts`** - Core extraction logic
  - **Heuristics:**
    - Heading detection: `/^(week|unit|topic|lecture)\b.*$/i`
    - Learning objectives: Bloom verb detection
    - Formula capture: LaTeX + text patterns
    - Subunit splitting: Colon-based concept separation
  - **Output:** `CourseSchema` with notation, preferred sources, structured outline

### 5. Stage B: Research Pipeline
- **`src/server/research/search.ts`**
  - `generateSearchQueries()` - 6-10 queries per subunit
  - `searchTavily()` / `searchBing()` - Provider integration
  - Rate limiting per provider
  - Query modifiers: "site:.edu pdf", "OpenStax chapter", etc.

- **`src/server/research/fetch.ts`**
  - `fetchAndExtract()` - Uses @mozilla/readability
  - `fetchBatch()` - Parallel fetching with concurrency limit
  - `isSubstantialContent()` - Quality filtering (≥300 words, spam detection)
  - Respects `robots.txt` and noindex meta tags

- **`src/server/research/notes.ts`**
  - `computeQualityScore()` - Domain authority + freshness + content density
    - .edu/.gov/OER: +0.4, society/journal: +0.3
    - Fresh (≤3y): +0.1, equations/figures: +0.05-0.1
    - Spam penalty: -0.3
  - `extractResearchNote()` - Claims, equations, examples
  - `rankAndFilter()` - Keep top K by quality
  - `isTriangulated()` - Verify claims (≥2 sources OR 1 canonical)
  - `filterTriangulatedClaims()` - Only include verified claims

### 6. MDX Templates & Prompts
- **`src/server/author/templates.ts`**
  - `generateFrontmatter()` - Course metadata, Bloom levels, difficulty
  - `generateReferences()` - Numbered bibliography
  - `validateSectionOrder()` - Enforce 7 required sections
  - `validateCitations()` - Check [n] citations match references
  - `WRITER_SYSTEM_PROMPT` - Exact AI instructions for content generation
  - `RESEARCHER_SYSTEM_PROMPT` - Exact AI instructions for research

### 7. Dependencies Installed
- `@mozilla/readability` - Content extraction
- `jsdom` - HTML parsing
- `cheerio` - HTML manipulation
- `clsx` - CSS class utilities (fixed missing dependency)

---

## 🚧 REMAINING WORK

### 1. MDX Composition Engine
**Need to create:** `src/server/author/compose.ts`
- `composeMDX()` function
- Integrate OpenAI API with `WRITER_SYSTEM_PROMPT`
- Generate 700-900 word MDX pages
- Follow strict section order
- Include LaTeX math, unit checks, citations

### 2. QA Validation Gates
**Need to create:** `src/server/qa/validate.ts`
- **11 validation checks:**
  1. Coverage: All `mustCover` concepts present
  2. Sources: ≥2 references, at least 1 .edu/OER
  3. Citations: ≥2 [n] present, sequential
  4. Originality: Cosine similarity <0.20 OR overlap <15%
  5. Length: 700-900 words
  6. Structure: All 7 sections present in order
  7. Math: LaTeX parses, ≥1 equation OR unit check
  8. A11y: All images have alt+caption, headings hierarchical
  9. Notation: SI units, bold vectors, consistent symbols
  10. Links: All refs HTTP 200
  11. Style: Academic tone, no "as an AI"
  12. Security: No PII
- `qaValidate(mdx, meta)` returns `{ ok, errors, warnings }`
- **Fail-closed:** Do not save if `ok=false`

### 3. API Routes
**Need to create:**
- `src/app/api/ingest/skeleton/route.ts`
  - POST: Accept files → extract skeleton → store in `course_schemas`
- `src/app/api/generate/subunit/route.ts`
  - POST: `{ courseId, unitId, subunitId, depth }`
  - Execute: search → fetch → notes → compose → QA → save MDX
- `src/app/api/generate/all/route.ts`
  - POST: `{ courseId, depth?, concurrency? }`
  - Queue all subunits, process with concurrency limit

### 4. Caching Layer
**Need to create:** `src/server/utils/cache.ts`
- Check `research_cache` table before searching
- Store search results + fetched content
- Keyed by `subunitId + depth + version`
- 7-day TTL (configurable)

### 5. Concurrency & Queue Management
**Need to create:** `src/server/utils/queue.ts`
- Queue implementation for subunit generation
- Limit concurrent tasks (default: 3)
- Track progress for UI updates

### 6. Professor UI
**Need to create:**
- `src/app/prof/ingest/new/page.tsx` (UPDATE)
  - Upload panel
  - Show extracted outline (editable)
  - Depth toggle: standard (K=6) | deep (K=10)
  - "Generate Content" button

- `src/app/prof/generation/[courseId]/page.tsx` (NEW)
  - Live status table per subunit
  - Status badges: Queued → Researching → Composing → QA → Published/Failed
  - Sources: "Searched N → kept K"
  - QA badges (11 checks)
  - Word count, elapsed time
  - "Open MDX" → inline editor → re-run QA → Save

### 7. MDX Storage & Rendering
- Save generated MDX to `content/{courseId}/{unitId}/{subunitId}.mdx`
- Mirror to Supabase Storage: `axis-content/...`
- Create MDX renderer for student view
- Asset storage: `public/content/.../assets/`

### 8. Environment Variables
**Need to add to `.env.local`:**
```bash
# Research providers
RESEARCH_PROVIDER=tavily  # or 'bing'
TAVILY_API_KEY=your_key_here
BING_SEARCH_KEY=your_key_here

# Asset hosting
ASSET_HOST=https://yourdomain.com

# Optional: Override OpenAI model for composition
OPENAI_MODEL=gpt-4-turbo
```

### 9. Test Suite
**Need to create:** `tests/generation.spec.ts`
- Skeleton extraction: ≥80% topic coverage
- Content richness: sections, word count, citations, figures
- Originality thresholds
- LaTeX rendering
- A11y enforcement
- Link resolution (HTTP 200)
- QA gate behavior (fail-closed)

**Scripts to add to `package.json`:**
```json
{
  "scripts": {
    "qa:content": "ts-node src/server/qa/runAll.ts",
    "test": "vitest run",
    "e2e": "playwright test"
  }
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

1. **HIGH PRIORITY (Core Functionality):**
   - MDX Composition Engine (`compose.ts`)
   - QA Validation Gates (`validate.ts`)
   - API Routes (skeleton, subunit, all)
   - Caching layer

2. **MEDIUM PRIORITY (Usability):**
   - Professor UI (outline editor, generation dashboard)
   - Concurrency/queue management
   - Environment variable configuration

3. **LOW PRIORITY (Polish):**
   - Test suite
   - Figure generation
   - Advanced QA checks
   - Performance optimizations

---

## 🔧 NEXT STEPS TO CONTINUE

1. **Install test dependencies:**
   ```bash
   npm install --save-dev vitest @playwright/test
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add `TAVILY_API_KEY` or `BING_SEARCH_KEY`
   - Set `RESEARCH_PROVIDER=tavily`

3. **Run database migration:**
   - Execute `supabase/migrations/003_research_generation_schema.sql` in Supabase SQL editor

4. **Complete remaining files:**
   - Start with `src/server/author/compose.ts`
   - Then `src/server/qa/validate.ts`
   - Then API routes

5. **Test manually:**
   - Upload course files → extract skeleton
   - Generate one subunit → verify QA
   - Generate full course → monitor progress

---

## 📝 ARCHITECTURAL NOTES

### Key Differences from Old System:
- **No AI summarization of uploads** - Only structure extraction
- **Web research required** - Cannot generate without external sources
- **Fail-closed QA** - Content not published if validation fails
- **Triangulation** - Claims must be verified by ≥2 sources
- **Strict MDX format** - 7 required sections, citations, equations
- **Quality scoring** - Domain authority, freshness, content density

### Error Handling:
- If search/fetch fails → Mark "Research Unavailable", do NOT fallback to summarization
- If QA fails → Store errors in `generation_logs`, allow manual review
- All errors logged with actionable messages

### Security & Privacy:
- Strip PII from uploads (emails, SSNs, phone numbers)
- Validate MIME types, reject executables
- Sanitize HTML in fetched content
- Obey robots.txt and noindex meta tags
- Log all outbound URLs for audit

---

## 🤔 DECISION POINTS

You may want to consider:

1. **Which search provider to use?**
   - Tavily: Better for academic content, more expensive
   - Bing: Broader coverage, cheaper
   - **Recommendation:** Start with Tavily for quality, fallback to Bing if budget constrained

2. **Should we implement figure generation?**
   - Spec calls for "minimal diagrams" (field lines, circuits, graphs)
   - Options: matplotlib, D3.js, TikZ, or skip for MVP
   - **Recommendation:** Skip for MVP, use existing figures from sources (with attribution)

3. **How to handle generation failures?**
   - Current spec: Mark as failed, allow retry
   - Alternative: Partial generation (save what passed QA)
   - **Recommendation:** Follow spec (fail-closed), but allow manual intervention

4. **Content licensing?**
   - Research notes are facts/ideas (not copyrightable)
   - Generated content is original synthesis
   - Citations provide attribution
   - **Recommendation:** Proceed as specified, but include license info in MDX frontmatter

---

## 📚 REFERENCES

- Bloom's Taxonomy: [https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/](https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/)
- MDX Spec: [https://mdxjs.com/](https://mdxjs.com/)
- Readability API: [https://github.com/mozilla/readability](https://github.com/mozilla/readability)
- Tavily API: [https://tavily.com/](https://tavily.com/)
- Bing Search API: [https://www.microsoft.com/en-us/bing/apis/bing-web-search-api](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)


