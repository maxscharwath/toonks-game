type ChunkLoaderOptions = {
	worldHeightMapUrl: string;
	chunkSize: number;
	scale?: number;
};

class ChunkLoaderWorker {
	private readonly image: Promise<ImageBitmap>;
	private readonly canvas: OffscreenCanvas;
	private readonly context: OffscreenCanvasRenderingContext2D;
	private readonly options: Required<ChunkLoaderOptions>;

	constructor(options: ChunkLoaderOptions) {
		const {chunkSize, scale} = this.options = {scale: 1, ...options};
		this.canvas = new OffscreenCanvas(chunkSize * scale, chunkSize * scale);
		const context = this.canvas.getContext('2d', {willReadFrequently: true});
		if (!context) {
			throw new Error('Could not get canvas context');
		}

		this.context = context;

		this.image = new Promise<ImageBitmap>((resolve, reject) => {
			fetch(options.worldHeightMapUrl)
				.then(async response => response.blob())
				.then(async blob => createImageBitmap(blob))
				.then(resolve)
				.catch(reject);
		});
	}

	public async loadChunk(x: number, y: number) {
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

		return this.context.getImageData(0, 0, chunkSize * scale, chunkSize * scale);
	}
}

const loaders = new Map<string, ChunkLoaderWorker>();

self.onmessage = async e => {
	const {options, x, y, key} = e.data as {options: ChunkLoaderOptions; x: number; y: number; key: string};
	const loaderKey = JSON.stringify(options);
	let loader = loaders.get(loaderKey);
	if (!loader) {
		loader = new ChunkLoaderWorker(options);
		loaders.set(loaderKey, loader);
	}

	const pixels = await loader.loadChunk(x, y);
	self.postMessage({
		key,
		pixels,
	});
};

export {};
