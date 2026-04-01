import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const quizDatabase = {
    1: {
        question: 'Q1. 다음 중 가장 강력한 패스워드는?',
        choices: ['123456', 'password', 'admin', 'P@ssw0rd123!'],
        answer: 3,
        hint: '첫 번째 서버의 포트 번호는 8080입니다.'
    },
    2: {
        question: 'Q2. 데이터베이스를 보호하기 위한 공격 방어 기법은?',
        choices: ['모니터 끄기', 'Prepared Statement 사용', '마우스 더블클릭', '키보드 청소'],
        answer: 1,
        hint: "관리자 계정의 초기 비밀번호는 'root'입니다."
    },
    3: {
        question: 'Q3. 출처가 불분명한 이메일 수신 시 올바른 조치는?',
        choices: ['첨부파일 실행', '보낸 사람에게 답장', '즉시 삭제 및 보안팀 신고', '동료에게 전달'],
        answer: 2,
        hint: "보안 키워드는 'Phaser'입니다."
    },
    4: {
        question: 'Q4. 랜섬웨어 감염이 의심될 때 가장 먼저 해야 할 일은?',
        choices: ['해커에게 송금', '네트워크 선 뽑기', '바탕화면 변경', '백신 프로그램 삭제'],
        answer: 1,
        hint: '네트워크 물리적 분리가 최우선입니다.'
    },
    5: {
        question: 'Q5. 다음 중 물리적 보안 위협에 해당하는 것은?',
        choices: ['디도스 공격', '비밀번호 유출', '서버실 무단 침입', '피싱 사이트 접속'],
        answer: 2,
        hint: '마스터 키는 3층 데스크 아래에 있습니다.'
    }
};

const SPY_EMPLOYEE_ID = 3;

app.get('/api/quiz/:id', (req, res) => {
    const employeeId = Number.parseInt(req.params.id, 10);
    const quizData = quizDatabase[employeeId];

    if (!quizData) {
        return res.status(404).json({ message: '등록되지 않은 직원입니다.' });
    }

    res.status(200).json(quizData);
});

app.post('/api/quiz/success', (req, res) => {
    const { employeeId, status } = req.body;

    console.log(`[QUIZ CLEAR] TARGET_${employeeId} -> ${status}`);
    res.status(200).json({ message: '데이터 동기화 완료' });
});

app.post('/api/spy/check', (req, res) => {
    const employeeId = Number.parseInt(req.body.employeeId, 10);
    const isSpy = employeeId === SPY_EMPLOYEE_ID;

    console.log(`[SPY CHECK] TARGET_${employeeId} -> ${isSpy}`);
    res.status(200).json({ isSpy });
});

app.listen(PORT, () => {
    console.log(`SNL 프로젝트 서버 실행 중: http://localhost:${PORT}`);
});
