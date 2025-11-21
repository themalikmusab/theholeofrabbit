// Ship System - Ship modules, damage, upgrades, and repairs
import { COLORS } from '../config'

export const SHIP_MODULES = {
  HULL: {
    id: 'hull',
    name: 'Hull Integrity',
    description: 'Main structure of the ship',
    maxHealth: 100,
    critical: true
  },
  ENGINES: {
    id: 'engines',
    name: 'Engine Systems',
    description: 'Propulsion and maneuvering',
    maxHealth: 100,
    critical: true,
    affects: 'fuel_efficiency'
  },
  LIFE_SUPPORT: {
    id: 'life_support',
    name: 'Life Support',
    description: 'Oxygen, temperature, and crew survival',
    maxHealth: 100,
    critical: true,
    affects: 'crew_health'
  },
  SHIELDS: {
    id: 'shields',
    name: 'Shield Generators',
    description: 'Energy shields for protection',
    maxHealth: 100,
    critical: false,
    affects: 'combat_defense'
  },
  WEAPONS: {
    id: 'weapons',
    name: 'Weapon Systems',
    description: 'Offensive capabilities',
    maxHealth: 100,
    critical: false,
    affects: 'combat_attack'
  },
  SENSORS: {
    id: 'sensors',
    name: 'Sensor Array',
    description: 'Scanning and detection systems',
    maxHealth: 100,
    critical: false,
    affects: 'scanning_range'
  },
  CARGO: {
    id: 'cargo',
    name: 'Cargo Bay',
    description: 'Storage for resources',
    maxHealth: 100,
    critical: false,
    affects: 'storage_capacity'
  }
}

export const UPGRADE_TIERS = {
  BASIC: 1,
  IMPROVED: 2,
  ADVANCED: 3,
  MILITARY: 4,
  PROTOTYPE: 5
}

export class ShipModule {
  constructor(moduleData) {
    this.id = moduleData.id
    this.name = moduleData.name
    this.description = moduleData.description
    this.health = moduleData.maxHealth
    this.maxHealth = moduleData.maxHealth
    this.critical = moduleData.critical
    this.affects = moduleData.affects
    this.upgradeTier = UPGRADE_TIERS.BASIC
    this.damaged = false
    this.offline = false
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount)

    if (this.health < this.maxHealth * 0.5 && !this.damaged) {
      this.damaged = true
    }

    if (this.health <= 0 && !this.offline) {
      this.offline = true
      return { destroyed: true, critical: this.critical }
    }

    return { destroyed: false, damaged: this.damaged }
  }

  repair(amount) {
    const oldHealth = this.health
    this.health = Math.min(this.maxHealth, this.health + amount)

    if (this.health >= this.maxHealth * 0.5 && this.damaged) {
      this.damaged = false
    }

    if (this.health > 0 && this.offline) {
      this.offline = false
    }

    return {
      repaired: this.health - oldHealth,
      fullyRepaired: this.health === this.maxHealth,
      restored: !this.damaged && !this.offline
    }
  }

  upgrade() {
    if (this.upgradeTier < UPGRADE_TIERS.PROTOTYPE) {
      this.upgradeTier++
      this.maxHealth += 20
      this.health += 20
      return true
    }
    return false
  }

  getEfficiency() {
    if (this.offline) return 0
    if (this.damaged) return 0.5
    return (this.health / this.maxHealth) * (1 + this.upgradeTier * 0.1)
  }

  getStatusColor() {
    if (this.offline) return COLORS.DANGER
    if (this.health < this.maxHealth * 0.3) return COLORS.DANGER
    if (this.health < this.maxHealth * 0.6) return COLORS.WARNING
    return COLORS.SUCCESS
  }

  serialize() {
    return {
      id: this.id,
      health: this.health,
      maxHealth: this.maxHealth,
      upgradeTier: this.upgradeTier,
      damaged: this.damaged,
      offline: this.offline
    }
  }
}

export default class ShipSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.modules = {}
    this.totalIntegrity = 100
    this.criticalFailure = false

    this.initializeModules()
  }

  initializeModules() {
    Object.values(SHIP_MODULES).forEach(moduleData => {
      this.modules[moduleData.id] = new ShipModule(moduleData)
    })
  }

  // Get a specific module
  getModule(moduleId) {
    return this.modules[moduleId]
  }

  // Get all modules
  getAllModules() {
    return Object.values(this.modules)
  }

  // Get damaged modules
  getDamagedModules() {
    return this.getAllModules().filter(m => m.damaged || m.offline)
  }

  // Take damage to ship (distributed across modules)
  takeDamage(amount, specificModule = null) {
    const results = []

    if (specificModule) {
      // Damage specific module
      const module = this.getModule(specificModule)
      if (module) {
        const result = module.takeDamage(amount)
        results.push({ module: module.name, ...result })
      }
    } else {
      // Distribute damage across random modules
      const moduleList = this.getAllModules().filter(m => !m.offline)
      const damagePerModule = Math.ceil(amount / Math.max(1, moduleList.length))

      moduleList.forEach(module => {
        if (Math.random() < 0.4) { // 40% chance each module takes damage
          const result = module.takeDamage(damagePerModule)
          if (result.destroyed || result.damaged) {
            results.push({ module: module.name, ...result })
          }
        }
      })

      // Hull always takes some damage
      const hull = this.getModule('hull')
      const hullResult = hull.takeDamage(Math.floor(amount * 0.3))
      results.push({ module: 'Hull', ...hullResult })
    }

    // Check for critical failure
    this.checkCriticalFailure()

    // Update total integrity
    this.updateIntegrity()

    return results
  }

  // Repair module(s)
  repairModule(moduleId, amount, materials = 0) {
    const module = this.getModule(moduleId)
    if (!module) return null

    // Calculate material cost
    const repairCost = Math.ceil(amount / 2)
    if (materials < repairCost) {
      return { success: false, reason: 'Not enough materials' }
    }

    const result = module.repair(amount)
    this.gameState.modifyResource('materials', -repairCost)

    this.updateIntegrity()

    return {
      success: true,
      module: module.name,
      ...result,
      materialsCost: repairCost
    }
  }

  // Auto-repair all modules (requires materials and engineer crew)
  autoRepairAll(availableMaterials) {
    const damaged = this.getDamagedModules()
    if (damaged.length === 0) return { success: false, reason: 'No damage to repair' }

    const results = []
    let materialsUsed = 0

    damaged.forEach(module => {
      const repairAmount = Math.min(50, module.maxHealth - module.health)
      const cost = Math.ceil(repairAmount / 2)

      if (materialsUsed + cost <= availableMaterials) {
        const result = module.repair(repairAmount)
        results.push({ module: module.name, ...result })
        materialsUsed += cost
      }
    })

    if (results.length > 0) {
      this.gameState.modifyResource('materials', -materialsUsed)
      this.updateIntegrity()
    }

    return {
      success: results.length > 0,
      repaired: results,
      materialsUsed
    }
  }

  // Upgrade a module
  upgradeModule(moduleId, technology = 0, materials = 0) {
    const module = this.getModule(moduleId)
    if (!module) return { success: false, reason: 'Module not found' }

    const techCost = module.upgradeTier * 10
    const materialCost = module.upgradeTier * 20

    if (technology < techCost) {
      return { success: false, reason: 'Not enough technology' }
    }
    if (materials < materialCost) {
      return { success: false, reason: 'Not enough materials' }
    }

    const upgraded = module.upgrade()
    if (!upgraded) {
      return { success: false, reason: 'Module already at max tier' }
    }

    this.gameState.modifyResource('technology', -techCost)
    this.gameState.modifyResource('materials', -materialCost)

    return {
      success: true,
      module: module.name,
      newTier: module.upgradeTier,
      techCost,
      materialCost
    }
  }

  // Get module efficiency bonus
  getModuleEfficiency(moduleId) {
    const module = this.getModule(moduleId)
    return module ? module.getEfficiency() : 0
  }

  // Apply module effects to gameplay
  applyModuleEffects() {
    const effects = {}

    // Engines affect fuel consumption
    const engineEfficiency = this.getModuleEfficiency('engines')
    effects.fuelMultiplier = 1 / Math.max(0.5, engineEfficiency)

    // Life support affects crew health
    const lifeSupportEfficiency = this.getModuleEfficiency('life_support')
    effects.crewHealthMultiplier = lifeSupportEfficiency

    // Shields affect combat defense
    const shieldEfficiency = this.getModuleEfficiency('shields')
    effects.defenseBonus = shieldEfficiency * 50

    // Weapons affect combat attack
    const weaponEfficiency = this.getModuleEfficiency('weapons')
    effects.attackBonus = weaponEfficiency * 30

    // Sensors affect scanning range
    const sensorEfficiency = this.getModuleEfficiency('sensors')
    effects.scanRange = Math.floor(sensorEfficiency * 10)

    // Cargo affects storage
    const cargoEfficiency = this.getModuleEfficiency('cargo')
    effects.storageMultiplier = cargoEfficiency

    return effects
  }

  // Update total ship integrity
  updateIntegrity() {
    const moduleHealths = this.getAllModules().map(m =>
      (m.health / m.maxHealth) * 100
    )
    this.totalIntegrity = Math.floor(
      moduleHealths.reduce((sum, h) => sum + h, 0) / moduleHealths.length
    )
  }

  // Check for critical failure (game over condition)
  checkCriticalFailure() {
    const hull = this.getModule('hull')
    const engines = this.getModule('engines')
    const lifeSupport = this.getModule('life_support')

    if (hull.offline || (engines.offline && lifeSupport.offline)) {
      this.criticalFailure = true
      return true
    }

    return false
  }

  // Get ship status summary
  getShipStatus() {
    const damaged = this.getDamagedModules()
    const offline = this.getAllModules().filter(m => m.offline)

    return {
      integrity: this.totalIntegrity,
      criticalFailure: this.criticalFailure,
      damagedModules: damaged.length,
      offlineModules: offline.length,
      effects: this.applyModuleEffects(),
      modules: this.getAllModules().map(m => ({
        name: m.name,
        health: m.health,
        maxHealth: m.maxHealth,
        efficiency: m.getEfficiency(),
        status: m.offline ? 'OFFLINE' : m.damaged ? 'DAMAGED' : 'OPERATIONAL',
        tier: m.upgradeTier
      }))
    }
  }

  // Random system failure event
  randomSystemFailure() {
    const operational = this.getAllModules().filter(m => !m.offline)
    if (operational.length === 0) return null

    const module = operational[Math.floor(Math.random() * operational.length)]
    const damage = 20 + Math.floor(Math.random() * 30)
    const result = module.takeDamage(damage)

    this.updateIntegrity()

    return {
      module: module.name,
      damage,
      ...result
    }
  }

  serialize() {
    return {
      modules: Object.fromEntries(
        Object.entries(this.modules).map(([id, module]) => [id, module.serialize()])
      ),
      totalIntegrity: this.totalIntegrity,
      criticalFailure: this.criticalFailure
    }
  }

  deserialize(data) {
    if (!data) return

    Object.entries(data.modules || {}).forEach(([id, moduleData]) => {
      const module = this.getModule(id)
      if (module) {
        module.health = moduleData.health
        module.maxHealth = moduleData.maxHealth
        module.upgradeTier = moduleData.upgradeTier
        module.damaged = moduleData.damaged
        module.offline = moduleData.offline
      }
    })

    this.totalIntegrity = data.totalIntegrity || 100
    this.criticalFailure = data.criticalFailure || false
  }
}
