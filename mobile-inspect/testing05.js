(() => {
  if (window.__devToolLoaded) return;
  window.__devToolLoaded = true;

  function runWhenReady(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  runWhenReady(() => {
    const style = document.createElement("style");
    style.textContent = `
      #devTool {
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 320px;
        height: 300px;
        z-index: 99999;
        font-family: monospace;
        background: #fff;
        color: #111;
        border: 1px solid #ccc;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25);
      }
      #devToolHeader {
        background: #f8f8f8;
        padding: 8px 10px;
        cursor: move;
        user-select: none;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ddd;
      }
      #devToolClose {
        background: none;
        border: none;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        color: #888;
      }
      #devToolClose:hover {
        color: #000;
      }
      #devTool textarea {
        flex: 1;
        padding: 8px;
        font-size: 13px;
        border: none;
        outline: none;
        resize: none;
        background: #fff;
        color: #111;
      }
      #devToolFooter {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 6px;
        background: #f9f9f9;
        border-top: 1px solid #ccc;
      }
      #devToolFooter button {
        flex: 1 1 calc(50% - 4px);
        font-size: 12px;
        padding: 6px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background: #eee;
        cursor: pointer;
      }
      #devToolFooter button:hover {
        background: #ddd;
      }
      #devToolPath, #devToolLog {
        font-size: 11px;
        padding: 6px 8px;
        background: #fafafa;
        color: #333;
        border-top: 1px solid #ddd;
        overflow: auto;
        max-height: 50px;
        white-space: pre-wrap;
      }
      .highlight-inspect {
        outline: 2px dashed red;
        outline-offset: -2px;
      }

      @media (max-width: 400px) {
        #devTool {
          width: 95vw;
          height: 60vh;
          left: 2.5vw !important;
          top: auto !important;
          bottom: 10px !important;
        }
        #devToolFooter button {
          flex: 1 1 100%;
        }
      }
    `;
    document.head.appendChild(style);

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

    const header = box.querySelector("#devToolHeader");
    let isDragging = false, offsetX = 0, offsetY = 0;

    const dragStart = (e) => {
      isDragging = true;
      const touch = e.touches?.[0] || e;
      offsetX = touch.clientX - box.offsetLeft;
      offsetY = touch.clientY - box.offsetTop;
      box.style.left = box.offsetLeft + "px";
      box.style.top = box.offsetTop + "px";
      box.style.bottom = "auto";
      box.style.right = "auto";
      e.preventDefault();
    };

    const dragMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches?.[0] || e;
      box.style.left = (touch.clientX - offsetX) + "px";
      box.style.top = (touch.clientY - offsetY) + "px";
    };

    const dragEnd = () => isDragging = false;

    header.addEventListener("mousedown", dragStart);
    header.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("touchmove", dragMove, { passive: false });
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("touchend", dragEnd);

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
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
      }
    };

    runBtn.onclick = () => {
      const code = cssBox.value;
      logBox.textContent = "Console:\n";
      try {
        const originalLog = console.log;
        console.log = (...args) => {
          logBox.textContent += "🟢 " + args.join(" ") + "\n";
          originalLog(...args);
        };
        const result = eval(code);
        logBox.textContent += "✅ Result: " + result + "\n";
        console.log = originalLog;
      } catch (err) {
        logBox.textContent += "❌ Error: " + err.message + "\n";
      }
    };

    clearLogBtn.onclick = () => {
      cssBox.value = "";
      logBox.textContent = "Console:";
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
  });
})();
