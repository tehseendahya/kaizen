# ✅ Ready to Test - Action Plan

## What I Just Did

1. ✅ Added `OPENAI_MODEL=gpt-4o` to your `.env.local`
2. ✅ Cleared build cache (`.next` folder)
3. ✅ Verified deep research system is active

---

## ⚠️ Important

**The course you're looking at (CS: Databases) was generated with the OLD system before my changes.**

You need to **regenerate it** to see the new deep research system with 6-10 units and comprehensive content.

---

## 🎯 How to See the New System

### Option 1: Regenerate Existing Course (Recommended)

1. **Go to your ingestion dashboard:**
   - Find the "CS: Databases" ingestion
   - Or go to `/prof/ingest/[ingestionId]`

2. **Click "Generate AI Draft" again**
   - This will regenerate with the NEW system
   - Will replace the old shallow content
   - Will take 3-5 minutes (shows progress in terminal)

3. **Watch terminal for:**
   ```
   🔬 DEEP RESEARCH GENERATION - STARTED
   📋 STAGE 1: Extracting skeleton...
     ✓ Extracted: 6 units, 12 lessons  ← Look for this!
   🔍 STAGE 2: Researching lessons...
     ✓ Research complete: 84 sources     ← And this!
   ```

4. **Refresh and check:**
   - Left sidebar should now show **6+ units**
   - Each lesson should be **1-2 pages of scrolling**
   - Lots of citations [1][2][3]
   - Research badge shows 70+ sources

### Option 2: Create New Test Course

1. **Go to `/prof/ingest/new`**

2. **Upload a syllabus** (any PDF with topic names)

3. **Create course and generate**

4. **Watch it work with new system**

---

## 🔍 What to Look For

### Success Indicators:

✅ **Terminal shows "DEEP RESEARCH GENERATION"** (not "RESEARCH-ENHANCED")

✅ **Skeleton extraction shows 6+ units:**
```
Unit 1: Introduction and Foundations
Unit 2: Core Concepts  
Unit 3: Intermediate Topics
Unit 4: Advanced Topics
Unit 5: Practical Implementation
Unit 6: Synthesis
```

✅ **Research shows 50+ sources:**
```
🔍 STAGE 2: Researching lessons...
[researchLesson] Deep research: Course Overview
  ✓ Found 7 sources...
... (repeats for each lesson)
Total sources: 84
```

✅ **Left sidebar has 6+ units** (not just 1-2)

✅ **Each lesson scrolls 1-2 pages** (not just 1 screen)

✅ **Research badge:**
```
🔬 Deep Research Mode
Lessons researched: 12/12
Total sources: 84
```

---

## 🐛 If It Still Shows 1 Unit

This means the deep research isn't running. Check:

1. **Did you restart the dev server?**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Are you regenerating the course?**
   - Don't just refresh - click "Generate AI Draft" again
   - Or create a brand new course

3. **Check terminal output**
   - Should see "DEEP RESEARCH GENERATION - STARTED"
   - If you see "RESEARCH-ENHANCED" → old system is still running

---

## 🔧 Restart Your Server NOW

```bash
# In your terminal:
# 1. Press Ctrl+C to stop current server
# 2. Run:
npm run dev

# 3. Then regenerate your course
```

---

## 📋 Quick Verification

After restarting, run this in a **new terminal**:

```bash
cd /Users/loganazizzadeh/Documents/Personal/kaizen
grep "OPENAI_MODEL" .env.local
```

**Should show:**
```
OPENAI_MODEL=gpt-4o
```

---

## 🎯 Summary

**What's wrong with current course:**
- Generated with OLD system (before my changes)
- Needs to be regenerated

**What you need to do:**
1. Restart dev server (Ctrl+C, then `npm run dev`)
2. Go back to ingestion page
3. Click "Generate AI Draft" again
4. Watch terminal for "DEEP RESEARCH GENERATION"
5. Wait 3-5 minutes
6. Refresh and see 6+ units with deep content!

---

**Next Action:** Restart server and regenerate! 🚀

