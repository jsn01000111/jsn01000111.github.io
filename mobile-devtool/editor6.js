(() => {
  if (window.__devToolLoaded) return;
  window.__devToolLoaded = true;

  // Create style
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

  // Create DevTool UI
  const box = document.createElement("div");
  box.id = "devTool";
  box.innerHTML = `
    <div id="devToolHeader">Dev Tool</div>
    <textarea id="devToolCSS">/* Type CSS here */</textarea>
    <div id="devToolFooter">
      <button id="injectBtn">Inject CSS</button>
      <button id="replaceHTMLBtn">Replace HTML</button>
      <button id="editToggleBtn">Edit Page</button>
    </div>
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

  // Actions
  const cssBox = box.querySelector("#devToolCSS");
  const injectBtn = box.querySelector("#injectBtn");
  const replaceBtn = box.querySelector("#replaceHTMLBtn");
  const editBtn = box.querySelector("#editToggleBtn");

  injectBtn.onclick = () => {
    const css = cssBox.value.trim();
    if (css) {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
    }
  };

  replaceBtn.onclick = () => {
    if (confirm("Replace entire page HTML with contents of textarea?")) {
      document.documentElement.innerHTML = cssBox.value;
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
