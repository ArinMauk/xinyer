export class SkiScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SkiScene' });
    }

    preload() {
        this.load.image('xin_ski', 'src/imgs/XinSkiingPixel.png');
        this.load.image('arin_ski', 'src/imgs/ArinSkiingPixel.png');
    }

    create() {
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
        this.xin = this.createPlayer(300, 100, 'xin_ski', 'Xin');
        this.arin = this.createPlayer(500, 100, 'arin_ski', 'Arin');

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

        // Speed Boosts
        this.speedBoosts = this.physics.add.staticGroup();
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(300, 4800);
            const boost = this.add.text(x, y, '⚡', { fontSize: '24px' });
            this.speedBoosts.add(boost);
            const body = boost.body;
            body.updateFromGameObject();
            body.setCircle(12);
        }

        // Lodge (Goal)
        this.lodge = this.add.text(width/2 - 50, height - 200, '🏠\nLodge', { fontSize: '64px', align: 'center' });
        this.physics.add.existing(this.lodge, true); // Static
        
        // Collisions/Overlaps
        // Trees now stop you
        this.physics.add.collider(this.xin, this.trees);
        this.physics.add.collider(this.arin, this.trees);
        
        // Coins
        this.physics.add.overlap(this.xin, this.coins, (p, c) => this.collectCoin(c));
        this.physics.add.overlap(this.arin, this.coins, (p, c) => this.collectCoin(c));

        // Speed Boosts
        this.physics.add.overlap(this.xin, this.speedBoosts, (p, b) => this.collectBoost(p, b));
        this.physics.add.overlap(this.arin, this.speedBoosts, (p, b) => this.collectBoost(p, b));

        // Win
        this.physics.add.overlap(this.xin, this.lodge, () => this.xin.finished = true);
        this.physics.add.overlap(this.arin, this.lodge, () => this.arin.finished = true);

        // UI
        this.infoText = this.add.text(10, 10, 'Xin: Arrows | Arin: WASD (Wobbly!)', { 
            fontSize: '16px', fill: '#000', backgroundColor: '#fff', padding: { x: 5, y: 5 }
        }).setScrollFactor(0).setDepth(100);
    }

    createPlayer(x, y, imgKey, name) {
        const p = this.add.image(x, y, imgKey).setDisplaySize(32, 32);
        this.physics.add.existing(p);
        p.body.setCollideWorldBounds(true);
        p.body.setCircle(12, 4, 4);
        p.body.setDrag(100);
        
        // Name tag
        const tag = this.add.text(x, y-20, name, { fontSize: '12px', fill: '#000' });
        p.tag = tag;
        
        p.baseSpeed = 200;
        p.speedMultiplier = 1;
        p.finished = false;
        return p;
    }

    collectBoost(player, boost) {
        boost.destroy();
        player.speedMultiplier = 2; // Double speed
        this.time.delayedCall(2000, () => {
            player.speedMultiplier = 1;
        });
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

        // Xin Controls (Precise)
        if (!this.xin.finished) {
            const speed = this.xin.baseSpeed * this.xin.speedMultiplier;
            this.xin.body.setVelocity(0);
            if (this.cursors.left.isDown) this.xin.body.setVelocityX(-speed);
            else if (this.cursors.right.isDown) this.xin.body.setVelocityX(speed);
            
            if (this.cursors.up.isDown) this.xin.body.setVelocityY(-speed);
            else if (this.cursors.down.isDown) this.xin.body.setVelocityY(speed);
            else this.xin.body.setVelocityY(50 * this.xin.speedMultiplier); // Gravity/Slope
        } else {
            this.xin.body.setVelocity(0);
        }

        // Arin Controls (Wobbly)
        if (!this.arin.finished) {
            const speed = this.arin.baseSpeed * this.arin.speedMultiplier;
            let vx = 0;
            let vy = 50 * this.arin.speedMultiplier; // Slope

            if (this.keys.a.isDown) vx = -speed;
            if (this.keys.d.isDown) vx = speed;
            if (this.keys.w.isDown) vy = -speed;
            if (this.keys.s.isDown) vy = speed;

            // Apply Wobble
            // Increased amplitude (250) and frequency (time/150)
            const wobble = Math.sin(time / 150) * 250; 
            if (vx !== 0 || vy > 60) {
                vx += wobble;
            }

            this.arin.body.setVelocity(vx, vy);
        } else {
            this.arin.body.setVelocity(0);
        }

        // Win Condition
        if (this.xin.finished && this.arin.finished) {
            this.scene.start('EndingScene');
        }
    }
}
