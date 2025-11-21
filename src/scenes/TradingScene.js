// TradingScene - Dynamic marketplace for buying and selling
import Phaser from 'phaser'
import { COLORS } from '../config'
import { MARKET_TYPES } from '../systems/TradingSystem'

export default class TradingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TradingScene' })
  }

  init(data) {
    this.gameState = data.gameState
    this.marketType = data.marketType || 'TRADE_STATION'
    this.returnScene = data.returnScene || 'MapScene'
    this.returnData = data.returnData || {}

    // Open the market
    this.market = this.gameState.tradingSystem.openMarket(this.marketType, this.gameState.turn)
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background
    this.createBackground(width, height)

    // UI
    this.createUI(width, height)

    // Goods list
    this.createGoodsList(width, height)
  }

  createBackground(width, height) {
    // Starfield background
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const star = this.add.circle(x, y, 1, 0xFFFFFF, 0.7)
    }

    // Market station graphic
    this.add.circle(width / 2, 200, 80, 0x444444)
    this.add.circle(width / 2, 200, 75, 0x666666)

    // Docking lights
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const x = width / 2 + Math.cos(angle) * 80
      const y = 200 + Math.sin(angle) * 80
      const light = this.add.circle(x, y, 3, 0x00FF00, 0.8)

      this.tweens.add({
        targets: light,
        alpha: 0.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: i * 100
      })
    }
  }

  createUI(width, height) {
    // Title
    this.add.text(width / 2, 30, this.market.name.toUpperCase(), {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: COLORS.WARNING,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Description
    this.add.text(width / 2, 65, this.market.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: COLORS.TEXT
    }).setOrigin(0.5)

    // Player resources panel
    this.createResourcePanel(50, 110, width)

    // Close button
    const closeBtn = this.add.rectangle(width - 100, 30, 120, 40, COLORS.DANGER)
    closeBtn.setStrokeStyle(2, 0xFFFFFF)
    closeBtn.setInteractive({ useHandCursor: true })

    const closeLabel = this.add.text(width - 100, 30, 'EXIT', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    closeBtn.on('pointerdown', () => {
      this.gameState.tradingSystem.closeMarket()
      this.scene.start(this.returnScene, this.returnData)
    })

    closeBtn.on('pointerover', () => {
      this.tweens.add({ targets: closeBtn, scale: 1.05, duration: 100 })
    })

    closeBtn.on('pointerout', () => {
      this.tweens.add({ targets: closeBtn, scale: 1, duration: 100 })
    })
  }

  createResourcePanel(x, y, width) {
    const panel = this.add.rectangle(width / 2, y + 40, width - 100, 70, 0x000000, 0.7)
    panel.setStrokeStyle(2, COLORS.SUCCESS)

    this.add.text(x + 20, y, 'YOUR RESOURCES', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: COLORS.SUCCESS,
      fontStyle: 'bold'
    })

    // Resource texts
    this.materialsText = this.add.text(x + 20, y + 25, `Materials: ${this.gameState.resources.materials}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT
    })

    this.fuelText = this.add.text(x + 180, y + 25, `Fuel: ${this.gameState.resources.fuel}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT
    })

    this.foodText = this.add.text(x + 320, y + 25, `Food: ${this.gameState.resources.food}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT
    })

    this.techText = this.add.text(x + 460, y + 25, `Tech: ${this.gameState.resources.technology}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT
    })

    this.add.text(x + 20, y + 50, `Currency (Materials): ${this.gameState.resources.materials}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: COLORS.WARNING,
      fontStyle: 'bold'
    })
  }

  createGoodsList(width, height) {
    const startY = 230
    const goods = this.market.getAvailableGoods()

    // Header
    this.add.text(width / 2, startY - 20, 'AVAILABLE GOODS', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: COLORS.WARNING,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Column headers
    this.add.text(100, startY + 10, 'ITEM', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    })

    this.add.text(400, startY + 10, 'STOCK', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    })

    this.add.text(520, startY + 10, 'PRICE', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    })

    this.add.text(650, startY + 10, 'BUY', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    })

    this.add.text(830, startY + 10, 'SELL', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT,
      fontStyle: 'bold'
    })

    // Goods rows
    goods.forEach((good, index) => {
      const y = startY + 50 + (index * 50)

      if (y > height - 100) return // Don't overflow screen

      this.createGoodRow(good, 100, y, width)
    })

    // Show recommendations
    this.showRecommendations(width, height, goods.length)
  }

  createGoodRow(good, x, y, width) {
    // Background
    const bg = this.add.rectangle(width / 2, y, width - 100, 40, 0x222222, 0.5)

    // Item name
    const nameColor = this.getGoodColor(good.good.availability)
    this.add.text(x, y, good.name, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: nameColor
    }).setOrigin(0, 0.5)

    // Stock
    this.add.text(x + 300, y, `${good.quantity}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.TEXT
    }).setOrigin(0, 0.5)

    // Price
    this.add.text(x + 420, y, `${good.price} mat`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: COLORS.WARNING
    }).setOrigin(0, 0.5)

    // Buy buttons
    [1, 5, 10].forEach((amount, i) => {
      const btnX = x + 550 + (i * 70)
      this.createTradeButton(btnX, y, `+${amount}`, COLORS.SUCCESS, () => {
        this.buyGood(good.id, amount)
      })
    })

    // Sell buttons
    [1, 5, 10].forEach((amount, i) => {
      const btnX = x + 730 + (i * 70)
      this.createTradeButton(btnX, y, `-${amount}`, COLORS.DANGER, () => {
        this.sellGood(good.id, amount)
      })
    })
  }

  createTradeButton(x, y, text, color, callback) {
    const button = this.add.rectangle(x, y, 60, 25, color)
    button.setStrokeStyle(1, 0xFFFFFF)
    button.setInteractive({ useHandCursor: true })

    const label = this.add.text(x, y, text, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5)

    button.on('pointerdown', callback)

    button.on('pointerover', () => {
      this.tweens.add({ targets: button, scale: 1.1, duration: 100 })
    })

    button.on('pointerout', () => {
      this.tweens.add({ targets: button, scale: 1, duration: 100 })
    })

    return button
  }

  buyGood(goodId, quantity) {
    const result = this.gameState.tradingSystem.buyGood(goodId, quantity)

    if (result.success) {
      this.showTradeMessage(
        `Bought ${quantity}x ${goodId} for ${result.totalCost} materials`,
        COLORS.SUCCESS
      )
      this.updateResources()
      this.refreshGoodsList()
    } else {
      this.showTradeMessage(result.reason, COLORS.DANGER)
    }
  }

  sellGood(goodId, quantity) {
    const result = this.gameState.tradingSystem.sellGood(goodId, quantity)

    if (result.success) {
      this.showTradeMessage(
        `Sold ${quantity}x ${goodId} for ${result.totalGain} materials`,
        COLORS.SUCCESS
      )
      this.updateResources()
      this.refreshGoodsList()
    } else {
      this.showTradeMessage(result.reason, COLORS.DANGER)
    }
  }

  showTradeMessage(text, color) {
    // Remove old message
    if (this.tradeMessage) {
      this.tradeMessage.destroy()
    }

    this.tradeMessage = this.add.text(this.cameras.main.width / 2, 650, text, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({
      targets: this.tradeMessage,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 1500,
      onComplete: () => {
        if (this.tradeMessage) {
          this.tradeMessage.destroy()
          this.tradeMessage = null
        }
      }
    })
  }

  updateResources() {
    this.materialsText.setText(`Materials: ${this.gameState.resources.materials}`)
    this.fuelText.setText(`Fuel: ${this.gameState.resources.fuel}`)
    this.foodText.setText(`Food: ${this.gameState.resources.food}`)
    this.techText.setText(`Tech: ${this.gameState.resources.technology}`)
  }

  refreshGoodsList() {
    // Recreate the entire scene to refresh
    this.scene.restart({
      gameState: this.gameState,
      marketType: this.marketType,
      returnScene: this.returnScene,
      returnData: this.returnData
    })
  }

  showRecommendations(width, height, goodsCount) {
    const recommendations = this.gameState.tradingSystem.getTradeRecommendations()

    if (recommendations.length > 0 && goodsCount < 6) {
      const y = height - 80

      this.add.text(100, y - 30, 'TRADING TIPS:', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: COLORS.WARNING,
        fontStyle: 'bold'
      })

      recommendations.slice(0, 2).forEach((rec, i) => {
        const text = rec.type === 'buy'
          ? `💡 ${rec.good}: Good buy (${rec.savings} below avg)`
          : `💡 ${rec.good}: Good sell (${rec.profit} above avg)`

        this.add.text(100, y + (i * 20), text, {
          fontSize: '11px',
          fontFamily: 'Arial',
          color: COLORS.TEXT
        })
      })
    }
  }

  getGoodColor(availability) {
    switch (availability) {
      case 'common': return '#FFFFFF'
      case 'uncommon': return '#3498DB'
      case 'rare': return '#9B59B6'
      default: return '#FFFFFF'
    }
  }
}
