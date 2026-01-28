// ờ, skibidi //

(() => {
  // Chặn tạo trùng
  if (document.getElementById("draggableUI")) return;

  // 1. TẠO GIAO DIỆN CHÍNH
  const dragItem = document.createElement('div');
  dragItem.id = 'draggableUI';
  dragItem.style.cssText = `
    position: fixed;
    top: 70px;
    left: 70px;
    width: 280px; 
    background: #ffffff;
    color: #2b2b2b;
    border-radius: 14px;
    z-index: 999999;
    user-select: none;
    touch-action: none;
    box-shadow: 0 10px 28px rgba(160,0,0,0.25);
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
    overflow: hidden;
  `;

  // CSS cho Tabs và Nội dung
  const style = document.createElement('style');
  style.innerHTML = `
    .tab-bar { display: flex; background: #f0f0f0; border-bottom: 1px solid #ddd; }
    .tab-btn { 
      flex: 1; padding: 10px; border: none; background: transparent; 
      cursor: pointer; font-weight: 600; font-size: 13px; color: #555;
      transition: all 0.2s;
    }
    .tab-btn:hover { background: #e0e0e0; }
    .tab-btn.active { 
      background: #fff; color: #c0392b; border-bottom: 3px solid #c0392b; 
    }
    .tab-content { display: none; padding: 14px; flex-direction: column; gap: 10px; }
    .tab-content.active { display: flex; }
    
    /* Style Chat AI */
    #aiResponse { 
        height: 100px; overflow-y: auto; background: #f9f9f9; 
        border: 1px solid #eee; border-radius: 8px; padding: 8px; 
        font-size: 12px; margin-bottom: 8px; 
    }
    #aiInput {
        width: 100%; box-sizing: border-box; padding: 8px;
        border: 1px solid #ccc; border-radius: 6px; outline: none;
    }
    #aiInput:focus { border-color: #c0392b; }
  `;
  document.head.appendChild(style);

  // HTML Nội dung
  dragItem.innerHTML = `
    <header id="dragHeader" style="
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: linear-gradient(135deg, #c0392b, #e74c3c);
      color: white;
    ">
      <div>
        <div style="font-weight:700;font-size:14px;line-height:1;">Hỗ trợ học tập</div>
        <div style="font-size:11px;opacity:0.85;">By minhh</div>
      </div>
      <button id="closeBtn" style="
        background: rgba(255,255,255,0.2); border: none; color: white;
        width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-size: 16px;
      ">×</button>
    </header>

    <div class="tab-bar">
      <button class="tab-btn active" onclick="switchTab('tabMain', this)">Main</button>
      <button class="tab-btn" onclick="switchTab('tabAuto', this)">Auto</button>
      <button class="tab-btn" onclick="switchTab('tabAI', this)">Search</button>
    </div>

    <div id="tabMain" class="tab-content active">
        <h3 style="margin: 0; color: #c0392b;">Yo</h3>
        <p style="font-size: 13px; line-height: 1.4; color: #444;">
            Chào mừng bạn đến với "công cụ" hỗ trợ học tập.<br>
            - <b>Tab Auto:</b> Các chức năng giúp bạn biết đáp án.<br>
            - <b>Tab Search:</b> Tìm kiếm những câu hỏi khó hoặc "Auto" ko thể giúp bạn ( do chưa biết làm A.I nên làm tab này chức:) ).
        </p>
        <div style="font-size: 11px; color: #888; text-align: right; margin-top: 10px;">29/1/2026- By minhh</div>
    </div>

    <div id="tabAuto" class="tab-content">
      <button id="runBtn" class="customBtn">Auto full điểm</button>
      <button id="highlightBtn" class="customBtn">Highlight đáp án</button>
    </div>

    <div id="tabAI" class="tab-content">
        <div id="aiResponse"><i>Đang chờ câu hỏi</i></div>
        <input type="text" id="aiInput" placeholder="Nhập câu hỏi...">
        <button id="askAiBtn" class="customBtn">Gửi câu hỏi</button>
    </div>
  `;

  document.body.appendChild(dragItem);

  // 2. XỬ LÝ CHUYỂN TAB
  window.switchTab = (tabId, btn) => {
    // Ẩn hết content
    dragItem.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Bỏ active button cũ
    dragItem.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Hiện cái mới
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
  };

  // 3. CSS CHO NÚT BẤM (GIỮ NGUYÊN CODE CŨ)
  const btns = dragItem.querySelectorAll(".customBtn");
  btns.forEach(btn => {
    btn.style.cssText = `
      width: 100%; padding: 11px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #c0392b, #e74c3c);
      color: white; font-size: 14px; cursor: pointer; font-weight: 600;
      box-shadow: 0 4px 12px rgba(192,57,43,0.45);
      transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
    `;
    const on = () => {
      btn.style.transform = "translateY(-1px)";
      btn.style.filter = "brightness(1.08)";
      btn.style.boxShadow = "0 6px 16px rgba(192,57,43,0.6)";
    };
    const off = () => {
      btn.style.transform = "none";
      btn.style.filter = "none";
      btn.style.boxShadow = "0 4px 12px rgba(192,57,43,0.45)";
    };
    btn.addEventListener("mouseenter", on);
    btn.addEventListener("mouseleave", off);
    btn.addEventListener("mousedown", on);
    btn.addEventListener("mouseup", off);
  });

  // 4. XỬ LÝ KÉO THẢ (DRAG) - GIỮ NGUYÊN
  const header = document.getElementById('dragHeader');
  const closeBtn = document.getElementById('closeBtn');

  let active = false, currentX = 0, currentY = 0;
  let initialX = 0, initialY = 0, xOffset = 0, yOffset = 0;

  const dragStart = e => {
    active = true;
    const evt = e.touches ? e.touches[0] : e;
    initialX = evt.clientX - xOffset;
    initialY = evt.clientY - yOffset;
  };
  const dragMove = e => {
    if (!active) return;
    const evt = e.touches ? e.touches[0] : e;
    currentX = evt.clientX - initialX;
    currentY = evt.clientY - initialY;
    dragItem.style.transform = `translate(${currentX}px, ${currentY}px)`;
  };
  const dragEnd = () => {
    active = false;
    xOffset = currentX;
    yOffset = currentY;
  };

  header.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
  header.addEventListener('touchstart', dragStart, { passive: true });
  document.addEventListener('touchmove', dragMove, { passive: true });
  document.addEventListener('touchend', dragEnd);
  closeBtn.onclick = () => dragItem.remove();

  // 5. LOGIC TAB 2: AUTO & HIGHLIGHT (CODE GỐC CỦA BẠN)
  
  // === AUTO FULL ĐIỂM ===
  document.getElementById('runBtn').onclick = async () => {
    try {
      const iframe = document.querySelector('iframe');
      const doc = iframe?.contentDocument || document;
      const alternatives = doc.querySelectorAll('.h5p-sc-alternatives .h5p-sc-alternative');

      if (!alternatives.length) return alert('Không tìm thấy câu trả lời!');

      const simulateClick = el => {
        ['mousedown', 'mouseup', 'click'].forEach(t =>
          el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true }))
        );
        requestAnimationFrame(() => el.click());
      };

      let found = false;
      alternatives.forEach(el => {
        if (el.classList.contains('h5p-sc-is-correct')) {
          simulateClick(el);
          el.style.outline = "3px solid #00ff80";
          found = true;
        }
      });
      if (!found) console.warn("Không tìm thấy đáp án đúng");
    } catch (err) { console.error('Lỗi:', err); }
  };

  // === HIGHLIGHT GIỐNG CODE CŨ ===
  let highlightActive = false;
  const highlightBtn = document.getElementById('highlightBtn');

  highlightBtn.onclick = () => {
    try {
      const iframe = document.querySelector('iframe');
      const doc = iframe?.contentDocument || document;
      const corrects = doc.querySelectorAll('.h5p-sc-alternatives .h5p-sc-alternative.h5p-sc-is-correct');

      if (!corrects.length) return alert('Không có đáp án đúng nào!');

      highlightActive = !highlightActive;

      if (highlightActive) {
        corrects.forEach(el => {
          el.dataset.oldStyle = el.getAttribute("style") || "";
          el.style.transition = "all 0.3s ease";
          el.style.boxShadow = "0 0 15px 3px #00ff80";
          el.style.border = "2px solid #00ff80";
          el.style.background = "rgba(0,255,128,0.2)";
        });
        highlightBtn.style.background = "#b71c1c";
        highlightBtn.dataset.active = "true";
      } else {
        corrects.forEach(el => {
          el.setAttribute("style", el.dataset.oldStyle);
          delete el.dataset.oldStyle;
        });
        highlightBtn.style.background = "linear-gradient(135deg, #c0392b, #e74c3c)";
        delete highlightBtn.dataset.active;
      }
    } catch (err) { console.error('Lỗi highlight:', err); }
  };

  // 6. LOGIC TAB 3: A.I (MỚI)
  document.getElementById('askAiBtn').onclick = () => {
      const input = document.getElementById('aiInput');
      const output = document.getElementById('aiResponse');
      const question = input.value.trim();

      if (!question) return;

      // Hiển thị câu hỏi của user
      output.innerHTML += `<div style="margin-top:5px; color:#c0392b;"><b>Bạn:</b> ${question}</div>`;
      output.innerHTML += `<div style="color:#666;"><b>Searcher:</b> Đang tìm kiếm...</div>`;
      output.scrollTop = output.scrollHeight;

      // Logic giả lập AI (Mở Google Search vì không có API Key)
      setTimeout(() => {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(question)}`, '_blank');
          output.lastElementChild.innerHTML = `<b>Searcher:</b> Đã mở kết quả tìm kiếm cho: "${question}"`;
          input.value = ""; // Xóa ô nhập
      }, 500);
  };

})();
