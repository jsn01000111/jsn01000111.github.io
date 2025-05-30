javascript:(function() {
    // Prevent multiple injections of *your* editor
    if (window.__advancedCssJsEditor) {
        window.__advancedCssJsEditor.remove(); // Removes the UI
        document.body.contentEditable = 'false'; // Disable page editing
        delete window.__advancedCssJsEditor;
        alert('Editor closed');
        return;
    }

    // --- Create Main Editor Container ---
    let editorContainer = document.createElement('div');
    editorContainer.id = '__advancedEditorContainer';
    editorContainer.innerHTML = `
        <div class="__editor-header">
            <span>Code Editor</span>
            <button id="__editorCloseBtn">X</button>
        </div>
        <div class="__editor-tabs">
            <button class="__tab-btn active" data-tab="css">CSS</button>
            <button class="__tab-btn" data-tab="html">HTML</button>
        </div>
        <div class="__editor-content">
            <textarea id="__cssEditor" class="__editor-pane active" placeholder="Write CSS here..."></textarea>
            <textarea id="__htmlEditor" class="__editor-pane" placeholder="Edit HTML here (use selectors to target sections)..."></textarea>
        </div>
        <div class="__editor-footer">
            <button id="__applyChangesBtn">Apply CSS/HTML</button>
            <button id="__toggleContentEditableBtn">Toggle Page Edit</button>
            </div>
    `;
    document.body.appendChild(editorContainer);

    // --- Inject Styling for Your Editor UI (Custom, no Eruda influence) ---
    let editorStyle = document.createElement('style');
    editorStyle.id = '__advancedEditorStyles';
    editorStyle.innerHTML = `
        #__advancedEditorContainer {
            all: initial; /* Reset all styles for this container */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 300px;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both;
            min-width: 250px;
            min-height: 200px;
        }
        #__advancedEditorContainer * {
            box-sizing: border-box;
        }
        .__editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #e0e0e0;
            color: #333;
            font-weight: bold;
            font-size: 1.1em;
            cursor: grab;
            border-bottom: 1px solid #ccc;
        }
        #__editorCloseBtn {
            background: none;
            border: none;
            color: #666;
            font-size: 1.3em;
            cursor: pointer;
            padding: 0 5px;
            transition: color 0.2s ease;
        }
        #__editorCloseBtn:hover {
            color: #000;
        }
        .__editor-tabs {
            display: flex;
            border-bottom: 1px solid #ddd;
            background-color: #f0f0f0;
        }
        .__tab-btn {
            flex-grow: 1;
            padding: 10px 0;
            background-color: transparent;
            border: none;
            color: #777;
            font-size: 0.95em;
            cursor: pointer;
            outline: none;
            transition: color 0.2s ease, background-color 0.2s ease;
        }
        .__tab-btn.active {
            color: #1a73e8;
            border-bottom: 2px solid #1a73e8;
            font-weight: bold;
            background-color: #fff;
        }
        .__tab-btn:hover:not(.active) {
            color: #555;
            background-color: #e5e5e5;
        }
        .__editor-content {
            flex-grow: 1;
            display: flex;
            position: relative;
            overflow: hidden;
            border-top: 1px solid #eee;
        }
        .__editor-pane {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            color: #000;
            border: none;
            padding: 15px;
            font-family: Consolas, 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            resize: none;
            outline: none;
            display: none;
            caret-color: #1a73e8;
        }
        .__editor-pane.active {
            display: block;
        }
        .__editor-footer {
            display: flex;
            justify-content: space-around; /* Changed from space-between to space-around for balanced buttons */
            padding: 10px;
            border-top: 1px solid #ddd;
            background-color: #e0e0e0;
        }
        .__editor-footer button {
            background-color: #1a73e8;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.2s ease;
        }
        .__editor-footer button:hover {
            background-color: #155bb5;
        }
        /* Removed any specific styles for Eruda-related icons/buttons */
    `;
    document.head.appendChild(editorStyle);

    // --- Get Elements and Add Event Listeners ---
    const cssEditor = document.getElementById('__cssEditor');
    const htmlEditor = document.getElementById('__htmlEditor');
    const applyChangesBtn = document.getElementById('__applyChangesBtn');
    const toggleContentEditableBtn = document.getElementById('__toggleContentEditableBtn');
    const editorCloseBtn = document.getElementById('__editorCloseBtn');
    const tabButtons = document.querySelectorAll('.__tab-btn');
    const editorPanes = document.querySelectorAll('.__editor-pane');

    let userStyleEl = document.getElementById('__userCSS');
    if (!userStyleEl) {
        userStyleEl = document.createElement('style');
        userStyleEl.id = '__userCSS';
        document.head.appendChild(userStyleEl);
    }

    // Apply CSS live
    cssEditor.addEventListener('input', function() {
        userStyleEl.textContent = cssEditor.value;
    });

    // Apply HTML changes (more complex, consider impact)
    applyChangesBtn.addEventListener('click', function() {
        userStyleEl.textContent = cssEditor.value;
        console.log('Applying changes...');
    });

    // Toggle contentEditable (HTML editing)
    let isContentEditable = false;
    toggleContentEditableBtn.addEventListener('click', function() {
        isContentEditable = !isContentEditable;
        document.body.contentEditable = isContentEditable ? 'true' : 'false';
        document.body.style.webkitUserModify = isContentEditable ? 'read-write' : 'initial'; // For mobile browsers
        toggleContentEditableBtn.textContent = isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
        alert('Page content editable: ' + isContentEditable);
    });

    // Close Editor
    editorCloseBtn.addEventListener('click', function() {
        editorContainer.remove();
        document.body.contentEditable = 'false';
        delete window.__advancedEditorContainer;
        delete window.__advancedCssJsEditor;
        alert('Editor closed.');
    });

    // Tab switching logic
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            editorPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById('__'+ targetTab +'Editor').classList.add('active');
        });
    });

    // Make editor draggable (basic implementation)
    let isDragging = false;
    let offsetX, offsetY;

    editorContainer.addEventListener('mousedown', function(e) {
        // Ensure dragging only happens on the header or the container itself if header is not clicked
        if (e.target === editorContainer || e.target.classList.contains('__editor-header') || e.target.tagName === 'SPAN') { // Added SPAN for header text
            isDragging = true;
            offsetX = e.clientX - editorContainer.getBoundingClientRect().left;
            offsetY = e.clientY - editorContainer.getBoundingClientRect().top;
            editorContainer.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        editorContainer.style.left = (e.clientX - offsetX) + 'px';
        editorContainer.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        editorContainer.style.cursor = 'grab';
    });

    // Store a reference to the editor for removal
    window.__advancedCssJsEditor = editorContainer;
    alert('Advanced Editor loaded. Page is NOT editable by default. Use "Toggle Page Edit" button.');
})();
