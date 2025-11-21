import Phaser from 'phaser'
import { COLORS } from '../config'

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background
    this.createStarfield()

    // Title
    this.add.text(width / 2, 80, 'GALAXY MAP', {
      font: 'bold 48px monospace',
      fill: COLORS.PRIMARY,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Placeholder text
    this.add.text(width / 2, height / 2, 'GALAXY MAP\n(Coming in Phase 2)', {
      font: '36px monospace',
      fill: COLORS.TEXT,
      align: 'center',
      alpha: 0.7
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 100, 'This will show:\n• Procedural star systems\n• Navigation interface\n• Current position\n• Fuel range indicator', {
      font: '18px monospace',
      fill: COLORS.SECONDARY,
      align: 'center',
      alpha: 0.6
    }).setOrigin(0.5)

    // Back button
    this.createBackButton()
  }

  createStarfield() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const graphics = this.add.graphics()

    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Phaser.Math.Between(1, 2)
      graphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 0.8))
      graphics.fillCircle(x, y, size)
    }
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
