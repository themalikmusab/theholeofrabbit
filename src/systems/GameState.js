import { RESOURCES, GAME_SETTINGS } from '../config'
import CrewSystem from './CrewSystem'
import CombatSystem from './CombatSystem'
import FactionSystem from './FactionSystem'
import ShipSystem from './ShipSystem'
import TradingSystem from './TradingSystem'

/**
 * GameState - Manages all game data and state
 * This is the single source of truth for the current game session
 */
export default class GameState {
  constructor() {
    this.reset()
  }

  /**
   * Reset game to initial state
   */
  reset() {
    // Resources
    this.resources = { ...GAME_SETTINGS.STARTING_RESOURCES }

    // Navigation
    this.currentSystem = 'sol'
    this.visitedSystems = ['sol']
    this.discoveredSystems = ['sol']

    // Story flags for tracking player choices
    this.flags = []

    // Game progression
    this.turn = 0
    this.daysPassed = 0

    // Special goods for trading
    this.specialGoods = {}

    // Initialize AAA systems
    this.crewSystem = new CrewSystem(this)
    this.shipSystem = new ShipSystem(this)
    this.factionSystem = new FactionSystem(this)
    this.tradingSystem = new TradingSystem(this)
    this.combatSystem = new CombatSystem(this, this.crewSystem)

    // Legacy characters (kept for backwards compatibility with old events)
    this.characters = {
      'elena': { name: 'Captain Elena Vasquez', opinion: 0, alive: true },
      'chen': { name: 'Dr. James Chen', opinion: 0, alive: true },
      'mitchell': { name: 'Commander Sarah Mitchell', opinion: 0, alive: true },
      'rodriguez': { name: 'Engineer Marcus Rodriguez', opinion: 0, alive: true },
      'okafor': { name: 'Dr. Amara Okafor', opinion: 0, alive: true },
      'park': { name: 'Councilor David Park', opinion: 0, alive: true }
    }

    // Legacy ship (kept for backwards compatibility)
    this.ship = {
      modules: {
        lifeSupport: { level: 1, damaged: false },
        engines: { level: 1, damaged: false },
        sensors: { level: 1, damaged: false },
        medical: { level: 1, damaged: false },
        research: { level: 1, damaged: false },
        hydroponics: { level: 1, damaged: false }
      },
      hull: 100
    }

    // Game state
    this.gameOver = false
    this.victory = false
    this.endingType = null
  }

  /**
   * Modify a resource value
   * @param {string} resource - Resource type from RESOURCES
   * @param {number} amount - Amount to add (positive) or subtract (negative)
   */
  modifyResource(resource, amount) {
    if (!(resource in this.resources)) {
      console.error(`Unknown resource: ${resource}`)
      return false
    }

    this.resources[resource] += amount

    // Clamp values
    if (resource === RESOURCES.MORALE) {
      this.resources[resource] = Math.max(0, Math.min(100, this.resources[resource]))
    } else if (resource === RESOURCES.POPULATION) {
      this.resources[resource] = Math.max(0, this.resources[resource])
    } else {
      this.resources[resource] = Math.max(0, this.resources[resource])
    }

    return true
  }

  /**
   * Get current value of a resource
   */
  getResource(resource) {
    return this.resources[resource] || 0
  }

  /**
   * Check if a flag exists
   */
  hasFlag(flag) {
    return this.flags.includes(flag)
  }

  /**
   * Add a story flag
   */
  addFlag(flag) {
    if (!this.hasFlag(flag)) {
      this.flags.push(flag)
    }
  }

  /**
   * Remove a story flag
   */
  removeFlag(flag) {
    this.flags = this.flags.filter(f => f !== flag)
  }

  /**
   * Visit a star system
   */
  visitSystem(systemId) {
    if (!this.visitedSystems.includes(systemId)) {
      this.visitedSystems.push(systemId)
    }
    this.currentSystem = systemId
  }

  /**
   * Discover a new system (sensors reveal it)
   */
  discoverSystem(systemId) {
    if (!this.discoveredSystems.includes(systemId)) {
      this.discoveredSystems.push(systemId)
    }
  }

  /**
   * Modify character opinion
   */
  modifyCharacterOpinion(characterId, amount) {
    if (this.characters[characterId]) {
      this.characters[characterId].opinion += amount
      this.characters[characterId].opinion = Math.max(-100, Math.min(100, this.characters[characterId].opinion))
    }
  }

  /**
   * Advance turn (used for random events, time passage)
   */
  advanceTurn() {
    this.turn++
    this.daysPassed += Phaser.Math.Between(1, 5)
  }

  /**
   * Check if game over conditions are met
   */
  checkGameOver() {
    if (this.resources[RESOURCES.POPULATION] <= 0) {
      this.gameOver = true
      this.endingType = 'extinction'
      return true
    }

    if (this.resources[RESOURCES.FOOD] <= 0) {
      this.gameOver = true
      this.endingType = 'starvation'
      return true
    }

    if (this.resources[RESOURCES.FUEL] <= 0) {
      this.gameOver = true
      this.endingType = 'stranded'
      return true
    }

    // Check ship critical failure
    if (this.shipSystem && this.shipSystem.criticalFailure) {
      this.gameOver = true
      this.endingType = 'ship_destroyed'
      return true
    }

    // Check crew - need at least one living crew member
    if (this.crewSystem && this.crewSystem.getLivingCrew().length === 0) {
      this.gameOver = true
      this.endingType = 'crew_lost'
      return true
    }

    return false
  }

  /**
   * Trigger victory
   */
  triggerVictory(endingType = 'new_home') {
    this.victory = true
    this.gameOver = true
    this.endingType = endingType
  }

  /**
   * Serialize state for saving
   */
  serialize() {
    return {
      resources: { ...this.resources },
      currentSystem: this.currentSystem,
      visitedSystems: [...this.visitedSystems],
      discoveredSystems: [...this.discoveredSystems],
      flags: [...this.flags],
      turn: this.turn,
      daysPassed: this.daysPassed,
      specialGoods: { ...this.specialGoods },
      characters: JSON.parse(JSON.stringify(this.characters)),
      ship: JSON.parse(JSON.stringify(this.ship)),
      gameOver: this.gameOver,
      victory: this.victory,
      endingType: this.endingType,
      // Serialize all AAA systems
      crewSystem: this.crewSystem.serialize(),
      shipSystem: this.shipSystem.serialize(),
      factionSystem: this.factionSystem.serialize(),
      tradingSystem: this.tradingSystem.serialize()
    }
  }

  /**
   * Deserialize state from save
   */
  deserialize(data) {
    this.resources = { ...data.resources }
    this.currentSystem = data.currentSystem
    this.visitedSystems = [...data.visitedSystems]
    this.discoveredSystems = [...data.discoveredSystems]
    this.flags = [...data.flags]
    this.turn = data.turn
    this.daysPassed = data.daysPassed
    this.specialGoods = data.specialGoods || {}
    this.characters = JSON.parse(JSON.stringify(data.characters))
    this.ship = JSON.parse(JSON.stringify(data.ship))
    this.gameOver = data.gameOver || false
    this.victory = data.victory || false
    this.endingType = data.endingType || null

    // Deserialize AAA systems
    if (data.crewSystem) this.crewSystem.deserialize(data.crewSystem)
    if (data.shipSystem) this.shipSystem.deserialize(data.shipSystem)
    if (data.factionSystem) this.factionSystem.deserialize(data.factionSystem)
    if (data.tradingSystem) this.tradingSystem.deserialize(data.tradingSystem)
  }

  /**
   * Get a summary of current state
   */
  getSummary() {
    return {
      turn: this.turn,
      days: this.daysPassed,
      population: this.resources[RESOURCES.POPULATION],
      morale: this.resources[RESOURCES.MORALE],
      systemsVisited: this.visitedSystems.length,
      currentLocation: this.currentSystem
    }
  }
}
