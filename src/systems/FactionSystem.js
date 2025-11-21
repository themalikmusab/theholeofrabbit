// Faction System - Dynamic alien races and reputation
import { COLORS } from '../config'

export const FACTIONS = {
  TERRA_REMNANT: {
    id: 'terra_remnant',
    name: 'Terra Remnant Fleet',
    description: 'Other survivors from Earth, scattered across the galaxy',
    color: '#4A90E2',
    initialReputation: 50,
    traits: ['friendly', 'desperate', 'resourceful'],
    territory: ['habitable', 'ruins']
  },
  KRYLL_EMPIRE: {
    id: 'kryll_empire',
    name: 'Kryll Empire',
    description: 'Aggressive insectoid species expanding their territory',
    color: '#E74C3C',
    initialReputation: -20,
    traits: ['hostile', 'militaristic', 'territorial'],
    territory: ['hostile', 'inhabited']
  },
  ZENARI_COLLECTIVE: {
    id: 'zenari_collective',
    name: 'Zenari Collective',
    description: 'Advanced telepathic beings focused on knowledge',
    color: '#9B59B6',
    initialReputation: 0,
    traits: ['neutral', 'scientific', 'mysterious'],
    territory: ['anomaly', 'inhabited']
  },
  MERCHANT_GUILD: {
    id: 'merchant_guild',
    name: 'Galactic Merchant Guild',
    description: 'Inter-species trading network',
    color: '#F39C12',
    initialReputation: 20,
    traits: ['neutral', 'opportunistic', 'wealthy'],
    territory: ['inhabited', 'resource']
  },
  VOIDBORN: {
    id: 'voidborn',
    name: 'The Voidborn',
    description: 'Enigmatic species that evolved in deep space',
    color: '#1ABC9C',
    initialReputation: -10,
    traits: ['mysterious', 'unpredictable', 'ancient'],
    territory: ['anomaly', 'barren']
  },
  AUTOMATA_NETWORK: {
    id: 'automata_network',
    name: 'Automata Network',
    description: 'Self-replicating AI constructs from a dead civilization',
    color: '#95A5A6',
    initialReputation: -30,
    traits: ['hostile', 'logical', 'relentless'],
    territory: ['ruins', 'barren']
  }
}

export const REPUTATION_LEVELS = {
  HOSTILE: { min: -100, max: -50, name: 'Hostile', color: COLORS.DANGER },
  UNFRIENDLY: { min: -49, max: -20, name: 'Unfriendly', color: '#E67E22' },
  NEUTRAL: { min: -19, max: 20, name: 'Neutral', color: COLORS.WARNING },
  FRIENDLY: { min: 21, max: 50, name: 'Friendly', color: '#3498DB' },
  ALLIED: { min: 51, max: 100, name: 'Allied', color: COLORS.SUCCESS }
}

export default class FactionSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.factions = {}
    this.reputations = {}
    this.diplomaticEvents = []
    this.wars = [] // Track wars between factions
    this.alliances = [] // Track alliances

    this.initializeFactions()
  }

  initializeFactions() {
    // Initialize all factions with starting reputation
    Object.values(FACTIONS).forEach(faction => {
      this.factions[faction.id] = { ...faction }
      this.reputations[faction.id] = faction.initialReputation
    })

    // Set up initial galactic politics
    this.wars.push({
      factions: ['kryll_empire', 'zenari_collective'],
      startTurn: 0,
      reason: 'Territorial expansion'
    })
  }

  // Modify reputation with a faction
  modifyReputation(factionId, amount, reason = '') {
    if (!this.reputations[factionId]) {
      console.error('Unknown faction:', factionId)
      return null
    }

    const oldRep = this.reputations[factionId]
    this.reputations[factionId] = Math.max(-100, Math.min(100, oldRep + amount))
    const newRep = this.reputations[factionId]

    const oldLevel = this.getReputationLevel(oldRep)
    const newLevel = this.getReputationLevel(newRep)

    // Track diplomatic event if reputation level changed
    if (oldLevel.name !== newLevel.name) {
      this.diplomaticEvents.push({
        turn: this.gameState.turn,
        faction: factionId,
        oldLevel: oldLevel.name,
        newLevel: newLevel.name,
        reason
      })
    }

    return {
      faction: this.factions[factionId],
      oldRep,
      newRep,
      delta: amount,
      oldLevel: oldLevel.name,
      newLevel: newLevel.name,
      changed: oldLevel.name !== newLevel.name
    }
  }

  // Get reputation level for a value
  getReputationLevel(value) {
    for (const level of Object.values(REPUTATION_LEVELS)) {
      if (value >= level.min && value <= level.max) {
        return level
      }
    }
    return REPUTATION_LEVELS.NEUTRAL
  }

  // Get reputation with a faction
  getReputation(factionId) {
    return this.reputations[factionId] || 0
  }

  getReputationLevelForFaction(factionId) {
    const rep = this.getReputation(factionId)
    return this.getReputationLevel(rep)
  }

  // Check if faction is hostile
  isHostile(factionId) {
    const rep = this.getReputation(factionId)
    return rep < -20
  }

  // Check if faction is friendly/allied
  isFriendly(factionId) {
    const rep = this.getReputation(factionId)
    return rep > 20
  }

  // Get dominant faction for a system type
  getDominantFaction(systemType) {
    // Find factions that control this type of system
    const candidates = Object.values(FACTIONS).filter(f =>
      f.territory.includes(systemType)
    )

    if (candidates.length === 0) return null

    // Weight by reputation - more likely to encounter friendly factions
    const weighted = candidates.map(f => ({
      faction: f,
      weight: Math.max(0, 50 + this.getReputation(f.id))
    }))

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
    let rand = Math.random() * totalWeight

    for (const w of weighted) {
      rand -= w.weight
      if (rand <= 0) {
        return w.faction
      }
    }

    return candidates[0]
  }

  // Handle faction encounter
  handleEncounter(factionId, encounterType = 'neutral') {
    const faction = this.factions[factionId]
    if (!faction) return null

    const reputation = this.getReputation(factionId)
    const level = this.getReputationLevel(reputation)

    let outcome = {
      faction,
      reputation,
      level: level.name,
      hostile: this.isHostile(factionId),
      options: []
    }

    // Generate options based on reputation and encounter type
    if (level.name === 'HOSTILE' || level.name === 'UNFRIENDLY') {
      outcome.options.push(
        { id: 'fight', text: 'Engage in combat', type: 'combat' },
        { id: 'flee', text: 'Attempt to flee', type: 'flee' },
        { id: 'bribe', text: 'Offer resources (20 materials)', type: 'bribe', cost: { materials: 20 } }
      )
    } else if (level.name === 'NEUTRAL') {
      outcome.options.push(
        { id: 'trade', text: 'Propose trade', type: 'trade' },
        { id: 'talk', text: 'Diplomatic discussion', type: 'diplomacy' },
        { id: 'ignore', text: 'Continue on your way', type: 'ignore' }
      )
    } else { // FRIENDLY or ALLIED
      outcome.options.push(
        { id: 'trade', text: 'Trade resources', type: 'trade' },
        { id: 'help', text: 'Request assistance', type: 'help' },
        { id: 'info', text: 'Ask for information', type: 'info' },
        { id: 'gift', text: 'Offer gift to improve relations', type: 'gift' }
      )
    }

    return outcome
  }

  // Process encounter choice
  processEncounterChoice(factionId, choiceId) {
    const faction = this.factions[factionId]
    let result = { faction, choice: choiceId }

    switch (choiceId) {
      case 'fight':
        result.combat = true
        result.enemyType = this.getFactionShipType(factionId)
        // Fighting decreases reputation
        this.modifyReputation(factionId, -20, 'Combat engagement')
        break

      case 'flee':
        result.fled = true
        result.fuelCost = 5
        this.gameState.modifyResource('fuel', -5)
        break

      case 'bribe':
        if (this.gameState.resources.materials >= 20) {
          this.gameState.modifyResource('materials', -20)
          this.modifyReputation(factionId, 15, 'Bribe accepted')
          result.success = true
        } else {
          result.success = false
          result.message = 'Not enough materials'
        }
        break

      case 'trade':
        result.openTrade = true
        this.modifyReputation(factionId, 5, 'Trade agreement')
        break

      case 'talk':
        // Diplomat skill improves outcome
        const diplomatBonus = this.gameState.crewSystem
          ? this.gameState.crewSystem.getSkillBonus('diplomat')
          : 0
        const repGain = Math.floor(10 * (1 + diplomatBonus))
        this.modifyReputation(factionId, repGain, 'Diplomatic discussion')
        result.repGain = repGain
        break

      case 'ignore':
        result.message = 'You continue on your journey'
        break

      case 'help':
        // Friendly factions may give resources
        const gifts = {
          fuel: 20,
          materials: 15,
          food: 20
        }
        result.gifts = gifts
        Object.entries(gifts).forEach(([resource, amount]) => {
          this.gameState.modifyResource(resource, amount)
        })
        this.modifyReputation(factionId, 10, 'Received assistance')
        break

      case 'info':
        // Reveal hidden systems or give tech
        result.infoType = Math.random() < 0.5 ? 'systems' : 'technology'
        if (result.infoType === 'technology') {
          this.gameState.modifyResource('technology', 15)
        }
        this.modifyReputation(factionId, 5, 'Information exchange')
        break

      case 'gift':
        // Give resources to improve relations
        if (this.gameState.resources.materials >= 15) {
          this.gameState.modifyResource('materials', -15)
          this.modifyReputation(factionId, 20, 'Gift offered')
          result.success = true
        } else {
          result.success = false
        }
        break
    }

    return result
  }

  // Get appropriate ship type for faction
  getFactionShipType(factionId) {
    const factionShips = {
      'kryll_empire': 'ALIEN_WARSHIP',
      'zenari_collective': 'ALIEN_PATROL',
      'automata_network': 'SCAVENGER_DRONE',
      'voidborn': 'ALIEN_PATROL',
      'terra_remnant': 'PIRATE_SCOUT',
      'merchant_guild': 'PIRATE_RAIDER'
    }
    return factionShips[factionId] || 'ALIEN_PATROL'
  }

  // Update galactic politics each turn
  updateGalacticPolitics(turn) {
    // Chance of new wars/alliances
    if (turn % 10 === 0 && Math.random() < 0.3) {
      // Random diplomatic event
      const factionIds = Object.keys(this.factions)
      const f1 = factionIds[Math.floor(Math.random() * factionIds.length)]
      const f2 = factionIds[Math.floor(Math.random() * factionIds.length)]

      if (f1 !== f2) {
        if (Math.random() < 0.5) {
          // War declaration
          this.wars.push({
            factions: [f1, f2],
            startTurn: turn,
            reason: 'Territory dispute'
          })
        } else {
          // Alliance
          this.alliances.push({
            factions: [f1, f2],
            startTurn: turn
          })
        }
      }
    }
  }

  // Get current galactic situation summary
  getGalacticSituation() {
    return {
      wars: this.wars,
      alliances: this.alliances,
      reputations: Object.entries(this.reputations).map(([id, rep]) => ({
        faction: this.factions[id],
        reputation: rep,
        level: this.getReputationLevel(rep).name
      }))
    }
  }

  serialize() {
    return {
      reputations: this.reputations,
      diplomaticEvents: this.diplomaticEvents,
      wars: this.wars,
      alliances: this.alliances
    }
  }

  deserialize(data) {
    if (!data) return

    this.reputations = data.reputations || {}
    this.diplomaticEvents = data.diplomaticEvents || []
    this.wars = data.wars || []
    this.alliances = data.alliances || []
  }
}
