# Google Sheets 설정 가이드

## 1. 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 스프레드시트 이름: `Discord Ticket Master`

## 2. 시트 설정

### 시트 이름 변경
- 기본 시트 이름을 `ticket_requests`로 변경

### 헤더 행 추가 (1행)
다음 컬럼을 1행에 추가:

```
request_id | ticket_type | ticket_title | ticket_description | assignee | start_date | due_date | story_point | requester_id | requester_name | status | jira_key
```

또는 `google-sheets-schema.csv` 파일을 가져오기하여 사용할 수 있습니다.

## 3. 컬럼 설명

| 컬럼명 | 데이터 타입 | 설명 | 예시 |
|--------|------------|------|------|
| request_id | String | 고유 ID (timestamp) | 1702800000000 |
| ticket_type | String | 티켓 유형 | Bug, Feature, Task |
| ticket_title | String | 티켓 제목 | 로그인 버튼 안 눌림 |
| ticket_description | String | 티켓 상세 설명 | 크롬에서 로그인 버튼을... |
| assignee | String | 담당자 | john.doe |
| start_date | String | 시작일 | 2024-12-16 |
| due_date | String | 마감일 | 2024-12-20 |
| story_point | String | 스토리 포인트 (옵션) | 5 |
| requester_id | String | 요청자 Discord ID | 1234567890 |
| requester_name | String | 요청자 이름 | sam_dev |
| status | String | 상태 | pending, approved, rejected |
| jira_key | String | JIRA 티켓 키 | PROJ-123 |

## 4. Service Account 설정

### 4.1 Google Cloud Console에서 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성: `Discord Ticket Master`
3. 프로젝트 선택

### 4.2 Google Sheets API 활성화

1. "API 및 서비스" → "라이브러리" 이동
2. "Google Sheets API" 검색
3. "사용 설정" 클릭

### 4.3 Service Account 생성

1. "API 및 서비스" → "사용자 인증 정보" 이동
2. "사용자 인증 정보 만들기" → "서비스 계정" 선택
3. 서비스 계정 정보 입력:
   - 이름: `n8n-ticket-master`
   - 설명: `n8n Discord Ticket Master Service Account`
4. "만들고 계속하기" 클릭
5. 역할: `편집자` 선택
6. "완료" 클릭

### 4.4 JSON 키 다운로드

1. 생성된 서비스 계정 클릭
2. "키" 탭 이동
3. "키 추가" → "새 키 만들기" 클릭
4. "JSON" 선택
5. JSON 파일 다운로드 (안전한 곳에 보관)

### 4.5 스프레드시트 공유

1. 다운로드한 JSON 파일에서 `client_email` 찾기
   - 예: `n8n-ticket-master@project-id.iam.gserviceaccount.com`
2. Google Sheets 스프레드시트 열기
3. "공유" 버튼 클릭
4. Service Account 이메일 추가
5. 권한: `편집자` 선택
6. "보내기" 클릭

## 5. 스프레드시트 ID 확인

스프레드시트 URL에서 ID 추출:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

예시:
```
https://docs.google.com/spreadsheets/d/1abc123def456/edit
→ SPREADSHEET_ID: 1abc123def456
```

이 ID를 n8n 워크플로우에서 사용합니다.

## 6. n8n에서 Credential 설정

1. n8n 접속
2. "Credentials" 메뉴 이동
3. "Add Credential" 클릭
4. "Google Sheets API" 선택 (Service Account 방식)
5. 설정:
   - Name: `Google Sheets - Ticket Master`
   - Service Account Email: JSON 파일의 `client_email`
   - Private Key: JSON 파일의 `private_key` (전체 복사)
6. "Save" 클릭

## 7. 테스트

간단한 테스트 데이터 추가:

| request_id | ticket_type | ticket_title | ... | status |
|------------|-------------|--------------|-----|--------|
| 1702800000000 | Bug | 테스트 티켓 | ... | pending |

n8n 워크플로우에서 Google Sheets 노드 테스트 실행하여 읽기/쓰기 확인.

## 8. 보안 주의사항

- Service Account JSON 파일은 절대 공개 저장소에 커밋하지 마세요
- `.gitignore`에 JSON 파일 경로 추가
- 필요한 경우 환경 변수나 비밀 관리 도구 사용
