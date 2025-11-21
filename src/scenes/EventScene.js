import Phaser from 'phaser'
import { COLORS } from '../config'
import ResourceDisplay from '../ui/ResourceDisplay'

export default class EventScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EventScene' })
  }

  init(data) {
    this.gameState = data.gameState
    this.eventSystem = data.eventSystem
    this.event = data.event
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0)
    this.createStarfield()

    // Event panel
    const panelWidth = 1000
    const panelHeight = 600
    const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.95)
    panel.setStrokeStyle(3, parseInt(COLORS.PRIMARY.replace('#', '0x')))

    // Title
    this.add.text(width / 2, 140, this.event.title, {
      font: 'bold 36px monospace',
      fill: COLORS.PRIMARY,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5)

    // Description
    this.add.text(width / 2, 230, this.event.description, {
      font: '18px monospace',
      fill: COLORS.TEXT,
      wordWrap: { width: panelWidth - 100 },
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5)

    // Choices
    this.createChoices()

    // Resource display
    this.resourceDisplay = new ResourceDisplay(this, width - 220, 20, this.gameState)
  }

  createStarfield() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const graphics = this.add.graphics()

    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Phaser.Math.Between(1, 2)
      graphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.5))
      graphics.fillCircle(x, y, size)
    }
  }

  createChoices() {
    const width = this.cameras.main.width
    const startY = 400

    const availableChoices = this.eventSystem.getAvailableChoices(this.event)

    availableChoices.forEach((choiceData, index) => {
      const y = startY + (index * 65)
      const choice = this.event.choices[choiceData.index]

      // Choice number and text
      const choiceText = `${index + 1}. ${choice.text}`

      const button = this.add.text(width / 2, y, choiceText, {
        font: '20px monospace',
        fill: choiceData.available ? COLORS.TEXT : '#666666',
        backgroundColor: choiceData.available ? COLORS.UI_BG : '#0a0a0a',
        padding: { x: 25, y: 12 },
        wordWrap: { width: 900 }
      }).setOrigin(0.5)

      if (choiceData.available) {
        button.setInteractive()

        button.on('pointerover', () => {
          button.setStyle({
            fill: COLORS.PRIMARY,
            backgroundColor: '#2a2a3e'
          })
        })

        button.on('pointerout', () => {
          button.setStyle({
            fill: COLORS.TEXT,
            backgroundColor: COLORS.UI_BG
          })
        })

        button.on('pointerdown', () => {
          this.onChoiceSelected(choiceData.index)
        })
      } else {
        // Show requirements
        const reqText = this.formatRequirements(choice.requirements)
        const reqLabel = this.add.text(width / 2, y + 25, reqText, {
          font: '12px monospace',
          fill: COLORS.DANGER,
          alpha: 0.7
        }).setOrigin(0.5)
      }
    })
  }

  formatRequirements(requirements) {
    if (!requirements || requirements.length === 0) return ''

    const reqStrings = requirements.map(req => {
      const current = this.gameState.getResource(req.resource)
      return `Requires ${req.resource}: ${req.value} (You have: ${Math.floor(current)})`
    })

    return reqStrings.join(', ')
  }

  onChoiceSelected(choiceIndex) {
    // Process the choice
    const result = this.eventSystem.processChoice(this.event, choiceIndex)

    if (!result.success) {
      console.error('Choice failed:', result.message)
      return
    }

    // Show outcome
    this.showOutcome(result)
  }

  showOutcome(result) {
    // Clear current scene
    this.children.removeAll()

    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0)
    this.createStarfield()

    // Outcome panel
    const panel = this.add.rectangle(width / 2, height / 2, 900, 500, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.95)
    panel.setStrokeStyle(3, parseInt(COLORS.SUCCESS.replace('#', '0x')))

    // Title
    this.add.text(width / 2, height / 2 - 180, 'OUTCOME', {
      font: 'bold 32px monospace',
      fill: COLORS.SUCCESS
    }).setOrigin(0.5)

    // Outcome text
    this.add.text(width / 2, height / 2 - 80, result.text, {
      font: '20px monospace',
      fill: COLORS.TEXT,
      wordWrap: { width: 800 },
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5)

    // Effects applied
    if (result.effectsApplied && result.effectsApplied.length > 0) {
      const effectsText = result.effectsApplied.join('\n')
      this.add.text(width / 2, height / 2 + 60, effectsText, {
        font: '16px monospace',
        fill: COLORS.WARNING,
        align: 'center'
      }).setOrigin(0.5)
    }

    // Resource display
    this.resourceDisplay = new ResourceDisplay(this, width - 220, 20, this.gameState)

    // Check for game over
    if (result.gameOver) {
      this.time.delayedCall(3000, () => {
        this.scene.start('EndingScene', { gameState: this.gameState })
      })
      return
    }

    // Continue button
    const button = this.add.text(width / 2, height / 2 + 180, 'Continue', {
      font: '28px monospace',
      fill: COLORS.TEXT,
      backgroundColor: COLORS.UI_BG,
      padding: { x: 40, y: 15 }
    }).setOrigin(0.5).setInteractive()

    button.on('pointerover', () => {
      button.setStyle({
        fill: COLORS.PRIMARY,
        backgroundColor: '#2a2a3e'
      })
    })

    button.on('pointerout', () => {
      button.setStyle({
        fill: COLORS.TEXT,
        backgroundColor: COLORS.UI_BG
      })
    })

    button.on('pointerdown', () => {
      // Return to map
      this.scene.start('MapScene', {
        gameState: this.gameState,
        eventSystem: this.eventSystem
      })
    })
  }
}
