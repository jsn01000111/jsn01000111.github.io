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

    // --- Inject Styling for Your Editor UI ---
    let editorStyle = document.createElement('style');
    editorStyle.id = '__advancedEditorStyles';
    editorStyle.innerHTML = `
        #__advancedEditorContainer {
            all: initial; /* Reset all styles for this container */
            font-family: -apple-system, BlinkMacMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            position: fixed;
            bottom: 10px; /* Adjust position as desired */
            right: 10px;
            width: 320px; /* Responsive width */
            height: 280px; /* Responsive height */
            background-color: #2e3436; /* Dark background */
            border: 1px solid #4d4d4d; /* Border color */
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden; /* For rounded corners */
            resize: both; /* Allow manual resizing */
            min-width: 200px;
            min-height: 150px;
        }
        #__advancedEditorContainer * {
            box-sizing: border-box; /* Crucial */
        }
        .__editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background-color: #3e4446; /* Slightly lighter header */
            color: #e0e0e0;
            font-weight: bold;
            cursor: grab; /* Indicate draggable */
        }
        #__editorCloseBtn {
            background: none;
            border: none;
            color: #e0e0e0;
            font-size: 1.2em;
            cursor: pointer;
        }
        .__editor-tabs {
            display: flex;
            border-bottom: 1px solid #4d4d4d;
            background-color: #222; /* Darker tabs background */
        }
        .__tab-btn {
            flex-grow: 1;
            padding: 8px 0;
            background-color: transparent;
            border: none;
            color: #999;
            font-size: 0.9em;
            cursor: pointer;
            outline: none;
            transition: color 0.2s ease, background-color 0.2s ease;
        }
        .__tab-btn.active {
            color: #007bff; /* Accent blue */
            border-bottom: 2px solid #007bff;
            font-weight: bold;
        }
        .__tab-btn:hover:not(.active) {
            color: #ccc;
            background-color: #333;
        }
        .__editor-content {
            flex-grow: 1;
            display: flex; /* Use flex to manage panes */
            position: relative; /* For absolute positioning of panes */
            overflow: hidden;
        }
        .__editor-pane {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #1a1a1a; /* Editor background */
            color: #0f0; /* Green for code */
            border: none;
            padding: 10px;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.4;
            resize: none;
            outline: none;
            display: none; /* Hidden by default */
        }
        .__editor-pane.active {
            display: block; /* Show active pane */
        }
        .__editor-footer {
            display: flex;
            justify-content: space-around;
            padding: 8px;
            border-top: 1px solid #4d4d4d;
            background-color: #3e4446;
        }
        .__editor-footer button {
            background-color: #007bff; /* Accent blue */
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
            transition: background-color 0.2s ease;
        }
        .__editor-footer button:hover {
            background-color: #0056b3;
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
        // APPLY CSS (already handled by input listener, but can force a refresh)
        userStyleEl.textContent = cssEditor.value;

        // APPLY HTML: You need to define how you want to apply HTML changes.
        // Option 1: Replace innerHTML of a specific element (safest for targeted edits)
        // Example:
        // const targetId = prompt('Enter ID of element to update with HTML:');
        // if (targetId) {
        //     const targetEl = document.getElementById(targetId);
        //     if (targetEl) {
        //         targetEl.innerHTML = htmlEditor.value;
        //         console.log(`Updated HTML of #${targetId}`);
        //     } else {
        //         console.warn(`Element with ID #${targetId} not found.`);
        //     }
        // }
        
        // Option 2 (DANGEROUS if not careful): Append to body.
        // document.body.insertAdjacentHTML('beforeend', htmlEditor.value);
        // console.log('Appended HTML to body.');

        console.log('Applying changes...'); // Will go to browser's native console if no Eruda
    });

    // Toggle contentEditable (HTML editing)
    let isContentEditable = false;
    toggleContentEditableBtn.addEventListener('click', function() {
        isContentEditable = !isContentEditable;
        document.body.contentEditable = isContentEditable ? 'true' : 'false';
        document.body.style.webkitUserModify = isContentEditable ? 'read-write' : 'initial'; // For mobile browsers
        toggleContentEditableBtn.textContent = isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
        alert('Page content editable: ' + isContentEditable); // Will go to browser's native alert
    });

    // Close Editor
    editorCloseBtn.addEventListener('click', function() {
        editorContainer.remove();
        document.body.contentEditable = 'false';
        delete window.__advancedEditorContainer;
        delete window.__advancedCssJsEditor;
        alert('Editor closed.'); // Will go to browser's native alert
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
    alert('Advanced Editor loaded. Page is NOT editable by default. Use "Toggle Page Edit" button.'); // Will go to browser's native alert
})();
