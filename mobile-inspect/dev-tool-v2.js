(function() {
  // Prevent the dev tool from loading multiple times
  if (window.__devToolLoaded) {
    return;
  }
  window.__devToolLoaded = true; // Set a global flag

  // --- Styles ---
  const style = document.createElement("style");
  style.textContent = `
    #devTool {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 320px;
      max-width: 95vw; /* Max width for larger screens/tablets */
      height: 280px;
      max-height: 80vh; /* Max height for larger screens/tablets */
      z-index: 99999;
      font-family: monospace;
      background: #fff;
      color: #111;
      border: 1px solid #ccc;
      border-radius: 6px;
      display: flex;
      flex-direction: column-reverse; /* Places header at the bottom */
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      overflow: hidden; /* Ensures content doesn't spill out */
    }

    #devToolHeader {
      background: #f0f0f0;
      padding: 6px 10px;
      cursor: grab; /* Indicates draggable area */
      user-select: none;
      font-weight: bold;
      border-top: 1px solid #ccc; /* Border at the top of the header */
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #devToolContentArea {
      flex: 1; /* Allows content to fill available space */
      display: flex;
      flex-direction: column;
    }

    #devToolCodeInput {
      flex: 1; /* Takes remaining space in content area */
      padding: 6px;
      font-size: 13px;
      border: none;
      outline: none;
      resize: vertical; /* Allow vertical resizing of the textarea */
      min-height: 50px;
      box-sizing: border-box; /* Include padding in element's total width and height */
    }

    #devToolFooter {
      display: flex;
      gap: 4px;
      padding: 6px;
      background: #f9f9f9;
      border-bottom: 1px solid #ccc; /* Border at the bottom of the footer */
      flex-wrap: wrap; /* Buttons wrap on smaller screens */
      box-sizing: border-box;
    }

    #devToolFooter button {
      flex: 1;
      min-width: 60px; /* Ensure buttons are not too small */
      padding: 8px 4px; /* Larger touch target */
      font-size: 12px;
      background: #eee;
      color: #111;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap; /* Prevent button text from breaking */
    }

    #devToolFooter button:hover {
      background: #ddd;
    }

    #devToolPath, #devToolLog {
      font-size: 11px;
      padding: 4px 8px;
      border-bottom: 1px solid #ddd; /* Separator lines */
      background: #fafafa;
      color: #333;
      overflow: auto; /* Allow scrolling for long content */
      max-height: 50px; /* Limit height of path and log by default */
      white-space: pre-wrap; /* Preserve whitespace and break lines */
      flex-shrink: 0; /* Prevent these areas from shrinking too much */
    }
    #devToolLog {
      flex-grow: 1; /* Allow log to grow if space is available */
      max-height: 150px; /* Give log more space */
    }

    /* Highlight for inspect mode */
    .highlight-inspect {
      outline: 2px dashed #f00;
      outline-offset: -2px;
    }

    /* Close and Minimize buttons */
    #devToolClose, #devToolMinimize {
      background: transparent;
      border: none;
      color: #444;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
      margin-left: 5px; /* Spacing between buttons */
    }
    #devToolMinimize {
      font-size: 20px; /* Slightly larger for the 'minus' or 'square' icon */
      line-height: 0.8;
    }

    /* --- Mobile Responsive Styles --- */
    @media (max-width: 480px) {
      #devTool {
        width: 90vw; /* Take up 90% of viewport width */
        height: 50vh; /* Take up 50% of viewport height */
        bottom: 5vh; /* Position 5% from the bottom */
        left: 5vw; /* Position 5% from the left (centers horizontally) */
        top: auto; /* Allow bottom/left to dictate position */
        right: auto;
        max-width: unset; /* Override desktop max-width */
        max-height: unset; /* Override desktop max-height */
      }
      #devToolHeader {
        cursor: auto; /* Disable dragging on very small screens for easier interaction */
      }
    }
  `;
  document.head.appendChild(style);

  // --- Create UI Elements ---
  const devToolBox = document.createElement("div");
  devToolBox.id = "devTool";
  devToolBox.innerHTML = `
    <div id="devToolPath">Path: (none)</div>
    <div id="devToolLog">Console:</div>
    <textarea id="devToolCodeInput">// Type JavaScript or CSS here\nconsole.log('Hello Dev Tool');</textarea>
    <div id="devToolFooter">
      <button id="runJsBtn">▶ Run JS</button>
      <button id="injectCssBtn">Inject CSS</button>
      <button id="inspectElementBtn">Inspect</button>
      <button id="editPageBtn">Edit Page</button>
      <button id="clearToolBtn">Clear</button>
    </div>
    <div id="devToolHeader">
      <span>Dev Tool</span>
      <div>
        <button id="devToolMinimize">−</button>
        <button id="devToolClose">×</button>
      </div>
    </div>
  `;
  document.body.appendChild(devToolBox);

  // --- Get UI Element References ---
  const header = devToolBox.querySelector("#devToolHeader");
  const codeInput = devToolBox.querySelector("#devToolCodeInput");
  const runJsBtn = devToolBox.querySelector("#runJsBtn");
  const injectCssBtn = devToolBox.querySelector("#injectCssBtn");
  const inspectElementBtn = devToolBox.querySelector("#inspectElementBtn");
  const editPageBtn = devToolBox.querySelector("#editPageBtn");
  const clearToolBtn = devToolBox.querySelector("#clearToolBtn");
  const pathDisplay = devToolBox.querySelector("#devToolPath");
  const consoleLog = devToolBox.querySelector("#devToolLog");
  const closeBtn = devToolBox.querySelector("#devToolClose");
  const minimizeBtn = devToolBox.querySelector("#devToolMinimize");

  // --- Dragging Functionality ---
  let offsetX = 0, offsetY = 0, isDragging = false;

  const dragStart = (event) => {
    // Disable dragging on small screens
    if (window.innerWidth <= 480) return;

    isDragging = true;
    const touch = event.touches ? event.touches[0] : event; // Handle touch or mouse
    offsetX = touch.clientX - devToolBox.offsetLeft;
    offsetY = touch.clientY - devToolBox.offsetTop;
    event.preventDefault(); // Prevent text selection or scrolling
  };

  const dragMove = (event) => {
    if (!isDragging) return;
    const touch = event.touches ? event.touches[0] : event;
    devToolBox.style.left = (touch.clientX - offsetX) + "px";
    devToolBox.style.top = (touch.clientY - offsetY) + "px";
    // Once dragged, unset bottom/right to prevent conflict with left/top
    devToolBox.style.bottom = "auto";
    devToolBox.style.right = "auto";
  };

  const dragEnd = () => {
    isDragging = false;
  };

  header.addEventListener("mousedown", dragStart);
  header.addEventListener("touchstart", dragStart, { passive: false }); // Needs passive: false for preventDefault
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("touchmove", dragMove, { passive: false });
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);

  // --- Button Event Listeners ---

  // Inject CSS
  injectCssBtn.onclick = () => {
    const css = codeInput.value.trim();
    if (css) {
      const styleEl = document.createElement("style");
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
      consoleLog.innerHTML += "✅ CSS Injected\n";
    }
  };

  // Run JavaScript (with basic console override for logging to UI)
  runJsBtn.onclick = () => {
    const code = codeInput.value;
    consoleLog.innerHTML = "Console:\n"; // Clear console before new run

    // Store original console methods
    const originalLog = window.console.log;
    const originalError = window.console.error;
    const originalWarn = window.console.warn;

    // Override console methods to log to UI
    window.console.log = (...args) => {
      consoleLog.innerHTML += `🟢 ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg).substring(0,200) : String(arg)).join(' ')}\n`;
      originalLog(...args); // Call original console.log too
    };
    window.console.error = (...args) => {
      consoleLog.innerHTML += `<span class="err">❌ ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg).substring(0,200) : String(arg)).join(' ')}</span>\n`;
      originalError(...args);
    };
    window.console.warn = (...args) => {
      consoleLog.innerHTML += `<span class="warn">⚠️ ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg).substring(0,200) : String(arg)).join(' ')}</span>\n`;
      originalWarn(...args);
    };

    try {
      const result = window.eval(code); // Execute the user's code
      consoleLog.innerHTML += `✅ Result: ${result}\n`;
    } catch (err) {
      consoleLog.innerHTML += `<span class="err">❌ Error: ${err.message}</span>\n`;
    } finally {
      // Restore original console methods
      window.console.log = originalLog;
      window.console.error = originalError;
      window.console.warn = originalWarn;
      consoleLog.scrollTop = consoleLog.scrollHeight; // Scroll to bottom of log
    }
  };

  // Toggle Page Editing (contentEditable)
  let isEditable = false;
  editPageBtn.onclick = () => {
    isEditable = !isEditable;
    document.body.contentEditable = isEditable;
    document.designMode = isEditable ? "on" : "off"; // Older browsers
    editPageBtn.textContent = isEditable ? "Stop Edit" : "Edit Page";
  };

  // Clear All (console, input, reset states)
  clearToolBtn.onclick = () => {
    codeInput.value = "// Type JavaScript or CSS here\nconsole.log('Hello Dev Tool');";
    consoleLog.innerHTML = "Console:";
    pathDisplay.textContent = "Path: (none)";
    isEditable = false;
    document.body.contentEditable = false;
    document.designMode = "off";
    editPageBtn.textContent = "Edit Page";
    isInspectMode = false; // Turn off inspect mode if active
    inspectElementBtn.textContent = "Inspect";
    // Remove all highlight classes
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    // Remove event listeners for inspect mode
    document.body.removeEventListener("mouseover", highlightElement);
    document.body.removeEventListener("click", captureElement, true);
  };

  // Close Dev Tool
  closeBtn.onclick = () => {
    document.body.removeChild(devToolBox);
    delete window.__devToolLoaded; // Clear global flag
    // Ensure console is restored on close
    if (window.console.originalLog) window.console.log = window.console.originalLog;
    if (window.console.originalError) window.console.error = window.console.originalError;
    if (window.console.originalWarn) window.console.warn = window.console.originalWarn;
  };

  // Minimize/Maximize Dev Tool
  let isMinimized = false;
  minimizeBtn.onclick = () => {
    isMinimized = !isMinimized;
    // Set height based on minimized state; adjust for mobile vs desktop default size
    devToolBox.style.height = isMinimized ? '40px' : (window.innerWidth <= 480 ? '50vh' : '280px');
    // Hide/show content sections
    codeInput.style.display = isMinimized ? 'none' : 'flex';
    devToolBox.querySelector("#devToolFooter").style.display = isMinimized ? 'none' : 'flex';
    pathDisplay.style.display = isMinimized ? 'none' : 'block';
    consoleLog.style.display = isMinimized ? 'none' : 'block';
    // Change icon
    minimizeBtn.textContent = isMinimized ? '□' : '−'; // Square for maximize, minus for minimize
  };

  // --- Element Inspection ---

  // Function to get a unique CSS path (similar to browser dev tools)
  function getElementPath(element) {
    if (!element || element === document.documentElement || element === document.body) {
      return "";
    }
    const path = [];
    while (element && element.nodeType === 1 && element !== document.body) {
      let name = element.nodeName.toLowerCase();
      if (element.id) {
        name += `#${element.id}`;
        path.unshift(name);
        break; // ID is unique enough, stop here
      } else {
        let sibling = element, count = 1;
        // Count siblings of the same tag type before this element
        while (sibling = sibling.previousElementSibling) {
          if (sibling.nodeName.toLowerCase() === name) {
            count++;
          }
        }
        name += `:nth-of-type(${count})`; // Add nth-of-type for uniqueness
      }
      path.unshift(name); // Add to the beginning of the path
      element = element.parentElement; // Move up to parent
    }
    return path.join(" > ");
  }

  let isInspectMode = false;

  // Toggle Inspect Mode
  inspectElementBtn.onclick = () => {
    isInspectMode = !isInspectMode;
    inspectElementBtn.textContent = isInspectMode ? "Stop Inspect" : "Inspect";

    if (isInspectMode) {
      document.body.addEventListener("mouseover", highlightElement);
      document.body.addEventListener("click", captureElement, true); // Use capture phase for immediate click handling
    } else {
      document.body.removeEventListener("mouseover", highlightElement);
      document.body.removeEventListener("click", captureElement, true);
      // Remove any lingering highlights
      document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    }
  };

  // Highlight element on mouseover/touchover
  const highlightElement = (event) => {
    // Remove previous highlights
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    // Add highlight to current target
    event.target.classList.add("highlight-inspect");
  };

  // Capture element on click
  const captureElement = (event) => {
    event.preventDefault(); // Prevent default click action (e.g., navigating links)
    event.stopPropagation(); // Stop event from bubbling up

    const targetElement = event.target;

    // Display OuterHTML (truncated for very large elements)
    codeInput.value = targetElement.outerHTML.substring(0, 500) + (targetElement.outerHTML.length > 500 ? '...' : '');
    // Display CSS Path
    pathDisplay.textContent = "Path: " + getElementPath(targetElement);

    // Display basic computed styles in the console log
    consoleLog.innerHTML += `\n--- Element Info ---\n`;
    consoleLog.innerHTML += `  Tag: ${targetElement.tagName.toLowerCase()}\n`;
    if (targetElement.id) consoleLog.innerHTML += `  ID: #${targetElement.id}\n`;
    if (targetElement.className) consoleLog.innerHTML += `  Class: .${targetElement.className.split(' ').join('.')}\n`;
    
    const computedStyles = window.getComputedStyle(targetElement);
    consoleLog.innerHTML += `  Display: ${computedStyles.display}, Position: ${computedStyles.position}\n`;
    consoleLog.innerHTML += `  Size: ${computedStyles.width}x${computedStyles.height}\n`;
    consoleLog.innerHTML += `  Font: ${computedStyles.fontSize} ${computedStyles.fontFamily}\n`;
    consoleLog.innerHTML += `  Color: ${computedStyles.color}, Background: ${computedStyles.backgroundColor}\n`;
    
    // Scroll the inspected element into view if it's off-screen
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Exit inspect mode
    isInspectMode = false;
    inspectElementBtn.textContent = "Inspect";
    document.body.removeEventListener("mouseover", highlightElement);
    document.body.removeEventListener("click", captureElement, true);
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    consoleLog.scrollTop = consoleLog.scrollHeight; // Scroll to bottom of log
  };

})();

