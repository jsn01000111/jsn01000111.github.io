javascript:(function() {
    // Prevent multiple injections of *your* editor
    if (window.__advancedCssJsEditor) {
        window.__advancedCssJsEditor.remove(); // Removes the UI
        document.body.contentEditable = 'false'; // Disable page editing
        delete window.__advancedCssJsEditor;
        alert('Editor closed');
        return;
    }

    // --- Check for and remove Eruda if it exists ---
    if (window.eruda) {
        try {
            eruda.destroy(); // Attempt to destroy Eruda instance
            console.log('Eruda found and destroyed.');
        } catch (e) {
            console.warn('Could not destroy Eruda:', e);
            // If destroy fails, try to hide its UI elements
            const erudaContainer = document.querySelector('.eruda-container');
            if (erudaContainer) {
                erudaContainer.style.display = 'none';
                console.log('Eruda container hidden.');
            }
        }
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

    // --- Inject Styling for Your Editor UI (Custom, not Eruda-like) ---
    let editorStyle = document.createElement('style');
    editorStyle.id = '__advancedEditorStyles';
    editorStyle.innerHTML = `
        #__advancedEditorContainer {
            all: initial; /* Reset all styles for this container */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Changed font */
            position: fixed;
            bottom: 20px; /* Adjusted position */
            right: 20px;
            width: 350px; /* Slightly wider */
            height: 300px; /* Slightly taller */
            background-color: #f8f8f8; /* Light background */
            border: 1px solid #ddd; /* Lighter border color */
            border-radius: 10px; /* More rounded corners */
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Softer shadow */
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both;
            min-width: 250px;
            min-height: 200px;
        }
        #__advancedEditorContainer * {
            box-sizing: border-box; /* Crucial */
        }
        .__editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px; /* More padding */
            background-color: #e0e0e0; /* Lighter header */
            color: #333; /* Darker text */
            font-weight: bold;
            font-size: 1.1em; /* Slightly larger header text */
            cursor: grab;
            border-bottom: 1px solid #ccc; /* Subtle border */
        }
        #__editorCloseBtn {
            background: none;
            border: none;
            color: #666; /* Subtler close button */
            font-size: 1.3em;
            cursor: pointer;
            padding: 0 5px; /* Add some padding */
            transition: color 0.2s ease;
        }
        #__editorCloseBtn:hover {
            color: #000; /* Darker on hover */
        }
        .__editor-tabs {
            display: flex;
            border-bottom: 1px solid #ddd; /* Lighter border */
            background-color: #f0f0f0; /* Lighter tabs background */
        }
        .__tab-btn {
            flex-grow: 1;
            padding: 10px 0; /* More padding */
            background-color: transparent;
            border: none;
            color: #777; /* Subtler tab text */
            font-size: 0.95em; /* Slightly larger */
            cursor: pointer;
            outline: none;
            transition: color 0.2s ease, background-color 0.2s ease;
        }
        .__tab-btn.active {
            color: #1a73e8; /* Google blue accent */
            border-bottom: 2px solid #1a73e8;
            font-weight: bold;
            background-color: #fff; /* White active tab background */
        }
        .__tab-btn:hover:not(.active) {
            color: #555;
            background-color: #e5e5e5; /* Lighter hover background */
        }
        .__editor-content {
            flex-grow: 1;
            display: flex;
            position: relative;
            overflow: hidden;
            border-top: 1px solid #eee; /* Light border top */
        }
        .__editor-pane {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff; /* White editor background */
            color: #000; /* Black for code */
            border: none;
            padding: 15px; /* More padding */
            font-family: Consolas, 'Courier New', monospace; /* Changed monospace font */
            font-size: 13px; /* Slightly smaller font for code */
            line-height: 1.5;
            resize: none;
            outline: none;
            display: none;
            caret-color: #1a73e8; /* Blue cursor */
        }
        .__editor-pane.active {
            display: block;
        }
        .__editor-footer {
            display: flex;
            justify-content: space-around;
            padding: 10px; /* More padding */
            border-top: 1px solid #ddd; /* Lighter border */
            background-color: #e0e0e0; /* Lighter footer */
        }
        .__editor-footer button {
            background-color: #1a73e8; /* Google blue accent */
            color: white;
            border: none;
            padding: 8px 15px; /* Larger buttons */
            border-radius: 5px; /* More rounded buttons */
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.2s ease;
        }
        .__editor-footer button:hover {
            background-color: #155bb5; /* Darker blue on hover */
        }
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
        if (e.target === editorContainer || e.target.classList.contains('__editor-header')) {
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
