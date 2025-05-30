if (window.__devToolLoaded) {
  console.warn("Dev tool already loaded.");
} else {
  window.__devToolLoaded = true;

  (function () {
    // Create main container
    const box = document.createElement("div");
    box.id = "devToolBox";
    box.style = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 95vw;
      height: 60vh;
      max-width: 600px;
      min-width: 320px;
      background: #1e1e1e;
      color: #f0f0f0;
      font-family: monospace;
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      box-shadow: 0 0 20px #00000080;
      z-index: 999999;
    `;

    // Toolbar with title, minimize, and close buttons
    const toolbar = document.createElement("div");
    toolbar.style = `
      background: #333;
      padding: 6px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      cursor: move;
    `;
    toolbar.innerHTML = `
      <span style="font-weight: bold;">Dev Tool</span>
      <div>
        <button id="minimizeBtn" style="margin-right: 5px;">−</button>
        <button id="closeBtn">×</button>
      </div>
    `;
    box.appendChild(toolbar);

    // CSS Editor
    const cssBox = document.createElement("div");
    cssBox.id = "cssBox";
    cssBox.style = `
      flex: 1;
      padding: 10px;
      overflow: auto;
      background: #252526;
    `;
    cssBox.innerHTML = `<textarea style="width: 100%; height: 100px; background: #1e1e1e; color: white;"></textarea>`;
    box.appendChild(cssBox);

    // Log Viewer
    const logBox = document.createElement("div");
    logBox.id = "logBox";
    logBox.style = `
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      background: #111;
      font-size: 12px;
    `;
    logBox.textContent = "Console logs will appear here...";
    box.appendChild(logBox);

    // Path Viewer
    const pathBox = document.createElement("div");
    pathBox.id = "pathBox";
    pathBox.style = `
      padding: 6px 10px;
      font-size: 11px;
      background: #222;
      color: #aaa;
    `;
    pathBox.textContent = "Element Path: none";
    box.appendChild(pathBox);

    // Footer
    const footer = document.createElement("div");
    footer.id = "devToolFooter";
    footer.style = `
      padding: 6px 10px;
      background: #2d2d30;
      font-size: 11px;
      text-align: center;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    `;
    footer.textContent = "JSN01000111 | Educational Use Only";
    box.appendChild(footer);

    // Add to page
    document.body.appendChild(box);

    // Button functionality
    const closeBtn = box.querySelector("#closeBtn");
    const minimizeBtn = box.querySelector("#minimizeBtn");

    let isMinimized = false;

    closeBtn.onclick = () => {
      box.remove();
      window.__devToolLoaded = false; // Allow re-initialization
    };

    minimizeBtn.onclick = () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        box.style.height = '40px';
        cssBox.style.display = 'none';
        logBox.style.display = 'none';
        pathBox.style.display = 'none';
        footer.style.display = 'none';
        minimizeBtn.textContent = '□';
      } else {
        box.style.height = (window.innerWidth <= 400) ? '60vh' : '450px';
        cssBox.style.removeProperty('display');
        logBox.style.removeProperty('display');
        pathBox.style.removeProperty('display');
        footer.style.removeProperty('display');
        minimizeBtn.textContent = '−';
      }
    };
  })();
}
