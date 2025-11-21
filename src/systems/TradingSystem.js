// Trading System - Dynamic economy with fluctuating prices
import { RESOURCES } from '../config'

export const MARKET_TYPES = {
  BLACK_MARKET: {
    id: 'black_market',
    name: 'Black Market',
    description: 'Illicit trading hub with rare goods',
    priceMultiplier: 1.5,
    reputation: -10,
    rareGoods: true
  },
  TRADE_STATION: {
    id: 'trade_station',
    name: 'Trade Station',
    description: 'Standard commercial trading post',
    priceMultiplier: 1.0,
    reputation: 0,
    rareGoods: false
  },
  RESOURCE_DEPOT: {
    id: 'resource_depot',
    name: 'Resource Depot',
    description: 'Specializes in raw materials',
    priceMultiplier: 0.8,
    reputation: 5,
    rareGoods: false,
    specialization: 'materials'
  },
  COLONY_MARKET: {
    id: 'colony_market',
    name: 'Colony Market',
    description: 'Settlement marketplace',
    priceMultiplier: 1.2,
    reputation: 10,
    rareGoods: false,
    specialization: 'food'
  }
}

export const TRADE_GOODS = {
  // Basic resources
  fuel: {
    basePrice: 10,
    volatility: 0.3,
    availability: 'common'
  },
  food: {
    basePrice: 8,
    volatility: 0.4,
    availability: 'common'
  },
  materials: {
    basePrice: 5,
    volatility: 0.2,
    availability: 'common'
  },
  technology: {
    basePrice: 20,
    volatility: 0.5,
    availability: 'rare'
  },

  // Special trade goods
  medical_supplies: {
    basePrice: 15,
    volatility: 0.4,
    availability: 'uncommon',
    special: true
  },
  luxury_goods: {
    basePrice: 30,
    volatility: 0.6,
    availability: 'rare',
    special: true
  },
  weapons: {
    basePrice: 25,
    volatility: 0.5,
    availability: 'uncommon',
    special: true,
    illegal: true
  },
  alien_artifacts: {
    basePrice: 50,
    volatility: 0.8,
    availability: 'rare',
    special: true
  },
  ship_parts: {
    basePrice: 20,
    volatility: 0.3,
    availability: 'uncommon',
    special: true
  }
}

class Market {
  constructor(type, turn, seed) {
    this.type = type
    this.name = type.name
    this.description = type.description
    this.priceMultiplier = type.priceMultiplier
    this.inventory = {}
    this.prices = {}
    this.lastUpdate = turn
    this.seed = seed

    this.generateInventory()
    this.updatePrices(turn)
  }

  generateInventory() {
    Object.entries(TRADE_GOODS).forEach(([id, good]) => {
      // Determine if this good is available
      const available = this.isGoodAvailable(id, good)

      if (available) {
        // Generate random quantity based on availability
        let quantity = 0
        switch (good.availability) {
          case 'common':
            quantity = 50 + Math.floor(Math.random() * 100)
            break
          case 'uncommon':
            quantity = 20 + Math.floor(Math.random() * 50)
            break
          case 'rare':
            quantity = 5 + Math.floor(Math.random() * 20)
            break
        }

        this.inventory[id] = {
          quantity,
          maxQuantity: quantity
        }
      }
    })
  }

  isGoodAvailable(id, good) {
    // Black markets have everything
    if (this.type.id === 'black_market') return true

    // Illegal goods only in black market
    if (good.illegal && this.type.id !== 'black_market') return false

    // Specialization
    if (this.type.specialization) {
      // Specialized markets have more of their specialty
      if (id === this.type.specialization) return true
      // But less variety otherwise
      return Math.random() < 0.5
    }

    // Rare goods less common in regular markets
    if (good.availability === 'rare' && !this.type.rareGoods) {
      return Math.random() < 0.3
    }

    return true
  }

  updatePrices(turn) {
    // Update prices based on time, supply/demand
    Object.entries(TRADE_GOODS).forEach(([id, good]) => {
      if (!this.inventory[id]) return

      let price = good.basePrice * this.priceMultiplier

      // Supply affects price
      const supply = this.inventory[id].quantity / this.inventory[id].maxQuantity
      price *= (2 - supply) // Low supply = higher price

      // Market volatility
      const volatility = good.volatility || 0.3
      const fluctuation = 1 + (Math.random() * 2 - 1) * volatility
      price *= fluctuation

      // Time-based events (every 5 turns, chance of price spike/crash)
      if (turn % 5 === 0 && Math.random() < 0.2) {
        price *= Math.random() < 0.5 ? 1.5 : 0.7
      }

      this.prices[id] = Math.max(1, Math.floor(price))
    })

    this.lastUpdate = turn
  }

  buy(goodId, quantity, playerResources) {
    const good = this.inventory[goodId]
    if (!good) return { success: false, reason: 'Good not available' }

    if (good.quantity < quantity) {
      return { success: false, reason: 'Insufficient stock' }
    }

    const price = this.prices[goodId]
    const totalCost = price * quantity

    // Check if player has enough credits (materials as currency)
    if (playerResources.materials < totalCost) {
      return { success: false, reason: 'Insufficient materials (currency)', cost: totalCost }
    }

    // Execute trade
    good.quantity -= quantity
    return {
      success: true,
      goodId,
      quantity,
      totalCost,
      pricePerUnit: price
    }
  }

  sell(goodId, quantity, playerResources) {
    const price = this.prices[goodId]
    if (!price) return { success: false, reason: 'Market not buying this good' }

    // Selling price is 80% of buying price
    const sellPrice = Math.floor(price * 0.8)
    const totalGain = sellPrice * quantity

    // Add to market inventory
    if (!this.inventory[goodId]) {
      this.inventory[goodId] = { quantity: 0, maxQuantity: 100 }
    }
    this.inventory[goodId].quantity += quantity

    return {
      success: true,
      goodId,
      quantity,
      totalGain,
      pricePerUnit: sellPrice
    }
  }

  getAvailableGoods() {
    return Object.entries(this.inventory)
      .filter(([id, inv]) => inv.quantity > 0)
      .map(([id, inv]) => ({
        id,
        name: id.replace('_', ' ').toUpperCase(),
        quantity: inv.quantity,
        price: this.prices[id],
        good: TRADE_GOODS[id]
      }))
  }
}

export default class TradingSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.currentMarket = null
    this.tradeHistory = []
    this.marketSeed = Date.now()
  }

  // Open a market for trading
  openMarket(marketType, turn = 0) {
    const type = MARKET_TYPES[marketType] || MARKET_TYPES.TRADE_STATION
    this.currentMarket = new Market(type, turn, this.marketSeed)
    return this.currentMarket
  }

  // Buy goods from market
  buyGood(goodId, quantity) {
    if (!this.currentMarket) {
      return { success: false, reason: 'No market available' }
    }

    const result = this.currentMarket.buy(goodId, quantity, this.gameState.resources)

    if (result.success) {
      // Deduct materials (currency)
      this.gameState.modifyResource('materials', -result.totalCost)

      // Add bought goods to inventory
      if (goodId === 'fuel' || goodId === 'food' || goodId === 'materials' || goodId === 'technology') {
        this.gameState.modifyResource(goodId, quantity)
      } else {
        // Special goods stored separately
        if (!this.gameState.specialGoods) {
          this.gameState.specialGoods = {}
        }
        this.gameState.specialGoods[goodId] = (this.gameState.specialGoods[goodId] || 0) + quantity
      }

      this.tradeHistory.push({
        type: 'buy',
        good: goodId,
        quantity,
        price: result.totalCost,
        turn: this.gameState.turn,
        market: this.currentMarket.name
      })
    }

    return result
  }

  // Sell goods to market
  sellGood(goodId, quantity) {
    if (!this.currentMarket) {
      return { success: false, reason: 'No market available' }
    }

    // Check if player has the goods
    let hasGoods = false
    if (goodId === 'fuel' || goodId === 'food' || goodId === 'materials' || goodId === 'technology') {
      hasGoods = this.gameState.resources[goodId] >= quantity
    } else {
      hasGoods = (this.gameState.specialGoods && this.gameState.specialGoods[goodId] >= quantity)
    }

    if (!hasGoods) {
      return { success: false, reason: 'Insufficient goods to sell' }
    }

    const result = this.currentMarket.sell(goodId, quantity, this.gameState.resources)

    if (result.success) {
      // Remove sold goods
      if (goodId === 'fuel' || goodId === 'food' || goodId === 'materials' || goodId === 'technology') {
        this.gameState.modifyResource(goodId, -quantity)
      } else {
        this.gameState.specialGoods[goodId] -= quantity
      }

      // Add materials (currency)
      this.gameState.modifyResource('materials', result.totalGain)

      this.tradeHistory.push({
        type: 'sell',
        good: goodId,
        quantity,
        price: result.totalGain,
        turn: this.gameState.turn,
        market: this.currentMarket.name
      })
    }

    return result
  }

  // Get current market info
  getCurrentMarket() {
    if (!this.currentMarket) return null

    return {
      name: this.currentMarket.name,
      description: this.currentMarket.description,
      goods: this.currentMarket.getAvailableGoods(),
      playerMaterials: this.gameState.resources.materials
    }
  }

  // Quick trade - bulk buy/sell
  quickTrade(transactions) {
    const results = []

    transactions.forEach(({ type, goodId, quantity }) => {
      if (type === 'buy') {
        results.push(this.buyGood(goodId, quantity))
      } else if (type === 'sell') {
        results.push(this.sellGood(goodId, quantity))
      }
    })

    return results
  }

  // Get trade recommendations based on current prices
  getTradeRecommendations() {
    if (!this.currentMarket) return []

    const recommendations = []
    const goods = this.currentMarket.getAvailableGoods()

    goods.forEach(good => {
      const basePrice = TRADE_GOODS[good.id].basePrice
      const currentPrice = good.price

      if (currentPrice < basePrice * 0.8) {
        recommendations.push({
          type: 'buy',
          good: good.id,
          reason: 'Price is significantly below average',
          savings: Math.floor((basePrice - currentPrice) / basePrice * 100) + '%'
        })
      }

      // Check if player has goods worth selling
      if (currentPrice > basePrice * 1.2) {
        recommendations.push({
          type: 'sell',
          good: good.id,
          reason: 'Price is significantly above average',
          profit: Math.floor((currentPrice - basePrice) / basePrice * 100) + '%'
        })
      }
    })

    return recommendations
  }

  // Market event - crash or boom
  triggerMarketEvent(eventType) {
    if (!this.currentMarket) return

    switch (eventType) {
      case 'fuel_shortage':
        this.currentMarket.prices.fuel *= 2
        break
      case 'tech_boom':
        this.currentMarket.prices.technology *= 0.5
        break
      case 'food_crisis':
        this.currentMarket.prices.food *= 1.8
        break
    }
  }

  closeMarket() {
    this.currentMarket = null
  }

  serialize() {
    return {
      tradeHistory: this.tradeHistory,
      marketSeed: this.marketSeed
    }
  }

  deserialize(data) {
    if (!data) return

    this.tradeHistory = data.tradeHistory || []
    this.marketSeed = data.marketSeed || Date.now()
  }
}
