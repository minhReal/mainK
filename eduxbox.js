// t kinh ngạc vì m vào đc trong đây nhưng m vô trong đây thì chẳng làm được moe gì đâu
(async () => {
  const MODE = window._deviceMode
  console.log(`# Theo như t thấy là m đã chọn ${MODE.toUpperCase()}`);

  function simulateClick(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const evts =
      MODE === "mob"
        ? ["touchstart", "touchend", "click"]
        : ["mousedown", "mouseup", "click"];

    for (const evt of evts) {
      try {
        const e =
          evt.startsWith("touch")
            ? new TouchEvent(evt, {
                bubbles: true,
                cancelable: true,
                touches: [new Touch({ identifier: Date.now(), target: el, clientX: x, clientY: y })],
              })
            : new MouseEvent(evt, { bubbles: true, cancelable: true, clientX: x, clientY: y });
        el.dispatchEvent(e);
      } catch {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
    }
  }

  async function chonVaNopCauHoi() {
    console.log("🟢 Checking..");
    const container = Array.from(document.querySelectorAll('[id^="inputtype_"]')).find(el =>
      el.id.includes("_2_1")
    );
    if (!container) return console.log("🔴 Không tìm thấy container câu hỏi.");

    const fieldset = container.querySelector("fieldset");
    if (!fieldset) return console.log("🔴 Không tìm thấy fieldset.");

    const correctSpan = container.querySelector("span.status.correct");
    if (correctSpan) {
      await clickNextButton();
      return;
    }

    const options = Array.from(fieldset.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
    if (options.length === 0) return console.log("🔴 Không có lựa chọn.");

    if (!window._chonVaNop_index) window._chonVaNop_index = 0;
    const i = window._chonVaNop_index % options.length;
    const option = options[i];
    window._chonVaNop_index++;

    simulateClick(option);
    console.log(`🟡 Đang chọn đáp án thứ ${i + 1}`);

    const submitBtn = document.querySelector("#ws-problem-container .submit-attempt-container > button");
    if (!submitBtn) return console.log("🔴 Không tìm thấy nút Nộp.");
    simulateClick(submitBtn);

    await new Promise(r => setTimeout(r, 1200));

    const popupBtn = document.querySelector("body .ui-dialog-buttonpane button");
    if (popupBtn) {
      simulateClick(popupBtn);
      console.log("🟡 Đang gửi...");
    }

    await new Promise(r => setTimeout(r, 1500));

    const correctNow = container.querySelector("span.status.correct");
    if (correctNow) {
      console.log("🟢 Đã tìm đc đáp án đúng");
      await clickNextButton();
      return;
    }

    const submitBtnMoi = document.querySelector("#ws-problem-container .submit-attempt-container > button");
    if (submitBtnMoi) {
      await chonVaNopCauHoi();
    } else {
      console.log("🏁 Hết câu hỏi.");
    }
  }

  async function clickNextButton() {
    const nextBtnSpan = Array.from(document.querySelectorAll("span.sequence-nav-button-label")).find(
      el => el.textContent.trim().toUpperCase() === "NEXT"
    );
    if (nextBtnSpan) {
      const nextBtn = nextBtnSpan.closest("button") || nextBtnSpan;
      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
      await new Promise(r => setTimeout(r, 500));
      simulateClick(nextBtn);
      console.log("🟢 Ok rồi, giờ chuyển qua trang mới");
      await new Promise(r => setTimeout(r, 2000));
      await chonVaNopCauHoi();
    } else {
      console.log("🔴 Không tìm thấy nút NEXT.");
    }
  }

  chonVaNopCauHoi();
})();
