import Phaser from 'phaser'
import { COLORS } from '../config'
import GameState from '../systems/GameState'
import EventSystem from '../systems/EventSystem'
import SaveSystem from '../systems/SaveSystem'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Create starfield background
    this.createStarfield()

    // Title
    this.add.text(width / 2, height / 3, 'THE LAST VOYAGE', {
      font: 'bold 64px monospace',
      fill: COLORS.PRIMARY,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    // Subtitle
    this.add.text(width / 2, height / 3 + 70, 'A Space Opera', {
      font: '24px monospace',
      fill: COLORS.TEXT,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5)

    // Tagline
    this.add.text(width / 2, height / 3 + 110, 'Lead humanity\'s last generation ship to salvation... or extinction', {
      font: 'italic 16px monospace',
      fill: COLORS.SECONDARY,
      alpha: 0.8
    }).setOrigin(0.5)

    // Menu buttons
    const buttonY = height / 2 + 80

    this.createButton(width / 2, buttonY, 'NEW GAME', () => {
      this.startNewGame()
    })

    this.createButton(width / 2, buttonY + 70, 'LOAD GAME', () => {
      this.loadGame()
    })

    this.createButton(width / 2, buttonY + 140, 'SETTINGS', () => {
      console.log('Settings - Not yet implemented')
      this.showMessage('Settings menu coming soon!')
    })

    // Version info
    this.add.text(20, height - 30, 'v1.0.0-alpha | Phase 2', {
      font: '12px monospace',
      fill: '#666666'
    })

    // Credits
    this.add.text(width - 20, height - 30, 'Built with Phaser 3', {
      font: '12px monospace',
      fill: '#666666'
    }).setOrigin(1, 0)
  }

  async startNewGame() {
    console.log('Starting new game...')

    // Initialize game state
    const gameState = new GameState()

    // Initialize event system
    const eventSystem = new EventSystem(gameState)

    // Load events
    const loaded = await eventSystem.loadEvents()
    if (!loaded) {
      console.error('Failed to load events!')
      this.showMessage('Error loading game data!', COLORS.DANGER)
      return
    }

    console.log(`Game initialized with ${eventSystem.events.length} events`)

    // Show intro event
    const introEvent = eventSystem.getEvent('intro_departure')
    if (introEvent) {
      this.scene.start('EventScene', {
        gameState,
        eventSystem,
        event: introEvent
      })
    } else {
      // No intro, go straight to map
      this.scene.start('MapScene', {
        gameState,
        eventSystem
      })
    }
  }

  loadGame() {
    const saves = SaveSystem.getSaves()

    if (saves.length === 0) {
      this.showMessage('No saved games found!')
      return
    }

    // For now, just load slot 1
    const savedState = SaveSystem.load(1)
    if (savedState) {
      const gameState = new GameState()
      gameState.deserialize(savedState)

      const eventSystem = new EventSystem(gameState)
      eventSystem.loadEvents().then(() => {
        this.scene.start('MapScene', {
          gameState,
          eventSystem
        })
      })
    } else {
      this.showMessage('Failed to load save!')
    }
  }

  createStarfield() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const graphics = this.add.graphics()

    // Create random stars
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Phaser.Math.Between(1, 3)
      const alpha = Phaser.Math.FloatBetween(0.3, 1)

      graphics.fillStyle(0xffffff, alpha)
      graphics.fillCircle(x, y, size)
    }

    // Add some colored stars
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const colors = [0x00ffff, 0xff00ff, 0xffaa00]
      const color = colors[Phaser.Math.Between(0, colors.length - 1)]

      graphics.fillStyle(color, 0.6)
      graphics.fillCircle(x, y, 2)
    }
  }

  createButton(x, y, text, callback) {
    const button = this.add.text(x, y, text, {
      font: '28px monospace',
      fill: COLORS.TEXT,
      backgroundColor: COLORS.UI_BG,
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive()

    // Hover effect
    button.on('pointerover', () => {
      button.setStyle({
        fill: COLORS.PRIMARY,
        backgroundColor: '#2a2a3e'
      })
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      })
    })

    button.on('pointerout', () => {
      button.setStyle({
        fill: COLORS.TEXT,
        backgroundColor: COLORS.UI_BG
      })
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      })
    })

    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback
      })
    })

    return button
  }

  showMessage(text) {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const msg = this.add.text(width / 2, height / 2, text, {
      font: '20px monospace',
      fill: COLORS.WARNING,
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({
      targets: msg,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 2000,
      onComplete: () => msg.destroy()
    })
  }
}
