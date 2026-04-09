# 🛡️ 프로젝트명: [게임 이름 미정] (보안 교육용 웹 퀴즈 게임)

## 📖 프로젝트 개요
SSL 연구실 팀 프로젝트로 진행되는 **웹 기반 보안 교육용 퀴즈 게임**입니다. 유저는 정적인 화면 내에서 직원들을 클릭하여 보안 문제를 풀고, 획득한 힌트를 조합해 각 층에 숨어있는 스파이를 찾아내며 총 5층을 클리어해야 합니다. 
단순한 퀴즈를 넘어, 유저의 취약한 보안 유형을 AI가 분석하여 맞춤형 난이도를 제공하고, 실제 코드를 작성하는 샌드박스형 실습을 통해 실질적인 보안 지식을 학습하는 것을 목표로 합니다.

## 👥 팀 구성 및 역할
* **총괄 인원:** 5명
* **역할 분담:**
    * **UI 및 클라이언트:** 윤원주, 민서정, 박시은
    * **Server:** 신승열
    * **DataBase:** 김민정
    * **문제 제작:** 김재호

## 🛠️ 기술 스택 (Tech Stack)
* **Client:** Phaser 3 (정적 클릭 인터랙션 구현)
* **Server:** Node.js, Express
* **Database:** MySQL
* **AI Engine:** Ollama (로컬 LLM 구동)
* **Sandbox:** Docker (일회용 컨테이너 기반 격리 실행)
* **Auth:** Google Login API, JWT (JSON Web Token)

## 🎮 게임 핵심 시스템 (Core Gameplay)

### 1. 게임 루프 & 스파이 검증
* 원하는 보안 분야를 선택하여 게임 시작 (제한 시간 부여).
* 맵(정적 화면)에서 직원을 클릭하여 기초 학습용 힌트가 포함된 보안 문제 풀이 진행.
* 문제를 풀고 얻은 랜덤 힌트를 조합하여 해당 층의 스파이 지목.
* **스파이 지목 실패 시:** 남은 시간 대폭 차감 (패널티).
* **스파이 지목 성공 시:** 다음 층으로 이동 (총 5층 구성).

### 2. 패널티 누적 및 반복 학습 로직
* 문제를 틀릴 경우 다음 문제로 넘어가지 않고, 정답을 맞힐 때까지 반복해서 풀어야 함.
* 오답 제출 시 시간 단축 및 점수 감소 패널티가 실시간으로 누적됨.
* 제출한 모든 오답 텍스트는 DB(`Game_Logs`)에 기록되어 추후 오답 노트에 활용됨.

### 3. AI 맞춤형 난이도 조절 (Adaptive Learning)
* 층을 넘어갈 때마다 AI(Ollama)가 개입하여 다음 층의 문제 난이도와 세부 유형 결정.
* **분석 기준:** 이전 층의 정답률, 걸린 시간뿐만 아니라 **'네트워크 - SSL/TLS 핸드쉐이크' 등 세부 유형(Sub-category)별 오답 빈도**를 분석.
* 유저가 자주 틀리는 취약 유형을 다음 층에 집중적으로 배치하여 교육 효과 극대화.

### 4. 심화 실습 문제 (Sandbox)
* 특정 레벨 달성 시, 객관식/단답형이 아닌 실제 코드 기반의 실습 문제 해금.
* 유저가 작성한 코드는 Node.js 서버를 거쳐 Docker 기반의 격리된 샌드박스 환경에서 실행 및 안전하게 검증됨.

### 5. 마이페이지 & 오답 노트 (Review System)
* **기록 보존:** 게임 오버 또는 5층 클리어 후, 맞은 문제와 틀린 문제 모두에 대한 상세 해설 제공.
* **취약점 분석:** 마이페이지에서 자신이 자주 틀리는 세부 보안 유형 통계 확인 가능.
* **실습 복습:** 샌드박스 문제에서 자신이 직접 작성했던 소스 코드와 실행 결과를 다시 열람하며 복습 가능.
* **랭킹 및 업적:** 클리어 타임, 오답 횟수, 문제 난이도를 합산해 랭킹에 등록하고 조건(예: 무오답 클리어) 충족 시 업적 달성.

---

## 📡 API 명세서 (API Specifications)

모든 API 응답은 JSON 형식을 따르며, 게임 시작 이후의 모든 요청은 Header에 `Authorization: Bearer <JWT_TOKEN>`을 포함해야 합니다.

### 1. 인증 및 초기화 (Auth & Init)
| 기능 | Method | Endpoint | Request (Body) | Response (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| **구글 로그인** | `POST` | `/api/auth/login` | `{ "idToken": "String" }` | `{ "token": "JWT", "nickname": "String" }` |
| **게임 시작** | `POST` | `/api/game/start` | `{ "field": "String" }` | `{ "session_id": Int, "start_time": "Date", "initial_time_limit": Int }` |

### 2. 게임 핵심 흐름 및 AI 연동 (Game Flow)
| 기능 | Method | Endpoint | Request (Params/Body) | Response (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| **층 데이터 로드**<br>*(AI 난이도 분석)* | `GET` | `/api/game/session/:session_id/floor/:floor_num` | URL Params | `{ "floor": Int, "difficulty_applied": Int, "quizzes": [...], "hints_available": Int }` |
| **퀴즈 제출 및 패널티** | `POST` | `/api/quiz/submit` | `{ "session_id": Int, "quiz_id": Int, "answer": "String" }` | **[정답]** `{ "is_correct": true, "remaining_time": Int }`<br>**[오답]** `{ "is_correct": false, "penalty_time": Int, "remaining_time": Int }` |
| **스파이 지목 검증** | `POST` | `/api/spy/verify` | `{ "session_id": Int, "floor_num": Int, "spy_id": Int }` | **[성공]** `{ "is_success": true, "next_floor": Int }`<br>**[실패]** `{ "is_success": false, "penalty_time": Int, "remaining_time": Int }` |

### 3. 실습 환경 (Sandbox)
| 기능 | Method | Endpoint | Request (Body) | Response (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| **실습 코드 실행**<br>*(Docker 컨테이너)* | `POST` | `/api/practice/run` | `{ "session_id": Int, "quiz_id": Int, "user_code": "String" }` | `{ "is_cleared": Boolean, "execution_result": "String (Logs)" }` |

### 4. 게임 종료 및 마이페이지 (End & History)
| 기능 | Method | Endpoint | Request (Params/Body) | Response (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| **세션 종료 및 결과** | `POST` | `/api/game/end` | `{ "session_id": Int, "status": "clear / fail" }` | `{ "final_score": Int, "achievements": [...], "detailed_explanations": [...] }` |
| **유저 통계 조회** | `GET` | `/api/user/stats` | Header JWT | `{ "level": Int, "weak_sub_categories": [...], "clear_history": [...] }` |
| **오답노트 상세 조회** | `GET` | `/api/user/history/:log_id` | URL Params | `{ "quiz_info": {...}, "my_wrong_answers": [...], "submitted_code": "..." }` |

# 🗄️ 데이터베이스 논리적 설계서 (Logical DB Schema)

이 문서는 보안 교육 게임의 원활한 흐름(패널티 누적, AI 맞춤형 난이도 추론, 샌드박스 실습, 마이페이지 오답노트)을 지원하기 위한 테이블별 데이터 적재 목적과 구성 명세입니다.

---

## 1. Users (사용자 정보)
구글 로그인 API를 통해 획득한 유저의 식별 정보와 게임 내 성장 지표를 저장합니다.

* **user_id (PK):** 유저 고유 식별자 (정수형)
* **email:** 구글 로그인 계정 이메일
* **nickname:** 게임 내 표시될 닉네임
* **level:** 현재 유저의 레벨 (특정 레벨 도달 시 샌드박스 실습 문제 해금)
* **total_exp:** 누적 경험치 (게임 클리어 시 획득)
* **created_at:** 가입 일시

## 2. Quizzes (보안 퀴즈 및 실습 데이터)
게임에 출제될 모든 정적 문제 데이터를 관리합니다. AI(Ollama)가 이 테이블의 '세부 유형'과 '난이도'를 기준으로 문제를 선별합니다.

* **quiz_id (PK):** 문제 고유 식별자
* **field:** 대분류 (예: '네트워크', '웹 보안', '시스템')
* **sub_category:** 세부 유형 (예: 'SSL/TLS', 'SQL Injection', '포트 스캐닝') - **AI 취약점 분석의 핵심 기준값**
* **difficulty:** 난이도 (1 ~ 5)
* **question:** 문제 본문
* **answer:** 정답 (객관식 번호 또는 단답형 텍스트)
* **educational_hint:** 인게임 문제 풀이 화면에서 상시 보여줄 기초 보안 개념 힌트
* **explanation_detailed:** 오답노트(마이페이지)에서 보여줄 상세 해설 텍스트
* **is_practice:** 샌드박스 실습 문제 여부 (Boolean / True 시 코드 입력기 활성화)
* **practice_code_template:** 실습 문제일 경우, 유저에게 처음에 보여줄 뼈대 코드 (없으면 Null)

## 3. Spy_Hints (층별 스파이 및 힌트 세트)
각 층(1~5층)마다 배치될 스파이의 정체와, 문제를 풀 때마다 유저에게 랜덤으로 제공될 힌트 조각들을 관리합니다.

* **hint_id (PK):** 힌트 고유 식별자
* **floor_num:** 배치될 층 번호 (1 ~ 5)
* **spy_name:** 해당 층의 실제 스파이 이름 (최종 지목 검증 시 사용)
* **hint_text:** 문제를 하나 클리어할 때마다 유저에게 제공될 힌트 텍스트 (예: "스파이는 안경을 썼다")

## 4. Game_Sessions (게임 세션 - 한 판 단위 묶음)
유저가 게임을 시작해서 끝날 때까지의 전반적인 상태와 '시간 패널티'를 관리하는 허브 테이블입니다.

* **session_id (PK):** 게임 한 판의 고유 식별자
* **user_id (FK):** 플레이 중인 유저 ID
* **status:** 현재 게임 상태 (PLAYING, CLEAR, FAIL)
* **start_time:** 게임 시작 시간
* **end_time:** 게임 종료 시간 (클리어 또는 타임오버 발생 시각)
* **remaining_time:** 현재 남은 제한 시간(초). 오답을 제출하거나 스파이 지목에 실패하면 이 값이 서버에서 차감됨 (**패널티 시스템의 핵심**)
* **total_score:** 최종 획득 점수 (소요 시간 + 푼 문제 난이도 - 오답 감점 계산 결과)

## 5. Game_Logs (상세 플레이 로그)
유저가 퀴즈를 풀기 위해 시도한 모든 내역을 기록합니다. **AI의 다음 층 난이도 추론을 위한 입력 데이터**이자, **마이페이지 오답노트의 근간**이 되는 가장 중요한 테이블입니다.

* **log_id (PK):** 로그 고유 식별자
* **session_id (FK):** 속한 게임 세션 ID
* **user_id (FK):** 플레이한 유저 ID
* **quiz_id (FK):** 풀었던 문제 ID
* **wrong_answers:** 유저가 제출했던 오답들의 모음. (JSON 배열 형태 적재, 예: `["option1", "option3"]`) - 오답노트 출력용
* **user_code:** 실습 문제일 경우, 유저가 샌드박스에 제출한 전체 소스 코드 텍스트
* **execution_result:** Docker 샌드박스 실행 후 반환된 터미널 로그 결과
* **attempt_count:** 이 문제를 맞히기 위해 총 몇 번을 시도했는지 (오답 횟수 = attempt_count - 1)
* **is_cleared:** 최종적으로 이 문제를 통과했는지 여부 (Boolean)

## 6. Achievements (업적 시스템)
게임 클리어 시 특정 조건(예: 시간제한, 무오답 등)을 달성했는지 확인하고 해금된 업적을 저장합니다.

* **achieve_id (PK):** 업적 고유 식별자
* **user_id (FK):** 달성한 유저 ID
* **achieve_type:** 업적의 종류 코드 (예: 'CLEAR_UNDER_10MIN', 'ZERO_MISTAKES')
* **is_unlocked:** 해금 여부 (Boolean)
* **unlocked_at:** 업적 달성 일시
