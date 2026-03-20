# Features

## 역할
`features/`는 실제 작업 허브다.  
전역 라우팅 이후에는 이 디렉터리 안에서 관련 feature를 고르고, 그 feature의 문서를 기준으로 작업한다.

## 포함 파일
- `index.yaml`
- `<feature-id>/`
- `_feature-template/`

## 이 디렉터리를 반드시 읽는 이유
대부분의 작업은 결국 특정 feature를 기준으로 진행된다.  
그래서 모든 작업은 `features/README.md`와 `features/index.yaml` 또는 템플릿을 거쳐야 한다.

## feature 생성 방식
새 feature가 필요하면 `_feature-template/`을 복사해 `<feature-id>/`를 만든다.

그 다음 아래를 수행한다.
1. `index.yaml` 또는 `index.yaml.template`에 feature를 추가한다.
2. 새 feature 폴더의 필수 파일을 채운다.
3. 실제 작업이 시작되면 `current.md`를 기준판으로 사용한다.

`_feature-template/` 자체를 직접 수정해서 feature처럼 쓰면 안 된다.  
템플릿은 복사 시작점이고, 실제 작업은 새 feature 폴더에서 진행한다.

## primary feature 규칙
- 실제 진행 상태는 primary feature의 `current.md`만 기준으로 쓴다.
- secondary feature는 링크만 둔다.
- 같은 작업 상태를 여러 feature에 중복 기록하지 않는다.

## 필수 파일
새 feature를 만들 때 반드시 있어야 하는 파일

- `README.md`
- `meta.yaml`
- `current.md`
- `archive/`
- `workspace/`

`current.md`는 이 feature의 현재 작업 상태와 관련 문서 라우터를 함께 맡는다.
`meta.yaml`은 이 feature가 어떤 reference와 연결되는지를 소유한다.

## 선택 파일
- `decisions.md`

## 자유롭게 만들 수 있는 작업 문서
feature 폴더 안에서는 작업 성격에 따라 문서를 자유롭게 추가할 수 있다.  
권장 위치는 `workspace/`다.

중요한 규칙:
- 새로 만든 작업 문서는 반드시 `current.md`의 `Working Docs` 또는 `Required Docs`에 연결한다.
- 연결되지 않은 문서는 세션이 바뀌면 잊히기 쉽다.
- 영속 문서가 아니면 `workspace/`에 두고, 구조 설명은 `README.md`에 섞지 않는다.
- 특정 reference와의 연결은 `meta.yaml`의 `related_references`에서 관리하고, 현재 작업에서 실제로 읽어야 하는 문서는 `current.md`에 다시 적는다.

## 실제 파일이 아직 없는 경우
- `index.yaml`이 없으면 `index.yaml.template`을 사용한다.
- 새 feature를 만들거나 정리할 때는 `_feature-template/`을 복사해서 시작한다.
