// ờ, skibidi //

(() => {
  if (document.getElementById("draggableUI")) return;

  const dragItem = document.createElement('div');
  dragItem.id = 'draggableUI';
  dragItem.style.cssText = `
    position: fixed;
    top: 70px;
    left: 70px;
    width: 260px;
    background: #ffffff;
    color: #2b2b2b;
    border-radius: 14px;
    z-index: 999999;
    user-select: none;
    touch-action: none;
    box-shadow: 0 10px 28px rgba(160,0,0,0.25);
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
  `;

  dragItem.innerHTML = `
    <header id="dragHeader" style="
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: linear-gradient(135deg, #c0392b, #e74c3c);
      border-radius: 14px 14px 0 0;
      color: white;
    ">
      <div>
        <div style="font-weight:700;font-size:14px;line-height:1;">Hỗ trợ học tập</div>
        <div style="font-size:11px;opacity:0.85;">By minh</div>
      </div>

      <button id="closeBtn" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
      ">×</button>
    </header>

    <div style="padding:14px;display:flex;flex-direction:column;gap:10px;">
      <button id="runBtn" class="customBtn">Auto full điểm</button>
      <button id="highlightBtn" class="customBtn">Highlight đáp án</button>
    </div>
  `;

  document.body.appendChild(dragItem);

  const btns = dragItem.querySelectorAll(".customBtn");
  btns.forEach(btn => {
    btn.style.cssText = `
      width: 100%;
      padding: 11px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #c0392b, #e74c3c);
      color: white;
      font-size: 14px;
      cursor: pointer;
      font-weight: 600;
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
    btn.addEventListener("touchstart", on, { passive: true });
    btn.addEventListener("touchend", off);
  });

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

  // === AUTO FULL ĐIỂM ===
  document.getElementById('runBtn').onclick = async () => {
    try {
      const iframe = document.querySelector('iframe');
      const doc = iframe?.contentDocument || document;
      const alternatives = doc.querySelectorAll(
        '.h5p-sc-alternatives .h5p-sc-alternative'
      );

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
    } catch (err) {
      console.error('Lỗi:', err);
    }
  };

  // === HIGHLIGHT GIỐNG CODE CŨ ===
  let highlightActive = false;
  const highlightBtn = document.getElementById('highlightBtn');

  highlightBtn.onclick = () => {
    try {
      const iframe = document.querySelector('iframe');
      const doc = iframe?.contentDocument || document;

      const corrects = doc.querySelectorAll(
        '.h5p-sc-alternatives .h5p-sc-alternative.h5p-sc-is-correct'
      );

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

        highlightBtn.style.background =
          "linear-gradient(135deg, #c0392b, #e74c3c)";
        delete highlightBtn.dataset.active;
      }
    } catch (err) {
      console.error('Lỗi highlight:', err);
    }
  };
})();
