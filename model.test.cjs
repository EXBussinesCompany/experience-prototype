const { test } = require('node:test');
const assert = require('node:assert/strict');
const m = require('./model.js');

test('intent and company change recommendations, mood does not reveal personal state', () => {
  const s = m.initialState();
  assert.ok(m.recommend(s).some(e => e.id === 'coffee'));
  s.intent = 'deep';
  assert.deepEqual(m.recommend(s).map(e => e.id), ['deep']);
  s.company = 'one';
  assert.deepEqual(m.recommend(s).map(e => e.id), ['one-deep']);
  const ids = m.recommend(s).map(e => e.id);
  s.energy = 'low';
  assert.deepEqual(m.recommend(s).map(e => e.id), ids);
});

test('venue and person exclusions are never relaxed', () => {
  const s = m.initialState();
  s.excludedVenues = ['garden'];
  assert.ok(m.recommend(s, { broadenAge: true }).every(e => e.venue !== 'garden'));
  s.blockedPeople = ['marta'];
  assert.ok(m.recommend(s, { broadenAge: true }).every(e => !e.people.includes('marta')));
});

test('budget, language, timing and boundaries are real filters', () => {
  const s = m.initialState();
  s.budget = 0;
  assert.deepEqual(m.recommend(s), []);
  s.when = 'now';
  assert.deepEqual(m.recommend(s).map(e => e.id), ['walk']);
  s.budget = 50;
  s.when = 'planned';
  s.language = 'en';
  assert.deepEqual(m.recommend(s).map(e => e.id), ['coffee-en']);
  s.language = 'pl';
  s.when = 'now';
  assert.deepEqual(m.recommend(s).map(e => e.id), ['walk', 'quick-coffee']);
  assert.equal(m.eligible(s, { ...m.eventById('walk'), public:false }), false);
});

test('deep conversations require consent even if the setup screen is bypassed', () => {
  const s = m.initialState();
  s.intent = 'deep';
  assert.equal(m.confirmBooking(s, 'deep'), false);
  s.listen = true;
  assert.equal(m.confirmBooking(s, 'deep'), true);
});

test('wider age range requires an explicit alternative choice', () => {
  const s = m.initialState();
  s.age = '45–60';
  assert.equal(m.recommend(s).length, 0);
  assert.ok(m.recommend(s, { broadenAge: true }).length > 0);
});

test('a quieter-place preference changes the next selection', () => {
  const s = m.initialState();
  s.when = 'now';
  s.preferences.quieter = true;
  assert.deepEqual(m.recommend(s).map(e => e.id), ['walk']);
  s.preferences.quieter = false;
  assert.deepEqual(m.recommend(s).map(e => e.id), ['walk', 'quick-coffee']);
});

test('negative, unsafe, missing and skipped feedback never claim a success', () => {
  for (const feedback of [{ happened: 'Нет' }, { safe: 'Нет' }, { need: 'Нет' }, {}]) {
    assert.notEqual(m.feedbackOutcome(feedback).kind, 'success');
  }
  assert.equal(m.feedbackOutcome({ happened: 'Да', safe: 'Да', need: 'Да' }).kind, 'success');
});

test('last-minute holds expire and unavailable seats cannot be reserved', () => {
  const s = m.initialState();
  assert.equal(m.holdSeat(s, 'walk', 1000), true);
  assert.equal(m.confirmBooking(s, 'walk', 121001), false);
  assert.equal(s.bookings.length, 0);
  s.unavailable = ['walk'];
  assert.equal(m.holdSeat(s, 'walk', 200000), false);
});

test('confirmation is idempotent and cancellation releases the demo place', () => {
  const s = m.initialState();
  assert.equal(m.holdSeat(s, 'walk', 1000), true);
  assert.equal(m.confirmBooking(s, 'walk', 2000), true);
  assert.equal(m.confirmBooking(s, 'walk', 2001), true);
  assert.equal(s.bookings.length, 1);
  assert.equal(m.cancelBooking(s, 'walk'), true);
  assert.equal(s.bookings[0].status, 'cancelled');
  assert.equal(s.hold, null);
});
