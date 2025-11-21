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

    const assetText = this.add.text(width / 2, height / 2 + 50, '', {
      font: '12px monospace',
      fill: '#888888'
    }).setOrigin(0.5)

    // Update loading bar
    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%')
      progressBar.clear()
      progressBar.fillStyle(0x00ffff, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
    })

    this.load.on('fileprogress', (file) => {
      assetText.setText('Loading: ' + file.key)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
      assetText.destroy()
    })

    // Load assets here when we have them
    // For now, just a small delay to show the loading screen
    // this.load.image('logo', 'assets/images/logo.png')
  }

  create() {
    console.log('BootScene: Assets loaded, moving to MenuScene')

    // Add a small delay to show the loading complete
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene')
    })
  }
}
