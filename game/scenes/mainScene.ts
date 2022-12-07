import Tank, {WheelPosition} from '@game/models/Tank';
import {GUI} from 'lil-gui';
import {type ExtendedGroup, type ExtendedObject3D, FLAT, Scene3D, THREE} from 'enable3d';
import {type GameConfig} from '@game/scenes/initScene';
import {type FlatArea} from '@enable3d/three-graphics/jsm/flat/flat';
import {AdvancedThirdPersonControls} from '@game/utils/advancedThirdPersonControls';
import {Keyboard} from '@game/utils/keyboard';
import chroma from 'chroma-js';

export default class MainScene extends Scene3D {
	private tank?: Tank;

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

	constructor() {
		super({key: 'MainScene'});
	}

	init(data: GameConfig) {
		this.data = data;
		this.keyboard.start();
	}

	async create() {
		const {lights} = await this.warpSpeed('light');
		if (lights) {
			const intensity = 0.4;
			lights.hemisphereLight.intensity = intensity;
			lights.ambientLight.intensity = intensity;
			lights.directionalLight.intensity = intensity;
			lights.directionalLight.target = this.camera;
			lights.directionalLight.shadow.bias = -0.0001;
		}

		// Fog
		const fogColor = chroma('#63a7ff').num();
		this.scene.fog = new THREE.Fog(fogColor, 0, 100);
		this.scene.background = new THREE.Color(fogColor);

		const heightmap = await this.load.texture('/images/heightmap2.png');
		const colorScale = chroma
			.scale(['#003eb2', '#0952c6', '#a49463', '#867645', '#3c6114', '#5a7f32', '#8c8e7b', '#a0a28f', '#ebebeb'])
			.domain([0, 0.025, 0.1, 0.2, 0.25, 0.8, 1.3, 1.45, 1.6]);
		const mesh = this.heightMap.add(heightmap, {colorScale})!;
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.scale.set(20, 20, 20);
		mesh.position.set(0, -10, 0);
		this.physics.add.existing(mesh as unknown as ExtendedObject3D, {mass: 0, collisionFlags: 1});
		mesh.body.ammo.setFriction(0.5);
		mesh.body.ammo.setRollingFriction(0);
		mesh.body.ammo.setRestitution(1);

		const tankGlb = await this.load.gltf('tank');
		const tankModel = tankGlb.scenes[0] as ExtendedGroup;

		this.tank = new Tank(this, tankModel);
		this.tank.addToScene();

		this.control = new AdvancedThirdPersonControls(this.camera, this.tank.chassis, this.renderer.domElement, {
			offset: new THREE.Vector3(0, 0, 0),
			targetRadius: 10,
		});

		const panel = new GUI();
		const params = {
			debug: false,
			mode: 2049,
		};
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
	}

	update() {
		if (!this.tank) {
			return;
		}

		this.control.update();

		let engineForce = 0;
		let breakingForce = 0;
		const steeringIncrement = 0.04;
		const steeringClamp = 0.5;
		const maxEngineForce = 2000;
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
}
