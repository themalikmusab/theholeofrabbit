/**
 * GalaxyGenerator - Creates procedural star systems for exploration
 */
export default class GalaxyGenerator {
  constructor(seed = Date.now()) {
    this.seed = seed
    this.rng = this.createSeededRNG(seed)
  }

  /**
   * Simple seeded random number generator (LCG algorithm)
   * @param {number} seed
   * @returns {function}  Returns a function that generates 0-1 random numbers
   */
  createSeededRNG(seed) {
    let state = seed
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296
      return state / 4294967296
    }
  }

  /**
   * Generate a galaxy with star systems
   * @param {number} numSystems - Number of systems to generate
   * @param {number} mapWidth - Width of the map area
   * @param {number} mapHeight - Height of the map area
   * @returns {Array} Array of star system objects
   */
  generate(numSystems = 35, mapWidth = 1100, mapHeight = 600) {
    const systems = []

    // Add starting system (Sol)
    systems.push({
      id: 'sol',
      name: 'Sol System',
      x: mapWidth / 2,
      y: mapHeight / 2,
      type: 'start',
      visited: true,
      discovered: true,
      description: 'Humanity\'s birthplace. Earth fades behind you.',
      fuelCost: 0,
      hasEvent: false
    })

    // Generate other systems
    for (let i = 0; i < numSystems; i++) {
      const type = this.chooseSystemType()
      const system = {
        id: `system_${i}`,
        name: this.generateSystemName(),
        x: this.rng() * mapWidth,
        y: this.rng() * mapHeight,
        type: type,
        visited: false,
        discovered: false,
        description: this.getSystemDescription(type),
        fuelCost: 0, // Will be calculated based on distance
        hasEvent: this.rng() > 0.5 // 50% chance of event
      }

      systems.push(system)
    }

    // Add a few special systems
    this.addSpecialSystems(systems, mapWidth, mapHeight)

    // Calculate connections and fuel costs
    this.calculateConnections(systems)

    return systems
  }

  /**
   * Generate a random system name
   */
  generateSystemName() {
    const prefixes = [
      'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
      'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi'
    ]

    const suffixes = [
      'Centauri', 'Prime', 'Secundus', 'Major', 'Minor', 'Proxima', 'Ultima',
      'Nova', 'Nebula', 'Void', 'Expanse', 'Reach', 'Haven', 'Drift'
    ]

    const numbers = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

    const useNumber = this.rng() > 0.7

    if (useNumber) {
      const prefix = prefixes[Math.floor(this.rng() * prefixes.length)]
      const number = numbers[Math.floor(this.rng() * numbers.length)]
      return `${prefix} ${number}`
    } else {
      const prefix = prefixes[Math.floor(this.rng() * prefixes.length)]
      const suffix = suffixes[Math.floor(this.rng() * suffixes.length)]
      return `${prefix} ${suffix}`
    }
  }

  /**
   * Choose a system type based on weighted random
   */
  chooseSystemType() {
    const rand = this.rng()

    // Weighted probabilities
    if (rand < 0.25) return 'barren'       // 25% - Empty, safe
    if (rand < 0.45) return 'resource'     // 20% - Resource rich
    if (rand < 0.60) return 'inhabited'    // 15% - Alien presence
    if (rand < 0.75) return 'anomaly'      // 15% - Strange phenomena
    if (rand < 0.88) return 'ruins'        // 13% - Ancient structures
    if (rand < 0.95) return 'habitable'    // 7% - Potentially colonizable
    return 'hostile'                        // 5% - Dangerous
  }

  /**
   * Get description for system type
   */
  getSystemDescription(type) {
    const descriptions = {
      start: 'Humanity\'s cradle, now left behind.',
      barren: 'An empty system. No planets of note.',
      resource: 'Rich in asteroids and mineable resources.',
      inhabited: 'Signs of alien activity detected.',
      anomaly: 'Strange readings. Proceed with caution.',
      ruins: 'Ancient structures orbit a dead star.',
      habitable: 'Potentially habitable worlds present!',
      hostile: 'Danger detected. High radiation levels.',
      haven: 'A paradise world. Could this be home?'
    }

    return descriptions[type] || 'An unexplored system.'
  }

  /**
   * Add special story systems
   */
  addSpecialSystems(systems, mapWidth, mapHeight) {
    // Add "New Earth" candidate - the goal system
    systems.push({
      id: 'new_earth',
      name: 'Kepler Haven',
      x: mapWidth * 0.85,
      y: mapHeight * 0.15,
      type: 'haven',
      visited: false,
      discovered: false,
      description: 'Long-range scans show a world with liquid water and breathable atmosphere. Could this be humanity\'s new home?',
      fuelCost: 0,
      hasEvent: true,
      special: true
    })

    // Add a mysterious alien system
    systems.push({
      id: 'ancient_core',
      name: 'The Architect Core',
      x: mapWidth * 0.3,
      y: mapHeight * 0.8,
      type: 'ruins',
      visited: false,
      discovered: false,
      description: 'A massive artificial structure at the heart of a dead system. Who built this?',
      fuelCost: 0,
      hasEvent: true,
      special: true
    })
  }

  /**
   * Calculate fuel costs between systems
   */
  calculateConnections(systems) {
    systems.forEach(system => {
      // Find closest systems
      const distances = systems
        .filter(s => s.id !== system.id)
        .map(s => ({
          system: s,
          distance: this.calculateDistance(system, s)
        }))
        .sort((a, b) => a.distance - b.distance)

      // Store connections to nearest systems
      system.connections = distances.slice(0, 5).map(d => d.system.id)
    })
  }

  /**
   * Calculate distance between two systems
   */
  calculateDistance(sys1, sys2) {
    const dx = sys1.x - sys2.x
    const dy = sys1.y - sys2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculate fuel cost for travel
   */
  calculateFuelCost(sys1, sys2) {
    const distance = this.calculateDistance(sys1, sys2)
    // Base cost is ~10-50 fuel depending on distance
    return Math.max(5, Math.floor(distance / 20))
  }

  /**
   * Get systems within fuel range
   */
  getSystemsInRange(currentSystem, systems, availableFuel) {
    return systems.filter(sys => {
      if (sys.id === currentSystem.id) return false
      const fuelCost = this.calculateFuelCost(currentSystem, sys)
      return fuelCost <= availableFuel
    })
  }
}
