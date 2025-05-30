javascript:(function() {
  // Prevent multiple instances from loading
  if (window.__devToolLoaded) {
    const existingTool = document.getElementById('devTool');
    if (existingTool) {
      // Toggle visibility if already loaded
      existingTool.style.display = existingTool.style.display === 'none' ? 'flex' : 'none';
      if (existingTool.style.display === 'flex') {
        // Restore position if showing from hidden
        const storedLeft = localStorage.getItem('devToolLeft');
        const storedTop = localStorage.getItem('devToolTop');
        if (storedLeft && storedTop) {
            existingTool.style.left = storedLeft;
            existingTool.style.top = storedTop;
            existingTool.style.bottom = 'auto';
            existingTool.style.right = 'auto';
        }
      }
    }
    return;
  }
  window.__devToolLoaded = true;

  // --- Styles ---
  const style = document.createElement("style");
  style.textContent = `
    #devTool {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 320px;
      height: 280px;
      z-index: 99999;
      font-family: 'SF Mono', 'Roboto Mono', monospace;
      background: #282c34; /* Darker background */
      color: #abb2bf; /* Light text */
      border: 1px solid #3e4451;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      resize: both; /* Allow resizing */
      overflow: hidden; /* Hide overflow when resizing */
      min-width: 250px;
      min-height: 200px;
      /* Ensure it stays within viewport on smaller screens */
      max-width: 98vw;
      max-height: 98vh;
      box-sizing: border-box; /* Include padding and border in width/height */
      touch-action: none; /* Prevent browser touch actions like pull-to-refresh */
    }
    #devToolHeader {
      background: #21252b; /* Slightly darker header */
      padding: 8px 12px;
      cursor: grab; /* Indicates draggable */
      user-select: none;
      font-weight: bold;
      border-bottom: 1px solid #3e4451;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #61afef; /* Header title color */
    }
    #devToolHeader.dragging {
        cursor: grabbing;
    }
    #devTool textarea {
      flex: 1;
      padding: 8px;
      font-size: 13px;
      border: none;
      outline: none;
      resize: none;
      background: #1c2025; /* Even darker for textarea */
      color: #abb2bf;
      line-height: 1.5;
    }
    #devTool textarea::placeholder {
        color: #636d83;
    }
    #devToolFooter {
      display: flex;
      gap: 6px;
      padding: 8px;
      background: #21252b;
      border-top: 1px solid #3e4451;
      flex-wrap: wrap;
      justify-content: center;
    }
    #devToolFooter button {
      flex: 1;
      min-width: 80px; /* Ensure buttons don't get too small */
      padding: 6px 10px;
      font-size: 12px;
      background: #3a404b;
      color: #abb2bf;
      border: 1px solid #4a505c;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.1s ease;
    }
    #devToolFooter button:hover {
      background: #4a505c;
      transform: translateY(-1px);
    }
    #devToolFooter button:active {
        transform: translateY(0);
        background: #5a606c;
    }
    #devToolPath, #devToolLog {
      font-size: 11px;
      padding: 6px 10px;
      border-top: 1px solid #3e4451;
      background: #1c2025;
      color: #abb2bf;
      overflow: auto;
      max-height: 60px; /* Slightly increased for more visibility */
      white-space: pre-wrap;
      word-break: break-word; /* Prevent long words from breaking layout */
      line-height: 1.4;
    }
    #devToolLog span.log-info { color: #61afef; } /* Blue for info */
    #devToolLog span.log-success { color: #98c379; } /* Green for success */
    #devToolLog span.log-error { color: #e06c75; } /* Red for error */
    #devToolLog span.log-warn { color: #e5c07b; } /* Yellow for warning */

    .highlight-inspect {
      outline: 2px dashed #e06c75 !important; /* Red dashed outline */
      outline-offset: -2px;
    }
    #devToolClose, #devToolMinimize {
      background: transparent;
      border: none;
      color: #e06c75;
      font-size: 18px; /* Slightly larger for touch */
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
      transition: color 0.2s ease;
    }
    #devToolMinimize {
        color: #e5c07b;
    }
    #devToolClose:hover { color: #ff0000; }
    #devToolMinimize:hover { color: #ffcc00; }

    #devToolControls {
        display: flex;
        gap: 8px;
    }

    /* Mobile specific styles for small screens */
    @media (max-width: 600px), (max-height: 400px) { /* Adjust based on common mobile landscape/portrait */
      #devTool {
        width: 98vw; /* Maximize width */
        height: 70vh; /* Use more vertical space */
        bottom: 1vw; /* Use vw for consistent spacing */
        right: 1vw;
        left: 1vw !important; /* Force left to align with right */
        top: 1vw !important; /* Force top to align with bottom, ensuring it's always in view */
        transform: translate(0,0); /* Reset any potential transform if previous state was bad */
        margin: auto; /* Center if possible */
      }
      #devToolFooter button {
        flex: 1 1 45%; /* Allow buttons to wrap more naturally */
        font-size: 11px; /* Slightly smaller font for more space */
      }
      #devToolPath, #devToolLog {
          max-height: 40px; /* Reduce log/path height on small screens */
          font-size: 10px;
      }
    }
  `;
  document.head.appendChild(style);

  // --- Create UI ---
  const box = document.createElement("div");
  box.id = "devTool";
  box.innerHTML = `
    <div id="devToolHeader">
      <span>Dev Tool</span>
      <div id="devToolControls">
        <button id="devToolMinimize">_</button>
        <button id="devToolClose">×</button>
      </div>
    </div>
    <textarea id="devToolCSS" placeholder="Type JavaScript or CSS here...&#10;Example JS: console.log('Hello Dev Tool');&#10;Example CSS: body { background: #f0f !important; }"></textarea>
    <div id="devToolFooter">
      <button id="runBtn">▶ Run JS</button>
      <button id="injectBtn">Inject CSS</button>
      <button id="inspectBtn">Click to Inspect</button>
      <button id="editToggleBtn">Edit Page</button>
      <button id="copyPathBtn">Copy Path</button>
      <button id="clearLogBtn">Clear All</button>
    </div>
    <div id="devToolPath">Path: (none)</div>
    <div id="devToolLog">Console:</div>
  `;
  document.body.appendChild(box);

  // --- Persistence and Initial State ---
  // Using localStorage for persistence across page loads/refreshes.
  // If localStorage is not desired, remove these lines and the corresponding
  // save/remove calls in dragEnd and closeBtn.onclick.
  const storedWidth = localStorage.getItem('devToolWidth');
  const storedHeight = localStorage.getItem('devToolHeight');
  const storedLeft = localStorage.getItem('devToolLeft');
  const storedTop = localStorage.getItem('devToolTop');

  if (storedWidth) box.style.width = storedWidth;
  if (storedHeight) box.style.height = storedHeight;
  if (storedLeft && storedTop) {
      box.style.left = storedLeft;
      box.style.top = storedTop;
      box.style.bottom = 'auto'; // Disable fixed bottom/right if position is stored
      box.style.right = 'auto';
  } else {
      // For initial load, if no stored position, ensure it's within viewport
      // This is a fallback for very first load or if localStorage is cleared/disabled
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const defaultWidth = 320;
      const defaultHeight = 280;

      if (defaultWidth > vw * 0.98 || defaultHeight > vh * 0.98) { // If default size is too big for viewport
          box.style.width = '98vw';
          box.style.height = '70vh'; // Use a larger percentage height for mobile
          box.style.left = '1vw';
          box.style.top = '1vw';
          box.style.right = 'auto';
          box.style.bottom = 'auto';
      } else {
          box.style.right = '10px';
          box.style.bottom = '10px';
          box.style.left = 'auto';
          box.style.top = 'auto';
      }
  }


  // --- Dragging ---
  const header = box.querySelector("#devToolHeader");
  let offsetX = 0, offsetY = 0, isDragging = false;
  let hasDragged = false; // Flag to prevent click event on the close button after a drag

  const dragStart = (e) => {
    isDragging = true;
    hasDragged = false; // Reset drag flag
    header.classList.add('dragging');
    const touch = e.touches?.[0] || e;
    // Use clientX/Y directly for initial offset relative to pointer
    offsetX = touch.clientX - box.getBoundingClientRect().left;
    offsetY = touch.clientY - box.getBoundingClientRect().top;
    e.preventDefault(); // Prevent default touch behavior (e.g., scrolling, pull-to-refresh)
    e.stopPropagation(); // Prevent clicks on elements below the header
  };
  const dragMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches?.[0] || e;

    let newLeft = touch.clientX - offsetX;
    let newTop = touch.clientY - offsetY;

    // --- Viewport boundary constraints ---
    const toolRect = box.getBoundingClientRect(); // Get current dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ensure tool stays within horizontal bounds
    newLeft = Math.max(0, Math.min(newLeft, viewportWidth - toolRect.width));
    // Ensure tool stays within vertical bounds
    newTop = Math.max(0, Math.min(newTop, viewportHeight - toolRect.height));

    box.style.left = newLeft + "px";
    box.style.top = newTop + "px";
    box.style.bottom = "auto";
    box.style.right = "auto"; // Ensure fixed positioning is off during drag

    if (Math.abs(touch.clientX - (box.getBoundingClientRect().left + offsetX)) > 5 ||
        Math.abs(touch.clientY - (box.getBoundingClientRect().top + offsetY)) > 5) {
        // Only set hasDragged to true if actual significant movement occurs
        hasDragged = true;
    }
    e.preventDefault(); // Prevent default touch behavior during drag
    e.stopPropagation(); // Prevent scrolling the page
  };
  const dragEnd = () => {
    isDragging = false;
    header.classList.remove('dragging');
    // Save position (only if localStorage is desired)
    localStorage.setItem('devToolLeft', box.style.left);
    localStorage.setItem('devToolTop', box.style.top);
  };

  header.addEventListener("mousedown", dragStart);
  header.addEventListener("touchstart", dragStart, { passive: false }); // passive: false for preventDefault
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("touchmove", dragMove, { passive: false });
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);

  // --- Resizing Persistence ---
  // Using localStorage for persistence across page loads/refreshes.
  // If localStorage is not desired, remove these lines.
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if (entry.target === box) {
        localStorage.setItem('devToolWidth', `${entry.contentRect.width}px`);
        localStorage.setItem('devToolHeight', `${entry.contentRect.height}px`);
        // Recalculate position after resize to ensure it remains in view
        const currentLeft = parseFloat(box.style.left);
        const currentTop = parseFloat(box.style.top);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const toolRect = box.getBoundingClientRect();

        let newLeft = Math.max(0, Math.min(currentLeft, viewportWidth - toolRect.width));
        let newTop = Math.max(0, Math.min(currentTop, viewportHeight - toolRect.height));

        if (newLeft !== currentLeft) box.style.left = newLeft + 'px';
        if (newTop !== currentTop) box.style.top = newTop + 'px';
      }
    }
  });
  resizeObserver.observe(box);


  // --- Buttons and Functionality ---
  const cssBox = box.querySelector("#devToolCSS");
  const injectBtn = box.querySelector("#injectBtn");
  const inspectBtn = box.querySelector("#inspectBtn");
  const editBtn = box.querySelector("#editToggleBtn");
  const clearLogBtn = box.querySelector("#clearLogBtn");
  const runBtn = box.querySelector("#runBtn");
  const pathBox = box.querySelector("#devToolPath");
  const logBox = box.querySelector("#devToolLog");
  const closeBtn = box.querySelector("#devToolClose");
  const minimizeBtn = box.querySelector("#devToolMinimize");
  const copyPathBtn = box.querySelector("#copyPathBtn");

  // Store original console.log
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  // Custom logging function
  const appendToLog = (message, type = 'info') => {
    const span = document.createElement('span');
    span.classList.add(`log-${type}`);
    span.textContent = message + '\n';
    logBox.appendChild(span);
    logBox.scrollTop = logBox.scrollHeight; // Auto-scroll to bottom
  };

  // Override console methods for logging to UI
  console.log = (...args) => {
    appendToLog("🟢 " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" "), 'info');
    originalConsoleLog.apply(console, args);
  };
  console.warn = (...args) => {
    appendToLog("🟠 " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" "), 'warn');
    originalConsoleWarn.apply(console, args);
  };
  console.error = (...args) => {
    appendToLog("🔴 " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" "), 'error');
    originalConsoleError.apply(console, args);
  };


  injectBtn.onclick = () => {
    const css = cssBox.value.trim();
    if (css) {
      try {
        const s = document.createElement("style");
        s.textContent = css;
        document.head.appendChild(s);
        appendToLog("✅ CSS injected successfully.", 'success');
      } catch (err) {
        appendToLog(`❌ Error injecting CSS: ${err.message}`, 'error');
      }
    } else {
      appendToLog("🟠 No CSS to inject.", 'warn');
    }
  };

  runBtn.onclick = () => {
    const code = cssBox.value;
    logBox.innerHTML = "Console:\n"; // Clear previous logs
    try {
      const func = new Function(code);
      const result = func();
      appendToLog("✅ Result: " + (typeof result === 'object' ? JSON.stringify(result) : String(result)), 'success');
    } catch (err) {
      appendToLog(`❌ Error: ${err.message}`, 'error');
    }
  };

  let isEditable = false;
  editBtn.onclick = () => {
    isEditable = !isEditable;
    document.body.contentEditable = isEditable;
    document.designMode = isEditable ? "on" : "off"; // Legacy but good for older browsers
    editBtn.textContent = isEditable ? "Stop Edit" : "Edit Page";
    appendToLog(`Page editing ${isEditable ? 'enabled' : 'disabled'}.`, 'info');
  };

  clearLogBtn.onclick = () => {
    cssBox.value = "";
    logBox.innerHTML = "Console:";
    pathBox.textContent = "Path: (none)";
    // Also reset inspect and edit modes
    if (inspectMode) inspectBtn.click(); // Programmatically click to stop inspect
    if (isEditable) editBtn.click(); // Programmatically click to stop edit
    appendToLog("Console and tool state cleared.", 'info');
  };

  closeBtn.onclick = (e) => {
    // Prevent close if a drag just finished on the close button
    if (hasDragged) {
        hasDragged = false; // Reset immediately
        e.preventDefault(); // Prevent click event
        e.stopPropagation(); // Stop further propagation
        return;
    }

    // Restore original console
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;

    // Clean up
    if (box.parentNode) { // Check if it's still in the DOM
        document.body.removeChild(box);
    }
    if (style.parentNode) { // Check if it's still in the DOM
        document.head.removeChild(style);
    }

    // Remove highlight if active
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    if (inspectMode) { // Ensure listeners are removed if closed while inspecting
      document.body.removeEventListener("mouseover", highlight);
      document.body.removeEventListener("mouseout", unhighlight);
      document.body.removeEventListener("click", capture, true);
    }
    // Clear local storage items for persistence (only if localStorage is desired)
    localStorage.removeItem('devToolWidth');
    localStorage.removeItem('devToolHeight');
    localStorage.removeItem('devToolLeft');
    localStorage.removeItem('devToolTop');

    delete window.__devToolLoaded; // Allow loading again
  };

  let previousWidth, previousHeight, previousLeft, previousTop; // For minimize/maximize
  minimizeBtn.onclick = () => {
    if (box.style.display === 'none') { // Currently minimized, restore
        box.style.display = 'flex';
        box.style.width = previousWidth || '320px';
        box.style.height = previousHeight || '280px';
        if (previousLeft && previousTop) {
            box.style.left = previousLeft;
            box.style.top = previousTop;
            box.style.right = 'auto';
            box.style.bottom = 'auto';
        }
        minimizeBtn.textContent = '_';
    } else { // Minimize
        previousWidth = box.style.width;
        previousHeight = box.style.height;
        previousLeft = box.style.left;
        previousTop = box.style.top;

        box.style.display = 'none';
        minimizeBtn.textContent = '☐'; // Change to square for maximize
        // Optionally, you could make it a tiny floating icon instead of `display: none`
    }
  };


  copyPathBtn.onclick = async () => {
    const path = pathBox.textContent.replace("Path: ", "");
    if (path && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(path);
        appendToLog("✅ Path copied!", 'success');
        copyPathBtn.textContent = "Copied!";
        setTimeout(() => {
          copyPathBtn.textContent = "Copy Path";
        }, 1500);
      } catch (err) {
        appendToLog(`❌ Failed to copy path: ${err.message}`, 'error');
      }
    } else {
        appendToLog("🟠 No path selected or clipboard API not available.", 'warn');
    }
  };


  function getPath(el) {
    if (!el || el === document.body || el === document.documentElement) return el.nodeName.toLowerCase();
    const parts = [];
    while (el && el.nodeType === 1) {
      let name = el.nodeName.toLowerCase();
      if (el.id) {
        name += `#${el.id}`;
        parts.unshift(name);
        break; // ID is unique, stop here
      } else {
        let sib = el, count = 1;
        // Check for siblings with the same tag name
        while ((sib = sib.previousElementSibling)) {
          if (sib.nodeName.toLowerCase() === name) count++;
        }
        if (count > 1) { // Only add :nth-of-type if there are multiple siblings of the same type
            name += `:nth-of-type(${count})`;
        }
      }
      parts.unshift(name);
      el = el.parentElement;
    }
    return parts.join(" > ");
  }

  // Inspect mode (live)
  let inspectMode = false;
  let currentHighlightedElement = null;

  inspectBtn.onclick = () => {
    inspectMode = !inspectMode;
    inspectBtn.textContent = inspectMode ? "Stop Inspect" : "Click to Inspect";
    if (inspectMode) {
      document.body.addEventListener("mouseover", highlight);
      document.body.addEventListener("mouseout", unhighlight); // Added to remove highlight on mouseout
      document.body.addEventListener("click", capture, true); // true for capture phase
      appendToLog("Inspect mode activated. Click an element to select.", 'info');
      // Hide dev tool if inspect mode is active and tool is visible
      if (box.style.display !== 'none') {
          box.style.display = 'none';
          minimizeBtn.textContent = '☐';
      }
    } else {
      document.body.removeEventListener("mouseover", highlight);
      document.body.removeEventListener("mouseout", unhighlight);
      document.body.removeEventListener("click", capture, true);
      if (currentHighlightedElement) {
        currentHighlightedElement.classList.remove("highlight-inspect");
        currentHighlightedElement = null;
      }
      appendToLog("Inspect mode deactivated.", 'info');
      // Show dev tool again after inspect mode is deactivated
      if (box.style.display === 'none') {
          box.style.display = 'flex';
          minimizeBtn.textContent = '_';
      }
    }
  };

  const highlight = (e) => {
    // Only highlight if the target is not part of the dev tool itself
    if (box.contains(e.target)) {
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove("highlight-inspect");
            currentHighlightedElement = null;
        }
        return;
    }

    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove("highlight-inspect");
    }
    currentHighlightedElement = e.target;
    currentHighlightedElement.classList.add("highlight-inspect");
  };

  const unhighlight = (e) => {
    if (currentHighlightedElement && !e.relatedTarget || !e.relatedTarget.contains(currentHighlightedElement)) {
        currentHighlightedElement.classList.remove("highlight-inspect");
        currentHighlightedElement = null;
    }
  }

  const capture = (e) => {
    // Check if a drag just finished, to prevent accidental selection
    if (hasDragged) {
        hasDragged = false; // Reset immediately
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent default link clicks etc.

    if (box.contains(e.target)) { // Don't select the dev tool itself
        appendToLog("🟠 Dev Tool element clicked. Please click a page element.", 'warn');
        return;
    }

    const selectedElement = e.target;
    cssBox.value = selectedElement.outerHTML;
    pathBox.textContent = "Path: " + getPath(selectedElement);

    // Turn off inspect mode after selection
    inspectMode = false;
    inspectBtn.textContent = "Click to Inspect";
    document.body.removeEventListener("mouseover", highlight);
    document.body.removeEventListener("mouseout", unhighlight);
    document.body.removeEventListener("click", capture, true);
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove("highlight-inspect");
      currentHighlightedElement = null;
    }
    appendToLog(`Element selected: <${selectedElement.tagName.toLowerCase()}>`, 'info');

    // Show dev tool again after element is captured
    if (box.style.display === 'none') {
        box.style.display = 'flex';
        minimizeBtn.textContent = '_';
    }
  };

  // --- Auto-hide on outside click ---
  document.addEventListener('click', (e) => {
    // If the dev tool is visible and the click target is outside the dev tool, hide it
    if (box.style.display !== 'none' && !box.contains(e.target) && !e.target.matches('#devToolClose, #devToolMinimize')) {
      // Don't hide if we are in inspect mode (inspect handles clicks)
      if (!inspectMode) {
          box.style.display = 'none';
          minimizeBtn.textContent = '☐'; // Change to maximize icon
          appendToLog("Dev Tool hidden (clicked outside).", 'info');
      }
    }
  }, true); // Use capture phase to catch event before it reaches inner elements

  // Optional: Prevent default touch actions on the dev tool itself
  box.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false });
  box.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: false });
  box.addEventListener('touchend', (e) => e.stopPropagation(), { passive: false });

})();
