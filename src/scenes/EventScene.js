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

    // Event panel - adjusted for better visibility
    const panelWidth = 1000
    const panelHeight = 560
    const panel = this.add.rectangle(width / 2, height / 2 - 10, panelWidth, panelHeight, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.95)
    panel.setStrokeStyle(3, parseInt(COLORS.PRIMARY.replace('#', '0x')))

    // Title with glow effect
    const title = this.add.text(width / 2, 130, this.event.title, {
      fontSize: '34px',
      fontFamily: 'Arial',
      color: COLORS.PRIMARY,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    // Fade in animation
    title.setAlpha(0)
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 600,
      ease: 'Power2'
    })

    // Description with better formatting
    const desc = this.add.text(width / 2, 210, this.event.description, {
      fontSize: '17px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      wordWrap: { width: panelWidth - 120 },
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5, 0)

    // Fade in description
    desc.setAlpha(0)
    this.tweens.add({
      targets: desc,
      alpha: 1,
      duration: 600,
      delay: 300,
      ease: 'Power2'
    })

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
    const startY = 395

    const availableChoices = this.eventSystem.getAvailableChoices(this.event)

    availableChoices.forEach((choiceData, index) => {
      const y = startY + (index * 70)
      const choice = this.event.choices[choiceData.index]

      // Choice number and text
      const choiceText = `${index + 1}. ${choice.text}`

      // Create button background
      const buttonBg = this.add.rectangle(width / 2, y, 920, 58,
        choiceData.available ? parseInt(COLORS.UI_BG.replace('#', '0x')) : 0x1a1a1a)
      buttonBg.setStrokeStyle(2, choiceData.available ? parseInt(COLORS.PRIMARY.replace('#', '0x')) : 0x444444)

      const button = this.add.text(width / 2, y, choiceText, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: choiceData.available ? COLORS.TEXT : '#666666',
        wordWrap: { width: 880 },
        align: 'center'
      }).setOrigin(0.5)

      // Fade in with stagger
      button.setAlpha(0)
      buttonBg.setAlpha(0)
      this.tweens.add({
        targets: [button, buttonBg],
        alpha: 1,
        duration: 400,
        delay: 600 + (index * 150),
        ease: 'Power2'
      })

      if (choiceData.available) {
        buttonBg.setInteractive({ useHandCursor: true })

        buttonBg.on('pointerover', () => {
          buttonBg.setFillStyle(parseInt(COLORS.PRIMARY.replace('#', '0x')), 0.3)
          button.setColor(COLORS.PRIMARY)
          this.tweens.add({
            targets: [buttonBg, button],
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 150,
            ease: 'Back.easeOut'
          })
        })

        buttonBg.on('pointerout', () => {
          buttonBg.setFillStyle(parseInt(COLORS.UI_BG.replace('#', '0x')))
          button.setColor(COLORS.TEXT)
          this.tweens.add({
            targets: [buttonBg, button],
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Back.easeIn'
          })
        })

        buttonBg.on('pointerdown', () => {
          // Visual feedback
          this.cameras.main.flash(150, 100, 200, 255, false)

          // Disable all buttons
          this.children.list.forEach(child => {
            if (child.input) child.disableInteractive()
          })

          // Show selection with delay
          this.time.delayedCall(200, () => {
            this.onChoiceSelected(choiceData.index)
          })
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

    // Outcome panel - adjusted size and position
    const panel = this.add.rectangle(width / 2, height / 2 - 20, 900, 420, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.95)
    panel.setStrokeStyle(3, parseInt(COLORS.SUCCESS.replace('#', '0x')))

    // Title
    this.add.text(width / 2, height / 2 - 220, 'OUTCOME', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: COLORS.SUCCESS,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    // Outcome text with better layout
    this.add.text(width / 2, height / 2 - 120, result.text, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      wordWrap: { width: 820 },
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5, 0)

    // Effects applied - positioned carefully
    if (result.effectsApplied && result.effectsApplied.length > 0) {
      const effectsText = result.effectsApplied.join('\n')
      this.add.text(width / 2, height / 2 + 40, effectsText, {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: COLORS.WARNING,
        align: 'center',
        lineSpacing: 5
      }).setOrigin(0.5, 0)
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

    // Continue button - clearly visible below panel
    const btnY = height / 2 + 220
    const button = this.add.rectangle(width / 2, btnY, 250, 55, parseInt(COLORS.SUCCESS.replace('#', '0x')))
    button.setStrokeStyle(3, 0xFFFFFF)
    button.setInteractive({ useHandCursor: true })
    button.setDepth(100)

    const buttonLabel = this.add.text(width / 2, btnY, 'CONTINUE ►', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100)

    // Pulsing animation to make it clear
    this.tweens.add({
      targets: [button, buttonLabel],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    button.on('pointerover', () => {
      button.setFillStyle(parseInt(COLORS.PRIMARY.replace('#', '0x')))
      this.tweens.killTweensOf([button, buttonLabel])
      this.tweens.add({
        targets: [button, buttonLabel],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      })
    })

    button.on('pointerout', () => {
      button.setFillStyle(parseInt(COLORS.SUCCESS.replace('#', '0x')))
      this.tweens.add({
        targets: [button, buttonLabel],
        scaleX: 1,
        scaleY: 1,
        duration: 100
      })
    })

    button.on('pointerdown', () => {
      // Flash effect for feedback
      this.cameras.main.flash(200, 0, 255, 136, false)

      // Return to map after brief delay
      this.time.delayedCall(300, () => {
        // Handle special effects before returning (combat, missions, etc.)
        if (result.specialEffects && result.specialEffects.length > 0) {
          this.handleSpecialEffects(result.specialEffects)
        } else {
          this.scene.start('MapScene', {
            gameState: this.gameState,
            eventSystem: this.eventSystem
          })
        }
      })
    })
  }

  handleSpecialEffects(specialEffects) {
    // Process special effects that need scene transitions
    const firstEffect = specialEffects[0]

    switch (firstEffect.type) {
      case 'combat':
        // Start combat with specified enemy
        const combat = this.gameState.combatSystem.startCombat(firstEffect.enemy.toUpperCase())
        if (combat) {
          this.scene.start('CombatScene', {
            gameState: this.gameState,
            eventSystem: this.eventSystem,
            combat,
            returnScene: 'MapScene'
          })
        } else {
          console.error('Failed to start combat:', firstEffect.enemy)
          this.scene.start('MapScene', {
            gameState: this.gameState,
            eventSystem: this.eventSystem
          })
        }
        break

      case 'away_mission':
        // TODO: Implement away mission scene when available
        console.log('Away mission triggered:', firstEffect.mission)
        this.scene.start('MapScene', {
          gameState: this.gameState,
          eventSystem: this.eventSystem
        })
        break

      case 'faction_encounter':
        // TODO: Implement faction encounter scene when available
        console.log('Faction encounter triggered:', firstEffect.faction)
        this.scene.start('MapScene', {
          gameState: this.gameState,
          eventSystem: this.eventSystem
        })
        break

      default:
        // Unknown special effect, return to map
        console.warn('Unknown special effect type:', firstEffect.type)
        this.scene.start('MapScene', {
          gameState: this.gameState,
          eventSystem: this.eventSystem
        })
    }
  }
}
