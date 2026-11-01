import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Square, RotateCcw, Trash2, Save, Send, Code2,
  Terminal, Sparkles, CheckCircle2, AlertCircle, Info,
  Smartphone, Monitor, ChevronDown, Check, Loader2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

interface PythonCodingLabProps {
  courseId: string;
  courseTitle: string;
  initialCode?: string;
  practicalId?: string;
}

const STARTER_SNIPPETS = [
  {
    title: 'Hello, World!',
    category: 'Basics',
    code: `# SkillNova Python Coding Lab
# First program: Print output to standard console

print("Hello, World!")
print("Welcome to SkillNova's WebAssembly Python Runtime!")
`
  },
  {
    title: 'Interactive Input & Greeting',
    category: 'Input/Output',
    code: `# Interactive User Input
# Enter your name in the input box below before clicking Run Code

name = input("Enter your name: ")
role = input("Enter your prospective tech role: ")

print(f"\\n--- Candidate Profile ---")
print(f"Student: {name}")
print(f"Target Career: {role}")
print(f"Status: Enrolled in SkillNova Engineering Track")
`
  },
  {
    title: 'Variables & Data Types',
    category: 'Basics',
    code: `# Python Variables and Dynamic Typing
student_name = "Aarav Sharma"
semester_gpa = 8.85
enrolled_courses = 3
is_active = True

print(f"Student: {student_name} (Type: {type(student_name).__name__})")
print(f"GPA: {semester_gpa} (Type: {type(semester_gpa).__name__})")
print(f"Active Status: {is_active} (Type: {type(is_active).__name__})")
`
  },
  {
    title: 'If / Else Conditionals',
    category: 'Control Flow',
    code: `# Decision Making in Python
score = 85

print(f"Evaluation Score: {score}")

if score >= 90:
    grade = "A+ (Outstanding)"
elif score >= 80:
    grade = "A (Very Good - Industry Ready)"
elif score >= 70:
    grade = "B (Good - Keep Building Projects)"
else:
    grade = "C (Needs Revision)"

print(f"Final Assessment Grade: {grade}")
`
  },
  {
    title: 'For & While Loops',
    category: 'Control Flow',
    code: `# Iterations and Loops in Python
technologies = ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "PyTorch"]

print("--- Iterating with For Loop ---")
for index, tech in enumerate(technologies, start=1):
    print(f"{index}. Mastering {tech}")

print("\\n--- While Loop Fibonacci Sequence ---")
a, b = 0, 1
count = 0
while count < 8:
    print(f"Fib({count}): {a}")
    a, b = b, a + b
    count += 1
`
  },
  {
    title: 'Functions & Return Values',
    category: 'Functions',
    code: `# Functions with Type Hints and Docstrings
def calculate_grade_point(credits: list[int], grades: list[float]) -> float:
    """Calculates weighted semester Grade Point Average."""
    total_credit_points = sum(c * g for c, g in zip(credits, grades))
    total_credits = sum(credits)
    return round(total_credit_points / total_credits, 2)

course_credits = [4, 4, 3, 2] # Data Structures, AI, Database, Lab
course_grades = [9.0, 8.5, 9.2, 10.0]

sgpa = calculate_grade_point(course_credits, course_grades)
print(f"Semester Weighted Grade Point: {sgpa} / 10.0")
`
  },
  {
    title: 'Lists & List Comprehensions',
    category: 'Data Structures',
    code: `# Python Lists & Functional Comprehensions
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Filter even numbers and compute their squares
squared_evens = [n ** 2 for n in numbers if n % 2 == 0]

print("Original Numbers:", numbers)
print("Squared Even Numbers:", squared_evens)
print("Sum of Squares:", sum(squared_evens))
`
  },
  {
    title: 'Dictionaries & Key Lookups',
    category: 'Data Structures',
    code: `# Dictionaries and Structured Data
student_record = {
    "id": "SN-2026-001",
    "name": "Aarav Sharma",
    "cohort": "Batch 2027",
    "skills": ["Python", "TypeScript", "SQL"],
    "verified_projects": 4
}

for key, value in student_record.items():
    print(f"{key.capitalize()}: {value}")
`
  },
  {
    title: 'Object-Oriented Classes',
    category: 'OOP',
    code: `# Classes and Object-Oriented Programming
class EngineeringStudent:
    def __init__(self, name: str, branch: str, batch: int):
        self.name = name
        self.branch = branch
        self.batch = batch
        self.completed_labs = []

    def submit_lab(self, lab_title: str):
        self.completed_labs.append(lab_title)
        print(f"[SUCCESS] {self.name} submitted practical: '{lab_title}'")

    def display_status(self):
        print(f"\\nStudent: {self.name} | Branch: {self.branch} | Batch: {self.batch}")
        print(f"Total Completed Practicals: {len(self.completed_labs)}")

# Instantiate student object
student = EngineeringStudent("Aarav Sharma", "Computer Science", 2027)
student.submit_lab("Lab 1: Python Pyodide Execution")
student.submit_lab("Lab 2: Dynamic Programming & Binary Search")
student.display_status()
`
  },
  {
    title: 'Practical: Binary Search Algorithm',
    category: 'Algorithms',
    code: `# Practical Assignment: Binary Search Implementation
def binary_search(arr: list[int], target: int) -> int:
    """Returns index of target if found in sorted array, else -1."""
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

dataset = [12, 24, 35, 47, 59, 68, 73, 85, 96, 110]
search_key = 73

result_idx = binary_search(dataset, search_key)

print(f"Sorted Dataset: {dataset}")
print(f"Search Target: {search_key}")
if result_idx != -1:
    print(f"Element verified at Index: {result_idx}")
else:
    print("Element not found in dataset.")
`
  }
];

export const PythonCodingLab: React.FC<PythonCodingLabProps> = ({
  courseId,
  courseTitle,
  initialCode,
  practicalId = 'lab-py-01'
}) => {
  const { currentUser } = useAuth();
  const [code, setCode] = useState(
    initialCode ||
    localStorage.getItem(`skillnova_code_${courseId}_${practicalId}`) ||
    STARTER_SNIPPETS[0].code
  );

  const [inputLines, setInputLines] = useState<string>('Aarav Sharma\nFull Stack Developer');
  const [outputLogs, setOutputLogs] = useState<{ type: 'stdout' | 'stderr' | 'info'; text: string }[]>([
    { type: 'info', text: 'SkillNova Python 3.12 WebAssembly Runtime ready.\nClick "Run Code" to execute in browser thread.\n' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [isRuntimeReady, setIsRuntimeReady] = useState(false);
  const [runtimeStatusMessage, setRuntimeStatusMessage] = useState('Initializing WebAssembly runtime...');
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'input' | 'output'>('editor');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Pyodide Web Worker
  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker('/pyodide-worker.js');
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, message, text, error, durationMs } = e.data;

        if (type === 'STATUS') {
          setRuntimeStatusMessage(message);
        } else if (type === 'READY') {
          setIsRuntimeReady(true);
          setRuntimeStatusMessage('Python 3 WebAssembly runtime ready');
        } else if (type === 'STDOUT') {
          setOutputLogs(prev => [...prev, { type: 'stdout', text }]);
        } else if (type === 'STDERR') {
          setOutputLogs(prev => [...prev, { type: 'stderr', text }]);
        } else if (type === 'RUN_START') {
          setIsRunning(true);
        } else if (type === 'RUN_COMPLETE') {
          setIsRunning(false);
          setExecutionTimeMs(durationMs);
          setOutputLogs(prev => [...prev, { type: 'info', text: `\n[Program Finished in ${durationMs}ms with Exit Code 0]` }]);
        } else if (type === 'RUNTIME_ERROR') {
          setIsRunning(false);
          setOutputLogs(prev => [...prev, { type: 'stderr', text: `\nTraceback (most recent call last):\n${error}` }]);
        } else if (type === 'INPUT_REQUEST') {
          // If the worker asks for interactive input and queue is empty
          setOutputLogs(prev => [...prev, { type: 'info', text: `[Input Requested from User]` }]);
        }
      };

      // Trigger pre-warming initialization
      worker.postMessage({ type: 'INIT' });
    } catch (err) {
      console.warn('Worker creation fallback:', err);
    }

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  const handleRunCode = () => {
    setOutputLogs([{ type: 'info', text: `>>> Executing Python script on ${new Date().toLocaleTimeString()}...\n` }]);
    setExecutionTimeMs(null);

    // Parse input lines array
    const inputs = inputLines.split('\n');

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'RUN',
        code,
        inputs
      });
    } else {
      setOutputLogs(prev => [...prev, { type: 'stderr', text: 'Error: Python runtime worker is not active.' }]);
    }

    // Switch to output console on mobile
    if (window.innerWidth < 768) {
      setActiveMobileTab('output');
    }
  };

  const handleStopExecution = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      setIsRunning(false);
      setOutputLogs(prev => [...prev, { type: 'stderr', text: '\n[Execution forcefully stopped by user]' }]);

      // Recreate worker
      const newWorker = new Worker('/pyodide-worker.js');
      workerRef.current = newWorker;
      newWorker.onmessage = (e) => {
        const { type, text, error, durationMs } = e.data;
        if (type === 'READY') setIsRuntimeReady(true);
        if (type === 'STDOUT') setOutputLogs(prev => [...prev, { type: 'stdout', text }]);
        if (type === 'STDERR') setOutputLogs(prev => [...prev, { type: 'stderr', text }]);
        if (type === 'RUN_COMPLETE') {
          setIsRunning(false);
          setExecutionTimeMs(durationMs);
        }
        if (type === 'RUNTIME_ERROR') {
          setIsRunning(false);
          setOutputLogs(prev => [...prev, { type: 'stderr', text: `\n${error}` }]);
        }
      };
      newWorker.postMessage({ type: 'INIT' });
    }
  };

  const handleClearOutput = () => {
    setOutputLogs([]);
    setExecutionTimeMs(null);
  };

  const handleResetCode = () => {
    if (window.confirm('Reset editor to starter template? Your current unsaved changes will be cleared.')) {
      setCode(STARTER_SNIPPETS[0].code);
      localStorage.removeItem(`skillnova_code_${courseId}_${practicalId}`);
    }
  };

  const handleSelectSnippet = (snippetCode: string) => {
    setCode(snippetCode);
  };

  const handleSaveCode = () => {
    localStorage.setItem(`skillnova_code_${courseId}_${practicalId}`, code);
    dataService.saveStudentCode({
      student_id: currentUser?.id || 'usr-student-1',
      course_id: courseId,
      practical_id: practicalId,
      source_code: code,
      status: 'saved'
    });

    setSaveFeedback('Code saved locally & synced to profile');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleSubmitPractical = () => {
    if (window.confirm('Submit this practical assignment for mentor evaluation?')) {
      dataService.submitStudentPractical({
        student_id: currentUser?.id || 'usr-student-1',
        student_name: currentUser?.full_name || 'Aarav Sharma',
        course_id: courseId,
        course_title: courseTitle,
        practical_id: practicalId,
        source_code: code,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });

      setSubmissionFeedback('Practical submitted successfully to your faculty mentor!');
      setTimeout(() => setSubmissionFeedback(null), 4500);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner: Controls, Snippet Selector & Mobile Panel Tabs */}
      <div className="bg-white rounded-3xl border border-[#DFE9F6] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title and Runtime Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center shrink-0 border border-[#00A3FF]/25 shadow-xs">
            <Code2 className="w-5 h-5 text-[#176BFF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#15243B]">Python 3 Coding Lab</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-[#EAF3FF] text-[#00A3FF] border border-[#00A3FF]/20">
                Pyodide Wasm
              </span>
            </div>
            <div className="text-[11px] text-[#73839B] flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isRuntimeReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span>{runtimeStatusMessage}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Starter Template Selector */}
          <div className="relative">
            <select
              onChange={(e) => {
                const selected = STARTER_SNIPPETS.find(s => s.title === e.target.value);
                if (selected) handleSelectSnippet(selected.code);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-semibold text-[#15243B] focus:outline-hidden focus:border-[#176BFF]"
            >
              <option value="">Snippets & Templates...</option>
              {STARTER_SNIPPETS.map(s => (
                <option key={s.title} value={s.title}>
                  [{s.category}] {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            title="Reset code to starter template"
            className="p-2 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-[#73839B] hover:text-[#15243B] transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Code */}
          <button
            onClick={handleSaveCode}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-bold text-[#15243B] flex items-center gap-1.5 transition shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-[#176BFF]" />
            <span>Save</span>
          </button>

          {/* Submit Practical */}
          <button
            onClick={handleSubmitPractical}
            className="px-3.5 py-1.5 rounded-xl bg-[#EAF3FF] hover:bg-[#d8e9ff] border border-[#00A3FF]/30 text-xs font-bold text-[#176BFF] flex items-center gap-1.5 transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span>Submit Practical</span>
          </button>

          {/* Stop Button */}
          {isRunning && (
            <button
              onClick={handleStopExecution}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-red-500/20"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          )}

          {/* Run Code Primary Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-black shadow-md shadow-[#00A3FF]/25 flex items-center gap-2 transition hover:scale-102"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {saveFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {submissionFeedback && (
        <div className="p-3 bg-[#EAF3FF] border border-[#00A3FF]/30 rounded-2xl text-xs font-bold text-[#176BFF] flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#00D9FF]" />
          <span>{submissionFeedback}</span>
        </div>
      )}

      {/* Mobile Tab Switcher (Visible on small screens) */}
      <div className="flex md:hidden items-center gap-1 p-1 bg-white rounded-2xl border border-[#DFE9F6]">
        <button
          onClick={() => setActiveMobileTab('editor')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeMobileTab === 'editor' ? 'bg-[#176BFF] text-white shadow-xs' : 'text-[#73839B]'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveMobileTab('input')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeMobileTab === 'input' ? 'bg-[#176BFF] text-white shadow-xs' : 'text-[#73839B]'
          }`}
        >
          STDIN
        </button>
        <button
          onClick={() => setActiveMobileTab('output')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeMobileTab === 'output' ? 'bg-[#176BFF] text-white shadow-xs' : 'text-[#73839B]'
          }`}
        >
          Console
        </button>
      </div>

      {/* Main Coding Workspace (Split Editor / Console) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Monaco Code Editor */}
        <div className={`md:col-span-7 rounded-3xl overflow-hidden border border-[#DFE9F6] bg-white shadow-xs flex flex-col ${
          activeMobileTab !== 'editor' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Editor Header Bar */}
          <div className="h-10 bg-[#F5F9FF] border-b border-[#DFE9F6] px-4 flex items-center justify-between text-xs font-bold text-[#73839B]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#176BFF]" />
              <span className="text-[#15243B]">main.py</span>
            </div>
            <span className="text-[10px] font-mono text-[#00A3FF]">Python 3.12</span>
          </div>

          {/* Monaco Editor Component */}
          <div className="h-[440px] md:h-[480px]">
            <Editor
              height="100%"
              defaultLanguage="python"
              language="python"
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs"
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
                suggestOnTriggerCharacters: true,
                quickSuggestions: { other: true, comments: false, strings: false }
              }}
            />
          </div>
        </div>

        {/* Right Column: Standard Input & Output Console */}
        <div className={`md:col-span-5 flex-col space-y-4 ${
          activeMobileTab === 'editor' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Standard Input (input()) Section */}
          <div className={`rounded-3xl border border-[#DFE9F6] bg-white p-4 shadow-xs space-y-2 ${
            activeMobileTab === 'output' ? 'hidden md:block' : 'block'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold text-[#15243B]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#176BFF]" />
                Standard Input (stdin for input())
              </span>
              <span className="text-[10px] text-[#73839B] font-mono">1 line per prompt</span>
            </div>
            <textarea
              rows={2}
              value={inputLines}
              onChange={(e) => setInputLines(e.target.value)}
              placeholder="Values provided to input() statements (separated by newline)..."
              className="w-full p-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-mono text-[#15243B] focus:outline-hidden focus:border-[#176BFF]"
            />
          </div>

          {/* Output Terminal Console */}
          <div className={`flex-1 rounded-3xl overflow-hidden border border-[#DFE9F6] bg-[#15243B] text-[#F5F9FF] shadow-xs flex flex-col ${
            activeMobileTab === 'input' ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Terminal Header */}
            <div className="h-10 bg-[#101A2D] border-b border-white/10 px-4 flex items-center justify-between text-xs font-bold text-[#9BAAC2]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-white">Console Output</span>
                {executionTimeMs !== null && (
                  <span className="text-[10px] font-mono text-[#00D9FF]">
                    ({executionTimeMs}ms)
                  </span>
                )}
              </div>

              <button
                onClick={handleClearOutput}
                className="text-[11px] hover:text-white flex items-center gap-1 text-[#9BAAC2] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* Terminal Content Stream */}
            <div className="p-4 flex-1 h-[320px] md:h-[360px] overflow-y-auto font-mono text-xs leading-relaxed space-y-1">
              {outputLogs.map((log, idx) => (
                <pre
                  key={idx}
                  className={`whitespace-pre-wrap ${
                    log.type === 'stdout'
                      ? 'text-emerald-300'
                      : log.type === 'stderr'
                      ? 'text-rose-400'
                      : 'text-[#00D9FF]/80 italic'
                  }`}
                >
                  {log.text}
                </pre>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
