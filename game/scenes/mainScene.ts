import { ExtendedObject3D, Scene3D, THREE } from '@enable3d/phaser-extension'
import Car, { WheelPosition } from '../models/Car'

export default class MainScene extends Scene3D {
  private car?: Car;
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
    const { lights } = await this.third.warpSpeed("-ground")
    if (lights) {
      const intensity = 0.4
      lights.hemisphereLight.intensity = intensity
      lights.ambientLight.intensity = intensity
      lights.directionalLight.intensity = intensity
    }

    const asphalt = await this.third.load.texture('/img/asphalt.jpg')
    const asphaltGround = asphalt.clone()
    asphaltGround.needsUpdate = true
    asphaltGround.wrapS = asphaltGround.wrapT = 1000 // RepeatWrapping
    asphaltGround.offset.set(0, 0)
    asphaltGround.repeat.set(10, 10)

    this.third.physics.add.ground({ y: -1, width: 100, height: 100 }, { lambert: { map: asphaltGround } })

    const raceTrackGltf = await this.third.load.gltf("/glb/racetrack.glb");
    const scene = raceTrackGltf.scenes[0];

    scene.scale.set(2, 2, 2);
    scene.position.set(0, -6, 0);

    this.third.add.existing(scene);



    const gltf = await this.third.load.gltf("/glb/car.glb");
    const chassis = gltf.scenes[0].getObjectByName("Chassis") as ExtendedObject3D;
    chassis.receiveShadow = chassis.castShadow = true;

    const tire = gltf.scenes[0].getObjectByName("Tire") as ExtendedObject3D;
    tire.receiveShadow = tire.castShadow = true
    tire.geometry.center()

    this.car = new Car(this.third, chassis, tire)

    //use the car camera
    this.third.camera = this.car.camera

  }


  update() {
    if(!this.car) return

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
      this.car.jump()
    }

    this.car.vehicle.applyEngineForce(engineForce, WheelPosition.FrontLeft)
    this.car.vehicle.applyEngineForce(engineForce, WheelPosition.FrontRight)

    this.car.vehicle.setSteeringValue(this.vehicleSteering, WheelPosition.FrontLeft)
    this.car.vehicle.setSteeringValue(this.vehicleSteering, WheelPosition.FrontRight)

    this.car.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontLeft)
    this.car.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontRight)
    this.car.vehicle.setBrake(breakingForce, WheelPosition.RearLeft)
    this.car.vehicle.setBrake(breakingForce, WheelPosition.RearRight)

    this.car.update()
  }
}
