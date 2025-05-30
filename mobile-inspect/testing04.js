(() => {
  if (window.__devToolLoaded) return;
  window.__devToolLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    #devTool {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 340px;
      height: 300px;
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
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
    }
    #devToolHeader > * {
      pointer-events: auto;
    }
    #devToolDragHandle {
      font-weight: bold;
      cursor: move;
    }
    pre {
      flex: 1;
      margin: 0;
      padding: 6px;
      overflow: auto;
      font-size: 13px;
      background: #fdfdfd;
      border: none;
    }
    pre code {
      outline: none;
      white-space: pre;
      display: block;
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

  const box = document.createElement("div");
  box.id = "devTool";
  box.innerHTML = `
    <div id="devToolHeader">
      <span id="devToolDragHandle">Dev Tool</span>
      <button id="devToolClose">×</button>
    </div>
    <pre><code id="devToolEditor" contenteditable="true">// Type JavaScript here\nconsole.log('Hello Dev Tool');</code></pre>
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

  const editor = box.querySelector("#devToolEditor");
  const runBtn = box.querySelector("#runBtn");
  const injectBtn = box.querySelector("#injectBtn");
  const inspectBtn = box.querySelector("#inspectBtn");
  const editBtn = box.querySelector("#editToggleBtn");
  const clearLogBtn = box.querySelector("#clearLogBtn");
  const pathBox = box.querySelector("#devToolPath");
  const logBox = box.querySelector("#devToolLog");
  const closeBtn = box.querySelector("#devToolClose");

  let isDragging = false, offsetX = 0, offsetY = 0;
  const dragHandle = box.querySelector("#devToolDragHandle");

  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      box.style.left = `${e.clientX - offsetX}px`;
      box.style.top = `${e.clientY - offsetY}px`;
      box.style.bottom = "auto";
      box.style.right = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  runBtn.onclick = () => {
    const code = editor.innerText;
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

  injectBtn.onclick = () => {
    const css = editor.innerText.trim();
    if (css) {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
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
    editor.innerText = "";
    logBox.innerHTML = "Console:";
    pathBox.textContent = "Path: (none)";
    isEditable = false;
    document.body.contentEditable = false;
    document.designMode = "off";
    editBtn.textContent = "Edit Page";
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
    editor.innerText = e.target.outerHTML;
    pathBox.textContent = "Path: " + getPath(e.target);
    inspectMode = false;
    inspectBtn.textContent = "Click to Inspect";
    document.body.removeEventListener("mouseover", highlight);
    document.body.removeEventListener("click", capture, true);
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
  };
})();
