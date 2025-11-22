// ResearchScene - Technology Tree Interface
import Phaser from 'phaser'
import { COLORS } from '../config'
import { TECHNOLOGIES, RESEARCH_CATEGORIES } from '../systems/ResearchSystem'
import Visual3DSystem from '../systems/Visual3DSystem'

export default class ResearchScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResearchScene' })
  }

  init(data) {
    this.gameState = data.gameState
    this.eventSystem = data.eventSystem
    this.returnScene = data.returnScene || 'ShipScene'
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 3D background
    this.visual3D = new Visual3DSystem(this)
    this.starfield = this.visual3D.create3DStarfield(width, height, 300)
    this.depthFog = this.visual3D.createDepthFog(width, height)
    this.depthFog.setAlpha(0.5)

    // Title
    this.add.text(width / 2, 30, 'RESEARCH & DEVELOPMENT', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: COLORS.PRIMARY,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Technology resource display
    const techAmount = this.gameState.resources.technology
    this.techDisplay = this.add.text(width / 2, 70, `Available Technology: ${techAmount}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: COLORS.SUCCESS
    }).setOrigin(0.5)

    // Research summary
    const summary = this.gameState.researchSystem.getResearchSummary()
    this.add.text(width / 2, 100, `Completed: ${summary.totalCompleted}/${summary.totalAvailable} | Available: ${summary.available}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: COLORS.TEXT,
      alpha: 0.8
    }).setOrigin(0.5)

    // Create technology tree visualization
    this.createTechTree(width, height)

    // Back button
    const backBtn = this.add.rectangle(width / 2, height - 40, 200, 40, parseInt(COLORS.UI_BG.replace('#', '0x')))
    backBtn.setStrokeStyle(2, parseInt(COLORS.UI_BORDER.replace('#', '0x')))
    backBtn.setInteractive({ useHandCursor: true })

    const backLabel = this.add.text(width / 2, height - 40, 'BACK TO SHIP', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    backBtn.on('pointerdown', () => {
      this.scene.start(this.returnScene, {
        gameState: this.gameState,
        eventSystem: this.eventSystem
      })
    })

    backBtn.on('pointerover', () => {
      backBtn.setFillStyle(parseInt(COLORS.PRIMARY.replace('#', '0x')), 0.3)
    })

    backBtn.on('pointerout', () => {
      backBtn.setFillStyle(parseInt(COLORS.UI_BG.replace('#', '0x')))
    })
  }

  createTechTree(width, height) {
    const categories = Object.values(RESEARCH_CATEGORIES)
    const categoryWidth = 180
    const categorySpacing = 200
    const startX = (width - (categories.length * categorySpacing - 20)) / 2

    categories.forEach((category, catIndex) => {
      const x = startX + catIndex * categorySpacing
      const y = 150

      // Category header
      this.add.text(x, y, this.getCategoryName(category), {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: COLORS.WARNING,
        fontStyle: 'bold'
      }).setOrigin(0.5)

      // Get technologies in this category
      const techs = Object.values(TECHNOLOGIES).filter(t => t.category === category)

      // Draw technology nodes
      techs.forEach((tech, index) => {
        this.createTechNode(x, y + 40 + (index * 100), tech)
      })
    })
  }

  createTechNode(x, y, tech) {
    const isResearched = this.gameState.researchSystem.isResearched(tech.id)
    const canAfford = this.gameState.resources.technology >= tech.cost
    const requirementsMet = tech.requires.every(reqId => this.gameState.researchSystem.isResearched(reqId))
    const canResearch = !isResearched && requirementsMet && canAfford

    // Node background
    const nodeColor = isResearched ? 0x00FF88 : (canResearch ? 0x00AAFF : 0x444444)
    const node = this.add.rectangle(x, y, 160, 80, nodeColor, 0.2)
    node.setStrokeStyle(2, nodeColor, isResearched ? 1.0 : 0.5)

    // Icon
    const icon = this.add.text(x - 60, y - 10, tech.icon, {
      fontSize: '24px'
    })

    // Name
    const name = this.add.text(x - 50, y - 15, tech.name, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: isResearched ? COLORS.SUCCESS : COLORS.TEXT,
      fontStyle: isResearched ? 'bold' : 'normal',
      wordWrap: { width: 100 }
    })

    // Cost
    const costText = isResearched ? '✓ DONE' : `${tech.cost} Tech`
    const costColor = isResearched ? COLORS.SUCCESS : (canAfford ? COLORS.WARNING : COLORS.DANGER)
    const cost = this.add.text(x, y + 20, costText, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: costColor
    }).setOrigin(0.5)

    // Make interactive if can research
    if (canResearch) {
      node.setInteractive({ useHandCursor: true })

      node.on('pointerover', () => {
        node.setFillStyle(nodeColor, 0.4)
        this.showTechDetails(tech, x, y)

        // Glow effect
        this.tweens.add({
          targets: node,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
          ease: 'Back.easeOut'
        })
      })

      node.on('pointerout', () => {
        node.setFillStyle(nodeColor, 0.2)
        this.hideTechDetails()

        this.tweens.add({
          targets: node,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Back.easeIn'
        })
      })

      node.on('pointerdown', () => {
        this.researchTechnology(tech, node, name, cost, icon)
      })
    } else if (!isResearched && !requirementsMet) {
      // Show locked state
      node.setInteractive()
      node.on('pointerover', () => {
        this.showTechDetails(tech, x, y, 'Requirements not met')
      })
      node.on('pointerout', () => {
        this.hideTechDetails()
      })
    }

    // Draw requirement lines
    tech.requires.forEach(reqId => {
      const reqTech = Object.values(TECHNOLOGIES).find(t => t.id === reqId)
      if (reqTech) {
        // Find position of requirement tech (rough estimate)
        const reqIndex = Object.values(TECHNOLOGIES).filter(t => t.category === reqTech.category).findIndex(t => t.id === reqId)
        const reqY = 190 + (reqIndex * 100)

        const line = this.add.line(0, 0, x, reqY + 40, x, y - 40, 0x888888)
        line.setLineWidth(2)
        line.setAlpha(isResearched ? 0.8 : 0.3)
        line.setDepth(-1)
      }
    })
  }

  showTechDetails(tech, x, y, warningText = null) {
    if (this.detailsPanel) this.detailsPanel.destroy()

    const panelWidth = 300
    const panelHeight = 150
    const panelX = Math.min(x + 100, this.cameras.main.width - panelWidth / 2 - 20)
    const panelY = y

    this.detailsPanel = this.add.container(panelX, panelY)

    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.95)
    bg.setStrokeStyle(2, parseInt(COLORS.PRIMARY.replace('#', '0x')))
    this.detailsPanel.add(bg)

    const title = this.add.text(-panelWidth/2 + 10, -panelHeight/2 + 10, `${tech.icon} ${tech.name}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: COLORS.PRIMARY,
      fontStyle: 'bold'
    })
    this.detailsPanel.add(title)

    const desc = this.add.text(-panelWidth/2 + 10, -panelHeight/2 + 35, tech.description, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: COLORS.TEXT,
      wordWrap: { width: panelWidth - 20 }
    })
    this.detailsPanel.add(desc)

    if (warningText) {
      const warning = this.add.text(0, panelHeight/2 - 20, warningText, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: COLORS.DANGER,
        fontStyle: 'bold'
      }).setOrigin(0.5)
      this.detailsPanel.add(warning)
    }

    this.detailsPanel.setDepth(1000)

    // Fade in
    this.detailsPanel.setAlpha(0)
    this.tweens.add({
      targets: this.detailsPanel,
      alpha: 1,
      duration: 200
    })
  }

  hideTechDetails() {
    if (this.detailsPanel) {
      this.tweens.add({
        targets: this.detailsPanel,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          if (this.detailsPanel) {
            this.detailsPanel.destroy()
            this.detailsPanel = null
          }
        }
      })
    }
  }

  researchTechnology(tech, node, nameText, costText, iconText) {
    const result = this.gameState.researchSystem.startResearch(tech.id)

    if (result.success) {
      // Success animation
      this.cameras.main.flash(200, 0, 255, 136, false)

      // Update visuals
      node.setFillStyle(0x00FF88, 0.2)
      node.setStrokeStyle(2, 0x00FF88, 1.0)
      nameText.setColor(COLORS.SUCCESS)
      nameText.setFontStyle('bold')
      costText.setText('✓ DONE')
      costText.setColor(COLORS.SUCCESS)

      // Celebration particles
      for (let i = 0; i < 20; i++) {
        const particle = this.add.circle(node.x, node.y, 3, 0x00FF88)
        this.tweens.add({
          targets: particle,
          x: node.x + Phaser.Math.Between(-80, 80),
          y: node.y + Phaser.Math.Between(-80, 80),
          alpha: 0,
          duration: 800,
          onComplete: () => particle.destroy()
        })
      }

      // Update tech display
      this.techDisplay.setText(`Available Technology: ${this.gameState.resources.technology}`)

      // Show success message
      this.showMessage(`${tech.icon} ${tech.name} RESEARCHED!`, COLORS.SUCCESS)

      // Refresh tree
      this.time.delayedCall(500, () => {
        this.scene.restart({
          gameState: this.gameState,
          eventSystem: this.eventSystem,
          returnScene: this.returnScene
        })
      })
    } else {
      // Failure feedback
      this.cameras.main.shake(100, 0.002)
      this.showMessage(result.reason, COLORS.DANGER)
    }
  }

  showMessage(text, color) {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const msg = this.add.text(width / 2, height / 2, text, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: color,
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setAlpha(0).setDepth(2000)

    this.tweens.add({
      targets: msg,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1200,
      onComplete: () => msg.destroy()
    })
  }

  getCategoryName(category) {
    const names = {
      propulsion: 'PROPULSION',
      weapons: 'WEAPONS',
      shields: 'SHIELDS',
      life_support: 'LIFE SUPPORT',
      sensors: 'SENSORS',
      engineering: 'ENGINEERING'
    }
    return names[category] || category.toUpperCase()
  }
}
