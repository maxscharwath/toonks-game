import {type THREE} from 'enable3d';
import Random from '@game/utils/Random';
import {Chunk} from '@game/world/Chunk';

export class ChunkPopulator {
	private readonly elements: THREE.Object3D[] = [];

	public addElement(obj: THREE.Object3D): this {
		this.elements.push(obj);
		return this;
	}

	public populate(chunk: Chunk): void {
		const random = Random.create(chunk.chunkId);
		for (let i = 0; i < random.int(100); i++) {
			const pos = chunk.getPositionAt(
				random.int(Chunk.chunkSize),
				random.int(Chunk.chunkSize),
			);

			if (pos.y < Chunk.waterLevel) {
				continue;
			}

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
