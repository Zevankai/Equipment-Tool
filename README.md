# Equipment Manager - Owlbear Rodeo Extension

A comprehensive equipment and inventory management system for RPG characters, designed as an extension for Owlbear Rodeo. Features both local storage and cloud synchronization via Vercel and Neon PostgreSQL.

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
- **Hybrid Data Storage**: Local storage for immediate response + cloud sync for cross-device access
- **Backend Integration**: Optional Vercel + Neon PostgreSQL for enhanced persistence and sharing
- **Automatic Sync**: Seamless synchronization between local and remote data with conflict resolution

## Installation

### Method 1: Production Deployment (Recommended)
1. Deploy to Vercel with Neon database backend
2. See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions
3. In Owlbear Rodeo, add extension with your Vercel URL: `https://your-project.vercel.app/manifest.json`

### Method 2: Quick Deploy (Local Storage Only)
1. Fork this repository and enable GitHub Pages
2. In Owlbear Rodeo, add extension: `https://yourusername.github.io/owlbear-equipment-manager/manifest.json`
3. Extension will work with local storage only (no cross-device sync)

### Method 3: Local Development
1. Clone this repository
2. Install dependencies: `npm install`
3. Copy environment config: `cp .env.example .env.local`
4. Run local server: `npm run dev` or `vercel dev` (for backend testing)
5. In Owlbear Rodeo, add extension: `http://localhost:8080/manifest.json`

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
- **Hybrid Approach**: Local storage (Owlbear Rodeo metadata) + Backend database (Neon PostgreSQL)
- **Local First**: Immediate responsiveness with local storage
- **Cloud Sync**: Cross-device synchronization via Vercel API
- **Automatic Fallback**: Works offline, syncs when connection is restored
- **Conflict Resolution**: Handles simultaneous edits across devices

### Permissions
- The extension requires read/write access to room metadata
- Optional backend API requests for cloud synchronization
- All data scoped to individual room IDs for privacy

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