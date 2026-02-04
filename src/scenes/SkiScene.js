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

        // Players
        this.xin = this.createPlayer(300, 100, '⛷️', 'Xin');
        this.arin = this.createPlayer(500, 100, '🎿', 'Arin');

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
            body.setCircle(10, 8, 8);
        }

        // Lodge (Goal)
        this.lodge = this.add.text(width/2 - 50, height - 200, '🏠\nLodge', { fontSize: '64px', align: 'center' });
        this.physics.add.existing(this.lodge, true); // Static
        
        // Collisions
        this.physics.add.collider(this.xin, this.trees);
        this.physics.add.collider(this.arin, this.trees);
        this.physics.add.collider(this.xin, this.arin);

        this.physics.add.overlap(this.xin, this.lodge, () => this.xin.finished = true);
        this.physics.add.overlap(this.arin, this.lodge, () => this.arin.finished = true);

        // UI
        this.infoText = this.add.text(10, 10, 'Xin: Arrows | Arin: WASD (Wobbly!)', { 
            fontSize: '16px', fill: '#000', backgroundColor: '#fff' 
        }).setScrollFactor(0);
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
        
        p.finished = false;
        return p;
    }

    update(time) {
        // Camera Follow (Average of both or just down?)
        // Let's scroll automatically or follow the leading player?
        // Prompt says "Vertical scrolling".
        // Better: Camera follows the midpoint Y of both players.
        const midY = (this.xin.y + this.arin.y) / 2;
        this.cameras.main.scrollY = midY - 300;

        // Player Tags
        this.xin.tag.setPosition(this.xin.x, this.xin.y - 20);
        this.arin.tag.setPosition(this.arin.x, this.arin.y - 20);

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

        // Arin Controls (Wobbly)
        if (!this.arin.finished) {
            let vx = 0;
            let vy = 50; // Slope

            if (this.keys.a.isDown) vx = -speed;
            if (this.keys.d.isDown) vx = speed;
            if (this.keys.w.isDown) vy = -speed;
            if (this.keys.s.isDown) vy = speed;

            // Apply Wobble
            const wobble = Math.sin(time / 200) * 100; // Sway left/right
            if (vx !== 0 || vy > 60) { // Only wobble if moving
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
