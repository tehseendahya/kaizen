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
  unitId: 'u1' | 'u2' | 'u3';
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
  courseSubtitle: '3 UNITS • 18 SKILLS',
  units: [
    {
      unitId: 'u1',
      unitNumber: 1,
      title: 'CS (Computer Science) and OOP (Object-Oriented Programming) in Java',
      overview: [
        'Define abstraction and map problems to interfaces and data structures.',
        'Explain compile → bytecode → JVM (Java Virtual Machine) execution.',
        'Design classes with encapsulation; choose static vs instance methods.'
      ],
      subUnits: [
        {
          id: 'u1-1',
          title: 'Introduction to Computer Science and Abstraction',
          description: 'Learn what Computer Science is and understand the concept of abstraction',
          content: {
            keyPoints: [
              'Abstraction: specify "what," hide "how."',
              'Interfaces precede implementations.',
              'Use cases: Stack, Map.',
              'Focus on the essential qualities rather than implementation details.'
            ],
          },
          practice: [
            {
              title: 'Quick Check',
              problems: [
                'Explain abstraction in your own words',
                'Give an example of abstraction from everyday life',
                'Why is abstraction important in programming?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_1_1',
              prompt: 'What is the main purpose of abstraction in Computer Science?',
              choices: [
                { id: 'a', text: 'To make programs run faster', correct: false, rationale: 'Abstraction is about design, not performance.' },
                { id: 'b', text: 'To hide implementation details and focus on what something does', correct: true, rationale: 'Abstraction allows us to work with complex systems by hiding unnecessary details.' },
                { id: 'c', text: 'To make code shorter', correct: false, rationale: 'Brevity is not the goal of abstraction.' }
              ]
            }
          ]
        },
        {
          id: 'u1-2',
          title: 'Java Platform: Compilation and Execution',
          description: 'Understand how Java code is compiled to bytecode and executed on the JVM',
          content: {
            keyPoints: [
              'Write once, run anywhere - Java\'s key philosophy',
              'Source code (.java) → Compiler (javac) → Bytecode (.class)',
              'Bytecode is platform-independent',
              'JVM (Java Virtual Machine) executes bytecode',
              'Entry point: public static void main(String[] args)'
            ],
            codeExample: {
              language: 'java',
              code: `public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, Duke!");
  }
}`,
              caption: 'A simple Java program showing the main method entry point'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Write a Java program that prints your name',
                'Explain the compilation process from .java to .class',
                'What does the JVM do?'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_2_1',
              prompt: 'What does the JVM (Java Virtual Machine) do?',
              choices: [
                { id: 'a', text: 'Compiles Java source to bytecode', correct: false, rationale: 'The compiler (javac) does this, not the JVM.' },
                { id: 'b', text: 'Executes bytecode on any platform', correct: true, rationale: 'The JVM interprets or JIT-compiles bytecode at runtime.' },
                { id: 'c', text: 'Writes Java programs', correct: false, rationale: 'Programmers write Java programs.' }
              ]
            },
            {
              id: 'q1_2_2',
              prompt: 'What is bytecode?',
              choices: [
                { id: 'a', text: 'The original Java source code', correct: false, rationale: 'Bytecode is compiled from source code.' },
                { id: 'b', text: 'Platform-independent intermediate code', correct: true, rationale: 'Bytecode can run on any platform with a JVM.' },
                { id: 'c', text: 'Machine code for a specific processor', correct: false, rationale: 'Bytecode is platform-independent, unlike machine code.' }
              ]
            }
          ]
        },
        {
          id: 'u1-3',
          title: 'Classes, Objects, and Constructors',
          description: 'Learn to create classes and instantiate objects in Java',
          content: {
            keyPoints: [
              'Class: blueprint defining fields and methods',
              'Object: runtime instance with state',
              'Constructor: special method initializing state',
              'Objects are created using the "new" keyword',
              'Each object has its own copy of instance variables'
            ],
            codeExample: {
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
              caption: 'A Point2D class with constructor and instance method'
            },
            workedExample: {
              title: 'Creating and Using Objects',
              explanation: 'Objects are instances of classes. Each object has its own state (field values).',
              code: {
                language: 'java',
                code: `Point2D p1 = new Point2D(0, 0);
Point2D p2 = new Point2D(3, 4);
double distance = p1.distanceTo(p2);
System.out.println("Distance: " + distance);  // Prints: Distance: 5.0`
              }
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Create a Rectangle class with width and height fields',
                'Add a constructor to initialize the rectangle',
                'Implement getArea() and getPerimeter() methods'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_3_1',
              prompt: 'What is the purpose of a constructor?',
              choices: [
                { id: 'a', text: 'To initialize an object\'s state', correct: true, rationale: 'Constructors set up the initial values for an object.' },
                { id: 'b', text: 'To delete objects', correct: false, rationale: 'Java has automatic garbage collection.' },
                { id: 'c', text: 'To print objects', correct: false, rationale: 'Constructors initialize, not print.' }
              ]
            }
          ]
        },
        {
          id: 'u1-4',
          title: 'Encapsulation and Information Hiding',
          description: 'Master the principle of encapsulation to write robust code',
          content: {
            keyPoints: [
              'Private fields; public methods (getters/setters)',
              'Invariants: conditions that must always hold',
              'Validation: enforce constraints in constructors and methods',
              'Encapsulation prevents invalid states',
              'Provides a stable interface while hiding implementation'
            ],
            workedExample: {
              title: 'BankAccount with Encapsulation',
              explanation: 'A BankAccount class enforces non-negative balance through private fields and validation.',
              code: {
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
  
  public double getBalance() {
    return balance;
  }
}`
              }
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Create a Student class with private GPA field (must be 0.0-4.0)',
                'Add validation in the constructor',
                'Implement addGrade() method that updates GPA with validation'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_4_1',
              prompt: 'Why does encapsulation reduce bugs?',
              choices: [
                { id: 'a', text: 'It hides fields behind a stable interface', correct: true, rationale: 'Prevents invalid states and centralizes validation.' },
                { id: 'b', text: 'It makes code shorter', correct: false, rationale: 'Length is unrelated to correctness.' },
                { id: 'c', text: 'It speeds up execution', correct: false, rationale: 'Encapsulation is about design, not performance.' }
              ]
            }
          ]
        },
        {
          id: 'u1-5',
          title: 'Static vs Instance Members',
          description: 'Understand when to use static and when to use instance methods and fields',
          content: {
            keyPoints: [
              'Static: belongs to class; shared across all instances',
              'Instance: belongs to object; each object has its own copy',
              'Static methods cannot access instance variables directly',
              'Use static for utility methods that don\'t depend on object state',
              'Use instance for behavior that varies per object'
            ],
            codeExample: {
              language: 'java',
              code: `public class MathUtils {
  // Static method - belongs to the class
  public static double square(double n) {
    return n * n;
  }
}

public class Counter {
  private int count = 0;  // Instance variable
  
  // Instance method - operates on object state
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
          practice: [
            {
              title: 'Practice',
              problems: [
                'When should a method be static?',
                'Create a Temperature class with instance method toCelsius()',
                'Create a TemperatureConverter class with static conversion methods'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_5_1',
              prompt: 'When should a method be static?',
              choices: [
                { id: 'a', text: 'When it needs to access instance fields', correct: false, rationale: 'Static methods cannot access instance fields directly.' },
                { id: 'b', text: 'When it is a utility that does not depend on object state', correct: true, rationale: 'Static methods are for class-level operations independent of instances.' },
                { id: 'c', text: 'Always, to save memory', correct: false, rationale: 'Static vs instance is about design, not optimization.' }
              ]
            }
          ]
        },
        {
          id: 'u1-6',
          title: 'Memory Model: Stack and Heap',
          description: 'Understand how Java manages memory with stack and heap',
          content: {
            keyPoints: [
              'Stack: holds method frames, local variables, references',
              'Heap: stores objects; garbage collected',
              'Variables hold references to objects, not the objects themselves',
              'Reference semantics: multiple variables can refer to same object',
              'Primitive types are stored by value, objects by reference'
            ],
            workedExample: {
              title: 'Reference Semantics',
              explanation: 'Two references can point to the same object; mutating via one is visible via the other.',
              code: {
                language: 'java',
                code: `Point2D p1 = new Point2D(3, 4);
Point2D p2 = p1;  // p2 references the same object
// Both p1 and p2 refer to the same Point2D object on the heap
// Changes through one reference are visible through the other`
              }
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Draw a memory diagram for: String s1 = "hello"; String s2 = s1;',
                'What happens when you modify an object through one reference?',
                'Explain the difference between reference equality (==) and object equality (.equals())'
              ]
            }
          ],
          quiz: [
            {
              id: 'q1_6_1',
              prompt: 'Where are objects stored in Java?',
              choices: [
                { id: 'a', text: 'On the stack', correct: false, rationale: 'The stack holds references, not objects.' },
                { id: 'b', text: 'On the heap', correct: true, rationale: 'All objects are allocated on the heap.' },
                { id: 'c', text: 'In registers', correct: false, rationale: 'Registers are CPU storage, not for objects.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 1 — GradeBook',
        spec: ['Model students, courses, grades with encapsulation.'],
        tasks: [
          'Implement Student, Course, GradeBook with invariants.',
          'recordGrade, averageForCourse, gpaForStudent.'
        ],
        extension: ['Validate ranges [0, 100] with exceptions.']
      },
      finalProject: {
        title: 'Mini-Project 1 — WordCounter',
        spec: ['Use Map<String,Integer> to compute most frequent word.'],
        focus: ['Choosing the right abstraction before coding.']
      },
      checklist: [
        'Explain abstraction with an original example',
        'Draw a stack/heap diagram for a simple program',
        'Choose static vs instance appropriately',
        'Write a class with proper encapsulation and invariants',
        'Trace reference semantics through aliasing'
      ]
    },
    {
      unitId: 'u2',
      unitNumber: 2,
      title: 'Arrays, ArrayLists, and Strings',
      overview: [
        'Understand array indexing, bounds, and reference semantics.',
        'Use ArrayList for dynamic collections; contrast with arrays.',
        'Master String operations: immutability, splitting, StringBuilder.'
      ],
      subUnits: [
        {
          id: 'u2-1',
          title: 'Array Fundamentals',
          description: 'Learn array declaration, indexing, and iteration',
          content: {
            keyPoints: [
              'Fixed size; zero-indexed',
              'Reference type; array variable holds reference to array object',
              'ArrayIndexOutOfBoundsException for invalid indices',
              'Length property: array.length',
              'Arrays are objects in Java'
            ],
            codeExample: {
              language: 'java',
              code: `int[] numbers = new int[5];
numbers[0] = 10;
numbers[1] = 20;
System.out.println(numbers.length);  // 5

for (int i = 0; i < numbers.length; i++) {
  System.out.println(numbers[i]);
}`,
              caption: 'Basic array operations'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Find the maximum value in an array',
                'Calculate the sum of all elements',
                'Count how many elements are greater than a threshold'
              ]
            }
          ],
          quiz: [
            {
              id: 'q2_1_1',
              prompt: 'What happens if you access arr[arr.length]?',
              choices: [
                { id: 'a', text: 'Returns the last element', correct: false, rationale: 'Last element is at arr.length - 1.' },
                { id: 'b', text: 'ArrayIndexOutOfBoundsException', correct: true, rationale: 'Indices are 0 to length-1.' },
                { id: 'c', text: 'Returns 0', correct: false, rationale: 'Java does not return a default; it throws an exception.' }
              ]
            }
          ]
        },
        {
          id: 'u2-2',
          title: 'ArrayList: Dynamic Arrays',
          description: 'Work with resizable collections using ArrayList',
          content: {
            keyPoints: [
              'Generic type: ArrayList<T>',
              'Methods: add, get, remove, size',
              'Automatic resizing; amortized O(1) append',
              'Must use wrapper classes for primitives (Integer, not int)',
              'More flexible than arrays but slightly slower'
            ],
            codeExample: {
              language: 'java',
              code: `ArrayList<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

System.out.println(names.size());  // 3
System.out.println(names.get(0));  // Alice

names.remove(1);  // Removes "Bob"
System.out.println(names.size());  // 2`,
              caption: 'ArrayList operations'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Remove duplicates from an ArrayList',
                'Find and remove all elements greater than a value',
                'Merge two ArrayLists into one'
              ]
            }
          ],
          quiz: [
            {
              id: 'q2_2_1',
              prompt: 'What is the main advantage of ArrayList over arrays?',
              choices: [
                { id: 'a', text: 'Dynamic resizing', correct: true, rationale: 'ArrayList can grow and shrink as needed.' },
                { id: 'b', text: 'Faster access', correct: false, rationale: 'Both have O(1) random access.' },
                { id: 'c', text: 'Uses less memory', correct: false, rationale: 'ArrayList typically uses more memory due to overhead.' }
              ]
            }
          ]
        },
        {
          id: 'u2-3',
          title: 'String Immutability and Operations',
          description: 'Master String manipulation and understand immutability',
          content: {
            keyPoints: [
              'String objects cannot be changed after creation',
              'Methods like substring, toLowerCase return new Strings',
              'Use == for reference equality; .equals() for content equality',
              'String concatenation with + creates new objects',
              'StringBuilder for efficient repeated concatenation'
            ],
            codeExample: {
              language: 'java',
              code: `String s1 = "hello";
String s2 = s1.toUpperCase();  // Creates new String
System.out.println(s1);  // Still "hello"
System.out.println(s2);  // "HELLO"

// Efficient concatenation with StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
  sb.append(i).append(" ");
}
String result = sb.toString();`,
              caption: 'String immutability and StringBuilder'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Count vowels in a String',
                'Reverse a String',
                'Check if a String is a palindrome (ignore case and spaces)'
              ]
            }
          ],
          quiz: [
            {
              id: 'q2_3_1',
              prompt: 'Why are Strings immutable in Java?',
              choices: [
                { id: 'a', text: 'Performance and security', correct: true, rationale: 'Immutability enables string pooling and prevents tampering.' },
                { id: 'b', text: 'To save memory', correct: false, rationale: 'Immutability can actually create more objects.' },
                { id: 'c', text: 'It is a mistake in the language design', correct: false, rationale: 'Immutability is intentional and beneficial.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 2 — TextAnalyzer',
        spec: ['Build a tool to analyze text files: word count, average word length, most common words.'],
        tasks: [
          'Read file into ArrayList<String> of lines.',
          'Tokenize, count, and sort words by frequency.'
        ],
        extension: ['Add sentiment scoring based on positive/negative word lists.']
      },
      finalProject: {
        title: 'Mini-Project 2 — Hangman Game',
        spec: ['Implement Hangman with a word list, guessing logic, and ASCII art display.'],
        focus: ['String manipulation, ArrayList for guesses, game state management.']
      },
      checklist: [
        'Iterate arrays and ArrayLists correctly',
        'Explain String immutability and its implications',
        'Use StringBuilder for efficient concatenation',
        'Handle edge cases (empty arrays, null)',
        'Choose between arrays and ArrayLists appropriately'
      ]
    },
    {
      unitId: 'u3',
      unitNumber: 3,
      title: 'Maps, Sets, and Hashing',
      overview: [
        'Use Map for key-value associations; understand HashMap vs TreeMap.',
        'Use Set for unique collections; HashSet vs TreeSet.',
        'Explain hashing: hash codes, collisions, and performance.'
      ],
      subUnits: [
        {
          id: 'u3-1',
          title: 'Map Interface and HashMap',
          description: 'Learn to use Maps for key-value associations',
          content: {
            keyPoints: [
              'Map<K, V>: associates keys with values',
              'HashMap: O(1) average for get, put, remove',
              'Keys must override equals and hashCode correctly',
              'No duplicate keys allowed',
              'Useful for counting, lookups, caching'
            ],
            codeExample: {
              language: 'java',
              code: `Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 88);
scores.put("Alice", 97);  // Updates Alice's score

System.out.println(scores.get("Alice"));  // 97
System.out.println(scores.containsKey("Bob"));  // true

for (String name : scores.keySet()) {
  System.out.println(name + ": " + scores.get(name));
}`,
              caption: 'HashMap basic operations'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Count word frequencies in a text',
                'Build a phone directory (name → phone number)',
                'Find the first non-repeated character in a string using a Map'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_1_1',
              prompt: 'What is the average time complexity of HashMap.get()?',
              choices: [
                { id: 'a', text: 'O(1)', correct: true, rationale: 'Hash tables provide constant average-time lookup.' },
                { id: 'b', text: 'O(log n)', correct: false, rationale: 'This is TreeMap complexity.' },
                { id: 'c', text: 'O(n)', correct: false, rationale: 'Linear search is not used in hash tables.' }
              ]
            }
          ]
        },
        {
          id: 'u3-2',
          title: 'Set Interface and HashSet',
          description: 'Work with sets to maintain unique collections',
          content: {
            keyPoints: [
              'Set<T>: collection with no duplicates',
              'HashSet: O(1) average for add, remove, contains',
              'Iteration order is unspecified',
              'Useful for membership testing, removing duplicates',
              'Elements must override equals and hashCode'
            ],
            codeExample: {
              language: 'java',
              code: `Set<String> uniqueWords = new HashSet<>();
uniqueWords.add("apple");
uniqueWords.add("banana");
uniqueWords.add("apple");  // Duplicate ignored

System.out.println(uniqueWords.size());  // 2

// Set operations
Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3));
Set<Integer> b = new HashSet<>(Arrays.asList(2, 3, 4));

Set<Integer> union = new HashSet<>(a);
union.addAll(b);  // {1, 2, 3, 4}

Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);  // {2, 3}`,
              caption: 'HashSet and set operations'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Remove duplicates from a list using a Set',
                'Find common elements between two lists',
                'Check if two strings are anagrams using Sets'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_2_1',
              prompt: 'What happens when you add a duplicate element to a Set?',
              choices: [
                { id: 'a', text: 'It throws an exception', correct: false, rationale: 'Sets silently ignore duplicates.' },
                { id: 'b', text: 'The duplicate is ignored', correct: true, rationale: 'Sets maintain uniqueness automatically.' },
                { id: 'c', text: 'It replaces the existing element', correct: false, rationale: 'Sets don\'t replace, they ignore duplicates.' }
              ]
            }
          ]
        },
        {
          id: 'u3-3',
          title: 'Hashing and equals/hashCode Contract',
          description: 'Understand hashing, collisions, and the equals/hashCode contract',
          content: {
            keyPoints: [
              'hashCode(): integer representation of object',
              'Equal objects must have equal hash codes',
              'Collisions: multiple keys with same hash',
              'Override both equals() and hashCode() together',
              'Consistent: a.equals(b) ⇒ a.hashCode() == b.hashCode()'
            ],
            codeExample: {
              language: 'java',
              code: `public class Person {
  private String name;
  private int age;
  
  @Override
  public boolean equals(Object obj) {
    if (this == obj) return true;
    if (!(obj instanceof Person)) return false;
    Person p = (Person) obj;
    return name.equals(p.name) && age == p.age;
  }
  
  @Override
  public int hashCode() {
    return Objects.hash(name, age);
  }
}`,
              caption: 'Proper equals and hashCode implementation'
            }
          },
          practice: [
            {
              title: 'Practice',
              problems: [
                'Why must equals() and hashCode() be overridden together?',
                'Create a Student class with proper equals/hashCode',
                'Explain what happens when hashCode is not overridden'
              ]
            }
          ],
          quiz: [
            {
              id: 'q3_3_1',
              prompt: 'Why must equals() and hashCode() be overridden together?',
              choices: [
                { id: 'a', text: 'To prevent compilation errors', correct: false, rationale: 'Java compiles fine without; it is a contract issue.' },
                { id: 'b', text: 'To ensure correct behavior in hash-based collections', correct: true, rationale: 'HashMap and HashSet rely on both methods.' },
                { id: 'c', text: 'To improve performance', correct: false, rationale: 'It is about correctness, not performance.' }
              ]
            }
          ]
        }
      ],
      finalLab: {
        title: 'Lab 3 — Concordance Builder',
        spec: ['Build an index mapping words to line numbers where they appear.'],
        tasks: [
          'Read text file; for each word, store a Set<Integer> of line numbers.',
          'Output words in alphabetical order with their line numbers.'
        ],
        extension: ['Support phrase search (multiple consecutive words).']
      },
      finalProject: {
        title: 'Mini-Project 3 — Social Network Graph',
        spec: ['Model friendships using Map<Person, Set<Person>>; implement BFS for degrees of separation.'],
        focus: ['Choosing appropriate collections; graph traversal.']
      },
      checklist: [
        'Choose Map vs Set appropriately for the problem',
        'Override equals() and hashCode() correctly',
        'Explain HashMap collision resolution',
        'Use TreeMap/TreeSet when order matters',
        'Understand time complexities of different collections'
      ]
    }
  ]
};

