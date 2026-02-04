export class GroceryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GroceryScene' });
    }

    create() {
        this.createGroceryUI();
    }

    createGroceryUI() {
        const uiContainer = document.getElementById('ui-container');
        
        // Arin's List (Initial Cart)
        this.groceries = [
            { id: 1, name: "Redbull Energy", quantity: 3, category: "drinks" },
            { id: 2, name: "Protein Bars", quantity: 2, category: "snacks" },
            { id: 3, name: "Body Armour", quantity: 2, category: "drinks" },
            { id: 4, name: "Bread", quantity: 1, category: "grains" }
        ];

        // Xin's List (Suggestions to Add)
        this.xinSuggestions = [
            { name: "Salmon", category: "protein" },
            { name: "Cottage Cheese", category: "dairy" },
            { name: "Burger Patties", category: "protein" },
            { name: "Spinach", category: "veggies" },
            { name: "Carrots", category: "veggies" },
            { name: "Asparagus", category: "veggies" },
            { name: "Broccoli", category: "veggies" },
            { name: "Kale", category: "veggies" }
        ];

        this.showVeggiePanel = true; // Default open as per image implication? Or keep togglable. I'll keep togglable but styled.

        uiContainer.innerHTML = `
            <div id="grocery-app" class="w-full max-w-2xl bg-white/95 p-6 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] font-sans ui-content backdrop-blur-sm">
                <!-- Header -->
                <div class="text-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Whole Foods Shopping List</h1>
                    <p class="text-green-700">Refactor the cart! <br><span class="text-sm text-gray-500">Requirement: >50% Veggies</span></p>
                </div>

                <!-- Health Score -->
                <div id="health-card" class="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm"></div>

                <!-- Cart -->
                <div id="cart-card" class="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div class="p-4 border-b border-gray-100 flex items-center gap-2">
                        <span class="text-xl">🛒</span>
                        <h2 class="font-bold text-gray-900">Arin's Cart</h2>
                    </div>
                    <div id="cart-items" class="p-4 space-y-2"></div>
                </div>

                <!-- Add Veggies (Xin's Panel) - Dark Green Design -->
                <div id="veggie-card" class="mb-6 bg-[#022c22] rounded-lg shadow-lg overflow-hidden border border-green-800">
                    <div id="veggie-header" class="p-4 cursor-pointer flex justify-between items-center text-white font-bold hover:bg-green-900/50 transition">
                        <span>Add Veggies (Xin can edit this!)</span>
                        <span id="veggie-toggle">[-]</span>
                    </div>
                    <div id="veggie-content" class="p-4 pt-0">
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <!-- Suggestions injected here -->
                        </div>
                        <div class="flex gap-2 bg-green-900/30 p-1 rounded-lg border border-green-800">
                            <input type="text" id="custom-veggie-input" placeholder="Add custom veggie..." class="flex-1 px-3 py-2 bg-transparent text-white placeholder-green-500/50 focus:outline-none">
                            <button id="add-custom-btn" class="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-md font-bold transition shadow-lg">Add</button>
                        </div>
                    </div>
                </div>

                <!-- Compile Button -->
                <button id="compile-btn" class="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span>🛒</span> Compile Grocery List & Checkout
                </button>
            </div>
            
            <!-- Compiling Overlay -->
            <div id="compiling-overlay" class="hidden absolute inset-0 bg-white/98 z-50 flex items-center justify-center ui-content">
                <div class="text-center max-w-md w-full p-8">
                    <div id="compile-logs" class="font-mono text-left text-gray-600 mb-4 text-sm space-y-2 h-32 overflow-y-auto">
                        <p>> Compiling grocery list...</p>
                    </div>
                    <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div id="compile-bar" class="h-full bg-green-600 transition-all duration-200 w-0"></div>
                    </div>
                    <p id="compile-pct" class="text-gray-500 mt-2">0%</p>
                    <p id="compile-error" class="text-red-500 mt-4 font-bold hidden"></p>
                    <button id="retry-btn" class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 hidden">Retry Refactor</button>
                </div>
            </div>
        `;

        this.renderUI();
        this.setupListeners();
    }

    setupListeners() {
        const header = document.getElementById('veggie-header');
        header.addEventListener('click', () => {
            this.showVeggiePanel = !this.showVeggiePanel;
            const content = document.getElementById('veggie-content');
            const toggle = document.getElementById('veggie-toggle');
            if (this.showVeggiePanel) {
                content.classList.remove('hidden');
                toggle.textContent = '[-]';
            } else {
                content.classList.add('hidden');
                toggle.textContent = '[+]';
            }
        });

        document.getElementById('add-custom-btn').addEventListener('click', () => this.addCustomVeggie());
        document.getElementById('custom-veggie-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.addCustomVeggie();
        });

        document.getElementById('compile-btn').addEventListener('click', () => this.runCompileSequence());
        
        // Delegated listener for retry
        document.getElementById('compiling-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'retry-btn') {
                document.getElementById('compiling-overlay').classList.add('hidden');
                // Reset logs
                document.getElementById('compile-logs').innerHTML = '<p>> Compiling grocery list...</p>';
                document.getElementById('compile-bar').style.width = '0%';
                document.getElementById('compile-pct').textContent = '0%';
                document.getElementById('compile-error').classList.add('hidden');
                document.getElementById('retry-btn').classList.add('hidden');
            }
        });
    }

    addCustomVeggie() {
        const input = document.getElementById('custom-veggie-input');
        const val = input.value.trim();
        if (val) {
            this.addItem(val, 'veggies'); // Assume custom additions are veggies
            input.value = '';
        }
    }

    renderUI() {
        this.renderHealthScore();
        this.renderCart();
        this.renderSuggestions();
    }

    isItemHealthy(item) {
        // Meat (Protein) and Veggies are positive.
        // Salmon, Burger Patties = Protein = Positive.
        // Cottage Cheese = Dairy = Negative.
        return item.category === 'veggies' || item.category === 'protein';
    }

    calculateVeggiePercent() {
        const totalQty = this.groceries.reduce((acc, g) => acc + g.quantity, 0);
        const veggieQty = this.groceries
            .filter(g => g.category === 'veggies')
            .reduce((acc, g) => acc + g.quantity, 0);
        return totalQty > 0 ? (veggieQty / totalQty) : 0;
    }

    renderHealthScore() {
        const totalQty = this.groceries.reduce((acc, g) => acc + g.quantity, 0);
        const healthyQty = this.groceries
            .filter(g => this.isItemHealthy(g))
            .reduce((acc, g) => acc + g.quantity, 0);
        
        const score = totalQty > 0 ? Math.round((healthyQty / totalQty) * 100) : 0;
        const veggiePct = Math.round(this.calculateVeggiePercent() * 100);
        const isHealthy = score >= 50 && veggiePct >= 50; // Requirement >50% veggies? Or just >50% health? Prompt says "total vegtables be at least 50%".
        
        const card = document.getElementById('health-card');
        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Health Score</span>
                <span class="text-lg font-bold ${score >= 60 ? 'text-green-600' : 'text-red-500'}">${score}%</span>
            </div>
            <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div class="h-full transition-all duration-300 ${score >= 60 ? 'bg-green-500' : 'bg-red-400'}" style="width: ${score}%"></div>
            </div>
            <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Veggie Ratio (${veggiePct}%)</span>
                <span class="text-xs ${veggiePct >= 50 ? 'text-green-600' : 'text-red-500'} font-bold">${veggiePct >= 50 ? 'Pass' : 'Needs >50%'}</span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-300 ${veggiePct >= 50 ? 'bg-green-500' : 'bg-orange-400'}" style="width: ${veggiePct}%"></div>
            </div>
        `;
    }

    renderCart() {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        
        this.groceries.forEach(item => {
            const div = document.createElement('div');
            let bgClass = "bg-gray-50 border-gray-200";
            if (item.category === 'protein') bgClass = "bg-red-50 border-red-200";
            if (item.category === 'drinks') bgClass = "bg-blue-50 border-blue-200";
            if (item.category === 'snacks') bgClass = "bg-yellow-50 border-yellow-200";
            if (item.category === 'veggies') bgClass = "bg-green-50 border-green-200";
            if (item.category === 'dairy') bgClass = "bg-slate-50 border-slate-200";
            if (item.category === 'grains') bgClass = "bg-orange-50 border-orange-200";

            div.className = `flex items-center justify-between p-3 rounded-lg border ${bgClass}`;
            const isGood = this.isItemHealthy(item);
            
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span>${isGood ? '✅' : '❌'}</span>
                    <span class="text-gray-900 font-medium">${item.name}</span>
                    <span class="text-xs text-gray-500 capitalize">(${item.category})</span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="dec-btn w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-white" data-id="${item.id}">➖</button>
                    <span class="w-8 text-center font-mono text-gray-800">${item.quantity}</span>
                    <button class="inc-btn w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-white" data-id="${item.id}">➕</button>
                </div>
            `;
            container.appendChild(div);
        });

        container.querySelectorAll('.inc-btn').forEach(btn => btn.addEventListener('click', (e) => this.updateQuantity(parseInt(e.target.dataset.id), 1)));
        container.querySelectorAll('.dec-btn').forEach(btn => btn.addEventListener('click', (e) => this.updateQuantity(parseInt(e.target.dataset.id), -1)));
    }

    renderSuggestions() {
        const container = document.querySelector('#veggie-content .grid');
        container.innerHTML = '';
        
        this.xinSuggestions.forEach(item => {
            const btn = document.createElement('button');
            btn.className = "flex items-center justify-start px-4 py-3 bg-[#0a3315] hover:bg-[#14532d] text-white rounded-lg border border-green-700 text-sm font-semibold transition shadow-sm group";
            btn.innerHTML = `<span class="mr-2 text-green-400 group-hover:text-white transition">+</span> ${item.name}`;
            btn.addEventListener('click', () => this.addItem(item.name, item.category));
            container.appendChild(btn);
        });
    }

    updateQuantity(id, delta) {
        const item = this.groceries.find(g => g.id === id);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.groceries = this.groceries.filter(g => g.id !== id);
        }
        this.renderUI();
    }

    addItem(name, category) {
        const existing = this.groceries.find(g => g.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            existing.quantity++;
        } else {
            this.groceries.push({
                id: Date.now(),
                name: name,
                quantity: 1,
                category: category
            });
        }
        this.renderUI();
    }

    runCompileSequence() {
        const veggiePct = this.calculateVeggiePercent();
        const passed = veggiePct >= 0.5;

        const overlay = document.getElementById('compiling-overlay');
        overlay.classList.remove('hidden');
        const logs = document.getElementById('compile-logs');
        const bar = document.getElementById('compile-bar');
        const pct = document.getElementById('compile-pct');
        const errorMsg = document.getElementById('compile-error');
        const retryBtn = document.getElementById('retry-btn');

        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            if (progress > 100) progress = 100;

            bar.style.width = `${progress}%`;
            pct.textContent = `${progress}%`;

            if (progress === 20) logs.innerHTML += `<p>> Checking veggie ratio...</p>`;
            
            if (progress === 50) {
                if (passed) logs.innerHTML += `<p class="text-green-500">> Ratio ${(veggiePct*100).toFixed(0)}% check passed!</p>`;
                else logs.innerHTML += `<p class="text-red-500">> Ratio ${(veggiePct*100).toFixed(0)}% check FAILED. Need 50%!</p>`;
            }

            if (progress === 100) {
                clearInterval(interval);
                if (passed) {
                    logs.innerHTML += `<p class="text-green-500 font-bold">> DEPLOYMENT APPROVED</p>`;
                    this.time.delayedCall(1000, () => this.cleanupAndNext());
                } else {
                    logs.innerHTML += `<p class="text-red-600 font-bold">> DEPLOYMENT BLOCKED</p>`;
                    errorMsg.textContent = "Error: Veggie content insufficient. Please refactor cart.";
                    errorMsg.classList.remove('hidden');
                    retryBtn.classList.remove('hidden');
                }
            }
            logs.scrollTop = logs.scrollHeight;
        }, 50);
    }

    cleanupAndNext() {
        const uiContainer = document.getElementById('ui-container');
        uiContainer.innerHTML = '';
        this.scene.start('SkiScene');
    }
}
