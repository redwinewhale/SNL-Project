// /src/scenes/MailScene.js
import Phaser from 'phaser';

export default class MailScene extends Phaser.Scene {
    constructor() {
        super('MailScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 2. 우측 하단 알림창 UI 구성
        const notiWidth = 360;
        const notiHeight = 100;
        const startX = width - 28;                 
        const startY = height + notiHeight;        
        const targetY = height - 118 - notiHeight;  
        const notiBubble = this.add.graphics();
        notiBubble.fillStyle(0x111111, 0.94);
        notiBubble.lineStyle(2, 0x555555, 1);
        notiBubble.fillRoundedRect(-notiWidth, 0, notiWidth, notiHeight, 24);
        notiBubble.strokeRoundedRect(-notiWidth, 0, notiWidth, notiHeight, 24);
        notiBubble.fillTriangle(-62, notiHeight - 2, -38, notiHeight - 2, -48, notiHeight + 16);
        notiBubble.lineBetween(-60, notiHeight - 1, -48, notiHeight + 15);
        notiBubble.lineBetween(-48, notiHeight + 15, -40, notiHeight - 1);

        const notiTitle = this.add.text(-notiWidth + 20, 15, '새로운 메세지 도착', {
            font: 'bold 16px sans-serif', fill: '#00ff00'
        });
        const notiDesc = this.add.text(-notiWidth + 20, 45, '[긴급] 1층 로비 출입 보안 점검 지시\n클릭하여 확인하세요.', {
            font: '14px sans-serif', fill: '#ffffff', lineSpacing: 5
        });
        const notiClickZone = this.add.zone(-notiWidth / 2, notiHeight / 2, notiWidth, notiHeight + 18);

        const notificationContainer = this.add.container(startX, startY, [notiBubble, notiTitle, notiDesc, notiClickZone]);

        // 3. 알림창 슬라이드 업 애니메이션
        this.tweens.add({
            targets: notificationContainer,
            y: targetY,
            duration: 600,
            ease: 'Power2',
            delay: 1000 
        });

        // 4. 클릭 이벤트: 알림창 숨기고 HTML 이벤트 발송
        notiClickZone.setInteractive({ useHandCursor: true });
        notiClickZone.on('pointerdown', () => {
            notificationContainer.setVisible(false);
            this.showMailWindow();
        });
    }

    showMailWindow() {
        // Option B: HTML DOM으로 커스텀 이벤트 발송
        window.dispatchEvent(new CustomEvent('open-mail-modal'));
    }
}
