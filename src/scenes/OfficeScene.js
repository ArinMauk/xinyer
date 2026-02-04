export class OfficeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OfficeScene' });
    }

    preload() {
        this.load.image('xin', 'src/imgs/XinWangPortraitPixel.png');
        this.load.image('bob', 'src/imgs/BobPixelArt.png');
        this.load.image('dave', 'src/imgs/DavePixelArt.png');
        this.load.image('karen', 'src/imgs/KarenPixelArt.png');
    }

    create() {
        console.log('OfficeScene: create started');
        try {
            // Game State
            this.TILE_SIZE = 40;
            this.GRID_WIDTH = 16;
            this.GRID_HEIGHT = 12;
            this.DETECTION_RADIUS = 2.5 * this.TILE_SIZE;
            this.jobSecurity = 3;
            this.isHiding = false;
            this.gameActive = false;
            this.prEncounter = null;
            this.doingPR = false;
            this.finished = false;

            // Map Data (0: Floor, 1: Wall, 2: Cubicle, 3: Exit, 4: Hide)
            this.mapData = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 2, 0, 1, 0, 2, 0, 0, 2, 0, 1, 0, 4, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 0, 0, 0, 1, 4, 4, 1, 0, 0, 0, 0, 1, 1],
                [1, 0, 0, 0, 2, 0, 1, 0, 0, 1, 0, 2, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];

            this.createLevel();
            this.createPlayer();
            this.createCoworkers();
            this.createUI();

            // Inputs
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys({ w: 87, a: 65, s: 83, d: 68, space: 32 });

            this.input.keyboard.on('keydown-SPACE', () => this.tryHide());
            
            // Start Game
            this.gameActive = true;
            console.log('OfficeScene: create finished successfully');
        } catch (e) {
            console.error('OfficeScene Error:', e);
            this.add.text(100, 100, 'Error loading Office Scene:\n' + e.message, { fill: '#f00', fontSize: '20px' });
        }
    }

    createLevel() {
        this.walls = this.physics.add.staticGroup();
        this.hidingZones = this.physics.add.staticGroup();
        this.exitZone = null;

        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                const tile = this.mapData[y][x];
                const posX = x * this.TILE_SIZE + this.TILE_SIZE / 2;
                const posY = y * this.TILE_SIZE + this.TILE_SIZE / 2;

                if (tile === 1) { // Wall
                    const wall = this.add.rectangle(posX, posY, this.TILE_SIZE, this.TILE_SIZE, 0x334155);
                    this.walls.add(wall);
                } else if (tile === 2) { // Cubicle
                    const cubicle = this.add.rectangle(posX, posY, this.TILE_SIZE, this.TILE_SIZE, 0x78350f, 0.6);
                    this.walls.add(cubicle); 
                } else if (tile === 4) { // Hide
                    const zone = this.add.rectangle(posX, posY, this.TILE_SIZE, this.TILE_SIZE, 0x1e3a8a, 0.4);
                    this.hidingZones.add(zone);
                    this.add.text(posX, posY, 'HIDE', { fontSize: '10px', fill: '#93c5fd' }).setOrigin(0.5).setAlpha(0.5);
                } else if (tile === 3) { // Exit
                    this.exitZone = this.add.rectangle(posX, posY, this.TILE_SIZE, this.TILE_SIZE, 0x10b981);
                    this.physics.add.existing(this.exitZone, true);
                    this.add.text(posX, posY, 'EXIT', { fontSize: '10px', fill: '#fff' }).setOrigin(0.5);
                } else {
                    // Floor grid
                    this.add.rectangle(posX, posY, this.TILE_SIZE, this.TILE_SIZE).setStrokeStyle(1, 0x334155, 0.3);
                }
            }
        }
    }

    createPlayer() {
        const startX = 2 * this.TILE_SIZE + this.TILE_SIZE / 2;
        const startY = 2 * this.TILE_SIZE + this.TILE_SIZE / 2;

        this.player = this.add.container(startX, startY);
        this.player.setSize(24, 24);
        this.physics.add.existing(this.player);
        
        // Ensure body exists before accessing
        if (this.player.body) {
            this.player.body.setCircle(12);
            this.player.body.setCollideWorldBounds(true);
        }

        const sprite = this.add.image(0, 0, 'xin').setDisplaySize(32, 32);
        this.player.add(sprite);

        this.physics.add.collider(this.player, this.walls);
        if (this.exitZone) {
            this.physics.add.overlap(this.player, this.exitZone, () => this.handleWin());
        }
    }

    createCoworkers() {
        this.coworkers = [];
        
        const configs = [
            { id: 1, x: 10, y: 3, name: 'Dave', img: 'dave', path: [{x:10,y:3}, {x:10,y:6}, {x:6,y:6}, {x:6,y:3}], msg: "Xin, I've got this PR for you to review!" },
            { id: 2, x: 7, y: 9, name: 'Karen', img: 'karen', path: [{x:7,y:9}, {x:3,y:9}, {x:3,y:7}, {x:7,y:7}], msg: "Quick sync about the deployment?" },
            { id: 3, x: 13, y: 5, name: 'Bob', img: 'bob', path: [{x:13,y:5}, {x:13,y:1}, {x:11,y:1}, {x:11,y:5}], msg: "Can you check my code changes?" }
        ];

        configs.forEach(cfg => {
            const posX = cfg.x * this.TILE_SIZE + this.TILE_SIZE / 2;
            const posY = cfg.y * this.TILE_SIZE + this.TILE_SIZE / 2;
            
            const container = this.add.container(posX, posY);
            container.setSize(24, 24);
            
            const radius = this.add.circle(0, 0, this.DETECTION_RADIUS, 0xf97316, 0.1).setStrokeStyle(1, 0xf97316, 0.3);
            const sprite = this.add.image(0, 0, cfg.img).setDisplaySize(32, 32);
            
            container.add([radius, sprite]);
            
            // FIX: Use custom property to avoid conflict with Phaser's data manager
            container.coworkerData = {
                id: cfg.id,
                name: cfg.name,
                msg: cfg.msg,
                path: cfg.path,
                pathIndex: 0,
                startPos: { x: posX, y: posY },
                direction: 1,
                speed: 60,
                chasing: false,
                radiusViz: radius
            };

            this.physics.add.existing(container);
            this.coworkers.push(container);
        });
    }

    createUI() {
        const uiContainer = document.getElementById('ui-container');
        if (!uiContainer) return;
        
        uiContainer.innerHTML = `
            <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none drop-shadow-md">
                 <h1 class="text-xl md:text-2xl font-bold text-white bg-slate-900/60 px-6 py-2 rounded-full border border-slate-600">Escape Amazon and avoid Code reviews!</h1>
            </div>
            <div class="absolute top-4 left-4 z-10 w-64 bg-slate-900/80 p-3 rounded-lg border border-slate-700 ui-content">
                <div class="flex justify-between text-sm mb-1 text-slate-300">
                    <span>Job Security</span>
                    <span id="job-security-text">3/3 chances</span>
                </div>
                <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div id="job-security-bar" class="h-full bg-emerald-500 transition-all duration-300" style="width: 100%"></div>
                </div>
            </div>
            <div id="office-modal" class="hidden absolute inset-0 bg-black/80 z-20 flex items-center justify-center ui-content"></div>
            <div id="hide-indicator" class="hidden absolute top-32 left-1/2 -translate-x-1/2 bg-blue-900 px-4 py-2 rounded-lg z-10 text-white font-mono">
                Hiding... <span id="hide-timer">3</span>s
            </div>
        `;
    }

    update() {
        try {
            if (!this.gameActive || this.doingPR) {
                if (this.player?.body) this.player.body.setVelocity(0);
                this.coworkers.forEach(c => { if(c.body) c.body.setVelocity(0); });
                return;
            }

            const speed = 150;
            if (this.player?.body) this.player.body.setVelocity(0);
            
            if (!this.isHiding && this.player?.body) {
                if (this.cursors.left.isDown || this.wasd.a.isDown) this.player.body.setVelocityX(-speed);
                else if (this.cursors.right.isDown || this.wasd.d.isDown) this.player.body.setVelocityX(speed);
                
                if (this.cursors.up.isDown || this.wasd.w.isDown) this.player.body.setVelocityY(-speed);
                else if (this.cursors.down.isDown || this.wasd.s.isDown) this.player.body.setVelocityY(speed);
            }

            this.coworkers.forEach(coworker => {
                if (!coworker.body || !this.player.body) return;
                
                // FIX: Use coworkerData
                const data = coworker.coworkerData;
                const dist = Phaser.Math.Distance.Between(coworker.x, coworker.y, this.player.x, this.player.y);
                const detected = dist < this.DETECTION_RADIUS && !this.isHiding;
                data.chasing = detected;

                data.radiusViz.setFillStyle(detected ? 0xef4444 : 0xf97316, detected ? 0.2 : 0.1);
                data.radiusViz.setStrokeStyle(1, detected ? 0xef4444 : 0xf97316, 0.3);

                if (detected) {
                    if (dist < 30) {
                        this.triggerEncounter(coworker);
                    } else {
                        this.physics.moveToObject(coworker, this.player, 80);
                    }
                } else {
                    const target = data.path[data.pathIndex];
                    const targetX = target.x * this.TILE_SIZE + this.TILE_SIZE / 2;
                    const targetY = target.y * this.TILE_SIZE + this.TILE_SIZE / 2;
                    const distToTarget = Phaser.Math.Distance.Between(coworker.x, coworker.y, targetX, targetY);
                    
                    if (distToTarget < 5) {
                        let nextIndex = data.pathIndex + data.direction;
                        if (nextIndex >= data.path.length || nextIndex < 0) {
                            data.direction *= -1;
                            nextIndex = data.pathIndex + data.direction;
                        }
                        data.pathIndex = nextIndex;
                    } else {
                        this.physics.moveTo(coworker, targetX, targetY, data.speed);
                    }
                }
            });
        } catch(e) {
            console.error('OfficeScene Update Error:', e);
        }
    }

    tryHide() {
        if (this.isHiding) return;
        if (this.physics.overlap(this.player, this.hidingZones)) {
            this.isHiding = true;
            this.player.setAlpha(0.5);
            const ind = document.getElementById('hide-indicator');
            if(ind) ind.classList.remove('hidden');
            
            let timeLeft = 3;
            const timerEl = document.getElementById('hide-timer');
            if(timerEl) timerEl.textContent = timeLeft;
            
            this.hideInterval = setInterval(() => {
                timeLeft--;
                if(timerEl) timerEl.textContent = timeLeft;
                if (timeLeft <= 0) this.stopHiding();
            }, 1000);
        }
    }

    stopHiding() {
        this.isHiding = false;
        this.player.setAlpha(1);
        const ind = document.getElementById('hide-indicator');
        if(ind) ind.classList.add('hidden');
        if (this.hideInterval) clearInterval(this.hideInterval);
    }

    triggerEncounter(coworker) {
        this.gameActive = false;
        this.prEncounter = coworker;
        
        const modal = document.getElementById('office-modal');
        if(!modal) return;
        
        // FIX: Use coworkerData
        modal.innerHTML = `
            <div class="text-center bg-slate-800 p-8 rounded-lg border border-slate-600 max-w-sm shadow-2xl">
                <p class="text-xl text-orange-500 font-bold mb-2">${coworker.coworkerData.name} caught you!</p>
                <p class="text-slate-300 mb-6">"${coworker.coworkerData.msg}"</p>
                <div class="flex gap-4 justify-center">
                    <button id="do-pr-btn" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-bold">Do the PR (5s)</button>
                    <button id="ignore-pr-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-bold">Ignore PR</button>
                </div>
                <p class="text-xs text-slate-400 mt-4">Ignoring reduces job security</p>
            </div>
        `;
        modal.classList.remove('hidden');

        document.getElementById('do-pr-btn').addEventListener('click', () => this.handleDoPR());
        document.getElementById('ignore-pr-btn').addEventListener('click', () => this.handleIgnorePR());
    }

    handleDoPR() {
        const modal = document.getElementById('office-modal');
        modal.innerHTML = `
            <div class="text-center bg-slate-800 p-8 rounded-lg border border-slate-600 shadow-2xl">
                <p class="text-xl text-blue-400 mb-4 font-bold">Reviewing PR...</p>
                <div class="text-4xl font-mono text-white mb-2" id="pr-timer">5s</div>
                <p class="text-sm text-slate-400">LGTM, ship it!</p>
            </div>
        `;
        
        this.doingPR = true;
        let timeLeft = 5;
        const interval = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById('pr-timer');
            if (timerEl) timerEl.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(interval);
                this.resetEncounter();
            }
        }, 1000);
    }

    handleIgnorePR() {
        this.jobSecurity--;
        this.updateJobSecurityUI();
        if (this.jobSecurity <= 0) this.handleFired();
        else this.resetEncounter();
    }

    updateJobSecurityUI() {
        const text = document.getElementById('job-security-text');
        const bar = document.getElementById('job-security-bar');
        if(text) text.textContent = `${this.jobSecurity}/3 chances`;
        if(bar) {
            bar.style.width = `${(this.jobSecurity / 3) * 100}%`;
            if (this.jobSecurity === 2) bar.className = "h-full bg-yellow-500 transition-all duration-300";
            if (this.jobSecurity === 1) bar.className = "h-full bg-red-500 transition-all duration-300";
        }
    }

    resetEncounter() {
        const modal = document.getElementById('office-modal');
        if(modal) modal.classList.add('hidden');
        this.gameActive = true;
        this.doingPR = false;
        if (this.prEncounter) {
            // FIX: Use coworkerData
            const data = this.prEncounter.coworkerData;
            this.prEncounter.setPosition(data.startPos.x, data.startPos.y);
            data.pathIndex = 0;
            this.prEncounter = null;
        }
    }

    handleFired() {
        const modal = document.getElementById('office-modal');
        if(!modal) return;
        modal.innerHTML = `
            <div class="text-center bg-slate-800 p-8 rounded-lg border border-slate-600 shadow-2xl">
                <p class="text-2xl text-red-500 font-bold mb-2">You've Been Fired!</p>
                <p class="text-slate-300 mb-4">You ignored too many PRs. HR has been notified.</p>
                <button id="retry-office-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-bold">Try Again</button>
            </div>
        `;
        document.getElementById('retry-office-btn').addEventListener('click', () => this.scene.restart());
    }

    handleWin() {
        if (this.finished) return;
        this.finished = true;
        this.gameActive = false;
        
        // Visual Feedback
        this.add.text(400, 300, 'LEVEL COMPLETE!\nLoading next scene...', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 10 },
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.physics.pause();
        if(this.player?.body) this.player.body.stop();
        
        // Fade out
        this.cameras.main.fade(1000, 0, 0, 0);
        
        setTimeout(() => {
            // Cleanup UI
            const uiContainer = document.getElementById('ui-container');
            if (uiContainer) uiContainer.innerHTML = '';
            
            // Cleanup Timers
            if (this.hideInterval) clearInterval(this.hideInterval);
            
            // Transition to GroceryScene directly (Skipping broken TransitionScene)
            try {
                console.log('Stopping OfficeScene, Starting GroceryScene');
                this.scene.stop('OfficeScene');
                this.scene.start('GroceryScene');
            } catch (e) {
                console.error('Transition failed:', e);
            }
        }, 1000);
    }
}
