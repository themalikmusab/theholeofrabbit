// TutorialScene - Interactive guided tutorial/demo
import Phaser from 'phaser'
import { COLORS } from '../config'

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' })
  }

  init(data) {
    this.gameState = data.gameState
    this.tutorialSystem = this.gameState.tutorialSystem
    this.returnToMenu = data.returnToMenu || false
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background with stars
    this.createBackground(width, height)

    // Main tutorial panel
    this.createTutorialPanel(width, height)

    // Progress bar
    this.createProgressBar(width, height)

    // Show current step
    this.showCurrentStep()
  }

  createBackground(width, height) {
    // Starfield background
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = 1 + Math.random() * 2
      const alpha = 0.3 + Math.random() * 0.7

      const star = this.add.circle(x, y, size, 0xFFFFFF, alpha)

      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      })
    }

    // Animated title
    this.add.text(width / 2, 50, 'INTERACTIVE TUTORIAL', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: COLORS.WARNING,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5)

    const subtitle = this.add.text(width / 2, 95, 'Learn everything about THE LAST VOYAGE', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Pulse animation
    this.tweens.add({
      targets: subtitle,
      alpha: 0.6,
      duration: 1500,
      yoyo: true,
      repeat: -1
    })
  }

  createTutorialPanel(width, height) {
    // Main content panel
    this.contentPanel = this.add.container(width / 2, height / 2)

    // Background
    const panelBg = this.add.rectangle(0, 0, 900, 450, 0x000000, 0.85)
    panelBg.setStrokeStyle(3, COLORS.SUCCESS)
    this.contentPanel.add(panelBg)

    // Title area
    this.stepTitle = this.add.text(0, -180, '', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: COLORS.SUCCESS,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 850 }
    }).setOrigin(0.5)
    this.contentPanel.add(this.stepTitle)

    // Description area with scroll
    this.stepDescription = this.add.text(0, -50, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      align: 'left',
      lineSpacing: 8,
      wordWrap: { width: 850 }
    }).setOrigin(0.5, 0)
    this.contentPanel.add(this.stepDescription)

    // Action hint
    this.actionHint = this.add.text(0, 180, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: COLORS.WARNING,
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5)
    this.contentPanel.add(this.actionHint)

    // Animated pointer
    this.pointer = this.add.text(0, 165, '▼', {
      fontSize: '24px',
      color: COLORS.WARNING
    }).setOrigin(0.5)
    this.contentPanel.add(this.pointer)

    this.tweens.add({
      targets: this.pointer,
      y: 170,
      duration: 500,
      yoyo: true,
      repeat: -1
    })
  }

  createProgressBar(width, height) {
    // Progress display
    const progress = this.tutorialSystem.getProgress()

    const progressBg = this.add.rectangle(width / 2, height - 60, 600, 30, 0x333333)
    progressBg.setStrokeStyle(2, COLORS.WARNING)

    this.progressBar = this.add.rectangle(width / 2 - 300, height - 60, 0, 26, COLORS.SUCCESS)
    this.progressBar.setOrigin(0, 0.5)

    this.progressText = this.add.text(width / 2, height - 60, `Step ${progress.current + 1}/${progress.total}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.updateProgressBar()

    // Skip button
    const skipBtn = this.add.rectangle(width - 100, height - 60, 150, 40, COLORS.DANGER)
      .setStrokeStyle(2, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })

    const skipLabel = this.add.text(width - 100, height - 60, 'SKIP TUTORIAL', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    skipBtn.on('pointerover', () => {
      this.tweens.add({ targets: skipBtn, scale: 1.05, duration: 100 })
    })

    skipBtn.on('pointerout', () => {
      this.tweens.add({ targets: skipBtn, scale: 1, duration: 100 })
    })

    skipBtn.on('pointerdown', () => {
      this.skipTutorial()
    })
  }

  showCurrentStep() {
    const step = this.tutorialSystem.getCurrentStep()
    if (!step) {
      this.completeTutorial()
      return
    }

    // Fade in animation
    this.contentPanel.setAlpha(0)
    this.tweens.add({
      targets: this.contentPanel,
      alpha: 1,
      duration: 500
    })

    // Update content
    this.stepTitle.setText(step.title)
    this.stepDescription.setText(step.description)
    this.actionHint.setText(step.action)

    // Create continue button
    if (this.continueBtn) {
      this.continueBtn.destroy()
      this.continueLbl.destroy()
    }

    const btnText = step.next === 'complete' ? 'START GAME!' : 'CONTINUE'
    const btnColor = step.next === 'complete' ? COLORS.SUCCESS : COLORS.WARNING

    this.continueBtn = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 140,
      200, 50, btnColor
    ).setStrokeStyle(3, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })

    this.continueLbl = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 140,
      btnText,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5)

    this.continueBtn.on('pointerover', () => {
      this.tweens.add({ targets: [this.continueBtn, this.continueLbl], scale: 1.1, duration: 100 })
    })

    this.continueBtn.on('pointerout', () => {
      this.tweens.add({ targets: [this.continueBtn, this.continueLbl], scale: 1, duration: 100 })
    })

    this.continueBtn.on('pointerdown', () => {
      this.nextStep()
    })

    // Add visual examples based on step
    this.showStepVisuals(step)

    // Update progress
    this.updateProgressBar()
  }

  showStepVisuals(step) {
    // Clear previous visuals
    if (this.visualsContainer) {
      this.visualsContainer.destroy()
    }

    this.visualsContainer = this.add.container(0, 0)

    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Show visual examples for different steps
    switch (step.id) {
      case 'crew_intro':
        this.showCrewExample()
        break

      case 'resources':
        this.showResourceExample()
        break

      case 'combat_intro':
        this.showCombatExample()
        break

      case 'ship_systems':
        this.showShipExample()
        break

      case 'factions':
        this.showFactionExample()
        break
    }
  }

  showCrewExample() {
    const x = 150
    const y = 200

    // Show a mini crew member
    const crewCircle = this.add.circle(x, y, 20, 0x00FF88)
    const crewName = this.add.text(x, y + 35, 'Dr. Webb\nEngineer', {
      fontSize: '10px',
      color: COLORS.TEXT,
      align: 'center'
    }).setOrigin(0.5)

    // Health bar
    const healthBg = this.add.rectangle(x, y - 25, 40, 4, 0x333333)
    const healthBar = this.add.rectangle(x - 20, y - 25, 32, 4, 0x00FF00).setOrigin(0, 0.5)

    // Morale indicator
    const moraleText = this.add.text(x, y - 35, '😊 75%', {
      fontSize: '8px',
      color: COLORS.SUCCESS
    }).setOrigin(0.5)

    this.visualsContainer.add([crewCircle, crewName, healthBg, healthBar, moraleText])
  }

  showResourceExample() {
    const startX = 150
    const y = 220

    const resources = [
      { name: 'FUEL', value: '100', color: COLORS.WARNING, icon: '⛽' },
      { name: 'FOOD', value: '150', color: COLORS.SUCCESS, icon: '🍖' },
      { name: 'MATERIALS', value: '80', color: COLORS.TEXT, icon: '🔧' }
    ]

    resources.forEach((res, i) => {
      const x = startX + (i * 120)

      const icon = this.add.text(x, y - 20, res.icon, {
        fontSize: '24px'
      }).setOrigin(0.5)

      const name = this.add.text(x, y + 10, res.name, {
        fontSize: '10px',
        color: res.color,
        fontStyle: 'bold'
      }).setOrigin(0.5)

      const value = this.add.text(x, y + 25, res.value, {
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      this.visualsContainer.add([icon, name, value])
    })
  }

  showCombatExample() {
    const x = 200
    const y = 220

    // Player ship
    const playerShip = this.add.circle(x - 80, y, 15, 0x00AAFF)
    const playerLabel = this.add.text(x - 80, y + 25, 'YOU', {
      fontSize: '10px',
      color: COLORS.SUCCESS
    }).setOrigin(0.5)

    // Enemy ship
    const enemyShip = this.add.circle(x + 80, y, 15, 0xFF3333)
    const enemyLabel = this.add.text(x + 80, y + 25, 'ENEMY', {
      fontSize: '10px',
      color: COLORS.DANGER
    }).setOrigin(0.5)

    // Combat actions
    const actions = ['⚔️ ATTACK', '🛡️ DEFEND', '🏃 EVADE']
    actions.forEach((action, i) => {
      const actionText = this.add.text(x - 60, y + 50 + (i * 18), action, {
        fontSize: '9px',
        color: COLORS.WARNING
      })
      this.visualsContainer.add(actionText)
    })

    this.visualsContainer.add([playerShip, playerLabel, enemyShip, enemyLabel])
  }

  showShipExample() {
    const x = 180
    const y = 200

    // Ship outline
    const ship = this.add.rectangle(x, y, 60, 80, 0x444444)
    ship.setStrokeStyle(2, COLORS.SUCCESS)

    // Modules
    const modules = [
      { name: 'Hull', y: y - 30, status: '100%', color: COLORS.SUCCESS },
      { name: 'Engines', y: y - 10, status: '85%', color: COLORS.WARNING },
      { name: 'Shields', y: y + 10, status: '60%', color: COLORS.WARNING },
      { name: 'Weapons', y: y + 30, status: '100%', color: COLORS.SUCCESS }
    ]

    modules.forEach(mod => {
      const text = this.add.text(x + 40, mod.y, `${mod.name}: ${mod.status}`, {
        fontSize: '8px',
        color: mod.color
      })
      this.visualsContainer.add(text)
    })

    this.visualsContainer.add(ship)
  }

  showFactionExample() {
    const x = 150
    const y = 200

    const factions = [
      { name: 'Terra Remnant', rep: 'FRIENDLY', color: 0x4A90E2, icon: '🔵' },
      { name: 'Kryll Empire', rep: 'HOSTILE', color: 0xE74C3C, icon: '🔴' },
      { name: 'Merchant Guild', rep: 'NEUTRAL', color: 0xF39C12, icon: '🟡' }
    ]

    factions.forEach((faction, i) => {
      const yPos = y + (i * 35)

      const icon = this.add.text(x - 30, yPos, faction.icon, {
        fontSize: '16px'
      }).setOrigin(0.5)

      const name = this.add.text(x, yPos - 8, faction.name, {
        fontSize: '10px',
        color: faction.color,
        fontStyle: 'bold'
      })

      const rep = this.add.text(x, yPos + 5, faction.rep, {
        fontSize: '8px',
        color: COLORS.TEXT
      })

      this.visualsContainer.add([icon, name, rep])
    })
  }

  nextStep() {
    // Play sound
    this.playTransitionSound()

    // Fade out
    this.tweens.add({
      targets: this.contentPanel,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        const result = this.tutorialSystem.next()

        if (result.completed) {
          this.completeTutorial()
        } else {
          this.showCurrentStep()
        }
      }
    })
  }

  skipTutorial() {
    this.tutorialSystem.skip()
    this.scene.start('MenuScene', { gameState: this.gameState })
  }

  completeTutorial() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Clear scene
    this.children.removeAll()

    // Completion screen
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9)

    const title = this.add.text(width / 2, height / 2 - 100, '🎉 TUTORIAL COMPLETE! 🎉', {
      fontSize: '42px',
      fontFamily: 'Arial',
      color: COLORS.SUCCESS,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0)

    const message = this.add.text(width / 2, height / 2,
      'You\'ve learned everything you need to survive!\n\nReward: +50 Materials, +25 Technology, +10% Morale\n\nNow begin your journey to save humanity!',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: COLORS.TEXT,
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5).setAlpha(0)

    const startBtn = this.add.rectangle(width / 2, height / 2 + 120, 250, 60, COLORS.SUCCESS)
      .setStrokeStyle(3, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0)

    const startLabel = this.add.text(width / 2, height / 2 + 120, 'START JOURNEY', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0)

    // Fade in animations
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 500
    })

    this.time.delayedCall(300, () => {
      this.tweens.add({
        targets: message,
        alpha: 1,
        duration: 500
      })
    })

    this.time.delayedCall(600, () => {
      this.tweens.add({
        targets: [startBtn, startLabel],
        alpha: 1,
        duration: 500
      })
    })

    startBtn.on('pointerover', () => {
      this.tweens.add({ targets: [startBtn, startLabel], scale: 1.1, duration: 100 })
    })

    startBtn.on('pointerout', () => {
      this.tweens.add({ targets: [startBtn, startLabel], scale: 1, duration: 100 })
    })

    startBtn.on('pointerdown', () => {
      this.scene.start('MenuScene', { gameState: this.gameState })
    })

    // Particle celebration
    this.createCelebrationEffects(width, height)
  }

  createCelebrationEffects(width, height) {
    // Create confetti-like particles
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width
      const particle = this.add.circle(x, -20, 3 + Math.random() * 3,
        Phaser.Display.Color.RandomRGB().color)

      this.tweens.add({
        targets: particle,
        y: height + 50,
        rotation: Math.random() * Math.PI * 4,
        duration: 2000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        onComplete: () => particle.destroy()
      })
    }
  }

  updateProgressBar() {
    const progress = this.tutorialSystem.getProgress()
    const barWidth = (progress.percentage / 100) * 600

    this.tweens.add({
      targets: this.progressBar,
      width: barWidth,
      duration: 300
    })

    this.progressText.setText(`Step ${progress.current + 1}/${progress.total} (${progress.percentage}%)`)
  }

  playTransitionSound() {
    // Simple beep sound using Web Audio API
    if (this.gameState.audioSystem) {
      this.gameState.audioSystem.playSound('button_click')
    }
  }
}
