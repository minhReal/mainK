// m làm j ở đây? //

(() => {
  // Tạo GUI
  const dragItem = document.createElement('div');
  dragItem.id = 'draggableUI';
  dragItem.style.cssText = `
    position: fixed; top:50px; left:50px; width:250px;
    background:#2c3e50; color:white; padding:10px; border-radius:10px;
    z-index:9999; user-select:none; touch-action:none; box-shadow:0 4px 10px rgba(0,0,0,0.3);
  `;
  dragItem.innerHTML = `
    <header style="cursor:grab; display:flex; justify-content:space-between; align-items:center; background:#34495e; padding:5px; border-radius:8px; font-weight:bold;">
      <span>Đá quả lọ đê</span>
      <button id="closeBtn" style="background:red;border:none;color:white;width:25px;height:25px;border-radius:4px;cursor:pointer;">×</button>
    </header>
    <button id="runBtn" style="width:100%;margin-top:10px;padding:10px;border:none;border-radius:5px;background:#1abc9c;color:white;font-size:16px;cursor:pointer;">Click 4 full điểm</button>
  `;
  document.body.appendChild(dragItem);

  const header = dragItem.querySelector('header');
  const closeBtn = document.getElementById('closeBtn');

  // Drag system
  let active=false, currentX=0, currentY=0, initialX=0, initialY=0, xOffset=0, yOffset=0;
  const dragStart = e => { active=true; initialX=(e.touches?e.touches[0].clientX:e.clientX)-xOffset; initialY=(e.touches?e.touches[0].clientY:e.clientY)-yOffset; e.preventDefault(); }
  const dragMove = e => { if(!active)return; currentX=(e.touches?e.touches[0].clientX:e.clientX)-initialX; currentY=(e.touches?e.touches[0].clientY:e.clientY)-initialY; dragItem.style.transform=`translate(${currentX}px,${currentY}px)`; }
  const dragEnd = e => { active=false; xOffset=currentX; yOffset=currentY; }
  header.addEventListener('mousedown', dragStart); header.addEventListener('mousemove', dragMove); header.addEventListener('mouseup', dragEnd); header.addEventListener('mouseleave', dragEnd);
  header.addEventListener('touchstart', dragStart); header.addEventListener('touchmove', dragMove); header.addEventListener('touchend', dragEnd);

  // Close button
  closeBtn.addEventListener('click', ()=>dragItem.remove());

  // Executor
  document.getElementById('runBtn').addEventListener('click',()=>{
    (async()=>{
      try{
        const iframe=document.querySelector('iframe');
        const doc=iframe?.contentDocument||document;
        const alternatives=doc.querySelectorAll('.h5p-sc-alternatives .h5p-sc-alternative');
        if(!alternatives.length) return console.error('🔴 Không tìm thấy câu trả lời!');
        const simulateClick=el=>{
          ['touchstart','touchend'].forEach(t=>el.dispatchEvent(new TouchEvent(t,{bubbles:true,cancelable:true})));
          ['mousedown','mouseup','click'].forEach(t=>el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true})));
          requestAnimationFrame(()=>el.click());
        }
        let found=false;
        alternatives.forEach(el=>{
          if(el.classList.contains('h5p-sc-is-correct')){
            simulateClick(el);
            found=true;
            console.log('🟢 Click đáp án:',el.textContent.trim());
          }
        });
        if(!found) console.warn('🟡 Chưa tìm thấy đáp án đúng');
      }catch(err){ console.error('🔴 Lỗi:',err);}
    })();
  });
})();
