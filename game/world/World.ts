import {type ChunkLoader} from '@game/world/ChunkLoader';
import {type Chunk} from '@game/world/Chunk';
import {THREE} from 'enable3d';

export class World {
	private readonly chunks = new Map<string, Chunk>();
	constructor(private readonly chunkloader: ChunkLoader) {
	}

	public async getChunk(x: number, y: number): Promise<Chunk> {
		const key = `${x}:${y}`;
		return this.chunks.get(key) ?? (async () => {
			const chunk = await this.chunkloader.loadChunk(x, y);
			this.chunks.set(key, chunk);
			return chunk;
		})();
	}
}
