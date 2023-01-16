import Tank, {type TankState} from '@game/models/Tank';
import {FLAT, type THREE} from 'enable3d';
import type Game from '@game/scenes/Game';

export default class TankNetwork extends Tank {
	protected readonly targetTransform: {
		position?: {
			from: THREE.Vector3;
			to: THREE.Vector3;
		};
		rotation?: {
			from: THREE.Quaternion;
			to: THREE.Quaternion;
		};
	} = {};

	private lastUpdate: number = Date.now();
	private updateDelta = 0;

	constructor(game: Game, position: THREE.Vector3, uuid: string) {
		super(game, position, uuid);
		this.setCollisionFlags(2);
		this.properties.getProperty('position').onChange(position => {
			this.targetTransform.position = {
				from: this.object3d.position.clone(),
				to: position,
			};
		}, true);
		this.properties.getProperty('rotation').onChange(rotation => {
			this.targetTransform.rotation = {
				from: this.object3d.quaternion.clone(),
				to: rotation,
			};
		}, true);

		const texture = new FLAT.TextTexture('Toonks', {
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

		this.object3d.add(sprite3d);

		this.properties.getProperty('pseudo').onChange(name => {
			sprite3d.setText(name);
		}, true);
	}

	public die() {
		this.setCollisionFlags(0);
		super.die();
	}

	public init() {
		this.setCollisionFlags(2);
		super.init();
	}

	public update(delta: number) {
		super.update(delta);
		void this.lerpTransform();
	}

	public getLastUpdate(): number {
		return this.lastUpdate;
	}

	public networkUpdate(state: Partial<TankState>): void {
		const now = Date.now();
		this.updateDelta = now - this.lastUpdate;
		this.lastUpdate = now;
		this.import(state);
	}

	private async lerpTransform() {
		if (this.isDead() || !this.targetTransform) {
			return;
		}

		const timeSinceLastUpdate = Date.now() - this.lastUpdate;
		const delta = Math.min(timeSinceLastUpdate / this.updateDelta, 1);

		if (this.targetTransform.position) {
			const {from, to} = this.targetTransform.position;
			this.object3d.position.lerpVectors(from, to, delta);
		}

		if (this.targetTransform.rotation) {
			const {from, to} = this.targetTransform.rotation;
			this.object3d.quaternion.slerpQuaternions(from, to, delta);
		}

		await this.updatePhysics();
	}
}
