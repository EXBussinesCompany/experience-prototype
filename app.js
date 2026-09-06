const app = document.querySelector('#app');
const toast = document.querySelector('#toast');

const state = {
  screen: new URLSearchParams(window.location.search).get('screen') || 'welcome',
  history: [],
  quizStep: 0,
  mood: 'tired',
  need: 'heard',
  format: 'one',
  boundaries: ['public', 'platonic'],
  selectedExperience: 'walk',
  selectedRadarPerson: 'marta',
  feedback: {},
  live: true,
  messages: [
    { mine: false, text: 'Привет! Мне нравится идея прогулки. Встречаемся у главного входа?', time: '18:42' },
    { mine: true, text: 'Да, отлично. Я буду в зелёной куртке 🙂', time: '18:43' }
  ]
};

const people = {
  marta: {
    name: 'Марта', age: 28, distance: '300–500 м',
    image: 'https://i.pravatar.cc/240?img=47',
    intent: 'Кофе и спокойный разговор',
    note: 'Открыта к общению ещё 45 минут',
    astro: 'Луна в Тельце создаёт спокойный темп, а ваши Меркурии поддерживают прямой разговор.'
  },
  denis: {
    name: 'Денис', age: 31, distance: 'до 1 км',
    image: 'https://i.pravatar.cc/240?img=12',
    intent: 'Прогулка после работы',
    note: 'Только дружеское общение',
    astro: 'Вы оба цените конкретику, но Денису может понадобиться больше времени, чтобы раскрыться.'
  },
  lena: {
    name: 'Лена', age: 26, distance: 'в этой зоне',
    image: 'https://i.pravatar.cc/240?img=44',
    intent: 'Компания на концерт',
    note: 'Сейчас в Live Zone Praga Hall',
    astro: 'У вас похожий эмоциональный ритм и разный способ проявлять инициативу — хороший баланс для события.'
  }
};

const quiz = [
  { title: 'Как тебе проще знакомиться?', left: 'Сначала присмотреться', right: 'Сразу включиться' },
  { title: 'Какой разговор комфортнее?', left: 'Мягкий и бережный', right: 'Прямой и честный' },
  { title: 'Что больше заряжает?', left: 'Глубокий разговор вдвоём', right: 'Живая компания' },
  { title: 'Как ты относишься к планам?', left: 'Люблю знать заранее', right: 'Легко решаю спонтанно' }
];

function icon(name) {
  const icons = { back: '←', close: '×', more: '•••', moon: '◔', arrow: '›' };
  return icons[name] || name;
}

function img(person, className = 'avatar') {
  return `<img class="${className}" src="${person.image}" alt="${person.name}">`;
}

function topbar(title = '', options = {}) {
  const left = options.back === false ? '<span></span>' : `<button class="back" data-action="back" aria-label="Назад">${icon('back')}</button>`;
  const right = options.right || '<span></span>';
  return `<header class="topbar">${left}<strong>${title}</strong>${right}</header>`;
}

function bottomNav(active) {
  const items = [
    ['home', '⌂', 'Сегодня'],
    ['radar', '⌖', 'Рядом'],
    ['plans', '◷', 'Планы'],
    ['profile', '○', 'Профиль']
  ];
  return `<nav class="bottom-nav" aria-label="Основная навигация">${items.map(([screen, symbol, label]) => `
    <button class="${active === screen ? 'is-active' : ''}" data-jump="${screen}">
      <span>${symbol}</span><span>${label}</span>
    </button>`).join('')}</nav>`;
}

function welcome() {
  return `<section class="screen screen--welcome">
    <div class="brand-lockup"><span class="brand-dot"></span>Experience</div>
    <div class="hero-orbit" aria-hidden="true">
      <div class="orbit-copy"><strong>Не ищи человека</strong><span>Скажи, что хочешь пережить</span></div>
    </div>
    <h1 class="display">Реальные встречи.<br>В нужный момент.</h1>
    <p class="lead">Experience понимает твоё состояние и предлагает человека, формат, время и безопасное место.</p>
    <div class="actions">
      <button class="primary" data-action="next" data-target="signin">Начать</button>
      <button class="secondary" data-action="show-toast" data-message="Демо-вход открыт — нажмите «Начать»">У меня уже есть профиль</button>
    </div>
    <p class="fine-print">18+ · Твоё местоположение никогда не показывается точно.</p>
  </section>`;
}

function signin() {
  return `<section class="screen">
    ${topbar('')}
    <p class="section-kicker">ШАГ 1 ИЗ 4</p>
    <h1 class="display">Начнём с номера</h1>
    <p class="lead">Он нужен для входа и безопасности сообщества.</p>
    <div class="field">
      <label for="phone">Номер телефона</label>
      <input id="phone" inputmode="tel" value="+48 512 345 678">
    </div>
    <div class="actions actions--bottom">
      <button class="primary" data-action="next" data-target="otp">Получить код</button>
    </div>
  </section>`;
}

function otp() {
  return `<section class="screen">
    ${topbar('')}
    <p class="section-kicker">ПОДТВЕРЖДЕНИЕ</p>
    <h1 class="display">Код уже в пути</h1>
    <p class="lead">Мы отправили четыре цифры на +48 512•••678.</p>
    <div class="field-row" style="grid-template-columns:repeat(4,1fr);margin-top:28px">
      ${['2','0','0','4'].map((n, i) => `<div class="field" style="margin-top:0"><input aria-label="Цифра ${i+1}" inputmode="numeric" value="${n}" style="text-align:center;font-size:22px"></div>`).join('')}
    </div>
    <div class="actions">
      <button class="primary" data-action="next" data-target="birth">Продолжить</button>
      <button class="text-button" data-action="show-toast" data-message="Новый код отправлен">Отправить ещё раз</button>
    </div>
  </section>`;
}

function birth() {
  return `<section class="screen">
    ${topbar('')}
    <div class="progress"><span style="width:38%"></span></div>
    <p class="section-kicker">ТВОЯ КАРТА</p>
    <h1 class="display">Когда и где ты родился?</h1>
    <p class="lead">Используем карту как один из слоёв совместимости — не как диагноз или приговор.</p>
    <div class="field"><label for="birthdate">Дата рождения</label><input id="birthdate" value="12.08.1994"></div>
    <div class="field-row">
      <div class="field"><label for="birthtime">Время</label><input id="birthtime" value="18:30"></div>
      <div class="field"><label for="timeAccuracy">Точность</label><input id="timeAccuracy" value="Точное"></div>
    </div>
    <div class="field"><label for="birthplace">Место рождения</label><input id="birthplace" value="Варшава, Польша"></div>
    <div class="actions">
      <button class="primary" data-action="next" data-target="natalReady">Построить карту</button>
      <button class="text-button" data-action="show-toast" data-message="Можно добавить примерное время позже">Не знаю время рождения</button>
    </div>
  </section>`;
}

function natalReady() {
  return `<section class="screen screen--dark">
    ${topbar('', { right: '<span></span>' })}
    <p class="section-kicker" style="color:#f5a78e">ТВОЯ ОСНОВА</p>
    <h1 class="display">Карта готова</h1>
    <div class="natal-mini"><strong>Солнце<br>в Скорпионе</strong></div>
    <div class="profile-triad">
      <div><small>Луна</small><strong>Телец</strong></div>
      <div><small>Асцендент</small><strong>Скорпион</strong></div>
      <div><small>Венера</small><strong>Весы</strong></div>
    </div>
    <p class="lead">Глубина и внимательность к деталям сочетаются с потребностью в спокойном, надёжном контакте.</p>
    <div class="actions"><button class="primary" data-action="next" data-target="personalityIntro">Настроить стиль общения</button></div>
  </section>`;
}

function personalityIntro() {
  return `<section class="screen">
    ${topbar('')}
    <div class="progress"><span style="width:62%"></span></div>
    <p class="section-kicker">СТИЛЬ ОБЩЕНИЯ · 2 МИНУТЫ</p>
    <h1 class="display">Чтобы подобрать не просто похожего человека</h1>
    <p class="lead">Несколько вопросов помогут понять комфортный темп, прямоту и количество контакта. Это не медицинский тест.</p>
    <div class="choice-grid">
      <div class="choice"><span class="choice-icon">◌</span><strong>Без ярлыков</strong><small>Покажем склонности, а не тип личности.</small></div>
      <div class="choice"><span class="choice-icon">↻</span><strong>Можно менять</strong><small>Профиль обучается после реальных опытов.</small></div>
    </div>
    <div class="actions"><button class="primary" data-action="start-quiz">Ответить на 4 вопроса</button></div>
  </section>`;
}

function personalityQuiz() {
  const q = quiz[state.quizStep];
  const width = 62 + ((state.quizStep + 1) / quiz.length) * 23;
  return `<section class="screen">
    ${topbar(`${state.quizStep + 1} / ${quiz.length}`)}
    <div class="progress"><span style="width:${width}%"></span></div>
    <p class="section-kicker">СТИЛЬ ОБЩЕНИЯ</p>
    <h1 class="display display--small">${q.title}</h1>
    <p class="lead">Выбери точку, которая ближе тебе большую часть времени.</p>
    <div class="scale">
      <div class="scale-head"><span>${q.left}</span><span style="text-align:right">${q.right}</span></div>
      <div class="scale-track">
        ${[1,2,3,4,5].map(n => `<button class="scale-dot ${n === 3 ? 'is-selected' : ''}" data-action="quiz-answer" data-value="${n}" aria-label="Вариант ${n} из 5"></button>`).join('')}
      </div>
    </div>
    <div class="actions actions--bottom"><button class="primary" data-action="quiz-next">${state.quizStep === quiz.length - 1 ? 'Посмотреть профиль' : 'Дальше'}</button></div>
  </section>`;
}

function profileReady() {
  return `<section class="screen screen--ready">
    ${topbar('', { back: false })}
    <div class="ready-seal"></div>
    <p class="section-kicker" style="text-align:center">ПРОФИЛЬ ГОТОВ</p>
    <h1 class="display" style="text-align:center">Спокойная глубина</h1>
    <p class="lead" style="text-align:center">Тебе легче раскрыться один на один, когда разговор честный, но без давления.</p>
    <div class="reason-list">
      <div class="reason"><span class="reason-icon">◎</span><div><strong>Оптимальный формат</strong><p>Прогулка или кофе на 30–60 минут.</p></div></div>
      <div class="reason"><span class="reason-icon">↔</span><div><strong>Комфортный партнёр</strong><p>Тёплый, инициативный, уважающий паузы.</p></div></div>
    </div>
    <div class="actions"><button class="primary" data-action="next" data-target="home">Перейти в Experience</button></div>
  </section>`;
}

function home() {
  return `<section class="screen screen--with-nav">
    <div class="home-greeting">
      <div><p>Воскресенье, 7 сентября</p><strong>Добрый вечер, Алексей</strong></div>
      ${img({ name: 'Алексей', image: 'https://i.pravatar.cc/200?img=11' })}
    </div>
    <div class="today-panel">
      <div class="moon-row"><span>Луна в Тельце · спокойный ритм</span><span class="moon-glyph">◔</span></div>
      <h2>Что тебе нужно сейчас?</h2>
      <p>Ответ займёт меньше минуты. Мы предложим не людей, а готовые варианты встречи.</p>
      <div class="actions"><button class="primary" data-action="next" data-target="mood">Пройти check-in</button></div>
    </div>
    <div class="home-actions">
      <button class="action-tile" data-action="next" data-target="radar"><span class="tile-icon">⌖</span><span><strong>Кто открыт рядом</strong><small>7 человек · 2 Live Zone</small></span><span class="arrow">›</span></button>
      <button class="action-tile" data-action="next" data-target="plans"><span class="tile-icon">◷</span><span><strong>Ближайший план</strong><small>Прогулка · сегодня в 19:00</small></span><span class="arrow">›</span></button>
    </div>
    ${bottomNav('home')}
  </section>`;
}

function mood() {
  const moods = [
    ['tired','😔','28%','72%','Тяжело и мало энергии'],
    ['restless','😣','74%','70%','Напряжённо, хочется движения'],
    ['calm','😌','30%','28%','Спокойно и мягко'],
    ['bright','🙂','74%','27%','Хорошо и много энергии']
  ];
  const chosen = moods.find(m => m[0] === state.mood);
  return `<section class="screen">
    ${topbar('Быстрый check-in')}
    <div class="progress"><span style="width:25%"></span></div>
    <h1 class="display display--small">Как ты себя чувствуешь?</h1>
    <p class="lead">Выбери ближайшее состояние. Здесь нет правильного ответа.</p>
    <div class="mood-map">
      <span class="mood-label mood-label--top">больше энергии</span><span class="mood-label mood-label--bottom">меньше энергии</span>
      <span class="mood-label mood-label--left">тяжелее</span><span class="mood-label mood-label--right">приятнее</span>
      ${moods.map(m => `<button class="mood-point ${state.mood === m[0] ? 'is-selected' : ''}" style="left:${m[2]};top:${m[3]}" data-action="select-mood" data-value="${m[0]}" aria-label="${m[4]}">${m[1]}</button>`).join('')}
    </div>
    <div class="selected-note">Сейчас ближе: <strong>${chosen[4]}</strong>. Это состояние нигде публично не показывается.</div>
    <div class="actions"><button class="primary" data-action="next" data-target="need">Дальше</button></div>
  </section>`;
}

function need() {
  const choices = [
    ['heard','◡','Чтобы меня выслушали','Без советов и оценки'],
    ['distract','✦','Отвлечься','Сменить обстановку'],
    ['energy','↗','Получить энергию','Сделать что-то активное'],
    ['celebrate','☀','Разделить хорошее','Праздновать не одному'],
    ['advice','◇','Услышать взгляд со стороны','Спокойно разобраться'],
    ['new','◌','Попробовать новое','Выйти из привычного']
  ];
  return `<section class="screen">
    ${topbar('Быстрый check-in')}
    <div class="progress"><span style="width:50%"></span></div>
    <h1 class="display display--small">Что сейчас было бы полезно?</h1>
    <div class="choice-grid">
      ${choices.map(c => `<button class="choice ${state.need === c[0] ? 'is-selected' : ''}" data-action="select-need" data-value="${c[0]}"><span class="choice-icon">${c[1]}</span><strong>${c[2]}</strong><small>${c[3]}</small></button>`).join('')}
    </div>
    <div class="actions"><button class="primary" data-action="next" data-target="format">Дальше</button></div>
  </section>`;
}

function format() {
  const choices = [
    ['one','◉','Один на один','Спокойнее и глубже'],
    ['small','◉◉','Небольшая группа','Трое или четверо'],
    ['chat','⌁','Сначала переписка','Без обязательства встречаться'],
    ['now','⌖','Готов встретиться сейчас','В пределах 30–60 минут']
  ];
  return `<section class="screen">
    ${topbar('Быстрый check-in')}
    <div class="progress"><span style="width:75%"></span></div>
    <h1 class="display display--small">На какой контакт есть силы?</h1>
    ${choices.map(c => `<button class="wide-choice ${state.format === c[0] ? 'is-selected' : ''}" data-action="select-format" data-value="${c[0]}"><span>${c[1]}</span><span><strong>${c[2]}</strong><small>${c[3]}</small></span><span class="check">✓</span></button>`).join('')}
    <div class="actions"><button class="primary" data-action="next" data-target="boundaries">Дальше</button></div>
  </section>`;
}

function boundaries() {
  const choices = [
    ['public','⌂','Только публичное место','Показываем всегда'],
    ['platonic','○','Только дружеское общение','Без романтического контекста'],
    ['no-advice','≠','Без советов','Хочу, чтобы меня просто услышали'],
    ['no-alcohol','⌁','Без алкоголя','Подберём подходящее место']
  ];
  return `<section class="screen">
    ${topbar('Быстрый check-in')}
    <div class="progress"><span style="width:100%"></span></div>
    <h1 class="display display--small">Обозначь границы</h1>
    <p class="lead">Другой человек увидит их до того, как примет предложение.</p>
    ${choices.map(c => `<button class="wide-choice ${state.boundaries.includes(c[0]) ? 'is-selected' : ''}" data-action="toggle-boundary" data-value="${c[0]}"><span>${c[1]}</span><span><strong>${c[2]}</strong><small>${c[3]}</small></span><span class="check">✓</span></button>`).join('')}
    <div class="actions"><button class="primary" data-action="next" data-target="recommendations">Подобрать опыт</button></div>
    <p class="fine-print">Experience не оказывает психологическую помощь. В критической ситуации мы предложим обратиться к профильной поддержке.</p>
  </section>`;
}

function recommendations() {
  const marta = people.marta, denis = people.denis, lena = people.lena;
  return `<section class="screen">
    ${topbar('Твои варианты', { right: '<button class="text-button" data-jump="home">Закрыть</button>' })}
    <p class="section-kicker">3 ПОДХОДЯЩИХ ОПЫТА</p>
    <h1 class="display display--small">Сейчас лучше без шума и давления</h1>
    <p class="lead">Мы учли состояние, границы, расстояние и стиль общения.</p>
    <div class="suggestion-list">
      <button class="experience-card experience-card--featured" data-action="select-experience" data-value="walk">
        <div class="experience-visual"><div class="avatars">${img(marta)}${img({name:'Алексей',image:'https://i.pravatar.cc/200?img=11'})}</div><span class="match-score">лучший вариант</span></div>
        <div class="experience-body"><h3>Прогулка и спокойный разговор</h3><div class="experience-meta"><span>Сегодня · 19:00</span><span>30–45 мин</span><span>12 мин пешком</span></div><p>Марта тоже хочет выговориться без советов. Встреча в людном парке.</p></div>
      </button>
      <button class="experience-card" data-action="select-experience" data-value="coffee">
        <div class="experience-visual"><div class="avatars">${img(denis)}</div><span class="match-score">рядом сейчас</span></div>
        <div class="experience-body"><h3>Кофе без спешки</h3><div class="experience-meta"><span>В течение часа</span><span>до 1 км</span></div><p>Короткая встреча один на один в партнёрской кофейне.</p></div>
      </button>
      <button class="experience-card" data-action="select-experience" data-value="concert">
        <div class="experience-visual"><div class="avatars">${img(lena)}</div><span class="match-score">Live Zone</span></div>
        <div class="experience-body"><h3>Послушать концерт вместе</h3><div class="experience-meta"><span>Praga Hall</span><span>Сегодня · 21:00</span></div><p>В зоне уже есть люди, открытые к дружескому общению.</p></div>
      </button>
    </div>
  </section>`;
}

function experienceDetail() {
  const marta = people.marta;
  return `<section class="screen">
    ${topbar('', { right: '<button class="icon-button" data-action="show-toast" data-message="Опыт сохранён" aria-label="Сохранить">♡</button>' })}
    <div class="detail-hero">
      <div class="detail-people">${img(marta)}${img({name:'Алексей',image:'https://i.pravatar.cc/200?img=11'})}</div>
      <p class="section-kicker">ГОТОВЫЙ ОПЫТ</p>
      <h1 class="display display--small">Прогулка и спокойный разговор</h1>
      <div class="info-strip"><div><small>Когда</small><strong>Сегодня, 19:00</strong></div><div><small>Сколько</small><strong>30–45 минут</strong></div><div><small>Где</small><strong>Парк Скаришевский</strong></div></div>
    </div>
    <h2 class="list-title">Почему это может подойти</h2>
    <div class="reason-list">
      <div class="reason"><span class="reason-icon">◡</span><div><strong>Одинаковая потребность</strong><p>Вы оба хотите, чтобы вас услышали, без непрошенных советов.</p></div></div>
      <div class="reason"><span class="reason-icon">↔</span><div><strong>Совместимый темп</strong><p>Марта легко начинает разговор, но уважает паузы.</p></div></div>
      <div class="reason"><span class="reason-icon">☾</span><div><strong>Натальная динамика</strong><p>Луна в Тельце поддерживает спокойствие; общение лучше раскрывается в движении.</p></div></div>
    </div>
    <div class="guarantee"><strong>Experience Guarantee</strong><p>Если Марта не ответит или встреча сорвётся, предложим замену без потери приоритета.</p></div>
    <div class="actions"><button class="primary" data-action="next" data-target="offerSent">Предложить Марте</button><button class="secondary" data-action="next" data-target="recommendations">Посмотреть другие варианты</button></div>
  </section>`;
}

function offerSent() {
  return `<section class="screen offer-state">
    ${topbar('', { right: '<button class="icon-button" data-jump="home" aria-label="Закрыть">×</button>' })}
    <div class="signal">${img(people.marta)}</div>
    <p class="section-kicker">ОФЕР ОТПРАВЛЕН</p>
    <h1 class="display display--small">Ждём Марту</h1>
    <p class="lead">Она видит твой профиль, формат, время и границы. Офер исчезнет через 12 минут.</p>
    <div class="actions"><button class="primary" data-action="next" data-target="matched">Сымитировать принятие</button><button class="secondary" data-action="show-toast" data-message="Офер отменён без влияния на рейтинг">Отменить предложение</button></div>
    <p class="fine-print">Игнорирование и отказ не влияют на рейтинг ни одного участника.</p>
  </section>`;
}

function matched() {
  return `<section class="screen screen--ready">
    ${topbar('', { back: false, right: '<button class="icon-button" data-jump="home" aria-label="Закрыть">×</button>' })}
    <div class="matched-hero">
      <div class="matched-avatars">${img({name:'Алексей',image:'https://i.pravatar.cc/200?img=11'})}${img(people.marta)}</div>
      <p class="section-kicker">ПРЕДЛОЖЕНИЕ ПРИНЯТО</p>
      <h1 class="display display--small">Встреча состоится</h1>
      <p class="lead">Теперь открыты точное публичное место и временный чат.</p>
    </div>
    <div class="meeting-ticket">
      <div class="ticket-head"><h3>Прогулка и разговор</h3><p>Ты и Марта</p></div>
      <div class="ticket-details"><div><small>Сегодня</small><strong>19:00–19:45</strong></div><div><small>Точка встречи</small><strong>Главный вход в парк</strong></div></div>
    </div>
    <div class="actions"><button class="primary" data-action="next" data-target="chat">Открыть чат</button><button class="secondary" data-action="show-toast" data-message="Маршрут откроется в картах">Показать маршрут</button></div>
  </section>`;
}

function chat() {
  return `<section class="screen">
    ${topbar('Марта', { right: '<button class="icon-button" data-action="show-toast" data-message="Здесь будут безопасность, перенос и отмена">•••</button>' })}
    <div class="chat-thread">
      <div class="guarantee"><strong style="font-size:15px">Сегодня · 19:00</strong><p>Парк Скаришевский · главный вход · только публичное место</p></div>
      ${state.messages.map(m => `<div class="message ${m.mine ? 'message--mine' : ''}">${m.text}<small>${m.time}</small></div>`).join('')}
      <button class="soft-button" data-action="next" data-target="meeting">Перейти к встрече</button>
    </div>
    <form class="chat-compose" data-action="send-message"><input id="messageInput" aria-label="Сообщение" placeholder="Написать сообщение"><button aria-label="Отправить">↑</button></form>
  </section>`;
}

function meeting() {
  return `<section class="screen">
    ${topbar('Текущий опыт', { back: false, right: '<button class="icon-button" data-action="show-toast" data-message="Связаться с поддержкой Experience">?</button>' })}
    <p class="section-kicker">ВЫ ВСТРЕТИЛИСЬ</p>
    <h1 class="display display--small">Прогулка с Мартой</h1>
    <p class="lead">Твой Live-статус выключен. Другие пользователи больше не видят тебя рядом.</p>
    <div class="meeting-status">
      <div class="timer" id="meetingTimer">00:18:42</div>
      <p>прошло с подтверждения встречи</p>
      <div class="safety-actions">
        <button data-action="show-toast" data-message="Контакт получил уведомление и данные места">Поделиться статусом</button>
        <button data-action="show-toast" data-message="Открыта служба поддержки">Мне некомфортно</button>
      </div>
    </div>
    <h2 class="list-title">Небольшая подсказка</h2>
    <div class="reason"><span class="reason-icon">✦</span><div><strong>Начните с настоящего</strong><p>«Что за последнюю неделю неожиданно тебя поддержало?»</p></div></div>
    <div class="actions"><button class="primary" data-action="next" data-target="feedback">Завершить опыт</button><button class="secondary" data-action="show-toast" data-message="Опыт продлён ещё на 30 минут">Продлить время</button></div>
  </section>`;
}

function feedback() {
  const questions = [
    ['happened','Встреча состоялась?',['Да','Частично','Нет']],
    ['safe','Тебе было безопасно?',['Да','Не совсем','Нет']],
    ['need','Получил ли ты то, за чем пришёл?',['Да','Отчасти','Нет']],
    ['again','Хотел бы встретиться с Мартой снова?',['Да','Пока не знаю','Нет']]
  ];
  return `<section class="screen">
    ${topbar('', { back: false })}
    <p class="section-kicker">ПОСЛЕ ОПЫТА</p>
    <h1 class="display display--small">Как всё прошло?</h1>
    <p class="lead">Ответы приватны. У Марты не будет публичного рейтинга.</p>
    ${questions.map(q => `<div class="feedback-question"><h3>${q[1]}</h3><div class="feedback-options">${q[2].map(opt => `<button class="${state.feedback[q[0]] === opt ? 'is-selected' : ''}" data-action="feedback" data-key="${q[0]}" data-value="${opt}">${opt}</button>`).join('')}</div></div>`).join('')}
    <div class="actions"><button class="primary" data-action="next" data-target="summary">Сохранить ответы</button><button class="text-button" data-action="next" data-target="summary">Пропустить</button></div>
  </section>`;
}

function summary() {
  return `<section class="screen screen--ready">
    ${topbar('', { back: false })}
    <div class="summary-orbit"><span>Опыт<br>завершён</span></div>
    <h1 class="display display--small" style="text-align:center">Ты не просто получил мэтч</h1>
    <p class="lead" style="text-align:center">Ты встретился с человеком и узнал, какой формат общения подходит тебе сейчас.</p>
    <div class="guarantee"><strong>Что мы запомнили</strong><p>Спокойная прогулка один на один подошла лучше, чем шумное событие. Это повлияет на следующие предложения.</p></div>
    <div class="actions"><button class="primary" data-action="next" data-target="home">Вернуться на главную</button><button class="secondary" data-action="show-toast" data-message="Марта получит нейтральное приглашение без раскрытия ваших ответов">Предложить повторить позже</button></div>
  </section>`;
}

function radar() {
  return `<section class="screen screen--radar screen--with-nav">
    <div class="radar-head">
      ${topbar('Рядом сейчас', { back: false, right: `<button class="toggle ${state.live ? 'is-on' : ''}" data-action="toggle-live" aria-label="Включить или выключить Live"></button>` })}
      <span class="live-switch">Live включён на 43 минуты</span>
    </div>
    <div class="radar-map" aria-label="Приблизительная карта людей и зон рядом">
      <span class="radar-me" aria-label="Ваше приблизительное положение"></span>
      <button class="radar-person radar-person--one" data-action="radar-person" data-value="marta">${img(people.marta)}<span>☕ 300–500 м</span></button>
      <button class="radar-person radar-person--two" data-action="radar-person" data-value="denis">${img(people.denis)}<span>🚶 до 1 км</span></button>
      <button class="radar-person radar-person--three" data-action="radar-person" data-value="lena">${img(people.lena)}<span>🎵 в зоне</span></button>
      <button class="zone-beacon" data-action="next" data-target="zone">12<br>в Live Zone</button>
    </div>
    <div class="radar-sheet">
      <p class="section-kicker">АКТИВНЫЕ ЗОНЫ</p>
      <button class="zone-card" data-action="next" data-target="zone"><span class="zone-icon">♫</span><span><strong>Praga Hall</strong><small>12 участников · концерт сегодня</small></span><span>›</span></button>
      <button class="zone-card" data-action="show-toast" data-message="В кофейне 4 человека открыты к общению"><span class="zone-icon">☕</span><span><strong>Forum Coffee</strong><small>4 участника · партнёрское место</small></span><span>›</span></button>
    </div>
    ${bottomNav('radar')}
  </section>`;
}

function radarProfile() {
  const p = people[state.selectedRadarPerson];
  return `<section class="screen">
    ${topbar('', { right: '<button class="icon-button" data-action="show-toast" data-message="Пожаловаться или заблокировать">•••</button>' })}
    <div class="profile-hero">${img(p)}<h1>${p.name}, ${p.age}</h1><p>${p.distance} · точное место скрыто</p><span class="intent-badge">● ${p.intent}</span></div>
    <div class="compatibility"><div class="compatibility-head"><strong>Почему может получиться</strong><span>хороший ритм</span></div><p>${p.astro}</p></div>
    <h2 class="list-title">Что ${p.name} готов${p.name === 'Денис' ? '' : 'а'} сделать</h2>
    <div class="reason-list">
      <div class="reason"><span class="reason-icon">◷</span><div><strong>${p.note}</strong><p>После окончания Live-режима профиль исчезнет с радара.</p></div></div>
      <div class="reason"><span class="reason-icon">⌂</span><div><strong>Только публичное место</strong><p>Точная точка откроется после взаимного согласия.</p></div></div>
    </div>
    <div class="actions"><button class="primary" data-action="next" data-target="inviteBuilder">Предложить опыт</button><button class="secondary" data-action="show-toast" data-message="Профиль скрыт для этого Live-сеанса">Не показывать снова</button></div>
  </section>`;
}

function inviteBuilder() {
  const p = people[state.selectedRadarPerson];
  return `<section class="screen">
    ${topbar('Новый офер')}
    <p class="section-kicker">КОМУ</p>
    <div class="zone-card">${img(p)}<span><strong>${p.name}, ${p.age}</strong><small>${p.intent}</small></span></div>
    <h1 class="display display--small" style="margin-top:18px">Что предложим?</h1>
    <div class="offer-builder">
      <button class="offer-option" data-action="show-toast" data-message="Выбрано: кофе на 20 минут"><span>☕</span><span><strong>Кофе на 20 минут</strong><small>Forum Coffee · 350 м</small></span><span>✓</span></button>
      <button class="offer-option" data-action="show-toast" data-message="Выбрано: короткая прогулка"><span>🚶</span><span><strong>Короткая прогулка</strong><small>Публичный маршрут рядом</small></span><span>›</span></button>
      <button class="offer-option" data-action="show-toast" data-message="Добавить свой безопасный формат"><span>＋</span><span><strong>Другой формат</strong><small>Добавить предложение</small></span><span>›</span></button>
    </div>
    <div class="guarantee"><strong>Марта увидит до принятия</strong><p>Твоё фото, формат, время, границы и объяснение совместимости — но не точные координаты.</p></div>
    <div class="actions"><button class="primary" data-action="next" data-target="offerSent">Отправить офер</button></div>
  </section>`;
}

function zone() {
  return `<section class="screen screen--dark">
    ${topbar('Live Zone')}
    <p class="section-kicker" style="color:#f5a78e">PRAGA HALL · ДО 23:30</p>
    <h1 class="display">12 человек открыты к общению</h1>
    <p class="lead">Все участники подтвердили присутствие в зоне. Точные позиции внутри площадки не показываются.</p>
    <div class="natal-mini" style="margin-top:34px"><strong>🎵<br>сейчас здесь</strong></div>
    <div class="profile-triad">
      <div><small>Потанцевать</small><strong>5</strong></div><div><small>Поговорить</small><strong>4</strong></div><div><small>Компания</small><strong>3</strong></div>
    </div>
    <div class="actions"><button class="primary" data-action="radar-person" data-value="lena">Посмотреть подходящий офер</button><button class="secondary" data-action="show-toast" data-message="Вы отмечены в зоне на 60 минут">Отметиться в зоне</button></div>
  </section>`;
}

function plans() {
  return `<section class="screen screen--with-nav">
    ${topbar('Мои планы', { back: false, right: '<button class="icon-button" data-action="show-toast" data-message="Создание собственного опыта появится после пилота">＋</button>' })}
    <p class="section-kicker">СЕГОДНЯ</p>
    <div class="plan-row"><div class="plan-date"><small>сен</small><strong>7</strong></div><div><h3>Прогулка и спокойный разговор</h3><p>19:00 · Марта · подтверждено</p></div><button class="text-button" data-jump="matched">Открыть</button></div>
    <h2 class="list-title">История</h2>
    <div class="plan-row"><div class="plan-date" style="background:#f0e8dc;color:#6d5a45"><small>авг</small><strong>29</strong></div><div><h3>Кофе после работы</h3><p>Опыт завершён · формат подошёл</p></div><span>✓</span></div>
    <div class="plan-row"><div class="plan-date" style="background:#f0e8dc;color:#6d5a45"><small>авг</small><strong>21</strong></div><div><h3>Выставка фотографии</h3><p>Опыт отменён · без штрафа</p></div><span>—</span></div>
    ${bottomNav('plans')}
  </section>`;
}

function profile() {
  return `<section class="screen screen--with-nav">
    ${topbar('Профиль', { back: false, right: '<button class="icon-button" data-action="show-toast" data-message="Настройки профиля">⚙</button>' })}
    <div class="profile-hero">${img({name:'Алексей',image:'https://i.pravatar.cc/200?img=11'})}<h1>Алексей</h1><p>Спокойная глубина · Варшава</p></div>
    <div class="compatibility"><div class="compatibility-head"><strong>Твой стиль</strong><span>обновлён сегодня</span></div><p>Один на один · честно, но мягко · чаще планируешь заранее · открыт новому в безопасном контексте.</p></div>
    <h2 class="list-title">Приватность</h2>
    <div class="setting-row"><div><strong>Показывать меня в Live</strong><small>Только когда включаю вручную</small></div><button class="toggle is-on" data-action="toggle-setting" aria-label="Переключить"></button></div>
    <div class="setting-row"><div><strong>Романтические предложения</strong><small>Выключены</small></div><button class="toggle" data-action="toggle-setting" aria-label="Переключить"></button></div>
    <div class="setting-row"><div><strong>Натальная совместимость</strong><small>Используется как объясняющий слой</small></div><button class="toggle is-on" data-action="toggle-setting" aria-label="Переключить"></button></div>
    ${bottomNav('profile')}
  </section>`;
}

const screens = {
  welcome, signin, otp, birth, natalReady, personalityIntro, personalityQuiz,
  profileReady, home, mood, need, format, boundaries, recommendations,
  experienceDetail, offerSent, matched, chat, meeting, feedback, summary,
  radar, radarProfile, inviteBuilder, zone, plans, profile
};

function render() {
  const fn = screens[state.screen] || welcome;
  app.innerHTML = fn();
  app.scrollTop = 0;
}

function navigate(screen, push = true) {
  if (!screens[screen]) return;
  if (push && state.screen !== screen) state.history.push(state.screen);
  state.screen = screen;
  window.history.replaceState({}, '', `?screen=${encodeURIComponent(screen)}`);
  render();
}

function goBack() {
  const target = state.history.pop() || 'home';
  state.screen = target;
  window.history.replaceState({}, '', `?screen=${encodeURIComponent(target)}`);
  render();
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

document.addEventListener('click', event => {
  const jump = event.target.closest('[data-jump]');
  if (jump) { navigate(jump.dataset.jump); return; }

  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'back') goBack();
  if (action === 'next') navigate(target.dataset.target);
  if (action === 'show-toast') showToast(target.dataset.message || 'Готово');
  if (action === 'start-quiz') { state.quizStep = 0; navigate('personalityQuiz'); }
  if (action === 'quiz-answer') {
    document.querySelectorAll('.scale-dot').forEach(el => el.classList.remove('is-selected'));
    target.classList.add('is-selected');
  }
  if (action === 'quiz-next') {
    if (state.quizStep < quiz.length - 1) { state.quizStep += 1; render(); }
    else navigate('profileReady');
  }
  if (action === 'select-mood') { state.mood = target.dataset.value; render(); }
  if (action === 'select-need') { state.need = target.dataset.value; render(); }
  if (action === 'select-format') { state.format = target.dataset.value; render(); }
  if (action === 'toggle-boundary') {
    const value = target.dataset.value;
    state.boundaries = state.boundaries.includes(value) ? state.boundaries.filter(x => x !== value) : [...state.boundaries, value];
    render();
  }
  if (action === 'select-experience') { state.selectedExperience = target.dataset.value; navigate('experienceDetail'); }
  if (action === 'radar-person') { state.selectedRadarPerson = target.dataset.value; navigate('radarProfile'); }
  if (action === 'toggle-live') { state.live = !state.live; render(); showToast(state.live ? 'Live включён на 60 минут' : 'Вы исчезли с радара'); }
  if (action === 'toggle-setting') { target.classList.toggle('is-on'); }
  if (action === 'feedback') { state.feedback[target.dataset.key] = target.dataset.value; render(); }
});

document.addEventListener('submit', event => {
  const form = event.target.closest('[data-action="send-message"]');
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector('input');
  if (!input.value.trim()) return;
  state.messages.push({ mine: true, text: input.value.trim(), time: '18:44' });
  render();
  requestAnimationFrame(() => {
    const thread = document.querySelector('.chat-thread');
    if (thread) thread.scrollIntoView({ block: 'end' });
  });
});

render();
