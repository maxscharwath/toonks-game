import {ExtendedGroup, type ExtendedObject3D, THREE} from 'enable3d';
import Entity from '@game/models/Entity';
import type * as Plugins from '@enable3d/three-graphics/jsm/plugins';
import {type Group} from 'three';
import Explosion from '@game/models/Explosion';
import shortUuid from 'short-uuid';
import {meshToExtendedObject3D} from '@game/utils/MeshToExtendedObject3D';
import {Properties} from '@game/utils/Properties';
import type Game from '@game/scenes/Game';

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

		this.materials = [
			'/images/tank/heig.png',
			'/images/tank/military.png',
			'/images/tank/studystorm.png',
			'/images/tank/weeb.png',
		].map(url => {
			const map = new THREE.TextureLoader().load(url);
			map.encoding = THREE.sRGBEncoding;
			map.flipY = false;
			map.repeat.set(1, 1);
			map.needsUpdate = true;
			return new THREE.MeshStandardMaterial({map, bumpMap: map, bumpScale: 0.03, metalness: 0.4, metalnessMap: map, roughness: 0.6});
		});
	}

	private static model: Group;
	private static materials: THREE.Material[] = [];

	protected readonly properties = new Properties<TankState>();

	private readonly vehicle: Ammo.btRaycastVehicle;
	private readonly wheelMeshes: ExtendedObject3D[] = [];
	private readonly chassis: ExtendedObject3D;
	private readonly turret: ExtendedObject3D;
	private readonly canon: ExtendedObject3D;
	private readonly group = new ExtendedGroup();
	private lastShot = 0;
	private readonly canonMotor: Ammo.btHingeConstraint;
	private readonly turretMotor: Ammo.btHingeConstraint;
	private readonly tuning: Ammo.btVehicleTuning;

	constructor(game: Game, position: THREE.Vector3, uuid: string = shortUuid.uuid()) {
		super(game, uuid);
		const model = Tank.model.clone();

		this.setTexture(model);

		this.group = new ExtendedGroup();

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

		this.chassis.position.copy(position);
		this.canon.position.copy(position);
		this.turret.position.copy(position);

		// Add lights to chassis
		const headlight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.5);
		headlight.position.set(0, 0, 0.5);
		headlight.target.position.set(0, 0, 1);
		headlight.castShadow = true;
		this.chassis.add(headlight, headlight.target);

		this.game.physics.add.existing(this.chassis, {shape: 'convexMesh', mass: 1500});
		this.game.physics.add.existing(this.turret, {shape: 'convexMesh', mass: 200});
		this.game.physics.add.existing(this.canon, {shape: 'convexMesh', mass: 50});

		// Attach the tower to the chassis
		this.turretMotor = this.game.physics.add.constraints.hinge(
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
		this.canonMotor = this.game.physics.add.constraints.hinge(
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
			this.game.physics.physicsWorld,
		);
		this.vehicle = new Ammo.btRaycastVehicle(
			this.tuning,
			this.chassis.body.ammo,
			rayCaster,
		);

		this.vehicle.setCoordinateSystem(0, 1, 2);
		this.game.physics.physicsWorld.addAction(this.vehicle);

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
			})
			.addProperty('rotation', {
				default: this.chassis.quaternion,
				get: () => this.chassis.quaternion,
				export: data => data.toArray(),
				import: data => new THREE.Quaternion().fromArray(data),
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

	public shoot() {
		if (this.lastShot + 250 > Date.now()) {
			return false;
		}

		this.lastShot = Date.now();
		// Get canon position
		const pos = this.canon.getWorldPosition(new THREE.Vector3());
		// Translate the position to the front of the canon
		pos.add(
			this.canon.getWorldDirection(new THREE.Vector3()).multiplyScalar(1),
		);

		new Explosion(this.game, pos).addToScene();

		const sphere = this.game.physics.add.sphere(
			{radius: 0.05, x: pos.x, y: pos.y, z: pos.z, mass: 100},
			{phong: {color: 0x202020}},
		);
		// Event when bullet hit something
		sphere.body.on.collision(other => {
			console.log('hit', other);
			this.game.physics.destroy(sphere);
			sphere.removeFromParent();
			const pos = sphere.getWorldPosition(new THREE.Vector3());
			new Explosion(this.game, pos, 0.5).addToScene();
		});

		sphere.receiveShadow = sphere.castShadow = true;
		setTimeout(() => {
			this.game.physics.destroy(sphere);
			sphere.removeFromParent();
		}, 5000);

		const force = this.canon
			.getWorldDirection(new THREE.Vector3())
			.multiplyScalar(10000);
		const recoil = force.clone().multiplyScalar(-0.2);
		this.canon.body.applyForce(recoil.x, recoil.y, recoil.z);
		sphere.body.applyForce(force.x, force.y, force.z);
		return true;
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
		this.game.add.existing(this.group);
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

	protected async updatePhysics() {
		const physics = [
			this.chassis.body,
			this.turret.body,
			this.canon.body,
		];

		physics.forEach(body => {
			body.needUpdate = true;
		});

		await Promise.all(physics.map(async body => new Promise(resolve => {
			body.once.update(resolve);
		})));
	}

	protected setCollisionFlags(flags: number) {
		this.chassis.body.setCollisionFlags(flags);
	}

	protected setTexture(model: THREE.Group) {
		const material = Tank.materials[Math.floor(Math.random() * Tank.materials.length)];
		model.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.material = material;
			}
		});
	}

	protected async teleport(position: THREE.Vector3) {
		const physics = [
			this.chassis,
			this.turret,
			this.canon,
		];
		const offset = this.object3d.position.clone().sub(position);
		const velocity = this.getVelocity();
		const angularVelocity = this.getAngularVelocity();
		this.setCollisionFlags(2);
		physics.forEach(obj => {
			obj.position.sub(offset);
		});
		await this.updatePhysics();
		this.setCollisionFlags(0);
		this.setVelocity(velocity);
		this.setAngularVelocity(angularVelocity);
	}

	private setVelocity(velocity: THREE.Vector3) {
		[
			this.chassis.body,
			this.turret.body,
			this.canon.body,
		].forEach(body => {
			body.setVelocity(velocity.x, velocity.y, velocity.z);
		});
	}

	private getVelocity() {
		const {x, y, z} = this.chassis.body.velocity;
		return new THREE.Vector3(x, y, z);
	}

	private setAngularVelocity(velocity: THREE.Vector3) {
		[
			this.chassis.body,
			this.turret.body,
			this.canon.body,
		].forEach(body => {
			body.setAngularVelocity(velocity.x, velocity.y, velocity.z);
		});
	}

	private getAngularVelocity() {
		const {x, y, z} = this.chassis.body.angularVelocity;
		return new THREE.Vector3(x, y, z);
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
