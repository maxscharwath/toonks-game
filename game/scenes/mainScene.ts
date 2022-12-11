import Tank, {WheelPosition} from '@game/models/Tank';
import {GUI} from 'lil-gui';
import Stats from 'stats.js';
import {type ExtendedGroup, Scene3D, THREE} from 'enable3d';
import {type GameConfig} from '@game/scenes/initScene';
import {type FlatArea} from '@enable3d/three-graphics/jsm/flat/flat';
import {AdvancedThirdPersonControls} from '@game/utils/advancedThirdPersonControls';
import {Keyboard} from '@game/utils/keyboard';
import {ChunkLoader} from '@game/world/ChunkLoader';
import {World} from '@game/world/World';
import {ChunkPopulator} from '@game/world/ChunkPopulator';
import {Sun} from '@game/utils/Sun';

export default class MainScene extends Scene3D {
	private tank?: Tank;
	private readonly stats = new Stats();

	private readonly keyboard = new Keyboard()
		.addAction('turnRight', ['KeyD'])
		.addAction('turnLeft', ['KeyA'])
		.addAction('moveForward', ['KeyW'])
		.addAction('moveBackward', ['KeyS'])
		.addAction('turretUp', ['ArrowUp'])
		.addAction('turretDown', ['ArrowDown'])
		.addAction('turretRight', ['ArrowRight'])
		.addAction('turretLeft', ['ArrowLeft'])
		.addAction('shoot', ['Space'])
		.addAction('break', ['AltLeft']);

	private vehicleSteering = 0;
	private data!: GameConfig;
	private readonly ui!: FlatArea;
	private control!: AdvancedThirdPersonControls;
	private sun!: Sun;

	constructor() {
		super({key: 'MainScene'});
	}

	init(data: GameConfig) {
		this.data = data;
		this.keyboard.start();
	}

	async create() {
		this.sun = new Sun(this);
		this.scene.add(this.sun);

		// Fog
		const fogColor = new THREE.Color('#63a7ff');
		this.scene.fog = new THREE.Fog(fogColor, 0, 100);
		this.scene.background = new THREE.Color(fogColor);

		const chunkLoader = new ChunkLoader({
			worldHeightMapUrl: '/images/heightmap.png',
			chunkSize: 128,
			scale: 0.25,
		});

		const treeModel = (await this.load.gltf('tree')).scenes[0];
		treeModel.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.receiveShadow = true;
				child.castShadow = true;
			}
		});
		treeModel.scale.set(0.5, 0.5, 0.5);
		const chunkPopulator = new ChunkPopulator()
			.addElement(treeModel);

		const world = new World(chunkLoader, chunkPopulator);

		// Generate a 5x5 chunk area
		const chunks = await world.generateArea(8, 8, 4);
		chunks.forEach(chunk => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			this.add.existing(chunk);
			chunk.addPhysics(this);
		});
		const chunk = await world.getChunk(8, 8);

		const tankGlb = await this.load.gltf('tank');
		const tankModel = tankGlb.scenes[0] as ExtendedGroup;

		const position = chunk.getCenterPos();
		position.y += 1;
		this.tank = new Tank(this, tankModel, position);
		this.tank.addToScene();
		this.control = new AdvancedThirdPersonControls(this.camera, this.tank.chassis, this.renderer.domElement, {
			offset: new THREE.Vector3(0, 0, 0),
			targetRadius: 5,
		});
		this.control.useThirdPerson();
		const panel = new GUI();
		const params = {
			debug: false,
			mode: 2049,
			cameramode: 'Follow',
		};

		panel.add(params, 'cameramode', ['Follow', 'Free']).onChange((value: string) => {
			if (value === 'Follow') {
				this.control.useThirdPerson();
			} else {
				this.control.useOrbitControls();
			}
		});
		panel.add(params, 'debug').onChange((value: boolean) => {
			if (value) {
				this.physics.debug?.enable();
			} else {
				this.physics.debug?.disable();
			}
		});
		panel
			.add(params, 'mode', [1 + 2048, 1 + 4096, 1 + 2048 + 4096])
			.onChange((value: number) => {
				this.physics.debug?.mode(value);
			});
		this.renderer.domElement.parentElement?.appendChild(this.stats.dom);
	}

	update() {
		this.stats.begin();
		this.control.update();
		this.sun.update();
		if (this.tank) {
			let engineForce = 0;
			let breakingForce = 0;
			const steeringIncrement = 0.04;
			const steeringClamp = 0.5;
			const maxEngineForce = 5000;
			const maxBreakingForce = 100;

			// Front/back
			if (this.keyboard.getAction('moveForward')) {
				engineForce = maxEngineForce;
			} else if (this.keyboard.getAction('moveBackward')) {
				engineForce = -maxEngineForce;
			}

			if (this.keyboard.getAction('turnLeft')) {
				if (this.vehicleSteering < steeringClamp) {
					this.vehicleSteering += steeringIncrement;
				}
			} else if (this.keyboard.getAction('turnRight')) {
				if (this.vehicleSteering > -steeringClamp) {
					this.vehicleSteering -= steeringIncrement;
				}
			} else {
				if (this.vehicleSteering > 0) {
					this.vehicleSteering -= steeringIncrement / 2;
				}

				if (this.vehicleSteering < 0) {
					this.vehicleSteering += steeringIncrement / 2;
				}

				if (Math.abs(this.vehicleSteering) <= steeringIncrement) {
					this.vehicleSteering = 0;
				}
			}

			// Break
			if (this.keyboard.getAction('break')) {
				breakingForce = maxBreakingForce;
			}

			if (this.keyboard.getAction('shoot')) {
				this.tank.shoot();
			}

			this.tank.vehicle.applyEngineForce(engineForce, WheelPosition.FrontLeft);
			this.tank.vehicle.applyEngineForce(engineForce, WheelPosition.FrontRight);

			this.tank.vehicle.setSteeringValue(
				this.vehicleSteering,
				WheelPosition.FrontLeft,
			);
			this.tank.vehicle.setSteeringValue(
				this.vehicleSteering,
				WheelPosition.FrontRight,
			);

			this.tank.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontLeft);
			this.tank.vehicle.setBrake(breakingForce / 2, WheelPosition.FrontRight);
			this.tank.vehicle.setBrake(breakingForce, WheelPosition.RearLeft);
			this.tank.vehicle.setBrake(breakingForce, WheelPosition.RearRight);

			// Friction
			this.tank.vehicle.applyEngineForce(-this.tank.vehicle.getCurrentSpeedKmHour() * 100, WheelPosition.RearLeft);
			this.tank.vehicle.applyEngineForce(-this.tank.vehicle.getCurrentSpeedKmHour() * 100, WheelPosition.RearRight);

			this.tank.canonMotor.enableAngularMotor(
				true,
				this.keyboard.getAction('turretUp') ? -2 : this.keyboard.getAction('turretDown') ? 2 : 0,
				10,
			);

			this.tank.towerMotor.enableAngularMotor(
				true,
				this.keyboard.getAction('turretRight') ? -2 : this.keyboard.getAction('turretLeft') ? 2 : 0,
				10,
			);

			this.tank.update();
		}

		this.stats.end();
	}
}
