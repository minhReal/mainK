(() => {
  if (document.getElementById("draggableUI")) return;

  let isHighlightActive = false;
  let allResults = [];

  function getIframeDocs() {
    const docs = [document];
    document.querySelectorAll('iframe').forEach(f => {
      try {
        const d = f.contentDocument;
        if (d) docs.push(d);
      } catch(e) {  }
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

  function clickAnswerInContainer(container, text) {
    const target = norm(text);
    const iWin = container.ownerDocument.defaultView;
    const dispatch = el => {
      ['mousedown','mouseup','click'].forEach(ev =>
        el.dispatchEvent(new iWin.MouseEvent(ev, {bubbles:true,cancelable:true}))
      );
    };
    
    const tfAnswers = Array.from(container.querySelectorAll('.h5p-true-false-answer'));
    if (tfAnswers.length) {
      const match = tfAnswers.find(el => norm(el.innerText) === target);
      if (match) { dispatch(match); return true; }
    }
    
    const scCurrent = container.querySelector('.h5p-sc-current-slide') || container;
    const scAlts = Array.from(scCurrent.querySelectorAll('li.h5p-sc-alternative'));
    if (scAlts.length) {
      let match = scAlts.find(li => norm(li.innerText) === target);
      if (!match) match = scAlts.find(li => norm(li.innerText).includes(target));
      if (match) { dispatch(match); return true; }
    }
    
    const mcAlts = Array.from(container.querySelectorAll('li.h5p-answer'));
    if (mcAlts.length) {
      const inner = mcAlts.find(li => {
        const el = li.querySelector('.h5p-alternative-inner');
        return norm(el ? el.innerText : li.innerText) === target;
      });
      if (inner) { dispatch(inner); return true; }
    }
    console.warn('[H5P] Không click được:', JSON.stringify(text));
    return false;
  }

  function clickCheckInContainer(container) {
    const btn = container.querySelector('.h5p-question-check-answer');
    if (btn && !btn.disabled) {
      const iWin = container.ownerDocument.defaultView;
      ['mousedown','mouseup','click'].forEach(ev =>
        btn.dispatchEvent(new iWin.MouseEvent(ev, {bubbles:true,cancelable:true}))
      );
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

  function h5pMarkTheWordsParseAnswers(tf) {
    // Dùng đúng algorithm H5P word.js: chỉ *word* liền (ko space trước *) mới là đáp án
    const text = tf.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ');
    const tokens = text.match(/ \*[^ *]+\* |[^\s]+/g) || [];
    const answers = [];
    tokens.forEach(tok => {
      tok = tok.trim();
      if (tok.charAt(0) === '*' && tok.length > 2) {
        if (tok.charAt(tok.length-1) === '*') {
          answers.push(tok.slice(1,-1).trim());
        } else if (tok.charAt(tok.length-2) === '*') {
          answers.push(tok.slice(1,-2).trim());
        }
      }
    });
    return answers.filter(Boolean);
  }

  function hackLmsDirect() {
    const lmsOutput = document.getElementById('lmsResponse');
    lmsOutput.innerHTML = '<i>Đang setup...</i>';
    allResults = [];

    getIframeDocs().forEach(doc => { try {
      let h5pData = null;
      try {
        const win = doc.defaultView || doc.parentWindow;
        if (win && win.H5PIntegration) h5pData = win.H5PIntegration;
      } catch(e) {}

      if (!h5pData) {
        try { doc.querySelectorAll('script').forEach(s => {
          if (h5pData) return;
          const txt = s.textContent;
          const m = txt.match(/H5PIntegration\s*=\s*(\{[\s\S]+?\});\s*(?:\/\/|$|\n)/);
          if (m) { try { h5pData = JSON.parse(m[1]); } catch(e) {} }
          if (!h5pData && txt.includes('H5PIntegration')) {
            const m2 = txt.match(/H5PIntegration\s*=\s*(\{[\s\S]+\})/);
            if (m2) { try { h5pData = JSON.parse(m2[1]); } catch(e) {} }
          }
        }); } catch(e) {}
      }

      if (h5pData) {
        Object.values(h5pData.contents || {}).forEach(content => {
          try {
            let p = content.jsonContent;
            if (typeof p === 'string') p = JSON.parse(p);

            
            if (p.interactiveVideo && p.interactiveVideo.assets) {
              const interactions = p.interactiveVideo.assets.interactions || [];
              let ivIdx = 0;
              interactions.forEach(item => {
                const lib = (item.action && item.action.library) || '';
                const params = (item.action && item.action.params) || {};
                if (lib.includes('SingleChoiceSet')) {
                  (params.choices || []).forEach(ch => {
                    const qText = (ch.question||'').replace(/<[^>]+>/g,'').trim();
                    const opts = (ch.answers||[]).map((a,i) => ({
                      label: String.fromCharCode(65+i),
                      text: (typeof a==='string'?a:(a.text||'')).replace(/<[^>]+>/g,'').trim(),
                      correct: i===0
                    })).filter(o=>o.text);
                    if (qText && opts.length) allResults.push({type:'choice',qText,options:opts});
                  });
                } else if (lib.includes('TrueFalse')) {
                  const qText = (params.question||'').replace(/<[^>]+>/g,'').trim();
                  if (qText) {
                    const tT=(params.l10n&&params.l10n.trueText)||'Đúng';
                    const fT=(params.l10n&&params.l10n.falseText)||'Sai';
                    const ok=params.correct==='true'||params.correct===true;
                    allResults.push({type:'choice',qText,options:[
                      {label:'A',text:tT,correct:ok},
                      {label:'B',text:fT,correct:!ok}
                    ]});
                  }
                } else if (lib.includes('Blanks')) {
                  (params.questions||[]).forEach(qHtml => {
                    if (typeof qHtml!=='string') return;
                    const raw=qHtml.replace(/<[^>]+>/g,'');
                    const cl=raw.replace(/^\d+\.\s*/,'');
                    const si=cl.indexOf('*'),di=cl.indexOf('.');
                    let qt,pv;
                    if (di>=0&&di<si){qt=cl.substring(0,di).trim();pv=cl.substring(di+1).replace(/\*[^*]+\*/g,'___').trim();}
                    else{const nh=cl.replace(/\s*\([^)]+\)\s*$/,'').trim();qt=nh.replace(/\*[^*]+\*/g,'___').trim();pv=qt;}
                    const ms=[...cl.matchAll(/\*([^*]+)\*/g)];
                    const bl=ms.map(m=>({answer:m[1].trim(),globalIndex:ivIdx++})).filter(b=>b.answer);
                    if (bl.length) allResults.push({type:'fill',qText:qt,fillPreview:pv,blanks:bl});
                  });
                } else if (lib.includes('MultiChoice')) {
                  const qText=(params.question||'').replace(/<[^>]+>/g,'').trim();
                  if (qText) {
                    const opts=(params.answers||[]).map((a,i)=>({
                      label:String.fromCharCode(65+i),
                      text:(a.text||'').replace(/<[^>]+>/g,'').trim(),
                      correct:a.correct===true
                    })).filter(o=>o.text);
                    if (opts.length) allResults.push({type:'choice',qText,options:opts});
                  }
                } else if (lib.includes('MarkTheWords')) {
                  const tf = params.textField || '';
                  const qText = (params.taskDescription||'').replace(/<[^>]+>/g,'').trim();
                  const answers = h5pMarkTheWordsParseAnswers(tf);
                  if (answers.length) allResults.push({type:'mark', qText, answers});
                } else if (lib.includes('DragText')) {
                  const tf = params.textField || '';
                  const qText = (params.taskDescription||'').replace(/<[^>]+>/g,'').trim();
                  const matches = [...tf.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)];
                  const distractorStr = params.distractors || '';
                  const distractors = new Set([...distractorStr.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)].map(m=>m[1].trim()));
                  const blanks = matches
                    .map(m=>m[1].trim())
                    .filter(w=>!distractors.has(w))
                    .map((w,i)=>({answer:w,globalIndex:i}));
                  if (blanks.length) allResults.push({type:'drag',qText,textField:tf,blanks,distractors:[...distractors]});
                }
              });
              if (allResults.length>0 && !allResults.every(r=>r.type==='mark')) return;
            }

            if (p.textField && typeof p.textField === 'string' && !p.interactiveVideo) {
              const tf = p.textField;
              const qText = (p.taskDescription||'').replace(/<[^>]+>/g,'').trim();
              // DragText có distractors, MarkTheWords thì không
              if (typeof p.distractors !== 'undefined') {
                // DragText
                const distStr = p.distractors || '';
                const distractors = new Set([...distStr.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)].map(m=>m[1].trim()));
                const matches = [...tf.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)];
                const blanks = matches.map(m=>m[1].trim()).filter(w=>!distractors.has(w)).map((w,i)=>({answer:w,globalIndex:i}));
                if (blanks.length) allResults.push({type:'drag',qText:qText||'DragText',textField:tf,blanks,distractors:[...distractors]});
              } else {
                // MarkTheWords
                const answers = h5pMarkTheWordsParseAnswers(tf);
                if (answers.length) allResults.push({type:'mark', qText:qText||'Mark the Words', answers});
              }
              return;
            }

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
              
              if ((obj.correct === 'true' || obj.correct === 'false' || obj.correct === true || obj.correct === false)
                  && obj.l10n && (obj.l10n.trueText || obj.l10n.falseText)) {
                const qText = (obj.question||obj.text||obj.statement||'').replace(/<[^>]+>/g,'').trim();
                if (qText) {
                  const tT = obj.l10n.trueText  || 'Đúng';
                  const fT = obj.l10n.falseText || 'Sai';
                  const ok = obj.correct === 'true' || obj.correct === true;
                  allResults.push({type:'choice', qText, options:[
                    {label:'A', text:tT, correct: ok},
                    {label:'B', text:fT, correct:!ok}
                  ]});
                  return;
                }
              }
              Object.entries(obj).forEach(([k,v]) => {
                if (['answers','tipsAndFeedback','feedbackOnCorrect','feedbackOnWrong','l10n','media'].includes(k)) return;
                extractQ(v, depth+1);
              });
            };
            extractQ(p, 0);

          } catch(e) { console.log('Parse error:', e); }
        });
      }

      
      try {
        doc.querySelectorAll('.h5p-sc-slide.h5p-sc').forEach((slide) => {
          if (slide.classList.contains('h5p-sc-set-results')) return;
          const qEl = slide.querySelector('.h5p-sc-question');
          const qText = qEl ? qEl.innerText.trim() : '';
          if (!qText) return;
          const already = allResults.some(r => norm(r.qText).includes(norm(qText.substring(0,20))));
          if (already) return;
          const opts = [];
          slide.querySelectorAll('.h5p-sc-alternative').forEach((alt, i) => {
            const lbl = alt.querySelector('.h5p-sc-label');
            opts.push({label:String.fromCharCode(65+i), text:lbl?lbl.innerText.trim():alt.innerText.trim(), correct:alt.classList.contains('h5p-sc-is-correct')});
          });
          if (opts.length) allResults.push({type:'choice', qText, options:opts});
        });
      } catch(e) {}
      
      try {
        doc.querySelectorAll('.h5p-question.h5p-true-false').forEach((tf) => {
          const qEl = tf.querySelector('.h5p-question-content') || tf.querySelector('.h5p-true-false-question-text') || tf;
          
          const answers = Array.from(tf.querySelectorAll('.h5p-true-false-answer'));
          let qText = tf.innerText.trim();
          answers.forEach(a => { qText = qText.replace(a.innerText.trim(), '').trim(); });
          qText = qText.replace(/\s+/g,' ').trim();
          if (!qText) return;
          const already = allResults.some(r => norm(r.qText).includes(norm(qText.substring(0,20))));
          if (already) return;
          const opts = answers.map((a, i) => ({
            label: String.fromCharCode(65+i),
            text: a.innerText.trim(),
            correct: a.classList.contains('h5p-true-false-answer-correct') || a.getAttribute('aria-pressed') === 'true'
          }));
          if (opts.length) allResults.push({type:'choice', qText, options:opts});
        });
      } catch(e) {}
      // Parse DragText từ H5P.instances trực tiếp (bắt tất cả embed style)
      try {
        const win2 = doc.defaultView;
        if (win2 && win2.H5P && win2.H5P.instances) {
          win2.H5P.instances.forEach(inst => {
            const lib = inst.libraryInfo?.versionedNameNoSpaces || '';
            if (!lib.includes('DragText')) return;
            if (!inst.params?.textField) return;
            const already = allResults.some(r => r.type === 'drag');
            if (already) return;
            const tf = inst.params.textField;
            const qText = (inst.params.taskDescription||'').replace(/<[^>]+>/g,'').trim() || 'DragText';
            const distStr = inst.params.distractors || '';
            const dist = new Set([...distStr.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)].map(m=>m[1].trim()));
            const ms = [...tf.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)];
            const blanks = ms.map(m=>m[1].trim()).filter(w=>!dist.has(w)).map((w,i)=>({answer:w,globalIndex:i}));
            if (blanks.length) {
              allResults.push({type:'drag', qText, textField:tf, blanks, distractors:[...dist]});
            } else {
            }
          });
        }
      } catch(e) {}
      try {
        doc.querySelectorAll('.h5p-question.h5p-mark-the-words').forEach(mtw => {
          const qEl = mtw.querySelector('.h5p-question-introduction');
          const qText = (qEl ? qEl.innerText : '').trim() || 'Mark the Words';
          const already = allResults.some(r => norm(r.qText).includes(norm(qText.substring(0,20))));
          if (already) return;
          const answers = [];
          const win2 = mtw.ownerDocument.defaultView;
          // Ưu tiên dùng selectableWords từ H5P instance (chính xác nhất)
          if (win2 && win2.H5P && win2.H5P.instances) {
            win2.H5P.instances.forEach(inst => {
              if ((inst.libraryInfo?.versionedNameNoSpaces||'').includes('MarkTheWords')) {
                if (inst.selectableWords && inst.selectableWords.length) {
                  inst.selectableWords.forEach(w => {
                    if (w.isAnswer && w.isAnswer()) {
                      const text = (w.$word ? w.$word.text() : '').trim();
                      if (text) answers.push(text);
                    }
                  });
                } else if (inst.params?.textField) {
                  const tf = inst.params.textField;
                  h5pMarkTheWordsParseAnswers(tf).forEach(a => answers.push(a));
                }
              }
            });
          }
          if (answers.length) allResults.push({type:'mark', qText, answers});
        });
      } catch(e) {}
      try {
        doc.querySelectorAll('.h5p-question.h5p-drag-text').forEach(dt => {
          const qEl = dt.querySelector('.h5p-question-introduction, .h5p-drag-inner');
          const qText = (qEl ? qEl.innerText : dt.innerText).split('\n')[0].trim();
          if (!qText) return;
          const already = allResults.some(r => norm(r.qText).includes(norm(qText.substring(0,20))));
          if (already) return;
          const blanks = [];
          dt.querySelectorAll('.h5p-drag-dropzone-container').forEach((dz,i) => {
            const sol = dz.querySelector('.h5p-drag-show-solution-container');
            const ans = sol ? sol.innerText.trim() : '';
            if (ans) blanks.push({answer:ans, globalIndex:i});
          });
          if (!blanks.length) {
            const win2 = doc.defaultView;
            if (win2 && win2.H5P && win2.H5P.instances) {
              win2.H5P.instances.forEach(inst => {
                if ((inst.libraryInfo?.versionedNameNoSpaces||'').includes('DragText') && inst.params) {
                  const tf = inst.params.textField || '';
                  const distStr = inst.params.distractors || '';
                  const dist = new Set([...distStr.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)].map(m=>m[1].trim()));
                  const ms = [...tf.matchAll(/\*([^*:]+)(?::[^*]*)?\*/g)].map(m=>m[1].trim()).filter(w=>!dist.has(w));
                  ms.forEach((w,i) => blanks.push({answer:w,globalIndex:i}));
                }
              });
            }
          }
          if (blanks.length) {
            const qt = dt.querySelector('[class*="task-description"],[class*="drag-inner"]')?.innerText?.trim() || qText;
            allResults.push({type:'drag', qText:qt.substring(0,120), blanks});
          }
        });
      } catch(e) {}
    } catch(e) { console.log("Doc err:", e.message); } });

    const seen = new Set();
    allResults = allResults.filter(r => {
      const key = r.type + '|' + r.qText.substring(0,30);
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
      } else if (q.type === 'mark') {
        body += '<div style="font-size:12px;line-height:2;color:#333;">';
        q.answers.forEach((a, ai) => {
          body += '<span style="color:#666;font-size:10px;">'+(ai+1)+'.</span> ' +
            '<span style="background:#00ff88;border:2px solid #00c86e;border-radius:6px;padding:1px 9px;color:#004a28;font-weight:900;font-size:12px;margin-right:8px;box-shadow:0 0 8px 2px rgba(0,255,136,0.6);">' + a.trim() + '</span>';
        });
        body += '</div>';
      } else if (q.type === 'drag') {
        const DRAG_COLORS = [
          {bg:'#ffff00',bd:'#e6c800',tx:'#5a4a00',glow:'rgba(255,255,0,0.6)'},
          {bg:'#00ffff',bd:'#00c8c8',tx:'#004a4a',glow:'rgba(0,255,255,0.6)'},
          {bg:'#00ff88',bd:'#00c86e',tx:'#004a28',glow:'rgba(0,255,136,0.6)'},
          {bg:'#ff69b4',bd:'#e0408c',tx:'#5a0030',glow:'rgba(255,105,180,0.6)'},
          {bg:'#bf7fff',bd:'#9340e0',tx:'#3a0060',glow:'rgba(191,127,255,0.6)'},
          {bg:'#ff9900',bd:'#e07800',tx:'#5a2800',glow:'rgba(255,153,0,0.6)'},
        ];
        body += '<div style="font-size:12px;line-height:2.4;color:#333;margin-bottom:6px;">';
        q.blanks.forEach((b,i) => {
          const col = DRAG_COLORS[i % DRAG_COLORS.length];
          body += '<span style="color:#888;font-size:11px;">Ô '+(i+1)+'</span> ' +
            '<span style="background:'+col.bg+';border:2px solid '+col.bd+';border-radius:6px;padding:2px 10px;color:'+col.tx+';font-weight:900;font-size:12px;margin-right:6px;box-shadow:0 0 8px 2px '+col.glow+';">' +
            b.answer + '</span>';
        });
        body += '</div>';
        if (q.distractors && q.distractors.length) {
          body += '<div style="font-size:11px;color:#bbb;margin-top:2px;">Nhiễu: ' + q.distractors.join(' · ') + '</div>';
        }
      }
      const cleanTitle = (q.qText || '').replace(/\*[^*]+\*/g, '___').trim();
      const titlePreview = cleanTitle.length > 60 ? cleanTitle.substring(0, 60) + '...' : cleanTitle;
      const typeBadge = q.type === 'drag' ? '<span style="background:#FF8C00;color:#fff;font-size:9px;font-weight:900;border-radius:3px;padding:1px 5px;margin-left:4px;">KÉO THẢ</span>'
        : q.type === 'mark' ? '<span style="background:#9370DB;color:#fff;font-size:9px;font-weight:900;border-radius:3px;padding:1px 5px;margin-left:4px;">ĐÁNH DẤU</span>'
        : q.type === 'fill' ? '<span style="background:#20B2AA;color:#fff;font-size:9px;font-weight:900;border-radius:3px;padding:1px 5px;margin-left:4px;">ĐIỀN CHỖ TRỐNG</span>'
        : q.type === 'choice' ? '<span style="background:#4169E1;color:#fff;font-size:9px;font-weight:900;border-radius:3px;padding:1px 5px;margin-left:4px;">CHỌN ĐÁP ÁN</span>'
        : '';
      html += '<div class="q-box"><div class="q-title">Câu ' + (idx+1) + ': ' + titlePreview + typeBadge + '</div>' + body + '</div>';
    });

    lmsOutput.innerHTML = html;
  }

  function executeAutoSelect(confirmedQuestions) {
    
    
    

    const allDocs = getIframeDocs();

    
    const scContainers = [];
    allDocs.forEach(doc => {
      doc.querySelectorAll('.h5p-question.h5p-single-choice-set, .h5p-question:has(.h5p-sc-slide)').forEach(el => {
        scContainers.push(el);
      });
    });

    
    const otherContainers = [];
    allDocs.forEach(doc => {
      doc.querySelectorAll('.h5p-question').forEach(el => {
        const isSC = el.querySelector('.h5p-sc-slide');
        if (!isSC) otherContainers.push(el);
      });
    });

    
    const scQuestions = [];
    const otherQuestions = [];

    confirmedQuestions.forEach(q => {
      if (q.type !== 'choice' || !q.selectedOption) return;
      
      let isScQ = false;
      allDocs.forEach(doc => {
        if (isScQ) return;
        doc.querySelectorAll('.h5p-sc-slide:not(.h5p-sc-set-results)').forEach(slide => {
          if (norm(slide.innerText).includes(norm(q.qText.substring(0,20)))) isScQ = true;
        });
      });
      if (isScQ) scQuestions.push(q);
      else otherQuestions.push(q);
    });

    console.log('[H5P] SC questions:', scQuestions.length, '| Other:', otherQuestions.length);

    let delay = 0;

    
    if (scQuestions.length > 0 && scContainers.length > 0) {
      const scCont = scContainers[0]; 
      scQuestions.forEach(q => {
        const sel = q.selectedOption.text;
        setTimeout(() => {
          
          const curSlide = scCont.querySelector('.h5p-sc-current-slide');
          if (curSlide) {
            const alts = Array.from(curSlide.querySelectorAll('li.h5p-sc-alternative'));
            let match = alts.find(li => norm(li.innerText) === norm(sel));
            if (!match) match = alts.find(li => norm(li.innerText).includes(norm(sel)));
            if (match) {
              const iWin = match.ownerDocument.defaultView;
              ['mousedown','mouseup','click'].forEach(ev =>
                match.dispatchEvent(new iWin.MouseEvent(ev, {bubbles:true,cancelable:true}))
              );
              console.log('[SC] Clicked:', sel.substring(0,30));
            } else {
              console.warn('[SC] Alt not found:', sel, '| Available:', alts.map(a=>a.innerText.substring(0,20)).join(' / '));
            }
          } else {
            console.warn('[SC] No current slide at delay', delay);
          }
        }, delay);
        delay += 1100; 
      });
    }

    
    const usedIdx = new Set();
    otherQuestions.forEach(q => {
      const sel = q.selectedOption.text;
      const needle = norm(q.qText.substring(0, 20));
      setTimeout(() => {
        let found = false;
        for (let i = 0; i < otherContainers.length; i++) {
          if (usedIdx.has(i)) continue;
          if (norm(otherContainers[i].innerText).includes(needle)) {
            usedIdx.add(i);
            const ok = clickAnswerInContainer(otherContainers[i], sel);
            if (ok) setTimeout(() => clickCheckInContainer(otherContainers[i]), 400);
            found = true; break;
          }
        }
        if (!found) console.warn('[H5P] No container for:', q.qText.substring(0,30));
      }, delay);
      delay += 1000;
    });

    // MarkTheWords: auto click đúng từ
    const markQs = confirmedQuestions.filter(q => q.type === 'mark');
    if (markQs.length) {
      setTimeout(() => {
        allDocs.forEach(doc => {
          markQs.forEach(mq => {
            const correctSet = new Set(mq.answers.map(a => a.toLowerCase().trim()));
            const spans = Array.from(doc.querySelectorAll('.h5p-word-selectable-words span:not(.hidden-but-read)'));
            let si = 0;
            while (si < spans.length) {
              const sp = spans[si];
              const raw = sp.innerText.trim();
              if (raw.startsWith('*') && raw !== '*') {
                const word = raw.replace(/^\*+/, '').replace(/\*+$/, '').trim();
                if (correctSet.has(word.toLowerCase())) {
                  const iWin = sp.ownerDocument.defaultView;
                  ['mousedown','mouseup','click'].forEach(ev =>
                    sp.dispatchEvent(new iWin.MouseEvent(ev, {bubbles:true, cancelable:true}))
                  );
                }
              }
              si++;
            }
            // Bấm Kiểm tra
            setTimeout(() => {
              const checkBtn = doc.querySelector('.h5p-question-check-answer');
              if (checkBtn) checkBtn.click();
            }, 600);
          });
        });
      }, delay);
    }
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
    .tab-bar{display:flex;background:#f5f5f5;padding:6px 8px;gap:4px;border-bottom:1px solid #e0e0e0}
    .tab-btn{flex:1;padding:7px 4px;border:none;border-radius:8px;background:transparent;cursor:pointer;font-weight:600;font-size:12px;color:#888;transition:all 0.2s;min-width:40px}
    .tab-btn.active{background:#c0392b;color:#fff;box-shadow:0 2px 8px rgba(192,57,43,0.35)}
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
    .customBtn{transition:background 0.25s,box-shadow 0.25s,transform 0.1s}
    .customBtn:active{transform:scale(0.97)}
    .customBtn.active-toggle{background:linear-gradient(135deg,#27ae60,#2ecc71)!important;box-shadow:0 0 0 3px rgba(46,204,113,0.4)!important}
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
      <div id="tabLMS" class="tab-content" style="position:relative;padding-bottom:44px;">
        <button id="setupBtn" class="customBtn">Setup</button>
        <button id="smartHighlightBtn" class="customBtn">Highlight/Fill</button>
        <div class="search-group">
          <input type="text" id="searchInput" placeholder="Tìm câu hỏi...">
          <button id="searchBtn" class="customBtn">🔎</button>
        </div>
        <div id="lmsResponse"><i>Bấm "Setup" để bắt đầu...</i></div>
        <div style="position:absolute;bottom:6px;left:0;display:flex;gap:6px;padding:0 4px;">
          <button id="selectAnsBtn" title="Xem chi tiết" style="width:32px;height:32px;border:none;border-radius:8px;background:#e74c3c;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">👁️</button>
          <button id="copyAnsBtn" title="Copy đáp án" style="width:32px;height:32px;border:none;border-radius:8px;background:#e74c3c;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">📋</button>
        </div>
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

  document.getElementById('copyAnsBtn').onclick = function() {
    if (!allResults.length) return alert('Vui lòng Setup trước!');
    const btn = this;
    const rows = [];
    allResults.forEach((q, qi) => {
      if (q.type === 'choice') {
        const correct = q.options.filter(o => o.correct);
        const ans = correct.length ? correct.map(o => o.label + '. ' + o.text).join(', ') : '(Chưa xác định)';
        rows.push('Câu ' + (qi+1) + ': ' + q.qText);
        rows.push('→ ' + ans);
      } else if (q.type === 'fill') {
        rows.push('Câu ' + (qi+1) + ': ' + q.qText);
        q.blanks.forEach((b, bi) => rows.push('→ Chỗ ' + (bi+1) + ': ' + b.answer));
      }
      rows.push('');
    });
    const text = rows.join('\n').trim();
    const flash = () => { btn.textContent='✅'; btn.style.background='#27ae60'; setTimeout(() => { btn.textContent='📋'; btn.style.background='#e74c3c'; }, 1200); };
    navigator.clipboard.writeText(text).then(flash).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      flash();
    });
  };

  let isSmartHighlight = false;
  document.getElementById('smartHighlightBtn').onclick = function() {
    isSmartHighlight = !isSmartHighlight;
    this.classList.toggle('active-toggle', isSmartHighlight);
    this.textContent = isSmartHighlight ? 'Tắt Highlight' : 'Highlight/Fill';

    const color = '#00e676';
    getIframeDocs().forEach(doc => {
      
      doc.querySelectorAll('.h5p-sc-alternative.h5p-sc-is-correct').forEach(el => {
        el.style.outline = isSmartHighlight ? ('3px solid ' + color) : '';
        el.style.background = isSmartHighlight ? 'rgba(0,230,118,0.15)' : '';
      });
      
      doc.querySelectorAll('.h5p-true-false-answer').forEach(el => {
        const t = norm(el.innerText);
        const tfResult = allResults.find(r => r.type === 'choice' &&
          r.options.some(o => o.correct && norm(o.text) === t));
        const isCorrect = tfResult && tfResult.options.find(o => norm(o.text) === t)?.correct;
        el.style.outline = (isSmartHighlight && isCorrect) ? ('3px solid ' + color) : '';
        el.style.background = (isSmartHighlight && isCorrect) ? 'rgba(0,230,118,0.15)' : '';
      });
      
      doc.querySelectorAll('li.h5p-answer').forEach(el => {
        const inner = el.querySelector('.h5p-alternative-inner');
        const t = norm(inner ? inner.innerText : el.innerText);
        const mcResult = allResults.find(r => r.type === 'choice' &&
          r.options.some(o => o.correct && norm(o.text) === t));
        const isCorrect = mcResult && mcResult.options.find(o => norm(o.text) === t)?.correct;
        el.style.outline = (isSmartHighlight && isCorrect) ? ('3px solid ' + color) : '';
        el.style.background = (isSmartHighlight && isCorrect) ? 'rgba(0,230,118,0.15)' : '';
      });
      
      const DRAG_COLORS = [
        {bg:'#ffff00',bd:'#e6c800',tx:'#5a4a00',glow:'rgba(255,255,0,0.7)'},
        {bg:'#00ffff',bd:'#00c8c8',tx:'#004a4a',glow:'rgba(0,255,255,0.7)'},
        {bg:'#00ff88',bd:'#00c86e',tx:'#004a28',glow:'rgba(0,255,136,0.7)'},
        {bg:'#ff69b4',bd:'#e0408c',tx:'#5a0030',glow:'rgba(255,105,180,0.7)'},
        {bg:'#bf7fff',bd:'#9340e0',tx:'#3a0060',glow:'rgba(191,127,255,0.7)'},
        {bg:'#ff9900',bd:'#e07800',tx:'#5a2800',glow:'rgba(255,153,0,0.7)'},
      ];
      if (isSmartHighlight) {
        const allInputs = Array.from(doc.querySelectorAll('input.h5p-text-input'));
        const fillQs = allResults.filter(q => q.type === 'fill');
        fillQs.forEach(q => {
          q.blanks.forEach(b => {
            const inp = allInputs[b.globalIndex];
            if (!inp) return;
            inp.style.outline = '3px solid ' + color;
            inp.style.background = 'rgba(0,230,118,0.15)';
            fillInput(inp, b.answer);
          });
        });
        const dragQs = allResults.filter(q => q.type === 'drag');
        const DC=[
          {bg:'#FFD700',bd:'#B8860B',tx:'#333',glow:'rgba(255,215,0,0.6)'},
          {bg:'#FFA500',bd:'#CC6600',tx:'#333',glow:'rgba(255,165,0,0.6)'},
          {bg:'#FF8C00',bd:'#CC5500',tx:'#fff',glow:'rgba(255,140,0,0.6)'},
          {bg:'#FF6347',bd:'#CC2200',tx:'#fff',glow:'rgba(255,99,71,0.6)'},
          {bg:'#FF4500',bd:'#CC1100',tx:'#fff',glow:'rgba(255,69,0,0.6)'},
          {bg:'#FF69B4',bd:'#CC1177',tx:'#fff',glow:'rgba(255,105,180,0.6)'},
          {bg:'#FF1493',bd:'#CC0066',tx:'#fff',glow:'rgba(255,20,147,0.6)'},
          {bg:'#DB7093',bd:'#AA2255',tx:'#fff',glow:'rgba(219,112,147,0.6)'},
          {bg:'#C71585',bd:'#880033',tx:'#fff',glow:'rgba(199,21,133,0.6)'},
          {bg:'#DC143C',bd:'#AA0022',tx:'#fff',glow:'rgba(220,20,60,0.6)'},
          {bg:'#9370DB',bd:'#5500AA',tx:'#fff',glow:'rgba(147,112,219,0.6)'},
          {bg:'#8A2BE2',bd:'#5500BB',tx:'#fff',glow:'rgba(138,43,226,0.6)'},
          {bg:'#7B68EE',bd:'#3300CC',tx:'#fff',glow:'rgba(123,104,238,0.6)'},
          {bg:'#6A5ACD',bd:'#3300AA',tx:'#fff',glow:'rgba(106,90,205,0.6)'},
          {bg:'#9932CC',bd:'#6600AA',tx:'#fff',glow:'rgba(153,50,204,0.6)'},
          {bg:'#8B008B',bd:'#550055',tx:'#fff',glow:'rgba(139,0,139,0.6)'},
          {bg:'#4B0082',bd:'#220044',tx:'#fff',glow:'rgba(75,0,130,0.6)'},
          {bg:'#1E90FF',bd:'#0055CC',tx:'#fff',glow:'rgba(30,144,255,0.6)'},
          {bg:'#4169E1',bd:'#1133AA',tx:'#fff',glow:'rgba(65,105,225,0.6)'},
          {bg:'#0000CD',bd:'#000088',tx:'#fff',glow:'rgba(0,0,205,0.6)'},
          {bg:'#00BFFF',bd:'#0088BB',tx:'#333',glow:'rgba(0,191,255,0.6)'},
          {bg:'#87CEEB',bd:'#2277AA',tx:'#333',glow:'rgba(135,206,235,0.6)'},
          {bg:'#4682B4',bd:'#1144AA',tx:'#fff',glow:'rgba(70,130,180,0.6)'},
          {bg:'#00CED1',bd:'#007788',tx:'#fff',glow:'rgba(0,206,209,0.6)'},
          {bg:'#20B2AA',bd:'#006655',tx:'#fff',glow:'rgba(32,178,170,0.6)'},
          {bg:'#008B8B',bd:'#005555',tx:'#fff',glow:'rgba(0,139,139,0.6)'},
          {bg:'#00FA9A',bd:'#006633',tx:'#333',glow:'rgba(0,250,154,0.6)'},
          {bg:'#3CB371',bd:'#115533',tx:'#fff',glow:'rgba(60,179,113,0.6)'},
          {bg:'#32CD32',bd:'#116611',tx:'#fff',glow:'rgba(50,205,50,0.6)'},
          {bg:'#228B22',bd:'#114411',tx:'#fff',glow:'rgba(34,139,34,0.6)'},
          {bg:'#006400',bd:'#003300',tx:'#fff',glow:'rgba(0,100,0,0.6)'},
          {bg:'#ADFF2F',bd:'#779900',tx:'#333',glow:'rgba(173,255,47,0.6)'},
          {bg:'#7FFF00',bd:'#559900',tx:'#333',glow:'rgba(127,255,0,0.6)'},
          {bg:'#66CDAA',bd:'#228866',tx:'#333',glow:'rgba(102,205,170,0.6)'},
          {bg:'#D2691E',bd:'#884400',tx:'#fff',glow:'rgba(210,105,30,0.6)'},
          {bg:'#CD853F',bd:'#886622',tx:'#fff',glow:'rgba(205,133,63,0.6)'},
          {bg:'#8B4513',bd:'#552200',tx:'#fff',glow:'rgba(139,69,19,0.6)'},
          {bg:'#A0522D',bd:'#663300',tx:'#fff',glow:'rgba(160,82,45,0.6)'},
          {bg:'#DEB887',bd:'#996633',tx:'#333',glow:'rgba(222,184,135,0.6)'},
          {bg:'#708090',bd:'#334455',tx:'#fff',glow:'rgba(112,128,144,0.6)'},
          {bg:'#2F4F4F',bd:'#113333',tx:'#fff',glow:'rgba(47,79,79,0.6)'},
          {bg:'#696969',bd:'#333333',tx:'#fff',glow:'rgba(105,105,105,0.6)'},
          {bg:'#778899',bd:'#334455',tx:'#fff',glow:'rgba(119,136,153,0.6)'},
          {bg:'#FF7F50',bd:'#CC3300',tx:'#fff',glow:'rgba(255,127,80,0.6)'},
          {bg:'#FA8072',bd:'#CC2211',tx:'#fff',glow:'rgba(250,128,114,0.6)'},
          {bg:'#E9967A',bd:'#AA4422',tx:'#fff',glow:'rgba(233,150,122,0.6)'},
          {bg:'#F08080',bd:'#CC2222',tx:'#fff',glow:'rgba(240,128,128,0.6)'},
          {bg:'#FFA07A',bd:'#CC5533',tx:'#333',glow:'rgba(255,160,122,0.6)'},
          {bg:'#5F9EA0',bd:'#226677',tx:'#fff',glow:'rgba(95,158,160,0.6)'},
          {bg:'#B0C4DE',bd:'#4466AA',tx:'#333',glow:'rgba(176,196,222,0.6)'},
          {bg:'#ADD8E6',bd:'#3377AA',tx:'#333',glow:'rgba(173,216,230,0.6)'},
          {bg:'#87CEFA',bd:'#2266AA',tx:'#333',glow:'rgba(135,206,250,0.6)'},
          {bg:'#BC8F8F',bd:'#774444',tx:'#fff',glow:'rgba(188,143,143,0.6)'},
          {bg:'#F4A460',bd:'#AA5500',tx:'#333',glow:'rgba(244,164,96,0.6)'},
          {bg:'#DAA520',bd:'#886600',tx:'#333',glow:'rgba(218,165,32,0.6)'},
          {bg:'#B8860B',bd:'#664400',tx:'#fff',glow:'rgba(184,134,11,0.6)'},
          {bg:'#FF00FF',bd:'#AA00AA',tx:'#fff',glow:'rgba(255,0,255,0.6)'},
          {bg:'#00FF7F',bd:'#007733',tx:'#333',glow:'rgba(0,255,127,0.6)'},
          {bg:'#7FFFD4',bd:'#228866',tx:'#333',glow:'rgba(127,255,212,0.6)'},
          {bg:'#FFDAB9',bd:'#BB8844',tx:'#333',glow:'rgba(255,218,185,0.6)'},
          {bg:'#E6E6FA',bd:'#5555AA',tx:'#333',glow:'rgba(230,230,250,0.6)'},
        ];        // Dùng H5P.instances trực tiếp để highlight đúng element
        const win3 = doc.defaultView;
        if (win3 && win3.H5P && win3.H5P.instances) {
          win3.H5P.instances.forEach(inst => {
            const lib = inst.libraryInfo?.versionedNameNoSpaces || '';
            if (!lib.includes('DragText')) return;
            if (!inst.droppables || !inst.draggables) return;

            // Inject style tag vào doc của H5P
            const iDoc = inst.droppables[0]?.getElement?.()?.ownerDocument || doc;
            let st = iDoc.getElementById('_hack_drag_st_');
            if (!st) {
              st = iDoc.createElement('style');
              st.id = '_hack_drag_st_';
              (iDoc.head || iDoc.body).appendChild(st);
            }
            let css = '';

            if (isSmartHighlight) {
              // Highlight dropzones (ô trống)
              inst.droppables.forEach((drop, i) => {
                const el = drop.getElement ? drop.getElement() : null;
                const container = el ? el.closest('.h5p-drag-dropzone-container') || el.parentElement : null;
                const col = DC[i % DC.length];
                if (el) {
                  const cls = '_dz'+i+'_';
                  el.classList.add(cls);
                  css += '.'+cls+'{outline:3px solid '+col.bd+' !important;background:'+col.bg+' !important;box-shadow:0 0 14px 5px '+col.glow+' !important;border-radius:6px !important;}';
                }
                if (container) {
                  container.querySelectorAll('._drag_lbl_').forEach(l=>l.remove());
                  const lbl = iDoc.createElement('span');
                  lbl.className = '_drag_lbl_';
                  lbl.style.cssText = 'position:absolute;top:-18px;left:0;font-size:10px;font-weight:900;background:'+col.bd+';color:'+col.tx+';border-radius:3px;padding:0 5px;z-index:9999;pointer-events:none;white-space:nowrap;';
                  lbl.textContent = 'Ô'+(i+1)+': '+drop.text;
                  container.style.position = 'relative';
                  container.appendChild(lbl);
                }
              });

              // Build answer set để match draggable
              const answerList = inst.droppables.map((d,i) => ({text: norm(d.text), idx: i}));
              const answerColorMap = {};
              const answerQueue = {};
              answerList.forEach(({text, idx}) => {
                if (!answerQueue[text]) answerQueue[text] = [];
                answerQueue[text].push(DC[idx % DC.length]);
              });
              const answerUsed = {};
              const correctSet = new Set(answerList.map(a=>a.text));

              inst.draggables.forEach(drag => {
                const el = drag.getElement ? drag.getElement() : null;
                if (!el) return;
                const w = norm(drag.getAnswerText ? drag.getAnswerText() : '');
                const isCorrect = correctSet.has(w);
                // Remove old classes
                el.className = el.className.replace(/_dr[a-z0-9]+/g, '').trim();
                if (isCorrect) {
                  const queue = answerQueue[w] || [];
                  const used = answerUsed[w] || 0;
                  const col = queue[used % queue.length];
                  answerUsed[w] = used + 1;
                  if (col) {
                    const cls = '_dr'+Math.random().toString(36).slice(2,7);
                    el.classList.add(cls);
                    css += '.'+cls+'{outline:3px solid '+col.bd+' !important;background:'+col.bg+' !important;color:'+col.tx+' !important;box-shadow:0 0 14px 5px '+col.glow+' !important;font-weight:900 !important;border-radius:6px !important;opacity:1 !important;filter:none !important;}';
                  }
                } else {
                  el.style.setProperty('opacity','0.22','important');
                  el.style.setProperty('filter','grayscale(90%)','important');
                }
              });

            } else {
              // Reset
              iDoc.querySelectorAll('[class*="_dz"],[class*="_dr"]').forEach(el => {
                el.className = el.className.replace(/_dz\d+_|_dr[a-z0-9]+/g,'').trim();
                el.style.removeProperty('opacity');
                el.style.removeProperty('filter');
              });
              iDoc.querySelectorAll('._drag_lbl_').forEach(l=>l.remove());
            }

            if (st) st.textContent = css;
          });
        }
        const markQs = allResults.filter(q => q.type === 'mark');
        markQs.forEach(mq => {
          // Mỗi từ đúng dùng màu riêng từ DC palette
          const markDC = [
            {bg:'#FFD700',bd:'#B8860B',tx:'#333'},{bg:'#FF69B4',bd:'#CC1177',tx:'#fff'},
            {bg:'#00CED1',bd:'#007788',tx:'#fff'},{bg:'#9370DB',bd:'#5500AA',tx:'#fff'},
            {bg:'#32CD32',bd:'#116611',tx:'#fff'},{bg:'#FF6347',bd:'#CC2200',tx:'#fff'},
            {bg:'#1E90FF',bd:'#0055CC',tx:'#fff'},{bg:'#FF8C00',bd:'#CC5500',tx:'#333'},
            {bg:'#DA70D6',bd:'#993399',tx:'#fff'},{bg:'#3CB371',bd:'#115533',tx:'#fff'},
            {bg:'#DC143C',bd:'#AA0022',tx:'#fff'},{bg:'#4682B4',bd:'#1144AA',tx:'#fff'},
          ];
          const wordColorMap = {};
          mq.answers.forEach((a, i) => { wordColorMap[a.toLowerCase().trim()] = markDC[i % markDC.length]; });
          const applyHL = (sp, on, col) => {
            sp.style.background   = on && col ? col.bg : '';
            sp.style.outline      = on && col ? '2px solid '+col.bd : '';
            sp.style.borderRadius = on ? '5px' : '';
            sp.style.fontWeight   = on ? '900' : '';
            sp.style.boxShadow    = on && col ? '0 0 10px 3px '+col.bd+'99' : '';
            sp.style.color        = on && col ? col.tx : '';
            sp.style.padding      = on ? '0 3px' : '';
          };
          const win3 = doc.defaultView;
          let marked = false;
          if (win3 && win3.H5P && win3.H5P.instances) {
            win3.H5P.instances.forEach(inst => {
              if (!(inst.libraryInfo?.versionedNameNoSpaces||'').includes('MarkTheWords')) return;
              if (!inst.selectableWords) return;
              // span DOM và selectableWords tương ứng 1:1 theo index
              const spans = Array.from(doc.querySelectorAll('span[role="option"]'));
              inst.selectableWords.forEach((w, wi) => {
                const sp = spans[wi];
                if (!sp) return;
                const _w = (sp.innerText||'').toLowerCase().trim();
              applyHL(sp, isSmartHighlight && w.isAnswer(), wordColorMap[_w]);
              });
              marked = true;
            });
          }
          if (!marked) {
            const answerSet = new Set(mq.answers.map(a => a.toLowerCase()));
            const spans = Array.from(doc.querySelectorAll('.h5p-word-selectable-words span:not(.hidden-but-read)'));
            spans.forEach(sp => {
              const t = (sp.innerText||'').trim().toLowerCase();
              const _t2 = t.toLowerCase().trim();
            applyHL(sp, isSmartHighlight && answerSet.has(t), wordColorMap[_t2]);
            });
          }
        });
        const iDoc2 = doc.querySelector('.h5p-drag-dropzone-container')?.ownerDocument || doc;
        const st = iDoc2.getElementById('_hack_drag_style_');
        if (st) { st.textContent = ''; }
        iDoc2.querySelectorAll('[class*="_dz_hl_"],[class*="_drag_hl_"]').forEach(el => {
          el.className = el.className.replace(/_dz_hl_\d+_|_drag_hl_[a-z0-9]+/g,'').trim();
          el.style.opacity=''; el.style.filter='';
        });
        doc.querySelectorAll('._drag_lbl_').forEach(el => el.remove());
        doc.querySelectorAll('.ui-droppable').forEach(el => {
          el.style.outline = ''; el.style.background = ''; el.style.boxShadow = '';
        });
        doc.querySelectorAll('.h5p-drag-draggables-container .ui-draggable').forEach(el => {
          el.style.opacity = ''; el.style.filter = ''; el.style.transform = ''; el.style.transition = ''; el.style.zIndex = '';
        });
      }
    });
  };

  document.getElementById('selectAnsBtn').onclick = function() {
    if (!allResults.length) return alert('Vui lòng Setup trước!');
    const btn = this;
    
    document.getElementById('lmsDetailModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'lmsDetailModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",sans-serif;';
    let html = '<div style="background:#fff;border-radius:14px;padding:20px;max-width:460px;width:92vw;max-height:82vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">';
    html += '<div style="font-weight:700;font-size:15px;color:#2c3e50;margin-bottom:14px;border-bottom:2px solid #eee;padding-bottom:8px;">📋 Chi tiết đáp án</div>';
    allResults.forEach((q, qi) => {
      html += '<div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;">';
      html += '<div style="font-weight:600;font-size:13px;color:#2c3e50;margin-bottom:6px;">Câu '+(qi+1)+': '+q.qText.replace(/</g,'&lt;').substring(0,120)+'</div>';
      if (q.type === 'choice') {
        const hasCorrect = q.options.some(o => o.correct);
        q.options.forEach(o => {
          if (o.correct) {
            html += '<div style="background:#e8f8f0;border-left:3px solid #27ae60;padding:5px 10px;border-radius:4px;font-size:13px;color:#1a7a4a;font-weight:600;margin-top:3px;">✅ '+o.label+'. '+o.text.replace(/</g,'&lt;')+'</div>';
          } else {
            html += '<div style="padding:4px 10px;border-left:3px solid #ddd;font-size:12px;color:#888;margin-top:2px;">'+o.label+'. '+o.text.replace(/</g,'&lt;')+'</div>';
          }
        });
        if (!hasCorrect) html += '<div style="color:#e67e22;font-size:12px;margin-top:3px;">⚠️ Chưa xác định đáp án đúng</div>';
      } else if (q.type === 'fill') {
        q.blanks.forEach((b, bi) => {
          html += '<div style="background:#eaf4fb;border-left:3px solid #3498db;padding:5px 10px;border-radius:4px;font-size:13px;color:#1a5276;font-weight:600;margin-top:3px;">✏️ Chỗ '+(bi+1)+': '+b.answer.replace(/</g,'&lt;')+'</div>';
        });
      }
      html += '</div>';
    });
    html += '<button id="lmsDetailClose" style="width:100%;padding:10px;border:none;border-radius:8px;background:#e74c3c;color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-top:4px;">✕ Thoát</button>';
    html += '</div>';
    modal.innerHTML = html;
    modal.querySelector('#lmsDetailClose').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    
    btn.textContent = '✅'; btn.style.background='#27ae60';
    setTimeout(() => { btn.textContent = '👁️'; btn.style.background='#e74c3c'; }, 1200);
  };

  const filterQ = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.q-box').forEach(b => {
      b.style.display = b.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
  };
  document.getElementById('searchBtn').onclick = filterQ;
  document.getElementById('searchInput').addEventListener('input', filterQ);

  
  document.getElementById('runBtn').onclick = () => {
    // Single choice
    queryAll('.h5p-sc-alternative.h5p-sc-is-correct').forEach(el => forceSelectElement(el));
    // DragText: auto kéo thả
    getIframeDocs().forEach(doc => {
      const win = doc.defaultView;
      if (!win || !win.H5P || !win.H5P.instances) return;
      win.H5P.instances.forEach(inst => {
        const lib = inst.libraryInfo?.versionedNameNoSpaces || '';
        if (!lib.includes('DragText')) return;
        if (!inst.droppables || !inst.draggables) return;
        // Reset trước
        try { inst.resetTask && inst.resetTask(); } catch(e) {}
        // Kéo từng draggable vào đúng dropzone theo text match
        setTimeout(() => {
          inst.droppables.forEach(drop => {
            const correctText = drop.text;
            const drag = inst.draggables.find(d => (d.getAnswerText ? d.getAnswerText() : d.text) === correctText && !d.isInsideDropZone());
            if (drag && !drop.hasDraggable()) {
              try { inst.drop(drag, drop); } catch(e) {}
            }
          });
          // Bấm Kiểm tra nếu có
          setTimeout(() => {
            const checkBtn = doc.querySelector('.h5p-joubelui-button.h5p-question-check-answer, button.h5p-joubelui-button');
            if (checkBtn) checkBtn.click();
          }, 300);
        }, 200);
      });
    });
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
