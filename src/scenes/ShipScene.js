import Phaser from 'phaser'
import { COLORS } from '../config'
import Visual3DSystem from '../systems/Visual3DSystem'

export default class ShipScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShipScene' })
  }

  init(data) {
    this.gameState = data.gameState
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 3D Background
    this.visual3D = new Visual3DSystem(this)
    this.starfield = this.visual3D.create3DStarfield(width, height, 200)
    this.depthFog = this.visual3D.createDepthFog(width, height)
    this.depthFog.setAlpha(0.3)

    // Title
    this.add.text(width / 2, 40, 'SHIP MANAGEMENT', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: COLORS.PRIMARY,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Ship visual
    const shipX = width / 2
    const shipY = height / 2 - 50
    const ship3D = this.visual3D.createIsometricShip(shipX, shipY, 150, 0x00AAFF)
    const shipLight = this.visual3D.createLight(shipX, shipY - 60, 80, 0x00DDFF, 0.6)

    // Pulsing animation
    this.tweens.add({
      targets: [shipLight],
      alpha: 0.3,
      duration: 2000,
      yoyo: true,
      repeat: -1
    })

    // Create interactive buttons
    this.createManagementButtons(width, height)

    // Back button
    this.createBackButton(width, height)
  }

  createManagementButtons(width, height) {
    const buttonY = height / 2 + 140
    const spacing = 220

    // Research & Development
    this.createButton(width / 2 - spacing, buttonY, '🔬 RESEARCH', () => {
      this.scene.start('ResearchScene', {
        gameState: this.gameState,
        returnScene: 'ShipScene'
      })
    }, COLORS.PRIMARY)

    // Ship Interior
    this.createButton(width / 2, buttonY, '🚪 SHIP INTERIOR', () => {
      this.scene.start('ShipInteriorScene', { gameState: this.gameState })
    }, 0x00AA88)

    // Systems Status
    this.createButton(width / 2 + spacing, buttonY, '⚙️ SYSTEMS', () => {
      this.showSystemsStatus()
    }, 0xAA8800)
  }

  createButton(x, y, text, callback, color) {
    const btn = this.add.rectangle(x, y, 200, 50, color, 0.3)
    btn.setStrokeStyle(2, color)
    btn.setInteractive({ useHandCursor: true })

    const label = this.add.text(x, y, text, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    btn.on('pointerover', () => {
      btn.setFillStyle(color, 0.6)
      this.tweens.add({
        targets: [btn, label],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Back.easeOut'
      })
    })

    btn.on('pointerout', () => {
      btn.setFillStyle(color, 0.3)
      this.tweens.add({
        targets: [btn, label],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Back.easeIn'
      })
    })

    btn.on('pointerdown', callback)

    return { btn, label }
  }

  showSystemsStatus() {
    // Show popup with ship systems status
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    if (this.statusPanel) this.statusPanel.destroy()

    this.statusPanel = this.add.container(width / 2, height / 2)

    const bg = this.add.rectangle(0, 0, 500, 400, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.95)
    bg.setStrokeStyle(3, parseInt(COLORS.PRIMARY.replace('#', '0x')))
    this.statusPanel.add(bg)

    const title = this.add.text(0, -180, '⚙️ SHIP SYSTEMS STATUS', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: COLORS.PRIMARY,
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.statusPanel.add(title)

    let yPos = -130
    const modules = this.gameState.shipSystem.getAllModules()
    modules.forEach(module => {
      const healthPercent = Math.floor((module.health / module.maxHealth) * 100)
      const healthColor = healthPercent > 70 ? COLORS.SUCCESS : (healthPercent > 30 ? COLORS.WARNING : COLORS.DANGER)

      const line = this.add.text(-220, yPos, `${module.name}: ${healthPercent}% | Tier ${module.upgradeTier}`, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: healthColor
      })
      this.statusPanel.add(line)
      yPos += 30
    })

    // Research bonuses
    if (this.gameState.researchSystem.completedResearch.length > 0) {
      yPos += 10
      const researchTitle = this.add.text(-220, yPos, 'RESEARCH BONUSES:', {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: COLORS.WARNING,
        fontStyle: 'bold'
      })
      this.statusPanel.add(researchTitle)
      yPos += 25

      const completed = this.gameState.researchSystem.completedResearch.slice(0, 3)
      completed.forEach(techId => {
        const line = this.add.text(-220, yPos, `• ${techId}`, {
          fontSize: '12px',
          fontFamily: 'monospace',
          color: COLORS.TEXT
        })
        this.statusPanel.add(line)
        yPos += 20
      })
    }

    // Close button
    const closeBtn = this.add.rectangle(0, 170, 150, 40, parseInt(COLORS.UI_BG.replace('#', '0x')))
    closeBtn.setStrokeStyle(2, parseInt(COLORS.UI_BORDER.replace('#', '0x')))
    closeBtn.setInteractive({ useHandCursor: true })
    this.statusPanel.add(closeBtn)

    const closeLabel = this.add.text(0, 170, 'CLOSE', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.statusPanel.add(closeLabel)

    closeBtn.on('pointerdown', () => {
      this.statusPanel.destroy()
      this.statusPanel = null
    })

    this.statusPanel.setDepth(1000)
  }

  createBackButton(width, height) {
    const backBtn = this.add.rectangle(width / 2, height - 40, 200, 40, parseInt(COLORS.UI_BG.replace('#', '0x')))
    backBtn.setStrokeStyle(2, parseInt(COLORS.UI_BORDER.replace('#', '0x')))
    backBtn.setInteractive({ useHandCursor: true })

    const backLabel = this.add.text(width / 2, height - 40, '← BACK TO MAP', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    backBtn.on('pointerover', () => {
      backBtn.setFillStyle(parseInt(COLORS.PRIMARY.replace('#', '0x')), 0.3)
    })

    backBtn.on('pointerout', () => {
      backBtn.setFillStyle(parseInt(COLORS.UI_BG.replace('#', '0x')))
    })

    backBtn.on('pointerdown', () => {
      this.scene.start('MapScene', { gameState: this.gameState })
    })
  }
}
