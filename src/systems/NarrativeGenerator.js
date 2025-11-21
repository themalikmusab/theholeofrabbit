// Dynamic Narrative Generator - Creates unique stories based on game state
import { COLORS } from '../config'

// Story templates that dynamically generate based on context
export const NARRATIVE_TEMPLATES = {
  // Crew relationship events
  crew_conflict: {
    conditions: (gameState) => {
      const crew = gameState.crewSystem.getLivingCrew()
      return crew.some(c => c.morale < 40)
    },
    generate: (gameState) => {
      const unhappyCrew = gameState.crewSystem.getLivingCrew().filter(c => c.morale < 40)
      const crew1 = unhappyCrew[0]
      const crew2 = gameState.crewSystem.getLivingCrew().find(c => c.id !== crew1.id)

      const reasons = [
        'resource rationing decisions',
        'navigation strategy',
        'personal differences',
        'stress from the journey'
      ]
      const reason = reasons[Math.floor(Math.random() * reasons.length)]

      return {
        title: `Tension in the Crew`,
        description: `${crew1.name} and ${crew2.name} are having a heated argument over ${reason}. Their conflict is affecting crew morale. How do you intervene?`,
        choices: [
          {
            text: `Side with ${crew1.name}`,
            outcome: `You support ${crew1.name}'s position. They're grateful, but ${crew2.name} feels betrayed.`,
            effects: { crew1Morale: 20, crew2Morale: -15, otherMorale: -5 }
          },
          {
            text: `Side with ${crew2.name}`,
            outcome: `You support ${crew2.name}'s position. They appreciate it, but ${crew1.name} is upset.`,
            effects: { crew1Morale: -15, crew2Morale: 20, otherMorale: -5 }
          },
          {
            text: 'Force them to work together',
            outcome: `You assign them a joint task. They reluctantly cooperate, learning to respect each other.`,
            effects: { crew1Morale: 5, crew2Morale: 5, relationship: 20 }
          },
          {
            text: 'Let them resolve it themselves',
            outcome: `You stay out of it. They eventually work it out, appreciating your trust in them.`,
            effects: { crew1Morale: 10, crew2Morale: 10, autonomy: true }
          }
        ]
      }
    }
  },

  // Ship malfunction events
  critical_system_failure: {
    conditions: (gameState) => {
      return gameState.shipSystem.getDamagedModules().length > 2
    },
    generate: (gameState) => {
      const damaged = gameState.shipSystem.getDamagedModules()
      const critical = damaged.find(m => m.critical) || damaged[0]

      const engineer = gameState.crewSystem.getCrewBySkill('engineer')[0]

      return {
        title: `Critical System Failure: ${critical.name}`,
        description: `Alarms blare across the ship! The ${critical.name} is failing catastrophically. ${engineer ? engineer.name + ' reports' : 'Diagnostics show'} that we have minutes to act. What's your priority?`,
        choices: [
          {
            text: 'Emergency repair with all available crew',
            outcome: `Everyone drops what they're doing. ${engineer ? engineer.name + ' leads' : 'The crew works'} frantically. The system is stabilized, but crew are exhausted.`,
            effects: { repairModule: critical.id, repairAmount: 50, crewMorale: -10, materials: -30 }
          },
          {
            text: 'Reroute power from non-essential systems',
            outcome: `You sacrifice secondary systems to keep the ${critical.name} running. It's a temporary fix.`,
            effects: { repairModule: critical.id, repairAmount: 25, disableModule: 'sensors' }
          },
          {
            text: 'Use emergency reserves',
            outcome: `You authorize use of emergency repair materials. The system is fully restored.`,
            effects: { repairModule: critical.id, repairAmount: 100, materials: -50, technology: -10 }
          },
          {
            text: 'Abandon the module and seal it off',
            outcome: `You make the hard choice to seal off the damaged section. The crew survives, but functionality is lost.`,
            effects: { disableModulePermanent: critical.id, crewMorale: -20 }
          }
        ]
      }
    }
  },

  // Faction-driven events
  faction_ultimatum: {
    conditions: (gameState) => {
      return Object.values(gameState.factionSystem.reputations).some(r => r < -40)
    },
    generate: (gameState) => {
      const hostileFactions = Object.entries(gameState.factionSystem.reputations)
        .filter(([id, rep]) => rep < -40)
      const [factionId] = hostileFactions[0]
      const faction = gameState.factionSystem.factions[factionId]

      return {
        title: `${faction.name} Ultimatum`,
        description: `A fleet of ${faction.name} ships surrounds you. Their leader appears on screen: "You have trespassed in our territory one too many times. Surrender your ship, or face annihilation." Your crew looks to you for orders.`,
        choices: [
          {
            text: 'Fight to the death',
            outcome: `"We'll never surrender!" you declare. Their fleet opens fire.`,
            effects: { combat: 'ALIEN_WARSHIP', combatCount: 2, noFlee: true }
          },
          {
            text: 'Negotiate for safe passage',
            outcome: `You attempt to negotiate. ${Math.random() < 0.4 ? 'They agree to let you pass if you pay tribute.' : 'They refuse. Prepare for combat!'}`,
            effects: { negotiation: true, materials: -50, factionRep: 10 }
          },
          {
            text: 'Offer valuable technology',
            outcome: `You offer advanced human technology. They're intrigued and accept.`,
            effects: { technology: -30, factionRep: 40, alliance: true }
          },
          {
            text: 'Activate emergency warp jump',
            outcome: `You risk an unplanned jump. The ship barely holds together, but you escape!`,
            effects: { fuel: -30, shipDamage: 25, escaped: true }
          }
        ]
      }
    }
  },

  // Discovery events
  ancient_derelict: {
    conditions: (gameState) => {
      return gameState.turn > 10 && Math.random() < 0.3
    },
    generate: (gameState) => {
      const scientist = gameState.crewSystem.getCrewBySkill('scientist')[0]

      return {
        title: 'Ancient Derelict Vessel',
        description: `Your sensors detect a massive derelict ship of unknown origin floating in the void. ${scientist ? scientist.name + ' is excited' : 'Scans reveal'} - this vessel is thousands of years old. It could contain valuable technology... or dangers.`,
        choices: [
          {
            text: 'Send a boarding party to investigate',
            outcome: `${gameState.crewSystem.getLivingCrew().length > 3 ? 'You send three crew members aboard.' : 'You personally lead the investigation.'} What you find inside changes everything...`,
            effects: { awayMission: true, missionType: 'derelict_exploration' }
          },
          {
            text: 'Scan thoroughly from safe distance',
            outcome: `${scientist ? scientist.name + ' conducts' : 'You conduct'} detailed scans. The data reveals fascinating technology.`,
            effects: { technology: 25, scientistExp: 10 }
          },
          {
            text: 'Salvage what you can remotely',
            outcome: `Using remote drones, you harvest materials from the hull. Quick and safe.`,
            effects: { materials: 40, fuel: 10 }
          },
          {
            text: 'Avoid it - could be a trap',
            outcome: `You give it a wide berth. As you leave, you notice other ships approaching it. You wonder what they'll find...`,
            effects: { cautious: true }
          }
        ]
      }
    }
  },

  // Resource crisis
  cascading_failure: {
    conditions: (gameState) => {
      return gameState.resources.food < 30 && gameState.resources.fuel < 30
    },
    generate: (gameState) => {
      return {
        title: 'The Perfect Storm',
        description: `Multiple critical resources are running low simultaneously. Food is scarce, fuel is dwindling, and crew morale is breaking. The medical bay is overwhelmed with stress-related illness. This is a crisis that will test your leadership to its absolute limits.`,
        choices: [
          {
            text: 'Ration everything - we survive together',
            outcome: `You implement strict rationing across all resources. It's painful, but fair. The crew respects your integrity even as they suffer.`,
            effects: { morale: -15, population: -5, unityCrisis: true, survivalBonus: 20 }
          },
          {
            text: 'Prioritize key crew members',
            outcome: `You make the brutal decision to give full rations to essential personnel. It keeps critical systems running, but creates deep resentment.`,
            effects: { eliteSurvival: true, morale: -30, relationship: -50, efficiency: 20 }
          },
          {
            text: 'Attempt risky resource extraction',
            outcome: `You push the ship to its limits, skipping safety protocols to gather resources faster. It's reckless, but desperate times...`,
            effects: { riskyOperation: true, fuel: 20, materials: 30, shipDamage: 35, crewInjury: true }
          },
          {
            text: 'Call for help on all frequencies',
            outcome: `You broadcast a desperate SOS. Who knows who might answer... or what price they'll demand.`,
            effects: { sos: true, randomEncounter: true }
          }
        ]
      }
    }
  }
}

export default class NarrativeGenerator {
  constructor(gameState) {
    this.gameState = gameState
    this.generatedEvents = []
    this.eventHistory = []
  }

  // Generate a dynamic event based on current game state
  generateEvent() {
    const availableTemplates = Object.entries(NARRATIVE_TEMPLATES)
      .filter(([key, template]) => template.conditions(this.gameState))

    if (availableTemplates.length === 0) return null

    // Pick a random template from available ones
    const [templateKey, template] = availableTemplates[Math.floor(Math.random() * availableTemplates.length)]

    const event = template.generate(this.gameState)
    event.id = `dynamic_${templateKey}_${Date.now()}`
    event.dynamic = true

    this.generatedEvents.push(event)
    return event
  }

  // Generate contextual crew dialogue
  generateCrewDialogue(context) {
    const crew = this.gameState.crewSystem.getLivingCrew()
    if (crew.length === 0) return null

    const speaker = crew[Math.floor(Math.random() * crew.length)]
    let dialogue = ''

    switch (context) {
      case 'low_fuel':
        if (speaker.morale > 60) {
          dialogue = `"Captain, we're running low on fuel, but I believe in our ability to find more."`
        } else {
          dialogue = `"We're almost out of fuel. I hope you have a plan, because I'm starting to lose faith."`
        }
        break

      case 'after_combat':
        if (speaker.skill === 'security') {
          dialogue = `"Good fight, Captain. But we took some damage. We need to be more careful."`
        } else if (speaker.health < 50) {
          dialogue = `"I... I'm not sure I'm cut out for this. That was terrifying."`
        } else {
          dialogue = `"We survived. That's what matters. But how many more battles can we endure?"`
        }
        break

      case 'discovery':
        if (speaker.skill === 'scientist') {
          dialogue = `"Fascinating! The scientific implications of this discovery are extraordinary!"`
        } else if (speaker.traits.includes('optimist')) {
          dialogue = `"See? Good things do happen out here! Maybe we'll find what we're looking for."`
        } else {
          dialogue = `"Interesting find. Let's hope it helps us survive long enough to reach safety."`
        }
        break

      case 'crew_death':
        const relationship = Math.random()
        if (relationship > 0.7) {
          dialogue = `"They... they were my friend. I can't believe they're gone."`
        } else if (relationship > 0.3) {
          dialogue = `"Another one lost. How many more of us will die before we find a new home?"`
        } else {
          dialogue = `"We knew the risks. We have to keep moving forward, for their sake."`
        }
        break
    }

    return {
      speaker: speaker.name,
      text: dialogue,
      speakerId: speaker.id,
      emotion: speaker.morale > 60 ? 'hopeful' : speaker.morale > 30 ? 'neutral' : 'anxious'
    }
  }

  // Generate contextual system messages
  generateSystemMessage(context) {
    const messages = {
      entering_system: [
        'Dropping out of warp. All systems nominal.',
        'Warp drive disengaging. Scanning local space...',
        'Arrival successful. Crew reports ready.',
        'New system detected. Beginning survey.'
      ],
      low_resources: [
        'WARNING: Critical resource levels detected.',
        'ALERT: Supplies running dangerously low.',
        'CAUTION: Resource depletion imminent.',
        'EMERGENCY: Multiple resources below safe thresholds.'
      ],
      ship_damage: [
        'Hull breach detected! Sealing affected sections.',
        'Critical system failure! Damage control teams responding.',
        'WARNING: Ship integrity compromised.',
        'ALERT: Multiple system malfunctions detected.'
      ],
      good_fortune: [
        'Systems operating at peak efficiency.',
        'Crew morale is high. Productivity increased.',
        'All departments report green across the board.',
        'Things are looking up, Captain.'
      ]
    }

    const contextMessages = messages[context] || messages.entering_system
    return contextMessages[Math.floor(Math.random() * contextMessages.length)]
  }

  // Create a procedural story arc based on player choices
  generateStoryArc() {
    const flags = this.gameState.flags
    const turn = this.gameState.turn

    // Determine story arc based on player's choices
    let arc = 'survival' // Default

    if (flags.includes('leadership_inspirational') && this.gameState.crewSystem.getAverageMorale() > 60) {
      arc = 'hope_and_renewal'
    } else if (flags.includes('leadership_pragmatic') && this.gameState.resources.technology > 50) {
      arc = 'scientific_discovery'
    } else if (this.gameState.factionSystem && Object.values(this.gameState.factionSystem.reputations).some(r => r > 50)) {
      arc = 'diplomatic_alliance'
    } else if (this.gameState.crewSystem.getLivingCrew().length < 4) {
      arc = 'desperate_struggle'
    }

    return {
      arc,
      phase: turn < 10 ? 'beginning' : turn < 25 ? 'middle' : 'climax',
      tension: this.calculateTension()
    }
  }

  // Calculate narrative tension based on game state
  calculateTension() {
    let tension = 0

    // Resources
    if (this.gameState.resources.fuel < 30) tension += 20
    if (this.gameState.resources.food < 30) tension += 20

    // Crew
    const avgMorale = this.gameState.crewSystem.getAverageMorale()
    if (avgMorale < 40) tension += 25

    // Ship
    const damagedModules = this.gameState.shipSystem.getDamagedModules().length
    tension += damagedModules * 10

    // Factions
    const hostileFactions = Object.values(this.gameState.factionSystem.reputations).filter(r => r < -20).length
    tension += hostileFactions * 15

    return Math.min(100, tension)
  }

  // Generate a climactic event based on story arc
  generateClimaxEvent() {
    const arc = this.generateStoryArc()

    const climaxEvents = {
      'hope_and_renewal': {
        title: 'The Beacon of Hope',
        description: 'Your crew\'s unwavering optimism has paid off. You\'ve discovered coordinates to a hidden human colony that survived Earth\'s destruction. They\'re calling out, inviting you home.',
        type: 'victory_path'
      },
      'scientific_discovery': {
        title: 'Breakthrough',
        description: 'Your scientists have made an incredible discovery - technology that could terraform any planet. You hold humanity\'s future in your hands.',
        type: 'victory_path'
      },
      'diplomatic_alliance': {
        title: 'United We Stand',
        description: 'Your diplomatic efforts have forged an unprecedented alliance. Multiple alien species offer to help you find a new homeworld.',
        type: 'victory_path'
      },
      'desperate_struggle': {
        title: 'The Final Gambit',
        description: 'With resources nearly exhausted and hope fading, you detect one last habitable planet. It\'s in hostile territory. This is your last chance.',
        type: 'final_challenge'
      }
    }

    return climaxEvents[arc.arc] || climaxEvents['desperate_struggle']
  }

  serialize() {
    return {
      generatedEvents: this.generatedEvents,
      eventHistory: this.eventHistory
    }
  }

  deserialize(data) {
    if (!data) return
    this.generatedEvents = data.generatedEvents || []
    this.eventHistory = data.eventHistory || []
  }
}
