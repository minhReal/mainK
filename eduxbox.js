(() => {
  if (document.getElementById('eduxWrap')) return;

  const css = document.createElement('style');
  css.textContent = `
    #eduxWrap{position:fixed;top:70px;left:20px;z-index:2147483647;font-family:"Segoe UI",sans-serif;width:200px;}
    #eduxBox{background:#fff;border-radius:14px;box-shadow:0 10px 32px rgba(0,0,0,0.18);border:1px solid #ddd;overflow:hidden;}
    #eduxHead{background:linear-gradient(135deg,#1565c0,#1e88e5);padding:10px 12px;display:flex;align-items:center;justify-content:space-between;cursor:grab;touch-action:none;}
    #eduxHead:active{cursor:grabbing;}
    #eduxHeadTitle{color:#fff;font-weight:700;font-size:13px;pointer-events:none;}
    #eduxMinBtn{background:rgba(255,255,255,0.2);border:none;color:#fff;width:26px;height:26px;border-radius:6px;cursor:pointer;font-size:14px;}
    .etab-bar{display:flex;background:#f5f5f5;padding:6px 8px;gap:4px;border-bottom:1px solid #e0e0e0;}
    .etab-btn{flex:1;padding:7px 4px;border:none;border-radius:8px;background:transparent;cursor:pointer;font-weight:600;font-size:12px;color:#888;transition:all 0.2s;}
    .etab-btn.on{background:#1565c0;color:#fff;box-shadow:0 2px 8px rgba(21,101,192,0.35);}
    .etab{display:none;padding:12px;flex-direction:column;gap:8px;}
    .etab.on{display:flex;}
    .ebtn{width:100%;padding:10px;border:none;border-radius:10px;background:linear-gradient(135deg,#1565c0,#1e88e5);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.25s,box-shadow 0.25s,transform 0.1s;box-shadow:0 3px 10px rgba(21,101,192,0.3);}
    .ebtn:active{transform:scale(0.97);}
    .ebtn.active{background:linear-gradient(135deg,#27ae60,#2ecc71)!important;box-shadow:0 0 0 3px rgba(46,204,113,0.4)!important;}
    #eduxLog{height:160px;overflow-y:auto;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:8px;font-size:11px;line-height:1.7;}
    .el-g{color:#27ae60;font-weight:600;}
    .el-y{color:#e67e22;}
    .el-r{color:#e74c3c;}
    .el-b{color:#1565c0;}
    .eloop-row{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#555;}
    .eswitch{position:relative;display:inline-block;width:34px;height:20px;}
    .eswitch input{opacity:0;width:0;height:0;}
    .eslider{position:absolute;cursor:pointer;inset:0;background:#ccc;border-radius:34px;transition:.3s;}
    .eslider:before{position:absolute;content:"";height:14px;width:14px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s;}
    input:checked+.eslider{background:#1565c0;}
    input:checked+.eslider:before{transform:translateX(14px);}
    .ebar{height:4px;background:#eee;border-radius:2px;}
    .ebar-fill{height:100%;background:linear-gradient(90deg,#1565c0,#1e88e5);border-radius:2px;width:0%;transition:width 0.3s;}
  `;
  document.head.appendChild(css);

  const wrap = document.createElement('div');
  wrap.id = 'eduxWrap';
  wrap.innerHTML = `
    <div id="eduxBox">
      <div id="eduxHead">
        <span id="eduxHeadTitle">&#9889; Eduxbox Hack</span>
        <button id="eduxMinBtn">&#8722;</button>
        <button id="eduxCloseBtn" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:26px;height:26px;border-radius:6px;cursor:pointer;font-size:14px;">&#10005;</button>
      </div>
      <div id="eduxBody">
        <div class="etab-bar">
          <button class="etab-btn on" onclick="eduxTab('eTabMain',this)">Main</button>
          <button class="etab-btn" onclick="eduxTab('eTabAuto',this)">Auto</button>
        </div>
        <div id="eTabMain" class="etab on">
          <div style="font-size:12px;color:#333;line-height:2.1;">
            <div>&#8226; Scan silent → biết đáp án đúng</div>
            <div>&#8226; Chọn thẳng đáp án đúng → nộp</div>
            <div>&#8226; Tự động sang bài tiếp (loop)</div>
            <div style="color:#aaa;font-size:11px;">Phím <b>F</b> ẩn/hiện</div>
          </div>
        </div>
        <div id="eTabAuto" class="etab">
          <div class="eloop-row">
            <span>Tự động loop</span>
            <label class="eswitch"><input type="checkbox" id="eLoopToggle" checked><span class="eslider"></span></label>
          </div>
          <button class="ebtn" id="eStartBtn">&#9654; Bắt đầu</button>
          <div class="ebar"><div class="ebar-fill" id="eBarFill"></div></div>
          <div id="eduxLog"><i style="color:#aaa">Chưa chạy...</i></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  window.eduxTab = (id, btn) => {
    document.querySelectorAll('.etab').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.etab-btn').forEach(b => b.classList.remove('on'));
    document.getElementById(id).classList.add('on');
    btn.classList.add('on');
  };

  
  const head = document.getElementById('eduxHead');
  let dragging=false,sx=0,sy=0,il=0,it=0;
  const ds=(px,py)=>{dragging=true;sx=px;sy=py;const r=wrap.getBoundingClientRect();il=r.left;it=r.top;};
  const dm=(px,py)=>{if(!dragging)return;wrap.style.left=Math.max(0,Math.min(window.innerWidth-210,il+(px-sx)))+'px';wrap.style.top=Math.max(0,Math.min(window.innerHeight-60,it+(py-sy)))+'px';};
  const de=()=>dragging=false;
  head.addEventListener('mousedown',e=>{if(!e.target.closest('button'))ds(e.clientX,e.clientY);});
  window.addEventListener('mousemove',e=>dm(e.clientX,e.clientY));
  window.addEventListener('mouseup',de);
  head.addEventListener('touchstart',e=>{if(!e.target.closest('button')){const t=e.touches[0];ds(t.clientX,t.clientY);}},{passive:true});
  window.addEventListener('touchmove',e=>{if(!dragging)return;e.preventDefault();dm(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
  window.addEventListener('touchend',de);

  let bodyOn=true;
  document.getElementById('eduxMinBtn').onclick=()=>{bodyOn=!bodyOn;document.getElementById('eduxBody').style.display=bodyOn?'':'none';document.getElementById('eduxMinBtn').textContent=bodyOn?'\u2212':'+';};
  document.getElementById('eduxCloseBtn').onclick=()=>{running=false;wrap.remove();};
  document.addEventListener('keydown',e=>{if(e.key==='F'&&!e.ctrlKey&&!e.altKey&&!['INPUT','TEXTAREA'].includes(e.target.tagName))wrap.style.display=wrap.style.display==='none'?'':'none';});

  const logEl = document.getElementById('eduxLog');
  const barFill = document.getElementById('eBarFill');
  function addLog(msg,type){const d=document.createElement('div');d.className=type==='g'?'el-g':type==='y'?'el-y':type==='r'?'el-r':type==='b'?'el-b':'';d.textContent=msg;logEl.appendChild(d);logEl.scrollTop=logEl.scrollHeight;}

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let running = false;

  function simulateClick(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left+rect.width/2, y = rect.top+rect.height/2;
    try {
      ['mousedown','mouseup','click'].forEach(ev =>
        el.dispatchEvent(new MouseEvent(ev,{bubbles:true,cancelable:true,clientX:x,clientY:y}))
      );
    } catch { el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); }
  }

  async function handlePopup() {
    const btns = document.querySelectorAll('body .ui-dialog-buttonpane button');
    if (!btns||!btns.length) return;
    for (const btn of btns) {
      if (btn.offsetParent!==null) {
        btn.scrollIntoView({behavior:'smooth',block:'center'});
        await sleep(300); simulateClick(btn);
        addLog('Đóng popup','y'); await sleep(500);
      }
    }
  }

  async function clickNext() {
    const span = Array.from(document.querySelectorAll('span.sequence-nav-button-label'))
      .find(el => el.textContent.trim().toUpperCase()==='NEXT');
    if (span) {
      const btn = span.closest('button')||span;
      btn.scrollIntoView({behavior:'smooth',block:'center'});
      await sleep(500); simulateClick(btn);
      addLog('Chuyển bài tiếp...','g');
      if (document.getElementById('eLoopToggle').checked) {
        await sleep(1200);
        if (running) autoRun();
      }
    } else {
      addLog('Hết bài / Không có NEXT','r');
      running=false;
      document.getElementById('eStartBtn').classList.remove('active');
      document.getElementById('eStartBtn').textContent='\u25B6 Bắt đầu';
    }
  }

  
  async function scanCorrectChoice(courseId, blockId, probId, choices) {
    const csrf = document.cookie.match(/csrftoken=([^;]+)/)?.[1]||'';
    const url = '/courses/'+courseId+'/xblock/'+encodeURIComponent(blockId)+'/handler/xmodule_handler/problem_check';
    addLog('Scan '+choices.length+' đáp án...','b');
    barFill.style.width='0%';

    for (let i=0; i<choices.length; i++) {
      if (!running) return null;
      const cv = choices[i].value;
      const body = new URLSearchParams();
      body.append('input_'+probId, cv);
      try {
        const res = await fetch(url,{method:'POST',credentials:'include',
          headers:{'Content-Type':'application/x-www-form-urlencoded','X-CSRFToken':csrf},
          body:body.toString()});
        const d = await res.json();
        const isOk = d.success==='correct'||d.correct==='correct'||d.success===true||d.correct===true;
        barFill.style.width=((i+1)/choices.length*100)+'%';
        if (isOk) {
          addLog('Tìm thấy đáp án đúng: '+(i+1),'g');
          return choices[i];
        }
      } catch(e) { addLog('Scan lỗi: '+e.message,'r'); }
    }
    return null;
  }

  async function autoRun() {
    if (!running) return;

    const correctSpanCheck = document.querySelector('[id^="inputtype_"]')?.querySelector('span.status.correct');
    if (correctSpanCheck) { addLog('Đã đúng - next','g'); await clickNext(); return; }

    const container = Array.from(document.querySelectorAll('[id^="inputtype_"]')).find(el=>el.id.includes('_2_1'));
    if (!container) { addLog('Không tìm thấy container','r'); return; }

    const fieldset = container.querySelector('fieldset');
    if (!fieldset) { addLog('Không tìm thấy fieldset','r'); return; }

    const opts = Array.from(fieldset.querySelectorAll('input[type="radio"],input[type="checkbox"]'));
    if (!opts.length) { addLog('Không có lựa chọn','r'); return; }

    
    const probBlock = document.querySelector('[data-block-type="problem"],[data-usage-id*="type@problem"]');
    const courseId = probBlock?.dataset?.courseId
      || location.href.match(/courses\/([^/?#]+)/)?.[1];
    const blockId = probBlock?.dataset?.usageId
      || ('block-v1:' + courseId + '+type@problem+block@' + container.id.replace('inputtype_','').replace('_2_1',''));
    if (!courseId||!blockId) { addLog('Không đọc được course/block ID','r'); return; }
    const probId   = container.id.replace('inputtype_','');

    
    const correctInput = await scanCorrectChoice(courseId, blockId, probId, opts);
    if (!running) return;

    if (!correctInput) {
      addLog('Không tìm được đáp án đúng!','r');
      return;
    }

    
    simulateClick(correctInput);
    addLog('Chọn đáp án đúng!','g');
    await sleep(400);

    
    const submitBtn = document.querySelector('#ws-problem-container .submit-attempt-container > button');
    if (!submitBtn) { addLog('Không tìm thấy nút submit','r'); return; }
    simulateClick(submitBtn);
    addLog('Nộp bài...','b');

    await sleep(1200);
    await handlePopup();
    await sleep(1000);

    
    if (running) await clickNext();
  }

  document.getElementById('eStartBtn').onclick = function() {
    running = !running;
    if (running) {
      logEl.innerHTML=''; barFill.style.width='0%';
      addLog('Bắt đầu...','b');
      this.classList.add('active');
      this.textContent='\u23F8 Dừng lại';
      autoRun();
    } else {
      this.classList.remove('active');
      this.textContent='\u25B6 Bắt đầu';
      addLog('Đã dừng.','r');
    }
  };
})();
