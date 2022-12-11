import {type THREE} from 'enable3d';
import {type Chunk} from '@game/world/Chunk';

export class ChunkPopulator {
	private readonly elements: THREE.Object3D[] = [];

	public addElement(obj: THREE.Object3D): this {
		this.elements.push(obj);
		return this;
	}

	public populate(chunk: Chunk): void {
		for (let i = 0; i < Math.random() * 10; i++) {
			const pos = chunk.getPosAt(
				Math.random() * chunk.chunkSize,
				Math.random() * chunk.chunkSize,
			);

			const element = this.elements[Math.floor(Math.random() * this.elements.length)];
			const clone = element.clone();
			clone.scale.addScalar(Math.random() * 0.1);
			clone.rotateY(Math.random() * Math.PI * 2);
			clone.rotateX(Math.random() * 0.1);
			clone.rotateZ(Math.random() * 0.1);
			clone.position.set(pos.x, pos.y, pos.z);
			chunk.add(clone);
		}
	}
}
