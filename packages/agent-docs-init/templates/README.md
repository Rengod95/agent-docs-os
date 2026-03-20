# Docs Router

이 문서는 `docs/`의 전역 라우터다.  
상세한 규칙은 각 디렉터리의 `README.md`가 맡고, 이 문서는 **작업 의도와 범위를 고른 뒤 어떤 디렉터리를 반드시 거쳐야 하는지**만 안내한다.

## 공통 선행 경로
모든 작업은 먼저 아래를 읽는다.

1. `state/README.md`
2. `references/README.md`
3. `features/README.md`

## 1. 작업 의도 선택

### `plan`
- 아직 구현하지 않고 범위, 영향, 실행 순서를 정리하는 작업이다.

### `investigate`
- 원인, 현상, 범위, 관련 파일을 조사하는 작업이다.

### `fix`
- 의도된 동작을 복원하는 작업이다.

### `change`
- 기존 동작, 정책, 흐름, UX를 바꾸는 작업이다.

### `add`
- 새 기능이나 새 feature를 추가하는 작업이다.

### `refactor`
- 동작 보존을 전제로 구조를 개선하는 작업이다.

### `govern`
- 공통 규칙, 정책, 문서 체계, 아키텍처 원칙을 바꾸는 작업이다.

## 2. 작업 범위 선택

### `single-feature`
- 하나의 feature 안에서 끝나는 작업이다.
- 관련 feature 하나를 정하고 그 폴더를 작업 허브로 사용한다.

### `multi-feature`
- 두 개 이상 feature에 영향이 있는 작업이다.
- primary feature 하나를 정하고, secondary feature는 참조만 한다.
- 실제 진행 상태는 primary feature의 `current.md`만 기준으로 쓴다.

### `cross-cutting`
- 공통 원문 문서, 공통 규칙, 공통 패턴, 공통 런타임 제약이 직접 걸린 작업이다.
- 관련 references와 decisions를 반드시 확인해야 한다.

### `global`
- 프로젝트 전역 규칙이나 구조에 영향을 주는 작업이다.
- 특정 feature 하나로 바로 좁히기보다 전역 상태와 전역 결정에서 시작한다.

## 3. 작업 의도 + 작업 범위에 따른 필수 경유

### 공통 규칙
- 실제 feature를 찾기 전에는 `features/README.md`를 건너뛰지 않는다.
- 관련 원문을 찾기 전에는 `references/README.md`를 건너뛰지 않는다.
- 다중 feature 작업은 primary feature를 먼저 정한 뒤 secondary feature를 연결한다.

### `plan`
- 항상:
  - `state/README.md`
  - `references/README.md`
  - `features/README.md`
- `cross-cutting`, `global`이면 추가:
  - `decisions/README.md`

### `investigate`
- 항상:
  - `state/README.md`
  - `references/README.md`
  - `features/README.md`
- 구조, 규칙, 과거 판단이 걸리면 추가:
  - `decisions/README.md`

### `fix`
- 항상:
  - `state/README.md`
  - `references/README.md`
  - `features/README.md`
- 구조적 원인이나 반복된 판단이 걸리면 추가:
  - `decisions/README.md`

### `change`
- 항상:
  - `state/README.md`
  - `references/README.md`
  - `features/README.md`
- 정책, 구조, 규칙 변화가 있으면 추가:
  - `decisions/README.md`

### `add`
- 항상:
  - `state/README.md`
  - `references/README.md`
  - `features/README.md`
- 공통 패턴이나 규칙을 따라야 하면 추가:
  - `decisions/README.md`

### `refactor`
- 항상:
  - `state/README.md`
  - `references/README.md`
  - `features/README.md`
  - `decisions/README.md`

### `govern`
- 항상:
  - `state/README.md`
  - `references/README.md`
  - `decisions/README.md`
- 영향 feature가 있으면 추가:
  - `features/README.md`

## 공통 종료 규칙
모든 작업 종료 시 아래를 확인한다.

- `state/current.yaml` 또는 `state/current.yaml.template`
- `decisions/decision-log.md` 또는 `decisions/decision-log.md.template`
- 관련 feature의 `current.md`

작업이 실제 구조를 바꿨다면 추가로 확인한다.

- 관련 feature의 `README.md`
- 관련 feature의 `meta.yaml`
- 필요 시 `decisions.md`
- 필요 시 ADR

## 실제 파일이 아직 없는 경우
실제 사례가 필요한 파일은 템플릿으로만 둘 수 있다.  
이 경우 같은 위치의 `.template` 파일을 기준으로 작업을 진행한다.
