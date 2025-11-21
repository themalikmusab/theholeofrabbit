/**
 * EventSystem - Manages game events, choices, and outcomes
 */

import eventsData from '../data/events.json'

export default class EventSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.events = []
    this.currentEvent = null
  }

  /**
   * Load events from imported JSON data
   */
  async loadEvents() {
    try {
      this.events = eventsData
      console.log(`Loaded ${this.events.length} events`)
      return true
    } catch (error) {
      console.error('Failed to load events:', error)
      return false
    }
  }

  /**
   * Get event by ID
   * @param {string} id - Event ID
   * @returns {object|null}
   */
  getEvent(id) {
    return this.events.find(e => e.id === id) || null
  }

  /**
   * Get a random event based on context
   * @param {string} context - Event context (e.g., 'travel', 'system', 'random')
   * @returns {object|null}
   */
  getRandomEvent(context = 'random') {
    // Filter available events
    const available = this.events.filter(event => {
      // Check if already seen (unless repeatable)
      if (!event.repeatable && this.gameState.hasFlag(`event_${event.id}_seen`)) {
        return false
      }

      // Check context
      if (event.context && event.context !== context) {
        return false
      }

      // Check requirements
      if (event.requirements) {
        if (!this.checkRequirements(event.requirements)) {
          return false
        }
      }

      // Check prerequisite flags
      if (event.prerequisiteFlags) {
        const hasAll = event.prerequisiteFlags.every(flag =>
          this.gameState.hasFlag(flag)
        )
        if (!hasAll) return false
      }

      return true
    })

    if (available.length === 0) {
      console.warn(`No available events for context: ${context}`)
      return null
    }

    // Weighted random selection
    const totalWeight = available.reduce((sum, e) => sum + (e.weight || 1), 0)
    let random = Math.random() * totalWeight

    for (const event of available) {
      random -= (event.weight || 1)
      if (random <= 0) {
        return event
      }
    }

    // Fallback to first available
    return available[0]
  }

  /**
   * Check if requirements are met
   * @param {Array} requirements
   * @returns {boolean}
   */
  checkRequirements(requirements) {
    return requirements.every(req => {
      const value = this.gameState.getResource(req.resource)

      switch (req.operator) {
        case '>=': return value >= req.value
        case '>': return value > req.value
        case '<=': return value <= req.value
        case '<': return value < req.value
        case '==': return value === req.value
        case '!=': return value !== req.value
        default:
          console.error(`Unknown operator: ${req.operator}`)
          return false
      }
    })
  }

  /**
   * Check if a choice is available based on requirements
   * @param {object} choice
   * @returns {boolean}
   */
  checkChoiceAvailable(choice) {
    if (!choice.requirements) return true
    return this.checkRequirements(choice.requirements)
  }

  /**
   * Process a choice and determine outcome
   * @param {object} event
   * @param {number} choiceIndex
   * @returns {object} Result with outcome and effects
   */
  processChoice(event, choiceIndex) {
    const choice = event.choices[choiceIndex]

    if (!choice) {
      return {
        success: false,
        message: 'Invalid choice'
      }
    }

    // Check if choice is available
    if (!this.checkChoiceAvailable(choice)) {
      return {
        success: false,
        message: 'Requirements not met for this choice'
      }
    }

    // Determine outcome based on chance
    const roll = Math.random()
    let cumulative = 0
    let selectedOutcome = null

    for (const outcome of choice.outcomes) {
      cumulative += outcome.chance
      if (roll <= cumulative) {
        selectedOutcome = outcome
        break
      }
    }

    // Fallback to last outcome if something went wrong
    if (!selectedOutcome) {
      selectedOutcome = choice.outcomes[choice.outcomes.length - 1]
    }

    // Apply effects
    const effectsApplied = []
    if (selectedOutcome.effects) {
      selectedOutcome.effects.forEach(effect => {
        if (effect.type === 'flag') {
          // Add or remove flag
          if (effect.value === true || effect.value === 1) {
            this.gameState.addFlag(effect.flag)
            effectsApplied.push(`Flag added: ${effect.flag}`)
          } else {
            this.gameState.removeFlag(effect.flag)
            effectsApplied.push(`Flag removed: ${effect.flag}`)
          }
        } else if (effect.type === 'character') {
          // Modify character opinion
          this.gameState.modifyCharacterOpinion(effect.character, effect.value)
          effectsApplied.push(`${effect.character} opinion: ${effect.value > 0 ? '+' : ''}${effect.value}`)
        } else {
          // Resource modification
          this.gameState.modifyResource(effect.type, effect.value)
          const sign = effect.value > 0 ? '+' : ''
          effectsApplied.push(`${effect.type}: ${sign}${effect.value}`)
        }
      })
    }

    // Set choice flags
    if (choice.flags) {
      choice.flags.forEach(flag => {
        this.gameState.addFlag(flag)
        effectsApplied.push(`Choice flag: ${flag}`)
      })
    }

    // Mark event as seen
    this.gameState.addFlag(`event_${event.id}_seen`)

    // Unlock follow-up events
    if (selectedOutcome.unlocks) {
      selectedOutcome.unlocks.forEach(eventId => {
        this.gameState.addFlag(`event_${eventId}_unlocked`)
      })
    }

    // Check for game over conditions
    const gameOver = this.gameState.checkGameOver()

    return {
      success: true,
      outcome: selectedOutcome,
      text: selectedOutcome.text,
      effectsApplied,
      gameOver
    }
  }

  /**
   * Get available choices for an event (filter by requirements)
   * @param {object} event
   * @returns {Array} Array of choices with availability status
   */
  getAvailableChoices(event) {
    return event.choices.map((choice, index) => ({
      index,
      text: choice.text,
      available: this.checkChoiceAvailable(choice),
      requirements: choice.requirements || []
    }))
  }

  /**
   * Get event statistics
   */
  getStats() {
    const seenEvents = this.events.filter(e =>
      this.gameState.hasFlag(`event_${e.id}_seen`)
    )

    return {
      totalEvents: this.events.length,
      seenEvents: seenEvents.length,
      unseenEvents: this.events.length - seenEvents.length,
      percentSeen: Math.round((seenEvents.length / this.events.length) * 100)
    }
  }

  /**
   * Debug: Get all event IDs
   */
  getAllEventIds() {
    return this.events.map(e => e.id)
  }

  /**
   * Debug: Reset event flags (make events repeatable)
   */
  resetEventFlags() {
    this.events.forEach(event => {
      this.gameState.removeFlag(`event_${event.id}_seen`)
    })
    console.log('All event flags reset')
  }
}
