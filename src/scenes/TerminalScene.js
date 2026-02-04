export class TerminalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TerminalScene' });
    }

    create() {
        // Background color handled by DOM overlay gradient
        this.createTerminalUI();
    }

    createTerminalUI() {
        const uiContainer = document.getElementById('ui-container');
        
        // CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(244, 114, 182, 0.4); }
                50% { box-shadow: 0 0 40px rgba(244, 114, 182, 0.7); }
            }
            .animate-float {
                animation: float 6s ease-in-out infinite;
            }
            .animate-pulse-glow {
                animation: pulse-glow 2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);

        uiContainer.innerHTML = `
            <div id="terminal-overlay" class="w-full h-full bg-gradient-to-b from-red-100 via-yellow-50 to-sky-100 relative overflow-hidden ui-content flex flex-col items-center justify-center p-8">
                <div id="floating-items-container" class="absolute inset-0 pointer-events-none"></div>
                
                <div id="content-container" class="relative z-10 text-center space-y-8 max-w-2xl">
                    <!-- Dynamic Content -->
                </div>
            </div>
        `;

        this.floatingItems = [];
        this.createFloatingItems();
        this.renderIntro();
    }

    getSVG(type, className = "w-8 h-8") {
        switch (type) {
            case "lily":
                return `
                  <svg viewBox="0 0 40 40" class="${className}">
                    <ellipse cx="20" cy="12" rx="6" ry="10" fill="#f8b4d9" />
                    <ellipse cx="12" cy="18" rx="6" ry="10" fill="#f9a8d4" transform="rotate(-30 12 18)" />
                    <ellipse cx="28" cy="18" rx="6" ry="10" fill="#f9a8d4" transform="rotate(30 28 18)" />
                    <ellipse cx="14" cy="26" rx="5" ry="9" fill="#fbb6ce" transform="rotate(-60 14 26)" />
                    <ellipse cx="26" cy="26" rx="5" ry="9" fill="#fbb6ce" transform="rotate(60 26 26)" />
                    <circle cx="20" cy="18" r="4" fill="#fcd34d" />
                  </svg>
                `;
            case "ski":
                return `
                  <svg viewBox="0 0 40 40" class="${className}">
                    <rect x="8" y="18" width="24" height="4" rx="2" fill="#60a5fa" />
                    <rect x="4" y="19" width="6" height="2" rx="1" fill="#3b82f6" />
                    <line x1="16" y1="10" x2="16" y2="18" stroke="#a3a3a3" stroke-width="2" />
                    <circle cx="16" cy="8" r="2" fill="#ef4444" />
                  </svg>
                `;
            case "carrot":
                return `
                  <svg viewBox="0 0 40 40" class="${className}">
                    <path d="M20 8 L26 32 L14 32 Z" fill="#f97316" />
                    <ellipse cx="18" cy="8" rx="3" ry="5" fill="#22c55e" transform="rotate(-20 18 8)" />
                    <ellipse cx="22" cy="8" rx="3" ry="5" fill="#22c55e" transform="rotate(20 22 8)" />
                    <ellipse cx="20" cy="6" rx="2" ry="4" fill="#16a34a" />
                  </svg>
                `;
            case "broccoli":
                return `
                  <svg viewBox="0 0 40 40" class="${className}">
                    <rect x="17" y="24" width="6" height="12" fill="#86efac" />
                    <circle cx="14" cy="16" r="6" fill="#22c55e" />
                    <circle cx="26" cy="16" r="6" fill="#22c55e" />
                    <circle cx="20" cy="12" r="7" fill="#16a34a" />
                    <circle cx="16" cy="20" r="5" fill="#22c55e" />
                    <circle cx="24" cy="20" r="5" fill="#22c55e" />
                  </svg>
                `;
            case "snowflake":
                return `
                  <svg viewBox="0 0 40 40" class="${className}">
                    <line x1="20" y1="4" x2="20" y2="36" stroke="#93c5fd" stroke-width="2" />
                    <line x1="4" y1="20" x2="36" y2="20" stroke="#93c5fd" stroke-width="2" />
                    <line x1="8" y1="8" x2="32" y2="32" stroke="#93c5fd" stroke-width="2" />
                    <line x1="32" y1="8" x2="8" y2="32" stroke="#93c5fd" stroke-width="2" />
                    <circle cx="20" cy="20" r="3" fill="#dbeafe" />
                  </svg>
                `;
            default:
                return '';
        }
    }

    createFloatingItems() {
        const container = document.getElementById('floating-items-container');
        const types = ["lily", "ski", "carrot", "broccoli", "snowflake"];
        
        for (let i = 0; i < 15; i++) {
            const type = types[i % types.length];
            const div = document.createElement('div');
            div.className = 'absolute opacity-40 animate-float';
            div.style.left = `${Math.random() * 100}%`;
            div.style.top = `${Math.random() * 100}%`;
            div.style.animationDelay = `${Math.random() * 5}s`;
            div.innerHTML = this.getSVG(type);
            container.appendChild(div);
        }
    }

    renderIntro() {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div class="flex justify-center mb-4">
              <svg viewBox="0 0 120 80" class="w-32 h-20">
                <ellipse cx="60" cy="25" rx="12" ry="22" fill="#f9a8d4" />
                <ellipse cx="40" cy="35" rx="12" ry="20" fill="#fbb6ce" transform="rotate(-25 40 35)" />
                <ellipse cx="80" cy="35" rx="12" ry="20" fill="#fbb6ce" transform="rotate(25 80 35)" />
                <ellipse cx="45" cy="50" rx="10" ry="18" fill="#fbcfe8" transform="rotate(-50 45 50)" />
                <ellipse cx="75" cy="50" rx="10" ry="18" fill="#fbcfe8" transform="rotate(50 75 50)" />
                <circle cx="60" cy="38" r="8" fill="#fcd34d" />
                <path d="M60 55 Q60 70 55 75" stroke="#22c55e" stroke-width="3" fill="none" />
                <ellipse cx="50" cy="72" rx="8" ry="4" fill="#22c55e" transform="rotate(-20 50 72)" />
              </svg>
            </div>

            <h1 class="text-5xl md:text-7xl font-bold text-rose-400 drop-shadow-lg">Xin</h1>
            <p class="text-2xl md:text-3xl text-amber-600 font-medium">2026 Birthday Adventure</p>
            
            <p class="text-lg text-rose-500 max-w-md mx-auto leading-relaxed">
              A special journey through offices, groceries, and snowy slopes awaits...
            </p>

            <button id="start-btn" class="mt-8 px-12 py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white text-xl font-semibold rounded-full shadow-lg hover:from-rose-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 animate-pulse-glow">
              Begin Adventure
            </button>

            <div class="flex justify-center gap-6 mt-8 opacity-60">
                ${this.getSVG("lily")} ${this.getSVG("ski")} ${this.getSVG("carrot")} ${this.getSVG("broccoli")} ${this.getSVG("snowflake")}
            </div>
        `;

        document.getElementById('start-btn').addEventListener('click', () => {
            this.startLoading();
        });
    }

    startLoading() {
        const container = document.getElementById('content-container');
        const loadingMessages = [
            "Planting lilies in the garden...",
            "Waxing the skis...",
            "Harvesting fresh vegetables...",
            "Hiding from PR reviews...",
            "Stocking Whole Foods shelves...",
            "Fluffing the couch cushions...",
            "Ready for adventure!"
        ];
        
        let progress = 0;
        
        const updateLoading = () => {
            const msgIndex = Math.min(Math.floor((progress / 100) * loadingMessages.length), loadingMessages.length - 1);
            
            container.innerHTML = `
                <div class="w-24 h-24 mx-auto relative mb-8">
                  <div class="absolute inset-0 animate-spin" style="animation-duration: 3s">
                    ${this.getSVG("snowflake", "w-24 h-24")}
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center transform scale-150">
                    ${this.getSVG("lily", "w-12 h-12")}
                  </div>
                </div>
                
                <p class="text-xl text-rose-500 font-medium animate-pulse">${loadingMessages[msgIndex]}</p>
                
                <div class="w-72 mx-auto mt-8">
                  <div class="h-3 bg-rose-100 rounded-full overflow-hidden shadow-inner">
                    <div class="h-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-300 rounded-full" style="width: ${progress}%"></div>
                  </div>
                  <p class="text-rose-400 mt-2 text-sm">${Math.floor(progress)}%</p>
                </div>
            `;
        };

        const interval = setInterval(() => {
            progress += Math.random() * 12 + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                updateLoading();
                this.time.delayedCall(500, () => this.showComplete());
            } else {
                updateLoading();
            }
        }, 350);
        updateLoading();
    }

    showComplete() {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div class="text-center space-y-4 animate-pulse">
                <div class="flex justify-center transform scale-150 mb-4">
                  ${this.getSVG("lily", "w-16 h-16")}
                </div>
                <p class="text-3xl text-rose-500 font-bold">Here we go!</p>
            </div>
        `;

        this.time.delayedCall(1500, () => {
            this.cleanupAndStartGame();
        });
    }

    cleanupAndStartGame() {
        const uiContainer = document.getElementById('ui-container');
        uiContainer.innerHTML = '';
        this.scene.start('OfficeScene');
    }
}
