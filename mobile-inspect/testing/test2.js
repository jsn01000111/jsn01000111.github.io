(() => {
  if (window.__devToolLoaded) return;
  window.__devToolLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    #devTool {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 320px;
      height: 450px; /* Increased default height for more textarea space */
      z-index: 99999;
      font-family: monospace;
      background: #fff;
      color: #111;
      border: 1px solid #ccc;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      overflow: hidden; /* Added for smoother collapse effect */
    }
    #devToolHeader {
      background: #f0f0f0;
      padding: 6px 10px;
      cursor: move;
      user-select: none;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #devTool textarea {
      flex: 1;
      padding: 6px;
      font-size: 13px;
      border: none;
      outline: none;
      resize: vertical; /* Changed from 'none' to 'vertical' for manual resizing */
    }
    #devToolFooter {
      display: flex;
      gap: 4px;
      padding: 6px;
      background: #f9f9f9;
      border-top: 1px solid #ccc;
      flex-wrap: wrap;
    }
    #devToolFooter button {
      flex: 1;
      padding: 4px;
      font-size: 12px;
      background: #eee;
      color: #111;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    #devToolFooter button:hover {
      background: #ddd;
    }
    #devToolPath, #devToolLog {
      font-size: 11px;
      padding: 4px 8px;
      border-top: 1px solid #ddd;
      background: #fafafa;
      color: #333;
      overflow: auto;
      max-height: 50px; /* Max height for path */
      white-space: pre-wrap;
      flex-shrink: 0; /* Prevent shrinking too much */
    }
    #devToolLog {
      max-height: 150px; /* Increased max-height for log area */
      flex-grow: 1; /* Allow log to expand if space permits */
    }
    .highlight-inspect {
      outline: 2px dashed #f00;
      outline-offset: -2px;
    }
    #devToolClose, #devToolMinimize { /* Styles for both close and minimize buttons */
      background: transparent;
      border: none;
      color: #444;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
      margin-left: 5px; /* Spacing between buttons */
    }
    #devToolMinimize {
        font-size: 20px; /* Larger icon for minimize/maximize */
        line-height: 0.8;
    }
    @media (max-width: 400px) {
      #devTool {
        width: 95vw;
        height: 60vh; /* Keeps its percentage height on mobile */
        bottom: 5px;
        right: 5px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create UI
  const box = document.createElement("div");
  box.id = "devTool";
  box.innerHTML = `
    <div id="devToolHeader">
      <span>Dev Tool</span>
      <div>
        <button id="devToolMinimize">−</button>
        <button id="devToolClose">×</button>
      </div>
    </div>
    <textarea id="devToolCSS">// Type JavaScript here\nconsole.log('Hello Dev Tool');</textarea>
    <div id="devToolFooter">
      <button id="runBtn">▶ Run</button>
      <button id="injectBtn">Inject CSS</button>
      <button id="inspectBtn">Click to Inspect</button>
      <button id="editToggleBtn">Edit Page</button>
      <button id="clearLogBtn">Clear Log</button>
    </div>
    <div id="devToolPath">Path: (none)</div>
    <div id="devToolLog">Console:</div>
  `;
  document.body.appendChild(box);

  // Dragging
  const header = box.querySelector("#devToolHeader");
  let offsetX = 0, offsetY = 0, isDragging = false;
  const dragStart = (e) => {
    isDragging = true;
    const touch = e.touches?.[0] || e;
    offsetX = touch.clientX - box.offsetLeft;
    offsetY = touch.clientY - box.offsetTop;
    e.preventDefault();
  };
  const dragMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches?.[0] || e;
    box.style.left = (touch.clientX - offsetX) + "px";
    box.style.top = (touch.clientY - offsetY) + "px";
    box.style.bottom = "auto";
    box.style.right = "auto";
  };
  const dragEnd = () => { isDragging = false; };
  header.addEventListener("mousedown", dragStart);
  header.addEventListener("touchstart", dragStart, { passive: false }); // Added passive:false
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("touchmove", dragMove, { passive: false }); // Added passive:false
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);

  // Buttons
  const cssBox = box.querySelector("#devToolCSS");
  const injectBtn = box.querySelector("#injectBtn");
  const inspectBtn = box.querySelector("#inspectBtn");
  const editBtn = box.querySelector("#editToggleBtn");
  const clearLogBtn = box.querySelector("#clearLogBtn");
  const runBtn = box.querySelector("#runBtn");
  const pathBox = box.querySelector("#devToolPath");
  const logBox = box.querySelector("#devToolLog");
  const closeBtn = box.querySelector("#devToolClose");
  const minimizeBtn = box.querySelector("#devToolMinimize"); // Get reference to the new minimize button

  injectBtn.onclick = () => {
    const css = cssBox.value.trim();
    if (css) {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
      logBox.innerHTML += "✅ CSS Injected\n"; // Added confirmation
    }
  };

  runBtn.onclick = () => {
    const code = cssBox.value;
    logBox.innerHTML = "Console:\n";
    try {
      // Store original console methods before overriding
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args) => {
        logBox.innerHTML += "🟢 " + args.join(" ") + "\n";
        originalLog(...args);
      };
      console.error = (...args) => { // Override error to show in logBox
        logBox.innerHTML += "❌ Error: " + args.join(" ") + "\n";
        originalError(...args);
      };
      console.warn = (...args) => { // Override warn to show in logBox
        logBox.innerHTML += "⚠️ Warning: " + args.join(" ") + "\n";
        originalWarn(...args);
      };

      const result = eval(code);
      logBox.innerHTML += "✅ Result: " + result + "\n";
    } catch (err) {
      logBox.innerHTML += "❌ Error: " + err.message + "\n";
    } finally {
      // Always restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      logBox.scrollTop = logBox.scrollHeight; // Scroll to bottom of log
    }
  };

  let isEditable = false;
  editBtn.onclick = () => {
    isEditable = !isEditable;
    document.body.contentEditable = isEditable;
    document.designMode = isEditable ? "on" : "off";
    editBtn.textContent = isEditable ? "Stop Edit" : "Edit Page";
  };

  clearLogBtn.onclick = () => {
    cssBox.value = "";
    logBox.innerHTML = "Console:";
    pathBox.textContent = "Path: (none)";
    isEditable = false;
    document.body.contentEditable = false;
    document.designMode = "off";
    editBtn.textContent = "Edit Page";
    // Also reset inspect mode if active
    inspectMode = false;
    inspectBtn.textContent = "Click to Inspect";
    document.body.removeEventListener("mouseover", highlight);
    document.body.removeEventListener("click", capture, true);
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
  };

  // --- FIX: Close Button ---
  closeBtn.onclick = () => {
    document.body.removeChild(box);
    // Crucially, reset the flag so the bookmarklet can be run again
    window.__devToolLoaded = false;
  };

  // --- NEW: Collapse/Minimize Functionality ---
  let isMinimized = false;
  minimizeBtn.onclick = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      box.style.height = '40px'; // Height of the header when minimized
      cssBox.style.display = 'none'; // Hide text area
      box.querySelector("#devToolFooter").style.display = 'none'; // Hide footer
      pathBox.style.display = 'none'; // Hide path display
      logBox.style.display = 'none'; // Hide console log
      minimizeBtn.textContent = '□'; // Change icon to 'square' for maximize
    } else {
      // Restore original height, or responsive height if on mobile
      box.style.height = (window.innerWidth <= 400) ? '60vh' : '450px'; // Use original responsive or new default height
      cssBox.style.display = 'block'; // Show text area (block display for textarea)
      box.querySelector("#devToolFooter").style.display = 'flex'; // Show footer (flex display)
      pathBox.style.display = 'block'; // Show path display (block display)
      logBox.style.display = 'block'; // Show console log (block display)
      minimizeBtn.textContent = '−'; // Change icon back to 'minus' for minimize
    }
  };

  function getPath(el) {
    if (!el) return "";
    const parts = [];
    while (el && el.nodeType === 1) {
      let name = el.nodeName.toLowerCase();
      if (el.id) {
        name += `#${el.id}`;
        parts.unshift(name);
        break;
      } else {
        let sib = el, count = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() === name) count++;
        }
        name += `:nth-of-type(${count})`;
      }
      parts.unshift(name);
      el = el.parentElement;
    }
    return parts.join(" > ");
  }

  // Inspect mode (live)
  let inspectMode = false;
  inspectBtn.onclick = () => {
    inspectMode = !inspectMode;
    inspectBtn.textContent = inspectMode ? "Stop Inspect" : "Click to Inspect";
    if (inspectMode) {
      document.body.addEventListener("mouseover", highlight);
      document.body.addEventListener("click", capture, true);
    } else {
      document.body.removeEventListener("mouseover", highlight);
      document.body.removeEventListener("click", capture, true);
      document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    }
  };

  const highlight = (e) => {
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    e.target.classList.add("highlight-inspect");
  };

  const capture = (e) => {
    e.preventDefault();
    e.stopPropagation();
    cssBox.value = e.target.outerHTML;
    pathBox.textContent = "Path: " + getPath(e.target);
    inspectMode = false;
    inspectBtn.textContent = "Click to Inspect";
    document.body.removeEventListener("mouseover", highlight);
    document.body.removeEventListener("click", capture, true);
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
  };
})();
