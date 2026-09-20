@AGENTS.md

# Project Contract — lg-twins-fansite

## 1. Commands
- dev: `npm run dev`
- test: `npm test`
- lint: `npm run lint`
- build: `npm run build`

## 2. Stack
- Framework: Next.js (App Router), CSS Modules, GSAP
- Language: TypeScript
- DB: 없음 (더미 데이터, src/data)
- Deploy: TBD
- Test: Vitest + Testing Library (jsdom)

## 3. Safety Rules
- `.env*` 파일은 절대 열거나 읽거나 수정하지 않는다.
- 파일 삭제·외부 발송·DB 변경 등 실패 비용이 큰 작업은 실행 전 사람 승인을 받는다.
- 승인되지 않은 외부 패키지를 임의로 설치하지 않는다.

## 4. Workflow Protocol
- **Plan First**: 코드를 바로 고치지 말고, 먼저 문제 원인·대상 파일·테스트 계획을 정리한다.
- **Small Diff**: 한 번에 대규모 수정을 하지 말고, 검증 가능한 작은 단위로 쪼갠다.
- **Verification**: 수정 후 항상 lint와 관련 테스트를 실행해 결과를 확인한다.

## 5. See Also
- 전역 코딩 표준 및 스택 규칙 → `pixelconnect-standards` 스킬 참고

## 프로젝트 규칙
- 컴포넌트/페이지는 src/data를 직접 import하지 않는다. src/lib의 함수만 쓴다.
- GSAP은 src/lib/animations.ts 훅으로만 쓴다. prefers-reduced-motion을 지킨다.
- 구단 공식 로고와 선수 사진은 쓰지 않는다. 비공식 팬사이트 고지를 유지한다.
- 더미 데이터는 반드시 "DUMMY" 주석을 붙인다. 불확실한 사실 정보는 넣지 않는다.
