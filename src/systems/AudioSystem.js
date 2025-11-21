// Adaptive Audio System - Dynamic music and sound effects that respond to gameplay
// Uses Web Audio API for procedural sound generation

export const AUDIO_THEMES = {
  MENU: 'menu',
  EXPLORATION: 'exploration',
  TENSION: 'tension',
  COMBAT: 'combat',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  DISCOVERY: 'discovery',
  HOPE: 'hope'
}

export default class AudioSystem {
  constructor(scene) {
    this.scene = scene
    this.currentTheme = null
    this.tension = 0 // 0-100
    this.audioContext = null
    this.masterGain = null
    this.musicGain = null
    this.sfxGain = null
    this.currentOscillators = []
    this.enabled = true
    this.initialized = false
  }

  // Initialize Web Audio API
  init() {
    if (this.initialized) return

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.3

      this.musicGain = this.audioContext.createGain()
      this.musicGain.connect(this.masterGain)
      this.musicGain.gain.value = 0.5

      this.sfxGain = this.audioContext.createGain()
      this.sfxGain.connect(this.masterGain)
      this.sfxGain.gain.value = 0.7

      this.initialized = true
      console.log('AudioSystem initialized')
    } catch (e) {
      console.error('Web Audio API not supported:', e)
      this.enabled = false
    }
  }

  // Resume audio context (needed for browser autoplay policies)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  // Play adaptive music theme
  playTheme(theme, fadeTime = 2.0) {
    if (!this.enabled || !this.initialized) return

    this.resume()

    // Fade out current theme
    if (this.currentOscillators.length > 0) {
      this.stopTheme(fadeTime)
    }

    this.currentTheme = theme

    // Generate music based on theme
    switch (theme) {
      case AUDIO_THEMES.EXPLORATION:
        this.playExplorationTheme()
        break
      case AUDIO_THEMES.TENSION:
        this.playTensionTheme()
        break
      case AUDIO_THEMES.COMBAT:
        this.playCombatTheme()
        break
      case AUDIO_THEMES.VICTORY:
        this.playVictoryTheme()
        break
      case AUDIO_THEMES.DISCOVERY:
        this.playDiscoveryTheme()
        break
      case AUDIO_THEMES.HOPE:
        this.playHopeTheme()
        break
    }
  }

  playExplorationTheme() {
    // Ambient space music - low, sustained tones
    const now = this.audioContext.currentTime

    // Bass drone
    const bass = this.createOscillator('sine', 55, 0.15)
    bass.start(now)

    // Mid harmonic
    const mid = this.createOscillator('sine', 110, 0.08)
    mid.start(now + 0.5)

    // High shimmer
    const high = this.createOscillator('sine', 880, 0.03)
    const highLFO = this.audioContext.createOscillator()
    highLFO.frequency.value = 0.3
    const highGain = this.audioContext.createGain()
    highGain.gain.value = 0.02
    highLFO.connect(highGain)
    highGain.connect(high.frequency)
    highLFO.start(now)
    high.start(now + 1.0)

    this.currentOscillators.push(bass, mid, high, highLFO)
  }

  playTensionTheme() {
    // Pulsing, dissonant tones
    const now = this.audioContext.currentTime

    // Low pulse
    const pulse = this.createOscillator('triangle', 65, 0.2)
    pulse.frequency.setValueAtTime(65, now)
    pulse.frequency.linearRampToValueAtTime(70, now + 2)
    pulse.frequency.linearRampToValueAtTime(65, now + 4)
    pulse.start(now)

    // Dissonant harmony
    const dissonant = this.createOscillator('sawtooth', 185, 0.06)
    dissonant.start(now + 0.3)

    this.currentOscillators.push(pulse, dissonant)

    // Loop tension
    setTimeout(() => {
      if (this.currentTheme === AUDIO_THEMES.TENSION) {
        this.playTensionTheme()
      }
    }, 4000)
  }

  playCombatTheme() {
    // Fast, aggressive tones
    const now = this.audioContext.currentTime

    // Driving bass
    const bass = this.createOscillator('square', 82, 0.25)
    bass.frequency.setValueAtTime(82, now)
    bass.frequency.setValueAtTime(65, now + 0.25)
    bass.frequency.setValueAtTime(82, now + 0.5)
    bass.start(now)

    // Aggressive mid
    const mid = this.createOscillator('sawtooth', 164, 0.15)
    mid.start(now + 0.1)

    // High tension
    const high = this.createOscillator('triangle', 392, 0.08)
    high.start(now + 0.2)

    this.currentOscillators.push(bass, mid, high)

    // Loop combat theme
    setTimeout(() => {
      if (this.currentTheme === AUDIO_THEMES.COMBAT) {
        this.playCombatTheme()
      }
    }, 1000)
  }

  playVictoryTheme() {
    // Triumphant ascending notes
    const now = this.audioContext.currentTime
    const notes = [261.63, 329.63, 392.00, 523.25] // C, E, G, C

    notes.forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, 0.3)
      osc.start(now + i * 0.3)
      osc.stop(now + i * 0.3 + 0.5)
      this.currentOscillators.push(osc)
    })
  }

  playDiscoveryTheme() {
    // Mystical, ethereal tones
    const now = this.audioContext.currentTime

    // Shimmering high notes
    [440, 554.37, 659.25].forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, 0.15)
      osc.start(now + i * 0.2)

      // Add vibrato
      const lfo = this.audioContext.createOscillator()
      lfo.frequency.value = 5
      const lfoGain = this.audioContext.createGain()
      lfoGain.gain.value = 10
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start(now + i * 0.2)

      this.currentOscillators.push(osc, lfo)
    })
  }

  playHopeTheme() {
    // Warm, uplifting tones
    const now = this.audioContext.currentTime

    // Major chord
    [261.63, 329.63, 392.00].forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, 0.2)
      osc.start(now + i * 0.1)
      this.currentOscillators.push(osc)
    })
  }

  stopTheme(fadeTime = 1.0) {
    const now = this.audioContext.currentTime

    this.currentOscillators.forEach(osc => {
      if (osc.gain) {
        osc.gain.gain.linearRampToValueAtTime(0, now + fadeTime)
      }
      try {
        osc.stop(now + fadeTime + 0.1)
      } catch (e) {
        // Already stopped
      }
    })

    this.currentOscillators = []
    this.currentTheme = null
  }

  createOscillator(type, frequency, volume) {
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = type
    osc.frequency.value = frequency
    gain.gain.value = volume

    osc.connect(gain)
    gain.connect(this.musicGain)

    // Store gain for fade out
    osc.gain = gain

    return osc
  }

  // Sound Effects
  playSound(soundType) {
    if (!this.enabled || !this.initialized) return

    this.resume()
    const now = this.audioContext.currentTime

    switch (soundType) {
      case 'button_click':
        this.playSimpleBeep(440, 0.05, 0.3)
        break

      case 'warp_jump':
        this.playWarpJump(now)
        break

      case 'explosion':
        this.playExplosion(now)
        break

      case 'hit':
        this.playHit(now)
        break

      case 'shield_hit':
        this.playShieldHit(now)
        break

      case 'alert':
        this.playAlert(now)
        break

      case 'resource_gain':
        this.playResourceGain(now)
        break

      case 'scan':
        this.playScan(now)
        break
    }
  }

  playSimpleBeep(frequency, duration, volume = 0.3) {
    const now = this.audioContext.currentTime
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.frequency.value = frequency
    osc.type = 'sine'
    gain.gain.value = volume

    osc.connect(gain)
    gain.connect(this.sfxGain)

    osc.start(now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)
    osc.stop(now + duration)
  }

  playWarpJump(now) {
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(100, now)
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.5)

    gain.gain.setValueAtTime(0.5, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    osc.connect(gain)
    gain.connect(this.sfxGain)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  playExplosion(now) {
    // Create explosion noise
    const bufferSize = this.audioContext.sampleRate * 0.5
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2))
    }

    const noise = this.audioContext.createBufferSource()
    const filter = this.audioContext.createBiquadFilter()
    const gain = this.audioContext.createGain()

    noise.buffer = buffer
    filter.type = 'lowpass'
    filter.frequency.value = 800
    gain.gain.value = 0.5

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)

    noise.start(now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
  }

  playHit(now) {
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1)

    gain.gain.value = 0.3
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

    osc.connect(gain)
    gain.connect(this.sfxGain)

    osc.start(now)
    osc.stop(now + 0.1)
  }

  playShieldHit(now) {
    [200, 400, 600].forEach((freq, i) => {
      const osc = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0.2

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now + i * 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      osc.stop(now + 0.15)
    })
  }

  playAlert(now) {
    [800, 600, 800, 600].forEach((freq, i) => {
      this.playSimpleBeep(freq, 0.1, 0.4)
      setTimeout(() => {}, i * 200)
    })
  }

  playResourceGain(now) {
    [440, 554.37, 659.25].forEach((freq, i) => {
      const osc = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0.15

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now + i * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      osc.stop(now + 0.2)
    })
  }

  playScan(now) {
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1000, now)
    osc.frequency.linearRampToValueAtTime(2000, now + 0.3)
    osc.frequency.linearRampToValueAtTime(1000, now + 0.6)

    gain.gain.value = 0.2

    osc.connect(gain)
    gain.connect(this.sfxGain)

    osc.start(now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
    osc.stop(now + 0.6)
  }

  // Update music based on game state tension
  updateTension(tension) {
    this.tension = Math.max(0, Math.min(100, tension))

    // Automatically transition themes based on tension
    if (this.tension > 70 && this.currentTheme !== AUDIO_THEMES.COMBAT) {
      this.playTheme(AUDIO_THEMES.COMBAT)
    } else if (this.tension > 40 && this.tension <= 70 && this.currentTheme !== AUDIO_THEMES.TENSION) {
      this.playTheme(AUDIO_THEMES.TENSION)
    } else if (this.tension <= 40 && this.currentTheme !== AUDIO_THEMES.EXPLORATION) {
      this.playTheme(AUDIO_THEMES.EXPLORATION)
    }
  }

  setVolume(type, value) {
    value = Math.max(0, Math.min(1, value))

    switch (type) {
      case 'master':
        if (this.masterGain) this.masterGain.gain.value = value
        break
      case 'music':
        if (this.musicGain) this.musicGain.gain.value = value
        break
      case 'sfx':
        if (this.sfxGain) this.sfxGain.gain.value = value
        break
    }
  }

  enable() {
    this.enabled = true
    if (!this.initialized) this.init()
  }

  disable() {
    this.stopTheme(0.1)
    this.enabled = false
  }

  cleanup() {
    this.stopTheme(0)
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}
