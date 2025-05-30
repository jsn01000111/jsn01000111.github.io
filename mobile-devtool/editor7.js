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
    .devTool-highlight {
      outline: 2px solid cyan !important;
      cursor: crosshair !important;
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
    <div id="devToolHeader">Dev Tool</div>
    <textarea id="devToolCSS">/* Type CSS or HTML here */</textarea>
    <div id="devToolFooter">
      <button id="injectBtn">Inject CSS</button>
      <button id="selectElementBtn">Select Element</button>
      <button id="applyHTMLBtn">Apply HTML</button>
      <button id="editToggleBtn">Edit Page</button>
    </div>
  `;
  document.body.appendChild(box);

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
  const selectBtn = box.querySelector("#selectElementBtn");
  const applyBtn = box.querySelector("#applyHTMLBtn");
  const editBtn = box.querySelector("#editToggleBtn");

  injectBtn.onclick = () => {
    const css = cssBox.value.trim();
    if (css) {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
    }
  };

  let selectedEl = null;
  selectBtn.onclick = () => {
    alert("Click on an element to edit its HTML. Press ESC to cancel.");
    const mouseover = e => e.target.classList.add("devTool-highlight");
    const mouseout = e => e.target.classList.remove("devTool-highlight");

    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectedEl = e.target;
      document.querySelectorAll(".devTool-highlight").forEach(el => el.classList.remove("devTool-highlight"));
      cssBox.value = selectedEl.outerHTML;
      cleanup();
    };

    const keyHandler = (e) => {
      if (e.key === "Escape") {
        cleanup();
      }
    };

    const cleanup = () => {
      document.removeEventListener("click", clickHandler, true);
      document.removeEventListener("mouseover", mouseover, true);
      document.removeEventListener("mouseout", mouseout, true);
      document.removeEventListener("keydown", keyHandler);
      document.querySelectorAll(".devTool-highlight").forEach(el => el.classList.remove("devTool-highlight"));
    };

    document.addEventListener("click", clickHandler, true);
    document.addEventListener("mouseover", mouseover, true);
    document.addEventListener("mouseout", mouseout, true);
    document.addEventListener("keydown", keyHandler);
  };

  applyBtn.onclick = () => {
    if (!selectedEl) {
      alert("No element selected. Use 'Select Element' first.");
      return;
    }
    const newEl = document.createElement("div");
    newEl.innerHTML = cssBox.value;
    const replacement = newEl.firstElementChild;
    if (replacement) {
      selectedEl.replaceWith(replacement);
      selectedEl = replacement;
    } else {
      alert("Invalid HTML. Could not apply.");
    }
  };

  let isEditable = false;
  editBtn.onclick = () => {
    isEditable = !isEditable;
    document.body.contentEditable = isEditable;
    editBtn.textContent = isEditable ? "Stop Edit" : "Edit Page";
    document.designMode = isEditable ? "on" : "off";
  };
})();
