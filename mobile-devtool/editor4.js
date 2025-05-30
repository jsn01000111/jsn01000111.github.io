(function() {
    // Prevent multiple injections of this editor
    if (window.__myCleanDevEditor) {
        window.__myCleanDevEditor.remove();
        document.body.contentEditable = 'false';
        // Remove the user CSS style element if it exists
        const userStyleEl = document.getElementById('__myUserCSS');
        if (userStyleEl) {
            userStyleEl.remove();
        }
        // Remove the editor style element
        const editorStyleEl = document.getElementById('__myCleanDevEditorStyles');
        if (editorStyleEl) {
            editorStyleEl.remove();
        }
        alert('Clean Dev Editor closed.');
        delete window.__myCleanDevEditor;
        return;
    }

    // --- Create Main Editor Container ---
    let editorContainer = document.createElement('div');
    editorContainer.id = '__myCleanDevEditorContainer';
    // Set contenteditable="false" directly on the container to override body's contenteditable
    editorContainer.contentEditable = 'false';
    editorContainer.innerHTML = `
        <div class="__myeditor-header">
            <span>Dev Editor</span>
            <button id="__myeditorCloseBtn">✕</button>
        </div>
        <div class="__myeditor-tabs">
            <button class="__my-tab-btn active" data-tab="css">CSS</button>
            <button class="__my-tab-btn" data-tab="html">HTML</button>
            <button class="__my-tab-btn" data-tab="js">JS Console</button>
        </div>
        <div class="__myeditor-content">
            <textarea id="__mycssEditor" class="__myeditor-pane active" placeholder="Write CSS here..." contenteditable="true"></textarea>
            <textarea id="__myhtmlEditor" class="__myeditor-pane" placeholder="Edit HTML here (e.g., document.body.innerHTML = '...');" contenteditable="true"></textarea>
            <div id="__myjsConsolePane" class="__myeditor-pane">
                <textarea id="__myjsEditor" class="js-input" placeholder="Write JavaScript here..." contenteditable="true"></textarea>
                <textarea id="__myjsOutput" class="js-output" readonly placeholder="Console Output..." contenteditable="false"></textarea>
                <div class="js-console-buttons">
                    <button id="__myExecuteJsBtn">Execute JS</button>
                    <button id="__myClearJsBtn">Clear Console</button>
                </div>
            </div>
        </div>
        <div class="__myeditor-footer">
            <button id="__myapplyChangesBtn">Apply Changes</button>
            <button id="__mytoggleContentEditableBtn">Toggle Page Edit</button>
        </div>
    `;
    document.body.appendChild(editorContainer);

    // --- Inject Styling for Your New Editor UI (Browser Dev Tool Style) ---
    let editorStyle = document.createElement('style');
    editorStyle.id = '__myCleanDevEditorStyles';
    editorStyle.innerHTML = `
        #__myCleanDevEditorContainer {
            all: initial; /* Reset all styles for this container */
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; /* Standard system font */
            position: fixed;
            bottom: 15px;
            right: 15px;
            width: 500px; /* Wider for more content */
            height: 450px; /* Taller */
            background-color: #f5f5f5; /* Light gray background */
            border: 1px solid #ccc; /* Light border */
            border-radius: 8px; /* Slightly rounded corners */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow */
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both; /* Allow manual resizing */
            min-width: 350px;
            min-height: 300px;
            /* Added for better fixed positioning on mobile/some browsers */
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
        }
        #__myCleanDevEditorContainer * {
            box-sizing: border-box; /* Crucial */
            /* Ensure textareas within the container are always editable */
            -webkit-user-modify: read-write !important;
            user-modify: read-write !important;
        }
        /* Specific rules to ensure textareas are editable */
        #__myCleanDevEditorContainer textarea {
            -webkit-user-modify: read-write !important;
            user-modify: read-write !important;
            contenteditable: true !important; /* Ensure they are editable */
        }
        /* Ensure the output console is NOT editable */
        #__myCleanDevEditorContainer textarea[readonly] {
            -webkit-user-modify: read-only !important;
            user-modify: read-only !important;
            contenteditable: false !important;
        }


        .__myeditor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #ebebeb; /* Header slightly darker than body */
            color: #333;
            font-weight: 600;
            font-size: 1.05em;
            cursor: grab;
            border-bottom: 1px solid #e0e0e0;
        }
        #__myeditorCloseBtn {
            background: none;
            border: none;
            color: #666;
            font-size: 1.3em;
            cursor: pointer;
            line-height: 1;
            padding: 0 5px;
            transition: color 0.2s ease;
        }
        #__myeditorCloseBtn:hover {
            color: #000;
        }
        .__myeditor-tabs {
            display: flex;
            border-bottom: 1px solid #e0e0e0;
            background-color: #f0f0f0; /* Tabs background */
        }
        .__my-tab-btn {
            flex-grow: 1;
            padding: 10px 0;
            background-color: transparent;
            border: none;
            color: #666;
            font-size: 0.9em;
            cursor: pointer;
            outline: none;
            transition: color 0.2s ease, background-color 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .__my-tab-btn.active {
            color: #1a73e8; /* Google-like blue for active */
            border-bottom: 2px solid #1a73e8;
            font-weight: 600;
            background-color: #ffffff; /* White background for active tab */
        }
        .__my-tab-btn:hover:not(.active) {
            color: #444;
            background-color: #e8e8e8;
        }
        .__myeditor-content {
            flex-grow: 1;
            display: flex;
            position: relative;
            overflow: hidden;
        }
        .__myeditor-pane {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff; /* White background for text areas */
            color: #222; /* Dark text for code */
            border: none;
            padding: 15px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace; /* Standard code font */
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            outline: none;
            display: none; /* Hidden by default */
            caret-color: #1a73e8;
            box-sizing: border-box; /* Crucial for padding to be inside width/height */
        }
        .__myeditor-pane.active {
            display: block; /* Show active pane */
        }

        /* JS Console Specific Styles */
        #__myjsConsolePane {
            display: flex;
            flex-direction: column;
            padding: 0; /* Remove padding here, apply to inner textareas */
        }
        #__myjsEditor {
            flex-grow: 1;
            border-bottom: 1px solid #e0e0e0;
            padding: 10px 15px; /* Apply padding here */
        }
        #__myjsOutput {
            flex-grow: 2; /* Output takes more space */
            background-color: #222; /* Dark background for console output */
            color: #eee; /* Light text for console output */
            padding: 10px 15px; /* Apply padding here */
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            white-space: pre-wrap; /* Preserve whitespace and wrap long lines */
            word-wrap: break-word; /* Break long words */
            line-height: 1.4;
            overflow-y: auto; /* Scroll for overflow */
        }
        .js-console-buttons {
            display: flex;
            justify-content: flex-end; /* Align buttons to the right */
            padding: 8px 10px;
            background-color: #ebebeb;
            border-top: 1px solid #e0e0e0;
        }
        .js-console-buttons button {
            background-color: #1a73e8;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            transition: background-color 0.2s ease;
            margin-left: 8px; /* Space between buttons */
        }
        .js-console-buttons button:hover {
            background-color: #155bb5;
        }


        .__myeditor-footer {
            display: flex;
            justify-content: space-around;
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            background-color: #ebebeb;
        }
        .__myeditor-footer button {
            background-color: #1a73e8; /* Blue for primary actions */
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.2s ease;
            min-width: 120px; /* Consistent button width */
        }
        .__myeditor-footer button:hover {
            background-color: #155bb5;
        }
        #__mytoggleContentEditableBtn {
            background-color: #6c757d; /* Gray for secondary action */
        }
        #__mytoggleContentEditableBtn:hover {
            background-color: #5a6268;
        }
    `;
    document.head.appendChild(editorStyle);

    // --- Get Elements and Add Event Listeners ---
    const cssEditor = document.getElementById('__mycssEditor');
    const htmlEditor = document.getElementById('__myhtmlEditor');
    const jsEditor = document.getElementById('__myjsEditor'); // New
    const jsOutput = document.getElementById('__myjsOutput'); // New
    const executeJsBtn = document.getElementById('__myExecuteJsBtn'); // New
    const clearJsBtn = document.getElementById('__myClearJsBtn'); // New
    const applyChangesBtn = document.getElementById('__myapplyChangesBtn');
    const toggleContentEditableBtn = document.getElementById('__mytoggleContentEditableBtn');
    const editorCloseBtn = document.getElementById('__myeditorCloseBtn');
    const tabButtons = document.querySelectorAll('.__my-tab-btn');
    const editorPanes = document.querySelectorAll('.__myeditor-pane');

    // Create or get user CSS style element
    let userStyleEl = document.getElementById('__myUserCSS');
    if (!userStyleEl) {
        userStyleEl = document.createElement('style');
        userStyleEl.id = '__myUserCSS';
        document.head.appendChild(userStyleEl);
    }

    // Apply CSS live
    cssEditor.addEventListener('input', function() {
        userStyleEl.textContent = cssEditor.value;
    });

    // --- JS Console Logic ---
    const originalConsole = {}; // Store original console methods
    ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
        originalConsole[method] = console[method]; // Store original
        console[method] = (...args) => {
            const output = args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return arg.toString(); // Fallback for circular references or complex objects
                    }
                }
                return arg;
            }).join(' ');
            jsOutput.value += `[${method.toUpperCase()}] ${output}\n`;
            jsOutput.scrollTop = jsOutput.scrollHeight; // Auto-scroll to bottom
            originalConsole[method](...args); // Also call the original console method
        };
    });

    executeJsBtn.addEventListener('click', function() {
        const code = jsEditor.value;
        if (code.trim() === '') {
            jsOutput.value += '[INFO] No JavaScript code to execute.\n';
            return;
        }
        try {
            // Execute the code in the global scope
            const result = window.eval(code);
            jsOutput.value += `[RESULT] ${result === undefined ? 'undefined' : JSON.stringify(result, null, 2)}\n`;
        } catch (error) {
            jsOutput.value += `[ERROR] ${error.name}: ${error.message}\n`;
        }
        jsOutput.scrollTop = jsOutput.scrollHeight;
    });

    clearJsBtn.addEventListener('click', function() {
        jsOutput.value = '';
    });

    // Apply HTML changes (more complex, consider impact)
    applyChangesBtn.addEventListener('click', function() {
        // Apply CSS (already live, but ensure update)
        userStyleEl.textContent = cssEditor.value;

        // Apply HTML: This is a direct innerHTML replacement for the body.
        const htmlContent = htmlEditor.value; // Get current HTML from textarea
        if (htmlContent.trim() !== '') {
            if (confirm('WARNING: Applying HTML will replace the entire <body> content. This is destructive and may break the page. Continue?')) {
                // Temporarily store editor's state and remove it
                const editorState = {
                    css: cssEditor.value,
                    html: htmlEditor.value,
                    js: jsEditor.value, // Store JS editor content
                    jsOutput: jsOutput.value, // Store JS output content
                    isContentEditable: document.body.contentEditable === 'true',
                    left: editorContainer.style.left,
                    top: editorContainer.style.top,
                    width: editorContainer.style.width,
                    height: editorContainer.style.height,
                    activeTab: editorContainer.querySelector('.__my-tab-btn.active').dataset.tab // Store active tab
                };

                editorContainer.remove(); // Remove editor before body replacement
                userStyleEl.remove(); // Remove user CSS element too
                editorStyle.remove(); // Remove editor's own style

                document.body.innerHTML = htmlContent; // Replace entire body HTML

                // Re-append the editor after body replacement
                document.body.appendChild(editorContainer);
                document.head.appendChild(userStyleEl); // Re-append user CSS
                document.head.appendChild(editorStyle); // Re-append editor style

                // Restore editor's state and rebind events
                rebindEditorEvents(editorContainer, editorState, userStyleEl, editorStyle, originalConsole);

                originalConsole.log('HTML content applied to body. Editor re-initialized.');
            } else {
                originalConsole.log('HTML application cancelled.');
            }
        } else {
            originalConsole.warn('HTML editor is empty. No HTML changes applied.');
        }

        originalConsole.log('Changes applied (CSS and potentially HTML).');
    });

    // Function to re-bind events after HTML replacement
    function rebindEditorEvents(retainedEditorContainer, state, retainedUserStyleEl, retainedEditorStyle, originalConsoleMethods) {
        // Re-get references to elements within the now re-appended container
        const newCssEditor = retainedEditorContainer.querySelector('#__mycssEditor');
        const newHtmlEditor = retainedEditorContainer.querySelector('#__myhtmlEditor');
        const newJsEditor = retainedEditorContainer.querySelector('#__myjsEditor'); // New
        const newJsOutput = retainedEditorContainer.querySelector('#__myjsOutput'); // New
        const newExecuteJsBtn = retainedEditorContainer.querySelector('#__myExecuteJsBtn'); // New
        const newClearJsBtn = retainedEditorContainer.querySelector('#__myClearJsBtn'); // New
        const newApplyChangesBtn = retainedEditorContainer.querySelector('#__myapplyChangesBtn');
        const newToggleContentEditableBtn = retainedEditorContainer.querySelector('#__mytoggleContentEditableBtn');
        const newEditorCloseBtn = retainedEditorContainer.querySelector('#__myeditorCloseBtn');
        const newTabButtons = retainedEditorContainer.querySelectorAll('.__my-tab-btn');
        const newEditorPanes = retainedEditorContainer.querySelectorAll('.__myeditor-pane');

        // Restore console methods before output redirection
        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            console[method] = originalConsoleMethods[method];
        });

        // Restore content and state
        newCssEditor.value = state.css;
        newHtmlEditor.value = state.html;
        newJsEditor.value = state.js; // Restore JS editor content
        newJsOutput.value = state.jsOutput; // Restore JS output content
        document.body.contentEditable = state.isContentEditable ? 'true' : 'false';
        document.body.style.webkitUserModify = state.isContentEditable ? 'read-write' : 'initial';
        newToggleContentEditableBtn.textContent = state.isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';

        // Restore position and size
        retainedEditorContainer.style.left = state.left;
        retainedEditorContainer.style.top = state.top;
        retainedEditorContainer.style.width = state.width;
        retainedEditorContainer.style.height = state.height;

        // Activate the previously active tab
        newTabButtons.forEach(btn => {
            if (btn.dataset.tab === state.activeTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        newEditorPanes.forEach(pane => {
            const paneId = (pane.id === '__myjsConsolePane') ? 'js' : pane.id.replace('__my', '').replace('Editor', '');
            if (paneId === state.activeTab) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        // Re-attach listeners

        // Re-establish CSS live update
        newCssEditor.addEventListener('input', function() {
            retainedUserStyleEl.textContent = newCssEditor.value;
        });

        // Re-establish JS Console output redirection
        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            console[method] = (...args) => {
                const output = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch (e) {
                            return arg.toString();
                        }
                    }
                    return arg;
                }).join(' ');
                newJsOutput.value += `[${method.toUpperCase()}] ${output}\n`;
                newJsOutput.scrollTop = newJsOutput.scrollHeight;
                originalConsoleMethods[method](...args); // Also call the original
            };
        });

        newExecuteJsBtn.addEventListener('click', function() {
            const code = newJsEditor.value;
            if (code.trim() === '') {
                newJsOutput.value += '[INFO] No JavaScript code to execute.\n';
                return;
            }
            try {
                const result = window.eval(code);
                newJsOutput.value += `[RESULT] ${result === undefined ? 'undefined' : JSON.stringify(result, null, 2)}\n`;
            } catch (error) {
                newJsOutput.value += `[ERROR] ${error.name}: ${error.message}\n`;
            }
            newJsOutput.scrollTop = newJsOutput.scrollHeight;
        });

        newClearJsBtn.addEventListener('click', function() {
            newJsOutput.value = '';
        });

        // Re-attach main apply changes logic (only CSS, HTML is separate confirmation)
        newApplyChangesBtn.addEventListener('click', function() {
            retainedUserStyleEl.textContent = newCssEditor.value;
            originalConsoleMethods.log('CSS changes applied.');
        });


        newToggleContentEditableBtn.addEventListener('click', function() {
            state.isContentEditable = !state.isContentEditable; // Update internal state
            document.body.contentEditable = state.isContentEditable ? 'true' : 'false';
            document.body.style.webkitUserModify = state.isContentEditable ? 'read-write' : 'initial';
            newToggleContentEditableBtn.textContent = state.isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
            originalConsoleMethods.log('Page content editable: ' + state.isContentEditable);
        });

        newEditorCloseBtn.addEventListener('click', function() {
            retainedEditorContainer.remove();
            retainedUserStyleEl.remove();
            retainedEditorStyle.remove();
            document.body.contentEditable = 'false';
            delete window.__myCleanDevEditor;
            // Restore original console methods upon closing
            ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
                console[method] = originalConsoleMethods[method];
            });
            alert('Clean Dev Editor closed.');
        });

        newTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.dataset.tab;

                newTabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                newEditorPanes.forEach(pane => pane.classList.remove('active'));
                // Handle JS Console pane specifically as its ID is different
                const paneId = (targetTab === 'js') ? '__myjsConsolePane' : '__my' + targetTab + 'Editor';
                document.getElementById(paneId).classList.add('active');
            });
        });

        // Re-enable dragging for the re-appended container
        let currentIsDragging = false;
        let currentOffsetX, currentOffsetY;
        retainedEditorContainer.addEventListener('mousedown', function(e) {
            if (e.target === retainedEditorContainer || e.target.classList.contains('__myeditor-header')) {
                currentIsDragging = true;
                currentOffsetX = e.clientX - retainedEditorContainer.getBoundingClientRect().left;
                currentOffsetY = e.clientY - retainedEditorContainer.getBoundingClientRect().top;
                retainedEditorContainer.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (!currentIsDragging) return;
            retainedEditorContainer.style.left = (e.clientX - currentOffsetX) + 'px';
            retainedEditorContainer.style.top = (e.clientY - currentOffsetY) + 'px';
        });

        document.addEventListener('mouseup', function() {
            currentIsDragging = false;
            retainedEditorContainer.style.cursor = 'grab';
        });

        // Update the global reference to the correct container
        window.__myCleanDevEditor = retainedEditorContainer;
    }


    // Toggle contentEditable (HTML editing)
    let isContentEditable = false; // Initial state
    toggleContentEditableBtn.addEventListener('click', function() {
        isContentEditable = !isContentEditable;
        document.body.contentEditable = isContentEditable ? 'true' : 'false';
        document.body.style.webkitUserModify = isContentEditable ? 'read-write' : 'initial'; // For mobile browsers
        toggleContentEditableBtn.textContent = isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
        originalConsole.log('Page content editable: ' + isContentEditable);
    });

    // Close Editor
    editorCloseBtn.addEventListener('click', function() {
        editorContainer.remove();
        userStyleEl.remove(); // Remove user CSS element
        editorStyle.remove(); // Remove editor's own style
        document.body.contentEditable = 'false';
        delete window.__myCleanDevEditor;
        // Restore original console methods upon closing
        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            console[method] = originalConsole[method];
        });
        alert('Clean Dev Editor closed.');
    });

    // Tab switching logic
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            editorPanes.forEach(pane => pane.classList.remove('active'));
            // Handle JS Console pane specifically as its ID is different
            const paneId = (targetTab === 'js') ? '__myjsConsolePane' : '__my' + targetTab + 'Editor';
            document.getElementById(paneId).classList.add('active');
        });
    });

    // Make editor draggable (basic implementation)
    let isDragging = false;
    let offsetX, offsetY;

    editorContainer.addEventListener('mousedown', function(e) {
        // Only allow dragging from the header or the container itself, not from inside textareas/buttons
        if (e.target === editorContainer || e.target.classList.contains('__myeditor-header')) {
            isDragging = true;
            offsetX = e.clientX - editorContainer.getBoundingClientRect().left;
            offsetY = e.clientY - editorContainer.getBoundingClientRect().top;
            editorContainer.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent default browser drag behavior (e.g., text selection)
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
    window.__myCleanDevEditor = editorContainer;
    alert('Clean Dev Editor loaded. Page is NOT editable by default. Use "Toggle Page Edit" button.');
})();
