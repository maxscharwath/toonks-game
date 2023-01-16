import {type ChunkLoader} from '@game/world/ChunkLoader';
import {Chunk, mergeChunkMesh} from '@game/world/Chunk';
import {type ChunkPopulator} from '@game/world/ChunkPopulator';
import type Game from '@game/scenes/Game';
import {Vector3} from 'three';
import Random from '@game/utils/Random';

type Pending<P> = Promise<P> & {isPending: boolean; value?: P};
function pending<P>(promise: Promise<P>): Pending<P> {
	const p = Object.assign(promise, {isPending: true}) as Pending<P>;
	p
		.then(value => {
			p.value = value;
		})
		.finally(() => {
			p.isPending = false;
		});
	return p;
}

export class World {
	private readonly chunks = new Map<string, Pending<Chunk>>();

	constructor(private readonly game: Game, private readonly chunkloader: ChunkLoader, private readonly chunkPopulator: ChunkPopulator) {}

	public getNeighbours(x: number, y: number): Array<Pending<Chunk> | undefined> {
		return [
			this.chunks.get(`${x - 1}:${y}`), // Left
			this.chunks.get(`${x + 1}:${y}`), // Right
			this.chunks.get(`${x}:${y - 1}`), // Top
			this.chunks.get(`${x}:${y + 1}`), // Bottom
		];
	}

	public async getChunk(x: number, y: number) {
		const key = `${x}:${y}`;
		let chunk = this.chunks.get(key);
		if (!chunk) {
			chunk = pending(this.loadChunk(x, y));
			this.chunks.set(key, chunk);
			void chunk.then(chunk => {
				this.game.scene.add(chunk);
			});
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

	public async getPositionAt(position: Vector3): Promise<Vector3> {
		const chunk = await this.getChunkAt(position);
		const size = Chunk.chunkSize / 2;

		const x = position.x - chunk.chunkPosition.x + size;
		const y = position.z - chunk.chunkPosition.z + size;
		return chunk.getPositionAt(x, y);
	}

	public async getPosition(x: number, y: number): Promise<Vector3> {
		return this.getPositionAt(new Vector3(x, 0, y));
	}

	public async getChunkAt(position: Vector3): Promise<Chunk> {
		return this.getChunk(Math.round(position.x / Chunk.chunkSize), Math.round(position.z / Chunk.chunkSize));
	}

	public async getSpawnPosition(): Promise<Vector3> {
		const random = new Random();
		return this.getPosition(
			random.number(400, 600),
			random.number(400, 600),
		);
	}

	public async update() {
		const {position} = this.game.player.object3d;
		const x = Math.round(position.x / Chunk.chunkSize);
		const y = Math.round(position.z / Chunk.chunkSize);
		const chunks = await this.generateArea(x, y, 2);
		chunks.forEach(chunk => {
			chunk.update();
		});
		this.chunks.forEach((chunk, chunkId) => {
			if (chunk.isPending || !chunk.value) {
				return;
			}

			if (chunk.value.lastUpdate + 10000 < Date.now()) {
				chunk.value.destroy();
				this.chunks.delete(chunkId);
			}
		});
	}

	private async loadChunk(x: number, y: number): Promise<Chunk> {
		const chunk = await this.chunkloader.loadChunk(this.game, x, y);
		this.chunkPopulator.populate(chunk);
		void this.getNeighbours(x, y).map(async neighbour => {
			if (neighbour) {
				mergeChunkMesh(chunk, await neighbour);
			}
		});
		return chunk;
	}
}
