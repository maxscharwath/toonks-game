import {type THREE} from 'enable3d';
import type Game from '@game/scenes/Game';
import Emittery from 'emittery';

export default abstract class Entity extends Emittery<{
	update: never;
}> {
	abstract readonly object3d: THREE.Object3D;

	protected constructor(
		protected readonly game: Game,
		public readonly uuid: string,
	) {
		super();
	}

	public update(delta: number): void {
		void this.emit('update');
	}

	public abstract export(): Record<string, unknown>;

	public abstract import(state: Record<string, unknown>): void;

	public abstract addToScene(): void;

	public abstract removeFromScene(): void;

	public abstract destroy(): void;
}
