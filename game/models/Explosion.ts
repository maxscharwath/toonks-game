import Entity from '@game/models/Entity';
import type * as Plugins from '@enable3d/three-graphics/jsm/plugins';
import {type Vector3} from 'three';
import {type GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {ExtendedObject3D, THREE} from 'enable3d';
import shortUuid from 'short-uuid';
import type Game from '@game/scenes/Game';
import {type Audio} from '@game/utils/AudioManager';

export default class Explosion extends Entity {
	static async loadModel(loader: Plugins.Loaders, url: string) {
		this.model = (await loader.gltf(url));
	}

	private static model: GLTF;
	readonly object3d = new ExtendedObject3D();

	private readonly audio: Audio;

	constructor(game: Game, private readonly position: Vector3, private readonly scale: number = 1) {
		super(game, shortUuid.uuid());
		this.audio = game.audioManager.createAudio();
		this.object3d.add(Explosion.model.scene.clone());
		this.object3d.scale.set(0.15 * scale, 0.15 * scale, 0.15 * scale);
		const light = new THREE.PointLight(0xffdf5e, 5, 20);
		this.object3d.add(light, this.audio);
		game.animationMixers.add(this.object3d.anims.mixer);
		Explosion.model.animations.forEach(animation => {
			if (animation.name) {
				this.object3d.anims.add(animation.name, animation);
			}
		});
		this.object3d.anims.mixer.timeScale = 6 / scale;
		this.object3d.anims.mixer.addEventListener('finished', () => {
			this.destroy();
		});
	}

	addToScene(): void {
		this.object3d.position.copy(this.position);
		this.game.scene.add(this.object3d);
		this.audio.play('/sounds/explosion.mp3');
		this.object3d.anims.play('IcosphereAction', 0, false);
	}

	destroy(): void {
		this.removeFromScene();
	}

	removeFromScene(): void {
		this.object3d.removeFromParent();
	}

	update(): void {
		// Do nothing
	}

	export(): Record<string, unknown> {
		return {};
	}

	import(state: Record<string, unknown>): void {
		// Do nothing
	}
}
