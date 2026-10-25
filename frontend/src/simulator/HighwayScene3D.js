/**
 * NETPULSE - 3D Highway Simulator Scene Engine (Three.js)
 * Course: Probability and Statistics for Computer Science (25CS203)
 * 
 * Provides procedural infinite highway geometry, dynamic traffic vehicles,
 * collectible data packets, overhead checkpoint gantries, player vehicle physics,
 * Modern NOC Titanium & Technical Sapphire interceptor aesthetics,
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
    // Lane 0: -4.5 (Left), Lane 1: -1.5 (Center-Left), Lane 2: +1.5 (Center-Right), Lane 3: +4.5 (Right)
    this.laneX = [-4.5, -1.5, 1.5, 4.5]
    this.roadWidth = 14
    this.roadSegmentLength = 200

    // Vehicle state
    this.vehicle = {
      x: -1.5, // Start in Lane 1 (Center-Left)
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
    this.checkpointTargetZ = -400 // Vehicle advances along -Z
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

    // 2. Camera (looks along -Z so screen-left is -X and screen-right is +X)
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.5, 300)
    this.camera.position.set(this.vehicle.x, 3.8, 7.5)
    this.camera.lookAt(this.vehicle.x, 1.2, -10)

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement)

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xa5c4ff, 0.8)
    dirLight.position.set(20, 40, -20)
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
    // 2 segments for continuous scrolling along -Z
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

      group.position.z = -i * this.roadSegmentLength
      this.scene.add(group)
      this.roadSegments.push(group)
    }
  }

  buildPlayerVehicle() {
    const carGroup = new THREE.Group()

    // 1. Materials
    // Titanium / Metallic Graphite (Sleek high specular highlights, high road contrast)
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate-600 Titanium metallic
      roughness: 0.18,
      metalness: 0.92,
      envMapIntensity: 1.2
    })
    const graphiteSkirtMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark carbon graphite skirts/diffuser
      roughness: 0.35,
      metalness: 0.85
    })

    // Technical Sapphire Blue Trim (#3B82F6) with subtle glow
    const sapphireTrimMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.5
    })

    // Tinted Glass Canopy with specular highlights
    const glassCanopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.72,
      roughness: 0.05,
      metalness: 0.95,
      reflectivity: 0.9
    })

    // Headlight LED fixture material
    const ledHeadlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x93c5fd,
      emissiveIntensity: 1.6,
      roughness: 0.1
    })

    // Rear Taillight LED material
    const tailLedMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xef4444,
      emissiveIntensity: 1.8,
      roughness: 0.2
    })

    // ---------------- CHASSIS BODY GEOMETRIES ----------------
    // Lower body / Hull
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 4.4), graphiteSkirtMat)
    lowerBody.position.y = 0.48
    carGroup.add(lowerBody)

    // Main Titanium Upper Body (Hood, Shoulders, Rear Deck)
    const upperBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.38, 3.8), titaniumMat)
    upperBody.position.set(0, 0.75, -0.1)
    carGroup.add(upperBody)

    // Front Aerodynamic Nose Cone / Splitter (Nose points towards -Z)
    const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.12, 0.7), graphiteSkirtMat)
    frontSplitter.position.set(0, 0.32, -2.3)
    carGroup.add(frontSplitter)

    // Rear Aerodynamic Diffuser
    const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.14, 0.4), graphiteSkirtMat)
    rearDiffuser.position.set(0, 0.32, 2.2)
    carGroup.add(rearDiffuser)

    // Rear Wing Spoiler
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.38), titaniumMat)
    spoilerWing.position.set(0, 1.32, 1.95)
    carGroup.add(spoilerWing)

    // Spoiler Wing Pylons
    const pylonGeo = new THREE.BoxGeometry(0.06, 0.35, 0.16)
    const leftPylon = new THREE.Mesh(pylonGeo, graphiteSkirtMat)
    leftPylon.position.set(-0.75, 1.15, 1.95)
    carGroup.add(leftPylon)
    const rightPylon = new THREE.Mesh(pylonGeo, graphiteSkirtMat)
    rightPylon.position.set(0.75, 1.15, 1.95)
    carGroup.add(rightPylon)

    // Spoiler Edge Sapphire Accent
    const spoilerAccent = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.04, 0.06), sapphireTrimMat)
    spoilerAccent.position.set(0, 1.34, 2.14)
    carGroup.add(spoilerAccent)

    // ---------------- COCKPIT GLASS CANOPY ----------------
    // Canopy Glass Core
    const cabinCore = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.48, 1.9), glassCanopyMat)
    cabinCore.position.set(0, 1.18, 0.2)
    carGroup.add(cabinCore)

    // Slanted Front Windshield (slopes down towards front -Z)
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.46, 0.8), glassCanopyMat)
    windshield.position.set(0, 1.08, -0.72)
    windshield.rotation.x = Math.PI / 6.5
    carGroup.add(windshield)

    // Slanted Fastback Rear Window (slopes down towards rear +Z)
    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.42, 0.8), glassCanopyMat)
    rearWindow.position.set(0, 1.06, 1.1)
    rearWindow.rotation.x = -Math.PI / 7.5
    carGroup.add(rearWindow)

    // Cockpit Interior Dashboard Glow (Visible through canopy)
    const dashHUD = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.06, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    )
    dashHUD.position.set(0, 1.0, -0.5)
    carGroup.add(dashHUD)

    // ---------------- SAPPHIRE BLUE RACING ACCENTS (#3B82F6) ----------------
    // Twin Racing Stripes on Hood
    const stripeGeo = new THREE.BoxGeometry(0.12, 0.04, 2.0)
    const leftStripe = new THREE.Mesh(stripeGeo, sapphireTrimMat)
    leftStripe.position.set(-0.35, 0.95, -1.0)
    carGroup.add(leftStripe)

    const rightStripe = new THREE.Mesh(stripeGeo, sapphireTrimMat)
    rightStripe.position.set(0.35, 0.95, -1.0)
    carGroup.add(rightStripe)

    // Roof Racing Stripes
    const roofStripeGeo = new THREE.BoxGeometry(0.1, 0.03, 1.7)
    const leftRoofStripe = new THREE.Mesh(roofStripeGeo, sapphireTrimMat)
    leftRoofStripe.position.set(-0.35, 1.43, 0.2)
    carGroup.add(leftRoofStripe)

    const rightRoofStripe = new THREE.Mesh(roofStripeGeo, sapphireTrimMat)
    rightRoofStripe.position.set(0.35, 1.43, 0.2)
    carGroup.add(rightRoofStripe)

    // Lateral Side Skirt Aero Blades
    const sideBladeGeo = new THREE.BoxGeometry(0.05, 0.08, 3.2)
    const leftBlade = new THREE.Mesh(sideBladeGeo, sapphireTrimMat)
    leftBlade.position.set(-1.06, 0.38, 0)
    carGroup.add(leftBlade)

    const rightBlade = new THREE.Mesh(sideBladeGeo, sapphireTrimMat)
    rightBlade.position.set(1.06, 0.38, 0)
    carGroup.add(rightBlade)

    // Front Grille / Air Intake Sapphire Bar
    const grilleBar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.08), sapphireTrimMat)
    grilleBar.position.set(0, 0.42, -2.36)
    carGroup.add(grilleBar)

    // ---------------- ILLUMINATION: DUAL FORWARD LED HEADLIGHTS ----------------
    // LED Headlight Lenses
    const headlightLensGeo = new THREE.BoxGeometry(0.36, 0.12, 0.12)
    const leftHeadlightMesh = new THREE.Mesh(headlightLensGeo, ledHeadlightMat)
    leftHeadlightMesh.position.set(-0.72, 0.64, -2.22)
    carGroup.add(leftHeadlightMesh)

    const rightHeadlightMesh = new THREE.Mesh(headlightLensGeo, ledHeadlightMat)
    rightHeadlightMesh.position.set(0.72, 0.64, -2.22)
    carGroup.add(rightHeadlightMesh)

    // Forward SpotLights casting light onto highway (pointing along -Z)
    const leftSpot = new THREE.SpotLight(0xdbeafe, 3.2, 50, Math.PI / 7, 0.45, 1.2)
    leftSpot.position.set(-0.72, 0.64, -2.22)
    const leftTarget = new THREE.Object3D()
    leftTarget.position.set(-0.72, 0, -25)
    carGroup.add(leftTarget)
    leftSpot.target = leftTarget
    carGroup.add(leftSpot)

    const rightSpot = new THREE.SpotLight(0xdbeafe, 3.2, 50, Math.PI / 7, 0.45, 1.2)
    rightSpot.position.set(0.72, 0.64, -2.22)
    const rightTarget = new THREE.Object3D()
    rightTarget.position.set(0.72, 0, -25)
    carGroup.add(rightTarget)
    rightSpot.target = rightTarget
    carGroup.add(rightSpot)

    // ---------------- ILLUMINATION: RED REAR TAILLIGHTS ----------------
    // Full-Width LED Taillight Bar
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), tailLedMat)
    tailBar.position.set(0, 0.78, 2.21)
    carGroup.add(tailBar)

    // Outer Taillight Clusters
    const tailClusterGeo = new THREE.BoxGeometry(0.32, 0.16, 0.08)
    const leftTail = new THREE.Mesh(tailClusterGeo, tailLedMat)
    leftTail.position.set(-0.82, 0.78, 2.21)
    carGroup.add(leftTail)

    const rightTail = new THREE.Mesh(tailClusterGeo, tailLedMat)
    rightTail.position.set(0.82, 0.78, 2.21)
    carGroup.add(rightTail)

    // Rear Red Ambient Glow Light
    const tailGlow = new THREE.PointLight(0xef4444, 0.85, 6)
    tailGlow.position.set(0, 0.78, 2.5)
    carGroup.add(tailGlow)

    // ---------------- ILLUMINATION: ROYAL BLUE CHASSIS UNDERGLOW ----------------
    // Central Underglow PointLight
    const underglowLight = new THREE.PointLight(0x3b82f6, 2.2, 5.0, 1.4)
    underglowLight.position.set(0, 0.22, 0)
    carGroup.add(underglowLight)

    // Ground Projection Plane (Hovering just above road surface)
    const underglowPlaneGeo = new THREE.PlaneGeometry(2.8, 5.2)
    const underglowPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    })
    const underglowMesh = new THREE.Mesh(underglowPlaneGeo, underglowPlaneMat)
    underglowMesh.rotation.x = -Math.PI / 2
    underglowMesh.position.set(0, 0.02, 0)
    carGroup.add(underglowMesh)

    // ---------------- ALLOY WHEELS WITH GRAPHITE RIMS & SILVER HUBS ----------------
    // Pre-rotated geometries: cylinder axis permanently along X to eliminate Euler wobble
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 24)
    tireGeo.rotateZ(Math.PI / 2)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0b0f17, roughness: 0.9, metalness: 0.1 })

    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.34, 24)
    rimGeo.rotateZ(Math.PI / 2)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.85 })

    const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.36, 16)
    hubGeo.rotateZ(Math.PI / 2)
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 })

    const spokeGeo = new THREE.BoxGeometry(0.35, 0.54, 0.05)
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.9 })

    const wheelPositions = [
      [-1.06, 0.38, -1.35], // Front-Left
      [1.06, 0.38, -1.35],  // Front-Right
      [-1.06, 0.38, 1.35],  // Rear-Left
      [1.06, 0.38, 1.35]   // Rear-Right
    ]

    this.vehicle.wheels = []
    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group()

      // Rubber Tire
      const tireMesh = new THREE.Mesh(tireGeo, tireMat)
      wheelGroup.add(tireMesh)

      // Graphite Alloy Rim
      const rimMesh = new THREE.Mesh(rimGeo, rimMat)
      wheelGroup.add(rimMesh)

      // Silver Center Hub
      const hubMesh = new THREE.Mesh(hubGeo, hubMat)
      wheelGroup.add(hubMesh)

      // Visual Spokes for spinning feedback
      const spokeMesh1 = new THREE.Mesh(spokeGeo, spokeMat)
      wheelGroup.add(spokeMesh1)
      const spokeMesh2 = new THREE.Mesh(spokeGeo, spokeMat)
      spokeMesh2.rotation.x = Math.PI / 2
      wheelGroup.add(spokeMesh2)

      wheelGroup.position.set(...pos)
      carGroup.add(wheelGroup)
      this.vehicle.wheels.push(wheelGroup)
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
      const z = -(i * 18) + 40
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
      const spawnZ = this.vehicle.z - 45 - i * 40
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
      const spawnZ = this.vehicle.z - 25 - i * 35
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
    this.checkpointTargetZ = this.vehicle.z - distanceMeters
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

    // 4 Lane Signboards (facing +Z towards oncoming driver)
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
    // Left: steers and translates left towards lower lane index / negative X
    // Right: steers and translates right towards higher lane index / positive X
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

    // Apply movement (forward along -Z, lateral along X)
    this.vehicle.z -= this.vehicle.vz * delta
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

    // Determine closest lane (Lane 0: -4.5 left, Lane 3: +4.5 right)
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

    // Update 3D car position, yaw turning, roll banking & wheel spin
    if (this.vehicle.mesh) {
      this.vehicle.mesh.position.set(this.vehicle.x, 0, this.vehicle.z)
      // Yaw turns nose in steering direction (-X when left, +X when right)
      this.vehicle.mesh.rotation.y = this.vehicle.steerAngle * 0.6
      // Roll banks body naturally into the turn (-X tilt when left, +X tilt when right)
      this.vehicle.mesh.rotation.z = this.vehicle.steerAngle * 0.4

      // Spin wheels cleanly around axle without Euler wobble
      const wheelSpin = this.vehicle.vz * delta * 2.5
      this.vehicle.wheels.forEach(w => {
        w.rotation.x -= wheelSpin
      })

      // Collision recovery visual flash
      if (this.vehicle.recoveryTimer > 0) {
        this.vehicle.recoveryTimer -= delta
        this.vehicle.mesh.visible = Math.floor(this.vehicle.recoveryTimer * 12) % 2 === 0
      } else {
        this.vehicle.mesh.visible = true
      }
    }

    // 3. Update Camera (Chase, Hood, Orbit)
    if (this.camera) {
      if (this.cameraMode === 'CHASE') {
        // Chase camera centers cleanly on vehicle.x with 0.15 lerp and gazes forward along lane
        const targetCamX = this.vehicle.x
        const targetCamY = 3.6 + (this.vehicle.speedKmh / 180) * 0.6
        const targetCamZ = this.vehicle.z + 7.5

        this.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.15)
        this.camera.lookAt(this.vehicle.x, 1.2, this.vehicle.z - 12)
      } else if (this.cameraMode === 'HOOD') {
        this.camera.position.set(this.vehicle.x, 1.35, this.vehicle.z - 1.2)
        this.camera.lookAt(this.vehicle.x, 1.2, this.vehicle.z - 25)
      } else if (this.cameraMode === 'ORBIT') {
        this.camera.position.set(this.vehicle.x + 8, 4.5, this.vehicle.z + 6)
        this.camera.lookAt(this.vehicle.x, 1.0, this.vehicle.z - 5)
      }
    }

    // 4. Update Road Segments (Infinite looping along -Z)
    this.roadSegments.forEach(seg => {
      if (seg.position.z - this.roadSegmentLength > this.vehicle.z) {
        seg.position.z -= this.roadSegmentLength * 2
      }
    })

    // 5. Update Buildings (Loop ahead along -Z)
    this.serverBuildings.forEach(b => {
      if (b.position.z - 50 > this.vehicle.z) {
        b.position.z -= 180
      }
    })

    // 6. Update Traffic
    this.trafficVehicles.forEach(t => {
      const trafficSpeedUnits = (t.speedKmh * 1000) / 3600
      t.mesh.position.z -= trafficSpeedUnits * delta

      // If traffic fell behind, respawn ahead in -Z
      if (t.mesh.position.z - 20 > this.vehicle.z) {
        t.mesh.position.z = this.vehicle.z - 70 - Math.random() * 50
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

      // Respawn ahead if passed behind
      if (c.mesh.position.z - 15 > this.vehicle.z) {
        c.mesh.position.z = this.vehicle.z - 60 - Math.random() * 80
        const lane = Math.floor(Math.random() * 4)
        c.mesh.position.x = this.laneX[lane]
        c.active = true
        c.mesh.visible = true
      }
    })

    // 8. Checkpoint Trigger Check
    if (this.checkpointActive && this.checkpointGantry) {
      const remainingDist = Math.max(0, this.vehicle.z - this.checkpointTargetZ)
      this.distanceToNextCheckpoint = Math.round(remainingDist)

      // When crossing the gantry line:
      if (this.vehicle.z <= this.checkpointTargetZ + 1.5) {
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
