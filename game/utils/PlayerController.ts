import {type Scene3D} from 'enable3d/dist/scene3d';
import type Tank from '@game/models/Tank';
import {THREE} from 'enable3d';
import {Keyboard} from '@game/utils/Keyboard';

export default class PlayerController {
	private readonly keyboard = new Keyboard()
		.addAction('turnRight', ['KeyD'])
		.addAction('turnLeft', ['KeyA'])
		.addAction('moveForward', ['KeyW'])
		.addAction('moveBackward', ['KeyS'])
		.addAction('shoot', ['Space'])
		.addAction('break', ['AltLeft'])
		.addAction('resetPosition', ['KeyR'])
		.addAction('headlights', ['KeyL'])
		.addAction('honk', ['KeyK']);

	private tank?: Tank;

	constructor(private readonly scene3D: Scene3D) {
	}

	public setTank(tank: Tank) {
		this.tank = tank;
	}

	public update() {
		if (!this.tank) {
			return;
		}

		const steeringIncrement = 0.04;
		const steeringClamp = 0.5;
		const maxEngineForce = 5000;
		const maxBreakingForce = 100;

		// Front/back
		if (this.keyboard.getAction('moveForward')) {
			this.tank.engineForce = maxEngineForce;
		} else if (this.keyboard.getAction('moveBackward')) {
			this.tank.engineForce = -maxEngineForce;
		} else {
			this.tank.engineForce = 0;
		}

		if (this.keyboard.getAction('turnLeft')) {
			if (this.tank.steering < steeringClamp) {
				this.tank.steering += steeringIncrement;
			}
		} else if (this.keyboard.getAction('turnRight')) {
			if (this.tank.steering > -steeringClamp) {
				this.tank.steering -= steeringIncrement;
			}
		} else {
			if (this.tank.steering > 0) {
				this.tank.steering -= steeringIncrement / 2;
			}

			if (this.tank.steering < 0) {
				this.tank.steering += steeringIncrement / 2;
			}

			if (Math.abs(this.tank.steering) <= steeringIncrement) {
				this.tank.steering = 0;
			}
		}

		// Break
		if (this.keyboard.getAction('break')) {
			this.tank.breakingForce = maxBreakingForce;
		}

		const rotation = this.scene3D.camera.getWorldDirection(new THREE.Vector3());
		const rotation2 = this.tank.object3d.getWorldDirection(new THREE.Vector3());
		this.tank.turretAngle = -Math.atan2(rotation2.x, rotation2.z) + Math.atan2(rotation.x, rotation.z);
	}

	init() {
		this.keyboard.start();
		this.keyboard.on('wheel', (event: WheelEvent) => {
			if (this.tank) {
				this.tank.canonAngle += event.deltaY * 0.0005;
			}
		});
		this.keyboard.getOnAction('shoot', () => {
			this.tank?.shoot();
		});

		this.keyboard.getOnAction('resetPosition', () => {
			void this.tank?.resetPosition();
		});

		this.keyboard.getOnAction('honk', () => {
			this.tank?.honk();
		}, 100);

		this.keyboard.getOnAction('headlights', () => {
			this.tank?.toggleHeadlights();
		}, 100);
	}
}
