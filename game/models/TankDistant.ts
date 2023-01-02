import Tank from '@game/models/Tank';
import {type Scene3D, type THREE} from 'enable3d';

export default class TankDistant extends Tank {
	protected readonly targetTransform: {
		position?: THREE.Vector3;
		rotation?: THREE.Quaternion;
	} = {};

	constructor(scene: Scene3D, position: THREE.Vector3, uuid: string) {
		super(scene, position, uuid);
		this.setCollisionFlags(2);
		this.properties.getProperty('position').on('change', position => {
			this.targetTransform.position = position;
		});
		this.properties.getProperty('rotation').on('change', rotation => {
			this.targetTransform.rotation = rotation;
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
