// CombatScene - Real-time tactical space combat
import Phaser from 'phaser'
import { COLORS } from '../config'
import VisualEffects from '../systems/VisualEffects'
import { COMBAT_ACTIONS } from '../systems/CombatSystem'

export default class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' })
  }

  init(data) {
    this.gameState = data.gameState
    this.combat = data.combat
    this.returnScene = data.returnScene || 'MapScene'
    this.returnData = data.returnData || {}
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Initialize visual effects
    this.vfx = new VisualEffects(this)

    // Create animated background
    this.createBackground(width, height)

    // Create UI
    this.createUI(width, height)

    // Create ship sprites
    this.createShips(width, height)

    // Start combat log
    this.combatLog = []
    this.logStartY = height - 200
  }

  createBackground(width, height) {
    // Animated starfield with parallax
    this.starfieldLayers = this.vfx.createAnimatedStarfield(width, height)

    // Add nebula background
    this.nebula = this.vfx.createNebulaBackground(width, height, [0x440066, 0x660044, 0x004466])
    this.nebula.setAlpha(0.2)
  }

  createShips(width, height) {
    // Player ship (left side)
    this.playerShip = this.add.circle(width * 0.25, height * 0.5, 30, 0x00AAFF)
    this.playerShipOutline = this.add.circle(width * 0.25, height * 0.5, 32, 0x00DDFF, 0)
    this.playerShipOutline.setStrokeStyle(2, 0x00DDFF)

    // Shield effect for player
    this.playerShield = this.add.circle(width * 0.25, height * 0.5, 50, 0x00AAFF, 0)
    this.playerShield.setStrokeStyle(2, 0x00DDFF, 0.3)

    // Enemy ship (right side)
    const enemy = this.combat.enemy
    this.enemyShip = this.add.circle(width * 0.75, height * 0.5, 35, 0xFF3333)
    this.enemyShipOutline = this.add.circle(width * 0.75, height * 0.5, 37, 0xFF6666, 0)
    this.enemyShipOutline.setStrokeStyle(2, 0xFF6666)

    // Enemy shield
    this.enemyShield = this.add.circle(width * 0.75, height * 0.5, 55, 0xFF3333, 0)
    this.enemyShield.setStrokeStyle(2, 0xFF6666, 0.3)

    // Engine trails
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.playerShip) {
          this.vfx.createEngineTrail(
            this.playerShip.x - 30,
            this.playerShip.y,
            Math.PI,
            0x00DDFF
          )
        }
        if (this.enemyShip) {
          this.vfx.createEngineTrail(
            this.enemyShip.x + 30,
            this.enemyShip.y,
            0,
            0xFF6666
          )
        }
      },
      loop: true
    })
  }

  createUI(width, height) {
    // Title
    const enemy = this.combat.enemy
    this.add.text(width / 2, 40, `COMBAT: ${enemy.name}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: COLORS.DANGER,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Enemy description
    this.add.text(width / 2, 80, enemy.description, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: COLORS.TEXT
    }).setOrigin(0.5)

    // Status panels
    this.createStatusPanel(50, 120, 'YOUR SHIP', true)
    this.createStatusPanel(width - 350, 120, enemy.name, false)

    // Action buttons
    this.createActionButtons(width, height)

    // Turn counter
    this.turnText = this.add.text(width / 2, height - 250, `Turn ${this.combat.turn}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: COLORS.WARNING
    }).setOrigin(0.5)

    // Combat log panel
    this.logPanel = this.add.rectangle(width / 2, height - 100, width - 100, 150, 0x000000, 0.7)
    this.logTitle = this.add.text(width / 2, height - 170, 'COMBAT LOG', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: COLORS.WARNING
    }).setOrigin(0.5)
  }

  createStatusPanel(x, y, title, isPlayer) {
    const panel = this.add.rectangle(x + 150, y + 80, 280, 140, 0x000000, 0.7)
    panel.setStrokeStyle(2, isPlayer ? 0x00AAFF : 0xFF3333)

    this.add.text(x + 150, y, title, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: isPlayer ? 0x00AAFF : 0xFF3333,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    if (isPlayer) {
      // Player status
      this.playerHullText = this.add.text(x + 20, y + 40, `Hull: ${this.combat.playerHull}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: COLORS.TEXT
      })

      this.playerShieldText = this.add.text(x + 20, y + 65, `Shields: ${this.combat.playerShields}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: COLORS.TEXT
      })

      this.playerWeaponsText = this.add.text(x + 20, y + 90, `Weapons: ${this.combat.playerWeapons}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: COLORS.TEXT
      })

      // Crew skills
      const securityBonus = this.gameState.crewSystem.getSkillBonus('security')
      this.add.text(x + 20, y + 115, `Combat Skill: +${Math.floor(securityBonus * 100)}%`, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: COLORS.SUCCESS
      })
    } else {
      // Enemy status
      this.enemyHullText = this.add.text(x + 20, y + 40, `Hull: ${Math.floor(this.combat.enemy.hull)}/${this.combat.enemy.maxHull}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: COLORS.TEXT
      })

      this.enemyShieldText = this.add.text(x + 20, y + 65, `Shields: ${Math.floor(this.combat.enemy.shields)}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: COLORS.TEXT
      })

      this.enemyWeaponsText = this.add.text(x + 20, y + 90, `Weapons: ${this.combat.enemy.weapons}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: COLORS.TEXT
      })

      this.add.text(x + 20, y + 115, `Evasion: ${Math.floor(this.combat.enemy.evasion * 100)}%`, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: COLORS.WARNING
      })
    }
  }

  createActionButtons(width, height) {
    const buttonY = height - 300
    const spacing = 150

    this.actionButtons = []

    // Attack button
    const attackBtn = this.createButton(width / 2 - spacing * 1.5, buttonY, 'ATTACK', COLORS.DANGER, () => {
      this.executeAction(COMBAT_ACTIONS.ATTACK)
    })
    this.actionButtons.push(attackBtn)

    // Defend button
    const defendBtn = this.createButton(width / 2 - spacing * 0.5, buttonY, 'DEFEND', COLORS.SUCCESS, () => {
      this.executeAction(COMBAT_ACTIONS.DEFEND)
    })
    this.actionButtons.push(defendBtn)

    // Evade button
    const evadeBtn = this.createButton(width / 2 + spacing * 0.5, buttonY, 'EVADE', COLORS.WARNING, () => {
      this.executeAction(COMBAT_ACTIONS.EVADE)
    })
    this.actionButtons.push(evadeBtn)

    // Special button
    const specialBtn = this.createButton(width / 2 + spacing * 1.5, buttonY, 'SPECIAL\n-5 Fuel', 0x9B59B6, () => {
      this.executeAction(COMBAT_ACTIONS.SPECIAL)
    })
    this.actionButtons.push(specialBtn)

    // Flee button
    const fleeBtn = this.createButton(width / 2, buttonY + 50, 'ATTEMPT FLEE', 0x7F8C8D, () => {
      this.attemptFlee()
    })
    this.actionButtons.push(fleeBtn)
  }

  createButton(x, y, text, color, callback) {
    const button = this.add.rectangle(x, y, 120, 40, color)
    button.setStrokeStyle(2, 0xFFFFFF)
    button.setInteractive({ useHandCursor: true })

    const label = this.add.text(x, y, text, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5)

    button.on('pointerdown', callback)
    this.vfx.createButtonHoverEffect(button)

    return { rect: button, label }
  }

  executeAction(action) {
    // Disable buttons during animation
    this.disableButtons()

    // Execute turn
    const result = this.gameState.combatSystem.executeTurn(action)

    // Visual feedback for player action
    this.animatePlayerAction(action)

    // Wait for animation, then show results
    this.time.delayedCall(800, () => {
      this.handleTurnResult(result)
    })
  }

  animatePlayerAction(action) {
    const enemyX = this.enemyShip.x
    const enemyY = this.enemyShip.y

    switch (action) {
      case COMBAT_ACTIONS.ATTACK:
        // Fire weapon
        const projectile = this.add.circle(this.playerShip.x, this.playerShip.y, 5, 0xFFFF00)
        this.tweens.add({
          targets: projectile,
          x: enemyX,
          y: enemyY,
          duration: 400,
          onComplete: () => {
            projectile.destroy()
            this.vfx.createHitEffect(enemyX, enemyY)
            this.cameras.main.shake(100, 0.003)
          }
        })
        break

      case COMBAT_ACTIONS.DEFEND:
        // Shield effect
        this.playerShield.setAlpha(0.6)
        this.tweens.add({
          targets: this.playerShield,
          alpha: 0.1,
          duration: 500
        })
        break

      case COMBAT_ACTIONS.EVADE:
        // Dodge animation
        this.tweens.add({
          targets: [this.playerShip, this.playerShipOutline, this.playerShield],
          y: this.playerShip.y - 30,
          yoyo: true,
          duration: 300
        })
        break

      case COMBAT_ACTIONS.SPECIAL:
        // Overcharged attack
        this.vfx.createWarpChargeEffect(this.playerShip.x, this.playerShip.y, 500)
        this.time.delayedCall(500, () => {
          const beam = this.add.line(0, 0, this.playerShip.x, this.playerShip.y, enemyX, enemyY, 0x00FFFF)
          beam.setLineWidth(5)
          beam.setAlpha(0.8)
          this.vfx.createExplosion(enemyX, enemyY, 0x00FFFF, 60)
          this.time.delayedCall(200, () => beam.destroy())
        })
        break
    }
  }

  handleTurnResult(result) {
    if (result.victory !== undefined) {
      // Combat ended
      this.endCombat(result)
      return
    }

    if (result.fled !== undefined) {
      // Flee attempt
      this.endCombat(result)
      return
    }

    // Update UI
    this.updateCombatUI()

    // Show combat log
    this.showCombatLog()

    // Enable buttons
    this.enableButtons()

    // Enemy turn animation
    this.animateEnemyTurn()
  }

  animateEnemyTurn() {
    this.time.delayedCall(500, () => {
      // Enemy attacks
      const playerX = this.playerShip.x
      const playerY = this.playerShip.y

      const projectile = this.add.circle(this.enemyShip.x, this.enemyShip.y, 5, 0xFF6666)
      this.tweens.add({
        targets: projectile,
        x: playerX,
        y: playerY,
        duration: 400,
        onComplete: () => {
          projectile.destroy()

          if (this.combat.playerShields > 0) {
            this.vfx.createShieldHit(playerX, playerY, 50)
          } else {
            this.vfx.createHitEffect(playerX, playerY)
            this.vfx.createDamageSparks(playerX, playerY)
          }

          this.cameras.main.shake(100, 0.003)
        }
      })
    })
  }

  updateCombatUI() {
    // Update player status
    this.playerHullText.setText(`Hull: ${this.combat.playerHull}`)
    this.playerShieldText.setText(`Shields: ${this.combat.playerShields}`)

    // Update enemy status
    this.enemyHullText.setText(`Hull: ${Math.floor(this.combat.enemy.hull)}/${this.combat.enemy.maxHull}`)
    this.enemyShieldText.setText(`Shields: ${Math.floor(this.combat.enemy.shields)}`)

    // Update turn
    this.turnText.setText(`Turn ${this.combat.turn}`)

    // Update ship visuals based on damage
    const playerHullPercent = this.combat.playerHull / 100
    if (playerHullPercent < 0.3) {
      this.playerShip.setFillStyle(0x996600)
    } else if (playerHullPercent < 0.6) {
      this.playerShip.setFillStyle(0x0088CC)
    }

    const enemyHullPercent = this.combat.enemy.hull / this.combat.enemy.maxHull
    if (enemyHullPercent < 0.3) {
      this.enemyShip.setFillStyle(0x996600)
    } else if (enemyHullPercent < 0.6) {
      this.enemyShip.setFillStyle(0xCC4444)
    }
  }

  showCombatLog() {
    // Clear old log displays
    if (this.logTexts) {
      this.logTexts.forEach(t => t.destroy())
    }

    this.logTexts = []
    const recentLog = this.combat.log.slice(-3) // Show last 3 messages

    recentLog.forEach((message, i) => {
      const text = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 160 + (i * 25),
        message,
        {
          fontSize: '12px',
          fontFamily: 'Arial',
          color: COLORS.TEXT,
          align: 'center'
        }
      ).setOrigin(0.5)

      this.logTexts.push(text)
    })
  }

  attemptFlee() {
    this.disableButtons()

    const result = this.gameState.combatSystem.attemptFlee()

    if (result.fled) {
      this.showMessage('Retreating from combat...', COLORS.WARNING)
      this.time.delayedCall(1000, () => {
        this.endCombat(result)
      })
    } else {
      this.showMessage('Failed to flee! Taking damage!', COLORS.DANGER)
      this.vfx.createHitEffect(this.playerShip.x, this.playerShip.y)
      this.cameras.main.shake(200, 0.005)

      this.time.delayedCall(1000, () => {
        this.updateCombatUI()
        this.enableButtons()
      })
    }
  }

  endCombat(result) {
    this.disableButtons()

    if (result.victory) {
      // Victory effects
      this.vfx.createExplosion(this.enemyShip.x, this.enemyShip.y, 0xFF6600, 100)
      this.enemyShip.destroy()
      this.enemyShipOutline.destroy()
      this.enemyShield.destroy()

      this.showMessage('ENEMY DESTROYED!', COLORS.SUCCESS)

      this.time.delayedCall(2000, () => {
        this.returnToMap(result)
      })
    } else if (result.fled) {
      this.showMessage('Escaped from combat', COLORS.WARNING)
      this.time.delayedCall(1500, () => {
        this.returnToMap(result)
      })
    } else {
      // Defeat
      this.vfx.createExplosion(this.playerShip.x, this.playerShip.y, 0xFF6600, 100)
      this.showMessage('CRITICAL DAMAGE! RETREATING!', COLORS.DANGER)

      this.time.delayedCall(2000, () => {
        this.returnToMap(result)
      })
    }
  }

  returnToMap(combatResult) {
    // Pass combat result back
    this.returnData.combatResult = combatResult
    this.scene.start(this.returnScene, this.returnData)
  }

  showMessage(text, color) {
    const message = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({
      targets: message,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1000,
      onComplete: () => message.destroy()
    })
  }

  disableButtons() {
    this.actionButtons.forEach(btn => {
      btn.rect.disableInteractive()
      btn.rect.setAlpha(0.5)
    })
  }

  enableButtons() {
    this.actionButtons.forEach(btn => {
      btn.rect.setInteractive()
      btn.rect.setAlpha(1)
    })
  }
}
