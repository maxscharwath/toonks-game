import * as THREE from 'three';

class Audio extends THREE.PositionalAudio {
	constructor(listener: THREE.AudioListener, private readonly bufferPromise: Promise<AudioBuffer>) {
		super(listener);
	}

	play(delay?: number): this {
		void this.bufferPromise.then(buffer => {
			this.setBuffer(buffer);
			if (this.isPlaying) {
				this.stop();
			}

			super.play(delay);
		});
		return this;
	}
}

export default class AudioManager {
	private readonly listener = new THREE.AudioListener();
	private readonly loader = new THREE.AudioLoader();
	private readonly sounds = new Map<string, Promise<AudioBuffer>>();

	public setCamera(camera: THREE.Camera): void {
		camera.add(this.listener);
	}

	public createAudio(url: string): Audio {
		return new Audio(this.listener, this.getAudioBuffer(url));
	}

	private async getAudioBuffer(url: string) {
		let buffer = this.sounds.get(url);
		if (!buffer) {
			buffer = this.loader.loadAsync(url);
		}

		return buffer;
	}
}
