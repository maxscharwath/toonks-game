import { ExtendedObject3D } from '@enable3d/phaser-extension'
import Third from '@enable3d/phaser-extension/dist/third'
import { Camera, PerspectiveCamera } from 'three'
import { ExtendedGroup } from 'enable3d'

export enum WheelPosition {
  FrontLeft = 0,
  FrontRight = 1,
  RearLeft = 2,
  RearRight = 3
}

export default class Car {
  private tuning: Ammo.btVehicleTuning
  public vehicle: Ammo.btRaycastVehicle
  private wheelMeshes: ExtendedObject3D[] = []
  private chassis: ExtendedObject3D
  private tower: ExtendedObject3D
  private canon: ExtendedObject3D

    constructor(private third:Third, model: ExtendedGroup) {
    model = model.clone(true)

    model.traverse((child) => {
      console.log(child.name)
    })

    this.chassis = model.getObjectByName('TankFree_Body') as ExtendedObject3D
    this.tower = model.getObjectByName('TankFree_Tower') as ExtendedObject3D
    this.canon = model.getObjectByName('TankFree_Canon') as ExtendedObject3D

      this.tower.add(this.canon)
      this.chassis.add(this.tower)
    third.physics.add.existing(this.chassis, { shape: 'concave', mass: 1000 })
    this.wheelMeshes = [
      model.getObjectByName('TankFree_Wheel_f_right') as ExtendedObject3D,
      model.getObjectByName('TankFree_Wheel_b_right') as ExtendedObject3D,
      model.getObjectByName('TankFree_Wheel_f_left') as ExtendedObject3D,
      model.getObjectByName('TankFree_Wheel_b_left') as ExtendedObject3D
    ]

    third.scene.add(this.chassis)

    this.tuning = new Ammo.btVehicleTuning()
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(third.physics.physicsWorld)
    this.vehicle = new Ammo.btRaycastVehicle(this.tuning, this.chassis.body.ammo, rayCaster)

    this.chassis.body.skipUpdate = true

    this.vehicle.setCoordinateSystem(0, 1, 2)
    third.physics.physicsWorld.addAction(this.vehicle)

    const wheelAxisPositionBack = -1
    const wheelRadiusBack = 0.4
    const wheelHalfTrackBack = 1.1
    const wheelAxisHeightBack = 0

    const wheelAxisFrontPosition = 1
    const wheelRadiusFront = 0.4
    const wheelHalfTrackFront = 1.1
    const wheelAxisHeightFront = 0

    this.addWheel(
      true,
      new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront,
      WheelPosition.FrontLeft
    )
    this.addWheel(
      true,
      new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront,
      WheelPosition.FrontRight
    )
    this.addWheel(
      false,
      new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack,
      WheelPosition.RearLeft
    )
    this.addWheel(
      false,
      new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack,
      WheelPosition.RearRight
    )
  }

  public jump() {
    this.vehicle.getChassisWorldTransform().getOrigin().setY(5)
  }

    private addWheel(isFront: boolean, pos: Ammo.btVector3, radius: number, index: number) {
      const suspensionStiffness = 50.0
      const suspensionDamping = 2.3
      const suspensionCompression = 4.4
      const suspensionRestLength = 0

      const friction = 50
      const rollInfluence = 0.01

      const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
      const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)

      const wheelInfo = this.vehicle.addWheel(
        pos,
        wheelDirectionCS0,
        wheelAxleCS,
        suspensionRestLength,
        radius,
        this.tuning,
        isFront
      )

      wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
      wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
      wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)

      wheelInfo.set_m_frictionSlip(friction)
      wheelInfo.set_m_rollInfluence(rollInfluence)
      this.wheelMeshes[index].geometry.center()
      this.third.scene.add(this.wheelMeshes[index])
    }

  public update() {
    this.third.physics.debug?.enable()
    let tm, p, q, i
    const n = this.vehicle.getNumWheels()
    for (i = 0; i < n; i++) {
      this.vehicle.updateWheelTransform(i, true)
      tm = this.vehicle.getWheelTransformWS(i)
      p = tm.getOrigin()
      q = tm.getRotation()
      this.wheelMeshes[i].position.set(p.x(), p.y(), p.z())
      this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w())
      // this.wheelMeshes[i].rotateZ(Math.PI / 2)
    }

    tm = this.vehicle.getChassisWorldTransform()
    p = tm.getOrigin()
    q = tm.getRotation()

    this.chassis.position.set(p.x(), p.y(), p.z())
    this.chassis.quaternion.set(q.x(), q.y(), q.z(), q.w())
  }
}

