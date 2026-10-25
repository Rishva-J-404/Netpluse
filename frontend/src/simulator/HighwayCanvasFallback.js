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

    this.speedKmh = 85
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
    this.render()
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
        // Accelerate / Brake / Highway Cruise
        if (this.inputs.forward) this.speedKmh = Math.min(180, this.speedKmh + 0.8)
        else if (this.inputs.backward) this.speedKmh = Math.max(20, this.speedKmh - 1.5)
        else {
          if (this.speedKmh < 85) this.speedKmh = Math.min(85, this.speedKmh + 0.3)
          else if (this.speedKmh > 85) this.speedKmh = Math.max(85, this.speedKmh - 0.2)
        }

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

    const horizonY = h * 0.42
    const roadTopWidth = w * 0.14
    const roadBottomWidth = w * 0.86
    const roadTopX = (w - roadTopWidth) / 2
    const roadBottomX = (w - roadBottomWidth) / 2

    // 1. Dark Navy Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
    skyGrad.addColorStop(0, '#0b1426')
    skyGrad.addColorStop(0.6, '#0d192e')
    skyGrad.addColorStop(1, '#14233d')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, w, h)

    // Twinkling stars in sky
    ctx.fillStyle = 'rgba(244, 247, 252, 0.7)'
    for (let s = 0; s < 30; s++) {
      const sx = ((s * 47) % w)
      const sy = ((s * 19) % (horizonY * 0.9))
      ctx.fillRect(sx, sy, 1.5, 1.5)
    }

    // 2. Distant Facility Skyline
    const bColors = ['#8cc8ff', '#f4f7fc', '#8cc8ff', '#34d399', '#f4f7fc']
    for (let b = 0; b < 16; b++) {
      const bw = 35 + (b * 13) % 40
      const bh = 50 + (b * 19) % 75
      const bx = b < 8 ? (b * 45) : (w - (b - 7) * 45)
      const by = horizonY - bh

      ctx.fillStyle = '#14233d'
      ctx.fillRect(bx, by, bw, bh)
      ctx.strokeStyle = '#2c3d58'
      ctx.lineWidth = 1
      ctx.strokeRect(bx, by, bw, bh)

      // Facility window lights
      for (let wr = 0; wr < Math.floor(bh / 10); wr++) {
        if ((wr + b) % 3 === 0) continue
        ctx.fillStyle = bColors[(wr + b) % bColors.length]
        ctx.fillRect(bx + 6, by + wr * 10 + 4, bw - 12, 3)
      }
    }

    // 3. Road Surface
    ctx.beginPath()
    ctx.moveTo(roadTopX, horizonY)
    ctx.lineTo(roadTopX + roadTopWidth, horizonY)
    ctx.lineTo(roadBottomX + roadBottomWidth, h)
    ctx.lineTo(roadBottomX, h)
    ctx.closePath()
    ctx.fillStyle = '#101a2d'
    ctx.fill()
    ctx.strokeStyle = '#2c3d58'
    ctx.lineWidth = 2
    ctx.stroke()

    // 4. Crash Barriers with subtle light blue retroreflectors
    ctx.save()
    ctx.strokeStyle = '#1b2b46'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(roadTopX, horizonY)
    ctx.lineTo(roadBottomX, h)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(roadTopX + roadTopWidth, horizonY)
    ctx.lineTo(roadBottomX + roadBottomWidth, h)
    ctx.stroke()

    // Light blue retroreflectors
    ctx.strokeStyle = '#8cc8ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(roadTopX - 2, horizonY)
    ctx.lineTo(roadBottomX - 4, h)
    ctx.moveTo(roadTopX + roadTopWidth + 2, horizonY)
    ctx.lineTo(roadBottomX + roadBottomWidth + 4, h)
    ctx.stroke()
    ctx.restore()

    // 5. 4 Lanes (3 clean dividers)
    for (let l = 1; l <= 3; l++) {
      const topLX = roadTopX + (roadTopWidth / 4) * l
      const botLX = roadBottomX + (roadBottomWidth / 4) * l
      ctx.beginPath()
      ctx.setLineDash([14, 16])
      ctx.lineDashOffset = -this.roadOffset
      ctx.moveTo(topLX, horizonY)
      ctx.lineTo(botLX, h)
      ctx.strokeStyle = 'rgba(244, 247, 252, 0.75)'
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 6. Player Vehicle (NOC Navy & Light Blue)
    const carY = h - 45
    const laneWidthBottom = roadBottomWidth / 4
    const carX = roadBottomX + (this.currentLane + 0.5) * laneWidthBottom

    // Underglow
    const underglowGrad = ctx.createRadialGradient(carX, carY + 4, 6, carX, carY + 4, 40)
    underglowGrad.addColorStop(0, 'rgba(140, 200, 255, 0.55)')
    underglowGrad.addColorStop(0.5, 'rgba(140, 200, 255, 0.18)')
    underglowGrad.addColorStop(1, 'rgba(140, 200, 255, 0)')
    ctx.fillStyle = underglowGrad
    ctx.beginPath()
    ctx.ellipse(carX, carY + 4, 42, 16, 0, 0, Math.PI * 2)
    ctx.fill()

    // Headlight Beams
    const beamGradLeft = ctx.createLinearGradient(carX - 16, carY - 18, carX - 26, carY - 110)
    beamGradLeft.addColorStop(0, 'rgba(244, 247, 252, 0.25)')
    beamGradLeft.addColorStop(1, 'rgba(244, 247, 252, 0)')
    ctx.fillStyle = beamGradLeft
    ctx.beginPath()
    ctx.moveTo(carX - 22, carY - 18)
    ctx.lineTo(carX - 12, carY - 18)
    ctx.lineTo(carX - 4, carY - 110)
    ctx.lineTo(carX - 36, carY - 110)
    ctx.closePath()
    ctx.fill()

    const beamGradRight = ctx.createLinearGradient(carX + 16, carY - 18, carX + 26, carY - 110)
    beamGradRight.addColorStop(0, 'rgba(244, 247, 252, 0.25)')
    beamGradRight.addColorStop(1, 'rgba(244, 247, 252, 0)')
    ctx.fillStyle = beamGradRight
    ctx.beginPath()
    ctx.moveTo(carX + 12, carY - 18)
    ctx.lineTo(carX + 22, carY - 18)
    ctx.lineTo(carX + 36, carY - 110)
    ctx.lineTo(carX + 4, carY - 110)
    ctx.closePath()
    ctx.fill()

    // Alloy Wheels
    ctx.fillStyle = '#090e17'
    ctx.fillRect(carX - 33, carY - 10, 7, 20)
    ctx.fillStyle = '#2c3d58'
    ctx.fillRect(carX - 32, carY - 7, 5, 14)
    ctx.fillStyle = '#8cc8ff'
    ctx.fillRect(carX - 33, carY - 1, 7, 2)

    ctx.fillStyle = '#090e17'
    ctx.fillRect(carX + 26, carY - 10, 7, 20)
    ctx.fillStyle = '#2c3d58'
    ctx.fillRect(carX + 27, carY - 7, 5, 14)
    ctx.fillStyle = '#8cc8ff'
    ctx.fillRect(carX + 26, carY - 1, 7, 2)

    // Chassis Body (#1B2B46)
    const titaniumGrad = ctx.createLinearGradient(carX - 27, carY, carX + 27, carY)
    titaniumGrad.addColorStop(0, '#14233d')
    titaniumGrad.addColorStop(0.25, '#1b2b46')
    titaniumGrad.addColorStop(0.5, '#243758')
    titaniumGrad.addColorStop(0.75, '#1b2b46')
    titaniumGrad.addColorStop(1, '#14233d')
    ctx.fillStyle = titaniumGrad

    ctx.beginPath()
    ctx.moveTo(carX - 22, carY - 20)
    ctx.lineTo(carX + 22, carY - 20)
    ctx.lineTo(carX + 27, carY + 6)
    ctx.lineTo(carX - 27, carY + 6)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#2c3d58'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Cockpit Canopy
    const glassGrad = ctx.createLinearGradient(carX, carY - 17, carX, carY - 3)
    glassGrad.addColorStop(0, '#0b1426')
    glassGrad.addColorStop(0.6, '#14233d')
    glassGrad.addColorStop(1, '#0b1426')
    ctx.fillStyle = glassGrad

    ctx.beginPath()
    ctx.moveTo(carX - 15, carY - 17)
    ctx.lineTo(carX + 15, carY - 17)
    ctx.lineTo(carX + 18, carY - 3)
    ctx.lineTo(carX - 18, carY - 3)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#2c3d58'
    ctx.lineWidth = 1
    ctx.stroke()

    // Specular Reflection
    ctx.beginPath()
    ctx.moveTo(carX - 10, carY - 15)
    ctx.lineTo(carX + 4, carY - 5)
    ctx.strokeStyle = 'rgba(244, 247, 252, 0.45)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Light Blue Racing Accents (#8CC8FF)
    ctx.save()
    ctx.fillStyle = '#8cc8ff'
    ctx.fillRect(carX - 5, carY - 20, 2.5, 26)
    ctx.fillRect(carX + 2.5, carY - 20, 2.5, 26)
    ctx.fillRect(carX - 26, carY - 8, 2, 12)
    ctx.fillRect(carX + 24, carY - 8, 2, 12)
    ctx.fillRect(carX - 24, carY + 5, 48, 2)
    ctx.restore()

    // Red LED Taillights
    ctx.save()
    ctx.fillStyle = '#f87171'
    ctx.fillRect(carX - 22, carY + 3, 44, 2.5)
    ctx.fillRect(carX - 24, carY + 2, 6, 4)
    ctx.fillRect(carX + 18, carY + 2, 6, 4)
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
