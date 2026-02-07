export default {
  async fetch(request, env, ctx) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ questions: [] }), { headers });

    // 1. Check Cache
    try {
        const cached = await env.DB.get(id);
        if (cached) return new Response(cached, { headers });
    } catch (e) {}

    // 2. Proxy & Scan
    try {
        const userCookie = request.headers.get("x-lms-cookie");
        const userAgent = request.headers.get("x-user-agent") || "Mozilla/5.0";
        
        // Gọi sang LMS360
        const lmsRes = await fetch(`https://lms360.vn/h5p/${id}/play`, {
            headers: {
                "User-Agent": userAgent,
                "Referer": "https://lms360.vn/",
                "Cookie": userCookie || ""
            }
        });

        const html = await lmsRes.text();
        
        // Regex mạnh hơn để bắt JSON (kể cả khi có xuống dòng)
        const regex = /H5PIntegration\s*=\s*(\{[\s\S]*?\});/s;
        const match = html.match(regex);

        if (match && match[1]) {
            const h5pData = JSON.parse(match[1]);
            const contentKey = Object.keys(h5pData.contents)[0];
            
            if (contentKey && h5pData.contents[contentKey]) {
                // Parse nội dung JSON của bài học
                const jsonRaw = h5pData.contents[contentKey].jsonContent;
                // jsonContent thường là string, cần parse lần nữa. Nếu là object rồi thì thôi.
                const jsonContent = typeof jsonRaw === "string" ? JSON.parse(jsonRaw) : jsonRaw;
                
                let allQuestions = [];

                // --- HÀM ĐỆ QUY QUÉT SÂU (SUPER DEEP SCAN) ---
                function recursiveFind(obj) {
                    if (!obj || typeof obj !== 'object') return;

                    // CASE 1: Dạng trắc nghiệm (MultiChoice / SingleChoiceSet)
                    // Đặc điểm: Có mảng 'answers' hoặc 'alternatives'
                    const ansArr = obj.answers || obj.alternatives;
                    if (Array.isArray(ansArr) && ansArr.length > 0) {
                        // Kiểm tra xem có thuộc tính 'correct' bên trong không
                        const hasCorrect = ansArr.some(a => (a.correct !== undefined || Array.isArray(a.correct)));
                        
                        if (hasCorrect) {
                            let qText = obj.question || obj.text || (obj.params ? obj.params.question : "Câu hỏi");
                            // Lọc đáp án đúng
                            let parsedAns = [];
                            ansArr.forEach(a => {
                                // H5P có nhiều kiểu correct: true, correct: "true", hoặc nằm trong sub-params
                                const isTrue = (a.correct === true || a.correct === "true");
                                parsedAns.push({ text: a.text || a.label || "...", correct: isTrue });
                            });
                            
                            allQuestions.push({ question: qText, answers: parsedAns });
                            return; // Đã tìm thấy ở nhánh này, dừng đào sâu nhánh này
                        }
                    }

                    // CASE 2: Dạng True/False
                    // Đặc điểm: Có params.correct là "true" hoặc "false"
                    if (obj.library && String(obj.library).includes("TrueFalse") && obj.params) {
                        const isTrue = (obj.params.correct === "true" || obj.params.correct === true);
                        allQuestions.push({
                            question: obj.params.question || "Đúng hay Sai?",
                            answers: [
                                { text: "True (Đúng)", correct: isTrue },
                                { text: "False (Sai)", correct: !isTrue }
                            ]
                        });
                        return;
                    }
                    
                    // CASE 3: Drag Text (Điền từ)
                    // Đặc điểm: textField chứa cú pháp *đáp án*
                    if (obj.library && String(obj.library).includes("DragText") && obj.params && obj.params.textField) {
                        // Regex tìm các từ nằm giữa 2 dấu sao: *từ đúng*
                        const answers = [];
                        const text = obj.params.textField.replace(/\*([^*]+)\*/g, (match, p1) => {
                            // p1 là đáp án đúng (ví dụ: *apple* -> apple)
                            // Tách trường hợp có hint: *apple:hint*
                            let ans = p1.split(':')[0]; 
                            answers.push({ text: ans, correct: true });
                            return `[${ans}]`;
                        });
                        
                        allQuestions.push({
                            question: obj.params.taskDescription || "Điền từ vào chỗ trống",
                            answers: answers
                        });
                        return;
                    }

                    // ĐỆ QUY: Duyệt tiếp con cháu
                    if (Array.isArray(obj)) {
                        obj.forEach(item => recursiveFind(item));
                    } else {
                        Object.keys(obj).forEach(key => {
                            // Bỏ qua metadata để tăng tốc
                            if (key !== 'metadata' && key !== 'subContentId') {
                                recursiveFind(obj[key]);
                            }
                        });
                    }
                }

                // Chạy quét
                recursiveFind(jsonContent);

                if (allQuestions.length > 0) {
                    // Format HTML trả về
                    let finalRes = allQuestions.map(q => {
                        let html = `<div>${q.question}</div><ul>`;
                        q.answers.forEach(a => {
                            let cls = a.correct ? "highlight" : "";
                            let tick = a.correct ? "✅" : "";
                            html += `<li class="${cls}">${a.text} ${tick}</li>`;
                        });
                        html += `</ul>`;
                        return { text: html };
                    });

                    const output = JSON.stringify({ questions: finalRes });
                    await env.DB.put(id, output);
                    return new Response(output, { headers });
                }
            }
        }
    } catch (e) {
        // Lỗi
    }

    return new Response(JSON.stringify({ questions: [] }), { headers });
  },
};
