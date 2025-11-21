# THE LAST VOYAGE - Game Design Document

## 🚀 Executive Summary

**Genre**: Narrative-Driven Space Opera with Ship Management
**Platform**: Web Browser (GitHub Pages)
**Target**: Single-player with save system
**Core Loop**: Explore → Encounter → Decide → Manage → Progress

---

## 🎯 Game Overview

### High Concept
Lead humanity's last generation ship through deep space, making critical decisions that affect thousands of lives while searching for a new home among the stars. Every choice matters, every resource counts, and every alien encounter could be humanity's salvation or doom.

### Core Pillars
1. **Meaningful Choices** - Every decision has visible consequences
2. **Resource Management** - Balance food, fuel, morale, and population
3. **Narrative Depth** - Rich, branching storylines with multiple endings
4. **Exploration** - Discover star systems, anomalies, and alien civilizations
5. **Crew Relationships** - Named characters with their own stories and agendas

---

## 💻 Technical Stack

### Core Technologies
```
Frontend Framework: Vanilla JS + HTML5 Canvas / Phaser 3
Rendering: Phaser 3 (2D game framework with excellent documentation)
State Management: Custom state machine
Data Storage: localStorage for save games
Deployment: GitHub Pages (static hosting)
Build Tool: Vite (fast, modern, works perfectly with GitHub Pages)
```

### Why This Stack?
- ✅ **Phaser 3**: Battle-tested game framework, perfect for 2D games
- ✅ **Vite**: Lightning-fast development, simple build process
- ✅ **No Backend Required**: Everything runs client-side
- ✅ **GitHub Pages**: Free hosting, automatic deployment via GitHub Actions
- ✅ **localStorage**: Persistent saves without server

### Alternative Stack Options
```
Option 2: Three.js (3D space visuals)
Option 3: PixiJS (lighter weight 2D)
Option 4: Pure Canvas API (maximum control, more work)
```

**Recommendation**: Start with Phaser 3 for rapid development

---

## 🎮 Core Game Systems

### 1. Ship Management System

#### Resources to Track
```javascript
{
  fuel: 100,        // Travel between systems
  food: 100,        // Crew survival
  materials: 100,   // Repairs and construction
  population: 1000, // Colonists aboard
  morale: 75,       // Affects events and efficiency
  technology: 0     // Unlock new capabilities
}
```

#### Ship Modules
- **Life Support** - Affects food consumption rate
- **Engines** - Determines fuel efficiency
- **Sensors** - Reveals more about systems before visiting
- **Medical Bay** - Reduces population loss from disasters
- **Research Lab** - Generates technology points
- **Hydroponics** - Generates food over time
- **Mining Bay** - Extracts resources from asteroids

Each module can be:
- Upgraded (3 levels)
- Damaged (requires materials to repair)
- Modified (different specializations)

---

### 2. Navigation & Exploration System

#### Galaxy Map
```
Visual Representation:
- Top-down 2D star map with clickable systems
- Fog of war (unexplored areas)
- Fuel range indicator (how far you can travel)
- Highlighted points of interest

Generation:
- Procedural generation with seeded RNG
- ~30-50 star systems per playthrough
- Mix of empty space, resource nodes, planets, anomalies
```

#### Star System Types
1. **Barren Systems** - Quick resource stops, low risk
2. **Inhabited Systems** - Alien encounters, trade, diplomacy
3. **Anomalies** - High risk/reward events
4. **Resource Rich** - Great for gathering materials
5. **Ancient Ruins** - Technology discoveries
6. **Hostile Territory** - Dangerous but valuable

#### Travel Mechanics
- Fuel cost based on distance
- Random events during travel (encounters, breakdowns)
- Time passage (affects food consumption)
- Crew morale changes during long voyages

---

### 3. Event & Narrative System

#### Event Structure
```javascript
{
  id: "event_derelict_ship",
  title: "Derelict Vessel Detected",
  description: "Sensors detect a massive ship drifting in space...",
  image: "assets/events/derelict.jpg",

  choices: [
    {
      text: "Send a salvage team",
      requirements: { population: ">10" },
      outcomes: [
        { chance: 0.6, result: "gain_materials", value: 50 },
        { chance: 0.3, result: "gain_tech", value: 10 },
        { chance: 0.1, result: "lose_crew", value: 5 }
      ]
    },
    {
      text: "Scan and move on",
      outcomes: [{ chance: 1.0, result: "gain_intel", value: 1 }]
    },
    {
      text: "Ignore it",
      outcomes: [{ chance: 1.0, result: "none" }]
    }
  ],

  flags: ["first_derelict"], // Story flags for branching
  unlocks: ["event_derelict_followup"]
}
```

#### Event Categories
- **Story Events** - Main narrative progression
- **Random Encounters** - Space pirates, distress signals, traders
- **Crew Drama** - Internal conflicts, romances, mutiny attempts
- **Disasters** - System failures, disease outbreaks, attacks
- **Discoveries** - New technologies, habitable planets, alien artifacts
- **Moral Dilemmas** - No clear right answer, lasting consequences

#### Branching Narrative
```
Story Flags System:
- Track player choices via boolean flags
- Conditions check flags to unlock/block events
- Multiple story arcs that interweave
- 5+ possible endings based on accumulated choices
```

---

### 4. Character & Crew System

#### Key Characters (Named NPCs)
```javascript
Example Characters:
1. Captain Elena Vasquez (Player Character / Viewpoint)
2. Dr. James Chen (Chief Medical Officer) - Pragmatic, utilitarian
3. Commander Sarah Mitchell (Military) - Security-focused, cautious
4. Engineer Marcus Rodriguez (Chief Engineer) - Optimistic, risk-taker
5. Xenobiologist Dr. Amara Okafor - Curious, diplomatic
6. Council Representative David Park - Political, represents colonists
```

#### Character Attributes
- **Opinion of Player** - (-100 to +100)
- **Personality Traits** - Affects dialogue and event reactions
- **Special Abilities** - Unique bonuses during certain events
- **Personal Quests** - Optional story arcs for each character

#### Crew Morale Factors
```
Increases Morale:
+ Successful missions
+ Finding resources
+ Positive alien encounters
+ Crew events (celebrations)

Decreases Morale:
- Starvation or rationing
- Population deaths
- Failed missions
- Long periods without progress
- Harsh player decisions
```

---

### 5. Combat System (Optional - Can be Simplified)

#### Ship-to-Ship Combat
```
Turn-based tactical combat:
- Choose actions: Attack, Defend, Evade, Hail, Flee
- Rock-paper-scissors style counters
- Resource cost (fuel for maneuvers, materials for repairs)
- Crew casualties possible
- Can be avoided through diplomacy or fleeing
```

**Alternative**: Narrative combat (choose-your-own-adventure style)
- Simpler to implement
- Focuses on decision-making over mechanics
- Still has consequences (resource loss, crew deaths)

**Recommendation**: Start with narrative combat, add tactical later if time permits

---

### 6. Diplomacy & Alien Races

#### Alien Factions (3-5 Major Races)
```javascript
Example Races:

1. The Collective (Hive Mind)
   - Value: Unity and efficiency
   - Trade: Technology for biological samples
   - Threat: Assimilation

2. The Wanderers (Nomadic Traders)
   - Value: Commerce and freedom
   - Trade: Resources for information
   - Threat: None if friendly, pirates if hostile

3. The Architects (Ancient AI)
   - Value: Knowledge and preservation
   - Trade: Technology for historical data
   - Threat: Will delete "corrupted" data (you)

4. The Dominion (Militaristic Empire)
   - Value: Strength and territory
   - Trade: Protection for service
   - Threat: Conquest or vassalization
```

#### Reputation System
- Each race has opinion of humanity (-100 to +100)
- Affected by choices during encounters
- Opens/closes dialogue options
- Determines available endings

---

## 🎨 Art & Asset Requirements

### Visual Style
**Recommendation**: Pixel Art or Vector Art
- Easier to create and iterate
- Performs well in browsers
- Timeless aesthetic
- Can be created by small team/solo dev

### Required Assets

#### UI Elements
- Main menu screen
- Star map interface
- Ship status dashboard
- Event/dialogue boxes
- Resource indicators
- Character portraits (6-8 characters)
- Button states (normal, hover, pressed)

#### Backgrounds
- Star map background (animated twinkling stars)
- Event scene backgrounds (15-20 unique scenes)
  - Ship interior
  - Planet surfaces
  - Space stations
  - Alien environments
  - Anomaly visuals

#### Sprites & Icons
- Ship sprite (player's generation ship)
- Alien ship sprites (5-8 varieties)
- Star system icons (planets, asteroids, stations)
- Resource icons (fuel, food, materials, etc.)
- Module icons (for ship upgrades)

#### Audio (Optional for MVP)
- Background music (ambient space themes)
- UI sound effects
- Event stingers (dramatic moments)
- Ambient space sounds

### Asset Creation Strategy
```
Phase 1: Placeholder art (colored rectangles, basic shapes)
Phase 2: Basic pixel art or vector graphics
Phase 3: Polished assets with animations
Phase 4: Sound and music integration
```

---

## 🏗️ Project Structure

```
theholeofrabbit/
├── index.html                 # Entry point
├── package.json              # Dependencies
├── vite.config.js            # Build configuration
├── .github/
│   └── workflows/
│       └── deploy.yml        # Auto-deploy to GitHub Pages
├── src/
│   ├── main.js               # Game initialization
│   ├── config.js             # Game constants
│   ├── scenes/
│   │   ├── BootScene.js      # Asset loading
│   │   ├── MenuScene.js      # Main menu
│   │   ├── MapScene.js       # Galaxy map
│   │   ├── EventScene.js     # Event dialogue
│   │   ├── ShipScene.js      # Ship management
│   │   └── EndingScene.js    # Game endings
│   ├── systems/
│   │   ├── ResourceManager.js
│   │   ├── EventSystem.js
│   │   ├── SaveSystem.js
│   │   ├── DialogueSystem.js
│   │   └── NavigationSystem.js
│   ├── data/
│   │   ├── events.json       # All game events
│   │   ├── characters.json   # Character data
│   │   ├── starSystems.json  # System generation data
│   │   └── dialogue.json     # Dialogue trees
│   ├── ui/
│   │   ├── components/       # Reusable UI components
│   │   └── styles.css        # UI styling
│   └── utils/
│       ├── random.js         # Seeded RNG
│       ├── helpers.js        # Utility functions
│       └── constants.js      # Game constants
├── assets/
│   ├── images/
│   │   ├── ui/
│   │   ├── backgrounds/
│   │   ├── characters/
│   │   └── ships/
│   ├── audio/
│   │   ├── music/
│   │   └── sfx/
│   └── fonts/
├── docs/                     # GitHub Pages will serve from here
└── README.md
```

---

## 🚢 GitHub Pages Deployment Strategy

### Setup Process

#### 1. Vite Configuration for GitHub Pages
```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/theholeofrabbit/',  // Your repo name
  build: {
    outDir: 'docs',            // GitHub Pages serves from /docs
    emptyOutDir: true,
  }
})
```

#### 2. GitHub Actions Auto-Deploy
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main, claude/plan-aaa-game-* ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

#### 3. Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Deployment Workflow
```
1. Develop locally: npm run dev
2. Test build: npm run build && npm run preview
3. Commit & Push: Changes trigger GitHub Action
4. Automatic Deploy: GitHub Pages updates in ~2 minutes
5. Live at: https://themalikmusab.github.io/theholeofrabbit/
```

---

## 📋 Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Basic game loop working

**Tasks**:
- ✅ Set up Vite + Phaser 3 project
- ✅ Configure GitHub Pages deployment
- ✅ Create basic UI framework
- ✅ Implement resource management system
- ✅ Build save/load system
- ✅ Create placeholder graphics
- ✅ Main menu → Game → Star map flow

**Deliverable**: Can navigate menu, see star map, resources update

---

### Phase 2: Core Systems (Week 3-4)
**Goal**: Essential gameplay working

**Tasks**:
- ✅ Implement event system with JSON data
- ✅ Create 10-15 sample events
- ✅ Navigation system (travel between systems)
- ✅ Basic dialogue system
- ✅ Resource gain/loss from events
- ✅ Game over conditions (starvation, ship destroyed)

**Deliverable**: Can play through a simplified game loop

---

### Phase 3: Content Creation (Week 5-6)
**Goal**: Rich narrative experience

**Tasks**:
- ✅ Write 50+ events with branching choices
- ✅ Create character system with 6 key NPCs
- ✅ Design 30-40 star systems
- ✅ Implement story flags and branching paths
- ✅ Create 3-5 different endings
- ✅ Add crew morale system

**Deliverable**: Full narrative experience playable start to finish

---

### Phase 4: Ship Management (Week 7-8)
**Goal**: Deep strategic gameplay

**Tasks**:
- ✅ Ship module system (upgrades, damage, repairs)
- ✅ More complex resource management
- ✅ Alien faction reputation system
- ✅ Diplomacy encounters
- ✅ Combat system (narrative or tactical)
- ✅ Random event generation

**Deliverable**: Strategic depth, replayability

---

### Phase 5: Polish & Art (Week 9-10)
**Goal**: Professional presentation

**Tasks**:
- ✅ Create all final art assets
- ✅ UI/UX polish and animations
- ✅ Sound effects and music
- ✅ Tutorial system
- ✅ Achievements/statistics tracking
- ✅ Balance testing and tuning

**Deliverable**: Polished, complete game

---

### Phase 6: Testing & Launch (Week 11-12)
**Goal**: Ship it!

**Tasks**:
- ✅ Playtesting and bug fixes
- ✅ Performance optimization
- ✅ Mobile responsiveness (if scope allows)
- ✅ Write game documentation
- ✅ Create marketing materials (screenshots, trailer)
- ✅ Launch on GitHub Pages
- ✅ Share on itch.io, game dev communities

**Deliverable**: Released game ready for players

---

## 🎯 Minimum Viable Product (MVP)

If you want to launch faster, here's the absolute minimum:

### MVP Scope (4-6 Weeks)
```
✅ INCLUDE:
- Star map with 15-20 systems
- 30 story events with choices
- 4 key characters
- Basic resource management (fuel, food, population)
- Save/load system
- 2 endings (survival vs. extinction)
- Simple pixel art / placeholder graphics
- Core gameplay loop functional

❌ CUT (add later):
- Combat system (narrative only)
- Complex ship modules
- Alien diplomacy (simplified to events)
- Crew morale details
- Sound/music
- Achievements
- Advanced graphics
```

---

## 📊 Technical Considerations

### Performance
- Target: 60 FPS on modern browsers
- Canvas rendering (Phaser handles this)
- Lazy load events and assets
- Optimize large JSON files

### Browser Compatibility
- Chrome/Edge (Chromium): Primary target
- Firefox: Full support
- Safari: Test thoroughly (some Canvas quirks)
- Mobile: Responsive design, touch controls

### Save System Design
```javascript
// localStorage schema
{
  version: "1.0.0",
  saves: [
    {
      slot: 1,
      timestamp: "2025-11-21T10:30:00Z",
      gameState: {
        resources: {...},
        position: {...},
        flags: [...],
        characters: {...},
        turn: 45
      }
    }
  ]
}
```

### Data Management
- Events in JSON for easy editing
- Support for modding (players can add content)
- Version control for save compatibility

---

## 🎮 Unique Features to Stand Out

### 1. Consequence Tracker
Visual timeline showing how past choices affected the present

### 2. Ship Log
In-character journal that updates with player's journey

### 3. Permadeath Mode
Hardcore mode with no saves, one life

### 4. New Game Plus
Carry over some unlocks to next playthrough

### 5. Achievement System
Encourage different playstyles and exploration

### 6. Modding Support
Let players add their own events via JSON

---

## 💰 Monetization (Optional)

Since it's GitHub Pages, the game is free. Future options:
- Donations via Ko-fi or Patreon
- "Deluxe Edition" on Steam or itch.io with extra content
- Merchandise if it gains popularity
- DLC packs with new story arcs

---

## 📈 Success Metrics

### Technical Goals
- ✅ Loads in <3 seconds
- ✅ Runs at 60 FPS
- ✅ Works on mobile browsers
- ✅ Zero game-breaking bugs

### Player Engagement
- ✅ Average playtime: 2-4 hours
- ✅ Completion rate: >30%
- ✅ Replay rate: >15%

### Community
- ✅ 1000+ plays in first month
- ✅ Positive feedback on game dev forums
- ✅ Featured on indie game websites

---

## 🚀 Next Steps

### Immediate Actions
1. **Approve this plan** or request changes
2. **Set up development environment**
   - Initialize npm project
   - Install Phaser 3 and Vite
   - Configure GitHub Pages
3. **Create basic project structure**
4. **Build minimal prototype** (menu → star map → one event)
5. **Iterate from there**

### Questions for You
1. **Timeline**: Are you targeting the 12-week full version or 4-6 week MVP?
2. **Art Style**: Pixel art, vector, or placeholder shapes to start?
3. **Scope**: Full feature set or MVP first?
4. **Involvement**: Solo dev or do you have teammates?
5. **Skills**: Comfortable with JavaScript? Need tutorial sections in code?

---

## 📚 Learning Resources

### Phaser 3 Tutorials
- Official Docs: https://phaser.io/learn
- Tutorial Series: "Making Your First Phaser 3 Game"
- Examples: https://labs.phaser.io/

### Game Design
- "Choice Poetics" by Anna Anthropy
- "Game Writing: Narrative Skills for Videogames"
- Watch: FTL, Sunless Sea, Out There (similar games)

### GitHub Pages + Vite
- Vite Docs: https://vitejs.dev/
- GitHub Pages Guide: https://pages.github.com/

---

## 🎊 Summary

**THE LAST VOYAGE** is 100% achievable as a browser game on GitHub Pages. The tech stack is proven, the scope is manageable, and the concept is compelling. With focused development, you can have a playable MVP in 4-6 weeks and a polished full release in 12 weeks.

The game will feature:
- 🌟 Meaningful narrative choices
- 🚀 Engaging resource management
- 🌌 Procedural exploration
- 👥 Memorable characters
- 🎯 Multiple endings
- 💾 Full save system
- 🌐 Runs in any modern browser

**Ready to begin Phase 1?**
