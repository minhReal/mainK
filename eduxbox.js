// Script tá»± Ä‘á»™ng chá»n Ä‘Ă¡p Ă¡n vĂ  submit trĂªn PC
const LOOP_AFTER_NEXT = true; // true = tá»± Ä‘á»™ng loop

(async () => {
  console.log(`# Cháº¡y cháº¿ Ä‘á»™ PC`);

  // HĂ m giáº£ láº­p click chuáº©n
  function simulateClick(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    try {
      el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
    } catch {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }
  }

  // Láº¥y index hiá»‡n táº¡i tá»« localStorage
  let index = Number(localStorage.getItem("_chonVaNop_index") || 0);

  // HĂ m xá»­ lĂ½ popup náº¿u cĂ³
  async function handlePopup() {
    const popupButtons = document.querySelectorAll("body .ui-dialog-buttonpane button");
    if (!popupButtons || popupButtons.length === 0) return;

    for (const btn of popupButtons) {
      if (btn.offsetParent !== null) { // chá»‰ click náº¿u button hiá»ƒn thá»‹
        btn.scrollIntoView({ behavior: "smooth", block: "center" });
        await new Promise(r => setTimeout(r, 300));
        simulateClick(btn);
        console.log("đŸŸ¡ Äang gá»­i popup náº¿u cĂ³");
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  // HĂ m click NEXT
  async function clickNextButton() {
    const nextBtnSpan = Array.from(document.querySelectorAll("span.sequence-nav-button-label")).find(
      el => el.textContent.trim().toUpperCase() === "NEXT"
    );
    if (nextBtnSpan) {
      const nextBtn = nextBtnSpan.closest("button") || nextBtnSpan;
      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
      await new Promise(r => setTimeout(r, 500));
      simulateClick(nextBtn);
      console.log("đŸŸ¢ Chuyá»ƒn qua bĂ i khĂ¡c");

      if (LOOP_AFTER_NEXT) {
        await new Promise(r => setTimeout(r, 1000));
        chonVaNopCauHoi();
      }
    } else {
      console.log("đŸ”´ KhĂ´ng tĂ¬m tháº¥y nĂºt NEXT.");
    }
  }

  // HĂ m chá»n vĂ  ná»™p cĂ¢u há»i
  async function chonVaNopCauHoi() {
    const container = Array.from(document.querySelectorAll('[id^="inputtype_"]')).find(el =>
      el.id.includes("_2_1")
    );
    if (!container) return console.log("đŸ”´ KhĂ´ng tĂ¬m tháº¥y container cĂ¢u há»i.");

    const fieldset = container.querySelector("fieldset");
    if (!fieldset) return console.log("đŸ”´ KhĂ´ng tĂ¬m tháº¥y fieldset.");

    const correctSpan = container.querySelector("span.status.correct");
    if (correctSpan) {
      await clickNextButton();
      return;
    }

    const options = Array.from(fieldset.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
    if (options.length === 0) return console.log("đŸ”´ KhĂ´ng cĂ³ lá»±a chá»n nĂ o");

    const i = index % options.length;
    simulateClick(options[i]);
    console.log(`đŸŸ¡ Chá»n Ä‘Ă¡p Ă¡n thá»© ${i + 1}`);
    index++;
    localStorage.setItem("_chonVaNop_index", index);

    // Submit cĂ¢u tráº£ lá»i
    const submitBtn = document.querySelector("#ws-problem-container .submit-attempt-container > button");
    if (!submitBtn) return console.log("đŸ”´ KhĂ´ng tĂ¬m tháº¥y nĂºt submit.");
    simulateClick(submitBtn);

    await new Promise(r => setTimeout(r, 1200));

    // Xá»­ lĂ½ popup náº¿u cĂ³
    await handlePopup();

    await new Promise(r => setTimeout(r, 1500));

    // Kiá»ƒm tra Ä‘Ă¡p Ă¡n Ä‘Ăºng
    const correctNow = container.querySelector("span.status.correct");
    if (correctNow) {
      console.log("đŸŸ¢ ÄĂ¡p Ă¡n Ä‘Ăºng Ä‘Ă£ hiá»ƒn thá»‹");
      await clickNextButton();
      return;
    }

    // Náº¿u váº«n chÆ°a cĂ³ nĂºt submit má»›i, gá»i láº¡i
    const submitBtnMoi = document.querySelector("#ws-problem-container .submit-attempt-container > button");
    if (submitBtnMoi) {
      await chonVaNopCauHoi();
    }
  }

  // Báº¯t Ä‘áº§u cháº¡y
  chonVaNopCauHoi();

})();
