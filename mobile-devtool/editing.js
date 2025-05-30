javascript:(function() {
    // Prevent multiple injections of this editor
    if (window.__myCleanDevEditor) {
        window.__myCleanDevEditor.remove();
        document.body.contentEditable = 'false';
        alert('Clean Dev Editor closed.');
        delete window.__myCleanDevEditor;
        return;
    }

    // --- Create Main Editor Container ---
    let editorContainer = document.createElement('div');
    editorContainer.id = '__myCleanDevEditorContainer';
    editorContainer.innerHTML = `
        <div class="__myeditor-header">
            <span>Dev Editor</span>
            <button id="__myeditorCloseBtn">✕</button>
        </div>
        <div class="__myeditor-tabs">
            <button class="__my-tab-btn active" data-tab="css">CSS</button>
            <button class="__my-tab-btn" data-tab="html">HTML</button>
        </div>
        <div class="__myeditor-content">
            <textarea id="__mycssEditor" class="__myeditor-pane active" placeholder="Write CSS here..."></textarea>
            <textarea id="__myhtmlEditor" class="__myeditor-pane" placeholder="Edit HTML here (e.g., document.body.innerHTML = '...');"></textarea>
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
            width: 400px; /* Wider for more content */
            height: 350px; /* Taller */
            background-color: #f5f5f5; /* Light gray background */
            border: 1px solid #ccc; /* Light border */
            border-radius: 8px; /* Slightly rounded corners */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow */
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both; /* Allow manual resizing */
            min-width: 300px;
            min-height: 250px;
        }
        #__myCleanDevEditorContainer * {
            box-sizing: border-box; /* Crucial */
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

    // Apply HTML changes (more complex, consider impact)
    applyChangesBtn.addEventListener('click', function() {
        // Apply CSS (already live, but ensure update)
        userStyleEl.textContent = cssEditor.value;

        // Apply HTML: This is a direct innerHTML replacement for the body.
        // BE CAREFUL: This can break your page's existing scripts and event listeners.
        // For a more robust solution, you'd target specific elements,
        // or offer options like insertAdjacentHTML.
        const htmlContent = htmlEditor.value; // Get current HTML from textarea
        if (htmlContent.trim() !== '') {
            if (confirm('WARNING: Applying HTML will replace the entire <body> content. This is destructive and may break the page. Continue?')) {
                // Temporarily store editor's state and remove it
                const editorState = {
                    css: cssEditor.value,
                    html: htmlEditor.value,
                    // No JS console state as we removed it
                    isContentEditable: document.body.contentEditable === 'true',
                    left: editorContainer.style.left,
                    top: editorContainer.style.top,
                    width: editorContainer.style.width,
                    height: editorContainer.style.height
                };

                editorContainer.remove(); // Remove editor before body replacement

                document.body.innerHTML = htmlContent; // Replace entire body HTML

                // Re-append the editor after body replacement
                document.body.appendChild(editorContainer);

                // Restore editor's state and rebind events
                rebindEditorEvents(editorContainer, editorState);

                console.log('HTML content applied to body. Editor re-initialized.');
            } else {
                console.log('HTML application cancelled.');
            }
        } else {
            console.warn('HTML editor is empty. No HTML changes applied.');
        }

        console.log('Changes applied.');
    });

    // Function to re-bind events after HTML replacement
    function rebindEditorEvents(retainedEditorContainer, state) {
        // Re-get references to elements within the now re-appended container
        const newCssEditor = retainedEditorContainer.querySelector('#__mycssEditor');
        const newHtmlEditor = retainedEditorContainer.querySelector('#__myhtmlEditor');
        const newApplyChangesBtn = retainedEditorContainer.querySelector('#__myapplyChangesBtn');
        const newToggleContentEditableBtn = retainedEditorContainer.querySelector('#__mytoggleContentEditableBtn');
        const newEditorCloseBtn = retainedEditorContainer.querySelector('#__myeditorCloseBtn');
        const newTabButtons = retainedEditorContainer.querySelectorAll('.__my-tab-btn');
        const newEditorPanes = retainedEditorContainer.querySelectorAll('.__myeditor-pane');

        // Restore content and state
        newCssEditor.value = state.css;
        newHtmlEditor.value = state.html;
        document.body.contentEditable = state.isContentEditable ? 'true' : 'false';
        document.body.style.webkitUserModify = state.isContentEditable ? 'read-write' : 'initial';
        newToggleContentEditableBtn.textContent = state.isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';

        // Restore position and size
        retainedEditorContainer.style.left = state.left;
        retainedEditorContainer.style.top = state.top;
        retainedEditorContainer.style.width = state.width;
        retainedEditorContainer.style.height = state.height;

        // Re-attach listeners
        newCssEditor.addEventListener('input', function() {
            userStyleEl.textContent = newCssEditor.value;
        });

        newApplyChangesBtn.addEventListener('click', function() {
            // This button now only handles CSS as HTML replacement is handled with confirmation
            userStyleEl.textContent = newCssEditor.value;
            // Also apply HTML if it's the active tab and user wants to
            if (newHtmlEditor.classList.contains('active')) {
                // Since this rebind function is called after the main HTML apply,
                // this applyChangesBtn inside the rebind function primarily
                // ensures CSS is updated if the HTML tab is active and user
                // hits apply. A full body HTML replace needs to be carefully triggered.
                // For now, this button will only trigger the full body replace if it's explicitly done via the primary click handler.
                // Re-evaluating the HTML part on rebind - better to split it.
                // For simplicity, after rebind, 'Apply Changes' only applies CSS.
                // Full HTML replacement logic needs to be a separate, more destructive action.
                // Let's refine the HTML application logic to be less confusing.
                console.log('CSS changes applied. HTML requires full re-apply via main button.');
            }
        });

        newToggleContentEditableBtn.addEventListener('click', function() {
            state.isContentEditable = !state.isContentEditable; // Update internal state
            document.body.contentEditable = state.isContentEditable ? 'true' : 'false';
            document.body.style.webkitUserModify = state.isContentEditable ? 'read-write' : 'initial';
            newToggleContentEditableBtn.textContent = state.isContentEditable ? 'Disable Page Edit' : 'Enable Page Edit';
            alert('Page content editable: ' + state.isContentEditable);
        });

        newEditorCloseBtn.addEventListener('click', function() {
            retainedEditorContainer.remove();
            document.body.contentEditable = 'false';
            delete window.__myCleanDevEditor;
            alert('Clean Dev Editor closed.');
        });

        newTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                newTabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                newEditorPanes.forEach(pane => pane.classList.remove('active'));
                document.getElementById('__my' + targetTab + 'Editor').classList.add('active');
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
        alert('Page content editable: ' + isContentEditable);
    });

    // Close Editor
    editorCloseBtn.addEventListener('click', function() {
        editorContainer.remove();
        document.body.contentEditable = 'false';
        delete window.__myCleanDevEditor;
        alert('Clean Dev Editor closed.');
    });

    // Tab switching logic
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            editorPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById('__my' + targetTab + 'Editor').classList.add('active');
        });
    });

    // Make editor draggable (basic implementation)
    let isDragging = false;
    let offsetX, offsetY;

    editorContainer.addEventListener('mousedown', function(e) {
        if (e.target === editorContainer || e.target.classList.contains('__myeditor-header')) {
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
    window.__myCleanDevEditor = editorContainer;
    alert('Clean Dev Editor loaded. Page is NOT editable by default. Use "Toggle Page Edit" button.');
})();
