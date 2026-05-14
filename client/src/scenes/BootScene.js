import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 검은색 배경 설정
        this.cameras.main.setBackgroundColor('#000000');

        // "로딩 중" 텍스트 화면 중앙 배치
        this.loadingText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '로딩 중...',
            style: {
                font: '32px Arial',
                fill: '#ffffff'
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        // 진행률 숫자 표시
        this.load.on('progress', (value) => {
            const percent = Math.floor(value * 100);
            this.loadingText.setText(`로딩 중... ${percent}%`);
        });
    }

    create() {
        // 로딩이 100% 완료되면 로그인 화면으로 넘어갑니다.
        this.scene.start('LoginScene');
    }
}