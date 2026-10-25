import * as THREE from 'three'

/**
 * Check WebGL availability with canvas context probe
 */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * HighwayScene3D - Production-Grade Vibrant Network Highway Simulator
 * 
 * Features:
 * - Cyber nocturnal atmosphere with starry sky dome and dynamic horizon haze
 * - Futuristic server city skyline with multi-colored glowing window matrices & beacon spires
 * - High-intensity neon highway rails (cyan left, violet right) and animated fiber pulses
 * - Vibrant electric sapphire metallic player interceptor with dual LED headlights, underglow & taillights
 * - Multi-colored AI traffic vehicles with functional lights
 * - Multi-spectrum glowing telemetry crystals (cyan, emerald, gold, purple)
 * - Centered chase camera tracking and realistic turn banking
 */
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

    // 4 Lanes: centered around X=0
    // Lane 0: -4.5 (Leftmost), Lane 1: -1.5 (Center-Left), Lane 2: +1.5 (Center-Right), Lane 3: +4.5 (Rightmost)
    this.laneX = [-4.5, -1.5, 1.5, 4.5]
    this.roadWidth = 14
    this.roadSegmentLength = 200

    // Vehicle physics state
    this.vehicle = {
      x: -1.5, // Start in Lane 1 (Center-Left)
      z: 0,
      vx: 0,
      vz: 0,
      speedKmh: 0,
      targetSpeedKmh: 90,
      maxSpeedKmh: 180,
      acceleration: 48,
      braking: 85,
      handling: 15,
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
    this.distanceToNextCheckpoint = 400
    this.checkpointTargetZ = -400
    this.checkpointOptions = []
    this.checkpointActive = false
    this.cameraMode = 'CHASE' // 'CHASE' | 'HOOD' | 'ORBIT'
    this.score = 0
    this.packetsCollected = 0

    // Environment Collections
    this.roadSegments = []
    this.serverBuildings = []
    this.trafficVehicles = []
    this.collectibles = []
    this.fiberPulses = []
    this.starfield = null

    this.init()
  }

  init() {
    const width = this.container.clientWidth || 800
    const height = this.container.clientHeight || 500

    // 1. Scene, Atmospheric Fog & Skybox
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x070c18)
    this.scene.fog = new THREE.FogExp2(0x0a1020, 0.0075)

    // 2. Camera: looks along -Z (Screen-left is -X, screen-right is +X)
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.5, 350)
    this.camera.position.set(this.vehicle.x, 3.8, 7.5)
    this.camera.lookAt(this.vehicle.x, 1.2, -12)

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    this.container.appendChild(this.renderer.domElement)

    // 4. Vibrant Atmospheric Lighting
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
    this.scene.add(ambientLight)

    // Hemisphere light: Celestial sky glow (cyan-blue) + asphalt bounce (deep slate)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.65)
    hemiLight.position.set(0, 50, 0)
    this.scene.add(hemiLight)

    // Directional moonlight/cyber lighting
    const dirLight = new THREE.DirectionalLight(0x93c5fd, 0.9)
    dirLight.position.set(25, 45, -25)
    this.scene.add(dirLight)

    // 5. Build Environment & World
    this.buildStarfield()
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

  buildStarfield() {
    // 500 twinkling star particles in the upper sky dome
    const starCount = 500
    const starGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)

    const palette = [
      new THREE.Color(0x38bdf8), // Cyan
      new THREE.Color(0x818cf8), // Indigo
      new THREE.Color(0xa78bfa), // Violet
      new THREE.Color(0xf8fafc)  // White
    ]

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3
      positions[idx] = (Math.random() - 0.5) * 350
      positions[idx + 1] = 25 + Math.random() * 80
      positions[idx + 2] = -200 + Math.random() * 400

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[idx] = c.r
      colors[idx + 1] = c.g
      colors[idx + 2] = c.b
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    })

    this.starfield = new THREE.Points(starGeo, starMat)
    this.scene.add(this.starfield)
  }

  buildRoad() {
    // 2 segments for continuous scrolling along -Z
    for (let i = 0; i < 2; i++) {
      const group = new THREE.Group()

      // Asphalt base with refined slate texture
      const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.roadSegmentLength)
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x0d1525,
        roughness: 0.75,
        metalness: 0.25
      })
      const roadMesh = new THREE.Mesh(roadGeo, roadMat)
      roadMesh.rotation.x = -Math.PI / 2
      roadMesh.position.y = 0
      group.add(roadMesh)

      // Outer highway terrain shoulders
      const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x080e1a, roughness: 0.9 })
      const leftShoulder = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, this.roadSegmentLength), shoulderMat)
      leftShoulder.position.set(-this.roadWidth / 2 - 1.0, 0.17, 0)
      group.add(leftShoulder)

      const rightShoulder = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, this.roadSegmentLength), shoulderMat)
      rightShoulder.position.set(this.roadWidth / 2 + 1.0, 0.17, 0)
      group.add(rightShoulder)

      // Vibrant Neon Guardrail Light Rails
      // Left edge: Electric Cyan Neon Rail (#00f0ff)
      const leftRailMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, this.roadSegmentLength), leftRailMat)
      leftRail.position.set(-this.roadWidth / 2, 0.35, 0)
      group.add(leftRail)

      // Right edge: Electric Neon Violet Rail (#a855f7)
      const rightRailMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 })
      const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, this.roadSegmentLength), rightRailMat)
      rightRail.position.set(this.roadWidth / 2, 0.35, 0)
      group.add(rightRail)

      // Glowing dashed lane dividers (bright electric white/cyan)
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
      for (let l = 1; l <= 3; l++) {
        const lx = -this.roadWidth / 2 + (this.roadWidth / 4) * l
        for (let z = -this.roadSegmentLength / 2; z < this.roadSegmentLength / 2; z += 6) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 3.2), dashMat)
          dash.rotation.x = -Math.PI / 2
          dash.position.set(lx, 0.02, z)
          group.add(dash)
        }
      }

      // Animated fiber pulse markers along the rails
      for (let p = 0; p < 8; p++) {
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const pulseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), pulseMat)
        pulseMesh.position.set(
          p % 2 === 0 ? -this.roadWidth / 2 : this.roadWidth / 2,
          0.45,
          -this.roadSegmentLength / 2 + p * 25
        )
        group.add(pulseMesh)
        this.fiberPulses.push(pulseMesh)
      }

      group.position.z = -i * this.roadSegmentLength
      this.scene.add(group)
      this.roadSegments.push(group)
    }
  }

  buildPlayerVehicle() {
    const carGroup = new THREE.Group()

    // 1. Materials
    // Vibrant Electric Sapphire Metallic Body (#2563EB)
    const sapphireBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.88
    })

    // Gloss Carbon Fiber Skirts & Splitters
    const carbonSkirtMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.7
    })

    // Radiant Cyan Racing Decals & Trim (#00f0ff)
    const neonCyanTrimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    const whiteStripeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc })

    // Aerodynamic Tinted Canopy Glass
    const glassCanopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.75,
      roughness: 0.04,
      metalness: 0.95,
      reflectivity: 0.95
    })

    // High-Intensity Forward LED Headlights
    const ledHeadlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff })

    // Full-Width Radiant Red Taillight Bar
    const tailLedMat = new THREE.MeshBasicMaterial({ color: 0xff1744 })

    // 2. Chassis Geometries
    // Lower Carbon Skirt
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.45, 4.4), carbonSkirtMat)
    lowerBody.position.y = 0.48
    carGroup.add(lowerBody)

    // Main Sapphire Upper Body
    const upperBody = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.42, 3.8), sapphireBodyMat)
    upperBody.position.set(0, 0.76, -0.1)
    carGroup.add(upperBody)

    // Aerodynamic Front Splitter (Front points towards -Z)
    const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.7), carbonSkirtMat)
    frontSplitter.position.set(0, 0.32, -2.3)
    carGroup.add(frontSplitter)

    // Rear Carbon Diffuser
    const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.45), carbonSkirtMat)
    rearDiffuser.position.set(0, 0.32, 2.22)
    carGroup.add(rearDiffuser)

    // Sport GT Rear Wing Spoiler
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.08, 0.42), sapphireBodyMat)
    spoilerWing.position.set(0, 1.34, 1.95)
    carGroup.add(spoilerWing)

    // Spoiler Endplates (Neon Cyan accents)
    const leftEndplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.46), neonCyanTrimMat)
    leftEndplate.position.set(-0.98, 1.35, 1.95)
    carGroup.add(leftEndplate)

    const rightEndplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.46), neonCyanTrimMat)
    rightEndplate.position.set(0.98, 1.35, 1.95)
    carGroup.add(rightEndplate)

    // Spoiler Carbon Pylons
    const pylonGeo = new THREE.BoxGeometry(0.06, 0.35, 0.16)
    const leftPylon = new THREE.Mesh(pylonGeo, carbonSkirtMat)
    leftPylon.position.set(-0.72, 1.15, 1.95)
    carGroup.add(leftPylon)

    const rightPylon = new THREE.Mesh(pylonGeo, carbonSkirtMat)
    rightPylon.position.set(0.72, 1.15, 1.95)
    carGroup.add(rightPylon)

    // 3. Cockpit Glass Canopy
    const cabinCore = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.5, 1.9), glassCanopyMat)
    cabinCore.position.set(0, 1.2, 0.2)
    carGroup.add(cabinCore)

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.48, 0.8), glassCanopyMat)
    windshield.position.set(0, 1.1, -0.72)
    windshield.rotation.x = Math.PI / 6.5
    carGroup.add(windshield)

    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.44, 0.8), glassCanopyMat)
    rearWindow.position.set(0, 1.08, 1.1)
    rearWindow.rotation.x = -Math.PI / 7.5
    carGroup.add(rearWindow)

    // Interior Cyber HUD Dashboard Glow
    const dashHUD = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.08, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    )
    dashHUD.position.set(0, 1.02, -0.5)
    carGroup.add(dashHUD)

    // 4. Vibrant Dual Racing Stripes (White core with Cyan pinstripes)
    const whiteStripeGeo = new THREE.BoxGeometry(0.14, 0.04, 2.05)
    const leftWhiteStripe = new THREE.Mesh(whiteStripeGeo, whiteStripeMat)
    leftWhiteStripe.position.set(-0.32, 0.96, -1.0)
    carGroup.add(leftWhiteStripe)

    const rightWhiteStripe = new THREE.Mesh(whiteStripeGeo, whiteStripeMat)
    rightWhiteStripe.position.set(0.32, 0.96, -1.0)
    carGroup.add(rightWhiteStripe)

    const cyanPinstripeGeo = new THREE.BoxGeometry(0.04, 0.045, 2.05)
    const leftCyanStripe = new THREE.Mesh(cyanPinstripeGeo, neonCyanTrimMat)
    leftCyanStripe.position.set(-0.42, 0.96, -1.0)
    carGroup.add(leftCyanStripe)

    const rightCyanStripe = new THREE.Mesh(cyanPinstripeGeo, neonCyanTrimMat)
    rightCyanStripe.position.set(0.42, 0.96, -1.0)
    carGroup.add(rightCyanStripe)

    // Roof Stripes
    const roofStripeGeo = new THREE.BoxGeometry(0.14, 0.03, 1.7)
    const leftRoofStripe = new THREE.Mesh(roofStripeGeo, whiteStripeMat)
    leftRoofStripe.position.set(-0.32, 1.45, 0.2)
    carGroup.add(leftRoofStripe)

    const rightRoofStripe = new THREE.Mesh(roofStripeGeo, whiteStripeMat)
    rightRoofStripe.position.set(0.32, 1.45, 0.2)
    carGroup.add(rightRoofStripe)

    // Side Skirt Neon Cyan Blades
    const sideBladeGeo = new THREE.BoxGeometry(0.06, 0.08, 3.2)
    const leftBlade = new THREE.Mesh(sideBladeGeo, neonCyanTrimMat)
    leftBlade.position.set(-1.08, 0.38, 0)
    carGroup.add(leftBlade)

    const rightBlade = new THREE.Mesh(sideBladeGeo, neonCyanTrimMat)
    rightBlade.position.set(1.08, 0.38, 0)
    carGroup.add(rightBlade)

    // 5. Illumination: Dual Forward Headlights & Forward Light Cones
    const headlightLensGeo = new THREE.BoxGeometry(0.38, 0.14, 0.12)
    const leftHeadlightMesh = new THREE.Mesh(headlightLensGeo, ledHeadlightMat)
    leftHeadlightMesh.position.set(-0.74, 0.65, -2.22)
    carGroup.add(leftHeadlightMesh)

    const rightHeadlightMesh = new THREE.Mesh(headlightLensGeo, ledHeadlightMat)
    rightHeadlightMesh.position.set(0.74, 0.65, -2.22)
    carGroup.add(rightHeadlightMesh)

    // Simulated Forward Headlight Beams (Semi-transparent projected cones onto asphalt)
    const beamGeo = new THREE.ConeGeometry(3.5, 30, 16)
    beamGeo.rotateX(Math.PI / 2)
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    })

    const leftBeam = new THREE.Mesh(beamGeo, beamMat)
    leftBeam.position.set(-0.74, 0.5, -16)
    carGroup.add(leftBeam)

    const rightBeam = new THREE.Mesh(beamGeo, beamMat)
    rightBeam.position.set(0.74, 0.5, -16)
    carGroup.add(rightBeam)

    // Forward SpotLight illuminating oncoming road (-Z)
    const mainHeadlightSpot = new THREE.SpotLight(0xdbeafe, 4.0, 60, Math.PI / 6, 0.4, 1.2)
    mainHeadlightSpot.position.set(0, 0.8, -2.3)
    const spotTarget = new THREE.Object3D()
    spotTarget.position.set(0, 0, -35)
    carGroup.add(spotTarget)
    mainHeadlightSpot.target = spotTarget
    carGroup.add(mainHeadlightSpot)

    // 6. Illumination: Full-Width Red LED Taillight Bar
    const taillightBar = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 0.08), tailLedMat)
    taillightBar.position.set(0, 0.76, 2.22)
    carGroup.add(taillightBar)

    // 7. Illumination: Electric Cyan Underglow
    const underglowLight = new THREE.PointLight(0x00f0ff, 3.5, 7.5, 1.4)
    underglowLight.position.set(0, 0.22, 0)
    carGroup.add(underglowLight)

    // 8. 4 Sport Alloy Wheels
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 24)
    tireGeo.rotateZ(Math.PI / 2)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.85 })

    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.34, 24)
    rimGeo.rotateZ(Math.PI / 2)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.9 })

    const rimRingGeo = new THREE.RingGeometry(0.25, 0.28, 24)
    rimRingGeo.rotateY(Math.PI / 2)
    const rimRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide })

    const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.36, 16)
    hubGeo.rotateZ(Math.PI / 2)
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1, metalness: 0.95 })

    const spokeGeo = new THREE.BoxGeometry(0.35, 0.54, 0.05)
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.9 })

    const wheelPositions = [
      [-1.06, 0.38, -1.35], // Front-Left
      [1.06, 0.38, -1.35],  // Front-Right
      [-1.06, 0.38, 1.35],  // Rear-Left
      [1.06, 0.38, 1.35]    // Rear-Right
    ]

    this.vehicle.wheels = []
    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group()

      // Rubber Tire
      const tireMesh = new THREE.Mesh(tireGeo, tireMat)
      wheelGroup.add(tireMesh)

      // Alloy Rim
      const rimMesh = new THREE.Mesh(rimGeo, rimMat)
      wheelGroup.add(rimMesh)

      // Cyan Accent Rim Edge
      const rimRing = new THREE.Mesh(rimRingGeo, rimRingMat)
      rimRing.position.set(pos[0] < 0 ? -0.17 : 0.17, 0, 0)
      wheelGroup.add(rimRing)

      // Center Hub
      const hubMesh = new THREE.Mesh(hubGeo, hubMat)
      wheelGroup.add(hubMesh)

      // Spokes
      const spoke1 = new THREE.Mesh(spokeGeo, spokeMat)
      wheelGroup.add(spoke1)
      const spoke2 = new THREE.Mesh(spokeGeo, spokeMat)
      spoke2.rotation.x = Math.PI / 2
      wheelGroup.add(spoke2)

      wheelGroup.position.set(...pos)
      carGroup.add(wheelGroup)
      this.vehicle.wheels.push(wheelGroup)
    })

    carGroup.position.set(this.vehicle.x, 0, this.vehicle.z)
    this.scene.add(carGroup)
    this.vehicle.mesh = carGroup
  }

  buildEnvironmentScenery() {
    // Futuristic Server City with Multi-Colored Glowing Window Matrices
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.35,
      metalness: 0.7
    })

    const windowPalettes = [
      0x38bdf8, // Electric Cyan
      0x34d399, // Emerald Green
      0xfbbf24, // Amber Server Glow
      0xa855f7, // Cyber Purple
      0xf8fafc  // Pure White
    ]

    for (let i = 0; i < 24; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const x = (this.roadWidth / 2 + 15 + (i * 3.8) % 24) * side
      const z = -(i * 18) + 40
      const bHeight = 30 + (i * 9) % 45
      const bWidth = 14 + (i * 3) % 12

      const bGroup = new THREE.Group()

      // Tower Core Mesh
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bWidth), towerMat)
      bMesh.position.y = bHeight / 2
      bGroup.add(bMesh)

      // Glowing Window Matrix Panels on Tower Front Facade
      const windowRows = Math.floor(bHeight / 4)
      const windowCols = 4
      const frontFacingX = x < 0 ? (bWidth / 2) + 0.05 : (-bWidth / 2) - 0.05

      for (let r = 1; r < windowRows; r++) {
        // Skip some floors randomly for realistic skyscraper variety
        if ((r + i) % 5 === 0) continue

        const winColor = windowPalettes[(r + i) % windowPalettes.length]
        const winMat = new THREE.MeshBasicMaterial({ color: winColor })

        const winMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 1.6, bWidth * 0.7),
          winMat
        )
        winMesh.position.set(frontFacingX, r * 4, 0)
        bGroup.add(winMesh)
      }

      // Vertical Fiber-Optic Pulse Strip on Tower Edge
      const stripColor = windowPalettes[i % windowPalettes.length]
      const stripMat = new THREE.MeshBasicMaterial({ color: stripColor })
      const stripMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, bHeight * 0.9, 0.25),
        stripMat
      )
      stripMesh.position.set(
        frontFacingX,
        bHeight * 0.45,
        bWidth * 0.4
      )
      bGroup.add(stripMesh)

      // Rooftop Hazard Beacon (Red or Cyan)
      const beaconMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xef4444 : 0x00f0ff
      })
      const beaconMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), beaconMat)
      beaconMesh.position.set(0, bHeight + 0.4, 0)
      bGroup.add(beaconMesh)

      bGroup.position.set(x, 0, z)
      this.scene.add(bGroup)
      this.serverBuildings.push(bGroup)
    }
  }

  spawnInitialTraffic() {
    this.trafficVehicles.forEach(t => this.scene.remove(t.mesh))
    this.trafficVehicles = []

    // Distinct, vibrant vehicle color palettes
    const vehicleStyles = [
      { color: 0xd90429, name: 'Crimson Data Interceptor', isTruck: false }, // Crimson
      { color: 0xf59e0b, name: 'Amber Server Hauler', isTruck: true },        // Amber
      { color: 0x06b6d4, name: 'Teal Packet Courier', isTruck: false },        // Teal
      { color: 0xf8fafc, name: 'Arctic Express Pod', isTruck: false }          // White
    ]

    for (let i = 0; i < 4; i++) {
      const lane = i % 4
      const style = vehicleStyles[i % vehicleStyles.length]
      const tGroup = new THREE.Group()

      const bodyMat = new THREE.MeshStandardMaterial({
        color: style.color,
        roughness: 0.25,
        metalness: 0.8
      })
      const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 })

      if (style.isTruck) {
        // Data Truck Mesh
        const truckBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 5.8), bodyMat)
        truckBody.position.y = 1.15
        tGroup.add(truckBody)

        const cabMesh = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.8, 1.8), bodyMat)
        cabMesh.position.set(0, 1.0, -2.8)
        tGroup.add(cabMesh)
      } else {
        // Sports Sedan Mesh
        const sedanBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.75, 4.0), bodyMat)
        sedanBody.position.y = 0.52
        tGroup.add(sedanBody)

        const sedanCabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 2.0), glassMat)
        sedanCabin.position.set(0, 1.05, 0.1)
        tGroup.add(sedanCabin)
      }

      // Traffic Headlights (White, front faces -Z)
      const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.1), headlightMat)
      hlLeft.position.set(-0.7, 0.6, -2.05)
      tGroup.add(hlLeft)

      const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.1), headlightMat)
      hlRight.position.set(0.7, 0.6, -2.05)
      tGroup.add(hlRight)

      // Traffic Taillights (Red, rear faces +Z)
      const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 })
      const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.1), taillightMat)
      tlLeft.position.set(-0.7, 0.6, 2.05)
      tGroup.add(tlLeft)

      const tlRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.1), taillightMat)
      tlRight.position.set(0.7, 0.6, 2.05)
      tGroup.add(tlRight)

      const spawnZ = this.vehicle.z - 45 - i * 40
      tGroup.position.set(this.laneX[lane], 0, spawnZ)
      this.scene.add(tGroup)

      this.trafficVehicles.push({
        mesh: tGroup,
        lane,
        speedKmh: 65 + (i * 8),
        isTruck: style.isTruck,
        width: style.isTruck ? 2.4 : 2.0,
        length: style.isTruck ? 6.0 : 4.0
      })
    }
  }

  spawnCollectibles() {
    this.collectibles.forEach(c => this.scene.remove(c.mesh))
    this.collectibles = []

    const crystalPalettes = [
      { color: 0x00f0ff, emissive: 0x0284c7 }, // Electric Cyan
      { color: 0x10b981, emissive: 0x047857 }, // Emerald Green
      { color: 0xf59e0b, emissive: 0xb45309 }, // Golden Amber
      { color: 0xa855f7, emissive: 0x7e22ce }  // Tech Violet
    ]

    for (let i = 0; i < 6; i++) {
      const lane = (i * 2 + 1) % 4
      const p = crystalPalettes[i % crystalPalettes.length]
      const cGroup = new THREE.Group()

      // Multi-Faceted Crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.75)
      const crystalMat = new THREE.MeshStandardMaterial({
        color: p.color,
        emissive: p.emissive,
        emissiveIntensity: 1.1,
        roughness: 0.1,
        metalness: 0.95
      })
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat)
      cGroup.add(crystalMesh)

      // Orbiting Glowing Ring
      const ringGeo = new THREE.TorusGeometry(1.05, 0.04, 8, 24)
      ringGeo.rotateX(Math.PI / 2)
      const ringMat = new THREE.MeshBasicMaterial({ color: p.color })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      cGroup.add(ringMesh)

      const spawnZ = this.vehicle.z - 25 - i * 35
      cGroup.position.set(this.laneX[lane], 1.25, spawnZ)
      this.scene.add(cGroup)

      this.collectibles.push({
        mesh: cGroup,
        crystal: crystalMesh,
        ring: ringMesh,
        active: true,
        rotSpeed: 0.045 + (i * 0.01)
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

    // Glowing Neon Gantry Border Strip
    const gantryNeon = new THREE.Mesh(
      new THREE.BoxGeometry(this.roadWidth + 3.8, 0.15, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    )
    gantryNeon.position.set(0, 7.65, 0.6)
    gantryGroup.add(gantryNeon)

    // 4 Lane Digital Signboards (facing +Z towards oncoming driver)
    const signMat = new THREE.MeshBasicMaterial({ color: 0x0b0f19 })
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })

    for (let l = 0; l < 4; l++) {
      const signGroup = new THREE.Group()

      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.5), signMat)
      signMesh.position.set(0, 0, 0.02)
      signGroup.add(signMesh)

      const borderMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 1.65), borderMat)
      borderMesh.position.set(0, 0, 0)
      signGroup.add(borderMesh)

      // Procedural Canvas Texture for Option Text
      const textCanvas = document.createElement('canvas')
      textCanvas.width = 256
      textCanvas.height = 128
      const tCtx = textCanvas.getContext('2d')
      tCtx.fillStyle = '#0b0f19'
      tCtx.fillRect(0, 0, 256, 128)

      tCtx.strokeStyle = '#38bdf8'
      tCtx.lineWidth = 6
      tCtx.strokeRect(4, 4, 248, 120)

      tCtx.fillStyle = '#94a3b8'
      tCtx.font = 'bold 22px sans-serif'
      tCtx.textAlign = 'center'
      tCtx.fillText(`GATE ${String.fromCharCode(65 + l)}`, 128, 38)

      tCtx.fillStyle = '#ffffff'
      tCtx.font = 'bold 36px monospace'
      const optVal = options[l] !== undefined ? String(options[l]) : '—'
      tCtx.fillText(optVal, 128, 88)

      const textTex = new THREE.CanvasTexture(textCanvas)
      const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.7, 1.4),
        new THREE.MeshBasicMaterial({ map: textTex, transparent: true })
      )
      textPlane.position.set(0, 0, 0.04)
      signGroup.add(textPlane)

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
      this.vehicle.speedKmh = Math.max(
        0,
        this.vehicle.speedKmh - 12 * delta
      )
    }

    // Convert km/h to units per second (1 unit ~= 1 meter)
    const speedUnitsPerSec = (this.vehicle.speedKmh * 1000) / 3600
    this.vehicle.vz = speedUnitsPerSec

    // 2. Lateral Steering
    // Left: steers left to lower lane index / negative X
    // Right: steers right to higher lane index / positive X
    if (this.inputs.left) {
      this.vehicle.vx = -this.vehicle.handling
      this.vehicle.steerAngle = Math.min(0.25, this.vehicle.steerAngle + 2.2 * delta)
    } else if (this.inputs.right) {
      this.vehicle.vx = this.vehicle.handling
      this.vehicle.steerAngle = Math.max(-0.25, this.vehicle.steerAngle - 2.2 * delta)
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

    // Update 3D car position, yaw turning, roll banking & wheel spin
    if (this.vehicle.mesh) {
      this.vehicle.mesh.position.set(this.vehicle.x, 0, this.vehicle.z)
      this.vehicle.mesh.rotation.y = this.vehicle.steerAngle * 0.6
      this.vehicle.mesh.rotation.z = this.vehicle.steerAngle * 0.4

      // Spin wheels cleanly around axle
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

    // 3. Update Camera Tracking
    if (this.camera) {
      if (this.cameraMode === 'CHASE') {
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

    // 4. Update Infinite Looping Road Segments
    this.roadSegments.forEach(seg => {
      if (seg.position.z - this.roadSegmentLength > this.vehicle.z) {
        seg.position.z -= this.roadSegmentLength * 2
      }
    })

    // 5. Update Buildings (Infinite scrolling ahead)
    this.serverBuildings.forEach(b => {
      if (b.position.z - 50 > this.vehicle.z) {
        b.position.z -= 200
      }
    })

    // 6. Update Starfield Position to follow player
    if (this.starfield) {
      this.starfield.position.z = this.vehicle.z
    }

    // 7. Update AI Traffic
    this.trafficVehicles.forEach(t => {
      const trafficSpeedUnits = (t.speedKmh * 1000) / 3600
      t.mesh.position.z -= trafficSpeedUnits * delta

      // If traffic fell behind, respawn ahead
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
          this.vehicle.speedKmh = Math.max(20, this.vehicle.speedKmh - 45)
          this.vehicle.recoveryTimer = 1.4
          if (this.onCollision) {
            this.onCollision({ speed: this.vehicle.speedKmh })
          }
        }
      }
    })

    // 8. Update Multi-Spectrum Collectibles
    this.collectibles.forEach(c => {
      if (c.active) {
        c.crystal.rotation.y += c.rotSpeed
        c.crystal.rotation.x += c.rotSpeed * 0.5
        c.ring.rotation.z += c.rotSpeed * 1.2
        c.mesh.position.y = 1.25 + Math.sin(this.vehicle.z * 0.1 + c.mesh.position.x) * 0.25

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

    // 9. Checkpoint Trigger Check
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

    // 10. Dispatch Telemetry Update to HUD
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
        const delta = Math.min((now - lastTime) / 1000, 0.1)
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
