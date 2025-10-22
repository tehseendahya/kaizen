export type CodeSnippet = {
  language: 'java' | 'txt';
  code: string;
  caption?: string;
};

export type Lecture = {
  id: string;
  title: string;
  bullets: string[];
  snippet?: CodeSnippet;
};

export type PracticeGroup = {
  title: 'Warm-ups' | 'Core' | 'Challenge';
  items: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: { id: string; text: string; correct: boolean; rationale: string }[];
};

export type StudyUnitData = {
  unitId: 'u1' | 'u2' | 'u3';
  title: string;
  overview: string[];
  lectures: Lecture[];
  workedExamples: { title: string; content: string; snippet?: CodeSnippet }[];
  guidedNotes: string[];
  practice: PracticeGroup[];
  lab: { title: string; spec: string[]; tasks: string[]; extension?: string[] };
  miniProject: { title: string; spec: string[]; focus: string[] };
  quiz: QuizQuestion[];
  checklist: string[];
  selectedSolutions: { title: string; items: string[] };
};

export type StudyPackData = {
  hero: { title: string; subtitle: string };
  units: StudyUnitData[];
};

export const cs201: StudyPackData = {
  hero: {
    title: 'CS201 Study Pack — Units 1–3',
    subtitle: 'Lectures, examples, practice, labs, projects, quizzes, and checklists.'
  },
  units: [
    {
      unitId: 'u1',
      title: 'Unit 1: CS (Computer Science) and OOP (Object-Oriented Programming) in Java',
      overview: [
        'Define abstraction and map problems to interfaces and data structures.',
        'Explain compile → bytecode → JVM (Java Virtual Machine) execution.',
        'Design classes with encapsulation; choose static vs instance methods.'
      ],
      lectures: [
        {
          id: '1A',
          title: 'What is CS (Computer Science)? Abstraction',
          bullets: [
            'Abstraction: specify "what," hide "how."',
            'Interfaces precede implementations.',
            'Use cases: Stack, Map.'
          ]
        },
        {
          id: '1B',
          title: 'Java Platform: javac, bytecode, JVM (Java Virtual Machine)',
          bullets: [
            'Write once, run anywhere.',
            'Entry point: public static void main(String[] args).'
          ],
          snippet: {
            language: 'java',
            code: `public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, Duke!");
  }
}`,
            caption: 'A simple Java program'
          }
        },
        {
          id: '1C',
          title: 'Classes and Objects',
          bullets: [
            'Class: blueprint defining fields and methods.',
            'Object: runtime instance with state.',
            'Constructor: special method initializing state.'
          ],
          snippet: {
            language: 'java',
            code: `public class Point2D {
  private double x, y;
  
  public Point2D(double x, double y) {
    this.x = x;
    this.y = y;
  }
  
  public double distanceTo(Point2D other) {
    double dx = this.x - other.x;
    double dy = this.y - other.y;
    return Math.sqrt(dx*dx + dy*dy);
  }
}`,
            caption: 'Point2D class with constructor and method'
          }
        },
        {
          id: '1D',
          title: 'Encapsulation and Information Hiding',
          bullets: [
            'Private fields; public methods.',
            'Invariants: conditions that must always hold.',
            'Validation: enforce constraints in constructors and setters.'
          ]
        },
        {
          id: '1E',
          title: 'Static vs Instance',
          bullets: [
            'Static: belongs to class; shared across all instances.',
            'Instance: belongs to object; each object has its own copy.',
            'Static methods cannot access instance variables directly.'
          ],
          snippet: {
            language: 'java',
            code: `public class MathUtils {
  public static double square(double n) {
    return n * n;
  }
}

public class Counter {
  private int count = 0;
  
  public void increment() {
    count++;
  }
  
  public int getCount() {
    return count;
  }
}`,
            caption: 'Static utility method vs instance method'
          }
        },
        {
          id: '1F',
          title: 'Memory Model: Stack and Heap',
          bullets: [
            'Stack: holds method frames, local variables, references.',
            'Heap: stores objects; garbage collected.',
            'Variables hold references to objects, not the objects themselves.'
          ]
        }
      ],
      workedExamples: [
        {
          title: 'Reference Semantics',
          content: 'Two references can point to the same object; mutating via one is visible via the other.',
          snippet: {
            language: 'java',
            code: `Point2D p1 = new Point2D(3, 4);
Point2D p2 = p1;  // p2 references the same object
// Both p1 and p2 refer to the same Point2D object on the heap`
          }
        },
        {
          title: 'Encapsulation Example',
          content: 'A BankAccount class enforces non-negative balance through private fields and validation.',
          snippet: {
            language: 'java',
            code: `public class BankAccount {
  private double balance;
  
  public BankAccount(double initial) {
    if (initial < 0) throw new IllegalArgumentException();
    this.balance = initial;
  }
  
  public void deposit(double amount) {
    if (amount <= 0) throw new IllegalArgumentException();
    balance += amount;
  }
  
  public boolean withdraw(double amount) {
    if (amount <= 0 || amount > balance) return false;
    balance -= amount;
    return true;
  }
}`
          }
        },
        {
          title: 'WordCounter Core Loop',
          content: 'Using a Map to count word frequencies demonstrates abstraction and the power of built-in data structures.',
          snippet: {
            language: 'java',
            code: `Map<String, Integer> counts = new HashMap<>();
String[] words = text.toLowerCase().split("\\\\W+");
for (String w : words) {
  counts.put(w, counts.getOrDefault(w, 0) + 1);
}`,
            caption: 'Counting words using HashMap'
          }
        }
      ],
      guidedNotes: [
        'Abstraction focuses on ___ not ___.',
        'Java compiles to ___ which runs on the ___.',
        'Variables hold ___ to objects on the ___.',
        'Fields should be ___ and accessed via ___ methods.',
        'Instance methods can access ___ state; static methods cannot.'
      ],
      practice: [
        {
          title: 'Warm-ups',
          items: [
            'Write Point2D with distanceTo.',
            'Validate Student.addCredits.',
            'Implement Rectangle with getArea and getPerimeter.'
          ]
        },
        {
          title: 'Core',
          items: [
            'Implement BankAccount with transfer.',
            'Implement Stopwatch using System.nanoTime().',
            'Create a Temperature class that stores Celsius and provides toFahrenheit().'
          ]
        },
        {
          title: 'Challenge',
          items: [
            'Immutable Rational with GCD (Greatest Common Divisor).',
            'Design a Date class with validation for valid calendar dates.',
            'Implement a CircularBuffer with fixed capacity.'
          ]
        }
      ],
      lab: {
        title: 'Lab 1 — GradeBook',
        spec: ['Model students, courses, grades with encapsulation.'],
        tasks: [
          'Implement Student, Course, GradeBook with invariants.',
          'recordGrade, averageForCourse, gpaForStudent.'
        ],
        extension: ['Validate ranges [0, 100] with exceptions.']
      },
      miniProject: {
        title: 'Mini-Project 1 — WordCounter',
        spec: ['Use Map<String,Integer> to compute most frequent word.'],
        focus: ['Choosing the right abstraction before coding.']
      },
      quiz: [
        {
          id: 'q1_1',
          prompt: 'Why does encapsulation reduce bugs?',
          choices: [
            {
              id: 'a',
              text: 'It hides fields behind a stable interface',
              correct: true,
              rationale: 'Prevents invalid states and centralizes validation.'
            },
            {
              id: 'b',
              text: 'It makes code shorter',
              correct: false,
              rationale: 'Length is unrelated to correctness.'
            },
            {
              id: 'c',
              text: 'It speeds up execution',
              correct: false,
              rationale: 'Encapsulation is about design, not performance.'
            }
          ]
        },
        {
          id: 'q1_2',
          prompt: 'What does the JVM (Java Virtual Machine) do?',
          choices: [
            {
              id: 'a',
              text: 'Compiles Java source to bytecode',
              correct: false,
              rationale: 'The compiler (javac) does this, not the JVM.'
            },
            {
              id: 'b',
              text: 'Executes bytecode on any platform',
              correct: true,
              rationale: 'The JVM interprets or JIT-compiles bytecode at runtime.'
            },
            {
              id: 'c',
              text: 'Writes Java programs',
              correct: false,
              rationale: 'Programmers write Java programs.'
            }
          ]
        },
        {
          id: 'q1_3',
          prompt: 'When should a method be static?',
          choices: [
            {
              id: 'a',
              text: 'When it needs to access instance fields',
              correct: false,
              rationale: 'Static methods cannot access instance fields directly.'
            },
            {
              id: 'b',
              text: 'When it is a utility that does not depend on object state',
              correct: true,
              rationale: 'Static methods are for class-level operations independent of instances.'
            },
            {
              id: 'c',
              text: 'Always, to save memory',
              correct: false,
              rationale: 'Static vs instance is about design, not optimization.'
            }
          ]
        }
      ],
      checklist: [
        'Explain abstraction with an original example.',
        'Draw a stack/heap diagram for a simple program.',
        'Choose static vs instance appropriately.',
        'Write a class with proper encapsulation and invariants.',
        'Trace reference semantics through aliasing.'
      ],
      selectedSolutions: {
        title: 'Selected Solutions — Unit 1',
        items: [
          'Guided Notes: what/how; bytecode/JVM; references/heap; private/public; instance state.',
          'Rational: normalize by GCD; den>0; override equals/hashCode.',
          'BankAccount transfer: withdraw from source, deposit to target; check for success.',
          'Stopwatch: store start time in nanos; elapsed = current - start.'
        ]
      }
    },
    {
      unitId: 'u2',
      title: 'Unit 2: Arrays, ArrayLists, Strings',
      overview: [
        'Understand array indexing, bounds, and reference semantics.',
        'Use ArrayList for dynamic collections; contrast with arrays.',
        'Master String operations: immutability, splitting, StringBuilder.'
      ],
      lectures: [
        {
          id: '2A',
          title: 'Arrays: Declaration, Indexing, Length',
          bullets: [
            'Fixed size; zero-indexed.',
            'Reference type; array variable holds reference to array object.',
            'ArrayIndexOutOfBoundsException for invalid indices.'
          ],
          snippet: {
            language: 'java',
            code: `int[] numbers = new int[5];
numbers[0] = 10;
System.out.println(numbers.length);  // 5`
          }
        },
        {
          id: '2B',
          title: 'ArrayList: Dynamic Resizing',
          bullets: [
            'Generic type: ArrayList<T>.',
            'Methods: add, get, remove, size.',
            'Automatic resizing; amortized O(1) append.'
          ],
          snippet: {
            language: 'java',
            code: `ArrayList<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
System.out.println(names.size());  // 2`
          }
        },
        {
          id: '2C',
          title: 'Enhanced For Loop',
          bullets: [
            'Iterate over arrays and collections cleanly.',
            'Read-only; cannot modify index during iteration.'
          ],
          snippet: {
            language: 'java',
            code: `for (String name : names) {
  System.out.println(name);
}`
          }
        },
        {
          id: '2D',
          title: 'Strings: Immutability',
          bullets: [
            'String objects cannot be changed after creation.',
            'Methods like substring, toLowerCase return new Strings.',
            'Use == for reference equality; .equals() for content equality.'
          ]
        },
        {
          id: '2E',
          title: 'String Manipulation: split, join, StringBuilder',
          bullets: [
            'split(regex) produces String[].',
            'String.join(delimiter, parts) concatenates.',
            'StringBuilder for efficient repeated concatenation.'
          ],
          snippet: {
            language: 'java',
            code: `String text = "apple,banana,cherry";
String[] fruits = text.split(",");
StringBuilder sb = new StringBuilder();
for (String f : fruits) {
  sb.append(f.toUpperCase()).append(" ");
}`
          }
        },
        {
          id: '2F',
          title: 'Multi-dimensional Arrays',
          bullets: [
            'Array of arrays: int[][].',
            'Useful for grids, matrices.',
            'Ragged arrays allowed (rows of different lengths).'
          ]
        }
      ],
      workedExamples: [
        {
          title: 'Reversing an Array',
          content: 'Swap elements from both ends moving towards the center.',
          snippet: {
            language: 'java',
            code: `public static void reverse(int[] arr) {
  for (int i = 0; i < arr.length / 2; i++) {
    int temp = arr[i];
    arr[i] = arr[arr.length - 1 - i];
    arr[arr.length - 1 - i] = temp;
  }
}`
          }
        },
        {
          title: 'Palindrome Check',
          content: 'Compare characters from both ends; ignore case and non-letters.',
          snippet: {
            language: 'java',
            code: `public static boolean isPalindrome(String s) {
  s = s.toLowerCase().replaceAll("[^a-z]", "");
  int left = 0, right = s.length() - 1;
  while (left < right) {
    if (s.charAt(left) != s.charAt(right)) return false;
    left++;
    right--;
  }
  return true;
}`
          }
        }
      ],
      guidedNotes: [
        'Arrays have fixed ___ and are ___ indexed.',
        'ArrayList provides ___ resizing and type safety via ___.',
        'Strings are ___ in Java; concatenation creates ___ objects.',
        'Use ___ for efficient string building in loops.',
        'Enhanced for loop is read-only and iterates over ___.'
      ],
      practice: [
        {
          title: 'Warm-ups',
          items: [
            'Find the maximum value in an array.',
            'Remove duplicates from an ArrayList.',
            'Count vowels in a String.'
          ]
        },
        {
          title: 'Core',
          items: [
            'Implement binary search on a sorted array.',
            'Rotate an array by k positions.',
            'Anagram checker using character counts.'
          ]
        },
        {
          title: 'Challenge',
          items: [
            'Merge two sorted arrays into one sorted array.',
            'Longest palindromic substring.',
            'Implement a simple text justification algorithm.'
          ]
        }
      ],
      lab: {
        title: 'Lab 2 — TextAnalyzer',
        spec: ['Build a tool to analyze text files: word count, average word length, most common words.'],
        tasks: [
          'Read file into ArrayList<String> of lines.',
          'Tokenize, count, and sort words by frequency.'
        ],
        extension: ['Add sentiment scoring based on positive/negative word lists.']
      },
      miniProject: {
        title: 'Mini-Project 2 — Hangman Game',
        spec: ['Implement Hangman with a word list, guessing logic, and ASCII art display.'],
        focus: ['String manipulation, ArrayList for guesses, game state management.']
      },
      quiz: [
        {
          id: 'q2_1',
          prompt: 'What happens if you access arr[arr.length]?',
          choices: [
            { id: 'a', text: 'Returns the last element', correct: false, rationale: 'Last element is at arr.length - 1.' },
            { id: 'b', text: 'ArrayIndexOutOfBoundsException', correct: true, rationale: 'Indices are 0 to length-1.' },
            { id: 'c', text: 'Returns 0', correct: false, rationale: 'Java does not return a default; it throws an exception.' }
          ]
        },
        {
          id: 'q2_2',
          prompt: 'Why are Strings immutable in Java?',
          choices: [
            { id: 'a', text: 'Performance and security', correct: true, rationale: 'Immutability enables string pooling and prevents tampering.' },
            { id: 'b', text: 'To save memory', correct: false, rationale: 'Immutability can actually create more objects.' },
            { id: 'c', text: 'It is a mistake in the language design', correct: false, rationale: 'Immutability is intentional and beneficial.' }
          ]
        }
      ],
      checklist: [
        'Iterate arrays and ArrayLists correctly.',
        'Explain String immutability and its implications.',
        'Use StringBuilder for efficient concatenation.',
        'Handle edge cases (empty arrays, null).',
        'Trace multi-dimensional array access.'
      ],
      selectedSolutions: {
        title: 'Selected Solutions — Unit 2',
        items: [
          'Guided Notes: size/zero; dynamic/generics; immutable/new; StringBuilder; elements.',
          'Binary search: while (left <= right), mid = left + (right - left) / 2.',
          'Anagram: count frequency of each character in both strings and compare.'
        ]
      }
    },
    {
      unitId: 'u3',
      title: 'Unit 3: Maps, Sets, Hashing',
      overview: [
        'Use Map for key-value associations; understand HashMap vs TreeMap.',
        'Use Set for unique collections; HashSet vs TreeSet.',
        'Explain hashing: hash codes, collisions, and performance.'
      ],
      lectures: [
        {
          id: '3A',
          title: 'Map Interface and HashMap',
          bullets: [
            'Map<K, V>: associates keys with values.',
            'HashMap: O(1) average for get, put, remove.',
            'Keys must override equals and hashCode correctly.'
          ],
          snippet: {
            language: 'java',
            code: `Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 88);
System.out.println(scores.get("Alice"));  // 95`
          }
        },
        {
          id: '3B',
          title: 'TreeMap: Sorted Keys',
          bullets: [
            'Keys stored in sorted order.',
            'O(log n) operations.',
            'Useful for range queries, ordered iteration.'
          ]
        },
        {
          id: '3C',
          title: 'Set Interface and HashSet',
          bullets: [
            'Set<T>: collection with no duplicates.',
            'HashSet: O(1) average for add, remove, contains.',
            'Iteration order is unspecified.'
          ],
          snippet: {
            language: 'java',
            code: `Set<String> uniqueWords = new HashSet<>();
uniqueWords.add("apple");
uniqueWords.add("apple");  // duplicate ignored
System.out.println(uniqueWords.size());  // 1`
          }
        },
        {
          id: '3D',
          title: 'TreeSet: Sorted Elements',
          bullets: [
            'Elements stored in sorted order.',
            'O(log n) operations.',
            'Elements must be Comparable or use Comparator.'
          ]
        },
        {
          id: '3E',
          title: 'Hashing and Hash Codes',
          bullets: [
            'hashCode(): integer representation of object.',
            'Equal objects must have equal hash codes.',
            'Collisions: multiple keys with same hash; resolved via chaining or probing.'
          ]
        },
        {
          id: '3F',
          title: 'equals() and hashCode() Contract',
          bullets: [
            'Override both together.',
            'Consistent with equals: a.equals(b) ⇒ a.hashCode() == b.hashCode().',
            'Use all significant fields in both methods.'
          ],
          snippet: {
            language: 'java',
            code: `@Override
public boolean equals(Object obj) {
  if (this == obj) return true;
  if (!(obj instanceof Person)) return false;
  Person p = (Person) obj;
  return name.equals(p.name) && age == p.age;
}

@Override
public int hashCode() {
  return Objects.hash(name, age);
}`
          }
        }
      ],
      workedExamples: [
        {
          title: 'Counting Character Frequencies',
          content: 'Use a Map to count each character in a string.',
          snippet: {
            language: 'java',
            code: `Map<Character, Integer> freq = new HashMap<>();
for (char c : text.toCharArray()) {
  freq.put(c, freq.getOrDefault(c, 0) + 1);
}`
          }
        },
        {
          title: 'Finding Intersection of Two Sets',
          content: 'Use retainAll to compute the intersection.',
          snippet: {
            language: 'java',
            code: `Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(Arrays.asList(3, 4, 5, 6));
a.retainAll(b);  // a now contains {3, 4}`
          }
        }
      ],
      guidedNotes: [
        'A Map stores ___ to ___ associations.',
        'HashMap provides ___ average time complexity for lookups.',
        'A Set enforces ___ and uses ___ for membership tests.',
        'hashCode() must be consistent with ___.',
        'TreeMap and TreeSet maintain ___ order.'
      ],
      practice: [
        {
          title: 'Warm-ups',
          items: [
            'Count word frequencies in a text.',
            'Remove duplicates from a list using a Set.',
            'Check if two strings are anagrams using Maps.'
          ]
        },
        {
          title: 'Core',
          items: [
            'Implement a simple cache with Map (LRU eviction optional).',
            'Find all unique substrings of a string.',
            'Group anagrams together from a list of words.'
          ]
        },
        {
          title: 'Challenge',
          items: [
            'Implement a spell checker using a Set of valid words.',
            'Detect cycles in a graph using a Set of visited nodes.',
            'Design a phone directory with fast name and number lookup.'
          ]
        }
      ],
      lab: {
        title: 'Lab 3 — Concordance Builder',
        spec: ['Build an index mapping words to line numbers where they appear.'],
        tasks: [
          'Read text file; for each word, store a Set<Integer> of line numbers.',
          'Output words in alphabetical order with their line numbers.'
        ],
        extension: ['Support phrase search (multiple consecutive words).']
      },
      miniProject: {
        title: 'Mini-Project 3 — Social Network Graph',
        spec: ['Model friendships using Map<Person, Set<Person>>; implement BFS (Breadth-First Search) for degrees of separation.'],
        focus: ['Choosing appropriate collections; graph traversal.']
      },
      quiz: [
        {
          id: 'q3_1',
          prompt: 'What is the average time complexity of HashMap.get()?',
          choices: [
            { id: 'a', text: 'O(1)', correct: true, rationale: 'Hash tables provide constant average-time lookup.' },
            { id: 'b', text: 'O(log n)', correct: false, rationale: 'This is TreeMap complexity.' },
            { id: 'c', text: 'O(n)', correct: false, rationale: 'Linear search is not used in hash tables.' }
          ]
        },
        {
          id: 'q3_2',
          prompt: 'Why must equals() and hashCode() be overridden together?',
          choices: [
            { id: 'a', text: 'To prevent compilation errors', correct: false, rationale: 'Java compiles fine without; it is a contract issue.' },
            { id: 'b', text: 'To ensure correct behavior in hash-based collections', correct: true, rationale: 'HashMap and HashSet rely on both methods.' },
            { id: 'c', text: 'To improve performance', correct: false, rationale: 'It is about correctness, not performance.' }
          ]
        },
        {
          id: 'q3_3',
          prompt: 'What does TreeSet provide that HashSet does not?',
          choices: [
            { id: 'a', text: 'Sorted order of elements', correct: true, rationale: 'TreeSet maintains elements in sorted order.' },
            { id: 'b', text: 'Faster insertion', correct: false, rationale: 'HashSet is typically faster for insertion.' },
            { id: 'c', text: 'Allows duplicates', correct: false, rationale: 'Both are Sets and disallow duplicates.' }
          ]
        }
      ],
      checklist: [
        'Choose Map vs Set appropriately for the problem.',
        'Override equals() and hashCode() correctly.',
        'Explain HashMap collision resolution.',
        'Use TreeMap/TreeSet when order matters.',
        'Trace the behavior of hash-based collections with custom objects.'
      ],
      selectedSolutions: {
        title: 'Selected Solutions — Unit 3',
        items: [
          'Guided Notes: keys/values; O(1); uniqueness/hashing; equals(); sorted.',
          'Anagram grouping: compute sorted version of each word as key; group by key.',
          'LRU Cache: LinkedHashMap with accessOrder=true; override removeEldestEntry.',
          'Spell checker: load dictionary into HashSet; for each word, check contains().'
        ]
      }
    }
  ]
};

