# Decisions

## 역할
`decisions/`는 전역 판단을 기록하는 레이어다.

## 포함 파일
- `decision-log.md`
- `ADR-*.md`

## 이 디렉터리를 반드시 읽는 경우
- 작업 의도가 `refactor`, `govern`인 경우
- 공통 규칙, 패턴, 정책을 건드리는 경우
- 과거 전역 판단 이유를 확인해야 하는 경우

## 규칙
- 모든 작업은 `decision-log.md`를 갱신한다.
- 모든 작업이 ADR를 만드는 것은 아니다.
- 아래 조건이면 ADR를 추가한다.
  - 구조 변경
  - 공용 패턴 변경
  - 규칙 또는 정책 변경
  - 여러 feature에 영향
  - 되돌리기 어려움

## 접근 순서
1. `decision-log.md`가 있으면 먼저 읽는다.
2. 관련 구조 결정이 있으면 ADR를 읽는다.
3. feature-local 판단이 필요하면 해당 feature의 `decisions.md`로 내려간다.

## 실제 파일이 아직 없는 경우
- `decision-log.md`가 없으면 `decision-log.md.template`을 복사해서 시작한다.
- 새 ADR가 필요하면 `ADR.md.template`을 사용한다.
