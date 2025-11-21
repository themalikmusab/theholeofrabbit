export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: false // We don't need physics for this game
  },
  scene: [] // Will populate with scenes
}

export const RESOURCES = {
  FUEL: 'fuel',
  FOOD: 'food',
  MATERIALS: 'materials',
  POPULATION: 'population',
  MORALE: 'morale',
  TECHNOLOGY: 'technology'
}

export const COLORS = {
  PRIMARY: '#00ffff',
  SECONDARY: '#ff00ff',
  SUCCESS: '#00ff00',
  WARNING: '#ffff00',
  DANGER: '#ff0000',
  TEXT: '#ffffff',
  UI_BG: '#1a1a2e',
  UI_BORDER: '#16213e'
}

export const GAME_SETTINGS = {
  STARTING_RESOURCES: {
    [RESOURCES.FUEL]: 100,
    [RESOURCES.FOOD]: 100,
    [RESOURCES.MATERIALS]: 100,
    [RESOURCES.POPULATION]: 1000,
    [RESOURCES.MORALE]: 75,
    [RESOURCES.TECHNOLOGY]: 0
  }
}
