import Phaser from 'phaser'
import { COLORS } from '../config'

export default class ShipScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShipScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background
    this.add.rectangle(0, 0, width, height, 0x000011).setOrigin(0)

    // Title
    this.add.text(width / 2, 80, 'SHIP MANAGEMENT', {
      font: 'bold 48px monospace',
      fill: COLORS.PRIMARY,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Placeholder text
    this.add.text(width / 2, height / 2, 'SHIP STATUS & UPGRADES\n(Coming in Phase 4)', {
      font: '32px monospace',
      fill: COLORS.TEXT,
      align: 'center',
      alpha: 0.7
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 100, 'This will show:\n• Ship modules and upgrades\n• Resource management\n• Crew status\n• Repair and maintenance', {
      font: '18px monospace',
      fill: COLORS.SECONDARY,
      align: 'center',
      alpha: 0.6
    }).setOrigin(0.5)

    // Back button
    this.createBackButton()
  }

  createBackButton() {
    const backBtn = this.add.text(50, 50, '← Back to Menu', {
      font: '20px monospace',
      fill: COLORS.TEXT,
      backgroundColor: COLORS.UI_BG,
      padding: { x: 15, y: 8 }
    }).setInteractive()

    backBtn.on('pointerover', () => {
      backBtn.setStyle({ fill: COLORS.PRIMARY })
    })

    backBtn.on('pointerout', () => {
      backBtn.setStyle({ fill: COLORS.TEXT })
    })

    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene')
    })
  }
}
