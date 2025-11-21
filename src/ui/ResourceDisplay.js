import Phaser from 'phaser'
import { COLORS, RESOURCES } from '../config'

/**
 * ResourceDisplay - UI component for showing resources
 * Can be added to any scene
 */
export default class ResourceDisplay {
  constructor(scene, x, y, gameState) {
    this.scene = scene
    this.x = x
    this.y = y
    this.gameState = gameState
    this.container = null
    this.resourceTexts = {}

    this.create()
  }

  create() {
    // Create container for all UI elements
    this.container = this.scene.add.container(this.x, this.y)

    // Background panel
    const panelWidth = 200
    const panelHeight = 240
    const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, parseInt(COLORS.UI_BG.replace('#', '0x')), 0.9)
    bg.setOrigin(0, 0)
    bg.setStrokeStyle(2, parseInt(COLORS.UI_BORDER.replace('#', '0x')))
    this.container.add(bg)

    // Title
    const title = this.scene.add.text(10, 10, 'RESOURCES', {
      font: 'bold 16px monospace',
      fill: COLORS.PRIMARY
    })
    this.container.add(title)

    // Resource entries
    const resourceConfig = [
      { key: RESOURCES.FUEL, label: 'Fuel', icon: '⚡', color: COLORS.WARNING },
      { key: RESOURCES.FOOD, label: 'Food', icon: '🌾', color: COLORS.SUCCESS },
      { key: RESOURCES.MATERIALS, label: 'Materials', icon: '⚙', color: COLORS.SECONDARY },
      { key: RESOURCES.POPULATION, label: 'Population', icon: '👥', color: COLORS.PRIMARY },
      { key: RESOURCES.MORALE, label: 'Morale', icon: '❤', color: COLORS.DANGER },
      { key: RESOURCES.TECHNOLOGY, label: 'Tech', icon: '🔬', color: COLORS.PRIMARY }
    ]

    let yOffset = 40
    resourceConfig.forEach(config => {
      const label = this.scene.add.text(10, yOffset, `${config.label}:`, {
        font: '14px monospace',
        fill: COLORS.TEXT
      })
      this.container.add(label)

      const valueText = this.scene.add.text(panelWidth - 10, yOffset, '0', {
        font: 'bold 14px monospace',
        fill: config.color
      }).setOrigin(1, 0)
      this.container.add(valueText)

      this.resourceTexts[config.key] = valueText

      yOffset += 30
    })

    // Initial update
    this.update()
  }

  update() {
    if (!this.gameState) return

    // Update each resource display
    Object.keys(this.resourceTexts).forEach(resourceKey => {
      const value = this.gameState.getResource(resourceKey)
      const text = this.resourceTexts[resourceKey]

      if (resourceKey === RESOURCES.MORALE) {
        text.setText(`${value}%`)
      } else {
        text.setText(Math.floor(value).toString())
      }

      // Color code based on value
      if (resourceKey === RESOURCES.MORALE) {
        if (value >= 75) text.setColor(COLORS.SUCCESS)
        else if (value >= 50) text.setColor(COLORS.WARNING)
        else text.setColor(COLORS.DANGER)
      } else if (resourceKey === RESOURCES.POPULATION) {
        if (value >= 900) text.setColor(COLORS.SUCCESS)
        else if (value >= 500) text.setColor(COLORS.WARNING)
        else text.setColor(COLORS.DANGER)
      } else {
        if (value >= 50) text.setColor(COLORS.SUCCESS)
        else if (value >= 25) text.setColor(COLORS.WARNING)
        else text.setColor(COLORS.DANGER)
      }
    })
  }

  setVisible(visible) {
    this.container.setVisible(visible)
  }

  destroy() {
    if (this.container) {
      this.container.destroy()
    }
  }
}
