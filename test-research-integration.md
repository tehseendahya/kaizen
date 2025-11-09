# Test Plan: Research-Enhanced Generation

## Quick Verification Checklist

Run through this to verify the research enhancement is working:

---

## ✅ Pre-Flight Check

### 1. Database Migration
- [ ] Run `004_add_research_metadata.sql` in Supabase SQL Editor
- [ ] Verify `course_drafts` has `meta` column: 
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'course_drafts' AND column_name = 'meta';
  ```
- [ ] Should return: `meta | jsonb`

### 2. Environment Variables
- [ ] `.env.local` has `OPENAI_API_KEY`
- [ ] (Optional) Added `TAVILY_API_KEY` or `BING_SEARCH_KEY`

### 3. Dependencies
- [ ] Run `npm install` (should show no missing packages)
- [ ] Check for `@mozilla/readability`, `jsdom`, `cheerio` in `package.json`

---

## 🧪 Test Case 1: Basic Generation (No API Key)

**Goal:** Verify research works with free DuckDuckGo

### Steps:

1. **Navigate to Upload Page**
   ```
   http://localhost:3000/prof/ingest/new
   ```

2. **Create Test Course**
   - Title: "Introduction to Physics"
   - Code: "PHYS-101"
   - Term: "Fall 2025"
   - Description: "Classical mechanics and thermodynamics"

3. **Upload Sample Files**
   - Upload any PDF (syllabus, lecture notes, etc.)
   - Click "Create Course & Upload"

4. **Parse Files**
   - Click "📄 Parse Files"
   - Wait for success message
   - Status should change to "EXTRACTING"

5. **Generate Draft**
   - Click "✨ Generate AI Draft"
   - Open browser console (F12)
   - Look for research logs:
     ```
     🔬 [Research] Starting research-enhanced generation
     📚 [Research] Gathering external sources...
     ✓ Found N sources
     ```

6. **Verify Results**
   - [ ] Generation completes successfully
   - [ ] Research Sources Badge appears (may show 0 if DuckDuckGo has no results)
   - [ ] Draft content is displayed
   - [ ] Console shows research attempt (even if no sources found)

### Expected Outcome:
- ✅ Generation works
- ⚠️ May have 0 sources (DuckDuckGo is limited)
- ✅ No errors in console
- ✅ Process is transparent

---

## 🧪 Test Case 2: With Tavily API (Better Results)

**Goal:** Verify quality research integration

### Prerequisites:
- Tavily API key from https://tavily.com
- Add to `.env.local`:
  ```bash
  RESEARCH_PROVIDER=tavily
  TAVILY_API_KEY=tvly-xxxxx
  ```
- Restart Next.js dev server

### Steps:

1. **Repeat Test Case 1 steps 1-5**

2. **Check Research Logs**
   ```
   📚 [Research] Gathering external sources...
   ✓ Found 5 sources
   Top sources:
   1. Classical Mechanics - MIT OpenCourseWare (mit.edu)
   2. Physics - OpenStax (openstax.org)
   3. ...
   ```

3. **Verify Research Badge**
   - [ ] Badge shows "5 Research Sources (X academic)"
   - [ ] Click badge to expand
   - [ ] See 5 sources with:
     - [ ] Titles
     - [ ] Domain badges (blue for .edu/.gov)
     - [ ] URLs
     - [ ] Snippets

4. **Check Citations**
   - [ ] Look for [1], [2], etc. in draft content
   - [ ] Badge shows "N citations"
   - [ ] Green checkmarks on cited sources

5. **Verify Bibliography**
   - [ ] Scroll to end of draft
   - [ ] Find "References" section
   - [ ] Contains numbered list matching citations

### Expected Outcome:
- ✅ 3-5 quality sources found
- ✅ At least 2 academic (.edu/.gov)
- ✅ Citations appear in content
- ✅ Bibliography is generated
- ✅ Badge UI works correctly

---

## 🧪 Test Case 3: Citation Validation

**Goal:** Verify citation tracking works

### Steps:

1. **After generation with Tavily**

2. **Expand Research Badge**
   - Check citation indicators:
     - Green checkmark = cited
     - No checkmark = not cited

3. **Verify Citation Numbers**
   - [ ] All citations [1], [2], [3] have corresponding sources
   - [ ] No gaps in numbering
   - [ ] Bibliography matches citation numbers

4. **Check Metadata**
   - Open DevTools → Network tab
   - Find request to `generate-draft`
   - Check response (or database):
     ```json
     {
       "meta": {
         "researchSources": [...],
         "citationsUsed": [1, 2, 3],
         "sourcesCount": 5
       }
     }
     ```

### Expected Outcome:
- ✅ Citation numbers are sequential
- ✅ All citations have sources
- ✅ Metadata is stored correctly
- ✅ UI reflects actual citations

---

## 🧪 Test Case 4: Error Handling

**Goal:** Verify graceful degradation

### Scenario A: Network Error

1. Disconnect internet
2. Try to generate course
3. **Expected:** 
   - ⚠️ Research warning in console
   - ✅ Generation continues without research
   - ✅ No crash
   - ✅ Badge shows "No research sources"

### Scenario B: Invalid API Key

1. Set `TAVILY_API_KEY=invalid`
2. Try to generate course
3. **Expected:**
   - ⚠️ "Tavily API error" in console
   - ✅ Falls back to DuckDuckGo
   - ✅ Generation completes
   - ⚠️ Fewer/no sources

### Scenario C: Very Specific Topic

1. Create course: "Advanced Quantum Chromodynamics"
2. Generate draft
3. **Expected:**
   - ⚠️ May find 0 sources (topic too specific)
   - ✅ Generation still works
   - ✅ No crash
   - 💡 Content based on uploaded materials only

---

## 🧪 Test Case 5: Backward Compatibility

**Goal:** Verify old courses still work

### Steps:

1. **Find an old course** (generated before this feature)

2. **View in dashboard**
   - [ ] Course displays correctly
   - [ ] No research badge (expected)
   - [ ] No errors in console

3. **Re-generate draft**
   - [ ] Works with new system
   - [ ] Gets research sources
   - [ ] Badge appears after new generation

### Expected Outcome:
- ✅ Old courses unaffected
- ✅ Can upgrade old courses by regenerating
- ✅ No migration needed for old data

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found: @mozilla/readability"
**Fix:** `npm install @mozilla/readability jsdom cheerio`

### Issue: No sources found with Tavily
**Fix:** 
1. Verify API key is correct
2. Check console for error messages
3. Test key directly: https://api.tavily.com/search

### Issue: Research taking too long
**Fix:** Expected 5-10 extra seconds. If >30s:
1. Check network connection
2. Try DuckDuckGo instead
3. Reduce maxSources to 3

### Issue: Citations not appearing
**Fix:** This is normal if:
- Uploaded materials are very comprehensive
- Topic is very specific
- Research sources don't add new information

### Issue: Database error on draft save
**Fix:** Run migration script: `004_add_research_metadata.sql`

---

## ✅ Success Criteria

All tests pass if:

- [x] Course generation completes successfully
- [x] Research logs appear in console
- [x] No TypeScript/linter errors
- [x] Badge displays (even if 0 sources)
- [x] UI is responsive and clear
- [x] Old courses still work
- [x] System fails gracefully on errors

---

## 📊 Performance Benchmarks

Measure these during testing:

| Metric | Target | Acceptable |
|--------|--------|------------|
| Generation time (no research) | 30-45s | <60s |
| Generation time (with research) | 40-60s | <90s |
| Search API calls | 3-5 | <10 |
| Sources found (Tavily) | 3-5 | 1-5 |
| Sources found (DuckDuckGo) | 0-3 | 0-5 |
| Citations per course | 5-15 | 2-20 |
| UI response time | <100ms | <500ms |

---

## 🎓 Manual Review Checklist

After generation, review the draft:

- [ ] Content is coherent and educational
- [ ] Citations are relevant and accurate
- [ ] Sources are authoritative (.edu/.gov preferred)
- [ ] Bibliography is properly formatted
- [ ] No broken links
- [ ] No spam sources
- [ ] Content quality matches expectations
- [ ] Research enhanced (not replaced) uploaded materials

---

## 📝 Test Report Template

```
# Research Enhancement Test Report

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** [dev/staging/prod]

## Results

### Test Case 1: Basic Generation
- Status: [PASS/FAIL]
- Sources found: [N]
- Issues: [NONE/DESCRIPTION]

### Test Case 2: Tavily Integration  
- Status: [PASS/FAIL]
- Sources found: [N]
- Citations: [N]
- Issues: [NONE/DESCRIPTION]

### Test Case 3: Citation Validation
- Status: [PASS/FAIL]
- Issues: [NONE/DESCRIPTION]

### Test Case 4: Error Handling
- Status: [PASS/FAIL]
- Issues: [NONE/DESCRIPTION]

### Test Case 5: Backward Compatibility
- Status: [PASS/FAIL]
- Issues: [NONE/DESCRIPTION]

## Performance
- Average generation time: [Xs]
- Sources per course: [N]
- Citations per course: [N]

## Recommendations
[ANY SUGGESTED IMPROVEMENTS]

## Approval
- [ ] Ready for production
- [ ] Needs fixes: [DESCRIBE]
```

---

**Testing Status:** 📋 Ready to Test  
**Estimated Time:** 15-20 minutes  
**Prerequisites:** Database migration + optional API key  
**Support:** Check logs and READMEs if issues arise

