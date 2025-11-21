import Phaser from 'phaser'
import { COLORS } from '../config'

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background with stars
    this.createStarfield()

    // Title
    this.add.text(width / 2, height / 3, 'MISSION COMPLETE', {
      font: 'bold 56px monospace',
      fill: COLORS.SUCCESS,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    // Placeholder text
    this.add.text(width / 2, height / 2, 'GAME ENDING\n(Coming in Phase 3)', {
      font: '32px monospace',
      fill: COLORS.TEXT,
      align: 'center',
      alpha: 0.7
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 100, 'This will show:\n• Multiple endings based on choices\n• Final statistics\n• Story epilogue\n• New Game+ option', {
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

    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Phaser.Math.Between(1, 3)
      graphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 1))
      graphics.fillCircle(x, y, size)
    }
  }

  createBackButton() {
    const width = this.cameras.main.width
    const backBtn = this.add.text(width / 2, 600, 'Return to Menu', {
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
