import { ExtendedObject3D, Scene3D, THREE } from '@enable3d/phaser-extension'
import Tank, { WheelPosition } from '../models/Tank'
import { ExtendedGroup } from 'enable3d'

export default class MainScene extends Scene3D {
  private tank?: Tank;
  private keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
  }
  private vehicleSteering = 0

  constructor() {
    super({ key: 'MainScene' })
  }

  init() {
    console.log('init')
    this.accessThirdDimension()
    this.third.renderer.outputEncoding = THREE.LinearEncoding

    const keyEvent = (e:KeyboardEvent, down:boolean) => {
      switch (e.code) {
        case 'KeyW':
          this.keys.w = down
          break
        case 'KeyA':
          this.keys.a = down
          break
        case 'KeyS':
          this.keys.s = down
          break
        case 'KeyD':
          this.keys.d = down
          break
        case 'Space':
          this.keys.space = down
          break
      }
    }
    document.addEventListener('keydown', e => keyEvent(e, true))
    document.addEventListener('keyup', e => keyEvent(e, false))
  }

  async create() {
    const { lights } = await this.third.warpSpeed()
    if (lights) {
      const intensity = 0.4
      lights.hemisphereLight.intensity = intensity
      lights.ambientLight.intensity = intensity
      lights.directionalLight.intensity = intensity
    }

    const tankGlb = await this.third.load.gltf("/glb/tank.glb");
    const tankModel = tankGlb.scenes[0] as ExtendedGroup

    this.tank = new Tank(this.third, tankModel)

    //use the car camera
    //this.third.camera = this.car.camera

  }


  update() {
    if(!this.tank) return

    let engineForce = 0
    let breakingForce = 0
    const steeringIncrement = 0.04
    const steeringClamp = 0.3
    const maxEngineForce = 5000
    const maxBreakingForce = 100

    // front/back
    if (this.keys.w) engineForce = maxEngineForce
    else if (this.keys.s) engineForce = -maxEngineForce

    // left/right
    if (this.keys.a) {
      if (this.vehicleSteering < steeringClamp) this.vehicleSteering += steeringIncrement
    } else if (this.keys.d) {
      if (this.vehicleSteering > -steeringClamp) this.vehicleSteering -= steeringIncrement
    } else {
      if (this.vehicleSteering > 0) this.vehicleSteering -= steeringIncrement / 2
      if (this.vehicleSteering < 0) this.vehicleSteering += steeringIncrement / 2
      if (Math.abs(this.vehicleSteering) <= steeringIncrement) this.vehicleSteering = 0
    }

    // break
    if (this.keys.space) {
      breakingForce = maxBreakingForce
      this.tank.jump()
    }

    this.tank.vehicle.applyEngineForce(engineForce, WheelPosition.FrontLeft)
    this.tank.vehicle.applyEngineForce(engineForce, WheelPosition.FrontRight)

    this.tank.vehicle.setSteeringValue(this.vehicleSteering, WheelPosition.FrontLeft)
    this.tank.vehicle.setSteeringValue(this.vehicleSteering, WheelPosition.FrontRight)

    this.tank.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontLeft)
    this.tank.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontRight)
    this.tank.vehicle.setBrake(breakingForce, WheelPosition.RearLeft)
    this.tank.vehicle.setBrake(breakingForce, WheelPosition.RearRight)

    this.tank.update()
  }
}
