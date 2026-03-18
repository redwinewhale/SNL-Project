import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
        this.progressBar = null;
        this.percentText = null;
        this.loadingText = null;
        this.assetText = null;
    }

    preload() {
        // 화면 크기 가져오기
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경색 설정(검정)
        this.cameras.main.setBackgroundColor('#000000');
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(-1);


        // 로딩바 UI
        this.progressBar = this.add.graphics();
        
        // 프로그레스 박스 (테두리)
        const progressBox = this.add.graphics();
        progressBox.lineStyle(2, 0x00ff00, 0.8); // 선 두께 2, 형광 초록색, 투명도 0.8
        progressBox.strokeRect(width / 2 - 160, height / 2 - 25, 320, 50); // 사각형 테두리만 그리기

        // "SYSTEM BOOTING..." 텍스트
        this.loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 60,
            text: '> SYSTEM BOOTING...',
            style: {
                font: '24px monospace', 
                fill: '#00ff00'         
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        // 퍼센트 텍스트
        this.percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff' 
            }
        });
        this.percentText.setOrigin(0.5, 0.5);

        // 파일 로딩 로그
        this.assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '> Initializing secure session...',
            style: {
                font: '14px monospace',
                fill: '#00ff00'
            }
        });
        this.assetText.setOrigin(0.5, 0.5);


        // --- 4. 에셋 로드 (테스트용) ---
        
        // [테스트] 로딩바 확인용 (나중에 삭제하세요)
        // for (let i = 0; i < 200; i++) {
        //     this.load.image('dummy'+i, 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
        // }

        //this.load.image('mailHome', '/assets/mail.png');
        //this.load.image('employeeIdle', '/assets/employee.png');
    }

    create() {
        const width = this.cameras.main.width;
        const progressState = { value: 0 };
        const progressMessages = [
            '> Initializing secure session...',
            '> Loading boot sectors...',
            '> Verifying access token...',
            '> Mounting encrypted workspace...',
            '> Finalizing modules...'
        ];

        this.tweens.add({
            targets: progressState,
            value: 100,
            duration: 1200,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                const currentValue = Math.round(progressState.value);
                const progressRatio = currentValue / 100;
                const messageIndex = Math.min(
                    progressMessages.length - 1,
                    Math.floor(progressRatio * progressMessages.length)
                );

                this.percentText.setText(`${currentValue}%`);
                this.assetText.setText(progressMessages[messageIndex]);

                this.progressBar.clear();
                this.progressBar.fillStyle(0x00ff00, 1);
                this.progressBar.fillRect(width / 2 - 150, this.cameras.main.height / 2 - 15, 300 * progressRatio, 30);
            },
            onComplete: () => {
                this.loadingText.setText('> ACCESS GRANTED');
                this.assetText.setText('> Initialization Complete.');

                this.time.delayedCall(180, () => {
                    window.dispatchEvent(new CustomEvent('show-desktop-shell'));
                    this.scene.start('MailScene');
                });
            }
        });
    }
}
