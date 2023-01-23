import * as THREE from 'three';

export class Audio extends THREE.PositionalAudio {
	constructor(private readonly manager: AudioManager) {
		super(manager.listener);
	}

	async setBufferAsync(src: string) {
		this.setBuffer(await this.manager.getAudioBuffer(src));
	}

	async playAsync(src?: string, delay?: number) {
		try {
			if (src) {
				await this.setBufferAsync(src);
			}

			if (this.isPlaying) {
				this.stop();
			}

			super.play(delay);
		} catch (e) {
			console.log(e);
		}
	}

	stop() {
		return this.source ? super.stop() : this;
	}

	pause(): this {
		return this.source ? super.pause() : this;
	}

	play(delay?: number): this;
	play(src?: string, delay?: number): this;
	play(src?: string | number, delay?: number): this {
		delay = typeof src === 'number' ? src : delay;
		src = typeof src === 'string' ? src : undefined;
		void this.playAsync(src, delay);
		return this;
	}
}

export default class AudioManager {
	readonly listener = new THREE.AudioListener();
	private readonly loader = new THREE.AudioLoader();
	private readonly sounds = new Map<string, Promise<AudioBuffer>>();

	public setCamera(camera: THREE.Camera): void {
		camera.add(this.listener);
	}

	public createAudio(src?: string): Audio {
		const audio = new Audio(this);
		if (src) {
			void audio.setBufferAsync(src);
		}

		return audio;
	}

	public async getAudioBuffer(url: string) {
		let buffer = this.sounds.get(url);
		if (!buffer) {
			buffer = this.loader.loadAsync(url);
		}

		return buffer;
	}
}
