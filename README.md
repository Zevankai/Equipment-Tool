# Equipment Manager - Owlbear Rodeo Extension

A comprehensive equipment and inventory management system for RPG characters, designed as an extension for Owlbear Rodeo.

## Features

- **Complete Equipment Management**: Manage weapons, armor, clothing, jewelry, and consumables
- **Equipment Slots**: Visual equipment slots for primary/secondary weapons, armor, jewelry (3 slots), and belt items
- **Inventory Categories**: Organized inventory with categories (Gear, Utility, Quest, Crafting, Personal)
- **Encumbrance System**: Automatic weight calculation with visual progress bars and warnings
- **Gold/Currency Tracking**: Comprehensive currency system with coins, pouches, chests, and bank storage
- **Bag Management**: Different backpack types with varying capacities and bonuses
- **Character Support**: Manage equipment for multiple characters in the same room
- **Search & Filtering**: Real-time search across item names, descriptions, and features
- **Dark Theme**: Fully integrated with Owlbear Rodeo's dark interface
- **Data Persistence**: Equipment data is saved to the room metadata for persistence

## Installation

### Method 1: Install from Extension Store (Recommended)
1. In Owlbear Rodeo, go to Extensions
2. Search for "Equipment Manager"
3. Click Install

### Method 2: Install from URL
1. Host the extension files on a web server (GitHub Pages, Vercel, Netlify, etc.)
2. In Owlbear Rodeo, go to Extensions
3. Click "Add Extension"
4. Enter the URL to your `manifest.json` file
5. Click Add

### Method 3: Local Development
1. Clone this repository
2. Run a local server: `python3 -m http.server 8080` or `npm run dev`
3. In Owlbear Rodeo, add extension with URL: `http://localhost:8080/manifest.json`

## Usage

1. **Join a Room**: The extension requires you to be in an Owlbear Rodeo room
2. **Select Character**: Choose an existing character or create a new one
3. **Manage Equipment**: 
   - Use the Overview tab to see equipped items and current encumbrance
   - Use the Inventory tab to manage items by category
   - Use the Gold Tracker tab to manage currency and banking
4. **Add Items**: Click "Add Item" to create new equipment with custom properties
5. **Equip Items**: Drag items to equipment slots or use the equip button
6. **Track Weight**: Monitor encumbrance with the visual progress bar

## Equipment System Features

### Equipment Slots
- **Primary Weapon**: Main hand weapon
- **Secondary Weapon**: Off-hand weapon or shield
- **Armor**: Head/torso protection
- **Clothing**: Base clothing layer
- **Jewelry**: 3 slots for rings, amulets, etc.
- **Belt**: 3-12 slots for consumables (varies by bag type)

### Bag Types
| Bag Type | Capacity | Belt Slots | Bonus |
|----------|----------|------------|-------|
| Standard Backpack | 30 units | 3 | None |
| Adventurer's Backpack | 45 units | 2 | None |
| Warrior's Backpack | 26 units | 6 | +1 to Finesse rolls in combat |
| Arcane Satchel | 22 units | 8 | +1 to Instinct rolls outside combat |
| Tinker's Pack | 20 units | 12 | +2 to Finesse rolls when crafting |

### Currency System
- **Coins**: 0-10 (auto-converts to pouches)
- **Pouches**: 0-10 (auto-converts to chest)
- **Chest**: 0-1 (personal storage)
- **Equipped Pouches**: 0-2 (carried on person)
- **Banks**: Unlimited remote storage locations

## Technical Details

### Data Storage
- Character data is stored in Owlbear Rodeo room metadata
- Each character's equipment is saved separately
- Data persists across sessions within the same room

### Permissions
- The extension requires read/write access to room metadata
- No external network requests (except for the Owlbear Rodeo SDK)

### Browser Compatibility
- Works in all modern browsers supported by Owlbear Rodeo
- Responsive design works on desktop and mobile devices

## Development

### File Structure
```
/
├── index.html                     # Main extension HTML
├── manifest.json                  # Extension manifest
├── standalone-equipment-system.js # Core equipment system
├── icon.svg                      # Extension icon
├── package.json                  # Node.js package info
└── README.md                     # This file
```

### Local Development
1. Clone the repository
2. Run `npm run dev` or `python3 -m http.server 8080`
3. Access at `http://localhost:8080`
4. Add to Owlbear Rodeo with manifest URL: `http://localhost:8080/manifest.json`

### Customization
The equipment system is highly customizable. You can modify:
- Item categories and types
- Bag types and capacities  
- Currency conversion rates
- UI styling and themes
- Equipment slot configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Owlbear Rodeo
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Contact via Owlbear Rodeo Discord

---

**Perfect for**: D&D campaigns, Pathfinder games, and any RPG requiring detailed equipment tracking in Owlbear Rodeo.