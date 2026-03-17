// /src/scenes/GameScene.js
import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // 힌트 텍스트 객체들을 담을 배열
        this.hintTextObjects = [];
    }

    create() {
        const width = this.cameras.main.width;  
        const height = this.cameras.main.height; 

        this.cameras.main.setBackgroundColor('#050505');

        const uiGraphics = this.add.graphics();
        uiGraphics.lineStyle(2, 0x00ff00, 0.8);

        // UI 구성 요소 그리기
        this.drawLayout(width, height, uiGraphics);
        this.createRightPanel(width, height);
        this.createEmployeeList(uiGraphics);

        // ★ HTML(main.js)에서 보내는 힌트 해제 이벤트 수신
        this.setupEventListeners();
    }

    drawLayout(width, height, uiGraphics) {
        uiGraphics.beginPath();
        uiGraphics.moveTo(1300, 50);
        uiGraphics.lineTo(1300, height - 50);
        uiGraphics.strokePath();

        uiGraphics.strokeRect(20, 20, width - 40, height - 40);
    }

    createRightPanel(width, height) {
        const panelX = 1350;

        this.add.text(panelX, 80, '> 수집된 힌트_DATA', {
            font: 'bold 36px monospace',
            fill: '#00ff00'
        });

        // 힌트 슬롯 생성 (처음에는 화면에 보이지 않게 숨김 처리)
        this.hintTextObjects = []; 
        const hintSpacing = 60;
        for (let i = 0; i < 3; i++) {
            const textObj = this.add.text(panelX, 180 + (i * hintSpacing), '', {
                font: '24px monospace',
                fill: '#00ff00'
            });
            textObj.setVisible(false); // ★ 처음에는 숨김
            this.hintTextObjects.push(textObj);
        }

        // 정답 확인 버튼
        const btnWidth = 300;
        const btnHeight = 80;
        const btnX = width - btnWidth / 2 - 80; 
        const btnY = height - 120;

        const checkAnswerBtn = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x002200);
        checkAnswerBtn.setStrokeStyle(2, 0x00ff00);
        
        this.add.text(btnX, btnY, '최종 해제 [EXE]', {
            font: 'bold 28px monospace',
            fill: '#00ff00'
        }).setOrigin(0.5);

        checkAnswerBtn.setInteractive({ useHandCursor: true });
        checkAnswerBtn.on('pointerdown', () => {
            console.log('최종 정답 확인 로직 실행');
        });
    }

    createEmployeeList(uiGraphics) {
        const startX = 100;
        const startY = 120;
        const spacingY = 180;

        for (let i = 1; i <= 5; i++) {
            const currentY = startY + (i - 1) * spacingY;
            const boxWidth = 250;
            const boxHeight = 100;

            uiGraphics.strokeRect(startX, currentY, boxWidth, boxHeight);

            this.add.text(startX + boxWidth / 2, currentY + boxHeight / 2, `TARGET_직원 ${i}`, {
                font: 'bold 24px monospace', fill: '#00ff00'
            }).setOrigin(0.5);

            this.add.text(startX + boxWidth + 40, currentY + boxHeight / 2, 
                `> 정보 접근 권한 레벨 ${i}...\n> 클릭하여 데이터 추출 시도...`, {
                font: '20px monospace', fill: '#00cc00'
            }).setOrigin(0, 0.5);

            // 클릭 영역 생성
            const hitArea = this.add.rectangle(startX + boxWidth / 2, currentY + boxHeight / 2, boxWidth, boxHeight, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            
            // 직원 클릭 시 main.js로 데이터 요청 이벤트 발송
            hitArea.on('pointerdown', () => {
                window.dispatchEvent(new CustomEvent('open-quiz-modal', { 
                    detail: { id: i, name: `직원 ${i}` } 
                }));
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('hint-unlocked', (event) => {
            const newHint = event.detail.hintText;

            // ★ 아직 화면에 보이지 않는(visible이 false인) 첫 번째 힌트 슬롯 찾기
            const hiddenHintObj = this.hintTextObjects.find(obj => !obj.visible);
            
            if (hiddenHintObj) {
                // 텍스트를 채우고 화면에 표시
                hiddenHintObj.setText(`[*] ${newHint}`);
                hiddenHintObj.setVisible(true); 
            }
        });
    }
}