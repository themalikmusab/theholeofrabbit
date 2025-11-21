// Achievement System - Track player accomplishments and unlock bonuses
export const ACHIEVEMENTS = {
  FIRST_STEPS: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Visit your first star system',
    condition: (gameState) => gameState.visitedSystems.length >= 2,
    reward: { morale: 10 },
    icon: '⭐'
  },
  EXPLORER: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Visit 10 different star systems',
    condition: (gameState) => gameState.visitedSystems.length >= 10,
    reward: { technology: 20 },
    icon: '🌟'
  },
  MASTER_NAVIGATOR: {
    id: 'master_navigator',
    name: 'Master Navigator',
    description: 'Visit 25 different star systems',
    condition: (gameState) => gameState.visitedSystems.length >= 25,
    reward: { fuel: 100, technology: 50 },
    icon: '🗺️'
  },
  SURVIVOR: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive 20 turns',
    condition: (gameState) => gameState.turn >= 20,
    reward: { materials: 50 },
    icon: '💪'
  },
  VETERAN: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Survive 50 turns',
    condition: (gameState) => gameState.turn >= 50,
    reward: { materials: 100, morale: 20 },
    icon: '🏅'
  },
  WARRIOR: {
    id: 'warrior',
    name: 'Warrior',
    description: 'Win 5 combat encounters',
    condition: (gameState) => gameState.achievementData?.combatWins >= 5,
    reward: { weapons: 1 },
    icon: '⚔️'
  },
  ACE_PILOT: {
    id: 'ace_pilot',
    name: 'Ace Pilot',
    description: 'Win 15 combat encounters',
    condition: (gameState) => gameState.achievementData?.combatWins >= 15,
    reward: { technology: 50 },
    icon: '🚀'
  },
  DIPLOMAT: {
    id: 'diplomat',
    name: 'Diplomat',
    description: 'Achieve "Friendly" status with 3 factions',
    condition: (gameState) => {
      const friendly = Object.values(gameState.factionSystem.reputations).filter(r => r > 20)
      return friendly.length >= 3
    },
    reward: { materials: 100 },
    icon: '🤝'
  },
  PEACEKEEPER: {
    id: 'peacekeeper',
    name: 'Peacekeeper',
    description: 'Achieve "Allied" status with any faction',
    condition: (gameState) => {
      return Object.values(gameState.factionSystem.reputations).some(r => r > 50)
    },
    reward: { technology: 75, materials: 75 },
    icon: '🕊️'
  },
  MERCHANT: {
    id: 'merchant',
    name: 'Merchant',
    description: 'Complete 10 trading transactions',
    condition: (gameState) => gameState.achievementData?.trades >= 10,
    reward: { materials: 100 },
    icon: '💰'
  },
  TYCOON: {
    id: 'tycoon',
    name: 'Tycoon',
    description: 'Accumulate 500 materials',
    condition: (gameState) => gameState.resources.materials >= 500,
    reward: { technology: 100 },
    icon: '💎'
  },
  ENGINEER: {
    id: 'engineer',
    name: 'Engineer',
    description: 'Upgrade any module to tier 3',
    condition: (gameState) => {
      return gameState.shipSystem.getAllModules().some(m => m.upgradeTier >= 3)
    },
    reward: { materials: 50 },
    icon: '🔧'
  },
  MASTER_ENGINEER: {
    id: 'master_engineer',
    name: 'Master Engineer',
    description: 'Upgrade all modules to at least tier 2',
    condition: (gameState) => {
      return gameState.shipSystem.getAllModules().every(m => m.upgradeTier >= 2)
    },
    reward: { technology: 100, materials: 100 },
    icon: '⚙️'
  },
  SCIENTIST: {
    id: 'scientist',
    name: 'Scientist',
    description: 'Accumulate 100 technology',
    condition: (gameState) => gameState.resources.technology >= 100,
    reward: { technology: 50 },
    icon: '🔬'
  },
  LEADER: {
    id: 'leader',
    name: 'Leader',
    description: 'Maintain crew morale above 70% for 10 turns',
    condition: (gameState) => gameState.achievementData?.highMoraleTurns >= 10,
    reward: { morale: 20 },
    icon: '👑'
  },
  HEALER: {
    id: 'healer',
    name: 'Healer',
    description: 'Keep all crew members alive for 20 turns',
    condition: (gameState) => {
      return gameState.turn >= 20 &&
             gameState.crewSystem.getLivingCrew().length ===
             gameState.crewSystem.crewHistory.length
    },
    reward: { food: 100 },
    icon: '❤️'
  },
  IRON_WILL: {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Survive with less than 10 fuel',
    condition: (gameState) => gameState.achievementData?.survivedLowFuel,
    reward: { fuel: 50 },
    icon: '🔥'
  },
  LUCKY: {
    id: 'lucky',
    name: 'Lucky',
    description: 'Discover a rare artifact',
    condition: (gameState) => gameState.achievementData?.foundArtifact,
    reward: { technology: 100 },
    icon: '🍀'
  },
  DISCOVERER: {
    id: 'discoverer',
    name: 'Discoverer',
    description: 'Find 5 anomalies',
    condition: (gameState) => gameState.achievementData?.anomaliesFound >= 5,
    reward: { technology: 75 },
    icon: '🔭'
  },
  SAVIOR: {
    id: 'savior',
    name: 'Savior of Humanity',
    description: 'Complete the game with everyone alive',
    condition: (gameState) => {
      return gameState.victory &&
             gameState.crewSystem.getLivingCrew().length ===
             gameState.crewSystem.crewHistory.length
    },
    reward: { legacyBonus: 'perfectRun' },
    icon: '🏆'
  }
}

export default class AchievementSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.unlockedAchievements = []
    this.pendingNotifications = []

    // Initialize achievement tracking data
    if (!gameState.achievementData) {
      gameState.achievementData = {
        combatWins: 0,
        trades: 0,
        highMoraleTurns: 0,
        survivedLowFuel: false,
        foundArtifact: false,
        anomaliesFound: 0
      }
    }
  }

  // Check all achievements and unlock any that are now completed
  checkAchievements() {
    const newlyUnlocked = []

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (this.isUnlocked(achievement.id)) return // Already unlocked

      if (achievement.condition(this.gameState)) {
        this.unlock(achievement.id)
        newlyUnlocked.push(achievement)
      }
    })

    return newlyUnlocked
  }

  // Unlock an achievement
  unlock(achievementId) {
    if (this.isUnlocked(achievementId)) return false

    this.unlockedAchievements.push({
      id: achievementId,
      unlockedAt: Date.now(),
      turn: this.gameState.turn
    })

    const achievement = ACHIEVEMENTS[achievementId.toUpperCase()] ||
                       Object.values(ACHIEVEMENTS).find(a => a.id === achievementId)

    if (achievement && achievement.reward) {
      this.applyReward(achievement.reward)
    }

    this.pendingNotifications.push(achievement)

    // Save to localStorage for persistence
    this.saveToStorage()

    return true
  }

  // Check if achievement is unlocked
  isUnlocked(achievementId) {
    return this.unlockedAchievements.some(a => a.id === achievementId)
  }

  // Apply achievement reward
  applyReward(reward) {
    Object.entries(reward).forEach(([key, value]) => {
      if (key === 'legacyBonus') {
        // Special legacy rewards for future runs
        this.gameState.legacyBonuses = this.gameState.legacyBonuses || []
        this.gameState.legacyBonuses.push(value)
      } else if (key === 'weapons') {
        // Special goods
        this.gameState.shipSystem.getModule('weapons').upgrade()
      } else {
        // Regular resources
        this.gameState.modifyResource(key, value)
      }
    })
  }

  // Get next pending notification
  getNextNotification() {
    return this.pendingNotifications.shift()
  }

  // Get all unlocked achievements
  getUnlockedAchievements() {
    return this.unlockedAchievements.map(unlock => {
      const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === unlock.id)
      return {
        ...achievement,
        ...unlock
      }
    })
  }

  // Get locked achievements
  getLockedAchievements() {
    return Object.values(ACHIEVEMENTS).filter(a => !this.isUnlocked(a.id))
  }

  // Get achievement progress percentage
  getProgress() {
    const total = Object.keys(ACHIEVEMENTS).length
    const unlocked = this.unlockedAchievements.length
    return Math.floor((unlocked / total) * 100)
  }

  // Get statistics
  getStats() {
    return {
      totalAchievements: Object.keys(ACHIEVEMENTS).length,
      unlockedCount: this.unlockedAchievements.length,
      progress: this.getProgress(),
      recentUnlocks: this.unlockedAchievements.slice(-5)
    }
  }

  // Track combat win
  recordCombatWin() {
    this.gameState.achievementData.combatWins++
    this.checkAchievements()
  }

  // Track trade
  recordTrade() {
    this.gameState.achievementData.trades++
    this.checkAchievements()
  }

  // Track high morale turn
  recordHighMoraleTurn() {
    if (this.gameState.crewSystem.getAverageMorale() > 70) {
      this.gameState.achievementData.highMoraleTurns++
    }
    this.checkAchievements()
  }

  // Track low fuel survival
  recordLowFuelSurvival() {
    if (this.gameState.resources.fuel < 10) {
      this.gameState.achievementData.survivedLowFuel = true
      this.checkAchievements()
    }
  }

  // Track artifact discovery
  recordArtifactFound() {
    this.gameState.achievementData.foundArtifact = true
    this.checkAchievements()
  }

  // Track anomaly discovery
  recordAnomalyFound() {
    this.gameState.achievementData.anomaliesFound++
    this.checkAchievements()
  }

  // Save to localStorage for cross-session persistence
  saveToStorage() {
    try {
      const data = {
        unlockedAchievements: this.unlockedAchievements
      }
      localStorage.setItem('lastvoyage_achievements', JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save achievements:', e)
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const data = localStorage.getItem('lastvoyage_achievements')
      if (data) {
        const parsed = JSON.parse(data)
        this.unlockedAchievements = parsed.unlockedAchievements || []
      }
    } catch (e) {
      console.error('Failed to load achievements:', e)
    }
  }

  // Reset all achievements (for testing)
  reset() {
    this.unlockedAchievements = []
    this.pendingNotifications = []
    localStorage.removeItem('lastvoyage_achievements')
  }

  serialize() {
    return {
      unlockedAchievements: this.unlockedAchievements,
      pendingNotifications: this.pendingNotifications
    }
  }

  deserialize(data) {
    if (!data) return
    this.unlockedAchievements = data.unlockedAchievements || []
    this.pendingNotifications = data.pendingNotifications || []
  }
}
