(() => {
  if (document.getElementById("draggableUI")) return;

  const apiKey = null;
  let isHighlightActive = false;
  let parsedQuestions = []; 

  function queryAll(selector) {
    const docs = [document];
    document.querySelectorAll('iframe').forEach(function(f) {
      try { if (f.contentDocument) docs.push(f.contentDocument); } catch (e) {}
    });
    var elements = [];
    docs.forEach(function(d) { elements = elements.concat(Array.from(d.querySelectorAll(selector))); });
    return elements;
  }

  function forceSelectElement(element) {
      element.click();
      if (element.tagName === 'INPUT') element.checked = true;
      const events = ['mousedown', 'mouseup', 'touchstart', 'touchend', 'change', 'input'];
      events.forEach(evtName => {
          let event;
          if (typeof MouseEvent === 'function' && ['mousedown', 'mouseup', 'click'].includes(evtName)) {
               event = new MouseEvent(evtName, { view: window, bubbles: true, cancelable: true });
          } else if (typeof Event === 'function') {
               event = new Event(evtName, { bubbles: true, cancelable: true });
          }
          if(event) element.dispatchEvent(event);
      });
  }

  function triggerClick(text, isH5P) {
    if (typeof isH5P === 'undefined') isH5P = false;
    if (isH5P) {
        queryAll('.h5p-sc-alternative.h5p-sc-is-correct').forEach(function(el) { forceSelectElement(el); });
        return;
    }
    if (!text) return;
    var cleanText = String(text).trim();
    var elements = queryAll('label, span, div, p, li');
    elements.forEach(function(el) {
        if (el.offsetParent === null) return; 
        var elText = el.innerText.trim();
        if(elText === cleanText || (elText.indexOf(cleanText) !== -1 && elText.length < cleanText.length + 10)) {
            if (el.tagName === 'A' || el.closest('a')) {
                var innerInput = el.querySelector('input') || (el.closest('a').querySelector('input'));
                if (innerInput) forceSelectElement(innerInput);
                return; 
            }
            el.style.border = "2px solid #e74c3c"; 
            setTimeout(() => el.style.border = "", 1000);
            var input = el.querySelector('input') || 
                        (el.closest('label') ? el.closest('label').querySelector('input') : null) ||
                        (el.closest('div') ? el.closest('div').querySelector('input') : null) || 
                        (el.closest('li') ? el.closest('li').querySelector('input') : null);
            if(input) { forceSelectElement(input); } 
            else { if (el.tagName === 'LABEL') forceSelectElement(el); else forceSelectElement(el); }
        }
    });
  }

  const mainWrapper = document.createElement('div');
  mainWrapper.id = 'draggableUI';
  mainWrapper.style.cssText = `position: fixed; top: 70px; left: 20px; z-index: 999999; user-select: none; touch-action: none; font-family: "Segoe UI", Roboto, Arial, sans-serif; display: flex; align-items: flex-start;`;

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .tab-bar { display: flex; background: #f0f0f0; border-bottom: 1px solid #ddd; flex-wrap: wrap; }
    .tab-btn { flex: 1; padding: 10px; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 12px; color: #555; transition: 0.2s; min-width: 50px; }
    .tab-btn.active { background: #fff; color: #c0392b; border-bottom: 3px solid #c0392b; }
    .tab-content { display: none; padding: 14px; flex-direction: column; gap: 10px; animation: fadeIn 0.2s ease; overflow: hidden; }
    .tab-content.active { display: flex; }
    #aiResponse { height: 120px; overflow-y: auto; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 8px; font-size: 12px; white-space: pre-wrap; color: #222; }
    #lmsResponse { height: 200px; overflow-y: auto; background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 10px; font-size: 12px; color: #222; }
    #aiInput, #searchInput, #lmsInput { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 6px; outline: none; }
    .ans-wrap { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .ans-row { display: flex; align-items: center; gap: 5px; }
    .ans-label { font-weight: bold; width: 20px; color: #c0392b; font-size: 13px; }
    .ans-input { flex: 1; padding: 5px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; outline: none; }
    .square-btn { width: 30px; height: 30px; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: bold; background: #444; transition: 0.2s; }
    .square-btn:active { transform: scale(0.95); }
    #settingUI { width: 170px; background: #fff; border-radius: 14px; box-shadow: 0 10px 28px rgba(0,0,0,0.15); border: 1px solid #ddd; position: absolute; right: 100%; top: 0; opacity: 0; visibility: hidden; transform: translateX(10px); z-index: 1; }
    #settingUI.active { opacity: 1; visibility: visible; transform: translateX(-10px); }
    .header-btn { background: rgba(255,255,255,0.2); border: none; color: white; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; }
    .header-btn.btn-active { background: rgba(0, 0, 0, 0.4) !important; }
    .customBtn { width: 100%; padding: 11px; border: none; border-radius: 10px; background: linear-gradient(135deg, #c0392b, #e74c3c); color: white; font-size: 14px; cursor: pointer; font-weight: 600; margin-top:5px; transition: 0.2s; }
    .customBtn:active { transform: scale(0.98); }
    .customBtn.active-toggle { background: #27ae60 !important; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3) !important; }
    .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 34px; transition: 0.3s; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider { background-color: #c0392b; }
    input:checked + .slider:before { transform: translateX(14px); }
    .smooth-transition { transition: all 0.3s ease !important; }
    .q-box { border: 1px solid #eee; border-radius: 8px; padding: 10px; background: #fdfdfd; box-shadow: 0 2px 5px rgba(0,0,0,0.05); margin-bottom: 5px; }
    .q-title { font-weight: bold; font-size: 13px; margin-bottom: 8px; color: #333; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
    .opt-row { font-size: 13px; padding: 4px 8px; border-radius: 5px; margin-bottom: 3px; display: flex; align-items: flex-start; }
    .opt-correct { background: #e8f8f5; color: #16a085; font-weight: bold; border: 1px solid #16a085; }
    .opt-label { margin-right: 5px; min-width: 20px; }
    .essay-content { background: #f0f8ff; padding: 10px; border-radius: 5px; border: 1px solid #bde0fe; color: #333; font-size: 12px; margin-top: 5px; }
    .lms-success { color: #27ae60; font-weight: bold; margin-bottom: 10px; }
    .lms-error { color: #e74c3c; font-weight: bold; }
    .search-group { display: flex; gap: 5px; margin-top: 5px; align-items: center; }
    .search-group input { flex: 1; }
    .search-group button { width: auto; margin-top: 0; padding: 8px 15px; }
  `;
  document.head.appendChild(style);

  const settingGui = document.createElement('div');
  settingGui.id = 'settingUI';
  settingGui.className = 'smooth-transition';
  settingGui.innerHTML = `
    <div style="padding: 10px; background: #333; color: #fff; font-size: 12px; font-weight: bold; text-align: center;">SETTING</div>
    <div style="padding: 12px; display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 12px; color: #333;">Xoay ngang AI</span>
        <label class="switch"><input type="checkbox" id="toggleRotate"><span class="slider"></span></label>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 12px; color: #333;">Smooth Mode</span>
        <label class="switch"><input type="checkbox" id="toggleSmooth" checked><span class="slider"></span></label>
      </div>
    </div>
  `;

  const dragItem = document.createElement('div');
  dragItem.id = 'mainGui';
  dragItem.className = 'smooth-transition';
  dragItem.style.cssText = `width: 300px; background: #ffffff; border-radius: 14px; box-shadow: 0 10px 28px rgba(160,0,0,0.25); overflow: hidden; position: relative; z-index: 10;`;

  dragItem.innerHTML = `
    <header id="dragHeader" style="cursor: move; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: linear-gradient(135deg, #c0392b, #e74c3c); color: white;">
      <div>
        <div style="font-weight:700;font-size:14px;line-height:1;">Hỗ trợ học tập</div>
        <div style="font-size:11px;opacity:0.85;"> làm chậm thôi</div>
      </div>
      <div style="display: flex; gap: 5px;">
        <button id="setBtn" class="header-btn smooth-transition">⚙</button>
        <button id="toggleUIBtn" class="header-btn smooth-transition">—</button>
        <button id="closeBtn" class="header-btn smooth-transition">×</button>
      </div>
    </header>

    <div id="mainContent">
      <div class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('tabMain', this)">Main</button>
        <button class="tab-btn" onclick="switchTab('tabAuto', this)">Auto</button>
        <button class="tab-btn" onclick="switchTab('tabLMS', this)">Smart</button>
        <button class="tab-btn" onclick="switchTab('tabAI', this)">A.I</button>
      </div>

      <div id="tabMain" class="tab-content active">
          <h3 style="margin: 0; color: #c0392b;">Yo</h3>
          <div style="font-size: 13px; color: #333; line-height: 1.8;">
              <p style="margin: 0;">• <b>Auto:</b> Làm được vài cái trắc nghiệm</p>
              <p style="margin: 0;">• <b>Smart:</b> Giải đc trắc nghiệm/tự luận (có thể sai)</p>
              <p style="margin: 0;">• <b>A.I:</b> Đang chết</p>
              <p style="margin: 0;">• <b>Phím tắt:</b> Bấm <b>F</b> để ẩn/hiện Menu</p>
              <p style="margin: 0;">• <b>Creator:</b> minhh:0, HiennNek(trên Github), GeminiAi, ChatGPT, Grok, ReplitAi</p>
          </div>
      </div>

      <div id="tabAuto" class="tab-content">
        <button id="runBtn" class="customBtn">Chọn tất cả đáp án</button>
        <button id="highlightBtn" class="customBtn">Highlight đáp án</button>
      </div>

      <div id="tabLMS" class="tab-content">
        <button id="setupBtn" class="customBtn">Setup</button>
        <button id="selectAnsBtn" class="customBtn">Chọn tất cả (Có thể sai)</button>
        
        <div class="search-group">
            <input type="text" id="searchInput" placeholder="Lọc câu hỏi...">
            <button id="searchBtn" class="customBtn">🔎</button>
        </div>

        <div id="lmsResponse"><i>Đang chờ setup...</i></div>
      </div>

      <div id="tabAI" class="tab-content">
          <div style="color:red; font-weight:bold; text-align:center; font-size: 14px; border: 2px dashed red; padding: 5px; margin-bottom: 10px; background: #ffeeee;">KO HOẠT ĐỘNG😢</div>
          <div id="aiInputGroup" style="flex: 1; display: flex; flex-direction: column; gap: 8px; opacity: 0.5; pointer-events: none;">
            <div id="aiResponse"><i>A.I Đang chờ lệnh...</i></div>
            <input type="text" id="aiInput" placeholder="Nhập câu hỏi...">
            <button id="askAiBtn" class="customBtn">Gửi câu hỏi</button>
          </div>
          
          <div id="ansSideGroup" style="display: flex; flex-direction: column; gap: 5px; opacity: 0.5; pointer-events: none;">
             <div class="ans-wrap" id="ansContainer"></div>
             <div style="display: flex; align-items: center; gap: 5px;">
                <button id="addAnsBtn" class="square-btn">+</button>
                <button id="removeAnsBtn" class="square-btn" style="background:#888;">—</button>
                <button id="clearTextBtn" class="square-btn" style="background:#e67e22; font-size: 11px;">C</button>
             </div>
          </div>
      </div>
    </div>
  `;

  mainWrapper.appendChild(settingGui);
  mainWrapper.appendChild(dragItem);
  document.body.appendChild(mainWrapper);

  let isDragging = false, offset = { x: 0, y: 0 };
  const startDrag = (e) => {
    if (e.target.closest('button') || e.target.tagName === 'INPUT') return;
    isDragging = true;
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    const rect = mainWrapper.getBoundingClientRect();
    offset.x = clientX - rect.left;
    offset.y = clientY - rect.top;
  };
  const moveDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault(); 
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    mainWrapper.style.left = `${clientX - offset.x}px`;
    mainWrapper.style.top = `${clientY - offset.y}px`;
  };
  const stopDrag = () => isDragging = false;
  const header = document.getElementById('dragHeader');
  header.addEventListener('mousedown', startDrag);
  header.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('touchmove', moveDrag, { passive: false });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (['f'].includes(e.key.toLowerCase())) mainWrapper.style.display = (mainWrapper.style.display === 'none') ? 'flex' : 'none';
  });

  window.switchTab = (id, btn) => {
    const isAI = (id === 'tabAI');
    const rotate = document.getElementById('toggleRotate').checked;
    dragItem.style.width = (isAI && rotate) ? '580px' : '300px';
    const tabAI = document.getElementById('tabAI');
    if (isAI && rotate) tabAI.classList.add('side-by-side');
    else setTimeout(() => tabAI.classList.remove('side-by-side'), 150);
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
  };
  
  const toggleRotate = document.getElementById('toggleRotate');
  toggleRotate.onchange = () => { if (document.getElementById('tabAI').classList.contains('active')) window.switchTab('tabAI', document.querySelectorAll('.tab-btn')[3]); };

  function parseAndRender(data) {
      const box = document.getElementById('lmsResponse');
      const list = data.questions || [];
      parsedQuestions = list; 
      
      let html = `<div style="font-size:11px; margin-bottom:5px; border-bottom:1px solid #eee; padding-bottom:5px;">Tìm thấy ${list.length} kết quả:</div>`;
      
      list.forEach((q, idx) => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = q.text || "";
          
          let qText = tempDiv.innerText.split('\n')[0].trim();
          let optionsHtml = "";
          const lis = tempDiv.querySelectorAll('li');
          
          if (lis.length > 0) {
              lis.forEach((li, i) => {
                  const label = String.fromCharCode(65 + i); 
                  const isCorrect = li.classList.contains('highlight');
                  optionsHtml += `<div class="opt-row ${isCorrect ? 'opt-correct' : ''}"><span class="opt-label"><b>${label}.</b></span><span>${li.innerText.trim()} ${isCorrect ? '✅' : ''}</span></div>`;
              });
          } else {
              optionsHtml = `<div class="essay-content">
                  <b>📝 Lời giải chi tiết:</b><br>
                  ${q.text}
              </div>`;
          }

          html += `<div class="q-box"><div class="q-title">Câu ${idx + 1}: ${qText.substring(0, 50)}...</div><div>${optionsHtml}</div></div>`;
      });
      
      const resultContainer = document.createElement('div');
      resultContainer.innerHTML = html;
      box.appendChild(resultContainer);
  }

  // --- FETCH & DELAY --- //
  async function hackLms360(inputUrl) {
    const lmsOutput = document.getElementById('lmsResponse');
    if (!inputUrl) { lmsOutput.innerHTML = `<div class="lms-error">❌ Chưa có URL!</div>`; return; }
    try {
      const questionId = new URL(inputUrl).searchParams.get("c");
      if (!questionId) throw new Error("URL không hợp lệ");
      
      lmsOutput.innerHTML = `<i>Đang kết nối Server...</i>`;
      
      const res = await fetch(`https://kobt.duongminhminh46.workers.dev/?id=${encodeURIComponent(questionId)}`);
      const srcHeader = res.headers.get("X-Source"); 
      const data = await res.json();

      let serverName = "(?)";
      let color = "#2980b9"; // Màu mặc định xanh dương đậm (cho Mới nạp)
      
      if (srcHeader && srcHeader.includes("1")) { serverName = "(1) - Kho Riêng"; color = "#27ae60"; } // Xanh lá
      else if (srcHeader && srcHeader.includes("2")) { serverName = "(2) - Hiennek"; color = "#e67e22"; } // Cam
      else { serverName = "(Mới nạp)"; color = "#007bff"; } // Xanh dương tươi

      lmsOutput.innerHTML = `<div style="text-align:center; padding: 20px 0;">
            <div style="font-size: 16px; font-weight: bold; color: ${color}; margin-bottom: 5px;">📡 Đã tìm thấy: Server ${serverName}</div>
            <div style="font-size: 12px; color: #333;">Đang tải dữ liệu...</div>
      </div>`;

      await new Promise(r => setTimeout(r, 1000));

      lmsOutput.innerHTML = `<div style="text-align:center; padding: 5px; border-bottom: 2px solid ${color}; margin-bottom:10px;">
            <b style="color: ${color};">SERVER ${serverName}</b>
      </div>`;
      
      parseAndRender(data);

    } catch (err) { lmsOutput.innerHTML = `<div class="lms-error">❌ Lỗi: ${err.message}</div>`; }
  }

  document.getElementById('setupBtn').onclick = () => hackLms360(window.location.href);
  fetch("https://gist.githubusercontent.com/minhReal/079a1070f25849286d00cc00796bf43a/raw/12cf815f74a5b02593bdb1b554ad4c145b4bce6c/load%2520logic%2520A.i")
    .then(r => r.text()).then(eval).catch(() => console.log("Init..."));
  document.getElementById('selectAnsBtn').onclick = () => {
    if (!parsedQuestions.length) return alert('Vui lòng Setup trước!');
    parsedQuestions.forEach((q) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = q.text || "";
        tempDiv.querySelectorAll('li.highlight').forEach(li => triggerClick(li.innerText.trim()));
    });
  };

  const filterQuestions = () => {
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      document.querySelectorAll('.q-box').forEach(box => {
          box.style.display = box.innerText.toLowerCase().includes(query) ? 'block' : 'none';
      });
  };
  document.getElementById('searchBtn').onclick = filterQuestions;
  document.getElementById('searchInput').addEventListener('input', filterQuestions);
  document.getElementById('runBtn').onclick = () => triggerClick(null, true);

  document.getElementById('highlightBtn').onclick = function() {
    isHighlightActive = !isHighlightActive;
    this.classList.toggle('active-toggle', isHighlightActive);
    const docs = [document];
    document.querySelectorAll('iframe').forEach(f => { try { if(f.contentDocument) docs.push(f.contentDocument); } catch(e){} });
    docs.forEach(d => d.querySelectorAll('.h5p-sc-alternative.h5p-sc-is-correct').forEach(el => {
        el.style.border = isHighlightActive ? "2px solid #00ff80" : "";
    }));
  };

  document.getElementById('askAiBtn').onclick = async () => {};

  document.getElementById('clearTextBtn').onclick = () => {
    document.getElementById('aiInput').value = "";
    document.querySelectorAll('.ans-input').forEach(i => i.value = "");
  };
  document.getElementById('setBtn').onclick = () => settingGui.classList.toggle('active');
  document.getElementById('closeBtn').onclick = () => mainWrapper.remove();
  document.getElementById('toggleUIBtn').onclick = () => { const mc = document.getElementById('mainContent'); mc.style.display = mc.style.display === 'none' ? 'block' : 'none'; };

  const ansContainer = document.getElementById('ansContainer');
  let ansCount = 0;
  const addRow = () => {
    const div = document.createElement('div'); div.className = 'ans-row';
    div.innerHTML = `<span class="ans-label">${String.fromCharCode(65 + ansCount)}:</span><input type="text" class="ans-input">`;
    ansContainer.appendChild(div); ansCount++;
  };
  for(let i=0; i<4; i++) addRow();
  document.getElementById('addAnsBtn').onclick = addRow;
  document.getElementById('removeAnsBtn').onclick = () => { if(ansCount > 1) { ansContainer.removeChild(ansContainer.lastElementChild); ansCount--; } };
})();
console.clear();
console.log("Đang load... 🥵");
