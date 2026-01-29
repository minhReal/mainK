// ờ, skibidi //

(() => {
  if (document.getElementById("draggableUI")) return;

  const apiKey = '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';
  let isHighlightActive = false;

  // --- CONTAINER CHÍNH --- //
  const mainWrapper = document.createElement('div');
  mainWrapper.id = 'draggableUI';
  mainWrapper.style.cssText = `
    position: fixed; top: 70px; left: 70px;
    z-index: 999999; user-select: none; touch-action: none;
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
    display: flex; align-items: flex-start;
  `;

  // --- STYLE CSS --- //
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .tab-bar { display: flex; background: #f0f0f0; border-bottom: 1px solid #ddd; }
    .tab-btn { flex: 1; padding: 10px; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 13px; color: #555; transition: 0.2s; }
    .tab-btn.active { background: #fff; color: #c0392b; border-bottom: 3px solid #c0392b; }
    
    .tab-content { display: none; padding: 14px; flex-direction: column; gap: 10px; animation: fadeIn 0.2s ease; overflow: hidden; }
    .tab-content.active { display: flex; }
    
    /* Chế độ xoay ngang (Chỉ cho Tab AI) */
    #tabAI.side-by-side { flex-direction: row !important; align-items: flex-start; gap: 15px; width: 550px !important; }
    
    #aiResponse { height: 100px; overflow-y: auto; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 8px; font-size: 12px; white-space: pre-wrap; color: #222; }
    #aiInput, #searchInput { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 6px; outline: none; }
    
    .ans-wrap { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .ans-row { display: flex; align-items: center; gap: 5px; }
    .ans-label { font-weight: bold; width: 20px; color: #c0392b; font-size: 13px; }
    .ans-input { flex: 1; padding: 5px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; outline: none; }
    
    .square-btn { width: 30px; height: 30px; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: bold; background: #444; }

    /* Setting GUI */
    #settingUI {
        width: 170px; background: #fff; border-radius: 14px; 
        box-shadow: 0 10px 28px rgba(0,0,0,0.15); border: 1px solid #ddd; overflow: hidden;
        position: absolute; right: 100%; top: 0;
        opacity: 0; visibility: hidden; transform: translateX(10px);
        z-index: -1; 
    }
    #settingUI.active { opacity: 1; visibility: visible; transform: translateX(-10px); }

    /* Nút header đậm hơn khi active */
    .header-btn {
        background: rgba(255,255,255,0.2); border: none; color: white; 
        width: 26px; height: 26px; border-radius: 6px; cursor: pointer;
    }
    .header-btn.btn-active { background: rgba(0, 0, 0, 0.4) !important; }
    
    /* Nút Highlight đậm hơn khi bật */
    .customBtn.active-toggle { background: #962d22 !important; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3) !important; }

    /* Toggle Switch */
    .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 34px; transition: 0.3s; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider { background-color: #c0392b; }
    input:checked + .slider:before { transform: translateX(14px); }

    /* Smooth Class sẽ được thêm/xóa qua JS */
    .smooth-transition { transition: all 0.3s ease !important; }
  `;
  document.head.appendChild(style);

  // --- GUI SETTING --- //
  const settingGui = document.createElement('div');
  settingGui.id = 'settingUI';
  settingGui.className = 'smooth-transition';
  settingGui.innerHTML = `
    <div style="padding: 10px; background: #333; color: #fff; font-size: 12px; font-weight: bold; text-align: center;">SETTING</div>
    <div style="padding: 12px; display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 12px; color: #333;">Xoay ngang</span>
        <label class="switch"><input type="checkbox" id="toggleRotate"><span class="slider"></span></label>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 12px; color: #333;">Chế độ Smooth</span>
        <label class="switch"><input type="checkbox" id="toggleSmooth" checked><span class="slider"></span></label>
      </div>
    </div>
  `;

  // --- GUI CHÍNH --- //
  const dragItem = document.createElement('div');
  dragItem.id = 'mainGui';
  dragItem.className = 'smooth-transition';
  dragItem.style.cssText = `width: 280px; background: #ffffff; border-radius: 14px; box-shadow: 0 10px 28px rgba(160,0,0,0.25); overflow: hidden; position: relative; z-index: 2;`;

  dragItem.innerHTML = `
    <header id="dragHeader" style="cursor: grab; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: linear-gradient(135deg, #c0392b, #e74c3c); color: white;">
      <div>
        <div style="font-weight:700;font-size:14px;line-height:1;">Hỗ trợ học tập</div>
        <div style="font-size:11px;opacity:0.85;">By minhh</div>
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
        <button class="tab-btn" onclick="switchTab('tabSearch', this)">Search</button>
        <button class="tab-btn" onclick="switchTab('tabAI', this)">A.I</button>
      </div>

      <div id="tabMain" class="tab-content active">
          <h3 style="margin: 0; color: #c0392b;">Yo</h3>
          <p style="font-size: 13px; line-height: 1.4; color: #444;">
              <strong>Chào mày đến với "công cụ" hỗ trợ học tập.<br>
               <b>Những thứ m cần biết:</b>
                • Tab Auto: Các chức năng giúp mày biết đáp án.<br>
                • Toggle: Bấm phím.<br>
          </p>
          <div style="font-size: 11px; color: #888; text-align: right; margin-top: 10px;">29/1/2026 - By minhh</div>
      </div>

      <div id="tabAuto" class="tab-content">
        <button id="runBtn" class="customBtn">Chọn tất cả đáp án</button>
        <button id="highlightBtn" class="customBtn">Highlight đáp án</button>
      </div>

      <div id="tabSearch" class="tab-content">
        <input type="text" id="searchInput" placeholder="Tìm trên Google...">
        <button id="doSearchBtn" class="customBtn">Tìm kiếm</button>
      </div>

      <div id="tabAI" class="tab-content">
          <div id="aiInputGroup" style="flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 250px;">
            <div id="aiResponse"><i>Sẵn sàng...</i></div>
            <input type="text" id="aiInput" placeholder="Nhập câu hỏi...">
            <button id="askAiBtn" class="customBtn">Gửi câu hỏi</button>
          </div>
          
          <div id="ansSideGroup" style="display: flex; flex-direction: column; gap: 5px; min-width: 200px;">
             <div class="ans-wrap" id="ansContainer"></div>
             <div style="display: flex; align-items: center; gap: 8px;">
                <button id="addAnsBtn" class="square-btn">+</button>
                <button id="removeAnsBtn" class="square-btn" style="background:#888;">—</button>
                <span style="font-size: 11px; color: #000; opacity: 0.5; font-style: italic;">Ko ghi câu hỏi cũng đc</span>
             </div>
          </div>
      </div>
    </div>
  `;

  mainWrapper.appendChild(settingGui);
  mainWrapper.appendChild(dragItem);
  document.body.appendChild(mainWrapper);

  // --- LOGIC SMOOTH TOGGLE --- //
  const toggleSmooth = document.getElementById('toggleSmooth');
  const updateSmoothness = () => {
    const isSmooth = toggleSmooth.checked;
    const elements = [dragItem, settingGui, document.getElementById('tabAI'), ...document.querySelectorAll('.header-btn'), ...document.querySelectorAll('.tab-btn')];
    elements.forEach(el => {
        if (isSmooth) el.classList.add('smooth-transition');
        else el.classList.remove('smooth-transition');
    });
  };
  toggleSmooth.onchange = updateSmoothness;
  updateSmoothness();

  // --- LOGIC TAB & XOAY NGANG --- //
  const toggleRotate = document.getElementById('toggleRotate');
  const tabAI = document.getElementById('tabAI');

  window.switchTab = (id, btn) => {
    const isAI = (id === 'tabAI');
    if (isAI && toggleRotate.checked) {
        dragItem.style.width = '580px';
        tabAI.classList.add('side-by-side');
    } else {
        dragItem.style.width = '280px';
        setTimeout(() => { if(!tabAI.classList.contains('active')) tabAI.classList.remove('side-by-side'); }, 150);
    }
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
  };

  // --- AUTO TAB: HIGHLIGHT TOGGLE --- //
  document.getElementById('highlightBtn').onclick = function() {
    isHighlightActive = !isHighlightActive;
    const doc = document.querySelector('iframe')?.contentDocument || document;
    const items = doc.querySelectorAll('.h5p-sc-alternative.h5p-sc-is-correct');

    if (isHighlightActive) {
        this.classList.add('active-toggle');
        items.forEach(el => {
            el.style.transition = "all 0.4s ease"; // Thêm smooth cho đáp án
            el.style.boxShadow = "0 0 15px 3px #00ff80";
            el.style.border = "2px solid #00ff80";
            el.style.background = "rgba(0,255,128,0.2)";
        });
    } else {
        this.classList.remove('active-toggle');
        items.forEach(el => {
            el.style.boxShadow = ""; el.style.border = ""; el.style.background = "";
        });
    }
  };

  document.getElementById('runBtn').onclick = () => {
    const doc = document.querySelector('iframe')?.contentDocument || document;
    doc.querySelectorAll('.h5p-sc-alternative.h5p-sc-is-correct').forEach(el => { el.click(); el.style.outline = "3px solid #00ff80"; });
  };

  // --- A.I LOGIC --- //
  document.getElementById('askAiBtn').onclick = async () => {
    const output = document.getElementById('aiResponse');
    const question = document.getElementById('aiInput').value.trim();
    let validAns = [];
    document.querySelectorAll('.ans-row').forEach(r => {
        const val = r.querySelector('.ans-input').value.trim();
        if(val) validAns.push(`${r.querySelector('.ans-label').innerText} ${val}`);
    });

    if(!question && validAns.length === 0) return;
    if(validAns.length === 1) {
        output.innerHTML = `<span style="color:red;"><b>Lỗi:</b> Cần ít nhất 2 đáp án hoặc chỉ nhập câu hỏi!</span>`;
        return;
    }

    output.innerText = "A.I: Đang suy nghĩ...";
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {role: "system", content: validAns.length >= 2 ? "Giải đề trắc nghiệm ngắn gọn." : "Chat bạn bè."},
                    {role: "user", content: question + "\n" + validAns.join('\n')}
                ]
            })
        });
        const data = await res.json();
        output.innerText = `A.I: ${data.choices[0].message.content}`;
    } catch(e) { output.innerText = "A.I: Lỗi kết nối!"; }
  };

  // --- CÁC LOGIC PHỤ (DRAG, ANSWERS, SEARCH) --- //
  const setBtn = document.getElementById('setBtn');
  setBtn.onclick = () => {
    settingGui.classList.toggle('active');
    setBtn.classList.toggle('btn-active');
  };

  const ansContainer = document.getElementById('ansContainer');
  let ansCount = 0;
  const addRow = (i) => {
    const char = String.fromCharCode(65 + i);
    const div = document.createElement('div'); div.className = 'ans-row';
    div.innerHTML = `<span class="ans-label">${char}:</span><input type="text" class="ans-input" placeholder="...">`;
    ansContainer.appendChild(div);
    ansCount++;
  };
  for(let i=0; i<4; i++) addRow(i);
  document.getElementById('addAnsBtn').onclick = () => addRow(ansCount);
  document.getElementById('removeAnsBtn').onclick = () => { if(ansCount > 1) { ansContainer.removeChild(ansContainer.lastElementChild); ansCount--; } };

  const header = document.getElementById('dragHeader');
  let active = false, currentX = 0, currentY = 0, initialX, initialY, xOffset = 0, yOffset = 0;
  header.addEventListener("mousedown", (e) => {
    if (e.target.closest('button') || e.target.tagName === 'INPUT') return;
    initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; active = true;
  });
  document.addEventListener("mousemove", (e) => {
    if (active) {
        e.preventDefault();
        currentX = e.clientX - initialX; currentY = e.clientY - initialY;
        xOffset = currentX; yOffset = currentY;
        mainWrapper.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  });
  document.addEventListener("mouseup", () => active = false);

  document.getElementById('closeBtn').onclick = () => mainWrapper.remove();
  document.getElementById('toggleUIBtn').onclick = () => {
    const mc = document.getElementById('mainContent');
    mc.style.display = mc.style.display === 'none' ? 'block' : 'none';
  };

  const cbtns = dragItem.querySelectorAll(".customBtn");
  cbtns.forEach(b => {
    b.style.cssText = `width: 100%; padding: 11px; border: none; border-radius: 10px; background: linear-gradient(135deg, #c0392b, #e74c3c); color: white; font-size: 14px; cursor: pointer; font-weight: 600; transition: 0.2s; margin-top:5px;`;
  });
})();
