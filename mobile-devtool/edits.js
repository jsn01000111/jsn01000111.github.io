javascript:(function() {
    // Prevent multiple injections of this editor
    if (window.__cleanDevEditor) {
        window.__cleanDevEditor.remove();
        document.body.contentEditable = 'false';
        console.log('Clean Dev Editor closed.');
        delete window.__cleanDevEditor;
        return;
    }

    // --- Create Main Editor Container ---
    let editorContainer = document.createElement('div');
    editorContainer.id = '__cleanDevEditorContainer';
    editorContainer.innerHTML = `
        <div class="__editor-header">
            <span>Dev Editor</span>
            <button id="__editorCloseBtn">X</button>
        </div>
        <div class="__editor-tabs">
            <button class="__tab-btn active" data-tab="css">CSS</button>
            <button class="__tab-btn" data-tab="html">HTML</button>
            <button class="__tab-btn" data-tab="js">JS Console</button>
        </div>
        <div class="__editor-content">
            <textarea id="__cssEditor" class="__editor-pane active" placeholder="Write CSS here..."></textarea>
            <textarea id="__htmlEditor" class="__editor-pane" placeholder="Edit HTML here..."></textarea>
            <div id="__jsConsole" class="__editor-pane">
                <textarea id="__jsInput" placeholder="Enter JavaScript code..."></textarea>
                <button id="__runJsBtn">Run Code</button>
                <div id="__jsOutput">Output appears in browser console.</div>
            </div>
        </div>
        <div class="__editor-footer">
            <button id="__applyChangesBtn">Apply CSS/HTML</button>
            <button id="__toggleContentEditableBtn">Toggle Page Edit</button>
        </div>
    `;
    document.body.appendChild(editorContainer);

    // --- Inject Styling for Your Editor UI ---
    let editorStyle = document.createElement('style');
    editorStyle.id = '__cleanDevEditorStyles';
    editorStyle.innerHTML = `
        #__cleanDevEditorContainer {
            all: initial; /* Reset all styles for this container */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            position: fixed;
            bottom: 15px;
            right: 15px;
            width: 450px; /* Slightly larger */
            height: 380px; /* Slightly larger */
            background-color: #f0f0f0; /* Light background */
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both;
            min-width: 300px;
            min-height: 250px;
        }
        #__cleanDevEditorContainer * {
            box-sizing: border-box;
        }
        /* Allow text selection specifically for input fields and textareas */
        #__cleanDevEditorContainer textarea,
        #__cleanDevEditorContainer input[type="text"],
        #__cleanDevEditorContainer # __jsOutput {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        .__editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #e0e0e0; /* Lighter header */
            color: #333;
            font-weight: 600;
            font-size: 1em;
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
            line-height: 1; /* Better vertical alignment */
        }
        #__editorCloseBtn:hover {
            color: #333;
        }
        .__editor-tabs {
            display: flex;
            background-color: #f8f8f8; /* Very light tabs background */
            border-bottom: 1px solid #ddd;
        }
        .__tab-btn {
            flex-grow: 1;
            padding: 10px 0;
            background-color: transparent;
            border: none;
            color: #555;
            font-size: 0.9em;
            cursor: pointer;
            outline: none;
            transition: color 0.2s ease, background-color 0.2s ease;
            position: relative;
        }
        .__tab-btn.active {
            color: #007bff; /* Primary blue accent */
            font-weight: 600;
        }
        .__tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #007bff; /* Underline for active tab */
        }
        .__tab-btn:hover:not(.active) {
            color: #333;
            background-color: #f0f0f0;
        }
        .__editor-content {
            flex-grow: 1;
            display: flex;
            position: relative;
            overflow: hidden;
            background-color: #ffffff; /* White content background */
        }
        .__editor-pane {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            color: #333; /* Standard text color */
            border: none;
            padding: 10px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; /* DevTools-like font */
            font-size: 13px;
            line-height: 1.5;
            resize: none;
            outline: none;
            display: none;
            caret-color: #007bff; /* Blue cursor */
            white-space: pre-wrap; /* Preserve whitespace and wrap text */
            word-wrap: break-word; /* Break long words */
        }
        .__editor-pane.active {
            display: block;
        }

        /* Specific styles for JS Console */
        #__jsConsole {
            display: flex;
            flex-direction: column;
            padding: 10px;
        }
        #__jsInput {
            flex-grow: 1;
            background-color: #f8f8f8; /* Lighter input background */
            color: #333;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 8px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 12px;
            resize: vertical;
            min-height: 60px; /* Slightly taller input */
            max-height: 60%;
        }
        #__runJsBtn {
            background-color: #007bff; /* Primary blue button */
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.2s ease;
            margin-bottom: 8px;
        }
        #__runJsBtn:hover {
            background-color: #0056b3;
        }
        #__jsOutput {
            background-color: #f8f8f8;
            color: #333;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 12px;
            min-height: 40px; /* Slightly taller output */
            overflow: auto;
            word-break: break-all;
        }

        .__editor-footer {
            display: flex;
            justify-content: space-around;
            padding: 10px;
            border-top: 1px solid #ccc;
            background-color: #e0e0e0;
        }
        .__editor-footer button {
            background-color: #6c757d; /* Gray for utility buttons */
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            transition: background-color 0.2s ease;
        }
        .__editor-footer button:hover {
            background-color: #5a6268;
        }
        #__applyChangesBtn {
            background-color: #28a745; /* Green for apply changes */
        }
        #__applyChangesBtn:hover {
            background-color: #218838;
        }
    `;
    document.head.appendChild(editorStyle);

    // --- Get Elements and Add Event Listeners ---
    const cssEditor = document.getElementById('__cssEditor');
    const htmlEditor = document.getElementById('__htmlEditor');
    const jsInput = document.getElementById('__jsInput');
    const runJsBtn = document.getElementById('__runJsBtn');
    const jsOutputDiv = document.getElementById('__jsOutput'); // Added for output indication

    const applyChangesBtn = document.getElementById('__applyChangesBtn');
    const toggleContentEditableBtn = document.getElementById('__toggleContentEditableBtn');
    const editorCloseBtn = document.getElementById('__editorCloseBtn');
    const tabButtons = document.querySelectorAll('.__tab-btn');
    const editorPanes = document.querySelectorAll('.__editor-pane');

    // Create/get user CSS style element
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

    // Apply HTML changes
    applyChangesBtn.addEventListener('click', function() {
        // Always apply CSS when apply changes button is clicked, useful for live updates
        userStyleEl.textContent = cssEditor.value;

        const activeTab = document.querySelector('.__tab-btn.active').dataset.tab;
        if (activeTab === 'html') {
            const targetId = prompt('Enter ID of element to update (leave blank to update the entire <body> content):');
            if (targetId) {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.innerHTML = htmlEditor.value;
                    console.log(`Updated HTML of #${targetId}`);
                } else {
                    alert(`Element with ID '${targetId}' not found.`);
                    console.warn(`Element with ID '${targetId}' not found.`);
                }
            } else {
                if (confirm('Are you sure you want to replace the entire <body> content? This can break the page layout and functionality!')) {
                    document.body.innerHTML = htmlEditor.value;
                    console.log('Entire <body> HTML replaced.');
                }
            }
        }
        console.log('Applying changes...');
    });

    // Run JavaScript code
    runJsBtn.addEventListener('click', function() {
        const code = jsInput.value;
        try {
            // Eval in the global scope (window)
            // Using a Function constructor is generally safer than direct eval for user-provided code
            // as it executes in a new scope, preventing local variable clashes.
            const scriptFunction = new Function(code);
            const result = scriptFunction.call(window);
            console.log('JS Output:', result); // Output to native browser console
            jsOutputDiv.textContent = `JS Output (Check browser console for details): ${String(result)}`;
            jsInput.value = ''; // Clear input after running
        } catch (e) {
            console.error('JS Error:', e); // Output errors to native browser console
            jsOutputDiv.textContent = `JS Error: ${e.message} (Check browser console for details)`;
        }
    });

    // Toggle contentEditable (HTML editing)
    let isContentEditable = false;
    toggleContentEditableBtn.addEventListener('click', function() {
        isContentEditable = !isContentEditable;
        document.body.contentEditable = isContentEditable ? 'true' : 'false';
        // For mobile browsers, webkitUserModify can be useful
        document.body.style.webkitUserModify = isContentEditable ? 'read-write' : 'initial';
        toggleContentEditableBtn.textContent = isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
        console.log('Page content editable:', isContentEditable);
    });

    // Close Editor
    editorCloseBtn.addEventListener('click', function() {
        editorContainer.remove();
        // Also remove the injected style element and user CSS element
        const editorStyles = document.getElementById('__cleanDevEditorStyles');
        if (editorStyles) editorStyles.remove();
        const userCSS = document.getElementById('__userCSS');
        if (userCSS) userCSS.remove();

        document.body.contentEditable = 'false';
        delete window.__cleanDevEditorContainer;
        delete window.__cleanDevEditor;
        console.log('Clean Dev Editor closed.');
    });

    // Tab switching logic
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            editorPanes.forEach(pane => pane.classList.remove('active'));
            // Special handling for JS Console (it's a div, others are textareas)
            if (targetTab === 'js') {
                document.getElementById('__jsConsole').classList.add('active');
            } else {
                document.getElementById('__'+ targetTab +'Editor').classList.add('active');
            }
        });
    });

    // Make editor draggable (basic implementation)
    let isDragging = false;
    let offsetX, offsetY;

    editorContainer.addEventListener('mousedown', function(e) {
        // Only allow dragging from the header or areas without interactive elements
        if (e.target === editorContainer || e.target.classList.contains('__editor-header') || e.target.tagName === 'SPAN') {
            isDragging = true;
            offsetX = e.clientX - editorContainer.getBoundingClientRect().left;
            offsetY = e.clientY - editorContainer.getBoundingClientRect().top;
            editorContainer.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection during drag
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        // Ensure the editor stays within the viewport during drag
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        editorContainer.style.left = `${newLeft}px`;
        editorContainer.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        editorContainer.style.cursor = 'grab';
    });

    // Store a reference to the editor for removal
    window.__cleanDevEditor = editorContainer;
    console.log('Clean Dev Editor loaded. Page is NOT editable by default. Use "Toggle Page Edit" button.');
})();
