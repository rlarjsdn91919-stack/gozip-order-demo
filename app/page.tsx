'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Link2,
  RotateCcw,
  Smartphone,
  Monitor,
  Plus,
  Minus,
  ShoppingBag,
  GraduationCap,
  Check,
  Signal,
  BatteryFull,
  LockKeyhole,
  UtensilsCrossed,
  Radio,
  Globe,
  ChevronLeft,
  ScanLine,
  Nfc,
  ShieldCheck,
  ScanFace,
  X,
  CircleCheck,
  Clock3,
  ChefHat,
  ReceiptText,
  Gift,
  LoaderCircle,
  Info,
  CalendarDays,
  Upload,
  ScanText,
  PencilLine,
  Save,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  STORES,
  MENU,
  total,
  itemCount,
  eligible,
  validApproval,
  makeOrder,
  journeyStatus,
  orderDisplay,
  canCompleteSignup,
  type Cart,
  type Approval,
  type Order,
  type OrderStatus,
} from '@/lib/demo';
const won = (value: number) => value.toLocaleString('ko-KR') + '원';
const PROFILE_KEY = 'campus-link-demo-member-v1';
let memoryMember = false;
function readMember() {
  try {
    return localStorage.getItem(PROFILE_KEY) === 'verified';
  } catch {
    return memoryMember;
  }
}
function subscribeMember(listener: () => void) {
  window.addEventListener('storage', listener);
  window.addEventListener('campus-demo-profile', listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener('campus-demo-profile', listener);
  };
}
function writeMember(value: boolean) {
  memoryMember = value;
  try {
    if (value) localStorage.setItem(PROFILE_KEY, 'verified');
    else localStorage.removeItem(PROFILE_KEY);
  } catch {}
  window.dispatchEvent(new Event('campus-demo-profile'));
}
type Phase =
  | 'tag'
  | 'menu'
  | 'login'
  | 'signup'
  | 'signupComplete'
  | 'verify'
  | 'biometric'
  | 'approved'
  | 'authError'
  | 'receipt';
type ActivityEvent = { title: string; detail: string; time: string };
type TimetableStep = 'upload' | 'reading' | 'review' | 'done';
type TimetableCourse = {
  id: number;
  name: string;
  days: string;
  time: string;
  room: string;
};
const SAMPLE_TIMETABLE: TimetableCourse[] = [
  {
    id: 1,
    name: '데이터베이스',
    days: '월·수',
    time: '10:30-11:45',
    room: '제3공학관 201호',
  },
  {
    id: 2,
    name: '마케팅원론',
    days: '화·목',
    time: '13:00-14:15',
    room: '경상관 305호',
  },
  {
    id: 3,
    name: 'UX 디자인',
    days: '금',
    time: '09:00-11:45',
    room: '디자인문화관 401호',
  },
];
const timeNow = () =>
  new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
const notes = [
  [
    '태그를 찍으면, 메뉴판이 열려요.',
    '앱 없이 메뉴를 보고 주문할 수 있습니다. 제휴를 원할 때만 연결 버튼을 누르세요.',
  ],
  [
    '주문도 가입도 웹에서 이어져요.',
    '메뉴를 담은 뒤 제휴를 연결해보세요. 회원가입 웹페이지를 다녀와도 장바구니는 그대로 유지됩니다.',
  ],
  [
    '한 번 인증한 대학 자격을 다시 사용해요.',
    '첫 가입에는 휴대폰 확인과 필수 학생증 인증, 다음 방문에는 이번 연결만 승인합니다.',
  ],
  [
    '원래 주문으로, 혜택과 함께 돌아와요.',
    '메인 메뉴를 담으면 무료 음료 1잔을 선택할 수 있어요. 혜택을 선택하고 주문을 마무리하세요.',
  ],
  [
    '서비스 메뉴까지, 하나의 주문으로.',
    '매장에서 접수 → 조리·제공 완료를 눌러보세요. 고객의 주문 상태도 함께 바뀝니다.',
  ],
];
function DrinkChoice({
  drink,
  setDrink,
  disabled = false,
}: {
  disabled?: boolean;
  drink: string;
  setDrink: (value: string) => void;
}) {
  return (
    <div className="drink-box">
      <div className="drink-heading">
        <Gift size={17} />
        <strong>제휴 음료 1잔을 골라주세요</strong>
        <span>FREE</span>
      </div>
      <RadioGroup
        aria-label="제휴 무료 음료 선택"
        value={drink}
        onValueChange={(v) => setDrink(String(v))}
        className="drink-choices"
      >
        {['lemon', 'tea'].map((id) => {
          const item = MENU.find((m) => m.id === id)!;
          return (
            <label
              className={
                drink === id ? 'drink-option selected' : 'drink-option'
              }
              key={id}
            >
              <RadioGroupItem value={id} disabled={disabled} />
              <span>{item.name}</span>
              <span>
                <del>{won(item.price)}</del>
                <b>0원</b>
              </span>
            </label>
          );
        })}
      </RadioGroup>
      <p>메인 메뉴 주문 시, 주문당 1잔 제공</p>
    </div>
  );
}
export default function Home() {
  const [store, setStore] = useState('0');
  const [browser, setBrowser] = useState('Chrome');
  const [cart, setCart] = useState<Cart>({});
  const [category, setCategory] = useState('전체');
  const [phase, setPhase] = useState<Phase>('tag');
  const member = useSyncExternalStore(subscribeMember, readMember, () => false);
  const [connected, setConnected] = useState(false);
  const [visit, setVisit] = useState('initial-visit');
  const [request, setRequest] = useState<Approval | null>(null);
  const [drink, setDrink] = useState('');
  const [consent, setConsent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [studentCard, setStudentCard] = useState<
    'empty' | 'ready' | 'checking' | 'rejected' | 'verified'
  >('empty');
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [timetableStep, setTimetableStep] = useState<TimetableStep>('upload');
  const [timetableFile, setTimetableFile] = useState('');
  const [timetableCourses, setTimetableCourses] =
    useState<TimetableCourse[]>(SAMPLE_TIMETABLE);
  const [timetableError, setTimetableError] = useState('');
  const [pendingVisit, setPendingVisit] = useState<{
    store: string;
    browser: string;
  } | null>(null);
  const [note, setNote] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [posTab, setPosTab] = useState('new');
  const [notice, setNotice] = useState('');
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ocrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orderLock = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inApp = [
    'login',
    'signup',
    'signupComplete',
    'verify',
    'biometric',
    'approved',
    'authError',
  ].includes(phase);
  const stage =
    phase === 'tag'
      ? 0
      : phase === 'receipt'
        ? 4
        : inApp
          ? 2
          : connected
            ? 3
            : 1;
  const selectedStore = STORES[Number(store)];
  const storeOrders = orders.filter((order) => order.store === Number(store));
  const currentOrder = orders.find((order) => order.id === currentOrderId);
  const benefitAvailable = connected && eligible(cart);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (ocrTimer.current) clearTimeout(ocrTimer.current);
    };
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [phase]);
  function log(title: string, detail: string) {
    setEvents((v) => [{ title, detail, time: timeNow() }, ...v].slice(0, 8));
  }
  function changeQty(id: string, delta: number) {
    setCart((c) => ({
      ...c,
      [id]: Math.min(20, Math.max(0, (c[id] || 0) + delta)),
    }));
    setNotice('');
  }
  function requestVisit(nextStore: string, nextBrowser: string) {
    if (nextStore === store && nextBrowser === browser) return;
    if (
      phase !== 'receipt' &&
      (itemCount(cart) > 0 || !!note.trim() || connected)
    ) {
      setPendingVisit({ store: nextStore, browser: nextBrowser });
      return;
    }
    newVisit(nextStore, nextBrowser);
  }
  function newVisit(nextStore = store, nextBrowser = browser, start = false) {
    setPendingVisit(null);
    if (timer.current) clearTimeout(timer.current);
    setStore(nextStore);
    setBrowser(nextBrowser);
    setCart({});
    setPhase(start ? 'menu' : 'tag');
    setConnected(false);
    setRequest(null);
    setDrink('');
    setVisit(crypto.randomUUID());
    setBusy(false);
    setCheckout(false);
    setNote('');
    setCurrentOrderId('');
    setNotice('');
    setCategory('전체');
    setPosTab('new');
    orderLock.current = false;
    log(
      '새로운 방문을 시작했어요',
      `${STORES[Number(nextStore)]} · ${nextBrowser}${member ? ' · 기존 대학 인증 유지' : ''}`,
    );
  }
  function tag(method: string) {
    setVisit(crypto.randomUUID());
    setPhase('menu');
    setNotice('');
    log(
      `${method}으로 메뉴판을 열었어요`,
      `${selectedStore} · 테이블 5 · ${browser}`,
    );
  }
  function openApp(newMember = false) {
    if (newMember) {
      writeMember(false);
      setConnected(false);
      setDrink('');
    }
    setPhoneVerified(false);
    setOtp('');
    setStudentCard('empty');
    setCheckout(false);
    setNotice('');
    setConsent(false);
    const next: Approval = {
      id: crypto.randomUUID(),
      visit,
      createdAt: Date.now(),
      status: 'pending',
    };
    setRequest(next);
    setPhase(member && !newMember ? 'biometric' : 'login');
    log(
      '제휴 연결 요청을 만들었어요',
      `${selectedStore} · 현재 ${browser} 주문에 연결`,
    );
  }
  function cancelAuth() {
    if (timer.current) clearTimeout(timer.current);
    setBusy(false);
    setRequest((r) => (r ? { ...r, status: 'cancelled' } : null));
    setPhase('menu');
    setNotice('연결을 취소했어요. 담아둔 메뉴는 그대로예요.');
    log('제휴 연결을 취소했어요', '일반 주문은 계속할 수 있어요.');
  }
  function checkStudentCard() {
    if (busy) return;
    setBusy(true);
    setStudentCard('checking');
    timer.current = setTimeout(() => {
      setBusy(false);
      setStudentCard('verified');
      setPhase('signup');
      log(
        '학생증을 촬영하고 정보를 추출했어요',
        '학교·캠퍼스·학번·이름 OCR 완료 · 데모',
      );
    }, 950);
  }
  function completeSignup() {
    if (!canCompleteSignup(phoneVerified, otp, studentCard)) return;
    writeMember(true);
    setRequest((r) => (r ? { ...r, status: 'approved' } : r));
    setConnected(true);
    setPhase('menu');
    setNotice('회원가입이 완료됐어요. 제휴가 연결된 메뉴판으로 돌아왔습니다.');
    log(
      '회원가입을 완료하고 메뉴판으로 돌아왔어요',
      `${selectedStore} · 테이블 5 · 김캠퍼스 · 캠퍼스대학교`,
    );
  }
  function approve() {
    if (busy || !member || (phase === 'signupComplete' && !consent)) return;
    if (
      !request ||
      request.visit !== visit ||
      request.status !== 'pending' ||
      Date.now() - request.createdAt > 300000
    ) {
      setPhase('authError');
      return;
    }
    setBusy(true);
    const requestId = request.id;
    timer.current = setTimeout(() => {
      if (Date.now() - request.createdAt > 300000) {
        setBusy(false);
        setPhase('authError');
        return;
      }
      setRequest((r) =>
        r?.id === requestId ? { ...r, status: 'approved' } : r,
      );
      setBusy(false);
      setPhase('approved');
      log(
        phase === 'signupComplete'
          ? '새 회원의 제휴 연결을 승인했어요'
          : '기존 회원의 연결 승인 체험을 완료했어요',
        '학생증으로 확인된 대학 자격을 이번 주문에 연결해요.',
      );
    }, 850);
  }
  function returnToWeb() {
    if (!validApproval(request, visit, Date.now())) {
      setPhase('authError');
      return;
    }
    setConnected(true);
    setPhase('menu');
    setNotice('캠퍼스대학교 제휴가 연결됐어요. 주문을 이어가세요.');
    log(
      '원래 웹 주문에 혜택을 연결했어요',
      `${browser} · 장바구니 ${itemCount(cart)}개 유지`,
    );
  }
  function submitOrder() {
    if (busy || orderLock.current) return;
    try {
      const order = makeOrder({
        cart,
        connected,
        drink,
        visit,
        store: Number(store),
        orders,
        note,
        time: timeNow(),
      });
      orderLock.current = true;
      setBusy(true);
      setNotice('');
      timer.current = setTimeout(() => {
        setOrders((v) => [order, ...v]);
        setCurrentOrderId(order.id);
        setCheckout(false);
        setPhase('receipt');
        setBusy(false);
        setPosTab('new');
        log(
          'POS에 주문이 도착했어요',
          `#${order.id} · ${won(order.total)}${order.benefit ? ' · 제휴 음료 1잔 포함' : ' · 일반 주문'}`,
        );
      }, 650);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : '주문을 확인해주세요.',
      );
      if (benefitAvailable && !drink)
        document
          .querySelector<HTMLElement>(
            ".checkout-dialog [data-slot='radio-group-item']",
          )
          ?.focus();
    }
  }
  function updateOrder(id: string, status: OrderStatus) {
    setOrders((v) =>
      v.map((order) => (order.id === id ? { ...order, status } : order)),
    );
    setPosTab(status === 'cancelled' ? 'done' : status);
    log(
      status === 'cooking'
        ? '매장에서 주문을 접수했어요'
        : status === 'done'
          ? '음식 제공을 완료했어요'
          : '매장에서 주문을 취소했어요',
      `#${id} · ${status === 'cooking' ? '조리 중' : status === 'done' ? '제공 완료' : '취소 완료'}`,
    );
  }
  function reset() {
    writeMember(false);
    setOrders([]);
    setEvents([]);
    setResetOpen(false);
    newVisit('0', 'Chrome');
    setEvents([]);
    setTimetableOpen(false);
    setTimetableStep('upload');
    setTimetableFile('');
    setTimetableCourses(SAMPLE_TIMETABLE);
  }
  function startTimetableOcr(fileName = '에브리타임_시간표.png') {
    if (ocrTimer.current) clearTimeout(ocrTimer.current);
    setTimetableFile(fileName);
    setTimetableError('');
    setTimetableStep('reading');
    ocrTimer.current = setTimeout(() => {
      setTimetableCourses(SAMPLE_TIMETABLE.map((course) => ({ ...course })));
      setTimetableStep('review');
    }, 900);
  }
  function updateTimetableCourse(
    id: number,
    field: keyof Omit<TimetableCourse, 'id'>,
    value: string,
  ) {
    setTimetableError('');
    setTimetableCourses((courses) =>
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course,
      ),
    );
  }
  function saveTimetable() {
    const labels = { name: '과목명', days: '요일', time: '시간' } as const;
    const missing = timetableCourses
      .flatMap((course) =>
        (Object.keys(labels) as (keyof typeof labels)[]).map((field) => ({
          course,
          field,
        })),
      )
      .find(({ course, field }) => !course[field].trim());
    if (missing) {
      setTimetableError(
        `수업 ${missing.course.id}의 ${labels[missing.field]}을 입력해주세요.`,
      );
      document
        .getElementById(`course-${missing.course.id}-${missing.field}`)
        ?.focus();
      return;
    }
    setTimetableStep('done');
    log(
      '시간표를 저장했어요',
      `스크린샷 OCR 결과 · ${timetableCourses.length}개 수업`,
    );
  }
  const visibleOrders = storeOrders.filter((o) =>
    posTab === 'done'
      ? ['done', 'cancelled'].includes(o.status)
      : o.status === posTab,
  );

  return (
    <main className="demo-shell">
      <a className="skip-link" href="#workspace">
        체험 화면으로 건너뛰기
      </a>
      <header className="masthead">
        <Link href="/" className="wordmark" translate="no">
          <span className="brand-icon">
            <Link2 size={23} />
          </span>
          Go<span className="brand-light">.zip</span>
        </Link>
        <div className="demo-badge">
          INTERACTIVE DEMO
        </div>
        <div className="header-actions">
          <button
            className="text-button timetable-button"
            onClick={() => setTimetableOpen(true)}
          >
            <CalendarDays size={17} />
            <span>시간표 가져오기</span>
          </button>
          <button
            className="text-button info-button"
            onClick={() => setInfoOpen(true)}
            aria-label="데모 안내"
          >
            <Info size={17} />
          </button>
          <button className="text-button" onClick={() => setResetOpen(true)}>
            <RotateCcw size={16} />
            처음부터
          </button>
        </div>
      </header>
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">고집 · 매장 주문</p>
          <h1>
            웹 주문부터 매장 접수까지<span>.</span>
          </h1>
        </div>
        <p className="demo-disclaimer">
          직접 눌러보는 제휴 주문 시뮬레이션
          <br />
          <span>실제 인증·결제·POS 전송은 발생하지 않습니다.</span>
        </p>
      </div>
      <div className="journey">
        {[
          'NFC·QR 열기',
          '웹에서 메뉴 선택',
          '웹에서 회원가입·연결',
          connected ? '웹으로 돌아와 주문' : '웹에서 주문 완료',
          'POS 접수·제공',
        ].map((label, i) => (
          <div
            className={`journey-step ${journeyStatus(i, stage, connected)}`}
            key={label}
            aria-current={i === stage ? 'step' : undefined}
          >
            <span className="step-number">
              {journeyStatus(i, stage, connected) === 'skipped' ? (
                <Minus size={13} />
              ) : i < stage ? (
                <Check size={13} />
              ) : (
                <>0{i + 1}</>
              )}
            </span>
            <span>
              {label}
              {journeyStatus(i, stage, connected) === 'skipped' && (
                <small className="step-skipped">건너뜀</small>
              )}
            </span>
            {i < 4 && <ArrowRight size={15} />}
          </div>
        ))}
      </div>
      <div className="mobile-demo-note">
        데모 · 실제 앱/Face ID/POS를 연결하지 않습니다.
      </div>
      <div className="workspace-grid" id="workspace">
        <section className="customer-column" aria-label="고객 주문 화면">
          <div className="panel-label">
            <span>
              <Smartphone size={16} />
              고객 화면
            </span>
            <span className="caption">
              {inApp ? 'WEB SIGNUP SIMULATION' : 'WEB ORDER'}
            </span>
          </div>
          <div className="scenario-controls">
            <Select
              value={store}
              disabled={inApp || busy}
              onValueChange={(v) => {
                if (v !== null) requestVisit(String(v), browser);
              }}
            >
              <SelectTrigger aria-label="데모 매장 선택">
                <SelectValue>
                  {Number(store) + 1}호점 · {selectedStore}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STORES.map((name, i) => (
                  <SelectItem value={String(i)} key={name}>
                    {i + 1}호점 · {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={browser}
              disabled={inApp || busy}
              onValueChange={(v) => {
                if (v !== null) requestVisit(store, String(v));
              }}
            >
              <SelectTrigger aria-label="브라우저 시뮬레이션">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Chrome', 'Safari', '앱 내 브라우저'].map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className={`phone-frame ${inApp ? 'app-mode' : ''}`}>
            <div className="phone-status">
              <span>9:41</span>
              <span className="island" />
              <div>
                <Signal size={15} />
                <BatteryFull size={20} />
              </div>
            </div>
            {inApp ? (
              <div className="app-topbar">
                <button
                  aria-label="인증 취소하고 메뉴판으로 돌아가기"
                  onClick={cancelAuth}
                >
                  <ChevronLeft size={19} />
                </button>
                <span translate="no">
                  <Link2 size={16} />
                  Go.zip
                </span>
                <span className="app-demo-label">회원가입 웹</span>
              </div>
            ) : (
              <div className="browser-bar">
                <ChevronLeft size={16} />
                <span>
                  <LockKeyhole size={12} />
                  go.zip.order
                </span>
                <Globe size={16} />
              </div>
            )}
            <div className="phone-scroll" ref={scrollRef}>
              {phase === 'tag' && (
                <div className="tag-screen">
                  <div className="tag-photo">
                    <Image
                      priority
                      unoptimized
                      width={1200}
                      height={1800}
                      src="/pasta.jpg"
                      alt="토마토와 치즈를 올린 파스타"
                    />
                    <span>TABLE 05</span>
                  </div>
                  <div className="tag-content">
                    <p className="eyebrow">WELCOME TO THE TABLE</p>
                    <h2>{selectedStore}</h2>
                    <p>
                      좋아하는 메뉴를 고르고
                      <br />
                      테이블에서 편하게 주문하세요.
                    </p>
                    <div className="tag-card">
                      <Nfc size={38} />
                      <div>
                        <strong>휴대폰으로 태그해보세요</strong>
                        <span>아래 버튼으로 NFC·QR을 체험합니다.</span>
                      </div>
                    </div>
                    <button
                      className="primary-button centered"
                      onClick={() => tag('NFC 태깅')}
                    >
                      <Nfc size={19} />
                      NFC 태깅하고 메뉴판 열기
                      <ArrowRight size={18} />
                    </button>
                    <button
                      className="secondary-button centered"
                      onClick={() => tag('QR 스캔')}
                    >
                      <ScanLine size={19} />
                      QR 스캔으로 열기
                    </button>
                    <div className="tag-login-note">
                      <LockKeyhole size={13} />
                      로그인 없이 메뉴를 보고 주문할 수 있어요.
                    </div>
                  </div>
                </div>
              )}
              {phase === 'menu' && (
                <>
                  <div className="restaurant-hero">
                    <Image
                      unoptimized
                      width={1200}
                      height={1800}
                      src="/pasta.jpg"
                      alt="토마토와 치즈를 올린 파스타"
                    />
                    <div className="hero-shade" />
                    <div className="table-chip">TABLE 05</div>
                    <div className="restaurant-name">
                      <p>이탈리아 음식 · 대학 제휴 매장</p>
                      <h2>{selectedStore}</h2>
                      <span>
                        <span className="green-dot" />
                        영업 중 · 테이블 5에서 주문
                      </span>
                    </div>
                  </div>
                  <div className="menu-body">
                    {connected ? (
                      <div className="connected-banner">
                        <span className="benefit-icon">
                          <ShieldCheck size={22} />
                        </span>
                        <span>
                          <strong>캠퍼스대학교 제휴 연결 완료</strong>
                          <small>메인 메뉴 주문 시 음료 1잔 무료</small>
                        </span>
                        <Check size={19} />
                      </div>
                    ) : (
                      <button
                        className="benefit-banner"
                        onClick={() => openApp()}
                      >
                        <span className="benefit-icon">
                          <GraduationCap size={22} />
                        </span>
                        <span>
                          <strong>대학생이라면, 음료 한 잔 무료</strong>
                          <small>제휴 연결하기 · 웹에서 가입/승인</small>
                        </span>
                        <ArrowUpRight size={21} />
                      </button>
                    )}
                    {notice && (
                      <output className="inline-notice">{notice}</output>
                    )}
                    {benefitAvailable && (
                      <DrinkChoice
                        drink={drink}
                        setDrink={setDrink}
                        disabled={busy}
                      />
                    )}
                    {connected && !eligible(cart) && (
                      <p className="eligibility-note">
                        메인 메뉴를 담으면 무료 음료 선택이 열려요.
                      </p>
                    )}
                    <Tabs
                      value={category}
                      onValueChange={(v) => setCategory(String(v))}
                    >
                      <TabsList variant="line" className="menu-tabs">
                        {['전체', '메인', '사이드', '음료'].map((c) => (
                          <TabsTrigger value={c} key={c}>
                            {c}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {['전체', '메인', '사이드', '음료'].map((c) => (
                        <TabsContent value={c} key={c}>
                          <div className="menu-list">
                            {MENU.filter(
                              (m) => c === '전체' || m.category === c,
                            ).map((m, i) => (
                              <article className="menu-item" key={m.id}>
                                <div className="menu-item-copy">
                                  <div className="menu-title">
                                    {m.tag && (
                                      <span className="best-tag">{m.tag}</span>
                                    )}
                                    <h3>{m.name}</h3>
                                  </div>
                                  <p>{m.description}</p>
                                  <strong>{won(m.price)}</strong>
                                </div>
                                <div className="menu-quantity">
                                  {i === 0 && c === '전체' && (
                                    <Image
                                      unoptimized
                                      width={1200}
                                      height={1800}
                                      src="/pasta.jpg"
                                      alt=""
                                    />
                                  )}
                                  <div className="quantity-control">
                                    {!!cart[m.id] && (
                                      <>
                                        <button
                                          aria-label={`${m.name} 수량 줄이기`}
                                          onClick={() => changeQty(m.id, -1)}
                                        >
                                          <Minus size={15} />
                                        </button>
                                        <span>{cart[m.id]}</span>
                                      </>
                                    )}
                                    <button
                                      className="add-button"
                                      disabled={(cart[m.id] || 0) >= 20}
                                      aria-label={`${m.name} 추가`}
                                      onClick={() => changeQty(m.id, 1)}
                                    >
                                      <Plus size={17} />
                                    </button>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </>
              )}
              {inApp && (
                <div className="auth-screen">
                  <div className="auth-context">
                    <span className="context-dot" /> {selectedStore} · 테이블
                    5에서 요청
                  </div>
                  {phase === 'login' && (
                    <>
                      <div className="capture-viewfinder">
                        {busy ? (
                          <LoaderCircle className="spin" size={46} />
                        ) : (
                          <ScanLine size={54} />
                        )}
                        <span>
                          {busy ? '학생증 인식 중…' : '학생증 촬영 영역'}
                        </span>
                      </div>
                      <h2 className="capture-title">학생증을 찍어주세요</h2>
                      <div className="auth-action">
                        <button
                          className="primary-button centered"
                          disabled={busy}
                          onClick={checkStudentCard}
                        >
                          {busy ? '학교 정보를 읽고 있어요…' : '학생증 촬영하기'}
                          <ScanLine size={18} />
                        </button>
                        <button
                          className="auth-cancel"
                          onClick={() => {
                            writeMember(true);
                            setPhase('biometric');
                            log(
                              '기존 인증 회원으로 로그인했어요',
                              '학생증 인증이 완료된 가상 계정',
                            );
                          }}
                        >
                          이미 인증된 데모 회원으로 로그인
                        </button>
                      </div>
                    </>
                  )}
                  {(phase === 'signup' ||
                    phase === 'verify' ||
                    phase === 'signupComplete') && (
                    <>
                      <ol
                        className="signup-steps"
                        aria-label="회원가입 진행 단계"
                      >
                        {['학생증 OCR', 'SMS 인증', '완료'].map(
                          (label, index) => {
                            const current =
                              phase === 'signup'
                                ? 0
                                : phase === 'verify'
                                  ? 1
                                  : 2;
                            return (
                              <li
                                key={label}
                                aria-current={
                                  current === index ? 'step' : undefined
                                }
                                className={index <= current ? 'reached' : ''}
                              >
                                <span>
                                  {index < current ? (
                                    <Check size={13} />
                                  ) : (
                                    index + 1
                                  )}
                                </span>
                                {label}
                              </li>
                            );
                          },
                        )}
                      </ol>
                      {phase === 'signup' && (
                        <>
                          <p className="auth-eyebrow">학생증 OCR 완료</p>
                          <h2>학교 정보를 확인해주세요</h2>
                          <p className="auth-description">
                            촬영한 학생증에서 자동으로 읽은 정보예요.
                          </p>
                          <div className="ocr-result">
                            <div>
                              <span>학교</span>
                              <strong>한양대학교</strong>
                            </div>
                            <div>
                              <span>캠퍼스</span>
                              <strong>ERICA캠퍼스</strong>
                            </div>
                            <div>
                              <span>학번</span>
                              <strong>2026••••</strong>
                            </div>
                            <div>
                              <span>이름</span>
                              <strong>김캠퍼스</strong>
                            </div>
                          </div>
                          <div className="auth-action">
                            <button
                              className="primary-button centered"
                              onClick={() => setPhase('verify')}
                            >
                              맞아요 · 전화번호 인증 <ArrowRight size={18} />
                            </button>
                            <button
                              className="auth-cancel"
                              onClick={() => setPhase('login')}
                            >
                              다시 촬영하기
                            </button>
                          </div>
                        </>
                      )}
                      {phase === 'verify' && (
                        <>
                          <p className="auth-eyebrow">휴대폰 본인확인</p>
                          <h2>인증번호 6자리를 입력해주세요</h2>
                          <p className="auth-description">
                            010-1234-5678로 보낸 번호를 자동으로 채울 수 있어요.
                          </p>
                          <div className="phone-entry">
                            <span>전화번호</span>
                            <strong>010-1234-5678</strong>
                            <CircleCheck size={19} />
                          </div>
                          <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                            inputMode="numeric"
                            name="otp"
                            autoComplete="one-time-code"
                            aria-label="SMS 인증번호 6자리"
                            containerClassName="otp-input"
                          >
                            <InputOTPGroup>
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputOTPSlot key={index} index={index} />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                          <button
                            className="signup-secondary"
                            disabled={phoneVerified}
                            onClick={() => {
                              setPhoneVerified(true);
                              setOtp('123456');
                              log(
                                'SMS 인증번호를 자동으로 입력했어요',
                                '가상 번호 · 실제 문자 발송 없음',
                              );
                            }}
                          >
                            {phoneVerified ? (
                              <>
                                <CircleCheck size={17} /> 인증번호 자동완성 완료
                              </>
                            ) : (
                              'SMS 인증번호 받기 · 자동완성 체험'
                            )}
                          </button>
                          <div className="auth-action">
                            <button
                              className="primary-button centered"
                              disabled={
                                !canCompleteSignup(
                                  phoneVerified,
                                  otp,
                                  studentCard,
                                )
                              }
                              onClick={completeSignup}
                            >
                              가입 완료하고 메뉴판으로 돌아가기{' '}
                              <ArrowRight size={18} />
                            </button>
                            <button
                              className="auth-cancel"
                              onClick={cancelAuth}
                            >
                              취소하고 메뉴판으로 돌아가기
                            </button>
                          </div>
                        </>
                      )}
                      {phase === 'signupComplete' && (
                        <>
                          <div className="auth-symbol">
                            <CircleCheck size={36} />
                          </div>
                          <p className="auth-eyebrow">YOU’RE ALL SET</p>
                          <h2>
                            가입과 학생증 인증을
                            <br />
                            완료했어요.
                          </h2>
                          <p className="auth-description">
                            다음 매장부터는 학생증을 다시 제출하지 않고, 유효한
                            대학 자격으로 연결만 승인하면 돼요.
                          </p>
                          <div className="university-card">
                            <GraduationCap size={22} />
                            <div>
                              <strong>김캠퍼스 · 캠퍼스대학교</strong>
                              <span>학생증 인증 완료 · 가상 재학생</span>
                            </div>
                            <ShieldCheck size={20} />
                          </div>
                          <label className="consent-row" htmlFor="demo-consent">
                            <Checkbox
                              id="demo-consent"
                              checked={consent}
                              disabled={busy}
                              onCheckedChange={(v) => setConsent(v === true)}
                            />
                            <span>
                              이번 웹 주문에 대학 제휴 자격을 연결합니다.
                              <small>
                                {selectedStore} · 테이블 5 · 담아둔 메뉴{' '}
                                {itemCount(cart)}개 유지
                              </small>
                            </span>
                          </label>
                          <div className="auth-action">
                            <button
                              className="primary-button centered"
                              disabled={busy || !consent}
                              onClick={() => approve()}
                            >
                              {busy
                                ? '제휴 연결 승인 중…'
                                : '제휴 연결 승인하기'}
                              <ArrowRight size={18} />
                            </button>
                            <button
                              className="auth-cancel"
                              onClick={cancelAuth}
                            >
                              연결하지 않고 웹으로 돌아가기
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {phase === 'biometric' && (
                    <>
                      <div
                        className={`faceid-symbol ${busy ? 'scanning' : ''}`}
                      >
                        <ScanFace size={68} strokeWidth={1.25} />
                      </div>
                      <p className="auth-eyebrow">WELCOME BACK</p>
                      <h2>
                        다시 입력하지 않고,
                        <br />
                        바로 연결하세요.
                      </h2>
                      <p className="auth-description">
                        기존 대학 인증은 그대로예요.
                        <br />
                        이번 주문의 제휴 연결만 승인해주세요.
                      </p>
                      <div className="university-card verified">
                        <GraduationCap size={24} />
                        <div>
                          <strong>캠퍼스대학교</strong>
                          <span>김캠퍼스 · 재학생 인증 유효</span>
                        </div>
                        <ShieldCheck size={20} />
                      </div>
                      <div className="auth-action">
                        <button
                          className="primary-button centered"
                          disabled={busy}
                          onClick={() => approve()}
                        >
                          {busy ? (
                            <>
                              <LoaderCircle size={19} className="spin" />
                              승인 확인 중…
                            </>
                          ) : (
                            <>
                              <ScanFace size={20} />
                              Face ID 승인 체험
                            </>
                          )}
                        </button>
                        <p className="simulation-caption">
                          실제 카메라·생체정보는 사용하지 않습니다.
                        </p>
                        <button
                          className="auth-cancel"
                          disabled={busy}
                          onClick={() => approve()}
                        >
                          기기 잠금번호로 승인 체험
                        </button>
                        <button className="auth-cancel" onClick={cancelAuth}>
                          취소하고 웹으로 돌아가기
                        </button>
                      </div>
                    </>
                  )}
                  {phase === 'approved' && (
                    <>
                      <div className="approved-symbol">
                        <Check size={44} />
                      </div>
                      <p className="auth-eyebrow">CONNECTION APPROVED</p>
                      <h2>
                        제휴 연결을
                        <br />
                        승인했어요.
                      </h2>
                      <p className="auth-description">
                        이제 원래 메뉴판으로 돌아가세요.
                        <br />
                        담아둔 메뉴와 테이블은 그대로예요.
                      </p>
                      <div className="return-card">
                        <Globe size={22} />
                        <div>
                          <strong>{browser}로 돌아가기</strong>
                          <span>{selectedStore} · 테이블 5</span>
                          <small>담아둔 메뉴 {itemCount(cart)}개 유지</small>
                        </div>
                        <ArrowUpRight size={19} />
                      </div>
                      <div className="auth-action">
                        <button
                          className="primary-button centered"
                          onClick={returnToWeb}
                        >
                          메뉴판으로 돌아가기
                          <ArrowRight size={18} />
                        </button>
                        <p className="simulation-caption">
                          데모에서는 같은 화면 안에서 앱 전환을 표현합니다.
                        </p>
                      </div>
                    </>
                  )}
                  {phase === 'authError' && (
                    <>
                      <div className="auth-symbol">
                        <Clock3 size={38} />
                      </div>
                      <h2>
                        연결 요청이
                        <br />
                        만료됐어요.
                      </h2>
                      <p className="auth-description">
                        메뉴판에서 다시 연결하면 됩니다.
                        <br />
                        기존 대학 인증과 장바구니는 유지돼요.
                      </p>
                      <button
                        className="primary-button centered"
                        onClick={() => openApp()}
                      >
                        새 요청으로 다시 연결
                        <ArrowRight size={18} />
                      </button>
                      <button className="auth-cancel" onClick={cancelAuth}>
                        메뉴판으로 돌아가기
                      </button>
                    </>
                  )}
                  <div className="auth-bottom-brand">
                    <LockKeyhole size={12} />
                    <span translate="no">Go.zip</span> · 제휴 승인 시뮬레이션
                  </div>
                </div>
              )}
              {phase === 'receipt' && currentOrder && (
                <div className="receipt-screen">
                  <div className="receipt-symbol">
                    {currentOrder.status === 'done' ? (
                      <CircleCheck size={36} />
                    ) : currentOrder.status === 'cancelled' ? (
                      <X size={36} />
                    ) : currentOrder.status === 'cooking' ? (
                      <ChefHat size={36} />
                    ) : (
                      <ReceiptText size={36} />
                    )}
                  </div>
                  <p className="auth-eyebrow">ORDER #{currentOrder.id}</p>
                  <h2>
                    {currentOrder.status === 'done'
                      ? '맛있게 드세요!'
                      : currentOrder.status === 'cancelled'
                        ? '주문이 취소됐어요'
                        : currentOrder.status === 'cooking'
                          ? '맛있게 준비하고 있어요'
                          : '주문이 전달됐어요'}
                  </h2>
                  <p className="receipt-description">
                    {currentOrder.status === 'new'
                      ? '매장에서 주문을 확인하고 있어요.'
                      : currentOrder.status === 'cooking'
                        ? '매장에서 주문을 접수하고 조리를 시작했어요.'
                        : currentOrder.status === 'done'
                          ? '주문하신 메뉴가 모두 제공됐어요.'
                          : '결제는 진행되지 않은 데모 주문입니다.'}
                  </p>
                  <div className="receipt-progress">
                    {['전달', '조리 중', '제공 완료'].map((text, i) => (
                      <span
                        key={text}
                        className={
                          currentOrder.status !== 'cancelled' &&
                          i <=
                            (currentOrder.status === 'done'
                              ? 2
                              : currentOrder.status === 'cooking'
                                ? 1
                                : 0)
                            ? 'complete'
                            : ''
                        }
                      >
                        <Check size={12} />
                        {text}
                      </span>
                    ))}
                  </div>
                  <div className="receipt-paper">
                    <div className="receipt-store">
                      <strong>{selectedStore}</strong>
                      <span>테이블 5 · #{currentOrder.id}</span>
                    </div>
                    {currentOrder.items.map((item, i) => (
                      <div
                        className={`receipt-line ${item.benefit ? 'free-line' : ''}`}
                        key={i}
                      >
                        <span>
                          {item.benefit && <Gift size={13} />} {item.name} ×{' '}
                          {item.qty}
                          {item.benefit && <small>대학 제휴 서비스</small>}
                        </span>
                        <strong>{won(item.price * item.qty)}</strong>
                      </div>
                    ))}
                    <div className="receipt-total">
                      <span>
                        {orderDisplay(currentOrder.status).amountLabel}
                      </span>
                      <strong>{won(currentOrder.total)}</strong>
                    </div>
                    <p>{orderDisplay(currentOrder.status).amountNote}</p>
                  </div>
                  <button
                    className="primary-button centered"
                    onClick={() =>
                      requestVisit(
                        String((Number(store) + 1) % 10),
                        browser === 'Chrome' ? 'Safari' : 'Chrome',
                      )
                    }
                  >
                    다른 매장·브라우저로 재방문
                    <ArrowRight size={17} />
                  </button>
                  <button
                    className="secondary-button centered"
                    onClick={() =>
                      document
                        .getElementById('merchant-pos')
                        ?.scrollIntoView({
                          behavior: window.matchMedia(
                            '(prefers-reduced-motion: reduce)',
                          ).matches
                            ? 'auto'
                            : 'smooth',
                          block: 'start',
                        })
                    }
                  >
                    <Monitor size={17} />
                    {orderDisplay(currentOrder.status).posAction}
                  </button>
                </div>
              )}
            </div>
            <div className="phone-footer">
              {phase === 'menu' ? (
                <button
                  className="primary-button"
                  disabled={!itemCount(cart)}
                  onClick={() => {
                    setCheckout(true);
                    setNotice('');
                  }}
                >
                  <span>
                    <ShoppingBag size={18} />
                    {itemCount(cart) > 0 && <b>{itemCount(cart)}</b>}주문 확인
                  </span>
                  <span>
                    {won(total(cart))}
                    <ArrowRight size={17} />
                  </span>
                </button>
              ) : (
                <div className="phone-footer-note">
                  {inApp
                    ? 'Go.zip 회원가입 웹페이지입니다.'
                    : phase === 'receipt'
                      ? '주문은 웹에서 완료됐어요.'
                      : 'NFC·QR을 통해 웹 주문을 시작하세요.'}
                </div>
              )}
              <span className="home-indicator" />
            </div>
          </div>
          <p className="under-phone">
            <LockKeyhole size={13} />
            {member
              ? '대학 인증 완료 · 다른 매장에서는 승인만 체험해보세요.'
              : '메뉴 조회와 일반 주문에는 로그인이 필요 없어요.'}
          </p>
          {!inApp && phase === 'menu' && (
            <button className="revisit-shortcut" onClick={() => openApp(true)}>
              <GraduationCap size={15} />
              웹 회원가입부터 체험하기
            </button>
          )}
          {member && !inApp && phase !== 'receipt' && (
            <button
              className="revisit-shortcut"
              onClick={() =>
                requestVisit(
                  String((Number(store) + 1) % 10),
                  browser === 'Chrome' ? 'Safari' : 'Chrome',
                )
              }
            >
              <ArrowUpRight size={15} />
              다른 매장 · 다른 브라우저로 방문하기
            </button>
          )}
        </section>
        <section
          className="merchant-column"
          id="merchant-pos"
          aria-label="매장 POS 화면"
        >
          <div className="panel-label">
            <span>
              <Monitor size={17} />
              매장 화면
            </span>
            <span className="caption">LIVE POS SIMULATOR</span>
          </div>
          <div className="pos-frame">
            <div className="pos-topbar">
              <div>
                <span className="pos-brand" translate="no">
                  Go.zip<span>POS</span>
                </span>
                <span className="pos-divider" />
                {selectedStore}
              </div>
              <span className="online">
                <span />
                영업 중
              </span>
            </div>
            <div className="pos-content">
              <div className="pos-title">
                <div>
                  <p>ORDER MANAGEMENT</p>
                  <h2>주문 관리</h2>
                </div>
                <div className="pos-count">
                  <strong>
                    {storeOrders.filter((o) => o.status === 'new').length}
                  </strong>
                  <span>접수 대기</span>
                </div>
              </div>
              <Tabs
                value={posTab}
                onValueChange={(v) => setPosTab(String(v))}
                className="pos-tabs"
              >
                <TabsList variant="line" className="pos-filter">
                  {[
                    ['new', '신규 주문'],
                    ['cooking', '조리 중'],
                    ['done', '완료 내역'],
                  ].map(([value, label]) => (
                    <TabsTrigger value={value} key={value}>
                      {label}
                      <b>
                        {
                          storeOrders.filter((o) =>
                            value === 'done'
                              ? ['done', 'cancelled'].includes(o.status)
                              : o.status === value,
                          ).length
                        }
                      </b>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {['new', 'cooking', 'done'].map((tab) => (
                  <TabsContent value={tab} key={tab}>
                    <div className="pos-orders">
                      {visibleOrders.length === 0 ? (
                        <Empty className="pos-empty">
                          <EmptyHeader>
                            <div className="empty-icon">
                              <UtensilsCrossed size={30} />
                              <span className="pulse-dot" />
                            </div>
                            <EmptyTitle className="pos-empty-title">
                              {tab === 'new'
                                ? '새 주문을 기다리고 있어요'
                                : tab === 'cooking'
                                  ? '조리 중인 주문이 없어요'
                                  : '완료된 주문이 없어요'}
                            </EmptyTitle>
                            <EmptyDescription className="pos-empty-description">
                              {tab === 'new' ? (
                                <>
                                  고객 메뉴판에서 주문하면
                                  <br />
                                  서비스 메뉴와 함께 여기에 도착합니다.
                                </>
                              ) : tab === 'cooking' ? (
                                '신규 주문을 접수하면 조리를 시작합니다.'
                              ) : (
                                '음식을 제공하면 완료 내역에 남습니다.'
                              )}
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      ) : (
                        visibleOrders.map((order) => (
                          <article className="pos-order-card" key={order.id}>
                            <div className="order-card-heading">
                              <div>
                                <strong>테이블 {order.table}</strong>
                                <span>
                                  #{order.id} · {order.time}
                                </span>
                              </div>
                              <span
                                className={`order-badge ${order.benefit ? 'benefit' : 'normal'}`}
                              >
                                {order.benefit ? (
                                  <>
                                    <GraduationCap size={13} />
                                    대학 제휴
                                  </>
                                ) : (
                                  '일반 주문'
                                )}
                              </span>
                            </div>
                            <div className="order-card-items">
                              {order.items.map((item, i) => (
                                <div
                                  className={
                                    item.benefit ? 'pos-free-item' : ''
                                  }
                                  key={i}
                                >
                                  <span>
                                    {item.name}
                                    {item.benefit && (
                                      <small>제휴 서비스 · 무료</small>
                                    )}
                                  </span>
                                  <span>{item.qty}개</span>
                                  <strong>{won(item.price * item.qty)}</strong>
                                </div>
                              ))}
                            </div>
                            {order.note && (
                              <p className="pos-order-note">
                                요청: {order.note}
                              </p>
                            )}
                            <div className="order-card-total">
                              <span>
                                {orderDisplay(order.status).amountLabel}
                              </span>
                              <strong>{won(order.total)}</strong>
                            </div>
                            <div className="pos-order-actions">
                              {order.status === 'new' ? (
                                <>
                                  <button
                                    className="pos-reject"
                                    onClick={() => setCancelTarget(order.id)}
                                  >
                                    주문 취소
                                  </button>
                                  <button
                                    className="pos-primary"
                                    onClick={() =>
                                      updateOrder(order.id, 'cooking')
                                    }
                                  >
                                    <Check size={16} />
                                    접수하고 조리 시작
                                  </button>
                                </>
                              ) : order.status === 'cooking' ? (
                                <button
                                  className="pos-primary"
                                  onClick={() => updateOrder(order.id, 'done')}
                                >
                                  <UtensilsCrossed size={16} />
                                  조리·제공 완료
                                </button>
                              ) : (
                                <span
                                  className={`order-final ${order.status === 'cancelled' ? 'cancelled' : ''}`}
                                >
                                  {order.status === 'done' ? (
                                    <>
                                      <CircleCheck size={16} />
                                      제공 완료
                                    </>
                                  ) : (
                                    <>
                                      <X size={16} />
                                      취소 완료
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              <div className="pos-bottom">
                <Radio size={15} />
                <span>
                  {storeOrders.length
                    ? '고객 주문 상태와 동기화됨'
                    : '웹 주문 수신 대기 중'}
                </span>
                <span className="pos-clock">DEMO</span>
              </div>
            </div>
          </div>
          <div className="flow-note">
            <span className="note-number">0{stage + 1}</span>
            <div>
              <h3>{notes[stage][0]}</h3>
              <p>{notes[stage][1]}</p>
            </div>
            <Link2 size={27} />
          </div>
          <div className="activity-section">
            <div className="activity-title">
              <h3>진행 기록</h3>
              <span>이번 체험</span>
            </div>
            <div aria-live="polite">
              {events.length ? (
                events.map((event, i) => (
                  <div className="activity-item" key={`${event.title}-${i}`}>
                    <span
                      className={`activity-dot ${i === 0 ? 'latest' : ''}`}
                    />
                    <div>
                      <strong>{event.title}</strong>
                      <p>{event.detail}</p>
                    </div>
                    <span>{event.time}</span>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <span className="activity-dot" />
                  <div>
                    <strong>테이블에 도착했어요</strong>
                    <p>NFC 태깅 또는 QR 스캔으로 시작해보세요.</p>
                  </div>
                  <span>지금</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <footer className="site-footer">
        <span translate="no">Go.zip / ORDER EXPERIENCE</span>
        <span>가상 매장·가상 회원으로 체험합니다.</span>
      </footer>
      <Dialog
        open={checkout}
        onOpenChange={(v) => {
          if (!busy) setCheckout(v);
        }}
      >
        <DialogContent className="checkout-dialog" showCloseButton={!busy}>
          <DialogTitle className="dialog-title">
            주문을 확인해주세요
          </DialogTitle>
          <DialogDescription>{selectedStore} · 테이블 5</DialogDescription>
          <div className="checkout-scroll">
            {MENU.filter((item) => cart[item.id] > 0).map((item) => (
              <div className="checkout-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{won(item.price)}</span>
                </div>
                <div className="quantity-control">
                  <button
                    aria-label={`${item.name} 주문 수량 줄이기`}
                    disabled={busy}
                    onClick={() => changeQty(item.id, -1)}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{cart[item.id]}</span>
                  <button
                    aria-label={`${item.name} 주문 수량 늘리기`}
                    disabled={busy || cart[item.id] >= 20}
                    onClick={() => changeQty(item.id, 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            ))}
            {!itemCount(cart) && (
              <p className="inline-notice">
                장바구니가 비었어요. 메뉴를 담아주세요.
              </p>
            )}
            {!connected && (
              <button
                className="checkout-benefit"
                disabled={busy}
                onClick={() => openApp()}
              >
                <GraduationCap size={20} />
                <span>제휴 연결하고 무료 음료 받기</span>
                <ArrowUpRight size={18} />
              </button>
            )}
            {benefitAvailable && (
              <DrinkChoice drink={drink} setDrink={setDrink} disabled={busy} />
            )}
            {connected && !eligible(cart) && (
              <p className="inline-notice">
                사이드·음료만 주문할 때는 제휴 음료가 제공되지 않아요.
              </p>
            )}
            <label className="note-label" htmlFor="order-note">
              매장 요청사항 <span>선택</span>
            </label>
            <textarea
              id="order-note"
              name="note"
              autoComplete="off"
              placeholder="예: 덜 맵게 해주세요…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
              disabled={busy}
            />
            <div className="checkout-summary">
              <span>매장 결제 예정 금액</span>
              <strong>{won(total(cart))}</strong>
            </div>
            <p className="checkout-payment-note">
              주문 후 매장에서 결제하는 흐름입니다.
              <br />
              데모에서는 실제 주문·결제가 발생하지 않습니다.
            </p>
            {notice && (
              <p className="inline-notice" role="alert">
                {notice}
              </p>
            )}
          </div>
          <button
            className="primary-button centered"
            onClick={submitOrder}
            disabled={!itemCount(cart) || busy}
          >
            {busy ? (
              <>
                <LoaderCircle size={18} className="spin" />
                POS로 주문 전달 중…
              </>
            ) : (
              <>
                {won(total(cart))} 주문 전송
                <ArrowRight size={18} />
              </>
            )}
          </button>
          {benefitAvailable && !drink && (
            <p className="required-hint">
              무료 음료를 선택하면 주문할 수 있어요.
            </p>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!pendingVisit}
        onOpenChange={(open) => {
          if (!open) setPendingVisit(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="dialog-title">
            새 방문으로 이동할까요?
          </AlertDialogTitle>
          <AlertDialogDescription>
            다른 매장·브라우저 체험을 시작하면 담아둔 메뉴 {itemCount(cart)}개와
            요청사항, 이번 제휴 연결이 초기화됩니다. 기존 대학 인증과 접수된
            주문은 유지됩니다.
          </AlertDialogDescription>
          {pendingVisit && (
            <p className="visit-destination">
              {STORES[Number(pendingVisit.store)]} · {pendingVisit.browser}
            </p>
          )}
          <button
            className="primary-button centered"
            onClick={() => {
              if (pendingVisit)
                newVisit(pendingVisit.store, pendingVisit.browser);
            }}
          >
            새 방문으로 이동
            <ArrowRight size={17} />
          </button>
          <button
            className="secondary-button centered"
            onClick={() => setPendingVisit(null)}
          >
            현재 주문 유지하기
          </button>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="dialog-title">
            주문을 취소할까요?
          </AlertDialogTitle>
          <AlertDialogDescription>
            #{cancelTarget} 주문이 취소되고 고객 화면에도 취소로 표시됩니다.
          </AlertDialogDescription>
          <button
            className="primary-button centered"
            onClick={() => {
              if (cancelTarget) updateOrder(cancelTarget, 'cancelled');
              setCancelTarget(null);
            }}
          >
            <X size={17} />
            주문 취소
          </button>
          <button
            className="secondary-button centered"
            onClick={() => setCancelTarget(null)}
          >
            주문 유지하기
          </button>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogTitle className="dialog-title">
            처음부터 체험할까요?
          </AlertDialogTitle>
          <AlertDialogDescription>
            데모 대학 인증, 장바구니와 모든 POS 주문이 초기화됩니다.
          </AlertDialogDescription>
          <button className="primary-button centered" onClick={reset}>
            <RotateCcw size={17} />
            데모 초기화
          </button>
          <button
            className="secondary-button centered"
            onClick={() => setResetOpen(false)}
          >
            계속 체험하기
          </button>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="info-dialog">
          <DialogTitle className="dialog-title">
            이 데모에서 체험할 수 있는 것
          </DialogTitle>
          <DialogDescription>
            실제 서비스 연결 전, 전체 이용 흐름을 확인하는 프로토타입입니다.
          </DialogDescription>
          <ul className="info-list">
            <li>
              <Check size={17} />앱 없이 일반 웹 주문
            </li>
            <li>
              <Check size={17} />
              학생증 OCR·SMS 회원가입과 재방문 연결 승인
            </li>
            <li>
              <Check size={17} />앱 승인 후 원래 장바구니 복귀
            </li>
            <li>
              <Check size={17} />
              무료 서비스 메뉴 선택과 POS 처리
            </li>
            <li>
              <Check size={17} />
              시간표 스크린샷 OCR·확인·저장
            </li>
          </ul>
          <p className="info-disclaimer">
            NFC·QR, 앱 전환, Face ID, 서버 승인, POS는 모두 같은 웹페이지 안에서
            시뮬레이션합니다. 브라우저 선택은 시나리오 전환이며 실제
            Chrome·Safari 간 인증을 공유하지 않습니다. 가상 대학 인증 여부만
            현재 브라우저에 저장합니다. 실제 제휴 인증이나 결제는 발생하지
            않습니다.
          </p>
          <a
            className="photo-credit"
            href="https://www.pexels.com/photo/food-texture-pasta-spaghetti-4057694/"
            target="_blank"
            rel="noreferrer"
          >
            음식 사진: cottonbro studio / Pexels
            <ArrowUpRight size={13} />
          </a>
        </DialogContent>
      </Dialog>
      <Dialog
        open={timetableOpen}
        onOpenChange={(open) => {
          setTimetableOpen(open);
          if (!open && timetableStep === 'reading') {
            if (ocrTimer.current) clearTimeout(ocrTimer.current);
            setTimetableStep('upload');
          }
        }}
      >
        <DialogContent className="timetable-dialog">
          <div className="timetable-heading">
            <span className="timetable-heading-icon">
              <CalendarDays size={22} />
            </span>
            <div>
              <DialogTitle className="dialog-title">
                시간표 가져오기
              </DialogTitle>
              <DialogDescription>
                에브리타임 시간표 스크린샷을 수업 정보로 바꿔드려요.
              </DialogDescription>
            </div>
          </div>

          {timetableStep === 'upload' && (
            <div className="timetable-upload-step">
              <label className="timetable-dropzone">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) startTimetableOcr(file.name);
                    event.currentTarget.value = '';
                  }}
                />
                <span className="upload-symbol">
                  <Upload size={24} />
                </span>
                <strong>시간표 스크린샷 선택</strong>
                <span>PNG, JPG, WEBP</span>
              </label>
              <button
                className="secondary-button centered timetable-sample-button"
                onClick={() => startTimetableOcr()}
              >
                <ScanText size={17} />
                샘플 이미지로 체험
              </button>
              <p className="timetable-demo-note">
                데모에서는 이미지를 서버에 전송하지 않고 샘플 인식 결과를
                보여줍니다.
              </p>
            </div>
          )}

          {timetableStep === 'reading' && (
            <div className="timetable-reading" aria-live="polite">
              <span className="ocr-scanner">
                <ScanText size={31} />
                <i />
              </span>
              <strong>수업 정보를 읽고 있어요…</strong>
              <p>{timetableFile}</p>
              <div className="ocr-progress" aria-hidden="true">
                <span />
              </div>
            </div>
          )}

          {timetableStep === 'review' && (
            <div className="timetable-review">
              <div className="review-summary">
                <div>
                  <strong>{timetableCourses.length}개 수업을 찾았어요</strong>
                  <span>잘못 읽힌 내용이 있으면 바로 수정하세요.</span>
                </div>
                <PencilLine size={18} />
              </div>
              <div className="course-editor-list">
                {timetableCourses.map((course) => (
                  <fieldset className="course-editor" key={course.id}>
                    <legend>수업 {course.id}</legend>
                    <label
                      className="course-name-field"
                      htmlFor={`course-${course.id}-name`}
                    >
                      <span>과목명</span>
                      <Input
                        id={`course-${course.id}-name`}
                        name={`course-${course.id}-name`}
                        autoComplete="off"
                        value={course.name}
                        onChange={(event) =>
                          updateTimetableCourse(
                            course.id,
                            'name',
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label htmlFor={`course-${course.id}-days`}>
                      <span>요일</span>
                      <Input
                        id={`course-${course.id}-days`}
                        name={`course-${course.id}-days`}
                        autoComplete="off"
                        value={course.days}
                        onChange={(event) =>
                          updateTimetableCourse(
                            course.id,
                            'days',
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label htmlFor={`course-${course.id}-time`}>
                      <span>시간</span>
                      <Input
                        id={`course-${course.id}-time`}
                        name={`course-${course.id}-time`}
                        autoComplete="off"
                        value={course.time}
                        onChange={(event) =>
                          updateTimetableCourse(
                            course.id,
                            'time',
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label htmlFor={`course-${course.id}-room`}>
                      <span>강의실</span>
                      <Input
                        id={`course-${course.id}-room`}
                        name={`course-${course.id}-room`}
                        autoComplete="off"
                        value={course.room}
                        onChange={(event) =>
                          updateTimetableCourse(
                            course.id,
                            'room',
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  </fieldset>
                ))}
              </div>
              {timetableError && (
                <p className="inline-notice" role="alert">
                  {timetableError}
                </p>
              )}
              <button
                className="primary-button centered"
                onClick={saveTimetable}
              >
                <Save size={18} />
                확인하고 저장
              </button>
            </div>
          )}

          {timetableStep === 'done' && (
            <div className="timetable-done">
              <span className="timetable-done-icon">
                <Check size={27} />
              </span>
              <strong>{timetableCourses.length}개 수업을 저장했어요</strong>
              <p>이제 캠퍼스 일정과 매장 혜택을 함께 확인할 수 있어요.</p>
              <div className="saved-course-list">
                {timetableCourses.map((course) => (
                  <div key={course.id}>
                    <span>{course.days}</span>
                    <div>
                      <strong>{course.name}</strong>
                      <small>
                        {course.time} · {course.room}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="primary-button centered"
                onClick={() => setTimetableOpen(false)}
              >
                주문 화면으로 돌아가기
                <ArrowRight size={18} />
              </button>
              <button
                className="timetable-retry"
                onClick={() => setTimetableStep('upload')}
              >
                다른 스크린샷 가져오기
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
