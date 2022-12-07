import {type ExtendedGroup, ExtendedObject3D, FLAT, type Scene3D, THREE} from 'enable3d';

export enum WheelPosition {
	FrontLeft = 0,
	FrontRight = 1,
	RearLeft = 2,
	RearRight = 3,
}

function meshToExtendedObject3D(mesh: THREE.Mesh): ExtendedObject3D {
	const obj = new ExtendedObject3D();
	obj.position.copy(mesh.position);
	obj.rotation.copy(mesh.rotation);
	mesh.geometry.center();
	mesh.position.set(0, 0, 0);
	mesh.rotation.set(0, 0, 0);
	obj.add(mesh);
	return obj;
}

export default class Tank extends ExtendedObject3D {
	public vehicle: Ammo.btRaycastVehicle;
	public canonMotor: Ammo.btHingeConstraint;
	public towerMotor: Ammo.btHingeConstraint;
	public readonly tuning: Ammo.btVehicleTuning;
	public readonly wheelMeshes: ExtendedObject3D[] = [];
	public readonly chassis: ExtendedObject3D;
	public readonly tower: ExtendedObject3D;
	public readonly canon: ExtendedObject3D;
	private lastShot = 0;

	constructor(private readonly scene: Scene3D, model: ExtendedGroup) {
		super();
		model = model.clone(true);

		model.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.receiveShadow = true;
				child.castShadow = true;
			}
		});

		this.chassis = meshToExtendedObject3D(
			model.getObjectByName('TankFree_Body') as THREE.Mesh,
		);
		this.tower = meshToExtendedObject3D(
			model.getObjectByName('TankFree_Tower') as THREE.Mesh,
		);
		this.canon = meshToExtendedObject3D(
			model.getObjectByName('TankFree_Canon') as THREE.Mesh,
		);

		scene.physics.add.existing(this.chassis, {
			shape: 'convexMesh',
			mass: 1500,
		});
		scene.physics.add.existing(this.tower, {shape: 'convexMesh', mass: 200});
		scene.physics.add.existing(this.canon, {shape: 'convexMesh', mass: 50});
		this.add(this.chassis.add(this.tower.add(this.canon)));

		const texture = new FLAT.TextTexture('TOONKER #1', {
			background: 'rgba(0, 0, 0, 0.5)',
			fillStyle: 'white',
			padding: {
				x: 10,
				y: 15,
			},
			borderRadius: 10,
		});
		const sprite3d = new FLAT.TextSprite(texture);
		sprite3d.setScale(0.005);
		sprite3d.position.set(0, 1, 0);
		this.chassis.add(sprite3d);

		// Attach the tower to the chassis
		this.towerMotor = scene.physics.add.constraints.hinge(
			this.chassis.body,
			this.tower.body,
			{
				pivotA: {y: 0.3},
				pivotB: {y: -0.22},
				axisA: {y: 1},
				axisB: {y: 1},
			},
		);

		// Attach the canon to the tower
		this.canonMotor = scene.physics.add.constraints.hinge(
			this.tower.body,
			this.canon.body,
			{
				pivotA: {y: -0.05, z: 0.4},
				pivotB: {y: 0, z: -0.3},
				axisA: {x: 1},
				axisB: {x: 1},
			},
		);
		// Set the limits of the canon
		this.canonMotor.setLimit(-Math.PI / 4, Math.PI / 4, 0.9, 0.3);

		this.wheelMeshes = [
			model.getObjectByName('TankFree_Wheel_f_right') as ExtendedObject3D,
			model.getObjectByName('TankFree_Wheel_f_left') as ExtendedObject3D,
			model.getObjectByName('TankFree_Wheel_b_left') as ExtendedObject3D,
			model.getObjectByName('TankFree_Wheel_b_right') as ExtendedObject3D,
		];

		this.tuning = new Ammo.btVehicleTuning();
		const rayCaster = new Ammo.btDefaultVehicleRaycaster(
			scene.physics.physicsWorld,
		);
		this.vehicle = new Ammo.btRaycastVehicle(
			this.tuning,
			this.chassis.body.ammo,
			rayCaster,
		);
		this.chassis.body.skipUpdate = true;

		this.vehicle.setCoordinateSystem(0, 1, 2);
		scene.physics.physicsWorld.addAction(this.vehicle);

		const wheelAxisPositionBack = -0.4;
		const wheelRadiusBack = 0.25;
		const wheelHalfTrackBack = 0.55;
		const wheelAxisHeightBack = -0.3;

		const wheelAxisFrontPosition = 0.4;
		const wheelRadiusFront = 0.25;
		const wheelHalfTrackFront = 0.55;
		const wheelAxisHeightFront = -0.3;

		this.addWheel(
			true,
			new Ammo.btVector3(
				wheelHalfTrackFront,
				wheelAxisHeightFront,
				wheelAxisFrontPosition,
			),
			wheelRadiusFront,
			WheelPosition.FrontLeft,
		);
		this.addWheel(
			true,
			new Ammo.btVector3(
				-wheelHalfTrackFront,
				wheelAxisHeightFront,
				wheelAxisFrontPosition,
			),
			wheelRadiusFront,
			WheelPosition.FrontRight,
		);
		this.addWheel(
			false,
			new Ammo.btVector3(
				-wheelHalfTrackBack,
				wheelAxisHeightBack,
				wheelAxisPositionBack,
			),
			wheelRadiusBack,
			WheelPosition.RearLeft,
		);
		this.addWheel(
			false,
			new Ammo.btVector3(
				wheelHalfTrackBack,
				wheelAxisHeightBack,
				wheelAxisPositionBack,
			),
			wheelRadiusBack,
			WheelPosition.RearRight,
		);
	}

	public jump() {
		this.vehicle
			.getRigidBody()
			.applyCentralImpulse(new Ammo.btVector3(0, 1000, 0));
		// Destroy constraint
		this.scene.physics.physicsWorld.removeConstraint(this.towerMotor);
		this.scene.physics.physicsWorld.removeConstraint(this.canonMotor);
	}

	public shoot() {
		if (this.lastShot + 250 > Date.now()) {
			return;
		}

		this.lastShot = Date.now();
		// Get canon position
		const pos = this.canon.getWorldPosition(new THREE.Vector3());
		// Translate the position to the front of the canon
		pos.add(
			this.canon.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.2),
		);
		const sphere = this.scene.physics.add.sphere(
			{radius: 0.05, x: pos.x, y: pos.y, z: pos.z, mass: 10},
			{phong: {color: 0x202020}},
		);
		sphere.receiveShadow = sphere.castShadow = true;
		setTimeout(() => {
			this.scene.physics.destroy(sphere);
			sphere.removeFromParent();
		}, 5000);

		const force = this.canon
			.getWorldDirection(new THREE.Vector3())
			.multiplyScalar(400);
		const recoil = force.clone().multiplyScalar(-1);
		this.canon.body.applyForce(recoil.x, recoil.y, recoil.z);
		sphere.body.applyForce(force.x, force.y, force.z);
	}

	public update() {
		let tm;
		let p;
		let q;
		let i;
		const n = this.vehicle.getNumWheels();
		for (i = 0; i < n; i++) {
			this.vehicle.updateWheelTransform(i, true);
			tm = this.vehicle.getWheelTransformWS(i);
			p = tm.getOrigin();
			q = tm.getRotation();
			this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
			this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
			// This.wheelMeshes[i].rotateZ(Math.PI / 2)
		}

		tm = this.vehicle.getChassisWorldTransform();
		p = tm.getOrigin();
		q = tm.getRotation();

		this.chassis.position.set(p.x(), p.y(), p.z());
		this.chassis.quaternion.set(q.x(), q.y(), q.z(), q.w());
	}

	private addWheel(
		isFront: boolean,
		pos: Ammo.btVector3,
		radius: number,
		index: number,
	) {
		const suspensionStiffness = 60.0;
		const suspensionDamping = 6;
		const suspensionCompression = 10;
		const suspensionRestLength = 0.01;

		const friction = 50;
		const rollInfluence = 0.01;

		const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
		const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

		const wheelInfo = this.vehicle.addWheel(
			pos,
			wheelDirectionCS0,
			wheelAxleCS,
			suspensionRestLength,
			radius,
			this.tuning,
			isFront,
		);

		wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
		wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
		wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);

		wheelInfo.set_m_frictionSlip(friction);
		wheelInfo.set_m_rollInfluence(rollInfluence);

		this.wheelMeshes[index].geometry.center();
		this.add(this.wheelMeshes[index]);
	}
}
