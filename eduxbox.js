// by minh
(async () => {
    console.log("Chạy chế độ PC");

    // ----- Hàm lấy thông tin máy tính -----
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceType = "PC";
        if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(ua)) deviceType = "Mac";
        else if (/Windows/.test(ua)) deviceType = "Windows PC";
        else if (/Linux/.test(ua)) deviceType = "Linux PC";
        else if (/Android/.test(ua)) deviceType = "Android";
        else if (/iPhone|iPad|iPod/.test(ua)) deviceType = "iOS";
        return deviceType;
    }

    // ----- Hàm gửi tin nhắn lên Discord (Replit Server) -----
    async function notifyDiscord(msg) {
        try {
            await fetch("https://YOUR-REPLIT-URL.repl.co/send", { // Thay YOUR-REPLIT-URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg })
            });
        } catch (err) {
            console.error("Không thể gửi tin nhắn Discord:", err);
        }
    }

    // Gửi thông báo khi script được kích hoạt
    const device = getDeviceInfo();
    notifyDiscord(`Máy tính (${device}) đã dùng script tự động.`);

    // ----- Script gốc tự động chọn và nộp -----
    const LOOP_AFTER_NEXT = true;

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

    async function handlePopup() {
        const popupButtons = document.querySelectorAll("body .ui-dialog-buttonpane button");
        if (!popupButtons || popupButtons.length === 0) return;

        for (const btn of popupButtons) {  
            if (btn.offsetParent !== null) {  
                btn.scrollIntoView({ behavior: "smooth", block: "center" });  
                await new Promise(r => setTimeout(r, 300));  
                simulateClick(btn);  
                console.log("Đang gửi popup nếu có");  
                await new Promise(r => setTimeout(r, 500));  
            }  
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
            console.log("Chuyển qua bài khác");

            if (LOOP_AFTER_NEXT) {  
                await new Promise(r => setTimeout(r, 1000));  
                chonVaNopCauHoi();  
            }  
        } else {  
            console.log("Không tìm thấy nút NEXT.");  
        }
    }

    async function chonVaNopCauHoi() {
        const container = Array.from(document.querySelectorAll('[id^="inputtype_"]')).find(el =>
            el.id.includes("_2_1")
        );
        if (!container) return console.log("Không tìm thấy container câu hỏi.");

        const fieldset = container.querySelector("fieldset");  
        if (!fieldset) return console.log("Không tìm thấy fieldset.");  

        const correctSpan = container.querySelector("span.status.correct");  
        if (correctSpan) {  
            await clickNextButton();  
            return;  
        }  

        const options = Array.from(fieldset.querySelectorAll('input[type="radio"], input[type="checkbox"]'));  
        if (options.length === 0) return console.log("Không có lựa chọn nào");  

        const i = index % options.length;  
        simulateClick(options[i]);  
        console.log(`Chọn đáp án thứ ${i + 1}`);

        // Gửi thông báo lên Discord khi chọn câu
        notifyDiscord(`Máy tính (${device}) chọn đáp án ${i + 1}`);

        index++;  
        localStorage.setItem("_chonVaNop_index", index);  

        const submitBtn = document.querySelector("#ws-problem-container .submit-attempt-container > button");  
        if (!submitBtn) return console.log("Không tìm thấy nút submit.");  
        simulateClick(submitBtn);  

        await new Promise(r => setTimeout(r, 1200));  
        await handlePopup();  
        await new Promise(r => setTimeout(r, 1500));  

        const correctNow = container.querySelector("span.status.correct");  
        if (correctNow) {  
            console.log("Đáp án đúng đã hiển thị");  
            await clickNextButton();  
            return;  
        }  

        const submitBtnMoi = document.querySelector("#ws-problem-container .submit-attempt-container > button");  
        if (submitBtnMoi) {  
            await chonVaNopCauHoi();  
        }
    }

    // Bắt đầu chạy
    chonVaNopCauHoi();

})();
