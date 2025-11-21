// Away Mission System - Send crew on planetary expeditions
export const MISSION_TYPES = {
  RESOURCE_SURVEY: {
    id: 'resource_survey',
    name: 'Resource Survey',
    description: 'Survey planet for valuable resources',
    duration: 3,
    riskLevel: 'low',
    requiredCrew: 2,
    rewards: { materials: [20, 50], fuel: [10, 30] }
  },
  ALIEN_CONTACT: {
    id: 'alien_contact',
    name: 'Alien Contact',
    description: 'Make contact with indigenous species',
    duration: 5,
    riskLevel: 'medium',
    requiredCrew: 3,
    rewards: { technology: [30, 60], factionRep: [10, 30] }
  },
  ANCIENT_RUINS: {
    id: 'ancient_ruins',
    name: 'Ancient Ruins Exploration',
    description: 'Explore mysterious ancient structures',
    duration: 4,
    riskLevel: 'high',
    requiredCrew: 3,
    rewards: { technology: [50, 100], artifacts: [1, 3] }
  },
  RESCUE_MISSION: {
    id: 'rescue_mission',
    name: 'Rescue Mission',
    description: 'Rescue stranded survivors',
    duration: 4,
    riskLevel: 'medium',
    requiredCrew: 3,
    rewards: { population: [5, 15], morale: [15, 30] }
  },
  COMBAT_PATROL: {
    id: 'combat_patrol',
    name: 'Combat Patrol',
    description: 'Clear hostile forces from area',
    duration: 3,
    riskLevel: 'very_high',
    requiredCrew: 4,
    rewards: { materials: [40, 80], weapons: [1, 2] }
  },
  SCIENTIFIC_RESEARCH: {
    id: 'scientific_research',
    name: 'Scientific Research',
    description: 'Conduct field research on unique phenomena',
    duration: 6,
    riskLevel: 'low',
    requiredCrew: 2,
    rewards: { technology: [60, 120] }
  },
  DERELICT_SALVAGE: {
    id: 'derelict_salvage',
    name: 'Derelict Salvage',
    description: 'Salvage valuable tech from derelict ship',
    duration: 4,
    riskLevel: 'medium',
    requiredCrew: 3,
    rewards: { materials: [50, 100], technology: [20, 40], shipParts: [1, 2] }
  }
}

export const MISSION_EVENTS = [
  {
    id: 'hostile_wildlife',
    description: 'The team encounters hostile alien wildlife!',
    riskLevel: 'medium',
    outcomes: [
      {
        choice: 'Fight back',
        result: 'The team successfully defends themselves',
        effects: { crewHealth: -15, materials: 10 }
      },
      {
        choice: 'Retreat',
        result: 'The team safely returns to the ship',
        effects: { missionAborted: true }
      },
      {
        choice: 'Use tranquilizers',
        result: 'Team pacifies the creatures and continues',
        effects: { crewHealth: -5, continuesMission: true }
      }
    ]
  },
  {
    id: 'equipment_failure',
    description: 'Critical equipment malfunctions during the mission!',
    riskLevel: 'low',
    outcomes: [
      {
        choice: 'Field repair',
        result: 'Engineer successfully repairs the equipment',
        effects: { timeLoss: 1 }
      },
      {
        choice: 'Jury-rig solution',
        result: 'Team continues with improvised fix',
        effects: { efficiency: 0.7 }
      },
      {
        choice: 'Abort mission',
        result: 'Team returns safely without completing objective',
        effects: { missionAborted: true }
      }
    ]
  },
  {
    id: 'unexpected_discovery',
    description: 'The team discovers something unexpected!',
    riskLevel: 'none',
    outcomes: [
      {
        choice: 'Investigate thoroughly',
        result: 'Detailed investigation reveals valuable information',
        effects: { technology: 30, timeLoss: 2 }
      },
      {
        choice: 'Quick scan and continue',
        result: 'Team logs discovery and continues primary mission',
        effects: { technology: 10 }
      },
      {
        choice: 'Focus on primary objective',
        result: 'Team ignores discovery to complete mission faster',
        effects: { efficiency: 1.2 }
      }
    ]
  },
  {
    id: 'crew_conflict',
    description: 'Tension erupts between crew members!',
    riskLevel: 'low',
    outcomes: [
      {
        choice: 'Intervene directly',
        result: 'You resolve the conflict remotely',
        effects: { crewMorale: -5 }
      },
      {
        choice: 'Let team leader handle it',
        result: 'The senior crew member mediates successfully',
        effects: { crewRelationship: 10 }
      },
      {
        choice: 'Recall the team',
        result: 'You bring them back early',
        effects: { missionAborted: true, crewMorale: -10 }
      }
    ]
  },
  {
    id: 'environmental_hazard',
    description: 'Dangerous environmental conditions threaten the team!',
    riskLevel: 'high',
    outcomes: [
      {
        choice: 'Push through',
        result: 'Team endures harsh conditions to complete mission',
        effects: { crewHealth: -25, rewardBonus: 1.5 }
      },
      {
        choice: 'Wait it out',
        result: 'Team finds shelter and waits for conditions to improve',
        effects: { timeLoss: 2, crewHealth: -5 }
      },
      {
        choice: 'Extract immediately',
        result: 'Emergency extraction saves the crew',
        effects: { missionAborted: true, fuel: -15 }
      }
    ]
  }
]

class AwayMission {
  constructor(missionType, crew, planet) {
    this.id = `mission_${Date.now()}`
    this.type = missionType
    this.crew = crew // Array of crew IDs
    this.planet = planet
    this.startTurn = 0
    this.turnsRemaining = missionType.duration
    this.status = 'in_progress' // in_progress, completed, failed, aborted
    this.events = []
    this.rewards = {}
    this.efficiency = 1.0
  }

  progress(turn) {
    this.turnsRemaining--

    // Random event chance
    if (Math.random() < 0.3) {
      const event = MISSION_EVENTS[Math.floor(Math.random() * MISSION_EVENTS.length)]
      return { progressUpdate: true, event }
    }

    if (this.turnsRemaining <= 0) {
      this.status = 'completed'
      return { completed: true }
    }

    return { progressUpdate: true }
  }

  handleEventChoice(event, choiceIndex) {
    const choice = event.outcomes[choiceIndex]
    this.events.push({ event: event.id, choice: choice.choice, result: choice.result })

    const effects = choice.effects

    // Apply effects
    if (effects.missionAborted) {
      this.status = 'aborted'
    }

    if (effects.timeLoss) {
      this.turnsRemaining += effects.timeLoss
    }

    if (effects.efficiency) {
      this.efficiency *= effects.efficiency
    }

    if (effects.rewardBonus) {
      this.efficiency *= effects.rewardBonus
    }

    return { effects, result: choice.result }
  }

  calculateRewards(gameState) {
    const rewards = {}
    const baseRewards = this.type.rewards

    Object.entries(baseRewards).forEach(([resource, range]) => {
      if (Array.isArray(range)) {
        const [min, max] = range
        const base = min + Math.floor(Math.random() * (max - min))
        rewards[resource] = Math.floor(base * this.efficiency)
      }
    })

    // Crew skill bonuses
    this.crew.forEach(crewId => {
      const crewMember = gameState.crewSystem.getCrewMember(crewId)
      if (crewMember) {
        const bonus = crewMember.getSkillBonus()

        // Apply skill-specific bonuses
        if (crewMember.skill === 'scientist' && rewards.technology) {
          rewards.technology = Math.floor(rewards.technology * (1 + bonus))
        }
        if (crewMember.skill === 'engineer' && rewards.materials) {
          rewards.materials = Math.floor(rewards.materials * (1 + bonus))
        }
        if (crewMember.skill === 'security' && this.type.riskLevel === 'high') {
          // Security reduces risk
          Object.keys(rewards).forEach(key => {
            rewards[key] = Math.floor(rewards[key] * 1.1)
          })
        }
      }
    })

    this.rewards = rewards
    return rewards
  }

  getRiskOfInjury() {
    const baseRisk = {
      'low': 0.05,
      'medium': 0.15,
      'high': 0.3,
      'very_high': 0.5
    }

    return baseRisk[this.type.riskLevel] || 0.1
  }
}

export default class AwayMissionSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.activeMissions = []
    this.completedMissions = []
    this.availableMissions = []
  }

  // Generate available missions based on current system
  generateMissions(systemType) {
    this.availableMissions = []

    // Different system types offer different missions
    const missionPools = {
      'habitable': ['RESOURCE_SURVEY', 'ALIEN_CONTACT', 'RESCUE_MISSION', 'SCIENTIFIC_RESEARCH'],
      'resource': ['RESOURCE_SURVEY', 'SCIENTIFIC_RESEARCH'],
      'ruins': ['ANCIENT_RUINS', 'DERELICT_SALVAGE', 'SCIENTIFIC_RESEARCH'],
      'hostile': ['COMBAT_PATROL', 'RESCUE_MISSION'],
      'anomaly': ['SCIENTIFIC_RESEARCH', 'ANCIENT_RUINS'],
      'barren': ['RESOURCE_SURVEY', 'DERELICT_SALVAGE']
    }

    const pool = missionPools[systemType] || ['RESOURCE_SURVEY']
    const count = 1 + Math.floor(Math.random() * 2) // 1-2 missions

    for (let i = 0; i < count; i++) {
      const missionTypeName = pool[Math.floor(Math.random() * pool.length)]
      const missionType = MISSION_TYPES[missionTypeName]
      if (missionType) {
        this.availableMissions.push(missionType)
      }
    }

    return this.availableMissions
  }

  // Start a mission with selected crew
  startMission(missionType, crewIds, planet) {
    // Validate crew availability
    const livingCrew = this.gameState.crewSystem.getLivingCrew()
    const availableCrew = livingCrew.filter(c => !this.isCrewOnMission(c.id))

    if (crewIds.length < missionType.requiredCrew) {
      return { success: false, reason: `Requires ${missionType.requiredCrew} crew members` }
    }

    const selectedCrew = crewIds.map(id => availableCrew.find(c => c.id === id)).filter(c => c)

    if (selectedCrew.length < crewIds.length) {
      return { success: false, reason: 'Some selected crew are unavailable' }
    }

    // Create mission
    const mission = new AwayMission(missionType, crewIds, planet)
    mission.startTurn = this.gameState.turn

    this.activeMissions.push(mission)

    return { success: true, mission }
  }

  // Check if crew member is on a mission
  isCrewOnMission(crewId) {
    return this.activeMissions.some(m => m.crew.includes(crewId))
  }

  // Progress all active missions
  progressMissions() {
    const updates = []

    this.activeMissions.forEach(mission => {
      const result = mission.progress(this.gameState.turn)

      if (result.completed) {
        this.completeMission(mission)
        updates.push({
          type: 'completed',
          mission,
          rewards: mission.rewards
        })
      } else if (result.event) {
        updates.push({
          type: 'event',
          mission,
          event: result.event
        })
      }
    })

    return updates
  }

  // Complete a mission and apply rewards
  completeMission(mission) {
    const rewards = mission.calculateRewards(this.gameState)

    // Apply rewards
    Object.entries(rewards).forEach(([resource, amount]) => {
      if (resource === 'factionRep') {
        // Random faction rep increase
        const factionIds = Object.keys(this.gameState.factionSystem.factions)
        const randomFaction = factionIds[Math.floor(Math.random() * factionIds.length)]
        this.gameState.factionSystem.modifyReputation(randomFaction, amount, 'Away mission success')
      } else if (resource === 'artifacts' || resource === 'weapons' || resource === 'shipParts') {
        // Special goods
        if (!this.gameState.specialGoods) this.gameState.specialGoods = {}
        this.gameState.specialGoods[resource] = (this.gameState.specialGoods[resource] || 0) + amount
      } else {
        // Regular resources
        this.gameState.modifyResource(resource, amount)
      }
    })

    // Crew experience and risk
    mission.crew.forEach(crewId => {
      const crewMember = this.gameState.crewSystem.getCrewMember(crewId)
      if (crewMember) {
        // Morale boost for successful mission
        crewMember.modifyMorale(10, 'Successful away mission')

        // Risk of injury
        if (Math.random() < mission.getRiskOfInjury()) {
          const injury = 10 + Math.floor(Math.random() * 20)
          crewMember.modifyHealth(-injury, 'Away mission injury')
        }
      }
    })

    // Move to completed
    this.activeMissions = this.activeMissions.filter(m => m.id !== mission.id)
    this.completedMissions.push(mission)
  }

  // Abort a mission
  abortMission(missionId) {
    const mission = this.activeMissions.find(m => m.id === missionId)
    if (!mission) return false

    mission.status = 'aborted'

    // Morale penalty
    mission.crew.forEach(crewId => {
      const crewMember = this.gameState.crewSystem.getCrewMember(crewId)
      if (crewMember) {
        crewMember.modifyMorale(-15, 'Mission aborted')
      }
    })

    this.activeMissions = this.activeMissions.filter(m => m.id !== missionId)
    return true
  }

  // Get active missions
  getActiveMissions() {
    return this.activeMissions
  }

  // Get available crew for missions
  getAvailableCrew() {
    const livingCrew = this.gameState.crewSystem.getLivingCrew()
    return livingCrew.filter(c => !this.isCrewOnMission(c.id) && c.health > 30)
  }

  // Get mission summary
  getMissionSummary() {
    return {
      active: this.activeMissions.length,
      completed: this.completedMissions.length,
      availableCrew: this.getAvailableCrew().length
    }
  }

  serialize() {
    return {
      activeMissions: this.activeMissions.map(m => ({
        id: m.id,
        type: m.type.id,
        crew: m.crew,
        planet: m.planet,
        startTurn: m.startTurn,
        turnsRemaining: m.turnsRemaining,
        status: m.status,
        events: m.events,
        efficiency: m.efficiency
      })),
      completedMissions: this.completedMissions.length,
      availableMissions: this.availableMissions.map(m => m.id)
    }
  }

  deserialize(data) {
    if (!data) return

    // Reconstruct missions
    this.activeMissions = (data.activeMissions || []).map(mData => {
      const missionType = MISSION_TYPES[mData.type.toUpperCase()] ||
                         Object.values(MISSION_TYPES).find(t => t.id === mData.type)
      const mission = new AwayMission(missionType, mData.crew, mData.planet)
      mission.id = mData.id
      mission.startTurn = mData.startTurn
      mission.turnsRemaining = mData.turnsRemaining
      mission.status = mData.status
      mission.events = mData.events || []
      mission.efficiency = mData.efficiency || 1.0
      return mission
    })
  }
}
