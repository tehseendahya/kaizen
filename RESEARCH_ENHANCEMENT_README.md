# Research-Enhanced Course Generation

## Overview

Your Axis platform now includes **web research enhancement** for AI-generated course content. When generating courses, the system:

1. **Searches the web** for relevant academic sources
2. **Extracts key concepts** from authoritative .edu/.gov sites
3. **Adds citations** to generated content
4. **Displays sources** used for professor review

## How It Works

### 1. Course Generation Flow

```
Upload Files → Parse Text → Web Research → AI Generation → Draft with Citations
```

### 2. Research Sources

- **Primary**: DuckDuckGo (free, no API key needed)
- **Optional**: Tavily or Bing Search (better quality, requires API key)

### 3. Source Quality Ranking

Sources are ranked by:
- **Domain authority**: .edu, .gov, OER sites get priority
- **Content quality**: Presence of equations, figures, structured content
- **Spam detection**: SEO spam is filtered out

## Setup

### Environment Variables

Add to your `.env.local`:

```bash
# Required (already configured)
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5  # or gpt-4-turbo, gpt-3.5-turbo

# Optional: Better research quality
RESEARCH_PROVIDER=tavily  # or 'bing', or omit for free DuckDuckGo
TAVILY_API_KEY=your_tavily_key  # Get from https://tavily.com (optional)
BING_SEARCH_KEY=your_bing_key   # Azure Cognitive Services (optional)
```

### Database Migration

Run this in your Supabase SQL Editor:

```sql
-- Add meta column to store research metadata
ALTER TABLE public.course_drafts 
ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.course_drafts 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
```

Or use the migration file: `supabase/migrations/004_add_research_metadata.sql`

## Features

### For Professors

1. **Research Sources Badge**
   - Shows number of sources used
   - Academic sources highlighted (.edu/.gov)
   - Click to expand and see all sources

2. **Citation Tracking**
   - See which sources were actually cited
   - Green checkmark for cited sources
   - Warning if sources found but not cited

3. **Source Quality Indicators**
   - Academic domain badges
   - Direct links to original sources
   - Snippet previews

### For Students

- Generated content includes inline citations `[1]`, `[2]`, etc.
- Bibliography automatically added to last lesson
- Sources are traceable and verifiable

## Research API Options

### Option 1: DuckDuckGo (Free, Default)

**Pros:**
- No API key needed
- No rate limits
- Instant setup

**Cons:**
- Limited to instant answer API
- Fewer results per query
- No advanced filtering

**Setup:** Nothing needed! Works out of the box.

### Option 2: Tavily (Recommended)

**Pros:**
- Academic source prioritization
- Better content extraction
- Quality scoring built-in

**Cons:**
- Requires API key
- Paid service ($0.005/search)

**Setup:**
1. Sign up at https://tavily.com
2. Get API key from dashboard
3. Add to `.env.local`:
   ```
   RESEARCH_PROVIDER=tavily
   TAVILY_API_KEY=tvly-xxxxx
   ```

### Option 3: Bing Search

**Pros:**
- Large index
- Good result quality
- Microsoft backing

**Cons:**
- Requires Azure account
- More complex setup

**Setup:**
1. Create Bing Search resource in Azure
2. Get API key
3. Add to `.env.local`:
   ```
   RESEARCH_PROVIDER=bing
   BING_SEARCH_KEY=your_key
   ```

## How Citations Work

### In Generated Content

```markdown
## Core Concepts

- Newton's second law states that force equals mass times acceleration [1].
- This relationship is fundamental to classical mechanics [2].
- The SI unit for force is the Newton (N), equal to kg⋅m/s² [1].

## References

1. Classical Mechanics - MIT OpenCourseWare — mit.edu — https://ocw.mit.edu/...
2. Newton's Laws of Motion - Physics LibreTexts — phys.libretexts.org — https://...
```

### Citation Validation

- ✅ Citations are numbered sequentially
- ✅ All citations have corresponding references
- ✅ Professors can see which sources were actually used
- ⚠️ Warning shown if sources found but not cited

## API Usage

### Programmatic Access

```typescript
import { generateCourseDraftWithResearch } from '@/lib/ai/generateCourseDraftWithResearch';

const result = await generateCourseDraftWithResearch(
  {
    title: "Physics 101",
    code: "PHYS-101",
    description: "Introduction to classical mechanics"
  },
  parsedFiles,
  {
    enableResearch: true,
    maxSources: 5
  }
);

console.log('Generated units:', result.content.units.length);
console.log('Research sources:', result.researchSources.length);
console.log('Citations used:', result.citationsUsed);
```

### Disable Research (Faster, No External Calls)

```typescript
const result = await generateCourseDraftWithResearch(
  seedMeta,
  parsedFiles,
  { enableResearch: false }  // Disable web research
);
```

## Troubleshooting

### No Sources Found

**Cause:** DuckDuckGo may not return results for very specific queries

**Fix:** 
1. Add Tavily or Bing API key for better results
2. Check that course title/description is descriptive
3. Ensure uploaded files contain extractable keywords

### Sources Found But Not Cited

**Cause:** AI didn't use the research context in generation

**Fix:**
1. This is normal if uploaded materials are comprehensive
2. Research sources supplement rather than replace uploaded content
3. Consider it a quality check - sources available if needed

### Research Taking Too Long

**Cause:** Multiple searches being performed

**Fix:**
1. Reduce `maxSources` from 5 to 3
2. Research is async - won't block if it times out
3. DuckDuckGo is faster than Tavily/Bing

## Technical Details

### Files Modified

- `src/lib/research/simpleResearch.ts` - Core research logic
- `src/lib/ai/generateCourseDraftWithResearch.ts` - Enhanced generation
- `src/app/api/prof/courses/[courseId]/generate-draft/route.ts` - API integration
- `src/components/ResearchSourcesBadge.tsx` - UI component
- `src/app/prof/ingest/[ingestionId]/IngestionDetailClient.tsx` - Display logic

### Database Schema

```sql
-- course_drafts.meta structure
{
  "researchSources": [
    {
      "url": "https://...",
      "title": "...",
      "snippet": "...",
      "domain": "mit.edu"
    }
  ],
  "citationsUsed": [1, 2, 3],
  "generatedAt": "2025-01-01T00:00:00Z",
  "sourcesCount": 5
}
```

## Future Enhancements

Potential improvements for later:

1. **Quality Scoring UI** - Show quality score per source
2. **Source Filtering** - Let professors remove/add sources before generation
3. **Citation Validation** - Enforce minimum citation count
4. **Research Cache** - Store search results to avoid repeated queries
5. **Custom Sources** - Let professors provide preferred sources
6. **Multi-Language** - Support non-English courses

## Support

If research isn't working:

1. Check logs in terminal for search errors
2. Verify API keys in `.env.local`
3. Test with DuckDuckGo (no key needed) first
4. Check rate limits on paid APIs

## Performance Notes

- **Research adds ~5-10 seconds** to generation time
- **DuckDuckGo**: Free, fast, limited results
- **Tavily**: $0.025 per generation (5 searches × $0.005)
- **Bing**: Depends on Azure tier
- **Caching**: Not yet implemented (planned for v2)

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** ✅ Production Ready (Hybrid Mode)

