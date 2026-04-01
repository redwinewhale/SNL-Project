// /src/scenes/GameScene.js
import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // 힌트 텍스트 객체들을 담을 배열
        this.hintTextObjects = [];
        this.currentFloor = 1;

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

        // HTML(main.js)에서 보내는 힌트 해제 이벤트 수신
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

        this.titleText = this.add.text(frameX + 100, frameY + 19, `[${this.currentFloor}F] Security Guardian Console`, {
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

        // 힌트 슬롯 5개 생성 (처음에는 화면에 보이지 않게 숨김 처리)
        this.hintTextObjects = []; 
        const hintSpacing = 96;
        for (let i = 0; i < 5; i++) {
            const textObj = this.add.text(panelX, panelTop + 100 + (i * hintSpacing), '', {
                font: '21px monospace',
                fill: '#00ff00',
                lineSpacing: 8,
                wordWrap: { width: hintWrapWidth, useAdvancedWrap: true }
            });
            textObj.setVisible(false);
            this.hintTextObjects.push(textObj);
        }

        // 정답 확인 버튼 영역 설정
        const btnWidth = 300;
        const btnHeight = 80;
        const btnX = width - btnWidth / 2 - 80; 
        const btnY = height - 110;

        // [수정] 토글 기능을 위해 버튼 그래픽을 클래스 변수에 할당
        this.exeButtonGraphics = this.add.graphics();
        this.exeButtonGraphics.fillStyle(0x002200, 0.95);
        this.exeButtonGraphics.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 18);
        this.exeButtonGraphics.lineStyle(2, 0x00ff00, 1);
        this.exeButtonGraphics.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 18);
        
        // [수정] 토글 기능을 위해 텍스트를 클래스 변수에 할당
        this.exeButtonText = this.add.text(btnX, btnY, '최종 해제 [EXE]', {
            font: 'bold 28px monospace',
            fill: '#00ff00'
        }).setOrigin(0.5);

        const checkAnswerBtn = this.add.zone(btnX, btnY, btnWidth, btnHeight);
        checkAnswerBtn.setInteractive({ useHandCursor: true });
        
        checkAnswerBtn.on('pointerdown', () => {
            window.dispatchEvent(new CustomEvent('open-spy-modal'));
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

            const hitArea = this.add.zone(startX + boxWidth / 2, currentY + boxHeight / 2, boxWidth, boxHeight);
            hitArea.setInteractive({ useHandCursor: true });
            
            // [수정] 현재 모드에 따라 발송하는 이벤트 분기 처리
            hitArea.on('pointerdown', () => {
                // 직원을 누르면 항상 퀴즈 팝업이 뜹니다.
                window.dispatchEvent(new CustomEvent('open-quiz-modal', { 
                    detail: { id: i, name: `직원 ${i}` } 
                }));
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('hint-unlocked', (event) => {
            const newHint = event.detail.hintText;

            // 아직 화면에 보이지 않는 첫 번째 힌트 슬롯 찾기
            const hiddenHintObj = this.hintTextObjects.find(obj => !obj.visible);
            
            if (hiddenHintObj) {
                hiddenHintObj.setText(`[*] ${newHint}`);
                hiddenHintObj.setVisible(true); 
            }
        });

        window.addEventListener('next-floor-start', (event) => {
            // 층수 업데이트
            this.currentFloor = event.detail.floor;
            this.titleText.setText(`[${this.currentFloor}F] Security Guardian Console`);

            // 수집된 힌트 텍스트 화면에서 모두 숨기기 (초기화)
            this.hintTextObjects.forEach(obj => {
                obj.setText('');
                obj.setVisible(false);
            });
        });
    }
}