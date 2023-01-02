import {type ChunkLoader} from '@game/world/ChunkLoader';
import {type Chunk, mergeChunkMesh} from '@game/world/Chunk';
import {type ChunkPopulator} from '@game/world/ChunkPopulator';
import {type Scene3D} from 'enable3d';

export class World {
	private readonly chunks = new Map<string, Chunk>();

	constructor(private readonly scene: Scene3D, private readonly chunkloader: ChunkLoader, private readonly chunkPopulator: ChunkPopulator) {}

	public getNeighbours(x: number, y: number): Array<Chunk | undefined> {
		return [
			this.chunks.get(`${x - 1}:${y}`), // Left
			this.chunks.get(`${x + 1}:${y}`), // Right
			this.chunks.get(`${x}:${y - 1}`), // Top
			this.chunks.get(`${x}:${y + 1}`), // Bottom
		];
	}

	public async getChunk(x: number, y: number): Promise<Chunk> {
		const key = `${x}:${y}`;
		let chunk = this.chunks.get(key);
		if (!chunk) {
			chunk = await this.chunkloader.loadChunk(x, y);
			chunk.setScene(this.scene);
			this.chunkPopulator.populate(chunk);
			this.getNeighbours(x, y).forEach(neighbour => {
				if (neighbour) {
					mergeChunkMesh(chunk!, neighbour);
				}
			});
			this.chunks.set(key, chunk);
		}

		return chunk;
	}

	async generateArea(x: number, y: number, radius: number): Promise<Chunk[]> {
		const chunks = [];
		for (let i = x - radius; i < x + radius; i++) {
			for (let j = y - radius; j < y + radius; j++) {
				chunks.push(this.getChunk(i, j));
			}
		}

		return Promise.all(chunks);
	}

	public async getPositionAt(x: number, y: number) {
		const chunk = await this.getChunk(Math.floor(x / 16), Math.floor(y / 16));
		return chunk.getPositionAt(x % 16, y % 16);
	}
}
