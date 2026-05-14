import * as Phaser from 'phaser';
import DesktopUIManager from './DesktopUIManager.js';

export default class DesktopScene extends Phaser.Scene {
    constructor() {
        super('DesktopScene');
    }

    create() {
        // 배경 투명화 (HTML CSS 배경이 보이도록 설정)
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

        // ==========================================
        // 1. 배경 네트워크 노드 애니메이션 초기화 (Phaser 로직)
        // ==========================================
        this.networkGraphics = this.add.graphics();
        this.nodes = [];
        const numNodes = 70;

        for (let i = 0; i < numNodes; i++) {
            this.nodes.push({
                x: Phaser.Math.Between(0, 1920),
                y: Phaser.Math.Between(0, 1080),
                vx: Phaser.Math.FloatBetween(-0.5, 0.5),
                vy: Phaser.Math.FloatBetween(-0.5, 0.5)
            });
        }

        // ==========================================
        // 2. 데스크탑 HTML UI 활성화
        // ==========================================
        const desktopShell = document.getElementById('desktop-shell');
        if (desktopShell) {
            desktopShell.style.display = 'block';
            desktopShell.removeAttribute('aria-hidden');
            desktopShell.style.pointerEvents = 'auto'; 
            desktopShell.style.zIndex = '20'; 
        }

        // ==========================================
        // 3. 🌟 분리된 UI 매니저 호출
        // ==========================================
        this.uiManager = new DesktopUIManager(this);
        this.uiManager.initialize();
    }

    update() {
        // 배경 네트워크 점과 선 애니메이션 로직
        if (!this.networkGraphics) return;
        this.networkGraphics.clear();

        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < 0 || node.x > 1920) node.vx *= -1;
            if (node.y < 0 || node.y > 1080) node.vy *= -1;

            this.networkGraphics.fillStyle(0x38bdf8, 0.4);
            this.networkGraphics.fillCircle(node.x, node.y, 2.5);
        });

        const connectionDistance = 150;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const alpha = 1 - (dist / connectionDistance);
                    this.networkGraphics.lineStyle(1.5, 0x38bdf8, alpha * 0.3);
                    this.networkGraphics.strokeLineShape(
                        new Phaser.Geom.Line(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y)
                    );
                }
            }
        }
    }
}