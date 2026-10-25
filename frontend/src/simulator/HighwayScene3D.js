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
 * HighwayScene3D - Professional 3D Driving Simulator for NETPULSE
 * Course: Probability and Statistics for Computer Science (25CS203)
 * 
 * Features:
 * - Approved "Modern NOC Titanium & Technical Sapphire" high-fidelity interceptor vehicle
 * - Balanced third-person chase camera with smooth follow damping and panoramic forward road view
 * - Realistic 4-lane dark asphalt highway with correct proportions, lane dividers, and crash barriers
 * - Highway streetlights and distant NOC server campus skyline with blinking communication towers
 * - Realistic AI traffic vehicles with proper automotive styling, wheels, and taillights (NO placeholder cubes)
 * - Purposeful Network Telemetry Data Packets (hovering data units, NO giant rings or floating diamonds)
 * - Intelligent highway electronic gantries displaying statistical decision gates
 * - Responsive, grounded vehicle physics with automatic highway cruising speed (85 km/h)
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

    // 4 Distinct Highway Lanes: each 3.6m wide (Total width = 14.4m)
    // Lane 0: -5.4m | Lane 1: -1.8m | Lane 2: +1.8m | Lane 3: +5.4m
    this.laneX = [-5.4, -1.8, 1.8, 5.4]
    this.laneWidth = 3.6
    this.roadWidth = 14.4
    this.roadSegmentLength = 220

    // Vehicle physics state
    this.vehicle = {
      x: -1.8, // Start centered in Lane 1
      z: 0.0,
      vx: 0.0,
      vz: 0.0,
      speedKmh: 85, // Default active highway cruising velocity
      targetSpeedKmh: 85,
      maxSpeedKmh: 175,
      minSpeedKmh: 30,
      acceleration: 52,
      braking: 80,
      handling: 16.5,
      width: 1.95,
      length: 4.3,
      mesh: null,
      wheels: [],
      recoveryTimer: 0.0,
      steerAngle: 0.0,
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

    // Mission & checkpoint state
    this.distanceToNextCheckpoint = 400
    this.checkpointTargetZ = -400
    this.checkpointOptions = ['1.2', '2.4', '3.2', '0.8']
    this.checkpointActive = true
    this.cameraMode = 'CHASE' // 'CHASE' | 'HOOD' | 'ORBIT'
    this.score = 0
    this.packetsCollected = 0

    // Scene collections
    this.roadSegments = []
    this.streetlights = []
    this.skylineBuildings = []
    this.trafficVehicles = []
    this.telemetryPackets = []
    this.checkpointGantry = null

    this.init()
  }

  init() {
    const width = this.container.clientWidth || 800
    const height = this.container.clientHeight || 500

    // 1. Scene & Clean Atmospheric Fog
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x111827)
    this.scene.fog = new THREE.FogExp2(0x111827, 0.005)

    // 2. Camera Setup (55 deg FOV for realistic driving perspective)
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 380)
    this.camera.position.set(this.vehicle.x * 0.85, 2.45, this.vehicle.z + 6.4)
    this.camera.lookAt(this.vehicle.x * 0.4, 0.95, this.vehicle.z - 18)

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.container.appendChild(this.renderer.domElement)

    // 4. Professional Lighting
    // Ambient light (soft neutral visibility)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55)
    this.scene.add(ambientLight)

    // Hemisphere light: cool navy sky dome + dark road bounce
    const hemiLight = new THREE.HemisphereLight(0x4f7cff, 0x111827, 0.5)
    hemiLight.position.set(0, 50, 0)
    this.scene.add(hemiLight)

    // Directional illumination
    const dirLight = new THREE.DirectionalLight(0xdbeafe, 0.8)
    dirLight.position.set(25, 45, -30)
    this.scene.add(dirLight)

    // 5. Construct Environment & World
    this.buildSkyBackground()
    this.buildHighway()
    this.buildPlayerCar()
    this.buildCampusSkyline()
    this.spawnInitialTraffic()
    this.spawnTelemetryPackets()

    // 6. Window resize handler
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

    // 7. Initial render pass
    this.renderer.render(this.scene, this.camera)
  }

  buildSkyBackground() {
    // Subtle starfield in upper celestial hemisphere
    const starCount = 350
    const starGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 360
      positions[i * 3 + 1] = 20 + Math.random() * 80
      positions[i * 3 + 2] = -220 + Math.random() * 400
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 1.1,
      transparent: true,
      opacity: 0.75
    })

    this.starfield = new THREE.Points(starGeo, starMat)
    this.scene.add(this.starfield)
  }

  buildHighway() {
    // 2 looping road segments for seamless scrolling
    for (let s = 0; s < 2; s++) {
      const segGroup = new THREE.Group()

      // 1. Asphalt Highway Surface
      const asphaltGeo = new THREE.PlaneGeometry(this.roadWidth, this.roadSegmentLength)
      const asphaltMat = new THREE.MeshStandardMaterial({
        color: 0x181f2b, // Dark charcoal highway
        roughness: 0.85,
        metalness: 0.15
      })
      const asphaltMesh = new THREE.Mesh(asphaltGeo, asphaltMat)
      asphaltMesh.rotation.x = -Math.PI / 2
      asphaltMesh.position.y = 0.0
      segGroup.add(asphaltMesh)

      // 2. Concrete Highway Shoulders
      const shoulderGeo = new THREE.BoxGeometry(1.6, 0.15, this.roadSegmentLength)
      const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x141b26, roughness: 0.9 })

      const leftShoulder = new THREE.Mesh(shoulderGeo, shoulderMat)
      leftShoulder.position.set(-this.roadWidth / 2 - 0.8, 0.075, 0)
      segGroup.add(leftShoulder)

      const rightShoulder = new THREE.Mesh(shoulderGeo, shoulderMat)
      rightShoulder.position.set(this.roadWidth / 2 + 0.8, 0.075, 0)
      segGroup.add(rightShoulder)

      // 3. Realistic Steel Crash Barriers
      const barrierGeo = new THREE.BoxGeometry(0.35, 0.65, this.roadSegmentLength)
      const barrierMat = new THREE.MeshStandardMaterial({
        color: 0x202938,
        roughness: 0.5,
        metalness: 0.6
      })

      const leftBarrier = new THREE.Mesh(barrierGeo, barrierMat)
      leftBarrier.position.set(-this.roadWidth / 2 - 1.5, 0.325, 0)
      segGroup.add(leftBarrier)

      const rightBarrier = new THREE.Mesh(barrierGeo, barrierMat)
      rightBarrier.position.set(this.roadWidth / 2 + 1.5, 0.325, 0)
      segGroup.add(rightBarrier)

      // 4. Subtle Light Blue Retroreflective Safety Markers on Barrier Tops
      const markerGeo = new THREE.BoxGeometry(0.08, 0.1, 0.25)
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x4f7cff })

      for (let z = -this.roadSegmentLength / 2 + 6; z < this.roadSegmentLength / 2; z += 14) {
        const leftMarker = new THREE.Mesh(markerGeo, markerMat)
        leftMarker.position.set(-this.roadWidth / 2 - 1.45, 0.68, z)
        segGroup.add(leftMarker)

        const rightMarker = new THREE.Mesh(markerGeo, markerMat)
        rightMarker.position.set(this.roadWidth / 2 + 1.45, 0.68, z)
        segGroup.add(rightMarker)
      }

      // 5. Solid White Highway Edge Lines
      const edgeLineGeo = new THREE.PlaneGeometry(0.18, this.roadSegmentLength)
      const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf3f4f6 })

      const leftEdgeLine = new THREE.Mesh(edgeLineGeo, whiteLineMat)
      leftEdgeLine.rotation.x = -Math.PI / 2
      leftEdgeLine.position.set(-this.roadWidth / 2 + 0.15, 0.015, 0)
      segGroup.add(leftEdgeLine)

      const rightEdgeLine = new THREE.Mesh(edgeLineGeo, whiteLineMat)
      rightEdgeLine.rotation.x = -Math.PI / 2
      rightEdgeLine.position.set(this.roadWidth / 2 - 0.15, 0.015, 0)
      segGroup.add(rightEdgeLine)

      // 6. Dashed White Lane Dividers (3 dividers separating 4 lanes)
      const dashGeo = new THREE.PlaneGeometry(0.16, 3.2)
      for (let l = 1; l <= 3; l++) {
        const lx = -this.roadWidth / 2 + this.laneWidth * l
        for (let z = -this.roadSegmentLength / 2; z < this.roadSegmentLength / 2; z += 7.5) {
          const dash = new THREE.Mesh(dashGeo, whiteLineMat)
          dash.rotation.x = -Math.PI / 2
          dash.position.set(lx, 0.015, z)
          segGroup.add(dash)
        }
      }

      // 7. Modern Highway Streetlight Poles
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x2c3d58, metalness: 0.8, roughness: 0.3 })
      const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xf4f7fc })

      for (let z = -this.roadSegmentLength / 2 + 20; z < this.roadSegmentLength / 2; z += 44) {
        // Left Pole
        const poleLeft = new THREE.Group()
        const mastL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 7.5, 12), poleMat)
        mastL.position.y = 3.75
        poleLeft.add(mastL)

        const armL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.1), poleMat)
        armL.position.set(1.2, 7.4, 0)
        poleLeft.add(armL)

        const lampL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.25), lampHeadMat)
        lampL.position.set(2.4, 7.35, 0)
        poleLeft.add(lampL)

        poleLeft.position.set(-this.roadWidth / 2 - 2.6, 0, z)
        segGroup.add(poleLeft)

        // Right Pole
        const poleRight = new THREE.Group()
        const mastR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 7.5, 12), poleMat)
        mastR.position.y = 3.75
        poleRight.add(mastR)

        const armR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.1), poleMat)
        armR.position.set(-1.2, 7.4, 0)
        poleRight.add(armR)

        const lampR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.25), lampHeadMat)
        lampR.position.set(-2.4, 7.35, 0)
        poleRight.add(lampR)

        poleRight.position.set(this.roadWidth / 2 + 2.6, 0, z + 22)
        segGroup.add(poleRight)
      }

      segGroup.position.z = -s * this.roadSegmentLength
      this.scene.add(segGroup)
      this.roadSegments.push(segGroup)
    }
  }

  /**
   * Build Player Car: Modern NOC Titanium & Technical Sapphire Interceptor
   */
  buildPlayerCar() {
    const car = new THREE.Group()

    // 1. Core Materials
    // Elevated Navy Hull (#1B2B46)
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.32,
      metalness: 0.75
    })

    // Primary Light Blue Accent (#8CC8FF)
    const sapphireMat = new THREE.MeshStandardMaterial({
      color: 0x4f7cff,
      emissive: 0x3b66df,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.8
    })

    // Dark Divider Trim (#14233D)
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x181f2b,
      roughness: 0.5,
      metalness: 0.5
    })

    // Tinted Greenhouse Canopy Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.08,
      metalness: 0.95
    })

    // Front Integrated LED Headlights
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xf3f4f6 })

    // Full-Width Red LED Taillight Bar
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xd95c5c })

    // 2. Sculpted Chassis Panels
    // Lower Chassis Floor & Carbon Side Skirts (y: 0.16 to 0.42)
    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.24, 4.3), carbonMat)
    lowerChassis.position.y = 0.28
    car.add(lowerChassis)

    // Aerodynamic Front Splitter (Front points along -Z)
    const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.5), carbonMat)
    frontSplitter.position.set(0, 0.16, -2.15)
    car.add(frontSplitter)

    // Rear Carbon Diffuser with Strakes
    const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.12, 0.4), carbonMat)
    rearDiffuser.position.set(0, 0.2, 2.15)
    car.add(rearDiffuser)

    // Main Metallic Graphite Body Hull (y: 0.40 to 0.78)
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.38, 3.8), titaniumMat)
    mainBody.position.set(0, 0.55, -0.05)
    car.add(mainBody)

    // Sculpted Hood Slope
    const hoodSlope = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.24, 1.2), titaniumMat)
    hoodSlope.position.set(0, 0.56, -1.35)
    hoodSlope.rotation.x = Math.PI / 16
    car.add(hoodSlope)

    // Sculpted Rear Deck
    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.9), titaniumMat)
    rearDeck.position.set(0, 0.58, 1.35)
    car.add(rearDeck)

    // 3. Technical Sapphire Racing Accents
    // Twin Racing Stripes along the center hood
    const stripeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 2.2), sapphireMat)
    stripeLeft.position.set(-0.25, 0.74, -0.85)
    car.add(stripeLeft)

    const stripeRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 2.2), sapphireMat)
    stripeRight.position.set(0.25, 0.74, -0.85)
    car.add(stripeRight)

    // Side Aero Blades in Sapphire Blue
    const leftAeroBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 2.6), sapphireMat)
    leftAeroBlade.position.set(-0.96, 0.32, 0)
    car.add(leftAeroBlade)

    const rightAeroBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 2.6), sapphireMat)
    rightAeroBlade.position.set(0.96, 0.32, 0)
    car.add(rightAeroBlade)

    // Integrated Low-Profile Rear Spoiler Wing
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.06, 0.35), titaniumMat)
    spoilerWing.position.set(0, 0.95, 1.95)
    car.add(spoilerWing)

    // Sapphire Spoiler Accent Lip
    const spoilerLip = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.03, 0.08), sapphireMat)
    spoilerLip.position.set(0, 0.98, 2.1)
    car.add(spoilerLip)

    // Spoiler Struts
    const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.12), carbonMat)
    strutL.position.set(-0.6, 0.82, 1.95)
    car.add(strutL)

    const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.12), carbonMat)
    strutR.position.set(0.6, 0.82, 1.95)
    car.add(strutR)

    // 4. Aerodynamic Fastback Greenhouse / Cockpit Canopy
    const greenhouse = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.4, 1.7), glassMat)
    greenhouse.position.set(0, 0.92, 0.1)
    car.add(greenhouse)

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.38, 0.75), glassMat)
    windshield.position.set(0, 0.85, -0.72)
    windshield.rotation.x = Math.PI / 5.5
    car.add(windshield)

    const rearHatch = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.35, 0.75), glassMat)
    rearHatch.position.set(0, 0.84, 0.92)
    rearHatch.rotation.x = -Math.PI / 6.5
    car.add(rearHatch)

    // 5. Lighting Integration
    // Dual Front LED Headlights
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.08), ledMat)
    hlLeft.position.set(-0.68, 0.52, -2.12)
    car.add(hlLeft)

    const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.08), ledMat)
    hlRight.position.set(0.68, 0.52, -2.12)
    car.add(hlRight)

    // Full-Width Rear Red LED Lightbar
    const taillightBar = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.09, 0.08), taillightMat)
    taillightBar.position.set(0, 0.64, 2.12)
    car.add(taillightBar)

    // Subtle Light Blue Underglow
    const underglow = new THREE.PointLight(0x8cc8ff, 1.4, 4.0, 1.2)
    underglow.position.set(0, 0.18, 0)
    car.add(underglow)

    // 6. 4 High-Grip Alloy Wheels & Rubber Tires
    // Wheel Radius: 0.34m (Center height = 0.34m -> Touches asphalt at y = 0.0)
    const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.28, 24)
    tireGeo.rotateZ(Math.PI / 2)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x090e17, roughness: 0.9 })

    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.29, 20)
    rimGeo.rotateZ(Math.PI / 2)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x2c3d58, roughness: 0.25, metalness: 0.85 })

    const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.31, 16)
    hubGeo.rotateZ(Math.PI / 2)
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x8cc8ff, roughness: 0.2, metalness: 0.8 })

    const wheelPositions = [
      [-0.98, 0.34, -1.35], // Front-Left
      [0.98, 0.34, -1.35],  // Front-Right
      [-0.98, 0.34, 1.35],  // Rear-Left
      [0.98, 0.34, 1.35]    // Rear-Right
    ]

    this.vehicle.wheels = []
    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group()

      const tire = new THREE.Mesh(tireGeo, tireMat)
      wheelGroup.add(tire)

      const rim = new THREE.Mesh(rimGeo, rimMat)
      wheelGroup.add(rim)

      const hub = new THREE.Mesh(hubGeo, hubMat)
      wheelGroup.add(hub)

      wheelGroup.position.set(...pos)
      car.add(wheelGroup)
      this.vehicle.wheels.push(wheelGroup)
    })

    // Ground vehicle so wheels contact y = 0.0
    car.position.set(this.vehicle.x, 0.0, this.vehicle.z)
    this.scene.add(car)
    this.vehicle.mesh = car
  }

  /**
   * Distant NOC Server Facility & Telecommunication Infrastructure Skyline
   */
  buildCampusSkyline() {
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x181f2b,
      roughness: 0.45,
      metalness: 0.6
    })

    const winWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf4f7fc })
    const winBlueMat = new THREE.MeshBasicMaterial({ color: 0x8cc8ff })
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf87171 })

    for (let i = 0; i < 20; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const x = (this.roadWidth / 2 + 16 + (i * 4) % 20) * side
      const z = -(i * 20) + 30
      const bHeight = 28 + (i * 7) % 40
      const bWidth = 14 + (i * 3) % 10

      const bGroup = new THREE.Group()

      // Facility Core Block
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bWidth), buildingMat)
      bMesh.position.y = bHeight / 2
      bGroup.add(bMesh)

      // Clean, Ordered Server Room Windows (Facing Highway)
      const frontX = side > 0 ? -bWidth / 2 - 0.05 : bWidth / 2 + 0.05
      const floors = Math.floor(bHeight / 5)

      for (let f = 1; f < floors; f++) {
        if ((f + i) % 4 === 0) continue
        const winMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 1.4, bWidth * 0.7),
          (f + i) % 2 === 0 ? winWhiteMat : winBlueMat
        )
        winMesh.position.set(frontX, f * 5, 0)
        bGroup.add(winMesh)
      }

      // Communication Tower Mast on Selected Roofs
      if (i % 3 === 0) {
        const mastGeo = new THREE.CylinderGeometry(0.08, 0.2, 8, 8)
        const mastMesh = new THREE.Mesh(mastGeo, buildingMat)
        mastMesh.position.set(0, bHeight + 4, 0)
        bGroup.add(mastMesh)

        // Blinking Red Aviation Safety Beacon
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), beaconMat)
        beacon.position.set(0, bHeight + 8.1, 0)
        bGroup.add(beacon)
      }

      bGroup.position.set(x, 0, z)
      this.scene.add(bGroup)
      this.skylineBuildings.push(bGroup)
    }
  }

  /**
   * Spawn Realistic AI Traffic Vehicles (NO giant brown placeholder cubes!)
   */
  spawnInitialTraffic() {
    this.trafficVehicles.forEach(t => this.scene.remove(t.mesh))
    this.trafficVehicles = []

    // Realistic vehicle specifications
    const trafficConfigs = [
      { type: 'sedan', color: 0x14233d, length: 4.2, width: 1.85, height: 1.35, speed: 72 }, // Dark Navy Sedan
      { type: 'coupe', color: 0x1b2b46, length: 3.9, width: 1.82, height: 1.25, speed: 78 }, // Elevated Navy Coupe
      { type: 'van',   color: 0x2c3d58, length: 4.8, width: 2.0,  height: 1.75, speed: 68 }, // Slate Service Van
      { type: 'sedan', color: 0x233554, length: 4.2, width: 1.85, height: 1.35, speed: 74 }  // Steel Sedan
    ]

    trafficConfigs.forEach((cfg, idx) => {
      const lane = idx % 4
      const tMesh = this.createTrafficVehicleMesh(cfg)

      // Spawn well ahead of the player (65m to 170m)
      const spawnZ = this.vehicle.z - 65 - idx * 35
      tMesh.position.set(this.laneX[lane], 0, spawnZ)
      this.scene.add(tMesh)

      this.trafficVehicles.push({
        mesh: tMesh,
        lane,
        speedKmh: cfg.speed,
        width: cfg.width,
        length: cfg.length
      })
    })
  }

  createTrafficVehicleMesh(cfg) {
    const group = new THREE.Group()

    const bodyMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      roughness: 0.35,
      metalness: 0.7
    })
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x090e17, roughness: 0.1, metalness: 0.9 })
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.9 })
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
    const redTailMat = new THREE.MeshBasicMaterial({ color: 0xff1744 })
    const whiteHeadMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 })

    if (cfg.type === 'van') {
      // Commercial Van Body
      const lower = new THREE.Mesh(new THREE.BoxGeometry(cfg.width, 0.45, cfg.length), bodyMat)
      lower.position.y = 0.4
      group.add(lower)

      const upper = new THREE.Mesh(new THREE.BoxGeometry(cfg.width * 0.95, 1.05, cfg.length * 0.92), bodyMat)
      upper.position.set(0, 1.05, 0.1)
      group.add(upper)

      // Windshield & Front Cab Slope
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(cfg.width * 0.9, 0.6, 0.5), glassMat)
      windshield.position.set(0, 1.05, -cfg.length / 2 + 0.45)
      windshield.rotation.x = Math.PI / 7
      group.add(windshield)
    } else {
      // Passenger Sedan / Coupe Body
      const lower = new THREE.Mesh(new THREE.BoxGeometry(cfg.width, 0.38, cfg.length), bodyMat)
      lower.position.y = 0.36
      group.add(lower)

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(cfg.width * 0.82, 0.48, cfg.length * 0.52), glassMat)
      cabin.position.set(0, 0.78, 0.1)
      group.add(cabin)

      const roof = new THREE.Mesh(new THREE.BoxGeometry(cfg.width * 0.78, 0.08, cfg.length * 0.45), bodyMat)
      roof.position.set(0, 1.04, 0.1)
      group.add(roof)
    }

    // Rear Taillights (Facing +Z toward player)
    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), redTailMat)
    tlL.position.set(-cfg.width / 2 + 0.25, 0.55, cfg.length / 2 + 0.02)
    group.add(tlL)

    const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), redTailMat)
    tlR.position.set(cfg.width / 2 - 0.25, 0.55, cfg.length / 2 + 0.02)
    group.add(tlR)

    // Front Headlights (Facing -Z)
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), whiteHeadMat)
    hlL.position.set(-cfg.width / 2 + 0.25, 0.48, -cfg.length / 2 - 0.02)
    group.add(hlL)

    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), whiteHeadMat)
    hlR.position.set(cfg.width / 2 - 0.25, 0.48, -cfg.length / 2 - 0.02)
    group.add(hlR)

    // 4 Wheels
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 16)
    tireGeo.rotateZ(Math.PI / 2)
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.25, 12)
    rimGeo.rotateZ(Math.PI / 2)

    const wheelZ = cfg.length * 0.32
    const wheelX = cfg.width / 2
    const wheels = [
      [-wheelX, 0.32, -wheelZ],
      [wheelX, 0.32, -wheelZ],
      [-wheelX, 0.32, wheelZ],
      [wheelX, 0.32, wheelZ]
    ]

    wheels.forEach(pos => {
      const wGroup = new THREE.Group()
      wGroup.add(new THREE.Mesh(tireGeo, tireMat))
      wGroup.add(new THREE.Mesh(rimGeo, rimMat))
      wGroup.position.set(...pos)
      group.add(wGroup)
    })

    return group
  }

  /**
   * Spawn Network Telemetry Data Packets (Refined, compact data units; NO giant orange rings!)
   */
  spawnTelemetryPackets() {
    this.telemetryPackets.forEach(p => this.scene.remove(p.mesh))
    this.telemetryPackets = []

    const sensorPadMat = new THREE.MeshStandardMaterial({
      color: 0x202938,
      roughness: 0.8
    })

    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x4f7cff
    })

    for (let i = 0; i < 5; i++) {
      const lane = (i * 2 + 1) % 4
      const pGroup = new THREE.Group()

      // Flush pavement sensor pad (0.5m x 0.02m x 0.5m) flush on road
      const padMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.5), sensorPadMat)
      pGroup.add(padMesh)

      // Center optical data node
      const beaconMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.18), beaconMat)
      beaconMesh.position.y = 0.01
      pGroup.add(beaconMesh)

      const spawnZ = this.vehicle.z - 30 - i * 40
      pGroup.position.set(this.laneX[lane], 0.015, spawnZ)
      this.scene.add(pGroup)

      this.telemetryPackets.push({
        mesh: pGroup,
        module: padMesh,
        beacon: beaconMesh,
        active: true
      })
    }
  }

  /**
   * Overhead Electronic Highway Truss Gantry for Checkpoint Decision Gates
   */
  setupCheckpointGantry(options = ['1.2', '2.4', '3.2', '0.8'], distanceMeters = 400) {
    this.checkpointOptions = Array.isArray(options) && options.length > 0 ? options : ['1.2', '2.4', '3.2', '0.8']
    this.distanceToNextCheckpoint = distanceMeters
    this.checkpointTargetZ = this.vehicle.z - distanceMeters
    this.checkpointActive = true

    if (this.checkpointGantry) {
      this.scene.remove(this.checkpointGantry)
      this.checkpointGantry = null
    }

    const gantry = new THREE.Group()

    // Structural Steel Lattice Truss (Realistic Intelligent Highway Gantry)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x202938, roughness: 0.5, metalness: 0.7 })

    // Left Column
    const colL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 6.2, 0.7), steelMat)
    colL.position.set(-this.roadWidth / 2 - 1.2, 3.1, 0)
    gantry.add(colL)

    // Right Column
    const colR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 6.2, 0.7), steelMat)
    colR.position.set(this.roadWidth / 2 + 1.2, 3.1, 0)
    gantry.add(colR)

    // Main Overhead Crossbeam
    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 3.2, 0.9, 0.8), steelMat)
    crossbeam.position.set(0, 5.8, 0)
    gantry.add(crossbeam)

    // 4 Digital LED Matrix Overhead Signboards (Facing +Z toward oncoming driver)
    const signMat = new THREE.MeshBasicMaterial({ color: 0x0b111e })
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })

    for (let l = 0; l < 4; l++) {
      const signGroup = new THREE.Group()

      // Sign Housing Frame
      const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.45, 0.15), frameMat)
      signGroup.add(frameMesh)

      // Sign Display Face
      const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 1.3), signMat)
      faceMesh.position.set(0, 0, 0.08)
      signGroup.add(faceMesh)

      // High-Contrast Canvas Texture for Gate Option
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 128
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, 256, 128)

      // Restrained Blue Inner Border
      ctx.strokeStyle = '#4f7cff'
      ctx.lineWidth = 3
      ctx.strokeRect(4, 4, 248, 120)

      // Gate Label
      ctx.fillStyle = '#9ca8b8'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`GATE ${String.fromCharCode(65 + l)}`, 128, 36)

      // Statistical Value
      ctx.fillStyle = '#f3f4f6'
      ctx.font = 'bold 36px monospace'
      const optText = this.checkpointOptions[l] !== undefined ? String(this.checkpointOptions[l]) : '—'
      ctx.fillText(optText, 128, 88)

      const texture = new THREE.CanvasTexture(canvas)
      const textMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.15),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
      )
      textMesh.position.set(0, 0, 0.09)
      signGroup.add(textMesh)

      signGroup.position.set(this.laneX[l], 5.8, 0)
      gantry.add(signGroup)
    }

    gantry.position.set(0, 0, this.checkpointTargetZ)
    this.scene.add(gantry)
    this.checkpointGantry = gantry
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
    // 1. Throttle / Braking / Cruising
    if (this.inputs.forward) {
      this.vehicle.speedKmh = Math.min(
        this.vehicle.maxSpeedKmh,
        this.vehicle.speedKmh + this.vehicle.acceleration * delta
      )
    } else if (this.inputs.backward) {
      this.vehicle.speedKmh = Math.max(
        this.vehicle.minSpeedKmh,
        this.vehicle.speedKmh - this.vehicle.braking * delta
      )
    } else if (this.inputs.handbrake) {
      this.vehicle.speedKmh = Math.max(
        20,
        this.vehicle.speedKmh - this.vehicle.braking * 2.0 * delta
      )
    } else {
      // Natural highway cruising: gently converges to targetSpeedKmh (85 km/h)
      if (this.vehicle.speedKmh < this.vehicle.targetSpeedKmh) {
        this.vehicle.speedKmh = Math.min(
          this.vehicle.targetSpeedKmh,
          this.vehicle.speedKmh + this.vehicle.acceleration * 0.6 * delta
        )
      } else if (this.vehicle.speedKmh > this.vehicle.targetSpeedKmh) {
        this.vehicle.speedKmh = Math.max(
          this.vehicle.targetSpeedKmh,
          this.vehicle.speedKmh - 16 * delta
        )
      }
    }

    // Convert km/h to units/sec (1 unit = 1 meter)
    const speedUnitsPerSec = (this.vehicle.speedKmh * 1000) / 3600
    this.vehicle.vz = speedUnitsPerSec

    // 2. Lateral Steering
    if (this.inputs.left) {
      this.vehicle.vx = -this.vehicle.handling
      this.vehicle.steerAngle = Math.min(0.22, this.vehicle.steerAngle + 2.5 * delta)
    } else if (this.inputs.right) {
      this.vehicle.vx = this.vehicle.handling
      this.vehicle.steerAngle = Math.max(-0.22, this.vehicle.steerAngle - 2.5 * delta)
    } else {
      this.vehicle.vx *= 0.82
      this.vehicle.steerAngle *= 0.8
    }

    // Apply movement
    this.vehicle.z -= this.vehicle.vz * delta
    this.vehicle.x += this.vehicle.vx * delta

    // Road boundary clamp (keep vehicle within highway barriers)
    const maxRoadX = (this.roadWidth / 2) - 1.2
    if (this.vehicle.x < -maxRoadX) {
      this.vehicle.x = -maxRoadX
      this.vehicle.vx = 0
    }
    if (this.vehicle.x > maxRoadX) {
      this.vehicle.x = maxRoadX
      this.vehicle.vx = 0
    }

    // Determine current lane
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

    // 3. Update Vehicle Mesh, Roll Banking & Wheel Rotation
    if (this.vehicle.mesh) {
      this.vehicle.mesh.position.set(this.vehicle.x, 0.0, this.vehicle.z)
      this.vehicle.mesh.rotation.y = this.vehicle.steerAngle * 0.55
      this.vehicle.mesh.rotation.z = this.vehicle.steerAngle * 0.35

      const wheelSpin = this.vehicle.vz * delta * 2.8
      this.vehicle.wheels.forEach(w => {
        w.rotation.x -= wheelSpin
      })

      // Collision flash feedback
      if (this.vehicle.recoveryTimer > 0) {
        this.vehicle.recoveryTimer -= delta
        this.vehicle.mesh.visible = Math.floor(this.vehicle.recoveryTimer * 12) % 2 === 0
      } else {
        this.vehicle.mesh.visible = true
      }
    }

    // 4. Third-Person Follow Camera Update
    if (this.camera) {
      if (this.cameraMode === 'CHASE') {
        const targetCamX = this.vehicle.x * 0.85
        const targetCamY = 2.45 + (this.vehicle.speedKmh / 180) * 0.35
        const targetCamZ = this.vehicle.z + 6.4

        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.14
        this.camera.position.y += (targetCamY - this.camera.position.y) * 0.15
        this.camera.position.z = targetCamZ

        this.camera.lookAt(this.vehicle.x * 0.4, 0.95, this.vehicle.z - 18)
      } else if (this.cameraMode === 'HOOD') {
        this.camera.position.set(this.vehicle.x, 1.25, this.vehicle.z - 0.8)
        this.camera.lookAt(this.vehicle.x, 1.1, this.vehicle.z - 28)
      } else if (this.cameraMode === 'ORBIT') {
        this.camera.position.set(this.vehicle.x + 6.5, 3.8, this.vehicle.z + 5.5)
        this.camera.lookAt(this.vehicle.x, 0.9, this.vehicle.z - 6)
      }
    }

    // 5. Infinite Highway Scrolling
    this.roadSegments.forEach(seg => {
      if (seg.position.z - this.roadSegmentLength > this.vehicle.z) {
        seg.position.z -= this.roadSegmentLength * 2
      }
    })

    // 6. Infinite Skyline Scrolling
    this.skylineBuildings.forEach(b => {
      if (b.position.z - 40 > this.vehicle.z) {
        b.position.z -= 200
      }
    })

    // 7. Update Starfield Position to follow player
    if (this.starfield) {
      this.starfield.position.z = this.vehicle.z
    }

    // 8. Update AI Traffic
    this.trafficVehicles.forEach(t => {
      const trafficSpeedUnits = (t.speedKmh * 1000) / 3600
      t.mesh.position.z -= trafficSpeedUnits * delta

      // If traffic fell behind player, respawn safely ahead
      if (t.mesh.position.z - 25 > this.vehicle.z) {
        t.mesh.position.z = this.vehicle.z - 75 - Math.random() * 55
        t.lane = Math.floor(Math.random() * 4)
        t.mesh.position.x = this.laneX[t.lane]
      }

      // Traffic Collision Check
      if (this.vehicle.recoveryTimer <= 0) {
        const dx = Math.abs(this.vehicle.x - t.mesh.position.x)
        const dz = Math.abs(this.vehicle.z - t.mesh.position.z)
        if (dx < (t.width / 2 + this.vehicle.width / 2 - 0.2) && dz < (t.length / 2 + this.vehicle.length / 2 - 0.2)) {
          this.vehicle.speedKmh = Math.max(30, this.vehicle.speedKmh - 40)
          this.vehicle.recoveryTimer = 1.2
          if (this.onCollision) {
            this.onCollision({ speed: this.vehicle.speedKmh })
          }
        }
      }
    })

    // 9. Update Telemetry Data Packets
    this.telemetryPackets.forEach(p => {
      if (p.active) {
        // Pickup collision
        const dx = Math.abs(this.vehicle.x - p.mesh.position.x)
        const dz = Math.abs(this.vehicle.z - p.mesh.position.z)
        if (dx < 1.3 && dz < 1.8) {
          p.active = false
          p.mesh.visible = false
          this.packetsCollected += 1
          this.score += 50
          if (this.onCollectPacket) {
            this.onCollectPacket({ total: this.packetsCollected, score: this.score })
          }
        }
      }

      // Respawn ahead if passed
      if (p.mesh.position.z - 15 > this.vehicle.z) {
        p.mesh.position.z = this.vehicle.z - 60 - Math.random() * 80
        const lane = Math.floor(Math.random() * 4)
        p.mesh.position.x = this.laneX[lane]
        p.active = true
        p.mesh.visible = true
      }
    })

    // 10. Checkpoint Gantry Detection
    if (this.checkpointActive && this.checkpointGantry) {
      const remainingDist = Math.max(0, this.vehicle.z - this.checkpointTargetZ)
      this.distanceToNextCheckpoint = Math.round(remainingDist)

      if (this.vehicle.z <= this.checkpointTargetZ + 1.2) {
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

    // 11. Dispatch Telemetry Update to HUD
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

    // Dispose scene objects
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
