export class EndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#191970'); // Midnight Navy

        // Pixel Art Couch Scene (Placeholder Emojis)
        this.add.text(350, 450, '🛋️', { fontSize: '100px' });
        this.add.text(370, 460, '🏃‍♀️', { fontSize: '40px' }); // Xin
        this.add.text(420, 460, '👨‍💻', { fontSize: '40px' }); // Arin

        // Note Content
        const noteContent = [
            "Deployment Successful!",
            "",
            "Dear Xin,",
            "Happy Birthday!",
            "You've refactored your life,",
            "escaped the bugs,",
            "and navigated the slippery slopes.",
            "",
            "Now it's time to commit changes",
            "and push to production.",
            "",
            "Dinner at The Pink Door",
            "Tonight at 6:00 PM.",
            "",
            "Love, Arin"
        ];

        // Scrolling Text
        const text = this.add.text(400, 600, noteContent, { 
            fontSize: '24px', 
            align: 'center',
            fill: '#ff69b4', // Taylor Pink
            fontFamily: '"Press Start 2P"',
            lineSpacing: 10
        });
        text.setOrigin(0.5, 0);

        this.tweens.add({
            targets: text,
            y: 100,
            duration: 10000,
            ease: 'Linear',
            onComplete: () => {
                this.triggerConfetti();
                this.add.text(400, 50, '🎉 HAPPY BIRTHDAY XIN! 🎉', { 
                    fontSize: '32px', 
                    fill: '#fff', 
                    stroke: '#ff69b4', 
                    strokeThickness: 4 
                }).setOrigin(0.5);
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
