import * as Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import LoginScene from './scenes/LoginScene.js';
import DesktopScene from './scenes/DesktopScene.js';
import WebSecurityScene from './scenes/WebSecurityScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    transparent: true, // 🌟 필수 추가: 이 설정이 있어야 Phaser 배경이 투명해집니다.
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [BootScene, LoginScene, DesktopScene, WebSecurityScene]
};

const game = new Phaser.Game(config);