// Combat System - Tactical space combat encounters
import { COLORS } from '../config'

export const ENEMY_TYPES = {
  PIRATE_SCOUT: {
    name: 'Pirate Scout',
    hull: 30,
    shields: 10,
    weapons: 15,
    evasion: 0.3,
    loot: { materials: [5, 15], fuel: [0, 5] },
    description: 'A small, fast pirate vessel'
  },
  PIRATE_RAIDER: {
    name: 'Pirate Raider',
    hull: 50,
    shields: 25,
    weapons: 25,
    evasion: 0.2,
    loot: { materials: [15, 30], fuel: [5, 15], technology: [0, 5] },
    description: 'A heavily armed pirate ship'
  },
  ALIEN_PATROL: {
    name: 'Alien Patrol Craft',
    hull: 40,
    shields: 30,
    weapons: 20,
    evasion: 0.25,
    loot: { technology: [10, 20], materials: [5, 10] },
    description: 'An alien military patrol'
  },
  ALIEN_WARSHIP: {
    name: 'Alien Warship',
    hull: 80,
    shields: 50,
    weapons: 40,
    evasion: 0.15,
    loot: { technology: [20, 40], materials: [20, 40], fuel: [10, 20] },
    description: 'A powerful alien battleship'
  },
  SCAVENGER_DRONE: {
    name: 'Scavenger Drone',
    hull: 20,
    shields: 5,
    weapons: 10,
    evasion: 0.4,
    loot: { materials: [5, 10] },
    description: 'An automated mining drone turned hostile'
  },
  ANCIENT_GUARDIAN: {
    name: 'Ancient Guardian',
    hull: 100,
    shields: 70,
    weapons: 50,
    evasion: 0.1,
    loot: { technology: [50, 100], materials: [30, 50] },
    description: 'A mysterious ancient defense system'
  }
}

export const COMBAT_ACTIONS = {
  ATTACK: 'attack',
  DEFEND: 'defend',
  EVADE: 'evade',
  SPECIAL: 'special'
}

class Enemy {
  constructor(type) {
    this.type = type
    this.name = type.name
    this.hull = type.hull
    this.maxHull = type.hull
    this.shields = type.shields
    this.maxShields = type.shields
    this.weapons = type.weapons
    this.evasion = type.evasion
    this.loot = type.loot
    this.description = type.description
    this.currentAction = null
  }

  takeDamage(amount) {
    // Shields absorb damage first
    if (this.shields > 0) {
      const shieldDamage = Math.min(this.shields, amount)
      this.shields -= shieldDamage
      amount -= shieldDamage
    }

    // Remaining damage to hull
    if (amount > 0) {
      this.hull -= amount
    }

    return this.hull <= 0
  }

  isDestroyed() {
    return this.hull <= 0
  }

  regenerateShields(amount = 5) {
    this.shields = Math.min(this.maxShields, this.shields + amount)
  }

  chooseAction(playerAction) {
    // AI logic - counter player's previous action
    const rand = Math.random()

    if (this.shields < 10 && this.maxShields > 20) {
      // Low shields, try to defend
      return rand < 0.6 ? COMBAT_ACTIONS.DEFEND : COMBAT_ACTIONS.ATTACK
    }

    if (this.hull < this.maxHull * 0.3) {
      // Low health, be defensive or try to flee
      return rand < 0.5 ? COMBAT_ACTIONS.EVADE : COMBAT_ACTIONS.DEFEND
    }

    // Otherwise, aggressive
    if (rand < 0.6) return COMBAT_ACTIONS.ATTACK
    if (rand < 0.85) return COMBAT_ACTIONS.DEFEND
    return COMBAT_ACTIONS.EVADE
  }
}

export default class CombatSystem {
  constructor(gameState, crewSystem) {
    this.gameState = gameState
    this.crewSystem = crewSystem
    this.currentCombat = null
  }

  // Start a combat encounter
  startCombat(enemyTypeName) {
    const enemyType = ENEMY_TYPES[enemyTypeName]
    if (!enemyType) {
      console.error('Unknown enemy type:', enemyTypeName)
      return null
    }

    // Apply research bonuses to combat stats
    const shieldCapacityBonus = this.gameState.researchSystem.getBonus('shieldCapacity')
    const weaponDamageBonus = this.gameState.researchSystem.getBonus('weaponDamage')
    const hullCapacityBonus = this.gameState.researchSystem.getBonus('hullCapacity')

    const baseShields = this.gameState.resources.shields || 50
    const baseWeapons = this.gameState.resources.weapons || 20
    const baseHull = 100

    this.currentCombat = {
      enemy: new Enemy(enemyType),
      turn: 1,
      playerHull: Math.floor(baseHull * hullCapacityBonus),
      playerMaxHull: Math.floor(baseHull * hullCapacityBonus),
      playerShields: Math.floor(baseShields * shieldCapacityBonus),
      playerMaxShields: Math.floor(baseShields * shieldCapacityBonus),
      playerWeapons: Math.floor(baseWeapons * weaponDamageBonus),
      log: [],
      startTime: Date.now()
    }

    this.addToLog(`Encountered ${enemyType.name}!`)
    this.addToLog(enemyType.description)

    return this.currentCombat
  }

  // Execute a combat turn
  executeTurn(playerAction) {
    if (!this.currentCombat) return null

    const combat = this.currentCombat
    const enemy = combat.enemy
    const enemyAction = enemy.chooseAction(playerAction)

    let playerDamage = 0
    let enemyDamage = 0
    let playerEvaded = false
    let enemyEvaded = false

    // Calculate outcomes based on actions
    switch (playerAction) {
      case COMBAT_ACTIONS.ATTACK:
        // Calculate attack damage with crew bonus
        let baseAttack = combat.playerWeapons + Math.floor(Math.random() * 10)
        const securityBonus = this.crewSystem.getSkillBonus('security')
        baseAttack = Math.floor(baseAttack * (1 + securityBonus))

        if (enemyAction === COMBAT_ACTIONS.EVADE) {
          // Enemy evades
          if (Math.random() < enemy.evasion) {
            enemyEvaded = true
            this.addToLog(`${enemy.name} evaded your attack!`)
          } else {
            enemyDamage = baseAttack
          }
        } else if (enemyAction === COMBAT_ACTIONS.DEFEND) {
          // Enemy defends, reduced damage
          enemyDamage = Math.floor(baseAttack * 0.5)
          enemy.regenerateShields(10)
        } else {
          // Direct hit
          enemyDamage = baseAttack
        }
        break

      case COMBAT_ACTIONS.DEFEND:
        // Regenerate shields, take reduced damage
        combat.playerShields = Math.min(combat.playerMaxShields, combat.playerShields + 15)
        this.addToLog('Shields regenerating... +15 shields')
        break

      case COMBAT_ACTIONS.EVADE:
        // Try to evade enemy attack
        playerEvaded = Math.random() < 0.4 // 40% chance to evade
        break

      case COMBAT_ACTIONS.SPECIAL:
        // Special attack - higher damage, uses fuel
        if (this.gameState.resources.fuel >= 5) {
          this.gameState.modifyResource('fuel', -5)
          enemyDamage = Math.floor(combat.playerWeapons * 2)
          this.addToLog('Overcharged weapons! -5 fuel')
        } else {
          this.addToLog('Not enough fuel for special attack!')
          // Fall back to normal attack
          enemyDamage = combat.playerWeapons
        }
        break
    }

    // Enemy attacks
    if (enemyAction === COMBAT_ACTIONS.ATTACK && playerAction !== COMBAT_ACTIONS.DEFEND) {
      if (!playerEvaded) {
        playerDamage = enemy.weapons + Math.floor(Math.random() * 10)
        // Engineer reduces damage
        playerDamage = this.crewSystem.applyCrewEffects('ship_damage', playerDamage)
      } else {
        this.addToLog('You evaded the enemy attack!')
      }
    } else if (enemyAction === COMBAT_ACTIONS.DEFEND) {
      enemy.regenerateShields(10)
    }

    // Apply damage
    if (enemyDamage > 0 && !enemyEvaded) {
      const destroyed = enemy.takeDamage(enemyDamage)
      this.addToLog(`You dealt ${enemyDamage} damage to ${enemy.name}!`)
      if (destroyed) {
        return this.endCombat(true)
      }
    }

    if (playerDamage > 0) {
      // Apply damage to shields first, then hull
      if (combat.playerShields > 0) {
        const shieldDamage = Math.min(combat.playerShields, playerDamage)
        combat.playerShields -= shieldDamage
        playerDamage -= shieldDamage
        this.addToLog(`Shields absorbed ${shieldDamage} damage!`)
      }

      if (playerDamage > 0) {
        combat.playerHull -= playerDamage
        this.addToLog(`Hull damaged! -${playerDamage} HP`)

        // Damage affects crew morale
        this.crewSystem.modifyAllMorale(-2, 'Ship damage')

        if (combat.playerHull <= 0) {
          return this.endCombat(false)
        }
      }
    }

    // Show enemy status
    this.addToLog(`${enemy.name}: ${Math.floor(enemy.hull)}/${enemy.maxHull} HP, ${Math.floor(enemy.shields)} shields`)

    combat.turn++
    return {
      ongoing: true,
      combat: this.currentCombat
    }
  }

  // End combat and give rewards/consequences
  endCombat(victory) {
    if (!this.currentCombat) return null

    const combat = this.currentCombat
    const enemy = combat.enemy

    let result = {
      victory,
      log: combat.log,
      hullDamage: combat.playerMaxHull - combat.playerHull,
      shieldDamage: combat.playerMaxShields - combat.playerShields,
      turns: combat.turn,
      loot: {}
    }

    if (victory) {
      this.addToLog(`${enemy.name} destroyed!`)

      // Give loot
      for (const [resource, range] of Object.entries(enemy.loot)) {
        const amount = range[0] + Math.floor(Math.random() * (range[1] - range[0]))
        if (amount > 0) {
          this.gameState.modifyResource(resource, amount)
          result.loot[resource] = amount
          this.addToLog(`Salvaged: +${amount} ${resource}`)
        }
      }

      // Boost morale
      this.crewSystem.modifyAllMorale(10, 'Victory in combat')
    } else {
      this.addToLog('Ship critical! Emergency retreat!')

      // Penalties for defeat
      this.gameState.modifyResource('materials', -20)
      this.gameState.modifyResource('fuel', -10)
      this.crewSystem.modifyAllMorale(-15, 'Defeat in combat')

      // Chance of crew injury
      const living = this.crewSystem.getLivingCrew()
      if (living.length > 0 && Math.random() < 0.3) {
        const injured = living[Math.floor(Math.random() * living.length)]
        injured.modifyHealth(-30, 'Combat injury')
        this.addToLog(`${injured.name} was injured in the battle!`)
      }
    }

    result.finalLog = combat.log
    this.currentCombat = null
    return result
  }

  // Attempt to flee combat
  attemptFlee() {
    if (!this.currentCombat) return null

    // Pilot skill increases flee chance
    const pilotBonus = this.crewSystem.getSkillBonus('pilot')
    const fleeChance = 0.5 + pilotBonus

    if (Math.random() < fleeChance) {
      this.addToLog('Successfully fled from combat!')
      const result = {
        fled: true,
        log: this.currentCombat.log,
        fuelCost: 10
      }

      this.gameState.modifyResource('fuel', -10)
      this.crewSystem.modifyAllMorale(-5, 'Fled from combat')
      this.currentCombat = null

      return result
    } else {
      this.addToLog('Failed to flee! Enemy blocks escape route!')
      // Enemy gets free attack
      const enemy = this.currentCombat.enemy
      const damage = enemy.weapons
      this.currentCombat.playerHull -= damage
      this.addToLog(`Took ${damage} damage while trying to flee!`)

      return {
        fled: false,
        ongoing: true,
        combat: this.currentCombat
      }
    }
  }

  addToLog(message) {
    if (this.currentCombat) {
      this.currentCombat.log.push(message)
    }
  }

  // Get random enemy based on threat level
  static getRandomEnemy(threatLevel = 1) {
    const enemies = {
      1: ['PIRATE_SCOUT', 'SCAVENGER_DRONE'],
      2: ['PIRATE_RAIDER', 'ALIEN_PATROL'],
      3: ['ALIEN_WARSHIP', 'ANCIENT_GUARDIAN']
    }

    const pool = enemies[threatLevel] || enemies[1]
    return pool[Math.floor(Math.random() * pool.length)]
  }
}
