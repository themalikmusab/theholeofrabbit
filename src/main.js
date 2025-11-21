import Phaser from 'phaser'
import { GAME_CONFIG } from './config'
import BootScene from './scenes/BootScene'
import MenuScene from './scenes/MenuScene'
import MapScene from './scenes/MapScene'
import EventScene from './scenes/EventScene'
import ShipScene from './scenes/ShipScene'
import EndingScene from './scenes/EndingScene'
import CombatScene from './scenes/CombatScene'
import TradingScene from './scenes/TradingScene'
import ShipInteriorScene from './scenes/ShipInteriorScene'
import TutorialScene from './scenes/TutorialScene'

// Register all scenes
GAME_CONFIG.scene = [
  BootScene,
  MenuScene,
  MapScene,
  EventScene,
  ShipScene,
  EndingScene,
  CombatScene,
  TradingScene,
  ShipInteriorScene,
  TutorialScene
]

// Initialize game
const game = new Phaser.Game(GAME_CONFIG)

// Expose game globally for debugging
window.game = game

console.log('THE LAST VOYAGE - Game initialized')
