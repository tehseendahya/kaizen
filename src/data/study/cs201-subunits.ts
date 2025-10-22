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
  unitId: 'u1' | 'u2' | 'u3' | 'u4' | 'u5';
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
  courseSubtitle: '5 UNITS • 15 SUB-UNITS',
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
              prompt: 'What is Computer Science primarily about?',
              choices: [
                { id: 'a', text: 'Writing as much code as possible', correct: false, rationale: 'CS is not about quantity of code, but quality of problem-solving.' },
                { id: 'b', text: 'Automating step-by-step problem-solving so it works at scale', correct: true, rationale: 'CS focuses on creating algorithms that can handle problems efficiently for many users.' },
                { id: 'c', text: 'Learning programming languages', correct: false, rationale: 'Languages are tools, not the core of CS.' }
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
              prompt: 'Why does scale matter in system design?',
              choices: [
                { id: 'a', text: 'Small inefficiencies and biases multiply into large problems', correct: true, rationale: 'At scale, tiny issues affect millions of users and become significant.' },
                { id: 'b', text: 'Larger systems always run faster', correct: false, rationale: 'Scale often introduces complexity and slowdowns if not designed well.' },
                { id: 'c', text: 'Scale only matters for social media apps', correct: false, rationale: 'Scale affects any system serving many users.' }
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
              prompt: 'What did Latanya Sweeney\'s research demonstrate?',
              choices: [
                { id: 'a', text: 'Date of birth + gender + ZIP code can identify most Americans', correct: true, rationale: 'This combination of "anonymous" data points can uniquely identify individuals.' },
                { id: 'b', text: 'Removing names makes data completely anonymous', correct: false, rationale: 'Other data combinations can still identify people.' },
                { id: 'c', text: 'Privacy doesn\'t matter for public data', correct: false, rationale: 'Public data can be combined to reveal private information.' }
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
              prompt: 'What is the result of 3/2 in Java?',
              choices: [
                { id: 'a', text: '1.5', correct: false, rationale: 'When both operands are integers, Java performs integer division.' },
                { id: 'b', text: '1', correct: true, rationale: 'Integer division drops the decimal part.' },
                { id: 'c', text: 'A compile error', correct: false, rationale: 'This is valid Java code.' }
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
              prompt: 'What does a variable hold when it refers to an object?',
              choices: [
                { id: 'a', text: 'The actual object data', correct: false, rationale: 'The variable holds a reference, not the object itself.' },
                { id: 'b', text: 'A reference (address) to the object', correct: true, rationale: 'Object variables store references that point to objects in memory.' },
                { id: 'c', text: 'Nothing until you call a method', correct: false, rationale: 'The reference is stored as soon as you assign it.' }
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
              prompt: 'What is the correct way to compare two strings for the same content?',
              choices: [
                { id: 'a', text: 'Use ==', correct: false, rationale: '== checks if they\'re the same object, not the same content.' },
                { id: 'b', text: 'Use .equals()', correct: true, rationale: '.equals() compares the actual characters in the strings.' },
                { id: 'c', text: 'Either one works', correct: false, rationale: 'They have different meanings and different results.' }
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
              prompt: 'What are the two main things a class defines?',
              choices: [
                { id: 'a', text: 'Primitives and objects', correct: false, rationale: 'Classes define structure, not type categories.' },
                { id: 'b', text: 'State (data) and behavior (methods)', correct: true, rationale: 'A class is a blueprint specifying what data objects store and what they can do.' },
                { id: 'c', text: 'Variables and constants', correct: false, rationale: 'This is too narrow—classes define the full structure of objects.' }
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
              prompt: 'What does it mean for an object to be immutable?',
              choices: [
                { id: 'a', text: 'It cannot be created', correct: false, rationale: 'Immutable objects can be created, they just can\'t be modified.' },
                { id: 'b', text: 'It never changes after creation', correct: true, rationale: 'Immutable objects have fixed state after construction.' },
                { id: 'c', text: 'It has no methods', correct: false, rationale: 'Immutable objects can have many methods, they just don\'t change state.' }
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
              prompt: 'What is special about a constructor?',
              choices: [
                { id: 'a', text: 'It has the same name as the class', correct: true, rationale: 'Constructors are named exactly like their class.' },
                { id: 'b', text: 'It must return void', correct: false, rationale: 'Constructors have no return type at all.' },
                { id: 'c', text: 'It can only be called once', correct: false, rationale: 'You can create many objects with the same constructor.' }
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
              prompt: 'When is toString() automatically called?',
              choices: [
                { id: 'a', text: 'Only when you explicitly call it', correct: false, rationale: 'Java calls it automatically in many situations.' },
                { id: 'b', text: 'When you print an object', correct: true, rationale: 'System.out.println automatically calls toString().' },
                { id: 'c', text: 'Never automatically', correct: false, rationale: 'Java\'s print system calls it for you.' }
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
              prompt: 'Why should you commit small changes often?',
              choices: [
                { id: 'a', text: 'To slow down your work', correct: false, rationale: 'Frequent commits actually help you work faster.' },
                { id: 'b', text: 'To track progress and have recovery points', correct: true, rationale: 'Small commits make it easy to undo mistakes and see what changed.' },
                { id: 'c', text: 'Because Gradescope requires it', correct: false, rationale: 'Gradescope doesn\'t mandate commit frequency.' }
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
              prompt: 'What is the main advantage of ArrayList over arrays?',
              choices: [
                { id: 'a', text: 'It\'s faster', correct: false, rationale: 'Both have similar access speed.' },
                { id: 'b', text: 'It can grow and shrink dynamically', correct: true, rationale: 'ArrayList adjusts size automatically as you add/remove elements.' },
                { id: 'c', text: 'It uses less memory', correct: false, rationale: 'ArrayList may use more memory due to its flexibility.' }
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
              prompt: 'What happens when you add a duplicate to a HashSet?',
              choices: [
                { id: 'a', text: 'It throws an exception', correct: false, rationale: 'HashSet silently ignores duplicates.' },
                { id: 'b', text: 'The duplicate is silently ignored', correct: true, rationale: 'Sets keep only unique elements.' },
                { id: 'c', text: 'It creates a second copy', correct: false, rationale: 'Sets maintain uniqueness automatically.' }
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
              prompt: 'What does Set.add() return?',
              choices: [
                { id: 'a', text: 'Always true', correct: false, rationale: 'It returns false if the element was already in the set.' },
                { id: 'b', text: 'true if added, false if already present', correct: true, rationale: 'This return value is useful for detecting duplicates.' },
                { id: 'c', text: 'The size of the set', correct: false, rationale: 'It returns a boolean, not a number.' }
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
              prompt: 'Why should you use private helper methods?',
              choices: [
                { id: 'a', text: 'To make code run faster', correct: false, rationale: 'Helper methods improve readability, not performance.' },
                { id: 'b', text: 'To break complex logic into testable pieces', correct: true, rationale: 'Small methods are easier to understand, test, and maintain.' },
                { id: 'c', text: 'Because Java requires it', correct: false, rationale: 'It\'s a best practice, not a requirement.' }
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
              prompt: 'Why do we handle the all-vowels case first?',
              choices: [
                { id: 'a', text: 'For performance', correct: false, rationale: 'It\'s about correctness, not speed.' },
                { id: 'b', text: 'To avoid empty results from the main logic', correct: true, rationale: 'Special cases need special handling before applying general rules.' },
                { id: 'c', text: 'Because Java requires it', correct: false, rationale: 'It\'s a logical design choice, not a language requirement.' }
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
              prompt: 'What does "a,b,c".split(",") return?',
              choices: [
                { id: 'a', text: 'A String', correct: false, rationale: 'split() returns an array of strings.' },
                { id: 'b', text: 'An array: ["a", "b", "c"]', correct: true, rationale: 'split() divides the string at each separator.' },
                { id: 'c', text: 'An ArrayList', correct: false, rationale: 'It returns an array, not an ArrayList.' }
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
              prompt: 'What happens to duplicates when you convert a List to a Set?',
              choices: [
                { id: 'a', text: 'They cause an error', correct: false, rationale: 'Sets handle duplicates gracefully.' },
                { id: 'b', text: 'They are automatically removed', correct: true, rationale: 'Sets only store unique elements.' },
                { id: 'c', text: 'They are kept', correct: false, rationale: 'Sets eliminate duplicates by definition.' }
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
              prompt: 'Why is StringBuilder faster than string concatenation in a loop?',
              choices: [
                { id: 'a', text: 'It uses less memory', correct: false, rationale: 'The main benefit is avoiding repeated object creation.' },
                { id: 'b', text: 'It avoids creating new String objects on each append', correct: true, rationale: 'StringBuilder modifies in place, avoiding expensive String copying.' },
                { id: 'c', text: 'It\'s a newer feature', correct: false, rationale: 'Age doesn\'t determine performance.' }
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
    }
  ]
};
