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
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%); /* Center it initially */
            width: 90vw; /* Use viewport width */
            max-width: 500px; /* Max width for larger screens */
            height: 70vh; /* Use viewport height */
            max-height: 500px; /* Max height for larger screens */

            background-color: #f0f0f0; /* Light background */
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both; /* Allow manual resizing */
            min-width: 280px; /* Ensure it's usable on very small screens */
            min-height: 200px;
        }
        @media (min-width: 768px) {
            #__cleanDevEditorContainer {
                width: 450px; /* Fixed width for larger screens */
                height: 380px; /* Fixed height for larger screens */
            }
        }

        #__cleanDevEditorContainer * {
            box-sizing: border-box;
            /* Crucial fix: Ensure user-select is auto by default for everything inside */
            -webkit-user-select: auto;
            -moz-user-select: auto;
            -ms-user-select: auto;
            user-select: auto;
            /* Ensure pointer events are not blocked by default */
            pointer-events: auto;
        }
        
        /* Explicitly allow text input/selection for all relevant text areas and output */
        #__cssEditor,
        #__htmlEditor,
        #__jsInput,
        #__jsOutput {
            -webkit-user-select: text; /* Allow text selection */
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
            pointer-events: auto; /* Ensure they are clickable/typable */
        }

        .__editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #e0e0e0;
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
            line-height: 1;
        }
        #__editorCloseBtn:hover {
            color: #333;
        }
        .__editor-tabs {
            display: flex;
            background-color: #f8f8f8;
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
            color: #007bff;
            font-weight: 600;
        }
        .__tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #007bff;
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
            background-color: #ffffff;
        }
        .__editor-pane {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            color: #333;
            border: none;
            padding: 10px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 13px;
            line-height: 1.5;
            resize: none;
            outline: none;
            display: none;
            caret-color: #007bff;
            white-space: pre-wrap;
            word-wrap: break-word;
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
            background-color: #f8f8f8;
            color: #333;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 8px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 12px;
            resize: vertical;
            min-height: 60px;
            max-height: 60%;
        }
        #__runJsBtn {
            background-color: #007bff;
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
            min-height: 40px;
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
            background-color: #6c757d;
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
            background-color: #28a745;
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
    const jsOutputDiv = document.getElementById('__jsOutput');

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
            const scriptFunction = new Function(code);
            const result = scriptFunction.call(window);
            console.log('JS Output:', result);
            jsOutputDiv.textContent = `JS Output (Check browser console for details): ${String(result)}`;
            jsInput.value = '';
        } catch (e) {
            console.error('JS Error:', e);
            jsOutputDiv.textContent = `JS Error: ${e.message} (Check browser console for details)`;
        }
    });

    // Toggle contentEditable (HTML editing)
    let isContentEditable = false;
    toggleContentEditableBtn.addEventListener('click', function() {
        isContentEditable = !isContentEditable;
        document.body.contentEditable = isContentEditable ? 'true' : 'false';
        document.body.style.webkitUserModify = isContentEditable ? 'read-write' : 'initial';
        toggleContentEditableBtn.textContent = isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
        console.log('Page content editable:', isContentEditable);
    });

    // Close Editor
    editorCloseBtn.addEventListener('click', function() {
        editorContainer.remove();
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
            if (targetTab === 'js') {
                document.getElementById('__jsConsole').classList.add('active');
            } else {
                document.getElementById('__'+ targetTab +'Editor').classList.add('active');
            }
        });
    });

    // Make editor draggable (robust implementation)
    let isDragging = false;
    let offsetX, offsetY;
    let editorRect;

    editorContainer.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('__editor-header') || e.target.tagName === 'SPAN') {
            isDragging = true;
            editorRect = editorContainer.getBoundingClientRect();
            offsetX = e.clientX - editorRect.left;
            offsetY = e.clientY - editorRect.top;
            editorContainer.style.cursor = 'grabbing';

            if (editorContainer.setPointerCapture) {
                editorContainer.setPointerCapture(e.pointerId);
            }
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        newLeft = Math.max(0, Math.min(newLeft, viewportWidth - editorRect.width));
        newTop = Math.max(0, Math.min(newTop, viewportHeight - editorRect.height));

        editorContainer.style.left = `${newLeft}px`;
        editorContainer.style.top = `${newTop}px`;
        editorContainer.style.transform = 'none'; // Remove initial centering transform after drag starts
    });

    document.addEventListener('mouseup', function(e) {
        if (isDragging) {
            isDragging = false;
            editorContainer.style.cursor = 'grab';
            if (editorContainer.releasePointerCapture) {
                editorContainer.releasePointerCapture(e.pointerId);
            }
        }
    });

    window.__cleanDevEditor = editorContainer;
    console.log('Clean Dev Editor loaded. Page is NOT editable by default. Use "Toggle Page Edit" button.');
})();
