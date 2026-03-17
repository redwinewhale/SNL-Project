import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // 화면 크기 가져오기
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경색 설정(검정)
        this.cameras.main.setBackgroundColor('#000000');


        // 로딩바 UI
        
        // 프로그레스 바 (채워지는 부분)
        const progressBar = this.add.graphics();
        
        // 프로그레스 박스 (테두리)
        const progressBox = this.add.graphics();
        progressBox.lineStyle(2, 0x00ff00, 0.8); // 선 두께 2, 형광 초록색, 투명도 0.8
        progressBox.strokeRect(width / 2 - 160, height / 2 - 25, 320, 50); // 사각형 테두리만 그리기

        // "SYSTEM BOOTING..." 텍스트
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 60,
            text: '> SYSTEM BOOTING...',
            style: {
                font: '24px monospace', 
                fill: '#00ff00'         
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // 퍼센트 텍스트
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff' 
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // 파일 로딩 로그
        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '14px monospace',
                fill: '#00ff00'
            }
        });
        assetText.setOrigin(0.5, 0.5);


        // 이벤트 리스너

        this.load.on('progress', (value) => {
            // 퍼센트 업데이트
            percentText.setText(parseInt(value * 100) + '%');
            
            // 바 업데이트 (초록색으로 채우기)
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            
            // 박스 안쪽을 채웁니다 (여백 10px 줌)
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('fileprogress', (file) => {
            // 파일 로딩될 때마다 터미널 로그처럼 표시
            assetText.setText('> Loading module: ' + file.key);
        });

        this.load.on('complete', () => {
            // 로딩 완료 시 메시지 변경
            loadingText.setText('> ACCESS GRANTED');
            assetText.setText('> Initialization Complete.');
            
            // 잠시 멈췄다가 게임 시작
            setTimeout(() => {
                this.scene.start('MailScene');
            }, 500);
        });


        // --- 4. 에셋 로드 (테스트용) ---
        
        // [테스트] 로딩바 확인용 (나중에 삭제하세요)
        // for (let i = 0; i < 200; i++) {
        //     this.load.image('dummy'+i, 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
        // }

        //this.load.image('mailHome', '/assets/mail.png');
        //this.load.image('employeeIdle', '/assets/employee.png');
    }
}