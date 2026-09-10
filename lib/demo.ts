export const STORES = [
  '파스타룸 성수점',
  '파스타룸 건대점',
  '리틀키친',
  '오후식탁',
  '파스타룸 신촌점',
  '테이블오브',
  '포크앤플레이트',
  '스푼하우스',
  '파스타룸 대학로점',
  '오늘의 식탁',
];
export const MENU = [
  {
    id: 'tomato',
    name: '시그니처 토마토 파스타',
    description: '오래 끓인 토마토 소스와 그라나 파다노',
    price: 15000,
    category: '메인',
    tag: 'BEST',
  },
  {
    id: 'cream',
    name: '버섯 크림 리조또',
    description: '구운 버섯, 진한 크림, 트러플 오일',
    price: 16000,
    category: '메인',
    tag: '',
  },
  {
    id: 'oil',
    name: '쉬림프 알리오 올리오',
    description: '탱글한 새우와 마늘 향을 담은 오일 파스타',
    price: 15000,
    category: '메인',
    tag: '',
  },
  {
    id: 'bread',
    name: '갈릭 브레드',
    description: '바삭하게 구운 마늘빵 4조각',
    price: 5000,
    category: '사이드',
    tag: '',
  },
  {
    id: 'lemon',
    name: '레몬 에이드',
    description: '직접 만든 레몬청과 탄산수',
    price: 4500,
    category: '음료',
    tag: '',
  },
  {
    id: 'tea',
    name: '복숭아 아이스티',
    description: '달콤하고 시원한 복숭아 홍차',
    price: 3500,
    category: '음료',
    tag: '',
  },
] as const;
export type Cart = Record<string, number>;
export type Approval = {
  id: string;
  visit: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'cancelled';
};
export type OrderStatus = 'new' | 'cooking' | 'done' | 'cancelled';
export type Order = {
  id: string;
  visit: string;
  store: number;
  table: number;
  items: { name: string; qty: number; price: number; benefit: boolean }[];
  total: number;
  benefit: boolean;
  status: OrderStatus;
  time: string;
  note: string;
};
export function total(cart: Cart) {
  return MENU.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
}
export function itemCount(cart: Cart) {
  return Object.values(cart).reduce((sum, count) => sum + count, 0);
}
export function eligible(cart: Cart) {
  return MENU.some(
    (item) => item.category === '메인' && (cart[item.id] || 0) > 0,
  );
}
export function validApproval(
  request: Approval | null,
  visit: string,
  now: number,
) {
  return (
    !!request &&
    request.status === 'approved' &&
    request.visit === visit &&
    now >= request.createdAt &&
    now - request.createdAt <= 300000
  );
}
export function makeOrder(input: {
  cart: Cart;
  connected: boolean;
  drink: string;
  visit: string;
  store: number;
  orders: Order[];
  note: string;
  time: string;
}): Order {
  if (!itemCount(input.cart)) throw new Error('메뉴를 먼저 선택해주세요.');
  for (const [id, qty] of Object.entries(input.cart)) {
    if (
      !MENU.some((item) => item.id === id) ||
      !Number.isInteger(qty) ||
      qty < 0 ||
      qty > 20
    )
      throw new Error('메뉴 수량을 확인해주세요.');
  }
  if (input.orders.some((order) => order.visit === input.visit))
    throw new Error('이미 접수된 주문입니다.');
  const benefit = input.connected && eligible(input.cart);
  if (benefit && !['lemon', 'tea'].includes(input.drink))
    throw new Error('무료 음료를 선택해주세요.');
  const items: Order['items'] = MENU.filter(
    (item) => input.cart[item.id] > 0,
  ).map((item) => ({
    name: item.name,
    qty: input.cart[item.id],
    price: item.price,
    benefit: false,
  }));
  if (benefit)
    items.push({
      name: MENU.find((item) => item.id === input.drink)!.name,
      qty: 1,
      price: 0,
      benefit: true,
    });
  return {
    id: String(1001 + input.orders.length),
    visit: input.visit,
    store: input.store,
    table: 5,
    items,
    total: total(input.cart),
    benefit,
    status: 'new',
    time: input.time,
    note: input.note.trim().slice(0, 100),
  };
}

export function journeyStatus(
  index: number,
  stage: number,
  connected: boolean,
) {
  if (index === 2 && stage === 4 && !connected) return 'skipped';
  return index === stage ? 'active' : index < stage ? 'done' : 'upcoming';
}
export function orderDisplay(status: OrderStatus) {
  return {
    amountLabel:
      status === 'cancelled' ? '취소된 주문 금액' : '매장 결제 예정 금액',
    posAction:
      status === 'new'
        ? '매장 POS에서 접수하기'
        : status === 'cooking'
          ? '매장 POS에서 조리 확인'
          : '매장 POS에서 내역 보기',
    amountNote:
      status === 'cancelled'
        ? '취소된 주문으로, 결제할 금액이 없습니다.'
        : '실제 결제 없이 주문 흐름만 체험합니다.',
  };
}

export function canCompleteSignup(
  phoneVerified: boolean,
  otp: string,
  studentCard: string,
) {
  return phoneVerified && otp.length === 6 && studentCard === 'verified';
}
