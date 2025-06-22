(function() {
  // Prevent the dev tool from loading multiple times
  if (window.__devToolLoaded) {
    return;
  }
  window.__devToolLoaded = true;

  // --- Styles ---
  const style = document.createElement("style");
  style.textContent = `
    #devTool {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 380px;
      max-width: 95vw;
      height: 350px;
      max-height: 80vh;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      background: #fff;
      color: #111;
      border: 1px solid #ccc;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      overflow: hidden;
      transition: all 0.2s ease-in-out;
    }

    #devToolHeader {
      background: #f0f0f0;
      padding: 8px 12px;
      cursor: grab;
      user-select: none;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    #devToolHeader div {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    #devToolContentArea {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
    }

    #devToolTabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      background: #f9f9f9;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    #devToolTabs button {
      padding: 8px 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      color: #555;
      border-bottom: 3px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    #devToolTabs button:hover:not(.active) {
      background: #eee;
    }
    #devToolTabs button.active {
      color: #007bff;
      font-weight: bold;
      border-bottom: 3px solid #007bff;
      background: #e9f5ff;
    }

    .devToolTabPanel {
      display: none;
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      box-sizing: border-box;
      flex-direction: column;
    }
    .devToolTabPanel.active {
      display: flex;
    }

    #consolePanel {
      padding: 0;
    }
    #consoleLog {
      font-size: 12px;
      padding: 8px;
      background: #fafafa;
      color: #333;
      flex-grow: 1;
      overflow-y: auto;
      min-height: 50px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    #jsCommandInputContainer, #cssCommandInputContainer {
      display: flex;
      border-top: 1px solid #eee;
      flex-shrink: 0;
    }
    #jsCodeInput {
      flex: 1;
      padding: 8px;
      font-size: 13px;
      border: none;
      outline: none;
      resize: none;
      min-height: 40px;
      max-height: 120px;
      box-sizing: border-box;
      overflow-y: auto;
      line-height: 1.5;
    }
    #runJsBtn, #applyCssChangesBtn, #clearNetworkBtn, #refreshStorageBtn, #togglePerformance, #toggleTouchLog, #scanA11yBtn, #saveStateBtn, #loadStateBtn, #copySourceBtn, #loadStylesheetBtn {
      padding: 8px 12px;
      background: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 13px;
      border-radius: 4px;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }
    #runJsBtn:hover, #applyCssChangesBtn:hover, #clearNetworkBtn:hover, #refreshStorageBtn:hover, #togglePerformance:hover, #toggleTouchLog:hover, #scanA11yBtn:hover, #saveStateBtn:hover, #loadStateBtn:hover, #copySourceBtn:hover, #loadStylesheetBtn:hover {
      background: #0056b3;
    }

    #devToolFooter {
      display: flex;
      gap: 6px;
      padding: 8px 10px;
      background: #f9f9f9;
      border-top: 1px solid #ccc;
      flex-wrap: wrap;
      box-sizing: border-box;
      flex-shrink: 0;
      justify-content: center;
    }

    #devToolFooter button {
      flex: 1;
      min-width: 75px;
      padding: 8px 6px;
      font-size: 12px;
      background: #eee;
      color: #333;
      border: 1px solid #bbb;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s ease;
    }

    #devToolFooter button:hover {
      background: #ddd;
    }

    #devToolPath {
      font-size: 11px;
      padding: 4px 8px;
      border-bottom: 1px solid #ddd;
      background: #fafafa;
      color: #333;
      overflow-x: auto;
      white-space: nowrap;
      flex-shrink: 0;
    }

    #consoleLog span.log-error { color: #dc3545; font-weight: bold; }
    #consoleLog span.log-warn { color: #ffc107; }
    #consoleLog span.log-info { color: #17a2b8; }
    #consoleLog span.log-debug { color: #28a745; }
    #consoleLog span.log-normal { color: #343a40; }

    .highlight-inspect {
      outline: 2px dashed #007bff;
      outline-offset: -2px;
    }

    #devToolClose, #devToolMinimize {
      background: transparent;
      border: none;
      color: #666;
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      transition: color 0.15s ease;
    }
    #devToolClose:hover { color: #dc3545; }
    #devToolMinimize:hover { color: #007bff; }
    #devToolMinimize {
      font-size: 24px;
      line-height: 0.7;
    }

    #selectedElementPanel {
      padding: 8px;
      flex-shrink: 0;
      max-height: 60vh;
      overflow-y: auto;
      background: #f9f9f9;
      border-top: 1px solid #eee;
    }
    #selectedElementPanel strong {
      display: block;
      margin-bottom: 6px;
      color: #007bff;
    }
    #selectedElementPanel span {
      font-size: 12px;
      margin-right: 8px;
      color: #555;
    }
    #selectedElementPanel label {
      font-size: 11px;
      color: #666;
      margin-top: 6px;
      display: block;
    }
    #selectedElementPanel input[type="text"],
    #selectedElementPanel textarea {
      width: 100%;
      padding: 6px;
      margin-bottom: 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 12px;
      box-sizing: border-box;
    }
    #selectedElementPanel textarea {
      min-height: 60px;
      resize: vertical;
    }
    #selectedElementPanel .panel-actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 10px;
      justify-content: flex-start;
    }
    #selectedElementPanel .panel-actions button {
      flex: 1;
      min-width: 80px;
      padding: 7px 5px;
      font-size: 11px;
      background: #e9ecef;
      color: #343a40;
      border: 1px solid #cce5ff;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    #selectedElementPanel .panel-actions button:hover {
      background: #dee2e6;
      border-color: #a7d8ff;
    }

    #storageViewerPanel pre, #sourceCodeViewer pre {
      background: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
      margin-bottom: 10px;
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
    }
    #storageViewerPanel h4 {
      margin-top: 15px;
      margin-bottom: 5px;
      color: #495057;
      font-size: 14px;
    }

    #cssCodeInput {
      min-height: 120px;
      max-height: 100%;
    }
    #injectCssButtonContainer {
      display: flex;
      border-top: 1px solid #eee;
      flex-shrink: 0;
      padding: 8px;
      justify-content: flex-end;
    }

    /* New Styles for Network Panel */
    #networkPanel table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    #networkPanel th, #networkPanel td {
      padding: 6px;
      border: 1px solid #ddd;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #networkPanel th {
      background: #e9f5ff;
      font-weight: bold;
    }
    #networkPanel tr:hover {
      background: #f5f5f5;
      cursor: pointer;
    }
    #networkDetails {
      margin-top: 10px;
      padding: 8px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      display: none;
      font-size: 12px;
      max-height: 150px;
      overflow-y: auto;
    }

    /* New Styles for Performance Panel */
    #performancePanel canvas {
      width: 100%;
      height: 100px;
      border: 1px solid #ccc;
      margin-top: 10px;
    }
    #performancePanel p {
      margin: 5px 0;
      font-size: 12px;
    }

    /* New Styles for Touch Panel */
    #touchLog {
      font-size: 12px;
      padding: 8px;
      background: #fafafa;
      color: #333;
      flex-grow: 1;
      overflow-y: auto;
      min-height: 50px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* New Styles for Accessibility Panel */
    #a11yIssues {
      font-size: 12px;
      padding: 8px;
      background: #fafafa;
      color: #333;
      flex-grow: 1;
      overflow-y: auto;
      min-height: 50px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* New Styles for Source Code Panel */
    #sourceCodePanel code {
      display: block;
      padding: 0;
      background: none;
      color: inherit;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 12px;
      line-height: 1.5;
    }
    #sourceCodeViewer {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    /* Styles Panel additions */
    #stylesheetSelectorContainer {
      display: flex;
      gap: 5px;
      padding: 8px;
      border-bottom: 1px solid #eee;
      align-items: center;
      flex-wrap: wrap;
    }
    #stylesheetSelector {
      flex-grow: 1;
      padding: 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
      font-size: 12px;
    }
    #loadStylesheetBtn {
        padding: 6px 10px;
    }


    /* Dark Mode Styles */
    #devTool.dark-mode {
      background: #222;
      color: #eee;
      border-color: #444;
    }
    #devTool.dark-mode #devToolHeader {
      background: #333;
      border-bottom-color: #555;
    }
    #devTool.dark-mode #devToolTabs {
      background: #2a2a2a;
      border-bottom-color: #444;
    }
    #devTool.dark-mode #devToolTabs button {
      color: #bbb;
    }
    #devTool.dark-mode #devToolTabs button.active {
      background: #3a3a3a;
      color: #66b3ff;
    }
    #devTool.dark-mode #consoleLog, #devTool.dark-mode #touchLog, #devTool.dark-mode #a11yIssues {
      background: #1a1a1a;
      color: #ddd;
    }
    #devTool.dark-mode #devToolFooter, #devTool.dark-mode #selectedElementPanel, #devTool.dark-mode #networkDetails {
      background: #2a2a2a;
      border-color: #444;
    }
    #devTool.dark-mode #storageViewerPanel pre, #devTool.dark-mode #sourceCodeViewer pre {
      background: #2a2a2a;
      border-color: #444;
      color: #ddd;
    }
    #devTool.dark-mode #networkPanel th {
      background: #3a3a3a;
    }
    #devTool.dark-mode #networkPanel tr:hover {
      background: #333;
    }
    #devTool.dark-mode #stylesheetSelector {
        background-color: #333;
        color: #eee;
        border-color: #555;
    }


    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      #devTool {
        width: 100vw;
        height: 70vh;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        max-width: unset;
        max-height: unset;
        border-radius: 0;
        border: none;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.25);
      }
      #devToolHeader {
        cursor: auto;
        border-top: none;
      }
      #devToolFooter {
        border-bottom: none;
        padding: 8px;
      }
      #devToolFooter button {
        min-width: 60px;
        padding: 6px 4px;
        font-size: 10px;
      }
      #devToolMinimize, #devToolClose {
        font-size: 26px;
      }
      #devToolMinimize {
        font-size: 30px;
      }
      #devToolTabs button {
        padding: 8px 8px;
        font-size: 12px;
      }
      #jsCodeInput, #cssCodeInput {
        min-height: 30px;
        max-height: 100px;
        font-size: 12px;
      }
      #runJsBtn, #applyCssChangesBtn, #clearNetworkBtn, #refreshStorageBtn, #togglePerformance, #toggleTouchLog, #scanA11yBtn, #saveStateBtn, #loadStateBtn, #copySourceBtn, #loadStylesheetBtn {
        padding: 8px;
        font-size: 12px;
      }
      #networkPanel table, #networkDetails, #performancePanel p, #touchLog, #a11yIssues {
        font-size: 10px;
      }
      #performancePanel canvas {
        height: 80px;
      }
      #stylesheetSelectorContainer {
          flex-direction: column;
          align-items: stretch;
      }
    }
  `;
  document.head.appendChild(style);

  // --- Create UI Elements ---
  const devToolBox = document.createElement("div");
  devToolBox.id = "devTool";
  devToolBox.innerHTML = `
    <div id="devToolHeader">
      <span>Dev Tool</span>
      <div>
        <button id="devToolMinimize">−</button>
        <button id="devToolClose">×</button>
      </div>
    </div>

    <div id="devToolTabs">
      <button data-panel="consolePanel" class="active">Console</button>
      <button data-panel="stylesPanel">Styles</button>
      <button data-panel="elementsPanel">Elements</button>
      <button data-panel="sourceCodePanel">Source</button>
      <button data-panel="storageViewerPanel">Storage</button>
      <button data-panel="networkPanel">Network</button>
      <button data-panel="performancePanel">Performance</button>
      <button data-panel="touchPanel">Touch</button>
      <button data-panel="accessibilityPanel">Accessibility</button>
      <button data-panel="settingsPanel">Settings</button>
    </div>

    <div id="devToolContentArea">
      <div id="consolePanel" class="devToolTabPanel active">
        <div id="consoleLog">Console:</div>
        <div id="jsCommandInputContainer">
          <textarea id="jsCodeInput" placeholder="// Type JavaScript here"></textarea>
          <button id="runJsBtn">▶ Run</button>
        </div>
      </div>

      <div id="stylesPanel" class="devToolTabPanel">
        <div id="stylesheetSelectorContainer">
            <select id="stylesheetSelector">
                <option value="">-- Select Stylesheet --</option>
                <option value="INJECT_NEW_CSS">Inject New CSS</option>
            </select>
            <button id="loadStylesheetBtn">Load</button>
        </div>
        <textarea id="cssCodeInput" placeholder="/* CSS content will load here or type new CSS */"></textarea>
        <div id="injectCssButtonContainer">
          <button id="applyCssChangesBtn">Apply CSS Changes</button>
        </div>
      </div>

      <div id="elementsPanel" class="devToolTabPanel">
        <div id="devToolPath">Path: (none)</div>
        <div id="selectedElementPanel">
          <strong>Selected Element:</strong>
          <span id="selectedElementTag"></span>
          <span id="selectedElementId"></span>
          <span id="selectedElementClasses"></span>
          <div style="margin-top: 8px;">
            <label>ID:</label>
            <input type="text" id="editElementId" placeholder="Element ID">
            <label>Class:</label>
            <input type="text" id="editElementClass" placeholder="Element Class(es)">
          </div>
          <div>
            <label>Outer HTML/Text:</label>
            <textarea id="editElementContent" placeholder="Edit element's outerHTML or text content"></textarea>
          </div>
          <div class="panel-actions">
            <button id="applyElementChangesBtn">Apply Changes</button>
            <button id="removeElementBtn">Remove</button>
            <button id="duplicateElementBtn">Duplicate</button>
            <button id="selectParentBtn">Parent</button>
            <button id="selectFirstChildBtn">Child</button>
            <button id="selectNextSiblingBtn">Sibling</button>
          </div>
        </div>
        <div id="devToolFooter">
          <button id="inspectElementBtn">Inspect</button>
          <button id="editPageBtn">Edit Page</button>
          <button id="clearToolBtn">Clear</button>
        </div>
      </div>

      <div id="sourceCodePanel" class="devToolTabPanel">
        <div id="sourceCodeViewer" style="flex: 1; overflow-y: auto;">
          <pre><code id="pageSourceCode"></code></pre>
        </div>
        <button id="copySourceBtn" style="width: 100%; padding: 8px; margin-top: 10px;">Copy Source</button>
      </div>

      <div id="storageViewerPanel" class="devToolTabPanel">
        <h4>Local Storage</h4>
        <pre id="localStorageContent"></pre>
        <h4>Session Storage</h4>
        <pre id="sessionStorageContent"></pre>
        <button id="refreshStorageBtn" style="width: 100%; padding: 8px; margin-top: 10px; background: #28a745; color: white; border: none; border-radius: 4px;">Refresh Storage</button>
      </div>

      <div id="networkPanel" class="devToolTabPanel">
        <div style="flex: 1; overflow-y: auto; padding: 8px;">
          <table>
            <thead><tr><th>Method</th><th>URL</th><th>Status</th><th>Time</th></tr></thead>
            <tbody id="networkLogBody"></tbody>
          </table>
          <div id="networkDetails"></div>
        </div>
        <button id="clearNetworkBtn" style="width: 100%; padding: 8px; margin-top: 10px;">Clear Network Log</button>
      </div>

      <div id="performancePanel" class="devToolTabPanel">
        <div style="padding: 8px;">
          <p>FPS: <span id="fpsCounter">0</span></p>
          <p>Memory: <span id="memoryCounter">N/A</span></p>
          <canvas id="performanceGraph"></canvas>
          <button id="togglePerformance" style="width: 100%; padding: 8px; margin-top: 10px;">Start Monitoring</button>
        </div>
      </div>

      <div id="touchPanel" class="devToolTabPanel">
        <div id="touchLog" style="flex: 1; overflow-y: auto; padding: 8px;"></div>
        <button id="toggleTouchLog" style="width: 100%; padding: 8px; margin-top: 10px;">Start Touch Logging</button>
      </div>

      <div id="accessibilityPanel" class="devToolTabPanel">
        <div id="a11yIssues" style="flex: 1; overflow-y: auto; padding: 8px;"></div>
        <button id="scanA11yBtn" style="width: 100%; padding: 8px; margin-top: 10px;">Scan Accessibility</button>
      </div>

      <div id="settingsPanel" class="devToolTabPanel">
        <p>This is the settings panel.</p>
        <label style="margin-top: 10px;">
          <input type="checkbox" id="darkModeToggle"> Dark Mode
        </label>
        <div style="margin-top: 10px;">
          <label>Device Emulation:</label>
          <select id="devicePreset">
            <option value="">Select Device</option>
            <option value="iPhone14">iPhone 14 (390x844)</option>
            <option value="GalaxyS23">Galaxy S23 (412x915)</option>
            <option value="custom">Custom</option>
          </select>
          <div id="customDeviceInputs" style="display: none;">
            <label>Width:</label><input type="number" id="customWidth" placeholder="Width (px)">
            <label>Height:</label><input type="number" id="customHeight" placeholder="Height (px)">
            <label>User Agent:</label><input type="text" id="customUserAgent" placeholder="User Agent">
          </div>
          <button id="applyDeviceEmulation" style="padding: 8px; margin-top: 5px;">Apply</button>
        </div>
        <button id="saveStateBtn" style="padding: 8px; margin: 5px; background: #28a745; color: white;">Save State</button>
        <button id="loadStateBtn" style="padding: 8px; margin: 5px;">Load State</button>
        <button id="resetToolSettings" style="padding: 8px; margin-top: 5px; background: #dc3545; color: white;">Reset Tool</button>
      </div>
    </div>
  `;
  document.body.appendChild(devToolBox);

  // --- Get UI Element References ---
  const header = devToolBox.querySelector("#devToolHeader");
  const devToolTabs = devToolBox.querySelector("#devToolTabs");
  const tabPanels = devToolBox.querySelectorAll(".devToolTabPanel");

  // Console Panel
  const consoleLog = devToolBox.querySelector("#consoleLog");
  const jsCodeInput = devToolBox.querySelector("#jsCodeInput");
  const runJsBtn = devToolBox.querySelector("#runJsBtn");

  // Styles Panel
  const stylesheetSelector = devToolBox.querySelector("#stylesheetSelector");
  const loadStylesheetBtn = devToolBox.querySelector("#loadStylesheetBtn");
  const cssCodeInput = devToolBox.querySelector("#cssCodeInput");
  const applyCssChangesBtn = devToolBox.querySelector("#applyCssChangesBtn");

  // Elements Panel
  const elementsPanel = devToolBox.querySelector("#elementsPanel");
  const pathDisplay = devToolBox.querySelector("#devToolPath");
  const selectedElementPanel = devToolBox.querySelector("#selectedElementPanel");
  const selectedElementTag = devToolBox.querySelector("#selectedElementTag");
  const selectedElementId = devToolBox.querySelector("#selectedElementId");
  const selectedElementClasses = devToolBox.querySelector("#selectedElementClasses");
  const editElementId = devToolBox.querySelector("#editElementId");
  const editElementClass = devToolBox.querySelector("#editElementClass");
  const editElementContent = devToolBox.querySelector("#editElementContent");
  const applyElementChangesBtn = devToolBox.querySelector("#applyElementChangesBtn");
  const removeElementBtn = devToolBox.querySelector("#removeElementBtn");
  const duplicateElementBtn = devToolBox.querySelector("#duplicateElementBtn");
  const selectParentBtn = devToolBox.querySelector("#selectParentBtn");
  const selectFirstChildBtn = devToolBox.querySelector("#selectFirstChildBtn");
  const selectNextSiblingBtn = devToolBox.querySelector("#selectNextSiblingBtn");
  const inspectElementBtn = devToolBox.querySelector("#inspectElementBtn");
  const editPageBtn = devToolBox.querySelector("#editPageBtn");
  const clearToolBtn = devToolBox.querySelector("#clearToolBtn");

  // Source Code Panel
  const pageSourceCode = devToolBox.querySelector("#pageSourceCode");
  const copySourceBtn = devToolBox.querySelector("#copySourceBtn");

  // Storage Viewer Panel
  const localStorageContent = devToolBox.querySelector("#localStorageContent");
  const sessionStorageContent = devToolBox.querySelector("#sessionStorageContent");
  const refreshStorageBtn = devToolBox.querySelector("#refreshStorageBtn");

  // Network Panel
  const networkLogBody = devToolBox.querySelector("#networkLogBody");
  const networkDetails = devToolBox.querySelector("#networkDetails");
  const clearNetworkBtn = devToolBox.querySelector("#clearNetworkBtn");

  // Performance Panel
  const fpsCounter = devToolBox.querySelector("#fpsCounter");
  const memoryCounter = devToolBox.querySelector("#memoryCounter");
  const performanceGraph = devToolBox.querySelector("#performanceGraph");
  const togglePerformance = devToolBox.querySelector("#togglePerformance");

  // Touch Panel
  const touchLog = devToolBox.querySelector("#touchLog");
  const toggleTouchLog = devToolBox.querySelector("#toggleTouchLog");

  // Accessibility Panel
  const a11yIssues = devToolBox.querySelector("#a11yIssues");
  const scanA11yBtn = devToolBox.querySelector("#scanA11yBtn");

  // Settings Panel
  const darkModeToggle = devToolBox.querySelector("#darkModeToggle");
  const devicePreset = devToolBox.querySelector("#devicePreset");
  const customDeviceInputs = devToolBox.querySelector("#customDeviceInputs");
  const customWidth = devToolBox.querySelector("#customWidth");
  const customHeight = devToolBox.querySelector("#customHeight");
  const customUserAgent = devToolBox.querySelector("#customUserAgent");
  const applyDeviceEmulation = devToolBox.querySelector("#applyDeviceEmulation");
  const saveStateBtn = devToolBox.querySelector("#saveStateBtn");
  const loadStateBtn = devToolBox.querySelector("#loadStateBtn");
  const resetToolSettings = devToolBox.querySelector("#resetToolSettings");

  // Global actions
  const closeBtn = devToolBox.querySelector("#devToolClose");
  const minimizeBtn = devToolBox.querySelector("#devToolMinimize");

  let currentInspectedElement = null;
  let isEditable = false;
  let isInspectMode = false;
  let isMinimized = false;
  let stylesheets = []; // To store references to style elements/URLs

  // --- Tab Functionality ---
  devToolTabs.addEventListener("click", (event) => {
    const clickedButton = event.target.closest("button");
    if (!clickedButton) return;

    const targetPanelId = clickedButton.dataset.panel;

    devToolTabs.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
    tabPanels.forEach(panel => panel.classList.remove("active"));

    clickedButton.classList.add("active");
    devToolBox.querySelector(`#${targetPanelId}`).classList.add("active");

    if (targetPanelId === 'elementsPanel') {
      selectedElementPanel.style.display = currentInspectedElement ? 'block' : 'none';
      if (currentInspectedElement) {
        currentInspectedElement.classList.add("highlight-inspect");
      }
    } else {
      selectedElementPanel.style.display = 'none';
      document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    }

    if (targetPanelId === 'stylesPanel') { // New: Populate stylesheets when Styles tab is active
        detectAndListStylesheets();
    } else if (targetPanelId === 'storageViewerPanel') {
      updateStorageViewer();
    } else if (targetPanelId === 'networkPanel') {
      networkDetails.style.display = 'none';
    } else if (targetPanelId === 'performancePanel') {
      if (isMonitoring) togglePerformance.click();
    } else if (targetPanelId === 'touchPanel') {
      if (!isTouchLogging) toggleTouchLog.click();
    } else if (targetPanelId === 'sourceCodePanel') {
        updateSourceCodeViewer();
    }
  });

  // --- Dragging Functionality ---
  let offsetX = 0, offsetY = 0, isDragging = false;

  const dragStart = (event) => {
    if (window.innerWidth <= 768) return;
    isDragging = true;
    const touch = event.touches ? event.touches[0] : event;
    offsetX = touch.clientX - devToolBox.offsetLeft;
    offsetY = touch.clientY - devToolBox.offsetTop;
    event.preventDefault();
    devToolBox.style.transition = 'none';
  };

  const dragMove = (event) => {
    if (!isDragging) return;
    const touch = event.touches ? event.touches[0] : event;
    let newX = touch.clientX - offsetX;
    let newY = touch.clientY - offsetY;

    const maxX = window.innerWidth - devToolBox.offsetWidth;
    const maxY = window.innerHeight - devToolBox.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    devToolBox.style.left = newX + "px";
    devToolBox.style.top = newY + "px";
    devToolBox.style.bottom = "auto";
    devToolBox.style.right = "auto";
  };

  const dragEnd = () => {
    isDragging = false;
    devToolBox.style.transition = 'all 0.2s ease-in-out';
  };

  header.addEventListener("mousedown", dragStart);
  header.addEventListener("touchstart", dragStart, { passive: false });
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("touchmove", dragMove, { passive: false });
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);

  // --- Console Override and Global Error Handling ---
  const originalConsole = {
    log: window.console.log,
    error: window.console.error,
    warn: window.console.warn,
    info: window.console.info,
    debug: window.console.debug,
    clear: window.console.clear,
    dir: window.console.dir,
    table: window.console.table
  };

  function formatConsoleArg(arg) {
    if (typeof arg === 'object' && arg !== null) {
      try {
        const seen = new Set();
        const json = JSON.stringify(arg, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
          }
          return value;
        }, 2);
        return json.substring(0, 1000) + (json.length > 1000 ? '...' : '');
      } catch (e) {
        return `[Object] ${String(arg).substring(0, 300)}...`;
      }
    }
    return String(arg).substring(0, 1000);
  }

  function updateConsoleLogUI(type, args) {
    let prefix = '';
    let className = '';

    const formattedArgs = args.map(formatConsoleArg).join(' ');

    switch (type) {
      case 'log': prefix = '🟢 '; className = 'log-normal'; break;
      case 'error': prefix = '❌ '; className = 'log-error'; break;
      case 'warn': prefix = '⚠️ '; className = 'log-warn'; break;
      case 'info': prefix = '🔵 '; className = 'log-info'; break;
      case 'debug': prefix = '🐞 '; className = 'log-debug'; break;
      case 'result': prefix = '✅ '; className = 'log-normal'; break;
      default: prefix = '💬 '; className = 'log-normal';
    }

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry`;
    logEntry.innerHTML = `<span class="${className}">${prefix}${formattedArgs}</span>`;
    consoleLog.appendChild(logEntry);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  window.console.log = (...args) => { updateConsoleLogUI('log', args); originalConsole.log(...args); };
  window.console.error = (...args) => { updateConsoleLogUI('error', args); originalConsole.error(...args); };
  window.console.warn = (...args) => { updateConsoleLogUI('warn', args); originalConsole.warn(...args); };
  window.console.info = (...args) => { updateConsoleLogUI('info', args); originalConsole.info(...args); };
  window.console.debug = (...args) => { updateConsoleLogUI('debug', args); originalConsole.debug(...args); };
  window.console.clear = () => { consoleLog.innerHTML = ""; originalConsole.clear(); };
  window.console.dir = (...args) => { updateConsoleLogUI('info', ['dir:', ...args]); originalConsole.dir(...args); };
  window.console.table = (...args) => { updateConsoleLogUI('info', ['table:', ...args]); originalConsole.table(...args); };

  window.addEventListener('error', (event) => {
    updateConsoleLogUI('error', [`Uncaught Error: ${event.message}`, `at ${event.filename}:${event.lineno}:${event.colno}`]);
    event.preventDefault();
  });

  window.addEventListener('unhandledrejection', (event) => {
    updateConsoleLogUI('error', [`Unhandled Promise Rejection: ${event.reason}`]);
    event.preventDefault();
  });

  // --- Network Request Inspector ---
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const startTime = performance.now();
    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();
      const clone = response.clone();
      const headers = {};
      clone.headers.forEach((value, key) => { headers[key] = value; });
      const body = await clone.text();
      const logEntry = {
        method: args[1]?.method || 'GET',
        url: typeof args[0] === 'string' ? args[0] : args[0].url,
        status: clone.status,
        time: (endTime - startTime).toFixed(2) + 'ms',
        headers,
        body
      };
      updateNetworkLog(logEntry);
      return response;
    } catch (error) {
      updateConsoleLogUI('error', [`Fetch Error: ${error.message}`]);
      throw error;
    }
  };

  function updateNetworkLog(entry) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${entry.method}</td><td>${entry.url}</td><td>${entry.status}</td><td>${entry.time}</td>`;
    row.onclick = () => {
      networkDetails.innerHTML = `
        <strong>Details:</strong><br>
        Method: ${entry.method}<br>
        URL: ${entry.url}<br>
        Status: ${entry.status}<br>
        Time: ${entry.time}<br>
        <strong>Headers:</strong><pre>${JSON.stringify(entry.headers, null, 2)}</pre>
        <strong>Response:</strong><pre>${entry.body.substring(0, 500)}${entry.body.length > 500 ? '...' : ''}</pre>
      `;
      networkDetails.style.display = 'block';
      networkDetails.scrollIntoView({ behavior: 'smooth' });
    };
    networkLogBody.appendChild(row);
  }

  clearNetworkBtn.onclick = () => {
    networkLogBody.innerHTML = '';
    networkDetails.style.display = 'none';
    updateConsoleLogUI('log', ['Network log cleared.']);
  };

  // --- Performance Monitor ---
  let isMonitoring = false;
  let frameCount = 0;
  let lastTime = performance.now();
  const fpsHistory = [];
  const ctx = performanceGraph?.getContext('2d');

  function updatePerformance() {
    if (!isMonitoring) return;
    const now = performance.now();
    frameCount++;
    if (now - lastTime >= 1000) {
      const fps = frameCount;
      frameCount = 0;
      lastTime = now;
      fpsCounter.textContent = fps;
      if ('memory' in performance) {
        memoryCounter.textContent = `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`;
      }
      fpsHistory.push(fps);
      if (fpsHistory.length > 50) fpsHistory.shift();
      if (ctx) {
        ctx.clearRect(0, 0, performanceGraph.width, performanceGraph.height);
        ctx.beginPath();
        ctx.moveTo(0, performanceGraph.height);
        fpsHistory.forEach((val, i) => {
          ctx.lineTo(i * (performanceGraph.width / 50), performanceGraph.height - (val / 60 * performanceGraph.height));
        });
        ctx.strokeStyle = '#007bff';
        ctx.stroke();
      }
      requestAnimationFrame(updatePerformance);
    } else {
      requestAnimationFrame(updatePerformance);
    }
  }

  togglePerformance.onclick = () => {
    isMonitoring = !isMonitoring;
    togglePerformance.textContent = isMonitoring ? 'Stop Monitoring' : 'Start Monitoring';
    if (isMonitoring) requestAnimationFrame(updatePerformance);
    updateConsoleLogUI('log', [`Performance monitoring ${isMonitoring ? 'started' : 'stopped'}.`]);
  };

  // --- Touch Event Debugger ---
  let isTouchLogging = false;

  function logTouchEvent(event) {
    if (!isTouchLogging) return;
    const touch = event.touches[0] || event.changedTouches[0];
    const logEntry = `Type: ${event.type}, X: ${touch?.clientX.toFixed(2)} Y: ${touch?.clientY.toFixed(2)}, Touches: ${event.touches.length}, Target: ${event.target.tagName}`;
    const div = document.createElement('div');
    div.textContent = logEntry;
    touchLog.appendChild(div);
    touchLog.scrollTop = touchLog.scrollHeight;
  }

  toggleTouchLog.onclick = () => {
    isTouchLogging = !isTouchLogging;
    toggleTouchLog.textContent = isTouchLogging ? 'Stop Touch Logging' : 'Start Touch Logging';
    const events = ['touchstart', 'touchmove', 'touchend'];
    events.forEach(event => {
      if (isTouchLogging) {
        document.addEventListener(event, logTouchEvent, { passive: true });
      } else {
        document.removeEventListener(event, logTouchEvent);
      }
    });
    updateConsoleLogUI('log', [`Touch logging ${isTouchLogging ? 'started' : 'stopped'}.`]);
  };

  // --- Accessibility Checker ---
  function checkAccessibility(element = document.body) {
    const issues = [];
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        issues.push(`Image missing alt attribute: ${getElementPath(img)}`);
      }
    });
    const interactive = element.querySelectorAll('button, input, a');
    interactive.forEach(el => {
      if (!el.textContent.trim() && !el.hasAttribute('aria-label')) {
        issues.push(`Interactive element missing label: ${getElementPath(el)}`);
      }
    });
    a11yIssues.innerHTML = issues.length ? issues.map(issue => `<div>${issue}</div>`).join('') : 'No accessibility issues found.';
    updateConsoleLogUI('log', ['Accessibility scan completed.']);
  }

  scanA11yBtn.onclick = () => {
    checkAccessibility(currentInspectedElement || document.body);
  };

  // --- Device Emulation ---
  const devicePresets = {
    iPhone14: { width: 390, height: 844, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)' },
    GalaxyS23: { width: 412, height: 915, userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko)' }
  };

  devicePreset.onchange = (e) => {
    customDeviceInputs.style.display = e.target.value === 'custom' ? 'block' : 'none';
  };

  applyDeviceEmulation.onclick = () => {
    const preset = devicePreset.value;
    let width, height, userAgent;
    if (preset === 'custom') {
      width = parseInt(customWidth.value) || window.innerWidth;
      height = parseInt(customHeight.value) || window.innerHeight;
      userAgent = customUserAgent.value || navigator.userAgent;
    } else if (preset) {
      ({ width, height, userAgent } = devicePresets[preset]);
    } else {
      updateConsoleLogUI('warn', ['Select a device or enter custom values.']);
      return;
    }
    document.documentElement.style.width = `${width}px`;
    document.documentElement.style.height = `${height}px`;
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = `width=${width}, initial-scale=1.0`;
    Object.defineProperty(navigator, 'userAgent', { value: userAgent, writable: true });
    updateConsoleLogUI('log', [`Emulated device: ${preset || 'Custom'} (${width}x${height})`]);
  };

  // --- Save/Load State ---
  saveStateBtn.onclick = () => {
    const state = {
      consoleLog: consoleLog.innerHTML,
      cssCode: cssCodeInput.value,
      jsCode: jsCodeInput.value,
      activeTab: devToolTabs.querySelector('button.active')?.dataset.panel,
      selectedElementPath: currentInspectedElement ? getElementPath(currentInspectedElement) : null,
      darkMode: darkModeToggle.checked
    };
    localStorage.setItem('devToolState', JSON.stringify(state));
    updateConsoleLogUI('log', ['Tool state saved.']);
  };

  loadStateBtn.onclick = () => {
    const state = JSON.parse(localStorage.getItem('devToolState') || '{}');
    if (state.consoleLog) consoleLog.innerHTML = state.consoleLog;
    if (state.cssCode) cssCodeInput.value = state.cssCode;
    if (state.jsCode) jsCodeInput.value = state.jsCode;
    if (state.activeTab) devToolTabs.querySelector(`[data-panel="${state.activeTab}"]`)?.click();
    if (state.selectedElementPath) {
      const element = document.querySelector(state.selectedElementPath);
      if (element) selectAndDisplayElement(element);
    }
    if (state.darkMode) {
      darkModeToggle.checked = true;
      devToolBox.classList.add('dark-mode');
    }
    updateConsoleLogUI('log', ['Tool state loaded.']);
  };

  // --- Dark Mode ---
  darkModeToggle.onchange = () => {
    devToolBox.classList.toggle('dark-mode', darkModeToggle.checked);
    localStorage.setItem('devToolDarkMode', darkModeToggle.checked);
    updateConsoleLogUI('log', [`Dark mode ${darkModeToggle.checked ? 'enabled' : 'disabled'}.`]);
  };
  if (localStorage.getItem('devToolDarkMode') === 'true') {
    darkModeToggle.checked = true;
    devToolBox.classList.add('dark-mode');
  }

  // --- Stylesheet Editing Features ---
  let currentStylesheetTarget = null; // Stores the actual <style> element or a URL for <link>

  function detectAndListStylesheets() {
      stylesheetSelector.innerHTML = '<option value="">-- Select Stylesheet --</option>';
      stylesheetSelector.innerHTML += '<option value="INJECT_NEW_CSS">Inject New CSS</option>';
      stylesheets = []; // Clear previous list

      // Get all <style> tags
      document.querySelectorAll('style').forEach((styleEl, index) => {
          // Generate a unique ID if not present
          const id = styleEl.id || `_devtool_inline_style_${index + 1}`;
          // Use a snippet of the content or the ID for better identification
          const contentSnippet = styleEl.textContent.trim().substring(0, 50).replace(/\n/g, ' ') + (styleEl.textContent.trim().length > 50 ? '...' : '');
          const label = `Edit CSS Style: ${styleEl.id ? '#' + styleEl.id : (contentSnippet || `Unnamed ${index + 1}`)}`;
          stylesheetSelector.innerHTML += `<option value="${id}">${label}</option>`;
          stylesheets.push({ id: id, type: 'inline', element: styleEl });
      });

      // Get all <link rel="stylesheet"> tags
      document.querySelectorAll('link[rel="stylesheet"]').forEach((linkEl, index) => {
          const href = linkEl.href;
          const isSameOrigin = new URL(href, window.location.href).origin === window.location.origin;
          const fileName = href.split('/').pop() || `External Style ${index + 1}`;
          const label = `Edit Stylesheet: ${linkEl.id ? '#' + linkEl.id + ' - ' : ''}${fileName} ${isSameOrigin ? '' : ' (CORS Blocked)'}`; // Corrected label
          const value = href; // Use href as value for external stylesheets
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          if (!isSameOrigin) {
              option.disabled = true; // Disable if CORS-blocked
              option.title = "Cannot edit cross-origin stylesheets directly from a bookmarklet due to CORS policy.";
          }
          stylesheetSelector.appendChild(option);
          if (isSameOrigin) {
            stylesheets.push({ id: value, type: 'external', element: linkEl, href: href });
          } else {
            // Store a disabled entry for display purposes
            stylesheets.push({ id: value, type: 'external-cors', element: linkEl, href: href });
          }
      });

      cssCodeInput.value = '/* Select a stylesheet from the dropdown to edit, or choose "Inject New CSS" to inject new CSS. */';
      currentStylesheetTarget = null; // Reset current target
      stylesheetSelector.value = ""; // Reset dropdown
  }

  loadStylesheetBtn.onclick = async () => {
      const selectedValue = stylesheetSelector.value;
      if (!selectedValue) {
          updateConsoleLogUI('warn', ['Please select a stylesheet to load.']);
          cssCodeInput.value = '/* Select a stylesheet from the dropdown to edit, or choose "Inject New CSS" to inject new CSS. */';
          currentStylesheetTarget = null;
          return;
      }

      if (selectedValue === "INJECT_NEW_CSS") {
          cssCodeInput.value = '/* Type your new CSS here. It will be injected as a new <style> tag. */\n\n';
          currentStylesheetTarget = 'INJECT_NEW_CSS';
          updateConsoleLogUI('log', ['Ready to inject new CSS.']);
          return;
      }

      const selectedStylesheet = stylesheets.find(s => s.id === selectedValue);

      if (selectedStylesheet) {
          if (selectedStylesheet.type === 'inline') {
              cssCodeInput.value = selectedStylesheet.element.textContent;
              currentStylesheetTarget = selectedStylesheet.element;
              updateConsoleLogUI('log', [`Loaded inline CSS for editing: ${selectedStylesheet.id}`]);
          } else if (selectedStylesheet.type === 'external') {
              try {
                  const response = await fetch(selectedStylesheet.href);
                  if (response.ok) {
                      const cssContent = await response.text();
                      cssCodeInput.value = cssContent;
                      currentStylesheetTarget = selectedStylesheet.element; // Store the <link> element
                      updateConsoleLogUI('log', [`Loaded external stylesheet for editing: ${selectedStylesheet.href}`]);
                  } else {
                      updateConsoleLogUI('error', [`Failed to load stylesheet from ${selectedStylesheet.href}: Status ${response.status}`]);
                  }
              } catch (error) {
                  updateConsoleLogUI('error', [`Error fetching stylesheet from ${selectedStylesheet.href}:`, error.message]);
              }
          }
      } else {
          updateConsoleLogUI('error', ['Selected stylesheet not found.']);
      }
  };


  applyCssChangesBtn.onclick = () => {
    const css = cssCodeInput.value.trim();
    if (!css) {
        updateConsoleLogUI('warn', ["No CSS content to apply."]);
        return;
    }

    if (currentStylesheetTarget === 'INJECT_NEW_CSS') {
        const styleEl = document.createElement("style");
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        updateConsoleLogUI('log', ["New CSS injected as an inline style."]);
        detectAndListStylesheets(); // Refresh the list to show the new style
        cssCodeInput.value = "";
    } else if (currentStylesheetTarget && currentStylesheetTarget.tagName) {
        // It's an existing <style> or <link> element
        if (currentStylesheetTarget.tagName.toLowerCase() === 'style') {
            currentStylesheetTarget.textContent = css;
            updateConsoleLogUI('log', [`Updated inline CSS: ${currentStylesheetTarget.id || currentStylesheetTarget.outerHTML.substring(0, 50)}...`]);
        } else if (currentStylesheetTarget.tagName.toLowerCase() === 'link' && currentStylesheetTarget.rel === 'stylesheet') {
            // For external stylesheets, we can't directly change the content loaded from href due to security.
            // The best we can do for live editing is to inject a new <style> tag that overrides it.
            updateConsoleLogUI('warn', ['Cannot directly modify external stylesheet source. Applying as an overriding inline style.']);

            const newOverrideStyle = document.createElement('style');
            newOverrideStyle.setAttribute('data-devtool-override-for', currentStylesheetTarget.href || 'unknown');
            newOverrideStyle.textContent = css;
            document.head.appendChild(newOverrideStyle);
            updateConsoleLogUI('log', ['Injected new inline style to override external stylesheet.']);
            detectAndListStylesheets(); // Refresh to show the new override style
        }
    } else {
        // Fallback if no specific target is selected but apply is clicked
        const styleEl = document.createElement("style");
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        updateConsoleLogUI('log', ["CSS Injected as a new inline style (no stylesheet selected)."]);
        detectAndListStylesheets(); // Refresh the list
    }
  };

  // --- Button Event Listeners ---
  runJsBtn.onclick = () => {
    const code = jsCodeInput.value;
    updateConsoleLogUI('log', ["--- Executing Code ---"]);
    try {
      const result = window.eval(`(function() { try { ${code} } catch (e) { return 'Error: ' + e.message; } })();`);
      updateConsoleLogUI('result', [`Result:`, result]);
    } catch (err) {
      updateConsoleLogUI('error', [`Execution Error: ${err.message}`]);
    } finally {
      jsCodeInput.value = "";
    }
  };

  editPageBtn.onclick = () => {
    isEditable = !isEditable;
    document.body.contentEditable = isEditable;
    document.designMode = isEditable ? "on" : "off";
    editPageBtn.textContent = isEditable ? "Stop Edit" : "Edit Page";
    updateConsoleLogUI('log', [`Page editing ${isEditable ? 'enabled' : 'disabled'}.`]);
  };

  function updateStorageViewer() {
    localStorageContent.textContent = "Loading Local Storage...";
    sessionStorageContent.textContent = "Loading Session Storage...";

    let localContent = "{\n";
    if (localStorage.length === 0) {
      localContent += "  // Local Storage is empty\n";
    } else {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        try {
          localContent += `  "${key}": ${JSON.stringify(JSON.parse(value), null, 2)},\n`;
        } catch (e) {
          localContent += `  "${key}": "${value}",\n`;
        }
      }
    }
    localContent = localContent.replace(/,\n$/, '\n') + "}";

    let sessionContent = "{\n";
    if (sessionStorage.length === 0) {
      sessionContent += "  // Session Storage is empty\n";
    } else {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        try {
          sessionContent += `  "${key}": ${JSON.stringify(JSON.parse(value), null, 2)},\n`;
        } catch (e) {
          sessionContent += `  "${key}": "${value}",\n`;
        }
      }
    }
    sessionContent = sessionContent.replace(/,\n$/, '\n') + "}";
    localStorageContent.textContent = localContent;
    sessionStorageContent.textContent = sessionContent;
  }
  refreshStorageBtn.onclick = updateStorageViewer;

  // --- Source Code Viewer Functions ---
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function updateSourceCodeViewer() {
    const rawHTML = document.documentElement.outerHTML;
    pageSourceCode.textContent = escapeHTML(rawHTML);
    updateConsoleLogUI('log', ['Page source code loaded.']);
  }

  copySourceBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(document.documentElement.outerHTML);
      updateConsoleLogUI('log', ['Page source code copied to clipboard!']);
    } catch (err) {
      updateConsoleLogUI('error', ['Failed to copy source code:', err]);
    }
  };
  // End of Source Code Viewer Functions

  clearToolBtn.onclick = () => {
    jsCodeInput.value = "";
    cssCodeInput.value = "";
    cssCodeInput.value = '/* CSS content will load here or type new CSS */'; // Reset styles input
    stylesheetSelector.innerHTML = '<option value="">-- Select or Inject CSS --</option><option value="INJECT_NEW_CSS">Inject New CSS</option>'; // Reset stylesheet selector
    currentStylesheetTarget = null; // Clear selected stylesheet
    consoleLog.innerHTML = "";
    pathDisplay.textContent = "Path: (none)";
    isEditable = false;
    document.body.contentEditable = false;
    document.designMode = "off";
    editPageBtn.textContent = "Edit Page";
    isInspectMode = false;
    inspectElementBtn.textContent = "Inspect";
    selectedElementPanel.style.display = 'none';
    currentInspectedElement = null;
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    document.body.removeEventListener("mouseover", highlightElement);
    document.body.removeEventListener("click", captureElement, true);
    networkLogBody.innerHTML = '';
    networkDetails.style.display = 'none';
    touchLog.innerHTML = '';
    a11yIssues.innerHTML = '';
    pageSourceCode.textContent = ''; // Clear source code viewer
    if (isMonitoring) togglePerformance.click();
    if (isTouchLogging) toggleTouchLog.click();
    updateConsoleLogUI('log', ["Dev Tool cleared and reset."]);
  };

  resetToolSettings.onclick = () => {
    clearToolBtn.click();
    localStorage.removeItem('devToolState');
    localStorage.removeItem('devToolDarkMode');
    darkModeToggle.checked = false;
    devToolBox.classList.remove('dark-mode');
    updateConsoleLogUI('log', ['Tool settings reset.']);
  };

  closeBtn.onclick = () => {
    document.body.removeChild(devToolBox);
    delete window.__devToolLoaded;
    Object.assign(window.console, originalConsole);
    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    document.body.removeEventListener("mouseover", highlightElement);
    document.body.removeEventListener("click", captureElement, true);
    const events = ['touchstart', 'touchmove', 'touchend'];
    events.forEach(event => document.removeEventListener(event, logTouchEvent));
  };

  minimizeBtn.onclick = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      devToolBox.style.height = '40px';
      devToolBox.style.width = '200px';
      devToolBox.style.flexDirection = 'row';
      devToolBox.style.alignItems = 'center';
      devToolBox.style.justifyContent = 'space-between';
      devToolTabs.style.display = 'none';
      tabPanels.forEach(panel => panel.style.display = 'none');
      devToolBox.querySelector("#devToolHeader").style.borderBottom = 'none';
      devToolBox.querySelector("#devToolHeader span").textContent = 'Dev Tool (Minimized)';
    } else {
      devToolBox.style.height = window.innerWidth <= 768 ? '70vh' : '350px';
      devToolBox.style.width = window.innerWidth <= 768 ? '100vw' : '380px';
      devToolBox.style.flexDirection = 'column';
      devToolBox.style.alignItems = 'stretch';
      devToolBox.style.justifyContent = 'flex-start';
      devToolTabs.style.display = 'flex';
      devToolBox.querySelector("#devToolHeader").style.borderBottom = '1px solid #ccc';
      devToolBox.querySelector("#devToolHeader span").textContent = 'Dev Tool';
      const activeTabButton = devToolTabs.querySelector('button.active');
      if (activeTabButton) {
        const targetPanelId = activeTabButton.dataset.panel;
        devToolBox.querySelector(`#${targetPanelId}`).classList.add("active");
        if (targetPanelId === 'elementsPanel' && currentInspectedElement) {
          selectedElementPanel.style.display = 'block';
        } else if (targetPanelId === 'storageViewerPanel') {
          updateStorageViewer();
        } else if (targetPanelId === 'sourceCodePanel') {
          updateSourceCodeViewer();
        } else if (targetPanelId === 'stylesPanel') { // New: Ensure stylesheet list updates on minimize/restore
          detectAndListStylesheets();
        }
      } else {
        devToolBox.querySelector("#consolePanel").classList.add("active");
        devToolTabs.querySelector('[data-panel="consolePanel"]').classList.add("active");
      }
    }
    minimizeBtn.textContent = isMinimized ? '❐' : '−';
  };

  // --- Element Inspection ---
  function getElementPath(element) {
    if (!element || element === document.documentElement) return "";
    const path = [];
    while (element && element.nodeType === 1 && element !== document.documentElement) {
      let name = element.nodeName.toLowerCase();
      if (element.id) {
        name += `#${element.id}`;
        path.unshift(name);
        break;
      } else {
        let sibling = element, count = 1;
        while (sibling = sibling.previousElementSibling) {
          if (sibling.nodeName.toLowerCase() === name) count++;
        }
        name += (count > 1) ? `:nth-of-type(${count})` : '';
      }
      path.unshift(name);
      element = element.parentElement;
    }
    return path.join(" > ");
  }

  const selectAndDisplayElement = (element) => {
    if (!element || element.nodeType !== 1) {
      updateConsoleLogUI('warn', ["Cannot select non-element node."]);
      return;
    }

    devToolTabs.querySelector('[data-panel="elementsPanel"]').click();
    currentInspectedElement = element;

    document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    element.classList.add("highlight-inspect");

    selectedElementPanel.style.display = 'block';
    selectedElementTag.textContent = element.tagName.toLowerCase();
    selectedElementId.textContent = element.id ? `#${element.id}` : '';
    selectedElementClasses.textContent = element.className ? `.${element.className.split(' ').join('.')}` : '';
    editElementId.value = element.id || '';
    editElementClass.value = element.className || '';
    editElementContent.value = element.outerHTML;
    pathDisplay.textContent = "Path: " + getElementPath(element);

    const activeTabButton = devToolTabs.querySelector('button.active');
    if (activeTabButton && activeTabButton.dataset.panel !== 'consolePanel') {
      devToolTabs.querySelector('[data-panel="consolePanel"]').click();
      updateConsoleLogUI('info', [`--- Element Info ---`]);
      updateConsoleLogUI('info', [`  Tag: ${element.tagName.toLowerCase()}`]);
      if (element.id) updateConsoleLogUI('info', [`  ID: #${element.id}`]);
      if (element.className) updateConsoleLogUI('info', [`  Class: .${element.className.split(' ').join('.')}`]);
      const computedStyles = window.getComputedStyle(element);
      updateConsoleLogUI('info', [`  Display: ${computedStyles.display}, Position: ${computedStyles.position}`]);
      updateConsoleLogUI('info', [`  Size: ${computedStyles.width}x${computedStyles.height}`]);
      updateConsoleLogUI('info', [`  Font: ${computedStyles.fontSize} ${computedStyles.fontFamily}`]);
      updateConsoleLogUI('info', [`  Color: ${computedStyles.color}, Background: ${computedStyles.backgroundColor}`]);
      devToolTabs.querySelector('[data-panel="elementsPanel"]').click();
    } else {
      updateConsoleLogUI('info', [`--- Element Info ---`]);
      updateConsoleLogUI('info', [`  Tag: ${element.tagName.toLowerCase()}`]);
      if (element.id) updateConsoleLogUI('info', [`  ID: #${element.id}`]);
      if (element.className) updateConsoleLogUI('info', [`  Class: .${element.className.split(' ').join('.')}`]);
      const computedStyles = window.getComputedStyle(element);
      updateConsoleLogUI('info', [`  Display: ${computedStyles.display}, Position: ${computedStyles.position}`]);
      updateConsoleLogUI('info', [`  Size: ${computedStyles.width}x${computedStyles.height}`]);
      updateConsoleLogUI('info', [`  Font: ${computedStyles.fontSize} ${computedStyles.fontFamily}`]);
      updateConsoleLogUI('info', [`  Color: ${computedStyles.color}, Background: ${computedStyles.backgroundColor}`]);
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  inspectElementBtn.onclick = () => {
    isInspectMode = !isInspectMode;
    inspectElementBtn.textContent = isInspectMode ? "Stop Inspect" : "Inspect";
    if (isInspectMode) {
      document.body.addEventListener("mouseover", highlightElement);
      document.body.addEventListener("click", captureElement, true);
      updateConsoleLogUI('log', ["Inspect mode active. Click an element to select."]);
      document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    } else {
      document.body.removeEventListener("mouseover", highlightElement);
      document.body.removeEventListener("click", captureElement, true);
      if (!currentInspectedElement) {
        document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
      }
      updateConsoleLogUI('log', ["Inspect mode deactivated."]);
    }
  };

  const highlightElement = (event) => {
    if (devToolBox.contains(event.target)) {
      document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
      return;
    }
    document.querySelectorAll(".highlight-inspect").forEach(el => {
      if (el !== currentInspectedElement) el.classList.remove("highlight-inspect");
    });
    if (event.target && event.target !== currentInspectedElement) {
      event.target.classList.add("highlight-inspect");
    }
  };

  const captureElement = (event) => {
    if (devToolBox.contains(event.target) && event.target !== inspectElementBtn) return;
    event.preventDefault();
    event.stopPropagation();
    const targetElement = event.target;
    selectAndDisplayElement(targetElement);
    isInspectMode = false;
    inspectElementBtn.textContent = "Inspect";
    document.body.removeEventListener("mouseover", highlightElement);
    document.body.removeEventListener("click", captureElement, true);
  };

  applyElementChangesBtn.onclick = () => {
    if (!currentInspectedElement) {
      updateConsoleLogUI('warn', ["No element selected to apply changes to."]);
      return;
    }
    const newId = editElementId.value;
    const newClass = editElementClass.value;
    const newContent = editElementContent.value;
    try {
      let changesMade = false;
      if (currentInspectedElement.id !== newId) {
        currentInspectedElement.id = newId;
        updateConsoleLogUI('log', [`Updated ID to: "${newId}"`]);
        changesMade = true;
      }
      if (currentInspectedElement.className !== newClass) {
        currentInspectedElement.className = newClass;
        updateConsoleLogUI('log', [`Updated Class to: "${newClass}"`]);
        changesMade = true;
      }
      if (currentInspectedElement.outerHTML !== newContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;
        if (tempDiv.childElementCount === 1) {
          const newElement = tempDiv.firstElementChild;
          if (currentInspectedElement.parentNode) {
            currentInspectedElement.parentNode.replaceChild(newElement, currentInspectedElement);
            currentInspectedElement = newElement;
            updateConsoleLogUI('log', [`Updated element's outerHTML.`]);
            changesMade = true;
          } else {
            updateConsoleLogUI('error', ["Cannot update outerHTML: Element has no parent."]);
          }
        } else if (tempDiv.childElementCount === 0 && currentInspectedElement.outerHTML !== newContent) {
          currentInspectedElement.innerHTML = '';
          updateConsoleLogUI('log', [`Cleared element's innerHTML.`]);
          changesMade = true;
        } else {
          currentInspectedElement.innerHTML = newContent;
          updateConsoleLogUI('log', [`Updated element's innerHTML.`]);
          changesMade = true;
        }
    }
      if (changesMade) {
        selectAndDisplayElement(currentInspectedElement);
        updateConsoleLogUI('log', ["Element changes applied successfully."]);
      } else {
        updateConsoleLogUI('info', ["No changes detected to apply."]);
      }
    } catch (e) {
      updateConsoleLogUI('error', [`Failed to apply changes: ${e.message}`]);
    }
  };

  removeElementBtn.onclick = () => {
    if (!currentInspectedElement) {
      updateConsoleLogUI('warn', ["No element selected to remove."]);
      return;
    }
    if (currentInspectedElement.parentNode) {
      const removedTag = currentInspectedElement.tagName.toLowerCase();
      currentInspectedElement.parentNode.removeChild(currentInspectedElement);
      updateConsoleLogUI('log', [`Removed element: <${removedTag}>`]);
      selectedElementPanel.style.display = 'none';
      currentInspectedElement = null;
      pathDisplay.textContent = "Path: (none)";
      document.querySelectorAll(".highlight-inspect").forEach(el => el.classList.remove("highlight-inspect"));
    } else {
      updateConsoleLogUI('error', ["Cannot remove element: No parent found."]);
    }
  };

  duplicateElementBtn.onclick = () => {
    if (!currentInspectedElement) {
      updateConsoleLogUI('warn', ["No element selected to duplicate."]);
      return;
    }
    if (currentInspectedElement.parentNode) {
      const clonedElement = currentInspectedElement.cloneNode(true);
      currentInspectedElement.parentNode.insertBefore(clonedElement, currentInspectedElement.nextSibling);
      updateConsoleLogUI('log', [`Duplicated element: <${currentInspectedElement.tagName.toLowerCase()}>`]);
      selectAndDisplayElement(clonedElement);
    } else {
      updateConsoleLogUI('error', ["Cannot duplicate element: No parent found."]);
    }
  };

  selectParentBtn.onclick = () => {
    if (currentInspectedElement && currentInspectedElement.parentElement) {
      selectAndDisplayElement(currentInspectedElement.parentElement);
    } else {
      updateConsoleLogUI('info', ["No parent element."]);
    }
  };

  selectFirstChildBtn.onclick = () => {
    if (currentInspectedElement && currentInspectedElement.firstElementChild) {
      selectAndDisplayElement(currentInspectedElement.firstElementChild);
    } else {
      updateConsoleLogUI('info', ["No child elements."]);
    }
  };

  selectNextSiblingBtn.onclick = () => {
    if (currentInspectedElement && currentInspectedElement.nextElementSibling) {
      selectAndDisplayElement(currentInspectedElement.nextElementSibling);
    } else {
      updateConsoleLogUI('info', ["No next sibling element."]);
    }
  };

  devToolBox.querySelector('[data-panel="consolePanel"]').click();
})();
