import Entity from '@game/models/Entity';
import type * as Plugins from '@enable3d/three-graphics/jsm/plugins';
import {type Vector3} from 'three';
import {type GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import shortUuid from 'short-uuid';
import type Game from '@game/scenes/Game';
import {type Audio} from '@game/utils/AudioManager';
import {ExtendedObject3D, THREE} from 'enable3d';
import type Tank from '@game/models/Tank';
import {type AnimationClip} from 'three/src/Three';

export default class Explosion extends Entity {
	static async loadModel(loader: Plugins.Loaders, url: string) {
		const {scene, animations} = (await loader.gltf(url));
		Explosion.model = {
			model: scene,
			animation: animations.find(animation => animation.name === 'IcosphereAction')!.optimize(),
		};
	}

	private static model: {
		model: THREE.Group;
		animation: AnimationClip;
	};

	readonly object3d = new ExtendedObject3D();

	private readonly audio: Audio;

	constructor(game: Game, private readonly position: Vector3, private readonly scale: number = 1, private readonly onCollision?: (tank: Tank, distance: number) => void) {
		super(game, shortUuid.uuid());
		this.audio = game.audioManager.createAudio();
		this.object3d.add(Explosion.model.model.clone());
		this.object3d.scale.set(0.15 * scale, 0.15 * scale, 0.15 * scale);
		const light = new THREE.PointLight(0xffdf5e, 3, 20);
		this.object3d.add(light, this.audio);
		game.animationMixers.add(this.object3d.anims.mixer);
		this.object3d.anims.add('IcosphereAction', Explosion.model.animation);
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
		if (this.onCollision) {
			setTimeout(() => {
				this.checkCollision();
			}, Explosion.model.animation.duration / this.object3d.anims.mixer.timeScale * 500);
		}
	}

	destroy(): void {
		this.removeFromScene();
	}

	removeFromScene(): void {
		this.object3d.removeFromParent();
	}

	export(): Record<string, unknown> {
		return {};
	}

	import(state: Record<string, unknown>): void {
		// Do nothing
	}

	private checkCollision() {
		const scale = this.scale * 1.5;
		this.game.tanks.forEach(tank => {
			const distance = this.object3d.position.distanceTo(tank.object3d.position);
			console.log('Collision', tank.uuid, distance, scale);
			if (distance < scale) {
				this.onCollision?.(tank, distance);
			}
		});
	}
}
