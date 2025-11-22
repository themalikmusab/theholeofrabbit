// CombatScene - Real-time tactical space combat
import Phaser from 'phaser'
import { COLORS } from '../config'
import VisualEffects from '../systems/VisualEffects'
import Visual3DSystem from '../systems/Visual3DSystem'
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
    this.visual3D = new Visual3DSystem(this)

    // Create animated background with 3D effects
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
    // 3D starfield with depth layers
    this.starfield3D = this.visual3D.create3DStarfield(width, height, 500)

    // Add depth fog for atmosphere
    this.depthFog = this.visual3D.createDepthFog(width, height)
    this.depthFog.setDepth(-1)

    // Add nebula background
    this.nebula = this.vfx.createNebulaBackground(width, height, [0x440066, 0x660044, 0x004466])
    this.nebula.setAlpha(0.15)
    this.nebula.setDepth(-2)
  }

  createShips(width, height) {
    // Player ship positions
    const playerX = width * 0.25
    const playerY = height * 0.5

    // Enemy ship positions
    const enemyX = width * 0.75
    const enemyY = height * 0.5

    // Create 3D isometric player ship
    this.playerShipContainer = this.add.container(playerX, playerY)
    this.playerShip3D = this.visual3D.createIsometricShip(0, 0, 80, 0x00AAFF)
    this.playerShipContainer.add(this.playerShip3D.container)
    this.playerShip3D.container.setRotation(Math.PI / 6) // Slight angle for depth

    // Add dynamic lighting to player ship
    this.playerShipLight = this.visual3D.createLight(0, -30, 40, 0x00DDFF, 0.6)
    this.playerShipContainer.add(this.playerShipLight)

    // Shield effect for player
    this.playerShield = this.add.circle(0, 0, 70, 0x00AAFF, 0)
    this.playerShield.setStrokeStyle(3, 0x00DDFF, 0.3)
    this.playerShieldContainer = this.add.container(playerX, playerY)
    this.playerShieldContainer.add(this.playerShield)

    // Create 3D isometric enemy ship
    const enemy = this.combat.enemy
    this.enemyShipContainer = this.add.container(enemyX, enemyY)
    this.enemyShip3D = this.visual3D.createIsometricShip(0, 0, 90, 0xFF3333)
    this.enemyShipContainer.add(this.enemyShip3D.container)
    this.enemyShip3D.container.setRotation(-Math.PI / 6) // Face player

    // Add dynamic lighting to enemy ship
    this.enemyShipLight = this.visual3D.createLight(0, -30, 40, 0xFF6666, 0.6)
    this.enemyShipContainer.add(this.enemyShipLight)

    // Enemy shield
    this.enemyShield = this.add.circle(0, 0, 80, 0xFF3333, 0)
    this.enemyShield.setStrokeStyle(3, 0xFF6666, 0.3)
    this.enemyShieldContainer = this.add.container(enemyX, enemyY)
    this.enemyShieldContainer.add(this.enemyShield)

    // Add shadows for depth
    this.playerShadow = this.visual3D.createShadow(0, 60, 80, 40)
    this.playerShipContainer.add(this.playerShadow)

    this.enemyShadow = this.visual3D.createShadow(0, 60, 90, 45)
    this.enemyShipContainer.add(this.enemyShadow)

    // Engine trails with 3D effect
    this.time.addEvent({
      delay: 80,
      callback: () => {
        if (this.playerShipContainer) {
          this.vfx.createEngineTrail(
            this.playerShipContainer.x - 40,
            this.playerShipContainer.y,
            Math.PI,
            0x00DDFF
          )
        }
        if (this.enemyShipContainer) {
          this.vfx.createEngineTrail(
            this.enemyShipContainer.x + 40,
            this.enemyShipContainer.y,
            0,
            0xFF6666
          )
        }
      },
      loop: true
    })

    // Pulsing light effect on ships
    this.tweens.add({
      targets: [this.playerShipLight, this.enemyShipLight],
      alpha: 0.3,
      duration: 1500,
      yoyo: true,
      repeat: -1
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
    const playerX = this.playerShipContainer.x
    const playerY = this.playerShipContainer.y
    const enemyX = this.enemyShipContainer.x
    const enemyY = this.enemyShipContainer.y

    switch (action) {
      case COMBAT_ACTIONS.ATTACK:
        // Fire weapon with enhanced 3D effect
        const projectile = this.add.circle(playerX, playerY, 6, 0xFFFF00)
        projectile.setDepth(100)

        // Add glow trail
        const projectileGlow = this.visual3D.createLight(0, 0, 15, 0xFFFF00, 0.8)
        projectileGlow.setDepth(99)

        this.tweens.add({
          targets: [projectile, projectileGlow],
          x: enemyX,
          y: enemyY,
          duration: 400,
          onUpdate: () => {
            projectileGlow.x = projectile.x
            projectileGlow.y = projectile.y
          },
          onComplete: () => {
            projectile.destroy()
            projectileGlow.destroy()

            // Enhanced 3D explosion
            this.visual3D.create3DExplosion(enemyX, enemyY, 0xFFAA00, 50, 30)
            this.vfx.createHitEffect(enemyX, enemyY)
            this.cameras.main.shake(100, 0.005)

            // Flash enemy ship light
            this.tweens.add({
              targets: this.enemyShipLight,
              alpha: 1,
              duration: 100,
              yoyo: true
            })
          }
        })
        break

      case COMBAT_ACTIONS.DEFEND:
        // Shield effect with rotation
        this.playerShield.setAlpha(0.7)
        this.tweens.add({
          targets: this.playerShieldContainer,
          rotation: Math.PI * 2,
          duration: 800
        })
        this.tweens.add({
          targets: this.playerShield,
          alpha: 0.1,
          duration: 500
        })
        break

      case COMBAT_ACTIONS.EVADE:
        // Dodge animation with 3D effect
        this.tweens.add({
          targets: this.playerShipContainer,
          y: playerY - 40,
          yoyo: true,
          duration: 300,
          ease: 'Quad.easeInOut'
        })
        this.tweens.add({
          targets: this.playerShieldContainer,
          y: playerY - 40,
          yoyo: true,
          duration: 300,
          ease: 'Quad.easeInOut'
        })
        break

      case COMBAT_ACTIONS.SPECIAL:
        // Overcharged attack with intense lighting
        this.vfx.createWarpChargeEffect(playerX, playerY, 500)

        // Brighten player ship light
        this.tweens.add({
          targets: this.playerShipLight,
          scaleX: 2,
          scaleY: 2,
          alpha: 1,
          duration: 500
        })

        this.time.delayedCall(500, () => {
          const beam = this.add.line(0, 0, playerX, playerY, enemyX, enemyY, 0x00FFFF)
          beam.setLineWidth(8)
          beam.setAlpha(0.9)
          beam.setDepth(150)

          // Massive 3D explosion
          this.visual3D.create3DExplosion(enemyX, enemyY, 0x00FFFF, 80, 50)
          this.vfx.createExplosion(enemyX, enemyY, 0x00FFFF, 60)

          this.cameras.main.shake(200, 0.008)

          this.time.delayedCall(200, () => {
            beam.destroy()
            // Reset player ship light
            this.tweens.add({
              targets: this.playerShipLight,
              scaleX: 1,
              scaleY: 1,
              alpha: 0.6,
              duration: 300
            })
          })
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
      // Enemy attacks with 3D effects
      const playerX = this.playerShipContainer.x
      const playerY = this.playerShipContainer.y
      const enemyX = this.enemyShipContainer.x
      const enemyY = this.enemyShipContainer.y

      const projectile = this.add.circle(enemyX, enemyY, 6, 0xFF6666)
      projectile.setDepth(100)

      // Add glow trail
      const projectileGlow = this.visual3D.createLight(0, 0, 15, 0xFF6666, 0.8)
      projectileGlow.setDepth(99)

      this.tweens.add({
        targets: [projectile, projectileGlow],
        x: playerX,
        y: playerY,
        duration: 400,
        onUpdate: () => {
          projectileGlow.x = projectile.x
          projectileGlow.y = projectile.y
        },
        onComplete: () => {
          projectile.destroy()
          projectileGlow.destroy()

          if (this.combat.playerShields > 0) {
            this.vfx.createShieldHit(playerX, playerY, 70)
            this.playerShield.setAlpha(0.6)
            this.tweens.add({
              targets: this.playerShield,
              alpha: 0.1,
              duration: 300
            })
          } else {
            this.visual3D.create3DExplosion(playerX, playerY, 0xFF6600, 40, 25)
            this.vfx.createHitEffect(playerX, playerY)
            this.vfx.createDamageSparks(playerX, playerY)

            // Flash player ship light
            this.tweens.add({
              targets: this.playerShipLight,
              alpha: 1,
              duration: 100,
              yoyo: true
            })
          }

          this.cameras.main.shake(100, 0.005)
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

    // Update ship visuals based on damage with 3D effects
    const playerHullPercent = this.combat.playerHull / 100
    if (playerHullPercent < 0.3) {
      // Critical damage - add smoke particles
      this.vfx.createDamageSparks(this.playerShipContainer.x, this.playerShipContainer.y + 20)
      this.playerShip3D.container.setAlpha(0.7)
    } else if (playerHullPercent < 0.6) {
      this.playerShip3D.container.setAlpha(0.85)
    }

    const enemyHullPercent = this.combat.enemy.hull / this.combat.enemy.maxHull
    if (enemyHullPercent < 0.3) {
      // Critical damage - add smoke particles
      this.vfx.createDamageSparks(this.enemyShipContainer.x, this.enemyShipContainer.y + 20)
      this.enemyShip3D.container.setAlpha(0.7)
    } else if (enemyHullPercent < 0.6) {
      this.enemyShip3D.container.setAlpha(0.85)
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
      // Victory effects with massive 3D explosion
      const enemyX = this.enemyShipContainer.x
      const enemyY = this.enemyShipContainer.y

      // Multi-stage explosion effect
      this.vfx.createExplosion(enemyX, enemyY, 0xFF6600, 120)
      this.visual3D.create3DExplosion(enemyX, enemyY, 0xFF6600, 100, 60)

      this.cameras.main.shake(300, 0.01)

      // Destroy enemy ship with fade out
      this.tweens.add({
        targets: [this.enemyShipContainer, this.enemyShieldContainer],
        alpha: 0,
        scale: 0.5,
        duration: 500,
        onComplete: () => {
          this.enemyShipContainer.destroy()
          this.enemyShieldContainer.destroy()
        }
      })

      this.showMessage('ENEMY DESTROYED!', COLORS.SUCCESS)

      this.time.delayedCall(2000, () => {
        this.returnToMap(result)
      })
    } else if (result.fled) {
      // Warp away effect
      this.vfx.createWarpChargeEffect(
        this.playerShipContainer.x,
        this.playerShipContainer.y,
        1000
      )

      this.tweens.add({
        targets: [this.playerShipContainer, this.playerShieldContainer],
        x: -200,
        alpha: 0,
        duration: 1000,
        ease: 'Quad.easeIn'
      })

      this.showMessage('Escaped from combat', COLORS.WARNING)
      this.time.delayedCall(1500, () => {
        this.returnToMap(result)
      })
    } else {
      // Defeat with dramatic explosion
      const playerX = this.playerShipContainer.x
      const playerY = this.playerShipContainer.y

      this.vfx.createExplosion(playerX, playerY, 0xFF6600, 100)
      this.visual3D.create3DExplosion(playerX, playerY, 0xFF6600, 90, 50)

      this.cameras.main.shake(250, 0.008)

      this.tweens.add({
        targets: [this.playerShipContainer, this.playerShieldContainer],
        alpha: 0,
        rotation: Math.PI,
        duration: 800
      })

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
