// Crew System - Manages dynamic crew members with skills and relationships
import { COLORS } from '../config'

// Crew skills that affect gameplay
export const CREW_SKILLS = {
  PILOT: 'pilot',           // Reduces fuel consumption
  ENGINEER: 'engineer',     // Repairs ship, prevents damage
  SCIENTIST: 'scientist',   // Better scanning, more tech gains
  MEDIC: 'medic',          // Heals crew, prevents deaths
  DIPLOMAT: 'diplomat',     // Better faction relations
  SECURITY: 'security',     // Better combat outcomes
  NAVIGATOR: 'navigator'    // Reveals hidden systems
}

// Crew personality traits
export const TRAITS = {
  BRAVE: 'brave',
  CAUTIOUS: 'cautious',
  OPTIMIST: 'optimist',
  PESSIMIST: 'pessimist',
  LOYAL: 'loyal',
  AMBITIOUS: 'ambitious',
  TECHNICAL: 'technical',
  CHARISMATIC: 'charismatic'
}

export class CrewMember {
  constructor(data) {
    this.id = data.id || `crew_${Date.now()}_${Math.random()}`
    this.name = data.name
    this.role = data.role
    this.skill = data.skill // Primary skill from CREW_SKILLS
    this.skillLevel = data.skillLevel || 1 // 1-5
    this.traits = data.traits || []
    this.morale = data.morale || 50
    this.health = data.health || 100
    this.relationships = data.relationships || {} // {crewId: value (-100 to 100)}
    this.storyFlags = data.storyFlags || [] // Personal story progression
    this.isAlive = data.isAlive !== undefined ? data.isAlive : true
    this.backstory = data.backstory || ''
    this.joinedTurn = data.joinedTurn || 0
  }

  // Get skill bonus percentage (0.05 to 0.25 based on level)
  getSkillBonus() {
    return this.skillLevel * 0.05
  }

  // Modify morale and check for consequences
  modifyMorale(amount, reason = '') {
    if (!this.isAlive) return

    const oldMorale = this.morale
    this.morale = Math.max(0, Math.min(100, this.morale + amount))

    // Trait modifiers
    if (this.traits.includes(TRAITS.OPTIMIST) && amount > 0) {
      this.morale += 5
    }
    if (this.traits.includes(TRAITS.PESSIMIST) && amount < 0) {
      this.morale -= 5
    }

    this.morale = Math.max(0, Math.min(100, this.morale))

    return {
      changed: this.morale !== oldMorale,
      delta: this.morale - oldMorale,
      newMorale: this.morale,
      shouldMutiny: this.morale < 20,
      shouldLeave: this.morale < 10
    }
  }

  // Modify health
  modifyHealth(amount, cause = '') {
    if (!this.isAlive) return { died: false }

    this.health = Math.max(0, Math.min(100, this.health + amount))

    if (this.health <= 0) {
      this.isAlive = false
      return { died: true, cause }
    }

    return { died: false, newHealth: this.health }
  }

  // Update relationship with another crew member
  updateRelationship(otherCrewId, amount) {
    if (!this.relationships[otherCrewId]) {
      this.relationships[otherCrewId] = 0
    }
    this.relationships[otherCrewId] = Math.max(-100, Math.min(100,
      this.relationships[otherCrewId] + amount))
  }

  // Get color based on health/morale state
  getStatusColor() {
    if (!this.isAlive) return COLORS.DANGER
    if (this.health < 30 || this.morale < 30) return COLORS.DANGER
    if (this.health < 60 || this.morale < 60) return COLORS.WARNING
    return COLORS.SUCCESS
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      skill: this.skill,
      skillLevel: this.skillLevel,
      traits: this.traits,
      morale: this.morale,
      health: this.health,
      relationships: this.relationships,
      storyFlags: this.storyFlags,
      isAlive: this.isAlive,
      backstory: this.backstory,
      joinedTurn: this.joinedTurn
    }
  }
}

export default class CrewSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.crew = []
    this.crewHistory = [] // Track all crew, including dead/departed
    this.initializeStartingCrew()
  }

  initializeStartingCrew() {
    // Create 6 starting crew members with diverse skills
    const startingCrew = [
      {
        name: 'Commander Sarah Chen',
        role: 'Ship Commander',
        skill: CREW_SKILLS.DIPLOMAT,
        skillLevel: 3,
        traits: [TRAITS.BRAVE, TRAITS.LOYAL],
        morale: 70,
        backstory: 'Former military officer who volunteered to lead the expedition. Known for keeping crew morale high even in dire situations.'
      },
      {
        name: 'Dr. Marcus Webb',
        role: 'Chief Engineer',
        skill: CREW_SKILLS.ENGINEER,
        skillLevel: 4,
        traits: [TRAITS.TECHNICAL, TRAITS.CAUTIOUS],
        morale: 60,
        backstory: 'Genius engineer who designed many of the ship\'s systems. Worries constantly but always finds solutions.'
      },
      {
        name: 'Lt. Kenji Tanaka',
        role: 'Pilot',
        skill: CREW_SKILLS.PILOT,
        skillLevel: 3,
        traits: [TRAITS.BRAVE, TRAITS.OPTIMIST],
        morale: 80,
        backstory: 'Ace pilot with years of experience. Believes they\'ll find a new home no matter the odds.'
      },
      {
        name: 'Dr. Amara Okafor',
        role: 'Chief Medical Officer',
        skill: CREW_SKILLS.MEDIC,
        skillLevel: 3,
        traits: [TRAITS.CHARISMATIC, TRAITS.LOYAL],
        morale: 65,
        backstory: 'Dedicated doctor who treats every crew member like family. Her calm presence helps during crises.'
      },
      {
        name: 'Professor Elena Volkov',
        role: 'Chief Scientist',
        skill: CREW_SKILLS.SCIENTIST,
        skillLevel: 4,
        traits: [TRAITS.TECHNICAL, TRAITS.AMBITIOUS],
        morale: 55,
        backstory: 'Brilliant but obsessive scientist. Sees this journey as humanity\'s greatest experiment.'
      },
      {
        name: 'Sgt. James "Ghost" Riley',
        role: 'Security Chief',
        skill: CREW_SKILLS.SECURITY,
        skillLevel: 3,
        traits: [TRAITS.CAUTIOUS, TRAITS.PESSIMIST],
        morale: 50,
        backstory: 'Former spec-ops soldier. Expects the worst but always prepared to protect the crew.'
      }
    ]

    startingCrew.forEach(data => {
      const member = new CrewMember(data)
      this.crew.push(member)
      this.crewHistory.push(member)
    })
  }

  // Get living crew members
  getLivingCrew() {
    return this.crew.filter(c => c.isAlive)
  }

  // Get crew by skill
  getCrewBySkill(skill) {
    return this.getLivingCrew().filter(c => c.skill === skill)
  }

  // Get crew member by ID
  getCrewMember(id) {
    return this.crew.find(c => c.id === id)
  }

  // Add new crew member
  addCrewMember(data) {
    const member = new CrewMember(data)
    this.crew.push(member)
    this.crewHistory.push(member)
    return member
  }

  // Remove crew member (death, departure, etc)
  removeCrewMember(id, reason = 'left') {
    const member = this.getCrewMember(id)
    if (member) {
      if (reason === 'death') {
        member.isAlive = false
      }
      // Keep in crew array for story purposes, just mark as not alive or departed
    }
  }

  // Calculate total skill bonus for a given skill
  getSkillBonus(skill) {
    const skillCrew = this.getCrewBySkill(skill)
    if (skillCrew.length === 0) return 0

    // Get highest skill level for this role
    const highestSkill = Math.max(...skillCrew.map(c => c.skillLevel))
    return highestSkill * 0.05 // 5% to 25% bonus
  }

  // Apply crew skill effects to gameplay
  applyCrewEffects(action, amount) {
    let finalAmount = amount

    switch (action) {
      case 'fuel_consumption':
        // Skilled pilot reduces fuel usage
        const pilotBonus = this.getSkillBonus(CREW_SKILLS.PILOT)
        finalAmount = Math.floor(amount * (1 - pilotBonus))
        break

      case 'ship_damage':
        // Skilled engineer reduces damage
        const engineerBonus = this.getSkillBonus(CREW_SKILLS.ENGINEER)
        finalAmount = Math.floor(amount * (1 - engineerBonus))
        break

      case 'tech_gain':
        // Skilled scientist increases tech gains
        const scientistBonus = this.getSkillBonus(CREW_SKILLS.SCIENTIST)
        finalAmount = Math.floor(amount * (1 + scientistBonus))
        break

      case 'health_loss':
        // Skilled medic reduces health loss
        const medicBonus = this.getSkillBonus(CREW_SKILLS.MEDIC)
        finalAmount = Math.floor(amount * (1 - medicBonus))
        break
    }

    return finalAmount
  }

  // Get average crew morale
  getAverageMorale() {
    const living = this.getLivingCrew()
    if (living.length === 0) return 0
    return Math.floor(living.reduce((sum, c) => sum + c.morale, 0) / living.length)
  }

  // Modify morale for all crew
  modifyAllMorale(amount, reason = '') {
    const results = []
    this.getLivingCrew().forEach(member => {
      const result = member.modifyMorale(amount, reason)
      if (result.changed) {
        results.push({ member, result })
      }
    })
    return results
  }

  // Check for crew events (mutiny, deaths, etc)
  checkCrewEvents() {
    const events = []

    // Check for mutiny
    const lowMorale = this.getLivingCrew().filter(c => c.morale < 20)
    if (lowMorale.length >= 3) {
      events.push({ type: 'mutiny_risk', crew: lowMorale })
    }

    // Check for crew wanting to leave at next habitable planet
    const wanting_to_leave = this.getLivingCrew().filter(c => c.morale < 10)
    if (wanting_to_leave.length > 0) {
      events.push({ type: 'departure_risk', crew: wanting_to_leave })
    }

    // Check for injured crew
    const injured = this.getLivingCrew().filter(c => c.health < 50)
    if (injured.length > 0) {
      events.push({ type: 'injured_crew', crew: injured })
    }

    return events
  }

  // Serialize crew data for saving
  serialize() {
    return {
      crew: this.crew.map(c => c.serialize()),
      crewHistory: this.crewHistory.map(c => c.serialize())
    }
  }

  // Deserialize crew data from save
  deserialize(data) {
    if (!data) return

    this.crew = (data.crew || []).map(c => new CrewMember(c))
    this.crewHistory = (data.crewHistory || []).map(c => new CrewMember(c))
  }
}
