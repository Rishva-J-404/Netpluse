/**
 * NETPULSE - 2.5D Canvas Fallback Engine
 * 
 * Hardware-agnostic 2.5D driving simulation rendering directly to HTML5 Canvas
 * when WebGL is disabled or restricted.
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

    this.speedKmh = 85
    this.distanceMeters = 350
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
    this.render()
  }

  setupCheckpointGantry(options = [], distanceMeters = 350) {
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

      if (!this.isPaused) {
        // Vehicle speed dynamics
        if (this.inputs.forward) {
          this.speedKmh = Math.min(135, this.speedKmh + 0.6)
        } else if (this.inputs.backward || this.inputs.handbrake) {
          this.speedKmh = Math.max(0, this.speedKmh - 1.2)
        } else {
          // Cruise
          if (this.speedKmh < 85) this.speedKmh += 0.25
          if (this.speedKmh > 85) this.speedKmh -= 0.25
        }

        // Distance progress along route
        const metersPerSec = (this.speedKmh * 1000) / 3600
        const deltaMeters = metersPerSec * 0.016
        this.distanceMeters = Math.max(0, this.distanceMeters - Math.round(deltaMeters))
        this.roadOffset = (this.roadOffset + this.speedKmh * 0.1) % 40

        // Checkpoint trigger
        if (this.distanceMeters <= 0 && this.onCheckpointReached) {
          this.onCheckpointReached({
            chosenLane: this.currentLane,
            chosenOption: this.checkpointOptions[this.currentLane] || 'Normal'
          })
        }

        // Dispatch Telemetry Update
        if (this.onTelemetryUpdate) {
          this.onTelemetryUpdate({
            speedKmh: Math.round(this.speedKmh),
            gear: Math.max(1, Math.min(6, Math.floor(this.speedKmh / 30) + 1)),
            rpm: Math.round(1200 + (this.speedKmh % 30) * 140),
            distanceMeters: this.distanceMeters,
            currentLane: this.currentLane,
            laneName: this.laneNames[this.currentLane],
            score: this.score,
            packetsCollected: this.packetsCollected
          })
        }
      }

      this.render()
      this.animationFrameId = requestAnimationFrame(loop)
    }
    this.animationFrameId = requestAnimationFrame(loop)
  }

  render() {
    const w = this.canvas.width
    const h = this.canvas.height
    if (!w || !h) return
    const ctx = this.ctx

    const horizonY = h * 0.42
    const roadTopWidth = w * 0.14
    const roadBottomWidth = w * 0.86
    const roadTopX = (w - roadTopWidth) / 2
    const roadBottomX = (w - roadBottomWidth) / 2

    // 1. Dark Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
    skyGrad.addColorStop(0, '#111827')
    skyGrad.addColorStop(0.6, '#141b26')
    skyGrad.addColorStop(1, '#181f2b')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, w, h)

    // Stars
    ctx.fillStyle = 'rgba(243, 244, 246, 0.6)'
    for (let s = 0; s < 25; s++) {
      const sx = ((s * 47) % w)
      const sy = ((s * 19) % (horizonY * 0.9))
      ctx.fillRect(sx, sy, 1.5, 1.5)
    }

    // 2. Distant Skyline
    for (let b = 0; b < 16; b++) {
      const bw = 35 + (b * 13) % 40
      const bh = 45 + (b * 19) % 70
      const bx = b < 8 ? (b * 45) : (w - (b - 7) * 45)
      const by = horizonY - bh

      ctx.fillStyle = '#181f2b'
      ctx.fillRect(bx, by, bw, bh)
      ctx.strokeStyle = '#2b3545'
      ctx.lineWidth = 1
      ctx.strokeRect(bx, by, bw, bh)
    }

    // 3. Road Surface
    ctx.beginPath()
    ctx.moveTo(roadTopX, horizonY)
    ctx.lineTo(roadTopX + roadTopWidth, horizonY)
    ctx.lineTo(roadBottomX + roadBottomWidth, h)
    ctx.lineTo(roadBottomX, h)
    ctx.closePath()
    ctx.fillStyle = '#181f2b'
    ctx.fill()
    ctx.strokeStyle = '#2b3545'
    ctx.lineWidth = 2
    ctx.stroke()

    // 4. Barriers
    ctx.save()
    ctx.strokeStyle = '#202938'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(roadTopX, horizonY)
    ctx.lineTo(roadBottomX, h)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(roadTopX + roadTopWidth, horizonY)
    ctx.lineTo(roadBottomX + roadBottomWidth, h)
    ctx.stroke()

    // Subtle blue retroreflectors
    ctx.strokeStyle = '#4f7cff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(roadTopX - 2, horizonY)
    ctx.lineTo(roadBottomX - 4, h)
    ctx.moveTo(roadTopX + roadTopWidth + 2, horizonY)
    ctx.lineTo(roadBottomX + roadBottomWidth + 4, h)
    ctx.stroke()
    ctx.restore()

    // 5. 4 Lanes (3 dividers)
    for (let l = 1; l <= 3; l++) {
      const topLX = roadTopX + (roadTopWidth / 4) * l
      const botLX = roadBottomX + (roadBottomWidth / 4) * l
      ctx.beginPath()
      ctx.setLineDash([14, 16])
      ctx.lineDashOffset = -this.roadOffset
      ctx.moveTo(topLX, horizonY)
      ctx.lineTo(botLX, h)
      ctx.strokeStyle = 'rgba(243, 244, 246, 0.7)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 6. Player Vehicle
    const carY = h - 45
    const laneWidthBottom = roadBottomWidth / 4
    const carX = roadBottomX + (this.currentLane + 0.5) * laneWidthBottom

    // Underglow
    const underglowGrad = ctx.createRadialGradient(carX, carY + 4, 6, carX, carY + 4, 38)
    underglowGrad.addColorStop(0, 'rgba(79, 124, 255, 0.4)')
    underglowGrad.addColorStop(1, 'rgba(79, 124, 255, 0)')
    ctx.fillStyle = underglowGrad
    ctx.beginPath()
    ctx.ellipse(carX, carY + 4, 40, 14, 0, 0, Math.PI * 2)
    ctx.fill()

    // Wheels
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(carX - 33, carY - 10, 7, 20)
    ctx.fillRect(carX + 26, carY - 10, 7, 20)
    ctx.fillStyle = '#4f7cff'
    ctx.fillRect(carX - 33, carY - 1, 7, 2)
    ctx.fillRect(carX + 26, carY - 1, 7, 2)

    // Chassis Body
    const titaniumGrad = ctx.createLinearGradient(carX - 27, carY, carX + 27, carY)
    titaniumGrad.addColorStop(0, '#181f2b')
    titaniumGrad.addColorStop(0.5, '#202938')
    titaniumGrad.addColorStop(1, '#181f2b')
    ctx.fillStyle = titaniumGrad

    ctx.beginPath()
    ctx.moveTo(carX - 22, carY - 20)
    ctx.lineTo(carX + 22, carY - 20)
    ctx.lineTo(carX + 27, carY + 6)
    ctx.lineTo(carX - 27, carY + 6)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#2b3545'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Cockpit Glass
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.moveTo(carX - 15, carY - 17)
    ctx.lineTo(carX + 15, carY - 17)
    ctx.lineTo(carX + 18, carY - 3)
    ctx.lineTo(carX - 18, carY - 3)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#2b3545'
    ctx.lineWidth = 1
    ctx.stroke()

    // Restrained Blue Accents
    ctx.fillStyle = '#4f7cff'
    ctx.fillRect(carX - 4, carY - 20, 2, 26)
    ctx.fillRect(carX + 2, carY - 20, 2, 26)

    // Taillights
    ctx.fillStyle = '#d95c5c'
    ctx.fillRect(carX - 22, carY + 3, 44, 2.5)
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
