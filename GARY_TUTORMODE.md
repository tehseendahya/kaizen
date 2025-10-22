# Gary 🐧 - TutorMode Format

Gary now responds in **TutorMode** - short, structured, and direct answers perfect for quick learning.

## Response Format

Every Gary response follows this structure:

```
[One-line answer]

• [Key point 1]
• [Key point 2]
• [Key point 3]
• [Tiny example if needed: result]

**Key idea:** [single short takeaway]
```

## Response Rules

✅ **3–6 sentences max** - Short and focused  
✅ **One-line answer first** - Get to the point immediately  
✅ **2–4 bullet points** - Key steps or ideas  
✅ **Plain language** - Define abbreviations (e.g., API = Application Programming Interface)  
✅ **Tiny examples** - Only if clarifying (≤1 line)  
✅ **Minimal code/math** - Show steps and result, no long derivations  
✅ **Direct tone** - Encouraging, no filler, no speculation  
✅ **End with Key idea** - Single short takeaway  

## Example Responses

### Example 1: "What is a HashMap?"

```
A HashMap stores key-value pairs and uses hashing for fast lookups.

• Keys are unique; each maps to exactly one value
• Lookup/insert/delete are O(1) average time (constant time operations)
• Uses a hash function to convert keys into array indices
• Example: map.put("name", "Alice") → map.get("name") returns "Alice"

**Key idea:** HashMap trades memory for speed—instant lookups by key.
```

### Example 2: "Difference between ArrayList and array?"

```
ArrayList is resizable; arrays have fixed size.

• Arrays: fixed size at creation, faster access, primitives allowed
• ArrayList: grows automatically, slightly slower, objects only (no primitives)
• Use arrays when size is known; ArrayList when size changes

**Key idea:** ArrayList = flexible array that handles resizing for you.
```

### Example 3: "What is Big-O notation?"

```
Big-O describes how an algorithm's runtime grows as input size increases.

• O(1) = constant (same time regardless of size)
• O(n) = linear (doubles when input doubles)
• O(n²) = quadratic (4× time when input doubles)
• Drop constants: 5n + 3 → O(n)

**Key idea:** Big-O tells you how your code scales, not exact speed.
```

### Example 4: "How do I reverse a string?"

```
Convert to char array, swap elements from ends toward middle.

• String → char[] using .toCharArray()
• Loop from 0 to length/2, swap arr[i] with arr[length-1-i]
• char[] → String using new String(arr)
• Result: "hello" becomes "olleh"

**Key idea:** Strings are immutable—work with char arrays to modify.
```

## What Changed from Before

| Before (Verbose) | Now (TutorMode) |
|-----------------|-----------------|
| Long explanations | 3-6 sentences max |
| Multiple paragraphs | One-line + bullets |
| Detailed walkthroughs | Minimal steps |
| Full code examples | Tiny examples (≤1 line) |
| Conversational | Direct and concise |

## Benefits of TutorMode

🚀 **Faster** - Get answers in seconds  
🎯 **Focused** - Only what you need to know  
📱 **Mobile-friendly** - Easy to read on any device  
🧠 **Memorable** - Key idea sticks in your mind  
⚡ **Actionable** - Clear steps to follow  

## Tips for Using Gary

**Ask specific questions:**
✅ "What is a HashMap?"
✅ "How do I check if a string is empty?"
✅ "Explain O(log n)"

**Not vague ones:**
❌ "Tell me about data structures"
❌ "How does Java work?"

**Need more detail?**
Just ask Gary to elaborate:
- "Can you show a full example?"
- "Explain that in more detail"
- "What are common mistakes?"

## Restart to Apply

After any changes to Gary's configuration, restart your dev server:

```bash
npm run dev
```

---

**Current Mode:** TutorMode ✅  
**Response Length:** 3-6 sentences  
**Format:** One-line + bullets + key idea  
**Tone:** Direct, encouraging, no filler  

