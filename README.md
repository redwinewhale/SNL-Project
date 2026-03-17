# 🛡️ 정보 보안 기초 학습 웹 게임 (Security Education Web Game)

정보 보안의 기초 개념을 쉽고 몰입감 있게 학습할 수 있도록 개발된 웹 기반 시뮬레이션 게임입니다. 
플레이어는 가상의 보안 요원이 되어 사내 직원들의 터미널에 접속하고, 정보 보안 퀴즈를 해결하여 시스템의 힌트 데이터를 추출하는 미션을 수행합니다.

## 🎮 주요 기능 (Core Features)

* **Phaser 3 & DOM 상호작용:** 게임 엔진(Phaser 3)의 캔버스와 HTML DOM 모달(메일 알림, 터미널)이 실시간으로 커스텀 이벤트를 주고받으며 유기적으로 작동합니다.
* **객관식 보안 퀴즈 시스템:** 게임 내 직원을 클릭하면 해당 직원의 권한 레벨에 맞는 정보 보안 퀴즈(객관식)가 해커 터미널 형태의 모달로 출력됩니다.
* **동적 힌트 수집 인벤토리:** 퀴즈의 정답을 맞출 경우, 게임 화면 우측의 인벤토리 빈칸(`[ ] _______`)에 서버로부터 획득한 힌트 데이터가 실시간으로 해금되어 표시됩니다.
* **임시 테스트 서버 (Mock Server):** 실제 백엔드 API 연동 전, 프론트엔드 로직을 독립적으로 테스트할 수 있는 Express 기반의 경량 테스트 서버를 구축하여 개발 효율성을 높였습니다.

## 🛠️ 기술 스택 (Tech Stack)

* **Frontend:** HTML5, CSS3, JavaScript (ES6+), Phaser 3, Axios, Vite
* **Backend (Mock / Testing):** Node.js, Express, CORS

## 📁 프로젝트 구조 (Project Structure)

프로젝트는 프론트엔드(웹 게임)와 백엔드(서버/DB) 환경을 명확히 분리하여 관리합니다.

```text
📦 Project Root
┣ 📂 client               # 프론트엔드 (Phaser 웹 게임)
┃ ┣ 📂 public             # 정적 에셋 (이미지 등)
┃ ┣ 📂 src
┃ ┃ ┣ 📂 scenes           # Phaser 씬 (BootScene, MailScene, GameScene)
┃ ┃ ┣ 📜 main.js          # 게임 초기화 및 DOM 이벤트/통신 제어
┃ ┃ ┗ 📜 style.css        # 모달 및 UI 스타일
┃ ┣ 📜 index.html         
┃ ┣ 📜 package.json        
┣ 📂 test-server          # 임시 테스트 서버 (API 및 가짜 DB)
┃ ┣ 📜 server.js          
┃ ┗ 📜 package.json       
┗ 📜 README.md            # 프로젝트 명세서
```

##  🚀 로컬 실행 방법 (How to Run)
프로젝트를 로컬 환경에서 실행하려면 터미널을 2개 열어 프론트엔드와 서버를 각각 구동해야 합니다.

1. 테스트 서버 구동 (Terminal 1)
```Bash
cd test-server
npm install
node server.js
```

서버가 http://localhost:3000 포트에서 대기 상태가 됩니다.

2. 클라이언트 게임 구동 (Terminal 2)
```Bash
cd client
npm install
npm run dev
```
터미널에 출력된 로컬호스트 주소(예: http://localhost:5173)로 접속하여 게임을 플레이합니다.


---