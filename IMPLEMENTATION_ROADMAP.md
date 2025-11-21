# THE LAST VOYAGE - Technical Implementation Roadmap

## 🗺️ Overview

This document provides step-by-step technical guidance for implementing THE LAST VOYAGE as a browser-based game deployable on GitHub Pages.

---

## 🏁 Phase 1: Project Setup & Infrastructure

### Step 1.1: Initialize Node.js Project
```bash
# Initialize package.json
npm init -y

# Install core dependencies
npm install phaser vite

# Install dev dependencies
npm install -D vite gh-pages
```

### Step 1.2: Create Project Structure
```bash
mkdir -p src/{scenes,systems,data,ui,utils}
mkdir -p assets/{images/{ui,backgrounds,characters,ships},audio/{music,sfx},fonts}
mkdir -p .github/workflows
```

### Step 1.3: Configure Vite for GitHub Pages
Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: '/theholeofrabbit/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

### Step 1.4: Create index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Last Voyage - A Space Opera</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Courier New', monospace;
    }
    #game-container {
      max-width: 100%;
      max-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### Step 1.5: Configure package.json Scripts
```json
{
  "name": "the-last-voyage",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d docs"
  }
}
```

### Step 1.6: Setup GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - 'claude/plan-aaa-game-*'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./docs

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

### Step 1.7: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Save

**✅ Checkpoint**: Run `npm run dev` and see empty black canvas

---

## 🎮 Phase 2: Phaser Game Initialization

### Step 2.1: Create Game Config
Create `src/config.js`:
```javascript
export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: false // We don't need physics for this game
  },
  scene: [] // Will populate with scenes
}

export const RESOURCES = {
  FUEL: 'fuel',
  FOOD: 'food',
  MATERIALS: 'materials',
  POPULATION: 'population',
  MORALE: 'morale',
  TECHNOLOGY: 'technology'
}

export const COLORS = {
  PRIMARY: '#00ffff',
  SECONDARY: '#ff00ff',
  SUCCESS: '#00ff00',
  WARNING: '#ffff00',
  DANGER: '#ff0000',
  TEXT: '#ffffff',
  UI_BG: '#1a1a2e',
  UI_BORDER: '#16213e'
}
```

### Step 2.2: Create Main Entry Point
Create `src/main.js`:
```javascript
import Phaser from 'phaser'
import { GAME_CONFIG } from './config'
import BootScene from './scenes/BootScene'
import MenuScene from './scenes/MenuScene'
import MapScene from './scenes/MapScene'
import EventScene from './scenes/EventScene'
import ShipScene from './scenes/ShipScene'
import EndingScene from './scenes/EndingScene'

// Register all scenes
GAME_CONFIG.scene = [
  BootScene,
  MenuScene,
  MapScene,
  EventScene,
  ShipScene,
  EndingScene
]

// Initialize game
const game = new Phaser.Game(GAME_CONFIG)

// Expose game globally for debugging
window.game = game
```

### Step 2.3: Create Boot Scene
Create `src/scenes/BootScene.js`:
```javascript
import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5)

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5)

    // Update loading bar
    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%')
      progressBar.clear()
      progressBar.fillStyle(0x00ffff, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })

    // TODO: Load assets here
    // this.load.image('logo', 'assets/images/logo.png')
  }

  create() {
    // Move to menu scene
    this.scene.start('MenuScene')
  }
}
```

### Step 2.4: Create Menu Scene (Placeholder)
Create `src/scenes/MenuScene.js`:
```javascript
import Phaser from 'phaser'
import { COLORS } from '../config'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Title
    this.add.text(width / 2, height / 3, 'THE LAST VOYAGE', {
      font: 'bold 64px monospace',
      fill: COLORS.PRIMARY
    }).setOrigin(0.5)

    // Subtitle
    this.add.text(width / 2, height / 3 + 60, 'A Space Opera', {
      font: '24px monospace',
      fill: COLORS.TEXT
    }).setOrigin(0.5)

    // Menu buttons
    this.createButton(width / 2, height / 2 + 50, 'NEW GAME', () => {
      this.scene.start('MapScene')
    })

    this.createButton(width / 2, height / 2 + 120, 'LOAD GAME', () => {
      console.log('Load game - TODO')
    })

    this.createButton(width / 2, height / 2 + 190, 'SETTINGS', () => {
      console.log('Settings - TODO')
    })
  }

  createButton(x, y, text, callback) {
    const button = this.add.text(x, y, text, {
      font: '28px monospace',
      fill: COLORS.TEXT,
      backgroundColor: COLORS.UI_BG,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive()

    button.on('pointerover', () => {
      button.setStyle({ fill: COLORS.PRIMARY })
    })

    button.on('pointerout', () => {
      button.setStyle({ fill: COLORS.TEXT })
    })

    button.on('pointerdown', callback)

    return button
  }
}
```

### Step 2.5: Create Placeholder Scenes
Create `src/scenes/MapScene.js`:
```javascript
import Phaser from 'phaser'

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    this.add.text(width / 2, height / 2, 'GALAXY MAP\n(Coming Soon)', {
      font: '48px monospace',
      fill: '#00ffff',
      align: 'center'
    }).setOrigin(0.5)

    // Back button
    this.add.text(50, 50, '← Back to Menu', {
      font: '20px monospace',
      fill: '#ffffff'
    }).setInteractive().on('pointerdown', () => {
      this.scene.start('MenuScene')
    })
  }
}
```

Create similar placeholder files:
- `src/scenes/EventScene.js`
- `src/scenes/ShipScene.js`
- `src/scenes/EndingScene.js`

**✅ Checkpoint**: Run `npm run dev` and see main menu with clickable buttons

---

## 💾 Phase 3: Save System

### Step 3.1: Create Save System
Create `src/systems/SaveSystem.js`:
```javascript
const SAVE_KEY = 'lastVoyage_saves'
const VERSION = '1.0.0'

export default class SaveSystem {
  static getSaves() {
    const data = localStorage.getItem(SAVE_KEY)
    if (!data) return []

    try {
      const parsed = JSON.parse(data)
      if (parsed.version !== VERSION) {
        console.warn('Save version mismatch')
        return []
      }
      return parsed.saves || []
    } catch (e) {
      console.error('Failed to parse saves', e)
      return []
    }
  }

  static save(slot, gameState) {
    const saves = this.getSaves()
    const saveData = {
      slot,
      timestamp: new Date().toISOString(),
      gameState: { ...gameState }
    }

    const index = saves.findIndex(s => s.slot === slot)
    if (index >= 0) {
      saves[index] = saveData
    } else {
      saves.push(saveData)
    }

    const data = {
      version: VERSION,
      saves
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    return true
  }

  static load(slot) {
    const saves = this.getSaves()
    const save = saves.find(s => s.slot === slot)
    return save ? save.gameState : null
  }

  static deleteSave(slot) {
    const saves = this.getSaves()
    const filtered = saves.filter(s => s.slot !== slot)

    const data = {
      version: VERSION,
      saves: filtered
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  static clearAll() {
    localStorage.removeItem(SAVE_KEY)
  }
}
```

### Step 3.2: Create Game State Manager
Create `src/systems/GameState.js`:
```javascript
import { RESOURCES } from '../config'

export default class GameState {
  constructor() {
    this.reset()
  }

  reset() {
    this.resources = {
      [RESOURCES.FUEL]: 100,
      [RESOURCES.FOOD]: 100,
      [RESOURCES.MATERIALS]: 100,
      [RESOURCES.POPULATION]: 1000,
      [RESOURCES.MORALE]: 75,
      [RESOURCES.TECHNOLOGY]: 0
    }

    this.currentSystem = 'start'
    this.visitedSystems = ['start']
    this.flags = []
    this.turn = 0
    this.characters = {}
    this.ship = {
      modules: {}
    }
  }

  modifyResource(resource, amount) {
    if (!(resource in this.resources)) {
      console.error(`Unknown resource: ${resource}`)
      return
    }

    this.resources[resource] += amount

    // Clamp values
    if (resource === RESOURCES.MORALE) {
      this.resources[resource] = Math.max(0, Math.min(100, this.resources[resource]))
    } else if (resource === RESOURCES.POPULATION) {
      this.resources[resource] = Math.max(0, this.resources[resource])
    } else {
      this.resources[resource] = Math.max(0, this.resources[resource])
    }
  }

  hasFlag(flag) {
    return this.flags.includes(flag)
  }

  addFlag(flag) {
    if (!this.hasFlag(flag)) {
      this.flags.push(flag)
    }
  }

  removeFlag(flag) {
    this.flags = this.flags.filter(f => f !== flag)
  }

  serialize() {
    return {
      resources: { ...this.resources },
      currentSystem: this.currentSystem,
      visitedSystems: [...this.visitedSystems],
      flags: [...this.flags],
      turn: this.turn,
      characters: { ...this.characters },
      ship: JSON.parse(JSON.stringify(this.ship))
    }
  }

  deserialize(data) {
    this.resources = { ...data.resources }
    this.currentSystem = data.currentSystem
    this.visitedSystems = [...data.visitedSystems]
    this.flags = [...data.flags]
    this.turn = data.turn
    this.characters = { ...data.characters }
    this.ship = JSON.parse(JSON.stringify(data.ship))
  }

  isGameOver() {
    return this.resources[RESOURCES.POPULATION] <= 0 ||
           this.resources[RESOURCES.FOOD] <= 0
  }
}
```

**✅ Checkpoint**: Can save/load game state from localStorage

---

## 🗺️ Phase 4: Star Map System

### Step 4.1: Create Star System Generator
Create `src/systems/GalaxyGenerator.js`:
```javascript
export default class GalaxyGenerator {
  constructor(seed = Date.now()) {
    this.seed = seed
    this.rng = this.createRNG(seed)
  }

  // Simple seeded random number generator
  createRNG(seed) {
    let state = seed
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296
      return state / 4294967296
    }
  }

  generate(numSystems = 30) {
    const systems = []
    const width = 1000
    const height = 800

    // Add starting system
    systems.push({
      id: 'start',
      name: 'Sol System',
      x: width / 2,
      y: height / 2,
      type: 'start',
      visited: true,
      description: 'Humanity\'s birthplace, now a fading memory.'
    })

    // Generate other systems
    for (let i = 0; i < numSystems; i++) {
      systems.push({
        id: `system_${i}`,
        name: this.generateName(),
        x: this.rng() * width,
        y: this.rng() * height,
        type: this.chooseType(),
        visited: false,
        description: ''
      })
    }

    return systems
  }

  generateName() {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta']
    const suffixes = ['Centauri', 'Prime', 'Secundus', 'Major', 'Minor', 'Proxima']
    const prefix = prefixes[Math.floor(this.rng() * prefixes.length)]
    const suffix = suffixes[Math.floor(this.rng() * suffixes.length)]
    return `${prefix} ${suffix}`
  }

  chooseType() {
    const rand = this.rng()
    if (rand < 0.3) return 'barren'
    if (rand < 0.5) return 'resource'
    if (rand < 0.65) return 'inhabited'
    if (rand < 0.8) return 'anomaly'
    if (rand < 0.9) return 'ruins'
    return 'hostile'
  }
}
```

### Step 4.2: Implement Map Scene
Update `src/scenes/MapScene.js`:
```javascript
import Phaser from 'phaser'
import { COLORS } from '../config'
import GalaxyGenerator from '../systems/GalaxyGenerator'

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' })
  }

  create() {
    // Generate galaxy
    const generator = new GalaxyGenerator(12345)
    this.systems = generator.generate(30)

    // Background stars
    this.createStarfield()

    // UI
    this.createUI()

    // Draw systems
    this.drawSystems()

    // Draw connections
    this.drawConnections()
  }

  createStarfield() {
    const graphics = this.add.graphics()
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, 1280)
      const y = Phaser.Math.Between(0, 720)
      const size = Phaser.Math.Between(1, 2)
      graphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1))
      graphics.fillCircle(x, y, size)
    }
  }

  createUI() {
    // Title
    this.add.text(20, 20, 'GALAXY MAP', {
      font: '32px monospace',
      fill: COLORS.PRIMARY
    })

    // Resources panel
    this.add.rectangle(1100, 20, 160, 200, 0x1a1a2e).setOrigin(0, 0)
    this.add.text(1110, 30, 'RESOURCES', {
      font: '16px monospace',
      fill: COLORS.TEXT
    })

    // TODO: Display actual resources from GameState
    this.add.text(1110, 60, 'Fuel: 100\nFood: 100\nPop: 1000', {
      font: '14px monospace',
      fill: COLORS.TEXT
    })
  }

  drawSystems() {
    this.systems.forEach(system => {
      const color = this.getSystemColor(system.type)
      const circle = this.add.circle(system.x, system.y, 8, color)
      circle.setInteractive()

      circle.on('pointerover', () => {
        circle.setScale(1.5)
        this.showSystemInfo(system)
      })

      circle.on('pointerout', () => {
        circle.setScale(1)
      })

      circle.on('pointerdown', () => {
        this.onSystemClick(system)
      })

      // Label
      this.add.text(system.x, system.y + 15, system.name, {
        font: '10px monospace',
        fill: COLORS.TEXT
      }).setOrigin(0.5)
    })
  }

  drawConnections() {
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x16213e, 0.5)

    // Simple connection: connect nearby systems
    this.systems.forEach((s1, i) => {
      this.systems.slice(i + 1).forEach(s2 => {
        const dist = Phaser.Math.Distance.Between(s1.x, s1.y, s2.x, s2.y)
        if (dist < 150) {
          graphics.lineBetween(s1.x, s1.y, s2.x, s2.y)
        }
      })
    })
  }

  getSystemColor(type) {
    const colors = {
      start: 0x00ff00,
      barren: 0x808080,
      resource: 0xffaa00,
      inhabited: 0x00ffff,
      anomaly: 0xff00ff,
      ruins: 0xaaaa00,
      hostile: 0xff0000
    }
    return colors[type] || 0xffffff
  }

  showSystemInfo(system) {
    // TODO: Show info panel
    console.log(system)
  }

  onSystemClick(system) {
    console.log('Travel to', system.name)
    // TODO: Trigger event or travel
  }
}
```

**✅ Checkpoint**: Galaxy map displays with clickable systems

---

## 📜 Phase 5: Event System

### Step 5.1: Create Event Data Structure
Create `src/data/events.json`:
```json
[
  {
    "id": "intro",
    "title": "Departure",
    "description": "Earth fades in the viewport. Ten thousand souls aboard the generation ship 'Ark Humanity' look to you, Captain, for guidance. The journey to find a new home begins now.",
    "image": null,
    "choices": [
      {
        "text": "Address the crew with hope",
        "outcomes": [
          {
            "chance": 1.0,
            "effects": [
              { "type": "morale", "value": 10 }
            ],
            "text": "Your words inspire courage. Morale increases."
          }
        ],
        "flags": ["inspirational_leader"]
      },
      {
        "text": "Be realistic about the dangers ahead",
        "outcomes": [
          {
            "chance": 1.0,
            "effects": [
              { "type": "morale", "value": -5 }
            ],
            "text": "The crew appreciates your honesty, but anxiety spreads."
          }
        ],
        "flags": ["pragmatic_leader"]
      }
    ],
    "flags": [],
    "unlocks": []
  },
  {
    "id": "derelict_ship",
    "title": "Derelict Vessel",
    "description": "Sensors detect a massive ship drifting in space. No life signs. The hull bears markings from the First Wave colony missions - lost decades ago.",
    "image": null,
    "choices": [
      {
        "text": "Send salvage team",
        "requirements": [
          { "type": "population", "value": 10, "operator": ">=" }
        ],
        "outcomes": [
          {
            "chance": 0.6,
            "effects": [
              { "type": "materials", "value": 50 }
            ],
            "text": "Your team returns with valuable materials!"
          },
          {
            "chance": 0.3,
            "effects": [
              { "type": "technology", "value": 10 }
            ],
            "text": "They find intact data cores with lost technology!"
          },
          {
            "chance": 0.1,
            "effects": [
              { "type": "population", "value": -5 },
              { "type": "morale", "value": -10 }
            ],
            "text": "The ship's AI defense systems activate. You lose crew members."
          }
        ]
      },
      {
        "text": "Scan and continue",
        "outcomes": [
          {
            "chance": 1.0,
            "effects": [],
            "text": "You log the coordinates and move on. Perhaps others will find it."
          }
        ]
      }
    ],
    "flags": [],
    "unlocks": []
  }
]
```

### Step 5.2: Create Event System
Create `src/systems/EventSystem.js`:
```javascript
export default class EventSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.events = []
  }

  async loadEvents() {
    try {
      const response = await fetch('/src/data/events.json')
      this.events = await response.json()
      return true
    } catch (error) {
      console.error('Failed to load events:', error)
      return false
    }
  }

  getEvent(id) {
    return this.events.find(e => e.id === id)
  }

  getRandomEvent(pool = 'random') {
    // Filter available events
    const available = this.events.filter(event => {
      // Check if already triggered
      if (this.gameState.hasFlag(`event_${event.id}_seen`)) {
        return false
      }

      // Check requirements
      if (event.requirements) {
        return this.checkRequirements(event.requirements)
      }

      return true
    })

    if (available.length === 0) return null

    const index = Math.floor(Math.random() * available.length)
    return available[index]
  }

  checkRequirements(requirements) {
    return requirements.every(req => {
      const value = this.gameState.resources[req.type]
      switch (req.operator) {
        case '>=': return value >= req.value
        case '>': return value > req.value
        case '<=': return value <= req.value
        case '<': return value < req.value
        case '==': return value === req.value
        default: return false
      }
    })
  }

  processChoice(event, choiceIndex) {
    const choice = event.choices[choiceIndex]

    // Check if choice is available
    if (choice.requirements && !this.checkRequirements(choice.requirements)) {
      return {
        success: false,
        message: 'Requirements not met'
      }
    }

    // Roll for outcome
    const roll = Math.random()
    let cumulative = 0
    let selectedOutcome = null

    for (const outcome of choice.outcomes) {
      cumulative += outcome.chance
      if (roll <= cumulative) {
        selectedOutcome = outcome
        break
      }
    }

    if (!selectedOutcome) {
      selectedOutcome = choice.outcomes[choice.outcomes.length - 1]
    }

    // Apply effects
    if (selectedOutcome.effects) {
      selectedOutcome.effects.forEach(effect => {
        this.gameState.modifyResource(effect.type, effect.value)
      })
    }

    // Set flags
    if (choice.flags) {
      choice.flags.forEach(flag => this.gameState.addFlag(flag))
    }

    // Mark event as seen
    this.gameState.addFlag(`event_${event.id}_seen`)

    return {
      success: true,
      outcome: selectedOutcome,
      text: selectedOutcome.text
    }
  }
}
```

### Step 5.3: Create Event Scene
Update `src/scenes/EventScene.js`:
```javascript
import Phaser from 'phaser'
import { COLORS } from '../config'

export default class EventScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EventScene' })
  }

  init(data) {
    this.event = data.event
    this.eventSystem = data.eventSystem
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0)

    // Event panel
    const panel = this.add.rectangle(width / 2, height / 2, 900, 600, 0x1a1a2e)
    panel.setStrokeStyle(2, 0x00ffff)

    // Title
    this.add.text(width / 2, 150, this.event.title, {
      font: 'bold 36px monospace',
      fill: COLORS.PRIMARY
    }).setOrigin(0.5)

    // Description
    this.add.text(width / 2, 250, this.event.description, {
      font: '18px monospace',
      fill: COLORS.TEXT,
      wordWrap: { width: 800 },
      align: 'center'
    }).setOrigin(0.5)

    // Choices
    this.createChoices()
  }

  createChoices() {
    const width = this.cameras.main.width
    const startY = 400

    this.event.choices.forEach((choice, index) => {
      const y = startY + (index * 70)

      const button = this.add.text(width / 2, y, `${index + 1}. ${choice.text}`, {
        font: '20px monospace',
        fill: COLORS.TEXT,
        backgroundColor: COLORS.UI_BG,
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive()

      // Check requirements
      if (choice.requirements) {
        const canChoose = this.eventSystem.checkRequirements(choice.requirements)
        if (!canChoose) {
          button.setStyle({ fill: '#666666' })
          button.disableInteractive()
        }
      }

      button.on('pointerover', () => {
        if (button.input.enabled) {
          button.setStyle({ fill: COLORS.PRIMARY })
        }
      })

      button.on('pointerout', () => {
        if (button.input.enabled) {
          button.setStyle({ fill: COLORS.TEXT })
        }
      })

      button.on('pointerdown', () => {
        this.onChoiceSelected(index)
      })
    })
  }

  onChoiceSelected(choiceIndex) {
    const result = this.eventSystem.processChoice(this.event, choiceIndex)

    if (result.success) {
      // Show outcome
      this.showOutcome(result)
    }
  }

  showOutcome(result) {
    // Clear scene
    this.children.removeAll()

    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Outcome panel
    this.add.rectangle(width / 2, height / 2, 800, 400, 0x1a1a2e).setStrokeStyle(2, 0x00ff00)

    // Outcome text
    this.add.text(width / 2, height / 2 - 50, result.text, {
      font: '24px monospace',
      fill: COLORS.TEXT,
      wordWrap: { width: 700 },
      align: 'center'
    }).setOrigin(0.5)

    // Continue button
    const button = this.add.text(width / 2, height / 2 + 100, 'Continue', {
      font: '28px monospace',
      fill: COLORS.TEXT,
      backgroundColor: COLORS.UI_BG,
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive()

    button.on('pointerdown', () => {
      this.scene.start('MapScene')
    })
  }
}
```

**✅ Checkpoint**: Can trigger and play through events with choices

---

## 🔧 Phase 6: Integration & Polish

### Step 6.1: Connect All Systems
Update scenes to share GameState and EventSystem instances

### Step 6.2: Add Resource Display
Create persistent UI showing current resources

### Step 6.3: Add More Events
Expand events.json with 30-50 events

### Step 6.4: Add Sound Effects (Optional)
Integrate Web Audio API for UI sounds

### Step 6.5: Add Animations
Phaser tweens for smooth transitions

### Step 6.6: Mobile Optimization
Test touch controls and responsive scaling

---

## 📦 Phase 7: Deployment

### Step 7.1: Build for Production
```bash
npm run build
```

### Step 7.2: Test Build Locally
```bash
npm run preview
```

### Step 7.3: Commit and Push
```bash
git add .
git commit -m "Initial game implementation"
git push origin claude/plan-aaa-game-01HvocoVkNpURffyFWkkkPUK
```

### Step 7.4: Verify GitHub Action
- Check Actions tab on GitHub
- Ensure deployment succeeds
- Visit https://themalikmusab.github.io/theholeofrabbit/

**✅ Game is live!**

---

## 🎯 Next Steps After MVP

1. Add more content (events, systems, characters)
2. Implement ship module system
3. Add combat mechanics
4. Create multiple endings
5. Add achievements
6. Sound and music
7. Expanded narrative arcs
8. Alien faction system

---

## 🐛 Troubleshooting

### Game Won't Load
- Check browser console for errors
- Verify assets are in correct paths
- Check Vite base path in config

### GitHub Pages 404
- Ensure repository settings have Pages enabled
- Check that source is set to "GitHub Actions"
- Verify build created `docs` folder

### Assets Not Loading
- Use absolute paths with base URL
- Check CORS if loading external resources
- Verify asset file names and extensions

---

## 📚 Resources

- **Phaser 3 Docs**: https://photonstorm.github.io/phaser3-docs/
- **Vite Guide**: https://vitejs.dev/guide/
- **localStorage Tutorial**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

Ready to start building? Let me know and we'll begin Phase 1!
