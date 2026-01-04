// Basic Calculator logic (script.js)
(() => {
  const resultEl = document.getElementById('result');
  const historyEl = document.getElementById('history');
  const buttons = document.querySelectorAll('.btn');

  let current = '0';        // currently shown number (string)
  let expression = '';      // full expression shown in history (string)
  let justEvaluated = false;

  function updateDisplay() {
    resultEl.textContent = current;
    historyEl.textContent = expression;
  }

  function inputDigit(d) {
    if (justEvaluated) {
      // Start new entry if a digit pressed after evaluation
      current = (d === '.') ? '0.' : d;
      expression = '';
      justEvaluated = false;
      updateDisplay();
      return;
    }

    if (d === '.') {
      if (!current.includes('.')) current += '.';
    } else {
      if (current === '0') current = d;
      else current += d;
    }
    updateDisplay();
  }

  function applyOperator(op) {
    // If last action was evaluation, use result as starting expression
    if (justEvaluated) {
      expression = current;
      justEvaluated = false;
    }

    // Push current number onto expression, then operator
    if (expression === '' && current !== '') {
      expression = current + ' ' + op + ' ';
      current = '0';
    } else {
      // If expression already ends with operator, replace it
      if (/[+\-*/]\s$/.test(expression)) {
        expression = expression.slice(0, -3) + ' ' + op + ' ';
      } else {
        expression += current + ' ' + op + ' ';
        current = '0';
      }
    }
    updateDisplay();
  }

  function clearAll() {
    current = '0';
    expression = '';
    justEvaluated = false;
    updateDisplay();
  }

  function backspace() {
    if (justEvaluated) {
      // after evaluation, backspace resets current to 0
      current = '0';
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (current.length <= 1) current = '0';
    else current = current.slice(0, -1);
    updateDisplay();
  }

  function percent() {
    // Convert current to percent of 1 (e.g., 50 -> 0.5)
    const num = parseFloat(current);
    if (isNaN(num)) return;
    current = String(num / 100);
    updateDisplay();
  }

  function evaluateExpression() {
    // Build the final expression string
    let expr = expression;
    if (!/[+\-*/]\s$/.test(expr)) {
      // If expression doesn't already end with operator, append current
      expr = expr + (current !== '' ? current : '');
    } else {
      // if expression ends with operator, remove it (ignore)
      expr = expr.slice(0, -3);
    }

    if (!expr.trim()) return;

    // Replace × and ÷ symbols if any (we used * and / internally)
    // Evaluate safely: we permit only digits, spaces, operators, and decimal point
    if (!/^[0-9+\-*/. \s]+$/.test(expr)) {
      resultEl.textContent = 'Error';
      return;
    }

    try {
      // Use Function to evaluate—first sanitize contiguous operators
      const sanitized = expr.replace(/\s+/g, '');
      // Prevent evaluation of malformed operators sequences
      if (/[*\/]{2,}|[+\-]{3,}/.test(sanitized)) {
        resultEl.textContent = 'Error';
        return;
      }
      const value = Function('"use strict"; return (' + sanitized + ')')();
      if (!isFinite(value)) {
        current = 'Error';
      } else {
        current = String(Number.isInteger(value) ? value : parseFloat(value.toFixed(10)));
      }
      // Save the evaluated expression into the shared `expression` variable
      // so updateDisplay() shows the final history (expr + ' =') instead of
      // overwriting it.
      expression = expr + ' =';
      justEvaluated = true;
      updateDisplay();
    } catch (e) {
      resultEl.textContent = 'Error';
      current = '0';
      expression = '';
      justEvaluated = false;
    }
  }

  // Button clicks
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');

      if (val !== null) {
        inputDigit(val);
        return;
      }

      switch (action) {
        case 'clear': clearAll(); break;
        case 'back': backspace(); break;
        case 'percent': percent(); break;
        case '=': evaluateExpression(); break;
        default:
          // operator (+ - * /)
          applyOperator(action);
          break;
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (ev) => {
    const key = ev.key;
    if ((/^[0-9]$/).test(key)) {
      inputDigit(key);
      ev.preventDefault();
    } else if (key === '.') {
      inputDigit('.');
      ev.preventDefault();
    } else if (key === 'Backspace') {
      backspace();
      ev.preventDefault();
    } else if (key === 'Escape') {
      clearAll();
      ev.preventDefault();
    } else if (key === '%' ) {
      percent();
      ev.preventDefault();
    } else if (key === 'Enter' || key === '=') {
      evaluateExpression();
      ev.preventDefault();
    } else if (['+', '-', '*', '/'].includes(key)) {
      applyOperator(key);
      ev.preventDefault();
    }
  });

  // Initialize display
  updateDisplay();
})();
