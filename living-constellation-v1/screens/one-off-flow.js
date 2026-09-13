// One-off requests share the app shell, language and navigation with persistent circles.
// No requests, bookings or notifications are sent: all outcomes are explicitly simulated.
const OneOffFlow = {
  create(host) {
const icons={arrow:'<path d="m9 5 7 7-7 7"/>',back:'<path d="m15 5-7 7 7 7"/>',check:'<path d="m5 12 4 4L19 6"/>',dinner:'<path d="M4 3v6c0 3 6 3 6 0V3M7 3v18M19 21V3c-4 2-5 8 0 9"/>',coffee:'<path d="M3 8h13v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM16 9h2a3 3 0 0 1 0 6h-2M6 3v2M11 3v2"/>',walk:'<circle cx="14" cy="4" r="2"/><path d="m7 21 4-7-2-4 4-3 4 5h4M13 8l-1 7 5 6M5 12l4-2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',people:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a3 3 0 0 1 0 6M19 14a5 5 0 0 1 3 5v2"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',home:'<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/>',profile:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',spark:'<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V5l13-3v3M21 11h-6v5h6"/>',moon:'<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>'};
const icon=(n,small=false)=>`<svg ${small?'class="small-icon"':''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]||icons.spark}</svg>`;
const copy={
demo:['PROTOTYP · 13 WRZ 2026 · fikcyjne dane','PROTOTYPE · 13 SEP 2026 · fictional data'],today:['Dzisiaj','Today'],circle:['Krąg','Circle'],plan:['Plan','Plan'],profile:['Profil','Profile'],oneoff:['Jednorazowe spotkanie','One-off meeting'],homeTitle:['Na co masz ochotę?','What are you up for?'],homeIntro:['Nowi ludzie na jeden wieczór czy znajoma ekipa na dłużej?','New people for one evening, or a familiar group for the long run?'],oneoffTitle:['Chcę się spotkać','I want to meet people'],oneoffDesc:['Wybierz format i najbliższe daty. Dobierzemy ludzi do Twoich warunków.','Choose a format and nearby dates. We’ll match people around your conditions.'],circleTitle:['Chcę swoją ekipę','I want my own circle'],circleDesc:['Stały krąg i kolejne spotkania z tymi samymi ludźmi.','A lasting group and more meetings with the same people.'],modeNote:['Jednorazowe spotkanie nie zmienia Twojego stałego kręgu.','A one-off meeting does not change your regular circle.'],back:['Wstecz','Back'],next:['Dalej','Continue'],whenTitle:['Twój pomysł na wieczór.','Your kind of evening.'],whenIntro:['Powiedz, co i kiedy Ci pasuje. Najpierw dobierzemy ludzi, potem zaproponujemy miejsce.','Tell us what works and when. We’ll match the people first, then suggest a place.'],format:['Na co idziemy?','What would you like to do?'],dinner:['Kolacja','Dinner'],coffee:['Kawa','Coffee'],walk:['Spacer','Walk'],dates:['Kiedy masz czas?','When are you free?'],multi:['Możesz wybrać obie daty','You can choose both dates'],tomorrow:['Jutro','Tomorrow'],later:['Pojutrze','Day after tomorrow'],date1:['Pon., 14 wrz','Mon, 14 Sep'],date2:['Wt., 15 wrz','Tue, 15 Sep'],hardFormat:['Nie zamienimy kolacji na kawę ani spacer bez Twojej zgody.','We won’t swap dinner for coffee or a walk without asking.'],hardOther:['Szukamy tylko wybranego formatu. Nie zmienimy go bez Twojej zgody.','We’ll look only for your chosen format. No changes without your agreement.'],needDate:['Wybierz co najmniej jedną datę.','Choose at least one date.'],detailsTitle:['Żeby wszystkim pasowało.','A good fit for everyone.'],detailsIntro:['To warunki tego spotkania, nie Twoje preferencje na zawsze.','These are conditions for this meeting, not your preferences forever.'],city:['Miasto','City'],warsaw:['Warszawa','Warsaw'],krakow:['Kraków','Kraków'],area:['Okolica','Area'],centre:['Centrum','City centre'],wide:['Centrum i pobliskie dzielnice','Centre and nearby neighbourhoods'],time:['Godzina rozpoczęcia','Start time'],budget:['Maksymalny budżet na osobę','Maximum budget per person'],language:['Język rozmowy','Conversation language'],polish:['Polski','Polish'],english:['Angielski','English'],budgetNote:['Płacisz za siebie na miejscu. Limit dotyczy wydatków w lokalu, nie abonamentu.','Pay for yourself at the venue. This is your spending limit, not the subscription price.'],walkBudget:['Spacer jest bezpłatny. Ewentualna kawa nie jest obowiązkowa.','The walk is free. Buying coffee afterwards is optional.'],reviewTitle:['Najpierw ludzie.<br>Potem miejsce.','People first.<br>The place comes next.'],reviewIntro:['Dobierzemy kompanię do Twoich warunków. Nie zapisujesz się do stałego kręgu.','We’ll match a group around your conditions. You’re not joining a regular circle.'],formatLabel:['Format','Format'],datesLabel:['Wybrane daty','Selected dates'],locationLabel:['Miasto i okolica','City and area'],budgetLabel:['Budżet','Budget'],upTo:['do','up to'],free:['Bezpłatnie','Free'],commonLanguage:['Wspólny język','Shared language'],resultBy:['Wynik dla tej daty','Result for this date'],deadlineToday:['Dzisiaj, 13 wrz · do 18:00','Today, 13 Sep · by 18:00'],deadlineLater:['Jutro, 14 wrz · do 18:00','Tomorrow, 14 Sep · by 18:00'],localTime:['Czas lokalny miejsca spotkania','Local time at the meeting location'],noGuarantee:['Nie gwarantujemy zebrania grupy. Jeśli się nie uda, dowiesz się przed terminem — bez przenoszenia na inną datę bez Twojej zgody.','We can’t guarantee a group. You’ll know before the deadline. We won’t move you to a date you didn’t choose.'],start:['Szukaj mojej kompanii','Find my company'],edit:['Zmień warunki','Change conditions'],searchTitle:['Szukamy Twojej kompanii.','Finding your company.'],searchIntro:['Tylko osoby, którym pasują ten format, termin i budżet. Nie zapełniamy przypadkowego stolika.','People who share your format, timing and budget. Not random seats at a table.'],searchSub:['Nie mamy jeszcze potwierdzonej grupy.','There isn’t a confirmed group yet.'],yourConditions:['Twoje warunki są zapisane','Your conditions are saved'],peopleNext:['Dobieramy kompatybilne osoby','Looking for compatible people'],placeNext:['Potwierdzenia i miejsce','Confirmations and a place'],placeNextSub:['Gotowy plan dopiero po obu krokach.','Your plan is ready only after both.'],cancelSearch:['Zakończ wyszukiwanie','Stop searching'],stayCircle:['Twój stały krąg pozostaje bez zmian.','Your regular circle stays unchanged.'],inviteTitle:['Mamy dla Ciebie kompanię.','We’ve found your company.'],inviteIntro:['Czworo dobranych uczestników, wspólne warunki. Potwierdź, czy nadal chcesz dołączyć.','Four matched people with shared conditions. Confirm if you’d still like to join.'],inviteTag:['Zaproszenie · to jeszcze nie gotowy plan','Invitation · not a confirmed plan yet'],responses:['3 osoby potwierdziły.<br>Czekamy na Ciebie.','3 people have confirmed.<br>We’re waiting for you.'],answerBy:['Twoja odpowiedź do','Please respond by'],answerTime:['Dzisiaj · 17:30','Today · 17:30'],answerTimeLater:['Jutro · 17:30','Tomorrow · 17:30'],shortWindow:['Krótki termin, bo spotkanie jest blisko. Brak odpowiedzi oznacza brak udziału, nie wyjście ze stałego kręgu.','A shorter response window because the meeting is soon. No answer means no place at this meeting, not leaving your regular circle.'],venuePending:['Miejsce wybierzemy po potwierdzeniach. Zachowamy wybraną okolicę i budżet.','We’ll choose the place after confirmations, within your selected area and budget.'],confirm:['Potwierdzam udział','Confirm my attendance'],decline:['Nie tym razem','Not this time'],whyTitle:['Co Was łączy na ten wieczór','What fits for this evening'],why1:['Ten sam format i termin','The same format and time'],why2:['Wspólny język rozmowy','A shared conversation language'],why3:['Zgodny budżet i okolica','Compatible budget and area'],whyNote:['To zgodność warunków, nie gwarancja przyjaźni.','Matching conditions aren’t a guarantee of friendship.'],bookingTitle:['Kompania jest gotowa.<br>Teraz miejsce.','The people are ready.<br>Now, the place.'],bookingIntro:['Udział potwierdzony. Sprawdzamy miejsce dla Waszej czwórki.','Your attendance is confirmed. We’re checking a place for the four of you.'],bookingCount:['4 potwierdzenia','4 confirmations'],bookingCountSub:['Minimum zebrane. Nie czekamy na sześć osób.','The minimum is met. No need to wait for six.'],bookingNotice:['Nie mamy jeszcze potwierdzonego planu. Otrzymasz go, gdy miejsce będzie gotowe.','The plan isn’t confirmed yet. You’ll receive it once the place is ready.'],bookingWalk:['Udział potwierdzony. Ustalamy punkt spotkania i trasę dla Waszej czwórki.','Your attendance is confirmed. We’re arranging a meeting point and route for the four of you.'],bookingWalkNotice:['Plan będzie gotowy po ustaleniu punktu spotkania.','Your plan will be ready once the meeting point is arranged.'],readyTag:['Plan potwierdzony','Plan confirmed'],readyTitle:['Widzimy się jutro.','See you tomorrow.'],readyTitleLater:['Widzimy się we wtorek.','See you on Tuesday.'],readyIntro:['Kompania i miejsce są gotowe. Teraz wiesz, gdzie i kiedy przyjść.','The people and place are ready. You know where to go and when.'],sampleVenue:['Przykładowa restauracja','Example restaurant'],sampleCafe:['Przykładowa kawiarnia','Example café'],samplePark:['Przykładowy park','Example park'],sampleAddress:['Adres przykładowy · Centrum','Example address · City centre'],sampleWarning:['Miejsce i rezerwacja są fikcyjne — wyłącznie do demonstracji.','The place and booking are fictional — demonstration only.'],reserved:['Stół dla 4 osób · potwierdzony','Table for 4 · confirmed'],walkReady:['Punkt spotkania dla 4 osób','Meeting point for 4 people'],peopleReady:['4 uczestników','4 people'],venueDetails:['Szczegóły spotkania','Meeting details'],cancelAttendance:['Odwołaj mój udział','Cancel my attendance'],afterNote:['Jedna wspólna okazja. Po spotkaniu możesz zachować wzajemne kontakty — bez automatycznego tworzenia kręgu.','One shared occasion. Keep mutual contacts afterwards — no circle is created automatically.'],failedTitle:['Na ten termin<br>się nie udało.','Not this time,<br>unfortunately.'],failedIntro:['Nie zebraliśmy wystarczającej liczby potwierdzeń. Nie ma spotkania ani rezerwacji na tę datę.','We didn’t get enough confirmations. There is no meeting or booking for this date.'],failedVenueTitle:['Nie udało się<br>potwierdzić miejsca.','We couldn’t<br>confirm a place.'],failedVenueIntro:['Grupa była gotowa, ale nie mamy miejsca spełniającego Wasze warunki. Ten plan nie został potwierdzony.','The group was ready, but we couldn’t secure a place matching your conditions. This plan was not confirmed.'],closedDate:['Zamknięty termin','Closed date'],alternateTitle:['Masz jeszcze wybraną datę','You selected one more date'],alternateBody:['Pojutrze nadal mieści się w Twoim zgłoszeniu. Możesz kontynuować wyszukiwanie bez zmiany formatu i budżetu.','The day after tomorrow is still within your request. You can keep searching with the same format and budget.'],alternate:['Szukaj na pojutrze','Search for the next date'],noAlternate:['Nie przenosimy Cię automatycznie na kolejny dzień. Możesz złożyć nowe zgłoszenie.','We won’t move you to another day automatically. You can submit a new request.'],newSearch:['Wybierz inny termin','Choose another date'],stoppedTitle:['Wyszukiwanie zakończone.','Search stopped.'],stoppedIntro:['Nie masz aktywnego zgłoszenia. Twój stały krąg i kontakty pozostają bez zmian.','You have no active request. Your regular circle and contacts are unchanged.'],cancelledTitle:['Udział odwołany.','Attendance cancelled.'],cancelledIntro:['Nie jesteś już zapisany na to spotkanie. Pozostali uczestnicy otrzymają aktualizację składu.','You’re no longer attending this meeting. The others will receive an updated participant count.'],cancelledNote:['To nie uruchamia nowego wyszukiwania i nie zmienia Twojego stałego kręgu.','This does not start a new search or change your regular circle.'],returnHome:['Wróć do Dzisiaj','Back to Today'],activeRequest:['Twoje zgłoszenie','Your request'],openRequest:['Zobacz status','View status'],noPlan:['Nie masz jeszcze planu.','No plan just yet.'],noPlanBody:['Wybierz format i daty — zaczniemy od znalezienia odpowiednich ludzi.','Choose a format and dates. We’ll start by finding the right people.'],circlePageTitle:['Twoja stała ekipa.','Your familiar company.'],circlePageBody:['Jednorazowe spotkania są niezależne od stałego kręgu. Ten prototyp pokazuje tylko ścieżkę jednorazową.','One-off meetings are independent of your regular circle. This prototype covers only the one-off journey.'],circlePageNote:['Nie dołączamy Cię do kręgu ani nie wypisujemy z niego podczas tej demonstracji.','You won’t join or leave a regular circle in this demonstration.'],profileTitle:['Twoje ustawienia.','Your settings.'],profileBody:['Język aplikacji możesz zmienić u góry. Język rozmowy wybierasz osobno przy zgłoszeniu.','Change the app language at the top. Choose the conversation language separately in your request.'],profileNote:['Dane nie są wysyłane na serwer. Odświeżenie strony resetuje scenariusz.','No data is sent to a server. Refreshing the page resets the scenario.'],modalCancelSearch:['Zakończyć wyszukiwanie?','Stop this search?'],modalCancelSearchBody:['Przestaniemy szukać osób na wybrane daty. Możesz później utworzyć nowe zgłoszenie.','We’ll stop looking for people on your selected dates. You can create a new request later.'],modalCancelAttend:['Odwołać udział?','Cancel your attendance?'],modalCancelAttendBody:['Pozostali dowiedzą się o zmianie liczby uczestników. Nie przeniesiemy Cię automatycznie do innej grupy.','The others will see an updated participant count. We won’t move you into another group automatically.'],keep:['Zostaję','Keep it'],yesCancel:['Tak, zakończ','Yes, stop searching'],yesCancelAttend:['Tak, odwołaj','Yes, cancel'],modalEdit:['Zmienić warunki?','Change your conditions?'],modalEditBody:['Zakończymy bieżące wyszukiwanie. Poprawisz warunki i samodzielnie wyślesz nowe zgłoszenie.','We’ll stop the current search. You can edit the conditions and submit a new request yourself.'],yesEdit:['Zakończ i edytuj','Stop and edit'],detailTitle:['Przed spotkaniem','Before you meet'],detailBody:['Przyjdź o wybranej godzinie. Zapłać tylko za swoje zamówienie. Powiedz, że jesteś z Experience. Szczegóły lokalu w tym prototypie są przykładowe.','Arrive at the selected time. Pay only for your own order. Tell the venue you’re with Experience. Venue details in this prototype are examples.'],detailWalk:['Spotkajcie się o wybranej godzinie przy wskazanym wejściu. Udział jest bezpłatny. Punkt spotkania jest przykładowy.','Meet at the selected time by the indicated entrance. The walk is free. The meeting point is an example.'],close:['Rozumiem','Got it'],expiredTitle:['Zaproszenie wygasło.','The invitation expired.'],expiredIntro:['Nie otrzymaliśmy Twojego potwierdzenia na czas. Nie jesteś zapisany na tę datę.','We didn’t receive your confirmation in time. You are not attending on this date.']};

const initial=()=>({screen:'when',tab:'today',flow:'home',format:'dinner',dates:[1],city:'warsaw',area:'centre',time:'19:00',budget:'100',conversation:'polish',activeDate:1,failedReason:'people'});
let state=initial();
const t=k=>{if(!copy[k])throw Error(`Missing translation: ${k}`);return copy[k][host.language()==='pl'?0:1]};
const button=(label,action,kind='primary',disabled=false)=>`<button class="${kind}" data-oo-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
const notice=text=>`<div class="notice">${icon('info',true)}<p>${text}</p></div>`;
const title=(h,p,tag='')=>`${tag?`<span class="tag">${tag}</span>`:''}<h1>${h}</h1><p class="intro">${p}</p>`;
const dateLabel=d=>t(d===1?'date1':'date2');
const meetingDate=()=>`${dateLabel(state.activeDate)} · ${state.time}`;
const budgetLabel=()=>state.format==='walk'?t('free'):`${t('upTo')} ${state.budget} zł`;
const deadline=()=>t((state.screen==='review'?Math.min(...state.dates):state.activeDate)===1?'deadlineToday':'deadlineLater');
const deadlineBlock=()=>`<div class="deadline"><small>${t('resultBy')}</small><strong>${deadline()}</strong><small>${t('localTime')}</small></div>`;
const stageHeader=n=>`<div class="row between"><button class="back" data-oo-action="back">${icon('back',true)}${t('back')}</button><div class="step-dots" aria-label="${n}/3">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div></div><span class="tag">${t('oneoff')} · ${n}/3</span>`;
const summaryLine=(symbol,label,value)=>`<div class="summary-line">${icon(symbol)}<div><small>${label}</small><strong>${value}</strong></div></div>`;
function summary(allDates=false){return `<div class="summary">${summaryLine(state.format,t('formatLabel'),t(state.format))}${summaryLine('calendar',t('datesLabel'),`${allDates?state.dates.map(dateLabel).join(' / '):dateLabel(state.activeDate)} · ${state.time}`)}${summaryLine('pin',t('locationLabel'),`${t(state.city)} · ${t(state.area)}`)}${summaryLine('wallet',t('budgetLabel'),budgetLabel())}${summaryLine('people',t('commonLanguage'),t(state.conversation))}</div>`}
const orbit=()=>`<div class="orbital searching" aria-hidden="true"><div class="orbit"></div><div class="orbit two"></div><span class="orb-dot one"></span><span class="orb-dot two"></span><span class="orb-dot three"></span><div class="core">${icon('people')}</div></div>`;
const statusIcon=(name,kind='')=>`<div class="status-icon ${kind}"><div class="core">${icon(name)}</div></div>`;
const chips=()=>`<div class="chip-row">${[state.format,state.city].map(k=>`<span class="chip">${t(k)}</span>`).join('')}<span class="chip">${budgetLabel()}</span><span class="chip">${t(state.conversation)}</span></div>`;
const hasRequest=()=>['searching','invitation','booking','confirmed'].includes(state.flow);
function whenScreen(){return `${stageHeader(1)}${title(t('whenTitle'),t('whenIntro'))}<div class="section-title"><h2>${t('format')}</h2></div><div class="choices">${['dinner','coffee','walk'].map(f=>`<button class="choice" data-oo-format="${f}" aria-pressed="${state.format===f}">${icon(f)}<span>${t(f)}</span>${state.format===f?`<span class="tick">${icon('check',true)}</span>`:''}</button>`).join('')}</div><section class="section"><div class="section-title"><h2>${t('dates')}</h2><span>${t('multi')}</span></div><div class="date-options">${[1,2].map(d=>`<button class="date-choice" data-oo-date="${d}" aria-pressed="${state.dates.includes(d)}"><span class="check">${state.dates.includes(d)?icon('check',true):''}</span><span><strong>${t(d===1?'tomorrow':'later')}</strong><small>${dateLabel(d)}</small></span></button>`).join('')}</div>${!state.dates.length?`<p class="error-text" role="status">${t('needDate')}</p>`:''}</section>${notice(t(state.format==='dinner'?'hardFormat':'hardOther'))}<div class="actions">${button(t('next'),'details','primary',!state.dates.length)}</div>`}
const selectField=(label,field,options)=>`<label class="field">${t(label)}<select data-oo-field="${field}">${options.map(([v,l])=>`<option value="${v}" ${state[field]===v?'selected':''}>${l}</option>`).join('')}</select></label>`;
function details(){return `${stageHeader(2)}${title(t('detailsTitle'),t('detailsIntro'))}${selectField('city','city',[['warsaw',t('warsaw')],['krakow',`${t('krakow')} · demo`]])}${selectField('area','area',[['centre',t('centre')],['wide',t('wide')]])}<div class="field"><span>${t('time')}</span><div class="segmented">${['18:00','19:00','20:00'].map(v=>`<button data-oo-time="${v}" aria-pressed="${state.time===v}">${v}</button>`).join('')}</div><span class="micro">${t('localTime')}</span></div>${state.format!=='walk'?selectField('budget','budget',[['60','60 zł'],['100','100 zł'],['150','150 zł']]):''}${selectField('language','conversation',[['polish',t('polish')],['english',t('english')]])}<p class="micro" style="margin-top:16px">${t(state.format==='walk'?'walkBudget':'budgetNote')}</p><div class="actions">${button(t('next'),'review')}</div>`}
function review(){return `${stageHeader(3)}${title(t('reviewTitle'),t('reviewIntro'))}${summary(true)}${deadlineBlock()}${notice(t('noGuarantee'))}<div class="actions">${button(t('start'),'search')}${button(t('edit'),'details','text-button')}</div>`}
function searching(){return `${title(t('searchTitle'),t('searchIntro'),t('oneoff'))}<p class="result-date">${meetingDate()}</p>${orbit()}${chips()}<ol class="progress-list"><li class="done"><span class="node">${icon('check',true)}</span><div><strong>${t('yourConditions')}</strong></div></li><li class="current"><span class="node">2</span><div><strong>${t('peopleNext')}</strong><small>${t('searchSub')}</small></div></li><li><span class="node">3</span><div><strong>${t('placeNext')}</strong><small>${t('placeNextSub')}</small></div></li></ol>${deadlineBlock()}<div class="actions">${button(t('edit'),'edit-search','secondary')}${button(t('cancelSearch'),'cancel-search','text-button')}</div><p class="micro" style="text-align:center;margin-top:14px">${t('stayCircle')}</p>`}
function invitation(){return `${title(t('inviteTitle'),t('inviteIntro'),t('inviteTag'))}<p class="result-date">${meetingDate()}</p>${chips()}<div class="group-count">${icon('people')}<div><strong>3 / 4</strong><small>${t('responses')}</small></div></div><h2>${t('whyTitle')}</h2><div class="plain-list">${['why1','why2','why3'].map(k=>`<div>${icon('check',true)}<span>${t(k)}</span></div>`).join('')}</div><p class="micro">${t('whyNote')}</p>${notice(t('venuePending'))}<div class="deadline"><small>${t('answerBy')}</small><strong>${t(state.activeDate===1?'answerTime':'answerTimeLater')}</strong><small>${t('localTime')}</small></div><p class="micro">${t('shortWindow')}</p><div class="actions">${button(t('confirm'),'attend')}${button(t('decline'),'decline','text-button')}</div>`}
function booking(){return `${statusIcon(state.format==='walk'?'pin':'dinner')}${title(t('bookingTitle'),t(state.format==='walk'?'bookingWalk':'bookingIntro'),t('oneoff'))}<p class="result-date">${meetingDate()}</p><div class="group-count">${icon('people')}<div><strong>${t('bookingCount')}</strong><small>${t('bookingCountSub')}</small></div></div>${notice(t(state.format==='walk'?'bookingWalkNotice':'bookingNotice'))}${deadlineBlock()}<div class="actions">${button(t('cancelAttendance'),'cancel-attendance','secondary')}</div>`}
function confirmed(){return `${title(t(state.activeDate===1?'readyTitle':'readyTitleLater'),t('readyIntro'),`${icon('check',true)} ${t('readyTag')}`)}<div class="venue"><div class="venue-top">${icon(state.format)}${t(state.format)}</div><h2>${t(state.format==='dinner'?'sampleVenue':state.format==='coffee'?'sampleCafe':'samplePark')}</h2><p>${t(state.city)} · ${t('sampleAddress')}</p><div class="venue-details"><div>${icon('calendar')}${meetingDate()}</div><div>${icon('people')}${t('peopleReady')} · ${t(state.conversation)}</div><div>${icon('wallet')}${budgetLabel()}</div><div>${icon('check')}${t(state.format==='walk'?'walkReady':'reserved')}</div></div></div><p class="micro" style="margin-top:12px">${t('sampleWarning')}</p>${notice(t('afterNote'))}<div class="actions">${button(t('venueDetails'),'meeting-details')}${button(t('cancelAttendance'),'cancel-attendance','text-button')}</div>`}
function failed(expired=false){const alt=state.activeDate===1&&state.dates.includes(2);return `${statusIcon('moon','empty')}${title(t(expired?'expiredTitle':state.failedReason==='venue'?'failedVenueTitle':'failedTitle'),t(expired?'expiredIntro':state.failedReason==='venue'?'failedVenueIntro':'failedIntro'),t('oneoff'))}<div class="deadline"><small>${t('closedDate')}</small><strong>${meetingDate()}</strong></div>${chips()}${alt?`<div class="section"><h2>${t('alternateTitle')}</h2><p class="intro">${t('alternateBody')}</p></div>`:notice(t('noAlternate'))}<div class="actions">${alt?button(t('alternate'),'alternate'):''}${button(t('newSearch'),'begin',alt?'secondary':'primary')}${button(t('returnHome'),'home','text-button')}</div>`}
function ended(cancelled){return `${statusIcon('check')}${title(t(cancelled?'cancelledTitle':'stoppedTitle'),t(cancelled?'cancelledIntro':'stoppedIntro'),t('oneoff'))}${notice(t('cancelledNote'))}<div class="actions">${button(t('newSearch'),'begin')}${button(t('returnHome'),'home','secondary')}</div>`}

const say = (pl,en) => host.language() === 'pl' ? pl : en;
const terminal = ['failed','expired','stopped','cancelled','completed'];
const statuses = ['searching','invitation','booking','confirmed',...terminal];
const screens = ['when','details','review',...statuses];
const storageKey = 'experience.unified.oneoff.v1';
let historyRecords = [];
let viewedHistory = null;
const allowed = {
  screen: screens, flow: ['home',...statuses], format: ['dinner','coffee','walk'],
  city: ['warsaw','krakow'], area: ['centre','wide'], time: ['18:00','19:00','20:00'],
  budget: ['60','100','150'], conversation: ['polish','english'], failedReason: ['people','venue']
};
function restore(saved) {
  const record = initial();
  for (const [key,values] of Object.entries(allowed)) if (values.includes(saved[key])) record[key] = saved[key];
  if (Array.isArray(saved.dates)) record.dates = [1,2].filter(d => saved.dates.includes(d));
  if ([1,2].includes(saved.activeDate)) record.activeDate = saved.activeDate;
  for (const key of ['arrived','late','followupReady','feedbackSaved']) record[key] = saved[key] === true;
  record.contacts = ['Alex','Sam','Robin'].filter(name => Array.isArray(saved.contacts) && saved.contacts.includes(name));
  if (Number.isSafeInteger(saved.recordId) && saved.recordId > 0) record.recordId = saved.recordId;
  return record;
}
// Restore only enumerated demo values, never arbitrary HTML from storage.
try {
  const saved = JSON.parse(sessionStorage.getItem(storageKey));
  if (saved) {
    state = restore(saved);
    if (Array.isArray(saved.historyRecords)) historyRecords = saved.historyRecords.filter(record => record && record.flow === 'completed').slice(-20).map(restore);
  }
} catch { /* Storage can be unavailable in private browsing. */ }
function persist() {
  if (state.flow === 'completed' && state.recordId) {
    const index = historyRecords.findIndex(record => record.recordId === state.recordId);
    const snapshot = {...state, contacts:[...(state.contacts || [])]};
    if (index < 0) historyRecords.push(snapshot); else historyRecords[index] = snapshot;
  }
  try { sessionStorage.setItem(storageKey, JSON.stringify({...state, historyRecords})); } catch {}
}
function refresh(preserveScroll = false) { persist(); host.refresh(preserveScroll); }
function go(screen) {
  viewedHistory = null;
  state.screen = screen;
  if (statuses.includes(screen)) state.flow = screen;
  persist(); host.navigate('oneoff');
}
function closeModal() { document.querySelector('#oneoff-dialog').close(); }
function modal(titleKey,bodyKey,confirmAction,confirmKey) {
  document.querySelector('#oneoff-dialog-content').innerHTML = '<h2 id="oneoff-dialog-title">'+t(titleKey)+'</h2><p>'+t(bodyKey)+'</p><div class="actions">'+button(t(confirmKey),confirmAction)+button(t('keep'),'close','secondary')+'</div>';
  document.querySelector('#oneoff-dialog').showModal();
}
function statusLabel() {
  const labels = {
    home: ['Wybierz format i termin','Choose a format and date'],
    searching: ['Szukamy osób','Finding people'], invitation: ['Zaproszenie · czeka na Ciebie','Invitation · your response needed'],
    booking: ['Potwierdzamy miejsce','Confirming the venue'], confirmed: ['Plan potwierdzony','Plan confirmed'],
    failed: ['Nie powstał plan','No plan this time'], expired: ['Zaproszenie wygasło','Invitation expired'],
    stopped: ['Wyszukiwanie zakończone','Search stopped'], cancelled: ['Udział odwołany','Attendance cancelled'],
    completed: ['Spotkanie zakończone','Meeting completed']
  };
  return say(...labels[state.flow]);
}
function entry() {
  const active = state.flow !== 'home';
  return '<div class="today-next-card oneoff-entry"><span>'+say('JEDNORAZOWE SPOTKANIE','ONE-OFF MEETING')+'</span><strong>'+ (active ? statusLabel() : say('Kolacja jutro?','Dinner tomorrow?')) +'</strong><p>'+ (active ? t(state.format)+' · '+meetingDate()+' · '+t(state.city) : say('Wybierz kolację, kawę lub spacer. Dobierzemy ludzi do tego planu — niezależnie od stałego kręgu.','Choose dinner, coffee or a walk. We’ll look for compatible people for that plan, independently of your regular circle.'))+'</p><button class="secondary" data-route="oneoff">'+say(active?'Otwórz jednorazowe spotkanie':'Chcę się spotkać',active?'Open one-off meeting':'I want to meet people')+'</button><small>'+say('Bez zmiany Twojego stałego kręgu. Termin nie jest gwarantowany.','Your regular circle stays unchanged. A meeting is not guaranteed.')+'</small></div>';
}
function history() {
  return historyRecords.map((record,index) => '<button class="history-card" data-oo-history="'+index+'"><span class="history-date">'+icon(record.format)+'</span><span class="history-copy"><b>'+say('Jednorazowe · ','One-off · ')+t(record.format)+'</b><small>'+dateLabel(record.activeDate)+' · '+record.time+' · '+t(record.city)+'</small></span><i>›</i></button>').join('');
}
function completed() {
  return title(say('Jak minęło spotkanie?','How was your meeting?'), say('Twój prywatny zapis. Stały krąg działa dalej — nie przenosimy do niego uczestników tej jednorazowej wizyty.','Your private record. Your regular circle continues — we do not add the people from this one-off meeting to it.'),t('oneoff')) + summary() +
    (state.feedbackSaved ? notice(say('Odpowiedź zapisana prywatnie w prototypie. Nie pokazujemy fikcyjnego wzajemnego kontaktu.','Your response is saved privately in this prototype. We do not invent a mutual connection.')) : state.followupReady ? '<h2>'+say('Chcesz pozostać w kontakcie?','Would you like to keep in touch?')+'</h2><p class="micro">'+say('Opcjonalnie. Tylko wzajemny wybór otworzy kontakt; inni nie widzą odmowy. Osoby poniżej to dane demo.','Optional. Only a mutual choice opens contact; others do not see a rejection. These are demo participants.')+'</p>'+['Alex','Sam','Robin'].map(name=>'<label class="oo-contact"><input type="checkbox" data-oo-contact="'+name+'" '+(state.contacts?.includes(name)?'checked':'')+'> '+name+'</label>').join('')+button(say('Zapisz prywatnie','Save privately'),'save-feedback') : notice(say('Wróć jutro. O kontakt zapytamy prywatnie po spotkaniu, bez głosowania przy stole.','Come back tomorrow. We’ll ask privately about staying in touch after the meeting, never at the table.'))) + '<div class="actions"><button class="secondary" data-route="account">'+say('Otwórz profil i historię','Open profile and history')+'</button></div>';
}
function simulation() {
  const s=state.screen;
  const controls = [
    ['sim-invite',say('Znaleziono osoby','People found'),s==='searching'],
    ['sim-ready',say('Miejsce potwierdzone','Venue confirmed'),s==='booking'],
    ['sim-fail',say('Za mało osób','Not enough people'),s==='searching'],
    ['sim-venue',say('Brak miejsca','No venue'),s==='booking'],
    ['sim-expire',say('Czas odpowiedzi minął','Response expired'),s==='invitation'],
    ['sim-finish',say('Spotkanie zakończone','Meeting finished'),s==='confirmed'],
    ['sim-followup',say('Następny dzień','Next day'),s==='completed'&&!state.followupReady],
    ['reset',say('Zresetuj tylko ten scenariusz','Reset only this scenario'),true]
  ];
  return '<details class="oo-simulation"><summary>'+say('Symulacja · tylko prototyp','Simulation · prototype only')+'</summary><p>'+say('Fikcyjna data: 13 września 2026. Przyciski zostaną usunięte z aplikacji.','Fictional date: 13 September 2026. These controls will be removed from the app.')+'</p><div>'+controls.filter(([, ,enabled])=>enabled).map(([action,label])=>button(label,action,'secondary')).join('')+'</div></details>';
}
function content() {
  if (viewedHistory !== null) {
    const current = state;
    state = historyRecords[viewedHistory];
    const html = title(say('Jednorazowe spotkanie','One-off meeting'),say('Zakończone · prywatna historia','Completed · private history')) + summary() + notice(say(state.feedbackSaved?'Twoja prywatna odpowiedź została zapisana.':'Odpowiedź po spotkaniu jest opcjonalna.',state.feedbackSaved?'Your private response was saved.':'Post-meeting feedback is optional.')) + '<div class="actions">'+button(say('Wróć do bieżącej sprawy','Back to current request'),'resume')+'<button class="secondary" data-route="account">'+say('Profil','Profile')+'</button></div>';
    state = current;
    return html;
  }
  const views = {when:whenScreen,details,review,searching,invitation,booking,confirmed,failed,expired:()=>failed(true),stopped:()=>ended(false),cancelled:()=>ended(true),completed};
  let html = (views[state.screen]||whenScreen)();
  if (state.screen==='confirmed') html += '<div class="actions">'+button(say(state.arrived?'Obecność zaznaczona':'Jestem na miejscu',state.arrived?'Arrival recorded':'I’m here'),'arrival','secondary',state.arrived)+button(say(state.late?'Spóźnienie zapisane':'Spóźnię się',state.late?'Delay recorded':'I’m running late'),'late','text-button',state.late)+'</div>';
  if (state.screen==='completed') html += '<div class="actions">'+button(t('newSearch'),'begin','secondary')+'</div>';
  return html + simulation() + '<dialog id="oneoff-dialog" class="oneoff-ui" aria-labelledby="oneoff-dialog-title"><div id="oneoff-dialog-content"></div></dialog>';
}
function handleChange(e) {
  const field=e.target.dataset.ooField;
  if (field && allowed[field]?.includes(e.target.value)) { state[field]=e.target.value; persist(); return true; }
  if (e.target.dataset.ooContact) {
    state.contacts = Array.from(document.querySelectorAll('[data-oo-contact]:checked')).map(input=>input.dataset.ooContact);
    persist(); return true;
  }
  return false;
}
function handleClick(e) {
  const b=e.target.closest('button'); if(!b||b.disabled)return false;
  if(b.dataset.ooHistory !== undefined) { const index=Number(b.dataset.ooHistory); if(historyRecords[index]) { viewedHistory=state.flow==='completed' && historyRecords[index].recordId===state.recordId ? null : index;host.navigate('oneoff'); } return true; }
  if(b.dataset.ooFormat){state.format=b.dataset.ooFormat;refresh(true);return true;}
  if(b.dataset.ooDate){const d=Number(b.dataset.ooDate);state.dates=state.dates.includes(d)?state.dates.filter(x=>x!==d):[...state.dates,d].sort();refresh(true);return true;}
  if(b.dataset.ooTime){state.time=b.dataset.ooTime;refresh(true);return true;}
  const action=b.dataset.ooAction; if(!action)return false;
  switch(action) {
    case'resume':viewedHistory=null;host.navigate('oneoff');break;
    case'home':host.navigate('home');break;
    case'begin':if(hasRequest())go(state.flow);else { state.flow='home';state.dates=[1];state.activeDate=1;go('when'); }break;
    case'back':if(state.screen==='when')host.navigate('plan');else go(state.screen==='details'?'when':'details');break;
    case'details':if(state.dates.length)go('details');break;
    case'review':go('review');break;
    case'search':state.recordId=undefined;state.activeDate=Math.min(...state.dates);state.arrived=false;state.late=false;state.followupReady=false;state.feedbackSaved=false;state.contacts=[];go('searching');break;
    case'edit-search':modal('modalEdit','modalEditBody','do-edit','yesEdit');break;
    case'do-edit':closeModal();state.flow='home';go('when');break;
    case'cancel-search':modal('modalCancelSearch','modalCancelSearchBody','do-stop','yesCancel');break;
    case'do-stop':closeModal();go('stopped');break;
    case'attend':go('booking');break;
    case'decline':go('stopped');break;
    case'cancel-attendance':modal('modalCancelAttend','modalCancelAttendBody','do-cancel','yesCancelAttend');break;
    case'do-cancel':closeModal();go('cancelled');break;
    case'close':closeModal();break;
    case'meeting-details':document.querySelector('#oneoff-dialog-content').innerHTML='<h2 id="oneoff-dialog-title">'+t('detailTitle')+'</h2><p>'+t(state.format==='walk'?'detailWalk':'detailBody')+'</p>'+button(t('close'),'close');document.querySelector('#oneoff-dialog').showModal();break;
    case'alternate':state.activeDate=2;go('searching');break;
    case'arrival':state.arrived=true;refresh(true);break;
    case'late':state.late=true;refresh(true);break;
    case'save-feedback':state.feedbackSaved=true;refresh();break;
    case'sim-invite':go('invitation');break;
    case'sim-ready':go('confirmed');break;
    case'sim-fail':state.failedReason='people';go('failed');break;
    case'sim-venue':state.failedReason='venue';go('failed');break;
    case'sim-expire':go('expired');break;
    case'sim-finish':state.recordId=Date.now();go('completed');break;
    case'sim-followup':state.followupReady=true;refresh();break;
    case'reset':state=initial();go('when');break;
  }
  return true;
}
return {content,entry,history,handleClick,handleChange,historyCount:()=>historyRecords.length,exitHistory:()=>{viewedHistory=null;}};
  }
};
