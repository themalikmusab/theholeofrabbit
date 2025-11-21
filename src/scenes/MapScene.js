import Phaser from 'phaser'
import { COLORS } from '../config'
import GalaxyGenerator from '../systems/GalaxyGenerator'
import ResourceDisplay from '../ui/ResourceDisplay'

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' })
  }

  init(data) {
    this.gameState = data.gameState
    this.eventSystem = data.eventSystem
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Generate or load galaxy
    if (!this.registry.get('galaxySystems')) {
      const generator = new GalaxyGenerator(12345) // Fixed seed for consistency
      this.systems = generator.generate(30, 1000, 550)
      this.registry.set('galaxySystems', this.systems)
      this.registry.set('galaxyGenerator', generator)
    } else {
      this.systems = this.registry.get('galaxySystems')
    }
    this.generator = this.registry.get('galaxyGenerator')

    // Map offset for centering
    this.mapOffsetX = 90
    this.mapOffsetY = 100

    // Background
    this.createStarfield()

    // Map container
    this.mapContainer = this.add.container(this.mapOffsetX, this.mapOffsetY)

    // Draw galaxy
    this.drawConnections()
    this.drawSystems()

    // UI
    this.createUI()

    // Resource display
    this.resourceDisplay = new ResourceDisplay(this, width - 220, 20, this.gameState)

    // Info panel
    this.infoPanel = this.createInfoPanel()

    // Update discovered systems based on game state
    this.updateSystemStates()
  }

  createStarfield() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const graphics = this.add.graphics()

    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Phaser.Math.Between(1, 2)
      graphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.7))
      graphics.fillCircle(x, y, size)
    }
  }

  createUI() {
    const width = this.cameras.main.width

    // Title
    this.add.text(width / 2, 30, 'GALAXY MAP', {
      font: 'bold 32px monospace',
      fill: COLORS.PRIMARY,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Turn counter
    this.turnText = this.add.text(20, 30, `Day ${this.gameState.daysPassed} | Turn ${this.gameState.turn}`, {
      font: '16px monospace',
      fill: COLORS.TEXT
    })

    // Help text
    this.add.text(width / 2, 680, 'Click on a system to travel | Green = In Range | Red = Out of Range', {
      font: '12px monospace',
      fill: COLORS.TEXT,
      alpha: 0.7
    }).setOrigin(0.5)
  }

  drawConnections() {
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x16213e, 0.3)

    this.systems.forEach(sys1 => {
      if (sys1.connections) {
        sys1.connections.forEach(connectionId => {
          const sys2 = this.systems.find(s => s.id === connectionId)
          if (sys2) {
            graphics.lineBetween(sys1.x, sys1.y, sys2.x, sys2.y)
          }
        })
      }
    })

    this.mapContainer.add(graphics)
  }

  drawSystems() {
    this.systemSprites = []

    this.systems.forEach(system => {
      const circle = this.add.circle(system.x, system.y, 6, this.getSystemColor(system.type))
      circle.setStrokeStyle(2, 0xffffff, 0.5)

      // Store reference
      circle.systemData = system

      // Make interactive
      circle.setInteractive()

      // Hover effects
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

      // Label for visited/discovered systems
      if (system.visited || system.discovered) {
        const label = this.add.text(system.x, system.y + 12, system.name, {
          font: '9px monospace',
          fill: COLORS.TEXT,
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5)
        this.mapContainer.add(label)
      }

      this.mapContainer.add(circle)
      this.systemSprites.push(circle)
    })
  }

  updateSystemStates() {
    // Mark systems as visited/discovered based on gameState
    this.systems.forEach(system => {
      if (this.gameState.visitedSystems.includes(system.id)) {
        system.visited = true
        system.discovered = true
      }
      if (this.gameState.discoveredSystems.includes(system.id)) {
        system.discovered = true
      }
    })

    // Highlight current system
    const currentSystem = this.systems.find(s => s.id === this.gameState.currentSystem)
    if (currentSystem) {
      const sprite = this.systemSprites.find(s => s.systemData.id === currentSystem.id)
      if (sprite) {
        sprite.setStrokeStyle(3, parseInt(COLORS.PRIMARY.replace('#', '0x')))
      }
    }
  }

  getSystemColor(type) {
    const colors = {
      start: 0x00ff00,
      barren: 0x808080,
      resource: 0xffaa00,
      inhabited: 0x00ffff,
      anomaly: 0xff00ff,
      ruins: 0xaaaa00,
      hostile: 0xff0000,
      habitable: 0x00ff88,
      haven: 0x00ffff
    }
    return colors[type] || 0xffffff
  }

  createInfoPanel() {
    const panel = this.add.container(20, 500)

    const bg = this.add.rectangle(0, 0, 300, 180, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.9)
    bg.setOrigin(0, 0)
    bg.setStrokeStyle(2, parseInt(COLORS.UI_BORDER.replace('#', '0x')))
    panel.add(bg)

    const title = this.add.text(10, 10, 'System Info', {
      font: 'bold 16px monospace',
      fill: COLORS.PRIMARY
    })
    panel.add(title)

    this.infoText = this.add.text(10, 40, 'Hover over a system for details', {
      font: '12px monospace',
      fill: COLORS.TEXT,
      wordWrap: { width: 280 }
    })
    panel.add(this.infoText)

    panel.setVisible(false)
    return panel
  }

  showSystemInfo(system) {
    this.infoPanel.setVisible(true)

    const currentSystem = this.systems.find(s => s.id === this.gameState.currentSystem)
    const fuelCost = this.generator.calculateFuelCost(currentSystem, system)
    const canTravel = fuelCost <= this.gameState.getResource('fuel')

    const statusText = system.visited ? '[VISITED]' : (system.discovered ? '[DISCOVERED]' : '[UNKNOWN]')

    let info = `${system.name} ${statusText}\n`
    info += `Type: ${system.type}\n`
    if (system.discovered || system.visited) {
      info += `${system.description}\n`
    }
    info += `\nFuel Cost: ${fuelCost}\n`
    info += canTravel ? '[CAN TRAVEL]' : '[OUT OF RANGE]'

    this.infoText.setText(info)
  }

  onSystemClick(system) {
    const currentSystem = this.systems.find(s => s.id === this.gameState.currentSystem)

    if (system.id === currentSystem.id) {
      console.log('Already at this system')
      return
    }

    const fuelCost = this.generator.calculateFuelCost(currentSystem, system)
    const canTravel = fuelCost <= this.gameState.getResource('fuel')

    if (!canTravel) {
      console.log('Not enough fuel to travel')
      this.showMessage('Not enough fuel!', COLORS.DANGER)
      return
    }

    // Travel to system
    this.travelToSystem(system, fuelCost)
  }

  travelToSystem(system, fuelCost) {
    console.log(`Traveling to ${system.name}, cost: ${fuelCost}`)

    // Deduct fuel
    this.gameState.modifyResource('fuel', -fuelCost)

    // Mark as visited
    this.gameState.visitSystem(system.id)
    system.visited = true
    system.discovered = true

    // Advance turn
    this.gameState.advanceTurn()

    // Update UI
    this.resourceDisplay.update()
    this.turnText.setText(`Day ${this.gameState.daysPassed} | Turn ${this.gameState.turn}`)

    // Check for random event during travel
    const travelEvent = this.eventSystem.getRandomEvent('travel')
    if (travelEvent) {
      // Trigger event
      this.scene.start('EventScene', {
        gameState: this.gameState,
        eventSystem: this.eventSystem,
        event: travelEvent
      })
      return
    }

    // Check for system event
    if (system.hasEvent) {
      const systemEvent = this.eventSystem.getRandomEvent('system')
      if (systemEvent) {
        this.scene.start('EventScene', {
          gameState: this.gameState,
          eventSystem: this.eventSystem,
          event: systemEvent
        })
        return
      }
    }

    // No event, show arrival message
    this.showMessage(`Arrived at ${system.name}`, COLORS.SUCCESS)

    // Check for victory
    if (system.id === 'new_earth' || system.type === 'haven') {
      this.gameState.triggerVictory('new_home_found')
      this.scene.start('EndingScene', { gameState: this.gameState })
    }

    // Refresh scene
    this.scene.restart({ gameState: this.gameState, eventSystem: this.eventSystem })
  }

  showMessage(text, color = COLORS.WARNING) {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const msg = this.add.text(width / 2, height / 2, text, {
      font: '24px monospace',
      fill: color,
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setAlpha(0).setDepth(1000)

    this.tweens.add({
      targets: msg,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1500,
      onComplete: () => msg.destroy()
    })
  }
}
