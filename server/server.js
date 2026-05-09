import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = 3000;

// 구글 OAuth 클라이너트 (나중에 실제 CLIENT_ID로 교체)
const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// JWT 서명 키 (나중에 .env로 분리)
const JWT_SECRET ='snl-secret-key';

// ─────────────────────────────────────────
// 미들웨어 설정
// 모든 요청이 라우터 도달 전에 거치는 공통 처리
// ─────────────────────────────────────────

// CORS: 다른 도메인(클라이언트)에서 오는 요청 허용
app.use(cors());

// JSON 파싱: req.body를 객체로 읽을 수 있게 해줌
app.use(express.json());

// ─────────────────────────────────────────
// JWT 인증 미들웨어
// 로그인 이후 모든 보호된 라우터 앞에 붙임
// ─────────────────────────────────────────
const authenticateToken = (req, res, next) => {
    // Header에서 토큰 추출
    // Authorization: Bearer <토큰> 형식
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }
    
    // 토큰 검증
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
        }
        // 검증 성공 시 유저 정보를 req에 담아서 다음으로 넘김
        req.user  = user;
        next(); // 다음 미들웨어 또는 라우터로 이동
    });
}

// ─────────────────────────────────────────
// Step 1: 인증 (Auth)
// ─────────────────────────────────────────

// 구글 로그인
// 클라이언트가 구글에서 받은 idToken을 서버로 보내면
// 서버가 검증 후 자체 JWT 발급
app.post('/api/auth/login', async (req, res) => {
    const { idToken } = req.body;

    try {
        // 구글 idToken 검증
        const ticket = await oAuth2Client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const nickname = payload.name;
        const email = payload.email;

        // 자체 JWT 발급 (1시간 유효) 
        const token = jwt.sign(
            { email, nickname },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });

    } catch (err) {
        console.error(`[AUTH ERROR]: ${err.message}`, err);
        res.status(401).json({ message: '구글 인증 실패' });
    }
});

// ─────────────────────────────────────────
// Step 1: 게임 세션 (Game Session)
// ─────────────────────────────────────────

// 게임 시작
// 클라이언트가 field(분야)를 보내면 세션 생성 후 반환 async (req, res)는 인증안함
app.post('/api/game/start', authenticateToken, (req, res) => { 
    const { field } = req.body || {};
    
    // 임시 세션 데이터 (나중에 DB 연동)
    const session = {
        session_id: Date.now(), // 임시 ID (DB 연동 후 교체)
        start_time: new Date().toISOString(),
        initial_time_limit: 600, // 10qns
        field,
    };

    console.log(`[GAME START] 유저: ${req.user.nickname} | 분야: ${field}`);
    res.status(200).json({ session });
});

// ─────────────────────────────────────────
// Step 2: 핵심 게임 루프 및 AI 개입 (Game Flow & AI
// ─────────────────────────────────────────

// 층 데이터 로드
// url 파라미터로 세션 ID와 층 번호 받음
// 해당 층의 퀴즈 목록 반환
// 나중에 ollama 난이도 조절 로직 추가 예정
app.get('/api/game/session/:session_id/floor/:floor_num', authenticateToken, (req, res) => {
    const { session_id, floor_num } = req.params;

    // 임시 퀴즈 데이터 (나중에 DB 연동, Ollama 난이도 조절)
    const quizzes = [
        {
            quiz_id: 1,
            categories: "암호학",
            Level: "쉬움",
            question: 'Q1. 다음 중 가장 강력한 패스워드는?',
            options: ['123456', 'password', 'admin', 'P@ssw0rd123!'],
            answer: 3,
            hint: "null",
            educational_hint: '첫 번째 서버의 포트 번호는 8080입니다.'
        },
        {
            quiz_id: 2,
            categories: "네트워크 보안",
            Level: "보통",
            question: 'Q2. 데이터베이스를 보호하기 위한 공격 방어 기법은?',
            options: ['모니터 끄기', 'Prepared Statement 사용', '마우스 더블클릭', '키보드 청소'],
            answer: 1,
            hint: "null",
            educational_hint: "관리자 계정의 초기 비밀번호는 'root'입니다."
        },
        {
            quiz_id: 3,
            categories: "정보 보안",
            Level: "어려움",
            question: 'Q3. 출처가 불분명한 이메일 수신 시 올바른 조치는?',
            options: ['첨부파일 실행', '보낸 사람에게 답장', '즉시 삭제 및 보안팀 신고', '동료에게 전달'],
            answer: 2,
            hint: "null",
            educational_hint: "보안 키워드는 'Phaser'입니다."
        },
        {
            quiz_id: 4,
            categories: "정보 보안",
            Level: "보통",
            question: 'Q4. 랜섬웨어 감염이 의심될 때 가장 먼저 해야 할 일은?',
            options: ['해커에게 송금', '네트워크 선 뽑기', '바탕화면 변경', '백신 프로그램 삭제'],
            answer: 1,
            hint: "null",
            educational_hint: '네트워크 물리적 분리가 최우선입니다.'
        },
        {
            quiz_id: 5,
            categories: "정보 보안",
            Level: "어려움",
            question: 'Q5. 다음 중 물리적 보안 위협에 해당하는 것은?',
            options: ['디도스 공격', '비밀번호 유출', '서버실 무단 침입', '피싱 사이트 접속'],
            answer: 2,
            hint: "null",
            educational_hint: '마스터 키는 3층 데스크 아래에 있습니다.'
    }
    ];

    console.log(`[FLOOR LOAD] 세션: ${session_id} | 층: ${floor_num}`);
    res.status(200).json({
        quizzes,
        hints_available: 3,
    });
});

// 퀴즈 정답 제출
// 정답이면 remaining_time 반환
// 오답이면 penalty_tiem 차감 후 반환
app.post('/api/quiz/submit', authenticateToken, (req, res) => {
    const { session_id, quiz_id, answer } = req.body;

    // 임시 정답 체크 (나중에 DB에서 정답 조회)
    const correctAnswer = '3'; // 임시 정답
    const isCorrect = answer === correctAnswer;

    console.log(`[QUIZ SUBMIT] 세션: ${session_id} | 퀴즈: ${quiz_id} | 정답여부: ${isCorrect}`);

    if (isCorrect) {
        return res.status(200).json({
            is_correct: true,
            remaining_time: 550,
        });
    }

    res.status(200).json({
        is_correct: false,
        penalty_time: 10,
        remaining_time: 540,
    });
});

// ────────────────────────────────────────
// Step 3: 상호작용 및 샌드박스
// ────────────────────────────────────────

// 스파이 지목
// 유저가 지목한 spy_id가 실제 스파이인지 확인
app.post('/api/spy/verify', authenticateToken, (req, res) => {
    const { session_id, floor_num, spy_id } = req.body;

    // 임시 스파이 ID (나중에 DB에서 조회)
    const SPY_EMPLOYEE_ID = 3;
    const isSuccess = spy_id === SPY_EMPLOYEE_ID;

    console.log(`[SPY CHECK] 세션: ${session_id} | 층: ${floor_num} | 지목: ${spy_id} | 결과: ${isSuccess}`);

    if (isSuccess) {
        return res.status(200).json({
            is_success: true,
            next_floor: floor_num +1,
        });
    }

    res.status(200).json({
        is_success: false,
        penalty_time: 30,
        remaining_time: 510,
    });
});

// 실습 코드 제출 (Docker 샌드박스)
// 나중에 Docker 컨테이너에서 코드 실행하는 로직 추가 예정
app.post('/api/practice/run', authenticateToken, (req, res) => {
    const { session_id, quiz_id, user_code } = req.body;

    console.log(`[PRACTICE RUN] 세션: ${session_id} | 퀴즈: ${quiz_id} | 코드:\n${user_code}`);

    // 임시 응답 (나중에 Docker 연동)
    res.status(200).json({
        is_correct: true,
        execution_result: '임시 실행 결과입니다.',
    });
});

// ────────────────────────────────────────
// Step 4: 게임 종료 및 마이페이지
// ────────────────────────────────────────

// 게임 세션 종료
// status: 'clear' or 'fail' 반환

app.post('/api/game/session/:session_id/end', authenticateToken, (req, res) => {
    const { session_id, status } = req.body;

    console.log(`[GAME END] 세션: ${session_id} | 결과: ${status}`);

    // 임시 응답 (나중에 DB 연동)
    res.status(200).json({
        final_score: 9500,
        achievements_unlocked: [1, 2],
        detailed_explanations: [
            {
                quiz_id: 1,
                my_wrongs: ['123456'],
                answer: 'P@ssw0rd123!',
                explanation: '특수문자, 숫자, 대소문자 조합이 강력한 패스워드입니다.',
            },
        ],
    });
});

// 마이페이지 통계
// JWT에서 유저 식별 후 통계 반환
app.get('/api/user/stats', authenticateToken, (req, res) => {
    console.log(`[STATS] 유저: ${req.user.nickname}`);

    // 임시 응답 (나중에 DB 연동)
    res.status(200).json({
        level: 5,
        weak_sub_categories: ['SSL/TLS', 'SQLi'],
        clear_history: [],
    });
});

// 오답노트,실습코드 상세조회
app.get('/api/user/history/:log_id', authenticateToken, (req, res) => {
    const { log_id } = req.params;

    console.log(`[HISTORY] 로그ID: ${log_id} | 유저: ${req.user.nickname}`);

    // 임시 응답 (나중에 DB 연동)
    res.status(200).json({
        quiz_info: {},
        my_wrong_answers: [],
        submitted_code: '',
        execution_result: '',
    });
});

// ─────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`SNL 서버 실행 중: http://localhost:${PORT}`);
});