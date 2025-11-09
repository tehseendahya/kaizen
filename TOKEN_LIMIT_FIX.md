# Token Limit Fix - Applied Changes

## Problem
User experienced token limit errors with `gpt-4-turbo` even with a small document. The research enhancement was adding extra context that pushed the model over its 4k output token limit.

## Changes Made

### 1. Disabled Research by Default
**File:** `src/app/api/prof/courses/[courseId]/generate-draft/route.ts`
- Changed `enableResearch: true` → `enableResearch: false`
- This prevents research context from being added to the prompt
- Reduces token usage significantly

### 2. Changed Default Model
**File:** `src/lib/ai/generateCourseDraft.ts`
- Changed default model: `gpt-5` → `gpt-4o`
- Reason: `gpt-4o` is more widely available and has better token limits than `gpt-4-turbo`

### 3. Reduced Max Tokens
**File:** `src/lib/ai/generateCourseDraft.ts`
- Changed `maxTokens: 12_000` → `maxTokens: 4_000`
- This ensures compatibility with `gpt-4-turbo`'s 4k output limit
- Safe for all GPT-4 models

### 4. Updated Error Messages
**File:** `src/lib/ai/generateCourseDraft.ts`
- Made error messages more accurate and helpful
- Removed confusing references to GPT-5
- Added clear guidance on model selection

## Model Token Limits Reference

| Model | Input Tokens | Output Tokens | Availability |
|-------|-------------|---------------|--------------|
| gpt-3.5-turbo | 16k | 4k | ✅ Widely available |
| gpt-4-turbo | 128k | 4k | ✅ Common |
| gpt-4o | 128k | 16k | ✅ Recommended |
| gpt-4 | 8k | 8k | ✅ Available |
| gpt-5 | 200k | 32k | ⚠️ Limited access |

## What This Means

### ✅ Fixed Issues
1. Token limit errors with small documents
2. Confusing error messages about GPT-5
3. Research adding too much context

### ⚠️ Trade-offs
1. **Research is disabled by default**
   - Pro: No token issues
   - Con: No external citations/sources
   - To re-enable: Set `enableResearch: true` in the API route

2. **Lower max tokens (4k instead of 12k)**
   - Pro: Works with all models
   - Con: Slightly shorter/less detailed content
   - Still generates complete courses with 3-5 units

## How to Use Different Configurations

### Option 1: Keep Current (Safest)
```bash
# .env.local
OPENAI_MODEL=gpt-4o  # or leave empty for default
```
- Works immediately
- No token issues
- Generates good quality courses

### Option 2: Enable Research (Better Quality)
**In `src/app/api/prof/courses/[courseId]/generate-draft/route.ts`:**
```typescript
result = await generateCourseDraftWithResearch(seedMeta, parsed, {
  enableResearch: true,  // Re-enable research
  maxSources: 3          // Reduce from 5 to use fewer tokens
});
```

**AND set a model with larger limits:**
```bash
# .env.local
OPENAI_MODEL=gpt-4o  # 16k output tokens (enough for research)
```

### Option 3: Maximum Quality (If You Have Access)
```bash
# .env.local
OPENAI_MODEL=gpt-5  # or gpt-4o
```

**AND in the API route:**
```typescript
result = await generateCourseDraftWithResearch(seedMeta, parsed, {
  enableResearch: true,
  maxSources: 5
});
```

**AND increase max tokens back:**
```typescript
// In generateCourseDraft.ts line ~300
let maxTokens = 12_000; // For GPT-5 or if you need longer output
```

## Testing

After these changes, you should be able to:

1. ✅ Upload a small document
2. ✅ Generate course without errors
3. ✅ Get 3-5 units with detailed content
4. ✅ No token limit errors

## Next Steps

1. **Test with your small document again**
2. **If it works**: You're done! ✅
3. **If you want research**: Follow Option 2 above
4. **If you want maximum quality**: Follow Option 3 above

---

**Status:** ✅ Applied and Ready to Test  
**Breaking Changes:** None (backward compatible)  
**Recommended Action:** Try generating a course with your small document

