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

    // Player vehicle
    const carY = h - 45
    const laneWidthBottom = roadBottomWidth / 4
    const carX = roadBottomX + (this.currentLane + 0.5) * laneWidthBottom

    // Car Body
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(carX - 28, carY - 18, 56, 26)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.strokeRect(carX - 28, carY - 18, 56, 26)

    // Tail lights
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(carX - 24, carY + 2, 12, 4)
    ctx.fillRect(carX + 12, carY + 2, 12, 4)
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
