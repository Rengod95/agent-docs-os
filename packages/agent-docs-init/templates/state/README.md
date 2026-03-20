# State

## 역할
`state/`는 전역 현재 상태와 handoff를 보관하는 레이어다.

## 포함 파일
- `current.yaml`
- `checkpoints/`

## 이 디렉터리를 반드시 읽는 이유
모든 작업은 현재 활성 feature, 전역 리스크, 다음 액션을 알아야 한다.  
그래서 모든 작업은 `state/`를 먼저 거친다.

## 접근 순서
1. `current.yaml`이 있으면 먼저 읽는다.
2. 현재 작업을 이어받는 경우 최신 checkpoint를 읽는다.
3. 실제 작업 상태는 관련 feature의 `current.md`로 내려가서 확인한다.

## 규칙
- `current.yaml`은 얇은 전역 상태판이다.
- 세부 작업 상태는 feature `current.md`에 둔다.
- 세션 종료 또는 handoff가 필요하면 checkpoint를 추가한다.

## 실제 파일이 아직 없는 경우
- `current.yaml`이 없으면 `current.yaml.template`을 기준으로 만든다.
- checkpoint가 필요하면 `checkpoints/checkpoint.md.template`을 복사해서 시작한다.
    