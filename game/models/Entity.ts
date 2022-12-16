import {type Scene3D} from 'enable3d';

export default abstract class Entity {
	protected constructor(
		protected readonly scene: Scene3D,
		public readonly uuid: string,
	) {}

	public abstract update(): void;

	public abstract destroy(): void;

	public abstract export(): Record<string, any>;

	public abstract import(data: Record<string, any>): void;
}
