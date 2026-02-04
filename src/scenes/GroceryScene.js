export class GroceryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GroceryScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#14532d'); // Green 900
        this.createGroceryUI();
    }

    createGroceryUI() {
        const uiContainer = document.getElementById('ui-container');
        
        // Initial State
        this.groceries = [
            { id: 1, name: "Salmon", quantity: 2, isHealthy: true, category: "protein" },
            { id: 2, name: "Cottage Cheese", quantity: 1, isHealthy: true, category: "dairy" },
            { id: 3, name: "Energy Drinks", quantity: 5, isHealthy: false, category: "drinks" },
            { id: 4, name: "Protein Bars", quantity: 4, isHealthy: true, category: "snacks" },
            { id: 5, name: "Burger Patties", quantity: 6, isHealthy: false, category: "protein" }
        ];

        this.veggieSuggestions = [
            "Spinach", "Broccoli", "Carrots", "Bell Peppers", 
            "Asparagus", "Kale", "Zucchini", "Sweet Potatoes"
        ];

        this.showVeggiePanel = false;
        this.customVeggie = "";

        uiContainer.innerHTML = `
            <div id="grocery-app" class="w-full max-w-2xl bg-white/90 p-6 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] font-sans ui-content">
                <!-- Header -->
                <div class="text-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Whole Foods Shopping List</h1>
                    <p class="text-green-700">Help Arin eat healthier! Add more veggies to the list.</p>
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

                <!-- Add Veggies -->
                <div id="veggie-card" class="mb-6 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                    <div id="veggie-header" class="p-4 cursor-pointer flex justify-between items-center text-green-800 font-bold hover:bg-green-100 transition rounded-t-lg">
                        <span>Add Veggies (Xin can edit this!)</span>
                        <span id="veggie-toggle">[+]</span>
                    </div>
                    <div id="veggie-content" class="hidden p-4 border-t border-green-200">
                        <div class="grid grid-cols-2 gap-2 mb-4">
                            <!-- Suggestions -->
                        </div>
                        <div class="flex gap-2">
                            <input type="text" id="custom-veggie-input" placeholder="Add custom veggie..." class="flex-1 px-3 py-2 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <button id="add-custom-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold">Add</button>
                        </div>
                    </div>
                </div>

                <!-- Compile Button -->
                <button id="compile-btn" class="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2">
                    <span>🛒</span> Compile Grocery List & Checkout
                </button>
            </div>
            
            <!-- Compiling Overlay (Hidden by default) -->
            <div id="compiling-overlay" class="hidden absolute inset-0 bg-white z-20 flex items-center justify-center ui-content">
                <div class="text-center max-w-md w-full p-8">
                    <div id="compile-logs" class="font-mono text-left text-gray-600 mb-4 text-sm space-y-2">
                        <p>> Compiling grocery list...</p>
                        <p>> Validating nutrition requirements...</p>
                    </div>
                    <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div id="compile-bar" class="h-full bg-green-600 transition-all duration-200 w-0"></div>
                    </div>
                    <p id="compile-pct" class="text-gray-500 mt-2">0%</p>
                </div>
            </div>
        `;

        this.renderUI();
        this.setupListeners();
    }

    setupListeners() {
        // Toggle Veggie Panel
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

        // Add Custom Veggie
        document.getElementById('add-custom-btn').addEventListener('click', () => this.addCustomVeggie());
        document.getElementById('custom-veggie-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.addCustomVeggie();
        });

        // Compile
        document.getElementById('compile-btn').addEventListener('click', () => this.runCompileSequence());
    }

    addCustomVeggie() {
        const input = document.getElementById('custom-veggie-input');
        const val = input.value.trim();
        if (val) {
            this.addVeggie(val);
            input.value = '';
        }
    }

    renderUI() {
        this.renderHealthScore();
        this.renderCart();
        this.renderVeggieSuggestions();
    }

    renderHealthScore() {
        const totalQty = this.groceries.reduce((acc, g) => acc + g.quantity, 0);
        const healthyQty = this.groceries
            .filter(g => g.isHealthy || g.category === "veggies")
            .reduce((acc, g) => acc + g.quantity, 0);
        
        const score = totalQty > 0 ? Math.round((healthyQty / totalQty) * 100) : 0;
        const veggieCount = this.groceries.filter(g => g.category === "veggies").reduce((acc, g) => acc + g.quantity, 0);
        const isHealthy = score >= 60;

        const card = document.getElementById('health-card');
        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Health Score</span>
                <span class="text-lg font-bold ${isHealthy ? 'text-green-600' : 'text-red-500'}">${score}%</span>
            </div>
            <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-300 ${isHealthy ? 'bg-green-500' : 'bg-red-400'}" style="width: ${score}%"></div>
            </div>
            <p class="text-xs text-gray-500 mt-2">
                Veggies in cart: ${veggieCount} | ${isHealthy ? "Looking healthy!" : "Needs more veggies!"}
            </p>
        `;
    }

    renderCart() {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        
        this.groceries.forEach(item => {
            const div = document.createElement('div');
            // Category colors
            let bgClass = "bg-gray-50 border-gray-200";
            if (item.category === 'protein') bgClass = "bg-red-50 border-red-200";
            if (item.category === 'drinks') bgClass = "bg-blue-50 border-blue-200";
            if (item.category === 'snacks') bgClass = "bg-yellow-50 border-yellow-200";
            if (item.category === 'veggies') bgClass = "bg-green-50 border-green-200";
            if (item.category === 'dairy') bgClass = "bg-slate-50 border-slate-200";

            div.className = `flex items-center justify-between p-3 rounded-lg border ${bgClass}`;
            
            const isGood = item.isHealthy || item.category === "veggies";
            
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

        // Listeners
        container.querySelectorAll('.inc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateQuantity(parseInt(e.target.dataset.id), 1));
        });
        container.querySelectorAll('.dec-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateQuantity(parseInt(e.target.dataset.id), -1));
        });
    }

    renderVeggieSuggestions() {
        const container = document.querySelector('#veggie-content .grid');
        if (!container.innerHTML) { // Only render once
            this.veggieSuggestions.forEach(name => {
                const btn = document.createElement('button');
                btn.className = "flex items-center justify-start px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded border border-green-300 text-sm";
                btn.innerHTML = `<span class="mr-2">➕</span> ${name}`;
                btn.addEventListener('click', () => this.addVeggie(name));
                container.appendChild(btn);
            });
        }
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

    addVeggie(name) {
        const existing = this.groceries.find(g => g.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            existing.quantity++;
        } else {
            this.groceries.push({
                id: Date.now(),
                name: name,
                quantity: 1,
                isHealthy: true,
                category: "veggies"
            });
        }
        this.renderUI();
    }

    runCompileSequence() {
        const overlay = document.getElementById('compiling-overlay');
        overlay.classList.remove('hidden');
        
        const logs = document.getElementById('compile-logs');
        const bar = document.getElementById('compile-bar');
        const pct = document.getElementById('compile-pct');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5; // Faster update
            if (progress > 100) progress = 100;

            bar.style.width = `${progress}%`;
            pct.textContent = `${progress}%`;

            if (progress === 30) {
                logs.innerHTML += `<p>> Optimizing cart layout...</p>`;
            }
            if (progress === 60) {
                logs.innerHTML += `<p class="text-green-500">> Health check passed!</p>`;
            }
            if (progress === 100) {
                logs.innerHTML += `<p class="text-green-500">> Build successful!</p>`;
                clearInterval(interval);
                this.time.delayedCall(1000, () => this.cleanupAndNext());
            }
        }, 100);
    }

    cleanupAndNext() {
        const uiContainer = document.getElementById('ui-container');
        uiContainer.innerHTML = '';
        this.scene.start('SkiScene');
    }
}
