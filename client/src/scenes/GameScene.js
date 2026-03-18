// /src/scenes/GameScene.js
import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // 힌트 텍스트 객체들을 담을 배열
        this.hintTextObjects = [];
        this.layout = {
            left: 42,
            top: 34,
            right: 42,
            bottom: 34,
            headerHeight: 64,
            contentTop: 122
        };
    }

    create() {
        const width = this.cameras.main.width;  
        const height = this.cameras.main.height; 

        const uiGraphics = this.add.graphics();
        uiGraphics.lineStyle(2, 0x00ff00, 0.8);

        // UI 구성 요소 그리기
        this.drawWindowFrame(width, height, uiGraphics);
        this.drawLayout(width, height, uiGraphics);
        this.createRightPanel(width, height);
        this.createEmployeeList(uiGraphics);

        // ★ HTML(main.js)에서 보내는 힌트 해제 이벤트 수신
        this.setupEventListeners();
    }

    drawWindowFrame(width, height, uiGraphics) {
        const { left, top, right, bottom, headerHeight } = this.layout;
        const frameWidth = width - left - right;
        const frameHeight = height - top - bottom;
        const frameX = left;
        const frameY = top;

        uiGraphics.fillStyle(0x07110a, 0.96);
        uiGraphics.fillRoundedRect(frameX, frameY, frameWidth, frameHeight, 26);
        uiGraphics.lineStyle(2, 0x2aff7a, 0.55);
        uiGraphics.strokeRoundedRect(frameX, frameY, frameWidth, frameHeight, 26);

        uiGraphics.fillStyle(0x102417, 0.98);
        uiGraphics.fillRoundedRect(frameX + 2, frameY + 2, frameWidth - 4, headerHeight, 24);
        uiGraphics.lineStyle(1, 0x8fffb0, 0.18);
        uiGraphics.beginPath();
        uiGraphics.moveTo(frameX + 24, frameY + headerHeight + 1);
        uiGraphics.lineTo(frameX + frameWidth - 24, frameY + headerHeight + 1);
        uiGraphics.strokePath();

        this.add.circle(frameX + 28, frameY + 32, 6, 0x98ffb0);
        this.add.circle(frameX + 48, frameY + 32, 6, 0xc8ffd5);
        this.add.circle(frameX + 68, frameY + 32, 6, 0xe8fff0);

        this.add.text(frameX + 100, frameY + 19, 'Security Guardian Console', {
            font: '600 24px Segoe UI',
            color: '#e0ffea'
        });

        this.add.text(frameX + frameWidth - 230, frameY + 22, 'ACTIVE THREAT RESPONSE', {
            font: '16px Segoe UI',
            color: '#8de0a6'
        });
    }

    drawLayout(width, height, uiGraphics) {
        const { left, right, bottom, contentTop } = this.layout;
        const splitX = 1300;
        const innerTop = contentTop;
        const innerHeight = height - contentTop - bottom;

        uiGraphics.fillStyle(0x09170d, 0.92);
        uiGraphics.fillRoundedRect(left + 14, innerTop, width - left - right - 28, innerHeight - 14, 22);
        uiGraphics.lineStyle(1, 0x3cff86, 0.24);
        uiGraphics.strokeRoundedRect(left + 14, innerTop, width - left - right - 28, innerHeight - 14, 22);

        uiGraphics.beginPath();
        uiGraphics.moveTo(splitX, innerTop + 20);
        uiGraphics.lineTo(splitX, height - bottom - 20);
        uiGraphics.strokePath();
    }

    createRightPanel(width, height) {
        const panelX = 1336;
        const panelTop = 154;
        const hintWrapWidth = 440;

        this.add.text(panelX, panelTop, '> 수집된 힌트_DATA', {
            font: 'bold 36px monospace',
            fill: '#00ff00'
        });

        // 힌트 슬롯 생성 (처음에는 화면에 보이지 않게 숨김 처리)
        this.hintTextObjects = []; 
        const hintSpacing = 96;
        for (let i = 0; i < 3; i++) {
            const textObj = this.add.text(panelX, panelTop + 100 + (i * hintSpacing), '', {
                font: '21px monospace',
                fill: '#00ff00',
                lineSpacing: 8,
                wordWrap: { width: hintWrapWidth, useAdvancedWrap: true }
            });
            textObj.setVisible(false); // ★ 처음에는 숨김
            this.hintTextObjects.push(textObj);
        }

        // 정답 확인 버튼
        const btnWidth = 300;
        const btnHeight = 80;
        const btnX = width - btnWidth / 2 - 80; 
        const btnY = height - 110;

        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0x002200, 0.95);
        buttonGraphics.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 18);
        buttonGraphics.lineStyle(2, 0x00ff00, 1);
        buttonGraphics.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 18);
        
        this.add.text(btnX, btnY, '최종 해제 [EXE]', {
            font: 'bold 28px monospace',
            fill: '#00ff00'
        }).setOrigin(0.5);

        const checkAnswerBtn = this.add.zone(btnX, btnY, btnWidth, btnHeight);
        checkAnswerBtn.setInteractive({ useHandCursor: true });
        checkAnswerBtn.on('pointerdown', () => {
            console.log('최종 정답 확인 로직 실행');
        });
    }

    createEmployeeList(uiGraphics) {
        const startX = 104;
        const startY = 154;
        const spacingY = 150;

        for (let i = 1; i <= 5; i++) {
            const currentY = startY + (i - 1) * spacingY;
            const boxWidth = 250;
            const boxHeight = 100;

            uiGraphics.fillStyle(0x031106, 0.9);
            uiGraphics.fillRoundedRect(startX, currentY, boxWidth, boxHeight, 18);
            uiGraphics.strokeRoundedRect(startX, currentY, boxWidth, boxHeight, 18);

            this.add.text(startX + boxWidth / 2, currentY + boxHeight / 2, `TARGET_직원 ${i}`, {
                font: 'bold 24px monospace', fill: '#00ff00'
            }).setOrigin(0.5);

            this.add.text(startX + boxWidth + 40, currentY + boxHeight / 2, 
                `> 정보 접근 권한 레벨 ${i}...\n> 클릭하여 데이터 추출 시도...`, {
                font: '20px monospace', fill: '#00cc00'
            }).setOrigin(0, 0.5);

            // 클릭 영역 생성
            const hitArea = this.add.zone(startX + boxWidth / 2, currentY + boxHeight / 2, boxWidth, boxHeight);
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
