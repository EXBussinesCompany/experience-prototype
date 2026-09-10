(function (root) {
  'use strict';
  const people = {
    marta: { name: 'Марта', note: 'Любит пешие маршруты и тихие кафе', color: 'sage' },
    denis: { name: 'Денис', note: 'Знакомится с городом после переезда', color: 'peach' },
    lena: { name: 'Лена', note: 'За маленькие компании и новые истории', color: 'blue' },
    anton: { name: 'Антон', note: 'Любит прогулки без спешки', color: 'sand' },
    anna: { name: 'Анна', note: 'Рада лёгкому разговору после работы', color: 'peach' }
  };
  const venues = {
    garden: { name: 'Кофейня «Сад»', address: 'Демо-адрес · Зелёная, 12', point: 'Стол у окна, табличка Experience', closes: '22:00', note: 'Тихий зал · есть растительное молоко', symbol: '☕' },
    park: { name: 'Парк у набережной', address: 'Демо-маршрут · центральный вход', point: 'У большого стенда с картой парка', closes: 'Маршрут до 20:30', note: 'Людный маршрут · 2 км · без ступеней', symbol: '↗' },
    studio: { name: 'Кафе «Гостиная»', address: 'Демо-адрес · Светлая, 8', point: 'Круглый стол на первом этаже', closes: '23:00', note: 'Спокойная музыка · вегетарианские блюда', symbol: '◉' },
    city: { name: 'Кофейня «Квартал»', address: 'Демо-адрес · Рыночная, 5', point: 'Внутри, справа от входа', closes: '21:00', note: 'Общий стол · кофе и десерты', symbol: '⌂' }
  };
  const events = [
    { id: 'coffee', title: 'Кофе без тяжёлых тем', intent: 'light', company: 'small', venue: 'garden', time: 'Сегодня · 19:00', duration: '60 минут', cost: 45, language: 'pl', age: '30–45', people: ['marta','denis','lena'], spots: 1, soon: false, walk: '12 мин пешком', tone: 'sage', agreement: 'Знакомимся и переключаемся после дня. Без романтики и непрошенных советов.' },
    { id: 'walk', title: 'Прогулка без спешки', intent: 'light', company: 'small', venue: 'park', time: 'Сегодня · через 40 минут', duration: '45 минут', cost: 0, language: 'pl', age: '30–45', people: ['anton','lena','anna'], spots: 1, soon: true, walk: '15 мин пешком', tone: 'sage', agreement: 'Лёгкий разговор на ходу. Не разбираем личные проблемы, даём друг другу время включиться.' },
    { id: 'quick-coffee', title: 'Кофе в свободный час', intent: 'light', company: 'small', venue: 'city', time: 'Сегодня · через 55 минут', duration: '45 минут', cost: 35, language: 'pl', age: '30–45', people: ['anna','denis','anton'], spots: 1, soon: true, walk: '8 мин пешком', tone: 'peach', agreement: 'Небольшая дружеская компания. Лёгкие темы, без флирта и обязательства продолжать.' },
    { id: 'deep', title: 'Разговор со смыслом', intent: 'deep', company: 'small', venue: 'studio', time: 'Завтра · 18:30', duration: '75 минут', cost: 40, language: 'pl', age: '30–45', people: ['marta','anton','anna'], spots: 1, soon: false, walk: '10 мин пешком', tone: 'blue', agreement: 'Делимся историями и слушаем по очереди. Можно пропустить любой вопрос. Советы — только по просьбе.' },
    { id: 'move', title: 'Немного движения вместе', intent: 'move', company: 'small', venue: 'park', time: 'Завтра · 18:00', duration: '50 минут', cost: 0, language: 'pl', age: '30–45', people: ['denis','lena','anton'], spots: 1, soon: false, walk: '15 мин пешком', tone: 'sage', agreement: 'Бодрая прогулка без спортивных результатов. Идём в комфортном для всех темпе.' },
    { id: 'celebrate', title: 'За маленькие победы', intent: 'celebrate', company: 'small', venue: 'studio', time: 'Завтра · 19:00', duration: '60 минут', cost: 50, language: 'pl', age: '30–45', people: ['anna','lena','denis'], spots: 1, soon: false, walk: '10 мин пешком', tone: 'peach', agreement: 'Есть чем поделиться? Отмечаем маленькие победы за десертом. Без алкоголя и сравнения достижений.' },
    { id: 'new-city', title: 'Новые люди в новом городе', intent: 'new', company: 'small', venue: 'city', time: 'Завтра · 17:00', duration: '60 минут', cost: 35, language: 'en', age: '30–45', people: ['anna','marta','anton'], spots: 1, soon: false, walk: '8 мин пешком', tone: 'sand', agreement: 'Делимся любимыми местами и знакомимся. Не нужно быть местным или свободно говорить по-польски.' },
    { id: 'coffee-en', title: 'Coffee & easy conversation', intent: 'light', company: 'small', venue: 'garden', time: 'Завтра · 19:00', duration: '60 минут', cost: 45, language: 'en', age: '30–45', people: ['marta','anna','lena'], spots: 1, soon: false, walk: '12 мин пешком', tone: 'sage', agreement: 'Лёгкий разговор на английском. Без романтического контекста и тяжёлых тем.' },
    { id: 'one-coffee', title: 'Кофе и знакомство вдвоём', intent: 'light', company: 'one', venue: 'garden', time: 'Завтра · 18:00', duration: '45 минут', cost: 45, language: 'pl', age: '30–45', people: ['denis'], spots: 1, soon: false, walk: '12 мин пешком', tone: 'peach', agreement: 'Дружеское знакомство за кофе. Можно закончить через 45 минут, без объяснений.' },
    { id: 'one-deep', title: 'Послушать друг друга', intent: 'deep', company: 'one', venue: 'studio', time: 'Завтра · 18:30', duration: '60 минут', cost: 40, language: 'pl', age: '30–45', people: ['anna'], spots: 1, soon: false, walk: '10 мин пешком', tone: 'blue', agreement: 'Оба готовы не только делиться, но и слушать. Без непрошенных советов. Это не психологическая помощь.' }
  ].map(e => ({ ...e, noAlcohol: true, public: true, platonic: true, noAdvice: true }));
  const intents = {
    light: ['Переключиться', 'Лёгкий разговор, без тяжёлых тем', '☀'],
    deep: ['Поговорить глубже', 'Делиться и внимательно слушать', '◌'],
    move: ['Размяться', 'Движение в комфортном темпе', '↗'],
    celebrate: ['Разделить радость', 'Отметить маленькую победу', '✧'],
    new: ['Освоиться в городе', 'Новые люди и любимые места', '⌂']
  };
  function initialState() {
    return { energy: 'medium', intent: 'light', company: 'small', when: 'planned', start: 'inperson',
      language: 'pl', age: '30–45', budget: 50, listen: false, boundaries: ['public','platonic','noAlcohol','noAdvice'],
      excludedVenues: [], blockedPeople: [], unavailable: [], acceptedAgeEventId: null,
      bookings: [], hold: null, waitlisted: false, repeat: null, astro: false, preferences: { quieter: false } };
  }
  function eventById(id) { return events.find(e => e.id === id); }
  function eligible(s, e, broadenAge = false) {
    return e && e.intent === s.intent && e.company === s.company && e.language === s.language && e.cost <= s.budget
      && (broadenAge || e.age === s.age)
      && (!s.preferences.quieter || ['garden','park'].includes(e.venue))
      && !s.excludedVenues.includes(e.venue) && !e.people.some(id => s.blockedPeople.includes(id))
      && s.boundaries.every(key => e[key]);
  }
  function recommend(s, { broadenAge = false, soonOnly = false } = {}) {
    return events.filter(e => eligible(s, e, broadenAge) && !s.unavailable.includes(e.id)
      && (soonOnly ? e.soon : (s.when === 'now' ? e.soon : !e.soon))
      && !s.bookings.some(b => b.eventId === e.id && ['confirmed','arrived','late'].includes(b.status)));
  }
  function holdSeat(s, id, now = Date.now()) {
    const e = eventById(id);
    if (!eligible(s, e, s.acceptedAgeEventId === id) || s.unavailable.includes(id)) return false;
    s.hold = { eventId: id, expiresAt: now + 120000 };
    return true;
  }
  function confirmBooking(s, id, now = Date.now()) {
    if (s.bookings.some(b => b.eventId === id && ['confirmed','arrived','late'].includes(b.status))) return true;
    const e = eventById(id);
    if (!eligible(s, e, s.acceptedAgeEventId === id) || s.unavailable.includes(id)) return false;
    if (e.intent === 'deep' && !s.listen) return false;
    if (e.soon && (!s.hold || s.hold.eventId !== id || s.hold.expiresAt <= now)) return false;
    s.bookings = s.bookings.filter(b => b.eventId !== id);
    s.bookings.push({ eventId: id, status: 'confirmed', feedback: {}, messages: [], repeatPeople: [], report: null });
    s.hold = null;
    return true;
  }
  function cancelBooking(s, id) {
    const booking = s.bookings.find(b => b.eventId === id);
    if (!booking || !['confirmed','late','arrived'].includes(booking.status)) return false;
    booking.status = 'cancelled';
    s.hold = null;
    return true;
  }
  function feedbackOutcome(f) {
    if (f.happened === 'Нет') return { kind: 'missing', title: 'Встреча не состоялась', text: 'Не считаем этот опыт успешным. Можно выбрать другую встречу без потери приоритета.' };
    if (f.safe && f.safe !== 'Да') return { kind: 'unsafe', title: 'Спасибо, что рассказал', text: 'Твоё ощущение безопасности важнее оценки встречи. Можно исключить участника и отдельно описать происшествие.' };
    if (f.need && f.need !== 'Да') return { kind: 'mismatch', title: 'Не совсем то, что нужно', text: 'Не будем записывать этот формат в любимые. Уточни, что стоит изменить в следующий раз.' };
    if (f.happened === 'Да' && f.safe === 'Да' && f.need === 'Да') return { kind: 'success', title: 'Хороший вечер — только начало', text: 'Этот формат тебе подошёл. Можно предложить следующую встречу тем, с кем хочется продолжить.' };
    return { kind: 'neutral', title: 'Без поспешных выводов', text: 'Ответов пока недостаточно, чтобы считать формат подходящим. Ты можешь вернуться к обратной связи позже.' };
  }
  const api = { people, venues, events, intents, initialState, eventById, eligible, recommend, holdSeat, confirmBooking, cancelBooking, feedbackOutcome };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ExperienceModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
