import { ExtendedObject3D, THREE } from '@enable3d/phaser-extension'
import {type ExtendedGroup} from 'enable3d';
import type Third from '@enable3d/phaser-extension/dist/third';

export enum WheelPosition {
	FrontLeft = 0,
	FrontRight = 1,
	RearLeft = 2,
	RearRight = 3,
}

function MeshToExtendedObject3D(mesh: THREE.Mesh): ExtendedObject3D {
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

	constructor(private readonly third: Third, model: ExtendedGroup) {
		super();
		model = model.clone(true);

		model.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.receiveShadow = child.castShadow = true;
			}
		});

		this.chassis = MeshToExtendedObject3D(model.getObjectByName('TankFree_Body') as THREE.Mesh);
		this.tower = MeshToExtendedObject3D(model.getObjectByName('TankFree_Tower') as THREE.Mesh);
		this.canon = MeshToExtendedObject3D(model.getObjectByName('TankFree_Canon') as THREE.Mesh);

		third.physics.add.existing(this.chassis, {shape: 'convexMesh', mass: 1500});
		third.physics.add.existing(this.tower, {shape: 'convexMesh', mass: 200});
		third.physics.add.existing(this.canon, {shape: 'convexMesh', mass: 50});
		this.add(this.chassis.add(this.tower.add(this.canon)));

		// Attach the tower to the chassis
		this.towerMotor = third.physics.add.constraints.hinge(this.chassis.body, this.tower.body, {
			pivotA: {y: 0.3},
			pivotB: {y: -0.22},
			axisA: {y: 1},
			axisB: {y: 1},
		});

		// Attach the canon to the tower
		this.canonMotor = third.physics.add.constraints.hinge(this.tower.body, this.canon.body, {
			pivotA: {y: -0.05, z: 0.4},
			pivotB: {y: 0, z: -0.3},
			axisA: {x: 1},
			axisB: {x: 1},
		});
		// Set the limits of the canon
		this.canonMotor.setLimit(-Math.PI / 4, Math.PI / 4, 0.9, 0.3);

		this.wheelMeshes = [
			model.getObjectByName('TankFree_Wheel_f_right') as ExtendedObject3D,
			model.getObjectByName('TankFree_Wheel_f_left') as ExtendedObject3D,
			model.getObjectByName('TankFree_Wheel_b_left') as ExtendedObject3D,
			model.getObjectByName('TankFree_Wheel_b_right') as ExtendedObject3D,
		];

		this.tuning = new Ammo.btVehicleTuning();
		const rayCaster = new Ammo.btDefaultVehicleRaycaster(third.physics.physicsWorld);
		this.vehicle = new Ammo.btRaycastVehicle(this.tuning, this.chassis.body.ammo, rayCaster);
		this.chassis.body.skipUpdate = true;

		this.vehicle.setCoordinateSystem(0, 1, 2);
		third.physics.physicsWorld.addAction(this.vehicle);

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
			new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
			wheelRadiusFront,
			WheelPosition.FrontLeft,
		);
		this.addWheel(
			true,
			new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
			wheelRadiusFront,
			WheelPosition.FrontRight,
		);
		this.addWheel(
			false,
			new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
			wheelRadiusBack,
			WheelPosition.RearLeft,
		);
		this.addWheel(
			false,
			new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
			wheelRadiusBack,
			WheelPosition.RearRight,
		);
	}

	public jump() {
		this.vehicle.getRigidBody().applyCentralImpulse(new Ammo.btVector3(0, 1000, 0));
		// Destroy constraint
		this.third.physics.physicsWorld.removeConstraint(this.towerMotor);
		this.third.physics.physicsWorld.removeConstraint(this.canonMotor);
	}

	public shoot() {
		if (this.lastShot + 250 > Date.now()) {
			return;
		}

		this.lastShot = Date.now();
		// Get canon position
		const pos = this.canon.getWorldPosition(new THREE.Vector3());
		// Translate the position to the front of the canon
		pos.add(this.canon.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.2));
		const sphere = this.third.physics.add.sphere(
			{radius: 0.05, x: pos.x, y: pos.y, z: pos.z, mass: 10},
			{phong: {color: 0x202020}},
		);
		sphere.receiveShadow = sphere.castShadow = true;
		setTimeout(() => {
			this.third.physics.destroy(sphere);
			sphere.removeFromParent();
		}, 5000);

		const force = this.canon.getWorldDirection(new THREE.Vector3()).multiplyScalar(400);
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

	private addWheel(isFront: boolean, pos: Ammo.btVector3, radius: number, index: number) {
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

