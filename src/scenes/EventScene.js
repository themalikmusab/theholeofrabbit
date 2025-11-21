import Phaser from 'phaser'
import { COLORS } from '../config'

export default class EventScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EventScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0)

    // Event panel
    const panel = this.add.rectangle(width / 2, height / 2, 900, 600, 0x1a1a2e).setOrigin(0.5)
    panel.setStrokeStyle(2, parseInt(COLORS.PRIMARY.replace('#', '0x')))

    // Title
    this.add.text(width / 2, 150, 'EVENT SYSTEM', {
      font: 'bold 36px monospace',
      fill: COLORS.PRIMARY
    }).setOrigin(0.5)

    // Placeholder text
    this.add.text(width / 2, height / 2, 'EVENT DIALOGUE\n(Coming in Phase 2)', {
      font: '30px monospace',
      fill: COLORS.TEXT,
      align: 'center',
      alpha: 0.7
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 100, 'This will show:\n• Story events with choices\n• Branching narrative\n• Consequences and outcomes\n• Character interactions', {
      font: '16px monospace',
      fill: COLORS.SECONDARY,
      align: 'center',
      alpha: 0.6
    }).setOrigin(0.5)

    // Back button
    this.createBackButton()
  }

  createBackButton() {
    const width = this.cameras.main.width
    const backBtn = this.add.text(width / 2, 600, 'Continue →', {
      font: '24px monospace',
      fill: COLORS.TEXT,
      backgroundColor: COLORS.UI_BG,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive()

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
