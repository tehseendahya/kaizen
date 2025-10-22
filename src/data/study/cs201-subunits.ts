export type CodeSnippet = {
  language: 'java' | 'txt';
  code: string;
  caption?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: { id: string; text: string; correct: boolean; rationale: string }[];
};

export type SubUnit = {
  id: string;
  title: string;
  description: string;
  content: {
    keyPoints: string[];
    codeExample?: CodeSnippet;
    workedExample?: {
      title: string;
      explanation: string;
      code?: CodeSnippet;
    };
  };
  practice: {
    title: string;
    problems: string[];
  }[];
  quiz: QuizQuestion[];
};

export type StudyUnit = {
  unitId: 'u1' | 'u2' | 'u3' | 'u4' | 'u5' | 'u6' | 'u7' | 'u8' | 'u9' | 'u10';
  unitNumber: number;
  title: string;
  overview: string[];
  subUnits: SubUnit[];
  finalLab: {
    title: string;
    spec: string[];
    tasks: string[];
    extension?: string[];
  };
  finalProject: {
    title: string;
    spec: string[];
    focus: string[];
  };
  checklist: string[];
};

export type CourseData = {
  courseTitle: string;
  courseSubtitle: string;
  units: StudyUnit[];
};

export const cs201Data: CourseData = {
  courseTitle: 'CS201: Data Structures and Algorithms',
  courseSubtitle: '10 UNITS • 30 SUB-UNITS',
  units: [
    {
      unitId: 'u1',
      unitNumber: 1,
      title: 'What is Computer Science?',
      overview: [
        'Understand what Computer Science really is (and isn\'t).',
        'Learn why "scale" changes your decisions in software.',
        'Explore the impact of technology on privacy and fairness.'
      ],
      subUnits: [
        {
          id: 'u1-1',
          title: 'What CS really is (and isn\'t)',
          description: 'Computer Science is the study of automating step-by-step problem-solving at scale',
          content: {
            keyPoints: [
              'Computer Science is the study of automating step-by-step problem-solving ("algorithms") so they work at scale.',
              'It\'s not just "coding for its own sake"—you learn to describe a task so precisely that a computer can do it correctly, quickly, and for many users.',
              'Recipe → Algorithm: A cake recipe is a list of exact steps. In CS, we remove ambiguity: "mix for 90 seconds at speed 2."',
              'Small vs. at scale: Sorting 10 names is easy. Sorting 100 million names requires careful design.',
              'Everyday apps like Venmo, reCAPTCHA, or Google Maps are all algorithms running for millions of people at once.'
            ],
          },
          practice: [
            {
              title: 'Try it',
              problems: [
                'Write two sentences explaining how "automation at scale" could improve a campus service (e.g., dining hall lines).',
                'Write two sentences about risks if the automation is designed badly.'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_1_1',
              prompt: 'Q1 (CS at scale). Which description best matches this course\'s view of Computer Science?',
              choices: [
                { id: 'a', text: 'Writing code in any language.', correct: false, rationale: 'CS is more than just writing code—it\'s about solving problems algorithmically.' },
                { id: 'b', text: 'Building devices that execute instructions.', correct: false, rationale: 'That\'s computer engineering, not computer science.' },
                { id: 'c', text: 'Automating algorithmic processes so they work correctly and efficiently at scale.', correct: true, rationale: 'CS focuses on creating algorithms that work correctly for many users at large scale.' },
                { id: 'd', text: 'Memorizing syntax rules.', correct: false, rationale: 'Syntax is a tool, not the essence of CS.' }
              ]
            },
            {
              id: 'q1_1_2',
              prompt: 'Q2 (tiny vs. large). Which pair best illustrates "same task, different at scale"?',
              choices: [
                { id: 'a', text: 'Printing "Hello" once vs. twice.', correct: false, rationale: 'This is just repetition, not a scale problem.' },
                { id: 'b', text: 'Sorting 10 names vs. sorting 100 million records across servers.', correct: true, rationale: 'This shows how scale requires different design approaches.' },
                { id: 'c', text: 'Adding 2 + 2 vs. 3 + 3.', correct: false, rationale: 'These are different calculations, not the same task at different scales.' },
                { id: 'd', text: 'Copying a file vs. renaming it.', correct: false, rationale: 'These are different operations entirely.' }
              ]
            },
            {
              id: 'q1_1_3',
              prompt: 'Q3 (tradeoffs). A correct program uses 10× more memory than another correct program. At very large input sizes this is most likely to cause:',
              choices: [
                { id: 'a', text: 'Shorter runtime.', correct: false, rationale: 'More memory usage doesn\'t necessarily mean faster execution.' },
                { id: 'b', text: 'Compile errors.', correct: false, rationale: 'Compile errors happen at compile time, not runtime.' },
                { id: 'c', text: 'Memory exhaustion / frequent garbage collection pauses.', correct: true, rationale: 'Excessive memory use leads to running out of memory or GC overhead.' },
                { id: 'd', text: 'Network congestion only.', correct: false, rationale: 'Memory usage affects local resources, not network.' }
              ]
            },
            {
              id: 'q1_1_4',
              prompt: 'Q4 (design signal). The primary reason CS emphasizes efficiency is that:',
              choices: [
                { id: 'a', text: 'Style checkers demand it.', correct: false, rationale: 'Style checkers focus on code quality, not efficiency.' },
                { id: 'b', text: 'Large-scale use amplifies tiny inefficiencies into big costs.', correct: true, rationale: 'At scale, small inefficiencies become major problems.' },
                { id: 'c', text: 'Compilers reject slow code.', correct: false, rationale: 'Compilers don\'t check performance, only correctness.' },
                { id: 'd', text: 'Java requires it.', correct: false, rationale: 'Efficiency is a CS principle, not a language requirement.' }
              ]
            }
          ]
        },
        {
          id: 'u1-2',
          title: 'Why "scale" changes your decisions',
          description: 'Learn how serving many users changes system design',
          content: {
            keyPoints: [
              'Once a system serves many users, tiny inefficiencies become huge costs, and small biases become big harms.',
              'Inefficiency: An app that wastes 50 milliseconds per request feels fine with 10 users but burns hours of CPU per day with a million users.',
              'Fairness: If a recommendation algorithm unfairly hides 1% of artists, that becomes thousands of real people at scale.',
              'CS asks you to notice and fix such effects before they grow.'
            ],
          },
          practice: [
            {
              title: 'Quick Check',
              problems: [
                'Give an example of how a 10ms delay per user becomes a problem at scale.',
                'Explain how a small bias (like 1%) can cause major harm when scaled to millions.',
                'Name a real-world system where scale matters (e.g., payment processing, search results).'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_2_1',
              prompt: 'Q1 (latency math). Saving 50 ms per request for 500k daily requests saves roughly:',
              choices: [
                { id: 'a', text: '25 seconds/day', correct: false, rationale: 'Check the math: 50ms × 500,000 = 25,000,000ms = 25,000 seconds.' },
                { id: 'b', text: '25 minutes/day', correct: false, rationale: '25,000 seconds is more than 25 minutes.' },
                { id: 'c', text: '~7 hours/day', correct: true, rationale: '50ms × 500k = 25,000 seconds ≈ 6.9 hours saved per day.' },
                { id: 'd', text: '~14 days/day', correct: false, rationale: 'That would be physically impossible.' }
              ]
            },
            {
              id: 'q1_2_2',
              prompt: 'Q2 (fairness). A classifier with 99% accuracy but systematic bias will:',
              choices: [
                { id: 'a', text: 'Be fine; 99% is high.', correct: false, rationale: 'High overall accuracy can hide serious bias for specific groups.' },
                { id: 'b', text: 'Cause negligible harm at scale.', correct: false, rationale: 'Even 1% error affects many people at scale.' },
                { id: 'c', text: 'Amplify harms to many users; fix with evaluation by subgroup + mitigation.', correct: true, rationale: 'Bias must be evaluated per group and actively mitigated.' },
                { id: 'd', text: 'Always crash.', correct: false, rationale: 'Bias is a fairness issue, not a crash.' }
              ]
            },
            {
              id: 'q1_2_3',
              prompt: 'Q3 (storage). Storing raw full-res images for millions of users primarily stresses:',
              choices: [
                { id: 'a', text: 'CPU only.', correct: false, rationale: 'Storage is the main concern, not just CPU.' },
                { id: 'b', text: 'Disk, bandwidth, and processing time for thumbnails.', correct: true, rationale: 'Images affect storage, network transfer, and processing.' },
                { id: 'c', text: 'Only memory.', correct: false, rationale: 'Long-term storage is on disk, not just in memory.' },
                { id: 'd', text: 'None of the above.', correct: false, rationale: 'Images definitely stress system resources.' }
              ]
            },
            {
              id: 'q1_2_4',
              prompt: 'Q4 (logs). Long-term detailed logs increase risk because:',
              choices: [
                { id: 'a', text: 'They slow printing.', correct: false, rationale: 'The risk is privacy, not performance.' },
                { id: 'b', text: 'They can be joined with other datasets to re-identify users.', correct: true, rationale: 'Detailed logs can be combined with other data to reveal identities.' },
                { id: 'c', text: 'JSON is unsafe.', correct: false, rationale: 'JSON format itself isn\'t the issue.' },
                { id: 'd', text: 'Loops become O(n²).', correct: false, rationale: 'This is about privacy risk, not algorithm complexity.' }
              ]
            }
          ]
        },
        {
          id: 'u1-3',
          title: 'People & impact: a privacy case you\'ll remember',
          description: 'Understanding how data can reveal private information',
          content: {
            keyPoints: [
              'Researcher Latanya Sweeney famously showed that date of birth + gender + ZIP code can identify most Americans.',
              '"Anonymous" data often isn\'t truly anonymous.',
              'When you write code that touches data, think about how it could reveal private facts when combined with other datasets.',
              'Privacy is not just about hiding names—it\'s about protecting identifiability through data combinations.'
            ],
          },
          practice: [
            {
              title: 'Think about it',
              problems: [
                'List three pieces of "anonymous" data that, when combined, could identify you.',
                'Explain why removing names from a dataset doesn\'t guarantee privacy.',
                'What responsibility does a developer have when handling user data?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_3_1',
              prompt: 'Q1 (re-ID). DOB + gender + ZIP can re-identify many people because:',
              choices: [
                { id: 'a', text: 'These fields are random.', correct: false, rationale: 'They\'re not random—they\'re specific personal attributes.' },
                { id: 'b', text: 'They are common quasi-identifiers that are often unique in combination.', correct: true, rationale: 'This combination is unique enough to identify individuals even without names.' },
                { id: 'c', text: 'Hash codes leak them.', correct: false, rationale: 'The issue is the combination itself, not hashing.' },
                { id: 'd', text: 'Java exposes them by default.', correct: false, rationale: 'This is about data privacy, not Java features.' }
              ]
            },
            {
              id: 'q1_3_2',
              prompt: 'Q2 (mitigation). Which pair reduces re-identification risk?',
              choices: [
                { id: 'a', text: 'Wider logging + plaintext IDs', correct: false, rationale: 'This increases risk by exposing more data.' },
                { id: 'b', text: 'Publishing raw CSVs + long retention', correct: false, rationale: 'Raw data with long retention increases privacy risks.' },
                { id: 'c', text: 'k-anonymity style grouping + minimizing fields retained', correct: true, rationale: 'Grouping data and keeping fewer fields reduces re-identification risk.' },
                { id: 'd', text: 'None; re-ID is impossible to reduce', correct: false, rationale: 'There are proven techniques to reduce re-identification risk.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 1 — Explore Scale and Privacy',
        spec: ['Research and document a real-world case where scale or privacy mattered.'],
        tasks: [
          'Find an example of a system that had problems at scale',
          'Explain how the problem could have been prevented',
          'Research a privacy breach involving data combination'
        ],
        extension: ['Present your findings to the class']
      },
      finalProject: {
        title: 'Mini-Project 1 — Impact Analysis',
        spec: ['Analyze a technology system for scale and privacy implications.'],
        focus: ['Understanding real-world consequences of CS decisions']
      },
      checklist: [
        'Explain what Computer Science is in your own words',
        'Give three examples of how scale changes system design',
        'Describe Latanya Sweeney\'s privacy research',
        'Identify potential privacy risks in a dataset'
      ]
    },
    {
      unitId: 'u2',
      unitNumber: 2,
      title: 'Java & Object-Oriented Foundations',
      overview: [
        'Understand Java\'s primitive types and how they differ from objects.',
        'Learn about references, object creation, and memory management.',
        'Master equality comparison with == vs .equals().',
        'Understand what classes are and how they define state and behavior.'
      ],
      subUnits: [
        {
          id: 'u2-1',
          title: 'Values, variables, and primitive types',
          description: 'Learn about Java\'s primitive data types and how values are stored',
          content: {
            keyPoints: [
              'In Java, every piece of data has a type (what kind of thing it is) and a value (its actual content).',
              'Primitives are simple built-in types that store their value directly: int (whole numbers), double (decimals), boolean (true/false), and char (a single character).',
              'int a = 7; means the variable named a holds the whole number 7.',
              'double x = 1.0/2; stores 0.5. The type is double, the value is 0.5.',
              'boolean ok = (5 < 7); stores true.'
            ],
            codeExample: {
              language: 'java',
              code: `int a = 7;           // whole number
double x = 1.0/2;    // decimal: 0.5
boolean ok = (5 < 7); // true
char c = 'A';        // single character

// Order of operations matters
int result1 = 3/2;      // 1 (integer division)
double result2 = 3/2.0; // 1.5 (decimal division)
int result3 = 1 + 2 * 3; // 7 (multiplication first)`,
              caption: 'Examples of primitive types and their values'
            }
          },
          practice: [
            {
              title: 'Check your understanding',
              problems: [
                'Predict the value and type of 3/2',
                'Predict the value and type of 3/2.0',
                'Predict the value and type of 1 + 2 * 3',
                'Why does 3/2 give 1 instead of 1.5?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q2_1_1',
              prompt: 'Q1. Type/value of 3/2 in Java is:',
              choices: [
                { id: 'a', text: 'int, 1', correct: true, rationale: 'Integer division: both operands are int, so result is int with value 1.' },
                { id: 'b', text: 'double, 1.0', correct: false, rationale: 'Both operands are int, so the result is int, not double.' },
                { id: 'c', text: 'int, 2', correct: false, rationale: 'Integer division truncates, giving 1, not 2.' },
                { id: 'd', text: 'double, 1.5', correct: false, rationale: 'This would only happen if at least one operand was a double.' }
              ]
            },
            {
              id: 'q2_1_2',
              prompt: 'Q2. Type/value of 3/2.0 is:',
              choices: [
                { id: 'a', text: 'int, 1', correct: false, rationale: '2.0 is a double, so the result is promoted to double.' },
                { id: 'b', text: 'double, 1.5', correct: true, rationale: 'One operand is double (2.0), so decimal division gives 1.5.' },
                { id: 'c', text: 'double, 1.0', correct: false, rationale: 'With decimal division, 3/2.0 = 1.5, not 1.0.' },
                { id: 'd', text: 'int, 2', correct: false, rationale: 'The result is a double, not an int.' }
              ]
            },
            {
              id: 'q2_1_3',
              prompt: 'Q3. Which prints true without throwing?\n\nint a = 0;\nSystem.out.println((a != 0) && (10/a > 2));',
              choices: [
                { id: 'a', text: 'Always true', correct: false, rationale: 'Short-circuit prevents evaluation, but the result is false.' },
                { id: 'b', text: 'Always false', correct: true, rationale: '(a != 0) is false, so && short-circuits without evaluating 10/a.' },
                { id: 'c', text: 'True due to short-circuit, no divide by zero', correct: false, rationale: 'Short-circuit prevents the error, but the result is false, not true.' },
                { id: 'd', text: 'Throws always', correct: false, rationale: 'Short-circuit evaluation prevents reaching the division.' }
              ]
            },
            {
              id: 'q2_1_4',
              prompt: 'Q4. Which expression is true exactly when n is a positive even integer?',
              choices: [
                { id: 'a', text: 'n % 2 == 1 && n > 0', correct: false, rationale: 'This checks for positive odd numbers, not even.' },
                { id: 'b', text: 'n % 2 == 0 && n > 0', correct: true, rationale: 'Even means divisible by 2 (n % 2 == 0), and positive means n > 0.' },
                { id: 'c', text: 'n % 2 != 0 || n <= 0', correct: false, rationale: 'This is true for odd OR non-positive numbers.' },
                { id: 'd', text: '!(n % 2 == 0)', correct: false, rationale: 'This checks for odd numbers only, ignoring the positive requirement.' }
              ]
            },
            {
              id: 'q2_1_5',
              prompt: 'Q5. The operator == is appropriate for equality on:',
              choices: [
                { id: 'a', text: 'String contents', correct: false, rationale: 'Use .equals() for String content comparison.' },
                { id: 'b', text: 'ArrayList contents', correct: false, rationale: 'Use .equals() for ArrayList content comparison.' },
                { id: 'c', text: 'Primitive numbers like int or double', correct: true, rationale: '== works correctly for primitive types.' },
                { id: 'd', text: 'All reference types', correct: false, rationale: '== checks reference equality, not content for objects.' }
              ]
            }
          ]
        },
        {
          id: 'u2-2',
          title: 'Objects and references (how they differ from primitives)',
          description: 'Understand how objects work and what references mean',
          content: {
            keyPoints: [
              'Most real-world things in Java are objects: String (text), ArrayList (resizable list), Scanner (reader), File, URL, and your own classes.',
              'A variable that "holds an object" actually holds a reference (think: a sticky note with the storage address).',
              'You create objects with new, and you use dot-notation to call their methods (their actions).',
              'Mental model: Changing the variable just changes the sticky note (which object it points to), not the object itself.'
            ],
            codeExample: {
              language: 'java',
              code: `String s = new String("Duke");   // make a new String object
int len = s.length();             // ask the object for its length

ArrayList<String> names = new ArrayList<>();
names.add("Ava");                 // call a method on the object

// Reference means the variable holds an "address"
String s1 = new String("hello");
String s2 = s1;  // s2 points to the same object as s1`,
              caption: 'Creating objects and using references'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Create a String object with your name',
                'Create an ArrayList and add three items to it',
                'Explain the difference between a primitive variable and an object reference'
              ]
            }
          ],
          quiz: [
            {
              id: 'q2_2_1',
              prompt: 'Q1. A variable of type ArrayList<String> stores:',
              choices: [
                { id: 'a', text: 'The whole list by value', correct: false, rationale: 'Objects are not stored by value; variables hold references.' },
                { id: 'b', text: 'A reference (like an address/label) to a list object', correct: true, rationale: 'Object variables store references that point to objects in memory.' },
                { id: 'c', text: 'Its size() only', correct: false, rationale: 'The reference points to the entire object, not just one property.' },
                { id: 'd', text: 'Bytes of the first element', correct: false, rationale: 'The reference points to the whole object.' }
              ]
            },
            {
              id: 'q2_2_2',
              prompt: 'Q2. What prints?\n\nArrayList<Integer> x = new ArrayList<>();\nArrayList<Integer> y = x;\nx.add(7);\nSystem.out.println(x.size() + " / " + y.size());',
              choices: [
                { id: 'a', text: '0 / 0', correct: false, rationale: 'x.add(7) adds an element.' },
                { id: 'b', text: '1 / 0', correct: false, rationale: 'y references the same list as x.' },
                { id: 'c', text: '1 / 1', correct: true, rationale: 'y and x reference the same list, so both see the added element.' },
                { id: 'd', text: 'Compile error', correct: false, rationale: 'This is valid Java code.' }
              ]
            },
            {
              id: 'q2_2_3',
              prompt: 'Q3. Which line makes two independent lists?',
              choices: [
                { id: 'a', text: 'ArrayList<Integer> b = a;', correct: false, rationale: 'This creates an alias; both reference the same list.' },
                { id: 'b', text: 'ArrayList<Integer> b = new ArrayList<>(a);', correct: true, rationale: 'This creates a new list with a copy of a\'s contents.' },
                { id: 'c', text: 'ArrayList<Integer> b = null;', correct: false, rationale: 'This doesn\'t create a list at all.' },
                { id: 'd', text: 'ArrayList<Integer> b = a; b.clear();', correct: false, rationale: 'This clears both a and b since they reference the same list.' }
              ]
            },
            {
              id: 'q2_2_4',
              prompt: 'Q4. Reassigning a parameter list = new ArrayList<>(); inside a method:',
              choices: [
                { id: 'a', text: 'Mutates the caller\'s list', correct: false, rationale: 'Reassigning only changes the local parameter reference.' },
                { id: 'b', text: 'Changes only the local reference; caller\'s reference still points to the old object', correct: true, rationale: 'Parameters are passed by value (the reference is copied).' },
                { id: 'c', text: 'Deletes the caller\'s list', correct: false, rationale: 'The caller\'s reference remains unchanged.' },
                { id: 'd', text: 'Throws', correct: false, rationale: 'This is valid Java code.' }
              ]
            },
            {
              id: 'q2_2_5',
              prompt: 'Q5. new in Java primarily:',
              choices: [
                { id: 'a', text: 'Compares two objects', correct: false, rationale: 'Comparison is done with == or .equals().' },
                { id: 'b', text: 'Allocates memory and returns a reference', correct: true, rationale: 'new creates a new object and returns a reference to it.' },
                { id: 'c', text: 'Computes a hash code', correct: false, rationale: 'Hash codes are computed by hashCode().' },
                { id: 'd', text: 'Declares a primitive', correct: false, rationale: 'Primitives don\'t use new.' }
              ]
            },
            {
              id: 'q2_2_6',
              prompt: 'Q6. Dot-notation (e.g., s.length()) means:',
              choices: [
                { id: 'a', text: 'Static method call', correct: false, rationale: 'Static methods use the class name, not an instance.' },
                { id: 'b', text: 'Field access only', correct: false, rationale: 'Dot-notation can access fields or call methods.' },
                { id: 'c', text: 'Calling a method on that object reference', correct: true, rationale: 'Dot-notation invokes a method on the object.' },
                { id: 'd', text: 'Casting', correct: false, rationale: 'Casting uses parentheses: (Type)obj.' }
              ]
            },
            {
              id: 'q2_2_7',
              prompt: 'Q7. Two different variables can point to the same object. This situation is called:',
              choices: [
                { id: 'a', text: 'Boxing', correct: false, rationale: 'Boxing converts primitives to wrapper objects.' },
                { id: 'b', text: 'Aliasing', correct: true, rationale: 'Aliasing occurs when multiple references point to the same object.' },
                { id: 'c', text: 'Shadowing', correct: false, rationale: 'Shadowing is when a local variable hides a field.' },
                { id: 'd', text: 'Hoisting', correct: false, rationale: 'Hoisting is a JavaScript concept, not Java.' }
              ]
            },
            {
              id: 'q2_2_8',
              prompt: 'Q8. If a and b reference the same ArrayList, then a.add("x") followed by b.size() prints:',
              choices: [
                { id: 'a', text: 'Old size', correct: false, rationale: 'The change through a affects b since they reference the same list.' },
                { id: 'b', text: 'New size reflecting the add', correct: true, rationale: 'Both references see the same list, so b.size() reflects the add.' },
                { id: 'c', text: '0', correct: false, rationale: 'The size increases after the add.' },
                { id: 'd', text: 'Throws', correct: false, rationale: 'This is valid Java code.' }
              ]
            },
            {
              id: 'q2_2_9',
              prompt: 'Q9. The best explanation for "reference" in slides is:',
              choices: [
                { id: 'a', text: 'Copy of bytes of the whole object', correct: false, rationale: 'A reference is not a copy of the object.' },
                { id: 'b', text: 'Pointer/label to where the object lives in memory', correct: true, rationale: 'A reference is like an address pointing to the object.' },
                { id: 'c', text: 'A random number with no meaning', correct: false, rationale: 'References have specific meaning—they locate objects.' },
                { id: 'd', text: 'A package name', correct: false, rationale: 'References are not package names.' }
              ]
            }
          ]
        },
        {
          id: 'u2-3',
          title: 'Equality: == vs .equals() for objects',
          description: 'Learn the critical difference between == and .equals()',
          content: {
            keyPoints: [
              '== asks: Are these the exact same object (same address)?',
              '.equals() asks: Do these objects have the same content?',
              'Beginner trap to avoid: Never use == to compare two strings you read from files or input. Use .equals().'
            ],
            codeExample: {
              language: 'java',
              code: `String a = new String("hi");
String b = new String("hi");

a == b        // false: different objects (different addresses)
a.equals(b)   // true: same characters (same content)

// Always use .equals() for strings!
String input = scanner.next();
if (input.equals("yes")) {  // CORRECT
  // ...
}
if (input == "yes") {  // WRONG! Don't do this!
  // ...
}`,
              caption: 'Comparing objects: == vs .equals()'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Given two String objects with the same text, what does == return? What does .equals() return?',
                'Why should you never use == to compare strings from user input?',
                'Write code that correctly checks if a user entered "quit"'
              ]
            }
          ],
          quiz: [
            {
              id: 'q2_3_1',
              prompt: 'Q1. Given\n\nString a = new String("duke");\nString b = new String("duke");\n\nWhich is true?',
              choices: [
                { id: 'a', text: 'a == b and a.equals(b) are both true', correct: false, rationale: 'new creates separate objects, so == is false.' },
                { id: 'b', text: 'a == b is false; a.equals(b) is true', correct: true, rationale: '== checks reference equality (false), .equals() checks content (true).' },
                { id: 'c', text: 'Both are false', correct: false, rationale: 'The content is the same, so .equals() is true.' },
                { id: 'd', text: 'Both are true only if interning is used', correct: false, rationale: 'new explicitly creates distinct objects.' }
              ]
            },
            {
              id: 'q2_3_2',
              prompt: 'Q2. Correct fix for content comparison of two strings is:',
              choices: [
                { id: 'a', text: 'Use ==', correct: false, rationale: '== compares references, not content.' },
                { id: 'b', text: 'Use .equals()', correct: true, rationale: '.equals() compares the actual characters in the strings.' },
                { id: 'c', text: 'Convert to int first', correct: false, rationale: 'Converting doesn\'t help with string comparison.' },
                { id: 'd', text: 'Use .hashCode() directly', correct: false, rationale: 'Hash codes can collide; use .equals().' }
              ]
            },
            {
              id: 'q2_3_3',
              prompt: 'Q3. If s.equals(t) is true, what about s == t?',
              choices: [
                { id: 'a', text: 'Always true', correct: false, rationale: 'Equal content doesn\'t mean same object.' },
                { id: 'b', text: 'Always false', correct: false, rationale: 'They could be the same object.' },
                { id: 'c', text: 'Cannot be determined from given info', correct: true, rationale: 'Equal content doesn\'t tell us if they\'re the same object.' },
                { id: 'd', text: 'Always throws', correct: false, rationale: 'This is valid Java code.' }
              ]
            },
            {
              id: 'q2_3_4',
              prompt: 'Q4. If s.hashCode() == t.hashCode() for Strings:',
              choices: [
                { id: 'a', text: 's.equals(t) must be true', correct: false, rationale: 'Hash codes can collide; same hash doesn\'t guarantee equal content.' },
                { id: 'b', text: 's.equals(t) must be false', correct: false, rationale: 'They could be equal or could be a collision.' },
                { id: 'c', text: 'Cannot be determined from given info', correct: true, rationale: 'Same hash code doesn\'t guarantee equality.' },
                { id: 'd', text: 'They are the same object', correct: false, rationale: 'Hash codes don\'t indicate reference equality.' }
              ]
            },
            {
              id: 'q2_3_5',
              prompt: 'Q5. The contract linking equals and hashCode matters primarily for:',
              choices: [
                { id: 'a', text: 'HashSet/HashMap correctness', correct: true, rationale: 'Hash-based collections rely on consistent equals() and hashCode().' },
                { id: 'b', text: 'For-each loops', correct: false, rationale: 'For-each loops don\'t depend on equals/hashCode.' },
                { id: 'c', text: 'Printing speed', correct: false, rationale: 'Printing doesn\'t depend on equals/hashCode consistency.' },
                { id: 'd', text: 'Primitive math', correct: false, rationale: 'Primitives don\'t have equals() or hashCode().' }
              ]
            },
            {
              id: 'q2_3_6',
              prompt: 'Q6. Which literal vs. constructor pair may lead to == being true unexpectedly due to interning?',
              choices: [
                { id: 'a', text: 'String s = "hi"; String t = "hi";', correct: true, rationale: 'String literals are interned, so both reference the same object.' },
                { id: 'b', text: 'String s = new String("hi"); String t = new String("hi");', correct: false, rationale: 'new creates separate objects.' },
                { id: 'c', text: 'String s = "hi"; String t = new String("hi");', correct: false, rationale: 'One is interned, one is not, so == is false.' },
                { id: 'd', text: 'None; == is never true', correct: false, rationale: 'Interned literals can make == true.' }
              ]
            },
            {
              id: 'q2_3_7',
              prompt: 'Q7. In exam examples about @Override, it primarily helps to:',
              choices: [
                { id: 'a', text: 'Speed code up', correct: false, rationale: '@Override is a compile-time check, not a runtime optimization.' },
                { id: 'b', text: 'Catch mistakes like tostring vs toString', correct: true, rationale: '@Override ensures you\'re actually overriding a parent method.' },
                { id: 'c', text: 'Avoid NPEs', correct: false, rationale: '@Override doesn\'t prevent null pointer exceptions.' },
                { id: 'd', text: 'Allocate memory', correct: false, rationale: '@Override doesn\'t affect memory allocation.' }
              ]
            }
          ]
        },
        {
          id: 'u2-4',
          title: 'What is a class? (state and behavior)',
          description: 'Understand classes as blueprints that define state and behavior',
          content: {
            keyPoints: [
              'A class is a blueprint. It defines: State (the data each object stores) and Behavior (the actions the object can do).',
              'State: the data each object stores (its "fields" or "instance variables").',
              'Behavior: the actions the object can do (its "methods").'
            ],
            codeExample: {
              language: 'java',
              code: `class Course {
  private String title;   // state (field)
  private int credits;    // state (field)
  
  // Constructor - behavior to build the object
  Course(String t, int c) { 
    title = t; 
    credits = c; 
  }
  
  // Method - behavior to use the object
  int getCredits() { 
    return credits; 
  }
  
  String getTitle() {
    return title;
  }
}

// Using the class
Course cs201 = new Course("Data Structures", 4);
System.out.println(cs201.getTitle());    // "Data Structures"
System.out.println(cs201.getCredits());  // 4`,
              caption: 'A class defines state (fields) and behavior (methods)'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Create a Book class with title and author fields',
                'Add a constructor to initialize the book',
                'Add methods to get the title and author',
                'Create a Book object and print its title'
              ]
            }
          ],
          quiz: [
            {
              id: 'q2_4_1',
              prompt: 'Q1. A class is best described as:',
              choices: [
                { id: 'a', text: 'A running program', correct: false, rationale: 'A program runs from main, not from a class definition.' },
                { id: 'b', text: 'A blueprint defining state and behavior for objects', correct: true, rationale: 'A class specifies what data objects store and what they can do.' },
                { id: 'c', text: 'A single primitive', correct: false, rationale: 'Classes define complex objects, not primitives.' },
                { id: 'd', text: 'A package', correct: false, rationale: 'A package groups classes, it\'s not a class itself.' }
              ]
            },
            {
              id: 'q2_4_2',
              prompt: 'Q2. An object is:',
              choices: [
                { id: 'a', text: 'A file path', correct: false, rationale: 'File paths are strings, not objects in the OOP sense.' },
                { id: 'b', text: 'An instance created from a class', correct: true, rationale: 'Objects are concrete instances created from a class blueprint.' },
                { id: 'c', text: 'A primitive', correct: false, rationale: 'Primitives are not objects.' },
                { id: 'd', text: 'A static method', correct: false, rationale: 'Static methods belong to classes, not individual objects.' }
              ]
            },
            {
              id: 'q2_4_3',
              prompt: 'Q3. Fields are typically marked private mainly to:',
              choices: [
                { id: 'a', text: 'Save memory', correct: false, rationale: 'Access modifiers don\'t affect memory usage.' },
                { id: 'b', text: 'Enforce encapsulation and control access', correct: true, rationale: 'Private fields hide implementation details and control how data is accessed.' },
                { id: 'c', text: 'Enable recursion', correct: false, rationale: 'Recursion doesn\'t depend on access modifiers.' },
                { id: 'd', text: 'Allow ==', correct: false, rationale: '== works regardless of access modifiers.' }
              ]
            },
            {
              id: 'q2_4_4',
              prompt: 'Q4. Which call references object methods, not class (static) methods?',
              choices: [
                { id: 'a', text: 'Math.sqrt(25)', correct: false, rationale: 'This is a static method call on the Math class.' },
                { id: 'b', text: 'str.length()', correct: true, rationale: 'This calls an instance method on the str object.' },
                { id: 'c', text: 'Integer.parseInt("7")', correct: false, rationale: 'This is a static method call on the Integer class.' },
                { id: 'd', text: 'Collections.sort(list)', correct: false, rationale: 'This is a static method call on the Collections class.' }
              ]
            },
            {
              id: 'q2_4_5',
              prompt: 'Q5. The new object\'s fields should be initialized in:',
              choices: [
                { id: 'a', text: 'main', correct: false, rationale: 'main is the program entry point, not where objects are initialized.' },
                { id: 'b', text: 'A constructor', correct: true, rationale: 'Constructors initialize new objects\' fields.' },
                { id: 'c', text: 'toString', correct: false, rationale: 'toString returns a string representation, it doesn\'t initialize.' },
                { id: 'd', text: 'A comment', correct: false, rationale: 'Comments don\'t execute code.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 2 — Temperature Converter',
        spec: ['Create a Temperature class with Celsius and Fahrenheit conversion methods.'],
        tasks: [
          'Create a Temperature class with a double field for Celsius',
          'Add methods toFahrenheit() and toString()',
          'Create a TemperatureConverter class with static conversion methods',
          'Test with multiple temperature values'
        ],
        extension: ['Add Kelvin support and validation for absolute zero']
      },
      finalProject: {
        title: 'Mini-Project 2 — Student Grade Calculator',
        spec: ['Build a Student class that tracks grades and calculates GPA.'],
        focus: ['Understanding objects, state, and methods working together']
      },
      checklist: [
        'Explain the difference between primitives and objects',
        'Use == and .equals() correctly',
        'Create a class with fields and methods',
        'Understand what references are and how they work'
      ]
    },
    {
      unitId: 'u3',
      unitNumber: 3,
      title: 'Classes, Objects, and Project P0: Person201',
      overview: [
        'Build your first real project: Person201.',
        'Learn encapsulation and immutability principles.',
        'Master constructors and the toString() method.',
        'Understand the Hollywood Principle: "Don\'t call us, we\'ll call you."',
        'Set up your development workflow properly.'
      ],
      subUnits: [
        {
          id: 'u3-1',
          title: 'What you\'ll actually build (and why)',
          description: 'Overview of the Person201 project and its learning goals',
          content: {
            keyPoints: [
              'You\'ll read person data (name, latitude, longitude, favorite eatery) from files or URLs (Uniform Resource Locators).',
              'Construct Person201 objects and print or analyze them.',
              'This gives you practice with files, the network, and object design while keeping the data small and relatable.',
              'Example scenario: Read a CSV (Comma-Separated Values) line: "Ava,36.01,-78.92,Ginger&Soy"',
              'Build a Person201("Ava", 36.01, -78.92, "Ginger&Soy")',
              'Later you can compute distances, filter by eatery, or map people on a simple plot.'
            ],
          },
          practice: [
            {
              title: 'Planning',
              problems: [
                'What fields does a Person201 object need?',
                'What methods should Person201 have?',
                'How would you calculate distance between two Person201 objects?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_1_1',
              prompt: 'What is the purpose of the Person201 project?',
              choices: [
                { id: 'a', text: 'To learn advanced algorithms', correct: false, rationale: 'This project focuses on object-oriented fundamentals, not algorithms.' },
                { id: 'b', text: 'To practice with files, objects, and encapsulation', correct: true, rationale: 'Person201 teaches you to work with real data while applying OOP principles.' },
                { id: 'c', text: 'To build a social network', correct: false, rationale: 'It\'s a simpler project focused on learning fundamentals.' }
              ]
            }
          ]
        },
        {
          id: 'u3-2',
          title: 'Encapsulation and immutability',
          description: 'Learn to hide implementation details and make objects unchangeable',
          content: {
            keyPoints: [
              'Encapsulation: hide internal details. Keep fields private, and access them with methods like name() or getName().',
              'This prevents accidental corruption of data.',
              'Immutability: an object never changes after creation.',
              'If you "change" a person\'s eatery, you actually create a new person with the updated value.',
              'This makes debugging easier because objects don\'t silently change.'
            ],
            codeExample: {
              language: 'java',
              code: `Person201 p = new Person201("Ava", 36.01, -78.92, "Ginger&Soy");
String n = p.name();    // read-only access

// To "change" (actually create a new object):
Person201 p2 = new Person201("Ava", 36.01, -78.92, "Sazon");

// The original p is unchanged
System.out.println(p.eatery());   // still "Ginger&Soy"
System.out.println(p2.eatery());  // "Sazon"`,
              caption: 'Encapsulation and immutability in practice'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Why should fields be private?',
                'What does immutability mean?',
                'How do you "change" an immutable object?',
                'What are the benefits of immutability?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_2_1',
              prompt: 'Q1. If Person201 is immutable, changing the favorite eatery requires:',
              choices: [
                { id: 'a', text: 'p.setEatery("X")', correct: false, rationale: 'Immutable objects don\'t have setters.' },
                { id: 'b', text: 'Reassigning fields directly', correct: false, rationale: 'Fields are private and final in immutable objects.' },
                { id: 'c', text: 'Creating a new Person201 with the new eatery', correct: true, rationale: 'Immutable objects cannot be changed; create a new one instead.' },
                { id: 'd', text: 'Using reflection', correct: false, rationale: 'Reflection bypasses encapsulation, but violates immutability principles.' }
              ]
            },
            {
              id: 'q3_2_2',
              prompt: 'Q2. Marking fields private final most directly supports:',
              choices: [
                { id: 'a', text: 'Aliasing', correct: false, rationale: 'private final prevents modification, not aliasing.' },
                { id: 'b', text: 'Immutability', correct: true, rationale: 'private final ensures fields can\'t be changed after initialization.' },
                { id: 'c', text: 'Inheritance only', correct: false, rationale: 'Inheritance isn\'t directly related to private final fields.' },
                { id: 'd', text: 'Casting', correct: false, rationale: 'Casting is about type conversion, not immutability.' }
              ]
            },
            {
              id: 'q3_2_3',
              prompt: 'Q3. Encapsulation means:',
              choices: [
                { id: 'a', text: 'Hiding implementation details and exposing controlled methods', correct: true, rationale: 'Encapsulation hides internal state and provides controlled access.' },
                { id: 'b', text: 'Storing everything in public fields', correct: false, rationale: 'Public fields violate encapsulation.' },
                { id: 'c', text: 'Using only arrays', correct: false, rationale: 'Encapsulation is about access control, not data structures.' },
                { id: 'd', text: 'Disabling methods', correct: false, rationale: 'Encapsulation uses methods to control access.' }
              ]
            },
            {
              id: 'q3_2_4',
              prompt: 'Q4. A getter like name() provides:',
              choices: [
                { id: 'a', text: 'Controlled read access to private state', correct: true, rationale: 'Getters allow reading private fields in a controlled way.' },
                { id: 'b', text: 'Mutation', correct: false, rationale: 'Getters read, they don\'t mutate.' },
                { id: 'c', text: 'Static access', correct: false, rationale: 'Getters are instance methods, not static.' },
                { id: 'd', text: 'Memory layout info', correct: false, rationale: 'Getters return values, not memory information.' }
              ]
            },
            {
              id: 'q3_2_5',
              prompt: 'Q5. Immutability often improves:',
              choices: [
                { id: 'a', text: 'Garbage collector errors', correct: false, rationale: 'Immutability doesn\'t cause or fix GC errors.' },
                { id: 'b', text: 'Reasoning/debugging by preventing hidden state changes', correct: true, rationale: 'Immutable objects are easier to reason about since they never change.' },
                { id: 'c', text: 'Stack overflow', correct: false, rationale: 'Immutability doesn\'t prevent stack overflow.' },
                { id: 'd', text: 'Loop syntax', correct: false, rationale: 'Immutability doesn\'t affect loop syntax.' }
              ]
            }
          ]
        },
        {
          id: 'u3-3',
          title: 'Constructors (how objects are born)',
          description: 'Learn how constructors initialize object state',
          content: {
            keyPoints: [
              'A constructor has the same name as the class and no return type.',
              'It sets up all fields so the object starts life valid.',
              'Use final keyword to support immutability.'
            ],
            codeExample: {
              language: 'java',
              code: `class Person201 {
  private final String name;  // final supports immutability
  private final double lat, lon;
  private final String eatery;
  
  // Constructor
  Person201(String n, double la, double lo, String e) {
    name = n;
    lat = la;
    lon = lo;
    eatery = e;
  }
  
  // Accessor methods
  String name() { return name; }
  double lat() { return lat; }
  double lon() { return lon; }
  String eatery() { return eatery; }
}`,
              caption: 'A Person201 constructor initializing all fields'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Write a constructor for a Book class with title, author, and year',
                'What does the final keyword do?',
                'Why is it good to initialize all fields in the constructor?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_3_1',
              prompt: 'Q1. A constructor in Java:',
              choices: [
                { id: 'a', text: 'Has the same name as the class and no return type', correct: true, rationale: 'Constructors match the class name and have no return type.' },
                { id: 'b', text: 'Must return the object', correct: false, rationale: 'Constructors implicitly return the new object; you don\'t write return.' },
                { id: 'c', text: 'Can be called without new', correct: false, rationale: 'Constructors are invoked via new.' },
                { id: 'd', text: 'Is optional for all classes', correct: false, rationale: 'If you don\'t define one, Java provides a default constructor.' }
              ]
            },
            {
              id: 'q3_3_2',
              prompt: 'Q2. Which is most correct for initializing required fields?',
              choices: [
                { id: 'a', text: 'Assign in toString()', correct: false, rationale: 'toString() is for string representation, not initialization.' },
                { id: 'b', text: 'Assign in the constructor', correct: true, rationale: 'Constructors are the proper place to initialize object fields.' },
                { id: 'c', text: 'Assign in equals()', correct: false, rationale: 'equals() is for comparison, not initialization.' },
                { id: 'd', text: 'Assign in comments', correct: false, rationale: 'Comments don\'t execute.' }
              ]
            },
            {
              id: 'q3_3_3',
              prompt: 'Q3. If you define no constructors, Java:',
              choices: [
                { id: 'a', text: 'Fails to compile', correct: false, rationale: 'Java generates a default constructor for you.' },
                { id: 'b', text: 'Generates a default no-arg constructor', correct: true, rationale: 'Java provides a no-argument constructor if you don\'t define any.' },
                { id: 'c', text: 'Generates a full-arg constructor', correct: false, rationale: 'Java only generates a no-arg constructor.' },
                { id: 'd', text: 'Calls main instead', correct: false, rationale: 'main is separate from constructors.' }
              ]
            },
            {
              id: 'q3_3_4',
              prompt: 'Q4. Overloaded constructors primarily allow you to:',
              choices: [
                { id: 'a', text: 'Use different parameter lists for different ways to build valid objects', correct: true, rationale: 'Overloading lets you provide multiple ways to construct objects.' },
                { id: 'b', text: 'Speed up loops', correct: false, rationale: 'Overloading doesn\'t affect loop performance.' },
                { id: 'c', text: 'Avoid equals', correct: false, rationale: 'Overloading is unrelated to equals().' },
                { id: 'd', text: 'Bypass new', correct: false, rationale: 'You still need new to invoke any constructor.' }
              ]
            }
          ]
        },
        {
          id: 'u3-4',
          title: 'Printing objects nicely: toString() and the Hollywood Principle',
          description: 'Learn how Java automatically calls toString() when printing',
          content: {
            keyPoints: [
              'Override toString() to describe your object.',
              'Java will automatically call toString() when you print an object.',
              'This is the Hollywood Principle: "Don\'t call us, we\'ll call you."',
              'The framework (Java\'s print system) calls your toString() method.'
            ],
            codeExample: {
              language: 'java',
              code: `class Person201 {
  // ... fields and constructor ...
  
  public String toString() {
    return name + " @(" + lat + "," + lon + ") likes " + eatery;
  }
}

// Java automatically calls toString()
Person201 p = new Person201("Ava", 36.01, -78.92, "Ginger&Soy");
System.out.println(p);  
// Prints: Ava @(36.01,-78.92) likes Ginger&Soy`,
              caption: 'toString() provides a nice string representation'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Write a toString() method for a Book class',
                'What is the Hollywood Principle?',
                'When does Java call toString()?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_4_1',
              prompt: 'Q1. System.out.println(obj) typically prints meaningful text because:',
              choices: [
                { id: 'a', text: 'Java reads private fields directly', correct: false, rationale: 'Private fields are encapsulated; Java doesn\'t bypass that.' },
                { id: 'b', text: 'Java automatically calls obj.toString()', correct: true, rationale: 'println invokes toString() on the object for you.' },
                { id: 'c', text: 'The compiler inlines strings', correct: false, rationale: 'Inlining is an optimization, not why println works.' },
                { id: 'd', text: 'println ignores objects', correct: false, rationale: 'println explicitly handles objects via toString().' }
              ]
            },
            {
              id: 'q3_4_2',
              prompt: 'Q2. "Don\'t call us, we\'ll call you" refers to:',
              choices: [
                { id: 'a', text: 'Recursion', correct: false, rationale: 'Recursion is self-calling, not the Hollywood Principle.' },
                { id: 'b', text: 'The Hollywood Principle—frameworks (like println) call your hooks (e.g., toString)', correct: true, rationale: 'You define toString(), and the framework calls it.' },
                { id: 'c', text: 'main calling JVM', correct: false, rationale: 'JVM calls main, not the other way around.' },
                { id: 'd', text: 'Autoboxing', correct: false, rationale: 'Autoboxing is about type conversion, not framework callbacks.' }
              ]
            }
          ]
        },
        {
          id: 'u3-5',
          title: 'Your workflow (so the tooling doesn\'t get in your way)',
          description: 'Set up your development environment and version control',
          content: {
            keyPoints: [
              'Project layout: src/ for code, data/ for input files, lib/ for libraries.',
              'Git for version control: commit small changes often; push to back up your work.',
              'Gradescope for submissions: export or push as required; run tests there when available.',
              'Keep your workspace organized to avoid confusion.'
            ],
          },
          practice: [
            {
              title: 'Setup',
              problems: [
                'Create a src/ directory for your Person201 code',
                'Initialize a git repository',
                'Make your first commit with a descriptive message',
                'Create a data/ folder for CSV files'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_5_1',
              prompt: 'Q1. Typical 201 project layout uses:',
              choices: [
                { id: 'a', text: 'src/ for code, data/ for inputs, lib/ for JARs', correct: true, rationale: 'Standard Java project structure separates source, data, and libraries.' },
                { id: 'b', text: 'bin/ only', correct: false, rationale: 'bin/ is for compiled output, not source code.' },
                { id: 'c', text: 'Random folders', correct: false, rationale: 'Organized structure is essential for maintainability.' },
                { id: 'd', text: 'assets/ only', correct: false, rationale: 'assets/ might hold resources but not source code.' }
              ]
            },
            {
              id: 'q3_5_2',
              prompt: 'Q2. Best practice with Git is to:',
              choices: [
                { id: 'a', text: 'Commit rarely with huge diffs', correct: false, rationale: 'Large commits are hard to review and debug.' },
                { id: 'b', text: 'Commit small, incremental changes frequently', correct: true, rationale: 'Frequent small commits make it easy to track progress and undo mistakes.' },
                { id: 'c', text: 'Never write commit messages', correct: false, rationale: 'Commit messages are essential for understanding history.' },
                { id: 'd', text: 'Push only at the end', correct: false, rationale: 'Regular pushes back up your work and enable collaboration.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 3 — Person201 Implementation',
        spec: ['Build the complete Person201 class with all required methods.'],
        tasks: [
          'Create Person201 with name, lat, lon, eatery fields',
          'Implement constructor and accessor methods',
          'Override toString()',
          'Read CSV data and create Person201 objects',
          'Calculate distances between people'
        ],
        extension: ['Add methods to find the nearest person to a given location']
      },
      finalProject: {
        title: 'Project P0 — Person201 Data Analysis',
        spec: ['Read person data from files/URLs and analyze it.'],
        focus: ['File I/O, object creation, and data processing']
      },
      checklist: [
        'Build a Person201 class with proper encapsulation',
        'Implement immutability using final fields',
        'Write a clear toString() method',
        'Set up project structure (src/, data/)',
        'Use git to track your work'
      ]
    },
    {
      unitId: 'u4',
      unitNumber: 4,
      title: 'Arrays, ArrayLists, Sets, and "no duplicates" patterns',
      overview: [
        'Understand when to use arrays vs ArrayList.',
        'Master Set to eliminate duplicates effortlessly.',
        'Learn reusable patterns for APTs (Applied Practice Tasks).',
        'Write clean code with private helper methods.'
      ],
      subUnits: [
        {
          id: 'u4-1',
          title: 'Arrays vs. ArrayList: how to choose',
          description: 'Learn the differences and when to use each collection type',
          content: {
            keyPoints: [
              'Array: fixed size (you decide the length when you create it). Fast random access.',
              'ArrayList: grows as needed with .add, .remove, .size. Also fast random access and much nicer when the size changes while you work.',
              'You know the exact length ahead of time? Use an array.',
              'You\'ll be adding/removing as you go? Use ArrayList.'
            ],
            codeExample: {
              language: 'java',
              code: `// Array: fixed size
String[] a = new String[3];  // exactly 3 slots
a[0] = "duke";
a[1] = "blue";
a[2] = "devils";
System.out.println(a.length);  // 3

// ArrayList: dynamic size
ArrayList<String> list = new ArrayList<>();
list.add("duke");       // grows automatically
list.add("blue");
list.add("devils");
System.out.println(list.size());  // 3

// You can keep adding
list.add("basketball");
System.out.println(list.size());  // 4`,
              caption: 'Arrays have fixed size, ArrayLists grow dynamically'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'When should you use an array instead of ArrayList?',
                'Create an ArrayList of integers and add 5 numbers',
                'What method do you use to get the size of an ArrayList?',
                'Can you change the size of an array after creation?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q4_1_1',
              prompt: 'Q1. Arrays are best when you:',
              choices: [
                { id: 'a', text: 'Don\'t know the size up front', correct: false, rationale: 'Use ArrayList when size is unknown.' },
                { id: 'b', text: 'Need a fixed size and fast random access', correct: true, rationale: 'Arrays have fixed size with O(1) access.' },
                { id: 'c', text: 'Need hashing', correct: false, rationale: 'Hashing is provided by HashSet/HashMap, not arrays.' },
                { id: 'd', text: 'Want automatic deduplication', correct: false, rationale: 'Use Set for deduplication.' }
              ]
            },
            {
              id: 'q4_1_2',
              prompt: 'Q2. new String[3] creates:',
              choices: [
                { id: 'a', text: 'Three empty strings', correct: false, rationale: 'Arrays of objects are initialized with null.' },
                { id: 'b', text: 'An array with three null references', correct: true, rationale: 'Object arrays start with null in each slot.' },
                { id: 'c', text: 'An ArrayList<String> of size 3', correct: false, rationale: 'This creates an array, not an ArrayList.' },
                { id: 'd', text: 'A HashSet<String>', correct: false, rationale: 'This is an array, not a Set.' }
              ]
            },
            {
              id: 'q4_1_3',
              prompt: 'Q3. ArrayList<String> list = new ArrayList<>(); list.add("x"); results in:',
              choices: [
                { id: 'a', text: 'Compile error', correct: false, rationale: 'This is valid Java code.' },
                { id: 'b', text: 'A resizable list with size 1', correct: true, rationale: 'ArrayList starts empty and grows as you add elements.' },
                { id: 'c', text: 'A fixed array', correct: false, rationale: 'ArrayList is dynamic, not fixed.' },
                { id: 'd', text: 'A set', correct: false, rationale: 'This creates a list, not a set.' }
              ]
            },
            {
              id: 'q4_1_4',
              prompt: 'Q4. Random access complexity for arrays and ArrayList is typically:',
              choices: [
                { id: 'a', text: 'O(1) for both', correct: true, rationale: 'Both support constant-time indexing.' },
                { id: 'b', text: 'O(n) for both', correct: false, rationale: 'Access is O(1), not O(n).' },
                { id: 'c', text: 'O(log n) for both', correct: false, rationale: 'Access is O(1), not O(log n).' },
                { id: 'd', text: 'Undefined', correct: false, rationale: 'Both have well-defined O(1) access.' }
              ]
            },
            {
              id: 'q4_1_5',
              prompt: 'Q5. Inserting in the middle of an ArrayList generally costs:',
              choices: [
                { id: 'a', text: 'O(1)', correct: false, rationale: 'Elements must be shifted.' },
                { id: 'b', text: 'O(log n)', correct: false, rationale: 'Insertion requires shifting, which is O(n).' },
                { id: 'c', text: 'O(n) (due to shifting)', correct: true, rationale: 'Inserting in the middle requires shifting subsequent elements.' },
                { id: 'd', text: 'O(n²)', correct: false, rationale: 'Shifting is O(n), not quadratic.' }
              ]
            },
            {
              id: 'q4_1_6',
              prompt: 'Q6. Which allocates a new independent copy of a list?',
              choices: [
                { id: 'a', text: 'b = a', correct: false, rationale: 'This creates an alias, not a copy.' },
                { id: 'b', text: 'b = new ArrayList<>(a)', correct: true, rationale: 'This constructor creates a new list with a\'s contents.' },
                { id: 'c', text: 'b = Arrays.asList(a)', correct: false, rationale: 'asList returns a fixed-size list backed by the array.' },
                { id: 'd', text: 'b = null', correct: false, rationale: 'This doesn\'t create a copy.' }
              ]
            },
            {
              id: 'q4_1_7',
              prompt: 'Q7. Accessing arr[5] when arr.length == 5 causes:',
              choices: [
                { id: 'a', text: '0', correct: false, rationale: 'Valid indices are 0-4; 5 is out of bounds.' },
                { id: 'b', text: 'Last element', correct: false, rationale: 'The last element is at arr[4].' },
                { id: 'c', text: 'ArrayIndexOutOfBoundsException', correct: true, rationale: 'Index 5 is beyond the array bounds.' },
                { id: 'd', text: 'Wrap-around', correct: false, rationale: 'Java doesn\'t wrap array indices.' }
              ]
            }
          ]
        },
        {
          id: 'u4-2',
          title: 'Set: the simplest way to eliminate duplicates',
          description: 'Use HashSet to automatically handle uniqueness',
          content: {
            keyPoints: [
              'A Set is like a bag that refuses repeated items.',
              'If you put "Ava" in a HashSet three times, it keeps just one.',
              'Sets turn "don\'t double-count" problems into a one-liner: put everything in a set, then process the set.',
              'Use .contains() to check membership, .add() to insert, .size() for count.'
            ],
            codeExample: {
              language: 'java',
              code: `HashSet<String> seen = new HashSet<>();
seen.add("Ava");
seen.add("Ava");  // silently ignored; still just one "Ava"
seen.add("Ben");
System.out.println(seen.size());  // 2, not 3

System.out.println(seen.contains("Ava"));  // true
System.out.println(seen.contains("Chris"));  // false

// Convert to ArrayList if you need indexed access
ArrayList<String> list = new ArrayList<>(seen);`,
              caption: 'HashSet automatically eliminates duplicates'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Create a HashSet of strings and add some duplicate values',
                'How many items are in the set after adding duplicates?',
                'Write code to count unique words in a list',
                'When should you use a Set instead of a List?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q4_2_1',
              prompt: 'Q1. A HashSet<String> will contain how many "duke" after adding it three times?',
              choices: [
                { id: 'a', text: '0', correct: false, rationale: 'The first add succeeds.' },
                { id: 'b', text: '1', correct: true, rationale: 'Sets automatically eliminate duplicates.' },
                { id: 'c', text: '2', correct: false, rationale: 'All duplicates are ignored, leaving only one.' },
                { id: 'd', text: '3', correct: false, rationale: 'Sets don\'t store duplicates.' }
              ]
            },
            {
              id: 'q4_2_2',
              prompt: 'Q2. Fast membership tests are the hallmark of:',
              choices: [
                { id: 'a', text: 'ArrayList', correct: false, rationale: 'ArrayList.contains() is O(n).' },
                { id: 'b', text: 'HashSet', correct: true, rationale: 'HashSet.contains() is O(1) average.' },
                { id: 'c', text: 'Arrays only', correct: false, rationale: 'Arrays require O(n) search.' },
                { id: 'd', text: 'StringBuilder', correct: false, rationale: 'StringBuilder is for building strings, not membership tests.' }
              ]
            },
            {
              id: 'q4_2_3',
              prompt: 'Q3. Which removes duplicates while preserving no particular order?',
              choices: [
                { id: 'a', text: 'new ArrayList<>(list)', correct: false, rationale: 'This copies the list, including duplicates.' },
                { id: 'b', text: 'new HashSet<>(list)', correct: true, rationale: 'HashSet removes duplicates but doesn\'t preserve order.' },
                { id: 'c', text: 'Collections.reverse(list)', correct: false, rationale: 'Reversing doesn\'t remove duplicates.' },
                { id: 'd', text: 'list.subList(… )', correct: false, rationale: 'subList returns a slice, not deduped data.' }
              ]
            },
            {
              id: 'q4_2_4',
              prompt: 'Q4. set.add(x) returns false when:',
              choices: [
                { id: 'a', text: 'x was already present', correct: true, rationale: 'add() returns false if the element was already in the set.' },
                { id: 'b', text: 'x is null', correct: false, rationale: 'HashSet allows null (though only one null).' },
                { id: 'c', text: 'Set is full', correct: false, rationale: 'HashSet grows dynamically.' },
                { id: 'd', text: 'Type is wrong', correct: false, rationale: 'Type mismatch causes a compile error, not a false return.' }
              ]
            },
            {
              id: 'q4_2_5',
              prompt: 'Q5. If equals and hashCode are inconsistent on a key type, a HashSet can:',
              choices: [
                { id: 'a', text: 'Work faster', correct: false, rationale: 'Inconsistency causes bugs, not speed.' },
                { id: 'b', text: 'Lose elements or allow duplicates', correct: true, rationale: 'HashSet relies on consistent equals() and hashCode().' },
                { id: 'c', text: 'Auto-fix it', correct: false, rationale: 'Java doesn\'t automatically fix inconsistent implementations.' },
                { id: 'd', text: 'Throw always', correct: false, rationale: 'Inconsistency causes silent bugs, not exceptions.' }
              ]
            },
            {
              id: 'q4_2_6',
              prompt: 'Q6. Best explanation of different sizes in values().size() vs new HashSet<>(values()).size() on a Map:',
              choices: [
                { id: 'a', text: 'Hashing bug', correct: false, rationale: 'This is expected behavior, not a bug.' },
                { id: 'b', text: 'Duplicated values collapse in the set', correct: true, rationale: 'A map can have duplicate values for different keys; a set removes duplicates.' },
                { id: 'c', text: 'Compiler bug', correct: false, rationale: 'This is correct Java behavior.' },
                { id: 'd', text: 'Network issue', correct: false, rationale: 'This is about data structures, not networking.' }
              ]
            },
            {
              id: 'q4_2_7',
              prompt: 'Q7. Converting a large list to a set and back is often:',
              choices: [
                { id: 'a', text: 'A concise dedup pattern', correct: true, rationale: 'This idiom removes duplicates efficiently.' },
                { id: 'b', text: 'Slower than O(n³)', correct: false, rationale: 'This is O(n), not cubic.' },
                { id: 'c', text: 'Illegal in Java', correct: false, rationale: 'This is valid and common Java code.' },
                { id: 'd', text: 'Only for primitives', correct: false, rationale: 'Works with any objects that implement equals/hashCode.' }
              ]
            }
          ]
        },
        {
          id: 'u4-3',
          title: 'Patterns you\'ll reuse on many APTs',
          description: 'Learn common patterns for handling duplicates in collections',
          content: {
            keyPoints: [
              'Pattern 1: Process only the first time you see an item (use Set.add() which returns false if already present).',
              'Pattern 2: Skip duplicates by looking backwards in a list.',
              'These patterns appear in many programming tasks and interviews.'
            ],
            codeExample: {
              language: 'java',
              code: `// Pattern 1: Process first occurrence only
ArrayList<String> out = new ArrayList<>();
HashSet<String> seen = new HashSet<>();
for (String w : words) {
  if (seen.add(w)) {  // add returns false if already present
    out.add(w);
  }
}

// Pattern 2: Skip consecutive duplicates
ArrayList<String> result = new ArrayList<>();
for (int i = 0; i < words.size(); i++) {
  if (i == 0 || !words.get(i).equals(words.get(i-1))) {
    result.add(words.get(i));
  }
}`,
              caption: 'Two common patterns for handling duplicates'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Given [1, 2, 2, 3, 1], write code to get [1, 2, 3] (first occurrence)',
                'Given [1, 1, 2, 2, 3], write code to get [1, 2, 3] (consecutive removal)',
                'When would you use each pattern?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q4_3_1',
              prompt: 'Q1. To keep only the first occurrence in order, the simplest code uses:',
              choices: [
                { id: 'a', text: 'HashSet + check add return value to gate an output list', correct: true, rationale: 'Check if add() returns true, then add to output list.' },
                { id: 'b', text: 'Sort then unique', correct: false, rationale: 'Sorting changes order and is more complex.' },
                { id: 'c', text: 'Randomize then filter', correct: false, rationale: 'Randomizing loses original order.' },
                { id: 'd', text: 'Nested loops only', correct: false, rationale: 'Nested loops work but are less efficient and more verbose.' }
              ]
            },
            {
              id: 'q4_3_2',
              prompt: 'Q2. Skipping immediate repeats while scanning a list typically checks:',
              choices: [
                { id: 'a', text: 'i+1 only', correct: false, rationale: 'Looking ahead requires bounds checking at the end.' },
                { id: 'b', text: 'i-1 (previous element) with bounds guard', correct: true, rationale: 'Compare current with previous to detect repeats.' },
                { id: 'c', text: 'First element only', correct: false, rationale: 'Need to check throughout the list.' },
                { id: 'd', text: 'Last element only', correct: false, rationale: 'Need to check throughout the list.' }
              ]
            },
            {
              id: 'q4_3_3',
              prompt: 'Q3. Using a set inside a map to group unique items by key is a pattern for:',
              choices: [
                { id: 'a', text: 'Frequency calculation only', correct: false, rationale: 'Frequency uses counts, not sets.' },
                { id: 'b', text: 'Grouping/aggregation', correct: true, rationale: 'Map<K, Set<V>> groups unique values by key.' },
                { id: 'c', text: 'Sorting', correct: false, rationale: 'Sorting is a different operation.' },
                { id: 'd', text: 'Tokenization', correct: false, rationale: 'Tokenization splits strings, not grouping.' }
              ]
            },
            {
              id: 'q4_3_4',
              prompt: 'Q4. Which structure most naturally counts word frequencies?',
              choices: [
                { id: 'a', text: 'Set<String>', correct: false, rationale: 'Set only tracks presence, not counts.' },
                { id: 'b', text: 'Map<String,Integer>', correct: true, rationale: 'Map word to count for frequency tracking.' },
                { id: 'c', text: 'ArrayList<Integer>', correct: false, rationale: 'List of numbers doesn\'t map words to counts.' },
                { id: 'd', text: 'StringBuilder', correct: false, rationale: 'StringBuilder builds strings, doesn\'t count.' }
              ]
            }
          ]
        },
        {
          id: 'u4-4',
          title: 'Private helper methods keep code readable',
          description: 'Break complex logic into small, testable pieces',
          content: {
            keyPoints: [
              'Break a long method into tiny helpers.',
              'It\'s easier to test and less scary to change.',
              'Each helper does one clear thing.',
              'Good names make code self-documenting.'
            ],
            codeExample: {
              language: 'java',
              code: `private static boolean isVowel(char c) {
  return "aeiouAEIOU".indexOf(c) >= 0;
}

private static String removeVowels(String word) {
  StringBuilder result = new StringBuilder();
  for (char c : word.toCharArray()) {
    if (!isVowel(c)) {
      result.append(c);
    }
  }
  return result.toString();
}

public static String processText(String text) {
  String[] words = text.split(" ");
  ArrayList<String> processed = new ArrayList<>();
  for (String word : words) {
    processed.add(removeVowels(word));
  }
  return String.join(" ", processed);
}`,
              caption: 'Helper methods make code clearer and more testable'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Write a helper method isDigit(char c)',
                'Write a helper method countVowels(String s)',
                'Refactor a long method by extracting helpers',
                'Why are helper methods better than comments?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q4_4_1',
              prompt: 'Q1. The main advantage of small private helpers (e.g., isVowel) is:',
              choices: [
                { id: 'a', text: 'Slower runtime', correct: false, rationale: 'Well-designed helpers don\'t slow down code.' },
                { id: 'b', text: 'Easier testing and readability', correct: true, rationale: 'Small methods are easier to understand, test, and maintain.' },
                { id: 'c', text: 'More memory', correct: false, rationale: 'Helper methods don\'t significantly increase memory usage.' },
                { id: 'd', text: 'Required by Java', correct: false, rationale: 'It\'s a best practice, not a requirement.' }
              ]
            },
            {
              id: 'q4_4_2',
              prompt: 'Q2. A helper should usually be:',
              choices: [
                { id: 'a', text: 'Private, cohesive, with a single job', correct: true, rationale: 'Good helpers are focused, private utilities.' },
                { id: 'b', text: 'Public, do many things', correct: false, rationale: 'Helpers should be focused and encapsulated.' },
                { id: 'c', text: 'Static always', correct: false, rationale: 'Helpers can be instance methods when they need object state.' },
                { id: 'd', text: 'Inlined everywhere', correct: false, rationale: 'Extracting helpers improves readability.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 4 — Word Processor with Sets',
        spec: ['Build a program that processes text and removes duplicates.'],
        tasks: [
          'Read a file of words',
          'Remove duplicate words using a Set',
          'Count unique words',
          'Find words that appear more than once',
          'Output sorted unique words'
        ],
        extension: ['Add frequency counting for each word']
      },
      finalProject: {
        title: 'Mini-Project 4 — Text Analysis Tool',
        spec: ['Analyze text files for duplicate detection and statistics.'],
        focus: ['Collections, Sets, and data processing patterns']
      },
      checklist: [
        'Choose between array and ArrayList appropriately',
        'Use HashSet to eliminate duplicates',
        'Implement the "first occurrence" pattern',
        'Write clean helper methods',
        'Understand when Set.add() returns false'
      ]
    },
    {
      unitId: 'u5',
      unitNumber: 5,
      title: 'Strings, text processing, and first steps toward efficiency',
      overview: [
        'Master the TxMsg text transformation problem.',
        'Learn essential String APIs: split() and join().',
        'Convert between arrays, lists, and sets fluently.',
        'Understand why naive string building can be slow and how to fix it.'
      ],
      subUnits: [
        {
          id: 'u5-1',
          title: 'The TxMsg problem: a strategy that always works',
          description: 'Learn a systematic approach to text transformation',
          content: {
            keyPoints: [
              'TxMsg transforms text into a "text-message style" abbreviation using rules.',
              'A reliable approach: 1) Split the sentence into words, 2) For each word, handle special cases first (like all-vowels), 3) Otherwise, walk the characters and keep consonants according to rules, 4) Join the transformed words back together.',
              'Typical helper: isVowel(char c) returns true if c is a vowel.',
              'General rules live in txWord(), and tiny tests (like isVowel) are easy to trust.',
              'Edge cases ("what about the first letter?") are obvious because you explicitly check indices.'
            ],
            codeExample: {
              language: 'java',
              code: `static boolean isVowel(char c) {
  return "aeiouAEIOU".indexOf(c) >= 0;
}

static String txWord(String word) {
  // Handle all-vowels special case
  boolean allVowels = true;
  for (char c : word.toCharArray()) {
    if (!isVowel(c)) {
      allVowels = false;
      break;
    }
  }
  if (allVowels) return word.substring(0, 1);
  
  // Keep first letter and consonants
  StringBuilder result = new StringBuilder();
  result.append(word.charAt(0));
  for (int i = 1; i < word.length(); i++) {
    if (!isVowel(word.charAt(i))) {
      result.append(word.charAt(i));
    }
  }
  return result.toString();
}

static String txMsg(String line) {
  String[] tokens = line.split(" ");
  ArrayList<String> out = new ArrayList<>();
  for (String w : tokens) {
    out.add(txWord(w));
  }
  return String.join(" ", out);
}`,
              caption: 'A systematic approach to text transformation'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Trace txWord("hello") step by step',
                'What does txWord("aeiou") return?',
                'Write a helper method isConsonant(char c)',
                'Modify txWord to keep every other character'
              ]
            }
          ],
          quiz: [
            {
              id: 'q5_1_1',
              prompt: 'Q1. First step for TxMsg is usually:',
              choices: [
                { id: 'a', text: 'Join tokens', correct: false, rationale: 'Joining happens after transforming words.' },
                { id: 'b', text: 'Replace spaces', correct: false, rationale: 'After splitting, spaces are already handled.' },
                { id: 'c', text: 'split the sentence into words', correct: true, rationale: 'Split first, then process each word individually.' },
                { id: 'd', text: 'Sort words', correct: false, rationale: 'Sorting isn\'t part of the TxMsg strategy.' }
              ]
            },
            {
              id: 'q5_1_2',
              prompt: 'Q2. The all-vowels case is handled:',
              choices: [
                { id: 'a', text: 'Last, never', correct: false, rationale: 'All-vowels needs special handling.' },
                { id: 'b', text: 'As a special case before general consonant rules', correct: true, rationale: 'Special cases must be checked first to avoid empty results.' },
                { id: 'c', text: 'With ==', correct: false, rationale: 'Use .equals() for string comparison, but that\'s not the point here.' },
                { id: 'd', text: 'Only by trimming', correct: false, rationale: 'Trimming removes whitespace, not handling vowel logic.' }
              ]
            },
            {
              id: 'q5_1_3',
              prompt: 'Q3. Checking the previous character (k-1) is helpful to:',
              choices: [
                { id: 'a', text: 'Detect first-character edges', correct: false, rationale: 'At k=0, there is no k-1, so you need bounds checking.' },
                { id: 'b', text: 'Avoid IndexOutOfBounds', correct: false, rationale: 'You need to check k>0 first.' },
                { id: 'c', text: 'Both A and B', correct: true, rationale: 'Checking k-1 helps with edge detection but requires bounds checking.' },
                { id: 'd', text: 'Neither', correct: false, rationale: 'Both A and B are relevant concerns.' }
              ]
            },
            {
              id: 'q5_1_4',
              prompt: 'Q4. Which helper best fits TxMsg?',
              choices: [
                { id: 'a', text: 'boolean isVowel(char c)', correct: true, rationale: 'A focused helper for vowel detection improves readability.' },
                { id: 'b', text: 'void fast()', correct: false, rationale: 'Too vague and doesn\'t match the problem.' },
                { id: 'c', text: 'String[] main(String[] a)', correct: false, rationale: 'main is the entry point, not a helper.' },
                { id: 'd', text: 'double sqrt(double x)', correct: false, rationale: 'Not relevant to text processing.' }
              ]
            },
            {
              id: 'q5_1_5',
              prompt: 'Q5. General rules vs. specials should be implemented:',
              choices: [
                { id: 'a', text: 'Specials first always', correct: false, rationale: 'The order depends on the logic flow.' },
                { id: 'b', text: 'General rules first, then minimal specials', correct: true, rationale: 'Handle the common case, then edge cases.' },
                { id: 'c', text: 'Only specials', correct: false, rationale: 'Both general and special cases are needed.' },
                { id: 'd', text: 'In random order', correct: false, rationale: 'Order matters for correctness.' }
              ]
            },
            {
              id: 'q5_1_6',
              prompt: 'Q6. split + per-word transform + String.join yields:',
              choices: [
                { id: 'a', text: 'A clean, testable pipeline', correct: true, rationale: 'This pattern is clear and easy to test.' },
                { id: 'b', text: 'A recursion tree', correct: false, rationale: 'This is iterative, not recursive.' },
                { id: 'c', text: 'A sorting algorithm', correct: false, rationale: 'This is text transformation, not sorting.' },
                { id: 'd', text: 'A stack overflow', correct: false, rationale: 'This pattern doesn\'t cause stack overflow.' }
              ]
            },
            {
              id: 'q5_1_7',
              prompt: 'Q7. A failing edge case is most likely when:',
              choices: [
                { id: 'a', text: 'Word is empty or length 1', correct: true, rationale: 'Short or empty strings often expose edge case bugs.' },
                { id: 'b', text: 'Word is long', correct: false, rationale: 'Long words are usually handled by general logic.' },
                { id: 'c', text: 'There are many spaces', correct: false, rationale: 'split() handles spaces automatically.' },
                { id: 'd', text: 'Using a set', correct: false, rationale: 'Sets are used for deduplication, not causing edge cases here.' }
              ]
            },
            {
              id: 'q5_1_8',
              prompt: 'Q8. Using helpers improves:',
              choices: [
                { id: 'a', text: 'Mutability', correct: false, rationale: 'Helpers don\'t affect mutability.' },
                { id: 'b', text: 'Readability and unit-testing', correct: true, rationale: 'Small focused helpers are easier to understand and test.' },
                { id: 'c', text: 'Network throughput', correct: false, rationale: 'Helpers don\'t affect network performance.' },
                { id: 'd', text: 'File permissions', correct: false, rationale: 'Helpers don\'t affect file system permissions.' }
              ]
            }
          ]
        },
        {
          id: 'u5-2',
          title: 'Two String APIs you will use constantly',
          description: 'Master split() and join() for text processing',
          content: {
            keyPoints: [
              'split() turns text into pieces: "this is a test".split(" ") → ["this","is","a","test"]',
              'Useful for spaces, commas, or any simple separator.',
              'String.join() stitches pieces back together: String.join(" ", list) → "this is a test"',
              'These two methods are fundamental to text processing.'
            ],
            codeExample: {
              language: 'java',
              code: `// Split on spaces
String text = "hello world from java";
String[] words = text.split(" ");
// words = ["hello", "world", "from", "java"]

// Split on commas (CSV)
String csv = "a,b,c";
String[] parts = csv.split(",");
// parts = ["a", "b", "c"]

// Join with a different separator
ArrayList<String> list = new ArrayList<>(Arrays.asList(parts));
String result = String.join(";", list);
// result = "a;b;c"

// Join words with spaces
String sentence = String.join(" ", words);
// sentence = "hello world from java"`,
              caption: 'split() breaks text apart, join() puts it back together'
            }
          },
          practice: [
            {
              title: 'Mini-exercise',
              problems: [
                'Read a CSV line ("a,b,c"), split on commas, then join with semicolons ("a;b;c")',
                'Split "one-two-three" on dashes and print each part',
                'Take an array of words and join them with " | " as separator'
              ]
            }
          ],
          quiz: [
            {
              id: 'q5_2_1',
              prompt: 'Q1. "a,b,c".split(",") produces:',
              choices: [
                { id: 'a', text: '["a,b,c"]', correct: false, rationale: 'split() divides the string at commas.' },
                { id: 'b', text: '["a","b","c"]', correct: true, rationale: 'split() creates an array with each part.' },
                { id: 'c', text: '["a","b,c"]', correct: false, rationale: 'All commas are split, not just the first.' },
                { id: 'd', text: '[]', correct: false, rationale: 'The string has content, so the array isn\'t empty.' }
              ]
            },
            {
              id: 'q5_2_2',
              prompt: 'Q2. String.join(" ", List.of("this","is","fine")) is:',
              choices: [
                { id: 'a', text: '"this is fine"', correct: true, rationale: 'join() concatenates with the delimiter between elements.' },
                { id: 'b', text: '["this","is","fine"]', correct: false, rationale: 'join() returns a String, not an array.' },
                { id: 'c', text: '"this,is,fine"', correct: false, rationale: 'The delimiter is a space, not a comma.' },
                { id: 'd', text: '"this is fine" (two spaces)', correct: false, rationale: 'Only one space is inserted between words.' }
              ]
            },
            {
              id: 'q5_2_3',
              prompt: 'Q3. Splitting on space will not separate:',
              choices: [
                { id: 'a', text: '"a b"', correct: false, rationale: 'Single spaces are split correctly.' },
                { id: 'b', text: '"a b" (multiple spaces) — unless using regex "\\\\s+"', correct: false, rationale: 'Multiple spaces create empty strings without regex.' },
                { id: 'c', text: '"a\\tb" (tab) — unless using \\\\s', correct: false, rationale: 'Tabs aren\'t spaces without \\\\s.' },
                { id: 'd', text: 'Both B and C (depending on pattern)', correct: true, rationale: 'Plain " " doesn\'t handle tabs or multiple spaces well.' }
              ]
            },
            {
              id: 'q5_2_4',
              prompt: 'Q4. Which pair converts CSV to semicolon-separated?',
              choices: [
                { id: 'a', text: 'split(",") → join(",")', correct: false, rationale: 'This keeps commas.' },
                { id: 'b', text: 'split(";") → join(",")', correct: false, rationale: 'This goes the wrong direction.' },
                { id: 'c', text: 'split(",") → join(";")', correct: true, rationale: 'Split on comma, rejoin with semicolon.' },
                { id: 'd', text: 'split(" ") → join("")', correct: false, rationale: 'This handles spaces, not commas.' }
              ]
            },
            {
              id: 'q5_2_5',
              prompt: 'Q5. Arrays.asList(arr) returns:',
              choices: [
                { id: 'a', text: 'A fixed-size list backed by the array', correct: true, rationale: 'Changes to the list affect the array.' },
                { id: 'b', text: 'A resizable ArrayList', correct: false, rationale: 'asList returns a fixed-size view.' },
                { id: 'c', text: 'A HashSet', correct: false, rationale: 'asList returns a List, not a Set.' },
                { id: 'd', text: 'A deep copy', correct: false, rationale: 'asList doesn\'t copy; it wraps the array.' }
              ]
            },
            {
              id: 'q5_2_6',
              prompt: 'Q6. Building a sentence from many pieces is best done using:',
              choices: [
                { id: 'a', text: 'StringBuilder or join', correct: true, rationale: 'Both are efficient for building strings.' },
                { id: 'b', text: 'Repeated + in a tight loop', correct: false, rationale: 'Repeated + is inefficient due to immutability.' },
                { id: 'c', text: 'System.gc()', correct: false, rationale: 'Garbage collection doesn\'t help build strings.' },
                { id: 'd', text: 'Casting to char[]', correct: false, rationale: 'This is low-level and less convenient.' }
              ]
            },
            {
              id: 'q5_2_7',
              prompt: 'Q7. String in Java is:',
              choices: [
                { id: 'a', text: 'Mutable', correct: false, rationale: 'String is immutable.' },
                { id: 'b', text: 'Immutable', correct: true, rationale: 'Strings never change; operations return new strings.' },
                { id: 'c', text: 'A primitive', correct: false, rationale: 'String is a class, not a primitive.' },
                { id: 'd', text: 'A package', correct: false, rationale: 'String is a class in the java.lang package.' }
              ]
            }
          ]
        },
        {
          id: 'u5-3',
          title: 'Moving between arrays, lists, and sets',
          description: 'Fluently convert between collection types',
          content: {
            keyPoints: [
              'You\'ll often convert types to use the best tool for each step.',
              'Array → List: new ArrayList<>(Arrays.asList(arr))',
              'List → Set: new HashSet<>(list)',
              'Set → List: new ArrayList<>(set)',
              'Understanding these conversions makes you flexible with data.'
            ],
            codeExample: {
              language: 'java',
              code: `// Start with an array
String[] arr = {"a", "b", "a"};

// Convert to List
ArrayList<String> list = new ArrayList<>(Arrays.asList(arr));

// Convert to Set (removes duplicates)
HashSet<String> uniq = new HashSet<>(list);
// uniq contains only "a" and "b"

// Convert back to List if needed
ArrayList<String> back = new ArrayList<>(uniq);

// For arrays, you can also use toArray()
String[] newArr = back.toArray(new String[0]);`,
              caption: 'Converting between arrays, lists, and sets'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Given String[] words = {"cat", "dog", "cat"}, create a HashSet and print unique words',
                'Convert that HashSet back to an ArrayList',
                'Why would you convert a List to a Set and back to a List?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q5_3_1',
              prompt: 'Q1. Remove duplicates from an array arr most concisely by:',
              choices: [
                { id: 'a', text: 'new HashSet<>(Arrays.asList(arr))', correct: true, rationale: 'Convert to list, then to set to remove duplicates.' },
                { id: 'b', text: 'Sorting only', correct: false, rationale: 'Sorting doesn\'t remove duplicates.' },
                { id: 'c', text: 'For-loops only', correct: false, rationale: 'For-loops work but are more verbose.' },
                { id: 'd', text: 'arr.clear()', correct: false, rationale: 'clear() removes all elements, not just duplicates.' }
              ]
            },
            {
              id: 'q5_3_2',
              prompt: 'Q2. Preserving insertion order while deduping is easiest with:',
              choices: [
                { id: 'a', text: 'HashSet', correct: false, rationale: 'HashSet doesn\'t preserve order.' },
                { id: 'b', text: 'LinkedHashSet', correct: true, rationale: 'LinkedHashSet maintains insertion order.' },
                { id: 'c', text: 'TreeSet', correct: false, rationale: 'TreeSet sorts elements, not preserving insertion order.' },
                { id: 'd', text: 'ArrayList', correct: false, rationale: 'ArrayList doesn\'t automatically remove duplicates.' }
              ]
            },
            {
              id: 'q5_3_3',
              prompt: 'Q3. Converting a Set<String> back to a list:',
              choices: [
                { id: 'a', text: 'new ArrayList<>(set)', correct: true, rationale: 'ArrayList constructor accepts a collection.' },
                { id: 'b', text: 'Arrays.asList(set)', correct: false, rationale: 'asList takes an array, not a Set.' },
                { id: 'c', text: 'set.toArrayList()', correct: false, rationale: 'No such method exists.' },
                { id: 'd', text: 'List.copyOfArray(set)', correct: false, rationale: 'No such method exists.' }
              ]
            },
            {
              id: 'q5_3_4',
              prompt: 'Q4. A Map<String, Integer> is ideal for:',
              choices: [
                { id: 'a', text: 'Dedup only', correct: false, rationale: 'Use Set for deduplication.' },
                { id: 'b', text: 'Frequency counting', correct: true, rationale: 'Map keys to counts for frequency tracking.' },
                { id: 'c', text: 'Sorting by length', correct: false, rationale: 'Maps don\'t sort by length.' },
                { id: 'd', text: 'Splitting strings', correct: false, rationale: 'Use split() for splitting strings.' }
              ]
            }
          ]
        },
        {
          id: 'u5-4',
          title: 'First efficiency lesson: why naive string building can be slow',
          description: 'Learn about String immutability and StringBuilder',
          content: {
            keyPoints: [
              'Strings are immutable: when you do text = text + piece in a loop, Java must create a new string each time and copy characters over.',
              'That can make a simple loop take much longer than you expect.',
              'StringBuilder avoids making a brand-new string on every step.',
              'Use StringBuilder when building strings in a loop.'
            ],
            codeExample: {
              language: 'java',
              code: `// SLOW: Creates many intermediate String objects
String result = "";
for (int i = 0; i < 1000; i++) {
  result = result + "a";  // Creates a new String each time!
}

// FAST: StringBuilder modifies in place
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
  sb.append("a");  // No new String objects created
}
String result = sb.toString();

// General pattern
StringBuilder sb = new StringBuilder();
for (String piece : pieces) {
  sb.append(piece);
}
String text = sb.toString();`,
              caption: 'StringBuilder is much faster for building strings in loops'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Why is String + String slow in a loop?',
                'Rewrite a loop that builds a string using StringBuilder',
                'When should you use StringBuilder vs regular +?',
                'What method converts StringBuilder to String?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q5_4_1',
              prompt: 'Q1. Repeated s = s + piece in a loop is slow mainly because:',
              choices: [
                { id: 'a', text: 'The JIT forbids +', correct: false, rationale: 'The JIT allows +, but it\'s inefficient for repeated concatenation.' },
                { id: 'b', text: 'Strings are immutable; each + builds a new string and copies characters', correct: true, rationale: 'Each concatenation creates a new String object.' },
                { id: 'c', text: '+ is O(1) always', correct: false, rationale: '+ is O(n) for strings due to copying.' },
                { id: 'd', text: 'The OS blocks it', correct: false, rationale: 'The OS doesn\'t block string concatenation.' }
              ]
            },
            {
              id: 'q5_4_2',
              prompt: 'Q2. The drop-in faster replacement is:',
              choices: [
                { id: 'a', text: 'StringBuffer/StringBuilder with append then toString()', correct: true, rationale: 'StringBuilder avoids repeated copying by building in place.' },
                { id: 'b', text: 'Arrays.copyOf', correct: false, rationale: 'copyOf is for arrays, not efficient string building.' },
                { id: 'c', text: 'Collections.fill', correct: false, rationale: 'fill is for collections, not strings.' },
                { id: 'd', text: 'System.arraycopy', correct: false, rationale: 'arraycopy is low-level and not designed for strings.' }
              ]
            },
            {
              id: 'q5_4_3',
              prompt: 'Q3. Measuring runtime in code is called:',
              choices: [
                { id: 'a', text: 'Analytical analysis', correct: false, rationale: 'Analytical analysis is theoretical, not measured.' },
                { id: 'b', text: 'Empirical analysis', correct: true, rationale: 'Measuring actual runtime is empirical analysis.' },
                { id: 'c', text: 'Static dispatch', correct: false, rationale: 'Static dispatch is about method resolution.' },
                { id: 'd', text: 'Profiling is illegal', correct: false, rationale: 'Profiling is a standard practice.' }
              ]
            },
            {
              id: 'q5_4_4',
              prompt: 'Q4. Big-Oh analysis for one pass over n characters is:',
              choices: [
                { id: 'a', text: 'O(1)', correct: false, rationale: 'Processing n items takes time proportional to n.' },
                { id: 'b', text: 'O(log n)', correct: false, rationale: 'A single pass is linear, not logarithmic.' },
                { id: 'c', text: 'O(n)', correct: true, rationale: 'One pass over n characters is O(n).' },
                { id: 'd', text: 'O(n²)', correct: false, rationale: 'A single pass is O(n), not quadratic.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 5 — TxMsg Text Transformer',
        spec: ['Build a complete text message abbreviation system.'],
        tasks: [
          'Implement isVowel() helper',
          'Write txWord() to transform individual words',
          'Handle the all-vowels special case',
          'Implement txMsg() using split() and join()',
          'Use StringBuilder for efficiency',
          'Test with various inputs'
        ],
        extension: ['Add rules for punctuation and numbers']
      },
      finalProject: {
        title: 'Project P5 — Advanced Text Processor',
        spec: ['Build a text processing tool with multiple transformation modes.'],
        focus: ['String manipulation, efficiency, and clean helper methods']
      },
      checklist: [
        'Implement TxMsg with proper helpers',
        'Use split() and join() correctly',
        'Convert between arrays, lists, and sets',
        'Use StringBuilder for string building in loops',
        'Understand why string immutability matters for performance'
      ]
    },
    {
      unitId: 'u6',
      unitNumber: 6,
      title: 'ArrayLists, Maps, and Efficiency',
      overview: [
        'Understand why repeated string concatenation is O(N²) and how StringBuilder fixes it.',
        'Learn how ArrayList achieves amortized O(1) add() through doubling strategy.',
        'Master HashMap basics including safe counting with getOrDefault().'
      ],
      subUnits: [
        {
          id: 'u6-1',
          title: 'Why naïve string building is slow (and how that connects to Big-Oh)',
          description: 'Learn why repeated string concatenation is O(N²) and how StringBuilder fixes it',
          content: {
            keyPoints: [
              'String is immutable in Java—every concatenation creates a new String object.',
              'Repeatedly doing ret = ret + s in a loop creates strings of length 1, 2, 3, … N.',
              'The total work is 1 + 2 + 3 + … + N = O(N²), which is why large concatenations feel slow.',
              'StringBuilder maintains a mutable buffer and only copies when needed, giving O(N) total time.',
              'Use StringBuilder when building strings in a loop; use + for occasional concatenation.'
            ],
            codeExample: {
              language: 'java',
              code: `// O(N²): repeated concatenation
String out = "";
for (String w : words) {
  out += w;  // creates new string each time
}

// O(N): StringBuilder
StringBuilder sb = new StringBuilder();
for (String w : words) {
  sb.append(w);  // modifies buffer in place
}
String out2 = sb.toString();`,
              caption: 'Comparing inefficient string concatenation with efficient StringBuilder'
            }
          },
          practice: [
            {
              title: 'Measure performance',
              problems: [
                'Time both approaches with a 1000-word list',
                'Explain why the difference grows with N'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u6-2',
          title: 'ArrayList growth: amortized constant time',
          description: 'Understand how ArrayList resizes and why add() is still O(1) amortized',
          content: {
            keyPoints: [
              'ArrayList wraps a plain array and grows when capacity is exceeded.',
              'Most add() calls are O(1) since they just fill the next slot.',
              'Occasionally a resize happens: allocate a bigger array (typically 2× size) and copy elements over.',
              'Over N insertions, the total copying is at most N + N/2 + N/4 + … ≈ 2N, so amortized cost per add is O(1).',
              'This means inserting N items into an ArrayList is O(N) overall, not O(N²).'
            ],
            codeExample: {
              language: 'java',
              code: `ArrayList<Integer> list = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
  list.add(i);  // amortized O(1) per add
}
// Total: O(N) for N adds`,
              caption: 'ArrayList.add() is amortized O(1)'
            }
          },
          practice: [
            {
              title: 'Analyze growth',
              problems: [
                'Why is doubling the capacity important?',
                'What if ArrayList only grew by 1 each time?'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u6-3',
          title: 'Maps 101: key→value with safe updates',
          description: 'Master HashMap basics including counting patterns and safe initialization',
          content: {
            keyPoints: [
              'A Map<K,V> stores one value for each unique key.',
              'Use map.keySet() to iterate over all keys.',
              'map.get(key) returns null if the key is missing, which can cause NullPointerException when you do arithmetic.',
              'Use getOrDefault(key, 0) to provide a safe default value.',
              'Counting with a map is typically O(N) where N is the number of items processed.'
            ],
            codeExample: {
              language: 'java',
              code: `Map<String, Integer> freq = new HashMap<>();
for (String w : words) {
  // Safe counting: no NullPointerException
  freq.put(w, freq.getOrDefault(w, 0) + 1);
}

// Iterate over results
for (String k : freq.keySet()) {
  System.out.println(k + " -> " + freq.get(k));
}`,
              caption: 'Safe word frequency counting with getOrDefault'
            }
          },
          practice: [
            {
              title: 'Counting practice',
              problems: [
                'Count character frequencies in a string',
                'Find the most common word in a list'
              ]
            }
          ],
          quiz: []
        }
      ],
      finalLab: {
        title: 'Lab 6 — Efficient Text Analysis',
        spec: ['Build a word frequency analyzer that handles large texts efficiently.'],
        tasks: [
          'Read a text file and split into words',
          'Count word frequencies using HashMap',
          'Find the top 10 most frequent words',
          'Compare ArrayList vs HashSet for unique word counting',
          'Measure and report timing differences'
        ],
        extension: ['Add filtering for common "stop words"']
      },
      finalProject: {
        title: 'Project P6 — Performance Analyzer',
        spec: ['Create a tool that compares algorithm performance.'],
        focus: ['HashMap usage, ArrayList amortization, StringBuilder efficiency']
      },
      checklist: [
        'Understand why repeated string concatenation is O(N²)',
        'Use StringBuilder for building strings in loops',
        'Know that ArrayList.add() is amortized O(1)',
        'Use getOrDefault() to safely count with maps',
        'Iterate maps with keySet()'
      ]
    },
    {
      unitId: 'u7',
      unitNumber: 7,
      title: 'Maps under the hood: hashing and buckets',
      overview: [
        'Learn how hashing turns objects into bucket indices for O(1) lookup.',
        'Understand hash table internals: buckets, collisions, and the equals/hashCode contract.',
        'Use advanced map patterns like computeIfAbsent() for complex values.'
      ],
      subUnits: [
        {
          id: 'u7-1',
          title: 'Intuition for hashing',
          description: 'Learn how hashing turns objects into bucket indices for fast lookup',
          content: {
            keyPoints: [
              'Hashing turns an object into a big integer (its hash code) using .hashCode().',
              'That integer is mapped to a small bucket index using hash % tableSize.',
              'You only search the items in that one bucket, so lookups are O(1) on average.',
              'Collisions happen when different keys map to the same bucket—handled by keeping a list per bucket.',
              'The "locker/bucket picture": keys like "hello" and "cat" might land in bucket 1, while "dog" lands in bucket 4.'
            ],
            codeExample: {
              language: 'java',
              code: `// Simplified hashing concept
int hashCode = key.hashCode();
int bucketIndex = Math.abs(hashCode) % tableSize;
// Look only in bucket[bucketIndex]

// Example hash codes
"hello".hashCode(); // returns some big integer
"cat".hashCode();   // returns a different integer`,
              caption: 'How hashing maps keys to bucket indices'
            }
          },
          practice: [
            {
              title: 'Hash exploration',
              problems: [
                'Print hash codes for several strings',
                'Explain why collisions can happen'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u7-2',
          title: 'From client to implementer',
          description: 'Understand what happens inside HashSet and HashMap',
          content: {
            keyPoints: [
              'ArrayList.add() is amortized O(1) due to doubling strategy.',
              'HashSet/HashMap give O(1) add/contains/remove in the average case by routing each key to its bucket.',
              'Inside: Java\'s hash tables keep an array of buckets, each holding a small list of items that collided.',
              'Find flow: Compute bucket index → scan that bucket\'s list → compare with .equals().',
              'If equals() and hashCode() are inconsistent, HashSet/HashMap won\'t work correctly.'
            ],
            codeExample: {
              language: 'java',
              code: `// Using computeIfAbsent for complex values
Map<String, List<Integer>> positions = new HashMap<>();
for (int i = 0; i < words.size(); i++) {
  positions.computeIfAbsent(words.get(i), k -> new ArrayList<>()).add(i);
}
// Maps each word to all positions where it appears`,
              caption: 'Advanced map pattern: storing lists as values'
            }
          },
          practice: [
            {
              title: 'Implementation understanding',
              problems: [
                'Draw a hash table with 5 buckets and show where keys land',
                'Explain why equals() and hashCode() must be consistent'
              ]
            }
          ],
          quiz: []
        }
      ],
      finalLab: {
        title: 'Lab 7 — Hash Table Exploration',
        spec: ['Explore hash codes and collision patterns.'],
        tasks: [
          'Print hash codes for a list of strings',
          'Group strings by their bucket index (hash % 10)',
          'Find strings that collide in a small hash table',
          'Implement a simple bucket visualization',
          'Test HashMap performance vs ArrayList for membership tests'
        ],
        extension: ['Research hash collision attacks']
      },
      finalProject: {
        title: 'Project P7 — Collision Analyzer',
        spec: ['Build a tool to visualize hash distribution.'],
        focus: ['Understanding hashing, collisions, and bucket load']
      },
      checklist: [
        'Understand how hashing maps keys to buckets',
        'Know that collisions are handled with lists per bucket',
        'Explain why HashMap is O(1) average case',
        'Know the importance of consistent equals() and hashCode()',
        'Use computeIfAbsent() for complex map values'
      ]
    },
    {
      unitId: 'u8',
      unitNumber: 8,
      title: 'Big-Oh and the Markov warm-up',
      overview: [
        'Learn the formal definition of Big-O notation and how to analyze complexity.',
        'Compare ArrayList vs HashSet performance for unique-word tracking (O(N²) vs O(N)).',
        'Understand dynamic dispatch and how it affects runtime performance.'
      ],
      subUnits: [
        {
          id: 'u8-1',
          title: 'From intuition to formalism',
          description: 'Learn the formal definition of Big-O notation',
          content: {
            keyPoints: [
              'Intuition: As N grows, the leading term dominates—so 3N + 44 and 15N + 2 are both O(N).',
              'N² - 6N is O(N²) because the N² term grows much faster than N.',
              'Formal Big-O: "T(N) is O(g(N)) if the ratio T(N)/g(N) stays bounded by a constant for large N."',
              'We drop constant factors and lower-order terms: 5N² + 100N becomes O(N²).',
              'In CS 201, we mostly use the intuition, but it\'s good to know the formal definition exists.'
            ],
            codeExample: {
              language: 'java',
              code: `// O(N): single pass
for (int i = 0; i < N; i++) {
  // constant work
}

// O(N²): nested loops
for (int i = 0; i < N; i++) {
  for (int j = 0; j < N; j++) {
    // constant work
  }
}

// O(N log N): divide and conquer
Collections.sort(list); // uses merge sort`,
              caption: 'Common Big-O examples'
            }
          },
          practice: [
            {
              title: 'Complexity analysis',
              problems: [
                'Identify the Big-O of: for(i=0; i<N; i++) for(j=i; j<N; j++)',
                'Why is 1000N + 50000 still O(N)?'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u8-2',
          title: 'Unique-words example: ArrayList vs HashSet',
          description: 'Compare O(N²) ArrayList approach with O(N) HashSet approach',
          content: {
            keyPoints: [
              'Checking "is this word new?" with ArrayList.contains() is O(N) for each word.',
              'If all N words are different, total time is 1 + 2 + … + N = O(N²).',
              'Switching to HashSet makes each contains() check O(1) average case.',
              'With HashSet, the whole pass becomes O(N) for N words.',
              'This shows how data structure choice dramatically affects performance at scale.'
            ],
            codeExample: {
              language: 'java',
              code: `// O(N²) worst-case: ArrayList.contains is O(N)
List<String> uniq = new ArrayList<>();
for (String w : words) {
  if (!uniq.contains(w)) {
    uniq.add(w);
  }
}

// O(N) average-case: HashSet.add is O(1)
Set<String> uniq2 = new HashSet<>();
for (String w : words) {
  uniq2.add(w);  // automatically handles duplicates
}`,
              caption: 'Performance difference between ArrayList and HashSet for deduplication'
            }
          },
          practice: [
            {
              title: 'Performance comparison',
              problems: [
                'Time both approaches with 10,000 random words',
                'Graph the time difference as N grows'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u8-3',
          title: 'A note on dynamic dispatch (what actually runs)',
          description: 'Understand how Java decides which method to call at runtime',
          content: {
            keyPoints: [
              'When you call x.contains(w), Java decides at runtime which contains() to use.',
              'If x is an ArrayList, it uses ArrayList.contains() which is O(N).',
              'If x is a HashSet, it uses HashSet.contains() which is O(1) average.',
              'This is called dynamic dispatch or runtime polymorphism.',
              'The reference type (e.g., Collection<String>) doesn\'t determine performance—the actual object type does.'
            ],
            codeExample: {
              language: 'java',
              code: `Collection<String> x = new ArrayList<>();
x.add("hello");
x.contains("hello"); // calls ArrayList.contains() - O(N)

Collection<String> y = new HashSet<>();
y.add("hello");
y.contains("hello"); // calls HashSet.contains() - O(1)

// Same method call, different performance!`,
              caption: 'Dynamic dispatch determines which method actually runs'
            }
          },
          practice: [
            {
              title: 'Dispatch exploration',
              problems: [
                'Create a Collection reference to an ArrayList, measure contains()',
                'Change to HashSet, measure again'
              ]
            }
          ],
          quiz: []
        }
      ],
      finalLab: {
        title: 'Lab 8 — Markov Text Generator Prep',
        spec: ['Build a simple Markov chain text generator.'],
        tasks: [
          'Read a text file and split into words',
          'Build a map from each word to its possible next words',
          'Generate random text by following the chain',
          'Compare ArrayList vs HashSet for unique word tracking',
          'Analyze the Big-O of your implementation'
        ],
        extension: ['Use 2-word prefixes instead of single words']
      },
      finalProject: {
        title: 'Project P8 — Markov Text Generator',
        spec: ['Create a full Markov chain text generator with configurable order.'],
        focus: ['HashMap usage, Big-O analysis, dynamic dispatch understanding']
      },
      checklist: [
        'Understand formal Big-O definition',
        'Identify leading terms in complexity expressions',
        'Know why ArrayList.contains is O(N) and HashSet.contains is O(1)',
        'Understand dynamic dispatch / runtime polymorphism',
        'Analyze code to determine Big-O complexity'
      ]
    },
    {
      unitId: 'u9',
      unitNumber: 9,
      title: 'Map review, anagrams, and "arrays as maps"',
      overview: [
        'Master core map operations: put, get, keySet(), and safe updates.',
        'Use sorted strings as keys to group anagrams efficiently.',
        'Learn to use int[] as a fast "map" for character frequency counting.'
      ],
      subUnits: [
        {
          id: 'u9-1',
          title: 'Map concepts reinforced',
          description: 'Review core map operations and patterns',
          content: {
            keyPoints: [
              'A map associates each key with a value—keys are unique.',
              'Common operations: put(key, value), get(key), containsKey(key), keySet().',
              'Iterate over all entries with for (K key : map.keySet()).',
              'Use getOrDefault(key, defaultValue) to avoid null when counting.',
              'Maps are essential for grouping, counting, and indexing patterns.'
            ],
            codeExample: {
              language: 'java',
              code: `Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 25);
ages.put("Bob", 30);

// Check if key exists
if (ages.containsKey("Alice")) {
  System.out.println(ages.get("Alice"));
}

// Iterate
for (String name : ages.keySet()) {
  System.out.println(name + " is " + ages.get(name));
}`,
              caption: 'Basic map operations'
            }
          },
          practice: [
            {
              title: 'Map operations',
              problems: [
                'Create a map of student names to grades',
                'Find the average grade using iteration'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u9-2',
          title: 'Anagrams via a canonicalized key',
          description: 'Use sorted strings as keys to group anagrams',
          content: {
            keyPoints: [
              'Anagrams are words with the same letters in different order: "listen" and "silent".',
              'If you sort the letters of a word, anagrams produce the same sorted string.',
              'Use the sorted string as the map key; the value is the list of anagrams.',
              'Encapsulating "sorted vs. unsorted" in a helper class (like AnaWord) hides details.',
              'Make sure equals() and hashCode() use the sorted form for consistent hashing.'
            ],
            codeExample: {
              language: 'java',
              code: `Map<String, List<String>> anagrams = new HashMap<>();

for (String word : dictionary) {
  String key = sortLetters(word); // "listen" -> "eilnst"
  anagrams.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
}

// Helper method
private String sortLetters(String word) {
  char[] chars = word.toCharArray();
  Arrays.sort(chars);
  return new String(chars);
}`,
              caption: 'Grouping anagrams using sorted letters as keys'
            }
          },
          practice: [
            {
              title: 'Anagram finder',
              problems: [
                'Build an anagram finder for a dictionary file',
                'Find the largest group of anagrams'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u9-3',
          title: 'Safer insertion: putIfAbsent vs containsKey',
          description: 'Learn modern map patterns for conditional insertion',
          content: {
            keyPoints: [
              'Old pattern: if (!map.containsKey(k)) map.put(k, value);',
              'm.putIfAbsent(k, value) does the same thing in one call.',
              'computeIfAbsent(k, lambda) is even better—it only creates the value if needed.',
              'This avoids creating throwaway objects when the key already exists.',
              'Example: map.computeIfAbsent(word, k -> new ArrayList<>()).add(index);'
            ],
            codeExample: {
              language: 'java',
              code: `// Old way: verbose and creates unnecessary objects
if (!map.containsKey(word)) {
  map.put(word, new ArrayList<>());
}
map.get(word).add(position);

// Better: putIfAbsent
map.putIfAbsent(word, new ArrayList<>());
map.get(word).add(position);

// Best: computeIfAbsent (Java 8+)
map.computeIfAbsent(word, k -> new ArrayList<>()).add(position);`,
              caption: 'Evolution of map insertion patterns'
            }
          },
          practice: [
            {
              title: 'Modern map patterns',
              problems: [
                'Refactor code using containsKey to use computeIfAbsent',
                'Benchmark the performance difference'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u9-4',
          title: '"Arrays as maps" for counting characters',
          description: 'Use int[] as a fast map for character frequencies',
          content: {
            keyPoints: [
              'A char in Java is essentially a small integer (0-65535).',
              'An int[] can act like a map from character codes to counts.',
              'This is much faster than HashMap for character-level work.',
              'Example: int[] counts = new int[256]; then counts[c]++ for each char c.',
              'Useful for APTs like Anonymous where you compare character frequencies.'
            ],
            codeExample: {
              language: 'java',
              code: `// Count character frequencies using array as map
int[] counts = new int[256]; // supports ASCII
for (char c : headline.toCharArray()) {
  counts[c]++;
}

// Check if character exists
if (counts['a'] > 0) {
  System.out.println("Found 'a' " + counts['a'] + " times");
}

// Compare two strings' character counts
boolean sameChars = Arrays.equals(counts1, counts2);`,
              caption: 'Using arrays as maps for character counting'
            }
          },
          practice: [
            {
              title: 'Character counting',
              problems: [
                'Count letter frequencies in a paragraph',
                'Check if two strings are anagrams using int[] counts'
              ]
            }
          ],
          quiz: []
        }
      ],
      finalLab: {
        title: 'Lab 9 — Anagram Detector',
        spec: ['Build a complete anagram detection and grouping system.'],
        tasks: [
          'Read a dictionary file',
          'Group words by their sorted letter signature',
          'Find the largest anagram group',
          'Implement character frequency comparison using int[]',
          'Compare HashMap vs array-based approaches'
        ],
        extension: ['Add wildcard support for anagram puzzles']
      },
      finalProject: {
        title: 'Project P9 — Word Game Helper',
        spec: ['Create a tool for word games like Scrabble and anagrams.'],
        focus: ['Anagram detection, character counting, efficient map usage']
      },
      checklist: [
        'Master map iteration with keySet()',
        'Use sorted strings as keys for anagram grouping',
        'Prefer computeIfAbsent over containsKey + put',
        'Use int[] as a fast "map" for character frequencies',
        'Understand when to use HashMap vs array-based counting'
      ]
    },
    {
      unitId: 'u10',
      unitNumber: 10,
      title: 'Big-O review, Map gotchas, and Probability (SUHA)',
      overview: [
        'Use getOrDefault() and merge() to avoid NullPointerException in map counting.',
        'Analyze common loop patterns to determine Big-O complexity.',
        'Understand SUHA (Simple Uniform Hashing Assumption) and hash collision attacks.'
      ],
      subUnits: [
        {
          id: 'u10-1',
          title: 'Safer counting with getOrDefault',
          description: 'Avoid NullPointerException when working with map values',
          content: {
            keyPoints: [
              'map.get("hello") returns null if the key is missing.',
              'Doing map.get("hello") + 1 throws NullPointerException if "hello" isn\'t in the map.',
              'Use getOrDefault(key, 0) to provide a safe default: counts.put(w, counts.getOrDefault(w, 0) + 1);',
              'Alternative: use merge(key, 1, Integer::sum) which handles the null case automatically.',
              'These patterns make counting code robust and concise.'
            ],
            codeExample: {
              language: 'java',
              code: `Map<String, Integer> counts = new HashMap<>();

// Unsafe: throws NPE if word not in map
// counts.put(word, counts.get(word) + 1); // DON'T DO THIS

// Safe: getOrDefault
counts.put(word, counts.getOrDefault(word, 0) + 1);

// Also safe: merge (Java 8+)
counts.merge(word, 1, Integer::sum);

// Both handle missing keys correctly`,
              caption: 'Safe counting patterns that avoid NullPointerException'
            }
          },
          practice: [
            {
              title: 'Safe map updates',
              problems: [
                'Refactor unsafe counting code to use getOrDefault',
                'Try merge() and compare readability'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u10-2',
          title: 'Big-O practice patterns',
          description: 'Analyze common loop patterns to determine complexity',
          content: {
            keyPoints: [
              'Count constant-time operations, then reason about loops (outer × inner).',
              'Many nested-loop snippets are O(N²): for(i) { for(j) { … } }',
              'Some patterns yield O(N log N): divide-and-conquer algorithms like merge sort.',
              'Growing by factors gives O(log N): for (i=1; i<N; i*=2) is O(log N).',
              'Triangular loops are still O(N²): for(i=0; i<N; i++) for(j=i; j<N; j++) does N(N+1)/2 iterations.'
            ],
            codeExample: {
              language: 'java',
              code: `// O(N): single pass
for (int i = 0; i < N; i++) { /* constant work */ }

// O(N²): all pairs
for (int i = 0; i < N; i++) {
  for (int j = 0; j < N; j++) { /* constant work */ }
}

// O(N²): triangular (still quadratic)
for (int i = 0; i < N; i++) {
  for (int j = i; j < N; j++) { /* constant work */ }
}

// O(N log N): outer loop N times, inner log N
for (int i = 0; i < N; i++) {
  for (int j = 1; j < N; j *= 2) { /* constant work */ }
}

// O(log N): doubling
for (int i = 1; i < N; i *= 2) { /* constant work */ }`,
              caption: 'Common loop patterns and their Big-O complexity'
            }
          },
          practice: [
            {
              title: 'Complexity analysis practice',
              problems: [
                'Determine Big-O for: for(i=0;i<N;i++) for(j=0;j<i;j++)',
                'What about: for(i=N;i>0;i/=2)?',
                'Analyze: Collections.sort() followed by a single pass'
              ]
            }
          ],
          quiz: []
        },
        {
          id: 'u10-3',
          title: 'Why HashMap is "O(1) on average"',
          description: 'Understand the assumptions behind HashMap performance and potential attacks',
          content: {
            keyPoints: [
              'Simple Uniform Hashing Assumption (SUHA): a good hash spreads keys evenly across buckets.',
              'With even distribution, each bucket holds O(1) items on average, giving O(1) operations.',
              'Real-world hash functions can be attacked with hash flooding: many keys designed to collide.',
              'Hash flooding forces all keys into one bucket, degrading performance toward O(N) or O(N²).',
              'Java adds defenses (like switching to trees for large buckets), but you should still think about worst-case behavior.',
              'For CS 201: assume SUHA unless told otherwise, but know that worst-case exists.'
            ],
            codeExample: {
              language: 'java',
              code: `// Average case: O(1) per operation
Map<String, Integer> map = new HashMap<>();
for (String word : words) {
  map.put(word, map.getOrDefault(word, 0) + 1); // O(1) per word
}
// Total: O(N) for N words

// Worst case (with malicious hash collision):
// All keys hash to same bucket → O(N) per operation
// Total: O(N²) for N words
// (Java mitigates this with tree buckets in Java 8+)`,
              caption: 'HashMap performance depends on hash distribution'
            }
          },
          practice: [
            {
              title: 'Hash distribution exploration',
              problems: [
                'Research hash collision attacks (e.g., HashDoS)',
                'Explain why Java 8 switched to tree buckets for large collisions',
                'When would you use TreeMap instead of HashMap?'
              ]
            }
          ],
          quiz: []
        }
      ],
      finalLab: {
        title: 'Lab 10 — Complexity & Security Analysis',
        spec: ['Analyze and optimize code for both correctness and performance.'],
        tasks: [
          'Profile code to identify O(N²) bottlenecks',
          'Refactor using HashMap to achieve O(N)',
          'Use getOrDefault() safely in all counting code',
          'Research and explain SUHA',
          'Write test cases that explore worst-case behavior'
        ],
        extension: ['Implement a simple hash table from scratch']
      },
      finalProject: {
        title: 'Project P10 — Performance Profiler',
        spec: ['Build a tool that profiles code and suggests optimizations.'],
        focus: ['Big-O analysis, safe map operations, understanding amortization and hashing']
      },
      checklist: [
        'Always use getOrDefault() or merge() when counting with maps',
        'Analyze loop patterns to determine Big-O complexity',
        'Understand SUHA and why HashMap is O(1) average case',
        'Know about hash collision attacks and Java\'s defenses',
        'Be able to identify and fix O(N²) bottlenecks'
      ]
    }
  ]
};
