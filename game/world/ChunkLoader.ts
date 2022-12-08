import {Chunk} from '@game/world/Chunk';

type ChunkLoaderOptions = {
	worldHeightMapUrl: string;
	chunkSize: number;
};

export class ChunkLoader {
	private readonly image: Promise<HTMLImageElement>;
	constructor(private readonly options: ChunkLoaderOptions) {
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
		const {chunkSize} = this.options;
		const context = document.createElement('canvas').getContext('2d');
		if (!context) {
			throw new Error('Could not get canvas context');
		}

		context.canvas.width = chunkSize;
		context.canvas.height = chunkSize;

		context.drawImage(
			fullImage,
			-x * chunkSize,
			-y * chunkSize,
		);

		const pixels = context.getImageData(0, 0, chunkSize, chunkSize);
		return new Chunk(x, y, pixels);
	}
}
