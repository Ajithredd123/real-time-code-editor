// src/components/OutputPanel.js
import React, { useState } from 'react';
import './OutputPanel.css';

const OutputPanel = ({ code, language }) => {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      if (language === 'javascript') {
        // Run JavaScript code
        runJavaScript(code);
      } else {
        // For other languages, use Piston API
        await runWithPistonAPI(code, language);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const runJavaScript = (code) => {
    try {
      // Capture console.log output
      const logs = [];
      const originalLog = console.log;
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // Execute code
      // eslint-disable-next-line no-eval
      eval(code);

      // Restore console.log
      console.log = originalLog;

      setOutput(logs.join('\n') || 'Code executed successfully (no output)');
    } catch (err) {
      setError(err.message);
    }
  };

  const runWithPistonAPI = async (code, language) => {
    // Map language names to Piston API language IDs
    const languageMap = {
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'typescript': 'typescript',
      'go': 'go',
      'rust': 'rust',
      'ruby': 'ruby',
      'php': 'php'
    };

    const pistonLanguage = languageMap[language] || language;

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: pistonLanguage,
          version: '*',
          files: [
            {
              content: code,
            },
          ],
        }),
      });

      const result = await response.json();

      if (result.run) {
        const output = result.run.output || result.run.stdout || '';
        const stderr = result.run.stderr || '';
        
        if (stderr) {
          setError(stderr);
        }
        if (output) {
          setOutput(output);
        }
        if (!output && !stderr) {
          setOutput('Code executed successfully (no output)');
        }
      } else {
        setError('Failed to execute code');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError('');
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <h3>Output</h3>
        <div className="output-actions">
          <button 
            onClick={runCode} 
            disabled={isRunning}
            className="run-btn"
          >
            {isRunning ? '⏳ Running...' : '▶ Run Code'}
          </button>
          <button onClick={clearOutput} className="clear-btn">
            🗑️ Clear
          </button>
        </div>
      </div>
      
      <div className="output-content">
        {isRunning && (
          <div className="output-loading">
            <div className="spinner"></div>
            <span>Executing code...</span>
          </div>
        )}
        
        {error && (
          <div className="output-error">
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        )}
        
        {output && (
          <div className="output-success">
            <pre>{output}</pre>
          </div>
        )}
        
        {!isRunning && !output && !error && (
          <div className="output-empty">
            <p>💡 Click "Run Code" to see the output</p>
            <small>JavaScript runs in browser, other languages use Piston API</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;