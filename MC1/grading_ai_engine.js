/* grading_ai_engine.js — Secure AI Audit & Auto-Submit Engine for PE12092026 */

// URL Вашей Google Таблицы:
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz-fH9jFhcBpC0g5DFh9mKhB9wSo4WKtYNsa1-Cqv06ND1-0GbNemCR4VH1j2uUefAY/exec";

// ==========================================
// 1. АВТОРИЗАЦИЯ ПРЕПОДАВАТЕЛЯ (БЕЗ ПАРОЛЯ, ПО НАЖАТИЮ)
// ==========================================

function verifyTeacherKey() {
    toggleModal('teacher-modal', false);
    const profPanel = document.getElementById('prof-grade-panel');
    if (profPanel) {
        profPanel.classList.remove('hidden');
    }
    notify(currentLang === 'en' ? "Professor panel unlocked!" : "Панель преподавателя разблокирована!");
}

// ==========================================
// 2. ОТПРАВКА СЕССИИ В GOOGLE ТАБЛИЦУ И СБОРКА ТОКЕНА
// ==========================================

function compileFinalToken() {
    if (typeof currentStudentIdx === 'undefined' || currentStudentIdx === -1) {
        notify(currentLang === 'en' ? "Please select your name first!" : "Сначала выберите свое ФИО!", true);
        return;
    }

    // --- ЧАСТЬ 1 и ЧАСТЬ 2: ТЕСТЫ (10 вопросов x 3 балла = 30 баллов MAX) ---
    const p1_p2_answers = {};
    let scoreP1P2 = 0;

    document.querySelectorAll('#part1-container input:checked, #part2-container input:checked').forEach(input => {
        p1_p2_answers[input.name] = input.value;
        if (input.dataset.ans && input.value === input.dataset.ans) {
            scoreP1P2 += 3;
        }
    });

    // --- ЧАСТЬ 3: ЗАДАЧИ И ТАБЛИЦА (25 баллов MAX) ---
    const p3_answers = {};
    document.querySelectorAll('#part3-container input[type="number"], #part3-container input[type="text"]').forEach(input => {
        p3_answers[input.id] = input.value.trim();
    });

    let scoreP3 = 0;
    
    // Задача 3.1 (TR) — 5 баллов
    const t1Input = document.getElementById('ans-t1');
    if (t1Input && t1Input.value.trim() !== '') {
        const val1 = parseFloat(t1Input.value.replace(',', '.'));
        const exp1 = parseFloat(t1Input.dataset.expected);
        if (!isNaN(val1) && Math.abs(val1 - exp1) < 1) {
            scoreP3 += 5;
        }
    }
    
    // Задача 3.2 (ATC9) — 5 баллов
    const t2Input = document.getElementById('ans-t2');
    if (t2Input && t2Input.value.trim() !== '') {
        const val2 = parseFloat(t2Input.value.replace(',', '.'));
        const exp2 = parseFloat(t2Input.dataset.expected);
        if (!isNaN(val2) && Math.abs(val2 - exp2) < 0.1) {
            scoreP3 += 5;
        }
    }

    // Задача 3.3 (MC) — 5 баллов
    const t3Input = document.getElementById('ans-t3');
    if (t3Input && t3Input.value.trim() !== '') {
        const val3 = parseFloat(t3Input.value.replace(',', '.'));
        const exp3 = parseFloat(t3Input.dataset.expected);
        if (!isNaN(val3) && Math.abs(val3 - exp3) < 0.1) {
            scoreP3 += 5;
        }
    }

    // Задача 3.4 (Таблица + График + Q*) — 10 баллов
    const t4qInput = document.getElementById('ans-t4-q');
    if (t4qInput && t4qInput.value.trim() !== '') {
        const val4 = parseInt(t4qInput.value);
        const exp4 = parseInt(t4qInput.dataset.expected);
        if (!isNaN(val4) && val4 === exp4) {
            scoreP3 += 10;
        }
    }

    // --- ЧАСТЬ 4: КЕЙС И ЭССЕ (45 баллов MAX) ---
    const p4_essay = document.getElementById('p4-essay-input') ? document.getElementById('p4-essay-input').value.trim() : "";
    const p4_words = p4_essay ? p4_essay.split(/\s+/).length : 0;

    if (p4_words < 60) {
        notify(currentLang === 'en' 
            ? `Part 4 analysis requires at least 60 words (Current: ${p4_words}).` 
            : `Анализ в Part 4 должен содержать не менее 60 слов (Сейчас: ${p4_words}).`, true);
        return;
    }

    let sliderAccuracy = (typeof p4_getSliderScore === 'function') ? p4_getSliderScore() : 0;
    let textScore = p4_words >= 60 ? 35 : 0;
    let scoreP4 = sliderAccuracy + textScore;

    let calculatedScore = Math.min(100, Math.round(scoreP1P2 + scoreP3 + scoreP4));

    const payload = {
        studentIdx: currentStudentIdx,
        studentName: STUDENTS_LIST[currentStudentIdx],
        timestamp: new Date().toLocaleString(),
        p1_p2: p1_p2_answers,
        p3: p3_answers,
        p4: p4_essay,
        score: calculatedScore
    };

    const jsonStr = JSON.stringify(payload);
    const internalToken = "PE12092026-" + btoa(encodeURIComponent(jsonStr));

    const pStudent = document.getElementById('p-student');
    const pVariant = document.getElementById('p-variant');
    const pTime = document.getElementById('p-time');

    if (pStudent) pStudent.innerText = payload.studentName;
    if (pVariant) pVariant.innerText = `Variant #${currentStudentIdx + 1}`;
    if (pTime) pTime.innerText = payload.timestamp;

    const tokenDisplay = document.getElementById('p-token');
    if (tokenDisplay) {
        tokenDisplay.innerText = internalToken;
    }

    const passportBlock = document.getElementById('passport-block');
    if (passportBlock) {
        passportBlock.classList.remove('hidden');
    }

    sendDirectToGoogleSheet(payload, internalToken);
}

function sendDirectToGoogleSheet(payload, token) {
    if (!GOOGLE_SHEET_WEBAPP_URL) {
        notify(currentLang === 'en' ? "Session completed successfully!" : "Работа успешно завершена!");
        return;
    }

    fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timestamp: payload.timestamp,
            studentName: payload.studentName,
            variant: payload.studentIdx + 1,
            score: payload.score,
            essay: payload.p4,
            rawToken: token
        })
    }).then(() => {
        notify(currentLang === 'en' ? "Exam recorded in Professor's Gradebook!" : "Работа записана в журнал!");
    }).catch(err => {
        console.error("Sync Error:", err);
    });
}

// ==========================================
// 3. РАСШИФРОВКА И УМНЫЙ ИИ-АУДИТ В ПАНЕЛИ
// ==========================================

function decryptAndScoreToken() {
    const rawToken = document.getElementById('prof-token-input').value.trim();
    if (!rawToken.startsWith("PE12092026-")) {
        notify(currentLang === 'en' ? "Invalid token format!" : "Неверный формат токена!", true);
        return;
    }

    try {
        const base64Data = rawToken.replace("PE12092026-", "");
        const jsonStr = decodeURIComponent(atob(base64Data));
        const data = JSON.parse(jsonStr);

        const decStudent = document.getElementById('dec-student');
        const decVariant = document.getElementById('dec-variant');
        const decScore = document.getElementById('dec-score');
        const decBrief = document.getElementById('dec-brief');

        if (decStudent) decStudent.innerText = data.studentName;
        if (decVariant) decVariant.innerText = `Variant #${data.studentIdx + 1}`;
        if (decScore) decScore.innerText = `${data.score} / 100`;
        if (decBrief) decBrief.innerText = `"${data.p4}"`;

        runAIAudit(data.p4);

        const gradePanelOutput = document.getElementById('grade-panel-output');
        if (gradePanelOutput) {
            gradePanelOutput.classList.remove('hidden');
        }
        notify(currentLang === 'en' ? "AI Audit complete!" : "ИИ-аудит завершен!");
    } catch (e) {
        notify(currentLang === 'en' ? "Failed to parse session!" : "Ошибка чтения данных!", true);
    }
}

// ГИБРИДНЫЙ ДЕТЕКТОР (Симуляторные инструкции + OCR-артефакты + Слипшиеся слова + Клише)
function runAIAudit(text) {
    if (!text) return;

    const lowerText = text.toLowerCase();
    let aiRisk = 10;
    const detectedTriggers = [];

    // 1. Паттерны описания действий в симуляторе (Промпт ChatGPT к интерфейсу)
    const simulatorActions = [
        "switched the model", "switched to the", "looked at the graph", "second graph", 
        "first graph", "fist graph", "demand curve", "go up to", "tr line", "tc line",
        "переключил модель", "посмотрел на график", "кривая спроса", "поднимаюсь к", "линия tr"
    ];

    let actionCount = 0;
    simulatorActions.forEach(act => {
        if (lowerText.includes(act)) {
            actionCount++;
            detectedTriggers.push(`Simulator Action: "${act}"`);
        }
    });
    if (actionCount > 0) {
        aiRisk += actionCount * 22; // По 22% за каждое действие с интерфейсом
    }

    // 2. Артефакты ручного набора с экрана (OCR / Typing Artifacts & Missing Spaces)
    const typingArtifacts = ["fist graph", "short runtime", "etc.", "higher than etc", "p is higher than etc"];
    typingArtifacts.forEach(art => {
        if (lowerText.includes(art)) {
            aiRisk += 25;
            detectedTriggers.push(`Manual Copy Artifact: "${art}"`);
        }
    });

    // Проверка на слипшиеся предложения без пробелов после точки (признак торопливого набора с экрана)
    const missingSpaceMatches = text.match(/[a-zа-я]\.[A-ZА-Я]/g);
    if (missingSpaceMatches && missingSpaceMatches.length > 0) {
        aiRisk += missingSpaceMatches.length * 15;
        detectedTriggers.push(`Missing Spaces after dots: ${missingSpaceMatches.length}`);
    }

    // 3. Стандартные академические клише ChatGPT
    const aiCliches = [
        "furthermore", "it is crucial to note", "in conclusion", "moreover", 
        "delve into", "testament to", "pivotal role", "vibrant ecosystem",
        "в данном контексте", "следует отметить", "таким образом", "важно подчеркнуть",
        "необходимо заметить", "резюмируя вышесказанное", "играет ключевую роль"
    ];

    let clichéCount = 0;
    aiCliches.forEach(cliche => {
        if (lowerText.includes(cliche)) {
            clichéCount++;
            detectedTriggers.push(`AI Cliché: "${cliche}"`);
        }
    });
    if (clichéCount > 0) {
        aiRisk += clichéCount * 15;
    }

    // 4. Дисперсия предложений (Burstiness)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
    const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / (sentenceLengths.length || 1);

    if (variance < 8 && sentences.length > 3) {
        aiRisk += 15;
        detectedTriggers.push(`Low Burstiness (Monotone rhythm)`);
    }

    aiRisk = Math.min(99, Math.max(5, Math.round(aiRisk)));

    const badge = document.getElementById('ai-score-badge');
    if (badge) {
        if (aiRisk <= 30) {
            badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            badge.innerText = `${aiRisk}% Risk (Human Text)`;
        } else if (aiRisk <= 65) {
            badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30";
            badge.innerText = `${aiRisk}% Risk (Partial AI Assistance)`;
        } else {
            badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30";
            badge.innerText = `${aiRisk}% Risk (High AI Likelihood & Copying)`;
        }
    }

    const details = document.getElementById('ai-analysis-details');
    if (details) {
        details.innerHTML = `
            <div>• <b>Security Status:</b> Verified via Smart Hybrid Engine</div>
            <div>• <b>Avg Sentence Length:</b> ${avgLen.toFixed(1)} words | <b>Burstiness Variance:</b> ${variance.toFixed(1)}</div>
            <div>• <b>Detected Triggers (${detectedTriggers.length}):</b> ${detectedTriggers.length ? detectedTriggers.join(' | ') : 'None'}</div>
        `;
    }
}
