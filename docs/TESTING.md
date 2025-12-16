# 테스트 가이드

이 문서는 n8n Discord Ticket Master의 테스트 절차를 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [단위 테스트](#단위-테스트)
3. [통합 테스트](#통합-테스트)
4. [시나리오 테스트](#시나리오-테스트)
5. [성능 테스트](#성능-테스트)

---

## 사전 준비

### 테스트 환경 확인

- [ ] 모든 워크플로우가 활성화되어 있는지 확인
- [ ] Discord Bot이 서버에 초대되어 있는지 확인
- [ ] Google Sheets가 준비되어 있는지 확인
- [ ] JIRA 프로젝트가 접근 가능한지 확인

### 테스트 계정

1. **일반 사용자 계정**: 티켓 생성 테스트용
2. **PM 계정** (User ID: 1258331291846185033): 승인/거부 테스트용

---

## 단위 테스트

각 워크플로우의 개별 노드를 테스트합니다.

### 워크플로우 1: 티켓 생성 플로우

#### 테스트 1.1: Webhook Trigger

**테스트 방법:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "type": 2,
    "data": {
      "name": "create-ticket"
    }
  }' \
  https://your-n8n-instance.com/webhook/discord-interaction
```

**기대 결과:**
- HTTP 200 응답
- Modal JSON 응답 반환

#### 테스트 1.2: Modal 데이터 파싱

**테스트 데이터:**
```json
{
  "type": 5,
  "data": {
    "components": [
      { "components": [{ "value": "Bug" }] },
      { "components": [{ "value": "테스트 티켓" }] },
      { "components": [{ "value": "이것은 테스트입니다" }] },
      { "components": [{ "value": "john.doe" }] },
      { "components": [{ "value": "2024-12-16 ~ 2024-12-20" }] }
    ]
  },
  "member": {
    "user": {
      "id": "1234567890",
      "username": "test_user"
    }
  }
}
```

**기대 결과:**
- 모든 필드가 정확히 파싱됨
- request_id가 timestamp로 생성됨
- status가 "pending"으로 설정됨

#### 테스트 1.3: Google Sheets 저장

**테스트 방법:**
1. n8n에서 "Save to Google Sheets" 노드 선택
2. "Test step" 클릭
3. Google Sheets 확인

**기대 결과:**
- 새 행이 추가됨
- 모든 컬럼 데이터가 정확함

#### 테스트 1.4: Discord DM 전송

**테스트 방법:**
1. "Create PM DM Channel" 노드 테스트
2. PM 계정에서 DM 확인

**기대 결과:**
- PM에게 DM 전송 성공
- 승인/거부 버튼이 포함됨
- 티켓 정보가 정확히 표시됨

### 워크플로우 2: 승인/거부 처리 플로우

#### 테스트 2.1: 버튼 클릭 파싱

**테스트 데이터:**
```json
{
  "type": 3,
  "data": {
    "custom_id": "approve_ticket_1702800000000"
  },
  "member": {
    "user": {
      "id": "1258331291846185033",
      "username": "pm_user"
    }
  },
  "message": {
    "id": "1234567890"
  },
  "channel_id": "9876543210"
}
```

**기대 결과:**
- action: "approve"
- requestId: "1702800000000"

#### 테스트 2.2: Google Sheets 조회

**테스트 방법:**
1. "Lookup Ticket in Sheets" 노드 테스트
2. request_id로 필터링 확인

**기대 결과:**
- 해당 티켓 데이터 정확히 조회됨

#### 테스트 2.3: JIRA 티켓 생성

**테스트 방법:**
1. "Create JIRA Ticket" 노드 테스트
2. JIRA에서 티켓 확인

**기대 결과:**
- JIRA에 티켓 생성됨
- 모든 필드가 정확함
- jira_key 반환됨 (예: PROJ-123)

#### 테스트 2.4: 상태 업데이트

**테스트 방법:**
1. "Update Approved Status" 노드 테스트
2. Google Sheets 확인

**기대 결과:**
- status: "approved"
- jira_key가 업데이트됨

### 워크플로우 3: 리마인더 플로우

#### 테스트 3.1: 스케줄 트리거

**테스트 방법:**
1. n8n에서 "Execute Workflow" 수동 실행

**기대 결과:**
- 워크플로우 실행됨

#### 테스트 3.2: Pending 티켓 필터링

**테스트 준비:**
1. Google Sheets에 테스트 데이터 추가:
   - request_id: 2시간 이전 timestamp
   - status: "pending"

**기대 결과:**
- 2시간 이상 된 pending 티켓만 필터링됨

#### 테스트 3.3: 리마인더 메시지

**기대 결과:**
- PM에게 DM 전송됨
- 대기 중인 티켓 목록 포함
- 대기 시간 표시 정확

---

## 통합 테스트

실제 플로우를 따라 엔드-투-엔드 테스트를 수행합니다.

### 시나리오 1: 티켓 생성부터 승인까지

**단계:**

1. **티켓 생성 (일반 사용자)**
   ```
   Discord에서 /create-ticket 입력
   ```

2. **Modal 입력**
   - Ticket Type: `Bug`
   - Ticket Title: `로그인 버튼 오류`
   - Ticket Description: `크롬에서 로그인 버튼이 클릭되지 않습니다`
   - Assignee: `john.doe`
   - Dates: `2024-12-16 ~ 2024-12-20`

3. **제출 확인**
   - "티켓 요청이 접수되었습니다" 메시지 확인
   - Google Sheets에서 새 행 확인
   - status: "pending" 확인

4. **PM 승인 요청 확인**
   - PM 계정으로 Discord 확인
   - DM 수신 확인
   - 티켓 정보 정확성 확인
   - 승인/거부 버튼 존재 확인

5. **승인 (PM)**
   - "승인" 버튼 클릭
   - "티켓이 승인되어 JIRA에 생성되었습니다" 메시지 확인

6. **JIRA 확인**
   - JIRA에서 새 티켓 생성 확인
   - 모든 필드 정확성 확인
   - JIRA Key 기록 (예: PROJ-123)

7. **Google Sheets 업데이트 확인**
   - status: "approved"
   - jira_key: "PROJ-123"

8. **요청자 알림 확인**
   - 일반 사용자 계정으로 Discord 확인
   - DM 수신 확인
   - JIRA 링크 확인

**성공 기준:**
- [ ] 모든 단계가 오류 없이 완료됨
- [ ] 데이터가 모든 시스템에 정확히 반영됨
- [ ] 모든 알림이 정상 전송됨

### 시나리오 2: 티켓 거부

**단계:**

1. 새 티켓 생성 (시나리오 1의 1-4단계 반복)

2. **거부 (PM)**
   - "거부" 버튼 클릭
   - "티켓이 거부되었습니다" 메시지 확인

3. **Google Sheets 확인**
   - status: "rejected"
   - jira_key: 비어있음

4. **요청자 알림 확인**
   - 거부 알림 DM 수신 확인

5. **JIRA 확인**
   - JIRA에 티켓이 생성되지 않았는지 확인

**성공 기준:**
- [ ] 거부 플로우가 정상 작동
- [ ] JIRA에 티켓 생성되지 않음
- [ ] 요청자에게 거부 알림 전송됨

### 시나리오 3: 리마인더

**단계:**

1. **테스트 데이터 준비**
   - Google Sheets에 수동으로 데이터 추가:
     ```
     request_id: 1702800000000 (3시간 전 timestamp)
     status: pending
     ```

2. **리마인더 워크플로우 수동 실행**
   - n8n에서 워크플로우 3 "Execute Workflow" 클릭

3. **PM DM 확인**
   - PM 계정으로 Discord 확인
   - 리마인더 메시지 수신 확인
   - 티켓 목록 확인
   - 대기 시간 확인 (예: "3시간 전 요청")

**성공 기준:**
- [ ] 2시간 이상 된 pending 티켓만 포함됨
- [ ] 대기 시간이 정확히 계산됨
- [ ] PM에게 리마인더 전송됨

---

## 시나리오 테스트

실제 사용 사례를 시뮬레이션합니다.

### 시나리오 4: 다중 티켓 동시 생성

**단계:**
1. 3명의 사용자가 동시에 `/create-ticket` 입력
2. 각각 다른 정보 입력
3. 모두 제출

**확인 사항:**
- [ ] 모든 티켓이 Google Sheets에 저장됨
- [ ] request_id가 중복되지 않음
- [ ] PM에게 3개의 DM 전송됨

### 시나리오 5: 특수 문자 처리

**테스트 데이터:**
```
Ticket Title: "테스트 & 특수문자 <>"
Ticket Description:
  여러 줄
  테스트

  - 리스트
  - 항목
```

**확인 사항:**
- [ ] 특수 문자가 정확히 저장됨
- [ ] JSON 파싱 오류 없음
- [ ] Discord 메시지 정상 표시

### 시나리오 6: 존재하지 않는 Assignee

**테스트 데이터:**
```
Assignee: non_existent_user
```

**기대 동작:**
- JIRA 티켓 생성 시 오류 발생
- 에러 로그 기록
- PM에게 오류 알림 (선택사항)

---

## 성능 테스트

### 부하 테스트

**시나리오:**
- 10개 티켓 동시 생성
- 모든 티켓 순차적 승인

**측정 항목:**
- 티켓 생성 시간 (Webhook → PM DM)
- 승인 처리 시간 (버튼 클릭 → JIRA 생성)
- Google Sheets 응답 시간

**목표:**
- 티켓 생성: < 5초
- 승인 처리: < 10초

### 리마인더 성능

**시나리오:**
- 100개 pending 티켓 존재
- 리마인더 워크플로우 실행

**측정 항목:**
- 필터링 시간
- 메시지 생성 시간
- 전체 실행 시간

**목표:**
- 전체 실행: < 30초

---

## 테스트 체크리스트

### 단위 테스트
- [ ] 워크플로우 1 - Webhook Trigger
- [ ] 워크플로우 1 - Modal 데이터 파싱
- [ ] 워크플로우 1 - Google Sheets 저장
- [ ] 워크플로우 1 - Discord DM 전송
- [ ] 워크플로우 2 - 버튼 클릭 파싱
- [ ] 워크플로우 2 - Google Sheets 조회
- [ ] 워크플로우 2 - JIRA 티켓 생성
- [ ] 워크플로우 2 - 상태 업데이트
- [ ] 워크플로우 3 - Pending 티켓 필터링
- [ ] 워크플로우 3 - 리마인더 메시지

### 통합 테스트
- [ ] 시나리오 1: 티켓 생성부터 승인까지
- [ ] 시나리오 2: 티켓 거부
- [ ] 시나리오 3: 리마인더

### 시나리오 테스트
- [ ] 시나리오 4: 다중 티켓 동시 생성
- [ ] 시나리오 5: 특수 문자 처리
- [ ] 시나리오 6: 존재하지 않는 Assignee

### 성능 테스트
- [ ] 부하 테스트
- [ ] 리마인더 성능

---

## 테스트 결과 기록

### 템플릿

```markdown
## 테스트 실행: [날짜]

### 테스트 환경
- n8n 버전:
- Discord Bot: 정상
- Google Sheets: 정상
- JIRA: 정상

### 테스트 결과

#### 단위 테스트
- 워크플로우 1: ✅ 통과 / ❌ 실패
- 워크플로우 2: ✅ 통과 / ❌ 실패
- 워크플로우 3: ✅ 통과 / ❌ 실패

#### 통합 테스트
- 시나리오 1: ✅ 통과 / ❌ 실패
- 시나리오 2: ✅ 통과 / ❌ 실패
- 시나리오 3: ✅ 통과 / ❌ 실패

### 발견된 이슈
1. [이슈 설명]
   - 재현 방법:
   - 영향도:
   - 해결 방법:

### 개선 사항
1. [개선 제안]
```

---

## 디버깅 팁

### n8n 실행 로그 확인

1. n8n에서 "Executions" 탭 이동
2. 실패한 실행 클릭
3. 각 노드의 입력/출력 데이터 확인

### Discord Webhook 테스트

```bash
# Discord에서 실제 Interaction 시뮬레이션
curl -X POST \
  -H "Content-Type: application/json" \
  -d @test-interaction.json \
  https://your-n8n-instance.com/webhook/discord-interaction
```

### Google Sheets API 테스트

```bash
# n8n에서 Google Sheets 노드 단독 실행
# "Test step" 버튼 사용
```

### JIRA API 테스트

```bash
# JIRA REST API 직접 호출
curl -u email@example.com:API_TOKEN \
  -X GET \
  https://your-domain.atlassian.net/rest/api/3/project
```

---

## 다음 단계

테스트 완료 후:
1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)에서 일반적인 문제 확인
2. 프로덕션 환경에 배포
3. 사용자 교육 실시
4. 모니터링 설정
