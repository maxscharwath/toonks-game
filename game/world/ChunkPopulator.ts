import {type THREE} from 'enable3d';
import {type Chunk} from '@game/world/Chunk';
import Random from '@game/utils/Random';

export class ChunkPopulator {
	private readonly elements: THREE.Object3D[] = [];

	public addElement(obj: THREE.Object3D): this {
		this.elements.push(obj);
		return this;
	}

	public populate(chunk: Chunk): void {
		const random = Random.create(chunk.chunkId);
		for (let i = 0; i < random.int(50); i++) {
			const pos = chunk.getPositionAt(
				random.int(chunk.chunkSize),
				random.int(chunk.chunkSize),
			);

			const element = this.elements[random.int(this.elements.length)];
			const clone = element.clone();
			clone.scale.addScalar(Math.random() * 0.1);
			clone.rotateY(random.number(Math.PI * 2));
			clone.rotateX(random.number(0.1));
			clone.rotateZ(random.number(0.1));
			clone.position.set(pos.x, pos.y - 1.25, pos.z);
			chunk.add(clone);
		}
	}
}
