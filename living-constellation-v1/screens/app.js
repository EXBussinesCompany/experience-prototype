const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const guide = document.querySelector('.guide-panel');
const guideMarkup = guide.innerHTML;

const people = [
  { id: 'maja', name: 'Maja', note: 'spokojne tempo', tone: 'rose', verified: true },
  { id: 'olek', name: 'Olek', note: 'lekki humor', tone: 'blue', verified: false },
  { id: 'nina', name: 'Nina', note: 'nowe miejsca', tone: 'sand', verified: false }
];

const params = new URL(location.href).searchParams;
const initialDemo = params.get('demo') || 'new';
const initialResult = params.get('result') || 'pending';
const initialDecision = params.get('decision') || 'pending';
const state = {
  route: params.get('screen') || 'welcome',
  profileStep: Number(params.get('step')) || 1,
  formingStage: params.has('stage') ? Number(params.get('stage')) : 1,
  demoScenario: initialDemo,
  language: params.get('lang') === 'en' ? 'en' : 'pl',
  meetingLanguage: params.get('meetingLang') === 'en' ? 'en' : 'pl',
  demoOpen: false,
  paymentState: params.get('payment') || 'offer',
  attendance: Number(params.get('attendance')) || 4,
  followupResult: initialResult,
  circleDecision: initialDecision,
  accountEmpty: initialDemo === 'new',
  circleVote: initialDecision === 'rematch' ? 'rematch' : initialDecision === 'continue' || initialDecision === 'core' || initialDemo === 'returning' && initialResult !== 'pending' ? 'continue' : '',
  safetyContext: '',
  reportType: '',
  blockedPerson: '',
  adultConfirmed: false,
  readyNotification: false,
  arrived: false,
  promptOpen: false,
  followupReady: initialDemo === 'returning',
  choices: {},
  submitted: initialDemo === 'returning'
};

state.oneOff = OneOffFlow.create({
  language: () => state.language,
  navigate: route => go(route),
  refresh: preserveScroll => {
    const scrollTop = app.querySelector('.screen')?.scrollTop || 0;
    render();
    if (preserveScroll) app.querySelector('.screen')?.scrollTo(0, scrollTop);
  }
});

function avatar(person, modifier = '') {
  const tone = person?.tone || 'empty';
  const label = person?.name || 'Wolne miejsce';
  return `<span class="abstract-avatar avatar-${tone} ${modifier}" role="img" aria-label="${label}"><i></i><b></b></span>`;
}

function topbar(title = 'experience°', back = false, action = '') {
  return `<div class="topbar">${back ? `<button class="back" data-back aria-label="Wstecz">‹</button>` : `<span class="logo">${title}</span>`}${action ? `<button class="round-button" aria-label="Dodatkowe informacje">${action}</button>` : `<span></span>`}</div>`;
}

function navIcon(name) {
  const icons = {
    home: '<path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-4v6H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
    circle: '<circle cx="8" cy="9" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2.5 20c.4-4 2.3-6 5.5-6s5.1 2 5.5 6M14 14c4-.7 6.3 1.3 7 5"/>',
    plan: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17.5h3"/>',
    account: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.5-5 3-7.5 7.5-7.5s7 2.5 7.5 7.5"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
}

function nav(active = 'home') {
  return `<nav class="bottom-nav" aria-label="Główna nawigacja"><button data-route="home" class="${active === 'home' ? 'active' : ''}">${navIcon('home')}<span>Dzisiaj</span></button><button data-route="circle" class="${active === 'circle' ? 'active' : ''}">${navIcon('circle')}<span>Krąg</span></button><button data-route="plan" class="${active === 'plan' ? 'active' : ''}">${navIcon('plan')}<span>Plan</span></button><button data-route="account" class="${active === 'account' ? 'active' : ''}">${navIcon('account')}<span>Profil</span></button></nav>`;
}

const demoLabels = { new: 'NOWY UŻYTKOWNIK', ready: 'KRĄG GOTOWY', returning: 'PO SPOTKANIACH' };

function demoControls() {
  const paymentStates = [['offer','oferta'],['processing','w toku'],['declined','odrzucona'],['active','aktywna'],['cancelled','anulowana'],['expired','wygasła'],['restore','przywracanie']];
  const scenarios = [['new','Nowy użytkownik'],['ready','Krąg gotowy'],['returning','Po spotkaniach']];
  const results = [['pending','czekamy'],['none','brak'],['one','1 kontakt'],['multiple','kilka']];
  const circleDecisions = [['pending','czekamy'],['continue','krąg zostaje'],['core','3 osoby + 1'],['rematch','nowy krąg']];
  return `<div class="demo-layer"><button class="demo-trigger" data-action="toggle-demo" aria-expanded="${state.demoOpen}"><span>DEMO</span>${demoLabels[state.demoScenario]}</button>${state.demoOpen ? `<section class="demo-sheet" aria-label="Sterowanie prototypem"><div class="demo-sheet-head"><div><small>TYLKO PROTOTYP · NIE TRAFI DO APLIKACJI</small><h2>Wybierz sytuację</h2></div><button data-action="toggle-demo" aria-label="Zamknij">×</button></div><p>GŁÓWNA ŚCIEŻKA</p><div class="demo-grid">${scenarios.map(([key,label]) => `<button class="${state.demoScenario === key ? 'selected' : ''}" data-demo="${key}">${label}</button>`).join('')}</div><p>PŁATNOŚĆ</p><div class="demo-chips">${paymentStates.map(([key,label]) => `<button class="${state.paymentState === key ? 'selected' : ''}" data-payment="${key}">${label}</button>`).join('')}</div><p>FORMOWANIE KRĘGU</p><div class="demo-chips"><button class="${state.formingStage === 0 ? 'selected' : ''}" data-matching="0">brak kręgu</button><button class="${state.formingStage === 1 ? 'selected' : ''}" data-matching="1">1/6</button><button class="${state.formingStage === 2 ? 'selected' : ''}" data-matching="2">2/6</button><button class="${state.formingStage === 3 ? 'selected' : ''}" data-matching="3">gotowy</button></div><p>OBECNOŚĆ</p><div class="demo-chips">${[1,2,3,4,6].map(value => `<button class="${state.attendance === value ? 'selected' : ''}" data-attendance="${value}">${value}${value === 4 ? '+' : ''}</button>`).join('')}</div><p>WYNIK PO SPOTKANIU</p><div class="demo-chips">${results.map(([key,label]) => `<button class="${state.followupResult === key ? 'selected' : ''}" data-result="${key}">${label}</button>`).join('')}</div><p>DECYZJA KRĘGU</p><div class="demo-chips">${circleDecisions.map(([key,label]) => `<button class="${state.circleDecision === key ? 'selected' : ''}" data-decision="${key}">${label}</button>`).join('')}</div></section>` : ''}</div>`;
}

const translations = {
  'Jednorazowe spotkanie': 'One-off meeting',
  'kolacja, kawa lub spacer': 'dinner, coffee or a walk',
  "NOWY UŻYTKOWNIK": "NEW USER",
  "KRĄG GOTOWY": "CIRCLE READY",
  "PO SPOTKANIACH": "AFTER MEETINGS",
  "TYLKO PROTOTYP · NIE TRAFI DO APLIKACJI": "PROTOTYPE ONLY · NOT PART OF THE APP",
  "Wybierz sytuację": "Choose a scenario",
  "GŁÓWNA ŚCIEŻKA": "MAIN JOURNEY",
  "PŁATNOŚĆ": "PAYMENT",
  "FORMOWANIE KRĘGU": "CIRCLE FORMATION",
  "OBECNOŚĆ": "ATTENDANCE",
  "WYNIK PO SPOTKANIU": "POST-MEETING RESULT",
  "DECYZJA KRĘGU": "CIRCLE DECISION",
  "nowy krąg": "new circle",
  "krąg zostaje": "circle stays",
  "3 osoby + 1": "3 people + 1",
  "Potem —": "Then —",
  "Twój krąg.": "your circle.",
  "Rdzeń kręgu": "The circle core",
  "Ten krąg": "This circle",
  "zostaje razem.": "stays together.",
  "Trzy osoby chcą kontynuować. Szukamy jednej nowej osoby, ale nie ujawniamy, kto ani dlaczego odszedł.": "Three people want to continue. We are looking for one new person without revealing who left or why.",
  "Większość chce kontynuować i są co najmniej cztery osoby. Nie dodajemy nikogo automatycznie do sześciu.": "The majority wants to continue and at least four people remain. We do not automatically fill the circle to six.",
  "Pokazujemy tylko stan kręgu. Indywidualne odpowiedzi i powody pozostają ukryte.": "We show only the circle status. Individual answers and reasons stay private.",
  "Szukamy jednej osoby.": "We are looking for one person.",
  "Możecie planować kolejne spotkanie.": "You can plan the next meeting.",
  "3 osoby · minimum 4 do spotkania": "3 people · at least 4 for a meeting",
  "Skład pozostaje bez zmian": "The group stays unchanged",
  "Następne spotkanie potwierdzimy dopiero, gdy nowa osoba przyjmie zaproszenie.": "We will confirm the next meeting only after a new person accepts the invitation.",
  "Nowe osoby pojawią się tylko wtedy, gdy skład spadnie poniżej czterech.": "New people are added only if the circle falls below four.",
  "Jeśli nie znajdziemy zastępstwa do terminu, w tym tygodniu nie będzie spotkania, ale rdzeń kręgu pozostanie.": "If no replacement is found by the deadline, there is no meeting that week, but the circle core stays together.",
  "Każdy nadal może prywatnie wyjść i otrzymać nowy dobór.": "Anyone can still leave privately and receive a new match.",
  "Przejdź do kręgu": "Open the circle",
  "Najpierw Ty.": "You first.",
  "Potem — Twój krąg.": "Then — your circle.",
  "Ludzie pojawiają się stopniowo i dopiero po przyjęciu zaproszenia. Abstrakcyjne awatary nie tworzą fałszywych oczekiwań wobec wyglądu.": "People appear gradually and only after accepting an invitation. Abstract avatars do not create false expectations about appearance.",
  "Pierwsze wejście": "First launch",
  "obietnica bez obcych osób": "a promise without invented people",
  "Ustawienia": "Setup",
  "miasto, język i dostępność": "city, language, and availability",
  "Subskrypcja": "Membership",
  "59 PLN bez fałszywej gwarancji": "PLN 59 without a false guarantee",
  "Ten tydzień": "This week",
  "nie nastrój na zawsze": "not a permanent mood",
  "Tworzymy krąg": "Forming the circle",
  "ludzie pojawiają się stopniowo": "people appear gradually",
  "Strona główna": "Home",
  "Księżyc dziś i potwierdzony plan": "Today's moon and a confirmed plan",
  "Twój krąg": "Your circle",
  "potwierdzeni uczestnicy": "confirmed participants",
  "miejsce, budżet i szczegóły": "venue, budget, and details",
  "Spotkanie": "Meeting",
  "telefon można odłożyć": "the phone can stay away",
  "Po spotkaniu": "After",
  "w domu, bez presji grupy": "at home, without group pressure",
  "Profil": "Profile",
  "ustawienia i historia spotkań": "settings and meeting history",
  "Bezpieczeństwo": "Safety",
  "wyjście, zgłoszenie, blokada, 112": "leave, report, block, 112",
  "Najważniejsza zasada": "Main rule",
  "Bez jaskrawych neonów, nieznanych twarzy i astrologicznych zakazów.": "No harsh neon, unknown faces, or astrological prohibitions.",
  "Ekrany prototypu": "Prototype screens",
  "Mobilny prototyp Experience": "Experience mobile prototype",
  "Klikalny prototyp · dane są fikcyjne": "Clickable prototype · fictional data",
  "Nowy użytkownik": "New user",
  "Krąg gotowy": "Circle ready",
  "Po spotkaniach": "After meetings",
  "oferta": "offer",
  "w toku": "processing",
  "odrzucona": "declined",
  "aktywna": "active",
  "anulowana": "cancelled",
  "wygasła": "expired",
  "przywracanie": "restoring",
  "brak kręgu": "no circle",
  "gotowy": "ready",
  "czekamy": "waiting",
  "brak": "none",
  "1 kontakt": "1 contact",
  "kilka": "multiple",
  "Dzisiaj": "Today",
  "Krąg": "Circle",
  "Plan": "Plan",
  "Profil": "Profile",
  "Wstecz": "Back",
  "Główna nawigacja": "Main navigation",
  "Powiadomienia": "Notifications",
  "Dodatkowe informacje": "More information",
  "Ustawienia": "Settings",
  "NIE MUSISZ SZUKAĆ SAM": "YOU DO NOT HAVE TO SEARCH ALONE",
  "Co tydzień": "Every week",
  "szukamy planu.": "we look for a plan.",
  "Łączymy osoby o wspólnym terminie i rytmie. Gdy minimum cztery potwierdzą — dostajesz gotowe miejsce i plan.": "We connect people with a shared time and pace. When at least four confirm, you receive a ready venue and plan.",
  "Zaczynam": "Get started",
  "Jak działa Experience?": "How does Experience work?",
  "PODSTAWY": "BASICS",
  "Gdzie ma zacząć się": "Where should",
  "Twój krąg?": "your circle begin?",
  "Pilot działa na razie tylko w Warszawie. Wszyscy w kręgu wybierają ten sam język.": "The pilot currently runs only in Warsaw. Everyone in a circle chooses the same language.",
  "MIASTO": "CITY",
  "Warszawa": "Warsaw",
  "JĘZYK SPOTKANIA": "MEETING LANGUAGE",
  "Polski": "Polish",
  "Swobodna rozmowa": "Comfortable conversation",
  "Dalej": "Continue",
  "PRAKTYCZNY RYTM": "PRACTICAL RHYTHM",
  "Kiedy realnie masz": "When are you actually",
  "czas na spotkanie?": "free to meet?",
  "Tylko ustawienia organizacyjne. Przed każdym nowym kręgiem możesz je zmienić.": "These are only practical settings. You can change them before every new circle.",
  "PASUJĄCE TERMINY": "AVAILABLE TIMES",
  "MOŻESZ WYBRAĆ KILKA": "CHOOSE MORE THAN ONE",
  "Poniedziałek–czwartek": "Monday–Thursday",
  "Piątek": "Friday",
  "Weekend": "Weekend",
  "Wieczorem, po 18:00": "Evening, after 6 PM",
  "W ciągu dnia lub wieczorem": "Daytime or evening",
  "Nie pytamy, „jakim jesteś człowiekiem”. Interesuje nas tylko termin, w którym naprawdę możesz przyjść.": "We do not ask what kind of person you are. We only need times when you can really attend.",
  "KOSMICZNA WARSTWA": "COSMIC LAYER",
  "Dodaj kontekst.": "Add context.",
  "Nie wyrok.": "Not a verdict.",
  "Data urodzenia pomaga tworzyć codzienne podpowiedzi i tematy dla kręgu. Nigdy nie blokuje spotkań ani decyzji.": "Your birth date helps shape daily prompts and circle topics. It never blocks meetings or decisions.",
  "DATA URODZENIA": "DATE OF BIRTH",
  "MIEJSCE URODZENIA": "PLACE OF BIRTH",
  "GODZINA": "TIME",
  "OPCJONALNIE": "OPTIONAL",
  "Mińsk, Białoruś": "Minsk, Belarus",
  "Nie znam dokładnej godziny": "I do not know the exact time",
  "Potwierdzam, że mam co najmniej 18 lat": "I confirm that I am at least 18",
  "Zobacz, co otrzymasz": "See what you get",
  "EXPERIENCE PREMIUM": "EXPERIENCE PREMIUM",
  "Nie kupujesz wejścia.": "You are not buying a ticket.",
  "Kupujesz ciągłość.": "You are buying continuity.",
  "/ MIESIĄC": "/ MONTH",
  "Pełny codzienny nawigator": "Full daily navigator",
  "Dostępny od razu po aktywacji": "Available immediately after activation",
  "Priorytetowy dobór co tydzień": "Priority matching every week",
  "Szukamy osób z pasującym terminem i rytmem": "We look for people with a matching time and pace",
  "Szybsza zwykła obsługa": "Faster standard support",
  "Pilne zgłoszenia bezpieczeństwa zawsze mają ten sam priorytet": "Urgent safety reports always have the same priority",
  "Spotkanie nie jest gwarantowane": "A meeting is not guaranteed",
  "Premium pozostaje aktywne także wtedy, gdy w danym tygodniu nie zbierze się wystarczająca grupa.": "Premium remains active even when not enough people form a group that week.",
  "Weryfikacja jest opcjonalna": "Verification is optional",
  "Telefon lub selfie możesz dodać później. Nie blokujemy dostępu do kręgu.": "You can add a phone number or selfie later. Verification does not block circle access.",
  "Aktywuj Premium za 59 PLN": "Activate Premium for PLN 59",
  "Przywróć zakup": "Restore purchase",
  "Miesięczne odnowienie · anulowanie w dowolnym momencie · prototyp": "Monthly renewal · cancel anytime · prototype",
  "PŁATNOŚĆ W TOKU": "PAYMENT PROCESSING",
  "Potwierdzamy aktywację": "Confirming activation",
  "To zwykle trwa chwilę. Nie pobieramy opłaty ponownie.": "This usually takes a moment. We will not charge you again.",
  "Sprawdź ponownie": "Check again",
  "PŁATNOŚĆ ODRZUCONA": "PAYMENT DECLINED",
  "Nie udało się aktywować": "Activation failed",
  "Subskrypcja nie została uruchomiona. Możesz bezpiecznie spróbować ponownie.": "The subscription was not activated. You can safely try again.",
  "Spróbuj ponownie": "Try again",
  "PREMIUM AKTYWNE": "PREMIUM ACTIVE",
  "Dobór działa co tydzień": "Matching runs every week",
  "Masz priorytet doboru, pełny nawigator i szybszą zwykłą obsługę.": "You have priority matching, the full navigator, and faster standard support.",
  "Przejdź do aplikacji": "Open the app",
  "ANULOWANO ODNOWIENIE": "RENEWAL CANCELLED",
  "Dostęp do 30 września": "Access until September 30",
  "Premium działa do końca opłaconego okresu i nie odnowi się automatycznie.": "Premium works until the paid period ends and will not renew automatically.",
  "Włącz odnowienie": "Turn renewal on",
  "PREMIUM WYGASŁO": "PREMIUM EXPIRED",
  "Dobór został zatrzymany": "Matching is paused",
  "Historia i profil zostają. Aktywuj Premium, aby wrócić do cotygodniowych rund.": "Your history and profile remain. Activate Premium to return to weekly matching rounds.",
  "Aktywuj ponownie": "Reactivate",
  "PRZYWRACANIE ZAKUPU": "RESTORING PURCHASE",
  "Szukamy poprzedniej subskrypcji": "Looking for a previous subscription",
  "Sprawdzimy zakupy przypisane do Twojego konta sklepu.": "We will check purchases linked to your store account.",
  "Przywróć wcześniejszy zakup": "Restore a previous purchase",
  "miesięcznie · bez gwarancji spotkania": "monthly · meeting not guaranteed",
  "TYLKO NA TEN TYDZIEŃ": "ONLY FOR THIS WEEK",
  "Który wieczór brzmi": "Which kind of evening feels",
  "teraz dobrze?": "right this week?",
  "To nie trafia do profilu. Wybierz jeden lub dwa scenariusze dla najbliższego spotkania.": "This does not become part of your profile. Choose one or two scenarios for the next meeting.",
  "Usiąść i naprawdę pogadać": "Sit down and really talk",
  "Spokojne miejsce, w którym słychać rozmowę": "A calm place where everyone can hear one another",
  "Zrobić coś razem": "Do something together",
  "Gra, mały warsztat albo lekka aktywność": "A game, small workshop, or light activity",
  "Odkryć nowe miejsce": "Discover a new place",
  "Inna część Warszawy i gotowy punkt spotkania": "A different part of Warsaw and a clear meeting point",
  "Za tydzień możesz wybrać inaczej": "You can choose differently next week",
  "Dzisiejszy nastrój nie staje się etykietą ani stałą cechą profilu.": "How you feel today does not become a label or a permanent profile trait.",
  "Zapisz i wejdź do aplikacji": "Save and enter the app",
  "Nie mam preferencji": "I have no preference",
  "DZISIAJ / WARSZAWA": "TODAY / WARSAW",
  "Aplikacja już działa.": "The app already works.",
  "Krąg powstaje w tle.": "Your circle forms in the background.",
  "Twoja orbita": "Your orbit",
  "jest w ruchu.": "is in motion.",
  "Codzienna podpowiedź jest dostępna od razu. Nie musisz czekać, aż zbierze się grupa.": "Your daily guidance is available immediately. You do not have to wait for a group to form.",
  "Nie musisz czekać na idealny moment. Plan na ten tydzień jest już potwierdzony.": "You do not have to wait for the perfect moment. This week's plan is confirmed.",
  "KSIĘŻYC DZISIAJ · NÓW": "MOON TODAY · NEW MOON",
  "Mały pierwszy krok": "One small first step",
  "Nie blokuje planów ani spotkań": "It never blocks plans or meetings",
  "KRĄG NA TEN TYDZIEŃ": "THIS WEEK'S CIRCLE",
  "DOBÓR TRWA": "MATCHING IN PROGRESS",
  "RUNDA ZAKOŃCZONA": "ROUND ENDED",
  "Tym razem bez planu": "No plan this time",
  "Nie znaleźliśmy wystarczającej liczby pasujących osób. Premium działa dalej, a nowa runda zacznie się w poniedziałek.": "We did not find enough compatible people. Premium continues and a new round starts Monday.",
  "Szukamy osób z pasującym terminem, językiem i spokojnym rytmem spotkania.": "We are looking for people with a matching time, language, and comfortable meeting pace.",
  "Zobacz następną rundę": "View the next round",
  "Zobacz status kręgu": "View circle status",
  "TWÓJ WYBÓR NA TEN TYDZIEŃ": "YOUR CHOICE FOR THIS WEEK",
  "Zmień": "Change",
  "Spokojna rozmowa · nowe miejsce": "Calm conversation · new place",
  "Pon–czw wieczorem lub weekend": "Mon–Thu evening or weekend",
  "Co możesz zrobić dziś.": "What you can do today.",
  "Bez czekania na krąg.": "Without waiting for your circle.",
  "Zacznij od małego kroku z dzisiejszej podpowiedzi. Dobór ludzi nie blokuje reszty aplikacji.": "Start with one small step from today's guidance. Matching never blocks the rest of the app.",
  "NAJBLIŻSZY KROK": "NEXT STEP",
  "Dobór działa w tle": "Matching runs in the background",
  "Damy znać, gdy pojawi się zmiana. Postęp i osoby znajdziesz w zakładce Krąg.": "We will let you know when something changes. Progress and people live in the Circle tab.",
  "Otwórz krąg": "Open Circle",
  "Nowa runda w poniedziałek": "A new round starts Monday",
  "Do tego czasu codzienna podpowiedź pozostaje dostępna.": "Your daily guidance remains available until then.",
  "SPOTKANIE W TYM TYGODNIU": "MEETING THIS WEEK",
  "Czwartek · 19:00": "Thursday · 7:00 PM",
  "Plan jest gotowy. Sprawdź miejsce, budżet i dojazd.": "The plan is ready. Check the venue, budget, and route.",
  "Otwórz plan": "Open Plan",
  "KALENDARZ KSIĘŻYCOWY · DZISIAJ": "LUNAR CALENDAR · TODAY",
  "Księżyc opisuje tło.": "The Moon describes the backdrop.",
  "Ty wybierasz ruch.": "You choose your move.",
  "11 WRZEŚNIA · WARSZAWA": "SEPTEMBER 11 · WARSAW",
  "Nów": "New Moon",
  "Dokładna faza: 05:27": "Exact phase: 05:27",
  "Fakt astronomiczny": "Astronomical fact",
  "Faza i czas pochodzą z danych astronomicznych. Znaczenie poniżej jest interpretacją, nie prognozą.": "The phase and time come from astronomical data. The meaning below is interpretation, not a forecast.",
  "PERSPEKTYWA NA DZIŚ": "TODAY'S PERSPECTIVE",
  "Zacznij od czegoś małego, co naprawdę możesz kontynuować.": "Start with something small you can realistically continue.",
  "Kontakt": "Connection",
  "Napisz pierwszy, bez układania idealnej wiadomości.": "Send the first message without crafting the perfect text.",
  "Nowe doświadczenie": "New experience",
  "Wybierz jeden konkretny krok zamiast wielkiego planu.": "Choose one concrete step instead of a grand plan.",
  "Masz już plan? Idź.": "Already have a plan? Go.",
  "Żaden dzień księżycowy nie odwołuje spotkań i nie każe czekać.": "No lunar day cancels meetings or tells you to wait.",
  "Wróć do dzisiejszego planu": "Return to today's plan",
  "KRĄG / TEN TYDZIEŃ": "CIRCLE / THIS WEEK",
  "Szukamy ludzi": "We are looking for people",
  "w Twoim rytmie.": "who match your pace.",
  "Możesz korzystać z całej aplikacji. Tutaj zobaczysz wyłącznie osoby, które naprawdę przyjęły zaproszenie.": "You can use the whole app. Here you will only see people who have actually accepted the invitation.",
  "MINIMUM 4, ABY POWSTAŁ PLAN": "AT LEAST 4 TO CREATE A PLAN",
  "Powiadom mnie, gdy plan będzie gotowy": "Notify me when the plan is ready",
  "✓ Powiadomienie włączone": "✓ Notification enabled",
  "Zmień wybór na ten tydzień": "Change this week's choice",
  "Nie musisz zostawać na tym ekranie. Dobór aktualizuje się w tle.": "You do not need to stay on this screen. Matching updates in the background.",
  "TYLKO PROTOTYP · ZOSTANIE USUNIĘTE": "PROTOTYPE ONLY · WILL BE REMOVED",
  "Symuluj kolejny etap": "Simulate the next stage",
  "KRĄG / RUNDA ZAKOŃCZONA": "CIRCLE / ROUND ENDED",
  "Nie zebraliśmy": "We did not form",
  "grupy na ten tydzień.": "a group this week.",
  "To nie jest Twoja wina i nie musisz nic robić. W poniedziałek automatycznie zaczniemy nową rundę.": "This is not your fault and you do not need to do anything. A new round starts automatically on Monday.",
  "NASTĘPNA RUNDA": "NEXT ROUND",
  "Poniedziałek · 09:00": "Monday · 9:00 AM",
  "Zachowamy miasto, język i dostępność. Przed startem możesz zmienić wybór na kolejny tydzień.": "We will keep your city, language, and availability. You can change next week's choice before the round starts.",
  "Zmień wybór": "Change choice",
  "TWÓJ KRĄG / CYKL 01": "YOUR CIRCLE / CYCLE 01",
  "Wspólny termin.": "A shared time.",
  "Dobry rytm.": "A comfortable pace.",
  "Widzisz osoby, które przyjęły to samo zaproszenie. Szczegóły doboru pozostają po stronie Experience.": "You see people who accepted the same invitation. Experience keeps the matching details private.",
  "PLAN POTWIERDZONY": "PLAN CONFIRMED",
  "Krąg 04": "Circle 04",
  "Ty i trzy osoby potwierdziliście. Dwa miejsca nadal uzupełniamy.": "You and three others confirmed. We are still filling two places.",
  "potwierdzone": "confirmed",
  "Wolne miejsce": "Open place",
  "Szukamy osoby w tym samym rytmie": "Looking for someone with the same pace",
  "DLACZEGO WY?": "WHY THIS GROUP?",
  "Łączy Was spokojne wejście w rozmowę, potrzeba regularnego kontaktu i gotowość do nowych miejsc. Kosmiczna warstwa tylko podpowiada temat do refleksji.": "You share a calm way into conversation, a need for regular connection, and openness to new places. The cosmic layer only offers a theme for reflection.",
  "Zobacz plan": "View plan",
  "PLAN / TEN TYDZIEŃ": "PLAN / THIS WEEK",
  "W tej rundzie": "In this round",
  "nie powstał plan.": "no plan was formed.",
  "Miejsce pojawi się,": "The venue appears",
  "gdy będziecie gotowi.": "when the group is ready.",
  "Nowa runda rozpocznie się automatycznie w poniedziałek.": "A new round starts automatically on Monday.",
  "Nie pokazujemy przypadkowej kawiarni ani terminu. Najpierw minimum cztery osoby muszą przyjąć to samo zaproszenie.": "We do not show a random café or time. At least four people must first accept the same invitation.",
  "AKTUALNY STATUS": "CURRENT STATUS",
  "Runda zakończona": "Round ended",
  "Tylko Ty": "Only you",
  "Nie pobieramy dodatkowej opłaty i niczego nie obiecujemy na siłę. Premium obejmuje kolejną cotygodniową rundę.": "We do not charge extra or force promises. Premium includes the next weekly round.",
  "Rozpoczęliśmy dobór. Damy znać, gdy ktoś przyjmie zaproszenie.": "Matching has started. We will let you know when someone accepts.",
  "Krąg rośnie. Szczegóły miejsca odblokują się dopiero po czwartym potwierdzeniu.": "The circle is growing. Venue details unlock after the fourth confirmation.",
  "Tu pojawi się": "This is where your",
  "potwierdzone spotkanie.": "confirmed meeting appears.",
  "W tym tygodniu": "This week",
  "nie ma spotkania.": "there is no meeting.",
  "Bez wymyślonego miejsca i terminu. Pokażemy je dopiero, gdy plan naprawdę będzie gotowy.": "No invented venue or date. We will show them only when the plan is truly ready.",
  "Plan nie powstał w tej rundzie. Nowa rozpocznie się automatycznie w poniedziałek.": "No plan was formed in this round. A new one starts automatically on Monday.",
  "NAJBLIŻSZA AKTUALIZACJA": "NEXT UPDATE",
  "Powiadomienie o gotowym planie": "Ready-plan notification",
  "Wyślemy je od razu po potwierdzeniu miejsca i terminu. Szczegóły doboru są w zakładce Krąg.": "We will send it as soon as the venue and time are confirmed. Matching details are in the Circle tab.",
  "Nowa runda · poniedziałek 09:00": "New round · Monday 9:00 AM",
  "Premium działa dalej. Nie musisz nic robić, aby wejść do kolejnej cotygodniowej rundy.": "Premium continues. You do not need to do anything to enter the next weekly round.",
  "Przejdź do kręgu": "Open the circle",
  "USTAWIENIA TEGO TYGODNIA": "THIS WEEK'S SETTINGS",
  "Centrum bezpieczeństwa": "Safety center",
  "SPOTKANIE 01 / 03": "MEETING 01 / 03",
  "Wasz pierwszy": "Your first",
  "wieczór.": "evening.",
  "Czwartek, 19:00 · stolik czeka przez 15 minut": "Thursday, 7:00 PM · the table is held for 15 minutes",
  "STUDIO LAS · MOKOTÓW": "STUDIO LAS · MOKOTÓW",
  "Studio Las": "Studio Las",
  "ul. Puławska 24 · stolik Experience": "24 Puławska St · Experience table",
  "Czwartek · 19:00": "Thursday · 7:00 PM",
  "około 90 minut": "about 90 minutes",
  "Płatność na miejscu": "Pay at the venue",
  "napój lub mała przekąska": "a drink or small snack",
  "Język spotkania": "Meeting language",
  "wszyscy wybrali ten sam": "everyone chose the same",
  "POLSKI": "POLISH",
  "Ty + 3 osoby potwierdziły": "You + 3 people confirmed",
  "Jestem na miejscu": "I am here",
  "✓ Jestem na miejscu": "✓ I am here",
  "Spóźnię się": "I will be late",
  "Nie mogę przyjść": "I cannot attend",
  "Bezpłatna rezygnacja do środy, 19:00.": "Free cancellation until Wednesday, 7:00 PM.",
  "JESTEŚ NA MIEJSCU": "YOU ARE AT THE VENUE",
  "Teraz po prostu": "Now simply",
  "bądźcie razem.": "be together.",
  "Experience nie prowadzi spotkania i nie wymaga patrzenia w telefon.": "Experience does not lead the meeting or require anyone to look at a phone.",
  "Na miejscu jesteś tylko Ty.": "You are the only person here.",
  "Na miejscu są dwie osoby.": "Two people are here.",
  "Spotkanie może odbyć się w mniejszym składzie.": "The meeting can continue with a smaller group.",
  "Krąg jest gotowy, ale nikt nie musi zostawać.": "The circle is ready, but nobody has to stay.",
  "Nie musisz czekać ani zostawać.": "You do not have to wait or stay.",
  "Możesz bezpiecznie wyjść, zgłosić problem albo zdecydować razem, czy chcecie zostać.": "You can leave safely, report a problem, or decide together whether to stay.",
  "Gdy rozmowa na chwilę stanie.": "When the conversation pauses.",
  "Możesz pokazać grupie jedno lekkie pytanie. Bez rund, timerów i obowiązkowej kolejności.": "You can show one light question to the group. No rounds, timers, or required order.",
  "Pokaż jedno pytanie": "Show one question",
  "Ukryj pytanie": "Hide question",
  "PYTANIE NA START": "OPENING QUESTION",
  "Co ostatnio pozytywnie Cię zaskoczyło?": "What surprised you in a good way recently?",
  "Każdy może odpowiedzieć albo powiedzieć „pass”.": "Anyone can answer or say “pass.”",
  "Szczegóły miejsca": "Venue details",
  "Pomoc i bezpieczeństwo": "Help and safety",
  "Zakończ spotkanie": "End meeting",
  "Dopiero jutro, już prywatnie, zdecydujesz o kontaktach i przyszłości kręgu.": "Tomorrow, in private, you will decide about contacts and the future of the circle.",
  "NA DZIŚ WYSTARCZY": "THAT IS ENOUGH FOR TODAY",
  "Nic nie musisz": "You do not have to",
  "wybierać przy stole.": "choose at the table.",
  "Wróć spokojnie do domu. Jutro przypomnimy o prywatnym podsumowaniu — nikt z grupy nie zobaczy Twoich odpowiedzi.": "Head home without pressure. Tomorrow we will remind you about the private follow-up. Nobody in the group will see your answers.",
  "JUTRO · 12:00": "TOMORROW · 12:00",
  "Kontakty i przyszłość kręgu": "Contacts and the circle's future",
  "Odpowiesz sam, bez obecności grupy i bez presji chwili.": "You will answer privately, away from the group and the pressure of the moment.",
  "Pokaż późniejszy ekran w prototypie": "Show the later screen in the prototype",
  "Wróć na główną": "Return home",
  "NASTĘPNEGO DNIA · PRYWATNIE": "NEXT DAY · PRIVATE",
  "Co chcesz": "What do you want to",
  "zabrać dalej?": "carry forward?",
  "Nikt nie zobaczy odrzuceń ani rodzaju wyboru bez wzajemności.": "Nobody will see rejections or the type of choice unless it is mutual.",
  "Jak chcesz kontynuować?": "How would you like to continue?",
  "Koleżeńsko": "As friends",
  "Romantycznie": "Romantically",
  "Nie teraz": "Not now",
  "PRZYSZŁOŚĆ KRĘGU": "THE CIRCLE'S FUTURE",
  "Co powinno wydarzyć się dalej?": "What should happen next?",
  "Głosy są ukryte. Jeśli większość głosujących wybierze nowy krąg, dobierzemy wszystkich ponownie.": "Votes are hidden. If most voters choose a new circle, everyone will be matched again.",
  "Spotkajmy się ponownie": "Meet again",
  "Krąg może żyć dalej, a wolne miejsca uzupełnimy": "The circle can continue and we will fill open places",
  "Chcę nowy krąg": "I want a new circle",
  "Rozpocznij dla mnie nowy dobór": "Start a new match for me",
  "Kontakty i głos o kręgu są prywatne. Blokada zawsze działa niezależnie od tego głosowania.": "Contacts and your circle vote are private. Blocking always works independently of this vote.",
  "Zapisz prywatnie": "Save privately",
  "WYBÓR ZAPISANY": "CHOICE SAVED",
  "Odpowiedzi zostają prywatne.": "Answers remain private.",
  "Pokazujemy tylko wzajemne kontakty i zbiorczą decyzję kręgu.": "We only show mutual contacts and the circle's collective decision.",
  "ODPOWIEDZI W TOKU": "RESPONSES PENDING",
  "Jeszcze czekamy na innych": "Still waiting for others",
  "Nie pokazujemy częściowych wyborów. Damy znać tylko o wzajemnych kontaktach.": "We do not show partial choices. We will only notify you about mutual contacts.",
  "PODSUMOWANIE GOTOWE": "SUMMARY READY",
  "Tym razem bez wzajemnego kontaktu": "No mutual contact this time",
  "To normalny wynik, nie ocena spotkania.": "This is a normal result, not a rating of the meeting.",
  "Otwórz czat w Experience": "Open chat in Experience",
  "Numer telefonu pozostaje prywatny.": "The phone number stays private.",
  "Wróć na orbitę": "Return to your orbit",
  "Ten krąg": "This circle",
  "kończy się tutaj.": "ends here.",
  "Zaczynamy nowy dobór.": "We are starting a new match.",
  "Większość wybrała nowy krąg. Nie pokazujemy, kto ani jak głosował.": "The majority chose a new circle. We do not show who voted or how.",
  "PRYWATNOŚĆ GŁOSOWANIA": "VOTING PRIVACY",
  "Pokazujemy wyłącznie wspólną decyzję. Indywidualne odpowiedzi pozostają ukryte.": "We only show the collective decision. Individual answers remain hidden.",
  "CO DALEJ": "WHAT HAPPENS NEXT",
  "Zachowamy miasto, język i dostępność. Przed startem możesz zmienić wybór na kolejny tydzień.": "We will keep your city, language, and availability. You can change next week's choice before the round starts.",
  "Nie musisz nic robić. Zakończone spotkanie pozostanie w historii.": "You do not need to do anything. The completed meeting will remain in your history.",
  "Przejdź do nowego kręgu": "Open the new circle",
  "TWÓJ PROFIL": "YOUR PROFILE",
  "Warszawa · Polski": "Warsaw · Polish",
  "PREMIUM": "PREMIUM",
  "Nieaktywna": "Inactive",
  "W toku": "Processing",
  "Odrzucona": "Declined",
  "Aktywna": "Active",
  "Anulowana": "Cancelled",
  "Wygasła": "Expired",
  "Przywracanie": "Restoring",
  "59 PLN / miesiąc": "PLN 59 / month",
  "TWOJE USTAWIENIA": "YOUR SETTINGS",
  "Dobór i dostępność": "Matching and availability",
  "Edytuj": "Edit",
  "Miasto": "City",
  "Język": "Language",
  "Terminy": "Times",
  "Pon–czw + weekend": "Mon–Thu + weekend",
  "HISTORIA": "HISTORY",
  "Poprzednie spotkania": "Previous meetings",
  "Tu pojawią się Twoje spotkania": "Your meetings will appear here",
  "Historia jest teraz pusta. Nie pokazujemy przykładowych ludzi ani wydarzeń jako prawdziwych danych.": "Your history is empty. We do not present sample people or events as real data.",
  "Wzajemne kontakty": "Mutual contacts",
  "Jeszcze nikogo": "No one yet",
  "2 osoby": "2 people",
  "Prywatność i weryfikacja": "Privacy and verification",
  "Weryfikacja opcjonalna": "Verification optional",
  "Bezpieczeństwo": "Safety",
  "Zgłoszenia, blokady i pomoc": "Reports, blocks, and help",
  "HISTORIA / 05 WRZEŚNIA": "HISTORY / SEPTEMBER 5",
  "Krąg 03": "Circle 03",
  "Piątek · 19:00 · Mokotów · 5 osób": "Friday · 7:00 PM · Mokotów · 5 people",
  "SPOTKANIE ZAKOŃCZONE": "MEETING COMPLETED",
  "Twój prywatny zapis": "Your private record",
  "Wybrałeś kontakt koleżeński z Mają. Krąg spotkał się ponownie w ciągu 14 dni.": "You chose a friendship connection with Maja. The circle met again within 14 days.",
  "Czat z Mają": "Chat with Maja",
  "Wzajemny kontakt · w Experience": "Mutual contact · in Experience",
  "Zgłoś problem z tym spotkaniem": "Report a problem with this meeting",
  "CENTRUM BEZPIECZEŃSTWA": "SAFETY CENTER",
  "Pomoc w dowolnym momencie.": "Help at any time.",
  "Pomoc przed spotkaniem.": "Help before the meeting.",
  "Pomoc podczas spotkania.": "Help during the meeting.",
  "Pomoc po spotkaniu.": "Help after the meeting.",
  "Ty decydujesz.": "You decide.",
  "Pilne zgłoszenia mają ten sam priorytet dla wszystkich — niezależnie od Premium.": "Urgent safety reports have the same priority for everyone, regardless of Premium.",
  "Bezpośrednie zagrożenie": "Immediate danger",
  "Zadzwoń pod numer alarmowy": "Call the emergency number",
  "Opuść spotkanie": "Leave the meeting",
  "Nie musisz podawać powodu grupie": "You do not need to give the group a reason",
  "Zgłoś osobę": "Report a person",
  "Zgłoszenie pozostaje prywatne": "The report remains private",
  "Problem z miejscem": "Venue problem",
  "Zamknięte, niebezpieczne lub brak rezerwacji": "Closed, unsafe, or no reservation",
  "Zablokuj osobę": "Block a person",
  "Bez powiadomienia i przyszłych dopasowań": "No notification and no future matching",
  "Co dzieje się po zgłoszeniu?": "What happens after a report?",
  "Oddzielamy zgłoszenie od blokady. Możesz zrobić jedno, oba albo żadne. Zapiszemy kontekst i pokażemy status sprawy.": "Reporting and blocking are separate. You can do either, both, or neither. We save the context and show the case status.",
  "PRYWATNE ZGŁOSZENIE": "PRIVATE REPORT",
  "PRYWATNA BLOKADA": "PRIVATE BLOCK",
  "Co nie zgadza się": "What is wrong",
  "z miejscem?": "with the venue?",
  "Kogo chcesz zgłosić": "Who do you want to report",
  "Kogo chcesz zablokować": "Who do you want to block",
  "po spotkaniu?": "after the meeting?",
  "Druga strona nie zobaczy treści ani autora zgłoszenia.": "The other person will not see the report or its author.",
  "Osoba nie dostanie powiadomienia i nie pojawi się w przyszłych dopasowaniach.": "The person will not be notified or appear in future matches.",
  "Miejsce jest zamknięte": "The venue is closed",
  "Nie ma naszej rezerwacji": "Our reservation is missing",
  "Miejsce wydaje się niebezpieczne": "The venue feels unsafe",
  "Inny problem": "Another problem",
  "Wybierz osobę": "Choose a person",
  "Zablokuj bez powiadomienia": "Block without notification",
  "DODATKOWY OPIS · OPCJONALNIE": "ADDITIONAL DETAILS · OPTIONAL",
  "Napisz tylko tyle, ile chcesz": "Write only as much as you want",
  "Wyślij zgłoszenie": "Send report",
  "Wzajemny kontakt w Experience": "Mutual contact in Experience",
  "Zablokuj": "Block",
  "Numer telefonu i profile społecznościowe pozostają prywatne, dopóki sami ich nie udostępnicie.": "Phone numbers and social profiles stay private until you choose to share them yourselves.",
  "Cześć! Dzięki za wczoraj 🙂": "Hi! Thanks for yesterday 🙂",
  "Też dzięki. Może kawa w przyszłym tygodniu?": "Thanks too. Coffee next week?",
  "Napisz wiadomość": "Write a message",
  "Wiadomość": "Message",
  "Wyślij": "Send",
  "Szukamy": "Searching",
  "KRĄG 04 · CZW 19:00": "CIRCLE 04 · THU 7:00 PM",
  "Wasz pierwszy wieczór": "Your first evening",
  "Twój głos za kontynuacją zapisano prywatnie.": "Your vote to continue was saved privately.",
  "Decyzja o przyszłości kręgu nadal czeka na Twój prywatny głos.": "The circle decision is still waiting for your private vote.",
  "ENGLISH": "ENGLISH",
  "Twój głos za nowym kręgiem zapisano prywatnie.": "Your vote for a new circle was saved privately.",
  "Twój głos za kontynuacją zapisano prywatnie. Decyzję poznamy dopiero po zebraniu prywatnych głosów.": "Your vote to continue was saved privately. We will show the decision only after all private votes are collected.",
  "Twój głos za nowym kręgiem zapisano prywatnie. Decyzję poznamy dopiero po zebraniu prywatnych głosów.": "Your vote for a new circle was saved privately. We will show the decision only after all private votes are collected.",
  "To normalny wynik, nie ocena spotkania. Twój głos za kontynuacją zapisano prywatnie.": "This is a normal result, not a rating of the meeting. Your vote to continue was saved privately.",
  "To normalny wynik, nie ocena spotkania. Twój głos za nowym kręgiem zapisano prywatnie.": "This is a normal result, not a rating of the meeting. Your vote for a new circle was saved privately.",
  "Śródmieście · 4 osoby · zakończone": "Śródmieście · 4 people · completed",
  "Mokotów · 5 osób · zakończone": "Mokotów · 5 people · completed",
  "Ty": "You",
  "POTWIERDZONE": "CONFIRMED",
  "spokojne tempo": "calm pace",
  "lekki humor": "light humor",
  "nowe miejsca": "new places",
  "Wzajemny kontakt koleżeński. Numer telefonu pozostaje prywatny.": "Mutual friendship connection. The phone number stays private.",
  "Wzajemny kontakt romantyczny. Numer telefonu pozostaje prywatny.": "Mutual romantic connection. The phone number stays private."
};

function translateText(text) {
  if (translations[text]) return translations[text];
  return text
    .replace(/^(\d+) z minimum 4$/, '$1 of at least 4')
    .replace(/^(\d+) osoby$/, '$1 people')
    .replace(/^Ty i (.+)$/, 'You and $1')
    .replace(/^Wzajemny kontakt koleżeński\.$/, 'Mutual friendship connection.')
    .replace(/^Wzajemny kontakt romantyczny\.$/, 'Mutual romantic connection.')
    .replace(/^Krąg (\d+)/, 'Circle $1')
    .replace(/Warszawa/g, 'Warsaw')
    .replace(/Polski/g, 'Polish')
    .replace(/osoby potwierdziły/g, 'people confirmed')
    .replace(/osób/g, 'people');
}

function translateDom(root) {
  document.documentElement.lang = state.language;
  if (state.language !== 'en') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const raw = node.nodeValue;
    const value = raw.trim();
    if (!value) return;
    const translated = translateText(value);
    if (translated !== value) node.nodeValue = raw.replace(value, translated);
  });
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(element => {
    ['placeholder','aria-label','title'].forEach(attribute => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, translateText(value));
    });
  });
}

function languageControl() {
  const target = state.language === 'pl' ? 'English' : 'polski';
  return `<button class="language-switch" data-action="toggle-language" aria-label="Przełącz język na ${target}" title="PL / EN">${state.language === 'pl' ? 'EN' : 'PL'}</button>`;
}

function progress(step, total = 3) {
  return `<div class="setup-progress"><span>${step} / ${total}</span><i><b style="width:${step / total * 100}%"></b></i></div>`;
}

function welcome() {
  return `<section class="screen welcome-screen">
    <div class="welcome-top"><span class="logo">experience°</span><span></span></div>
    <div class="welcome-sky" aria-hidden="true"><i class="sky-orbit one"></i><i class="sky-orbit two"></i><span class="sky-core">✦</span><span class="sky-dot a"></span><span class="sky-dot b"></span><span class="sky-dot c"></span></div>
    <div class="welcome-copy"><p class="eyebrow">NIE MUSISZ SZUKAĆ SAM</p><h1>Co tydzień<br><strong>szukamy planu.</strong></h1><p>Łączymy osoby o wspólnym terminie i rytmie. Gdy minimum cztery potwierdzą — dostajesz gotowe miejsce i plan.</p></div>
    <button class="primary" data-route="profile">Zaczynam</button>
    <button class="text-action" data-action="how">Jak działa Experience?</button>
  </section>`;
}

function profile() {
  if (state.profileStep === 1) return `<section class="screen setup-screen">
    ${topbar('', true)}${progress(1)}
    <p class="eyebrow">PODSTAWY</p><h1 class="display">Gdzie ma zacząć się<br><strong>Twój krąg?</strong></h1><p class="lead">Pilot działa na razie tylko w Warszawie. Wszyscy w kręgu wybierają ten sam język.</p>
    <label class="field-label">MIASTO</label><button class="field-row selected"><span>Warszawa</span><b>✓</b></button>
    <label class="field-label">JĘZYK SPOTKANIA</label><div class="option-grid"><button class="option ${state.meetingLanguage === 'pl' ? 'selected' : ''}" data-option="language" data-value="pl"><b>Polski</b><small>Swobodna rozmowa</small></button><button class="option ${state.meetingLanguage === 'en' ? 'selected' : ''}" data-option="language" data-value="en"><b>English</b><small>Comfortable conversation</small></button></div>
    <div class="setup-bottom"><button class="primary" data-action="profile-next">Dalej</button></div>
  </section>`;

  if (state.profileStep === 2) return `<section class="screen setup-screen">
    ${topbar('', true)}${progress(2)}
    <p class="eyebrow">PRAKTYCZNY RYTM</p><h1 class="display">Kiedy realnie masz<br><strong>czas na spotkanie?</strong></h1><p class="lead">Tylko ustawienia organizacyjne. Przed każdym nowym kręgiem możesz je zmienić.</p>
    <label class="field-label">PASUJĄCE TERMINY <small>MOŻESZ WYBRAĆ KILKA</small></label><div class="option-stack intention-list"><button class="option selected" data-multi="availability"><b>Poniedziałek–czwartek</b><small>Wieczorem, po 18:00</small><i>✓</i></button><button class="option" data-multi="availability"><b>Piątek</b><small>Wieczorem, po 18:00</small><i></i></button><button class="option selected" data-multi="availability"><b>Weekend</b><small>W ciągu dnia lub wieczorem</small><i>✓</i></button></div>
    <p class="setup-note">Nie pytamy, „jakim jesteś człowiekiem”. Interesuje nas tylko termin, w którym naprawdę możesz przyjść.</p>
    <div class="setup-bottom"><button class="primary" data-action="profile-next">Dalej</button></div>
  </section>`;

  return `<section class="screen setup-screen">
    ${topbar('', true)}${progress(3)}
    <p class="eyebrow">KOSMICZNA WARSTWA</p><h1 class="display">Dodaj kontekst.<br><strong>Nie wyrok.</strong></h1><p class="lead">Data urodzenia pomaga tworzyć codzienne podpowiedzi i tematy dla kręgu. Nigdy nie blokuje spotkań ani decyzji.</p>
    <label class="field-label">DATA URODZENIA</label><button class="field-row"><span>14 · 08 · 1992</span><b>⌄</b></button>
    <label class="field-label">MIEJSCE URODZENIA</label><button class="field-row"><span>Mińsk, Białoruś</span><b>⌄</b></button>
    <label class="field-label">GODZINA <small>OPCJONALNIE</small></label><button class="field-row muted-field"><span>Nie znam dokładnej godziny</span><b>+</b></button>
    <label class="consent"><input type="checkbox" data-adult ${state.adultConfirmed ? 'checked' : ''}><span>Potwierdzam, że mam co najmniej 18 lat</span></label>
    <div class="setup-bottom"><button class="primary" data-action="continue-membership" ${state.adultConfirmed ? '' : 'disabled'}>Zobacz, co otrzymasz</button></div>
  </section>`;
}

function membership() {
  const payment = {
    processing: ['PŁATNOŚĆ W TOKU', 'Potwierdzamy aktywację', 'To zwykle trwa chwilę. Nie pobieramy opłaty ponownie.', 'Sprawdź ponownie'],
    declined: ['PŁATNOŚĆ ODRZUCONA', 'Nie udało się aktywować', 'Subskrypcja nie została uruchomiona. Możesz bezpiecznie spróbować ponownie.', 'Spróbuj ponownie'],
    active: ['PREMIUM AKTYWNE', 'Dobór działa co tydzień', 'Masz priorytet doboru, pełny nawigator i szybszą zwykłą obsługę.', 'Przejdź do aplikacji'],
    cancelled: ['ANULOWANO ODNOWIENIE', 'Dostęp do 30 września', 'Premium działa do końca opłaconego okresu i nie odnowi się automatycznie.', 'Włącz odnowienie'],
    expired: ['PREMIUM WYGASŁO', 'Dobór został zatrzymany', 'Historia i profil zostają. Aktywuj Premium, aby wrócić do cotygodniowych rund.', 'Aktywuj ponownie'],
    restore: ['PRZYWRACANIE ZAKUPU', 'Szukamy poprzedniej subskrypcji', 'Sprawdzimy zakupy przypisane do Twojego konta sklepu.', 'Przywróć zakup']
  }[state.paymentState];
  if (payment) return `<section class="screen membership-screen payment-state-screen">${topbar('', true)}<div class="state-symbol" aria-hidden="true">◎</div><p class="eyebrow">${payment[0]}</p><h1 class="display">${payment[1]}</h1><p class="lead">${payment[2]}</p><div class="payment-value"><b>59 PLN</b><span>miesięcznie · bez gwarancji spotkania</span></div><button class="primary" data-action="payment-action">${payment[3]}</button><button class="text-action" data-action="restore">Przywróć wcześniejszy zakup</button></section>`;
  return `<section class="screen membership-screen">
    ${topbar('', true)}
    <div class="membership-orbit" aria-hidden="true"><span>✦</span><i></i></div>
    <p class="eyebrow">EXPERIENCE PREMIUM</p><h1 class="display">Nie kupujesz wejścia.<br><strong>Kupujesz ciągłość.</strong></h1>
    <div class="price"><strong>59</strong><span>PLN<br><small>/ MIESIĄC</small></span></div>
    <ul class="benefits"><li><i>01</i><span><b>Pełny codzienny nawigator</b><small>Dostępny od razu po aktywacji</small></span></li><li><i>02</i><span><b>Priorytetowy dobór co tydzień</b><small>Szukamy osób z pasującym terminem i rytmem</small></span></li><li><i>03</i><span><b>Szybsza zwykła obsługa</b><small>Pilne zgłoszenia bezpieczeństwa zawsze mają ten sam priorytet</small></span></li></ul>
    <div class="subscription-rule"><span>i</span><p><b>Spotkanie nie jest gwarantowane</b><br>Premium pozostaje aktywne także wtedy, gdy w danym tygodniu nie zbierze się wystarczająca grupa.</p></div>
    <div class="optional-trust"><span>◎</span><p><b>Weryfikacja jest opcjonalna</b><br>Telefon lub selfie możesz dodać później. Nie blokujemy dostępu do kręgu.</p></div>
    <button class="primary" data-action="activate-premium">Aktywuj Premium za 59 PLN</button><button class="text-action" data-action="restore">Przywróć zakup</button><p class="fine">Miesięczne odnowienie · anulowanie w dowolnym momencie · prototyp</p>
  </section>`;
}

function pulse() {
  return `<section class="screen setup-screen week-pulse-screen">
    ${topbar('', true)}
    <p class="eyebrow">TYLKO NA TEN TYDZIEŃ</p><h1 class="display">Który wieczór brzmi<br><strong>teraz dobrze?</strong></h1><p class="lead">To nie trafia do profilu. Wybierz jeden lub dwa scenariusze dla najbliższego spotkania.</p>
    <div class="option-stack week-modes"><button class="option selected" data-multi="week-mode"><b>Usiąść i naprawdę pogadać</b><small>Spokojne miejsce, w którym słychać rozmowę</small><i>✓</i></button><button class="option" data-multi="week-mode"><b>Zrobić coś razem</b><small>Gra, mały warsztat albo lekka aktywność</small><i></i></button><button class="option selected" data-multi="week-mode"><b>Odkryć nowe miejsce</b><small>Inna część Warszawy i gotowy punkt spotkania</small><i>✓</i></button></div>
    <div class="optional-trust weekly-note"><span>↻</span><p><b>Za tydzień możesz wybrać inaczej</b><br>Dzisiejszy nastrój nie staje się etykietą ani stałą cechą profilu.</p></div>
    <div class="setup-bottom"><button class="primary" data-route="home">Zapisz i wejdź do aplikacji</button><button class="text-action" data-route="home">Nie mam preferencji</button></div>
  </section>`;
}

function formingNodes() {
  const count = state.formingStage === 1 ? 0 : state.formingStage === 2 ? 1 : 3;
  return `<div class="forming-orbit" aria-label="Status tworzenia kręgu">
    <i class="ring ring-a"></i><i class="ring ring-b"></i>
    <div class="forming-node self">${avatar({ tone: 'you', name: 'Ty' })}<small>Ty</small></div>
    ${people.map((p, index) => `<div class="forming-node slot-${index + 1} ${index < count ? 'revealed' : 'empty'}">${index < count ? avatar(p) + `<small>${p.name}</small>` : avatar(null) + '<small>Szukamy</small>'}</div>`).join('')}
    ${[4,5].map(index => `<div class="forming-node slot-${index} empty">${avatar(null)}<small>Szukamy</small></div>`).join('')}
  </div>`;
}

function home() {
  const ready = state.formingStage === 3;
  const noCircle = state.formingStage === 0;
  const nextStep = ready
    ? { label: 'SPOTKANIE W TYM TYGODNIU', title: 'Czwartek · 19:00', copy: 'Plan jest gotowy. Sprawdź miejsce, budżet i dojazd.', route: 'plan', action: 'Otwórz plan' }
    : noCircle
      ? { label: 'NAJBLIŻSZY KROK', title: 'Nowa runda w poniedziałek', copy: 'Do tego czasu codzienna podpowiedź pozostaje dostępna.', route: 'circle', action: 'Otwórz krąg' }
      : { label: 'NAJBLIŻSZY KROK', title: 'Dobór działa w tle', copy: 'Damy znać, gdy pojawi się zmiana. Postęp i osoby znajdziesz w zakładce Krąg.', route: 'circle', action: 'Otwórz krąg' };
  return `<section class="screen">
    <div class="home-head"><span class="logo">experience°</span><button class="round-button notification" aria-label="Powiadomienia">✦</button></div>
    <div class="home-copy"><p class="eyebrow">DZISIAJ / WARSZAWA</p><h1 class="display">Co możesz zrobić dziś.<br><strong>Bez czekania na krąg.</strong></h1><p class="lead">Zacznij od małego kroku z dzisiejszej podpowiedzi. Dobór ludzi nie blokuje reszty aplikacji.</p></div>
    <button class="moon-today-card" data-route="lunar"><span class="moon-disc" aria-hidden="true"><i></i></span><span><small>KSIĘŻYC DZISIAJ · NÓW</small><b>Mały pierwszy krok</b><em>Nie blokuje planów ani spotkań</em></span><i>›</i></button>
    ${state.oneOff.entry()}
    <div class="today-next-card"><span>${nextStep.label}</span><strong>${nextStep.title}</strong><p>${nextStep.copy}</p><button class="secondary" data-route="${nextStep.route}">${nextStep.action}</button></div>
  </section>${nav('home')}`;
}

function lunar() {
  return `<section class="screen lunar-screen">
    ${topbar('', true, '11·09')}
    <p class="eyebrow">KALENDARZ KSIĘŻYCOWY · DZISIAJ</p><h1 class="display">Księżyc opisuje tło.<br><strong>Ty wybierasz ruch.</strong></h1>
    <div class="lunar-hero"><div class="lunar-rings"><i></i><span></span></div><div class="lunar-phase"><small>11 WRZEŚNIA · WARSZAWA</small><h2>Nów</h2><p>Dokładna faza: 05:27</p></div></div>
    <div class="science-note"><span>◎</span><p><b>Fakt astronomiczny</b><br>Faza i czas pochodzą z danych astronomicznych. Znaczenie poniżej jest interpretacją, nie prognozą.</p></div>
    <div class="lunar-guidance"><p class="eyebrow">PERSPEKTYWA NA DZIŚ</p><h2>Zacznij od czegoś małego, co naprawdę możesz kontynuować.</h2><div><span>01</span><p><b>Kontakt</b><br>Napisz pierwszy, bez układania idealnej wiadomości.</p></div><div><span>02</span><p><b>Nowe doświadczenie</b><br>Wybierz jeden konkretny krok zamiast wielkiego planu.</p></div></div>
    <div class="no-wait-rule"><span>→</span><p><b>Masz już plan? Idź.</b><br>Żaden dzień księżycowy nie odwołuje spotkań i nie każe czekać.</p></div>
    <button class="primary" data-route="home">Wróć do dzisiejszego planu</button>
  </section>${nav('home')}`;
}

function circle() {
  const count = state.formingStage === 0 ? 0 : state.formingStage === 1 ? 1 : state.formingStage === 2 ? 2 : 4;
  const ready = state.formingStage === 3;
  if (state.formingStage === 0) return `<section class="screen pending-plan-screen">${topbar('experience°', false, '?')}<p class="eyebrow">KRĄG / RUNDA ZAKOŃCZONA</p><h1 class="display">Nie zebraliśmy<br><strong>grupy na ten tydzień.</strong></h1><p class="lead">To nie jest Twoja wina i nie musisz nic robić. W poniedziałek automatycznie zaczniemy nową rundę.</p><div class="no-circle-card"><span>NASTĘPNA RUNDA</span><h2>Poniedziałek · 09:00</h2><p>Zachowamy miasto, język i dostępność. Przed startem możesz zmienić wybór na kolejny tydzień.</p><button class="secondary" data-route="pulse">Zmień wybór</button></div></section>${nav('circle')}`;
  if (!ready) return `<section class="screen forming-screen circle-forming-screen">
    ${topbar('experience°', false, '?')}
    <p class="eyebrow">KRĄG / TEN TYDZIEŃ</p><h1 class="display">Szukamy ludzi<br><strong>w Twoim rytmie.</strong></h1><p class="lead">Możesz korzystać z całej aplikacji. Tutaj zobaczysz wyłącznie osoby, które naprawdę przyjęły zaproszenie.</p>
    ${formingNodes()}
    <div class="forming-status"><div><span>${count} / 6</span><b>MINIMUM 4, ABY POWSTAŁ PLAN</b></div><i><b style="width:${count / 6 * 100}%"></b></i></div>
    <div class="forming-actions"><button class="primary" data-action="notify-ready">${state.readyNotification ? '✓ Powiadomienie włączone' : 'Powiadom mnie, gdy plan będzie gotowy'}</button><button class="text-action" data-route="pulse">Zmień wybór na ten tydzień</button><p class="forming-wait-note">Nie musisz zostawać na tym ekranie. Dobór aktualizuje się w tle.</p><div class="prototype-simulation"><small>TYLKO PROTOTYP · ZOSTANIE USUNIĘTE</small><button class="secondary" data-action="simulate-forming">Symuluj kolejny etap</button></div></div>
  </section>${nav('circle')}`;
  return `<section class="screen">
    ${topbar('experience°', false, 'i')}
    <p class="eyebrow">TWÓJ KRĄG / CYKL 01</p><h1 class="display">Wspólny termin.<br><strong>Dobry rytm.</strong></h1><p class="lead">Widzisz osoby, które przyjęły to samo zaproszenie. Szczegóły doboru pozostają po stronie Experience.</p>
    <div class="circle-hero"><span class="circle-status"><i></i> PLAN POTWIERDZONY</span><h2>Krąg 04</h2><p>Ty i trzy osoby potwierdziliście. Dwa miejsca nadal uzupełniamy.</p></div>
    <div class="people">${people.map(p => `<button class="person" data-person="${p.id}">${avatar(p)}<span><strong>${p.name}${p.verified ? '<i class="trust-mark" title="Profil potwierdzony">✓</i>' : ''}</strong><small>${p.note}</small></span><b>potwierdzone</b></button>`).join('')}${[1,2].map(() => `<div class="person open-person">${avatar(null)}<span><strong>Wolne miejsce</strong><small>Szukamy osoby w tym samym rytmie</small></span><b>···</b></div>`).join('')}</div>
    <div class="match-reason"><span>DLACZEGO WY?</span><p>Łączy Was spokojne wejście w rozmowę, potrzeba regularnego kontaktu i gotowość do nowych miejsc. Kosmiczna warstwa tylko podpowiada temat do refleksji.</p></div>
    <button class="primary section-action" data-route="plan">Zobacz plan</button>
  </section>${nav('circle')}`;
}

function plan() {
  // Both modes are visible in Plan, but keep independent participants and outcomes.
  const circleHtml = circlePlan();
  const topbarEnd = circleHtml.indexOf('</div>') + '</div>'.length;
  return circleHtml.slice(0, topbarEnd) + state.oneOff.entry()
    + `<span class="plan-circle-label">${state.language === 'pl' ? 'STAŁY KRĄG' : 'REGULAR CIRCLE'}</span>`
    + circleHtml.slice(topbarEnd);
}

function oneoff() {
  return `<section class="screen oneoff-screen">${topbar()}<div class="oneoff-ui">${state.oneOff.content()}</div></section>${nav('plan')}`;
}

function circlePlan() {
  const noCircle = state.formingStage === 0;
  if (state.formingStage !== 3) return `<section class="screen pending-plan-screen">
    ${topbar('experience°', false, 'i')}
    <p class="eyebrow">PLAN / TEN TYDZIEŃ</p><h1 class="display">${noCircle ? 'W tym tygodniu' : 'Tu pojawi się'}<br><strong>${noCircle ? 'nie ma spotkania.' : 'potwierdzone spotkanie.'}</strong></h1><p class="lead">${noCircle ? 'Plan nie powstał w tej rundzie. Nowa rozpocznie się automatycznie w poniedziałek.' : 'Bez wymyślonego miejsca i terminu. Pokażemy je dopiero, gdy plan naprawdę będzie gotowy.'}</p>
    <div class="plan-empty-card"><span>NAJBLIŻSZA AKTUALIZACJA</span><strong>${noCircle ? 'Nowa runda · poniedziałek 09:00' : 'Powiadomienie o gotowym planie'}</strong><p>${noCircle ? 'Premium działa dalej. Nie musisz nic robić, aby wejść do kolejnej cotygodniowej rundy.' : 'Wyślemy je od razu po potwierdzeniu miejsca i terminu. Szczegóły doboru są w zakładce Krąg.'}</p><button class="secondary" data-route="circle">Przejdź do kręgu</button></div>
    <button class="safety-link" data-safety-context="plan">Centrum bezpieczeństwa</button>
  </section>${nav('plan')}`;
  return `<section class="screen screen--plan">
    ${topbar('experience°', false, '↗')}<span class="confirmed-badge"><i></i> PLAN POTWIERDZONY</span>
    <div class="plan-title"><p class="eyebrow">SPOTKANIE 01 / 03</p><h1>Wasz pierwszy<br><em>wieczór.</em></h1><p class="lead">Czwartek, 19:00 · stolik czeka przez 15 minut</p></div>
    <div class="venue-art"><span class="venue-pin"><span>19:00</span></span><span class="venue-name">STUDIO LAS · MOKOTÓW</span></div>
    <div class="detail-list"><div class="detail-row"><span>⌖</span><div><b>Studio Las</b><small>ul. Puławska 24 · stolik Experience</small></div><strong>12 min</strong></div><div class="detail-row"><span>◷</span><div><b>Czwartek · 19:00</b><small>około 90 minut</small></div><strong>18:45–19:15</strong></div><div class="detail-row"><span>◉</span><div><b>Płatność na miejscu</b><small>napój lub mała przekąska</small></div><strong>40–70 PLN</strong></div><div class="detail-row"><span>◎</span><div><b>Język spotkania</b><small>wszyscy wybrali ten sam</small></div><strong>${state.meetingLanguage === 'en' ? 'ENGLISH' : 'POLSKI'}</strong></div></div>
    <div class="attendance-strip">${people.map(p => avatar(p, 'mini-avatar')).join('')}<span>Ty + 3 osoby potwierdziły</span></div>
    <button class="primary" data-action="arrival">${state.arrived ? '✓ Jestem na miejscu' : 'Jestem na miejscu'}</button><div class="button-row"><button class="secondary" data-action="late">Spóźnię się</button><button class="secondary" data-action="cancel">Nie mogę przyjść</button></div><button class="safety-link" data-safety-context="plan">Centrum bezpieczeństwa</button><p class="fine">Bezpłatna rezygnacja do środy, 19:00.</p>
  </section>${nav('plan')}`;
}

function meeting() {
  const low = state.attendance < 3;
  const attendanceText = state.attendance === 1 ? 'Na miejscu jesteś tylko Ty.' : state.attendance === 2 ? 'Na miejscu są dwie osoby.' : state.attendance === 3 ? 'Spotkanie może odbyć się w mniejszym składzie.' : 'Krąg jest gotowy, ale nikt nie musi zostawać.';
  return `<section class="screen"><div class="meeting-head"><div class="meeting-head-top"><span class="live-badge"><i></i> JESTEŚ NA MIEJSCU</span><button class="round-button" data-safety-context="meeting" aria-label="Centrum bezpieczeństwa">!</button></div><h1>Teraz po prostu<br>bądźcie razem.</h1><p>Experience nie prowadzi spotkania i nie wymaga patrzenia w telefon.</p></div><div class="arrival ${low ? 'arrival-low' : ''}"><div class="arrival-top"><span>OBECNOŚĆ</span><b>${state.attendance} / 6</b></div><div class="arrival-dots">${[1,2,3,4,5,6].map(n => `<i class="${n <= state.attendance ? 'here' : ''}"></i>`).join('')}</div><p>${attendanceText}</p></div>${low ? `<div class="attendance-warning"><span>i</span><p><b>Nie musisz czekać ani zostawać.</b><br>Możesz bezpiecznie wyjść, zgłosić problem albo zdecydować razem, czy chcecie zostać.</p></div>` : ''}<div class="support-card"><span class="host-step">OPCJONALNIE</span><h2>Gdy rozmowa na chwilę stanie.</h2><p>Możesz pokazać grupie jedno lekkie pytanie. Bez rund, timerów i obowiązkowej kolejności.</p><button data-action="conversation">${state.promptOpen ? 'Ukryj pytanie' : 'Pokaż jedno pytanie'}</button></div>${state.promptOpen ? `<div class="conversation-card"><span>PYTANIE NA START</span><h3>Co ostatnio pozytywnie Cię zaskoczyło?</h3><p>Każdy może odpowiedzieć albo powiedzieć „pass”.</p></div>` : ''}<div class="meeting-tools"><button class="secondary" data-route="plan">Szczegóły miejsca</button><button class="secondary" data-safety-context="meeting">Pomoc i bezpieczeństwo</button></div><button class="primary meeting-finish" data-action="finish">Zakończ spotkanie</button><p class="meeting-note">Dopiero jutro, już prywatnie, zdecydujesz o kontaktach i przyszłości kręgu.</p></section>`;
}

function afterResult() {
  const circleText = state.circleVote === 'rematch' ? 'Twój głos za nowym kręgiem zapisano prywatnie.' : state.circleVote === 'continue' ? 'Twój głos za kontynuacją zapisano prywatnie.' : 'Decyzja o przyszłości kręgu nadal czeka na Twój prywatny głos.';
  if (state.followupResult === 'pending') return `<div class="result-neutral"><span>ODPOWIEDZI W TOKU</span><h2>Jeszcze czekamy na innych</h2><p>Nie pokazujemy częściowych wyborów. Damy znać tylko o wzajemnych kontaktach.</p></div>`;
  if (state.followupResult === 'none') return `<div class="result-neutral"><span>PODSUMOWANIE GOTOWE</span><h2>Tym razem bez wzajemnego kontaktu</h2><p>To normalny wynik, nie ocena spotkania. ${circleText}</p></div>`;
  const cards = state.followupResult === 'multiple'
    ? [[people[0], 'koleżeński'], [people[1], 'romantyczny']]
    : [[people[0], 'koleżeński']];
  return `<div class="mutual-list">${cards.map(([person,kind]) => `<div class="result-card">${avatar(person)}<h2>Ty i ${person.name}</h2><p>Wzajemny kontakt ${kind}. Numer telefonu pozostaje prywatny.</p><button data-chat="${person.id}">Otwórz czat w Experience</button></div>`).join('')}</div><div class="circle-result"><span>PRZYSZŁOŚĆ KRĘGU</span><p>${circleText} Decyzję poznamy dopiero po zebraniu prywatnych głosów.</p></div>`;
}

function continuationDecision() {
  const core = state.circleDecision === 'core';
  return `<section class="screen rematch-screen continuation-screen">
    ${topbar('experience°', false, '✓')}
    <div class="rematch-symbol" aria-hidden="true"><i></i><i></i><span>${core ? '3' : '✓'}</span></div>
    <p class="eyebrow">DECYZJA KRĘGU</p><h1 class="display">${core ? 'Rdzeń kręgu' : 'Ten krąg'}<br><strong>zostaje razem.</strong></h1><p class="lead">${core ? 'Trzy osoby chcą kontynuować. Szukamy jednej nowej osoby, ale nie ujawniamy, kto ani dlaczego odszedł.' : 'Większość chce kontynuować i są co najmniej cztery osoby. Nie dodajemy nikogo automatycznie do sześciu.'}</p>
    <div class="decision-privacy"><span>◉</span><p><b>PRYWATNOŚĆ GŁOSOWANIA</b><br>Pokazujemy tylko stan kręgu. Indywidualne odpowiedzi i powody pozostają ukryte.</p></div>
    <div class="rematch-next-card"><span>CO DALEJ</span><h2>${core ? 'Szukamy jednej osoby.' : 'Możecie planować kolejne spotkanie.'}</h2><b>${core ? '3 osoby · minimum 4 do spotkania' : 'Skład pozostaje bez zmian'}</b><p>${core ? 'Następne spotkanie potwierdzimy dopiero, gdy nowa osoba przyjmie zaproszenie.' : 'Nowe osoby pojawią się tylko wtedy, gdy skład spadnie poniżej czterech.'}</p><small>${core ? 'Jeśli nie znajdziemy zastępstwa do terminu, w tym tygodniu nie będzie spotkania, ale rdzeń kręgu pozostanie.' : 'Każdy nadal może prywatnie wyjść i otrzymać nowy dobór.'}</small></div>
    <button class="primary section-action" data-route="circle">Przejdź do kręgu</button>
  </section>${nav('circle')}`;
}

function rematchDecision() {
  return `<section class="screen rematch-screen">
    ${topbar('experience°', false, '✓')}
    <div class="rematch-symbol" aria-hidden="true"><i></i><i></i><span>↻</span></div>
    <p class="eyebrow">DECYZJA KRĘGU</p><h1 class="display">Ten krąg<br><strong>kończy się tutaj.</strong></h1><p class="lead">Większość wybrała nowy krąg. Nie pokazujemy, kto ani jak głosował.</p>
    <div class="decision-privacy"><span>◉</span><p><b>PRYWATNOŚĆ GŁOSOWANIA</b><br>Pokazujemy wyłącznie wspólną decyzję. Indywidualne odpowiedzi pozostają ukryte.</p></div>
    <div class="rematch-next-card"><span>CO DALEJ</span><h2>Zaczynamy nowy dobór.</h2><b>Nowa runda · poniedziałek 09:00</b><p>Zachowamy miasto, język i dostępność. Przed startem możesz zmienić wybór na kolejny tydzień.</p><small>Nie musisz nic robić. Zakończone spotkanie pozostanie w historii.</small></div>
    <button class="primary section-action" data-action="start-rematch">Przejdź do nowego kręgu</button><button class="text-action" data-route="pulse">Zmień wybór na ten tydzień</button>
  </section>${nav('circle')}`;
}

function after() {
  if (state.circleDecision === 'rematch') return rematchDecision();
  if (state.circleDecision === 'continue' || state.circleDecision === 'core') return continuationDecision();
  if (!state.followupReady) return `<section class="screen cooldown-screen">${topbar('experience°', false, '✓')}<div class="after-hero"><div class="after-symbol"><span>☾</span></div><p class="eyebrow">NA DZIŚ WYSTARCZY</p><h1>Nic nie musisz<br>wybierać przy stole.</h1><p>Wróć spokojnie do domu. Jutro przypomnimy o prywatnym podsumowaniu — nikt z grupy nie zobaczy Twoich odpowiedzi.</p></div><div class="cooldown-card"><span>JUTRO · 12:00</span><h2>Kontakty i przyszłość kręgu</h2><p>Odpowiesz sam, bez obecności grupy i bez presji chwili.</p></div><button class="secondary demo-followup" data-action="open-followup">Pokaż późniejszy ekran w prototypie</button><button class="text-action" data-route="home">Wróć na główną</button></section>${nav('home')}`;
  if (state.submitted) return `<section class="screen">${topbar('experience°', false, '✓')}<div class="after-hero compact-after"><p class="eyebrow">WYBÓR ZAPISANY</p><h1>Odpowiedzi zostają prywatne.</h1><p>Pokazujemy tylko wzajemne kontakty i zbiorczą decyzję kręgu.</p></div>${afterResult()}<button class="secondary section-action" data-route="home">Wróć na orbitę</button></section>${nav('home')}`;
  return `<section class="screen">${topbar('', true, '◉')}<div class="after-hero compact-after"><p class="eyebrow">NASTĘPNEGO DNIA · PRYWATNIE</p><h1>Co chcesz<br>zabrać dalej?</h1><p>Nikt nie zobaczy odrzuceń ani rodzaju wyboru bez wzajemności.</p></div>${people.map(p => `<div class="choice-person"><div class="choice-head">${avatar(p)}<span><strong>${p.name}</strong><small>Jak chcesz kontynuować?</small></span></div><div class="choice-actions">${[['friend','Koleżeńsko'],['romance','Romantycznie'],['none','Nie teraz']].map(([key,label]) => `<button class="${state.choices[p.id] === key ? 'selected' : ''}" data-choice="${p.id}:${key}">${label}</button>`).join('')}</div></div>`).join('')}<div class="circle-vote"><p class="eyebrow">PRZYSZŁOŚĆ KRĘGU</p><h2>Co powinno wydarzyć się dalej?</h2><p>Głosy są ukryte. Jeśli większość głosujących wybierze nowy krąg, dobierzemy wszystkich ponownie.</p><button class="${state.circleVote === 'continue' ? 'selected' : ''}" data-circle-vote="continue"><b>Spotkajmy się ponownie</b><small>Krąg może żyć dalej, a wolne miejsca uzupełnimy</small></button><button class="${state.circleVote === 'rematch' ? 'selected' : ''}" data-circle-vote="rematch"><b>Chcę nowy krąg</b><small>Rozpocznij dla mnie nowy dobór</small></button></div><div class="privacy-note"><span>◉</span><div>Kontakty i głos o kręgu są prywatne. Blokada zawsze działa niezależnie od tego głosowania.</div></div><button class="primary section-action" data-action="submit-choices">Zapisz prywatnie</button></section>`;
}

function account() {
  const paymentLabels = { offer: 'Nieaktywna', processing: 'W toku', declined: 'Odrzucona', active: 'Aktywna', cancelled: 'Anulowana', expired: 'Wygasła', restore: 'Przywracanie' };
  const history = state.accountEmpty ? (state.oneOff.historyCount() ? '' : `<div class="empty-history"><span>◎</span><h3>Tu pojawią się Twoje spotkania</h3><p>Historia jest teraz pusta. Nie pokazujemy przykładowych ludzi ani wydarzeń jako prawdziwych danych.</p></div>`) : `<button class="history-card" data-route="history"><span class="history-date"><b>05</b>WRZ</span><span class="history-copy"><b>Krąg 03 · Kawiarnia Relaks</b><small>Mokotów · 5 osób · zakończone</small></span><i>›</i></button><button class="history-card" data-route="history"><span class="history-date"><b>29</b>SIE</span><span class="history-copy"><b>Krąg 02 · Bar Studio</b><small>Śródmieście · 4 osoby · zakończone</small></span><i>›</i></button>`;
  return `<section class="screen account-screen">
    <div class="home-head"><span class="logo">experience°</span><button class="round-button" data-action="settings" aria-label="Ustawienia">⚙</button></div>
    <div class="account-hero">${avatar({ tone: 'you', name: 'Aleks' }, 'account-avatar')}<div><p class="eyebrow">TWÓJ PROFIL</p><h1>Aleks</h1><span>Warszawa · ${state.meetingLanguage === 'en' ? 'English' : 'Polski'}</span></div></div>
    <button class="account-summary" data-route="membership"><div><small>PREMIUM</small><b>${paymentLabels[state.paymentState]}</b></div><span>59 PLN / miesiąc</span></button>
    <div class="account-section"><div class="section-heading"><div><p class="eyebrow">TWOJE USTAWIENIA</p><h2>Dobór i dostępność</h2></div><button data-route="profile">Edytuj</button></div><div class="profile-facts"><span><b>Miasto</b>Warszawa</span><span><b>Język</b>${state.meetingLanguage === 'en' ? 'English' : 'Polski'}</span><span><b>Terminy</b>Pon–czw + weekend</span></div></div>
    <div class="account-section"><div class="section-heading"><div><p class="eyebrow">HISTORIA</p><h2>Poprzednie spotkania</h2></div><span>${(state.accountEmpty ? 0 : 2) + state.oneOff.historyCount()}</span></div>${history}${state.oneOff.history()}</div>
    <div class="account-section compact-section"><button class="settings-row" data-action="contacts"><span><b>Wzajemne kontakty</b><small>${state.accountEmpty ? 'Jeszcze nikogo' : '2 osoby'}</small></span><i>›</i></button><button class="settings-row" data-action="privacy"><span><b>Prywatność i weryfikacja</b><small>Weryfikacja opcjonalna</small></span><i>›</i></button><button class="settings-row" data-safety-context="account"><span><b>Bezpieczeństwo</b><small>Zgłoszenia, blokady i pomoc</small></span><i>›</i></button></div>
  </section>${nav('account')}`;
}

function historyScreen() {
  return `<section class="screen history-screen">${topbar('', true, '···')}<p class="eyebrow">HISTORIA / 05 WRZEŚNIA</p><h1 class="display">Krąg 03<br><strong>Kawiarnia Relaks</strong></h1><p class="lead">Piątek · 19:00 · Mokotów · 5 osób</p><div class="history-summary"><span>SPOTKANIE ZAKOŃCZONE</span><h2>Twój prywatny zapis</h2><p>Wybrałeś kontakt koleżeński z Mają. Krąg spotkał się ponownie w ciągu 14 dni.</p></div><button class="settings-row standalone" data-chat="maja"><span><b>Czat z Mają</b><small>Wzajemny kontakt · w Experience</small></span><i>›</i></button><button class="safety-link" data-safety-context="history">Zgłoś problem z tym spotkaniem</button></section>${nav('account')}`;
}

function safety() {
  const context = { plan: 'przed spotkaniem', meeting: 'podczas spotkania', history: 'po spotkaniu', account: 'w dowolnym momencie' }[state.safetyContext] || 'w dowolnym momencie';
  return `<section class="screen safety-screen">${topbar('', true)}<p class="eyebrow">CENTRUM BEZPIECZEŃSTWA</p><h1 class="display">Pomoc ${context}.<br><strong>Ty decydujesz.</strong></h1><p class="lead">Pilne zgłoszenia mają ten sam priorytet dla wszystkich — niezależnie od Premium.</p><button class="emergency-card" data-action="emergency"><span>112</span><div><b>Bezpośrednie zagrożenie</b><small>Zadzwoń pod numer alarmowy</small></div><i>›</i></button><div class="safety-actions"><button data-action="leave-meeting"><span>→</span><div><b>Opuść spotkanie</b><small>Nie musisz podawać powodu grupie</small></div></button><button data-report="person"><span>!</span><div><b>Zgłoś osobę</b><small>Zgłoszenie pozostaje prywatne</small></div></button><button data-report="venue"><span>⌖</span><div><b>Problem z miejscem</b><small>Zamknięte, niebezpieczne lub brak rezerwacji</small></div></button><button data-action="block-person"><span>×</span><div><b>Zablokuj osobę</b><small>Bez powiadomienia i przyszłych dopasowań</small></div></button></div><div class="safety-note"><b>Co dzieje się po zgłoszeniu?</b><p>Oddzielamy zgłoszenie od blokady. Możesz zrobić jedno, oba albo żadne. Zapiszemy kontekst i pokażemy status sprawy.</p></div></section>`;
}

function report() {
  const venue = state.reportType === 'venue';
  const block = state.reportType === 'block';
  return `<section class="screen report-screen">${topbar('', true)}<p class="eyebrow">${block ? 'PRYWATNA BLOKADA' : 'PRYWATNE ZGŁOSZENIE'}</p><h1 class="display">${venue ? 'Co nie zgadza się' : block ? 'Kogo chcesz zablokować' : 'Kogo chcesz zgłosić'}<br><strong>${venue ? 'z miejscem?' : 'po spotkaniu?'}</strong></h1><p class="lead">${block ? 'Osoba nie dostanie powiadomienia i nie pojawi się w przyszłych dopasowaniach.' : 'Druga strona nie zobaczy treści ani autora zgłoszenia.'}</p>${venue ? `<div class="report-options"><button data-option="report">Miejsce jest zamknięte</button><button data-option="report">Nie ma naszej rezerwacji</button><button data-option="report">Miejsce wydaje się niebezpieczne</button><button data-option="report">Inny problem</button></div>` : `<div class="report-people">${people.map(p => `<button ${block ? `data-block-person="${p.id}"` : `data-report-person="${p.id}"`}>${avatar(p)}<span><b>${p.name}</b><small>${block ? 'Zablokuj bez powiadomienia' : 'Wybierz osobę'}</small></span><i>›</i></button>`).join('')}</div>`}${block ? '' : `<label class="report-label">DODATKOWY OPIS · OPCJONALNIE<textarea placeholder="Napisz tylko tyle, ile chcesz"></textarea></label><button class="primary" data-action="submit-report">Wyślij zgłoszenie</button>`}</section>`;
}

function chat() {
  const person = people.find(item => item.id === state.blockedPerson) || people[0];
  return `<section class="screen chat-screen">${topbar('', true)}<div class="chat-person">${avatar(person)}<div><h1>${person.name}</h1><span>Wzajemny kontakt w Experience</span></div><button data-block-person="${person.id}">Zablokuj</button></div><div class="chat-boundary"><span>◉</span><p>Numer telefonu i profile społecznościowe pozostają prywatne, dopóki sami ich nie udostępnicie.</p></div><div class="chat-messages"><p><span>Cześć! Dzięki za wczoraj 🙂</span></p><p class="mine"><span>Też dzięki. Może kawa w przyszłym tygodniu?</span></p></div><div class="chat-compose"><input aria-label="Wiadomość" placeholder="Napisz wiadomość"><button data-action="send-message" aria-label="Wyślij">↑</button></div></section>`;
}

const screens = { welcome, profile, membership, pulse, forming: circle, home, lunar, circle, plan, oneoff, meeting, after, account, history: historyScreen, safety, report, chat };

function applyDemoScenario(scenario) {
  state.demoScenario = scenario;
  state.demoOpen = false;
  state.arrived = false;
  state.promptOpen = false;
  state.choices = {};
  state.circleVote = '';
  state.circleDecision = 'pending';
  if (scenario === 'new') {
    state.route = 'welcome';
    state.formingStage = 1;
    state.paymentState = 'offer';
    state.accountEmpty = true;
    state.followupReady = false;
    state.submitted = false;
  }
  if (scenario === 'ready') {
    state.route = 'home';
    state.formingStage = 3;
    state.paymentState = 'active';
    state.accountEmpty = true;
    state.followupReady = false;
    state.submitted = false;
  }
  if (scenario === 'returning') {
    state.route = 'account';
    state.formingStage = 3;
    state.paymentState = 'active';
    state.accountEmpty = false;
    state.followupReady = true;
    state.submitted = true;
  }
  render();
}

function render() {
  if (!screens[state.route]) state.route = 'welcome';
  guide.innerHTML = guideMarkup;
  app.innerHTML = screens[state.route]() + demoControls() + languageControl();
  translateDom(app);
  translateDom(guide);
  document.querySelectorAll('.flow-nav button').forEach(button => button.classList.toggle('active', button.dataset.route === state.route));
  const url = new URL(location.href);
  url.searchParams.set('screen', state.route);
  url.searchParams.set('stage', state.formingStage);
  url.searchParams.set('demo', state.demoScenario);
  url.searchParams.set('payment', state.paymentState);
  url.searchParams.set('attendance', state.attendance);
  url.searchParams.set('result', state.followupResult);
  url.searchParams.set('decision', state.circleDecision);
  url.searchParams.set('lang', state.language);
  url.searchParams.set('meetingLang', state.meetingLanguage);
  window.history.replaceState({}, '', url);
}

function go(route) { state.route = route; render(); app.querySelector('.screen')?.scrollTo(0,0); }
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

document.addEventListener('change', event => state.oneOff.handleChange(event));
document.addEventListener('click', event => {
  if (state.oneOff.handleClick(event)) return;
  const route = event.target.closest('[data-route]')?.dataset.route;
  if (route) { state.oneOff.exitHistory(); go(route); return; }

  const demo = event.target.closest('[data-demo]')?.dataset.demo;
  if (demo) { applyDemoScenario(demo); return; }
  const payment = event.target.closest('[data-payment]')?.dataset.payment;
  if (payment) { state.paymentState = payment; state.demoOpen = false; go('membership'); return; }
  const attendance = event.target.closest('[data-attendance]')?.dataset.attendance;
  if (attendance) { state.attendance = Number(attendance); state.demoScenario = 'ready'; state.formingStage = 3; state.demoOpen = false; go('meeting'); return; }
  const result = event.target.closest('[data-result]')?.dataset.result;
  if (result) { state.demoScenario = 'returning'; state.accountEmpty = false; state.followupResult = result; state.followupReady = true; state.submitted = true; state.circleVote ||= 'continue'; state.circleDecision = 'pending'; state.demoOpen = false; go('after'); return; }
  const circleDecision = event.target.closest('[data-decision]')?.dataset.decision;
  if (circleDecision) { state.demoScenario = 'returning'; state.accountEmpty = false; state.followupResult = 'none'; state.followupReady = true; state.submitted = true; state.circleVote = circleDecision === 'rematch' ? 'rematch' : circleDecision === 'pending' ? '' : 'continue'; state.circleDecision = circleDecision; state.demoOpen = false; go('after'); return; }
  const matching = event.target.closest('[data-matching]')?.dataset.matching;
  if (matching !== undefined) { state.formingStage = Number(matching); state.circleDecision = 'pending'; state.demoOpen = false; go('circle'); return; }

  if (event.target.closest('[data-back]')) {
    if (state.route === 'profile' && state.profileStep > 1) { state.profileStep -= 1; render(); return; }
    const previous = { profile:'welcome', membership:'profile', pulse:'membership', forming:'pulse', lunar:'home', circle:'home', plan:'home', after:'meeting', history:'account', safety: state.safetyContext === 'meeting' ? 'meeting' : state.safetyContext === 'history' ? 'history' : state.safetyContext === 'account' ? 'account' : 'plan', report:'safety', chat:'account' };
    go(previous[state.route] || 'home'); return;
  }

  const safetyContext = event.target.closest('[data-safety-context]')?.dataset.safetyContext;
  if (safetyContext) { state.safetyContext = safetyContext; go('safety'); return; }
  const reportType = event.target.closest('[data-report]')?.dataset.report;
  if (reportType) { state.reportType = reportType; go('report'); return; }
  const chatPerson = event.target.closest('[data-chat]')?.dataset.chat;
  if (chatPerson) { state.blockedPerson = chatPerson; go('chat'); return; }
  const circleVote = event.target.closest('[data-circle-vote]')?.dataset.circleVote;
  if (circleVote) { state.circleVote = circleVote; state.circleDecision = 'pending'; render(); return; }
  const reportPerson = event.target.closest('[data-report-person]')?.dataset.reportPerson;
  if (reportPerson) {
    event.target.closest('[data-report-person]').parentElement.querySelectorAll('button').forEach(button => button.classList.remove('selected'));
    event.target.closest('[data-report-person]').classList.add('selected');
    return;
  }
  const blockedPerson = event.target.closest('[data-block-person]')?.dataset.blockPerson;
  if (blockedPerson) { state.blockedPerson = blockedPerson; notify('Osoba zablokowana. Nie zobaczy powiadomienia i nie trafi do przyszłych dopasowań.'); go('account'); return; }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'toggle-demo') { state.demoOpen = !state.demoOpen; render(); return; }
  if (action === 'toggle-language') { state.language = state.language === 'pl' ? 'en' : 'pl'; render(); return; }
  if (action === 'profile-next') { state.profileStep += 1; render(); }
  if (action === 'continue-membership') { if (state.adultConfirmed) go('membership'); }
  if (action === 'notify-ready') { state.readyNotification = true; render(); }
  if (action === 'simulate-forming') { state.formingStage = state.formingStage < 3 ? state.formingStage + 1 : 1; render(); }
  if (action === 'how') notify('Najpierw poznajemy Twój rytm, potem zapraszamy osoby na ten sam cotygodniowy termin.');
  if (action === 'activate-premium') { state.paymentState = 'processing'; render(); }
  if (action === 'payment-action') {
    if (state.paymentState === 'active') go('home');
    else { state.paymentState = state.paymentState === 'cancelled' ? 'active' : 'processing'; render(); }
  }
  if (action === 'restore') { state.paymentState = 'restore'; render(); }
  if (action === 'verify') notify('Telefon i selfie są opcjonalne — możesz wrócić do nich później.');
  if (action === 'empty') notify('To miejsce jest jeszcze puste. Nie pokazujemy osoby, dopóki nie przyjmie zaproszenia.');
  if (action === 'arrival') { state.arrived = true; notify('Obecność zaznaczona'); setTimeout(() => go('meeting'), 500); }
  if (action === 'late') notify('Grupa otrzyma informację o spóźnieniu.');
  if (action === 'cancel') notify('Pokażemy zasady rezygnacji przed potwierdzeniem.');
  if (action === 'conversation') { state.promptOpen = !state.promptOpen; render(); }
  if (action === 'finish') go('after');
  if (action === 'open-followup') { state.followupReady = true; render(); }
  if (action === 'start-rematch') { state.circleDecision = 'pending'; state.formingStage = 1; state.readyNotification = false; go('circle'); return; }
  if (action === 'submit-choices') {
    if (!state.circleVote) { notify('Wybierz, czy chcesz kontynuować z tym kręgiem.'); return; }
    state.submitted = true; render();
  }
  if (action === 'settings') notify('Ustawienia konta i powiadomień.');
  if (action === 'contacts') notify('Kontakty pojawiają się tylko po wzajemnym wyborze.');
  if (action === 'privacy') notify('Prywatność, blokowanie i opcjonalna weryfikacja.');
  if (action === 'emergency') notify('W gotowej aplikacji otworzy się połączenie z numerem 112.');
  if (action === 'leave-meeting') { notify('Spotkanie opuszczone. Grupa nie otrzyma Twojego powodu.'); go('home'); }
  if (action === 'block-person') { state.reportType = 'block'; go('report'); }
  if (action === 'submit-report') { notify('Zgłoszenie zapisane. Status pojawi się w Centrum bezpieczeństwa.'); go('safety'); }
  if (action === 'send-message') notify('Wiadomość wysłana w Experience.');

  const adult = event.target.closest('[data-adult]');
  if (adult) { state.adultConfirmed = adult.checked; render(); return; }
  const choice = event.target.closest('[data-choice]')?.dataset.choice;
  if (choice) { const [person, value] = choice.split(':'); state.choices[person] = value; render(); }
  const person = event.target.closest('[data-person]')?.dataset.person;
  if (person) { const found = people.find(p => p.id === person); if (found) notify(`${found.name} · ${found.note}${found.verified ? ' · profil potwierdzony' : ''}`); }
  const multi = event.target.closest('[data-multi]');
  if (multi) {
    const group = multi.parentElement;
    const isWeeklyMode = multi.dataset.multi === 'week-mode';
    if (isWeeklyMode && !multi.classList.contains('selected') && group.querySelectorAll('.option.selected').length >= 2) {
      notify('Wybierz maksymalnie dwa scenariusze na ten tydzień.');
      return;
    }
    multi.classList.toggle('selected');
    const mark = multi.querySelector('i');
    if (mark) mark.textContent = multi.classList.contains('selected') ? '✓' : '';
    return;
  }
  const option = event.target.closest('[data-option]');
  if (option) {
    option.parentElement.querySelectorAll('[data-option]').forEach(item => item.classList.remove('selected'));
    option.classList.add('selected');
    if (option.dataset.option === 'language') state.meetingLanguage = option.dataset.value;
    render();
  }
});

render();
