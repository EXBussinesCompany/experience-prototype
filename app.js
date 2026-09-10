'use strict';
const M = window.ExperienceModel;
const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const STORAGE_KEY = 'experience-prototype-v2';
let state = M.initialState();
try {
  const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  if (saved && Array.isArray(saved.bookings) && Array.isArray(saved.excludedVenues) && Array.isArray(saved.blockedPeople)) state = { ...state, ...saved };
} catch { /* A fresh demo works without session storage too. */ }
let screen = new URLSearchParams(location.search).get('screen') || 'welcome';
let history = [], selected = state.selected || 'coffee', error = '', reportTarget = 'venue', reportReason = '', chatDraft = '';
const aliases = { radar:'lastMinute', radarProfile:'experienceDetail', zone:'lastMinute', inviteBuilder:'experienceDetail', offerSent:'reservation', signin:'onboarding', otp:'onboarding', personalityIntro:'mood', personalityQuiz:'mood', profileReady:'home', natalReady:'birth' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const currentEvent = () => M.eventById(selected) || M.events[0];
const booking = () => state.bookings.find(b => b.eventId === selected);
const language = e => e.language === 'pl' ? 'Польский' : 'Английский';
const company = e => e.company === 'small' ? '4 человека' : 'Вдвоём';
const price = e => e.cost === 0 ? 'Без расходов на месте' : `До ${e.cost} zł на месте`;
function save() { state.selected = selected; try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* In-memory fallback. */ } }
function button(label, action, value = '', style = 'primary', extra = '') { return `<button class="${style}" data-action="${action}" data-value="${esc(value)}" ${extra}>${label}</button>`; }
function link(label, target, style = 'secondary') { return button(label,'go',target,style); }
function heading(kicker,title,body = '') { return `<p class="section-kicker">${kicker}</p><h1 class="display">${title}</h1>${body ? `<p class="lead">${body}</p>` : ''}`; }
function note(title,body) { return `<div class="guarantee"><strong>${title}</strong><p>${body}</p></div>`; }
function avatar(id) { const p = M.people[id]; return `<span class="initial-avatar ${p.color}" aria-label="${p.name}">${p.name[0]}</span>`; }
function groupArt(e,large = false) { return `<div class="table-art ${e.tone} ${large ? 'table-art--large' : ''}" aria-hidden="true"><div class="table-center">${M.venues[e.venue].symbol}</div>${Array.from({length:e.company === 'small' ? 4 : 2},(_,i) => `<span class="table-seat seat-${i}"></span>`).join('')}</div>`; }
function bottomNav(active) {
  return `<nav class="bottom-nav" aria-label="Основная навигация">${[['home','⌂','Сегодня'],['lastMinute','◷','Скоро'],['plans','▤','Планы'],['profile','○','Профиль']].map(([id,symbol,label]) => `<button data-jump="${id}" ${active === id ? 'aria-current="page"' : ''} class="${active === id ? 'is-active' : ''}"><span>${symbol}</span><span>${label}</span></button>`).join('')}</nav>`;
}
function frame(title,content,{nav,back = true,step,paper = false} = {}) {
  if (nav === 'home') content += lunarEntry();
  if (nav === 'plans') content += `<h2 class="list-title">Личное</h2><div class="actions">${link('Мои даты из лунного календаря','lunarSaved')}</div>`;
  return `<section class="screen ${nav ? 'screen--with-nav' : ''} ${paper ? 'screen--ready' : ''}"><div class="demo-label">МАКЕТ · БЕЗ РЕАЛЬНЫХ БРОНЕЙ И СООБЩЕНИЙ</div><header class="topbar">${back ? button('←','back','','back','aria-label="Назад"') : '<span class="brand-lockup"><span class="brand-dot"></span>Experience</span>'}<strong>${title}</strong>${button('⌂','go','home','icon-button','aria-label="На главную"')}</header>${step ? `<div class="progress"><span style="width:${step * 25}%"></span></div>` : ''}${error ? `<p class="form-error" role="alert">${esc(error)}</p>` : ''}${content}${nav ? bottomNav(nav) : ''}</section>`;
}
function choice(key,value,title,description = '',symbol = '○',selection = state[key]) {
  const checked = Array.isArray(selection) ? selection.includes(value) : selection === value;
  return `<button class="wide-choice ${checked ? 'is-selected' : ''}" data-action="choose" data-key="${key}" data-value="${esc(value)}" aria-pressed="${checked}"><span>${symbol}</span><span><strong>${title}</strong>${description ? `<small>${description}</small>` : ''}</span><span class="check">✓</span></button>`;
}
function eventCard(e,broad = false) {
  return `<button class="experience-card" data-action="select-event" data-value="${e.id}"><div class="event-banner ${e.tone}">${groupArt(e)}<span class="event-label">${e.soon ? 'ОДНО СВОБОДНОЕ МЕСТО' : 'НЕБОЛЬШАЯ ВСТРЕЧА'}</span></div><div class="experience-body"><h3>${e.title}</h3><div class="experience-meta"><span>${e.time}</span><span>${company(e)}</span><span>${language(e)}</span></div><p>${price(e)} · ${e.walk}</p><div class="card-bottom"><span>${broad ? `Другой возрастной диапазон: ${e.age}` : M.intents[e.intent][0]}</span><span>↗</span></div></div></button>`;
}
function activeRequired(title) {
  return frame('',`${heading('ПРИМЕР СЦЕНАРИЯ',title,'Экран открывается после подтверждения встречи. Можно загрузить демонстрационный пример или пройти подбор с начала.')}<div class="actions">${button('Загрузить пример встречи','demo-book',screen)}${link('Пройти подбор','mood')}</div><p class="fine-print">Пример: группа на польском, 30–45 лет, до 50 zł. Исключённые места и участники останутся исключёнными.</p>`);
}
function welcome() {
  return frame('',`<div class="welcome-art">${groupArt(M.events[0],true)}<span class="small-stamp">НЕ НУЖНО<br>ИДТИ ОДНОМУ</span></div>${heading('КОМПАНИЯ ДЛЯ ТВОЕГО ВЕЧЕРА','Хороший план.<br>Подходящие люди.','Кофе, прогулка или разговор со смыслом. Договоритесь об ожиданиях — и просто приходите.')}<div class="actions">${link('Посмотреть, как это работает','onboarding','primary')}${link('Сразу к встречам','home')}</div><p class="fine-print">18+ · Дружеское общение · Без свайпов<br>Все люди и места в макете вымышлены.</p>`,{back:false,paper:true});
}
function onboarding() {
  return frame('',`${heading('НАЧНЁМ С ГЛАВНОГО','Твой город.<br>Твой комфорт.','Без номера телефона и длинного теста. Настроим демонстрационные встречи в Варшаве.')}<div class="city-lock"><span>⌂</span><div><strong>Варшава</strong><small>Один город для первого пилота</small></div></div><div class="field"><label for="language">Язык общения</label><select id="language" data-bind="language">${[['pl','Польский'],['en','Английский']].map(([id,name]) => `<option value="${id}" ${state.language === id ? 'selected' : ''}>${name}</option>`).join('')}</select></div><div class="field"><label for="age">Предпочтительная возрастная группа</label><select id="age" data-bind="age">${['18–29','30–45','45–60','60+'].map(x => `<option ${state.age === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div class="field"><label for="budget">Бюджет на месте, на человека</label><select id="budget" data-bind="budget">${[[0,'Только бесплатные прогулки'],[50,'До 50 zł'],[100,'До 100 zł']].map(([n,t]) => `<option value="${n}" ${state.budget === n ? 'selected' : ''}>${t}</option>`).join('')}</select></div><p class="fine-print align-left">В макете плата за организацию — 0 zł. Кофе и еда показаны отдельно. Реальных платежей нет.</p><div class="actions">${link('Сохранить и посмотреть встречи','home','primary')}</div>`);
}
function home() {
  const next = state.bookings.find(b => ['confirmed','arrived','late'].includes(b.status));
  return frame('',`<p class="section-kicker">ВАРШАВА · ТВОЁ ВРЕМЯ ДЛЯ ЛЮДЕЙ</p><div class="today-panel"><span class="section-kicker">КАКОГО ОБЩЕНИЯ ХОЧЕТСЯ?</span><h1>Не каждый вечер<br>должен быть одинаковым.</h1><p>Сначала — твои ожидания. Затем — встреча, на которую хочется прийти.</p><div class="actions">${link('Подобрать мой вечер','mood','primary')}</div></div>${next ? `<button class="upcoming-banner" data-action="open-booking" data-value="${next.eventId}"><span>ТВОЙ БЛИЖАЙШИЙ ПЛАН</span><strong>${M.eventById(next.eventId).title}</strong><small>${M.eventById(next.eventId).time} →</small></button>` : ''}<h2 class="list-title">Можно проще</h2><div class="home-actions"><button class="action-tile" data-jump="lastMinute"><span class="tile-icon">◷</span><span><strong>Есть свободный час?</strong><small>Демо-места на встречи через 40–55 минут</small></span><span>›</span></button><button class="action-tile" data-jump="plans"><span class="tile-icon">◉</span><span><strong>Собраться снова</strong><small>Следующий план с теми, кто понравился</small></span><span>›</span></button></div>${state.excludedVenues.length ? note('Твои предпочтения учтены',`${state.excludedVenues.length} мест исключено из подбора. Можно изменить это в профиле.`) : note('Здесь можно передумать','Пропуск предложения не влияет на приоритет. Подтверждённую встречу можно отменить явно и предупредить группу.')}<p class="fine-print">Выборы сохраняются только в этой вкладке. Реального подбора людей пока нет.</p>`,{nav:'home',back:false});
}
function mood() {
  return frame('Перед встречей',`${heading('1 / 4 · ТОЛЬКО ДЛЯ ТЕБЯ','Сколько сил<br>на общение?','Состояние не увидят другие участники. Оно не определяет, какие темы тебе нужны.')}<div class="energy-art"><span>◌</span><span>◑</span><span>●</span></div>${choice('energy','low','Хочется бережного темпа','Можно присмотреться и не спешить','◌')}${choice('energy','medium','Есть силы на знакомство','Комфортно включаться постепенно','◑')}${choice('energy','high','Хочется больше общения','Готов активно включиться','●')}<div class="actions">${link('Что хочется получить?','need','primary')}</div>`,{step:1});
}
function need() {
  return frame('Намерение',`${heading('2 / 4 · СМЫСЛ ВСТРЕЧИ','Чего хочется<br>сегодня?','Это намерение увидят и примут остальные. Плохое настроение не обязывает говорить о проблемах.')}<div class="intent-list">${Object.entries(M.intents).map(([id,[title,desc,symbol]]) => choice('intent',id,title,desc,symbol)).join('')}</div>${state.intent === 'deep' ? `<label class="check-row"><input type="checkbox" data-bind="listen" ${state.listen ? 'checked' : ''}><span>Готов не только делиться, но и слушать. Понимаю, что это не психологическая помощь.</span></label>` : ''}<div class="actions">${button('Выбрать формат','continue-intent')}</div>`,{step:2});
}
function format() {
  return frame('Формат',`${heading('3 / 4 · ТРИ ОТДЕЛЬНЫХ ВЫБОРА','Как будет<br>комфортнее?')}<h2 class="list-title">Сколько людей?</h2>${choice('company','small','Небольшая группа','Четверо, включая тебя','◉')}${choice('company','one','Один на один','Дружеский разговор вдвоём','○')}<h2 class="list-title">Когда?</h2>${choice('when','planned','Запланировать','Сегодня вечером или завтра','▤')}${choice('when','now','В ближайший час','Только подтверждённые свободные места','◷')}<h2 class="list-title">Как начать?</h2>${choice('start','inperson','Познакомиться на месте','Чат останется для организационных вопросов','↗')}${choice('start','chat','Сначала поздороваться в чате','Перед подтверждением можно посмотреть демо-чата','⌁')}<div class="actions">${link('Обозначить границы','boundaries','primary')}</div>`,{step:3});
}
function boundaries() {
  return frame('Договорённости',`${heading('4 / 4 · ОБЩИЕ ПРАВИЛА','Без неожиданных<br>ожиданий.','Публичное место и дружеский контекст обязательны в этом пилоте. Остальные границы выбери сам.')}<div class="fixed-rule"><span>✓</span><div><strong>Публичное место</strong><small>Только согласованная точка встречи</small></div><span>⌑</span></div><div class="fixed-rule"><span>✓</span><div><strong>Без романтических ожиданий</strong><small>Это не свидание</small></div><span>⌑</span></div>${choice('boundaries','noAdvice','Без непрошенных советов','Советы — только по запросу','≠')}${choice('boundaries','noAlcohol','Без алкоголя','Встреча не предполагает алкоголь','◒')}${note('Не меняем границы ради подбора','Если вариантов нет, предложим другой день или явное изменение предпочтений. Исключённых людей и места не возвращаем.')}<div class="actions">${link('Показать подходящие встречи','recommendations','primary')}</div>`,{step:4});
}
function filterSummary() { return `<div class="filter-summary"><span>${M.intents[state.intent][0]}</span><span>${state.company === 'small' ? 'Небольшая группа' : 'Один на один'}</span><span>${state.language === 'pl' ? 'PL' : 'EN'}</span><span>До ${state.budget} zł</span><span>${state.age}</span></div>`; }
function recommendations() {
  const list = M.recommend(state), broad = list.length ? [] : M.recommend(state,{broadenAge:true}).filter(e => e.age !== state.age);
  return frame('Твои варианты',`${heading('ОЖИДАНИЯ ВАЖНЕЕ СЛУЧАЙНОСТИ',list.length ? 'Вот что<br>подходит.' : 'Пока без<br>точного совпадения.',list.length ? 'Согласованы намерение, компания, язык и бюджет. Выбирай сам опыт.' : 'Не будем показывать неподходящий вариант как идеальный.')}${filterSummary()}${state.energy === 'low' ? note('Можно включаться постепенно','Твоё состояние остаётся приватным. На встрече можно пропустить вопрос или просто послушать.') : ''}${state.preferences.quieter ? note('Учли пожелание: потише','Кофейни в подборе имеют тихий зал; прогулки проходят по спокойному маршруту.') : ''}<div class="suggestion-list">${list.map(e => eventCard(e)).join('')}</div>${!list.length ? `${broad.length ? `<h2 class="list-title">Только с твоего согласия</h2><p class="lead">Есть другой возрастной диапазон. Остальные условия остаются прежними.</p><div class="suggestion-list">${broad.map(e => eventCard(e,true)).join('')}</div>` : note('Сохраним твой запрос','В демо доступно ограниченное число групп. Можно встать в лист ожидания или изменить условия.')}<div class="actions">${button(state.waitlisted ? 'Убрать из листа ожидания' : 'Встать в лист ожидания','waitlist','','soft-button')}${link('Изменить язык, возраст или бюджет','onboarding')}</div>` : ''}<div class="actions">${link('Изменить намерение и формат','need')}</div>${state.waitlisted ? '<p class="fine-print">Запрос сохранён в этой вкладке. Уведомления не отправляются.</p>' : ''}`);
}
function experienceDetail() {
  const e = currentEvent(), v = M.venues[e.venue];
  return frame('',`<div class="detail-hero ${e.tone}">${groupArt(e)}<p class="section-kicker">${e.soon ? 'МОЖНО ПРИСОЕДИНИТЬСЯ СЕГОДНЯ' : 'СНАЧАЛА ОПЫТ, ПОТОМ ЗНАКОМСТВО'}</p><h1 class="display">${e.title}</h1><div class="info-strip"><div><small>Когда</small><strong>${e.time}</strong></div><div><small>Компания</small><strong>${company(e)}</strong></div><div><small>Время</small><strong>${e.duration}</strong></div></div></div><h2 class="list-title">О чём договоримся</h2><p class="body-copy">${e.agreement}</p><div class="rule-tags"><span>Публичное место</span><span>Без романтики</span><span>Без алкоголя</span></div><h2 class="list-title">Место и расходы</h2><div class="venue-line"><span>${v.symbol}</span><div><strong>${v.name}</strong><small>${v.note}</small></div></div><div class="cost-row"><span>Организация в демо</span><strong>0 zł</strong></div><div class="cost-row"><span>Еда / напитки отдельно</span><strong>${e.cost ? `до ${e.cost} zł` : '0 zł'}</strong></div><div class="cost-row"><span>Язык · возраст</span><strong>${language(e)} · ${e.age}</strong></div>${state.age !== e.age ? note('Отличается возрастной диапазон',`Ты выбрал ${state.age}. Здесь группа ${e.age}. Ничего не меняем без отдельного согласия.`) : ''}<p class="fine-print align-left">Вымышленные место и участники. Доступность и расходы показаны для проверки сценария, не для реального бронирования.</p><div class="actions">${button(state.age !== e.age ? `Рассмотреть группу ${e.age}` : state.start === 'chat' ? 'Поздороваться перед подтверждением' : e.soon ? 'Занять демо-место на 2 минуты' : 'Посмотреть состав и подтвердить','prepare-book')}${button('Больше не предлагать это место','exclude-venue',e.venue,'text-button')}${link('Другие варианты','recommendations')}</div>`);
}
function reservation() {
  const e = currentEvent();
  return frame('Подтверждение',`${heading('ВСЕ ЗНАЮТ, ЗАЧЕМ ПРИХОДЯТ','Один стол.<br>Общие ожидания.',e.title)}${e.people.map(id => `<div class="person-row">${avatar(id)}<div><strong>${M.people[id].name}</strong><small>${M.people[id].note}</small></div><span class="person-check">✓</span></div>`).join('')}<p class="fine-print align-left">Демонстрационные участники согласны с форматом встречи.</p>${note('Общий договор',e.agreement)}${e.soon ? '<div class="hold-timer" role="status">Демо-место удерживается: <strong id="hold-countdown"></strong></div>' : ''}${state.start === 'chat' ? `<div class="preview-chat"><small>ПРИМЕР ГРУППОВОГО ЧАТА</small><p><strong>${M.people[e.people[0]].name}:</strong> Привет! Рада компании. Можно знакомиться без спешки 🙂</p><p>После подтверждения откроется поле для твоего сообщения.</p></div>` : ''}${state.age !== e.age ? note('Ты рассматриваешь другой диапазон',`${e.age} вместо ${state.age}. Согласие относится только к этой встрече.`) : ''}<label class="check-row"><input type="checkbox" id="agreement"><span>Мне подходит намерение, ${language(e).toLowerCase()} язык, состав и бюджет. Подтверждаю участие в демо.</span></label><div class="actions">${button('Подтвердить встречу','confirm-book')}${button('Пока не готов','release-hold','','secondary')}</div><p class="fine-print">Отказ от предложения не снижает приоритет. Подтверждение в макете никому не отправляется.</p>`);
}
function ticket(e) {
  const v = M.venues[e.venue];
  return `<div class="meeting-ticket"><div class="ticket-head"><p>${e.time.toUpperCase()}</p><h3>${e.title}</h3></div><div class="ticket-details"><div><small>Место</small><strong>${v.name}</strong></div><div><small>На месте</small><strong>${e.cost ? `До ${e.cost} zł` : 'Бесплатно'}</strong></div><div><small>Точка встречи</small><strong>${v.point}</strong></div><div><small>До закрытия</small><strong>${v.closes}</strong></div></div></div>`;
}
function matched() {
  const b = booking(), e = currentEvent();
  if (!b) return activeRequired('Встреча подтверждена');
  if (b.status === 'cancelled') return cancelled();
  if (['completed','missed','feedbackPending'].includes(b.status)) return summary();
  return frame('',`${heading('ТЕПЕРЬ ЭТО ПЛАН',b.status === 'late' ? 'Группа знает,<br>что ты опаздываешь.' : b.status === 'arrived' ? 'Ты на месте.<br>Можно знакомиться.' : 'Встреча<br>подтверждена.','Место, время и договорённости теперь в «Моих планах».')}${ticket(e)}<div class="people-strip">${e.people.map(avatar).join('')}<span>и ты · ${company(e)}</span></div><div class="actions">${link(e.company === 'small' ? 'Открыть групповой чат' : 'Открыть чат','chat','primary')}${button('Я на месте','arrive','','soft-button')}${button('Опаздываю на 10 минут','late','','secondary')}${link('Отменить участие','cancel','text-button')}</div><p class="fine-print">Это демо: группа не получает реальные уведомления.</p>`);
}
function chat() {
  const b = booking(), e = currentEvent();
  if (!b) return activeRequired('Чат встречи');
  if (b.status === 'cancelled') return cancelled();
  return frame(company(e),`<h1 class="display display--small">${e.title}</h1><div class="chat-context"><span>${e.time}</span>${link('Детали','matched','text-button')}</div><div class="chat-thread">${note('Сначала договорённости',e.agreement)}${e.people.slice(0,2).filter(id => !state.blockedPeople.includes(id)).map((id,i) => `<div class="message"><small>${M.people[id].name}</small>${i ? 'Отлично! Если буду задерживаться, отмечу это в плане.' : 'Привет! Буду у согласованной точки. До встречи 🙂'}</div>`).join('')}${b.messages.map(m => `<div class="message ${m.mine ? 'message--mine' : 'message--system'}">${m.mine ? '<small>Ты · только в этом макете</small>' : ''}${esc(m.text)}</div>`).join('')}<div class="actions">${b.status === 'completed' ? link('Запланировать следующую','repeat','soft-button') : button('Я на месте · начать встречу','arrive','','soft-button')}${link('Участники и безопасность','safety','text-button')}</div></div><form class="chat-compose" id="chat-form"><input name="message" aria-label="Сообщение группе" placeholder="Сообщение в демо-чат" maxlength="1000" value="${esc(chatDraft)}"><button aria-label="Отправить сообщение">↑</button></form>`);
}
function meeting() {
  const b = booking(), e = currentEvent();
  if (!b) return activeRequired('Во время встречи');
  if (b.status === 'cancelled') return cancelled();
  return frame('Вы встретились',`${heading('МОЖНО ПРОСТО БЫТЬ СОБОЙ',e.title,'Никакой обязательной программы. Можно просто общаться и не доставать телефон.')}${lunarEntry(true)}${note('Встреча может закончиться вовремя',`${e.duration} — ориентир, не обязательство. Можно уйти раньше без объяснения личных причин.`)}<div class="actions">${link('Хочется продолжить вечер','continueEvening','soft-button')}${link('Завершить и оставить отзыв','feedback','primary')}${link('Мне некомфортно','safety','danger-button')}${link('Вернуться в чат','chat','text-button')}</div>`);
}
function continueEvening() {
  const b = booking();
  if (!b) return activeRequired('Продолжить вечер');
  return frame('',`${heading('ТОЛЬКО ПО ЖЕЛАНИЮ','Ещё немного<br>времени вместе?','Сначала спросим остальных. Продолжение не предполагает алкоголь и не обязывает никого оставаться.')}<div class="continuation-place"><span>☕</span><h2>Тихое кафе рядом</h2><p>Пример: 7 минут пешком · до 25 zł<br>Нужно проверить наличие мест и часы работы.</p></div>${b.continuation ? note('Предложение в демо-чате','Остальные пока не подтвердили. Первоначальные время и место встречи не изменены.') : ''}<div class="actions">${button('Предложить группе продолжить','continue-evening','','primary',b.continuation ? 'disabled' : '')}${link('Открыть чат','chat')}${link('Мне достаточно на сегодня','feedback','text-button')}</div><p class="fine-print">Никакое кафе не забронировано. Это проверка сценария.</p>`);
}
function cancel() {
  if (!booking()) return activeRequired('Отмена участия');
  return frame('',`${heading('ПЛАНЫ МЕНЯЮТСЯ','Не получается<br>прийти?','Отмени участие явно: место освободится, а группа увидит изменение в демо-чате.')}<div class="field"><label for="cancel-reason">Причина — по желанию, только для сервиса</label><select id="cancel-reason"><option>Планы изменились</option><option>Не подходит формат</option><option>Плохо себя чувствую</option><option>Не хочу указывать</option></select></div>${note('Без скрытых наказаний','Не будем незаметно отдалять следующие встречи. При регулярных неявках правила должны быть объяснены отдельно и заранее.')}<div class="actions">${button('Отменить моё участие','cancel-book','','danger-button')}${link('Оставить встречу','matched')}</div>`);
}
function cancelled() {
  return frame('',`${heading('УЧАСТИЕ ОТМЕНЕНО','Спасибо,<br>что предупредил.','Демо-место освобождено. Отмена отмечена в истории, приоритет следующих предложений не изменён.')}<div class="ready-seal"></div><div class="actions">${link('Найти другой опыт','recommendations','primary')}${link('Мои планы','plans')}</div>`,{paper:true});
}
function safety() {
  const b = booking(), e = currentEvent();
  if (!b) return activeRequired('Безопасность встречи');
  return frame('Безопасность',`${heading('ТВОИ ГРАНИЦЫ ВАЖНЫ','Что сейчас<br>поможет?','Можно закончить встречу, исключить человека из будущего подбора или отдельно описать происшествие.')}<div class="safety-notice">Макет не связывается с поддержкой или экстренными службами. При непосредственной опасности обратись к персоналу места или в местную экстренную службу.</div><h2 class="list-title">Участники</h2>${e.people.map(id => `<div class="person-row">${avatar(id)}<div><strong>${M.people[id].name}</strong><small>${state.blockedPeople.includes(id) ? 'Исключён из будущего подбора' : 'Демо-участник встречи'}</small></div>${button(state.blockedPeople.includes(id) ? 'Вернуть' : 'Исключить','block',id,'text-button')}</div><div class="report-person">${button(`Сообщить о поведении: ${M.people[id].name}`,'report-person',id,'text-button')}</div>`).join('')}<div class="actions">${button('Проблема с местом','report-person','venue','secondary')}${link('Завершить встречу','feedback','danger-button')}${link('Вернуться в чат','chat','text-button')}</div><p class="fine-print">Исключение в демо применяется только к твоим предложениям. Это не блокировка чужого аккаунта.</p>`);
}
function report() {
  if (!booking()) return activeRequired('Описание происшествия');
  return frame('Сообщить о проблеме',`${heading('ПРИВАТНО · ДЕМОНСТРАЦИЯ','Что произошло?',`Касается: ${reportTarget === 'venue' ? M.venues[currentEvent().venue].name : M.people[reportTarget].name}.`)}<div class="field"><label for="report-reason">Причина</label><select id="report-reason"><option value="">Выбери причину</option>${['Нарушены договорённости','Нежелательные ухаживания','Грубость или угрозы','Проблема с местом','Другое'].map(x => `<option ${reportReason === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div class="field"><label for="report-text">Что важно знать? Не указывай личные данные</label><textarea id="report-text" rows="4" maxlength="1500" placeholder="Описание ситуации — по желанию"></textarea></div>${reportTarget !== 'venue' ? '<label class="check-row"><input id="report-block" type="checkbox" checked><span>Также исключить этого участника из моих будущих встреч</span></label>' : ''}<div class="actions">${button('Сохранить пример обращения','submit-report')}</div><p class="fine-print">Обращение останется в этой вкладке. Его никто не получит и не рассмотрит.</p>`);
}
function reportDone() {
  return frame('',`${heading('ДЕМО-ОБРАЩЕНИЕ СОХРАНЕНО','Твоё сообщение<br>не потерялось.','В рабочем приложении здесь должны быть номер обращения, статус и понятный способ связаться с поддержкой.')}<div class="report-receipt"><small>ПРИМЕР ОБРАЩЕНИЯ</small><strong>EXP-DEMO-01</strong><span>Не отправлено · только макет</span></div><div class="actions">${link('Завершить встречу','feedback','primary')}${link('К участникам','safety')}</div>`);
}
function feedback() {
  const b = booking();
  if (!b) return activeRequired('После встречи');
  if (b.status === 'cancelled') return cancelled();
  const f = b.feedback, qs = [['happened','Встреча состоялась?',['Да','Частично','Нет']]];
  if (f.happened !== 'Нет') qs.push(['safe','Было безопасно и комфортно?',['Да','Не совсем','Нет']],['need','Получил то, за чем пришёл?',['Да','Отчасти','Нет']],['venue','Как тебе место?',['Подошло','Не подошло']]);
  return frame('',`${heading('ПОСЛЕ ОПЫТА','Не оценка людей.<br>Твои ощущения.','Ответы приватны. Они не превращаются в публичный рейтинг участников.')}${qs.map(([key,title,options]) => `<div class="feedback-question"><h3>${title}</h3><div class="feedback-options">${options.map(value => `<button data-action="feedback" data-key="${key}" data-value="${value}" aria-pressed="${f[key] === value}" class="${f[key] === value ? 'is-selected' : ''}">${value}</button>`).join('')}</div></div>`).join('')}${f.venue === 'Не подошло' && f.happened !== 'Нет' ? `<label class="check-row"><input type="checkbox" data-bind="excludeFeedback" ${b.excludeFeedback ? 'checked' : ''}><span>Больше не предлагать мне ${M.venues[currentEvent().venue].name}</span></label>` : ''}<label class="check-row"><input type="checkbox" data-bind="quieter" ${state.preferences.quieter ? 'checked' : ''}><span>В следующий раз хочу более тихое место</span></label><div class="actions">${button('Сохранить и продолжить','save-feedback')}${button('Сейчас не хочу отвечать','skip-feedback','','text-button')}</div>`);
}
function summary() {
  const b = booking(), e = currentEvent();
  if (!b) return activeRequired('Итог встречи');
  const outcome = M.feedbackOutcome(b.feedback);
  return frame('',`${heading('СЛЕДУЮЩИЙ ОПЫТ БУДЕТ УЧИТЫВАТЬ ЭТО',outcome.title,outcome.text)}<div class="outcome-symbol ${outcome.kind}">${outcome.kind === 'success' ? '✧' : outcome.kind === 'unsafe' ? '♡' : '◌'}</div>${state.excludedVenues.includes(e.venue) ? note('Место исключено',`${M.venues[e.venue].name} больше не появится в твоём подборе. Вернуть его можно в профиле.`) : b.feedback.venue === 'Не подошло' ? note('Отзыв о месте сохранён','Низкая оценка не равна исключению. Если не хочешь возвращаться, явно исключи место.') : ''}${state.preferences.quieter ? note('Учли пожелание','В следующем подборе отметим тихие места.') : ''}<div class="actions">${outcome.kind === 'unsafe' ? link('Сообщить о происшествии','safety','danger-button') : ''}${['success','mismatch','neutral'].includes(outcome.kind) && b.status === 'completed' ? link('С кем хочется увидеться снова?','repeat','primary') : ''}${link('Подобрать другой опыт','recommendations',outcome.kind === 'missing' ? 'primary' : 'secondary')}${link('Мои планы','plans','text-button')}${link('Вернуться к ответам','feedback','text-button')}</div>`,{paper:true});
}
function repeat() {
  const b = booking(), e = currentEvent();
  if (!b) return activeRequired('Следующая встреча');
  if (b.status !== 'completed') return frame('',`${heading('СНАЧАЛА — ПЕРВАЯ ВСТРЕЧА','Повторим,<br>если захочется.','Этот сценарий доступен после состоявшейся встречи.')}<div class="actions">${link('К моим планам','plans','primary')}</div>`);
  const list = e.people.filter(id => !state.blockedPeople.includes(id));
  return frame('',`${heading('ХОРОШИЙ КОНТАКТ ХОЧЕТСЯ ПРОДОЛЖИТЬ','С кем соберёмся<br>ещё раз?','Отказы и твой выбор не показываются остальным. Приглашение придёт только выбранным людям — в рабочем приложении.')}${list.map(id => choice('repeatPeople',id,M.people[id].name,'Предложить новый совместный опыт','○',b.repeatPeople)).join('')}${!list.length ? note('Нет доступных участников','Ты исключил участников этой встречи. Можно найти новую компанию.') : ''}<div class="actions">${button('Выбрать следующий план','repeat-next','','primary',!list.length ? 'disabled' : '')}${link('Не сейчас','plans','text-button')}</div>`);
}
function repeatPlan() {
  const b = booking();
  if (!b || b.status !== 'completed' || !b.repeatPeople.length) return repeat();
  return frame('',`${heading('СВОИ ЛЮДИ · НОВЫЙ ОПЫТ','Осталось<br>договориться.','Выбери вариант и время. Пока остальные не подтвердили, это только предложение.')}<h2 class="list-title">Что предложить?</h2>${choice('repeatFormat','coffee','Кофе и разговор','До 45 zł на месте · 60 минут','☕',b.repeatFormat || 'coffee')}${choice('repeatFormat','walk','Новый маршрут пешком','Без расходов · 45 минут','↗',b.repeatFormat || 'coffee')}<h2 class="list-title">Какое время тебе удобно?</h2>${choice('repeatTime','Суббота · 12:00','Суббота, 12:00','','▤',b.repeatTime || 'Суббота · 12:00')}${choice('repeatTime','Воскресенье · 16:00','Воскресенье, 16:00','','▤',b.repeatTime || 'Суббота · 12:00')}<div class="actions">${button('Создать демо-приглашение','send-repeat')}</div><p class="fine-print">Реальные приглашения не отправляются. Новое место выбирается только после согласования времени.</p>`);
}
function repeatStatus() {
  const r = state.repeat;
  if (!r) return repeat();
  return frame('',`${heading(r.accepted ? 'ДЕМО-ОТВЕТ ПОЛУЧЕН' : 'ПРИГЛАШЕНИЕ СОЗДАНО',r.accepted ? 'Время согласовано.' : 'Дадим людям<br>время ответить.',r.accepted ? 'Осталось согласовать конкретное публичное место. В «Планах» это ещё не подтверждённая бронь.' : 'Не нужно напоминать каждому отдельно. В макете ответ можно сымитировать кнопкой ниже.')}<div class="meeting-ticket"><h3>${r.format === 'walk' ? 'Новый маршрут пешком' : 'Кофе и разговор'}</h3><p>${r.time}</p>${r.people.map(id => `<div class="person-row">${avatar(id)}<strong>${M.people[id].name}</strong><small>${r.accepted ? 'Время подходит' : 'Ожидаем ответ'}</small></div>`).join('')}</div><div class="actions">${!r.accepted ? button('Демо: всем подходит время','accept-repeat') : ''}${link('Мои планы','plans',r.accepted ? 'primary' : 'secondary')}${button('Отозвать предложение','cancel-repeat','','text-button')}</div>`);
}
function lastMinute() {
  const list = M.recommend(state,{soonOnly:true});
  return frame('',`${heading('СВОБОДНЫЙ ЧАС — УЖЕ ПЛАН','Компания<br>в ближайший час.','Не карта чужих перемещений, а свободные места на конкретных встречах. Все варианты здесь демонстрационные.')}${filterSummary()}<div class="suggestion-list">${list.map(e => eventCard(e)).join('')}</div>${!list.length ? note('Сейчас нет подходящих демо-мест','Твои язык, бюджет, намерение и исключения не меняются. Можно оставить запрос или пересмотреть условия.') : note('Место — только после подтверждения','Нажатие удержит демо-место на 2 минуты. Истечение времени не влияет на приоритет.')}<div class="actions">${button(state.waitlisted ? 'Отменить запрос на место' : 'Ждать подходящее место','waitlist','','soft-button')}${link('Изменить мои условия','need')}</div>${state.waitlisted ? '<p class="fine-print">Лист ожидания активен только в этой вкладке. Push-уведомлений нет.</p>' : ''}`,{nav:'lastMinute',back:false});
}
function seatUnavailable() {
  return frame('',`${heading('ЭТО БЫВАЕТ','Место уже<br>недоступно.','Время удержания закончилось или место заняли. Никаких списаний и изменений приоритета.')}<div class="actions">${link('Посмотреть другие места','lastMinute','primary')}${button('Ждать следующее место','waitlist','','secondary')}</div>${state.waitlisted ? note('Запрос сохранён','Это локальный лист ожидания в макете.') : ''}`);
}
const statusLabels = {confirmed:'Подтверждено',arrived:'Ты на месте',late:'Опаздываешь на 10 минут',completed:'Завершено',feedbackPending:'Завершение не подтверждено',missed:'Не состоялось',cancelled:'Отменено · без скрытого штрафа'};
function plans() {
  return frame('',`${heading('МОИ ПЛАНЫ','Общение,<br>которое продолжается.')}${state.repeat ? `<button class="upcoming-banner" data-jump="repeatStatus"><span>${state.repeat.accepted ? 'ВРЕМЯ СОГЛАСОВАНО · МЕСТО ЕЩЁ НЕТ' : 'ЖДЁМ ОТВЕТЫ'}</span><strong>${state.repeat.format === 'walk' ? 'Новый маршрут пешком' : 'Кофе и разговор'}</strong><small>${state.repeat.time} →</small></button>` : ''}${state.bookings.length ? state.bookings.slice().reverse().map(b => `<button class="plan-row plan-button" data-action="open-booking" data-value="${b.eventId}"><div class="plan-date"><strong>${M.venues[M.eventById(b.eventId).venue].symbol}</strong></div><div><h3>${M.eventById(b.eventId).title}</h3><p>${M.eventById(b.eventId).time}</p><p>${statusLabels[b.status]}</p></div><span>›</span></button>`).join('') : `<div class="empty-illustration">▤</div><p class="lead">Здесь появятся подтверждённые встречи и предложения собраться снова.</p><div class="actions">${link('Выбрать первый опыт','mood','primary')}</div>`}`,{nav:'plans',back:false});
}
function profile() {
  return frame('',`${heading('ДЕМО-ПРОФИЛЬ','Не начинаем<br>каждый раз с нуля.')}<div class="profile-facts"><span>Варшава</span><span>${state.language === 'pl' ? 'Польский' : 'Английский'}</span><span>До ${state.budget} zł</span><span>${state.age}</span></div><div class="actions">${link('Изменить основные предпочтения','onboarding')}</div><h2 class="list-title">Исключённые места</h2>${state.excludedVenues.length ? state.excludedVenues.map(id => `<div class="setting-row"><strong>${M.venues[id].name}</strong>${button('Вернуть','restore-venue',id,'text-button')}</div>`).join('') : '<p class="body-copy muted">Пока нет. Исключения применяются ко всему подбору.</p>'}<h2 class="list-title">Исключённые участники</h2>${state.blockedPeople.length ? state.blockedPeople.map(id => `<div class="setting-row"><strong>${M.people[id].name}</strong>${button('Вернуть','block',id,'text-button')}</div>`).join('') : '<p class="body-copy muted">Пока нет. Эти настройки не видны другим.</p>'}<h2 class="list-title">Для себя · по желанию</h2>${lunarEntry()}<button class="action-tile" data-jump="compatibility"><span class="tile-icon">◎</span><span><strong>Совместимость</strong><small>Возможность на будущее · пока без расчётов</small></span><span>›</span></button>${note('Только в этой вкладке','Макет хранит демо-выборы в sessionStorage. Нет регистрации, геолокации, реальных сообщений, оплаты или службы поддержки.')}<div class="actions">${link('Сбросить демо','reset','text-button')}</div>`,{nav:'profile',back:false});
}
function birth() {
  return compatibility();
}

// Fixtures for interface exploration only: these are not lunar calculations.
const lunarCategories = {
  hair: {name:'Стрижка',symbol:'✂',ideas:['Обновить привычную форму','Оставить всё как нравится','Дать новой идее немного времени'],good:[12,15,18,24,28],slow:[10,13,20,26]},
  care: {name:'Уход за собой',symbol:'✧',ideas:['Выделить время на привычный уход','Выбрать по своему настроению','Не спешить с радикальной сменой образа'],good:[10,14,19,23,29],slow:[12,17,25]},
  social: {name:'Общение',symbol:'◎',ideas:['Позвать кого-то на кофе','Оставить привычный темп общения','Выбрать спокойный вечер без обязательств'],good:[11,15,18,22,27],slow:[13,20,26]},
  creative: {name:'Творчество',symbol:'✎',ideas:['Попробовать небольшой творческий проект','Продолжить то, что уже нравится','Сначала собрать идеи, не торопясь с результатом'],good:[10,16,21,25,30],slow:[12,19,24]}
};
const lunarLabels = ['Благоприятно','Нейтрально','Не спешить'];
function lunarState() {
  if (!state.lunar || typeof state.lunar !== 'object' || Array.isArray(state.lunar)) state.lunar = {};
  const l = state.lunar;
  if (!Object.hasOwn(lunarCategories,l.category)) l.category = 'hair';
  if (!Number.isInteger(l.day) || l.day < 1 || l.day > 30) l.day = 10;
  if (!['today','dates'].includes(l.tab)) l.tab = 'today';
  l.saved = Array.isArray(l.saved) ? [...new Set(l.saved.filter(key => typeof key === 'string' && /^(hair|care|social|creative):([12]\d|30)$/.test(key)))] : [];
  return l;
}
function lunarStatus(category,day) {
  const c = lunarCategories[category];
  return c.good.includes(day) ? 0 : c.slow.includes(day) ? 2 : 1;
}
function lunarEntry(atTable = false) {
  return `<section class="lunar-entry"><div class="lunar-entry-head"><span class="lunar-mini" aria-hidden="true">☾</span><div><p class="section-kicker">${atTable ? 'ЕСЛИ ИНТЕРЕСНО ВСЕМ' : 'МОЖНО И МЕЖДУ ВСТРЕЧАМИ'}</p><h2>Лунный календарь</h2></div></div><p>${atTable ? 'Посмотреть день вместе — по желанию. Без заданий, вопросов по кругу и обязательного участия.' : 'Сегодняшний день, уход за собой, общение и творчество. Выбирай то, что интересно тебе.'}</p>${link('Открыть календарь','lunar','soft-button')}<small>Астрологические трактовки · демо, не научный прогноз</small></section>`;
}
function lunar() {
  const l = lunarState(), day = l.tab === 'today' ? 10 : l.day, c = lunarCategories[l.category], status = lunarStatus(l.category,day), key = `${l.category}:${day}`, saved = l.saved.includes(key);
  const categories = `<div class="lunar-categories" aria-label="Категория календаря">${Object.entries(lunarCategories).map(([id,c]) => button(c.name,'lunar-category',id,'lunar-chip',`aria-pressed="${l.category === id}"`)).join('')}</div>`;
  const calendar = `<h2 class="list-title">Сентябрь 2026</h2><div class="lunar-week" aria-hidden="true">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(x=>`<span>${x}</span>`).join('')}</div><div class="lunar-grid" aria-label="Демонстрационный календарь на сентябрь"><span></span>${Array.from({length:30},(_,i)=>{const d=i+1,s=lunarStatus(l.category,d);return button(`${d}<span aria-hidden="true">${['●','·','—'][s]}</span>`,'lunar-day',d,`lunar-day lunar-status-${s}`,`aria-pressed="${day===d}" aria-label="${d} сентября: ${lunarLabels[s]}${d===10?', сегодня в демо':''}"`);}).join('')}</div><div class="lunar-legend"><span>● Благоприятно</span><span>· Нейтрально</span><span>— Не спешить</span></div>`;
  return frame('Лунный календарь',`${heading('ЛИЧНЫЙ РИТУАЛ · ПО ЖЕЛАНИЮ','Немного времени<br>для себя.')}<div class="lunar-tabs" aria-label="Вид календаря">${button('Сегодня','lunar-tab','today','lunar-chip',`aria-pressed="${l.tab==='today'}"`)}${button('Подобрать день','lunar-tab','dates','lunar-chip',`aria-pressed="${l.tab==='dates'}"`)}</div><div class="lunar-demo-notice">Демо-сегодня: 10 сентября 2026. Даты, фазы и трактовки — иллюстрации интерфейса, не расчёт.</div>${l.tab==='today'?`<div class="lunar-hero"><div class="lunar-disc" aria-hidden="true"></div><div><small>Пример фазы</small><h2>Убывающая Луна</h2><p>10 сентября · демо</p></div></div>`:''}${categories}${l.tab==='dates'?calendar:''}<section class="lunar-reading" aria-live="polite"><p class="section-kicker">${day} сентября · ${c.name}</p><span class="lunar-status-label lunar-status-${status}">${lunarLabels[status]}</span><h2>${c.ideas[status]}</h2><p>Пример трактовки по лунной традиции. Это не запрет и не обещание результата: ориентируйся на свои желания и обстоятельства.</p>${button(saved?'Дата сохранена ✓':day<10?'Прошедшая дата в демо':'Сохранить дату','lunar-save','','soft-button',saved||day<10?'disabled':'')}</section><p class="fine-print align-left">Календарь не даёт медицинских рекомендаций и не определяет, можно ли тебе встречаться с людьми.</p><div class="actions">${link(`Мои даты${l.saved.length?' · '+l.saved.length:''}`,'lunarSaved')}${link('Совместимость · в будущем','compatibility','text-button')}</div>`);
}
function lunarSaved() {
  const l = lunarState();
  return frame('Мои даты',`${heading('ИЗ ЛУННОГО КАЛЕНДАРЯ','Оставить<br>для себя.','Это личные заметки, не запись в салон и не бронь встречи.')}${l.saved.length?l.saved.slice().sort((a,b)=>Number(a.split(':')[1])-Number(b.split(':')[1])).map(key=>{const [category,day]=key.split(':');return `<div class="lunar-saved-row">${button(`<strong>${day} сентября</strong><small>${lunarCategories[category].name}</small>`,'lunar-open-saved',key,'lunar-saved-open')}${button('Убрать','lunar-remove',key,'text-button',`aria-label="Убрать ${day} сентября: ${lunarCategories[category].name}"`)}</div>`;}).join(''):note('Пока нет сохранённых дат','Выбери категорию и день в календаре.')}<p class="fine-print">Даты сохраняются только в этой вкладке. Уведомления не отправляются.</p><div class="actions">${link('Вернуться в календарь','lunar','primary')}${link('Мои встречи','plans','text-button')}</div>`);
}
function compatibility() {
  return frame('Совместимость',`${heading('ВОЗМОЖНО В БУДУЩЕМ','Другой взгляд<br>на вашу динамику.','Добровольное сравнение натальных карт для тех, кому интересно. Пока это только направление для исследования.')}<div class="astro-art" aria-hidden="true">☾</div>${note('Не условие знакомства','Совместимость не будет ограничивать доступ к людям и встречам. Без рейтинга «лучших» и «худших» участников.')}${note('Только с взаимного согласия','Предполагается отдельное согласие каждого участника. В этом макете данные рождения не собираются и карты не рассчитываются.')}<p class="fine-print">Астрологическая интерпретация — не научная оценка отношений. Даты запуска нет.</p><div class="actions">${link('Пока посмотреть календарь','lunar','primary')}${link('Вернуться к встречам','home')}</div>`);
}
function reset() { return frame('',`${heading('НАЧАТЬ С ЧИСТОГО ЛИСТА','Сбросить<br>этот демо-сеанс?','Удалятся только локальные выборы, сообщения и планы в этой вкладке.')}<div class="actions">${button('Да, начать заново','reset-demo','','danger-button')}${link('Сохранить мои выборы','profile')}</div>`); }

const screens = {welcome,onboarding,home,mood,need,format,boundaries,recommendations,experienceDetail,reservation,matched,chat,meeting,continueEvening,cancel,cancelled,safety,report,reportDone,feedback,summary,repeat,repeatPlan,repeatStatus,lastMinute,seatUnavailable,plans,profile,birth,lunar,lunarSaved,compatibility,reset};
function render(preserveScroll = false) {
  const scroll = preserveScroll ? app.querySelector('.screen')?.scrollTop || 0 : 0;
  screen = aliases[screen] || screen;
  if (!screens[screen]) screen = 'welcome';
  app.innerHTML = screens[screen]();
  const scroller = app.querySelector('.screen');
  if (scroller) scroller.scrollTop = scroll;
  document.querySelectorAll('.journey-nav button').forEach(b => b.classList.toggle('is-current',b.dataset.jump === screen));
  updateCountdown(); save();
}
function navigate(target,push = true) {
  target = aliases[target] || target;
  if (!screens[target]) return;
  if (push && target !== screen) history.push(screen);
  screen = target; error = ''; chatDraft = '';
  const url = new URL(location.href); url.searchParams.set('screen',screen);
  window.history.replaceState({},'',url); render();
}
let toastTimer;
function showToast(message) { toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'),3500); }
function fail(message) { error = message; render(); }
function updateCountdown() {
  const node = document.querySelector('#hold-countdown');
  if (!node) return;
  const remaining = Math.max(0,Math.ceil(((state.hold?.eventId === selected ? state.hold.expiresAt : 0) - Date.now()) / 1000));
  node.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2,'0')}`;
  if (!remaining && screen === 'reservation') { state.hold = null; navigate('seatUnavailable'); }
}
function toggle(list,value) { return list.includes(value) ? list.filter(x => x !== value) : [...list,value]; }
function blockPerson(id) {
  state.blockedPeople = toggle(state.blockedPeople,id);
  if (!state.blockedPeople.includes(id)) return;
  state.bookings.forEach(b => b.repeatPeople = b.repeatPeople.filter(p => p !== id));
  if (state.repeat?.people.includes(id)) { state.repeat.people = state.repeat.people.filter(p => p !== id); if (!state.repeat.people.length) state.repeat = null; }
}
document.addEventListener('click',ev => {
  const jump = ev.target.closest('[data-jump]');
  if (jump) { navigate(jump.dataset.jump); return; }
  const target = ev.target.closest('[data-action]');
  if (!target || target.disabled) return;
  const {action,value,key} = target.dataset, b = booking();
  switch (action) {
    case 'go': navigate(value); break;
    case 'back': navigate(history.pop() || 'home',false); break;
    case 'choose':
      if (key === 'repeatPeople' && b) b.repeatPeople = toggle(b.repeatPeople,value);
      else if (['repeatTime','repeatFormat'].includes(key) && b) b[key] = value;
      else if (key === 'boundaries' && ['noAdvice','noAlcohol'].includes(value)) state.boundaries = toggle(state.boundaries,value);
      else if (['energy','intent','company','when','start'].includes(key)) { state[key] = value; state.acceptedAgeEventId = null; }
      error = ''; render(true); break;
    case 'continue-intent': if (state.intent === 'deep' && !state.listen) fail('Для глубокого разговора важно быть готовым и делиться, и слушать. Подтверди это или выбери другой формат.'); else navigate('format'); break;
    case 'select-event': selected = value; state.acceptedAgeEventId = null; navigate('experienceDetail'); break;
    case 'prepare-book':
      if (currentEvent().intent === 'deep' && !state.listen) { navigate('need'); fail('Сначала подтверди готовность слушать других.'); break; }
      if (currentEvent().age !== state.age) state.acceptedAgeEventId = selected;
      if (currentEvent().soon && !M.holdSeat(state,selected)) navigate('seatUnavailable'); else navigate('reservation'); break;
    case 'confirm-book':
      if (!document.querySelector('#agreement')?.checked) { fail('Подтверди, что тебе подходят условия встречи.'); break; }
      if (!M.confirmBooking(state,selected)) navigate('seatUnavailable'); else navigate('matched'); break;
    case 'release-hold': state.hold = null; navigate('recommendations'); showToast('Предложение отклонено. Приоритет не изменён.'); break;
    case 'demo-book': {
      const demo = M.initialState();
      for (const k of ['intent','company','language','age','budget','when']) state[k] = demo[k];
      selected = 'coffee';
      if (M.confirmBooking(state,selected)) navigate(value);
      else { navigate('recommendations'); showToast('Пример недоступен из-за твоих исключений. Они сохранены.'); }
      break;
    }
    case 'open-booking': selected = value; navigate(['completed','missed','feedbackPending'].includes(booking()?.status) ? 'summary' : booking()?.status === 'cancelled' ? 'cancelled' : 'matched'); break;
    case 'arrive': if (b && ['confirmed','late','arrived'].includes(b.status)) { b.status = 'arrived'; navigate('meeting'); } break;
    case 'late': if (b && ['confirmed','late'].includes(b.status)) { b.status = 'late'; b.messages.push({text:'В демо: ты предупредил, что опоздаешь на 10 минут.'}); render(); } break;
    case 'cancel-book': if (b && M.cancelBooking(state,selected)) { b.cancelReason = document.querySelector('#cancel-reason').value; navigate('cancelled'); } break;
    case 'exclude-venue': if (!state.excludedVenues.includes(value)) state.excludedVenues.push(value); state.hold = null; navigate('recommendations'); showToast('Место исключено. Его можно вернуть в профиле.'); break;
    case 'restore-venue': state.excludedVenues = state.excludedVenues.filter(id => id !== value); render(true); break;
    case 'block': blockPerson(value); render(true); showToast('Настройка будущего подбора обновлена.'); break;
    case 'report-person': reportTarget = value; reportReason = ''; navigate('report'); break;
    case 'submit-report': {
      const reason = document.querySelector('#report-reason')?.value;
      if (!reason) { fail('Выбери причину обращения.'); break; }
      if (b) { b.report = {target:reportTarget,reason,text:document.querySelector('#report-text').value.trim()};
        if (reportTarget !== 'venue' && document.querySelector('#report-block')?.checked && !state.blockedPeople.includes(reportTarget)) blockPerson(reportTarget);
        navigate('reportDone'); }
      break;
    }
    case 'feedback': if (b) { b.feedback[key] = value; if (key === 'happened' && value === 'Нет') { b.feedback = {happened:'Нет'}; b.excludeFeedback = false; } render(true); } break;
    case 'save-feedback':
      if (!b) break;
      if (!b.feedback.happened || (b.feedback.happened !== 'Нет' && (!b.feedback.safe || !b.feedback.need))) { fail('Ответь на вопросы о встрече, безопасности и результате или выбери «Сейчас не хочу отвечать».'); break; }
      b.status = b.feedback.happened === 'Нет' ? 'missed' : 'completed';
      if (b.excludeFeedback && b.feedback.venue === 'Не подошло' && !state.excludedVenues.includes(currentEvent().venue)) state.excludedVenues.push(currentEvent().venue);
      navigate('summary'); break;
    case 'skip-feedback': if (b) {
      b.status = b.feedback.happened === 'Нет' ? 'missed' : b.feedback.happened ? 'completed' : 'feedbackPending';
      navigate('summary');
    } break;
    case 'lunar-category': if (Object.hasOwn(lunarCategories,value)) { lunarState().category = value; render(true); } break;
    case 'lunar-tab': if (['today','dates'].includes(value)) { lunarState().tab = value; render(); } break;
    case 'lunar-day': if (Number.isInteger(Number(value)) && Number(value)>=1 && Number(value)<=30) { lunarState().day = Number(value); render(true); } break;
    case 'lunar-save': {
      const l=lunarState(), day=l.tab==='today'?10:l.day, key=`${l.category}:${day}`;
      if (day>=10 && !l.saved.includes(key)) { l.saved.push(key); render(true); showToast('Дата сохранена в этой вкладке. Без брони и уведомлений.'); }
      break;
    }
    case 'lunar-remove': { const l=lunarState(); l.saved=l.saved.filter(key=>key!==value); render(true); break; }
    case 'lunar-open-saved': if (lunarState().saved.includes(value)) { const [category,day]=value.split(':'); Object.assign(state.lunar,{category,day:Number(day),tab:'dates'}); navigate('lunar'); } break;
    case 'continue-evening': if (b && !b.continuation) { b.continuation = true; b.messages.push({text:'В демо: предложено продолжить в тихом кафе рядом. Время и место нужно согласовать со всеми.'}); render(true); } break;
    case 'waitlist': state.waitlisted = !state.waitlisted; render(true); showToast(state.waitlisted ? 'Демо-запрос сохранён в этой вкладке.' : 'Демо-запрос отменён.'); break;
    case 'repeat-next': if (!b?.repeatPeople.length) fail('Выбери хотя бы одного участника или вернись к планам.'); else navigate('repeatPlan'); break;
    case 'send-repeat': if (b?.repeatPeople.length) { state.repeat = {eventId:selected,people:b.repeatPeople.filter(id => !state.blockedPeople.includes(id)),format:b.repeatFormat || 'coffee',time:b.repeatTime || 'Суббота · 12:00',accepted:false}; navigate('repeatStatus'); } break;
    case 'accept-repeat': if (state.repeat) { state.repeat.accepted = true; render(); } break;
    case 'cancel-repeat': state.repeat = null; navigate('plans'); break;
    case 'reset-demo': try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Optional storage. */ } state = M.initialState(); selected = 'coffee'; history = []; navigate('welcome',false); break;
  }
  save();
});
document.addEventListener('change',ev => {
  const key = ev.target.dataset.bind;
  if (!key) { if (ev.target.id === 'report-reason') reportReason = ev.target.value; return; }
  const value = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
  if (key === 'excludeFeedback' && booking()) booking().excludeFeedback = value;
  else if (key === 'quieter') state.preferences.quieter = value;
  else if (['language','age','budget','listen','astro'].includes(key)) { state[key] = key === 'budget' ? Number(value) : value; state.acceptedAgeEventId = null; }
  save(); if (key === 'astro') render(true);
});
document.addEventListener('input',ev => { if (ev.target.name === 'message') chatDraft = ev.target.value; });
document.addEventListener('submit',ev => {
  if (ev.target.id !== 'chat-form') return;
  ev.preventDefault();
  const text = new FormData(ev.target).get('message').trim();
  if (!text || !booking() || booking().status === 'cancelled') return;
  booking().messages.push({mine:true,text:text.slice(0,1000)}); chatDraft = ''; render();
  const scroller = app.querySelector('.screen'); scroller.scrollTop = scroller.scrollHeight;
  document.querySelector('[name="message"]')?.focus();
});
setInterval(updateCountdown,1000);
render();
