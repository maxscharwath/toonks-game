import {type Scene3D, type THREE} from 'enable3d';
import Emittery from 'emittery';

export default abstract class Entity<State extends Record<string, unknown>> {
	abstract readonly object3d: THREE.Object3D;
	protected onStates = new Emittery<State>();
	protected states: State;

	protected constructor(
		protected readonly scene: Scene3D,
		public readonly uuid: string,
		initialState: State,
	) {
		this.states = new Proxy(initialState, {
			set: (target, key, value) => {
				if (target[key as keyof State] !== value) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					target[key as keyof State] = value;
					void this.onStates.emit(key as keyof State, value);
				}

				return true;
			},
		});
	}

	public export(): State & {uuid: string} {
		return {
			...this.states,
			uuid: this.uuid,
		};
	}

	public import(state: Partial<State>) {
		Object.assign(this.states, state);
	}

	public abstract addToScene(): void;

	public abstract removeFromScene(): void;

	public abstract update(): void;

	public abstract destroy(): void;
}
