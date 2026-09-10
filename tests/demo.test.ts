import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  journeyStatus,
  orderDisplay,
  makeOrder,
  validApproval,
  canCompleteSignup,
  type Approval,
} from '../lib/demo.ts';
const base = {
  cart: { tomato: 1 },
  connected: false,
  drink: '',
  visit: 'visit-1',
  store: 0,
  orders: [],
  note: '',
  time: '12:00',
};
void test('Guest can order without app or university connection', () => {
  const order = makeOrder(base);
  assert.equal(order.total, 15000);
  assert.equal(order.benefit, false);
  assert.equal(order.items.length, 1);
});
void test('Affiliated main order adds exactly one zero-price service item', () => {
  const order = makeOrder({
    ...base,
    cart: { tomato: 2, lemon: 1 },
    connected: true,
    drink: 'tea',
  });
  assert.equal(order.total, 34500);
  assert.equal(order.items.filter((i) => i.benefit).length, 1);
  assert.deepEqual(order.items.at(-1), {
    name: '복숭아 아이스티',
    qty: 1,
    price: 0,
    benefit: true,
  });
});
void test('Side-only order does not qualify even with university connection', () => {
  const order = makeOrder({
    ...base,
    cart: { bread: 1 },
    connected: true,
    drink: 'lemon',
  });
  assert.equal(order.benefit, false);
  assert.equal(order.total, 5000);
  assert.equal(order.items.length, 1);
});
void test('Qualified orders require a valid free drink selection', () => {
  assert.throws(() => makeOrder({ ...base, connected: true }), /무료 음료/);
  assert.throws(
    () => makeOrder({ ...base, connected: true, drink: 'tomato' }),
    /무료 음료/,
  );
});
void test('Approval must be current and bound to this exact browser visit', () => {
  const approval: Approval = {
    id: 'req1',
    visit: 'chrome-store1',
    createdAt: 1000,
    status: 'approved',
  };
  assert.equal(validApproval(approval, 'chrome-store1', 2000), true);
  assert.equal(validApproval(approval, 'safari-store2', 2000), false);
  assert.equal(validApproval(approval, 'chrome-store1', 301001), false);
  assert.equal(
    validApproval({ ...approval, status: 'cancelled' }, 'chrome-store1', 2000),
    false,
  );
  assert.equal(
    validApproval({ ...approval, status: 'pending' }, 'chrome-store1', 2000),
    false,
  );
});
void test('Retrying an already submitted visit cannot create duplicate POS order', () => {
  const order = makeOrder(base);
  assert.throws(() => makeOrder({ ...base, orders: [order] }), /이미 접수/);
});
void test('Invalid quantity and empty orders are rejected', () => {
  assert.throws(() => makeOrder({ ...base, cart: {} }), /메뉴를 먼저/);
  for (const qty of [-1, 0.5, 21])
    assert.throws(() => makeOrder({ ...base, cart: { tomato: qty } }), /수량/);
});
void test('Different store visit reuses membership but requires its own connection', () => {
  const first = makeOrder({ ...base, connected: true, drink: 'lemon' });
  const second = makeOrder({
    ...base,
    visit: 'visit-2',
    store: 1,
    orders: [first],
  });
  assert.equal(second.benefit, false);
  assert.equal(second.store, 1);
  const approvedSecond = makeOrder({
    ...base,
    visit: 'visit-2',
    store: 1,
    orders: [first],
    connected: true,
    drink: 'tea',
  });
  assert.equal(approvedSecond.benefit, true);
  assert.equal(approvedSecond.id, '1002');
});

void test('Guest receipt skips affiliation approval instead of showing it complete', () => {
  assert.equal(journeyStatus(2, 4, false), 'skipped');
  assert.equal(journeyStatus(2, 4, true), 'done');
  assert.equal(journeyStatus(3, 4, false), 'done');
});
void test('Cancelled and fulfilled receipts show the right amount meaning and POS action', () => {
  assert.equal(orderDisplay('cancelled').amountLabel, '취소된 주문 금액');
  assert.match(orderDisplay('cancelled').amountNote, /결제할 금액이 없습니다/);
  assert.equal(orderDisplay('cancelled').posAction, '매장 POS에서 내역 보기');
  assert.equal(orderDisplay('done').posAction, '매장 POS에서 내역 보기');
  assert.equal(orderDisplay('new').posAction, '매장 POS에서 접수하기');
});

void test('Signup cannot complete without successful student ID verification', () => {
  for (const status of ['empty', 'ready', 'checking', 'rejected'])
    assert.equal(canCompleteSignup(true, '123456', status), false);
  assert.equal(canCompleteSignup(false, '123456', 'verified'), false);
  assert.equal(canCompleteSignup(true, '12345', 'verified'), false);
  assert.equal(canCompleteSignup(true, '123456', 'verified'), true);
});
