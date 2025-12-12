// m làm j ở đây? //

(() => {
  if (document.getElementById("draggableUI")) return;

  const dragItem = document.createElement('div');
  dragItem.id = 'draggableUI';
  dragItem.style.cssText = `
    position: fixed; top: 60px; left: 60px; width: 260px;
    background: #2c3e50; color: white; border-radius: 10px;
    z-index: 999999; user-select: none; touch-action: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-family: sans-serif;
  `;
  dragItem.innerHTML = `
    <header id="dragHeader" style="cursor:grab; display:flex; justify-content:space-between; align-items:center; background:#34495e; padding:6px 10px; border-radius:10px 10px 0 0;">
      <span style="text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;">
        By minh <span style="font-size:11px; color:#ccc; opacity:0.6;">(làm chậm thôi)</span>
      </span>
      <button id="closeBtn" style="background:red;border:none;color:white;width:25px;height:25px;border-radius:5px;cursor:pointer;font-size:16px;">×</button>
    </header>
    <div style="padding:10px; display:flex; flex-direction:column; gap:8px;">
      <button id="runBtn" class="customBtn">Auto full điểm</button>
      <button id="highlightBtn" class="customBtn">Highlight đáp án</button>
    </div>
  `;
  document.body.appendChild(dragItem);

  const btns = dragItem.querySelectorAll(".customBtn");
  btns.forEach(btn => {
    btn.style.cssText = `
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: #1abc9c;
      color: white;
      font-size: 15px;
      cursor: pointer;
      font-weight: bold;
      text-shadow: -1px -1px 0 #000, 1px -1px 0 #000,
                   -1px 1px 0 #000, 1px 1px 0 #000;
      transition: transform 0.12s ease, filter 0.12s ease;
    `;

    const zoomIn = () => {
      btn.style.transform = "scale(1.05)";
      btn.style.filter = "brightness(1.1)";
    };
    const zoomOut = () => {
      btn.style.transform = "scale(1)";
      btn.style.filter = "brightness(1)";
    };

    btn.addEventListener("mouseenter", zoomIn);
    btn.addEventListener("mouseleave", zoomOut);

    btn.addEventListener("touchstart", zoomIn, { passive: true });
    btn.addEventListener("touchend", zoomOut);
    btn.addEventListener("touchcancel", zoomOut);

    btn.addEventListener("mousedown", zoomIn);
    btn.addEventListener("mouseup", zoomOut);
    btn.addEventListener("mouseleave", zoomOut);
  });

  const header = document.getElementById('dragHeader');
  const closeBtn = document.getElementById('closeBtn');
  let active = false, currentX = 0, currentY = 0, initialX = 0, initialY = 0, xOffset = 0, yOffset = 0;

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

  document.getElementById('runBtn').onclick = async () => {
    try {
      const iframe = document.querySelector('iframe');
      const doc = iframe?.contentDocument || document;
      const alternatives = doc.querySelectorAll('.h5p-sc-alternatives .h5p-sc-alternative');
      if (!alternatives.length) return alert('Không tìm thấy câu trả lời!');

      const simulateClick = el => {
        ['mousedown', 'mouseup', 'click'].forEach(t => {
          el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true }));
        });
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

      if (found) console.log("");
      else console.warn("⚠️ Không tìm thấy đáp án đúng!");
    } catch (err) {
      console.error('Lỗi:', err);
    }
  };

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
          el.style.transition = "all 0.3s";
          el.style.boxShadow = "0 0 15px 3px #00ff80";
          el.style.border = "2px solid #00ff80";
          el.style.background = "rgba(0,255,128,0.2)";
        });
        highlightBtn.style.background = "#e74c3c";
        highlightBtn.dataset.active = "true";
      } else {
        corrects.forEach(el => el.setAttribute("style", el.dataset.oldStyle));
        highlightBtn.style.background = "#1abc9c";
        delete highlightBtn.dataset.active;
      }
    } catch (err) {
      console.error('Lỗi highlight:', err);
    }
  };
})();
