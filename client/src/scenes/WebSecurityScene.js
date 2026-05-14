import * as Phaser from 'phaser';

export default class WebSecurityScene extends Phaser.Scene {
    constructor() {
        super('WebSecurityScene');
    }

    init(data) {
        // 이전 씬에서 난이도, 층수 등의 데이터를 받아올 수 있음
        this.floor = data.floor || 1;
        this.remainingTime = data.time || 600; // 10분 (600초)
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. Phaser 배경: 웹 보안 관제망 느낌의 어두운 배경과 그리드
        this.cameras.main.setBackgroundColor('#020617');
        
        const grid = this.add.grid(width / 2, height / 2, width, height, 50, 50, 0x000000, 0, 0x1e293b, 0.5);
        
        // 스캐닝 라인 애니메이션
        this.scanLine = this.add.rectangle(width / 2, 0, width, 4, 0x10b981, 0.8);
        this.scanLine.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
            targets: this.scanLine,
            y: height,
            duration: 3000,
            repeat: -1,
            yoyo: false
        });

        // 2. HTML UI 생성
        this.createWebGameUI();

        // 3. 타이머 로직
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    createWebGameUI() {
        // 기존 데스크탑 UI 숨기기
        const desktopShell = document.getElementById('desktop-shell');
        if (desktopShell) desktopShell.style.display = 'none';

        // 새로운 게임 UI 컨테이너 생성
        this.gameUI = document.createElement('div');
        this.gameUI.id = 'web-game-ui';
        
        // 직원(문제)을 세션 로그 형태로 5개 생성
        let sessionsHtml = '';
        for(let i=1; i<=5; i++) {
            sessionsHtml += `
                <div class="session-block" data-id="${i}">
                    <div class="session-header">Session_ID: EMP_10${i}</div>
                    <div class="session-ip">IP: 192.168.1.${10+i}</div>
                    <div class="session-status">상태: 패킷 스캔 대기 중...</div>
                </div>
            `;
        }

        this.gameUI.innerHTML = `
            <div class="web-header">
                <div class="floor-display">📍 현재 위치: 사내망 ${this.floor}층</div>
                <div class="timer-display" id="game-timer">⏳ 남은 시간: 10:00</div>
            </div>
            <div class="web-main-content">
                <div class="sessions-container">
                    <div class="section-title">▶ 활성 사내망 세션 목록 (클릭하여 취약점 점검)</div>
                    ${sessionsHtml}
                </div>
                <div class="side-panel">
                    <div class="hint-terminal">
                        <div class="terminal-header">Terminal - 단서 로그</div>
                        <div class="terminal-content" id="hint-content">
                            > 시스템 보안 점검을 시작합니다.<br>
                            > 세션을 스캔하여 스파이의 단서를 수집하십시오.<br>
                            <span class="cursor">_</span>
                        </div>
                    </div>
                    <button class="spy-btn">🚨 스파이 지목 및 차단 🚨</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.gameUI);

        // 이벤트 리스너 등록
        this.gameUI.querySelectorAll('.session-block').forEach(block => {
            block.addEventListener('click', (e) => {
                const empId = e.currentTarget.getAttribute('data-id');
                console.log(`[시스템] 직원 ${empId}번 세션 문제 열람`);
                // TODO: 여기에 문제를 띄우는 로직 연결
            });
        });

        this.gameUI.querySelector('.spy-btn').addEventListener('click', () => {
            alert("스파이 지목 창이 뜹니다!");
        });
    }

    updateTimer() {
        if (this.remainingTime > 0) {
            this.remainingTime--;
            const minutes = String(Math.floor(this.remainingTime / 60)).padStart(2, '0');
            const seconds = String(this.remainingTime % 60).padStart(2, '0');
            const timerEl = document.getElementById('game-timer');
            if (timerEl) {
                timerEl.innerText = `⏳ 남은 시간: ${minutes}:${seconds}`;
                if (this.remainingTime <= 60) timerEl.style.color = '#ef4444'; // 1분 남으면 빨간색
            }
        } else {
            // 시간 초과 로직
        }
    }
}