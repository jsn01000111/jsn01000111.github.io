
(() => {
  if (window.__devToolLoaded) return;
  window.__devToolLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    #devTool {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 300px;
      height: 250px;
      z-index: 99999;
      font-family: sans-serif;
      background: #111;
      color: #eee;
      border: 2px solid #555;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 10px #000;
      touch-action: none;
    }
    #devToolHeader {
      background: #222;
      padding: 6px 10px;
      cursor: move;
      user-select: none;
      font-weight: bold;
      border-bottom: 1px solid #444;
    }
    #devTool textarea {
      flex: 1;
      padding: 6px;
      font-family: monospace;
      font-size: 13px;
      background: #000;
      color: #0f0;
      border: none;
      resize: none;
    }
    #devToolFooter {
      display: flex;
      gap: 5px;
      padding: 6px;
      background: #222;
      border-top: 1px solid #444;
      flex-wrap: wrap;
    }
    #devToolFooter button {
      flex: 1;
      padding: 4px;
      font-size: 12px;
      background: #333;
      color: #eee;
      border: 1px solid #444;
      border-radius: 4px;
      cursor: pointer;
    }
    #devToolFooter button:hover {
      background: #444;
    }
    #devToolPath {
      padding: 5px 10px;
      font-size: 12px;
      background: #000;
      color: #0f0;
      border-top: 1px solid #444;
      max-height: 3em;
      overflow: auto;
      white-space: nowrap;
    }
    .highlight-inspect {
      outline: 2px dashed red;
      outline-offset: -2px;
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

  // Create UI
  const box = document.createElement("div");
  box.id = "devTool";
  box.innerHTML = `
    <div id="devToolHeader">Dev Tool</div>
    <textarea id="devToolCSS">/* Type CSS or HTML here */</textarea>
    <div id="devToolFooter">
      <button id="injectBtn">Inject CSS</button>
      <button id="selectBtn">Select Element</button>
      <button id="inspectBtn">Click to Inspect</button>
      <button id="editToggleBtn">Edit Page</button>
    </div>
    <div id="devToolPath">Path: (none)</div>
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

  const cssBox = box.querySelector("#devToolCSS");
  const injectBtn = box.querySelector("#injectBtn");
  const selectBtn = box.querySelector("#selectBtn");
  const inspectBtn = box.querySelector("#inspectBtn");
  const editBtn = box.querySelector("#editToggleBtn");
  const pathBox = box.querySelector("#devToolPath");

  injectBtn.onclick = () => {
    const css = cssBox.value.trim();
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
    editBtn.textContent = isEditable ? "Stop Edit" : "Edit Page";
    document.designMode = isEditable ? "on" : "off";
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

  // Select mode
  selectBtn.onclick = () => {
    alert("Click any element to capture its HTML. Press ESC to cancel.");
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
      e.target.classList.add("highlight-inspect");
      cssBox.value = e.target.outerHTML;
      pathBox.textContent = "Path: " + getPath(e.target);
      document.removeEventListener("click", handler, true);
    };
    document.addEventListener("click", handler, true);

    const escHandler = (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("click", handler, true);
        document.removeEventListener("keydown", escHandler);
        alert("Selection cancelled.");
      }
    };
    document.addEventListener("keydown", escHandler);
  };

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
  };
})();
