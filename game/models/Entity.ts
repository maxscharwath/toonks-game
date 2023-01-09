import {type THREE} from 'enable3d';
import type Game from '@game/scenes/Game';

export default abstract class Entity {
	abstract readonly object3d: THREE.Object3D;

	protected constructor(
		protected readonly game: Game,
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
