(() => {
  if (window.__devToolLoaded) return;
  window.__devToolLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    #devTool {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 360px;
      height: 280px;
      z-index: 99999;
      font-family: sans-serif;
      background: #fff;
      color: #000;
      border: 1px solid #ccc;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      resize: both;
      overflow: hidden;
    }
    #devTool.dark {
      background: #111;
      color: #eee;
      border: 1px solid #555;
    }
    #devTool.dark textarea,
    #devTool.dark .CodeMirror,
    #devTool.dark .console-log {
      background: #000;
      color: #0f0;
    }
    #devToolHeader {
      background: #f1f1f1;
      padding: 6px 10px;
      cursor: move;
      user-select: none;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #devTool.dark #devToolHeader {
      background: #222;
      border-bottom: 1px solid #444;
    }
    #devTool textarea {
      flex: 1;
      padding: 6px;
      font-family: monospace;
      font-size: 13px;
      border: none;
      resize: none;
      background: #fff;
      color: #000;
    }
    #devToolFooter {
      display: flex;
      gap: 5px;
      padding: 6px;
      background: #f1f1f1;
      border-top: 1px solid #ccc;
      flex-wrap: wrap;
    }
    #devTool.dark #devToolFooter {
      background: #222;
      border-top: 1px solid #444;
    }
    #devToolFooter button {
      flex: 1;
      padding: 6px;
      font-size: 12px;
      background: #eee;
      color: #000;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    #devTool.dark #devToolFooter button {
      background: #333;
      color: #eee;
      border: 1px solid #444;
    }
    #devToolFooter button:hover {
      background: #ddd;
    }
    #devTool.dark #devToolFooter button:hover {
      background: #444;
    }
    #devToolPath {
      padding: 5px 10px;
      font-size: 12px;
      background: #f9f9f9;
      border-top: 1px solid #ccc;
      overflow: auto;
      white-space: nowrap;
    }
    #devTool.dark #devToolPath {
      background: #000;
      color: #0f0;
      border-top: 1px solid #444;
    }
    .highlight-inspect {
      outline: 2px dashed red;
      outline-offset: -2px;
    }
    .console-log {
      font-family: monospace;
      font-size: 12px;
      padding: 6px 10px;
      background: #fff;
      color: #000;
      overflow-y: auto;
      flex: 1;
    }
    .console-log .log {
      white-space: pre-wrap;
      border-bottom: 1px dotted #ccc;
      padding: 2px 0;
    }
    .console-log .success { color: green; }
    .console-log .error { color: red; }
    .console-log .info { color: blue; }
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

  const box = document.createElement("div");
  box.id = "devTool";
  box.innerHTML = `
    <div id="devToolHeader">
      <span>Dev Tool</span>
      <button id="closeDevTool" style="border:none;background:none;font-size:16px;cursor:pointer">&times;</button>
    </div>
    <textarea id="devToolCSS" placeholder="Type JS or CSS here..."></textarea>
    <div class="console-log" id="consoleLog"></div>
    <div id="devToolFooter">
      <button id="runBtn">▶ Run</button>
      <button id="injectBtn">Inject CSS</button>
      <button id="inspectBtn">Click to Inspect</button>
      <button id="toggleThemeBtn">Toggle Theme</button>
      <button id="clearBtn">Clear Log</button>
    </div>
    <div id="devToolPath">Path: (none)</div>
  `;
  document.body.appendChild(box);

  const header = box.querySelector("#devToolHeader");
  const closeBtn = box.querySelector("#closeDevTool");
  const consoleLog = box.querySelector("#consoleLog");
  const pathBox = box.querySelector("#devToolPath");

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

  closeBtn.onclick = () => box.remove();

  const runBtn = box.querySelector("#runBtn");
  const injectBtn = box.querySelector("#injectBtn");
  const inspectBtn = box.querySelector("#inspectBtn");
  const clearBtn = box.querySelector("#clearBtn");
  const themeBtn = box.querySelector("#toggleThemeBtn");
  const textarea = box.querySelector("#devToolCSS");

  runBtn.onclick = () => {
    const code = textarea.value;
    try {
      const result = eval(code);
      log("✅ Result: " + result, "success");
    } catch (e) {
      log("❌ Error: " + e.message, "error");
    }
  };

  injectBtn.onclick = () => {
    const css = textarea.value.trim();
    if (css) {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
      log("🟢 CSS Injected", "info");
    }
  };

  clearBtn.onclick = () => {
    consoleLog.innerHTML = "";
    textarea.value = "";
    pathBox.textContent = "Path: (none)";
  };

  themeBtn.onclick = () => box.classList.toggle("dark");

  const log = (text, type = "log") => {
    const line = document.createElement("div");
    line.textContent = text;
    line.className = `log ${type}`;
    consoleLog.appendChild(line);
    consoleLog.scrollTop = consoleLog.scrollHeight;
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
    textarea.value = e.target.outerHTML;
    pathBox.textContent = "Path: " + getPath(e.target);
    inspectMode = false;
    inspectBtn.textContent = "Click to Inspect";
    document.body.removeEventListener("mouseover", highlight);
    document.body.removeEventListener("click", capture, true);
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
  };
})();

