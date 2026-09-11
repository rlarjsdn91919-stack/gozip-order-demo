# 고집(Go.zip) Order Demo

대학교 제휴 인증을 웹 주문에 연결하는 전체 흐름을 체험할 수 있는 인터랙티브 데모입니다.

## 주요 흐름

- 매장 NFC·QR 태깅 후 웹 메뉴판 진입
- 비회원 일반 주문 또는 대학 제휴 연결 선택
- 학생증 OCR, 휴대폰 인증을 거친 웹 회원가입
- 기존 회원의 생체 인증 연결 시뮬레이션
- 제휴 서비스 메뉴 선택 후 매장 POS로 주문 전달
- 시간표 스크린샷 OCR, 인식 결과 수정 및 저장

실제 OCR, SMS, 생체 인증, 결제, POS 전송은 발생하지 않으며 제품 흐름을 검토하기 위한 시뮬레이션입니다.

## 실행

```bash
npm install
npm run dev
```

배포용 정적 빌드는 다음 명령으로 생성합니다.

```bash
npm run build
```

## 구성

- Next.js 호환 Vinext
- React 19
- TypeScript
- Shadcn UI primitives
- 정적 사이트 배포

핵심 화면은 `app/page.tsx`, 스타일은 `app/globals.css`, 주문과 제휴 규칙은 `lib/demo.ts`에 있습니다.
