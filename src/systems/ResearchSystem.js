// Research System - Technology Tree with Unlockable Upgrades
export const RESEARCH_CATEGORIES = {
  PROPULSION: 'propulsion',
  WEAPONS: 'weapons',
  SHIELDS: 'shields',
  LIFE_SUPPORT: 'life_support',
  SENSORS: 'sensors',
  ENGINEERING: 'engineering'
}

export const TECHNOLOGIES = {
  // PROPULSION TREE
  EFFICIENT_ENGINES: {
    id: 'efficient_engines',
    name: 'Efficient Engines',
    description: 'Reduce fuel consumption by 20%',
    category: RESEARCH_CATEGORIES.PROPULSION,
    cost: 50,
    requires: [],
    effects: {
      fuelConsumption: -0.2
    },
    icon: '⚡'
  },
  WARP_DRIVE_I: {
    id: 'warp_drive_i',
    name: 'Warp Drive I',
    description: 'Travel costs 30% less fuel',
    category: RESEARCH_CATEGORIES.PROPULSION,
    cost: 100,
    requires: ['efficient_engines'],
    effects: {
      fuelConsumption: -0.3
    },
    icon: '🌀'
  },
  QUANTUM_DRIVE: {
    id: 'quantum_drive',
    name: 'Quantum Drive',
    description: 'Travel costs 50% less fuel. Unlock long-range jumps',
    category: RESEARCH_CATEGORIES.PROPULSION,
    cost: 200,
    requires: ['warp_drive_i'],
    effects: {
      fuelConsumption: -0.5,
      unlockJumpDrive: true
    },
    icon: '✨'
  },

  // WEAPONS TREE
  PLASMA_WEAPONS: {
    id: 'plasma_weapons',
    name: 'Plasma Weapons',
    description: '+25% combat damage',
    category: RESEARCH_CATEGORIES.WEAPONS,
    cost: 60,
    requires: [],
    effects: {
      weaponDamage: 1.25
    },
    icon: '🔫'
  },
  GUIDED_MISSILES: {
    id: 'guided_missiles',
    name: 'Guided Missiles',
    description: '+50% combat damage, +15% hit chance',
    category: RESEARCH_CATEGORIES.WEAPONS,
    cost: 120,
    requires: ['plasma_weapons'],
    effects: {
      weaponDamage: 1.5,
      hitChance: 0.15
    },
    icon: '🚀'
  },
  ANTIMATTER_CANNON: {
    id: 'antimatter_cannon',
    name: 'Antimatter Cannon',
    description: '+100% combat damage. Devastating special attack',
    category: RESEARCH_CATEGORIES.WEAPONS,
    cost: 250,
    requires: ['guided_missiles'],
    effects: {
      weaponDamage: 2.0,
      unlockSuperWeapon: true
    },
    icon: '💥'
  },

  // SHIELDS TREE
  REINFORCED_SHIELDS: {
    id: 'reinforced_shields',
    name: 'Reinforced Shields',
    description: '+30% shield capacity',
    category: RESEARCH_CATEGORIES.SHIELDS,
    cost: 50,
    requires: [],
    effects: {
      shieldCapacity: 1.3
    },
    icon: '🛡️'
  },
  REGENERATIVE_SHIELDS: {
    id: 'regenerative_shields',
    name: 'Regenerative Shields',
    description: 'Shields regenerate 10 points per turn in combat',
    category: RESEARCH_CATEGORIES.SHIELDS,
    cost: 100,
    requires: ['reinforced_shields'],
    effects: {
      shieldRegen: 10
    },
    icon: '💫'
  },
  PHASE_SHIELDS: {
    id: 'phase_shields',
    name: 'Phase Shields',
    description: '+80% shield capacity, 20% chance to avoid damage entirely',
    category: RESEARCH_CATEGORIES.SHIELDS,
    cost: 200,
    requires: ['regenerative_shields'],
    effects: {
      shieldCapacity: 1.8,
      dodgeChance: 0.2
    },
    icon: '🌟'
  },

  // LIFE SUPPORT TREE
  HYDROPONICS: {
    id: 'hydroponics',
    name: 'Hydroponics Bay',
    description: 'Generate +5 food per turn',
    category: RESEARCH_CATEGORIES.LIFE_SUPPORT,
    cost: 80,
    requires: [],
    effects: {
      foodGeneration: 5
    },
    icon: '🌱'
  },
  ADVANCED_RECYCLING: {
    id: 'advanced_recycling',
    name: 'Advanced Recycling',
    description: 'Generate +10 food per turn, +5 materials per turn',
    category: RESEARCH_CATEGORIES.LIFE_SUPPORT,
    cost: 150,
    requires: ['hydroponics'],
    effects: {
      foodGeneration: 10,
      materialGeneration: 5
    },
    icon: '♻️'
  },
  CLOSED_ECOSYSTEM: {
    id: 'closed_ecosystem',
    name: 'Closed Ecosystem',
    description: 'Generate +20 food, +10 materials, +10 morale per turn',
    category: RESEARCH_CATEGORIES.LIFE_SUPPORT,
    cost: 250,
    requires: ['advanced_recycling'],
    effects: {
      foodGeneration: 20,
      materialGeneration: 10,
      moraleGeneration: 10
    },
    icon: '🌍'
  },

  // SENSORS TREE
  LONG_RANGE_SENSORS: {
    id: 'long_range_sensors',
    name: 'Long-Range Sensors',
    description: 'Discover nearby systems automatically',
    category: RESEARCH_CATEGORIES.SENSORS,
    cost: 60,
    requires: [],
    effects: {
      scanRange: 2
    },
    icon: '📡'
  },
  DEEP_SCAN: {
    id: 'deep_scan',
    name: 'Deep Scan Arrays',
    description: 'Reveal system contents before visiting. +20% event rewards',
    category: RESEARCH_CATEGORIES.SENSORS,
    cost: 120,
    requires: ['long_range_sensors'],
    effects: {
      scanRange: 3,
      eventRewardBonus: 0.2
    },
    icon: '🔭'
  },
  QUANTUM_SENSORS: {
    id: 'quantum_sensors',
    name: 'Quantum Sensors',
    description: 'See all systems. +50% event rewards. Detect threats early',
    category: RESEARCH_CATEGORIES.SENSORS,
    cost: 200,
    requires: ['deep_scan'],
    effects: {
      scanRange: 999,
      eventRewardBonus: 0.5,
      threatDetection: true
    },
    icon: '👁️'
  },

  // ENGINEERING TREE
  NANOBOTS: {
    id: 'nanobots',
    name: 'Nanobots',
    description: 'Repair 5 hull per turn automatically',
    category: RESEARCH_CATEGORIES.ENGINEERING,
    cost: 70,
    requires: [],
    effects: {
      hullRegen: 5
    },
    icon: '🔧'
  },
  SELF_REPAIR: {
    id: 'self_repair',
    name: 'Self-Repair Systems',
    description: 'Repair 15 hull per turn, repair modules automatically',
    category: RESEARCH_CATEGORIES.ENGINEERING,
    cost: 140,
    requires: ['nanobots'],
    effects: {
      hullRegen: 15,
      autoRepair: true
    },
    icon: '⚙️'
  },
  ADAPTIVE_HULL: {
    id: 'adaptive_hull',
    name: 'Adaptive Hull',
    description: '+50% hull capacity, 30 hull regen per turn, immune to critical hits',
    category: RESEARCH_CATEGORIES.ENGINEERING,
    cost: 220,
    requires: ['self_repair'],
    effects: {
      hullCapacity: 1.5,
      hullRegen: 30,
      criticalImmune: true
    },
    icon: '🏗️'
  }
}

export default class ResearchSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.completedResearch = []
    this.currentResearch = null
    this.researchProgress = 0
  }

  // Get available technologies to research
  getAvailableResearch() {
    const available = []

    Object.values(TECHNOLOGIES).forEach(tech => {
      // Skip if already researched
      if (this.isResearched(tech.id)) return

      // Check if requirements are met
      const requirementsMet = tech.requires.every(reqId => this.isResearched(reqId))

      if (requirementsMet) {
        available.push(tech)
      }
    })

    return available
  }

  // Check if technology is researched
  isResearched(techId) {
    return this.completedResearch.includes(techId)
  }

  // Start researching a technology
  startResearch(techId) {
    const tech = Object.values(TECHNOLOGIES).find(t => t.id === techId)
    if (!tech) return { success: false, reason: 'Technology not found' }

    // Check if already researched
    if (this.isResearched(techId)) {
      return { success: false, reason: 'Already researched' }
    }

    // Check requirements
    const requirementsMet = tech.requires.every(reqId => this.isResearched(reqId))
    if (!requirementsMet) {
      return { success: false, reason: 'Requirements not met' }
    }

    // Check if can afford
    if (this.gameState.resources.technology < tech.cost) {
      return { success: false, reason: `Need ${tech.cost} technology` }
    }

    // Deduct cost
    this.gameState.modifyResource('technology', -tech.cost)

    // Mark as complete (instant for now, could be multi-turn)
    this.completeResearch(techId)

    return { success: true, tech }
  }

  // Complete research and apply effects
  completeResearch(techId) {
    const tech = Object.values(TECHNOLOGIES).find(t => t.id === techId)
    if (!tech) return

    this.completedResearch.push(techId)

    // Apply passive effects
    this.applyResearchEffects(tech)

    console.log(`✅ Researched: ${tech.name}`)
  }

  // Apply research effects to game state
  applyResearchEffects(tech) {
    const effects = tech.effects

    // Store bonuses for later use by other systems
    if (!this.gameState.researchBonuses) {
      this.gameState.researchBonuses = {}
    }

    Object.entries(effects).forEach(([key, value]) => {
      if (!this.gameState.researchBonuses[key]) {
        this.gameState.researchBonuses[key] = key.includes('Consumption') ? 0 : 1
      }

      if (key.includes('Consumption')) {
        this.gameState.researchBonuses[key] += value
      } else if (key.includes('Capacity') || key.includes('Damage') || key.includes('Bonus')) {
        this.gameState.researchBonuses[key] *= value
      } else {
        this.gameState.researchBonuses[key] = value
      }
    })
  }

  // Get total research bonuses
  getBonus(type) {
    if (!this.gameState.researchBonuses) return type.includes('Capacity') || type.includes('Damage') ? 1 : 0
    return this.gameState.researchBonuses[type] || (type.includes('Capacity') || type.includes('Damage') ? 1 : 0)
  }

  // Process per-turn effects
  processTurnEffects() {
    const effects = {
      food: 0,
      materials: 0,
      morale: 0,
      hull: 0,
      shields: 0
    }

    this.completedResearch.forEach(techId => {
      const tech = Object.values(TECHNOLOGIES).find(t => t.id === techId)
      if (!tech) return

      if (tech.effects.foodGeneration) effects.food += tech.effects.foodGeneration
      if (tech.effects.materialGeneration) effects.materials += tech.effects.materialGeneration
      if (tech.effects.moraleGeneration) effects.morale += tech.effects.moraleGeneration
      if (tech.effects.hullRegen) effects.hull += tech.effects.hullRegen
      if (tech.effects.shieldRegen) effects.shields += tech.effects.shieldRegen
    })

    // Apply effects
    if (effects.food > 0) this.gameState.modifyResource('food', effects.food)
    if (effects.materials > 0) this.gameState.modifyResource('materials', effects.materials)
    if (effects.morale > 0) this.gameState.modifyResource('morale', effects.morale)

    return effects
  }

  // Get research progress summary
  getResearchSummary() {
    const byCategory = {}

    Object.values(RESEARCH_CATEGORIES).forEach(cat => {
      byCategory[cat] = {
        completed: 0,
        total: 0
      }
    })

    Object.values(TECHNOLOGIES).forEach(tech => {
      byCategory[tech.category].total++
      if (this.isResearched(tech.id)) {
        byCategory[tech.category].completed++
      }
    })

    return {
      totalCompleted: this.completedResearch.length,
      totalAvailable: Object.keys(TECHNOLOGIES).length,
      byCategory,
      available: this.getAvailableResearch().length
    }
  }

  serialize() {
    return {
      completedResearch: this.completedResearch,
      currentResearch: this.currentResearch,
      researchProgress: this.researchProgress
    }
  }

  deserialize(data) {
    if (!data) return
    this.completedResearch = data.completedResearch || []
    this.currentResearch = data.currentResearch || null
    this.researchProgress = data.researchProgress || 0

    // Reapply all research effects
    this.completedResearch.forEach(techId => {
      const tech = Object.values(TECHNOLOGIES).find(t => t.id === techId)
      if (tech) this.applyResearchEffects(tech)
    })
  }
}
