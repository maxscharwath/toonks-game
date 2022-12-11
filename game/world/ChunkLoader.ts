import {Chunk} from '@game/world/Chunk';

type ChunkLoaderOptions = {
	worldHeightMapUrl: string;
	chunkSize: number;
	scale?: number;
};

export class ChunkLoader {
	private readonly image: Promise<HTMLImageElement>;
	private readonly context: CanvasRenderingContext2D;
	private readonly options: Required<ChunkLoaderOptions>;

	constructor(options: ChunkLoaderOptions) {
		const {chunkSize, scale} = this.options = {scale: 1, ...options};
		const context = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
		if (!context) {
			throw new Error('Could not get canvas context');
		}

		context.canvas.width = context.canvas.height = chunkSize * scale;
		this.context = context;
		this.image = new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				resolve(image);
			};

			image.onerror = reject;
			image.src = this.options.worldHeightMapUrl;
		});
	}

	public async loadChunk(x: number, y: number): Promise<Chunk> {
		const fullImage = await this.image;
		const {chunkSize, scale} = this.options;
		this.context.drawImage(
			fullImage,
			x * chunkSize,
			y * chunkSize,
			chunkSize,
			chunkSize,
			0,
			0,
			chunkSize * scale,
			chunkSize * scale,
		);

		const pixels = this.context.getImageData(0, 0, chunkSize * scale, chunkSize * scale);
		return new Chunk(x, y, pixels);
	}
}
