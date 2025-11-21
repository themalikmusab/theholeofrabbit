// Visual Effects System - Particle effects, animations, and polish
import Phaser from 'phaser'
import { COLORS } from '../config'

export default class VisualEffects {
  constructor(scene) {
    this.scene = scene
    this.particles = []
    this.animations = []
  }

  // Create animated starfield with parallax
  createAnimatedStarfield(width, height) {
    const layers = []

    // Create 3 layers for parallax effect
    for (let layer = 0; layer < 3; layer++) {
      const container = this.scene.add.container(0, 0)
      const speed = (layer + 1) * 0.1
      const count = 50 - (layer * 10)
      const alpha = 1 - (layer * 0.2)
      const size = 2 - (layer * 0.5)

      for (let i = 0; i < count; i++) {
        const x = Math.random() * (width + 200) - 100
        const y = Math.random() * height
        const star = this.scene.add.circle(x, y, size, 0xFFFFFF, alpha)
        container.add(star)

        // Twinkle animation
        this.scene.tweens.add({
          targets: star,
          alpha: alpha * 0.3,
          duration: 1000 + Math.random() * 2000,
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 2000
        })
      }

      layers.push({ container, speed })
    }

    return layers
  }

  // Update parallax starfield (call in scene update)
  updateStarfield(layers, scrollX = 0, scrollY = 0) {
    layers.forEach(layer => {
      layer.container.x = -scrollX * layer.speed
      layer.container.y = -scrollY * layer.speed * 0.5
    })
  }

  // Create warp travel effect
  createWarpEffect(startX, startY, endX, endY, duration = 1000) {
    const graphics = this.scene.add.graphics()
    const particles = []

    // Create streaking stars
    for (let i = 0; i < 30; i++) {
      const angle = Phaser.Math.Angle.Between(startX, startY, endX, endY)
      const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY)
      const offset = (Math.random() - 0.5) * 100

      const x = startX + Math.cos(angle + Math.PI / 2) * offset
      const y = startY + Math.sin(angle + Math.PI / 2) * offset

      const line = this.scene.add.line(
        0, 0,
        x, y,
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        0x00DDFF, 0.6
      )
      line.setLineWidth(2)

      particles.push(line)

      // Fade out
      this.scene.tweens.add({
        targets: line,
        alpha: 0,
        duration: duration,
        onComplete: () => line.destroy()
      })
    }

    return { graphics, particles }
  }

  // Create explosion effect
  createExplosion(x, y, color = 0xFF6600, size = 100) {
    // Flash
    const flash = this.scene.add.circle(x, y, size * 2, 0xFFFFFF, 0.8)
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => flash.destroy()
    })

    // Main explosion
    const explosion = this.scene.add.circle(x, y, size, color, 0.8)
    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      ease: 'Power2',
      onComplete: () => explosion.destroy()
    })

    // Particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = 50 + Math.random() * 100
      const particle = this.scene.add.circle(x, y, 3 + Math.random() * 3, color, 0.8)

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        onComplete: () => particle.destroy()
      })
    }

    // Screen shake
    this.scene.cameras.main.shake(200, 0.005)
  }

  // Create hit effect on target
  createHitEffect(x, y, critical = false) {
    const color = critical ? 0xFF0000 : 0xFFAA00
    const size = critical ? 30 : 20

    const hit = this.scene.add.circle(x, y, size, color, 0.9)
    this.scene.tweens.add({
      targets: hit,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => hit.destroy()
    })

    // Impact particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const particle = this.scene.add.circle(x, y, 2, color, 0.8)

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy()
      })
    }
  }

  // Create shield hit effect
  createShieldHit(x, y, radius = 50) {
    const shield = this.scene.add.circle(x, y, radius, 0x00AAFF, 0)
    shield.setStrokeStyle(3, 0x00DDFF, 0.8)

    this.scene.tweens.add({
      targets: shield,
      alpha: { from: 0.5, to: 0 },
      scale: { from: 1, to: 1.3 },
      duration: 400,
      onComplete: () => shield.destroy()
    })

    // Ripple effect
    const ripple = this.scene.add.circle(x, y, radius * 0.5, 0x00AAFF, 0)
    ripple.setStrokeStyle(2, 0x00DDFF, 0.6)

    this.scene.tweens.add({
      targets: ripple,
      scale: 2,
      alpha: 0,
      duration: 600,
      delay: 100,
      onComplete: () => ripple.destroy()
    })
  }

  // Create warp jump preparation effect
  createWarpChargeEffect(x, y, duration = 2000) {
    const particles = []

    // Create swirling particles
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30
      const distance = 100

      const particle = this.scene.add.circle(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        2, 0x00DDFF, 0.8
      )

      particles.push(particle)

      // Spiral inward
      this.scene.tweens.add({
        targets: particle,
        x: x,
        y: y,
        scale: 2,
        alpha: 0,
        duration: duration,
        delay: i * 30,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      })
    }

    return particles
  }

  // Create resource gain effect
  createResourceGainEffect(x, y, text, color = COLORS.SUCCESS) {
    const label = this.scene.add.text(x, y, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    this.scene.tweens.add({
      targets: label,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => label.destroy()
    })
  }

  // Create scan wave effect
  createScanWave(centerX, centerY, maxRadius = 200) {
    const wave = this.scene.add.circle(centerX, centerY, 10, 0x00FF00, 0)
    wave.setStrokeStyle(3, 0x00FF00, 0.8)

    this.scene.tweens.add({
      targets: wave,
      radius: maxRadius,
      alpha: { from: 0.8, to: 0 },
      duration: 1500,
      ease: 'Power2',
      onComplete: () => wave.destroy()
    })

    return wave
  }

  // Create ambient nebula background
  createNebulaBackground(width, height, colors = [0x6600FF, 0x00DDFF, 0xFF00AA]) {
    const graphics = this.scene.add.graphics()
    graphics.setAlpha(0.3)

    // Create multiple nebula clouds
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 100 + Math.random() * 200
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Radial gradient effect (simplified with circles)
      for (let r = radius; r > 0; r -= 20) {
        const alpha = (1 - r / radius) * 0.3
        graphics.fillStyle(color, alpha)
        graphics.fillCircle(x, y, r)
      }
    }

    // Slowly rotate for dynamic effect
    this.scene.tweens.add({
      targets: graphics,
      angle: 360,
      duration: 120000,
      repeat: -1
    })

    return graphics
  }

  // Create warning pulse effect
  createWarningPulse(target) {
    this.scene.tweens.add({
      targets: target,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: 3
    })
  }

  // Create button hover effect
  createButtonHoverEffect(button) {
    button.on('pointerover', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 100
      })
    })

    button.on('pointerout', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 100
      })
    })

    button.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 50,
        yoyo: true
      })
    })
  }

  // Create system arrival effect
  createArrivalEffect(x, y) {
    // Outer ring
    const ring = this.scene.add.circle(x, y, 80, 0x00FF00, 0)
    ring.setStrokeStyle(4, 0x00FF00, 0.8)

    this.scene.tweens.add({
      targets: ring,
      scale: { from: 0.1, to: 1 },
      alpha: { from: 1, to: 0 },
      duration: 800,
      onComplete: () => ring.destroy()
    })

    // Inner flash
    const flash = this.scene.add.circle(x, y, 40, 0xFFFFFF, 0.8)
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => flash.destroy()
    })

    // Particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const particle = this.scene.add.circle(x, y, 3, 0x00FF00, 0.8)

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 60,
        y: y + Math.sin(angle) * 60,
        alpha: 0,
        duration: 600,
        onComplete: () => particle.destroy()
      })
    }
  }

  // Create damage spark effect
  createDamageSparks(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 30 + Math.random() * 40
      const spark = this.scene.add.rectangle(x, y, 3, 8, 0xFFFF00, 0.9)
      spark.setRotation(angle)

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        angle: angle * 57.3 + Math.random() * 360,
        duration: 400 + Math.random() * 300,
        onComplete: () => spark.destroy()
      })
    }
  }

  // Create engine trail effect
  createEngineTrail(x, y, angle, color = 0x00DDFF) {
    const trailLength = 20 + Math.random() * 20
    const offsetX = Math.cos(angle + Math.PI) * trailLength
    const offsetY = Math.sin(angle + Math.PI) * trailLength

    const trail = this.scene.add.line(
      0, 0, x, y, x + offsetX, y + offsetY,
      color, 0.6
    )
    trail.setLineWidth(3)

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 300,
      onComplete: () => trail.destroy()
    })

    return trail
  }

  // Clean up all effects
  cleanup() {
    this.particles.forEach(p => {
      if (p && p.destroy) p.destroy()
    })
    this.particles = []
    this.animations = []
  }
}
