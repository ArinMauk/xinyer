import { TerminalScene } from './scenes/TerminalScene.js';
import { OfficeScene } from './scenes/OfficeScene.js';
import { TransitionScene } from './scenes/TransitionScene.js';
import { GroceryScene } from './scenes/GroceryScene.js';
import { SkiScene } from './scenes/SkiScene.js';
import { EndingScene } from './scenes/EndingScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [
        TerminalScene,
        OfficeScene,
        TransitionScene,
        GroceryScene,
        SkiScene,
        EndingScene
    ]
};

const game = new Phaser.Game(config);
