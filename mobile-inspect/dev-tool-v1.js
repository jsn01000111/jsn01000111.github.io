javascript:(function() {
  if (window.__dtL) return;
  window.__dtL = true; // Use shorter global flag

  const d = document, b = d.body, w = window;

  const s = d.createElement("style");
  s.textContent = `
    #dt{position:fixed;bottom:10px;right:10px;width:320px;max-width:95vw;height:280px;max-height:80vh;z-index:99999;font-family:monospace;background:#fff;color:#111;border:1px solid #ccc;border-radius:6px;display:flex;flex-direction:column;box-shadow:0 2px 8px rgba(0,0,0,0.2);overflow:hidden;}
    #dtH{background:#f0f0f0;padding:6px 10px;cursor:grab;user-select:none;font-weight:bold;border-bottom:1px solid #ccc;display:flex;justify-content:space-between;align-items:center;}
    #dtT{flex:1;padding:6px;font-size:13px;border:none;outline:none;resize:vertical;min-height:50px;}
    #dtF{display:flex;gap:4px;padding:6px;background:#f9f9f9;border-top:1px solid #ccc;flex-wrap:wrap;}
    #dtF button{flex:1;min-width:60px;padding:8px 4px;font-size:12px;background:#eee;color:#111;border:1px solid #ccc;border-radius:4px;cursor:pointer;white-space:nowrap;}
    #dtF button:hover{background:#ddd;}
    #dtP,#dtL{font-size:11px;padding:4px 8px;border-top:1px solid #ddd;background:#fafafa;color:#333;overflow:auto;max-height:50px;white-space:pre-wrap;}
    .h-i{outline:2px dashed #f00;outline-offset:-2px;}
    #dtC,#dtM{background:transparent;border:none;color:#444;font-size:16px;cursor:pointer;line-height:1;margin-left:5px;}
    #dtM{font-size:20px;line-height:0.8;} /* For minimize icon */
    #dtL span.err{color:#d00;font-weight:bold;} /* Error style */
    #dtL span.warn{color:#e80;font-weight:bold;} /* Warning style */
    @media (max-width:480px){
      #dt{width:98vw;height:90vh;bottom:1vw;right:1vw;left:1vw;top:1vw;max-width:unset;max-height:unset;}
      #dtH{cursor:auto;} /* Disable drag on small screens */
    }
  `;
  d.head.appendChild(s);

  const dvT = d.createElement("div");
  dvT.id = "dt";
  dvT.innerHTML = `
    <div id="dtH">
      <span>Dev Tool</span>
      <div>
        <button id="dtM">−</button>
        <button id="dtC">×</button>
      </div>
    </div>
    <textarea id="dtT">// Type JS or CSS here\nconsole.log('Hello Dev Tool');</textarea>
    <div id="dtF">
      <button id="rB">▶ Run JS</button>
      <button id="iB">Inject CSS</button>
      <button id="insB">Inspect</button>
      <button id="eB">Edit Page</button>
      <button id="lsB">LocalSto</button>
      <button id="ssB">SessSto</button>
      <button id="clB">Clear</button>
    </div>
    <div id="dtP">Path: (none)</div>
    <div id="dtL">Console:</div>
  `;
  b.appendChild(dvT);

  const h = dvT.querySelector("#dtH"),
        t = dvT.querySelector("#dtT"),
        rB = dvT.querySelector("#rB"),
        iB = dvT.querySelector("#iB"),
        insB = dvT.querySelector("#insB"),
        eB = dvT.querySelector("#eB"),
        lsB = dvT.querySelector("#lsB"),
        ssB = dvT.querySelector("#ssB"),
        clB = dvT.querySelector("#clB"),
        pB = dvT.querySelector("#dtP"),
        lB = dvT.querySelector("#dtL"),
        cB = dvT.querySelector("#dtC"),
        mB = dvT.querySelector("#dtM");

  let ox = 0, oy = 0, isD = false;
  const ds = e => {
    if (w.innerWidth <= 480) return; // Disable drag on small screens
    isD = true;
    const touch = e.touches?.[0] || e;
    ox = touch.clientX - dvT.offsetLeft;
    oy = touch.clientY - dvT.offsetTop;
    e.preventDefault();
  };
  const dm = e => {
    if (!isD) return;
    const touch = e.touches?.[0] || e;
    dvT.style.left = (touch.clientX - ox) + "px";
    dvT.style.top = (touch.clientY - oy) + "px";
    dvT.style.bottom = "auto";
    dvT.style.right = "auto";
  };
  const de = () => { isD = false; };
  h.addEventListener("mousedown", ds);
  h.addEventListener("touchstart", ds, { passive: false }); // Needs passive:false for preventDefault
  d.addEventListener("mousemove", dm);
  d.addEventListener("touchmove", dm, { passive: false });
  d.addEventListener("mouseup", de);
  d.addEventListener("touchend", de);

  iB.onclick = () => {
    const css = t.value.trim();
    if (css) {
      const el = d.createElement("style");
      el.textContent = css;
      d.head.appendChild(el);
      lB.innerHTML += "✅ CSS Injected\n";
    }
  };

  rB.onclick = () => {
    const code = t.value;
    lB.innerHTML = "Console:\n";
    const oL = w.console.log, oE = w.console.error, oW = w.console.warn;
    w.console.log = (...a) => { lB.innerHTML += `🟢 ${a.map(x => typeof x === 'object' ? JSON.stringify(x).substring(0,200) : String(x)).join(' ')}\n`; oL(...a); };
    w.console.error = (...a) => { lB.innerHTML += `<span class="err">❌ ${a.map(x => typeof x === 'object' ? JSON.stringify(x).substring(0,200) : String(x)).join(' ')}</span>\n`; oE(...a); };
    w.console.warn = (...a) => { lB.innerHTML += `<span class="warn">⚠️ ${a.map(x => typeof x === 'object' ? JSON.stringify(x).substring(0,200) : String(x)).join(' ')}</span>\n`; oW(...a); };

    try {
      const res = w.eval(code);
      lB.innerHTML += `✅ Result: ${res}\n`;
    } catch (err) {
      lB.innerHTML += `<span class="err">❌ Error: ${err.message}</span>\n`;
    } finally {
      w.console.log = oL;
      w.console.error = oE;
      w.console.warn = oW;
      lB.scrollTop = lB.scrollHeight; // Scroll to bottom
    }
  };

  let isE = false;
  eB.onclick = () => {
    isE = !isE;
    b.contentEditable = isE;
    d.designMode = isE ? "on" : "off";
    eB.textContent = isE ? "Stop Edit" : "Edit Page";
  };

  clB.onclick = () => {
    t.value = "// Type JS or CSS here\nconsole.log('Hello Dev Tool');";
    lB.innerHTML = "Console:";
    pB.textContent = "Path: (none)";
    isE = false;
    b.contentEditable = false;
    d.designMode = "off";
    eB.textContent = "Edit Page";
    isI = false;
    insB.textContent = "Inspect";
    d.querySelectorAll(".h-i").forEach(el => el.classList.remove("h-i"));
    b.removeEventListener("mouseover", hL);
    b.removeEventListener("click", cap, true);
  };

  cB.onclick = () => {
    b.removeChild(dvT);
    delete w.__dtL; // Clean up global flag
    // Restore console if not already done (good practice)
    if (w.console.originalLog) w.console.log = w.console.originalLog;
    if (w.console.originalError) w.console.error = w.console.originalError;
    if (w.console.originalWarn) w.console.warn = w.console.originalWarn;
  };

  let isMin = false;
  mB.onclick = () => {
    isMin = !isMin;
    dvT.style.height = isMin ? '40px' : (w.innerWidth <= 480 ? '90vh' : '280px');
    t.style.display = isMin ? 'none' : 'flex';
    dvT.querySelector("#dtF").style.display = isMin ? 'none' : 'flex';
    pB.style.display = isMin ? 'none' : 'block';
    lB.style.display = isMin ? 'none' : 'block';
    mB.textContent = isMin ? '□' : '−'; // Square for maximize, minus for minimize
  };

  function gP(el) {
    if (!el || el === d.documentElement || el === b) return "";
    const p = [];
    while (el && el.nodeType === 1 && el !== b) {
      let n = el.nodeName.toLowerCase();
      if (el.id) {
        n += `#${el.id}`; p.unshift(n); break;
      } else {
        let sib = el, c = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() === n) c++;
        }
        n += `:nth-of-type(${c})`;
      }
      p.unshift(n); el = el.parentElement;
    }
    return p.join(" > ");
  }

  let isI = false;
  insB.onclick = () => {
    isI = !isI;
    insB.textContent = isI ? "Stop Inspect" : "Inspect";
    if (isI) {
      b.addEventListener("mouseover", hL);
      b.addEventListener("click", cap, true);
    } else {
      b.removeEventListener("mouseover", hL);
      b.removeEventListener("click", cap, true);
      d.querySelectorAll(".h-i").forEach(el => el.classList.remove("h-i"));
    }
  };

  const hL = e => {
    d.querySelectorAll(".h-i").forEach(el => el.classList.remove("h-i"));
    e.target.classList.add("h-i");
  };

  const cap = e => {
    e.preventDefault(); e.stopPropagation();
    t.value = e.target.outerHTML.substring(0, 500) + (e.target.outerHTML.length > 500 ? '...' : ''); // Truncate
    pB.textContent = "Path: " + gP(e.target);
    lB.innerHTML += `\nElement Info:\n`;
    lB.innerHTML += `  Tag: ${e.target.tagName.toLowerCase()}\n`;
    if (e.target.id) lB.innerHTML += `  ID: #${e.target.id}\n`;
    if (e.target.className) lB.innerHTML += `  Class: .${e.target.className.split(' ').join('.')}\n`;
    const cs = w.getComputedStyle(e.target);
    lB.innerHTML += `  Display: ${cs.display}, Position: ${cs.position}\n`;
    lB.innerHTML += `  Size: ${cs.width}x${cs.height}\n`;
    lB.innerHTML += `  Font: ${cs.fontSize} ${cs.fontFamily}\n`;
    lB.innerHTML += `  Color: ${cs.color}, Bg: ${cs.backgroundColor}\n`;
    
    // Attempt to scroll target into view if not already
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    isI = false;
    insB.textContent = "Inspect";
    b.removeEventListener("mouseover", hL);
    b.removeEventListener("click", cap, true);
    d.querySelectorAll(".h-i").forEach(el => el.classList.remove("h-i"));
    lB.scrollTop = lB.scrollHeight;
  };

  lsB.onclick = () => {
    lB.innerHTML += "\n--- Local Storage ---\n";
    for (let i = 0; i < w.localStorage.length; i++) {
      const k = w.localStorage.key(i);
      lB.innerHTML += `➡️ ${k}: ${w.localStorage.getItem(k).substring(0, 100)}\n`; // Truncate values
    }
    lB.scrollTop = lB.scrollHeight;
  };

  ssB.onclick = () => {
    lB.innerHTML += "\n--- Session Storage ---\n";
    for (let i = 0; i < w.sessionStorage.length; i++) {
      const k = w.sessionStorage.key(i);
      lB.innerHTML += `➡️ ${k}: ${w.sessionStorage.getItem(k).substring(0, 100)}\n`; // Truncate values
    }
    lB.scrollTop = lB.scrollHeight;
  };

})();
