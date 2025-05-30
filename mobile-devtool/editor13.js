
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
      height: 280px;
      z-index: 99999;
      font-family: monospace;
      background: #fff;
      color: #111;
      border: 1px solid #ccc;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
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
      resize: none;
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
      max-height: 50px;
      white-space: pre-wrap;
    }
    .highlight-inspect {
      outline: 2px dashed #f00;
      outline-offset: -2px;
    }
    #devToolClose {
      background: transparent;
      border: none;
      color: #444;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
    }
    @media (max-width: 400px) {
      #devTool {
        width: 95vw;
        height: 60vh;
        bottom: 5px;
        right: 5px;
      }
    }
  `;
  document.head.appendChild(style);

  // UI
  const box = document.createElement("div");
  box.id = "devTool";
  box.innerHTML = `
    <div id="devToolHeader">
      <span>Dev Tool</span>
      <button id="devToolClose">×</button>
    </div>
    <textarea id="devToolCSS">// Type JavaScript here\nconsole.log('Hello Dev Tool');</textarea>
    <div id="devToolFooter">
      <button id="runBtn">▶ Run</button>
      <button id="injectBtn">Inject CSS</button>
      <button id="inspectBtn">Click to Inspect</button>
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
  header.addEventListener("touchstart", dragStart);
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("touchmove", dragMove);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);

  // Buttons
  const cssBox = box.querySelector("#devToolCSS");
  const injectBtn = box.querySelector("#injectBtn");
  const inspectBtn = box.querySelector("#inspectBtn");
  const clearLogBtn = box.querySelector("#clearLogBtn");
  const runBtn = box.querySelector("#runBtn");
  const pathBox = box.querySelector("#devToolPath");
  const logBox = box.querySelector("#devToolLog");
  const closeBtn = box.querySelector("#devToolClose");

  injectBtn.onclick = () => {
    const css = cssBox.value.trim();
    if (css) {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
    }
  };

  runBtn.onclick = () => {
    const code = cssBox.value;
    logBox.innerHTML = "Console:\n";
    try {
      const originalLog = console.log;
      console.log = (...args) => {
        logBox.innerHTML += "🟢 " + args.join(" ") + "\n";
        originalLog(...args);
      };
      const result = eval(code);
      logBox.innerHTML += "✅ Result: " + result + "\n";
      console.log = originalLog;
    } catch (err) {
      logBox.innerHTML += "❌ Error: " + err.message + "\n";
    }
  };

  clearLogBtn.onclick = () => {
    cssBox.value = "";
    logBox.innerHTML = "Console:";
    pathBox.textContent = "Path: (none)";
  };

  closeBtn.onclick = () => {
    document.body.removeChild(box);
    window.__devToolLoaded = false;
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

  // Inspect
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
