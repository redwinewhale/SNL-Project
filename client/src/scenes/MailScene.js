// /src/scenes/MailScene.js
import Phaser from 'phaser';

export default class MailScene extends Phaser.Scene {
    constructor() {
        super('MailScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. 바탕화면 배경 설정 (임시 색상)
        this.cameras.main.setBackgroundColor('#2c3e50'); 

        // 2. 우측 하단 알림창 UI 구성
        const notiWidth = 360;
        const notiHeight = 100;
        const startX = width - 20;                 
        const startY = height + notiHeight;        
        const targetY = height - 20 - notiHeight;  

        const notiBox = this.add.rectangle(0, 0, notiWidth, notiHeight, 0x111111, 0.9).setOrigin(1, 0);
        notiBox.setStrokeStyle(2, 0x555555);

        const notiTitle = this.add.text(-notiWidth + 20, 15, '새로운 메세지 도착', {
            font: 'bold 16px sans-serif', fill: '#00ff00'
        });
        const notiDesc = this.add.text(-notiWidth + 20, 45, '[긴급] 1층 로비 출입 보안 점검 지시\n클릭하여 확인하세요.', {
            font: '14px sans-serif', fill: '#ffffff', lineSpacing: 5
        });

        const notificationContainer = this.add.container(startX, startY, [notiBox, notiTitle, notiDesc]);

        // 3. 알림창 슬라이드 업 애니메이션
        this.tweens.add({
            targets: notificationContainer,
            y: targetY,
            duration: 600,
            ease: 'Power2',
            delay: 1000 
        });

        // 4. 클릭 이벤트: 알림창 숨기고 HTML 이벤트 발송
        notiBox.setInteractive({ useHandCursor: true });
        notiBox.on('pointerdown', () => {
            notificationContainer.setVisible(false);
            this.showMailWindow();
        });
    }

    showMailWindow() {
        // Option B: HTML DOM으로 커스텀 이벤트 발송
        window.dispatchEvent(new CustomEvent('open-mail-modal'));
    }
}