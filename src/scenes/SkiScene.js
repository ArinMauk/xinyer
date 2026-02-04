export class SkiScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SkiScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff'); // Snow

        // World Bounds
        const width = 800;
        const height = 5000; // Long slope
        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);

        // Ground/Snow details
        this.add.grid(width/2, height/2, width, height, 100, 100, 0xffffff, 0, 0xeeeeee, 0.5);

        // Score
        this.score = 0;
        this.scoreText = this.add.text(10, 40, 'Coins: 0', { 
            fontSize: '20px', fill: '#d97706', backgroundColor: '#fff', padding: { x: 5, y: 5 } 
        }).setScrollFactor(0).setDepth(100);

        // Players
        this.xin = this.createPlayer(300, 100, '⛷️', 'Xin');
        this.arin = this.createPlayer(500, 100, '🎿', 'Arin');
        
        // Arin Fall Logic
        this.arin.isFallen = false;
        this.scheduleNextFall();

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Obstacles (Trees)
        this.trees = this.physics.add.staticGroup();
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(300, 4800);
            const tree = this.add.text(x, y, '🌲', { fontSize: '32px' });
            this.trees.add(tree);
            const body = tree.body;
            body.updateFromGameObject();
            body.setCircle(15, 2, 2);
        }

        // Coins
        this.coins = this.physics.add.staticGroup();
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(300, 4800);
            const coin = this.add.text(x, y, '🪙', { fontSize: '24px' });
            this.coins.add(coin);
            const body = coin.body;
            body.updateFromGameObject();
            body.setCircle(12);
        }

        // Lodge (Goal)
        this.lodge = this.add.text(width/2 - 50, height - 200, '🏠\nLodge', { fontSize: '64px', align: 'center' });
        this.physics.add.existing(this.lodge, true); // Static
        
        // Collisions/Overlaps
        // Trees slow you down instead of stopping
        this.physics.add.overlap(this.xin, this.trees, (p, t) => this.handleTreeHit(p));
        this.physics.add.overlap(this.arin, this.trees, (p, t) => this.handleTreeHit(p));
        
        // Coins
        this.physics.add.overlap(this.xin, this.coins, (p, c) => this.collectCoin(c));
        this.physics.add.overlap(this.arin, this.coins, (p, c) => this.collectCoin(c));

        // Win
        this.physics.add.overlap(this.xin, this.lodge, () => this.xin.finished = true);
        this.physics.add.overlap(this.arin, this.lodge, () => this.arin.finished = true);

        // UI
        this.infoText = this.add.text(10, 10, 'Xin: Arrows | Arin: WASD (Wobbly!)', { 
            fontSize: '16px', fill: '#000', backgroundColor: '#fff', padding: { x: 5, y: 5 }
        }).setScrollFactor(0).setDepth(100);
    }

    createPlayer(x, y, emoji, name) {
        const p = this.add.text(x, y, emoji, { fontSize: '32px' });
        this.physics.add.existing(p);
        p.body.setCollideWorldBounds(true);
        p.body.setCircle(12, 4, 4);
        p.body.setDrag(100);
        
        // Name tag
        const tag = this.add.text(x, y-20, name, { fontSize: '12px', fill: '#000' });
        p.tag = tag;
        
        // Shoot text (hidden initially)
        p.shootText = this.add.text(x, y-40, "Shoot!", { fontSize: '14px', fill: '#f00', fontStyle: 'bold', backgroundColor: '#fff' });
        p.shootText.setVisible(false);
        
        p.finished = false;
        return p;
    }

    scheduleNextFall() {
        const delay = Phaser.Math.Between(3000, 7000);
        this.time.delayedCall(delay, () => {
            if (!this.arin.finished) {
                this.triggerArinFall();
                this.scheduleNextFall();
            }
        });
    }

    triggerArinFall() {
        this.arin.isFallen = true;
        this.arin.shootText.setVisible(true);
        this.arin.body.setVelocity(0); // Stop immediately
        
        // Recover after 2 seconds
        this.time.delayedCall(2000, () => {
            this.arin.isFallen = false;
            this.arin.shootText.setVisible(false);
        });
    }

    handleTreeHit(player) {
        // Slow down significantly
        player.body.velocity.x *= 0.5;
        player.body.velocity.y *= 0.5;
    }

    collectCoin(coin) {
        coin.destroy();
        this.score += 10;
        this.scoreText.setText(`Coins: ${this.score}`);
    }

    update(time) {
        // Camera Follow (Average)
        const midY = (this.xin.y + this.arin.y) / 2;
        this.cameras.main.scrollY = midY - 300;

        // Update tags
        this.xin.tag.setPosition(this.xin.x, this.xin.y - 20);
        this.arin.tag.setPosition(this.arin.x, this.arin.y - 20);
        this.arin.shootText.setPosition(this.arin.x, this.arin.y - 45);

        const speed = 200;

        // Xin Controls (Precise)
        if (!this.xin.finished) {
            this.xin.body.setVelocity(0);
            if (this.cursors.left.isDown) this.xin.body.setVelocityX(-speed);
            else if (this.cursors.right.isDown) this.xin.body.setVelocityX(speed);
            
            if (this.cursors.up.isDown) this.xin.body.setVelocityY(-speed);
            else if (this.cursors.down.isDown) this.xin.body.setVelocityY(speed);
            else this.xin.body.setVelocityY(50); // Gravity/Slope
        } else {
            this.xin.body.setVelocity(0);
        }

        // Arin Controls (Wobbly & Falling)
        if (!this.arin.finished) {
            if (this.arin.isFallen) {
                this.arin.body.setVelocity(0); // Stay fallen
            } else {
                let vx = 0;
                let vy = 50; // Slope

                if (this.keys.a.isDown) vx = -speed;
                if (this.keys.d.isDown) vx = speed;
                if (this.keys.w.isDown) vy = -speed;
                if (this.keys.s.isDown) vy = speed;

                // Apply Stronger Wobble
                // Increased amplitude from 100 to 150
                const wobble = Math.sin(time / 150) * 150; 
                if (vx !== 0 || vy > 60) {
                    vx += wobble;
                }

                this.arin.body.setVelocity(vx, vy);
            }
        } else {
            this.arin.body.setVelocity(0);
        }

        // Win Condition
        if (this.xin.finished && this.arin.finished) {
            this.scene.start('EndingScene');
        }
    }
}
