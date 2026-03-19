import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 현재 경로(__dirname) 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/**
 * 🌟 [경로 수정] 
 * 이제 test.html이 server 폴더 안에 함께 있으므로 
 * 현재 폴더(__dirname)를 정적 파일 경로로 지정합니다.
 */
app.use(express.static(__dirname));

// 1. 5층 부서 정보 설정 (변수명 floor 유지)
const floorConfigs = {
    1: { name: "네트워크 보안팀" },
    2: { name: "데이터베이스 관리팀" },
    3: { name: "시스템 운영팀" },
    4: { name: "웹 애플리케이션 보안팀" },
    5: { name: "물리 보안 및 자산관리팀" }
};

// 2. 임시 DB (각 층별 직원 1~5번 퀴즈 및 힌트)
const quizDatabase = {
    1: { 
        1: { question: "Q1. 다음 중 가장 강력한 패스워드는?", choices: ["123456", "password", "admin", "P@ssw0rd123!"], answer: 3, hint: "첫 번째 서버의 포트 번호는 8080입니다." },
        2: { question: "Q2. 데이터베이스를 보호하기 위한 공격 방어 기법은?", choices: ["모니터 끄기", "Prepared Statement 사용", "마우스 더블클릭", "키보드 청소"], answer: 1, hint: "관리자 계정의 초기 비밀번호는 'root'입니다." },
        3: { question: "Q3. 출처가 불분명한 이메일 수신 시 올바른 조치는?", choices: ["첨부파일 실행", "보낸 사람에게 답장", "즉시 삭제 및 보안팀 신고", "동료에게 전달"], answer: 2, hint: "보안 키워드는 'Phaser'입니다." },
        4: { question: "Q4. 랜섬웨어 감염이 의심될 때 가장 먼저 해야 할 일은?", choices: ["해커에게 송금", "네트워크 선 뽑기", "바탕화면 변경", "백신 프로그램 삭제"], answer: 1, hint: "네트워크 물리적 분리가 최우선입니다." },
        5: { question: "Q5. 다음 중 물리적 보안 위협에 해당하는 것은?", choices: ["디도스 공격", "비밀번호 유출", "서버실 무단 침입", "피싱 사이트 접속"], answer: 2, hint: "마스터 키는 3층 데스크 아래에 있습니다." }
    }
    // 2~5층 데이터는 필요시 위와 동일한 구조로 추가 가능
};

// 게임 세션 저장소
const sessions = {};

/**
 * [API 1] 게임 시작 및 초기화
 */
app.post('/api/game/start', (req, res) => {
    const sessionId = uuidv4();
    const spiesPerFloor = {};
    
    // 각 층마다 1~5번 중 랜덤하게 스파이를 정합니다.
    for (let i = 1; i <= 5; i++) {
        spiesPerFloor[i] = Math.floor(Math.random() * 5) + 1;
    }

    sessions[sessionId] = {
        currentFloor: 1,
        spiesPerFloor: spiesPerFloor,
        isGameOver: false
    };

    res.status(201).json({
        success: true,
        sessionId,
        currentFloor: 1,
        department: floorConfigs[1].name,
        message: "보안 요원 투입. 1층 부서의 스파이를 찾아내십시오."
    });
});

/**
 * [API 2] 퀴즈 데이터 요청
 */
app.get('/api/quiz/:floor/:staffId', (req, res) => {
    const { floor, staffId } = req.params;
    const floorQuizzes = quizDatabase[floor] || quizDatabase[1]; 
    const quiz = floorQuizzes[staffId];

    if (quiz) {
        const { question, choices } = quiz;
        res.status(200).json({ question, choices });
    } else {
        res.status(404).json({ message: "해당 직원을 찾을 수 없습니다." });
    }
});

/**
 * [API 3] 퀴즈 정답 검증 및 힌트 획득
 */
app.post('/api/quiz/verify', (req, res) => {
    const { floor, staffId, userAnswer } = req.body;
    const floorQuizzes = quizDatabase[floor] || quizDatabase[1];
    const quiz = floorQuizzes[staffId];

    if (quiz && parseInt(userAnswer) === quiz.answer) {
        res.status(200).json({
            isCorrect: true,
            hint: quiz.hint,
            message: "힌트를 획득했습니다."
        });
    } else {
        res.status(200).json({ isCorrect: false, message: "접근 권한이 거부되었습니다." });
    }
});

/**
 * [API 4] 스파이 최종 확인 및 층 이동/재시작 로직
 */
app.post('/api/spy/check', (req, res) => {
    const { sessionId, floor, staffId } = req.body;
    const session = sessions[sessionId];

    if (!session) return res.status(404).json({ message: "세션이 존재하지 않습니다." });

    const isCorrectSpy = parseInt(staffId) === session.spiesPerFloor[floor];

    if (isCorrectSpy) {
        // 성공: 다음 층 이동
        const isGameClear = (parseInt(floor) === 5);
        if (!isGameClear) {
            session.currentFloor += 1;
        }

        res.status(200).json({
            status: "SUCCESS",
            isGameClear,
            nextFloor: isGameClear ? null : session.currentFloor,
            nextDept: isGameClear ? null : floorConfigs[session.currentFloor].name,
            message: isGameClear ? "축하합니다! 부서의 스파이를 검거했습니다." : "스파이 검거 성공! 다음 부서로 이동합니다."
        });
    } else {
        // 실패: 1층 리셋
        session.currentFloor = 1; 
        res.status(200).json({
            status: "FAIL",
            nextFloor: 1,
            nextDept: floorConfigs[1].name,
            message: "스파이가 도망쳤습니다. 다시 추적하세요."
        });
    }
});

app.listen(PORT, () => {
    console.log(`🛡️ SNL 프로젝트 서버 실행 중: http://localhost:${PORT}`);
});