export class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue

        // Ground
        this.add.rectangle(400, 500, 800, 200, 0x228B22); // Green grass
        this.add.rectangle(400, 450, 800, 50, 0x333333); // Road

        // Landmarks (Simple shapes/Text)
        this.landmarks = this.add.group();
        this.createLandmark(900, 350, 'Space Needle 🗼');
        this.createLandmark(1200, 400, 'Ballard Locks 🚢');
        this.createLandmark(1500, 380, 'Fremont Troll 🧌');

        // Car
        this.car = this.add.text(100, 430, '🚗', { fontSize: '48px' });
        
        // Overlay Text
        const style = { 
            fontSize: '24px', 
            fill: '#fff', 
            stroke: '#000', 
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 600 }
        };
        const msg = this.add.text(400, 100, "Escaping the 9-to-5...\nDestination: Whole Foods.", style);
        msg.setOrigin(0.5);

        // Animation Loop
        this.tweens.add({
            targets: this.landmarks.getChildren(),
            x: '-=2000',
            duration: 6000,
            ease: 'Linear'
        });

        // Car Bump
        this.tweens.add({
            targets: this.car,
            y: '-=2',
            duration: 100,
            yoyo: true,
            repeat: -1
        });

        // Transition
        this.time.delayedCall(5000, () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('GroceryScene');
            });
        });
    }

    createLandmark(x, y, emoji) {
        const item = this.add.text(x, y, emoji, { fontSize: '64px' });
        this.landmarks.add(item);
    }
}
