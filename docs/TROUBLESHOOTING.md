# 문제 해결 가이드

이 문서는 n8n Discord Ticket Master 사용 중 발생할 수 있는 일반적인 문제와 해결 방법을 설명합니다.

## 목차

1. [Discord 관련 문제](#discord-관련-문제)
2. [Google Sheets 관련 문제](#google-sheets-관련-문제)
3. [JIRA 관련 문제](#jira-관련-문제)
4. [n8n 워크플로우 문제](#n8n-워크플로우-문제)
5. [일반적인 오류](#일반적인-오류)

---

## Discord 관련 문제

### 1. Slash Command가 나타나지 않음

**증상:**
- Discord에서 `/create-ticket` 입력 시 명령어가 표시되지 않음

**원인:**
- Slash Command가 등록되지 않음
- Bot이 서버에 초대되지 않음
- 권한 부족

**해결 방법:**

1. **Slash Command 재등록**
   ```bash
   cd scripts
   ./register-discord-command.sh
   ```

2. **Bot 권한 확인**
   - Discord Developer Portal > Bot > Privileged Gateway Intents
   - "applications.commands" scope 확인

3. **Discord 캐시 초기화**
   - Discord 완전히 종료 후 재시작
   - 또는 Ctrl+R (새로고침)

4. **Guild ID 확인**
   - 스크립트의 Guild ID가 정확한지 확인
   - 현재 사용: `YOUR_GUILD_ID`

---

### 2. Modal이 표시되지 않음

**증상:**
- `/create-ticket` 입력 시 Modal 팝업이 나타나지 않음
- "Application did not respond" 오류

**원인:**
- n8n 워크플로우가 비활성화됨
- Webhook URL이 잘못 설정됨
- 응답 시간 초과 (3초 제한)

**해결 방법:**

1. **워크플로우 활성화 확인**
   ```
   n8n > Workflows > 1-ticket-creation-flow
   → 왼쪽 상단 토글이 활성화되어 있는지 확인
   ```

2. **Webhook URL 확인**
   - Discord Developer Portal > General Information
   - INTERACTIONS ENDPOINT URL 확인
   - 워크플로우의 Production URL과 일치해야 함

3. **n8n 로그 확인**
   ```
   n8n > Executions
   → 최근 실행 기록 확인
   → 오류 메시지 확인
   ```

4. **Webhook 테스트**
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"type": 1}' \
     https://your-n8n-instance.com/webhook/discord-interaction
   ```

---

### 3. Bot이 DM을 전송하지 못함

**증상:**
- PM 또는 요청자에게 DM이 전송되지 않음
- 50007 오류: "Cannot send messages to this user"

**원인:**
- 사용자가 DM을 차단함
- Bot이 DM 권한이 없음

**해결 방법:**

1. **사용자 DM 설정 확인**
   - Discord 설정 > 개인정보 보호 및 보안
   - "서버 멤버로부터의 다이렉트 메시지 허용" 활성화

2. **Bot 권한 확인**
   - Discord Developer Portal > Bot
   - "Send Messages" 권한 확인

3. **채널 ID 로그 확인**
   ```javascript
   // n8n Code 노드에 추가하여 디버깅
   console.log('Channel ID:', $json.id);
   return items;
   ```

---

### 4. Discord API 401 Unauthorized

**증상:**
- HTTP Request 노드에서 401 오류
- "Unauthorized" 응답

**원인:**
- Bot Token이 잘못됨
- Credential 설정 오류

**해결 방법:**

1. **Bot Token 확인**
   ```
   현재 Token: YOUR_BOT_TOKEN_HERE
   ```

2. **Credential 재설정**
   ```
   n8n > Credentials > Discord Bot Auth
   Header Name: Authorization
   Header Value: Bot [TOKEN]

   ⚠️ "Bot " 접두사 포함 확인!
   ```

3. **Token 재생성 (필요시)**
   - Discord Developer Portal > Bot
   - "Reset Token" 클릭
   - 새 Token으로 Credential 업데이트

---

### 5. Discord API 403 Forbidden

**증상:**
- HTTP Request 노드에서 403 오류
- "Missing Permissions" 응답

**원인:**
- Bot이 필요한 권한이 없음

**해결 방법:**

1. **Bot 권한 확인**
   - Discord Developer Portal > Bot > Bot Permissions
   - 필요한 권한:
     - Send Messages
     - Send Messages in Threads
     - Read Message History
     - Use Slash Commands

2. **Bot 재초대**
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=2147485696&scope=bot%20applications.commands
   ```

---

## Google Sheets 관련 문제

### 1. Permission Denied

**증상:**
- Google Sheets 노드에서 "Permission denied" 오류
- 데이터를 읽거나 쓸 수 없음

**원인:**
- Service Account에 스프레드시트 권한이 없음
- Spreadsheet ID가 잘못됨

**해결 방법:**

1. **스프레드시트 공유 확인**
   ```
   Google Sheets > 공유
   → Service Account 이메일 확인
   → 권한: 편집자
   ```

2. **Service Account 이메일 확인**
   ```json
   // JSON 파일에서
   {
     "client_email": "n8n-ticket-master@project-id.iam.gserviceaccount.com"
   }
   ```

3. **Spreadsheet ID 확인**
   ```
   URL: https://docs.google.com/spreadsheets/d/[ID]/edit
   워크플로우의 documentId와 일치해야 함
   ```

---

### 2. Sheet Not Found

**증상:**
- "Sheet 'ticket_requests' not found" 오류

**원인:**
- 시트 이름이 일치하지 않음
- 시트가 삭제됨

**해결 방법:**

1. **시트 이름 확인**
   ```
   Google Sheets 하단 탭 이름: ticket_requests
   워크플로우 sheetName: ticket_requests
   → 대소문자 구분 정확히 일치해야 함
   ```

2. **시트 재생성**
   - 새 시트 추가
   - 이름: `ticket_requests`
   - 헤더 추가 (templates/google-sheets-schema.csv 참고)

---

### 3. Invalid Column Name

**증상:**
- "Column 'xxx' not found" 오류
- 데이터 저장/조회 실패

**원인:**
- 컬럼 이름이 일치하지 않음
- 헤더 행이 누락됨

**해결 방법:**

1. **헤더 확인**
   ```
   1행에 다음 컬럼 순서대로:
   request_id | ticket_type | ticket_title | ticket_description |
   assignee | start_date | due_date | story_point |
   requester_id | requester_name | status | jira_key
   ```

2. **공백 제거**
   - 컬럼 이름에 앞뒤 공백 없는지 확인
   - 예: "request_id " (X) → "request_id" (O)

3. **CSV 재임포트**
   ```bash
   # templates/google-sheets-schema.csv 사용
   ```

---

### 4. Google Sheets API 할당량 초과

**증상:**
- "Quota exceeded" 오류
- 429 Too Many Requests

**원인:**
- API 호출 제한 초과
- 너무 많은 요청

**해결 방법:**

1. **할당량 확인**
   - [Google Cloud Console](https://console.cloud.google.com)
   - API 및 서비스 > 할당량

2. **요청 빈도 감소**
   - 리마인더 간격 조정 (2시간 → 4시간)
   - 배치 처리 사용

3. **할당량 증가 요청**
   - Google Cloud Console에서 요청

---

## JIRA 관련 문제

### 1. JIRA API 401 Unauthorized

**증상:**
- JIRA 노드에서 401 오류
- "Authentication failed" 메시지

**원인:**
- API Token이 잘못됨
- 이메일이 잘못됨

**해결 방법:**

1. **Credential 확인**
   ```
   n8n > Credentials > JIRA Cloud API
   Email: [JIRA 계정 이메일]
   API Token: [생성한 토큰]
   Domain: [도메인].atlassian.net
   ```

2. **API Token 재생성**
   - [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - 기존 토큰 삭제
   - 새 토큰 생성

3. **이메일 확인**
   - JIRA에 로그인할 때 사용하는 이메일과 동일해야 함

---

### 2. JIRA API 400 Bad Request

**증상:**
- JIRA 티켓 생성 시 400 오류
- "Field 'xxx' is required" 메시지

**원인:**
- 필수 필드가 누락됨
- 필드 값이 잘못됨

**해결 방법:**

1. **프로젝트 설정 확인**
   ```
   JIRA > Project Settings > Issue Types
   → 해당 Issue Type의 필수 필드 확인
   ```

2. **워크플로우 수정**
   ```javascript
   // JIRA Create Issue 노드에 필수 필드 추가
   "additionalFields": {
     "priority": {
       "__rl": true,
       "value": "Medium",
       "mode": "name"
     }
   }
   ```

3. **필드 매핑 확인**
   - Summary: ticket_title
   - Description: ticket_description
   - Assignee: assignee
   - Due Date: due_date

---

### 3. JIRA User Not Found

**증상:**
- "User 'xxx' not found" 오류
- Assignee 할당 실패

**원인:**
- Assignee가 JIRA에 존재하지 않음
- 사용자 이름이 잘못됨

**해결 방법:**

1. **JIRA 사용자 확인**
   ```
   JIRA > People
   → 사용자 목록에서 이름 확인
   ```

2. **Account ID 사용 (대안)**
   ```javascript
   // n8n JIRA 노드에서
   "assignee": {
     "__rl": true,
     "value": "ACCOUNT_ID",
     "mode": "id"
   }
   ```

3. **기본 Assignee 제거**
   ```javascript
   // additionalFields에서 assignee 제거
   // 프로젝트 기본 설정 사용
   ```

---

### 4. JIRA Issue Type Not Found

**증상:**
- "Issue type 'xxx' not found" 오류

**원인:**
- Issue Type이 프로젝트에 없음
- 이름이 잘못됨

**해결 방법:**

1. **사용 가능한 Issue Type 확인**
   ```
   JIRA > Project Settings > Issue Types
   → 활성화된 Issue Type 목록 확인
   ```

2. **Issue Type 매핑 테이블 작성**
   ```javascript
   // n8n Code 노드에서 변환
   const typeMapping = {
     'Bug': 'Bug',
     'Feature': 'Story',
     'Task': 'Task'
   };

   return {
     json: {
       ...items[0].json,
       jira_issue_type: typeMapping[items[0].json.ticket_type] || 'Task'
     }
   };
   ```

---

## n8n 워크플로우 문제

### 1. 워크플로우가 실행되지 않음

**증상:**
- 워크플로우 트리거되지 않음
- Executions에 기록 없음

**원인:**
- 워크플로우가 비활성화됨
- Webhook URL이 잘못됨

**해결 방법:**

1. **활성화 상태 확인**
   ```
   워크플로우 상단 토글 스위치 확인
   → 파란색이면 활성화, 회색이면 비활성화
   ```

2. **Webhook URL 확인**
   ```
   Webhook 노드 > Production URL 복사
   → Discord Developer Portal에 설정된 URL과 일치해야 함
   ```

3. **수동 테스트**
   ```
   Webhook 노드 > "Listen for test event"
   → 테스트 요청 전송
   ```

---

### 2. 노드 실행 실패

**증상:**
- 특정 노드에서 오류 발생
- 빨간색 X 표시

**원인:**
- 입력 데이터 형식 오류
- Credential 오류
- 외부 API 오류

**해결 방법:**

1. **오류 메시지 확인**
   ```
   노드 클릭 > 오류 메시지 읽기
   → 구체적인 오류 내용 확인
   ```

2. **입력 데이터 확인**
   ```
   이전 노드 클릭 > Output 탭
   → 데이터 형식 확인
   ```

3. **노드 재실행**
   ```
   노드 우클릭 > "Execute node"
   → 단독 테스트
   ```

---

### 3. Expression 오류

**증상:**
- "Expression error" 메시지
- `{{ }}` 표현식 평가 실패

**원인:**
- 잘못된 표현식 문법
- 존재하지 않는 필드 참조

**해결 방법:**

1. **표현식 문법 확인**
   ```javascript
   // 올바른 예
   {{ $json.field_name }}
   {{ $('Node Name').item.json.field }}

   // 잘못된 예
   {{ json.field_name }}  // $ 누락
   {{ $json['field-name'] }}  // - 대신 _ 사용
   ```

2. **필드 존재 여부 확인**
   ```
   이전 노드 Output에서 실제 필드 이름 확인
   ```

3. **Expression Editor 사용**
   ```
   필드 클릭 > "Expression" 탭
   → 자동 완성 기능 활용
   ```

---

### 4. Workflow 실행 시간 초과

**증상:**
- 워크플로우가 멈춤
- 무한 대기 상태

**원인:**
- 외부 API 응답 지연
- 무한 루프
- 대용량 데이터 처리

**해결 방법:**

1. **타임아웃 설정**
   ```
   HTTP Request 노드 > Timeout (ms)
   → 기본값: 60000 (60초)
   → 필요시 증가
   ```

2. **분할 처리**
   ```
   대용량 데이터를 배치로 나누어 처리
   ```

3. **워크플로우 재시작**
   ```
   n8n > Executions > 실행 중단
   → 워크플로우 재실행
   ```

---

## 일반적인 오류

### 1. "Cannot read property 'json' of undefined"

**원인:**
- 이전 노드의 출력이 없음
- 배열 인덱스 오류

**해결 방법:**
```javascript
// 안전한 접근 방법
const data = $input.item?.json || {};
const items = $input.all() || [];
```

---

### 2. JSON 파싱 오류

**원인:**
- 잘못된 JSON 형식
- 특수 문자 이스케이프 누락

**해결 방법:**
```javascript
// JSON 문자열 이스케이프
const jsonString = JSON.stringify(data);
```

---

### 3. 날짜 형식 오류

**원인:**
- JIRA/Google Sheets 날짜 형식 불일치

**해결 방법:**
```javascript
// JIRA 날짜 형식: YYYY-MM-DD
const dueDate = $json.due_date; // "2024-12-20"

// Google Sheets 날짜 형식 변환
const sheetsDate = new Date(dueDate).toLocaleDateString();
```

---

## 디버깅 체크리스트

### Discord 문제
- [ ] Slash Command 등록 확인
- [ ] Bot Token 정확성 확인
- [ ] Bot 권한 확인
- [ ] Webhook URL 설정 확인
- [ ] 워크플로우 활성화 확인

### Google Sheets 문제
- [ ] Service Account 권한 확인
- [ ] Spreadsheet ID 확인
- [ ] 시트 이름 확인
- [ ] 헤더 행 확인
- [ ] API 할당량 확인

### JIRA 문제
- [ ] API Token 유효성 확인
- [ ] Project Key 확인
- [ ] Issue Type 확인
- [ ] 필수 필드 확인
- [ ] Assignee 존재 확인

### n8n 문제
- [ ] 워크플로우 활성화 확인
- [ ] Credential 설정 확인
- [ ] 표현식 문법 확인
- [ ] 노드 연결 확인
- [ ] 실행 로그 확인

---

## 추가 지원

문제가 계속되면:

1. **n8n 로그 수집**
   ```
   n8n > Executions > 오류 실행 클릭
   → 전체 로그 복사
   ```

2. **환경 정보 수집**
   - n8n 버전
   - 워크플로우 버전
   - 오류 재현 단계

3. **커뮤니티 지원**
   - [n8n Community](https://community.n8n.io/)
   - [Discord Developer Community](https://discord.gg/discord-developers)

4. **이슈 등록**
   - GitHub Issues에 상세 내용 기록
   - 로그 첨부
