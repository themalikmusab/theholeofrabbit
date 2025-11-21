// Tutorial System - Interactive guided demo that teaches all game mechanics
export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to THE LAST VOYAGE',
    description: 'Earth has been destroyed. You command the last hope of humanity - a generation ship searching for a new home among the stars.',
    highlight: null,
    action: 'Click CONTINUE to begin your journey',
    next: 'crew_intro'
  },
  {
    id: 'crew_intro',
    title: 'Meet Your Crew',
    description: 'You command 6 unique crew members. Each has special skills:\n\n• Commander Chen: Diplomacy\n• Dr. Webb: Engineering (repairs ship)\n• Lt. Tanaka: Piloting (reduces fuel use)\n• Dr. Okafor: Medical (heals crew)\n• Prof. Volkov: Science (gains tech)\n• Sgt. Riley: Security (combat bonus)\n\nCrew have MORALE and HEALTH. Keep them happy and alive!',
    highlight: 'crew',
    action: 'Click CONTINUE to learn about resources',
    next: 'resources'
  },
  {
    id: 'resources',
    title: 'Managing Resources',
    description: 'You must carefully manage 6 critical resources:\n\n⛽ FUEL: Travel between systems\n🍖 FOOD: Feed your population\n🔧 MATERIALS: Repair ship & trade\n👥 POPULATION: Your people\n😊 MORALE: Crew happiness\n🔬 TECHNOLOGY: Unlock upgrades\n\nRun out of FUEL, FOOD, or POPULATION = GAME OVER!',
    highlight: 'resources',
    action: 'Click CONTINUE to explore the galaxy',
    next: 'galaxy_map'
  },
  {
    id: 'galaxy_map',
    title: 'Galaxy Map Navigation',
    description: 'The galaxy map shows star systems you can visit:\n\n🟠 Resource Systems: Materials & fuel\n🔵 Habitable Systems: Food & morale\n🟡 Ruins: Ancient technology\n🔴 Hostile Systems: Danger!\n🟣 Anomaly Systems: Mysteries\n⚪ Barren Systems: Limited resources\n\nClick on a nearby system to travel there.\nTRAVEL COSTS FUEL based on distance!',
    highlight: 'map',
    action: 'Click on a NEARBY star system',
    next: 'system_visit',
    interactive: true,
    requireAction: 'select_system'
  },
  {
    id: 'system_visit',
    title: 'System Resources',
    description: 'Great! When you visit systems, you gain resources automatically:\n\n• Resource systems: +15 fuel, +30 materials\n• Habitable systems: +20 food, +10 morale\n• Ruins: +10 technology\n• Barren: +5 emergency fuel\n\nYou may also encounter:\n✨ Random events\n⚔️ Combat encounters\n🤝 Alien factions\n🌍 Away mission opportunities',
    highlight: 'system',
    action: 'Click CONTINUE to learn about events',
    next: 'events'
  },
  {
    id: 'events',
    title: 'Story Events',
    description: 'Random events will happen during your journey:\n\n📖 STORY EVENTS: Make choices that affect your crew\n⚔️ COMBAT: Fight hostile ships (4 action types)\n🤝 FACTION ENCOUNTERS: Build or destroy relationships\n🌍 AWAY MISSIONS: Send crew on dangerous expeditions\n💰 TRADING: Buy and sell at markets\n\nYour choices have CONSEQUENCES!\nCrew can DIE. Factions remember you. Resources are scarce.',
    highlight: 'event',
    action: 'Click CONTINUE to learn about combat',
    next: 'combat_intro'
  },
  {
    id: 'combat_intro',
    title: 'Tactical Combat',
    description: 'When you encounter enemies, you enter TACTICAL COMBAT:\n\n⚔️ ATTACK: Deal damage to enemy\n🛡️ DEFEND: Regenerate shields, reduce damage\n🏃 EVADE: Chance to dodge attacks\n⚡ SPECIAL: Powerful attack (-5 fuel)\n\nYour SECURITY crew improves combat!\nYou can also FLEE (pilot skill helps)\n\nDefeat enemies for materials, tech, and other rewards!',
    highlight: 'combat',
    action: 'Click CONTINUE to learn about your ship',
    next: 'ship_systems'
  },
  {
    id: 'ship_systems',
    title: 'Ship Systems & Damage',
    description: 'Your ship has 7 critical modules:\n\n🚀 HULL: Main structure (CRITICAL)\n⚙️ ENGINES: Movement (affects fuel use)\n❤️ LIFE SUPPORT: Crew survival (CRITICAL)\n🛡️ SHIELDS: Combat defense\n⚔️ WEAPONS: Combat attack\n📡 SENSORS: Scanning range\n📦 CARGO: Storage capacity\n\nModules can be DAMAGED in combat or events!\nDamaged modules work at REDUCED EFFICIENCY.\nUse MATERIALS to repair them.\nUPGRADE modules with technology!',
    highlight: 'ship',
    action: 'Click CONTINUE to learn about factions',
    next: 'factions'
  },
  {
    id: 'factions',
    title: 'Alien Factions',
    description: 'You\'ll encounter 6 alien factions:\n\n🔵 Terra Remnant: Fellow human survivors\n🔴 Kryll Empire: Aggressive insects\n🟣 Zenari Collective: Telepathic scholars\n🟡 Merchant Guild: Traders\n🟢 The Voidborn: Mysterious space dwellers\n⚪ Automata Network: Hostile AI\n\nReputation levels: HOSTILE → UNFRIENDLY → NEUTRAL → FRIENDLY → ALLIED\n\nHigher reputation = Better trades, help in combat, information\nLower reputation = Attacks, higher prices, no help',
    highlight: 'faction',
    action: 'Click CONTINUE to learn about trading',
    next: 'trading'
  },
  {
    id: 'trading',
    title: 'Trading & Economy',
    description: 'Visit markets to buy and sell resources!\n\n4 Market Types:\n• Trade Station: Standard prices\n• Black Market: Rare goods, high prices\n• Resource Depot: Cheap materials\n• Colony Market: Food specialists\n\nPrices FLUCTUATE based on:\n✓ Supply and demand\n✓ Time\n✓ Random market events\n\nMATERIALS are your currency!\nWatch for trade recommendations (buy low, sell high)',
    highlight: 'trade',
    action: 'Click CONTINUE to learn about away missions',
    next: 'away_missions'
  },
  {
    id: 'away_missions',
    title: 'Away Missions',
    description: 'Send crew to explore planets!\n\n7 Mission Types:\n🔍 Resource Survey (low risk)\n👽 Alien Contact (medium risk)\n🏛️ Ancient Ruins (high risk)\n🚑 Rescue Mission (medium risk)\n⚔️ Combat Patrol (very high risk)\n🔬 Scientific Research (low risk)\n🚢 Derelict Salvage (medium risk)\n\nMissions take 3-6 TURNS to complete.\nRandom events can happen during missions!\nCrew can get INJURED or DIE on missions.\nRewards scale with risk level.',
    highlight: 'mission',
    action: 'Click CONTINUE to learn about ship interior',
    next: 'ship_interior'
  },
  {
    id: 'ship_interior',
    title: 'Explore Your Ship',
    description: 'Press SHIP STATUS to walk around your ship!\n\n🏢 Explorable Rooms:\n• Bridge: Navigation console\n• Engineering: Repair station\n• Medical Bay: Heal crew\n• Science Lab: Research\n• Crew Quarters: Rest area\n\nUse WASD or ARROW KEYS to move.\nPress E to interact with crew and stations.\n\nTalk to crew members to hear their thoughts!\nUse workstations to repair, heal, and research.',
    highlight: 'interior',
    action: 'Click CONTINUE to learn about achievements',
    next: 'achievements'
  },
  {
    id: 'achievements',
    title: 'Achievements & Progression',
    description: '20 achievements to unlock!\n\n🏆 Categories:\n• Explorer: Visit systems\n• Warrior: Win combats\n• Diplomat: Build faction relations\n• Merchant: Trade successfully\n• Engineer: Upgrade ship\n• Leader: Manage crew well\n• Survivor: Endure challenges\n\nAchievements give REWARDS:\n✓ Resources\n✓ Technology\n✓ Bonuses\n\nAchievements persist across playthroughs!\nTry to unlock them all!',
    highlight: 'achievements',
    action: 'Click CONTINUE to learn about audio',
    next: 'audio'
  },
  {
    id: 'audio',
    title: 'Dynamic Audio System',
    description: 'The game features PROCEDURALLY GENERATED MUSIC!\n\n🎵 Music adapts to gameplay:\n• Exploration: Calm ambient\n• Tension: Pulsing suspense\n• Combat: Aggressive beats\n• Victory: Triumphant themes\n\nMusic changes based on game TENSION:\n✓ High danger = Combat music\n✓ Medium danger = Tension music\n✓ Low danger = Exploration music\n\n🔊 Sound effects for all actions!\n\n(Music can be toggled in settings)',
    highlight: 'audio',
    action: 'Click CONTINUE for final tips',
    next: 'final_tips'
  },
  {
    id: 'final_tips',
    title: 'Pro Tips & Strategy',
    description: '💡 SURVIVAL TIPS:\n\n1. Visit RESOURCE systems when fuel is low\n2. Keep crew MORALE above 50% (prevents mutiny)\n3. Repair ship modules before they fail completely\n4. Build ALLIED status with at least one faction\n5. Save materials for emergency repairs\n6. Send expendable crew on risky missions\n7. Trade when prices are favorable\n8. Upgrade ENGINES first (reduces fuel use)\n9. Don\'t ignore crew health warnings\n10. Every choice matters - think strategically!\n\n🎯 VICTORY CONDITIONS:\nFind a habitable planet or build alliances to secure humanity\'s future!',
    highlight: 'tips',
    action: 'Click START GAME to begin!',
    next: 'complete'
  }
]

export default class TutorialSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.enabled = true
    this.currentStep = null
    this.stepIndex = 0
    this.completed = false
    this.skipped = false
    this.progressData = {
      stepsCompleted: [],
      actionsPerformed: []
    }

    this.loadProgress()
  }

  // Start tutorial from beginning or resume
  start() {
    if (this.completed) {
      return { alreadyCompleted: true }
    }

    this.currentStep = TUTORIAL_STEPS[this.stepIndex]
    return {
      started: true,
      step: this.currentStep
    }
  }

  // Get current tutorial step
  getCurrentStep() {
    return this.currentStep
  }

  // Advance to next step
  next() {
    if (!this.currentStep) return null

    // Mark current step as completed
    if (!this.progressData.stepsCompleted.includes(this.currentStep.id)) {
      this.progressData.stepsCompleted.push(this.currentStep.id)
    }

    // Move to next step
    const nextStepId = this.currentStep.next
    if (nextStepId === 'complete') {
      this.complete()
      return { completed: true }
    }

    this.stepIndex++
    this.currentStep = TUTORIAL_STEPS.find(s => s.id === nextStepId)

    this.saveProgress()

    return {
      step: this.currentStep,
      progress: this.getProgress()
    }
  }

  // Record an action (for interactive steps)
  recordAction(actionType) {
    if (!this.progressData.actionsPerformed.includes(actionType)) {
      this.progressData.actionsPerformed.push(actionType)
    }

    // Check if current step requires this action
    if (this.currentStep && this.currentStep.requireAction === actionType) {
      return { actionCompleted: true, canProceed: true }
    }

    return { actionRecorded: true }
  }

  // Skip tutorial
  skip() {
    this.skipped = true
    this.completed = true
    this.currentStep = null
    this.saveProgress()
    return { skipped: true }
  }

  // Complete tutorial
  complete() {
    this.completed = true
    this.currentStep = null
    this.saveProgress()

    // Give completion reward
    if (this.gameState) {
      this.gameState.modifyResource('materials', 50)
      this.gameState.modifyResource('technology', 25)
      this.gameState.crewSystem.modifyAllMorale(10, 'Tutorial completed')
    }

    return {
      completed: true,
      reward: { materials: 50, technology: 25, morale: 10 }
    }
  }

  // Check if step is completed
  isStepCompleted(stepId) {
    return this.progressData.stepsCompleted.includes(stepId)
  }

  // Get tutorial progress
  getProgress() {
    return {
      current: this.stepIndex,
      total: TUTORIAL_STEPS.length,
      percentage: Math.floor((this.stepIndex / TUTORIAL_STEPS.length) * 100),
      completed: this.completed,
      skipped: this.skipped
    }
  }

  // Get contextual hint based on game state
  getContextualHint() {
    if (this.completed || this.skipped) return null

    const gameState = this.gameState
    const hints = []

    // Resource warnings
    if (gameState.resources.fuel < 20) {
      hints.push({
        type: 'warning',
        text: 'FUEL LOW! Visit a resource system (orange) or barren system for fuel.',
        priority: 10
      })
    }

    if (gameState.resources.food < 20) {
      hints.push({
        type: 'warning',
        text: 'FOOD LOW! Visit a habitable system (cyan) for food supplies.',
        priority: 10
      })
    }

    // Crew warnings
    const avgMorale = gameState.crewSystem.getAverageMorale()
    if (avgMorale < 30) {
      hints.push({
        type: 'warning',
        text: 'CREW MORALE CRITICAL! Visit habitable systems or complete missions to boost morale.',
        priority: 9
      })
    }

    const injured = gameState.crewSystem.getLivingCrew().filter(c => c.health < 50)
    if (injured.length > 0) {
      hints.push({
        type: 'info',
        text: `${injured.length} crew members are injured. Visit Medical Bay in ship interior to heal them.`,
        priority: 7
      })
    }

    // Ship warnings
    const damaged = gameState.shipSystem.getDamagedModules()
    if (damaged.length > 2) {
      hints.push({
        type: 'warning',
        text: `${damaged.length} ship modules damaged! Use materials to repair in Engineering.`,
        priority: 8
      })
    }

    // Positive hints
    if (gameState.resources.materials > 100) {
      hints.push({
        type: 'tip',
        text: 'You have plenty of materials. Consider upgrading ship modules for better efficiency!',
        priority: 3
      })
    }

    if (gameState.resources.technology > 50) {
      hints.push({
        type: 'tip',
        text: 'High technology! Use it to upgrade ship modules or research new capabilities.',
        priority: 4
      })
    }

    // Faction hints
    const hostileFactions = Object.values(gameState.factionSystem.reputations).filter(r => r < -20)
    if (hostileFactions.length > 2) {
      hints.push({
        type: 'warning',
        text: 'Multiple hostile factions! Expect more combat encounters. Keep weapons upgraded.',
        priority: 6
      })
    }

    // Sort by priority and return highest
    hints.sort((a, b) => b.priority - a.priority)
    return hints[0] || null
  }

  // Check if tutorial should show hint for current situation
  shouldShowHint(context) {
    if (this.completed || this.skipped) return false

    const hintMap = {
      'first_combat': !this.progressData.actionsPerformed.includes('combat'),
      'first_trade': !this.progressData.actionsPerformed.includes('trade'),
      'first_mission': !this.progressData.actionsPerformed.includes('away_mission'),
      'low_resources': true, // Always show critical warnings
      'ship_damage': true
    }

    return hintMap[context] || false
  }

  // Enable/disable tutorial
  setEnabled(enabled) {
    this.enabled = enabled
    this.saveProgress()
  }

  // Save progress to localStorage
  saveProgress() {
    try {
      const data = {
        stepIndex: this.stepIndex,
        completed: this.completed,
        skipped: this.skipped,
        progressData: this.progressData,
        enabled: this.enabled
      }
      localStorage.setItem('lastvoyage_tutorial', JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save tutorial progress:', e)
    }
  }

  // Load progress from localStorage
  loadProgress() {
    try {
      const data = localStorage.getItem('lastvoyage_tutorial')
      if (data) {
        const parsed = JSON.parse(data)
        this.stepIndex = parsed.stepIndex || 0
        this.completed = parsed.completed || false
        this.skipped = parsed.skipped || false
        this.progressData = parsed.progressData || { stepsCompleted: [], actionsPerformed: [] }
        this.enabled = parsed.enabled !== undefined ? parsed.enabled : true

        if (!this.completed && !this.skipped) {
          this.currentStep = TUTORIAL_STEPS[this.stepIndex]
        }
      }
    } catch (e) {
      console.error('Failed to load tutorial progress:', e)
    }
  }

  // Reset tutorial
  reset() {
    this.stepIndex = 0
    this.completed = false
    this.skipped = false
    this.currentStep = TUTORIAL_STEPS[0]
    this.progressData = { stepsCompleted: [], actionsPerformed: [] }
    this.enabled = true
    localStorage.removeItem('lastvoyage_tutorial')
  }

  serialize() {
    return {
      stepIndex: this.stepIndex,
      completed: this.completed,
      skipped: this.skipped,
      progressData: this.progressData,
      enabled: this.enabled
    }
  }

  deserialize(data) {
    if (!data) return
    this.stepIndex = data.stepIndex || 0
    this.completed = data.completed || false
    this.skipped = data.skipped || false
    this.progressData = data.progressData || { stepsCompleted: [], actionsPerformed: [] }
    this.enabled = data.enabled !== undefined ? data.enabled : true

    if (!this.completed && !this.skipped) {
      this.currentStep = TUTORIAL_STEPS[this.stepIndex]
    }
  }
}
