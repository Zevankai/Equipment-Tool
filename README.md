(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/README-standalone-equipment-system.md b/README-standalone-equipment-system.md
--- a/README-standalone-equipment-system.md
+++ b/README-standalone-equipment-system.md
@@ -0,0 +1,275 @@
+# Standalone Equipment System
+
+A complete, independent equipment management system for RPG/character management applications.
+
+## 📋 Features
+
+- **Complete Item Management**: Add, edit, delete, equip/unequip items with full categorization
+- **Equipment Slots**: Primary/secondary weapons, armor, clothing, jewelry (3 slots), belt items (configurable)
+- **Encumbrance System**: Automatic weight calculation with visual indicators and warnings
+- **Gold/Currency Tracking**: Coins, pouches, chests with automatic conversions and bank storage
+- **Bag Management**: Different backpack types with varying capacities and bonuses
+- **Search & Filtering**: Real-time search across item names, descriptions, and features
+- **Responsive UI**: Modern, clean interface that works on desktop and mobile
+- **Modal Dialogs**: User-friendly forms for adding and editing items
+- **Export/Import**: Full data export capabilities for external integration
+
+## 🚀 Quick Start
+
+### Method 1: Direct HTML Include
+
+```html
+<!DOCTYPE html>
+<html>
+<head>
+    <title>My RPG App</title>
+</head>
+<body>
+    <div id="equipment-container"></div>
+    
+    <script src="standalone-equipment-system.js"></script>
+    <script>
+        const equipmentSystem = new EquipmentSystem('equipment-container');
+    </script>
+</body>
+</html>
+```
+
+### Method 2: With Options and Callbacks
+
+```javascript
+const equipmentSystem = new EquipmentSystem('equipment-container', {
+    // Callbacks for external integration
+    onDataChanged: (data) => {
+        console.log('Equipment updated:', data);
+        // Save to your backend/localStorage/etc
+    },
+    onEncumbranceChanged: (info) => {
+        if (info.isOverEncumbered) {
+            showWarning('Character is over-encumbered!');
+        }
+    },
+    onEquipmentChanged: (equipped) => {
+        updateCharacterStats(equipped);
+    },
+    
+    // UI options
+    enableEncumbranceWarning: true,
+    enableGoldTracking: true,
+    enableBagSelection: true,
+    
+    // Load existing data
+    initialData: existingEquipmentData
+});
+```
+
+## 📊 Data Structure
+
+The system uses a comprehensive data structure:
+
+```javascript
+{
+    equipped: {
+        primaryWeapon: null,      // Weapon object or null
+        secondaryWeapon: null,    // Weapon object or null
+        armor: null,              // Armor object or null
+        clothing: null,           // Clothing object or null
+        jewelry: [null, null, null], // Array of 3 jewelry slots
+        belt: [null, null, null, null, null] // Belt items (size varies by bag)
+    },
+    inventory: {
+        'Gear': [],      // Weapons, armor, potions, flasks, ammunition
+        'Utility': [],   // Adventure gear, tools, food, maps, camping
+        'Quest': [],     // NPC items, evidence, literature, magical items
+        'Crafting': [],  // Materials, components
+        'Personal': []   // Personal items (manual categorization)
+    },
+    gold: {
+        coins: 0,            // 0-10 coins
+        pouches: 0,          // 0-10 pouches (10 coins = 1 pouch)
+        chest: 0,            // 0-1 chest (10 pouches = 1 chest)
+        equippedPouches: 0,  // 0-2 pouches equipped on person
+        banks: []            // Array of {location: string, chests: number}
+    },
+    selectedBag: 'Standard Backpack', // Current bag type
+    searchTerm: '',                   // Current search filter
+    selectedCategory: 'All'           // Current category filter
+}
+```
+
+## 🎲 Item Structure
+
+Each item follows this structure:
+
+```javascript
+{
+    id: 12345,                    // Unique identifier
+    name: "Steel Longsword",      // Item name
+    type: "weapon",               // Item type (determines category)
+    description: "A well-balanced sword...", // Optional description
+    features: "Sharp edge, durable",         // Optional features
+    diceRoll: "1d8+2",           // Optional dice notation
+    ability: "Strength",         // Optional associated ability
+    tags: ["Rare", "Tradable"]  // Optional tags array
+}
+```
+
+## 🎒 Bag Types
+
+The system includes 5 predefined bag types:
+
+| Bag Type | Capacity | Belt Slots | Bonus |
+|----------|----------|------------|-------|
+| Standard Backpack | 30 units | 3 | None |
+| Adventurer's Backpack | 45 units | 2 | None |
+| Warrior's Backpack | 26 units | 6 | +1 to Finesse rolls in combat |
+| Arcane Satchel | 22 units | 8 | +1 to Instinct rolls outside combat |
+| Tinker's Pack | 20 units | 12 | +2 to Finesse rolls when crafting |
+
+## ⚖️ Encumbrance System
+
+- Each item type has a predefined weight (1-10 units)
+- Only **unequipped** items count toward encumbrance
+- Visual progress bar shows current vs. maximum capacity
+- Warning displays when over-encumbered
+- Callback triggered for external penalty systems
+
+## 🪙 Gold System
+
+- **Coins**: 0-10 (auto-converts to pouches at 10)
+- **Pouches**: 0-10 (auto-converts to chest at 10)  
+- **Chest**: 0-1 (personal storage)
+- **Equipped Pouches**: 0-2 (carried on person)
+- **Banks**: Unlimited remote storage locations
+
+## 🔧 API Methods
+
+### Core Methods
+```javascript
+// Get/set all data
+const data = equipmentSystem.getData();
+equipmentSystem.setData(newData);
+equipmentSystem.updateData(partialUpdate);
+
+// Get specific data
+const equipped = equipmentSystem.getEquippedItems();
+const inventory = equipmentSystem.getInventory();
+const encumbrance = equipmentSystem.getEncumbranceInfo();
+
+// Cleanup
+equipmentSystem.destroy();
+```
+
+### Encumbrance Info
+```javascript
+const info = equipmentSystem.getEncumbranceInfo();
+// Returns: { current: 15, max: 30, isOverEncumbered: false }
+```
+
+## 🎨 Customization
+
+The system includes complete CSS styling that can be customized:
+
+```css
+/* Override default colors */
+.equipment-container {
+    --primary-color: #your-color;
+    --accent-color: #your-accent;
+}
+
+/* Customize specific elements */
+.equipment-nav-btn.active {
+    background: your-active-color;
+}
+```
+
+## 📱 Responsive Design
+
+The system is fully responsive and includes:
+- Mobile-optimized layouts
+- Touch-friendly controls
+- Flexible grid systems
+- Adaptive modal dialogs
+
+## 🔗 Integration Examples
+
+### Save to LocalStorage
+```javascript
+const equipmentSystem = new EquipmentSystem('container', {
+    onDataChanged: (data) => {
+        localStorage.setItem('equipment', JSON.stringify(data));
+    },
+    initialData: JSON.parse(localStorage.getItem('equipment') || '{}')
+});
+```
+
+### Backend Integration
+```javascript
+const equipmentSystem = new EquipmentSystem('container', {
+    onDataChanged: async (data) => {
+        await fetch('/api/characters/123/equipment', {
+            method: 'PUT',
+            headers: { 'Content-Type': 'application/json' },
+            body: JSON.stringify(data)
+        });
+    }
+});
+```
+
+### Character Sheet Integration
+```javascript
+const equipmentSystem = new EquipmentSystem('container', {
+    onEquipmentChanged: (equipped) => {
+        // Update character stats based on equipped items
+        updateAttackBonus(equipped.primaryWeapon);
+        updateDefenseBonus(equipped.armor);
+        updateMovementSpeed(equipped.clothing);
+    },
+    onEncumbranceChanged: (info) => {
+        // Apply encumbrance penalties
+        if (info.isOverEncumbered) {
+            applyPenalty('strength', -2);
+            applyPenalty('agility', -2);
+        } else {
+            removePenalty('strength');
+            removePenalty('agility');
+        }
+    }
+});
+```
+
+## 🧪 Testing
+
+A complete demo is included in `equipment-system-demo.html`. Features:
+- Sample data loading
+- Random item generation
+- Data export functionality
+- Live testing of all features
+- Console logging for debugging
+
+To test:
+1. Open `equipment-system-demo.html` in a browser
+2. Click "Load Sample Data" to see the system in action
+3. Explore all tabs: Overview, Inventory, Gold Tracker
+4. Try adding, editing, equipping, and selling items
+5. Test encumbrance by adding many items
+6. Experiment with different bag types
+
+## 📄 License
+
+MIT License - Use freely in your projects!
+
+## 🤝 Contributing
+
+This is a standalone system designed to be copied and modified for your specific needs. Feel free to:
+- Add new item types
+- Modify the bag system
+- Extend the gold/currency system
+- Add new UI features
+- Integrate with your existing systems
+
+The code is well-commented and modular for easy customization.
+
+---
+
+**Perfect for**: RPG character sheets, inventory management systems, game development, tabletop gaming tools, and any application requiring equipment tracking.
EOF
)
