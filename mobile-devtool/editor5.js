// ==UserScript== // @name         Mobile Dev Tool (Refactored) // @namespace    https://yourdomain.example // @version      2.0 // @description  Mobile-friendly HTML/CSS/JS editor and inspector // @author       JSN01000111 // @license      CC BY-NC-SA 4.0 // ==/UserScript==

(function() { const TOOL_ID = '__myCleanDevEditorContainer'; if (document.getElementById(TOOL_ID)) return;

const TOOL_HTML = <div class="__myeditor-header"> <span style="flex:1;font-weight:bold">Dev Tool</span> <button id="__editorClose">×</button> </div> <div class="__myeditor-body"> <textarea id="__htmlEditor" placeholder="Edit HTML"></textarea> <textarea id="__cssEditor" placeholder="Edit CSS"></textarea> </div> <div class="__myeditor-footer"> <button id="__applyCSS">Apply CSS</button> <button id="__replaceHTML">Replace HTML</button> <button id="__toggleEdit">Toggle Page Edit</button> </div>;

const TOOL_CSS = #${TOOL_ID} { position: fixed; z-index: 999999; bottom: 20px; right: 20px; width: 400px; height: 300px; background: #111; color: #eee; font-family: sans-serif; box-shadow: 0 0 20px rgba(0,0,0,0.6); display: flex; flex-direction: column; border-radius: 12px; } .__myeditor-header { display: flex; align-items: center; padding: 8px; background: #222; cursor: move; } .__myeditor-header button { background: #444; color: white; border: none; padding: 6px 12px; cursor: pointer; } .__myeditor-body { flex: 1; display: flex; gap: 4px; padding: 8px; } .__myeditor-body textarea { flex: 1; background: #000; color: #0f0; border: 1px solid #333; resize: none; padding: 8px; font-family: monospace; } .__myeditor-footer { display: flex; justify-content: space-around; padding: 8px; background: #222; } .__myeditor-footer button { flex: 1; margin: 0 4px; padding: 8px; background: #28a745; color: white; border: none; cursor: pointer; } @media (max-width: 600px) { #${TOOL_ID} { width: 95vw; height: 90vh; bottom: 5vh; right: 2.5vw; } };

// Inject styles const style = document.createElement('style'); style.id = '__myeditorStyles'; style.textContent = TOOL_CSS; document.head.appendChild(style);

// Create container const container = document.createElement('div'); container.id = TOOL_ID; container.innerHTML = TOOL_HTML; document.body.appendChild(container);

// Drag handling let isDragging = false, offsetX = 0, offsetY = 0; const header = container.querySelector('.__myeditor-header');

function onPointerDown(e) { isDragging = true; offsetX = e.clientX - container.offsetLeft; offsetY = e.clientY - container.offsetTop; } function onPointerMove(e) { if (!isDragging) return; container.style.left = ${e.clientX - offsetX}px; container.style.top = ${e.clientY - offsetY}px; container.style.right = 'auto'; container.style.bottom = 'auto'; } function onPointerUp() { isDragging = false; }

header.addEventListener('mousedown', onPointerDown); header.addEventListener('touchstart', e => onPointerDown(e.touches[0]), {passive: false}); document.addEventListener('mousemove', onPointerMove); document.addEventListener('touchmove', e => onPointerMove(e.touches[0]), {passive: false}); document.addEventListener('mouseup', onPointerUp); document.addEventListener('touchend', onPointerUp);

// Logic const htmlEditor = container.querySelector('#__htmlEditor'); const cssEditor = container.querySelector('#__cssEditor'); const closeBtn = container.querySelector('#__editorClose');

closeBtn.onclick = () => container.remove();

container.querySelector('#__applyCSS').onclick = () => { let styleEl = document.getElementById('__devInjectedCSS'); if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = '__devInjectedCSS'; document.head.appendChild(styleEl); } styleEl.textContent = cssEditor.value; };

container.querySelector('#__replaceHTML').onclick = () => { const confirmReplace = confirm("Replace entire <body> content? Unsaved changes will be lost."); if (confirmReplace) { document.body.innerHTML = htmlEditor.value; } };

container.querySelector('#__toggleEdit').onclick = () => { document.body.contentEditable = document.body.isContentEditable ? "false" : "true"; alert(Page editing is now ${document.body.isContentEditable ? "enabled" : "disabled"}); }; })();

