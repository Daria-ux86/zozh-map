'use strict';

const DAY_MS = 86400000;
const DIAL_CIRC = 565;
const STREAK_KEY = 'streakCount';
const STREAK_DATE_KEY = 'streakDate';
const HABITS_KEY = 'habits';

document.addEventListener('DOMContentLoaded', () => {
    initStations();
    initQuiz();
    initCalculator();
    initChecklist();
    initTip();
    initScrollReveal();
    registerServiceWorker();
});

function initStations() {
    const modal = document.getElementById('modal');
    const mImg = document.getElementById('modal-img');
    const mTitle = document.getElementById('modal-title');
    const mText = document.getElementById('modal-text');
    const mTips = document.getElementById('modal-tips');
    const closeBtn = document.querySelector('.modal__close');

    const DATA = {
        sleep: {
            title: 'Сон',
            text: 'Во сне мозг сортирует впечатления дня, а тело восстанавливается. Хронический недосып снижает внимание и тягу к сладкому.',
            tips: ['Ложись и вставай в одно время, даже в выходные', 'За час до сна убери экраны или включи ночной режим', 'Спальня — прохладная, тёмная, тихая']
        },
        water: {
            title: 'Вода',
            text: 'Вода переносит питательные вещества и выводит лишнее. Усталость и головная боль часто оказываются просто жаждой.',
            tips: ['Стакан воды сразу после пробуждения', 'Бутылка на виду — пьёшь в два раза чаще', 'Ориентир: около 30 мл на килограмм веса']
        },
        food: {
            title: 'Еда',
            text: 'Чем разноцветнее тарелка, тем больше витаминов. Еда — топливо, а не награда и не наказание.',
            tips: ['Овощи или фрукты в каждый приём пищи', 'Меньше ультраобработанного — больше обычного', 'Ешь без телефона: так проще заметить сытость']
        },
        move: {
            title: 'Движение',
            text: '30 минут активности в день снижают риск болезней сердца и улучшают настроение — эффект заметен почти сразу.',
            tips: ['Выбирай то, что нравится: танцы тоже считаются', 'Лестница вместо лифта — уже победа', 'Прогулка после еды помогает пищеварению']
        },
        mind: {
            title: 'Спокойствие',
            text: 'Стресс — часть жизни, но с ним можно договариваться. Короткие практики дыхания снижают напряжение за минуты.',
            tips: ['Дыхание 4-7-8: вдох 4 счёта, пауза 7, выдох 8', '5 минут тишины без телефона каждый день', 'Если тяжело — поговорить не стыдно']
        }
    };

    let lastFocused = null;

    const openModal = (d, cardImg) => {
        mImg.src = cardImg.src;
        mImg.alt = d.title;
        mTitle.textContent = d.title;
        mText.textContent = d.text;
        mTips.replaceChildren();
        d.tips.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            mTips.appendChild(li);
        });
        lastFocused = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };

    const close = () => {
        modal.hidden = true;
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll('.stop').forEach(stop => {
        stop.addEventListener('click', () => {
            const d = DATA[stop.dataset.stop];
            const cardImg = stop.querySelector('.stop__card img');
            if (d && cardImg) openModal(d, cardImg);
        });
    });

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    document.addEventListener('keydown', e => {
        if (modal.hidden) return;
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'Tab') {
            const focusables = modal.querySelectorAll('button, [href], input, select, textarea');
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
}

function initQuiz() {
    const QUESTIONS = [
        { q: 'Как ты спал(а) этой ночью?', a: [{ t: 'Меньше шести часов', p: 1 }, { t: 'Шесть–восемь часов', p: 2 }, { t: 'Крепко спал(а) всю ночь', p: 3 }] },
        { q: 'Сколько воды выпил(а) сегодня?', a: [{ t: 'Почти забыл(а) про неё', p: 1 }, { t: 'Пара стаканов', p: 2 }, { t: 'Полная норма', p: 3 }] },
        { q: 'Было ли движение сегодня?', a: [{ t: 'День прошёл сидя', p: 1 }, { t: 'Немного прошёл(лась)', p: 2 }, { t: 'Полноценная активность', p: 3 }] },
        { q: 'Что было на обед?', a: [{ t: 'Фастфуд на бегу', p: 1 }, { t: 'Обычная еда', p: 2 }, { t: 'Овощи, белок, без спешки', p: 3 }] },
        { q: 'Как настроение сейчас?', a: [{ t: 'На нуле, всё бесит', p: 1 }, { t: 'Нормально, ровно', p: 2 }, { t: 'Хорошее, есть силы', p: 3 }] }
    ];

    const RESULTS = [
        { max: 7, title: 'Станция: начало тропинки', text: 'Ты только на старте — и это нормально. Начни с одной привычки: стакан воды утром.', img: 'https://images.unsplash.com/photo-1476514525885-7754500fa915?w=900&q=70' },
        { max: 11, title: 'Станция: разгон', text: 'Хорошая база! Добавь 15 минут прогулки и отбой до полуночи — и пойдёшь дальше.', img: 'https://images.unsplash.com/photo-1454745968580-2f54af43c41c?w=900&q=70' },
        { max: 15, title: 'Станция: уверенный шаг', text: 'Ты идёшь ровно. Держи ритм: сон, вода и движение уже в твоей системе.', img: 'https://images.unsplash.com/photo-1501436589489-4524ca5d67f6?w=900&q=70' }
    ];

    const screen = document.getElementById('quiz-screen');
    const resultBox = document.getElementById('quiz-result');
    const bar = document.getElementById('quiz-bar');
    let idx = 0, sum = 0;

    function render() {
        bar.style.width = (idx / QUESTIONS.length * 100) + '%';
        const item = QUESTIONS[idx];
        screen.replaceChildren();

        const h = document.createElement('h3');
        h.className = 'quiz__q-title';
        h.textContent = `${idx + 1} из ${QUESTIONS.length}. ${item.q}`;
        screen.appendChild(h);

        item.a.forEach(opt => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'quiz__option';
            b.textContent = opt.t;
            b.addEventListener('click', () => {
                sum += opt.p;
                idx++;
                idx < QUESTIONS.length ? render() : finish();
            });
            screen.appendChild(b);
        });
    }

    function finish() {
        bar.style.width = '100%';
        screen.hidden = true;
        resultBox.hidden = false;
        resultBox.replaceChildren();

        const r = RESULTS.find(x => sum <= x.max) || RESULTS[2];
        const img = document.createElement('img');
        img.src = r.img;
        img.alt = r.title;
        img.decoding = 'async';
        img.width = 800;
        img.height = 450;

        const h = document.createElement('h3');
        h.textContent = r.title;
        const p = document.createElement('p');
        p.textContent = `Твой счёт: ${sum} из 15. ${r.text}`;

        const btn = document.createElement('button');
        btn.className = 'btn btn--secondary';
        btn.textContent = 'Пройти заново';
        btn.addEventListener('click', () => {
            idx = 0; sum = 0;
            resultBox.replaceChildren();
            resultBox.hidden = true;
            screen.hidden = false;
            render();
        });

        resultBox.append(img, h, p, btn);
    }

    render();
}

function initCalculator() {
    const R = {
        sleep: document.getElementById('sleep-range'),
        water: document.getElementById('water-range'),
        steps: document.getElementById('steps-range'),
        mood: document.getElementById('mood-range')
    };
    const V = {
        sleep: document.getElementById('sleep-val'),
        water: document.getElementById('water-val'),
        steps: document.getElementById('steps-val'),
        mood: document.getElementById('mood-val')
    };
    const arc = document.getElementById('dial-arc');
    const scoreEl = document.getElementById('dial-score');
    const labelEl = document.getElementById('dial-label');

    function calc() {
        const sleep = parseFloat(R.sleep.value);
        const water = parseInt(R.water.value, 10);
        const steps = parseInt(R.steps.value, 10);
        const mood = parseInt(R.mood.value, 10);

        V.sleep.textContent = sleep;
        V.water.textContent = water;
        V.steps.textContent = steps;
        V.mood.textContent = mood;

        let p = 0;
        p += (sleep >= 7 && sleep <= 9) ? 25 : (sleep >= 6 ? 15 : 5);
        p += (water >= 6) ? 25 : (water >= 4 ? 15 : 5);
        p += (steps >= 8000) ? 25 : (steps >= 5000 ? 15 : 5);
        p += (mood >= 8) ? 25 : (mood >= 5 ? 15 : 5);

        scoreEl.textContent = p;
        arc.style.strokeDashoffset = DIAL_CIRC - (DIAL_CIRC * p / 100);

        if (p >= 80) { arc.style.stroke = '#3d6b4a'; labelEl.textContent = 'отлично'; }
        else if (p >= 60) { arc.style.stroke = '#d4a017'; labelEl.textContent = 'хорошо'; }
        else if (p >= 40) { arc.style.stroke = '#c96f4a'; labelEl.textContent = 'средне'; }
        else { arc.style.stroke = '#b0413e'; labelEl.textContent = 'нужен отдых'; }
    }

    Object.values(R).forEach(el => el.addEventListener('input', calc));
    calc();
}

function initChecklist() {
    const boxes = document.querySelectorAll('#checklist input');
    const streakEl = document.getElementById('streak');
    const trackerBar = document.getElementById('tracker-bar');
    const trackerText = document.getElementById('tracker-text');
    const today = new Date().toDateString();

    let state = {};
    try { state = JSON.parse(localStorage.getItem(HABITS_KEY) || '{}'); }
    catch (e) { state = {}; }

    function updateProgress() {
        const checked = [...boxes].filter(b => b.checked).length;
        const percent = (checked / boxes.length) * 100;
        trackerBar.style.width = percent + '%';
        trackerText.textContent = `${checked} из ${boxes.length}`;
    }

    boxes.forEach(box => {
        if (state.date === today && state[box.dataset.habit]) box.checked = true;

        box.addEventListener('change', () => {
            if (state.date !== today) {
                state = { date: today };
                boxes.forEach(b => { if (b !== box) b.checked = false; });
            }
            state[box.dataset.habit] = box.checked;
            localStorage.setItem(HABITS_KEY, JSON.stringify(state));

            const done = [...boxes].every(b => b.checked);
            if (done) bumpStreak();
            showStreak();
            updateProgress();
        });
    });

    function bumpStreak() {
        const last = localStorage.getItem(STREAK_DATE_KEY) || '';
        const count = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
        const yesterday = new Date(Date.now() - DAY_MS).toDateString();
        const newCount = (last === yesterday || last === '') ? count + 1 : count;
        localStorage.setItem(STREAK_KEY, String(newCount));
        localStorage.setItem(STREAK_DATE_KEY, today);
    }

    function showStreak() {
        let n = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
        const last = localStorage.getItem(STREAK_DATE_KEY) || '';
        const yesterday = new Date(Date.now() - DAY_MS).toDateString();
        if (last && last !== today && last !== yesterday) {
            n = 0;
            localStorage.setItem(STREAK_KEY, '0');
        }
        streakEl.textContent = n > 0
            ? `Серия: ${n} ${dayWord(n)} подряд`
            : 'Отметь все пять — начнётся серия';
    }

    function dayWord(n) {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return 'день';
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'дня';
        return 'дней';
    }

    showStreak();
    updateProgress();
}

function initTip() {
    const textEl = document.getElementById('tip-text');
    const btn = document.getElementById('tip-btn');

    const TIPS = [
        'Стакан воды сразу после пробуждения запускает метаболизм.',
        'Правило 20-20-20: каждые 20 минут смотри 20 секунд вдаль — глаза скажут спасибо.',
        '10 минут ходьбы после еды заметно снижают уровень сахара в крови.',
        'Запиши три вещи, за которые благодарен сегодня, — сон станет крепче.',
        'Дыхание 4-7-8 снимает напряжение за одну минуту.',
        'Один лестничный пролёт вместо лифта — плюс к активности дня.',
        'Фрукт вместо шоколадки даст энергию без вечернего спада.',
        'Короткая прогулка без телефона перезагружает голову лучше кофе.'
    ];

    let last = -1;
    btn.addEventListener('click', () => {
        let i;
        do { i = Math.floor(Math.random() * TIPS.length); } while (i === last);
        last = i;
        textEl.style.opacity = '0';
        textEl.style.transform = 'translateY(8px)';
        setTimeout(() => {
            textEl.textContent = TIPS[i];
            textEl.style.opacity = '1';
            textEl.style.transform = 'translateY(0)';
        }, 200);
    });
}

function initScrollReveal() {
    const targets = document.querySelectorAll('.stop, .tip-card');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add('visible');
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.15 });
    targets.forEach(s => obs.observe(s));
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => { });
    }
}
