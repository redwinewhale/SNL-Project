import * as Phaser from 'phaser';

export default class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. 배경 설정 (Hacker Black)
        this.cameras.main.setBackgroundColor('#050505');

        // Falling Code 데이터 저장용 배열
        this.fallingCodes = [];
        this.characterSet = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]<>/+=-*&^%$#@!';
        this.maxLineCount = 30; // 화면에 동시에 존재할 텍스트 개수

        // 2. 게임 이름 (버튼 상단 배치)
        this.add.text(width / 2, height * 0.35, 'SECURITY TRAINING SYSTEM', {
            font: 'bold 72px Courier New',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 3. 로그인 버튼 생성 (가시성 강화)
        this.createStartButton(width / 2, height * 0.55, 'GOOGLE LOGIN', '#4285F4', () => this.handleGoogleLogin());
        this.createStartButton(width / 2, height * 0.68, 'GUEST LOGIN', '#64748b', () => this.handleGuestLogin());
    }

    createStartButton(x, y, label, color, callback) {
        const container = this.add.container(x, y);

        // 버튼 배경과 테두리
        const bg = this.add.graphics();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
        bg.lineStyle(4, 0xffffff, 1);
        bg.fillRoundedRect(-200, -40, 400, 80, 10);
        bg.strokeRoundedRect(-200, -40, 400, 80, 10);

        // 버튼 텍스트
        const text = this.add.text(0, 0, label, {
            font: 'bold 32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // 클릭 영역 설정
        const hitArea = new Phaser.Geom.Rectangle(-200, -40, 400, 80);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // 애니메이션 효과
        container.on('pointerover', () => {
            container.setScale(1.05);
            bg.alpha = 0.8;
        });
        container.on('pointerout', () => {
            container.setScale(1);
            bg.alpha = 1;
        });
        container.on('pointerdown', callback);
    }

    update(time, delta) {
        // 1. 새로운 배경 텍스트 생성
        if (this.fallingCodes.length < this.maxLineCount) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            // 화면 아래쪽(height + 20)에서 시작
            const textStr = this.characterSet[Phaser.Math.Between(0, this.characterSet.length - 1)];
            
            const textObj = this.add.text(x, this.cameras.main.height + 20, textStr, {
                font: '18px monospace',
                fill: '#00ff00'
            });

            // 투명도와 속도를 랜덤하게 설정 (FloatBetween 사용)
            textObj.setAlpha(Phaser.Math.FloatBetween(0.1, 0.6));
            
            this.fallingCodes.push({ 
                obj: textObj, 
                speed: Phaser.Math.FloatBetween(1, 4) // 위로 올라가는 속도
            });
        }

        // 2. 텍스트 이동 및 화면 밖으로 나가면 삭제
        for (let i = this.fallingCodes.length - 1; i >= 0; i--) {
            const code = this.fallingCodes[i];
            code.obj.y -= code.speed; // 위로 이동

            // 화면 위쪽 끝(-50)을 넘어가면 제거
            if (code.obj.y < -50) {
                code.obj.destroy();
                this.fallingCodes.splice(i, 1);
            }
        }
    }

    // handleGoogleLogin() { console.log("Google Login Clicked"); this.goToNextScreen(); }
    // handleGuestLogin() { console.log("Guest Login Clicked"); this.goToNextScreen(); }

    // goToNextScreen() {
    //     window.dispatchEvent(new CustomEvent('show-desktop-shell'));
    // }

    handleGoogleLogin() { 
        console.log("구글 로그인 시도 (임시)"); 
        this.simulateMockLogin(); 
    }
    
    handleGuestLogin() { 
        console.log("게스트 로그인 시도 (임시)"); 
        this.simulateMockLogin(); 
    }

    /**
     * 서버 통신을 흉내 내는 임시 로그인 로직
     */
    simulateMockLogin() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. 클릭 방지 및 화면 어둡게 처리 (로딩 연출)
        const loadingBg = this.add.graphics();
        loadingBg.fillStyle(0x000000, 0.8);
        loadingBg.fillRect(0, 0, width, height);
        loadingBg.setDepth(10); // 가장 위로 올림

        const loadingText = this.add.text(width / 2, height / 2, '서버 인증 중...', {
            font: 'bold 48px Courier New',
            fill: '#00ff00'
        }).setOrigin(0.5).setDepth(11);

        // 2. 1.5초(1500ms) 뒤에 DesktopScene으로 화면 전환
        this.time.delayedCall(500, () => {
            this.scene.start('DesktopScene');
        });
    }
}