/**
 * NETPULSE - 2.5D Canvas Fallback Engine
 * Course: Probability and Statistics for Computer Science (25CS203)
 * 
 * Provides an immediate, hardware-agnostic 2.5D perspective driving simulation
 * ensuring the application runs smoothly even on systems with WebGL disabled or restricted.
 */

export class HighwayCanvasFallback {
  constructor({ container, onTelemetryUpdate, onCheckpointReached, onCollision, onCollectPacket }) {
    this.container = container
    this.onTelemetryUpdate = onTelemetryUpdate
    this.onCheckpointReached = onCheckpointReached
    this.onCollision = onCollision
    this.onCollectPacket = onCollectPacket

    this.isRunning = false
    this.isPaused = false
    this.animationFrameId = null

    this.laneNames = ['LANE 1', 'LANE 2', 'LANE 3', 'LANE 4']
    this.currentLane = 1 // 0, 1, 2, 3

    this.speedKmh = 95
    this.distanceMeters = 400
    this.score = 0
    this.packetsCollected = 0
    this.checkpointOptions = []
    this.roadOffset = 0

    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      handbrake: false
    }

    this.init()
  }

  init() {
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'w-full h-full block'
    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')

    this.handleResize = () => {
      if (!this.container) return
      this.canvas.width = this.container.clientWidth || 800
      this.canvas.height = this.container.clientHeight || 500
    }
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  }

  setupCheckpointGantry(options = [], distanceMeters = 400) {
    this.checkpointOptions = options
    this.distanceMeters = distanceMeters
  }

  setInput(key, value) {
    if (key in this.inputs) {
      this.inputs[key] = value
    }
    if (key === 'left' && value) {
      this.currentLane = Math.max(0, this.currentLane - 1)
    }
    if (key === 'right' && value) {
      this.currentLane = Math.min(3, this.currentLane + 1)
    }
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.isPaused = false

    const loop = () => {
      if (!this.isRunning) return
      this.animationFrameId = requestAnimationFrame(loop)

      if (!this.isPaused) {
        // Accelerate / Brake
        if (this.inputs.forward) this.speedKmh = Math.min(180, this.speedKmh + 0.8)
        else if (this.inputs.backward) this.speedKmh = Math.max(20, this.speedKmh - 1.5)
        else this.speedKmh = Math.max(40, this.speedKmh - 0.1)

        this.roadOffset += this.speedKmh * 0.15
        if (this.roadOffset > 100) this.roadOffset = 0

        this.distanceMeters -= (this.speedKmh / 3600) * 16
        if (this.distanceMeters <= 10) {
          if (this.onCheckpointReached) {
            this.onCheckpointReached({
              chosenLane: this.currentLane,
              chosenOption: this.checkpointOptions[this.currentLane] || null
            })
          }
          this.distanceMeters = 450
        }

        if (this.onTelemetryUpdate) {
          this.onTelemetryUpdate({
            speedKmh: Math.round(this.speedKmh),
            gear: Math.max(1, Math.min(6, Math.floor(this.speedKmh / 32) + 1)),
            rpm: Math.round(1200 + (this.speedKmh % 32) * 140),
            distanceMeters: Math.max(0, Math.round(this.distanceMeters)),
            currentLane: this.currentLane,
            laneName: this.laneNames[this.currentLane],
            score: this.score,
            packetsCollected: this.packetsCollected
          })
        }
      }

      this.render()
    }
    this.animationFrameId = requestAnimationFrame(loop)
  }

  render() {
    const w = this.canvas.width
    const h = this.canvas.height
    if (!w || !h) return
    const ctx = this.ctx

    // Sky
    ctx.fillStyle = '#0b0f17'
    ctx.fillRect(0, 0, w, h)

    const horizonY = h * 0.42
    const roadTopWidth = w * 0.14
    const roadBottomWidth = w * 0.86
    const roadTopX = (w - roadTopWidth) / 2
    const roadBottomX = (w - roadBottomWidth) / 2

    // Road surface
    ctx.beginPath()
    ctx.moveTo(roadTopX, horizonY)
    ctx.lineTo(roadTopX + roadTopWidth, horizonY)
    ctx.lineTo(roadBottomX + roadBottomWidth, h)
    ctx.lineTo(roadBottomX, h)
    ctx.closePath()
    ctx.fillStyle = '#111827'
    ctx.fill()
    ctx.strokeStyle = '#26354d'
    ctx.lineWidth = 2
    ctx.stroke()

    // 4 Lanes (3 dividers)
    for (let l = 1; l <= 3; l++) {
      const topLX = roadTopX + (roadTopWidth / 4) * l
      const botLX = roadBottomX + (roadBottomWidth / 4) * l
      ctx.beginPath()
      ctx.setLineDash([12, 14])
      ctx.lineDashOffset = -this.roadOffset
      ctx.moveTo(topLX, horizonY)
      ctx.lineTo(botLX, h)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.setLineDash([])
    }

    // ---------------- PLAYER VEHICLE (Modern NOC Titanium & Technical Sapphire) ----------------
    const carY = h - 45
    const laneWidthBottom = roadBottomWidth / 4
    const carX = roadBottomX + (this.currentLane + 0.5) * laneWidthBottom

    // 1. Royal Blue Chassis Underglow (Soft radial gradient halo on asphalt)
    const underglowGrad = ctx.createRadialGradient(carX, carY + 4, 6, carX, carY + 4, 40)
    underglowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.65)')
    underglowGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.22)')
    underglowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)')
    ctx.fillStyle = underglowGrad
    ctx.beginPath()
    ctx.ellipse(carX, carY + 4, 42, 16, 0, 0, Math.PI * 2)
    ctx.fill()

    // 2. Dual Forward LED Headlight Beams casting forward onto highway
    const beamGradLeft = ctx.createLinearGradient(carX - 16, carY - 18, carX - 26, carY - 110)
    beamGradLeft.addColorStop(0, 'rgba(219, 234, 254, 0.28)')
    beamGradLeft.addColorStop(1, 'rgba(219, 234, 254, 0)')
    ctx.fillStyle = beamGradLeft
    ctx.beginPath()
    ctx.moveTo(carX - 22, carY - 18)
    ctx.lineTo(carX - 12, carY - 18)
    ctx.lineTo(carX - 4, carY - 110)
    ctx.lineTo(carX - 36, carY - 110)
    ctx.closePath()
    ctx.fill()

    const beamGradRight = ctx.createLinearGradient(carX + 16, carY - 18, carX + 26, carY - 110)
    beamGradRight.addColorStop(0, 'rgba(219, 234, 254, 0.28)')
    beamGradRight.addColorStop(1, 'rgba(219, 234, 254, 0)')
    ctx.fillStyle = beamGradRight
    ctx.beginPath()
    ctx.moveTo(carX + 12, carY - 18)
    ctx.lineTo(carX + 22, carY - 18)
    ctx.lineTo(carX + 36, carY - 110)
    ctx.lineTo(carX + 4, carY - 110)
    ctx.closePath()
    ctx.fill()

    // 3. Alloy Wheels (Graphite Rims with Silver Center Hubs)
    // Left Wheel
    ctx.fillStyle = '#0b0f17' // Rubber tire
    ctx.fillRect(carX - 33, carY - 10, 7, 20)
    ctx.fillStyle = '#334155' // Graphite rim
    ctx.fillRect(carX - 32, carY - 7, 5, 14)
    ctx.fillStyle = '#e2e8f0' // Silver center hub
    ctx.fillRect(carX - 33, carY - 1, 7, 2)

    // Right Wheel
    ctx.fillStyle = '#0b0f17' // Rubber tire
    ctx.fillRect(carX + 26, carY - 10, 7, 20)
    ctx.fillStyle = '#334155' // Graphite rim
    ctx.fillRect(carX + 27, carY - 7, 5, 14)
    ctx.fillStyle = '#e2e8f0' // Silver center hub
    ctx.fillRect(carX + 26, carY - 1, 7, 2)

    // 4. Titanium / Metallic Graphite Chassis Body
    const titaniumGrad = ctx.createLinearGradient(carX - 27, carY, carX + 27, carY)
    titaniumGrad.addColorStop(0, '#1e293b')    // Dark flank
    titaniumGrad.addColorStop(0.25, '#475569') // Titanium slate
    titaniumGrad.addColorStop(0.5, '#64748b')  // High specular reflection peak
    titaniumGrad.addColorStop(0.75, '#475569') // Titanium slate
    titaniumGrad.addColorStop(1, '#1e293b')    // Dark flank
    ctx.fillStyle = titaniumGrad

    // Sculpted interceptor hull (tapered front, wide rear)
    ctx.beginPath()
    ctx.moveTo(carX - 22, carY - 20) // Front left
    ctx.lineTo(carX + 22, carY - 20) // Front right
    ctx.lineTo(carX + 27, carY + 6)  // Rear right
    ctx.lineTo(carX - 27, carY + 6)  // Rear left
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 5. Cockpit: Tinted Glass Canopy with Specular Highlight
    const glassGrad = ctx.createLinearGradient(carX, carY - 17, carX, carY - 3)
    glassGrad.addColorStop(0, '#0f172a')
    glassGrad.addColorStop(0.6, '#1e293b')
    glassGrad.addColorStop(1, '#0b0f17')
    ctx.fillStyle = glassGrad

    ctx.beginPath()
    ctx.moveTo(carX - 15, carY - 17)
    ctx.lineTo(carX + 15, carY - 17)
    ctx.lineTo(carX + 18, carY - 3)
    ctx.lineTo(carX - 18, carY - 3)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.stroke()

    // Diagonal Specular Reflection Streak across canopy
    ctx.beginPath()
    ctx.moveTo(carX - 10, carY - 15)
    ctx.lineTo(carX + 4, carY - 5)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 6. Technical Sapphire Racing Accents (#3B82F6)
    ctx.save()
    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#3b82f6'

    // Twin Racing Stripes down hood and deck
    ctx.fillRect(carX - 5, carY - 20, 2.5, 26)
    ctx.fillRect(carX + 2.5, carY - 20, 2.5, 26)

    // Side Aero Blades
    ctx.fillRect(carX - 26, carY - 8, 2, 12)
    ctx.fillRect(carX + 24, carY - 8, 2, 12)

    // Rear Spoiler Wing Accent Bar
    ctx.fillRect(carX - 24, carY + 5, 48, 2)
    ctx.restore()

    // 7. Red LED Rear Taillights
    ctx.save()
    ctx.shadowColor = '#ef4444'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(carX - 22, carY + 3, 44, 2.5) // Continuous LED bar
    ctx.fillRect(carX - 24, carY + 2, 6, 4)     // Left cluster
    ctx.fillRect(carX + 18, carY + 2, 6, 4)     // Right cluster
    ctx.restore()
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  destroy() {
    this.isRunning = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    window.removeEventListener('resize', this.handleResize)
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas)
    }
  }
}
