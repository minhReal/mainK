(() => {
  if (document.getElementById("draggableUI")) return;

  let isHighlightActive = false;
  let allResults = [];

  function getIframeDocs() {
    const docs = [document];
    document.querySelectorAll('iframe').forEach(f => {
      try { if (f.contentDocument) docs.push(f.contentDocument); } catch(e) {}
    });
    return docs;
  }

  function queryAll(selector) {
    let els = [];
    getIframeDocs().forEach(d => els = els.concat(Array.from(d.querySelectorAll(selector))));
    return els;
  }

  function forceSelectElement(el) {
    el.click();
    if (el.tagName === 'INPUT') el.checked = true;
    ['mousedown','mouseup','touchstart','touchend','change','input'].forEach(name => {
      const ev = ['mousedown','mouseup','click'].includes(name)
        ? new MouseEvent(name, {view:window,bubbles:true,cancelable:true})
        : new Event(name, {bubbles:true,cancelable:true});
      el.dispatchEvent(ev);
    });
  }

  function fillInput(inputEl, value) {
    const iWin = inputEl.ownerDocument.defaultView || window;
    const nativeSetter = Object.getOwnPropertyDescriptor(iWin.HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) nativeSetter.call(inputEl, value);
    else inputEl.value = value;
    inputEl.dispatchEvent(new iWin.Event('input', {bubbles:true}));
    inputEl.dispatchEvent(new iWin.Event('change', {bubbles:true}));
    inputEl.dispatchEvent(new iWin.KeyboardEvent('keyup', {bubbles:true}));
  }

  function norm(s) {
    return (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function clickAnswerByText(text) {
    if (!text) return;
    const target = norm(text);

    const candidates = [];
    getIframeDocs().forEach(doc => {
      doc.querySelectorAll('li.h5p-answer').forEach(li => {
        const inner = li.querySelector('.h5p-alternative-inner');
        candidates.push({ el: li, text: norm(inner ? inner.innerText : li.innerText) });
      });
      doc.querySelectorAll('li.h5p-sc-alternative').forEach(li => {
        const lbl = li.querySelector('.h5p-sc-label');
        candidates.push({ el: li, text: norm(lbl ? lbl.innerText : li.innerText) });
      });
    });

    if (!candidates.length) {
      console.warn('[H5P] Không có candidate nào');
      return;
    }

    let match = candidates.find(c => c.text === target);

    if (!match) {
      match = candidates.find(c => c.text.includes(target) || target.includes(c.text));
    }

    if (match) {
      forceSelectElement(match.el);
    } else {
      console.warn('[H5P] Không tìm được:', JSON.stringify(text),
        '| Candidates:', candidates.map(c => c.text).join(' / '));
    }
  }

  function showConfirmModal(questions, onConfirm) {
    document.getElementById('lmsConfirmModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'lmsConfirmModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",sans-serif;';

    const choiceMap = {};
    let innerHtml = `
      <div style="background:#fff;border-radius:14px;padding:20px;max-width:420px;width:90vw;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="font-weight:700;font-size:15px;color:#c0392b;margin-bottom:12px;border-bottom:2px solid #eee;padding-bottom:8px;">
          ✅ Xác nhận đáp án trước khi chọn
        </div>
    `;

    questions.forEach((q, idx) => {
      innerHtml += `<div style="margin-bottom:14px;padding:10px;border:1px solid #eee;border-radius:8px;background:#fdfdfd;">`;
      innerHtml += `<div style="font-weight:600;font-size:12px;color:#333;margin-bottom:8px;">${idx+1}. ${q.qText.substring(0,80)}${q.qText.length>80?'...':''}</div>`;

      if (q.type === 'choice') {
        q.options.forEach((o, oi) => {
          const checked = o.correct ? 'checked' : '';
          const color = o.correct ? '#e8f8f5' : '#fff';
          const border = o.correct ? '1px solid #16a085' : '1px solid #ddd';
          innerHtml += `<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;border-radius:5px;background:${color};border:${border};margin-bottom:4px;cursor:pointer;font-size:12px;">
            <input type="radio" name="q${idx}" value="${oi}" ${checked} style="margin-top:2px;flex-shrink:0;">
            <span><b>${String.fromCharCode(65+oi)}.</b> ${o.text}</span>
          </label>`;
        });
      } else if (q.type === 'fill') {
        innerHtml += `<div style="font-size:12px;color:#555;margin-bottom:4px;">Đáp án cần điền:</div>`;
        q.blanks.forEach((b, bi) => {
          innerHtml += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="font-size:11px;color:#888;flex-shrink:0;">Ô ${bi+1}:</span>
            <input type="text" data-qidx="${idx}" data-bidx="${bi}" value="${b.answer}" 
              style="flex:1;padding:5px 8px;border:1px solid #16a085;border-radius:4px;font-size:12px;background:#e8f8f5;">
          </div>`;
        });
      }
      innerHtml += `</div>`;
    });

    innerHtml += `
        <div style="display:flex;gap:10px;margin-top:10px;">
          <button id="modalCancelBtn" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;font-size:13px;">Huỷ</button>
          <button id="modalConfirmBtn" style="flex:1;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#c0392b,#e74c3c);color:#fff;cursor:pointer;font-size:13px;font-weight:600;">Auto?</button>
        </div>
      </div>
    `;

    modal.innerHTML = innerHtml;
    document.body.appendChild(modal);

    document.getElementById('modalCancelBtn').onclick = () => modal.remove();
    document.getElementById('modalConfirmBtn').onclick = () => {
      const finalChoices = questions.map((q, idx) => {
        if (q.type === 'choice') {
          const selected = modal.querySelector(`input[name="q${idx}"]:checked`);
          const oi = selected ? parseInt(selected.value) : -1;
          return { ...q, selectedOption: oi >= 0 ? q.options[oi] : null };
        } else if (q.type === 'fill') {
          const blanks = [];
          modal.querySelectorAll(`input[data-qidx="${idx}"]`).forEach(inp => {
            blanks.push({ ...q.blanks[parseInt(inp.dataset.bidx)], answer: inp.value });
          });
          return { ...q, blanks };
        }
        return q;
      });
      modal.remove();
      onConfirm(finalChoices);
    };
  }

  function hackLmsDirect() {
    const lmsOutput = document.getElementById('lmsResponse');
    lmsOutput.innerHTML = '<i>Đang setup...</i>';
    allResults = [];

    getIframeDocs().forEach(doc => {
      let h5pData = null;
      try {
        const win = doc.defaultView || doc.parentWindow;
        if (win && win.H5PIntegration) h5pData = win.H5PIntegration;
      } catch(e) {}

      if (!h5pData) {
        doc.querySelectorAll('script').forEach(s => {
          if (h5pData) return;
          const txt = s.textContent;
          const m = txt.match(/H5PIntegration\s*=\s*(\{[\s\S]+?\});\s*(?:\/\/|$|\n)/);
          if (m) { try { h5pData = JSON.parse(m[1]); } catch(e) {} }
          if (!h5pData && txt.includes('H5PIntegration')) {
            const m2 = txt.match(/H5PIntegration\s*=\s*(\{[\s\S]+\})/);
            if (m2) { try { h5pData = JSON.parse(m2[1]); } catch(e) {} }
          }
        });
      }

      if (h5pData) {
        Object.values(h5pData.contents || {}).forEach(content => {
          try {
            let p = content.jsonContent;
            if (typeof p === 'string') p = JSON.parse(p);

            if (p.questions && Array.isArray(p.questions) && typeof p.questions[0] === 'string') {
              let blankIndex = 0;
              p.questions.forEach((qHtml, qi) => {
                const rawText = qHtml.replace(/<[^>]+>/g, '');
                const cleanRaw = rawText.replace(/^\d+\.\s*/, '');
                const starIdx = cleanRaw.indexOf('*');
                const firstDotIdx = cleanRaw.indexOf('.');

                let questionLine, preview;

                if (firstDotIdx >= 0 && firstDotIdx < starIdx) {
                  questionLine = cleanRaw.substring(0, firstDotIdx).trim();
                  const afterDot = cleanRaw.substring(firstDotIdx + 1).trim();
                  preview = afterDot.replace(/\*[^*]+\*/g, '___').trim();
                } else {
                  const withoutHint = cleanRaw.replace(/\s*\([^)]+\)\s*$/, '').trim();
                  questionLine = withoutHint.replace(/\*[^*]+\*/g, '___').trim();
                  preview = questionLine;
                }

                const matches = [...cleanRaw.matchAll(/\*([^*]+)\*/g)];
                const blanks = matches
                  .map(m => ({ answer: m[1].trim(), globalIndex: blankIndex++ }))
                  .filter(b => b.answer);

                if (blanks.length > 0) {
                  allResults.push({
                    type: 'fill',
                    qText: questionLine,
                    fillPreview: preview,
                    blanks: blanks
                  });
                }
              });
              return;
            }

            const extractQ = (obj, depth) => {
              if (!obj || typeof obj !== 'object' || depth > 10) return;
              if (Array.isArray(obj)) {
                if (obj.length && obj[0]?.answers && Array.isArray(obj[0].answers)) {
                  obj.forEach((q, qi) => {
                    if (!q.answers) return;
                    const qText = (q.question || q.text || ('Câu '+(qi+1))).replace(/<[^>]+>/g,'').trim();
                    const opts = q.answers.map((a, i) => ({
                      label: String.fromCharCode(65+i),
                      text: (a.text||a.answer||'').replace(/<[^>]+>/g,'').trim(),
                      correct: a.correct === true
                    })).filter(o => o.text);
                    if (opts.length) allResults.push({type:'choice', qText, options: opts});
                  });
                  return;
                }
                obj.forEach(v => extractQ(v, depth+1));
                return;
              }
              if (obj.answers && Array.isArray(obj.answers) && !obj.answers[0]?.answers) {
                const hasCorrect = obj.answers.some(a => 'correct' in a);
                if (hasCorrect) {
                  const qText = (obj.question||obj.text||'').replace(/<[^>]+>/g,'').trim();
                  const opts = obj.answers.map((a,i) => ({
                    label: String.fromCharCode(65+i),
                    text: (a.text||a.answer||'').replace(/<[^>]+>/g,'').trim(),
                    correct: a.correct === true
                  })).filter(o => o.text);
                  if (opts.length && qText) { allResults.push({type:'choice', qText, options:opts}); return; }
                }
              }
              Object.entries(obj).forEach(([k,v]) => {
                if (['answers','tipsAndFeedback','feedbackOnCorrect','feedbackOnWrong'].includes(k)) return;
                extractQ(v, depth+1);
              });
            };
            extractQ(p, 0);

          } catch(e) { console.log('Parse error:', e); }
        });
      }

      if (allResults.length === 0) {
        doc.querySelectorAll('.h5p-sc-slide').forEach((slide, qi) => {
          const qEl = slide.querySelector('.h5p-sc-question');
          const qText = qEl ? qEl.innerText.trim() : ('Câu '+(qi+1));
          const opts = [];
          slide.querySelectorAll('.h5p-sc-alternative').forEach((alt, i) => {
            const lbl = alt.querySelector('.h5p-sc-label');
            opts.push({label:String.fromCharCode(65+i), text:lbl?lbl.innerText.trim():alt.innerText.trim(), correct:alt.classList.contains('h5p-sc-is-correct')});
          });
          if (opts.length) allResults.push({type:'choice', qText, options:opts});
        });
      }
    });

    const seen = new Set();
    allResults = allResults.filter(r => {
      const key = r.qText.substring(0,30);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    if (!allResults.length) {
      lmsOutput.innerHTML = '<div style="color:#e74c3c;font-weight:bold;">❌ Không tìm thấy đáp án.<br><small style="color:#666;">Thử reload lại trang rồi quét lại.</small></div>';
      return;
    }

    let html = '<div style="font-size:11px;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #eee;color:#27ae60;font-weight:bold;">✅ Tìm thấy ' + allResults.length + ' câu</div>';

    allResults.forEach((q, idx) => {
      let body = '';
      if (q.type === 'choice') {
        const hasCorrect = q.options.some(o => o.correct);
        q.options.forEach((o, oi) => {
          body += '<div class="opt-row '+(o.correct?'opt-correct':'')+'">' +
            '<span class="opt-label"><b>'+String.fromCharCode(65+oi)+'.</b></span>'+
            '<span>'+o.text+(o.correct?' ✅':'')+'</span></div>';
        });
        if (!hasCorrect) body += '<div style="color:#e67e22;font-size:11px;">⚠️ Chưa xác định đáp án đúng</div>';
      } else if (q.type === 'fill') {
        let ansIdx = 0;
        const spanAns = (ans) =>
          '<span style="background:#e8f8f5;border:1px solid #16a085;border-radius:4px;' +
          'padding:1px 7px;color:#16a085;font-weight:bold;font-size:12px;">' + ans + '</span>';

        let previewHtml = (q.fillPreview || '').replace(/___/g, () => {
          const ans = q.blanks[ansIdx] ? q.blanks[ansIdx].answer : '?';
          ansIdx++;
          return spanAns(ans);
        });

        if (ansIdx === 0) {
          previewHtml = q.blanks.map(b => spanAns(b.answer)).join(', ');
        }

        body += '<div style="font-size:12px;line-height:2;color:#333;">' + previewHtml + '</div>';
      }

      const cleanTitle = (q.qText || '').replace(/\*[^*]+\*/g, '___').trim();
      const titlePreview = cleanTitle.length > 60 ? cleanTitle.substring(0, 60) + '...' : cleanTitle;
      html += '<div class="q-box"><div class="q-title">Câu ' + (idx+1) + ': ' + titlePreview + '</div>' + body + '</div>';
    });

    lmsOutput.innerHTML = html;
  }

  function executeAutoSelect(confirmedQuestions) {
    confirmedQuestions.forEach(q => {
      if (q.type === 'choice' && q.selectedOption) {
        clickAnswerByText(q.selectedOption.text);
      }
    });
  }

  function executeFillBlanks() {
    const fillQs = allResults.filter(q => q.type === 'fill');
    if (!fillQs.length) return alert('Không có dạng điền từ trong bài này!');
    const allInputs = [];
    getIframeDocs().forEach(doc => {
      doc.querySelectorAll('input.h5p-text-input').forEach(inp => allInputs.push(inp));
    });
    if (allInputs.length === 0) return alert('Không tìm thấy ô nhập!');
    let count = 0;
    fillQs.forEach(q => {
      q.blanks.forEach(b => {
        const inp = allInputs[b.globalIndex];
        if (inp) { fillInput(inp, b.answer); count++; }
      });
    });
    const lmsOutput = document.getElementById('lmsResponse');
    const notice = document.createElement('div');
    notice.style.cssText = 'background:#27ae60;color:#fff;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:bold;margin-bottom:8px;';
    notice.textContent = '✅ Đã nhập ' + count + '/' + allInputs.length + ' ô!';
    lmsOutput.prepend(notice);
    setTimeout(() => notice.remove(), 2500);
  }

  const mainWrapper = document.createElement('div');
  mainWrapper.id = 'draggableUI';
  mainWrapper.style.cssText = 'position:fixed;top:70px;left:20px;z-index:999999;user-select:none;touch-action:none;font-family:"Segoe UI",Roboto,Arial,sans-serif;display:flex;align-items:flex-start;';

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .tab-bar{display:flex;background:#f0f0f0;border-bottom:1px solid #ddd;flex-wrap:wrap}
    .tab-btn{flex:1;padding:10px;border:none;background:transparent;cursor:pointer;font-weight:600;font-size:12px;color:#555;transition:0.2s;min-width:50px}
    .tab-btn.active{background:#fff;color:#c0392b;border-bottom:3px solid #c0392b}
    .tab-content{display:none;padding:14px;flex-direction:column;gap:10px;animation:fadeIn 0.2s ease;overflow:hidden}
    .tab-content.active{display:flex}
    #aiResponse{height:120px;overflow-y:auto;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:8px;font-size:12px;white-space:pre-wrap;color:#222}
    #lmsResponse{height:220px;overflow-y:auto;background:#fff;border:1px solid #eee;border-radius:8px;padding:10px;font-size:12px;color:#222}
    #aiInput,#searchInput{width:100%;box-sizing:border-box;padding:8px;border:1px solid #ccc;border-radius:6px;outline:none}
    .ans-wrap{display:flex;flex-direction:column;gap:5px;flex:1}
    .ans-row{display:flex;align-items:center;gap:5px}
    .ans-label{font-weight:bold;width:20px;color:#c0392b;font-size:13px}
    .ans-input{flex:1;padding:5px;border:1px solid #ddd;border-radius:4px;font-size:12px;outline:none}
    .square-btn{width:30px;height:30px;border:none;border-radius:6px;cursor:pointer;color:white;font-weight:bold;background:#444;transition:0.2s}
    .square-btn:active{transform:scale(0.95)}
    #settingUI{width:170px;background:#fff;border-radius:14px;box-shadow:0 10px 28px rgba(0,0,0,0.15);border:1px solid #ddd;position:absolute;right:100%;top:0;opacity:0;visibility:hidden;transform:translateX(10px);z-index:1;transition:all 0.3s ease}
    #settingUI.active{opacity:1;visibility:visible;transform:translateX(-10px)}
    .header-btn{background:rgba(255,255,255,0.2);border:none;color:white;width:26px;height:26px;border-radius:6px;cursor:pointer}
    .customBtn{width:100%;padding:11px;border:none;border-radius:10px;background:linear-gradient(135deg,#c0392b,#e74c3c);color:white;font-size:14px;cursor:pointer;font-weight:600;margin-top:5px;transition:0.2s}
    .customBtn:active{transform:scale(0.98)}
    .customBtn.active-toggle{background:#27ae60!important;box-shadow:inset 0 2px 5px rgba(0,0,0,0.3)!important}
    .switch{position:relative;display:inline-block;width:34px;height:20px}
    .switch input{opacity:0;width:0;height:0}
    .slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;border-radius:34px;transition:0.3s}
    .slider:before{position:absolute;content:"";height:14px;width:14px;left:3px;bottom:3px;background-color:white;border-radius:50%;transition:0.3s}
    input:checked+.slider{background-color:#c0392b}
    input:checked+.slider:before{transform:translateX(14px)}
    .smooth-transition{transition:all 0.3s ease!important}
    .q-box{border:1px solid #eee;border-radius:8px;padding:10px;background:#fdfdfd;box-shadow:0 2px 5px rgba(0,0,0,0.05);margin-bottom:5px}
    .q-title{font-weight:bold;font-size:12px;margin-bottom:8px;color:#333;border-bottom:1px dashed #ddd;padding-bottom:5px;line-height:1.4}
    .opt-row{font-size:12px;padding:4px 8px;border-radius:5px;margin-bottom:3px;display:flex;align-items:flex-start}
    .opt-correct{background:#e8f8f5;color:#16a085;font-weight:bold;border:1px solid #16a085}
    .opt-label{margin-right:5px;min-width:18px;flex-shrink:0}
    .search-group{display:flex;gap:5px;margin-top:5px;align-items:center}
    .search-group input{flex:1}
    .search-group button{width:auto;margin-top:0;padding:8px 15px}
  `;
  document.head.appendChild(style);

  const settingGui = document.createElement('div');
  settingGui.id = 'settingUI';
  settingGui.innerHTML = `
    <div style="padding:10px;background:#333;color:#fff;font-size:12px;font-weight:bold;text-align:center;">SETTING</div>
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:12px;color:#333;">Xoay ngang AI</span>
        <label class="switch"><input type="checkbox" id="toggleRotate"><span class="slider"></span></label>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:12px;color:#333;">Smooth Mode</span>
        <label class="switch"><input type="checkbox" id="toggleSmooth" checked><span class="slider"></span></label>
      </div>
    </div>
  `;

  const dragItem = document.createElement('div');
  dragItem.id = 'mainGui';
  dragItem.className = 'smooth-transition';
  dragItem.style.cssText = 'width:300px;background:#fff;border-radius:14px;box-shadow:0 10px 28px rgba(160,0,0,0.25);overflow:hidden;position:relative;z-index:10;';
  dragItem.innerHTML = `
    <header id="dragHeader" style="cursor:move;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:linear-gradient(135deg,#c0392b,#e74c3c);color:white;">
      <div>
        <div style="font-weight:700;font-size:14px;line-height:1;">Hỗ trợ học tập</div>
        <div style="font-size:11px;opacity:0.85;">làm chậm thôi</div>
      </div>
      <div style="display:flex;gap:5px;">
        <button id="setBtn" class="header-btn">⚙</button>
        <button id="toggleUIBtn" class="header-btn">—</button>
        <button id="closeBtn" class="header-btn">×</button>
      </div>
    </header>
    <div id="mainContent">
      <div class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('tabMain',this)">Main</button>
        <button class="tab-btn" onclick="switchTab('tabAuto',this)">Auto</button>
        <button class="tab-btn" onclick="switchTab('tabLMS',this)">Smart</button>
        <button class="tab-btn" onclick="switchTab('tabAI',this)">A.I</button>
      </div>
      <div id="tabMain" class="tab-content active">
        <h3 style="margin:0;color:#c0392b;">Yo</h3>
        <div style="font-size:13px;color:#333;line-height:1.8;">
          <p style="margin:0;">• <b>Auto:</b> Một vài tính năng simple</p>
          <p style="margin:0;">• <b>Smart:</b> Smart </p>
          <p style="margin:0;">• <b>A.I:</b> Đang chết 💀</p>
          <p style="margin:0;">• <b>Phím F:</b> Ẩn/hiện menu</p>
          <p style="margin:0;">• <b>Creator/Nguồn:</b> minhh:0, HiennNek, rất nhiều AI</p>
        </div>
      </div>
      <div id="tabAuto" class="tab-content">
        <button id="runBtn" class="customBtn"> Chọn tất cả (Single Choice)</button>
        <button id="highlightBtn" class="customBtn">Highlight đáp án</button>
      </div>
      <div id="tabLMS" class="tab-content">
        <button id="setupBtn" class="customBtn">Setup</button>
        <button id="selectAnsBtn" class="customBtn">Lấy đáp án(có thể sai nếu là chọn đáp án)</button>
        <div class="search-group">
          <input type="text" id="searchInput" placeholder="Tìm câu hỏi...">
          <button id="searchBtn" class="customBtn">🔎</button>
        </div>
        <div id="lmsResponse"><i>Bấm "Setup" để bắt đầu...</i></div>
      </div>
      <div id="tabAI" class="tab-content">
        <div style="color:red;font-weight:bold;text-align:center;font-size:14px;border:2px dashed red;padding:5px;background:#ffeeee;">KO HOẠT ĐỘNG😢</div>
        <div style="opacity:0.5;pointer-events:none;display:flex;flex-direction:column;gap:8px;">
          <div id="aiResponse"><i>A.I đang ngủ...</i></div>
          <input type="text" id="aiInput" placeholder="Nhập câu hỏi...">
          <button id="askAiBtn" class="customBtn">Gửi</button>
        </div>
        <div style="opacity:0.5;pointer-events:none;display:flex;flex-direction:column;gap:5px;">
          <div class="ans-wrap" id="ansContainer"></div>
          <div style="display:flex;align-items:center;gap:5px;">
            <button id="addAnsBtn" class="square-btn">+</button>
            <button id="removeAnsBtn" class="square-btn" style="background:#888;">—</button>
            <button id="clearTextBtn" class="square-btn" style="background:#e67e22;font-size:11px;">C</button>
          </div>
        </div>
      </div>
    </div>
  `;

  mainWrapper.appendChild(settingGui);
  mainWrapper.appendChild(dragItem);
  document.body.appendChild(mainWrapper);

  let isDragging = false, offset = {x:0,y:0};
  const hdr = document.getElementById('dragHeader');
  hdr.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    isDragging = true;
    const r = mainWrapper.getBoundingClientRect();
    offset = {x: e.clientX - r.left, y: e.clientY - r.top};
  });
  hdr.addEventListener('touchstart', e => {
    if (e.target.closest('button')) return;
    isDragging = true;
    const r = mainWrapper.getBoundingClientRect();
    offset = {x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top};
  }, {passive:false});
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    mainWrapper.style.left = (e.clientX - offset.x) + 'px';
    mainWrapper.style.top = (e.clientY - offset.y) + 'px';
  });
  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    mainWrapper.style.left = (e.touches[0].clientX - offset.x) + 'px';
    mainWrapper.style.top = (e.touches[0].clientY - offset.y) + 'px';
  }, {passive:false});
  document.addEventListener('mouseup', () => isDragging = false);
  document.addEventListener('touchend', () => isDragging = false);

  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key.toLowerCase() === 'f') mainWrapper.style.display = mainWrapper.style.display === 'none' ? 'flex' : 'none';
  });

  window.switchTab = (id, btn) => {
    const isAI = id === 'tabAI';
    const rotate = document.getElementById('toggleRotate').checked;
    dragItem.style.width = (isAI && rotate) ? '580px' : '300px';
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
  };

  document.getElementById('toggleRotate').onchange = () => {
    if (document.getElementById('tabAI').classList.contains('active'))
      window.switchTab('tabAI', document.querySelectorAll('.tab-btn')[3]);
  };

  document.getElementById('setupBtn').onclick = () => hackLmsDirect();

  document.getElementById('selectAnsBtn').onclick = () => {
    if (!allResults.length) return alert('Vui lòng Quét trước!');

    const choiceQ = allResults.filter(q => q.type === 'choice');
    const fillQ   = allResults.filter(q => q.type === 'fill');

    if (!choiceQ.length && !fillQ.length) {
      return alert('Không tìm thấy dạng bài nào!');
    }

    if (choiceQ.length > 0) {
      showConfirmModal(choiceQ, (confirmedChoice) => {
        executeAutoSelect(confirmedChoice);
        if (fillQ.length > 0) executeFillBlanks();
      });
    } else {
      executeFillBlanks();
    }
  };

  const filterQ = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.q-box').forEach(b => {
      b.style.display = b.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
  };
  document.getElementById('searchBtn').onclick = filterQ;
  document.getElementById('searchInput').addEventListener('input', filterQ);

  // Auto tab
  document.getElementById('runBtn').onclick = () => {
    queryAll('.h5p-sc-alternative.h5p-sc-is-correct').forEach(el => forceSelectElement(el));
  };
  document.getElementById('highlightBtn').onclick = function() {
    isHighlightActive = !isHighlightActive;
    this.classList.toggle('active-toggle', isHighlightActive);
    getIframeDocs().forEach(d => d.querySelectorAll('.h5p-sc-alternative.h5p-sc-is-correct').forEach(el => {
      el.style.border = isHighlightActive ? '2px solid #00ff80' : '';
    }));
  };

  document.getElementById('askAiBtn').onclick = async () => {};
  document.getElementById('clearTextBtn').onclick = () => {
    document.getElementById('aiInput').value = '';
    document.querySelectorAll('.ans-input').forEach(i => i.value = '');
  };
  document.getElementById('setBtn').onclick = () => settingGui.classList.toggle('active');
  document.getElementById('closeBtn').onclick = () => mainWrapper.remove();
  document.getElementById('toggleUIBtn').onclick = () => {
    const mc = document.getElementById('mainContent');
    mc.style.display = mc.style.display === 'none' ? 'block' : 'none';
  };

  const ansContainer = document.getElementById('ansContainer');
  let ansCount = 0;
  const addRow = () => {
    const div = document.createElement('div');
    div.className = 'ans-row';
    div.innerHTML = '<span class="ans-label">'+String.fromCharCode(65+ansCount)+':</span><input type="text" class="ans-input">';
    ansContainer.appendChild(div); ansCount++;
  };
  for (let i = 0; i < 4; i++) addRow();
  document.getElementById('addAnsBtn').onclick = addRow;
  document.getElementById('removeAnsBtn').onclick = () => {
    if (ansCount > 1) { ansContainer.removeChild(ansContainer.lastElementChild); ansCount--; }
  };
})();
console.clear();
console.log("Loaded👍");
