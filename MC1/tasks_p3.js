/* ==========================================
   MIDTERM CONTROL 1 • MODULE FOR PART 3
   Computational Tasks & Cost Dynamics (10 Units)
   AlmaU SDTE 2026 • Software Engineering (SE)
   Strict Dot-Decimal & Smooth U-Shaped Curves
   ========================================== */

let costChartInstance = null;

const p3_productCatalog = [
    { en: "chocolate bars", ru: "шоколадных батончиков" },
    { en: "specialty coffee bags", ru: "упаковок спешелти-кофе" },
    { en: "eco-friendly smartphones", ru: "эко-смартфонов" },
    { en: "electric scooters", ru: "электросамокатов" },
    { en: "organic matcha canisters", ru: "банок органического чая матча" },
    { en: "wireless headphones", ru: "беспроводных наушников" },
    { en: "craft bakery boxes", ru: "наборов крафтовой выпечки" },
    { en: "energy drink packs", ru: "упаковок энергетических напитков" },
    { en: "smart watches", ru: "умных часов" }
];

function sanitizeDecimalInput(inputElement) {
    if (!inputElement) return;
    inputElement.value = inputElement.value.replace(',', '.').replace(/[^0-9.-]/g, '');
}

function renderTasksP3(seed, lang) {
    // Ротация строго среди 9 студентов
    seed = (seed + 1) % 9;

    const container = document.getElementById('part3-container');
    if (!container) return;

    const k = seed + 1; // Вариантный множитель (1..9)

    // 1. ЗАДАЧА 3.1: Спрос, Предложение и Выручка
    const prod = p3_productCatalog[seed % p3_productCatalog.length];
    const B_qd = 200 + (k % 5) * 50;  
    const D_qs = 500 + (k % 4) * 50;  
    const P_target = 2 + (k % 6);     
    const C_qs = 1000 + k * 100;      
    const A_qd = C_qs + (B_qd + D_qs) * P_target; 
    const Q_cap = 4000 + k * 200;     
    const expectedTR = Q_cap * P_target;

    // 2. ЗАДАЧА 3.2: Средние издержки (8 и 9 единиц)
    const atc8 = 100 + k * 2;
    const mc9 = 20 + k * 3;
    const expectedATC9 = Number(((atc8 * 8 + mc9) / 9).toFixed(2));

    // 3. ЗАДАЧА 3.3: Предельные издержки TC = a*Q - 2*Q^2
    const paramA = 95 + k * 2;
    const paramB = 2;
    const Q_val = 20 + k;
    const expectedMC = paramA - 2 * paramB * Q_val; 

    // 4. ЗАДАЧА 3.4: ТАБЛИЦА ИЗДЕРЖЕК НА 10 ЕДИНИЦ (СТРОГО ГЛАДКАЯ МОДЕЛЬ)
    const FC = 60 + (k % 3) * 10;
    
    // Формируем MC как параболу MC(Q) = m0 + m1*(Q - q_min)^2
    // Это гарантирует, что MC снижается до Q=2, а затем СТРОГО и ГЛАДКО возрастает без пиков!
    const m0 = 12 + (k % 3);       // Минимальное значение MC
    const q_min = 2;               // Точка минимума MC
    const alpha = 1.8 + (k % 3) * 0.3; // Скорость роста MC

    const mcArr = [0];
    const vcArr = [0];
    let cumVC = 0;

    for (let q = 1; q <= 10; q++) {
        let mcVal = Math.round(m0 + alpha * Math.pow(q - q_min, 2));
        mcArr.push(mcVal);
        cumVC += mcVal;
        vcArr.push(cumVC);
    }

    const P_mkt = 45 + (k % 4) * 5;

    let optQ = 1;
    for (let q = 1; q <= 10; q++) {
        if (mcArr[q] <= P_mkt) optQ = q;
    }

    const t1Text = lang === 'en' ?
        `By the holiday season, the company responded to market demand for its <span class="font-bold text-indigo-400">${prod.en}</span> given by <span class="font-bold text-emerald-400">Qd = ${A_qd} - ${B_qd}P</span>. Short-run market supply is <span class="font-bold text-sky-400">Qs = ${C_qs} + ${D_qs}P</span>. Determine total revenue (TR) the company earns at equilibrium price if it produces and sells <span class="font-bold text-amber-400">${Q_cap} units</span>.` :
        `К праздничному сезону компания ответила на спрос на свои <span class="font-bold text-indigo-400">${prod.ru}</span>, заданный функцией <span class="font-bold text-emerald-400">Qd = ${A_qd} - ${B_qd}P</span>. Рыночное предложение составляет <span class="font-bold text-sky-400">Qs = ${C_qs} + ${D_qs}P</span>. Определите совокупную выручку (TR) при равновесной цене, если компания произведет и реализует <span class="font-bold text-amber-400">${Q_cap} единиц</span>.`;

    const t2Text = lang === 'en' ?
        `Average total cost of 8 units is <span class="font-bold text-sky-400">$${atc8}</span>. Marginal cost of the 9th unit is <span class="font-bold text-emerald-400">$${mc9}</span>. Calculate average total cost (ATC) for 9 units.` :
        `Средние общие издержки производства 8 единиц равны <span class="font-bold text-sky-400">$${atc8}</span>. Предельные издержки 9-й единицы равны <span class="font-bold text-emerald-400">$${mc9}</span>. Рассчитайте ATC для 9 единиц.`;

    const t3Text = lang === 'en' ?
        `Total cost function is <span class="font-bold text-indigo-400">TC = ${paramA}Q - ${paramB}Q<sup>2</sup></span>. Calculate Marginal Cost (MC) at output <span class="font-bold text-amber-400">Q = ${Q_val}</span>.` :
        `Функция совокупных издержек имеет вид <span class="font-bold text-indigo-400">TC = ${paramA}Q - ${paramB}Q<sup>2</sup></span>. Рассчитайте предельные издержки (MC) при объеме <span class="font-bold text-amber-400">Q = ${Q_val}</span>.`;

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Task 3.1 -->
            <div class="card p-6 space-y-4">
                <span class="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md border border-indigo-500/20 uppercase font-black tracking-widest inline-block">${lang === 'en' ? 'Task 3.1' : 'Задача 3.1'}</span>
                <h4 class="text-base font-bold text-slate-100">${lang === 'en' ? 'Equilibrium & Revenue' : 'Равновесие и Выручка'}</h4>
                <p class="text-sm text-slate-200 leading-relaxed">${t1Text}</p>
                <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                    <label class="block text-slate-400 font-medium">${lang === 'en' ? 'Total Revenue (TR):' : 'Совокупная выручка (TR):'}</label>
                    <input type="text" id="ans-t1" data-expected="${expectedTR}" placeholder="TR ($)" oninput="sanitizeDecimalInput(this)" class="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white font-mono text-base focus:border-indigo-500 outline-none">
                </div>
            </div>

            <!-- Task 3.2 -->
            <div class="card p-6 space-y-4">
                <span class="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md border border-indigo-500/20 uppercase font-black tracking-widest inline-block">${lang === 'en' ? 'Task 3.2' : 'Задача 3.2'}</span>
                <h4 class="text-base font-bold text-slate-100">${lang === 'en' ? 'Average Cost Adjustment' : 'Средние издержки'}</h4>
                <p class="text-sm text-slate-200 leading-relaxed">${t2Text}</p>
                <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                    <label class="block text-slate-400 font-medium">${lang === 'en' ? 'ATC for 9 units:' : 'ATC для 9 единиц:'}</label>
                    <input type="text" id="ans-t2" data-expected="${expectedATC9}" placeholder="ATC ($)" oninput="sanitizeDecimalInput(this)" class="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white font-mono text-base focus:border-indigo-500 outline-none">
                </div>
            </div>

            <!-- Task 3.3 -->
            <div class="card p-6 space-y-4">
                <span class="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md border border-indigo-500/20 uppercase font-black tracking-widest inline-block">${lang === 'en' ? 'Task 3.3' : 'Задача 3.3'}</span>
                <h4 class="text-base font-bold text-slate-100">${lang === 'en' ? 'Marginal Cost Function' : 'Предельные издержки'}</h4>
                <p class="text-sm text-slate-200 leading-relaxed">${t3Text}</p>
                <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                    <label class="block text-slate-400 font-medium">${lang === 'en' ? 'Marginal Cost (MC):' : 'Предельные издержки (MC):'}</label>
                    <input type="text" id="ans-t3" data-expected="${expectedMC}" placeholder="MC ($)" oninput="sanitizeDecimalInput(this)" class="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white font-mono text-base focus:border-indigo-500 outline-none">
                </div>
            </div>
        </div>

        <!-- Task 3.4: Table & Dynamic Chart -->
        <div class="card p-6 space-y-5">
            <div class="border-b border-slate-800 pb-4 flex justify-between items-center flex-wrap gap-3">
                <div>
                    <span class="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md border border-indigo-500/20 uppercase font-black tracking-widest inline-block mb-1.5">${lang === 'en' ? 'Task 3.4' : 'Задача 3.4'}</span>
                    <h3 class="text-base md:text-lg font-bold text-slate-100">${lang === 'en' ? 'Full 10-Unit Short-Run Cost Dynamics' : 'Динамика издержек фирмы на 10 единиц выпуска'}</h3>
                </div>
                <span class="text-sm md:text-base text-indigo-300 font-bold bg-indigo-950/80 border border-indigo-700/80 px-4 py-2 rounded-xl">Market Price P = $${P_mkt}</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <!-- Table -->
                <div class="lg:col-span-7 space-y-4">
                    <p class="text-sm text-slate-200 font-medium leading-relaxed">${lang === 'en' ? 'Complete the cost matrix for output Q = 1 to 10:' : 'Заполните матрицу издержек для выпуска Q от 1 до 10:'}</p>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-sm text-center border-collapse border border-slate-800">
                            <thead>
                                <tr class="bg-slate-900/90 text-indigo-300 border-b border-slate-800 font-bold text-xs uppercase">
                                    <th class="p-2.5 border border-slate-800">Q</th>
                                    <th class="p-2.5 border border-slate-800">FC</th>
                                    <th class="p-2.5 border border-slate-800">VC</th>
                                    <th class="p-2.5 border border-slate-800 text-indigo-400">TC</th>
                                    <th class="p-2.5 border border-slate-800 text-slate-400">AFC</th>
                                    <th class="p-2.5 border border-slate-800 text-amber-400">AVC</th>
                                    <th class="p-2.5 border border-slate-800 text-sky-400">ATC</th>
                                    <th class="p-2.5 border border-slate-800 text-emerald-400">MC</th>
                                </tr>
                            </thead>
                            <tbody id="t4-tbody" class="font-mono text-sm">
                                ${generateTableRowsHTML(FC, vcArr)}
                            </tbody>
                        </table>
                    </div>
                    <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                        <label class="block text-amber-400 font-bold text-sm md:text-base">${lang === 'en' ? 'Optimal Output Q* (where MR = MC):' : 'Оптимальный объем Q* (где MR = MC):'}</label>
                        <input type="text" id="ans-t4-q" data-expected="${optQ}" placeholder="Q*" oninput="sanitizeDecimalInput(this)" class="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white font-mono text-base focus:border-indigo-500 outline-none">
                    </div>
                </div>

                <!-- Chart Column -->
                <div class="lg:col-span-5 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                    <div class="text-xs uppercase font-bold text-slate-300 tracking-wider flex justify-between items-center border-b border-slate-800 pb-2">
                        <span>${lang === 'en' ? 'Unit Cost Curves (10 Units)' : 'Кривые издержек на единицу (10 Единиц)'}</span>
                        <span class="text-emerald-400 font-mono text-xs"><i class="fas fa-chart-line mr-1"></i>Realtime Chart.js</span>
                    </div>
                    <div class="h-96 relative w-full">
                        <canvas id="costChartCanvas"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.t4-input').forEach(input => {
        input.addEventListener('input', (e) => {
            sanitizeDecimalInput(e.target);
            updateCostChartFromTableInputs();
        });
    });

    setTimeout(() => init10UnitCostChart(), 100);
}

function generateTableRowsHTML(FC, vcArr) {
    let html = '';
    for (let q = 1; q <= 10; q++) {
        html += `
            <tr class="border-b border-slate-800 hover:bg-slate-900/40 transition">
                <td class="p-2 border border-slate-800 font-bold text-white">${q}</td>
                <td class="p-2 border border-slate-800 text-slate-400">${FC}</td>
                <td class="p-2 border border-slate-800 text-slate-400">${vcArr[q]}</td>
                <td class="p-1.5 border border-slate-800"><input type="text" id="t4-tc-${q}" class="t4-input w-14 bg-slate-900 border border-slate-700 text-center text-white font-bold rounded p-1.5 focus:border-indigo-500 outline-none"></td>
                <td class="p-1.5 border border-slate-800"><input type="text" id="t4-afc-${q}" class="t4-input w-14 bg-slate-900 border border-slate-700 text-center text-white font-bold rounded p-1.5 focus:border-indigo-500 outline-none"></td>
                <td class="p-1.5 border border-slate-800"><input type="text" id="t4-avc-${q}" class="t4-input w-14 bg-slate-900 border border-slate-700 text-center text-white font-bold rounded p-1.5 focus:border-indigo-500 outline-none"></td>
                <td class="p-1.5 border border-slate-800"><input type="text" id="t4-atc-${q}" class="t4-input w-14 bg-slate-900 border border-slate-700 text-center text-white font-bold rounded p-1.5 focus:border-indigo-500 outline-none"></td>
                <td class="p-1.5 border border-slate-800"><input type="text" id="t4-mc-${q}" class="t4-input w-14 bg-slate-900 border border-slate-700 text-center text-white font-bold rounded p-1.5 focus:border-indigo-500 outline-none"></td>
            </tr>
        `;
    }
    return html;
}

// Инициализация ПУСТОГО графика
function init10UnitCostChart() {
    const cvs = document.getElementById('costChartCanvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');

    if (costChartInstance) {
        costChartInstance.destroy();
        costChartInstance = null;
    }

    const labels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'];

    costChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'AFC', data: Array(10).fill(null), borderColor: '#94a3b8', borderWidth: 2, borderDash: [3, 3], pointRadius: 5, tension: 0.3, spanGaps: true },
                { label: 'AVC', data: Array(10).fill(null), borderColor: '#f59e0b', borderWidth: 2.5, pointRadius: 5, tension: 0.3, spanGaps: true },
                { label: 'ATC', data: Array(10).fill(null), borderColor: '#38bdf8', borderWidth: 2.5, pointRadius: 5, tension: 0.3, spanGaps: true },
                { label: 'MC', data: Array(10).fill(null), borderColor: '#10b981', borderWidth: 3, pointRadius: 6, tension: 0.3, spanGaps: true }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, color: '#cbd5e1', font: { size: 11, weight: 'bold' } } }
            },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 11, weight: 'bold' } }, grid: { color: 'rgba(51, 65, 85, 0.3)' } },
                y: { ticks: { color: '#94a3b8', font: { size: 11, weight: 'bold' } }, grid: { color: 'rgba(51, 65, 85, 0.3)' } }
            }
        }
    });
}

// Обновление графика СТРОГО из введённых студентом данных
function updateCostChartFromTableInputs() {
    if (!costChartInstance) return;
    let newAFC = [], newAVC = [], newATC = [], newMC = [];

    for (let q = 1; q <= 10; q++) {
        const valAFC = parseFloat(document.getElementById(`t4-afc-${q}`)?.value.replace(',', '.'));
        const valAVC = parseFloat(document.getElementById(`t4-avc-${q}`)?.value.replace(',', '.'));
        const valATC = parseFloat(document.getElementById(`t4-atc-${q}`)?.value.replace(',', '.'));
        const valMC = parseFloat(document.getElementById(`t4-mc-${q}`)?.value.replace(',', '.'));

        newAFC.push(!isNaN(valAFC) ? valAFC : null);
        newAVC.push(!isNaN(valAVC) ? valAVC : null);
        newATC.push(!isNaN(valATC) ? valATC : null);
        newMC.push(!isNaN(valMC) ? valMC : null);
    }

    costChartInstance.data.datasets[0].data = newAFC;
    costChartInstance.data.datasets[1].data = newAVC;
    costChartInstance.data.datasets[2].data = newATC;
    costChartInstance.data.datasets[3].data = newMC;
    costChartInstance.update();
}
