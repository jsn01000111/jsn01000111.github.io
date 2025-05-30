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
            <textarea id="__htmlEditor" class="__editor-pane" placeholder="Edit HTML here (changes apply on 'Apply Changes')..."></textarea>
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
            font-family: Arial, sans-serif; /* Simpler font */
            position: fixed;
            bottom: 15px;
            right: 15px;
            width: 380px; /* Adjusted size */
            height: 320px;
            background-color: #333; /* Darker, sleek background */
            border: 1px solid #555;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both;
            min-width: 250px;
            min-height: 200px;
        }
        #__cleanDevEditorContainer * {
            box-sizing: border-box;
            -webkit-user-select: none; /* Prevent selection of UI text */
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        #__cleanDevEditorContainer textarea {
            -webkit-user-select: text; /* Allow selection in textareas */
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        .__editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background-color: #444; /* Header background */
            color: #eee;
            font-weight: bold;
            font-size: 1.1em;
            cursor: grab;
        }
        #__editorCloseBtn {
            background: none;
            border: none;
            color: #eee;
            font-size: 1.2em;
            cursor: pointer;
            padding: 0 5px;
        }
        #__editorCloseBtn:hover {
            color: #fff;
        }
        .__editor-tabs {
            display: flex;
            background-color: #222; /* Tabs background */
            border-bottom: 1px solid #555;
        }
        .__tab-btn {
            flex-grow: 1;
            padding: 10px 0;
            background-color: transparent;
            border: none;
            color: #bbb;
            font-size: 0.9em;
            cursor: pointer;
            outline: none;
            transition: color 0.2s ease, background-color 0.2s ease;
        }
        .__tab-btn.active {
            color: #00bcd4; /* Cyan accent */
            border-bottom: 2px solid #00bcd4;
            font-weight: bold;
        }
        .__tab-btn:hover:not(.active) {
            color: #fff;
            background-color: #383838;
        }
        .__editor-content {
            flex-grow: 1;
            display: flex;
            position: relative;
            overflow: hidden;
            background-color: #1a1a1a; /* Default content background */
        }
        .__editor-pane {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #1a1a1a;
            color: #0f0; /* Green text for code */
            border: none;
            padding: 10px;
            font-family: 'Cascadia Code', 'Fira Code', 'monospace', monospace; /* Modern monospace fonts */
            font-size: 14px;
            line-height: 1.4;
            resize: none;
            outline: none;
            display: none;
            caret-color: #00bcd4; /* Cyan cursor */
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
            background-color: #282c34; /* Darker input background */
            color: #a9b7c6; /* Lighter text */
            border: 1px solid #3a3f47;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 8px;
            font-family: 'Cascadia Code', 'Fira Code', 'monospace', monospace;
            font-size: 13px;
            resize: vertical;
            min-height: 50px;
            max-height: 70%;
        }
        #__runJsBtn {
            background-color: #00bcd4; /* Cyan button */
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
            background-color: #008f9e;
        }
        #__jsOutput {
            background-color: #282c34;
            color: #a9b7c6;
            border: 1px solid #3a3f47;
            border-radius: 4px;
            padding: 8px;
            font-family: 'Cascadia Code', 'Fira Code', 'monospace', monospace;
            font-size: 12px;
            min-height: 30px;
            overflow: auto;
            word-break: break-all;
        }

        .__editor-footer {
            display: flex;
            justify-content: space-around;
            padding: 8px;
            border-top: 1px solid #555;
            background-color: #444;
        }
        .__editor-footer button {
            background-color: #00bcd4; /* Cyan accent */
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
            transition: background-color 0.2s ease;
        }
        .__editor-footer button:hover {
            background-color: #008f9e;
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
        userStyleEl.textContent = cssEditor.value; // Re-apply CSS just in case

        const activeTab = document.querySelector('.__tab-btn.active').dataset.tab;
        if (activeTab === 'html') {
            // For HTML, you need to decide how changes are applied.
            // Option 1: Replace body's innerHTML (most impact, can break scripts)
            // document.body.innerHTML = htmlEditor.value;
            // console.log('HTML of body updated.');

            // Option 2: More targeted approach (safer, but requires selecting an element)
            // For simplicity in this bookmarklet, we'll offer a prompt to update an element by ID.
            const targetId = prompt('Enter ID of element to update (leave blank for entire body):');
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
                // If no ID, confirm changing body (DANGEROUS)
                if (confirm('Are you sure you want to replace the entire <body> content? This can break the page!')) {
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
            const result = window.eval(code);
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
        document.body.style.webkitUserModify = isContentEditable ? 'read-write' : 'initial'; // For mobile browsers
        toggleContentEditableBtn.textContent = isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
        console.log('Page content editable:', isContentEditable);
    });

    // Close Editor
    editorCloseBtn.addEventListener('click', function() {
        editorContainer.remove();
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
        editorContainer.style.left = (e.clientX - offsetX) + 'px';
        editorContainer.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        editorContainer.style.cursor = 'grab';
    });

    // Store a reference to the editor for removal
    window.__cleanDevEditor = editorContainer;
    console.log('Clean Dev Editor loaded. Page is NOT editable by default. Use "Toggle Page Edit" button.');
})();
