import {ExtendedGroup, type ExtendedObject3D, FLAT, type Scene3D, THREE} from 'enable3d';
import Entity from '@game/models/Entity';
import type * as Plugins from '@enable3d/three-graphics/jsm/plugins';
import {type Group} from 'three';
import Explosion from '@game/models/Explosion';
import shortUuid from 'short-uuid';
import {meshToExtendedObject3D} from '@game/utils/MeshToExtendedObject3D';
import {Properties} from '@game/utils/Properties';

export enum WheelPosition {
	FrontLeft = 0,
	FrontRight = 1,
	RearLeft = 2,
	RearRight = 3,
}

export type TankState = {
	pseudo: string;
	turretAngle: number;
	canonAngle: number;
	steering: number;
	engineForce: number;
	breakingForce: number;
	position: THREE.Vector3;
	rotation: THREE.Quaternion;
};

export default class Tank extends Entity {
	static async loadModel(loader: Plugins.Loaders, url: string) {
		const tankGlb = await loader.gltf(url);
		this.model = tankGlb.scenes[0];
		this.model.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}

	private static model: Group;

	readonly vehicle: Ammo.btRaycastVehicle;
	private readonly wheelMeshes: ExtendedObject3D[] = [];
	private readonly chassis: ExtendedObject3D;
	private readonly turret: ExtendedObject3D;
	private readonly canon: ExtendedObject3D;
	private readonly group = new ExtendedGroup();
	private lastShot = 0;
	private readonly canonMotor: Ammo.btHingeConstraint;
	private readonly turretMotor: Ammo.btHingeConstraint;
	private readonly tuning: Ammo.btVehicleTuning;
	private readonly properties = new Properties<TankState>();

	constructor(scene: Scene3D, position: THREE.Vector3, uuid: string = shortUuid.uuid()) {
		super(scene, uuid);

		const model = Tank.model.clone();

		this.chassis = meshToExtendedObject3D(
			model.getObjectByName('TankFree_Body'),
		);
		this.turret = meshToExtendedObject3D(
			model.getObjectByName('TankFree_Tower'),
		);
		this.canon = meshToExtendedObject3D(
			model.getObjectByName('TankFree_Canon'),
		);

		this.group.add(this.chassis, this.turret, this.canon);

		// Add lights to chassis
		const headlight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.5);
		headlight.position.set(0, 0, 0.5);
		headlight.target.position.set(0, 0, 1);
		headlight.castShadow = true;
		this.chassis.add(headlight, headlight.target);

		this.chassis.position.copy(position);
		this.turret.position.copy(position);
		this.canon.position.copy(position);

		scene.physics.add.existing(this.chassis, {shape: 'convexMesh', mass: 1500});
		scene.physics.add.existing(this.turret, {shape: 'convexMesh', mass: 200});
		scene.physics.add.existing(this.canon, {shape: 'convexMesh', mass: 50});

		const texture = new FLAT.TextTexture('', {
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
		this.turretMotor = scene.physics.add.constraints.hinge(
			this.chassis.body,
			this.turret.body,
			{
				pivotA: {y: 0.3},
				pivotB: {y: -0.22},
				axisA: {y: 1},
				axisB: {y: 1},
			},
		);

		// Attach the canon to the tower
		this.canonMotor = scene.physics.add.constraints.hinge(
			this.turret.body,
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

		this.properties
			.addProperty('turretAngle', {
				default: 0,
				onChange: value => {
					this.turretMotor.setLimit(value, value, 0.9, 1);
				},
			})
			.addProperty('canonAngle', {
				default: 0,
				onChange: value => {
					this.canonMotor.setLimit(value, value, 0.9, 1);
				},
			})
			.addProperty('pseudo', {
				default: 'Player',
				onChange(pseudo) {
					sprite3d.setText(pseudo);
				},
			})
			.addProperty('engineForce', {
				default: 0,
			})
			.addProperty('breakingForce', {
				default: 0,
			})
			.addProperty('steering', {
				default: 0,
			})
			.addProperty('position', {
				default: this.chassis.position,
				get: () => this.chassis.position,
				export: data => data.toArray(),
				import: data => new THREE.Vector3().fromArray(data),
				onChange: value => {
					if (this.object3d.position.distanceTo(value) > 0.2) {
						this.teleport({
							pos: value,
						});
					}
				},
			})
			.addProperty('rotation', {
				default: this.chassis.quaternion,
				get: () => this.chassis.quaternion,
				export: data => data.toArray(),
				import: data => new THREE.Quaternion().fromArray(data),
				onChange: value => {
					if (this.object3d.quaternion.angleTo(value) > 0.2) {
						this.teleport({
							rot: value,
						});
					}
				},
			});
	}

	public get object3d(): THREE.Object3D {
		return this.chassis;
	}

	public get turretAngle() {
		return this.turretMotor.getHingeAngle();
	}

	public set turretAngle(angle: number) {
		this.properties.getProperty('turretAngle').value = angle;
	}

	public get canonAngle() {
		return this.canonMotor.getHingeAngle();
	}

	public set canonAngle(angle: number) {
		// Limit the canon angle to -45° and 45°
		angle = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, angle));
		this.properties.getProperty('canonAngle').value = angle;
	}

	public get pseudo() {
		return this.properties.getProperty('pseudo').value;
	}

	public set pseudo(pseudo: string) {
		this.properties.getProperty('pseudo').value = pseudo;
	}

	public get engineForce() {
		return this.properties.getProperty('engineForce').value;
	}

	public set engineForce(force: number) {
		this.properties.getProperty('engineForce').value = force;
	}

	public get breakingForce() {
		return this.properties.getProperty('breakingForce').value;
	}

	public set breakingForce(force: number) {
		this.properties.getProperty('breakingForce').value = force;
	}

	public get steering() {
		return this.properties.getProperty('steering').value;
	}

	public set steering(value: number) {
		this.properties.getProperty('steering').value = value;
	}

	public get speed() {
		return this.vehicle.getCurrentSpeedKmHour();
	}

	public jump() {
		this.vehicle
			.getRigidBody()
			.applyCentralImpulse(new Ammo.btVector3(0, 1000, 0));
		// Destroy constraint
		this.scene.physics.physicsWorld.removeConstraint(this.turretMotor);
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
			this.canon.getWorldDirection(new THREE.Vector3()).multiplyScalar(1),
		);

		new Explosion(this.scene, pos).addToScene();

		const sphere = this.scene.physics.add.sphere(
			{radius: 0.05, x: pos.x, y: pos.y, z: pos.z, mass: 100},
			{phong: {color: 0x202020}},
		);
		// Event when bullet hit something
		sphere.body.on.collision(other => {
			console.log('hit', other);
			this.scene.physics.destroy(sphere);
			sphere.removeFromParent();
			const pos = sphere.getWorldPosition(new THREE.Vector3());
			new Explosion(this.scene, pos, 0.5).addToScene();
		});

		sphere.receiveShadow = sphere.castShadow = true;
		setTimeout(() => {
			this.scene.physics.destroy(sphere);
			sphere.removeFromParent();
		}, 5000);

		const force = this.canon
			.getWorldDirection(new THREE.Vector3())
			.multiplyScalar(10000);
		const recoil = force.clone().multiplyScalar(-0.2);
		this.canon.body.applyForce(recoil.x, recoil.y, recoil.z);
		sphere.body.applyForce(force.x, force.y, force.z);
	}

	public update() {
		const n = this.vehicle.getNumWheels();
		for (let i = 0; i < n; i++) {
			this.vehicle.updateWheelTransform(i, true);
			const tm = this.vehicle.getWheelTransformWS(i);
			const p = tm.getOrigin();
			const q = tm.getRotation();
			this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
			this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
		}

		const {engineForce, breakingForce, steering, speed} = this;

		this.vehicle.setSteeringValue(
			steering,
			WheelPosition.FrontLeft,
		);
		this.vehicle.setSteeringValue(
			steering,
			WheelPosition.FrontRight,
		);

		this.vehicle.applyEngineForce(engineForce, WheelPosition.FrontLeft);
		this.vehicle.applyEngineForce(engineForce, WheelPosition.FrontRight);

		this.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontLeft);
		this.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontRight);
		this.vehicle.setBrake(breakingForce, WheelPosition.RearLeft);
		this.vehicle.setBrake(breakingForce, WheelPosition.RearRight);

		// Friction
		this.vehicle.applyEngineForce(-speed * 100, WheelPosition.RearLeft);
		this.vehicle.applyEngineForce(-speed * 100, WheelPosition.RearRight);
	}

	public addToScene() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.scene.add.existing(this.group);
	}

	public removeFromScene() {
		this.group.removeFromParent();
	}

	public destroy(): void {
		throw new Error('Method not implemented.');
	}

	public export(): TankState & {uuid: string} {
		return {
			uuid: this.uuid,
			...this.properties.export(),
		};
	}

	public import(state: Partial<TankState>): void {
		this.properties.import(state);
	}

	public teleport({pos, rot}: {pos?: THREE.Vector3; rot?: THREE.Quaternion}) {
		(async () => {
			this.chassis.body.setCollisionFlags(2);
			this.turret.body.setCollisionFlags(2);
			this.canon.body.setCollisionFlags(2);
			if (pos) {
				const transRelative = this.chassis.position.clone().sub(pos);
				this.chassis.position.copy(pos);
				this.turret.position.sub(transRelative);
				this.canon.position.sub(transRelative);
			}

			if (rot) {
				this.chassis.quaternion.copy(rot);
			}

			await this.updatePhysics();

			this.chassis.body.setCollisionFlags(0);
			this.turret.body.setCollisionFlags(0);
			this.canon.body.setCollisionFlags(0);

			this.chassis.body.setVelocity(0, 0, 0);
			this.turret.body.setVelocity(0, 0, 0);
			this.canon.body.setVelocity(0, 0, 0);

			this.chassis.body.setAngularVelocity(0, 0, 0);
			this.turret.body.setAngularVelocity(0, 0, 0);
			this.canon.body.setAngularVelocity(0, 0, 0);
		})();
	}

	private async updatePhysics() {
		this.chassis.body.needUpdate = true;
		this.turret.body.needUpdate = true;
		this.canon.body.needUpdate = true;
		await Promise.all([
			new Promise<void>(resolve => {
				this.chassis.body.once.update(() => {
					resolve();
				});
			}),
			new Promise<void>(resolve => {
				this.turret.body.once.update(() => {
					resolve();
				});
			}),
			new Promise<void>(resolve => {
				this.canon.body.once.update(() => {
					resolve();
				});
			}),
		]);
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

		const friction = 100;
		const rollInfluence = 0.1;

		const wheelDirection = new Ammo.btVector3(0, -1, 0);
		const wheelAxle = new Ammo.btVector3(-1, 0, 0);
		const wheelInfo = this.vehicle.addWheel(
			pos,
			wheelDirection,
			wheelAxle,
			suspensionRestLength,
			radius,
			this.tuning,
			isFront,
		);

		wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
		wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
		wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
		wheelInfo.set_m_maxSuspensionForce(10000);

		wheelInfo.set_m_frictionSlip(friction);
		wheelInfo.set_m_rollInfluence(rollInfluence);

		this.wheelMeshes[index].geometry.center();
		this.group.add(this.wheelMeshes[index]);
	}
}
