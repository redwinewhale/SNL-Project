import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MailScene from './scenes/MailScene';
import GameScene from './scenes/GameScene';
import axios from 'axios';
import './style.css';

// ==========================================
// 1. Phaser 게임 설정 및 초기화
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    transparent: true,
    backgroundColor: 'rgba(0,0,0,0)',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [BootScene, MailScene, GameScene] 
};

const game = new Phaser.Game(config);

// ==========================================
// 2. 전역 상태 변수
// ==========================================
let currentQuizData = null; 
let currentEmployeeId = null;

// ==========================================
// 3. HTML DOM 요소 연결
// ==========================================
const mailModal = document.getElementById('mailModal');
const exeButton = document.getElementById('exeButton');
const desktopShell = document.getElementById('desktop-shell');

const quizModal = document.getElementById('quizModal');
const quizTitle = document.getElementById('quizTitle');
const closeQuizBtn = document.getElementById('closeQuizBtn');
const quizQuestionText = document.getElementById('quizQuestionText');
const quizChoicesContainer = document.getElementById('quizChoicesContainer');
const taskbarTime = document.getElementById('taskbarTime');
const taskbarDate = document.getElementById('taskbarDate');

document.body.classList.add('boot-mode');
desktopShell.classList.add('hidden');

function updateTaskbarClock() {
    const now = new Date();

    taskbarTime.textContent = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    taskbarDate.textContent = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

updateTaskbarClock();
setInterval(updateTaskbarClock, 1000);

// ==========================================
// 4. 기본 UI 이벤트 리스너
// ==========================================
// [메일] EXE 버튼 클릭 시 GameScene 이동
exeButton.addEventListener('click', () => {
    mailModal.classList.add('hidden');
    desktopShell.classList.add('hidden');
    document.body.classList.add('exe-mode');
    const mailScene = game.scene.getScene('MailScene');
    mailScene.scene.start('GameScene'); 
});

// [퀴즈] 닫기 버튼
closeQuizBtn.addEventListener('click', () => {
    quizModal.classList.add('hidden');
});

// ==========================================
// 5. 서버 통신 및 정답 확인 로직
// ==========================================
async function checkAnswer(selectedIndex) {
    if (selectedIndex === currentQuizData.answer) {
        // --- 정답 처리 ---
        alert('[SUCCESS] 보안 인가 확인. 데이터를 추출합니다.');
        
        try {
            // 서버에 클리어 상태 전송 (실제 API 경로 확인 필요)
            await axios.post('http://localhost:3000/api/quiz/success', {
                employeeId: currentEmployeeId,
                status: 'cleared'
            });
            
            // 힌트 업데이트를 위해 Phaser 측으로 이벤트 발송
            window.dispatchEvent(new CustomEvent('hint-unlocked', { 
                detail: { hintText: currentQuizData.hint } 
            }));

        } catch (error) {
            console.error('서버 동기화 실패:', error);
        } finally {
            quizModal.classList.add('hidden');
        }
    } else {
        // --- 오답 처리 ---
        alert('[DENIED] 잘못된 접근입니다. 다시 선택하십시오.');
    }
}

// ==========================================
// 6. Phaser에서 보낸 커스텀 이벤트 수신
// ==========================================
window.addEventListener('open-mail-modal', () => {
    mailModal.classList.remove('hidden');
});

window.addEventListener('show-desktop-shell', () => {
    desktopShell.classList.remove('hidden');
    document.body.classList.remove('boot-mode');
});

window.addEventListener('open-quiz-modal', async (event) => {
    const employeeData = event.detail; 
    currentEmployeeId = employeeData.id;
    
    // UI 초기화
    quizTitle.textContent = `> TARGET_${employeeData.name} 데이터 접속 중...`;
    quizChoicesContainer.innerHTML = ''; 
    quizQuestionText.innerHTML = '> 서버 연결 중...<br>> 보안 프로토콜 복호화 대기 중 (Fetching Data...)<span class="blink">_</span>';
    quizModal.classList.remove('hidden');
    
    try {
        // 퀴즈 데이터 요청 (실제 백엔드 포트에 맞게 수정)
        const response = await axios.get(`http://localhost:3000/api/quiz/${currentEmployeeId}`);
        currentQuizData = response.data;
        
        quizQuestionText.innerHTML = `[SYSTEM_ALERT] 보안 프로토콜 위반이 감지되었습니다.<br>> ${currentQuizData.question}`;
        
        // 동적 객관식 버튼 생성
        currentQuizData.choices.forEach((choiceText, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = `[${index + 1}] ${choiceText}`;
            btn.onclick = () => checkAnswer(index);
            quizChoicesContainer.appendChild(btn);
        });

    } catch (error) {
        console.error('퀴즈 데이터 호출 실패:', error);
        quizQuestionText.innerHTML = '> [ERROR] 서버 연결에 실패했습니다.';
    }
});
