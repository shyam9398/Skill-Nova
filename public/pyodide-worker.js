// Pyodide Web Worker for SkillNova Python Coding Lab
// Runs completely inside an isolated browser thread using WebAssembly.
// Does NOT block the UI thread and requires zero third-party paid execution servers.

let pyodide = null;
let isInitializing = false;
let pendingInputResolver = null;

// Load Pyodide from official CDN
async function initPyodide() {
  if (pyodide) return pyodide;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 100));
    }
    return pyodide;
  }

  isInitializing = true;
  try {
    self.postMessage({ type: 'STATUS', message: 'Loading Python 3 WebAssembly runtime...' });
    
    // Import Pyodide script
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
    
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      stdout: (text) => {
        self.postMessage({ type: 'STDOUT', text: text + '\n' });
      },
      stderr: (text) => {
        self.postMessage({ type: 'STDERR', text: text + '\n' });
      }
    });

    // Custom Python input hook that communicates synchronously via worker messaging
    await pyodide.runPythonAsync(`
import sys
import js

# Custom standard output and input bridges
class SkillNovaIO:
    def __init__(self):
        pass

def _skillnova_custom_input(prompt=''):
    if prompt:
        sys.stdout.write(prompt)
        sys.stdout.flush()
    # Request input from main thread
    val = js.self.syncInputBridge(prompt)
    return str(val)

import builtins
builtins.input = _skillnova_custom_input
`);

    self.postMessage({ type: 'READY' });
    isInitializing = false;
    return pyodide;
  } catch (err) {
    isInitializing = false;
    self.postMessage({ type: 'ERROR', error: 'Failed to initialize Pyodide runtime: ' + String(err) });
    throw err;
  }
}

// Handler for input bridge from main thread
self.syncInputBridge = (prompt) => {
  // Post prompt to main thread
  self.postMessage({ type: 'INPUT_REQUEST', prompt });
  
  // Note: in synchronous worker context with standard XMLHttpRequest or Atomics.
  // For standard workers without SharedArrayBuffer, we fallback to pre-collected input queue.
  if (self.inputQueue && self.inputQueue.length > 0) {
    return self.inputQueue.shift();
  }
  return "";
};

self.inputQueue = [];

self.onmessage = async (e) => {
  const { type, code, inputs } = e.data;

  if (type === 'INIT') {
    try {
      await initPyodide();
    } catch (err) {
      // Handled in initPyodide
    }
  } else if (type === 'RUN') {
    try {
      const py = await initPyodide();
      self.inputQueue = Array.isArray(inputs) ? [...inputs] : [];
      
      const startTime = performance.now();
      self.postMessage({ type: 'RUN_START' });

      // Run user code
      await py.runPythonAsync(code);

      const durationMs = Math.round(performance.now() - startTime);
      self.postMessage({ type: 'RUN_COMPLETE', durationMs });
    } catch (err) {
      let cleanMessage = String(err);
      if (err.message) {
        cleanMessage = err.message;
      }
      self.postMessage({ type: 'RUNTIME_ERROR', error: cleanMessage });
    }
  } else if (type === 'INPUT_RESPONSE') {
    self.inputQueue.push(e.data.value || '');
  }
};
