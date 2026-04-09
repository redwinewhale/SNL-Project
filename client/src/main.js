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
const spyModal = document.getElementById('spyModal');
const closeSpyBtn = document.getElementById('closeSpyBtn');
const spyChoicesContainer = document.getElementById('spyChoicesContainer');

const nextFloorModal = document.getElementById('nextFloorModal');
const nextFloorText = document.getElementById('nextFloorText');
const nextFloorBtn = document.getElementById('nextFloorBtn');
let globalCurrentFloor = 1;

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

// ==========================================
// 스파이 지목 모달 제어 및 검증 로직
// ==========================================
// 닫기 버튼 로직
closeSpyBtn.addEventListener('click', () => {
    spyModal.classList.add('hidden');
});

// Phaser에서 모달 열기 이벤트 수신
window.addEventListener('open-spy-modal', () => {
    // UI 초기화
    spyChoicesContainer.innerHTML = '';
    spyModal.classList.remove('hidden');

    // 5명의 직원 선택 버튼 동적 생성
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = `TARGET_직원 ${i}`;
        // 버튼 클릭 시 검증 함수 호출
        btn.onclick = () => checkSpyAnswer(i, `직원 ${i}`);
        spyChoicesContainer.appendChild(btn);
    }
});

// 스파이 검증 API 통신 함수
async function checkSpyAnswer(id, name) {
    if (!confirm(`[SYSTEM] 정말 TARGET_${name}을(를) 내부 스파이로 지목하시겠습니까?`)) {
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/spy/check', {
            employeeId: id
        });

        if (response.data.isSpy) {
            // [성공 시 수정된 로직]
            spyModal.classList.add('hidden');
            
            if (globalCurrentFloor < 5) {
                // 1~4층일 경우 다음 층 이동 모달 띄우기
                nextFloorText.innerHTML = `[SUCCESS] 정답입니다!<br>${name}이(가) 스파이로 판명되었습니다.<br>시스템 보안이 정상화되었습니다.`;
                nextFloorModal.classList.remove('hidden');
            } else {
                // 5층을 클리어했을 경우 최종 엔딩
                alert(`[SUCCESS] 5층의 모든 스파이를 검거했습니다!\n게임을 최종 클리어하셨습니다!`);
                // TODO: 게임 클리어 최종 씬(Scene) 이동이나 축하 모달 띄우기
            }
        } else {
            // 오답 처리 (유지)
            alert(`[FAILED] 오답입니다. TARGET_${name}은(는) 스파이가 아닙니다.\n보안 시스템에 치명적인 오류가 발생합니다!`);
            spyModal.classList.add('hidden');
            // TODO: 오답 페널티 처리
        }
    } catch (error) {
        console.error('스파이 확인 요청 실패:', error);
        alert('[ERROR] 서버와의 통신에 실패했습니다.');
    }
}

// ==========================================
// 7. 클릭 제한 및 에러 모달 제어 로직
// ==========================================
const errorModal = document.getElementById('errorModal');
const closeErrorBtn = document.getElementById('closeErrorBtn');

// 클릭 시 에러를 발생시킬 클래스들을 모두 선택합니다.
// 바탕화면 아이콘, 윈도우 시작 버튼, 검색 버튼, 작업표시줄 앱들
const blockedElements = document.querySelectorAll('.desktop-icon, .windows-badge, .search-pill, .taskbar-app');

// 닫기 버튼을 누르면 에러 창을 다시 숨깁니다.
closeErrorBtn.addEventListener('click', () => {
    errorModal.classList.add('hidden');
});

// 선택한 모든 요소에 클릭 이벤트를 달아줍니다.
blockedElements.forEach(element => {
    element.addEventListener('click', () => {
        // 이미 메일 창(.exe 실행창)이나 게임 화면으로 넘어간 상태라면 
        // 에러를 띄우지 않도록 방어 로직을 추가할 수 있습니다.
        if (document.body.classList.contains('boot-mode') || document.body.classList.contains('exe-mode')) {
            return;
        }
        
        // 에러 모달 표시
        errorModal.classList.remove('hidden');
    });
});


nextFloorBtn.addEventListener('click', () => {
    globalCurrentFloor++; // 층수 증가
    nextFloorModal.classList.add('hidden'); // 모달 숨기기
    
    // Phaser 씬으로 다음 층 시작 이벤트와 증가된 층수 데이터 발송
    window.dispatchEvent(new CustomEvent('next-floor-start', { 
        detail: { floor: globalCurrentFloor } 
    }));
});