/**
 * NETPULSE - 3D Highway Simulator Scene Engine (Three.js)
 * Course: Probability and Statistics for Computer Science (25CS203)
 * 
 * Provides procedural infinite highway geometry, dynamic traffic vehicles,
 * collectible data packets, overhead checkpoint gantries, player vehicle physics,
 * and responsive third-person chase camera.
 */

import * as THREE from 'three'

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export class HighwayScene3D {
  constructor({ container, onTelemetryUpdate, onCheckpointReached, onCollision, onCollectPacket }) {
    this.container = container
    this.onTelemetryUpdate = onTelemetryUpdate
    this.onCheckpointReached = onCheckpointReached
    this.onCollision = onCollision
    this.onCollectPacket = onCollectPacket

    this.isRunning = false
    this.isPaused = false
    this.animationFrameId = null

    // Lane definitions: 4 lanes centered around X=0
    // Lane 0: -4.5, Lane 1: -1.5, Lane 2: +1.5, Lane 3: +4.5
    this.laneX = [-4.5, -1.5, 1.5, 4.5]
    this.roadWidth = 14
    this.roadSegmentLength = 200

    // Vehicle state
    this.vehicle = {
      x: -1.5, // Start in Lane 1
      z: 0,
      vx: 0,
      vz: 0,
      speedKmh: 0,
      targetSpeedKmh: 90,
      maxSpeedKmh: 180,
      acceleration: 45,
      braking: 85,
      handling: 14,
      mesh: null,
      wheels: [],
      recoveryTimer: 0,
      steerAngle: 0,
      laneIndex: 1
    }

    // Input state
    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      handbrake: false
    }

    // Checkpoint & Game State
    this.distanceToNextCheckpoint = 400 // meters
    this.checkpointTargetZ = 400
    this.checkpointOptions = []
    this.checkpointActive = false
    this.cameraMode = 'CHASE' // 'CHASE', 'HOOD', 'ORBIT'
    this.score = 0
    this.packetsCollected = 0

    // Traffic & Collectibles lists
    this.trafficVehicles = []
    this.collectibles = []
    this.checkpointGantry = null
    this.roadSegments = []
    this.serverBuildings = []

    this.init()
  }

  init() {
    const width = this.container.clientWidth || 800
    const height = this.container.clientHeight || 500

    // 1. Scene & Fog
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0b0f17)
    this.scene.fog = new THREE.FogExp2(0x0b0f17, 0.009)

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.5, 300)
    this.camera.position.set(this.vehicle.x, 3.8, -7.5)
    this.camera.lookAt(this.vehicle.x, 1.2, 10)

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement)

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xa5c4ff, 0.8)
    dirLight.position.set(20, 40, 20)
    this.scene.add(dirLight)

    // 5. Build Environment
    this.buildRoad()
    this.buildPlayerVehicle()
    this.buildEnvironmentScenery()
    this.spawnInitialTraffic()
    this.spawnCollectibles()

    // 6. Handle Window Resizing
    this.handleResize = () => {
      if (!this.container) return
      const w = this.container.clientWidth
      const h = this.container.clientHeight
      if (w > 0 && h > 0) {
        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(w, h)
      }
    }
    window.addEventListener('resize', this.handleResize)
  }

  buildRoad() {
    // 2 segments for continuous scrolling
    for (let i = 0; i < 2; i++) {
      const group = new THREE.Group()

      // Asphalt base
      const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.roadSegmentLength)
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.85,
        metalness: 0.1
      })
      const roadMesh = new THREE.Mesh(roadGeo, roadMat)
      roadMesh.rotation.x = -Math.PI / 2
      roadMesh.position.y = 0
      group.add(roadMesh)

      // Shoulder & Barriers
      const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b })
      const leftShoulder = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, this.roadSegmentLength), shoulderMat)
      leftShoulder.position.set(-this.roadWidth / 2 - 0.6, 0.2, 0)
      group.add(leftShoulder)

      const rightShoulder = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, this.roadSegmentLength), shoulderMat)
      rightShoulder.position.set(this.roadWidth / 2 + 0.6, 0.2, 0)
      group.add(rightShoulder)

      // Guardrail glow stripes
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
      const leftStripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, this.roadSegmentLength), stripeMat)
      leftStripe.position.set(-this.roadWidth / 2, 0.4, 0)
      group.add(leftStripe)

      const rightStripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, this.roadSegmentLength), stripeMat)
      rightStripe.position.set(this.roadWidth / 2, 0.4, 0)
      group.add(rightStripe)

      // Dashed lane dividers
      const dashMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      for (let l = 1; l <= 3; l++) {
        const lx = -this.roadWidth / 2 + (this.roadWidth / 4) * l
        for (let z = -this.roadSegmentLength / 2; z < this.roadSegmentLength / 2; z += 6) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 3), dashMat)
          dash.rotation.x = -Math.PI / 2
          dash.position.set(lx, 0.02, z)
          group.add(dash)
        }
      }

      group.position.z = i * this.roadSegmentLength
      this.scene.add(group)
      this.roadSegments.push(group)
    }
  }

  buildPlayerVehicle() {
    const carGroup = new THREE.Group()

    // Chassis Body (Graphite low-poly sports interceptor)
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.75, 4.4)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 0.65
    carGroup.add(body)

    // Cockpit cabin
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.55, 2.2)
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.9
    })
    const cabin = new THREE.Mesh(cabinGeo, cabinMat)
    cabin.position.set(0, 1.25, -0.2)
    carGroup.add(cabin)

    // Royal Blue accent trim
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
    const trimHood = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 1.8), trimMat)
    trimHood.position.set(0, 1.05, 1.1)
    carGroup.add(trimHood)

    // Rear Tail Lights (Vivid Red / Blue)
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
    const leftTail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.1), tailMat)
    leftTail.position.set(-0.8, 0.75, -2.2)
    carGroup.add(leftTail)

    const rightTail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.1), tailMat)
    rightTail.position.set(0.8, 0.75, -2.2)
    carGroup.add(rightTail)

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
    const wheelPositions = [
      [-1.05, 0.38, 1.3],
      [1.05, 0.38, 1.3],
      [-1.05, 0.38, -1.3],
      [1.05, 0.38, -1.3]
    ]

    this.vehicle.wheels = []
    wheelPositions.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat)
      w.rotation.z = Math.PI / 2
      w.position.set(...pos)
      carGroup.add(w)
      this.vehicle.wheels.push(w)
    })

    carGroup.position.set(this.vehicle.x, 0, this.vehicle.z)
    this.scene.add(carGroup)
    this.vehicle.mesh = carGroup
  }

  buildEnvironmentScenery() {
    // Distant futuristic server-rack buildings along sides of highway
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x090e17,
      roughness: 0.7,
      metalness: 0.2
    })
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 })

    for (let i = 0; i < 20; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const x = (this.roadWidth / 2 + 16 + (i * 3.5) % 25) * side
      const z = (i * 18) - 40
      const bHeight = 25 + (i * 7) % 35
      const bWidth = 12 + (i * 3) % 10

      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bWidth), buildingMat)
      bMesh.position.set(x, bHeight / 2, z)
      this.scene.add(bMesh)
      this.serverBuildings.push(bMesh)

      // Server LED strip on building face
      const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.2, bHeight * 0.7, 0.2), ledMat)
      ledStrip.position.set(x - (side * bWidth / 2) + (side * 0.2), bHeight / 2, z)
      this.scene.add(ledStrip)
      this.serverBuildings.push(ledStrip)
    }
  }

  spawnInitialTraffic() {
    // Clear old traffic
    this.trafficVehicles.forEach(t => this.scene.remove(t.mesh))
    this.trafficVehicles = []

    const trafficMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    const truckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })

    for (let i = 0; i < 4; i++) {
      const lane = i % 4
      const isTruck = i % 2 === 0
      const mesh = new THREE.Mesh(
        isTruck ? new THREE.BoxGeometry(2.4, 2.2, 6.0) : new THREE.BoxGeometry(2.0, 0.8, 4.0),
        isTruck ? truckMat : trafficMat
      )
      const spawnZ = this.vehicle.z + 45 + i * 40
      mesh.position.set(this.laneX[lane], isTruck ? 1.1 : 0.4, spawnZ)
      this.scene.add(mesh)

      this.trafficVehicles.push({
        mesh,
        lane,
        speedKmh: 65 + (i * 8),
        isTruck,
        width: isTruck ? 2.4 : 2.0,
        length: isTruck ? 6.0 : 4.0
      })
    }
  }

  spawnCollectibles() {
    this.collectibles.forEach(c => this.scene.remove(c.mesh))
    this.collectibles = []

    const packetGeo = new THREE.OctahedronGeometry(0.65)
    const packetMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1e3a8a,
      roughness: 0.2,
      metalness: 0.8
    })

    for (let i = 0; i < 6; i++) {
      const lane = (i * 2 + 1) % 4
      const mesh = new THREE.Mesh(packetGeo, packetMat)
      const spawnZ = this.vehicle.z + 25 + i * 35
      mesh.position.set(this.laneX[lane], 1.2, spawnZ)
      this.scene.add(mesh)

      this.collectibles.push({
        mesh,
        active: true,
        rotSpeed: 0.04 + (i * 0.01)
      })
    }
  }

  setupCheckpointGantry(options = [], distanceMeters = 400) {
    this.checkpointOptions = options
    this.distanceToNextCheckpoint = distanceMeters
    this.checkpointTargetZ = this.vehicle.z + distanceMeters
    this.checkpointActive = true

    // Remove old gantry
    if (this.checkpointGantry) {
      this.scene.remove(this.checkpointGantry)
      this.checkpointGantry = null
    }

    const gantryGroup = new THREE.Group()

    // Truss columns & beam
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(1.0, 7.5, 1.0), trussMat)
    leftCol.position.set(-this.roadWidth / 2 - 1.2, 3.75, 0)
    gantryGroup.add(leftCol)

    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(1.0, 7.5, 1.0), trussMat)
    rightCol.position.set(this.roadWidth / 2 + 1.2, 3.75, 0)
    gantryGroup.add(rightCol)

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 4, 1.2, 1.2), trussMat)
    topBeam.position.set(0, 7.0, 0)
    gantryGroup.add(topBeam)

    // 4 Lane Signboards
    const signMat = new THREE.MeshBasicMaterial({ color: 0x111827 })
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 })

    for (let l = 0; l < 4; l++) {
      const signGroup = new THREE.Group()
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.5), signMat)
      signMesh.position.set(0, 0, 0)
      signGroup.add(signMesh)

      const borderMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.6), borderMat)
      borderMesh.position.set(0, 0, -0.01)
      signGroup.add(borderMesh)

      signGroup.position.set(this.laneX[l], 6.2, 0)
      gantryGroup.add(signGroup)
    }

    gantryGroup.position.set(0, 0, this.checkpointTargetZ)
    this.scene.add(gantryGroup)
    this.checkpointGantry = gantryGroup
  }

  setInput(key, value) {
    if (key in this.inputs) {
      this.inputs[key] = value
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode
  }

  updatePhysics(delta) {
    // 1. Acceleration & Braking
    if (this.inputs.forward) {
      this.vehicle.speedKmh = Math.min(
        this.vehicle.maxSpeedKmh,
        this.vehicle.speedKmh + this.vehicle.acceleration * delta
      )
    } else if (this.inputs.backward) {
      this.vehicle.speedKmh = Math.max(
        0,
        this.vehicle.speedKmh - this.vehicle.braking * delta
      )
    } else if (this.inputs.handbrake) {
      this.vehicle.speedKmh = Math.max(
        0,
        this.vehicle.speedKmh - this.vehicle.braking * 2.2 * delta
      )
    } else {
      // Natural rolling friction
      this.vehicle.speedKmh = Math.max(
        0,
        this.vehicle.speedKmh - 12 * delta
      )
    }

    // Convert km/h to units per second (1 unit ~= 1 meter)
    const speedUnitsPerSec = (this.vehicle.speedKmh * 1000) / 3600
    this.vehicle.vz = speedUnitsPerSec

    // 2. Lateral Steering (A / D)
    if (this.inputs.left) {
      this.vehicle.vx = -this.vehicle.handling
      this.vehicle.steerAngle = Math.min(0.25, this.vehicle.steerAngle + 2 * delta)
    } else if (this.inputs.right) {
      this.vehicle.vx = this.vehicle.handling
      this.vehicle.steerAngle = Math.max(-0.25, this.vehicle.steerAngle - 2 * delta)
    } else {
      this.vehicle.vx *= 0.8
      this.vehicle.steerAngle *= 0.8
    }

    // Apply movement
    this.vehicle.z += this.vehicle.vz * delta
    this.vehicle.x += this.vehicle.vx * delta

    // Road boundary clamp
    const maxRoadX = (this.roadWidth / 2) - 1.2
    if (this.vehicle.x < -maxRoadX) {
      this.vehicle.x = -maxRoadX
      this.vehicle.vx = 0
    }
    if (this.vehicle.x > maxRoadX) {
      this.vehicle.x = maxRoadX
      this.vehicle.vx = 0
    }

    // Determine closest lane
    let closestLane = 0
    let minDiff = 999
    this.laneX.forEach((lx, idx) => {
      const diff = Math.abs(this.vehicle.x - lx)
      if (diff < minDiff) {
        minDiff = diff
        closestLane = idx
      }
    })
    this.vehicle.laneIndex = closestLane

    // Update 3D car position & wheel spin
    if (this.vehicle.mesh) {
      this.vehicle.mesh.position.set(this.vehicle.x, 0, this.vehicle.z)
      this.vehicle.mesh.rotation.y = -this.vehicle.steerAngle * 0.6
      this.vehicle.mesh.rotation.z = -this.vehicle.steerAngle * 0.4 // banking

      // Spin wheels
      const wheelSpin = this.vehicle.vz * delta * 2.5
      this.vehicle.wheels.forEach(w => {
        w.rotation.x += wheelSpin
      })

      // Collision recovery visual flash
      if (this.vehicle.recoveryTimer > 0) {
        this.vehicle.recoveryTimer -= delta
        this.vehicle.mesh.visible = Math.floor(this.vehicle.recoveryTimer * 12) % 2 === 0
      } else {
        this.vehicle.mesh.visible = true
      }
    }

    // 3. Update Camera
    if (this.camera) {
      if (this.cameraMode === 'CHASE') {
        const targetCamX = this.vehicle.x * 0.65
        const targetCamY = 3.6 + (this.vehicle.speedKmh / 180) * 0.6
        const targetCamZ = this.vehicle.z - 7.5

        this.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12)
        this.camera.lookAt(this.vehicle.x * 0.5, 1.2, this.vehicle.z + 12)
      } else if (this.cameraMode === 'HOOD') {
        this.camera.position.set(this.vehicle.x, 1.35, this.vehicle.z + 1.2)
        this.camera.lookAt(this.vehicle.x, 1.2, this.vehicle.z + 25)
      } else if (this.cameraMode === 'ORBIT') {
        this.camera.position.set(this.vehicle.x + 8, 4.5, this.vehicle.z - 6)
        this.camera.lookAt(this.vehicle.x, 1.0, this.vehicle.z + 5)
      }
    }

    // 4. Update Road Segments (Infinite looping)
    this.roadSegments.forEach(seg => {
      if (seg.position.z + this.roadSegmentLength < this.vehicle.z) {
        seg.position.z += this.roadSegmentLength * 2
      }
    })

    // 5. Update Buildings (Loop ahead)
    this.serverBuildings.forEach(b => {
      if (b.position.z + 50 < this.vehicle.z) {
        b.position.z += 180
      }
    })

    // 6. Update Traffic
    this.trafficVehicles.forEach(t => {
      const trafficSpeedUnits = (t.speedKmh * 1000) / 3600
      t.mesh.position.z += trafficSpeedUnits * delta

      // If traffic fell behind, respawn ahead
      if (t.mesh.position.z + 20 < this.vehicle.z) {
        t.mesh.position.z = this.vehicle.z + 70 + Math.random() * 50
        t.lane = Math.floor(Math.random() * 4)
        t.mesh.position.x = this.laneX[t.lane]
      }

      // Traffic Collision Check
      if (this.vehicle.recoveryTimer <= 0) {
        const dx = Math.abs(this.vehicle.x - t.mesh.position.x)
        const dz = Math.abs(this.vehicle.z - t.mesh.position.z)
        if (dx < (t.width / 2 + 1.0) && dz < (t.length / 2 + 2.1)) {
          // Collision occurred!
          this.vehicle.speedKmh = Math.max(20, this.vehicle.speedKmh - 45)
          this.vehicle.recoveryTimer = 1.4 // invulnerability window
          if (this.onCollision) {
            this.onCollision({ speed: this.vehicle.speedKmh })
          }
        }
      }
    })

    // 7. Update Collectibles
    this.collectibles.forEach(c => {
      if (c.active) {
        c.mesh.rotation.y += c.rotSpeed
        c.mesh.position.y = 1.2 + Math.sin(this.vehicle.z * 0.1 + c.mesh.position.x) * 0.2

        // Pickup collision
        const dx = Math.abs(this.vehicle.x - c.mesh.position.x)
        const dz = Math.abs(this.vehicle.z - c.mesh.position.z)
        if (dx < 1.4 && dz < 2.0) {
          c.active = false
          c.mesh.visible = false
          this.packetsCollected += 1
          this.score += 50
          if (this.onCollectPacket) {
            this.onCollectPacket({ total: this.packetsCollected, score: this.score })
          }
        }
      }

      // Respawn ahead if passed
      if (c.mesh.position.z + 15 < this.vehicle.z) {
        c.mesh.position.z = this.vehicle.z + 60 + Math.random() * 80
        const lane = Math.floor(Math.random() * 4)
        c.mesh.position.x = this.laneX[lane]
        c.active = true
        c.mesh.visible = true
      }
    })

    // 8. Checkpoint Trigger Check
    if (this.checkpointActive && this.checkpointGantry) {
      const remainingDist = Math.max(0, this.checkpointTargetZ - this.vehicle.z)
      this.distanceToNextCheckpoint = Math.round(remainingDist)

      // When crossing the gantry line:
      if (this.vehicle.z >= this.checkpointTargetZ - 1.5) {
        this.checkpointActive = false
        const chosenLane = this.vehicle.laneIndex
        if (this.onCheckpointReached) {
          this.onCheckpointReached({
            chosenLane,
            chosenOption: this.checkpointOptions[chosenLane] || null
          })
        }
      }
    }

    // 9. Dispatch Telemetry Update to HUD
    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({
        speedKmh: Math.round(this.vehicle.speedKmh),
        gear: Math.max(1, Math.min(6, Math.floor(this.vehicle.speedKmh / 32) + 1)),
        rpm: Math.round(1200 + (this.vehicle.speedKmh % 32) * 140),
        distanceMeters: this.distanceToNextCheckpoint,
        currentLane: this.vehicle.laneIndex,
        laneName: `LANE ${this.vehicle.laneIndex + 1}`,
        score: this.score,
        packetsCollected: this.packetsCollected
      })
    }
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.isPaused = false
    let lastTime = performance.now()

    const animate = (now) => {
      if (!this.isRunning) return
      this.animationFrameId = requestAnimationFrame(animate)

      if (!this.isPaused) {
        const delta = Math.min((now - lastTime) / 1000, 0.1) // clamp delta
        this.updatePhysics(delta)
        this.renderer.render(this.scene, this.camera)
      }
      lastTime = now
    }
    this.animationFrameId = requestAnimationFrame(animate)
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

    // Dispose Three.js objects
    if (this.scene) {
      this.scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
        }
      })
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
      this.renderer.dispose()
    }
  }
}
