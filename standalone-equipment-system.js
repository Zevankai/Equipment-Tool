/**
 * STANDALONE EQUIPMENT SYSTEM
 * ==========================
 * 
 * A complete, independent equipment management system for RPG/character management applications.
 * This system handles:
 * - Equipment overview with equipped items and gold count
 * - Weapons, armor, clothing, and jewelry management  
 * - Consumables (potions, canisters, food) management
 * - Quest items management
 * - Gold tracking system with coins, pouches, chests, and banks
 * - Encumbrance calculation and tracking
 * - Bag/backpack selection with different capacities and bonuses
 * 
 * USAGE:
 * ------
 * 1. Include this file in your HTML: <script src="standalone-equipment-system.js"></script>
 * 2. Create a container element: <div id="equipment-container"></div>
 * 3. Initialize the system: const equipmentSystem = new EquipmentSystem('equipment-container');
 * 4. Optionally provide callbacks for external integration (save/load, UI updates)
 * 
 * FEATURES:
 * ---------
 * - Complete item management (add, edit, delete, equip/unequip)
 * - Intelligent categorization system
 * - Encumbrance calculation and warnings
 * - Gold/currency management with automatic conversions
 * - Bank storage system
 * - Search and filtering
 * - Multiple bag types with different capacities
 * - Equipment slot management (weapons, armor, jewelry, belt)
 * - Responsive UI with modal dialogs
 * 
 * LICENSE: MIT (or your preferred license)
 */

class EquipmentSystem {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            // Callbacks for external integration
            onDataChanged: options.onDataChanged || (() => {}),
            onEncumbranceChanged: options.onEncumbranceChanged || (() => {}),
            onEquipmentChanged: options.onEquipmentChanged || (() => {}),
            // Initial data
            initialData: options.initialData || null,
            // UI options
            enableEncumbranceWarning: options.enableEncumbranceWarning !== false,
            enableGoldTracking: options.enableGoldTracking !== false,
            enableBagSelection: options.enableBagSelection !== false,
            ...options
        };
        
        this.init();
    }

    // ===== EQUIPMENT DATA STRUCTURE =====
    getDefaultData() {
        return {
            // Equipped items (visual slots on character silhouette)
            equipped: {
                primaryWeapon: null,    // Left hand
                secondaryWeapon: null,  // Right hand
                armor: null,            // Head/torso
                clothing: null,         // Chest
                jewelry: [null, null, null], // Neck area (3 slots)
                belt: [null, null, null, null, null], // Waist area - consumables/quest items (5 slots)
            },
            // All items inventory organized by category
            inventory: {
                'Gear': [],
                'Utility': [],
                'Quest': [],
                'Crafting': [],
                'Personal': []
            },
            // Gold tracking
            gold: {
                coins: 0, // 0-10
                pouches: 0, // 0-10
                chest: 0, // 0-1
                equippedPouches: 0, // 0-2 (equipped on person)
                banks: [] // Array of {location: string, chests: number}
            },
            // Search and filter state
            searchTerm: '',
            selectedCategory: 'All',
            selectedTags: [],
            // Bag selection
            selectedBag: 'Standard Backpack'
        };
    }

    // ===== ITEM TYPES AND CATEGORIES =====
    get itemCategories() {
        return {
            'Gear': ['weapon', 'armor', 'potion', 'flask', 'ammunition'],
            'Utility': ['adventure', 'tool', 'food', 'map', 'camp'],
            'Quest': ['npc-item', 'evidence', 'literature', 'magical'],
            'Crafting': ['materials', 'components'],
            'Personal': ['personal'] // Items can be manually relocated here
        };
    }

    get itemTypes() {
        return [
            'weapon', 'armor', 'potion', 'flask', 'ammunition',
            'adventure', 'tool', 'food', 'map', 'camp',
            'npc-item', 'evidence', 'literature', 'magical',
            'materials', 'components', 'personal'
        ];
    }

    get additionalTags() {
        return [
            'Rare', 'Tradable', 'Personal', 'Custom', 'Valuable', 'Consumable', 'Magical', 'Cursed'
        ];
    }

    get encumbranceWeights() {
        return {
            'weapon': 3,
            'armor': 10,
            'clothing': 3,
            'camp': 2,
            'potion': 1,
            'flask': 1,
            'ammunition': 1,
            'adventure': 1,
            'tool': 1,
            'food': 1,
            'map': 1,
            'npc-item': 1,
            'evidence': 1,
            'literature': 1,
            'magical': 1,
            'materials': 1,
            'components': 1,
            'personal': 1
        };
    }

    get abilities() {
        return [
            'Agility', 'Strength', 'Finesse', 
            'Instinct', 'Presence', 'Knowledge'
        ];
    }

    get bagTypes() {
        return {
            'Standard Backpack': {
                capacity: 30,
                consumableSlots: 3,
                bonus: null
            },
            'Adventurer\'s Backpack': {
                capacity: 45,
                consumableSlots: 2,
                bonus: null
            },
            'Warrior\'s Backpack': {
                capacity: 26,
                consumableSlots: 6,
                bonus: '+1 to Finesse rolls in combat'
            },
            'Arcane Satchel': {
                capacity: 22,
                consumableSlots: 8,
                bonus: '+1 to Instinct rolls outside of combat'
            },
            'Tinker\'s Pack': {
                capacity: 20,
                consumableSlots: 12,
                bonus: '+2 to Finesse rolls when crafting'
            }
        };
    }

    // ===== INITIALIZATION =====
    init() {
        this.data = this.options.initialData || this.getDefaultData();
        this.setupStyles();
        this.render();
        this.updateEncumbranceDisplay();
    }

    // ===== UTILITY FUNCTIONS =====
    calculateEncumbrance() {
        let totalWeight = 0;
        
        // Calculate weight of UNEQUIPPED items only
        Object.values(this.data.inventory).forEach(categoryItems => {
            categoryItems.forEach(item => {
                if (!this.isItemEquipped(item, item.type)) {
                    totalWeight += this.encumbranceWeights[item.type] || 1;
                }
            });
        });
        
        return totalWeight;
    }

    isEncumbered() {
        const selectedBag = this.bagTypes[this.data.selectedBag] || this.bagTypes['Standard Backpack'];
        return this.calculateEncumbrance() > selectedBag.capacity;
    }

    getMaxCapacity() {
        const selectedBag = this.bagTypes[this.data.selectedBag] || this.bagTypes['Standard Backpack'];
        return selectedBag.capacity;
    }

    getItemCategory(itemType) {
        for (const [category, types] of Object.entries(this.itemCategories)) {
            if (types.includes(itemType)) {
                return category;
            }
        }
        return 'Personal'; // Default category
    }

    getAllItems() {
        let allItems = [];
        Object.values(this.data.inventory).forEach(categoryItems => {
            allItems = allItems.concat(categoryItems);
        });
        return allItems;
    }

    searchItems(searchTerm, category = 'All', tags = []) {
        let items = this.getAllItems();
        
        // Filter by search term
        if (searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.features && item.features.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        // Filter by category
        if (category !== 'All') {
            items = items.filter(item => this.getItemCategory(item.type) === category);
        }
        
        // Filter by tags
        if (tags.length > 0) {
            items = items.filter(item => 
                item.tags && tags.every(tag => item.tags.includes(tag))
            );
        }
        
        return items;
    }

    // ===== RENDERING METHODS =====
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Equipment System: Container with ID '${this.containerId}' not found!`);
            return;
        }
        
        const encumbrance = this.calculateEncumbrance();
        const isOverEncumbered = this.isEncumbered();
        const hasItems = Object.values(this.data.inventory).some(categoryItems => categoryItems.length > 0);
        
        container.innerHTML = `
            <div class="equipment-container">
                <div class="equipment-header">
                    <h2>Equipment System</h2>
                    ${(hasItems && isOverEncumbered && this.options.enableEncumbranceWarning) ? 
                        '<div class="encumbrance-warning">⚠️ ENCUMBERED - Carrying too much weight!</div>' : ''}
                    
                    ${this.options.enableEncumbranceWarning ? `
                        <div class="encumbrance-display">
                            <span class="encumbrance-text">Encumbrance: ${encumbrance}/${this.getMaxCapacity()} units</span>
                            <div class="encumbrance-bar">
                                <div class="encumbrance-fill" style="width: ${Math.min((encumbrance / this.getMaxCapacity()) * 100, 100)}%"></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${this.options.enableBagSelection ? `
                        <div class="bag-selector">
                            <label for="bag-select">Bag Type:</label>
                            <select id="bag-select">
                                ${Object.keys(this.bagTypes).map(bagName => 
                                    `<option value="${bagName}" ${this.data.selectedBag === bagName ? 'selected' : ''}>${bagName}</option>`
                                ).join('')}
                            </select>
                            <div class="bag-info">
                                <span class="bag-capacity">Capacity: ${this.getMaxCapacity()} units</span>
                                <span class="bag-consumables">Belt Slots: ${this.bagTypes[this.data.selectedBag].consumableSlots}</span>
                                ${this.bagTypes[this.data.selectedBag].bonus ? `<span class="bag-bonus">${this.bagTypes[this.data.selectedBag].bonus}</span>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="equipment-nav">
                        <button class="equipment-nav-btn active" data-section="overview">Overview</button>
                        <button class="equipment-nav-btn" data-section="inventory">Inventory</button>
                        ${this.options.enableGoldTracking ? '<button class="equipment-nav-btn" data-section="gold">Gold Tracker</button>' : ''}
                    </div>
                </div>
                
                <div id="equipment-content">
                    ${this.renderOverviewContent()}
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }

    renderOverviewContent() {
        const equipped = this.data.equipped;
        const gold = this.data.gold;
        
        return `
            <div class="overview-section">
                <div class="equipped-items-container">
                    <h3>Currently Equipped</h3>
                    <div class="equipped-grid">
                        <!-- Combat Equipment -->
                        <div class="equipment-category">
                            <h4>⚔️ Combat</h4>
                            <div class="equipment-slots">
                                <div class="equipment-slot ${equipped.primaryWeapon ? 'filled' : 'empty'}" data-slot="primaryWeapon">
                                    <div class="slot-label">Primary Weapon</div>
                                    <div class="slot-content">
                                        ${equipped.primaryWeapon ? 
                                            `<div class="equipped-item-name">${equipped.primaryWeapon.name}</div>
                                             <button class="unequip-btn" data-action="unequip-specific" data-slot="primaryWeapon">×</button>` :
                                            '<div class="empty-slot">Drop weapon here</div>'
                                        }
                                    </div>
                                </div>
                                <div class="equipment-slot ${equipped.secondaryWeapon ? 'filled' : 'empty'}" data-slot="secondaryWeapon">
                                    <div class="slot-label">Secondary Weapon</div>
                                    <div class="slot-content">
                                        ${equipped.secondaryWeapon ? 
                                            `<div class="equipped-item-name">${equipped.secondaryWeapon.name}</div>
                                             <button class="unequip-btn" data-action="unequip-specific" data-slot="secondaryWeapon">×</button>` :
                                            '<div class="empty-slot">Drop weapon here</div>'
                                        }
                                    </div>
                                </div>
                                <div class="equipment-slot ${equipped.armor ? 'filled' : 'empty'}" data-slot="armor">
                                    <div class="slot-label">Armor</div>
                                    <div class="slot-content">
                                        ${equipped.armor ? 
                                            `<div class="equipped-item-name">${equipped.armor.name}</div>
                                             <button class="unequip-btn" data-action="unequip-specific" data-slot="armor">×</button>` :
                                            '<div class="empty-slot">Drop armor here</div>'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Attire -->
                        <div class="equipment-category">
                            <h4>👕 Attire</h4>
                            <div class="equipment-slots">
                                <div class="equipment-slot ${equipped.clothing ? 'filled' : 'empty'}" data-slot="clothing">
                                    <div class="slot-label">Clothing</div>
                                    <div class="slot-content">
                                        ${equipped.clothing ? 
                                            `<div class="equipped-item-name">${equipped.clothing.name}</div>
                                             <button class="unequip-btn" data-action="unequip-specific" data-slot="clothing">×</button>` :
                                            '<div class="empty-slot">Drop clothing here</div>'
                                        }
                                    </div>
                                </div>
                                <div class="jewelry-container">
                                    <div class="slot-label">💍 Jewelry (${equipped.jewelry.filter(j => j).length}/3)</div>
                                    <div class="jewelry-slots">
                                        ${equipped.jewelry.map((item, i) => `
                                            <div class="equipment-slot jewelry-slot ${item ? 'filled' : 'empty'}" data-slot="jewelry" data-index="${i}">
                                                <div class="slot-content">
                                                    ${item ? 
                                                        `<div class="equipped-item-name">${item.name}</div>
                                                         <button class="unequip-btn" data-action="unequip-jewelry" data-index="${i}">×</button>` :
                                                        '<div class="empty-slot">Empty</div>'
                                                    }
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Belt Items -->
                        <div class="equipment-category">
                            <h4>🎒 Belt & Consumables</h4>
                            <div class="belt-container">
                                <div class="slot-label">Belt Items (${equipped.belt.filter(b => b).length}/${this.bagTypes[this.data.selectedBag].consumableSlots})</div>
                                <div class="belt-slots">
                                    ${equipped.belt.map((item, i) => `
                                        <div class="equipment-slot belt-slot ${item ? 'filled' : 'empty'}" data-slot="belt" data-index="${i}">
                                            <div class="slot-content">
                                                ${item ? 
                                                    `<div class="equipped-item-name">${item.name}</div>
                                                     <div class="item-type">${item.type}</div>
                                                     <button class="unequip-btn" data-action="unequip-belt" data-index="${i}">×</button>` :
                                                    '<div class="empty-slot">Empty</div>'
                                                }
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${this.options.enableGoldTracking ? `
                    <div class="gold-summary">
                        <h3>Gold Summary</h3>
                        <div class="gold-display">
                            <div class="gold-amount">
                                <span class="gold-icon">💰</span>
                                <span class="gold-text">
                                    ${gold.chest ? '1 Chest + ' : ''}${gold.pouches} Pouches + ${gold.coins} Coins
                                </span>
                            </div>
                            <div class="gold-equipped">
                                <span class="equipped-gold">Equipped: ${gold.equippedPouches} Pouches</span>
                            </div>
                            ${gold.banks.length > 0 ? `
                                <div class="gold-banks">
                                    <span class="bank-gold">Banks: ${gold.banks.reduce((total, bank) => total + bank.chests, 0)} Chests</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderInventorySection() {
        return `
            <div class="inventory-section">
                <div class="inventory-header">
                    <div class="search-controls">
                        <input type="text" id="item-search" placeholder="Search items..." 
                               value="${this.data.searchTerm}">
                        <select id="category-filter">
                            <option value="All">All Categories</option>
                            ${Object.keys(this.itemCategories).map(category => 
                                `<option value="${category}" ${this.data.selectedCategory === category ? 'selected' : ''}>${category}</option>`
                            ).join('')}
                        </select>
                        <button class="add-item-btn" data-action="add-item">+ Add Item</button>
                    </div>
                </div>
                
                <div class="inventory-content">
                    ${this.renderInventoryCategories()}
                </div>
            </div>
        `;
    }

    renderInventoryCategories() {
        const categories = this.data.selectedCategory === 'All' ? 
            Object.keys(this.itemCategories) : [this.data.selectedCategory];
        
        return categories.map(category => {
            const items = this.data.inventory[category] || [];
            const filteredItems = this.data.searchTerm ? 
                items.filter(item => 
                    item.name.toLowerCase().includes(this.data.searchTerm.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(this.data.searchTerm.toLowerCase())) ||
                    (item.features && item.features.toLowerCase().includes(this.data.searchTerm.toLowerCase()))
                ) : items;
            
            return `
                <div class="inventory-category">
                    <h4>${category} (${filteredItems.length})</h4>
                    <div class="items-grid compact">
                        ${filteredItems.length > 0 ? 
                            filteredItems.map((item, index) => this.renderCompactItemCard(item, category, index)).join('') :
                            '<div class="no-items">No items in this category</div>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCompactItemCard(item, category, index) {
        const isEquipped = this.isItemEquipped(item, item.type);
        const weight = this.encumbranceWeights[item.type] || 1;
        
        return `
            <div class="item-card compact ${isEquipped ? 'equipped' : ''}" data-item-id="${item.id}">
                <div class="item-header">
                    <h5 class="item-name">${item.name}</h5>
                    <span class="item-weight">${weight}u</span>
                    ${isEquipped ? '<span class="equipped-indicator">✓</span>' : ''}
                </div>
                <div class="item-type">${item.type}</div>
                ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                ${item.tags && item.tags.length > 0 ? `<div class="item-tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                <div class="item-actions">
                    ${isEquipped ? 
                        `<button class="equip-btn unequip" data-action="unequip-item" data-type="${item.type}" data-category="${category}" data-index="${index}">Unequip</button>` :
                        `<button class="equip-btn" data-action="equip-item" data-type="${item.type}" data-category="${category}" data-index="${index}">Equip</button>`
                    }
                    <button class="edit-btn" data-action="edit-item" data-category="${category}" data-index="${index}">Edit</button>
                    <button class="drop-btn" data-action="drop-item" data-category="${category}" data-index="${index}">Drop</button>
                    <button class="sell-btn" data-action="sell-item" data-category="${category}" data-index="${index}">Sell</button>
                </div>
            </div>
        `;
    }

    renderGoldSection() {
        if (!this.options.enableGoldTracking) return '';
        
        const gold = this.data.gold;
        
        return `
            <div class="gold-section">
                <h3>Gold Tracker</h3>
                
                <div class="gold-tracker">
                    <div class="gold-category">
                        <h4>Coins (${gold.coins}/10)</h4>
                        <div class="gold-circles">
                            ${this.renderGoldCircles('coins', gold.coins, 10)}
                        </div>
                    </div>
                    
                    <div class="gold-category">
                        <h4>Pouches (${gold.pouches}/10)</h4>
                        <div class="gold-circles">
                            ${this.renderGoldCircles('pouches', gold.pouches, 10)}
                        </div>
                        <div class="equipped-pouches">
                            <label>Equipped Pouches (${gold.equippedPouches}/2):</label>
                            <div class="equipped-pouch-controls">
                                <button data-action="adjust-equipped-pouches" data-change="-1" ${gold.equippedPouches === 0 ? 'disabled' : ''}>-</button>
                                <span>${gold.equippedPouches}</span>
                                <button data-action="adjust-equipped-pouches" data-change="1" ${gold.equippedPouches >= 2 || gold.equippedPouches >= gold.pouches ? 'disabled' : ''}>+</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gold-category">
                        <h4>Chest (${gold.chest}/1)</h4>
                        <div class="gold-circles">
                            ${this.renderGoldCircles('chest', gold.chest, 1)}
                        </div>
                    </div>
                    
                    <div class="gold-category">
                        <h4>Banks</h4>
                        <div class="banks-container">
                            ${gold.banks.map((bank, index) => `
                                <div class="bank-entry">
                                    <input type="text" value="${bank.location}" data-action="update-bank-location" data-index="${index}" placeholder="Bank location">
                                    <div class="bank-chests">
                                        <span>${bank.chests} Chests</span>
                                        <button data-action="adjust-bank-chests" data-index="${index}" data-change="-1" ${bank.chests === 0 ? 'disabled' : ''}>-</button>
                                        <button data-action="adjust-bank-chests" data-index="${index}" data-change="1">+</button>
                                        <button data-action="remove-bank" data-index="${index}" class="remove-btn">✕</button>
                                    </div>
                                </div>
                            `).join('')}
                            <button data-action="add-bank" class="add-bank-btn">+ Add Bank</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderGoldCircles(type, current, max) {
        let circles = '';
        for (let i = 0; i < max; i++) {
            const isActive = i < current;
            circles += `<div class="gold-circle ${isActive ? 'active' : ''}" data-action="set-gold-amount" data-type="${type}" data-amount="${i + 1}"></div>`;
        }
        return circles;
    }

    // ===== EVENT HANDLING =====
    attachEventListeners() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Navigation buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('equipment-nav-btn')) {
                const section = e.target.dataset.section;
                this.switchEquipmentSection(section);
            }
        });

        // Bag selection
        const bagSelect = container.querySelector('#bag-select');
        if (bagSelect) {
            bagSelect.addEventListener('change', (e) => {
                this.changeBagType(e.target.value);
            });
        }

        // Search and filters
        const searchInput = container.querySelector('#item-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.updateSearch(e.target.value);
            });
        }

        const categoryFilter = container.querySelector('#category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.updateCategoryFilter(e.target.value);
            });
        }

        // Action buttons (using event delegation)
        container.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            switch (action) {
                case 'add-item':
                    this.showAddItemModal();
                    break;
                case 'equip-item':
                    this.equipItem(e.target.dataset.type, e.target.dataset.category, parseInt(e.target.dataset.index));
                    break;
                case 'unequip-item':
                    this.unequipItem(e.target.dataset.type, e.target.dataset.category, parseInt(e.target.dataset.index));
                    break;
                case 'unequip-specific':
                    this.unequipSpecificItem(e.target.dataset.slot);
                    break;
                case 'unequip-jewelry':
                    this.unequipJewelry(parseInt(e.target.dataset.index));
                    break;
                case 'unequip-belt':
                    this.unequipBeltItem(parseInt(e.target.dataset.index));
                    break;
                case 'edit-item':
                    this.editItem(e.target.dataset.category, parseInt(e.target.dataset.index));
                    break;
                case 'drop-item':
                    this.dropItem(e.target.dataset.category, parseInt(e.target.dataset.index));
                    break;
                case 'sell-item':
                    this.sellItem(e.target.dataset.category, parseInt(e.target.dataset.index));
                    break;
                case 'set-gold-amount':
                    this.setGoldAmount(e.target.dataset.type, parseInt(e.target.dataset.amount));
                    break;
                case 'adjust-equipped-pouches':
                    this.adjustEquippedPouches(parseInt(e.target.dataset.change));
                    break;
                case 'add-bank':
                    this.addBank();
                    break;
                case 'remove-bank':
                    this.removeBank(parseInt(e.target.dataset.index));
                    break;
                case 'adjust-bank-chests':
                    this.adjustBankChests(parseInt(e.target.dataset.index), parseInt(e.target.dataset.change));
                    break;
            }
        });

        // Bank location updates
        container.addEventListener('change', (e) => {
            if (e.target.dataset.action === 'update-bank-location') {
                this.updateBankLocation(parseInt(e.target.dataset.index), e.target.value);
            }
        });
    }

    // ===== NAVIGATION =====
    switchEquipmentSection(section) {
        const container = document.getElementById(this.containerId);
        
        // Update nav buttons
        container.querySelectorAll('.equipment-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        container.querySelector(`[data-section="${section}"]`)?.classList.add('active');
        
        // Update content
        const contentDiv = container.querySelector('#equipment-content');
        switch(section) {
            case 'overview':
                contentDiv.innerHTML = this.renderOverviewContent();
                break;
            case 'inventory':
                contentDiv.innerHTML = this.renderInventorySection();
                break;
            case 'gold':
                contentDiv.innerHTML = this.renderGoldSection();
                break;
        }
    }

    // ===== ITEM MANAGEMENT =====
    isItemEquipped(item, type) {
        const equipped = this.data.equipped;
        
        // Check if item is equipped by comparing IDs
        if (type === 'weapon') {
            return (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) ||
                   (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id);
        } else if (type === 'armor') {
            return equipped.armor && equipped.armor.id === item.id;
        } else if (type === 'clothing') {
            return equipped.clothing && equipped.clothing.id === item.id;
        } else if (type === 'jewelry') {
            return equipped.jewelry.some(slot => slot && slot.id === item.id);
        } else {
            // For consumables, quest items, etc. - check belt slots
            return equipped.belt.some(slot => slot && slot.id === item.id);
        }
        
        return false;
    }

    equipItem(type, category, index) {
        const item = this.data.inventory[category][index];
        
        // Check if item is already equipped
        if (this.isItemEquipped(item, type)) {
            alert('This item is already equipped!');
            return;
        }
        
        if (type === 'weapon') {
            // Show weapon slot selection
            this.showWeaponSlotModal(item);
        } else if (type === 'jewelry') {
            // Find empty jewelry slot
            const emptySlot = this.data.equipped.jewelry.findIndex(slot => !slot);
            if (emptySlot !== -1) {
                this.data.equipped.jewelry[emptySlot] = item;
            } else {
                alert('All jewelry slots are full. Unequip an item first.');
                return;
            }
        } else if (type === 'armor') {
            // Check if armor slot is already occupied
            if (this.data.equipped.armor) {
                alert('You already have armor equipped. Unequip it first.');
                return;
            }
            this.data.equipped.armor = item;
        } else if (type === 'clothing') {
            // Check if clothing slot is already occupied
            if (this.data.equipped.clothing) {
                alert('You already have clothing equipped. Unequip it first.');
                return;
            }
            this.data.equipped.clothing = item;
        } else {
            // For all other items (consumables, quest items, etc.) - use belt slots
            const emptySlot = this.data.equipped.belt.findIndex(slot => !slot);
            if (emptySlot !== -1) {
                this.data.equipped.belt[emptySlot] = item;
            } else {
                alert('All belt slots are full. Unequip an item first.');
                return;
            }
        }
        
        this.saveData();
        this.updateEncumbranceDisplay();
        
        // Refresh current section
        const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
        if (activeSection) {
            this.switchEquipmentSection(activeSection);
        }
    }

    unequipItem(type, category, index) {
        const item = this.data.inventory[category][index];
        const equipped = this.data.equipped;
        
        // Remove item from equipped slots
        if (type === 'weapon') {
            if (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) {
                equipped.primaryWeapon = null;
            }
            if (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id) {
                equipped.secondaryWeapon = null;
            }
        } else if (type === 'armor') {
            equipped.armor = null;
        } else if (type === 'clothing') {
            equipped.clothing = null;
        } else if (type === 'jewelry') {
            const slotIndex = equipped.jewelry.findIndex(slot => slot && slot.id === item.id);
            if (slotIndex !== -1) {
                equipped.jewelry[slotIndex] = null;
            }
        } else {
            // For all other items (consumables, quest items, etc.) - check belt slots
            const slotIndex = equipped.belt.findIndex(slot => slot && slot.id === item.id);
            if (slotIndex !== -1) {
                equipped.belt[slotIndex] = null;
            }
        }
        
        this.saveData();
        this.updateEncumbranceDisplay();
        
        // Refresh current section
        const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
        if (activeSection) {
            this.switchEquipmentSection(activeSection);
        }
    }

    unequipSpecificItem(slot) {
        if (this.data.equipped[slot]) {
            this.data.equipped[slot] = null;
            this.saveData();
            this.updateEncumbranceDisplay();
            
            // Refresh overview
            const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
            if (activeSection === 'overview') {
                this.switchEquipmentSection('overview');
            }
        }
    }

    unequipJewelry(index) {
        if (this.data.equipped.jewelry[index]) {
            this.data.equipped.jewelry[index] = null;
            this.saveData();
            this.updateEncumbranceDisplay();
            
            // Refresh overview
            const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
            if (activeSection === 'overview') {
                this.switchEquipmentSection('overview');
            }
        }
    }

    unequipBeltItem(index) {
        if (this.data.equipped.belt[index]) {
            this.data.equipped.belt[index] = null;
            this.saveData();
            this.updateEncumbranceDisplay();
            
            // Refresh overview
            const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
            if (activeSection === 'overview') {
                this.switchEquipmentSection('overview');
            }
        }
    }

    showWeaponSlotModal(weapon) {
        const modal = this.createModal(`
            <div class="modal-header">
                <h3>Equip Weapon: ${weapon.name}</h3>
                <button type="button" class="modal-close-btn">×</button>
            </div>
            
            <div class="modal-content">
                <p>Choose weapon slot:</p>
            </div>
            
            <div class="modal-buttons">
                <button data-slot="primaryWeapon" class="button primary-btn">Primary Weapon</button>
                <button data-slot="secondaryWeapon" class="button primary-btn">Secondary Weapon</button>
                <button class="button cancel-btn">Cancel</button>
            </div>
        `);

        modal.addEventListener('click', (e) => {
            if (e.target.dataset.slot) {
                this.equipWeaponToSlot(e.target.dataset.slot, weapon);
                this.closeModal(modal);
            } else if (e.target.classList.contains('cancel-btn') || e.target.classList.contains('modal-close-btn')) {
                this.closeModal(modal);
            }
        });
    }

    equipWeaponToSlot(slot, weapon) {
        // Check if weapon is already equipped in any slot
        if (this.isItemEquipped(weapon, 'weapon')) {
            alert('This weapon is already equipped!');
            return;
        }
        
        // Check if slot is already occupied
        if (this.data.equipped[slot]) {
            alert(`You already have a ${slot.replace('Weapon', ' weapon')} equipped. Unequip it first.`);
            return;
        }
        
        this.data.equipped[slot] = weapon;
        this.saveData();
        this.updateEncumbranceDisplay();
        
        // Refresh current section
        const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
        if (activeSection) {
            this.switchEquipmentSection(activeSection);
        }
    }

    showAddItemModal(defaultType = 'weapon') {
        const modal = this.createModal(`
            <div class="modal-header">
                <h3>Add New Item</h3>
                <button type="button" class="modal-close-btn">×</button>
            </div>
            
            <div class="modal-content">
                <form id="add-item-form" class="character-form">
                    <div class="form-group">
                        <label for="item-type">Item Type:</label>
                        <select id="item-type" required>
                            ${this.itemTypes.map(type => 
                                `<option value="${type}" ${type === defaultType ? 'selected' : ''}>${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="item-name">Name:</label>
                        <input type="text" id="item-name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="item-description">Description (optional):</label>
                        <textarea id="item-description" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="item-features">Features (optional):</label>
                        <textarea id="item-features" rows="2"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="item-dice">Dice Roll (optional):</label>
                        <input type="text" id="item-dice" placeholder="e.g., 1d6, 2d8+3">
                    </div>
                    
                    <div class="form-group">
                        <label for="item-ability">Associated Ability (optional):</label>
                        <select id="item-ability">
                            <option value="">None</option>
                            ${this.abilities.map(ability => 
                                `<option value="${ability}">${ability}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="item-tags">Tags (optional):</label>
                        <div class="tags-selection">
                            ${this.additionalTags.map(tag => `
                                <label class="tag-checkbox">
                                    <input type="checkbox" value="${tag}"> ${tag}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="modal-buttons">
                        <button type="submit" class="button primary-btn">Add Item</button>
                        <button type="button" class="button cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `);

        const form = modal.querySelector('#add-item-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewItem(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('cancel-btn') || e.target.classList.contains('modal-close-btn')) {
                this.closeModal(modal);
            }
        });
    }

    addNewItem(modal) {
        const type = modal.querySelector('#item-type').value;
        const name = modal.querySelector('#item-name').value;
        const description = modal.querySelector('#item-description').value;
        const features = modal.querySelector('#item-features').value;
        const diceRoll = modal.querySelector('#item-dice').value;
        const ability = modal.querySelector('#item-ability').value;
        
        // Get selected tags
        const tagCheckboxes = modal.querySelectorAll('.tag-checkbox input:checked');
        const tags = Array.from(tagCheckboxes).map(cb => cb.value);
        
        const newItem = {
            name,
            type,
            description: description || null,
            features: features || null,
            diceRoll: diceRoll || null,
            ability: ability || null,
            tags: tags.length > 0 ? tags : null,
            id: Date.now() // Simple ID generation
        };
        
        // Add to appropriate category
        const category = this.getItemCategory(type);
        if (!this.data.inventory[category]) {
            this.data.inventory[category] = [];
        }
        this.data.inventory[category].push(newItem);
        this.saveData();
        
        // Refresh current section and update encumbrance
        const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
        if (activeSection) {
            this.switchEquipmentSection(activeSection);
        }
        
        this.updateEncumbranceDisplay();
        this.closeModal(modal);
    }

    editItem(category, index) {
        const item = this.data.inventory[category][index];
        
        const modal = this.createModal(`
            <div class="modal-header">
                <h3>Edit Item: ${item.name}</h3>
                <button type="button" class="modal-close-btn">×</button>
            </div>
            
            <div class="modal-content">
                <form id="edit-item-form" class="character-form">
                    <div class="form-group">
                        <label for="edit-item-name">Name:</label>
                        <input type="text" id="edit-item-name" value="${item.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-item-description">Description (optional):</label>
                        <textarea id="edit-item-description" rows="3">${item.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-item-features">Features (optional):</label>
                        <textarea id="edit-item-features" rows="2">${item.features || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-item-dice">Dice Roll (optional):</label>
                        <input type="text" id="edit-item-dice" value="${item.diceRoll || ''}" placeholder="e.g., 1d6, 2d8+3">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-item-ability">Associated Ability (optional):</label>
                        <select id="edit-item-ability">
                            <option value="">None</option>
                            ${this.abilities.map(ability => 
                                `<option value="${ability}" ${item.ability === ability ? 'selected' : ''}>${ability}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="modal-buttons">
                        <button type="submit" class="button primary-btn">Save Changes</button>
                        <button type="button" class="button cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `);

        const form = modal.querySelector('#edit-item-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Update item with new values
            item.name = modal.querySelector('#edit-item-name').value;
            item.description = modal.querySelector('#edit-item-description').value || null;
            item.features = modal.querySelector('#edit-item-features').value || null;
            item.diceRoll = modal.querySelector('#edit-item-dice').value || null;
            item.ability = modal.querySelector('#edit-item-ability').value || null;
            
            this.saveData();
            this.updateEncumbranceDisplay();
            
            // Refresh current section
            const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
            if (activeSection) {
                this.switchEquipmentSection(activeSection);
            }
            
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('cancel-btn') || e.target.classList.contains('modal-close-btn')) {
                this.closeModal(modal);
            }
        });
    }

    dropItem(category, index) {
        if (confirm('Are you sure you want to drop this item? It will be lost forever.')) {
            const item = this.data.inventory[category][index];
            
            // Auto-unequip the item if it's equipped
            this.autoUnequipItem(item);
            
            // Remove from inventory
            this.data.inventory[category].splice(index, 1);
            this.saveData();
            this.updateEncumbranceDisplay();
            
            // Refresh current section
            const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
            if (activeSection) {
                this.switchEquipmentSection(activeSection);
            }
        }
    }

    sellItem(category, index) {
        const item = this.data.inventory[category][index];
        const goldAmount = prompt(`How much gold did you sell "${item.name}" for?`, '1');
        
        if (goldAmount !== null && !isNaN(goldAmount) && parseInt(goldAmount) >= 0) {
            const gold = parseInt(goldAmount);
            
            // Auto-unequip the item if it's equipped
            this.autoUnequipItem(item);
            
            // Add gold to inventory
            let currentGold = this.data.gold.coins + gold;
            
            // Convert coins to pouches/chests as needed
            this.data.gold.coins = currentGold % 10;
            const extraPouches = Math.floor(currentGold / 10);
            
            let totalPouches = this.data.gold.pouches + extraPouches;
            this.data.gold.pouches = totalPouches % 10;
            const extraChests = Math.floor(totalPouches / 10);
            
            this.data.gold.chest = Math.min(1, this.data.gold.chest + extraChests);
            
            // Remove from inventory
            this.data.inventory[category].splice(index, 1);
            this.saveData();
            this.updateEncumbranceDisplay();
            
            // Refresh current section
            const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
            if (activeSection) {
                this.switchEquipmentSection(activeSection);
            }
            
            alert(`Sold "${item.name}" for ${gold} gold!`);
        }
    }

    autoUnequipItem(item) {
        const equipped = this.data.equipped;
        
        if (item.type === 'weapon') {
            if (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) {
                equipped.primaryWeapon = null;
            }
            if (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id) {
                equipped.secondaryWeapon = null;
            }
        } else if (item.type === 'armor') {
            equipped.armor = null;
        } else if (item.type === 'clothing') {
            equipped.clothing = null;
        } else if (item.type === 'jewelry') {
            const slotIndex = equipped.jewelry.findIndex(slot => slot && slot.id === item.id);
            if (slotIndex !== -1) {
                equipped.jewelry[slotIndex] = null;
            }
        } else {
            // For belt items
            const slotIndex = equipped.belt.findIndex(slot => slot && slot.id === item.id);
            if (slotIndex !== -1) {
                equipped.belt[slotIndex] = null;
            }
        }
    }

    // ===== SEARCH AND FILTERING =====
    updateSearch(searchTerm) {
        this.data.searchTerm = searchTerm;
        this.saveData();
        
        const inventoryContent = document.querySelector(`#${this.containerId} .inventory-content`);
        if (inventoryContent) {
            inventoryContent.innerHTML = this.renderInventoryCategories();
        }
    }

    updateCategoryFilter(category) {
        this.data.selectedCategory = category;
        this.saveData();
        
        const inventoryContent = document.querySelector(`#${this.containerId} .inventory-content`);
        if (inventoryContent) {
            inventoryContent.innerHTML = this.renderInventoryCategories();
        }
    }

    // ===== BAG MANAGEMENT =====
    changeBagType(bagName) {
        const oldBag = this.bagTypes[this.data.selectedBag];
        const newBag = this.bagTypes[bagName];
        
        // If new bag has fewer belt slots, unequip excess items
        if (newBag.consumableSlots < oldBag.consumableSlots) {
            for (let i = newBag.consumableSlots; i < this.data.equipped.belt.length; i++) {
                this.data.equipped.belt[i] = null;
            }
        }
        
        // Resize belt array to match new bag's consumable slots
        this.data.equipped.belt = Array(newBag.consumableSlots).fill(null);
        
        // Copy over existing items up to the new limit
        const currentBelt = this.data.equipped.belt.slice();
        for (let i = 0; i < Math.min(newBag.consumableSlots, currentBelt.length); i++) {
            this.data.equipped.belt[i] = currentBelt[i];
        }
        
        this.data.selectedBag = bagName;
        this.saveData();
        this.updateEncumbranceDisplay();
        
        // Update bag info display
        this.updateBagInfo();
        
        // Refresh overview
        const activeSection = document.querySelector(`#${this.containerId} .equipment-nav-btn.active`)?.dataset.section;
        if (activeSection) {
            this.switchEquipmentSection(activeSection);
        }
    }

    updateBagInfo() {
        const bagInfo = document.querySelector(`#${this.containerId} .bag-info`);
        if (bagInfo) {
            const selectedBag = this.bagTypes[this.data.selectedBag];
            bagInfo.innerHTML = `
                <span class="bag-capacity">Capacity: ${selectedBag.capacity} units</span>
                <span class="bag-consumables">Belt Slots: ${selectedBag.consumableSlots}</span>
                ${selectedBag.bonus ? `<span class="bag-bonus">${selectedBag.bonus}</span>` : ''}
            `;
        }
    }

    // ===== GOLD MANAGEMENT =====
    setGoldAmount(type, amount) {
        const currentAmount = this.data.gold[type];
        
        if (amount <= currentAmount) {
            // Decreasing
            this.data.gold[type] = amount - 1;
        } else {
            // Increasing
            this.data.gold[type] = amount;
            
            // Handle automatic conversions
            if (type === 'coins' && this.data.gold.coins === 10) {
                // Always try to auto-convert, but only if pouches can be filled
                if (this.data.gold.pouches < 10) {
                    this.data.gold.coins = 0;
                    this.data.gold.pouches = Math.min(this.data.gold.pouches + 1, 10);
                }
                // If pouches are full (10/10), allow 10th coin to stay filled
            }
            
            if (type === 'pouches' && this.data.gold.pouches === 10) {
                // Always try to auto-convert, but only if chest can be filled
                if (this.data.gold.chest < 1) {
                    this.data.gold.pouches = 0;
                    this.data.gold.chest = 1;
                }
                // If chest is full (1/1), allow 10th pouch to stay filled
            }
        }
        
        // Adjust equipped pouches if necessary
        if (this.data.gold.equippedPouches > this.data.gold.pouches) {
            this.data.gold.equippedPouches = this.data.gold.pouches;
        }
        
        this.saveData();
        this.switchEquipmentSection('gold'); // Refresh gold section
    }

    adjustEquippedPouches(change) {
        const newAmount = this.data.gold.equippedPouches + change;
        if (newAmount >= 0 && newAmount <= 2 && newAmount <= this.data.gold.pouches) {
            this.data.gold.equippedPouches = newAmount;
            this.saveData();
            this.switchEquipmentSection('gold');
        }
    }

    addBank() {
        this.data.gold.banks.push({
            location: '',
            chests: 0
        });
        this.saveData();
        this.switchEquipmentSection('gold');
    }

    removeBank(index) {
        this.data.gold.banks.splice(index, 1);
        this.saveData();
        this.switchEquipmentSection('gold');
    }

    updateBankLocation(index, location) {
        this.data.gold.banks[index].location = location;
        this.saveData();
    }

    adjustBankChests(index, change) {
        const newAmount = this.data.gold.banks[index].chests + change;
        if (newAmount >= 0) {
            this.data.gold.banks[index].chests = newAmount;
            this.saveData();
            this.switchEquipmentSection('gold');
        }
    }

    // ===== ENCUMBRANCE DISPLAY =====
    updateEncumbranceDisplay() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const encumbranceText = container.querySelector('.encumbrance-text');
        const encumbranceFill = container.querySelector('.encumbrance-fill');
        const encumbranceWarning = container.querySelector('.encumbrance-warning');
        
        if (encumbranceText && encumbranceFill) {
            const encumbrance = this.calculateEncumbrance();
            const maxCapacity = this.getMaxCapacity();
            const isOverEncumbered = this.isEncumbered();
            const hasItems = Object.values(this.data.inventory).some(categoryItems => categoryItems.length > 0);
            
            encumbranceText.textContent = `Encumbrance: ${encumbrance}/${maxCapacity} units`;
            encumbranceFill.style.width = `${Math.min((encumbrance / maxCapacity) * 100, 100)}%`;
            
            if (encumbranceWarning) {
                encumbranceWarning.style.display = (hasItems && isOverEncumbered) ? 'block' : 'none';
            }

            // Trigger callback
            this.options.onEncumbranceChanged({
                current: encumbrance,
                max: maxCapacity,
                isOverEncumbered: isOverEncumbered,
                hasItems: hasItems
            });
        }
    }

    // ===== UTILITY METHODS =====
    createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'equipment-modal-overlay';
        modal.innerHTML = `
            <div class="equipment-modal">
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        return modal;
    }

    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }

    saveData() {
        this.options.onDataChanged(this.data);
    }

    // ===== PUBLIC API =====
    
    /**
     * Get current equipment data
     */
    getData() {
        return { ...this.data };
    }

    /**
     * Set equipment data (replaces current data)
     */
    setData(newData) {
        this.data = { ...this.getDefaultData(), ...newData };
        this.render();
        this.updateEncumbranceDisplay();
    }

    /**
     * Update specific properties of equipment data
     */
    updateData(updates) {
        this.data = { ...this.data, ...updates };
        this.render();
        this.updateEncumbranceDisplay();
    }

    /**
     * Get equipped items
     */
    getEquippedItems() {
        return { ...this.data.equipped };
    }

    /**
     * Get inventory
     */
    getInventory() {
        return { ...this.data.inventory };
    }

    /**
     * Get encumbrance information
     */
    getEncumbranceInfo() {
        return {
            current: this.calculateEncumbrance(),
            max: this.getMaxCapacity(),
            isOverEncumbered: this.isEncumbered()
        };
    }

    /**
     * Destroy the equipment system
     */
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }

    // ===== STYLES =====
    setupStyles() {
        if (document.getElementById('equipment-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'equipment-system-styles';
        style.textContent = `
            /* Equipment System Styles */
            .equipment-container {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .equipment-header {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }

            .equipment-header h2 {
                margin: 0 0 15px 0;
                color: #343a40;
                font-size: 24px;
                font-weight: 600;
            }

            .encumbrance-warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
                font-weight: 500;
            }

            .encumbrance-display {
                margin-bottom: 15px;
            }

            .encumbrance-text {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #495057;
            }

            .encumbrance-bar {
                width: 100%;
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
            }

            .encumbrance-fill {
                height: 100%;
                background: linear-gradient(90deg, #28a745 0%, #ffc107 70%, #dc3545 90%);
                transition: width 0.3s ease;
            }

            .bag-selector {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 6px;
            }

            .bag-selector label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #495057;
            }

            .bag-selector select {
                width: 100%;
                max-width: 300px;
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                background: white;
                font-size: 14px;
            }

            .bag-info {
                margin-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }

            .bag-info span {
                background: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                border: 1px solid #dee2e6;
            }

            .bag-bonus {
                color: #28a745 !important;
                font-weight: 500;
            }

            .equipment-nav {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }

            .equipment-nav-btn {
                padding: 10px 20px;
                border: 1px solid #dee2e6;
                background: white;
                color: #495057;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .equipment-nav-btn:hover {
                background: #f8f9fa;
                border-color: #adb5bd;
            }

            .equipment-nav-btn.active {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }

            .overview-section {
                display: grid;
                gap: 30px;
            }

            .equipped-items-container h3 {
                margin: 0 0 20px 0;
                color: #343a40;
                font-size: 20px;
                font-weight: 600;
            }

            .equipped-grid {
                display: grid;
                gap: 25px;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }

            .equipment-category h4 {
                margin: 0 0 15px 0;
                color: #495057;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .equipment-slots {
                display: grid;
                gap: 10px;
            }

            .equipment-slot {
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                padding: 12px;
                transition: all 0.2s ease;
                min-height: 60px;
                display: flex;
                flex-direction: column;
            }

            .equipment-slot.filled {
                border-color: #28a745;
                background: #f8fff9;
            }

            .equipment-slot.empty {
                border-style: dashed;
                color: #6c757d;
            }

            .slot-label {
                font-size: 12px;
                font-weight: 500;
                color: #6c757d;
                margin-bottom: 5px;
            }

            .slot-content {
                flex: 1;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .equipped-item-name {
                font-weight: 500;
                color: #343a40;
            }

            .empty-slot {
                font-style: italic;
                color: #adb5bd;
            }

            .unequip-btn {
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease;
            }

            .unequip-btn:hover {
                background: #c82333;
            }

            .jewelry-slots, .belt-slots {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 8px;
            }

            .jewelry-slot, .belt-slot {
                min-height: 50px;
            }

            .gold-summary {
                background: #fff3e0;
                border: 1px solid #ffcc02;
                border-radius: 6px;
                padding: 20px;
            }

            .gold-summary h3 {
                margin: 0 0 15px 0;
                color: #e65100;
                font-size: 18px;
                font-weight: 600;
            }

            .gold-display {
                display: grid;
                gap: 10px;
            }

            .gold-amount {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 500;
            }

            .gold-icon {
                font-size: 20px;
            }

            .inventory-section {
                display: grid;
                gap: 20px;
            }

            .inventory-header {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 6px;
            }

            .search-controls {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            }

            .search-controls input, .search-controls select {
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
            }

            .add-item-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s ease;
            }

            .add-item-btn:hover {
                background: #218838;
            }

            .inventory-category {
                margin-bottom: 25px;
            }

            .inventory-category h4 {
                margin: 0 0 15px 0;
                color: #343a40;
                font-size: 16px;
                font-weight: 600;
                padding-bottom: 8px;
                border-bottom: 1px solid #dee2e6;
            }

            .items-grid {
                display: grid;
                gap: 15px;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            }

            .item-card {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 15px;
                transition: all 0.2s ease;
            }

            .item-card:hover {
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-color: #adb5bd;
            }

            .item-card.equipped {
                border-color: #28a745;
                background: #f8fff9;
            }

            .item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }

            .item-name {
                margin: 0;
                color: #343a40;
                font-size: 14px;
                font-weight: 600;
                flex: 1;
            }

            .item-weight {
                background: #e9ecef;
                color: #495057;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: 500;
                margin-left: 8px;
            }

            .equipped-indicator {
                color: #28a745;
                font-weight: 600;
                margin-left: 8px;
                font-size: 12px;
            }

            .item-type {
                color: #6c757d;
                font-size: 12px;
                margin-bottom: 8px;
                text-transform: capitalize;
            }

            .item-description {
                color: #495057;
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 8px;
            }

            .item-tags {
                margin-bottom: 10px;
            }

            .tag {
                background: #e9ecef;
                color: #495057;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                margin-right: 4px;
                display: inline-block;
            }

            .item-actions {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
            }

            .item-actions button {
                padding: 4px 8px;
                border: 1px solid #ced4da;
                border-radius: 3px;
                background: white;
                color: #495057;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
            }

            .equip-btn {
                background: #007bff !important;
                color: white !important;
                border-color: #007bff !important;
            }

            .equip-btn:hover {
                background: #0056b3 !important;
            }

            .equip-btn.unequip {
                background: #6c757d !important;
                border-color: #6c757d !important;
            }

            .edit-btn:hover {
                background: #e2e6ea;
            }

            .drop-btn:hover {
                background: #f5c6cb;
                border-color: #f5c6cb;
                color: #721c24;
            }

            .sell-btn:hover {
                background: #d1ecf1;
                border-color: #b8daff;
                color: #0c5460;
            }

            .gold-section {
                display: grid;
                gap: 20px;
            }

            .gold-tracker {
                display: grid;
                gap: 25px;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }

            .gold-category {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 20px;
            }

            .gold-category h4 {
                margin: 0 0 15px 0;
                color: #343a40;
                font-size: 16px;
                font-weight: 600;
            }

            .gold-circles {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 15px;
            }

            .gold-circle {
                width: 30px;
                height: 30px;
                border: 2px solid #dee2e6;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
                background: white;
            }

            .gold-circle:hover {
                border-color: #adb5bd;
            }

            .gold-circle.active {
                background: #ffc107;
                border-color: #ffc107;
            }

            .equipped-pouches {
                padding-top: 15px;
                border-top: 1px solid #e9ecef;
            }

            .equipped-pouches label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #495057;
            }

            .equipped-pouch-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .equipped-pouch-controls button {
                width: 30px;
                height: 30px;
                border: 1px solid #ced4da;
                background: white;
                color: #495057;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .equipped-pouch-controls button:hover:not(:disabled) {
                background: #e2e6ea;
            }

            .equipped-pouch-controls button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .banks-container {
                display: grid;
                gap: 10px;
            }

            .bank-entry {
                display: flex;
                gap: 10px;
                align-items: center;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
            }

            .bank-entry input {
                flex: 1;
                padding: 6px 10px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 13px;
            }

            .bank-chests {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
            }

            .bank-chests button {
                width: 24px;
                height: 24px;
                border: 1px solid #ced4da;
                background: white;
                color: #495057;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .remove-btn {
                background: #dc3545 !important;
                color: white !important;
                border-color: #dc3545 !important;
            }

            .remove-btn:hover {
                background: #c82333 !important;
            }

            .add-bank-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: background 0.2s ease;
            }

            .add-bank-btn:hover {
                background: #218838;
            }

            .no-items {
                text-align: center;
                color: #6c757d;
                font-style: italic;
                padding: 40px;
                background: #f8f9fa;
                border-radius: 6px;
                border: 1px dashed #dee2e6;
            }

            /* Modal Styles */
            .equipment-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .equipment-modal {
                background: white;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }

            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                margin: 0;
                color: #343a40;
                font-size: 18px;
                font-weight: 600;
            }

            .modal-close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #6c757d;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .modal-close-btn:hover {
                background: #f8f9fa;
                color: #343a40;
            }

            .modal-content {
                padding: 20px;
            }

            .modal-buttons {
                padding: 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            .character-form {
                display: grid;
                gap: 15px;
            }

            .form-group {
                display: grid;
                gap: 5px;
            }

            .form-group label {
                font-weight: 500;
                color: #495057;
                font-size: 14px;
            }

            .form-group input, .form-group select, .form-group textarea {
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
            }

            .form-group textarea {
                resize: vertical;
            }

            .tags-selection {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
            }

            .tag-checkbox {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                cursor: pointer;
            }

            .tag-checkbox input {
                margin: 0;
            }

            .button {
                padding: 8px 16px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                background: white;
                color: #495057;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .button:hover {
                background: #e2e6ea;
            }

            .primary-btn {
                background: #007bff !important;
                color: white !important;
                border-color: #007bff !important;
            }

            .primary-btn:hover {
                background: #0056b3 !important;
            }

            .cancel-btn:hover {
                background: #f8f9fa;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .equipment-container {
                    padding: 15px;
                }

                .equipped-grid {
                    grid-template-columns: 1fr;
                }

                .search-controls {
                    flex-direction: column;
                    align-items: stretch;
                }

                .search-controls input, .search-controls select {
                    width: 100%;
                }

                .equipment-nav {
                    flex-wrap: wrap;
                }

                .equipment-nav-btn {
                    flex: 1;
                    min-width: 100px;
                }

                .items-grid {
                    grid-template-columns: 1fr;
                }

                .gold-tracker {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Global function for backward compatibility
function initStandaloneEquipmentSystem(containerId, options = {}) {
    return new EquipmentSystem(containerId, options);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentSystem;
}

// Global assignment for direct script inclusion
if (typeof window !== 'undefined') {
    window.EquipmentSystem = EquipmentSystem;
    window.initStandaloneEquipmentSystem = initStandaloneEquipmentSystem;
}
EOF
)
