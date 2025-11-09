# Deep Research System - Setup Checklist

## ✅ Quick Setup (5 Minutes)

### Step 1: Environment Variables
Open `.env.local` and verify:
```bash
OPENAI_MODEL=gpt-4o
```

### Step 2: (Optional) Add Tavily
```bash
RESEARCH_PROVIDER=tavily
TAVILY_API_KEY=tvly-xxxxx  # From https://tavily.com
```

### Step 3: Restart Server
```bash
# Press Ctrl+C, then:
npm run dev
```

### Step 4: Test
1. Go to `/prof/ingest/new`
2. Upload a syllabus with clear headings
3. Parse → Generate
4. Watch terminal for research logs
5. Check badge shows "Deep Research Mode"

---

## ✨ What You Get

**Upload:** 2-page syllabus  
**Output:** 10-20 lessons with 50+ web sources  
**Time:** 1-5 minutes  
**Cost:** ~$0.20-0.50 per course  

---

## 🎯 Expected Terminal Output

```
🔬 DEEP RESEARCH GENERATION - STARTED
=====================================

📋 STAGE 1: Extracting course skeleton...
  ✓ Extracted: 3 units, 9 lessons

🔍 STAGE 2: Researching lessons...
  ✓ Research complete: 45 total sources

🤖 STAGE 3: Generating course content...
  ✓ AI response received

📚 STAGE 4: Processing citations...
  ✓ Found 73 citations

✅ DEEP RESEARCH GENERATION - COMPLETE
```

---

## 📊 In Professor Dashboard

```
🔬 Deep Research Mode
Lessons researched: 9/9
Total sources: 45
Top domains: mit.edu (12), stanford.edu (8)

✓ 45 Research Sources (28 academic) | 73 citations
```

---

## 🐛 Quick Fixes

**Token limit error:**
→ Set `OPENAI_MODEL=gpt-4o`

**No sources found:**
→ Add Tavily API key

**Timeout:**
→ Upload smaller syllabus

---

## 📞 Help

- **Full docs:** `DEEP_RESEARCH_SYSTEM.md`
- **Quick start:** `QUICK_START_DEEP_RESEARCH.md`
- **Details:** `IMPLEMENTATION_SUMMARY.md`

---

**Ready to test!** 🚀

