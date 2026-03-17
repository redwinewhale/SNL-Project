const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 프론트엔드(Phaser 게임)의 접근을 허용하고 JSON 데이터를 처리하기 위한 설정
app.use(cors());
app.use(express.json());

// 임시 데이터베이스 (서버 메모리에 저장)
const mockDatabase = {
    1: { question: "Q1. 다음 중 가장 강력한 패스워드는?", choices: ["123456", "password", "admin", "P@ssw0rd123!"], answer: 3, hint: "첫 번째 서버의 포트 번호는 8080입니다." },
    2: { question: "Q2. 데이터베이스를 보호하기 위한 공격 방어 기법은?", choices: ["모니터 끄기", "Prepared Statement 사용", "마우스 더블클릭", "키보드 청소"], answer: 1, hint: "관리자 계정의 초기 비밀번호는 'root'입니다." },
    3: { question: "Q3. 출처가 불분명한 이메일 수신 시 올바른 조치는?", choices: ["첨부파일 실행", "보낸 사람에게 답장", "즉시 삭제 및 보안팀 신고", "동료에게 전달"], answer: 2, hint: "보안 키워드는 'Phaser'입니다." },
    4: { question: "Q4. 랜섬웨어 감염이 의심될 때 가장 먼저 해야 할 일은?", choices: ["해커에게 송금", "네트워크 선 뽑기", "바탕화면 변경", "백신 프로그램 삭제"], answer: 1, hint: "네트워크 물리적 분리가 최우선입니다." },
    5: { question: "Q5. 다음 중 물리적 보안 위협에 해당하는 것은?", choices: ["디도스 공격", "비밀번호 유출", "서버실 무단 침입", "피싱 사이트 접속"], answer: 2, hint: "마스터 키는 3층 데스크 아래에 있습니다." }
};

// 1. 특정 직원(id)의 퀴즈 데이터를 요청하는 GET API
app.get('/api/quiz/:id', (req, res) => {
    const employeeId = req.params.id;
    const quizData = mockDatabase[employeeId];

    if (quizData) {
        res.status(200).json(quizData);
    } else {
        res.status(404).json({ message: "등록되지 않은 직원입니다." });
    }
});

// 2. 퀴즈 정답 통과 상태를 업데이트하는 POST API
app.post('/api/quiz/success', (req, res) => {
    const { employeeId, status } = req.body;
    
    // 실제 서버라면 여기서 DB의 상태값을 업데이트합니다.
    console.log(`[DB UPDATE] TARGET_직원 ${employeeId} 의 상태가 '${status}'(으)로 변경되었습니다.`);
    
    res.status(200).json({ message: "데이터 동기화 완료" });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`임시 테스트 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});