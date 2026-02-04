export class OfficeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OfficeScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#f0f0f0');
        
        // Map Configuration
        const TILE_SIZE = 40;
        const COLS = 20;
        const ROWS = 15;
        
        // Create Static Groups
        this.walls = this.physics.add.staticGroup();
        this.hidingZones = this.physics.add.staticGroup();
        
        // Level Layout (Simple Outline + Obstacles)
        // 0: Floor, 1: Wall, 2: Meeting Room (Hide), 3: Start, 4: Exit
        // Hardcoding a simple layout
        this.createLevel(COLS, ROWS, TILE_SIZE);

        // Player (Xin)
        this.player = this.add.text(TILE_SIZE * 2, TILE_SIZE * 2, '🏃‍♀️', { fontSize: '32px' });
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setCircle(16, 0, 0); // Approximate hitbox
        this.isHidden = false;

        // Enemies (Coworkers)
        this.enemies = this.physics.add.group();
        this.createEnemy(TILE_SIZE * 8, TILE_SIZE * 4, 100, 0); // Horizontal patrol
        this.createEnemy(TILE_SIZE * 15, TILE_SIZE * 8, 0, 100); // Vertical patrol
        this.createEnemy(TILE_SIZE * 6, TILE_SIZE * 10, 100, 0); 

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Collisions
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.hidingZones, this.handleHide, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handleCaught, null, this);
        this.physics.add.overlap(this.player, this.exitZone, this.handleWin, null, this);
        
        // Reset hidden status every frame (handled in update)
        
        this.add.text(10, 10, 'Escape the Office!', { fill: '#000', fontSize: '16px' });
        this.add.text(10, 30, 'Hide in Meeting Rooms (Blue)', { fill: '#000', fontSize: '12px' });
    }

    createLevel(cols, rows, size) {
        // Draw Walls (Border)
        for (let x = 0; x < cols; x++) {
            this.addWall(x * size, 0, size);
            this.addWall(x * size, (rows - 1) * size, size);
        }
        for (let y = 0; y < rows; y++) {
            this.addWall(0, y * size, size);
            this.addWall((cols - 1) * size, y * size, size);
        }

        // Internal Walls & Obstacles
        this.addWall(size * 5, size * 5, size);
        this.addWall(size * 5, size * 6, size);
        this.addWall(size * 5, size * 7, size);

        this.addWall(size * 12, size * 2, size);
        this.addWall(size * 12, size * 3, size);
        
        // Meeting Rooms (Hiding Zones) - Semi-transparent blue
        this.addHidingZone(size * 8, size * 8, size * 3, size * 2);
        this.addHidingZone(size * 2, size * 10, size * 2, size * 2);

        // Exit
        this.exitZone = this.add.rectangle((cols - 2) * size, (rows - 2) * size, size, size, 0x00ff00, 0.5);
        this.physics.add.existing(this.exitZone, true);
        this.add.text((cols - 2) * size, (rows - 2) * size, 'EXIT', { fontSize: '10px', fill: '#000' });
    }

    addWall(x, y, size) {
        const wall = this.add.rectangle(x + size/2, y + size/2, size, size, 0x555555);
        this.walls.add(wall);
    }

    addHidingZone(x, y, width, height) {
        const zone = this.add.rectangle(x + width/2, y + height/2, width, height, 0xADD8E6, 0.5);
        this.hidingZones.add(zone);
    }

    createEnemy(x, y, velX, velY) {
        const enemy = this.add.text(x, y, '💼', { fontSize: '32px' });
        this.enemies.add(enemy);
        enemy.body.setBounce(1);
        enemy.body.setCollideWorldBounds(true);
        enemy.body.setVelocity(velX, velY);
        // Add minimal simple AI in update if needed, but simple bounce works for patrol
        this.physics.add.collider(enemy, this.walls);
    }

    update() {
        const speed = 200;
        this.player.body.setVelocity(0);

        // Reset hidden state each frame (will be overridden by overlap callback if hiding)
        this.player.setAlpha(1);
        this.isHidden = false;

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        }
    }

    handleHide(player, zone) {
        player.setAlpha(0.5);
        this.isHidden = true;
    }

    handleCaught(player, enemy) {
        if (this.isHidden) return;

        // Reset Position
        player.x = 80;
        player.y = 80;
        
        // Show Dialog
        const text = this.add.text(player.x, player.y - 20, "Can you review my PR?", { 
            backgroundColor: '#fff', 
            fill: '#000',
            fontSize: '12px',
            padding: { x: 5, y: 5 }
        });
        
        this.time.delayedCall(1000, () => text.destroy());
    }

    handleWin(player, exit) {
        this.physics.pause();
        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('TransitionScene');
        });
    }
}
