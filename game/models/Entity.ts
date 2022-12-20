import {type Scene3D, type THREE} from 'enable3d';
import Emittery from 'emittery';

export default abstract class Entity {
	abstract readonly object3d: THREE.Object3D;

	protected constructor(
		protected readonly scene: Scene3D,
		public readonly uuid: string,
	) {
	}

	public abstract export(): Record<string, unknown>;

	public abstract import(state: Record<string, unknown>): void;

	public abstract addToScene(): void;

	public abstract removeFromScene(): void;

	public abstract update(): void;

	public abstract destroy(): void;
}
