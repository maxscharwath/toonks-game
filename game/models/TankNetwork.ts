import Tank from '@game/models/Tank';
import {FLAT, type THREE} from 'enable3d';
import type Game from '@game/scenes/Game';

export default class TankNetwork extends Tank {
	protected readonly targetTransform: {
		position?: THREE.Vector3;
		rotation?: THREE.Quaternion;
	} = {};

	constructor(game: Game, position: THREE.Vector3, uuid: string) {
		super(game, position, uuid);
		this.setCollisionFlags(2);
		this.properties.getProperty('position').on('change', position => {
			this.targetTransform.position = position;
		});
		this.properties.getProperty('rotation').on('change', rotation => {
			this.targetTransform.rotation = rotation;
		});

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

		this.object3d.add(sprite3d);

		this.properties.getProperty('pseudo').on('change', name => {
			sprite3d.setText(name);
		});
	}

	public update() {
		void this.lerpTransform();
		super.update();
	}

	private async lerpTransform() {
		const targetPosition = this.targetTransform.position ?? this.object3d.position;
		const targetRotation = this.targetTransform.rotation ?? this.object3d.quaternion;
		const diffPosition = this.object3d.position.distanceTo(targetPosition);
		const diffRotation = this.object3d.quaternion.angleTo(targetRotation);
		if (diffPosition > 0.2 || diffRotation > 0.2) {
			this.object3d.position.lerp(targetPosition, diffPosition * 0.1);
			this.object3d.quaternion.slerp(targetRotation, diffRotation * 0.1);
			await this.updatePhysics();
		}
	}
}
