// Ship Interior Scene - Walk around your ship and interact with crew/systems
import Phaser from 'phaser'
import { COLORS } from '../config'

export default class ShipInteriorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShipInteriorScene' })
  }

  init(data) {
    this.gameState = data.gameState
    this.returnScene = data.returnScene || 'MapScene'
    this.returnData = data.returnData || {}
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Create ship interior layout
    this.createShipLayout(width, height)

    // Create player character
    this.player = this.createPlayer(width / 2, height / 2)

    // Create crew members in different locations
    this.createCrewMembers()

    // Create interactive stations
    this.createStations()

    // Setup camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // Setup controls
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D')
    }
    this.interactKey = this.input.keyboard.addKey('E')

    // UI
    this.createUI(width, height)

    // Interaction prompt
    this.interactionPrompt = null
    this.nearbyInteractable = null
  }

  createShipLayout(width, height) {
    // Create ship floor
    const shipWidth = 1200
    const shipHeight = 800

    // Main corridor
    this.add.rectangle(600, 400, 200, 800, 0x333333)

    // Bridge (top)
    const bridge = this.add.rectangle(600, 150, 400, 250, 0x444444)
    this.add.text(600, 150, 'BRIDGE', {
      fontSize: '24px',
      color: COLORS.WARNING,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Engineering (bottom left)
    const engineering = this.add.rectangle(350, 650, 300, 250, 0x444444)
    this.add.text(350, 650, 'ENGINEERING', {
      fontSize: '20px',
      color: COLORS.WARNING
    }).setOrigin(0.5)

    // Medical Bay (bottom right)
    const medbay = this.add.rectangle(850, 650, 300, 250, 0x444444)
    this.add.text(850, 650, 'MEDICAL BAY', {
      fontSize: '20px',
      color: COLORS.WARNING
    }).setOrigin(0.5)

    // Crew Quarters (middle left)
    const quarters = this.add.rectangle(350, 350, 300, 200, 0x444444)
    this.add.text(350, 350, 'CREW QUARTERS', {
      fontSize: '18px',
      color: COLORS.WARNING
    }).setOrigin(0.5)

    // Science Lab (middle right)
    const lab = this.add.rectangle(850, 350, 300, 200, 0x444444)
    this.add.text(850, 350, 'SCIENCE LAB', {
      fontSize: '18px',
      color: COLORS.WARNING
    }).setOrigin(0.5)

    // Add walls
    this.walls = this.physics.add.staticGroup()

    // Outer walls
    this.walls.create(600, 25, null).setSize(shipWidth, 50).refreshBody()
    this.walls.create(600, 775, null).setSize(shipWidth, 50).refreshBody()
    this.walls.create(25, 400, null).setSize(50, shipHeight).refreshBody()
    this.walls.create(1175, 400, null).setSize(50, shipHeight).refreshBody()

    // Interior walls
    this.addWalls()
  }

  addWalls() {
    // Add interior walls to separate rooms
    // This creates a realistic ship layout with corridors
  }

  createPlayer(x, y) {
    // Player representation
    const player = this.add.circle(x, y, 15, 0x00AAFF)
    this.physics.add.existing(player)
    player.body.setCollideWorldBounds(true)

    // Add player indicator
    const arrow = this.add.triangle(x, y - 20, 0, 10, 10, 0, 20, 10, 0xFFFFFF)
    player.arrow = arrow

    return player
  }

  createCrewMembers() {
    this.crewSprites = []
    const crew = this.gameState.crewSystem.getLivingCrew()

    // Position crew in different rooms
    const positions = [
      { x: 600, y: 120, location: 'Bridge' },
      { x: 350, y: 620, location: 'Engineering' },
      { x: 850, y: 620, location: 'Medical Bay' },
      { x: 350, y: 330, location: 'Crew Quarters' },
      { x: 850, y: 330, location: 'Science Lab' },
      { x: 600, y: 180, location: 'Bridge' }
    ]

    crew.forEach((member, i) => {
      if (i >= positions.length) return

      const pos = positions[i]
      const sprite = this.createCrewSprite(pos.x, pos.y, member)
      sprite.crewData = member
      sprite.location = pos.location
      this.crewSprites.push(sprite)
    })
  }

  createCrewSprite(x, y, crewMember) {
    // Create crew member visual
    const sprite = this.add.container(x, y)

    // Body
    const body = this.add.circle(0, 0, 12, this.getCrewColor(crewMember))
    sprite.add(body)

    // Name label
    const name = this.add.text(0, 20, crewMember.name.split(' ')[0], {
      fontSize: '10px',
      color: '#FFFFFF'
    }).setOrigin(0.5)
    sprite.add(name)

    // Health indicator
    const healthBar = this.add.rectangle(-10, -15, 20, 3, 0x00FF00)
    healthBar.width = 20 * (crewMember.health / 100)
    sprite.add(healthBar)

    this.physics.add.existing(sprite)
    sprite.body.setCircle(12)
    sprite.body.setImmovable(true)

    return sprite
  }

  getCrewColor(crewMember) {
    if (crewMember.health < 30) return 0xFF0000
    if (crewMember.morale < 30) return 0xFFAA00
    return 0x00FF88
  }

  createStations() {
    this.stations = []

    // Bridge console
    const bridgeConsole = this.createStation(600, 100, 'NAVIGATION\n[E]', () => {
      this.openNavigationInterface()
    })
    this.stations.push(bridgeConsole)

    // Engineering console
    const engConsole = this.createStation(350, 600, 'REPAIRS\n[E]', () => {
      this.openRepairInterface()
    })
    this.stations.push(engConsole)

    // Medical console
    const medConsole = this.createStation(850, 600, 'MEDICAL\n[E]', () => {
      this.openMedicalInterface()
    })
    this.stations.push(medConsole)

    // Science console
    const sciConsole = this.createStation(850, 300, 'RESEARCH\n[E]', () => {
      this.openResearchInterface()
    })
    this.stations.push(sciConsole)
  }

  createStation(x, y, label, callback) {
    const station = this.add.container(x, y)

    const console = this.add.rectangle(0, 0, 40, 40, 0x666666)
    console.setStrokeStyle(2, 0x00AAFF)
    station.add(console)

    const text = this.add.text(0, -30, label, {
      fontSize: '12px',
      color: COLORS.TEXT,
      align: 'center'
    }).setOrigin(0.5)
    station.add(text)

    this.physics.add.existing(station)
    station.body.setSize(40, 40)
    station.body.setImmovable(true)

    station.callback = callback
    station.interactable = true

    return station
  }

  createUI(width, height) {
    // Back button
    const backBtn = this.add.rectangle(100, height - 50, 150, 40, COLORS.DANGER)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })

    const backLabel = this.add.text(100, height - 50, 'EXIT SHIP', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0)

    backBtn.on('pointerdown', () => {
      this.scene.start(this.returnScene, this.returnData)
    })

    // Instructions
    this.add.text(width - 200, height - 50, 'WASD/Arrows: Move\nE: Interact', {
      fontSize: '12px',
      color: COLORS.TEXT,
      align: 'right'
    }).setOrigin(1, 0.5).setScrollFactor(0)

    // Ship status panel
    this.createStatusPanel(width, height)
  }

  createStatusPanel(width, height) {
    const panel = this.add.rectangle(width - 200, 80, 350, 140, 0x000000, 0.7)
      .setScrollFactor(0)
      .setStrokeStyle(2, COLORS.WARNING)

    this.add.text(width - 200, 30, 'SHIP STATUS', {
      fontSize: '16px',
      color: COLORS.WARNING,
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0)

    const status = this.gameState.shipSystem.getShipStatus()

    this.statusTexts = []

    this.statusTexts.push(this.add.text(width - 360, 50, `Integrity: ${status.integrity}%`, {
      fontSize: '12px',
      color: this.getIntegrityColor(status.integrity)
    }).setScrollFactor(0))

    this.statusTexts.push(this.add.text(width - 360, 70, `Crew: ${this.gameState.crewSystem.getLivingCrew().length}/${this.gameState.crewSystem.crewHistory.length}`, {
      fontSize: '12px',
      color: COLORS.TEXT
    }).setScrollFactor(0))

    this.statusTexts.push(this.add.text(width - 360, 90, `Morale: ${this.gameState.crewSystem.getAverageMorale()}%`, {
      fontSize: '12px',
      color: this.getMoraleColor(this.gameState.crewSystem.getAverageMorale())
    }).setScrollFactor(0))

    this.statusTexts.push(this.add.text(width - 360, 110, `Damaged Modules: ${status.damagedModules}`, {
      fontSize: '12px',
      color: status.damagedModules > 0 ? COLORS.DANGER : COLORS.SUCCESS
    }).setScrollFactor(0))
  }

  update() {
    if (!this.player) return

    // Player movement
    const speed = 200
    let velocityX = 0
    let velocityY = 0

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -speed
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = speed
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -speed
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = speed
    }

    this.player.body.setVelocity(velocityX, velocityY)

    // Update arrow position
    if (this.player.arrow) {
      this.player.arrow.setPosition(this.player.x, this.player.y - 20)
    }

    // Check for nearby interactables
    this.checkInteractions()

    // Animate crew members
    this.animateCrewMembers()
  }

  checkInteractions() {
    let nearestInteractable = null
    let minDistance = 80

    // Check stations
    this.stations.forEach(station => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        station.x, station.y
      )

      if (distance < minDistance) {
        nearestInteractable = station
        minDistance = distance
      }
    })

    // Check crew members
    this.crewSprites.forEach(crew => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        crew.x, crew.y
      )

      if (distance < minDistance) {
        nearestInteractable = crew
        minDistance = distance
      }
    })

    if (nearestInteractable !== this.nearbyInteractable) {
      this.nearbyInteractable = nearestInteractable
      this.updateInteractionPrompt()
    }

    // Handle interaction input
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearbyInteractable) {
      this.interact(this.nearbyInteractable)
    }
  }

  updateInteractionPrompt() {
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy()
      this.interactionPrompt = null
    }

    if (this.nearbyInteractable) {
      const text = this.nearbyInteractable.crewData
        ? `[E] Talk to ${this.nearbyInteractable.crewData.name}`
        : `[E] Interact`

      this.interactionPrompt = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 100,
        text,
        {
          fontSize: '16px',
          color: COLORS.SUCCESS,
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4
        }
      ).setOrigin(0.5).setScrollFactor(0)
    }
  }

  interact(interactable) {
    if (interactable.crewData) {
      // Talk to crew member
      this.talkToCrew(interactable.crewData)
    } else if (interactable.callback) {
      // Use station
      interactable.callback()
    }
  }

  talkToCrew(crewMember) {
    const dialogues = this.generateCrewDialogue(crewMember)

    this.showDialogue(crewMember.name, dialogues[Math.floor(Math.random() * dialogues.length)])
  }

  generateCrewDialogue(crewMember) {
    const dialogues = []

    if (crewMember.health < 50) {
      dialogues.push("I'm not feeling well, Captain. Maybe I should visit medical bay.")
    }

    if (crewMember.morale < 40) {
      dialogues.push("I don't know how much longer I can keep doing this...")
    } else if (crewMember.morale > 70) {
      dialogues.push("Things are looking up! I think we might actually make it, Captain.")
    }

    if (crewMember.skill === 'engineer') {
      dialogues.push(`The ship is at ${this.gameState.shipSystem.totalIntegrity}% integrity. I'm doing my best to keep her running.`)
    } else if (crewMember.skill === 'pilot') {
      dialogues.push(`We've traveled ${this.gameState.visitedSystems.length} systems so far. Still searching for home.`)
    } else if (crewMember.skill === 'medic') {
      dialogues.push(`The crew's overall health is ${this.gameState.crewSystem.getLivingCrew().reduce((sum, c) => sum + c.health, 0) / this.gameState.crewSystem.getLivingCrew().length}%. Could be better.`)
    }

    if (dialogues.length === 0) {
      dialogues.push("Hello, Captain. Just doing my duty.")
    }

    return dialogues
  }

  showDialogue(speaker, text) {
    const dialogueBox = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 150)
      .setScrollFactor(0)

    const bg = this.add.rectangle(0, 0, 600, 100, 0x000000, 0.9)
    bg.setStrokeStyle(2, COLORS.SUCCESS)
    dialogueBox.add(bg)

    const nameText = this.add.text(-280, -35, speaker, {
      fontSize: '14px',
      color: COLORS.SUCCESS,
      fontStyle: 'bold'
    })
    dialogueBox.add(nameText)

    const dialogueText = this.add.text(-280, -10, text, {
      fontSize: '12px',
      color: COLORS.TEXT,
      wordWrap: { width: 550 }
    })
    dialogueBox.add(dialogueText)

    const closeBtn = this.add.text(280, 35, '[Close]', {
      fontSize: '12px',
      color: COLORS.WARNING
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true })
    dialogueBox.add(closeBtn)

    closeBtn.on('pointerdown', () => {
      dialogueBox.destroy()
    })

    // Auto close after 5 seconds
    this.time.delayedCall(5000, () => {
      if (dialogueBox.active) {
        dialogueBox.destroy()
      }
    })
  }

  openNavigationInterface() {
    this.showMessage('Navigation: Return to galaxy map to plot course.')
    this.time.delayedCall(1500, () => {
      this.scene.start('MapScene', { gameState: this.gameState })
    })
  }

  openRepairInterface() {
    const damaged = this.gameState.shipSystem.getDamagedModules()

    if (damaged.length === 0) {
      this.showMessage('All systems operational!')
      return
    }

    const materials = this.gameState.resources.materials

    if (materials >= 50) {
      const result = this.gameState.shipSystem.autoRepairAll(materials)
      this.showMessage(`Repaired ${result.repaired.length} modules using ${result.materialsUsed} materials.`)
      this.refreshStatusPanel()
    } else {
      this.showMessage('Insufficient materials for repairs. Need 50 materials.')
    }
  }

  openMedicalInterface() {
    const injured = this.gameState.crewSystem.getLivingCrew().filter(c => c.health < 100)

    if (injured.length === 0) {
      this.showMessage('All crew members are healthy!')
      return
    }

    // Heal all injured crew
    injured.forEach(crew => {
      crew.modifyHealth(50, 'Medical treatment')
    })

    this.showMessage(`Treated ${injured.length} crew members. Health improved.`)
  }

  openResearchInterface() {
    const tech = this.gameState.resources.technology

    if (tech < 30) {
      this.showMessage('Insufficient technology points. Need 30 tech to research.')
      return
    }

    this.showMessage('Research initiated. Technology bonus applied to all systems!')
    this.gameState.modifyResource('technology', -30)
  }

  showMessage(text) {
    const message = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, {
      fontSize: '18px',
      color: COLORS.SUCCESS,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5).setScrollFactor(0).setAlpha(0)

    this.tweens.add({
      targets: message,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1500,
      onComplete: () => message.destroy()
    })
  }

  animateCrewMembers() {
    // Make crew members look busy
    this.crewSprites.forEach(crew => {
      // Subtle idle animation
      if (!crew.animating && Math.random() < 0.01) {
        crew.animating = true
        this.tweens.add({
          targets: crew,
          y: crew.y - 5,
          duration: 500,
          yoyo: true,
          onComplete: () => {
            crew.animating = false
          }
        })
      }
    })
  }

  getIntegrityColor(value) {
    if (value < 30) return COLORS.DANGER
    if (value < 60) return COLORS.WARNING
    return COLORS.SUCCESS
  }

  getMoraleColor(value) {
    if (value < 30) return COLORS.DANGER
    if (value < 60) return COLORS.WARNING
    return COLORS.SUCCESS
  }

  refreshStatusPanel() {
    // Refresh status texts
    const status = this.gameState.shipSystem.getShipStatus()

    this.statusTexts[0].setText(`Integrity: ${status.integrity}%`)
    this.statusTexts[0].setColor(this.getIntegrityColor(status.integrity))

    this.statusTexts[3].setText(`Damaged Modules: ${status.damagedModules}`)
    this.statusTexts[3].setColor(status.damagedModules > 0 ? COLORS.DANGER : COLORS.SUCCESS)
  }
}
