export class EndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene' });
    }

    preload() {
        this.load.image('couch', 'src/imgs/ArinXinOnCouch.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#191970'); // Midnight Navy

        // Couch Image
        const couch = this.add.image(400, 150, 'couch');
        couch.setScale(0.25);
        
        // Note Content
        const noteContent = [
            "Xin,",
            "",
            "Getting to know you these past few weeks",
            "have been amazing.",
            "I'm excited to spend more time with you",
            "and see where our journey takes us!",
            "",
            "P.S. - We have a reservation at Copline",
            "later today at 5:45 p.m. ;)"
        ];

        // Scrolling Text
        const text = this.add.text(400, 800, noteContent, { 
            fontSize: '24px', 
            align: 'center',
            fill: '#ff69b4', // Taylor Pink
            fontFamily: '"Press Start 2P"', // Or Inter if user reverted? I'll use Inter as that was the last successful request.
            lineSpacing: 10
        });
        text.setOrigin(0.5, 0);
        text.setAlpha(0); // Start invisible

        // Fade In
        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 2000,
            ease: 'Linear'
        });

        // Scroll Up
        this.tweens.add({
            targets: text,
            y: 300,
            duration: 10000,
            ease: 'Linear',
            onComplete: () => {
                this.triggerConfetti();
                this.add.text(400, 50, '🎉 HAPPY BIRTHDAY XIN! 🎉', { 
                    fontSize: '32px', 
                    fill: '#fff', 
                    stroke: '#ff69b4', 
                    strokeThickness: 4 
                }).setOrigin(0.5).setAlpha(0).setDepth(100);
                
                // Fade in "Happy Birthday"
                this.tweens.add({
                    targets: this.children.list[this.children.list.length - 1], // The text we just added
                    alpha: 1,
                    duration: 1000
                });
            }
        });
    }

    triggerConfetti() {
        // Using canvas-confetti from CDN
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            // multiple origins
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
}
