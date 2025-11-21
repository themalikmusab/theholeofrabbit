/**
 * SaveSystem - Handles game save/load using localStorage
 */

const SAVE_KEY = 'lastVoyage_saves'
const VERSION = '1.0.0'
const MAX_SAVES = 5

export default class SaveSystem {
  /**
   * Get all save slots
   * @returns {Array} Array of save data
   */
  static getSaves() {
    const data = localStorage.getItem(SAVE_KEY)
    if (!data) return []

    try {
      const parsed = JSON.parse(data)
      if (parsed.version !== VERSION) {
        console.warn('Save version mismatch, clearing old saves')
        return []
      }
      return parsed.saves || []
    } catch (e) {
      console.error('Failed to parse saves:', e)
      return []
    }
  }

  /**
   * Save game to a slot
   * @param {number} slot - Save slot number (1-5)
   * @param {object} gameState - Serialized game state
   * @param {string} saveName - Optional custom save name
   * @returns {boolean} Success status
   */
  static save(slot, gameState, saveName = null) {
    if (slot < 1 || slot > MAX_SAVES) {
      console.error(`Invalid save slot: ${slot}. Must be between 1 and ${MAX_SAVES}`)
      return false
    }

    const saves = this.getSaves()
    const saveData = {
      slot,
      name: saveName || `Save ${slot}`,
      timestamp: new Date().toISOString(),
      gameState: { ...gameState },
      // Add preview data for display
      preview: {
        turn: gameState.turn,
        days: gameState.daysPassed,
        population: gameState.resources?.population || 0,
        currentSystem: gameState.currentSystem
      }
    }

    // Find existing save in this slot or add new one
    const index = saves.findIndex(s => s.slot === slot)
    if (index >= 0) {
      saves[index] = saveData
    } else {
      saves.push(saveData)
    }

    const data = {
      version: VERSION,
      saves: saves.sort((a, b) => a.slot - b.slot)
    }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
      console.log(`Game saved to slot ${slot}`)
      return true
    } catch (e) {
      console.error('Failed to save game:', e)
      return false
    }
  }

  /**
   * Load game from a slot
   * @param {number} slot - Save slot number
   * @returns {object|null} Game state or null if not found
   */
  static load(slot) {
    const saves = this.getSaves()
    const save = saves.find(s => s.slot === slot)

    if (!save) {
      console.warn(`No save found in slot ${slot}`)
      return null
    }

    console.log(`Game loaded from slot ${slot}`)
    return save.gameState
  }

  /**
   * Delete a save slot
   * @param {number} slot - Save slot to delete
   * @returns {boolean} Success status
   */
  static deleteSave(slot) {
    const saves = this.getSaves()
    const filtered = saves.filter(s => s.slot !== slot)

    if (filtered.length === saves.length) {
      console.warn(`No save found in slot ${slot} to delete`)
      return false
    }

    const data = {
      version: VERSION,
      saves: filtered
    }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
      console.log(`Deleted save from slot ${slot}`)
      return true
    } catch (e) {
      console.error('Failed to delete save:', e)
      return false
    }
  }

  /**
   * Clear all saves
   */
  static clearAll() {
    localStorage.removeItem(SAVE_KEY)
    console.log('All saves cleared')
  }

  /**
   * Check if a slot has a save
   * @param {number} slot - Slot to check
   * @returns {boolean}
   */
  static hasSave(slot) {
    const saves = this.getSaves()
    return saves.some(s => s.slot === slot)
  }

  /**
   * Get save metadata (for displaying in load menu)
   * @param {number} slot
   * @returns {object|null}
   */
  static getSaveMetadata(slot) {
    const saves = this.getSaves()
    const save = saves.find(s => s.slot === slot)

    if (!save) return null

    return {
      slot: save.slot,
      name: save.name,
      timestamp: save.timestamp,
      preview: save.preview
    }
  }

  /**
   * Auto-save functionality (quick save)
   */
  static autoSave(gameState) {
    return this.save(1, gameState, 'Auto Save')
  }

  /**
   * Quick save (to most recent slot or slot 1)
   */
  static quickSave(gameState) {
    const saves = this.getSaves()
    if (saves.length === 0) {
      return this.save(1, gameState, 'Quick Save')
    }

    // Save to most recently used slot
    const mostRecent = saves.reduce((prev, current) => {
      return new Date(current.timestamp) > new Date(prev.timestamp) ? current : prev
    })

    return this.save(mostRecent.slot, gameState, 'Quick Save')
  }

  /**
   * Quick load (from most recent save)
   */
  static quickLoad() {
    const saves = this.getSaves()
    if (saves.length === 0) return null

    // Load most recent save
    const mostRecent = saves.reduce((prev, current) => {
      return new Date(current.timestamp) > new Date(prev.timestamp) ? current : prev
    })

    return this.load(mostRecent.slot)
  }

  /**
   * Export save to JSON file
   * @param {number} slot
   */
  static exportSave(slot) {
    const saves = this.getSaves()
    const save = saves.find(s => s.slot === slot)

    if (!save) {
      console.warn(`No save found in slot ${slot}`)
      return
    }

    const dataStr = JSON.stringify(save, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `last_voyage_save_${slot}_${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
    console.log(`Save exported from slot ${slot}`)
  }

  /**
   * Import save from JSON file
   * @param {File} file - JSON file containing save data
   * @param {number} slot - Slot to import into
   * @returns {Promise<boolean>}
   */
  static async importSave(file, slot) {
    try {
      const text = await file.text()
      const saveData = JSON.parse(text)

      if (!saveData.gameState) {
        console.error('Invalid save file format')
        return false
      }

      return this.save(slot, saveData.gameState, saveData.name || `Imported Save`)
    } catch (e) {
      console.error('Failed to import save:', e)
      return false
    }
  }
}
