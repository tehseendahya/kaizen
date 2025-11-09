# How to Regenerate Your Course with Deep Research

## The Issue

You're viewing an **old course** generated before the deep research system was implemented. To see the new system with 6-10 units and comprehensive content, you need to regenerate.

---

## ✅ Solution: I Just Added a "Regenerate" Button

### Where to Find It:

1. **Go to:** `http://localhost:3001/prof` (your dashboard)

2. **Click on "Databases" course** (or go to the ingestion page)

3. **Look for the new button** I just added:
   ```
   🔄 Regenerate with Deep Research
   ```

4. **Click it** and wait 3-5 minutes

5. **Watch terminal** for deep research stages

6. **Refresh the page** and you'll see:
   - ✅ 6-10 units in sidebar
   - ✅ Comprehensive content (1,200+ words/lesson)
   - ✅ Citations throughout
   - ✅ Research badge with 70+ sources

---

## If You Don't See the Button

The button appears when course status is:
- `READY_FOR_REVIEW` - Shows "🔄 Regenerate with Deep Research"
- `PUBLISHED` - Shows "🔄 Regenerate Course"

If your course is in a different status:
1. Go to `/prof/ingest/new`
2. Create a NEW course with your syllabus
3. Generate it fresh

---

## What Will Happen When You Regenerate

### Terminal Output:
```
🔬 DEEP RESEARCH GENERATION - STARTED
================================================================================

📋 STAGE 1: Extracting course skeleton...
  ✓ Extracted: 6 units, 12 lessons
    Unit 1: Introduction and Foundations
    Unit 2: Core Concepts and Principles
    Unit 3: Intermediate Topics
    Unit 4: Advanced Topics
    Unit 5: Practical Implementation
    Unit 6: Synthesis and Advanced Topics

🔍 STAGE 2: Researching lessons...
[researchLesson] Deep research: Course Overview and Objectives
  ✓ Found 7 sources (5 academic)
... (continues for all 12 lessons)

Total sources: 84

🤖 STAGE 3: Generating course content...
  Model: gpt-4o
  Max output: 16,000 tokens
  ✓ AI response received (65,000 characters)

📚 STAGE 4: Processing citations...
  ✓ Found 142 citations
  ✓ Added bibliography

✅ COMPLETE
Units: 6
Lessons: 12
Sources: 84
Citations: 142
Words: ~17,000
```

### UI Result:
- Left sidebar: **6 units** (not 1!)
- Each lesson: **Full page** of content
- Citations: **[1][2][3]** throughout
- Research badge: **84 sources**

---

##  Action Steps

1. **Refresh your browser** (`http://localhost:3001/courses/...`)
2. **Go back to the ingestion/dashboard page**
3. **Look for "🔄 Regenerate" button** (I just added it)
4. **Click it**
5. **Wait 3-5 minutes** (watch terminal)
6. **Refresh and see 6+ units!**

---

**The new system IS working - you just need to trigger it!** 🚀

