import {Chunk} from '@game/world/Chunk';
import Worker from '@game/world/ChunkLoaderWorker?worker';
import Emittery from 'emittery';
import type Game from '@game/scenes/game';

type ChunkLoaderOptions = {
	worldHeightMapUrl: string;
	chunkSize: number;
	scale?: number;
};

export class ChunkLoader {
	private readonly worker: Worker;
	private readonly emittery = new Emittery();
	constructor(private readonly options: ChunkLoaderOptions) {
		this.worker = new Worker();
		this.worker.addEventListener('message', e => {
			const {key, pixels} = e.data as {key: string; pixels: ImageData};
			void this.emittery.emit(key, pixels);
		});
	}

	public async loadChunk(game: Game, x: number, y: number): Promise<Chunk> {
		const key = `${x}:${y}`;
		const pixels = this.emittery.once(key);
		this.worker.postMessage({options: this.options, x, y, key});
		return new Chunk(game, x, y, await pixels);
	}
}
