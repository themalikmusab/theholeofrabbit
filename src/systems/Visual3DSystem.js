// 3D Visual Effects System - Creates pseudo-3D graphics using 2D techniques
import Phaser from 'phaser'
import { COLORS } from '../config'

export default class Visual3DSystem {
  constructor(scene) {
    this.scene = scene
    this.lights = []
    this.shadows = []
    this.depthLayers = []
    this.camera3D = {
      x: 0,
      y: 0,
      z: 1000,
      rotationX: 0,
      rotationY: 0,
      fov: 500
    }
  }

  // Create 3D starfield with depth
  create3DStarfield(width, height, count = 300) {
    const stars = []
    const layers = []

    // Create 5 depth layers for parallax
    for (let layer = 0; layer < 5; layer++) {
      const layerContainer = this.scene.add.container(0, 0)
      const starsPerLayer = Math.floor(count / 5)
      const depth = (layer + 1) * 200 // 200, 400, 600, 800, 1000

      for (let i = 0; i < starsPerLayer; i++) {
        // Random 3D position
        const x = (Math.random() - 0.5) * width * 2
        const y = (Math.random() - 0.5) * height * 2
        const z = depth + Math.random() * 100

        // Calculate projected 2D position
        const projected = this.project3DTo2D(x, y, z, width / 2, height / 2)

        // Size based on depth (closer = bigger)
        const size = Math.max(0.5, 3 / (z / 200))
        const alpha = Math.min(1, 2 / (z / 200))

        const star = this.scene.add.circle(projected.x, projected.y, size, 0xFFFFFF, alpha)

        // Store 3D position
        star.setData('3d', { x, y, z })
        star.setData('layer', layer)

        layerContainer.add(star)
        stars.push(star)

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

      layers.push({ container: layerContainer, depth, speed: 1 / (layer + 1) })
    }

    return { stars, layers }
  }

  // Create isometric ship with 3D appearance
  createIsometricShip(x, y, size = 100, color = 0x00AAFF) {
    const container = this.scene.add.container(x, y)

    // Isometric angle (30 degrees)
    const iso = {
      front: Math.cos(Math.PI / 6),
      side: Math.sin(Math.PI / 6)
    }

    // Ship hull (main body) - isometric cube
    const hullPoints = this.getIsometricCubePoints(0, 0, size, size * 0.6, size * 0.8)

    // Top face (lighter)
    const topFace = this.scene.add.polygon(0, 0, hullPoints.top, color, 0.8)
    container.add(topFace)

    // Left face (medium)
    const leftFace = this.scene.add.polygon(0, 0, hullPoints.left,
      Phaser.Display.Color.IntegerToColor(color).darken(20).color, 0.8)
    container.add(leftFace)

    // Right face (darker)
    const rightFace = this.scene.add.polygon(0, 0, hullPoints.right,
      Phaser.Display.Color.IntegerToColor(color).darken(40).color, 0.8)
    container.add(rightFace)

    // Add engine glow (3D effect)
    const engineGlow = this.scene.add.circle(-size * 0.4, size * 0.2, size * 0.15, 0xFF6600, 0.6)
    container.add(engineGlow)

    // Pulse animation for engine
    this.scene.tweens.add({
      targets: engineGlow,
      scale: 1.3,
      alpha: 0.8,
      duration: 500,
      yoyo: true,
      repeat: -1
    })

    // Add highlights for 3D effect
    const highlight = this.scene.add.ellipse(size * 0.1, -size * 0.2, size * 0.3, size * 0.15, 0xFFFFFF, 0.3)
    container.add(highlight)

    // Shadow
    const shadow = this.createShadow(x, y + size * 0.5, size * 1.2, size * 0.4)

    return { container, shadow, faces: { top: topFace, left: leftFace, right: rightFace } }
  }

  // Get points for isometric cube
  getIsometricCubePoints(x, y, width, height, depth) {
    const iso = {
      x: Math.cos(Math.PI / 6),
      y: Math.sin(Math.PI / 6)
    }

    // Top face points
    const top = [
      x, y - height / 2,
      x + width * iso.x, y - height / 2 - width * iso.y,
      x, y - height / 2 - depth,
      x - width * iso.x, y - height / 2 - width * iso.y
    ]

    // Left face points
    const left = [
      x - width * iso.x, y - height / 2 - width * iso.y,
      x, y - height / 2 - depth,
      x, y + height / 2 - depth,
      x - width * iso.x, y + height / 2 - width * iso.y
    ]

    // Right face points
    const right = [
      x + width * iso.x, y - height / 2 - width * iso.y,
      x, y - height / 2 - depth,
      x, y + height / 2 - depth,
      x + width * iso.x, y + height / 2 - width * iso.y
    ]

    return { top, left, right }
  }

  // Create dynamic lighting
  createLight(x, y, radius, color = 0xFFFFFF, intensity = 0.5) {
    const light = this.scene.add.circle(x, y, radius, color, intensity)
    light.setBlendMode(Phaser.BlendModes.ADD)

    // Gradient effect
    const gradient = this.scene.add.graphics()
    gradient.fillGradientStyle(color, color, color, color, intensity, intensity * 0.5, intensity * 0.5, 0)
    gradient.fillCircle(x, y, radius)
    gradient.setBlendMode(Phaser.BlendModes.ADD)

    this.lights.push({ circle: light, gradient, x, y, radius, color, intensity })

    return { light, gradient }
  }

  // Create shadow
  createShadow(x, y, width, height, alpha = 0.3) {
    const shadow = this.scene.add.ellipse(x, y, width, height, 0x000000, alpha)
    shadow.setBlendMode(Phaser.BlendModes.MULTIPLY)
    this.shadows.push(shadow)
    return shadow
  }

  // Create 3D planet with shading
  create3DPlanet(x, y, radius, baseColor, hasAtmosphere = false) {
    const container = this.scene.add.container(x, y)

    // Base planet sphere
    const planet = this.scene.add.circle(0, 0, radius, baseColor)
    container.add(planet)

    // Shadow gradient (creates sphere illusion)
    const shadowGradient = this.scene.add.graphics()
    const shadowColor = Phaser.Display.Color.IntegerToColor(baseColor).darken(50).color

    shadowGradient.fillStyle(shadowColor, 0.6)
    shadowGradient.slice(0, 0, radius, Math.PI * 0.3, Math.PI * 1.7, false)
    shadowGradient.fillPath()
    container.add(shadowGradient)

    // Highlight (3D sphere effect)
    const highlight = this.scene.add.circle(-radius * 0.3, -radius * 0.3, radius * 0.4, 0xFFFFFF, 0.3)
    container.add(highlight)

    // Atmosphere glow
    if (hasAtmosphere) {
      const atmosphere = this.scene.add.circle(0, 0, radius * 1.1, 0x88CCFF, 0.2)
      atmosphere.setBlendMode(Phaser.BlendModes.ADD)
      container.add(atmosphere)

      // Pulse animation
      this.scene.tweens.add({
        targets: atmosphere,
        scale: 1.15,
        alpha: 0.3,
        duration: 2000,
        yoyo: true,
        repeat: -1
      })
    }

    // Rotation animation
    this.scene.tweens.add({
      targets: shadowGradient,
      angle: 360,
      duration: 20000,
      repeat: -1
    })

    return container
  }

  // Project 3D coordinates to 2D screen space
  project3DTo2D(x3d, y3d, z3d, centerX, centerY) {
    const scale = this.camera3D.fov / (this.camera3D.fov + z3d)

    return {
      x: centerX + x3d * scale,
      y: centerY + y3d * scale,
      scale: scale
    }
  }

  // Create 3D particle explosion
  create3DExplosion(x, y, z, count = 50, color = 0xFF6600) {
    const particles = []

    for (let i = 0; i < count; i++) {
      // Random 3D velocity
      const vx = (Math.random() - 0.5) * 200
      const vy = (Math.random() - 0.5) * 200
      const vz = (Math.random() - 0.5) * 200

      const particle = {
        x: x,
        y: y,
        z: z,
        vx: vx,
        vy: vy,
        vz: vz,
        life: 1.0,
        color: color
      }

      // Create sprite
      const projected = this.project3DTo2D(x, y, z, this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2)
      const sprite = this.scene.add.circle(projected.x, projected.y, 3 * projected.scale, color, 0.8)
      particle.sprite = sprite

      particles.push(particle)
    }

    // Animate particles
    const animation = this.scene.time.addEvent({
      delay: 16, // ~60fps
      callback: () => {
        let allDead = true

        particles.forEach(p => {
          if (p.life <= 0) return

          // Update position
          p.x += p.vx * 0.016
          p.y += p.vy * 0.016
          p.z += p.vz * 0.016

          // Apply gravity
          p.vy += 50 * 0.016

          // Decay
          p.life -= 0.016

          if (p.life > 0) {
            allDead = false

            // Update sprite
            const projected = this.project3DTo2D(
              p.x, p.y, p.z,
              this.scene.cameras.main.width / 2,
              this.scene.cameras.main.height / 2
            )

            p.sprite.setPosition(projected.x, projected.y)
            p.sprite.setScale(projected.scale)
            p.sprite.setAlpha(p.life * 0.8)
          } else {
            p.sprite.destroy()
          }
        })

        if (allDead) {
          animation.remove()
        }
      },
      loop: true
    })

    return particles
  }

  // Create depth fog effect
  createDepthFog(width, height) {
    const fog = this.scene.add.graphics()

    // Gradient from transparent to dark
    const gradient = fog.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(0, 0, 20, 0)')
    gradient.addColorStop(0.7, 'rgba(0, 0, 20, 0.3)')
    gradient.addColorStop(1, 'rgba(0, 0, 20, 0.6)')

    fog.fillStyle(gradient)
    fog.fillRect(0, 0, width, height)
    fog.setDepth(1000)

    return fog
  }

  // Rotate 3D starfield (camera movement effect)
  rotate3DStarfield(starfield, deltaX, deltaY) {
    const width = this.scene.cameras.main.width
    const height = this.scene.cameras.main.height

    starfield.stars.forEach(star => {
      const data = star.getData('3d')

      // Rotate around Y axis
      const newX = data.x * Math.cos(deltaY) - data.z * Math.sin(deltaY)
      const newZ = data.x * Math.sin(deltaY) + data.z * Math.cos(deltaY)

      star.setData('3d', { x: newX, y: data.y, z: newZ })

      // Project to 2D
      const projected = this.project3DTo2D(newX, data.y, newZ, width / 2, height / 2)

      star.setPosition(projected.x, projected.y)
      star.setScale(projected.scale)
      star.setAlpha(Math.min(1, projected.scale * 2))
    })
  }

  // Create volumetric light rays
  createVolumetricRays(x, y, rayCount = 12, length = 300) {
    const rays = []

    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 * i) / rayCount

      const ray = this.scene.add.graphics()
      ray.lineStyle(2, 0xFFFFFF, 0.1)

      const endX = x + Math.cos(angle) * length
      const endY = y + Math.sin(angle) * length

      ray.lineBetween(x, y, endX, endY)
      ray.setBlendMode(Phaser.BlendModes.ADD)

      rays.push(ray)

      // Rotate animation
      this.scene.tweens.add({
        targets: ray,
        angle: 360,
        duration: 30000,
        repeat: -1
      })
    }

    return rays
  }

  // Update lighting based on game state
  updateDynamicLighting(tension = 0) {
    this.lights.forEach(light => {
      // Lights flicker based on tension
      const flicker = 1 - (Math.random() * tension * 0.001)
      light.circle.setAlpha(light.intensity * flicker)
    })
  }

  cleanup() {
    this.lights.forEach(l => {
      if (l.circle) l.circle.destroy()
      if (l.gradient) l.gradient.destroy()
    })
    this.shadows.forEach(s => s.destroy())
    this.lights = []
    this.shadows = []
  }
}
