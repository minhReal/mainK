// t kinh ngạc vì m vào đc trong đây nhưng m vô trong đây thì chẳng làm được moe gì đâu
// 🔧 Chỉnh 1 dòng duy nhất: "true" hoặc "false" để bật/tắt loop
const LOOP_AFTER_NEXT = true;

(async () => {
  console.log(`# Chạy chế độ PC`);

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

  let index = Number(localStorage.getItem("_chonVaNop_index") || 0);

  async function chonVaNopCauHoi() {
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
    if (options.length === 0) return console.log("🔴 Không có lựa chọn nào");

    const i = index % options.length;
    simulateClick(options[i]);
    console.log(`🟡 Chọn đáp án thứ ${i + 1}`);
    index++;
    localStorage.setItem("_chonVaNop_index", index);

    const submitBtn = document.querySelector("#ws-problem-container .submit-attempt-container > button");
    if (!submitBtn) return console.log("🔴 Không tìm thấy nút submit.");
    simulateClick(submitBtn);

    await new Promise(r => setTimeout(r, 1200));

    const popupBtn = document.querySelector("body .ui-dialog-buttonpane button");
    if (popupBtn) {
      simulateClick(popupBtn);
      console.log("🟡 Đang gửi popup nếu có");
    }

    await new Promise(r => setTimeout(r, 1500));

    const correctNow = container.querySelector("span.status.correct");
    if (correctNow) {
      console.log("🟢 Đáp án đúng đã hiển thị");
      await clickNextButton();
      return;
    }

    const submitBtnMoi = document.querySelector("#ws-problem-container .submit-attempt-container > button");
    if (submitBtnMoi) {
      await chonVaNopCauHoi();
    } else {
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
      console.log("🟢 Chuyển qua bài khác");

      if (LOOP_AFTER_NEXT) {
        // Nếu bật loop, gọi lại function để tiếp tục làm bài
        await new Promise(r => setTimeout(r, 1000));
        chonVaNopCauHoi();
      }
    } else {
      console.log("🔴 Không tìm thấy nút NEXT.");
    }
  }

  // Bắt đầu
  chonVaNopCauHoi();
})();
